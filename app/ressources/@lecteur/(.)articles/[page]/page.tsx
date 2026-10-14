import ContenuLecteur from "@/components/site/ressource/lecteur/ContenuLecteur";
import FeuilleLecteur from "@/components/site/ressource/lecteur/FeuilleLecteur";
import RechargePage from "@/components/site/ressource/lecteur/RechargePage";
import { CONTENUS_ENTREPRISES } from "@/components/site/ressources-hub/v2/donnees";
import { pageParChemin } from "@/lib/contenu";
import { estRessource } from "@/types/ressource";

/**
 * Un article ouvert DEPUIS le hub : navigation douce interceptée, rendue dans
 * le lecteur latéral au-dessus du hub. Mêmes données que la page complète.
 * Une adresse qui n'est pas une page ressource recharge la vraie page.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  return CONTENUS_ENTREPRISES.filter((x) => x.url.startsWith("/ressources/articles/")).map((x) => ({
    page: x.url.split("/")[3],
  }));
}

export default async function LecteurArticle({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const url = `/ressources/articles/${page}/`;
  const complete = await pageParChemin(url);
  if (!complete || !estRessource(complete.page.contenu)) return <RechargePage />;
  return (
    <FeuilleLecteur key={url} url={url}>
      <ContenuLecteur url={url} titre={complete.page.titre_h1} contenu={complete.page.contenu} />
    </FeuilleLecteur>
  );
}
