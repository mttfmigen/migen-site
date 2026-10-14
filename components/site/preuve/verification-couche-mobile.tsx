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
 *   1. AUCUN MOT PERDU, AU SENS DE LA PORTE DU SITE. Les mots du rendu SANS
 *      chemin (le rendu de bureau, celui que `verification-preuve.tsx` juge)
 *      sont tous dans le rendu AVEC chemin, multiplicité comprise, découpés
 *      comme `scripts/instantane-texte-main.mjs` découpe le `textContent` :
 *      des nœuds texte mis bout à bout, SANS espace entre deux balises. C'est
 *      ce découpage qui colle « montage. » et « 03 » en un seul mot, et c'est
 *      lui qu'un ajout mal placé coupe. Le nombre de blocs repliables est
 *      EXACTEMENT celui que la donnée commande.
 *   2. LE FIL D'ARIANE MOBILE (dc.html L104), « Réalisations » (L226), la page
 *      courante en `aria-current="page"`, en tête de `<main>`.
 *   3. LE BADGE DE LECTURE (L489-492), compte recalculé ICI depuis l'index.
 *   4. LE CARROUSEL « D’autres réalisations » (L469, L482) : cibles recalculées
 *      ICI depuis `cas-lies.json` puis l'index (L425-428). La porte relit
 *      `cas-lies.json` : le jour où il porte une clé /preuves/, le module jugé,
 *      qui ne le lit pas (voir `donnees-mobiles.ts`), tombe ici.
 *   5. LE RAPPEL FINAL : un seul `#etre-rappele`, posé APRÈS le carrousel.
 *   6. AUCUN MOT INTERDIT ni tiret long dans tout ce que la couche ajoute
 *      (c'est cette vérification qui écarte `PastillesCocon` : voir le
 *      gabarit, « sur mesure » de /preuves/tournaire/).
 *   7. RIEN À 1280 PX : chaque bloc ajouté porte `data-mobile-seulement`, et le
 *      rendu SANS chemin ne porte aucun marqueur mobile.
 *
 * `--controle` : chaque verdict PROUVE qu'il sait refuser, sur un rendu réel
 * abîmé exprès (A texte disparu, B mot coupé par un ajout, C badge faux,
 * D carrousel retiré, E mot interdit).
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

/** Verdict n° 1 : les mots de `avant` absents de `apres`, multiplicité comprise. */
export function motsPerdus(avant: string, apres: string): string[] {
  const compte = new Map<string, number>();
  for (const m of texteDe(apres).split(" ").filter(Boolean)) compte.set(m, (compte.get(m) ?? 0) + 1);
  const perdus: string[] = [];
  for (const m of texteDe(avant).split(" ").filter(Boolean)) {
    const n = compte.get(m) ?? 0;
    if (n === 0) perdus.push(m);
    else compte.set(m, n - 1);
  }
  return perdus;
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

  /* 1. Aucun mot perdu, au découpage de la porte du site. */
  const perdus = motsPerdus(sans, html);
  if (perdus.length) fautes.push(`${ou} : ${perdus.length} mot(s) perdu(s) : ${perdus.slice(0, 12).join(" ")}`);
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

  /* 5. Le rappel final. */
  fautes.push(...rappelFautif(html).map((f) => `${ou} : ${f}`));

  /* 6. Aucun interdit ajouté. */
  fautes.push(...interditsAjoutes(sans, html).map((f) => `${ou} : ${f}`));

  /* 7. Sans chemin, aucun marqueur : le rendu de bureau est inchangé. */
  for (const m of MARQUEURS_MOBILES) {
    if (sans.includes(m)) fautes.push(`${ou} : le rendu SANS chemin porte « ${m} »`);
  }

  constats.push(`${ou} : ${mesures} replis, aucun mot perdu, carrousel et rappel posés`);
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
  if (motsPerdus(sans, ampute).length === 0) temoins.push("A : le rendu amputé d'une étape est passé");

  /* B : un ajout glissé ENTRE deux sections, sans rien retirer : il coupe le
     mot que le `textContent` formait à la jointure, la porte doit le voir. */
  const jointure = html.indexOf("<section", html.indexOf("Ce que nous avons mis en place</h2>"));
  const coupe = `${html.slice(0, jointure)}<div>Ajout</div>${html.slice(jointure)}`;
  if (jointure < 0 || motsPerdus(sans, coupe).length === 0)
    temoins.push("B : un ajout qui coupe la jointure de deux sections est passé");

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

  if (temoins.length > 0) {
    console.error("LES TÉMOINS NE TOMBENT PAS, la porte ne prouve rien :");
    for (const t of temoins) console.error("  ✗ " + t);
    process.exit(1);
  }
  console.log("Témoins : les cinq rendus abîmés sont bien refusés (A, B, C, D, E).");
}

if (fautes.length > 0) {
  console.error("COUCHE MOBILE 02 : REFUSÉ");
  for (const f of fautes) console.error("  ✗ " + f);
  process.exit(1);
}
console.log(`COUCHE MOBILE 02 : conforme sur ${PAGES.length} études de cas`);
for (const c of constats.slice(0, 3)) console.log("  ✓ " + c);
