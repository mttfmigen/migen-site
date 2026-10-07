import type { Section } from "./contenu";
import type { BlocComplement, ChiffreOffre, LienOffre } from "./offre";

/**
 * Forme du contenu des pages DOMAINE, gabarit « 09 Domaine » de l'index de la
 * maquette (11 pages `/expertises/<domaine>/`), porté le 07/10 contre la
 * RÉFÉRENCE : le rendu figé `maquette/rendu/expertises--robotique.html` et
 * `expertises--automatisme.html` (16 sections chacune).
 *
 * POURQUOI UN NOUVEAU TYPE alors que `types/metier.ts` porte déjà un gabarit
 * « domaine » : l'ancien (chapeau, traitements, autres) vient du gabarit à
 * trois sections de l'export de démonstration, qui n'est le gabarit d'aucune
 * page (CLAUDE.md §16). La capture actuelle en dessine seize, celles du
 * gabarit offre plus trois écrans propres. Même précédent que
 * `ContenuFicheMetier` face à l'ancien « metier » : la NOUVELLE forme se
 * reconnaît à son tableau `sections`, et la route la teste AVANT
 * `estMetierOuDomaine`, si bien que les neuf pages encore sur l'ancienne forme
 * ne bougent pas tant que leur fichier n'est pas reporté.
 *
 * LES FORMES DE CHAMPS SONT CELLES DU GABARIT OFFRE (`types/offre.ts`,
 * `types/contenu.ts`) : la capture du domaine rend les MÊMES écrans (héros à
 * panneau de formulaire, chiffres, problème, offre, déroulé, garanties,
 * références, questions, appel final), et les composants de
 * `components/site/offre/` les rendent déjà au pixel. Redéclarer ces formes
 * aurait dédoublé dix types pour rien. Les trois écrans PROPRES au domaine
 * (« Secteurs de l'expertise », « Offres du secteur », et la FAQ sans carte
 * sombre) ont leurs composants dans `components/site/expertises/domaine/`,
 * et leur copie est FIXE : identique au caractère près sur les 11 captures
 * (vérifié par empreinte MD5 le 07/10), elle vit donc dans le gabarit, pas
 * dans la donnée.
 */
export interface ContenuDomaine {
  gabarit: "domaine";

  /**
   * Les sections du corpus (probleme, offre, deroule, garanties, preuves,
   * objections, ctaFinal), placées par TYPE aux emplacements de la capture.
   *
   * REQUIS, et c'est le discriminant : l'ancienne forme « domaine » de
   * `types/metier.ts` n'en a pas, la nouvelle en a toujours.
   */
  sections: Section[];

  /* ------------------------------------------------------------ le héros */

  /** La pastille en verre : « Expertises » sur les deux captures pilotes. */
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
  /** Le libellé du bouton des bandes d'appel et de l'appel final. */
  appelBouton?: string;

  /* ------------------------------------------------------- « 01 Chiffres » */

  /**
   * La carte en verre des chiffres. La capture de `/expertises/robotique/` en
   * dessine trois dont « +200 », que le contrat interdit : ce chiffre-là
   * N'EST PAS dans la donnée et le trou est déclaré, la grille se resserre.
   */
  chiffres?: ChiffreOffre[];

  /* --------------------------------------------- retouches d'emplacements */

  /** La photo de la colonne gauche du problème, identifiée par empreinte. */
  problemePhoto?: string | null;
  /** L'écran « Complément 4 », entre la bande d'appel et le déroulé. */
  complementOffre?: BlocComplement[];
  /** La famille de constructeurs de « Marques maintenues » (`robot`, `auto`…). */
  marquesFamille?: string;
}

/**
 * La page est-elle un domaine d'expertise de la NOUVELLE forme ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown`. Le tableau `sections` sépare la
 * nouvelle forme de l'ancienne : sans lui, la page reste servie par
 * `estMetierOuDomaine` et l'ancien composant, exactement comme `estMetier`
 * sépare la fiche métier du gabarit 07 de l'ancienne page métier.
 */
export function estDomaine(contenu: unknown): contenu is ContenuDomaine {
  if (!contenu || typeof contenu !== "object") return false;
  const c = contenu as { gabarit?: unknown; sections?: unknown };
  return c.gabarit === "domaine" && Array.isArray(c.sections);
}
