import type { Metadata } from "next";

import PlanDuSite, { type EntreePlan } from "@/components/site/plan/PlanDuSite";
import {
  cheminNormalise,
  SOURCES_REFONTE,
  sourcesRedirigees,
} from "@/lib/redirections";
import { urlAbsolue } from "@/lib/seo/url";
import { vignetteDeLaPage } from "@/lib/seo/vignette";
import { lectureContenu } from "@/lib/supabase";

/**
 * Plan du site, écran « Plan du site » de la maquette locale
 * (`maquette/accueil-rendu.html`, lignes 2926 à 2948).
 *
 * POURQUOI UNE ROUTE STATIQUE et non une ligne de la table `pages` servie par
 * `app/[...slug]/` : la base sert les pages à gabarit, dont les dix sections se
 * répètent d'une page à l'autre. Cet écran a sa propre mise en page, et personne
 * ne la réemploie. Il vit donc dans `app/`, comme la page d'accueil. Next sert
 * une route statique avant la route attrape-tout, celle-ci passe donc devant.
 *
 * CE CHEMIN N'EXISTE NI EN BASE NI DANS `docs/urls-site-actuel.json` : il est
 * créé par cette route. Il reste à le déclarer dans l'inventaire pour que le
 * lien du pied de page et les contrôles de liens le connaissent.
 *
 * LA LECTURE EST ICI, l'habillage dans le composant : règle du contrat, et
 * c'est aussi ce qui rend l'habillage contrôlable sans base de données.
 *
 * L'ERREUR EST ABSORBÉE VOLONTAIREMENT. Ce plan est cité par le pied de page,
 * donc par toutes les pages du site : une base injoignable doit donner un plan
 * vide, pas une erreur 500 sur un lien présent partout. Elle est journalisée
 * côté serveur, jamais tue.
 */

/** ISR : une heure, comme l'accueil et le cocon. */
export const revalidate = 3600;

/**
 * Le titre n'est pas le H1, règle du projet : le H1 (« Toutes nos pages, au même
 * endroit. ») s'adresse au visiteur déjà sur la page, le titre à celui qui lit
 * une page de résultats et cherche un plan du site.
 */
export const metadata: Metadata = {
  title: "Plan du site : toutes les pages de Migen",
  description:
    "Toutes les pages publiées du site Migen, groupées par rubrique : offres, expertises, secteurs, implantations.",
  alternates: { canonical: urlAbsolue("/plan-du-site/") },
  // `type`, `locale` et `siteName` sont REPÉTÉS ici bien que la mise en page
  // racine les porte : déclarer un `openGraph` sur une page REMPLACE celui de
  // la racine en entier, Next ne fusionne pas les champs imbriqués. Mesuré :
  // sans ces trois lignes, cette page perdait og:site_name, og:locale et
  // og:type que toutes les autres portent. `title` et `description`, eux, sont
  // laissés à Next, qui reprend ceux déclarés ci-dessus : les réécrire les
  // ferait diverger au premier changement.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    url: urlAbsolue("/plan-du-site/"),
    images: vignetteDeLaPage("/plan-du-site/"),
  },
  robots: { index: true, follow: true },
};

/**
 * Les chemins qui ne sont PAS des pages : les sources de redirection.
 *
 * MÊME DÉFAUT QUE LE PLAN XML, MESURÉ LE 13/10 : cet écran posait quatre liens
 * qui répondent 301, les deux fiches inventées retirées par G56 et deux
 * sources de redirection de la refonte. Elles gardent une ligne `published`
 * dans `pages`, l'écran les lisait comme des pages.
 *
 * LE REPLI EST EXPLICITE, pas silencieux : si la table des redirections est
 * illisible, on garde au moins les sources versionnées de la refonte, qui
 * couvrent les quatre adresses mesurées, et on le journalise. Cet écran est
 * cité par le pied de page, donc par toutes les pages du site : il ne peut pas
 * se permettre d'échouer, mais il ne doit pas non plus reposer des liens morts.
 */
async function cheminsRedirigees(): Promise<ReadonlySet<string>> {
  try {
    return await sourcesRedirigees();
  } catch (erreur) {
    console.error(
      "Plan du site, sources de redirection illisibles, repli sur celles de la refonte :",
      erreur instanceof Error ? erreur.message : erreur,
    );
    return SOURCES_REFONTE;
  }
}

export default async function PagePlanDuSite() {
  // La RLS ne remonte que les contenus publiés : le plan ne peut pas annoncer
  // un brouillon, et il n'a donc pas à filtrer sur le statut.
  const [{ data, error }, redirigees] = await Promise.all([
    lectureContenu().from("pages").select("path, titre_h1").order("path"),
    cheminsRedirigees(),
  ]);

  if (error) {
    console.error("Plan du site indisponible :", error.message);
  }

  const pages: EntreePlan[] = (data ?? []).filter(
    (page) => !redirigees.has(cheminNormalise(page.path)),
  );
  return <PlanDuSite pages={pages} />;
}
