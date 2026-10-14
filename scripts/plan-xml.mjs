/**
 * Les adresses que le plan XML d'un site déclare, pour les portes et relevés.
 *
 *   import { locsDuPlan } from "./plan-xml.mjs";
 *   const locs = await locsDuPlan("http://localhost:5606"); // ["https://migen.fr/", …]
 *
 * Depuis le 14/10, le plan suit le format de l'ancien migen.fr (Yoast) :
 * `/sitemap_index.xml` liste les sous-plans (`/page-sitemap.xml`,
 * `/post-sitemap.xml`), et `/sitemap.xml` répond 301 vers l'index. Lire
 * `/sitemap.xml` en suivant la 301 rendrait les adresses des SOUS-PLANS, pas
 * celles des pages : chaque porte passe donc par ici.
 *
 * Les sous-plans sont lus sur la base demandée (leur `<loc>` porte le domaine
 * de production). Les `<image:loc>` ne sont pas des `<loc>` et ne sortent pas.
 * Jette si l'index ou un sous-plan ne répond pas 200 : une porte qui lirait un
 * plan à moitié conclurait à tort.
 */

async function locs(base, chemin) {
  const r = await fetch(new URL(chemin, base), { signal: AbortSignal.timeout(30_000) });
  if (r.status !== 200) throw new Error(`plan du site : ${chemin} en ${r.status}`);
  return [...(await r.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Les sous-plans de l'index, en chemins (`/page-sitemap.xml`…). */
export async function sousPlansDuPlan(base) {
  return (await locs(base, "/sitemap_index.xml")).map((loc) => new URL(loc).pathname);
}

/** Toutes les adresses de pages, dans l'ordre des sous-plans. */
export async function locsDuPlan(base) {
  const sousPlans = await sousPlansDuPlan(base);
  if (sousPlans.length === 0) throw new Error("plan du site : index sans sous-plan");
  return (await Promise.all(sousPlans.map((chemin) => locs(base, chemin)))).flat();
}
