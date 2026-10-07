/**
 * Compare les tailles réelles du site et de la maquette, à largeur égale.
 *
 * POURQUOI. Mehdi trouve tout « plus gros » sur le site que sur la maquette.
 * À l'œil, impossible de trancher : une capture à 1280 px et un écran à 1512 px
 * ne donnent pas la même chose, parce que la maquette dimensionne ses titres en
 * `clamp(38px, 4.4vw, 66px)`. Plus l'écran est large, plus le titre grossit,
 * jusqu'à la butée de 66 px.
 *
 * Ce script mesure les deux côtés, aux mêmes largeurs, sur les mêmes éléments,
 * et imprime les deux colonnes. Il ne juge pas : il donne les chiffres.
 *
 *   node scripts/compare-echelle.mjs
 *   node scripts/compare-echelle.mjs 1280 1512 1728
 */

import { chromium } from "playwright";

const MAQUETTE = process.env.MAQUETTE_URL ?? "http://localhost:4352/autonome.html";
const SITE = process.env.SITE_URL ?? "http://localhost:4340/offres/residence/";

/** Le h1 que porte la page d'offre Résidence des deux côtés. */
const H1_MAQUETTE = "Sous-traitance de maintenance industrielle";

/** Largeurs usuelles : portable 13 pouces, 15 pouces, écran large. */
const LARGEURS = process.argv.slice(2).map(Number).filter(Boolean);
const AJUSTEES = LARGEURS.length ? LARGEURS : [1280, 1512, 1728];

/**
 * Relève les tailles qui font l'impression de « gros » : le titre, le texte
 * courant, la largeur utile et la marge latérale qui en découle.
 */
async function mesure(page) {
  return page.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 10) / 10;
    const h1 = document.querySelector("h1");
    const corps = [...document.querySelectorAll("p")]
      .filter((p) => p.innerText.trim().length > 80)
      .sort((a, b) => b.innerText.length - a.innerText.length)[0];

    // Le conteneur utile : le premier ancêtre du h1 qui borne sa largeur.
    let conteneur = h1;
    while (conteneur && conteneur.parentElement) {
      const l = conteneur.getBoundingClientRect().width;
      if (l > 400 && l < window.innerWidth - 40) break;
      conteneur = conteneur.parentElement;
    }
    const large = conteneur ? conteneur.getBoundingClientRect() : null;

    return {
      h1: h1 ? px(getComputedStyle(h1).fontSize) : null,
      interligneH1: h1 ? px(getComputedStyle(h1).lineHeight) : null,
      corps: corps ? px(getComputedStyle(corps).fontSize) : null,
      largeurUtile: large ? Math.round(large.width) : null,
      margeLaterale: large ? Math.round(large.left) : null,
      fenetre: window.innerWidth,
    };
  });
}

async function vaSurMaquette(page) {
  await page.evaluate(() => {
    const l = [...document.querySelectorAll("a,button")].find(
      (x) => x.innerText.replace(/\s+/g, " ").trim() === "Toutes nos pages",
    );
    if (l) l.click();
  });
  await page.waitForFunction(
    () => /Toutes nos pages, au même endroit/.test(document.body.innerText),
    { timeout: 20000 },
  );
  await page.evaluate((h1) => {
    const l = [...document.querySelectorAll("a")].find(
      (a) => a.innerText.replace(/\s+/g, " ").trim() === h1,
    );
    if (l) l.click();
  }, H1_MAQUETTE);
  await page.waitForFunction(
    (h1) => document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() === h1,
    H1_MAQUETTE,
    { timeout: 20000 },
  );
}

const navigateur = await chromium.launch({ channel: "chrome" });

console.log(`maquette : ${MAQUETTE}`);
console.log(`site     : ${SITE}\n`);
console.log(
  "largeur   |        h1        |      corps      |   largeur utile  |  marge latérale",
);
console.log(
  "          | maquette   site  | maquette  site  | maquette   site  | maquette   site",
);
console.log("-".repeat(86));

const ecarts = [];

for (const largeur of AJUSTEES) {
  const ctx = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });

  const pm = await ctx.newPage();
  await pm.goto(MAQUETTE, { waitUntil: "networkidle" });
  await pm.waitForTimeout(1800);
  await vaSurMaquette(pm);
  const m = await mesure(pm);

  const ps = await ctx.newPage();
  await ps.goto(SITE, { waitUntil: "networkidle" });
  await ps.waitForTimeout(800);
  const s = await mesure(ps);

  const col = (a, b, u = "") =>
    `${String(a ?? "?").padStart(7)}${u}${String(b ?? "?").padStart(7)}${u}`;

  console.log(
    `${String(largeur).padStart(6)} px | ${col(m.h1, s.h1)} | ${col(m.corps, s.corps)} | ` +
      `${col(m.largeurUtile, s.largeurUtile)} | ${col(m.margeLaterale, s.margeLaterale)}`,
  );

  ecarts.push({ largeur, maquette: m, site: s });
  await ctx.close();
}

await navigateur.close();

console.log();
for (const e of ecarts) {
  const d = (a, b) => (a && b ? `${Math.round(((b - a) / a) * 100)} %` : "?");
  console.log(
    `à ${e.largeur} px : le site rend le titre ${d(e.maquette.h1, e.site.h1)} ` +
      `et le texte ${d(e.maquette.corps, e.site.corps)} par rapport à la maquette`,
  );
}
