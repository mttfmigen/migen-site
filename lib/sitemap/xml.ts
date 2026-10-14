import { FEUILLE_DU_PLAN } from "@/lib/sitemap/adresses";

/**
 * L'ÉCRITURE des plans XML, à l'octet près au format de l'ancien migen.fr
 * (Yoast SEO), relevé le 14/10 dans `docs/sitemap-ancien/` :
 *
 *  - la déclaration XML et l'instruction `xml-stylesheet` sur la même ligne ;
 *  - l'index `<sitemapindex>`, une entrée `<sitemap>` par sous-plan ;
 *  - les sous-plans `<urlset>` avec les espaces de noms `xsi` et `image` et le
 *    `schemaLocation` de Yoast, une `<image:image>` par image de la page ;
 *  - `<lastmod>` au format `AAAA-MM-JJTHH:MM:SS+00:00`, omise quand la date
 *    n'est pas connue (jamais l'heure du build à la place) ;
 *  - l'indentation par tabulations.
 *
 * Fonctions pures : `lib/sitemap/verification-plan-xml.ts` les éprouve sans
 * serveur ni base.
 */

export interface EntreePlan {
  /** Adresse absolue. */
  loc: string;
  lastmod?: Date;
  /** Adresses absolues des images de la page. */
  images?: readonly string[];
}

const ENTETE = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${FEUILLE_DU_PLAN}"?>`;

const URLSET =
  '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
  'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
  'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ' +
  "http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd " +
  "http://www.google.com/schemas/sitemap-image/1.1 " +
  'http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" ' +
  'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

/** `2026-05-13T06:42:29+00:00`, comme Yoast : à la seconde, en UTC. */
export function dateDuPlan(date: Date): string {
  return `${date.toISOString().slice(0, 19)}+00:00`;
}

function echappe(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function lastmod(date: Date | undefined, retrait: string): string[] {
  return date ? [`${retrait}<lastmod>${dateDuPlan(date)}</lastmod>`] : [];
}

/** La plus récente des dates connues, ou rien. */
export function plusRecente(dates: readonly (Date | undefined)[]): Date | undefined {
  const connues = dates.filter((d): d is Date => d !== undefined);
  if (connues.length === 0) return undefined;
  return new Date(Math.max(...connues.map((d) => d.getTime())));
}

export function xmlIndex(sousPlans: readonly EntreePlan[]): string {
  const lignes = sousPlans.flatMap(({ loc, lastmod: date }) => [
    "\t<sitemap>",
    `\t\t<loc>${echappe(loc)}</loc>`,
    ...lastmod(date, "\t\t"),
    "\t</sitemap>",
  ]);
  return [
    ENTETE,
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lignes,
    "</sitemapindex>",
    "",
  ].join("\n");
}

export function xmlSousPlan(entrees: readonly EntreePlan[]): string {
  const lignes = entrees.flatMap(({ loc, lastmod: date, images = [] }) => [
    "\t<url>",
    `\t\t<loc>${echappe(loc)}</loc>`,
    ...lastmod(date, "\t\t"),
    ...images.flatMap((image) => [
      "\t\t<image:image>",
      `\t\t\t<image:loc>${echappe(image)}</image:loc>`,
      "\t\t</image:image>",
    ]),
    "\t</url>",
  ]);
  return [ENTETE, URLSET, ...lignes, "</urlset>", ""].join("\n");
}

/** La réponse HTTP d'un plan, avec les en-têtes de Yoast. */
export function reponseXml(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
      // Le plan se lit, il ne se classe pas ; ses liens, eux, se suivent.
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
