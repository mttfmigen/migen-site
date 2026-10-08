import type { Metadata } from "next";

import { HUB_CARRIERE } from "@/components/site/carriere/donnees-hub";
import PageHubCarriere from "@/components/site/carriere/PageHubCarriere";

/**
 * Le hub `/carriere/`, gabarit 10 « Hub de rubrique » de l'index de la
 * maquette (`maquette/contenu/site/index.json`), porté contre sa capture
 * `maquette/rendu/carriere.html`. Contrôle :
 * `bun components/site/carriere/verification-carriere.tsx`.
 *
 * ROUTE STATIQUE, comme avant : Next la sert avant `app/[...slug]`, rien à
 * changer au routeur. L'en-tête et le pied sont montés par `app/layout.tsx`.
 *
 * Titre et description : ceux de la fiche de la page dans la maquette
 * (`Metiers-Carriere/carriere.md`, « Title SEO » et « Meta description »),
 * mot pour mot. Pas de gabarit de titre dans `app/layout.tsx` : le suffixe
 * « | Migen » est celui de la fiche.
 */

const TITRE = "Migen recrutement | Migen";
const DESCRIPTION =
  "Migen recrutement : rejoindre une entreprise de maintenance industrielle qui évalue vraiment ses techniciens. Postes, alternance, candidature.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: "/carriere/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: TITRE,
    description: DESCRIPTION,
    url: "/carriere/",
  },
};

export default function Carriere() {
  return <PageHubCarriere contenu={HUB_CARRIERE} />;
}
