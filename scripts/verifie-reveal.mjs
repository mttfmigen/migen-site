// Compte les blocs à révélation dans la page d'accueil CONSTRUITE.
// On lit le HTML produit par `next build`, pas le source : c'est ce que le
// visiteur reçoit, et un attribut perdu au rendu ne se verrait pas dans le TSX.
import { readFileSync, existsSync } from "node:fs";

const ATTENDU = 20; // relevé sur la maquette : `document.querySelectorAll('[data-reveal]').length`
const chemin = ".next/server/app/index.html";
if (!existsSync(chemin)) {
  console.error(`${chemin} absent : lancer \`next build\` d'abord`);
  process.exit(1);
}
const html = readFileSync(chemin, "utf8");
const n = (html.match(/\sdata-reveal(?:=""|\s|>)/g) ?? []).length;
// Aucun bloc ne doit arriver masqué : le masquage est l'affaire du moteur, après montage.
const masques = (html.match(/opacity:\s*0[;"]/g) ?? []).length;
console.log(`data-reveal : ${n} (attendu ≥ ${ATTENDU}) · blocs masqués au rendu serveur : ${masques}`);
if (n < ATTENDU || masques > 0) process.exit(1);
console.log("révélations conformes");
