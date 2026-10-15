// Les intitulés de colonnes des tableaux « offre » de la maquette mobile v2.
//
// Le corpus de la maquette mobile (`maquette/mobile-v2/maquette/mobile-v2-data.js`)
// écrit chaque tableau prestation / bénéfice avec ses en-têtes, qui varient selon
// la page (« Ce que nous faisons | Ce que ça change pour vous », « Prestation | Ce
// que vous y gagnez »…). Les données du site ne les portent pas. Ce script les
// relève, clé = titre en gras de la première prestation du tableau, et écrit
// `lib/entetes-offre-maquette.json`. Une clé qui donnerait deux en-têtes
// différents est écartée : rien n'est deviné.
//
//   node scripts/genere-entetes-offre.mjs            écrit le fichier
//   node scripts/genere-entetes-offre.mjs --controle échoue si le fichier dérive
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const SOURCE = "maquette/mobile-v2/maquette/mobile-v2-data.js";
const CIBLE = "lib/entetes-offre-maquette.json";

const contexte = { window: {} };
vm.createContext(contexte);
vm.runInContext(readFileSync(SOURCE, "utf8"), contexte);

const nu = (t) => t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
// Insensible à la ponctuation : l'import du site a parfois perdu le gras et la
// virgule (« …encadrés**, pas des profils… » devenu « …encadrés pas des profils… »).
export const cle = (t) => nu(t).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const cellules = (ligne) => ligne.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

const vus = new Map();
for (const [fichier, texte] of Object.entries(contexte.window.__MGDATA)) {
  if (typeof texte !== "string" || !fichier.endsWith(".md")) continue;
  const lignes = texte.split("\n");
  for (let i = 0; i < lignes.length - 2; i++) {
    if (!/^\|/.test(lignes[i]) || !/^\|\s*:?-{2,}/.test(lignes[i + 1])) continue;
    const entete = cellules(lignes[i]);
    const premiere = cellules(lignes[i + 2] ?? "");
    if (entete.length !== 2 || premiere.length < 2) continue;
    const gras = premiere[0].match(/^\*\*([^*]+)\*\*/);
    const valeur = entete.map(nu);
    // Deux clés : la partie en gras (l'accroche du site) et la cellule entière.
    for (const k of new Set([cle(gras ? gras[1] : premiere[0]), cle(premiere[0])])) {
      const deja = vus.get(k);
      if (deja === undefined) vus.set(k, valeur);
      else if (deja && deja.join("|") !== valeur.join("|")) vus.set(k, null);
    }
  }
}
const sortie = Object.fromEntries([...vus].filter(([, v]) => v).sort(([a], [b]) => a.localeCompare(b)));
const json = JSON.stringify(sortie, null, 1) + "\n";
if (process.argv.includes("--controle")) {
  if (readFileSync(CIBLE, "utf8") !== json) { console.error(`${CIBLE} dérive de ${SOURCE} : relancer sans --controle.`); process.exit(1); }
  console.log(`${CIBLE} conforme (${Object.keys(sortie).length} tableaux).`);
} else {
  writeFileSync(CIBLE, json);
  console.log(`${CIBLE} : ${Object.keys(sortie).length} tableaux, ${[...vus.values()].filter((v) => v === null).length} clés ambiguës écartées.`);
}
