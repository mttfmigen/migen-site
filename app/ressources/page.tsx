import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FilAriane from "@/components/cocon/FilAriane";
import Maillage from "@/components/cocon/Maillage";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import Guide from "@/components/site/editorial/Guide";
import PageEditoriale from "@/components/site/editorial/PageEditoriale";
import BibliothequeRessources from "@/components/site/ressources-hub/BibliothequeRessources";
import { bibliotheque } from "@/components/site/ressources-hub/catalogue";
import HautDePageRessources from "@/components/site/ressources-hub/HautDePageRessources";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";
import { estEditorial } from "@/types/editorial";

/**
 * Le hub /ressources/, route statique.
 *
 * POURQUOI CETTE PAGE SORT DE `app/[...slug]` : la maquette mobile v2 lui
 * donne un haut de page sur mesure (LISEZMOI de `maquette/mobile-v2/` :
 * « Accueil, Ressources et Contact ont un haut de page sur mesure »), et ce
 * bloc se greffe ENTRE le héros du gabarit guide et la bibliothèque, un
 * emplacement que la route attrape-tout ne sait pas servir sans toucher
 * `PageEditoriale`, qui appartient à d'autres pages. Next résout une route
 * statique AVANT la route attrape-tout, le précédent est déjà écrit dans
 * `app/nous-connaitre/page.tsx`.
 *
 * CE QUE CETTE ROUTE REND : EXACTEMENT ce que `app/[...slug]` rendait pour
 * /ressources/, plus le haut de page mobile. La branche édito de
 * `PageEditoriale` monte `Guide` avec la bibliothèque et ignore le fil et le
 * maillage calculés : la composition ci-dessous reproduit cette branche à
 * l'identique, puis insère `HautDePageRessources` au-dessus de la
 * bibliothèque. La porte `verification-haut-de-page.tsx` prouve que le rendu
 * d'avant est contenu dans celui d'après, au caractère près.
 */

export const revalidate = 3600;

const CHEMIN = "/ressources/";

/**
 * La pastille de format du hub, même discriminant que `PageEditoriale`
 * (`FORMAT_HUB_RESSOURCES`) : c'est elle qui vaut « cette page édito est LE
 * hub des ressources », donc elle qui décide de la bibliothèque et du haut
 * de page.
 */
const FORMAT_HUB_RESSOURCES = "Ressources";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  if (!complete) return { title: "Page introuvable" };
  return metadonneesSeo({
    seo: complete.seo,
    chemin: CHEMIN,
    titreRepli: complete.page.titre_h1,
  });
}

export default async function PageHubRessources() {
  const complete = await pageParChemin(CHEMIN);
  if (!complete) notFound();
  const { page } = complete;

  if (!estEditorial(page.contenu)) {
    // Impossible tant que /ressources/ est le hub de rubrique porté par le
    // relais disque (`supabase/import/gabarits-maquette/ressources.json`).
    // Si sa forme change un jour, cette route doit être revue AVEC elle :
    // on échoue bruyamment plutôt que de servir un gabarit au hasard.
    throw new Error(
      `${CHEMIN} n'est plus une page éditoriale : reprendre app/ressources/page.tsx avec sa nouvelle forme.`,
    );
  }

  if (page.contenu.edito) {
    const vue = page.contenu.edito;
    const estLeHub = vue.format === FORMAT_HUB_RESSOURCES;
    return (
      <Guide
        titre={page.titre_h1}
        vue={vue}
        bibliotheque={
          estLeHub ? (
            <>
              <HautDePageRessources />
              <BibliothequeRessources bibliotheque={bibliotheque()} />
            </>
          ) : undefined
        }
      />
    );
  }

  // Repli : la page édito sans vue guide, rendue comme la route attrape-tout
  // la rendait, fil d'Ariane et maillage compris. Rien ne se perd.
  return (
    <PageEditoriale
      titre={page.titre_h1}
      contenu={page.contenu}
      filAriane={<FilAriane path={page.path} />}
      maillage={
        <>
          <FormulaireBasDePage
            formulaire={`cocon${page.path.replace(/\//g, "-")}`}
          />
          <Maillage page={page} />
        </>
      }
    />
  );
}
