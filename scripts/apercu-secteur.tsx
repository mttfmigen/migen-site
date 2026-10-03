/**
 * Une page de secteur, rendue en page autonome pour la REGARDER.
 *
 *   bun scripts/apercu-secteur.tsx                         # agroalimentaire
 *   bun scripts/apercu-secteur.tsx /secteurs/nucleaire/
 *
 * POURQUOI CE SCRIPT EXISTE. `components/site/secteur/verification-secteur.tsx`
 * prouve que les valeurs de la maquette sont dans le rendu, et qu'aucun texte du
 * corpus n'est perdu. Il ne voit pas ce qu'un œil voit : une étiquette de repère
 * qui tient sur huit lignes, une carte seule en bout de grille. Le client a dit
 * « ce n'est pas comme sur la maquette » en REGARDANT, pas en lisant du HTML.
 *
 * Il écrit dans le dossier temporaire du système, jamais dans le projet : c'est
 * un coup d'œil, pas un livrable.
 *
 * CE QU'IL NE MONTRE PAS, et qu'il ne faut pas lui demander : la police Poppins
 * est tirée de Google Fonts au lieu d'être auto-hébergée par `next/font`, le
 * fil d'Ariane, le formulaire de bas de page et le maillage sont posés par la
 * route et absents ici, et les révélations au défilement viennent de
 * `Moteurs.tsx`, qui ne tourne pas dans une page statique. Pour le reste, les
 * styles sont ceux du site, lus dans `app/globals.css`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import PageSecteur from "@/components/site/secteur/PageSecteur";
import type { ContenuSecteur } from "@/types/secteur";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const url = process.argv[2] ?? "/secteurs/agroalimentaire/";
const nom = url.replace(/^\/|\/$/g, "").replace(/\//g, "-");

const fichier = JSON.parse(
  readFileSync(
    join(RACINE, "supabase", "import", "gabarits-maquette", `${nom}.json`),
    "utf8",
  ),
);

const corpus: { url: string; contenu: { sections: { type: string; h1?: string }[] } }[] =
  JSON.parse(
    readFileSync(join(RACINE, "supabase", "import", "corpus-analyse.json"), "utf8"),
  );

const titre = corpus
  .find((entree) => entree.url === url)
  ?.contenu.sections.find((section) => section.type === "heros")?.h1;

if (!titre) {
  console.error(`  ${url} : le corpus ne donne pas de H1 pour cette page`);
  process.exit(1);
}

/* La charte du site, telle quelle. La directive Tailwind est retirée : elle est
   résolue par le build, et ce gabarit ne pose aucune classe utilitaire. */
const charte = readFileSync(join(RACINE, "app", "globals.css"), "utf8").replace(
  '@import "tailwindcss";',
  "",
);

const corps = renderToStaticMarkup(
  <PageSecteur titre={titre} contenu={fichier.contenu as ContenuSecteur} />,
);

const sortie = join(tmpdir(), `apercu-${nom}.html`);
writeFileSync(
  sortie,
  `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titre}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>:root{--font-poppins:Poppins}${charte}</style>
</head><body>${corps}</body></html>`,
  "utf8",
);

console.log(`aperçu de ${url} : ${sortie}`);
