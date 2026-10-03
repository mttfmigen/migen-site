import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AppelConstructeur from "@/components/site/marques/AppelConstructeur";
import Familles from "@/components/site/marques/Familles";
import Ouverture from "@/components/site/marques/Ouverture";
import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Écran « Marques maintenues », maquette lignes 2877 à 2924.
 *
 * POURQUOI UNE ROUTE STATIQUE ET NON UNE LIGNE EN BASE, comme les ~200 pages à
 * gabarit : cet écran est unique. Sa carte en verre à sept rangées, sa grille de
 * tuiles en `auto-fill` et ses soixante-sept logos ne sont réemployés par aucune
 * autre page. Il se traite donc comme `app/page.tsx`. Next sert cette route
 * avant `app/[...slug]/page.tsx`, qui n'a rien à ce chemin.
 *
 * ELLE N'EST NI EN BASE NI DANS `docs/urls-site-actuel.json` : vérifié. Son
 * unique appelant est `components/site/accueil/LogosTechnologies.tsx`, dont le
 * lien « Voir toutes les marques » répondait 404. Le fil d'Ariane de la maquette
 * la place pourtant sous Expertises, ce qui laisse ouverte la question du chemin
 * voulu : `/marques/` ou `/expertises/marques/`. À trancher.
 *
 * SON SEO EST ÉCRIT ICI, et c'est le seul endroit possible aujourd'hui : sans
 * ligne `pages` ni ligne `seo` en base, il n'y a rien à lire. `metadonneesSeo`
 * est tout de même appelée, pour que le canonique, l'Open Graph et les
 * directives robots soient formés exactement comme sur les autres pages. Le
 * jour où la ligne existe, cette page reprendra le `generateMetadata` de
 * `app/page.tsx`, qui lit la base avec repli.
 */

export const revalidate = 3600;

const CHEMIN = "/marques/";

/* Le titre ne reprend PAS le H1 (« Les équipements que nous maintenons déjà ») :
   le titre se lit dans la page de résultats, le H1 sur la page. */
const TITRE = "Marques et constructeurs maintenus | Migen";

/* Le chapeau de la maquette, mot pour mot (ligne 2883). Rien n'est rédigé ici. */
const DESCRIPTION =
  "Nos constructeurs, classés par famille d’équipement. Vos machines sont dans la liste ? Nous avons déjà le technicien qui les connaît.";

const SEO = metadonneesSeo({ seo: null, chemin: CHEMIN, titreRepli: TITRE });

export const metadata: Metadata = {
  ...SEO,
  description: DESCRIPTION,
  openGraph: { ...SEO.openGraph, description: DESCRIPTION },
};

export default function PageMarques() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css` : marges à
    // 20px, échelle du h1, arrondis. Sans elle, le téléphone reste au gabarit
    // large.
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <Ouverture hrefAction={ANCRE_FORMULAIRE} />
        <Familles />
        <AppelConstructeur hrefAction={ANCRE_FORMULAIRE} />
        {/* La maquette n'a pas de formulaire sur cet écran : ses deux boutons
            partaient vers l'écran contact, que `/contact/` ne sert pas encore.
            Le bloc déjà porté est monté ici, c'est lui qui porte l'id
            `formulaire` visé par `ANCRE_FORMULAIRE`. */}
        <FormulaireBasDePage formulaire="marques-bas-de-page" />
      </main>
    </div>
  );
}
