import type { Metadata } from "next";

import Agences from "@/components/site/contact/Agences";
import ApresDemande from "@/components/site/contact/ApresDemande";
import Ouverture from "@/components/site/contact/Ouverture";
import {
  DESCRIPTION_SEO,
  TITRE_SEO,
} from "@/components/site/contact/metadonnees";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Page contact, écran « Contact / devis » de la maquette
 * (`maquette/accueil-rendu.html`, lignes 2950 à 3024).
 *
 * POURQUOI UNE ROUTE STATIQUE ET NON LA BASE, comme les ~200 pages à gabarit :
 * cet écran est unique. Il a sa mise en page, ses sections et son formulaire, et
 * aucune autre page ne les réemploie. Il vit donc dans `app/` avec ses
 * composants, comme la page d'accueil. Next sert cette route avant
 * `app/[...slug]/page.tsx`.
 *
 * C'est la cible du bouton de la barre d'action mobile et de l'appel à l'action
 * de l'en-tête, donc la page de conversion la plus atteinte après l'accueil.
 *
 * CE QUI S'ÉCARTE DE LA MAQUETTE, et pourquoi. Trois corrections, toutes
 * imposées par les interdits de copie du contrat, qui gagnent contre la
 * maquette quand ils se contredisent :
 *
 *   · « 5 / agences en France » devient « 4 / agences », et
 *     « Cinq agences en France, deux à l'international » devient « Quatre
 *     agences, dix hubs de techniciens ». Le compte tenu est quatre agences,
 *     Lyon (siège à Limonest), Montréal, Dubaï, Madrid.
 *   · « +200 / clients industriels » devient « +120 ». Le compte tenu est
 *     « plus de 120 clients, dont plus de 80 réguliers ».
 *   · les repères « 48 h » et « 3 sem. » des trois étapes tombent : seul le
 *     rappel dans l'heure est un délai chiffré autorisé. Voir
 *     `components/site/contact/ApresDemande.tsx`.
 *
 * Les tirets cadratins de la maquette (« Siège — Limonest ») sont remplacés par
 * une virgule. Les trois cibles internes posées (`/offres/`, `/carriere/`,
 * `/implantations/`) ont été vérifiées à 200 : poser un lien mort sur une page
 * citée par les 225 autres est exactement le défaut qu'on répare ici.
 */

export const revalidate = 3600;

const CHEMIN = "/contact/";

export async function generateMetadata(): Promise<Metadata> {
  // La ligne `seo` pilote le titre comme sur toute autre page quand elle
  // existe. Cette route étant statique, `app/[...slug]` ne la servirait pas :
  // la ligne est le seul moyen de piloter son titre depuis la base.
  const complete = await pageParChemin(CHEMIN);
  const base = metadonneesSeo({
    seo: complete?.seo ?? null,
    chemin: CHEMIN,
    titreRepli: TITRE_SEO,
  });
  return {
    ...base,
    description: base.description ?? DESCRIPTION_SEO,
  };
}

export default function Contact() {
  return (
    // `mg-site` porte les rattrapages mobiles de `app/globals.css` : marges,
    // échelle des titres, arrondis sous 760px. Sans elle, le téléphone reste au
    // gabarit bureau.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <Ouverture />
        <ApresDemande />
        <Agences />
      </main>
    </div>
  );
}
