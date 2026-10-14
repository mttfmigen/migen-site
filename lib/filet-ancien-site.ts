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

/**
 * Suffixes qu'ajoute WordPress à toute page ou archive (pagination, flux, embed
 * oEmbed, trackback, AMP, pages de commentaires) : la cible est celle du parent.
 */
const SUFFIXE =
  /^(.*\/)(?:page\/\d+|feed(?:\/(?:rss2?|rdf|atom))?|embed|trackback|amp|comment-page-\d+)\/$/;

/** Familles WordPress, thème Avada et WooCommerce, sans équivalent ici. */
const FAMILLES =
  /^\/(?:wp-|(?:author|category|tag|search|blocks|element_category|fusion_tb_category|portfolio-items|faq-items|featured_item|contact-form-7|shop|product-category|product|cart|checkout|my-account|lost-password|comments)\/|\d{4}\/(?:\d{2}\/)?)|\.php$/;

/**
 * Plans de site de Yoast (`/sitemap_index.xml`, `/page-sitemap.xml`…), connus
 * de la Search Console : ils partent sur le plan du nouveau site.
 */
const PLAN_YOAST = /^\/(?:sitemap_index|[a-z0-9_-]+-sitemap\d*)\.xml$/;

/**
 * Débris du thème Avada que les robots ont pris pour des liens (archives du
 * 14/10) : SVG de remplissage du chargement différé (`…/%3Csvg…`), variables
 * et valeurs CSS (`/--awb-bg-color`, `/20,%2022,%2023`, `/-0px%20/%202`).
 * Aucune adresse du site ne porte un segment qui commence par « - » ni une
 * virgule, une espace ou un `<svg`.
 */
const DEBRIS = /\/(?:%3csvg|-|[^/]*(?:,|%20))/;

/** Débris isolés relevés dans les archives (clé reCAPTCHA, fichiers sans nom). */
const RESIDUS = new Set([
  "/desktop/",
  "/6letuuqfaaaaaj7pg3nganb3ffxbbs78vf7sccbh/",
  "/.svg",
  "/.png",
]);

/**
 * Variables de requête de WordPress, posées sur l'accueil. Le proxy les
 * retire aussi des paramètres qu'il reporte sur la cible d'une redirection :
 * reportées sur l'accueil, elles relanceraient le filet (une boucle).
 */
export const PARAMETRES_WORDPRESS = ["p", "page_id", "cat", "s", "attachment_id", "author", "feed", "m", "tag", "paged"];

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
  // Un débris sous une ancienne adresse redirigée (`/maintenance-industrielle-lyon/%3csvg…`,
  // `…/&`) : la cible de cette adresse. Seulement si la suite n'a pas la forme
  // d'une adresse : `/a-propos/` est redirigée, `/a-propos/equipe/` est une page.
  const racine = /^\/[^/]+\//.exec(chemin)?.[0];
  const sousAncienne =
    racine !== undefined && /[^a-z0-9/_-]/.test(chemin.slice(racine.length))
      ? connue(racine)
      : undefined;

  const parent = SUFFIXE.exec(chemin)?.[1];
  if (parent !== undefined) return connue(parent) ?? "/";
  if (PLAN_YOAST.test(chemin)) return "/sitemap.xml";
  if (FAMILLES.test(chemin) || RESIDUS.has(chemin)) return "/";
  if (sousAncienne !== undefined) return sousAncienne;
  if (DEBRIS.test(chemin)) return "/";
  // Seulement sur l'accueil : une page du nouveau site garde ses paramètres.
  if (chemin === "/" && PARAMETRES_WORDPRESS.some((p) => requete.has(p))) return "/";
  return null;
}
