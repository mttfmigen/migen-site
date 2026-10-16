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
 *   · zéro débordement horizontal à 390 px, page par page, au navigateur ;
 *   · LE FORMULAIRE DE LA V3 (`MigenLPForm`), deux fois par LP (héros et
 *     contact), sur un seul écran : titre `form.t`, « Rappel dans l'heure »,
 *     les six champs du site dans l'ordre de la V3, tous obligatoires, les six
 *     indicatifs, le bouton, la mention RGPD du site ; ni « Votre demande
 *     concerne », ni étape. Au téléphone (390 px) et sur écran tactile en
 *     paysage (932 px), aucun champ sous 16 px (Safari zoomerait) ni
 *     indicatif tronqué ; au clavier, le focus de l'indicatif et du numéro
 *     se voit, à l'intérieur de leur enveloppe. Et l'ENVOI, au navigateur,
 *     `/api/lead` intercepté avant le serveur (aucune requête ne l'atteint,
 *     donc rien vers HubSpot ni Supabase) : saisie vide refusée sans envoi,
 *     messages sous le libellé affiché, charge du site (pays de l'indicatif
 *     compris) sans rien de l'ancien formulaire, erreur du serveur affichée
 *     avec la saisie gardée, puis succès : `hubspot_form_submit` au dataLayer
 *     et /lp/rendez-vous/ ; piège rempli : aucune conversion.
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

import { PAGE_RENDEZ_VOUS_LP, formulaireLp } from "../components/lp/lead-lp.ts";
import { TELEPHONE_LP, TELEPHONE_SITE } from "../components/site/entete-donnees.ts";
import { estLandingPage } from "../lib/lp/adresses.ts";
import { motifsDuTexte } from "./verifie-lp-donnees.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const BUILD = join(RACINE, ".next", "server", "app");
const ACCUEIL_LP = "/lp/maintenance-industrielle-france/";
const LARGEUR_TELEPHONE = 390;
/** Un iPhone en paysage : plus large que le repli en une colonne, tactile quand même. */
const PAYSAGE_TACTILE = { viewport: { width: 932, height: 430 }, hasTouch: true, isMobile: true };
/** La place que prend la flèche d'une liste déroulante, au plus large des navigateurs. */
const LARGEUR_FLECHE = 20;
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

/* ------------------------------------------------- le formulaire de la V3 */

/** Les champs de `MigenLPForm` dans l'ordre du document : le piège, puis ceux de la V3. */
const NOMS_FORMULAIRE = ["site_web", "entreprise", "nom", "prenom", "email", "indicatif", "telephone", "message"];
const OBLIGATOIRES = ["entreprise", "nom", "prenom", "email", "telephone", "message"];
const LIBELLES_FORMULAIRE = ["Site web", "Nom de l’entreprise", "Nom", "Prénom", "Courriel", "Téléphone", "Message"];
const INDICATIFS_FORMULAIRE = ["FR +33", "BE +32", "CH +41", "ES +34", "CA +1", "AE +971"];
const ENVOI_FORMULAIRE = "On me rappelle dans l’heure";
const MENTION_RGPD = "Données traitées par Migen pour répondre à votre demande, enregistrées dans HubSpot.";
/** Ce que l'ancien formulaire (variante C de la LP en ligne) montrait, et que la V3 n'a pas. */
const RELIQUATS = [/type="radio"/, /Votre demande concerne/i, /[ÉE]tape \d/i, />\s*Continuer\s*</, /sans engagement/i];

const texteDe = (fragment) => unifie(decode(fragment.replace(/<[^>]*>/g, " ")));
const formulairesDe = (html) => [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((trouve) => trouve[0]);

/** Les défauts d'un formulaire de LP rendu, au regard de `MigenLPForm` et du titre `form.t` de la page. */
function defautsFormulaire(form, titre) {
  const defauts = [];
  const balises = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)].map((trouve) => trouve[0]);
  const noms = balises.map((balise) => /\sname="([^"]*)"/.exec(balise)?.[1] ?? "?");
  if (noms.join() !== NOMS_FORMULAIRE.join()) defauts.push(`champs ${noms.join(", ")}`);
  for (const nom of OBLIGATOIRES) {
    const balise = balises.find((b) => b.includes(` name="${nom}"`));
    if (balise && !/\srequired(?:="")?[\s/>]/.test(balise)) defauts.push(`« ${nom} » non obligatoire`);
  }
  const libelles = [...form.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)].map((t) => texteDe(t[1]).replace(/\s*\*$/, ""));
  if (libelles.join("|") !== LIBELLES_FORMULAIRE.join("|")) defauts.push(`libellés ${libelles.join(", ")}`);
  const indicatifs = [...form.matchAll(/<option\b[^>]*>([^<]*)<\/option>/g)].map((t) => texteDe(t[1]));
  if (indicatifs.join() !== INDICATIFS_FORMULAIRE.join()) defauts.push(`indicatifs ${indicatifs.join(", ")}`);
  const titreRendu = texteDe(/<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(form)?.[1] ?? "");
  if (titreRendu !== unifie(titre ?? "")) defauts.push(`titre « ${titreRendu} » au lieu de « ${titre} »`);
  const boutons = [...form.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)];
  if (boutons.length !== 1 || !/type="submit"/.test(boutons[0]?.[0] ?? "") || texteDe(boutons[0][1]) !== ENVOI_FORMULAIRE) {
    defauts.push(`boutons ${boutons.map((t) => `« ${texteDe(t[1])} »`).join(", ") || "absents"}`);
  }
  const texte = texteDe(form);
  if (!texte.includes("Rappel dans l’heure")) defauts.push("« Rappel dans l’heure » absent");
  if (!texte.includes(MENTION_RGPD) || !form.includes('href="/confidentialite/"')) defauts.push("mention RGPD du site absente");
  if (!/\smethod="post"/.test(form)) defauts.push("méthode autre que post : la saisie irait dans l'adresse sans JavaScript");
  for (const motif of RELIQUATS) if (motif.test(form)) defauts.push(`reliquat de l'ancien formulaire : ${motif}`);
  return defauts;
}

const titreFormulaire = (chemin) => DONNEES_LP.pages.find((page) => page.path === chemin)?.form?.t;

/** Sur écran tactile : un champ sous 16 px (Safari zoome au focus), un indicatif qui ne tient pas dans sa liste. */
async function defautsSaisieTactile(page) {
  return page.evaluate((fleche) => {
    const defauts = [];
    const mesure = document.createElement("canvas").getContext("2d");
    for (const champ of document.querySelectorAll("form input:not([name=site_web]), form select, form textarea")) {
      const style = getComputedStyle(champ);
      const taille = parseFloat(style.fontSize);
      if (!(taille >= 16)) defauts.push(`champ ${champ.name} à ${taille} px : Safari zoomera`);
      if (champ.tagName !== "SELECT") continue;
      mesure.font = style.font;
      const place = champ.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - fleche;
      const tronques = [...champ.options].filter((option) => mesure.measureText(option.text).width > place).map((option) => option.text);
      if (tronques.length) defauts.push(`indicatif tronqué dans ${champ.clientWidth} px : ${tronques.join(", ")}`);
    }
    return defauts;
  }, LARGEUR_FLECHE);
}

/** Au clavier, de l'adresse au numéro : le contour de l'indicatif puis du numéro, tracé dedans et lisible sur la carte. */
async function defautsFocusTelephone(page) {
  const defauts = [];
  await page.locator('form [name="email"]').first().focus();
  for (const nom of ["indicatif", "telephone"]) {
    await page.keyboard.press("Tab");
    const contour = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return { nom: document.activeElement.name, style: style.outlineStyle, largeur: parseFloat(style.outlineWidth), decalage: parseFloat(style.outlineOffset), couleur: style.outlineColor };
    });
    if (contour.nom !== nom) return [...defauts, `Tab mène à « ${contour.nom} » au lieu de « ${nom} »`];
    if (contour.style === "none" || contour.decalage + contour.largeur > 0) defauts.push(`focus de « ${nom} » rogné par son enveloppe (${contour.style} ${contour.largeur} px décalé de ${contour.decalage} px)`);
    if (contour.couleur !== "rgb(180, 73, 15)") defauts.push(`focus de « ${nom} » en ${contour.couleur} au lieu de l'orange foncé #b4490f`);
  }
  return defauts;
}

/* --------------------------------------------------- l'envoi, au navigateur */

const SAISIE = {
  entreprise: "Fonderie de vérification",
  nom: "Rivière",
  prenom: "Camille",
  email: "camille.riviere@exemple.invalid",
  telephone: "04 72 00 00 00",
  message: "Arrêt de ligne, besoin d'un électromécanicien.",
};
const CAMPAGNE = "?utm_source=google&utm_medium=cpc&utm_campaign=verification&gclid=Cj0verification_BwE";
/** Le message de la vraie route quand HubSpot refuse (app/api/lead/route.ts, ECHEC_DEPOT). */
const ECHEC_SERVEUR = "Nous n'avons pas pu enregistrer votre demande. Réessayez dans un instant.";
const CLE_RELEVE = "verifie-lp.datalayer";

/**
 * La charge que le formulaire du héros de la LP France doit poster, avec sa
 * campagne : les clés de `chargeUtile` (celle du site), rien de plus, rien de
 * moins, le pays de l'indicatif dans `etablissement` (champ caché `country`
 * de la V3), et l'adresse de la LP, gclid compris. Le titre de la page n'est
 * pas comparé.
 */
const chargeAttendue = (origine) => ({
  ...SAISIE,
  indicatif: "+33",
  site_web: "",
  etablissement: { country: "FR" },
  formulaire: formulaireLp(ACCUEIL_LP, "heros"),
  attribution: { utm_source: "google", utm_medium: "cpc", utm_campaign: "verification", page_entree: ACCUEIL_LP, page_conversion: ACCUEIL_LP },
  page: { url: `${origine}${ACCUEIL_LP}${CAMPAGNE}` },
});

/** Ce que la charge postée a de différent de celle attendue. */
function defautsCharge(charge, origine) {
  const defauts = [];
  const attendue = chargeAttendue(origine);
  const cles = Object.keys(charge ?? {}).sort();
  if (cles.join() !== Object.keys(attendue).sort().join()) defauts.push(`charge aux clés ${cles.join(", ")}, pas celles du site`);
  for (const [cle, valeur] of Object.entries(attendue)) {
    if (cle !== "page" && JSON.stringify(charge?.[cle]) !== JSON.stringify(valeur)) defauts.push(`${cle} ${JSON.stringify(charge?.[cle])} au lieu de ${JSON.stringify(valeur)}`);
  }
  if (charge?.page?.url !== attendue.page.url) defauts.push(`page.url ${charge?.page?.url} : l'adresse de la LP, gclid compris, n'est pas transmise`);
  return defauts;
}

/**
 * Le parcours d'envoi du formulaire du héros, au téléphone. `/api/lead` est
 * intercepté dans le navigateur AVANT d'ouvrir la page : aucune requête
 * n'atteint le serveur (qui, lui, porterait la demande à HubSpot et à
 * Supabase avec les clés de `.env.local`). La réponse est celle de la vraie
 * route : 502 d'abord, puis 200.
 */
async function defautsEnvoi(navigateur, origine) {
  const defauts = [];
  const envois = [];
  let reponse = { status: 502, body: JSON.stringify({ ok: false, message: ECHEC_SERVEUR }) };
  const contexte = await navigateur.newContext({ viewport: { width: LARGEUR_TELEPHONE, height: 844 } });
  await contexte.route("**/api/lead**", (route) => {
    envois.push(route.request().postDataJSON());
    return route.fulfill({ ...reponse, contentType: "application/json" });
  });
  // Le dataLayer relevé dans la session : la page de rendez-vous le relit après la redirection.
  await contexte.addInitScript((cle) => {
    const couche = (window.dataLayer = window.dataLayer || []);
    const pousse = couche.push.bind(couche);
    couche.push = (...entrees) => {
      try {
        const vus = JSON.parse(sessionStorage.getItem(cle) || "[]");
        vus.push(...entrees.filter((e) => e && typeof e.event === "string").map((e) => JSON.parse(JSON.stringify(e))));
        sessionStorage.setItem(cle, JSON.stringify(vus));
      } catch {
        // Stockage absent (about:blank) : rien à relever.
      }
      return pousse(...entrees);
    };
  }, CLE_RELEVE);
  const conversions = (page) => page.evaluate((cle) => JSON.parse(sessionStorage.getItem(cle) || "[]").filter((e) => e.event === "hubspot_form_submit"), CLE_RELEVE);
  try {
    const page = await contexte.newPage();
    await page.goto(`${origine}${ACCUEIL_LP}${CAMPAGNE}`, { waitUntil: "networkidle" });
    const form = page.locator("form").first();
    const envoyer = form.locator('button[type="submit"]');

    // a. Vide : les six champs nommés, le curseur au premier, rien d'envoyé.
    await envoyer.click();
    await form.locator('[aria-invalid="true"]').first().waitFor({ timeout: 10_000 });
    const fautifs = await form.locator('[aria-invalid="true"]').evaluateAll((champs) => champs.map((c) => c.name));
    if (fautifs.join() !== OBLIGATOIRES.join()) defauts.push(`saisie vide : champs signalés ${fautifs.join(", ")}`);
    if ((await page.evaluate(() => document.activeElement?.getAttribute("name"))) !== "entreprise") defauts.push("saisie vide : le curseur n'est pas au premier champ");
    // Chaque message reprend le libellé affiché au-dessus du champ, pas celui du site.
    const messages = await form.locator('[aria-invalid="true"]').evaluateAll((champs) => champs.map((c) => document.getElementById(c.getAttribute("aria-describedby"))?.textContent ?? ""));
    const sansLibelle = messages.filter((message, i) => !message.startsWith(`${LIBELLES_FORMULAIRE[i + 1]} : `));
    if (sansLibelle.length) defauts.push(`messages d'erreur sans le libellé affiché : ${sansLibelle.join(" | ")}`);
    if (envois.length) defauts.push("saisie vide envoyée au serveur");

    // b. Le serveur refuse : son message, la saisie gardée, ni conversion ni départ.
    for (const [nom, valeur] of Object.entries(SAISIE)) await form.locator(`[name="${nom}"]`).fill(valeur);
    await envoyer.click();
    await form.locator('[role="status"]', { hasText: ECHEC_SERVEUR }).waitFor({ timeout: 10_000 });
    if (envois.length !== 1) defauts.push(`${envois.length} envoi(s) au lieu d'un`);
    else defauts.push(...defautsCharge(envois[0], origine));
    if (new URL(page.url()).pathname !== ACCUEIL_LP) defauts.push("erreur du serveur : la page est partie");
    for (const [nom, valeur] of Object.entries(SAISIE)) {
      if ((await form.locator(`[name="${nom}"]`).inputValue()) !== valeur) defauts.push(`erreur du serveur : « ${nom} » perdu`);
    }
    if ((await conversions(page)).length) defauts.push("erreur du serveur : une conversion poussée quand même");

    // c. Le serveur accepte : la conversion, puis la page de rendez-vous.
    reponse = { status: 200, body: JSON.stringify({ ok: true, message: "Votre demande est bien arrivée." }) };
    await envoyer.click();
    await page.waitForURL((adresse) => adresse.pathname === PAGE_RENDEZ_VOUS_LP, { timeout: 10_000 });
    const [conversion, ...enTrop] = await conversions(page);
    if (!conversion || enTrop.length) defauts.push(`${enTrop.length + (conversion ? 1 : 0)} événement(s) hubspot_form_submit au lieu d'un`);
    else if (conversion.page_path !== ACCUEIL_LP) defauts.push(`hubspot_form_submit pour ${conversion.page_path}`);
    if (envois.length !== 2) defauts.push(`${envois.length} envois en tout au lieu de deux`);

    // d. Piège rempli : la route répond comme pour une vraie demande (200), la
    //    carte dit « envoyée », mais aucune conversion ne part ni la page.
    const robot = await contexte.newPage();
    await robot.goto(`${origine}${ACCUEIL_LP}`, { waitUntil: "networkidle" });
    const formRobot = robot.locator("form").first();
    for (const [nom, valeur] of Object.entries(SAISIE)) await formRobot.locator(`[name="${nom}"]`).fill(valeur);
    await formRobot.locator('[name="site_web"]').evaluate((champ) => {
      champ.value = "https://robot.invalid";
    });
    await formRobot.locator('button[type="submit"]').click();
    await robot.getByText("Demande envoyée.").waitFor({ timeout: 10_000 });
    if (envois.length !== 3 || !envois[2]?.site_web) defauts.push("piège rempli : la demande n'est pas partie avec son piège");
    if ((await conversions(robot)).length) defauts.push("piège rempli : une conversion hubspot_form_submit poussée");
    if (new URL(robot.url()).pathname !== ACCUEIL_LP) defauts.push("piège rempli : la page est partie au rendez-vous");
  } catch (erreur) {
    defauts.push(`parcours d'envoi interrompu : ${erreur.message.split("\n")[0]}`);
  } finally {
    await contexte.close();
  }
  return defauts;
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

/** Les témoins du formulaire, sur un vrai formulaire servi : il doit passer, et chaque abîme être vu. */
function temoinsFormulaire(form, titre) {
  assert.deepEqual(defautsFormulaire(form, titre), [], "témoin sain refusé : formulaire");
  const doitRefuser = (nom, abime) => {
    temoinsVus += 1;
    if (abime === form) throw new Error(`témoin « ${nom} » : le formulaire n'a pas été abîmé`);
    if (!defautsFormulaire(abime, titre).length) {
      console.error(`TÉMOIN PASSÉ : ${nom}. La porte ne sait plus voir ce défaut.`);
      process.exit(2);
    }
  };
  const radio = '<fieldset><legend>Votre demande concerne</legend><input type="radio" name="demande" value="x"/></fieldset>';
  doitRefuser("« Votre demande concerne » ajouté", form.replace(/(<div style="display:grid)/, `${radio}$1`));
  doitRefuser("formulaire en deux étapes", form.replace(/(<h2\b)/, "<p>Étape 1 sur 2</p>$1"));
  doitRefuser("bouton « Continuer »", form.replace(new RegExp(ENVOI_FORMULAIRE), "Continuer"));
  doitRefuser("message facultatif", form.replace(/(<textarea\b[^>]*?)\srequired=""/, "$1"));
  doitRefuser("champ entreprise retiré", form.replace(/<input\b[^>]*\sname="entreprise"[^>]*>/, ""));
  doitRefuser("titre de la page perdu", form.replace(/(<h2\b[^>]*>)[^<]*/, "$1Décrire mon besoin"));
  doitRefuser("mention de la V3 « sans engagement »", form.replace(MENTION_RGPD, "Gratuit et sans engagement."));
  doitRefuser("indicatif CA perdu", form.replace(/<option\b[^>]*>CA \+1<\/option>/, ""));
  doitRefuser("méthode GET", form.replace(/\smethod="post"/, ""));

  // La charge : celle du site passe, celle de l'ancien formulaire non.
  const origine = "http://localhost:1";
  const attendue = chargeAttendue(origine);
  const bonne = { ...attendue, page: { ...attendue.page, titre: "LP" } };
  assert.deepEqual(defautsCharge(bonne, origine), [], "témoin sain refusé : charge du site");
  temoinsVus += 3;
  if (!defautsCharge({ ...bonne, etablissement: {} }, origine).length) {
    console.error("TÉMOIN PASSÉ : la charge sans le pays de l'indicatif. La porte ne sait plus la voir.");
    process.exit(2);
  }
  if (!defautsCharge({ ...bonne, source: "lp", demande: "x" }, origine).length) {
    console.error("TÉMOIN PASSÉ : la charge de l'ancien formulaire (source, demande). La porte ne sait plus la voir.");
    process.exit(2);
  }
  if (!defautsCharge({ ...bonne, page: { url: `${origine}${ACCUEIL_LP}`, titre: "LP" } }, origine).length) {
    console.error("TÉMOIN PASSÉ : l'adresse de la LP sans son gclid. La porte ne sait plus la voir.");
    process.exit(2);
  }
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
let formulairesLus = 0;
try {
  navigateur = await chromium.launch({ channel: "chrome" });
  // Les témoins du formulaire d'abord, sur le formulaire servi de la LP France.
  const formAccueil = formulairesDe((await demande(origine, ACCUEIL_LP)).html)[0];
  assert.ok(formAccueil, `aucun formulaire servi sur ${ACCUEIL_LP} : les témoins du formulaire n'ont rien à abîmer`);
  temoinsFormulaire(formAccueil, titreFormulaire(ACCUEIL_LP));
  for (const chemin of CHEMINS) {
    const reponse = await demande(origine, chemin);
    signale(chemin, defautsIndexation(reponse));
    signale(chemin, defautsHabillage(reponse.html));
    signale(chemin, defautsImages(reponse.html, origine));
    if (!sourcesImages(reponse.html).length) signale(chemin, ["aucune image relevée : le contrôle des images est aveugle"]);
    signale(chemin, defautsCopie(reponse.html, chemin));
    // Chaque LP porte au moins « Appeler le » et le pied : un relevé vide serait aveugle.
    if (textesDuGabarit(reponse.html).length < 5) signale(chemin, ["texte du gabarit non relevé : le contrôle de la copie est aveugle"]);
    // Le formulaire de la V3 : au héros et au contact sur une LP qui en porte un, nulle part ailleurs.
    const titre = titreFormulaire(chemin);
    const forms = formulairesDe(reponse.html);
    if (forms.length !== (titre ? 2 : 0)) signale(chemin, [`${forms.length} formulaire(s) au lieu de ${titre ? 2 : 0}`]);
    for (const form of forms) signale(chemin, defautsFormulaire(form, titre));
    formulairesLus += forms.length;
  }
  if (formulairesLus < CHEMINS.length) signale("/lp/", [`${formulairesLus} formulaires relevés : le contrôle du formulaire est aveugle`]);
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
  // Les témoins de la saisie tactile et du focus, sur la LP France : un champ
  // ramené à la taille de la V3, un indicatif à ses 86 px, un contour de focus
  // repoussé hors de l'enveloppe qui le rogne.
  const temoinsSaisie = [
    ["un champ à 14,5 px au téléphone", "[name=email]", "font-size", "14.5px", defautsSaisieTactile],
    ["l'indicatif à 86 px, « AE +971 » tronqué", "[name=indicatif]", "width", "86px", defautsSaisieTactile],
    ["le focus du numéro rogné par l'enveloppe", "[name=telephone]", "outline-offset", "3px", defautsFocusTelephone],
  ];
  for (const [nom, champ, propriete, valeur, controle] of temoinsSaisie) {
    await onglet.goto(`${origine}${ACCUEIL_LP}`, { waitUntil: "load" });
    await onglet.evaluate(([selecteur, p, v]) => document.querySelector(`form ${selecteur}`)?.style.setProperty(p, v, "important"), [champ, propriete, valeur]);
    temoinsVus += 1;
    if (!(await controle(onglet)).length) {
      console.error(`TÉMOIN PASSÉ : ${nom}. Le contrôle est aveugle.`);
      process.exit(2);
    }
  }
  await onglet.goto(`${origine}${ACCUEIL_LP}`, { waitUntil: "load" });
  signale(ACCUEIL_LP, await defautsFocusTelephone(onglet));
  for (const chemin of CHEMINS) {
    await onglet.goto(`${origine}${chemin}`, { waitUntil: "load" });
    const { exces, coupable } = await debordement(onglet);
    if (exces) signale(chemin, [`déborde de ${exces} px à ${LARGEUR_TELEPHONE} px (${coupable})`]);
    signale(chemin, (await defautsSaisieTactile(onglet)).map((defaut) => `${defaut} (${LARGEUR_TELEPHONE} px)`));
  }
  // Un iPhone en paysage : le formulaire n'est plus en une colonne, l'écran reste tactile.
  const paysage = await navigateur.newContext(PAYSAGE_TACTILE);
  const ongletPaysage = await paysage.newPage();
  await ongletPaysage.goto(`${origine}${ACCUEIL_LP}`, { waitUntil: "load" });
  signale(ACCUEIL_LP, (await defautsSaisieTactile(ongletPaysage)).map((defaut) => `${defaut} (tactile, ${PAYSAGE_TACTILE.viewport.width} px)`));
  await paysage.close();

  // 4. L'envoi, au navigateur, sans rien laisser partir.
  signale(ACCUEIL_LP, await defautsEnvoi(navigateur, origine));
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
    `aucun débordement à ${LARGEUR_TELEPHONE} px ; ${formulairesLus} formulaires de la V3 sur un seul écran, ` +
    `aucun champ sous 16 px ni indicatif tronqué au téléphone et en paysage tactile, focus visible du téléphone, ` +
    `envoi du site avec le pays, erreur sans perte sous le libellé affiché, conversion puis rendez-vous, aucune sur le piège ; ` +
    `${temoinsVus} témoins rouges vus rouges.`,
);
