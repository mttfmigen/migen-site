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

/** Un format d'un espace du hub /ressources/, et son nombre de contenus. */
export interface FormatEspace {
  libelle: string;
  nombre: number;
}

/** Un espace du hub /ressources/ (« Entreprises », « Techniciens »). */
export interface EspaceRessources {
  libelle: string;
  formats: FormatEspace[];
}

/** Un article « À la une » du hub, en carte à photo dans le panneau. */
export interface ArticleALaUne extends Lien {
  image: string;
  format: string;
  minutes: number;
}

/**
 * REFAIT LE 14/10, demandé par Mehdi : « dans le menu ressources il y a plein
 * de trucs type articles etc. qui renvoient vers d'autres pages ressources hors
 * maquette, de l'ancienne maquette qui ne devrait plus exister ».
 *
 * LE PANNEAU NE MÈNE PLUS QU'À LA MAQUETTE RESSOURCES V2 : le hub /ressources/
 * et ses contenus. Sont retirés : les cinq sous-rubriques de l'ancienne
 * maquette (articles, fiches pratiques, fiches techniques, livres blancs,
 * process : les quatre derniers formats sont en pause, décision de Mehdi), la
 * colonne « Par situation » qui y menait, et les deux guides du tiroir.
 *
 * Les deux espaces du hub, avec les libellés de ses formats (`FORMATS` de
 * `ressources-hub/v2/filtrage.ts`) et ses VRAIS comptes (`donnees.ts`). Seuls
 * les formats qui ont des contenus publiés sont listés. Recopiés plutôt
 * qu'importés : `donnees.ts` porte les 40 contenus, et l'en-tête est un
 * composant client chargé sur chaque page. `scripts/verifie-menu-ressources.mjs`
 * recompte le hub à chaque exécution et refuse tout écart.
 */
export const RES_ESPACES: EspaceRessources[] = [
  {
    libelle: "Entreprises",
    formats: [{ libelle: "Articles", nombre: 27 }],
  },
  {
    libelle: "Techniciens",
    formats: [
      { libelle: "Fiches métiers", nombre: 7 },
      { libelle: "Guides carrière", nombre: 5 },
      { libelle: "Alternance", nombre: 1 },
    ],
  },
];

/**
 * « À la une » du panneau Ressources : les trois articles que le hub
 * /ressources/ met à la une (liste `UNE` de `ressources-hub/v2/HubRessources.tsx`),
 * dans son ordre, avec SON titre, SA photo, SON format et SA durée. Rien n'est
 * rédigé ici : `scripts/verifie-menu-ressources.mjs` relit le hub et refuse
 * tout écart.
 */
export const RES_A_LA_UNE: ArticleALaUne[] = [
  {
    libelle: "Coût d'un arrêt de production",
    href: "/ressources/articles/cout-arret-de-production/",
    image: "/assets/web/x-auto-ligne.jpg",
    format: "Article",
    minutes: 11,
  },
  {
    libelle: "IA maintenance : ce qui change vraiment",
    href: "/ressources/articles/ia-maintenance/",
    image: "/assets/web/ph-robots-solaire.jpg",
    format: "Article",
    minutes: 8,
  },
  {
    libelle: "Comment organiser un service de maintenance",
    href: "/ressources/articles/organiser-service-maintenance/",
    image: "/assets/web/team-duo.jpg",
    format: "Article",
    minutes: 9,
  },
];

/** « 11 min de lecture », le libellé des cartes du hub. */
export const dureeLecture = (article: ArticleALaUne): string =>
  `${article.minutes} min de lecture`;

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
 * 60 liens, plus « Accueil » ci-dessus. Le groupe « Carrière » y est CALCULÉ
 * depuis l'index des pages (fiches de `/carriere/`, libellés dérivés des h1
 * par sa fonction `short`) : la liste écrite ici est le résultat de ce calcul
 * sur `maquette/contenu/site/index.json`, et `verification-tiroir.tsx` refait
 * le calcul à chaque exécution pour refuser l'écart. Le groupe « Ressources »
 * s'en écarte depuis le 14/10 : il suit le hub /ressources/ (maquette
 * Ressources v2), comme le panneau du bureau.
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
    /* REFAIT LE 14/10, à la logique du panneau du bureau : plus aucune
       sous-rubrique de l'ancienne maquette ni guide, seulement la maquette
       Ressources v2. Écart déclaré avec le `menuG` de la maquette mobile v2,
       recalculé depuis le hub par `verification-tiroir.tsx`. */
    entrees: [
      { type: "sous-tete", libelle: "À la une" },
      ...RES_A_LA_UNE.map(
        (article): EntreeTiroir => ({
          type: "lien",
          libelle: article.libelle,
          href: article.href,
          description: `${article.format} · ${dureeLecture(article)}`,
        }),
      ),
      /* 14/10, Mehdi : catégories masquées, un bouton vers le hub. */
      { type: "lien", libelle: "Accéder à toutes nos ressources", href: "/ressources/" },
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
