#!/usr/bin/env node
/**
 * Le relevé `window.__MGRES` de la maquette « Ressources v2 », tel quel, en
 * JSON importable par le lecteur latéral : `lib/ressources-maquette.json`.
 * Aucune recopie à la main : le fichier se régénère depuis la maquette.
 *
 *   node scripts/genere-ressources-maquette.mjs             écrit le JSON
 *   node scripts/genere-ressources-maquette.mjs --controle  échoue s'il a dérivé
 *
 * Source : `maquette/mobile-v2/maquette/ressources-data.js`, identique octet
 * pour octet au `__MGRES` de « Migen Ressources v2 - Redesign.html ».
 */
import { readFileSync, writeFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const SOURCE = new URL("../maquette/mobile-v2/maquette/ressources-data.js", import.meta.url);
const CIBLE = new URL("../lib/ressources-maquette.json", import.meta.url);

const fenetre = {};
runInNewContext(readFileSync(SOURCE, "utf8"), { window: fenetre });
if (!fenetre.__MGRES?.articles?.length) {
  console.error("ressources-data.js ne pose pas window.__MGRES.articles");
  process.exit(1);
}
const json = `${JSON.stringify(fenetre.__MGRES, null, 1)}\n`;

if (process.argv.includes("--controle")) {
  let actuel = "";
  try {
    actuel = readFileSync(CIBLE, "utf8");
  } catch {
    // Fichier absent : dérivé, comme un fichier différent.
  }
  if (actuel !== json) {
    console.error("lib/ressources-maquette.json a dérivé de la maquette : relancer node scripts/genere-ressources-maquette.mjs");
    process.exit(1);
  }
  console.log("lib/ressources-maquette.json identique au relevé de la maquette.");
} else {
  writeFileSync(CIBLE, json);
  const n = ["articles", "paused", "metiers", "guides"].map((g) => `${fenetre.__MGRES[g].length} ${g}`).join(", ");
  console.log(`lib/ressources-maquette.json écrit : ${n}.`);
}
