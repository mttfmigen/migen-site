import PageDuCocon from "@/app/[...slug]/page";
import FeuilleLecteur from "@/components/site/ressource/lecteur/FeuilleLecteur";
import s from "@/components/site/ressource/lecteur/lecteur.module.css";
import { CONTENUS_TECHNICIENS } from "@/components/site/ressources-hub/v2/donnees";

/**
 * Une fiche métier ou un guide de l'espace Techniciens ouvert DEPUIS une carte
 * du hub, dans le lecteur latéral (la maquette ouvre aussi ces contenus dans
 * la feuille). Le corps est la page servie elle-même (`app/[...slug]`, même
 * lecture `pageParChemin`) : aucun texte recopié. Un lien du menu ou du pied
 * de page vers /carriere/ ouvre la page entière (`depuisLeHubSeulement`).
 */

export const revalidate = 3600;

export function generateStaticParams(): { slug: string[] }[] {
  return CONTENUS_TECHNICIENS.map((x) => ({ slug: x.url.split("/").filter(Boolean).slice(1) }));
}

export default async function LecteurCarriere({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const url = `/carriere/${slug.join("/")}/`;
  return (
    <FeuilleLecteur key={url} url={url} depuisLeHubSeulement>
      <div className={s.corpsPage}>
        <PageDuCocon params={Promise.resolve({ slug: ["carriere", ...slug] })} />
      </div>
    </FeuilleLecteur>
  );
}
