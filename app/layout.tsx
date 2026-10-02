import type { Metadata } from "next";
import { Caveat, Poppins } from "next/font/google";

import Bandeau from "@/components/consentement/Bandeau";
import Entete from "@/components/site/Entete";
import PiedDePage from "@/components/site/PiedDePage";
import ConsentMode from "@/components/consentement/ConsentMode";
import LienReglages from "@/components/consentement/LienReglages";
import Tags from "@/components/consentement/Tags";
import { CaptureUtm } from "@/components/formulaire/CaptureUtm";
import { jsonLdTexte, organisation } from "@/lib/seo/jsonld";
import { siteUrl } from "@/lib/seo/url";

import "./globals.css";

/*
 * Les deux familles de la charte Migen.
 *
 * Poppins porte tout le texte, Caveat les accents manuscrits. Caveat est le
 * SUBSTITUT de Bryndan, police commerciale non fournie : à remplacer par les
 * vrais .woff2 dès réception (noté dans le système de design de la maquette).
 *
 * `next/font` auto-héberge les fichiers et pose un `font-display: swap` :
 * aucune requête vers fonts.googleapis.com au chargement, donc rien à
 * conditionner au consentement, et pas de texte invisible pendant le
 * téléchargement. La maquette les appelait par @import, ce qui aurait coûté
 * une connexion tierce et un blocage du rendu.
 *
 * Les graisses sont déclarées explicitement : sans liste, next/font tire la
 * variable complète et alourdit le premier rendu. Celles-ci sont exactement
 * celles que la maquette utilise.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/**
 * Métadonnées de repli de la mise en page racine.
 *
 * Elles ne servent qu'aux pages qui n'en produisent pas elles-mêmes : chaque
 * page du cocon pose les siennes depuis la table `seo` (voir
 * `lib/seo/metadonnees.ts`), et elles remplacent celles-ci.
 *
 * Volontairement pas de `title.template` : un gabarit ajouterait un suffixe aux
 * meta titles rédigés et mesurés dans le pipeline éditorial, ce qui les
 * allongerait au-delà de la longueur visée et changerait un texte validé par un
 * humain. Le nom du site est porté par `openGraph.siteName` là où il est utile.
 *
 * `metadataBase` est indispensable, et pas un confort : sans elle, Next laisse
 * le canonique, `og:url` et `og:image` en relatif, ce qui les rend inutiles pour
 * un robot comme pour un aperçu de partage. L'origine vient de `siteUrl()`,
 * source unique du projet, qui échoue franchement si la variable manque plutôt
 * que de deviner un domaine.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Migen, maintenance industrielle et techniciens sur site",
  description:
    "Migen déploie des techniciens électromécaniciens, automaticiens et roboticiens sur les sites industriels de ses clients. Siège à Écully et Lyon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      // Le site est francophone : la langue déclarée conditionne la
      // prononciation des lecteurs d'écran et la césure du texte. Critère RGAA.
      lang="fr"
      // PAS de `h-full` ici, et ce n'est pas un oubli : la classe vient du
      // gabarit de create-next-app, où elle sert à coller un pied de page en
      // bas d'une page courte. Elle fige `html` à la hauteur de la fenêtre,
      // ce qui contraint le bloc conteneur initial et fausse le calcul des
      // `animation-timeline: view()` des sections qui apparaissent au
      // défilement. La mise en page vient maintenant de la maquette, dont le
      // conteneur `.mg-site` porte son propre `min-height: 100vh`.
      className={`${poppins.variable} ${caveat.variable}`}
    >
      <body>
        {/*
          ConsentMode EN PREMIER, et ce n'est pas cosmétique : son script est en
          `beforeInteractive`, Next ne l'injecte dans le HTML initial que s'il
          est monté depuis cette mise en page, et l'état `denied` par défaut doit
          être posé avant que le moindre script Google démarre. Monté après Tags,
          le dispositif ne protègerait plus rien.
        */}
        <ConsentMode />
        {/* Attribution de la visite, mémorisée dès la page d'entrée. Pas un
            traceur : rien ne sort du navigateur avant l'envoi d'un formulaire. */}
        <CaptureUtm />
        {/* Les traceurs eux-mêmes, qui ne rendent rien tant que la finalité
            correspondante n'est pas accordée. */}
        <Tags />
        <Bandeau />

        {/* La barre de navigation flottante, portée de la maquette. Elle est en
            position fixe : elle vit hors du flux, d'où sa place avant le
            contenu plutôt que dans chaque page. */}
        <Entete />

        {children}

        {/* Un seul pied de page pour tout le site. Le lien CNIL de réglage du
            consentement lui est PASSÉ au lieu d'être réécrit dedans : une seule
            implémentation du bouton, et le pied de page reste un composant
            serveur alors que le lien est un composant client. */}
        <PiedDePage reglagesConsentement={<LienReglages />} />

        {/*
          Organisation posée une seule fois pour tout le site, ici et nulle part
          ailleurs : répétée page par page, elle décrirait plusieurs entités à
          Google. Le fil d'Ariane, les services et les articles restent au niveau
          des pages.

          `jsonLdTexte` et jamais `JSON.stringify` nu : React n'échappe rien dans
          `dangerouslySetInnerHTML`, et un chevron venu du contenu refermerait la
          balise script par anticipation.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdTexte(organisation()) }}
        />
      </body>
    </html>
  );
}
