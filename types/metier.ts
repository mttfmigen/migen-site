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

/* ===========================================================================
   GABARIT 07 « Métier et carrière », porté le 07/10 contre LA référence :
   le rendu de la maquette autonome, figé dans `maquette/rendu/carriere--*.html`
   (13 pages, liste tenue par `maquette/contenu/site/index.json`).

   POURQUOI UN SECOND TYPE MÉTIER : l'union ci-dessus a été portée le 03/10
   contre « Migen - Site final.dc.html », l'export de démonstration qui n'est
   le gabarit d'aucune page (CLAUDE.md §16). La vraie page métier du rendu
   validé n'a ni « missions » en liste cochée ni corps éditorial : elle a de
   10 à 22 sections typées (bento, tableau, liste numérotée, étapes, duo,
   encart, grille, questions, postuler, liens). Le type ci-dessous décrit CE
   rendu-là. L'ancien membre « metier » de l'union reste pour que
   `scripts/verifie-metier-maquette.tsx` (bâti contre l'ancienne référence)
   compile encore : la route tranche sur `estMetier` AVANT `estMetierOuDomaine`,
   l'ancien gabarit métier n'est donc plus jamais servi.

   La donnée vient de la capture MOT POUR MOT (extraction vérifiée : chaque
   texte visible de la capture doit se retrouver dans le fichier, sinon
   l'extraction échoue). Rien d'optionnel n'est rempli au hasard : ce que la
   capture ne donne pas reste absent.
   =========================================================================== */

/** Une carte titrée : bento, liste numérotée, étape, duo. L'ordinal (01, 02…)
 *  est du dessin, recalculé au rendu ; l'extraction a vérifié qu'il se suit. */
export interface CarteFiche {
  titre: string;
  /** Peut porter un lien interne en Markdown : `[libellé](/chemin/)`. */
  texte: string;
}

export interface BandeFiche {
  /** La phrase de la bande orange ; son bouton « Postuler » est fixe. */
  texte: string;
}

export type SectionFiche =
  | { type: "chiffres"; items: { valeur: string; texte: string }[] }
  | {
      type: "bento";
      surtitre: string;
      titre: string;
      intros?: string[];
      cartes: CarteFiche[];
      bande?: BandeFiche;
    }
  | {
      type: "liste";
      surtitre: string;
      titre: string;
      intros?: string[];
      cartes: CarteFiche[];
      bande?: BandeFiche;
    }
  | {
      type: "etapes";
      surtitre: string;
      titre: string;
      intros?: string[];
      etapes: CarteFiche[];
      bande?: BandeFiche;
    }
  | {
      type: "duo";
      surtitre: string;
      titre: string;
      intros?: string[];
      cartes: CarteFiche[];
      bande?: BandeFiche;
    }
  | {
      type: "tableau";
      surtitre: string;
      titre: string;
      intros?: string[];
      entetes?: { gauche: string; droite: string };
      lignes: { gauche: string; droite: string }[];
      bande?: BandeFiche;
    }
  | {
      type: "grille";
      surtitre: string;
      titre: string;
      intros?: string[];
      colonnes: string[];
      lignes: string[][];
      bande?: BandeFiche;
    }
  | { type: "encart"; surtitre: string; titre: string; textes: string[] }
  | {
      type: "faq";
      surtitre: string;
      titre: string;
      intros?: string[];
      questions: { question: string; reponse: string }[];
    }
  /** La section-formulaire #postuler : toute sa copie est fixe, relevée de la
   *  capture et identique sur les 13 pages (vérifié à l'extraction). */
  | { type: "postuler" }
  | { type: "liens"; items: { libelle: string; href: string }[] };

export interface HerosFiche {
  /** « Métier » dans la pastille du héros. */
  pastille: string;
  /** Le paragraphe d'attaque, en 19px. */
  chapeau: string;
  /** Les paragraphes suivants, en 15.5px, liens internes en Markdown. */
  paragraphes?: string[];
  /** La carte de verre flottante sur la photo : « 10 % », sa légende. */
  chiffre?: { valeur: string; texte: string };
}

export interface ContenuFicheMetier {
  gabarit: "metier";
  heros: HerosFiche;
  sections: SectionFiche[];
}

/**
 * La page est-elle une fiche métier du gabarit 07 ?
 *
 * `heros` et `sections` départagent la nouvelle forme de l'ancienne (qui
 * portait `missions`/`corps`) : une donnée ancienne encore en base passerait
 * par `estMetierOuDomaine` et l'ancien composant, jamais par celui-ci.
 */
export function estMetier(contenu: unknown): contenu is ContenuFicheMetier {
  if (!contenu || typeof contenu !== "object") return false;
  const c = contenu as { gabarit?: unknown; heros?: unknown; sections?: unknown };
  return c.gabarit === "metier" && typeof c.heros === "object" && Array.isArray(c.sections);
}
