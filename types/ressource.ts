/**
 * Forme du contenu d'une page RESSOURCE, gabarit « isRes » de la maquette
 * (`maquette/accueil-rendu.html`, lignes 6502 à 6800).
 *
 * POURQUOI UN GABARIT DE PLUS. Les 35 pages feuilles de `/ressources/` sont
 * aujourd'hui servies par le gabarit ÉDITORIAL (`types/editorial.ts`), une
 * colonne de lecture avec un sommaire collant. La maquette en dessine tout
 * autre chose : un en-tête de document avec sa pastille de format, la carte de
 * procédure numérotée, le barème en tableau, les petites cartes collantes, et
 * l'appel de fin. Le sommaire n'y figure NULLE PART. Le client a raison de dire
 * que ces pages ne ressemblent pas à sa maquette : elles rendent le bon texte
 * dans le mauvais dessin.
 *
 * LE GABARIT ÉDITORIAL N'EST PAS SUPPRIMÉ pour autant. Il sert encore les 24
 * autres pages éditoriales (métiers, entreprise) et les 6 rayons de
 * `/ressources/`, qui sont des pages de liste et relèvent du gabarit
 * « guides » de la maquette, pas de celui-ci.
 *
 * POURQUOI SI PEU DE CHAMPS, ALORS QUE LA MAQUETTE DESSINE SEPT SECTIONS.
 * Parce que les cinq variantes de corps de la maquette (article, métier,
 * pratique, process, technique) ne sont pas cinq jeux de données : ce sont
 * cinq MOTIFS DE DESSIN appliqués au même corps de texte. La carte numérotée de
 * la variante pratique est une liste ordonnée, le barème de la variante
 * technique est un tableau, le bandeau en lavis de la variante process est un
 * encadré. Or le corpus porte déjà ces trois formes dans `corps`, à la place
 * que son auteur leur a donnée. Les hisser dans des champs séparés aurait
 * réordonné la page du client pour rien, et dupliqué les titres. Le motif est
 * donc choisi par le TYPE DE BLOC, en place, dans `CorpsRessource`.
 *
 * CE QUE LA MAQUETTE DESSINE ET QUE LE CORPUS NE FOURNIT PAS n'existe pas ici,
 * et c'est la règle du projet (voir `types/contenu.ts`) : pas de champ
 * spéculatif, un champ qu'aucune page ne remplit se rendrait vide ou, pire,
 * inciterait à l'inventer. Sont donc absents, et listés comme tels dans le
 * rapport de portage : la référence en chasse fixe (« FP-01 »), la signature
 * (auteur, rôle, date, durée de lecture), l'image d'ouverture, le lien de
 * téléchargement du PDF, la colonne « acteur » et la colonne « taux de
 * passage » des étapes de process, et le panneau de rémunération de la variante
 * métier, que le contrat refuse de toute façon.
 *
 * TOUT EST OPTIONNEL SAUF `gabarit`. Une section sans donnée ne se rend pas du
 * tout : c'est ce que vérifie `scripts/verifie-ressource.tsx`.
 */

import type { Question } from "@/types/contenu";
import type { BlocEditorial } from "@/types/editorial";

/**
 * Une petite carte de la colonne collante.
 *
 * UN SEUL TYPE POUR LES QUATRE MOTIFS de la maquette, qui ne diffèrent que par
 * les champs remplis : « À retenir » (ligne 6540) porte des `points`, « Aller
 * plus loin » (6546) un lien, « Le piège courant » (6659) le lavis orange,
 * « Référence » (6664) un simple texte. Un champ `motif` à déclarer aurait fait
 * porter aux données une décision que leur contenu dit déjà.
 */
export interface CarteRessource {
  /** Surtitre en capitales. Orange, ou orange foncé sur lavis. */
  surtitre: string;
  titre?: string;
  texte?: string;
  points?: string[];
  /**
   * Rend la carte entière cliquable, motif « Aller plus loin ».
   *
   * Chemin INTERNE obligatoire, slash final : une cible externe est refusée au
   * rendu, comme partout ailleurs dans le cocon.
   */
  lienLibelle?: string;
  lienHref?: string;
  /** Carte en lavis orange plutôt qu'en verre. */
  accent?: boolean;
}

export interface ContenuRessource {
  gabarit: "ressource";

  /** La pastille orange de l'en-tête : « Article », « Fiche technique ». */
  categorie?: string;
  /** Le paragraphe sous le H1. Le H1 vient de `pages.titre_h1`. */
  chapeau?: string;

  /**
   * Le bandeau en lavis orange sous l'en-tête, motif de la ligne 6716.
   *
   * C'est la phrase de rappel téléphonique du corpus, la seule mention de délai
   * que le contrat autorise.
   */
  rappel?: string;

  /** Les cartes de la colonne collante (ligne 6538). */
  cartes?: CarteRessource[];

  /**
   * Le corps de la page, tel que le client l'a écrit et dans son ordre.
   *
   * Même type que le gabarit éditorial, et c'est voulu : c'est le même corpus,
   * déjà analysé, déjà relu. Seul le DESSIN change.
   */
  corps?: BlocEditorial[];

  /** La foire aux questions, rendue par le bloc `Objections` déjà porté. */
  questions?: Question[];
}

/**
 * Le contenu est-il celui d'une page ressource ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a. Le test porte sur `gabarit` et non sur la
 * présence de `corps`, parce qu'`estEditorial` teste `blocs` : les deux formes
 * doivent se distinguer sans ambiguïté, quel que soit l'ordre des essais.
 */
export function estRessource(contenu: unknown): contenu is ContenuRessource {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuRessource).gabarit === "ressource"
  );
}
