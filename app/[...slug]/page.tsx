import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AppelAction from "@/components/cocon/AppelAction";
import Corps from "@/components/cocon/Corps";
import FilAriane from "@/components/cocon/FilAriane";
import Maillage from "@/components/cocon/Maillage";
import { cheminCanonique, cheminsPublies, pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Route attrape-tout du cocon : toute URL hiérarchique passe par ici.
 *
 * `params` est une promesse depuis Next 15, il faut l'attendre.
 */

/** ISR : une heure. Une publication urgente passe par la revalidation à la demande. */
export const revalidate = 3600;

/**
 * Les chemins publiés sont rendus statiquement au build.
 *
 * L'accueil est exclue : son chemin `/` donne zéro segment, et c'est
 * `app/page.tsx` qui la sert. `dynamicParams` reste à sa valeur par défaut, si
 * bien qu'une page publiée après le build est rendue à la première visite au
 * lieu de renvoyer une 404.
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const chemins = await cheminsPublies();
  return chemins
    .map((chemin) => ({ slug: chemin.path.split("/").filter(Boolean) }))
    .filter(({ slug }) => slug.length > 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chemin = cheminCanonique(slug);
  const complete = await pageParChemin(chemin);

  // Pas de page : `notFound()` est appelé par le rendu juste après. On évite
  // seulement de servir le titre du gabarit à une URL qui n'existe pas.
  if (!complete) return { title: "Page introuvable" };

  return metadonneesSeo({
    seo: complete.seo,
    chemin,
    titreRepli: complete.page.titre_h1,
  });
}

export default async function PageDuCocon({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const chemin = cheminCanonique(slug);
  const complete = await pageParChemin(chemin);
  if (!complete) notFound();

  const { page } = complete;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <FilAriane path={page.path} />
      <article className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {page.titre_h1}
        </h1>
        <Corps contenu={page.contenu} />
      </article>
      <AppelAction cta={page.cta_type} />
      <Maillage page={page} />
    </main>
  );
}
