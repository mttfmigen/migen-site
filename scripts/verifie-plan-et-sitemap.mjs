#!/usr/bin/env node
/**
 * PORTE : le plan du site HTML et le plan XML annoncent les mêmes pages, et
 * toutes répondent. « sitemap.xml » désigne ici le plan XML entier : l'index
 * `/sitemap_index.xml` et ses sous-plans, lus par `scripts/plan-xml.mjs`.
 *
 *   node scripts/verifie-plan-et-sitemap.mjs https://migen-site.vercel.app
 *   node scripts/verifie-plan-et-sitemap.mjs http://localhost:4430
 *
 * POURQUOI. Mesuré le 14/10 vers 14h : sitemap.xml servait 259 adresses, le
 * <main> de /plan-du-site/ n'en listait que 145. Les deux listes viennent
 * désormais de `lib/pages-publiees.ts` ; cette porte le vérifie sur le site
 * servi, pas sur le code.
 *
 * ELLE EXIGE, et nomme chaque chemin fautif :
 *   (a) le même ensemble de chemins dans sitemap.xml et dans le <main> du plan ;
 *   (b) chaque <loc> sur https://migen.fr (le domaine final, jamais vercel.app) ;
 *   (c) chaque chemin en 200 SANS redirection sur l'URL mesurée (curl sans -L) ;
 *   (d) aucune des quatre adresses périmées, qui répondent 301 ;
 *   (e) le texte de chaque lien du plan égal au H1 que la page sert.
 * Puis elle imprime PLAN_ET_SITEMAP_ALIGNES.
 *
 * LE COMPTE N'EST PAS ÉCRIT EN DUR : une redirection ajoutée sort sa source des
 * deux listes à la fois, l'égalité (a) reste vraie avec 259 moins elle.
 *
 * ELLE SAIT ÉCHOUER (contre-essais) :
 *   MIGEN_FAUTE=retire:/contact/  le plan perd /contact/ : (a) tombe et le nomme
 *   MIGEN_FAUTE=perime            le plan gagne /realisations/ : (c) et (d)
 *   MIGEN_FAUTE=hote              un <loc> passe sur vercel.app : (b)
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { locsDuPlan } from "./plan-xml.mjs";

const executer = promisify(execFile);

const BASE = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\/[^/]+$/.test(BASE)) {
  console.error("usage : node scripts/verifie-plan-et-sitemap.mjs <https://hote>");
  process.exit(2);
}
const FAUTE = process.env.MIGEN_FAUTE ?? "";
const HOTE_FINAL = "https://migen.fr";
const PERIMEES = [
  "/implantations/maintenance-industrielle-marseille/",
  "/implantations/toulouse/bordeaux/",
  "/offres/maintenance-externalisee/",
  "/realisations/",
];
const PARALLELE = 8;

/** Une requête curl SANS suivre les redirections : corps, statut, cible. */
async function curl(url) {
  const { stdout } = await executer(
    "curl",
    ["-s", "--max-time", "60", "-w", "\n__STATUT__%{http_code} %{redirect_url}", url],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const i = stdout.lastIndexOf("\n__STATUT__");
  const [statut, cible = ""] = stdout.slice(i + 11).split(" ");
  return { corps: stdout.slice(0, i), statut: Number(statut), cible };
}

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Le texte d'un fragment HTML, normalisé comme `instantane-texte-main.mjs`. */
function texte(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n.toLowerCase()] ?? m)
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const main = (html) => /<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? "";

/* ------------------------------------------------------------ les listes */

// Le plan XML est un index et ses sous-plans depuis le 14/10 (format de
// l'ancien migen.fr) : `locsDuPlan` les lit tous.
let locs;
try {
  locs = await locsDuPlan(BASE);
} catch (e) {
  console.error(`${e.message} : rien à comparer`);
  process.exit(1);
}
const plan = await curl(`${BASE}/plan-du-site/`);
if (plan.statut !== 200) {
  console.error(`/plan-du-site/ ${plan.statut} : rien à comparer`);
  process.exit(1);
}

if (FAUTE === "hote") locs[1] = locs[1].replace(HOTE_FINAL, BASE);

/** Lien du plan : chemin -> texte du lien. Seuls les liens internes du <main>. */
const liens = new Map();
for (const m of main(plan.corps).matchAll(/<a\b[^>]*href="(\/[^"#?]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
  liens.set(m[1], texte(m[2]));
}
if (FAUTE.startsWith("retire:")) liens.delete(FAUTE.slice(7));
if (FAUTE === "perime") liens.set("/realisations/", "Réalisations");

const fautes = [];

/* (b) le domaine final */
const cheminsSitemap = new Set();
for (const loc of locs) {
  if (!loc.startsWith(`${HOTE_FINAL}/`)) fautes.push(`(b) <loc> hors de ${HOTE_FINAL} : ${loc}`);
  cheminsSitemap.add(loc.replace(/^https?:\/\/[^/]+/, ""));
}
if (cheminsSitemap.size !== locs.length) {
  fautes.push(`(a) sitemap.xml répète des adresses : ${locs.length} <loc> pour ${cheminsSitemap.size} chemins`);
}

/* (a) le même ensemble */
const cheminsPlan = new Set(liens.keys());
for (const c of cheminsSitemap) if (!cheminsPlan.has(c)) fautes.push(`(a) dans sitemap.xml, absent du plan : ${c}`);
for (const c of cheminsPlan) if (!cheminsSitemap.has(c)) fautes.push(`(a) dans le plan, absent de sitemap.xml : ${c}`);

/* (d) les adresses périmées */
for (const c of PERIMEES) {
  if (cheminsSitemap.has(c)) fautes.push(`(d) adresse périmée dans sitemap.xml : ${c}`);
  if (cheminsPlan.has(c)) fautes.push(`(d) adresse périmée dans le plan : ${c}`);
}

/* (c) chaque chemin en 200 sans redirection, (e) son H1 = le texte du lien */
const aMesurer = [...new Set([...cheminsSitemap, ...cheminsPlan])].sort();
let enDeuxCents = 0;
let titresEgaux = 0;
for (let i = 0; i < aMesurer.length; i += PARALLELE) {
  await Promise.all(
    aMesurer.slice(i, i + PARALLELE).map(async (chemin) => {
      const r = await curl(`${BASE}${chemin}`);
      if (r.statut !== 200) {
        fautes.push(`(c) ${chemin} répond ${r.statut}${r.cible ? ` vers ${r.cible}` : ""}`);
        return;
      }
      enDeuxCents += 1;
      if (!liens.has(chemin)) return; // déjà nommé par (a)
      const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(main(r.corps))?.[1];
      const servi = h1 === undefined ? "(aucun H1 dans le <main>)" : texte(h1);
      if (servi === liens.get(chemin)) titresEgaux += 1;
      else fautes.push(`(e) ${chemin} : le plan écrit « ${liens.get(chemin)} », la page sert « ${servi} »`);
    }),
  );
}

console.log(`Mesuré sur ${BASE}`);
console.log(`  sitemap.xml : ${locs.length} <loc>, ${cheminsSitemap.size} chemins`);
console.log(`  plan du site : ${cheminsPlan.size} chemins dans le <main>`);
console.log(`  en 200 sans redirection : ${enDeuxCents} sur ${aMesurer.length}`);
console.log(`  liens égaux au H1 servi : ${titresEgaux} sur ${cheminsPlan.size}`);

if (fautes.length) {
  console.error(`\n${fautes.length} faute(s) :`);
  for (const f of fautes.sort()) console.error(`  ${f}`);
  process.exit(1);
}
console.log("PLAN_ET_SITEMAP_ALIGNES");
