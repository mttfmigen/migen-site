import type { Section, Tableau } from "./contenu";

/**
 * Forme du contenu d'une page d'OFFRE, gabarit `isOfferPage` de la maquette
 * (`maquette/site-final.html`, lignes 4030 à 4524).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LE TEXTE VIENT DE LA MAQUETTE, PAS DU CORPUS. Décision de Mehdi du 05/10.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * La maquette ne porte pas que du dessin : à sa ligne 7748, un objet `OFFERS`
 * définit SIX offres de TRENTE-TROIS champs, soit cent quatre-vingt-dix-huit
 * phrases écrites par le client, exactement celles que le gabarit lie par
 * `{{ of.X }}`. Elles sont extraites dans `maquette/offres-maquette.json`, et le
 * texte que le gabarit écrit en dur dans `maquette/blocs-offre-maquette.json` et
 * `maquette/faq-maquette.json`. `scripts/produit_gabarit_offre.mjs` les range
 * dans les champs ci-dessous, MOT POUR MOT ; le corpus rédigé ne sert plus qu'à
 * ce que ces trois fichiers ne définissent pas, et aux douze pages de `/offres/`
 * qui n'ont pas de clé dans `OFFERS`.
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
 *    `PageOffre` les rend APRÈS les treize sections de la maquette, sauf
 *    `objections`, à qui la maquette donne un emplacement et dont les questions
 *    viennent d'elle sur les six pages à clé `OFFERS`. Redéclarer ces formes ici
 *    aurait dédoublé dix types et dix blocs pour rien.
 *
 *    POURQUOI APRÈS, ET PLUS INTERCALÉES. Le portage précédent glissait
 *    `probleme`, `deroule`, `garanties` et `cta` entre les sections de la
 *    maquette : « Ce que nous garantissons. » se retrouvait à l'emplacement où
 *    la maquette écrit « Vous gardez la main. Nous portons le reste. », et c'est
 *    précisément ce que Mehdi cite comme la preuve que le site ne ressemblait
 *    pas à sa maquette. Les treize sections se suivent maintenant dans l'ordre
 *    exact de la maquette, et le texte payé du corpus devient la suite de la
 *    page. Rien n'est supprimé, rien n'est intercalé.
 *
 * LES QUATRE SECTIONS DE ZÉRO ARRÊT SONT PORTÉES, texte compris, depuis la
 * décision de Mehdi du 05/10 (« respecte la maquette »). Elles avaient été
 * laissées vides parce que la maquette y écrit des prix et des délais chiffrés
 * que CLAUDE.md section 9 refuse. La règle du 05/10 fait primer la maquette :
 * les formulations concernées sont inscrites dans `docs/RESERVES-CONTENU.md`
 * pour arbitrage avant que migen.fr pointe sur le déploiement. Voir le
 * commentaire de `ContenuOffre.formules` et
 * `components/site/offre/BlocsZeroArret.tsx`.
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

/**
 * Une carte de « Nos dernières réalisations » : photo, surtitre, titre, date.
 *
 * C'EST LE CONTRAT UNIQUE DE CE BLOC, côté maquette comme côté base :
 * `components/site/accueil/DernieresRealisations.tsx` s'en sert aussi pour les
 * trois cartes de l'accueil, qui étaient décrites par un second type à part.
 */
export interface RealisationOffre {
  /**
   * La photo en bandeau, chemin interne.
   *
   * FACULTATIVE, et ce n'est pas un oubli : `x-faisceaux.jpg`, que la maquette
   * met sur la première carte, N'EST PAS au dépôt. Substituer une autre photo
   * reviendrait à associer un visuel arbitraire au nom d'un client.
   * `scripts/produit_gabarit_offre.mjs` omet le champ quand le fichier manque,
   * et la carte rend alors son texte SANS le cadre de 210 px : un aplat gris
   * entre deux cartes photographiées se lit comme une image cassée.
   */
  image?: string;
  /**
   * La fiche de la réalisation.
   *
   * FACULTATIVE sur les pages d'offre : la maquette y navigue par
   * `onClick="{{ goFiche }}"` et ne nomme aucune URL pour ces trois clients.
   * Sans cible, la carte n'est pas un lien. Voir `DernieresRealisations.tsx`.
   */
  href?: string;
  /** « SUEZ IWT · migen© Résidence », en capitales orange. */
  surtitre: string;
  titre: string;
  date: string;
}

/** La section « Nos dernières réalisations » de la maquette (l. 4429). */
export interface RealisationsOffre {
  surtitre: string;
  titre: string;
  /** Le lien d'en-tête, à droite du H2 : « Voir toutes nos réalisations → ». */
  lien: LienOffre;
  cartes: RealisationOffre[];
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
  /**
   * Le H1, EN DEUX ENCRES, comme la maquette le dessine (l. 4042) :
   * `of.h1a` en `var(--ink)`, puis `of.h1b` dans un `<span>` en `var(--ink4)`.
   *
   * REPLI : les douze pages de `/offres/` sans clé dans `OFFERS` n'ont pas ce
   * texte, et `PageOffre` retombe alors sur `pages.titre_h1`, d'une seule pièce.
   *
   * ARBITRAGE SEO EN JEU, inscrit dans `docs/RESERVES-CONTENU.md` : le H1 de la
   * base porte le mot clé de la page (« Sous-traitance maintenance »), celui de
   * la maquette ne le porte pas. C'est la maquette qui gagne sur la décision du
   * 05/10, mais Mehdi doit pouvoir trancher autrement.
   */
  titreA?: string;
  titreB?: string;
  /** Le paragraphe sous le H1. */
  chapeau?: string;
  /**
   * Les boutons du héros. Le PREMIER est le bouton en verre de la maquette
   * (« Les cinq offres »), les suivants sur la même ligne qui se replie.
   */
  actions?: LienOffre[];
  /**
   * La bande de repères sous les boutons, séparée par des filets verticaux.
   *
   * PORTÉE DEPUIS LA DÉCISION DU 05/10, AVEC SA RÉSERVE. La maquette y écrit
   * « 5 agences en France » et « +200 clients industriels ». Les deux
   * contredisent le corpus et CLAUDE.md section 9 : quatre agences (Lyon siège,
   * Montréal, Dubaï, Madrid) et aucune autre en France, « plus de 120 clients,
   * dont plus de 80 réguliers ». Le troisième repère, 10 %, est cohérent avec la
   * section « Notre sélection ». À trancher par Mehdi avant la mise en ligne :
   * `docs/RESERVES-CONTENU.md`, section 2.
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
   * LA MAQUETTE LES RÉSERVE À L'OFFRE ZÉRO ARRÊT
   * (`sc-if value="{{ of.isZero }}"`, l. 4096 et 4210 de `site-final.html`), et
   * `scripts/produit_gabarit_offre.mjs` ne les écrit donc que pour
   * `/offres/zero-arret/`. Les autres pages n'en portent rien, et ce n'est pas
   * un trou : c'est le dessin.
   *
   * CE QUE LEUR TEXTE COÛTE, et qui est assumé depuis le 05/10 : « avant 16 h »,
   * « la nuit suivante », « 14 h 30 », « la régie classique », « Prix mensuel
   * fixe », « Recevoir le tarif », « Nuit suivante, sans engagement »,
   * « une réponse écrite sous 48 h ». CLAUDE.md section 9 les refuse, la
   * décision du client les porte. Les quatre que la porte des interdits attrape
   * y sont déclarées en exception nommée, les autres sont listées dans
   * `docs/RESERVES-CONTENU.md` pour arbitrage avant la mise en ligne.
   */
  commentCaMarcheSurtitre?: string;
  commentCaMarcheTitre?: string;
  commentCaMarcheChapeau?: string;
  commentCaMarcheJalons?: JalonOffre[];

  formulesSurtitre?: string;
  formulesTitre?: string;
  formulesChapeau?: string;
  formules?: FormuleOffre[];
  /**
   * Le tableau ligne par ligne sous les cartes (maquette l. 4146 à 4153).
   *
   * Même forme que les tableaux du corpus, et pour une raison : `types/contenu.ts`
   * la déclare déjà, le gabarit de vente la sert, rien ne justifiait un second
   * type. Le RENDU, lui, est propre à cette section : quatre colonnes dont une
   * mise en avant, ce que `blocs/Offre.tsx` ne sait pas faire. Voir
   * `components/site/offre/TableauFormules.tsx`.
   */
  formulesTableau?: Tableau;
  /** La bande orange « La règle », sous les formules. */
  formulesRegleSurtitre?: string;
  formulesRegle?: string;

  /**
   * Exactement deux colonnes dans la maquette : le salarié, puis le contrat.
   * Chacune porte SON surtitre (« Le comparatif », puis « Zéro Arrêt ») : la
   * section n'en a pas d'autre, et la maquette n'y met aucun bouton.
   */
  comparatif?: [ColonneComparatif, ColonneComparatif];

  premierMoisSurtitre?: string;
  premierMoisTitre?: string;
  premierMoisEtapes?: string[];
  premierMoisAppelSurtitre?: string;
  premierMoisAppelTitre?: string;
  premierMoisAppelTexte?: string;
  premierMoisAppelBouton?: LienOffre;

  /* ------------------------------------------------------ « Ce qui est inclus » */

  /**
   * Les deux panneaux côte à côte de la maquette (l. 4277 à 4285) : à gauche, en
   * verre et sous la marque, ce que migen© porte ; à droite, en `var(--chip)`,
   * ce qui reste chez le client.
   *
   * TOUT VIENT D'`OFFERS` sur les six pages à clé : `incTitre` ← `of.incT`,
   * `incChapeau` ← `of.incP`, `porte` ← les CINQ lignes `of.us0` à `of.us4`,
   * `resteChezVous` ← les QUATRE lignes `of.you0` à `of.you3`.
   *
   * Le commentaire précédent affirmait que ces champs « n'existent ni dans la
   * maquette ni dans le corpus ». C'était faux, et c'est ce qui a fait rendre
   * « Ce que nous garantissons. » là où la maquette écrit « Vous gardez la main.
   * Nous portons le reste. ». Les liaisons sont résolues depuis l'extraction
   * d'`OFFERS` (`maquette/offres-maquette.json`).
   *
   * Sur les douze pages sans clé, `porte` reprend les cinq premières accroches
   * de prestation de la section `offre` du corpus et `resteChezVous` reste vide :
   * la grille passe alors à une colonne, plutôt que d'engager migen© sur ce
   * qu'elle ne fait PAS avec quatre lignes inventées.
   */
  incTitre?: string;
  incChapeau?: string;
  porte?: string[];
  resteChezVous?: string[];
  /** La barrette en verre sous les deux panneaux (l. 4282). */
  incBande?: string;
  incBouton?: LienOffre;

  /* ------------------------------------------------------- « Notre sélection » */

  /**
   * Le libellé du lien d'en-tête de « Notre sélection », lié à `{{ of.cta }}`
   * dans la maquette : il CHANGE avec l'offre.
   *
   * Il était écrit en dur « Constituer mon équipe → » dans
   * `components/site/accueil/ProcessSelection.tsx`, ce qui ne tombait juste que
   * sur Résidence : `/offres/zero-arret/` l'affichait là où la maquette écrit
   * « Demander l'étude de couverture ».
   */
  selectionCta?: string;

  /* ------------------------------------------- « Nos dernières réalisations » */

  /**
   * Les trois cartes à photo de la maquette (l. 4429 à 4465).
   *
   * ELLES NE SONT PAS DES LIAISONS `{{ of.X }}` : la maquette les écrit en dur
   * et les sert à l'identique sur les six offres. Elles sont extraites dans
   * `maquette/blocs-offre-maquette.json`.
   *
   * La section `preuves` du corpus N'EST PAS perdue : elle se rend en fin de
   * page avec les autres sections rédigées, dans le dessin de `blocs/Preuves`.
   */
  realisations?: RealisationsOffre;

  /* --------------------------------------------------- « Questions fréquentes » */

  /**
   * Le bouton orange de la colonne gauche collante (maquette l. 4469).
   *
   * Posé ici et non dans `blocs/Objections.tsx` par défaut : ce bloc sert aussi
   * la centaine de pages du gabarit de vente, où la maquette ne met pas de
   * bouton.
   */
  faqBouton?: LienOffre;

  /* ---------------------------------------------------- le corps, venu du corpus */

  /**
   * Les sections du corpus rédigé, dans la forme de `types/contenu.ts`.
   *
   * `PageOffre` les rend TOUTES EN FIN DE PAGE, après les treize sections de la
   * maquette, sauf `objections` à qui la maquette donne un emplacement. C'est du
   * texte payé, la substance du référencement de ces pages : on ne le supprime
   * pas, on ne l'intercale plus.
   */
  sections?: Section[];

  /* ------------------------------------------------------- « Un autre besoin ? » */

  autresSurtitre?: string;
  autresTitre?: string;
  autresChapeau?: string;
  autres?: CarteOffre[];

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
