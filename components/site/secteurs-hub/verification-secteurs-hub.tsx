/**
 * Contrôle du hub `/secteurs/` (gabarit « 10 Hub de rubrique »), sans navigateur.
 *
 *   bun components/site/secteurs-hub/verification-secteurs-hub.tsx
 *
 * LA PAGE N'A PAS DE COMPOSANT À ELLE. Sa capture, `maquette/rendu/secteurs.html`,
 * porte exactement la suite d'écrans d'une offre (16 sections, maillage « Par où
 * continuer ? » au dessin des pages liées) : sa donnée,
 * `supabase/import/gabarits-maquette/secteurs.json`, a donc la forme d'une offre
 * et la route la sert par `PageOffre`, sans branche de plus. Ce contrôle la rend
 * par `renderToStaticMarkup` depuis ce fichier, tel que la route le lit, et la
 * compare à SA capture, section par section :
 *
 *  1. LE H1 est celui de la capture, et il est seul. Seize sections, comme elle.
 *  2. MOT POUR MOT, DANS L'ORDRE, PAR SECTION : chaque texte de la capture se
 *     retrouve dans la section rendue de même rang, dans le même ordre, sur
 *     texte normalisé. Seules exceptions : `TROUS`, chacun avec sa raison, et
 *     chacun vérifié VRAI (moins d'occurrences rendues que capturées).
 *  3. RIEN D'INVENTÉ, PUIS LE LITTÉRAL : chaque texte rendu existe dans la
 *     capture, puis tel quel, apostrophes typographiques comprises. Seules
 *     exceptions : `AJOUTS`, vérifiés réellement rendus.
 *  4. LES LIENS de chaque section de la capture, dans l'ordre ; aucun `href="#"`.
 *  5. LES PHOTOS : celles des références par empreinte SHA-1 (la capture les
 *     sert en `blob:`, les octets ont été relevés sur la maquette vivante le
 *     08/10 et retrouvés tels quels dans `public/assets/web/`) ; celles du
 *     maillage par leur nom, relu dans la capture à chaque passage.
 *  6. LES INTERDITS du contrat sont absents du rendu.
 *
 * IL PROUVE QU'IL SAIT ÉCHOUER : il altère d'abord la page de sept façons et
 * exige que chacune soit vue. Une altération qui passe le déclare aveugle.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import PageOffre from "@/components/site/offre/PageOffre";
import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuOffre } from "@/types/offre";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const FICHIER = join(RACINE, "supabase", "import", "gabarits-maquette", "secteurs.json");
/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", "secteurs.html"), "utf8"));

interface PageRelais {
  url: string;
  titre_h1: string;
  contenu: ContenuOffre;
}

/* ----------------------------------------------------- les écarts déclarés */

/**
 * Dans la capture, absent du rendu. Vide depuis le 08/10 : le bouton d'envoi
 * de `PanneauFormulaire` répète le titre du panneau, comme la capture
 * (« Parler à un chargé d'affaires », au héros et à l'appel final).
 */
const TROUS: readonly { section: string; texte: string; pourquoi: string }[] = [];

/** Rendu, absent de la capture : le même formulaire partagé (champ « Site web », mention RGPD). */
const AJOUTS: readonly string[] = [
  "Site web",
  "Données traitées par Migen pour répondre à votre demande, enregistrées dans HubSpot. Droits et durées de conservation :",
  "politique de confidentialité",
];

/**
 * Les photos des huit cartes de « 08 Références », par empreinte des octets
 * servis par la maquette vivante (relevé du 08/10, `blob:` lus par XHR).
 */
const EMPREINTES_REFERENCES: readonly string[] = [
  "dce5eb7927bec147821aa1cc61bb69d180d44be1", // DANONE
  "57154b3d11c9fbaec49aca7e1b6ce074c8a36838", // STELLANTIS
  "94c7f2bfced47f9f47c49daea211bac1efc0bc59", // AMAZON
  "4539bb3aab149b42fd425bff9af31c7fd2a64c35", // MERSEN
  "db074df40fe66daf56bb3c4b7e98151c84ac12d7", // SUEZ
  "dc0942249387d71c48010ace2f9428d70b6bd85e", // GROUPE ATLANTIC
  "4539bb3aab149b42fd425bff9af31c7fd2a64c35", // DimoMaint
  "fcab097f172e5560c65ba9aac6a621470d19c7f8", // Savoye
];

/**
 * Photo du maillage nommée par la capture et absente de `public/` : la rangée
 * reste nue plutôt que de recevoir une autre photo. Le jour où le fichier
 * arrive, ce contrôle échoue et demande de le déclarer dans la donnée. Vide
 * depuis le 08/10 : `x-mecanique-portrait.jpg` est arrivée (octets identiques
 * à ceux de la maquette) et la carte Aéronautique la porte.
 */
const PHOTOS_ABSENTES: readonly string[] = [];

const INTERDITS: readonly [RegExp, string][] = [
  [/—/u, "tiret cadratin"],
  [/\bsous\s+\d+\s*(?:h|heures?|jours?|min)/iu, "délai chiffré"],
  [/\b24\s*h|\b24\s*heures/iu, "« 24h »"],
  [/\b7\s*j?\s*\/\s*7\b/u, "« 7j/7 »"],
  [/\d[\d\s  ]*(?:€|euros?\b)/u, "prix"],
  [/régie/iu, "« régie »"],
  [/intérim/iu, "« intérim »"],
  [/mise à disposition/iu, "« mise à disposition »"],
  [/sans engagement/iu, "« sans engagement »"],
  [/clé en main/iu, "« clé en main »"],
  [/sur mesure/iu, "« sur mesure »"],
  [/\blevier/iu, "« levier »"],
  [/concrètement/iu, "« concrètement »"],
  [/notamment/iu, "« notamment »"],
  [/incontournable/iu, "« incontournable »"],
  [/découvrez/iu, "« découvrez »"],
  [/r[ée]guliers/iu, "« réguliers » à côté de clients"],
  [/Limonest/u, "le siège est à Écully"],
  [/postuler sur Teamtailor/iu, "« postuler sur Teamtailor »"],
  [/\b(?:5|cinq) agences/iu, "quatre agences"],
];

/* -------------------------------------------------------------- les textes */

function entites(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** La forme de comparaison. Le fichier, lui, garde le littéral. */
function normalise(texte: string): string {
  return texte.replace(/[  ]/g, " ").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

/** Les nœuds de texte, littéraux (entités décodées, blancs réduits). */
function noeuds(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .split(/<[^>]+>/)
    .map((t) => entites(t).replace(/[ \t\n\r]+/g, " ").trim())
    .filter(Boolean);
}

/** Le HTML coupé à chaque `<section` : PageOffre n'en imbrique aucune. */
function sections(html: string): string[] {
  return html.split(/(?=<section[\s>])/).filter((s) => s.startsWith("<section"));
}

function attributs(html: string, nom: string): string[] {
  return [...html.matchAll(new RegExp(`\\s${nom}="([^"]*)"`, "g"))].map((m) => entites(m[1]));
}

/** `/_next/image?url=%2Fassets%2F…&w=…` comme `/assets/…` : le fichier servi. */
function photosLocales(html: string): string[] {
  return attributs(html, "src")
    .map((src) => (src.startsWith("/_next/image") ? decodeURIComponent(new URL(src, "http://x").searchParams.get("url") ?? "") : src))
    .filter((src) => src.startsWith("/assets/web/"));
}

function occurrences(meule: string, aiguille: string): number {
  return meule.split(aiguille).length - 1;
}

const sha1 = (chemin: string) => createHash("sha1").update(readFileSync(chemin)).digest("hex");

/* ---------------------------------------------------------- la capture lue */

const SECTIONS_CAPTURE = sections(CAPTURE).map((html) => ({
  libelle: /data-screen-label="([^"]*)"/.exec(html)?.[1] ?? "?",
  html,
}));
const H1_CAPTURE = normalise(noeuds(/<h1[\s\S]*?<\/h1>/.exec(CAPTURE)?.[0] ?? "").join(" "));
const PHOTOS_MAILLAGE_CAPTURE = [
  ...(SECTIONS_CAPTURE.find((s) => s.libelle === "Maillage")?.html ?? "").matchAll(/url\(&quot;assets\/web\/([^&]+)&quot;\)/g),
].map((m) => `/assets/web/${m[1]}`);

/* ------------------------------------------------------------- le jugement */

function juge(page: PageRelais): string[] {
  const fautes: string[] = [];
  const faute = (message: string) => fautes.push(message);

  const rendu = renderToStaticMarkup(
    <PageOffre titre={page.titre_h1} contenu={page.contenu} formulaire="cocon-secteurs-" />,
  );
  const rendues = sections(rendu);

  // 1. Le H1, seul, et le nombre de sections.
  const h1 = rendu.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
  if (h1.length !== 1) faute(`${h1.length} h1 rendus, un seul attendu`);
  if (normalise(noeuds(h1[0] ?? "").join(" ")) !== H1_CAPTURE) faute(`H1 « ${page.titre_h1} » au lieu de « ${H1_CAPTURE} »`);
  if (rendues.length !== SECTIONS_CAPTURE.length) {
    faute(`${rendues.length} sections rendues, la capture en porte ${SECTIONS_CAPTURE.length}`);
    return fautes;
  }

  SECTIONS_CAPTURE.forEach(({ libelle, html }, rang) => {
    const ici = rendues[rang];
    const texteRendu = normalise(noeuds(ici).join(" "));

    // 2. Mot pour mot, dans l'ordre, trous déclarés retirés (dernière occurrence).
    const attendus = noeuds(html).map(normalise);
    for (const trou of TROUS.filter((t) => t.section === libelle)) {
      const cible = normalise(trou.texte);
      const k = attendus.lastIndexOf(cible);
      if (k === -1) faute(`${libelle} : trou déclaré absent de la capture « ${trou.texte} »`);
      else attendus.splice(k, 1);
      if (occurrences(texteRendu, cible) >= occurrences(normalise(noeuds(html).join(" ")), cible)) {
        faute(`${libelle} : trou devenu inutile « ${trou.texte} », à retirer de TROUS`);
      }
    }
    let curseur = 0;
    for (const texte of attendus) {
      const ou = texteRendu.indexOf(texte, curseur);
      if (ou === -1) {
        faute(`${libelle} : manque ou hors d'ordre « ${texte.slice(0, 80)} »`);
        continue;
      }
      curseur = ou + texte.length;
    }

    // 4. Les liens de la capture, dans l'ordre. Hors du moteur de Next, `Link`
    //    rend sans la barre finale que `trailingSlash` remet au service.
    const sansBarre = (lien: string) => lien.replace(/(.)\/$/, "$1");
    const liensRendus = attributs(ici, "href").map(sansBarre);
    let k = 0;
    for (const lien of attributs(html, "href")) {
      const ou = liensRendus.indexOf(sansBarre(lien), k);
      if (ou === -1) faute(`${libelle} : lien de la capture absent ou hors d'ordre ${lien}`);
      else k = ou + 1;
    }

    // 5. Les photos.
    if (libelle === "08 Références") {
      const photos = photosLocales(ici);
      const empreintes = photos.map((p) => (existsSync(join(RACINE, "public", p)) ? sha1(join(RACINE, "public", p)) : `absent:${p}`));
      if (empreintes.join() !== EMPREINTES_REFERENCES.join()) faute(`${libelle} : photos des cartes ≠ maquette (${photos.join(", ")})`);
    }
    if (libelle === "Maillage") {
      const attendues = PHOTOS_MAILLAGE_CAPTURE.filter((p) => !PHOTOS_ABSENTES.includes(p));
      if (photosLocales(ici).join() !== attendues.join()) faute(`${libelle} : photos ${photosLocales(ici).join(", ")} ≠ capture ${attendues.join(", ")}`);
      for (const p of PHOTOS_ABSENTES) {
        if (!PHOTOS_MAILLAGE_CAPTURE.includes(p)) faute(`${libelle} : photo déclarée absente mais que la capture ne nomme pas : ${p}`);
        if (existsSync(join(RACINE, "public", p))) faute(`${libelle} : ${p} est arrivée dans public/, la déclarer dans la donnée et la retirer de PHOTOS_ABSENTES`);
      }
    }
  });

  // 3. Rien d'inventé, puis le littéral, section contre section : une
  //    apostrophe redressée ici ne s'excuse pas d'être droite ailleurs.
  const ajouts = AJOUTS.map(normalise);
  SECTIONS_CAPTURE.forEach(({ libelle, html }, rang) => {
    const texteIci = normalise(noeuds(html).join(" "));
    const litteralIci = noeuds(html).join(" ");
    for (const noeud of noeuds(rendues[rang])) {
      const n = normalise(noeud);
      if (ajouts.some((a) => a.includes(n))) continue;
      if (!texteIci.includes(n)) faute(`${libelle} : texte rendu absent de la capture « ${noeud.slice(0, 80)} »`);
      else if (!litteralIci.includes(noeud)) faute(`${libelle} : texte rendu hors littéral de la capture « ${noeud.slice(0, 80)} »`);
    }
  });
  const texteTout = normalise(noeuds(rendu).join(" "));
  for (const a of ajouts) if (!texteTout.includes(a)) faute(`ajout déclaré plus rendu « ${a} », à retirer de AJOUTS`);

  // 4 bis et 6. Aucun lien mort, aucun interdit.
  if (rendu.includes('href="#"')) faute('un lien href="#" est rendu');
  for (const [motif, pourquoi] of INTERDITS) if (motif.test(texteTout)) faute(`interdit rendu : ${pourquoi}`);

  return fautes;
}

/* ------------------------------------------------- il sait échouer, d'abord */

const PAGE: PageRelais = JSON.parse(readFileSync(FICHIER, "utf8"));
if (PAGE.url !== "/secteurs/" || PAGE.contenu.gabarit !== "offre") {
  throw new Error("secteurs.json doit servir /secteurs/ sous le gabarit « offre »");
}

const copie = (): PageRelais => structuredClone(PAGE);
const section = <T extends string>(p: PageRelais, type: T) =>
  p.contenu.sections!.find((s) => s.type === type) as Extract<NonNullable<ContenuOffre["sections"]>[number], { type: T }>;

const ALTERATIONS: [string, (p: PageRelais) => void][] = [
  ["un mot changé", (p) => { const s = section(p, "probleme"); s.punchline = s.punchline.replace("procédé", "process"); }],
  ["une section retirée", (p) => { p.contenu.sections = p.contenu.sections!.filter((s) => s.type !== "garanties"); }],
  ["une phrase inventée", (p) => { p.contenu.chapeau += " Nous intervenons partout, tout le temps."; }],
  ["un interdit", (p) => { section(p, "objections").questions[0].reponse += " Nous savons notamment le faire."; }],
  ["deux photos de références échangées", (p) => { const r = section(p, "preuves").preuves; [r[0].photo, r[1].photo] = [r[1].photo, r[0].photo]; }],
  ["une apostrophe redressée", (p) => { p.contenu.formulaireHeroMention = "Rappel dans l'heure"; }],
  ["une photo de maillage retirée", (p) => { delete p.contenu.pagesLiees![1].photo; }],
];

for (const [nom, altere] of ALTERATIONS) {
  const p = copie();
  altere(p);
  if (juge(p).length === 0) throw new Error(`contrôle aveugle : « ${nom} » passe sans être vu`);
}

/* -------------------------------------------------------- puis la vraie page */

const fautes = juge(PAGE);
if (fautes.length > 0) {
  console.error(`/secteurs/ : ${fautes.length} écart(s) à la capture\n  · ${fautes.join("\n  · ")}`);
  process.exit(1);
}
console.log(
  `/secteurs/ : ${SECTIONS_CAPTURE.length} sections conformes à maquette/rendu/secteurs.html, ` +
    `${TROUS.length} trous et ${AJOUTS.length} ajouts déclarés (formulaire partagé), ` +
    `${ALTERATIONS.length} altérations toutes vues.`,
);
