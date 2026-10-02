/**
 * Contrôle du contenu d'une page IMPLANTATIONS contre `types/implantations.ts`,
 * contre l'inventaire des URL et contre les interdits de copie, puis du SQL
 * découpé qui le porte.
 *
 *   bun scripts/verifie-implantations.tsx [supabase/import/gabarits/implantations.json]
 *
 * Même raison d'être que `verifie-contenu.ts` : le contenu part dans un `jsonb`,
 * et rien entre le JSON composé à la main et le composant qui le lit ne vérifie
 * qu'ils parlent de la même forme. Une clé mal orthographiée (`adresse` pour
 * `adresses`) ne lève aucune erreur : le gabarit ne rend rien, en silence.
 *
 * Le SQL est REJOUÉ ici, sans base : la première instruction pose le socle, les
 * suivantes allongent un tableau. Le résultat doit être identique au JSON
 * source, sinon la découpe a perdu ou dupliqué quelque chose.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageImplantations from "@/components/site/implantations/PageImplantations";
import { estImplantations } from "@/types/implantations";

const SOURCE = process.argv[2] ?? "supabase/import/gabarits/implantations.json";
const INVENTAIRE = "docs/urls-site-actuel.json";
const PLAFOND = 3800; // octets par instruction, comme `scripts/decoupe_sql.py`

// Les interdits de copie de `docs/CONTRAT-PORTAGE-MAQUETTE.md`.
const INTERDITS = [
  /\b(r[ée]gie|int[ée]rim|mise à disposition|sans engagement)\b/i,
  /\b(cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez)\b/i,
  /\b(5|cinq)\s+agences/i,
  /\+\s?200|\b200\s+clients/i,
  /[—–]/, // tiret cadratin, demi-cadratin
  // Un délai chiffré : « 2 h de route », « 4 heures », « 48 h », « 2 jours ».
  // Seul « 1 h » (le rappel) est toléré, contrôlé à part plus bas.
  /\b\d+\s*(h|heures?|min|minutes?|jours?)\b/i,
];
const DELAI_TOLERE = new Set(["1 h", "1 h"]);

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const estObjet = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

function clesConnues(o: Record<string, unknown>, permises: string[], ou: string) {
  for (const k of Object.keys(o)) {
    assert.ok(permises.includes(k), `${ou} : clé « ${k} » inconnue du type (${permises.join(", ")})`);
  }
}
function chaineOptionnelle(o: Record<string, unknown>, k: string, ou: string) {
  if (o[k] !== undefined) assert.ok(estChaine(o[k]), `${ou}.${k} : chaîne non vide attendue`);
}
function listeDeChaines(v: unknown, ou: string) {
  assert.ok(Array.isArray(v) && v.length > 0, `${ou} : tableau non vide attendu`);
  v.forEach((x, i) => assert.ok(estChaine(x), `${ou}[${i}] : chaîne non vide attendue`));
}

// Toutes les chaînes du contenu, pour les contrôles de copie.
function chaines(v: unknown, ou: string, out: [string, string][] = []) {
  if (typeof v === "string") out.push([ou, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => chaines(x, `${ou}[${i}]`, out));
  else if (estObjet(v)) for (const [k, x] of Object.entries(v)) chaines(x, `${ou}.${k}`, out);
  return out;
}

// ------------------------------------------------------------------ la forme

const page = JSON.parse(readFileSync(SOURCE, "utf8")) as { url: unknown; contenu: unknown };
assert.ok(estChaine(page.url) && page.url.startsWith("/implantations/"), "url : chemin /implantations/... attendu");
const contenu = page.contenu;
assert.ok(estImplantations(contenu), "contenu.gabarit doit valoir « implantations »");
const c = contenu as unknown as Record<string, unknown>;
clesConnues(c, ["gabarit", "chapeau", "chiffres", "titreAgences", "agences", "international", "couverture"], "contenu");
chaineOptionnelle(c, "chapeau", "contenu");
chaineOptionnelle(c, "titreAgences", "contenu");

if (c.chiffres !== undefined) {
  assert.ok(Array.isArray(c.chiffres), "contenu.chiffres : tableau attendu");
  let accents = 0;
  c.chiffres.forEach((x, i) => {
    const ou = `chiffres[${i}]`;
    assert.ok(estObjet(x), `${ou} : objet attendu`);
    clesConnues(x, ["valeur", "libelle", "accent"], ou);
    assert.ok(estChaine(x.valeur), `${ou}.valeur : chaîne non vide attendue`);
    assert.ok(estChaine(x.libelle), `${ou}.libelle : chaîne non vide attendue`);
    if (x.accent !== undefined) assert.equal(typeof x.accent, "boolean", `${ou}.accent : booléen attendu`);
    if (x.accent === true) accents += 1;
  });
  assert.ok(accents <= 1, "la maquette n'accentue qu'un seul chiffre");
}

if (c.agences !== undefined) {
  assert.ok(Array.isArray(c.agences), "contenu.agences : tableau attendu");
  let sieges = 0;
  c.agences.forEach((x, i) => {
    const ou = `agences[${i}]`;
    assert.ok(estObjet(x), `${ou} : objet attendu`);
    clesConnues(x, ["nom", "badge", "lieu", "adresses", "rayon", "role", "siege"], ou);
    assert.ok(estChaine(x.nom), `${ou}.nom : chaîne non vide attendue`);
    for (const k of ["badge", "lieu", "rayon", "role"]) chaineOptionnelle(x, k, ou);
    if (x.adresses !== undefined) listeDeChaines(x.adresses, `${ou}.adresses`);
    if (x.siege !== undefined) assert.equal(typeof x.siege, "boolean", `${ou}.siege : booléen attendu`);
    if (x.siege === true) sieges += 1;
  });
  assert.ok(sieges <= 1, "un seul siège");
  assert.ok(c.agences.length <= 4, "quatre agences au plus : Lyon, Montréal, Dubaï, Madrid");
}

if (c.international !== undefined) {
  const ou = "international";
  assert.ok(estObjet(c.international), `${ou} : objet attendu`);
  clesConnues(c.international, ["titre", "texte", "image", "bureaux"], ou);
  chaineOptionnelle(c.international, "titre", ou);
  chaineOptionnelle(c.international, "texte", ou);
  const image = c.international.image;
  if (image !== undefined) {
    assert.ok(estObjet(image), `${ou}.image : objet attendu`);
    clesConnues(image, ["src", "alt"], `${ou}.image`);
    assert.ok(estChaine(image.src) && image.src.startsWith("/assets/"), `${ou}.image.src : /assets/... attendu`);
    assert.ok(existsSync(`public${image.src}`), `${ou}.image.src : fichier absent de public${image.src}`);
    assert.equal(typeof image.alt, "string", `${ou}.image.alt : chaîne attendue (vide si décorative)`);
  }
  if (c.international.bureaux !== undefined) {
    assert.ok(Array.isArray(c.international.bureaux), `${ou}.bureaux : tableau attendu`);
    c.international.bureaux.forEach((b, i) => {
      assert.ok(estObjet(b), `${ou}.bureaux[${i}] : objet attendu`);
      clesConnues(b, ["nom", "lignes"], `${ou}.bureaux[${i}]`);
      assert.ok(estChaine(b.nom), `${ou}.bureaux[${i}].nom : chaîne non vide attendue`);
      listeDeChaines(b.lignes, `${ou}.bureaux[${i}].lignes`);
    });
  }
}

// ---------------------------------------------------------------- le maillage

const inventaire = new Set(
  (JSON.parse(readFileSync(INVENTAIRE, "utf8")) as { url: string }[]).map((u) => u.url),
);
let nbLiens = 0;
if (c.couverture !== undefined) {
  assert.ok(estObjet(c.couverture), "couverture : objet attendu");
  clesConnues(c.couverture, ["titre", "villes", "departements"], "couverture");
  chaineOptionnelle(c.couverture, "titre", "couverture");
  const vus = new Set<string>();
  for (const k of ["villes", "departements"]) {
    const liste = c.couverture[k];
    if (liste === undefined) continue;
    assert.ok(Array.isArray(liste), `couverture.${k} : tableau attendu`);
    liste.forEach((l, i) => {
      const ou = `couverture.${k}[${i}]`;
      assert.ok(estObjet(l), `${ou} : objet attendu`);
      clesConnues(l, ["libelle", "href"], ou);
      assert.ok(estChaine(l.libelle), `${ou}.libelle : chaîne non vide attendue`);
      assert.ok(estChaine(l.href) && /^\/implantations\/.+\/$/.test(l.href), `${ou}.href : /implantations/.../ avec slash final attendu`);
      assert.ok(inventaire.has(l.href), `${ou}.href : « ${l.href} » absent de ${INVENTAIRE}`);
      assert.ok(l.href !== page.url, `${ou}.href : une page ne se maille pas vers elle-même`);
      assert.ok(!vus.has(l.href), `${ou}.href : « ${l.href} » déjà ciblé par un autre lien`);
      vus.add(l.href);
      nbLiens += 1;
    });
  }
}

// ----------------------------------------------------------------- la copie

for (const [ou, s] of chaines(contenu, "contenu")) {
  if (ou.endsWith(".href") || ou.endsWith(".src")) continue;
  for (const motif of INTERDITS) {
    if (motif.source.startsWith("\\b\\d+") && DELAI_TOLERE.has(s)) continue;
    assert.ok(!motif.test(s), `${ou} : formulation interdite (${motif}) dans « ${s} »`);
  }
}

// --------------------------------------------------------------- le rendu

const rendu = renderToStaticMarkup(
  <PageImplantations titre="Titre de contrôle" contenu={contenu} />,
);
assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul h1");
const hrefs = [...rendu.matchAll(/href="(\/implantations\/[^"]+)"/g)].map((m) => m[1]);
assert.equal(hrefs.length, nbLiens, `le rendu doit porter les ${nbLiens} liens du maillage, il en porte ${hrefs.length}`);
for (const [, s] of chaines(contenu, "contenu")) {
  if (s.startsWith("/")) continue;
  // Le texte est échappé par React et le Markdown en ligne est transformé :
  // on vérifie le premier mot, qui n'est ni un crochet ni une esperluette.
  const premier = s.split(/[\s& ]/)[0];
  assert.ok(rendu.includes(premier), `« ${premier} » n'apparaît pas dans le rendu`);
}

// ----------------------------------------------------------------- le SQL

const sql = SOURCE.replace(/\.json$/, ".sql");
assert.ok(existsSync(sql), `${sql} absent : lancer scripts/decoupe_gabarit.py d'abord`);
const lignes = readFileSync(sql, "utf8").split("\n").filter((l) => l.trim());
const tailles = lignes.map((l) => Buffer.byteLength(l));
assert.ok(Math.max(...tailles) <= PLAFOND, `une instruction pèse ${Math.max(...tailles)} o, plafond ${PLAFOND}`);

const litteral = (s: string) => JSON.parse(s.replace(/''/g, "'")) as unknown;
const BASE = /^update pages set contenu = '(.*)'::jsonb where path = '([^']*)';$/;
const AJOUT = /^update pages set contenu = jsonb_set\(contenu, '\{([^}]+)\}', \(contenu((?:->'[^']+')+)\) \|\| '(.*)'::jsonb\) where path = '([^']*)';$/;

const base = BASE.exec(lignes[0]);
assert.ok(base, "la première instruction doit poser le contenu de base");
assert.equal(base[2], page.url, "la première instruction vise la mauvaise page");
const rejoue = litteral(base[1]) as Record<string, unknown>;
for (const l of lignes.slice(1)) {
  const m = AJOUT.exec(l);
  assert.ok(m, `instruction non reconnue : ${l.slice(0, 80)}…`);
  assert.equal(m[4], page.url, "une instruction vise une autre page");
  const chemin = m[1].split(",");
  assert.equal(m[2], chemin.map((k) => `->'${k}'`).join(""), "chemin jsonb_set et accès -> divergent");
  let cible: unknown = rejoue;
  for (const k of chemin.slice(0, -1)) cible = (cible as Record<string, unknown>)[k];
  const dernier = chemin[chemin.length - 1];
  const tableau = (cible as Record<string, unknown>)[dernier];
  assert.ok(Array.isArray(tableau), `${chemin.join(".")} n'est pas un tableau du socle`);
  (cible as Record<string, unknown>)[dernier] = [...tableau, ...(litteral(m[3]) as unknown[])];
}
assert.deepEqual(rejoue, contenu, "le SQL rejoué ne redonne pas le JSON source");

console.log(
  `implantations : contenu conforme (${page.url}, ${nbLiens} liens, ${lignes.length} instructions, la plus longue ${Math.max(...tailles)} o)`,
);
