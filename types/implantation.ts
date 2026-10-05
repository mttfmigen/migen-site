/**
 * Forme du contenu des pages de VILLE et de DÉPARTEMENT, sous `/implantations/`.
 *
 * DEUX GABARITS DE LA MAQUETTE, pas un. `maquette/accueil-rendu.html` les
 * dessine séparément et ils n'ont ni le même nombre de sections ni le même
 * propos :
 *
 *   · `isVille`, lignes 3962 à 4076, « SEO service + ville », CINQ sections :
 *     hero à deux colonnes, bandeau photo, constat/réponse en vis-à-vis,
 *     questions fréquentes en cartes, autres villes en pastilles.
 *   · `isDept`, lignes 6365 à 6433, « Gabarit département », TROIS sections :
 *     hero à deux colonnes, communes couvertes puis autres départements,
 *     panneau d'appel.
 *
 * Une page de ville vend une intervention sur un bassin industriel. Une page de
 * département couvre un territoire et distribue vers ses voisins. Les plier au
 * même gabarit, ce qui était l'état du site, donnait les dix sections de vente
 * sur les quarante-deux pages de la branche.
 *
 * POURQUOI LE DÉPARTEMENT N'A PAS SON COMPOSANT ICI. `components/site/secteur/
 * PageSecteur.tsx` rend DÉJÀ ces trois sections, au pixel : son hero, son bloc
 * communes + pages sœurs, son panneau d'appel sont ceux de `isDept`.
 * `ContenuDepartement` reprend donc `ContenuSecteur` tel quel et ne change que
 * le discriminant, et `PageDepartement` n'est qu'une enveloppe. Rien n'est
 * recopié, et `types/secteur.ts` n'est pas touché : il annonçait déjà servir
 * les deux gabarits voisins.
 *
 * AUCUNE VALEUR N'EST INVENTÉE. Tout est optionnel, toute section dont le corpus
 * ne fournit pas la matière ne se rend PAS DU TOUT. Ce que la maquette dessine
 * et que le corpus ne remplit pas est laissé vide, jamais comblé au jugé.
 *
 * LES LIBELLÉS DE STRUCTURE NE SONT PAS ICI. « Le constat terrain », « Notre
 * réponse », « Questions fréquentes », « Autres villes » sont les mêmes sur les
 * trente-quatre pages de ville : ils vivent dans le composant, relevés dans la
 * maquette. Même convention que `types/implantations.ts` pour « Rayon » et
 * « Rôle », et pour la même raison : les exposer en données aurait invité à les
 * réécrire page par page.
 */

import type { Paragraphe, Question, Section } from "./contenu";
import type { ContenuSecteur, LienSecteur, RepereSecteur } from "./secteur";

/**
 * Un repère du panneau du hero, avec sa précision éventuelle.
 *
 * `RepereSecteur` ne porte que la valeur et le libellé, comme le panneau de la
 * maquette. Mais quatre pages du corpus écrivent un `detail` sur leur chiffre
 * « 4 agences » : « Aucune en Isère, des techniciens qui s'y déplacent ». C'est
 * une précision qui DIT L'ABSENCE d'agence sur place, exactement le genre de
 * phrase que ce site refuse de laisser croire le contraire. Sans elle, « 4
 * agences » sur une page de Grenoble se lit comme s'il y en avait une à côté.
 *
 * Rendue en troisième ligne du même petit texte, sous le libellé.
 */
export interface RepereVille extends RepereSecteur {
  detail?: string;
}

/**
 * Le contenu d'une page de VILLE, gabarit `isVille` de la maquette.
 *
 * `reste` porte les sections du corpus que ces cinq sections n'accueillent pas,
 * rendues en dessous par les blocs déjà portés de `components/site/blocs/`,
 * qui sont les motifs de section de la maquette. Le corpus de ces pages est
 * rédigé, relu et payé : il ne se perd pas parce que la maquette ne lui a pas
 * prévu de case.
 */
export interface ContenuVille {
  gabarit: "ville";

  /** Surtitre orange du hero : « Rhône · Grand Lyon » dans la maquette. */
  surtitre?: string;
  /** Le paragraphe sous le H1. Le H1 vient de `pages.titre_h1`. */
  chapeau?: string;
  /** La maquette n'en pose qu'un, orange. Les suivants passent en secondaire. */
  actions?: LienSecteur[];

  /** Panneau en verre du hero. Sans repères ni contact, le hero tient sur une colonne. */
  panneauSurtitre?: string;
  /**
   * L'adresse de l'agence, une ligne par élément : rue, puis code postal et
   * commune. La maquette en affiche une ; le corpus n'en fournit aucune, et
   * l'adresse du siège n'est vraie que pour une page sur quarante-deux.
   */
  adresse?: string[];
  reperes?: RepereVille[];
  /** Sous le filet du panneau : comment joindre, horaires, rappel dans l'heure. */
  contact?: string;

  /** Colonne de gauche du vis-à-vis : ce que le terrain montre. */
  constatTitre?: string;
  constatTexte?: string;
  /**
   * Les contraintes du terrain, sous le paragraphe du constat.
   *
   * La maquette ne met pas de liste dans cette colonne : elle n'en met que dans
   * celle de droite. Celle-ci reprend la MÊME géométrie de liste (maquette
   * 4023), avec la croix orange du panneau « Le problème » (maquette, section
   * portée dans `blocs/Probleme.tsx`). Deux motifs de la maquette assemblés,
   * aucun inventé : sans cette liste, les cinq contraintes écrites par le
   * client pour chaque ville n'auraient aucune case et seraient perdues.
   */
  constatPuces?: Paragraphe[];

  /** Colonne de droite : ce que nous faisons, et les points tenus. */
  reponseTitre?: string;
  reponseTexte?: string;
  /** La liste à coches de la maquette, ligne 4023. Accroche en gras, puis le texte. */
  reponsePuces?: Paragraphe[];

  /** Les questions fréquentes, en cartes de verre empilées. */
  faqTitre?: string;
  faq?: Question[];

  /** Les villes sœurs, en pastilles cliquables. */
  autres?: LienSecteur[];

  /** Les sections du corpus que la maquette ne montre pas, rendues en dessous. */
  reste?: Section[];
}

/**
 * Le contenu d'une page de DÉPARTEMENT, gabarit `isDept` de la maquette.
 *
 * C'est `ContenuSecteur`, au discriminant près : les trois sections de `isDept`
 * sont exactement celles que `PageSecteur` rend déjà. Le discriminant diffère
 * pour que la route sache passer par `PageDepartement`, qui ajoute `reste`
 * sous le gabarit.
 */
export interface ContenuDepartement extends Omit<ContenuSecteur, "gabarit"> {
  gabarit: "departement";
  /** Les sections du corpus que les trois sections n'accueillent pas. */
  reste?: Section[];
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
