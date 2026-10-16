/**
 * Les six blocages de l'accueil mobile tiennent-ils leurs promesses ?
 *
 *   bun scripts/verifie-parcours-mobile.mjs
 *
 * SOUS `bun` ET NON `node` : il lit la copie dans `lib/parcours-mobile.ts`,
 * pour mesurer le rendu contre la SOURCE et non contre une liste recopiée qui
 * dériverait. Node ne sait pas importer un module TypeScript.
 *
 * CE QU'IL DÉFEND. `components/site/accueil/ParcoursMobile.tsx` porte
 * « Qu'est-ce qui vous bloque ? » de la maquette V3 « Site mobile » (validée
 * par Mehdi le 16/10) : six CARTES-LIENS, chacune ouvre directement la page de
 * l'offre qui répond au blocage. Trois choses peuvent s'y casser sans bruit :
 *
 *  1. UN LIEN MORT. Une adresse qui change ailleurs dans le site laisserait ici
 *     un lien vers une 404, sur la page la plus visitée et au premier écran du
 *     téléphone.
 *  2. LE TEXTE HORS DU HTML. La phrase du visiteur et le nom de l'offre doivent
 *     être dans le HTML SERVI.
 *  3. LA CARTE QUI N'EST PLUS UN LIEN. Chaque carte est un `<a href>` vers son
 *     offre, et son texte (donc son nom accessible) porte la phrase du
 *     visiteur et le nom de l'offre.
 *
 * Il vérifie enfin que le bloc est bien RÉSERVÉ AU TÉLÉPHONE : la feuille
 * doit le masquer par défaut et ne l'afficher que sous 880 px. Sur bureau, la
 * grille d'offres reste l'entrée en matière.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";

const { PROBLEMES } = await import(join(RACINE, "lib/parcours-mobile.ts"));

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const adresses = new Set(pagesIndex.map((p) => p?.url).filter(Boolean));

const feuille = readFileSync(join(RACINE, "components/site/accueil/ParcoursMobile.module.css"), "utf8");

const sansBalises = (html) =>
  html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");

const accueil = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(30000) });
if (!accueil.ok) {
  console.log(`la page d'accueil repond ${accueil.status} : rien a mesurer.`);
  process.exit(1);
}
const html = await accueil.text();
const texte = sansBalises(html);

const fautes = [];

/* 1 · les six adresses existent, et elles repondent. */
for (const p of PROBLEMES) {
  if (!adresses.has(p.href)) {
    fautes.push(`${p.numero} : « ${p.href} » n'est pas une adresse de l'index`);
    continue;
  }
  try {
    const r = await fetch(SITE + p.href, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    if (r.status !== 200) fautes.push(`${p.numero} : « ${p.href} » rend ${r.status}`);
  } catch (e) {
    fautes.push(`${p.numero} : « ${p.href} » injoignable (${e.message})`);
  }
}

/* 2 · la phrase et le nom de l'offre sont dans le HTML servi. */
for (const p of PROBLEMES) {
  for (const [quoi, valeur] of [
    ["phrase", p.question],
    ["offre", p.offre],
  ]) {
    if (!texte.includes(sansBalises(valeur).trim())) {
      fautes.push(`${p.numero} : la ${quoi} n'est pas dans le HTML servi`);
    }
  }
}

/* 3 · chaque carte est un lien vers son offre, qui porte la phrase et l'offre. */
const liens = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
  href: m[1],
  texte: sansBalises(m[2]).trim(),
}));
for (const p of PROBLEMES) {
  const carte = liens.find(
    (l) => l.href === p.href && l.texte.includes(sansBalises(p.question).trim()),
  );
  if (!carte) {
    fautes.push(`${p.numero} : aucune carte-lien vers « ${p.href} » ne porte la phrase du visiteur`);
  } else if (!carte.texte.includes(sansBalises(p.offre).trim())) {
    fautes.push(`${p.numero} : la carte-lien vers « ${p.href} » ne nomme pas l'offre`);
  }
}

/* 4 · reserve au telephone. */
if (!/\.parcours\s*\{[^}]*display:\s*none/.test(feuille)) {
  fautes.push("la feuille ne masque pas le parcours par défaut : il paraîtrait sur bureau");
}
if (!/@media\s*\(max-width:\s*880px\)[\s\S]{0,200}\.parcours\s*\{[^}]*display:\s*block/.test(feuille)) {
  fautes.push("la feuille ne l'affiche pas sous 880 px : il ne paraîtrait nulle part");
}

if (fautes.length > 0) {
  for (const f of fautes) console.log(`  ${f}`);
  console.log(`\n${fautes.length} defaut(s) sur les blocages de l'accueil mobile.`);
  process.exit(1);
}

console.log(
  `parcours mobile conforme (${PROBLEMES.length} cartes-liens, ${PROBLEMES.length} pages en 200, ` +
    `texte dans le HTML servi, reserve au telephone)`,
);
