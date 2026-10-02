import type { ReactNode } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import { LARGEUR } from "@/components/site/blocs/habillage";
import type { ContenuExpertises } from "@/types/expertises";

import Constructeurs from "./Constructeurs";
import Domaines from "./Domaines";
import Habilitations from "./Habilitations";
import Hero from "./Hero";
import RepartitionHeures from "./RepartitionHeures";
import Secteurs from "./Secteurs";
import TypesMaintenance from "./TypesMaintenance";

/**
 * Gabarit EXPERTISES, porté de la maquette Claude Design
 * (« Migen - Site final.dc.html », lignes 6211 à 6646).
 *
 * Composant SERVEUR, comme chacune de ses sections : aucun état, aucun
 * écouteur, la page part en HTML complet. Les animations viennent des attributs
 * posés dans les sections, pas d'un CSS écrit ici : `data-reveal` et `data-bar`
 * sont lus par `components/site/Moteurs.tsx`, monté une seule fois dans le
 * gabarit racine.
 *
 * TOUTE SECTION ABSENTE DU CONTENU NE REND RIEN. C'est ce qui permet au même
 * gabarit de servir le hub `/expertises/` et les pages de sa branche sans
 * jamais combler un trou avec une donnée qui n'existe pas.
 */

export interface ProprietesPageExpertises {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuExpertises;
  /** Identifiant d'analyse transmis à HubSpot par le formulaire de bas de page. */
  formulaire?: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageExpertises({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageExpertises) {
  const {
    surtitre,
    chapeau,
    actions,
    cumul,
    types,
    dosage,
    domaines,
    constructeurs,
    secteurs,
    habilitations,
  } = contenu;

  return (
    // `mg-site` porte les règles d'adaptation mobile de la charte, toutes
    // préfixées par cette classe dans `app/globals.css`.
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section style={{ ...LARGEUR, padding: "24px 40px 0" }}>
            {filAriane}
          </section>
        ) : null}

        <Hero
          titre={titre}
          surtitre={surtitre}
          chapeau={chapeau}
          actions={actions}
          cumul={cumul}
        />

        {types ? <TypesMaintenance types={types} /> : null}
        {dosage ? <RepartitionHeures dosage={dosage} /> : null}
        {domaines ? <Domaines domaines={domaines} /> : null}
        {constructeurs ? <Constructeurs constructeurs={constructeurs} /> : null}
        {secteurs ? <Secteurs secteurs={secteurs} /> : null}
        {habilitations ? <Habilitations habilitations={habilitations} /> : null}

        {/* Le formulaire porte l'ancre `#formulaire`, visée par le bouton
            principal du héros. Son habillage vient du contenu quand la page en
            fournit un, sinon de la copie d'accueil. */}
        <FormulaireBasDePage
          formulaire={formulaire}
          titre={contenu.formulaire?.titre}
          intro={contenu.formulaire?.intro}
        />

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "0 40px 80px" }}>
            {maillage}
          </section>
        ) : null}
      </main>
    </div>
  );
}
