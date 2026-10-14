import { entreesDuPlan } from "@/lib/sitemap/plan";
import { reponseXml, xmlSousPlan } from "@/lib/sitemap/xml";

/**
 * Le sous-plan des billets : articles de `/ressources/articles/` et études de
 * cas de `/preuves/`. Voir `docs/PLAN-DU-SITE-XML.md`.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return reponseXml(xmlSousPlan((await entreesDuPlan()).post));
}
