/**
 * Mode consentement avancé : Tag Manager dès l'arrivée, balises non Google
 * bloquées jusqu'à l'accord (TagManager.tsx, 25/11).
 *
 *   node scripts/verifie-tag-manager.mjs http://localhost:3000/
 *
 * Toute requête de mesure est INTERCEPTÉE, notée puis annulée : seuls gtm.js et
 * gtag/js se chargent vraiment. On peut donc la jouer contre le vrai conteneur
 * (NEXT_PUBLIC_GTM_ID=GTM-53LHN66) sans rien envoyer à GA4, Ads ou LinkedIn.
 * Avec un identifiant de test, gtm.js répond 404 et les contrôles qui exigent
 * des balises en action sont sautés (le script le dit).
 *
 * TROIS ÉTAPES, en deux navigateurs neufs :
 *   1. l'arrivée : `default` à `denied` premier, la liste de blocage avant
 *      l'événement gtm.js, gtm.js demandé une fois, des signaux Google, et
 *      aucune requête non Google ;
 *   2. « Tout refuser » : toujours aucune requête non Google ;
 *   3. « Tout accepter » : la page se recharge, plus de liste de blocage,
 *      l'`update` accordé avant gtm.js, et les balises non Google partent.
 *
 * Imprime GOOGLE_AVANCE_TIERS_APRES_ACCORD et sort à 0 si tout tient, à 1 sinon.
 */
import { chromium } from "playwright";

const SITE = process.argv[2];
if (!SITE) {
  console.error("Usage : node scripts/verifie-tag-manager.mjs <url>");
  process.exit(2);
}

/** Mesure Google : les signaux du mode avancé, notés puis annulés. */
const GOOGLE = [
  "google-analytics.com",
  "analytics.google.com",
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com",
  "google.com",
  "google.fr",
];
/** Ce que le conteneur publié (version 28) porte hors Google. */
const TIERS = [
  "licdn.com",
  "linkedin.com",
  "bing.com",
  "hs-scripts.com",
  "hs-analytics.net",
  "hs-banner.com",
  "hscollectedforms.net",
  "hubspot.com",
  "wonderchat.io",
  "openai.com",
  "oaiusercontent.com",
];
const ATTENTE_MS = 4000;

const navigateur = await chromium.launch({ channel: "chrome" });
const echecs = [];
const verifie = (condition, message) => {
  if (!condition) echecs.push(message);
};
const sur = (hote, domaines) =>
  domaines.some((d) => hote === d || hote.endsWith(`.${d}`));

const litDataLayer = (page) =>
  page.evaluate(() =>
    Array.from(window.dataLayer ?? [], (entree) =>
      Object.prototype.toString.call(entree) === "[object Arguments]"
        ? Array.from(entree)
        : entree,
    ),
  );

const estDefautRefuse = (entree) =>
  Array.isArray(entree) &&
  entree[0] === "consent" &&
  entree[1] === "default" &&
  ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"].every(
    (signal) => entree[2]?.[signal] === "denied",
  );

async function ouvre() {
  const contexte = await navigateur.newContext();
  const releve = { gtm: [], google: [], tiers: [], conteneurReel: false };
  await contexte.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "www.googletagmanager.com") {
      if (url.pathname === "/gtm.js") releve.gtm.push(url.href);
      return route.continue();
    }
    if (sur(url.hostname, GOOGLE)) {
      releve.google.push(url.href);
      return route.abort();
    }
    if (sur(url.hostname, TIERS)) {
      releve.tiers.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  const page = await contexte.newPage();
  page.on("response", (reponse) => {
    if (reponse.url().includes("googletagmanager.com/gtm.js") && reponse.ok()) {
      releve.conteneurReel = true;
    }
  });
  const reponse = await page.goto(SITE, { waitUntil: "load", timeout: 90_000 });
  if (!reponse?.ok()) throw new Error(`${SITE} répond ${reponse?.status()}`);
  await page.waitForTimeout(ATTENTE_MS);
  return { contexte, page, releve };
}

const estBlocage = (entree) => Array.isArray(entree?.["gtm.blocklist"]);
const rangDe = (couche, test) => couche.findIndex(test);

try {
  // ------------------------------------------------- 1 et 2. arrivée, refus
  {
    const { contexte, page, releve } = await ouvre();
    const couche = await litDataLayer(page);
    const blocage = rangDe(couche, estBlocage);
    const debut = rangDe(couche, (e) => e?.event === "gtm.js");
    verifie(estDefautRefuse(couche[0]), `dataLayer[0] n'est pas le consent default denied : ${JSON.stringify(couche[0])}`);
    verifie(releve.gtm.length === 1, `à l'arrivée, gtm.js demandé ${releve.gtm.length} fois, attendu 1`);
    verifie(blocage > 0 && blocage < debut, `liste de blocage au rang ${blocage}, gtm.js au rang ${debut}`);
    verifie(releve.tiers.length === 0, `à l'arrivée, requêtes non Google : ${releve.tiers.join(", ")}`);
    if (releve.conteneurReel) {
      verifie(releve.google.length > 0, "à l'arrivée, aucun signal Google : le mode avancé ne part pas");
      verifie(
        releve.google.some((u) => /[?&]gcs=G100/.test(u)),
        "à l'arrivée, aucun signal Google en consentement refusé (gcs=G100)",
      );
    }
    console.log(`arrivée : ${releve.google.length} signaux Google, ${releve.tiers.length} non Google, conteneur ${releve.conteneurReel ? "réel" : "de test"}`);

    await page.getByRole("button", { name: "Tout refuser" }).click();
    await page.waitForTimeout(ATTENTE_MS);
    verifie(releve.tiers.length === 0, `après « Tout refuser », requêtes non Google : ${releve.tiers.join(", ")}`);
    verifie(releve.gtm.length === 1, "après « Tout refuser », la page s'est rechargée");
    await contexte.close();
  }

  // --------------------------------------------- 3. tout accepter, rechargement
  {
    const { contexte, page, releve } = await ouvre();
    const recharge = page.waitForEvent("load", { timeout: 20_000 });
    await page.getByRole("button", { name: "Tout accepter" }).click();
    verifie((await recharge.catch(() => null)) !== null, "après « Tout accepter », la page ne s'est pas rechargée");
    await page.waitForTimeout(ATTENTE_MS);

    const couche = await litDataLayer(page);
    const accord = rangDe(
      couche,
      (e) => Array.isArray(e) && e[0] === "consent" && e[1] === "update" && e[2]?.ad_storage === "granted",
    );
    const debut = rangDe(couche, (e) => e?.event === "gtm.js");
    verifie(estDefautRefuse(couche[0]), "après accord, dataLayer[0] n'est pas le consent default denied");
    verifie(rangDe(couche, estBlocage) === -1, "après accord, la liste de blocage est encore posée");
    verifie(accord > 0 && accord < debut, `update accordé au rang ${accord}, gtm.js au rang ${debut}`);
    verifie(couche.filter((e) => e?.event === "gtm.js").length === 1, "après accord, gtm.js n'est pas poussé exactement une fois");
    if (releve.conteneurReel) {
      verifie(releve.tiers.length > 0, "après accord, aucune balise non Google ne part");
    }
    console.log(`après « Tout accepter » : update ${accord}, gtm.js ${debut}, ${releve.tiers.length} requêtes non Google`);
    await contexte.close();
  }
} finally {
  await navigateur.close();
}

if (echecs.length > 0) {
  for (const echec of echecs) console.error(`ÉCHEC : ${echec}`);
  process.exit(1);
}
console.log("GOOGLE_AVANCE_TIERS_APRES_ACCORD");
