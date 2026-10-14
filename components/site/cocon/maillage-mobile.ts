/**
 * LE MAILLAGE DE LA MAQUETTE MOBILE V2, PORTÉ DEPUIS SON SEUL CALCUL.
 *
 * La maquette (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`) déduit
 * parent, enfants et sœurs d'une page depuis l'index du corpus, jamais depuis
 * une liste écrite à la main. Ce module porte ce calcul, ligne à ligne :
 *
 *   L227      `REMAP` : six adresses que la maquette détourne vers leur cible
 *             (voir aussi `maquette/mobile-v2/README.md`, « Redirections à
 *             reprendre en production »). Elles sont EXCLUES des listes
 *             (L369, `!RM[x.url]`) et leurs enfants sont RATTACHÉS à la cible
 *             (L370-374, `kidsOf`) : sans ce rattachement, les pastilles de
 *             `/offres/bureau-etudes/` seraient vides là où la maquette en
 *             montre trois (les enfants de `/bureau-etudes/`).
 *   L351-365  `short` : le libellé court d'une page, TOUJOURS dérivé du h1,
 *             du title ou de l'URL de l'index, jamais rédigé. (La variable
 *             `famL` y est déclarée puis jamais lue : code mort, non porté.)
 *   L367-368  `STOP` et `words` : la normalisation qui sert au dédoublonnage.
 *   L369-375  `directOf` et `kidsOf` : enfants directs, héritage des enfants
 *             des adresses détournées, filtre de recouvrement thématique,
 *             dédoublonnage par libellé normalisé (les « doublons à
 *             rediriger » du LISEZMOI n'apparaissent ainsi qu'une fois).
 *   L376      `linkL` : la carte d'une pastille, avec « N min de lecture »
 *             calculé `max(2, round(mots / 230))` pour les gabarits 01 et 02.
 *   L377      `kidsBox` : 8 pastilles visibles, le reste sous un repli dont
 *             le libellé est « Voir les N autres pages ».
 *   L485      le parent : l'URL amputée de son dernier segment, puis REMAP.
 *   L498-506  les titres des boîtes, verbatim : « Autres implantations »,
 *             « Les rubriques », « Toutes les pages de la rubrique »,
 *             « Tous les contenus », « Les spécialités du domaine »,
 *             « Les villes couvertes », « Départements couverts »,
 *             « Aller plus loin », « Dans la même rubrique ».
 *
 * Le code du gabarit vient de `maquette/mobile-v2/maquette/migen-mobile-parse.js`
 * L154-169 (`gab`), avec son repli par URL pour une entrée sans champ.
 *
 * POURQUOI UN MODULE NEUTRE, sans « use client » ni « server-only » : même
 * leçon que `blocs/resume-de-section.ts`. Le composant serveur l'importe, la
 * porte en ligne de commande aussi ; une directive dans un sens ou l'autre
 * rendrait l'un des deux impossible, et `bunx tsc --noEmit` ne le dirait pas.
 *
 * POURQUOI UN IMPORT JSON et non `readFileSync` : l'index est embarqué dans le
 * paquet serveur à la construction. Aucune lecture disque à l'exécution, donc
 * aucun chemin à tracer sur Vercel, et la porte le lit de la même façon.
 */
import indexBrut from "@/maquette/contenu/site/index.json";

export interface EntreeIndex {
  readonly famille: string;
  readonly url: string;
  readonly h1: string;
  readonly title: string;
  readonly fichier: string;
  readonly mots: number;
  readonly gabarit: string;
  readonly sec: boolean;
}

const INDEX = indexBrut as readonly EntreeIndex[];

const PAR_URL: ReadonlyMap<string, EntreeIndex> = new Map(
  INDEX.map((x) => [x.url, x]),
);

/** L'entrée d'index d'un chemin, pour les gabarits et la porte. */
export function entreeDe(chemin: string): EntreeIndex | undefined {
  return PAR_URL.get(chemin);
}

/* ------------------------------------------------- adresses détournées, L227 */

export const REMAP: Readonly<Record<string, string>> = {
  "/offres/chantier/": "/travaux-industriels/",
  "/offres/retrofit/": "/offres/bureau-etudes/",
  "/offres/construction/": "/travaux-industriels/",
  "/bureau-etudes/": "/offres/bureau-etudes/",
  "/offres/depannage-industriel/": "/offres/zero-arret/",
  "/offres/audit-conseil-maintenance/": "/offres/bureau-etudes/",
};

/* --------------------------------------------------- gabarit, parse.js L154 */

/** Le code à deux chiffres du gabarit d'une entrée (« 03 », « 10 »…). */
export function gabaritDe(x: EntreeIndex): string {
  const g = /(\d{1,2})/.exec(x.gabarit);
  if (g) return `0${g[1]}`.slice(-2);
  /* Repli par URL de parse.js L157-168, pour une entrée au champ vide. */
  const s = x.url.split("/").filter(Boolean);
  const f = s[0] ?? "";
  if (s.length === 0) return "00";
  if (s.length === 1) return "10";
  if (f === "preuves") return "02";
  if (f === "implantations") return s.length === 2 ? "04" : "06";
  if (f === "expertises") return s.length === 2 ? "09" : "05";
  if (f === "secteurs") return "08";
  if (f === "carriere") return s.length === 2 ? "07" : "01";
  if (f === "ressources") return s.length === 2 ? "11" : "01";
  if (f === "guides") return "01";
  if (f === "a-propos") return "10";
  return "03";
}

/* ------------------------------------------------ libellé court, dc.html L351 */

/**
 * Le libellé d'une pastille. Chaque branche DÉRIVE du h1, du title ou de
 * l'URL de l'index : rien n'est rédigé ici, et la porte le mesure.
 */
export function courtLibelle(x: EntreeIndex): string {
  const h = x.h1.replace(/\s+/g, " ").trim();
  const gg = gabaritDe(x);
  if (gg === "04") {
    const tm =
      /Maintenance industrielle\s+(?:à\s+|en\s+)?([^,|:]+?)\s*(?:[,|:]|$)/i.exec(
        x.title,
      );
    if (tm && tm[1].trim().length > 1) return tm[1].trim();
    const slug = (x.url.split("/").filter(Boolean).pop() ?? "").replace(
      /^maintenance-industrielle-/,
      "",
    );
    return slug
      .split("-")
      .map((w) =>
        w.length > 2 || w === slug ? w.charAt(0).toUpperCase() + w.slice(1) : w,
      )
      .join("-");
  }
  if (gg === "06") {
    const m =
      /(?:^|\s)(?:à|en|dans le|dans la|dans les|sur)\s+([A-ZÀ-Ý][^,:\u2014\u2013]*?)(?=\s+et\s|\s*[,:\u2014\u2013]|$)/.exec(
        h,
      );
    if (m) return m[1].trim();
  }
  const parts = h.split(/\s*[:\u2014\u2013]\s+/);
  const t =
    gg === "02"
      ? h.replace(/^Étude de cas\s*/i, "")
      : parts.length > 1 && gg === "11"
        ? parts.slice(1).join(" : ")
        : parts[0];
  return t.length > 54 ? `${t.slice(0, t.lastIndexOf(" ", 52))}…` : t;
}

/* ------------------------------------- enfants et sœurs, dc.html L367-375, L485 */

const STOP = new Set([
  "de", "des", "du", "la", "le", "les", "l", "d", "et", "en", "a", "au",
  "aux", "un", "une", "industriel", "industrielle", "industriels",
  "industrielles",
]);

/** La normalisation du dédoublonnage (dc.html L368), exportée pour la porte. */
export function motsDe(t: string): string[] {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w !== "" && !STOP.has(w))
    .map((w) => (w.length > 3 ? w.replace(/s$/, "") : w));
}

function directsDe(base: string): EntreeIndex[] {
  return INDEX.filter(
    (x) =>
      !REMAP[x.url] &&
      x.url !== base &&
      x.url.startsWith(base) &&
      x.url.slice(base.length).split("/").filter(Boolean).length === 1,
  );
}

/** Les enfants d'un chemin, calcul de `kidsOf` (dc.html L370-375). */
export function enfantsDe(chemin: string): EntreeIndex[] {
  const propres = directsDe(chemin);
  const herites = Object.keys(REMAP)
    .filter((k) => REMAP[k] === chemin)
    .sort(
      (p1, p2) =>
        Number(p1.startsWith("/offres/")) - Number(p2.startsWith("/offres/")),
    )
    .flatMap((k) => directsDe(k));
  const themes = propres.map((x) => motsDe(`${courtLibelle(x)} ${x.h1}`));
  const gardes = herites.filter((x) => {
    const w = motsDe(courtLibelle(x));
    if (w.length === 0) return false;
    return !themes.some((T) => {
      const touches = w.filter((z) => T.includes(z)).length;
      return touches >= Math.ceil(w.length * 0.6) || T.includes(w[0]);
    });
  });
  const vus = new Set<string>();
  return [...propres, ...gardes].filter((x) => {
    const l = motsDe(courtLibelle(x)).join(" ");
    if (vus.has(l)) return false;
    vus.add(l);
    return true;
  });
}

/** Le parent d'un chemin (dc.html L485) : un segment de moins, puis REMAP. */
export function parentDe(chemin: string): EntreeIndex | undefined {
  const brut = chemin.replace(/[^/]+\/$/, "");
  return PAR_URL.get(REMAP[brut] ?? brut);
}

/** Les sœurs : les enfants du parent, moins la page elle-même (dc.html L506). */
export function soeursDe(chemin: string): EntreeIndex[] {
  const parent = parentDe(chemin);
  if (!parent) return [];
  return enfantsDe(parent.url).filter((x) => x.url !== chemin);
}

/* ----------------------------------------------- cartes et titres, L376-377, L498 */

export interface PastilleCocon {
  readonly libelle: string;
  readonly href: string;
  /** « N min de lecture », gabarits 01 et 02 seulement (dc.html L376). */
  readonly minutes?: string;
}

export function carteDe(x: EntreeIndex): PastilleCocon {
  const gg = gabaritDe(x);
  const minutes =
    (gg === "01" || gg === "02") && x.mots > 0
      ? `${Math.max(2, Math.round(x.mots / 230))} min de lecture`
      : undefined;
  return { libelle: courtLibelle(x), href: x.url, minutes };
}

/** Le libellé du repli au-delà de 8 pastilles (dc.html L377). */
export function voirLesAutres(nRestantes: number): string {
  return `Voir les ${Math.max(0, nRestantes)} autres pages`;
}

/** Les titres par gabarit de la boîte d'enfants (dc.html L501). */
export const TITRES_ENFANTS: Readonly<Record<string, string>> = {
  "10": "Toutes les pages de la rubrique",
  "11": "Tous les contenus",
  "09": "Les spécialités du domaine",
  "06": "Les villes couvertes",
  "04": "Départements couverts",
};

export const TITRE_SOEURS = "Dans la même rubrique";

/**
 * Le titre de la boîte d'enfants d'un chemin, cascade de dc.html L502-505.
 *
 * ÉCART DÉCLARÉ sur `/implantations/` : la maquette retire d'abord les villes
 * déjà montrées dans les cartes de zones du hub (`usedC`, L502) avant de
 * titrer « Autres implantations ». Ce tri appartient au gabarit Hub, qui
 * connaît ses zones ; ici la liste est complète et le titre est le sien.
 */
export function titreEnfants(chemin: string): string {
  if (chemin === "/implantations/") return "Autres implantations";
  if (chemin === "/ressources/") return "Les rubriques";
  const entree = PAR_URL.get(chemin);
  const titre = entree ? TITRES_ENFANTS[gabaritDe(entree)] : undefined;
  return titre ?? "Aller plus loin";
}

/**
 * Les boîtes à titre de la rangée HAUTE de la maquette (L502 et L504) : elles
 * se posent sous le héros avec la marge de L125, les autres avec celle de
 * L134. Exporté pour que le composant et la porte partagent le même partage.
 */
export const TITRES_RANGEE_HAUTE: readonly string[] = [
  "Autres implantations",
  ...Object.values(TITRES_ENFANTS),
];
