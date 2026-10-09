#!/usr/bin/env node
/**
 * MESURE DES PHOTOS SUR LES PAGES SERVIES, DANS UN NAVIGATEUR, 09/10/2025.
 *
 *   node scripts/mesure-photos-navigateur.mjs              toutes les pages de l'index
 *   node scripts/mesure-photos-navigateur.mjs /secteurs/   celles-là seulement
 *
 * POURQUOI UN NAVIGATEUR. Les pages ne portent qu'UNE balise `<img>` dans leur
 * HTML : les images sont posées à l'hydratation (CLAUDE.md). Un `curl` ne les
 * voit pas, et `scripts/mesure-photos-site.mjs` ne voit que les fiches. Or une
 * page servie montre PLUS de photos que sa fiche n'en porte : plusieurs
 * composants partagés portent leurs propres listes de photos en dur
 * (`components/site/expertises/expertises-donnees.ts`,
 * `components/site/carriere/donnees-hub.ts`, `components/site/entete-donnees.ts`,
 * `ReferencesOffre.tsx`, `MaillageOffres.tsx`, `MaillageVille.tsx`,
 * `SecteursDomaine.tsx`, `OffresDomaine.tsx`, …). C'est la seule mesure qui dise
 * ce que Mehdi voit.
 *
 * Elle rend les mêmes quatre chiffres que la mesure des fiches, plus deux :
 * les images cassées et les réponses 4xx/5xx, qu'aucune lecture de fichier ne
 * peut donner.
 *
 * Le serveur de dev doit tourner (http://localhost:4340, ou `SITE_URL`).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.SITE_URL ?? "http://localhost:4340";
const PARALLELE = Number(process.env.PARALLELE ?? 4);

const INDEX = JSON.parse(readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"));
const REGISTRE = JSON.parse(readFileSync(join(RACINE, "public", "assets", "photos", "registre.json"), "utf8"));
const DU_REGISTRE = new Set(REGISTRE.map((p) => `/assets/photos/${p.fichier}`));

const demandees = process.argv.slice(2);
const URLS = (demandees.length ? demandees : INDEX.map((e) => e.url)).filter(Boolean);

/** Le fichier servi derrière un `src`, `/_next/image?url=` décodé. */
function cheminServi(src) {
  const m = /[?&]url=([^&]+)/.exec(src);
  const brut = m ? decodeURIComponent(m[1]) : src;
  return brut.replace(BASE, "").replace(/^https?:\/\/[^/]+/, "");
}

const nav = await chromium.launch({ channel: "chrome" });

async function lis(url) {
  const page = await nav.newPage();
  const rates = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && /\/_next\/image|\/assets\//.test(r.url())) rates.push(`${r.status()} ${r.url()}`);
  });
  try {
    await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 60000 });
    const vues = await page.$$eval("img", (imgs) =>
      imgs.map((i) => ({ src: i.currentSrc || i.src, cassee: i.complete && i.naturalWidth === 0 })),
    );
    const photos = vues
      .map((v) => ({ ...v, chemin: cheminServi(v.src) }))
      .filter((v) => /^\/assets\/(web|photos|villes)\//.test(v.chemin));
    return { url, photos, rates, cassees: photos.filter((p) => p.cassee).map((p) => p.chemin) };
  } catch (erreur) {
    return { url, photos: [], rates, cassees: [], erreur: String(erreur).split("\n")[0] };
  } finally {
    await page.close();
  }
}

const resultats = [];
for (let i = 0; i < URLS.length; i += PARALLELE) {
  resultats.push(...(await Promise.all(URLS.slice(i, i + PARALLELE).map(lis))));
  process.stderr.write(`\r${Math.min(i + PARALLELE, URLS.length)}/${URLS.length} pages lues`);
}
process.stderr.write("\n");
await nav.close();

const total = new Map();
const repetent = [];
const erreurs = [];
for (const r of resultats) {
  if (r.erreur) erreurs.push(`${r.url} : ${r.erreur}`);
  if (r.cassees.length) erreurs.push(`${r.url} : image(s) cassée(s) ${r.cassees.join(", ")}`);
  if (r.rates.length) erreurs.push(`${r.url} : ${r.rates.length} réponse(s) ≥400, ${r.rates.slice(0, 2).join(", ")}`);
  const compte = new Map();
  for (const p of r.photos) {
    compte.set(p.chemin, (compte.get(p.chemin) ?? 0) + 1);
    total.set(p.chemin, (total.get(p.chemin) ?? 0) + 1);
  }
  const doubles = [...compte.entries()].filter(([, n]) => n > 1).sort();
  if (doubles.length) repetent.push({ url: r.url, doubles });
}

const classement = [...total.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const utilisees = classement.filter(([p]) => DU_REGISTRE.has(p));

console.log(`Pages lues dans le navigateur    : ${resultats.length}`);
console.log(`Photos affichées                 : ${[...total.values()].reduce((s, n) => s + n, 0)}`);
console.log(`1. photos distinctes servies     : ${total.size}`);
console.log(`2. répétition maximale           : ${classement[0]?.[1] ?? 0}  (${classement[0]?.[0] ?? "-"})`);
console.log(`3. pages qui répètent une photo  : ${repetent.length}`);
console.log(`4. photos du registre utilisées  : ${utilisees.length} / ${REGISTRE.length}`);
console.log(`   images cassées ou 4xx/5xx     : ${erreurs.length}`);

if (process.argv.includes("--detail") || demandees.length) {
  console.log("\n-- les 15 photos les plus affichées");
  for (const [photo, n] of classement.slice(0, 15)) console.log(`${String(n).padStart(5)} ${photo}`);
  console.log("\n-- pages qui répètent une photo");
  for (const p of repetent) console.log(`${p.url} : ${p.doubles.map(([photo, n]) => `${photo} ×${n}`).join(", ")}`);
}
if (erreurs.length) {
  console.error(`\n${erreurs.length} défaut(s) de chargement :\n  ${erreurs.join("\n  ")}`);
  process.exit(1);
}
console.log("\naucune image cassée, aucune réponse 4xx/5xx sur les images.");
