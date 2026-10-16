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
