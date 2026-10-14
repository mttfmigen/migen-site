/**
 * Le panneau « Ressources » de l'en-tête annonce ce qu'il sert.
 *
 *   bun scripts/verifie-menu-ressources.mjs
 *   bun scripts/verifie-menu-ressources.mjs --controle   (contrôle positif)
 *   bun scripts/verifie-menu-ressources.mjs --en-ligne   (codes HTTP de prod)
 *
 * `bun` et non `node` : la porte importe les données telles que le site les
 * rend (`components/site/entete-donnees.ts`) plutôt que d'en relire le texte à
 * l'expression régulière. Une porte qui devine le contenu d'un tableau finit
 * par se tromper en même temps que lui.
 *
 * POURQUOI ELLE EXISTE. Signalé par Mehdi le 12/10 : « dans le menu le bloc
 * ressources ne va pas. Fiche métiers, cela renvoie vers migen recrutement,
 * mais pour la partie ressources c'est pas ce à quoi on s'attend », et « quand
 * je clique sur le truc 23 RESSOURCES ça me renvoie vers guide de maintenance
 * industrielle ». Deux défauts d'une même nature : le panneau annonçait un
 * inventaire qui n'était pas le sien.
 *
 * TROIS CHOSES SE RELÂCHENT SANS BRUIT, et c'est ce que la porte tient :
 *   1. UNE CIBLE QUI SORT DES RESSOURCES. « Fiches métier » menait à
 *      `/carriere/` : une rangée de la colonne « Par format » qui envoyait au
 *      recrutement. Le panneau ne doit mener que sous `/ressources/`.
 *   2. UNE FAMILLE SANS PORTE. Le panneau n'exposait que 3 des 5
 *      sous-rubriques servies : Process et Livres blancs n'étaient atteignables
 *      depuis aucun menu. Les cinq familles de l'index doivent y être, chacune
 *      une fois.
 *   3. UN COMPTE QUI DÉRIVE. Les numéros venaient de la maquette (04, 07, 07,
 *      et « Les 23 ressources ») et décrivaient SA bibliothèque, pas le site.
 *      Chaque numéro doit valoir le nombre réel de pages de sa famille, et le
 *      total annoncé la somme des cinq.
 *
 * LA RÉFÉRENCE DES COMPTES est `maquette/contenu/site/index.json`, l'index des
 * 248 pages du client, celui qui attribue son gabarit à chaque page (CLAUDE.md
 * §16). Une ressource y est une page à trois segments sous `/ressources/`, par
 * exemple `/ressources/articles/gmao/` ; les hubs (`/ressources/`) et les
 * sous-rubriques (`/ressources/articles/`) n'en sont pas.
 *
 * ELLE SAIT ÉCHOUER : `--controle` rejoue chaque vérification sur des données
 * fautives et exige que LA RÈGLE VISÉE tombe, reconnue à son message. Neuf
 * témoins.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const chemin = (relatif) => new URL(relatif, new URL("..", import.meta.url));

const donnees = await import(String(chemin("components/site/entete-donnees.ts")));
const { RES_FORMATS, RES_SITUATIONS, NAV_CARRIERE, TOTAL_RESSOURCES, RES_A_LA_UNE } = donnees;

/* ------------------------------- le hub /ressources/ (maquette Ressources v2) */

/**
 * DEPUIS LE 14/10, le panneau dit ce que dit le hub : l'ordre de ses formats
 * côté Entreprises (`FORMATS.ent`), le compte de ses articles, et sa une (liste
 * `UNE` de `HubRessources.tsx`, titre, durée et photo de `donnees.ts`). Tout
 * est relu dans le code du hub à chaque exécution, rien n'est recopié ici.
 */
const hubDonnees = await import(String(chemin("components/site/ressources-hub/v2/donnees.ts")));
const hubFiltrage = await import(String(chemin("components/site/ressources-hub/v2/filtrage.ts")));
const hubSource = readFileSync(
  new URL("components/site/ressources-hub/v2/HubRessources.tsx", chemin(".")),
  "utf8",
);
const urlsUne = [...(hubSource.match(/const UNE = \[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
  (m) => m[1],
);
const HUB = {
  /** Libellés des formats Entreprises du hub, « Tout » excepté, dans son ordre. */
  formats: hubFiltrage.FORMATS.ent.filter(([cle]) => cle !== "all").map(([, libelle]) => libelle),
  articles: hubDonnees.CONTENUS_ENTREPRISES.filter((x) => x.format === "Article").length,
  une: urlsUne.map((url) => hubDonnees.CONTENUS_ENTREPRISES.find((x) => x.url === url)),
};

/**
 * Les commentaires sont retirés avant tout jugement sur la copie : le premier
 * jet de cette porte refusait le panneau à cause du commentaire qui CITE
 * « Les 23 ressources » de la maquette pour l'expliquer. Une porte doit juger
 * ce qui s'affiche, pas ce qui se raconte à côté.
 */
const sansCommentaires = (source) =>
  source.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

const PANNEAU = sansCommentaires(
  readFileSync(
    new URL("components/site/megamenu/Ressources.tsx", chemin(".")),
    "utf8",
  ),
);

/* -------------------------------------------------- l'index du client, compté */

const index = JSON.parse(
  readFileSync(new URL("maquette/contenu/site/index.json", chemin(".")), "utf8"),
);
const PAGES = Array.isArray(index) ? index : index.pages;

/** Familles réelles : sous-rubrique de l'index, et nombre de ses ressources. */
function famillesReelles() {
  const comptes = new Map();
  for (const page of PAGES) {
    const url = page.url ?? "";
    if (!url.startsWith("/ressources/")) continue;
    const segments = url.split("/").filter(Boolean);
    if (segments.length === 2) {
      // `/ressources/articles/` : la sous-rubrique elle-même.
      if (!comptes.has(url)) comptes.set(url, 0);
    } else if (segments.length === 3) {
      const famille = `/${segments[0]}/${segments[1]}/`;
      comptes.set(famille, (comptes.get(famille) ?? 0) + 1);
    }
  }
  return comptes;
}

const REELLES = famillesReelles();

/* ------------------------------------------------------------- les interdits */

/** Interdits de rédaction du contrat (CLAUDE.md §9) et le tiret cadratin. */
const MOTS_INTERDITS = [
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "levier",
  "clé en main",
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
];

/* ------------------------------------------------------------ la vérification */

/**
 * Rend la liste des défauts. Zéro défaut vaut succès : c'est cette fonction
 * que le contrôle positif rejoue sur des données abîmées.
 *
 * @param {object} cas
 * @param {Array} cas.formats      le tableau RES_FORMATS à juger
 * @param {Array} cas.situations   le tableau RES_SITUATIONS à juger
 * @param {object} cas.carriere    l'entrée NAV_CARRIERE à juger
 * @param {string} cas.panneau     la source du composant du panneau
 * @param {Map} cas.reelles        familles réelles et leurs comptes
 */
function defauts({ formats, situations, carriere, panneau, reelles, une, hub }) {
  const trouves = [];
  const dit = (message) => trouves.push(message);

  // 1. Le panneau « Par format » ne mène que sous /ressources/.
  for (const format of formats) {
    if (!format.href.startsWith("/ressources/")) {
      dit(
        `« ${format.libelle} » sort des ressources : ${format.href}. La colonne ` +
          `« Par format » annonce des ressources, elle doit y mener.`,
      );
    }
  }

  // 2. Les cinq familles de l'index, chacune une fois, et aucune inventée.
  const exposees = formats.map((format) => format.href);
  for (const famille of reelles.keys()) {
    if (!exposees.includes(famille)) {
      dit(`famille servie mais absente du panneau : ${famille}`);
    }
  }
  for (const href of exposees) {
    if (href.startsWith("/ressources/") && !reelles.has(href)) {
      dit(`famille annoncée par le panneau mais inconnue de l'index : ${href}`);
    }
  }
  const doublons = exposees.filter((href, rang) => exposees.indexOf(href) !== rang);
  for (const href of new Set(doublons)) {
    dit(`famille exposée deux fois dans le panneau : ${href}`);
  }

  // 3. Chaque numéro vaut le compte réel de sa famille.
  for (const format of formats) {
    const reel = reelles.get(format.href);
    if (reel === undefined) continue; // déjà signalé en 2.
    if (!/^\d{2}$/.test(format.numero)) {
      dit(
        `« ${format.libelle} » : numéro « ${format.numero} » hors forme, deux ` +
          `chiffres attendus comme dans la maquette.`,
      );
      continue;
    }
    if (Number(format.numero) !== reel) {
      dit(
        `« ${format.libelle} » annonce ${format.numero} ressources, l'index en ` +
          `porte ${reel} (${format.href}).`,
      );
    }
  }

  // 4. Le total annoncé est la somme, et il est calculé, pas écrit.
  const somme = formats.reduce((cumul, format) => cumul + Number(format.numero), 0);
  const attendu = [...reelles.values()].reduce((cumul, n) => cumul + n, 0);
  if (somme !== attendu) {
    dit(`la somme des familles du panneau vaut ${somme}, l'index en porte ${attendu}.`);
  }
  const ecrit = panneau.match(/Les\s+(\d+)\s+ressources/);
  if (ecrit) {
    dit(
      `le pied du panneau écrit « Les ${ecrit[1]} ressources » en dur : ce compte ` +
        `dérive du jour où une famille bouge, il doit être calculé.`,
    );
  }
  if (!/Les \{TOTAL_RESSOURCES\} ressources/.test(panneau)) {
    dit("le pied du panneau n'affiche plus TOTAL_RESSOURCES.");
  }

  // 5. Le libellé de /carriere/ dans la barre : « Carrière », celui de la
  //    barre du colis du 14/10, tranché par Mehdi le 14/10 (il remplace
  //    « Rejoindre migen » du 12/10).
  if (carriere.href !== "/carriere/") {
    dit(`l'entrée de carrière ne mène plus à /carriere/ : ${carriere.href}`);
  }
  if (carriere.libelle !== "Carrière") {
    dit(
      `l'entrée de carrière est libellée « ${carriere.libelle} », la barre du ` +
        `colis du 14/10 écrit « Carrière ».`,
    );
  }

  // 6. Slash final partout, sans quoi chaque clic part en redirection.
  for (const lien of [...formats, ...situations, carriere]) {
    if (!lien.href.endsWith("/")) {
      dit(`cible sans slash final : ${lien.href}`);
    }
  }

  // 8. Le panneau dit ce que dit le hub /ressources/.
  const ordre = formats.map((format) => format.libelle).join(" · ");
  if (ordre !== hub.formats.join(" · ")) {
    dit(`formats du panneau « ${ordre} », le hub écrit « ${hub.formats.join(" · ")} ».`);
  }
  const articles = formats.find((format) => format.libelle === "Articles");
  if (articles && Number(articles.numero) !== hub.articles) {
    dit(`le panneau annonce ${articles.numero} articles, le hub en montre ${hub.articles}.`);
  }
  if (hub.une.length !== 3 || hub.une.some((x) => !x)) {
    dit("la une du hub est illisible : liste UNE introuvable ou article inconnu.");
  } else {
    const attendue = hub.une.map((x) => `${x.titre} | ${x.minutes} min de lecture | ${x.url} | ${x.photo}`);
    const servie = une.map((x) => `${x.libelle} | ${x.description} | ${x.href} | ${x.image}`);
    if (servie.join("\n") !== attendue.join("\n")) {
      dit(`« À la une » du panneau diffère du hub :\n  servi   ${servie.join("\n          ")}\n  attendu ${attendue.join("\n          ")}`);
    }
  }

  // 7. Les interdits de copie, dans les libellés comme dans les descriptions.
  for (const lien of [...formats, ...situations, carriere, ...une]) {
    const texte = `${lien.libelle} ${lien.description ?? ""}`;
    if (texte.includes("—")) {
      dit(`tiret cadratin dans « ${lien.libelle} », interdit dans la copie visible.`);
    }
    for (const mot of MOTS_INTERDITS) {
      if (texte.toLowerCase().includes(mot)) {
        dit(`mot interdit « ${mot} » dans « ${lien.libelle} ».`);
      }
    }
  }

  return trouves;
}

const CAS_REEL = {
  formats: RES_FORMATS,
  situations: RES_SITUATIONS,
  carriere: NAV_CARRIERE,
  panneau: PANNEAU,
  reelles: REELLES,
  une: RES_A_LA_UNE,
  hub: HUB,
};

/* ------------------------------------------- contrôle positif, avant le reste */

/**
 * Chaque témoin abîme UNE règle et doit faire tomber CETTE règle, reconnue à
 * son message. Se contenter de « la porte a dit quelque chose » laisse passer
 * une règle morte dont une voisine couvrait le cas : c'est arrivé ici au
 * premier jet, le témoin du slash final tombait sur la règle des familles.
 */
const TEMOINS = [
  [
    "une rangée de format qui mène au recrutement",
    /sort des ressources/,
    (cas) => ({
      ...cas,
      formats: [
        ...cas.formats,
        { numero: "07", libelle: "Fiches métier", description: "x", href: "/carriere/" },
      ],
    }),
  ],
  [
    "une famille servie retirée du panneau",
    /absente du panneau/,
    (cas) => ({ ...cas, formats: cas.formats.slice(1) }),
  ],
  [
    "une famille inventée, inconnue de l'index",
    /inconnue de l'index/,
    (cas) => ({
      ...cas,
      formats: [
        ...cas.formats,
        { numero: "03", libelle: "Fiches métier", description: "x", href: "/ressources/fiches-metier/" },
      ],
    }),
  ],
  [
    "un numéro faux",
    /annonce 04 ressources/,
    (cas) => ({
      ...cas,
      formats: cas.formats.map((format, rang) =>
        rang === 0 ? { ...format, numero: "04" } : format,
      ),
    }),
  ],
  [
    "un total écrit en dur dans le panneau",
    /en dur/,
    (cas) => ({
      ...cas,
      panneau: cas.panneau.replace(
        "Les {TOTAL_RESSOURCES} ressources",
        "Les 23 ressources",
      ),
    }),
  ],
  [
    "le libellé de carrière revenu à « Rejoindre migen »",
    /écrit « Carrière »/,
    (cas) => ({ ...cas, carriere: { ...cas.carriere, libelle: "Rejoindre migen" } }),
  ],
  [
    "une situation qui perd son slash final",
    /sans slash final/,
    (cas) => ({
      ...cas,
      situations: cas.situations.map((lien, rang) =>
        rang === 0 ? { ...lien, href: lien.href.slice(0, -1) } : lien,
      ),
    }),
  ],
  [
    "un tiret cadratin dans une description",
    /tiret cadratin/,
    (cas) => ({
      ...cas,
      formats: cas.formats.map((format, rang) =>
        rang === 0 ? { ...format, description: "Gestes — seuils" } : format,
      ),
    }),
  ],
  [
    "deux formats intervertis par rapport au hub",
    /le hub écrit/,
    (cas) => ({ ...cas, formats: [cas.formats[1], cas.formats[0], ...cas.formats.slice(2)] }),
  ],
  [
    "une durée « À la une » qui dérive du hub",
    /diffère du hub/,
    (cas) => ({
      ...cas,
      une: cas.une.map((x, rang) => (rang === 0 ? { ...x, description: "12 min de lecture" } : x)),
    }),
  ],
  [
    "un mot interdit dans une description",
    /mot interdit/,
    (cas) => ({
      ...cas,
      formats: cas.formats.map((format, rang) =>
        rang === 0 ? { ...format, description: "Des fiches sur mesure" } : format,
      ),
    }),
  ],
];

const refus = TEMOINS.map(([nom, motif, abime]) => {
  const trouves = defauts(abime(CAS_REEL));
  const vise = trouves.find((message) => motif.test(message));
  assert.ok(
    vise,
    `LA PORTE EST AVEUGLE sur ${nom} : aucun message ne correspond à ${motif}. ` +
      `Elle a dit : ${trouves.join(" | ") || "rien"}`,
  );
  return [nom, vise];
});

if (process.argv.includes("--controle")) {
  console.log(`contrôle positif : ${TEMOINS.length} témoins, tous refusés.`);
  for (const [nom, message] of refus) {
    console.log(`  refusé : ${nom}`);
    console.log(`           ${message}`);
  }
  process.exit(0);
}

/* ------------------------------------------------------- la vraie vérification */

const trouves = defauts(CAS_REEL);
if (trouves.length > 0) {
  for (const message of trouves) console.error(`DÉFAUT  ${message}`);
  process.exit(1);
}

/* ------------------------- en ligne, sur demande : les cibles répondent 200 */

if (process.argv.includes("--en-ligne")) {
  const BASE = process.env.BASE_SITE ?? "https://migen-site.vercel.app";
  const cibles = [
    ...RES_FORMATS.map((format) => format.href),
    ...RES_SITUATIONS.map((lien) => lien.href),
    ...RES_A_LA_UNE.map((article) => article.href),
    NAV_CARRIERE.href,
    "/ressources/",
  ];
  let fautes = 0;
  for (const cible of new Set(cibles)) {
    const reponse = await fetch(`${BASE}${cible}`, { redirect: "manual" });
    const verdict = reponse.status === 200 ? "200" : String(reponse.status);
    if (reponse.status !== 200) fautes += 1;
    console.log(`  ${verdict}  ${cible}`);
  }
  assert.equal(fautes, 0, `${fautes} cible(s) du panneau ne répondent pas 200.`);
}

const familles = [...REELLES.entries()]
  .map(([href, compte]) => `${href.split("/")[2]}=${compte}`)
  .join(", ");
console.log(
  `panneau Ressources vérifié : ${RES_FORMATS.length} familles, ` +
    `${TOTAL_RESSOURCES} ressources annoncées et comptées (${familles}) ; ` +
    `${TEMOINS.length} témoins d’échec passés ; racine ${RACINE}`,
);
