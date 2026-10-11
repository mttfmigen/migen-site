#!/usr/bin/env node
/**
 * TOUT TABLEAU QUI DÉBORDE SE LAISSE-T-IL ATTEINDRE AU CLAVIER ?
 *
 *   node scripts/verifie-tableaux.mjs [adresse]
 *   node scripts/verifie-tableaux.mjs --controle     preuve qu'elle sait échouer
 *
 * POURQUOI ELLE EXISTE. Le 10/10, 82 des 84 tableaux du site débordaient de
 * leur conteneur en 390 px. Le diagnostic annonçait « tableaux illisibles au
 * téléphone » ; la mesure a dit autre chose, et c'est une correction utile :
 * les 82 vivent dans un conteneur à défilement, donc AUCUNE donnée n'était
 * perdue. On pouvait faire venir les colonnes de droite.
 *
 * Le vrai défaut était ailleurs : seuls 6 des 82 conteneurs portaient
 * `tabindex="0"`. Un conteneur à défilement qui n'est pas focusable ne se fait
 * pas défiler au clavier (WCAG SC 2.1.1) : 48 pages sur 51 ne montraient
 * jamais leurs colonnes de droite à qui n'utilise pas de souris.
 *
 * CE QU'ELLE CONTRÔLE, sur chaque tableau qui déborde réellement :
 *   1. son conteneur défile (sinon la donnée est coupée, c'est plus grave) ;
 *   2. il est atteignable au clavier, `tabindex="0"` ;
 *   3. il est annoncé, `role="region"` plus un nom accessible, sans quoi un
 *      lecteur d'écran traverse la zone sans dire qu'elle défile.
 *
 * LE PIÈGE QU'ELLE ÉVITE, et qui a déjà fait conclure à tort sur ce dépôt :
 * `.mg-site` est en `overflow-x: clip`, donc le `scrollWidth` du DOCUMENT
 * reste égal au viewport même quand un élément déborde largement. On mesure
 * L'ÉLÉMENT contre son hôte, jamais le document contre la fenêtre.
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const CONTROLE = process.argv.includes("--controle");
const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:4340";
const LARGEUR = 390;

/** Le relevé fait DANS la page. Rendu en texte pour servir aussi au témoin. */
const RELEVE = `[...document.querySelectorAll('table')].map((t) => {
  const hote = t.parentElement;
  const ox = hote ? getComputedStyle(hote).overflowX : 'visible';
  const peutDefiler = ox === 'auto' || ox === 'scroll';
  const largeurHote = hote ? hote.getBoundingClientRect().width : window.innerWidth;
  const nom = hote && (hote.getAttribute('aria-label') || hote.getAttribute('aria-labelledby'));
  return {
    deborde: t.scrollWidth > largeurHote + 1,
    peutDefiler,
    auClavier: hote ? hote.getAttribute('tabindex') === '0' : false,
    annonce: !!(hote && (hote.getAttribute('role') === 'region' || hote.getAttribute('role') === 'group') && nom),
  };
})`;

const navigateur = await chromium.launch({ channel: "chrome" });
const ctx = await navigateur.newContext({
  viewport: { width: LARGEUR, height: 844 },
  isMobile: true,
  hasTouch: true,
});

/** Juge un relevé : rend la liste des manquements. */
function juge(releves, ou) {
  const manques = [];
  for (const r of releves) {
    if (!r.deborde) continue;
    if (!r.peutDefiler) manques.push(`${ou} : tableau coupé, son conteneur ne défile pas`);
    else if (!r.auClavier) manques.push(`${ou} : conteneur à défilement sans tabindex="0", inatteignable au clavier`);
    else if (!r.annonce) manques.push(`${ou} : conteneur atteignable mais muet, ni role="region" ni nom`);
  }
  return manques;
}

if (CONTROLE) {
  // Un tableau large dans un conteneur étroit : le défaut, décliné.
  const CELLULES = Array.from({ length: 9 }, (_, i) => `<td style="min-width:120px">colonne ${i}</td>`).join("");
  const TABLE = `<table><tbody><tr>${CELLULES}</tr></tbody></table>`;
  const CAS = [
    ["conteneur qui ne défile pas", `<div style="width:300px">${TABLE}</div>`, true],
    ["défile mais sans tabindex", `<div style="width:300px;overflow-x:auto">${TABLE}</div>`, true],
    ["tabindex mais muet", `<div style="width:300px;overflow-x:auto" tabindex="0">${TABLE}</div>`, true],
    ["role sans nom", `<div style="width:300px;overflow-x:auto" tabindex="0" role="region">${TABLE}</div>`, true],
    ["conforme", `<div style="width:300px;overflow-x:auto" tabindex="0" role="region" aria-label="Tableau, défilement horizontal possible">${TABLE}</div>`, false],
    ["tableau qui tient, sans rien", `<div style="width:300px"><table><tbody><tr><td>court</td></tr></tbody></table></div>`, false],
  ];
  let bons = 0;
  const p = await ctx.newPage();
  for (const [nom, html, doitTomber] of CAS) {
    await p.setContent(`<!doctype html><body style="margin:0">${html}</body>`);
    const manques = juge(await p.evaluate(RELEVE), "/témoin");
    const tombe = manques.length > 0;
    console.log(`  ${tombe === doitTomber ? "OK  " : "RATÉ"}  ${nom.padEnd(30)} ${tombe ? "refusé" : "accepté"}`);
    if (tombe === doitTomber) bons++;
  }
  await navigateur.close();
  console.log(bons === CAS.length ? `\nCONTRÔLE OK : ${bons}/${CAS.length}` : `\nCONTRÔLE ÉCHOUÉ : ${bons}/${CAS.length}`);
  process.exit(bons === CAS.length ? 0 : 1);
}

const idx = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8"));
const urls = [...new Set((idx.pages ?? idx).map((p) => p.url ?? p.chemin ?? p))];

// Repérage par le HTML servi : inutile d'ouvrir un navigateur sur 248 pages
// quand une cinquantaine seulement portent un tableau.
const avecTable = [];
const injoignables = [];
for (let i = 0; i < urls.length; i += 16) {
  await Promise.all(
    urls.slice(i, i + 16).map(async (u) => {
      try {
        const r = await fetch(new URL(u, BASE));
        if (!r.ok) return injoignables.push(`${u} (${r.status})`);
        if (/<table\b/i.test(await r.text())) avecTable.push(u);
      } catch (e) {
        injoignables.push(`${u} (${e.code ?? e.message})`);
      }
    }),
  );
}

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`);
  injoignables.slice(0, 5).forEach((u) => console.error(`  ${u}`));
  await navigateur.close();
  process.exit(2);
}

let tableaux = 0;
let debordent = 0;
const manquements = [];

for (const url of avecTable.sort()) {
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.waitForTimeout(400);
    const releves = await p.evaluate(RELEVE);
    tableaux += releves.length;
    debordent += releves.filter((r) => r.deborde).length;
    manquements.push(...juge(releves, url));
  } catch (e) {
    injoignables.push(`${url} (${e.message.slice(0, 50)})`);
  }
  await p.close();
}
await navigateur.close();

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) non mesurée(s)`);
  injoignables.forEach((u) => console.error(`  ${u}`));
  process.exit(2);
}

if (manquements.length) {
  console.error(`${manquements.length} tableau(x) hors de portée du clavier, sur ${avecTable.length} pages :\n`);
  manquements.slice(0, 30).forEach((m) => console.error(`  ${m}`));
  if (manquements.length > 30) console.error(`  ... et ${manquements.length - 30} autre(s)`);
  process.exit(1);
}

console.log(
  `TABLEAUX_ATTEIGNABLES  ${tableaux} tableaux sur ${avecTable.length} pages, ` +
    `${debordent} débordent en ${LARGEUR} px, tous dans un conteneur qui défile, ` +
    `atteignable au clavier et annoncé`,
);
