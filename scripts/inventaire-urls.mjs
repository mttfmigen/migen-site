/**
 * Croise les URL de la maquette et celles que le site sert vraiment.
 *
 * POURQUOI. La maquette du client décrit 248 pages, chacune rangée dans l'un de
 * ses onze gabarits. Le plan de site du site en annonce 161. L'écart n'avait
 * jamais été posé noir sur blanc, et personne ne savait quelles pages manquaient,
 * lesquelles étaient en trop, ni laquelle sert quel gabarit.
 *
 * Ce script interroge le site, URL par URL, et produit un tableau vérifiable.
 * Il ne corrige rien : il constate.
 *
 *   node scripts/inventaire-urls.mjs                 tableau sur la sortie standard
 *   node scripts/inventaire-urls.mjs --html          écrit aussi docs/inventaire-urls.html
 *   node scripts/inventaire-urls.mjs --gabarit "03 Offre et prestation"
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(RACINE, "maquette", "contenu", "site", "index.json");
const SITE = process.env.SITE_URL ?? "http://localhost:4340";

/** Au-delà, on considère la page injoignable plutôt que lente. */
const DELAI = 15000;

/** Combien d'URL on interroge en même temps. Au-delà le serveur de dev bronche. */
const FRONT = 8;

function litIndex() {
  try {
    return JSON.parse(readFileSync(INDEX, "utf8"));
  } catch {
    throw new Error(`index introuvable : ${INDEX}`);
  }
}

/** Les URL que le site déclare lui-même dans son plan de site. */
async function litSitemap() {
  try {
    const r = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(DELAI) });
    if (!r.ok) return null;
    const xml = await r.text();
    return new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
        try {
          return new URL(m[1]).pathname;
        } catch {
          return m[1];
        }
      }),
    );
  } catch {
    return null;
  }
}

/**
 * Interroge une URL et rend son état réel.
 *
 * On lit le corps plutôt que de se contenter du code : une page peut répondre
 * 200 et ne rien porter, ce qui est le défaut qu'on traque depuis le début.
 */
async function interroge(chemin) {
  try {
    const r = await fetch(`${SITE}${chemin}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(DELAI),
    });
    if (r.status >= 300 && r.status < 400) {
      return { code: r.status, vers: r.headers.get("location") ?? "?", h1: null, mots: 0 };
    }
    const html = await r.text();
    const sansScripts = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "");
    const mh1 = sansScripts.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const h1 = mh1 ? mh1[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
    const texte = sansScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { code: r.status, vers: null, h1, mots: texte.split(" ").filter(Boolean).length };
  } catch (e) {
    return { code: 0, vers: null, h1: null, mots: 0, erreur: String(e.message ?? e).slice(0, 40) };
  }
}

/** Petit ordonnanceur : on garde FRONT requêtes en vol, pas plus. */
async function enLots(items, travail) {
  const out = new Array(items.length);
  let i = 0;
  const ouvriers = Array.from({ length: Math.min(FRONT, items.length) }, async () => {
    while (i < items.length) {
      const k = i;
      i += 1;
      out[k] = await travail(items[k], k);
    }
  });
  await Promise.all(ouvriers);
  return out;
}

const args = process.argv.slice(2);
const iGab = args.indexOf("--gabarit");
const filtreGabarit = iGab !== -1 ? args[iGab + 1] : null;

const index = litIndex();
const cibles = filtreGabarit ? index.filter((e) => e.gabarit === filtreGabarit) : index;

console.log(`site     : ${SITE}`);
console.log(`maquette : ${cibles.length} URL${filtreGabarit ? ` du gabarit « ${filtreGabarit} »` : ""}\n`);

const sitemap = await litSitemap();
const etats = await enLots(cibles, (e) => interroge(e.url));

const lignes = cibles.map((e, k) => {
  const s = etats[k];
  const titreIdentique =
    s.h1 && e.h1 ? s.h1.replace(/\s+/g, " ").trim() === e.h1.replace(/\s+/g, " ").trim() : null;
  let verdict;
  if (s.code === 0) verdict = "injoignable";
  else if (s.code === 404) verdict = "absente du site";
  else if (s.code >= 300 && s.code < 400) verdict = `redirige vers ${s.vers}`;
  else if (!s.h1) verdict = "servie sans titre";
  else if (titreIdentique === false) verdict = "titre different";
  else verdict = "conforme";
  return {
    url: e.url,
    gabarit: e.gabarit ?? "?",
    code: s.code,
    motsMaquette: e.mots ?? null,
    motsSite: s.mots,
    h1Maquette: e.h1,
    h1Site: s.h1,
    dansLeSitemap: sitemap ? sitemap.has(e.url) : null,
    verdict,
  };
});

const parVerdict = {};
for (const l of lignes) parVerdict[l.verdict] = (parVerdict[l.verdict] ?? 0) + 1;

// Les pages VÉRIFIABLES d'abord : cliquer sur une 404 n'apprend rien, et c'est
// ce que faisait la première version de ce tableau.
const ordre = ["titre different", "servie sans titre", "conforme", "injoignable", "absente du site"];
lignes.sort((a, b) => {
  const ia = ordre.indexOf(a.verdict);
  const ib = ordre.indexOf(b.verdict);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.url.localeCompare(b.url);
});

console.log("code  mots maq/site  gabarit                     URL");
console.log("-".repeat(104));
for (const l of lignes) {
  console.log(
    `${String(l.code).padStart(4)}  ${String(l.motsMaquette ?? "?").padStart(4)}/${String(l.motsSite).padEnd(5)}  ` +
      `${l.gabarit.padEnd(26)}  ${l.url}` +
      (l.verdict === "conforme" ? "" : `   << ${l.verdict}`),
  );
}

console.log("\n=== compte ===");
for (const [v, n] of Object.entries(parVerdict).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${v}`);
}

if (sitemap) {
  const connues = new Set(cibles.map((e) => e.url));
  const enTrop = [...sitemap].filter((u) => !connues.has(u));
  console.log(
    `\n  plan de site du site : ${sitemap.size} URL, dont ${enTrop.length} absente(s) de la maquette`,
  );
  for (const u of enTrop.slice(0, 20)) console.log(`     ${u}`);
  if (enTrop.length > 20) console.log(`     … et ${enTrop.length - 20} autres`);
}

if (args.includes("--html")) {
  const echappe = (s) =>
    String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const couleur = (v) =>
    v === "conforme" ? "#1a7f4b" : v === "titre different" ? "#b26a00" : "#b3261e";
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Migen · inventaire des URL</title>
<style>
 body{margin:0;padding:28px;font:400 14px/1.5 -apple-system,"system-ui",sans-serif;color:#1c1b19;background:#f1f2f4}
 h1{font:600 26px/1.2 -apple-system,sans-serif;letter-spacing:-.02em;margin:0 0 6px}
 p.sous{color:#6a6764;margin:0 0 22px}
 table{border-collapse:collapse;width:100%;background:#fff;border-radius:14px;overflow:hidden}
 th,td{text-align:left;padding:9px 12px;border-bottom:1px solid rgba(28,27,25,.07);vertical-align:top}
 th{font:600 12px/1 -apple-system,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#6a6764;background:#faf9f8}
 td.num{font:500 13px ui-monospace,Menlo,monospace;white-space:nowrap}
 a{color:#1c1b19}
 .v{font:500 12px/1 -apple-system,sans-serif;white-space:nowrap}
 .t{font:400 12.5px/1.35 -apple-system,sans-serif;color:#4a4845;max-width:260px}
 .t.ecart{color:#b26a00;font-weight:500}
 .filtres{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
 .filtres button{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(28,27,25,.12);
   background:#fff;border-radius:999px;padding:7px 13px;cursor:pointer;
   font:500 12.5px/1 -apple-system,sans-serif;color:#1c1b19}
 .filtres button.actif{background:#1c1b19;color:#fff;border-color:#1c1b19}
 .pastille{width:8px;height:8px;border-radius:50%;display:inline-block}
 tr.masquee{display:none}
</style></head><body>
<h1>Inventaire des URL</h1>
<p class="sous">${cibles.length} pages décrites par la maquette, confrontées à ${echappe(SITE)}.
Les pages vérifiables d'abord : les 404 sont en bas, cliquer dessus n'apprend rien.</p>
<div class="filtres">
${Object.entries(parVerdict)
  .sort((a, b) => b[1] - a[1])
  .map(
    ([v, n]) =>
      `<button data-f="${echappe(v)}"><span class="pastille" style="background:${couleur(v)}"></span>${echappe(v)} <b>${n}</b></button>`,
  )
  .join("")}
<button data-f="" class="actif">tout <b>${lignes.length}</b></button>
</div>
<table><thead><tr>
<th>URL</th><th>Gabarit</th><th>Code</th><th>Mots<br>maquette / site</th><th>Titre attendu</th><th>Titre servi</th><th>État</th>
</tr></thead><tbody>
${lignes
  .map(
    (l) => `<tr data-v="${echappe(l.verdict)}">
<td><a href="${echappe(SITE)}${echappe(l.url)}" target="_blank" rel="noreferrer">${echappe(l.url)}</a></td>
<td>${echappe(l.gabarit)}</td>
<td class="num">${l.code}</td>
<td class="num">${l.motsMaquette ?? "?"} / ${l.motsSite}</td>
<td class="t">${echappe(l.h1Maquette)}</td>
<td class="t${l.verdict === "titre different" ? " ecart" : ""}">${echappe(l.h1Site ?? "—")}</td>
<td class="v" style="color:${couleur(l.verdict)}">${echappe(l.verdict)}</td>
</tr>`,
  )
  .join("\n")}
</tbody></table>
<script>
// Filtre côté page : on masque les lignes, on ne les reconstruit pas.
document.querySelectorAll(".filtres button").forEach(function (b) {
  b.addEventListener("click", function () {
    document.querySelectorAll(".filtres button").forEach(function (x) { x.classList.remove("actif"); });
    b.classList.add("actif");
    var f = b.dataset.f;
    document.querySelectorAll("tbody tr").forEach(function (tr) {
      tr.classList.toggle("masquee", Boolean(f) && tr.dataset.v !== f);
    });
  });
});
</script>
</body></html>`;
  const chemin = join(RACINE, "docs", "inventaire-urls.html");
  writeFileSync(chemin, html, "utf8");
  console.log(`\nécrit : docs/inventaire-urls.html`);
}
