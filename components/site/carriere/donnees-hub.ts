/**
 * ÉCART DÉCLARÉ À LA MAQUETTE, 09/10, demandé par Mehdi.
 *
 * Les sept cartes de hub de « Nos hubs et notre couverture » portaient les
 * photos d'ATELIER de la maquette (`sv-convoyeur`, `mq-…`). Elles portent
 * désormais les photos de VILLE sous licence de `public/assets/villes/`, les
 * mêmes que les cartes de l'accueil. Mesuré avant le changement : cette section
 * était à 0,7 % de divergence, c'est-à-dire conforme ; elle s'en écarte donc
 * sciemment, et ce commentaire est là pour qu'on ne le prenne pas plus tard
 * pour une dérive.
 *
 * Raison : les photos de ville ont été achetées pour nommer les hubs, et une
 * carte « Lyon » qui montre un convoyeur ne dit pas où est le hub. Les sept
 * villes de ce bloc sont exactement celles dont la licence a été prise.
 */
import type { BandeFiche, CarteFiche, HerosFiche, SectionFiche } from "@/types/metier";

/**
 * Le hub `/carriere/` (gabarit 10 « Hub de rubrique », servi par
 * `MigenCarriere.dc.html`), en donnée.
 *
 * D'OÙ VIENT CHAQUE CHAÎNE : de la capture `maquette/rendu/carriere.html`,
 * extraite du DOM rendu et copiée LITTÉRALEMENT (espaces insécables et
 * apostrophes comprises). Le texte de `maquette/contenu/site/.../carriere.md`
 * ne fait PAS foi : l'application le transforme avant de le rendre (titre
 * « Nos hubs… », table des hubs, étape « savoir-être », encart « Des
 * techniciens confirmés »). `verification-carriere.tsx` retrouve chaque
 * chaîne de ce fichier dans la capture.
 *
 * LES PHOTOS : la capture les sert en `blob:`. Elles ont été identifiées en
 * lisant les octets de chaque image de la maquette vivante (sha256), contre
 * `public/assets/web/` : identité exacte, sauf `sv-armoire` et `sv-convoyeur`,
 * que la source de `MigenCarriere` nomme ainsi et dont le fichier du dépôt est
 * la même photo en plus grand (empreinte perceptuelle 0 et 1).
 *
 * LES DÉCISIONS DE COPIE (lib/decisions-copie.ts) sont appliquées à cette
 * donnée : « 10 % des techniciens retenus », et la réponse « Où sont les
 * agences Migen ? » commence par « Notre siège est à Lyon (Écully) », forme
 * décidée de la phrase de la capture qui citait Limonest.
 */

/** Une étape, la série des « Cinq façons » à cinq, les autres à quatre. */
export interface SectionEtapesHub {
  type: "etapes";
  surtitre: string;
  titre: string;
  intros?: string[];
  etapes: CarteFiche[];
  /** Le bandeau sombre « 10 % » du processus : copie fixe de la maquette. */
  entonnoir?: boolean;
  bande?: BandeFiche;
}

export interface MetierRecrute {
  titre: string;
  texte: string;
  href: string;
  photo: string;
}

export interface HubCarriere {
  nom: string;
  zone: string;
  href: string;
  photo: string;
  siege?: boolean;
}

export type SectionHub =
  | Extract<
      SectionFiche,
      { type: "chiffres" | "bento" | "encart" | "duo" | "liste" | "faq" | "postuler" }
    >
  | SectionEtapesHub
  | {
      type: "metiers";
      surtitre: string;
      titre: string;
      intro: string;
      metiers: MetierRecrute[];
      suite?: string[];
    }
  | { type: "refus"; surtitre: string; titre: string; intros?: string[]; refus: CarteFiche[] }
  | { type: "hubs"; surtitre: string; titre: string; intro: string; hubs: HubCarriere[] }
  | {
      type: "avis";
      surtitre: string;
      titre: string;
      intro: string;
      avis: { texte: string; libelle: string }[];
      fin?: string;
    }
  | { type: "liens"; items: { libelle: string; href: string; photo: string }[] };

export interface ContenuHubCarriere {
  titre: string;
  heros: HerosFiche & { photo: { src: string; alt: string } };
  sections: SectionHub[];
}

export const HUB_CARRIERE: ContenuHubCarriere = {
  "titre": "Migen recrutement",
  "heros": {
    "pastille": "Carrière",
    "chapeau": "Technicien de terrain, l'usine tourne grâce à vous, mais votre employeur vous traite comme une ligne sur un planning. Le recrutement chez [Migen](/) part de l'inverse : le savoir-faire d'abord, la personne ensuite.",
    "paragraphes": [
      "Cette page présente les façons de travailler chez nous, nos postes et notre processus de recrutement. Migen est une entreprise de maintenance industrielle créée en 2021 par Nathan Jorez.",
      "Migen recrutement, ce n'est pas un formulaire anonyme. C'est un échange avec des gens qui connaissent votre travail, partout en France."
    ],
    "chiffre": {
      "valeur": "10 %",
      "texte": "des techniciens retenus, après un test technique et un entretien"
    },
    "photo": {
      "src": "/assets/web/mq-e6322efcd358.jpg",
      "alt": "Technicien migen en intervention"
    }
  },
  "sections": [
    {
      "type": "chiffres",
      "items": [
        {
          "valeur": "+100",
          "texte": "collaborateurs, techniciens salariés de Migen"
        },
        {
          "valeur": "10 %",
          "texte": "des techniciens retenus après évaluation"
        },
        {
          "valeur": "4 agences",
          "texte": "et des hubs de techniciens partout en France"
        },
        {
          "valeur": "CDI",
          "texte": "alternance et stage, à tous les niveaux"
        }
      ]
    },
    {
      "surtitre": "01 · Pourquoi nous",
      "titre": "Migen recrutement : pourquoi nous rejoindre",
      "type": "bento",
      "intros": [
        "Le quotidien d'un technicien de maintenance mal accompagné, on le connaît : la même panne qui revient, l'astreinte qui sonne seul, l'évolution qui n'arrive jamais. Nous avons bâti l'inverse.",
        "Voici ce qui change quand vous nous rejoignez."
      ],
      "cartes": [
        {
          "titre": "Un savoir-faire reconnu",
          "texte": "Votre expertise technique est évaluée, valorisée et payée à sa valeur, pas noyée dans une grille."
        },
        {
          "titre": "De la diversité",
          "texte": "Dépannage, préventif, mise en service, rétrofit, chez des clients de tous secteurs de l'industrie."
        },
        {
          "titre": "Une vraie évolution",
          "texte": "De technicien à chef d'équipe, puis responsable, chacun trace son parcours."
        },
        {
          "titre": "Un collectif",
          "texte": "Plus de 120 techniciens, l'entraide entre techniciens, jamais seul face à une machine."
        },
        {
          "titre": "La sécurité",
          "texte": "Habilitations vérifiées, outillage fourni, un référent dès le premier jour."
        }
      ]
    },
    {
      "surtitre": "02 · Nos formats",
      "titre": "Cinq façons de travailler chez Migen",
      "type": "etapes",
      "intros": [
        "Un même travail, plusieurs façons de l'exercer. Selon votre profil et votre mobilité, voici comment travailler avec nous."
      ],
      "etapes": [
        {
          "titre": "En résidence sur un site",
          "texte": "Intégré chez un client, sur une ligne de production, avec la stabilité d'un poste fixe."
        },
        {
          "titre": "En itinérance",
          "texte": "Plusieurs sites, plusieurs secteurs, pour ceux qui aiment le changement et la route."
        },
        {
          "titre": "En alternance",
          "texte": "Se former en entreprise, un diplôme à la clé, via l'alternance maintenance industrielle."
        },
        {
          "titre": "En mission longue",
          "texte": "Un CDI Migen, un engagement de service durable auprès d'un client industriel."
        },
        {
          "titre": "En expertise pointue",
          "texte": "Automatisme, robotique, hydraulique, pour les profils très qualifiés d'un domaine."
        }
      ],
      "bande": {
        "texte": "Dites-nous votre situation, on vous met sur la bonne voie. Résidence, itinérance ou alternance : le choix se décide ensemble, selon votre projet."
      }
    },
    {
      "type": "metiers",
      "surtitre": "03 · Métiers",
      "titre": "Les métiers que nous recrutons",
      "intro": "L'industrie manque de bras qualifiés, et Migen recrute en continu sur toute la filière maintenance. Voici les métiers les plus demandés.",
      "metiers": [
        {
          "titre": "Technicien de maintenance",
          "texte": "Polyvalence électrique, mécanique, méthode",
          "href": "/carriere/technicien-de-maintenance/",
          "photo": "/assets/web/faq-offre.jpg"
        },
        {
          "titre": "Électromécanicien",
          "texte": "Double compétence électrique et mécanique",
          "href": "/carriere/electromecanicien/",
          "photo": "/assets/web/mq-056f3c250981.jpg"
        },
        {
          "titre": "Automaticien",
          "texte": "Programmation d'automates SIEMENS, Schneider",
          "href": "/carriere/automaticien/",
          "photo": "/assets/web/sv-armoire.jpg"
        },
        {
          "titre": "Roboticien",
          "texte": "Cellules automatisées, robots ABB, Fanuc",
          "href": "/carriere/roboticien/",
          "photo": "/assets/web/x-robotique.jpg"
        },
        {
          "titre": "Électricien industriel",
          "texte": "Armoires, réseaux, dépannage sur site",
          "href": "/carriere/",
          "photo": "/assets/web/mq-2d11362f7867.jpg"
        }
      ],
      "suite": [
        "Chaque nouvelle offre d'emploi technicien de maintenance vise un besoin réel chez un client, pas un stock de CV. Un emploi chez Migen a un sens et un site précis. En ce qui concerne les débuts, un stage ou une alternance ouvre la voie ; pour les confirmés, un emploi stable en CDI."
      ]
    },
    {
      "surtitre": "04 · Métiers",
      "titre": "Des techniciens confirmés, prêts pour le terrain",
      "type": "encart",
      "textes": [
        "Nous recrutons des techniciens qui ont déjà fait leurs preuves sur des sites industriels. Chaque technicien passe un entretien technique et comportemental : seuls 10 % sont retenus."
      ]
    },
    {
      "surtitre": "05 · Recrutement",
      "titre": "Notre processus de recrutement",
      "type": "etapes",
      "intros": [
        "Ici, personne n'est proposé à un client sans avoir prouvé son niveau. Notre exigence protège nos techniciens autant que nos clients."
      ],
      "etapes": [
        {
          "titre": "Un premier échange",
          "texte": "Vous décrivez votre parcours, vos compétences, vos disponibilités, en direct."
        },
        {
          "titre": "Un test technique",
          "texte": "Mené par un professionnel du terrain, pour vérifier la maîtrise réelle."
        },
        {
          "titre": "Un entretien de savoir-être",
          "texte": "Nous parlons avec vous de sécurité, de rigueur et de travail en équipe, car sur un site industriel la façon de travailler compte autant que la technique."
        },
        {
          "titre": "La proposition",
          "texte": "Un poste, un client, une feuille de route claire, avec un salaire annoncé sans détour."
        }
      ],
      "bande": {
        "texte": "Notre sélection est exigeante et assumée : seuls 10 % des techniciens sont retenus, une exigence qui protège les meilleurs. Les résultats des entretiens sont partagés, une transparence rare dans le secteur."
      },
      "entonnoir": true
    },
    {
      "surtitre": "06 · Engagements",
      "titre": "Nos engagements employeur",
      "type": "duo",
      "intros": [
        "Un bon recrutement ne s'arrête pas à la signature. Voici ce que Migen s'engage à tenir, chaque semaine, pour ses équipes."
      ],
      "cartes": [
        {
          "titre": "Un référent dédié",
          "texte": "Un contact humain qui vous suit, pas un numéro de dossier aux ressources humaines."
        },
        {
          "titre": "Un salaire clair",
          "texte": "Une rémunération annoncée en brut, sans coefficient caché ni surprise."
        },
        {
          "titre": "Une montée en compétence",
          "texte": "Formation, spécialisation, évolution vers un poste à responsabilité."
        },
        {
          "titre": "La reconnaissance",
          "texte": "Votre expertise nourrit notre réussite, et nous le disons aux clients."
        }
      ]
    },
    {
      "surtitre": "07 · Nos refus",
      "titre": "Ce que nous ne faisons pas",
      "type": "refus",
      "intros": [
        "La transparence, c'est aussi dire ce que nous refusons. Migen n'est pas une entreprise comme les autres du secteur."
      ],
      "refus": [
        {
          "titre": "Pas de profil envoyé à l'aveugle",
          "texte": "Chaque technicien est évalué avant d'être proposé, jamais l'inverse."
        },
        {
          "titre": "Pas de coefficient caché",
          "texte": "Le client connaît nos exigences, vous connaissez votre salaire."
        },
        {
          "titre": "Pas de personne différente à chaque visite",
          "texte": "La continuité fait la qualité d'une intervention."
        },
        {
          "titre": "Pas de promesse de délai en l'air",
          "texte": "Nous nous engageons sur la compétence, pas sur un chrono marketing."
        }
      ]
    },
    {
      "type": "hubs",
      "surtitre": "08 · Implantations",
      "titre": "Nos hubs et notre couverture",
      "intro": "Migen intervient partout en France grâce à ses hubs : des équipes de techniciens qualifiés installées dans les grandes villes, au plus près des sites industriels. Sur site, en intervention, sur chantier ou en rétrofit, nous sommes présents.",
      "hubs": [
        {
          "nom": "Lyon",
          "zone": "Grenoble, Saint-Étienne, Valence, Haute-Savoie",
          "href": "/implantations/lyon/",
          "siege": true,
          "photo": "/assets/villes/hub-lyon.jpg"
        },
        {
          "nom": "Paris",
          "zone": "Essonne, Rouen, Île-de-France",
          "href": "/implantations/paris/",
          "photo": "/assets/villes/hub-paris.jpg"
        },
        {
          "nom": "Lille",
          "zone": "Hauts-de-France",
          "href": "/implantations/lille/",
          "photo": "/assets/villes/hub-lille.jpg"
        },
        {
          "nom": "Marseille",
          "zone": "Toulon, Nîmes, Perpignan",
          "href": "/implantations/marseille/",
          "photo": "/assets/villes/hub-marseille.jpg"
        },
        {
          "nom": "Strasbourg",
          "zone": "Alsace, Mulhouse",
          "href": "/implantations/strasbourg/",
          "photo": "/assets/villes/hub-strasbourg.jpg"
        },
        {
          "nom": "Nantes",
          "zone": "Loire-Atlantique, Rennes, Brest",
          "href": "/implantations/nantes/",
          "photo": "/assets/villes/hub-nantes.jpg"
        },
        {
          "nom": "Toulouse",
          "zone": "Haute-Garonne, Bordeaux, Gironde, Charente",
          "href": "/implantations/toulouse/",
          "photo": "/assets/villes/hub-toulouse.jpg"
        }
      ]
    },
    {
      "type": "avis",
      "surtitre": "09 · Avis",
      "titre": "Des avis qui parlent du terrain",
      "intro": "Avant de postuler, beaucoup consultent les avis en ligne. C'est sain : un avis sincère vaut mieux qu'une promesse. Les avis de nos techniciens disent la même chose, et cet avis se vérifie sur le terrain.",
      "avis": [
        {
          "texte": "Un employeur qui tient parole, un salaire clair, une vraie reconnaissance de l'effort.",
          "libelle": "Avis récurrent"
        },
        {
          "texte": "Un référent joignable, pas un service anonyme aux ressources humaines.",
          "libelle": "Avis sur l'accompagnement"
        },
        {
          "texte": "De la diversité, des sites intéressants, une exigence d'excellence technique.",
          "libelle": "Avis sur les missions"
        },
        {
          "texte": "Des parcours qui montent, une entreprise en croissance qui fait de la place aux talents.",
          "libelle": "Avis sur l'évolution"
        },
        {
          "texte": "Un collectif au cœur de l'équipe, où l'entraide n'est pas un slogan.",
          "libelle": "Avis sur l'ambiance"
        }
      ],
      "fin": "Cette réputation d'employeur, ces avis, nous les construisons technicien après technicien. Le meilleur avis reste celui d'un collègue déjà en poste : c'est cet avis, en ce qui nous concerne, qui compte le plus. Notre excellence technique tient au cœur de nos équipes, et la réussite de chacun nourrit celle du collectif. Consultez les avis, comparez, puis venez juger sur pièce : l'excellence se mesure au cœur du terrain, jamais à un avis anonyme."
    },
    {
      "surtitre": "10 · Au quotidien",
      "titre": "La vie chez Migen au quotidien",
      "type": "duo",
      "intros": [
        "Rejoindre une entreprise, c'est aussi un environnement de travail et un état d'esprit. Voici ce que vivent nos équipes, au-delà de l'offre d'emploi.",
        "Migen recrute parce que Migen grandit. Chaque semaine, de nouveaux emplois s'ouvrent, en CDI, en stage ou en alternance. Nous pouvons proposer un emploi qui colle à votre projet, pas l'inverse, selon vos disponibilités. Cette carrière se construit avec vous ; le meilleur employeur est celui qui vous fait progresser, et nous pouvons le prouver."
      ],
      "cartes": [
        {
          "titre": "De l'autonomie",
          "texte": "On vous fait confiance sur le terrain, avec le soutien d'un référent quand vous en avez besoin."
        },
        {
          "titre": "Des défis techniques",
          "texte": "Maintenance préventive, dépannage, travaux neufs et travaux de mise en service sur des parcs de machines variés, en atelier comme sur chantier."
        },
        {
          "titre": "Un collectif humain",
          "texte": "L'entraide entre experts, le partage des données de terrain, une communication directe."
        },
        {
          "titre": "Une entreprise en croissance",
          "texte": "De nouveaux clients, de nouveaux postes, une place réelle pour les talents."
        }
      ]
    },
    {
      "surtitre": "11 · Au quotidien",
      "titre": "Postes ouverts et candidature spontanée",
      "type": "etapes",
      "intros": [
        "Vous ne voyez pas l'offre qui vous correspond ? La candidature spontanée fonctionne. Un emploi de technicien de maintenance ne dépend pas d'une annonce publiée un jour précis."
      ],
      "etapes": [
        {
          "titre": "Consulter les offres",
          "texte": "Voir les emplois ouverts par filière et par région, aux conditions affichées."
        },
        {
          "titre": "Créer votre profil",
          "texte": "Renseigner vos compétences, être disponible sous quelques semaines, préciser votre mobilité nationale."
        },
        {
          "titre": "Nous contacter",
          "texte": "Par le formulaire ou par téléphone, un contact humain vous répond."
        },
        {
          "titre": "Suivre votre candidature",
          "texte": "Une réponse franche, rapide, sans vous laisser sans nouvelles pendant des mois."
        }
      ],
      "bande": {
        "texte": "Chez nous, un candidat qualifié n'attend pas. La réussite d'un recrutement tient au cœur de notre activité : les bonnes personnes aux bons postes."
      }
    },
    {
      "surtitre": "12 · Au quotidien",
      "titre": "Nos informations pratiques",
      "type": "liste",
      "intros": [
        "Un dernier mot, en ce qui concerne la transparence. Au sujet de vos données : notre politique de confidentialité et nos mentions légales encadrent leur utilisation ; rien n'est partagé sans votre accord. La page d'accueil renvoie vers ces informations légales et ces mentions, sans délai."
      ],
      "cartes": [
        {
          "titre": "Contact direct",
          "texte": "04 78 33 72 05, du lundi au vendredi, 8h00 à 18h30."
        },
        {
          "titre": "Siège",
          "texte": "Chemin du Moulin Carron, bâtiment principal, 69130 Écully, près de Lyon."
        },
        {
          "titre": "Couverture",
          "texte": "Nationale, avec quatre agences et des interventions partout en France, pilotées depuis Écully."
        },
        {
          "titre": "Un parcours optimisé",
          "texte": "De la candidature à l'intégration, un process clair, une politique de recrutement transparente et des conditions générales sans piège."
        },
        {
          "titre": "Développement",
          "texte": "Une entreprise partenaire de votre carrière et de votre développement, pas d'un simple contrat. Voir grandir sa carrière chez le même employeur, c'est rare ; nous pouvons vous l'offrir sans délai d'attente inutile, y compris sur des travaux exigeants."
        },
        {
          "titre": "Un retour rapide",
          "texte": "Nos recruteurs répondent, en pratique, sous quelques jours ; un recruteur reste joignable tout au long."
        },
        {
          "titre": "Sur le marché",
          "texte": "Un poste de technicien de maintenance industrielle chez un employeur qui recrute vraiment, ce que le marché offre rarement."
        }
      ]
    },
    {
      "surtitre": "13 · Candidature",
      "titre": "Postuler chez Migen",
      "type": "etapes",
      "intros": [
        "Prêt à changer d'employeur sans changer de travail ? La candidature est directe, sans dossier interminable."
      ],
      "etapes": [
        {
          "titre": "Décrivez votre profil",
          "texte": "Poste visé, compétences, habilitations, disponibilités et mobilité."
        },
        {
          "titre": "Choisissez votre voie",
          "texte": "Résidence, itinérance, alternance ou mission longue."
        },
        {
          "titre": "Échangez avec nous",
          "texte": "Un test technique, un entretien, une réponse rapide et franche."
        },
        {
          "titre": "Rejoignez l'équipe",
          "texte": "Un référent vous accompagne dès le premier jour sur le site."
        }
      ],
      "bande": {
        "texte": "Envie de nous rejoindre ? Décrivez votre situation, on vous dit vite si nous avons le poste, et lequel."
      }
    },
    {
      "surtitre": "14 · Questions",
      "titre": "Questions fréquentes",
      "type": "faq",
      "intros": [
        "Quelques questions reviennent souvent. Voici nos réponses, sans langue de bois : chaque question mérite une réponse claire."
      ],
      "questions": [
        {
          "question": "Comment postuler chez Migen ?",
          "reponse": "Décrivez votre profil et vos disponibilités, puis échangez avec un chargé d'affaires. Un test technique et un entretien comportemental suivent. Vous pouvez aussi appeler directement par téléphone, du lundi au vendredi."
        },
        {
          "question": "Quels métiers Migen recrute-t-elle ?",
          "reponse": "Technicien de maintenance, électromécanicien, automaticien, roboticien et électricien industriel, à tous les niveaux. Migen recrute en continu, en CDI, en alternance et en stage, partout en France."
        },
        {
          "question": "Migen propose-t-elle de l'alternance ?",
          "reponse": "Oui. L'alternance permet de se former en entreprise avec un diplôme à la clé. Le détail se trouve sur la page dédiée à l'alternance en maintenance industrielle."
        },
        {
          "question": "Comment se passe le recrutement chez Migen ?",
          "reponse": "Un échange, un entretien technique mené par un professionnel du terrain, puis un entretien comportemental. Seuls 10 % des techniciens sont retenus, et les résultats sont partagés en toute transparence."
        },
        {
          "question": "Quel salaire propose Migen ?",
          "reponse": "Une rémunération annoncée en brut, sans coefficient caché, selon votre expérience, votre poste et la région. Nous situons le montant pendant l'entretien, jamais sur une grille anonyme."
        },
        {
          "question": "Où sont les agences Migen ?",
          "reponse": "Notre siège est à Lyon (Écully), et nos hubs de techniciens couvrent les grandes villes de France. Cette couverture nationale nous permet de recruter et d'intervenir partout dans le pays."
        }
      ]
    },
    {
      "type": "postuler"
    },
    {
      "type": "liens",
      "items": [
        {
          "libelle": "Alternance maintenance industrielle",
          "href": "/carriere/alternance/",
          "photo": "/assets/web/mq-17e2f3bce95f.jpg"
        }
      ]
    }
  ]
};
