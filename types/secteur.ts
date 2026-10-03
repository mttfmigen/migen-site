/**
 * Forme du contenu d'une page SECTEUR, troisième gabarit de `pages.contenu`.
 *
 * TROIS GABARITS COHABITENT DANS LA MÊME COLONNE :
 *
 *   · VENTE (`types/contenu.ts`), dix sections nommées, porte `sections`.
 *   · ÉDITORIAL (`types/editorial.ts`), blocs suivis, porte `gabarit: "editorial"`.
 *   · SECTEUR (ici), porte `gabarit: "secteur"`.
 *
 * POURQUOI UN TROISIÈME. Les pages de secteur et d'implantation ne vendent pas
 * une offre et n'expliquent pas un métier : elles ancrent. Hero avec ses
 * repères, les contraintes du terrain, le territoire couvert, les pages sœurs,
 * puis l'appel. La maquette leur donne deux gabarits voisins, lignes 5602 à
 * 5757 de « Migen - Site final.dc.html » : SECTEUR et DÉPARTEMENT. Les plier au
 * gabarit de vente, ce qui est l'état actuel du site, produit une page qui
 * annonce une prestation là où le visiteur cherche un territoire.
 *
 * UN SEUL TYPE POUR LES DEUX GABARITS DE LA MAQUETTE, et un seul composant : ils
 * partagent le hero, les pastilles de pages sœurs et l'appel final. Ce qui les
 * distingue, ce sont les DONNÉES, pas une variante à déclarer : le secteur porte
 * des cartes d'enjeux, le département une liste de communes. Chaque section se
 * rend si et seulement si le corpus la fournit, et disparaît sinon. Un drapeau
 * `variante` aurait fait porter au contenu une décision que son contenu dit
 * déjà.
 *
 * URL servies : `/secteurs/<secteur>/` et `/implantations/<ville>/<departement>/`.
 *
 * AUCUNE VALEUR PAR DÉFAUT N'EST INVENTÉE. Tout est optionnel, tout se rend
 * vide. Les textes attendus sont listés dans `docs/` par l'import du corpus.
 */

import type { Section } from "./contenu";

/** Une pastille cliquable : page sœur du même niveau. */
export interface LienSecteur {
  libelle: string;
  /** Chemin INTERNE, slash final. Une cible externe est refusée au rendu. */
  href: string;
}

/** Un repère chiffré du hero : « 14 » / « sites agroalimentaires suivis ». */
export interface RepereSecteur {
  valeur: string;
  libelle: string;
}

/** Une contrainte du terrain, carte en verre de la section des enjeux. */
export interface EnjeuSecteur {
  titre: string;
  texte: string;
}

export interface ContenuSecteur {
  gabarit: "secteur";

  /** Surtitre orange du hero : « Secteur d'activité », « Département 69 ». */
  surtitre?: string;
  /** Le paragraphe sous le H1. Le H1 vient de `pages.titre_h1`. */
  chapeau?: string;
  /**
   * Les actions du hero. La PREMIÈRE est le bouton orange, la seconde le bouton
   * en verre. Au-delà de deux, la maquette n'en prévoit pas : les suivantes
   * sont rendues en bouton secondaire, sur la même ligne qui se replie.
   */
  actions?: LienSecteur[];

  /** Panneau en verre du hero. Sans repères, le hero passe sur une colonne. */
  reperesSurtitre?: string;
  reperes?: RepereSecteur[];

  /** Section des contraintes du secteur. */
  enjeuxSurtitre?: string;
  enjeuxTitre?: string;
  enjeux?: EnjeuSecteur[];

  /** Section du territoire : pastilles NON cliquables, ce sont des faits. */
  communesSurtitre?: string;
  communesTitre?: string;
  communes?: string[];

  /** Pages sœurs : les autres secteurs, ou les autres départements. */
  autresSurtitre?: string;
  autres?: LienSecteur[];

  /** Appel à l'action final, dans le grand panneau en verre. */
  appelTitre?: string;
  appelTexte?: string;
  /** Sans bouton fourni, l'appel vise l'ancre du formulaire de la page. */
  appelBouton?: LienSecteur;

  /**
   * CE QUE LE CORPUS PORTE ET QUE LA MAQUETTE NE DESSINE PAS.
   *
   * La maquette donne quatre sections à une page de secteur : le héros et ses
   * repères, les enjeux, les pages sœurs, l'appel. Le corpus rédigé en porte
   * dix. Les six qui restent (`offre`, `deroule`, `garanties`, `cta`,
   * `preuves`, `objections`) sont du texte écrit, payé, et c'est la substance
   * du référencement de ces pages : elles ne se suppriment pas parce que la
   * maquette ne les dessine pas.
   *
   * Elles sont donc rendues SOUS les sections de la maquette, par les blocs de
   * `components/site/blocs/`, eux-mêmes portés de la maquette et qui en
   * gardent les surtitres. La page reste celle de la maquette et garde tout son
   * texte.
   *
   * POURQUOI UN CHAMP À PART, ET PAS LE `sections` DU GABARIT DE VENTE : une
   * page qui porterait les deux clés serait ambiguë pour qui la lit, et le
   * repli de `app/[...slug]/page.tsx` ne doit jamais pouvoir la servir comme
   * une page de vente. Le nom dit ce que c'est : un complément, sous le
   * gabarit, pas le gabarit.
   *
   * Lu sur un `jsonb` : le gabarit écarte au rendu une section dont le type
   * n'a pas de bloc, plutôt que de faire tomber la page entière.
   */
  complement?: Section[];
}

/**
 * Le contenu est-il celui d'une page secteur ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a.
 */
export function estSecteur(contenu: unknown): contenu is ContenuSecteur {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuSecteur).gabarit === "secteur"
  );
}
