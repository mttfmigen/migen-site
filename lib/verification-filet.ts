/**
 * Le filet de l'ancien WordPress attrape-t-il chaque motif, et lui seul ?
 *
 *   bun lib/verification-filet.ts
 *
 * Un exemple par motif, avec sa destination attendue, puis les témoins : une
 * page du nouveau site, une adresse qui n'a jamais existé et qui ne ressemble
 * pas à WordPress, et une page qui porte un paramètre, ne sont pas touchées.
 */
import assert from "node:assert/strict";

import { cibleFilet } from "@/lib/filet-ancien-site";
import { cheminNormalise, REDIRECTIONS_CODE } from "@/lib/redirections";
import { ROUTES_STATIQUES } from "@/lib/routes-statiques";

const connue = (c: string) => REDIRECTIONS_CODE.get(c)?.destination;
const filet = (adresse: string) => {
  const url = new URL(adresse, "https://migen.fr");
  return cibleFilet(cheminNormalise(url.pathname), url.searchParams, connue);
};

const ATTENDUS: ReadonlyArray<readonly [string, string]> = [
  // Paginations et flux : le parent évident.
  ["/category/articles/page/2/", "/ressources/articles/"],
  ["/category/realisations/page/3/", "/preuves/"],
  ["/actualites/page/2/", "/ressources/articles/"],
  ["/expert-maintenance-industrielle-externalisee/page/2/", "/offres/full-service/"],
  ["/maintenance-industrielle-lyon/feed/", "/implantations/lyon/"],
  ["/page/2/", "/"],
  ["/feed", "/"],
  ["/comments/feed/", "/"],
  ["/author/x/page/4/", "/"],
  // Familles WordPress, Avada, WooCommerce.
  ["/wp-content/uploads/2023/02/logo2r-300x68.png", "/"],
  ["/wp-includes/js/jquery/jquery.min.js", "/"],
  ["/wp-admin", "/"],
  ["/wp-login.php", "/"],
  ["/wp-json/wp/v2/pages", "/"],
  ["/xmlrpc.php", "/"],
  ["/author/antoinedigirolamo/", "/"],
  ["/category/uncategorized/", "/"],
  ["/tag/maintenance/", "/"],
  ["/blocks/erreur-404/", "/"],
  ["/element_category/columns/", "/"],
  ["/fusion_tb_category/footer/", "/"],
  ["/portfolio-items/", "/"],
  ["/faq-items/", "/"],
  ["/featured_item/", "/"],
  ["/shop/", "/"],
  ["/product-category/uncategorized/", "/"],
  ["/product/casque/", "/"],
  ["/cart/", "/"],
  ["/checkout/", "/"],
  ["/my-account/", "/"],
  ["/lost-password/?page_id=11", "/"],
  ["/2023/02/un-billet/", "/"],
  // Liens courts et recherche sur l'accueil.
  ["/?p=12", "/"],
  ["/?page_id=8", "/"],
  ["/?cat=3", "/"],
  ["/?s=robot", "/"],
];

for (const [adresse, attendue] of ATTENDUS) {
  assert.equal(filet(adresse), attendue, `filet de ${adresse}`);
}

// Témoins : rien de ce que sert le nouveau site n'est touché.
const PAGES = [
  ...ROUTES_STATIQUES,
  ...[...REDIRECTIONS_CODE.values()].map((r) => cheminNormalise(r.destination)),
];
for (const page of PAGES) assert.equal(filet(page), null, `page ${page} touchée`);
for (const adresse of ["/offres/nexistepas/", "/offres/?s=robot", "/?utm_source=x", "/robots.txt", "/sitemap.xml"]) {
  assert.equal(filet(adresse), null, `${adresse} touchée`);
}

console.log(
  `FILET_OK : ${ATTENDUS.length} motifs attrapés, ${PAGES.length} pages du site et 5 témoins intacts.`,
);
