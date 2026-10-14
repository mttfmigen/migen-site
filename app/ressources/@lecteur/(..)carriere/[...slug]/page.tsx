import ContenuLecteur from "@/components/site/ressource/lecteur/ContenuLecteur";
import FeuilleLecteur from "@/components/site/ressource/lecteur/FeuilleLecteur";
import RechargePage from "@/components/site/ressource/lecteur/RechargePage";
import { ficheVersLecteur } from "@/components/site/ressource/lecteur/fiche-vers-lecteur";
import { CONTENUS_TECHNICIENS } from "@/components/site/ressources-hub/v2/donnees";
import { pageParChemin } from "@/lib/contenu";
import { estMetier } from "@/types/metier";

/**
 * Une fiche métier ou un guide de l'espace Techniciens ouvert DEPUIS une carte
 * du hub, dans le lecteur latéral, DESSINÉ COMME LA MAQUETTE : le même lecteur
 * que les articles (fil, pastilles, photo, parties numérotées, « À retenir »,
 * FAQ, « Ce métier vous ressemble ? », « À lire ensuite »). Le TEXTE est celui
 * de la page servie (`ficheVersLecteur`). Rendre la page entière dans la
 * feuille posait un second `<main>`, un second h1 et un second `#postuler`
 * dans le DOM du hub. Un lien du menu ou du pied de page vers /carriere/
 * ouvre la page entière (`depuisLeHubSeulement`).
 */

export const revalidate = 3600;

export function generateStaticParams(): { slug: string[] }[] {
  return CONTENUS_TECHNICIENS.map((x) => ({ slug: x.url.split("/").filter(Boolean).slice(1) }));
}

export default async function LecteurCarriere({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const url = `/carriere/${slug.join("/")}/`;
  const complete = await pageParChemin(url);
  if (!complete || !estMetier(complete.page.contenu)) return <RechargePage />;
  return (
    <FeuilleLecteur key={url} url={url} depuisLeHubSeulement>
      <ContenuLecteur url={url} titre={complete.page.titre_h1} contenu={ficheVersLecteur(complete.page.contenu)} />
    </FeuilleLecteur>
  );
}
