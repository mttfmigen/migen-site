/**
 * Forme du contenu des pages MÉTIER et DOMAINE.
 *
 * DEUX GABARITS, DEUX FICHIERS DE MAQUETTE, ET C'EST LE POINT IMPORTANT.
 *
 *   · `gabarit: "metier"` sert `/carriere/<metier>/`, 13 pages, et son dessin
 *     vient de « Migen - Gabarit 07 Metier.dc.html », copié dans
 *     `maquette/gabarit-07-metier.html`.
 *   · `gabarit: "domaine"` sert `/expertises/<domaine>/`, 19 pages, et son
 *     dessin vient d'un AUTRE fichier.
 *
 * LES DEUX ARMES NE PARTAGENT DÉLIBÉRÉMENT PLUS AUCUN CHAMP. Elles en ont
 * longtemps partagé six, sous un `BaseMetier` commun, parce qu'on les croyait
 * jumelles : même surtitre, même H1, même chapeau, deux boutons, un visuel, des
 * pastilles, une carte de fin. C'était faux, et c'est ce qui a fait servir les
 * fiches métier par un dessin qui n'est pas le leur pendant des semaines : le
 * gabarit 07 n'a NI pastilles de compétences, NI carte de fin « ce métier vous
 * manque sur votre site ? » — ce dernier message s'adresse d'ailleurs à un
 * employeur, sur une page que lit un candidat. Il a un sommaire collant, des
 * sections numérotées, une section de questions à part, un maillage en cartes et
 * un panneau « Rejoindre Migen ». Un champ partagé entre deux dessins
 * différents, c'est une invitation à rendre l'un avec l'autre.
 *
 * Le champ `gabarit` discrimine. La route `app/[...slug]/page.tsx` tranche
 * dessus, et `PageMetier` aiguille vers l'un ou l'autre rendu.
 *
 * AUCUN CHAMP SPÉCULATIF, et tous optionnels sauf le discriminant : une section
 * que le corpus n'alimente pas ne se rend pas du tout.
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
   * `cible()` dans `components/site/metier/pieces.tsx`.
   */
  href?: string;
}

export interface PhotoMetier {
  /** Chemin public : « /assets/web/… ». */
  src: string;
  /** Absent ou vide, l'image est décorative et n'est pas annoncée. */
  alt?: string;
}

/** La carte de verre qui ferme la page de DOMAINE : une question, un rappel. */
export interface CtaMetier {
  question: string;
  rappel?: string;
  bouton: BoutonMetier;
}

/* ------------------------------------------------------- gabarit 07, métier */

/**
 * Une section numérotée du corps, bornée par un titre de niveau 2 du corpus.
 *
 * `titre` est ABSENT sur la section d'ouverture, celle qui porte ce que le
 * corpus écrit avant son premier `##` et que le chapeau n'a pas pris. La
 * maquette la numérote quand même — elle est « 01 » — mais ne la met pas au
 * sommaire, faute de libellé. Son H2 n'est alors pas rendu du tout : la maquette
 * y laisse un `<h2>` vide, et un titre vide est une faute que les lecteurs
 * d'écran annoncent.
 */
export interface SectionMetier {
  titre?: string;
  /** L'ancre, « s1 » à « sN ». Posée par le script de production. */
  id: string;
  /** Le numéro affiché, « 01 » à « NN ». Deux chiffres, comme la maquette. */
  numero: string;
  blocs: BlocEditorial[];
}

/** Une question du corpus et sa réponse. */
export interface QuestionMetier {
  question: string;
  reponse: BlocEditorial[];
}

/**
 * La section « Questions fréquentes ».
 *
 * `titre` vient du corpus, pas de la maquette : c'est le H2 de la colonne
 * gauche, tandis que le surtitre orange au-dessus est, lui, écrit par la
 * maquette.
 */
export interface FaqMetier {
  titre: string;
  /** Ce que le corpus écrit sous le titre avant la première question. */
  intro?: BlocEditorial[];
  questions: QuestionMetier[];
}

/** Une carte du maillage de bas de page. */
export interface LienRubrique {
  libelle: string;
  /** Chemin interne, tel que le corpus l'écrit. */
  url: string;
  /** « Carrière », « Article », « Offre »… déduit du chemin par la maquette. */
  nature: string;
}

export type ContenuMetier =
  | {
      gabarit: "metier";
      /** Les paragraphes du chapeau du héros, dans l'ordre du corpus. */
      chapo?: string[];
      /** Les sections numérotées, hors questions fréquentes. */
      corps?: SectionMetier[];
      faq?: FaqMetier;
      /** Le maillage en cartes, « Pour aller plus loin ». */
      liens?: LienRubrique[];
    }
  | {
      gabarit: "domaine";
      chapeau?: string;
      boutons?: BoutonMetier[];
      photo?: PhotoMetier;
      /** « Les autres domaines », en pastilles. */
      autres?: LienMetier[];
      cta?: CtaMetier;
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
    };

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
