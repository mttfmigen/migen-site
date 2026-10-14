import type { Metadata } from "next";

import HubRessources from "@/components/site/ressources-hub/v2/HubRessources";
import { TITRE_PAGE } from "@/components/site/ressources-hub/v2/filtrage";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Le hub /ressources/, route statique, portée sur la maquette « Ressources v2 »
 * (`maquette/ressources-v2/`). La maquette fait foi : la page EST le hub
 * dessiné (colonne de filtres, recherche, « À la une », bibliothèque,
 * Diagnostic, formulaire), entre l'en-tête et le pied du site. Elle remplace
 * le gabarit guide et le haut de page mobile qui la portaient avant.
 *
 * Le titre est celui que la maquette pose côté Entreprises (`pageTitle`,
 * page-dc.jsx) ; le hub le change côté Techniciens, comme elle. La description reprend le chapô de la page, mot pour mot :
 * la ligne `seo` parlait de « fiches pratiques », marquées « Bientôt » sur le
 * hub. Le reste (canonique, vignette, noindex) vient toujours de la table `seo`.
 * Le contenu du hub est versionné (`components/site/ressources-hub/v2/donnees.ts`) :
 * le rendu serveur sert les 28 cartes, sans JavaScript.
 */

export const revalidate = 3600;

const CHEMIN = "/ressources/";
const TITRE = TITRE_PAGE.ent;
const DESCRIPTION =
  "Méthodes, organisation, GMAO, intelligence artificielle : écrit par nos équipes, à partir de ce qu’elles voient sur les sites industriels.";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  const base = metadonneesSeo({ seo: complete?.seo ?? null, chemin: CHEMIN, titreRepli: TITRE });
  return {
    ...base,
    title: TITRE,
    description: DESCRIPTION,
    openGraph: { ...base.openGraph, title: TITRE, description: DESCRIPTION },
  };
}

export default function PageHubRessources() {
  return <HubRessources />;
}
