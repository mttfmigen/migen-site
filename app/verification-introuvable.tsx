/**
 * Contrôle de la page 404, sans navigateur.
 *
 *   bun app/verification-introuvable.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Quatre
 * choses se relâchent sans bruit sur cette page et partent en production
 * abîmées : l'échafaudage Tailwind qu'elle portait, les cibles de ses liens, le
 * contraste de ses textes et la taille de sa cible tactile.
 *
 * Les valeurs attendues viennent de la charte de `app/globals.css` et de
 * l'inventaire `docs/urls-site-actuel.json`, lus ici : aucun chiffre n'est
 * recopié de mémoire.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageIntrouvable from "@/app/not-found";

const html = renderToStaticMarkup(<PageIntrouvable />);
const feuille = readFileSync("app/not-found.module.css", "utf8");
const source = readFileSync("app/not-found.tsx", "utf8");

/* ------------------------------------------------------- plus d'échafaudage */
// Le site n'a pas de mode sombre et sa charte est blanc crème : une palette
// Tailwind par défaut à côté des jetons, c'est deux chartes dans le même écran.
// C'est ce que le client a vu quand il a dit que le site était « trop grossier ».
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone)-\d{2,3}\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur par défaut rendue : ${classe[1]}`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante « dark: » rendue alors que le site n'a pas de mode sombre : ${classe[1]}`,
  );
}

// Et aucune couleur littérale écrite à la main : tout passe par les jetons.
for (const style of html.matchAll(/style="([^"]*)"/g)) {
  assert.ok(
    !/#[0-9a-fA-F]{3,8}\b/.test(style[1]),
    `couleur littérale en style en ligne : ${style[1]}`,
  );
}

// Les jetons de la charte, eux, doivent bien être là.
for (const jeton of [
  "var(--ink)",
  "var(--ink2)",
  "var(--acc-ink)",
  "var(--line)",
  "var(--gbd)",
  "var(--gsol)",
  "var(--rad)",
  "var(--fb)",
  "var(--ft)",
  "var(--tr)",
  "var(--sec)",
]) {
  assert.ok(html.includes(jeton), `jeton de la charte absent du rendu : ${jeton}`);
}

/* ------------------------------------------------------------- structure */
assert.equal(html.match(/<h1[\s>]/g)?.length, 1, "la page doit porter un seul h1");
assert.equal(html.match(/<h2[\s>]/g)?.length, 1, "la page doit porter un seul h2");
assert.ok(html.includes('class="mg-site"'), "sans `mg-site`, le mobile reste au gabarit bureau");
// `max-width:1200px` en pixels littéraux : les marges mobiles de
// `app/globals.css` visent `section[style*="max-width:1200px"]`.
assert.ok(html.includes("max-width:1200px"), "le conteneur a perdu sa largeur littérale");

/* ------------------------------------------------- les cibles existent */
// Une 404 qui pointe vers une 404 est une faute, et c'est la page où elle coûte
// le plus cher. La comparaison se fait sans le slash final, comme dans
// `components/site/verification-entete.tsx` : `next/link` le retire au rendu
// tant que `trailingSlash` vaut `false` dans `next.config.ts`.
const inventaire: { url: string }[] = JSON.parse(
  readFileSync("docs/urls-site-actuel.json", "utf8"),
);
const sansSlash = (chemin: string) =>
  chemin.length > 1 && chemin.endsWith("/") ? chemin.slice(0, -1) : chemin;
const connues = new Set(inventaire.map((entree) => sansSlash(entree.url)));

const liens = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((trouve) => trouve[1]);
assert.ok(liens.length >= 5, `trop peu de liens de rattrapage : ${liens.length}`);
for (const lien of liens) {
  assert.ok(connues.has(sansSlash(lien)), `cible hors inventaire : ${lien}`);
}
for (const porte of ["/offres", "/expertises", "/implantations", "/contact", ""]) {
  assert.ok(
    liens.map(sansSlash).includes(porte || "/"),
    `grande porte absente de la page 404 : ${porte || "/"}`,
  );
}
assert.ok(!html.includes('href="#"'), "un lien de la page est rendu inerte");

// Les données portent la forme canonique, slash final compris : sans lui chaque
// clic part en redirection, et le site en a déjà 21 à servir.
for (const trouve of source.matchAll(/href: "(\/[^"]*)"/g)) {
  assert.ok(trouve[1].endsWith("/"), `cible sans slash final : ${trouve[1]}`);
}

/* ------------------------------------------------------------- contraste */
// Calculé, jamais supposé. Les couleurs sont lues dans la charte.
const charte = readFileSync("app/globals.css", "utf8");
function jeton(nom: string): string {
  const trouve = charte.match(new RegExp(`--${nom}:\\s*([^;]+);`));
  assert.ok(trouve, `jeton --${nom} absent de app/globals.css`);
  return trouve[1].trim();
}
type Rvb = [number, number, number];
function hex(valeur: string): Rvb {
  const c = valeur.replace("#", "");
  const long = c.length === 3 ? [...c].map((x) => x + x).join("") : c;
  return [0, 2, 4].map((i) => parseInt(long.slice(i, i + 2), 16)) as Rvb;
}
/** Une couleur opaque posée à `alpha` par-dessus un fond. */
function superpose(dessus: Rvb, alpha: number, dessous: Rvb): Rvb {
  return dessus.map((v, i) => alpha * v + (1 - alpha) * dessous[i]) as Rvb;
}
function canal(valeur: number): number {
  const s = valeur / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance([r, v, b]: Rvb): number {
  return 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);
}
function contraste(a: Rvb, b: Rvb): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (haut + 0.05) / (bas + 0.05);
}
const arrondi = (x: number) => Math.round(x * 100) / 100;

const fond = hex(jeton("bg"));
// Le verre des cartes : du blanc à l'opacité `--gl-a` par-dessus le fond crème.
const verre = superpose([255, 255, 255], Number(jeton("gl-a")), fond);
// Le bouton de verre : `--gsol`, rgba(255,255,255,.8), sur le même fond.
const boutonFond = superpose(
  [255, 255, 255],
  Number(jeton("gsol").match(/,\s*([\d.]+)\s*\)/)![1]),
  fond,
);

const PLANCHER = 4.5;
const mesures: [string, number][] = [
  ["sur-titre --acc-ink sur le fond crème", contraste(hex(jeton("acc-ink")), fond)],
  ["h1 et h2 --ink sur le fond crème", contraste(hex(jeton("ink")), fond)],
  ["chapeau --ink2 sur le fond crème", contraste(hex(jeton("ink2")), fond)],
  ["titre de carte --ink sur le verre", contraste(hex(jeton("ink")), verre)],
  ["résumé de carte --ink2 sur le verre", contraste(hex(jeton("ink2")), verre)],
  ["action de carte --acc-ink sur le verre", contraste(hex(jeton("acc-ink")), verre)],
  ["bouton --ink sur le verre du bouton", contraste(hex(jeton("ink")), boutonFond)],
];
for (const [quoi, rapport] of mesures) {
  assert.ok(
    rapport >= PLANCHER,
    `contraste insuffisant, ${quoi} : ${arrondi(rapport)}:1 pour un plancher de ${PLANCHER}:1`,
  );
}

// Les deux écarts assumés de la page, vérifiés par l'absurde : si l'un de ces
// rapports repassait au-dessus du plancher, l'écart n'aurait plus de raison
// d'être et les commentaires qui l'expliquent seraient à retirer.
assert.ok(
  contraste(hex(jeton("acc")), fond) < PLANCHER,
  "l'orange de marque tient maintenant le plancher : le sur-titre peut revenir à --acc",
);
assert.ok(
  contraste([255, 255, 255], hex(jeton("acc"))) < PLANCHER,
  "le blanc sur l'orange tient maintenant le plancher : le bouton plein peut revenir",
);
assert.ok(
  !source.includes("BOUTON_ACTION"),
  "le bouton orange plein porte du blanc à 2,6:1 : il ne revient pas sur cette page",
);

/* ------------------------------------------------- cible tactile, 2.5.8 */
// 24 px de haut au minimum sur téléphone. Le bouton tient son plancher depuis le
// module, la carte depuis la valeur de la maquette qu'elle porte en ligne.
assert.match(
  feuille,
  /@media \(max-width: 880px\)[\s\S]*\.boutonVerre[\s\S]*min-height:\s*24px/,
  "le plancher de 24 px du critère 2.5.8 a disparu du module",
);
assert.ok(
  html.includes("min-height:160px"),
  "la carte de lien a perdu les 160px de la maquette, qui portent sa cible tactile",
);
// Le focus clavier est posé globalement : il ne doit pas être éteint ici.
assert.ok(
  !/outline:\s*(?:none|0)/.test(feuille),
  "le focus visible au clavier a été désactivé",
);

/* ------------------------------------- survols dans le module, pas ailleurs */
for (const survol of [".carteLien:hover", ".boutonVerre:hover"]) {
  assert.ok(feuille.includes(survol), `survol absent du module : ${survol}`);
}
assert.ok(
  !/style-hover|onMouseEnter/.test(source),
  "un survol a été écrit dans le composant au lieu du module",
);

/* ------------------------------------------- interdits de copie du contrat */
for (const interdit of [
  "agences en France",
  "levier",
  "clé en main",
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "Découvrez",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "—",
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}

console.log("Page 404 : habillage, cibles, contraste et cible tactile vérifiés.");
for (const [quoi, rapport] of mesures) {
  console.log(`  ${arrondi(rapport)}:1  ${quoi}`);
}
