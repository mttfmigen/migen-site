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
import { cibleAdresseDePlan } from "@/lib/sitemap/adresses";

const connue = (c: string) => REDIRECTIONS_CODE.get(c)?.destination;
const filet = (adresse: string) => {
  const url = new URL(adresse, "https://migen.fr");
  return cibleFilet(cheminNormalise(url.pathname), url.searchParams, connue);
};

const ATTENDUS: ReadonlyArray<readonly [string, string]> = [
  // Paginations et flux : le parent évident.
  ["/category/articles/page/2/", "/ressources/"],
  ["/category/realisations/page/3/", "/preuves/"],
  ["/actualites/page/2/", "/ressources/"],
  ["/expert-maintenance-industrielle-externalisee/page/2/", "/offres/full-service/"],
  ["/maintenance-industrielle-lyon/feed/", "/implantations/lyon/"],
  ["/page/2/", "/"],
  ["/feed", "/"],
  ["/comments/feed/", "/"],
  ["/author/x/page/4/", "/"],
  ["/maintenance-industrielle-lyon/feed/rss2/", "/implantations/lyon/"],
  ["/maintenance-industrielle-lyon/embed/", "/implantations/lyon/"],
  ["/maintenance-industrielle-lyon/amp", "/implantations/lyon/"],
  ["/maintenance-industrielle-lyon/trackback/", "/implantations/lyon/"],
  ["/maintenance-industrielle-lyon/comment-page-2/", "/implantations/lyon/"],
  ["/WP-CONTENT/uploads/x.PNG", "/"],
  ["/search/%7Bsearch_term_string%7D/", "/"],
  // Sous une ancienne adresse redirigée : sa cible. Débris du thème : l'accueil.
  ["/maintenance-industrielle-lyon/%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3C%2Fsvg%3E", "/implantations/lyon/"],
  ["/technicien-de-maintenance-centre-logistique/&", REDIRECTIONS_CODE.get("/technicien-de-maintenance-centre-logistique/")?.destination ?? "?"],
  ["/mentions-legales/%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E/", "/"],
  ["/%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E", "/"],
  ["/--awb-bg-color", "/"],
  ["/20,%2022,%2023/", "/"],
  ["/0,0,0,0.3", "/"],
  ["/-0px%20/%202/", "/"],
  ["/1200px%20+%2010px/", "/"],
  ["/desktop", "/"],
  ["/6LeTuuQfAAAAAJ7pG3NGAnb3ffxBBs78VF7SccbH", "/"],
  ["/.svg", "/"],
  ["/contact-form-7/v1", "/"],
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
  ["/?attachment_id=12", "/"],
  ["/?author=1", "/"],
  ["/?feed=rss2", "/"],
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
for (const adresse of ["/offres/nexistepas/", "/offres/?s=robot", "/?utm_source=x", "/robots.txt"]) {
  assert.equal(filet(adresse), null, `${adresse} touchée`);
}

// Les adresses de plan de site ne sont JAMAIS au filet (14/10) : `proxy.ts` les
// sert ou les redirige avant lui, par `cibleAdresseDePlan`. [adresse, 301 attendue
// ou null si servie telle quelle].
const PLANS: ReadonlyArray<readonly [string, string | null]> = [
  ["/sitemap_index.xml", null],
  ["/page-sitemap.xml", null],
  ["/post-sitemap.xml", null],
  ["/PAGE-SITEMAP.XML", "/page-sitemap.xml"],
  ["/sitemap.xml", "/sitemap_index.xml"],
  ["/Sitemap.XML", "/sitemap_index.xml"],
  ["/category-sitemap.xml", "/sitemap_index.xml"],
  ["/fusion_tb_category-sitemap.xml", "/sitemap_index.xml"],
  ["/element_category-sitemap.xml", "/sitemap_index.xml"],
  ["/post-sitemap2.xml", "/sitemap_index.xml"],
  ["/wp-sitemap.xml", "/sitemap_index.xml"],
  ["/wp-sitemap-posts-post-1.xml", "/sitemap_index.xml"],
];
for (const [adresse, attendue] of PLANS) {
  assert.equal(filet(adresse), null, `filet de ${adresse} : une adresse de plan n'est pas au filet`);
  assert.equal(cibleAdresseDePlan(adresse), attendue, `plan ${adresse}`);
}
// Témoins : ni une page, ni une image, ni un autre XML ne sont des plans.
for (const adresse of ["/plan-du-site/", "/sitemap.xsl", "/assets/sitemap.png", "/feed.xml", "/wp-login.php"]) {
  assert.equal(cibleAdresseDePlan(adresse), null, `${adresse} prise pour un plan`);
}

console.log(
  `FILET_OK : ${ATTENDUS.length} motifs attrapés, ${PAGES.length} pages du site et 4 témoins intacts ; ` +
    `${PLANS.length} adresses de plan hors du filet, servies ou en 301 vers l'index.`,
);
