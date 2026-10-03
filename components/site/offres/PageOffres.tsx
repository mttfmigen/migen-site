import type { ReactNode } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import Bloc from "@/components/site/blocs/Bloc";
import { LARGEUR } from "@/components/site/blocs/habillage";
import type { ContenuOffres } from "@/types/offres";

import Besoins from "./Besoins";
import Fin from "./Fin";
import Hero from "./Hero";
import Offres from "./Offres";

/**
 * Gabarit du hub `/offres/`, porté de `maquette/accueil-rendu.html`, bloc
 * `isOffres`, lignes 1886 à 2064.
 *
 * Composant SERVEUR, comme chacune de ses sections : aucun état, aucun
 * écouteur, la page part en HTML complet. Les révélations au défilement
 * viennent des attributs `data-reveal` posés dans les sections, lus par
 * `components/site/Moteurs.tsx`, monté une seule fois dans le gabarit racine.
 *
 * TOUTE SECTION ABSENTE DU CONTENU NE REND RIEN, et une section dont la liste
 * est vide non plus. C'est la règle qui permet de ne jamais combler un trou de
 * la maquette avec une donnée qui n'existe pas.
 *
 * L'ORDRE DE LA PAGE, et pourquoi le complément est au milieu :
 *
 *   1. le bandeau d'ouverture, avec ses repères ;
 *   2. l'entrée par besoin ;
 *   3. les offres en cartes ;
 *   4. LE COMPLÉMENT : le déroulé, les engagements, l'appel à l'action de
 *      milieu de page, les réalisations et les questions fréquentes, que le
 *      corpus écrit et que la maquette du hub ne dessine pas. Ils sont rendus
 *      par les blocs de `components/site/blocs/`, eux-mêmes portés de la
 *      maquette : les motifs de section sont donc ceux de la maquette, mêmes
 *      surtitres en capitales, mêmes H2, mêmes cartes, et rien n'est inventé
 *      pour l'occasion.
 *   5. le bloc de fin de la maquette, qui reste le dernier mot de la page ;
 *   6. le formulaire, puis le maillage interne.
 *
 * Le complément est au-dessous des sections de la maquette et au-dessus de son
 * bloc de fin, parce que ce bloc EST la fermeture de la page dans le dessin :
 * le pousser au milieu aurait mis un appel à l'action avant la moitié du texte.
 */

export interface ProprietesPageOffres {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuOffres;
  /** Identifiant d'analyse transmis à HubSpot par le formulaire de bas de page. */
  formulaire?: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base, donc plus
   * contrôlable par `scripts/verifie-offres.tsx`.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageOffres({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageOffres) {
  const {
    surtitre,
    chapeau,
    actions,
    telephone,
    phraseDelai,
    reperes,
    visuel,
    besoins,
    offres,
    fin,
    complement,
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
          telephone={telephone}
          phraseDelai={phraseDelai}
          reperes={reperes}
          visuel={visuel}
        />

        {besoins ? <Besoins besoins={besoins} /> : null}
        {offres ? <Offres offres={offres} /> : null}

        {complement?.map((section, i) => (
          // L'index suffit comme clé : l'ordre du tableau EST celui du corpus,
          // il ne se réarrange pas, et deux sections de même type ne se
          // distinguent par rien d'autre.
          <Bloc key={`${section.type}-${i}`} section={section} />
        ))}

        {fin ? <Fin fin={fin} /> : null}

        {/* Le formulaire porte l'ancre `#formulaire`, visée par le bouton
            principal du bandeau et par celui du bloc de fin. */}
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
