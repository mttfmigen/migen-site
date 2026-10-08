/**
 * Les règles de `MigenRessource.dc.html`, portées telles quelles, et la
 * production des fichiers de données du gabarit RESSOURCE.
 *
 *   bun components/site/ressource/maquette-ressource.ts /ressources/articles/gmao/
 *   bun components/site/ressource/maquette-ressource.ts --tout --ecris <dossier>
 *
 * POURQUOI PORTER LE CODE DE LA MAQUETTE plutôt que recopier ses pages à la
 * main : la maquette ne rédige pas ces 35 pages, elle les CALCULE, à
 * l'exécution, depuis `uploads/TOUT-LE-TEXTE-DU-SITE.md` (embarqué dans
 * `maquette/site-final-autonome.html`) et `contenu/site/index.json`. Ses
 * fonctions `blocks()`, `parse()`, `img()`, le calcul des minutes et le choix
 * des trois lectures liées sont reproduits ici à la lettre. Même source, même
 * règle : même page, défauts de la maquette compris (« --- » en fin de FAQ,
 * « *10 min de lecture* » des livres blancs), qui sont donc copiés mot pour
 * mot et signalés, pas corrigés en silence.
 *
 * LE CONTRÔLE NE REPOSE PAS SUR CE FICHIER pour le texte : il compare le rendu
 * à la CAPTURE (`maquette/rendu/`), preuve indépendante. Il s'en sert seulement
 * pour ce que la capture ne laisse pas lire (photos en `blob:`).
 *
 * Outil de construction, jamais importé par l'application.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import type { Question } from "@/types/contenu";
import type {
  BlocRessource,
  ContenuRessource,
  LectureRessource,
  PartieRessource,
  RayonRessource,
} from "@/types/ressource";

import { INTERDITS } from "./interdits-verification";

export interface EntreeIndex {
  url: string;
  h1: string;
  mots?: number;
  gabarit?: string;
}

/** Ce que la route lit sur le disque : `lib/contenu.ts` lit `titre_h1`. */
export interface FichierRessource {
  url: string;
  titre_h1: string;
  contenu: ContenuRessource;
  /**
   * Phrases de la capture que le contrat interdit de rendre (CLAUDE.md §9,
   * règles client). Elles ne se reformulent pas : elles sont retirées de la
   * donnée et déclarées ici, littérales. Le contrôle les retire de la capture
   * avant de comparer, et exige que chacune porte un terme interdit.
   */
  retraits?: string[];
}

/* ---------------------------------------------------------- photos, minutes */

const PH = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
  "ph-technicien",
  "team-electric",
];

function hache(u: string): number {
  let h = 0;
  for (let i = 0; i < u.length; i += 1) h = (h * 31 + u.charCodeAt(i)) >>> 0;
  return h;
}

/** `img(u, k)` : la photo de la page (k = 3) ou de sa carte (k = 0). */
export function imageMaquette(url: string, decalage = 0): string {
  return `/assets/web/${PH[(hache(url) + decalage) % PH.length]}.jpg`;
}

/** `Math.max(2, Math.round(mots / 220))`, 600 mots par défaut comme la carte. */
export function minutesMaquette(mots: number | undefined): number {
  return Math.max(2, Math.round((mots ?? 600) / 220));
}

const RE_FEUILLE = /^\/ressources\/[^/]+\/[^/]+\/$/;
const rayonDe = (url: string) => url.split("/")[2];

/** `rel` : le même rayon d'abord, dans l'ordre de l'index, puis les autres. */
export function lecturesMaquette(url: string, index: EntreeIndex[]): LectureRessource[] {
  const feuilles = index.filter((x) => RE_FEUILLE.test(x.url));
  const rayon = rayonDe(url);
  return [
    ...feuilles.filter((x) => x.url !== url && rayonDe(x.url) === rayon),
    ...feuilles.filter((x) => rayonDe(x.url) !== rayon),
  ]
    .slice(0, 3)
    .map((x) => ({
      href: x.url,
      titre: x.h1,
      minutes: minutesMaquette(x.mots),
      image: imageMaquette(x.url),
    }));
}

/* ------------------------------------------------- découpage du texte */

const brut = (t: string) =>
  t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

/** `blocks()` de la maquette, bloc pour bloc. */
function blocs(lignes: string[]): BlocRessource[] {
  const sortie: BlocRessource[] = [];
  let i = 0;
  const prend = (re: RegExp) => {
    const g: string[] = [];
    while (i < lignes.length && re.test(lignes[i])) g.push(lignes[i++]);
    return g;
  };
  while (i < lignes.length) {
    const l = lignes[i];
    if (!l.trim()) {
      i += 1;
    } else if (/^### /.test(l)) {
      sortie.push({ type: "intertitre", texte: brut(l.slice(4)) });
      i += 1;
    } else if (/^\|/.test(l)) {
      const g = prend(/^\|/)
        .filter((x) => !/^\|\s*:?-/.test(x))
        .map((x) => x.split("|").slice(1, -1).map(brut));
      sortie.push({ type: "tableau", entetes: g[0] ?? [], lignes: g.slice(1) });
    } else if (/^- /.test(l)) {
      sortie.push({ type: "puces", items: prend(/^- /).map((x) => x.slice(2)) });
    } else if (/^\d+\. /.test(l)) {
      sortie.push({ type: "etapes", items: prend(/^\d+\. /).map((x) => x.replace(/^\d+\.\s*/, "")) });
    } else if (/^> /.test(l)) {
      sortie.push({ type: "encadre", texte: prend(/^> /).map((x) => x.slice(2)).join(" ") });
    } else {
      const g = prend(/^(?!\s*$|#|\||- |\d+\. |> ).+/);
      // La maquette boucle sans fin sur une ligne « #### » ; ici on avance.
      if (g.length === 0) i += 1;
      else sortie.push({ type: "paragraphe", texte: g.join(" ") });
    }
  }
  return sortie;
}

/** `parse()` de la maquette, rendu dans la forme du type. */
export function decoupe(md: string): Omit<ContenuRessource, "gabarit" | "rayon"> & { h1: string } {
  const h1 = md.match(/^H1 : (.+)$/m)?.[1] ?? "";
  const corps = md
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => !/^(Gabarit|Title|Meta|H1) : /.test(l) && !/^# /.test(l));
  const sections: { t: string; lignes: string[] }[] = [{ t: "", lignes: [] }];
  for (const l of corps) {
    if (/^## /.test(l)) sections.push({ t: brut(l.slice(3)), lignes: [] });
    else sections[sections.length - 1].lignes.push(l);
  }

  const intro = blocs(sections[0].lignes);
  const proses = intro.filter((b) => b.type === "paragraphe");
  const questions: Question[] = [];
  const parties: PartieRessource[] = [];
  for (const s of sections.slice(1)) {
    if (/^questions/i.test(s.t)) {
      let q: Question | null = null;
      for (const ligne of s.lignes) {
        const t = ligne.trim();
        if (!t) continue;
        const h = t.match(/^### (.+)$/) ?? t.match(/^(?:- )?\*\*(.+?\?)\*\*\s*:?\s*(.*)$/);
        if (h) {
          q = { question: brut(h[1]), reponse: brut(h[2] ?? "") };
          questions.push(q);
        } else if (q && !/^>/.test(t)) {
          q.reponse = `${q.reponse} ${brut(t.replace(/^- /, ""))}`.trim();
        }
      }
    } else if (!/^cta$/i.test(s.t)) {
      parties.push({ titre: s.t, blocs: blocs(s.lignes) });
    }
  }

  return {
    h1,
    chapo: proses.slice(0, 2).map((b) => (b as { texte: string }).texte),
    avant: [...intro.filter((b) => b.type !== "paragraphe"), ...proses.slice(2)],
    parties,
    questions,
  };
}

/* ------------------------------------------------------ sources de la maquette */

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

export function litIndex(): EntreeIndex[] {
  return JSON.parse(
    readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
  ) as EntreeIndex[];
}

/** Le texte que la maquette charge, tiré du manifeste de l'autonome. */
export function litTexteMaquette(): string {
  const html = readFileSync(join(RACINE, "maquette", "site-final-autonome.html"), "utf8");
  const ouverture = '<script type="__bundler/manifest">';
  const debut = html.indexOf(ouverture) + ouverture.length;
  const manifeste = JSON.parse(html.slice(debut, html.indexOf("</script>", debut))) as Record<
    string,
    { mime: string; compressed?: boolean | string; data: string }
  >;
  for (const r of Object.values(manifeste)) {
    if (!r.mime.includes("javascript")) continue;
    let octets = Buffer.from(r.data, "base64");
    if (r.compressed === true || r.compressed === "True") octets = gunzipSync(octets);
    const js = octets.toString("utf8");
    if (!js.includes('"uploads/TOUT-LE-TEXTE-DU-SITE.md"')) continue;
    const objet = js.slice(js.indexOf(", {") + 2, js.lastIndexOf("})") + 1);
    return (JSON.parse(objet) as Record<string, string>)["uploads/TOUT-LE-TEXTE-DU-SITE.md"];
  }
  throw new Error("site-final-autonome.html : TOUT-LE-TEXTE-DU-SITE.md introuvable");
}

/* ---------------------------------------------------------------- le contrat */

/**
 * La liste des interdits du contrat vit dans `interdits-verification.ts` : le
 * contrôle des interdits du dépôt (scripts/verifie-interdits.mjs) lit la copie
 * des sources et prenait ces motifs, qui ne sont pas de la copie, pour des
 * fautes. Les fichiers de vérification sont hors de sa lecture.
 */
export { INTERDITS };

/** Retire, phrase par phrase, ce que porte un interdit, et le note en clair. */
function sansInterdits<T>(valeur: T, retraits: string[]): T {
  if (typeof valeur === "string") {
    const phrases = valeur.split(/(?<=[.!?…])\s+/);
    const gardees = phrases.filter((p) => !INTERDITS.some((re) => re.test(p)));
    if (gardees.length === phrases.length) return valeur;
    retraits.push(...phrases.filter((p) => !gardees.includes(p)).map(brut));
    return gardees.join(" ") as T;
  }
  if (Array.isArray(valeur)) return valeur.map((v) => sansInterdits(v, retraits)) as T;
  if (valeur && typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([k, v]) => [k, sansInterdits(v, retraits)]),
    ) as T;
  }
  return valeur;
}

/** Une page, calculée comme la maquette la calcule, contrat appliqué. */
export function fichierRessource(url: string, tout: string, index: EntreeIndex[]): FichierRessource {
  const i0 = tout.indexOf(`\n# ${url}\n`);
  if (i0 < 0) throw new Error(`${url} : absente du texte de la maquette`);
  const i1 = tout.indexOf("\n# /", i0 + 4);
  const page = decoupe(tout.slice(i0, i1 < 0 ? undefined : i1));
  const rayon = rayonDe(url) as RayonRessource;
  const { h1, ...texte } = page;
  const retraits: string[] = [];
  const reste = sansInterdits(texte, retraits);
  return {
    url,
    titre_h1: h1,
    ...(retraits.length > 0 ? { retraits } : {}),
    contenu: {
      gabarit: "ressource",
      rayon,
      ...reste,
      minutes: minutesMaquette(index.find((x) => x.url === url)?.mots),
      ...(rayon === "livres-blancs" ? {} : { image: imageMaquette(url, 3) }),
      aLire: lecturesMaquette(url, index),
    },
  };
}

export const fichierDe = (url: string) => `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;

export const urlsRessource = (index: EntreeIndex[]) =>
  index
    .filter((x) => RE_FEUILLE.test(x.url) && (x.gabarit ?? "").startsWith("01"))
    .map((x) => x.url);

if (process.argv[1]?.endsWith("maquette-ressource.ts")) {
  const args = process.argv.slice(2);
  const ecris = args.includes("--ecris") ? args[args.indexOf("--ecris") + 1] : null;
  const index = litIndex();
  const urls = args.includes("--tout") ? urlsRessource(index) : args.filter((a) => a.startsWith("/"));
  const tout = litTexteMaquette();
  for (const url of urls) {
    const fichier = fichierRessource(url, tout, index);
    const json = `${JSON.stringify(fichier, null, 2)}\n`;
    if (ecris) writeFileSync(join(ecris, fichierDe(url)), json);
    else process.stdout.write(json);
  }
  if (ecris) console.error(`${urls.length} fichier(s) écrit(s) dans ${ecris}`);
}
