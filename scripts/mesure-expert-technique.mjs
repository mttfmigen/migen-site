/**
 * COMBIEN DE FOIS LES DIX PAGES DE LA DÉCISION « EXPERT TECHNIQUE » DISENT-
 * ELLES ENCORE « TECHNICIEN » DANS LE TEXTE QU'UN VISITEUR LIT ?
 *
 *   SITE_URL=http://localhost:4341/ node scripts/mesure-expert-technique.mjs
 *   SITE_URL=... node scripts/mesure-expert-technique.mjs --contexte
 *
 * CE N'EST PAS UNE PORTE, c'est un INSTRUMENT DE MESURE, et la distinction est
 * volontaire : il ne décide pas qu'un « technicien » restant est une faute. La
 * décision du 12/10 (`lib/decisions-copie.ts`, bloc EXPERT_TECHNIQUE) exclut
 * nommément le nom du réseau (« hubs de techniciens »), les techniciens DU
 * CLIENT, le métier nommé (« technicien de maintenance ») et les citations
 * d'études de cas. Un compte non nul n'est donc pas un verdict : il se LIT,
 * occurrence par occurrence, avec `--contexte`.
 *
 * LA PORTE, elle, est `components/site/offre/verification-offre.tsx`
 * (`bun run verifie:offre`) : elle exige que les CINQ libellés des composants
 * partagés basculent dans la portée et SURVIVENT dehors.
 *
 * LA PORTÉE N'EST PAS RECOPIÉE ICI : elle est demandée à `clePage` et à
 * `appliqueDecisions`, source unique. Une page retirée de la portée disparaît
 * donc de cette mesure sans qu'on y touche.
 *
 * LE TEXTE MESURÉ est celui du `<main>`, pas celui de la page entière :
 * l'entête commun à tout le site porte l'entrée de menu « Test technicien »,
 * nom de la page `/test-technicien/`, explicitement laissée en place par la
 * décision. La compter reviendrait à mesurer dix fois le même libellé hors
 * sujet. Le compte de la page entière est néanmoins affiché à part.
 */

import { chromium } from "playwright";

import { appliqueDecisions } from "./decisions-copie.mjs";

const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");
const CONTEXTE = process.argv.includes("--contexte");

/* Les dix pages, écrites en URL. Chacune est VÉRIFIÉE dans la portée avant
   d'être mesurée : si `PAGES_EXPERT_TECHNIQUE` change, la liste ci-dessous
   doit changer avec elle, et le contrôle ci-dessous le dit au lieu de le taire. */
const PAGES = [
  "/offres/bureau-etudes/",
  "/bureau-etudes/",
  "/bureau-etudes/bureau-etude-electrique/",
  "/bureau-etudes/bureau-etude-electronique/",
  "/bureau-etudes/mise-en-conformite-machine/",
  "/travaux-industriels/",
  "/travaux-industriels/demantelement-industriel/",
  "/travaux-industriels/levage-manutention/",
  "/travaux-industriels/montage-industriel/",
  "/travaux-industriels/transfert-industriel/",
];

/* LE TÉMOIN DE PORTÉE. « des techniciens retenus » est réécrit par la décision
   SEULEMENT pour les pages de la portée : si une URL de la liste n'était pas
   dans `PAGES_EXPERT_TECHNIQUE`, la phrase passerait inchangée et la mesure
   compterait une page qui n'est pas concernée. */
const TEMOIN = "des techniciens retenus";
const horsPortee = PAGES.filter((url) => appliqueDecisions(TEMOIN, url) === TEMOIN);
if (horsPortee.length) {
  console.error(
    `la liste de ce script et PAGES_EXPERT_TECHNIQUE de lib/decisions-copie.ts ne ` +
      `concordent plus : ${horsPortee.join(", ")} hors portée.`,
  );
  process.exit(2);
}
/* ET LE CONTRÔLE NÉGATIF, sans quoi le témoin ci-dessus ne prouve rien : une
   règle devenue globale le ferait passer pour TOUTES les pages. */
const HORS_PORTEE = "/offres/residence/";
if (appliqueDecisions(TEMOIN, HORS_PORTEE) !== TEMOIN) {
  console.error(`la décision a fui hors de sa portée : ${HORS_PORTEE} la reçoit aussi.`);
  process.exit(2);
}

const MOT = /\bt[eé]chnicien(?:ne)?s?\b/gi;

const navigateur = await chromium.launch({ channel: "chrome" });
let total = 0;
const lignes = [];

for (const url of PAGES) {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 860 } });
  const reponse = await page.goto(`${SITE}${url}`, { waitUntil: "networkidle" });
  if (!reponse || reponse.status() !== 200) {
    console.error(`${url} : HTTP ${reponse ? reponse.status() : "aucune réponse"}`);
    await page.close();
    process.exitCode = 2;
    continue;
  }
  await page.waitForTimeout(300);
  const { principal, entiere } = await page.evaluate(() => ({
    principal: document.querySelector("main")?.innerText ?? "",
    entiere: document.body.innerText ?? "",
  }));
  await page.close();

  const texte = principal.replace(/\s+/g, " ");
  const occurrences = [...texte.matchAll(MOT)];
  const dansLaPage = [...entiere.replace(/\s+/g, " ").matchAll(MOT)].length;
  total += occurrences.length;
  lignes.push({ url, n: occurrences.length, page: dansLaPage, occurrences, texte });
}

await navigateur.close();

console.log(`« technicien » dans le <main> servi, ${PAGES.length} pages de la portée :\n`);
for (const l of lignes) {
  console.log(`  ${String(l.n).padStart(2)}   ${l.url}   (page entière : ${l.page})`);
}
console.log(`\n  ${total}   TOTAL dans le <main>`);

if (CONTEXTE && total) {
  console.log("\nchaque occurrence, avec son contexte :\n");
  for (const l of lignes) {
    if (!l.occurrences.length) continue;
    console.log(`${l.url}`);
    for (const m of l.occurrences) {
      const debut = Math.max(0, m.index - 110);
      console.log(`  · …${l.texte.slice(debut, m.index + m[0].length + 110)}…`);
    }
    console.log("");
  }
}
