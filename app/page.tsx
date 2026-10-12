import type { Metadata } from "next";

import ParcoursMobile from "@/components/site/accueil/ParcoursMobile";
import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import BandeauVerbe from "@/components/site/accueil/BandeauVerbe";
import BentoBesoins from "@/components/site/accueil/BentoBesoins";
import CertificationsRse from "@/components/site/accueil/CertificationsRse";
import ChiffresCroissance from "@/components/site/accueil/ChiffresCroissance";
import DernieresRealisations from "@/components/site/accueil/DernieresRealisations";
import FocusResidence from "@/components/site/accueil/FocusResidence";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import FriseHistoire from "@/components/site/accueil/FriseHistoire";
import GrilleOffres from "@/components/site/accueil/GrilleOffres";
import Hero from "@/components/site/accueil/Hero";
import HubsAccueil from "@/components/site/accueil/HubsAccueil";
import LogosTechnologies from "@/components/site/accueil/LogosTechnologies";
import MarqueeClients from "@/components/site/accueil/MarqueeClients";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import PourquoiExternaliser from "@/components/site/accueil/PourquoiExternaliser";
import ProblematiqueClient from "@/components/site/accueil/ProblematiqueClient";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";
import SecteursAccueil from "@/components/site/accueil/SecteursAccueil";
import TemoignagesClients from "@/components/site/accueil/TemoignagesClients";
import { VUE_AVANT, VUE_AVEC } from "@/components/site/accueil/avant-apres-donnees";
import { BESOINS } from "@/components/site/accueil/bento-besoins-donnees";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

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

export default function Accueil() {
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle des titres et les arrondis sous 760px
    // sont toutes préfixées par cette classe. Sans elle, le mobile reste au
    // gabarit desktop.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <Hero />
        {/* LE PARCOURS PAR LE PROBLÈME, juste sous le héros et SUR TÉLÉPHONE
            SEULEMENT. C'est l'ordre de la maquette mobile du colis de
            passation : le visiteur dit ce qui bloque avant qu'on lui nomme une
            offre. Sur bureau le composant ne s'affiche pas, la grille d'offres
            reste l'entrée en matière. */}
        <ParcoursMobile />
        <GrilleOffres />
        <MarqueeClients />
        <CertificationsRse />
        <ProblematiqueClient />
        <ProcessSelection />
        <BandeauVerbe />
        <FocusResidence />
        <LogosTechnologies />
        <ChiffresCroissance />
        <DernieresRealisations />
        <TemoignagesClients />
        <FriseHistoire />
        <PourquoiExternaliser />
        <BentoBesoins besoins={BESOINS} />
        <AvantApresBascule avant={VUE_AVANT} avec={VUE_AVEC} />
        <MethodeQuatreEtapes etapes={ETAPES_METHODE} />
        <SecteursAccueil />
        <HubsAccueil />
        <FormulaireBasDePage />
      </main>
    </div>
  );
}
