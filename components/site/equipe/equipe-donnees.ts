import type { StaticImageData } from "next/image";

import faustineChalayer from "./portraits/faustine-chalayer.jpg";
import louiseMercier from "./portraits/louise-mercier.jpg";
import mehdiAttaf from "./portraits/mehdi-attaf.jpg";
import mehdiToumi from "./portraits/mehdi-toumi.jpg";
import melanieRosset from "./portraits/melanie-rosset.jpg";
import nathanJorez from "./portraits/nathan-jorez.jpg";
import pierreBeck from "./portraits/pierre-beck.jpg";
import thomasPuthod from "./portraits/thomas-puthod.jpg";

/**
 * Le contenu de l'écran « Équipe / Direction », relu sur la capture
 * `maquette/rendu/a-propos--equipe.html` (référence de la page).
 *
 * Il vit ici, en données typées, parce que l'écran est UNIQUE : aucune autre
 * page ne réemploie sa mise en page. Le corpus éditorial indexé reste en base,
 * cet habillage de page non.
 *
 * LES PORTRAITS sont ceux que la maquette autonome affiche, extraits octet pour
 * octet de ses ressources le 08/10 (`portraits/`). Importés statiquement : Next
 * les optimise et connaît leurs dimensions, sans rien poser dans `public/`.
 */

/**
 * Le H1 de la page, et le repli de son meta title.
 *
 * Les deux vivent ici, et non dans `app/a-propos/equipe/page.tsx`, pour deux raisons :
 * Next n'attend que ses propres exports nommés dans un fichier de route, et le
 * contrôle a besoin de comparer les deux chaînes sans monter la page.
 *
 * LE TITRE NE DOIT JAMAIS ÉGALER LE H1 : le premier se lit dans une page de
 * résultats, le second dans la page.
 */
export const H1 = "Celles et ceux qui portent vos projets.";

/** L'adresse de l'écran dans `routes.csv` et dans le menu : la canonique. */
export const CHEMIN = "/a-propos/equipe/";

export const TITRE_PAR_DEFAUT =
  "Équipe et direction Migen, maintenance industrielle";

export const DESCRIPTION_PAR_DEFAUT =
  "La direction, les responsables et les techniciens de Migen : qui décide, qui organise et qui intervient sur votre site.";

export interface Personne {
  nom: string;
  fonction: string;
  /** Le portrait de la maquette. Absent : le cadre reste au jeton `--ph`. */
  photo?: StaticImageData | string;
}

export interface GroupePersonnes {
  /** Le surtitre orange du groupe. */
  titre: string;
  personnes: readonly Personne[];
}

export const DIRECTION: GroupePersonnes = {
  titre: "Direction",
  personnes: [
    { nom: "Nathan Jorez", fonction: "CEO", photo: nathanJorez },
    { nom: "Mehdi Toumi", fonction: "Directeur pôle Travaux", photo: mehdiToumi },
    { nom: "Thomas Puthod", fonction: "Directeur commercial avant-vente", photo: thomasPuthod },
    { nom: "Mehdi Attaf", fonction: "Directeur Marketing & Revops", photo: mehdiAttaf },
  ],
};

export const SUPPORT: GroupePersonnes = {
  titre: "Ressources humaines, staffing et finance",
  personnes: [
    { nom: "Faustine Chalayer", fonction: "Responsable Ressources Humaines", photo: faustineChalayer },
    { nom: "Mélanie Rosset", fonction: "Responsable Staffing", photo: melanieRosset },
    { nom: "Louise Mercier", fonction: "Responsable Admin. & Financier", photo: louiseMercier },
    { nom: "Pierre Beck", fonction: "Responsable Recrutement", photo: pierreBeck },
  ],
};

export interface Chiffre {
  valeur: string;
  libelle: string;
  texte: string;
  /** La première carte est sur fond sombre dans la maquette. */
  sombre?: boolean;
}

export const CHIFFRES: readonly Chiffre[] = [
  {
    valeur: "2021",
    libelle: "Année de création",
    texte:
      "Fondée par Nathan Jorez, l’entreprise pilote son activité depuis son siège d’Écully.",
    sombre: true,
  },
  {
    valeur: "+120",
    libelle: "Collaborateurs",
    texte:
      "Techniciens, chargés d’affaires, référents techniques et fonctions support, répartis sur quatre agences.",
  },
  {
    valeur: "+200",
    libelle: "Clients accompagnés",
    texte: "De la PME à l’industrie lourde, en France entière.",
  },
];

export interface Jalon {
  repere: string;
  titre: string;
  texte: string;
  /** La pastille du jalon courant est pleine, les autres sont creuses. */
  courant?: boolean;
}

export const JALONS: readonly Jalon[] = [
  {
    repere: "2021",
    titre: "La création",
    texte:
      "Nathan Jorez fonde Migen à Lyon avec une conviction : la maintenance se juge sur l’état des lignes, pas sur les promesses.",
  },
  {
    repere: "Étape 2",
    titre: "La construction du réseau",
    texte:
      "Quatre agences ouvrent pour suivre les clients là où sont leurs usines : Lyon (siège), Montréal, Dubaï, Madrid.",
  },
  {
    repere: "Aujourd’hui",
    titre: "L’exigence inchangée",
    texte:
      "Plus de 120 techniciens, plus de 200 clients accompagnés, et une exigence de recrutement inchangée : 10 % des techniciens retenus.",
    courant: true,
  },
];

export interface Etape {
  rang: string;
  titre: string;
  texte: string;
}

export const ETAPES_SELECTION: readonly Etape[] = [
  {
    rang: "01",
    titre: "L’entretien technique",
    texte:
      "Chaque technicien est évalué sur des cas réels de son métier : diagnostic, méthode, gestes de sécurité. Pas de recrutement sur CV seul.",
  },
  {
    rang: "02",
    titre: "L’entretien comportemental",
    texte:
      "Un technicien travaille chez vous, avec vos équipes : posture, communication et fiabilité pèsent autant que la technique.",
  },
  {
    rang: "03",
    titre: "Les résultats partagés",
    texte:
      "Pour un poste en résidence, les résultats d’évaluation vous sont présentés avant votre décision. Vous validez, ou nous cherchons encore.",
  },
];

export interface Agence {
  ville: string;
  precision: string;
  /** Le siège porte le fond orange de la maquette. */
  siege?: boolean;
}

export const AGENCES: readonly Agence[] = [
  { ville: "Lyon", precision: "Siège · Écully", siege: true },
  { ville: "Montréal", precision: "Canada" },
  { ville: "Dubaï", precision: "Émirats arabes unis" },
  { ville: "Madrid", precision: "Espagne" },
];

export const HUBS: readonly string[] = [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
];

export interface Engagement {
  rang: string;
  titre: string;
  texte: string;
}

export const ENGAGEMENTS: readonly Engagement[] = [
  {
    rang: "01",
    titre: "Rappel dans l’heure",
    texte:
      "Toute demande reçue du lundi au vendredi, de 8h00 à 18h30, est rappelée dans l’heure par un chargé d’affaires.",
  },
  {
    rang: "02",
    titre: "Astreinte en option",
    texte:
      "Pour couvrir les nuits, les week-ends et les jours fériés, avec un circuit d’appel écrit.",
  },
  {
    rang: "03",
    titre: "Transparence complète",
    texte:
      "Périmètre écrit, pièces au prix réel du marché, comptes rendus dans votre GMAO. Nos études de cas sont documentées et vérifiables.",
  },
];

export interface Question {
  question: string;
  reponse: string;
}

export const QUESTIONS: readonly Question[] = [
  {
    question: "Qui est mon interlocuteur au quotidien ?",
    reponse:
      "Le chargé d’affaires. Il qualifie votre demande, chiffre la mission, puis la suit jusqu’à la fin : un seul point de contact, du premier appel au compte rendu.",
  },
  {
    question: "Le technicien qui intervient sur mon site est-il seul décideur ?",
    reponse:
      "Non. Le référent technique encadre chaque intervention et contrôle la qualité. Sur une panne complexe, les spécialistes du groupe, automaticiens ou roboticiens, viennent en renfort.",
  },
  {
    question:
      "Comment savoir si un technicien est fiable avant qu’il arrive chez moi ?",
    reponse:
      "Il a passé un entretien technique sur des cas réels, puis un entretien comportemental. Seuls 10 % des techniciens sont retenus.",
  },
  {
    question:
      "Pour un poste en résidence, ai-je mon mot à dire sur le choix du technicien ?",
    reponse:
      "Oui. Les résultats de son évaluation vous sont présentés avant votre décision. Vous validez, ou nous cherchons encore.",
  },
  {
    question:
      "Le hub de techniciens le plus proche de mon site est-il le seul à pouvoir intervenir ?",
    reponse:
      "Non. Les quatre agences et leurs hubs techniques mobilisent la compétence disponible sur tout le territoire, pas seulement l’agence locale.",
  },
  {
    question: "Comment vous contacter directement ?",
    reponse:
      "Au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Votre demande est rappelée dans l’heure par un chargé d’affaires.",
  },
];

export interface Relais {
  rang: string;
  titre: string;
  texte: string;
  /** Le dernier relais est sur fond sombre dans la maquette. */
  sombre?: boolean;
}

export const RELAIS: readonly Relais[] = [
  {
    rang: "01",
    titre: "Le chargé d’affaires",
    texte:
      "Nommé pour votre site. Il qualifie le besoin, chiffre et reste votre interlocuteur sur toute la durée.",
  },
  {
    rang: "02",
    titre: "Le coordinateur des opérations",
    texte:
      "Il sélectionne les techniciens, vérifie les habilitations et organise l’arrivée sur site.",
  },
  {
    rang: "03",
    titre: "Le technicien",
    texte:
      "Présenté avant de commencer, validé par vous. Un compte rendu à chaque intervention.",
    sombre: true,
  },
];
