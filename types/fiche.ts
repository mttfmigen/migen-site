/**
 * Forme du contenu d'une FICHE DE CAS CLIENT, gabarit des 28 pages
 * `/preuves/<client>/`.
 *
 * Porté de « Migen - Site final.dc.html », lignes 6126 à 6209, écran
 * « Gabarit fiche réalisation ».
 *
 * POURQUOI UN TROISIÈME GABARIT. Une fiche de cas n'est ni une page de vente
 * (`types/contenu.ts`, dix sections commerciales dans un ordre imposé) ni une
 * page éditoriale (`types/editorial.ts`, des blocs de texte suivis). Elle a sa
 * mise en page propre, que la maquette fixe : un héros à deux colonnes avec la
 * carte d'identité du chantier, une galerie en mosaïque, trois cartes
 * contexte / intervention / résultat, un appel vers un cas comparable. Pliée au
 * gabarit de vente, elle perdait tout cela : c'est ce que le client a vu.
 *
 * TOUS LES CHAMPS DE CONTENU SONT OPTIONNELS, et c'est délibéré. Le corpus de
 * `/preuves/` n'est pas encore importé : ce qu'il ne fournira pas se rend vide,
 * jamais inventé. Une fiche sans galerie n'affiche pas de galerie, une fiche
 * sans chiffres n'affiche pas la carte résultat.
 *
 * La route `app/[...slug]/page.tsx` tranche sur `gabarit: "fiche"`.
 */

/** Une ligne de la carte d'identité : « SECTEUR », « Traitement de l'eau ». */
export interface LigneFiche {
  /** Rendu en capitales par la charte. Écrire le libellé tel qu'il se lit. */
  libelle: string;
  valeur: string;
}

/** Un visuel de la mosaïque. */
export interface ImageFiche {
  /** Chemin public (« /assets/web/… ») ou URL. */
  src: string;
  /**
   * Décoratif sur la maquette, donc vide par défaut. À remplir dès que la
   * photo porte une information que le texte ne donne pas.
   */
  alt?: string;
}

/** Un chiffre du résultat : « 14 sem. », « planning tenu ». */
export interface ChiffreFiche {
  valeur: string;
  libelle: string;
}

export interface ContenuFiche {
  gabarit: "fiche";
  /** Ligne de contexte au-dessus du H1 : « SUEZ IWT · migen© Résidence · février 2026 ». */
  surtitre?: string;
  /** Le paragraphe du héros. Ce que le chantier était. */
  chapeau?: string;
  /** La carte d'identité du chantier, autant de lignes que le corpus en donne. */
  fiche?: LigneFiche[];
  /** Mosaïque : le premier visuel tient la grande case, les suivants la colonne. */
  images?: ImageFiche[];
  /** Carte « Le contexte ». */
  contexte?: string;
  /** Carte « Ce que nous avons fait ». */
  intervention?: string;
  /** Carte « Le résultat », sur fond anthracite. */
  resultats?: ChiffreFiche[];
}

/**
 * Le contenu est-il une fiche de cas ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a. Le champ discriminant suffit, aucun champ
 * de contenu n'étant obligatoire.
 */
export function estFiche(contenu: unknown): contenu is ContenuFiche {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuFiche).gabarit === "fiche"
  );
}
