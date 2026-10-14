import type { Metadata } from "next";

import EquipeProche, {
  SOMMAIRE_EQUIPE_PROCHE,
} from "@/components/site/nous-connaitre/EquipeProche";
import Fidelisation, {
  SOMMAIRE_FIDELISATION,
} from "@/components/site/nous-connaitre/Fidelisation";
import FriseCinqAns, { SOMMAIRE_HISTOIRE } from "@/components/site/nous-connaitre/FriseCinqAns";
import MotDuDirigeant, {
  SOMMAIRE_MOT_DU_DIRIGEANT,
} from "@/components/site/nous-connaitre/MotDuDirigeant";
import OrigineDuNom, { SOMMAIRE_ORIGINE } from "@/components/site/nous-connaitre/OrigineDuNom";
import Ouverture from "@/components/site/nous-connaitre/Ouverture";
import PerimetreOuiNon, {
  SOMMAIRE_PERIMETRE,
} from "@/components/site/nous-connaitre/PerimetreOuiNon";
import PortesValeursRse, {
  SOMMAIRE_PORTES,
} from "@/components/site/nous-connaitre/PortesValeursRse";
import Reperes from "@/components/site/nous-connaitre/Reperes";
import TerrainsExcellence, {
  SOMMAIRE_TERRAINS,
} from "@/components/site/nous-connaitre/TerrainsExcellence";
import TroisCases, { SOMMAIRE_MODELE } from "@/components/site/nous-connaitre/TroisCases";
import FinDePageMobile from "@/components/site/nous-connaitre/FinDePageMobile";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
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

/* Le sommaire du haut de page, sur téléphone (dc.html L116) : les cartes
   numérotées, dans l'ordre où la page les montre. */
const SOMMAIRE = [
  SOMMAIRE_MOT_DU_DIRIGEANT,
  SOMMAIRE_TERRAINS,
  SOMMAIRE_ORIGINE,
  SOMMAIRE_MODELE,
  SOMMAIRE_HISTOIRE,
  SOMMAIRE_FIDELISATION,
  SOMMAIRE_PERIMETRE,
  SOMMAIRE_EQUIPE_PROCHE,
  SOMMAIRE_PORTES,
] as const;

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

/**
 * La description de repli de cet écran.
 *
 * MESURE DU 12/10 : la page était servie SANS meta description. Comme l'accueil
 * et `/partenaires/`, elle n'a pas de ligne `pages` : `metadonneesSeo` renvoie
 * `description: undefined`, et une clé présente à `undefined` annule celle de
 * la mise en page racine.
 *
 * LE TEXTE EST CELUI DE LA PAGE, mot pour mot : la seconde moitié du chapô de
 * `components/site/nous-connaitre/Ouverture.tsx`, à partir des deux-points.
 * Seule la majuscule initiale est de nous.
 *
 * CORRIGÉE LE 13/10 AU SOIR, ET C'EST LE RETOUR DE NATHAN QUI ÉTAIT RESTÉ
 * SERVI. Le matin, le chapô de la page avait été réécrit pour nommer les trois
 * métiers, puisque Nathan Jorez signalait « cette page est ultra spé résidence
 * comme si c'était la seule offre ». Cette constante-ci, elle, portait encore
 * la phrase d'AVANT, celle qui ne parlait que d'affecter des techniciens sur
 * des sites. Autrement dit : la page avait été corrigée, et le texte que
 * GOOGLE lit disait toujours le contraire, à trois endroits (`description`,
 * `og:description`, `twitter:description`). Corriger un écran sans corriger ce
 * qu'il déclare de lui-même ne corrige rien pour le référencement.
 *
 * POURQUOI CE FRAGMENT-LÀ et pas la phrase entière. Le chapô complet fait 240
 * caractères ; un résultat de recherche en montre environ 160. La phrase
 * entière commence par « Nous ne faisons qu'un métier, l'industrie qui tourne,
 * et rien d'autre », soit 69 caractères avant le premier métier : les travaux
 * industriels, dernier nommé, n'auraient jamais été visibles. Ce fragment fait
 * 167 caractères et nomme les trois dès le premier mot.
 */
const DESCRIPTION_PAR_DEFAUT =
  "La maintenance de vos machines, le bureau d’études qui les conçoit et les " +
  "met en conformité, et les travaux industriels qui les déplacent, les " +
  "montent et les démarrent.";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin(CHEMIN);
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    titreRepli: TITRE_PAR_DEFAUT,
  });
  return { ...base, description: base.description ?? DESCRIPTION_PAR_DEFAUT };
}

export default function NousConnaitre() {
  return (
    // `mg-site` porte toutes les reprises mobiles de `app/globals.css` : marges,
    // échelle des titres, arrondis sous 760px. Sans elle, le téléphone reçoit le
    // gabarit desktop.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <Ouverture sommaire={SOMMAIRE} />
        <Reperes />
        {/* LA CADENCE MOBILE (photo + CTA après la 2e section, bandeau
            « Être rappelé » après la 5e et la 8e), comme la maquette mobile v2
            la pose sur cette page. Le héros et les repères n'en sont pas : la
            maquette ne compte que ses sections numérotées, et les chiffres n'y
            comptent pas (dc.html `x.k === "stats"`).
            `chemin` est l'adresse de la MAQUETTE : elle sert cette page à
            /a-propos/nous-connaitre/ (mobile-native-data.js), page native,
            donc variante « standard » (« Parlons de votre site »). Notre
            adresse, /nous-connaitre/, aurait pris la variante article.
            Pas de `photoHeros` : la tête de la maquette (`FIMG["a-propos"]`,
            team-grind-front) n'est pas dans `PEOPLE`, rien n'est écarté du
            tirage, qui donne x-tech-portrait comme la maquette ; notre photo
            de tête n'est pas tirée, elle ne revient donc pas.
            `rappelFinal={false}` : le mini-formulaire « Être rappelé » est
            posé plus bas par `FinDePageMobile`, après « Nos réalisations ». */}
        <AvecConversionMobile
          chemin="/a-propos/nous-connaitre/"
          gabarit="01"
          rappelFinal={false}
        >
          <MotDuDirigeant />
          <TerrainsExcellence />
          <OrigineDuNom />
          <TroisCases />
          <FriseCinqAns />
          <Fidelisation />
          <PerimetreOuiNon />
          <EquipeProche />
          <PortesValeursRse />
        </AvecConversionMobile>
        {/* La maquette rend ici son propre formulaire, identique champ pour
            champ à celui de l'accueil. Le composant déjà porté est réemployé,
            avec le titre et l'introduction de cet écran. Au téléphone, il se
            replie sous le rappel sombre de la maquette, qui porte l'ancre
            `#etre-rappele` des bandeaux (`FinDePageMobile`). */}
        <FinDePageMobile chemin={CHEMIN}>
          <FormulaireBasDePage
            formulaire="nous-connaitre-bas-de-page"
            titre={TITRE_FORMULAIRE}
            intro={INTRO_FORMULAIRE}
          />
        </FinDePageMobile>
      </main>
    </div>
  );
}
