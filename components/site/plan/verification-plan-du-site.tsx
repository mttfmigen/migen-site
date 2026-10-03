/**
 * Contrôle du plan du site, sans navigateur et sans base de données.
 *
 *   bun components/site/plan/verification-plan-du-site.tsx
 *
 * Injecter une faute pour vérifier que le contrôle sait échouer :
 *
 *   MIGEN_FAUTE=h1       bun components/site/plan/verification-plan-du-site.tsx
 *   MIGEN_FAUTE=titre    ... (le meta title recopie le H1)
 *   MIGEN_FAUTE=ancre    ... (un lien rendu inerte, href="#")
 *   MIGEN_FAUTE=grille   ... (la grille de la maquette arrondie à 240px)
 *   MIGEN_FAUTE=interdit ... (une formulation interdite dans la copie)
 *   MIGEN_FAUTE=tailwind ... (une classe de couleur Tailwind)
 *   MIGEN_FAUTE=rubrique ... (le regroupement perd les pages dont le parent
 *                             n'est pas publié)
 *
 * CE QU'IL DÉCIDE.
 *
 *   1. LES VALEURS DE LA MAQUETTE SONT RELUES DANS LE FICHIER à chaque
 *      exécution, lignes 2926 à 2948 pour l'écran et ligne 1055 pour la rangée
 *      de liste dont il reprend le repos. Aucune valeur n'est écrite de
 *      mémoire : si la maquette change, le contrôle le dit.
 *   2. LE REGROUPEMENT NE PERD AUCUNE PAGE. Seize pages publiées ont un parent
 *      qui ne l'est pas. Regrouper par `parent_id` les ferait disparaître d'un
 *      plan dont le seul intérêt est d'être complet.
 *   3. LE TITRE N'EST PAS LE H1, il n'y a qu'un H1, et aucun lien n'est inerte.
 *      Cette page est citée par le pied de page, donc par tout le site : un
 *      lien mort y est exactement le défaut qu'elle répare.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PlanDuSite, {
  rubriques,
  type EntreePlan,
} from "@/components/site/plan/PlanDuSite";

const FAUTE = process.env.MIGEN_FAUTE ?? "";

const SOURCE = readFileSync(
  new URL("./PlanDuSite.tsx", import.meta.url),
  "utf8",
);
const MODULE = readFileSync(
  new URL("./PlanDuSite.module.css", import.meta.url),
  "utf8",
);
const PAGE = readFileSync(
  new URL("../../../app/plan-du-site/page.tsx", import.meta.url),
  "utf8",
);

/* ------------------------------------------------- la maquette, relue ici */

const LIGNES = readFileSync(
  new URL("../../../maquette/accueil-rendu.html", import.meta.url),
  "utf8",
).split("\n");

/** Lignes 2926 à 2948 : l'écran « Plan du site ». */
const ECRAN = LIGNES.slice(2925, 2948).join("\n");
/** Lignes 1055 à 1057 : la rangée de liste dont l'écran reprend le repos. */
const RANGEE_MAQUETTE = LIGNES.slice(1054, 1057).join("\n");

assert.ok(
  ECRAN.includes('data-screen-label="Plan du site"'),
  "les lignes 2926 à 2948 de la maquette ne sont plus l'écran du plan du site : " +
    "le fichier a bougé, les numéros de ligne de ce contrôle sont à reprendre",
);
assert.ok(
  RANGEE_MAQUETTE.includes('style-hover="background:var(--chip)"'),
  "la ligne 1055 de la maquette n'est plus la rangée de liste des panneaux",
);

/* L'interlignage est le seul écart assumé sur la rangée : la maquette écrit
   `font:600 14px var(--ft)` pour des libellés d'un mot, un `titre_h1` tient sur
   trois lignes dans une colonne de 250 px. L'écart est vérifié des deux côtés
   pour qu'il reste un choix, et non une dérive. */
assert.ok(
  RANGEE_MAQUETTE.includes("font:600 14px var(--ft)"),
  "la typographie de la rangée de la maquette a changé",
);

/**
 * Une valeur attendue : elle doit d'abord exister dans la maquette, sinon le
 * contrôle compare le rendu à une invention.
 */
function deLaMaquette(source: string, valeur: string): string {
  assert.ok(
    source.includes(valeur),
    `« ${valeur} » n'est plus dans la maquette : la valeur attendue est périmée`,
  );
  return valeur;
}

/* ------------------------------------------------------------- le rendu */

/**
 * Jeu d'essai : des chemins et des titres RÉELS de la base, dont quatre pages
 * dont le parent n'est pas publié (`/preuves/...`, `/ressources/...`). C'est ce
 * qui donne du sens à l'assertion sur le regroupement.
 */
const PAGES: EntreePlan[] = [
  { path: "/offres/", titre_h1: "Entreprise maintenance industrielle" },
  { path: "/offres/residence/", titre_h1: "Techniciens en résidence" },
  {
    path: "/offres/retrofit/remise-en-etat/",
    titre_h1: "Remise en état des machines",
  },
  { path: "/implantations/lyon/", titre_h1: "Maintenance industrielle à Lyon" },
  {
    path: "/implantations/lyon/haute-savoie/",
    titre_h1: "La maintenance industrielle en Haute-Savoie, de l’Arve au Genevois",
  },
  { path: "/preuves/eiffage/", titre_h1: "Eiffage" },
  { path: "/ressources/fiches-pratiques/", titre_h1: "Fiches pratiques" },
];

let html = renderToStaticMarkup(<PlanDuSite pages={PAGES} />);

if (FAUTE === "h1") {
  html = html.replace("</h1>", "</h1><h1>Plan du site</h1>");
}
/* Le slash final est optionnel dans l'injection : hors du serveur Next,
   `next/link` écrit « /offres ». Voir plus bas, au contrôle des cibles. */
if (FAUTE === "ancre") {
  html = html.replace(/href="\/offres\/?"/, 'href="#"');
}
/* Faute injectée : le rangement en rangées de la maquette, celui qui laisse
   deux mille pixels de vide sous la carte d'une seule page. */
if (FAUTE === "grille") {
  html = html.replace(
    "column-width:250px;column-gap:14px",
    "display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;align-items:start",
  );
}
if (FAUTE === "interdit") {
  html = html.replace("</h1>", "</h1><p>Un service clé en main.</p>");
}
if (FAUTE === "tailwind") {
  html = html.replace('class="mg-site"', 'class="mg-site text-zinc-500"');
}

/* ------------------------------------------- un seul H1, distinct du titre */

const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
assert.equal(h1.length, 1, `${h1.length} H1 dans le plan du site, il en faut un`);

const TEXTE_H1 = deLaMaquette(ECRAN, "Toutes nos pages, au même endroit.");
assert.ok(h1[0][1].includes(TEXTE_H1), `le H1 n'est pas celui de la maquette`);

/* Le meta title est relu dans la page, pas recopié : c'est le couple titre/H1
   qui est contrôlé, et il doit rester dissemblable. */
const titre = /title:\s*"([^"]+)"/.exec(PAGE)?.[1];
assert.ok(titre, "la page n'exporte pas de meta title");
const titreFautif = FAUTE === "titre" ? TEXTE_H1 : titre;
assert.notEqual(
  titreFautif,
  TEXTE_H1,
  "le meta title recopie le H1 : le titre se lit dans une page de résultats, " +
    "le H1 sur la page",
);

/* ------------------------------------------------- valeurs de la maquette */

for (const valeur of [
  "Plan du site",
  "Une ville, un métier, une expertise…",
  "font:600 calc(clamp(34px,4.2vw,58px) * var(--ts))/1.04 var(--ft)",
  "letter-spacing:-.045em",
  "max-width:18ch",
  "padding:56px 40px 0",
  "padding:48px 40px var(--sec)",
  "max-width:720px",
  "padding:24px 22px 22px",
  "padding:0 8px 10px",
  "border-bottom:1px solid var(--line)",
  "font:600 11px ui-monospace,Menlo,monospace",
  "font:400 16px var(--fb)",
  "M20 20l-4.3-4.3",
]) {
  assert.ok(
    html.includes(deLaMaquette(ECRAN, valeur)),
    `valeur de la maquette absente du rendu : ${valeur}`,
  );
}

/* ------------------------------------- le mur de cartes, et son seul écart */

/* La maquette range ses cartes en grille, `repeat(auto-fill,minmax(250px,1fr))`
   avec `align-items:start`, sur sept familles de six entrées. Les vraies
   rubriques vont de une page à quarante-trois : dans une grille, la rangée
   prend la hauteur de sa carte la plus haute, et la carte d'une page laisse
   deux mille pixels de vide. Les colonnes CSS empilent sans rangées.

   LA LARGEUR ET LA GOUTTIÈRE DE LA MAQUETTE SONT TENUES, et c'est ce que ces
   assertions gardent : l'écart porte sur le rangement, pas sur le dessin. */
assert.ok(
  ECRAN.includes("grid-template-columns:repeat(auto-fill,minmax(250px,1fr))") &&
    ECRAN.includes("gap:14px"),
  "la grille de la maquette a changé : l'écart documenté dans PlanDuSite.tsx " +
    "est à reprendre contre les nouvelles valeurs",
);
assert.ok(
  html.includes("column-width:250px"),
  "la largeur de colonne de la maquette (250px) n'est plus dans le rendu",
);
assert.ok(
  html.includes("column-gap:14px"),
  "la gouttière de la maquette (14px) n'est plus dans le rendu",
);
assert.ok(
  html.includes("break-inside:avoid"),
  "sans `break-inside:avoid`, une carte se couperait en deux colonnes",
);
assert.ok(
  !/align-items:start/.test(html),
  "le rangement en rangées est revenu : la carte d'une page retrouvera son " +
    "trou de deux mille pixels sous elle",
);

/* La rangée vient de la ligne 1055, pas de l'écran : son style est calculé
   dans la maquette (`{{ p.css }}`) et seul son survol y est écrit. */
for (const valeur of [
  "padding:9px 11px",
  "border-radius:11px",
  "letter-spacing:-.022em",
  "transition:background var(--tr)",
]) {
  assert.ok(
    html.includes(deLaMaquette(RANGEE_MAQUETTE, valeur)),
    `valeur de la rangée de la maquette absente du rendu : ${valeur}`,
  );
}
assert.ok(
  html.includes("font:600 14px/1.45 var(--ft)"),
  "la rangée a perdu son interlignage : un titre long serait collé",
);

/* Le survol, lui, est bien écrit dans l'écran, et il vit dans le module CSS :
   un style en ligne React aurait battu la règle de feuille. */
assert.ok(
  ECRAN.includes("background:var(--acc-w);color:var(--acc-ink)"),
  "le survol de la rangée n'est plus celui de la maquette",
);
assert.ok(
  /\.rangee:hover[^}]*background:\s*var\(--acc-w\)/.test(MODULE),
  "le survol de la maquette n'est pas porté par le module CSS",
);

/* ---------------------------- le regroupement ne perd aucune page publiée */

const groupes = rubriques(PAGES);
const portees = groupes.reduce((total, g) => total + g.pages.length, 0);
assert.equal(
  portees,
  PAGES.length,
  "le regroupement perd des pages : seize pages publiées ont un parent qui ne " +
    "l'est pas, le plan doit les porter quand même",
);
assert.deepEqual(
  groupes.map((g) => g.segment),
  ["offres", "implantations", "preuves", "ressources"],
  "l'ordre des rubriques n'est plus celui des chemins reçus",
);
assert.deepEqual(
  groupes[0].pages.map((p) => p.path),
  ["/offres/", "/offres/residence/", "/offres/retrofit/remise-en-etat/"],
  "la racine de la rubrique n'arrive plus avant ses filles",
);

/* Faute injectée : le regroupement d'avant, par parenté de chemin direct, qui
   laissait tomber les pages dont le parent n'est pas publié. */
if (FAUTE === "rubrique") {
  const parParente = PAGES.filter(
    (p) => p.path.split("/").filter(Boolean).length <= 2,
  );
  assert.equal(
    parParente.length,
    PAGES.length,
    "le regroupement perd des pages : seize pages publiées ont un parent qui ne " +
      "l'est pas, le plan doit les porter quand même",
  );
}

/* --------------------------------------------------------- liens et copie */

assert.ok(
  !html.includes('href="#"'),
  'un lien du plan du site est rendu inerte (href="#")',
);
/* Chaque cible rendue est un chemin interne du cocon, jamais une URL relative
   ni une ancre : la page les lit en base, et la base ne connaît que la forme
   « /a/b/ ».

   LE SLASH FINAL EST OPTIONNEL ICI, et seulement ici : hors du serveur Next,
   `renderToStaticMarkup` ne lit pas `next.config.ts`, donc `next/link` retombe
   sur sa normalisation par défaut et écrit « /offres ». En production,
   `trailingSlash: true` lui fait écrire « /offres/ ». Même précaution que
   `components/cocon/verification-rubriques.tsx`. */
for (const lien of html.matchAll(/href="([^"]*)"/g)) {
  assert.ok(
    /^\/([a-z0-9-]+\/)*[a-z0-9-]+\/?$/.test(lien[1]),
    `cible non canonique dans le plan du site : ${lien[1]}`,
  );
}

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
  "sous 24 h",
  "sous 48 h",
  "—",
  "–",
]) {
  assert.ok(!html.includes(interdit), `copie interdite dans le rendu : ${interdit}`);
}

/* ---------------------------------------------------------- échafaudage */

for (const motif of [
  /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
  /\bdark:/,
  /\b(?:text|bg|border)-(?:white|black)\b/,
]) {
  assert.ok(!motif.test(html), `échafaudage dans le rendu : ${motif}`);
  assert.ok(!motif.test(SOURCE), `échafaudage dans la source : ${motif}`);
  assert.ok(!motif.test(MODULE), `échafaudage dans la feuille : ${motif}`);
}

/* ------------------------------------------------------ nom accessible */

assert.ok(
  /<input[^>]*aria-label="[^"]+"/.test(html),
  "le champ de recherche n'a pas de nom accessible : un texte indicatif n'en " +
    "est pas un, il disparaît à la première frappe",
);
assert.ok(
  html.includes('aria-hidden="true"'),
  "la loupe doit être masquée aux lecteurs d'écran",
);

console.log(
  `Plan du site : ${groupes.length} rubriques, ${portees} pages portées, ` +
    "toutes les assertions passent.",
);
