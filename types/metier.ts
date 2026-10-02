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
    })
  | (BaseMetier & {
      gabarit: "domaine";
      /** « Ce que nous traitons », en liste cochée dans la carte de verre. */
      traitements?: string[];
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
