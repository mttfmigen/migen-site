/**
 * Contrôle des deux pages CAS CLIENTS, sans navigateur.
 *
 *   bun scripts/verifie-casclients.tsx
 *
 * /preuves/, LE HUB (gabarit « 10 Hub de rubrique », `vue: "hub"`), contre sa
 * seule référence, la capture `maquette/rendu/preuves.html` :
 *
 *   1. LA DONNÉE EST LE CORPUS. La fonction `parse` de la maquette elle-même,
 *      relue dans `MigenPreuves.dc.html` à chaque exécution, lit
 *      `maquette/contenu/site/Preuves/preuves.md` ; le contenu doit en être la
 *      copie exacte, à une phrase près, déclarée (Tournaire, règle client).
 *   2. LES PHOTOS ET LES LOGOS, vue par vue, sont ceux que `pvAssign` et
 *      `CLIENT_LOGO` de la maquette choisissent.
 *   3. LE TEXTE VISIBLE du rendu réel est, mot pour mot et dans l'ordre, celui
 *      de la capture (texte normalisé : espaces, apostrophes).
 *   4. LE DESSIN : chaque déclaration de style de la capture se retrouve dans
 *      le rendu, et le rendu n'en invente pas hors d'une liste justifiée.
 *   5. Les interdits de copie, le H1 unique, les 41 fiches liées.
 *   6. LE CONTRÔLE SAIT ÉCHOUER : chaque comparaison est rejouée sur une
 *      faute injectée, et doit la voir. Sans quoi il s'arrête.
 *
 * /realisations/, page sur mesure de « Site final » servie par le gabarit
 * historique : contrat de forme, inchangé.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageCasClients from "@/components/site/casclients/PageCasClients";
import { vuesPreuves } from "@/components/site/casclients/vues-preuves";
import {
  estCasClients,
  estHubPreuves,
  type ContenuCasClients,
  type ContenuHubPreuves,
} from "@/types/casclients";

const CHEMIN = "supabase/import/casclients-analyse.json";

interface Analyse {
  url: string;
  titre_h1?: string;
  contenu: ContenuCasClients | ContenuHubPreuves;
}

/** Interdits de copie du contrat (CLAUDE.md §9, README de passation). */
const INTERDITS =
  /\b(r[ée]gie|int[ée]rim|mise à disposition|sans engagement|cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez|teamtailor)\b|—|\b5 agences\b|\b(?:clients|80)\s+r[ée]guliers\b|\b24 ?h\b|7 ?j ?\/ ?7|\bprix\b/i;
/** Un délai d'intervention chiffré : « en 24 h », « sous 48 heures », « en 2 jours ». */
const DELAI_CHIFFRE = /\b(en|sous) (moins de )?\d+ ?(h|heures?|jours?|min(utes)?)\b/i;

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;

function chaines(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(chaines);
  if (v && typeof v === "object") return Object.values(v).flatMap(chaines);
  return [];
}

/* ---------------------------------------------------------------- outils */

function entites(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Texte comparable : espaces simples, apostrophe droite (piège n° 3). */
function normaliseTexte(s: string): string {
  return entites(s)
    .replace(/ | /g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Le HTML sans ses blocs `hidden` : ce que l'œil voit. Les vues masquées du
 * filtre sont des `<div hidden="">`, refermés au même niveau de `div`.
 */
function sansMasques(html: string): string {
  let sortie = html;
  for (;;) {
    const debut = sortie.indexOf('<div hidden=""');
    if (debut < 0) return sortie;
    const balise = /<(\/?)div\b[^>]*>/g;
    balise.lastIndex = debut;
    let profondeur = 0;
    let fin = -1;
    for (let m = balise.exec(sortie); m; m = balise.exec(sortie)) {
      profondeur += m[1] ? -1 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    assert.ok(fin > debut, "bloc masqué non refermé");
    sortie = sortie.slice(0, debut) + sortie.slice(fin);
  }
}

function mots(html: string): string[] {
  return normaliseTexte(
    sansMasques(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, " "),
  ).split(" ");
}

/** Les écarts de texte, mot à mot : vide si identiques. */
function ecartsTexte(attendu: string[], rendu: string[]): string[] {
  const n = Math.max(attendu.length, rendu.length);
  for (let i = 0; i < n; i += 1) {
    if (attendu[i] !== rendu[i]) {
      return [
        `mot ${i} : capture « ${attendu.slice(Math.max(0, i - 6), i + 6).join(" ")} »`,
        `        rendu   « ${rendu.slice(Math.max(0, i - 6), i + 6).join(" ")} »`,
      ];
    }
  }
  return [];
}

function hexEnRgb(v: string): string {
  return v.replace(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi, (_, h: string) => {
    const x = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    return `rgb(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)})`;
  });
}

/** Une déclaration ramenée à une écriture commune aux deux côtés. */
function normaliseDeclaration(d: string): string | null {
  const i = d.indexOf(":");
  if (i < 0) return null;
  const propriete = d.slice(0, i).trim().toLowerCase();
  let valeur = hexEnRgb(d.slice(i + 1).trim())
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1")
    .replace(/\s+/g, " ");
  // Chrome sérialise l'ombre couleur en tête ; la source l'écrit en queue.
  if (propriete === "box-shadow") {
    const m = valeur.match(/^(.*?) (rgba?\([^)]*\))$/);
    if (m) valeur = `${m[2]} ${m[1]}`;
  }
  return valeur ? `${propriete}:${valeur}` : null;
}

function declarations(html: string): Set<string> {
  const out = new Set<string>();
  for (const m of html.matchAll(/style="([^"]*)"/g)) {
    for (const d of entites(m[1]).split(/;(?![^(]*\))/)) {
      const n = normaliseDeclaration(d);
      if (n) out.add(n);
    }
  }
  return out;
}

/**
 * Ce que le rendu porte en plus de la capture, et pourquoi c'est juste.
 * `next/image` écrit lui-même la position de l'image remplissante.
 */
const DECLARATIONS_JUSTIFIEES = new Set([
  "color:transparent", // next/image
  "left:0",
  "top:0",
  "right:0",
  "bottom:0", // next/image, l'équivalent de `inset:0` de la capture
  "-webkit-backdrop-filter:blur(16px)", // écrit par la maquette, que Chrome ne resérialise pas
  "padding-top:62px", // l'enveloppe de la capture, portée par <main>
]);

/* -------------------------------------------------------------- les pages */

const analyses = JSON.parse(readFileSync(CHEMIN, "utf8")) as Analyse[];
assert.equal(analyses.length, 2, "deux pages attendues : /preuves/ et /realisations/");
const hub = analyses.find((a) => a.url === "/preuves/");
const realisations = analyses.find((a) => a.url === "/realisations/");
assert.ok(hub && realisations, "/preuves/ et /realisations/ attendues");

/* ============================================================== /preuves/ */

assert.ok(estCasClients(hub.contenu), "/preuves/ : la route doit la reconnaître (gabarit casclients)");
assert.ok(estHubPreuves(hub.contenu), "/preuves/ : vue hub attendue");
const contenuHub = hub.contenu;

const INDEX = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8")) as {
  url: string;
  h1: string;
  gabarit: string;
}[];
const ficheIndex = INDEX.find((p) => p.url === "/preuves/");
assert.ok(ficheIndex, "/preuves/ absente de l'index de la maquette");
assert.equal(ficheIndex.gabarit, "10 Hub de rubrique");
assert.equal(hub.titre_h1, ficheIndex.h1, "le H1 du contenu est celui de l'index");
const RENDU_JSON = JSON.parse(readFileSync("maquette/rendu/preuves.json", "utf8")) as {
  h1Rendu: string;
};
assert.equal(hub.titre_h1, RENDU_JSON.h1Rendu, "le H1 du contenu est celui de la capture");

/* --- 1. la donnée contre le corpus, lue par la logique de la maquette ----- */

const SOURCE_MAQUETTE = readFileSync(
  "design_handoff_migen_site/maquette/MigenPreuves.dc.html",
  "utf8",
);
const debutLogique = SOURCE_MAQUETTE.indexOf("const CLIENT_LOGO");
const finLogique = SOURCE_MAQUETTE.indexOf("class Component extends DCLogic");
assert.ok(debutLogique > 0 && finLogique > debutLogique, "logique de MigenPreuves introuvable");

interface CasMaquette {
  client: string;
  subject: string;
  url: string;
  sum: string;
}
interface LogiqueMaquette {
  parse(md: string): {
    h1: string;
    punch: string;
    intro: string;
    cats: { t: string; besoin: string; items: CasMaquette[] }[];
    latest: Record<string, number>;
  };
  SHORT(t: string): string;
  pvAssign(liste: { url: string }[]): string[];
  CLIENT_LOGO(client: string): string;
}
// La maquette du client, exécutée telle quelle : c'est elle qui fait foi.
const maquette = new Function(
  `${SOURCE_MAQUETTE.slice(debutLogique, finLogique)}
   return { parse, SHORT, pvAssign, CLIENT_LOGO };`,
)() as LogiqueMaquette;

const corpus = maquette.parse(
  readFileSync("maquette/contenu/site/Preuves/preuves.md", "utf8"),
);
assert.equal(corpus.h1, hub.titre_h1, "H1 du corpus");

/** La seule reformulation admise par le client (passation, 08/10). */
const REFORMULATIONS: Record<string, string> = {
  "Maintenir des machines conçues sur mesure": "Maintenir des machines conçues en interne",
};

function attenduDuCorpus(): ContenuHubPreuves {
  return {
    gabarit: "casclients",
    vue: "hub",
    accroche: corpus.punch,
    intro: corpus.intro,
    categories: corpus.cats.map((c) => ({
      libelle: maquette.SHORT(c.t),
      besoin: c.besoin,
      cas: c.items.map((it) => ({
        client: it.client,
        sujet: REFORMULATIONS[it.subject] ?? it.subject,
        resume: it.sum,
        url: it.url,
      })),
    })),
    recents: Object.keys(corpus.latest),
  };
}
assert.deepEqual(contenuHub, attenduDuCorpus(), "/preuves/ : le contenu n'est plus la copie du corpus");

/* --- 2. photos et logos, vue par vue ------------------------------------ */

const vues = vuesPreuves(contenuHub);
const tousCorpus = corpus.cats.flatMap((c, ci) => c.items.map((it) => ({ ...it, ci })));
const listesMaquette = [
  tousCorpus,
  ...corpus.cats.map((_, ci) => tousCorpus.filter((x) => x.ci === ci)),
];
assert.equal(vues.length, listesMaquette.length, "une vue par onglet");
const nomFichier = (p: string) => p.split("/").pop();
for (const [v, liste] of listesMaquette.entries()) {
  const images = maquette.pvAssign(liste);
  const cartes = [...vues[v].une, ...vues[v].grille];
  assert.equal(cartes.length, liste.length, `vue ${vues[v].libelle} : nombre de cartes`);
  for (const [i, carte] of cartes.entries()) {
    assert.equal(carte.url, liste[i].url, `vue ${vues[v].libelle}, carte ${i} : ordre`);
    assert.equal(nomFichier(carte.photo), nomFichier(images[i]), `vue ${vues[v].libelle}, ${carte.url} : photo`);
    const logo = maquette.CLIENT_LOGO(liste[i].client);
    assert.equal(carte.logo, logo ? `/${logo}` : "", `${carte.url} : logo`);
    if (carte.logo) assert.ok(existsSync(`public${carte.logo}`), `public${carte.logo} introuvable`);
    assert.ok(existsSync(`public${carte.photo}`), `public${carte.photo} introuvable`);
  }
}

/* --- 3 et 4. le rendu réel contre la capture ----------------------------- */

const CAPTURE = readFileSync("maquette/rendu/preuves.html", "utf8");
const debutCapture = CAPTURE.indexOf('data-screen-label="/preuves/"');
const finCapture = CAPTURE.indexOf("<footer", debutCapture);
assert.ok(debutCapture > 0 && finCapture > debutCapture, "bloc /preuves/ introuvable dans la capture");
const BLOC = CAPTURE.slice(CAPTURE.lastIndexOf("<div", debutCapture), finCapture);

const rendu = renderToStaticMarkup(
  <PageCasClients titre={hub.titre_h1 ?? ""} contenu={contenuHub} />,
);

const MOTS_CAPTURE = mots(BLOC);
const STYLES_CAPTURE = declarations(BLOC);

function ecartsStyle(html: string): { manquantes: string[]; inventees: string[] } {
  const d = declarations(html);
  return {
    manquantes: [...STYLES_CAPTURE].filter((x) => !d.has(x)),
    inventees: [...d].filter((x) => !STYLES_CAPTURE.has(x) && !DECLARATIONS_JUSTIFIEES.has(x)),
  };
}

/* 6. Le contrôle sait-il échouer ? Chaque faute doit être vue. */
const fauteTexte = rendu.replace("Lire l’étude", "Lire l’etude");
assert.notEqual(fauteTexte, rendu, "faute de texte non injectée");
assert.ok(ecartsTexte(MOTS_CAPTURE, mots(fauteTexte)).length > 0, "le contrôle de texte ne voit pas une faute");
const fauteOrdre = rendu.replace("Récent", "Recent");
assert.ok(ecartsTexte(MOTS_CAPTURE, mots(fauteOrdre)).length > 0, "le contrôle de texte ne voit pas un accent perdu");
const fauteStyle = rendu.replaceAll("padding:9px 14px", "padding:9px 15px");
assert.notEqual(fauteStyle, rendu, "faute de style non injectée");
const e = ecartsStyle(fauteStyle);
assert.ok(e.manquantes.length > 0 && e.inventees.length > 0, "le contrôle de dessin ne voit pas une faute");
const copie = structuredClone(contenuHub);
copie.categories[0].cas[0].sujet += ".";
assert.throws(() => assert.deepEqual(copie, attenduDuCorpus()), "le contrôle de donnée ne voit pas une faute");

const ecarts = ecartsTexte(MOTS_CAPTURE, mots(rendu));
assert.deepEqual(ecarts, [], `/preuves/ : le texte visible n'est pas celui de la capture\n${ecarts.join("\n")}`);
const styles = ecartsStyle(rendu);
assert.deepEqual(styles.manquantes, [], "/preuves/ : déclarations de la capture absentes du rendu");
assert.deepEqual(styles.inventees, [], "/preuves/ : déclarations du rendu absentes de la capture");

/* --- 5. structure et interdits ------------------------------------------- */

assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "/preuves/ : un seul H1");
const fiches = new Set(INDEX.filter((p) => p.gabarit === "02 Étude de cas").map((p) => p.url));
const urlsHub = contenuHub.categories.flatMap((c) => c.cas.map((x) => x.url));
assert.equal(urlsHub.length, 41, "41 études de cas");
for (const url of urlsHub) {
  assert.ok(fiches.has(url), `${url} : pas une étude de cas de l'index`);
  // Hors de Next, `next/link` retire le slash final que `trailingSlash: true`
  // rétablit au service (même tolérance que verification-offre.tsx).
  const lie = [url, url.replace(/\/$/, "")].some((h) => rendu.includes(`href="${h}"`));
  assert.ok(lie, `${url} : la fiche n'est pas liée dans le HTML servi`);
}
assert.ok(!/href="#"/.test(rendu), "aucun lien vide");
for (const s of [...chaines(contenuHub), mots(rendu).join(" ")]) {
  assert.ok(!INTERDITS.test(s), `/preuves/ : interdit de copie dans « ${s.slice(0, 120)} »`);
  assert.ok(!DELAI_CHIFFRE.test(s), `/preuves/ : délai chiffré dans « ${s.slice(0, 120)} »`);
}

console.log(
  `/preuves/ : ${MOTS_CAPTURE.length} mots identiques à la capture, ${STYLES_CAPTURE.size} déclarations de dessin retrouvées, ` +
    `${vues.length} vues conformes à la logique de la maquette, ${urlsHub.length} fiches liées. Fautes injectées : toutes vues.`,
);

/* ========================================================= /realisations/ */

{
  const ou = realisations.url;
  const contenu = realisations.contenu;
  assert.ok(estCasClients(contenu) && !estHubPreuves(contenu), `${ou} : gabarit historique attendu`);
  const inventaire = new Map(
    (
      JSON.parse(readFileSync("docs/urls-site-actuel.json", "utf8")) as { url: string; h1: string }[]
    ).map((p) => [p.url, p.h1]),
  );
  assert.ok(inventaire.has(ou), `${ou} : absent de l'inventaire des URL`);
  assert.ok(estChaine(contenu.chapeau), `${ou}.chapeau : chaîne non vide attendue`);

  const chiffres = contenu.chiffres;
  assert.ok(chiffres, `${ou}.chiffres : attendu`);
  assert.ok(estChaine(chiffres.principal.valeur), `${ou}.chiffres.principal.valeur`);
  assert.ok(estChaine(chiffres.principal.libelle), `${ou}.chiffres.principal.libelle`);
  assert.ok((chiffres.cartes ?? []).length <= 2, `${ou}.chiffres.cartes : deux au plus`);
  assert.equal((chiffres.duo ?? []).length, 2, `${ou}.chiffres.duo : deux chiffres attendus`);

  const chantiers = contenu.chantiers ?? [];
  assert.ok(chantiers.length > 0, `${ou}.chantiers : au moins un`);
  for (const [i, ch] of chantiers.entries()) {
    const o = `${ou}.chantiers[${i}]`;
    assert.ok(estChaine(ch.client) && estChaine(ch.titre), `${o} : client et titre`);
    if (ch.href !== undefined) {
      assert.ok(fiches.has(ch.href), `${o}.href : ${ch.href} n'est pas une étude de cas de l'index`);
    }
    if (ch.image !== undefined) {
      assert.ok(existsSync(`public${ch.image}`), `${o}.image : public${ch.image} introuvable`);
    }
  }
  if (contenu.titreChantiers === undefined) {
    assert.equal(chantiers.length, 6, `${ou} : six chantiers, ou un titreChantiers corrigé`);
  }
  for (const s of chaines(contenu)) {
    assert.ok(!INTERDITS.test(s), `${ou} : interdit de copie dans « ${s} »`);
    assert.ok(!DELAI_CHIFFRE.test(s), `${ou} : délai chiffré dans « ${s} »`);
  }
  const html = renderToStaticMarkup(
    <PageCasClients titre={inventaire.get(ou) ?? ou} contenu={contenu} />,
  );
  assert.equal((html.match(/<h1/g) ?? []).length, 1, `${ou} : un seul H1`);
  assert.ok(html.includes('href="#cas"') && html.includes('id="cas"'), `${ou} : ancre des chantiers`);
  assert.ok(!html.includes("Preuves : nos réalisations"), `${ou} : le hub ne s'invite pas ici`);
  console.log(`${ou} : gabarit historique, ${chantiers.length} chantiers, contrat respecté.`);
}

console.log("Contrôle CAS CLIENTS : passé.");
