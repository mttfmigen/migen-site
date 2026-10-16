import type { Paragraphe, SectionCta } from "@/types/contenu";

/**
 * CE QUE LA MAQUETTE V3 « SITE MOBILE » LIT DANS LA FICHE ET QUE LE RELAIS
 * N'A PAS, recopié MOT POUR MOT de `maquette/contenu/site/Expertises/*.md`.
 * La capture de bureau ne rend aucun de ces textes : ils vivent donc hors du
 * relais (`supabase/import/gabarits-maquette/`, dont chaque chaîne doit être
 * dans la capture) et ne sont rendus qu'au téléphone (`data-mobile-seulement`).
 *
 * Les tables sont produites une fois depuis les fiches, puis
 * `verification-corpus-mobile.ts` relit les fiches et refuse tout écart, dans
 * les deux sens : une phrase réécrite, une page oubliée.
 */

/**
 * L'appel que chaque fiche écrit sous « ## Ce que nous garantissons » : la
 * question en gras, le bouton (`/contact/`), la phrase « Ou appelez le… ».
 * La V3 le rend en fin de la carte « Ce que nous garantissons »
 * (`AppelCarteMobile`).
 */
export const APPELS_GARANTIES: Readonly<Record<string, SectionCta>> = {
  "/expertises/": {
    type: "cta",
    question: "Besoin d'un technicien qualifié sur une machine qui vous bloque aujourd'hui ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure, astreinte.",
  },
  "/expertises/automatisme/": {
    type: "cta",
    question: "Besoin d'un automaticien capable de lire votre programme aujourd'hui ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/automatisme/programmation-automate/": {
    type: "cta",
    question: "Besoin d'un automaticien pour reprendre un programme que plus personne ne connaît ?",
    bouton: "Demander un automaticien",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/automatisme/schneider/": {
    type: "cta",
    question: "Besoin d'un automaticien capable d'ouvrir votre programme Modicon dès le premier passage ?",
    bouton: "Demander un automaticien",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/automatisme/siemens/": {
    type: "cta",
    question: "Besoin d'un automaticien capable de lire votre programme aujourd'hui ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/electrique/": {
    type: "cta",
    question: "Besoin de savoir pourquoi ce disjoncteur déclenche, une bonne fois pour toutes ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/electromecanique/": {
    type: "cta",
    question: "Besoin d'un seul intervenant pour une panne qui touche le moteur et sa commande ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/hydraulique/": {
    type: "cta",
    question: "Besoin de savoir pourquoi votre presse perd sa pression, avant qu'elle ne casse ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/hydraulique/verin-hydraulique/": {
    type: "cta",
    question: "Besoin de faire réparer un vérin avant de commander un neuf ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/mecanique/": {
    type: "cta",
    question: "Besoin d'un mécanicien qui remonte à la cause plutôt qu'à la pièce ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/mecanique/lubrification/": {
    type: "cta",
    question: "Besoin d'un plan de graissage écrit plutôt que d'un geste confié à la mémoire d'un seul homme ?",
    bouton: "Demander un plan de graissage",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/mecanique/machine-outil/": {
    type: "cta",
    question: "Besoin d'un technicien capable de trouver pourquoi la cote dérive ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/pneumatique/": {
    type: "cta",
    question: "Besoin de savoir combien votre réseau d'air comprimé perd chaque nuit ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/robotique/": {
    type: "cta",
    question: "Besoin d'un roboticien qui intervienne sans attendre le passage du constructeur ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/robotique/abb/": {
    type: "cta",
    question: "Besoin d'un roboticien capable de remettre votre bras ABB en production ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/robotique/fanuc/": {
    type: "cta",
    question: "Besoin d'un technicien capable de lire le code défaut de votre robot Fanuc aujourd'hui ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/robotique/integrateur-robotique/": {
    type: "cta",
    question: "Besoin d'un roboticien pour finir ce que l'intégrateur a laissé en plan ?",
    bouton: "Décrire mon projet robotique",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/soudure/": {
    type: "cta",
    question: "Besoin d'un soudeur sur site avant que la fissure ne devienne une rupture ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/specialisations-constructeur/": {
    type: "cta",
    question: "Besoin d'un automaticien qui connaisse déjà la marque installée chez vous ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/tuyauterie/": {
    type: "cta",
    question: "Besoin de savoir quelles lignes tiendront encore douze mois, et lesquelles non ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/tuyauterie/nettoyage/": {
    type: "cta",
    question: "Besoin de savoir ce qui bouche vos lignes avant de choisir la méthode ?",
    bouton: "Demander un diagnostic d'encrassement",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/": {
    type: "cta",
    question: "Besoin de savoir quelle part de votre budget part dans l'imprévu, et quelles machines la produisent ?",
    bouton: "Demander mon diagnostic gratuit",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-ameliorative/": {
    type: "cta",
    question: "Besoin de supprimer la panne qui revient au lieu de la réparer une fois de plus ?",
    bouton: "Demander un diagnostic maintenance",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-conditionnelle/": {
    type: "cta",
    question: "Besoin de savoir quelles machines méritent une ronde mensuelle, et lesquelles peuvent rester au calendrier ?",
    bouton: "Demander mon diagnostic gratuit",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-corrective/": {
    type: "cta",
    question: "Besoin d'un technicien sur une ligne qui vient de s'arrêter ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure, astreinte.",
  },
  "/expertises/types-de-maintenance/maintenance-curative/": {
    type: "cta",
    question: "Besoin qu'une panne qui revient tous les deux mois soit réglée pour de bon ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure, astreinte.",
  },
  "/expertises/types-de-maintenance/maintenance-palliative/": {
    type: "cta",
    question: "Besoin de redémarrer une machine aujourd'hui sans mettre vos équipes en danger ?",
    bouton: "Demander une intervention",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-predictive/": {
    type: "cta",
    question: "Besoin de savoir quelles machines méritent d'être instrumentées, et lesquelles n'en ont pas besoin ?",
    bouton: "Demander mon diagnostic gratuit",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-preventive/": {
    type: "cta",
    question: "Besoin de savoir si votre retard de préventif se rattrape en une campagne ou en trois ?",
    bouton: "Demander mon diagnostic gratuit",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/maintenance-previsionnelle/": {
    type: "cta",
    question: "Besoin de savoir sur quels équipements la pente se justifie, et sur lesquels le calendrier suffit ?",
    bouton: "Demander mon diagnostic gratuit",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
  "/expertises/types-de-maintenance/preventive-systematique/": {
    type: "cta",
    question: "Besoin d'un programme de préventif systématique qui soit réellement tenu toute l'année ?",
    bouton: "Demander un diagnostic maintenance",
    rappel: "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
  },
};

/**
 * La prose qu'une fiche de DOMAINE écrit sous le tableau de « ## L’offre »
 * (un paragraphe de maillage, liens compris). La V3 la rend en fin de la
 * carte « L'offre » (`PointsOffre.proseMobile`). Les spécialités la portent
 * déjà dans leur relais (`scripts/restaure-corpus-expertises.mjs`).
 */
export const PROSE_OFFRE_DOMAINE: Readonly<Record<string, Paragraphe[]>> = {
  "/expertises/automatisme/": [
    { texte: "Un besoin durable se couvre par la [sous-traitance maintenance](/offres/residence/), un automaticien intégré à votre équipe pour la durée du projet. Une ligne figée maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/electrique/": [
    { texte: "Un défaut électrique qui bloque la ligne maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/). Un besoin durable se couvre par la [sous-traitance maintenance](/offres/residence/), un technicien intégré à votre équipe." },
  ],
  "/expertises/electromecanique/": [
    { texte: "Un moteur en panne maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/). Un renfort durable passe par la [sous-traitance maintenance](/offres/residence/), un électromécanicien intégré à votre équipe pour une durée définie avec vous." },
  ],
  "/expertises/hydraulique/": [
    { texte: "Vos circuits lâchent plusieurs fois par an ? Le [contrat de maintenance Zéro arrêt](/offres/zero-arret/) coûte moins cher que la troisième intervention. Une fuite en cours se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/mecanique/": [
    { texte: "Besoin d'un mécanicien intégré à votre équipe pour plusieurs mois ? Voir la [sous-traitance maintenance](/offres/residence/). Une casse en cours se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/pneumatique/": [
    { texte: "Vos arrêts se répètent toute l'année ? Le [contrat de maintenance Zéro arrêt](/offres/zero-arret/) intègre les contrôles périodiques du réseau. Une ligne bloquée maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/robotique/": [
    { texte: "Un parc entier à remettre sous suivi ? Le [contrat de maintenance Zéro arrêt](/offres/zero-arret/) couvre la visite préventive par robot et la priorité d'intervention. Un robot immobilisé maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/soudure/": [
    { texte: "Besoin d'un soudeur sur plusieurs semaines ? Il intervient aussi en [sous-traitance maintenance](/offres/residence/), intégré à votre équipe. Une casse métallique en cours se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/specialisations-constructeur/": [
    { texte: "Une marque précise à traiter ? Voyez [automaticien Siemens](/expertises/automatisme/siemens/) ou [automate Schneider](/expertises/automatisme/schneider/). Pour reprendre et documenter un code existant, la page [programmation automate](/expertises/automatisme/programmation-automate/) détaille la méthode. Un équipement immobilisé maintenant se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/tuyauterie/": [
    { texte: "La soudure décide de la tenue de l'ensemble : nos travaux de [soudure industrielle](/expertises/soudure/) suivent les mêmes exigences de préparation et de contrôle. Une rupture en cours se traite par le [dépannage industriel](/offres/depannage-industriel/)." },
  ],
  "/expertises/types-de-maintenance/": [
    { texte: "Besoin d'une réparation tout de suite ? Voir le [dépannage industriel](/offres/depannage-industriel/). Besoin de tenir le préventif dans la durée ? Voir le [contrat de maintenance Zéro arrêt](/offres/zero-arret/). Migen est une [entreprise de maintenance industrielle](/offres/) présente partout en France." },
  ],
};

/**
 * « La réponse directe » telle que la fiche l'écrit, pour les pages dont le
 * relais porte l'écran « Complément 2 » (`complementTypes`) : la V3 en garde le
 * gras que le relais a perdu (« **La définition.** », un paragraphe tout en
 * gras devient titre de liste) et dessine une liste numérotée (« 1. ») en
 * frise, une liste à puces (« - ») en cartes. `textes` : texte du relais →
 * paragraphe de la fiche, quand ils diffèrent. `numerotees` : la première
 * accroche de chaque liste numérotée. `chiffres` : les tuiles que la fiche
 * garde en fin de carte. Rendu par `domaine/ComplementsDomaine` et
 * `ChiffresCarteMobile`.
 */
export interface ReponseDirecteCorpus {
  readonly textes: Readonly<Record<string, string>>;
  readonly numerotees: readonly string[];
  /** Les valeurs de « **Les chiffres Migen** », dans l'ordre de la fiche. */
  readonly chiffres: readonly string[];
}

export const REPONSE_DIRECTE: Readonly<Record<string, ReponseDirecteCorpus>> = {
  "/expertises/types-de-maintenance/": {
    textes: {
      "La définition qui fait foi. La norme NF EN 13306 appelle maintenance l'ensemble des actions techniques, administratives et de gestion menées durant le cycle de vie d'un bien, pour le maintenir ou le rétablir dans un état lui permettant d'accomplir la fonction requise.":
        "**La définition qui fait foi.** La norme NF EN 13306 appelle maintenance l'ensemble des actions techniques, administratives et de gestion menées durant le cycle de vie d'un bien, pour le maintenir ou le rétablir dans un état lui permettant d'accomplir la fonction requise.",
      "Deux verbes, deux mondes. Maintenir, c'est agir avant la panne : la famille préventive. Rétablir, c'est agir une fois la défaillance survenue : la famille corrective. À côté, la maintenance améliorative modifie le bien pour le fiabiliser.":
        "Deux verbes, deux mondes. **Maintenir**, c'est agir avant la panne : la famille préventive. **Rétablir**, c'est agir une fois la défaillance survenue : la famille corrective. À côté, la maintenance améliorative modifie le bien pour le fiabiliser.",
      "Les quatre critères qui tranchent, équipement par équipement :":
        "**Les quatre critères qui tranchent, équipement par équipement :**",
    },
    numerotees: ["La criticité."],
    chiffres: ["+200", "10 %", "4"],
  },
  "/expertises/types-de-maintenance/maintenance-conditionnelle/": {
    textes: {
      "La définition qui fait foi. La norme NF EN 13306 appelle maintenance conditionnelle une maintenance préventive basée sur la surveillance du fonctionnement du bien et de ses paramètres significatifs, intégrant les actions qui en découlent.":
        "**La définition qui fait foi.** La norme NF EN 13306 appelle maintenance conditionnelle une maintenance préventive basée sur la surveillance du fonctionnement du bien et de ses paramètres significatifs, intégrant les actions qui en découlent.",
      "Les technologies de surveillance utilisées en usine :":
        "**Les technologies de surveillance utilisées en usine :**",
      "Où la conditionnelle se justifie, et où elle ne se justifie pas :":
        "**Où la conditionnelle se justifie, et où elle ne se justifie pas :**",
    },
    numerotees: [],
    chiffres: ["10 %", "8", "4"],
  },
  "/expertises/types-de-maintenance/maintenance-corrective/": {
    textes: {
      "La maintenance corrective désigne l'ensemble des opérations exécutées après la détection d'une défaillance, pour remettre un bien en état d'assurer sa fonction requise. Le déclencheur est toujours une panne : arrêt total, fonctionnement dégradé, dysfonctionnement détecté par un opérateur ou par un capteur.":
        "**La définition.** La maintenance corrective désigne l'ensemble des opérations exécutées après la détection d'une défaillance, pour remettre un bien en état d'assurer sa fonction requise. Le déclencheur est toujours une panne : arrêt total, fonctionnement dégradé, dysfonctionnement détecté par un opérateur ou par un capteur.",
      "Trois mots, trois factures. La norme NF EN 13306 fait de la corrective la catégorie mère.":
        "**Trois mots, trois factures.** La norme NF EN 13306 fait de la corrective la catégorie mère.",
      "Immédiate ou différée : le second découpage, celui qui pèse sur votre budget.":
        "**Immédiate ou différée : le second découpage, celui qui pèse sur votre budget.**",
      "Ce que la corrective a pour elle, honnêtement :":
        "**Ce que la corrective a pour elle, honnêtement :**",
      "Et ce qu'elle coûte, une fois le compte complet fait :":
        "**Et ce qu'elle coûte, une fois le compte complet fait :**",
    },
    numerotees: [],
    chiffres: ["+200", "10 %"],
  },
  "/expertises/types-de-maintenance/maintenance-curative/": {
    textes: {
      "La maintenance curative regroupe les opérations de réparation définitive exécutées sur un équipement défaillant, pour lui rendre durablement sa fonction requise. La norme NF EN 13306 distingue la réparation, qui rétablit l'état d'origine, du dépannage, qui se contente de faire repartir le matériel.":
        "**La définition.** La maintenance curative regroupe les opérations de réparation définitive exécutées sur un équipement défaillant, pour lui rendre durablement sa fonction requise. La norme NF EN 13306 distingue la réparation, qui rétablit l'état d'origine, du dépannage, qui se contente de faire repartir le matériel.",
      "La hiérarchie à connaître, parce que la confusion se paie en factures.":
        "**La hiérarchie à connaître**, parce que la confusion se paie en factures.",
      "Quand la curative intervient :":
        "**Quand la curative intervient :**",
      "Les trois erreurs qui transforment une curative en palliative :":
        "**Les trois erreurs qui transforment une curative en palliative :**",
      "Le coût complet, pas le tarif horaire :":
        "**Le coût complet, pas le tarif horaire :**",
    },
    numerotees: ["Monter une pièce neuve sans chercher pourquoi l'ancienne a cassé."],
    chiffres: ["+200", "10 %", "+120"],
  },
  "/expertises/types-de-maintenance/maintenance-predictive/": {
    textes: {
      "La maintenance prédictive consiste à prévoir la défaillance d'un équipement à partir de données collectées en temps réel, puis à planifier l'intervention avant que la panne ne survienne. Elle repose sur trois piliers, et aucun ne fonctionne sans les deux autres.":
        "**La définition.** La maintenance prédictive consiste à prévoir la défaillance d'un équipement à partir de données collectées en temps réel, puis à planifier l'intervention avant que la panne ne survienne. Elle repose sur trois piliers, et aucun ne fonctionne sans les deux autres.",
      "Le tri entre quatre mots qu'on confond en permanence :":
        "**Le tri entre quatre mots qu'on confond en permanence :**",
      "Les grandeurs qui parlent, et ce qu'elles trahissent :":
        "**Les grandeurs qui parlent, et ce qu'elles trahissent :**",
      "Ce que la prédictive n'est pas :":
        "**Ce que la prédictive n'est pas :**",
      "Les limites, dites franchement :":
        "**Les limites, dites franchement :**",
    },
    numerotees: ["Le relevé."],
    chiffres: ["10 %", "+200", "0"],
  },
  "/expertises/types-de-maintenance/maintenance-preventive/": {
    textes: {
      "La maintenance préventive regroupe les interventions exécutées avant la défaillance, à intervalles prédéterminés ou selon des critères prescrits, pour réduire la probabilité de panne d'un équipement. La norme NF EN 13306 l'oppose à la maintenance corrective, qui intervient une fois le dysfonctionnement constaté.":
        "**La définition.** La maintenance préventive regroupe les interventions exécutées avant la défaillance, à intervalles prédéterminés ou selon des critères prescrits, pour réduire la probabilité de panne d'un équipement. La norme NF EN 13306 l'oppose à la maintenance corrective, qui intervient une fois le dysfonctionnement constaté.",
      "Les trois façons de la pratiquer, du plus simple au plus avancé :":
        "**Les trois façons de la pratiquer, du plus simple au plus avancé :**",
      "Le plan en cinq étapes, la méthode standard du métier :":
        "**Le plan en cinq étapes, la méthode standard du métier :**",
    },
    numerotees: ["Inventorier les équipements"],
    chiffres: ["+200", "10 %", "8"],
  },
  "/expertises/types-de-maintenance/maintenance-previsionnelle/": {
    textes: {
      "La maintenance prévisionnelle est une maintenance préventive exécutée à la suite d'une analyse de l'évolution de paramètres significatifs de la dégradation d'un bien. La norme NF EN 13306 la classe dans le préventif, comme une conditionnelle menée en suivant l'évolution dans le temps.":
        "**La définition.** La maintenance prévisionnelle est une maintenance préventive exécutée à la suite d'une analyse de l'évolution de paramètres significatifs de la dégradation d'un bien. La norme NF EN 13306 la classe dans le préventif, comme une conditionnelle menée en suivant l'évolution dans le temps.",
      "Le mot anglais qui brouille tout. En anglais, tout se dit predictive maintenance. La traduction écrase la nuance française, et les éditeurs utilisent les deux termes indifféremment.":
        "**Le mot anglais qui brouille tout.** En anglais, tout se dit predictive maintenance. La traduction écrase la nuance française, et les éditeurs utilisent les deux termes indifféremment.",
      "Ce que ça rapporte, et ce que ça coûte :":
        "**Ce que ça rapporte, et ce que ça coûte :**",
    },
    numerotees: [],
    chiffres: ["10 %", "+120", "8"],
  },
};
