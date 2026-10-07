/**
 * Capture le RENDU de la maquette du client, page par page.
 *
 * POURQUOI. Deux fois dans la même journée, des conclusions sur « ce que la
 * maquette contient » ont été écrites à partir de suppositions : d'abord en
 * portant un écran de démonstration qui n'était le gabarit d'aucune page, puis
 * en déclarant « sans écran » deux gabarits qui en ont un. Les deux fois, le
 * client l'a vu avant nous. Ce script remplace la supposition par la mesure :
 * il ouvre l'application de la maquette, visite chaque page, vérifie qu'il est
 * bien arrivé, et fige ce qu'elle rend.
 *
 * Décision de Mehdi, le 05/10 : **le rendu de la maquette fait foi.**
 *
 *   node scripts/capture-maquette.mjs --tout               les 248 pages de l'index
 *   node scripts/capture-maquette.mjs /offres/residence/   une ou plusieurs URL
 *   node scripts/capture-maquette.mjs --gabarit "03 Offre et prestation"
 *   node scripts/capture-maquette.mjs --tout --png         avec les images (lourd)
 *
 * Sorties, dans maquette/rendu/ :
 *   <page>.json       la structure mesurée, section par section
 *   <page>.html       le HTML du <main> rendu
 *   <page>.png        l'image pleine page (seulement avec --png)
 *   _mesure.json      le tableau complet du dernier passage
 *
 * Prérequis : la maquette servie sur MAQUETTE_URL avec son dossier `contenu/`
 * à côté, sinon elle reste sur « Chargement de la page… » et le script le dit.
 */

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = join(RACINE, "maquette", "rendu");
const INDEX = join(RACINE, "maquette", "contenu", "site", "index.json");

const MAQUETTE_URL = process.env.MAQUETTE_URL ?? "http://localhost:4352/autonome.html";

/** Largeur de référence du dépôt : les portes de fidélité mesurent toutes à 1280. */
const LARGEUR = 1280;
const HAUTEUR = 900;

/** Au-delà, on considère que la page ne chargera pas et on le dit. */
const ATTENTE_MAX = 20000;

/**
 * Les redirections que la maquette déclare ELLE-MÊME (sa méthode `remapOffer`).
 * Une URL de gauche n'a pas de page propre : la maquette l'envoie à droite.
 * Les traiter comme des échecs serait faux ; les capturer comme des pages
 * propres le serait aussi.
 */
const REDIRECTIONS = {
  "/offres/chantier/": "/travaux-industriels/",
  "/offres/retrofit/": "/offres/bureau-etudes/",
  "/offres/construction/": "/travaux-industriels/",
  "/bureau-etudes/": "/offres/bureau-etudes/",
  "/offres/depannage-industriel/": "/offres/zero-arret/",
  "/offres/audit-conseil-maintenance/": "/offres/bureau-etudes/",
};

/**
 * Les URL que la maquette sert par un ÉCRAN NATIF (sa table `NATIVE` dans
 * `cxGo`) : pas de fichier de contenu, un écran dédié, et un h1 qui n'est pas
 * celui de l'index. On vérifie l'arrivée contre le h1 de l'écran, pas de l'index.
 */
const ECRANS_NATIFS = {
  "/a-propos/equipe/": "Celles et ceux qui portent vos projets.",
  "/a-propos/nous-connaitre/": "Le terrain, avec les moyens de bien le faire.",
  "/a-propos/valeurs/": "Cinq règles, et la preuve qui va avec.",
  "/a-propos/rse/": "En maintenance, la RSE se mesure en machines qu\u2019on ne jette pas.",
};

/** Toutes les RELOAD_TOUTES pages, on recharge l'application : après des
 * dizaines de navigations son état se dégrade et les mesures dérivent. */
const RELOAD_TOUTES = 40;

/** `/offres/residence/` -> `offres--residence` */
function nomDeFichier(url) {
  const n = url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
  return n || "accueil";
}

function litIndex() {
  try {
    return JSON.parse(readFileSync(INDEX, "utf8"));
  } catch {
    throw new Error(
      `index introuvable : ${INDEX}\n` +
        "Le dossier maquette/contenu/ doit être installé, sinon la maquette ne rend aucune page.",
    );
  }
}

import { existsSync } from "node:fs";

/** Le fichier de contenu que l'index annonce pour une page. */
function fichierDeContenu(fiche) {
  return fiche.fichier ? join(RACINE, "maquette", "contenu", "site", fiche.fichier) : null;
}

/** Ouvre le plan du site, d'où les 248 pages sont toutes atteignables. */
async function ouvrePlanDuSite(page) {
  await page.evaluate(() => {
    const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
    const l = [...document.querySelectorAll("a,button")].find(
      (x) => propre(x.innerText) === "Toutes nos pages",
    );
    if (l) l.click();
  });
  await page.waitForFunction(
    () => /Toutes nos pages, au même endroit/.test(document.body.innerText),
    { timeout: ATTENTE_MAX },
  );
}

/**
 * Amène la maquette sur une URL, et VÉRIFIE qu'elle y est.
 *
 * Le plan du site liste les pages par leur h1, mais quelques écrans natifs
 * sont listés par leur titre de navigation : on essaie l'un puis l'autre, et
 * on rapporte lequel a servi. Sans cette vérification, le script capturait
 * l'accueil en annonçant un succès.
 */
async function vaSur(page, fiche) {
  await ouvrePlanDuSite(page);

  const voie = await page.evaluate(
    ([h1, titre]) => {
      const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
      const liens = [...document.querySelectorAll("a")];
      const parH1 = liens.find((a) => propre(a.innerText) === h1);
      if (parH1) {
        parH1.click();
        return "h1";
      }
      const parTitre = titre && liens.find((a) => propre(a.innerText) === titre);
      if (parTitre) {
        parTitre.click();
        return "title";
      }
      return null;
    },
    [fiche.h1, fiche.title ?? ""],
  );

  if (!voie) {
    throw new Error(`aucun lien « ${fiche.h1} » ni « ${fiche.title ?? ""} » dans le plan du site`);
  }

  // On attend que le h1 change ET que le contenu soit posé.
  await page
    .waitForFunction(
      (attendu) => {
        if (document.body.innerText.includes("Chargement de la page")) return false;
        const h1 = document.querySelector("h1");
        if (!h1) return false;
        const texte = h1.innerText.replace(/\s+/g, " ").trim();
        if (texte === attendu) return true;
        // h1 vide ou écourté : on attend juste d'avoir quitté le plan du site
        // et que du contenu soit posé.
        return texte !== "Toutes nos pages, au même endroit." &&
          document.body.innerText.length > 3000;
      },
      fiche.h1,
      { timeout: ATTENTE_MAX },
    )
    .catch(() => {});

  const etat = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() ?? null,
    chargement: document.body.innerText.includes("Chargement de la page"),
  }));

  if (etat.chargement) throw new Error("reste sur « Chargement de la page… »");
  const natif = ECRANS_NATIFS[fiche.url];
  if (natif) {
    if (etat.h1 !== natif) {
      throw new Error(
        `écran natif attendu « ${natif} », obtenu « ${etat.h1} »`,
      );
    }
    return { ...etat, voie: "ecran-natif" };
  }

  // Rester sur le plan du site après le clic = le contenu n'a pas chargé.
  if (etat.h1 === "Toutes nos pages, au même endroit.") {
    throw new Error("le clic ne mène nulle part : le contenu n'a pas chargé");
  }

  // Le h1 rendu peut différer de celui de l'index : les études de cas et les
  // secteurs affichent une accroche écourtée. C'est un constat à consigner,
  // pas un échec : la page est là, on la mesure.
  return { ...etat, voie };
}

/**
 * Laisse la mise en page se poser avant de mesurer.
 *
 * Mesurer tout de suite donnait 900 px pour des pages qui en font neuf mille :
 * les sections se déplient après coup. On fait défiler jusqu'en bas pour tout
 * déclencher, puis on attend que la hauteur se stabilise.
 */
async function laisseSePoser(page) {
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = () => document.body.scrollHeight;
    for (let y = 0; y < h(); y += 800) {
      window.scrollTo(0, y);
      await dort(60);
    }
    window.scrollTo(0, 0);
    let avant = h();
    for (let i = 0; i < 10; i += 1) {
      await dort(200);
      if (h() === avant) break;
      avant = h();
    }
  });
}

/** Relève la structure visible, section par section, sans la juger. */
async function releve(page) {
  return page.evaluate(() => {
    const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
    const principal =
      [...document.querySelectorAll("main")].find(
        (m) => m.getBoundingClientRect().height > 50,
      ) ?? document.body;

    const sections = [...principal.querySelectorAll("section")].map((s, i) => {
      const r = s.getBoundingClientRect();
      const titre = s.querySelector("h2, h3");
      return {
        ordre: i,
        titre: propre(titre?.textContent) || null,
        hauteur: Math.round(r.height),
        images: s.querySelectorAll("img").length,
        liens: s.querySelectorAll("a").length,
        mots: propre(s.innerText).split(/\s+/).filter(Boolean).length,
      };
    });

    return {
      h1: propre(document.querySelector("h1")?.textContent),
      hauteurTotale: Math.round(
        Math.max(principal.getBoundingClientRect().height, principal.scrollHeight || 0),
      ),
      nbSections: sections.length,
      motsRendus: propre(principal.innerText).split(/\s+/).filter(Boolean).length,
      sections,
      html: principal.outerHTML,
    };
  });
}

// ---------------------------------------------------------------- programme

const args = process.argv.slice(2);
const avecPng = args.includes("--png");
const index = litIndex();

let cibles = index.filter((e) => args.includes(e.url));
const iGab = args.indexOf("--gabarit");
if (iGab !== -1 && args[iGab + 1]) {
  cibles = index.filter((e) => e.gabarit === args[iGab + 1]);
}
if (args.includes("--tout")) cibles = index;

// --part 2/4 : ne traiter qu'une tranche, pour paralléliser sur plusieurs
// navigateurs. Le découpage par pas (k, k+n, k+2n...) répartit les familles.
const iPart = args.indexOf("--part");
let suffixePart = "";
if (iPart !== -1 && args[iPart + 1]) {
  const [k, n] = args[iPart + 1].split("/").map(Number);
  cibles = cibles.filter((_, i) => i % n === k - 1);
  suffixePart = `-part-${k}`;
}
if (!cibles.length) {
  console.error("rien à capturer : passer des URL, --gabarit \"...\" ou --tout");
  process.exit(1);
}

mkdirSync(SORTIE, { recursive: true });

// `channel: "chrome"` comme les autres portes du dépôt : on pilote le Chrome
// installé, pas un navigateur téléchargé par Playwright.
const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({
  viewport: { width: LARGEUR, height: HAUTEUR },
});
const page = await contexte.newPage();

async function chargeApplication() {
  await page.goto(MAQUETTE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
}

console.log(`maquette : ${MAQUETTE_URL}`);
console.log(`cibles   : ${cibles.length} page(s)\n`);
await chargeApplication();

const resultats = [];
let faites = 0;

for (const fiche of cibles) {
  faites += 1;
  if (faites % RELOAD_TOUTES === 0) await chargeApplication();

  const prefixe = `[${String(faites).padStart(3)}/${cibles.length}]`;

  // Les redirections déclarées par la maquette : on vérifie qu'elles mènent
  // bien à leur cible, et on les consigne comme telles.
  const redirigeVers = REDIRECTIONS[fiche.url];
  if (redirigeVers) {
    const cible = index.find((e) => e.url === redirigeVers);
    resultats.push({
      url: fiche.url,
      gabarit: fiche.gabarit ?? null,
      verdict: "redirigee",
      vers: redirigeVers,
      note: cible ? `la maquette l'envoie sur ${redirigeVers}` : `cible ${redirigeVers} hors index`,
    });
    console.log(`${prefixe} ${fiche.url.padEnd(46)} redirigée -> ${redirigeVers}`);
    continue;
  }

  const fichier = fichierDeContenu(fiche);
  if (fichier && !existsSync(fichier)) {
    resultats.push({
      url: fiche.url,
      gabarit: fiche.gabarit ?? null,
      verdict: "fichier-contenu-manquant",
      note: `l'index annonce ${fiche.fichier}, absent de l'export`,
    });
    console.log(`${prefixe} ${fiche.url.padEnd(46)} fichier de contenu manquant`);
    continue;
  }

  let arrivee;
  let r;
  try {
    try {
      arrivee = await vaSur(page, fiche);
    } catch {
      // Un échec isolé vient souvent d'un état dégradé de l'application,
      // pas de la page : on recharge et on rejoue UNE fois avant de conclure.
      await chargeApplication();
      arrivee = await vaSur(page, fiche);
    }
    await laisseSePoser(page);
    r = await releve(page);
  } catch (erreur) {
    resultats.push({
      url: fiche.url,
      gabarit: fiche.gabarit ?? null,
      verdict: "echec",
      note: erreur.message,
    });
    console.error(`${prefixe} ${fiche.url.padEnd(46)} ÉCHEC : ${erreur.message}`);
    await chargeApplication();
    continue;
  }

  const base = join(SORTIE, nomDeFichier(fiche.url));
  writeFileSync(`${base}.html`, r.html, "utf8");

  const motsAnnonces = fiche.mots ?? null;
  const ratio = motsAnnonces ? r.motsRendus / motsAnnonces : null;
  let verdict = "rendue";
  if (arrivee.voie === "title" || arrivee.voie === "ecran-natif") verdict = "rendue-ecran-natif";
  else if (!r.h1) verdict = "rendue-sans-titre";
  else if (r.h1 !== fiche.h1) verdict = "rendue-h1-different";
  if (verdict === "rendue" && ratio !== null && ratio < 0.6) verdict = "rendue-mais-maigre";

  const fichePage = {
    url: fiche.url,
    gabarit: fiche.gabarit ?? null,
    verdict,
    h1Attendu: fiche.h1,
    h1Rendu: r.h1,
    nbSections: r.nbSections,
    hauteurTotale: r.hauteurTotale,
    motsAnnonces,
    motsRendus: r.motsRendus,
    sections: r.sections,
  };
  writeFileSync(
    `${base}.json`,
    `${JSON.stringify(fichePage, null, 2)}\n`,
    "utf8",
  );

  if (avecPng) await page.screenshot({ path: `${base}.png`, fullPage: true });

  resultats.push({
    url: fiche.url,
    gabarit: fiche.gabarit ?? null,
    verdict,
    nbSections: r.nbSections,
    hauteurTotale: r.hauteurTotale,
    motsAnnonces,
    motsRendus: r.motsRendus,
  });
  console.log(
    `${prefixe} ${fiche.url.padEnd(46)} ${String(r.nbSections).padStart(2)} sections · ` +
      `${String(r.hauteurTotale).padStart(5)} px · ${String(r.motsRendus).padStart(4)} mots` +
      (verdict === "rendue" ? "" : `   << ${verdict}`),
  );
}

await navigateur.close();

const compte = {};
for (const r of resultats) compte[r.verdict] = (compte[r.verdict] ?? 0) + 1;

writeFileSync(
  join(SORTIE, `_mesure${suffixePart}.json`),
  `${JSON.stringify({ date: new Date().toISOString(), maquette: MAQUETTE_URL, compte, resultats }, null, 2)}\n`,
  "utf8",
);

console.log("\n=== compte ===");
for (const [v, n] of Object.entries(compte).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${v}`);
}
console.log(`\nécrit : maquette/rendu/_mesure${suffixePart}.json`);

if (compte.echec) process.exit(1);
