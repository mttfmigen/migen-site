/**
 * Les styles CALCULÉS de chaque texte de la page, maquette contre site.
 *
 *   node scripts/diff-styles.mjs /                 l'accueil
 *   node scripts/diff-styles.mjs /offres/residence/
 *
 * Complète diff-visuel-offre.mjs : la mesure au pixel dit QUELLE section
 * diverge, celle-ci dit QUELLE propriété, au pixel près (couleur, taille,
 * graisse, interlettrage, marge, largeur maximale, fond de pastille…). Chaque
 * élément porteur de texte est apparié par son texte ; un texte absent d'un
 * côté est listé. Sortie : une ligne par écart, « valeur maquette | valeur site ».
 */
import { chromium } from "playwright";

import { appliqueDecisions } from "./decisions-copie.mjs";

const chemin = process.argv[2] ?? "/";
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const MAQUETTE = chemin === "/"
  ? "http://localhost:4352/autonome.html"
  : `http://localhost:4352/voir.html?url=${encodeURIComponent(chemin)}`;

const PROPRIETES = [
  "color", "backgroundColor", "fontFamily", "fontSize", "fontWeight", "lineHeight",
  "letterSpacing", "textTransform", "padding", "borderTopWidth", "borderTopColor",
  "borderRadius", "maxWidth", "boxShadow", "gap", "marginTop", "marginBottom", "opacity",
];

async function releve(contexte, url, estMaquette) {
  const page = await contexte.newPage();
  await page.goto(url, { waitUntil: "load" });
  let cadre = page.mainFrame();
  if (estMaquette && url.includes("voir.html")) {
    await page.waitForFunction(() => document.getElementById("etat")?.textContent?.startsWith("page ouverte"), { timeout: 40000 });
    cadre = page.frames().find((f) => f.url().includes("autonome"));
  }
  await page.waitForTimeout(5000);
  await cadre.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  const releve = await cadre.evaluate((PROPRIETES) => {
    const racine = document.querySelector("main") ?? document.body;
    const sortie = {};
    for (const e of racine.querySelectorAll("*")) {
      if (e.closest("[data-dc-tpl='18'], header, footer, nav")) continue;
      const texte = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("")
        .replace(/\s+/g, " ").replace(/’/g, "'").trim();
      if (!texte || texte.length > 80 || sortie[texte]) continue;
      const cs = getComputedStyle(e);
      const boite = e.getBoundingClientRect();
      if (boite.width === 0) continue;
      // « Poppins Repli » borne le repli de next/font (app/globals.css) : même rendu.
      sortie[texte] = Object.fromEntries(PROPRIETES.map((p) => [p, String(cs[p]).replace('"Poppins Repli", ', "")]));
      sortie[texte].largeur = Math.round(boite.width);
      sortie[texte].hauteur = Math.round(boite.height);
    }
    return sortie;
  }, PROPRIETES);
  await page.close();
  return releve;
}

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({ viewport: { width: Number(process.env.LARGEUR ?? 1280), height: 1600 } });
const [mBrut, s] = await Promise.all([releve(contexte, MAQUETTE, true), releve(contexte, SITE + chemin, false)]);
/* Les textes de la maquette passent par les décisions de copie (lib/decisions-copie.ts)
   avant l'appariement : la donnée du site les porte déjà. */
const m = Object.fromEntries(
  Object.entries(mBrut).map(([texte, v]) => [appliqueDecisions(texte).replace(/’/g, "'"), v]),
);
await navigateur.close();

let ecarts = 0;
for (const [texte, a] of Object.entries(m)) {
  const b = s[texte];
  if (!b) { console.log(`ABSENT DU SITE  « ${texte} »`); ecarts += 1; continue; }
  const diff = PROPRIETES.filter((p) => a[p] !== b[p]).map((p) => `${p}: ${a[p]} | ${b[p]}`);
  if (Math.abs(a.largeur - b.largeur) > 3 || Math.abs(a.hauteur - b.hauteur) > 3) {
    diff.push(`taille: ${a.largeur}x${a.hauteur} | ${b.largeur}x${b.hauteur}`);
  }
  if (diff.length) { console.log(`« ${texte.slice(0, 60)} »\n   ${diff.join("\n   ")}`); ecarts += 1; }
}
for (const texte of Object.keys(s)) if (!m[texte]) { console.log(`EN TROP SUR LE SITE  « ${texte} »`); ecarts += 1; }
console.log(`\n${ecarts} écart(s) sur ${Object.keys(m).length} textes de la maquette`);
