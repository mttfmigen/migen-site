/**
 * Contrôle du gabarit DÉPARTEMENT, sans navigateur.
 *
 *   bun components/site/implantation/verification-implantation.tsx
 *
 * LA VILLE N'EST PLUS ICI (08/10) : elle était contrôlée contre le bloc
 * `isVille` de `accueil-rendu.html`, un écran de démonstration qui n'est le
 * gabarit d'aucune page. Elle a son contrôle propre, page par page contre sa
 * capture : `verification-ville.tsx`.
 *
 * CE QU'IL VÉRIFIE, et pourquoi chacun :
 *
 *   1. LES VALEURS VIENNENT DE LA MAQUETTE. Elles sont RELUES dans
 *      `maquette/accueil-rendu.html` à chaque exécution, jamais écrites de
 *      mémoire ici. Chaque valeur est cherchée des DEUX côtés : dans le bloc de
 *      la maquette, et dans le HTML rendu. Une note de lecture peut se tromper
 *      et personne ne peut la rejouer ; ce fichier-ci se rejoue.
 *   2. UN SEUL H1 par page.
 *   3. AUCUN `href="#"`. La maquette en est pleine, sa navigation étant pilotée
 *      par sa propre logique, qui n'est pas portée. Un lien vers nulle part sur
 *      quarante-deux pages référencées est un défaut, pas un détail.
 *   4. AUCUNE classe de couleur Tailwind, AUCUNE variante `dark:`. La charte
 *      vit dans des jetons, et le site n'a pas de mode sombre.
 *   5. LES INTERDITS DE COPIE DU CONTRAT sont absents du rendu. Ils gagnent
 *      CONTRE la maquette, qui en écrit plusieurs dans ces deux gabarits.
 *   6. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. Pas de cadre vide, pas
 *      de titre orphelin, pas de texte de remplissage.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuDepartement } from "@/types/implantation";

import PageDepartement from "./PageDepartement";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* ------------------------------------------------------------- la maquette, relue */

const MAQUETTE = readFileSync(
  join(RACINE, "maquette", "accueil-rendu.html"),
  "utf8",
).split("\n");

/**
 * Le texte, normalisé avant toute comparaison.
 *
 * SANS CELA, LE CONTRÔLE NE VOIT RIEN. La maquette écrit « sous 24&nbsp;h » et
 * « 48&nbsp;h » avec une entité ; React, lui, rend l'espace insécable comme le
 * CARACTÈRE U+00A0. Chercher « sous 24 h » avec une espace ordinaire ne trouve
 * ni l'un ni l'autre, et un interdit de copie passerait en silence sur
 * quarante-deux pages. Même chose pour l'apostrophe typographique, que le
 * corpus et la maquette mélangent avec l'apostrophe droite.
 *
 * ET L'APOSTROPHE EST ÉCHAPPÉE PAR REACT. `renderToStaticMarkup` rend
 * « l'heure » en « l&#x27;heure ». Chercher « rappel dans l'heure » dans le HTML
 * ne le trouve donc jamais, et c'est la SEULE formulation de délai que le
 * contrat autorise : un contrôle aveugle à elle ne sait pas distinguer la seule
 * phrase permise de celles qui sont interdites. Seules les apostrophes sont
 * décodées, pas `&lt;` ni `&gt;` : les décoder fabriquerait de fausses balises
 * et fausserait le comptage des H1.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;|\u00A0/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/[\u2019\u2018]/g, "'");
}

/**
 * Le bloc d'un gabarit, découpé sur ses marqueurs `sc-if` plutôt que sur des
 * numéros de ligne : le fichier peut être réextrait, les numéros bougeraient et
 * le contrôle vérifierait alors le mauvais bloc en silence.
 */
function blocMaquette(drapeau: string): string {
  const debut = MAQUETTE.findIndex(
    (ligne) => ligne.startsWith(`<sc-if value="{{ ${drapeau} }}"`),
  );
  assert.ok(debut > -1, `le bloc « ${drapeau} » est introuvable dans la maquette`);
  const fin = MAQUETTE.findIndex(
    (ligne, i) => i > debut && ligne.startsWith("</sc-if>"),
  );
  assert.ok(fin > debut, `le bloc « ${drapeau} » n'est pas refermé`);
  return normalise(MAQUETTE.slice(debut, fin + 1).join("\n"));
}

const BLOC_DEPT = blocMaquette("isDept");

/* Le bloc trouvé est-il le bon ? Son étiquette d'écran le dit, et c'est ce qui
   empêche de valider un gabarit voisin par accident. */
assert.ok(
  BLOC_DEPT.includes('data-screen-label="Gabarit département"'),
  "le bloc isDept doit être celui du gabarit département",
);

/* ------------------------------------------------------------------ les données */

/** Une page de département complète. Textes inventés POUR LE CONTRÔLE : il teste le gabarit, pas le corpus. */
const DEPARTEMENT: ContenuDepartement = {
  gabarit: "departement",
  chapeau: "Notre département historique.",
  actions: [{ libelle: "Chiffrer mon besoin", href: "#formulaire" }],
  reperes: [{ valeur: "+ 120", libelle: "clients industriels" }],
  autresSurtitre: "Les autres départements",
  autres: [{ libelle: "Gironde", href: "/implantations/toulouse/gironde/" }],
  appelTitre: "Un site dans ce département ?",
  appelTexte: "Donnez-nous l'adresse et le besoin.",
  appelBouton: { libelle: "Faire venir un technicien", href: "#formulaire" },
  reste: [
    {
      type: "garanties",
      puces: [{ accroche: "Des propos vérifiables", texte: "Rien d'autre." }],
    },
  ],
};

const renduDept = normalise(renderToStaticMarkup(
  <PageDepartement titre="Maintenance industrielle dans le Rhône" contenu={DEPARTEMENT} />,
));

/* ------------------------------------------- 1. les valeurs viennent de la maquette */

/** Ce qu'on vérifie, la déclaration telle que la MAQUETTE l'écrit, et telle que React la REND. */
type Valeur = readonly [string, string, string];

const VALEURS_DEPT: readonly Valeur[] = [
  ["le hero est à deux colonnes", "grid-template-columns:1.1fr .9fr", "grid-template-columns:1.1fr .9fr"],
  ["le panneau d'appel a le grand rayon", "border-radius:36px", "border-radius:36px"],
  ["le panneau d'appel respire 52", "padding:52px", "padding:52px"],
  ["son titre monte à 36px", "clamp(24px,2.5vw,36px)", "clamp(24px,2.5vw,36px)"],
  ["son paragraphe est en 16.5px", "font:400 16.5px/1.6 var(--fb)", "font:400 16.5px/1.6 var(--fb)"],
  ["une pastille est une pilule", "border-radius:999px", "border-radius:999px"],
];

for (const [quoi, dansLaMaquette, dansLeRendu] of VALEURS_DEPT) {
  assert.ok(
    BLOC_DEPT.includes(dansLaMaquette),
    `département : « ${dansLaMaquette} » n'est PLUS dans la maquette (${quoi}). ` +
      `Le contrôle est périmé : relisez le bloc avant de le corriger.`,
  );
  assert.ok(
    renduDept.includes(dansLeRendu),
    `département : ${quoi}. La maquette écrit « ${dansLaMaquette} », le rendu ne porte pas « ${dansLeRendu} ».`,
  );
}

/* ------------------------------------------------------------------- 2. un seul h1 */

assert.equal((renduDept.match(/<h1[\s>]/g) ?? []).length, 1, "le gabarit département doit porter exactement un h1");

/* ---------------------------------------------------------- 3. aucun lien mort */

assert.ok(!renduDept.includes('href="#"'), 'le gabarit département ne doit porter aucun href="#"');
assert.ok(
  !/href="(?:javascript:|\/\/|https?:)/.test(renduDept),
  "le gabarit département ne doit rendre aucune cible hors du domaine",
);

/* ------------------------------------------- 4. aucune couleur Tailwind d'échafaudage */

const MES_FICHIERS = [
  "components/site/implantation/PageVille.tsx",
  "components/site/implantation/PageDepartement.tsx",
  "components/site/implantation/PageVille.module.css",
  "components/site/implantation/QuestionsVille.tsx",
  "components/site/implantation/HubLocal.tsx",
  "components/site/implantation/MaillageVille.tsx",
  "components/site/implantation/ProblemeCartes.tsx",
  "types/implantation.ts",
];

const COULEUR_TAILWIND =
  /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

for (const fichier of MES_FICHIERS) {
  const source = readFileSync(join(RACINE, fichier), "utf8");
  for (const classe of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const valeur = classe[1] ?? classe[2] ?? "";
    assert.ok(
      !COULEUR_TAILWIND.test(valeur),
      `${fichier} : « ${valeur} » porte une couleur Tailwind. La charte vit dans les jetons.`,
    );
    assert.ok(
      !/\bdark:/.test(valeur),
      `${fichier} : « ${valeur} » porte une variante dark:. Le site n'a pas de mode sombre.`,
    );
  }
  assert.ok(
    !/\bdark:[a-z-]+/.test(source),
    `${fichier} porte une variante dark: : le site n'a pas de mode sombre`,
  );
}

/* --------------------------------------------- 5. les interdits de copie du contrat */

/**
 * Ils GAGNENT contre la maquette. « Écully », « +200 » et « 200 clients » ne
 * sont plus interdits : le client a tranché le 07/10 (siège à Écully, +200
 * clients sans « réguliers »), voir CLAUDE.md §1 et la passation.
 */
const INTERDITS: readonly string[] = [
  "sous 24",
  "sous 48",
  "48 h",
  "24 h",
  "5 agences",
  // La maquette écrit « 5 » et « agences en France » dans deux div séparés,
  // ligne 3985 : le contrat en compte QUATRE, et aucune autre en France.
  "agences en France",
  "régie",
  "Régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "Découvrez",
  "Limonest",
  "réguliers",
  "—",
];

for (const interdit of INTERDITS) {
  assert.ok(!renduDept.includes(interdit), `le gabarit département rend « ${interdit} », interdit par le contrat`);
}

/* Ce que la maquette, elle, écrit : la preuve que ces interdits ne sont pas théoriques. */
for (const interdit of ["sous 24"]) {
  assert.ok(
    BLOC_DEPT.includes(interdit),
    `« ${interdit} » n'est plus dans isDept : ce garde-fou n'a plus d'objet, retirez-le`,
  );
}

/* ------------------------- 6. le texte du corpus hors maquette n'est pas perdu */

assert.ok(
  renduDept.includes("Des propos vérifiables"),
  "les sections du corpus hors maquette sont rendues sous le gabarit département",
);

console.log(
  `gabarit département : toutes les vérifications passent (${VALEURS_DEPT.length} valeurs relues dans la maquette).`,
);
