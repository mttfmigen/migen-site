/**
 * PORTE DE LA COUCHE DE CONVERSION MOBILE, sans navigateur.
 *
 *   bun components/site/mobile/verification-conversion-mobile.tsx
 *   bun components/site/mobile/verification-conversion-mobile.tsx --controle
 *
 * LA RÉFÉRENCE est la maquette mobile v2,
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, et depuis le 16/10
 * la V3 (`maquette/mobile-v3/Migen - Mobile V3.dc.html`) pour la barre
 * collante et le photo + CTA : un libellé vaut s'il est écrit dans l'une des
 * deux. Les deux sont RELUES à chaque exécution, jamais recopiées : si la
 * maquette change, la porte le voit.
 *
 * CE QU'ELLE TIENT :
 * 1. ZÉRO TEXTE INVENTÉ : chaque libellé rendu par les composants existe
 *    verbatim dans la maquette (ou vient d'un composant existant réutilisé,
 *    `RappelExpress`), et le texte rendu ne contient RIEN d'autre.
 * 2. CIBLES TACTILES : tout `<a>` et `<button>` rendu mesure au moins 24 px
 *    de haut (WCAG 2.2, SC 2.5.8 ; les nôtres font 44 à 52 px).
 * 3. CONTRASTE : chaque paire texte/fond atteint 4,5:1, ou est héritée
 *    VERBATIM de la maquette (la sous-chaîne de style est exigée dans
 *    dc.html) : on ne réécrit pas la DA du client, on ne l'invente pas non plus.
 * 4. MOTS INTERDITS, tiret cadratin, montants et délais chiffrés : absents
 *    du texte rendu (seul « dans l'heure » est permis, et il n'est pas chiffré).
 * 5. LA CADENCE est celle de la maquette (photo + CTA après la 2e section,
 *    bandeau toutes les 3), et ses formules sont exigées dans dc.html.
 * 6. LES GARDES CSS : `[data-mobile-seulement]` masqué dès 881 px,
 *    la barre collante déclenche la réserve de `body` (jamais de recouvrement).
 *
 * TÉMOINS (contrôles négatifs), exécutés à chaque fois : une cible de 20 px,
 * un libellé inventé, une paire de contraste sans source, et une section de
 * démonstration AMPUTÉE DE SON TEXTE doivent chacun faire tomber le contrôle
 * concerné. `--controle` n'exécute que ces témoins, et en détail.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import RappelExpress from "@/components/site/offre/generique/RappelExpress";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import BandeauRappelMobile from "./BandeauRappelMobile";
import BarreCollanteMobile from "./BarreCollanteMobile";
import PhotoCtaMobile from "./PhotoCtaMobile";
import RappelFinalMobile from "./RappelFinalMobile";
import DemonstrationConversionMobile, {
  PHOTO_DEMONSTRATION,
} from "./demonstration";
import {
  ANCRE_RAPPEL,
  boutonBandeau,
  boutonBarreCollante,
  boutonPhotoCta,
  BOUTON_POSTULER_FINAL,
  CIBLE_CONTACT,
  CIBLE_POSTULER,
  CIBLE_POSTULER_MAQUETTE,
  ID_BANDEAU,
  ID_PHOTO_CTA,
  ID_RAPPEL_FINAL,
  insertionApresSection,
  LIBELLE_ROND_TELEPHONE,
  LIEN_DETAIL,
  sousLigneBarreCollante,
  surTitrePhotoCta,
  surTitreRappelFinal,
  texteBandeau,
  titrePhotoCta,
  titreRappelFinal,
  type VarianteConversion,
} from "./conversion-donnees";

const MAQUETTE = "maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html";
const MAQUETTE_V3 = "maquette/mobile-v3/Migen - Mobile V3.dc.html";
const GLOBALS = "app/globals.css";

const dc = readFileSync(MAQUETTE, "utf8");
const dcV3 = readFileSync(MAQUETTE_V3, "utf8");
const css = readFileSync(GLOBALS, "utf8");
/** Écrit dans l'une des deux maquettes de référence. */
const dansUneMaquette = (texte: string) => dc.includes(texte) || dcV3.includes(texte);

/* ------------------------------------------------------------- outillage */

const entites: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};
const texteDe = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (e) => entites[e])
    .replace(/\s+/g, " ")
    .trim();

const sansAccents = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Les libellés attendus sont retirés un à un (les plus longs d'abord) :
 *  ce qui reste ne doit plus porter une seule lettre. */
function resteApresLibelles(texte: string, libelles: readonly string[]): string {
  let reste = ` ${texte} `;
  for (const l of [...libelles].sort((a, b) => b.length - a.length)) {
    reste = reste.replace(l, " ");
  }
  return /\p{L}/u.test(reste) ? reste.replace(/\s+/g, " ").trim() : "";
}

function libellesManquants(html: string, libelles: readonly string[]): string[] {
  const texte = texteDe(html);
  return libelles.filter((l) => !texte.includes(l));
}

/* --------------------------------------------- contraste (WCAG, calculé) */

type Rgb = [number, number, number];
const lineaire = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * lineaire(r) + 0.7152 * lineaire(g) + 0.0722 * lineaire(b);
const contraste = (a: Rgb, b: Rgb) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const hex = (h: string): Rgb => {
  const n = h.replace("#", "");
  const x = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  return [0, 1, 2].map((i) => parseInt(x.slice(i * 2, i * 2 + 2), 16)) as Rgb;
};
/** `dessus` (alpha) composé sur `dessous`, par canal. */
const compose = (dessus: Rgb, alpha: number, dessous: Rgb): Rgb =>
  [0, 1, 2].map((i) =>
    Math.round(alpha * dessus[i] + (1 - alpha) * dessous[i]),
  ) as Rgb;

const BLANC: Rgb = [255, 255, 255];
const ENCRE = hex("#1c1b19"); // dc.html, couleur d'encre partout
const ORANGE = hex("#ff7c3c");
const ORANGE_CLAIR = hex("#ffb08a");
const FOND_PAGE = hex("#f1f2f4"); // dc.html L111 : rgba(241,242,244,.94)

interface PaireContraste {
  nom: string;
  texte: Rgb;
  fond: Rgb;
  /** Paire héritée : la sous-chaîne de style exigée verbatim dans dc.html. */
  heriteeDe?: string;
}

const PAIRES: readonly PaireContraste[] = [
  {
    nom: "blanc sur orange (boutons principaux, dc.html L191)",
    texte: BLANC,
    fond: ORANGE,
    heriteeDe: "background:#ff7c3c;color:#fff",
  },
  {
    nom: "blanc à 88 % sur orange (sous-ligne de la barre, V3 `stickyS`)",
    texte: compose(BLANC, 0.88, ORANGE),
    fond: ORANGE,
    heriteeDe: "font:500 11px/1.2 var(--fb);color:rgba(255,255,255,.88)",
  },
  {
    nom: "encre sur blanc (icône du rond téléphone du photo + CTA, V3)",
    texte: ENCRE,
    fond: BLANC,
  },
  { nom: "blanc sur encre (section finale, bouton du bandeau)", texte: BLANC, fond: ENCRE },
  { nom: "orange clair sur encre (lien détail, dc.html L138)", texte: ORANGE_CLAIR, fond: ENCRE },
  { nom: "orange sur encre (sur-titres)", texte: ORANGE, fond: ENCRE },
  {
    nom: "encre sur bandeau orangé à 10 % (dc.html L127)",
    texte: ENCRE,
    fond: compose(ORANGE, 0.1, FOND_PAGE),
  },
  {
    nom: "texte indicatif des champs sombres (globals.css, blanc à 80 %)",
    texte: compose(BLANC, 0.8, compose(BLANC, 0.08, ENCRE)),
    fond: compose(BLANC, 0.08, ENCRE),
  },
];

function controleContraste(paires: readonly PaireContraste[]): string[] {
  const defauts: string[] = [];
  for (const p of paires) {
    const ratio = contraste(p.texte, p.fond);
    if (ratio >= 4.5) continue;
    if (p.heriteeDe && dansUneMaquette(p.heriteeDe)) continue; // DA du client, prouvée
    defauts.push(`${p.nom} : ${ratio.toFixed(2)}:1 sans source dans la maquette`);
  }
  return defauts;
}

/* ------------------------------------------- cibles tactiles (SC 2.5.8) */

const VARIABLES_PX: Record<string, number> = {
  "--conversion-barre-hauteur": 58,
};

function hauteurDeclaree(style: string): number | null {
  const m = style.match(/(?:^|;)\s*(?:min-)?height:\s*([^;]+)/);
  if (!m) return null;
  const v = m[1].trim();
  const px = v.match(/^([\d.]+)px$/);
  if (px) return Number(px[1]);
  const varPx = v.match(/^var\((--[\w-]+)\)$/);
  if (varPx && VARIABLES_PX[varPx[1]] !== undefined) return VARIABLES_PX[varPx[1]];
  return null;
}

/** Sans hauteur posée : corps de texte x interligne + rembourrages. */
function hauteurEstimee(style: string): number {
  const police = style.match(/font:[^;]*?([\d.]+)px(?:\/([\d.]+))?/);
  const corps = police ? Number(police[1]) : 16;
  const interligne = police && police[2] ? Number(police[2]) : 1.2;
  let haut = 0;
  let bas = 0;
  const p = style.match(/(?:^|;)\s*padding:\s*([^;]+)/);
  if (p) {
    const v = p[1].trim().split(/\s+/).map((x) => Number(x.replace("px", "")) || 0);
    haut = v[0];
    bas = v.length === 1 ? v[0] : v.length === 2 ? v[0] : v[2];
  }
  return corps * interligne + haut + bas;
}

function ciblesTropPetites(html: string): string[] {
  const defauts: string[] = [];
  const balises = html.match(/<(?:a|button)\b[^>]*>/g) ?? [];
  for (const b of balises) {
    const style = (b.match(/style="([^"]*)"/) ?? [])[1] ?? "";
    const h = hauteurDeclaree(style) ?? hauteurEstimee(style);
    if (h < 24) defauts.push(`${h.toFixed(1)}px : ${b.slice(0, 120)}`);
  }
  return defauts;
}

/* ------------------------------------- mots interdits, montants, délais */

const MOTS_INTERDITS = [
  "interim",
  "notamment",
  "sur mesure",
  "sur-mesure",
  "cle en main",
  "regie",
  "levier",
  "mise a disposition",
  "sans engagement",
  "concretement",
  "incontournable",
  "decouvrez",
];

function copieFautive(texte: string): string[] {
  const nu = sansAccents(texte);
  const defauts = MOTS_INTERDITS.filter((m) =>
    new RegExp(`(?:^|[^\\p{L}])${m}(?:[^\\p{L}]|$)`, "u").test(nu),
  );
  if (texte.includes("—")) defauts.push("tiret cadratin");
  if (texte.includes("€")) defauts.push("montant (€)");
  if (/\d+\s*(?:h\b|heures?\b|jours?\b|minutes?\b|min\b)/iu.test(texte)) {
    defauts.push("délai chiffré");
  }
  return defauts;
}

/* ----------------------------------------------------- rendus à mesurer */

const VARIANTES: readonly VarianteConversion[] = [
  "standard",
  "article",
  "etudeDeCas",
  "carriere",
];

interface Rendu {
  nom: string;
  html: string;
  libelles: readonly string[];
}

const PHOTO = PHOTO_DEMONSTRATION;
/** Le texte du panneau réutilisé, relevé sur son propre rendu : il fait foi. */
const texteRappelExpress = texteDe(renderToStaticMarkup(<RappelExpress />));

function rendus(): Rendu[] {
  const liste: Rendu[] = [];
  for (const v of VARIANTES) {
    liste.push({
      nom: `BarreCollanteMobile ${v}`,
      html: renderToStaticMarkup(<BarreCollanteMobile variante={v} />),
      libelles: [boutonBarreCollante(v).libelle, sousLigneBarreCollante(v)],
    });
    liste.push({
      nom: `PhotoCtaMobile ${v}`,
      html: renderToStaticMarkup(<PhotoCtaMobile variante={v} photoSrc={PHOTO} />),
      libelles: [
        surTitrePhotoCta(v),
        titrePhotoCta(v),
        boutonPhotoCta(v).libelle,
      ],
    });
    liste.push({
      nom: `BandeauRappelMobile ${v}`,
      html: renderToStaticMarkup(<BandeauRappelMobile variante={v} />),
      libelles: [texteBandeau(v), boutonBandeau(v).libelle],
    });
    liste.push({
      nom: `RappelFinalMobile ${v}`,
      html: renderToStaticMarkup(<RappelFinalMobile variante={v} />),
      libelles:
        v === "carriere"
          ? [surTitreRappelFinal(v), titreRappelFinal(v), BOUTON_POSTULER_FINAL.libelle]
          : [
              surTitreRappelFinal(v),
              titreRappelFinal(v),
              texteRappelExpress,
              LIEN_DETAIL.libelle,
            ],
    });
  }
  return liste;
}

/* --------------------------------------------------------------- témoins */

function temoins(verbeux: boolean) {
  const dit = (m: string) => verbeux && console.log(`  témoin : ${m}`);

  // 1. Une cible de 20 px doit tomber.
  const petits = ciblesTropPetites('<a style="height:20px;padding:0 10px">x</a>');
  assert.ok(petits.length === 1, "témoin cible 20px : le contrôle ne l'a pas vue");
  dit("une cible de 20 px fait tomber le contrôle des cibles");

  // 2. Un libellé inventé doit tomber : absent de la maquette.
  const invente = "Demander une démonstration";
  assert.ok(!dc.includes(invente), "témoin invention : chaîne choisie trop commune");
  dit("un libellé inventé est vu absent de la maquette");

  // 3. Une paire de contraste faible SANS source maquette doit tomber.
  const rejets = controleContraste([
    { nom: "témoin", texte: BLANC, fond: ORANGE, heriteeDe: "style-qui-n-existe-pas" },
  ]);
  assert.ok(rejets.length === 1, "témoin contraste : la paire sans source est passée");
  dit("une paire faible sans source dans la maquette est rejetée");

  // 4. UNE SECTION QUI PERD SON TEXTE doit tomber. On ampute le rendu de la
  //    démonstration de la section photo + CTA, puis on exige les libellés.
  const demo = renderToStaticMarkup(<DemonstrationConversionMobile />);
  const attendus = [surTitrePhotoCta("standard"), titrePhotoCta("standard")];
  assert.deepEqual(libellesManquants(demo, attendus), [], "démo : libellés déjà absents");
  const ampute = demo.replace(
    new RegExp(`<section id="${ID_PHOTO_CTA}"[\\s\\S]*?</section>`),
    "",
  );
  // Le titre standard vit AUSSI dans le rappel final (la maquette répète la
  // phrase, dc.html L434 et L579) : seul le sur-titre n'existe qu'ici.
  const manquants = libellesManquants(ampute, attendus);
  assert.ok(
    manquants.includes(surTitrePhotoCta("standard")),
    "témoin section amputée : la perte de texte n'est pas vue",
  );
  dit("une section amputée de son texte fait tomber le contrôle de présence");
}

/* ------------------------------------------------------------ exécution */

if (process.argv.includes("--controle")) {
  console.log("mode contrôle : seuls les témoins tournent, rien d'autre n'est tenu");
  temoins(true);
  console.log("les 4 témoins tombent comme attendu : la porte sait échouer");
  process.exit(0);
}

// 1. CHAQUE LIBELLÉ VIENT DE LA MAQUETTE, relue maintenant.
for (const r of rendus()) {
  for (const l of r.libelles) {
    if (l === texteRappelExpress) continue; // composant existant réutilisé
    assert.ok(dansUneMaquette(l), `${r.nom} : « ${l} » est ABSENT de la maquette`);
  }
}
assert.ok(dansUneMaquette(texteRappelExpress), // « Être rappelé dans l'heure »
  "le bouton du panneau réutilisé ne correspond plus à la maquette");

// 2. ET RIEN D'AUTRE : le texte rendu, libellés retirés, ne porte plus une lettre.
for (const r of rendus()) {
  const reste = resteApresLibelles(texteDe(r.html), r.libelles);
  assert.ok(!reste, `${r.nom} : texte rendu hors maquette : « ${reste} »`);
}

// 3. CIBLES TACTILES (SC 2.5.8) sur tous les rendus, démonstration comprise.
assert.ok(
  css.includes("--conversion-barre-hauteur: 58px"),
  "globals.css : la hauteur de barre n'est plus 58px, le contrôle des cibles ment",
);
for (const r of rendus()) {
  assert.deepEqual(ciblesTropPetites(r.html), [], `${r.nom} : cible sous 24px`);
}
assert.deepEqual(
  ciblesTropPetites(renderToStaticMarkup(<DemonstrationConversionMobile />)),
  [],
  "démonstration : cible sous 24px",
);

// 4. CONTRASTE : 4,5:1, ou paire héritée verbatim de la maquette.
assert.deepEqual(controleContraste(PAIRES), [], "contraste insuffisant");

// 5. COPIE : mots interdits, tiret cadratin, montants, délais chiffrés.
for (const r of rendus()) {
  assert.deepEqual(copieFautive(texteDe(r.html)), [], `${r.nom} : copie fautive`);
}

// 6. LA CADENCE est celle de la maquette, et ses formules y sont toujours.
assert.ok(dc.includes("nD === 2"), "maquette : formule du photo + CTA introuvable");
assert.ok(dc.includes("(nD - 2) % 3 === 0"), "maquette : formule du bandeau introuvable");
const insertions = Array.from({ length: 12 }, (_, i) => insertionApresSection(i + 1));
assert.deepEqual(
  insertions,
  [null, "photo", null, null, "bandeau", null, null, "bandeau", null, null, "bandeau", null],
  "cadence : photo après la 2e, bandeau aux 5e, 8e et 11e",
);

// 7. LES ANCRES ET CIBLES de la maquette, et le même numéro de téléphone.
for (const attendu of [CIBLE_CONTACT, CIBLE_POSTULER_MAQUETTE, ANCRE_RAPPEL, ID_PHOTO_CTA, ID_BANDEAU, ID_RAPPEL_FINAL]) {
  assert.ok(dc.includes(attendu), `maquette : « ${attendu} » introuvable`);
}
// L'écart déclaré : la cible carrière vise l'ancre qui existe sur le site.
assert.equal(CIBLE_POSTULER, "/carriere/#postuler", "la cible carrière doit viser #postuler, l'ancre du site");
assert.equal(
  TELEPHONE_SITE.href.replace(/\D/g, "").replace(/^33/, ""),
  (dc.match(/tel:(\d+)/)?.[1] ?? "").replace(/^0/, ""),
  "le numéro de la barre n'est pas celui de la maquette",
);

// 7 bis. LE ROND TÉLÉPHONE DE LA V3 : sans texte, il est nommé par l'aria-label
//    de la maquette, mot pour mot, dans la barre ET dans le photo + CTA.
assert.ok(
  dcV3.includes(`aria-label="${LIBELLE_ROND_TELEPHONE}"`),
  "maquette V3 : le nom du rond téléphone n'y est plus",
);
for (const r of rendus().filter((x) => /^(BarreCollanteMobile|PhotoCtaMobile)/.test(x.nom))) {
  assert.ok(
    r.html.includes(`aria-label="${LIBELLE_ROND_TELEPHONE}"`) && r.html.includes(`href="${TELEPHONE_SITE.href}"`),
    `${r.nom} : le rond téléphone manque, ou il n'appelle pas le numéro du site`,
  );
}

// 8. LES GARDES CSS : mobile seulement, et la barre réserve sa place.
assert.ok(css.includes("@media (min-width: 881px)"), "globals.css : seuil 881px absent");
assert.ok(css.includes("[data-mobile-seulement]"), "globals.css : garde mobile absente");
assert.ok(
  css.includes("body:has([data-barre-collante])"),
  "globals.css : la réserve de la barre collante a disparu, elle recouvrira le pied de page",
);
assert.ok(
  css.includes("env(safe-area-inset-bottom)"),
  "globals.css : la zone de geste n'est plus comptée dans la réserve",
);
const barre = renderToStaticMarkup(<BarreCollanteMobile />);
assert.ok(barre.includes("data-mobile-seulement"), "barre : garde mobile absente");
assert.ok(barre.includes("data-barre-collante"), "barre : attribut de réserve absent");
for (const r of rendus()) {
  assert.ok(r.html.includes("data-mobile-seulement"), `${r.nom} : garde mobile absente`);
}

// 9. PAS DEUX FOIS LE MÊME ID : la maquette suffixe les siens (uid, dc.html
//    L414), la démonstration doit faire pareil avec ses deux bandeaux.
{
  const demo = renderToStaticMarkup(<DemonstrationConversionMobile />);
  const ids = [...demo.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `ids en double : ${ids.join(", ")}`);
}

// 10. LES TÉMOINS : la porte sait échouer.
temoins(false);

console.log(
  `porte conversion mobile : ${rendus().length} rendus tenus, ` +
    `${PAIRES.length} paires de contraste, cadence et gardes CSS conformes, 4 témoins tombent.`,
);
