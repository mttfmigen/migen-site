import type { MetadataRoute } from "next";

import { pagesPubliees } from "@/lib/pages-publiees";
import { sourcesRedirigees } from "@/lib/redirections";
import { urlAbsolue } from "@/lib/seo/url";

/**
 * Plan du site XML.
 *
 * Lu au build puis rafraîchi par revalidation : aucune lecture depuis le
 * navigateur. LA LISTE VIT DANS `lib/pages-publiees.ts`, que `/plan-du-site/`
 * lit aussi : les deux plans annoncent les mêmes chemins par construction, et
 * `scripts/verifie-plan-et-sitemap.mjs` le vérifie en ligne.
 *
 * `changeFrequency` et `priority` sont volontairement absents : Google les
 * ignore depuis des années, et une valeur inventée page par page n'apporte rien.
 *
 * LES SOURCES DE REDIRECTION sont lues par `sourcesRedirigees()`, qui JETTE si
 * la table est illisible, sans repli : déclarer à Google des adresses qui
 * répondent 301 coûte plus qu'un build qui échoue en le disant. Le plan HTML,
 * cité par tout le site, se replie lui sur les sources de la refonte.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await pagesPubliees(await sourcesRedirigees());
  return pages.map(({ path, lastModified }) =>
    lastModified ? { url: urlAbsolue(path), lastModified } : { url: urlAbsolue(path) },
  );
}
