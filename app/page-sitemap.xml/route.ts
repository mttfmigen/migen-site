import { entreesDuPlan } from "@/lib/sitemap/plan";
import { reponseXml, xmlSousPlan } from "@/lib/sitemap/xml";

/** Le sous-plan des pages. Voir `docs/PLAN-DU-SITE-XML.md`. */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return reponseXml(xmlSousPlan((await entreesDuPlan()).page));
}
