/**
 * Contrôle du gabarit ÉTUDE DE CAS, sans navigateur.
 *
 *   bun components/site/preuve/verification-preuve.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/preuves--suez-remise-en-etat.html` et
 * `maquette/rendu/preuves--danone-lignes-de-production.html` (pages pilotes,
 * 10 sections chacune, relevées le 07/10). Méthode reprise de
 * `components/site/offre/verification-offre.tsx`.
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *
 * 1. LES VALEURS DES CAPTURES SONT RELUES DANS LE FICHIER à chaque exécution :
 *    chaque dessin et chaque copie sont d'abord vérifiés PRÉSENTS dans la
 *    capture de la page, puis dans son rendu.
 * 2. CHAQUE CHAÎNE DE LA DONNÉE (relais JSON) EXISTE DANS LA CAPTURE : une
 *    copie retapée, résumée ou inventée fait tomber le contrôle. C'est le
 *    « mot pour mot » du contrat, vérifié mécaniquement.
 * 3. LA PAGE RÉELLE est rendue depuis sa vraie donnée,
 *    `supabase/import/gabarits-maquette/preuves-<slug>.json`.
 * 4. UN SEUL H1, aucun `href="#"`, les cibles du maillage de la capture.
 * 5. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`.
 * 6. LES INTERDITS DE COPIE du contrat sont absents du rendu, tiret cadratin
 *    compris.
 * 7. UNE SECTION SANS DONNÉE NE SE REND PAS.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuPreuve } from "@/types/preuve";

import PagePreuve from "./PagePreuve";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ----------------------------------------------------- outils de comparaison
   Repris de verification-offre.tsx : capture = sérialisation du DOM, rendu =
   déclaration compacte de React. Même valeur, deux écritures. */

function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|’/g, "'")
    // Les entités que la capture ET le rendu de React écrivent pour le texte
    // brut : « R&D » se compare en clair des deux côtés.
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/* ------------------------------------------------------------- les interdits */

const INTERDITS = [
  "—",
  "cinq agences",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "+200",
] as const;

function verifieInterdits(page: string, nom: string): void {
  const visible = texteLisible(page).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

/* ------------------------------------------- une page pilote, de bout en bout */

interface PageRelais {
  url: string;
  titre_h1: string;
  contenu: ContenuPreuve;
}

/** Toutes les chaînes d'une donnée, feuilles du JSON. Les `href` en sont
 *  exclus : la capture les porte en attribut, pas dans son texte lisible. */
function chainesDe(valeur: unknown, cle?: string): string[] {
  if (typeof valeur === "string") return cle === "href" || cle === "gabarit" ? [] : [valeur];
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chainesDe(v));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) => chainesDe(v, k));
  }
  return [];
}

function controlePilote(slug: string, copiesFixes: readonly string[]): string {
  const nom = `preuves-${slug}`;
  const capture = readFileSync(
    join(RACINE, "maquette", "rendu", `preuves--${slug}.html`),
    "utf8",
  );
  const captureTexte = texteLisible(capture);
  const captureStyle = normaliseStyle(capture);

  const page = JSON.parse(
    readFileSync(join(DOSSIER, `${nom}.json`), "utf8"),
  ) as PageRelais;

  assert.equal(page.url, `/preuves/${slug}/`, `${nom} : URL du relais`);
  assert.equal(
    page.contenu.gabarit,
    "etude-de-cas",
    `${nom} : le contenu doit se déclarer « etude-de-cas », sinon la route retombe sur un autre gabarit`,
  );

  /* Le H1 du relais est celui que la capture REND (champ h1Rendu du relevé). */
  const releve = JSON.parse(
    readFileSync(join(RACINE, "maquette", "rendu", `preuves--${slug}.json`), "utf8"),
  ) as { h1Rendu: string; nbSections: number };
  assert.equal(
    page.titre_h1,
    releve.h1Rendu,
    `${nom} : le relais doit porter le H1 rendu par la capture`,
  );

  const rendu = renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
    />,
  );
  const renduTexte = texteLisible(rendu);
  const renduStyle = normaliseStyle(rendu);

  /* 1 · chaque chaîne de la donnée vient de la capture, et se rend. */
  for (const chaine of chainesDe(page.contenu).concat(page.titre_h1)) {
    const attendu = normaliseTexte(chaine);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie « ${chaine} » : donnée inventée ou retapée`,
    );
    assert.ok(
      renduTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie « ${chaine} »`,
    );
  }

  /* 2 · les copies fixes du gabarit, dans la capture puis dans le rendu. */
  for (const texte of copiesFixes) {
    const attendu = normaliseTexte(texte);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie fixe « ${texte} »`,
    );
    assert.ok(
      renduTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie fixe « ${texte} »`,
    );
  }

  /* 3 · la fidélité du dessin, une valeur porteuse par section, relevée dans
     la capture de la page. */
  for (const fragment of [
    // 0 · héros : la grille, le H1 à 66px, le cadre photo de 480px.
    "grid-template-columns: 1.08fr 0.92fr",
    "clamp(38px,4.6vw,66px)",
    "height: 480px",
    // 1 · chiffres : le rythme de la section, la valeur à 19px.
    "padding: 88px 40px 0px",
    "font: 600 calc(19px * var(--ts))/1.3 var(--ft)",
    // 2 · situation : la grille .72/1.28, la carte d'objectif.
    "grid-template-columns: minmax(0px, 0.72fr) minmax(0px, 1.28fr)",
    "grid-template-columns: 40px minmax(0px, 1fr)",
    // 3 · réponse : le bento et sa carte sombre.
    "grid-template-columns: repeat(3, minmax(0px, 1fr))",
    "min-height: 220px",
    // 4 · déroulé : le rail orange.
    "linear-gradient(90deg,var(--acc),rgba(255,124,60,.15))",
    // 5 · dispositif : la grille photo/table et la ligne du tableau.
    "grid-template-columns: 0.85fr 1.15fr",
    "grid-template-columns: minmax(120px, 0.42fr) minmax(0px, 1fr)",
    // 6 · résultat : le panneau sombre et la coche.
    "padding: 60px 56px",
    "border-top: 2px solid var(--acc)",
    // 7 · complément : la grille auto-fit.
    "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
    // 8 · besoin : l'ancre défilée et la grille 1fr 1fr.
    "scroll-margin-top: 100px",
    "grid-template-columns: 1fr 1fr",
    // 9 · plus loin : la grille auto-fill et la vignette de 150px.
    "repeat(auto-fill, minmax(260px, 1fr))",
    "height: 150px",
  ]) {
    const attendu = normaliseStyle(fragment);
    assert.ok(
      captureStyle.includes(attendu),
      `${nom} : la capture ne porte pas le dessin « ${fragment} » : valeur à revérifier`,
    );
    assert.ok(
      renduStyle.includes(attendu),
      `${nom} : le rendu ne porte pas le dessin de la capture « ${fragment} »`,
    );
  }

  /* 4 · un seul h1, l'ancre du formulaire, aucune cible morte. */
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(
    !/href="#"/.test(rendu),
    `${nom} : aucun href="#", la maquette navigue par script, le site par ancres réelles`,
  );
  assert.ok(
    rendu.includes('href="#cas-form"') && rendu.includes('id="cas-form"'),
    `${nom} : l'appel à l'action du héros vise l'ancre du formulaire`,
  );
  assert.ok(
    rendu.includes('href="tel:+33478337205"'),
    `${nom} : le bouton téléphone de la capture`,
  );
  for (const lien of page.contenu.plusLoin ?? []) {
    const sans = lien.href.replace(/\/$/, "");
    assert.ok(
      rendu.includes(`href="${sans}/"`) || rendu.includes(`href="${sans}"`),
      `${nom} : le maillage de la capture vise ${lien.href} : lien absent du rendu`,
    );
  }

  /* 5 · aucun échafaudage Tailwind de couleur. */
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
        classe[1],
      ),
      `${nom} : classe Tailwind de couleur dans le rendu : « ${classe[1]} »`,
    );
    assert.ok(
      !/\bdark:/.test(classe[1]),
      `${nom} : variante dark: dans le rendu : « ${classe[1]} »`,
    );
  }

  /* 6 · les interdits du contrat. */
  verifieInterdits(rendu, nom);

  /* 7 · aucune photo inventée : la capture ne nomme aucun fichier, le rendu ne
     doit porter AUCUN <img> (trou déclaré, cadre nu). */
  assert.ok(
    !/<img[\s>]/.test(rendu),
    `${nom} : un <img> est rendu alors que la capture ne nomme aucun fichier`,
  );

  return rendu;
}

/* ------------------------------------------------- les deux pages pilotes */

controlePilote("suez-remise-en-etat", [
  "Étude de cas",
  "SUEZ IWT",
  "01 · La situation",
  "Les objectifs posés",
  "02 · Notre réponse",
  "Ce que nous avons mis en place",
  "03 · Étape par étape",
  "Le déroulé",
  "04 · Fiche mission",
  "Le dispositif",
  "05 · Résultat",
  "Le résultat",
  "Votre besoin",
  "Poser mon besoin de renfort technique",
  "Pour aller plus loin",
  "04 78 33 72 05",
]);

controlePilote("danone-lignes-de-production", [
  "Étude de cas",
  "DANONE (BLÉDINA)",
  "01 · La situation",
  "Les objectifs posés",
  "02 · Notre réponse",
  "Ce que nous avons mis en place",
  "03 · Étape par étape",
  "Le déroulé",
  "04 · Fiche mission",
  "Le dispositif",
  "05 · Résultat",
  "Le résultat",
  "Votre besoin",
  "Demander un renfort de maintenance",
  "Pour aller plus loin",
  "04 78 33 72 05",
]);

/* -------------------- une section sans donnée ne se rend pas */

const VIDE: ContenuPreuve = {
  gabarit: "etude-de-cas",
  client: "Client de contrôle",
  chapeau: [],
  bouton: "Bouton de contrôle",
};
const renduVide = renderToStaticMarkup(
  <PagePreuve titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);
assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
for (const absent of [
  "Les objectifs posés",
  "01 · La situation",
  "Ce que nous avons mis en place",
  "Le déroulé",
  "Le dispositif",
  "05 · Résultat",
  "Votre besoin", // sans `besoinTitre`, ni section ni formulaire
  "Pour aller plus loin",
]) {
  assert.ok(
    !texteLisible(renduVide).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

/* -------------------- toutes les pages du gabarit 02, porte BLOQUANTE.

   LA LISTE SE DÉDUIT DE L'INDEX DE LA MAQUETTE, jamais d'un nombre figé ni
   d'un filtre de préfixe : mêmes raisons, déjà payées, que l'étape 8 de
   verification-offre.tsx. Chaque page est rendue depuis sa vraie donnée et
   repasse les contrôles des pilotes, SAUF le relevé de dessin (propre aux deux
   captures étudiées section par section) : ici, chaque chaîne de la donnée est
   vérifiée dans la capture DE LA page, puis dans son rendu. */

const INDEX_MAQUETTE = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
) as { url: string; gabarit?: string }[];
const URLS_GABARIT_02 = INDEX_MAQUETTE.filter((p) =>
  (p.gabarit ?? "").startsWith("02"),
).map((p) => p.url);

assert.ok(
  URLS_GABARIT_02.length > 0,
  "l'index de la maquette ne déclare aucune page au gabarit 02 : index illisible ou champ renommé",
);

/**
 * Les pages du gabarit DÉLIBÉRÉMENT non portées, chacune avec sa raison.
 *
 * `/preuves/tournaire/` : le H1 rendu par la capture est « Maintenir des
 * machines conçues sur mesure », et « sur mesure » est un interdit du contrat
 * (CLAUDE.md §9). Un H1 ne se retire pas et ne se reformule pas (un synonyme
 * est une faute) : la page attend l'arbitrage de Mehdi, soit corriger la
 * maquette, soit admettre l'usage littéral. La porte ci-dessous EXIGE que la
 * page reste absente tant que l'exception est déclarée : le jour où elle est
 * portée, cette entrée doit être retirée en même temps.
 */
const EXCLUES = ["/preuves/tournaire/"];

const { readdirSync } = await import("node:fs");
const surDisque = new Set(readdirSync(DOSSIER).filter((n) => n.endsWith(".json")));
const manquantes = URLS_GABARIT_02.filter(
  (url) => !surDisque.has(`${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`),
);
assert.deepEqual(
  manquantes.sort(),
  [...EXCLUES].sort(),
  `pages du gabarit 02 sans fichier de données dans ${DOSSIER}, hors exclusions déclarées : ${manquantes.join(", ")}`,
);

for (const url of URLS_GABARIT_02.filter((u) => !EXCLUES.includes(u))) {
  const slug = url.replace(/^\/preuves\/|\/$/g, "");
  const nom = `preuves-${slug}`;
  const capture = readFileSync(
    join(RACINE, "maquette", "rendu", `preuves--${slug}.html`),
    "utf8",
  );
  const captureTexte = texteLisible(capture);
  const page = JSON.parse(
    readFileSync(join(DOSSIER, `${nom}.json`), "utf8"),
  ) as PageRelais;

  assert.equal(page.contenu.gabarit, "etude-de-cas", `${nom} : discriminant`);

  const html = renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
    />,
  );
  const htmlTexte = texteLisible(html);

  for (const chaine of chainesDe(page.contenu).concat(page.titre_h1)) {
    const attendu = normaliseTexte(chaine);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie « ${chaine} » : donnée inventée ou retapée`,
    );
    assert.ok(
      htmlTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie « ${chaine} »`,
    );
  }

  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(html), `${nom} : un href="#" est rendu`);
  assert.ok(
    !/<img[\s>]/.test(html),
    `${nom} : un <img> est rendu alors que la capture ne nomme aucun fichier`,
  );
  verifieInterdits(html, nom);
}

console.log("gabarit étude de cas : toutes les vérifications passent.");
console.log(
  `  2 pages pilotes rendues contre leurs captures section par section, ` +
    `${INTERDITS.length} interdits vérifiés absents.`,
);
console.log(
  `  gabarit 02 : ${URLS_GABARIT_02.length} pages à l'index, ${
    URLS_GABARIT_02.length - EXCLUES.length
  } portées et rendues contre leur capture, ${EXCLUES.length} exclue déclarée (${EXCLUES.join(", ")}).`,
);
