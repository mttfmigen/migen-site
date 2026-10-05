/**
 * Une page d'offre, rendue en page autonome pour la REGARDER.
 *
 *   bun scripts/apercu-offre.tsx                       # /offres/residence/
 *   bun scripts/apercu-offre.tsx /offres/zero-arret/
 *
 * POURQUOI CE SCRIPT EXISTE, et pourquoi il est indispensable ICI.
 * `components/site/offre/verification-offre.tsx` prouve que les valeurs du
 * fichier de maquette sont dans le rendu. Il ne voit pas ce qu'un œil voit, et
 * surtout : la page SERVIE par le site n'est pas encore celle-là.
 *
 * `pages.contenu` ne porte pas le discriminant `gabarit: "offre"` en base (il
 * vaut `null` sur les dix-huit pages), donc `app/[...slug]/page.tsx` les envoie
 * TOUTES sur le gabarit de vente, et ce gabarit-ci ne tourne pas. Les données
 * qui poseraient le discriminant attendent dans
 * `supabase/import/gabarits-maquette/`, et l'import est bloqué faute de
 * `SUPABASE_SERVICE_ROLE_KEY`. Voir CLAUDE.md section 16 : c'est le piège qui a
 * déjà coûté plusieurs semaines, et il est encore armé.
 *
 * Ce script lit ces fichiers-là et monte le gabarit avec. C'est le seul moyen de
 * regarder le gabarit 03 tant que la base n'a pas été écrite, et la seule preuve
 * visuelle qu'on puisse montrer au client aujourd'hui.
 *
 * Il écrit dans le dossier temporaire du système, jamais dans le projet : c'est
 * un coup d'œil, pas un livrable.
 *
 * CE QU'IL NE MONTRE PAS, et qu'il ne faut pas lui demander : la police Poppins
 * vient de Google Fonts au lieu d'être auto-hébergée par `next/font`, les images
 * `next/image` sortent en balises simples sans optimisation, le fil d'Ariane et
 * le maillage du cocon sont posés par la route et absents ici, et les
 * révélations au défilement viennent de `Moteurs.tsx`, qui ne tourne pas dans
 * une page statique. Pour le reste, les styles sont ceux du site, lus dans
 * `app/globals.css`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import PageOffre from "@/components/site/offre/PageOffre";
import type { ContenuOffre } from "@/types/offre";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const url = process.argv[2] ?? "/offres/residence/";
const nom = url.replace(/^\/|\/$/g, "").replace(/\//g, "-");

const fichier = JSON.parse(
  readFileSync(
    join(RACINE, "supabase", "import", "gabarits-maquette", `${nom}.json`),
    "utf8",
  ),
);

const corpus: {
  url: string;
  contenu: { sections: { type: string; h1?: string }[] };
}[] = JSON.parse(
  readFileSync(
    join(RACINE, "supabase", "import", "corpus-analyse.json"),
    "utf8",
  ),
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
  <PageOffre
    titre={titre}
    contenu={fichier.contenu as ContenuOffre}
    formulaire={`apercu-${nom}`}
  />,
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
