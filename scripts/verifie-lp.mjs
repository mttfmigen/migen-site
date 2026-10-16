/**
 * LA PORTE DES LANDING PAGES SOUS /lp/, SUR LE BUILD.
 *
 *   bun run build && bun scripts/verifie-lp.mjs
 *   SITE_URL=http://localhost:4533 bun scripts/verifie-lp.mjs   (serveur déjà lancé)
 *
 * Demande de Mehdi du 16/10 : les landing pages publicitaires de la maquette
 * V3 sous migen.fr, dans un répertoire, « mais elles ne doivent pas être
 * référencées sur Google ». Sans `SITE_URL`, la porte démarre elle-même
 * `next start` sur le build (port `PORT_VERIFIE_LP`, 4599 par défaut) et
 * l'arrête à la fin.
 *
 * CE QU'ELLE TIENT, sur ce qui est réellement servi :
 *   · chaque page de `lib/lp/pages.json` répond 200, avec `<meta name="robots"
 *     content="noindex, nofollow">` ET l'en-tête `X-Robots-Tag: noindex,
 *     nofollow` ; le numéro des LP y est, celui du site non (ni en-tête, ni
 *     pied, ni barre basse du site) ; `/lp/` et `/lp` mènent à la LP France,
 *     une adresse inconnue sous /lp/ répond 404, dans l'habillage des LP ;
 *   · aucune adresse /lp/ dans les plans du site (index XML, sous-plans) ;
 *   · `robots.txt` ne bloque pas /lp/ (Google doit lire le noindex) ;
 *   · sur TOUTES les pages figées du build hors /lp/ : aucun lien vers /lp/,
 *     et le numéro des LP (04 11 78 95 97) absent, sous toutes ses écritures ;
 *   · aucune image externe sur une LP (`next/image` compris : l'adresse
 *     d'origine est relue dans `/_next/image?url=`) ;
 *   · LE TEXTE QUE LE GABARIT AJOUTE, sur la page rendue : chaque texte (et
 *     chaque `aria-label`, `alt`, `title`) qui n'est pas une chaîne de
 *     `lib/lp/pages.json` passe par les mêmes règles que la donnée
 *     (`motifsDuTexte` de verifie-lp-donnees.mjs). La donnée a sa porte ; le
 *     texte écrit dans les composants (« Choisissez votre créneau · 30 min »
 *     l'a montré) n'en avait aucune ;
 *   · zéro débordement horizontal à 390 px, page par page, au navigateur.
 *
 * ELLE PROUVE QU'ELLE SAIT ÉCHOUER : avant tout contrôle, chaque règle est
 * jouée sur un témoin abîmé et doit le refuser (y compris le débordement, sur
 * une vraie LP élargie au navigateur). Un témoin qui passe arrête tout (code 2).
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { TELEPHONE_LP, TELEPHONE_SITE } from "../components/site/entete-donnees.ts";
import { estLandingPage } from "../lib/lp/adresses.ts";
import { motifsDuTexte } from "./verifie-lp-donnees.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const BUILD = join(RACINE, ".next", "server", "app");
const ACCUEIL_LP = "/lp/maintenance-industrielle-france/";
const LARGEUR_TELEPHONE = 390;
/** En dessous, le build est incomplet ou mal lu : la porte refuserait de conclure sur du vide. */
const PAGES_SITE_MINIMUM = 200;

const DONNEES_LP = JSON.parse(readFileSync(join(RACINE, "lib", "lp", "pages.json"), "utf8"));
const CHEMINS = DONNEES_LP.pages.map((page) => page.path);

/* ------------------------------------------------------------- règles */

const chiffres = (texte) => texte.replace(/\D/g, "");
const NUMERO_LP = chiffres(TELEPHONE_LP.affichage); // 0411789597
/** Le numéro des LP sous toutes ses écritures : « 04 11 78 95 97 », « 0411789597 », « +33411789597 »… */
const portaLeNumeroLp = (html) => {
  const brut = html.replace(/&nbsp;|&#160;|[\s.\u00a0\u202f-]/g, "");
  return brut.includes(NUMERO_LP) || brut.includes(`33${NUMERO_LP.slice(1)}`);
};

function defautsIndexation({ statut, entete, html }) {
  const defauts = [];
  if (statut !== 200) defauts.push(`répond ${statut}`);
  const robots = /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? "";
  if (!/noindex/.test(robots) || !/nofollow/.test(robots)) defauts.push(`meta robots « ${robots} »`);
  if (!/noindex/i.test(entete ?? "") || !/nofollow/i.test(entete ?? "")) defauts.push(`X-Robots-Tag « ${entete ?? "absent"} »`);
  return defauts;
}

function defautsHabillage(html) {
  const defauts = [];
  if (!html.includes(TELEPHONE_LP.affichage)) defauts.push("numéro des LP absent");
  if (html.includes(TELEPHONE_SITE.affichage)) defauts.push("numéro du site présent (en-tête, pied ou barre du site)");
  return defauts;
}

/** Les cibles de lien : attributs `href` du HTML et `\"href\":\"…` du flux React, échappé dans la page. */
function cibles(html) {
  return [
    ...[...html.matchAll(/href="([^"]*)"/g)].map((trouve) => trouve[1]),
    ...[...html.matchAll(/\\"href\\":\\"([^"\\]*)/g)].map((trouve) => trouve[1]),
  ];
}

function cheminDe(cible, origine) {
  try {
    const url = new URL(cible.replace(/&amp;/g, "&"), origine);
    return url.origin === new URL(origine).origin || /migen\.fr$/.test(url.hostname) ? url.pathname : null;
  } catch {
    return null;
  }
}

function defautsLiens(html, origine) {
  return cibles(html)
    .map((cible) => cheminDe(cible, origine))
    .filter((chemin) => chemin && estLandingPage(chemin))
    .map((chemin) => `lien vers ${chemin}`);
}

function defautsPlan(xml, origine) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((trouve) => cheminDe(trouve[1], origine))
    .filter((chemin) => chemin && estLandingPage(chemin))
    .map((chemin) => `${chemin} au plan du site`);
}

/** Toutes les sources d'image d'une page : `src`, `srcset`, préchargements, `url(...)`. */
function sourcesImages(html) {
  const sources = [
    ...[...html.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/g)].map((t) => t[1]),
    ...[...html.matchAll(/\s(?:srcset|imageSrcSet|imagesrcset)="([^"]+)"/gi)].flatMap((t) => t[1].split(",").map((s) => s.trim().split(/\s+/)[0])),
    ...[...html.matchAll(/<link\b[^>]*as="image"[^>]*href="([^"]+)"/g)].map((t) => t[1]),
    ...[...html.matchAll(/url\((?:&quot;|["'])?([^)"'&]+)/g)].map((t) => t[1]),
  ];
  // `next/image` : l'image d'origine est dans le paramètre `url`.
  return sources.map((source) => {
    const optimisee = /\/_next\/image\?url=([^&]+)/.exec(source.replace(/&amp;/g, "&"));
    return optimisee ? decodeURIComponent(optimisee[1]) : source;
  });
}

function defautsImages(html, origine) {
  return sourcesImages(html)
    .filter((source) => !source.startsWith("data:"))
    .filter((source) => new URL(source, origine).origin !== new URL(origine).origin)
    .map((source) => `image externe ${source}`);
}

/* --------------------------------------------- le texte ajouté par le gabarit */

const unifie = (texte) => texte.replace(/\s+/g, " ").trim();

/** Toutes les chaînes de la donnée : ce texte-là est tenu par verifie-lp-donnees.mjs. */
const TEXTES_DONNEE = new Set();
(function collecte(valeur) {
  if (typeof valeur === "string") TEXTES_DONNEE.add(unifie(valeur));
  else if (Array.isArray(valeur)) valeur.forEach(collecte);
  else if (valeur && typeof valeur === "object") Object.values(valeur).forEach(collecte);
})(DONNEES_LP);

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
const decode = (texte) =>
  texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (brut, nom) =>
    nom[0] !== "#" ? (ENTITES[nom.toLowerCase()] ?? brut) : String.fromCodePoint(/^#x/i.test(nom) ? parseInt(nom.slice(2), 16) : Number(nom.slice(1))),
  );

/** Le texte de la page qui ne vient pas de la donnée : nœuds de texte et attributs lus à voix haute. */
function textesDuGabarit(html) {
  const visible = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ");
  return [
    ...new Set(
      [...visible.split(/<[^>]*>/), ...[...visible.matchAll(/\s(?:aria-label|alt|title|placeholder)="([^"]*)"/g)].map((t) => t[1])]
        .map((texte) => unifie(decode(texte)))
        .filter((texte) => texte && !TEXTES_DONNEE.has(texte)),
    ),
  ];
}

function defautsCopie(html, chemin) {
  return textesDuGabarit(html).flatMap((texte) => motifsDuTexte(texte, { page: chemin }).map((motif) => `${motif} : « ${texte.slice(0, 100)} »`));
}

/* ------------------------------------------------------ le navigateur */

async function debordement(page) {
  return page.evaluate(() => {
    const largeur = document.documentElement.clientWidth;
    const exces = document.documentElement.scrollWidth - largeur;
    if (exces <= 0) return { exces: 0 };
    const coupable = [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > largeur + 1)
      .sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
    return { exces, coupable: coupable ? `${coupable.tagName.toLowerCase()}.${coupable.className}`.slice(0, 120) : "?" };
  });
}

/* ------------------------------------------------------------ serveur */

async function demarreServeur() {
  if (process.env.SITE_URL) return { origine: process.env.SITE_URL.replace(/\/$/, ""), arrete: () => {} };
  assert.ok(existsSync(join(RACINE, ".next", "BUILD_ID")), "pas de build : lancer « bun run build » d'abord");
  const port = process.env.PORT_VERIFIE_LP ?? "4599";
  const origine = `http://localhost:${port}`;
  const serveur = spawn("bunx", ["next", "start", "-p", port], { cwd: RACINE, stdio: "ignore" });
  const limite = Date.now() + 60_000;
  for (;;) {
    try {
      await fetch(`${origine}/lp/`, { redirect: "manual" });
      break;
    } catch {
      if (Date.now() > limite) {
        serveur.kill();
        throw new Error(`next start ne répond pas sur ${origine}`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return { origine, arrete: () => serveur.kill() };
}

async function demande(origine, chemin) {
  const reponse = await fetch(`${origine}${chemin}`, { redirect: "manual" });
  return { statut: reponse.status, entete: reponse.headers.get("x-robots-tag"), lieu: reponse.headers.get("location"), html: await reponse.text() };
}

/** Les pages figées du build, avec leur adresse : `lp/devis.html` donne `/lp/devis/`. */
function pagesDuBuild() {
  const trouvees = [];
  const parcours = (dossier) => {
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, entree.name);
      if (entree.isDirectory()) parcours(chemin);
      else if (entree.name.endsWith(".html")) {
        const rel = relative(BUILD, chemin).split(sep).join("/").replace(/\.html$/, "");
        trouvees.push({ adresse: rel === "index" ? "/" : `/${rel}/`, fichier: chemin });
      }
    }
  };
  parcours(BUILD);
  return trouvees;
}

/* ------------------------------------------------------------ témoins */

const ORIGINE_TEMOIN = "http://localhost:1";
const PAGE_SAINE = `<meta name="robots" content="noindex, nofollow"/><a href="tel:+33411789597">${TELEPHONE_LP.affichage}</a><img src="/_next/image?url=%2Fassets%2Fweb%2Fx.jpg&amp;w=640&amp;q=75"/>`;

let temoinsVus = 0;

function temoins() {
  const saine = { statut: 200, entete: "noindex, nofollow", html: PAGE_SAINE };
  const doitRefuser = (nom, defauts) => {
    temoinsVus += 1;
    if (!defauts.length) {
      console.error(`TÉMOIN PASSÉ : ${nom}. La porte ne sait plus voir ce défaut.`);
      process.exit(2);
    }
  };
  assert.deepEqual(defautsIndexation(saine), [], "témoin sain refusé : indexation");
  assert.deepEqual(defautsHabillage(PAGE_SAINE), [], "témoin sain refusé : habillage");
  assert.deepEqual(defautsImages(PAGE_SAINE, ORIGINE_TEMOIN), [], "témoin sain refusé : images");
  doitRefuser("meta robots retiré", defautsIndexation({ ...saine, html: PAGE_SAINE.replace(/<meta[^>]*>/, "") }));
  doitRefuser("meta robots « index »", defautsIndexation({ ...saine, html: PAGE_SAINE.replace("noindex, nofollow", "index, follow") }));
  doitRefuser("X-Robots-Tag absent", defautsIndexation({ ...saine, entete: null }));
  doitRefuser("LP en 404", defautsIndexation({ ...saine, statut: 404 }));
  doitRefuser("numéro du site sur une LP", defautsHabillage(`${PAGE_SAINE}<footer>${TELEPHONE_SITE.affichage}</footer>`));
  doitRefuser("lien du site vers une LP", defautsLiens('<a href="/lp/devis/">Devis</a>', ORIGINE_TEMOIN));
  doitRefuser("lien absolu vers une LP", defautsLiens('<a href="https://migen.fr/lp/urgence/">x</a>', ORIGINE_TEMOIN));
  doitRefuser("lien vers une LP dans le flux React", defautsLiens('self.__next_f.push([1,"{\\"href\\":\\"/lp/merci/\\"}"])', ORIGINE_TEMOIN));
  doitRefuser("LP au plan du site", defautsPlan("<url><loc>https://migen.fr/lp/devis/</loc></url>", ORIGINE_TEMOIN));
  doitRefuser("numéro des LP sur le site", portaLeNumeroLp("<p>Appelez le 04 11 78 95 97</p>") ? ["vu"] : []);
  doitRefuser("numéro des LP en lien tel:", portaLeNumeroLp('<a href="tel:+33411789597">Appeler</a>') ? ["vu"] : []);
  doitRefuser("image externe", defautsImages('<img src="https://elements-resized.envatousercontent.com/x.jpg"/>', ORIGINE_TEMOIN));
  doitRefuser("image externe passée par next/image", defautsImages('<img src="/_next/image?url=https%3A%2F%2Fexemple.invalid%2Fx.jpg&amp;w=64"/>', ORIGINE_TEMOIN));
  doitRefuser("image externe en fond", defautsImages('<div style="background-image:url(&quot;https://exemple.invalid/x.jpg&quot;)"></div>', ORIGINE_TEMOIN));
  doitRefuser("délai chiffré écrit dans le gabarit", defautsCopie("<h2>Choisissez votre créneau · 30 min</h2>", "/lp/rendez-vous/"));
  doitRefuser("interdit dans un aria-label du gabarit", defautsCopie('<button aria-label="Devis gratuit et sans engagement">x</button>', "/lp/devis/"));
  doitRefuser("agence écrite dans le gabarit", defautsCopie("<p>Agence Paris &amp; La Défense</p>", "/lp/maintenance-industrielle-paris/"));
  // « 1 h » seul est un délai pour la règle ; c'est la moitié de « 1 h pour être rappelé », chiffre de la donnée.
  assert.deepEqual(defautsCopie("<div>1 h</div><div>pour être rappelé</div>", "/lp/devis/"), [], "une chaîne de la donnée relue comme texte du gabarit");
  assert.ok(!portaLeNumeroLp(`<p>${TELEPHONE_SITE.affichage}</p>`), "le numéro du site pris pour celui des LP");
  assert.deepEqual(defautsLiens('<a href="/lpx/">x</a><a href="/offres/lp/">y</a>', ORIGINE_TEMOIN), [], "une page du site prise pour une LP");
}

/* --------------------------------------------------------------- jeu */

temoins();
const defauts = [];
const signale = (ou, liste) => liste.forEach((defaut) => defauts.push(`${ou} : ${defaut}`));

// 1. Le build : toutes les pages figées, LP et site.
assert.ok(existsSync(BUILD), "pas de build : lancer « bun run build » d'abord");
const figees = pagesDuBuild();
const figeesLp = figees.filter((page) => estLandingPage(page.adresse));
const figeesSite = figees.filter((page) => !estLandingPage(page.adresse));
assert.equal(figeesLp.length, CHEMINS.length, `${figeesLp.length} LP figées au build pour ${CHEMINS.length} dans pages.json`);
assert.ok(figeesSite.length >= PAGES_SITE_MINIMUM, `${figeesSite.length} pages du site figées : build incomplet ou mal lu`);
const ORIGINE_SITE = "https://migen.fr";
let liensLus = 0;
for (const page of figeesSite) {
  const html = readFileSync(page.fichier, "utf8");
  liensLus += cibles(html).length;
  signale(page.adresse, defautsLiens(html, ORIGINE_SITE));
  if (portaLeNumeroLp(html)) signale(page.adresse, ["numéro des LP hors /lp/"]);
}
// Un relevé vide rendrait le contrôle des liens vert et aveugle.
assert.ok(liensLus > figeesSite.length * 20, `${liensLus} liens relevés sur ${figeesSite.length} pages : la lecture du HTML est cassée`);

// 2. Le serveur : en-têtes, redirections, plans du site, images.
const { origine, arrete } = await demarreServeur();
let navigateur;
try {
  navigateur = await chromium.launch({ channel: "chrome" });
  for (const chemin of CHEMINS) {
    const reponse = await demande(origine, chemin);
    signale(chemin, defautsIndexation(reponse));
    signale(chemin, defautsHabillage(reponse.html));
    signale(chemin, defautsImages(reponse.html, origine));
    if (!sourcesImages(reponse.html).length) signale(chemin, ["aucune image relevée : le contrôle des images est aveugle"]);
    signale(chemin, defautsCopie(reponse.html, chemin));
    // Chaque LP porte au moins « Appeler le » et le pied : un relevé vide serait aveugle.
    if (textesDuGabarit(reponse.html).length < 5) signale(chemin, ["texte du gabarit non relevé : le contrôle de la copie est aveugle"]);
  }
  for (const chemin of ["/lp/", "/lp"]) {
    const { statut, lieu } = await demande(origine, chemin);
    if (![307, 308].includes(statut) || !lieu?.endsWith(ACCUEIL_LP)) signale(chemin, [`répond ${statut} vers ${lieu} au lieu de ${ACCUEIL_LP}`]);
  }
  const inconnue = await demande(origine, "/lp/n-existe-pas/");
  if (inconnue.statut !== 404) signale("/lp/n-existe-pas/", [`répond ${inconnue.statut} au lieu de 404`]);
  // La 404 d'une LP garde l'habillage des LP : ni en-tête ni pied du site.
  signale("/lp/n-existe-pas/", defautsHabillage(inconnue.html));
  if (!/noindex/i.test(inconnue.entete ?? "")) signale("/lp/n-existe-pas/", ["X-Robots-Tag absent"]);

  const index = await demande(origine, "/sitemap_index.xml");
  assert.equal(index.statut, 200, "/sitemap_index.xml ne répond pas");
  const sousPlans = [...index.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((t) => new URL(t[1]).pathname);
  assert.ok(sousPlans.length >= 2, "l'index du plan du site ne liste plus ses sous-plans");
  signale("/sitemap_index.xml", defautsPlan(index.html, ORIGINE_SITE));
  for (const plan of sousPlans) {
    const { statut, html } = await demande(origine, plan);
    assert.equal(statut, 200, `${plan} ne répond pas`);
    signale(plan, defautsPlan(html, ORIGINE_SITE));
  }
  const robots = await demande(origine, "/robots.txt");
  if (/^disallow:\s*\/lp/im.test(robots.html)) signale("/robots.txt", ["/lp/ bloqué : Google ne lirait plus le noindex"]);
  // En local, robots.txt ferme tout (SITE_INDEXABLE) : la règle de production
  // se lit dans sa source, où « /lp » ne doit pas paraître.
  if (/["'`]\/lp\b/.test(readFileSync(join(RACINE, "app", "robots.ts"), "utf8"))) {
    signale("app/robots.ts", ["/lp/ nommé dans les règles : Google ne lirait plus le noindex"]);
  }

  // 3. Le téléphone : 390 px, aucun débordement. Le témoin d'abord, sur une vraie LP élargie.
  const contexte = await navigateur.newContext({ viewport: { width: LARGEUR_TELEPHONE, height: 844 } });
  const onglet = await contexte.newPage();
  await onglet.goto(`${origine}${CHEMINS[0]}`, { waitUntil: "load" });
  await onglet.evaluate(() => document.body.append(Object.assign(document.createElement("div"), { style: "width:2000px;height:1px" })));
  temoinsVus += 1;
  if (!(await debordement(onglet)).exces) {
    console.error("TÉMOIN PASSÉ : une LP élargie à 2000 px. Le contrôle du débordement est aveugle.");
    process.exit(2);
  }
  for (const chemin of CHEMINS) {
    await onglet.goto(`${origine}${chemin}`, { waitUntil: "load" });
    const { exces, coupable } = await debordement(onglet);
    if (exces) signale(chemin, [`déborde de ${exces} px à ${LARGEUR_TELEPHONE} px (${coupable})`]);
  }
} finally {
  await navigateur?.close();
  arrete();
}

if (defauts.length) {
  console.error(defauts.join("\n"));
  console.error(`${defauts.length} défaut(s) sur les landing pages.`);
  process.exit(1);
}
console.log(
  `landing pages conformes : ${CHEMINS.length} LP en 200, noindex en meta et en X-Robots-Tag, sans habillage du site ; ` +
    `/lp/ mène à la LP France ; aucune LP aux plans du site ni bloquée par robots.txt ; ` +
    `${figeesSite.length} pages du site sans lien vers /lp/ ni numéro des LP ; aucune image externe ; ` +
    `aucun interdit dans le texte ajouté par le gabarit ; ` +
    `aucun débordement à ${LARGEUR_TELEPHONE} px ; ${temoinsVus} témoins rouges vus rouges.`,
);
