/**
 * Le pavage « Partez de votre besoin », en données.
 *
 * Source : `NEEDS` de « Migen - Site final.dc.html » (7 entrées), et la CSS
 * calculée pour chaque tuile dans le getter `needs` de la même maquette.
 *
 * TROIS ÉCARTS ASSUMÉS PAR RAPPORT À LA MAQUETTE, imposés par le contrat de
 * portage (`docs/CONTRAT-PORTAGE-MAQUETTE.md`, « Interdits de copie ») :
 *
 * 1. `cadre` de Résidence : la maquette écrit « Régie ou forfait ». Le mot
 *    « régie » est interdit, et le corpus de l'offre
 *    (`migen-refonte/seo/CONVERSION/Offres/residence.md`) ne parle jamais de
 *    deux modes contractuels : il promet « la transparence du périmètre, ce
 *    qui est inclus et ce qui ne l'est pas est écrit ligne par ligne ».
 * 2. `cadre` de Construction : la maquette écrit « Clé en main », interdit.
 *    Remplacé par le fait que la maquette porte elle-même pour cette offre
 *    (« un interlocuteur pour tous les lots de montage et de mise en
 *    service »).
 * 3. `delai` : aucun délai chiffré n'est autorisé sur le site, la seule
 *    promesse étant « rappel dans l'heure ». Les sept valeurs de la maquette
 *    étaient toutes chiffrées sauf une. Chacune est ramenée au fait qu'elle
 *    énonce sans le chiffre, en reprenant le nom d'étape de la maquette
 *    (« chiffrage », « cadrage », « visite », « audit »). Pour Résidence, la
 *    valeur d'origine n'était qu'un chiffre : le champ reste vide et la ligne
 *    ne s'affiche pas, plutôt que d'inventer autre chose.
 *
 * LA CSS EST CELLE DE L'ÉTAT FERMÉ. La maquette recalcule `wrapCss`, `tagCss`
 * et `signCss` à chaque bascule (tuile ouverte en 2×2, « + » pivoté à 45°) ;
 * le composant, lui, reçoit une valeur unique par besoin et porte son état
 * d'ouverture dans `data-open`. La géométrie de la tuile ouverte vit donc dans
 * la CSS, pas ici.
 */

import type { CSSProperties } from "react";

import type { Besoin } from "./BentoBesoins";

/* Valeurs recopiées du getter `needs` de la maquette, branche « fermé » et
   thème clair (`isDark()` y retourne toujours faux). */

const CADRE_FERME: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,.8)",
  border: "1px solid var(--line)",
};

const PASTILLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  padding: "5px 11px",
  borderRadius: 999,
  color: "var(--acc-ink)",
  backgroundColor: "var(--acc-w)",
  border: "1px solid transparent",
  alignSelf: "flex-start",
  marginTop: "auto",
};

const SIGNE: CSSProperties = {
  font: "300 20px/1 var(--fb)",
  color: "var(--ink3)",
  flex: "none",
  width: 20,
  textAlign: "center",
  display: "inline-block",
  transition: "transform 220ms cubic-bezier(.2,.7,.2,1)",
  transform: "rotate(0deg)",
};

/**
 * Le visuel du panneau déplié. Sans chemin, il ne reste que le gris de
 * remplacement `--ph` : un fichier absent de `public/` ne se remplace pas par
 * une autre photo, ce serait un choix éditorial.
 */
function visuel(chemin?: string): CSSProperties {
  return {
    height: 132,
    borderRadius: "var(--rad-s)",
    marginBottom: 12,
    background: chemin
      ? `var(--ph) url('${chemin}') center/cover no-repeat`
      : "var(--ph)",
    filter: "saturate(var(--sat)) contrast(1.05)",
    opacity: "var(--ph-op)",
  };
}

export const BESOINS: Besoin[] = [
  {
    id: "residence",
    num: "01",
    need: "« J’ai besoin d’un renfort maintenance sur mon site. »",
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
    cadre: "Périmètre écrit au contrat",
    duree: "Selon votre besoin",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/team-four.webp"),
  },
  {
    id: "full",
    num: "02",
    need: "« Je veux confier toute ma maintenance à un seul prestataire. »",
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
    // La maquette pointe vers `/offres/full-service/`, qui n'existe pas dans
    // `docs/urls-site-actuel.json`. L'URL réelle de l'offre est celle que
    // `entete-donnees.ts` emploie déjà pour la même entrée de menu.
    href: "/offres/maintenance-externalisee/",
    cadre: "Contrat de prestation globale",
    delai: "Après audit du parc",
    duree: "Selon votre besoin",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/web/x-cimenterie.jpg"),
  },
  {
    id: "zero",
    num: "03",
    need: "« Je paie mes pannes à l’heure et je ne maîtrise pas mon budget. »",
    answer: "Un forfait mensuel qui couvre préventif, astreinte et curatif.",
    offer: "Zéro arrêt",
    detail:
      "Vous ne payez plus la panne à l’unité, vous payez la disponibilité de vos lignes. Trois formules selon la criticité du parc, avec un délai d’intervention garanti et un volume curatif inclus. Au forfait, chaque arrêt évité nous profite aussi.",
    points: [
      "Budget fermé, connu en début d’exercice",
      // La maquette chiffre le délai (« de 4 h à 2 h selon la formule ») : le
      // fait reste, le chiffre part.
      "Intervention garantie selon la formule",
      "Aucun frais de déplacement ni de mise en route",
      "Forfait révisé à la baisse si les arrêts reculent",
    ],
    cta: "Voir les formules",
    href: "/offres/zero-arret/",
    cadre: "Abonnement mensuel",
    delai: "Après audit de couverture",
    duree: "12 mois reconductibles",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/web/ph-technicien.jpg"),
  },
  {
    id: "arret",
    num: "04",
    need: "« J’ai une fenêtre d’arrêt et pas le droit de la dépasser. »",
    answer:
      "Un périmètre figé en amont et une ligne rendue à la date annoncée.",
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
    delai: "Après chiffrage du périmètre",
    duree: "Durée de l’arrêt",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    // `assets/web/x-cablerie.jpg` n'existe pas dans `public/` : gris de
    // remplacement plutôt qu'une autre photo.
    imgCss: visuel(),
  },
  {
    id: "chantier",
    num: "05",
    need: "« Je déménage une ligne, ou j’en installe une nouvelle. »",
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
    delai: "Après visite des sites",
    duree: "Quelques jours à 3 mois",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/web/ph-tuyaux.jpg"),
  },
  {
    id: "etude",
    num: "06",
    need: "« Mon installation n’est plus conforme et je n’ai plus les schémas. »",
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
    delai: "Après cadrage du besoin",
    duree: "2 à 8 semaines",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/web/x-logistique-entrepot.jpg"),
  },
  {
    id: "construction",
    num: "07",
    need: "« Je monte une usine et je ne veux pas piloter dix prestataires. »",
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
    cadre: "Forfait, tous lots",
    delai: "Après étude du projet",
    duree: "3 à 18 mois",
    wrapCss: CADRE_FERME,
    signCss: SIGNE,
    tagCss: PASTILLE,
    imgCss: visuel("/assets/web/team-grind-front.jpg"),
  },
];
