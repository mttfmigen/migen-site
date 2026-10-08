/**
 * LES CAS CLIENTS DES 28 PAGES OFFRE (gabarit « 03 Offre et prestation »)
 * SONT-ILS CEUX DE LA CAPTURE, MÊMES CAS, MÊME ORDRE ?
 *
 *   bun scripts/verifie-cas-offres.ts                 les 28 pages
 *   bun scripts/verifie-cas-offres.ts /offres/zero-arret/   une seule
 *   SITE_URL=http://localhost:4341/ bun scripts/verifie-cas-offres.ts
 *
 * POURQUOI. Mehdi, le 08/10 : « il manque les cas clients ».
 * `/travaux-industriels/transfert-industriel/` rendait 5 cas sur les 8 de sa
 * capture, et aucune porte ne le voyait : `verifie-offre-rendu.mjs` vérifie
 * que chaque LIGNE de la capture est présente, pas que chaque CARTE l'est.
 *
 * LA RÉFÉRENCE : `maquette/rendu/<clé>.html`, le <main> figé de la maquette.
 * La liste des 28 pages est celle de `maquette/rendu/_mesure.json`.
 *
 * CE QUI EST COMPARÉ, page par page : la suite des cas liés, dans l'ordre de
 * première apparition, dédoublonnée.
 *   · une carte de capture qui porte `href="/preuves/<cas>/"` est identifiée
 *     par son URL, et le site doit servir la MÊME URL au MÊME rang ;
 *   · une carte de capture à `href="#"` (la maquette navigue alors au clic)
 *     est identifiée par ses textes propres (hors « Étude de cas » et « Lire
 *     l'étude → ») : la carte du site au même rang doit les porter, mot pour
 *     mot sur texte normalisé.
 *   Une carte en moins, en plus ou déplacée fait échouer la page.
 *   Le texte d'une carte servie ne doit jamais montrer de syntaxe markdown
 *   brute (« [titre](/preuves/…) »).
 *
 * LES PAGES « redirigee » de la mesure n'ont pas de capture propre : la
 * maquette les envoie vers une autre page (`remapOffer`). Elles sont listées,
 * pas comparées ; si une capture propre apparaît, elle est comparée.
 *
 * LE CONTRÔLE SAIT ÉCHOUER : sur chaque page comparée, il retire une carte du
 * HTML servi, puis il en intervertit deux, et rejoue la comparaison. Si l'une
 * de ces fautes passe, le contrôle s'arrête en échec.
 *
 * PRÉALABLE : le site tourne (`bun run dev`, port 4340 par défaut).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { appliqueDecisions } from "../lib/decisions-copie";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const RENDU = join(RACINE, "maquette", "rendu");
const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");
const GABARIT = "03 Offre et prestation";
const NOMBRE_ATTENDU = 28;
const BOILERPLATE = new Set(["Étude de cas", "Lire l'étude →", "Lire l'étude de cas→", "Lire l'étude de cas →"]);

type Carte = { url?: string; textes: string[]; brut: string };

const ENTITES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Texte normalisé du dépôt : entités, espaces insécables, apostrophes, blancs. */
function normalise(s: string): string {
  return s
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] !== "#") return ENTITES[e.toLowerCase()] ?? m;
      return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    })
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Les textes propres d'une carte : chaque nœud de texte, sans le gabarit. */
function textesDe(html: string): string[] {
  return html
    .split(/<[^>]+>/)
    .map(normalise)
    .filter((t) => t && !BOILERPLATE.has(t) && t !== "→");
}

/** Les cartes de cas d'un <main>, dans l'ordre, dédoublonnées. */
function cartes(main: string, accepteDiese: boolean): Carte[] {
  const vues = new Set<string>();
  const sortie: Carte[] = [];
  for (const m of main.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const [, href, interieur] = m;
    const estCas = /^\/preuves\/[^/#?"]+\/$/.test(href);
    const textes = textesDe(interieur);
    const brutNorm = normalise(interieur.replace(/<[^>]+>/g, " "));
    const estDiese = accepteDiese && href === "#" && /^Étude de cas\b/.test(brutNorm) && /Lire l'étude/.test(brutNorm);
    if (!estCas && !estDiese) continue;
    const cle = estCas ? href : textes.join(" | ");
    if (vues.has(cle)) continue;
    vues.add(cle);
    sortie.push({ url: estCas ? href : undefined, textes, brut: brutNorm });
  }
  return sortie;
}

/** Les écarts entre la capture et le site ; vide si la page est conforme. */
function compare(reference: Carte[], servi: Carte[]): string[] {
  const ecarts: string[] = [];
  const nom = (c: Carte | undefined) => (c ? c.url ?? `« ${c.textes.join(" / ")} »` : "rien");
  const rangs = Math.max(reference.length, servi.length);
  for (let i = 0; i < rangs; i += 1) {
    const r = reference[i];
    const s = servi[i];
    const accord = r && s && (r.url ? r.url === s.url : r.textes.every((t) => s.brut.includes(t)));
    if (!accord) ecarts.push(`rang ${i + 1} : capture ${nom(r)}, site ${nom(s)}`);
  }
  // Syntaxe markdown brute : faute du site seulement si la capture, au même
  // rang, ne la montre pas (la maquette en recrache sur /offres/bureau-etudes/).
  servi.forEach((s, i) => {
    const md = /\]\(\/preuves\//;
    if (md.test(s.brut) && !md.test(reference[i]?.brut ?? "")) {
      ecarts.push(`markdown brut dans la carte ${s.url} : « ${s.brut.slice(0, 80)} »`);
    }
  });
  return ecarts;
}

function cle(url: string): string {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "index";
}

function main_(html: string): string {
  const debut = html.indexOf("<main");
  const fin = html.lastIndexOf("</main>");
  if (debut < 0 || fin < 0) throw new Error("pas de <main> dans la page servie");
  return html.slice(debut, fin + 7);
}

const ancre = (url: string, drapeaux = "") => new RegExp(`<a\\s[^>]*href="${url}"[^>]*>[\\s\\S]*?<\\/a>`, drapeaux);

/** Retire une carte du HTML servi (faute injectée). */
function retire(main: string, carte: Carte): string {
  return main.replace(ancre(carte.url!, "g"), "");
}

/** Intervertit deux cartes entières, lien ET texte (faute injectée). */
function intervertit(main: string, a: Carte, b: Carte): string {
  const htmlA = main.match(ancre(a.url!))![0];
  const htmlB = main.match(ancre(b.url!))![0];
  return main.replace(htmlA, () => "\u0000").replace(htmlB, () => htmlA).replace("\u0000", () => htmlB);
}

type Mesure = { url: string; gabarit: string; verdict: string };

async function verifie(): Promise<number> {
  const mesure = JSON.parse(readFileSync(join(RENDU, "_mesure.json"), "utf8")) as { resultats: Mesure[] };
  const toutes = mesure.resultats.filter((r) => r.gabarit === GABARIT).map((r) => r.url);
  if (toutes.length !== NOMBRE_ATTENDU) {
    console.error(`l'index annonce ${toutes.length} pages « ${GABARIT} », ${NOMBRE_ATTENDU} attendues`);
    return 1;
  }
  const demandees = process.argv.slice(2);
  const pages = demandees.length ? toutes.filter((u) => demandees.includes(u)) : toutes;
  let echecs = 0;

  for (const url of pages) {
    const fichier = join(RENDU, `${cle(url)}.html`);
    if (!existsSync(fichier)) {
      const verdict = mesure.resultats.find((r) => r.url === url)?.verdict;
      if (verdict !== "redirigee") {
        console.error(`ÉCHEC ${url} : pas de capture, et la mesure ne la dit pas redirigée`);
        echecs += 1;
      } else console.log(`  -   ${url} redirigée par la maquette, pas de capture propre`);
      continue;
    }
    // Décisions de copie appliquées à la capture (lib/decisions-copie.ts) : la donnée les porte.
    const reference = cartes(appliqueDecisions(readFileSync(fichier, "utf8")), true);
    const reponse = await fetch(SITE + url);
    if (!reponse.ok) {
      console.error(`ÉCHEC ${url} : HTTP ${reponse.status}`);
      echecs += 1;
      continue;
    }
    const main = main_(await reponse.text());
    const servi = cartes(main, false);
    const ecarts = compare(reference, servi);

    // Le contrôle doit savoir échouer, sur CETTE page.
    const fautes: string[] = [];
    if (servi.length >= 1 && compare(reference, cartes(retire(main, servi[0]), false)).length === 0) {
      fautes.push("une carte retirée passe");
    }
    if (servi.length >= 2 && compare(reference, cartes(intervertit(main, servi[0], servi[1]), false)).length === 0) {
      fautes.push("deux cartes interverties passent");
    }

    if (ecarts.length || fautes.length) {
      echecs += 1;
      console.error(`ÉCHEC ${url} : capture ${reference.length}, site ${servi.length}`);
      for (const e of ecarts) console.error(`      ${e}`);
      for (const f of fautes) console.error(`      LE CONTRÔLE NE SAIT PAS ÉCHOUER : ${f}`);
    } else console.log(`  ok  ${url} ${servi.length}/${reference.length} cas, même ordre`);
  }

  console.log(echecs ? `\n${echecs} page(s) en écart sur ${pages.length}` : `\n${pages.length} page(s) conformes`);
  return echecs ? 1 : 0;
}

process.exit(await verifie());
