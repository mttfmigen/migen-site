import type { Metadata } from "next";

import HubRessources from "@/components/site/ressources-hub/v2/HubRessources";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Le hub /ressources/, route statique, portée sur la maquette « Ressources v2 »
 * (`maquette/ressources-v2/`). La maquette fait foi : la page EST le hub
 * dessiné (colonne de filtres, recherche, « À la une », bibliothèque,
 * Diagnostic, formulaire), entre l'en-tête et le pied du site. Elle remplace
 * le gabarit guide et le haut de page mobile qui la portaient avant.
 *
 * Les métadonnées restent celles de la table `seo`, comme avant. Le contenu
 * du hub est versionné (`components/site/ressources-hub/v2/donnees.ts`) : le
 * rendu serveur sert les 28 cartes, sans JavaScript.
 */

export const revalidate = 3600;

const CHEMIN = "/ressources/";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  if (!complete) return { title: "Ressources maintenance industrielle | Migen", alternates: { canonical: CHEMIN } };
  return metadonneesSeo({
    seo: complete.seo,
    chemin: CHEMIN,
    titreRepli: complete.page.titre_h1,
  });
}

export default function PageHubRessources() {
  return <HubRessources />;
}
