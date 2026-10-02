import type { Metadata } from "next";

import Corps from "@/components/cocon/Corps";
import RubriquesNiveau1 from "@/components/cocon/RubriquesNiveau1";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * ACCUEIL PROVISOIRE.
 *
 * Remplace la page de démonstration de create-next-app par le strict minimum :
 * le titre de la page `/` et les rubriques de premier niveau. Elle sera
 * remplacée par la maquette. Rien ne doit être écrit ici qui mérite d'être
 * gardé : pas de mise en page travaillée, pas de texte commercial, aucune
 * donnée Migen écrite en dur.
 */

export const revalidate = 3600;

const TITRE_PAR_DEFAUT = "Migen";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin("/");
  // Même sans ligne en base, la racine reste servie : le titre retombe sur le
  // nom de l'entreprise, et `metadonneesSeo` pose tout de même le canonique.
  return metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: "/",
    titreRepli: complete?.page.titre_h1 ?? TITRE_PAR_DEFAUT,
  });
}

export default async function Accueil() {
  // L'accueil reste servie même sans ligne en base : le titre retombe sur le
  // nom de l'entreprise plutôt que de renvoyer une 404 sur la racine.
  const complete = await pageParChemin("/");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="rounded-md border border-dashed border-zinc-300 px-3 py-2 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Accueil provisoire, en attente de la maquette
      </p>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {complete?.page.titre_h1 ?? TITRE_PAR_DEFAUT}
      </h1>
      <Corps contenu={complete?.page.contenu} />
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Les rubriques du site
        </h2>
        <div className="mt-3">
          <RubriquesNiveau1 />
        </div>
      </div>
    </main>
  );
}
