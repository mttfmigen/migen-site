import type { MetadataRoute } from "next";

import type { LignePage, LigneSeo } from "@/types/lignes";

import { urlAbsolue } from "@/lib/seo/url";
import { lectureContenu } from "@/lib/supabase";

/**
 * Plan du site.
 *
 * Lu au build puis rafraîchi par revalidation : aucune lecture depuis le
 * navigateur. La RLS ne remonte que les contenus publiés, la requête n'a donc
 * pas à filtrer sur le statut.
 *
 * `changeFrequency` et `priority` sont volontairement absents : Google les
 * ignore depuis des années, et une valeur inventée page par page n'apporte rien.
 *
 * LES ARTICLES SONT ABSENTS, ET C'EST VOULU POUR L'INSTANT.
 *
 * POURQUOI : aucune route ne sert un article aujourd'hui. `app/[...slug]/` est
 * la seule route du cocon et elle résout le chemin dans la table `pages` ; une
 * URL d'article y renvoie une 404. Les déclarer au plan du site reviendrait à
 * livrer à Google une liste d'URL mortes, ce qui coûte du budget d'exploration
 * et de la confiance sur tout le domaine.
 *
 * À REMETTRE : le jour où la route d'article existe (phase 5 du CLAUDE.md,
 * pipeline articles) et sert bien `cheminArticle(slug, cheminPilier)` de
 * `lib/seo/url.ts`. La boucle à rétablir lit `articles` (id, slug, updated_at,
 * page_pilier_id), écarte les `noindex`, rapproche `page_pilier_id` du `path` du
 * pilier, et omet tout article sans pilier publié, son URL n'étant pas
 * déductible.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = lectureContenu();

  // Deux requêtes plates plutôt qu'une jointure : l'`id` des pages est
  // nécessaire pour écarter celles que `seo` marque `noindex`, ce que
  // `cheminsPublies()` ne remonte pas, et deux lectures indexées coûtent moins
  // qu'une jointure dont on ne garde qu'une colonne.
  const [pages, exclusions] = await Promise.all([
    client.from("pages").select("id, path, updated_at").order("path"),
    client.from("seo").select("page_id").eq("noindex", true),
  ]);

  const erreur = pages.error ?? exclusions.error;
  if (erreur) throw new Error(`Plan du site : ${erreur.message}`);

  const listePages = pages.data ?? [];
  const listeExclusions = exclusions.data ?? [];

  const exclus = new Set(
    listeExclusions
      .map((ligne) => ligne.page_id)
      .filter((id): id is string => id !== null),
  );

  return listePages
    .filter((page) => !exclus.has(page.id))
    .map((page) => ({
      url: urlAbsolue(page.path),
      lastModified: new Date(page.updated_at),
    }));
}
