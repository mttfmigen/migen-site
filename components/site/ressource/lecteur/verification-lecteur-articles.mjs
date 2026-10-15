#!/usr/bin/env bun
/**
 * Porte du lecteur latéral, sur son RENDU : ouvert depuis une carte du hub,
 * le panneau du site affiche ce que le panneau de la maquette « Ressources v2 »
 * affiche pour la même adresse, au téléphone (390 px) et au bureau (1280 px).
 *
 *   bun components/site/ressource/lecteur/verification-lecteur-articles.mjs \
 *     http://localhost:4496 "http://localhost:4481/Migen%20Ressources%20v2%20-%20Redesign.html" [filtre]
 *
 * (bun, pas node : la porte lit `lib/decisions-copie.ts`.)
 *
 * Pour chaque adresse du hub que la maquette porte (15 articles, 7 métiers,
 * 6 guides), aux deux largeurs :
 *   maquette : clic sur la carte du hub (onglet Techniciens pour les fiches),
 *              panneau `aside[role=dialog]` ;
 *   site     : clic sur la carte visible `a[href=URL]`, panneau
 *              `aside[aria-label="Lecture de la ressource"]` ; l'adresse
 *              devient celle de la ressource.
 * Les deux textes (`innerText`, ligne par ligne, dans l'ordre) doivent être
 * égaux, après les seules décisions de copie de Mehdi appliquées à la
 * maquette (`appliqueDecisions`, comme pour toute capture). Puis chaque
 * question de la FAQ est ouverte à son tour des deux côtés (une seule ouverte
 * à la fois) et le texte comparé de nouveau. La mise en page est comparée
 * sur quelques mesures : largeur du panneau, tailles du H1, du chapeau et du
 * premier H2, cadre de la photo, colonnes de la première grille de cartes,
 * aucun débordement horizontal du panneau.
 *
 * Les 12 billets repris, que la maquette n'a pas : le panneau doit suivre le
 * même gabarit (fil « Ressources / Article / … », pastilles, parties
 * numérotées 01…, appels de la maquette, « À lire ensuite »). Leur texte est
 * tenu par `verification-lecteur.ts`.
 *
 * Sortie 0 = « LECTEUR_CONFORME_MAQUETTE », 1 = écarts.
 */
import { chromium } from "playwright";

import { appliqueDecisions } from "../../../../lib/decisions-copie.ts";
import M from "../../../../lib/ressources-maquette.json";

const site = process.argv[2] ?? "http://localhost:4496";
const maquette = process.argv[3] ?? "http://localhost:4481/Migen%20Ressources%20v2%20-%20Redesign.html";
/** Facultatif : ne mesurer que les adresses qui contiennent ce texte. */
const filtre = process.argv[4] ?? "";
const PANNEAU_SITE = 'aside[aria-label="Lecture de la ressource"]';
const PANNEAU_MAQUETTE = 'aside[role="dialog"]';
const LARGEURS = [
  [1280, 900],
  [390, 844],
];
const TECH = new Set([...M.metiers, ...M.guides].map((x) => x.url));
const COMMUNES = [...M.articles, ...M.metiers, ...M.guides].map((x) => x.url);

/** Le panneau, ligne par ligne, et ses mesures. Exécuté dans la page. */
function releve(sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const lignes = el.innerText
    .split("\n")
    .map((l) => l.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const px = (e, p) => (e ? getComputedStyle(e)[p] : null);
  const photo = [...el.querySelectorAll("div")].find((d) => getComputedStyle(d).aspectRatio === "16 / 8");
  const grille = [...el.querySelectorAll("article div")].find(
    (d) => /^repeat\(\d+, ?minmax\(0/.test(d.style.gridTemplateColumns),
  );
  const r = photo?.getBoundingClientRect();
  return {
    lignes,
    mesures: {
      panneau: Math.round(el.getBoundingClientRect().width),
      deborde: el.scrollWidth - el.clientWidth,
      h1: px(el.querySelector("h1"), "fontSize"),
      chapeau: px(el.querySelector("header p"), "fontSize"),
      h2: px(el.querySelector("h2"), "fontSize"),
      photo: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : null,
      colonnes: grille ? getComputedStyle(grille).gridTemplateColumns.split(" ").length : null,
    },
  };
}

/** Ouvre la i-ème question de la FAQ (bouton « + » dans la maquette, `<summary>` sur le site). */
function ouvreQuestion([sel, i]) {
  const el = document.querySelector(sel);
  const qs = [...el.querySelectorAll("summary")].length
    ? [...el.querySelectorAll("summary")]
    : [...el.querySelectorAll("button")].filter((b) => b.lastElementChild?.textContent.trim() === "+");
  qs[i]?.click();
  return qs.length;
}

async function ouvreMaquette(p, url) {
  await p.goto(maquette, { waitUntil: "load" });
  await p.waitForSelector(`a[href="/ressources/articles/cout-arret-de-production/"]`, { timeout: 60000 });
  if (TECH.has(url)) await p.locator('button[role="tab"]', { hasText: "Techniciens" }).first().click();
  const carte = p.locator(`a[href="${url}"]:visible`, { hasText: "min de lecture" }).first();
  await carte.scrollIntoViewIfNeeded();
  await carte.click();
  await p.waitForSelector(`${PANNEAU_MAQUETTE} h1`, { timeout: 30000 });
  await p.waitForTimeout(500);
}

async function ouvreSite(p, url) {
  await p.goto(`${site}/ressources/`, { waitUntil: "load" });
  await p.waitForFunction(() => !!window.next?.router, null, { timeout: 60000 });
  // Le bandeau de consentement couvre le bas de l'écran : fermé dans la page,
  // sans choix enregistré (un clic écrirait une preuve en base).
  await p.evaluate(() => document.getElementById("bandeau-consentement")?.close());
  if (TECH.has(url)) await p.locator("button[aria-pressed]", { hasText: "Techniciens" }).first().click();
  const carte = p.locator(`a[href="${url}"]:visible`, { hasText: "min de lecture" }).first();
  await carte.scrollIntoViewIfNeeded();
  await carte.click();
  await p.waitForSelector(`${PANNEAU_SITE} h1`, { timeout: 60000 });
  await p.waitForTimeout(500);
  if (new URL(p.url()).pathname !== url) throw new Error(`adresse ${p.url()} au lieu de ${url}`);
}

/** Première ligne qui diffère, avec son voisinage. */
function difference(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      return `ligne ${i + 1} (maquette ${a.length} lignes, site ${b.length})\n      maquette : ${JSON.stringify(a.slice(Math.max(0, i - 1), i + 2))}\n      site     : ${JSON.stringify(b.slice(Math.max(0, i - 1), i + 2))}`;
    }
  }
  return null;
}

const nav = await chromium.launch({ channel: "chrome" });
const ecarts = [];
const conformes = [];

for (const [w, h] of LARGEURS) {
  const ctxM = await nav.newContext({ viewport: { width: w, height: h } });
  const ctxS = await nav.newContext({ viewport: { width: w, height: h } });
  const pm = await ctxM.newPage();
  const ps = await ctxS.newPage();
  for (const url of COMMUNES.filter((u) => u.includes(filtre))) {
    const ou = `${url} à ${w} px`;
    try {
      await ouvreMaquette(pm, url);
      await ouvreSite(ps, url);
      const compare = async (etape) => {
        const m = await pm.evaluate(releve, PANNEAU_MAQUETTE);
        const s = await ps.evaluate(releve, PANNEAU_SITE);
        const attendu = m.lignes.map((l) => appliqueDecisions(l, url));
        const d = difference(attendu, s.lignes);
        if (d) ecarts.push(`${ou}, ${etape} : texte, ${d}`);
        const md = JSON.stringify(m.mesures);
        const sd = JSON.stringify(s.mesures);
        if (md !== sd) ecarts.push(`${ou}, ${etape} : mesures maquette ${md}\n      site ${sd}`);
        return !d && md === sd;
      };
      let ok = await compare("fermé");
      const nq = await pm.evaluate(ouvreQuestion, [PANNEAU_MAQUETTE, -1]);
      const nqs = await ps.evaluate(ouvreQuestion, [PANNEAU_SITE, -1]);
      if (nq !== nqs) {
        ecarts.push(`${ou} : ${nq} questions dans la maquette, ${nqs} sur le site`);
        ok = false;
      }
      for (let i = 0; i < Math.min(nq, nqs); i++) {
        await pm.evaluate(ouvreQuestion, [PANNEAU_MAQUETTE, i]);
        await ps.evaluate(ouvreQuestion, [PANNEAU_SITE, i]);
        await pm.waitForTimeout(80);
        ok = (await compare(`question ${i + 1} ouverte`)) && ok;
      }
      if (ok) conformes.push(ou);
    } catch (e) {
      ecarts.push(`${ou} : mesure impossible (${String(e).slice(0, 200)})`);
    }
  }

  // Les billets repris : même gabarit, sans maquette en face.
  await ps.goto(`${site}/ressources/`, { waitUntil: "load" });
  const hrefs = await ps.$$eval('a[href^="/ressources/articles/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  const billets = hrefs.filter((u) => /^\/ressources\/articles\/[^/]+\/$/.test(u) && !COMMUNES.includes(u) && u.includes(filtre));
  for (const url of billets) {
    const ou = `${url} à ${w} px (billet repris)`;
    try {
      await ouvreSite(ps, url);
      const { lignes, mesures } = await ps.evaluate(releve, PANNEAU_SITE);
      const manque = [];
      if (lignes[3] !== "Ressources" || lignes[4] !== "/" || lignes[5] !== "Article") manque.push(`fil ${JSON.stringify(lignes.slice(3, 8))}`);
      if (!lignes.some((l) => / min de lecture$/.test(l)) || !lignes.some((l) => /^\d+ parties$/.test(l))) manque.push("pastilles");
      if (!lignes.includes("Écrit par nos équipes terrain")) manque.push("signature des équipes");
      if (!lignes.includes("01")) manque.push("parties numérotées");
      if (!lignes.includes("Un chargé d’affaires vous rappelle dans l’heure.")) manque.push("appel de fin");
      if (lignes.at(-2) !== "À LIRE ENSUITE") manque.push(`fin ${JSON.stringify(lignes.slice(-2))}`);
      if (lignes.includes("Accueil") || lignes.includes("SOMMAIRE")) manque.push("ancien gabarit (Accueil, Sommaire)");
      if (mesures.deborde > 0) manque.push(`débordement ${mesures.deborde} px`);
      if (manque.length) ecarts.push(`${ou} : ${manque.join(", ")}`);
      else conformes.push(ou);
    } catch (e) {
      ecarts.push(`${ou} : mesure impossible (${String(e).slice(0, 200)})`);
    }
  }
  await ctxM.close();
  await ctxS.close();
}
await nav.close();

console.log(`${conformes.length} conformes :\n  ${conformes.join("\n  ")}`);
if (ecarts.length) {
  console.error(`\n${ecarts.length} écart(s) :\n${ecarts.join("\n")}`);
  process.exit(1);
}
console.log("LECTEUR_CONFORME_MAQUETTE : chaque panneau ouvert depuis le hub dit et dessine ce que la maquette dit et dessine.");
