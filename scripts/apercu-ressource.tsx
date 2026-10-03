/**
 * Rend une page du gabarit RESSOURCE en HTML autonome, pour la regarder.
 *
 *   bun scripts/apercu-ressource.tsx supabase/import/gabarits-maquette/ressources-articles-gmao.json
 *   bun scripts/apercu-ressource.tsx --tout
 *
 * POURQUOI CE SCRIPT EXISTE. La donnée du gabarit n'est pas encore en base,
 * `SUPABASE_SERVICE_ROLE_KEY` étant vide dans `.env.local` : `bun run dev` sert
 * donc encore l'ancien gabarit sur ces URL, et il n'y a aucun moyen de VOIR le
 * portage avant que la clé soit posée. Ce script coupe ce noeud, il monte le
 * composant sur le fichier de données et écrit une page ouvrable au navigateur,
 * charte comprise.
 *
 * Il ne remplace pas `scripts/verifie-ressource.tsx`, qui est le contrôle : ici
 * rien n'est asserté, c'est un oeil humain qui regarde.
 *
 * Tailwind est retiré de la charte parce que sa directive `@import` ne
 * s'exécute qu'au travers du compilateur de Next. Les jetons, les reprises
 * mobiles `mg-*` et les états `cx-*` sont tous dans le même fichier et sont
 * conservés : c'est eux qui portent le dessin.
 *
 * LES MODULES CSS SONT TRADUITS, et il faut le savoir pour lire cette page.
 * `import styles from "./Ressource.module.css"` rend `undefined` sous bun,
 * qui ne compile pas les modules : sans traduction, l'aperçu montrerait le
 * barème sans son alignement et le corps sans ses liens soulignés, c'est-à-dire
 * un dessin qui n'est celui de personne. La correspondance ci-dessous rend à
 * chaque règle l'élément qu'elle vise. Elle ne sert QUE l'aperçu : dans
 * l'application, c'est Next qui compile le module, et le composant est inchangé.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

import PageRessource from "@/components/site/ressource/PageRessource";
import { estRessource } from "@/types/ressource";

const DOSSIER = "supabase/import/gabarits-maquette";
const SORTIE = "apercu-ressource";

const charte = readFileSync("app/globals.css", "utf8").replace('@import "tailwindcss";', "");

/**
 * `next/font` pose `--font-poppins`, qui n'existe pas hors de Next : sans
 * cette ligne, `--fb` est invalide et l'aperçu s'affiche dans la police par
 * défaut du navigateur, en serif. Ce qui serait montré au client ne serait
 * alors le dessin de personne.
 */
const POLICE =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">' +
  "<style>:root{--font-poppins:'Poppins'}</style>";

/** Sélecteur de module vers sélecteur d'élément, pour l'aperçu seulement. */
const MODULES = [
  "components/site/ressource/Ressource.module.css",
  "components/site/blocs/Blocs.module.css",
];
const TRADUCTION: [RegExp, string][] = [
  [/\.bareme\b/g, "table"],
  [/\.corps\b/g, "article"],
  [/\.carteLien\b/g, "aside a"],
  [/\.boutonAction\b/g, "a[href='#formulaire']"],
  [/\.boutonSecondaire\b/g, "a[href='/ressources/']"],
  [/\.questionFaq\b/g, "summary"],
  [/\.plusFaq\b/g, ".cx-plus"],
];

function modulesTraduits(): string {
  // Rien n'est retiré. Une première version jetait les règles non traduites,
  // et déséquilibrait les accolades : le navigateur cessait alors d'appliquer
  // TOUTE la suite de la feuille, barème compris, sans la moindre erreur
  // visible. Une classe qui ne correspond à rien ne coûte rien.
  return MODULES.map((chemin) => {
    let css = readFileSync(chemin, "utf8");
    for (const [motif, cible] of TRADUCTION) css = css.replace(motif, cible);
    return css;
  }).join("\n");
}

function ecrit(chemin: string): string {
  const page = JSON.parse(readFileSync(chemin, "utf8")) as { h1?: string; contenu: unknown };
  if (!estRessource(page.contenu)) throw new Error(`${chemin} : gabarit « ressource » attendu`);
  const titre = page.h1 ?? basename(chemin);
  const corps = renderToStaticMarkup(<PageRessource titre={titre} contenu={page.contenu} />);
  const cible = join(SORTIE, basename(chemin).replace(/\.json$/, ".html"));
  writeFileSync(
    cible,
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${titre}</title>` +
      POLICE +
      `<style>${charte}\n${modulesTraduits()}\n*{box-sizing:border-box}` +
      `body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--fb)}` +
      `a{text-decoration:none;color:inherit}</style></head><body>${corps}</body></html>`,
  );
  return cible;
}

mkdirSync(SORTIE, { recursive: true });

const choisis = process.argv.includes("--tout")
  ? readdirSync(DOSSIER)
      .filter((n) => n.startsWith("ressources-") && n.endsWith(".json"))
      .sort()
      .map((n) => join(DOSSIER, n))
  : process.argv.slice(2).filter((a) => a.endsWith(".json"));

if (choisis.length === 0) {
  console.error("  donnez un fichier de supabase/import/gabarits-maquette/, ou --tout");
  process.exit(1);
}

for (const chemin of choisis) console.log(ecrit(chemin));
