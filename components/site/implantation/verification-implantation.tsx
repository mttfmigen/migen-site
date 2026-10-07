/**
 * Contrôle des gabarits VILLE et DÉPARTEMENT, sans navigateur.
 *
 *   bun components/site/implantation/verification-implantation.tsx
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

import type { ContenuDepartement, ContenuVille } from "@/types/implantation";

import PageDepartement from "./PageDepartement";
import PageVille from "./PageVille";

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

const BLOC_VILLE = blocMaquette("isVille");
const BLOC_DEPT = blocMaquette("isDept");

/* Le bloc trouvé est-il le bon ? Son étiquette d'écran le dit, et c'est ce qui
   empêche de valider un gabarit voisin par accident. */
assert.ok(
  BLOC_VILLE.includes('data-screen-label="SEO service + ville"'),
  "le bloc isVille doit être celui du gabarit service + ville",
);
assert.ok(
  BLOC_DEPT.includes('data-screen-label="Gabarit département"'),
  "le bloc isDept doit être celui du gabarit département",
);

/* ------------------------------------------------------------------ les données */

/**
 * Une page de ville complète. Les textes sont courts et inventés POUR LE
 * CONTRÔLE : ce fichier teste le gabarit, pas le corpus. La complétude du
 * corpus est contrôlée ailleurs, par `scripts/fabrique_gabarits_implantation.mjs`,
 * qui compare chaîne par chaîne ce qu'il a lu et ce qu'il a écrit.
 */
const VILLE: ContenuVille = {
  gabarit: "ville",
  surtitre: "Rhône, Grand Lyon",
  chapeau: "Des techniciens mobilisés, et un [contrat](/offres/zero-arret/) qui tient.",
  actions: [{ libelle: "Chiffrer mon besoin", href: "#formulaire" }],
  panneauSurtitre: "Notre présence",
  adresse: ["129 chemin du Moulin Carron", "69130 Écully"],
  reperes: [
    { valeur: "10 %", libelle: "des candidats retenus" },
    { valeur: "4", libelle: "agences", detail: "Aucune sur place, des techniciens qui s'y déplacent" },
  ],
  contact: "Rappel dans l'heure, du lundi au vendredi.",
  constatTexte: "Une ligne à l'arrêt un vendredi soir.",
  constatPuces: [{ accroche: "Pas d'équipe à demeure.", texte: "L'arrêt se paie comptant." }],
  reponseTexte: "Une équipe déjà sur place.",
  reponsePuces: [{ accroche: "Des propos vérifiables", texte: "Du travail contrôlable." }],
  faq: [{ question: "Intervenez-vous partout ?", reponse: "Oui, sur tout le bassin." }],
  autres: [
    { libelle: "Nantes", href: "/implantations/nantes/" },
    // Cible hors domaine : le lien doit DISPARAÎTRE, pas être rafistolé.
    { libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
  reste: [
    {
      type: "deroule",
      etapes: [{ titre: "Le contact", texte: "Rappel dans l'heure aux horaires ouvrés." }],
    },
  ],
};

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

const renduVille = normalise(renderToStaticMarkup(
  <PageVille titre="Maintenance industrielle à Lyon" contenu={VILLE} />,
));
const renduDept = normalise(renderToStaticMarkup(
  <PageDepartement titre="Maintenance industrielle dans le Rhône" contenu={DEPARTEMENT} />,
));

/**
 * La MÊME page, avec les trois titres de section que la maquette dessine.
 *
 * POURQUOI UNE SECONDE VARIANTE. Aucune des quarante-deux pages du corpus ne
 * fournit `constatTitre`, `reponseTitre` ni `faqTitre` : le corpus n'écrit pas
 * de titre court pour ces colonnes. Ces trois H2 sont donc absents du site
 * aujourd'hui, et les valeurs que la maquette leur donne ne seraient vérifiées
 * par rien. Les contrôler ici garde la mesure juste pour le jour où une source
 * les fournit, au lieu de laisser trois échelles non relues dans l'habillage.
 */
const renduVilleTitree = normalise(renderToStaticMarkup(
  <PageVille
    titre="Maintenance industrielle à Lyon"
    contenu={{
      ...VILLE,
      constatTitre: "Les profils qualifiés partent vite",
      reponseTitre: "Une équipe déjà sur place",
      faqTitre: "Maintenance industrielle à Lyon",
    }}
  />,
));

/* ------------------------------------------- 1. les valeurs viennent de la maquette */

/**
 * Chaque entrée : ce qu'on vérifie, la déclaration telle que la MAQUETTE
 * l'écrit, et telle que React la REND. Les deux formes diffèrent parfois, React
 * suffixant les nombres en `px` et normalisant la casse des propriétés : les
 * noter séparément évite de maquiller la comparaison pour la faire passer.
 */
type Valeur = readonly [string, string, string];

const VALEURS_VILLE: readonly Valeur[] = [
  // Le panneau du hero.
  ["le panneau respire 30/32/32", "padding:30px 32px 32px", "padding:30px 32px 32px"],
  ["la rue est en 16px de titre", "font:600 16px var(--ft)", "font:600 16px var(--ft)"],
  ["le petit texte du panneau", "font:400 14.5px/1.55 var(--fb)", "font:400 14.5px/1.55 var(--fb)"],
  ["le filet est un trait de 1px", "background:var(--line)", "background:var(--line)"],
  ["les repères tiennent sur 18", "gap:18px", "gap:18px"],
  ["la valeur d'un repère est en 22px", "font:600 22px var(--ft)", "font:600 22px var(--ft)"],
  ["le libellé d'un repère", "font:400 12.5px var(--fb)", "font:400 12.5px var(--fb)"],
  ["le hero est à deux colonnes", "grid-template-columns:1.1fr .9fr", "grid-template-columns:1.1fr .9fr"],
  // Le vis-à-vis.
  ["le vis-à-vis respire 70", "gap:70px", "gap:70px"],
  ["son paragraphe est en 16.5px", "font:400 16.5px/1.7 var(--fb)", "font:400 16.5px/1.7 var(--fb)"],
  ["la liste respire 9", "gap:9px", "gap:9px"],
  ["une ligne de liste respire 11", "gap:11px", "gap:11px"],
  ["une ligne de liste est en 15px", "font:400 15px/1.5 var(--fb)", "font:400 15px/1.5 var(--fb)"],
  ["la marque de liste ne se comprime pas", "flex:none", "flex:none"],
  // Les questions fréquentes.
  ["les cartes respirent 12", "gap:12px", "gap:12px"],
  ["une carte a le petit rayon", "border-radius:var(--rad-s)", "border-radius:var(--rad-s)"],
  ["une carte respire 24/28", "padding:24px 28px", "padding:24px 28px"],
  ["la question est en 16.5px", "font:600 16.5px var(--ft)", "font:600 16.5px var(--ft)"],
  ["la réponse est en 15px", "font:400 15px/1.65 var(--fb)", "font:400 15px/1.65 var(--fb)"],
  ["la réponse ne dépasse pas 80ch", "max-width:80ch", "max-width:80ch"],
  // Les autres villes.
  ["l'en-tête aligne sur la ligne de base", "align-items:baseline", "align-items:baseline"],
  ["l'en-tête écarte ses deux bouts", "justify-content:space-between", "justify-content:space-between"],
  ["une pastille est une pilule", "border-radius:999px", "border-radius:999px"],
];

/**
 * Les valeurs des trois titres de section, vérifiées sur la variante titrée.
 * Le corpus ne les remplit pas : voir `renduVilleTitree`.
 */
const VALEURS_TITRES: readonly Valeur[] = [
  ["le titre d'une colonne monte à 42px", "clamp(28px,3vw,42px)", "clamp(28px,3vw,42px)"],
  ["il se resserre à 22ch", "max-width:22ch", "max-width:22ch"],
  ["le titre des questions monte à 48px", "clamp(30px,3.3vw,48px)", "clamp(30px,3.3vw,48px)"],
  ["il se resserre à 24ch", "max-width:24ch", "max-width:24ch"],
];

const VALEURS_DEPT: readonly Valeur[] = [
  ["le hero est à deux colonnes", "grid-template-columns:1.1fr .9fr", "grid-template-columns:1.1fr .9fr"],
  ["le panneau d'appel a le grand rayon", "border-radius:36px", "border-radius:36px"],
  ["le panneau d'appel respire 52", "padding:52px", "padding:52px"],
  ["son titre monte à 36px", "clamp(24px,2.5vw,36px)", "clamp(24px,2.5vw,36px)"],
  ["son paragraphe est en 16.5px", "font:400 16.5px/1.6 var(--fb)", "font:400 16.5px/1.6 var(--fb)"],
  ["une pastille est une pilule", "border-radius:999px", "border-radius:999px"],
];

for (const [quoi, dansLaMaquette, dansLeRendu, bloc, rendu, nom] of [
  ...VALEURS_VILLE.map((v) => [...v, BLOC_VILLE, renduVille, "ville"] as const),
  ...VALEURS_TITRES.map((v) => [...v, BLOC_VILLE, renduVilleTitree, "ville titrée"] as const),
  ...VALEURS_DEPT.map((v) => [...v, BLOC_DEPT, renduDept, "département"] as const),
]) {
  assert.ok(
    bloc.includes(dansLaMaquette),
    `${nom} : « ${dansLaMaquette} » n'est PLUS dans la maquette (${quoi}). ` +
      `Le contrôle est périmé : relisez le bloc avant de le corriger.`,
  );
  assert.ok(
    rendu.includes(dansLeRendu),
    `${nom} : ${quoi}. La maquette écrit « ${dansLaMaquette} », le rendu ne porte pas « ${dansLeRendu} ».`,
  );
}

/* Les surtitres de structure, pris dans la maquette eux aussi. */
for (const libelle of ["Le constat terrain", "Notre réponse", "Questions fréquentes", "Autres villes"]) {
  assert.ok(BLOC_VILLE.includes(`>${libelle}<`), `« ${libelle} » n'est plus dans la maquette`);
  assert.ok(renduVille.includes(libelle), `« ${libelle} » manque au rendu du gabarit ville`);
}

/* ------------------------------------------------------------------- 2. un seul h1 */

for (const [nom, rendu] of [["ville", renduVille], ["département", renduDept]] as const) {
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `le gabarit ${nom} doit porter exactement un h1`,
  );
}

assert.ok(
  renduVille.includes("Maintenance industrielle à Lyon"),
  "le titre de la page doit être rendu dans le h1",
);

/* Les questions fréquentes ne sont PAS des titres de niveau : six questions par
   page gonfleraient le plan de titres de la page. */
assert.equal(
  (renduVille.match(/<h2[\s>]/g) ?? []).length,
  0,
  "aucun h2 n'est rendu quand le corpus ne fournit pas de titre de section",
);

/* La variante titrée porte les trois H2 de la maquette, et toujours un seul H1. */
assert.equal(
  (renduVilleTitree.match(/<h1[\s>]/g) ?? []).length,
  1,
  "la variante titrée porte elle aussi un seul h1",
);
assert.equal(
  (renduVilleTitree.match(/<h2[\s>]/g) ?? []).length,
  3,
  "la variante titrée porte les trois h2 que la maquette dessine",
);

/* ---------------------------------------------------------- 3. aucun lien mort */

for (const [nom, rendu] of [["ville", renduVille], ["département", renduDept]] as const) {
  assert.ok(
    !rendu.includes('href="#"'),
    `le gabarit ${nom} ne doit porter aucun href="#" : la maquette en est pleine, pas le site`,
  );
  assert.ok(
    !/href="(?:javascript:|\/\/|https?:)/.test(rendu),
    `le gabarit ${nom} ne doit rendre aucune cible hors du domaine`,
  );
}

/* La maquette, elle, en porte : c'est bien ce dont on se garde. */
assert.ok(
  BLOC_VILLE.includes('href="#"'),
  "la maquette porte des href=\"#\" : si ce n'est plus vrai, ce garde-fou n'a plus d'objet",
);

assert.ok(!renduVille.includes("exemple.test"), "une cible hors domaine n'est jamais rendue");
assert.ok(!renduVille.includes(">Ailleurs<"), "un lien à cible refusée disparaît, libellé compris");

/* Le maillage du corpus écrit en Markdown sort en lien, pas en crochets. */
assert.ok(
  renduVille.includes('href="/offres/zero-arret') && !renduVille.includes("[contrat]"),
  "le chapeau doit passer par TexteRiche",
);

/* ------------------------------------------- 4. aucune couleur Tailwind d'échafaudage */

const MES_FICHIERS = [
  "components/site/implantation/PageVille.tsx",
  "components/site/implantation/PageDepartement.tsx",
  "components/site/implantation/habillage-implantation.ts",
  "components/site/implantation/PageVille.module.css",
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
 * Ils GAGNENT contre la maquette. Chacun est écrit dans l'un des deux blocs,
 * et c'est bien pour cela qu'il est listé : porter la maquette à la lettre
 * aurait reproduit « intervention sous 24 h », « 5 agences en France », « régie
 * ou forfait, sans engagement de volume » et l'adresse d'Écully.
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
  "+200",
  "200 clients",
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
  "Écully",
  "—",
];

for (const [nom, rendu] of [["ville", renduVille], ["département", renduDept]] as const) {
  for (const interdit of INTERDITS) {
    assert.ok(
      !rendu.includes(interdit),
      `le gabarit ${nom} rend « ${interdit} », interdit par le contrat`,
    );
  }
}

/* Ce que la maquette, elle, écrit : la preuve que ces interdits ne sont pas
   théoriques et que le portage a bien dû s'en écarter. */
for (const [interdit, bloc, nom] of [
  ["sous 24", BLOC_VILLE, "isVille"],
  ["48 h", BLOC_VILLE, "isVille"],
  ["agences en France", BLOC_VILLE, "isVille"],
  ["Écully", BLOC_VILLE, "isVille"],
  ["égie ou forfait", BLOC_VILLE, "isVille"],
  ["sans engagement", BLOC_VILLE, "isVille"],
  ["sous 24", BLOC_DEPT, "isDept"],
  ["Écully", BLOC_DEPT, "isDept"],
] as const) {
  assert.ok(
    bloc.includes(interdit),
    `« ${interdit} » n'est plus dans ${nom} : ce garde-fou n'a plus d'objet, retirez-le`,
  );
}

/* --------------------------------- 6. une section sans donnée ne se rend pas du tout */

const VIDE: ContenuVille = { gabarit: "ville" };
const renduVide = normalise(renderToStaticMarkup(
  <PageVille titre="Un titre seul" contenu={VIDE} />,
));

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
assert.ok(!renduVide.includes("<a "), "un contenu vide n'invente aucun lien");
assert.ok(!renduVide.includes("<h2"), "un contenu vide n'invente aucune section");
assert.ok(
  !renduVide.includes("Le constat terrain") &&
    !renduVide.includes("Questions fréquentes") &&
    !renduVide.includes("Autres villes"),
  "un surtitre de section ne se rend pas sans sa section",
);
assert.ok(
  !renduVide.includes("padding:30px 32px 32px"),
  "sans repères ni adresse ni contact, le panneau du hero ne se rend pas",
);
assert.ok(
  renduVide.includes("grid-template-columns:minmax(0,1fr)") &&
    !renduVide.includes("grid-template-columns:1.1fr .9fr"),
  "sans panneau, le hero tient sur une colonne au lieu de laisser une carte creuse",
);
assert.ok(
  !renduVide.includes("data-reveal"),
  "un contenu vide ne pose aucune section à révéler",
);

/* La section 2 de la maquette, le bandeau photo, n'est PAS rendue : le corpus
   ne fournit ni photographie ni liste de communes sur aucune des 42 pages. Elle
   est dessinée dans la maquette, et laissée vide ici en connaissance de cause. */
assert.ok(
  BLOC_VILLE.includes("height:400px") && BLOC_VILLE.includes("object-fit:cover"),
  "le bandeau photo est bien dessiné par la maquette, lignes 3993 à 4005",
);
assert.ok(
  !renduVille.includes("<img"),
  "le bandeau photo reste vide faute de source : aucune image de remplissage",
);

/* Le `reste` est rendu : le texte du corpus que la maquette ne montre pas ne se
   perd pas parce qu'il n'a pas de case. */
assert.ok(
  renduVille.includes("Le contact") && renduVille.includes("Rappel dans l'heure"),
  "les sections du corpus hors maquette sont rendues sous le gabarit ville",
);
assert.ok(
  renduDept.includes("Des propos vérifiables"),
  "les sections du corpus hors maquette sont rendues sous le gabarit département",
);

/* Le détail d'un repère, qui dit l'absence d'agence sur place, est rendu. */
assert.ok(
  renduVille.includes("Aucune sur place, des techniciens qui s'y déplacent"),
  "la précision d'un repère est rendue : sans elle, « 4 agences » laisse croire à une agence proche",
);

console.log(
  `gabarits ville et département : toutes les vérifications passent ` +
    `(${VALEURS_VILLE.length + VALEURS_TITRES.length + VALEURS_DEPT.length} valeurs relues dans la maquette).`,
);
