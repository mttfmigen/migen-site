/**
 * Forme du contenu des pages MÉTIER et DOMAINE, troisième gabarit de
 * `pages.contenu`.
 *
 * Porté de la maquette « Migen - Site final.dc.html », lignes 5452 à 5541
 * (gabarit métier) et 5543 à 5600 (gabarit domaine).
 *
 * POURQUOI UNE SEULE UNION POUR DEUX GABARITS : les deux pages ont la même
 * charpente (surtitre, H1, chapeau, deux boutons, un visuel, une ou deux listes,
 * les autres entrées en pastilles, un appel à l'action en carte de verre) et ne
 * divergent que sur deux points : la mise en page du héros et du visuel, et la
 * nature des listes. Deux types jumeaux auraient dérivé l'un de l'autre au
 * premier ajustement, comme l'ont fait les deux sections d'appel à l'action
 * avant d'être réunies dans `blocs/Cta.tsx`.
 *
 * Le champ `gabarit` discrimine, exactement comme `ContenuEditorial` porte
 * `gabarit: "editorial"`. La route `app/[...slug]/page.tsx` tranche dessus.
 *
 * AUCUN CHAMP SPÉCULATIF, et tous optionnels sauf le discriminant : le corpus
 * du site actuel n'écrit pas encore ces pages sous cette forme. Ce qu'il ne
 * fournit pas se rend vide, jamais rempli au hasard.
 */

import type { Section } from "./contenu";

import type { BlocEditorial } from "@/types/editorial";

/** Une pastille cliquable vers une autre entrée du même rayon. */
export interface LienMetier {
  libelle: string;
  /** Chemin interne, slash final : « /expertises/robotique/ ». */
  href: string;
}

/** Un bouton du héros ou de l'appel à l'action. */
export interface BoutonMetier {
  libelle: string;
  /**
   * Chemin interne ou ancre. Absent, le bouton vise le formulaire de bas de
   * page. Une cible externe est REFUSÉE et le bouton n'est pas rendu : voir
   * `cible()` dans `components/site/metier/PageMetier.tsx`.
   */
  href?: string;
}

export interface PhotoMetier {
  /** Chemin public : « /assets/web/… ». */
  src: string;
  /** Absent ou vide, l'image est décorative et n'est pas annoncée. */
  alt?: string;
}

/** La carte de verre qui ferme la page : une question, un rappel, un bouton. */
export interface CtaMetier {
  question: string;
  rappel?: string;
  bouton: BoutonMetier;
}

interface BaseMetier {
  chapeau?: string;
  boutons?: BoutonMetier[];
  photo?: PhotoMetier;
  /** « Autres métiers » ou « Les autres domaines », selon le gabarit. */
  autres?: LienMetier[];
  cta?: CtaMetier;
}

export type ContenuMetier =
  | (BaseMetier & {
      gabarit: "metier";
      /** Les missions, en liste cochée. */
      missions?: string[];
      /** Compétences attendues, en pastilles neutres. */
      competences?: string[];
      /** Habilitations utiles, en pastilles orange. */
      habilitations?: string[];
      /**
       * LE RESTE DU CORPUS, rendu sous les sections de la maquette.
       *
       * POURQUOI CE CHAMP EXISTE. La maquette ne dessine que quatre sections
       * pour une fiche métier, 155 mots en tout. Le corpus de ces pages en
       * porte entre 30 et 76 blocs : diplômes, financement, conditions de
       * travail, marché de l'emploi, questions fréquentes. C'est du texte
       * rédigé, relu et payé, et c'est la substance du référencement de la
       * page. Le réduire aux quatre sections de la maquette supprimerait les
       * neuf dixièmes de ce qui fait venir le visiteur.
       *
       * Il est donc rendu SOUS les sections de la maquette, dans la colonne de
       * lecture du gabarit article de la maquette (lignes 5759 à 5824), celle
       * que `components/site/editorial/PageEditoriale.tsx` emploie déjà. La
       * page reste celle de la maquette et garde tout son texte.
       *
       * ET SURTOUT PAS `blocs` : `estEditorial()` ne regarde que la présence de
       * ce nom, et `app/[...slug]/page.tsx` l'interroge AVANT
       * `estMetierOuDomaine()`. Un contenu qui porterait `blocs` repartirait
       * dans le gabarit éditorial, et ces pages ressembleraient encore à ce que
       * le client a refusé.
       */
      corps?: BlocEditorial[];
    })
  | (BaseMetier & {
      gabarit: "domaine";
      /** « Ce que nous traitons », en liste cochée dans la carte de verre. */
      traitements?: string[];
      /**
       * CE QUE LE CORPUS PORTE ET QUE LA MAQUETTE NE DESSINE PAS.
       *
       * Le gabarit domaine de la maquette tient en trois sections : le héros,
       * la mosaïque « Ce que nous traitons », puis « Les autres domaines » et sa
       * carte de fin. Le corpus rédigé, lui, porte huit sections de plus par
       * page : les chiffres, le problème, le duo prestation-bénéfice, le
       * déroulé, les garanties, l'appel de milieu de page, les réalisations et
       * les questions fréquentes. C'est du texte payé, et c'est la substance du
       * référencement de la page : il ne se supprime pas parce que la maquette
       * ne lui a pas dessiné de case.
       *
       * Il se rend donc ici, par les MÊMES blocs que le gabarit de vente
       * (`components/site/blocs/`), qui sont eux aussi portés de la maquette :
       * même surtitre orange en capitales, mêmes H2, mêmes cartes. La page reste
       * celle de la maquette et garde tout son texte.
       *
       * `heros` et `ctaFinal` n'y figurent PAS : le héros de la maquette et sa
       * carte de fin les rendent déjà, et deux `heros` donneraient deux H1.
       */
      reste?: Section[];
    });

/**
 * Le contenu est-il une page métier ou domaine ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde ce qu'il y a, pas ce
 * qu'un type déclare.
 */
export function estMetierOuDomaine(contenu: unknown): contenu is ContenuMetier {
  if (!contenu || typeof contenu !== "object") return false;
  const gabarit = (contenu as { gabarit?: unknown }).gabarit;
  return gabarit === "metier" || gabarit === "domaine";
}
