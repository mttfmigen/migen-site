/**
 * LE TEXTE ET LES PHOTOS QUE SEULE LA MAQUETTE MOBILE V2 REND, PAR PAGE.
 *
 * La maquette mobile (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`,
 * « dc.html ») ne lit pas le contenu de bureau : elle lit le corpus
 * (`maquette/contenu/site/Offres/<page>.md`) et en fabrique ses cartes. Les
 * chaînes ci-dessous en sont RELEVÉES MOT POUR MOT, rien n'est rédigé ici ;
 * l'appelant les passe par `appliqueDecisions` (les décisions de copie de
 * Mehdi valent aussi au téléphone). Tout ce qui en sort est rendu sous 881 px
 * seulement ; une page absente de la table ne change pas.
 *
 * MODULE NEUTRE (ni « use client » ni « server-only ») : voir
 * `components/site/mobile/conversion-donnees.ts`.
 */

import type { ProblemeMobile } from "./ProblemeOffre";

export interface PointMobile {
  titre: string;
  texte: string;
}

export interface OffreMobile {
  /** dc.html L224 `IMG[u]` (sinon L225 `FIMG`) : la photo de tête de la maquette. */
  photoTete?: string;
  /** dc.html `KICK` : le sur-titre de la maquette, à la place de la pastille. */
  surtitre?: string;
  /** La fin du chapô du corpus, absente du chapô de bureau. */
  chapeauSuite?: string;
  /** Le chapô du corpus, quand il diffère de celui de bureau. */
  chapeau?: string;
  /** La phrase en gras qui suit le chapô dans le corpus (dc.html `allB`). */
  accroche?: string;
  /** La mention des horaires du corpus, `**gras**` compris. */
  mention?: string;
  /** Le corps de la carte « 01 » de `/offres/full-service/` (dc.html `isKv`). */
  couverture?: { tete: string; suite: string; points: PointMobile[]; cloture: string };
  /**
   * dc.html `teaseOf` : le résumé des cartes repliées, quand la règle commune
   * (`blocs/resume-de-section.ts`, `accrocheDe`) ne le trouve pas dans nos
   * données. `null` : aucun résumé. Les entrées relevées sur la v2 que la V3
   * contredit (« L'offre » et « Le déroulé » sans accroche, ou annoncés par
   * une phrase d'après tableau) sont retirées le 16/10 : la règle commune
   * donne désormais l'accroche de la V3.
   */
  resumes?: {
    partage?: string;
    offre?: string;
    deroule?: string | null;
    garanties?: string;
  };
  /** L'encart sous le rail des références (dc.html `isQ`). */
  encartReferences?: { texte: string; lien: string; href: string };
  /** La section « ## CTA » du corpus, carte sombre après la FAQ (dc.html L475). */
  carteFinale?: { surtitre: string; bouton: string; rappel: string };
}

export const OFFRES_MOBILE: Readonly<Record<string, OffreMobile>> = {
  "/offres/": {
    photoTete: "/assets/web/team-electric.jpg",
    surtitre: "Rubrique",
    chapeau:
      "Plusieurs façons de nous confier vos machines, du dépannage d'urgence au technicien présent chaque jour dans vos murs. Les mêmes techniciens évalués dans tous les cas, et le même rapport après chaque passage.",
    mention:
      "Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à 18h30. Astreinte en dehors.",
  },
  "/secteurs/": {
    photoTete: "/assets/web/x-auto-ligne.jpg",
    mention:
      "Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à 18h30. Astreinte en option.",
  },
  "/offres/residence/": {
    photoTete: "/assets/web/team-duo.jpg",
  },
  "/offres/full-service/": {
    photoTete: "/assets/web/sv-duo-impact.jpg",
    chapeauSuite:
      "Résultat : moins d'arrêts subis, un budget décidé à l'avance, et votre production qui tourne.",
    couverture: {
      tete: "Migen devient votre service maintenance, sans que vous perdiez la main.",
      suite:
        "Nous reprenons tout ce que votre équipe ne peut plus absorber, sur un périmètre écrit ensemble.",
      points: [
        {
          titre: "Le préventif, enfin tenu",
          texte: "gammes par organe, fréquences respectées, pièces d'usure anticipées.",
        },
        {
          titre: "Le dépannage, traité à la racine",
          texte: "pannes prises en priorité et résolues jusqu'à la cause.",
        },
        {
          titre: "Le prédictif sur vos organes critiques",
          texte: "relevés et mesures pour remplacer avant la casse.",
        },
        {
          titre: "L'amélioration continue",
          texte:
            "les travaux qui suppriment une panne récurrente au lieu de la réparer chaque mois.",
        },
      ],
      cloture:
        "Un seul contrat couvre la mécanique, l'électricité, l'automatisme, l'hydraulique et la pneumatique. Vous n'avez plus trois prestataires à coordonner.",
    },
    resumes: {
      partage:
        "Vous gardez les décisions : criticité des lignes, priorités, investissements. Nous éclairons, vous…",
    },
    carteFinale: {
      surtitre: "Passer à l’action",
      bouton: "Faire chiffrer ma maintenance",
      rappel: "Ou appelez le 04 78 33 72 05, rappel dans l'heure aux horaires ouvrés.",
    },
  },
  "/offres/bureau-etudes/": {
    chapeau:
      "Nos ingénieurs conçoivent aux côtés de techniciens qui réparent des machines toute l'année. Cadrage, CAO, calculs, dossier de fabrication, puis montage et mise en service par les mêmes équipes.",
    accroche: "Un projet en attente faute de temps pour le dessiner ?",
    mention:
      "**Nous vous rappelons dans l'heure**, du lundi au vendredi de 8h00 à 18h30. Astreinte pour les urgences en cours de réalisation.",
    resumes: {
      garanties:
        "Un rappel dans l'heure du lundi au vendredi, 8h00 à 18h30, au 04 78 33 72 05, et une astreinte…",
    },
    encartReferences: {
      texte: "Toutes nos réalisations documentées :",
      lien: "Preuves : nos réalisations",
      href: "/preuves/",
    },
  },
};

/* ------------------------------------- maquette V3 « Site mobile » (16/10)

   DEUX TABLES À PART, et non deux champs de `OffreMobile` : une entrée dans
   `OFFRES_MOBILE` a des effets de bord (les photos du rail des références,
   `photosMaquette`), qu'aucune de ces pages ne doit recevoir avec son texte.
   Mots du corpus que la V3 rend (`maquette/contenu/site/Offres/<page>.md`),
   relevés mot pour mot et passés au filtre des règles : rien n'est rédigé ici.
   Rendus sous 881 px seulement ; une page absente ne change pas. */

/**
 * LE TEXTE DU PROBLÈME QUE LA MAQUETTE MOBILE REND ET QUE LE BUREAU NE REND
 * PAS : la phrase clé, les paragraphes qui précèdent les puces (`### ` : un
 * intertitre ; `> ` : un encart) et ceux qui les suivent. `/offres/bureau-etudes/` vient de la
 * v2 ; les pages des travaux industriels, de la V3, dont la fiche de bureau
 * n'a pas de phrase clé.
 */
export const PROBLEMES_MOBILE: Readonly<Record<string, ProblemeMobile>> = {
  "/offres/bureau-etudes/": {
    titre: "Un plan dessiné loin de l'atelier finit toujours par se payer au montage.",
    avant: [
      "**Le constat.** Le projet est clair dans votre tête. Personne en interne n'a le temps de le dessiner.",
    ],
    apres: [
      "**Le coût de l'inaction.** Embaucher un ingénieur ou un projeteur pour un seul projet n'a pas de sens économique. Alors le projet glisse, ou il part au montage avec des plans que personne n'a confrontés au terrain.",
      "**La réponse.** Une équipe d'études disponible au bon moment, qui voit ensuite ses conceptions tourner, vieillir et tomber en panne.",
    ],
  },
  "/travaux-industriels/": {
    titre: "Un chantier industriel se joue rarement sur la technique. Il se joue sur qui tient le planning.",
    avant: [
      "Déplacer une ligne, vider un atelier ou monter un équipement neuf n'arrive qu'une fois tous les cinq ou dix ans. Le savoir-faire n'existe presque jamais en interne.",
      "Ce qui arrive quand personne ne pilote :",
    ],
    apres: ["Un transporteur dépose au pied du camion. Il ne rebranche pas un automatisme."],
  },
  "/travaux-industriels/demantelement-industriel/": {
    titre: "Un démantèlement mal fait se paie deux fois : à l'enlèvement, puis à la remise des clés.",
    avant: [
      "La zone est vide, mais le bailleur relève des réserves. Les réseaux ont été coupés sans plan. Personne ne sait ce qui est parti en benne ni sous quel bordereau.",
      "Ce qui dérape le plus souvent :",
    ],
  },
  "/travaux-industriels/montage-industriel/": {
    titre: "Une machine livrée n'est pas une machine qui produit.",
    avant: [
      "Entre la palette au quai et le premier bon produit, il y a des semaines de montage que personne n'avait mises au planning. Pendant ce temps, votre équipe interne est déjà saturée.",
      "Ce qui bloque, dans l'ordre :",
    ],
  },
  "/travaux-industriels/transfert-industriel/": {
    titre: "Un transfert improvisé, ce sont des semaines d'arrêt que personne n'avait budgétées.",
    avant: [
      "Déplacer une ligne n'arrive qu'une ou deux fois dans la vie d'une équipe. Le savoir-faire n'existe donc presque jamais en interne.",
      "### Ce que coûte l'improvisation, dans l'ordre où ça arrive",
    ],
    apres: [
      "### Le vrai piège : croire que c'est un problème de transport",
      "Un transporteur dépose la machine au pied du camion et repart. Un déménageur généraliste sait transporter des caisses.",
      "Ni l'un ni l'autre ne consigne une armoire, ne sauvegarde un programme, ne réaligne un convoyeur ni ne rebranche un automatisme. Le transport représente une fraction du chantier. Le reste, c'est de la maintenance.",
    ],
  },
  "/entreprise-maintenance-industrielle/": {
    avant: [
      "Ce qui vous coûte cher n'est presque jamais la pièce. C'est le temps perdu entre l'arrêt et le bon geste.",
    ],
    apres: [
      "> Le vrai coût d'un mauvais choix ne se lit pas sur le devis. Il se lit sur le compteur de production.",
    ],
  },
  "/travaux-industriels/levage-manutention/": {
    titre: "Une machine s'abîme rarement en tournant. Elle s'abîme en bougeant.",
    avant: [
      "Le bâti qui se vrille, le carter qui prend appui au mauvais endroit, l'arbre qui se désaligne. Rien ne se voit sans attendre. Tout se voit au redémarrage.",
      "Ce qui fait rater une manutention lourde :",
    ],
  },
};

/**
 * LES TITRES DE CARTE PROPRES À UNE PAGE DANS LA V3 : le corpus y donne à
 * chaque section un second titre (« ## Le problème » puis « ## Se tromper de
 * prestataire… »), que la V3 rend en titre de carte, le nom du bloc en
 * sur-titre. Les trois du milieu sont aussi l'intitulé de tête des
 * compléments de bureau, qui ne le répètent donc pas dans la carte.
 */
export interface TitresCartes {
  probleme?: string;
  offre?: string;
  deroule?: string;
  garanties?: string;
  references?: string;
}

export const TITRES_CARTES_MOBILE: Readonly<Record<string, TitresCartes>> = {
  "/entreprise-maintenance-industrielle/": {
    probleme: "Se tromper de prestataire coûte plus cher que la panne",
    offre: "Six façons de nous confier vos machines",
    deroule: "Ce qui se passe après votre appel",
    garanties: "Trois engagements écrits au contrat",
    references: "Des sites qui tournent avec nous",
  },
};

/**
 * LA FIN DE LA CARTE « CE QUE NOUS GARANTISSONS » DE LA V3 : la question de
 * l'appel « 07 » (`brefBande`), puis l'appel que le corpus écrit sous les
 * garanties. Trois dessins, ceux de la V3 : le bouton orange à pastille
 * flèche (`bouton`, libellé et cible de `brefBouton`), l'encart orangé
 * (`encart`), ou une simple phrase avec son lien (`textes`). Une page absente
 * de la table reçoit la question et le bouton, ses propres mots.
 *
 * FILTRÉ : sur `/offres/zero-arret/`, la V3 écrit ensuite « Votre code
 * postal, une réponse écrite sous 48h. », un délai chiffré que le contrat
 * interdit. La phrase est retirée, pas réécrite.
 */
export interface FinGaranties {
  bouton?: boolean;
  /** Markdown en ligne. */
  encart?: string;
  /** Markdown en ligne, un paragraphe par entrée. */
  textes?: readonly string[];
}

const RAPPEL_HORAIRES =
  "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.";
const RAPPEL_VISITE =
  "Un chargé d'affaires vous rappelle dans l'heure, avec les bonnes questions et une date de visite.";
const HORAIRES_ASTREINTE = "· 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, astreinte.";

export const FIN_GARANTIES_PAR_DEFAUT: FinGaranties = { bouton: true };

export const FINS_GARANTIES: Readonly<Record<string, FinGaranties>> = {
  "/offres/": { bouton: true, textes: [RAPPEL_HORAIRES] },
  "/offres/residence/": { bouton: true, textes: [RAPPEL_HORAIRES] },
  "/offres/full-service/": { bouton: true, textes: [RAPPEL_HORAIRES] },
  "/offres/arret-technique/": { bouton: true, textes: [RAPPEL_HORAIRES] },
  "/offres/zero-arret/": { bouton: true, textes: ["Ou appelez le 04 78 33 72 05."] },
  "/offres/bureau-etudes/": {
    encart: "[Faire chiffrer mon étude](/contact/) · 04 78 33 72 05, rappel dans l'heure",
    textes: [
      "Le devis décrit le périmètre, les livrables, les jalons et le budget. Un seul échange suffit pour savoir où vous allez.",
    ],
  },
  "/entreprise-maintenance-industrielle/": {
    bouton: true,
    textes: [
      "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30. Nous vous rappelons dans l'heure. En dehors, l'astreinte prend le relais.",
    ],
  },
  "/travaux-industriels/": {
    textes: [`[Faire chiffrer mes travaux](/contact/) ${HORAIRES_ASTREINTE}`, RAPPEL_VISITE],
  },
  "/travaux-industriels/demantelement-industriel/": {
    textes: [`[Faire chiffrer mon démantèlement](/contact/) ${HORAIRES_ASTREINTE}`, RAPPEL_VISITE],
  },
  "/travaux-industriels/montage-industriel/": {
    textes: [`[Faire chiffrer mon montage](/contact/) ${HORAIRES_ASTREINTE}`, RAPPEL_VISITE],
  },
  "/travaux-industriels/transfert-industriel/": {
    textes: [`[Faire chiffrer mon transfert](/contact/) ${HORAIRES_ASTREINTE}`, RAPPEL_VISITE],
  },
  "/travaux-industriels/levage-manutention/": {
    textes: [`[Faire chiffrer mon levage](/contact/) ${HORAIRES_ASTREINTE}`, RAPPEL_VISITE],
  },
};

/* ------------------------------------------- la photo d'une étude de cas */

/** dc.html L229 `POOL` : les photos que la maquette tire pour une étude de cas. */
const POOL: Readonly<Record<string, readonly string[]>> = {
  logi: ["x-logistique-convoyeurs", "x-logistique-entrepot", "x-logistique-cariste", "x-logistique-tablette", "x-logistique-discussion"],
  auto: ["x-auto-ligne", "x-auto-caisse", "x-auto-mecanicienne", "x-auto-portrait"],
  agro: ["sv-convoyeur", "ph-technicien", "sv-armoire"],
  ind: ["team-grind-sparks", "x-soudure", "team-grind-impact", "x-cimenterie", "ph-tuyaux", "x-elec-disjoncteur", "team-grind-front"],
};

/** dc.html L416 `hsh`. */
function empreinte(texte: string): number {
  let h = 0;
  for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) >>> 0;
  return h;
}

/** dc.html L417 `SECT`. */
function familleDuCas(q: string): string {
  if (/amazon|aktid|gls|veepee|eriks|alstef|savoye|dimomaint|ciuch|atena/.test(q)) return "logi";
  if (/stellantis|valeo|autoliv|jtekt|motherson|voit|vignal|bamesa/.test(q)) return "auto";
  if (/danone|mccain|jacquet|panetiere|salaison|bledina/.test(q)) return "agro";
  return "ind";
}

/**
 * dc.html L418 `casePhoto` et L392 : la photo d'une carte du rail des
 * références, tirée de `slug + " " + client`, le client étant lu dans le
 * libellé « Étude de cas CLIENT : sujet ». Le corpus écrit « ORTHUS » là où la
 * décision du 12/10 (`lib/decisions-copie.ts`) écrit « Migen Travaux » : le
 * tirage reprend le nom du corpus, sinon la carte changerait de photo.
 */
export function photoDuCasMaquette(href: string, libelle: string): string {
  const slug = href.split("/")[2] ?? "";
  const lu = libelle.match(/^Étude de cas\s+(.+?)(?:\s*:\s*.+)?$/i);
  let client = lu ? lu[1] : libelle;
  if (slug.startsWith("orthus-")) client = client.replace(/^Migen Travaux/, "ORTHUS");
  const q = `${slug} ${client.toLowerCase()}`;
  const pool = POOL[familleDuCas(q)];
  return `/assets/web/${pool[empreinte(q) % pool.length]}.jpg`;
}
