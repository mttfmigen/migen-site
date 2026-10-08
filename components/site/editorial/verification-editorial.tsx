/**
 * Contrôle des huit pages de `/ressources/` et `/guides/` portées contre leurs
 * captures, sans navigateur.
 *
 *   bun components/site/editorial/verification-editorial.tsx
 *
 * LA RÉFÉRENCE : `maquette/rendu/<clé>.html`, relue à chaque exécution. La
 * page est rendue depuis SA donnée de relais
 * (`supabase/import/gabarits-maquette/<nom>.json`), celle que la route sert.
 *
 * CE QUI EST GARANTI, section par section (même nombre de sections) :
 *  1. LE TEXTE, mot pour mot (forme normalisée), aux phrases retirées près :
 *     celles que le contrat de copie interdit, listées dans la donnée
 *     (`phrases_retirees`), et dont on vérifie l'ABSENCE du rendu ;
 *  2. LE DESSIN : chaque élément stylé de la capture a son jumeau, dans le
 *     même ordre, avec les mêmes déclarations (sérialisation normalisée) ;
 *  3. un seul H1, aucun `href="#"`, aucune cible hors domaine, aucun interdit
 *     de copie ;
 *  4. le relais forcé des deux sous-rubriques que la base masque.
 * Puis LA PREUVE QU'IL SAIT ÉCHOUER : cinq fautes injectées, chacune doit
 * être vue.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuEditorial } from "@/types/editorial";

import PageEditoriale from "./PageEditoriale";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

const PAGES = [
  "/ressources/",
  "/ressources/articles/",
  "/ressources/fiches-pratiques/",
  "/ressources/fiches-techniques/",
  "/ressources/livres-blancs/",
  "/ressources/process/",
  "/guides/choisir-une-entreprise-de-maintenance/",
  "/guides/reussir-un-transfert-industriel/",
];

interface Relais {
  url: string;
  titre_h1: string;
  phrases_retirees: string[];
  contenu: ContenuEditorial;
}

/* ------------------------------------------------- un arbre HTML minimal */

interface Noeud {
  balise: string;
  attrs: Record<string, string>;
  enfants: (Noeud | string)[];
}

const VIDES = new Set(["img", "input", "br", "hr", "meta", "link", "source"]);

function decode(t: string): string {
  return t
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Le HTML sérialisé de la capture et celui de React sont bien formés : un tokeniseur suffit. */
function arbre(html: string): Noeud {
  const racine: Noeud = { balise: "#", attrs: {}, enfants: [] };
  const pile = [racine];
  const propre = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[\s\S]*?<\/\1>/g, "");
  for (const m of propre.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g)) {
    const haut = pile[pile.length - 1];
    if (m[4] !== undefined) {
      haut.enfants.push(decode(m[4]));
      continue;
    }
    const balise = m[2].toLowerCase();
    if (m[1]) {
      const i = pile.map((n) => n.balise).lastIndexOf(balise);
      if (i > 0) pile.length = i;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of m[3].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? "");
    const n: Noeud = { balise, attrs, enfants: [] };
    haut.enfants.push(n);
    if (!VIDES.has(balise) && !m[3].trim().endsWith("/")) pile.push(n);
  }
  return racine;
}

function descendants(n: Noeud, garde: (x: Noeud) => boolean = () => true): Noeud[] {
  const out: Noeud[] = [];
  for (const e of n.enfants) {
    if (typeof e === "string") continue;
    if (garde(e)) out.push(e);
    out.push(...descendants(e, garde));
  }
  return out;
}

function texte(n: Noeud): string {
  return n.enfants.map((e) => (typeof e === "string" ? e : texte(e))).join(" ");
}

/** Forme de comparaison du texte : sans espace du tout, apostrophes droites. */
const compact = (t: string) => t.replace(/[’‘]/g, "'").replace(/\s+/g, "");

/** Le texte lisible d'une phrase de la donnée, balisage du corpus retiré. */
const lisible = (t: string) => t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

/**
 * La capture sans les éléments qui ne portaient QU'UNE phrase retirée (une
 * puce, le texte d'une carte) : le site ne les rend pas, c'est voulu.
 */
function sansRetraits(n: Noeud, phrases: string[]): Noeud {
  const cibles = phrases.map((p) => compact(lisible(p)));
  const filtre = (x: Noeud): Noeud => ({
    ...x,
    enfants: x.enfants
      .filter((e) => typeof e === "string" || !cibles.includes(compact(texte(e)).replace(/^✓/, "")))
      .map((e) => (typeof e === "string" ? e : filtre(e))),
  });
  return filtre(n);
}

/* ------------------------------------------------------ les styles */

function hex(r: string, g: string, b: string): string {
  return `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`;
}

/** Coupe sur un séparateur hors parenthèses. */
function coupe(t: string, sep: string): string[] {
  const out: string[] = [];
  let prof = 0;
  let cour = "";
  for (const c of t) {
    if (c === "(") prof += 1;
    if (c === ")") prof -= 1;
    if (c === sep && prof === 0) {
      out.push(cour);
      cour = "";
    } else cour += c;
  }
  out.push(cour);
  return out;
}

/**
 * Une déclaration ramenée à une écriture commune. La capture est une
 * sérialisation du DOM (`0px`, `0.9fr`, `rgb(255, 255, 255)`, `flex: 0 0
 * auto`, ombre couleur en tête), React écrit ce qu'on lui donne.
 */
function valeur(prop: string, v: string): string {
  let x = v
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1")
    .replace(/rgb\((\d+),(\d+),(\d+)\)/g, (_, r, g, b) => hex(r, g, b))
    .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/gi, "#$1$1$2$2$3$3")
    .toLowerCase();
  if (prop === "flex") x = x === "none" ? "0 0 auto" : x === "1" ? "1 1 0%" : x;
  if (prop === "box-shadow") {
    x = coupe(x, ",")
      .map((ombre) => {
        const mots = coupe(ombre.trim(), " ");
        const couleur = mots.filter((m) => /^(rgba?\(|#)/.test(m));
        return [...mots.filter((m) => !couleur.includes(m)), ...couleur].join(" ");
      })
      .join(",");
  }
  return x;
}

function declarations(style: string): Set<string> {
  const out = new Set<string>();
  for (const d of coupe(style, ";")) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    const prop = d.slice(0, i).trim().toLowerCase();
    if (!prop || prop.startsWith("-webkit-")) continue;
    out.add(`${prop}:${valeur(prop, d.slice(i + 1))}`);
  }
  // `border-top: none` sérialisé par le navigateur en ses trois longues.
  for (const cote of ["border-top", "border-bottom", "border"]) {
    const longues = [`${cote}-width:medium`, `${cote}-style:none`, `${cote}-color:currentcolor`];
    if (longues.every((l) => out.has(l))) {
      for (const l of longues) out.delete(l);
      out.add(`${cote}:none`);
    }
  }
  return out;
}

/** Ajout toléré sur le site : `next/image` en `fill` exige un parent positionné. */
const TOLERES = new Set(["position:relative"]);

function memeDessin(capture: Set<string>, site: Set<string>): boolean {
  for (const d of capture) if (!site.has(d)) return false;
  for (const d of site) if (!capture.has(d) && !TOLERES.has(d)) return false;
  return true;
}

/**
 * Les éléments stylés de la capture que l'on compare. Écartés, et pourquoi :
 * les images (balise `img` côté capture, `next/image` côté site, même cadrage
 * vérifié à l'œil et au pixel) et le fond photo de la maquette ; les liens et
 * le gras DANS le texte, que `TexteRiche` rend nus et que la feuille de style
 * habille (`.riche`, `.chapo`…) ; l'intérieur du panneau de formulaire, qui
 * est le formulaire partagé `FormulaireContact`.
 */
function styles(section: Noeud, cote: "capture" | "site"): Noeud[] {
  const horsFormulaire = (n: Noeud): Noeud[] => {
    const out: Noeud[] = [];
    for (const e of n.enfants) {
      if (typeof e === "string") continue;
      const st = e.attrs.style ?? "";
      const panneauFormulaire = st.replace(/\s/g, "").includes("padding:32px34px34px");
      if (e.balise === "form") continue;
      if (st && e.balise !== "img" && e.balise !== "input" && !st.includes("url(")) {
        const lienTexte = cote === "capture" && e.balise === "a" && st.includes("text-decoration");
        if (e.balise !== "strong" && !lienTexte) out.push(e);
      }
      if (!panneauFormulaire) out.push(...horsFormulaire(e));
    }
    return out;
  };
  return horsFormulaire(section);
}

/* -------------------------------------------- la comparaison d'une page */

const INTERDITS: RegExp[] = [
  /—/,
  /24 ?h\b/i,
  /7 ?j ?\/ ?7/i,
  /\brégie\b/i,
  /intérim/i,
  /mise à disposition/i,
  /sur mesure/i,
  /sans engagement/i,
  /notamment/i,
  /\blevier/i,
  /clé en main/i,
  /concrètement/i,
  /incontournable/i,
  /découvrez/i,
  /clients[^.]{0,30}réguliers|réguliers[^.]{0,10}clients/i,
  /Limonest/,
  /Teamtailor/i,
  /\d\s?%\s+des\s+candidats/i,
  /agences?\b[^.]{0,40}\ben France|en France[^.]{0,40}\bagences?\b/i,
];

/** Les écarts du formulaire partagé, déclarés dans `offre/PanneauFormulaire.tsx`. */
function sansEcartsFormulaire(html: string): string {
  return html.replace(/<form\b[\s\S]*?<\/form>/g, (form) =>
    form
      .replace(/<div aria-hidden="true"[^>]*><label[^>]*>Site web<\/label>[\s\S]*?<\/div>/g, "")
      .replace(/<p[^>]*>Données traitées par Migen[\s\S]*?<\/p>/g, ""),
  );
}

function sectionsDe(html: string): Noeud[] {
  const racine = arbre(html);
  const main = descendants(racine, (n) => n.balise === "main")[0];
  return descendants(main ?? racine, (n) => n.balise === "section");
}

function rend(relais: Relais): string {
  return renderToStaticMarkup(<PageEditoriale titre={relais.titre_h1} contenu={relais.contenu} />);
}

function controle(relais: Relais, capture: string, htmlBrut: string): string[] {
  const ecarts: string[] = [];
  const html = sansEcartsFormulaire(htmlBrut);
  const ref = sectionsDe(capture).map((n) => sansRetraits(n, relais.phrases_retirees));
  const site = sectionsDe(html);
  if (ref.length !== site.length) ecarts.push(`${site.length} sections rendues, ${ref.length} dans la capture`);

  ref.forEach((sr, i) => {
    const ss = site[i];
    if (!ss) return;
    // Les sections imbriquées se comparent chacune pour elle-même : le texte
    // et le dessin d'une section contenante ne regardent que ses propres nœuds.
    const sansImbriquees = (n: Noeud): Noeud => ({
      ...n,
      enfants: n.enfants.map((e) =>
        typeof e === "string" ? e : e.balise === "section" ? "" : sansImbriquees(e),
      ),
    });
    let attendu = compact(texte(sansImbriquees(sr)));
    for (const p of relais.phrases_retirees) attendu = attendu.replace(compact(lisible(p)), "");
    const obtenu = compact(texte(sansImbriquees(ss)));
    if (attendu !== obtenu) {
      let k = 0;
      while (k < attendu.length && attendu[k] === obtenu[k]) k += 1;
      ecarts.push(
        `section ${i} : texte différent à « ${attendu.slice(Math.max(0, k - 30), k + 40)} » / rendu « ${obtenu.slice(Math.max(0, k - 30), k + 40)} »`,
      );
    }

    const eltsSite = styles(sansImbriquees(ss), "site").map((n) => declarations(n.attrs.style));
    let curseur = 0;
    for (const n of styles(sansImbriquees(sr), "capture")) {
      const voulu = declarations(n.attrs.style);
      let j = curseur;
      while (j < eltsSite.length && !memeDessin(voulu, eltsSite[j])) j += 1;
      if (j === eltsSite.length) {
        ecarts.push(`section ${i} : dessin absent du rendu <${n.balise} style="${n.attrs.style}">`);
        break;
      }
      curseur = j + 1;
    }
  });

  if ((htmlBrut.match(/<h1\b/g) ?? []).length !== 1) ecarts.push("H1 absent ou en double");
  if (/href="#"/.test(htmlBrut)) ecarts.push('lien mort href="#"');
  for (const m of htmlBrut.matchAll(/href="([^"]*)"/g)) {
    const h = m[1];
    if (!/^(\/(?!\/)|#[a-z]|tel:\+33)/.test(h)) ecarts.push(`cible hors domaine : ${h}`);
  }
  const lu = decode(htmlBrut.replace(/<[^>]+>/g, " "));
  for (const motif of INTERDITS) {
    const m = lu.match(motif);
    if (m) ecarts.push(`interdit rendu : « ${m[0]} »`);
  }
  for (const p of relais.phrases_retirees) {
    if (compact(lu).includes(compact(lisible(p)))) ecarts.push(`phrase retirée pourtant rendue : « ${p.slice(0, 50)} »`);
  }
  return ecarts;
}

/* ------------------------------------------------------------ les pages */

const nomDe = (url: string) => url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
const cleDe = (url: string) => url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
const lisRelais = (url: string): Relais =>
  JSON.parse(readFileSync(join(RACINE, "supabase", "import", "gabarits-maquette", `${nomDe(url)}.json`), "utf8"));
/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const lisCapture = (url: string) =>
  appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", `${cleDe(url)}.html`), "utf8"));

let echecs = 0;
for (const url of PAGES) {
  const relais = lisRelais(url);
  assert.equal(relais.url, url);
  const ecarts = controle(relais, lisCapture(url), rend(relais));
  if (ecarts.length) {
    echecs += 1;
    console.log(`✗ ${url}\n  ${ecarts.join("\n  ")}`);
  } else console.log(`✓ ${url}`);
}

/* Le relais forcé : la base sert ces deux pages avec un ancien contenu
   éditorial sans vue ; c'est quand même le dessin de la capture qui sort.
   Depuis le 08/10, ce n'est plus `PageEditoriale` qui tranche mais
   `lib/contenu.ts` : « le fichier gagne toujours », son relais remplace le
   contenu de la base. Prouvé aux deux bouts : la règle est celle du module,
   l'ancien corps seul ne donne pas le dessin de la capture, le relais si. */
const MODULE_CONTENU = readFileSync(join(RACINE, "lib", "contenu.ts"), "utf8");
assert.match(MODULE_CONTENU, /const relaisActif = !!surDisque;/, "relais forcé : lib/contenu.ts ne fait plus gagner le fichier dès qu'il existe");
assert.match(MODULE_CONTENU, /relaisActif \? surDisque\.contenu : page\.contenu/, "relais forcé : lib/contenu.ts ne sert plus le contenu du fichier");
for (const url of ["/ressources/fiches-pratiques/", "/ressources/fiches-techniques/"]) {
  const relais = lisRelais(url);
  const ancien = renderToStaticMarkup(
    <PageEditoriale
      titre={relais.titre_h1}
      contenu={{ gabarit: "editorial", blocs: [{ type: "paragraphe", texte: "Ancien corps en base." }] }}
    />,
  );
  assert.ok(!ancien.includes("Ressources · rayons"), `relais forcé : ${url}, l'ancien corps ne porte pas la vue`);
  assert.ok(relais.contenu.rubrique, `relais forcé : ${url}, le relais n'a pas sa vue de rubrique`);
  const servi = rend(relais);
  assert.ok(servi.includes("Ressources · rayons") && !servi.includes("Ancien corps"), `relais forcé : ${url}`);
}
// Et une page éditoriale ordinaire garde sa colonne de lecture.
const ordinaire = renderToStaticMarkup(
  <PageEditoriale titre="Une fiche métier" contenu={{ gabarit: "editorial", blocs: [{ type: "paragraphe", texte: "Corps." }] }} />,
);
assert.ok(ordinaire.includes("Corps.") && !ordinaire.includes("cx-form"), "page éditoriale ordinaire");

/* --------------------------------------- la preuve qu'il sait échouer */

const pilote = lisRelais("/guides/choisir-une-entreprise-de-maintenance/");
const capturePilote = lisCapture(pilote.url);
const rubrique = lisRelais("/ressources/fiches-pratiques/");
const captureRubrique = lisCapture(rubrique.url);

function altere(r: Relais, modifie: (c: ContenuEditorial) => void): Relais {
  const copie = structuredClone(r);
  modifie(copie.contenu);
  return copie;
}

const FAUTES: [string, string[], RegExp][] = [
  [
    "un mot changé",
    controle(
      pilote,
      capturePilote,
      rend(altere(pilote, (c) => void (c.edito!.chapeau = c.edito!.chapeau.replace("rarement", "souvent")))),
    ),
    /texte différent/,
  ],
  [
    "une section retirée",
    controle(pilote, capturePilote, rend(altere(pilote, (c) => void c.edito!.sections.pop()))),
    /sections rendues/,
  ],
  [
    "un style changé",
    controle(rubrique, captureRubrique, rend(rubrique).replace("gap:52px", "gap:50px")),
    /dessin absent/,
  ],
  [
    "une phrase interdite réintroduite",
    controle(
      lisRelais("/ressources/"),
      lisCapture("/ressources/"),
      rend(
        altere(lisRelais("/ressources/"), (c) => {
          const b = c.edito!.sections[6].blocs[7];
          const reguliers = lisRelais("/ressources/").phrases_retirees.find((p) => p.includes("réguliers"));
          if (b.type === "p") b.texte = `${reguliers}${b.texte}`;
        }),
      ),
    ),
    /interdit rendu|phrase retirée pourtant rendue/,
  ],
  [
    "un lien mort",
    controle(rubrique, captureRubrique, rend(rubrique).replace('href="tel:+33478337205"', 'href="#"')),
    /lien mort/,
  ],
];

for (const [nom, ecarts, attendu] of FAUTES) {
  assert.ok(
    ecarts.some((e) => attendu.test(e)),
    `faute « ${nom} » NON vue : ${ecarts.join(" | ") || "aucun écart"}`,
  );
  console.log(`✓ faute vue : ${nom}`);
}

if (echecs) {
  console.log(`\n${echecs} page(s) non conforme(s) à leur capture`);
  process.exit(1);
}
console.log(`\n${PAGES.length} pages conformes à leur capture, ${FAUTES.length} fautes injectées toutes vues`);
