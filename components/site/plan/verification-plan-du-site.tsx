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
 *   MIGEN_FAUTE=accueil  ... (le regroupement saute l'accueil, comme avant le
 *                             14/10, alors que le plan XML le déclare)
 *   MIGEN_FAUTE=robots   ... (robots.txt ouvert ne déclare plus le plan XML)
 *
 * Les CHEMINS eux-mêmes (les mêmes des deux côtés, tous en 200) se vérifient
 * en ligne : `node scripts/verifie-plan-et-sitemap.mjs <url>`.
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

import robots from "@/app/robots";
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
  { path: "/", titre: "La maintenance industrielle, sans rupture de production." },
  { path: "/offres/", titre: "Entreprise maintenance industrielle" },
  { path: "/offres/residence/", titre: "Techniciens en résidence" },
  {
    path: "/offres/retrofit/remise-en-etat/",
    titre: "Remise en état des machines",
  },
  { path: "/implantations/lyon/", titre: "Maintenance industrielle à Lyon" },
  {
    path: "/implantations/lyon/haute-savoie/",
    titre: "La maintenance industrielle en Haute-Savoie, de l’Arve au Genevois",
  },
  { path: "/preuves/eiffage/", titre: "Eiffage" },
  { path: "/ressources/fiches-pratiques/", titre: "Fiches pratiques" },
  { path: "/carriere/", titre: "Nous rejoindre" },
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

/* Le libellé de rubrique reste à 11 px sous 760 px : sans cette exception,
   `.mg-site h2` (app/globals.css, `!important`) le porte à 28,86 px à 390 px,
   mesuré en production le 14/10. */
assert.ok(
  /@media \(max-width: 760px\)\s*\{\s*:global\(\.mg-site\) h2\.libelle\s*\{\s*font-size: 11px !important;/.test(MODULE),
  "le libellé de rubrique n'a plus son exception mobile : il repasse à 29 px",
);
assert.ok(
  /\bstyles\.libelle\b/.test(SOURCE),
  "le <h2> de rubrique ne porte plus la classe qui garde ses 11 px sur mobile",
);

/* ---------------------------- le regroupement ne perd aucune page publiée */

/* Faute injectée : le regroupement d'avant le 14/10, qui sautait l'accueil
   (« L'accueil n'a pas de rubrique ») alors que le plan XML le déclare. */
const groupes =
  FAUTE === "accueil"
    ? rubriques(PAGES).filter((g) => g.segment !== "")
    : rubriques(PAGES);
const portees = groupes.reduce((total, g) => total + g.pages.length, 0);
assert.ok(
  groupes.some((g) => g.pages.some((p) => p.path === "/")),
  "l'accueil manque au plan du site : sitemap.xml le déclare, le plan HTML " +
    "doit lister exactement les mêmes chemins",
);
assert.equal(
  portees,
  PAGES.length,
  "le regroupement perd des pages : seize pages publiées ont un parent qui ne " +
    "l'est pas, le plan doit les porter quand même",
);
assert.deepEqual(
  groupes.map((g) => g.segment),
  ["", "offres", "implantations", "preuves", "ressources", "carriere"],
  "l'ordre des rubriques n'est plus celui des chemins reçus",
);
/* L'accueil n'a pas de segment : son libellé est celui que le menu et le pied
   de page lui donnent déjà, pas un mot écrit pour le plan. */
assert.equal(groupes[0].libelle, "Accueil", "la rubrique de l'accueil a perdu son libellé");
/* Une rubrique nouvelle prend le libellé déduit de son chemin, sans texte
   inventé : « carriere », en capitales par la feuille de style. */
assert.equal(groupes[5].libelle, "carriere", "le libellé d'une rubrique n'est plus son segment");
assert.deepEqual(
  groupes[1].pages.map((p) => p.path),
  ["/offres/", "/offres/residence/", "/offres/retrofit/remise-en-etat/"],
  "la racine de la rubrique n'arrive plus avant ses filles",
);
assert.ok(
  html.includes(">La maintenance industrielle, sans rupture de production.</a>"),
  "le lien de l'accueil ne porte pas son H1",
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
    // « / » compris : l'accueil est au plan depuis le 14/10.
    /^\/(([a-z0-9-]+\/)*[a-z0-9-]+\/?)?$/.test(lien[1]),
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
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). Ni la maquette ni de capture
  // ne portent « +200 » sur cette page : il n'y est donc pas exigé.
  "clients réguliers",
  "80 réguliers",
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

/* ------------------------------------------------------------- robots.txt */

/* robots.txt ne se réécrit pas ici, il se prouve. Fermé par défaut (le site est
   en préproduction sur vercel.app), ouvert par `SITE_INDEXABLE=oui` le jour de
   la bascule de migen.fr, et alors il déclare le plan XML sur le domaine
   final. */
const indexable = process.env.SITE_INDEXABLE;
try {
  process.env.SITE_INDEXABLE = "oui";
  const ouvert = robots();
  assert.equal(
    FAUTE === "robots" ? undefined : ouvert.sitemap,
    "https://migen.fr/sitemap_index.xml",
    "robots.txt ouvert ne déclare pas https://migen.fr/sitemap_index.xml, comme l'ancien site",
  );

  delete process.env.SITE_INDEXABLE;
  const ferme = robots();
  assert.deepEqual(
    ferme.rules,
    { userAgent: "*", disallow: "/" },
    "sans SITE_INDEXABLE=oui, robots.txt doit rendre Disallow: /",
  );
  assert.equal(ferme.sitemap, undefined, "robots.txt fermé ne doit rien déclarer");
} finally {
  if (indexable === undefined) delete process.env.SITE_INDEXABLE;
  else process.env.SITE_INDEXABLE = indexable;
}

console.log(
  `Plan du site : ${groupes.length} rubriques, ${portees} pages portées, ` +
    "robots.txt prouvé ouvert et fermé, toutes les assertions passent.",
);
