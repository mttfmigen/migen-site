import type { ReactNode } from "react";

import Bloc from "@/components/site/blocs/Bloc";
import PageSecteur from "@/components/site/secteur/PageSecteur";
import type { ContenuDepartement } from "@/types/implantation";
import type { ContenuSecteur } from "@/types/secteur";

/**
 * Gabarit DÉPARTEMENT, bloc `sc-if value="{{ isDept }}"` de
 * `maquette/accueil-rendu.html`, lignes 6365 à 6433. Il sert les huit pages de
 * département et de région de `/implantations/`.
 *
 * CE COMPOSANT NE DESSINE RIEN, et c'est le but. Les TROIS sections de `isDept`
 * sont déjà portées, au pixel, par `components/site/secteur/PageSecteur.tsx` :
 *
 *   · le hero à deux colonnes et son panneau en verre (maquette 6367, portée) ;
 *   · « Communes couvertes » puis « Les autres départements », dans un SEUL
 *     bloc révélé (maquette 6388, portée, et `PageSecteur` note explicitement
 *     que c'est le gabarit département qui dicte cet enchaînement) ;
 *   · le panneau d'appel final (maquette 6421, portée).
 *
 * `types/secteur.ts` l'annonçait déjà : « UN SEUL TYPE POUR LES DEUX GABARITS DE
 * LA MAQUETTE, et un seul composant ». Ce qui manquait n'était pas le dessin,
 * c'était la DONNÉE au bon format : les huit pages portaient encore les dix
 * sections du gabarit de vente, et retombaient donc sur lui.
 *
 * CE QUE CETTE ENVELOPPE AJOUTE, et sa seule raison d'être : `reste`. Le corpus
 * de ces pages porte sept sections que les trois de `isDept` n'accueillent pas,
 * et ce texte est rédigé, relu et payé. Il passe par les blocs déjà portés de
 * `components/site/blocs/`, qui sont les motifs de section de la maquette, et
 * il est rendu SOUS le gabarit, avant le formulaire et le maillage.
 *
 * NI `PageSecteur` NI `types/secteur.ts` NE SONT MODIFIÉS. Le `reste` entre par
 * la prop `maillage`, qui accepte déjà n'importe quel `ReactNode` et que la
 * route remplit exactement de cette façon.
 *
 * LE PANNEAU DU HERO. La maquette y pose une carte d'agences, par un
 * `x-import component="MigenAgences"` (ligne 6378) qui n'est pas du HTML et ne
 * se porte donc pas. La place est tenue par les repères chiffrés du corpus,
 * dans le panneau en verre que `PageSecteur` rend déjà aux mêmes valeurs. Sans
 * repères, le hero passe sur une colonne, et rien n'est inventé pour remplir.
 */
export interface ProprietesPageDepartement {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuDepartement;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageDepartement({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageDepartement) {
  const { reste = [], ...sections } = contenu;

  /* Le discriminant change, pas la forme : `ContenuDepartement` est
     `ContenuSecteur` au `gabarit` près. Il diffère pour que la route sache
     passer par ici, et donc rendre `reste`. */
  const pourSecteur: ContenuSecteur = { ...sections, gabarit: "secteur" };

  return (
    <PageSecteur
      titre={titre}
      contenu={pourSecteur}
      filAriane={filAriane}
      maillage={
        <>
          {/* L'index suffit comme clé : l'ordre du tableau EST le gabarit. */}
          {reste.map((section, i) => (
            <Bloc key={`${section.type}-${i}`} section={section} />
          ))}
          {maillage}
        </>
      }
    />
  );
}
