import type { Metadata } from "next";

import PolitiqueConfidentialite, {
  DESCRIPTION_SEO,
  TITRE_SEO,
} from "@/components/site/confidentialite/PolitiqueConfidentialite";
import { urlAbsolue } from "@/lib/seo/url";

/**
 * /confidentialite/ , route STATIQUE.
 *
 * Elle ne passe pas par `app/[...slug]` et ne lit pas la table `pages` : son
 * contenu n'est pas du gabarit répété de page en page, c'est une mise en page
 * unique. Next sert une route statique avant l'attrape-tout, cette page passe
 * donc devant lui.
 *
 * Elle est la cible de la mention RGPD du formulaire, donc de chaque page du
 * site, et du pied de page. Elle répondait 404.
 */

const CHEMIN = "/confidentialite/";

/*
 * Métadonnées écrites ici et non tirées de `metadonneesSeo` : cette page n'a pas
 * de ligne `seo` en base, et ne doit pas en avoir. Le canonique passe tout de
 * même par `urlAbsolue`, source unique des URL du projet, pour garder le slash
 * final de la forme servie.
 */
export const metadata: Metadata = {
  title: TITRE_SEO,
  description: DESCRIPTION_SEO,
  alternates: { canonical: urlAbsolue(CHEMIN) },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: TITRE_SEO,
    description: DESCRIPTION_SEO,
    url: urlAbsolue(CHEMIN),
  },
  // Indexable : une politique de confidentialité introuvable est un signal de
  // défiance, et elle est citée par chaque formulaire du site.
  robots: { index: true, follow: true },
};

export default function Confidentialite() {
  // `mg-site` porte les règles mobiles de `app/globals.css` : sans elle, les
  // marges, l'échelle des titres et le décollement du sommaire collant restent
  // au gabarit desktop.
  return (
    <div className="mg-site">
      <PolitiqueConfidentialite />
    </div>
  );
}
