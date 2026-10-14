/**
 * LE TABLEAU RESTE DANS LE DOM MOBILE, ET IL S'Y REND EN CARTES.
 *
 *   bun components/site/blocs/verification-tableau-mobile.tsx
 *   bun components/site/blocs/verification-tableau-mobile.tsx --controle
 *
 * CE QU'ELLE PROUVE. Le LISEZMOI de la maquette mobile v2 : « tableau : une
 * carte par ligne », et la règle qui prime sur tout : « replier, jamais
 * retirer ». Le portage choisi ici ne duplique rien et ne masque rien : c'est
 * LE MÊME balisage qu'au bureau, restylé par les classes `tableauEnCartes`,
 * `enteteDeTableau` et `carteDeLigne` de `Blocs.module.css`, lesquelles ne
 * portent des règles QUE sous `@media (max-width: 880px)`. Quatre verdicts :
 *
 *   1. AUCUNE CELLULE NE QUITTE LE DOM : chaque chaîne du corpus passée au
 *      bloc est dans le texte rendu. Le DOM étant le même aux deux largeurs,
 *      c'est la preuve pour le téléphone ET pour Google.
 *   2. LES CARTES SONT POSÉES : chaque conteneur de tableau porte son
 *      attribut d'enveloppe, sa ligne d'en-têtes le sien, et chaque ligne de
 *      données le sien, en nombre exact.
 *   3. LA COUTURE TIENT : dans la source d'`Offre.tsx`, chaque attribut vit
 *      sur le MÊME élément que sa classe de module. Un nom de classe de
 *      module est haché au build et vide sous `bun` : l'attribut est la prise
 *      de mesure, la classe est le style, et les deux doivent être cousus.
 *   4. LA FEUILLE NE TRICHE PAS : les trois classes vivent dans le media
 *      880 px et nulle part ailleurs (au-dessus de 881 px, RIEN ne change),
 *      et aucune de leurs règles ne masque le texte (`display: none` et
 *      consorts sont refusés : masquer n'est pas mettre en cartes).
 *
 * POURQUOI HORS NAVIGATEUR. Mesuré le 14/10 sur les 158 adresses de la
 * production : ZÉRO page ne rend une `<section data-bloc>`. Le gabarit de
 * vente générique n'est le chemin de rendu d'aucune page servie, il n'existe
 * donc aucune page réelle où ouvrir ce tableau. C'est l'idiome du dossier
 * (`verification-repli-blocs.tsx`) : `renderToStaticMarkup` et des verdicts
 * purs, éprouvés sur du balisage fabriqué pour échouer.
 *
 * LE TÉMOIN (`--controle`) porte le contrôle négatif du lot : un tableau
 * retiré du DOM mobile, le motif `sc-if` de la maquette, fait tomber la
 * porte, et elle nomme les cellules perdues.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import type { SectionOffre } from "@/types/contenu";

import Offre from "./Offre";

const CONTROLE = process.argv.slice(2).includes("--controle");
const DOSSIER = dirname(fileURLToPath(import.meta.url));

/**
 * Les trois rôles du motif : la classe (source de la feuille, hachée au
 * build) et l'attribut de mesure posé sur le même élément.
 */
const ROLES = [
  { role: "enveloppe", classe: "tableauEnCartes", attribut: "data-tableau-en-cartes" },
  { role: "en-têtes", classe: "enteteDeTableau", attribut: "data-entete-de-tableau" },
  { role: "carte", classe: "carteDeLigne", attribut: "data-carte-de-ligne" },
] as const;

/* ------------------------------------------------------------------ verdicts
 *
 * Des fonctions pures sur des chaînes : le témoin peut donc les éprouver sur
 * du balisage, des sources et des feuilles écrits exprès de travers.
 */

/** Le texte nu du balisage, normalisé comme le reste du dépôt (piège n° 3). */
export function texteNu(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/ /g, " ")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * LE VERDICT QUI COMPTE : les cellules absentes du texte rendu, nommées.
 * Un tableau « disparu du DOM mobile » est exactement une liste non vide ici.
 */
export function cellulesPerdues(html: string, cellules: readonly string[]): string[] {
  const texte = texteNu(html);
  return cellules.filter((c) => !texte.includes(c));
}

/** Nombre d'occurrences d'une sous-chaîne, sans l'état partagé d'un `exec`. */
function compte(texte: string, aiguille: string): number {
  return aiguille ? texte.split(aiguille).length - 1 : 0;
}

/** Ce qui manque aux cartes du balisage : des attributs mal comptés. */
export function defautsDeCartes(
  html: string,
  attendu: { enveloppes: number; cartes: number },
): string[] {
  const defauts: string[] = [];
  const enveloppes = compte(html, "data-tableau-en-cartes");
  const entetes = compte(html, "data-entete-de-tableau");
  const cartes = compte(html, "data-carte-de-ligne");
  if (enveloppes !== attendu.enveloppes) {
    defauts.push(`${enveloppes} enveloppe(s) de tableau, ${attendu.enveloppes} attendue(s)`);
  }
  if (entetes !== attendu.enveloppes) {
    defauts.push(`${entetes} ligne(s) d'en-têtes, une par enveloppe attendue`);
  }
  if (cartes !== attendu.cartes) {
    defauts.push(`${cartes} carte(s) de ligne, ${attendu.cartes} attendue(s)`);
  }
  return defauts;
}

/**
 * La couture classe-attribut dans la source du composant : chaque attribut de
 * mesure doit vivre dans la MÊME balise ouvrante que sa classe de module.
 * Sans elle, la porte compterait des attributs posés sur des éléments que la
 * feuille ne style plus.
 */
export function defautsDeCouture(source: string): string[] {
  const defauts: string[] = [];
  for (const { classe, attribut } of ROLES) {
    /* Une balise ouvrante, de `<` à `>` : les objets de style contiennent des
       accolades mais jamais de chevron fermant. */
    const balises = source.match(/<[a-z][^>]*>/gi) ?? [];
    const cousues = balises.filter(
      (b) => b.includes(`styles.${classe}`) && b.includes(attribut),
    );
    const classeSeule = balises.filter(
      (b) => b.includes(`styles.${classe}`) && !b.includes(attribut),
    );
    const attributSeul = balises.filter(
      (b) => b.includes(attribut) && !b.includes(`styles.${classe}`),
    );
    if (cousues.length === 0) {
      defauts.push(`aucune balise ne porte à la fois styles.${classe} et ${attribut}`);
    }
    if (classeSeule.length > 0) {
      defauts.push(`styles.${classe} posé sans son attribut de mesure ${attribut}`);
    }
    if (attributSeul.length > 0) {
      defauts.push(`${attribut} posé sans sa classe styles.${classe} : élément non stylé`);
    }
  }
  return defauts;
}

/** Les blocs `@media` dont la condition vérifie `motif`, par comptage d'accolades. */
export function blocsMedia(css: string, motif: RegExp): string[] {
  const blocs: string[] = [];
  let i = 0;
  for (;;) {
    const m = css.slice(i).match(/@media[^{]*\{/);
    if (!m || m.index === undefined) return blocs;
    const debut = i + m.index + m[0].length;
    let profondeur = 1;
    let j = debut;
    while (j < css.length && profondeur > 0) {
      if (css[j] === "{") profondeur += 1;
      else if (css[j] === "}") profondeur -= 1;
      j += 1;
    }
    if (motif.test(m[0])) blocs.push(css.slice(debut, j - 1));
    i = j;
  }
}

/** La feuille SANS ses blocs `@media` : ce que le bureau reçoit en plus du tronc. */
export function horsMedia(css: string): string {
  let resultat = "";
  let i = 0;
  for (;;) {
    const m = css.slice(i).match(/@media[^{]*\{/);
    if (!m || m.index === undefined) return resultat + css.slice(i);
    resultat += css.slice(i, i + m.index);
    let profondeur = 1;
    let j = i + m.index + m[0].length;
    while (j < css.length && profondeur > 0) {
      if (css[j] === "{") profondeur += 1;
      else if (css[j] === "}") profondeur -= 1;
      j += 1;
    }
    i = j;
  }
}

/**
 * Ce qui manque à la feuille : une classe hors du media 880 px (le bureau
 * changerait), absente du media (pas de cartes), ou une règle qui MASQUE le
 * texte au lieu de le mettre en cartes.
 */
export function defautsDeFeuille(css: string): string[] {
  const defauts: string[] = [];
  const mobile = blocsMedia(css, /max-width:\s*880px/).join("\n");
  const bureau = horsMedia(css);

  for (const { classe } of ROLES) {
    if (!mobile.includes(`.${classe}`)) {
      defauts.push(`.${classe} absente du media (max-width: 880px) : pas de cartes sur téléphone`);
    }
    if (bureau.includes(`.${classe}`)) {
      defauts.push(`.${classe} porte des règles HORS media : au-dessus de 881 px rien ne doit changer`);
    }
  }

  /* Règle par règle du media : une déclaration qui masque, sur un sélecteur
     du motif, est refusée. Masquer garderait le texte dans le DOM mais
     contredirait le motif : les cartes doivent être PEINTES. */
  for (const regle of mobile.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selecteur, corps] = regle;
    if (!ROLES.some(({ classe }) => selecteur.includes(`.${classe}`))) continue;
    if (/display\s*:\s*none|visibility\s*:\s*hidden|content-visibility/.test(corps)) {
      defauts.push(`« ${selecteur.trim()} » masque son contenu : masquer n'est pas mettre en cartes`);
    }
  }
  return defauts;
}

/* ------------------------------------------------------------------ fixtures
 *
 * Chaque chaîne porte un jalon unique T## : une cellule perdue est nommée,
 * pas seulement comptée. Données fabriquées pour l'épreuve, jamais rendues à
 * un visiteur.
 */

const OFFRE_COMPLETE: SectionOffre = {
  type: "offre",
  titre: "T00 ce que nous faisons",
  intro: "T0a le périmètre est écrit",
  lignes: [
    { prestation: { accroche: "T01 le relevé", texte: "T02 sur site" }, benefice: "T03 un plan" },
    { prestation: { texte: "T04 prestation seule" }, benefice: "T05 un bénéfice" },
  ],
  tableau: {
    entetes: ["T06 critère", "T07 avant", "T08 avec nous"],
    lignes: [
      ["T09 délai", "T10 huit jours", "T11 une heure"],
      ["T12 suivi", "T13 aucun", "T14 un rapport"],
    ],
  },
  prose: [{ texte: "T15 la prose de fin" }],
};

/** Un tableau seul, sans duo : l'enveloppe du comparatif se compte à part. */
const OFFRE_TABLEAU_SEUL: SectionOffre = {
  type: "offre",
  lignes: [],
  tableau: { entetes: ["T20 critère", "T21 valeur"], lignes: [["T22 bruit", "T23 mesuré"]] },
};

/** Toutes les chaînes du corpus d'une fixture, aplaties. */
function jalonsDe(valeur: unknown): string[] {
  const trouves: string[] = [];
  const parcours = (v: unknown): void => {
    if (typeof v === "string") {
      for (const j of v.match(/T\w\w/g) ?? []) trouves.push(j);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(parcours);
      return;
    }
    if (v && typeof v === "object") Object.values(v).forEach(parcours);
  };
  parcours(valeur);
  return [...new Set(trouves)];
}

const FEUILLE = readFileSync(join(DOSSIER, "Blocs.module.css"), "utf8");
const SOURCE_OFFRE = readFileSync(join(DOSSIER, "Offre.tsx"), "utf8");
const HTML_COMPLET = renderToStaticMarkup(<Offre section={OFFRE_COMPLETE} />);

/* -------------------------------------------------------------------- témoin
 *
 * D'ABORD la preuve que les verdicts savent refuser : chacun tourne sur un
 * défaut fabriqué. Une porte qui n'a jamais échoué ne prouve rien.
 */

const EPREUVES = [
  {
    nom: "LE CONTRÔLE NÉGATIF DU LOT : un tableau disparu du DOM mobile fait tomber la porte",
    fait: () => {
      /* Le motif `sc-if` de la maquette, reproduit : les lignes du tableau
         retirées du balisage. Les cartes ne contiennent pas de <div> : le
         non-glouton s'arrête à la bonne fermeture. */
      const ampute = HTML_COMPLET.replace(
        /<div[^>]*data-carte-de-ligne[^>]*>[\s\S]*?<\/div>/g,
        "",
      );
      const perdues = cellulesPerdues(ampute, jalonsDe(OFFRE_COMPLETE));
      return perdues.length > 0 && perdues.includes("T09");
    },
  },
  {
    nom: "une seule cellule retirée est signalée, et nommée",
    fait: () => {
      const perdues = cellulesPerdues(HTML_COMPLET.replace("T13 aucun", ""), ["T13", "T14"]);
      return perdues.length === 1 && perdues[0] === "T13";
    },
  },
  {
    nom: "une ligne sans son attribut de carte est refusée",
    fait: () =>
      defautsDeCartes(HTML_COMPLET.replace("data-carte-de-ligne", "data-rien"), {
        enveloppes: 2,
        cartes: 4,
      }).length > 0,
  },
  {
    nom: "une classe posée sans son attribut de mesure est refusée dans la source",
    fait: () =>
      defautsDeCouture(SOURCE_OFFRE.replace(/\s*data-carte-de-ligne=""/g, "")).length > 0,
  },
  {
    nom: "un attribut posé sans sa classe est refusé aussi : il ne serait pas stylé",
    fait: () =>
      defautsDeCouture(SOURCE_OFFRE.replace(/\$\{styles\.carteDeLigne\}/g, "")).length > 0,
  },
  {
    nom: "une feuille sans le media 880 px est refusée",
    fait: () => defautsDeFeuille(".tableauEnCartes { display: grid }").length > 0,
  },
  {
    nom: "une classe du motif posée HORS media ferait bouger le bureau : refusée",
    fait: () => defautsDeFeuille(`${FEUILLE}\n.carteDeLigne { margin: 0; }`).length > 0,
  },
  {
    nom: "un tableau MASQUÉ sur mobile n'est pas un tableau en cartes : refusé",
    fait: () =>
      defautsDeFeuille(
        "@media (max-width: 880px) { .tableauEnCartes { display: grid } " +
          ".tableauEnCartes > .enteteDeTableau { display: flex } " +
          ".tableauEnCartes > .carteDeLigne { display: none } }",
      ).length > 0,
  },
  {
    nom: "NÉGATIF : le balisage, la source et la feuille conformes ne déclenchent rien",
    fait: () =>
      cellulesPerdues(HTML_COMPLET, jalonsDe(OFFRE_COMPLETE)).length === 0 &&
      defautsDeCartes(HTML_COMPLET, { enveloppes: 2, cartes: 4 }).length === 0 &&
      defautsDeCouture(SOURCE_OFFRE).length === 0 &&
      defautsDeFeuille(FEUILLE).length === 0,
  },
  {
    nom: "NÉGATIF : un media 880 px voisin qui masque AUTRE CHOSE n'accuse pas le motif",
    fait: () =>
      defautsDeFeuille(`${FEUILLE}\n@media (max-width: 880px) { .autreChose { display: none } }`)
        .length === 0,
  },
];

let reussies = 0;
for (const e of EPREUVES) {
  const juste = e.fait();
  if (juste) reussies += 1;
  console.log(`  ${juste ? "OK   " : "ÉCHEC"}  ${e.nom}`);
}
console.log(`\ntémoin : ${reussies}/${EPREUVES.length} épreuves réussies\n`);
assert.equal(reussies, EPREUVES.length, "le témoin doit réussir avant tout contrôle");

if (CONTROLE) process.exit(0);

/* --------------------------------------------------------------- le contrôle */

const CAS = [
  { nom: "offre complète, duo + comparatif", section: OFFRE_COMPLETE, enveloppes: 2, cartes: 4 },
  { nom: "comparatif seul, sans duo", section: OFFRE_TABLEAU_SEUL, enveloppes: 1, cartes: 1 },
];

for (const cas of CAS) {
  const html = renderToStaticMarkup(<Offre section={cas.section} />);
  const perdues = cellulesPerdues(html, jalonsDe(cas.section));
  const cartes = defautsDeCartes(html, {
    enveloppes: cas.enveloppes,
    cartes: cas.cartes,
  });
  assert.deepEqual(
    perdues,
    [],
    `« ${cas.nom} » : cellule(s) absente(s) du DOM (${perdues.join(", ")})`,
  );
  assert.deepEqual(cartes, [], `« ${cas.nom} » : ${cartes.join(", ")}`);
  console.log(
    `  OK     ${cas.nom.padEnd(32)} ${jalonsDe(cas.section).length} chaîne(s) dans le DOM, ` +
      `${cas.cartes} carte(s)`,
  );
}

const couture = defautsDeCouture(SOURCE_OFFRE);
assert.deepEqual(couture, [], `Offre.tsx : ${couture.join(", ")}`);
console.log("  OK     Offre.tsx : chaque attribut de mesure est cousu à sa classe");

const feuille = defautsDeFeuille(FEUILLE);
assert.deepEqual(feuille, [], `Blocs.module.css : ${feuille.join(", ")}`);
console.log("  OK     Blocs.module.css : cartes sous 880 px, rien hors media, rien de masqué");

console.log("\nLE_TABLEAU_RESTE_DANS_LE_DOM_MOBILE_EN_CARTES");
