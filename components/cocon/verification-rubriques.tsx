/**
 * Contrôle de l'habillage des rubriques de niveau 1, sans navigateur et sans
 * base de données.
 *
 *   bun components/cocon/verification-rubriques.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * CE QUE CE CONTRÔLE DÉCIDE. Le composant était resté en Tailwind
 * d'échafaudage (`text-zinc-900`, `dark:text-zinc-100`) sur un site sans mode
 * sombre : c'est ce que le client a vu en disant que le rendu était trop
 * grossier. Les quatre couplages ci-dessous se relâchent sans bruit, et le
 * rendu repartirait abîmé sans que rien n'échoue :
 *
 *   1. une classe de couleur par défaut qui revient,
 *   2. une couleur littérale à la place d'un jeton de la charte,
 *   3. une `box-shadow` qui remonterait en style en ligne, ce qui tuerait le
 *      survol en silence (un style en ligne bat toute règle de feuille),
 *   4. un contraste sous le minimum de la WCAG, qui ne se voit pas à l'œil.
 *
 * TOUTE VALEUR ATTENDUE EST LUE DANS `maquette/accueil-rendu.html`, jamais
 * écrite de mémoire : c'est la règle des portes de ce projet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import ListeRubriques, { type Rubrique } from "@/components/cocon/ListeRubriques";

const RACINE = new URL("../../", import.meta.url);
const maquette = readFileSync(new URL("maquette/accueil-rendu.html", RACINE), "utf8");
const composant = readFileSync(
  new URL("components/cocon/ListeRubriques.tsx", RACINE),
  "utf8",
);
const feuille = readFileSync(
  new URL("components/cocon/ListeRubriques.module.css", RACINE),
  "utf8",
);

/* Des rubriques de forme réaliste, pas le contenu réel : le composant ne décide
   ni des titres ni des chemins, il les reçoit. Un titre long est inclus exprès,
   c'est le cas qui fait déborder une grille à colonnes fixes. */
const RUBRIQUES: Rubrique[] = [
  { path: "/offres/", titre_h1: "Nos offres" },
  { path: "/metiers/", titre_h1: "Nos métiers" },
  { path: "/implantations/", titre_h1: "Nos implantations et nos hubs de techniciens" },
  { path: "/recrutement/", titre_h1: "Recrutement" },
];

const html = renderToStaticMarkup(
  <ListeRubriques rubriques={RUBRIQUES} libelle="Rubriques du site" />,
);

// ------------------------------------------------ 1. plus d'échafaudage Tailwind
// Le contrôle porte sur le RENDU, là où `scripts/verifie-echafaudage.mjs` lit les
// sources : une classe arrivée par une variable lui échapperait, pas à celui-ci.
for (const motif of [/\bzinc-\d{2,3}\b/, /\bdark:/, /\b(?:text|bg|border)-(?:white|black)\b/]) {
  assert.ok(
    !motif.test(html),
    `classe Tailwind d'échafaudage dans le rendu : ${motif}`,
  );
}

// ------------------------------------------------------- 2. la charte par jetons
// Aucune couleur littérale, ni dans le rendu ni dans le module CSS : la charte vit
// dans `app/globals.css`. Les `rgba(0,0,0,...)` des ombres sont les valeurs de la
// maquette, qui les écrit ainsi, et ne sont pas des couleurs de charte.
const sansOmbres = feuille.replace(/rgba\(0, 0, 0, [0-9.]+\)/g, "");
for (const [source, nom] of [
  [html, "le rendu"],
  [sansOmbres, "le module CSS"],
] as const) {
  assert.ok(
    !/#[0-9a-fA-F]{3,8}\b/.test(source),
    `couleur littérale dans ${nom} : la charte passe par ses jetons`,
  );
}

for (const jeton of ["--card", "--line", "--rad", "--tr", "--ft", "--fb", "--acc-ink"]) {
  assert.ok(html.includes(`var(${jeton})`), `jeton absent du rendu : ${jeton}`);
}
assert.ok(feuille.includes("var(--ink)"), "jeton --ink absent du module CSS");

// -------------------------------------- 3. les valeurs viennent de la maquette
// Chaque fragment est cherché À L'IDENTIQUE dans le rendu ET dans la maquette :
// un fragment que la maquette ne porte pas est une valeur inventée, un fragment
// que le rendu ne porte plus est une dérive. Les clés des objets de style sont
// ordonnées pour que React sérialise exactement la chaîne de la maquette.
const FRAGMENTS: [string, string][] = [
  ["châssis de la carte-lien (maquette 1537)",
   "background:var(--card);border:1px solid var(--line);border-radius:var(--rad)"],
  ["remplissage de la carte-lien (1539)", "padding:24px 26px 28px"],
  ["ligne titre-flèche de la grille des offres (1241)",
   "display:flex;align-items:baseline;justify-content:space-between;gap:14px"],
  ["transition de la carte-lien (1537)",
   "transition:transform var(--tr),box-shadow var(--tr)"],
  ["titre de la carte-lien (1541)", "font:600 19px/1.3 var(--ft);letter-spacing:-.025em"],
  ["grille de cartes (2606)",
   "grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px"],
  ["flèche (1533)", "font:600 15px var(--fb)"],
];

for (const [role, fragment] of FRAGMENTS) {
  assert.ok(maquette.includes(fragment), `absent de la maquette, donc inventé : ${role}`);
  assert.ok(html.includes(fragment), `absent du rendu : ${role}`);
}

/* Les deux valeurs de survol vivent dans le module CSS : elles sont cherchées là,
   pas dans le rendu, mais elles doivent exister dans la maquette. */
assert.ok(
  maquette.includes("transform:translateY(-4px);box-shadow:0 30px 60px -30px rgba(0,0,0,.42)"),
  "le survol de la carte-lien n'est plus celui de la maquette",
);
assert.ok(
  /\.carte:hover\s*\{[^}]*translateY\(-4px\)/.test(feuille),
  "le survol de la maquette n'est plus dans le module CSS",
);

// --------------------------- 4. l'ombre doit RESTER hors du style en ligne
// Le couplage le plus silencieux du composant. Une `box-shadow` remontée en
// style en ligne, geste naturel puisque c'est une valeur de la maquette, bat
// toute règle de feuille : la carte garderait son ombre de repos au survol et
// ne se soulèverait plus. Rien ne casse, rien n'échoue, le rendu est mort.
/* La déclaration, et non la mention : `transition:transform var(--tr),box-shadow
   var(--tr)` nomme la propriété sans la poser. Une déclaration ouvre l'attribut
   ou suit un point-virgule. */
assert.ok(
  !/["';]box-shadow:/.test(html),
  "une box-shadow est posée en style en ligne : elle battra le :hover du module",
);
assert.ok(
  /\.carte\s*\{[^}]*box-shadow/.test(feuille),
  "l'ombre de repos a quitté le module CSS",
);

/* Et le nom de la classe doit rester le même des deux côtés. Les modules CSS ne
   sont pas résolus hors du build Next : `styles.carte` vaut `undefined` ici, la
   carte est rendue SANS classe, et le rendu ne peut donc rien dire du lien
   entre les deux fichiers. Renommer d'un seul côté éteint survol, couleur et
   plancher tactile sans une seule erreur. */
assert.ok(
  composant.includes("className={styles.carte}"),
  "la carte n'applique plus `styles.carte`",
);
assert.ok(
  !/["';]transform:/.test(html),
  "une transformation est posée en style en ligne : elle battra le :hover du module",
);

// ------------------------------------------------------- 5. contraste, calculé
// Calculé, pas supposé : c'est l'exigence qui se perd le plus facilement, parce
// qu'elle ne se voit pas. Formule de luminance relative de la WCAG 2.2.
function luminance(couleur: string): number {
  /* `--card` vaut `#fff` : la forme courte est développée avant la mesure. */
  const hex =
    couleur.length === 4
      ? `#${[...couleur.slice(1)].map((c) => c + c).join("")}`
      : couleur;
  const canaux = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, v, b] = canaux.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * v + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (clair + 0.05) / (sombre + 0.05);
}

/* Les valeurs des jetons sont lues dans `app/globals.css`, pas recopiées :
   une retouche de charte doit faire échouer ce contrôle, pas passer dessous. */
const globals = readFileSync(new URL("app/globals.css", RACINE), "utf8");
function jeton(nom: string): string {
  const trouve = globals.match(new RegExp(`--${nom}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));
  assert.ok(trouve, `jeton --${nom} introuvable dans app/globals.css`);
  return trouve[1];
}

const CARTE = jeton("card"); // le fond réel de la carte, pas le fond de page
for (const [nom, couleur] of [
  ["le titre, --ink", jeton("ink")],
  ["la flèche, --acc-ink", jeton("acc-ink")],
] as const) {
  const mesure = contraste(couleur, CARTE);
  assert.ok(
    mesure >= 4.5,
    `${nom} donne ${mesure.toFixed(2)}:1 sur ${CARTE}, sous le 4,5:1 de la WCAG 1.4.3`,
  );
}

/* Et la raison du seul écart assumé à la maquette, en forme exécutable : si
   `--acc` passait un jour le seuil, la flèche pourrait reprendre l'orange de
   marque, et ce contrôle le dirait. */
const orange = contraste(jeton("acc"), CARTE);
assert.ok(
  orange < 4.5,
  `--acc donne maintenant ${orange.toFixed(2)}:1 sur la carte : la flèche peut reprendre l'orange de la maquette`,
);

// ------------------------------------------- 6. cible tactile, critère 2.5.8
// Mesurée sur les valeurs rendues, pas sur une note : remplissage haut et bas
// plus une ligne de texte à sa hauteur d'interligne.
const remplissage = html.match(/padding:(\d+)px \d+px (\d+)px/);
assert.ok(remplissage, "le remplissage de la carte est introuvable dans le rendu");
const police = html.match(/font:600 (\d+)px\/([0-9.]+) var\(--ft\)/);
assert.ok(police, "la police du titre est introuvable dans le rendu");
const hauteur =
  Number(remplissage[1]) + Number(remplissage[2]) + Number(police[1]) * Number(police[2]);
assert.ok(
  hauteur >= 24,
  `la carte fait ${hauteur}px de haut, sous les 24px du critère 2.5.8 de la WCAG 2.2`,
);
assert.ok(
  /\.carte\s*\{[^}]*min-height:\s*24px/.test(feuille),
  "le plancher de 24px a quitté le module CSS",
);

// --------------------------------------------- 7. structure et accessibilité
assert.equal(
  html.match(/<a /g)?.length,
  RUBRIQUES.length,
  "une rubrique sur quatre n'est pas rendue en lien",
);
/* Le slash final est comparé hors tout : `next/link` le retire ici, parce que
   ce contrôle rend le composant sans charger `next.config.ts`, où
   `trailingSlash: true` est posé. C'est le chemin qui compte, pas sa forme. */
for (const rubrique of RUBRIQUES) {
  const attendu = rubrique.path.replace(/\/$/, "");
  assert.ok(
    new RegExp(`href="${attendu}/?"`).test(html),
    `chemin perdu : ${rubrique.path}`,
  );
}
assert.ok(!html.includes('href="#"'), "un lien de rubrique est rendu inerte");

/* Aucun titre ici : l'appelant porte le sien. Deux titres pour une seule liste
   désordonnent le plan de la page, et c'est le défaut qu'on ne voit qu'au
   lecteur d'écran. */
assert.ok(!/<h[1-6]\b/.test(html), "le composant rend un titre, qui appartient à l'appelant");
assert.equal(html.match(/<nav /g)?.length, 1, "le composant doit rendre un seul <nav>");
assert.ok(/<nav aria-label="/.test(html), "le <nav> n'a pas de nom accessible");
assert.ok(
  /<span style="font:600 15px var\(--fb\)[^"]*" aria-hidden="true">/.test(html),
  "la flèche doit être masquée au lecteur d'écran : le titre est le nom du lien",
);

/* Le focus clavier est posé globalement (`:focus-visible` dans globals.css).
   Ce qui est vérifiable ici, c'est qu'on ne l'a pas désactivé. */
assert.ok(!/outline/i.test(html + feuille), "le focus visible ne se désactive pas");

// ------------------------------------------------ 8. interdits de copie et tiret
for (const interdit of ["—", "levier", "clé en main", "sur mesure", "régie", "intérim"]) {
  assert.ok(!html.includes(interdit), `copie interdite dans le rendu : ${interdit}`);
}
assert.ok(!composant.includes("—"), "tiret cadratin dans le composant");
assert.ok(!feuille.includes("—"), "tiret cadratin dans le module CSS");

// ------------------------------------------------------------- liste vide
assert.equal(
  renderToStaticMarkup(<ListeRubriques rubriques={[]} libelle="Rubriques du site" />),
  "",
  "une liste vide doit ne rien rendre, pas un <nav> creux",
);

console.log(
  `Rubriques de niveau 1 : ${FRAGMENTS.length} fragments retrouvés à l'identique dans la maquette, ` +
    `titre à ${contraste(jeton("ink"), CARTE).toFixed(1)}:1 et flèche à ` +
    `${contraste(jeton("acc-ink"), CARTE).toFixed(1)}:1 sur ${CARTE}, cible de ${hauteur}px.`,
);
