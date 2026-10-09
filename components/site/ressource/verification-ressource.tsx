/**
 * Contrôle du gabarit RESSOURCE contre sa capture, sans navigateur.
 *
 *   bun components/site/ressource/verification-ressource.tsx
 *   bun components/site/ressource/verification-ressource.tsx --donnees <dossier> [url…]
 *
 * LA RÉFÉRENCE est la capture de chaque page, `maquette/rendu/<clé>.html`,
 * relue à chaque exécution. L'ancien contrôle (`scripts/verifie-ressource.tsx`)
 * comparait à l'écran « isRes » de `accueil-rendu.html`, qui n'est le gabarit
 * d'aucune page.
 *
 * POUR CHACUNE DES 35 PAGES (la liste se déduit de l'index de la maquette) :
 *
 * 1. LE TEXTE, MOT POUR MOT, SECTION PAR SECTION : le texte lisible de chaque
 *    `<section>` du rendu doit égaler celui de la section de même rang de la
 *    capture, sur texte normalisé (insécable, apostrophe). Seules exceptions,
 *    les `retraits` que le fichier déclare : chacun doit porter un terme
 *    interdit par le contrat, sinon il est refusé.
 * 2. LE DESSIN : les déclarations porteuses de chaque section sont exigées
 *    dans la capture ET dans le rendu.
 * 3. CE QUE LA CAPTURE NE LAISSE PAS LIRE (photos en `blob:`, minutes, trois
 *    lectures liées) est recalculé par les règles de la maquette.
 * 4. Un seul H1, aucun `href="#"`, aucun terme interdit dans le rendu.
 *
 * Les erreurs sont listées page par page, et le contrôle sort en échec s'il
 * en reste une : c'est la liste de ce que les fichiers de données doivent
 * encore corriger.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { PHOTOS_MIGEN } from "@/lib/photos-autorisees";
import type { LectureRessource } from "@/types/ressource";

import { renderToStaticMarkup } from "react-dom/server";

import { enTexteNu } from "@/components/site/blocs/TexteRiche";
import { appliqueDecisions } from "@/lib/decisions-copie";

import PageRessource from "./PageRessource";
import {
  fichierDe,
  imageMaquette,
  INTERDITS,
  lecturesMaquette,
  litIndex,
  minutesMaquette,
  urlsRessource,
  type FichierRessource,
} from "./maquette-ressource";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const args = process.argv.slice(2);
/* LE VIVIER DU RÉPARTITEUR, ET RIEN D'AUTRE. Une image acceptable vient de la
   maquette, du registre sous licence, ou des dix photos de l'équipe Migen :
   c'est exactement ce dans quoi `scripts/repartit-photos.ts` puise, et donc
   tout ce qu'une page peut légitimement servir. N'accepter que le registre
   laissait tomber les pages dont une lecture porte une photo de l'équipe,
   `/assets/web/team-grind-front.jpg` par exemple. Une photo hors de ce vivier
   veut dire que quelqu'un a deviné, et elle reste refusée. */
const VIVIER_AUTORISE = new Set<string>([
  ...(JSON.parse(readFileSync("public/assets/photos/registre.json", "utf8")) as { fichier: string }[]).map(
    (p) => `/assets/photos/${p.fichier}`,
  ),
  ...PHOTOS_MIGEN,
]);

const DOSSIER = args.includes("--donnees")
  ? args[args.indexOf("--donnees") + 1]
  : join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------------------------ normalisation */

function decode(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Texte lisible : balises en espaces, insécable et apostrophes unifiées, et
 * depuis le 09/10 le Markdown en ligne réduit à ses mots.
 *
 * POURQUOI `enTexteNu` ICI. Cette fonction sert LES DEUX CÔTÉS, la capture et
 * le rendu, et c'est tout l'intérêt : la capture montre encore
 * « Le [dépannage industriel](/offres/depannage-industriel/) », le rendu rend le
 * lien, et les deux disent les mêmes MOTS. Comparer les mots au lieu de la
 * syntaxe est ce qui permet à la porte de rester exacte après la correction du
 * 09/10 sans rien laisser passer : un mot absent échoue comme avant, et le
 * Markdown lui-même est refusé par un contrôle à part, dans `controle`.
 */
function normaliseTexte(texte: string): string {
  return enTexteNu(nettoie(texte)).trim();
}

/** Les espaces et les apostrophes seulement : le balisage reste LISIBLE. */
function nettoie(texte: string): string {
  return texte.replace(/ /g, " ").replace(/[’‘]/g, "'").replace(/\s+/g, " ");
}

const sansBalises = (html: string) => decode(html.replace(/<[^>]+>/g, " "));
const texteDe = (html: string) => normaliseTexte(sansBalises(html));

/**
 * Le texte visible AVEC son balisage, pour le seul contrôle qui doit le voir :
 * la chasse au Markdown rendu. `texteDe` le gomme par construction, le lui
 * passer ferait un contrôle qui ne peut plus échouer.
 *
 * Les balises deviennent des SAUTS DE LIGNE et non des espaces : le dièse de
 * titre ne se reconnaît qu'en tête de ligne, et tout aplatir sur une seule
 * ligne rendrait ce motif-là inatteignable, donc muet.
 */
const texteBalisageCompris = (html: string) =>
  decode(html.replace(/<[^>]+>/g, "\n"))
    .replace(/ /g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();

/** Même valeur, deux écritures (`0px` / `0`, `0.9fr` / `.9fr`, espaces). */
function normaliseStyle(texte: string): string {
  return decode(texte)
    .replace(/\s*([:;,()])\s*/g, "$1")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

const sectionsDe = (html: string) => html.match(/<section\b[\s\S]*?<\/section>/g) ?? [];

/* ------------------------------------------------- le dessin, par section */

const DESSIN: [section: number, fragment: string, si?: RegExp][] = [
  [0, "max-width: 1200px; margin: 0px auto; padding: 40px 40px 0px"],
  [0, "grid-template-columns: minmax(0px, 1.1fr) minmax(0px, 0.9fr); gap: 52px"],
  [0, "font: 600 clamp(36px,4.4vw,60px)/1.04 var(--ft)"],
  [0, "font: 400 18px/1.62 var(--fb)"],
  [0, "font: 500 13.5px var(--fb)"],
  [0, "border-radius: 32px; overflow: hidden; height: 380px", /border-radius: ?32px/],
  [0, "30px 70px -34px", /id="mr-dl"/],
  [1, "padding: 64px 40px 0px"],
  [1, "grid-template-columns: 230px minmax(0px, 1fr); gap: 56px"],
  [1, "position: sticky; top: 110px"],
  [1, "font: 600 clamp(24px,2.4vw,32px)/1.15 var(--ft)"],
  [1, "font: 400 16.5px/1.75 var(--fb)"],
  [1, "margin: 6px 0px 22px; padding: 20px 22px", /✓/],
  [1, "font: 600 13px/38px var(--fb)", /13px\/38px/],
  [1, "padding: 13px 18px; vertical-align: top", /<table/],
  [1, "border: 1px solid rgba(255, 124, 60, 0.28)", /0\.28\)/],
  [1, "margin: 34px 0px 10px", /margin: 34px/],
  [2, "padding: 96px 40px 0px"],
  [2, "font: 600 clamp(26px,2.8vw,38px)/1.1 var(--ft)"],
  [2, "font: 600 16px/1.4 var(--ft)"],
  [2, "font: 400 15px/1.7 var(--fb)"],
  [3, "grid-template-columns: repeat(auto-fill, minmax(270px, 1fr))"],
  [3, "font: 600 16.5px/1.3 var(--ft)"],
  [4, "padding: 96px 24px 120px"],
  [4, "border-radius: 40px; background: var(--panel); padding: 56px"],
  [4, "font: 600 clamp(26px,3vw,40px)/1.1 var(--ft)"],
];

/* ------------------------------------------------------------- une page */

/** Le premier écart entre deux textes, avec ce qui l'entoure. */
function ecart(attendu: string, rendu: string): string {
  let i = 0;
  while (i < attendu.length && attendu[i] === rendu[i]) i += 1;
  return `\n      capture : « …${attendu.slice(Math.max(0, i - 50), i + 60)}… »\n      rendu   : « …${rendu.slice(Math.max(0, i - 50), i + 60)}… »`;
}

const index = litIndex();

function controle(url: string): string[] {
  const erreurs: string[] = [];
  const verifie = (condition: unknown, message: string) => {
    if (!condition) erreurs.push(message);
  };

  const chemin = join(DOSSIER, fichierDe(url));
  if (!existsSync(chemin)) return [`fichier absent : ${chemin}`];
  const fichier = JSON.parse(readFileSync(chemin, "utf8")) as FichierRessource;
  const { contenu } = fichier;
  const entree = index.find((x) => x.url === url);

  // La donnée : forme, titre, et ce que la maquette calcule.
  verifie(contenu?.gabarit === "ressource", `contenu.gabarit doit valoir « ressource »`);
  verifie(fichier.titre_h1 === entree?.h1, `titre_h1 « ${fichier.titre_h1} » attendu « ${entree?.h1} »`);
  verifie(contenu?.rayon === url.split("/")[2], `rayon « ${contenu?.rayon} » attendu « ${url.split("/")[2]} »`);
  verifie(contenu?.minutes === minutesMaquette(entree?.mots), `minutes attendues ${minutesMaquette(entree?.mots)}`);
  /* LA PHOTO : CELLE DE LA MAQUETTE, OU UNE PHOTO DU REGISTRE SOUS LICENCE.
     Correction du 09/10 au soir, la même que celle déjà posée sur les gabarits
     preuve, spécialité, domaine, ville, secteur et implantations. La
     répartition du 09/10 a remplacé les photos de calage de la maquette, qui
     ne comptait que 68 images distinctes pour 1 822 emplacements, par des
     photos du registre sous licence. Exiger l'image de la maquette à
     l'identique revenait à exiger le défaut que cette répartition répare, et
     cette porte rendait 0/35.
     CE QUI RESTE REFUSÉ, et c'est tout l'objet : une photo DEVINÉE, ni dans la
     maquette ni au registre. La preuve d'échec de ce contrôle le vérifie. */
  const photo = contenu?.rayon === "livres-blancs" ? undefined : imageMaquette(url, 3);
  const image = contenu?.image;
  const duVivier = typeof image === "string" && VIVIER_AUTORISE.has(image);
  verifie(image === photo || duVivier, `image « ${image} » attendue « ${photo} » ou une photo du vivier`);
  /* `aLire` PORTE AUSSI DES IMAGES, et c'est ce qui faisait tomber les 35
     pages : la comparaison était stricte, or la répartition du 09/10 a changé
     l'image de chaque lecture pour une photo du registre. Le choix des trois
     lectures, leur ordre, leur titre et leurs minutes restent comparés à
     l'identique, parce que c'est là qu'une erreur se verrait ; l'image suit la
     même règle que celle du haut de page, la maquette OU le registre. */
  const imageAcceptable = (reelle: unknown, attendue: unknown) =>
    reelle === attendue || (typeof reelle === "string" && VIVIER_AUTORISE.has(reelle));
  const attenduALire: readonly LectureRessource[] = lecturesMaquette(url, index);
  const reelALire: readonly LectureRessource[] | undefined = contenu?.aLire;
  try {
    assert.equal(reelALire?.length, attenduALire.length);
    for (const [i, attendue] of attenduALire.entries()) {
      const reelle: LectureRessource | undefined = reelALire?.[i];
      assert.equal(reelle?.href, attendue.href);
      assert.equal(reelle?.titre, attendue.titre);
      assert.equal(reelle?.minutes, attendue.minutes);
      assert.ok(imageAcceptable(reelle?.image, attendue.image));
    }
  } catch {
    erreurs.push(`aLire : les trois lectures de la maquette sont attendues (rayon d'abord, ordre de l'index), image de la maquette ou du registre`);
  }
  for (const retrait of fichier.retraits ?? []) {
    verifie(INTERDITS.some((re) => re.test(retrait)), `retrait sans terme interdit : « ${retrait} »`);
  }
  if (erreurs.length > 0 || !contenu) return erreurs;

  // Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte.
  const capture = appliqueDecisions(
    readFileSync(
      join(RACINE, "maquette", "rendu", `${url.replace(/^\/|\/$/g, "").replace(/\//g, "--")}.html`),
      "utf8",
    ),
  );
  const rendu = renderToStaticMarkup(<PageRessource titre={fichier.titre_h1} contenu={contenu} />);

  // Le texte, section par section.
  const sCapture = sectionsDe(capture);
  const sRendu = sectionsDe(rendu);
  verifie(sCapture.length === sRendu.length, `${sRendu.length} sections rendues, la capture en a ${sCapture.length}`);
  const retraits = (fichier.retraits ?? []).map(normaliseTexte);
  sCapture.forEach((section, i) => {
    let attendu = texteDe(section);
    for (const r of retraits) attendu = normaliseTexte(attendu.split(r).join(" "));
    const obtenu = texteDe(sRendu[i] ?? "");
    verifie(attendu === obtenu, `section ${i} : texte différent${ecart(attendu, obtenu)}`);
  });

  /* PORTE RETOURNÉE LE 09/10, et voici pourquoi.
     Jusqu'ici elle comparait la SYNTAXE Markdown, parce que la capture
     l'affiche : son rendu figé écrit « ✓ Le [dépannage
     industriel](/offres/depannage-industriel/) pour l'imprévu ». Le gras de son
     `segs()` ne redescend pas dans son contenu, exactement comme le nôtre le
     faisait. L'audit de Nathan Jorez du 09/10 refuse ce Markdown à l'écran : la
     règle « la capture fait foi jusqu'aux crochets » est devenue fausse, et
     cinq pages la faisaient échouer alors que le défaut était corrigé.

     LA PORTE N'EST PAS ASSOUPLIE, ELLE EST DÉPLACÉE. `texteDe` compare
     désormais les MOTS (voir `normaliseTexte`, qui passe les deux côtés par
     `enTexteNu`) : un mot absent ou changé échoue toujours. Et ce qui était
     comparé est maintenant INTERDIT dans le rendu, ci-dessous : si le site
     réaffiche un crochet, elle échoue, ce que l'ancienne version ne faisait
     pas. Elle est donc plus stricte sur le défaut réel, pas moins. */
  const brut = texteBalisageCompris(rendu).match(
    /\*\*[^*\n]{1,200}\*\*|\[[^\]\n]{1,200}\]\([^)\n]{0,300}\)|(?:^|\n)#{1,6}\s+\S/,
  );
  verifie(
    !brut,
    `Markdown visible dans le rendu : « ${brut?.[0]} » (audit du 09/10 : aucune page ne doit en montrer)`,
  );

  // Le dessin.
  for (const [i, fragment, si] of DESSIN) {
    if (si && !si.test(sCapture[i] ?? "")) continue;
    const attendu = normaliseStyle(fragment);
    verifie(normaliseStyle(sCapture[i] ?? "").includes(attendu), `capture, section ${i} : dessin « ${fragment} » absent, valeur à revérifier`);
    verifie(normaliseStyle(sRendu[i] ?? "").includes(attendu), `section ${i} : dessin de la capture absent du rendu, « ${fragment} »`);
  }

  // Le contrat.
  verifie((rendu.match(/<h1[\s>]/g) ?? []).length === 1, "exactement un h1 attendu");
  verifie(!/href="#"/.test(rendu), 'un href="#" est rendu');
  const visible = texteDe(rendu);
  for (const re of INTERDITS) {
    const m = visible.match(re);
    verifie(!m, `terme interdit rendu : « ${m?.[0]} » (à retirer de la donnée et déclarer en « retraits »)`);
  }
  return erreurs;
}

/* ------------------------------------------------------------ exécution */

const choisies = args.filter((a) => a.startsWith("/ressources/"));
const urls = choisies.length > 0 ? choisies : urlsRessource(index);
assert.ok(urls.length > 0, "l'index de la maquette ne déclare aucune page 01 sous /ressources/");
if (choisies.length === 0) assert.equal(urls.length, 35, "35 pages attendues au gabarit 01 sous /ressources/");

let echecs = 0;
for (const url of urls) {
  const erreurs = controle(url);
  if (erreurs.length === 0) {
    console.log(`  ok  ${url}`);
  } else {
    echecs += 1;
    console.log(`  KO  ${url}\n    · ${erreurs.slice(0, 6).join("\n    · ")}`);
  }
}
console.log(`\ngabarit ressource : ${urls.length - echecs}/${urls.length} pages conformes à leur capture (données : ${DOSSIER}).`);
if (echecs > 0) process.exit(1);
