/**
 * « L’offre » des pages secteur, telle que la maquette V3 la rend au téléphone
 * (`isTb` : chaque tableau, ses en-têtes et la première cellule de chaque
 * ligne, gras et liens compris, puis les paragraphes qui suivent). Copie mot pour mot de
 * `maquette/contenu/site/Secteurs/secteurs--*.md`, dossier écarté du paquet de
 * production. NE PAS ÉDITER : `python3 components/site/secteur/extrait-corpus-offre.py`.
 */
export interface TableauOffre {
  /** Les deux en-têtes (« Ce que nous faisons », « Ce que ça change pour vous »). */
  readonly entetes: readonly string[];
  /** La première cellule de chaque ligne, en Markdown en ligne. */
  readonly faisons: readonly string[];
}

export interface CorpusOffreSecteur {
  readonly tableaux: readonly TableauOffre[];
  /** Les paragraphes sous les tableaux, en Markdown en ligne. */
  readonly prose: readonly string[];
}

export const CORPUS_OFFRE: Readonly<Record<string, CorpusOffreSecteur>> = {
  "/secteurs/aeronautique/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Cartographie de criticité** : chaque moyen classé selon son impact et son risque.",
          "**Contrôles géométriques et relevés suivis dans le temps** : broches, axes, changeurs d'outils, lubrification.",
          "**Préventif calé sur vos fenêtres** : entre les équipes, la nuit, aux arrêts planifiés.",
          "**Automaticiens et roboticiens** : cellules de perçage, de dépose de fibre ou de peinture, variateurs, automates de machines.",
          "**Appui sur les moyens de mesure** : machines à mesurer, bancs de test, environnement des salles de métrologie.",
          "**Comptes rendus au format de votre GMAO**, habilitations à jour, plan de prévention signé.",
          "**Renforts préparés pour une montée en cadence** : entretien resserré sur les goulots, références critiques anticipées."
        ]
      },
      {
        "entetes": [
          "Attendu de la filière",
          "Réponse Migen"
        ],
        "faisons": [
          "Conformité des moyens",
          "Temps d'immobilisation",
          "Compétence machines de précision",
          "Traçabilité",
          "Sécurité",
          "Couverture nationale"
        ]
      }
    ],
    "prose": [
      "Notre [bureau d'études](/offres/bureau-etudes/) accompagne aussi vos évolutions : reprise d'un poste, mise en conformité d'une machine, adaptation d'une ligne à une nouvelle cadence. Le détail de la spécialité machine se trouve sur notre page [maintenance machine outil](/expertises/mecanique/machine-outil/)."
    ]
  },
  "/secteurs/agroalimentaire/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Techniciens formés aux zones et à la marche en avant**, tenues dédiées par zone, aucun croisement propre et sale.",
          "**Interventions coordonnées avec les plannings de lavage et de production.**",
          "**Lubrifiants et consommables agréés contact alimentaire**, référencés dans votre système qualité.",
          "**Inventaire d'outillage en fin d'intervention**, gestion stricte des pièces et de la visserie.",
          "**Compte rendu détaillé après chaque passage**, intégrable à votre GMAO et à vos enregistrements qualité.",
          "**Couverture complète du parc** : remplisseuses, operculeuses, convoyeurs modulaires, cuiseurs, froid industriel, palettiseurs.",
          "**Renfort dimensionné avant la haute saison**, puis ajusté à la baisse."
        ]
      }
    ],
    "prose": [
      "En appui, notre [bureau d'études](/offres/bureau-etudes/) chiffre les améliorations : mise en conformité d'une machine, reprise d'un poste goulot, automatisation d'une opération manuelle arrivée à sa limite."
    ]
  },
  "/secteurs/automobile/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Cartographie de criticité** : chaque équipement classé selon son impact sur le takt.",
          "**Préventif calé sur vos fenêtres imposées** : week-ends, pauses d'équipe, arrêts programmés.",
          "**Roboticiens ABB et Fanuc** : diagnostic, remplacement d'axes et de composants, reprise de trajectoires, sauvegardes, périphériques de cellule.",
          "**Automaticiens SIEMENS et Schneider** en appui sur la partie ligne.",
          "**Couverture complète des moyens** : lignes d'assemblage, transferts, visseuses asservies, presses et emboutissage, [machines d'usinage](/expertises/mecanique/machine-outil/), peinture et traitement de surface, utilités.",
          "**Interventions en 2x8, 3x8, nuit et week-end.**",
          "**Comptes rendus intégrables à votre GMAO, sans double saisie.**",
          "**Renforts préparés à l'avance pour les phases de transformation** : nouvelle ligne, nouveau modèle, électrification."
        ]
      },
      {
        "entetes": [
          "Attendu de la filière",
          "Réponse Migen"
        ],
        "faisons": [
          "Tenue du takt",
          "Compétence robots",
          "Travail en équipes",
          "Documentation",
          "Audits clients",
          "Coût maîtrisé"
        ]
      }
    ],
    "prose": [
      "En appui, l'ingénierie de notre [bureau d'études](/offres/bureau-etudes/) chiffre les améliorations : reprise d'un poste goulot, mise en conformité d'une machine, adaptation d'une installation à un nouveau modèle."
    ]
  },
  "/secteurs/chimie/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Formations réglementaires vérifiées avant la mission**, attestations fournies à votre responsable HSE.",
          "**Respect strict de vos circuits de permis** : demande, validation, affichage, clôture.",
          "**Travail en zone ATEX** : habilitations, matériel certifié, modes opératoires adaptés, contrôles d'atmosphère.",
          "**Machines tournantes** : pompes de procédé, agitateurs, compresseurs, ventilateurs. Alignement, garnitures, roulements, équilibrage, analyse vibratoire.",
          "**Vannes, robinetterie et instrumentation** : actionneurs, sécurités mécaniques, boucles de régulation, étalonnages selon vos référentiels.",
          "**Tuyauteries et capacités** avec notre expertise en [tuyauterie industrielle](/expertises/tuyauterie/), en lien avec vos exigences d'inspection.",
          "**Préparation d'arrêt d'unité** : équipe dimensionnée, qualifications vérifiées, tâches gammées, pièces anticipées."
        ]
      },
      {
        "entetes": [
          "Exigence du site",
          "Réponse Migen"
        ],
        "faisons": [
          "Formations réglementaires",
          "Permis de travail",
          "Zones ATEX",
          "Consignations",
          "Traçabilité",
          "Astreinte"
        ]
      }
    ],
    "prose": [
      "Pour les modifications, notre [bureau d'études](/offres/bureau-etudes/) prépare des dossiers techniques au niveau attendu par vos études de dangers et votre gestion des modifications."
    ]
  },
  "/secteurs/industrie-lourde/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Préparation type chantier** : gammes, levage, calage, pièces, outillage spécifique, coactivité écrite.",
          "**Techniciens confirmés uniquement**, déjà exposés à ce type de site.",
          "**Surveillance des usures** : jeux mesurés, vibrations, températures, historique par machine.",
          "**Fours et lignes thermiques** : brûleurs côté servitudes, ventilation, tuyauterie d'utilités, convoyage d'enfournement, portes et mécanismes.",
          "**Presses, broyeurs, concasseurs, cribles** : mécanique lourde, réglages, pièces d'usure anticipées.",
          "**Ponts roulants et levage** : translation, direction, levage, en lien avec vos vérifications réglementaires.",
          "**Hydraulique et utilités** : centrales, vérins de forte capacité, compresseurs, réseaux, avec notre page [maintenance hydraulique](/expertises/hydraulique/)."
        ]
      },
      {
        "entetes": [
          "Réalité du secteur",
          "Réponse Migen"
        ],
        "faisons": [
          "Grosses interventions",
          "Procédés continus",
          "Sécurité exigeante",
          "Usures rapides",
          "Structures et chaudronnerie",
          "Sites isolés"
        ]
      }
    ],
    "prose": [
      "Pour les travaux neufs, les modifications de structure et la chaudronnerie, notre [bureau d'études](/offres/bureau-etudes/) et notre offre [chantier](/offres/chantier/) prennent le relais, avec un seul responsable de bout en bout. La filière métal est traitée en détail sur notre page [industrie métallique](/secteurs/industrie-metallique/), et le convoyage lourd sur [maintenance convoyeur](/secteurs/logistique/maintenance-convoyeur/)."
    ]
  },
  "/secteurs/industrie-metallique/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Cartographie du parc par criticité et par état.**",
          "**Suivi d'usure mesuré** : jeux, géométrie, vibrations, températures, relevés comparés d'une visite à l'autre.",
          "**Contrôles géométriques après réparation** : niveaux, équerrages, jeux, avec les moyens de mesure adaptés.",
          "**Machines de tôlerie et de chaudronnerie** : découpe laser, poinçonneuses, plieuses, rouleuses, presses hydrauliques, cintreuses, positionneurs.",
          "**Robots et automatismes** : cellules de soudure, d'assemblage et de manipulation, avec nos roboticiens ABB et Fanuc et nos automaticiens SIEMENS et Schneider.",
          "**Nettoyage technique intégré aux gammes**, tracé comme le reste.",
          "**Utilités d'atelier** : compresseurs, aspirations centralisées, tuyauteries d'air, distribution électrique, levage.",
          "**Historique complet par machine, dans votre GMAO.**"
        ]
      }
    ],
    "prose": [
      "Notre [bureau d'études](/offres/bureau-etudes/) accompagne les modifications, de la conception au chantier : reprise d'un poste, capotage, mise en conformité d'une machine, amélioration de ligne. Le détail machine est sur notre page [maintenance machine outil](/expertises/mecanique/machine-outil/), et les équipements les plus massifs relèvent de l'[industrie lourde](/secteurs/industrie-lourde/)."
    ]
  },
  "/secteurs/logistique/maintenance-convoyeur/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Inspection en marche** : contrôle visuel et auditif, repérage des échauffements, frottements et débuts d'usure.",
          "**Relevés mesurés et comparés** : tension, alignement, état des rouleaux et des paliers, jeu des roulements, intensité moteur.",
          "**Remplacement des pièces d'usure au seuil défini**, avant la casse.",
          "**Reprise d'alignement, agrafage ou vulcanisation de jonction, remplacement de bande.**",
          "**Diagnostic électrique sur moteurs, variateurs, capteurs et chaîne de sécurité.**",
          "**Automaticiens en appui** : reprise de programme, test des entrées et sorties, sécurisation du redémarrage sur trieurs et AGV.",
          "**Traçabilité GMAO** : chaque opération alimente l'historique par équipement.",
          "**Formation courte de vos opérateurs aux vérifications de premier niveau.**"
        ]
      },
      {
        "entetes": [
          "Point de contrôle",
          "Ce que vérifie le technicien"
        ],
        "faisons": [
          "Bande",
          "Rouleaux et paliers",
          "Motoréducteur",
          "Chaîne et guides",
          "Capteurs et sécurité",
          "Structure et supports"
        ]
      }
    ],
    "prose": []
  },
  "/secteurs/logistique/peak-season/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Revue technique complète sur site à J-90**, chiffrée, équipement critique par équipement critique.",
          "**Remplacement des pièces d'usure sensibles à J-60**, réglages, constitution du stock de sécurité.",
          "**Renforts techniques briefés sur votre site à J-30**, en horaires adaptés à votre organisation.",
          "**Surveillance renforcée pendant la période** : rondes ciblées, contrôles en marche, signalements traités avant la panne.",
          "**Astreinte**, du week-end du Black Friday aux semaines de Noël, aux mêmes conditions écrites.",
          "**Un interlocuteur unique et des points quotidiens** avec votre responsable d'exploitation.",
          "**Bilan à froid écrit après la période** : ce qui a tenu, ce qui a souffert, ce qui doit changer.",
          "**Dispositif prolongé sur la vague des retours de janvier.**"
        ]
      },
      {
        "entetes": [
          "Sans préparation",
          "Avec préparation"
        ],
        "faisons": [
          "Pannes découvertes en pleine vague",
          "Pièces critiques en rupture fournisseur",
          "Technicien découvert dans l'urgence",
          "Arrêts subis en pleine cadence",
          "Urgence payée au prix fort",
          "Bilan oublié dès janvier"
        ]
      }
    ],
    "prose": []
  },
  "/secteurs/logistique/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Préventif calé sur vos heures de fonctionnement réelles**, resserré avant les pics.",
          "**Priorisation par impact sur l'expédition** : un trieur principal ne se traite pas comme une ligne de délestage.",
          "**Mesure et restitution** : disponibilité par zone, temps moyen de remise en service, récurrence par équipement, coût par colis.",
          "**Interventions en heures creuses**, tôt le matin, entre deux équipes, de nuit.",
          "**Couverture complète du site** : [convoyeurs et tri](/secteurs/logistique/maintenance-convoyeur/), transstockeurs, navettes, quais et portes rapides, pesage, froid et utilités.",
          "**Astreinte en option**, mobilisation depuis le hub de techniciens le plus proche.",
          "**Conseil de stock minimal de pièces critiques**, dimensionné sur vos historiques et les délais fournisseur."
        ]
      }
    ],
    "prose": [
      "Pour les gros travaux, montage d'une ligne, transfert d'activité, extension de site, notre offre [chantier](/offres/chantier/) prend le relais avec un chef de projet unique, de l'étude à la mise en route. Et la [peak season logistique](/secteurs/logistique/peak-season/) se prépare selon un compte à rebours dédié."
    ]
  },
  "/secteurs/menuiserie-industrielle/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Préventif minimal efficace**, souvent une visite par mois, avec le même technicien.",
          "**Remise à niveau du réseau d'aspiration** : contrôle des filtres et des débits, reprise de chaudronnerie sur les gaines.",
          "**Sciage et débit** : scies à panneaux horizontales et verticales, déligneuses, tronçonneuses. Alignements, guidages, freins de lame, protecteurs.",
          "**Usinage du bois** : centres à commande numérique, toupies, moulurières, tenonneuses. Broches, axes, changeurs d'outils, géométrie.",
          "**Placage et assemblage** : plaqueuses de chant, presses à plaquer, cadreuses, perceuses multibroches. Température, colle, pression.",
          "**Finition** : ponceuses larges bandes, cabines et lignes de vernissage, séchoirs.",
          "**Flux et manutention** : convoyeurs, retourneurs, empileurs, robots de palettisation, avec nos roboticiens.",
          "**Historique par équipement** dans un espace client accessible à votre équipe."
        ]
      },
      {
        "entetes": [
          "Point suivi",
          "Ce que vous y gagnez"
        ],
        "faisons": [
          "Qualité de coupe et d'usinage",
          "État de l'aspiration",
          "Organes de sécurité",
          "Broches et organes rapides",
          "Historique par équipement",
          "Coût de maintenance"
        ]
      }
    ],
    "prose": [
      "Pour les capotages, l'accessibilité des organes et les mises en conformité, notre [bureau d'études](/offres/bureau-etudes/) prépare chaque amélioration en dossier chiffré, réalisable sans arrêter l'atelier plus que nécessaire."
    ]
  },
  "/secteurs/nucleaire/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Un périmètre annoncé et tenu** : équipements conventionnels et utilités, hors circuit primaire, matières radioactives et cycle du combustible.",
          "**Préparation écrite avant l'accès** : dossiers d'intervention, analyses de risques, gammes.",
          "**Dossiers d'accès constitués en amont** avec votre service en charge des accès : demandes, visites de santé au travail, formations prérequises.",
          "**Utilités et fluides industriels** : air comprimé, pompage, ventilation, traitement d'eau, réseaux de tuyauterie auxiliaires.",
          "**Machines tournantes** : pompes, moteurs, compresseurs, réducteurs. Alignement, équilibrage, roulements, remise en état mécanique.",
          "**Électricité et automatismes hors sûreté** : armoires, distribution, éclairage, supervision d'utilités, capteurs, variateurs, avec les consignations exigées.",
          "**Manutention et levage** : ponts, palans, appareils de levage, en lien avec vos contrôles réglementaires.",
          "**Tuyauterie conventionnelle** avec notre expertise en [tuyauterie industrielle](/expertises/tuyauterie/), modes opératoires exigés compris."
        ]
      },
      {
        "entetes": [
          "Exigence de la filière",
          "Notre engagement"
        ],
        "faisons": [
          "Culture de sûreté",
          "Accès au site",
          "Préparation d'intervention",
          "Traçabilité",
          "Surveillance",
          "Environnement et déchets"
        ]
      }
    ],
    "prose": []
  },
  "/secteurs/pharmaceutique/": {
    "tableaux": [
      {
        "entetes": [
          "Ce que nous faisons",
          "Ce que ça change pour vous"
        ],
        "faisons": [
          "**Techniciens formés aux BPF avant la mission**, attestations fournies à vos équipes.",
          "**Cadrage écrit avec l'assurance qualité** : périmètre, procédures applicables, niveaux d'habilitation, circuit de validation, conditions d'accès.",
          "**Exécution tracée** : chaque opération suit sa gamme, chaque pièce remplacée est enregistrée, chaque écart est déclaré.",
          "**GMAO alimentée en temps réel**, au format de votre référentiel documentaire.",
          "**Requalification suivant le circuit défini avec vos équipes**, jamais improvisée.",
          "**Comportement maîtrisé en zone à atmosphère contrôlée** : habillage, flux, matériel dédié.",
          "**Couverture du parc et des utilités** : lignes de conditionnement, mélangeurs, granulateurs, comprimeuses, air comprimé, vide, eau purifiée côté distribution, HVAC en appui de vos titulaires."
        ]
      },
      {
        "entetes": [
          "Exigence du site",
          "Réponse Migen"
        ],
        "faisons": [
          "Formation BPF des intervenants",
          "Documentation des interventions",
          "Gestion des écarts",
          "Zones à atmosphère contrôlée",
          "Requalification",
          "Astreinte"
        ]
      }
    ],
    "prose": [
      "En appui, notre [bureau d'études](/offres/bureau-etudes/) conçoit les améliorations et la mise en conformité des machines, avec des dossiers techniques au niveau attendu par votre système documentaire."
    ]
  },
};
