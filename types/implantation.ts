/**
 * Forme du contenu des 42 pages de `/implantations/`, villes et départements.
 *
 * LE FICHIER QUI FAIT FOI. « Migen - Gabarit 04 Ville.dc.html » pour les
 * villes, « Migen - Gabarit 06 Departement.dc.html » pour les départements.
 * Les deux sont le MÊME fichier au commentaire et au jeu d'exemples près :
 * même en-tête, mêmes douze sections, même ordre, même parseur, même
 * `data-screen-label` à une étiquette près. Les deux s'annoncent « dérivé du
 * gabarit 03, mêmes blocs, même parseur ».
 *
 * CE QUI PRÉCÉDAIT, ET POURQUOI C'ÉTAIT FAUX. Le portage avait été fait depuis
 * « Migen - Site final », qui dessine un bloc `isVille` de CINQ sections et un
 * bloc `isDept` de TROIS. Ces blocs sont un aperçu, pas le gabarit : les
 * fichiers de gabarit dédiés en dessinent DOUZE, et le corpus de ces 42 pages
 * est écrit section par section pour eux. Un seul type, un seul composant.
 *
 * LES DOUZE SECTIONS, dans l'ordre de la maquette, par leur sur-titre :
 *
 *    1. 01 Héros ............... pastille « Implantations », pas de sur-titre
 *    2. 02 Photo et logos ...... « Ils nous font confiance »
 *    3. 03 Problème ............ « Votre problématique »
 *    4. 04 Offre ............... « L'offre »
 *    5. 05 Déroulé ............. « Le déroulé »
 *    6. 06 Garanties ........... « Notre parti pris »
 *    7. Réassurance ............ « Certifications », « Qui intervient chez vous »
 *    8. 07 Appel ............... pas de sur-titre
 *    9. 08 Références .......... « Nos réalisations »
 *   10. 09 Questions ........... « Questions fréquentes »
 *   11. Maillage .............. « Pour aller plus loin »
 *   12. 10 Appel final ........ « Votre besoin »
 *
 * LE CORPUS COUVRE TOUT. Les dix sections du corpus (`heros`, `chiffres`,
 * `probleme`, `offre`, `deroule`, `garanties`, `cta`, `preuves`, `objections`,
 * `ctaFinal`) tombent une à une dans les sections 1, 3 à 6 et 8 à 12 de la
 * maquette, sans reste : c'est la preuve que ce gabarit-ci est le bon. Les
 * deux seules sections sans source sont la PHOTO de la section 02 et le bloc
 * RÉASSURANCE, dont la maquette écrit elle-même la copie.
 *
 * AUCUNE VALEUR N'EST INVENTÉE. Tout est optionnel, et une section dont le
 * corpus ne fournit pas la matière ne se rend PAS DU TOUT, sur-titre compris.
 *
 * LES LIBELLÉS DE STRUCTURE NE SONT PAS ICI. Les sur-titres, les titres fixes
 * (« Ce que nous faisons, et ce que ça change pour vous », « Ce que nous
 * garantissons »…) et toute la réassurance sont les mêmes sur les 42 pages :
 * ils vivent dans le composant, relevés dans la maquette. Les exposer en
 * données aurait invité à les réécrire page par page.
 */

import type {
  Etape,
  Paragraphe,
  PrestationBenefice,
  Preuve,
  Question,
  Section,
} from "./contenu";
import type { LienSecteur } from "./secteur";

/**
 * Un repère du panneau « En bref » du héros, avec sa précision éventuelle.
 *
 * La maquette ne pose que la valeur et le libellé. Quatre pages du corpus
 * écrivent un `detail` sur leur chiffre « 4 agences » : « Aucune en Isère, des
 * techniciens qui s'y déplacent ». C'est une précision qui DIT L'ABSENCE
 * d'agence sur place, exactement le genre de phrase que ce site refuse de
 * laisser croire le contraire. Rendue sous le libellé, dans le même petit
 * texte.
 */
export interface RepereImplantation {
  valeur: string;
  libelle: string;
  detail?: string;
}

/** Un appel à l'action du corpus : la question, le bouton, le rappel. */
export interface AppelImplantation {
  question: string;
  bouton: string;
  /** Le rappel du téléphone, phrase complète. */
  rappel?: string;
}

/** Une carte du maillage, section « Pour aller plus loin ». */
export interface CarteMaillage extends LienSecteur {
  /**
   * La phrase du corpus où le lien a été écrit. La maquette la met sous le
   * titre de la carte. Absente, la carte se rend sans elle.
   */
  contexte?: string;
}

/** Le contenu d'une page d'implantation, ville ou département. */
export interface ContenuImplantation {
  /**
   * Le discriminant. Les deux fichiers de maquette étant identiques, il ne
   * change RIEN au rendu : il dit seulement de quel sujet la page parle, et
   * sert au fil d'Ariane comme au maillage.
   */
  gabarit: "ville" | "departement";

  /* ------------------------------------------------------------ 01 Héros */

  /** Le paragraphe sous le H1. Le H1, lui, vient de `pages.titre_h1`. */
  chapeau?: string;
  /** Le bouton orange du héros, et celui de l'îlot de navigation. */
  action?: LienSecteur;
  /** Le numéro, tel que le corpus l'écrit. Sert les quatre boutons d'appel. */
  telephone?: string;
  /** Sous le filet du héros, avec le point orange : horaires et rappel. */
  delai?: string;
  /** Le panneau « En bref ». Sans repères, le héros tient sur une colonne. */
  reperes?: RepereImplantation[];

  /* --------------------------------------------------- 02 Photo et logos */

  /**
   * Les noms de clients du bandeau défilant.
   *
   * La maquette les tire des références de la page, pas d'une liste à part :
   * `logoLoop` est construit sur `p.proofs.map(x => x.client)`. La PHOTO de
   * cette section n'a aucune source dans le corpus et ne se rend donc pas.
   */
  logos?: string[];

  /* --------------------------------------------------------- 03 Problème */

  /** Le H2, première phrase de la punchline du corpus. */
  problemeTitre?: string;
  /** Le reste de la punchline, sous le H2. */
  problemeTexte?: string;
  /** Les cartes en verre de la colonne de droite. */
  problemes?: Paragraphe[];

  /* ------------------------------------------------------------ 04 Offre */

  /** Les rangées du tableau : prestation à gauche, bénéfice à droite. */
  offre?: PrestationBenefice[];
  /** Le pavé de notes sous le tableau. */
  offreNotes?: string[];

  /* ---------------------------------------------------------- 05 Déroulé */

  /** La frise verticale, une pastille numérotée par étape. */
  etapes?: Etape[];

  /* -------------------------------------------------------- 06 Garanties */

  /** Les quatre colonnes à filet orange du panneau sombre. */
  garanties?: Paragraphe[];

  /* ------------------------------------------------------------ 07 Appel */

  appel?: AppelImplantation;

  /* ------------------------------------------------------- 08 Références */

  preuves?: Preuve[];

  /* -------------------------------------------------------- 09 Questions */

  questions?: Question[];

  /* ---------------------------------------------------------- Maillage */

  /** Les liens internes écrits dans le corpus, dédoublonnés, hors `/preuves/`. */
  liens?: CarteMaillage[];

  /* ------------------------------------------------------ 10 Appel final */

  appelFinal?: AppelImplantation;

  /* ------------------------------------------------------------- le reste */

  /**
   * Ce que le corpus porte et que les douze sections n'accueillent pas, rendu
   * en dessous par les blocs déjà portés de `components/site/blocs/`.
   *
   * Sur les 42 pages d'aujourd'hui, il est VIDE : la maquette couvre tout le
   * corpus. Le champ reste parce que le corpus peut s'allonger, et que le
   * texte rédigé ne doit jamais se perdre faute de case.
   */
  reste?: Section[];
}

/** Une page de ville. Même gabarit qu'un département, autre sujet. */
export interface ContenuVille extends Omit<ContenuImplantation, "gabarit"> {
  gabarit: "ville";
}

/** Une page de département ou de région. */
export interface ContenuDepartement extends Omit<ContenuImplantation, "gabarit"> {
  gabarit: "departement";
}

/** Le contenu est-il celui d'une page de ville ? Lu sur un `jsonb`, donc sur de l'`unknown`. */
export function estVille(contenu: unknown): contenu is ContenuVille {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuVille).gabarit === "ville"
  );
}

/** Le contenu est-il celui d'une page de département ? */
export function estDepartement(contenu: unknown): contenu is ContenuDepartement {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuDepartement).gabarit === "departement"
  );
}
