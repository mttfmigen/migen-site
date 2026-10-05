/**
 * Contrôle du gabarit OFFRE, sans navigateur.
 *
 *   bun components/site/offre/verification-offre.tsx
 *
 * CE CONTRÔLE A ÉTÉ RÉÉCRIT, et il faut savoir pourquoi. Sa version précédente
 * relisait `maquette/accueil-rendu.html` : elle prouvait fidèlement la
 * conformité au MAUVAIS fichier. Le fichier qui fait foi pour `/offres/<offre>/`
 * est « Migen - Gabarit 03 Offre.dc.html », versionné ici en
 * `maquette/gabarit-03-offre.html`. Un contrôle vert sur la mauvaise source est
 * pire qu'un contrôle absent : il a laissé dire trois fois que c'était porté.
 *
 * CE QUE CE CONTRÔLE GARANTIT, et pourquoi chaque point y est :
 *
 * 1. LES VALEURS DE LA MAQUETTE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire. Aucune chaîne attendue n'est affirmée ici sans
 *    avoir d'abord été trouvée dans le fichier de maquette.
 * 2. LES TREIZE SECTIONS Y SONT, DANS L'ORDRE DE LA MAQUETTE. C'est le cœur :
 *    quatre sections manquaient entièrement au site (logos clients,
 *    certifications, « Qui intervient chez vous », « Notre parti pris »).
 * 3. LE TRAITEMENT DE « VOTRE PROBLÉMATIQUE » est celui de la maquette : quatre
 *    cartes numérotées 01 à 04, et non une liste à puces.
 * 4. UN SEUL H1 par page.
 * 5. AUCUN `href="#"`. La maquette navigue par sa propre logique, non portée.
 * 6. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`.
 * 7. LES INTERDITS DE COPIE sont absents du rendu, prix et délais chiffrés
 *    compris. La maquette en porte, le contrat les refuse, le contrat gagne.
 * 8. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT, surtitre compris.
 * 9. LES DIX-HUIT PAGES RÉELLES sont rendues, pas seulement un cas d'école.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuOffre } from "@/types/offre";

import PageOffre from "./PageOffre";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* -------------------------------------------- la maquette, relue à chaque fois */

const MAQUETTE = readFileSync(
  join(RACINE, "maquette", "gabarit-03-offre.html"),
  "utf8",
);

assert.ok(
  MAQUETTE.includes('<main data-screen-label="Gabarit 03 Offre et prestation">'),
  "maquette/gabarit-03-offre.html n'est pas le gabarit 03 : fichier à revérifier",
);

/**
 * Une déclaration de style de la maquette, relevée par la valeur qui l'ouvre.
 *
 * POURQUOI : le contrôle doit comparer ce que le composant rend à ce que la
 * maquette écrit, sans qu'aucune des deux valeurs soit saisie à la main ici.
 */
function styleMaquette(fragment: string): string {
  assert.ok(
    MAQUETTE.includes(fragment),
    `la maquette ne porte pas « ${fragment} » : valeur à revérifier`,
  );
  return fragment;
}

/** Ce que la maquette écrit en toutes lettres, et qui doit se retrouver rendu. */
function copieMaquette(texte: string): string {
  assert.ok(
    MAQUETTE.includes(texte),
    `la maquette ne porte pas la copie « ${texte} »`,
  );
  return texte;
}

/**
 * Les sur-titres des treize sections, RELEVÉS dans la maquette, dans l'ordre.
 *
 * `data-screen-label` donne l'ordre, et le fichier donne le texte : aucune des
 * deux listes n'est écrite de mémoire. Deux sections (« 07 Appel » et « 10
 * Appel final ») n'ont pas de sur-titre dans la maquette, leur entrée est nulle.
 */
const SECTIONS_MAQUETTE = [...MAQUETTE.matchAll(/<section data-screen-label="([^"]+)"/g)].map(
  (m) => m[1],
);

assert.equal(
  SECTIONS_MAQUETTE.length,
  13,
  `la maquette dessine ${SECTIONS_MAQUETTE.length} sections, le gabarit en attend 13`,
);

/* ------------------------------------------------------- une page d'exemple */

/**
 * Une donnée d'exemple de la forme que l'import produit vraiment : les sept
 * types de sections que les dix-huit fichiers de
 * `supabase/import/gabarits-maquette/` portent, ni plus ni moins.
 */
const EXEMPLE: ContenuOffre = {
  gabarit: "offre",
  chapeau: "Le mécanisme, en une phrase.",
  mention: "Nous vous rappelons dans l'heure, du lundi au vendredi.",
  actions: [
    { libelle: "Les cinq offres", href: "/offres/" },
    { libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
  formulaireHeroTitre: "Décrire mon besoin",
  formulaireHeroMention: "Rappel dans l'heure",
  chiffres: [
    { valeur: "10 %", libelle: "des candidats retenus" },
    { valeur: "+ 80", libelle: "clients réguliers" },
  ],
  brefBande: "Besoin d'un technicien sur votre site ?",
  brefBouton: { libelle: "Parler à un chargé d'affaires", href: "#formulaire" },
  sections: [
    {
      type: "probleme",
      punchline: "Le poste reste vacant. Pendant ce temps, l'usine tourne à l'aveugle.",
      puces: [
        { accroche: "Première douleur.", texte: "Son coût." },
        { accroche: "Deuxième douleur.", texte: "Son coût." },
        { accroche: "Troisième douleur.", texte: "Son coût." },
        { accroche: "Quatrième douleur.", texte: "Son coût." },
      ],
    },
    {
      type: "offre",
      lignes: [
        {
          prestation: { accroche: "Un technicien évalué", texte: ", à votre rythme." },
          benefice: "Le poste est tenu dès le démarrage.",
        },
      ],
      prose: [{ texte: "Pour trancher, voir le [comparatif](/offres/residence/)." }],
    },
    {
      type: "deroule",
      etapes: [
        { titre: "Cadrage du besoin", texte: "un chargé d'affaires analyse le périmètre." },
        { titre: "Sélection du profil", texte: "nous proposons un technicien." },
      ],
    },
    {
      type: "garanties",
      puces: [{ accroche: "La continuité du poste", texte: "engagement contractuel." }],
    },
    {
      type: "preuves",
      preuves: [
        {
          titre: "Renfort habilité",
          texte: "depuis février 2026",
          lienLibelle: "Étude de cas SUEZ : remise en état d'un site",
          lienHref: "/preuves/suez-remise-en-etat/",
        },
      ],
    },
    {
      type: "objections",
      questions: [{ question: "Combien ça coûte ?", reponse: "Sur devis." }],
    },
    {
      type: "ctaFinal",
      question: "Besoin de tenir le poste dès ce trimestre ?",
      bouton: "Demander un profil",
      rappel: "ou appelez le 04 78 33 72 05, rappel dans l'heure aux horaires ouvrés.",
    },
  ],
  autres: [
    { phrase: "« Je veux tout confier. »", libelle: "Périmètre complet", href: "/offres/maintenance-externalisee/" },
    { phrase: "Autre chose", libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
};

const rendu = renderToStaticMarkup(
  <PageOffre titre="Sous-traitance de maintenance industrielle" contenu={EXEMPLE} formulaire="verif" />,
);

/* On compare toujours sur un texte NORMALISÉ : la maquette écrit `&nbsp;` et
   l'apostrophe typographique, le JSX écrit les caractères. Deux écritures du
   même mot ne doivent pas faire échouer, ni laisser passer, un contrôle. */
function normalise(texte: string): string {
  return texte
    .replace(/&#x27;|&#39;|’/g, "'")
    .replace(/&nbsp;|&#xA0;| /g, " ")
    .replace(/&amp;/g, "&");
}

const RENDU = normalise(rendu);
const MAQUETTE_N = normalise(MAQUETTE);

/* ------------------------------ 1. les treize sections, dans l'ordre */

assert.equal(
  (rendu.match(/<section/g) ?? []).length,
  13,
  "le gabarit doit rendre les treize sections de la maquette",
);

/**
 * Le sur-titre de chaque section, dans l'ordre de la maquette.
 *
 * CHAQUE LIBELLÉ EST D'ABORD CHERCHÉ DANS LA MAQUETTE : `copieMaquette` lève si
 * la maquette ne le porte pas. Le contrôle ne peut donc pas affirmer un
 * sur-titre que le fichier n'écrit plus.
 */
const SURTITRES_ATTENDUS = [
  "Rappel dans l’heure",
  "Innovation, performance, impact.",
  "Ils nous font confiance",
  "Certifications",
  "Qui intervient chez vous",
  "Votre problématique",
  "L’offre",
  "Ce que nous faisons",
  "Ce que ça change pour vous",
  "Notre méthode",
  "Notre parti pris",
  "Nos réalisations",
  "Questions fréquentes",
  "Pour aller plus loin",
].map((s) => normalise(copieMaquette(s)));

let curseur = 0;
for (const surtitre of SURTITRES_ATTENDUS) {
  const position = RENDU.indexOf(surtitre, curseur);
  assert.ok(
    position > -1,
    `sur-titre absent du rendu, ou hors de l'ordre de la maquette : « ${surtitre} »`,
  );
  curseur = position;
}

/* Les H2 fixes du gabarit, eux aussi relus dans la maquette. */
for (const titre of [
  "Ce que nous faisons, et ce que ça change pour vous",
  "Comment ça se passe, étape par étape",
  "Ce que nous garantissons",
  "Nos références",
  "Vos questions avant de nous appeler",
  "Toutes nos études de cas",
  "Une autre question&nbsp;? Un technicien vous répond.",
]) {
  assert.ok(
    RENDU.includes(normalise(copieMaquette(titre))),
    `titre de la maquette absent du rendu : « ${titre} »`,
  );
}

/* ---------------------------- 2. le dessin, mesuré dans la maquette */

/**
 * Chaque déclaration est RELUE dans la maquette avant d'être cherchée dans le
 * rendu. Si la maquette change une valeur, `styleMaquette` lève et le contrôle
 * dit laquelle : il ne se contente pas de devenir faux en silence.
 */
const DESSIN: readonly [string, string][] = [
  // La carte numérotée de « Votre problématique » : l'écart que le client voyait.
  [styleMaquette("padding:26px 28px"), "padding:26px 28px"],
  [
    styleMaquette("font:600 30px var(--ft);letter-spacing:-.05em;color:var(--acc);flex:none;width:44px"),
    "width:44px",
  ],
  // Le tableau de l'offre, trois colonnes.
  [styleMaquette("52px minmax(0,1.05fr) minmax(0,.95fr)"), "52px minmax(0,1.05fr) minmax(0,.95fr)"],
  [styleMaquette("border-radius:var(--rad-s);background:var(--acc-w)"), "var(--acc-w)"],
  // La frise de « Notre méthode » : filet, pastille, trois colonnes.
  [styleMaquette("background:var(--acc);box-shadow:0 0 0 5px var(--bg)"), "0 0 0 5px var(--bg)"],
  // « Notre parti pris » : filet orange de 2px, rayon 40px du panneau.
  [styleMaquette("border-top:2px solid var(--acc);padding-top:22px"), "border-top:2px solid var(--acc)"],
  [styleMaquette("border-radius:40px"), "border-radius:40px"],
  // Le bandeau photo et la carte de référence.
  [styleMaquette("min-height:420px"), "min-height:420px"],
  [styleMaquette("height:210px"), "height:210px"],
  // Les cartes de questions : rayon 22px, et non --rad.
  [styleMaquette("border-radius:22px;padding:24px 28px"), "border-radius:22px"],
];

for (const [, attendu] of DESSIN) {
  assert.ok(
    rendu.includes(attendu),
    `valeur de la maquette absente du rendu : « ${attendu} »`,
  );
}

/* Les quatre cartes de « Votre problématique » portent bien 01 à 04. */
for (const numero of ["01", "02", "03", "04"]) {
  assert.ok(
    new RegExp(`width:44px[^>]*>${numero}<`).test(rendu),
    `la carte ${numero} de « Votre problématique » manque, ou n'est pas numérotée`,
  );
}
assert.ok(
  !/<ul|<li/.test(rendu.slice(rendu.indexOf("Votre problématique"), rendu.indexOf("L’offre"))),
  "« Votre problématique » ne se rend pas en liste à puces : la maquette pose des cartes",
);

/* Les dix hubs et les quatre agences du panneau sombre. */
for (const hub of ["Paris", "Lille", "Marseille", "Toulouse", "Lyon", "Metz", "Strasbourg", "Bordeaux", "Dijon", "Nantes"]) {
  assert.ok(
    MAQUETTE.includes(`"${hub}"`) && rendu.includes(`>${hub}<`),
    `hub absent de la maquette ou du rendu : « ${hub} »`,
  );
}
assert.ok(
  RENDU.includes("4 agences : Lyon (siège"),
  "la ligne des quatre agences manque au panneau « Qui intervient chez vous »",
);

/* ------------------------------------------------- 3. un seul H1, pas de lien mort */

assert.equal(
  (rendu.match(/<h1\b/g) ?? []).length,
  1,
  "un seul H1 par page : le rappel du titre sur la photo est un div dans la maquette",
);
assert.ok(!/href="#"/.test(rendu), 'aucun href="#" : ce serait un bouton mort');
assert.ok(
  !rendu.includes("exemple.test"),
  "une cible hors domaine ne doit jamais être rendue en lien",
);
assert.ok(
  !rendu.includes(">Ailleurs<") && !rendu.includes("Autre chose"),
  "un lien à cible refusée disparaît, libellé compris",
);
assert.ok(
  rendu.includes('href="#besoin"'),
  "les appels à l'action visent l'ancre du panneau de formulaire du héros",
);

/* ----------------------------------------- 4. aucun échafaudage Tailwind */

for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : « ${classe[1]} ». La charte vit dans les jetons de app/globals.css`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante dark: dans le rendu : « ${classe[1]} ». Le site n'a pas de mode sombre`,
  );
}

/* ------------------------------------------------- 5. les interdits de copie */

/**
 * Ce que la MAQUETTE porte et que le CONTRAT refuse.
 *
 * Chaque entrée est d'abord vérifiée PRÉSENTE dans la maquette : si elle en
 * disparaissait, l'interdit n'aurait plus d'objet et cette liste mentirait.
 * Puis elle est vérifiée ABSENTE du rendu.
 */
const INTERDITS_DE_LA_MAQUETTE: readonly [string, string][] = [
  // La maquette écrit « 4 agences : Lyon (siège), … ». Le contrat précise que
  // le siège est à Limonest, près de Lyon (CLAUDE.md, section 1) : le rendu
  // écrit « Lyon (siège, à Limonest) », donc la forme courte ne doit PAS sortir.
  ["4 agences : Lyon (siège), Montréal", "4 agences : Lyon (siège), Montréal"],
];

for (const [dansLaMaquette, interdit] of INTERDITS_DE_LA_MAQUETTE) {
  assert.ok(
    MAQUETTE_N.includes(normalise(dansLaMaquette)),
    `« ${dansLaMaquette} » n'est plus dans la maquette : cette liste est à relire`,
  );
  assert.ok(
    !RENDU.includes(normalise(interdit)),
    `formulation interdite rendue : « ${interdit} »`,
  );
}

/** Les interdits généraux du contrat (CLAUDE.md, section 9). */
const INTERDITS_DU_CONTRAT = [
  "200 clients",
  "+200",
  "5 agences",
  "cinq agences",
  "régie",
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
  "—",
  "sous 24 h",
  "sous 48 h",
  "sous 2 h",
  "sous 4 h",
] as const;

function verifieInterdits(texte: string, nom: string): void {
  const bas = normalise(texte).toLowerCase();
  for (const mot of INTERDITS_DU_CONTRAT) {
    assert.ok(
      !bas.includes(mot.toLowerCase()),
      `${nom} : formulation interdite rendue, « ${mot} »`,
    );
  }
  // Un prix : un nombre suivi d'un symbole ou d'un mot de monnaie.
  assert.ok(
    !/\d\s*(?:€|euros?|k€)\b/i.test(normalise(texte)),
    `${nom} : un prix est rendu, et aucun prix ne doit l'être`,
  );
}

verifieInterdits(rendu, "page d'exemple");

/* ------------------------------ 6. une section sans donnée ne se rend pas */

const VIDE: ContenuOffre = { gabarit: "offre" };
const renduVide = renderToStaticMarkup(
  <PageOffre titre="Une offre sans corpus" contenu={VIDE} formulaire="verif" />,
);

for (const surtitre of [
  "Votre problématique",
  "L’offre",
  "Notre méthode",
  "Notre parti pris",
  "Nos réalisations",
  "Questions fréquentes",
  "Pour aller plus loin",
]) {
  assert.ok(
    !normalise(renduVide).includes(normalise(surtitre)),
    `sans donnée, la section « ${surtitre} » ne doit pas se rendre, surtitre compris`,
  );
}
assert.ok(
  !renduVide.includes("Ce que nous garantissons"),
  "sans garanties, le panneau « Notre parti pris » ne se rend pas",
);
assert.equal(
  (renduVide.match(/<h2\b/g) ?? []).length,
  0,
  "sans corpus, aucun H2 ne doit sortir : pas de titre orphelin",
);
assert.equal(
  (renduVide.match(/<h1\b/g) ?? []).length,
  1,
  "le H1 reste : il vient de pages.titre_h1, pas du corpus",
);

/* Les sections de CHROME restent, elles : elles ne dépendent pas du corpus. */
for (const chrome of ["Ils nous font confiance", "Certifications", "Qui intervient chez vous"]) {
  assert.ok(
    renduVide.includes(chrome),
    `« ${chrome} » ne dépend pas du corpus et doit se rendre même sans lui`,
  );
}

/* ------------------------------------- 7. les dix-huit pages réelles */

const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const fichiers = readdirSync(DOSSIER).filter(
  (nom) => nom.startsWith("offres-") && nom.endsWith(".json"),
);

assert.ok(
  fichiers.length >= 18,
  `${fichiers.length} fichiers de pages d'offre, la famille en compte 18`,
);

for (const nom of fichiers) {
  const fichier = JSON.parse(readFileSync(join(DOSSIER, nom), "utf8"));
  const contenu = fichier.contenu as ContenuOffre;

  assert.equal(
    contenu.gabarit,
    "offre",
    `${nom} : sans le discriminant « offre », app/[...slug] sert le gabarit de vente`,
  );

  const page = renderToStaticMarkup(
    <PageOffre titre={nom} contenu={contenu} formulaire={`verif-${nom}`} />,
  );

  assert.equal((page.match(/<h1\b/g) ?? []).length, 1, `${nom} : un seul H1`);
  assert.ok(!/href="#"/.test(page), `${nom} : aucun href="#"`);
  verifieInterdits(page.replace(/<[^>]+>/g, " "), nom);

  // Les sections que la maquette dessine et que le corpus alimente sortent.
  for (const surtitre of ["Votre problématique", "L’offre", "Notre méthode", "Notre parti pris"]) {
    assert.ok(
      normalise(page).includes(normalise(surtitre)),
      `${nom} : la section « ${surtitre} » devrait se rendre, le corpus l'alimente`,
    );
  }
}

console.log("gabarit offre : toutes les vérifications passent.");
console.log(
  `  maquette relue : maquette/gabarit-03-offre.html, ${MAQUETTE.split("\n").length} lignes, ` +
    `${SECTIONS_MAQUETTE.length} sections.`,
);
console.log(`  ${SURTITRES_ATTENDUS.length} sur-titres relevés dans la maquette et retrouvés dans l'ordre.`);
console.log(`  ${DESSIN.length} déclarations de style relues dans la maquette et retrouvées au rendu.`);
console.log(`  ${fichiers.length} pages réelles rendues, ${INTERDITS_DU_CONTRAT.length} interdits vérifiés absents.`);
