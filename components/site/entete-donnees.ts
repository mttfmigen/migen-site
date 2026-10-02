/**
 * Entrées de navigation, en données plutôt qu'en balisage répété.
 *
 * Deux sources, et c'est voulu : la maquette « Site final » pilote les
 * mega-menus du bureau, la maquette « Mobile » pilote le tiroir tactile. Leurs
 * listes ne sont pas les mêmes (le tiroir ajoute « Nucléaire », « Tous les
 * métiers », « Tous les secteurs »). Les fusionner produirait une liste que le
 * client n'a validée ni d'un côté ni de l'autre, donc chacune reste à sa place.
 *
 * Les `href` viennent tous de `docs/urls-site-actuel.json`. Aucun chemin
 * inventé : les deux entrées de la maquette sans URL existante (Diagnostic
 * Zéro arrêt, Test technicien) sont passées en props à l'en-tête, et l'entrée
 * ne s'affiche pas si l'appelant ne fournit rien.
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
  /** Compteur de la maquette, affiché en chiffres monospace. */
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

export interface SectionTiroir {
  libelle: string;
  description: string;
  liens: Lien[];
}

/* ------------------------------------------------------------------ barre */

/** Les cinq entrées qui ouvrent un panneau, dans l'ordre de la maquette. */
export const NAV_PANNEAUX: { id: PanneauId; libelle: string }[] = [
  { id: "offres", libelle: "Offres" },
  { id: "expertises", libelle: "Expertises" },
  { id: "preuves", libelle: "Cas clients" },
  { id: "ressources", libelle: "Ressources" },
  { id: "apropos", libelle: "À propos" },
];

/** Sixième entrée, sans panneau : elle ferme celui qui serait ouvert. */
export const NAV_CARRIERE: Lien = { libelle: "Carrière", href: "/carriere/" };

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
    href: "/offres/maintenance-externalisee/",
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

/* « +200 clients » dans la maquette. Le compte tenu par Migen est « plus de 120
   clients, dont plus de 80 réguliers » : c'est la formulation mandatée, et un
   chiffre public faux est un risque, pas un détail de copie. Corrigé partout où
   il était rendu (en-tête, héros, bande de logos, frise, bande de chiffres). */
export const CHIFFRES: Chiffre[] = [
  { valeur: "+120", libelle: "clients" },
  { valeur: "28", libelle: "études de cas", accent: true },
  { valeur: "4,6/5", libelle: "avis Google" },
  { valeur: "10 %", libelle: "des candidats retenus" },
];

/* --------------------------------------------------- panneau Ressources */

export const RES_FORMATS: FormatRessource[] = [
  {
    numero: "04",
    libelle: "Articles",
    description: "Ce qu’on observe en atelier",
    href: "/ressources/articles/",
  },
  {
    numero: "07",
    libelle: "Fiches métier",
    description: "Journée type, salaire, évolution",
    href: "/carriere/",
  },
  {
    numero: "07",
    libelle: "Fiches pratiques & techniques",
    description: "Gestes, seuils, valeurs de référence",
    href: "/ressources/fiches-pratiques/",
  },
];

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
    href: "/equipe/",
  },
  {
    libelle: "Partenaires",
    description: "DimoMaint, Savoye, Orthus",
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
 * Sections dépliantes du tiroir, reprises de la maquette Mobile (groupes
 * `GROUPS` de son script) : libellés, descriptions et URL telles qu'elle les
 * déclare. Trois cibles y étaient des écrans du prototype et non des URL :
 * « Nos réalisations » et « Notre sélection 10 % » sont rattachées à leurs
 * pages réelles, « Postuler » au formulaire de contact.
 */
export const TIROIR: SectionTiroir[] = [
  {
    libelle: "Nos offres",
    description: "Résidence, Zéro arrêt, Arrêt technique…",
    liens: [
      { libelle: "Résidence", href: "/offres/residence/" },
      { libelle: "Zéro arrêt", href: "/offres/zero-arret/" },
      { libelle: "Arrêt technique", href: "/offres/arret-technique/" },
      { libelle: "Dépannage", href: "/offres/depannage-industriel/" },
      { libelle: "Travaux industriels", href: "/travaux-industriels/" },
      { libelle: "Bureau d’études", href: "/bureau-etudes/" },
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
      {
        libelle: "Industrie métallique",
        href: "/secteurs/industrie-metallique/",
      },
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
      { libelle: "Nos réalisations", href: "/realisations/" },
      {
        libelle: "Notre sélection 10 %",
        href: "/ressources/process/selection-des-techniciens/",
      },
      { libelle: "Nos hubs en France", href: "/implantations/" },
      { libelle: "L’équipe", href: "/a-propos/equipe/" },
      { libelle: "Ressources", href: "/ressources/" },
    ],
  },
  {
    libelle: "Carrière",
    description: "On recrute des techniciens",
    liens: [
      { libelle: "Nos métiers", href: "/carriere/" },
      { libelle: "Alternance", href: "/carriere/alternance/" },
      { libelle: "Postuler", href: "/contact/" },
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
