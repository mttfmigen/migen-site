import type { Metadata } from "next";

import SuiteTest from "@/components/site/test-technicien/SuiteTest";
import TestTechnicien from "@/components/site/test-technicien/TestTechnicien";

/**
 * Le test technique public, écran « Test technicien » de la maquette autonome
 * (gabarit `isTest`, atteint par le lien du pied de page). Route statique :
 * aucune ligne de la table `pages` ne le décrit, et l'outil de test de la
 * Toolbox ne s'ouvre que par un lien personnel, donc ne peut pas être la cible
 * d'un lien public. Contrôle :
 * `bun components/site/test-technicien/verification-test-technicien.tsx`.
 *
 * Titre et description écrits ici : la maquette n'en donne pas pour cet écran,
 * et ils ne répètent pas le h1.
 */

const CHEMIN = "/test-technicien/";
const TITRE = "Test technique de maintenance en 8 questions | Migen";
const DESCRIPTION =
  "Huit questions de l’entretien technique Migen : consignation, roulements, vibratoire, variateurs, capteurs, hydraulique, lecture de schéma. Score et corrigé détaillé.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: CHEMIN },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: TITRE,
    description: DESCRIPTION,
    url: CHEMIN,
  },
};

export default function PageTestTechnicien() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css`.
    <div className="mg-site">
      <main data-screen-label="Test technicien" style={{ paddingTop: "96px" }}>
        <TestTechnicien />
        <SuiteTest />
      </main>
    </div>
  );
}
