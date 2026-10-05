/**
 * Contrôle du gabarit IMPLANTATION, sans navigateur.
 *
 *   bun components/site/implantation/verification-implantation.tsx
 *
 * CE QU'IL VÉRIFIE, et pourquoi chacun :
 *
 *   1. LES VALEURS VIENNENT DE LA MAQUETTE. Elles sont RELUES dans
 *      `maquette/gabarit-04-ville.html` à chaque exécution, jamais écrites de
 *      mémoire ici : chaque attente est extraite du fichier, puis cherchée dans
 *      le HTML rendu. Une note de lecture peut se tromper et personne ne peut
 *      la rejouer ; ce fichier-ci se rejoue.
 *   2. LES DOUZE SECTIONS, dans l'ordre de la maquette. C'est le défaut qui a
 *      tenu des semaines : le gabarit en rendait cinq, et personne ne le voyait
 *      parce qu'aucun contrôle ne comptait.
 *   3. UN SEUL H1 par page.
 *   4. AUCUN `href="#"`. La maquette en est pleine, sa navigation étant pilotée
 *      par sa propre logique, qui n'est pas portée. Un lien vers nulle part sur
 *      quarante-deux pages référencées est un défaut, pas un détail.
 *   5. AUCUNE classe de couleur Tailwind, AUCUNE variante `dark:`. La charte
 *      vit dans des jetons, et le site n'a pas de mode sombre.
 *   6. LES INTERDITS DE COPIE DU CONTRAT sont absents du rendu. Ils gagnent
 *      CONTRE la maquette, qui écrit « Lyon (siège) » là où le siège est à
 *      Limonest.
 *   7. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. Pas de cadre vide, pas
 *      de sur-titre orphelin, pas de texte de remplissage.
 *
 * LE GABARIT 06 DÉPARTEMENT N'A PAS SON CONTRÔLE À PART : son fichier de
 * maquette est celui de la ville, mêmes douze sections, même markup. Le
 * contrôle rend les deux et vérifie qu'ils produisent le même dessin.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuDepartement, ContenuVille } from "@/types/implantation";

import PageDepartement from "./PageDepartement";
import PageVille from "./PageVille";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* ------------------------------------------------------------ la maquette, relue */

const MAQUETTE = readFileSync(
  join(RACINE, "maquette", "gabarit-04-ville.html"),
  "utf8",
);

/**
 * Le texte, normalisé avant toute comparaison.
 *
 * SANS CELA, LE CONTRÔLE NE VOIT RIEN. La maquette écrit « 10&nbsp;% » et
 * « Une autre question&nbsp;? » avec une entité ; React, lui, rend l'espace
 * insécable comme le CARACTÈRE U+00A0. Chercher « 10 % » avec une espace
 * ordinaire ne trouve ni l'un ni l'autre.
 *
 * ET L'APOSTROPHE EST ÉCHAPPÉE PAR REACT. `renderToStaticMarkup` rend
 * « l'heure » en « l&#x27;heure ». Chercher « rappel dans l'heure » dans le
 * HTML ne le trouve donc jamais, et c'est la SEULE formulation de délai que le
 * contrat autorise : un contrôle aveugle à elle ne sait pas distinguer la seule
 * phrase permise de celles qui sont interdites. Seules les apostrophes et les
 * espaces sont décodées, pas `&lt;` ni `&gt;` : les décoder fabriquerait de
 * fausses balises et fausserait le comptage des H1.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/[’‘]/g, "'")
    .replace(/&amp;/g, "&");
}

/** L'ordre des sections du fichier de maquette, par leur étiquette d'écran. */
function sectionsDeLaMaquette(): string[] {
  return [...MAQUETTE.matchAll(/<section data-screen-label="([^"]+)"/g)].map(
    (m) => m[1],
  );
}

/** Le bloc d'une section de la maquette, de son ouverture à la suivante. */
function bloc(etiquette: string): string {
  const debut = MAQUETTE.indexOf(`<section data-screen-label="${etiquette}"`);
  assert.ok(debut > -1, `section « ${etiquette} » absente de la maquette`);
  const suite = MAQUETTE.indexOf("<section data-screen-label=", debut + 1);
  return MAQUETTE.slice(debut, suite > -1 ? suite : MAQUETTE.length);
}

/**
 * Les textes LITTÉRAUX d'un bloc : ceux que la maquette écrit elle-même, par
 * opposition aux `{{ p.quelquechose }}` que le corpus remplit. Ce sont les
 * sur-titres, les titres fixes et la copie de la réassurance.
 */
function litteraux(source: string): string[] {
  return [...source.matchAll(/>([^<>{}]+)</g)]
    .map((m) => normalise(m[1]).trim())
    .filter((t) => t.length > 1 && /[A-Za-zÀ-ÿ]/.test(t));
}

/** Le sur-titre d'un bloc : le premier littéral posé en capitales par le CSS. */
function surTitre(etiquette: string): string | null {
  const source = bloc(etiquette);
  const m = source.match(/text-transform:uppercase[^>]*>([^<>{}]+)</);
  return m ? normalise(m[1]).trim() : null;
}

/** Toutes les valeurs déclarées pour une propriété CSS, dans l'ordre du bloc. */
function declarations(etiquette: string, propriete: string): string[] {
  const motif = new RegExp(`(?:^|[;"])${propriete}:([^;"]+)`, "g");
  return [...bloc(etiquette).matchAll(motif)].map((m) => m[1].trim());
}

/** La n-ième déclaration d'une propriété, telle que React la réécrirait. */
function declaration(etiquette: string, propriete: string, n = 0): string {
  const trouvees = declarations(etiquette, propriete);
  assert.ok(
    trouvees.length > n,
    `« ${propriete} » n° ${n} introuvable dans « ${etiquette} »`,
  );
  return `${propriete}:${trouvees[n]}`;
}

/* ----------------------------------------------------------------- le contenu */

/**
 * Le contenu d'une page réelle, relu dans le fichier que le producteur écrit.
 *
 * PAS DE JEU D'ESSAI ÉCRIT À LA MAIN : un contrôle qui invente ses données
 * vérifie le gabarit sur un cas qui n'existe pas. `/implantations/lyon/` est
 * une page témoin : trente-quatre villes lui ressemblent.
 */
function contenuDeFichier(nom: string): ContenuVille | ContenuDepartement {
  return JSON.parse(
    readFileSync(
      join(RACINE, "supabase", "import", "gabarits-maquette", nom),
      "utf8",
    ),
  ).contenu;
}

const VILLE = contenuDeFichier("implantations-lyon.json") as ContenuVille;
const DEPT = contenuDeFichier("implantations-lyon-rhone.json") as ContenuDepartement;

const TITRE_VILLE = "La maintenance industrielle à Lyon, depuis notre siège";
const TITRE_DEPT = "La maintenance industrielle dans le Rhône, du Beaujolais à Feyzin";

const rendu = normalise(
  renderToStaticMarkup(<PageVille titre={TITRE_VILLE} contenu={VILLE} />),
);
const renduDept = normalise(
  renderToStaticMarkup(<PageDepartement titre={TITRE_DEPT} contenu={DEPT} />),
);

/* `gabarit` mis à part, un contenu entièrement vide : aucune section de la
   maquette n'a de quoi se remplir. */
const renduVide = normalise(
  renderToStaticMarkup(
    <PageVille titre={TITRE_VILLE} contenu={{ gabarit: "ville" }} />,
  ),
);

let controles = 0;

function verifie(quoi: string, condition: boolean, detail = "") {
  assert.ok(condition, `${quoi}${detail ? `\n    ${detail}` : ""}`);
  controles += 1;
}

/* ============================ 1. les douze sections, dans l'ordre de la maquette */

const ETIQUETTES = sectionsDeLaMaquette().filter((e) => !e.startsWith("Gabarit"));

verifie(
  `la maquette dessine douze sections (relevé : ${ETIQUETTES.length})`,
  ETIQUETTES.length === 12,
  ETIQUETTES.join(" | "),
);

/**
 * Les sections sans source dans le corpus, et la raison. Déclarées ici, pas
 * tolérées en silence : le contrôle vérifie qu'elles sont les SEULES absentes.
 */
const SANS_SOURCE = new Map([
  [
    "02 Photo et logos",
    "la photo n'a aucune source ; le bandeau de noms, lui, est rendu",
  ],
]);

/* Chaque sur-titre de la maquette doit se retrouver dans le rendu, dans
   l'ordre. L'ordre est ce qui tombe en premier quand on porte à l'envers. */
let curseur = -1;
for (const etiquette of ETIQUETTES) {
  const titre = surTitre(etiquette);
  if (!titre) continue; // « 01 Héros » et « 07 Appel » n'en ont pas.
  if (SANS_SOURCE.has(etiquette) && !rendu.includes(titre)) continue;

  const position = rendu.indexOf(titre);
  verifie(
    `le sur-titre « ${titre} » (${etiquette}) est rendu`,
    position > -1,
  );
  verifie(
    `« ${titre} » vient après la section précédente`,
    position > curseur,
    `position ${position}, précédente ${curseur}`,
  );
  curseur = position;
}

/* ================================ 2. les titres fixes, relus dans la maquette */

/** Les H2 que la maquette écrit elle-même, sans `{{ }}`. */
const TITRES_FIXES = [...MAQUETTE.matchAll(/<h2[^>]*>([^<>{}]+)<\/h2>/g)].map(
  (m) => normalise(m[1]).trim(),
);

verifie(
  `la maquette écrit ${TITRES_FIXES.length} H2 fixes`,
  TITRES_FIXES.length === 5,
  TITRES_FIXES.join(" | "),
);

for (const titre of TITRES_FIXES) {
  verifie(`le H2 fixe « ${titre} » est rendu`, rendu.includes(titre));
}

/* ========================== 3. la copie de la réassurance, écrite par la maquette */

/* Elle ne vient pas du corpus : si le composant la perd, aucune donnée ne le
   signalera. Chaque littéral du bloc est donc cherché dans le rendu, à
   l'exception de la seule ligne que les interdits du contrat corrigent. */
const CORRIGE_PAR_LE_CONTRAT = "Lyon (siège), Montréal, Dubaï, Madrid";

for (const texte of litteraux(bloc("Réassurance"))) {
  if (texte === CORRIGE_PAR_LE_CONTRAT) continue;
  verifie(
    `la réassurance rend « ${texte.slice(0, 48)} »`,
    rendu.includes(texte),
  );
}

verifie(
  "le siège est dit à Limonest, contre la maquette",
  rendu.includes("Lyon (siège, à Limonest), Montréal, Dubaï, Madrid") &&
    !rendu.includes(CORRIGE_PAR_LE_CONTRAT),
  "le contrat impose « quatre agences : Lyon siège à Limonest, Montréal, Dubaï, Madrid »",
);

/* ================= 4. la géométrie, chaque valeur relue dans la maquette */

/**
 * Chaque entrée dit : dans quelle section, quelle propriété, à quel rang de la
 * section, et ce que la valeur dessine. Rien n'est écrit en clair : la valeur
 * attendue est extraite du fichier à l'exécution.
 */
const GEOMETRIE: [string, string, number, string][] = [
  ["01 Héros", "padding", 0, "la section haute respire 44 en tête"],
  ["01 Héros", "grid-template-columns", 0, "le héros, texte plus large que panneau"],
  ["01 Héros", "gap", 1, "la gouttière du héros"],
  ["01 Héros", "max-width", 1, "le H1 ne dépasse pas quinze caractères"],
  ["01 Héros", "min-width", 0, "la colonne des valeurs du panneau « En bref »"],
  ["03 Problème", "grid-template-columns", 0, "le vis-à-vis du problème, deux colonnes égales"],
  ["03 Problème", "gap", 1, "la gouttière du vis-à-vis"],
  ["03 Problème", "top", 0, "la colonne de gauche suit le défilement"],
  ["04 Offre", "grid-template-columns", 0, "les trois colonnes du tableau"],
  ["04 Offre", "border-radius", 1, "le rayon de la pastille de bénéfice"],
  ["05 Déroulé", "grid-template-columns", 0, "le déroulé, frise plus large que texte"],
  ["05 Déroulé", "width", 1, "la pastille numérotée de l'étape"],
  ["06 Garanties", "padding", 1, "le panneau sombre des garanties"],
  ["06 Garanties", "border-radius", 0, "le rayon du panneau sombre"],
  ["06 Garanties", "grid-template-columns", 0, "les garanties, deux colonnes"],
  ["Réassurance", "grid-template-columns", 0, "la réassurance, certifications plus étroites"],
  ["07 Appel", "border-radius", 0, "le rayon du bandeau d'appel"],
  ["08 Références", "grid-template-columns", 0, "les références, trois colonnes"],
  ["09 Questions", "grid-template-columns", 0, "les questions, colonne fixe plus étroite"],
  ["Maillage", "grid-template-columns", 0, "le maillage se réarrange tout seul"],
  ["10 Appel final", "padding", 0, "la dernière section ferme aussi en bas"],
];

for (const [etiquette, propriete, rang, dessine] of GEOMETRIE) {
  const attendue = declaration(etiquette, propriete, rang);
  verifie(
    `${etiquette} : ${attendue} (${dessine})`,
    rendu.includes(attendue),
  );
}

/* La couleur des sur-titres, et leur graisse, relues dans la maquette. */
const POLICE_SURTITRE = declaration("03 Problème", "font", 0);
const CHASSE_SURTITRE = declaration("03 Problème", "letter-spacing", 0);
verifie(`le sur-titre est en ${POLICE_SURTITRE}`, rendu.includes(POLICE_SURTITRE));
verifie(`le sur-titre est chassé à ${CHASSE_SURTITRE}`, rendu.includes(CHASSE_SURTITRE));

/* ======================================= 5. le texte vient du corpus, en entier */

const CORPUS: [string, string][] = [
  ["le chapeau du héros", VILLE.chapeau!],
  ["la ligne de délai", VILLE.delai!],
  ["le H2 du problème", VILLE.problemeTitre!],
  ["le paragraphe du problème", VILLE.problemeTexte!],
  ["la première prestation", VILLE.offre![0].prestation.accroche!],
  ["le premier bénéfice", VILLE.offre![0].benefice],
  ["la première étape", VILLE.etapes![0].titre],
  ["la première garantie", VILLE.garanties![0].accroche!],
  ["la question d'appel", VILLE.appel!.question],
  ["la première référence", VILLE.preuves![0].titre],
  ["la première question fréquente", VILLE.questions![0].question],
  ["la question finale", VILLE.appelFinal!.question],
];

for (const [quoi, texte] of CORPUS) {
  verifie(`${quoi} est rendu`, rendu.includes(normalise(texte)), texte.slice(0, 70));
}

/* Les noms du bandeau défilant sont ceux des références de la page, doublés
   pour la boucle : c'est le calcul de la maquette, l. 406. */
for (const nom of VILLE.logos!) {
  verifie(
    `le client « ${nom} » défile deux fois`,
    rendu.split(nom).length - 1 >= 2,
  );
}

/* Chaque lien du maillage pointe vers un chemin interne du corpus. */
for (const lien of VILLE.liens!) {
  verifie(
    `le maillage pointe vers ${lien.href}`,
    rendu.includes(`href="${lien.href}"`),
  );
}

/* ====================== 6. le gabarit 06 rend le même dessin que le gabarit 04 */

for (const etiquette of ETIQUETTES) {
  const titre = surTitre(etiquette);
  if (!titre || (SANS_SOURCE.has(etiquette) && !rendu.includes(titre))) continue;
  verifie(
    `le département rend aussi « ${titre} »`,
    renduDept.includes(titre),
    "les gabarits 04 et 06 sont le même fichier : même dessin",
  );
}

/* ================================================= 7. un seul H1, et pas de piège */

for (const [quoi, html] of [
  ["ville", rendu],
  ["département", renduDept],
  ["contenu vide", renduVide],
] as const) {
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  verifie(`${quoi} : un seul H1 (compté ${h1})`, h1 === 1);
}

/* ============================================ 8. aucun lien vers nulle part */

for (const [quoi, html] of [
  ["ville", rendu],
  ["département", renduDept],
] as const) {
  verifie(`${quoi} : aucun href="#"`, !/href="#"/.test(html));
  verifie(
    `${quoi} : aucune cible externe sous l'autorité du domaine`,
    !/href="(?:https?:)?\/\//.test(html),
  );
}

/* ================================= 9. aucune classe de couleur Tailwind */

const TAILWIND =
  /class(?:Name)?="[^"]*\b(?:bg|text|border|from|to|via|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)\b/;

for (const [quoi, html] of [
  ["ville", rendu],
  ["département", renduDept],
] as const) {
  verifie(`${quoi} : aucune classe de couleur Tailwind`, !TAILWIND.test(html));
  verifie(`${quoi} : aucune variante dark:`, !/\bdark:/.test(html));
}

/* ==================================== 10. les interdits de copie du contrat */

/**
 * Chaque interdit, avec ce qu'il faut écrire à la place. Ils GAGNENT contre la
 * maquette : elle écrit « Lyon (siège) » là où le siège est à Limonest, et son
 * propre parseur retire déjà « 24/24 et 7/7 » du corpus.
 */
const INTERDITS: [RegExp, string][] = [
  [/\+\s?200|200 clients/, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/(?:5|[Cc]inq) agences/, "quatre agences : Lyon siège à Limonest, Montréal, Dubaï, Madrid"],
  [/sous (?:2|4|24|48|72) ?h/i, "« rappel dans l'heure », aucun autre délai chiffré"],
  [/\d+\s?h de route|heures de route/, "aucun délai ni distance chiffrés"],
  [/24\s?\/\s?24|7\s?\/\s?7|7\s?j\s?\/\s?7|24\s?h\s?\/\s?24/, "l'astreinte se dit sans chiffre : « nuit, week-end et jours fériés »"],
  [/\brégie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bintérim/i, "nommer la prestation, jamais le statut"],
  [/mise à disposition/i, "« intervention » ou « mission »"],
  [/sans engagement/i, "dire la durée réelle, ou ne rien dire"],
  [/clé en main/i, "dire ce qui est fait"],
  [/sur mesure/i, "dire ce qui s'adapte, et à quoi"],
  [/\bleviers?\b/i, "dire l'effet obtenu"],
  [/concrètement/i, "à supprimer, le paragraphe suivant le dit déjà"],
  [/notamment/i, "à supprimer, ou « dont »"],
  [/incontournable/i, "à supprimer"],
  [/découvrez/i, "un verbe qui dit ce que la page fait"],
  [/—/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  [/\d+\s?(?:€|euros)/i, "aucun prix sur ces pages"],
];

for (const [quoi, html] of [
  ["ville", rendu],
  ["département", renduDept],
] as const) {
  for (const [motif, remede] of INTERDITS) {
    const trouve = html.match(motif);
    verifie(
      `${quoi} : interdit ${motif} absent`,
      trouve === null,
      trouve ? `trouvé « ${trouve[0]} » — à la place : ${remede}` : "",
    );
  }
}

/* La SEULE formulation de délai autorisée doit, elle, être présente. */
verifie(
  "« rappel dans l'heure » est la seule promesse de délai, et elle est tenue",
  /rappel(?:ons)? dans l'heure/i.test(rendu),
);

/* ======================= 11. une section sans donnée ne se rend pas du tout */

/* Aucun sur-titre de section alimentée par le corpus ne doit survivre à un
   contenu vide. La réassurance, elle, est écrite par la maquette : elle reste,
   et c'est voulu. */
const ECRITES_PAR_LA_MAQUETTE = new Set(["Réassurance"]);

for (const etiquette of ETIQUETTES) {
  const titre = surTitre(etiquette);
  if (!titre || ECRITES_PAR_LA_MAQUETTE.has(etiquette)) continue;
  verifie(
    `sans donnée, « ${titre} » ne se rend pas`,
    !renduVide.includes(titre),
    "un sur-titre orphelin est pire qu'une section absente",
  );
}

for (const titre of TITRES_FIXES) {
  verifie(`sans donnée, le H2 « ${titre} » ne se rend pas`, !renduVide.includes(titre));
}

verifie(
  "sans donnée, aucune carte ni aucun cadre vide",
  !renduVide.includes("border-radius:var(--rad);padding:24px 28px") &&
    !/<h2/.test(renduVide),
);

/* ============ 12. le formulaire de la maquette n'est PAS doublé par ce gabarit */

/* La maquette dessine un formulaire dans sa section 10. La route monte déjà
   `FormulaireBasDePage` sous ce gabarit : le rendre ici en aurait mis deux sur
   la page. Le contrôle fige la décision pour qu'elle ne se reprenne pas par
   distraction. */
verifie(
  "le gabarit ne dessine pas de second formulaire",
  !/<form[\s>]/.test(rendu) && !/<input[\s>]/.test(rendu),
  "le formulaire de la page est celui que la route monte",
);

console.log(`${controles} contrôles passés.`);
console.log(
  `  ${ETIQUETTES.length} sections relevées dans maquette/gabarit-04-ville.html,` +
    ` ${ETIQUETTES.length - [...SANS_SOURCE.keys()].length} portées en entier.`,
);
