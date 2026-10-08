/**
 * Le titre principal de chaque page tombe-t-il à la même hauteur que dans la
 * maquette ? Contrôle bon marché de tout ce qui précède le héros (en-tête,
 * dégagement sous l'en-tête, fil d'Ariane, bandeaux) : un décalage de 34 px sur
 * 200 pages est passé inaperçu de toutes les autres mesures, qui photographient
 * section par section.
 *
 *   node scripts/verifie-position-titre.mjs                  les 248 pages
 *   node scripts/verifie-position-titre.mjs "04 Ville"       un gabarit
 *   node scripts/verifie-position-titre.mjs /offres/residence/ /implantations/lyon/
 *
 * Sortie en échec si un titre est décalé de plus de 2 px.
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const INDEX = JSON.parse(readFileSync(new URL("../maquette/contenu/site/index.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
const pages = args.length === 0
  ? INDEX
  : args[0].startsWith("/")
    ? args.map((url) => ({ url, gabarit: "" }))
    : INDEX.filter((p) => (p.gabarit ?? "").startsWith(args[0]));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const LARGEUR = Number(process.env.LARGEUR ?? 1280);

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({ viewport: { width: LARGEUR, height: 900 } });

async function hauteurTitre(url, maquette) {
  const page = await contexte.newPage();
  try {
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    let cadre = page.mainFrame();
    if (maquette) {
      await page.waitForFunction(() => document.getElementById("etat")?.textContent?.startsWith("page ouverte"), { timeout: 40000 });
      cadre = page.frames().find((f) => f.url().includes("autonome"));
    }
    await page.waitForTimeout(1500);
    return await cadre.evaluate(() => {
      window.scrollTo(0, 0);
      const h1 = document.querySelector("h1");
      return h1 ? Math.round(h1.getBoundingClientRect().top) : null;
    });
  } catch {
    return null;
  } finally {
    await page.close();
  }
}

const file = [...pages];
const ecarts = [];
async function ouvrier() {
  while (file.length) {
    const { url, gabarit } = file.shift();
    const [m, s] = await Promise.all([
      hauteurTitre(`http://localhost:4352/voir.html?url=${encodeURIComponent(url)}`, true),
      hauteurTitre(SITE + url, false),
    ]);
    if (m === null || s === null || Math.abs(m - s) > 2) ecarts.push(`${gabarit} ${url} maquette=${m} site=${s}`);
  }
}
await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
await navigateur.close();

for (const e of ecarts) console.log(`DÉCALÉ  ${e}`);
console.log(`${pages.length - ecarts.length}/${pages.length} titres à la hauteur de la maquette (${LARGEUR} px)`);
process.exit(ecarts.length ? 1 : 0);
