#!/usr/bin/env node
/**
 * Porte du lecteur latéral, côté Articles : le lecteur dit TOUT le texte de la
 * page, sans mot perdu, et n'ajoute que ses libellés propres (listés ici).
 *
 *   node components/site/ressource/lecteur/verification-lecteur-articles.mjs http://localhost:5603
 *
 * Pour chaque article du plan du site, à 1280 px :
 *   page    : le <main> de l'URL chargée en entier ;
 *   lecteur : la feuille ouverte au-dessus du hub, par navigation douce
 *             (`window.next.router.push`, le chemin d'une carte du hub).
 * Les deux côtés ouvrent d'abord TOUTES leurs questions (`<details>`) : une
 * réponse repliée est du texte de la page, `innerText` ne la lirait pas.
 * Ce qui est masqué au bureau (couche de conversion du téléphone) n'est pas
 * lu : c'est la lecture de bureau que le lecteur remplace.
 *
 * Un mot = un jeton qui porte une lettre ou un chiffre, en minuscules
 * (`text-transform` change la casse d'`innerText`), ponctuation de bord ôtée.
 * Comparaison en multi-ensemble : un mot présent deux fois dans la page doit
 * l'être deux fois dans le lecteur.
 *
 * Les textes de remplacement des photos affichées (`alt` non vide) sont du
 * texte de la page : chacun doit se retrouver dans le lecteur (14/10, les
 * 12 billets repris perdaient le leur, et les 15 articles Migen montraient la
 * photo de la carte du hub, sans alt, au lieu de celle de la page).
 */
import { chromium } from "playwright";

import { locsDuPlan } from "../../../../scripts/plan-xml.mjs";

const base = process.argv[2] ?? "http://localhost:5603";

const mots = (t) =>
  (t ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .split(/\s+/)
    .map((m) => m.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").toLowerCase())
    .filter(Boolean);

/**
 * LES LIBELLÉS PROPRES DU LECTEUR, seuls mots qu'il a de plus que la page.
 * Chacun est un élément `[data-libelle-lecteur]` ; son texte doit être l'un
 * de ceux-ci, sinon c'est un mot ajouté qu'on ne déclare pas.
 *   « À retenir »                       surtitre de l'encadré (maquette)
 *   « migen.fr<url> Copier Fermer »     barre collante de la feuille
 *   « 01 », « 02 »…                     numéro d'une carte de puces (la page dit ✓)
 */
const LIBELLES_PROPRES = (url) => ["À retenir", `migen.fr${url} Copier Fermer`].map((t) => mots(t).join(" "));
const declare = (url, texte) => LIBELLES_PROPRES(url).includes(texte) || /^\d{2}$/.test(texte);

const compte = (liste) => {
  const m = new Map();
  for (const x of liste) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
};
const manque = (a, b) => {
  const out = [];
  for (const [mot, n] of a) for (let i = 0; i < n - (b.get(mot) ?? 0); i++) out.push(mot);
  return out;
};

const OUVRE_TOUT = () => {
  for (const d of document.querySelectorAll("details")) {
    d.removeAttribute("name");
    d.open = true;
  }
};

/** Les textes de remplacement non vides des photos affichées : du texte de la page aussi. */
const ALTS = (sel) =>
  [...(document.querySelector(sel)?.querySelectorAll("img") ?? [])]
    .filter((i) => i.offsetParent !== null && i.alt.trim())
    .map((i) => i.alt.trim());

// Index et sous-plans, au format de l'ancien site (`scripts/plan-xml.mjs`).
const urls = (await locsDuPlan(base))
  .map((loc) => new URL(loc).pathname)
  .filter((p) => /^\/ressources\/articles\/[^/]+\/$/.test(p));
if (urls.length < 20) {
  console.error(`MESURE NON CONCLUANTE : ${urls.length} articles au plan de ${base}`);
  process.exit(2);
}

const nav = await chromium.launch({ channel: "chrome" });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const ecarts = [];
let total = { page: 0, lecteur: 0 };

const file = [...urls];
const ouvrier = async () => {
  const p = await ctx.newPage();
  while (file.length) {
    const url = file.shift();
    try {
      await p.goto(base + url, { waitUntil: "load", timeout: 60000 });
      await p.waitForTimeout(800);
      await p.evaluate(OUVRE_TOUT);
      const textePage = await p.evaluate(() => document.querySelector("main")?.innerText ?? "");
      const altsPage = await p.evaluate(ALTS, "main");

      await p.goto(`${base}/ressources/`, { waitUntil: "load", timeout: 60000 });
      await p.waitForFunction(() => !!window.next?.router, null, { timeout: 30000 });
      await p.evaluate((u) => window.next.router.push(u, { scroll: false }), url);
      await p.waitForSelector("[data-lecteur-ressource] h1", { timeout: 30000 });
      await p.waitForTimeout(500);
      if (new URL(p.url()).pathname !== url) throw new Error(`adresse ${p.url()}`);
      await p.evaluate(OUVRE_TOUT);
      const { texteLecteur, libelles } = await p.evaluate(() => {
        const feuille = document.querySelector("[data-lecteur-ressource]");
        return {
          texteLecteur: feuille?.innerText ?? "",
          libelles: [...(feuille?.querySelectorAll("[data-libelle-lecteur]") ?? [])].map((e) => e.innerText),
        };
      });

      const altsLecteur = await p.evaluate(ALTS, "[data-lecteur-ressource]");
      const altsPerdus = manque(compte(altsPage), compte(altsLecteur));
      if (altsPerdus.length) ecarts.push(`${url} : texte de photo perdu (${altsPerdus.length}) : ${altsPerdus.join(" | ").slice(0, 300)}`);

      const a = mots(textePage);
      const b = mots(texteLecteur);
      total = { page: total.page + a.length, lecteur: total.lecteur + b.length };
      // Les libellés propres sont retirés du lecteur AVANT de comparer, dans
      // les deux sens : un « 01 » ou un « à » de libellé ne peut plus masquer
      // un mot de la page perdu ailleurs. Lecteur = page + libellés, exactement.
      for (const l of libelles) {
        if (!declare(url, mots(l).join(" "))) ecarts.push(`${url} : libellé non déclaré « ${l.slice(0, 60)} »`);
      }
      const sansLibelles = compte(manque(compte(b), compte(libelles.flatMap(mots))));
      const perdus = manque(compte(a), sansLibelles);
      const ajoutes = manque(sansLibelles, compte(a));
      const ligne = `${url}  page ${a.length} mots, lecteur ${b.length} (dont ${libelles.length} libellé(s) propre(s))`;
      if (perdus.length || ajoutes.length) {
        ecarts.push(
          `${ligne}\n    PERDUS (${perdus.length}) : ${perdus.join(" ")}\n    AJOUTÉS hors libellés (${ajoutes.length}) : ${ajoutes.join(" ")}`,
        );
      } else console.log(`ok  ${ligne}`);
    } catch (e) {
      ecarts.push(`${url} : mesure impossible (${String(e).slice(0, 140)})`);
    }
  }
  await p.close();
};
await Promise.all(Array.from({ length: 4 }, ouvrier));
await nav.close();

console.log(`\n${urls.length} articles, ${total.page} mots de page, ${total.lecteur} mots de lecteur.`);
if (ecarts.length) {
  console.error(`\n${ecarts.length} écart(s) :\n${ecarts.join("\n")}`);
  process.exit(1);
}
console.log("LECTEUR_TEXTE_COMPLET : chaque article dit dans le lecteur tous les mots de sa page.");
