#!/usr/bin/env node
/**
 * Porte : une même photo ne sert jamais deux blocs différents d'une même page.
 *
 * ORIGINE, le 12/10/2026. Mehdi, sur `/nous-connaitre/` : « y'a tout le temps
 * la même photo. Bloc "notre force", bloc le premier client ». Mesuré : la page
 * servait `/assets/web/team-duo.jpg` DEUX FOIS, dans deux sections distinctes.
 *
 * Et le défaut venait de la maquette elle-même, pas du portage : à la ligne
 * 5281 de `maquette/accueil-rendu.html`, les deux emplacements pointent le même
 * actif Claude Design, « 5b5403d8-66e3-40e2-8aca-295646288731 ». Leurs deux
 * `alt` étant différents, deux photos distinctes étaient bien voulues. Une
 * porte qui lit la maquette n'aurait donc rien vu : celle-ci lit le RENDU
 * SERVI, et juge la page sur ce que l'oeil y trouve.
 *
 * CE QU'ELLE NE FAIT PAS, et c'est délibéré :
 *  - elle ne regarde QUE les photos, jamais les logos. Le monogramme Migen
 *    paraît légitimement dans l'entête, dans le pied de page et dans un appel à
 *    l'action : le refuser ferait tomber les 162 pages pour rien ;
 *  - elle accepte une même photo DEUX FOIS DANS LE MÊME BLOC (un `<picture>` de
 *    repli, par exemple). Ce n'est pas le défaut traqué, et le confondre avec
 *    lui donnerait une porte qui crie sans rien dire ;
 *  - elle ne dit rien d'une photo partagée entre DEUX pages. C'est une autre
 *    question, et `scripts/mesure-photos-site.mjs` la mesure déjà.
 *
 * Elle complète `scripts/verifie-photos-distinctes.py`, qui garde le registre
 * (deux entrées ne doivent pas être la même image) : celle-là porte sur la
 * banque, celle-ci sur la page.
 *
 * LE BLOC, C'EST LA `<section>` la plus proche. C'est l'unité de ce site : un
 * écran de la maquette porté donne une section. Le découpage tient compte de
 * l'imbrication, même si aucune page n'imbrique aujourd'hui (mesuré : 12
 * sections sur `/nous-connaitre/`, 5 sur `/rse/`, profondeur 1). Les images
 * hors de toute section (entête, pied de page) comptent pour un seul bloc.
 *
 * Usage :
 *   node scripts/verifie-photos-du-bloc.mjs                  toutes les pages, en PRODUCTION
 *   node scripts/verifie-photos-du-bloc.mjs http://localhost:3000
 *   node scripts/verifie-photos-du-bloc.mjs --url=/rse/ --url=/nous-connaitre/
 *   node scripts/verifie-photos-du-bloc.mjs --controle      preuve qu'elle sait échouer
 *
 * LE DÉFAUT DE BASE EST LA PRODUCTION, et ce n'est pas un détail : le serveur
 * de développement du port 4340 sert un contenu périmé depuis le 07/10.
 */
import { readFile } from "node:fs/promises";

const CONTROLE = process.argv.includes("--controle");
const BASE =
  process.argv.find((a) => a.startsWith("http")) ?? "https://migen-site.vercel.app";
const URLS_DEMANDEES = process.argv
  .filter((a) => a.startsWith("--url="))
  .map((a) => a.slice("--url=".length));
const LOT = 12;

/** Les deux banques d'images du dépôt. Tout le reste est du décor. */
const BANQUES = ["/assets/photos/", "/assets/web/"];

/**
 * Le fichier désigné par une adresse d'image, que Next l'ait optimisée ou non.
 * Sans ce dépliage, `/_next/image?url=%2Fassets%2Fphotos%2Fa.jpg&w=640` et
 * `/assets/photos/a.jpg` passeraient pour deux photos différentes, et la porte
 * laisserait filer exactement le doublon qu'elle cherche.
 */
export function fichierDe(src) {
  let brut = src;
  const dansUrl = brut.match(/[?&]url=([^&]+)/);
  if (dansUrl) brut = dansUrl[1];
  try {
    brut = decodeURIComponent(brut);
  } catch {
    /* déjà décodé */
  }
  brut = brut.split(/[?#]/)[0];
  const banque = BANQUES.find((b) => brut.includes(b));
  return banque ? brut.slice(brut.indexOf(banque)) : null;
}

/**
 * Un logo n'est pas une photo. Il se répète par construction, d'un bout à
 * l'autre de la page, et c'est voulu.
 */
export function estUnLogo(fichier) {
  const nom = fichier.split("/").pop() ?? "";
  return fichier.includes("/assets/logos/") || /^logo[-.]/i.test(nom);
}

/**
 * Les photos servies par une page, chacune avec le rang de la `<section>` qui
 * la porte. Balayage unique, qui empile les sections ouvertes pour attribuer à
 * chaque image la plus proche d'entre elles.
 */
export function photosParBloc(html) {
  const jetons = [...html.matchAll(/<section\b[^>]*>|<\/section\s*>|<img\b[^>]*>/gi)];
  const pile = [];
  let rang = 0;
  const trouvees = [];
  for (const m of jetons) {
    const t = m[0];
    if (/^<section/i.test(t)) {
      pile.push(++rang);
      continue;
    }
    if (/^<\/section/i.test(t)) {
      pile.pop();
      continue;
    }
    const src = t.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const fichier = fichierDe(src);
    if (!fichier || estUnLogo(fichier)) continue;
    trouvees.push({ fichier, bloc: pile.length ? pile[pile.length - 1] : 0 });
  }
  return trouvees;
}

/** Les défauts d'une page : une photo posée dans deux blocs distincts. */
export function defautsDe(html, url) {
  const parFichier = new Map();
  for (const { fichier, bloc } of photosParBloc(html)) {
    if (!parFichier.has(fichier)) parFichier.set(fichier, new Set());
    parFichier.get(fichier).add(bloc);
  }
  const defauts = [];
  for (const [fichier, blocs] of parFichier) {
    if (blocs.size > 1) {
      defauts.push({ url, fichier, blocs: [...blocs].sort((a, b) => a - b) });
    }
  }
  return defauts;
}

const nomDuBloc = (n) => (n === 0 ? "hors section" : `section ${n}`);

/* ------------------------------------------------------------------ témoin */
if (CONTROLE) {
  const A = "/assets/photos/env-maintenance-automaticien-3.jpg";
  const B = "/assets/photos/automatisme-armoire-jeune-tablette.jpg";
  const W = "/assets/web/team-duo.jpg";
  const LOGO = "/assets/logo-migen-white.png";
  const img = (s) => `<img src="${s}" alt="une description assez longue">`;
  const opt = (s) =>
    `<img src="/_next/image?url=${encodeURIComponent(s)}&w=640&q=75" alt="une description assez longue">`;

  const cas = [
    [
      "même photo dans deux sections",
      `<section>${img(A)}</section><section>${img(A)}</section>`,
      true,
    ],
    [
      "même photo deux fois dans LA MÊME section",
      `<section>${img(A)}${img(A)}</section>`,
      false,
    ],
    [
      "deux photos différentes, une par section",
      `<section>${img(A)}</section><section>${img(B)}</section>`,
      false,
    ],
    [
      "le logo répété entête, section, pied de page",
      `<img src="${LOGO}" alt=""><section>${img(A)}<img src="${LOGO}" alt=""></section><img src="${LOGO}" alt="">`,
      false,
    ],
    [
      "même photo, une fois optimisée par Next et une fois brute",
      `<section>${opt(A)}</section><section>${img(A)}</section>`,
      true,
    ],
    [
      "même photo dans une section et hors de toute section",
      `${img(A)}<section>${img(A)}</section>`,
      true,
    ],
    [
      "doublon dans la banque /assets/web/",
      `<section>${img(W)}</section><section>${img(W)}</section>`,
      true,
    ],
    [
      "sections imbriquées, même photo dedans et dehors",
      `<section>${img(A)}<section>${img(A)}</section></section>`,
      true,
    ],
  ];

  let bon = 0;
  for (const [nom, html, doitTomber] of cas) {
    const tombe = defautsDe(html, "/temoin").length > 0;
    const ok = tombe === doitTomber;
    if (ok) bon++;
    console.log(
      `  ${ok ? "OK  " : "RATE"}  ${nom.padEnd(52)} ${tombe ? "refusée" : "acceptée"}`,
    );
  }
  console.log(
    bon === cas.length
      ? `\nCONTROLE OK : ${bon}/${cas.length}`
      : `\nCONTROLE ECHOUE : ${bon}/${cas.length}`,
  );
  process.exit(bon === cas.length ? 0 : 1);
}

/* ------------------------------------------------------------- les adresses */
async function adresses() {
  if (URLS_DEMANDEES.length) return URLS_DEMANDEES;
  /* Le plan du site fait foi : il porte les routes statiques comme
     `/nous-connaitre/` et `/rse/`, que `maquette/contenu/site/index.json`
     ignore. Lire l'index seul, c'est ne jamais visiter les pages du défaut. */
  try {
    const r = await fetch(new URL("/sitemap.xml", BASE));
    if (r.ok) {
      const xml = await r.text();
      const chemins = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
        try {
          return new URL(m[1]).pathname;
        } catch {
          return m[1];
        }
      });
      if (chemins.length) return [...new Set(chemins)];
    }
  } catch {
    /* on retombe sur l'index de la maquette */
  }
  const idx = JSON.parse(
    await readFile("maquette/contenu/site/index.json", "utf8"),
  );
  const depuisIndex = (idx.pages ?? idx).map((p) => p.url ?? p.chemin ?? p);
  return [...new Set([...depuisIndex, "/nous-connaitre/", "/rse/"])];
}

const urls = await adresses();
const defauts = [];
const injoignables = [];
let photos = 0;

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      let html;
      try {
        const r = await fetch(new URL(url, BASE), { redirect: "follow" });
        if (!r.ok) return injoignables.push(`${url} (${r.status})`);
        html = await r.text();
      } catch (e) {
        return injoignables.push(`${url} (${e.code ?? e.message})`);
      }
      photos += photosParBloc(html).length;
      defauts.push(...defautsDe(html, url));
    }),
  );
}

/* Une porte qui conclut sur des pages qu'elle n'a pas pu lire ne prouve rien. */
if (injoignables.length) {
  console.error(
    `porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`,
  );
  injoignables.slice(0, 5).forEach((u) => console.error(`  ${u}`));
  process.exit(2);
}

if (defauts.length) {
  const pages = new Set(defauts.map((d) => d.url));
  console.error(
    `${defauts.length} photo(s) servant deux blocs d'une même page, sur ${pages.size} page(s) :\n`,
  );
  for (const d of defauts.slice(0, 25)) {
    console.error(
      `  ${d.url}\n      ${d.fichier}\n      vue dans : ${d.blocs.map(nomDuBloc).join(", ")}`,
    );
  }
  if (defauts.length > 25) {
    console.error(`  ... et ${defauts.length - 25} autre(s)`);
  }
  process.exit(1);
}

console.log(
  `UNE_PHOTO_PAR_BLOC  ${photos} photos lues sur ${urls.length} pages (${BASE}), aucune ne sert deux blocs d'une même page`,
);
