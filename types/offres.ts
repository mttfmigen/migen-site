import type { ContenuOffre, LienOffre } from "./offre";

/**
 * Forme du contenu du HUB `/offres/` (gabarit « 10 Hub de rubrique »).
 *
 * LA RÉFÉRENCE est la capture `maquette/rendu/offres.html`, 18 écrans. Seize
 * d'entre eux sont, au dessin près, ceux d'une page d'offre
 * (`maquette/rendu/offres--residence.html`) : héros à formulaire, chiffres,
 * logos, réassurance, bandes d'appel, problématique, offre, déroulé, garanties,
 * bande-question, références, questions, appel final. La donnée reprend donc
 * les champs de `ContenuOffre`, sous leurs noms, et les mêmes composants les
 * rendent (`components/site/offre/`).
 *
 * Trois écrans n'existent que sur le hub, et portent leurs propres champs :
 *   · « Deux approches, un seul objectif » (`approches`) ;
 *   · l'encart « Migen Résidence » à photo (`encartResidence`) ;
 *   · « Six offres, un seul interlocuteur. » (`maillage`), dont le titre
 *     diffère de celui de `MaillageOffres` et dont la première carte est
 *     Résidence.
 *
 * Le texte est COPIÉ de la capture, jamais retapé. Le H1 n'est pas ici : il
 * vient de `pages.titre_h1` (ou du relais), un seul endroit pour le titre.
 */

/** Les champs de la page d'offre que le hub rend, sous les mêmes noms. */
type ChampsOffre = Pick<
  ContenuOffre,
  | "pastille"
  | "mention"
  | "appelBouton"
  | "chapeau"
  | "actions"
  | "formulaireHeroTitre"
  | "formulaireHeroMention"
  | "chiffres"
  | "reperesReassurance"
  | "problemePhoto"
  | "derouleTitre"
  | "brefBande"
  | "brefBouton"
  | "brefMention"
  | "sections"
>;

/** Une colonne de « Deux approches ». La seconde se rend en panneau sombre. */
export interface ApprocheOffres {
  surtitre: string;
  titre: string;
  texte: string;
  puces: string[];
  bouton: LienOffre;
}

/** L'encart « Migen Résidence » : texte à gauche, photo à droite. */
export interface EncartOffres {
  surtitre: string;
  titre: string;
  accroche: string;
  paragraphes: string[];
  bouton: LienOffre;
  /** Servie depuis `public/`. */
  photo: string;
  alt: string;
}

/** Une carte à photo de « Six offres, un seul interlocuteur. » */
export interface CarteMaillageOffres {
  href: string;
  photo: string;
  etiquette: string;
  titre: string;
  phrase: string;
}

export interface ContenuOffres extends ChampsOffre {
  gabarit: "offres";
  approches?: {
    surtitre: string;
    titre: string;
    cartes: ApprocheOffres[];
  };
  encartResidence?: EncartOffres;
  maillageSurtitre?: string;
  maillageTitre?: string;
  maillage?: CarteMaillageOffres[];
}

/**
 * Le contenu est-il celui du hub des offres ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on se fie au champ discriminant
 * et à rien d'autre.
 */
export function estOffres(contenu: unknown): contenu is ContenuOffres {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuOffres).gabarit === "offres"
  );
}

/**
 * La FAQ à photo (`QuestionsPhoto`), partagée par les pages d'offre, les
 * expertises, les spécialités et les domaines.
 */
export interface QuestionsPhotoOffres {
  surtitre: string;
  titre: string;
  /** Un paragraphe à la place du bouton. */
  chapeau?: string;
  lienTexte: string;
  lienHref: string;
  /**
   * Pastille orange pleine plutôt que lien fléché : la carte sombre
   * (`mg-faqph`) de la maquette, avec « Poser ma question ».
   */
  bouton?: boolean;
  photo: string;
  questions: { question: string; reponse: string }[];
}
