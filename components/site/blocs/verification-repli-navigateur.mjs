#!/usr/bin/env node
/**
 * À 390 PX, LE REPLI RACCOURCIT LA PAGE SANS LUI RETIRER UN MOT.
 *
 *   node components/site/blocs/verification-repli-navigateur.mjs https://migen-site.vercel.app
 *   node components/site/blocs/verification-repli-navigateur.mjs --controle
 *
 * CE QU'ELLE PROUVE, ET POURQUOI ELLE EST ÉCRITE COMME ÇA.
 *
 * Mehdi, le 13/10 : « pourquoi tu baisses le nombre de mots je comprends pas,
 * les mots doivent être là pour le SEO ». La réponse tient en une phrase :
 * Google lit le `textContent`, qui contient le texte d'un `<details>` fermé ;
 * seul l'`innerText`, ce qui est PEINT à l'écran, diminue. Une phrase ne vaut
 * rien tant qu'elle n'est pas mesurée, donc cette porte la mesure.
 *
 * ELLE NE COMPARE PAS DEUX LARGEURS, ET C'EST VOLONTAIRE. Comparer 390 px à
 * 1280 px ne prouverait rien sur la hauteur : un écran étroit rend TOUTES les
 * pages plus hautes, repli ou pas, et le chiffre serait illisible. La porte
 * reste donc à 390 px et compare DEUX ÉTATS DE LA MÊME PAGE :
 *
 *   état REPLIÉ   la page telle que le visiteur la reçoit, après hydratation ;
 *   état DÉPLIÉ   la même, tous les `details[data-pliable-mobile]` forcés
 *                 ouverts, sans rien recharger.
 *
 * Et elle attend trois choses, dont deux opposées :
 *
 *   1. `textContent` du `<main>` IDENTIQUE entre les deux états, caractère
 *      pour caractère. C'est la preuve SEO : replier ne retire rien du DOM.
 *   2. hauteur du document PLUS PETITE en replié. C'est la demande d'origine.
 *   3. `innerText` PLUS COURT en replié. Sans lui, un `<details>` posé mais
 *      jamais refermé passerait les deux premiers.
 *
 * SON PÉRIMÈTRE : `SectionPliableMobile`, de `components/site/blocs/`, qui est
 * le mécanisme de repli de tout le site, monté par une vingtaine de composants
 * des onze gabarits. Elle ne mesure PAS combien de sections manquent encore de
 * repli : c'est le rôle de `scripts/verifie-repli-mobile.mjs` (registre D1), et
 * les sections qui lui manquent appartiennent à d'autres dossiers que celui-ci.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const CONTROLE = args.includes("--controle");
const LARGEUR = 390;

/* ------------------------------------------------------------------ verdicts
 *
 * JS pur, donc éprouvables sur des relevés fabriqués. C'est ce qui permet au
 * témoin de montrer qu'ils savent refuser.
 */

/**
 * LE VERDICT QUI COMPTE : le texte a-t-il quitté le DOM en se repliant.
 *
 * Comparaison sur le `textContent` normalisé (piège n° 3 du dépôt : espaces
 * insécables et apostrophes typographiques). Un écart est refusé dans les deux
 * sens : un texte qui RÉTRÉCIT est la faute visée, un texte qui GRANDIT veut
 * dire que le repli a ajouté de la copie, ce qui n'est pas un repli.
 *
 * MAIS IL FAUT D'ABORD DÉFALQUER LE TEXTE QUI BOUGE TOUT SEUL, et c'est un
 * défaut que cette porte a eu. Première exécution en local, le 14/10 : elle a
 * accusé l'accueil de perdre 2 caractères en se repliant. Faux. L'accueil
 * porte `accueil/BandeauVerbe.tsx`, dont le verbe tourne toutes les 2 200 ms
 * entre « installe », « maintient », « répare » et « dépanne », longs de 8, 9,
 * 6 et 7 lettres. Le verbe avait simplement changé ENTRE les deux relevés.
 * C'est le piège n° 7 du dépôt, écrit pour les pixels des rails animés, et il
 * vaut tout autant pour le texte.
 *
 * D'OÙ LE TROISIÈME RELEVÉ, `replie2`, pris après avoir TOUT REFERMÉ : deux
 * lectures du MÊME état encadrent la lecture de l'autre état. Leur écart est
 * le bruit propre de la page, et seul ce qui le dépasse est imputable au
 * repli. Une page sans animation a un bruit de zéro et la porte reste aussi
 * stricte qu'avant ; une page animée n'est plus accusée à tort, et son bruit
 * est déclaré au lieu d'être absorbé en silence.
 */
export function texteQuiBouge(pages) {
  return pages
    .filter((p) => p.plis > 0)
    .map((p) => {
      const delta = p.replie.texte.length - p.deplie.texte.length;
      /* Le bruit propre : deux lectures du même état, à 900 ms d'écart. */
      const bruit = p.replie2 ? Math.abs(p.replie.texte.length - p.replie2.texte.length) : 0;
      return { url: p.url, delta, bruit, replie: p.replie.texte.length, deplie: p.deplie.texte.length };
    })
    .filter((p) => Math.abs(p.delta) > p.bruit);
}

/** Les pages dont le texte bouge de lui-même : déclaré, jamais absorbé. */
export function pagesAuTexteMouvant(pages) {
  return pages
    .filter((p) => p.replie2 && p.replie.texte !== p.replie2.texte)
    .map((p) => ({
      url: p.url,
      bruit: Math.abs(p.replie.texte.length - p.replie2.texte.length),
    }));
}

/** Les pages que le repli ne raccourcit pas. */
export function pagesQuiNeRaccourcissentPas(pages) {
  return pages
    .filter((p) => p.plis > 0)
    .filter((p) => p.replie.hauteur >= p.deplie.hauteur)
    .map((p) => ({ url: p.url, replie: p.replie.hauteur, deplie: p.deplie.hauteur }));
}

/** Les pages où le repli ne retire rien de l'écran : un pli qui ne plie pas. */
export function plisInoperants(pages) {
  return pages
    .filter((p) => p.plis > 0)
    .filter((p) => p.replie.peint >= p.deplie.peint)
    .map((p) => ({ url: p.url, replie: p.replie.peint, deplie: p.deplie.peint }));
}

/* ------------------------------------------------------------------- témoin */

if (CONTROLE) {
  const bon = {
    url: "/x/",
    plis: 4,
    replie: { texte: "le texte entier", peint: 300, hauteur: 3200 },
    deplie: { texte: "le texte entier", peint: 1800, hauteur: 9000 },
  };
  const EPREUVES = [
    {
      nom: "LE CONTRÔLE NÉGATIF DU LOT : du texte PERDU en repliant fait tomber la porte",
      fait: () =>
        texteQuiBouge([
          {
            ...bon,
            replie: { ...bon.replie, texte: "le texte" },
            replie2: { ...bon.replie, texte: "le texte" },
          },
        ]).length,
      veut: 1,
    },
    {
      nom: "du texte AJOUTÉ par le repli la fait tomber aussi",
      fait: () =>
        texteQuiBouge([
          {
            ...bon,
            replie: { ...bon.replie, texte: "le texte entier et du rab" },
            replie2: { ...bon.replie, texte: "le texte entier et du rab" },
          },
        ]).length,
      veut: 1,
    },
    {
      nom: "une PERTE PLUS GRANDE que le bruit de la page tombe quand même",
      fait: () =>
        texteQuiBouge([
          {
            ...bon,
            /* 15 caractères de moins, pour 2 de bruit : imputable au repli. */
            replie: { ...bon.replie, texte: "le texte" },
            replie2: { ...bon.replie, texte: "le texte.." },
          },
        ]).length,
      veut: 1,
    },
    {
      nom: "une page au texte mouvant est DÉCLARÉE, pas absorbée en silence",
      fait: () =>
        pagesAuTexteMouvant([
          { ...bon, replie2: { ...bon.replie, texte: "le texte entie" } },
        ]).length,
      veut: 1,
    },
    {
      nom: "une page que le repli n'a pas raccourcie est signalée",
      fait: () =>
        pagesQuiNeRaccourcissentPas([
          { ...bon, replie: { ...bon.replie, hauteur: 9000 } },
        ]).length,
      veut: 1,
    },
    {
      nom: "un pli qui ne retire rien de l'écran est signalé",
      fait: () => plisInoperants([{ ...bon, replie: { ...bon.replie, peint: 1800 } }]).length,
      veut: 1,
    },
    /* ------------------------------------------------- contrôles négatifs */
    {
      nom: "NÉGATIF, un relevé conforme ne déclenche rien",
      fait: () =>
        texteQuiBouge([bon]).length +
        pagesQuiNeRaccourcissentPas([bon]).length +
        plisInoperants([bon]).length,
      veut: 0,
    },
    {
      nom: "NÉGATIF, LE DÉFAUT DU 14/10 : le verbe qui tourne n'est plus une accusation",
      fait: () =>
        texteQuiBouge([
          {
            ...bon,
            /* L'accueil : « installe » devenu « répare » entre deux lectures,
               2 caractères d'écart, et le même écart entre les deux lectures
               du même état. Rien n'est imputable au repli. */
            replie: { ...bon.replie, texte: "le texte entier" },
            deplie: { ...bon.deplie, texte: "le texte entie" },
            replie2: { ...bon.replie, texte: "le texte entie" },
          },
        ]).length,
      veut: 0,
    },
    {
      nom: "NÉGATIF, une page stable n'est pas déclarée mouvante",
      fait: () => pagesAuTexteMouvant([{ ...bon, replie2: { ...bon.replie } }]).length,
      veut: 0,
    },
    {
      nom: "NÉGATIF, une page SANS pli n'a rien à prouver",
      fait: () => {
        const sansPli = { ...bon, plis: 0, replie: { ...bon.deplie } };
        return (
          texteQuiBouge([sansPli]).length +
          pagesQuiNeRaccourcissentPas([sansPli]).length +
          plisInoperants([sansPli]).length
        );
      },
      veut: 0,
    },
    {
      nom: "NÉGATIF, aucune page mesurée : aucun verdict",
      fait: () => texteQuiBouge([]).length + pagesQuiNeRaccourcissentPas([]).length,
      veut: 0,
    },
  ];
  let vues = 0;
  for (const e of EPREUVES) {
    const obtenu = e.fait();
    const juste = obtenu === e.veut;
    if (juste) vues += 1;
    console.log(`  ${juste ? "OK   " : "ÉCHEC"}  ${e.nom}`);
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`);
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`);
  process.exit(vues === EPREUVES.length ? 0 : 1);
}

/* ------------------------------------------------------------------- passage */

const { chromium } = await import("playwright");
const SITE = args.find((a) => a.startsWith("http")) ?? process.env.SITE_URL ?? "http://localhost:3123";

/**
 * LES PAGES MESURÉES : une par gabarit, lues dans l'index de la maquette, plus
 * celles que l'index ne connaît pas et qui existent pourtant. Même échantillon
 * que la porte de D1, pour que les deux chiffres se comparent.
 */
function pagesAVoir() {
  if (process.env.PAGES) {
    return process.env.PAGES.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const index = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8"));
  const entrees = Array.isArray(index) ? index : (index.pages ?? []);
  const parGabarit = new Map();
  for (const e of entrees) if (!parGabarit.has(e.gabarit)) parGabarit.set(e.gabarit, e.url);
  const horsIndex = ["/", "/nous-connaitre/", "/contact/", "/rse/", "/valeurs/", "/preuves/", "/offres/"];
  return [...new Set([...parGabarit.values(), ...horsIndex])];
}

/* Le relevé d'un état, posé dans la page pour éviter deux allers-retours. */
const RELEVE = () => {
  const main = document.querySelector("main");
  if (!main) return null;
  const net = (t) =>
    (t ?? "").replace(/ /g, " ").replace(/[‘’ʼ]/g, "'").replace(/\s+/g, " ").trim();
  return {
    texte: net(main.textContent),
    peint: net(main.innerText).length,
    hauteur: document.documentElement.scrollHeight,
  };
};

const pages = pagesAVoir();
console.log(`repli à ${LARGEUR} px, ${pages.length} page(s) sur ${SITE}\n`);

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: LARGEUR, height: 850 } });
const releve = [];
const injoignables = [];

for (const url of pages) {
  let ok = false;
  for (let essai = 1; essai <= 2 && !ok; essai += 1) {
    try {
      const r = await page.goto(`${SITE}${url}`, { waitUntil: "networkidle", timeout: 90000 });
      ok = Boolean(r?.ok());
      if (!ok && essai === 2) injoignables.push({ url, motif: `HTTP ${r?.status()}` });
    } catch (e) {
      if (essai === 2) injoignables.push({ url, motif: e.message.split("\n")[0].slice(0, 60) });
    }
  }
  if (!ok) continue;

  /* PIÈGE N° 6 DU DÉPÔT : le bandeau de consentement et la pastille Next ont
     compté jusqu'à 57 % de faux pixels. Ils faussent aussi la hauteur. */
  try {
    await page.getByRole("button", { name: /tout refuser/i }).click({ timeout: 2500 });
  } catch {
    /* Déjà répondu, ou pas de bandeau : rien à faire. */
  }
  await page.evaluate(() => document.querySelector("nextjs-portal")?.remove());

  /* Le repli est posé par un effet client : sans l'hydratation, tout paraît
     ouvert et la mesure serait fausse dans le sens qui arrange. */
  await page.waitForTimeout(1600);

  const plis = await page.evaluate(
    () => document.querySelectorAll("main details[data-pliable-mobile]").length,
  );
  const replie = await page.evaluate(RELEVE);
  if (!replie) {
    injoignables.push({ url, motif: "aucun <main>" });
    continue;
  }

  /* L'ÉTAT DÉPLIÉ : on ouvre tout, sans recharger. La page est la même, seul
     l'état des dépliants change, donc la comparaison ne mesure que lui. */
  await page.evaluate(() => {
    for (const d of document.querySelectorAll("main details[data-pliable-mobile]")) d.open = true;
  });
  await page.waitForTimeout(450);
  const deplie = await page.evaluate(RELEVE);

  /* ON REFERME TOUT ET ON RELIT LE MÊME ÉTAT. Deux lectures de l'état replié
     encadrent celle de l'état déplié : leur écart est le bruit propre de la
     page (texte animé), et lui seul est défalqué. Voir `texteQuiBouge`. */
  await page.evaluate(() => {
    for (const d of document.querySelectorAll("main details[data-pliable-mobile]")) d.open = false;
  });
  await page.waitForTimeout(450);
  const replie2 = await page.evaluate(RELEVE);

  /* La vue de D1, informative : combien de `main > section` portent un pli. */
  const sections = await page.evaluate(() => {
    const main = document.querySelector("main");
    const toutes = [...main.querySelectorAll(":scope > section")];
    return {
      total: toutes.length,
      avecPli: toutes.filter((s) => s.querySelector("details[data-pliable-mobile]")).length,
      deBloc: toutes.filter((s) => s.hasAttribute("data-bloc")).length,
    };
  });

  releve.push({ url, plis, replie, deplie, replie2, sections });
  console.log(
    `  ${url}\n` +
      `      ${plis} pli(s), ${sections.avecPli}/${sections.total} section(s) repliable(s), ${sections.deBloc} de blocs/\n` +
      `      textContent  ${replie.texte.length} replié / ${deplie.texte.length} déplié  ` +
      `${replie.texte === deplie.texte ? "IDENTIQUE" : `écart ${replie.texte.length - deplie.texte.length}, bruit propre ${Math.abs(replie.texte.length - replie2.texte.length)}`}\n` +
      `      innerText    ${replie.peint} → ${deplie.peint} caractères peints\n` +
      `      hauteur      ${replie.hauteur} px replié, ${deplie.hauteur} px déplié` +
      (plis > 0 && deplie.hauteur > 0
        ? `  (${Math.round((1 - replie.hauteur / deplie.hauteur) * 100)} % de moins)`
        : ""),
  );
}
await nav.close();

/* -------------------------------------------------------------------- verdict */

const bougent = texteQuiBouge(releve);
const mouvantes = pagesAuTexteMouvant(releve);
const nonRaccourcies = pagesQuiNeRaccourcissentPas(releve);
const inoperants = plisInoperants(releve);
const avecPlis = releve.filter((p) => p.plis > 0);

const plis = releve.reduce((n, p) => n + p.plis, 0);
const gain = avecPlis.reduce((n, p) => n + (p.deplie.hauteur - p.replie.hauteur), 0);

console.log(
  `\n  ${plis} pli(s) sur ${releve.length} page(s), ${avecPlis.length} page(s) repliée(s)\n` +
    `  ${gain} px de défilement retirés au total, et ${bougent.length} caractère(s) de textContent perdu(s)`,
);

if (injoignables.length > 0) {
  console.log(`\n  ${injoignables.length} page(s) injoignable(s) :`);
  for (const i of injoignables) console.log(`    ${i.url}  ${i.motif}`);
}
if (mouvantes.length > 0) {
  console.log(
    `\n  ${mouvantes.length} page(s) au texte mouvant, bruit défalqué et déclaré ` +
      "(texte animé, piège n° 7) :",
  );
  for (const m of mouvantes) console.log(`    ${m.url}  ${m.bruit} caractère(s) de bruit propre`);
}
if (bougent.length > 0) {
  console.log(`\nDU TEXTE A BOUGÉ EN SE REPLIANT, ${bougent.length} page(s) :`);
  for (const b of bougent) {
    console.log(
      `  ${b.url}  ${b.delta > 0 ? "+" : ""}${b.delta} caractères, au-delà du bruit propre (${b.bruit})`,
    );
  }
}
if (nonRaccourcies.length > 0) {
  console.log(`\nPAGES NON RACCOURCIES, ${nonRaccourcies.length} :`);
  for (const p of nonRaccourcies) console.log(`  ${p.url}  ${p.replie} px replié, ${p.deplie} déplié`);
}
if (inoperants.length > 0) {
  console.log(`\nPLIS QUI NE PLIENT RIEN, ${inoperants.length} page(s) :`);
  for (const p of inoperants) console.log(`  ${p.url}  ${p.replie} caractères peints, ${p.deplie} déplié`);
}

console.log("\nTémoin : node components/site/blocs/verification-repli-navigateur.mjs --controle");

if (
  bougent.length > 0 ||
  nonRaccourcies.length > 0 ||
  inoperants.length > 0 ||
  injoignables.length > 0 ||
  avecPlis.length === 0
) {
  process.exit(1);
}
console.log("LE_REPLI_RACCOURCIT_SANS_PERDRE_UN_MOT");
