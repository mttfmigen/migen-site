/**
 * RELEVÉ du plan XML : les dates vraies et les images réelles des pages.
 *
 *   node scripts/releve-sitemap.mjs http://localhost:5606            # écrit lib/sitemap/dates.json et images.json
 *   node scripts/releve-sitemap.mjs http://localhost:5606 --verifie  # porte : le fichier est-il à jour ?
 *
 * Le serveur doit tourner sur le code de l'arbre (`bun run build` puis
 * `bunx next start`). Les deux fichiers produits sont VERSIONNÉS : Vercel construit sans
 * l'historique git et sans serveur à parcourir.
 *
 * LES DATES (`lib/sitemap/dates.json`), règle de Mehdi du 14/10 : une `<lastmod>` est vraie ou
 * absente, jamais l'heure du build pour tout le monde.
 *  - route statique : date du dernier commit qui touche sa route sous `app/`
 *    ou le dossier de ses composants (table `SOURCES_STATIQUES`) ;
 *  - page du relais disque (`supabase/import/…/*.json`) : date du dernier commit
 *    de son fichier. `lib/pages-publiees.ts` garde la plus récente de cette
 *    date et de `updated_at` quand la base a aussi la page ;
 *  - les 12 billets repris (`blog-repris`) : leur date d'ORIGINE, la
 *    `<lastmod>` de leur ancienne adresse dans le plan de l'ancien site, figé
 *    dans `docs/sitemap-ancien/post-sitemap.xml`, l'ancienne adresse étant lue
 *    dans `lib/redirections-ancien-site.ts`.
 *  Les pages de la base et les articles prennent `updated_at`, lu au rendu.
 *
 * LES IMAGES (`lib/sitemap/images.json`) : celles que la page affiche réellement, lues dans le
 * `<main>` rendu (balises `<img>` et `url(…)` des styles), l'adresse d'origine
 * retrouvée sous `/_next/image`, sans doublon, sur le domaine du site
 * seulement. L'en-tête et le pied de page, communs à tout le site, n'en sont
 * pas. Les images que le bundler sert sous `/_next/static/media/` non plus :
 * leur nom porte une empreinte calculée au build, une adresse qui n'est pas
 * garantie d'un build à l'autre.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { locsDuPlan } from "./plan-xml.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIES = { dates: join(RACINE, "lib/sitemap/dates.json"), images: join(RACINE, "lib/sitemap/images.json") };
const LOT = 8;

/** Les sources de chaque route statique : sa route, et ses composants propres. */
const SOURCES_STATIQUES = {
  "/": ["app/page.tsx", "components/site/accueil"],
  "/contact/": ["app/contact", "components/site/contact"],
  "/nous-connaitre/": ["app/nous-connaitre", "components/site/nous-connaitre"],
  "/a-propos/equipe/": ["app/a-propos/equipe", "components/site/equipe"],
  "/valeurs/": ["app/valeurs", "components/site/valeurs"],
  "/rse/": ["app/rse", "components/site/rse"],
  "/partenaires/": ["app/partenaires", "components/site/partenaires"],
  "/carriere/": ["app/carriere", "components/site/carriere"],
  "/marques/": ["app/marques", "components/site/marques"],
  "/plan-du-site/": ["app/plan-du-site", "components/site/plan"],
  "/mentions-legales/": ["app/mentions-legales"],
  "/confidentialite/": ["app/confidentialite"],
  "/cgv/": ["app/cgv"],
  "/test-technicien/": ["app/test-technicien", "components/site/test-technicien"],
  "/ressources/": ["app/ressources", "components/site/ressources-hub"],
};

const DOSSIERS_DU_RELAIS = ["gabarits-maquette", "blog-repris"];

function dateDuPlan(iso) {
  return `${new Date(iso).toISOString().slice(0, 19)}+00:00`;
}

/**
 * Date du dernier commit qui touche ces chemins, ou null s'il n'y en a pas.
 * Les contrôles (`verification*`) n'en sont pas : les modifier ne change pas
 * la page.
 */
function dateGit(chemins) {
  const args = ["log", "-1", "--format=%cI", "--", ...chemins, ":(exclude,glob)**/verification*"];
  const sortie = execFileSync("git", args, {
    cwd: RACINE,
    encoding: "utf8",
  }).trim();
  return sortie ? dateDuPlan(sortie) : null;
}

function datesStatiques() {
  const source = readFileSync(join(RACINE, "lib/routes-statiques.ts"), "utf8");
  const routes = [...source.matchAll(/^\s*"(\/[^"]*)",/gm)].map((m) => m[1]);
  const manquantes = routes.filter((r) => !(r in SOURCES_STATIQUES));
  const enTrop = Object.keys(SOURCES_STATIQUES).filter((r) => !routes.includes(r));
  if (manquantes.length || enTrop.length) {
    throw new Error(
      `SOURCES_STATIQUES ne suit pas ROUTES_STATIQUES : manquantes ${manquantes.join(", ") || "aucune"}, ` +
        `en trop ${enTrop.join(", ") || "aucune"}`,
    );
  }
  return routes.map((route) => [route, dateGit(SOURCES_STATIQUES[route])]);
}

/** Ancienne adresse → `<lastmod>` du plan des billets de l'ancien site. */
function datesAnciennes() {
  const xml = readFileSync(join(RACINE, "docs/sitemap-ancien/post-sitemap.xml"), "utf8");
  return new Map(
    [...xml.matchAll(/<loc>https:\/\/migen\.fr([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]),
  );
}

function dateDOrigine(url, anciennes, redirections) {
  const dates = redirections
    .filter(([, cible]) => cible === url)
    .map(([source]) => anciennes.get(source))
    .filter(Boolean)
    .sort();
  if (dates.length === 0) throw new Error(`billet repris sans date d'origine : ${url}`);
  return dates.at(-1);
}

function datesDuRelais() {
  const anciennes = datesAnciennes();
  const redirections = [
    ...readFileSync(join(RACINE, "lib/redirections-ancien-site.ts"), "utf8").matchAll(/\["(\/[^"]+)",\s*"(\/[^"]+)"\]/g),
  ].map((m) => [m[1], m[2]]);
  return DOSSIERS_DU_RELAIS.flatMap((dossier) => {
    const chemin = join("supabase/import", dossier);
    return readdirSync(join(RACINE, chemin))
      .filter((nom) => nom.endsWith(".json"))
      .map((nom) => [join(chemin, nom), JSON.parse(readFileSync(join(RACINE, chemin, nom), "utf8")).url])
      .filter(([, url]) => typeof url === "string")
      .map(([fichier, url]) => [
        url,
        dossier === "blog-repris" ? dateDOrigine(url, anciennes, redirections) : dateGit([fichier]),
      ]);
  });
}

const decode = (texte) =>
  texte.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

/** Le chemin d'origine d'une image vue dans la page, ou null si elle n'est pas du site. */
function cheminImage(brut, base) {
  if (brut.startsWith("data:")) return null;
  let url;
  try {
    url = new URL(decode(brut), base);
  } catch {
    return null;
  }
  if (url.pathname.startsWith("/_next/image")) {
    const origine = url.searchParams.get("url");
    if (!origine) return null;
    url = new URL(origine, base);
  }
  const duSite = url.origin === new URL(base).origin || url.origin === "https://migen.fr";
  if (!duSite || url.pathname.startsWith("/_next/")) return null;
  if (!/\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(url.pathname)) return null;
  return url.pathname;
}

async function imagesDe(base, chemin) {
  const r = await fetch(new URL(chemin, base), { signal: AbortSignal.timeout(60_000) });
  if (r.status !== 200) throw new Error(`${chemin} en ${r.status}`);
  const main = (await r.text()).match(/<main\b[\s\S]*<\/main>/)?.[0] ?? "";
  const brutes = [
    ...[...main.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/g)].map((m) => m[1]),
    ...[...decode(main).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]),
  ];
  return [...new Set(brutes.map((b) => cheminImage(b, base)).filter(Boolean))];
}

async function imagesDuPlan(base) {
  const chemins = (await locsDuPlan(base)).map((loc) => new URL(loc).pathname);
  const images = [];
  for (let i = 0; i < chemins.length; i += LOT) {
    const lot = chemins.slice(i, i + LOT);
    const lues = await Promise.all(lot.map((c) => imagesDe(base, c)));
    lot.forEach((c, j) => lues[j].length && images.push([c, lues[j]]));
  }
  return images;
}

const trie = (paires) => Object.fromEntries(paires.filter(([, v]) => v).sort(([a], [b]) => a.localeCompare(b)));

const base = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!base) {
  console.error("usage : node scripts/releve-sitemap.mjs <http://hote> [--verifie]");
  process.exit(2);
}

const releve = {
  // Les routes statiques en dernier : une route du code que le relais porte
  // aussi (`/ressources/`) est servie par le code, c'est sa date qui compte.
  dates: trie([...datesDuRelais(), ...datesStatiques()]),
  images: trie(await imagesDuPlan(base)),
};
const textes = Object.fromEntries(Object.entries(releve).map(([cle, v]) => [cle, `${JSON.stringify(v, null, 2)}\n`]));
const nbImages = new Set(Object.values(releve.images).flat()).size;
const resume = `${Object.keys(releve.dates).length} dates, ${Object.keys(releve.images).length} pages illustrées, ${nbImages} images distinctes`;

if (process.argv.includes("--verifie")) {
  let ecarts = 0;
  for (const cle of ["dates", "images"]) {
    if (readFileSync(SORTIES[cle], "utf8") === textes[cle]) continue;
    const ancien = JSON.parse(readFileSync(SORTIES[cle], "utf8"));
    for (const c of new Set([...Object.keys(ancien), ...Object.keys(releve[cle])])) {
      if (JSON.stringify(ancien[c]) === JSON.stringify(releve[cle][c])) continue;
      console.log(`  ÉCART ${cle} ${c}`);
      ecarts++;
    }
  }
  if (ecarts > 0) {
    console.log(`RELEVE_PERIME : ${ecarts} écart(s), relancer node scripts/releve-sitemap.mjs <base> et versionner lib/sitemap/`);
    process.exit(1);
  }
  console.log(`RELEVE_A_JOUR : ${resume}`);
} else {
  for (const cle of ["dates", "images"]) writeFileSync(SORTIES[cle], textes[cle]);
  console.log(`lib/sitemap/dates.json et images.json écrits : ${resume}`);
}
