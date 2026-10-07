/**
 * LA PAGE /offres/residence/ SERT-ELLE LE RENDU FIGÉ DE LA MAQUETTE,
 * SECTION PAR SECTION, MOT POUR MOT ?
 *
 *   node scripts/verifie-offre-rendu.mjs
 *   SITE_URL=http://localhost:4341/ node scripts/verifie-offre-rendu.mjs   (version construite)
 *
 * LA RÉFÉRENCE EST UNIQUE, validée par Mehdi le 06/10 : le rendu de
 * l'application autonome de sa maquette, figé page par page dans
 * maquette/rendu/. Pour cette page : offres--residence.html (le HTML du
 * <main> rendu) et offres--residence.json (la structure mesurée : 17
 * sections). Pas le corpus brut, pas l'objet OFFERS : la capture, qui
 * fusionne déjà les deux.
 *
 * CE QUE LA PORTE CONTRÔLE, les deux pages ouvertes dans le MÊME navigateur
 * et lues par le MÊME code :
 *
 *   1. COHÉRENCE DE LA RÉFÉRENCE : le HTML figé porte bien les 17 sections
 *      et le h1 que le JSON de mesure annonce. Si les deux fichiers ne se
 *      correspondent plus, la porte refuse de conclure.
 *   2. STRUCTURE : les sections de la référence sont servies dans le même
 *      ordre, titres identiques sur texte normalisé. Aucune section en plus
 *      hors exceptions déclarées ci-dessous, aucune en moins.
 *   3. TEXTE : chaque ligne visible de chaque section de la référence est
 *      présente, mot pour mot sur texte normalisé, dans la section
 *      correspondante du site. Une phrase absente est nommée.
 *   4. TIRETS : aucun tiret cadratin visible sur le site, règle permanente
 *      de Mehdi. Si la référence en portait un, il devrait être déclaré
 *      remplacé ci-dessous, sinon la porte échoue.
 *
 * LA NORMALISATION est celle du dépôt (verifie-mots-offre.mjs) : espaces
 * insécables ramenés à l'espace, apostrophes typographiques unifiées,
 * espaces multiples réduits. Piège connu, il a déjà fait conclure à tort.
 *
 * LES EXCEPTIONS SONT DÉCLARÉES ICI, nommément, avec leur raison. Chacune
 * est VÉRIFIÉE : une exception devenue inutile fait échouer la porte, sinon
 * la liste grossit jusqu'à tout autoriser.
 *
 * PRÉALABLE : le site doit tourner (`bun run dev`, ou `SITE_URL` vers le
 * build) et Google Chrome être installé (Playwright passe par son canal).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");
const CHEMIN_PAGE = "/offres/residence/";
const REFERENCE_HTML = join(RACINE, "maquette", "rendu", "offres--residence.html");
const REFERENCE_JSON = join(RACINE, "maquette", "rendu", "offres--residence.json");
const LARGEUR = 1280;
const HAUTEUR = 860;

/* ------------------------------------------------------------------ */
/* LES EXCEPTIONS, chacune nommée, justifiée, et vérifiée plus bas.    */
/* ------------------------------------------------------------------ */

/**
 * Sections que le site rend EN PLUS de la référence, par rang dans le <main>
 * servi. Chaque entrée doit correspondre exactement à ce qui est rendu, et
 * son texte doit être ABSENT de la référence : sinon, exception inutile.
 */
const SECTIONS_AJOUTEES = [
  {
    rang: 0,
    texte: "Accueil / Entreprise maintenance industrielle / Sous-traitance maintenance",
    pourquoi:
      "fil d'Ariane du site : la capture fige le <main> de l'application autonome, " +
      "qui n'a pas de navigation de site. Le fil situe la page dans l'arborescence " +
      "réelle (maillage interne et données structurées), il ne réécrit aucun mot " +
      "de la maquette.",
  },
];

/**
 * Tirets cadratins de la référence remplacés dans le rendu, phrase par
 * phrase : { maquette, rendu, pourquoi }. La forme `maquette` doit exister
 * dans la référence et la forme `rendu` sur le site, sinon la porte échoue.
 * VIDE AU 06/10 : la capture d'offres--residence ne porte aucun cadratin,
 * et la porte le re-vérifie à chaque passage.
 */
const TIRETS_REMPLACES = [];

/**
 * Trous assumés : lignes de la référence volontairement NON rendues,
 * { section, ligne, pourquoi }. La ligne doit exister dans la référence et
 * manquer sur le site, sinon exception inutile. VIDE AU 06/10 : le portage
 * rend les 17 sections sans trou.
 */
const TROUS_ASSUMES = [];

/* ------------------------------------------------------------------ */
/* Normalisation et extraction, le même code pour les deux pages.      */
/* ------------------------------------------------------------------ */

/** Texte normalisé : insécables → espace, apostrophes unifiées, blancs réduits. */
function normalise(texte) {
  return (texte ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[­​]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Évalué DANS la page : les sections directes du <main>, leur premier titre
 * et leurs lignes de texte visible (innerText ignore ce qui est masqué).
 * Le texte revient brut, la normalisation se fait d'un seul côté, ici.
 */
const EXTRAIT = () => {
  const principal = document.querySelector("main");
  if (!principal) return null;
  return [...principal.querySelectorAll(":scope > section")].map((section) => {
    const titre = section.querySelector("h1, h2, h3");
    return {
      titre: titre ? titre.innerText : null,
      lignes: (section.innerText || "").split("\n"),
    };
  });
};

/** Les sections d'une page, titres et lignes normalisés, lignes vides ôtées. */
async function lisSections(navigateur, ouvre) {
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  await ouvre(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const brut = await page.evaluate(EXTRAIT);
  await page.close();
  if (!brut) throw new Error("aucun <main> dans la page, rien à mesurer");
  return brut.map((s) => ({
    titre: s.titre === null ? null : normalise(s.titre),
    lignes: s.lignes.map(normalise).filter(Boolean),
    texte: normalise(s.lignes.join(" ")),
  }));
};

/* ------------------------------------------------------------------ */
/* Les contrôles. Chacun pousse ses anomalies, nommées, dans `fautes`. */
/* ------------------------------------------------------------------ */

/** 1. La référence est-elle cohérente avec sa propre mesure ? */
function controleReference(reference, mesure, fautes) {
  if (reference.length !== mesure.nbSections) {
    fautes.push(
      `référence incohérente : ${reference.length} section(s) dans le HTML figé, ` +
        `${mesure.nbSections} annoncées par ${REFERENCE_JSON}`,
    );
  }
  const h1 = reference[0]?.titre ?? "(absent)";
  if (h1 !== normalise(mesure.h1Attendu)) {
    fautes.push(`référence incohérente : h1 « ${h1} » au lieu de « ${mesure.h1Attendu} »`);
  }
}

/**
 * 2. Les sections ajoutées déclarées sont-elles exactement celles rendues ?
 * Retourne les sections du site SANS les ajouts déclarés, prêtes à être
 * alignées une à une sur la référence.
 */
function retireAjoutsDeclares(site, texteReference, fautes) {
  const rangsRetires = new Set();
  for (const ajout of SECTIONS_AJOUTEES) {
    const section = site[ajout.rang];
    const attendu = normalise(ajout.texte);
    if (!section || section.texte !== attendu) {
      fautes.push(
        `exception devenue inutile ou fausse : la section ajoutée déclarée au rang ` +
          `${ajout.rang} (« ${ajout.texte} ») n'est pas rendue telle quelle.\n` +
          `    Raison déclarée : ${ajout.pourquoi}\n` +
          `    Rendu à ce rang : « ${section ? section.texte.slice(0, 120) : "(aucune section)"} »`,
      );
      continue;
    }
    if (texteReference.includes(attendu)) {
      fautes.push(
        `exception fausse : le texte de la section ajoutée au rang ${ajout.rang} existe ` +
          `dans la référence, ce n'est donc pas un ajout`,
      );
      continue;
    }
    rangsRetires.add(ajout.rang);
  }
  return site.filter((_, rang) => !rangsRetires.has(rang));
}

/** 3. Même nombre de sections, mêmes titres, même ordre. */
function controleStructure(reference, site, fautes) {
  if (site.length !== reference.length) {
    const titres = (liste) => liste.map((s) => s.titre ?? "(sans titre)").join(" · ");
    fautes.push(
      `${site.length} section(s) servies hors ajouts déclarés, ${reference.length} dans la référence.\n` +
        `    Référence : ${titres(reference)}\n` +
        `    Site      : ${titres(site)}`,
    );
    return;
  }
  reference.forEach((section, rang) => {
    if (site[rang].titre !== section.titre) {
      fautes.push(
        `section ${rang} : titre « ${site[rang].titre ?? "(aucun)"} » au lieu de ` +
          `« ${section.titre ?? "(aucun)"} »`,
      );
    }
  });
}

/** La forme attendue au rendu d'une ligne de la référence, cadratins arbitrés. */
function attendueAuRendu(ligne) {
  const arbitrage = TIRETS_REMPLACES.find((t) => normalise(t.maquette) === ligne);
  return arbitrage ? normalise(arbitrage.rendu) : ligne;
}

/** Un trou assumé couvre-t-il cette ligne de cette section ? */
function estUnTrouAssume(rang, ligne) {
  return TROUS_ASSUMES.some(
    (t) => t.section === rang && normalise(t.ligne) === ligne,
  );
}

/** 4. Chaque ligne de la référence est rendue, mot pour mot, dans sa section. */
function controleTexte(reference, site, fautes) {
  const commun = Math.min(reference.length, site.length);
  for (let rang = 0; rang < commun; rang += 1) {
    for (const ligne of reference[rang].lignes) {
      const attendue = attendueAuRendu(ligne);
      const presente = site[rang].texte.includes(attendue);
      if (estUnTrouAssume(rang, ligne)) {
        if (presente) {
          fautes.push(
            `exception devenue inutile : le trou assumé de la section ${rang} ` +
              `(« ${ligne.slice(0, 90)} ») est maintenant rendu. Retirez-le de TROUS_ASSUMES.`,
          );
        }
        continue;
      }
      if (!presente) {
        fautes.push(`section ${rang} : phrase de la référence absente du rendu :\n    « ${attendue} »`);
      }
    }
  }
}

/** 5. Les arbitrages de cadratin déclarés sont-ils encore réels et utiles ? */
function controleTirets(reference, site, fautes) {
  const texteReference = reference.map((s) => s.texte).join("\n");
  for (const section of site) {
    const fautive = section.lignes.find((l) => l.includes("—"));
    if (fautive) {
      fautes.push(`tiret cadratin visible sur le site : « ${fautive.slice(0, 110)} »`);
    }
  }
  for (const ligne of reference.flatMap((s) => s.lignes)) {
    if (ligne.includes("—") && !TIRETS_REMPLACES.some((t) => normalise(t.maquette) === ligne)) {
      fautes.push(
        `la référence porte un cadratin non arbitré dans TIRETS_REMPLACES :\n    « ${ligne.slice(0, 110)} »`,
      );
    }
  }
  for (const arbitrage of TIRETS_REMPLACES) {
    if (!texteReference.includes(normalise(arbitrage.maquette))) {
      fautes.push(
        `exception devenue inutile : « ${arbitrage.maquette} » n'existe plus dans la référence. ` +
          `Retirez-la de TIRETS_REMPLACES.`,
      );
    }
  }
  for (const trou of TROUS_ASSUMES) {
    const section = reference[trou.section];
    if (!section || !section.lignes.includes(normalise(trou.ligne))) {
      fautes.push(
        `exception fausse : le trou assumé « ${trou.ligne} » (section ${trou.section}) ` +
          `n'existe pas dans la référence. Retirez-le de TROUS_ASSUMES.`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Déroulé.                                                            */
/* ------------------------------------------------------------------ */

const mesure = JSON.parse(readFileSync(REFERENCE_JSON, "utf8"));
const htmlReference = readFileSync(REFERENCE_HTML, "utf8");

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 0;
try {
  const [reference, site] = await Promise.all([
    lisSections(navigateur, (page) =>
      page.setContent(
        `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>${htmlReference}</body></html>`,
        { waitUntil: "load" },
      ),
    ),
    lisSections(navigateur, async (page) => {
      const reponse = await page.goto(SITE + CHEMIN_PAGE, { waitUntil: "load", timeout: 60_000 });
      if (!reponse?.ok()) throw new Error(`${SITE + CHEMIN_PAGE} répond ${reponse?.status()}`);
    }),
  ]);

  const fautes = [];
  controleReference(reference, mesure, fautes);
  const texteReference = reference.map((s) => s.texte).join("\n");
  const siteAligne = retireAjoutsDeclares(site, texteReference, fautes);
  controleStructure(reference, siteAligne, fautes);
  controleTexte(reference, siteAligne, fautes);
  controleTirets(reference, site, fautes);

  const lignes = reference.reduce((somme, s) => somme + s.lignes.length, 0);
  console.log(
    `${CHEMIN_PAGE} contre ${REFERENCE_HTML.replace(RACINE, "")} : ` +
      `${reference.length} sections de référence, ${site.length} servies ` +
      `(${SECTIONS_AJOUTEES.length} ajout(s) déclaré(s)), ${lignes} lignes de texte comparées, ` +
      `${TIRETS_REMPLACES.length} cadratin(s) arbitré(s), ${TROUS_ASSUMES.length} trou(s) assumé(s).`,
  );

  if (fautes.length > 0) {
    console.error(`\n${fautes.length} anomalie(s) :\n`);
    for (const faute of fautes) console.error(`  · ${faute}\n`);
    code = 1;
  } else {
    console.log("rendu d'offre conforme à la référence");
  }
} finally {
  await navigateur.close();
}
process.exit(code);
