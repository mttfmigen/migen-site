import type { Metadata } from "next";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import CasRetrofit from "@/components/site/rse/CasRetrofit";
import OuvertureRse from "@/components/site/rse/OuvertureRse";
import PiecesFournisseur from "@/components/site/rse/PiecesFournisseur";
import PiliersRse from "@/components/site/rse/PiliersRse";

/**
 * Page des engagements RSE, portée de `maquette/accueil-rendu.html`, lignes
 * 5672 à 5843 (écran « Engagements RSE »).
 *
 * POURQUOI UNE ROUTE STATIQUE, et pas une ligne de contenu servie par
 * `app/[...slug]` comme les 225 autres pages : celles-là partagent un gabarit
 * de vente en dix sections dont le contenu se répète d'une page à l'autre.
 * Cet écran-ci est unique, il a sa mise en page, ses sections et ses images, et
 * aucune autre page ne les réemploie. Il se traite donc comme la page
 * d'accueil. Next sert une route statique AVANT la route attrape-tout, cette
 * page passe donc devant `app/[...slug]`.
 *
 * Le pied de page et la navigation la citent depuis les 225 pages du site :
 * jusqu'ici elle répondait 404.
 *
 * Toutes les cibles internes posées ici ont été vérifiées à 200 : /valeurs/, et
 * l'ancre du formulaire de cette page, visée par les deux appels à l'action.
 */

/*
 * Le meta title N'EST PAS le H1, et ce n'est pas un détail de forme : le titre
 * se lit dans une page de résultats, hors contexte, où il doit nommer
 * l'entreprise et le sujet ; le H1 se lit sur la page, où le contexte est déjà
 * posé et où une phrase peut porter la promesse.
 *
 * Pas de ligne `seo` en base pour cette page : elle n'est pas dans le corpus
 * éditorial. Les métadonnées sont donc statiques, et le canonique relatif est
 * résolu par le `metadataBase` de la mise en page racine.
 */
export const metadata: Metadata = {
  title: "Engagements RSE de Migen, sécurité, emploi et retrofit",
  description:
    "Sécurité des équipes, formation et emploi local, prolongation des machines par le retrofit, achats de proximité : les engagements RSE de Migen et les pièces transmises pour votre dossier fournisseur.",
  alternates: { canonical: "/rse/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Migen",
    title: "Engagements RSE de Migen, sécurité, emploi et retrofit",
    description:
      "Sécurité des équipes, formation et emploi local, prolongation des machines par le retrofit, achats de proximité.",
    url: "/rse/",
  },
  robots: { index: true, follow: true },
};

export default function Rse() {
  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle des titres et les arrondis sous 760px
    // sont toutes préfixées par cette classe.
    <div className="mg-site">
      <main style={{ paddingTop: "96px" }}>
        <OuvertureRse />
        <PiliersRse />
        <CasRetrofit />
        <PiecesFournisseur />
        {/* Le formulaire de la maquette est celui du reste du site, aux titres
            près : on réemploie le bloc, qui porte déjà la validation, le champ
            piège, la mention RGPD et l'indicatif téléphonique. Son id
            `formulaire` est la cible des deux appels à l'action ci-dessus. */}
        <FormulaireBasDePage
          formulaire="rse"
          titre="Un appel d’offres avec des critères RSE ? Nous transmettons nos attestations."
          intro="MASE, EcoVadis, bilan carbone, politique sécurité : dites-nous ce qu’il vous faut."
        />
      </main>
    </div>
  );
}
