import type { Paragraphe, Section } from "./contenu";

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

/**
 * Un bloc de l'écran « Complément N » de la maquette : un titre, un texte, une
 * liste à coches, ou plusieurs de ces trois.
 * Voir `components/site/offre/ComplementsOffre.tsx`.
 *
 * `puces` AJOUTÉ LE 07/10 en portant `/offres/residence/cahier-des-charges/` :
 * sa capture rend DEUX écrans « Complément », l'un en prose (blocs 540 à 550)
 * et l'autre en liste à coches orange (blocs 616 à 639, « Les 4 erreurs qui
 * coûtent cher »). Le dessin de la carte est le même, seul le corps change.
 */
export interface BlocComplement {
  titre?: string;
  texte?: string;
  puces?: Paragraphe[];
}

/**
 * Une carte de l'écran « 02 Types de maintenance » de la maquette. Voir
 * `components/site/offre/TypesMaintenance.tsx`. Ajouté le 07/10 pour
 * `/offres/full-service/`.
 */
export interface CarteTypeMaintenance {
  titre: string;
  phrase?: string;
  href: string;
  /**
   * La photo de la carte, dans `public/assets/web/`. OBLIGATOIRE, même règle
   * que `casLies` et `PageLiee` : la capture nomme la photo de chaque carte,
   * en poser une autre serait une association inventée.
   */
  photo: string;
}

/**
 * Une carte de l'écran « Maillage » des SOUS-pages d'offre (« Les pages qui
 * complètent celle-ci »). Distinct de `CarteOffre`, qui sert l'écran
 * « Maillage · offres » des six offres nommées : deux écrans de la maquette,
 * deux formes, jamais les deux sur une même page.
 * Voir `components/site/offre/PagesLiees.tsx`.
 */
export interface LienPageLiee {
  titre: string;
  phrase?: string;
  href: string;
  /**
   * La photo de la carte, dans `public/assets/web/`.
   *
   * FACULTATIVE, et c'est la capture qui le décide. Sur
   * `/travaux-industriels/levage-manutention/` la maquette rend les six cartes
   * avec un `<div role="img" aria-label="Illustration">` VIDE : aucune photo
   * n'est nommée, le cadre reste nu. Sur les pages dont la capture nomme une
   * photo, elle se déclare ici et la carte la rend comme avant. Ce qui reste
   * interdit, c'est d'en choisir une au plus proche : poser une photo de la
   * photothèque sous le titre d'une page que la capture laisse nue serait une
   * association inventée (CLAUDE.md §13).
   */
  photo?: string;
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

/* ---------------------------------- « Les prestations regroupées ici » */

/**
 * Un bloc du pli d'une prestation absorbée : son titre, et SOIT des puces,
 * SOIT le tableau « Ce que nous faisons / Ce que ça change pour vous ».
 * La capture rend les deux formes, selon le bloc.
 */
export interface BlocPrestation {
  /**
   * Le H3 du bloc. OPTIONNEL depuis le 07/10 (`/travaux-industriels/`) : la
   * capture intercale, entre deux blocs titrés, des paragraphes du corpus qui
   * n'ont pas de titre à eux (« Un transporteur dépose la machine au pied du
   * camion et repart… »). Sans ce champ, ce texte payé disparaissait du pli.
   */
  titre?: string;
  /**
   * Les paragraphes du bloc, AVANT ses puces ou son tableau, dans l'ordre de
   * la capture. Ajouté le 07/10 avec `titre` optionnel, même raison.
   */
  prose?: string[];
  puces?: { accroche?: string; texte: string }[];
  tableau?: {
    entetes: [string, string];
    lignes: [string, string][];
  };
}

/** Une prestation absorbée par la page, repliée dans sa carte. */
export interface PrestationRegroupee {
  /** L'intitulé de la carte : « Dépannage industriel ». */
  titre: string;
  /** La ligne de résumé sous l'intitulé, tronquée à une ligne au rendu. */
  resume: string;
  blocs?: BlocPrestation[];
  questions?: { question: string; reponse: string }[];
  /**
   * La page que cette prestation a sur LE SITE, et son libellé de lien.
   *
   * AJOUTÉS LE 07/10 en portant `/offres/bureau-etudes/`, et c'est un ÉCART
   * ASSUMÉ à la maquette, déclaré ici parce qu'il vaut pour toute page qui
   * regroupe une prestation : la maquette REDIRIGE `/offres/retrofit/` et
   * `/offres/audit-conseil-maintenance/` vers cette page (`remapOffer`), donc
   * elle replie leur contenu entier dans le pli. Le site, lui, SERT ces deux
   * URL (elles répondent 200 et ont leur propre fichier de contenu) : recopier
   * leur texte ici produirait deux fois la même page, exactement la
   * cannibalisation que la console doit surveiller (CLAUDE.md §10). Le pli
   * porte donc le lien vers la page réelle, et non sa copie.
   *
   * Sans ces champs, rien n'est rendu de plus : les pages qui replient un
   * contenu absent du site gardent leurs `blocs`.
   */
  href?: string;
  hrefLibelle?: string;
}

/**
 * Section « Offres regroupées » de la capture. AJOUTÉE LE 07/10 pour
 * `/offres/zero-arret/`, dont la capture porte 18 sections là où la page
 * pilote `/offres/residence/` en porte 17 : c'est l'unique écart de structure
 * entre les deux. Le champ est optionnel, donc inerte sur les autres pages.
 */
export interface PrestationsRegroupees {
  /** Le lien de droite : « Décrire mon besoin → » vers `#besoin`. */
  lien?: LienOffre;
  prestations: PrestationRegroupee[];
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
  /**
   * Le libellé du bouton des trois bandes d'appel et de l'en-tête du panneau
   * de formulaire final. ABSENT, c'est « Parler à un chargé d'affaires », le
   * libellé relevé sur la capture de la page pilote `/offres/residence/`.
   *
   * AJOUTÉ LE 07/10 : la capture de `/offres/zero-arret/` y écrit « Demander
   * mon diagnostic gratuit ». Le libellé était figé dans `BandeAppel` et
   * `AppelFinal`, il est donc devenu une donnée de page, à défaut inchangée.
   */
  appelBouton?: string;
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

  /* ------------------------------------------------------------ « Réassurance » */

  /**
   * Les trois repères du panneau « Qui intervient chez vous ».
   *
   * Ajouté le 07/10 pour `/travaux-industriels/`, dont la capture y écrit les
   * métiers du chantier (« Chefs de chantier », « Monteurs et levageurs »,
   * « Un interlocuteur ») là où celle de `/offres/residence/` écrit « 10 % »,
   * « Salariés », « 10 ». Absent, `Reassurance` garde les repères de la
   * capture de la page pilote : les pages déjà portées ne changent pas.
   */
  reperesReassurance?: RepereOffre[];

  /* ------------------------------------------------------------------ « En bref » */

  brefSurtitre?: string;
  brefTitre?: string;
  brefChapeau?: string;
  /** La maquette en dessine quatre. Au-delà la grille boucle, en deçà elle se resserre. */
  chiffres?: ChiffreOffre[];
  /** La bande en verre sous les chiffres : une phrase, puis un bouton. */
  brefBande?: string;
  brefBouton?: LienOffre;

  /**
   * La sous-ligne de cette bande. Sans valeur, le gabarit écrit « Rappel dans
   * l'heure. », texte fixe de la capture de `/offres/residence/`. Les captures
   * des sous-pages y écrivent autre chose : sur
   * `offres--retrofit--remise-en-etat`, « Faire expertiser ma machine Un chargé
   * d'affaires vous rappelle dans l'heure et organise l'état des lieux. » (la
   * maquette y recolle elle-même le libellé du bouton, c'est son rendu, et la
   * référence fait foi). AJOUT DU 07/10, optionnel : une page qui ne le porte
   * pas rend la sous-ligne d'avant.
   */
  brefMention?: string;

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

  /* ------------------- « 02 Réponse directe » et « 02 Types de maintenance » */

  /*
   * Deux écrans que la page pilote `/offres/residence/` n'a pas et que
   * `/offres/full-service/` rend (21 sections, capture du 07/10). Sans
   * donnée, ni l'un ni l'autre n'est monté : les 21 autres pages du gabarit
   * ne bougent pas. Voir `ReponseDirecte.tsx` et `TypesMaintenance.tsx`.
   */

  /** La réponse en une phrase, en H2, juste après la réassurance. */
  reponseTitre?: string;
  reponseTexte?: string;

  /** Le H2 de l'écran des types de maintenance, et ses cartes. */
  typesTitre?: string;
  typesMaintenance?: CarteTypeMaintenance[];

  /**
   * L'écran « Complément 2 » : la même carte en verre que `complementOffre`,
   * mais à l'autre emplacement de la maquette, entre les types de maintenance
   * et la problématique.
   */
  complementTypes?: BlocComplement[];

  /* ---------------------------------- retouches de sections déjà portées */

  /**
   * Le H2 du déroulé. Absent, le gabarit écrit « Un appel. Un plan. Une ligne
   * qui repart. », le texte de la capture de `/offres/residence/`. La capture
   * de `/offres/full-service/` y écrit « De la cartographie des risques au
   * pilotage par les indicateurs » : le titre est donc une donnée de page.
   */
  derouleTitre?: string;

  /**
   * La photo de la colonne gauche de la problématique. Absente, le gabarit
   * pose celle de la capture de `/offres/residence/` ; `null` dit que la
   * capture de LA page n'en rend aucune (c'est le cas de
   * `/offres/full-service/`), et rien n'est rendu.
   */
  problemePhoto?: string | null;

  /* ------------------------------------------------------- « Complément 4 » */

  /**
   * L'écran « Complément 4 » de la maquette, entre la bande d'appel de l'offre
   * et le déroulé : la prose de la section du corpus dont le tableau est déjà
   * rendu ailleurs. Propre aux SOUS-pages du gabarit 03, absent des six offres
   * nommées. Sans donnée, la section n'est pas rendue.
   */
  complementOffre?: BlocComplement[];

  /* ------------------------------------------------------- « Complément 5 » */

  /**
   * L'écran « Complément 5 » de la maquette, APRÈS le déroulé : même carte que
   * « Complément 4 », autre emplacement. Ajouté le 07/10 en portant
   * `/offres/residence/cahier-des-charges/`, dont la capture porte les deux
   * (gabarits 540 et 616).
   *
   * MESURÉ, et non supposé : 63 des captures du dépôt portent au moins un
   * écran « Complément », numéroté 2, 4, 5 ou 6 selon la section du corpus
   * qu'il prolonge. Seuls les emplacements 4 et 5 sont montés ici, ceux dont
   * une page portée a besoin. Sans donnée, rien n'est rendu.
   */
  complementDeroule?: BlocComplement[];

  /* ------------------------------------------------------- « Complément 6 » */

  /**
   * L'écran « Complément 6 » de la maquette, APRÈS les garanties : la même
   * carte que « Complément 4 » et « Complément 5 », au troisième emplacement.
   *
   * AJOUTÉ LE 07/10 en portant `/offres/bureau-etudes/`, dont la capture
   * (22 sections) porte les TROIS emplacements : gabarits 540, 616 et 664. Le
   * corpus l'écrit en gras d'attaque après la liste des garanties (« **La
   * confidentialité par défaut.** … »). Sans donnée, rien n'est rendu : les
   * 21 autres pages du gabarit ne bougent pas.
   */
  complementGaranties?: BlocComplement[];

  /* ------------------------------ « Les prestations regroupées ici » */

  /**
   * Les prestations qu'une redirection de la maquette (`remapOffer`) range
   * dans cette page, repliées. Sans elles, la section n'est pas rendue.
   */
  prestationsRegroupees?: PrestationsRegroupees;

  /* ------------------------------------------------------- « Un autre besoin ? » */

  autresSurtitre?: string;
  autresTitre?: string;
  autresChapeau?: string;
  autres?: CarteOffre[];

  /* ----------------------- « Les pages qui complètent celle-ci » (modèle 2) */

  /**
   * Le SECOND modèle de maillage du gabarit, rendu par
   * `components/site/offre/PagesLiees.tsx`.
   *
   * La maquette en dessine deux et n'en rend jamais deux sur la même page :
   * le bento « Un autre besoin ? Il a son offre. » (`autres`, 6 captures, les
   * offres nommées) et « Les pages qui complètent celle-ci » (ce champ, 19
   * captures, les pages de second niveau). Relevé le 07/10 en portant
   * `/offres/depannage-industriel/panne-machine/`. Une page ne remplit que
   * l'un des deux ; remplir les deux rendrait deux blocs de maillage.
   */
  pagesLiees?: LienPageLiee[];

  /* --------------------------------- « Les équipements que nous maintenons » */

  /**
   * La famille de constructeurs de la section « Marques maintenues », par sa
   * clé courte dans `components/site/marques/marques-donnees.ts` (`auto`,
   * `robot`, `mo`, `plast`, `agro`, `logi`, `fluide`).
   *
   * La maquette rend UNE famille, et laquelle dépend de la page : les
   * machines-outils sur « panne machine », la robotique sur « Fanuc ». Sans ce
   * champ la section n'est pas rendue, et une clé inconnue ne rend rien plutôt
   * qu'une famille de repli (ce serait une donnée fausse).
   */
  marquesFamille?: string;

  /**
   * Le RAIL D'ONGLETS de familles au-dessus des tuiles, par leurs mêmes clés
   * courtes, la première étant celle affichée à l'arrivée (`marquesFamille`).
   *
   * AJOUTÉ LE 07/10 en portant `/bureau-etudes/bureau-etude-electrique/`, dont
   * la capture rend ce rail (`data-screen-label="Marques maintenues"`, blocs
   * 924 à 927) avec deux pastilles : « Automatisme & électricité 10 », active,
   * et « Air comprimé, pompes & fluides 8 ». La capture de
   * `/offres/depannage-industriel/panne-machine/` ne le porte pas : le rail est
   * donc une donnée de page, et sans ce champ rien n'est rendu de plus.
   *
   * LE COMPTE N'EST PAS UNE DONNÉE : il est celui de la famille dans
   * `marques-donnees.ts` (10 et 8 pour ces deux-là, comme la capture).
   */
  marquesFamilles?: string[];

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
     * Le surtitre de la carte MISE EN AVANT, à la place du nom du client :
     * « À la une · Savoye, Norvège ». Ajouté le 07/10 pour
     * `/travaux-industriels/`, dont la capture ouvre la section par une carte
     * en avant. Absent, la carte reste une carte simple.
     */
    aLaUne?: string;
    /** Le paragraphe de la carte mise en avant, sous son titre. */
    resume?: string;
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
