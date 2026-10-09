/**
 * Contrôle du gabarit « 09 Domaine », sans navigateur.
 *
 *   bun components/site/expertises/domaine/verification-domaine.tsx
 *   bun components/site/expertises/domaine/verification-domaine.tsx /expertises/electrique/
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/<clé>.html`, une capture par page.
 *
 * TOUTES LES PAGES DU GABARIT, et c'est l'index qui les nomme : les entrées
 * `"gabarit": "09 Domaine"` de `maquette/contenu/site/index.json` (onze, dont
 * les deux accueils de rubrique `/expertises/types-de-maintenance/` et
 * `/expertises/specialisations-constructeur/`). Pour chacune, sa donnée
 * `supabase/import/gabarits-maquette/<clé>.json` :
 *
 *   · À LA NOUVELLE FORME (`estDomaine`) : la page est rendue et comparée à SA
 *     capture, ÉCRAN PAR ÉCRAN. Chaque élément stylé de la capture doit avoir
 *     son jumeau au rendu, déclaration par déclaration (valeurs normalisées :
 *     `0px`/`0`, `0.88`/`.88`, `rgb(255,255,255)`/`#fff`, `inset`, ordre de
 *     `box-shadow`), et chaque texte de la capture doit être au rendu, mot pour
 *     mot. Dans l'autre sens : chaque chaîne du relais existe dans la capture,
 *     chaque H2/H3 du rendu aussi (un écran que la capture n'a pas se voit),
 *     chaque lien interne de la capture est rendu.
 *   · ENCORE À L'ANCIENNE FORME, ou sans fichier : la page est EN ATTENTE, et
 *     le contrôle sort en échec en la nommant. Un gabarit n'est pas porté tant
 *     qu'une de ses pages est servie par un autre composant (CLAUDE.md §16).
 *
 * LES ÉCARTS QUI RESTENT sont ceux de composants PARTAGÉS, hors du périmètre
 * de ce gabarit. Ils sont DÉCLARÉS un par un (`ECARTS`), avec leur raison, et
 * imprimés à chaque exécution. Un écart déclaré qui ne se produit plus fait
 * échouer le contrôle : la liste ne pourrit pas.
 *
 * LES ÉCRANS AJOUTÉS LE 08/10 (« Complément 2 » à tableau, problème en
 * « rangee » et en « panneau-sombre », rail d'onglets des marques) sont aussi
 * prouvés SANS ATTENDRE LEUR DONNÉE : leur contenu est relu DANS LA CAPTURE de
 * la page qui les porte, rendu par le composant, et comparé à cette même
 * capture. Rien n'est écrit de mémoire. Puis le contrôle prouve qu'il sait
 * échouer : le mauvais dessin, ou le tableau retiré, doivent être vus.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { FAMILLES } from "@/components/site/marques/marques-donnees";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import { appliqueDecisions } from "@/lib/decisions-copie";
import { REGISTRE, cheminRegistre, deLaRepartition } from "@/scripts/photos-autorisees";
import type { Paragraphe, SectionProbleme } from "@/types/contenu";
import {
  estDomaine,
  type BlocComplementDomaine,
  type ContenuDomaine,
} from "@/types/domaine";

import ComplementsDomaine from "./ComplementsDomaine";
import PageDomaine from "./PageDomaine";
import ProblemeDomaine from "./ProblemeDomaine";

const RACINE = fileURLToPath(new URL("../../../..", import.meta.url));
const lit = (...chemin: string[]) => readFileSync(join(RACINE, ...chemin), "utf8");

/* ------------------------------------------------ les styles, déclaration par déclaration */

/** Coupe sur `sep` hors parenthèses : `rgba(0,0,0,.3)` reste entier. */
function coupe(valeur: string, sep: string): string[] {
  const morceaux: string[] = [];
  let profondeur = 0;
  let courant = "";
  for (const c of valeur) {
    if (c === "(") profondeur++;
    if (c === ")") profondeur--;
    if (c === sep && profondeur === 0) {
      morceaux.push(courant);
      courant = "";
    } else courant += c;
  }
  morceaux.push(courant);
  return morceaux.map((m) => m.trim()).filter(Boolean);
}

/** Une valeur ramenée à une écriture comparable : la capture sérialise comme
 * le navigateur, React comme l'auteur. */
function valeur(propriete: string, brute: string): string {
  let v = brute
    .replace(/&quot;/g, '"')
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/(^|[^\d])0\.(\d)/g, "$1.$2")
    .replace(/rgb\(255,255,255\)/g, "#fff")
    .replace(/rgb\(0,0,0\)/g, "#000")
    .replace(/url\("?\/?([^")]*)"?\)/g, "url($1)")
    .replace(/\s+/g, " ")
    .trim();
  if (propriete === "flex" && v === "none") v = "0 0 auto";
  if (propriete === "box-shadow") {
    v = coupe(v, ",")
      .map((couche) => {
        const mots = coupe(couche, " ");
        const couleurs = mots.filter((m) => /^(rgba?\(|#|var\()/.test(m));
        return [...mots.filter((m) => !couleurs.includes(m)), ...couleurs].join(" ");
      })
      .join(",");
  }
  return v;
}

type Declarations = Map<string, string>;

function declarations(style: string): Declarations {
  return new Map(
    coupe(style, ";")
      .flatMap((d) => {
        const i = d.indexOf(":");
        const propriete = d.slice(0, i).trim();
        const v = valeur(propriete, d.slice(i + 1));
        return propriete === "inset" && !v.includes(" ")
          ? ["top", "right", "bottom", "left"].map((p) => [p, v] as const)
          : [[propriete, v] as const];
      })
      .filter(([p]) => p && !p.startsWith("-webkit-")),
  );
}

const stylesDe = (html: string): Declarations[] =>
  [...html.matchAll(/style="([^"]*)"/g)].map((m) => declarations(m[1]));

/* --------------------------------------------------------------- les textes */

function texte(brut: string): string {
  return brut
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|&#39;|’/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const sansBalises = (html: string) =>
  html.replace(/<(style|script)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");
const texteLisible = (html: string) => texte(sansBalises(html));
const textesDe = (html: string): string[] => [
  ...new Set(
    html
      .replace(/<(style|script)[\s\S]*?<\/\1>/g, "")
      .split(/<[^>]+>/)
      .map(texte)
      .filter((t) => t && t !== "*"),
  ),
];
const majuscule = (t: string) => t.charAt(0).toLocaleUpperCase("fr-FR") + t.slice(1);

/* ------------------------------------------------------ les écrans de la capture */

/** Les sections de la capture, par `data-screen-label`. Le formulaire est
 * retiré : `verifie:formulaire` le contrôle, et ses champs se sérialisent en
 * longues mains (`border-top-width: medium`…) qui ne disent rien du dessin. */
function ecrans(capture: string): [string, string][] {
  const debuts = [...capture.matchAll(/<section[^>]*data-screen-label="([^"]*)"/g)];
  return debuts.map((m, k) => [
    m[1],
    capture
      .slice(m.index, debuts[k + 1]?.index ?? capture.length)
      .replace(/<form[\s\S]*?<\/form>/g, ""),
  ]);
}

function ecran(capture: string, nom: string): string {
  const trouve = ecrans(capture).find(([l]) => l === nom);
  assert.ok(trouve, `la capture n'a pas d'écran « ${nom} »`);
  return trouve[1];
}

/* ------------------------------------------------------------ la comparaison */

interface Manque {
  ecran: string;
  nature: "dessin" | "copie";
  detail: string;
}

/** Ce que l'écran de la capture porte et que le rendu n'a pas. Pour un dessin,
 * le détail nomme les déclarations absentes de l'élément du rendu le plus
 * proche, avec sa valeur à lui. */
function compare(nom: string, html: string, rendu: string): Manque[] {
  const rendus = stylesDe(rendu);
  const lisible = texteLisible(rendu);
  const manques: Manque[] = [];
  for (const attendu of stylesDe(html)) {
    let meilleur: Declarations = new Map();
    let score = -1;
    for (const candidat of rendus) {
      const n = [...attendu].filter(([p, v]) => candidat.get(p) === v).length;
      if (n > score) [meilleur, score] = [candidat, n];
      if (n === attendu.size) break;
    }
    if (score === attendu.size) continue;
    const detail = [...attendu]
      .filter(([p, v]) => meilleur.get(p) !== v)
      .map(([p, v]) => `${p}:${v}${meilleur.has(p) ? ` (rendu ${meilleur.get(p)})` : ""}`)
      .join("; ");
    manques.push({ ecran: nom, nature: "dessin", detail });
  }
  for (const t of textesDe(html)) {
    if (!lisible.includes(t)) manques.push({ ecran: nom, nature: "copie", detail: t });
  }
  return [...new Map(manques.map((m) => [`${m.nature}${m.detail}`, m])).values()];
}

/* ----------------------------------- les écarts déclarés, hors du périmètre */

interface Ecart {
  ecran: string;
  nature: Manque["nature"];
  /** Le manque est-il celui-ci ? Reçoit le détail et le texte du rendu. */
  est: (detail: string, lisible: string) => boolean;
  raison: string;
  vus: number;
}

const ecart = (
  ecranVise: string,
  nature: Manque["nature"],
  motif: RegExp | ((detail: string, lisible: string) => boolean),
  raison: string,
): Ecart => ({
  ecran: ecranVise,
  nature,
  est: typeof motif === "function" ? motif : (d) => motif.test(d),
  raison,
  vus: 0,
});

const ECARTS: Ecart[] = [
  ecart("02 Logos", "dessin", /^filter:invert\(1\) hue-rotate\(180deg\)$/,
    "LogosClients (partagé) n'inverse pas le logo OGF"),
  ecart("03 Problème", "dessin",
    // Seule capture du gabarit à suite vide : l'écart ne couvre qu'elle.
    (d, lisible) => lisible.includes("Une ligne vapeur qui perce, et c'est tout un atelier consigné un lundi matin.")
      && d.replace(/ \(rendu [^;]*\)/g, "") === "font:400 16px/1.7 var(--fb); margin:0 0 22px; max-width:40ch",
    "ProblemeOffre (partagé) ne rend pas le paragraphe de suite d'une punchline d'une seule phrase, la capture le rend VIDE (tuyauterie) : aucun texte ne manque, 4px sous le titre"),
  ecart("04 Offre", "dessin", /^max-width:none$/,
    "PointsOffre (partagé) : max-width:none absent de l'intitulé du point"),
  ecart("05 Déroulé", "dessin", /^grid-column:span 3 \(rendu 1 \/ -1\)$/,
    "DerouleOffre (partagé) : 1 / -1, même étendue sur la grille à 3 colonnes"),
  ecart("05 Déroulé", "copie", (d, lisible) => lisible.includes(majuscule(d)),
    "DerouleOffre (partagé) met une majuscule initiale que la capture n'a pas"),
  ecart("Secteurs de l’expertise", "dessin", /^background:url\(assets\/web\/[^)]+\) center center \/ cover no-repeat rgb\(58,58,60\)$/,
    "photo servie par next/image (CLAUDE.md §6), même cadrage cover, sans couleur de repli"),
  ecart("09 Questions", "copie", (d, lisible) => {
    const phrase = "Donnez-nous l'adresse du site, nous vous disons quelle agence intervient.";
    return d.endsWith(` ${phrase}`) && lisible.includes(d.slice(0, -phrase.length).trim());
  }, "règle client du README de passation, en France on dit hubs, pas agences : la phrase ne se reformule pas, elle n'est pas rendue (tuyauterie)"),
  ecart("Marques maintenues", "dessin", /^color:var\(--ink4\) \(rendu var\(--acc\)\)$/,
    "MarquesOffre (partagé) : compteur de l'onglet inactif en var(--ink2), la capture dit var(--ink4)"),
  ecart("10 Appel final", "dessin", /^padding:var\(--sec\) 24px var\(--sec\)$/,
    "l'ancre #mgx-form est posée par l'enveloppe de PageDomaine, AppelFinal (partagé) porte le padding : même boîte"),
];

/** Les manques qu'aucun écart déclaré n'explique. */
function nonDeclares(manques: readonly Manque[], rendu: string): Manque[] {
  const lisible = texteLisible(rendu);
  return manques.filter((m) => {
    const e = ECARTS.find(
      (x) => x.ecran === m.ecran && x.nature === m.nature && x.est(m.detail, lisible),
    );
    if (e) e.vus++;
    return !e;
  });
}

const liste = (manques: readonly Manque[]) =>
  manques.map((m) => `\n    [${m.ecran}] ${m.nature} : ${m.detail}`).join("");

/* --------------------------------------------------- les interdits du contrat */

const INTERDITS = [
  "—", "prix ", "tarif", "taux horaire", "régie", "intérim", "mise à disposition",
  "sans engagement", "clé en main", "sur mesure", "levier", "concrètement",
  "notamment", "incontournable", "découvrez", "limonest", "réguliers", "24h",
  "24 h", "24/24", "24/7", "7j/7", "7 j/7",
] as const;

function verifieHygiene(rendu: string, nom: string): void {
  const visible = texteLisible(rendu).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(!visible.includes(mot), `${nom} : mot proscrit par le contrat au rendu, « ${mot} »`);
  }
  assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, `${nom} : un h1, et un seul`);
  assert.ok(!/href="#"/.test(rendu), `${nom} : un href="#" est rendu`);
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bdark:/.test(classe[1]),
      `${nom} : échafaudage Tailwind au rendu, « ${classe[1]} »`,
    );
  }
}

/* ----------------------------------------------- chaque chaîne du relais, dans SA capture */

/** Clés dont la valeur n'est pas une copie : chemins, clés, discriminants.
 * `lienLibelle` : la capture ne rend que l'étiquette client courte. */
const HORS_COPIE = new Set([
  "_source", "url", "gabarit", "href", "lienHref", "lienLibelle", "photo",
  "problemePhoto", "marquesFamille", "marquesFamilles", "type", "variante",
]);

function chainesDuRelais(v: unknown, cle?: string): string[] {
  if (typeof v === "string") return cle && HORS_COPIE.has(cle) ? [] : v ? [v] : [];
  if (Array.isArray(v)) return v.flatMap((x) => chainesDuRelais(x, cle));
  if (v && typeof v === "object") {
    return Object.entries(v).flatMap(([k, x]) => (HORS_COPIE.has(k) ? [] : chainesDuRelais(x, k)));
  }
  return [];
}

/* ------------------------------------------------- les pages du gabarit, d'après l'index */

interface Entree {
  url: string;
  gabarit: string;
}

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: unknown;
}

const PAGES = (JSON.parse(lit("maquette", "contenu", "site", "index.json")) as Entree[])
  .filter((e) => e.gabarit === "09 Domaine")
  .map((e) => e.url);
assert.ok(PAGES.length >= 11, `l'index ne nomme que ${PAGES.length} pages « 09 Domaine »`);

const demandees = process.argv.slice(2);
for (const url of demandees) {
  assert.ok(PAGES.includes(url), `${url} n'est pas une page du gabarit « 09 Domaine »`);
}
const aVerifier = demandees.length ? demandees : PAGES;

const segments = (url: string) => url.split("/").filter(Boolean);
const cleCapture = (url: string) => segments(url).join("--");
/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const captureDe = (url: string) => appliqueDecisions(lit("maquette", "rendu", `${cleCapture(url)}.html`));
const fichierRelais = (url: string) => `${segments(url).join("-")}.json`;
const DOSSIER = join("supabase", "import", "gabarits-maquette");

/* ----------------------------------- les photos : maquette OU répartition

   ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
   Cette porte ne jugeait PAS l'origine des photos. Son seul contrôle d'image
   était l'écart déclaré « Secteurs de l'expertise », qui excuse le fond CSS de
   la capture parce que le site sert la photo par `next/image` : le FICHIER
   n'était comparé à rien. Mesuré le 09/10 par
   `node scripts/mesure-photos-site.mjs` : 68 photos distinctes pour 1 822
   emplacements, et les 109 photos achetées sous licence le 08/10 servies par
   aucune page. La répartition du 09/10 les pose ; cette porte gagne du même
   coup la règle qui lui manquait, et elle n'a que DEUX sources :
     - LA MAQUETTE : le fichier est nommé par la capture de la page ;
     - LA RÉPARTITION : le fichier est au registre des 109 photos sous licence,
       ou c'est une des dix photos de l'équipe Migen
       (`scripts/photos-autorisees.ts`).
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

function verifiePage(url: string): "conforme" | string {
  const cle = cleCapture(url);
  const capture = captureDe(url);
  const fiche = JSON.parse(lit("maquette", "rendu", `${cle}.json`)) as { h1Rendu: string };
  const chemin = join(DOSSIER, fichierRelais(url));
  if (!existsSync(join(RACINE, chemin))) return `aucun fichier ${chemin}`;

  const page = JSON.parse(lit(chemin)) as PageRelais;
  if (!estDomaine(page.contenu)) return `${chemin} est encore à l'ancienne forme (pas de \`sections\`)`;
  assert.equal(page.url, url, `${chemin} : son url n'est pas ${url}`);
  assert.ok(page.titre_h1, `${chemin} : titre_h1 manquant`);
  assert.equal(texte(page.titre_h1), texte(fiche.h1Rendu), `${chemin} : le H1 n'est pas celui de la capture`);

  const rendu = renderToStaticMarkup(
    <PageDomaine
      titre={page.titre_h1}
      contenu={page.contenu}
      formulaire={`cocon${url.replace(/\//g, "-")}`}
    />,
  );

  photosJugees += verifiePhotos(chemin, capture, page.contenu);

  const manques = ecrans(capture).flatMap(([nom, html]) => compare(nom, html, rendu));
  const restants = nonDeclares(manques, rendu);
  assert.equal(restants.length, 0, `${url} : écarts à la capture non déclarés${liste(restants)}`);

  const captureLisible = texteLisible(capture);
  for (const chaine of chainesDuRelais(page.contenu)) {
    assert.ok(captureLisible.includes(texte(chaine)), `${chemin} : chaîne absente de la capture, réécrite ? « ${chaine} »`);
  }
  for (const [, titre] of rendu.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)) {
    assert.ok(captureLisible.includes(texteLisible(titre)), `${url} : le rendu porte un titre que la capture n'a pas, « ${texteLisible(titre)} »`);
  }
  const liens = new Set([...capture.replace(/<form[\s\S]*?<\/form>/g, "").matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]));
  for (const lien of liens) {
    // `next/link` rendu hors de Next ignore `trailingSlash` : la barre finale
    // peut manquer ici et être servie en ligne.
    assert.ok(
      rendu.includes(`href="${lien}"`) || rendu.includes(`href="${lien.replace(/(.)\/$/, "$1")}"`),
      `${url} : la capture vise ${lien}, lien absent du rendu`,
    );
  }
  assert.ok(rendu.includes('href="#besoin"') && rendu.includes('id="besoin"'), `${url} : l'ancre #besoin du héros`);
  assert.ok(rendu.includes('href="#mgx-form"') && rendu.includes('id="mgx-form"'), `${url} : l'ancre #mgx-form`);
  verifieHygiene(rendu, url);
  return "conforme";
}

const bilan = aVerifier.map((url) => [url, verifiePage(url)] as const);
const conformes = bilan.filter(([, etat]) => etat === "conforme").map(([url]) => url);
const enAttente = bilan.filter(([, etat]) => etat !== "conforme");

/* --------------------- les écrans ajoutés, prouvés depuis la capture qui les porte */

/** Les cellules de la carte en verre d'un « Complément » : un bloc par cellule,
 * relu tel que la capture l'affiche. */
function blocsDuComplement(html: string): BlocComplementDomaine[] {
  return html
    .split(/<div[^>]*style="min-width: 0px; padding-bottom: 18px;"[^>]*>/)
    .slice(1)
    .map((cellule) => {
      const bloc: BlocComplementDomaine = {};
      const titre = cellule.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (titre) bloc.titre = texteLisible(titre[1]);
      const p = cellule.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (p) bloc.texte = texteLisible(p[1]);
      const puces = [...cellule.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>([\s\S]*?)<\/span>\s*<\/div>/g)];
      if (puces.length) {
        bloc.puces = puces.map((m) => ({ accroche: texteLisible(m[1]), texte: texteLisible(m[2]) }));
      }
      const table = cellule.match(/<table[\s\S]*?<\/table>/);
      if (table) {
        const cellules = (balise: string, html2: string) =>
          [...html2.matchAll(new RegExp(`<${balise}[^>]*>([\\s\\S]*?)</${balise}>`, "g"))].map((m) => texteLisible(m[1]));
        bloc.tableau = {
          entetes: cellules("th", table[0]),
          lignes: [...table[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
            .map((m) => cellules("td", m[1]))
            .filter((l) => l.length),
        };
      }
      return bloc;
    });
}

/** Le problème tel que la capture l'affiche : titre, suite, puis des cartes
 * « numéro, accroche, texte ». */
function problemeDeLaCapture(html: string, variante: SectionProbleme["variante"]): SectionProbleme {
  const titre = texteLisible(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)![1]);
  const suite = texteLisible(html.match(/<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)![1]);
  const jetons = textesDe(html.slice(html.indexOf("</h2>")));
  const puces: Paragraphe[] = [];
  jetons.forEach((j, i) => {
    if (/^\d{2}$/.test(j)) puces.push({ accroche: jetons[i + 1], texte: jetons[i + 2] });
  });
  return {
    type: "probleme",
    variante,
    punchline: suite ? `${titre} ${suite}` : titre,
    puces,
  } as SectionProbleme;
}



/** Un écran rendu seul doit égaler l'écran de sa capture, sans écart déclaré
 * possible quand le composant est de ce gabarit. */
function prouve(nom: string, html: string, rendu: string, declaresAdmis: boolean): void {
  const manques = compare(nom, html, rendu);
  const restants = declaresAdmis ? nonDeclares(manques, rendu) : manques;
  assert.equal(restants.length, 0, `« ${nom} » ne rend pas sa capture${liste(restants)}`);
}

// « Complément 2 » de l'accueil des types de maintenance, tableau compris.
const C2 = ecran(captureDe("/expertises/types-de-maintenance/"), "Complément 2");
const blocsC2 = blocsDuComplement(C2);
assert.ok(blocsC2.some((b) => b.tableau?.lignes.length), "la capture des types de maintenance doit porter son tableau");
prouve("Complément 2", C2, renderToStaticMarkup(<ComplementsDomaine blocs={blocsC2} />), false);

// Le problème en rangée (électrique) et en panneau sombre (hydraulique).
const RANGEE = ecran(captureDe("/expertises/electrique/"), "03 Problème");
const SOMBRE = ecran(captureDe("/expertises/hydraulique/"), "03 Problème");
const rendRangee = (v: SectionProbleme["variante"]) =>
  renderToStaticMarkup(<ProblemeDomaine section={problemeDeLaCapture(RANGEE, v)} altPhoto="" />);
const rendSombre = (v: SectionProbleme["variante"]) =>
  renderToStaticMarkup(<ProblemeDomaine section={problemeDeLaCapture(SOMBRE, v)} altPhoto="" />);
prouve("03 Problème", RANGEE, rendRangee("rangee"), false);
prouve("03 Problème", SOMBRE, rendSombre("panneau-sombre"), false);

// Le rail d'onglets des marques (électromécanique) : familles lues sur les onglets.
const MARQUES = ecran(captureDe("/expertises/electromecanique/"), "Marques maintenues");
const onglets = [...MARQUES.matchAll(/<button[^>]*?style="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => {
  const intitule = textesDe(m[2])[0];
  const famille = FAMILLES.find((f) => f.titre === intitule);
  assert.ok(famille, `onglet « ${intitule} » de la capture sans famille dans marques-donnees.ts`);
  return { cle: famille.cle, actif: /background: var\(--ink\)/.test(m[1]) };
});
assert.ok(onglets.length >= 2, "la capture de l'électromécanique doit porter son rail d'onglets");
prouve(
  "Marques maintenues",
  MARQUES,
  renderToStaticMarkup(
    <MarquesOffre famille={onglets.find((o) => o.actif)!.cle} familles={onglets.map((o) => o.cle)} />,
  ),
  true,
);

/* -------------------------------------------------- le contrôle sait échouer */

assert.ok(compare("03 Problème", SOMBRE, rendSombre("rangee")).length > 0, "le mauvais dessin du problème doit être vu");
assert.ok(compare("03 Problème", RANGEE, rendRangee("colonne")).length > 0, "la colonne à photo à la place de la rangée doit être vue");
assert.ok(
  compare("Complément 2", C2, renderToStaticMarkup(<ComplementsDomaine blocs={blocsC2.filter((b) => !b.tableau)} />))
    .some((m) => m.nature === "copie" && m.detail === blocsC2.find((b) => b.tableau)!.tableau!.entetes[0]),
  "un tableau retiré doit être vu, en-tête compris",
);
const sansMarques = compare("Marques maintenues", MARQUES, renderToStaticMarkup(<MarquesOffre famille={onglets[0].cle} />));
assert.ok(sansMarques.length > 0, "un rail d'onglets absent doit être vu");

// À l'échelle d'une page réelle : le pilote robotique, son problème passé au
// panneau sombre, ne doit plus être conforme à sa capture.
{
  const pilote = JSON.parse(lit(DOSSIER, "expertises-robotique.json")) as { titre_h1: string; contenu: ContenuDomaine };
  const faux: ContenuDomaine = {
    ...pilote.contenu,
    sections: pilote.contenu.sections.map((s) => (s.type === "probleme" ? { ...s, variante: "panneau-sombre" } : s)),
  };
  const rendu = renderToStaticMarkup(<PageDomaine titre={pilote.titre_h1} contenu={faux} formulaire="faux" />);
  const vus = nonDeclares(
    ecrans(captureDe("/expertises/robotique/")).flatMap(([nom, html]) => compare(nom, html, rendu)),
    rendu,
  );
  assert.ok(vus.some((m) => m.ecran === "03 Problème"), "un pilote au mauvais dessin doit échouer");
}

/* ------------- le contrôle des photos SAIT ÉCHOUER, et la nouvelle source ne
   lui a pas enlevé ses dents : une photo que la capture ne nomme pas et que le
   registre ne connaît pas tombe, dossier `/assets/photos/` compris ; une photo
   DU registre passe. */
{
  const capture = captureDe(PAGES[0]);
  assert.ok(photosDeLaCapture(capture).size > 0, "la capture ne nomme plus aucune photo : le lecteur est cassé");
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
}

/* --------------------------------------------- une section sans donnée ne se rend pas */

const VIDE: ContenuDomaine = { gabarit: "domaine", sections: [] };
const renduVide = texteLisible(renderToStaticMarkup(<PageDomaine titre="Un titre seul" contenu={VIDE} formulaire="vide" />));
for (const absent of [
  "Votre problématique", "Notre méthode", "Notre parti pris", "Les équipements que nous maintenons déjà",
  "Nos références", "Vos questions avant de nous appeler", "Idéal pour",
]) {
  assert.ok(!renduVide.includes(absent), `sans donnée, rien ne se rend : « ${absent} » au rendu vide`);
}

/* ----------- l'ancienne forme ne passe pas `estDomaine` : la route la sert comme avant */

assert.ok(
  !estDomaine({ gabarit: "domaine", chapeau: "", traitements: [], autres: [] }),
  "l'ancienne forme (chapeau, traitements, autres) ne doit pas passer estDomaine",
);

/* ------------------------------------------------------------------- bilan */

if (!demandees.length) {
  const muets = ECARTS.filter((e) => e.vus === 0);
  assert.equal(muets.length, 0, `écarts déclarés qui ne se produisent plus, à retirer :${muets.map((e) => `\n    [${e.ecran}] ${e.raison}`).join("")}`);
}

console.log(`gabarit domaine : ${conformes.length}/${aVerifier.length} pages conformes à leur capture.`);
console.log(
  `  photos : ${photosJugees} emplacement(s) jugés, chacun nommé par la capture de sa page ou au registre des ` +
    `${REGISTRE.length} photos sous licence (écart du 09/10) ; photo inventée et chemin hors registre font tomber le contrôle.`,
);
for (const url of conformes) console.log(`  conforme    ${url}`);
for (const [url, raison] of enAttente) console.log(`  EN ATTENTE  ${url} : ${raison}`);
console.log("  écrans ajoutés prouvés sur leur capture : Complément 2 (types de maintenance), problème rangée (électrique) et panneau sombre (hydraulique), rail d'onglets (électromécanique).");
console.log(`  écarts déclarés des composants partagés, ${ECARTS.filter((e) => e.vus).length} vus :`);
for (const e of ECARTS.filter((x) => x.vus)) console.log(`    [${e.ecran}] ${e.raison} (${e.vus})`);

if (enAttente.length) {
  console.error(`\nÉCHEC : ${enAttente.length} page(s) du gabarit ne sont pas encore servies par lui.`);
  process.exit(1);
}
