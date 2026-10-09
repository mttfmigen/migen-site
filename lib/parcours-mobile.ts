/**
 * LES SIX PROBLÈMES DU PARCOURS MOBILE.
 *
 * Portés de `design_handoff_migen_site/maquette/MigenMobile.dc.html`, tableau
 * `PROBLEMS`. La maquette mobile s'ouvre sur « Un parcours guidé par le
 * problème, pas par le menu » : le visiteur dit ce qui bloque, le site lui
 * montre la réponse et la preuve, puis l'emmène vers le formulaire.
 *
 * CHAQUE PROBLÈME POINTE VERS UNE PAGE RÉELLE du site, et les six adresses ont
 * été vérifiées présentes à l'index. Le parcours n'invente aucune offre : il
 * donne une autre porte d'entrée aux pages qui existent déjà.
 *
 * DEUX RETRAITS DE COPIE, imposés par le contrat de rédaction (CLAUDE.md §9)
 * et par la décision de Mehdi du 09/10. Ils sont DÉCLARÉS dans `trous`, comme
 * les fiches de contenu le font, et non effacés en silence :
 *  - « sous 2 à 3 semaines » est un délai chiffré, et seul « rappel dans
 *    l'heure » est autorisé. Retiré de la réponse 01 et de sa statistique.
 *  - « au prix mensuel fixe » annonce un prix. Mehdi, 09/10 : « ne donne aucun
 *    tarif, dis juste que c'est sur devis ». La réponse 02 dit donc « chiffré
 *    sur devis », formulation que la maquette emploie elle-même ailleurs
 *    (« 3 formules, sur devis »).
 * La maquette écrit « migen » en minuscule, le site écrit « Migen ».
 */

export interface StatProbleme {
  valeur: string;
  libelle: string;
}

export interface ProblemeMobile {
  /** Le numéro de la maquette, « 01 » à « 06 ». */
  numero: string;
  /** La question telle que le visiteur se la pose. */
  question: string;
  /** Le nom de l'offre qui y répond. */
  offre: string;
  /** La page du site qui traite ce problème. */
  href: string;
  /** Ce que le visiteur vit aujourd'hui. */
  douleur: string;
  /** Ce que Migen propose, en une phrase. */
  reponse: string;
  points: readonly string[];
  stats: readonly StatProbleme[];
}


export const PROBLEMES: readonly ProblemeMobile[] = [
  {
    numero: "01",
    question: "Je n'arrive pas à recruter mon technicien de maintenance",
    offre: "Résidence",
    href: "/offres/residence/",
    douleur:
      "Le poste est ouvert depuis des mois, les renforts se succèdent, et chaque départ emporte l'historique du parc.",
    reponse: "Un technicien Migen intégré à votre équipe.",
    points: [
      "Vous validez chaque profil avant son arrivée",
      "Remplacement garanti en cas d'absence ou de départ",
      "Habilitations, paie et suivi portés par Migen",
    ],
    stats: [{ valeur: "10 %", libelle: "des techniciens retenus" }],
    /* TROIS RETRAITS SUR CE PROBLÈME, déclarés ici et non effacés en silence.
       La maquette écrit une réponse et une statistique qui annoncent un délai
       de deux à trois semaines pour une prise de poste : le contrat de
       rédaction n'autorise aucun délai chiffré hors « rappel dans l'heure ».
       Et sa phrase de douleur nomme le statut au lieu de la prestation, ce que
       le contrat proscrit aussi ; « les renforts se succèdent » dit la même
       chose sans le mot. */
  },
  {
    numero: "02",
    question: "Je veux un budget fermé et plus d'arrêts non planifiés",
    offre: "Zéro arrêt",
    href: "/offres/zero-arret/",
    douleur:
      "Le correctif dérape, le préventif glisse, et personne ne sait ce que coûtera le mois prochain.",
    reponse:
      "Un abonnement de maintenance chiffré sur devis, qui ne touche jamais à votre production.",
    points: [
      "Entretien hors fenêtres de production, samedi compris",
      "Dépannage de nuit inclus selon la formule",
      "Un engagement connu d'avance, pas de surprise",
    ],
    stats: [
      { valeur: "3", libelle: "formules, sur devis" },
      { valeur: "0", libelle: "arrêt subi pendant la production" },
    ],
    /* DEUX RETRAITS SUR CE PROBLÈME. La maquette annonce deux fois un prix
       mensuel fixe. Décision de Mehdi du 09/10 : « ne donne aucun tarif, dis
       juste que c'est sur devis ». « Chiffré sur devis » est d'ailleurs la
       formulation que la maquette emploie elle-même pour les trois formules. */
  },
  {
    numero: "03",
    question: "J'ai un arrêt annuel à préparer et une fenêtre à tenir",
    offre: "Arrêt technique",
    href: "/offres/arret-technique/",
    douleur:
      "Quelques jours pour tout faire, des corps de métier qui se marchent dessus, et une date de redémarrage qui ne bouge pas.",
    reponse:
      "Une équipe dimensionnée et un planning à la demi-journée, livrés avant l'arrêt.",
    points: [
      "Un planning construit avec vos équipes, pas à côté",
      "Une seule interlocutrice ou un seul interlocuteur pour tous les corps de métier",
      "Un compte rendu par poste, pendant l'arrêt",
    ],
    stats: [{ valeur: "4", libelle: "corps de métier coordonnés" }],
  },
  {
    numero: "04",
    question: "Je déplace ou j'agrandis une ligne de production",
    offre: "Travaux industriels",
    href: "/travaux-industriels/",
    douleur:
      "Démonter, transporter, remonter, remettre en service : chaque étape peut bloquer la suivante.",
    reponse: "Transfert, montage et mise en service pris en charge de bout en bout.",
    points: [
      "Repérage et plan de démontage avant la première clé",
      "Levage, calage et raccordements par nos équipes",
      "Mise en service et essais avec votre production",
    ],
    stats: [{ valeur: "+200", libelle: "clients industriels" }],
  },
  {
    numero: "05",
    question: "J'ai besoin de schémas, d'une étude ou d'une mise en conformité",
    offre: "Bureau d'études",
    href: "/bureau-etudes/",
    douleur:
      "Les plans ne sont plus à jour, l'armoire a été modifiée dix fois, et le contrôle approche.",
    reponse: "Un bureau d'études technique qui part de votre installation réelle.",
    points: [
      "Relevé sur site avant tout dessin",
      "Schémas électriques et mécaniques à jour, livrés en sources",
      "Mise en conformité machine, dossier compris",
    ],
    stats: [{ valeur: "2", libelle: "bureaux d'études, électrique et mécanique" }],
  },
  {
    numero: "06",
    question: "Il me faut un dépannage, vite",
    offre: "Intervention",
    href: "/offres/depannage-industriel/",
    douleur: "La ligne est à l'arrêt et chaque heure se compte en production perdue.",
    reponse:
      "Un technicien qualifié mobilisé depuis le hub le plus proche, cause racine traitée.",
    points: [
      "Rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30",
      "Dix hubs de techniciens, partout en France",
      "La cause racine cherchée, pas seulement le symptôme",
    ],
    stats: [{ valeur: "10", libelle: "hubs de techniciens" }],
  },
];
