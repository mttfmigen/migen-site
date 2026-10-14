/**
 * Les données du hub /ressources/, tirées du relevé de la maquette
 * « Ressources v2 » (`window.__MGRES` et règles de `page-dc.jsx`), sans rien
 * y ajouter. Fichier versionné : le code servi n'importe jamais `maquette/`.
 *
 * Seuls les contenus que la maquette AFFICHE sont ici : 15 articles côté
 * Entreprises, 13 fiches côté Techniciens, dans l'ordre de la maquette. Les
 * 20 contenus « en pause » (fiches pratiques, fiches techniques, livres
 * blancs, process) n'y sont pas : la maquette ne les montre jamais et grise
 * leurs formats sous « Bientôt ». Les étiquettes sont celles que la maquette
 * calcule (TAXE / TAXT) ; la carte en montre les trois premières.
 * Aucune date : la maquette n'en a pas.
 */

export interface ContenuRessource {
  url: string;
  titre: string;
  format: string;
  sujet: string;
  minutes: number;
  resume: string;
  photo: string;
  etiquettes: readonly string[];
}

export interface EtapeSelection {
  titre: string;
  texte: string;
}

export const CONTENUS_ENTREPRISES: readonly ContenuRessource[] = [
  {
    "url": "/ressources/articles/cout-arret-de-production/",
    "titre": "Coût d'un arrêt de production",
    "format": "Article",
    "sujet": "Coûts & environnement",
    "minutes": 11,
    "resume": "Une ligne à l'arrêt ne coûte pas le prix de la réparation. Elle emporte la fabrication perdue, chaque heure, pendant que les équipes attendent et que les commandes prennent du délai.",
    "photo": "/assets/web/x-auto-ligne.jpg",
    "etiquettes": [
      "Planification",
      "Coûts",
      "Organisation",
      "Arrêt de production"
    ]
  },
  {
    "url": "/ressources/articles/digitalisation-maintenance/",
    "titre": "Digitalisation maintenance",
    "format": "Article",
    "sujet": "Digital & IA",
    "minutes": 10,
    "resume": "Des rapports d'intervention papier, des historiques introuvables, des pièces commandées en urgence : la maintenance traditionnelle coûte cher en silence. La digitalisation maintenance…",
    "photo": "/assets/web/x-logistique-tablette.jpg",
    "etiquettes": [
      "Prédictive",
      "Coûts",
      "Organisation",
      "Digital"
    ]
  },
  {
    "url": "/ressources/articles/gestion-des-dechets/",
    "titre": "Gestion des déchets industriels",
    "format": "Article",
    "sujet": "Coûts & environnement",
    "minutes": 7,
    "resume": "Huiles usagées au fond de l'atelier, bidons sans étiquette, benne unique pour tout : la gestion des déchets industriels finit trop souvent en angle mort, jusqu'au contrôle qui coûte cher.",
    "photo": "/assets/web/x-cimenterie.jpg",
    "etiquettes": [
      "Coûts",
      "Organisation",
      "Environnement"
    ]
  },
  {
    "url": "/ressources/articles/gmao/",
    "titre": "Gestion de maintenance assistée par ordinateur",
    "format": "Article",
    "sujet": "Digital & IA",
    "minutes": 10,
    "resume": "Votre service maintenance pilote encore ses interventions sur un tableur et trois classeurs. Le jour où le technicien qui connaît la ligne s'absente, l'information part avec lui.",
    "photo": "/assets/web/x-elec-portrait.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Prédictive",
      "Organisation"
    ]
  },
  {
    "url": "/ressources/articles/ia-maintenance/",
    "titre": "IA maintenance : ce qui change vraiment",
    "format": "Article",
    "sujet": "Digital & IA",
    "minutes": 8,
    "resume": "Sur LinkedIn, l'usine sans pannes est pour demain. Sur le terrain, les lignes s'arrêtent toujours. L'IA maintenance mérite mieux que des slogans : cet article de nos Ressources :…",
    "photo": "/assets/web/ph-robots-solaire.jpg",
    "etiquettes": [
      "Préventive",
      "Corrective",
      "Prédictive",
      "Organisation",
      "IA",
      "Arrêt de production"
    ]
  },
  {
    "url": "/ressources/articles/maintenance-4-0/",
    "titre": "Maintenance 4.0",
    "format": "Article",
    "sujet": "Digital & IA",
    "minutes": 8,
    "resume": "La maintenance 4.0 promet la panne annoncée avant la casse. Entre la promesse et l'atelier, il reste un chantier : capteurs, données, méthode. Ce guide complet de nos Ressources :…",
    "photo": "/assets/web/x-robotique.jpg",
    "etiquettes": [
      "Prédictive",
      "Organisation",
      "Digital"
    ]
  },
  {
    "url": "/ressources/articles/optimiser-la-maintenance/",
    "titre": "Optimisation de la maintenance",
    "format": "Article",
    "sujet": "Méthodes",
    "minutes": 7,
    "resume": "Le préventif saute, le correctif explose le budget, la GMAO accumule du retard : la prochaine panne est déjà en route. L'optimisation de la maintenance remet l'usine à l'endroit : moins…",
    "photo": "/assets/web/team-grind-front.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Prédictive",
      "Indicateurs",
      "Coûts",
      "Organisation"
    ]
  },
  {
    "url": "/ressources/articles/organiser-service-maintenance/",
    "titre": "Comment organiser un service de maintenance",
    "format": "Article",
    "sujet": "Organisation",
    "minutes": 9,
    "resume": "Le préventif saute, le correctif déborde, l'équipe compense en heures supplémentaires. Comment organiser un service de maintenance qui tienne la charge ? Cet article de nos Ressources :…",
    "photo": "/assets/web/team-duo.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Indicateurs",
      "Organisation"
    ]
  },
  {
    "url": "/ressources/articles/plan-de-maintenance/",
    "titre": "Plan de maintenance",
    "format": "Article",
    "sujet": "Organisation",
    "minutes": 9,
    "resume": "Un plan de maintenance mal construit se voit toujours trop tard : le préventif saute, le correctif explose, le budget suit. Ce guide du blog Migen, publié dans nos Ressources : Articles,…",
    "photo": "/assets/web/sv-convoyeur.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Coûts",
      "Organisation",
      "Digital"
    ]
  },
  {
    "url": "/ressources/articles/planification-maintenance/",
    "titre": "Planning de maintenance",
    "format": "Article",
    "sujet": "Organisation",
    "minutes": 10,
    "resume": "Le préventif saute, le correctif déborde, la GMAO affiche des semaines de retard. Le problème n'est presque jamais la compétence de l'équipe : c'est le planning de maintenance, quand il…",
    "photo": "/assets/web/ph-technicien.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Planification",
      "Organisation"
    ]
  },
  {
    "url": "/ressources/articles/predictive-ou-corrective/",
    "titre": "Maintenance prédictive ou corrective",
    "format": "Article",
    "sujet": "Méthodes",
    "minutes": 11,
    "resume": "Maintenance prédictive ou corrective : ce choix décide de votre budget de maintenance, de la disponibilité de vos équipements et de la charge de votre équipe. Ce guide complet de nos…",
    "photo": "/assets/web/x-elec-cablage.jpg",
    "etiquettes": [
      "Corrective",
      "Prédictive",
      "Indicateurs",
      "Coûts",
      "Organisation"
    ]
  },
  {
    "url": "/ressources/articles/preventive-ou-corrective/",
    "titre": "Maintenance préventive et corrective",
    "format": "Article",
    "sujet": "Méthodes",
    "minutes": 10,
    "resume": "Une machine tombe en panne, la production s'arrête, tout le monde court. La maintenance préventive et corrective, ce sont les deux réponses possibles à ce moment : agir avant la…",
    "photo": "/assets/web/x-mecanique-portrait.jpg",
    "etiquettes": [
      "GMAO",
      "Préventive",
      "Corrective",
      "Organisation",
      "Arrêt de production"
    ]
  },
  {
    "url": "/ressources/articles/robot-spot/",
    "titre": "Robot spot",
    "format": "Article",
    "sujet": "Digital & IA",
    "minutes": 7,
    "resume": "La ronde que tout le monde évite : galeries, toitures, locaux confinés, zones à risque. C'est la mission pour laquelle le robot Spot de Boston Dynamics a été conçu.",
    "photo": "/assets/web/x-robotique.jpg",
    "etiquettes": [
      "Organisation",
      "Robotique"
    ]
  },
  {
    "url": "/ressources/articles/suivi-de-la-maintenance/",
    "titre": "Suivi de la maintenance",
    "format": "Article",
    "sujet": "Organisation",
    "minutes": 9,
    "resume": "Réparer sans noter, c'est réparer deux fois. Le suivi de la maintenance transforme chaque intervention en donnée utile : ce qui a cassé, ce qui a été fait, ce que cela a coûté.",
    "photo": "/assets/web/x-logistique-convoyeurs.jpg",
    "etiquettes": [
      "GMAO",
      "Indicateurs",
      "Coûts",
      "Organisation",
      "Digital"
    ]
  },
  {
    "url": "/ressources/articles/tpm/",
    "titre": "TPM, la maintenance productive totale",
    "format": "Article",
    "sujet": "Méthodes",
    "minutes": 8,
    "resume": "La TPM, maintenance productive totale, confie une partie de l'entretien des équipements aux opérateurs qui les font tourner. La TPM vise zéro panne, zéro défaut, zéro accident. Ce guide…",
    "photo": "/assets/web/team-grind-close.jpg",
    "etiquettes": [
      "Indicateurs",
      "Organisation",
      "TPM"
    ]
  }
];

export const CONTENUS_TECHNICIENS: readonly ContenuRessource[] = [
  {
    "url": "/carriere/technicien-de-maintenance/",
    "titre": "Technicien de maintenance",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 7,
    "resume": "Une ligne s'arrête un vendredi soir, et toute l'usine attend une seule personne : le technicien de maintenance. C'est la fonction qui tient la production debout, entre l'électrique, la…",
    "photo": "/assets/web/team-electric.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Électricité",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/electromecanicien/",
    "titre": "Électromécanicien",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 7,
    "resume": "Une machine s'arrête, personne ne sait si le défaut vient du moteur ou du circuit électrique, et c'est l'électromécanicien qu'on appelle. Ce métier de maintenance industrielle tient la…",
    "photo": "/assets/web/x-elec-portrait.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Électricité",
      "Mécanique",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/automaticien/",
    "titre": "Automaticien",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 7,
    "resume": "Une ligne s'arrête, le pupitre affiche un code que personne ne comprend, et c'est vers l'automaticien que tout le monde se tourne. Ce métier mêle électricité, informatique et mécanique.",
    "photo": "/assets/web/x-elec-cablage.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Électricité",
      "Mécanique",
      "Automatisme",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/roboticien/",
    "titre": "Roboticien",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 7,
    "resume": "Un robot de production s'arrête en pleine cadence, la trajectoire déraille, et c'est le roboticien qu'on appelle. Ce métier de la robotique industrielle mêle mécanique, électronique et…",
    "photo": "/assets/web/x-robotique.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Mécanique",
      "Robotique",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/technicien-itinerant/",
    "titre": "Technicien de maintenance itinérant",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 9,
    "resume": "Un client appelle, une machine est à l'arrêt à 200 km, et le technicien de maintenance itinérant prend la route. Ce métier, c'est le dépannage sur le terrain, chez le client, jamais deux…",
    "photo": "/assets/web/x-logistique-convoyeurs.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Itinérance",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/agent-de-maintenance/",
    "titre": "Agent de maintenance industrielle",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 8,
    "resume": "Une machine tombe en panne, la ligne s'arrête, et c'est l'agent de maintenance industrielle qui remet tout en marche. Ce métier tient la production debout, jour après jour, sur chaque site.",
    "photo": "/assets/web/team-grind-front.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/responsable-maintenance/",
    "titre": "Responsable maintenance",
    "format": "Fiche métier",
    "sujet": "Métier",
    "minutes": 8,
    "resume": "La production s'arrête, le budget dérape, l'équipe s'épuise : c'est le responsable maintenance qui doit reprendre la main. Ce métier pilote toute la fonction maintenance d'un site…",
    "photo": "/assets/web/team-duo.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Management",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/alternance/",
    "titre": "Alternance maintenance industrielle",
    "format": "Alternance",
    "sujet": "Alternance",
    "minutes": 8,
    "resume": "Vous cherchez une alternance en maintenance industrielle qui fait progresser vraiment, pas une alternance où l'on photocopie ? Migen prend des alternants techniciens et les met sur le…",
    "photo": "/assets/web/sv-duo-impact.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Alternance",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/automaticien/salaire/",
    "titre": "Salaire automaticien",
    "format": "Guide carrière",
    "sujet": "Salaire",
    "minutes": 7,
    "resume": "Vous savez faire parler un automate ; votre fiche de paie, elle, reste muette. Le salaire automaticien varie du simple au double selon l'expérience, le secteur et la ville : ce guide…",
    "photo": "/assets/web/x-elec-cablage.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Automatisme"
    ]
  },
  {
    "url": "/carriere/electromecanicien/competences/",
    "titre": "Compétences électromécanicien",
    "format": "Guide carrière",
    "sujet": "Compétences",
    "minutes": 8,
    "resume": "Une machine tombe, deux mondes se rencontrent : l'électrique et le mécanique. Les compétences électromécanicien tiennent dans cette double casquette, celle qui répare là où un…",
    "photo": "/assets/web/x-elec-portrait.jpg",
    "etiquettes": [
      "Compétences",
      "Électricité",
      "Mécanique",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/electromecanicien/salaire/",
    "titre": "Salaire électromécanicien",
    "format": "Guide carrière",
    "sujet": "Salaire",
    "minutes": 8,
    "resume": "Vous faites tourner des machines qui rapportent des milliers d'euros à l'heure, et vous vous demandez ce que vaut vraiment votre métier sur le marché. Le salaire électromécanicien mérite…",
    "photo": "/assets/web/x-elec-portrait.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Mécanique"
    ]
  },
  {
    "url": "/carriere/technicien-de-maintenance/formation/",
    "titre": "Formation technicien de maintenance",
    "format": "Guide carrière",
    "sujet": "Formation",
    "minutes": 10,
    "resume": "Une ligne s'arrête, personne dans l'atelier ne sait relancer la machine, et la production attend. Voilà pourquoi l'industrie cherche des profils formés : la bonne formation technicien de…",
    "photo": "/assets/web/team-electric.jpg",
    "etiquettes": [
      "Formation",
      "Alternance",
      "Sécurité"
    ]
  },
  {
    "url": "/carriere/technicien-de-maintenance/salaire/",
    "titre": "Salaire technicien de maintenance",
    "format": "Guide carrière",
    "sujet": "Salaire",
    "minutes": 7,
    "resume": "Vous réparez des lignes qui coûtent des milliers d'euros de l'heure à l'arrêt ; votre propre fiche de paie, elle, reste floue. Le salaire technicien de maintenance varie fortement en…",
    "photo": "/assets/web/team-electric.jpg",
    "etiquettes": [
      "Salaire",
      "Formation",
      "Compétences",
      "Sécurité"
    ]
  }
];

/** Les six étapes du process de sélection (espace Techniciens). */
export const ETAPES_SELECTION: readonly EtapeSelection[] = [
  {
    "titre": "La recherche de profils",
    "texte": "Sourcing direct, cooptation, candidatures : notre équipe recrutement travaille le marché de l'emploi en continu, métier par métier, de Paris à Nantes, en CDI, en CDD comme en alternance. Le traitement des candidatures commence par un tri sans complaisance."
  },
  {
    "titre": "Le premier échange",
    "texte": "Parcours réel, formation initiale, habilitations, mobilité, attentes : un premier filtre pour écarter les candidatures hors sujet et cadrer la suite. Environ la moitié des candidats s'arrête là : pour devenir finaliste, il faut passer l'atelier."
  },
  {
    "titre": "L'entretien technique",
    "texte": "Mises en situation sur des cas réels : diagnostic d'une panne, lecture de schéma, consignation, méthode de travail. L'objectif de la question n'est jamais de piéger : il est de voir la personne raisonner, dire ce qu'elle sait et ce qu'elle ignore."
  },
  {
    "titre": "L'entretien comportemental",
    "texte": "Sécurité, rigueur, communication, tenue face à la pression d'un arrêt de production. Un excellent dépanneur qui met l'atelier en danger ou brusque vos opérateurs reste un mauvais choix."
  },
  {
    "titre": "Les contrôles",
    "texte": "Références employeurs, diplômes, du Bac pro préparé en lycée professionnel au BUT génie industriel et maintenance ou à la licence pro, habilitations électriques et autorisations spécifiques. La mention d'une habilitation ne suffit pas : elle se vérifie, pièce par pièce, c'est une obligation légale et une question de sécurité."
  },
  {
    "titre": "La restitution",
    "texte": "Les résultats des deux entretiens vous sont présentés avant toute décision. Vous validez le profil, ou nous cherchons encore : le choix final reste chez vous, sur pièces."
  }
];
