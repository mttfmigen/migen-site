/**
 * Forme du contenu d'une page ÉTUDE DE CAS, gabarit « 02 Étude de cas » de
 * l'index de la maquette (41 pages, branche `/preuves/<client>/`).
 *
 * LA RÉFÉRENCE : le rendu de la maquette autonome, figé page par page dans
 * `maquette/rendu/preuves--<slug>.html`. Pages pilotes relevées le 07/10 :
 * `/preuves/suez-remise-en-etat/` et `/preuves/danone-lignes-de-production/`,
 * dix sections chacune, dans cet ordre :
 *
 *   0. Étude de cas · héros   pastille « Étude de cas », nom du client, H1,
 *                             chapeau, bouton → #cas-form, téléphone, photo
 *                             (fiche en incrustation sur Danone : `heroFiche`)
 *   1. Chiffres du dispositif quatre cartes libellé / valeur
 *   2. La situation           « 01 · La situation », prose, « Les objectifs
 *                             posés » en cartes numérotées
 *   3. Notre réponse          « 02 · Notre réponse », bento dont la première
 *                             carte est le panneau sombre
 *   4. Le déroulé             « 03 · Étape par étape », rail d'étapes
 *   5. Le dispositif          « 04 · Fiche mission », photo + tableau
 *   6. Le résultat            « 05 · Résultat », panneau sombre à coches
 *   7. Complément             carte en verre à deux blocs
 *   8. Votre besoin           question, prose, tuiles (Danone), formulaire
 *   9. Pour aller plus loin   cartes de maillage
 *
 * LA RÈGLE DU CHANTIER, inchangée : le dessin vient de la capture, le texte
 * vient de la capture MOT POUR MOT, rien ne s'invente. Une section sans donnée
 * ne se rend pas. Les écarts entre les deux pilotes (fiche du héros, tuiles du
 * besoin, sous-texte des objectifs) sont des champs OPTIONNELS : absents, rien
 * de plus n'est rendu.
 *
 * LES PHOTOS NE SONT PAS PORTÉES, et c'est déclaré : la capture sert le logo
 * client, la photo du héros, celle du dispositif et celles des cartes « Pour
 * aller plus loin » par des URL `blob:` qui ne nomment aucun fichier. Poser une
 * photo de la photothèque serait une association inventée (CLAUDE.md §13) : le
 * cadre reste nu, même précédent que `LienPageLiee` du gabarit 03.
 */

/** Une ligne libellé / valeur : fiche du héros, chiffres, fiche mission. */
export interface LignePreuve {
  libelle: string;
  valeur: string;
}

/** Une carte « Les objectifs posés ». Danone n'a que le titre. */
export interface ObjectifPreuve {
  titre: string;
  texte?: string;
}

/** Une carte du bento « Ce que nous avons mis en place » ou du déroulé. */
export interface CartePreuve {
  titre: string;
  texte: string;
}

/** Une coche d'un bloc « Complément » : l'accroche en gras, puis le texte. */
export interface PuceComplement {
  accroche: string;
  texte: string;
}

/**
 * Un bloc de la carte « Complément » : un titre, une prose, ou une liste à
 * coches. Le second bloc des pilotes n'a pas de titre ; huit captures
 * (« Chiffres clés » d'Eiffage et consorts) portent la liste à coches à la
 * place de la prose.
 */
export interface BlocComplementPreuve {
  titre?: string;
  texte?: string;
  puces?: PuceComplement[];
}

/** Une carte « Pour aller plus loin ». Chemin INTERNE, sinon refusée au rendu. */
export interface LienPlusLoin {
  /** Le surtitre orange de la carte : « Étude de cas », « Offre », « Secteur ». */
  surtitre: string;
  titre: string;
  href: string;
}

export interface ContenuPreuve {
  gabarit: "etude-de-cas";

  /** Le nom du client, en capitales orange à côté de la pastille du héros. */
  client: string;
  /**
   * Les paragraphes du héros, sous le H1 (le H1 vient de `pages.titre_h1`).
   * OPTIONNELS : sur `/preuves/bamesa/` et `/preuves/valeo-usines/`, l'unique
   * paragraphe de la capture porte « notamment », interdit du contrat, donc il
   * ne se rend pas et le héros reste sans chapeau (trou déclaré).
   */
  chapeau?: string[];
  /**
   * Le libellé de l'appel à l'action de la page. La capture l'écrit TROIS
   * fois à l'identique : bouton du héros, en-tête du panneau de formulaire,
   * bouton d'envoi. Une seule donnée, trois emplacements.
   */
  bouton: string;
  /** La fiche en incrustation sur la photo du héros (Danone, pas SUEZ). */
  heroFiche?: LignePreuve[];

  /** Les cartes « Chiffres du dispositif ». */
  chiffres?: LignePreuve[];

  /** « 01 · La situation » : H2, prose, objectifs. */
  situationTitre?: string;
  situationProse?: string[];
  objectifs?: ObjectifPreuve[];

  /** « 02 · Notre réponse » : la première carte est le panneau sombre. */
  reponseCartes?: CartePreuve[];

  /** « 03 · Étape par étape ». */
  etapes?: CartePreuve[];

  /** « 04 · Fiche mission » : le tableau. La photo n'est pas nommée, voir en-tête. */
  dispositif?: LignePreuve[];

  /** « 05 · Résultat » : les coches du panneau sombre. */
  resultats?: CartePreuve[];

  /** La carte « Complément », sous le résultat. */
  complement?: BlocComplementPreuve[];

  /** « Votre besoin » : la question en H2, la prose, les tuiles de Danone. */
  besoinTitre?: string;
  besoinProse?: string[];
  besoinTuiles?: CartePreuve[];

  /** « Pour aller plus loin ». */
  plusLoin?: LienPlusLoin[];
}

/**
 * Le contenu est-il celui d'une étude de cas ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a. Même règle que `estOffre`.
 */
export function estPreuve(contenu: unknown): contenu is ContenuPreuve {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuPreuve).gabarit === "etude-de-cas"
  );
}
