/**
 * Le parcours par le problème tient-il ses promesses ?
 *
 *   bun scripts/verifie-parcours-mobile.mjs
 *
 * SOUS `bun` ET NON `node` : il lit la copie dans `lib/parcours-mobile.ts`,
 * pour mesurer le rendu contre la SOURCE et non contre une liste recopiée qui
 * dériverait. Node ne sait pas importer un module TypeScript.
 *
 * CE QU'IL DÉFEND. `components/site/accueil/ParcoursMobile.tsx` porte le motif
 * d'ouverture de la maquette mobile du client : « Un parcours guidé par le
 * problème, pas par le menu ». Six questions, six réponses, six pages. Trois
 * choses peuvent s'y casser sans bruit, et ce sont les trois que ce contrôle
 * mesure sur le rendu réel :
 *
 *  1. UN LIEN MORT. Chaque problème renvoie vers la page qui le traite. Une
 *     adresse qui change ailleurs dans le site laisserait ici un lien vers une
 *     404, sur la page la plus visitée et au premier écran du téléphone.
 *  2. LE TEXTE HORS DU HTML. Les six réponses sont du contenu utile. S'il
 *     fallait un script pour les faire apparaître, Google ne les verrait pas.
 *     Le contrôle exige donc de les trouver dans le HTML SERVI, replié par le
 *     navigateur et non retiré du document.
 *  3. L'ACCORDÉON QUI S'OUVRE EN GRAND. Le « une seule réponse à la fois » de
 *     la maquette ne tient que si les six `<details>` partagent le même `name`.
 *     Un seul oubli, et la page s'étire sur six réponses dépliées.
 *
 * Il vérifie enfin que le parcours est bien RÉSERVÉ AU TÉLÉPHONE : la feuille
 * doit le masquer par défaut et ne l'afficher que sous 880 px. Sur bureau, la
 * grille d'offres reste l'entrée en matière de la maquette.
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

/* 2 · tout le texte des six reponses est dans le HTML servi. */
for (const p of PROBLEMES) {
  for (const [quoi, valeur] of [
    ["question", p.question],
    ["douleur", p.douleur],
    ["réponse", p.reponse],
    ...p.points.map((pt, i) => [`point ${i + 1}`, pt]),
  ]) {
    if (!texte.includes(sansBalises(valeur).trim())) {
      fautes.push(`${p.numero} : la ${quoi} n'est pas dans le HTML servi`);
    }
  }
}

/* 3 · l'accordeon est exclusif : un seul `name`, partage par les six. */
const noms = [...html.matchAll(/<details\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]);
const parcours = noms.filter((n) => n === "parcours-mobile");
if (parcours.length !== PROBLEMES.length) {
  fautes.push(
    `accordéon exclusif : ${parcours.length} <details name="parcours-mobile"> au lieu de ${PROBLEMES.length}`,
  );
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
  console.log(`\n${fautes.length} defaut(s) sur le parcours mobile.`);
  process.exit(1);
}

console.log(
  `parcours mobile conforme (${PROBLEMES.length} problemes, ${PROBLEMES.length} pages en 200, ` +
    `texte entier dans le HTML servi, accordeon exclusif, reserve au telephone)`,
);
