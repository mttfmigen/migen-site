import type { Section } from "./contenu";

/**
 * Forme du contenu d'une page d'OFFRE, gabarit `isOfferPage` de la maquette
 * (`maquette/accueil-rendu.html`, lignes 4706 à 5198).
 *
 * POURQUOI UN GABARIT DE PLUS. Les 19 pages de la branche `/offres/` étaient
 * servies par le gabarit de vente en dix sections, déduit du corpus rédigé. La
 * maquette en dessine quatorze, dans un autre ordre, avec un héros à deux
 * colonnes qui porte son propre formulaire, une bande de quatre chiffres, une
 * bascule avant / après, la méthode en quatre étapes, le process de sélection,
 * et une grille des autres offres. Le client a dit « les pages offres ne sont
 * pas comme sur la maquette » : elles ne l'étaient pas.
 *
 * LA RÈGLE DU CHANTIER : le dessin vient de la maquette, le texte vient du
 * corpus, rien ne s'invente. Une section dont le corpus ne fournit pas la
 * matière reste vide, donc n'est pas rendue.
 *
 * DEUX FAMILLES DE CHAMPS, et c'est voulu.
 *
 * 1. Les champs PROPRES à ce gabarit (héros, bande de chiffres, autres offres,
 *    titre du formulaire) : la maquette les dessine, le gabarit de vente ne
 *    savait pas les rendre.
 * 2. `sections`, qui reprend TEL QUEL le tableau de `types/contenu.ts`. Le
 *    corpus porte déjà ces dix types, `components/site/blocs/` les rend, et
 *    `PageOffre` les place aux emplacements que la maquette leur donne
 *    (`offre` sous « Ce qui est inclus », `preuves` sous « Nos dernières
 *    réalisations », `objections` sous « Questions fréquentes ») ou juste sous
 *    la section de la maquette à laquelle ils se rattachent. Redéclarer ces
 *    formes ici aurait dédoublé dix types et dix blocs pour rien.
 *
 * QUATRE SECTIONS DE LA MAQUETTE RESTENT VIDES SUR DÉCISION, et leurs champs
 * existent quand même pour que la mise en page soit portée et prête : la
 * maquette y écrit ce que le contrat du projet interdit. Voir le commentaire de
 * `ContenuOffre.formules` et `components/site/offre/BlocsZeroArret.tsx`.
 */

/** Une cible. Chemin INTERNE ou `#ancre` : le reste est refusé au rendu. */
export interface LienOffre {
  libelle: string;
  href: string;
}

/** Un repère de la bande du héros : « 10 % » / « des candidats retenus ». */
export interface RepereOffre {
  valeur: string;
  libelle: string;
}

/** Une carte de la bande « En bref », en trois niveaux de lecture. */
export interface ChiffreOffre {
  /** Le chiffre, en orange : « + 80 », « 10 % ». Tel que le corpus l'écrit. */
  valeur: string;
  libelle: string;
  detail?: string;
}

/** Une carte de « Un autre besoin ? » : la phrase du visiteur, puis l'offre. */
export interface CarteOffre {
  /** Ce que le visiteur se dit, entre guillemets dans la maquette. */
  phrase: string;
  libelle: string;
  href: string;
}

/* ------------------------------------------- les quatre sections sous condition */

/** Une étape horaire de « Comment ça marche ». */
export interface JalonOffre {
  repere: string;
  texte: string;
}

/** Une formule de la grille tarifaire. */
export interface FormuleOffre {
  rang: string;
  nom: string;
  resume: string;
  inclus: string[];
  /** Pastille « Recommandé » sur la formule mise en avant. */
  recommandee?: boolean;
  bouton?: LienOffre;
}

/** Une colonne du comparatif salarié / contrat. */
export interface ColonneComparatif {
  surtitre: string;
  titre: string;
  /** Chaque ligne, avec sa marque : `×` à gauche, `✓` à droite. */
  points: string[];
}

export interface ContenuOffre {
  gabarit: "offre";

  /* ------------------------------------------------------------------- le héros */

  /** La pastille en verre à puce orange, en tête du héros. */
  pastille?: string;
  /** La mention grise à côté de la pastille. */
  mention?: string;
  /** Le paragraphe sous le H1. Le H1 vient de `pages.titre_h1`. */
  chapeau?: string;
  /**
   * Les boutons du héros. Le PREMIER est le bouton en verre de la maquette
   * (« Les cinq offres »), les suivants sur la même ligne qui se replie.
   */
  actions?: LienOffre[];
  /**
   * La bande de repères sous les boutons, séparée par des filets verticaux.
   *
   * ELLE RESTE VIDE. La maquette y écrit « 5 agences en France » et
   * « +200 clients industriels », deux chiffres que le contrat interdit (quatre
   * agences, et « plus de 120 clients, dont plus de 80 réguliers »). Les
   * chiffres justes du corpus sont déjà la bande « En bref » juste dessous :
   * les répéter ici ferait lire deux fois les mêmes quatre chiffres sur une
   * page. Le champ reste pour le jour où le client fournit trois repères à lui.
   */
  reperes?: RepereOffre[];
  /** L'en-tête du panneau de formulaire du héros, colonne de droite. */
  formulaireHeroTitre?: string;
  formulaireHeroMention?: string;

  /* ------------------------------------------------------------------ « En bref » */

  brefSurtitre?: string;
  brefTitre?: string;
  brefChapeau?: string;
  /** La maquette en dessine quatre. Au-delà la grille boucle, en deçà elle se resserre. */
  chiffres?: ChiffreOffre[];
  /** La bande en verre sous les chiffres : une phrase, puis un bouton. */
  brefBande?: string;
  brefBouton?: LienOffre;

  /* --------------------------------------- les quatre sections sous condition */

  /**
   * « Comment ça marche », « Les formules · engagement 12 mois »,
   * « Le comparatif », « Le premier mois ».
   *
   * CES QUATRE SECTIONS RESTENT VIDES, ET C'EST UNE DÉCISION, pas un oubli. La
   * maquette les réserve à l'offre Zéro Arrêt (`sc-if value="{{ of.isZero }}"`)
   * et y écrit ce que le contrat du projet interdit :
   *
   *   · « Comment ça marche » : « avant 16 h », « la nuit suivante »,
   *     « 14 h 30 », « 22 h 00 », et « la régie classique ». Délais chiffrés
   *     d'intervention, et « régie » est proscrit.
   *   · « Les formules » : « Prix mensuel fixe », « Recevoir le tarif », trois
   *     formules tarifaires. AUCUN PRIX nulle part, et pas de « à partir de »
   *     qui serait le même prix déguisé.
   *   · « Le comparatif » : « Délai garanti par contrat », « Six semaines
   *     d'absence par an ». Délai contractuel chiffré, et un chiffre RH que
   *     rien ne confirme.
   *   · « Le premier mois » : « une réponse écrite sous 48 h ». Seul « rappel
   *     dans l'heure » est autorisé.
   *
   * LA MISE EN PAGE EST PORTÉE quand même, dans
   * `components/site/offre/BlocsZeroArret.tsx`, aux valeurs de la maquette :
   * le jour où le client fournit une donnée qui ne heurte aucune règle, il
   * suffit de la poser ici. Sans donnée, rien n'est rendu.
   */
  commentCaMarcheSurtitre?: string;
  commentCaMarcheTitre?: string;
  commentCaMarcheChapeau?: string;
  commentCaMarcheJalons?: JalonOffre[];

  formulesSurtitre?: string;
  formulesTitre?: string;
  formulesChapeau?: string;
  formules?: FormuleOffre[];
  /** La bande orange « La règle », sous les formules. */
  formulesRegleSurtitre?: string;
  formulesRegle?: string;

  comparatifSurtitre?: string;
  /** Exactement deux colonnes dans la maquette : le salarié, puis le contrat. */
  comparatif?: [ColonneComparatif, ColonneComparatif];

  premierMoisSurtitre?: string;
  premierMoisTitre?: string;
  premierMoisEtapes?: string[];
  premierMoisAppelSurtitre?: string;
  premierMoisAppelTitre?: string;
  premierMoisAppelTexte?: string;
  premierMoisAppelBouton?: LienOffre;

  /* ---------------------------------------------------- le corps, venu du corpus */

  /**
   * Les sections du corpus rédigé, dans la forme de `types/contenu.ts`.
   *
   * `PageOffre` les place par TYPE, et non dans l'ordre du tableau : la
   * maquette donne un emplacement précis à trois d'entre elles. Les autres
   * (`probleme`, `deroule`, `garanties`, `cta`) sont du texte payé que la
   * maquette ne montre pas : elles se rendent SOUS la section de la maquette à
   * laquelle elles se rattachent, dans les mêmes motifs de section. On ne les
   * supprime pas : c'est la substance du référencement de ces pages.
   */
  sections?: Section[];

  /* ------------------------------------------------------- « Un autre besoin ? » */

  autresSurtitre?: string;
  autresTitre?: string;
  autresChapeau?: string;
  autres?: CarteOffre[];

  /* ----------------------------------------------------- « Réalisations liées » */

  /**
   * Les études de cas liées à la page, section « Réalisations liées » de la
   * capture. Reprises de `maquette/contenu/site/cas-lies.json` pour l'URL de
   * la page : rien ne s'invente, une page sans cas liés ne rend pas la
   * section.
   */
  casLies?: {
    url: string;
    client: string;
    titre: string;
    /**
     * La photo de la carte, dans `public/assets/web/`. OBLIGATOIRE : pas de
     * photo de secours côté rendu, une photo générique associée à une étude
     * de cas qui n'en déclare pas serait une donnée inventée (CLAUDE.md §13).
     */
    photo: string;
  }[];

  /* ----------------------------------------------------- le formulaire de bas de page */

  formulaireTitre?: string;
  formulaireIntro?: string;
}

/**
 * Le contenu est-il celui d'une page d'offre ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a.
 */
export function estOffre(contenu: unknown): contenu is ContenuOffre {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuOffre).gabarit === "offre"
  );
}
