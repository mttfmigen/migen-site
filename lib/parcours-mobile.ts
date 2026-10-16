/**
 * LES SIX BLOCAGES DE L'ACCUEIL MOBILE, « Qu'est-ce qui vous bloque ? ».
 *
 * MAQUETTE V3 « SITE MOBILE », validée par Mehdi le 16/10 : chaque carte est un
 * LIEN qui ouvre directement la page de l'offre (« Résidence → »). Les textes,
 * les noms d'offre et les adresses sont ceux de la V3, mot pour mot (relevés le
 * 16/10 sur http://localhost:4483/v3.html, vue « Site mobile »).
 *
 * CE QUI A CHANGÉ PAR RAPPORT AU 13/10, et c'est déclaré :
 *  - les six réponses repliées (douleur, réponse, trois points, chiffre) ne
 *    sont plus rendues : la V3 envoie le visiteur sur la vraie page de l'offre
 *    au lieu de lui en montrer un extrait. Elles restent dans l'historique git ;
 *  - la carte 06 suit la V3 : « Je veux confier toute ma maintenance à un seul
 *    partenaire », offre Full service. Elle remplace « Il me faut un dépannage,
 *    vite », offre Intervention (vers /offres/depannage-industriel/), que la V3
 *    n'a plus ;
 *  - la carte 05 vise /offres/bureau-etudes/, l'adresse de la V3 et de la grille
 *    « Six façons » (les deux répondent 200).
 */

export interface ProblemeMobile {
  /** Le numéro de la V3, « 01 » à « 06 ». */
  numero: string;
  /** La phrase du visiteur. */
  question: string;
  /** Le nom de l'offre qui y répond, affiché avec sa flèche. */
  offre: string;
  /** La page de l'offre, ouverte par la carte. */
  href: string;
}

export const PROBLEMES: readonly ProblemeMobile[] = [
  {
    numero: "01",
    question: "Je n’arrive pas à recruter mon technicien de maintenance",
    offre: "Résidence",
    href: "/offres/residence/",
  },
  {
    numero: "02",
    question: "Je veux un budget fermé et plus d’arrêts non planifiés",
    offre: "Zéro arrêt",
    href: "/offres/zero-arret/",
  },
  {
    numero: "03",
    question: "J’ai un arrêt annuel à préparer et une fenêtre à tenir",
    offre: "Arrêt technique",
    href: "/offres/arret-technique/",
  },
  {
    numero: "04",
    question: "Je déplace ou j’agrandis une ligne de production",
    offre: "Travaux industriels",
    href: "/travaux-industriels/",
  },
  {
    numero: "05",
    question: "J’ai besoin de schémas, d’une étude ou d’une mise en conformité",
    offre: "Bureau d’études",
    href: "/offres/bureau-etudes/",
  },
  {
    numero: "06",
    question: "Je veux confier toute ma maintenance à un seul partenaire",
    offre: "Full service",
    href: "/offres/full-service/",
  },
];
