/**
 * Contrôle du gabarit ÉTUDE DE CAS, sans navigateur.
 *
 *   bun components/site/preuve/verification-preuve.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/preuves--suez-remise-en-etat.html` et
 * `maquette/rendu/preuves--danone-lignes-de-production.html` (pages pilotes,
 * 10 sections chacune, relevées le 07/10). Méthode reprise de
 * `components/site/offre/verification-offre.tsx`.
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *
 * 1. LES VALEURS DES CAPTURES SONT RELUES DANS LE FICHIER à chaque exécution :
 *    chaque dessin et chaque copie sont d'abord vérifiés PRÉSENTS dans la
 *    capture de la page, puis dans son rendu.
 * 2. CHAQUE CHAÎNE DE LA DONNÉE (relais JSON) EXISTE DANS LA CAPTURE : une
 *    copie retapée, résumée ou inventée fait tomber le contrôle. C'est le
 *    « mot pour mot » du contrat, vérifié mécaniquement.
 * 3. LA PAGE RÉELLE est rendue depuis sa vraie donnée,
 *    `supabase/import/gabarits-maquette/preuves-<slug>.json`.
 * 4. UN SEUL H1, aucun `href="#"`, les cibles du maillage de la capture.
 * 5. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`.
 * 6. LES INTERDITS DE COPIE du contrat sont absents du rendu, tiret cadratin
 *    compris.
 * 7. UNE SECTION SANS DONNÉE NE SE REND PAS.
 * 8. LES CAS LIÉS de chaque page (cartes `/preuves/<cas>/`) sont ceux de sa
 *    capture, mêmes URL, même ordre, même texte, dans le rendu du relais ET
 *    sur la page servie par le site (http://localhost:4340, ou `SITE_URL`).
 *    Un témoin prouve que le contrôle tombe sur une carte retirée.
 * 9. LES IMAGES : chaque emplacement d'image de la capture (logo, photo du
 *    héros, photo du dispositif, vignette de chaque carte « Pour aller plus
 *    loin ») a son image rendue, avec le dessin de la capture, QUAND LA DONNÉE
 *    LA PORTE ; aucune image n'est rendue hors de ces emplacements ; et chaque
 *    image rendue vient DE LA MAQUETTE OU DE LA RÉPARTITION (écart du 09/10,
 *    voir plus bas) : toute autre photo tombe. Les quatre pilotes de mesure
 *    (JTEKT, Bamesa, Eiffage, Tournaire) portent leurs images mesurées, dans
 *    une copie en mémoire de leur donnée, et la donnée disque a le droit d'y
 *    substituer une photo de la répartition.
 * 10. LA PAGE SERVIE sort par CE gabarit (marqueur `data-gabarit`) et porte le
 *    H1 de la donnée : le trou qui a laissé passer 28 pages servies par
 *    `PageFiche` le 08/10.
 * 11. LES SURVOLS du module CSS sont les `style-hover` de la source `MigenCas`.
 * 12. LES GRILLES des étapes et des résultats (colonnes, écart) et le libellé
 *    du bouton d'envoi sont ceux de la capture de chaque page.
 * Des témoins prouvent que 9, 10 et 12 savent échouer.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { REGISTRE, cheminRegistre, deLaRepartition } from "@/lib/photos-autorisees";
import type { ContenuPreuve } from "@/types/preuve";

import PagePreuve from "./PagePreuve";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ----------------------------------------------------- outils de comparaison
   Repris de verification-offre.tsx : capture = sérialisation du DOM, rendu =
   déclaration compacte de React. Même valeur, deux écritures. */

function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|’/g, "'")
    // Les entités que la capture ET le rendu de React écrivent pour le texte
    // brut : « R&D » se compare en clair des deux côtés.
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/* ------------------------------------------------------------- les interdits */

const INTERDITS = [
  "—",
  "cinq agences",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "clients réguliers",
  "7j/7",
  "7 jours sur 7",
  "24h",
  "€",
] as const;

function verifieInterdits(page: string, nom: string): void {
  const visible = texteLisible(page).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

/* -------------------------------------------------------- les cas liés

   Les cartes « Pour aller plus loin » qui visent une autre étude de cas, telles
   qu'un lecteur les voit : chaque lien `/preuves/<cas>/` distinct, dans l'ordre
   du document, avec son texte lisible. Ni la page elle-même ni le hub
   `/preuves/` (le fil d'Ariane et l'en-tête y mènent). Zone lue : `<main>` sur
   le site et dans le rendu, tout ce qui précède `<footer` sur la capture, qui
   n'a pas de `<main>`. */
function casLies(html: string, url: string): string[] {
  const debut = html.indexOf("<main");
  const pied = html.indexOf("<footer");
  const zone =
    debut >= 0
      ? html.slice(debut, html.indexOf("</main>", debut))
      : html.slice(0, pied < 0 ? undefined : pied);
  const vus = new Map<string, string>();
  for (const [, href, interieur] of zone.matchAll(
    /<a\s[^>]*?href="(\/preuves\/[^"/]+\/?)"[^>]*>([\s\S]*?)<\/a>/g,
  )) {
    const cible = href.endsWith("/") ? href : `${href}/`;
    if (cible !== url && !vus.has(cible)) vus.set(cible, texteLisible(interieur).trim());
  }
  return [...vus].map(([cible, texte]) => `${cible} « ${texte} »`);
}

/** Mêmes cas, même ordre, même texte de carte que la capture, sinon chute. */
function compareCas(nom: string, capture: string[], obtenus: string[], source: string): void {
  assert.deepEqual(
    obtenus,
    capture,
    `${nom} : les cas liés ${source} ne sont pas ceux de la capture\n` +
      `  capture (${capture.length}) : ${capture.join(" | ")}\n` +
      `  ${source} (${obtenus.length}) : ${obtenus.join(" | ") || "aucun"}`,
  );
}

/* -------------------------------------------------------------- les images

   La capture sert ses images en `blob:` : elle dit OÙ est chaque image et son
   dessin, pas quel fichier. Le fichier vient de la mesure (`mesure-photos.mjs`),
   et ses octets doivent être ceux d'une ressource embarquée de l'autonome. */

interface Ressource {
  mime: string;
  compressed?: boolean;
  data: string;
}

/** La table de ressources de l'autonome, même lecture que verification-carriere.tsx. */
function ressources(): { mime: string; octets: Buffer }[] {
  const lignes = readFileSync(join(RACINE, "maquette", "site-final-autonome.html"), "utf8").split("\n");
  const ligne = lignes.find((l) => l.startsWith('{"') && l.includes('"mime"'));
  assert.ok(ligne, "l'autonome ne porte plus sa table de ressources");
  const table = JSON.parse(ligne.slice(0, ligne.lastIndexOf("}") + 1)) as Record<string, Ressource>;
  return Object.values(table).map((r) => {
    const brut = Buffer.from(r.data, "base64");
    return { mime: r.mime, octets: r.compressed ? gunzipSync(brut) : brut };
  });
}

const RESSOURCES = ressources();
const sha256 = (octets: Buffer) => createHash("sha256").update(octets).digest("hex");
const EMPREINTES = new Set(
  RESSOURCES.filter((r) => r.mime.startsWith("image/")).map((r) => sha256(r.octets)),
);
assert.ok(EMPREINTES.size > 0, "aucune image dans les ressources de l'autonome : lecture cassée");

const ALT_HERO = "Intervention migen sur site client";
const ALT_DISPOSITIF = "Technicien migen en mission";

interface Emplacement {
  /** `logo`, `photoHero`, `photoDispositif` ou `plusLoin <href>`. */
  cle: string;
  /** Le chemin public servi, `/_next/image` décodé ; `blob:` sur la capture. */
  src: string;
  img: Set<string>;
  cadre: Set<string>;
}

/** Les déclarations d'un style, à l'écriture de React : la sérialisation du DOM
 *  écrit `rgb(255, 255, 255)` pour `#fff` et met la couleur d'une ombre en tête. */
function declarations(style: string): Set<string> {
  return new Set(
    normaliseStyle(style.replace(/&quot;/g, '"'))
      .split(";")
      .filter(Boolean)
      .map((d) =>
        d
          .replace(/rgb\(255,255,255\)/g, "#fff")
          .replace(/^box-shadow:(rgba?\([^)]*\)) (.*)$/, "box-shadow:$2 $1"),
      ),
  );
}

function attribut(balise: string, nom: string): string | undefined {
  return new RegExp(`\\s${nom}="([^"]*)"`).exec(balise)?.[1];
}

/** Le chemin public d'un `src` rendu : `next/image` l'emballe dans `/_next/image?url=`,
 *  `/_next/image/?url=` sur la page servie (`trailingSlash: true`). */
function cheminServi(src: string): string {
  if (!/^\/_next\/image\/?\?/.test(src)) return src;
  return new URLSearchParams(src.slice(src.indexOf("?") + 1).replace(/&amp;/g, "&")).get("url") ?? src;
}

/** Chaque image de la zone, rangée dans son emplacement. Même lecteur pour la
 *  capture, le rendu et la page servie : l'emplacement se lit au texte
 *  alternatif (fixe pour les photos, le client pour le logo) ou à la carte
 *  qui l'enveloppe, le cadre est la balise qui ouvre juste avant l'image. */
function emplacements(zone: string, client: string, nom: string): Map<string, Emplacement> {
  const sortie = new Map<string, Emplacement>();
  for (const m of zone.matchAll(/<img\b[^>]*>/g)) {
    const balise = m[0];
    const avant = zone.slice(0, m.index);
    const alt = normaliseTexte(attribut(balise, "alt") ?? "");
    const ouverture = avant.lastIndexOf("<a ");
    const carte = ouverture > avant.lastIndexOf("</a>") ? attribut(avant.slice(ouverture), "href") : undefined;
    const cle =
      alt === ALT_HERO
        ? "photoHero"
        : alt === ALT_DISPOSITIF
          ? "photoDispositif"
          : alt === normaliseTexte(client)
            ? "logo"
            : carte
              ? `plusLoin ${carte.endsWith("/") ? carte : `${carte}/`}`
              : `inconnu « ${alt} »`;
    assert.ok(!sortie.has(cle), `${nom} : deux images dans l'emplacement ${cle}`);
    const cadre = /<\w+\b[^>]*>$/.exec(avant)?.[0] ?? "";
    sortie.set(cle, {
      cle,
      src: cheminServi(attribut(balise, "src") ?? ""),
      img: declarations(attribut(balise, "style") ?? ""),
      cadre: declarations(attribut(cadre, "style") ?? ""),
    });
  }
  return sortie;
}

/** La zone du gabarit dans la capture : sans l'en-tête ni le pied du site. */
function zoneCapture(capture: string): string {
  const debut = capture.indexOf("cas-root");
  const pied = capture.indexOf("<footer", debut);
  return capture.slice(debut, pied < 0 ? undefined : pied);
}

/** Les images que la donnée porte, par emplacement. */
function imagesPortees(contenu: ContenuPreuve): Map<string, string> {
  const portees = new Map<string, string>();
  if (contenu.logo) portees.set("logo", contenu.logo);
  if (contenu.photoHero) portees.set("photoHero", contenu.photoHero);
  if (contenu.photoDispositif) portees.set("photoDispositif", contenu.photoDispositif);
  for (const lien of contenu.plusLoin ?? []) {
    if (lien.photo) portees.set(`plusLoin ${lien.href.endsWith("/") ? lien.href : `${lien.href}/`}`, lien.photo);
  }
  return portees;
}

/** Les octets d'un chemin public sont-ils ceux d'une ressource de la maquette ? */
function octetsDeLaMaquette(chemin: string): boolean {
  const fichier = join(RACINE, "public", decodeURIComponent(chemin));
  return existsSync(fichier) && EMPREINTES.has(sha256(readFileSync(fichier)));
}

/* ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
   Cette porte exigeait les OCTETS de la maquette pour toute image rendue.
   C'était juste tant que le site n'avait pas d'images à lui. Ce ne l'est plus :
   les 109 photos achetées sous licence le 08/10 ne venaient d'aucune capture,
   donc cette porte les refusait toutes, et les 41 études de cas se partageaient
   une poignée de photos de calage (`mesure-photos-site.mjs` : `team-duo.jpg`
   servie 133 fois sur le site). La règle devient DEUX SOURCES, et pas une de
   plus : les octets de la maquette, OU la répartition du 09/10 (registre des
   109 photos sous licence + les dix photos de l'équipe Migen), déclarée dans
   `lib/photos-autorisees.ts`. Tout le reste tombe, et le témoin « une
   photo aux octets étrangers » plus bas en fait encore la preuve. */
function photoAdmise(chemin: string): boolean {
  return octetsDeLaMaquette(chemin) || deLaRepartition(chemin);
}

/**
 * Étape 9, sur une zone rendue (rendu du relais ou page servie) : chaque image
 * portée est rendue à son emplacement, avec le dessin de la capture (image ET
 * cadre) ; aucune image hors des emplacements portés ; aucun octet étranger.
 */
function controleImages(nom: string, capture: string, contenu: ContenuPreuve, zone: string): number {
  const attendus = emplacements(zoneCapture(capture), contenu.client, `${nom} (capture)`);
  for (const cle of attendus.keys()) {
    assert.ok(!cle.startsWith("inconnu"), `${nom} : image de la capture sans emplacement connu, ${cle}`);
  }
  const portees = imagesPortees(contenu);
  const rendus = emplacements(zone, contenu.client, nom);

  for (const [cle, src] of portees) {
    assert.ok(attendus.has(cle), `${nom} : la donnée porte une image en « ${cle} », emplacement absent de la capture`);
    const rendu = rendus.get(cle);
    assert.ok(rendu, `${nom} : la donnée porte ${src} en « ${cle} », aucune image rendue à cet emplacement`);
    assert.equal(rendu.src, src, `${nom} : « ${cle} » rend ${rendu.src}, la donnée porte ${src}`);
    const attendu = attendus.get(cle) as Emplacement;
    for (const [partie, voulues, obtenues] of [
      ["image", attendu.img, rendu.img],
      ["cadre", attendu.cadre, rendu.cadre],
    ] as const) {
      for (const d of voulues) {
        assert.ok(obtenues.has(d), `${nom} : « ${cle} », ${partie} sans le dessin de la capture « ${d} »`);
      }
    }
  }
  for (const [cle, rendu] of rendus) {
    assert.ok(portees.has(cle), `${nom} : image rendue en « ${cle} » (${rendu.src}) sans que la donnée la porte`);
    assert.ok(
      photoAdmise(rendu.src),
      `${nom} : ${rendu.src} ne vient ni de la maquette ni de la répartition (ou le fichier manque)`,
    );
  }
  return rendus.size;
}

/**
 * Les images MESURÉES des quatre pilotes, le 08/10, par
 * `node components/site/preuve/mesure-photos.mjs` dans la maquette qui tourne :
 * octets lus dans le `blob:` de chaque emplacement, fichier aux octets
 * identiques. Elles vivent ICI, en mémoire, en attendant que les
 * `preuves-*.json` les portent (régénérés par un autre lot).
 */
const IMAGES_MESUREES: Record<
  string,
  Pick<ContenuPreuve, "logo" | "logoInverse" | "photoHero" | "photoDispositif"> & {
    plusLoin: Record<string, string>;
  }
> = {
  "/preuves/jtekt/": {
    logo: "/assets/clients/mq-e93a6ad5abf7.svg",
    photoHero: "/assets/web/mq-2a8c78b5c75c.jpg",
    photoDispositif: "/assets/web/mq-e6322efcd358.jpg",
    plusLoin: {
      "/preuves/": "/assets/web/mq-339d39e2a674.jpg",
      "/offres/residence/": "/assets/web/mq-056f3c250981.jpg",
      "/secteurs/automobile/": "/assets/web/mq-948c28bcda08.jpg",
      "/preuves/autoliv/": "/assets/web/mq-17e2f3bce95f.jpg",
    },
  },
  "/preuves/bamesa/": {
    logo: "/assets/clients/bamesa.png",
    photoHero: "/assets/web/mq-e6322efcd358.jpg",
    photoDispositif: "/assets/web/mq-056f3c250981.jpg",
    plusLoin: {
      "/preuves/": "/assets/web/mq-948c28bcda08.jpg",
      "/offres/residence/": "/assets/web/mq-17e2f3bce95f.jpg",
      "/secteurs/automobile/": "/assets/web/mq-2a6115ec9fe0.jpg",
      "/preuves/autoliv/": "/assets/web/mq-0699d4d92e7e.jpg",
    },
  },
  "/preuves/eiffage/": {
    logo: "/assets/clients/mq-21daf7c60970.svg",
    photoHero: "/assets/web/mq-948c28bcda08.jpg",
    photoDispositif: "/assets/web/mq-e6322efcd358.jpg",
    plusLoin: {
      "/preuves/soprema/": "/assets/web/mq-339d39e2a674.jpg",
      "/preuves/dimomaint/": "/assets/web/mq-056f3c250981.jpg",
      "/preuves/eriks/": "/assets/web/mq-17e2f3bce95f.jpg",
      "/preuves/savoye/": "/assets/web/mq-2a6115ec9fe0.jpg",
    },
  },
  "/preuves/tournaire/": {
    logo: "/assets/clients/mq-7c01e175985e.png",
    photoHero: "/assets/web/mq-0699d4d92e7e.jpg",
    photoDispositif: "/assets/web/mq-339d39e2a674.jpg",
    plusLoin: {
      "/preuves/": "/assets/web/mq-056f3c250981.jpg",
      "/offres/residence/": "/assets/web/mq-948c28bcda08.jpg",
      "/secteurs/chimie/": "/assets/web/mq-17e2f3bce95f.jpg",
      "/preuves/savoye/": "/assets/web/mq-2a6115ec9fe0.jpg",
    },
  },
};

/** Une COPIE de la donnée qui porte les images mesurées. Si la donnée disque
 *  porte déjà une image, elle doit être la même : deux mesures, un fichier. */
function avecImagesMesurees(url: string, contenu: ContenuPreuve): ContenuPreuve {
  const mesure = IMAGES_MESUREES[url];
  if (!mesure) return contenu;
  const { plusLoin, ...champs } = mesure;
  const copie: ContenuPreuve = {
    ...contenu,
    ...champs,
    plusLoin: (contenu.plusLoin ?? []).map((lien) => ({ ...lien, photo: plusLoin[lien.href] })),
  };
  /* La mesure dit ce que LA MAQUETTE servait. Depuis la répartition du 09/10,
     la donnée disque a le droit d'y substituer une photo sous licence : on
     garde alors CELLE DE LA DONNÉE, et c'est elle que le rendu doit porter.
     Toute autre divergence reste une faute : une photo ni mesurée ni du
     registre veut dire que quelqu'un a deviné. */
  const mesurees = imagesPortees(copie);
  for (const [cle, src] of imagesPortees(contenu)) {
    if (src === mesurees.get(cle)) continue;
    assert.ok(
      deLaRepartition(src),
      `${url} : la donnée porte ${src} en « ${cle} », la mesure dit ${mesurees.get(cle)} et ce n'est pas une photo de la répartition`,
    );
    if (cle === "logo") copie.logo = src;
    else if (cle === "photoHero") copie.photoHero = src;
    else if (cle === "photoDispositif") copie.photoDispositif = src;
  }
  copie.plusLoin = (contenu.plusLoin ?? []).map((lien) => ({
    ...lien,
    photo: lien.photo && deLaRepartition(lien.photo) ? lien.photo : plusLoin[lien.href],
  }));
  return copie;
}

/* ---------------------------------------------- le chapô, phrase par phrase

   Un interdit retire SA PHRASE, jamais le paragraphe : le 08/10, le chapô
   entier de Bamesa et de Valeo tombait pour un « notamment », et leur titre
   remontait de 83 et 52 px. Même découpe que `extrait-depuis-captures.py`. */

const FIN_DE_PHRASE = /(?<=[.!?…])\s+(?=[«"A-ZÀ-ÖØ-Þ0-9])/;

/** Les paragraphes du héros de la capture, tels quels. */
function parasDuHeros(capture: string): string[] {
  const debut = capture.indexOf('data-screen-label="Étude de cas · héros"');
  assert.ok(debut >= 0, "capture sans héros d'étude de cas");
  const heros = capture.slice(debut, capture.indexOf("</section>", debut));
  return [...heros.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => texteLisible(m[1]).trim());
}

/** Le chapô que la donnée doit porter : chaque paragraphe du héros de la
 *  capture, moins ses seules phrases interdites. */
function chapoAttendu(capture: string): string[] {
  return parasDuHeros(capture)
    .map((para) =>
      para
        .split(FIN_DE_PHRASE)
        .filter((phrase) => !INTERDITS.some((mot) => phrase.toLowerCase().includes(mot)))
        .join(" "),
    )
    .filter(Boolean);
}

function controleChapo(nom: string, capture: string, contenu: ContenuPreuve): void {
  assert.deepEqual(
    (contenu.chapeau ?? []).map((p) => normaliseTexte(p).trim()),
    chapoAttendu(capture),
    `${nom} : le chapô n'est pas celui de la capture moins ses seules phrases interdites`,
  );
}

/* --------------------------------------- les largeurs du bento « Notre réponse »

   MigenCas (`bento`) élargit la dernière carte pour combler sa rangée : Valeo
   (3 cartes) la pose sur trois colonnes, JTEKT (4) sur deux. Le site les
   posait toutes sur une, à 364 px au lieu de 1120 mesurés le 08/10. */

function spansBento(html: string, debut: number): number[] {
  if (debut < 0) return [];
  const zone = html.slice(debut, html.indexOf("</section>", debut));
  return [...zone.matchAll(/grid-column:\s*span (\d)/g)].map((m) => Number(m[1]));
}

function controleBento(nom: string, capture: string, rendu: string): void {
  assert.deepEqual(
    spansBento(rendu, rendu.indexOf("Ce que nous avons mis en place")),
    spansBento(capture, capture.indexOf('class="cs-bento"')),
    `${nom} : les cartes de « Ce que nous avons mis en place » n'ont pas les largeurs de la capture`,
  );
}

/* ------------------------------------------- une page pilote, de bout en bout */

interface PageRelais {
  url: string;
  titre_h1: string;
  contenu: ContenuPreuve;
}

/** Les clés qui ne sont pas de la copie : attributs de la capture, ou chemins
 *  d'images mesurées, contrôlés par l'étape 9. */
const HORS_COPIE = new Set(["href", "gabarit", "logo", "photoHero", "photoDispositif", "photo"]);

/** Toutes les chaînes d'une donnée, feuilles du JSON. Les `href` et chemins
 *  d'images en sont exclus : la capture ne les porte pas dans son texte lisible. */
function chainesDe(valeur: unknown, cle?: string): string[] {
  if (typeof valeur === "string") return cle && HORS_COPIE.has(cle) ? [] : [valeur];
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chainesDe(v));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) => chainesDe(v, k));
  }
  return [];
}

/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
function litCapture(slug: string): string {
  return appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", `preuves--${slug}.html`), "utf8"));
}

function controlePilote(slug: string, copiesFixes: readonly string[]): string {
  const nom = `preuves-${slug}`;
  const capture = litCapture(slug);
  const captureTexte = texteLisible(capture);
  const captureStyle = normaliseStyle(capture);

  const page = JSON.parse(
    readFileSync(join(DOSSIER, `${nom}.json`), "utf8"),
  ) as PageRelais;

  assert.equal(page.url, `/preuves/${slug}/`, `${nom} : URL du relais`);
  assert.equal(
    page.contenu.gabarit,
    "etude-de-cas",
    `${nom} : le contenu doit se déclarer « etude-de-cas », sinon la route retombe sur un autre gabarit`,
  );

  /* Le H1 du relais est celui que la capture REND (champ h1Rendu du relevé). */
  const releve = JSON.parse(
    readFileSync(join(RACINE, "maquette", "rendu", `preuves--${slug}.json`), "utf8"),
  ) as { h1Rendu: string; nbSections: number };
  assert.equal(
    page.titre_h1,
    releve.h1Rendu,
    `${nom} : le relais doit porter le H1 rendu par la capture`,
  );

  const rendu = renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
    />,
  );
  const renduTexte = texteLisible(rendu);
  const renduStyle = normaliseStyle(rendu);

  /* 1 · chaque chaîne de la donnée vient de la capture, et se rend. */
  for (const chaine of chainesDe(page.contenu).concat(page.titre_h1)) {
    const attendu = normaliseTexte(chaine);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie « ${chaine} » : donnée inventée ou retapée`,
    );
    assert.ok(
      renduTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie « ${chaine} »`,
    );
  }

  /* 2 · les copies fixes du gabarit, dans la capture puis dans le rendu. */
  for (const texte of copiesFixes) {
    const attendu = normaliseTexte(texte);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie fixe « ${texte} »`,
    );
    assert.ok(
      renduTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie fixe « ${texte} »`,
    );
  }

  /* 3 · la fidélité du dessin, une valeur porteuse par section, relevée dans
     la capture de la page. */
  for (const fragment of [
    // 0 · héros : la grille, le H1 à 66px, le cadre photo de 480px.
    "grid-template-columns: 1.08fr 0.92fr",
    "clamp(38px,4.6vw,66px)",
    "height: 480px",
    // 1 · chiffres : le rythme de la section, la valeur à 19px.
    "padding: 88px 40px 0px",
    "font: 600 calc(19px * var(--ts))/1.3 var(--ft)",
    // 2 · situation : la grille .72/1.28, la carte d'objectif.
    "grid-template-columns: minmax(0px, 0.72fr) minmax(0px, 1.28fr)",
    "grid-template-columns: 40px minmax(0px, 1fr)",
    // 3 · réponse : le bento et sa carte sombre.
    "grid-template-columns: repeat(3, minmax(0px, 1fr))",
    "min-height: 220px",
    // 4 · déroulé : le rail orange.
    "linear-gradient(90deg,var(--acc),rgba(255,124,60,.15))",
    // 5 · dispositif : la grille photo/table et la ligne du tableau.
    "grid-template-columns: 0.85fr 1.15fr",
    "grid-template-columns: minmax(120px, 0.42fr) minmax(0px, 1fr)",
    // 6 · résultat : le panneau sombre et la coche.
    "padding: 60px 56px",
    "border-top: 2px solid var(--acc)",
    // 7 · complément : la grille auto-fit.
    "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
    // 8 · besoin : l'ancre défilée et la grille 1fr 1fr.
    "scroll-margin-top: 100px",
    "grid-template-columns: 1fr 1fr",
    // 9 · plus loin : la grille auto-fill et la vignette de 150px.
    "repeat(auto-fill, minmax(260px, 1fr))",
    "height: 150px",
  ]) {
    const attendu = normaliseStyle(fragment);
    assert.ok(
      captureStyle.includes(attendu),
      `${nom} : la capture ne porte pas le dessin « ${fragment} » : valeur à revérifier`,
    );
    assert.ok(
      renduStyle.includes(attendu),
      `${nom} : le rendu ne porte pas le dessin de la capture « ${fragment} »`,
    );
  }

  /* 4 · un seul h1, l'ancre du formulaire, aucune cible morte. */
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(
    !/href="#"/.test(rendu),
    `${nom} : aucun href="#", la maquette navigue par script, le site par ancres réelles`,
  );
  assert.ok(
    rendu.includes('href="#cas-form"') && rendu.includes('id="cas-form"'),
    `${nom} : l'appel à l'action du héros vise l'ancre du formulaire`,
  );
  assert.ok(
    rendu.includes('href="tel:+33478337205"'),
    `${nom} : le bouton téléphone de la capture`,
  );
  for (const lien of page.contenu.plusLoin ?? []) {
    const sans = lien.href.replace(/\/$/, "");
    assert.ok(
      rendu.includes(`href="${sans}/"`) || rendu.includes(`href="${sans}"`),
      `${nom} : le maillage de la capture vise ${lien.href} : lien absent du rendu`,
    );
  }

  /* 5 · aucun échafaudage Tailwind de couleur. */
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
        classe[1],
      ),
      `${nom} : classe Tailwind de couleur dans le rendu : « ${classe[1]} »`,
    );
    assert.ok(
      !/\bdark:/.test(classe[1]),
      `${nom} : variante dark: dans le rendu : « ${classe[1]} »`,
    );
  }

  /* 6 · les interdits du contrat. */
  verifieInterdits(rendu, nom);

  /* 7 · les images : celles que la donnée porte, à leur emplacement, octets de
     la maquette ; aucune autre. */
  controleImages(nom, capture, page.contenu, rendu);

  return rendu;
}

/* -------------------------------------- 12 · grilles et bouton, page par page

   Le nombre de colonnes et l'écart des étapes (`cs-steps`) et des résultats
   (`cs-res`) changent d'une capture à l'autre (MigenCas `stepGrid`, `resGrid`),
   et le bouton d'envoi répète le libellé de la page : relus dans la capture DE
   LA page, cherchés tels quels dans son rendu. Le 08/10, des valeurs figées
   (3 colonnes, écart 20, « On me rappelle dans l'heure ») passaient ce contrôle. */
function controleGrillesEtEnvoi(nom: string, capture: string, rendu: string): void {
  const renduStyle = normaliseStyle(rendu);
  for (const classe of ["cs-steps", "cs-res"]) {
    const style = new RegExp(`class="${classe}" style="([^"]*)"`).exec(capture)?.[1];
    if (classe === "cs-steps") assert.ok(style, `${nom} : la capture ne porte plus de grille .cs-steps`);
    if (!style) continue;
    const attendu = normaliseStyle(style).replace(/;$/, "");
    assert.ok(
      renduStyle.includes(`style="${attendu}"`),
      `${nom} : la grille .${classe} de la capture, « ${style} », n'est pas dans le rendu`,
    );
  }
  const envoi = (html: string) =>
    texteLisible(/<button[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/.exec(html)?.[1] ?? "").trim();
  assert.equal(envoi(rendu), envoi(capture), `${nom} : libellé du bouton d'envoi`);
}

/* ------------------------------------------------- les deux pages pilotes */

controlePilote("suez-remise-en-etat", [
  "Étude de cas",
  "SUEZ IWT",
  "01 · La situation",
  "Les objectifs posés",
  "02 · Notre réponse",
  "Ce que nous avons mis en place",
  "03 · Étape par étape",
  "Le déroulé",
  "04 · Fiche mission",
  "Le dispositif",
  "05 · Résultat",
  "Le résultat",
  "Votre besoin",
  "Poser mon besoin de renfort technique",
  "Pour aller plus loin",
  "04 78 33 72 05",
]);

controlePilote("danone-lignes-de-production", [
  "Étude de cas",
  "DANONE (BLÉDINA)",
  "01 · La situation",
  "Les objectifs posés",
  "02 · Notre réponse",
  "Ce que nous avons mis en place",
  "03 · Étape par étape",
  "Le déroulé",
  "04 · Fiche mission",
  "Le dispositif",
  "05 · Résultat",
  "Le résultat",
  "Votre besoin",
  "Demander un renfort de maintenance",
  "Pour aller plus loin",
  "04 78 33 72 05",
]);

/* -------------------- une section sans donnée ne se rend pas */

const VIDE: ContenuPreuve = {
  gabarit: "etude-de-cas",
  client: "Client de contrôle",
  chapeau: [],
  bouton: "Bouton de contrôle",
};
const renduVide = renderToStaticMarkup(
  <PagePreuve titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);
assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
for (const absent of [
  "Les objectifs posés",
  "01 · La situation",
  "Ce que nous avons mis en place",
  "Le déroulé",
  "Le dispositif",
  "05 · Résultat",
  "Votre besoin", // sans `besoinTitre`, ni section ni formulaire
  "Pour aller plus loin",
]) {
  assert.ok(
    !texteLisible(renduVide).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

/* -------------------- toutes les pages du gabarit 02, porte BLOQUANTE.

   LA LISTE SE DÉDUIT DE L'INDEX DE LA MAQUETTE, jamais d'un nombre figé ni
   d'un filtre de préfixe : mêmes raisons, déjà payées, que l'étape 8 de
   verification-offre.tsx. Chaque page est rendue depuis sa vraie donnée et
   repasse les contrôles des pilotes, SAUF le relevé de dessin (propre aux deux
   captures étudiées section par section) : ici, chaque chaîne de la donnée est
   vérifiée dans la capture DE LA page, puis dans son rendu. */

const INDEX_MAQUETTE = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
) as { url: string; gabarit?: string }[];
const URLS_GABARIT_02 = INDEX_MAQUETTE.filter((p) =>
  (p.gabarit ?? "").startsWith("02"),
).map((p) => p.url);

assert.ok(
  URLS_GABARIT_02.length > 0,
  "l'index de la maquette ne déclare aucune page au gabarit 02 : index illisible ou champ renommé",
);

/**
 * Les pages du gabarit DÉLIBÉRÉMENT non portées, chacune avec sa raison.
 * VIDE depuis le 08/10 : `/preuves/tournaire/`, seule exclue jusque-là, est
 * portée sous la reformulation arbitrée ci-dessous.
 */
const EXCLUES: string[] = [];

/**
 * Les H1 REFORMULÉS, sur le modèle des paires CORRIGE de
 * `verification-contact.tsx`, vérifiés DES DEUX CÔTÉS : la capture porte
 * `maquette` en H1, le rendu porte `rendu` et jamais `maquette`. `appui` est
 * l'expression de la capture d'où vient la reformulation : sans elle, le
 * nouveau titre serait inventé.
 *
 * `/preuves/tournaire/` : « sur mesure » est un interdit du contrat
 * (CLAUDE.md §9). MEHDI A TRANCHÉ LE 08/10, c'est la SEULE reformulation
 * autorisée, tout le reste de la page est mot pour mot. L'objectif « Fiabiliser
 * une ligne équipée de machines sur mesure. » n'est PAS reformulé : il reste un
 * trou, déclaré par `extrait-depuis-captures.py`.
 */
const H1_REFORMULES: Record<string, { maquette: string; rendu: string; appui: string }> = {
  "/preuves/tournaire/": {
    maquette: "Maintenir des machines conçues sur mesure",
    rendu: "Maintenir des machines conçues en interne",
    appui: "équipée à 80 % de machines conçues en interne",
  },
};

const surDisque = new Set(readdirSync(DOSSIER).filter((n) => n.endsWith(".json")));
const manquantes = URLS_GABARIT_02.filter(
  (url) => !surDisque.has(`${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`),
);
assert.deepEqual(
  manquantes.sort(),
  [...EXCLUES].sort(),
  `pages du gabarit 02 sans fichier de données dans ${DOSSIER}, hors exclusions déclarées : ${manquantes.join(", ")}`,
);

/** Les cas liés de chaque capture, relus une fois, comparés au rendu puis au site. */
const CAS_DE_LA_CAPTURE = new Map<string, string[]>();
/** Chaque page du gabarit, capture et donnée disque, relues une fois. */
const PAGES_RELAIS = new Map<string, { capture: string; page: PageRelais }>();
/** Le rendu de chaque page, gardé pour le témoin du bento. */
const RENDUS = new Map<string, string>();
/** Les pilotes de mesure, gardés pour les témoins de l'étape 9. */
const PILOTES_IMAGES = new Map<string, { capture: string; contenu: ContenuPreuve; titre: string }>();

for (const url of URLS_GABARIT_02.filter((u) => !EXCLUES.includes(u))) {
  const slug = url.replace(/^\/preuves\/|\/$/g, "");
  const nom = `preuves-${slug}`;
  const capture = litCapture(slug);
  const captureTexte = texteLisible(capture);
  const page = JSON.parse(
    readFileSync(join(DOSSIER, `${nom}.json`), "utf8"),
  ) as PageRelais;

  assert.equal(page.contenu.gabarit, "etude-de-cas", `${nom} : discriminant`);
  PAGES_RELAIS.set(url, { capture, page });

  const contenu = avecImagesMesurees(url, page.contenu);
  const html = renderToStaticMarkup(
    <PagePreuve
      titre={page.titre_h1}
      contenu={contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
    />,
  );
  const htmlTexte = texteLisible(html);

  const reformule = H1_REFORMULES[url];
  if (reformule) {
    const releve = JSON.parse(
      readFileSync(join(RACINE, "maquette", "rendu", `preuves--${slug}.json`), "utf8"),
    ) as { h1Rendu: string };
    assert.equal(
      releve.h1Rendu,
      reformule.maquette,
      `${nom} : la capture ne porte plus le H1 « ${reformule.maquette} » : cette reformulation n'a plus d'objet`,
    );
    assert.ok(
      captureTexte.includes(normaliseTexte(reformule.appui)),
      `${nom} : la capture ne porte plus « ${reformule.appui} » : la reformulation n'a plus d'appui`,
    );
    assert.equal(page.titre_h1, reformule.rendu, `${nom} : le relais doit porter le H1 reformulé`);
    const h1Rendu = texteLisible(html.match(/<h1[\s>][\s\S]*?<\/h1>/)?.[0] ?? "").trim();
    assert.equal(h1Rendu, normaliseTexte(reformule.rendu), `${nom} : le H1 rendu n'est pas la reformulation`);
    assert.ok(
      !htmlTexte.includes(normaliseTexte(reformule.maquette)),
      `${nom} : formulation corrigée toujours rendue : « ${reformule.maquette} »`,
    );
  }

  controleChapo(nom, capture, page.contenu);

  const chaines = chainesDe(page.contenu).concat(reformule ? [] : [page.titre_h1]);
  for (const chaine of chaines) {
    const attendu = normaliseTexte(chaine);
    assert.ok(
      captureTexte.includes(attendu),
      `${nom} : la capture ne porte pas la copie « ${chaine} » : donnée inventée ou retapée`,
    );
    assert.ok(
      htmlTexte.includes(attendu),
      `${nom} : le rendu ne porte pas la copie « ${chaine} »`,
    );
  }

  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(html), `${nom} : un href="#" est rendu`);
  const imagesRendues = controleImages(nom, capture, contenu, html);
  if (IMAGES_MESUREES[url]) {
    // Un pilote mesuré remplit TOUS les emplacements de sa capture : une
    // mesure incomplète laisserait un cadre gris que la porte ne verrait pas.
    const attendus = emplacements(zoneCapture(capture), contenu.client, nom);
    assert.equal(imagesRendues, attendus.size, `${nom} : pilote mesuré, ${imagesRendues}/${attendus.size} emplacements rendus`);
    PILOTES_IMAGES.set(url, { capture, contenu, titre: page.titre_h1 });
  }
  verifieInterdits(html, nom);
  controleGrillesEtEnvoi(nom, capture, html);
  controleBento(nom, capture, html);
  RENDUS.set(url, html);

  const casCapture = casLies(capture, url);
  compareCas(nom, casCapture, casLies(html, url), "du rendu du relais");
  CAS_DE_LA_CAPTURE.set(url, casCapture);
}

/* -------------------- le contrôle du chapô SAIT ÉCHOUER : le paragraphe
   entier retiré (l'ancienne purge), ou la phrase interdite gardée, tombent. */
{
  const { capture, page } = PAGES_RELAIS.get("/preuves/bamesa/") as { capture: string; page: PageRelais };
  assert.equal(page.contenu.chapeau?.length, 1, "le témoin du chapô veut Bamesa");
  /* LA PHRASE INTERDITE EST FABRIQUÉE, PLUS EMPRUNTÉE AU CONTENU, et c'est une
     correction du 09/10 au soir. Ce témoin prenait `parasDuHeros(capture)` en
     comptant sur le fait qu'une phrase y soit proscrite : Bamesa et Valeo
     étaient les deux SEULES pages des 41 dans ce cas, à cause du mot
     « notamment ». Le mot retiré pour remettre le titre de Bamesa à sa
     hauteur, le témoin n'avait plus rien à faire échouer et le contrôle du
     chapô ne prouvait plus rien. Un témoin qui dépend du contenu s'éteint
     quand le contenu se corrige.

     ELLE EST ASSEMBLÉE ET NON ÉCRITE EN TOUTES LETTRES : `verifie-interdits.mjs`
     lit la SOURCE de ce fichier, et une formulation proscrite écrite ici l'y
     ferait tomber. Même piège que celui payé sur « notamment » le jour même. */
  const phraseProscrite = `Une prestation ${["clé", "en", "main"].join(" ")}.`;
  for (const [defaut, chapeau] of [
    ["un paragraphe retiré pour une phrase", []],
    [
      "le paragraphe gardé avec sa phrase interdite",
      parasDuHeros(capture).map((paragraphe) => `${paragraphe} ${phraseProscrite}`),
    ],
  ] as const) {
    assert.throws(
      () => controleChapo("témoin", capture, { ...page.contenu, chapeau: [...chapeau] }),
      `le contrôle du chapô laisse passer ${defaut}`,
    );
  }
}

/* -------------------- le contrôle du bento SAIT ÉCHOUER : Valeo rendu avec sa
   dernière carte sur une colonne (l'ancien rendu) doit tomber. */
{
  const { capture } = PAGES_RELAIS.get("/preuves/valeo-usines/") as { capture: string };
  const rendu = RENDUS.get("/preuves/valeo-usines/") as string;
  assert.ok(rendu.includes("grid-column:span 3"), "le témoin du bento veut la carte de Valeo sur trois colonnes");
  assert.throws(
    () => controleBento("témoin", capture, rendu.replace("grid-column:span 3", "grid-column:span 1")),
    "le contrôle du bento laisse passer une carte sur une colonne quand la capture en pose trois",
  );
}

/* -------------------- le contrôle des cas liés SAIT ÉCHOUER.

   Une carte de cas retirée exprès de la donnée, puis deux cartes permutées :
   chaque fois, la comparaison doit tomber. Sans cette preuve, un `casLies` qui
   ne lirait rien comparerait deux listes vides et passerait. */

const totalCas = [...CAS_DE_LA_CAPTURE.values()].reduce((n, l) => n + l.length, 0);
assert.ok(totalCas > 0, "aucune carte de cas lue dans les captures : lecture des liens cassée");
{
  const url = "/preuves/suez-remise-en-etat/";
  const page = JSON.parse(
    readFileSync(join(DOSSIER, "preuves-suez-remise-en-etat.json"), "utf8"),
  ) as PageRelais;
  const cartes = page.contenu.plusLoin ?? [];
  const rangCas = cartes.findIndex((c) => /^\/preuves\/[^/]+\/$/.test(c.href));
  const casSeuls = cartes.filter((c) => /^\/preuves\/[^/]+\/$/.test(c.href));
  assert.ok(casSeuls.length >= 2, "le témoin d'échec veut une page à deux cas liés au moins");
  const variantes = {
    "une carte de cas retirée": cartes.filter((_, rang) => rang !== rangCas),
    "deux cartes de cas permutées": cartes.map((c) =>
      c === casSeuls[0] ? casSeuls[1] : c === casSeuls[1] ? casSeuls[0] : c,
    ),
  };
  for (const [defaut, plusLoin] of Object.entries(variantes)) {
    const html = renderToStaticMarkup(
      <PagePreuve
        titre={page.titre_h1}
        contenu={{ ...page.contenu, plusLoin }}
        formulaire="temoin"
      />,
    );
    assert.throws(
      () => compareCas("témoin", CAS_DE_LA_CAPTURE.get(url) ?? [], casLies(html, url), "du témoin"),
      `le contrôle des cas liés laisse passer ${defaut}`,
    );
  }
}

/* -------------------- le contrôle des grilles SAIT ÉCHOUER : AKTID (5 étapes,
   2 résultats) rendue contre la capture d'ERIKS (6 étapes à 14 px, 3 résultats,
   autre libellé) doit tomber. */
{
  const aktid = (PAGES_RELAIS.get("/preuves/aktid-centre-logistique/") as { page: PageRelais }).page;
  const eriks = PAGES_RELAIS.get("/preuves/eriks/") as { capture: string };
  const rendu = renderToStaticMarkup(
    <PagePreuve titre={aktid.titre_h1} contenu={aktid.contenu} formulaire="temoin" />,
  );
  assert.throws(
    () => controleGrillesEtEnvoi("témoin", eriks.capture, rendu),
    "le contrôle des grilles laisse passer les grilles et le libellé d'une autre page",
  );
}

/* -------------------- le contrôle des images SAIT ÉCHOUER.

   Sur un pilote mesuré, quatre défauts posés exprès, chacun doit faire tomber
   `controleImages` : sans cette preuve, un lecteur d'emplacements qui ne
   trouverait rien comparerait deux listes vides et passerait. */

assert.deepEqual(
  [...PILOTES_IMAGES.keys()].sort(),
  Object.keys(IMAGES_MESUREES).sort(),
  "les quatre pilotes de mesure n'ont pas tous été rendus avec leurs images",
);
const IMAGE_ETRANGERE = (() => {
  const nom = readdirSync(join(RACINE, "public", "assets", "web")).find(
    (n) => /\.(jpe?g|png)$/.test(n) && !photoAdmise(`/assets/web/${n}`),
  );
  assert.ok(nom, "aucune photo du dépôt hors de la maquette et hors répartition : le témoin n'a pas de sujet");
  return `/assets/web/${nom}`;
})();
/** Un chemin qui RESSEMBLE à une photo sous licence sans en être une : la
 *  répartition est un registre fermé, pas un dossier ouvert. */
const FAUSSE_SOUS_LICENCE = "/assets/photos/cette-photo-n-est-pas-au-registre.jpg";
assert.ok(
  !existsSync(join(RACINE, "public", FAUSSE_SOUS_LICENCE)),
  `${FAUSSE_SOUS_LICENCE} existe : choisir un autre témoin`,
);
{
  const url = "/preuves/jtekt/";
  const { capture, contenu, titre } = PILOTES_IMAGES.get(url) as {
    capture: string;
    contenu: ContenuPreuve;
    titre: string;
  };
  const rends = (c: ContenuPreuve) =>
    renderToStaticMarkup(<PagePreuve titre={titre} contenu={c} formulaire="temoin" />);
  const sansPhotoHero: ContenuPreuve = { ...contenu, photoHero: undefined };
  const fausse: ContenuPreuve = { ...contenu, photoHero: FAUSSE_SOUS_LICENCE };
  const temoins: [defaut: string, donnee: ContenuPreuve, rendu: string][] = [
    ["une photo portée mais pas rendue", contenu, rends(sansPhotoHero)],
    ["une photo aux octets étrangers à la maquette", { ...contenu, photoHero: IMAGE_ETRANGERE }, rends({ ...contenu, photoHero: IMAGE_ETRANGERE })],
    /* 09/10 : la règle accepte désormais le registre des photos sous licence.
       Ce témoin prouve qu'elle n'accepte pas le DOSSIER : un chemin en
       `/assets/photos/` absent du registre tombe comme avant. */
    ["un chemin /assets/photos/ absent du registre", fausse, rends(fausse)],
    ["un logo inversé à tort", { ...contenu, logoInverse: true }, rends({ ...contenu, logoInverse: true })],
    ["une image rendue que la donnée ne porte pas", sansPhotoHero, rends(contenu)],
  ];
  for (const [defaut, donnee, rendu] of temoins) {
    assert.throws(
      () => controleImages("témoin", capture, donnee, rendu),
      `le contrôle des images laisse passer ${defaut}`,
    );
  }
  /* L'ENVERS DU TÉMOIN : une photo DU REGISTRE doit passer. Sans cette preuve,
     une porte qui refuserait tout aurait l'air d'une porte qui sait échouer. */
  const souslicence = cheminRegistre(REGISTRE[0].fichier);
  const admise: ContenuPreuve = { ...contenu, photoHero: souslicence };
  controleImages("témoin admis", capture, admise, rends(admise));
}

/* -------------------- 11 · les survols, relevés ÉLÉMENT PAR ÉLÉMENT dans la
   source `MigenCas` embarquée dans l'autonome. Le module CSS doit poser
   exactement ces déclarations, focus clavier compris, rien de plus. */

const SOURCE_CAS = RESSOURCES.filter((r) => r.mime === "text/html")
  .map((r) => r.octets.toString("utf8"))
  .find((t) => t.includes('data-screen-label="Étude de cas · héros"'));
assert.ok(SOURCE_CAS, "la source MigenCas est introuvable dans l'autonome");
const MODULE_CSS = readFileSync(join(RACINE, "components", "site", "preuve", "PagePreuve.module.css"), "utf8");
const echappe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SURVOLS: [classe: string, element: string, styleHover: string, declarations: string[]][] = [
  /* `color: var(--sur-acc)` ET NON `#fff`, et c'est un ÉCART DÉCLARÉ à la
     maquette, décidé par Mehdi le 09/10 au soir. Le blanc sur l'orange de
     marque donne 2,56:1, là où le critère 1.4.3 de la WCAG 2.2 niveau AA en
     exige 4,5. L'orange ne bouge pas, c'est l'encre posée dessus qui change :
     6,72:1. `--sur-acc` est volontairement identique dans les deux thèmes,
     parce qu'une surface qui ne bascule pas ne peut pas porter une encre qui
     bascule, piège mesuré le même soir. La maquette garde son blanc : cette
     porte compare donc au site corrigé, pas à la capture, sur CE point et sur
     lui seul. */
  ["boutonPrincipal", '<a href="#cas-form"', "filter:brightness(.93);color:#fff", ["filter: brightness(0.93)", "color: var(--sur-acc)"]],
  ["boutonSecondaire", '<a href="tel:+33478337205"', "background:#fff", ["background: #fff"]],
  ["cartePlusLoin", '<a href="{{ rl.url }}"', "transform:translateY(-3px)", ["transform: translateY(-3px)"]],
];
for (const [classe, element, survol, attendues] of SURVOLS) {
  assert.ok(
    new RegExp(`${echappe(element)}[^>]*style-hover="${echappe(survol)}"`).test(SOURCE_CAS),
    `la source MigenCas ne porte plus le survol « ${survol} » sur ${element}`,
  );
  const regle = new RegExp(`\\.${classe}:hover,\\s*\\.${classe}:focus-visible\\s*\\{([^}]*)\\}`).exec(MODULE_CSS);
  assert.ok(regle, `le module CSS ne déclare pas le survol et le focus de .${classe}`);
  const posees = regle[1].split(";").map((d) => d.trim()).filter(Boolean);
  assert.deepEqual(posees.sort(), [...attendues].sort(), `.${classe} : survol différent du style-hover « ${survol} »`);
}

/* -------------------- les cas liés de la page SERVIE, porte BLOQUANTE.

   Le rendu du relais ne suffit pas : mesuré le 08/10, il passait sur les 41
   pages pendant que 28 d'entre elles étaient servies SANS AUCUN cas lié. Ces 28
   pages existent en base avec `gabarit: "fiche"`, et `lib/contenu.ts` ne
   substitue le relais disque qu'à une page dont la base ne porte AUCUN
   gabarit : la route les rend donc par `PageFiche`, jamais par `PagePreuve`.
   Seule la page servie dit ce que le lecteur voit. PRÉALABLE : le site sur
   http://localhost:4340/ (`SITE_URL` pour un autre). */

const SITE = (process.env.SITE_URL ?? "http://localhost:4340").replace(/\/$/, "");

/** Une page du site, telle qu'un lecteur la reçoit. */
async function servie(url: string): Promise<{ statut: number; html: string }> {
  try {
    const reponse = await fetch(`${SITE}${url}`);
    return { statut: reponse.status, html: await reponse.text() };
  } catch (erreur) {
    throw new Error(
      `${SITE}${url} injoignable (${(erreur as Error).message}) : le site doit tourner pour ce contrôle`,
    );
  }
}

/**
 * Étape 10 : la page SERVIE sort par PagePreuve (marqueur `data-gabarit` sur
 * sa racine) et porte un seul H1, celui de la donnée. Rend la zone du gabarit,
 * du marqueur à la fin du `<main>`, pour le contrôle des images.
 */
function controleServie(url: string, html: string, titre: string): string {
  const debut = html.search(/<div\b[^>]*\sdata-gabarit="etude-de-cas"/);
  assert.ok(
    debut >= 0,
    `${url} : servie par un AUTRE gabarit que PagePreuve (aucune racine data-gabarit="etude-de-cas")`,
  );
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => texteLisible(m[1]).trim());
  assert.deepEqual(h1, [normaliseTexte(titre)], `${url} : H1 servis ${JSON.stringify(h1)}, la donnée porte « ${titre} »`);
  const fin = html.indexOf("</main>", debut);
  return html.slice(debut, fin < 0 ? undefined : fin);
}

const ecartsServis: string[] = [];
let imagesServies = 0;
for (const [url, casCapture] of CAS_DE_LA_CAPTURE) {
  const { statut, html } = await servie(url);
  const { capture, page } = PAGES_RELAIS.get(url) as { capture: string; page: PageRelais };
  try {
    assert.equal(statut, 200, `${url} : réponse ${statut}`);
    const zone = controleServie(url, html, page.titre_h1);
    compareCas(url, casCapture, casLies(html, url), "de la page servie");
    imagesServies += controleImages(`${url} servie`, capture, page.contenu, zone);
  } catch (erreur) {
    ecartsServis.push((erreur as Error).message);
  }
}
assert.equal(
  ecartsServis.length,
  0,
  `${ecartsServis.length}/${CAS_DE_LA_CAPTURE.size} pages servies en écart (gabarit, H1, cas liés ou images) :\n\n` +
    ecartsServis.join("\n\n"),
);

/* -------------------- le contrôle de la page servie SAIT ÉCHOUER : une page
   réelle d'un autre gabarit, puis une étude de cas servie contre le H1 d'une
   autre, doivent le faire tomber. */
{
  const autre = await servie("/offres/residence/");
  assert.equal(autre.statut, 200, "le témoin d'un autre gabarit veut /offres/residence/ servie");
  const jtekt = (PAGES_RELAIS.get("/preuves/jtekt/") as { page: PageRelais }).page;
  const bamesa = (PAGES_RELAIS.get("/preuves/bamesa/") as { page: PageRelais }).page;
  assert.throws(
    () => controleServie("/preuves/jtekt/", autre.html, jtekt.titre_h1),
    "le contrôle de la page servie laisse passer une page rendue par un autre gabarit",
  );
  const jtektServie = await servie("/preuves/jtekt/");
  assert.throws(
    () => controleServie("/preuves/jtekt/", jtektServie.html, bamesa.titre_h1),
    "le contrôle de la page servie laisse passer un H1 qui n'est pas celui de la donnée",
  );
}

console.log("gabarit étude de cas : toutes les vérifications passent.");
console.log(
  `  cas liés : ${totalCas} cartes sur ${CAS_DE_LA_CAPTURE.size} pages, mêmes URL, même ordre, même texte ` +
    `que la capture, dans le rendu du relais ET sur ${SITE} ; carte retirée et cartes permutées font tomber le contrôle.`,
);
console.log(
  `  page servie : ${CAS_DE_LA_CAPTURE.size}/${CAS_DE_LA_CAPTURE.size} sortent par PagePreuve (data-gabarit) avec le H1 ` +
    `de leur donnée ; une page d'un autre gabarit et un H1 étranger font tomber le contrôle.`,
);
console.log(
  `  images : ${PILOTES_IMAGES.size} pilotes mesurés (${[...PILOTES_IMAGES.keys()].join(", ")}) rendus à tous les ` +
    `emplacements de leur capture ; ${imagesServies} image(s) sur les pages servies, chacune de la maquette ou de la ` +
    `répartition du 09/10 ; photo portée non rendue, octets étrangers, chemin /assets/photos/ hors registre, ` +
    `logo inversé à tort et image non portée font tomber le contrôle, et une photo du registre passe.`,
);
console.log(`  survols : ${SURVOLS.length} relevés élément par élément dans MigenCas, posés à l'identique avec le focus.`);
console.log(
  `  chapô et bento : chapô de la capture moins ses seules phrases interdites, largeurs des cartes de la capture, sur ${PAGES_RELAIS.size} pages ; ` +
    `paragraphe entier retiré, phrase interdite gardée et carte rétrécie font tomber le contrôle.`,
);
console.log(
  `  2 pages pilotes rendues contre leurs captures section par section, ` +
    `${INTERDITS.length} interdits vérifiés absents.`,
);
console.log(
  `  gabarit 02 : ${URLS_GABARIT_02.length - EXCLUES.length}/${URLS_GABARIT_02.length} pages de l'index ` +
    `portées et rendues contre leur capture, ${EXCLUES.length} exclue(s) déclarée(s), ` +
    `${Object.keys(H1_REFORMULES).length} H1 reformulé(s) vérifié(s) des deux côtés ` +
    `(${Object.keys(H1_REFORMULES).join(", ")}).`,
);
