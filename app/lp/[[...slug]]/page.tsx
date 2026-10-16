import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageLP } from "@/components/lp/PageLP";
import { CHEMINS_LP, descriptionLp, pageLp } from "@/lib/lp/pages";

/**
 * Les landing pages publicitaires (Google Ads), sous /lp/, JAMAIS INDEXÉES.
 *
 * Demande de Mehdi du 16/10 : les LP de la maquette V3 sous migen.fr, dans un
 * répertoire, non référencées par Google. Les adresses reprennent celles de
 * go.migengroup.com sans le `/fr` (`/fr/secteurs/chimie` devient
 * `/lp/secteurs/chimie/`). `/lp/` seul redirige vers la page France
 * (`next.config.ts`).
 *
 * NON INDEXÉES, PAR TROIS VOIES QUI SE COMPLÈTENT :
 * - `<meta name="robots" content="noindex, nofollow">` sur chaque page (ici) ;
 * - l'en-tête `X-Robots-Tag: noindex, nofollow` sur tout /lp/ (`next.config.ts`),
 *   qui couvre aussi ce qu'un `<meta>` ne couvre pas ;
 * - aucune adresse /lp/ dans les plans du site, aucun lien du site vers /lp/.
 * Et `robots.txt` NE BLOQUE PAS /lp/, exprès : un robot qui ne peut pas lire
 * la page ne lit pas non plus son `noindex`, et la garde en index sur la foi
 * des liens ; le robot de Google Ads doit aussi pouvoir la vérifier.
 * `scripts/verifie-lp.mjs` le contrôle sur le build.
 *
 * Les pages sont figées à la construction : la liste est celle de
 * `lib/lp/pages.json`. Toute autre adresse sous /lp/ répond 404, avec
 * l'habillage des LP (`not-found.tsx` à côté) et non la 404 du site, qui
 * mêlerait le pied du site à une page sans son en-tête. D'où `dynamicParams`
 * laissé à sa valeur par défaut : avec `false`, Next servirait la 404 racine.
 */

const chemin = (slug: string[] | undefined) => `/lp/${(slug ?? []).join("/")}/`;

export function generateStaticParams(): { slug: string[] }[] {
  return CHEMINS_LP.map((adresse) => ({ slug: adresse.split("/").filter(Boolean).slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/lp/[[...slug]]">): Promise<Metadata> {
  const page = pageLp(chemin((await params).slug));
  if (!page) notFound();
  return {
    title: page.title,
    description: descriptionLp(page),
    robots: { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: PageProps<"/lp/[[...slug]]">) {
  const page = pageLp(chemin((await params).slug));
  if (!page) notFound();
  return <PageLP page={page} />;
}
