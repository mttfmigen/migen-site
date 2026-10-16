import type { Metadata } from "next";

import AncreBesoinMobile from "@/components/site/accueil/AncreBesoinMobile";
import ParcoursMobile from "@/components/site/accueil/ParcoursMobile";
import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import BandeauVerbe from "@/components/site/accueil/BandeauVerbe";
import BentoBesoins from "@/components/site/accueil/BentoBesoins";
import BesoinsMobile from "@/components/site/accueil/BesoinsMobile";
import CertificationsRse from "@/components/site/accueil/CertificationsRse";
import ChiffresCroissance from "@/components/site/accueil/ChiffresCroissance";
import DernieresRealisations from "@/components/site/accueil/DernieresRealisations";
import FocusResidence from "@/components/site/accueil/FocusResidence";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import FriseHistoire from "@/components/site/accueil/FriseHistoire";
import GrilleOffres from "@/components/site/accueil/GrilleOffres";
import Hero from "@/components/site/accueil/Hero";
import HubsAccueil from "@/components/site/accueil/HubsAccueil";
import HubsMobileAccueil from "@/components/site/accueil/HubsMobileAccueil";
import IntroAccueilMobile from "@/components/site/accueil/IntroAccueilMobile";
import LogosTechnologies from "@/components/site/accueil/LogosTechnologies";
import MarqueeClients from "@/components/site/accueil/MarqueeClients";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import OuvertAuDepart from "@/components/site/accueil/OuvertAuDepart";
import PourquoiExternaliser from "@/components/site/accueil/PourquoiExternaliser";
import ProblematiqueClient from "@/components/site/accueil/ProblematiqueClient";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";
import SecteursAccueil from "@/components/site/accueil/SecteursAccueil";
import SixFaconsMobile from "@/components/site/accueil/SixFaconsMobile";
import TemoignagesClients from "@/components/site/accueil/TemoignagesClients";
import ToutLeSite from "@/components/site/accueil/ToutLeSite";
import mobile from "@/components/site/accueil/AccueilMobile.module.css";
import { VUE_AVANT, VUE_AVEC } from "@/components/site/accueil/avant-apres-donnees";
import { BESOINS } from "@/components/site/accueil/bento-besoins-donnees";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";
import replis from "@/components/site/accueil/replis-accueil.module.css";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import { ID_RAPPEL_FINAL } from "@/components/site/mobile/conversion-donnees";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";
import { estImplantations, type NosVilles } from "@/types/implantations";

/**
 * Page d'accueil.
 *
 * L'ORDRE DES SECTIONS EST CELUI DE LA MAQUETTE, lignes 480 à 1200 de
 * « Migen - Site final.dc.html ». Il n'est pas esthétique, il est commercial :
 * la promesse, puis les offres, puis la preuve sociale, puis la méthode, puis
 * l'action. Ne pas réordonner sans en passer par la maquette.
 *
 * POURQUOI L'ACCUEIL N'EST PAS SERVIE PAR `app/[...slug]` comme les 225 autres
 * pages : son contenu n'est pas du gabarit de vente en dix sections, c'est une
 * composition propre. Elle lit tout de même sa ligne `pages` pour son SEO,
 * quand elle existe, afin que le meta title et la description restent pilotés
 * par la base comme partout ailleurs.
 *
 * Les sections portent leur contenu éditorial en valeur par défaut, reprise mot
 * pour mot de la maquette. Ce n'est pas un contournement de la règle « le
 * contenu vit dans Supabase » : c'est de l'habillage de page d'accueil, pas du
 * corpus éditorial indexé. Le jour où une section devient pilotable, elle prend
 * ses données en props, la signature est déjà là.
 */

export const revalidate = 3600;

const TITRE_PAR_DEFAUT =
  "Migen, maintenance industrielle et techniciens sur site";

/**
 * La description de repli de l'ACCUEIL.
 *
 * MESURE DU 12/10 : la page d'accueil était servie SANS meta description, en
 * local comme en ligne. Pas « avec une description faible » : sans aucune.
 * Google écrivait donc lui-même l'extrait de la page la plus visitée du site.
 * Cause : l'accueil n'a pas de ligne `pages`, `metadonneesSeo` renvoie alors
 * `description: undefined`, et une clé présente à `undefined` ANNULE celle de
 * la mise en page racine au lieu de la laisser passer.
 *
 * LE TEXTE N'EST PAS RÉDIGÉ POUR L'OCCASION : c'est la seconde phrase du chapô
 * du héros, mot pour mot (`components/site/accueil/Hero.tsx`). Le chapô entier
 * fait 224 caractères, au-delà de ce qu'un résultat de recherche affiche ; la
 * phrase retenue est complète, se tient seule, et dit ce que fait Migen. Rien
 * n'a été reformulé : la copie appartient à Mehdi.
 */
const DESCRIPTION_PAR_DEFAUT =
  "Nous mobilisons des techniciens dont 10 % seulement réussissent notre process, sur vos sites, en continu ou en intervention ciblée.";

export async function generateMetadata(): Promise<Metadata> {
  const complete = await pageParChemin("/");
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: "/",
    titreRepli: complete?.page.titre_h1 ?? TITRE_PAR_DEFAUT,
  });
  // `og:description` suit toute seule : Next reprend la description de la page
  // quand `openGraph.description` est absente. Mesuré sur le HTML servi, pas
  // supposé, et `scripts/verifie-seo.mjs` refuse une page qui la perdrait.
  return { ...base, description: base.description ?? DESCRIPTION_PAR_DEFAUT };
}

/**
 * Les hubs et les régions de `/implantations/`, que l'accueil mobile montre
 * aussi (`HubsMobileAccueil`). Une base injoignable ne casse pas l'accueil :
 * la section ne s'affiche pas, rien n'est inventé à sa place, et l'erreur est
 * journalisée côté serveur.
 */
async function villesDesImplantations(): Promise<NosVilles | null> {
  try {
    const complete = await pageParChemin("/implantations/");
    const contenu = complete?.page.contenu;
    return estImplantations(contenu) ? (contenu.villes ?? null) : null;
  } catch (erreur) {
    console.error("Accueil : lecture des hubs de /implantations/ impossible.", erreur);
    return null;
  }
}

export default async function Accueil() {
  const villes = await villesDesImplantations();
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle des titres et les arrondis sous 760px
    // sont toutes préfixées par cette classe. Sans elle, le mobile reste au
    // gabarit desktop.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        {/* L'ACCUEIL MOBILE DE LA MAQUETTE V3 « SITE MOBILE », validé par
            Mehdi le 16/10, SOUS 881 PX SEULEMENT. Au-dessus, l'ordre et le
            rendu sont ceux de la capture de bureau, au pixel.

            UN SEUL MÉCANISME, DEUX ATTRIBUTS DE `app/globals.css` :
            `data-mobile-seulement` (n'existe que sous 881 px) et
            `data-doublon-mobile` (s'efface sous 881 px). Là où le téléphone
            veut un bloc AILLEURS que le bureau, il est rendu aux deux places
            et une seule se voit ; jamais de réordonnancement en CSS, qui
            ferait lire et tabuler la page dans un autre ordre que celui
            qu'on voit, et fausserait la numérotation des cartes (compteur
            CSS, ordre du document).

            Le haut, au téléphone : héros court, « Qu'est-ce qui vous
            bloque ? » en cartes-liens, « Ils nous font confiance », le
            paragraphe et les chiffres clés, puis « Six façons » en bloc
            sombre toujours visible. Au bureau : héros, grille d'offres,
            logos. */}
        <Hero />
        <ParcoursMobile />
        <GrilleOffres />
        <MarqueeClients compactMobile />
        <IntroAccueilMobile />
        <SixFaconsMobile />
        {/* LES CARTES REPLIÉES ET NUMÉROTÉES, 01 à 15, avec la cadence de
            conversion de la maquette mobile (`AvecConversionMobile`) : photo
            + CTA après le 2e enfant, bandeau « Une question sur votre site ? »
            après le 5e, le 8e et le 11e.

            LA CADENCE COMPTE LES ENFANTS, PAS LES CARTES. Les enfants sont
            donc les treize cartes de la V3 ; ce que seul le site porte (les
            cartes « Notre sélection » et « Technologies & partenaires »,
            « Nos réalisations », la FAQ « Partez de votre besoin », les
            copies de bureau) est rangé dans le même fragment que sa voisine.
            Les bandeaux tombent ainsi où la V3 les met : après Le jour et la
            nuit, après la croissance, après l'histoire, et aucun après la
            dernière carte.

            L'ORDRE DU TÉLÉPHONE EST CELUI DE LA V3 : 01 Certifications
            (ouverte au départ), 02 Votre problématique, [photo + CTA],
            03 Notre sélection, 04 « On installe, on maintient, on répare, on
            dépanne », 05 Résidence, 06 Technologies & partenaires, « Nos
            réalisations », « Partez de votre besoin », 07 Le jour et la nuit,
            [bandeau], 08 « Ce que les mêmes équipes en disent aujourd'hui »,
            09 Méthode, 10 Croissance, [bandeau], 11 Dernières réalisations,
            12 Avis, 13 Histoire, [bandeau], 14 Pourquoi externaliser,
            15 Secteurs. « Notre sélection » et « Technologies & partenaires »,
            que seul le site a, restent repliées à leur place de bureau : la
            première suit la problématique qu'elle résout, la seconde l'offre
            Résidence dont elle détaille les spécialités.

            Le jour et la nuit et la méthode viennent avant la croissance au
            téléphone, après « Pourquoi externaliser » au bureau : elles sont
            rendues aux deux places (`data-mobile-seulement` /
            `data-doublon-mobile`), sans toucher à leurs composants. Au
            téléphone, la bascule « Avant / Avec migen© » devient les deux
            cartes de la V3, une vue chacune (`.vueSeule`). La FAQ et les hubs
            ont leur version téléphone (`BesoinsMobile`, `HubsMobileAccueil`) ;
            le pavage et le rail du bureau s'effacent à cette largeur.

            `photoHeros` : l'accueil n'a pas de photo de héros, et la maquette
            retombe sur `assets/web/team-duo.jpg` pour « / » (dc.html L421) ;
            l'écarter du tirage redonne exactement la photo de m-00.
            `rappelFinal={false}` : l'accueil finit DÉJÀ sur son formulaire
            complet, qui porte l'ancre `#etre-rappele` que visent les
            bandeaux.
            `numerotees` : le numéro 01, 02… des rangées repliées, en compteur
            CSS (rien dans le texte du document), voir replis-accueil. Un bloc
            masqué (`display: none`) ne compte pas : les copies de l'autre
            largeur ne décalent aucun numéro.
            CE QUE LA PORTE « AUCUN MOT PERDU » SIGNALE ICI, ET CE QUE C'EST.
            Elle lit le `textContent` du `<main>` d'un bloc : deux sections
            voisines y collent leurs mots (« accès Z.A.C.Notre sélection »).
            Chaque insertion casse un de ces collages, et la porte compte le
            faux mot « Z.A.C.Notre » comme perdu : un par insertion. */}
        <div className={replis.numerotees}>
          <AvecConversionMobile
            chemin="/"
            gabarit="home"
            photoHeros="/assets/web/team-duo.jpg"
            rappelFinal={false}
          >
            <OuvertAuDepart>
              <CertificationsRse />
            </OuvertAuDepart>
            <ProblematiqueClient />
            <>
              <ProcessSelection />
              <BandeauVerbe />
            </>
            <>
              <FocusResidence />
              <LogosTechnologies />
              <div className={mobile.realisations}>
                <CarrouselRealisations cartes={realisationsLiees("/")} titre="Nos réalisations" />
              </div>
              <BesoinsMobile besoins={BESOINS} />
            </>
            <div data-mobile-seulement="" className={mobile.vueSeule}>
              <AvantApresBascule avant={VUE_AVANT} />
            </div>
            <div data-mobile-seulement="" className={`${mobile.vueSeule} ${mobile.sansSurtitre}`}>
              <AvantApresBascule avant={VUE_AVEC} />
            </div>
            <div data-mobile-seulement="">
              <MethodeQuatreEtapes etapes={ETAPES_METHODE} />
            </div>
            <ChiffresCroissance />
            <DernieresRealisations />
            <TemoignagesClients />
            <FriseHistoire />
            <>
              <PourquoiExternaliser />
              <BentoBesoins besoins={BESOINS} />
              <div data-doublon-mobile="">
                <AvantApresBascule avant={VUE_AVANT} avec={VUE_AVEC} />
                <MethodeQuatreEtapes etapes={ETAPES_METHODE} />
              </div>
            </>
            <SecteursAccueil />
          </AvecConversionMobile>
        </div>
        <HubsAccueil />
        {villes ? <HubsMobileAccueil villes={villes} /> : null}
        <ToutLeSite />
        <div id={ID_RAPPEL_FINAL} className={replis.ancreRappel}>
          <FormulaireBasDePage />
        </div>
        {/* « Décrire ma ligne » et « Décrire mon besoin » visent le panneau
            `#besoin` du héros, effacé au téléphone : ils mènent alors ici. */}
        <AncreBesoinMobile cible="besoin" vers={ID_RAPPEL_FINAL} />
      </main>
    </div>
  );
}
