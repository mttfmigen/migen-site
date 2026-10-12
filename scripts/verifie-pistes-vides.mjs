/**
 * PORTE : aucune piste déclarée ne reste vide.
 *
 *   node scripts/verifie-pistes-vides.mjs              mesure le site servi
 *   node scripts/verifie-pistes-vides.mjs --controle   témoin, n'interroge rien
 *
 * CE QU'ELLE REFUSE, et pourquoi c'est ce défaut-là qu'il fallait outiller.
 *
 * Mehdi a signalé quatre fois le même genre de chose, avec les mêmes mots :
 * « le bloc est clairement mal disposé » (G14, page bureau d'études), « le bloc
 * est mal disposé » (G15, /travaux-industriels/), « tu n'as toujours pas
 * corrigé ce bloc » (G38), et sur /contact/ le 12/10 une grille « 1fr 1fr » qui
 * ne portait qu'une carte. Dans tous les cas la cause est la même : une boîte
 * réserve DEUX places et n'en remplit qu'UNE. Le visiteur voit un trou, et
 * aucune des portes existantes ne savait le voir, parce qu'elles comparent du
 * TEXTE et que ce défaut-là n'en change aucun.
 *
 * DEUX FORMES, MESURÉES DANS LE NAVIGATEUR, jamais devinées dans le HTML :
 *
 *  1. BANDE CREUSE. Une bande d'appel (`display:flex`,
 *     `justify-content:space-between`, un rayon et un rembourrage, donc une
 *     vraie bande et non une rangée de mise en page) qui n'a qu'un seul enfant
 *     visible et dont cet enfant est COLLÉ À UN BORD. La fente opposée reste
 *     vide. Mesuré le 12/10 à 1440 px : bande de 1120 px, bouton de 244 px,
 *     79 % de vide, trois fois sur /travaux-industriels/ et trois fois sur
 *     /offres/zero-arret/.
 *     Un enfant seul mais CENTRÉ est accepté : ce n'est plus un trou d'un côté,
 *     c'est une bande d'appel, et c'est la disposition retenue le 12/10 pour
 *     les pages dont la phrase ne peut pas être servie.
 *
 *  2. GRILLE CREUSE. Une grille dont au moins une piste de largeur non nulle
 *     n'est occupée par aucun enfant. Les grilles `auto-fit` et `auto-fill` ne
 *     comptent pas : elles ne déclarent aucun nombre de pistes, c'est la
 *     largeur disponible qui le fixe, et leur dernière piste vide est le
 *     comportement normal d'une grille de cartes.
 *
 * CE QU'ELLE NE REFUSE PAS, ET C'EST LA MOITIÉ DE SON INTÉRÊT.
 *
 * La maquette fait foi. Son propre en-tête « 04 Offre » déclare `1.1fr 0.9fr`
 * et ne remplit que la colonne de gauche, sur 123 de ses captures. Une porte
 * qui refuserait cela refuserait la référence, et elle serait retournée dès le
 * lendemain. Une grille creuse est donc TOLÉRÉE quand la capture figée de la
 * MÊME page déclare la même forme (même gabarit de colonnes une fois normalisé,
 * même nombre d'enfants). Ce qui reste refusé est ce que NOUS creusons et que
 * la maquette ne creuse pas.
 *
 * La même tolérance vaut pour les bandes, et elle n'est pas théorique : sur les
 * 243 captures que l'index atteint, 236 remplissent leurs bandes d'appel et 7
 * en laissent de creuses, leur phrase y étant une interpolation vide (les
 * quatre sous-pages de `/travaux-industriels/`, deux de `/offres/chantier/` et
 * `/offres/retrofit/remise-en-etat/`). Une bande creuse n'est donc refusée que
 * si la capture de SA page la remplit. C'est le cas de `/travaux-industriels/`
 * et de `/offres/zero-arret/`, les deux pages du gabarit dont la phrase ne peut
 * pas être servie, et c'est là que la porte a trouvé les six bandes creuses du
 * 12/10.
 *
 * PÉRIMÈTRE : les pages du gabarit « 03 Offre et prestation », celles dont
 * l'index de la maquette porte ce gabarit. C'est le gabarit des blocs signalés.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const CONTROLE = process.argv.includes("--controle");

/** Le décalage toléré entre la marge gauche et la marge droite d'un enfant seul. */
const CENTRAGE_TOLERE = 10;

/* ------------------------------------------------------------------ outils */

/**
 * Normalise un gabarit de colonnes pour que la capture et le rendu se
 * comparent. La capture écrit `1.1fr 0.9fr` et `minmax(0px, 1fr)`, React écrit
 * `1.1fr .9fr` et `minmax(0,1fr)` : même grille, deux orthographes.
 */
export function normaliseGabarit(texte) {
  return String(texte ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/(^|[\s,(])0+\.(\d)/g, "$1.$2")
    .replace(/\b0px\b/g, "0")
    .trim();
}

/** Normalise une déclaration de style inline, pour la même raison. */
export function normaliseStyle(texte) {
  return String(texte ?? "")
    .toLowerCase()
    .replace(/\s*([;:,])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/;$/, "")
    .trim();
}

/**
 * Les éléments d'un HTML, avec le nombre de leurs enfants directs REMPLIS.
 *
 * Écrit à la main parce que la mesure porte sur un fragment de capture figée,
 * pas sur un document : il n'y a ni `<html>` ni `<head>`, et les analyseurs
 * complets en fabriquent un. Les `<script>` et `<style>` sont retirés d'abord :
 * leur contenu porte des `<` qui ne sont pas des balises.
 *
 * UN ENFANT VIDE NE COMPTE PAS, et c'est la leçon du 12/10. La capture de
 * `/bureau-etudes/bureau-etude-electrique/` pose dans la colonne de droite de
 * ses en-têtes un `<p><span class="sc-interp"></span></p>` SANS AUCUN TEXTE :
 * la maquette prévoit un chapô à droite et ne l'écrit pas. Compté comme un
 * enfant, il faisait dire « deux enfants pour deux pistes, rien à signaler » là
 * où la piste de droite est vide à l'écran, et la tolérance ne s'appliquait
 * plus à nos pages pourtant identiques. Le navigateur, lui, ne voit pas cette
 * boîte de hauteur nulle. Les deux côtés comptent donc la même chose :
 * ce qui porte du texte ou une image.
 */
export function elements(html) {
  const propre = String(html ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const VIDES = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr", "path", "circle", "rect", "line",
    "polygon", "polyline", "ellipse", "use", "stop",
  ]);
  const trouves = [];
  const pile = [];
  const balise = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = balise.exec(propre))) {
    const [, fermante, nomBrut, attributs, autoFermante] = m;
    const nom = nomBrut.toLowerCase();
    if (fermante) {
      for (let i = pile.length - 1; i >= 0; i--) {
        if (pile[i].nom === nom) {
          for (const sorti of pile.slice(i)) sorti.fin = m.index;
          pile.length = i;
          break;
        }
      }
      continue;
    }
    const style = (/style="([^"]*)"/i.exec(attributs) ?? [, ""])[1];
    const noeud = {
      nom,
      style,
      enfants: 0,
      debut: balise.lastIndex,
      fin: balise.lastIndex,
      cache: /display:\s*none/i.test(style),
      parent: pile[pile.length - 1] ?? null,
    };
    trouves.push(noeud);
    if (!autoFermante && !VIDES.has(nom)) pile.push(noeud);
  }
  /* Le comptage des enfants se fait APRÈS, quand chaque boîte connaît sa fin
     et donc son contenu : un enfant ne compte que s'il porte quelque chose. */
  for (const noeud of trouves) {
    if (!noeud.parent || noeud.cache) continue;
    const dedans = propre.slice(noeud.debut, noeud.fin);
    const porteQuelqueChose =
      /<(img|svg|video|canvas|picture)\b/i.test(dedans) ||
      dedans.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "").length > 0 ||
      ["img", "embed", "video", "canvas", "input", "select", "textarea"].includes(noeud.nom);
    if (porteQuelqueChose) noeud.parent.enfants++;
  }
  return trouves;
}

/**
 * Combien de pistes un gabarit de colonnes DÉCLARE.
 *
 * Zéro quand il n'en déclare aucune de façon ferme : `auto-fit` et `auto-fill`
 * effondrent les pistes vides, elles ne laissent donc pas de trou, et c'est
 * exactement ce que fait la carte en verre des « Compléments » de la maquette.
 */
export function pistesDeclarees(gabarit) {
  const t = normaliseGabarit(gabarit);
  if (!t || t === "none" || /auto-fit|auto-fill|subgrid/.test(t)) return 0;
  let total = 0;
  let reste = t;
  for (const r of t.matchAll(/repeat\((\d+),((?:[^()]|\([^()]*\))*)\)/g)) {
    total += Number(r[1]) * Math.max(1, jetons(r[2]).length);
    reste = reste.replace(r[0], " ");
  }
  return total + jetons(reste).length;
}

/** Les jetons de premier niveau d'une liste de pistes, parenthèses respectées. */
function jetons(texte) {
  const sortie = [];
  let courant = "";
  let profondeur = 0;
  for (const c of String(texte)) {
    if (c === "(") profondeur++;
    if (c === ")") profondeur--;
    if (/\s/.test(c) && profondeur === 0) {
      if (courant) sortie.push(courant);
      courant = "";
      continue;
    }
    courant += c;
  }
  if (courant) sortie.push(courant);
  return sortie.filter((j) => j !== "," && j.length > 0);
}

/**
 * Les grilles creuses D'UNE CAPTURE, lues dans son HTML.
 *
 * Sert UNIQUEMENT à tolérer : la capture fait foi, et ce qu'elle creuse
 * elle-même n'est pas un défaut du site.
 */
export function creuxDeLaCapture(html) {
  const formes = new Set();
  for (const el of elements(html)) {
    if (!/display:\s*(inline-)?grid/i.test(el.style)) continue;
    const gabarit = (/grid-template-columns:\s*([^;"]+)/i.exec(el.style) ?? [, ""])[1];
    const pistes = pistesDeclarees(gabarit);
    if (pistes >= 2 && el.enfants > 0 && el.enfants < pistes) {
      formes.add(`${normaliseGabarit(gabarit)}|${el.enfants}`);
    }
  }
  return formes;
}

/**
 * Les bandes creuses D'UNE CAPTURE, repérées par leur style normalisé.
 *
 * Sert uniquement à tolérer, exactement comme `creuxDeLaCapture`. La maquette
 * en laisse 25 sur 8 de ses pages : leur phrase est une interpolation vide, et
 * ce n'est pas à nous de la combler.
 */
export function bandesDeLaCapture(html) {
  const formes = new Set();
  for (const el of elements(html)) {
    if (!/display:\s*(inline-)?flex/i.test(el.style)) continue;
    if (!/justify-content:\s*space-between/i.test(el.style)) continue;
    if (!/border-radius/i.test(el.style) || !/padding/i.test(el.style)) continue;
    if (el.enfants < 2) formes.add(normaliseStyle(el.style));
  }
  return formes;
}

/* --------------------------------------------------- le relevé, dans la page */

/**
 * Le relevé géométrique, exécuté DANS la page.
 *
 * Autonome : aucune variable de ce module n'y entre, Playwright ne sérialise
 * pas les fermetures. La tolérance de centrage lui est passée en argument.
 */
function releve(tolerance) {
  const sortie = { bandes: [], grilles: [] };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const racine = document.querySelector("main");
  if (!racine) return sortie;

  for (const el of racine.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    const boite = el.getBoundingClientRect();
    if (boite.width <= 0) continue;
    const enfants = [...el.children].filter(visible);

    /* 1. Les bandes : flex, space-between, un vrai rayon et un rembourrage. */
    if (
      (s.display === "flex" || s.display === "inline-flex") &&
      s.justifyContent === "space-between" &&
      parseFloat(s.borderTopLeftRadius) >= 12 &&
      parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) >= 20 &&
      enfants.length === 1
    ) {
      const dedansGauche = boite.left + parseFloat(s.paddingLeft);
      const dedansDroite = boite.right - parseFloat(s.paddingRight);
      const enfant = enfants[0].getBoundingClientRect();
      const avant = enfant.left - dedansGauche;
      const apres = dedansDroite - enfant.right;
      const vide = Math.max(avant, apres);
      const largeurDedans = dedansDroite - dedansGauche;
      if (Math.abs(avant - apres) > tolerance && vide / largeurDedans > 0.25) {
        sortie.bandes.push({
          style: el.getAttribute("style") ?? "",
          largeur: Math.round(boite.width),
          enfant: Math.round(enfant.width),
          avant: Math.round(avant),
          apres: Math.round(apres),
          part: Math.round((vide / largeurDedans) * 100),
          texte: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 70),
        });
      }
    }

    /* 2. Les grilles : une piste non nulle qu'aucun enfant n'occupe.

       LES GRILLES RESPONSIVES SONT HORS SUJET, et les écarter n'est pas un
       aveuglement : `auto-fit` et `auto-fill` ne déclarent aucun nombre de
       pistes, c'est la largeur disponible qui le fixe. Une dernière piste vide
       y est le comportement normal d'une grille de cartes, la maquette en a
       autant que nous, et personne ne peut la « remplir » sans inventer une
       carte. Le défaut visé est l'autre : un nombre de pistes ÉCRIT dans le
       gabarit, et moins de contenu que de pistes écrites. */
    if (s.display === "grid" || s.display === "inline-grid") {
      const inlineGabarit = (/grid-template-columns:\s*([^;"]+)/i.exec(el.getAttribute("style") ?? "") ?? [, ""])[1];
      if (/auto-fit|auto-fill|subgrid/i.test(inlineGabarit)) continue;
      const largeurs = s.gridTemplateColumns
        .split(" ")
        .map((v) => parseFloat(v))
        .filter((v) => Number.isFinite(v));
      if (largeurs.length < 2 || enfants.length === 0) continue;
      const trou = largeurs.filter((v) => v > 0.5).length;
      if (trou < 2) continue;
      const gouttiere = parseFloat(s.columnGap) || 0;
      const depart = boite.left + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth);
      /* Bornes de chaque piste, dans le repère de la page. */
      const bornes = [];
      let x = depart;
      for (const w of largeurs) {
        bornes.push([x, x + w, w]);
        x += w + gouttiere;
      }
      const occupees = new Set();
      for (const enfant of enfants) {
        const r = enfant.getBoundingClientRect();
        bornes.forEach(([a, b], i) => {
          /* Une piste est occupée dès qu'un enfant la recouvre, même en partie :
             un enfant qui s'étend sur deux pistes les occupe toutes les deux. */
          if (r.right > a + 1 && r.left < b - 1) occupees.add(i);
        });
      }
      const vides = bornes
        .map(([, , w], i) => ({ i, w }))
        .filter(({ i, w }) => w > 0.5 && !occupees.has(i));
      if (vides.length > 0) {
        sortie.grilles.push({
          gabarit: inlineGabarit || s.gridTemplateColumns,
          pistes: largeurs.length,
          enfants: enfants.length,
          vides: vides.length,
          perdu: Math.round(vides.reduce((t, v) => t + v.w, 0)),
          largeur: Math.round(boite.width),
          texte: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 70),
        });
      }
    }
  }
  return sortie;
}

/* ------------------------------------------------------------- le témoin */

if (CONTROLE) {
  const { chromium } = await import("playwright");

  /* a. Les fonctions pures, sur des littéraux. */
  const pures = [
    ["deux pistes fermes sont comptées", pistesDeclarees("1fr 1fr") === 2],
    ["« 1.1fr 0.9fr » aussi", pistesDeclarees("1.1fr 0.9fr") === 2],
    ["`repeat(3,minmax(0,1fr))` vaut trois pistes", pistesDeclarees("repeat(3,minmax(0,1fr))") === 3],
    ["`auto-fit` ne déclare RIEN de ferme", pistesDeclarees("repeat(auto-fit,minmax(min(100%,420px),1fr))") === 0],
    ["une seule piste n'est pas une grille à trou", pistesDeclarees("1fr") === 1],
    [
      "les deux orthographes du même gabarit se rejoignent",
      normaliseGabarit("1.1fr 0.9fr") === normaliseGabarit("1.1fr .9fr") &&
        normaliseGabarit("minmax(0px, 1fr)") === normaliseGabarit("minmax(0,1fr)"),
    ],
    [
      "les enfants comptés sont les DIRECTS, pas les descendants",
      elements("<div style='display:grid'><div><p>a</p><p>b</p><p>c</p></div></div>")[0].enfants === 1,
    ],
    [
      "une grille creuse de capture est reconnue",
      creuxDeLaCapture('<div style="display: grid; grid-template-columns: 1.1fr 0.9fr;"><div>seul</div></div>').has("1.1fr .9fr|1"),
    ],
    [
      "une piste remplie d'un paragraphe VIDE compte comme vide",
      creuxDeLaCapture(
        '<div style="display: grid; grid-template-columns: 1.05fr 0.95fr;">' +
          "<div><h2>Le déroulé</h2></div><p><span class=\"sc-interp\"></span></p></div>",
      ).has("1.05fr .95fr|1"),
    ],
    [
      "une piste remplie d'un VRAI chapô ne compte pas comme vide",
      creuxDeLaCapture(
        '<div style="display: grid; grid-template-columns: 1.05fr 0.95fr;">' +
          "<div><h2>Le déroulé</h2></div><p>Un vrai chapô.</p></div>",
      ).size === 0,
    ],
    [
      "une grille PLEINE de capture n'est pas reconnue creuse",
      creuxDeLaCapture('<div style="display: grid; grid-template-columns: 1fr 1fr;"><div>a</div><div>b</div></div>').size === 0,
    ],
  ];

  /* b. Les 244 captures : aucune bande creuse, donc rien à tolérer de ce côté. */
  const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
  const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
  let capturesACreux = 0;
  let capturesLues = 0;
  for (const p of pagesIndex) {
    const html = capture(p?.url);
    if (html === null) continue;
    capturesLues++;
    if (bandesDeLaCapture(html).size > 0) capturesACreux++;
  }
  pures.push([
    `les captures sont lues en nombre (${capturesLues})`,
    capturesLues > 200,
  ]);
  pures.push([
    `une minorité de captures creuse ses bandes (${capturesACreux}/${capturesLues}), ` +
      "donc la tolérance a du sens et ne couvre pas tout",
    capturesACreux > 0 && capturesACreux < capturesLues / 10,
  ]);
  pures.push([
    "les captures de /travaux-industriels/ et /offres/zero-arret/ REMPLISSENT leurs bandes",
    bandesDeLaCapture(capture("/travaux-industriels/") ?? "").size === 0 &&
      bandesDeLaCapture(capture("/offres/zero-arret/") ?? "").size === 0,
  ]);
  pures.push([
    "une bande creuse de capture est reconnue par son style",
    bandesDeLaCapture(
      '<div style="display: flex; justify-content: space-between; padding: 22px 30px; border-radius: 28px;">' +
        "<span></span><a>le bouton</a></div>",
    ).has(normaliseStyle("display:flex;justify-content:space-between;padding:22px 30px;border-radius:28px")),
  ]);
  pures.push([
    "une bande REMPLIE de capture n'est pas reconnue creuse",
    bandesDeLaCapture(
      '<div style="display: flex; justify-content: space-between; padding: 22px 30px; border-radius: 28px;">' +
        "<span>la phrase</span><a>le bouton</a></div>",
    ).size === 0,
  ]);

  /* c. La géométrie, dans un vrai navigateur, sur une page à défauts injectés.
        Six cas, trois fautes et trois contrôles négatifs. Si le relevé ne
        rapporte pas EXACTEMENT les trois fautes, la porte est aveugle. */
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent(`<main style="width:1200px">
    <div id="bande-pleine" style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px 22px 30px;border-radius:28px;width:1120px">
      <div style="width:800px">la phrase</div><a style="display:inline-flex;width:231px">le bouton</a></div>
    <div id="bande-creuse" style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px 22px 30px;border-radius:28px;width:1120px">
      <div style="display:flex;margin-left:auto"><a style="display:inline-flex;width:231px">le bouton</a></div></div>
    <div id="bande-centree" style="display:flex;justify-content:space-between;align-items:center;padding:22px 24px 22px 30px;border-radius:28px;width:1120px">
      <div style="display:flex;margin-inline:auto"><a style="display:inline-flex;width:231px">le bouton</a></div></div>
    <div id="grille-pleine" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;width:1120px">
      <div>a</div><div>b</div><div>c</div></div>
    <div id="grille-creuse" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;width:1120px">
      <div>a</div><div>b</div></div>
    <div id="grille-autofit" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:4px 44px;width:1120px">
      <div>une seule carte</div></div>
  </main>`);
  const vu = await page.evaluate(releve, CENTRAGE_TOLERE);
  await nav.close();

  const bandes = vu.bandes.map((b) => b.texte);
  const grilles = vu.grilles.map((g) => g.texte);
  const geo = [
    ["la bande CREUSE est vue", vu.bandes.length === 1 && bandes[0].includes("le bouton")],
    ["la bande PLEINE est acceptée", !bandes.some((t) => t.includes("la phrase"))],
    ["la bande à bouton CENTRÉ est acceptée", vu.bandes.length === 1],
    ["la part de vide est chiffrée", (vu.bandes[0]?.part ?? 0) >= 70],
    ["la grille CREUSE est vue", vu.grilles.length === 1 && grilles[0] === "ab"],
    ["la grille PLEINE est acceptée", !grilles.includes("abc")],
    ["la grille `auto-fit` à une carte est acceptée", !grilles.some((t) => t.includes("une seule carte"))],
  ];

  const verdicts = [...pures, ...geo];
  for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  const reussis = verdicts.filter(([, ok]) => ok).length;
  if (reussis !== verdicts.length) {
    console.log(`\ntémoin NON conforme : ${reussis}/${verdicts.length}`);
    process.exit(1);
  }
  console.log(`\ntémoin conforme (${verdicts.length}/${verdicts.length}), la porte sait échouer`);
  process.exit(0);
}

/* ------------------------------------------------------------ la mesure */

/** Le HTML de la capture figée d'une URL, ou `null` si elle n'en a pas. */
function capture(url) {
  if (!url) return null;
  const cle = url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "accueil";
  try {
    return readFileSync(join(RACINE, "maquette/rendu", `${cle}.html`), "utf8");
  } catch {
    return null;
  }
}

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const urls = [
  ...new Set(
    pagesIndex
      .filter((p) => String(p?.gabarit ?? "").startsWith("03"))
      .map((p) => p?.url)
      .filter(Boolean),
  ),
];

if (urls.length === 0) {
  console.log("aucune page du gabarit 03 dans l'index : rien à mesurer.");
  process.exit(1);
}

const { chromium } = await import("playwright");
const nav = await chromium.launch();
const fautes = [];
const injoignables = [];
let mesurees = 0;
let bandes = 0;
let grilles = 0;
let tolerees = 0;
const sansCapture = new Set();

for (const largeur of [1440, 390]) {
  const ctx = await nav.newContext({ viewport: { width: largeur, height: 1000 } });
  const page = await ctx.newPage();
  for (const url of urls) {
    let reponse;
    try {
      reponse = await page.goto(SITE + url, { waitUntil: "load", timeout: 45000 });
    } catch (erreur) {
      injoignables.push(`${url} @${largeur} : ${erreur?.name ?? "injoignable"}`);
      continue;
    }
    if (!reponse || !reponse.ok()) {
      injoignables.push(`${url} @${largeur} : HTTP ${reponse?.status() ?? "?"}`);
      continue;
    }
    /* Le bandeau de consentement et la pastille de Next couvrent la page et ont
       déjà compté pour de faux pixels : on les écarte avant de mesurer. */
    const refus = page.getByRole("button", { name: "Tout refuser" });
    if (await refus.count()) await refus.first().click().catch(() => {});
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
    await page.waitForTimeout(150);

    const vu = await page.evaluate(releve, CENTRAGE_TOLERE);
    mesurees++;

    const figee = capture(url);
    /* LA BANDE SE JUGE CONTRE SA CAPTURE, comme la grille. Sans capture, elle se
       juge quand même : une page que la maquette ne décrit pas n'a aucune raison
       d'avoir un trou, et personne ne peut invoquer une référence absente. */
    const bandesTolerees = figee === null ? new Set() : bandesDeLaCapture(figee);
    for (const b of vu.bandes) {
      if (bandesTolerees.has(normaliseStyle(b.style))) {
        tolerees++;
        continue;
      }
      bandes++;
      fautes.push(
        `${url} @${largeur} : bande creuse, ${b.part} % du dedans vide ` +
          `(${b.largeur} px de bande, un seul enfant de ${b.enfant} px, ` +
          `${b.avant} px avant et ${b.apres} px après) « ${b.texte} »`,
      );
    }

    /* LA GRILLE NE SE JUGE QUE CONTRE SA CAPTURE, et c'est la règle du dépôt :
       la maquette creuse elle-même l'en-tête de ses sections. Sans capture, la
       porte ne dit pas « c'est bon », elle dit qu'elle n'a pas de référence, et
       elle le compte. */
    if (figee === null) {
      sansCapture.add(url);
      continue;
    }
    const tolerance = creuxDeLaCapture(figee);
    for (const g of vu.grilles) {
      const forme = `${normaliseGabarit(g.gabarit)}|${g.enfants}`;
      if (tolerance.has(forme)) {
        tolerees++;
        continue;
      }
      grilles++;
      fautes.push(
        `${url} @${largeur} : grille creuse, ${g.vides} piste(s) sur ${g.pistes} ` +
          `sans aucun enfant pour ${g.enfants} enfant(s), ${g.perdu} px perdus ` +
          `sur ${g.largeur} [${normaliseGabarit(g.gabarit)}] « ${g.texte} »`,
      );
    }
  }
  await ctx.close();
}
await nav.close();

/* LE VERDICT DE COUVERTURE PASSE AVANT TOUT AUTRE : conclure sur un échantillon
   muet, c'est annoncer un vert qu'on n'a pas mesuré. */
if (injoignables.length > 0) {
  console.log(`MESURE NON CONCLUANTE : ${injoignables.length} relevé(s) n'ont pas abouti.`);
  for (const i of injoignables.slice(0, 10)) console.log(`  ${i}`);
  console.log(`\nLe site doit répondre sur ${urls.length} adresses à deux largeurs (${SITE}).`);
  process.exit(1);
}

if (fautes.length > 0) {
  for (const f of fautes.slice(0, 14)) console.log(`  ${f}`);
  if (fautes.length > 14) console.log(`  … et ${fautes.length - 14} autres`);
  console.log(
    `\n${bandes} bande(s) creuse(s) et ${grilles} grille(s) creuse(s) sur ` +
      `${mesurees} relevés. Une piste déclarée qui ne porte rien est un trou.`,
  );
  process.exit(1);
}

console.log(
  `pistes vides : aucune. ${mesurees} relevés sur ${urls.length} pages du gabarit 03, ` +
    `à 1440 et 390 px. ${tolerees} grille(s) creuse(s) tolérée(s) parce que la ` +
    `capture figée les déclare pareil. ${sansCapture.size} page(s) sans capture : ` +
    `leurs bandes sont jugées, leurs grilles ne peuvent pas l'être` +
    (sansCapture.size > 0 ? ` (${[...sansCapture].join(", ")})` : "") + ".",
);
