import type {
  Chiffre,
  Etape,
  Paragraphe,
  PrestationBenefice,
  Preuve,
  Question,
} from "./contenu";
import type { BlocEditorial } from "./editorial";

/**
 * Forme du contenu des pages de RUBRIQUE, et de leurs SOUS-RUBRIQUES.
 *
 * DEUX FICHIERS DE MAQUETTE FONT FOI, et aucun des deux n'est « Site final » :
 *
 *   · `maquette/gabarit-10-hub-de-rubrique.html` : douze sections, pour une page
 *     qui ouvre une rubrique et distribue vers ses pages filles. Discriminant
 *     `gabarit: "hub"`.
 *   · `maquette/gabarit-11-sous-rubrique.html` : un héros, puis le corps du
 *     corpus en sections numérotées à titre collant, une FAQ, les pages liées.
 *     Discriminant `gabarit: "sousRubrique"`.
 *
 * CE QUI DÉCIDE LEQUEL S'APPLIQUE : la FORME DU CORPUS, jamais le chemin.
 * `/offres/`, `/secteurs/`, `/travaux-industriels/`, `/bureau-etudes/` et les
 * deux sous-pages de `/offres/residence/` portent les dix sections nommées du
 * corpus de vente, que le gabarit 10 dessine une par une. `/ressources/`, ses
 * cinq rayons et `/carriere/` portent un corps suivi en blocs, que seul le
 * gabarit 11 sait rendre. Plier l'un au dessin de l'autre obligerait à inventer
 * les champs manquants : c'est exactement ce que le client refuse.
 *
 * LE TEXTE VIENT DU CORPUS, LE DESSIN DE LA MAQUETTE. Aucun champ ici n'existe
 * pour une raison d'habillage. Ce que la maquette dessine et que le corpus
 * n'écrit pas est absent de ces types, volontairement, et la liste est tenue
 * dans `components/site/hub/verification-hub.tsx` :
 *
 *   · les VISUELS, partout. Le corpus ne porte aucune image : la photo pleine
 *     largeur de la section 02, la photo du déroulé, la vignette de chaque
 *     carte de maillage et de chaque référence restent vides.
 *   · la section RÉASSURANCE du gabarit 10 (MASE, EcoVadis, « 10 % », les
 *     quatre agences, les dix hubs) est écrite EN DUR dans la maquette, et le
 *     corpus de ces pages porte déjà les mêmes faits dans ses garanties et ses
 *     questions. La rendre une seconde fois dupliquerait la copie.
 *   · la NOTE sous le tableau de l'offre : le corpus de ces pages n'écrit
 *     aucune phrase après ses lignes prestation / bénéfice.
 *   · le COMPTEUR de cartes du héros de sous-rubrique, sur les pages dont le
 *     corpus liste ses pages filles en tableau et non en cartes.
 *   · le BANDEAU D'APPEL final du gabarit 11 : son bouton n'a de libellé que
 *     dans la maquette, et `pages.cta_type` vaut `devis` sur toute la famille,
 *     donc n'en fournit aucun. Le formulaire de bas de page ferme la page, comme
 *     sur tous les autres gabarits du projet.
 *
 * LE H1 N'EST PAS ICI. Il vient de `pages.titre_h1`, comme pour tous les autres
 * gabarits : un seul endroit pour le titre, donc jamais deux H1 sur une page.
 */

/** Une carte de maillage : le lien du corpus, et la phrase qui le portait. */
export interface LienRubrique {
  titre: string;
  /** Chemin interne, tel que le corpus l'écrit. Jamais `#`. */
  url: string;
  /** La phrase du corpus où le lien apparaissait. Absente, la carte est nue. */
  extrait?: string;
  /** « Offre », « Ressource », « Secteur » : la nature de la cible, lue de l'URL. */
  nature?: string;
}

/** Un appel à l'action du corpus. Le bouton vise l'ancre du formulaire. */
export interface AppelHub {
  question: string;
  bouton: string;
  /** La phrase de rappel téléphonique, entière. */
  rappel?: string;
}

/** Gabarit 10 : la page qui ouvre une rubrique. */
export interface ContenuHub {
  gabarit: "hub";
  /** `heros.mecanisme` : comment le résultat est obtenu. */
  chapeau?: string;
  /** `heros.cta` : le libellé du bouton principal, répété dans l'en-tête. */
  cta?: string;
  telephone?: string;
  /** `heros.phraseDelai`, normalisée : aucun délai chiffré hors « dans l'heure ». */
  phraseDelai?: string;
  /** `chiffres.chiffres`, rendus dans la carte « En bref » du héros. */
  enBref?: Chiffre[];
  /**
   * Les noms de clients du bandeau « Ils nous font confiance ».
   *
   * Ce sont ceux des réalisations de la page, lus dans le libellé de leur lien,
   * comme la maquette les lit : « Étude de cas VEEPEE : sites de Lyon » donne
   * « VEEPEE ». Aucun nom ne s'ajoute, aucun logo n'existe dans le corpus.
   */
  clients?: string[];
  /** Première phrase de `probleme.punchline`. Sert de H2 à la section 03. */
  punchTitre?: string;
  /** Le reste de la punchline. */
  punchTexte?: string;
  problemes?: Paragraphe[];
  offre?: PrestationBenefice[];
  liens?: LienRubrique[];
  etapes?: Etape[];
  garanties?: Paragraphe[];
  appel?: AppelHub;
  preuves?: Preuve[];
  questions?: Question[];
  final?: AppelHub;
}

/** Une section du corps d'une sous-rubrique : un titre de niveau 2 du corpus. */
export interface SectionSousRubrique {
  /** Ancre, reprise de l'`id` que le corpus donne à son titre. */
  id: string;
  /** « 01 », « 02 » : le rang de la section, en surtitre. */
  numero: string;
  /** Vide pour les blocs qui précèdent le premier titre. */
  titre: string;
  blocs: BlocEditorial[];
}

/** La FAQ d'une sous-rubrique, extraite de sa section « Questions fréquentes ». */
export interface FaqSousRubrique {
  titre: string;
  /** Les blocs de la section avant la première question. */
  intro: BlocEditorial[];
  questions: Question[];
}

/** Gabarit 11 : une sous-rubrique, ou une rubrique dont le corpus est suivi. */
export interface ContenuSousRubrique {
  gabarit: "sousRubrique";
  /** La pastille du héros : le nom de la rubrique, tel que la barre de navigation l'écrit. */
  pastille?: string;
  /** Les paragraphes d'ouverture, avant le premier titre du corpus. */
  chapeau?: Paragraphe[];
  /**
   * Le nombre de pages filles que le corpus liste en cartes.
   *
   * La maquette l'affiche suivi de « ressources dans cette rubrique », en dur.
   * Ce compteur n'est donc posé que sous `/ressources/`, où cette phrase est
   * vraie : ailleurs, elle nommerait « ressources » des pages de carrière. Et il
   * n'est posé que si le corpus liste bien ses pages filles en cartes : la
   * moitié des rayons les liste en tableau, et la maquette ne compte que les
   * cartes.
   */
  compteur?: number;
  corps: SectionSousRubrique[];
  faq?: FaqSousRubrique;
  liens?: LienRubrique[];
}

/**
 * Le contenu est-il celui d'une page de rubrique ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type déclaré,
 * on regarde ce qu'il y a.
 */
export function estHub(contenu: unknown): contenu is ContenuHub {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuHub).gabarit === "hub"
  );
}

/**
 * Le contenu est-il celui d'une sous-rubrique ?
 *
 * CE GARDE DOIT PASSER AVANT `estEditorial`, qui ne regarde que la présence
 * d'un tableau `blocs` : une sous-rubrique en porte un dans chaque section de
 * son corps, et serait servie en colonne de lecture si l'éditorial tranchait
 * d'abord.
 */
export function estSousRubrique(
  contenu: unknown,
): contenu is ContenuSousRubrique {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuSousRubrique).gabarit === "sousRubrique"
  );
}
