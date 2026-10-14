/**
 * Le menu « Ressources » de l'en-tête (panneau du bureau et groupe du tiroir)
 * ne mène qu'à la maquette Ressources v2, et dit ce que dit le hub.
 *
 *   bun scripts/verifie-menu-ressources.mjs
 *   bun scripts/verifie-menu-ressources.mjs --controle   (contrôle positif)
 *   bun scripts/verifie-menu-ressources.mjs --en-ligne   (codes HTTP)
 *
 * `bun` et non `node` : la porte importe les données et REND le panneau tel
 * que le site le sert, plutôt que d'en relire le texte à l'expression
 * régulière.
 *
 * POURQUOI ELLE EXISTE. Signalé par Mehdi le 14/10 : « dans le menu ressources
 * il y a plein de trucs type articles etc. qui renvoient vers d'autres pages
 * ressources hors maquette, de l'ancienne maquette qui ne devrait plus
 * exister ». Le panneau menait aux cinq sous-rubriques de l'ancienne maquette
 * (dont quatre formats en pause) et le tiroir à deux guides.
 *
 * CE QU'ELLE TIENT :
 *   1. ZÉRO LIEN HORS RESSOURCES V2. Chaque lien du panneau rendu et du
 *      groupe Ressources du tiroir mène au hub /ressources/ ou à un contenu du
 *      hub (`donnees.ts`). Les formats en pause (fiches pratiques, fiches
 *      techniques, livres blancs, process) sont nommés et refusés à part.
 *   2. LES VRAIS COMPTES. Les espaces et leurs formats valent ceux du hub :
 *      libellés de `FORMATS` (filtrage.ts), dans son ordre, formats publiés
 *      seulement, et nombre de contenus recompté dans `donnees.ts`.
 *   3. LA UNE DU HUB. Titre, photo, format, durée et adresse des trois cartes
 *      valent la liste `UNE` de `HubRessources.tsx`, dans son ordre.
 *   4. LE RENDU. Le panneau rendu porte chaque compte, chaque carte et le lien
 *      « Toutes les ressources → » ; aucun compte n'est écrit en dur.
 *   5. Slash final, libellé de /carriere/ (« Rejoindre migen », 12/10), et
 *      interdits de copie (mots du contrat, tirets cadratin et demi-cadratin).
 *
 * ELLE SAIT ÉCHOUER : `--controle` rejoue chaque vérification sur des données
 * fautives et exige que LA RÈGLE VISÉE tombe, reconnue à son message.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const chemin = (relatif) => new URL(relatif, new URL("..", import.meta.url));

const donnees = await import(String(chemin("components/site/entete-donnees.ts")));
const { RES_ESPACES, RES_A_LA_UNE, NAV_CARRIERE, TIROIR } = donnees;
const { default: PanneauRessources } = await import(
  String(chemin("components/site/megamenu/Ressources.tsx"))
);

/* ------------------------------- le hub /ressources/ (maquette Ressources v2) */

const hubDonnees = await import(String(chemin("components/site/ressources-hub/v2/donnees.ts")));
const hubFiltrage = await import(String(chemin("components/site/ressources-hub/v2/filtrage.ts")));
const hubSource = readFileSync(chemin("components/site/ressources-hub/v2/HubRessources.tsx"), "utf8");
const urlsUne = [...(hubSource.match(/const UNE = \[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
  (m) => m[1],
);

const CONTENUS = {
  ent: hubDonnees.CONTENUS_ENTREPRISES,
  tech: hubDonnees.CONTENUS_TECHNICIENS,
};
/** Libellé de chaque espace, tel que la colonne de filtres du hub l'écrit. */
const NOMS = { ent: "Entreprises", tech: "Techniciens" };
const colonne = readFileSync(chemin("components/site/ressources-hub/v2/ColonneFiltres.tsx"), "utf8");
for (const nom of Object.values(NOMS)) {
  assert.ok(new RegExp(`>\\s*${nom}\\s*<`).test(colonne), `le hub n'écrit plus l'espace « ${nom} »`);
}

const HUB = {
  /** Les espaces, leurs formats publiés dans l'ordre de `FORMATS`, comptés. */
  espaces: Object.entries(NOMS).map(([cle, libelle]) => ({
    libelle,
    formats: hubFiltrage.FORMATS[cle]
      .filter(([format]) => format !== "all")
      .map(([format, libelleFormat]) => ({
        libelle: libelleFormat,
        nombre: CONTENUS[cle].filter((x) => x.format === format).length,
      }))
      .filter((format) => format.nombre > 0),
  })),
  une: urlsUne.map((url) => CONTENUS.ent.find((x) => x.url === url)),
  /** Les adresses de la maquette Ressources v2 : le hub et ses contenus. */
  adresses: new Set(["/ressources/", ...CONTENUS.ent.map((x) => x.url), ...CONTENUS.tech.map((x) => x.url)]),
};
assert.ok(HUB.adresses.size >= 28, `contenus du hub mal lus : ${HUB.adresses.size}`);

const PANNEAU = renderToStaticMarkup(createElement(PanneauRessources));
const GROUPE_TIROIR = TIROIR.find((groupe) => groupe.libelle === "Ressources");
assert.ok(GROUPE_TIROIR, "le tiroir n'a plus de groupe Ressources");

/* ------------------------------------------------------------- les interdits */

/** Interdits de rédaction du contrat (CLAUDE.md §9) et de la mission du 14/10. */
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
  "en savoir plus",
];
const EN_PAUSE = /^\/ressources\/(fiches-pratiques|fiches-techniques|livres-blancs|process)\//;

/** Le texte visible d'un rendu, balises retirées. */
const texte = (html) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

/* ------------------------------------------------------------ la vérification */

function defauts({ espaces, une, panneau, tiroir, carriere, hub }) {
  const trouves = [];
  const dit = (message) => trouves.push(message);

  // 1. Zéro lien hors Ressources v2, dans le panneau rendu et dans le tiroir.
  const liensPanneau = [...panneau.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const liensTiroir = tiroir.entrees.filter((e) => e.type === "lien").map((e) => e.href);
  for (const [ou, liens] of [["panneau", liensPanneau], ["tiroir", liensTiroir]]) {
    if (liens.length === 0) dit(`le ${ou} Ressources ne porte aucun lien.`);
    for (const href of liens) {
      const canonique = href.endsWith("/") ? href : `${href}/`;
      if (EN_PAUSE.test(canonique)) {
        dit(`${ou} : lien vers un format en pause, ${href}.`);
      } else if (!hub.adresses.has(canonique)) {
        dit(`${ou} : lien hors de la maquette Ressources v2, ${href}.`);
      }
    }
  }
  if (!liensPanneau.some((href) => href.replace(/\/?$/, "/") === "/ressources/")) {
    dit("le panneau ne mène plus au hub /ressources/.");
  }
  if (!liensTiroir.includes("/ressources/")) {
    dit("le tiroir ne mène plus au hub /ressources/.");
  }

  // 2. Les vrais comptes du hub, espace par espace, format par format.
  const lis = (liste) =>
    liste.map((e) => `${e.libelle} : ${e.formats.map((f) => `${f.nombre} ${f.libelle}`).join(", ")}`).join(" | ");
  if (lis(espaces) !== lis(hub.espaces)) {
    dit(`les espaces du panneau disent « ${lis(espaces)} », le hub compte « ${lis(hub.espaces)} ».`);
  }

  // 3. La une du hub, carte pour carte.
  if (hub.une.length !== 3 || hub.une.some((x) => !x)) {
    dit("la une du hub est illisible : liste UNE introuvable ou article inconnu.");
  } else {
    const attendue = hub.une.map((x) => `${x.titre} | ${x.format} | ${x.minutes} | ${x.url} | ${x.photo}`);
    const servie = une.map((x) => `${x.libelle} | ${x.format} | ${x.minutes} | ${x.href} | ${x.image}`);
    if (servie.join("\n") !== attendue.join("\n")) {
      dit(`« À la une » du panneau diffère du hub :\n  servi   ${servie.join("\n          ")}\n  attendu ${attendue.join("\n          ")}`);
    }
  }

  // 4. Le rendu porte ce que disent les données, et le lien vers le hub.
  const visible = texte(panneau).replace(/\s+/g, " ");
  // 14/10, Mehdi : « masque pour le moment les catégories ». Les espaces et
  // leurs comptes ne sont plus rendus dans le panneau : leurs données restent
  // contrôlées plus haut (comptes recomptés dans le hub), mais aucun compte
  // ne doit réapparaître dans le rendu tant que la décision tient.
  for (const espace of espaces) {
    for (const format of espace.formats) {
      // Sans casse : l'ancien bloc écrivait « 7 fiches métiers » en minuscules.
      if (new RegExp(`\\b${format.nombre} ${format.libelle}\\b`, "i").test(visible)) {
        dit(`la catégorie « ${format.nombre} ${format.libelle} » est de nouveau rendue, masquée par Mehdi le 14/10.`);
      }
    }
  }
  for (const article of une) {
    if (!visible.includes(article.libelle)) dit(`la carte « ${article.libelle} » n'est pas rendue.`);
    if (!visible.includes(`${article.minutes} min de lecture`)) {
      dit(`la durée de « ${article.libelle} » n'est pas rendue.`);
    }
  }
  if (!visible.includes("Accéder à toutes nos ressources")) {
    dit("le bouton « Accéder à toutes nos ressources » n'est plus rendu.");
  }

  // 5. Slash final, libellé de carrière, interdits de copie.
  for (const lien of [...une, ...tiroir.entrees.filter((e) => e.type === "lien"), carriere]) {
    if (!lien.href.endsWith("/")) dit(`cible sans slash final : ${lien.href}`);
  }
  if (carriere.href !== "/carriere/" || carriere.libelle !== "Rejoindre migen") {
    dit(`l'entrée de carrière est « ${carriere.libelle} » vers ${carriere.href}, Mehdi a demandé « Rejoindre migen » vers /carriere/ le 12/10.`);
  }
  const copie = [
    visible,
    ...tiroir.entrees.map((e) => `${e.libelle} ${e.description ?? ""}`),
  ].join(" ");
  if (/[—–]/.test(copie)) dit("tiret cadratin ou demi-cadratin dans la copie visible.");
  for (const mot of MOTS_INTERDITS) {
    if (copie.toLowerCase().includes(mot)) dit(`mot interdit « ${mot} » dans le menu Ressources.`);
  }

  return trouves;
}

const CAS_REEL = {
  espaces: RES_ESPACES,
  une: RES_A_LA_UNE,
  panneau: PANNEAU,
  tiroir: GROUPE_TIROIR,
  carriere: NAV_CARRIERE,
  hub: HUB,
};

/* ------------------------------------------- contrôle positif, avant le reste */

const avecLienTiroir = (cas, href) => ({
  ...cas,
  tiroir: { ...cas.tiroir, entrees: [...cas.tiroir.entrees, { type: "lien", libelle: "x", href }] },
});

const TEMOINS = [
  [
    "un lien du tiroir vers un format en pause",
    /format en pause/,
    (cas) => avecLienTiroir(cas, "/ressources/fiches-pratiques/"),
  ],
  [
    "un lien du panneau vers l'ancienne sous-rubrique Articles",
    /panneau : lien hors de la maquette Ressources v2/,
    (cas) => ({ ...cas, panneau: `${cas.panneau}<a href="/ressources/articles/">Articles</a>` }),
  ],
  [
    "un guide de l'ancienne maquette dans le tiroir",
    /tiroir : lien hors de la maquette Ressources v2/,
    (cas) => avecLienTiroir(cas, "/guides/reussir-un-transfert-industriel/"),
  ],
  [
    "un compte faux",
    /le hub compte/,
    (cas) => ({
      ...cas,
      espaces: cas.espaces.map((e, rang) =>
        rang === 0 ? { ...e, formats: [{ ...e.formats[0], nombre: 14 }] } : e,
      ),
    }),
  ],
  [
    "un format en pause annoncé dans un espace",
    /le hub compte/,
    (cas) => ({
      ...cas,
      espaces: cas.espaces.map((e, rang) =>
        rang === 0 ? { ...e, formats: [...e.formats, { libelle: "Process", nombre: 4 }] } : e,
      ),
    }),
  ],
  [
    "une durée « À la une » qui dérive du hub",
    /diffère du hub/,
    (cas) => ({ ...cas, une: cas.une.map((x, rang) => (rang === 0 ? { ...x, minutes: 12 } : x)) }),
  ],
  [
    "une catégorie de nouveau rendue",
    /de nouveau rendue/,
    (cas) => ({ ...cas, panneau: `${cas.panneau}<span>7 fiches métiers</span>` }),
  ],
  [
    "le bouton vers le hub retiré du panneau",
    /Accéder à toutes nos ressources/,
    (cas) => ({ ...cas, panneau: cas.panneau.replace("Accéder à toutes nos ressources", "Tout") }),
  ],
  [
    "une cible qui perd son slash final",
    /sans slash final/,
    (cas) => ({ ...cas, une: cas.une.map((x, rang) => (rang === 0 ? { ...x, href: x.href.slice(0, -1) } : x)) }),
  ],
  [
    "le libellé de carrière revenu à « Carrière »",
    /Rejoindre migen/,
    (cas) => ({ ...cas, carriere: { ...cas.carriere, libelle: "Carrière" } }),
  ],
  [
    "un tiret demi-cadratin dans une description du tiroir",
    /demi-cadratin/,
    (cas) => ({
      ...cas,
      tiroir: {
        ...cas.tiroir,
        entrees: cas.tiroir.entrees.map((e) => (e.type === "lien" ? { ...e, description: "Article – 11 min" } : e)),
      },
    }),
  ],
  [
    "un mot interdit dans le panneau",
    /mot interdit/,
    (cas) => ({ ...cas, panneau: `${cas.panneau}<span>En savoir plus</span>` }),
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
  const cibles = new Set([
    "/ressources/",
    ...RES_A_LA_UNE.map((article) => article.href),
    ...GROUPE_TIROIR.entrees.filter((e) => e.type === "lien").map((e) => e.href),
  ]);
  let fautes = 0;
  for (const cible of cibles) {
    const reponse = await fetch(`${BASE}${cible}`, { redirect: "manual" });
    if (reponse.status !== 200) fautes += 1;
    console.log(`  ${reponse.status}  ${cible}`);
  }
  assert.equal(fautes, 0, `${fautes} cible(s) du menu Ressources ne répondent pas 200.`);
}

console.log(
  `menu Ressources vérifié : ${RES_ESPACES.map((e) => `${e.libelle} (${e.formats.map((f) => `${f.nombre} ${f.libelle.toLowerCase()}`).join(", ")})`).join(", ")}, ` +
    `${RES_A_LA_UNE.length} articles à la une, ${HUB.adresses.size} adresses Ressources v2 admises ; ` +
    `${TEMOINS.length} témoins d’échec passés.`,
);
