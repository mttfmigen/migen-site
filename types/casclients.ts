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

/* ------------------------------------------------------------------------
 * LE HUB /preuves/, gabarit « 10 Hub de rubrique » de l'index de la maquette,
 * rendu par `MigenPreuves.dc.html`. Mesuré le 08/10 contre
 * `maquette/rendu/preuves.html` : trois écrans (héros à mosaïque, études de
 * cas filtrées par type de besoin, bandeau d'appel), rien de commun avec la
 * page sur mesure /realisations/ que décrit le reste de ce fichier.
 *
 * MÊME DISCRIMINANT `gabarit: "casclients"`, distingué par `vue: "hub"` :
 * la route tranche déjà sur `estCasClients`, et la ligne /preuves/ porte ce
 * gabarit en base. Aucune branche de routage n'est à ajouter.
 *
 * LA DONNÉE EST LE CORPUS, `maquette/contenu/site/Preuves/preuves.md`, tel
 * que la fonction `parse` de la maquette le lit : chaque chaîne est la copie
 * de ce qu'affiche la capture. Photos, logos et libellés de structure sont du
 * gabarit (`components/site/casclients/vues-preuves.ts`), pas de la donnée.
 * ---------------------------------------------------------------------- */

/** Une étude de cas, telle que la carte l'affiche. */
export interface CasHubPreuves {
  /** « DANONE (BLÉDINA) », en capitales dans le corpus. */
  client: string;
  /** Le titre de mission, majuscule initiale : « Pas un poste sans maintenance… ». */
  sujet?: string;
  /** La phrase de la liste du corpus, majuscule initiale. */
  resume: string;
  /** La fiche : « /preuves/<cas>/ ». */
  url: string;
}

/** Un type de besoin, c'est-à-dire un onglet du filtre. */
export interface CategorieHubPreuves {
  /** Le libellé de l'onglet, court : « Maintenance en continu ». */
  libelle: string;
  /** « Le besoin : … », affiché quand l'onglet est actif. */
  besoin: string;
  cas: CasHubPreuves[];
}

export interface ContenuHubPreuves {
  gabarit: "casclients";
  vue: "hub";
  /** La phrase en gras du chapeau. */
  accroche: string;
  /** Le reste du chapeau. */
  intro: string;
  categories: CategorieHubPreuves[];
  /** Les fiches de « Les derniers publiés » : pastille « Récent ». */
  recents: string[];
}

/**
 * Le contenu est-il celui d'une page de cas clients ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde le discriminant
 * plutôt que de se fier au type déclaré.
 */
export function estCasClients(
  contenu: unknown,
): contenu is ContenuCasClients | ContenuHubPreuves {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuCasClients).gabarit === "casclients"
  );
}

/** Le contenu est-il celui du hub /preuves/ ? */
export function estHubPreuves(contenu: unknown): contenu is ContenuHubPreuves {
  return (
    estCasClients(contenu) &&
    (contenu as ContenuHubPreuves).vue === "hub" &&
    Array.isArray((contenu as ContenuHubPreuves).categories)
  );
}
