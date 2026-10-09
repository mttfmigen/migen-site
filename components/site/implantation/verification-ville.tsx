/**
 * Contrôle des gabarits « 04 Ville » et « 06 Département », sans navigateur.
 * Les 8 captures de département ont la suite d'écrans d'une ville (hub local
 * compris) : elles sont rendues par `PageVille` et jugées ici, à l'identique.
 *
 *   bun components/site/implantation/verification-ville.tsx            toutes les pages
 *   bun components/site/implantation/verification-ville.tsx lyon angers  celles dont le fichier contient ces mots
 *
 * IL PARCOURT TOUS LES FICHIERS `supabase/import/gabarits-maquette/
 * implantations-*.json` QUI DÉCLARENT `"gabarit": "ville"`, et compare chacun
 * à SA capture, `maquette/rendu/<cle>.html` (cle = URL, barres en `--`). Le
 * rendu est celui de `PageVille`, par `renderToStaticMarkup`, depuis le fichier
 * tel que la route le sert. Pour chaque page :
 *
 *  1. LA CAPTURE EXISTE, et le H1 du fichier est celui de la capture.
 *  2. MOT POUR MOT, DANS L'ORDRE : chaque texte de la capture se retrouve dans
 *     le texte rendu, dans le même ordre (donc section par section), sur texte
 *     normalisé (espaces insécables, apostrophes). Seules exceptions : les
 *     `trous` déclarés dans le fichier de la page, chacun avec sa raison.
 *  3. RIEN D'INVENTÉ : chaque texte rendu existe dans la capture. PUIS LE
 *     LITTÉRAL : chaque texte rendu s'y retrouve TEL QUEL, espaces insécables
 *     et apostrophes typographiques compris. On compare normalisé, on copie
 *     le littéral : une apostrophe redressée fait échouer.
 *  4. LES TROUS SONT VRAIS : chaque phrase déclarée existe dans la capture et
 *     manque au rendu. Un trou devenu inutile fait échouer, sinon la liste
 *     grossirait jusqu'à tout autoriser.
 *  5. LES LIENS sont ceux de la capture, et aucun `href="#"`. UN SEUL H1.
 *  6. LES PHOTOS LOCALES existent dans `public/`.
 *  7. LES INTERDITS du contrat sont absents du rendu.
 *  8. LE DESSIN des quatre écrans propres à la ville (hub local, problème en
 *     rangée, questions, maillage) : des valeurs relevées, présentes dans la
 *     capture ET dans le rendu, relues dans la capture à chaque passage.
 *  9. LES QUESTIONS SE REPLIENT : autant de `<details>` que la capture, un
 *     seul `name` partagé (accordéon exclusif natif), seul le premier ouvert.
 * 10. LA PHOTO DU HUB LOCAL suit la règle de la maquette (`cityVals` de
 *     `MigenExpertise.dc.html`) : l'URL Envato et son crédit de
 *     `photos-villes.json` quand la page y figure, sinon la photo de repli
 *     tirée d'un hachage de l'URL, sans crédit. La capture ne la montre pas
 *     (adresse `blob:`), d'où cette règle relue dans la source.
 * 11. LE DESSIN DU PROBLÈME suit la règle de la source (`pbDark`, `pbSplit`,
 *     `pbCards`) : hachage de l'URL et nombre de puces. Vérifiée sur les 66
 *     captures avant d'être écrite ici (66 sur 66). En colonne, la photo est
 *     `topicImg` : `ph-hero-raffinerie` pour toute URL `/implantations/`.
 * 12. LES PHOTOS DES RÉFÉRENCES suivent la règle de la source : les preuves
 *     du corpus d'abord (`PH(md)`, rang par rang), puis les cas liés de
 *     `cas-lies.json` (`casLiesVals`, hachage de l'URL du cas plus son rang).
 *
 * 13. LE H2 DU PROBLÈME est un trou si et seulement si la page pose
 *     `problemeSansTitre` (Vesoul, « 24 h sur 24 ») : la suite reste dans son
 *     paragraphe, elle ne monte pas dans le H2.
 *
 * Le formulaire partagé est comparé lui aussi, bouton d'envoi compris, à ses
 * deux écarts déclarés près (voir `sansEcartsFormulaire`). La seule reformulation tranchée par
 * Mehdi (Tournaire, 08/10) est appliquée à la capture avant de comparer
 * (voir `SUBSTITUTIONS`).
 *
 * IL PROUVE QU'IL SAIT ÉCHOUER : avant de juger les pages, il altère la page
 * pilote de département (`lyon-rhone`) de trois façons (l'ancien « dont plus
 * de 80 réguliers », la prise de poste chiffrée rendue, une phrase inventée à
 * la place d'un trou), et la page pilote de ville de douze façons (un mot changé, une section retirée, une phrase
 * inventée, un interdit, un faux trou, un lien inventé, une photo de
 * référence devinée, un dessin de problème deviné, une apostrophe
 * redressée, le titre Tournaire vidé, un H2 de problème retiré sans trou,
 * des questions toutes ouvertes) et exige que chacune soit vue.
 * Si une altération passe, le contrôle est déclaré aveugle et échoue.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuVille } from "@/types/implantation";

import PageVille from "./PageVille";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const RENDU = join(RACINE, "maquette", "rendu");

interface Trou {
  ligne: string;
  pourquoi: string;
}

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuVille;
  trous?: Trou[];
}

/* -------------------------------------------------------------- les textes */

function decode(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** La forme de comparaison : espaces unifiés, apostrophes droites. Le fichier, lui, garde le littéral. */
function normalise(texte: string): string {
  return texte
    .replace(/[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Le texte tel qu'écrit : seules les entités sont décodées, `&nbsp;` en U+00A0. */
function litteral(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .split(/<[^>]+>/)
    .map((t) =>
      t
        .replace(/&nbsp;|&#160;/g, "\u00a0")
        .replace(/&#x27;|&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/[ \t\n\r]+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

/** Un trou (forme normalisée) cherché dans le texte LITTÉRAL : insécables et apostrophes typographiques admises. */
function motifLitteral(trou: string): RegExp {
  const source = [...trou]
    .map((c) => (c === "'" ? "['’‘]" : c === " " ? "[ \u00a0\u202f]+" : c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("");
  return new RegExp(source, "gu");
}

/** Les nœuds de texte visibles d'un HTML, dans l'ordre, normalisés. */
function noeuds(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .split(/<[^>]+>/)
    .map((t) => normalise(decode(t)))
    .filter(Boolean);
}

function attributs(html: string, nom: string): string[] {
  return [...html.matchAll(new RegExp(`\\s${nom}="([^"]*)"`, "g"))].map((m) => decode(m[1]));
}

/** La capture sérialise `0px`, `0.9fr`, `rgba(0, 0, 0, 0.3)` ; React écrit court. */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/* ---------------------------------------------------------- les interdits */

/** Contrat de rédaction (CLAUDE.md §3 et §9, passation du client), cherché dans le texte rendu. */
const INTERDITS: readonly [RegExp, string][] = [
  [/—/u, "tiret cadratin"],
  [/\bsous\s+\d/u, "délai chiffré : seul « rappel dans l'heure » est autorisé"],
  [/\b\d+\s*à\s*\d+\s*semaines\b/u, "délai chiffré (« 2 à 3 semaines ») : seul « rappel dans l'heure » est autorisé"],
  [/\b24\s*h(?![\p{L}\d]|\s*\/)/u, "« 24h »"],
  [/\b24\s*h?\s*\/\s*(?:24|7)\b|\b24\s*h\s+sur\s+24\b/u, "« 24h/24 »"],
  [/\b7\s*j?\s*\/\s*7\b/u, "« 7j/7 »"],
  [/\btaux horaire/u, "taux horaire : aucun prix"],
  [/\btarifs?\b/iu, "tarif : aucun prix"],
  [/\d[\d\s  ]*(?:€|euros?\b)/u, "montant : aucun prix"],
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
  [/\b(?:5|cinq) agences/iu, "quatre agences, pas cinq"],
  [/\b(?:clients|80)\s+r[ée]guliers\b/iu, "« +200 clients », jamais « réguliers »"],
  /* 09/10 : « Limonest » n'est plus un interdit, c'est le SIÈGE. Décision de
     Mehdi qui renverse la sienne du 07/10, et qui revient au texte de la
     maquette. C'est l'adresse d'Écully présentée COMME LE SIÈGE qui devient
     fausse : Écully est l'agence. Le motif cherche donc les deux mots
     ensemble, et laisse passer « siège à Limonest et bureaux à Écully », qui
     est la phrase de la maquette. */
  [/si[èe]ge(?:(?!Limonest)[^.]){0,60}Écully/iu, "le siège est à Limonest ; Écully est l'agence"],
];

/* ------------------------------------------- le dessin des écrans de la ville */

/** Relevés sur la capture : chacun doit être dans la capture ET dans le rendu. */
const DESSIN_COMMUN = [
  // Héros et maillage, communs aux 66 captures.
  "grid-template-columns: 1.12fr 0.88fr",
  "grid-template-rows: repeat(2, minmax(210px, auto))",
  "font: 600 20px/1.2 var(--ft)",
  // Hub local.
  "font: 600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
  "grid-template-columns: minmax(0px, 0.9fr) minmax(0px, 1.1fr)",
  "min-height: 420px",
  "linear-gradient(to top, rgba(18, 17, 16, 0.94) 8%, rgba(18, 17, 16, 0.25) 70%)",
  "font: 600 calc(clamp(26px,2.6vw,34px) * var(--ts))/1.1 var(--ft)",
  "grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))",
  "padding: 22px 22px 20px",
];
const DESSIN_ZONES = ["padding: 18px 22px", "padding: 8px 14px"];
const DESSIN_QUESTIONS = [
  "grid-template-columns: minmax(0px, 0.8fr) minmax(0px, 1.2fr); gap: 52px; align-items: start",
  "font: 600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  "font: 600 calc(16px * var(--ts))/1.4 var(--ft); letter-spacing: -0.022em",
  "padding: 0px 24px 22px; font: 400 15px/1.7 var(--fb); color: var(--ink2); max-width: 68ch",
];
const DESSIN_PROBLEME_RANGEE = [
  "grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: end; margin-bottom: 34px",
  "padding: 26px 24px 28px",
  "font: 600 24px/1 var(--ft)",
  "font: 400 13px/1.55 var(--fb)",
];
/** Relevés sur `implantations--maintenance-industrielle-agen.html`, l'un des dix panneaux sombres. */
const MARQUE_PANNEAU = "radial-gradient(circle, rgba(255, 124, 60, 0.26), transparent 68%)";
const DESSIN_PROBLEME_PANNEAU = [
  "width: 460px; height: 460px; right: -170px; top: -210px",
  "padding: 22px 26px; display: flex; gap: 16px; align-items: baseline",
  "font: 600 26px var(--ft)",
  "font: 600 16.5px/1.35 var(--ft)",
  "font: 400 14px/1.6 var(--fb); color: rgba(255, 255, 255, 0.62)",
];
/** Le H2 du problème, par dessin : absent du rendu quand il est un trou (`problemeSansTitre`). */
const DESSIN_PROBLEME_TITRE = {
  rangee: "font: 600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  panneau: "font: 600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
};

/**
 * LA SEULE REFORMULATION AUTORISÉE, tranchée par Mehdi le 08/10 (CLAUDE.md
 * et `docs/PASSATION.md`) : le titre de l'étude de cas Tournaire, « sur
 * mesure » étant proscrit. Même substitution que `/preuves/tournaire/`
 * (`preuve/verification-preuve.tsx`) et `/offres/retrofit/remise-en-etat/`
 * (`scripts/verifie-offre-rendu.mjs`). Appliquée à la capture avant toute
 * comparaison : la forme `rendu` y devient l'attendu, mot pour mot. Neuf
 * captures de ville la portent, toutes dans « 08 Références ».
 */
const SUBSTITUTIONS: readonly { maquette: string; rendu: string }[] = [
  { maquette: "Maintenir des machines conçues sur mesure", rendu: "Maintenir des machines conçues en interne" },
];
function substitue(capture: string): string {
  return SUBSTITUTIONS.reduce((html, s) => html.split(s.maquette).join(s.rendu), capture);
}

/** Le HTML d'une section de la capture, par son `data-screen-label`. */
function sectionCapture(capture: string, label: string): string {
  const debut = capture.indexOf(`data-screen-label="${label}"`);
  if (debut < 0) return "";
  const fin = capture.indexOf("data-screen-label=", debut + 1);
  return capture.slice(debut, fin < 0 ? undefined : fin);
}

/* ------------------------------------------------------ la photo du hub */

const PHOTOS_VILLES = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "photos-villes.json"), "utf8"),
) as Record<string, { src: string; credit?: string }>;

/* LES VERSIONS SOUS LICENCE, et pourquoi elles remplacent celles de la maquette.
   `photos-villes.json` porte ce que la maquette sert : des APERÇUS Envato, 600 px
   de large, couverts de filigranes « envato », et chargés depuis le CDN d'Envato
   à chaque visite. Trois raisons de ne pas les mettre en ligne : le filigrane se
   voit, la licence ne couvre pas l'aperçu, et une page de production ne doit pas
   dépendre d'un hôte tiers pour ses images. Mehdi a fait acheter les versions
   sous licence le 08/10 ; elles sont dans `public/assets/villes/`, en 1396 à
   2000 px. La correspondance a été établie photo par photo, page Envato à
   l'appui, dans `docs/PHOTOS-VILLES-ENVATO.md` : c'est elle qui fait foi ici.
   Le crédit disparaît avec l'aperçu : le badge « Aperçu Envato » n'avait de sens
   que tant que l'image n'était pas sous licence. Marseille et Bordeaux
   réutilisent la photo de leur carte de hub, c'est la même image dans la
   maquette. Les 62 autres pages ville gardent leur photo d'atelier (`REPLIS`),
   la maquette ne leur en donne pas d'autre. */
const SOUS_LICENCE: Record<string, string> = {
  "/implantations/lyon/": "ville-lyon.jpg",
  "/implantations/paris/": "ville-paris.jpg",
  "/implantations/marseille/": "hub-marseille.jpg",
  "/implantations/strasbourg/": "ville-strasbourg.jpg",
  "/implantations/nantes/": "ville-nantes.jpg",
  "/implantations/bordeaux/": "hub-bordeaux.jpg",
  "/implantations/paris/rouen/": "ville-rouen.jpg",
  "/implantations/maintenance-industrielle-orleans/": "ville-orleans.jpg",
  "/implantations/maintenance-industrielle-quimper/": "ville-quimper.jpg",
  "/implantations/maintenance-industrielle-lorient/": "ville-lorient.jpg",
  "/implantations/maintenance-industrielle-le-havre/": "ville-le-havre.jpg",
  "/implantations/maintenance-industrielle-dunkerque/": "ville-dunkerque.jpg",
};

/* Les deux tables doivent couvrir exactement les mêmes pages. Si la maquette
   gagne une photo de ville au prochain export et qu'on oublie de l'acheter, ce
   contrôle le dit tout de suite au lieu de laisser un aperçu filigrané partir
   en production. */
{
  const deLaMaquette = Object.keys(PHOTOS_VILLES).sort().join("|");
  const sousLicence = Object.keys(SOUS_LICENCE).sort().join("|");
  if (deLaMaquette !== sousLicence) {
    throw new Error(
      "Les photos de ville de la maquette et celles sous licence ne couvrent plus les mêmes pages.\n" +
        `  maquette     : ${Object.keys(PHOTOS_VILLES).sort().join(", ")}\n` +
        `  sous licence : ${Object.keys(SOUS_LICENCE).sort().join(", ")}\n` +
        "  Acheter la photo manquante (docs/PHOTOS-VILLES-ENVATO.md) ou retirer l'entrée en trop.",
    );
  }
}

/** `cityImg` de `MigenExpertise.dc.html`, à l'identique : `h = h * 31 + code`, sur 32 bits non signés. */
const REPLIS = ["sv-convoyeur", "sv-armoire", "sv-duo-impact", "sv-portrait", "team-grind-front", "team-electric"];
function photoAttendue(url: string): { photo: string; credit?: string } {
  const licence = SOUS_LICENCE[url];
  if (licence) return { photo: `/assets/villes/${licence}` };
  const envato = PHOTOS_VILLES[url];
  if (envato?.src) return { photo: envato.src, credit: envato.credit };
  let h = 0;
  for (const c of url) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return { photo: `/assets/web/${REPLIS[h % REPLIS.length]}.jpg` };
}

/** `hash` de la source : `h = (h * 31 + code) >>> 0` sur les caractères. */
function empreinte(texte: string): number {
  let h = 0;
  for (const c of texte) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return h;
}

/** `pbDark` / `pbSplit` / `pbCards` de `MigenExpertise.dc.html`, à l'identique. */
function dessinProbleme(url: string, puces: number): "panneau-sombre" | "colonne" | "rangee" {
  const h = empreinte(url);
  if (puces <= 4 && h % 3 === 2) return "panneau-sombre";
  if (puces <= 3 || h % 3 === 1) return "colonne";
  return "rangee";
}
/** `topicImg` : aucune URL de ville ne touche les quatre premiers thèmes de `TOPIC`. */
const PHOTO_PROBLEME = "/assets/web/ph-hero-raffinerie.jpg";

/** `PH(md)` de la source, pour une URL : ses photos de thème entrelacées avec celles de Migen. */
const MIGEN_PH = ["team-grind-front", "team-duo", "team-grind-close", "team-grind-impact", "team-electric"];
const THEME_PH: [RegExp, string[]][] = [
  [/logistique|entrepot|centre-logistique/, ["x-logistique-entrepot", "x-logistique-convoyeurs", "x-logistique-cariste", "x-logistique-responsable", "x-logistique-discussion", "x-logistique-tablette"]],
  [/automobile|auto/, ["x-auto-ligne", "x-auto-caisse", "x-auto-mecanicienne", "x-auto-portrait", "x-robotique"]],
  [/aeronautique/, ["x-robotique", "x-faisceaux", "x-elec-cablage", "x-auto-caisse"]],
  [/chimie|petro|raffin/, ["ph-hero-raffinerie", "ph-tuyaux", "x-cimenterie", "x-tech-portrait"]],
  [/lourde|metal|siderurg|fonderie|cimen/, ["x-cimenterie", "x-soudure", "x-caoutchouc-atelier", "x-mecanique-portrait"]],
  [/textile|plasturgie|caoutchouc|papier|emballage/, ["x-textile-filature", "x-caoutchouc-bobines", "x-caoutchouc-pieces", "x-cablerie", "x-caoutchouc-atelier"]],
  [/pharma|cosmet|medic/, ["x-tech-portrait", "x-elec-cablage", "x-elec-disjoncteur", "x-logistique-tablette"]],
  [/agro|alimentaire/, ["x-tech-portrait", "x-mecanique-portrait", "x-caoutchouc-atelier", "x-logistique-tablette"]],
  [/robot/, ["x-robotique", "x-auto-caisse", "x-faisceaux"]],
  [/electri|electro|automatisme|siemens|schneider|abb|fanuc|cabl/, ["x-elec-disjoncteur", "x-elec-cablage", "x-elec-portrait", "x-faisceaux", "x-cablerie"]],
  [/soudure|tuyauterie|chaudronn/, ["x-soudure", "ph-tuyaux", "x-cimenterie"]],
  [/mecanique|hydraul|pneumat|transmission/, ["x-mecanique-portrait", "x-auto-mecanicienne", "x-cimenterie", "x-caoutchouc-atelier"]],
  [/travaux|transfert|montage|chantier/, ["x-logistique-entrepot", "x-cimenterie", "x-auto-ligne", "x-soudure"]],
];
function photosPreuves(url: string): string[] {
  const own = THEME_PH.find(([motif]) => motif.test(url.toLowerCase()))?.[1] ?? [
    "x-tech-portrait", "x-elec-cablage", "x-logistique-entrepot", "x-soudure", "x-mecanique-portrait",
  ];
  const mix: string[] = [];
  for (let i = 0; i < Math.max(own.length, MIGEN_PH.length); i++) {
    if (own[i]) mix.push(own[i]);
    if (MIGEN_PH[i]) mix.push(MIGEN_PH[i]);
  }
  return mix;
}
/** `casLiesVals` de la source. */
const PH_CAS = ["team-grind-front", "team-duo", "ph-tuyaux", "ph-robots-solaire", "team-grind-close", "team-grind-impact", "ph-hero-raffinerie", "ph-technicien", "team-electric"];
const CAS_LIES = JSON.parse(readFileSync(join(RACINE, "maquette", "contenu", "site", "cas-lies.json"), "utf8")) as Record<
  string,
  { url: string }[]
>;

/* ------------------------------------------------------------ le contrôle */

function rend(page: PageRelais): string {
  return renderToStaticMarkup(
    <PageVille
      titre={page.titre_h1 ?? ""}
      contenu={page.contenu}
      formulaire={`verification${page.url.replace(/\//g, "-")}`}
    />,
  );
}

const sansSlash = (href: string) => href.replace(/\/+$/, "") || "/";

/**
 * LE FORMULAIRE PARTAGÉ (`FormulaireContact`, hors périmètre du gabarit) : ses
 * deux écarts à la capture sont déclarés dans `offre/PanneauFormulaire.tsx`.
 * On retire CES DEUX-LÀ des deux côtés avant de comparer, rien d'autre : les
 * libellés des champs et le bouton d'envoi restent comparés (depuis le 08/10,
 * il répète le titre du panneau, comme la capture) :
 *  - le champ piège anti-robot « Site web », masqué (`aria-hidden`) ;
 *  - la mention RGPD et son lien `/confidentialite` (RGPD articles 13 et 14).
 */
function sansEcartsFormulaire(html: string): string {
  return html.replace(/<form\b[\s\S]*?<\/form>/g, (form) =>
    form
      .replace(/<div aria-hidden="true"[^>]*><label[^>]*>Site web<\/label>[\s\S]*?<\/div>/g, "")
      .replace(/<p[^>]*>Données traitées par Migen[\s\S]*?<\/p>/g, ""),
  );
}

/**
 * Les écarts de LITTÉRAL des composants partagés de `components/site/offre/`,
 * hors du périmètre de ce gabarit : déclarés ici, à corriger là-bas.
 */
const ECARTS_LITTERAUX_PARTAGES: readonly { texte: string; fois: number; pourquoi: string }[] = [
  {
    texte: "10 %",
    fois: 1,
    pourquoi:
      "offre/Reassurance.tsx (l. 92) écrit « 10 % » avec une espace simple ; la capture, carte « Qui intervient chez vous », identique sur les 66 pages, écrit « 10\u00a0% » insécable.",
  },
];

/** Les écarts d'une page à SA capture. Vide : conforme. */
function controle(page: PageRelais, captureBrute: string, htmlBrut: string): string[] {
  const capture = substitue(sansEcartsFormulaire(captureBrute));
  const html = sansEcartsFormulaire(htmlBrut);
  const ecarts: string[] = [];
  const trous = (page.trous ?? []).map((t) => normalise(t.ligne));

  // 1. Le H1.
  const h1Capture = normalise(decode((capture.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1]?.replace(/<[^>]+>/g, "") ?? ""));
  if (normalise(page.titre_h1 ?? "") !== h1Capture) ecarts.push(`H1 « ${page.titre_h1} » au lieu de « ${h1Capture} »`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) ecarts.push("le rendu ne porte pas exactement un h1");

  const nCapture = noeuds(capture);
  const nRendu = noeuds(html);
  const texteCapture = nCapture.join(" ");
  const texteRendu = nRendu.join(" ");

  // 4. Les trous : dans la capture, absents du rendu.
  for (const trou of trous) {
    if (!texteCapture.includes(trou)) ecarts.push(`trou déclaré absent de la capture : « ${trou.slice(0, 90)} »`);
    if (texteRendu.includes(trou)) ecarts.push(`trou déclaré mais rendu : « ${trou.slice(0, 90)} »`);
  }

  // 2. Mot pour mot, dans l'ordre.
  let curseur = 0;
  for (const brut of nCapture) {
    let attendu = brut;
    for (const trou of trous) attendu = attendu.split(trou).join("");
    attendu = normalise(attendu);
    if (!attendu) continue;
    const i = texteRendu.indexOf(attendu, curseur);
    if (i < 0) {
      const ailleurs = texteRendu.includes(attendu);
      ecarts.push(`${ailleurs ? "hors de son ordre" : "absent du rendu"} : « ${attendu.slice(0, 110)} »`);
      continue;
    }
    curseur = i + attendu.length;
  }

  // 3. Rien d'inventé, puis le littéral. La capture y est lue SANS ses trous :
  // une phrase retirée au milieu d'un paragraphe y recoud le texte rendu
  // (« A. B. C. », B déclaré, se rend « A. C. »). Le trou reste jugé au
  // point 4 : présent dans la capture, absent du rendu.
  const recoud = (texte: string) => texte.replace(/ {2,}/g, " ");
  const texteCaptureSansTrous = recoud(trous.reduce((t, trou) => t.split(trou).join(" "), texteCapture));
  for (const noeud of nRendu) {
    if (!texteCaptureSansTrous.includes(noeud)) ecarts.push(`texte rendu absent de la capture : « ${noeud.slice(0, 110)} »`);
  }
  // Les écarts LITTÉRAUX des composants partagés, hors périmètre, déclarés
  // un par un avec leur nombre d'occurrences : rien d'autre n'est toléré.
  const tolere = (noeud: string) =>
    ECARTS_LITTERAUX_PARTAGES.filter((e) => e.texte === noeud).reduce((n, e) => n + e.fois, 0);
  // Compté, et non seulement cherché : « Rappel dans l'heure » droit existe
  // dans la capture, une pastille qui l'écrirait droit au lieu de « ’ » doit
  // pourtant échouer.
  const litteralCapture = recoud(
    trous.reduce((t, trou) => t.replace(motifLitteral(trou), " "), litteral(capture).join(" ")),
  );
  const litteralRendu = litteral(html).join(" ");
  const compte = (texte: string, motif: string) => texte.split(motif).length - 1;
  for (const noeud of new Set(litteral(html))) {
    if (texteCaptureSansTrous.includes(normalise(noeud)) && compte(litteralRendu, noeud) - tolere(noeud) > compte(litteralCapture, noeud))
      ecarts.push(`littéral différent de la capture (espace insécable ou apostrophe) : « ${noeud.slice(0, 110)} »`);
  }

  // 5. Les liens.
  if (/href="#"/.test(html)) ecarts.push('un href="#" est rendu');
  const liensCapture = new Set(attributs(capture, "href").map(sansSlash));
  for (const href of new Set(attributs(html, "href"))) {
    if (!liensCapture.has(sansSlash(href))) ecarts.push(`lien absent de la capture : ${href}`);
  }

  // 6. Les photos locales.
  const photos = JSON.stringify(page.contenu).match(/"\/assets\/[^"]+"/g) ?? [];
  for (const photo of photos.map((p) => p.slice(1, -1))) {
    if (!existsSync(join(RACINE, "public", photo))) ecarts.push(`photo absente de public/ : ${photo}`);
  }

  // 7. Les interdits, sur le texte rendu.
  for (const [motif, raison] of INTERDITS) {
    const trouve = texteRendu.match(motif);
    if (trouve) ecarts.push(`interdit rendu (${raison}) : « ${trouve[0]} »`);
  }

  // 8. Le dessin des écrans propres à la ville.
  const styleCapture = normaliseStyle(capture);
  const styleRendu = normaliseStyle(html);
  const sansTitre = !!page.contenu.problemeSansTitre;
  const problemeCapture = sectionCapture(capture, "03 Problème");
  const enRangee = problemeCapture.includes("g3-pbgrid");
  const enPanneau = problemeCapture.includes(MARQUE_PANNEAU);
  const dessin = [
    ...DESSIN_COMMUN,
    ...(capture.includes("Zones couvertes") || capture.includes("Nos hubs") || capture.includes("Hub de rattachement")
      ? DESSIN_ZONES
      : []),
    ...(enRangee ? DESSIN_PROBLEME_RANGEE : []),
    ...(enPanneau ? DESSIN_PROBLEME_PANNEAU : []),
    ...(enRangee && !sansTitre ? [DESSIN_PROBLEME_TITRE.rangee] : []),
    ...(enPanneau && !sansTitre ? [DESSIN_PROBLEME_TITRE.panneau] : []),
    ...(capture.includes("mg-faqph") ? DESSIN_QUESTIONS : []),
  ];
  for (const fragment of dessin) {
    const attendu = normaliseStyle(fragment);
    if (!styleCapture.includes(attendu)) ecarts.push(`la capture ne porte plus le dessin « ${fragment} » : valeur à relever`);
    else if (!styleRendu.includes(attendu)) ecarts.push(`dessin de la capture absent du rendu : « ${fragment} »`);
  }

  // 10. La photo du hub local.
  if (page.contenu.hubLocal) {
    const attendu = photoAttendue(page.url);
    const { photo, credit } = page.contenu.hubLocal;
    if (photo !== attendu.photo) ecarts.push(`photo du hub « ${photo.slice(0, 80)} » au lieu de « ${attendu.photo.slice(0, 80)} »`);
    if ((credit ?? "") !== (attendu.credit ?? "")) ecarts.push(`crédit du hub « ${credit ?? ""} » au lieu de « ${attendu.credit ?? ""} »`);
  }

  // 11. Le dessin du problème, et sa photo en colonne.
  const probleme = page.contenu.sections?.find((x) => x.type === "probleme");
  if (probleme?.type === "probleme") {
    const attendu = dessinProbleme(page.url, probleme.puces.length);
    const ecrit = probleme.variante ?? "colonne";
    if (ecrit !== attendu) ecarts.push(`problème en « ${ecrit} » au lieu de « ${attendu} » (règle pbDark/pbSplit/pbCards)`);
    if (attendu === "colonne" && page.contenu.problemePhoto !== PHOTO_PROBLEME)
      ecarts.push(`photo du problème « ${page.contenu.problemePhoto} » au lieu de « ${PHOTO_PROBLEME} »`);
    // Le H2 de la capture est un trou SI ET SEULEMENT SI `problemeSansTitre` :
    // sans cette règle, une punchline amputée glisserait sa suite dans le H2.
    const h2 = (problemeCapture.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/) ?? [])[1] ?? "";
    const h2EstTrou = trous.includes(normalise(decode(h2.replace(/<[^>]+>/g, ""))));
    if (h2EstTrou !== sansTitre)
      ecarts.push(
        h2EstTrou
          ? "le H2 de « 03 Problème » est un trou : poser `problemeSansTitre: true`"
          : "`problemeSansTitre` sans que le H2 de « 03 Problème » soit déclaré dans `trous`",
      );
    if (sansTitre && ecrit === "colonne") ecarts.push("`problemeSansTitre` n'est honoré qu'en rangée et en panneau sombre");
  }

  // 12. Les photos des références : les preuves du corpus d'abord, puis les cas liés.
  const preuves = page.contenu.sections?.find((x) => x.type === "preuves");
  if (preuves?.type === "preuves") {
    const duCorpus = photosPreuves(page.url);
    const lies = (CAS_LIES[page.url] ?? []).map((c) => c.url);
    let enTete = true;
    preuves.preuves.forEach((preuve, rang) => {
      const commePreuve = `/assets/web/${duCorpus[rang % duCorpus.length]}.jpg`;
      const j = lies.indexOf(preuve.lienHref ?? "");
      const commeCas = j < 0 ? undefined : `/assets/web/${PH_CAS[(empreinte(preuve.lienHref!) + j) % PH_CAS.length]}.jpg`;
      enTete = enTete && preuve.photo === commePreuve;
      if (!enTete && preuve.photo !== commeCas)
        ecarts.push(`photo de la référence ${rang + 1} « ${preuve.photo} » : ni ${commePreuve} (preuve du corpus) ni ${commeCas ?? "un cas lié"}`);
    });
  }

  // 9. Les questions se replient, une seule ouverte, la première.
  const plis = [...html.matchAll(/<details\b([^>]*)>/g)].map((m) => m[1]);
  const plisCapture = (capture.match(/<details\b/g) ?? []).length;
  if (plis.length !== plisCapture) ecarts.push(`${plis.length} question(s) repliable(s) au lieu de ${plisCapture}`);
  const noms = new Set(plis.map((a) => (a.match(/\sname="([^"]*)"/) ?? [])[1] ?? ""));
  if (plis.length > 0 && (noms.size !== 1 || noms.has(""))) ecarts.push("les questions ne partagent pas un même `name` : l'accordéon n'est pas exclusif");
  const ouverts = plis.map((a, i) => (/\sopen(?:=""|\s|$)/.test(a) ? i : -1)).filter((i) => i >= 0);
  if (plis.length > 0 && ouverts.join() !== "0") ecarts.push(`questions ouvertes au chargement : [${ouverts.join(", ")}] au lieu de la première seule`);

  return ecarts;
}

/* ------------------------------------------------------- les pages réelles */

function cleDe(url: string): string {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "index";
}

/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
function lisCapture(url: string): string | undefined {
  const chemin = join(RENDU, `${cleDe(url)}.html`);
  return existsSync(chemin) ? appliqueDecisions(readFileSync(chemin, "utf8")) : undefined;
}

const filtres = process.argv.slice(2);
const fichiers = readdirSync(DOSSIER)
  .filter((n) => /^implantations-.*\.json$/.test(n))
  .filter((n) => filtres.length === 0 || filtres.some((f) => n.includes(f)))
  .sort();

const pages = fichiers
  .map((nom) => ({ nom, page: JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais }))
  .filter(({ page }) => page.contenu?.gabarit === "ville");

/* ------------------------------- la preuve qu'il sait échouer, à chaque passage */

const PILOTE = "implantations-lyon.json";
const pilote = JSON.parse(readFileSync(join(DOSSIER, PILOTE), "utf8")) as PageRelais;
const capturePilote = lisCapture(pilote.url)!;

function altere(modifie: (p: PageRelais) => void): PageRelais {
  const copie = structuredClone(pilote);
  modifie(copie);
  return copie;
}

/** [nom, page altérée, écart attendu, retouche éventuelle du HTML rendu]. */
const ALTERATIONS: [string, PageRelais, RegExp, ((html: string) => string)?][] = [
  [
    "un mot changé dans une réponse",
    altere((p) => {
      const q = p.contenu.sections!.find((s) => s.type === "objections");
      if (q?.type === "objections") q.questions[0].reponse = q.questions[0].reponse.replace("Oui", "Si");
    }),
    /absent du rendu/,
  ],
  ["une section retirée", altere((p) => delete p.contenu.hubLocal), /absent du rendu/],
  [
    "une phrase inventée",
    altere((p) => (p.contenu.chapeau = `${p.contenu.chapeau} Nos techniciens sont les meilleurs.`)),
    /texte rendu absent de la capture/,
  ],
  /* 09/10 : ce témoin testait la décision du 07/10 et vérifiait que la phrase
     de la maquette était REFUSÉE. Mehdi l'a renversée, la phrase de la maquette
     est désormais la bonne, et le témoin est retourné avec elle : c'est Écully
     présentée comme le siège qui doit tomber, pas Limonest. */
  [
    "Écully présentée comme le siège, alors que c'est l'agence",
    altere(
      (p) =>
        (p.contenu.chapeau = p.contenu.chapeau!.replace(
          "siège à Limonest et bureaux à Écully",
          "siège à Écully",
        )),
    ),
    /interdit rendu/,
  ],
  [
    "« candidats » remis là où la décision dit « techniciens »",
    altere((p) => (p.contenu = JSON.parse(JSON.stringify(p.contenu).replaceAll("techniciens retenus", "candidats retenus")))),
    /texte rendu absent de la capture/,
  ],
  [
    "un faux trou",
    altere((p) => p.trous!.push({ ligne: "Hub Lyon", pourquoi: "essai" })),
    /trou déclaré mais rendu/,
  ],
  [
    "un lien inventé",
    altere((p) => (p.contenu.hubLocal!.cartes[0].href = "/secteurs/aeronautique/")),
    /lien absent de la capture/,
  ],
  [
    "une photo de référence devinée",
    altere((p) => {
      const r = p.contenu.sections!.find((x) => x.type === "preuves");
      if (r?.type === "preuves") r.preuves[6].photo = "/assets/web/team-duo.jpg";
    }),
    /photo de la référence 7/,
  ],
  [
    "un dessin de problème deviné",
    altere((p) => {
      const r = p.contenu.sections!.find((x) => x.type === "probleme");
      if (r?.type === "probleme") r.variante = "panneau-sombre";
    }),
    /problème en « panneau-sombre »/,
  ],
  [
    "une apostrophe typographique redressée",
    altere((p) => (p.contenu.formulaireHeroMention = p.contenu.formulaireHeroMention!.replace("’", "'"))),
    /littéral différent/,
  ],
  [
    "le titre Tournaire vidé au lieu d'être substitué",
    altere((p) => {
      const r = p.contenu.sections!.find((x) => x.type === "preuves");
      if (r?.type === "preuves") r.preuves.find((x) => x.lienHref === "/preuves/tournaire/")!.titre = "";
    }),
    /absent du rendu : « Maintenir des machines conçues en interne »/,
  ],
  [
    "un titre de problème retiré sans trou déclaré",
    altere((p) => (p.contenu.problemeSansTitre = true)),
    /`problemeSansTitre` sans que le H2/,
  ],
  [
    "des questions toutes ouvertes, sans accordéon",
    pilote,
    /questions ouvertes au chargement|même `name`/,
    (html) => html.replace(/<details\b[^>]*>/g, '<details open="">'),
  ],
];

/* Le pilote DÉPARTEMENT : les fautes propres aux huit pages du gabarit 06. */
const PILOTE_DEPT = "implantations-lyon-rhone.json";
const piloteDept = JSON.parse(readFileSync(join(DOSSIER, PILOTE_DEPT), "utf8")) as PageRelais;
const captureDept = lisCapture(piloteDept.url)!;
const REPONSE_A_TROU = "Pouvez-vous tenir un poste à demeure dans notre usine ?";
function altereDept(modifie: (p: PageRelais) => void): PageRelais {
  const copie = structuredClone(piloteDept);
  modifie(copie);
  return copie;
}
function reponseDept(p: PageRelais, change: (r: string) => string) {
  const q = p.contenu.sections!.find((s) => s.type === "objections");
  if (q?.type !== "objections") return;
  const cible = q.questions.find((x) => x.question === REPONSE_A_TROU)!;
  cible.reponse = change(cible.reponse);
}
const ALTERATIONS_DEPT: [string, PageRelais, RegExp][] = [
  [
    "l'ancien chiffre « dont plus de 80 réguliers » remis",
    altereDept((p) => (p.contenu.chiffres![0].libelle = "Clients industriels accompagnés, dont plus de 80 réguliers")),
    /interdit rendu \(« \+200 clients »/,
  ],
  [
    "la prise de poste chiffrée rendue, trou retiré",
    altereDept((p) => {
      p.trous = [];
      reponseDept(p, (r) => r.replace(
        "Oui, c'est l'offre résidence.",
        "Oui, c'est l'offre résidence. Le technicien est salarié Migen, intégré à votre équipe et suivi par un référent, avec une prise de poste en 2 à 3 semaines.",
      ));
    }),
    /interdit rendu \(délai chiffré/,
  ],
  [
    "une phrase inventée à la place du trou",
    altereDept((p) => reponseDept(p, (r) => r.replace("Oui, c'est l'offre résidence.", "Oui, c'est l'offre résidence. Le poste est pourvu très vite."))),
    /texte rendu absent de la capture/,
  ],
];

let aveugle = false;
const essais: [string, PageRelais, RegExp, ((html: string) => string) | undefined, string][] = [
  ...ALTERATIONS.map(([n, p, a, r]) => [n, p, a, r, capturePilote] as [string, PageRelais, RegExp, ((html: string) => string) | undefined, string]),
  ...ALTERATIONS_DEPT.map(([n, p, a]) => [n, p, a, undefined, captureDept] as [string, PageRelais, RegExp, undefined, string]),
];
for (const [nom, page, attendu, retouche, captureEssai] of essais) {
  const html = rend(page);
  const ecarts = controle(page, captureEssai, retouche ? retouche(html) : html);
  if (!ecarts.some((e) => attendu.test(e))) {
    aveugle = true;
    console.error(`CONTRÔLE AVEUGLE : l'altération « ${nom} » passe sans être vue.`);
  }
}
if (aveugle) process.exit(1);
console.log(
  `preuve d'échec : les ${ALTERATIONS.length} altérations de ${PILOTE} et les ${ALTERATIONS_DEPT.length} de ${PILOTE_DEPT} sont toutes vues.`,
);

/* ------------------------------------------------------------- le verdict */

/** Les 66 URL du gabarit 04 et les 8 du gabarit 06, lues dans l'index du client : on ne les devine pas. */
const index = JSON.parse(readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8")) as {
  url: string;
  gabarit?: string;
}[];
const urlsVille = new Set(
  index.filter((p) => /^0[46] /.test(p.gabarit ?? "")).map((p) => p.url),
);

let enEchec = 0;
for (const { nom, page } of pages) {
  const capture = lisCapture(page.url);
  const ecarts = !urlsVille.has(page.url)
    ? [`${page.url} n'est pas une page du gabarit 04 ou 06 dans l'index de la maquette (adresse redirigée ?) : fichier à retirer`]
    : capture
      ? controle(page, capture, rend(page))
      : [`aucune capture maquette/rendu/${cleDe(page.url)}.html`];
  if (ecarts.length === 0) {
    console.log(`OK  ${nom}  (${(page.trous ?? []).length} trou(s) déclaré(s))`);
    continue;
  }
  enEchec++;
  console.log(`KO  ${nom}  ${ecarts.length} écart(s)`);
  for (const e of ecarts.slice(0, 12)) console.log(`      ${e}`);
  if (ecarts.length > 12) console.log(`      … et ${ecarts.length - 12} autre(s)`);
}

const couvertes = new Set(pages.map(({ page }) => page.url));
const sansFichier = [...urlsVille].filter((u) => !couvertes.has(u)).sort();
if (!filtres.length && sansFichier.length) {
  console.log(`\n${sansFichier.length} page(s) des gabarits 04 et 06 sans fichier ville :`);
  for (const u of sansFichier) console.log(`      ${u}`);
}
console.log(
  `\ngabarit ville : ${pages.length - enEchec}/${pages.length} fichier(s) conforme(s) à leur capture` +
    (filtres.length ? "" : `, ${urlsVille.size - sansFichier.length}/${urlsVille.size} pages des gabarits 04 et 06 ont un fichier`) +
    ".",
);
if (enEchec > 0) process.exit(1);
