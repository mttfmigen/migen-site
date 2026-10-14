/**
 * LA PORTE DE LA COUCHE MOBILE des gabarits 02 (étude de cas) et 07 (fiche
 * métier), portée contre la maquette mobile v2
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`).
 *
 *   bun components/site/preuve/verification-couche-mobile.tsx
 *   bun components/site/preuve/verification-couche-mobile.tsx --controle
 *
 * (bun, pas node : la porte importe les gabarits .tsx et les rend vraiment,
 * par `renderToStaticMarkup`, comme `verification-preuve.tsx`.)
 *
 * CE QU'ELLE PROUVE, sur le rendu RÉEL de quatre pages RÉELLES
 * (`supabase/import/gabarits-maquette/`), chemin passé comme la route le passe :
 *
 *   1. REPLIER, JAMAIS RETIRER. Chaque chaîne du corpus (cartes de la réponse,
 *      étapes du déroulé, fiche mission, résultats) reste dans le DOM rendu,
 *      repli compris, et le nombre de blocs repliables est EXACTEMENT celui
 *      que la donnée commande, déroulé inclus (repli manquant mesuré le 14/10,
 *      gabarit 02 de +36 à +51 % plus haut que la maquette à 390 px).
 *   2. LE FIL D'ARIANE MOBILE (dc.html L104) est rendu, avec « Accueil », le
 *      libellé de famille de la maquette (L226) et la page courante en
 *      `aria-current="page"`.
 *   3. LE BADGE DE LECTURE (dc.html L490-492) porte le compte recalculé ICI,
 *      depuis `index.json` : `max(2, round(mots / 230))` puis
 *      « N min de lecture ». La porte ne croit pas le module jugé.
 *   4. LE CARROUSEL DE RÉALISATIONS : « D’autres réalisations » sur le 02,
 *      « Nos réalisations » sur le 07 (dc.html L469), chaque carte vers l'URL
 *      attendue, recalculée ICI depuis `cas-lies.json` (quatre cartes par
 *      fiche métier) ou, à défaut, les six premières études de cas de l'index
 *      (dc.html L423-427), avec le client et le titre de l'étude dans le DOM.
 *   5. LES PUCES DU HÉROS du gabarit 07 (dc.html L110, L487) : les pages
 *      FILLES recalculées ICI depuis l'index, et AUCUNE puce sur une fiche
 *      sans fille (roboticien).
 *   6. LES SŒURS : la boîte « Dans la même rubrique » de PastillesCocon est
 *      montée, et une étude de cas porte au moins 46 liens `/preuves/`
 *      (40 sœurs + 6 cartes, le « 6 contre 46+ » de la mesure du 14/10).
 *   7. RIEN NE CHANGE À 1280 px : chaque marqueur mobile porte
 *      `data-mobile-seulement` (masqué au-dessus de 880 px par
 *      `app/globals.css`), et le rendu SANS `chemin` ne porte AUCUN marqueur :
 *      les portes historiques (`verification-preuve.tsx`,
 *      `verification-metier.tsx`) jugent donc le même rendu qu'avant.
 *
 * `--controle` : les verdicts sont des fonctions pures, et chacun PROUVE qu'il
 * sait refuser, sur des rendus RÉELS abîmés exprès :
 *   témoin A  du TEXTE DISPARAÎT : une étape du déroulé est effacée du rendu,
 *             `texteManquant` doit tomber (la faute visée par « replier,
 *             jamais retirer ») ;
 *   témoin B  un badge de lecture FAUX (« 99 min ») doit tomber ;
 *   témoin C  le carrousel RETIRÉ (marqueur effacé) doit tomber.
 *
 * Piège n° 3 du dépôt : jamais de `grep -c`, les comptes se font par
 * `matchAll` sur la chaîne entière.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import PageFicheMetier from "../metier/PageFicheMetier";
import PagePreuve from "./PagePreuve";
import type { ContenuFicheMetier } from "@/types/metier";
import type { ContenuPreuve } from "@/types/preuve";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------- les verdicts
 * Purs, sans lecture disque ni import du module jugé : c'est ce qui permet
 * aux témoins de les faire tomber.
 */

/** Entités de React, puis texte normalisé : nbsp, apostrophes, espaces. */
export function normalise(texte: string): string {
  return texte
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

/** Verdict n° 1 : chaque chaîne du corpus doit être dans le rendu. */
export function texteManquant(
  html: string,
  chaines: readonly string[],
): string[] {
  const nu = normalise(html);
  return chaines
    .filter((c) => c.trim() !== "" && !nu.includes(normalise(c)))
    .map((c) => `texte du corpus absent du rendu : « ${c.slice(0, 60)} »`);
}

/** Verdict n° 3 : le badge mobile « · N min de lecture », compte imposé. */
export function badgeAbsent(html: string, minutes: string): string[] {
  const badges = [
    ...html.matchAll(/<span data-mobile-seulement="">· ([^<]*)<\/span>/g),
  ].map((m) => normalise(m[1]));
  if (badges.length === 0)
    return ["aucun badge mobile « · N min de lecture » dans le héros"];
  return badges.includes(normalise(minutes))
    ? []
    : [`badge « ${badges.join(" ; ")} » au lieu de « ${minutes} »`];
}

/** Verdict n° 4 : le carrousel, son titre et chacune de ses cibles. */
export function carrouselManquant(
  html: string,
  titre: string,
  urls: readonly string[],
): string[] {
  const fautes: string[] = [];
  const marqueur = /<[^>]*data-mobile-seulement=""[^>]*data-realisations-mobiles=""[^>]*>/.exec(
    html,
  );
  if (!marqueur)
    fautes.push(
      "aucun bloc data-realisations-mobiles + data-mobile-seulement : le carrousel manque ou changerait le 1280 px",
    );
  if (!normalise(html).includes(normalise(titre)))
    fautes.push(`le titre « ${titre} » manque`);
  for (const url of urls) {
    if (!html.includes(`href="${url}"`))
      fautes.push(`la carte vers ${url} manque`);
  }
  return fautes;
}

/** Les occurrences de liens `/preuves/<cas>/` (matchAll, jamais grep -c). */
export function occurrencesLiensPreuves(html: string): number {
  return [...html.matchAll(/href="\/preuves\/[^"]+"/g)].length;
}

/** Les blocs repliables du rendu (SectionPliableMobile pose ce marqueur). */
export function blocsRepliables(html: string): number {
  return [...html.matchAll(/data-pliable-mobile/g)].length;
}

/* ----------------------------------------------------------- les relevés */

const INDEX: readonly {
  url: string;
  h1: string;
  mots: number;
  gabarit: string;
}[] = JSON.parse(
  readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"),
);
const CAS_LIES: Readonly<
  Record<string, readonly { url: string; client: string; t: string }[]>
> = JSON.parse(
  readFileSync(join(RACINE, "maquette/contenu/site/cas-lies.json"), "utf8"),
);

/** Le compte de lecture RECALCULÉ ici, dc.html L490 : la porte ne croit pas. */
function minutesAttendues(chemin: string): string {
  const entree = INDEX.find((x) => x.url === chemin);
  if (!entree || entree.mots <= 0) return "";
  return `${Math.max(2, Math.round(entree.mots / 230))} min de lecture`;
}

/** Les cibles du carrousel RECALCULÉES ici, dc.html L423-427. */
function urlsCartesAttendues(chemin: string): string[] {
  const famille = `/${chemin.split("/").filter(Boolean)[0] ?? ""}/`;
  const liees = (CAS_LIES[chemin] ?? CAS_LIES[famille] ?? []).filter(
    (c) => c.url !== chemin,
  );
  if (liees.length > 0) return liees.slice(0, 8).map((c) => c.url);
  return INDEX.filter((x) => /^\/preuves\/.+/.test(x.url) && x.url !== chemin)
    .slice(0, 6)
    .map((x) => x.url);
}

/** Les textes des cartes RECALCULÉS ici : client et titre de l'étude. */
function textesCartesAttendus(chemin: string): string[] {
  const famille = `/${chemin.split("/").filter(Boolean)[0] ?? ""}/`;
  const liees = (CAS_LIES[chemin] ?? CAS_LIES[famille] ?? []).filter(
    (c) => c.url !== chemin,
  );
  return liees.slice(0, 8).flatMap((c) => [c.client, c.t]);
}

/** Les pages FILLES recalculées ici : un segment de plus dans l'index. */
function fillesAttendues(chemin: string): string[] {
  return INDEX.filter(
    (x) =>
      x.url !== chemin &&
      x.url.startsWith(chemin) &&
      x.url.slice(chemin.length).split("/").filter(Boolean).length === 1,
  ).map((x) => x.url);
}

function charge(nom: string): {
  url: string;
  titre_h1: string;
  contenu: unknown;
} {
  return JSON.parse(
    readFileSync(join(RACINE, "supabase/import/gabarits-maquette", nom), "utf8"),
  );
}

const MARQUEURS_MOBILES = [
  "data-fil-ariane-mobile",
  "data-realisations-mobiles",
  "data-puces-metier",
  "data-pastilles-cocon",
  'data-mobile-seulement="">· ',
] as const;

const fautes: string[] = [];
const constats: string[] = [];

/* ------------------------------------------------- gabarit 02, deux pages */

for (const nom of [
  "preuves-suez-remise-en-etat.json",
  "preuves-danone-lignes-de-production.json",
]) {
  const page = charge(nom);
  const contenu = page.contenu as ContenuPreuve;
  const html = renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={contenu}
      formulaire="porte"
      chemin={page.url}
    />,
  );
  const ou = page.url;

  /* 1. Replier, jamais retirer : le corpus entier reste dans le DOM. */
  const corpus = [
    ...(contenu.reponseCartes ?? []),
    ...(contenu.etapes ?? []),
    ...(contenu.resultats ?? []),
  ].flatMap((x) => [x.titre, x.texte ?? ""]);
  fautes.push(...texteManquant(html, corpus).map((f) => `${ou} : ${f}`));

  /* Le compte de replis que la donnée commande : réponse, déroulé, fiche
     mission, résultat quand ils ont de la matière, plus celui du carrousel
     (blocs/Preuves se replie lui-même). */
  const attendus =
    [
      contenu.reponseCartes ?? [],
      contenu.etapes ?? [],
      contenu.dispositif ?? [],
      contenu.resultats ?? [],
    ].filter((liste) => liste.length > 0).length + 1;
  const mesures = blocsRepliables(html);
  if (mesures !== attendus)
    fautes.push(
      `${ou} : ${attendus} blocs repliables attendus (déroulé compris), ${mesures} rendus`,
    );
  if ((contenu.etapes ?? []).length > 0 && !normalise(html).includes("Le déroulé"))
    fautes.push(`${ou} : la section « Le déroulé » a disparu du rendu`);

  /* 2. Le fil d'Ariane mobile. */
  const fil = /<[^>]*data-mobile-seulement=""[^>]*data-fil-ariane-mobile=""[^>]*>/.test(html);
  if (!fil)
    fautes.push(`${ou} : fil d'Ariane mobile absent ou sans data-mobile-seulement`);
  const nuHtml = normalise(html);
  if (!nuHtml.includes(">Accueil<") && !nuHtml.includes("Accueil"))
    fautes.push(`${ou} : « Accueil » manque au fil d'Ariane`);
  if (!nuHtml.includes("Réalisations"))
    fautes.push(`${ou} : le libellé de famille « Réalisations » (dc L226) manque`);
  if (!html.includes('aria-current="page"'))
    fautes.push(`${ou} : la page courante du fil n'est pas marquée aria-current`);

  /* 3. Le badge de lecture, compte recalculé. */
  fautes.push(...badgeAbsent(html, minutesAttendues(ou)).map((f) => `${ou} : ${f}`));

  /* 4. Le carrousel « D’autres réalisations ». */
  fautes.push(
    ...carrouselManquant(html, "D’autres réalisations", urlsCartesAttendues(ou)).map(
      (f) => `${ou} : ${f}`,
    ),
  );

  /* 6. Les sœurs et la mesure « 6 contre 46+ ». */
  if (!html.includes("data-pastilles-cocon"))
    fautes.push(`${ou} : la boîte des sœurs (PastillesCocon) manque`);
  if (!nuHtml.includes("Dans la même rubrique"))
    fautes.push(`${ou} : le titre « Dans la même rubrique » manque`);
  const liens = occurrencesLiensPreuves(html);
  if (liens < 46)
    fautes.push(
      `${ou} : ${liens} liens /preuves/ rendus, la maquette en porte 46 ou plus (40 sœurs + 6 cartes)`,
    );

  /* 7. Sans chemin, aucun marqueur : le rendu historique est inchangé. */
  const sans = renderToStaticMarkup(
    <PagePreuve titre={page.titre_h1} contenu={contenu} formulaire="porte" />,
  );
  for (const m of MARQUEURS_MOBILES) {
    if (sans.includes(m))
      fautes.push(`${ou} : le rendu SANS chemin porte « ${m} », il devait rester celui d'avant`);
  }

  constats.push(
    `${ou} : ${mesures} replis, badge « ${minutesAttendues(ou)} », ${liens} liens /preuves/, carrousel et sœurs rendus`,
  );
}

/* ------------------------------------------------- gabarit 07, deux pages */

for (const nom of [
  "carriere-electromecanicien.json",
  "carriere-roboticien.json",
]) {
  const page = charge(nom);
  const contenu = page.contenu as ContenuFicheMetier;
  const html = renderToStaticMarkup(
    <PageFicheMetier titre={page.titre_h1} contenu={contenu} chemin={page.url} />,
  );
  const ou = page.url;
  const nuHtml = normalise(html);

  /* 2. Le fil d'Ariane mobile, famille « Carrière ». */
  if (!/<[^>]*data-mobile-seulement=""[^>]*data-fil-ariane-mobile=""[^>]*>/.test(html))
    fautes.push(`${ou} : fil d'Ariane mobile absent ou sans data-mobile-seulement`);
  if (!nuHtml.includes("Carrière"))
    fautes.push(`${ou} : le libellé de famille « Carrière » (dc L226) manque`);
  if (!html.includes('aria-current="page"'))
    fautes.push(`${ou} : la page courante du fil n'est pas marquée aria-current`);

  /* 3. Le badge de lecture, compte recalculé. */
  fautes.push(...badgeAbsent(html, minutesAttendues(ou)).map((f) => `${ou} : ${f}`));

  /* 4. Les quatre cartes de cas (mesure du 14/10 : 0 contre 4), cibles ET
     textes (client, titre de l'étude) recalculés depuis cas-lies.json. */
  const urls = urlsCartesAttendues(ou);
  if (urls.length !== 4)
    fautes.push(`${ou} : ${urls.length} cas liés dans cas-lies.json, 4 attendus`);
  fautes.push(
    ...carrouselManquant(html, "Nos réalisations", urls).map((f) => `${ou} : ${f}`),
  );
  fautes.push(
    ...texteManquant(html, textesCartesAttendus(ou)).map((f) => `${ou} : ${f}`),
  );

  /* 5. Les puces du héros : les filles de l'index, et rien sans fille. */
  const filles = fillesAttendues(ou);
  const aPuces = /<[^>]*data-mobile-seulement=""[^>]*data-puces-metier=""[^>]*>/.test(html);
  if (filles.length > 0) {
    if (!aPuces)
      fautes.push(`${ou} : puces du héros absentes ou sans data-mobile-seulement`);
    for (const f of filles) {
      if (!html.includes(`href="${f}"`))
        fautes.push(`${ou} : la puce du héros vers ${f} manque`);
    }
  } else if (html.includes("data-puces-metier")) {
    fautes.push(`${ou} : des puces de héros rendues sans page fille dans l'index`);
  }

  /* 6. Les sœurs. */
  if (!html.includes("data-pastilles-cocon") || !nuHtml.includes("Dans la même rubrique"))
    fautes.push(`${ou} : la boîte « Dans la même rubrique » (sœurs) manque`);

  /* 7. Sans chemin, aucun marqueur : verification-metier.tsx juge l'ancien rendu. */
  const sans = renderToStaticMarkup(
    <PageFicheMetier titre={page.titre_h1} contenu={contenu} />,
  );
  for (const m of MARQUEURS_MOBILES) {
    if (sans.includes(m))
      fautes.push(`${ou} : le rendu SANS chemin porte « ${m} », il devait rester celui d'avant`);
  }

  constats.push(
    `${ou} : badge « ${minutesAttendues(ou)} », ${urls.length} cartes de cas, ${filles.length} puce(s) de héros, sœurs rendues`,
  );
}

/* ------------------------------------------------- les témoins (--controle) */

if (CONTROLE) {
  const temoins: string[] = [];
  const suez = charge("preuves-suez-remise-en-etat.json");
  const contenu = suez.contenu as ContenuPreuve;
  const html = renderToStaticMarkup(
    <PagePreuve
      titre={suez.titre_h1}
      contenu={contenu}
      formulaire="porte"
      chemin={suez.url}
    />,
  );

  /* Témoin A : du texte DISPARAÎT (une étape du déroulé effacée du rendu),
     la faute exacte de « replier, jamais retirer ». L'amputation vise la
     chaîne TELLE QUE REACT L'ÉCRIT (apostrophes en `&#x27;`…) : sans cela le
     découpage ne retire rien et le témoin ment en passant. */
  const echappe = (t: string) =>
    t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  const etape = (contenu.etapes ?? [])[0];
  const ampute = html.split(echappe(etape.texte)).join("");
  if (ampute === html)
    temoins.push(
      "témoin A : l'amputation n'a rien retiré du rendu, le témoin ne teste rien",
    );
  if (texteManquant(ampute, [etape.titre, etape.texte]).length === 0)
    temoins.push("témoin A : le rendu amputé d'une étape du déroulé est passé");

  /* Témoin B : un badge de lecture faux doit tomber. */
  const attendu = minutesAttendues(suez.url);
  const faux = html.replace(`· ${attendu}`, "· 99 min de lecture");
  if (badgeAbsent(faux, attendu).length === 0)
    temoins.push("témoin B : le badge « 99 min de lecture » est passé");

  /* Témoin C : le carrousel retiré doit tomber. */
  const sansCarrousel = html.replace(/ data-realisations-mobiles=""/g, "");
  if (
    carrouselManquant(sansCarrousel, "D’autres réalisations", urlsCartesAttendues(suez.url))
      .length === 0
  )
    temoins.push("témoin C : le rendu sans carrousel est passé");

  if (temoins.length > 0) {
    console.error("LES TÉMOINS NE TOMBENT PAS, la porte ne prouve rien :");
    for (const t of temoins) console.error("  ✗ " + t);
    process.exit(1);
  }
  console.log("Témoins : les trois rendus abîmés sont bien refusés (A, B, C).");
}

if (fautes.length > 0) {
  console.error("COUCHE MOBILE 02 ET 07 : REFUSÉ");
  for (const f of fautes) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("COUCHE MOBILE 02 ET 07 : conforme");
for (const c of constats) console.log("  ✓ " + c);
