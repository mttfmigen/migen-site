/**
 * Forme du contenu d'une page RESSOURCE, gabarit « 01 Article et fiche » :
 * les 35 pages `/ressources/<rayon>/<page>/`.
 *
 * LA RÉFÉRENCE est le rendu de la maquette autonome, figé dans
 * `maquette/rendu/ressources--<rayon>--<page>.html`, et le gabarit qui le
 * produit, `MigenRessource.dc.html` (identique dans le paquet du client et dans
 * l'autonome). L'ancienne version de ce type était portée contre l'écran
 * « isRes » de `accueil-rendu.html`, qui n'est le gabarit d'aucune page : même
 * erreur que celle qui a coûté la journée du 05/10 sur les offres.
 *
 * CINQ SECTIONS, dans cet ordre : héros (fil, pastille, H1, chapo, signature,
 * photo ou carte du livre blanc), corps (sommaire collant, parties numérotées,
 * bande d'appel après la deuxième partie), questions fréquentes sur photo,
 * « Sur le même sujet », appel final.
 *
 * LA DONNÉE EST CELLE QUE LA MAQUETTE CALCULE, pas une interprétation :
 * `maquette-ressource.ts` porte ses règles (découpage du texte, minutes de
 * lecture, photo, trois lectures liées) et sait produire chaque fichier. Le
 * contrôle `verification-ressource.tsx` compare ensuite le rendu à la capture,
 * section par section, mot pour mot.
 *
 * Le texte « en ligne » garde la syntaxe de la maquette : `**gras**`,
 * `[libellé](/chemin/)` et `**[libellé](/chemin/)**`, rien d'autre. Un chemin
 * non interne est rendu en texte, sans lien.
 */

import type { Question } from "@/types/contenu";

/** Le deuxième segment de l'URL. Il donne la pastille et le fil d'Ariane. */
export type RayonRessource =
  | "articles"
  | "fiches-pratiques"
  | "fiches-techniques"
  | "livres-blancs"
  | "process";

/** Un bloc du corps, dans l'un des six motifs de `blocks()` de la maquette. */
export type BlocRessource =
  /** Prose, texte en ligne. */
  | { type: "paragraphe"; texte: string }
  /** Ligne `### ` du texte, texte brut. */
  | { type: "intertitre"; texte: string }
  /** Carte blanche à coches orange, texte en ligne par entrée. */
  | { type: "puces"; items: string[] }
  /** Pastilles orange numérotées 01, 02…, texte en ligne par étape. */
  | { type: "etapes"; items: string[] }
  /** Tableau en carte blanche, cellules en texte brut. */
  | { type: "tableau"; entetes: string[]; lignes: string[][] }
  /** Encadré en lavis orange (une citation `> ` du texte), texte en ligne. */
  | { type: "encadre"; texte: string };

/** Une partie `## ` du texte : une entrée de sommaire, un H2 numéroté. */
export interface PartieRessource {
  titre: string;
  blocs: BlocRessource[];
}

/** Une carte de « Sur le même sujet ». */
export interface LectureRessource {
  href: string;
  titre: string;
  minutes: number;
  /** Chemin public de la photo, `/assets/web/<nom>.jpg`. */
  image: string;
}

export interface ContenuRessource {
  gabarit: "ressource";
  /** Toujours rempli dans les fichiers (le contrôle l'exige) ; optionnel pour
   *  qu'un contenu réduit à son gabarit reste rendable : titre et appel seuls. */
  rayon?: RayonRessource;
  /** Les deux premiers paragraphes du texte, sous le H1. Texte en ligne. */
  chapo?: string[];
  /** « N min de lecture » de la signature. */
  minutes?: number;
  /**
   * La photo du héros. Absente sur un livre blanc : la maquette y pose la carte
   * de téléchargement à la place.
   */
  image?: string;
  /** Les blocs d'introduction qui ne sont pas le chapo, avant la partie 01. */
  avant?: BlocRessource[];
  parties?: PartieRessource[];
  questions?: Question[];
  aLire?: LectureRessource[];
}

/**
 * Le contenu est-il celui d'une page ressource ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde ce qu'il y a. Le test
 * porte sur `gabarit` et non sur un champ, parce qu'`estEditorial` teste
 * `blocs` : les formes doivent se distinguer quel que soit l'ordre des essais.
 */
export function estRessource(contenu: unknown): contenu is ContenuRessource {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuRessource).gabarit === "ressource"
  );
}
