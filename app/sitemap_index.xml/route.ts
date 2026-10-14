import { sousPlansDuPlan } from "@/lib/sitemap/plan";
import { reponseXml, xmlIndex } from "@/lib/sitemap/xml";

/**
 * L'index du plan de site, au format de l'ancien migen.fr (Yoast) : celui que
 * déclare `robots.txt`. Voir `docs/PLAN-DU-SITE-XML.md`.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return reponseXml(xmlIndex(await sousPlansDuPlan()));
}
