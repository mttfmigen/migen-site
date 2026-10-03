/**
 * Contrôle de la page Carrière, sans navigateur.
 *
 *   bun components/site/carriere/verification-carriere.tsx
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, jamais écrite de mémoire ici : une note de lecture peut se
 * tromper, et personne ne peut la rejouer. Le contrôle extrait l'écran Carrière
 * du fichier du client, vérifie que la formulation y est bien, puis qu'elle est
 * bien dans le rendu des composants. Si la maquette change, il tombe.
 *
 * Il surveille aussi les trois défauts qui sont déjà partis en production sur
 * d'autres pages : un titre identique au h1, un lien inerte, et la palette par
 * défaut de Tailwind à côté des jetons de la charte.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { metadata } from "@/app/carriere/page";
import CandidaterCarriere from "@/components/site/carriere/CandidaterCarriere";
import ConditionsCarriere from "@/components/site/carriere/ConditionsCarriere";
import HeroCarriere from "@/components/site/carriere/HeroCarriere";
import ParcoursCarriere from "@/components/site/carriere/ParcoursCarriere";
import PostesOuverts from "@/components/site/carriere/PostesOuverts";
import ProcessusCarriere from "@/components/site/carriere/ProcessusCarriere";
import TestCarriere from "@/components/site/carriere/TestCarriere";

/**
 * Texte comparable : l'espace insécable, l'apostrophe typographique et les
 * entités HTML du rendu ne doivent pas faire échouer une comparaison de copie.
 * Sans cette normalisation, « d&#x27;entretien » et « d’entretien » sont deux
 * chaînes différentes alors que c'est le même mot.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&#x27;|&#39;|&apos;|[’‘']/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|[«»"]/g, '"')
    .replace(/&#xA9;|&copy;/g, "©")
    .replace(/\s+/g, " ");
}

// ---------------------------------------------------- ce que dit la maquette
const maquette = readFileSync(
  new URL("../../../maquette/accueil-rendu.html", import.meta.url),
  "utf8",
);

/** L'écran Carrière : du `data-screen-label="Carrière"` à la fin de son main. */
const ecran = (() => {
  const debut = maquette.indexOf('data-screen-label="Carrière"');
  assert.notEqual(debut, -1, "écran Carrière introuvable dans la maquette");
  const fin = maquette.indexOf("</main>", debut);
  assert.ok(fin > debut, "fin de l'écran Carrière introuvable");
  return normalise(maquette.slice(debut, fin));
})();

// ------------------------------------------------------- ce que rend le site
const html = [
  renderToStaticMarkup(<HeroCarriere />),
  renderToStaticMarkup(<ConditionsCarriere />),
  renderToStaticMarkup(<ParcoursCarriere />),
  renderToStaticMarkup(<TestCarriere />),
  renderToStaticMarkup(<PostesOuverts />),
  renderToStaticMarkup(<CandidaterCarriere />),
  renderToStaticMarkup(<ProcessusCarriere />),
].join("");
const texte = normalise(html);

// --------------------------------------- la copie portée, lue dans la maquette
/* Chacune de ces formulations doit être DANS la maquette et DANS le rendu. La
   première assertion est celle qui compte : elle interdit d'écrire ici une
   valeur que le client n'a pas validée. */
const PORTEES: readonly string[] = [
  "Le terrain, avec les moyens de bien le faire.",
  "Nous recrutons partout en France.",
  "+120 techniciens",
  "Une mission freelance",
  "Pas de promesses. Des conditions.",
  "Habilitations payées",
  "Mobilité France entière",
  "Des machines qui valent le détour",
  "On ne discute pas les EPI",
  "Robotique FANUC et ABB, automates SIEMENS et Schneider",
  "Démarche MASE, plan de prévention systématique",
  "Quatre parcours, quatre bassins",
  "Électrotechnicien",
  "Soudeur · chaudronnier",
  "Automaticien",
  "Électromécanicienne",
  "Portraits à remplacer par de vrais collaborateurs",
  "Situez-vous sur nos huit questions d'entretien.",
  "questions · 6 min",
  "Nos postes ouverts, mis à jour chaque semaine.",
  "Six étapes, dont un entretien technique et deux batteries de tests.",
  "Seuls 10 % des techniciens réussissent notre process.",
  "Lecture du parcours",
  "Échange téléphonique",
  "Entretien technique",
  "Tests techniques",
  "Tests comportementaux",
  "Rencontre du client",
  "étapes de sélection, annoncées à l'avance",
  "compte à créer, aucune redirection",
];

for (const valeur of PORTEES) {
  const attendu = normalise(valeur);
  assert.ok(
    ecran.includes(attendu),
    `« ${valeur} » n'est plus dans l'écran Carrière de la maquette : relire la maquette avant de corriger le code`,
  );
  assert.ok(
    texte.includes(attendu),
    `« ${valeur} » est dans la maquette mais pas dans le rendu de la page`,
  );
}

// ------------------------------- les corrections imposées par les interdits
/* Même principe à l'envers : la faute doit être PRÉSENTE dans la maquette, et
   ABSENTE du rendu. Si la maquette était corrigée un jour, ces assertions le
   diraient au lieu de passer sans rien vérifier. */
const CORRIGEES: readonly [string, string][] = [
  ["Cinq agences", "quatre agences et dix hubs"],
  ["sous 48 h ouvrées", "aucun délai chiffré"],
  ["48 H", "aucun délai chiffré"],
  ["Les 12 postes ouverts", "« Les postes ouverts », aucune offre n'est rendue"],
  ["Quatre écrans", "le formulaire du site n'a pas quatre écrans"],
  ["dépose votre dossier dans notre outil de recrutement", "la route /api/lead ne dépose rien dans l'outil de recrutement"],
  ["d'une heure de route", "aucune distance ni durée de trajet chiffrée"],
  ["— et un chargé d'affaires", "une virgule, jamais de tiret cadratin"],
];

for (const [faute, remede] of CORRIGEES) {
  const cherchee = normalise(faute);
  assert.ok(
    ecran.includes(cherchee),
    `« ${faute} » n'est plus dans la maquette : la correction « ${remede} » n'a peut-être plus lieu d'être`,
  );
  assert.ok(
    !texte.includes(cherchee),
    `« ${faute} » est reprise de la maquette dans le rendu. À la place : ${remede}`,
  );
}

// --------------------------------------- interdits de copie, liste complète
for (const interdit of [
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
  "Découvrez",
  "+200",
  "200 clients",
  "5 agences",
  "cinq agences",
  "sous 24 h",
  "sous 2 h",
  "sous 4 h",
  "sous 72 h",
  "—",
  "–",
]) {
  assert.ok(
    !texte.includes(normalise(interdit)),
    `copie interdite dans la page Carrière : « ${interdit} »`,
  );
}

// ------------------------------------------------------- un seul h1, ≠ titre
const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
assert.equal(h1.length, 1, `${h1.length} h1 rendus, un seul attendu`);

const texteH1 = normalise(h1[0][1].replace(/<[^>]+>/g, "")).trim();
const titre = typeof metadata.title === "string" ? metadata.title : "";
assert.ok(titre, "la page doit exporter un titre");
assert.notEqual(
  normalise(titre).trim().toLowerCase(),
  texteH1.toLowerCase(),
  "le titre répète le h1 : le titre se lit dans la page de résultats, le h1 sur la page",
);
assert.ok(
  titre.length >= 20 && titre.length <= 75,
  `titre de ${titre.length} caractères, attendu entre 20 et 75`,
);

// ------------------------------------------------------------ liens inertes
assert.ok(
  !html.includes('href="#"'),
  'un lien de la page Carrière est rendu inerte (href="#")',
);

/* Les seules cibles internes posées sont les deux ancres de la page elle-même et
   la politique de confidentialité du formulaire partagé (vérifiée à 200 sur
   http://localhost:4340/confidentialite/). Aucune page `/carriere/<métier>/`
   n'existe encore : elles répondent toutes 404, donc aucune n'est liée. */
const INTERNES_AUTORISEES = new Set([
  "#postes",
  "#candidater",
  "/confidentialite/",
  "/confidentialite",
]);
const cibles = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map((t) => t[1]);
for (const cible of cibles) {
  const interne = cible.startsWith("/") || cible.startsWith("#");
  assert.ok(
    !interne || INTERNES_AUTORISEES.has(cible),
    `cible interne inattendue : ${cible}. Toute cible interne doit répondre 200 avant d'être posée.`,
  );
}

/* Le lien externe ouvre un onglet : il doit porter son rel. */
const externes = [...html.matchAll(/<a\b[^>]*href="https?:[^"]*"[^>]*>/g)].map(
  (t) => t[0],
);
for (const lien of externes.filter((l) => l.includes('target="_blank"'))) {
  assert.match(lien, /rel="noopener noreferrer"/, `rel manquant : ${lien}`);
}

// --------------------------------- aucune palette de framework, aucun dark:
/* Même recherche que `scripts/verifie-echafaudage.mjs`, mais sur le HTML rendu :
   une classe calculée à l'exécution échapperait à la lecture de la source. */
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.doesNotMatch(
    classe[1],
    /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|shadow)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?\d*\b/,
    `palette de framework dans « ${classe[1]} » : utiliser les jetons de la charte`,
  );
  assert.doesNotMatch(
    classe[1],
    /\bdark:/,
    `variante dark: dans « ${classe[1]} » : le site n'a pas de mode sombre`,
  );
}

// ------------------------------------------------------- rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc de la page Carrière est rendu avec une opacité nulle",
);

// ------------------------------------------- les deux ancres sont bien là
for (const ancre of ["postes", "candidater"]) {
  assert.ok(
    html.includes(`id="${ancre}"`),
    `l'ancre #${ancre} est visée par un lien de la page mais n'existe pas dans le rendu`,
  );
}

console.log(
  `Carrière : ${PORTEES.length} formulations relues dans la maquette, ${CORRIGEES.length} corrections vérifiées, un seul h1, aucun lien inerte.`,
);
