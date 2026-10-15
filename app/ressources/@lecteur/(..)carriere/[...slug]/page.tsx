import ContenuLecteur from "@/components/site/ressource/lecteur/ContenuLecteur";
import FeuilleLecteur from "@/components/site/ressource/lecteur/FeuilleLecteur";
import { lectureMaquette } from "@/components/site/ressource/lecteur/lecture";
import RechargePage from "@/components/site/ressource/lecteur/RechargePage";
import { CONTENUS_TECHNICIENS } from "@/components/site/ressources-hub/v2/donnees";

/**
 * Une fiche métier ou un guide de l'espace Techniciens ouvert DEPUIS une carte
 * du hub, dans le lecteur latéral : gabarit et données de la maquette
 * « Ressources v2 », qui porte les 13 fiches du hub (`lecture.ts`). Une
 * adresse que la maquette n'a pas recharge la page entière, comme un lien du
 * menu ou du pied de page vers /carriere/ (`depuisLeHubSeulement`).
 */

export const revalidate = 3600;

export function generateStaticParams(): { slug: string[] }[] {
  return CONTENUS_TECHNICIENS.map((x) => ({ slug: x.url.split("/").filter(Boolean).slice(1) }));
}

export default async function LecteurCarriere({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const url = `/carriere/${slug.join("/")}/`;
  const lu = lectureMaquette(url);
  if (!lu) return <RechargePage />;
  return (
    <FeuilleLecteur key={url} url={url} depuisLeHubSeulement>
      <ContenuLecteur lecture={lu} />
    </FeuilleLecteur>
  );
}
