/**
 * Aucun fichier typé au build ne doit importer depuis un dossier que
 * `.vercelignore` exclut du déploiement.
 *
 *   node scripts/verifie-imports-deployes.mjs
 *   node scripts/verifie-imports-deployes.mjs --controle   (contrôle positif)
 *
 * LE DÉFAUT QU'IL EMPÊCHE, payé deux fois le 09/10/2026.
 * `.vercelignore` exclut `scripts/` et `docs/` : ils ne participent pas au
 * rendu, et les y envoyer alourdirait l'archive pour rien. Mais six composants
 * `verification-*.tsx` importaient `@/scripts/photos-autorisees`, et `next
 * build` TYPECHECK tout ce qui vit sous `app/`, `components/` et `lib/`. Sur
 * Vercel le module n'existait pas, et le build tombait sur
 * « Cannot find module '@/scripts/photos-autorisees' ».
 *
 * CE QUI RENDAIT LA PANNE INVISIBLE : en local le dossier existe, donc
 * `bunx tsc --noEmit` et `bun run build` passaient tous les deux. Et les mises
 * en ligne manuelles passaient aussi, parce que `--archive=tgz` N'APPLIQUE PAS
 * `.vercelignore` et embarque donc `scripts/`. Seuls les déploiements
 * déclenchés par un push échouaient : deux d'affilée, sans que personne
 * regarde, pendant que le site en ligne venait d'un envoi manuel.
 *
 * Le remède a été de déplacer le module dans `lib/`, qui est déployé. Cette
 * porte garde la propriété : elle lit `.vercelignore`, elle lit les imports, et
 * elle refuse le croisement.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const CONTROLE = process.argv.includes("--controle");

/** Les dossiers exclus du déploiement, lus dans `.vercelignore`. */
function dossiersExclus() {
  const chemin = join(RACINE, ".vercelignore");
  if (!existsSync(chemin)) return [];
  return readFileSync(chemin, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.endsWith("/"))
    .map((l) => l.replace(/\/$/, ""));
}

/* Ce que `next build` typecheck. `scripts/` n'en fait pas partie : un script
   peut importer ce qu'il veut, il ne part pas sur Vercel. */
const TYPECHECKES = ["app", "components", "lib", "types"];

/** Les imports d'un fichier, tels qu'écrits. */
export function importsDe(source) {
  const trouves = [];
  for (const m of source.matchAll(/(?:^|\n)\s*(?:import|export)[\s\S]{0,400}?from\s+["']([^"']+)["']/g)) {
    trouves.push(m[1]);
  }
  for (const m of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) trouves.push(m[1]);
  return trouves;
}

/** L'import vise-t-il l'un des dossiers exclus ?
 *
 *  UN IMPORT RELATIF N'EST PAS ANCRÉ À LA RACINE, et le confondre est un faux
 *  positif payé : `components/site/offre/generique/vue.ts` importe
 *  « ./maquette », qui désigne `generique/maquette.ts` et non le dossier
 *  `maquette/` de la racine que `.vercelignore` exclut. Seuls l'alias `@/` et
 *  un chemin nu sont ancrés à la racine ; un `./` ou un `../` se résout contre
 *  le dossier du fichier, et `depuis` sert à cela.
 */
export function viseUnExclu(specificateur, exclus, depuis = "") {
  let nu;
  if (specificateur.startsWith("@/")) {
    nu = specificateur.slice(2);
  } else if (specificateur.startsWith(".")) {
    /* Résolution à la main, sans toucher au disque : les segments du dossier
       du fichier, puis ceux de l'import, « .. » dépilant le dernier. */
    const bouts = depuis.split("/").filter(Boolean);
    for (const bout of specificateur.split("/")) {
      if (bout === "." || bout === "") continue;
      if (bout === "..") bouts.pop();
      else bouts.push(bout);
    }
    nu = bouts.join("/");
  } else if (/^[a-z@]/i.test(specificateur) && !specificateur.includes("/")) {
    return undefined; // un paquet de node_modules
  } else {
    nu = specificateur;
  }
  return exclus.find((d) => nu === d || nu.startsWith(`${d}/`));
}

if (CONTROLE) {
  const exclus = ["scripts", "docs"];
  const verdicts = [
    ["un import d'alias vers un exclu est vu", viseUnExclu("@/scripts/photos-autorisees", exclus) === "scripts"],
    ["un import dynamique aussi", viseUnExclu("@/docs/x", exclus) === "docs"],
    ["lib/ n'est pas confondu avec un exclu", viseUnExclu("@/lib/photos-autorisees", exclus) === undefined],
    ["un nom qui commence pareil ne compte pas", viseUnExclu("@/scriptsmaison/x", exclus) === undefined],
    /* LE FAUX POSITIF PAYÉ : « ./maquette » depuis components/site/offre/generique
       désigne un fichier voisin, pas le dossier `maquette/` de la racine. */
    [
      "un import relatif est résolu depuis son dossier, pas depuis la racine",
      viseUnExclu("./maquette", ["maquette", ...exclus], "components/site/offre/generique") === undefined,
    ],
    [
      "mais un relatif qui remonte VRAIMENT dans un exclu est vu",
      viseUnExclu("../../../../scripts/x", exclus, "components/site/offre/generique") === "scripts",
    ],
    [
      "les imports d'un fichier sont bien relevés",
      importsDe('import a from "@/lib/a";\nexport { b } from "@/lib/b";\nconst c = await import("@/lib/c");').length === 3,
    ],
  ];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  if (!verdicts.every(([, ok]) => ok)) process.exit(1);
  console.log(`\ncontrôle positif conforme (${verdicts.length}/${verdicts.length})`);
}

const exclus = dossiersExclus();
if (exclus.length === 0) {
  console.log("aucun dossier exclu dans .vercelignore : rien a verifier.");
  process.exit(0);
}

function fichiers(dossier) {
  if (!existsSync(dossier)) return [];
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    if (entree === "node_modules" || entree.startsWith(".")) continue;
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (/\.(tsx?|mts|cts)$/.test(entree)) trouves.push(chemin);
  }
  return trouves;
}

const fautes = [];
let lus = 0;
for (const racine of TYPECHECKES) {
  for (const chemin of fichiers(join(RACINE, racine))) {
    lus++;
    const source = readFileSync(chemin, "utf8");
    for (const specificateur of importsDe(source)) {
      const dossier = relative(RACINE, chemin).split("/").slice(0, -1).join("/");
      const exclu = viseUnExclu(specificateur, exclus, dossier);
      if (exclu) fautes.push({ ou: relative(RACINE, chemin), specificateur, exclu });
    }
  }
}

if (fautes.length > 0) {
  for (const f of fautes) {
    console.log(`\n${f.ou}`);
    console.log(`  importe « ${f.specificateur} », et .vercelignore exclut « ${f.exclu}/ »`);
  }
  console.log(
    `\n${fautes.length} import(s) vers un dossier non deploye, sur ${lus} fichiers typés au build.\n` +
      `Le build Vercel declenche par un push echouera sur « Cannot find module ».\n` +
      `Remede : deplacer le module dans lib/, ou retirer le dossier de .vercelignore.`,
  );
  process.exit(1);
}

console.log(
  `aucun import vers un dossier non deploye (${lus} fichiers typés au build, ${exclus.length} dossiers exclus : ${exclus.join(", ")})`,
);
