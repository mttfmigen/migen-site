#!/usr/bin/env node
/**
 * AU TÉLÉPHONE, UN SEUL FORMULAIRE EN BAS DE PAGE, ET IL EST CELUI DE LA V3.
 *
 *   node components/site/mobile/verification-carte-navigateur.mjs http://localhost:4547
 *   node components/site/mobile/verification-carte-navigateur.mjs --controle
 *
 * À 390 px, sur une page de chaque gabarit qui pose son formulaire complet
 * juste après la carte `#etre-rappele` (ville, hub des implantations, page
 * « à propos », offre) :
 *
 *   1. UN SEUL FORMULAIRE : la carte en affiche un ; après elle, aucun
 *      formulaire ni aucune bascule de formulaire replié n'est affiché.
 *   2. LES LIENS ARRIVENT À LA CARTE : chaque lien qui visait le formulaire
 *      masqué, cliqué, pose `#etre-rappele` et amène la carte sous l'en-tête
 *      flottant (haut entre 40 et 200 px), jamais sur une bascule fermée.
 *   3. LES CIBLES DE LA CARTE, au rendu : chaque bouton, champ et liste fait
 *      au moins 44 px, « Suivant », « Retour » et l'envoi compris. La porte
 *      avance les étapes avec des valeurs d'essai et N'ENVOIE RIEN : toute
 *      requête hors de l'hôte local est coupée, et un appel à /api/lead fait
 *      tomber la porte.
 *   4. LE DESSIN DES CHAMPS DE LA V3 (L139), au rendu, sur la carte et sur
 *      /contact/ : libellés #6a6764, saisies de 50 px, indicatif dans son
 *      propre cadre de 14 px, bouton de 54 px.
 *
 * `--controle` : des relevés fabriqués, chacun fautif d'une seule façon,
 * doivent chacun faire tomber leur verdict.
 */
const args = process.argv.slice(2);
const CONTROLE = args.includes("--controle");
const PAGES = ["/implantations/bordeaux/", "/implantations/", "/nous-connaitre/", "/offres/residence/"];
const ID_CARTE = "etre-rappele";
const CIBLE_MIN = 44;
const DESSIN_V3 = { libelle: "rgb(106, 103, 100)", saisie: 50, indicatifRayon: "14px", bouton: 54 };

/* ---------------------------------------------------------------- verdicts */

function unSeulFormulaire(r) {
  const d = [];
  if (r.formulairesCarte !== 1) d.push(`${r.formulairesCarte} formulaire(s) affiché(s) dans la carte`);
  for (const x of r.apres) d.push(`affiché après la carte : ${x}`);
  return d;
}

function liensVersLaCarte(r) {
  return r.liens
    .filter((l) => l.hash !== `#${ID_CARTE}` || l.haut < 40 || l.haut > 200)
    .map((l) => `${l.href} « ${l.texte} » arrive sur ${l.hash || "(rien)"}, carte à ${l.haut} px`);
}

function ciblesAssez(r) {
  return r.cibles.filter((c) => c.h < CIBLE_MIN).map((c) => `${c.nom} : ${c.h} px`);
}

function dessinV3(r) {
  const d = [];
  if (r.libelle !== DESSIN_V3.libelle) d.push(`libellé ${r.libelle}`);
  if (r.saisie !== DESSIN_V3.saisie) d.push(`saisie de ${r.saisie} px`);
  if (r.indicatifRayon !== DESSIN_V3.indicatifRayon) d.push(`indicatif au rayon ${r.indicatifRayon}`);
  if (r.bouton !== DESSIN_V3.bouton) d.push(`bouton de ${r.bouton} px`);
  return d;
}

if (CONTROLE) {
  const tombe = (nom, defauts) => {
    if (!defauts.length) throw new Error(`témoin « ${nom} » : le verdict n'a rien vu`);
    console.log(`  témoin : ${nom} -> ${defauts[0]}`);
  };
  tombe("bascule repliée sous la carte", unSeulFormulaire({ formulairesCarte: 1, apres: ["Décrire mon besoin ›"] }));
  tombe("carte sans formulaire", unSeulFormulaire({ formulairesCarte: 0, apres: [] }));
  tombe("lien resté sur #mgx-form", liensVersLaCarte({ liens: [{ href: "#mgx-form", texte: "x", hash: "#mgx-form", haut: 90 }] }));
  tombe("carte sous l'en-tête", liensVersLaCarte({ liens: [{ href: "#mgx-form", texte: "x", hash: `#${ID_CARTE}`, haut: 0 }] }));
  tombe("bouton de 30 px", ciblesAssez({ cibles: [{ nom: "Retour", h: 30 }] }));
  tombe("libellé gris du bureau", dessinV3({ ...DESSIN_V3, libelle: "rgb(110, 110, 110)" }));
  tombe("saisie de 44 px", dessinV3({ ...DESSIN_V3, saisie: 44 }));
  console.log("les 7 témoins tombent : la porte sait échouer");
  process.exit(0);
}

/* ---------------------------------------------------------------- relevés */

const BASE = args.find((a) => /^https?:\/\//.test(a));
if (!BASE) {
  console.error("usage : node components/site/mobile/verification-carte-navigateur.mjs <url du site> | --controle");
  process.exit(2);
}
const { chromium } = await import("playwright");
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
// Le bandeau de consentement couvrirait les boutons : choix déjà fait, tout refusé.
const refus = { version: "2026-10-14", visiteur: null, le: new Date().toISOString(),
  choix: { mesure_audience: false, publicite: false, personnalisation: false, suivi_commercial: false } };
await ctx.addCookies([{ name: "migen_consentement", value: encodeURIComponent(JSON.stringify(refus)), url: BASE }]);
ctx.setDefaultTimeout(10000);
const envois = [];
await ctx.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.pathname.startsWith("/api/lead")) envois.push(url.pathname);
  return url.hostname === new URL(BASE).hostname && !url.pathname.startsWith("/api/lead") ? route.continue() : route.abort();
});

/** Le dessin des champs du formulaire posé sous `racine`. */
const releveDessin = (racine) => {
  const f = document.querySelector(racine);
  const h = (e) => (e ? Math.round(e.getBoundingClientRect().height) : 0);
  const bouton = [...f.querySelectorAll("button")].find((b) => b.getClientRects().length);
  return {
    libelle: getComputedStyle(f.querySelector("label")).color,
    saisie: h(f.querySelector('input[name="entreprise"]')),
    indicatifRayon: getComputedStyle(f.querySelector('select[name="indicatif"]')).borderTopLeftRadius,
    bouton: h(bouton),
  };
};

/** Les cibles affichées de la carte, nommées. */
const releveCibles = (id) =>
  [...document.getElementById(id).querySelectorAll("button, input:not([type=hidden]), select, textarea")]
    .filter((e) => e.getClientRects().length && !e.closest('[aria-hidden="true"]'))
    .map((e) => ({ nom: e.getAttribute("name") || e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height) }));

const echecs = [];
const note = (page, verdict, defauts) => defauts.forEach((d) => echecs.push(`${page} · ${verdict} : ${d}`));

for (const chemin of PAGES) {
  const p = await ctx.newPage();
  await p.goto(BASE + chemin, { waitUntil: "networkidle", timeout: 120000 });
  const fin = await p.evaluate((id) => {
    const carte = document.getElementById(id);
    if (!carte) return null;
    const affiche = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
    const apres = (e) => carte.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING && !carte.contains(e);
    return {
      formulairesCarte: [...carte.querySelectorAll("form")].filter(affiche).length,
      apres: [...document.querySelectorAll("main form, main details[data-repli-formulaire] > summary")]
        .filter((e) => apres(e) && affiche(e))
        .map((e) => (e.tagName === "FORM" ? "un formulaire" : `la bascule « ${e.textContent.trim()} »`)),
    };
  }, ID_CARTE);
  if (!fin) {
    note(chemin, "carte", ["#etre-rappele absente"]);
    await p.close();
    continue;
  }
  note(chemin, "un seul formulaire", unSeulFormulaire(fin));

  const nLiens = await p.evaluate((id) => {
    const voisin = document.getElementById(id).nextElementSibling;
    window.__liens = [...document.querySelectorAll('a[href^="#"]')].filter((a) => {
      const c = document.getElementById(a.getAttribute("href").slice(1));
      return c && voisin && voisin.contains(c);
    });
    return window.__liens.length;
  }, ID_CARTE);
  const liens = [];
  for (let i = 0; i < nLiens; i++) {
    liens.push(
      await p.evaluate(
        async ([i, id]) => {
          scrollTo(0, 0);
          const a = window.__liens[i];
          a.click();
          await new Promise((r) => setTimeout(r, 300));
          return {
            href: a.getAttribute("href"),
            texte: a.textContent.trim().slice(0, 40),
            hash: location.hash,
            haut: Math.round(document.getElementById(id).getBoundingClientRect().top),
          };
        },
        [i, ID_CARTE],
      ),
    );
  }
  note(chemin, "liens vers la carte", liensVersLaCarte({ liens }));

  if (chemin === PAGES[0]) {
    note(chemin, "dessin V3", dessinV3(await p.evaluate(releveDessin, `#${ID_CARTE}`)));
    // Les trois étapes, sans envoi : chaque cible affichée est relevée.
    const cibles = new Map();
    const releve = async () => (await p.evaluate(releveCibles, ID_CARTE)).forEach((c) => cibles.set(c.nom, c));
    const carte = p.locator(`#${ID_CARTE}`);
    await releve();
    await carte.locator('input[name="entreprise"]').fill("Essai");
    await carte.locator('input[name="telephone"]').fill("0612345678");
    await carte.getByRole("button", { name: "Suivant" }).click();
    await releve();
    await carte.locator('input[name="nom"]').fill("Essai");
    await carte.locator('input[name="prenom"]').fill("Essai");
    await carte.locator('input[name="email"]').fill("essai@exemple.fr");
    await carte.getByRole("button", { name: "Suivant" }).click();
    await releve();
    const noms = [...cibles.keys()];
    for (const attendu of ["Suivant", "Retour", "message"]) {
      if (!noms.some((n) => n.includes(attendu))) note(chemin, "cibles", [`« ${attendu} » jamais affiché : étapes non parcourues`]);
    }
    note(chemin, "cibles", ciblesAssez({ cibles: [...cibles.values()] }));
  }
  await p.close();
}

const contact = await ctx.newPage();
await contact.goto(BASE + "/contact/", { waitUntil: "networkidle", timeout: 120000 });
note("/contact/", "dessin V3", dessinV3(await contact.evaluate(releveDessin, "[data-champs-v3]")));
await nav.close();

if (envois.length) echecs.push(`ENVOI TENTÉ vers ${envois.join(", ")} : la porte ne doit jamais envoyer`);
if (echecs.length) {
  console.error(`carte du téléphone : ${echecs.length} défaut(s)\n  ${echecs.join("\n  ")}`);
  process.exit(1);
}
console.log(`carte du téléphone : ${PAGES.length} pages, un seul formulaire, liens vers la carte, cibles >= ${CIBLE_MIN} px, dessin V3 tenu (et /contact/).`);
