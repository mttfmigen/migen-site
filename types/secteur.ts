/**
 * Forme du contenu des pages SECTEUR, gabarit « 08 Secteur » de l'index de la
 * maquette (12 pages `/secteurs/<secteur>/`), porté le 08/10 contre la
 * RÉFÉRENCE : le rendu figé `maquette/rendu/secteurs--<secteur>.html`.
 *
 * DEUX FORMES COHABITENT SOUS LE MÊME DISCRIMINANT `gabarit: "secteur"`.
 *
 *  1. `ContenuSecteurOffre`, LA FORME SERVIE. La capture d'une page de secteur
 *     porte la suite d'écrans d'une OFFRE (héros à formulaire, chiffres, logos,
 *     réassurance, problème, offre, bandes d'appel, déroulé, garanties,
 *     références, questions, appel final) plus trois écrans propres :
 *     la grille des logos du secteur dans « 02 Logos », « Expertises du
 *     secteur » et « Offres du secteur ». Ses champs sont donc ceux de
 *     `ContenuOffre` (mêmes composants, `components/site/offre/`), plus ces
 *     trois-là. Elle se reconnaît à son tableau `sections`, exactement comme
 *     `estDomaine` sépare la nouvelle forme du domaine de l'ancienne.
 *
 *  2. `ContenuSecteur`, L'ANCIENNE FORME (héros à repères, enjeux, communes,
 *     pastilles, appel), tirée du bloc `isSecteur` de l'export de démonstration
 *     qui n'est le gabarit d'aucune page (CLAUDE.md §16). Aucune page n'est plus
 *     servie sous elle ; elle reste parce que `types/implantation.ts`
 *     (`ContenuDepartement`) et `components/site/implantation/PageDepartement.tsx`,
 *     hors service eux aussi mais hors de ce périmètre, s'en servent encore. Elle
 *     part avec eux.
 *
 * AUCUNE VALEUR PAR DÉFAUT N'EST INVENTÉE : un écran sans sa donnée ne se rend
 * pas.
 */

import type { Section } from "./contenu";
import type { ContenuOffre } from "./offre";

/* =========================================================== la forme servie */

/** Un logo de la grille du secteur, dans « 02 Logos ». */
export interface LogoSecteur {
  /** Le nom du client, en `alt`. */
  nom: string;
  /**
   * Le fichier, dans `public/assets/clients/`, aux mêmes octets que celui que
   * sert la maquette vivante (empreinte SHA-1, relevé du 08/10).
   */
  src: string;
  /** Le filtre de la capture pour les logos clairs (« invert(1) hue-rotate(180deg) »). */
  filtre?: string;
}

/** Une carte photographique de « Expertises du secteur ». */
export interface CarteExpertiseSecteur {
  titre: string;
  texte: string;
  /** La page du domaine d'expertise, chemin interne. */
  href: string;
  /** La photo de fond, dans `public/assets/web/`, nommée par la capture. */
  photo: string;
}

/**
 * Les champs de l'offre que la capture d'une page de secteur rend. Repris de
 * `ContenuOffre` plutôt que redéclarés : ce sont les mêmes écrans, rendus par
 * les mêmes composants.
 */
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
  | "complementOffre"
  | "derouleTitre"
  | "brefBande"
  | "brefBouton"
  | "brefMention"
  | "marquesFamille"
  | "marquesFamilles"
>;

export interface ContenuSecteurOffre extends ChampsOffre {
  gabarit: "secteur";

  /**
   * Les sections du corpus (probleme, offre, deroule, garanties, preuves,
   * objections, ctaFinal), placées par TYPE aux emplacements de la capture.
   * REQUIS, et c'est ce qui distingue cette forme de l'ancienne.
   */
  sections: Section[];

  /** « 02 Logos » : le titre de la grille du secteur, puis ses logos. */
  logosTitre?: string;
  logos?: LogoSecteur[];

  /**
   * « Expertises du secteur » : H2, chapeau, cartes. Les DEUX écrans
   * « Expertises du secteur » et « Offres du secteur » vont ensemble : les dix
   * captures qui portent l'un portent l'autre, les deux pages de logistique
   * (convoyeur, peak season) n'en portent aucun. « Offres du secteur » a une
   * copie FIXE (identique au caractère près aux onze captures du gabarit 09) :
   * il se rend donc quand ces cartes existent, sans champ de plus.
   */
  expertisesTitre?: string;
  expertisesChapeau?: string;
  expertises?: CarteExpertiseSecteur[];
}

/* ====================================================== l'ancienne forme */

/** Une pastille cliquable : page sœur du même niveau. */
export interface LienSecteur {
  libelle: string;
  /** Chemin INTERNE, slash final. Une cible externe est refusée au rendu. */
  href: string;
}

/** Un repère chiffré du héros : « 14 » / « sites agroalimentaires suivis ». */
export interface RepereSecteur {
  valeur: string;
  libelle: string;
}

/** Une contrainte du terrain, carte en verre de la section des enjeux. */
export interface EnjeuSecteur {
  titre: string;
  texte: string;
}

/** L'ANCIENNE forme, voir l'en-tête. Rendue par `PageSecteurHistorique`. */
export interface ContenuSecteur {
  gabarit: "secteur";
  surtitre?: string;
  chapeau?: string;
  actions?: LienSecteur[];
  reperesSurtitre?: string;
  reperes?: RepereSecteur[];
  enjeuxSurtitre?: string;
  enjeuxTitre?: string;
  enjeux?: EnjeuSecteur[];
  communesSurtitre?: string;
  communesTitre?: string;
  communes?: string[];
  autresSurtitre?: string;
  autres?: LienSecteur[];
  appelTitre?: string;
  appelTexte?: string;
  /** Sans cible fournie, l'appel vise l'ancre du formulaire de la page. */
  appelBouton?: LienSecteur;
  /** Le texte du corpus rendu sous le gabarit, par les blocs de vente. */
  complement?: Section[];
}

/* ============================================================ les gardes */

/** L'une ou l'autre forme, telle que la route la reçoit. */
export type ContenuPageSecteur = ContenuSecteurOffre | ContenuSecteur;

/**
 * Le contenu est-il celui d'une page secteur, d'une forme ou de l'autre ?
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde ce qu'il y a.
 */
export function estSecteur(contenu: unknown): contenu is ContenuPageSecteur {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as { gabarit?: unknown }).gabarit === "secteur"
  );
}

/** La forme servie, au dessin de la capture : elle porte `sections`. */
export function estSecteurOffre(contenu: ContenuPageSecteur): contenu is ContenuSecteurOffre {
  return Array.isArray((contenu as { sections?: unknown }).sections);
}
