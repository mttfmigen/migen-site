import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AppelAPartenaires from "@/components/site/partenaires/AppelAPartenaires";
import FonctionnementPartenariat from "@/components/site/partenaires/FonctionnementPartenariat";
import OuverturePartenaires from "@/components/site/partenaires/OuverturePartenaires";
import {
  FORMULAIRE_PARTENAIRES,
  INTRO_FORMULAIRE_PARTENAIRES,
  TITRE_FORMULAIRE_PARTENAIRES,
  TITRE_SEO_PARTENAIRES,
} from "@/components/site/partenaires/donnees";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Page « Partenaires », maquette/accueil-rendu.html lignes 6032 à 6126.
 *
 * POURQUOI UNE ROUTE STATIQUE ET NON `app/[...slug]`. La base sert les ~200
 * pages à gabarit, dont les sections se répètent d'une page à l'autre. Cet
 * écran est unique : sa mise en page, ses cartes de partenaires et son panneau
 * d'appel ne sont réemployés par aucune autre page. Il vit donc ici, comme la
 * page d'accueil. Next sert cette route avant l'attrape-tout.
 *
 * Elle lit tout de même sa ligne `pages`, quand elle existe, afin que le meta
 * title et la description restent pilotés par la base comme partout ailleurs.
 */

export const revalidate = 3600;

const CHEMIN = "/partenaires/";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  return metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    // Repli volontairement différent du H1 : le titre se lit dans la page de
    // résultats, le H1 sur la page.
    titreRepli: TITRE_SEO_PARTENAIRES,
  });
}

export default function Partenaires() {
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle des titres et les arrondis sous 760px
    // sont toutes préfixées par cette classe.
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <OuverturePartenaires />
        <FonctionnementPartenariat />
        <AppelAPartenaires />
        <FormulaireBasDePage
          formulaire={FORMULAIRE_PARTENAIRES}
          titre={TITRE_FORMULAIRE_PARTENAIRES}
          intro={INTRO_FORMULAIRE_PARTENAIRES}
        />
      </main>
    </div>
  );
}
