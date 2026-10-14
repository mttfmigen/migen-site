/**
 * Aucun tag avant le consentement, et Tag Manager après « Tout accepter ».
 *
 *   node scripts/verifie-tag-manager.mjs http://localhost:4431/
 *
 * À lancer sur un build fait avec NEXT_PUBLIC_GTM_ID=GTM-TEST0000 : sans
 * identifiant, le conteneur ne part jamais et la troisième étape échoue.
 *
 * QUATRE ÉTAPES, en deux navigateurs neufs :
 *   1. l'arrivée : aucune requête vers un domaine de traceur, et le premier
 *      élément du dataLayer est le `consent default` à `denied` ;
 *   2. « Tout refuser » : toujours aucune requête ;
 *   3. « Tout accepter » : gtm.js est demandé, et le dataLayer porte dans
 *      l'ordre le `default` à `denied`, l'événement gtm.js, et autour de lui
 *      le `consent update` accordé et l'événement `migen_consentement` ;
 *   4. le retour du même visiteur : default toujours premier, gtm.js une fois.
 *
 * Imprime AUCUN_TAG_AVANT_CONSENTEMENT et sort à 0 si tout tient, sort à 1 sinon.
 */
import { chromium } from "playwright";

const SITE = process.argv[2];
if (!SITE) {
  console.error("Usage : node scripts/verifie-tag-manager.mjs <url>");
  process.exit(2);
}

/** Tout domaine de traceur que le site sait charger. */
const TRACEURS = [
  "googletagmanager.com",
  "google-analytics.com",
  "doubleclick.net",
  "googleadservices.com",
  "licdn.com",
  "hs-scripts.com",
];
/** Le temps laissé aux scripts `afterInteractive` pour partir, s'ils devaient. */
const ATTENTE_MS = 2500;

const navigateur = await chromium.launch({ channel: "chrome" });
const echecs = [];
const verifie = (condition, message) => {
  if (!condition) echecs.push(message);
};

/** Le dataLayer lisible : les `arguments` de gtag deviennent des tableaux. */
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
  const page = await contexte.newPage();
  const traceurs = [];
  page.on("request", (requete) => {
    const hote = new URL(requete.url()).hostname;
    if (TRACEURS.some((domaine) => hote === domaine || hote.endsWith(`.${domaine}`))) {
      traceurs.push(requete.url());
    }
  });
  const reponse = await page.goto(SITE, { waitUntil: "load", timeout: 60_000 });
  if (!reponse?.ok()) throw new Error(`${SITE} répond ${reponse?.status()}`);
  await page.waitForTimeout(ATTENTE_MS);
  return { contexte, page, traceurs };
}

try {
  // -------------------------------------------- 1 et 2. arrivée, puis refus
  {
    const { contexte, page, traceurs } = await ouvre();
    verifie(traceurs.length === 0, `à l'arrivée, requêtes de traceur : ${traceurs.join(", ")}`);
    const couche = await litDataLayer(page);
    verifie(
      estDefautRefuse(couche[0]),
      `dataLayer[0] n'est pas le consent default denied : ${JSON.stringify(couche[0])}`,
    );

    await page.getByRole("button", { name: "Tout refuser" }).click();
    await page.waitForTimeout(ATTENTE_MS);
    verifie(traceurs.length === 0, `après « Tout refuser », requêtes de traceur : ${traceurs.join(", ")}`);
    await contexte.close();
  }

  // ------------------------------------------------------- 3. tout accepter
  {
    const { contexte, page, traceurs } = await ouvre();
    const conteneur = page.waitForRequest(
      (requete) => requete.url().startsWith("https://www.googletagmanager.com/gtm.js?id=GTM-"),
      { timeout: 15_000 },
    );
    await page.getByRole("button", { name: "Tout accepter" }).click();
    const demande = await conteneur.catch(() => null);
    verifie(demande !== null, "après « Tout accepter », gtm.js n'est pas demandé");
    await page.waitForTimeout(ATTENTE_MS);

    const couche = await litDataLayer(page);
    const rang = (test) => couche.findIndex(test);
    const defaut = rang(estDefautRefuse);
    const debut = rang((entree) => entree?.event === "gtm.js");
    const accord = rang(
      (entree) =>
        Array.isArray(entree) &&
        entree[0] === "consent" &&
        entree[1] === "update" &&
        entree[2]?.analytics_storage === "granted",
    );
    const choix = rang(
      (entree) =>
        entree?.event === "migen_consentement" &&
        entree.mesure_audience === true &&
        entree.publicite === true &&
        entree.personnalisation === true &&
        entree.suivi_commercial === true,
    );
    verifie(defaut === 0, `consent default denied au rang ${defaut}, attendu 0`);
    verifie(debut > defaut, `événement gtm.js au rang ${debut}, attendu après le default`);
    verifie(accord > defaut, `consent update granted au rang ${accord}, attendu après le default`);
    verifie(choix > defaut, `migen_consentement au rang ${choix}, attendu après le default`);
    verifie(
      couche.filter((entree) => entree?.event === "gtm.js").length === 1,
      "l'événement gtm.js n'est pas poussé exactement une fois",
    );
    verifie(
      traceurs.filter((url) => url.includes("/gtm.js?")).length === 1,
      `gtm.js demandé ${traceurs.filter((url) => url.includes("/gtm.js?")).length} fois, attendu 1`,
    );
    verifie(
      !traceurs.some((url) => url.includes("/gtag/js") || url.includes("licdn.com")),
      `avec un conteneur, gtag.js ou LinkedIn chargés en direct : ${traceurs.join(", ")}`,
    );
    console.log(
      `dataLayer après « Tout accepter » : default ${defaut}, update ${accord}, migen_consentement ${choix}, gtm.js ${debut}`,
    );

    // 4. Le visiteur qui revient : le choix est lu dans le cookie, le default
    //    reste premier et le conteneur repart une seule fois.
    traceurs.length = 0;
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(ATTENTE_MS);
    const retour = await litDataLayer(page);
    verifie(estDefautRefuse(retour[0]), "au retour, dataLayer[0] n'est pas le consent default denied");
    verifie(
      traceurs.filter((url) => url.includes("/gtm.js?")).length === 1,
      "au retour, gtm.js n'est pas demandé exactement une fois",
    );
    await contexte.close();
  }
} finally {
  await navigateur.close();
}

if (echecs.length > 0) {
  for (const echec of echecs) console.error(`ÉCHEC : ${echec}`);
  process.exit(1);
}
console.log("AUCUN_TAG_AVANT_CONSENTEMENT");
