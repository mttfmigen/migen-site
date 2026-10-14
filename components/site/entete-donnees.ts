/**
 * Entrées de navigation, en données plutôt qu'en balisage répété.
 *
 * Deux sources, et c'est voulu : la maquette « Site final » pilote les
 * mega-menus du bureau, la maquette MOBILE du colis du 14/10
 * (`maquette/colis-14-10/MigenMobile.dc.html`) pilote le tiroir tactile. Leurs
 * listes ne sont pas les mêmes, et chacune reste à sa place.
 *
 * Aucun chemin inventé : chaque `href` du tiroir est une page de
 * `maquette/contenu/site/index.json`, une route statique de `app/`, ou la
 * réécriture `/diagnostic-zero-arret/` de `next.config.ts`
 * (`verification-tiroir.tsx` le revérifie). Pour les mega-menus, l'entrée
 * « Diagnostic gratuit » reste passée en props à l'en-tête, et ne s'affiche
 * pas si l'appelant ne fournit rien.
 */

export type PanneauId = "offres" | "expertises" | "preuves" | "ressources";

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

/**
 * Un groupe dépliable du tiroir : un titre, sa ligne grise, ses liens. C'est
 * l'objet `{ l, d, items }` du tableau `GROUPS` de la maquette mobile.
 */
export interface SectionTiroir {
  libelle: string;
  description: string;
  liens: Lien[];
}

/* ------------------------------------------------------------------ barre */

/**
 * Les quatre entrées qui ouvrent un panneau, dans l'ordre de la barre.
 *
 * LA BARRE DU COLIS DU 14/10, tranchée par Mehdi le 14/10 vers 15 h 30 :
 * Offres, Expertises, Réalisations, Ressources, Carrière, puis « Décrire mon
 * besoin ». C'est la barre de `Migen - Ressources v2.dc.html` (sa `<nav>`,
 * relue par `verification-entete.tsx`). Elle remplace les choix du 12/10
 * (« Cas clients », « À propos », « Rejoindre migen » et le téléphone dans la
 * barre).
 *
 * « Réalisations » mène à `/preuves/` : c'est la cible de `goReal` dans
 * « Migen - Site final.dc.html » (`this.cxGo("/preuves/")`), et elle ouvre le
 * panneau des études de cas, celui de l'ancienne entrée « Cas clients ».
 *
 * Chaque entrée est un vrai lien depuis le 11/10 : le survol et le focus
 * clavier ouvrent le panneau, le clic mène à la page.
 */
export const NAV_PANNEAUX: { id: PanneauId; libelle: string; href: string }[] = [
  { id: "offres", libelle: "Offres", href: "/offres/" },
  { id: "expertises", libelle: "Expertises", href: "/expertises/" },
  { id: "preuves", libelle: "Réalisations", href: "/preuves/" },
  { id: "ressources", libelle: "Ressources", href: "/ressources/" },
];

/**
 * Cinquième entrée, sans panneau : elle ferme celui qui serait ouvert.
 * Libellé et cible de la maquette (`goCarriere`, `this.cxGo("/carriere/")`).
 */
export const NAV_CARRIERE: Lien = {
  libelle: "Carrière",
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
/*
 * ORDRE DU HUB DEPUIS LE 14/10 : Articles, Fiches pratiques, Fiches techniques,
 * Livres blancs, Process, c'est l'ordre de la colonne « Format » de l'espace
 * Entreprises du hub /ressources/ (maquette Ressources v2, `FORMATS.ent` de
 * `ressources-hub/v2/filtrage.ts`). Le panneau et le hub disent la même chose
 * dans le même ordre ; `scripts/verifie-menu-ressources.mjs` le tient.
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
    numero: "02",
    libelle: "Livres blancs",
    description: "Deux dossiers de fond",
    href: "/ressources/livres-blancs/",
  },
  {
    numero: "04",
    libelle: "Process",
    description: "Nos procédures, publiées telles quelles",
    href: "/ressources/process/",
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

/**
 * « À la une » du panneau Ressources : les trois articles que le hub
 * /ressources/ met à la une (liste `UNE` de `ressources-hub/v2/HubRessources.tsx`),
 * dans son ordre, avec SON titre, SA photo et SA durée (« 11 min de lecture »,
 * le libellé de ses cartes). Rien n'est rédigé ici : la porte
 * `scripts/verifie-menu-ressources.mjs` relit le hub et refuse tout écart.
 *
 * Recopié plutôt qu'importé : `donnees.ts` du hub pèse ses 28 contenus, et
 * l'en-tête est un composant client chargé sur chaque page.
 */
export const RES_A_LA_UNE: Offre[] = [
  {
    libelle: "Coût d'un arrêt de production",
    description: "11 min de lecture",
    href: "/ressources/articles/cout-arret-de-production/",
    image: "/assets/web/x-auto-ligne.jpg",
  },
  {
    libelle: "IA maintenance : ce qui change vraiment",
    description: "8 min de lecture",
    href: "/ressources/articles/ia-maintenance/",
    image: "/assets/web/ph-robots-solaire.jpg",
  },
  {
    libelle: "Comment organiser un service de maintenance",
    description: "9 min de lecture",
    href: "/ressources/articles/organiser-service-maintenance/",
    image: "/assets/web/team-duo.jpg",
  },
];

/* --------------------------------------------------------- tiroir tactile */

/**
 * « Accueil », libellé de la racine. Le tiroir du 14/10 ne le porte plus (le
 * logo de la pilule mène à l'accueil, comme dans la maquette mobile) ; le plan
 * du site, lui, s'en sert pour nommer la racine.
 */
export const TIROIR_ACCUEIL: Lien = { libelle: "Accueil", href: "/" };

/**
 * Les cinq groupes du tiroir, repris du tableau `GROUPS` de la maquette mobile
 * du colis du 14/10 (`maquette/colis-14-10/MigenMobile.dc.html`) : titres,
 * lignes grises, libellés et ordre tels qu'elle les écrit.
 * `verification-tiroir.tsx` relit ce tableau à chaque exécution et refuse
 * l'écart.
 *
 * TROIS ADAPTATIONS, déclarées et revérifiées par la porte :
 *  - « Bureau d’études » : la maquette vise `/bureau-etudes/`, qui sert le
 *    MÊME h1 que `/offres/bureau-etudes/`. Le panneau Offres du bureau et le
 *    pied de page visent `/offres/bureau-etudes/` : le tiroir fait de même,
 *    pour ne pas pousser la page en double.
 *  - « Toutes les pages » : la maquette ouvre son écran « browse », la liste
 *    de toutes ses pages. Le site la sert sur `/plan-du-site/`, que le pied de
 *    page appelle déjà « Toutes nos pages ».
 *  - « Postuler » : la maquette ouvre son formulaire. Sur le site, c'est le
 *    formulaire de candidature de `/carriere/`, ancre `#postuler`.
 *
 * UNE ENTRÉE RETIRÉE, faute de page : « Notre sélection 10 % » ouvre l'écran
 * « process » de la maquette, qui n'a pas d'adresse sur le site. Elle revient
 * le jour où une page ou une ancre la porte (à trancher par Mehdi).
 */
export const TIROIR: SectionTiroir[] = [
  {
    libelle: "Nos offres",
    description: "Résidence, Full service, Zéro arrêt…",
    liens: [
      { libelle: "Résidence", href: "/offres/residence/" },
      { libelle: "Full service", href: "/offres/full-service/" },
      { libelle: "Zéro arrêt", href: "/offres/zero-arret/" },
      { libelle: "Arrêt technique", href: "/offres/arret-technique/" },
      { libelle: "Dépannage", href: "/offres/depannage-industriel/" },
      { libelle: "Travaux industriels", href: "/travaux-industriels/" },
      { libelle: "Bureau d’études", href: "/offres/bureau-etudes/" },
      { libelle: "Toutes les offres", href: "/offres/" },
    ],
  },
  {
    libelle: "Expertises métiers",
    description: "Automatisme, électrique, mécanique…",
    liens: [
      { libelle: "Automatisme", href: "/expertises/automatisme/" },
      { libelle: "Électrique", href: "/expertises/electrique/" },
      { libelle: "Électromécanique", href: "/expertises/electromecanique/" },
      { libelle: "Mécanique", href: "/expertises/mecanique/" },
      { libelle: "Hydraulique", href: "/expertises/hydraulique/" },
      { libelle: "Pneumatique", href: "/expertises/pneumatique/" },
      { libelle: "Robotique", href: "/expertises/robotique/" },
      { libelle: "Soudure", href: "/expertises/soudure/" },
      { libelle: "Tuyauterie", href: "/expertises/tuyauterie/" },
      { libelle: "Tous les métiers", href: "/expertises/" },
    ],
  },
  {
    libelle: "Expertises sectorielles",
    description: "Agroalimentaire, automobile, logistique…",
    liens: [
      { libelle: "Agroalimentaire", href: "/secteurs/agroalimentaire/" },
      { libelle: "Automobile", href: "/secteurs/automobile/" },
      { libelle: "Logistique", href: "/secteurs/logistique/" },
      { libelle: "Chimie", href: "/secteurs/chimie/" },
      { libelle: "Pharmaceutique", href: "/secteurs/pharmaceutique/" },
      { libelle: "Aéronautique", href: "/secteurs/aeronautique/" },
      { libelle: "Industrie métallique", href: "/secteurs/industrie-metallique/" },
      { libelle: "Industrie lourde", href: "/secteurs/industrie-lourde/" },
      { libelle: "Nucléaire", href: "/secteurs/nucleaire/" },
      {
        libelle: "Menuiserie industrielle",
        href: "/secteurs/menuiserie-industrielle/",
      },
      { libelle: "Tous les secteurs", href: "/secteurs/" },
    ],
  },
  {
    libelle: "Migen",
    description: "Qui nous sommes, où nous sommes",
    liens: [
      { libelle: "Nos réalisations", href: "/preuves/" },
      { libelle: "Nos hubs en France", href: "/implantations/" },
      { libelle: "L’équipe", href: "/a-propos/equipe/" },
      { libelle: "Ressources", href: "/ressources/" },
      { libelle: "Toutes les pages", href: "/plan-du-site/" },
    ],
  },
  {
    libelle: "Carrière",
    description: "On recrute des techniciens",
    liens: [
      { libelle: "Nos métiers", href: "/carriere/" },
      { libelle: "Alternance", href: "/carriere/alternance/" },
      { libelle: "Postuler", href: "/carriere/#postuler" },
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
