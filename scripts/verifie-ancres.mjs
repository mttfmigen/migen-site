#!/usr/bin/env node
/**
 * TOUTE ANCRE INTERNE A-T-ELLE SA CIBLE DANS LA PAGE ?
 *
 *   node scripts/verifie-ancres.mjs [adresse]
 *   node scripts/verifie-ancres.mjs --controle     preuve qu'elle sait échouer
 *
 * POURQUOI ELLE EXISTE. Balayage du 11/10 : 22 ancres ne menaient nulle part.
 *   21 fois `#mgx-form`, le bouton « Poser ma question » sous la FAQ, sur
 *   toute la branche commerciale. Les captures figées posent pourtant
 *   `id="mgx-form"` sur l'écran « 10 Appel final », et les gabarits
 *   Expertises, Domaine, Spécialité et Secteur le faisaient ; PageOffre et
 *   PageOffres l'avaient oublié.
 *   1 fois `#formulaire`, le bouton « Demander une intervention » de
 *   /offres/depannage-industriel/. Le dépôt vise `#besoin` dans 104 fiches ;
 *   deux fiches seulement portaient `#formulaire`, et c'étaient les cassées.
 *
 * Un bouton qui ne fait rien quand on clique est un défaut qu'aucune porte de
 * ce dépôt ne voyait : toutes mesuraient le TEXTE rendu, aucune la cohérence
 * des ancres.
 *
 * CE QU'ELLE NE CONTRÔLE PAS : les cibles posées après coup par du
 * JavaScript. Le site les pose au rendu, donc la mesure sur le HTML servi
 * suffit ; si cela changeait, la porte deviendrait trop sévère.
 */
import { readFileSync } from "node:fs";

const CONTROLE = process.argv.includes("--controle");
const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:4340";

/** Les ancres qui ne désignent aucune cible : `#` nu et `#top`, gérés par le navigateur. */
const TOLEREES = new Set(["", "top"]);

/** Les ancres mortes d'un document : citées en href, absentes des id. */
function ancresMortes(html) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const noms = new Set([...html.matchAll(/<a\b[^>]*\sname="([^"]+)"/g)].map((m) => m[1]));
  const mortes = new Map();
  for (const m of html.matchAll(/<a\b[^>]*\shref="#([^"]*)"[^>]*>([\s\S]{0,120}?)<\/a>/g)) {
    const cible = m[1];
    if (TOLEREES.has(cible)) continue;
    if (ids.has(cible) || noms.has(cible)) continue;
    const libelle = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 44);
    if (!mortes.has(cible)) mortes.set(cible, libelle || "(sans libellé)");
  }
  return mortes;
}

if (CONTROLE) {
  const CAS = [
    ["ancre avec sa cible", '<a href="#besoin">Aller</a><div id="besoin"></div>', false],
    ["ancre sans cible", '<a href="#mgx-form">Poser ma question</a><div id="besoin"></div>', true],
    ["cible posée par name=", '<a href="#ici">Aller</a><a name="ici"></a>', false],
    ["dièse nu, toléré", '<a href="#">Aller</a>', false],
    ["deux ancres, une morte", '<a href="#a">A</a><a href="#b">B</a><div id="a"></div>', true],
  ];
  let bons = 0;
  for (const [nom, html, doitTomber] of CAS) {
    const tombe = ancresMortes(html).size > 0;
    console.log(`  ${tombe === doitTomber ? "OK  " : "RATÉ"}  ${nom.padEnd(26)} ${tombe ? "refusé" : "accepté"}`);
    if (tombe === doitTomber) bons++;
  }
  console.log(bons === CAS.length ? `\nCONTRÔLE OK : ${bons}/${CAS.length}` : `\nCONTRÔLE ÉCHOUÉ : ${bons}/${CAS.length}`);
  process.exit(bons === CAS.length ? 0 : 1);
}

const idx = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8"));
const urls = [...new Set((idx.pages ?? idx).map((p) => p.url ?? p.chemin ?? p))];

const defauts = [];
const injoignables = [];
let ancres = 0;

for (let i = 0; i < urls.length; i += 16) {
  await Promise.all(
    urls.slice(i, i + 16).map(async (u) => {
      let html;
      try {
        const r = await fetch(new URL(u, BASE));
        if (!r.ok) return injoignables.push(`${u} (${r.status})`);
        html = await r.text();
      } catch (e) {
        return injoignables.push(`${u} (${e.code ?? e.message})`);
      }
      ancres += [...html.matchAll(/<a\b[^>]*\shref="#/g)].length;
      for (const [cible, libelle] of ancresMortes(html)) {
        defauts.push(`${u}\n      #${cible}  « ${libelle} »  ne mène nulle part`);
      }
    }),
  );
}

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`);
  injoignables.slice(0, 5).forEach((u) => console.error(`  ${u}`));
  process.exit(2);
}
if (defauts.length) {
  console.error(`${defauts.length} ancre(s) morte(s) :\n`);
  defauts.slice(0, 30).forEach((d) => console.error(`  ${d}`));
  if (defauts.length > 30) console.error(`  ... et ${defauts.length - 30} autre(s)`);
  process.exit(1);
}
console.log(`TOUTES_LES_ANCRES_ONT_LEUR_CIBLE  ${ancres} ancres sur ${urls.length} pages`);
