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

/**
 * La description de repli de cet écran.
 *
 * MESURE DU 12/10 : la page était servie SANS meta description. Comme l'accueil
 * et « nous connaître », elle n'a pas de ligne `pages` : `metadonneesSeo`
 * renvoie `description: undefined`, et une clé présente à `undefined` annule
 * celle de la mise en page racine.
 *
 * LE TEXTE EST CELUI DE LA PAGE, mot pour mot : le chapô de
 * `components/site/partenaires/OuverturePartenaires.tsx`, repris en entier
 * parce qu'il tient dans la longueur utile. Rien n'a été reformulé.
 */
const DESCRIPTION_PAR_DEFAUT =
  "Nous ne savons pas tout faire. Pour la GMAO, l’intralogistique ou les prestations connexes, nous travaillons avec des acteurs français que nous connaissons sur le terrain.";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    // Repli volontairement différent du H1 : le titre se lit dans la page de
    // résultats, le H1 sur la page.
    titreRepli: TITRE_SEO_PARTENAIRES,
  });
  return { ...base, description: base.description ?? DESCRIPTION_PAR_DEFAUT };
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
