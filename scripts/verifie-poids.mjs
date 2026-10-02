// Poids du JavaScript de premier chargement de l'accueil, après `next build`.
//
// On lit les <script src> du HTML CONSTRUIT de la page : c'est exactement la
// liste des fichiers que le navigateur télécharge pour cette page, et rien
// d'autre. Le manifeste de Next 16 ne porte que les lots racine, pas ceux de
// la route. Compressé en gzip, comme Vercel les sert.
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";

const BUDGET_KO = 220;
const page = ".next/server/app/index.html";
if (!existsSync(page)) {
  console.error(`${page} absent : lancer \`next build\` d'abord`);
  process.exit(1);
}
const html = readFileSync(page, "utf8");
const srcs = [...new Set(
  [...html.matchAll(/<script[^>]+src="\/_next\/(static\/[^"]+\.js)"/g)].map((m) => m[1]),
)];
let brut = 0, gz = 0, manquants = 0;
for (const f of srcs) {
  const p = `.next/${f}`;
  if (!existsSync(p)) { manquants += 1; continue; }
  const b = readFileSync(p);
  brut += b.length;
  gz += gzipSync(b).length;
}
const ko = (o) => Math.round(o / 1024);
console.log(`accueil : ${srcs.length} scripts, ${ko(brut)} Ko bruts, ${ko(gz)} Ko gzip (budget ${BUDGET_KO} Ko)${manquants ? `, ${manquants} introuvables` : ""}`);
if (srcs.length === 0 || manquants > 0 || ko(gz) > BUDGET_KO) process.exit(1);
console.log("poids JS conforme");
