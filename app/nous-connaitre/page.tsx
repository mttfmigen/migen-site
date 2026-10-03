import type { Metadata } from "next";

import EquipeProche from "@/components/site/nous-connaitre/EquipeProche";
import Fidelisation from "@/components/site/nous-connaitre/Fidelisation";
import FriseCinqAns from "@/components/site/nous-connaitre/FriseCinqAns";
import MotDuDirigeant from "@/components/site/nous-connaitre/MotDuDirigeant";
import OrigineDuNom from "@/components/site/nous-connaitre/OrigineDuNom";
import Ouverture from "@/components/site/nous-connaitre/Ouverture";
import PerimetreOuiNon from "@/components/site/nous-connaitre/PerimetreOuiNon";
import PortesValeursRse from "@/components/site/nous-connaitre/PortesValeursRse";
import Reperes from "@/components/site/nous-connaitre/Reperes";
import TerrainsExcellence from "@/components/site/nous-connaitre/TerrainsExcellence";
import TroisCases from "@/components/site/nous-connaitre/TroisCases";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * « Nous connaître », route statique.
 *
 * POURQUOI CETTE PAGE N'EST PAS SERVIE PAR `app/[...slug]` comme les ~200
 * pages à gabarit : son contenu n'est pas du gabarit répété, c'est une
 * composition unique, douze sections avec leur mise en page et leurs images.
 * Même raison que la page d'accueil. Next résout une route statique AVANT la
 * route attrape-tout, celle-ci passe donc devant sans configuration.
 *
 * Elle lit tout de même sa ligne `pages` pour son référencement, quand elle
 * existe, afin que le meta title et la description restent pilotés par la base
 * comme sur le reste du site.
 *
 * ORDRE DES SECTIONS : celui de la maquette, lignes 5201 à 5528 de
 * `maquette/accueil-rendu.html`. Il raconte, il n'est pas esthétique : le
 * métier, les repères, la parole du dirigeant, le nom, le modèle, l'histoire,
 * la fidélisation, le périmètre, les gens, les portes de sortie, l'action.
 */

export const revalidate = 3600;

/*
 * LE TITRE N'EST PAS LE H1, et c'est une règle du projet, pas un détail : le
 * H1 de la page est « Un seul métier : technicien de maintenance. », le titre
 * ci-dessous se lit dans une page de résultats, où il doit nommer l'entreprise
 * et la nature de la page. Ce repli ne sert que si la ligne `seo` manque.
 */
const TITRE_PAR_DEFAUT =
  "Qui est Migen : histoire, modèle et équipes de maintenance industrielle";

const CHEMIN = "/nous-connaitre/";

/* Copie du formulaire de cet écran, maquette lignes 5505 à 5509. Les espaces
   insécables sont écrites en échappement : dans une chaîne, un `&nbsp;` serait
   rendu littéralement par React. */
const TITRE_FORMULAIRE =
  "Un chargé d’affaires vous rappelle dans l’heure.";
const INTRO_FORMULAIRE =
  "Du lundi au vendredi, de 8 h 00 à 18 h 30. Nous qualifions le besoin et vous annonçons un délai de démarrage réaliste.";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  return metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    titreRepli: TITRE_PAR_DEFAUT,
  });
}

export default function NousConnaitre() {
  return (
    // `mg-site` porte toutes les reprises mobiles de `app/globals.css` : marges,
    // échelle des titres, arrondis sous 760px. Sans elle, le téléphone reçoit le
    // gabarit desktop.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <Ouverture />
        <Reperes />
        <MotDuDirigeant />
        <TerrainsExcellence />
        <OrigineDuNom />
        <TroisCases />
        <FriseCinqAns />
        <Fidelisation />
        <PerimetreOuiNon />
        <EquipeProche />
        <PortesValeursRse />
        {/* La maquette rend ici son propre formulaire, identique champ pour
            champ à celui de l'accueil. Le composant déjà porté est réemployé,
            avec le titre et l'introduction de cet écran. */}
        <FormulaireBasDePage
          formulaire="nous-connaitre-bas-de-page"
          titre={TITRE_FORMULAIRE}
          intro={INTRO_FORMULAIRE}
        />
      </main>
    </div>
  );
}
