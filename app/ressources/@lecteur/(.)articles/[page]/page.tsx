import ContenuLecteur from "@/components/site/ressource/lecteur/ContenuLecteur";
import FeuilleLecteur from "@/components/site/ressource/lecteur/FeuilleLecteur";
import { lectureDePage, lectureMaquette } from "@/components/site/ressource/lecteur/lecture";
import RechargePage from "@/components/site/ressource/lecteur/RechargePage";
import { CONTENUS_ENTREPRISES } from "@/components/site/ressources-hub/v2/donnees";
import { pageParChemin } from "@/lib/contenu";
import { estRessource } from "@/types/ressource";

/**
 * Un article ouvert DEPUIS le hub : navigation douce interceptée, rendue dans
 * le lecteur latéral au-dessus du hub, gabarit et données de la maquette
 * « Ressources v2 » (`lecture.ts`). Un billet repris, que la maquette n'a
 * pas, garde le texte de sa page. Une adresse qui n'est ni l'un ni l'autre
 * recharge la vraie page. La page complète (`app/[...slug]`) ne change pas.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  return CONTENUS_ENTREPRISES.filter((x) => x.url.startsWith("/ressources/articles/")).map((x) => ({
    page: x.url.split("/")[3],
  }));
}

async function lecture(url: string) {
  const maquette = lectureMaquette(url);
  if (maquette) return maquette;
  const complete = await pageParChemin(url);
  if (!complete || !estRessource(complete.page.contenu)) return null;
  const carte = CONTENUS_ENTREPRISES.find((x) => x.url === url);
  return lectureDePage(url, complete.page.titre_h1, complete.page.contenu, carte);
}

export default async function LecteurArticle({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const url = `/ressources/articles/${page}/`;
  const lu = await lecture(url);
  if (!lu) return <RechargePage />;
  return (
    <FeuilleLecteur key={url} url={url}>
      <ContenuLecteur lecture={lu} />
    </FeuilleLecteur>
  );
}
