/**
 * Le pavage « Partez de votre besoin », en données.
 *
 * Source : `NEEDS` de la maquette autonome (7 entrées), texte mot pour mot.
 * Les styles de chaque tuile ne sont plus ici : la maquette les recalcule
 * selon la tuile ouverte (getter `needs`), le composant fait de même.
 *
 * ÉCARTS DÉCLARÉS, une valeur interdite est RETIRÉE, jamais reformulée
 * (règles de copie du 08/10) :
 * - « Cadre » de Résidence, « Régie ou forfait » : « régie » interdit.
 * - « Cadre » de Construction, « Clé en main » : interdit.
 * - « Délai » des sept tuiles : « 2 à 3 semaines », « Audit sous 2 semaines »,
 *   « Chiffrage sous 10 jours », « Visite sous 1 semaine », « Cadrage sous
 *   1 semaine », « Étude sous 3 semaines » sont des délais chiffrés ; seul
 *   « Après audit du parc » (Full service) n'en est pas un et reste.
 * - Point de Zéro arrêt « Intervention garantie de 4 h à 2 h selon la
 *   formule » : délai chiffré, retiré.
 * Les lignes « Durée » restent : elles disent la durée de la prestation, pas
 * un délai d'intervention.
 */

import type { Besoin } from "./BentoBesoins";

export const BESOINS: Besoin[] = [
  {
    id: "residence",
    need: "« J’ai besoin d’un renfort maintenance sur mon site. »",
    answer: "Une équipe à vous, sans le recrutement ni la gestion.",
    offer: "Résidence",
    detail:
      "Des techniciens en résidence sur votre site, pour la durée dont vous avez besoin, intégrés à votre organisation. Vous constituez l’équipe et validez chaque intervenant avant son arrivée ; nous portons le recrutement, les habilitations, la paie et le remplacement.",
    points: [
      "Vous validez chaque technicien avant son arrivée",
      "Remplacement garanti en cas d’absence",
      "Astreinte possible",
      "Reporting mensuel et suivi d’indicateurs",
    ],
    cta: "Voir Résidence",
    href: "/offres/residence/",
    duree: "Selon votre besoin",
    img: "/assets/team-four.webp",
  },
  {
    id: "full",
    need: "« Je veux confier toute ma maintenance à un seul prestataire. »",
    answer: "Un interlocuteur unique, du préventif aux travaux.",
    offer: "Full service",
    detail:
      "Vous nous confiez le périmètre complet de votre maintenance : préventif, curatif, amélioratif, arrêts et petits travaux. Nous pilotons l’organisation, les équipes et le reporting ; vous gardez la décision sur les priorités.",
    points: [
      "Un seul contrat et un seul interlocuteur",
      "Préventif, curatif et travaux dans le même périmètre",
      "Indicateurs partagés chaque mois",
      "Équipes dimensionnées selon votre parc",
    ],
    cta: "Voir Full service",
    href: "/offres/full-service/",
    cadre: "Contrat de prestation globale",
    delai: "Après audit du parc",
    duree: "Selon votre besoin",
    img: "/assets/web/x-cimenterie.jpg",
  },
  {
    id: "zero",
    need: "« Je paie mes pannes à l’heure et je ne maîtrise pas mon budget. »",
    answer: "Un forfait mensuel qui couvre préventif, astreinte et curatif.",
    offer: "Zéro arrêt",
    detail:
      "Vous ne payez plus la panne à l’unité, vous payez la disponibilité de vos lignes. Trois formules selon la criticité du parc, avec un délai d’intervention garanti et un volume curatif inclus. Au forfait, chaque arrêt évité nous profite aussi.",
    points: [
      "Budget fermé, connu en début d’exercice",
      "Aucun frais de déplacement ni de mise en route",
      "Forfait révisé à la baisse si les arrêts reculent",
    ],
    cta: "Voir les formules",
    href: "/offres/zero-arret/",
    cadre: "Abonnement mensuel",
    duree: "12 mois reconductibles",
    img: "/assets/web/ph-technicien.jpg",
  },
  {
    id: "arret",
    need: "« J’ai une fenêtre d’arrêt et pas le droit de la dépasser. »",
    answer: "Un périmètre figé en amont et une ligne rendue à la date annoncée.",
    offer: "Arrêt technique",
    detail:
      "Arrêts planifiés, révisions générales, changements de format. Le périmètre est chiffré en amont, le planning jalonné à la demi-journée, les approvisionnements verrouillés avant l’arrêt. La coactivité avec vos autres prestataires est coordonnée par nous.",
    points: [
      "Rétroplanning jusqu’au redémarrage",
      "Coordination sécurité et coactivité",
      "Approvisionnements verrouillés avant l’arrêt",
      "Engagement de date contractuel",
    ],
    cta: "Voir Arrêt technique",
    href: "/offres/arret-technique/",
    cadre: "Forfait, périmètre fermé",
    duree: "Durée de l’arrêt",
    img: "/assets/web/x-cablerie.jpg",
  },
  {
    id: "chantier",
    need: "« Je déménage une ligne, ou j’en installe une nouvelle. »",
    answer: "Un interlocuteur unique du démontage au redémarrage.",
    offer: "Chantier",
    detail:
      "Transfert et déménagement industriel, travaux neufs, modification d’implantation. Nous démontons, transportons, réimplantons, raccordons et remettons en service, avec plan de prévention et coordination des corps de métier.",
    points: [
      "Plan de prévention et coordination sécurité",
      "Chaudronnerie et tuyauterie internes",
      "Planning jalonné, engagement de délai",
      "Essais et remise en service inclus",
    ],
    cta: "Voir Chantier",
    href: "/offres/chantier/",
    cadre: "Forfait au chantier",
    duree: "Quelques jours à 3 mois",
    img: "/assets/web/ph-tuyaux.jpg",
  },
  {
    id: "etude",
    need: "« Mon installation n’est plus conforme et je n’ai plus les schémas. »",
    answer: "La reprise du dossier technique avant de toucher au fer.",
    offer: "Bureau d’études",
    detail:
      "Reprise de schémas, analyse de risques, dimensionnement, mise en conformité machine. Nos projeteurs travaillent avec les techniciens qui interviendront ensuite : on dessine ce qu’on saura maintenir.",
    points: [
      "Relevé sur site et schémas remis à jour",
      "Analyse de risques et mise en conformité",
      "Dimensionnement et choix de composants",
      "Dossier technique livré et exploitable",
    ],
    cta: "Voir Bureau d’études",
    href: "/offres/bureau-etudes/",
    cadre: "Forfait à l’étude",
    duree: "2 à 8 semaines",
    img: "/assets/web/x-logistique-entrepot.jpg",
  },
  {
    id: "construction",
    need: "« Je monte une usine et je ne veux pas piloter dix prestataires. »",
    answer: "L’installation complète, du sol à la mise en service.",
    offer: "Construction",
    detail:
      "Implantation, levage, assemblage, raccordements fluides et électriques, essais et mise en service. Un seul interlocuteur porte le chantier et vous remet une usine qui tourne, avec la documentation qui va avec.",
    points: [
      "Implantation, levage et assemblage",
      "Raccordements fluides et électriques",
      "Essais, mise en service et formation",
      "Dossier des ouvrages exécutés",
    ],
    cta: "Voir Construction",
    href: "/offres/construction/",
    duree: "3 à 18 mois",
    img: "/assets/web/team-grind-front.jpg",
  },
];
