/**
 * Entrées de navigation, en données plutôt qu'en balisage répété.
 *
 * Deux sources, et c'est voulu : la maquette « Site final » pilote les
 * mega-menus du bureau, la maquette MOBILE V2 (`maquette/mobile-v2/`) pilote
 * le tiroir tactile. Leurs listes ne sont pas les mêmes : le tiroir porte les
 * groupes « Cas clients » et « Ressources », des sous-têtes et des
 * descriptions que le bureau n'a pas. Les fusionner produirait une liste que
 * le client n'a validée ni d'un côté ni de l'autre, donc chacune reste à sa
 * place.
 *
 * Aucun chemin inventé : chaque `href` du tiroir est une page de
 * `maquette/contenu/site/index.json`, une route statique de `app/`, ou la
 * réécriture `/diagnostic-zero-arret/` de `next.config.ts`
 * (`verification-tiroir.tsx` le revérifie). Pour les mega-menus, les deux
 * entrées de la maquette de bureau sans URL existante (Diagnostic Zéro arrêt,
 * Test technicien) restent passées en props à l'en-tête, et l'entrée ne
 * s'affiche pas si l'appelant ne fournit rien.
 */

export type PanneauId =
  "offres" | "expertises" | "preuves" | "ressources" | "apropos";

export interface Lien {
  libelle: string;
  href: string;
}

export interface LienDecrit extends Lien {
  description: string;
}

export interface Offre extends LienDecrit {
  image: string;
  /** Pastille orange à droite du titre, « Abonnement » pour Zéro arrêt. */
  etiquette?: string;
}

export interface FormatRessource extends LienDecrit {
  /**
   * Nombre de ressources publiées dans la famille, sur deux chiffres, affiché
   * en monospace comme dans la maquette. COMPTÉ, jamais écrit à la main : la
   * porte `scripts/verifie-menu-ressources.mjs` le recompte dans
   * `maquette/contenu/site/index.json` et refuse un écart.
   */
  numero: string;
}

export interface CasClient {
  client: string;
  sousTitre: string;
  resume: string;
  href: string;
  image: string;
}

export interface Chiffre {
  valeur: string;
  libelle: string;
  /** Un seul chiffre du panneau est en orange. */
  accent?: boolean;
}

/** Un lien du tiroir, avec sa ligne grise quand la maquette en écrit une. */
export interface LienTiroir extends Lien {
  description?: string;
}

/**
 * Une entrée du tiroir : un lien, ou une sous-tête orange qui scinde la liste
 * (« Conception et réalisation », « Par constructeur »…). C'est la distinction
 * `L_` / `HD_` du `menuG` de la maquette mobile v2.
 */
export type EntreeTiroir =
  | { type: "sous-tete"; libelle: string }
  | ({ type: "lien" } & LienTiroir);

export interface SectionTiroir {
  libelle: string;
  entrees: EntreeTiroir[];
}

/* ------------------------------------------------------------------ barre */

/**
 * Les cinq entrées qui ouvrent un panneau, dans l'ordre de la maquette.
 *
 * CHACUNE PORTE L'ADRESSE DE SON HUB depuis le 11/10. Elles étaient des
 * `<button>` sans lien : au clic, le méga-menu s'ouvrait et rien d'autre, le
 * visiteur devait ensuite viser « Toutes nos expertises → » à l'intérieur.
 * Mehdi l'a signalé : « le menu quand je clique dessus ça me renvoie pas vers
 * les pages de niveau un ». Elles sont maintenant de vrais liens : le survol
 * et le focus clavier ouvrent le panneau, le clic mène à la page.
 */
export const NAV_PANNEAUX: { id: PanneauId; libelle: string; href: string }[] = [
  { id: "offres", libelle: "Offres", href: "/offres/" },
  { id: "expertises", libelle: "Expertises", href: "/expertises/" },
  { id: "preuves", libelle: "Cas clients", href: "/preuves/" },
  { id: "ressources", libelle: "Ressources", href: "/ressources/" },
  { id: "apropos", libelle: "À propos", href: "/nous-connaitre/" },
];

/**
 * Sixième entrée, sans panneau : elle ferme celui qui serait ouvert.
 *
 * LIBELLÉ DEMANDÉ PAR MEHDI LE 12/10 : « déjà la page devrait s'appeler
 * rejoindre migen ». C'est un ÉCART ASSUMÉ avec la maquette, qui écrit
 * « Carrière » sur sa pilule de barre comme dans son tiroir, et dont la
 * capture `maquette/rendu/carriere.html` titre la page « Migen recrutement ».
 * La maquette n'écrit « Rejoindre Migen » qu'en h2 de la bande d'appel de
 * cette page, et « Rejoindre migen© » en sur-titre de deux panneaux de
 * candidature. Le titre de la page n'est donc PAS touché ici : seul le libellé
 * du menu change, et le reste attend l'arbitrage de Mehdi.
 */
export const NAV_CARRIERE: Lien = {
  libelle: "Rejoindre migen",
  href: "/carriere/",
};

/** Variante landing page : des ancres dans la page, pas des pages du site. */
export const NAV_LP: Lien[] = [
  { libelle: "Solutions", href: "#lp-solutions" },
  { libelle: "Méthode", href: "#lp-methode" },
  { libelle: "Témoignages", href: "#lp-temoignages" },
  { libelle: "Contact", href: "#lp-contact" },
];

export interface Telephone {
  affichage: string;
  href: string;
}

/** Numéro du site. Celui de la landing page ne sort pas de la landing page. */
export const TELEPHONE_SITE: Telephone = {
  affichage: "04 78 33 72 05",
  href: "tel:+33478337205",
};

export const TELEPHONE_LP: Telephone = {
  affichage: "04 11 78 95 97",
  href: "tel:+33411789597",
};

/* ---------------------------------------------------------- panneau Offres */

export const OFFRES: Offre[] = [
  {
    libelle: "migen© Résidence",
    href: "/offres/residence/",
    description: "Techniciens en résidence, intégrés à votre équipe.",
    image: "/assets/web/team-electric.jpg",
  },
  {
    libelle: "migen© Full service",
    /* L'ADRESSE FINALE, ET NON L'ANCIENNE. `/offres/maintenance-externalisee/`
       repond 301 vers `/offres/full-service/` : le menu principal faisait donc
       rebondir le visiteur a chaque clic sur Full service, sur les 248 pages.
       Trouve le 12/10 en verifiant les codes HTTP sans suivre les redirections. */
    href: "/offres/full-service/",
    description: "Toute votre maintenance, dans un seul contrat.",
    image: "/assets/web/team-grind-front.jpg",
  },
  {
    libelle: "migen© Zéro arrêt",
    href: "/offres/zero-arret/",
    description: "Forfait mensuel : préventif, astreinte, curatif inclus.",
    image: "/assets/web/ph-technicien.jpg",
    etiquette: "Abonnement",
  },
  {
    libelle: "migen© Arrêt technique",
    href: "/offres/arret-technique/",
    description: "Arrêts planifiés, tenus à la demi-journée.",
    image: "/assets/web/x-auto-ligne.jpg",
  },
];

export const CONCEPTION: Offre[] = [
  {
    libelle: "migen© Bureau d’études",
    href: "/offres/bureau-etudes/",
    description:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
    image: "/assets/web/ph-robots-solaire.jpg",
  },
  {
    libelle: "migen© Travaux industriels",
    href: "/travaux-industriels/",
    description:
      "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
    image: "/assets/web/x-elec-disjoncteur.jpg",
  },
];

/* ----------------------------------------------------- panneau Expertises */

export const DOMAINES: Lien[] = [
  { libelle: "Mécanique", href: "/expertises/mecanique/" },
  { libelle: "Hydraulique", href: "/expertises/hydraulique/" },
  { libelle: "Électromécanique", href: "/expertises/electromecanique/" },
  { libelle: "Soudure", href: "/expertises/soudure/" },
  { libelle: "Électrique", href: "/expertises/electrique/" },
  { libelle: "Tuyauterie", href: "/expertises/tuyauterie/" },
  { libelle: "Pneumatique", href: "/expertises/pneumatique/" },
  { libelle: "Automatisme", href: "/expertises/automatisme/" },
  { libelle: "Robotique", href: "/expertises/robotique/" },
];

export const SECTEURS: Lien[] = [
  { libelle: "Centre logistique", href: "/secteurs/logistique/" },
  { libelle: "Aéronautique", href: "/secteurs/aeronautique/" },
  { libelle: "Industrie lourde", href: "/secteurs/industrie-lourde/" },
  { libelle: "Pharmaceutique", href: "/secteurs/pharmaceutique/" },
  { libelle: "Industrie métallique", href: "/secteurs/industrie-metallique/" },
  { libelle: "Chimie", href: "/secteurs/chimie/" },
  { libelle: "Automobile", href: "/secteurs/automobile/" },
  { libelle: "Agroalimentaire", href: "/secteurs/agroalimentaire/" },
  {
    libelle: "Menuiserie industrielle",
    href: "/secteurs/menuiserie-industrielle/",
  },
];

export const SPECIALISATIONS: Lien[] = [
  {
    libelle: "Automaticien SIEMENS",
    href: "/expertises/automatisme/siemens/",
  },
  {
    libelle: "Automaticien Schneider",
    href: "/expertises/automatisme/schneider/",
  },
  { libelle: "Roboticien FANUC", href: "/expertises/robotique/fanuc/" },
  { libelle: "Roboticien ABB", href: "/expertises/robotique/abb/" },
];

/* -------------------------------------------------- panneau Cas clients */

export const CAS: CasClient[] = [
  {
    client: "DANONE",
    sousTitre: "Lignes de production",
    resume: "Deux techniciens en 3x8, lignes liquides et poudre.",
    href: "/preuves/danone-lignes-de-production/",
    image: "/assets/web/team-duo.jpg",
  },
  {
    client: "AMAZON",
    sousTitre: "Centre logistique",
    resume: "Plusieurs dizaines de techniciens, une semaine sur deux.",
    href: "/preuves/amazon-centre-logistique/",
    image: "/assets/web/ph-technicien.jpg",
  },
  {
    client: "AKTID",
    sousTitre: "Montage d’un centre",
    resume: "12 monteurs, 8 engins de levage, 6 semaines.",
    href: "/preuves/aktid-centre-logistique/",
    image: "/assets/web/x-soudure.jpg",
  },
];

/* Mot pour mot la maquette : « +200 clients », règle validée par le client
   (« +200 clients, sans jamais préciser « réguliers » »). */
export const CHIFFRES: Chiffre[] = [
  { valeur: "+200", libelle: "clients" },
  { valeur: "28", libelle: "études de cas", accent: true },
  { valeur: "4,6/5", libelle: "avis Google" },
  { valeur: "10 %", libelle: "des techniciens retenus" },
];

/* --------------------------------------------------- panneau Ressources */

/**
 * Les CINQ familles de ressources, et rien d'autre : ce panneau annonce des
 * ressources, il mène à des ressources.
 *
 * RECOMPOSÉ LE 12/10, signalé par Mehdi : « dans le menu le bloc ressources ne
 * va pas. Fiche métiers, cela renvoie vers migen recrutement, mais pour la
 * partie ressources c'est pas ce à quoi on s'attend. »
 *
 * CE QUI ÉTAIT FAUX, et ce n'était pas la maquette. Son panneau porte trois
 * rangées, « 04 Articles », « 07 Fiches métier » et « 07 Fiches pratiques &
 * techniques », et ses trois gestes sont `goResArticle`, `goResMetier` et
 * `goResPratique`. Les trois appellent `openRes(kind)`, qui ouvre SA
 * bibliothèque filtrée sur le format : jamais son écran de recrutement, qui a
 * son propre geste, `goCarriere`. Rattacher « Fiches métier » à `/carriere/`
 * est donc une faute de portage, pas une fidélité.
 *
 * POURQUOI LA RANGÉE DISPARAÎT QUAND MÊME. Le site n'a aucune famille de
 * fiches métier sous `/ressources/` : les 13 pages métier sont les enfants de
 * `/carriere/` (gabarit « 07 Métier et carrière » dans
 * `maquette/contenu/site/index.json`). Pointer la rangée vers une famille qui
 * n'existe pas serait inventer une page ; la laisser sur `/carriere/` est le
 * défaut signalé. Elle sort donc du panneau, et le chemin vers les métiers
 * reste ouvert deux fois : « Je n'arrive pas à recruter » juste à côté, et
 * l'entrée de barre `NAV_CARRIERE`.
 *
 * ET DEUX FAMILLES RÉELLES Y ENTRENT. Le panneau n'exposait que 3 des 5
 * sous-rubriques servies : Process et Livres blancs n'avaient aucune porte
 * dans la navigation. La rangée fusionnée « Fiches pratiques & techniques »
 * est séparée en deux pour la même raison, les fiches techniques n'étaient
 * atteignables que par « Ma ligne s'arrête souvent ».
 *
 * LES LIBELLÉS ET LES DESCRIPTIONS NE SONT PAS RÉDIGÉS ICI : ils sont relus
 * dans la maquette, table `SHELF` de `site-final-autonome.html`, qui donne une
 * ligne par famille. « Ce qu'on observe en atelier » est gardé tel quel, c'est
 * la description du panneau pour Articles.
 *
 * ÉCARTS DE COPIE À ARBITRER PAR MEHDI, déclarés et non tranchés :
 *  - « Gestes, seuils, valeurs de référence » (description de la rangée
 *    fusionnée) n'a plus de rangée : chaque moitié reprend sa propre ligne de
 *    `SHELF`.
 *  - Livres blancs : `SHELF` écrit « Deux dossiers de fond, en échange d'un
 *    e-mail ». La seconde moitié est retirée, `/ressources/livres-blancs/` ne
 *    porte aujourd'hui aucun formulaire ni champ e-mail (mesuré en production
 *    le 12/10). Soit la page gagne son échange, soit la ligne reste courte.
 */
export const RES_FORMATS: FormatRessource[] = [
  {
    numero: "15",
    libelle: "Articles",
    description: "Ce qu’on observe en atelier",
    href: "/ressources/articles/",
  },
  {
    numero: "05",
    libelle: "Fiches pratiques",
    description: "À imprimer et à emporter en atelier",
    href: "/ressources/fiches-pratiques/",
  },
  {
    numero: "09",
    libelle: "Fiches techniques",
    description: "Les caractéristiques, sans commentaire",
    href: "/ressources/fiches-techniques/",
  },
  {
    numero: "04",
    libelle: "Process",
    description: "Nos procédures, publiées telles quelles",
    href: "/ressources/process/",
  },
  {
    numero: "02",
    libelle: "Livres blancs",
    description: "Deux dossiers de fond",
    href: "/ressources/livres-blancs/",
  },
];

/**
 * Le compte annoncé par le pied du panneau Ressources, SOMME des familles
 * ci-dessus et non une constante de son côté.
 *
 * LA MAQUETTE ÉCRIT « Les 23 ressources → », et 23 est juste CHEZ ELLE : sa
 * table `CATS` déclare 4 articles, 7 fiches métier, 3 fiches pratiques,
 * 3 process, 2 livres blancs et 4 fiches techniques, soit 23. Le site publié
 * n'a pas cette bibliothèque : 35 ressources réparties en 5 familles, et
 * aucune fiche métier sous `/ressources/`. Laisser 23 était annoncer un
 * inventaire qui n'existe pas.
 *
 * Le calcul remplace le chiffre écrit pour que l'écart ne puisse plus
 * réapparaître : ajouter ou retirer une famille corrige le pied tout seul.
 */
export const TOTAL_RESSOURCES = RES_FORMATS.reduce(
  (somme, format) => somme + Number(format.numero),
  0,
);

/**
 * Colonne de droite du panneau, les trois situations de la maquette, mot pour
 * mot. « Je n'arrive pas à recruter » vers `/carriere/` est légitime ici : la
 * colonne range par BESOIN, pas par format, et c'est bien la bonne réponse au
 * besoin. Les trois cibles répondent 200 en production, mesuré le 12/10.
 */
export const RES_SITUATIONS: Lien[] = [
  {
    libelle: "Ma ligne s’arrête souvent",
    href: "/ressources/fiches-techniques/",
  },
  { libelle: "Je prépare un arrêt", href: "/ressources/process/" },
  { libelle: "Je n’arrive pas à recruter", href: "/carriere/" },
];

/* ----------------------------------------------------- panneau À propos */

export const APROPOS_ENTREPRISE: LienDecrit[] = [
  {
    libelle: "Nous connaître",
    description: "Histoire, organisation, ce qu’on ne fait pas",
    href: "/nous-connaitre/",
  },
  {
    libelle: "Équipe & direction",
    description: "Les huit visages du siège, nom et e-mail",
    href: "/a-propos/equipe/",
  },
  {
    libelle: "Partenaires",
    description: "DimoMaint, Savoye",
    href: "/partenaires/",
  },
  {
    libelle: "Nos implantations",
    description: "Agences, villes et départements couverts",
    href: "/implantations/",
  },
];

export const APROPOS_ENGAGEMENTS: LienDecrit[] = [
  {
    libelle: "Nos valeurs",
    description: "Cinq règles, et la preuve qui va avec",
    href: "/valeurs/",
  },
  {
    libelle: "Engagements RSE",
    description: "Sécurité, emploi, retrofit, proximité",
    href: "/rse/",
  },
];

export const VILLES: Lien[] = [
  { libelle: "Lyon", href: "/implantations/lyon/" },
  { libelle: "Paris", href: "/implantations/paris/" },
  { libelle: "Nantes", href: "/implantations/nantes/" },
  { libelle: "Strasbourg", href: "/implantations/strasbourg/" },
  { libelle: "Toulouse", href: "/implantations/toulouse/" },
];

/* --------------------------------------------------------- tiroir tactile */

/**
 * Le lien « Accueil », seul au-dessus des groupes, comme la maquette mobile v2
 * le pose en tête de son menu.
 */
export const TIROIR_ACCUEIL: Lien = { libelle: "Accueil", href: "/" };

/**
 * Les six groupes du tiroir, repris du bloc `menuG` de la maquette mobile v2
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`) : libellés,
 * descriptions, sous-têtes orange et ordre tels qu'elle les rend, soit
 * 60 liens, plus « Accueil » ci-dessus. Les groupes « Ressources » et
 * « Carrière » y sont CALCULÉS depuis l'index des pages (sous-rubriques de
 * `/ressources/`, guides, fiches de `/carriere/`, libellés dérivés des h1 par
 * sa fonction `short`) : la liste écrite ici est le résultat de ce calcul sur
 * `maquette/contenu/site/index.json`, et `verification-tiroir.tsx` refait le
 * calcul à chaque exécution pour refuser l'écart, l'ellipse du guide comprise.
 *
 * TROIS ADRESSES SONT RAPPORTÉES AUX ROUTES RÉELLES, et c'est documenté
 * plutôt que silencieux : la maquette vise `/a-propos/nous-connaitre/`,
 * `/a-propos/valeurs/` et `/a-propos/rse/`, pages que ce site sert sur
 * `/nous-connaitre/`, `/valeurs/` et `/rse/` (routes statiques de `app/`,
 * voir `lib/routes-statiques.ts`). Aucun autre écart.
 *
 * Le compteur affiché à droite de chaque groupe n'est PAS écrit ici :
 * `TiroirMobile` compte les entrées de type « lien », comme la maquette
 * (`mg.n`). Un nombre écrit à la main dériverait en silence.
 */
export const TIROIR: SectionTiroir[] = [
  {
    libelle: "Nos offres",
    entrees: [
      {
        type: "lien",
        libelle: "migen© Résidence",
        href: "/offres/residence/",
        description: "Techniciens en résidence, intégrés à votre équipe.",
      },
      {
        type: "lien",
        libelle: "migen© Full service",
        href: "/offres/full-service/",
        description: "Toute votre maintenance, dans un seul contrat.",
      },
      {
        type: "lien",
        libelle: "migen© Zéro arrêt · abonnement",
        href: "/offres/zero-arret/",
        description: "Forfait mensuel : préventif, astreinte, curatif inclus.",
      },
      {
        type: "lien",
        libelle: "migen© Arrêt technique",
        href: "/offres/arret-technique/",
        description: "Arrêts planifiés, tenus à la demi-journée.",
      },
      { type: "sous-tete", libelle: "Conception et réalisation" },
      {
        type: "lien",
        libelle: "migen© Bureau d’études",
        href: "/offres/bureau-etudes/",
        description:
          "Conception, schémas électriques, mise en conformité machine.",
      },
      {
        type: "lien",
        libelle: "migen© Travaux industriels",
        href: "/travaux-industriels/",
        description: "Transfert, montage, démantèlement, levage.",
      },
      { type: "sous-tete", libelle: "Aller plus loin" },
      {
        type: "lien",
        libelle: "Diagnostic gratuit",
        href: "/diagnostic-zero-arret/",
      },
      { type: "lien", libelle: "Partenaires", href: "/partenaires/" },
      { type: "lien", libelle: "Toutes les offres", href: "/offres/" },
    ],
  },
  {
    libelle: "Expertises",
    entrees: [
      { type: "sous-tete", libelle: "Domaines d’activité" },
      { type: "lien", libelle: "Mécanique", href: "/expertises/mecanique/" },
      { type: "lien", libelle: "Hydraulique", href: "/expertises/hydraulique/" },
      {
        type: "lien",
        libelle: "Électromécanique",
        href: "/expertises/electromecanique/",
      },
      { type: "lien", libelle: "Soudure", href: "/expertises/soudure/" },
      { type: "lien", libelle: "Électrique", href: "/expertises/electrique/" },
      { type: "lien", libelle: "Tuyauterie", href: "/expertises/tuyauterie/" },
      { type: "lien", libelle: "Pneumatique", href: "/expertises/pneumatique/" },
      { type: "lien", libelle: "Automatisme", href: "/expertises/automatisme/" },
      { type: "lien", libelle: "Robotique", href: "/expertises/robotique/" },
      { type: "sous-tete", libelle: "Secteurs d’activité" },
      {
        type: "lien",
        libelle: "Centre logistique",
        href: "/secteurs/logistique/",
      },
      {
        type: "lien",
        libelle: "Aéronautique",
        href: "/secteurs/aeronautique/",
      },
      {
        type: "lien",
        libelle: "Industrie lourde",
        href: "/secteurs/industrie-lourde/",
      },
      {
        type: "lien",
        libelle: "Pharmaceutique",
        href: "/secteurs/pharmaceutique/",
      },
      {
        type: "lien",
        libelle: "Industrie métallique",
        href: "/secteurs/industrie-metallique/",
      },
      { type: "lien", libelle: "Chimie", href: "/secteurs/chimie/" },
      { type: "lien", libelle: "Automobile", href: "/secteurs/automobile/" },
      {
        type: "lien",
        libelle: "Agroalimentaire",
        href: "/secteurs/agroalimentaire/",
      },
      {
        type: "lien",
        libelle: "Menuiserie industrielle",
        href: "/secteurs/menuiserie-industrielle/",
      },
      { type: "sous-tete", libelle: "Par constructeur" },
      {
        type: "lien",
        libelle: "Automaticien SIEMENS",
        href: "/expertises/automatisme/siemens/",
      },
      {
        type: "lien",
        libelle: "Automaticien Schneider",
        href: "/expertises/automatisme/schneider/",
      },
      {
        type: "lien",
        libelle: "Roboticien FANUC",
        href: "/expertises/robotique/fanuc/",
      },
      {
        type: "lien",
        libelle: "Roboticien ABB",
        href: "/expertises/robotique/abb/",
      },
      { type: "lien", libelle: "Toutes nos expertises", href: "/expertises/" },
    ],
  },
  {
    libelle: "Cas clients",
    entrees: [
      {
        type: "lien",
        libelle: "DANONE · lignes de production",
        href: "/preuves/danone-lignes-de-production/",
        description: "Deux techniciens en 3x8, lignes liquides et poudre.",
      },
      {
        type: "lien",
        libelle: "AMAZON · centre logistique",
        href: "/preuves/amazon-centre-logistique/",
        description: "Plusieurs dizaines de techniciens, une semaine sur deux.",
      },
      {
        type: "lien",
        libelle: "AKTID · centre logistique",
        href: "/preuves/aktid-centre-logistique/",
        description: "Montage d’un centre logistique.",
      },
      { type: "lien", libelle: "Toutes les études de cas", href: "/preuves/" },
    ],
  },
  {
    libelle: "Ressources",
    entrees: [
      { type: "lien", libelle: "Articles", href: "/ressources/articles/" },
      {
        type: "lien",
        libelle: "Fiches pratiques",
        href: "/ressources/fiches-pratiques/",
      },
      {
        type: "lien",
        libelle: "Fiches techniques",
        href: "/ressources/fiches-techniques/",
      },
      {
        type: "lien",
        libelle: "Livres blancs",
        href: "/ressources/livres-blancs/",
      },
      { type: "lien", libelle: "Process", href: "/ressources/process/" },
      {
        /* L'ellipse est celle de la maquette : son `short` coupe à 54 signes
           le h1 « Comment choisir une entreprise de maintenance industrielle ». */
        type: "lien",
        libelle: "Comment choisir une entreprise de maintenance…",
        href: "/guides/choisir-une-entreprise-de-maintenance/",
      },
      {
        type: "lien",
        libelle: "Réussir un transfert industriel",
        href: "/guides/reussir-un-transfert-industriel/",
      },
      { type: "lien", libelle: "Toutes les ressources", href: "/ressources/" },
    ],
  },
  {
    libelle: "À propos",
    entrees: [
      { type: "lien", libelle: "Nous connaître", href: "/nous-connaitre/" },
      { type: "lien", libelle: "Nos valeurs", href: "/valeurs/" },
      { type: "lien", libelle: "Engagements RSE", href: "/rse/" },
      {
        type: "lien",
        libelle: "Équipe et direction",
        href: "/a-propos/equipe/",
      },
      { type: "lien", libelle: "Nos implantations", href: "/implantations/" },
      {
        type: "lien",
        libelle: "Entreprise de maintenance industrielle",
        href: "/entreprise-maintenance-industrielle/",
      },
    ],
  },
  {
    libelle: "Carrière",
    entrees: [
      {
        type: "lien",
        libelle: "Agent de maintenance industrielle",
        href: "/carriere/agent-de-maintenance/",
      },
      {
        type: "lien",
        libelle: "Alternance maintenance industrielle",
        href: "/carriere/alternance/",
      },
      { type: "lien", libelle: "Automaticien", href: "/carriere/automaticien/" },
      {
        type: "lien",
        libelle: "Électromécanicien",
        href: "/carriere/electromecanicien/",
      },
      {
        type: "lien",
        libelle: "Responsable maintenance",
        href: "/carriere/responsable-maintenance/",
      },
      { type: "lien", libelle: "Roboticien", href: "/carriere/roboticien/" },
      {
        type: "lien",
        libelle: "Technicien de maintenance",
        href: "/carriere/technicien-de-maintenance/",
      },
      {
        type: "lien",
        libelle: "Technicien de maintenance itinérant",
        href: "/carriere/technicien-itinerant/",
      },
      { type: "lien", libelle: "Test technicien", href: "/test-technicien/" },
      { type: "lien", libelle: "Rejoindre migen", href: "/carriere/" },
    ],
  },
];

/** Tiroir de la landing page : les ancres de la page, et rien d'autre. */
export const TIROIR_LP: Lien[] = [
  { libelle: "Solutions", href: "#lp-solutions" },
  { libelle: "Méthode", href: "#lp-methode" },
  { libelle: "Témoignages", href: "#lp-temoignages" },
  { libelle: "Questions fréquentes", href: "#lp-faq" },
  { libelle: "Contact", href: "#lp-contact" },
];
