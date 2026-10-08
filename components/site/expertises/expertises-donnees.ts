import type {
  ContenuExpertises,
  ContenuHubExpertises,
} from "@/types/expertises";

/**
 * Le contenu du HUB `/expertises/`, relevé MOT POUR MOT dans la référence :
 * la capture `maquette/rendu/expertises.html` (gabarit « 10 Hub de rubrique »,
 * 19 sections rendues par `MigenExpertise.dc.html`). Les chaînes sont les
 * littéraux de la capture, apostrophes droites ou typographiques et espaces
 * insécables compris : une chaîne qui sort d'ici est celle qui y est entrée.
 *
 * POURQUOI ICI ET PAS DANS LE RELAIS DISQUE. La base porte pour `/expertises/`
 * une ligne qui a DÉJÀ un gabarit (« expertises », ancienne forme, voir plus
 * bas), et le relais de `lib/contenu.ts` ne joue que pour une ligne sans
 * gabarit. La base n'est pas réinscriptible (clé de service vide, CLAUDE.md
 * §15). `PageExpertises` substitue donc cette donnée à la ligne PÉRIMÉE, et à
 * elle seule : dès que la base porte la forme hub, elle reprend la main.
 * Vérifié le 08/10 : `/expertises/` est la SEULE ligne de `pages` dont le
 * gabarit vaut « expertises », aucune page fille ne peut recevoir ce texte.
 *
 * LES PHOTOS sont celles que la capture nomme (`url(...)` des cartes) ou, pour
 * celles qu'elle sert en `blob:`, les fichiers dont les OCTETS sont ceux de la
 * maquette vivante (empreinte relevée par XHR depuis son cadre, 08/10) :
 * `mq-17e2f3bce95f.jpg` (panneau des types et carte EATON), et deux fichiers
 * rapatriés tels quels, `mq-1ef16ef335a6.jpg` (STELLANTIS fonderie) et
 * `mq-29ebb1b81ced.jpg` (VEEPEE), nommés comme les autres `mq-` par le début
 * de leur SHA-256. La photo du problème est celle de `ProblemeOffre` par
 * défaut (`team-electric.jpg`, même prise que la capture).
 */

/** Le H1 de la capture, servi tant que la base porte l'ancien (plus court). */
export const TITRE_HUB_EXPERTISES =
  "Maintenance des équipements industriels : un seul appel, huit métiers sur votre site";

export const CONTENU_HUB_EXPERTISES: ContenuHubExpertises = {
  gabarit: "expertises",
  pastille: "Expertises",
  chapeau: "Un seul prestataire pour toute la machine, de la transmission mécanique au robot. Huit domaines techniques, des techniciens évalués en entretien, et un compte rendu exploitable après chaque passage.",
  actions: [{ libelle: "Demander une intervention", href: "#besoin" }],
  mention: "Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à 18h30. Astreinte la nuit, le week-end et les jours fériés en option.",
  formulaireHeroTitre: "Demander une intervention",
  formulaireHeroMention: "Rappel dans l’heure",
  appelBouton: "Demander une intervention",
  chiffres: [
    {
      valeur: "+ 120",
      libelle: "Collaborateurs, depuis 4 agences, Lyon (siège), Montréal, Dubaï et Madrid",
    },
    { valeur: "+200", libelle: "Clients industriels accompagnés" },
    {
      valeur: "10 %",
      libelle: "Des techniciens retenus, entretien technique ET comportemental, résultats partageables",
    },
  ],
  reponse: {
    surtitre: "De quoi on parle",
    titre: "Maintenir un équipement industriel, ce n'est pas réparer quand ça casse.",
    texte: "C'est un ensemble d'activités coordonnées qui gardent chaque système de production en état de fonctionnement, au meilleur coût.",
    points: [
      {
        titre: "Garder la production disponible",
        texte: "Entretien courant, contrôle, surveillance des organes critiques, avant la panne qui immobilise la ligne.",
      },
      {
        titre: "Réparer vite et bien",
        texte: "Recherche de panne, remise en état, remise en service contrôlée, compte rendu exploitable.",
      },
      {
        titre: "Améliorer l'existant",
        texte: "Fiabilisation, modernisation, mise en conformité des installations qui vieillissent.",
      },
      {
        titre: "Analyser le fonctionnement",
        texte: "Relevés, historique, GMAO. Chaque information collectée rend l'intervention suivante plus juste.",
      },
    ],
  },
  domaines: {
    titre: "Les huit domaines techniques que couvrent nos équipes",
    cartes: [
      {
        titre: "Maintenance mécanique",
        accroche: "Des transmissions qui tiennent",
        texte: "Roulements, réducteurs, alignements. La maintenance mécanique est le socle de la fiabilité.",
        href: "/expertises/mecanique/",
        photo: "/assets/web/team-grind-front.jpg",
      },
      {
        titre: "Maintenance électrique industrielle",
        accroche: "Une armoire sûre et lisible",
        texte: "Moteurs, variateurs, distribution. La maintenance électrique industrielle se mène par des professionnels habilités.",
        href: "/expertises/electrique/",
        photo: "/assets/web/team-electric.jpg",
      },
      {
        titre: "Électromécanique industrielle",
        accroche: "Le défaut qui se cache entre deux métiers",
        texte: "L'électromécanique industrielle porte un double regard sur la même machine.",
        href: "/expertises/electromecanique/",
        photo: "/assets/web/team-grind-close.jpg",
      },
      {
        titre: "Automatisme industriel",
        accroche: "Une production qui redémarre proprement",
        texte: "Automates, capteurs, supervision. L'automatisme industriel est le système nerveux de l'usine.",
        href: "/expertises/automatisme/",
        photo: "/assets/web/ph-robots-solaire.jpg",
      },
      {
        titre: "Maintenance hydraulique",
        accroche: "La fin des fuites et des à-coups",
        texte: "Centrales, vérins, pompes, flexibles. La maintenance hydraulique va de la fuite au dimensionnement.",
        href: "/expertises/hydraulique/",
        photo: "/assets/web/ph-tuyaux.jpg",
      },
      {
        titre: "Maintenance pneumatique",
        accroche: "De l'air comprimé qui ne coûte plus une fortune",
        texte: "La maintenance pneumatique traque les fuites, économie d'énergie immédiate.",
        href: "/expertises/pneumatique/",
        photo: "/assets/web/ph-technicien.jpg",
      },
      {
        titre: "Soudure industrielle",
        accroche: "Un châssis qui ne se fissure plus",
        texte: "Notre soudure industrielle répare, elle ne fabrique pas en série. Les réseaux de fluides relèvent de la maintenance tuyauterie industrielle.",
        href: "/expertises/soudure/",
        photo: "/assets/web/team-grind-impact.jpg",
      },
      {
        titre: "Maintenance robotique",
        accroche: "Un robot remis en ligne sans casse",
        texte: "La maintenance robotique traite trajectoires, organes d'usure et redémarrage, avec un automaticien industriel spécialisé Siemens, Schneider, Fanuc ou ABB.",
        href: "/expertises/robotique/",
        photo: "/assets/web/team-duo.jpg",
      },
    ],
  },
  types: {
    titre: "Quel type de maintenance pour quel besoin",
    photo: "/assets/web/mq-17e2f3bce95f.jpg",
    etiquette: "Quand l'utiliser",
    rangees: [
      {
        titre: "Préventive",
        phrase: "Prévenir la défaillance par des visites programmées",
        quand: "Organes à usure connue, vérifications périodiques légales",
        href: "/expertises/types-de-maintenance/maintenance-preventive/",
      },
      {
        titre: "Corrective et curative",
        phrase: "Réparer après l'incident, en traitant la cause",
        quand: "Équipements non critiques, aléas imprévus",
        href: "/expertises/types-de-maintenance/maintenance-corrective/",
      },
      {
        titre: "Conditionnelle et prédictive",
        phrase: "Anticiper grâce à la surveillance et à la mesure",
        quand: "Machines critiques, immobilisations coûteuses",
        href: "/expertises/types-de-maintenance/maintenance-conditionnelle/",
      },
      {
        titre: "Améliorative",
        phrase: "Fiabiliser et moderniser l'équipement",
        quand: "Pannes récurrentes, obsolescence",
        href: "/expertises/types-de-maintenance/maintenance-ameliorative/",
      },
    ],
  },
  complementTypes: [
    {
      texte: "Notre guide des types de maintenance détaille chaque approche.",
    },
  ],
  complementOffre: [{ texte: "Ligne bloquée maintenant ? Voir le dépannage industriel." }],
  marquesFamille: "auto",
  marquesFamilles: ["auto", "robot", "mo", "plast", "agro", "logi", "fluide"],
  pagesLieesTitre: "Par où continuer\u00a0?",
  pagesLiees: [
    {
      titre: "Entreprise de maintenance industrielle",
      phrase: "Cinq façons de travailler ensemble, du dépannage ponctuel au technicien intégré : voir les offres de notre entreprise de maintenance industrielle.",
      href: "/offres/",
      photo: "/assets/web/team-duo.jpg",
    },
    {
      titre: "Contrat de maintenance Zéro arrêt",
      phrase: "Pour un programme suivi, voir le contrat de maintenance Zéro arrêt.",
      href: "/offres/zero-arret/",
      photo: "/assets/web/x-logistique-entrepot.jpg",
    },
    {
      titre: "Maintenance tuyauterie industrielle",
      href: "/expertises/tuyauterie/",
      photo: "/assets/web/ph-tuyaux.jpg",
    },
    {
      titre: "Automaticien industriel",
      href: "/expertises/specialisations-constructeur/",
      photo: "/assets/web/ph-technicien.jpg",
    },
    {
      titre: "Technicien en résidence",
      phrase: "Des techniciens intégrés à votre équipe, sur votre site.",
      href: "/offres/residence/",
      photo: "/assets/web/team-duo.jpg",
    },
    {
      titre: "Arrêt technique",
      phrase: "Vos arrêts planifiés, tenus à la date annoncée.",
      href: "/offres/arret-technique/",
      photo: "/assets/web/ph-hero-raffinerie.jpg",
    },
  ],
  sections: [
    {
      type: "probleme",
      punchline: "Trois prestataires, trois factures, et toujours la même panne le mois suivant.",
      puces: [
        {
          accroche: "Une presse en panne mobilise trois métiers dans la même journée.",
          texte: "Électricité, hydraulique, automatisme. Trois prestataires, c'est deux conclusions contradictoires et personne qui répond du résultat.",
        },
        {
          accroche: "Le technicien introuvable est devenu le premier risque de l'industrie française.",
          texte: "Recruter prend des mois, le marché est tendu, et l'attente coûte plus cher que la prestation.",
        },
        {
          accroche: "Vous dépendez de deux personnes irremplaçables.",
          texte: "Le jour où elles sont absentes, l'usine est aveugle et l'arbitrage se fait au téléphone.",
        },
        {
          accroche: "Le prestataire opaque coûte deux fois.",
          texte: "Coefficient caché sur les pièces, personne différente à chaque visite, aucun compte rendu exploitable, et rien de capitalisé.",
        },
      ],
    },
    {
      type: "offre",
      lignes: [
        {
          prestation: {
            accroche: "Dépanner en urgence",
            texte: "Diagnostic, réparation, essais, remise en service, avec astreinte la nuit, le week-end et les jours fériés en option, partout en France.",
          },
          benefice: "Une ligne bloquée un samedi ne devient pas un lundi perdu.",
        },
        {
          prestation: {
            accroche: "Prévenir",
            texte: "Campagnes planifiées, inspections, contrôles, réglages, remplacements périodiques, vérifications réglementaires.",
          },
          benefice: "Le plan est tenu, y compris les semaines où vos équipes sont prises ailleurs.",
        },
        {
          prestation: {
            accroche: "Surveiller",
            texte: "Analyse vibratoire, thermographie infrarouge, analyse d'huile, contrôle des intensités sur les actifs critiques.",
          },
          benefice: "Vous voyez la dégradation venir, et l'arrêt devient planifié.",
        },
        {
          prestation: {
            accroche: "Améliorer",
            texte: "Fiabilisation d'un point faible, modification de conception, meilleure accessibilité d'un point de contrôle.",
          },
          benefice: "La panne sort du planning au lieu d'être entretenue.",
        },
        {
          prestation: {
            texte: "Intégrer un technicien sur site en prestation de services, pour une durée définie avec vous.",
          },
          benefice: "Votre production cesse de dépendre d'une seule personne.",
        },
        {
          prestation: {
            texte: "Une seule équipe pour toute la machine huit domaines mobilisables sans changer de prestataire.",
          },
          benefice: "Un seul interlocuteur, une seule conclusion, une seule facture.",
        },
      ],
    },
    {
      type: "deroule",
      etapes: [
        {
          titre: "Vous décrivez la situation.",
          texte: "Quatre champs, ou un appel par téléphone. Dites ce qui se passe, on vous met sur la bonne offre.",
        },
        {
          titre: "Nous qualifions le besoin.",
          texte: "Équipement, symptôme, criticité, contraintes de production, compétences déjà présentes chez vous.",
        },
        {
          titre: "Nous vous disons si nous avons le technicien, et lequel.",
          texte: "Rapidement, et franchement, y compris quand la réponse est non.",
        },
        {
          titre: "Les autorisations sont vérifiées avant le déplacement.",
          texte: "Consignation électrique, travail en hauteur, espaces confinés, zones classées, plan de prévention signé.",
        },
        {
          titre: "Le technicien intervient en autonomie.",
          texte: "Accueil sécurité suivi à la lettre, diagnostic, travaux, essais, remise en service.",
        },
        {
          titre: "Vous recevez un écrit exploitable.",
          texte: "Cause, travaux réalisés, pièces, relevés, recommandations, au format que votre GMAO sait lire.",
        },
      ],
    },
    {
      type: "garanties",
      puces: [
        {
          accroche: "Des techniciens du niveau annoncé.",
          texte: "Chaque technicien passe une épreuve technique sur cas réels et une épreuve comportementale, du bac pro au diplôme d'ingénieur. Seuls 10 % sont retenus, et les résultats de ces épreuves sont consultables.",
        },
        {
          accroche: "La sécurité comme condition, pas comme chapitre.",
          texte: "Plan de prévention, habilitations à jour, équipements de protection, respect de vos consignations et de vos règles d'accès. Un chantier réussi est d'abord un chantier sûr.",
        },
        {
          accroche: "Un compte rendu après chaque passage.",
          texte: "Cause, travaux, pièces, relevés, recommandations. Exploitable dans votre GMAO, et il vous reste même le jour où vous changez de prestataire.",
        },
      ],
    },
    {
      type: "preuves",
      preuves: [
        {
          titre: "Maintenance préventive et curative d'une fonderie et d'un usinage, automobile",
          texte: "Tenue, depuis octobre 2023.",
          lienLibelle: "Étude de cas STELLANTIS",
          lienHref: "/preuves/stellantis-fonderie-sept-fons/",
          photo: "/assets/web/mq-1ef16ef335a6.jpg",
        },
        {
          titre: "18 à 25 techniciens sur plusieurs sites, transition vers le véhicule électrique",
          texte: "Depuis juin 2023.",
          lienLibelle: "Étude de cas STELLANTIS",
          lienHref: "/preuves/stellantis-grand-est/",
          photo: "/assets/web/mq-e6322efcd358.jpg",
        },
        {
          titre: "Un automaticien SIEMENS en renfort sur le démarrage d'une nouvelle ligne, industrie",
          texte: "Près de Lyon, en 2025.",
          lienLibelle: "Étude de cas MERSEN",
          lienHref: "/preuves/mersen/",
          photo: "/assets/web/x-elec-cablage.jpg",
        },
        {
          titre: "Un électromécanicien habilité risque chimique sur la remise en état d'un site de traitement des eaux",
          texte: "Mobilisé six mois.",
          lienLibelle: "Étude de cas SUEZ",
          lienHref: "/preuves/suez-remise-en-etat/",
          photo: "/assets/web/mq-2a6115ec9fe0.jpg",
        },
        {
          titre: "Reprise complète de la maintenance préventive annuelle de deux sites, e-commerce",
          texte: "Six techniciens en permanence.",
          lienLibelle: "Étude de cas VEEPEE",
          lienHref: "/preuves/veepee-sites-lyon/",
          photo: "/assets/web/mq-29ebb1b81ced.jpg",
        },
        {
          titre: "Installation et mise en production d'un nouveau parc machine, automobile",
          texte: "Six techniciens mobilisés.",
          lienLibelle: "Étude de cas EATON",
          lienHref: "/preuves/eaton-mise-en-production/",
          photo: "/assets/web/mq-17e2f3bce95f.jpg",
        },
        {
          titre: "Monter, déplacer, renforcer, chantier après chantier",
          lienLibelle: "Étude de cas Soprema",
          lienHref: "/preuves/soprema/",
          photo: "/assets/web/mq-0699d4d92e7e.jpg",
        },
        {
          titre: "Le préventif d’une centrale photovoltaïque en trois techniciens",
          lienLibelle: "Étude de cas Eiffage",
          lienHref: "/preuves/eiffage/",
          photo: "/assets/web/mq-2a6115ec9fe0.jpg",
        },
      ],
    },
    {
      type: "objections",
      titre: "Vos questions avant de nous appeler",
      questions: [
        {
          question: "Quels équipements couvrez-vous exactement ?",
          reponse: "Tout équipement de production ou de flux : machines industrielles, lignes de conditionnement, presses, convoyeurs et systèmes de manutention, robots, utilités, armoires électriques, automates. Nos huit domaines couvrent la mécanique, l'électricité, l'automatisme, les fluides et la structure de la machine.",
        },
        {
          question: "Faut-il un contrat pour faire appel à vous ?",
          reponse: "Non. Une panne isolée se traite en intervention ponctuelle. Le contrat devient utile quand vous cherchez un résultat durable : moins d'immobilisations, un budget maîtrisé, un programme suivi et mesuré. Les modalités se définissent ensemble, sur devis.",
        },
        {
          question: "Comment vérifier le niveau de vos techniciens avant qu'ils arrivent ?",
          reponse: "Demandez le CV et les habilitations en amont, nous les communiquons. Nous partageons aussi les résultats de l'évaluation d'entrée : épreuve technique sur cas réels, épreuve comportementale, 10 % des techniciens retenus. La transparence sur la compétence fait partie du service.",
        },
        {
          question: "Que se passe-t-il si votre technicien est absent trois semaines ?",
          reponse: "Un remplaçant est nommé et la passation est organisée sur site. C'est le critère le plus souvent oublié quand on compare deux prestataires, et celui qui fait le plus mal. Un prestataire qui repose sur une seule personne reproduit le risque que vous vouliez supprimer.",
        },
        {
          question: "Intervenez-vous partout en France ?",
          reponse: "Oui. 4 agences, Lyon (siège), Montréal, Dubaï et Madrid, et des hubs de techniciens dans les grandes villes de France. Le Sud-Ouest est couvert depuis Toulouse, les Hauts-de-France depuis Paris, le Sud-Est depuis Lyon, le Grand Ouest depuis Nantes. En visite programmée comme en urgence.",
        },
        {
          question: "Comment réduisez-vous le nombre de pannes ?",
          reponse: "En traitant les causes racines plutôt que les symptômes : analyse de chaque défaillance, surveillance des organes critiques, formation de vos opérateurs aux signaux d'alerte. Le résultat se lit dans l'historique, année après année, et c'est là que nous acceptons d'être jugés.",
        },
      ],
    },
    {
      type: "ctaFinal",
      question: "Besoin d'un seul interlocuteur pour toute la machine, pas de trois devis contradictoires ?",
      bouton: "Demander une intervention",
    },
  ],
};

/**
 * L'ANCIENNE FORME, PLUS RENDUE : c'est la ligne que la base porte encore pour
 * `/expertises/`, et `scripts/verifie-contenu-expertises.ts` la compare au SQL
 * importé. Elle vient de l'écran EXPERTISES de l'export de démonstration, qui
 * n'est le gabarit d'aucune page (CLAUDE.md §16). À supprimer avec ce script
 * le jour où la base porte `CONTENU_HUB_EXPERTISES`.
 *
 * Le contenu de l'écran EXPERTISES de la maquette, recopié tel quel.
 *
 * Source : « Migen - Site final.dc.html », lignes 6211 à 6646.
 *
 * À QUOI IL SERT. C'est la valeur que l'import doit écrire dans
 * `pages.contenu` pour `/expertises/`, et c'est le contenu sur lequel
 * `verification-expertises.tsx` fait tourner le gabarit. Il n'est PAS une
 * valeur par défaut du composant : une page fille sans contenu afficherait
 * alors la copie de la page mère, ce qui serait une donnée fausse.
 *
 * TROIS ÉCARTS ASSUMÉS avec la maquette, imposés par les interdits de copie du
 * contrat (`docs/CONTRAT-PORTAGE-MAQUETTE.md`) :
 *
 *   1. « Mobilisation sous 24 h, 2 h sous abonnement » : aucun délai chiffré
 *      d'intervention ne sort du site, seul « rappel dans l'heure » est
 *      autorisé. Devient « Mobilisation en urgence, rappel dans l'heure ».
 *   2. « mise à disposition » : mot interdit, deux occurrences. Devient
 *      « intervention ».
 *   3. Trois tirets cadratins dans du texte visible, remplacés par deux-points
 *      ou par une virgule.
 *
 * LES LIENS. La maquette pilotait les neuf domaines et les neuf secteurs par
 * verbes de navigation (`onClick="{{ cxL.mecanique }}"`), qui ne se portent pas.
 * Les chemins viennent de `docs/urls-site-actuel.json`, où ces dix-huit URL
 * existent déjà : rien n'est inventé.
 */
export const CONTENU_EXPERTISES: ContenuExpertises = {
  gabarit: "expertises",
  surtitre: "Expertises",
  chapeau:
    "Six natures d’intervention, neuf domaines techniques, neuf secteurs. Un site ne tombe jamais en panne sur une seule technologie : nous couvrons la mécanique, l’électricité, les fluides et l’automatisme avec les mêmes équipes.",
  actions: [
    { libelle: "Décrire mon besoin", href: "#formulaire", principale: true },
    { libelle: "Types de maintenance", href: "#types" },
  ],
  cumul: {
    titre: "Le cumul rare",
    lignes: [
      {
        valeur: "6",
        texte:
          "natures d’intervention : préventif, curatif, conditionnel, amélioratif, réglementaire, travaux neufs.",
      },
      {
        valeur: "9",
        texte:
          "domaines techniques couverts en interne, sans sous-traitance en cascade.",
      },
      {
        valeur: "4",
        texte:
          "spécialisations constructeur certifiées : SIEMENS, Schneider, FANUC, ABB.",
      },
      {
        valeur: "100 %",
        texte:
          "des habilitations à jour, vérifiées avant chaque intervention.",
      },
    ],
  },

  types: {
    entete: {
      surtitre: "Types de maintenance",
      titre: "Six natures d’intervention, pas une seule",
      note: "Un contrat sain répartit les heures entre ces natures. Un contrat subi n’en contient qu’une : le curatif.",
    },
    cartes: [
      {
        titre: "Préventive systématique",
        etiquette: "Planifiée",
        texte:
          "Gammes exécutées à échéance fixe : heures de marche, cycles, calendrier. Graissage, remplacement d’usure, resserrage, contrôles de sécurité.",
        puces: [
          "Gammes rédigées et tenues à jour",
          "Relevé de compteurs et échéancier",
          "Historique consigné dans votre GMAO",
        ],
        pied: "Le socle : 60 à 70 % de nos heures en résidence.",
      },
      {
        titre: "Curative",
        etiquette: "Urgence",
        accent: true,
        texte:
          "Remise en marche après défaillance. Diagnostic, réparation ou dépannage provisoire, sécurisation, puis correction durable planifiée.",
        puces: [
          "Mobilisation en urgence, rappel dans l’heure",
          "Diagnostic et compte rendu le jour même",
          "Solution provisoire assumée si la pièce manque",
        ],
        pied: "Ce que vous appelez « la panne ». Objectif : en avoir de moins en moins.",
      },
      {
        titre: "Conditionnelle & prédictive",
        etiquette: "Mesure",
        texte:
          "Intervention déclenchée par un relevé, pas par une date. Analyse vibratoire, thermographie, contrôle d’huile, suivi de consommation.",
        puces: [
          "Relevés vibratoires et thermographiques",
          "Seuils d’alerte définis avec vous",
          "Remplacement avant la casse, en fenêtre choisie",
        ],
        pied: "Le meilleur rapport coût/arrêt évité sur les machines critiques.",
      },
      {
        titre: "Améliorative",
        etiquette: "Fiabilisation",
        texte:
          "On ne répare pas la même panne trois fois. Modification de conception, changement de composant, reprise d’automatisme, suppression de la cause.",
        puces: [
          "Analyse des pannes récurrentes",
          "Modification chiffrée avant exécution",
          "Mise à jour des plans et des gammes",
        ],
        pied: "Se prolonge en migen© Retrofit pour les machines vieillissantes.",
      },
      {
        titre: "Réglementaire",
        etiquette: "Conformité",
        texte:
          "Vérifications périodiques obligatoires et levée de réserves : appareils de levage, équipements sous pression, installations électriques, sécurité machine.",
        puces: [
          "Planning des vérifications périodiques",
          "Levée des réserves de l’organisme de contrôle",
          "Registres et attestations archivés",
        ],
        pied: "Coordonné avec votre organisme agréé, pas à sa place.",
      },
      {
        titre: "Travaux neufs",
        etiquette: "Projet",
        texte:
          "Tout ce qui n’est pas de l’entretien : ajout de poste, modification de ligne, déplacement de machine, installation complète.",
        puces: [
          "Chiffrage au forfait, périmètre fermé",
          "Réalisé par migen© Chantier ou Construction",
          "Intégration aux gammes de maintenance ensuite",
        ],
        pied: "Bascule sur les offres Chantier, Bureau d’études ou Construction.",
      },
    ],
  },

  dosage: {
    entete: {
      surtitre: "Le bon dosage",
      titre: "Sortir du tout-curatif est une question de mois, pas de discours.",
    },
    paragraphes: [
      "La plupart des sites que nous reprenons passent plus de 70 % de leurs heures en curatif. C’est le régime le plus coûteux : heures en urgence, pièces en express, production perdue, équipes épuisées.",
      "Notre travail des six premiers mois consiste à inverser cette répartition. Les gammes sont écrites, les échéances tenues, les pannes récurrentes traitées à la cause. Le curatif ne disparaît jamais, il redevient l’exception.",
    ],
    repartition: {
      titre: "Répartition des heures",
      periode: "À l’arrivée → après 12 mois",
      jeux: [
        {
          legende: "Site repris, mois 1",
          barres: [
            { libelle: "Curative", valeur: 72 },
            { libelle: "Préventive", valeur: 21 },
            { libelle: "Conditionnelle", valeur: 4 },
            { libelle: "Améliorative", valeur: 3 },
          ],
        },
        {
          legende: "Même site, mois 12",
          accent: true,
          barres: [
            { libelle: "Curative", valeur: 28 },
            { libelle: "Préventive", valeur: 44 },
            { libelle: "Conditionnelle", valeur: 16 },
            { libelle: "Améliorative", valeur: 12 },
          ],
        },
      ],
      note: "Répartition observée sur nos contrats de résidence, variable selon l’état du parc à la reprise.",
    },
  },

  domaines: {
    entete: {
      surtitre: "Domaines d’activité",
      titre: "Ce que nos techniciens savent faire",
      note: "Chaque domaine a sa page dédiée et ses habilitations propres",
    },
    lienLibelle: "Ce qu’on y répare",
    cartes: [
      {
        titre: "Mécanique",
        etiquette: "Alignement · Vibratoire",
        texte:
          "Roulements, réducteurs, transmissions, alignement laser, reprise de jeux.",
        href: "/expertises/mecanique/",
      },
      {
        titre: "Électromécanique",
        etiquette: "Moteurs · Freins",
        texte:
          "Moteurs, freins, motoréducteurs, rebobinage, remplacement en ligne.",
        href: "/expertises/electromecanique/",
      },
      {
        titre: "Électrique",
        etiquette: "B2V · BR · BC",
        texte: "Armoires, câblage, consignation, mise en conformité, plans à jour.",
        href: "/expertises/electrique/",
      },
      {
        titre: "Automatisme",
        etiquette: "SIEMENS · Schneider",
        texte:
          "Diagnostic d’automate, reprise de programme, défauts intermittents, migration.",
        href: "/expertises/automatisme/",
      },
      {
        titre: "Robotique",
        etiquette: "FANUC · ABB",
        texte:
          "Trajectoires, préhenseurs, cellules, remise en service après collision.",
        href: "/expertises/robotique/",
      },
      {
        titre: "Hydraulique",
        etiquette: "Haute pression",
        texte: "Centrales, vérins, distributeurs, flexibles, recherche de fuite.",
        href: "/expertises/hydraulique/",
      },
      {
        titre: "Pneumatique",
        etiquette: "Réseaux · Îlots",
        texte: "Réseaux, vérins, îlots de distribution, traitement d’air.",
        href: "/expertises/pneumatique/",
      },
      {
        titre: "Soudure",
        etiquette: "TIG · MIG · Arc",
        texte: "TIG, MIG, arc, inox et acier, reprise de structure, chaudronnerie.",
        href: "/expertises/soudure/",
      },
      {
        titre: "Tuyauterie",
        etiquette: "Inox · Acier noir",
        texte: "Préfabrication, piquages, supportage, épreuve, calorifuge.",
        href: "/expertises/tuyauterie/",
      },
    ],
  },

  constructeurs: {
    entete: {
      surtitre: "Spécialisations constructeur",
      titre: "Certifiés sur les plateformes que vous avez déjà.",
    },
    texte:
      "Un automaticien généraliste met trois jours à comprendre votre programme. Un automaticien certifié sur votre plateforme ouvre le projet et lit. C’est toute la différence sur un arrêt.",
    lignes: [
      { nom: "SIEMENS", outils: "TIA Portal, Step 7, S7-300 à S7-1500, WinCC" },
      { nom: "SCHNEIDER", outils: "Unity Pro, EcoStruxure, M340, Altivar" },
      { nom: "FANUC", outils: "Série R-30i, Roboguide, cellules de soudure" },
      { nom: "ABB", outils: "IRC5, RobotStudio, manipulation et palettisation" },
    ],
    image: { src: "/assets/web/sv-convoyeur.jpg", alt: "Cellule robotisée" },
  },

  secteurs: {
    entete: {
      surtitre: "Secteurs d’activité",
      titre: "Les contraintes changent d’une industrie à l’autre",
    },
    cartes: [
      {
        titre: "Agroalimentaire",
        texte:
          "Lignes de conditionnement, nettoyabilité, arrêts courts et fréquents.",
        href: "/secteurs/agroalimentaire/",
      },
      {
        titre: "Automobile",
        texte: "Cadence, robotique de soudure, presses, convoyage, takt time.",
        href: "/secteurs/automobile/",
      },
      {
        titre: "Centre logistique",
        texte:
          "Convoyeurs, trieurs, palettiseurs, disponibilité en saison haute.",
        href: "/secteurs/logistique/",
      },
      {
        titre: "Industrie lourde",
        texte:
          "Charges, environnements poussiéreux, maintenance de gros équipements.",
        href: "/secteurs/industrie-lourde/",
      },
      {
        titre: "Industrie métallique",
        texte: "Presses, cisailles, plieuses, outillage, reprise de structure.",
        href: "/secteurs/industrie-metallique/",
      },
      {
        titre: "Pharmaceutique",
        texte:
          "Traçabilité, zones à atmosphère contrôlée, documentation exigeante.",
        href: "/secteurs/pharmaceutique/",
      },
      {
        titre: "Chimie",
        texte: "Habilitations risques chimiques, ATEX, consignation stricte.",
        href: "/secteurs/chimie/",
      },
      {
        titre: "Aéronautique",
        texte: "Tolérances serrées, contrôle dimensionnel, procédures qualité.",
        href: "/secteurs/aeronautique/",
      },
      {
        titre: "Menuiserie industrielle",
        texte: "Machines à bois, aspiration, affûtage, sécurité machine.",
        href: "/secteurs/menuiserie-industrielle/",
      },
    ],
  },

  habilitations: {
    entete: { surtitre: "Habilitations", titre: "Vérifiées avant, pas pendant." },
    texte:
      "Chaque technicien arrive avec ses titres à jour et ses attestations transmises avec le plan de prévention. Aucune intervention sans contrôle de validité.",
    cartes: [
      { titre: "CACES 486 & 489", texte: "Nacelles et chariots élévateurs" },
      {
        titre: "Habilitations électriques",
        texte: "B1V, B2V, BR, BC, consignation",
      },
      {
        titre: "Travail en hauteur",
        texte: "Port du harnais, ancrages, échafaudage",
      },
      { titre: "Risques chimiques", texte: "Niveaux 1 et 2, ATEX selon sites" },
      { titre: "Accès Z.A.C", texte: "Zones à atmosphère contrôlée" },
      {
        titre: "MASE & EcoVadis",
        texte: "Démarche sécurité et évaluation RSE",
        accent: true,
      },
    ],
  },

  formulaire: {
    titre: "Votre panne est à cheval sur deux métiers ?",
    intro:
      "C’est le cas le plus fréquent. Décrivez le symptôme, nous composons l’équipe.",
  },
};
