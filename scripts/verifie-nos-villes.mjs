#!/usr/bin/env node
/**
 * Porte : les deux blocs de « Nos villes » restent COMPACTS, DENSES et PLEINS.
 *
 *   node scripts/verifie-nos-villes.mjs [adresse]     (défaut : localhost:4340)
 *   node scripts/verifie-nos-villes.mjs --controle    (preuve d'échec)
 *
 * POURQUOI ELLE EXISTE. Le 12/10, Mehdi a tranché contre sa propre maquette
 * sur `/implantations/` : « le bloc est pas jolie mal agencé trop gros. Ca
 * pourrait etre un peu plus visuels. Pareil pour le bloc au dela des hubs ».
 * Mesuré en production ce jour-là, à 1440 px : la section pesait 1 965 px, les
 * hubs 964 px, « Au-delà des hubs » 828 px, et au téléphone la section faisait
 * 2 258 px, soit 2,7 écrans. La refonte les ramène à 1 383, 654, 575 et 399.
 *
 * Rien ne protège un gain de densité. Une ligne de style remise, un composant
 * repris d'une autre page, un repli mobile défait, et le pâté revient sans que
 * personne ne le voie : c'est exactement ce qui s'était passé entre le dessin
 * d'origine et le signalement du client. Cette porte mesure donc ce que l'oeil
 * du client mesurait, et rien d'autre.
 *
 * CE QU'ELLE VÉRIFIE, sur le rendu réel d'un navigateur et non sur la source :
 *  1. LA SECTION EXISTE, avec son titre et son sous-titre.
 *  2. LES COMPTES SONT INTACTS : 10 hubs, 30 bassins, 11 régions, 48 villes,
 *     88 liens. Compacter en perdant des liens serait une tricherie.
 *  3. LA HAUTEUR tient sous ses plafonds, à 1440 px et à 390 px.
 *  4. LA DENSITÉ : au moins 55 liens pour 1 000 px de hauteur de section
 *     (44,8 avant la refonte, 63,6 après).
 *  5. L'ARRANGEMENT : aucune rangée de hubs incomplète, aucune colonne vide
 *     dans l'annuaire des villes. C'était ça, le « mal agencé ».
 *  6. LE REPLI MOBILE tient : les deux blocs sont SERVIS OUVERTS par le
 *     serveur, et refermés par l'effet client sous 880 px.
 *  7. AUCUN ÉLÉMENT DE LA SECTION ne sort de la fenêtre.
 *
 * PIÈGES DE MESURE RESPECTÉS, chacun déjà payé par ce dépôt : on mesure
 * l'ÉLÉMENT et non le document (`.mg-site` est en `overflow-x: clip`), on
 * attend l'hydratation (les repliables sont servis ouverts puis fermés par un
 * effet client), on neutralise le bandeau de consentement et la pastille Next
 * (jusqu'à 57 % de faux pixels), et le texte est extrait avec un SÉPARATEUR DE
 * BLOC, sans quoi les libellés se collent entre eux.
 *
 * ELLE PROUVE QU'ELLE SAIT ÉCHOUER : huit régressions injectées dans le DOM,
 * chacune doit être vue.
 */
import { chromium } from "playwright";

const CONTROLE = process.argv.includes("--controle");
const BASE = process.argv.find((a) => a.startsWith("http")) ?? process.env.SITE_URL ?? "http://localhost:4340";
const URL = `${BASE.replace(/\/$/, "")}/implantations/`;

/* ------------------------------------------------------------- les seuils */

/**
 * Les plafonds sont posés ENTRE la mesure d'après et la mesure d'avant : assez
 * haut pour qu'une police ou un navigateur un peu différent ne les fasse pas
 * tomber, assez bas pour qu'un retour au dessin d'avant soit refusé.
 */
const SEUILS = {
  bureau: { largeur: 1440, hauteur: 900, section: 1600, hubs: 760, audela: 680, avant: { section: 1965, hubs: 964, audela: 828 } },
  telephone: { largeur: 390, hauteur: 844, section: 844, hubs: 260, audela: 300, avant: { section: 2258, hubs: 108, audela: 1977 } },
};
/** Liens pour 1 000 px de hauteur de section, à 1440 px. Avant : 44,8. Après : 63,6. */
const DENSITE_PLANCHER = 55;
const COMPTES = { hubs: 10, bassins: 30, regions: 11, villes: 48, liens: 88 };

/* -------------------------------------------------------------- la mesure */

/**
 * Relève les faits dans la page. `retouche` est le nom d'une régression à
 * injecter dans le DOM avant de mesurer : c'est le mode témoin.
 */
async function releve(page, retouche) {
  return page.evaluate((retouche) => {
    /* SÉPARATEUR DE BLOC : sans lui, `textContent` recolle « Lyon » et
       « Grenoble » en « LyonGrenoble » et tout comptage de mots ment. */
    const SEP = String.fromCharCode(1);
    const texte = (e) => {
      const parts = [];
      const marche = (n) => {
        if (n.nodeType === 3) parts.push(n.nodeValue);
        else if (n.nodeType === 1) {
          parts.push(SEP);
          for (const f of n.childNodes) marche(f);
          parts.push(SEP);
        }
      };
      marche(e);
      return parts.join(" ").split(SEP).join(" ").replace(/\s+/g, " ").trim();
    };
    const haut = (e) => Math.round(e.getBoundingClientRect().height);
    /** Regroupe des éléments par leur bord (gauche ou haut) : une colonne, une rangée. */
    const groupes = (elements, bord) => {
      const m = new Map();
      for (const e of elements) {
        const k = Math.round(e.getBoundingClientRect()[bord] / 4) * 4;
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n);
    };

    const section = [...document.querySelectorAll("main > section")].find((s) =>
      (s.textContent ?? "").includes("bassins couverts"),
    );
    if (!section) return { absente: true };

    const plis = [...section.querySelectorAll("details[data-pliable-mobile]")];
    const panneau = section.querySelector("[class*='panneauHubs']");
    const annuaire = section.querySelector("[class*='annuaire']");
    const rangs = panneau ? [...panneau.querySelectorAll(":scope > [class*='rangHub']")] : [];
    const regions = annuaire ? [...annuaire.querySelectorAll(":scope > [class*='groupeRegion']")] : [];

    /* LES RÉGRESSIONS DU MODE TÉMOIN, injectées ici pour que la mesure qui suit
       les voie exactement comme elle verrait une vraie dérive. */
    if (retouche === "bloc double" && panneau) for (const r of rangs) r.style.paddingBlock = "58px";
    if (retouche === "colonne vide" && annuaire) annuaire.style.columns = String(regions.length + 4);
    if (retouche === "titre absent") section.querySelector("h2")?.remove();
    if (retouche === "liens perdus") for (const [i, a] of [...section.querySelectorAll("a")].entries()) if (i % 2) a.remove();
    if (retouche === "rangee incomplete" && panneau) panneau.style.gridTemplateColumns = "repeat(3, minmax(0,1fr))";
    /* Le marqueur vient du HTML du serveur : c'est lui qu'on fausse, pas le DOM. */
    if (retouche === "servi ferme") for (const d of plis) d.setAttribute("data-servi-ouvert", "0");
    if (retouche === "repli defait") for (const d of plis) d.open = true;
    if (retouche === "deborde") section.style.width = "140vw";

    const colonnesDe = (e) => (e ? Number(getComputedStyle(e).columnCount) || 0 : 0);
    const grilleColonnes = (e) => (e ? getComputedStyle(e).gridTemplateColumns.split(" ").filter(Boolean).length : 0);

    return {
      absente: false,
      section: { hauteur: haut(section), titre: texte(section.querySelector("h2") ?? document.createElement("i")), sousTitre: texte(section.querySelector("h3") ?? document.createElement("i")) },
      plis: plis.map((d) => ({
        hauteur: haut(d),
        ouvert: d.open,
        serviOuvert: d.getAttribute("data-servi-ouvert") === "1",
        titre: texte(d.querySelector("summary h2, summary h3") ?? document.createElement("i")),
      })),
      hubs: { nombre: rangs.length, colonnes: grilleColonnes(panneau), parRangee: groupes(rangs, "top") },
      annuaire: { colonnesDeclarees: colonnesDe(annuaire), colonnesRemplies: groupes(regions, "left").length, regions: regions.length },
      comptes: {
        hubs: section.querySelectorAll("[class*='rangHub'] a[class*='hub']").length,
        bassins: section.querySelectorAll("[class*='rangHub'] a[class*='zone']").length,
        regions: regions.length,
        villes: section.querySelectorAll("[class*='groupeRegion'] a[class*='ville']").length,
        liens: section.querySelectorAll("a").length,
      },
      /* LE DÉBORDEMENT SE MESURE SUR L'ÉLÉMENT, PAS SUR LE DOCUMENT, et c'est
         le témoin « deborde » qui l'a prouvé : `.mg-site` est en
         `overflow-x: clip`, donc `documentElement.scrollWidth` reste égal à la
         fenêtre même avec une section large de 140 vw. La question posée est
         donc : un élément de la section sort-il de la fenêtre ? */
      deborde: (() => {
        const bord = document.documentElement.clientWidth;
        const fautif = [section, ...section.querySelectorAll("*")].find((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > bord + 1 || r.left < -1);
        });
        if (!fautif) return null;
        const r = fautif.getBoundingClientRect();
        return `${fautif.tagName.toLowerCase()} « ${texte(fautif).slice(0, 30)} » de ${Math.round(r.left)} à ${Math.round(r.right)} px pour ${bord} px de fenêtre`;
      })(),
    };
  }, retouche ?? null);
}

/* ------------------------------------------------------------ le verdict */

function controle(vue, faits, seuils) {
  const e = [];
  if (faits.absente) return [`${vue} : la section « Nos villes » est introuvable`];

  if (!faits.section.titre.includes("bassins couverts")) e.push(`${vue} : le titre des hubs est absent du rendu`);
  if (!faits.section.sousTitre.includes("villes couvertes")) e.push(`${vue} : le titre de « Au-delà des hubs » est absent du rendu`);

  for (const [cle, attendu] of Object.entries(COMPTES)) {
    if (faits.comptes[cle] !== attendu) e.push(`${vue} : ${faits.comptes[cle]} ${cle} au lieu de ${attendu}`);
  }

  const [hubs, audela] = faits.plis;
  if (faits.plis.length !== 2) e.push(`${vue} : ${faits.plis.length} bloc(s) repliable(s) au lieu de 2`);
  if (faits.section.hauteur > seuils.section) e.push(`${vue} : la section fait ${faits.section.hauteur} px, plafond ${seuils.section} (avant la refonte : ${seuils.avant.section})`);
  if (hubs && hubs.hauteur > seuils.hubs) e.push(`${vue} : le bloc des hubs fait ${hubs.hauteur} px, plafond ${seuils.hubs} (avant : ${seuils.avant.hubs})`);
  if (audela && audela.hauteur > seuils.audela) e.push(`${vue} : « Au-delà des hubs » fait ${audela.hauteur} px, plafond ${seuils.audela} (avant : ${seuils.avant.audela})`);

  for (const [i, pli] of faits.plis.entries()) {
    if (!pli.serviOuvert) e.push(`${vue} : le bloc repliable n° ${i + 1} n'est pas SERVI ouvert par le serveur`);
    if (!pli.titre) e.push(`${vue} : le bloc repliable n° ${i + 1} n'a pas de titre dans son en-tête`);
  }

  if (faits.deborde) e.push(`${vue} : la section déborde de la fenêtre, ${faits.deborde}`);

  if (seuils.largeur >= 1000) {
    const densite = (faits.comptes.liens * 1000) / faits.section.hauteur;
    if (densite < DENSITE_PLANCHER) e.push(`${vue} : densité de ${densite.toFixed(1)} liens pour 1 000 px, plancher ${DENSITE_PLANCHER} (avant : 44,8)`);
    const incompletes = faits.hubs.parRangee.filter((n) => n !== faits.hubs.colonnes).length;
    if (incompletes > 0) e.push(`${vue} : ${incompletes} rangée(s) de hubs incomplète(s) sur ${faits.hubs.parRangee.length} (colonnes : ${faits.hubs.colonnes}, par rangée : ${faits.hubs.parRangee.join("+")})`);
    if (faits.annuaire.colonnesRemplies < faits.annuaire.colonnesDeclarees)
      e.push(`${vue} : ${faits.annuaire.colonnesDeclarees - faits.annuaire.colonnesRemplies} colonne(s) vide(s) dans l'annuaire (${faits.annuaire.colonnesDeclarees} déclarées, ${faits.annuaire.colonnesRemplies} remplies)`);
  } else {
    for (const [i, pli] of faits.plis.entries()) {
      if (pli.ouvert) e.push(`${vue} : le bloc repliable n° ${i + 1} reste déplié au téléphone`);
    }
  }
  return e;
}

/* --------------------------------------------------------------- la page */

/** Ouvre la page, refuse les traceurs, retire la pastille Next, attend l'hydratation. */
async function ouvre(navigateur, { largeur, hauteur }) {
  const ctx = await navigateur.newContext({ viewport: { width: largeur, height: hauteur } });
  const page = await ctx.newPage();
  const html = await (await fetch(URL)).text();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("load").catch(() => {});
  const refuser = page.getByRole("button", { name: "Tout refuser" }).first();
  if (await refuser.count().catch(() => 0)) await refuser.click({ timeout: 2500 }).catch(() => {});
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((x) => x.remove()));
  /* « SERVI OUVERT » SE LIT DANS LE HTML DU SERVEUR, PAS DANS LE DOM : au
     moment où l'on mesure, l'effet client a déjà refermé les blocs sous
     880 px. Les lire dans le DOM ferait croire à un bloc servi fermé. */
  const servis = [...html.matchAll(/<details\b([^>]*\bdata-pliable-mobile\b[^>]*)>/g)].map((m) => /\bopen(?:=""|=\s*"open"|\s|>|$)/.test(m[1]));
  await page.evaluate((servis) => {
    document.querySelectorAll("details[data-pliable-mobile]").forEach((d, i) => d.setAttribute("data-servi-ouvert", servis[i] ? "1" : "0"));
  }, servis);
  /* Le repli est un effet client : il faut lui laisser le temps de passer. */
  await page.waitForTimeout(2000);
  return { ctx, page };
}

/* ----------------------------------------------------------------- course */

const navigateur = await chromium.launch();
let rouge = false;

if (CONTROLE) {
  /* Chaque régression est injectée dans le DOM, puis la mesure doit la voir.
     Une porte qui ne sait pas échouer ne protège rien. */
  const TEMOINS = [
    ["bureau", "bloc double", /le bloc des hubs fait \d+ px, plafond/],
    ["bureau", "colonne vide", /colonne\(s\) vide\(s\) dans l'annuaire/],
    ["bureau", "titre absent", /le titre des hubs est absent du rendu/],
    ["bureau", "liens perdus", /\d+ liens au lieu de 88/],
    ["bureau", "rangee incomplete", /rangée\(s\) de hubs incomplète\(s\)/],
    ["bureau", "deborde", /la section déborde de la fenêtre/],
    ["bureau", "servi ferme", /n'est pas SERVI ouvert par le serveur/],
    ["telephone", "repli defait", /reste déplié au téléphone/],
  ];
  let aveugle = false;
  for (const [vue, retouche, attendu] of TEMOINS) {
    const seuils = SEUILS[vue];
    const { ctx, page } = await ouvre(navigateur, seuils);
    const ecarts = controle(vue, await releve(page, retouche), seuils);
    await ctx.close();
    const vue2 = ecarts.some((x) => attendu.test(x));
    console.log(`  ${vue2 ? "OK  " : "RATE"}  ${vue} : « ${retouche} » est vue`);
    if (!vue2) {
      aveugle = true;
      console.log(`        écarts relevés : ${ecarts.length ? ecarts.join(" | ") : "aucun"}`);
    }
  }
  if (aveugle) {
    await navigateur.close();
    console.log("\nCONTRÔLE AVEUGLE : la porte ne sait pas échouer.");
    process.exit(1);
  }
  console.log(`\ncontrôle positif conforme (${TEMOINS.length}/${TEMOINS.length})`);
}

const tous = [];
for (const [vue, seuils] of Object.entries(SEUILS)) {
  const { ctx, page } = await ouvre(navigateur, seuils);
  const faits = await releve(page);
  await ctx.close();
  tous.push(...controle(vue, faits, seuils));
  if (!faits.absente) {
    const densite = ((faits.comptes.liens * 1000) / faits.section.hauteur).toFixed(1);
    console.log(
      `  ${vue.padEnd(9)} ${seuils.largeur}px  section ${faits.section.hauteur} px (avant ${seuils.avant.section})` +
        `  hubs ${faits.plis[0]?.hauteur ?? "?"} (avant ${seuils.avant.hubs})` +
        `  au-delà ${faits.plis[1]?.hauteur ?? "?"} (avant ${seuils.avant.audela})` +
        `  ${faits.comptes.liens} liens, densité ${densite}/1000px`,
    );
  }
}
await navigateur.close();

if (tous.length) {
  rouge = true;
  console.log(`\nKO  « Nos villes »  ${tous.length} écart(s)`);
  for (const x of tous) console.log(`      ${x}`);
}
if (rouge) process.exit(1);
console.log("\nOK  « Nos villes » : compact, dense, plein, replié au téléphone.");
