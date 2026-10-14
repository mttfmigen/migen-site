/**
 * Contrôle du tiroir tactile contre la maquette mobile du colis du 14/10, sans
 * navigateur.
 *
 *   bun components/site/verification-tiroir.tsx
 *   bun components/site/verification-tiroir.tsx --controle   (témoins d'échec)
 *
 * LA RÉFÉRENCE est le tableau `GROUPS` de
 * `maquette/colis-14-10/MigenMobile.dc.html`, RELU À CHAQUE EXÉCUTION, jamais
 * recopié. Si la maquette est ré-exportée, le contrôle refuse l'écart.
 *
 * CE QU'IL TIENT :
 * 1. Les cinq groupes de `TIROIR` : titres, lignes grises, libellés, cibles et
 *    ordre mot pour mot ceux de la maquette, après les adaptations déclarées
 *    ci-dessous, chacune revérifiée.
 * 2. ZÉRO LIEN MORT : chaque cible est dans l'index des pages, dans les routes
 *    statiques lues sur le disque, ou dans les réécritures de `next.config.ts`.
 * 3. REPLIER, JAMAIS RETIRER : le tiroir rendu FERMÉ porte tous ses liens dans
 *    le DOM, ses groupes sont des `<details>` exclusifs, le premier ouvert.
 * 4. Les titres et lignes grises des groupes sont rendus.
 *
 * `--controle` prouve que chaque règle sait échouer, reconnue à son message.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import TiroirMobile from "@/components/site/TiroirMobile";
import {
  type SectionTiroir,
  TELEPHONE_SITE,
  TIROIR,
} from "@/components/site/entete-donnees";

const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------ l'inventaire */

const index: { url: string; h1?: string }[] = JSON.parse(
  readFileSync("maquette/contenu/site/index.json", "utf8"),
);

/** Les routes statiques de `app/`, lues sur le disque, jamais écrites à la
 *  main (même lecture que `verification-entete.tsx`). */
function routesStatiques(dossier = "app", prefixe = "/"): string[] {
  const trouvees: string[] = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (!entree.isDirectory()) continue;
    if (entree.name === "api") continue;
    if (entree.name.startsWith("[")) continue;
    if (entree.name.startsWith("(")) {
      trouvees.push(...routesStatiques(`${dossier}/${entree.name}`, prefixe));
      continue;
    }
    const chemin = `${dossier}/${entree.name}`;
    const url = `${prefixe}${entree.name}/`;
    if (existsSync(`${chemin}/page.tsx`)) trouvees.push(url);
    trouvees.push(...routesStatiques(chemin, url));
  }
  return trouvees;
}

const statiques = routesStatiques();
const reecrites = [
  ...readFileSync("next.config.ts", "utf8").matchAll(
    /source:\s*"(\/[^":]+)\/:[^"]*"/g,
  ),
].map((m) => `${m[1]}/`);
const connues = new Set<string>([
  "/",
  ...index.map((entree) => entree.url),
  ...statiques,
  ...reecrites,
]);
assert.ok(statiques.length >= 12, `routes statiques mal lues : ${statiques.length}`);
assert.ok(connues.size >= 248, `inventaire trop court : ${connues.size}`);

/** Le chemin d'une cible, sans son ancre (`/carriere/#postuler`). */
const chemin = (href: string) => href.split("#")[0];

function exigeLiensConnus(sections: readonly SectionTiroir[]): string[] {
  const cibles = sections.flatMap((section) => section.liens.map((l) => l.href));
  for (const cible of cibles) {
    assert.ok(
      connues.has(chemin(cible)),
      `lien du tiroir hors de l'index des pages : ${cible} (ni page de ` +
        "l'index, ni route statique, ni réécriture)",
    );
    assert.ok(
      chemin(cible).endsWith("/"),
      `cible du tiroir sans slash final : ${cible}`,
    );
  }
  return cibles;
}

/* ----------------------------------------- la maquette, relue puis adaptée */

const dc = readFileSync("maquette/colis-14-10/MigenMobile.dc.html", "utf8");

/**
 * Les cibles de la maquette rapportées au site, déclarées ici et dans
 * `entete-donnees.ts`. Une cible qui n'est pas une adresse (« browse »,
 * « contact ») ouvre un écran du prototype : elle est rapportée à la page qui
 * porte le même contenu.
 */
const ADAPTATIONS: Record<string, string> = {
  "/bureau-etudes/": "/offres/bureau-etudes/",
  browse: "/plan-du-site/",
  contact: "/carriere/#postuler",
};

/** Les écrans du prototype sans page sur le site : l'entrée sort du tiroir. */
const SANS_PAGE = new Set(["process"]);

// Chaque adaptation est revérifiée : la cible existe ; pour une adresse, la
// source sert le même h1 que la cible (sinon l'adaptation change de page).
const h1De = (url: string) => index.find((e) => e.url === url)?.h1;
for (const [source, cible] of Object.entries(ADAPTATIONS)) {
  assert.ok(connues.has(chemin(cible)), `adaptation vers une route inconnue : ${cible}`);
  if (source.startsWith("/")) {
    assert.equal(
      h1De(source),
      h1De(cible),
      `${source} et ${cible} ne servent plus la même page : retirer l'adaptation`,
    );
  }
}

/** Le tableau `GROUPS` de la maquette, adaptations appliquées. */
function menuAttendu(): SectionTiroir[] {
  const debut = dc.indexOf("const GROUPS = [");
  const fin = dc.indexOf("\n    ];", debut);
  assert.ok(debut > 0 && fin > debut, "tableau GROUPS introuvable dans la maquette");
  const bloc = dc.slice(debut, fin);
  const groupes = [
    ...bloc.matchAll(/\{ l: "([^"]+)", d: "([^"]+)", items: \[(.*?)\] \}/g),
  ];
  assert.equal(groupes.length, 5, "la maquette ne déclare plus cinq groupes");
  return groupes.map(([, libelle, description, items]) => ({
    libelle,
    description,
    liens: [...items.matchAll(/\["([^"]+)", "([^"]+)"\]/g)]
      .filter(([, , cible]) => !SANS_PAGE.has(cible))
      .map(([, l, cible]) => ({ libelle: l, href: ADAPTATIONS[cible] ?? cible })),
  }));
}

const attendu = menuAttendu();

/* -------------------------------------------------- 1 · les données, mot à mot */

function exigeConformeALaMaquette(sections: readonly SectionTiroir[]): void {
  assert.deepEqual(
    sections,
    attendu,
    "TIROIR dérive du tableau GROUPS de la maquette mobile (titre, ligne " +
      "grise, libellé, cible ou ordre)",
  );
}

exigeConformeALaMaquette(TIROIR);

/* ------------------------------------------------------- 2 · zéro lien mort */

const cibles = exigeLiensConnus(TIROIR);

/* ------------------------------------- 3 et 4 · le rendu, replié mais entier */

// Le menu FERMÉ : c'est l'état de la page servie, celui que Google lit.
const rendu = renderToStaticMarkup(
  <TiroirMobile
    ouvert={false}
    landingPage={false}
    onFermer={() => {}}
    telephone={TELEPHONE_SITE}
    hrefCta="/contact/"
    libelleCta="Décrire mon besoin"
  />,
);
assert.ok(/^<div hidden="">/.test(rendu), "le menu fermé doit porter hidden, sinon il s'affiche");

const sansSlash = (c: string) => (c.length > 1 && c.endsWith("/") ? c.slice(0, -1) : c);

/** REPLIER, JAMAIS RETIRER : chaque cible est dans le DOM rendu, groupes
 *  fermés compris, et chaque groupe est un `<details>` exclusif. */
function exigeToutDansLeDom(html: string): void {
  const dansLeDom = new Set(
    [...html.matchAll(/href="([^"]*)"/g)].map((m) => {
      const [c, ancre] = m[1].split("#");
      return ancre ? `${sansSlash(c)}#${ancre}` : sansSlash(c);
    }),
  );
  for (const cible of cibles) {
    const [c, ancre] = cible.split("#");
    const attendue = ancre ? `${sansSlash(c)}#${ancre}` : sansSlash(c);
    assert.ok(
      dansLeDom.has(attendue) || dansLeDom.has(attendue.replace(/^(\/[^#]*)#/, "$1/#")),
      `lien du tiroir absent du DOM rendu : ${cible}. La règle de la ` +
        "maquette mobile est « replier, jamais retirer ».",
    );
  }
  const groupes = html.match(/<details\b[^>]*>/g) ?? [];
  assert.equal(groupes.length, TIROIR.length, "chaque groupe du tiroir doit être un <details> natif");
  groupes.forEach((groupe, rang) => {
    assert.ok(
      groupe.includes('name="mg-tiroir-groupes"'),
      "un groupe du tiroir a perdu son name : l'accordéon exclusif de la maquette",
    );
    assert.equal(
      /\bopen=""/.test(groupe),
      rang === 0,
      "seul le premier groupe est ouvert d'emblée (`menuGrp: 0` de la maquette)",
    );
  });
}

exigeToutDansLeDom(rendu);

/** Titre et ligne grise de chaque groupe, dans sa bascule. */
function exigeTitresRendus(html: string): void {
  const bascules = [...html.matchAll(/<summary[\s\S]*?<\/summary>/g)].map((m) => m[0]);
  assert.equal(bascules.length, TIROIR.length, "une bascule de groupe manque");
  TIROIR.forEach((section, rang) => {
    assert.ok(
      bascules[rang].includes(`>${section.libelle}<`) &&
        bascules[rang].includes(`>${section.description}<`),
      `la bascule ${rang} ne porte plus « ${section.libelle} » et sa ligne grise`,
    );
  });
}

exigeTitresRendus(rendu);

/* ------------------------------------------------------------- les témoins */

if (CONTROLE) {
  // 1 · un lien vers une page absente de l'index doit tomber.
  const falsifie: SectionTiroir[] = TIROIR.map((section, rang) =>
    rang === 0
      ? { ...section, liens: [{ libelle: "x", href: "/page-inventee/" }, ...section.liens] }
      : section,
  );
  assert.throws(
    () => exigeLiensConnus(falsifie),
    /hors de l'index des pages : \/page-inventee\//,
    "le contrôle des liens laisse passer une page hors index",
  );

  // 2 · un lien retiré du DOM rendu doit tomber.
  const sansAlternance = rendu.replace(/<a[^>]*href="\/carriere\/alternance[^>]*>[\s\S]*?<\/a>/, "");
  assert.notEqual(sansAlternance, rendu, "témoin mal construit : rien retiré");
  assert.throws(
    () => exigeToutDansLeDom(sansAlternance),
    /absent du DOM rendu : \/carriere\/alternance\//,
    "le contrôle du DOM laisse passer un lien retiré d'un groupe replié",
  );

  // 3 · une ligne grise retirée du rendu doit tomber.
  const sansLigne = rendu.replace(`>${TIROIR[1].description}<`, "><");
  assert.throws(
    () => exigeTitresRendus(sansLigne),
    /ligne grise/,
    "le contrôle des bascules laisse passer une ligne grise retirée",
  );

  // 4 · un libellé qui dérive de la maquette doit tomber.
  const derive: SectionTiroir[] = TIROIR.map((section, rang) =>
    rang === 4
      ? { ...section, liens: section.liens.map((l, i) => (i === 0 ? { ...l, libelle: "Rejoindre migen" } : l)) }
      : section,
  );
  assert.throws(
    () => exigeConformeALaMaquette(derive),
    /dérive du tableau GROUPS/,
    "le contrôle de conformité laisse passer un libellé réécrit",
  );
}

console.log(
  `tiroir vérifié contre la maquette mobile du 14/10 : ${TIROIR.length} groupes, ` +
    `${cibles.length} liens, tous dans l'inventaire (${connues.size} adresses) ; ` +
    `${Object.keys(ADAPTATIONS).length} adaptations et ${SANS_PAGE.size} entrée sans page ` +
    "déclarées ; groupes en <details> exclusifs, liens dans le DOM replié, " +
    "titres et lignes grises rendus" +
    (CONTROLE ? " ; 4 témoins d'échec tombés." : "."),
);
