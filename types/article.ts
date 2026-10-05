/**
 * Forme du contenu d'un article, et donc du jsonb `articles.contenu`.
 *
 * Portée de `maquette/gabarit-01-article.html`, le fichier de gabarit dédié du
 * client, écran « Gabarit 01 Article et fiche ». CE FICHIER FAIT FOI : le
 * portage précédent lisait « Migen - Site final.dc.html », qui n'est pas le
 * gabarit de cette famille et qui en montrait une version appauvrie.
 *
 * Le SOMMAIRE N'EST PAS UNE DONNÉE : il se déduit des sections, par leur titre
 * et leur ancre. Le stocker en double garantirait qu'un jour il mente. La
 * NUMÉROTATION non plus : la maquette numérote « 01 », « 02 », sur ce qui se
 * rend, et une section vide ne se rend pas. Numéroter en base aurait donc fait
 * sauter un numéro dès la première section sans donnée.
 *
 * Même règle que pour les pages : aucun champ spéculatif. Ce que le pipeline
 * éditorial ne produit pas n'existe pas ici.
 */

/**
 * Un bloc de corps, dans le motif que la maquette lui donne.
 *
 * Les CINQ formes que le corpus porte, et pas une de plus. La maquette en
 * dessine huit : elle ajoute le titre de niveau 3, la grille de cartes et une
 * variante d'appel. Ces trois-là n'ont aucune donnée, et ne sont pas écrits :
 * voir l'en-tête de `components/site/article/Motifs.tsx`.
 */
export type BlocArticle =
  | { type: "paragraphe"; texte: string }
  /** L'encadré orange de la maquette, « isQuote ». Une idée, pas un résumé. */
  | { type: "encadre"; texte: string }
  /** La liste à coches orange, en carte de verre. */
  | { type: "liste"; items: string[] }
  /**
   * La frise d'étapes numérotées de la maquette, « isOl » : un filet vertical,
   * une pastille orange de 40px par étape. Le corpus l'écrit en liste ordonnée.
   */
  | { type: "etapes"; items: string[] }
  /**
   * Le tableau en carte de verre, en-têtes orange en capitales.
   *
   * Même forme que `Tableau` de `types/contenu.ts`, et c'est voulu : le corpus
   * écrit ses tableaux d'une seule façon, les deux gabarits les reçoivent avec
   * leur propre dessin.
   */
  | { type: "tableau"; entetes: string[]; lignes: string[][] };

export interface SectionArticle {
  /**
   * L'ancre, qui sert aussi de cible au sommaire. Stable : elle entre dans les
   * URL partagées, la changer casse les liens déjà diffusés.
   */
  id: string;
  titre: string;
  blocs: BlocArticle[];
}

export interface ContenuArticle {
  /** Le chapô du héros. Dit ce que le lecteur saura en sortant. */
  chapeau: string;
  /**
   * La nature de la page, rendue dans la pastille à point orange du héros :
   * « Guide », « Article ». La date n'y est PAS écrite en dur : elle vient de
   * `articles.published_at`, sinon elle se périme sans que personne ne le voie.
   */
  categorie?: string;
  minutesLecture?: number;
  image?: { src: string; alt: string };
  sections: SectionArticle[];
  /** L'appel sombre de fin de corps. Toujours une question de besoin. */
  cta?: {
    titre: string;
    texte: string;
    bouton: string;
    href?: string;
  };
}
