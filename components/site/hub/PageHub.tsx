import type { ReactNode } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import { LARGEUR } from "@/components/site/blocs/habillage";
import type { ContenuHub } from "@/types/hub";

import Cloture from "./Cloture";
import Corps from "./Corps";
import Ouverture from "./Ouverture";

/**
 * Gabarit 10, le HUB DE RUBRIQUE.
 *
 * Maquette : `maquette/gabarit-10-hub-de-rubrique.html`, douze sections, dans
 * l'ordre où ce fichier les écrit.
 *
 * POURQUOI CE GABARIT EXISTE. `/offres/`, `/secteurs/`, `/travaux-industriels/`
 * et `/bureau-etudes/` étaient servies par le gabarit de VENTE, dont les dix
 * sections ne portent ni carte « En bref » dans le héros, ni bandeau de clients,
 * ni maillage de rubrique en cartes, ni tableau à trois colonnes, et dont les
 * surtitres ne sont pas ceux-ci (« Le problème » au lieu de « Votre
 * problématique », « Nos engagements » au lieu de « Notre parti pris »). Le
 * portage précédent avait bien écrit un gabarit pour `/offres/`, mais depuis
 * « Site final », qui n'en dessine que quatre sections : c'est ce que le client
 * a vu quand il a dit que les pages offres ne ressemblaient toujours pas.
 *
 * Composant SERVEUR, comme chacune de ses sections : aucun état, aucun
 * écouteur, la page part en HTML complet.
 *
 * TOUTE SECTION SANS DONNÉE NE REND RIEN, titre compris. C'est la règle qui
 * permet de ne jamais combler un trou de la maquette avec une donnée inventée.
 */

export interface ProprietesPageHub {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuHub;
  /** Identifiant d'analyse transmis à HubSpot par le formulaire de bas de page. */
  formulaire?: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la route.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base, donc plus
   * contrôlable par `verification-hub.tsx`.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageHub({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageHub) {
  return (
    // `mg-site` porte les règles d'adaptation mobile de la charte, toutes
    // préfixées par cette classe dans `app/globals.css`.
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <Ouverture titre={titre} contenu={contenu} filAriane={filAriane} />
        <Corps contenu={contenu} />
        <Cloture contenu={contenu} />

        {/* Le formulaire porte l'ancre `#formulaire`, visée par le bouton du
            héros, celui de l'appel de milieu de page et celui du panneau
            final. */}
        <FormulaireBasDePage formulaire={formulaire} />

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "0 40px 80px" }}>
            {maillage}
          </section>
        ) : null}
      </main>
    </div>
  );
}
