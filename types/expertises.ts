/**
 * Forme du contenu d'une page EXPERTISES, troisième gabarit de `pages.contenu`.
 *
 * TROIS GABARITS COHABITENT DANS LA MÊME COLONNE :
 *
 *   · VENTE (`types/contenu.ts`) : dix sections nommées, porte `sections`.
 *   · ÉDITORIAL (`types/editorial.ts`) : blocs suivis, porte `gabarit: "editorial"`.
 *   · EXPERTISES (ici) : porte `gabarit: "expertises"`.
 *
 * POURQUOI UN TROISIÈME. La maquette donne à `/expertises/` une mise en page
 * qui n'est ni l'une ni l'autre : un héros à deux colonnes avec sa carte de
 * cumul, six natures d'intervention en cartes dont une sombre, une répartition
 * d'heures en barres animées, neuf domaines, les spécialisations constructeur
 * en panneau, neuf secteurs, les habilitations, le formulaire. Pliée au gabarit
 * de vente, cette page perdait sa carte de cumul, ses barres et ses neuf
 * domaines, et affichait à la place des sections vides. C'est ce que le client
 * a vu : « les pages expertise ne sont pas les mêmes ».
 *
 * CHAQUE SECTION EST OPTIONNELLE, et c'est la règle qui fait tenir les 31 URL
 * de la branche : `/expertises/` porte les huit sections, une page fille n'en
 * porte que celles que son corpus fournit. Ce qui manque ne se rend pas. Rien
 * n'est inventé, rien n'est rendu à moitié.
 *
 * LE H1 N'EST PAS ICI. Il vient de `pages.titre_h1`, comme pour les deux autres
 * gabarits : un seul endroit pour le titre, donc jamais deux H1 sur une page.
 */

/** En-tête commun à presque toutes les sections : surtitre orange, H2, note à droite. */
export interface EnTeteSection {
  /** Capitales orange au-dessus du titre. */
  surtitre: string;
  titre: string;
  /** La phrase en petit, alignée à droite du titre. Absente, rien ne s'affiche. */
  note?: string;
}

/**
 * Un bouton du héros.
 *
 * `href` est un chemin interne ou une ancre. La maquette pilotait ces boutons
 * par verbes de navigation (`onClick="{{ goContact }}"`), qui ne se portent pas :
 * un lien sans cible connue ne se rend pas du tout, plutôt que de mener à `#`.
 */
export interface ActionExpertises {
  libelle: string;
  href: string;
  /** Orange plein pour la principale, verre pour la seconde. */
  principale?: boolean;
}

/** Une ligne de la carte « Le cumul rare » : un chiffre, ce qu'il couvre. */
export interface LigneCumul {
  /** « 6 », « 100 % ». Tel que le corpus l'écrit, espace insécable comprise. */
  valeur: string;
  texte: string;
}

/** Une nature d'intervention. */
export interface CarteType {
  titre: string;
  /** La pastille en capitales : « Planifiée », « Urgence ». */
  etiquette: string;
  texte: string;
  puces: string[];
  /** La ligne en pied de carte, séparée par un filet. */
  pied?: string;
  /** Carte en panneau sombre. La maquette la réserve au curatif. */
  accent?: boolean;
}

/** Une barre de répartition. `valeur` est un pourcentage entier, 0 à 100. */
export interface BarreHeures {
  libelle: string;
  valeur: number;
}

/** Un jeu de barres : l'état à la reprise, puis le même site plus tard. */
export interface JeuBarres {
  legende: string;
  barres: BarreHeures[];
  /** Jeu mis en avant : légende, chiffres et barres passent en orange. */
  accent?: boolean;
}

export interface SectionDosage {
  entete: EnTeteSection;
  /** Les deux paragraphes de gauche. */
  paragraphes: string[];
  repartition?: {
    titre: string;
    /** « À l'arrivée, après 12 mois », en capitales discrètes. */
    periode?: string;
    jeux: JeuBarres[];
    note?: string;
  };
}

/** Un domaine technique. `href` absent : la carte se rend sans son lien. */
export interface CarteDomaine {
  titre: string;
  /** « Alignement · Vibratoire », en capitales orange. */
  etiquette: string;
  texte: string;
  href?: string;
}

/** Une plateforme constructeur et les outils maîtrisés. */
export interface LigneConstructeur {
  nom: string;
  outils: string;
}

export interface SectionConstructeurs {
  entete: EnTeteSection;
  texte: string;
  lignes: LigneConstructeur[];
  /** Le visuel de droite, servi depuis `public/`. Absent, la colonne disparaît. */
  image?: { src: string; alt: string };
}

/** Un secteur. `href` absent : la carte n'est pas cliquable. */
export interface CarteSecteur {
  titre: string;
  texte: string;
  href?: string;
}

/** Une habilitation. `accent` pour la carte orange, MASE et EcoVadis. */
export interface CarteHabilitation {
  titre: string;
  texte: string;
  accent?: boolean;
}

export interface SectionHabilitations {
  entete: EnTeteSection;
  texte: string;
  cartes: CarteHabilitation[];
}

export interface ContenuExpertises {
  gabarit: "expertises";
  /** Capitales orange au-dessus du H1. */
  surtitre?: string;
  /** Le paragraphe d'introduction, sous le H1. */
  chapeau?: string;
  /** Les boutons du héros. La maquette en pose deux. */
  actions?: ActionExpertises[];
  /** La carte de droite du héros. */
  cumul?: { titre: string; lignes: LigneCumul[] };
  types?: { entete: EnTeteSection; cartes: CarteType[] };
  dosage?: SectionDosage;
  domaines?: {
    entete: EnTeteSection;
    cartes: CarteDomaine[];
    /** Libellé du lien de chaque carte. Un seul pour toutes, comme la maquette. */
    lienLibelle?: string;
  };
  constructeurs?: SectionConstructeurs;
  secteurs?: { entete: EnTeteSection; cartes: CarteSecteur[] };
  habilitations?: SectionHabilitations;
  /** L'habillage du formulaire de bas de page, propre à la branche. */
  formulaire?: { titre: string; intro: string };
}

/**
 * Le contenu est-il celui d'une page expertises ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on se fie au champ discriminant
 * et à rien d'autre. `estEditorial` regarde `blocs`, que cette forme n'a pas :
 * les deux gardes ne peuvent pas se marcher dessus.
 */
export function estExpertises(contenu: unknown): contenu is ContenuExpertises {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuExpertises).gabarit === "expertises"
  );
}
