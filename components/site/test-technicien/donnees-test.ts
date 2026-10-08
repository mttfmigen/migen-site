/**
 * GÉNÉRÉ, ne pas éditer à la main :
 *   bun components/site/test-technicien/verification-test-technicien.tsx --ecris
 *
 * Les huit questions et les quatre paliers du test, lus dans le script de la
 * maquette autonome (tableaux `TQ` et `BANDS`), mot pour mot, aux trois
 * tirets cadratins près (remplacés, liste dans la vérification).
 */

export interface QuestionTest {
  domaine: string;
  question: string;
  options: readonly string[];
  /** Index de la bonne option, 0 pour A. */
  bonne: number;
  explication: string;
}

/** Un palier s'applique dès que le score atteint son seuil, du plus haut au plus bas. */
export interface PalierTest {
  seuil: number;
  titre: string;
  verdict: string;
  /** Couleur du score affiché. */
  couleur: string;
}

export const QUESTIONS: readonly QuestionTest[] = [
  {
    "domaine": "Sécurité",
    "question": "Dans quel ordre se déroule une consignation électrique ?",
    "options": [
      "Vérification d’absence de tension, séparation, condamnation, identification",
      "Séparation, condamnation, identification, vérification d’absence de tension",
      "Identification, séparation, vérification d’absence de tension, condamnation",
      "Condamnation, séparation, identification, vérification d’absence de tension"
    ],
    "bonne": 1,
    "explication": "Séparer, condamner, identifier, puis vérifier l’absence de tension au plus près du point de travail. La VAT est toujours la dernière étape, et se refait après toute interruption du chantier."
  },
  {
    "domaine": "Habilitations",
    "question": "Qui peut réaliser la consignation d’un ouvrage électrique ?",
    "options": [
      "Un titulaire B1V",
      "Un titulaire B2",
      "Un titulaire BC",
      "Un titulaire BR"
    ],
    "bonne": 2,
    "explication": "Seul le chargé de consignation (BC) consigne. B1 et B1V exécutent, B2 dirige les travaux, BR réalise les interventions générales de dépannage en basse tension."
  },
  {
    "domaine": "Mécanique",
    "question": "Un roulement neuf chauffe et siffle après deux heures de service. La cause la plus probable ?",
    "options": [
      "Un manque de graisse",
      "Un excès de graisse",
      "Un jeu axial trop important",
      "Une vitesse de rotation trop faible"
    ],
    "bonne": 1,
    "explication": "Le sur-graissage est la première cause d’échauffement sur un roulement neuf : la graisse barattée ne circule plus et monte en température. On remplit au tiers du volume libre, jamais à ras."
  },
  {
    "domaine": "Diagnostic",
    "question": "En analyse vibratoire, un balourd se lit principalement à quelle fréquence ?",
    "options": [
      "1× la fréquence de rotation",
      "2× la fréquence de rotation",
      "La fréquence de passage des dents",
      "Les hautes fréquences d’enveloppe"
    ],
    "bonne": 0,
    "explication": "Le balourd donne une raie dominante à 1× la vitesse de rotation, en radial. Un défaut d’alignement se marque surtout à 2×, et les écaillages de roulement dans les hautes fréquences."
  },
  {
    "domaine": "Automatisme",
    "question": "Un capteur inductif ne détecte plus une pièce en aluminium à sa distance nominale. Pourquoi ?",
    "options": [
      "Le capteur est en défaut",
      "La distance nominale s’entend pour l’acier doux",
      "L’aluminium n’est pas détectable par un inductif",
      "Il faut inverser la polarité du capteur"
    ],
    "bonne": 1,
    "explication": "La portée nominale est donnée pour l’acier doux. Un facteur de correction s’applique : environ 0,4 pour l’aluminium et le cuivre, 0,75 pour l’inox. Il faut rapprocher le capteur."
  },
  {
    "domaine": "Électrotechnique",
    "question": "Un variateur déclenche en surintensité à chaque démarrage d’un convoyeur chargé. Premier réglage à examiner ?",
    "options": [
      "La fréquence de découpage",
      "La rampe d’accélération",
      "La tension d’alimentation",
      "Le sens de rotation"
    ],
    "bonne": 1,
    "explication": "Une rampe trop courte réclame un couple que le moteur ne peut fournir sans appel de courant. On allonge la rampe, puis on vérifie le boost de couple à basse fréquence et la charge mécanique."
  },
  {
    "domaine": "Hydraulique",
    "question": "L’huile d’une centrale hydraulique mousse et le niveau semble monter. La cause la plus probable ?",
    "options": [
      "Une huile trop visqueuse",
      "Une prise d’air à l’aspiration",
      "Un filtre de retour colmaté",
      "Une pression de tarage trop haute"
    ],
    "bonne": 1,
    "explication": "La mousse signe une entrée d’air : raccord d’aspiration desserré, joint de crépine, ou niveau bas qui découvre la crépine. L’air provoque ensuite bruit, à-coups et cavitation de la pompe."
  },
  {
    "domaine": "Lecture de plan",
    "question": "Sur un schéma électrique, le repère « KM1 » désigne :",
    "options": [
      "Un sectionneur",
      "Un relais thermique",
      "Un contacteur",
      "Un disjoncteur moteur"
    ],
    "bonne": 2,
    "explication": "La lettre K repère les relais et contacteurs (KM pour un contacteur de puissance). Q repère l’appareillage de coupure, F les protections, S les organes de commande."
  }
];

export const PALIERS: readonly PalierTest[] = [
  {
    "seuil": 7,
    "titre": "Le profil que nous cherchons",
    "verdict": "Vous répondez juste là où la plupart hésitent. C’est le niveau des techniciens que nous déployons chez nos clients, et nous recrutons.",
    "couleur": "var(--acc)"
  },
  {
    "seuil": 5,
    "titre": "Un socle solide",
    "verdict": "Les fondamentaux sont là. Ce qui se travaille ensuite, c’est la largeur : automatisme, hydraulique, lecture de schéma sur des installations qu’on ne connaît pas.",
    "couleur": "#fff"
  },
  {
    "seuil": 3,
    "titre": "Des bases à consolider",
    "verdict": "Vous avez le geste, il manque la méthode de diagnostic. C’est exactement ce que nos formations internes et le compagnonnage terrain apportent.",
    "couleur": "#fff"
  },
  {
    "seuil": 0,
    "titre": "Le métier s’apprend",
    "verdict": "Ce test est exigeant, et personne ne le réussit sans années de terrain. Si le métier vous attire, parlons formation plutôt que score.",
    "couleur": "#fff"
  }
];
