import type { Metadata } from "next";

import CandidaterCarriere from "@/components/site/carriere/CandidaterCarriere";
import ConditionsCarriere from "@/components/site/carriere/ConditionsCarriere";
import HeroCarriere from "@/components/site/carriere/HeroCarriere";
import ParcoursCarriere from "@/components/site/carriere/ParcoursCarriere";
import PostesOuverts from "@/components/site/carriere/PostesOuverts";
import ProcessusCarriere from "@/components/site/carriere/ProcessusCarriere";
import TestCarriere from "@/components/site/carriere/TestCarriere";

/**
 * Page Carrière, maquette lignes 3189 à 3525.
 *
 * POURQUOI UNE ROUTE STATIQUE ET NON `app/[...slug]`. La route attrape-tout
 * sert les ~200 pages à gabarit, dont le contenu se répète d'une page à
 * l'autre et vit en base. Cet écran-là est unique : sa mise en page, ses
 * sections et ses images ne sont réemployées par aucune autre page. Il se
 * traite donc comme l'accueil, dans son propre dossier avec ses composants.
 * Next sert une route statique avant la route attrape-tout, celle-ci passe
 * donc devant sans rien changer à l'autre.
 *
 * LA NAVIGATION Y MÈNE DÉJÀ : `components/site/entete-donnees.ts` pointe
 * `/carriere/` depuis le menu principal, depuis « Nos métiers » et depuis
 * « Je n'arrive pas à recruter ». Jusqu'ici ces trois liens répondaient 404.
 *
 * L'en-tête, le pied de page et la barre d'action mobile sont montés par
 * `app/layout.tsx` : cette page ne porte que son contenu.
 */

/**
 * Le titre n'est PAS le h1, règle du projet : le titre se lit dans la page de
 * résultats, le h1 sur la page. Deux formulations, deux occasions.
 *
 * Le canonique est relatif à dessein : `app/layout.tsx` pose `metadataBase`,
 * Next l'absolutise, et ce module reste lisible par son contrôle sans que
 * l'environnement porte l'origine du site.
 */
export const metadata: Metadata = {
  title: "Carrière chez Migen, rejoindre nos équipes de maintenance",
  description:
    "Nous recrutons des techniciens de maintenance industrielle partout en France. Habilitations prises en charge, formation continue, missions chez des industriels.",
  alternates: { canonical: "/carriere/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: "Carrière chez Migen, rejoindre nos équipes de maintenance",
    description:
      "Nous recrutons des techniciens de maintenance industrielle partout en France. Habilitations prises en charge et formation continue.",
    url: "/carriere/",
  },
};

export default function Carriere() {
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle des titres et les arrondis sous 760px
    // sont toutes préfixées par cette classe.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <HeroCarriere />
        <ConditionsCarriere />
        <ParcoursCarriere />
        <TestCarriere />
        <PostesOuverts />
        <CandidaterCarriere />
        <ProcessusCarriere />
      </main>
    </div>
  );
}
