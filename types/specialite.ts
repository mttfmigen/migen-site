import type { Section } from "./contenu";
import type { BlocComplementDomaine } from "./domaine";
import type { BlocComplement, ChiffreOffre, LienOffre } from "./offre";

/**
 * Une carte de l'écran « 02 Domaines » (`MigenExpertise.dc.html`, l. 181-199,
 * objet `dm`). Sur les trois captures qui le rendent, la maquette y verse la
 * liste « Les chiffres Migen » du corpus : `b` est le chiffre, `r` la phrase,
 * le nom et le lien sont vides (`href="#"`, titre vide). Le numéro « 01 » se
 * déduit du rang, comme dans la source.
 */
export interface CarteDomaineSpecialite {
  /** `dm.b`, sous le titre : « +200 », « 10 % ». */
  valeur: string;
  /**
   * `dm.r`, la phrase. La maquette l'écrit sur chaque carte mais ne l'AFFICHE
   * que sur la première (`.mgx-dom>*:nth-child(1) .mgx-dr{display:block}`).
   */
  texte?: string;
  /** `dm.bg`, la photo que la capture nomme : `/assets/web/<nom>.jpg`. */
  photo: string;
}

/**
 * Forme du contenu des pages SPÉCIALITÉ, gabarit « 05 Spécialité » de l'index
 * de la maquette (19 pages de troisième niveau :
 * `/expertises/robotique/fanuc/`, `/expertises/automatisme/siemens/`,
 * `/expertises/types-de-maintenance/<type>/`…). Porté le 07/10 contre la
 * RÉFÉRENCE : les rendus figés `maquette/rendu/expertises--robotique--fanuc.html`
 * et `expertises--robotique--abb.html` (15 sections chacune).
 *
 * LE DESSIN EST CELUI DU GABARIT « 09 Domaine », mesuré et non supposé : les
 * squelettes des sections communes des captures `expertises--robotique` (09)
 * et `expertises--robotique--fanuc` (05) sont identiques balise à balise, seuls
 * le texte et les images changent, et les deux écrans fixes (« Secteurs de
 * l'expertise », « Offres du secteur ») sont identiques au caractère près sur
 * les quatre captures comparées. Les champs reprennent donc les formes de
 * `types/offre.ts` et `types/contenu.ts`, comme `types/domaine.ts`.
 *
 * CE QUE LA SPÉCIALITÉ A EN PLUS DU DOMAINE, relevé sur les captures :
 *   · `marquesFamilles`, le rail d'onglets de « Marques maintenues » que rend
 *     la capture d'`/expertises/robotique/abb/` (« Automatisme & électricité
 *     10 » actif, « Robotique ») et que le domaine n'a sur aucune page ;
 *   · « Complément 4 » reste optionnel : `fanuc` et `abb` ne le rendent pas
 *     (15 sections), les pages de domaine le rendent (16).
 *
 * LES 17 AUTRES PAGES, relevées le 08/10 sur leurs captures (14 à 17
 * sections). Elles ne dessinent que deux écrans que les pilotes n'ont pas,
 * tous deux entre la réassurance et la problématique, tous deux optionnels :
 *   · « 02 Domaines » (`domainesTitre`, `domaines`) : conditionnelle,
 *     préventive, prévisionnelle ;
 *   · « Complément 2 » (`complementTypes`) : la longue prose à tableaux de six
 *     types de maintenance.
 * Le reste varie par la DONNÉE seulement : « Complément 4 » (16 pages),
 * « Marques maintenues » absente des 9 types de maintenance, dessin du
 * problème (`variante`), nombre de points, de cartes et de références.
 */
export interface ContenuSpecialite {
  gabarit: "specialite";

  /**
   * Les sections du corpus (probleme, offre, deroule, garanties, preuves,
   * objections, ctaFinal), placées par TYPE aux emplacements de la capture.
   * REQUIS : c'est, avec `gabarit`, ce qui distingue la nouvelle forme.
   */
  sections: Section[];

  /* ------------------------------------------------------------ le héros */

  /** La pastille en verre : « Expertises » sur les captures pilotes. */
  pastille?: string;
  /** Le paragraphe sous le H1. Le H1 vient de `pages.titre_h1`. */
  chapeau?: string;
  /** Les boutons du héros, cible interne ou ancre (`#besoin`). */
  actions?: LienOffre[];
  /** La mention des horaires, sous les boutons et dans la bande d'appel. */
  mention?: string;
  /** L'en-tête du panneau de formulaire du héros. Sans lui, pas de panneau. */
  formulaireHeroTitre?: string;
  /** La pastille du panneau : « Rappel dans l'heure » sur les captures. */
  formulaireHeroMention?: string;
  /** Le libellé du bouton de la bande d'appel et de l'appel final. */
  appelBouton?: string;

  /* ------------------------------------------------------- « 01 Chiffres » */

  /**
   * La carte en verre des chiffres. Les captures pilotes en dessinent trois
   * dont « +200 / Clients industriels accompagnés », que le contrat interdit
   * (CLAUDE.md §9) : ce chiffre-là N'EST PAS dans la donnée, le trou est
   * déclaré dans `verification-specialite.tsx`, et la grille se resserre.
   */
  chiffres?: ChiffreOffre[];

  /* ------------------------------------- « 02 Domaines », « Complément 2 » */

  /** Le H2 de « 02 Domaines » (`p.domainsIntro`) : « Les chiffres Migen ». */
  domainesTitre?: string;
  /** Les cartes de « 02 Domaines ». Sans elles, l'écran n'est pas rendu. */
  domaines?: CarteDomaineSpecialite[];
  /**
   * L'écran « Complément 2 », juste avant la problématique : la carte en verre
   * de « Complément 4 », dont un bloc peut être un TABLEAU. Même clé et même
   * forme que `ContenuDomaine.complementTypes` : un bloc porte UN contenu
   * (texte, puces ou tableau), la maquette en faisant une cellule de grille.
   */
  complementTypes?: BlocComplementDomaine[];

  /* --------------------------------------------- retouches d'emplacements */

  /** La photo de la colonne gauche du problème, identifiée par empreinte.
      `null` ou absente : la capture de la page n'en rend aucune (cas d'abb). */
  problemePhoto?: string | null;
  /** L'écran « Complément 4 ». Absent des pilotes fanuc et abb (15 sections). */
  complementOffre?: BlocComplement[];
  /** La famille de constructeurs de « Marques maintenues » (`robot`, `auto`…). */
  marquesFamille?: string;
  /**
   * Le rail d'onglets de familles au-dessus des tuiles, par leurs clés
   * courtes, la première étant la famille affichée à l'arrivée. Relevé sur la
   * capture d'`/expertises/robotique/abb/` (blocs 938-940 : « Automatisme &
   * électricité 10 » actif, « Robotique »). Absent, pas de rail : la capture
   * de `fanuc` n'en rend aucun.
   */
  marquesFamilles?: string[];
}

/**
 * La page est-elle une spécialité d'expertise ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde ce qu'il y a, pas ce
 * qu'un type déclare. Le tableau `sections` est exigé, comme `estDomaine`,
 * pour qu'un relais incomplet ne monte pas un gabarit vide.
 */
export function estSpecialite(contenu: unknown): contenu is ContenuSpecialite {
  if (!contenu || typeof contenu !== "object") return false;
  const c = contenu as { gabarit?: unknown; sections?: unknown };
  return c.gabarit === "specialite" && Array.isArray(c.sections);
}
