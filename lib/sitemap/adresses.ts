/**
 * Les ADRESSES du plan de site XML, au format de l'ancien migen.fr (Yoast).
 *
 * Demande de Mehdi, 14/10 : « le sitemap Vercel n'est pas le même que celui de
 * migen en termes de format, je veux le même ». L'ancien site sert un index,
 * `/sitemap_index.xml`, qui pointe vers `/post-sitemap.xml` et
 * `/page-sitemap.xml` ; `/sitemap.xml` y répond 301 vers l'index. La Search
 * Console connaît ces adresses : on garde les mêmes.
 *
 * Ce module est lu par `proxy.ts` AVANT la table `redirects` et le filet de
 * l'ancien WordPress : une adresse de plan n'est jamais une page, ni une
 * redirection éditoriale, et le filet ne doit jamais la capter (il l'envoyait
 * sur `/sitemap.xml` avant ce changement). Pas de `server-only` : le proxy
 * tourne à la périphérie.
 */

export const INDEX_DU_PLAN = "/sitemap_index.xml";

/** Les deux sous-plans servis, dans l'ordre de l'index de l'ancien site. */
export const SOUS_PLANS = {
  post: "/post-sitemap.xml",
  page: "/page-sitemap.xml",
} as const;

/** La feuille de style qui rend les plans lisibles dans un navigateur. */
export const FEUILLE_DU_PLAN = "/sitemap.xsl";

const SERVIES: ReadonlySet<string> = new Set([INDEX_DU_PLAN, ...Object.values(SOUS_PLANS)]);

/**
 * Toute adresse de plan de site connue : `sitemap.xml` (Next et WordPress),
 * `sitemap_index.xml`, `wp-sitemap*.xml` (plan natif de WordPress) et les
 * sous-plans de Yoast (`category-sitemap.xml`, `post-sitemap2.xml`…).
 */
const ADRESSE_DE_PLAN = /^\/(?:sitemap(?:_index)?|wp-sitemap[a-z0-9_-]*|[a-z0-9_-]+-sitemap\d*)\.xml$/;

export function estAdresseDePlan(chemin: string): boolean {
  return ADRESSE_DE_PLAN.test(chemin.toLowerCase());
}

/**
 * La cible de la 301 d'une adresse de plan, ou `null` si l'adresse est servie
 * telle quelle (ou n'est pas une adresse de plan).
 *
 *  - un plan servi, écrit dans une autre casse : sa forme en minuscules ;
 *  - toute autre adresse de plan (`/sitemap.xml`, `category-sitemap.xml`,
 *    `fusion_tb_category-sitemap.xml`, `element_category-sitemap.xml`,
 *    `wp-sitemap.xml`…) : l'index, comme le fait l'ancien site.
 */
export function cibleAdresseDePlan(chemin: string): string | null {
  const minuscules = chemin.toLowerCase();
  if (!ADRESSE_DE_PLAN.test(minuscules)) return null;
  if (SERVIES.has(minuscules)) return minuscules === chemin ? null : minuscules;
  return INDEX_DU_PLAN;
}

/**
 * Ce qui était un BILLET sur l'ancien WordPress va dans `post-sitemap.xml` :
 * les articles de `/ressources/articles/` (dont les 12 billets repris le 14/10)
 * et les études de cas de `/preuves/`, qui étaient les « réalisations » du
 * blog. Leurs hubs restent des pages.
 */
export function estUnBillet(chemin: string): boolean {
  return /^\/(?:ressources\/articles|preuves)\/[^/]+\/$/.test(chemin);
}
