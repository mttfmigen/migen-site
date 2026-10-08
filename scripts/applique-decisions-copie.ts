/**
 * Passe `appliqueDecisions` (lib/decisions-copie.ts) sur TOUTE la donnée :
 *
 *   bun scripts/applique-decisions-copie.ts            (écrit)
 *   bun scripts/applique-decisions-copie.ts --essai    (liste sans écrire)
 *
 * 1. Les fiches `supabase/import/gabarits-maquette/*.json` : chaque chaîne,
 *    sauf sous une clé `_…` (notes de portage) et sous `trous`,
 *    `phrases_retirees`, `retraits` (déclarations qui CITENT la maquette).
 *    La mise en forme du fichier est gardée (indentation 1 ou 2, saut final).
 * 2. Les chaînes écrites en dur dans `components/**` (hors contrôles
 *    `verification-*`) : littéraux et texte JSX, lus par le compilateur
 *    TypeScript, jamais les commentaires, qui citent souvent la maquette.
 *
 * Idempotent : un second passage ne change rien. À relancer après toute
 * régénération des fiches depuis la maquette (scripts/produit_*).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { appliqueDecisions } from "../lib/decisions-copie";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const ESSAI = process.argv.includes("--essai");
const CLES_CITATIONS = new Set(["trous", "phrases_retirees", "retraits"]);

let changements = 0;
const fichiers: string[] = [];

function note(fichier: string, avant: string, apres: string) {
  changements++;
  if (ESSAI) console.log(`${fichier}\n  - ${avant.slice(0, 160)}\n  + ${apres.slice(0, 160)}`);
}

/* ------------------------------------------------------------ 1. fiches */

function decide(valeur: unknown, fichier: string): unknown {
  if (typeof valeur === "string") {
    const apres = appliqueDecisions(valeur);
    if (apres !== valeur) note(fichier, valeur, apres);
    return apres;
  }
  if (Array.isArray(valeur)) return valeur.map((v) => decide(v, fichier));
  if (valeur && typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, v]) =>
        cle.startsWith("_") || CLES_CITATIONS.has(cle) ? [cle, v] : [cle, decide(v, fichier)],
      ),
    );
  }
  return valeur;
}

const DOSSIER = join(RACINE, "supabase/import/gabarits-maquette");
for (const nom of readdirSync(DOSSIER).filter((n) => n.endsWith(".json"))) {
  const chemin = join(DOSSIER, nom);
  const brut = readFileSync(chemin, "utf8");
  const avant = changements;
  const objet = decide(JSON.parse(brut), nom);
  if (changements === avant) continue;
  const fin = brut.endsWith("\n") ? "\n" : "";
  const retrait = brut.startsWith("{\n  \"") ? 2 : 1;
  const sortie = JSON.stringify(objet, null, retrait) + fin;
  // Mise en forme non reproductible (tableaux sur une ligne…) : on remplace
  // chaîne par chaîne dans le texte brut, sans toucher au reste.
  const rejoue = JSON.stringify(JSON.parse(brut), null, retrait) + fin === brut;
  const texte = rejoue
    ? sortie
    : brut.replace(/"(?:[^"\\]|\\.)*"/g, (jeton) => {
        const s = JSON.parse(jeton) as string;
        const d = appliqueDecisions(s);
        return d === s ? jeton : JSON.stringify(d);
      });
  fichiers.push(`supabase/import/gabarits-maquette/${nom}`);
  if (!ESSAI) writeFileSync(chemin, texte);
}

/* ------------------------------------------------- 2. chaînes des composants */

function* sources(dossier: string): Generator<string> {
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const p = join(dossier, e.name);
    if (e.isDirectory()) yield* sources(p);
    else if (/\.tsx?$/.test(e.name) && !e.name.startsWith("verification-")) yield p;
  }
}

for (const chemin of sources(join(RACINE, "components"))) {
  const texte = readFileSync(chemin, "utf8");
  const fichierTs = ts.createSourceFile(chemin, texte, ts.ScriptTarget.Latest, true);
  const remplacements: [number, number, string][] = [];
  const visite = (n: ts.Node) => {
    if (
      ts.isStringLiteral(n) ||
      ts.isNoSubstitutionTemplateLiteral(n) ||
      ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) ||
      ts.isTemplateTail(n) ||
      ts.isJsxText(n)
    ) {
      const debut = n.getStart(fichierTs);
      const brut = texte.slice(debut, n.end);
      const apres = appliqueDecisions(brut);
      if (apres !== brut) {
        note(relative(RACINE, chemin), brut.trim(), apres.trim());
        remplacements.push([debut, n.end, apres]);
      }
    }
    ts.forEachChild(n, visite);
  };
  visite(fichierTs);
  if (!remplacements.length) continue;
  const sortie = remplacements
    .sort((a, b) => b[0] - a[0])
    .reduce((t, [d, f, r]) => t.slice(0, d) + r + t.slice(f), texte);
  fichiers.push(relative(RACINE, chemin));
  if (!ESSAI) writeFileSync(chemin, sortie);
}

console.log(
  `${ESSAI ? "essai, rien d'écrit : " : ""}${changements} chaînes réécrites dans ${fichiers.length} fichiers`,
);
