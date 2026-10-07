/**
 * Photographie des pages servies, en pleine hauteur, pour montrer l'écran.
 *
 *   bun scripts/apercu-pages.mjs /offres/zero-arret/ /travaux-industriels/
 *
 * POURQUOI UN SCRIPT ET PAS UNE CAPTURE DE FENÊTRE : le volet de navigation ne
 * photographie que ce qui tient à l'écran, et ces pages font quatre à six
 * hauteurs. Mehdi juge la page entière, pas son premier tiers.
 *
 * Les deux artefacts qui faussent toute mesure sont neutralisés comme dans
 * `diff-visuel-offre.mjs` : le bandeau de consentement (on choisit « Tout
 * refuser », l'option la plus protectrice) et la pastille de Next.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "apercu");
const BASE = process.env.BASE ?? "http://localhost:4340";
const LARGEUR = Number(process.env.LARGEUR ?? 1440);

const chemins = process.argv.slice(2);
if (chemins.length === 0) {
  console.error("usage : bun scripts/apercu-pages.mjs /une/page/ [/une/autre/]");
  process.exit(1);
}

mkdirSync(SORTIE, { recursive: true });

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({
  viewport: { width: LARGEUR, height: 900 },
  deviceScaleFactor: 2,
});
const page = await contexte.newPage();

for (const chemin of chemins) {
  const reponse = await page.goto(`${BASE}${chemin}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  const code = reponse?.status() ?? 0;

  await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {});
  await page
    .evaluate(() => {
      const b = [...document.querySelectorAll("button")].find(
        (x) => x.innerText.replace(/\s+/g, " ").trim() === "Tout refuser",
      );
      if (b) b.click();
    })
    .catch(() => {});

  // Les révélations au défilement posent `opacity:0` sur ce qui est sous la
  // ligne : sans ce parcours, la moitié de la page sort blanche.
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await dort(120);
    }
    window.scrollTo(0, 0);
    await dort(400);
  });

  const nom = `${chemin.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "accueil"}.png`;
  const fichier = join(SORTIE, nom);
  await page.screenshot({ path: fichier, fullPage: true });

  const mesure = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.innerText ?? "AUCUN H1",
    sections: document.querySelectorAll("main section, .mg-site section").length,
    hauteur: document.body.scrollHeight,
  }));
  console.log(
    `${code} ${chemin}\n   ${mesure.sections} sections, ${mesure.hauteur} px\n   « ${mesure.h1} »\n   ${fichier}`,
  );
}

await navigateur.close();
