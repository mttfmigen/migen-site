/**
 * Forme du contenu d'une page SECTEUR, troisième gabarit de `pages.contenu`.
 *
 * TROIS GABARITS COHABITENT DANS LA MÊME COLONNE :
 *
 *   · VENTE (`types/contenu.ts`), dix sections nommées, porte `sections`.
 *   · ÉDITORIAL (`types/editorial.ts`), blocs suivis, porte `gabarit: "editorial"`.
 *   · SECTEUR (ici), porte `gabarit: "secteur"`.
 *
 * QUEL FICHIER DE MAQUETTE FAIT FOI, et c'est la correction du 03/10.
 *
 * Le portage précédent a lu « Migen - Site final.dc.html », lignes 5602 à 5757,
 * parce que c'est le fichier que le client avait envoyé en message. Le projet
 * Claude Design contient ONZE FICHIERS DE GABARITS DÉDIÉS, bien plus riches, et
 * personne ne les avait listés. Pour les pages de secteur, celui qui fait foi
 * est « Migen - Gabarit 08 Secteur.dc.html », versionné en local dans
 * `maquette/gabarit-08-secteur.html`. Il dessine DOUZE sections là où « Site
 * final » en dessine quatre, et il fait foi CONTRE lui.
 *
 * C'est la cause du « les pages offres ne ressemblent toujours pas » : le
 * dessin lu n'était pas le bon dessin.
 *
 * DEUX JEUX DE CHAMPS COHABITENT DONC ICI, et c'est transitoire :
 *
 *   · `sections` et `pourAllerPlusLoin` : le gabarit 08, pour les 13 pages
 *     `/secteurs/<secteur>/`. C'est le jeu à utiliser.
 *   · tout le reste (`surtitre`, `reperes`, `enjeux`, `communes`, `autres`,
 *     `appel*`, `complement`) : le portage « Site final », encore en service
 *     pour les 42 pages de `/implantations/`, qui passent par
 *     `types/implantation.ts` et `components/site/implantation/`. Ces pages ont
 *     leurs propres fichiers qui font foi (« Gabarit 04 Ville »,
 *     « Gabarit 06 Departement ») et leur propre portage à refaire. CES CHAMPS
 *     NE SONT PAS SUPPRIMÉS AUJOURD'HUI : les retirer casserait un gabarit
 *     voisin en cours de correction, pour un gain nul sur celui-ci.
 *
 * URL servies par `sections` : `/secteurs/<secteur>/`, 13 pages.
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

/**
 * Une carte de « Pour aller plus loin », section Maillage du gabarit 08.
 *
 * Le `texte` est la PHRASE DU CORPUS qui portait le lien, pas un résumé écrit
 * pour l'occasion : c'est ce que fait le parseur de la maquette, qui garde le
 * contexte de chaque `[libellé](cible)` qu'il déplie. Rien ne s'invente, donc
 * une carte sans contexte sort sans texte.
 */
export interface CarteLien {
  titre: string;
  /** Chemin INTERNE, slash final. Une cible externe est refusée au rendu. */
  href: string;
  texte?: string;
  /** Chemin public d'un visuel, « /assets/web/… ». Posé par la maquette. */
  image?: string;
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

  /**
   * LES DIX SECTIONS DU CORPUS, DANS L'ORDRE DU CORPUS. Le gabarit 08.
   *
   * CE CHAMP EST CELUI DES PAGES `/secteurs/<secteur>/`, et il remplace tout ce
   * qui suit pour elles. Les champs d'en dessous (`surtitre`, `reperes`,
   * `enjeux`, `communes`, `autres`, `appel*`, `complement`) sont ceux du
   * portage précédent, resté en service pour `/implantations/` : voir le long
   * commentaire de `PageSecteur.tsx`.
   *
   * POURQUOI LES DIX SECTIONS TELLES QUELLES, et non un champ par morceau de
   * dessin. « Migen - Gabarit 08 Secteur.dc.html » dessine DOUZE sections, et
   * son propre script dit d'où chacune tire son texte : les dix `## SECTION n`
   * du fichier Markdown de la page, une par une, sans en replier ni en couper
   * aucune. La correspondance est donc l'identité. Un jeu de champs à plat
   * l'aurait recopiée une troisième fois, après le corpus et après le parseur
   * de la maquette, et c'est exactement par là que le portage précédent s'est
   * perdu : il avait inventé quatre champs pour un gabarit qui en dessine
   * douze, et les six sections restantes partaient en `complement`.
   *
   * Le type vient de `types/contenu.ts` et n'est pas redéclaré : c'est la MÊME
   * substance que lit le gabarit de vente, lue par un autre dessin.
   *
   * L'ORDRE N'EST PAS PORTÉ PAR LES DONNÉES, il est donné par l'ordre du
   * tableau, et le gabarit interdit de le réarranger. Une section que le corpus
   * ne fournit pas est absente du tableau, et ne se rend pas du tout.
   */
  sections?: Section[];

  /**
   * Les cartes de « Pour aller plus loin ». Section Maillage de la maquette.
   *
   * EN DONNÉES ET NON DÉDUITES AU RENDU : la maquette les fabrique en dépliant
   * chaque `[libellé](cible)` du Markdown de la page et en gardant la phrase
   * qui le portait. Ce travail est celui de l'import, qui lit le Markdown ;
   * le refaire à chaque rendu reviendrait à parser du Markdown par page servie
   * pour un résultat déjà connu au moment de l'écriture.
   */
  pourAllerPlusLoin?: CarteLien[];

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
