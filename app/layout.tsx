import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Bandeau from "@/components/consentement/Bandeau";
import ConsentMode from "@/components/consentement/ConsentMode";
import LienReglages from "@/components/consentement/LienReglages";
import Tags from "@/components/consentement/Tags";
import { CaptureUtm } from "@/components/formulaire/CaptureUtm";
import { jsonLdTexte, organisation } from "@/lib/seo/jsonld";
import { siteUrl } from "@/lib/seo/url";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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

        {children}

        <footer className="mt-auto border-t border-zinc-200 px-6 py-8 dark:border-zinc-800">
          {/* Exigence CNIL : revenir sur son choix doit rester accessible depuis
              n'importe quelle page, donc depuis le pied de page commun. */}
          <LienReglages />
        </footer>

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
