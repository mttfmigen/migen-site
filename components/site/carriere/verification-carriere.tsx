/**
 * Contrôle du hub `/carriere/` (gabarit 10, servi par `MigenCarriere.dc.html`),
 * sans navigateur.
 *
 *   bun components/site/carriere/verification-carriere.tsx
 *
 * LA RÉFÉRENCE : la capture `maquette/rendu/carriere.html` (le rendu de la
 * maquette autonome, CLAUDE.md §16), et la source de la page que l'autonome
 * embarque (`maquette/site-final-autonome.html`, relue et décodée ici) pour ce
 * que la capture ne garde pas : survols `style-hover` et octets des photos.
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *  0. IL SAIT ÉCHOUER, prouvé à chaque exécution avant les vraies vérifications.
 *  1. MOT POUR MOT : chaque chaîne de `donnees-hub.ts` se retrouve dans la
 *     capture, et le rendu porte tout le texte de chaque section.
 *  2. L'ORDRE : les titres de section du rendu sont ceux de la capture, dans
 *     le même ordre, et les liens de la capture sont tous rendus.
 *  3. LE DESSIN : des valeurs propres à chaque écran, lues dans la capture,
 *     sont dans le rendu.
 *  4. LES SURVOLS : chaque `style-hover` repris est dans la source de la page,
 *     et le module CSS le déclare, focus clavier compris.
 *  5. LES PHOTOS : chaque fichier existe, et il vient DE LA MAQUETTE OU DE LA
 *     RÉPARTITION (écart du 09/10, déclaré plus bas) : octets d'une image de la
 *     maquette, nom que la source lui donne, photo de ville sous licence, ou
 *     entrée du registre des 109 photos sous licence. Deux témoins prouvent
 *     qu'une photo venue d'ailleurs tombe encore.
 *  6. LES INTERDITS du contrat et des règles client sont absents du rendu.
 *     Les décisions de copie (« 10 % des techniciens », siège à Limonest depuis
 *     le 09/10, qui renverse le 07/10) sont
 *     appliquées à la capture avant toute comparaison.
 *  7. UN SEUL H1, aucun `href="#"`.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { REGISTRE, cheminRegistre, deLaRepartition } from "@/scripts/photos-autorisees";

import { HUB_CARRIERE, type ContenuHubCarriere } from "./donnees-hub";
import PageHubCarriere from "./PageHubCarriere";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const CAPTURE_ENTIERE = readFileSync(join(RACINE, "maquette", "rendu", "carriere.html"), "utf8");
/** La capture est celle du `<body>` : en-tête et pied en sont retirés, seule
 *  la page (de la première à la dernière section) sert de référence. Les
 *  décisions de copie (lib/decisions-copie.ts) y sont appliquées : la donnée
 *  les porte déjà, la capture non. */
const CAPTURE = appliqueDecisions(
  CAPTURE_ENTIERE.slice(
    CAPTURE_ENTIERE.indexOf("<section"),
    CAPTURE_ENTIERE.lastIndexOf("</section>") + "</section>".length,
  ),
);
const MODULE_CSS = readFileSync(new URL("./HubCarriere.module.css", import.meta.url), "utf8");

/* --------------------------------------------------------- normalisations */

/** Espace simple, apostrophe droite, pas d'espace avant point ou virgule. */
function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&#x27;|&#39;|’/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .replace(/ ([.,])/g, "$1");
}

/** Le texte lisible d'un HTML, balises retirées. */
function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/** Un texte de donnée, liens Markdown ramenés à leur libellé, gras retiré. */
function sansMarkdown(texte: string): string {
  return normaliseTexte(texte.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, ""));
}

/** La capture sérialise le DOM (`minmax(0px, 1fr)`, `0.92`), React compacte. */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

const CAPTURE_TEXTE = texteLisible(CAPTURE);
const CAPTURE_STYLE = normaliseStyle(CAPTURE);

/* ------------------------------------------------------------ assertions */

function dansCapture(texte: string, quoi: string): void {
  assert.ok(
    CAPTURE_TEXTE.includes(sansMarkdown(texte)),
    `${quoi} : « ${texte.slice(0, 80)} » ne se retrouve pas dans la capture`,
  );
}

function dansRendu(rendu: string, texte: string, quoi: string): void {
  assert.ok(
    texteLisible(rendu).includes(sansMarkdown(texte)),
    `${quoi} : « ${texte.slice(0, 80)} » manque au rendu`,
  );
}

function dessin(rendu: string, fragment: string): void {
  const attendu = normaliseStyle(fragment);
  assert.ok(CAPTURE_STYLE.includes(attendu), `la capture ne porte pas le dessin « ${fragment} »`);
  assert.ok(normaliseStyle(rendu).includes(attendu), `le rendu ne porte pas le dessin « ${fragment} »`);
}

const INTERDITS = [
  "—",
  "24h",
  "24 h",
  "24/24",
  "7j/7",
  "7/7",
  "régie",
  "intérim",
  "mise à disposition",
  "sur mesure",
  "sans engagement",
  "notamment",
  "levier",
  "clé en main",
  "concrètement",
  "incontournable",
  "découvrez",
  "réguliers",
  "teamtailor",
  "cinq agences",
  "5 agences",
] as const;

function verifieInterdits(html: string, nom: string): void {
  const visible = texteLisible(html).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(!visible.includes(mot), `${nom} : formulation interdite dans le rendu, « ${mot} »`);
  }
}

/* ------------------------------- toutes les chaînes d'une donnée de page */

function chaines(contenu: ContenuHubCarriere): { texte: string; quoi: string }[] {
  const out: { texte: string; quoi: string }[] = [];
  const ajoute = (texte: string | undefined, quoi: string) => {
    if (texte) out.push({ texte, quoi });
  };
  const { heros } = contenu;
  ajoute(contenu.titre, "h1");
  ajoute(heros.pastille, "pastille");
  ajoute(heros.chapeau, "chapeau");
  heros.paragraphes?.forEach((p) => ajoute(p, "paragraphe du héros"));
  ajoute(heros.chiffre?.valeur, "chiffre du héros");
  ajoute(heros.chiffre?.texte, "chiffre du héros");
  for (const s of contenu.sections) {
    const quoi = "titre" in s ? s.titre : s.type;
    if ("surtitre" in s) ajoute(s.surtitre, `${quoi} · surtitre`);
    if ("titre" in s) ajoute(s.titre, `${quoi} · titre`);
    if ("intros" in s) s.intros?.forEach((t) => ajoute(t, `${quoi} · intro`));
    if ("intro" in s) ajoute(s.intro, `${quoi} · intro`);
    if ("bande" in s) ajoute(s.bande?.texte, `${quoi} · bande`);
    switch (s.type) {
      case "chiffres":
        s.items.forEach((c) => (ajoute(c.valeur, "chiffre"), ajoute(c.texte, "chiffre")));
        break;
      case "bento":
      case "duo":
      case "liste":
        s.cartes.forEach((c) => (ajoute(c.titre, quoi), ajoute(c.texte, quoi)));
        break;
      case "etapes":
        s.etapes.forEach((c) => (ajoute(c.titre, quoi), ajoute(c.texte, quoi)));
        break;
      case "refus":
        s.refus.forEach((c) => (ajoute(c.titre, quoi), ajoute(c.texte, quoi)));
        break;
      case "encart":
        s.textes.forEach((t) => ajoute(t, quoi));
        break;
      case "metiers":
        s.metiers.forEach((m) => (ajoute(m.titre, quoi), ajoute(m.texte, quoi)));
        s.suite?.forEach((t) => ajoute(t, quoi));
        break;
      case "hubs":
        s.hubs.forEach((h) => (ajoute(h.nom, quoi), ajoute(h.zone, quoi)));
        break;
      case "avis":
        s.avis.forEach((a) => (ajoute(a.texte, quoi), ajoute(a.libelle, quoi)));
        ajoute(s.fin, quoi);
        break;
      case "faq":
        s.questions.forEach((q) => (ajoute(q.question, quoi), ajoute(q.reponse, quoi)));
        break;
      case "liens":
        s.items.forEach((l) => ajoute(l.libelle, "pour aller plus loin"));
        break;
      default:
        break;
    }
  }
  return out;
}

/* ----------------- 0. le contrôle sait échouer, et il le prouve d'abord */

assert.throws(
  () => dansCapture("cette phrase n'existe dans aucune capture", "preuve"),
  /ne se retrouve pas/,
  "dansCapture a accepté une copie absente",
);
assert.throws(
  () => dessin("<div></div>", "grid-template-columns: 999fr 666fr"),
  /ne porte pas le dessin/,
  "dessin a accepté une valeur absente",
);
assert.throws(
  () => verifieInterdits("<p>un tiret — cadratin</p>", "preuve"),
  /interdite/,
  "verifieInterdits a laissé passer un tiret cadratin",
);
{
  // Une donnée faussée d'un seul mot doit faire échouer le mot pour mot.
  const faussee: ContenuHubCarriere = {
    ...HUB_CARRIERE,
    heros: { ...HUB_CARRIERE.heros, chapeau: `${HUB_CARRIERE.heros.chapeau} Inventé.` },
  };
  assert.throws(
    () => chaines(faussee).forEach((c) => dansCapture(c.texte, c.quoi)),
    /ne se retrouve pas/,
    "une donnée faussée est passée : le mot pour mot ne contrôle rien",
  );
}
console.log("0 · le contrôle sait échouer : copie absente, dessin absent, tiret cadratin et donnée faussée refusés.");

/* --------------------------------------------- la page, telle que servie */

// `next.config.ts` pose `trailingSlash: true` ; hors de Next, `Link` ne le
// sait que par cette variable, qu'il lit au rendu. Sans elle, il retirerait
// le slash final et le rendu contrôlé ne serait pas celui servi.
process.env.__NEXT_TRAILING_SLASH = "true";
const RENDU = renderToStaticMarkup(<PageHubCarriere contenu={HUB_CARRIERE} />);

/* ------------------------------------------------------- 1. mot pour mot */

const toutes = chaines(HUB_CARRIERE);
for (const { texte, quoi } of toutes) {
  dansCapture(texte, quoi);
  dansRendu(RENDU, texte, quoi);
}
// Les textes alternatifs sont des attributs, pas du texte lisible.
const altsDe = (html: string) => new Set([...html.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)].map((m) => m[1]));
const altsRendu = altsDe(RENDU);
for (const alt of altsDe(CAPTURE)) {
  assert.ok(altsRendu.has(alt), `texte alternatif de la capture absent du rendu : « ${alt} »`);
}
console.log(`1 · mot pour mot : ${toutes.length} chaînes de la donnée retrouvées dans la capture et dans le rendu.`);

/* --------------------------------------------------- 2. ordre et liens */

const titresDe = (html: string) =>
  [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => texteLisible(m[1]).trim());
assert.deepEqual(titresDe(RENDU), titresDe(CAPTURE), "les titres de section ne suivent pas la capture");

const liensDe = (html: string) =>
  new Set([...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]));
const liensRendu = liensDe(RENDU);
for (const href of liensDe(CAPTURE)) {
  assert.ok(liensRendu.has(href), `lien de la capture absent du rendu : ${href}`);
}
console.log(`2 · ordre : ${titresDe(CAPTURE).length} titres dans l'ordre de la capture ; ${liensDe(CAPTURE).size} cibles de lien rendues.`);

/* ---------------------------------------------------------- 3. le dessin */

const DESSINS = [
  // héros et chiffre flottant
  "grid-template-columns: 1.08fr 0.92fr",
  "font: 600 calc(clamp(38px,4.6vw,64px) * var(--ts))/1.03 var(--ft)",
  "font: 600 40px/1 var(--ft)",
  // étapes à cinq
  "grid-template-columns: repeat(6, minmax(0px, 1fr))",
  "grid-column: span 3",
  // rail des métiers
  "scroll-snap-type: x mandatory",
  // (la marge du rail, `max(40px,calc((100vw - 1120px) / 2))`, est sérialisée
  // simplifiée par le navigateur, `max(40px, -560px + 50vw)` : non comparable)
  "width: 280px",
  "font: 600 21px/1.2 var(--ft)",
  "font: 600 24px/1.15 var(--ft)",
  // bandeau 10 %
  "font: 600 44px/1 var(--ft)",
  // refus
  "border-radius: 40px",
  "gap: 26px 40px",
  "font: 600 15px/34px var(--fb)",
  // hubs
  "height: 300px",
  "background: linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.1) 65%)",
  "font: 600 24px/1.1 var(--ft)",
  // avis
  "grid-template-columns: 1.05fr 0.95fr",
  "font: 600 52px/.7 var(--ft)",
  "grid-template-columns: 1.2fr 0.8fr",
  // pour aller plus loin
  "height: 140px",
];
for (const d of DESSINS) dessin(RENDU, d);
assert.ok(CAPTURE.includes("mg-faqph"), "la capture ne porte plus `.mg-faqph` : le panneau-photo de la FAQ est à revoir");
assert.ok(RENDU.includes("faq-offre.jpg"), "le panneau-photo de la FAQ n'a pas sa photo");
console.log(`3 · dessin : ${DESSINS.length} valeurs de la capture retrouvées dans le rendu, panneau-photo de la FAQ compris.`);

/* ---------------- la source de la page et ses images, dans l'autonome */

interface Ressource {
  mime: string;
  compressed?: boolean;
  data: string;
}

function ressources(): Ressource[] {
  const lignes = readFileSync(join(RACINE, "maquette", "site-final-autonome.html"), "utf8").split("\n");
  const ligne = lignes.find((l) => l.startsWith('{"') && l.includes('"mime"'));
  assert.ok(ligne, "l'autonome ne porte plus sa table de ressources");
  const json = ligne.slice(0, ligne.lastIndexOf("}") + 1);
  return Object.values(JSON.parse(json) as Record<string, Ressource>);
}

function octets(r: Ressource): Buffer {
  const brut = Buffer.from(r.data, "base64");
  return r.compressed ? gunzipSync(brut) : brut;
}

const RESSOURCES = ressources();
const SOURCE = RESSOURCES.filter((r) => r.mime === "text/html")
  .map((r) => octets(r).toString("utf8"))
  .find((t) => t.includes('data-screen-label="Carrière · héros"'));
assert.ok(SOURCE, "la source de MigenCarriere est introuvable dans l'autonome");
const EMPREINTES = new Set(
  RESSOURCES.filter((r) => r.mime.startsWith("image/")).map((r) =>
    createHash("sha256").update(octets(r)).digest("hex"),
  ),
);

/* --------------------------------------------------------- 4. survols */

const SURVOLS: [classe: string, styleHover: string, declarations: string[]][] = [
  ["boutonOrange", "filter:brightness(.93);color:#fff", ["filter: brightness(0.93)", "color: #fff"]],
  ["boutonTelephone", "background:#fff", ["background: #fff"]],
  ["carteHub", "transform:translateY(-4px);color:#fff", ["transform: translateY(-4px)"]],
  ["carteLien", "transform:translateY(-3px)", ["transform: translateY(-3px)"]],
  [
    "boutonQuestion",
    "filter:brightness(.93);transform:translateY(-1px);color:#fff",
    ["filter: brightness(0.93)", "transform: translateY(-1px)"],
  ],
  ["texteLie a", "color:var(--acc)", ["color: var(--acc)"]],
];
for (const [classe, survol, declarations] of SURVOLS) {
  assert.ok(SOURCE.includes(`style-hover="${survol}"`), `la source ne porte pas le survol « ${survol} »`);
  const regle = new RegExp(
    `\\.${classe}:hover,\\s*\\.${classe}:focus-visible\\s*\\{([^}]*)\\}`,
  ).exec(MODULE_CSS);
  assert.ok(regle, `le module CSS ne déclare pas le survol et le focus de .${classe}`);
  for (const d of declarations) {
    assert.ok(regle[1].includes(d), `.${classe} : survol sans « ${d} »`);
  }
}
console.log(`4 · survols : ${SURVOLS.length} relevés dans la source de la page, tous déclarés avec le focus clavier.`);

/* ----------------------------------------------------------- 5. photos */

/** Même photo en plus grand dans le dépôt, nommée ainsi par la source. */
const NOMMEES_PAR_LA_SOURCE = new Set(["sv-armoire.jpg", "sv-convoyeur.jpg"]);

/* LES PHOTOS DE VILLE SOUS LICENCE, écart déclaré du 09/10, demandé par Mehdi.
   La maquette met une photo d'ATELIER dans les sept cartes de hub ; le site y
   met désormais la photo de la VILLE, celle de `public/assets/villes/`, la même
   que sur les cartes de l'accueil. Leurs octets ne viennent donc pas de la
   maquette, et c'est exact : ce contrôle doit continuer de refuser toute AUTRE
   photo inconnue d'elle, mais pas celles-là. La raison de l'écart est écrite en
   tête de `components/site/carriere/donnees-hub.ts`.
   La liste est close : seules les sept villes dont la licence a été prise y
   figurent, donc une huitième photo glissée dans ce bloc échouerait. */
const VILLES_SOUS_LICENCE = new Set([
  "hub-lyon.jpg",
  "hub-paris.jpg",
  "hub-lille.jpg",
  "hub-marseille.jpg",
  "hub-strasbourg.jpg",
  "hub-nantes.jpg",
  "hub-toulouse.jpg",
]);

/* ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
   Ce contrôle exigeait les OCTETS de la maquette pour toute photo du hub. La
   règle est devenue fausse : les 109 photos achetées sous licence le 08/10
   (`public/assets/photos/registre.json`) ne viennent d'aucune capture, donc
   elle les refusait toutes, et le site servait `team-duo.jpg` 133 fois
   (mesuré par `node scripts/mesure-photos-site.mjs`). On ajoute UNE source,
   fermée : la répartition du 09/10, déclarée dans
   `scripts/photos-autorisees.ts`. Rien d'autre ne passe. */
function jugePhoto(photo: string): void {
  const fichier = join(RACINE, "public", photo);
  assert.ok(existsSync(fichier), `photo absente du dépôt : ${photo}`);
  const nom = photo.split("/").pop() ?? "";
  if (NOMMEES_PAR_LA_SOURCE.has(nom)) {
    assert.ok(SOURCE!.includes(nom.replace(".jpg", "")), `${nom} n'est pas nommée par la source`);
    return;
  }
  if (VILLES_SOUS_LICENCE.has(nom)) {
    /* On ne compare pas ses octets à la maquette, mais on vérifie qu'elle est
       bien servie : un écart déclaré reste un écart mesuré. */
    assert.ok(photo.startsWith("/assets/villes/"), `${photo} : une photo de ville vit dans /assets/villes/`);
    return;
  }
  if (deLaRepartition(photo)) return;
  const empreinte = createHash("sha256").update(readFileSync(fichier)).digest("hex");
  assert.ok(
    EMPREINTES.has(empreinte),
    `${photo} : ni les octets de la maquette, ni le registre des photos sous licence : photo inventée`,
  );
}

const photos = new Set<string>([HUB_CARRIERE.heros.photo.src, "/assets/web/faq-offre.jpg"]);
for (const s of HUB_CARRIERE.sections) {
  if (s.type === "metiers") s.metiers.forEach((m) => photos.add(m.photo));
  if (s.type === "hubs") s.hubs.forEach((h) => photos.add(h.photo));
  if (s.type === "liens") s.items.forEach((l) => photos.add(l.photo));
}
for (const photo of photos) {
  jugePhoto(photo);
  assert.ok(RENDU.includes(encodeURIComponent(photo)), `${photo} n'est pas rendue`);
}

/* 5 bis · LE CONTRÔLE DES PHOTOS SAIT ÉCHOUER, et la nouvelle source ne lui a
   pas enlevé ses dents : un fichier absent, une photo du dépôt étrangère à la
   maquette, et un chemin du dossier sous licence absent du REGISTRE tombent
   tous les trois. Et l'envers de la preuve : une photo du registre passe. */
{
  /* Une photo du dépôt que la maquette ne porte pas : cherchée, pas supposée.
     Si le dépôt n'en contient plus aucune, le témoin le dit au lieu de passer. */
  const etrangere = readdirSync(join(RACINE, "public", "assets", "web"))
    .filter((n) => /\.(jpe?g|png)$/.test(n))
    .map((n) => `/assets/web/${n}`)
    .find(
      (chemin) =>
        !EMPREINTES.has(createHash("sha256").update(readFileSync(join(RACINE, "public", chemin))).digest("hex")),
    );
  assert.ok(etrangere, "aucune photo du dépôt étrangère à la maquette : le témoin n'a pas de sujet");
  for (const [defaut, chemin] of [
    ["un fichier absent du dépôt", "/assets/web/cette-photo-n-existe-pas.jpg"],
    ["une photo du dépôt étrangère à la maquette", etrangere],
    ["un chemin /assets/photos/ absent du registre", "/assets/photos/cette-photo-n-est-pas-au-registre.jpg"],
  ] as const) {
    assert.throws(() => jugePhoto(chemin), `le contrôle des photos laisse passer ${defaut}`);
  }
  jugePhoto(cheminRegistre(REGISTRE[0].fichier));
}

console.log(
  `5 · photos : ${photos.size} fichiers, octets de la maquette, nom donné par sa source ou registre des ` +
    `${REGISTRE.length} photos sous licence (écart du 09/10) ; ${VILLES_SOUS_LICENCE.size} photos de ville ` +
    `sous licence déclarées en écart ; fichier absent, photo étrangère et chemin hors registre font tomber le contrôle.`,
);

/* ------------------------------------------------------- 6. interdits */

verifieInterdits(RENDU, "hub /carriere/");
console.log("6 · interdits absents du rendu ; la phrase du siège de la FAQ est rendue telle que la décide lib/decisions-copie.ts.");

/* ---------------------------------------------------------- 7. hygiène */

assert.equal((RENDU.match(/<h1\b/g) ?? []).length, 1, "le hub doit porter un seul h1");
assert.ok(!RENDU.includes('href="#"'), 'un lien vide href="#" est rendu');
assert.ok(RENDU.includes('id="postuler"'), "l'ancre #postuler visée par les boutons manque");
console.log("7 · un seul h1, aucun lien vide, l'ancre #postuler existe.");

console.log("\nHub /carriere/ conforme à sa capture.");
