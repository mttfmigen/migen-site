/**
 * LA PORTE DE LA COUCHE MOBILE du gabarit 02 (étude de cas), portée contre la
 * maquette mobile v2 (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`).
 *
 *   bun components/site/preuve/verification-couche-mobile.tsx
 *   bun components/site/preuve/verification-couche-mobile.tsx --controle
 *
 * (bun, pas node : la porte importe le gabarit .tsx et le rend vraiment, par
 * `renderToStaticMarkup`, comme `verification-preuve.tsx`.)
 *
 * REPRISE DU TRAVAIL INTERROMPU (d39f904), réduite au gabarit 02 : la moitié
 * « fiche métier » (gabarit 07) appartient à un autre lot et visait une prop
 * que son gabarit ne déclare pas. Le carrousel n'est plus `blocs/Preuves`
 * (des cartes empilées) mais `CarrouselRealisations`, le motif de la maquette.
 *
 * CE QU'ELLE PROUVE, sur le rendu RÉEL des 41 études de cas
 * (`supabase/import/gabarits-maquette/preuves-*.json`), chemin passé comme la
 * route le passe :
 *
 *   1. LE TEXTE DE BUREAU INTACT. Blocs `data-mobile-seulement` retirés des
 *      deux côtés, le rendu AVEC chemin dit mot pour mot, dans le même ordre,
 *      ce que dit le rendu SANS chemin (celui que `verification-preuve.tsx`
 *      juge), au découpage du `textContent` (nœuds texte bout à bout, sans
 *      espace entre deux balises). Tout ajout hors bloc mobile tombe, tout
 *      mot retiré aussi. Le nombre de blocs repliables est EXACTEMENT celui
 *      que la donnée commande.
 *   2. LE FIL D'ARIANE MOBILE (dc.html L104), « Réalisations » (L226), la page
 *      courante en `aria-current="page"`, en tête de `<main>`.
 *   3. LE BADGE DE LECTURE (L489-492), compte recalculé ICI depuis l'index.
 *   4. LE CARROUSEL « D’autres réalisations » (L469, L482) : cibles recalculées
 *      ICI depuis `cas-lies.json` puis l'index (L425-428). La porte relit
 *      `cas-lies.json` : le jour où il porte une clé /preuves/, le module jugé,
 *      qui ne le lit pas (voir `donnees-mobiles.ts`), tombe ici.
 *   5. LE RAPPEL FINAL : un seul `#etre-rappele`, posé APRÈS le carrousel ;
 *      LA CADENCE (L452-456) : photo + CTA après « Ce que nous avons mis en
 *      place », bandeau à partir de cinq sections numérotées.
 *   6. AUCUN MOT INTERDIT ni tiret long dans tout ce que la couche ajoute
 *      (c'est cette vérification qui écarte `PastillesCocon` : voir le
 *      gabarit, « sur mesure » de /preuves/tournaire/).
 *   7. RIEN À 1280 PX : chaque bloc ajouté porte `data-mobile-seulement`, et le
 *      rendu SANS chemin ne porte aucun marqueur mobile.
 *
 * `--controle` : chaque verdict PROUVE qu'il sait refuser, sur un rendu réel
 * abîmé exprès (A texte disparu, B ajout hors bloc mobile, C badge faux,
 * D carrousel retiré, E mot interdit, F photo + CTA retiré).
 *
 * Piège n° 3 du dépôt : jamais de `grep -c`, les comptes se font par
 * `matchAll` sur la chaîne entière.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import PagePreuve from "./PagePreuve";
import type { ContenuPreuve } from "@/types/preuve";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------- les verdicts
 * Purs, sans lecture disque ni import du module jugé : c'est ce qui permet
 * aux témoins de les faire tomber.
 */

/** Entités de React, puis texte normalisé comme la porte du site. */
export function normalise(texte: string): string {
  return texte
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Le `textContent` d'un rendu : les nœuds texte bout à bout, sans espace
    ajoutée entre deux balises, comme le navigateur le donne. */
export function texteDe(html: string): string {
  return normalise(html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, ""));
}

/**
 * Un rendu SANS ses blocs du téléphone : chaque élément marqué
 * `data-mobile-seulement` est retiré avec tout son contenu (profondeur
 * comptée, comme `retireOrnementsMobiles` de `verification-preuve.tsx`), et
 * remplacé par RIEN, pour que le `textContent` recolle ses voisins exactement
 * comme sans lui.
 */
export function sansMobile(html: string): string {
  const marque = /<(\w+)\b[^>]*\bdata-mobile-seulement\b[^>]*>/;
  let sortie = html;
  for (;;) {
    const debut = sortie.match(marque);
    if (!debut || debut.index === undefined) return sortie;
    const balises = new RegExp(`<${debut[1]}\\b[^>]*>|</${debut[1]}\\s*>`, "g");
    balises.lastIndex = debut.index + debut[0].length;
    let profondeur = debut[0].endsWith("/>") ? 0 : 1;
    let fin = debut.index + debut[0].length;
    for (let m = profondeur ? balises.exec(sortie) : null; m; m = balises.exec(sortie)) {
      profondeur += m[0].startsWith("</") ? -1 : m[0].endsWith("/>") ? 0 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    sortie = sortie.slice(0, debut.index) + sortie.slice(fin);
  }
}

/**
 * Verdict n° 1 : hors blocs du téléphone, le rendu AVEC chemin dit mot pour
 * mot, dans le même ordre, ce que dit le rendu SANS chemin (le rendu de
 * bureau). Rend le premier écart, ou rien. Plus strict qu'un multi-ensemble :
 * un mot retiré, déplacé ou ajouté hors `data-mobile-seulement` tombe ici, et
 * les collages de frontière ne posent pas de question, puisque les deux côtés
 * sont recollés de la même façon.
 */
export function ecartHorsMobile(sans: string, avec: string): string[] {
  const a = texteDe(sansMobile(sans)).split(" ");
  const b = texteDe(sansMobile(avec)).split(" ");
  const i = a.findIndex((mot, k) => mot !== b[k]);
  if (i < 0 && a.length === b.length) return [];
  const k = i < 0 ? a.length : i;
  return [
    `hors blocs mobiles, le texte diverge au mot ${k} : « ${a.slice(k, k + 6).join(" ")} » devient « ${b.slice(k, k + 6).join(" ")} »`,
  ];
}

/** Verdict n° 5 bis : la cadence, par la position de ses identifiants. */
export function cadenceFautive(html: string, nbNumerotees: number, aReponse: boolean): string[] {
  const fautes: string[] = [];
  const photo = html.indexOf('id="parlons-de-votre-site"');
  if (nbNumerotees >= 2 && photo < 0) fautes.push("le photo + CTA manque après la 2e section numérotée");
  if (nbNumerotees < 2 && photo >= 0) fautes.push("un photo + CTA sur une page de moins de deux sections");
  const reponse = html.indexOf(">Ce que nous avons mis en place</h2>");
  if (aReponse && photo >= 0 && photo < reponse)
    fautes.push("le photo + CTA tombe AVANT « Ce que nous avons mis en place »");
  const bandeaux = [...html.matchAll(/id="une-question(?:-\d+)?"/g)].length;
  const attendus = nbNumerotees > 2 ? Math.floor((nbNumerotees - 2) / 3) : 0;
  if (bandeaux !== attendus) fautes.push(`${bandeaux} bandeau(x) « Être rappelé », ${attendus} attendu(s)`);
  return fautes;
}

/** Verdict n° 3 : le badge mobile, peint depuis `data-lecture`, compte imposé. */
export function badgeAbsent(html: string, minutes: string): string[] {
  const badges = [...html.matchAll(/data-mobile-seulement=""[^>]*data-lecture="· ([^"]*)"/g)].map((m) =>
    normalise(m[1]),
  );
  if (badges.length === 0) return ["aucun badge mobile « · N min de lecture » dans le héros"];
  return badges.includes(normalise(minutes))
    ? []
    : [`badge « ${badges.join(" ; ")} » au lieu de « ${minutes} »`];
}

/** Verdict n° 4 : le carrousel, son titre et chacune de ses cibles. */
export function carrouselManquant(html: string, titre: string, urls: readonly string[]): string[] {
  const debut = html.search(/<section[^>]*data-mobile-seulement=""[^>]*data-realisations-mobiles=""/);
  if (debut < 0)
    return ["aucun bloc data-realisations-mobiles + data-mobile-seulement : le carrousel manque ou changerait le 1280 px"];
  const bloc = html.slice(debut, html.indexOf("</section>", debut));
  const fautes: string[] = [];
  if (!normalise(bloc).includes(normalise(titre))) fautes.push(`le titre « ${titre} » manque`);
  for (const url of urls) {
    if (!bloc.includes(`href="${url}"`)) fautes.push(`la carte vers ${url} manque au carrousel`);
  }
  if (!bloc.includes("overflow-x:auto")) fautes.push("le carrousel ne défile pas à l'horizontale");
  return fautes;
}

/** Verdict n° 5 : un seul rappel final, après le carrousel. */
export function rappelFautif(html: string): string[] {
  const rappels = [...html.matchAll(/id="etre-rappele"/g)].length;
  if (rappels !== 1) return [`${rappels} rappel(s) final(aux), un seul attendu`];
  const carrousel = html.indexOf("data-realisations-mobiles");
  return carrousel >= 0 && html.indexOf('id="etre-rappele"') < carrousel
    ? ["le rappel final précède le carrousel : la capture m-02 le range tout en bas"]
    : [];
}

/** Verdict n° 6 : les mots du contrat, et les tirets longs, dans un texte.
    Les deux tirets (demi-cadratin, cadratin) sont écrits par leur point de
    code : aucun ne figure en clair dans ce fichier. */
const TIRETS_LONGS = String.fromCharCode(0x2013, 0x2014);
const INTERDITS = new RegExp(
  `int[ée]rim|notamment|sur[\\s-]mesure|cl[ée] en main|\\br[ée]gie\\b|levier|mise [àa] disposition|sans engagement|concr[èe]tement|incontournable|d[ée]couvrez|[${TIRETS_LONGS}]`,
  "gi",
);
export function interditsAjoutes(avant: string, apres: string): string[] {
  const deja = new Set((texteDe(avant).match(INTERDITS) ?? []).map((m) => m.toLowerCase()));
  return (texteDe(apres).match(INTERDITS) ?? [])
    .filter((m) => !deja.has(m.toLowerCase()))
    .map((m) => `« ${m} » ajouté par la couche mobile`);
}

/** Les blocs repliables du rendu (SectionPliableMobile pose ce marqueur). */
export function blocsRepliables(html: string): number {
  return [...html.matchAll(/data-pliable-mobile/g)].length;
}

/* ----------------------------------------------------------- les relevés */

const INDEX: readonly { url: string; mots: number }[] = JSON.parse(
  readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"),
);
const CAS_LIES: Readonly<Record<string, readonly { url: string }[]>> = JSON.parse(
  readFileSync(join(RACINE, "maquette/contenu/site/cas-lies.json"), "utf8"),
);

/** Le compte de lecture RECALCULÉ ici, dc.html L489 : la porte ne croit pas. */
function minutesAttendues(chemin: string): string {
  const entree = INDEX.find((x) => x.url === chemin);
  if (!entree || entree.mots <= 0) return "";
  return `${Math.max(2, Math.round(entree.mots / 230))} min de lecture`;
}

/** Les cibles du carrousel RECALCULÉES ici, dc.html L425-428. */
function urlsCartesAttendues(chemin: string): string[] {
  const famille = `/${chemin.split("/").filter(Boolean)[0] ?? ""}/`;
  const liees = (CAS_LIES[chemin] ?? CAS_LIES[famille] ?? []).filter((c) => c.url !== chemin);
  if (liees.length > 0) return liees.slice(0, 8).map((c) => c.url);
  return INDEX.filter((x) => /^\/preuves\/.+/.test(x.url) && x.url !== chemin)
    .slice(0, 6)
    .map((x) => x.url);
}

interface PageFixture {
  url: string;
  titre_h1: string;
  contenu: ContenuPreuve;
}

const DOSSIER = join(RACINE, "supabase/import/gabarits-maquette");
const PAGES: PageFixture[] = readdirSync(DOSSIER)
  .filter((f) => /^preuves-.+\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(join(DOSSIER, f), "utf8")) as PageFixture)
  .filter((p) => (p.contenu as { gabarit?: string }).gabarit === "etude-de-cas");

const MARQUEURS_MOBILES = [
  "data-fil-ariane-mobile",
  "data-realisations-mobiles",
  "data-lecture=",
  'id="etre-rappele"',
  'id="parlons-de-votre-site"',
  'id="une-question"',
] as const;

function rendu(page: PageFixture, avecChemin: boolean): string {
  return renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={page.contenu}
      formulaire="porte"
      chemin={avecChemin ? page.url : undefined}
    />,
  );
}

const fautes: string[] = [];
const constats: string[] = [];

if (PAGES.length < 41) fautes.push(`${PAGES.length} études de cas lues, 41 attendues`);

for (const page of PAGES) {
  const { contenu } = page;
  const ou = page.url;
  const html = rendu(page, true);
  const sans = rendu(page, false);
  const nu = normalise(html);

  /* 1. Hors blocs du téléphone, le texte de bureau, mot pour mot. */
  fautes.push(...ecartHorsMobile(sans, html).map((f) => `${ou} : ${f}`));
  const listes = [contenu.reponseCartes ?? [], contenu.etapes ?? [], contenu.dispositif ?? [], contenu.resultats ?? []];
  const attendus = listes.filter((l) => l.length > 0).length;
  const mesures = blocsRepliables(html);
  if (mesures !== attendus) fautes.push(`${ou} : ${attendus} blocs repliables attendus, ${mesures} rendus`);

  /* 2. Le fil d'Ariane mobile, premier élément du `<main>`. */
  if (!/<main[^>]*><div data-mobile-seulement=""[^>]*><div data-mobile-seulement="" data-fil-ariane-mobile=""/.test(html))
    fautes.push(`${ou} : fil d'Ariane mobile absent, hors de la tête du <main> ou sans data-mobile-seulement`);
  if (!nu.includes(">Réalisations<")) fautes.push(`${ou} : le libellé de famille « Réalisations » (dc L226) manque`);
  if (!html.includes('aria-current="page"')) fautes.push(`${ou} : la page courante du fil n'est pas marquée`);

  /* 3. Le badge de lecture. */
  fautes.push(...badgeAbsent(html, minutesAttendues(ou)).map((f) => `${ou} : ${f}`));

  /* 4. Le carrousel. */
  fautes.push(
    ...carrouselManquant(html, "D’autres réalisations", urlsCartesAttendues(ou)).map((f) => `${ou} : ${f}`),
  );

  /* 5. Le rappel final, puis la cadence. */
  fautes.push(...rappelFautif(html).map((f) => `${ou} : ${f}`));
  const nbNumerotees = [contenu.situationTitre ? [1] : [], ...listes].filter((l) => l.length > 0).length;
  fautes.push(
    ...cadenceFautive(html, nbNumerotees, (contenu.reponseCartes ?? []).length > 0).map((f) => `${ou} : ${f}`),
  );

  /* 6. Aucun interdit ajouté. */
  fautes.push(...interditsAjoutes(sans, html).map((f) => `${ou} : ${f}`));

  /* 7. Sans chemin, aucun marqueur : le rendu de bureau est inchangé. */
  for (const m of MARQUEURS_MOBILES) {
    if (sans.includes(m)) fautes.push(`${ou} : le rendu SANS chemin porte « ${m} »`);
  }

  constats.push(
    `${ou} : ${mesures} replis, ${nbNumerotees} sections numérotées, texte de bureau intact, cadence, carrousel et rappel posés`,
  );
}

/* ------------------------------------------------- les témoins (--controle) */

if (CONTROLE) {
  const temoins: string[] = [];
  const suez = PAGES.find((p) => p.url === "/preuves/suez-remise-en-etat/");
  if (!suez) throw new Error("témoins : la fixture suez manque");
  const html = rendu(suez, true);
  const sans = rendu(suez, false);

  /* A : du texte DISPARAÎT, une étape du déroulé effacée du rendu. La coupe
     vise la chaîne TELLE QUE REACT L'ÉCRIT, sans quoi elle ne retire rien. */
  const echappe = (t: string) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  const etape = (suez.contenu.etapes ?? [])[0];
  const ampute = html.split(echappe(etape.texte ?? "")).join("");
  if (ampute === html) temoins.push("A : l'amputation n'a rien retiré, le témoin ne teste rien");
  if (ecartHorsMobile(sans, ampute).length === 0) temoins.push("A : le rendu amputé d'une étape est passé");

  /* B : un ajout glissé entre deux sections SANS `data-mobile-seulement` :
     il s'afficherait sur bureau, la porte doit le voir. */
  const jointure = html.indexOf("<section", html.indexOf("Ce que nous avons mis en place</h2>"));
  const coupe = `${html.slice(0, jointure)}<div>Ajout</div>${html.slice(jointure)}`;
  if (jointure < 0 || ecartHorsMobile(sans, coupe).length === 0)
    temoins.push("B : un ajout hors bloc mobile est passé");

  /* C : un badge de lecture faux. */
  const attendu = minutesAttendues(suez.url);
  if (badgeAbsent(html.replace(`· ${attendu}`, "· 99 min de lecture"), attendu).length === 0)
    temoins.push("C : le badge « 99 min de lecture » est passé");

  /* D : le carrousel retiré. */
  if (
    carrouselManquant(html.replace(/ data-realisations-mobiles=""/g, ""), "D’autres réalisations", urlsCartesAttendues(suez.url))
      .length === 0
  )
    temoins.push("D : le rendu sans carrousel est passé");

  /* E : un mot interdit glissé dans le carrousel. */
  if (interditsAjoutes(sans, html.replace("Lire le cas →", "Lire le cas sur mesure →")).length === 0)
    temoins.push("E : « sur mesure » ajouté au carrousel est passé");

  /* F : le photo + CTA de la cadence retiré. */
  if (cadenceFautive(html.replace('id="parlons-de-votre-site"', ""), 5, true).length === 0)
    temoins.push("F : le rendu sans photo + CTA est passé");

  if (temoins.length > 0) {
    console.error("LES TÉMOINS NE TOMBENT PAS, la porte ne prouve rien :");
    for (const t of temoins) console.error("  ✗ " + t);
    process.exit(1);
  }
  console.log("Témoins : les six rendus abîmés sont bien refusés (A, B, C, D, E, F).");
}

if (fautes.length > 0) {
  console.error("COUCHE MOBILE 02 : REFUSÉ");
  for (const f of fautes) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`COUCHE MOBILE 02 : conforme sur ${PAGES.length} études de cas`);
for (const c of constats.slice(0, 3)) console.log("  ✓ " + c);
