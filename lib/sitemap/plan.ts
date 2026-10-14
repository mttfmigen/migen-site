import "server-only";

import { pagesPubliees } from "@/lib/pages-publiees";
import { sourcesRedirigees } from "@/lib/redirections";
import { estUnBillet, SOUS_PLANS } from "@/lib/sitemap/adresses";
import imagesRelevees from "@/lib/sitemap/images.json";
import { plusRecente, type EntreePlan } from "@/lib/sitemap/xml";
import { urlAbsolue } from "@/lib/seo/url";

/**
 * Le CONTENU des plans XML : les pages publiées (`lib/pages-publiees.ts`, que
 * `/plan-du-site/` lit aussi), rangées en billets et en pages, avec leurs
 * images relevées par `scripts/releve-sitemap.mjs`.
 *
 * Les sources de redirection sont lues par `sourcesRedirigees()`, qui JETTE si
 * la table est illisible, sans repli : déclarer à Google des adresses qui
 * répondent 301 coûte plus qu'un plan qui échoue en le disant.
 *
 * `changefreq` et `priority` restent absents, comme chez Yoast : Google les
 * ignore.
 */

export type SousPlan = keyof typeof SOUS_PLANS;

const IMAGES: Readonly<Record<string, readonly string[]>> = imagesRelevees;

export async function entreesDuPlan(): Promise<Record<SousPlan, EntreePlan[]>> {
  const pages = await pagesPubliees(await sourcesRedirigees());
  const entrees: Record<SousPlan, EntreePlan[]> = { post: [], page: [] };
  for (const { path, lastModified } of pages) {
    entrees[estUnBillet(path) ? "post" : "page"].push({
      loc: urlAbsolue(path),
      lastmod: lastModified,
      images: (IMAGES[path] ?? []).map(urlAbsolue),
    });
  }
  return { post: [...entrees.post].sort(parDate), page: [...entrees.page].sort(parDate) };
}

/**
 * L'ORDRE de Yoast, relevé sur l'ancien site le 14/10 : la date croissante, la
 * page d'accueil en tête du plan des pages, une page sans date à la fin.
 */
function rang({ loc, lastmod }: EntreePlan): number {
  if (loc === urlAbsolue("/")) return Number.NEGATIVE_INFINITY;
  return lastmod?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function parDate(a: EntreePlan, b: EntreePlan): number {
  return rang(a) === rang(b) ? 0 : rang(a) < rang(b) ? -1 : 1;
}

/** Les entrées de l'index : un sous-plan, et la date de sa page la plus récente. */
export async function sousPlansDuPlan(): Promise<EntreePlan[]> {
  const entrees = await entreesDuPlan();
  return (Object.keys(SOUS_PLANS) as SousPlan[]).map((cle) => ({
    loc: urlAbsolue(SOUS_PLANS[cle]),
    lastmod: plusRecente(entrees[cle].map((e) => e.lastmod)),
  }));
}
