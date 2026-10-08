/**
 * Forme du contenu d'une page ÉDITORIALE, second gabarit de `pages.contenu`.
 *
 * DEUX GABARITS COHABITENT DANS LA MÊME COLONNE, et c'est assumé :
 *
 *   · le gabarit de VENTE (`types/contenu.ts`) : dix sections nommées, pour les
 *     126 pages qui vendent une offre. Son contenu porte `sections`.
 *   · le gabarit ÉDITORIAL (ici) : pour les 59 pages qui expliquent, listent ou
 *     racontent. Les métiers, les hubs de ressources, l'entreprise. Son contenu
 *     porte `blocs` et un champ `gabarit: "editorial"`.
 *
 * POURQUOI PAS UNE SEULE FORME : le gabarit de vente tire sa force de son ordre
 * imposé, une section par rôle commercial. Une page « Électromécanicien : fiche
 * métier » n'a ni punchline, ni duo prestation-bénéfice, ni garanties. La plier
 * de force au gabarit de vente produirait des sections vides, et le corpus ne
 * les fournit pas. Deux formes honnêtes valent mieux qu'une forme qui ment.
 *
 * La route `app/[...slug]/page.tsx` tranche sur la présence de `blocs`.
 *
 * AJOUT DU 08/10 : les huit pages de `/ressources/` et `/guides/` portées
 * contre leurs captures gardent ce discriminant (`blocs` vide) et ajoutent
 * leur vue, `edito` ou `rubrique`. La route les sert donc sans nouvelle
 * branche, et `PageEditoriale` choisit le dessin.
 */

import type { Paragraphe, Tableau } from "@/types/contenu";

export type BlocEditorial =
  /**
   * Un titre du corps. Jamais de niveau 1 : le H1 est porté par
   * `pages.titre_h1`, et deux H1 sur une page sont une faute de structure que
   * Google comme les lecteurs d'écran relèvent. L'`id` sert d'ancre.
   */
  | { type: "titre"; niveau: 2 | 3; texte: string; id: string }
  | ({ type: "paragraphe" } & Paragraphe)
  | { type: "liste"; ordonnee?: boolean; items: Paragraphe[] }
  | ({ type: "tableau" } & Tableau)
  /** L'encadré du corpus, écrit en citation Markdown. Un numéro, un rappel. */
  | { type: "citation"; texte: string };

export interface ContenuEditorial {
  gabarit: "editorial";
  /** Le premier paragraphe après le titre. Dit ce que la page couvre. */
  chapeau?: string;
  blocs: BlocEditorial[];
  /**
   * Le dessin de la maquette, quand la page a été portée contre sa capture.
   * Une seule des deux vues à la fois ; sans elles, la page garde la colonne
   * de lecture d'origine (métiers, entreprise).
   */
  edito?: VueGuide;
  rubrique?: VueRubrique;
}

/*
 * LES DEUX VUES DE LA MAQUETTE, transcrites mot pour mot de leurs captures
 * (`maquette/rendu/<clé>.html`). Tout texte en ligne porte le balisage du
 * corpus, `**gras**` et `[libellé](/chemin/)`, rendu par `TexteRiche`.
 *
 * VUE « GUIDE » : le gabarit générique édito de `Migen - Site final.dc.html`
 * (`cEdito`), qui sert `/ressources/` et les deux guides. Ses blocs portent
 * les noms des motifs de la maquette (`cxBlock`, `cxBento`) : la maquette
 * choisit le motif par une règle de longueur, la donnée garde son verdict.
 */
export type BlocGuide =
  | { type: "p" | "h3" | "citation" | "appel"; texte: string }
  /** Liste cochée ; `ul2` : la même en panneau de verre sur deux colonnes. */
  | { type: "ul" | "ul2"; items: string[] }
  /** Cartes de verre (`isCards`) ou lignes titrées (`isRows`). */
  | { type: "cartes" | "lignes"; items: { titre: string; texte: string }[] }
  /** Gros numéros en cartes (`isOl`) ou étapes reliées par un rail (`isOlRows`). */
  | { type: "numeros" | "etapes"; items: { titre?: string; texte: string }[] }
  | {
      type: "bento";
      colonnes: number;
      items: { titre: string; texte: string; href?: string }[];
    }
  | { type: "photo"; image: string }
  | { type: "tableau"; entetes: string[]; lignes: string[][] }
  | { type: "duo"; lignes: string[][] }
  /** Question de FAQ ; la capture rend sa réponse en paragraphe à la suite. */
  | { type: "question"; question: string }
  | { type: "lienCarte"; titre: string; href: string }
  /** Le panneau sombre « Vous préférez qu'on s'en occupe ? », copie fixe. */
  | { type: "panneau" }
  /** Le dépliant « Lire la suite ». */
  | { type: "suite"; blocs: BlocGuide[] };

export interface VueGuide {
  /** Les deux pastilles du héros : « Guide », « 11 min de lecture ». */
  format: string;
  lecture: string;
  /** Le fil d'Ariane de la capture ; le dernier maillon n'a pas de lien. */
  ariane: { label: string; href?: string }[];
  chapeau: string;
  intro: BlocGuide[];
  sections: { titre: string; blocs: BlocGuide[] }[];
  /** « Pages liées » : famille, titre, cible. */
  liees: { famille: string; titre: string; href: string }[];
  /** Identifiant d'analyse du formulaire `#cx-form`, repris par HubSpot. */
  formulaire: string;
}

/*
 * VUE « RUBRIQUE » : `MigenRessource.dc.html` en mode hub, les cinq
 * sous-rubriques de `/ressources/`.
 */
export type BlocRayon =
  | { type: "p" | "citation"; texte: string }
  | { type: "ul" | "ol"; items: string[] }
  /** Tableau sans en-tête : la maquette ne rend que les lignes. */
  | { type: "tableau"; lignes: string[][] };

/** Une fiche du catalogue, relue dans `maquette/contenu/site/index.json`. */
export interface CarteCatalogue {
  href: string;
  titre: string;
  /** Le `title` de l'index : la recherche de la maquette le lit aussi. */
  recherche: string;
  format: string;
  minutes: number;
  /** Ordre de la maquette : les plus longues d'abord. */
  mots: number;
  image: string;
}

export interface VueRubrique {
  /** Le segment d'URL : « fiches-pratiques ». */
  rayon: string;
  /** Pastille, dernier maillon du fil : « Fiches pratiques ». */
  court: string;
  ariane: { label: string; href: string }[];
  chapo: string[];
  image: string;
  chiffres: { valeur: string; libelle: string }[];
  /** Les filtres, « Tout » compris ; leur compte se déduit du catalogue. */
  categories: { rayon: string; libelle: string }[];
  guide: { titre: string; blocs: BlocRayon[] }[];
  questions: { question: string; reponse: string }[];
  /** Les 35 fiches : la maquette filtre tout le catalogue depuis chaque rayon. */
  catalogue: CarteCatalogue[];
}

/**
 * Le contenu est-il éditorial ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type déclaré,
 * on regarde ce qu'il y a.
 */
export function estEditorial(contenu: unknown): contenu is ContenuEditorial {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    Array.isArray((contenu as ContenuEditorial).blocs)
  );
}
