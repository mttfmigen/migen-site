/**
 * Produit les fichiers de contenu du gabarit OFFRE, un par page.
 *
 *   node scripts/produit_gabarit_offre.mjs
 *
 * Écrit dans `supabase/import/gabarits-maquette/`, que
 * `scripts/importe_rest.mjs` pose ensuite par l'API REST.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * LA SOURCE DU TEXTE EST LA MAQUETTE. LE CORPUS NE SERT QU'AU RESTE.
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * CE QUI A ÉTÉ FAIT À L'ENVERS JUSQU'AU 05/10, et que ce script renverse.
 * Ce script partait du corpus SEO et laissait vides les champs que le corpus
 * n'alimentait pas. Personne n'avait vu que `maquette/site-final.html` ne porte
 * pas que du dessin : il porte SA PROPRE DONNÉE. À sa ligne 7748, un objet
 * `OFFERS` définit SIX offres de TRENTE-TROIS champs chacune, soit cent
 * quatre-vingt-dix-huit phrases écrites par le client, exactement celles que le
 * gabarit lie par `{{ of.X }}`. Résultat de l'inversion : la page d'offre
 * rendait « Ce que nous garantissons. » là où la maquette écrit « Vous gardez la
 * main. Nous portons le reste. », et aucune des neuf lignes `of.us0` à
 * `of.you3` n'était servie.
 *
 * LA RÈGLE, tranchée par Mehdi le 05/10 : « tu respectes AU MOT POUR MOT la
 * maquette ». Donc, dans cet ordre :
 *
 *   1. `maquette/offres-maquette.json` (l'objet `OFFERS`, extrait par
 *      `scripts/extrait-offres-maquette.mjs`) ;
 *   2. `maquette/blocs-offre-maquette.json` et `maquette/faq-maquette.json`
 *      (le texte que le gabarit écrit EN DUR : réalisations, tuiles, questions
 *      fréquentes, en-têtes — extraits par
 *      `scripts/extrait-page-offre-maquette.mjs`) ;
 *   3. le corpus rédigé, et SEULEMENT pour ce que les deux premiers ne
 *      définissent pas : les sections `probleme`, `deroule`, `garanties`, `cta`,
 *      `offre`, `preuves`, et le maillage du cocon.
 *
 * AUCUNE CHAÎNE N'EST RETAPÉE ICI. Tout vient d'un `require` de fichier extrait.
 * C'est la seule façon de ne pas pouvoir introduire une variante en recopiant.
 *
 * LA CORRESPONDANCE DES SIX CLÉS D'`OFFERS` AVEC LES URL DU SITE : voir
 * `URL_PAR_CLE_OFFERS` ci-dessous, chaque ligne avec sa justification. Les douze
 * autres pages de `/offres/` n'ont PAS de clé dans `OFFERS` : elles restent au
 * corpus, et elles sont inscrites dans `docs/RESERVES-CONTENU.md`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const IMPORT = join(RACINE, "supabase", "import");
const SORTIE = join(IMPORT, "gabarits-maquette");
const MAQUETTE = join(RACINE, "maquette");

const lis = (chemin) => JSON.parse(readFileSync(chemin, "utf8"));

/** Les 198 chaînes de l'objet `OFFERS`, six offres de trente-trois champs. */
const OFFERS = lis(join(MAQUETTE, "offres-maquette.json"));

/** Le texte que le gabarit de la page d'offre écrit en dur. */
const BLOCS = lis(join(MAQUETTE, "blocs-offre-maquette.json"));

/** Les questions fréquentes : cinq de repli pour Résidence, quatre par offre. */
const FAQ = lis(join(MAQUETTE, "faq-maquette.json"));

/**
 * ────────────────────────────────────────────────────────────────────────────
 * LA CORRESPONDANCE CLÉ `OFFERS` → URL SERVIE PAR LE SITE.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Établie le 05/10 sur la décision de Mehdi, et justifiée ligne par ligne par le
 * champ `name` de l'offre et par son `lead`. Aucune n'est devinée.
 *
 *   sursite      → /offres/residence/        `name` « Résidence », `lead` « Des
 *                                            techniciens de maintenance en
 *                                            résidence sur votre site ». La clé
 *                                            est historique (« sur site »), le
 *                                            nom commercial est Résidence.
 *   zero         → /offres/zero-arret/       `name` « Zéro arrêt ».
 *   arret        → /offres/arret-technique/  `name` « Arrêt technique ».
 *   chantier     → /offres/chantier/         `name` « Chantier ».
 *   etude        → /offres/bureau-etudes/    `name` « Bureau d’études ».
 *   construction → /offres/construction/     `name` « Construction ».
 *
 * CE QUI N'EST PAS RATTACHÉ, ET POURQUOI. Douze pages de `/offres/` n'ont aucune
 * clé dans `OFFERS`. Six sont des OFFRES DISTINCTES que la maquette ne dessine
 * pas (`/offres/maintenance-externalisee/`, `/offres/depannage-industriel/`,
 * `/offres/retrofit/`, `/offres/audit-conseil-maintenance/`) ; six sont des
 * pages PROFONDES, filles d'une offre mais avec leur propre mot clé, leur propre
 * H1 et leur propre corpus (`/offres/residence/cahier-des-charges/`,
 * `/offres/residence/prestataire-ou-salarie/`,
 * `/offres/chantier/transfert-de-production/`,
 * `/offres/chantier/demenagement-machines/`,
 * `/offres/retrofit/remise-en-etat/`,
 * `/offres/retrofit/mise-en-conformite-machine/`,
 * `/offres/depannage-industriel/astreinte/`,
 * `/offres/depannage-industriel/panne-machine/`).
 *
 * LEUR FAIRE HÉRITER DU TEXTE DE L'OFFRE PARENTE SERAIT UNE FAUTE, pas un
 * service : deux pages porteraient le même H1 (« migen© Résidence, un renfort
 * maintenance chez vous. »), le même chapeau et les mêmes quatre chiffres, alors
 * qu'elles visent des requêtes différentes. Elles restent donc au corpus, et le
 * fait est inscrit dans `docs/RESERVES-CONTENU.md` pour que Mehdi le voie.
 */
const URL_PAR_CLE_OFFERS = {
  sursite: "/offres/residence/",
  zero: "/offres/zero-arret/",
  arret: "/offres/arret-technique/",
  chantier: "/offres/chantier/",
  etude: "/offres/bureau-etudes/",
  construction: "/offres/construction/",
};

/** L'inverse, pour retrouver la clé depuis l'URL d'une page. */
const CLE_OFFERS_PAR_URL = Object.fromEntries(
  Object.entries(URL_PAR_CLE_OFFERS).map(([cle, url]) => [url, cle]),
);

/**
 * Les pages servies par ce gabarit : la branche `/offres/`, SAUF deux.
 *
 *   · `/offres/` est le hub, et la maquette lui donne son propre gabarit
 *     (`sc-if value="{{ isOffres }}"`, l. 1210), différent de celui-ci
 *     (`isOfferPage`, l. 4030).
 *   · `/offres/residence/recruter-un-technicien/` porte déjà le gabarit
 *     éditorial en base : c'est un guide, pas une offre.
 */
const HORS_GABARIT = new Set([
  "/offres/",
  "/offres/residence/recruter-un-technicien/",
]);

/* -------------------------------------------- le tiret cadratin, seule déviation */

/**
 * LA SEULE DÉVIATION AUTORISÉE SUR LE TEXTE DE LA MAQUETTE.
 *
 * Le tiret cadratin est interdit dans toute copie visible du site. C'est une
 * règle permanente de Mehdi, antérieure et indépendante de la maquette, et
 * `scripts/verifie-interdits.mjs` la tient. La maquette en porte dans TROIS
 * phrases de la donnée de la page d'offre, et chacune est substituée ici par la
 * ponctuation française équivalente, SANS QU'UN SEUL MOT SOIT TOUCHÉ.
 *
 * Chaque substitution est déclarée avec sa source exacte, et le script ÉCHOUE si
 * l'une d'elles ne sert plus : une exception devenue inutile ne doit pas
 * survivre en silence, sinon la liste grossit jusqu'à tout autoriser.
 */
const SUBSTITUTIONS_CADRATIN = [
  {
    ou: "OFFERS.zero.bref",
    de: "sans service maintenance structuré — ou dont l’équipe",
    a: "sans service maintenance structuré, ou dont l’équipe",
    pourquoi: "incise simple : virgule",
  },
  {
    ou: "OFFERS.zero.incP",
    de: "la disponibilité et le délai — jamais les fournitures",
    a: "la disponibilité et le délai, jamais les fournitures",
    pourquoi: "opposition : virgule, comme la bande « La règle » qui reprend la même formule",
  },
  {
    ou: "faq-maquette.json, RES_FAQ[2]",
    de: "les absences prévues — congés, formation — le remplaçant",
    a: "les absences prévues (congés, formation) le remplaçant",
    pourquoi:
      "incise qui CONTIENT déjà une virgule : deux virgules de plus rendraient " +
      "la phrase illisible. Parenthèses, que le remède de verifie-interdits " +
      "nomme lui aussi comme équivalent français",
  },
];

/** Combien de fois chaque substitution a servi. Zéro fait échouer le script. */
const USAGES_CADRATIN = new Map(SUBSTITUTIONS_CADRATIN.map((s) => [s.de, 0]));

/**
 * Le texte de la maquette, prêt à être écrit : substitutions appliquées, et
 * aucun tiret cadratin résiduel toléré.
 */
function copie(texte) {
  if (typeof texte !== "string") return texte;
  let sortie = texte;
  for (const sub of SUBSTITUTIONS_CADRATIN) {
    if (sortie.includes(sub.de)) {
      USAGES_CADRATIN.set(sub.de, USAGES_CADRATIN.get(sub.de) + 1);
      sortie = sortie.split(sub.de).join(sub.a);
    }
  }
  if (sortie.includes("—")) {
    throw new Error(
      `tiret cadratin non déclaré dans « ${sortie.slice(0, 120)} » : ` +
        "ajoutez la substitution dans SUBSTITUTIONS_CADRATIN, ne la supprimez pas en douce",
    );
  }
  return sortie;
}

/* ---------------------------------------------------------- la transformation */

function section(sections, type) {
  return sections.find((s) => s.type === type);
}

/** Vrai si la valeur mérite d'être écrite. Un vide ne s'écrit pas. */
function pose(valeur) {
  if (valeur === null || valeur === undefined) return false;
  if (typeof valeur === "string") return valeur.trim().length > 0;
  if (Array.isArray(valeur)) return valeur.length > 0;
  return true;
}

function ajoute(cible, clef, valeur) {
  if (pose(valeur)) cible[clef] = valeur;
}

/** L'ancre du formulaire de bas de page. `#form-page` dans la maquette, posée
    `id="formulaire"` par `components/site/accueil/FormulaireBasDePage.tsx`. */
const ANCRE = "#formulaire";

/** Une cible sûre : chemin interne ou ancre. Sinon, l'ancre de la page. */
function cible(href) {
  if (typeof href !== "string") return ANCRE;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("#")) return href;
  return ANCRE;
}

/* --------------------------------------------- les libellés d'offre du corpus */

/**
 * Les libellés d'offre du corpus, pour la pastille du héros des DOUZE pages
 * sans clé `OFFERS`.
 *
 * Les six pages qui ont une clé prennent `of.pill`, mot pour mot. Les autres
 * n'ont pas de pastille écrite par le client : le corpus nomme ses huit offres
 * dans la section `offre` de `/offres/`, chacune avec le lien de sa page, et une
 * page profonde hérite du libellé de son offre parente par le plus long préfixe.
 */
function libellesParOffre(corpus) {
  const hub = corpus.find((e) => (e.url ?? "").replace(/\/?$/, "/") === "/offres/");
  const liste = section(hub?.contenu?.sections ?? [], "offre");
  const paires = [];
  for (const ligne of liste?.lignes ?? []) {
    const libelle = ligne.prestation?.accroche;
    if (!libelle) continue;
    const texte = `${ligne.prestation?.texte ?? ""}`;
    for (const lien of texte.matchAll(/\]\((\/offres\/[^)]*)\)/g)) {
      paires.push({ prefixe: lien[1], libelle });
    }
  }
  return paires;
}

/** Le libellé de l'offre dont cette page dépend, par le plus long préfixe. */
function libelleOffre(paires, url) {
  let trouve = null;
  for (const paire of paires) {
    const dedans = url === paire.prefixe || url.startsWith(paire.prefixe);
    if (dedans && (!trouve || paire.prefixe.length > trouve.prefixe.length)) {
      trouve = paire;
    }
  }
  return trouve?.libelle;
}

/* ------------------------------------------------------ la bande du héros */

/**
 * Les trois repères de la bande du héros (maquette l. 4049 à 4053).
 *
 * PORTÉS SUR LA DÉCISION DE MEHDI DU 05/10, « respecte la maquette ». DEUX DES
 * TROIS CONTREDISENT LE CORPUS, et c'est écrit noir sur blanc dans
 * `docs/RESERVES-CONTENU.md`, section 2 : le corpus et CLAUDE.md section 9
 * disent quatre agences (Lyon siège, Montréal, Dubaï, Madrid) et aucune autre en
 * France, et « plus de 120 clients, dont plus de 80 réguliers ». À trancher
 * AVANT que migen.fr pointe sur le déploiement. Le troisième, 10 %, est cohérent
 * avec la section « Notre sélection ».
 */
const REPERES_HERO = [
  { valeur: "5", libelle: "agences en France" },
  { valeur: "10 %", libelle: "des candidats retenus" },
  { valeur: "+200", libelle: "clients industriels" },
];

/* --------------------------- les quatre sections réservées à Zéro Arrêt */

/**
 * Les quatre sections que la maquette réserve à `/offres/zero-arret/`
 * (`sc-if value="{{ of.isZero }}"`, l. 4096 à 4210 de `site-final.html`).
 *
 * PORTÉES SUR LA DÉCISION DE MEHDI DU 05/10. Elles avaient été retirées parce
 * que le contrat du projet (CLAUDE.md section 9) refuse les prix et les délais
 * chiffrés d'intervention ; la règle du 05/10 fait primer la maquette. Les
 * formulations concernées sont inscrites dans `docs/RESERVES-CONTENU.md` pour
 * arbitrage avant la mise en ligne.
 *
 * TEXTES RELEVÉS MOT POUR MOT dans la maquette, espaces insécables comprises.
 * Le tiret cadratin de la bande « La règle » (l. 4156) devient une virgule,
 * SANS qu'un mot soit retiré : même substitution que `OFFERS.zero.incP`, qui
 * porte la même formule.
 */
const ZERO_ARRET = {
  commentCaMarcheSurtitre: "Comment ça marche",
  commentCaMarcheTitre:
    "Une panne signalée avant 16 h, une intervention garantie.",
  commentCaMarcheChapeau:
    "Signalée après 16 h ? Intervention la nuit suivante. Le dépannage en journée n’est pas dans le périmètre : il relève de la régie classique.",
  commentCaMarcheJalons: [
    { repere: "14 h 30", texte: "Vous signalez la panne à l’astreinte." },
    { repere: "16 h 00", texte: "L’intervention est confirmée pour cette nuit." },
    {
      repere: "22 h 00",
      texte: "Le technicien intervient sur votre site, machines à l’arrêt.",
    },
  ],

  formulesSurtitre: "Les formules · engagement 12 mois",
  formulesTitre: "Trois formules. Une recommandation.",
  formulesChapeau:
    "Prix mensuel fixe, sans embauche. Ni majoration de nuit, ni d’urgence, ni de week-end. Le tarif vous est présenté en rendez-vous, avec l’étude de couverture de votre site.",
  formules: [
    {
      rang: "Formule 01",
      nom: "Prévention",
      resume: "La porte d’entrée, pour une PME prudente.",
      inclus: [
        "1 préventif le samedi par mois",
        "Astreinte en horaires ouvrés",
        "Dépannage à la demande",
      ],
      bouton: { libelle: "Recevoir le tarif", href: "#besoin" },
    },
    {
      rang: "Formule 02",
      nom: "Zéro Arrêt",
      resume: "Pour la PME sans maintenance interne.",
      inclus: [
        "1 préventif le samedi par mois",
        "1 ticket de dépannage de nuit garanti",
        "Astreinte",
        "Mise en service offerte",
      ],
      recommandee: true,
      bouton: { libelle: "Recevoir le tarif", href: "#besoin" },
    },
    {
      rang: "Formule 03",
      nom: "Zéro Arrêt Max",
      resume: "Multi-machines, production sensible.",
      inclus: [
        "2 préventifs par mois",
        "2 tickets de nuit garantis",
        "Interventions prioritaires",
        "Mise en service offerte",
      ],
      bouton: { libelle: "Recevoir le tarif", href: "#besoin" },
    },
  ],
  /* Le tableau ligne par ligne de la maquette (l. 4148 à 4154). La colonne
     mise en avant est la deuxième, « Zéro Arrêt », comme dans la maquette. */
  formulesTableau: {
    entetes: ["Ligne par ligne", "Prévention", "Zéro Arrêt", "Max"],
    lignes: [
      ["Préventif samedi (8 h)", "1 / mois", "1 / mois", "2 / mois"],
      [
        "Ticket de dépannage de nuit (4 h max)",
        "À la demande",
        "1 / mois",
        "2 / mois",
      ],
      [
        "Délai d’intervention curative",
        "Nuit suivante, sans engagement",
        "La nuit même si appel avant 16 h",
        "La nuit même, en priorité",
      ],
      ["Mise en service", "Facturée", "Offerte", "Offerte"],
    ],
  },
  formulesRegleSurtitre: "La règle",
  formulesRegle:
    "Ce qui fait monter d’une formule à l’autre, c’est la disponibilité et le délai — jamais les fournitures. En plus de l’abonnement, seules les pièces s’ajoutent, au prix réel avec un coefficient écrit au contrat.",

  comparatif: [
    {
      surtitre: "Le comparatif",
      titre: "Disponible quand un salarié ne l’est pas.",
      points: [
        "Un technicien salarié est indisponible la nuit et le samedi",
        "Six semaines d’absence par an",
        "À recruter, équiper, manager",
      ],
    },
    {
      surtitre: "Zéro Arrêt",
      titre: "Couvert la nuit et le samedi, garanti par contrat.",
      points: [
        "Couvert la nuit et le samedi",
        "Délai garanti par contrat",
        "Opérationnel dès le premier mois",
      ],
    },
  ],

  premierMoisSurtitre: "Le premier mois",
  premierMoisTitre: "La première visite prépare toutes les nuits suivantes.",
  premierMoisEtapes: [
    "Visite de votre site et référencement des équipements critiques.",
    "Organisation des accès de nuit et du samedi : clés, badge, alarme.",
    "Plan de prévention signé, test de l’astreinte.",
  ],
  premierMoisAppelSurtitre: "Prochaine étape",
  premierMoisAppelTitre: "L’étude de couverture est gratuite.",
  premierMoisAppelTexte:
    "Votre code postal, une réponse écrite sous 48 h : couvert, en zone étendue, ou refusé. On préfère refuser un contrat que signer une promesse qu’on ne tiendra pas.",
  /* La flèche va DANS le libellé : `PREMIER_MOIS_APPEL_BOUTON` ne l'ajoute pas,
     contrairement aux cartes de « Un autre besoin ? ». Maquette l. 4205. */
  premierMoisAppelBouton: {
    libelle: "Vérifier ma couverture →",
    href: "#besoin",
  },
};

/* ------------------------------------------- « Nos dernières réalisations » */

/** Les images de réalisation absentes de `public/`, signalées une fois. */
const IMAGES_MANQUANTES = new Set();

/**
 * Les trois cartes de la maquette, telles qu'extraites.
 *
 * `x-faisceaux.jpg` N'EST PAS AU DÉPÔT (`public/assets/web/` porte 17 fichiers,
 * pas celui-là). On NE SUBSTITUE PAS une autre photo : ce serait associer un
 * visuel arbitraire au nom d'un client. La carte garde son cadre de 210 px au
 * fond `var(--ph)` — exactement ce que la maquette dessine sous l'image — et le
 * fichier est réclamé à Mehdi dans `docs/RESERVES-CONTENU.md`.
 */
function realisations() {
  const source = BLOCS.realisations;
  return {
    surtitre: copie(source.surtitre),
    titre: copie(source.titre),
    lien: { libelle: copie(source.lien.libelle), href: cible(source.lien.href) },
    cartes: source.cartes.map((carte) => {
      const presente = existsSync(join(RACINE, "public", carte.image));
      if (!presente) IMAGES_MANQUANTES.add(carte.image);
      const rendu = {
        surtitre: copie(carte.surtitre),
        titre: copie(carte.titre),
        date: copie(carte.date),
      };
      if (presente) rendu.image = carte.image;
      return rendu;
    }),
  };
}

/* ------------------------------------------------- « Questions fréquentes » */

/**
 * Les questions de la maquette pour cette offre.
 *
 * `resFaq: ((this.FAQ_BY && this.FAQ_BY[page]) || this.RES_FAQ)`, l. 9336 :
 * `sursite` n'a PAS d'entrée dans `FAQ_BY`, Résidence sert donc les cinq
 * questions de repli de `RES_FAQ`. Les cinq autres offres servent leurs quatre.
 */
function questionsDeLaMaquette(cle) {
  const liste = FAQ.parOffre[cle] ?? FAQ.defaut;
  return liste.map((q) => ({
    question: copie(q.question),
    reponse: copie(q.reponse),
  }));
}

/* ---------------------------------------------------------------- l'assemblage */

/** Le contenu d'une page qui a sa clé dans `OFFERS` : la maquette, mot pour mot. */
function depuisLaMaquette(contenu, cle) {
  const of = OFFERS[cle];

  /* ---- 1. LE HÉROS (maquette l. 4032) ---------------------------------- */
  contenu.pastille = copie(of.pill);
  contenu.mention = copie(of.small);
  // Le H1 de la maquette est en DEUX encres : `of.h1a` en `var(--ink)`, puis
  // `of.h1b` dans un `<span>` en `var(--ink4)`. `pages.titre_h1` reste le repli
  // des douze pages sans clé `OFFERS`.
  contenu.titreA = copie(of.h1a);
  contenu.titreB = copie(of.h1b);
  contenu.chapeau = copie(of.lead);
  contenu.actions = [
    { libelle: copie(BLOCS.heros.bouton.libelle), href: cible(BLOCS.heros.bouton.href) },
  ];
  contenu.formulaireHeroTitre = copie(BLOCS.heros.formulaireTitre);
  contenu.formulaireHeroMention = copie(BLOCS.heros.formulaireMention);

  /* ---- 2. « EN BREF » (l. 4078) ----------------------------------------
     TOUJOURS QUATRE CHIFFRES, `s00` à `s32`, trois niveaux chacun : la valeur
     en orange, le libellé, la légende. Le corpus n'en remplissait que deux, la
     légende ne sortait donc jamais. */
  contenu.brefSurtitre = copie(BLOCS.bref.surtitre);
  contenu.brefTitre = copie(BLOCS.bref.titre);
  contenu.brefChapeau = copie(of.bref);
  contenu.chiffres = [0, 1, 2, 3].map((rang) => ({
    valeur: copie(of[`s${rang}0`]),
    libelle: copie(of[`s${rang}1`]),
    detail: copie(of[`s${rang}2`]),
  }));
  contenu.brefBande = copie(of.strip);
  contenu.brefBouton = { libelle: copie(of.cta), href: ANCRE };

  /* ---- 8. « CE QUI EST INCLUS » (l. 4277) ------------------------------
     Les deux panneaux face à face : cinq lignes `us0` à `us4` à gauche, quatre
     lignes `you0` à `you3` à droite, et la barrette en verre dessous. */
  contenu.incTitre = copie(of.incT);
  contenu.incChapeau = copie(of.incP);
  contenu.porte = [0, 1, 2, 3, 4].map((rang) => copie(of[`us${rang}`]));
  contenu.resteChezVous = [0, 1, 2, 3].map((rang) => copie(of[`you${rang}`]));
  contenu.incBande = copie(BLOCS.inclus.bande);
  contenu.incBouton = { libelle: copie(BLOCS.inclus.bouton), href: ANCRE };

  /* ---- 10. « NOTRE SÉLECTION » (l. 4379) -------------------------------
     Le lien d'en-tête de la maquette est lié à `{{ of.cta }}` : il CHANGE avec
     l'offre. Il était écrit en dur « Constituer mon équipe → » dans
     `ProcessSelection.tsx`, ce qui ne tombait juste que sur Résidence. */
  contenu.selectionCta = copie(of.cta);

  /* ---- 11. « NOS DERNIÈRES RÉALISATIONS » (l. 4429) -------------------- */
  contenu.realisations = realisations();

  /* ---- 13. « UN AUTRE BESOIN ? » (l. 4477) ----------------------------- */
  contenu.autresChapeau = copie(
    BLOCS.autres.chapeauGabarit.replace("{{ of.name }}", of.name),
  );

  /* ---- 14. LE FORMULAIRE DE BAS DE PAGE (l. 4499) ----------------------
     Le H2 du formulaire est lié à `{{ of.form }}`. */
  contenu.formulaireTitre = copie(of.form);

  /* ---- 3 à 6. LES QUATRE SECTIONS DE ZÉRO ARRÊT -----------------------
     `sc-if value="{{ of.isZero }}"`, l. 4096 et 4210 : la maquette ne les
     dessine QUE sur Zéro Arrêt, leur absence ailleurs est le dessin. */
  if (cle === "zero") {
    for (const [champ, valeur] of Object.entries(structuredClone(ZERO_ARRET))) {
      contenu[champ] = typeof valeur === "string" ? copie(valeur) : valeur;
    }
  }
}

function construit(entree, libelles) {
  const sections = entree.contenu.sections ?? [];
  const heros = section(sections, "heros");
  const chiffres = section(sections, "chiffres");
  const cta = section(sections, "cta");
  const cle = CLE_OFFERS_PAR_URL[entree.url];

  const contenu = { gabarit: "offre" };

  /* ---- CE QUE LA MAQUETTE NE DÉFINIT PAS, et qui vaut pour les dix-huit :
     la bande de repères du héros, portée avec sa réserve. */
  contenu.reperes = structuredClone(REPERES_HERO);
  contenu.autresSurtitre = copie(BLOCS.autres.surtitre);
  contenu.autresTitre = copie(BLOCS.autres.titre);
  contenu.autres = BLOCS.autres.tuiles
    .filter((tuile) => tuile.href !== entree.url)
    .map((tuile) => ({
      phrase: copie(tuile.phrase),
      libelle: copie(tuile.libelle),
      href: cible(tuile.href),
    }));
  contenu.faqBouton = { libelle: copie(BLOCS.enteteFaq.bouton), href: ANCRE };

  if (cle) {
    /* ───── LES SIX PAGES QUI ONT LEUR CLÉ : LA MAQUETTE, MOT POUR MOT. ───── */
    depuisLaMaquette(contenu, cle);
  } else {
    /* ───── LES DOUZE AUTRES : LE CORPUS, FAUTE DE TEXTE DU CLIENT. ─────
       `pastille` ← le libellé d'offre que le corpus écrit dans la section
       `offre` de `/offres/`. `mention` ← `heros.phraseDelai`.
       `chapeau` ← `heros.mecanisme`. Le H1 vient de `pages.titre_h1`.
       Elles sont inscrites dans `docs/RESERVES-CONTENU.md`. */
    ajoute(contenu, "pastille", libelleOffre(libelles, entree.url));
    ajoute(contenu, "mention", heros?.phraseDelai);
    ajoute(contenu, "chapeau", heros?.mecanisme);
    ajoute(contenu, "actions", [
      { libelle: copie(BLOCS.heros.bouton.libelle), href: cible(BLOCS.heros.bouton.href) },
    ]);
    contenu.formulaireHeroTitre = copie(BLOCS.heros.formulaireTitre);
    contenu.formulaireHeroMention = copie(BLOCS.heros.formulaireMention);

    contenu.brefSurtitre = copie(BLOCS.bref.surtitre);
    if ((chiffres?.chiffres ?? []).length === 4) {
      contenu.brefTitre = copie(BLOCS.bref.titre);
    }
    ajoute(contenu, "chiffres", chiffres?.chiffres);
    ajoute(contenu, "brefBande", cta?.question);
    if (pose(cta?.bouton)) {
      contenu.brefBouton = { libelle: cta.bouton, href: cible(cta.href) };
    }
    contenu.incBande = copie(BLOCS.inclus.bande);
    contenu.incBouton = { libelle: copie(BLOCS.inclus.bouton), href: ANCRE };
    // `of.us0` à `of.us4` sans clé `OFFERS` : les cinq premières accroches de
    // prestation du corpus, qui sont exactement cela, ce que migen© porte.
    ajoute(
      contenu,
      "porte",
      (section(sections, "offre")?.lignes ?? [])
        .map((l) => l.prestation?.accroche)
        .filter((a) => pose(a))
        .slice(0, 5),
    );
  }

  /* ---- 12. « QUESTIONS FRÉQUENTES » ET LE CORPS, VENUS DU CORPUS -------
     Les douze sections du corpus sont du texte payé : rien n'est jeté. Elles se
     rendent APRÈS les treize sections de la maquette, pour ne pas couper sa
     colonne vertébrale (`PageOffre.tsx`). Trois exceptions :
       · `heros` et `chiffres` : leurs champs sont déjà rangés au-dessus ;
       · `cta` : sur les douze pages sans clé, elle EST la bande « En bref » ;
         sur les six autres, `of.strip` la remplace et la section du corpus
         reste, rendue en fin de page ;
       · `objections` : sur les six pages à clé, les questions de la maquette
         (`RES_FAQ` / `FAQ_BY`) prennent la place de celles du corpus, à
         l'emplacement que la maquette donne à la section. Réserve inscrite dans
         `docs/RESERVES-CONTENU.md` : les six questions de corpus de chacune de
         ces pages ne sont plus servies. */
  const retirees = new Set(["heros", "chiffres"]);
  if (!cle) retirees.add("cta");

  const corps = sections
    .filter((s) => !retirees.has(s.type))
    .map((s) => {
      if (cle && s.type === "objections") {
        return {
          ...s,
          titre: copie(BLOCS.enteteFaq.titre),
          questions: questionsDeLaMaquette(cle),
        };
      }
      return s;
    });

  // Une page à clé dont le corpus n'a pas de section `objections` perdrait la
  // FAQ de la maquette : on la pose alors de toutes pièces.
  if (cle && !corps.some((s) => s.type === "objections")) {
    corps.push({
      type: "objections",
      titre: copie(BLOCS.enteteFaq.titre),
      questions: questionsDeLaMaquette(cle),
    });
  }

  ajoute(contenu, "sections", corps);

  return contenu;
}

/* ------------------------------------------------------------------- l'écriture */

const corpus = lis(join(IMPORT, "corpus-analyse.json"));

const aEcrire = corpus.filter((e) => {
  const url = e.url?.endsWith("/") ? e.url : `${e.url}/`;
  return url.startsWith("/offres/") && !HORS_GABARIT.has(url) && !!e.contenu;
});

mkdirSync(SORTIE, { recursive: true });

const LIBELLES = libellesParOffre(corpus);

/** `/offres/residence/cahier-des-charges/` devient `offres-residence-cahier-des-charges`. */
function aplatit(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

let total = 0;
const sansCle = [];
for (const entree of aEcrire) {
  const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
  const contenu = construit({ ...entree, url }, LIBELLES);
  const fichier = join(SORTIE, `${aplatit(url)}.json`);
  writeFileSync(
    fichier,
    `${JSON.stringify({ url, contenu }, null, 2)}\n`,
    "utf8",
  );
  const cle = CLE_OFFERS_PAR_URL[url];
  if (!cle) sansCle.push(url);
  console.log(
    `${url.padEnd(50)} ${(cle ?? "— corpus").padEnd(13)} ` +
      `${String((contenu.chiffres ?? []).length)} chiffres, ` +
      `${String((contenu.porte ?? []).length)}+${String((contenu.resteChezVous ?? []).length)} lignes incluses, ` +
      `${String((contenu.sections ?? []).length).padStart(2)} sections de corpus`,
  );
  total += 1;
}

/* Une substitution de cadratin devenue inutile doit faire ÉCHOUER le script :
   sinon la liste des exceptions grossit jusqu'à tout autoriser. */
const inutiles = SUBSTITUTIONS_CADRATIN.filter(
  (s) => USAGES_CADRATIN.get(s.de) === 0,
);
if (inutiles.length > 0) {
  console.error("\nsubstitution(s) de tiret cadratin devenue(s) inutile(s) :");
  for (const s of inutiles) {
    console.error(`  · ${s.ou} : « ${s.de} » n'existe plus dans la maquette`);
  }
  console.error("Retirez-la de SUBSTITUTIONS_CADRATIN.");
  process.exit(1);
}

console.log(`\n${total} fichiers écrits dans supabase/import/gabarits-maquette/.`);
console.log(
  `  ${Object.keys(URL_PAR_CLE_OFFERS).length} pages servies par OFFERS, mot pour mot.`,
);
console.log(`  ${sansCle.length} pages sans clé OFFERS, servies par le corpus :`);
for (const url of sansCle) console.log(`    ${url}`);
console.log("  (inscrites dans docs/RESERVES-CONTENU.md, section 5)");
console.log(
  `  ${SUBSTITUTIONS_CADRATIN.length} tirets cadratins substitués, ` +
    SUBSTITUTIONS_CADRATIN.map((s) => `${s.ou} ×${USAGES_CADRATIN.get(s.de)}`).join(", "),
);
if (IMAGES_MANQUANTES.size > 0) {
  console.log(
    `  ${IMAGES_MANQUANTES.size} image(s) de réalisation absente(s) de public/, ` +
      "carte rendue sans photo plutôt qu'avec une autre : " +
      [...IMAGES_MANQUANTES].join(", "),
  );
}
console.log("Pour les poser en base : node scripts/importe_rest.mjs --simulation");
