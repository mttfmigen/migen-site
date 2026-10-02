/**
 * Forme du contenu d'une page CAS CLIENTS, troisième gabarit de `pages.contenu`.
 *
 * TROIS GABARITS COHABITENT DANS LA MÊME COLONNE :
 *
 *   · VENTE (`types/contenu.ts`) : dix sections nommées, pour les pages qui
 *     vendent une offre. Son contenu porte `sections`.
 *   · ÉDITORIAL (`types/editorial.ts`) : blocs suivis, pour les pages qui
 *     expliquent. Son contenu porte `blocs` et `gabarit: "editorial"`.
 *   · CAS CLIENTS (ici) : la page de preuve. Hero, chiffres, bandeau de logos,
 *     chantiers livrés, process de sélection, avis Google, formulaire. Son
 *     contenu porte `gabarit: "casclients"`.
 *
 * POURQUOI UN TROISIÈME GABARIT : la page de preuve n'a ni punchline, ni duo
 * prestation-bénéfice, ni blocs de texte suivi. Elle a des CHANTIERS, chacun
 * avec son client, sa durée et sa date. Aucune des deux autres formes ne porte
 * cela, et les plier produirait des sections vides.
 *
 * CE QUE LE TYPE PORTE, ET CE QU'IL NE PORTE PAS. Les données vérifiables
 * (chiffres, noms de clients, durées, dates, avis) viennent d'ici, et une
 * absence se rend VIDE : la section entière disparaît. Les libellés de
 * structure (« Réalisations », « Six chantiers, six contextes différents », les
 * six étapes du process) sont du texte de la maquette, fixé dans les
 * composants : ce n'est pas du contenu éditorialisé page par page.
 *
 * La route `app/[...slug]/page.tsx` tranche sur `gabarit`.
 */

/** Un chiffre du bento d'ouverture. */
export interface ChiffreCasClients {
  /** La valeur, déjà mise en forme : « +10 M€ », « +200 ». */
  valeur: string;
  /** Ce que la valeur compte, en une phrase. */
  libelle: string;
}

/**
 * Le bento d'ouverture, dont la maquette fixe la disposition : un grand
 * panneau à gauche, deux cartes à droite, une carte large en bas qui tient deux
 * chiffres séparés d'un filet.
 */
export interface ChiffresCasClients {
  /** Le grand panneau de gauche, valeur en orange. */
  principal: ChiffreCasClients;
  /** Les deux cartes du haut à droite. Au-delà de deux, elles débordent la grille. */
  cartes?: ChiffreCasClients[];
  /** La carte large du bas. Deux chiffres attendus, le filet se pose entre eux. */
  duo?: ChiffreCasClients[];
}

/** Un chantier livré, tel que la page de preuve l'annonce. */
export interface ChantierCasClients {
  /** Le client, rendu en capitales par la charte : « SUEZ IWT ». */
  client: string;
  /** Durée réelle du chantier : « 11 semaines ». */
  duree?: string;
  titre: string;
  /** Ce qui a été remis en marche, en deux phrases. */
  resume?: string;
  /** L'offre engagée : « migen© Résidence ». */
  offre?: string;
  /** Mois et année, déjà mis en forme : « Février 2026 ». */
  date?: string;
  /** Visuel de couverture, chemin servi (« /assets/web/… ») ou URL. */
  image?: string;
  /** Décoratif sur la maquette, donc vide par défaut. */
  alt?: string;
  /** Fiche du chantier. Sans href, la carte n'est pas cliquable. */
  href?: string;
}

/** Un avis, repris mot pour mot. */
export interface VerbatimCasClients {
  texte: string;
  /** Fonction, secteur et département : « Responsable maintenance · Agroalimentaire · Rhône ». */
  contexte: string;
}

export interface AvisCasClients {
  /** La note, mise en forme à la française : « 4,6 ». */
  note: string;
  /** Ce sur quoi elle porte : « sur 37 avis Google vérifiés ». */
  mention: string;
  verbatims?: VerbatimCasClients[];
}

export interface ContenuCasClients {
  gabarit: "casclients";
  /** Surtitre orange au-dessus du H1. Par défaut, celui de la maquette. */
  surtitre?: string;
  /** Le paragraphe d'ouverture, sous le H1. */
  chapeau?: string;
  chiffres?: ChiffresCasClients;
  chantiers?: ChantierCasClients[];
  /**
   * Titre de la section des chantiers.
   *
   * PARAMÉTRABLE PARCE QU'IL COMPTE : la maquette écrit « Six chantiers, six
   * contextes différents », et ce titre devient faux si le corpus en fournit
   * quatre. Le défaut reste celui de la maquette, la page peut le corriger.
   */
  titreChantiers?: string;
  /** Libellé du lien d'en-tête, pour la même raison. */
  libelleLienChantiers?: string;
  /** Cible du lien d'en-tête. Absente, le lien ne se rend pas. */
  hrefChantiers?: string;
  avis?: AvisCasClients;
}

/**
 * Le contenu est-il celui d'une page de cas clients ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde le discriminant
 * plutôt que de se fier au type déclaré.
 */
export function estCasClients(contenu: unknown): contenu is ContenuCasClients {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuCasClients).gabarit === "casclients"
  );
}
