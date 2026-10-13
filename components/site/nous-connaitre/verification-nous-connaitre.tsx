/**
 * Contrôle de l'écran « Nous connaître », sans navigateur.
 *
 *   bun components/site/nous-connaitre/verification-nous-connaitre.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, lignes 5201 à 5528, jamais écrite de mémoire : une note de lecture
 * peut se tromper et personne ne peut la rejouer. Les seules chaînes écrites en
 * dur ici sont les interdits du contrat et les corrections assumées, qui ne
 * viennent justement PAS de la maquette.
 *
 * Les sections sont rendues une par une plutôt qu'à travers `app/nous-connaitre/
 * page.tsx` : la page importe `lib/contenu`, donc Supabase, et ce contrôle doit
 * tourner sans base ni variable d'environnement.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import EquipeProche from "@/components/site/nous-connaitre/EquipeProche";
import Fidelisation from "@/components/site/nous-connaitre/Fidelisation";
import FriseCinqAns from "@/components/site/nous-connaitre/FriseCinqAns";
import MotDuDirigeant from "@/components/site/nous-connaitre/MotDuDirigeant";
import OrigineDuNom from "@/components/site/nous-connaitre/OrigineDuNom";
import Ouverture from "@/components/site/nous-connaitre/Ouverture";
import PerimetreOuiNon from "@/components/site/nous-connaitre/PerimetreOuiNon";
import PortesValeursRse from "@/components/site/nous-connaitre/PortesValeursRse";
import Reperes from "@/components/site/nous-connaitre/Reperes";
import TerrainsExcellence from "@/components/site/nous-connaitre/TerrainsExcellence";
import TroisCases from "@/components/site/nous-connaitre/TroisCases";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/** La tranche de la maquette qui porte cet écran. */
const PREMIERE_LIGNE = 5201;
const DERNIERE_LIGNE = 5528;

const MAQUETTE = readFileSync(`${RACINE}maquette/accueil-rendu.html`, "utf8")
  .split("\n")
  .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
  .join("\n");

const SOURCE_PAGE = readFileSync(`${RACINE}app/nous-connaitre/page.tsx`, "utf8");

/** Les onze sections propres à cet écran, dans l'ordre de la maquette. */
const DOSSIERS = [
  "Ouverture",
  "Reperes",
  "MotDuDirigeant",
  "TerrainsExcellence",
  "OrigineDuNom",
  "TroisCases",
  "FriseCinqAns",
  "Fidelisation",
  "PerimetreOuiNon",
  "EquipeProche",
  "PortesValeursRse",
] as const;

/* Le titre et l'introduction du formulaire arrivent en props depuis la page :
   le contrôle les relit là, pour que la copie testée soit celle qui part. */
function constante(nom: string): string {
  const trouve = SOURCE_PAGE.match(
    new RegExp(`const ${nom} =\\s*\\n?\\s*"([^"]*)"`),
  );
  assert.ok(trouve, `constante ${nom} introuvable dans la page`);
  return JSON.parse(`"${trouve[1]}"`) as string;
}

/* Mes onze sections d'un côté, le formulaire réemployé de l'autre : certaines
   assertions ne doivent porter que sur ce que cet écran écrit. Dix agents
   travaillent en parallèle sur les composants partagés. */
const htmlSections = [
  renderToStaticMarkup(<Ouverture />),
  renderToStaticMarkup(<Reperes />),
  renderToStaticMarkup(<MotDuDirigeant />),
  renderToStaticMarkup(<TerrainsExcellence />),
  renderToStaticMarkup(<OrigineDuNom />),
  renderToStaticMarkup(<TroisCases />),
  renderToStaticMarkup(<FriseCinqAns />),
  renderToStaticMarkup(<Fidelisation />),
  renderToStaticMarkup(<PerimetreOuiNon />),
  renderToStaticMarkup(<EquipeProche />),
  renderToStaticMarkup(<PortesValeursRse />),
].join("");

const htmlFormulaire = renderToStaticMarkup(
  <FormulaireBasDePage
    formulaire="nous-connaitre-bas-de-page"
    titre={constante("TITRE_FORMULAIRE")}
    intro={constante("INTRO_FORMULAIRE")}
  />,
);

const html = htmlSections + htmlFormulaire;

/* ------------------------------------------------------------ normalisation
   Les deux côtés doivent être comparés sur le MÊME texte : la maquette écrit
   `&nbsp;` et `&rsquo;` en entités, React sort des caractères Unicode. Une
   comparaison brute échouerait sur de la typographie, pas sur du contenu. */
const ENTITES: readonly [RegExp, string][] = [
  [/&nbsp;/g, " "],
  [/&rsquo;|&#8217;|&#x2019;/g, "’"],
  [/&laquo;/g, "«"],
  [/&raquo;/g, "»"],
  [/&ldquo;/g, "“"],
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&#x27;|&#39;/g, "'"],
];

function normalise(brut: string): string {
  let t = brut.replace(/<[^>]+>/g, " ");
  for (const [motif, remplacement] of ENTITES) t = t.replace(motif, remplacement);
  return t
    .replace(/[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const texteRendu = normalise(html);

/** Contenu textuel d'un motif de la maquette, normalisé. */
function extrait(motif: RegExp): string[] {
  return [...MAQUETTE.matchAll(motif)].map((m) => normalise(m[1]));
}

function doitContenir(attendus: readonly string[], quoi: string) {
  assert.ok(attendus.length > 0, `aucune valeur relevée dans la maquette : ${quoi}`);
  for (const attendu of attendus) {
    assert.ok(
      texteRendu.includes(attendu),
      `${quoi} absent du rendu : « ${attendu} »`,
    );
  }
}

// ------------------------------------------------------------------ le H1
// Un seul, et c'est celui de la maquette.
assert.equal(
  html.split("<h1").length - 1,
  1,
  "la page doit porter exactement un h1",
);

const [h1Maquette] = extrait(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
assert.ok(h1Maquette, "la maquette ne contient pas de h1 dans cette tranche");
const [h1Rendu] = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
  normalise(m[1]),
);
assert.equal(h1Rendu, h1Maquette, "le h1 rendu s'écarte de celui de la maquette");

// --------------------------------------------------- le titre n'est pas le H1
// Règle du projet : le meta title se lit dans une page de résultats, le h1 sur
// la page. Les deux identiques, c'est une page qui se répète.
const titre = constante("TITRE_PAR_DEFAUT");
assert.notEqual(
  normalise(titre),
  h1Rendu,
  "le titre de référencement est identique au h1",
);
assert.ok(titre.length > 10, "le titre de repli est trop court pour être un titre");

// ------------------------------------------------- la copie de la maquette
doitContenir(
  extrait(/text-transform:uppercase;color:var\(--acc\)[^>]*>([^<]{1,90})</g),
  "surtitre",
);
doitContenir(extrait(/<h2[^>]*>([\s\S]*?)<\/h2>/g), "titre de section");
doitContenir(
  extrait(/font:600 calc\(38px \* var\(--ts\)\)\/1 var\(--ft\)[^>]*>([^<]*)</g),
  "repère chiffré",
);
doitContenir(
  extrait(/font:600 calc\(20px \* var\(--ts\)\) var\(--ft\)[^>]*>([^<]*)</g),
  "année de la frise",
);
doitContenir(
  extrait(/font:600 calc\(28px \* var\(--ts\)\)[^>]*>([^<]*)</g),
  "turnover du secteur",
);
doitContenir(
  extrait(/font:600 calc\(34px \* var\(--ts\)\)[^>]*>([^<]*)</g),
  "turnover Migen",
);
doitContenir(
  extrait(/clamp\(40px,4\.4vw,60px\)[^>]*>([^<]*)</g),
  "chiffre de l'ambition",
);
doitContenir(
  extrait(/<em style="font-style:normal;color:#fff">([^<]*)<\/em>/g),
  "titre du livre",
);

// ------------------------------------------------- les listes oui / non
// La maquette met une coche de plus que la liste : l'accusé d'envoi du
// formulaire en porte une. On compte donc les coches de la liste seulement.
const coches = (MAQUETTE.match(/flex:none">✓</g) ?? []).length;
const croix = (MAQUETTE.match(/flex:none">×</g) ?? []).length;
assert.equal(
  (html.match(/>✓</g) ?? []).length,
  coches,
  `la liste « ce que nous faisons » doit porter ${coches} lignes`,
);
assert.equal(
  (html.match(/>×</g) ?? []).length,
  croix,
  `la liste « ce que nous ne faisons pas » doit porter ${croix} lignes`,
);

// ------------------------------------------------------ marges mobiles
// `app/globals.css` rattrape les marges sous 760px par des sélecteurs
// d'attribut sur `max-width:1200px`. Autant de conteneurs porteurs que la
// maquette en compte de sections, sinon une section perd ses marges sur
// téléphone sans rien casser d'autre.
const conteneurs = (MAQUETTE.match(/max-width:1200px/g) ?? []).length;
/* +1 DÉCLARÉ : le bloc des six offres posé le 13/10 n'a pas d'équivalent dans
   la maquette, qui ne pose aucun lien d'offre sur cet écran. Il porte le même
   conteneur que les autres, sinon il perdrait ses marges sous 760px. L'égalité
   reste stricte : une section qui perd son conteneur fait toujours tomber la
   porte, et ce bloc aussi. */
const CONTENEURS_AJOUTES = 1;
assert.equal(
  (html.match(/max-width:1200px/g) ?? []).length,
  conteneurs + CONTENEURS_AJOUTES,
  `${conteneurs + CONTENEURS_AJOUTES} conteneurs attendus, un par section de la maquette plus le bloc des six offres`,
);

// ------------------------------------------------------- rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc est rendu avec une opacité nulle",
);

// ----------------------------------------------------------- liens inertes
// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
// Cet écran est cité par le pied de page de tout le site : un lien mort ici se
// voit sur 225 pages.
assert.ok(
  !html.includes('href="#"'),
  'un lien est rendu inerte (href="#")',
);
/* Le slash final fait partie de la forme canonique des URL du site. La cible est
   lue dans la SOURCE et non dans le rendu : `next/link` ne garde le slash que
   sous `trailingSlash: true` de `next.config.ts`, réglage absent quand le
   composant est rendu seul ici. Un lien écrit sans slash coûterait une
   redirection 308 par clic, au visiteur comme au robot. */
const DOSSIER = `${RACINE}components/site/nous-connaitre`;
const SOURCES = readdirSync(DOSSIER)
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("verification"))
  .map((f) => readFileSync(`${DOSSIER}/${f}`, "utf8"))
  .join("");

const cibles = [...SOURCES.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]);
assert.ok(cibles.length > 0, "aucune cible interne : les liens de la maquette ont disparu");
for (const cible of cibles) {
  assert.ok(
    cible.endsWith("/"),
    `cible interne sans slash final, elle sera redirigée : ${cible}`,
  );
}

// --------------------------------------------- les six offres sont joignables
/*
 * Retour de Nathan Jorez, fondateur, le 13/10 : « cette page est ultra spé
 * résidence comme si c'était la seule offre. » Mesure du jour : le `<main>` de
 * cet écran ne portait AUCUN lien vers une page d'offre, contre 14 sur
 * l'accueil. Ses neuf sorties menaient à l'équipe, aux valeurs, aux secteurs,
 * aux implantations, au contact, à la RSE et à la confidentialité.
 *
 * LES SIX ADRESSES SONT RELUES DANS LE PIED DE PAGE DU SITE, jamais écrites de
 * mémoire ici : c'est lui qui fait référence pour la liste des offres, et une
 * offre qui change d'adresse là-bas doit faire tomber cette porte ici. Les
 * libellés sont relus au même endroit, ce qui interdit de les reformuler.
 */
const SOURCE_PIED = readFileSync(
  `${RACINE}components/site/PiedDePage.tsx`,
  "utf8",
);

const LIBELLES_PIED = new Map(
  [...SOURCE_PIED.matchAll(/\{ libelle: "([^"]+)", href: "([^"]+)" \}/g)].map(
    (m) => [m[2], m[1]] as const,
  ),
);

const OFFRES_ATTENDUES = [
  "/offres/residence/",
  "/offres/full-service/",
  "/offres/zero-arret/",
  "/offres/arret-technique/",
  "/offres/bureau-etudes/",
  "/travaux-industriels/",
] as const;

for (const url of OFFRES_ATTENDUES) {
  const libelle = LIBELLES_PIED.get(url);
  assert.ok(
    libelle,
    `le pied de page ne porte plus l'offre ${url} : la liste des six offres est à revoir`,
  );
  /* La forme canonique, slash final compris, et pas une forme qui coûterait une
     redirection 308 par clic. C'est pour cela que ces cartes sont des `<a>` :
     `next/link` rendu hors de `next.config.ts` retirerait ce slash. */
  assert.ok(
    html.includes(`href="${url}"`),
    `l'offre ${url} n'est joignable depuis « Nous connaître » : aucun lien vers elle`,
  );
  assert.ok(
    texteRendu.includes(normalise(libelle)),
    `le libellé du pied de page n'est pas repris pour ${url} : « ${libelle} »`,
  );
}

// ------------------------------------------- aucun échafaudage de couleur
assert.ok(
  !/\bdark:/.test(html),
  "une variante dark: subsiste, le site n'a pas de mode sombre",
);
assert.ok(
  !/\b(?:text|bg|border|ring|from|via|to)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
    html,
  ),
  "une classe de couleur Tailwind subsiste, la charte vit dans des jetons",
);

// ------------------------------------------- interdits de copie du contrat
for (const interdit of [
  // « +200 clients, sans jamais préciser « réguliers » », règle validée par
  // le client : c'est l'ancien compte qui est interdit, plus « +200 ».
  "réguliers",
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
  "Découvrez",
  "sous 24 h",
  "sous 48 h",
  "—",
  "–",
]) {
  assert.ok(!texteRendu.includes(interdit), `copie interdite : ${interdit}`);
  assert.ok(!html.includes(interdit), `copie interdite dans le balisage : ${interdit}`);
}

// ------------------------------------------------- les corrections assumées
// Chaque entrée dit : la maquette écrit CECI, la page rend CELA. La première
// moitié est vérifiée dans la maquette, ce qui garde l'assertion honnête, elle
// échoue si la maquette change au lieu de passer en silence.
const CORRECTIONS: readonly { maquette: string; rendu: string }[] = [
  { maquette: "Le modèle en régie se structure", rendu: "technicien en résidence se structure" },
  { maquette: "mettre à disposition du personnel", rendu: "affecter sur vos sites des techniciens" },
  { maquette: "Mettre à disposition des techniciens", rendu: "Affecter des techniciens de maintenance sur votre site" },
  { maquette: "de l'agence la plus proche", rendu: "du hub le plus proche" },
  /* Posée le 13/10. La page rendait « Migen lance les travaux industriels »
     là où l'arbitrage du 09/10 impose « Migen Travaux » : le mot « Travaux »
     avait été perdu à la saisie. Cette ligne vérifie les deux moitiés, donc
     elle échoue aussi bien si la maquette cesse d'écrire « Orthus » que si le
     rendu reperd la marque. */
  { maquette: "Orthus lance les travaux industriels", rendu: "Migen Travaux lance les travaux industriels" },
];

const texteMaquette = normalise(MAQUETTE);
for (const { maquette, rendu } of CORRECTIONS) {
  assert.ok(
    texteMaquette.includes(maquette),
    `la maquette n'écrit plus « ${maquette} », cette correction est à revoir`,
  );
  assert.ok(
    !texteRendu.includes(maquette),
    `formulation non corrigée dans le rendu : « ${maquette} »`,
  );
  assert.ok(
    texteRendu.includes(rendu),
    `la correction attendue est absente du rendu : « ${rendu} »`,
  );
}

// Le compte de clients de la frise, rendu mot pour mot : présent dans la
// maquette ET dans le rendu.
assert.ok(
  texteMaquette.includes("Plus de 200 clients") && texteRendu.includes("Plus de 200 clients"),
  "« Plus de 200 clients » doit être dans la maquette et dans le rendu",
);

// -------------------------------------------------- ordre des douze sections
// L'ordre raconte l'entreprise, il n'est pas esthétique. Un tri alphabétique
// des imports par un outil de rangement le casserait sans erreur de type.
const ORDRE = [...DOSSIERS, "FormulaireBasDePage"];
/* La lettre qui précède exclut `Promise<Metadata>` : on ne veut que du JSX. */
const montes = [...SOURCE_PAGE.matchAll(/(?<![A-Za-z>])<([A-Z][A-Za-z]*)\b/g)].map(
  (m) => m[1],
);
assert.deepEqual(
  montes,
  ORDRE,
  "l'ordre des sections de la page s'écarte de celui de la maquette",
);

console.log(
  `Nous connaître : ${ORDRE.length} sections, h1 unique, titre distinct, ` +
    `${conteneurs + CONTENEURS_AJOUTES} conteneurs, ` +
    `${OFFRES_ATTENDUES.length} offres joignables, ` +
    `aucun lien inerte, aucune copie interdite.`,
);
