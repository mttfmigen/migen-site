/**
 * Produit la donnée des gabarits de RUBRIQUE, une page par fichier.
 *
 *   node scripts/produit_hub.mjs
 *
 * DEUX GABARITS, ET C'EST LA FORME DU CORPUS QUI TRANCHE :
 *
 *   · un corpus en DIX SECTIONS nommées  -> `gabarit: "hub"`, maquette 10
 *   · un corpus en BLOCS SUIVIS          -> `gabarit: "sousRubrique"`, maquette 11
 *
 * SOURCES : `supabase/import/corpus-analyse.json` et
 * `supabase/import/editorial-analyse.json`, c'est-à-dire le corpus rédigé par le
 * client, analysé une fois pour toutes. Pas la base : une partie des pages y est
 * TRONQUÉE par l'import SQL interrompu (section 15 de CLAUDE.md), et `/carriere/`
 * y est carrément vide alors que le fichier d'analyse porte ses soixante blocs.
 *
 * SORTIE : `supabase/import/gabarits-maquette/<chemin-aplati>.json`, que
 * `scripts/importe_rest.mjs` pose par l'API REST. Jamais de SQL assemblé : la
 * couche de permissions refuse une instruction portant un point-virgule dans le
 * texte, et ce corpus en est plein.
 *
 * CE SCRIPT NE RÉÉCRIT AUCUN TEXTE. Il fait trois choses, et rien d'autre :
 *
 *   1. il range chaque champ du corpus sous la section de la maquette qui lui
 *      correspond ;
 *   2. il applique la NORMALISATION QUE LA MAQUETTE APPLIQUE ELLE-MÊME à son
 *      markdown, `__c247`, qui retire « 24/24 et 7/7 » et ses variantes. Ce
 *      n'est pas une réécriture de notre fait : le fichier de maquette porte
 *      cette fonction et la passe sur tout le texte avant de l'analyser. La
 *      règle du projet l'exige par ailleurs : aucun délai chiffré hors « rappel
 *      dans l'heure » ;
 *   3. il relève les liens internes du corpus pour en faire le maillage de
 *      rubrique, comme la maquette le fait : un lien, une carte, dédoublonnée.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const VENTE = join(RACINE, "supabase", "import", "corpus-analyse.json");
const EDITORIAL = join(RACINE, "supabase", "import", "editorial-analyse.json");
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/** Les pages de rubrique dont le corpus porte les dix sections de vente. */
const HUBS = [
  "/offres/",
  "/secteurs/",
  "/travaux-industriels/",
  "/bureau-etudes/",
  "/offres/residence/cahier-des-charges/",
  "/offres/residence/prestataire-ou-salarie/",
];

/** Les pages de rubrique dont le corpus est un corps suivi. */
const SOUS_RUBRIQUES = [
  "/ressources/",
  "/ressources/articles/",
  "/ressources/fiches-pratiques/",
  "/ressources/fiches-techniques/",
  "/ressources/livres-blancs/",
  "/ressources/process/",
  "/carriere/",
];

/**
 * La pastille du héros du gabarit 11 : le nom de la rubrique.
 *
 * Ces deux libellés sont ceux de la barre de navigation de la maquette, pas des
 * inventions. Une rubrique absente de cette table ne reçoit pas de pastille.
 */
const PASTILLES = { "/ressources/": "Ressources", "/carriere/": "Carrière" };

/**
 * `__c247`, recopiée du fichier de maquette.
 *
 * La maquette la passe sur tout son markdown avant de l'analyser : le corpus
 * écrit « Astreinte 24/24 et 7/7 en dehors », elle rend « Astreinte en dehors ».
 */
function sansVingtQuatreSept(t) {
  return t
    .replace(
      /^[-*] \*\*(?:24\s*\/\s*24(?:\s*et\s*7\s*\/\s*7)?|24\s*\/\s*7|7\s*j\s*\/\s*7|7\s*\/\s*7)\*\*.*$\n?/gm,
      "",
    )
    .replace(/,\s*24\/24 et 7\/7\s*,/g, ",")
    .replace(/\s*24\s*\/\s*24(?:\s*(?:et|·|,)\s*7\s*\/\s*7)?/g, "")
    .replace(/\s*24\s*h\s*\/\s*24(?:\s*(?:et|,)?\s*7\s*j?\s*\/\s*7)?/gi, "")
    .replace(/\s+7\s*jours\s*sur\s*7/gi, "")
    .replace(/\s+7\s*j\s*\/\s*7/gi, "")
    .replace(/\s+24\s*\/\s*7\b/g, "")
    .replace(/\s+7\s*\/\s*7\b/g, "");
}

/** La normalisation s'applique à toute chaîne de l'arbre, en profondeur. */
function normalise(valeur) {
  if (typeof valeur === "string") return sansVingtQuatreSept(valeur);
  if (Array.isArray(valeur)) return valeur.map(normalise);
  if (valeur && typeof valeur === "object")
    return Object.fromEntries(
      Object.entries(valeur).map(([c, v]) => [c, normalise(v)]),
    );
  return valeur;
}

/** `/offres/residence/` donne `offres-residence`. */
function aplati(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "accueil";
}

/** Le markdown en ligne retiré, pour une phrase de contexte lisible. */
function sansBalisage(texte) {
  return (texte ?? "")
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1")
    .replace(/\*\*/g, "")
    .trim();
}

/** La première phrase, puis le reste. La maquette coupe la punchline ainsi. */
function premierePhrase(texte) {
  const phrases = (texte ?? "").split(/(?<=[.?!])\s+/).filter(Boolean);
  return [phrases[0] ?? "", phrases.slice(1).join(" ")];
}

/** La nature de la cible, lue de son chemin. Reprise de `kindOf` du gabarit 11. */
function nature(url) {
  if (/^\/preuves\//.test(url)) return "Étude de cas";
  if (/^\/ressources\/articles\//.test(url)) return "Article";
  if (/^\/ressources\/fiches-pratiques\//.test(url)) return "Fiche pratique";
  if (/^\/ressources\/fiches-techniques\//.test(url)) return "Fiche technique";
  if (/^\/ressources\//.test(url)) return "Ressource";
  if (/^\/offres\//.test(url)) return "Offre";
  if (/^\/carriere\//.test(url)) return "Carrière";
  if (/^\/expertises\//.test(url)) return "Expertise";
  if (/^\/secteurs\//.test(url)) return "Secteur";
  return "Page";
}

/**
 * Relève les liens internes d'un texte et les ajoute au sac, dédoublonnés.
 *
 * `extrait` est la phrase du corpus qui portait le lien, balisage retiré : c'est
 * ce que la maquette met en description de carte, et c'est du texte rédigé, pas
 * une phrase fabriquée pour l'occasion.
 */
function releve(texte, sac, vus, exclus) {
  for (const m of (texte ?? "").matchAll(/\[([^\]]+)\]\((\/[^)]*)\)/g)) {
    const [, libelle, url] = m;
    if (vus.has(url) || exclus(url)) continue;
    vus.add(url);
    sac.push({
      titre: libelle.charAt(0).toUpperCase() + libelle.slice(1),
      url,
      extrait: sansBalisage(texte),
      nature: nature(url),
    });
  }
}

/* --------------------------------------------- gabarit 10, hub de rubrique */

function produitHub(page) {
  const sections = {};
  for (const s of page.contenu.sections) sections[s.type] = s;

  const heros = sections.heros ?? {};
  const probleme = sections.probleme ?? {};
  const [punchTitre, punchTexte] = premierePhrase(probleme.punchline ?? "");

  const preuves = sections.preuves?.preuves ?? [];
  const clients = preuves
    .map((p) =>
      (p.lienLibelle ?? "").replace(/^Étude de cas\s*/, "").split(" : ")[0],
    )
    .filter(Boolean);

  /* Le maillage, dans l'ordre où la maquette lit le corpus : le tableau de
     l'offre d'abord, puis le déroulé, les garanties et les réponses. Les études
     de cas en sont écartées, elles ont leur propre section. */
  const vus = new Set();
  const liens = [];
  const exclus = (url) => /^\/preuves\//.test(url) || url === page.url;
  for (const ligne of sections.offre?.lignes ?? []) {
    releve(
      `${ligne.prestation.accroche ? `${ligne.prestation.accroche} : ` : ""}${ligne.prestation.texte}`,
      liens,
      vus,
      exclus,
    );
    releve(ligne.benefice, liens, vus, exclus);
  }
  for (const etape of sections.deroule?.etapes ?? [])
    releve(etape.texte, liens, vus, exclus);
  for (const puce of sections.garanties?.puces ?? [])
    releve(puce.texte, liens, vus, exclus);
  for (const q of sections.objections?.questions ?? [])
    releve(q.reponse, liens, vus, exclus);

  const appel = (s) =>
    s ? { question: s.question, bouton: s.bouton, rappel: s.rappel } : undefined;

  return {
    gabarit: "hub",
    chapeau: heros.mecanisme,
    cta: heros.cta,
    telephone: heros.telephone,
    phraseDelai: heros.phraseDelai,
    enBref: sections.chiffres?.chiffres,
    clients: clients.length > 0 ? clients : undefined,
    punchTitre,
    punchTexte,
    problemes: probleme.puces,
    offre: sections.offre?.lignes,
    liens: liens.length > 0 ? liens : undefined,
    etapes: sections.deroule?.etapes,
    garanties: sections.garanties?.puces,
    appel: appel(sections.cta),
    preuves: preuves.length > 0 ? preuves : undefined,
    questions: sections.objections?.questions,
    final: appel(sections.ctaFinal),
  };
}

/* ------------------------------------------------ gabarit 11, sous-rubrique */

/** Une puce dont l'accroche est un lien seul : la liste est un sommaire. */
function estCarte(item) {
  return /^\[[^\]]+\]\(\/[^)]*\)$/.test((item.accroche ?? "").trim());
}

/** Une puce ou un paragraphe dont l'accroche est une question. */
function estQuestion(bloc) {
  return /\?\s*$/.test((bloc.accroche ?? "").trim());
}

function produitSousRubrique(page) {
  const tous = page.contenu.blocs ?? [];

  /* Le corps se découpe sur les titres de niveau 2, exactement comme la
     maquette découpe son markdown sur `## `. */
  const groupes = [{ titre: "", id: "intro", blocs: [] }];
  for (const bloc of tous) {
    if (bloc.type === "titre" && bloc.niveau === 2) {
      groupes.push({ titre: bloc.texte, id: bloc.id, blocs: [] });
      continue;
    }
    groupes[groupes.length - 1].blocs.push(bloc);
  }

  /* L'ouverture : les paragraphes montent dans le chapeau du héros, le reste
     (un encadré de rappel) reste en tête du corps, sans titre ni rang. */
  const ouverture = groupes.shift();
  const chapeau = [
    ...(page.contenu.chapeau ? [{ texte: page.contenu.chapeau }] : []),
    ...ouverture.blocs
      .filter((b) => b.type === "paragraphe")
      .map(({ accroche, texte }) => ({ accroche, texte })),
  ];
  const reste = ouverture.blocs.filter((b) => b.type !== "paragraphe");

  let faq;
  const corps = reste.length > 0 ? [{ ...ouverture, blocs: reste }] : [];

  for (const groupe of groupes) {
    if (!/^questions/i.test(groupe.titre)) {
      corps.push(groupe);
      continue;
    }
    /* La FAQ : les questions sont les paragraphes dont l'accroche se termine par
       un point d'interrogation, ou les puces d'une liste qui n'en porte que de
       telles. Ce qui précède est l'introduction, ce qui suit reste dessous. */
    const intro = [];
    const questions = [];
    const suite = [];
    for (const bloc of groupe.blocs) {
      if (bloc.type === "paragraphe" && estQuestion(bloc)) {
        questions.push({ question: bloc.accroche.trim(), reponse: bloc.texte });
      } else if (
        bloc.type === "liste" &&
        bloc.items.length > 0 &&
        bloc.items.every(estQuestion)
      ) {
        for (const item of bloc.items)
          questions.push({
            question: item.accroche.trim(),
            reponse: item.texte,
          });
      } else if (questions.length > 0) {
        suite.push(bloc);
      } else {
        intro.push(bloc);
      }
    }
    if (questions.length > 0)
      faq = { titre: groupe.titre, intro, questions, suite };
    else corps.push(groupe);
  }

  corps.forEach((section, i) => {
    section.numero = String(i + 1).padStart(2, "0");
  });

  /* Les cartes du corps sont les pages filles. Ce qui reste comme lien interne
     ailleurs devient « Pages liées », comme dans la maquette : les cibles déjà
     en carte et `/contact/` en sont écartées. */
  const dejaEnCarte = new Set();
  let cartes = 0;
  for (const section of [...corps, ...(faq ? [faq] : [])]) {
    for (const bloc of section.blocs ?? section.intro ?? []) {
      if (bloc.type === "liste" && bloc.items.every(estCarte))
        for (const item of bloc.items) {
          const m = item.accroche.trim().match(/\((\/[^)]*)\)/);
          if (m) {
            dejaEnCarte.add(m[1]);
            cartes += 1;
          }
        }
    }
  }

  const vus = new Set();
  const liens = [];
  const exclus = (url) =>
    dejaEnCarte.has(url) ||
    /^\/contact\//.test(url) ||
    url === "/" ||
    url === page.url;
  const parcours = (bloc) => {
    if (bloc.type === "paragraphe" || bloc.type === "citation")
      releve(`${bloc.accroche ?? ""} ${bloc.texte}`, liens, vus, exclus);
    if (bloc.type === "liste")
      for (const item of bloc.items)
        releve(`${item.accroche ?? ""} ${item.texte}`, liens, vus, exclus);
    if (bloc.type === "tableau")
      for (const ligne of bloc.lignes)
        for (const cellule of ligne) releve(cellule, liens, vus, exclus);
  };
  for (const bloc of chapeau) releve(bloc.texte, liens, vus, exclus);
  for (const section of corps) section.blocs.forEach(parcours);
  if (faq) {
    faq.intro.forEach(parcours);
    for (const q of faq.questions) releve(q.reponse, liens, vus, exclus);
    faq.suite.forEach(parcours);
  }

  /* Le compteur du héros n'existe que sous `/ressources/` : la maquette l'écrit
     suivi de « ressources dans cette rubrique », et cette phrase serait fausse
     partout ailleurs. */
  const compteur = /^\/ressources\//.test(page.url) && cartes > 0 ? cartes : undefined;

  return {
    gabarit: "sousRubrique",
    pastille: PASTILLES[`/${page.url.split("/")[1]}/`],
    chapeau: chapeau.length > 0 ? chapeau : undefined,
    compteur,
    corps: corps.map((s) => ({
      id: s.id,
      numero: s.numero,
      titre: s.titre,
      blocs: s.blocs,
    })),
    faq,
    liens: liens.length > 0 ? liens : undefined,
  };
}

/* ------------------------------------------------------------------ marche */

mkdirSync(SORTIE, { recursive: true });

const vente = JSON.parse(readFileSync(VENTE, "utf8"));
const editorial = JSON.parse(readFileSync(EDITORIAL, "utf8"));
const parUrl = new Map();
for (const page of [...vente, ...editorial]) parUrl.set(page.url, page);

const manquantes = [...HUBS, ...SOUS_RUBRIQUES].filter((u) => !parUrl.has(u));
if (manquantes.length > 0) {
  console.error(`corpus introuvable pour : ${manquantes.join(", ")}`);
  process.exit(1);
}

let ecrits = 0;
for (const [urls, produit, maquette] of [
  [HUBS, produitHub, "maquette/gabarit-10-hub-de-rubrique.html"],
  [SOUS_RUBRIQUES, produitSousRubrique, "maquette/gabarit-11-sous-rubrique.html"],
]) {
  for (const url of urls) {
    const page = normalise(parUrl.get(url));
    const contenu = produit(page);
    const fichier = join(SORTIE, `${aplati(url)}.json`);
    writeFileSync(
      fichier,
      `${JSON.stringify(
        {
          url,
          source: `dessin : ${maquette}. texte : ${page.fichier}, via scripts/produit_hub.mjs.`,
          contenu,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    ecrits += 1;
    console.log(`${url} -> ${aplati(url)}.json`);
  }
}

console.log(`${ecrits} page(s) de rubrique écrite(s) dans ${SORTIE}`);
