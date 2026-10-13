import type { Metadata } from "next";

import Agences from "@/components/site/contact/Agences";
import ApresDemande from "@/components/site/contact/ApresDemande";
import Ouverture from "@/components/site/contact/Ouverture";
import PourLesTechniciens from "@/components/site/contact/PourLesTechniciens";
import {
  DESCRIPTION_SEO,
  TITRE_SEO,
} from "@/components/site/contact/metadonnees";
import { pageParChemin } from "@/lib/contenu";
import { metadonneesSeo } from "@/lib/seo/metadonnees";

/**
 * Page contact, écran « Contact / devis » de la maquette.
 *
 * SA RÉFÉRENCE EST LA MAQUETTE VIVANTE, `maquette/site-final-autonome.html`,
 * repérée par son `data-screen-label="Contact / devis"`. `/contact/` n'a pas
 * de capture dans `maquette/rendu/` (les 248 captures couvrent le corpus, et
 * cet écran a un haut de page sur mesure) : c'est l'application elle-même qui
 * fait foi, comme le dit `docs/PASSATION.md` §1.
 *
 * ON A LONGTEMPS LU LE MAUVAIS FICHIER. Jusqu'au 12/10, la porte relisait
 * `maquette/accueil-rendu.html` (lignes 2950 à 3024), un export du 02/10. Les
 * deux fichiers ne disent pas la même chose : l'export écrit « Les cinq
 * offres », la maquette vivante du 07/10 écrit « Les six offres ». La porte
 * validait donc une étiquette périmée, pendant que `/offres/` publiait six
 * offres. Elle lit maintenant la maquette vivante.
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
 * CE QUI S'ÉCARTE DE LA MAQUETTE, et pourquoi. Deux corrections, toutes deux
 * imposées par les interdits de copie du contrat, qui gagnent contre la
 * maquette quand ils se contredisent :
 *
 *   · « 5 / agences en France » devient « 4 / agences », et
 *     « Cinq agences en France, deux à l'international » devient « Quatre
 *     agences, dix hubs de techniciens ». Le compte tenu est quatre agences,
 *     Lyon (siège à Écully), Montréal, Dubaï, Madrid.
 *   · les repères « 48 h » et « 3 sem. » des trois étapes tombent : seul le
 *     rappel dans l'heure est un délai chiffré autorisé. Voir
 *     `components/site/contact/ApresDemande.tsx`.
 *
 * Les tirets cadratins de la maquette (« Siège — Limonest ») sont remplacés par
 * une virgule. Les trois cibles internes posées (`/offres/`, `/carriere/`,
 * `/implantations/`) ont été vérifiées à 200 : poser un lien mort sur une page
 * citée par les 225 autres est exactement le défaut qu'on répare ici.
 *
 * L'ORDRE ET LE RYTHME DES SECTIONS, mesurés le 12/10 contre la production.
 *
 * La maquette tient TROIS sections : ouverture (`#form-page`), « Après votre
 * demande » (les trois cartes, et la carte candidature au milieu), « Nos
 * agences ». Le site en tient QUATRE, parce que la carte candidature a sa
 * section depuis l'arbitrage de Mehdi du 12/10.
 *
 * Son rythme vertical se lit sur ses paddings : `70px 40px 0` pour l'ouverture,
 * `var(--sec) 0 0` pour les sections intermédiaires, `var(--sec) 0 var(--sec)`
 * pour celle qui FERME la page. La quatrième section avait été ajoutée sans
 * déplacer cette fermeture : `Agences` la portait encore, `PourLesTechniciens`
 * non. Mesuré en production, écarts entre contenus : 120 / 120 / **240** / **0**
 * px à 1280 px, 64 / 64 / **128** / **0** px à 390 px. Un trou double avant la
 * bande technicien, et cette bande collée au pied de page. La fermeture est
 * passée à la section qui ferme vraiment.
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
        {/* La bande technicien FERME la page, elle ne coupe plus le parcours
            client. Arbitrage de Mehdi du 12/10, voir PourLesTechniciens.tsx. */}
        <PourLesTechniciens />
      </main>
    </div>
  );
}
