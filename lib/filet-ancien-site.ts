/**
 * Le filet de l'ancien site WordPress : toute adresse au FORMAT WordPress qui
 * n'est ni une page du nouveau site ni une redirection connue part en 301 vers
 * l'accueil, ou vers le parent évident.
 *
 * RÈGLE DE MEHDI, 14/10/2026 : « toute URL de l'ancien site doit renvoyer vers
 * une page, c'est la règle » ; « sur les pages introuvables, renvoie-les vers
 * la home quand même ».
 *
 * APPLIQUÉ PAR `proxy.ts`, APRÈS la table `redirects` et les lignes versionnées
 * (`lib/redirections-ancien-site.ts`) : une redirection connue l'emporte
 * toujours. Aucun motif ne recouvre une adresse du nouveau site (mesuré le
 * 14/10 sur les 272 adresses du plan du site) ; la porte
 * `scripts/verifie-redirections.mjs` exige 200 sur chacune, et le contrôle
 * `bun lib/verification-filet.ts` porte un témoin par famille.
 *
 * Les chemins reçus sont CANONIQUES (`cheminNormalise` : minuscules, slash
 * final sauf fichier).
 */

/** Pagination et flux d'une archive : la cible est celle de l'archive. */
const SUFFIXE = /^(.*\/)(?:page\/\d+|feed)\/$/;

/** Familles WordPress, thème Avada et WooCommerce, sans équivalent ici. */
const FAMILLES =
  /^\/(?:wp-|(?:author|category|tag|blocks|element_category|fusion_tb_category|portfolio-items|faq-items|featured_item|shop|product-category|product|cart|checkout|my-account|lost-password|comments)\/|\d{4}\/(?:\d{2}\/)?)|\.php$/;

/** Liens courts et recherche de WordPress, posés sur l'accueil. */
const PARAMETRES = ["p", "page_id", "cat", "s"];

/**
 * La destination du filet, ou `null` si l'adresse n'est pas de l'ancien format.
 *
 * `connue` rend la destination finale d'une redirection connue (base puis
 * code), ou `undefined` : c'est elle qui donne le parent évident d'une
 * pagination, `/category/articles/page/2/` partant comme `/category/articles/`.
 */
export function cibleFilet(
  chemin: string,
  requete: URLSearchParams,
  connue: (chemin: string) => string | undefined,
): string | null {
  const parent = SUFFIXE.exec(chemin)?.[1];
  if (parent !== undefined) return connue(parent) ?? "/";
  if (FAMILLES.test(chemin)) return "/";
  // Seulement sur l'accueil : une page du nouveau site garde ses paramètres.
  if (chemin === "/" && PARAMETRES.some((p) => requete.has(p))) return "/";
  return null;
}
