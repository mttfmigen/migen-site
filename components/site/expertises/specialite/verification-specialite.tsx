/**
 * Contrôle du gabarit « 05 Spécialité », sans navigateur.
 *
 *   bun components/site/expertises/specialite/verification-specialite.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/<url, barres en -->.html`, une capture par page. Les 19
 * pages du gabarit sont lues dans l'index du client
 * (`maquette/contenu/site/index.json`, « 05 Spécialité »).
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *
 * 1. TOUS LES RELAIS DU GABARIT, pas seulement les pilotes : chaque fichier de
 *    `supabase/import/gabarits-maquette/` qui se déclare « specialite » est
 *    rendu depuis sa vraie donnée et comparé à SA capture. Les pages de
 *    l'index encore sans relais de cette forme sont listées, pas tues.
 * 2. LES VALEURS DE LA CAPTURE SONT RELUES À CHAQUE EXÉCUTION : chaque dessin
 *    et chaque copie sont d'abord vérifiés PRÉSENTS dans la capture, puis dans
 *    le rendu.
 * 3. LES ÉCRANS OPTIONNELS SUIVENT LA CAPTURE, dans les deux sens : rendus si
 *    elle les a, absents sinon (« 02 Domaines », « Marques maintenues », le
 *    nombre de « Complément N »), et le dessin du problème est le sien.
 * 4. CHAQUE CHAÎNE DU RELAIS EXISTE DANS SA CAPTURE, sur texte normalisé.
 * 5. UN SEUL H1, aucun `href="#"`, aucune classe Tailwind de couleur, aucune
 *    variante `dark:`.
 * 6. LES INTERDITS DU CONTRAT sont absents du rendu. Une violation portée par
 *    une donnée hors de ce périmètre est DÉCLARÉE dans `VIOLATIONS_CONNUES` :
 *    le contrôle échoue si une autre apparaît, ou si celle-là disparaît sans
 *    que la ligne parte.
 * 7. LES DEUX ÉCRANS AJOUTÉS LE 08/10 (« 02 Domaines », « Complément 2 ») sont
 *    rendus depuis la matière de CHAQUE capture qui les porte (9 pages, aucune
 *    donnée écrite à la main) et comparés à elle déclaration de style par
 *    déclaration de style, nœud de texte par nœud de texte, à leur place.
 * 8. UNE SECTION SANS DONNÉE NE SE REND PAS.
 * 9. LE CONTRÔLE SAIT ÉCHOUER : chaque comparaison est rejouée sur un rendu
 *    faussé, et doit lever.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import ProblemeDomaine from "@/components/site/expertises/domaine/ProblemeDomaine";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import { appliqueDecisions } from "@/lib/decisions-copie";
import { REGISTRE, cheminRegistre, deLaRepartition } from "@/lib/photos-autorisees";
import type { SectionProbleme } from "@/types/contenu";
import type { BlocComplementDomaine } from "@/types/domaine";
import { estSpecialite, type ContenuSpecialite } from "@/types/specialite";

import ComplementSpecialite from "./ComplementSpecialite";
import DomainesSpecialite from "./DomainesSpecialite";
import PageSpecialite from "./PageSpecialite";
import {
  complementDeCapture,
  domainesDeCapture,
  ecran,
  ecransDe,
  enClair,
  h2De,
  inclus,
  noeudsDe,
  normaliseTexte,
  problemeDeCapture,
  stylesDe,
  texteDe,
  type Declarations,
} from "./releve-capture";

const RACINE = fileURLToPath(new URL("../../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------- les pages du gabarit, par l'index */

const URLS_GABARIT: readonly string[] = (
  JSON.parse(
    readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
  ) as { url: string; gabarit?: string }[]
)
  .filter((p) => p.gabarit === "05 Spécialité")
  .map((p) => p.url);
assert.equal(URLS_GABARIT.length, 19, "l'index du client compte 19 pages « 05 Spécialité »");

/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
function litCapture(url: string): string {
  const nom = url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
  return appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", `${nom}.html`), "utf8"));
}

/** Un style ramené à une écriture comparable des deux côtés (la capture
 * sérialise `0px` et `0.88fr`, React rend `0` et `.88fr`). */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/* --------------------------------------------- les relais, TOUS ceux du gabarit */

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuSpecialite;
}

const RELAIS = readdirSync(DOSSIER)
  .filter((nom) => nom.endsWith(".json"))
  .map((nom) => ({
    nom,
    page: JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais,
  }))
  .filter(({ page }) => (page.contenu as { gabarit?: unknown })?.gabarit === "specialite");

/* ------------------------------------------- les interdits et leurs exceptions */

/* Les interdits du contrat (CLAUDE.md §3 et §9, règles client du README de
   passation), cherchés dans le texte visible, sur texte normalisé. Même liste
   que le gabarit 09, plus « cinq agences ». */
const INTERDITS = [
  "—", "prix ", "tarif", "taux horaire", "régie", "intérim", "mise à disposition",
  "sans engagement", "clé en main", "sur mesure", "levier", "concrètement",
  "notamment", "incontournable", "découvrez", "limonest", "réguliers", "24h",
  "24 h", "24/24", "24/7", "7j/7", "7 j/7", "cinq agences",
] as const;

/** Violations portées par une donnée HORS de ce périmètre, déclarées plutôt
 * que masquées. À retirer d'ici le jour où la donnée est corrigée : le
 * contrôle l'exige. */
const VIOLATIONS_CONNUES: Readonly<Record<string, readonly string[]>> = {};

function interditsDe(rendu: string): string[] {
  const visible = texteDe(rendu).toLowerCase();
  return INTERDITS.filter((mot) => visible.includes(mot));
}

function verifieInterdits(rendu: string, nom: string): void {
  const trouves = interditsDe(rendu);
  const connus = VIOLATIONS_CONNUES[nom] ?? [];
  for (const mot of trouves) {
    assert.ok(connus.includes(mot), `${nom} : mot proscrit par le contrat au rendu, « ${mot} »`);
  }
  for (const mot of connus) {
    assert.ok(
      trouves.includes(mot),
      `${nom} : la violation connue « ${mot} » a disparu, retirez-la de VIOLATIONS_CONNUES`,
    );
  }
}

const porteInterdit = (texte: string) =>
  INTERDITS.some((mot) => normaliseTexte(texte).toLowerCase().includes(mot));

/** Une phrase interdite ne se reformule pas : elle ne se rend pas. */
function sansInterdit(texte: string): string {
  return texte
    .split(/(?<=[.!?:])\s+/)
    .filter((phrase) => !porteInterdit(phrase))
    .join(" ");
}

/**
 * La chaîne du relais est-elle copiée de la capture ? Telle quelle, ou privée
 * de phrases interdites (qui ne se reformulent pas : elles se retirent). Ce
 * qui reste se lit alors dans la capture phrase après phrase, et chaque écart
 * entre deux phrases n'est fait QUE de phrases interdites. Ajouté le 08/10 :
 * la réponse curative « Combien coûte… » perd sa phrase du milieu.
 */
function copieDe(chaine: string, captureTexte: string): boolean {
  const phrases = normaliseTexte(chaine).split(/(?<=[.!?])\s+/);
  const ecartPermis = (ecart: string) => !ecart || ecart.split(/(?<=[.!?])\s+/).every(porteInterdit);
  for (let debut = captureTexte.indexOf(phrases[0]); debut >= 0; debut = captureTexte.indexOf(phrases[0], debut + 1)) {
    let fin = debut + phrases[0].length;
    const suite = phrases.slice(1).every((phrase) => {
      const ou = captureTexte.indexOf(phrase, fin);
      if (ou < 0 || !ecartPermis(captureTexte.slice(fin, ou).trim())) return false;
      fin = ou + phrase.length;
      return true;
    });
    if (suite) return true;
  }
  return false;
}

/* ------------------------------------------ comparer un écran à sa capture */

interface Ecarts {
  /** Déclarations de la capture que le rendu ne porte pas, sciemment. */
  style?: (d: Declarations) => boolean;
  /** Nœuds de texte de la capture que le rendu ne porte pas, sciemment. */
  texte?: (t: string) => boolean;
}

/**
 * Chaque attribut `style` de l'écran de la capture est porté par un élément du
 * rendu ; chaque nœud de texte de la capture est au rendu ; et le texte du
 * rendu se lit dans la capture, DANS LE MÊME ORDRE (rien d'ajouté, rien de
 * déplacé).
 */
function verifieEcran(nom: string, capture: string, rendu: string, ecarts: Ecarts = {}): void {
  const rendus = stylesDe(rendu);
  const manquants = stylesDe(capture)
    .filter((d) => d.size > 0 && !ecarts.style?.(d))
    .filter((d) => !rendus.some((r) => inclus(d, r)));
  assert.equal(
    manquants.length,
    0,
    `${nom} : styles de la capture absents du rendu :\n  ${[...new Set(manquants.map(enClair))].join("\n  ")}`,
  );

  const texteRendu = texteDe(rendu);
  const perdus = noeudsDe(capture).filter((t) => !ecarts.texte?.(t) && !texteRendu.includes(t));
  assert.equal(perdus.length, 0, `${nom} : textes de la capture absents du rendu : ${perdus.join(" | ")}`);

  const texteCapture = texteDe(capture);
  let curseur = 0;
  for (const noeud of noeudsDe(rendu)) {
    const ou = texteCapture.indexOf(noeud, curseur);
    assert.ok(ou >= 0, `${nom} : texte rendu absent de la capture ou déplacé : « ${noeud.slice(0, 80)} »`);
    curseur = ou + noeud.length;
  }
}

/* ------------------------------------------------- les valeurs du gabarit */

/* Les dessins COMMUNS aux 19 captures, une valeur porteuse par section. */
const DESSINS = [
  // 01 Héros : la section, la grille à deux colonnes, le H1 à 66px.
  "max-width: 1200px; margin: 0px auto; padding: 40px 40px 0px",
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  // 01 Chiffres : la carte en verre et la valeur à 28px.
  "padding: 44px 40px 0px",
  "font: 600 calc(28px * var(--ts))/1 var(--ft)",
  // 02 Logos.
  "padding: 64px 0px 0px",
  // Réassurance : la grille .9fr/1.1fr.
  "grid-template-columns: 0.9fr 1.1fr",
  // 04 Offre : le rail numéro + texte.
  "grid-template-columns: 26px minmax(0px, 1fr)",
  // Appel · offre : la bande sombre.
  "padding: 22px 24px 22px 30px",
  "border-radius: 28px",
  // 05 Déroulé : trois colonnes d'étapes.
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  // 06 Garanties : le panneau sombre à deux colonnes.
  "padding: var(--sec) 24px 0",
  "grid-template-columns: repeat(2, minmax(0px, 1fr))",
  // Secteurs de l'expertise : l'en-tête .8fr/1.2fr et les cartes de 200px.
  "grid-template-columns: 0.8fr 1.2fr",
  "min-height: 200px",
  // Offres du secteur : le bento, sa grande carte et ses petites.
  "min-height: 470px",
  "min-height: 236px",
  // 08 Références : le rail de cartes de 280 à 320px, photo de 150px.
  "grid-auto-columns: minmax(280px, 320px)",
  "height: 150px",
  // 09 Questions : la grille .8fr/1.2fr de la carte à photo.
  "minmax(0px, 0.8fr) minmax(0px, 1.2fr)",
  // 10 Appel final : la section qui ferme la page, et son ancre.
  "padding: var(--sec) 24px var(--sec)",
] as const;

/* Les copies fixes COMMUNES aux 19 captures, mot pour mot. Le libellé du
   bouton et le nombre de points varient par page : ils viennent du relais. */
const COPIES = [
  "Expertises",
  "Rappel dans l'heure",
  "Ils nous font confiance",
  "Certifications",
  "Qui intervient chez vous",
  "4 agences : Lyon (siège), Montréal, Dubaï, Madrid.",
  "Votre problématique",
  "L'offre",
  "Ce que nous faisons, et ce que ça change pour vous",
  "Notre méthode",
  "Un appel. Un plan. Une ligne qui repart.",
  "6 étapes",
  "Démarrer par l'audit",
  "Notre parti pris",
  "Ce que nous garantissons",
  "Par secteur d'activité",
  "Même expertise, contraintes différentes",
  "Un roulement se change de la même façon partout.",
  "Agroalimentaire",
  "Aéronautique",
  "Nos offres",
  "Six façons de travailler ensemble, selon votre besoin",
  "Une présence continue, un contrat global, un abonnement hors production, un arrêt à préparer, une étude ou un chantier.",
  "Décrire mon besoin",
  "migen© Résidence",
  "migen© Travaux industriels",
  "Voir l'offre",
  "Nos réalisations",
  "Nos références",
  "Toutes nos études de cas",
  "Lire l'étude de cas",
  "Questions fréquentes",
  "Vos questions avant de nous appeler",
  "Poser ma question",
  "Rappel dans l'heure aux horaires ouvrés.",
] as const;

/* Les écrans que certaines captures ont et d'autres non. */
const OPTIONNELS = [
  {
    label: "02 Domaines",
    dessins: ["grid-auto-rows: minmax(230px, auto)"],
    copies: ["Nos domaines"],
  },
  {
    label: "Marques maintenues",
    dessins: ["repeat(auto-fill, minmax(150px, 1fr))"],
    copies: [
      "Marques et constructeurs",
      "Les équipements que nous maintenons déjà",
      "Vos machines sont dans la liste ? Le technicien qui les connaît fait déjà partie de nos équipes.",
    ],
  },
] as const;

/** La carte de « Complément N », la même aux deux emplacements. */
const CARTE_COMPLEMENT = normaliseStyle("padding: 30px 34px 14px");

/* Les trois dessins du problème (`pbSplit`, `pbCards`, `pbDark`). */
type Variante = "colonne" | "rangee" | "panneau-sombre";
const DESSINS_PROBLEME: Readonly<Record<Variante, readonly string[]>> = {
  colonne: ["position: sticky; top: 110px"],
  rangee: [
    "grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: end; margin-bottom: 34px",
    "padding: 26px 24px 28px",
  ],
  "panneau-sombre": [
    "border-radius: 40px; padding: 52px 56px",
    "right: -170px; top: -210px",
    "padding: 22px 26px",
  ],
};

function varianteDe(probleme: string): Variante {
  if (probleme.includes("padding: 52px 56px")) return "panneau-sombre";
  if (probleme.includes("grid-template-columns: 1.1fr 0.9fr")) return "rangee";
  return "colonne";
}

/** Le dessin « colonne » est délégué à `offre/ProblemeOffre`, composant
 * partagé hors de ce périmètre : quand la punchline n'a pas de suite (fanuc),
 * la capture pose quand même le paragraphe, VIDE (`max-width: 40ch`, marge
 * basse de 22px), et `ProblemeOffre` ne le pose pas. Effet : 18px au lieu de
 * 22px entre le H2 et la photo. Seul écart du dessin, déclaré. */
const ECART_COLONNE = (d: Declarations) => d.get("max-width") === "40ch";

/* ------------------------------------------------- 3. la chaîne du relais */

/** Les clés dont la valeur n'est pas une copie de la capture. `lienLibelle`
 * est vérifié à part : la capture ne rend que l'étiquette client. */
const CLES_HORS_COPIE = new Set([
  "_source", "url", "gabarit", "href", "lienHref", "lienLibelle", "photo",
  "problemePhoto", "marquesFamille", "marquesFamilles", "type", "variante",
]);

function chainesDuRelais(valeur: unknown, cle?: string): string[] {
  if (typeof valeur === "string") {
    return cle && CLES_HORS_COPIE.has(cle) ? [] : valeur ? [valeur] : [];
  }
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chainesDuRelais(v, cle));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) =>
      CLES_HORS_COPIE.has(k) ? [] : chainesDuRelais(v, k),
    );
  }
  return [];
}

/* ------------------------------------------- l'hygiène commune à tout rendu */

function verifieHygiene(rendu: string, nom: string): void {
  assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, `${nom} : exactement un h1 attendu`);
  assert.ok(!/href="#"/.test(rendu), `${nom} : un href="#" est rendu`);
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bdark:/.test(
        classe[1],
      ),
      `${nom} : échafaudage Tailwind au rendu, « ${classe[1]} »`,
    );
  }
}

/* ---------------------------- les deux écrans du 08/10, comparés à leur capture */

/** « 02 Domaines » : la carte n'est pas un lien (la capture vise `#`), donc
 * ni la pastille « Voir l'expertise → » ni le survol de carte cliquable. La
 * photo passe par `next/image` : son fond CSS est vérifié par son fichier. */
const ECARTS_DOMAINES: Ecarts = {
  style: (d) =>
    (d.get("background") ?? "").includes("url(") ||
    d.get("margin-top") === "6px" ||
    d.get("width") === "26px",
  texte: (t) => t === "Voir l'expertise" || t === "→",
};

function verifieDomaines(nom: string, capture: string, titre: string, cartes: ContenuSpecialite["domaines"]): void {
  const rendu = renderToStaticMarkup(<DomainesSpecialite titre={titre} cartes={cartes!} />);
  verifieEcran(`${nom} · 02 Domaines`, capture, rendu, ECARTS_DOMAINES);
  for (const carte of cartes!) {
    assert.ok(
      rendu.includes(encodeURIComponent(carte.photo)) || rendu.includes(carte.photo),
      `${nom} · 02 Domaines : photo de la capture absente du rendu, ${carte.photo}`,
    );
  }
}

function verifieComplement(nom: string, capture: string, blocs: BlocComplementDomaine[]): void {
  const rendu = renderToStaticMarkup(<ComplementSpecialite blocs={blocs} />);
  // Un nœud de la capture qui porte un interdit ne se rend pas (en tout ou
  // partie) : il sort de la complétude, l'ordre reste vérifié.
  verifieEcran(`${nom} · Complément 2`, capture, rendu, { texte: porteInterdit });
}

/* ----------------------------------- les photos : maquette OU répartition

   ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
   Cette porte ne jugeait PAS l'origine des photos : elle vérifiait qu'une photo
   portée par la donnée était bien rendue, ce qui est circulaire. Elle laissait
   donc passer n'importe quel fichier. Mesuré le 09/10 par
   `node scripts/mesure-photos-site.mjs` : 68 photos distinctes pour 1 822
   emplacements, et les 109 photos achetées sous licence le 08/10 servies par
   aucune page. La répartition du 09/10 les pose ; cette porte gagne du même
   coup la règle qui lui manquait, et elle n'a que DEUX sources :
     - LA MAQUETTE : le fichier est nommé par la capture de la page ;
     - LA RÉPARTITION : le fichier est au registre des 109 photos sous licence,
       ou c'est une des dix photos de l'équipe Migen
       (`lib/photos-autorisees.ts`).
   Tout le reste tombe, et un témoin en fait la preuve.

   CE QUE CETTE RÈGLE NE DIT PAS, et il faut le savoir : elle autorise un
   FICHIER, pas une POSITION. La capture sert ses photos en fond CSS
   (`background:url("assets/web/…")`) et le site les sert par `next/image` :
   l'écart est déjà déclaré plus bas, et le rang n'est pas comparable des deux
   côtés. Donc une photo que la capture de LA PAGE nomme passe à n'importe quel
   emplacement de cette page. Mesuré le 09/10 : poser `ph-hero-raffinerie.jpg`
   (nommée par la capture) à la place d'une photo du registre n'est pas vu.
   Ce qui tombe, et c'est le défaut qu'on craint : tout fichier qu'aucune des
   deux sources ne nomme, dossier `/assets/photos/` compris. Rendre ce contrôle
   POSITIONNEL demande de comparer un fond CSS à `next/image` rang par rang :
   c'est un autre lot, et c'est écrit ici pour qu'il soit fait. */

/** Les fichiers d'image que la capture d'une page nomme. */
function photosDeLaCapture(capture: string): Set<string> {
  return new Set(
    [...capture.matchAll(/assets\/(?:web|photos|villes)\/([A-Za-z0-9._-]+\.(?:jpe?g|png|webp|avif))/g)].map((m) => m[1]),
  );
}

/** Les photos que la donnée d'une page porte, chemin public par chemin public. */
function photosDeLaDonnee(noeud: unknown): string[] {
  if (Array.isArray(noeud)) return noeud.flatMap(photosDeLaDonnee);
  if (!noeud || typeof noeud !== "object") return [];
  const sortie: string[] = [];
  for (const [cle, valeur] of Object.entries(noeud as Record<string, unknown>)) {
    if (cle === "logo" || cle === "logoInverse" || cle.startsWith("_")) continue;
    if (typeof valeur === "string") {
      if (/^\/assets\/.+\.(jpe?g|png|webp|avif)$/i.test(valeur) && !valeur.startsWith("/assets/clients/")) {
        sortie.push(valeur);
      }
      continue;
    }
    sortie.push(...photosDeLaDonnee(valeur));
  }
  return sortie;
}

/** Chaque photo de la donnée vient de la maquette OU de la répartition. */
function verifiePhotos(nom: string, capture: string, contenu: unknown): number {
  const deLaCapture = photosDeLaCapture(capture);
  const photos = photosDeLaDonnee(contenu);
  for (const photo of photos) {
    const fichier = photo.split("/").pop() ?? "";
    assert.ok(
      deLaCapture.has(fichier) || deLaRepartition(photo),
      `${nom} : ${photo} n'est ni nommée par la capture ni au registre des photos sous licence`,
    );
  }
  return photos.length;
}

let photosJugees = 0;

/* ----------------------------------------------------- 1. le contrôle, relais par relais */

for (const { nom, page } of RELAIS) {
  assert.ok(
    estSpecialite(page.contenu),
    `${nom} : le contenu se déclare « specialite » sans porter ses sections, la route servirait un autre gabarit`,
  );
  assert.ok(URLS_GABARIT.includes(page.url), `${nom} : ${page.url} n'est pas une page « 05 Spécialité » de l'index`);
  const capture = litCapture(page.url);
  const captureStyle = normaliseStyle(capture);
  const captureTexte = texteDe(capture);
  const labels = ecransDe(capture).map((e) => e.label);

  assert.ok(page.titre_h1, `${nom} : titre_h1 manquant`);
  assert.ok(
    captureTexte.includes(normaliseTexte(page.titre_h1!)),
    `${nom} : le H1 du relais n'est pas celui de la capture`,
  );

  const rendu = renderToStaticMarkup(
    <PageSpecialite
      titre={page.titre_h1!}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
      // Pas de fil d'Ariane ni de maillage : ils interrogent la base.
    />,
  );
  const renduStyle = normaliseStyle(rendu);
  const renduTexte = texteDe(rendu);

  /* 2. les dessins et les copies communs. */
  for (const fragment of DESSINS) {
    const attendu = normaliseStyle(fragment);
    assert.ok(captureStyle.includes(attendu), `${nom} : la capture ne porte pas « ${fragment} »`);
    assert.ok(renduStyle.includes(attendu), `${nom} : le rendu ne porte pas le dessin « ${fragment} »`);
  }
  for (const texte of COPIES) {
    const attendu = normaliseTexte(texte);
    assert.ok(captureTexte.includes(attendu), `${nom} : la capture ne porte pas « ${texte} »`);
    assert.ok(renduTexte.includes(attendu), `${nom} : le rendu ne porte pas la copie « ${texte} »`);
  }

  /* 3. les écrans optionnels, dans les deux sens. */
  for (const optionnel of OPTIONNELS) {
    const present = labels.includes(optionnel.label);
    for (const fragment of optionnel.dessins) {
      const attendu = normaliseStyle(fragment);
      assert.equal(captureStyle.includes(attendu), present, `${nom} : « ${fragment} » ne suit pas « ${optionnel.label} » dans la capture`);
      assert.equal(renduStyle.includes(attendu), present, `${nom} : « ${optionnel.label} » ${present ? "absent du" : "rendu sans être dans la capture,"} rendu`);
    }
    for (const texte of optionnel.copies) {
      assert.equal(renduTexte.includes(normaliseTexte(texte)), present, `${nom} : copie « ${texte} » de « ${optionnel.label} » mal rendue`);
    }
  }
  assert.equal(
    renduStyle.split(CARTE_COMPLEMENT).length - 1,
    labels.filter((l) => l.startsWith("Complément")).length,
    `${nom} : autant d'écrans « Complément N » au rendu que dans la capture`,
  );

  /* …et ceux du 08/10, comparés à la capture élément par élément. */
  const domaines = ecran(capture, "02 Domaines");
  if (domaines) verifieDomaines(nom, domaines, page.contenu.domainesTitre!, page.contenu.domaines);
  const complement2 = ecran(capture, "Complément 2");
  if (complement2) verifieComplement(nom, complement2, page.contenu.complementTypes!);
  const complement4 = ecran(capture, "Complément 4");
  if (complement4) {
    verifieEcran(
      `${nom} · Complément 4`,
      complement4,
      renderToStaticMarkup(<ComplementsOffre blocs={page.contenu.complementOffre!} />),
    );
  }

  /* …et chaque photo de la donnée vient de la maquette ou de la répartition. */
  photosJugees += verifiePhotos(nom, capture, page.contenu);

  /* …et le dessin du problème est celui de la capture. */
  const probleme = ecran(capture, "03 Problème");
  const sectionProbleme = page.contenu.sections.find((s) => s.type === "probleme") as SectionProbleme | undefined;
  if (probleme && sectionProbleme) {
    const variante = varianteDe(probleme);
    assert.equal(sectionProbleme.variante ?? "colonne", variante, `${nom} : le problème de la capture est dessiné « ${variante} »`);
    for (const fragment of DESSINS_PROBLEME[variante]) {
      assert.ok(normaliseStyle(probleme).includes(normaliseStyle(fragment)), `${nom} : la capture ne porte pas « ${fragment} »`);
      assert.ok(renduStyle.includes(normaliseStyle(fragment)), `${nom} : le problème ne porte pas « ${fragment} »`);
    }
    verifieEcran(
      `${nom} · 03 Problème`,
      probleme,
      renderToStaticMarkup(
        <ProblemeDomaine section={sectionProbleme} altPhoto={page.titre_h1!} photo={page.contenu.problemePhoto} />,
      ),
      // La photo du problème est identifiée par empreinte, pas par nom. Une
      // phrase interdite de la capture ne se rend pas (accroche de corrective).
      { style: (d) => (variante === "colonne" && ECART_COLONNE(d)) || d.has("object-fit"), texte: porteInterdit },
    );
  }

  /* 4. chaque chaîne du relais est copiée de la capture, pas réécrite. */
  for (const chaine of chainesDuRelais(page.contenu)) {
    assert.ok(
      copieDe(chaine, captureTexte),
      `${nom} : chaîne absente de la capture, donc réécrite ou inventée : « ${chaine.slice(0, 80)} »`,
    );
  }
  for (const section of page.contenu.sections) {
    if (section.type !== "preuves") continue;
    for (const preuve of section.preuves) {
      const client = preuve.lienLibelle?.replace(/^Étude de cas\s+/u, "");
      assert.ok(client && captureTexte.includes(normaliseTexte(client)), `${nom} : étiquette client absente de la capture : « ${client} »`);
      assert.ok(preuve.lienHref && capture.includes(`href="${preuve.lienHref}"`), `${nom} : la capture ne vise pas ${preuve.lienHref}`);
    }
  }

  /* 5. un seul h1, aucune cible morte, aucun échafaudage Tailwind. */
  verifieHygiene(rendu, nom);
  assert.ok(
    rendu.includes('href="#besoin"') && rendu.includes('href="#mgx-form"'),
    `${nom} : les appels doivent viser #besoin et #mgx-form, les ancres de la capture`,
  );
  // `next/link` rend la cible sans sa barre finale hors de Next (pas de
  // `trailingSlash` chargé) : les deux écritures valent.
  for (const cible of ["/secteurs/agroalimentaire", "/offres/residence", "/travaux-industriels", "/preuves"]) {
    assert.ok(
      rendu.includes(`href="${cible}/"`) || rendu.includes(`href="${cible}"`),
      `${nom} : lien de la capture absent du rendu : ${cible}/`,
    );
  }

  /* 6. les interdits du contrat. La carte « +200 » de la capture est rendue. */
  verifieInterdits(rendu, nom);
  for (const ligne of ["+200", "Clients industriels accompagnés"]) {
    assert.ok(!captureTexte.includes(ligne) || renduTexte.includes(ligne), `${nom} : « ${ligne} » est dans la capture et manque au rendu`);
  }
}

/* -------------- 7. les écrans du 08/10, rendus depuis CHAQUE capture qui les porte */

let ecransProuves = 0;
for (const url of URLS_GABARIT) {
  const capture = litCapture(url);
  const domaines = ecran(capture, "02 Domaines");
  const complement2 = ecran(capture, "Complément 2");
  if (!domaines && !complement2) continue;

  const releve = domaines ? domainesDeCapture(domaines) : undefined;
  const blocs = complement2
    ? complementDeCapture(complement2).map((bloc) => ({
        ...bloc,
        ...(bloc.texte !== undefined ? { texte: sansInterdit(bloc.texte) } : {}),
        ...(bloc.puces ? { puces: bloc.puces.map((p) => ({ ...p, texte: sansInterdit(p.texte) })) } : {}),
        ...(bloc.tableau
          ? { tableau: { ...bloc.tableau, lignes: bloc.tableau.lignes.map((l) => l.map(sansInterdit)) } }
          : {}),
      }))
    : undefined;

  if (domaines) {
    verifieDomaines(url, domaines, releve!.titre, releve!.cartes);
    ecransProuves++;
  }
  if (complement2) {
    verifieComplement(url, complement2, blocs!);
    ecransProuves++;
  }

  /* À leur place, DANS L'ORDRE DE LA CAPTURE : la page est rendue avec le
     problème de la capture (son H2, son dessin), et chaque écran repéré au
     rendu doit suivre le précédent comme dans la capture. */
  const probleme = ecran(capture, "03 Problème")!;
  const contenu: ContenuSpecialite = {
    gabarit: "specialite",
    sections: [{ type: "probleme", punchline: h2De(probleme), puces: [], variante: varianteDe(probleme) }],
    ...(releve ? { domainesTitre: releve.titre, domaines: releve.cartes } : {}),
    ...(blocs ? { complementTypes: blocs } : {}),
  };
  const page = renderToStaticMarkup(<PageSpecialite titre="Titre" contenu={contenu} formulaire="releve" />);
  const texte = texteDe(page);
  const repere: Readonly<Record<string, string>> = {
    "Réassurance": "Qui intervient chez vous",
    "02 Domaines": "Nos domaines",
    "Complément 2": blocs ? noeudsDe(renderToStaticMarkup(<ComplementSpecialite blocs={blocs} />))[0] : "",
    "03 Problème": "Votre problématique",
    "Secteurs de l’expertise": "Même expertise, contraintes différentes",
  };
  const ordre = ecransDe(capture).map((e) => e.label).filter((l) => l in repere);
  assert.equal(ordre.length, (releve ? 1 : 0) + (blocs ? 1 : 0) + 3, `${url} : écrans repères introuvables dans la capture`);
  for (const label of ordre) {
    assert.ok(texte.includes(repere[label]), `${url} : « ${label} » est dans la capture et absent du rendu`);
  }
  for (let i = 1; i < ordre.length; i++) {
    const avant = texte.indexOf(repere[ordre[i - 1]]);
    assert.ok(
      avant >= 0 && avant < texte.indexOf(repere[ordre[i]]),
      `${url} : « ${ordre[i - 1]} » doit précéder « ${ordre[i]} », comme dans la capture`,
    );
  }
  verifieHygiene(page, url);
  verifieInterdits(page, url);
}
assert.equal(ecransProuves, 9, "trois « 02 Domaines » et six « Complément 2 » dans les captures du gabarit");

/* « Complément 4 » n'est pas nouveau : `offre/ComplementsOffre` le rend. La
   preuve qu'il le rend fidèlement sur les 16 captures qui le portent. */
let complements4 = 0;
for (const url of URLS_GABARIT) {
  const complement4 = ecran(litCapture(url), "Complément 4");
  if (!complement4) continue;
  verifieEcran(
    `${url} · Complément 4`,
    complement4,
    renderToStaticMarkup(<ComplementsOffre blocs={complementDeCapture(complement4)} />),
  );
  complements4++;
}
assert.equal(complements4, 16, "seize « Complément 4 » dans les captures du gabarit");

/* « 03 Problème » : ses trois dessins, rendus par `ProblemeDomaine` depuis
   la matière de CHAQUE capture. C'est ce que `offre/ProblemeOffre` ne savait
   pas faire pour « rangee » (4 pages) et « panneau-sombre » (9 pages). */
const dessinsProbleme: Record<Variante, number> = { colonne: 0, rangee: 0, "panneau-sombre": 0 };
for (const url of URLS_GABARIT) {
  const probleme = ecran(litCapture(url), "03 Problème")!;
  const variante = varianteDe(probleme);
  const section: SectionProbleme = { type: "probleme", ...problemeDeCapture(probleme), variante };
  assert.ok(section.puces.length >= 3, `${url} · 03 Problème : cartes introuvables dans la capture`);
  verifieEcran(
    `${url} · 03 Problème`,
    probleme,
    renderToStaticMarkup(<ProblemeDomaine section={section} altPhoto="" />),
    { style: (d) => (variante === "colonne" && ECART_COLONNE(d)) || d.has("object-fit") },
  );
  dessinsProbleme[variante]++;
}
assert.deepEqual(dessinsProbleme, { colonne: 6, rangee: 4, "panneau-sombre": 9 }, "les dessins du problème des 19 captures");

/* ------------------------------------- 8. une section sans donnée ne se rend pas */

const VIDE: ContenuSpecialite = { gabarit: "specialite", sections: [] };
const renduVide = renderToStaticMarkup(<PageSpecialite titre="Un titre seul" contenu={VIDE} formulaire="vide" />);
assert.equal((renduVide.match(/<h1[\s>]/g) ?? []).length, 1, "un contenu vide rend le titre, et rien de plus que les écrans fixes");
for (const absent of [
  "padding:22px 24px 22px 30px", // pas de bande d'appel
  "1.12fr .88fr", // pas de panneau de formulaire au héros
  "Votre problématique", // pas de problème
  "points", // pas de compteur de l'offre
  "Poser ma question", // pas de FAQ
  "repeat(auto-fill,minmax(150px,1fr))", // pas de marques
  "Nos domaines", // pas de « 02 Domaines »
  "padding:30px 34px 14px", // pas de « Complément N »
]) {
  assert.ok(!normaliseStyle(renduVide).includes(absent) && !texteDe(renduVide).includes(absent), `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`);
}

/* ---------------------------------------------- 9. le contrôle sait échouer */

{
  const preventive = litCapture("/expertises/types-de-maintenance/maintenance-preventive/");
  const domaines = ecran(preventive, "02 Domaines")!;
  const { titre, cartes } = domainesDeCapture(domaines);
  const bon = renderToStaticMarkup(<DomainesSpecialite titre={titre} cartes={cartes} />);
  const complement = ecran(preventive, "Complément 2")!;
  const blocs = complementDeCapture(complement);
  const faux = [
    ["un style changé", () => verifieEcran("faux", domaines, bon.replaceAll("min-height:230px", "min-height:231px"), ECARTS_DOMAINES)],
    ["un texte perdu", () => verifieEcran("faux", domaines, bon.replace(cartes[2].valeur, ""), ECARTS_DOMAINES)],
    ["un ordre inversé", () => verifieEcran("faux", domaines, renderToStaticMarkup(<DomainesSpecialite titre={titre} cartes={[...cartes].reverse()} />), ECARTS_DOMAINES)],
    ["un écart non déclaré", () => verifieEcran("faux", domaines, bon)],
    ["une cellule de tableau perdue", () => verifieComplement("faux", complement, blocs.map((b) => (b.tableau ? { ...b, tableau: { ...b.tableau, lignes: b.tableau.lignes.slice(1) } } : b)))],
    ["un interdit rendu", () => verifieInterdits("<p>une offre sur mesure</p>", "faux")],
    ["un écran rendu hors capture", () => verifieDomaines("faux", ecran(litCapture("/expertises/robotique/fanuc/"), "03 Problème")!, titre, cartes)],
  ] as const;
  for (const [cas, essai] of faux) {
    assert.throws(essai, `le contrôle doit échouer sur ${cas}`);
  }

/* …et le contrôle des photos SAIT ÉCHOUER : une photo que la capture ne nomme
   pas et que le registre ne connaît pas tombe, dossier `/assets/photos/`
   compris ; une photo DU registre passe. */
{
  const capture = litCapture(RELAIS[0].page.url);
  for (const [cas, photo] of [
    ["une photo inventée", "/assets/web/cette-photo-n-existe-pas.jpg"],
    ["un chemin du dossier sous licence absent du registre", "/assets/photos/cette-photo-n-est-pas-au-registre.jpg"],
  ] as const) {
    assert.throws(
      () => verifiePhotos("témoin", capture, { problemePhoto: photo }),
      `le contrôle des photos laisse passer ${cas}`,
    );
  }
  verifiePhotos("témoin admis", capture, { problemePhoto: cheminRegistre(REGISTRE[0].fichier) });
  assert.ok(photosDeLaCapture(capture).size > 0, "la capture ne nomme plus aucune photo : le lecteur est cassé");
}

  /* `copieDe` : seule une phrase INTERDITE peut manquer entre deux phrases. */
  const source = "Le chiffrage se fait sur devis. Une offre sur mesure. Nous détaillons les postes.";
  const amputee = "Le chiffrage se fait sur devis. Nous détaillons les postes.";
  assert.ok(copieDe(amputee, source), "une phrase interdite retirée reste une copie");
  assert.ok(!copieDe(amputee, source.replace("sur mesure", "solide")), "le contrôle doit échouer sur une phrase permise retirée");
  assert.ok(!copieDe("Nous détaillons les postes. Le chiffrage se fait sur devis.", source), "le contrôle doit échouer sur des phrases déplacées");
}

/* --------------------------------------------------------------- le bilan */

const portees = new Set(RELAIS.map(({ page }) => page.url));
const enAttente = URLS_GABARIT.filter((url) => !portees.has(url));
console.log("gabarit 05 Spécialité : toutes les vérifications passent.");
console.log(
  `  photos : ${photosJugees} emplacement(s) jugés, chacun nommé par la capture de sa page ou au registre des ` +
    `${REGISTRE.length} photos sous licence (écart du 09/10) ; photo inventée et chemin hors registre font tomber le contrôle.`,
);
console.log(
  `  ${RELAIS.length} relais « specialite » rendus depuis leur donnée et comparés à leur capture, ` +
    `${DESSINS.length} dessins et ${COPIES.length} copies communs, ${OPTIONNELS.length} écrans optionnels suivis dans les deux sens, ` +
    `${INTERDITS.length} interdits.`,
);
console.log(`  ${ecransProuves} écrans du 08/10 (« 02 Domaines », « Complément 2 ») rendus depuis leurs 9 captures, à leur place ; ${complements4} « Complément 4 » conformes ; 19 « 03 Problème » conformes (colonne ${dessinsProbleme.colonne}, rangée ${dessinsProbleme.rangee}, panneau sombre ${dessinsProbleme["panneau-sombre"]}).`);
for (const [nom, mots] of Object.entries(VIOLATIONS_CONNUES)) {
  console.log(`  VIOLATION DÉCLARÉE, hors périmètre : ${nom}, « ${mots.join(" », « ")} » au rendu.`);
}
console.log(`  ${enAttente.length}/${URLS_GABARIT.length} pages de l'index sans relais « specialite » : ${enAttente.join(" ")}`);
