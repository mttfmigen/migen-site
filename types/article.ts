/**
 * Forme du contenu d'un article, et donc du jsonb `articles.contenu`.
 *
 * Portée du gabarit article de la maquette (« Migen - Site final.dc.html »,
 * lignes 5759 à 5824) : un chapô, une image, un sommaire à gauche qui suit le
 * défilement, le corps à droite, un appel à l'action sombre à la fin.
 *
 * Le SOMMAIRE N'EST PAS UNE DONNÉE : il se déduit des sections, par leur titre
 * et leur ancre. Le stocker en double garantirait qu'un jour il mente.
 *
 * Même règle que pour les pages : aucun champ spéculatif. Ce que le pipeline
 * éditorial ne produit pas n'existe pas ici.
 */

/** Un bloc du corps. Trois formes, et pas une de plus tant qu'un article n'en demande pas. */
export type BlocArticle =
  | { type: "paragraphe"; texte: string }
  /** L'encadré orange « À retenir » de la maquette. Une idée, pas un résumé. */
  | { type: "encadre"; texte: string }
  /** La liste à coches orange : des questions à poser, des points à vérifier. */
  | { type: "liste"; items: string[] };

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
  /** Le chapô sous le titre. Dit ce que le lecteur saura en sortant. */
  chapeau: string;
  /**
   * La ligne de contexte au-dessus du titre : « Guide · 8 min de lecture ».
   * La date n'y est PAS écrite en dur : elle vient de `articles.published_at`,
   * sinon elle se périme sans que personne ne s'en aperçoive.
   */
  categorie?: string;
  minutesLecture?: number;
  image?: { src: string; alt: string };
  sections: SectionArticle[];
  /** L'appel à l'action de fin d'article. Toujours une question de besoin. */
  cta?: {
    titre: string;
    texte: string;
    bouton: string;
    href?: string;
  };
}
