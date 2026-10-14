/**
 * PORTE : le plan XML a le format de l'ancien migen.fr (Yoast), des dates
 * vraies et des images qui existent.
 *
 *   node scripts/verifie-sitemap.mjs http://localhost:5606
 *   node scripts/verifie-sitemap.mjs --controle     # prouve qu'elle sait échouer
 *
 * CE QU'ELLE EXIGE (voir `docs/PLAN-DU-SITE-XML.md`) :
 *  - `/sitemap_index.xml` en 200, `text/xml`, la déclaration XML suivie de
 *    l'instruction `xml-stylesheet` vers `/sitemap.xsl`, un `<sitemapindex>`
 *    qui liste `post-sitemap.xml` puis `page-sitemap.xml`, chacun avec la date
 *    de sa page la plus récente ;
 *  - chaque sous-plan : la ligne `<urlset …>` IDENTIQUE à celle de l'ancien
 *    site (`docs/sitemap-ancien/post-sitemap.xml`), l'indentation par
 *    tabulations, chaque `<lastmod>` au format `AAAA-MM-JJTHH:MM:SS+00:00`,
 *    les billets (`/ressources/articles/x/`, `/preuves/x/`) dans
 *    `post-sitemap.xml` et nulle part ailleurs, aucune adresse en double ;
 *  - des dates VRAIES : jamais une même date pour la moitié des adresses ou
 *    plus (l'heure du build pour tous, le défaut d'avant), et les 12 billets
 *    repris à leur date d'origine, avant leur republication du 14/10 ;
 *  - chaque `<image:loc>` sur https://migen.fr/ et en 200 sur la base mesurée ;
 *  - `/sitemap.xml`, les anciens sous-plans de Yoast et `wp-sitemap.xml` en
 *    UNE 301 vers `/sitemap_index.xml` ; un sous-plan servi écrit en
 *    majuscules en une 301 vers sa forme en minuscules ;
 *  - `/sitemap.xsl` en 200 ; `robots.txt`, s'il déclare un plan, déclare
 *    `https://migen.fr/sitemap_index.xml`.
 * Dernière ligne : `SITEMAP_CONFORME`, sinon les fautes et un code 1.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://migen.fr";
const LOT = 8;
const ENTETE = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
const URLSET = readFileSync(join(RACINE, "docs/sitemap-ancien/post-sitemap.xml"), "utf8").split("\n")[1];
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/;
const LIGNE = /^\t+<\/?(?:sitemap|url|loc|lastmod|image:image|image:loc)>/;
const BILLET = /^\/(?:ressources\/articles|preuves)\/[^/]+\/$/;
const REPUBLICATION = "2026-10-14";
const BILLETS_REPRIS = readdirSync(join(RACINE, "supabase/import/blog-repris"))
  .filter((nom) => nom.endsWith(".json"))
  .map((nom) => JSON.parse(readFileSync(join(RACINE, "supabase/import/blog-repris", nom), "utf8")).url);

const tous = (xml, balise) => [...xml.matchAll(new RegExp(`<${balise}>([^<]*)</${balise}>`, "g"))].map((m) => m[1]);

/** Les fautes de FORMAT et de DATES d'un index et de ses sous-plans, sans réseau. */
export function fautesDuPlan(index, sousPlans) {
  const fautes = [];
  if (!index.startsWith(`${ENTETE}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`)) {
    fautes.push("index : en-tête différent de celui de Yoast (déclaration, feuille de style, sitemapindex)");
  }
  const attendus = [`${SITE}/post-sitemap.xml`, `${SITE}/page-sitemap.xml`];
  if (JSON.stringify(tous(index, "loc")) !== JSON.stringify(attendus)) {
    fautes.push(`index : sous-plans ${tous(index, "loc").join(", ") || "aucun"}, attendus ${attendus.join(", ")}`);
  }
  const vus = new Set();
  const dates = [];
  for (const [i, loc] of attendus.entries()) {
    const nom = new URL(loc).pathname;
    const xml = sousPlans[nom] ?? "";
    const lignes = xml.split("\n");
    if (lignes[0] !== ENTETE) fautes.push(`${nom} : première ligne différente de celle de Yoast`);
    if (lignes[1] !== URLSET) fautes.push(`${nom} : ligne <urlset> différente de celle de l'ancien site`);
    const corps = lignes.slice(2, lignes.lastIndexOf("</urlset>"));
    const malIndentees = corps.filter((l) => !LIGNE.test(l));
    if (corps.length === 0 || malIndentees.length) {
      fautes.push(`${nom} : ${malIndentees.length} ligne(s) hors format (tabulations), dont « ${malIndentees[0] ?? "plan vide"} »`);
    }
    const lastmods = tous(xml, "lastmod");
    dates.push(...lastmods);
    for (const d of lastmods.filter((d) => !DATE.test(d))) fautes.push(`${nom} : lastmod « ${d} » hors format`);
    const plusRecente = lastmods.sort().at(-1);
    const dateIndex = index.match(new RegExp(`<loc>${loc}</loc>\\s*<lastmod>([^<]+)</lastmod>`))?.[1];
    if (dateIndex !== plusRecente) fautes.push(`index : ${nom} daté ${dateIndex}, sa page la plus récente ${plusRecente}`);
    for (const bloc of xml.split("<url>").slice(1)) {
      const chemin = new URL(tous(bloc, "loc")[0]).pathname;
      if (vus.has(chemin)) fautes.push(`${chemin} : en double dans le plan`);
      vus.add(chemin);
      if (BILLET.test(chemin) !== (i === 0)) fautes.push(`${chemin} : dans ${nom}, c'est ${BILLET.test(chemin) ? "un billet" : "une page"}`);
      const date = tous(bloc, "lastmod")[0];
      if (BILLETS_REPRIS.includes(chemin) && !(date && date < REPUBLICATION)) {
        fautes.push(`${chemin} : billet repris daté ${date ?? "de rien"}, sa date d'origine est attendue`);
      }
      for (const image of tous(bloc, "image:loc").filter((u) => !u.startsWith(`${SITE}/`))) {
        fautes.push(`${chemin} : image hors du domaine, ${image}`);
      }
    }
  }
  const parDate = new Map();
  for (const d of dates) parDate.set(d, (parDate.get(d) ?? 0) + 1);
  const [dateCourante, nombre] = [...parDate].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  if (vus.size > 0 && nombre * 2 >= vus.size) {
    fautes.push(`dates : ${nombre} adresses sur ${vus.size} datées ${dateCourante}, une date pour tous n'est pas une date vraie`);
  }
  return { fautes, adresses: vus.size, datees: dates.length };
}

async function reponse(base, chemin) {
  const r = await fetch(new URL(chemin, base), { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  return { code: r.status, type: r.headers.get("content-type") ?? "", location: r.headers.get("location"), corps: await r.text() };
}

async function porte(base) {
  const index = await reponse(base, "/sitemap_index.xml");
  const fautes = [];
  if (index.code !== 200 || !index.type.startsWith("text/xml")) fautes.push(`/sitemap_index.xml en ${index.code} ${index.type}`);
  const sousPlans = {};
  for (const nom of ["/post-sitemap.xml", "/page-sitemap.xml"]) {
    const r = await reponse(base, nom);
    if (r.code !== 200 || !r.type.startsWith("text/xml")) fautes.push(`${nom} en ${r.code} ${r.type}`);
    sousPlans[nom] = r.corps;
  }
  const format = fautesDuPlan(index.corps, sousPlans);
  fautes.push(...format.fautes);

  const images = [...new Set(Object.values(sousPlans).flatMap((xml) => tous(xml, "image:loc")))];
  for (let i = 0; i < images.length; i += LOT) {
    await Promise.all(
      images.slice(i, i + LOT).map(async (image) => {
        const r = await fetch(new URL(new URL(image).pathname, base), { signal: AbortSignal.timeout(30_000) });
        await r.body?.cancel();
        if (r.status !== 200) fautes.push(`image en ${r.status} : ${image}`);
      }),
    );
  }

  const redirections = [
    ["/sitemap.xml", "/sitemap_index.xml"],
    ["/SITEMAP.XML", "/sitemap_index.xml"],
    ["/category-sitemap.xml", "/sitemap_index.xml"],
    ["/fusion_tb_category-sitemap.xml", "/sitemap_index.xml"],
    ["/element_category-sitemap.xml", "/sitemap_index.xml"],
    ["/wp-sitemap.xml", "/sitemap_index.xml"],
    ["/post-sitemap2.xml", "/sitemap_index.xml"],
    ["/PAGE-SITEMAP.XML", "/page-sitemap.xml"],
  ];
  for (const [source, cible] of redirections) {
    const r = await reponse(base, source);
    const vers = r.location ? new URL(r.location, base).pathname : null;
    if (r.code !== 301 || vers !== cible) fautes.push(`${source} en ${r.code} vers ${vers}, une 301 vers ${cible} attendue`);
  }

  const xsl = await reponse(base, "/sitemap.xsl");
  if (xsl.code !== 200 || !xsl.corps.includes("<xsl:stylesheet")) fautes.push(`/sitemap.xsl en ${xsl.code}, ou sans feuille XSL`);
  const robots = await reponse(base, "/robots.txt");
  const declare = robots.corps.match(/^Sitemap:\s*(\S+)/im)?.[1];
  if (declare && declare !== `${SITE}/sitemap_index.xml`) fautes.push(`robots.txt déclare ${declare}`);

  return { fautes, ...format, images: images.length, robots: declare ?? "fermé, sans plan déclaré" };
}

/** La preuve qu'elle sait échouer : le plan d'avant le 14/10, puis des défauts un à un. */
function controle() {
  const bon = (corps) => `${ENTETE}\n${URLSET}\n${corps}</urlset>\n`;
  const url = (chemin, date, image) =>
    `\t<url>\n\t\t<loc>${SITE}${chemin}</loc>\n` +
    (date ? `\t\t<lastmod>${date}</lastmod>\n` : "") +
    (image ? `\t\t<image:image>\n\t\t\t<image:loc>${image}</image:loc>\n\t\t</image:image>\n` : "") +
    "\t</url>\n";
  const idx = (post, page) =>
    `${ENTETE}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `\t<sitemap>\n\t\t<loc>${SITE}/post-sitemap.xml</loc>\n\t\t<lastmod>${post}</lastmod>\n\t</sitemap>\n` +
    `\t<sitemap>\n\t\t<loc>${SITE}/page-sitemap.xml</loc>\n\t\t<lastmod>${page}</lastmod>\n\t</sitemap>\n</sitemapindex>\n`;
  const post = bon(url("/preuves/autoliv/", "2026-10-13T23:42:41+00:00", `${SITE}/assets/a.jpg`) + url("/ressources/articles/bien-etre-au-travail/", "2025-04-29T08:27:13+00:00"));
  const page = bon(url("/", "2026-10-14T12:04:49+00:00") + url("/rse/", "2026-10-12T14:13:21+00:00") + url("/cgv/"));
  const sain = { index: idx("2026-10-13T23:42:41+00:00", "2026-10-14T12:04:49+00:00"), post, page };
  const cas = [
    ["plan sain", sain, null],
    ["plan Next d'avant (sans XSL, une date pour tous)", { ...sain, index: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n' }, /en-tête différent/],
    ["indentation par espaces", { ...sain, page: page.replace(/\t/g, "  ") }, /hors format \(tabulations\)/],
    ["lastmod en millisecondes", { ...sain, page: page.replace("2026-10-12T14:13:21+00:00", "2026-10-12T14:13:21.000Z") }, /hors format$/],
    ["heure du build pour tous", { ...sain, page: page.replace(/2026-10-1\dT[\d:]+\+00:00/g, "2026-10-14T16:18:54+00:00"), post: post.replace(/20\d\d-[\d-]+T[\d:]+\+00:00/g, "2026-10-14T16:18:54+00:00"), index: idx("2026-10-14T16:18:54+00:00", "2026-10-14T16:18:54+00:00") }, /une date pour tous/],
    ["billet repris daté du jour", { ...sain, post: post.replace("2025-04-29T08:27:13+00:00", "2026-10-14T10:00:00+00:00"), index: idx("2026-10-14T10:00:00+00:00", "2026-10-14T12:04:49+00:00") }, /date d'origine est attendue/],
    ["billet rangé dans les pages", { ...sain, page: page.replace("/rse/", "/preuves/vpk/") }, /c'est un billet/],
    ["image hors domaine", { ...sain, post: post.replace(`${SITE}/assets/a.jpg`, "https://migen-site.vercel.app/assets/a.jpg") }, /image hors du domaine/],
    ["index mal daté", { ...sain, index: idx("2026-01-01T00:00:00+00:00", "2026-10-14T12:04:49+00:00") }, /daté 2026-01-01/],
  ];
  let bons = 0;
  for (const [nom, plan, attendu] of cas) {
    const { fautes } = fautesDuPlan(plan.index, { "/post-sitemap.xml": plan.post, "/page-sitemap.xml": plan.page });
    const ok = attendu ? fautes.some((f) => attendu.test(f)) : fautes.length === 0;
    console.log(`  ${ok ? "OK  " : "RATE"}  ${nom}${ok ? "" : ` : ${fautes.join(" | ") || "aucune faute vue"}`}`);
    if (ok) bons++;
  }
  console.log(bons === cas.length ? `CONTROLE_OK : ${bons}/${cas.length}` : `CONTROLE_ECHOUE : ${bons}/${cas.length}`);
  process.exitCode = bons === cas.length ? 0 : 1;
}

if (process.argv.includes("--controle")) {
  controle();
} else {
  const base = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!base) {
    console.error("usage : node scripts/verifie-sitemap.mjs <http://hote> | --controle");
    process.exit(2);
  }
  const r = await porte(base.replace(/\/+$/, ""));
  for (const f of r.fautes) console.log(`  FAUTE  ${f}`);
  console.log(
    `${base} : ${r.adresses} adresses, ${r.datees} datées, ${r.images} images distinctes en 200 ; robots.txt : ${r.robots}.`,
  );
  if (r.fautes.length) {
    console.log(`ECHEC : ${r.fautes.length} faute(s).`);
    process.exitCode = 1;
  } else {
    console.log("SITEMAP_CONFORME");
  }
}
