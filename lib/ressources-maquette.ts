import donnees from "./ressources-maquette.json";

/**
 * Le relevé `window.__MGRES` de la maquette « Ressources v2 », typé.
 * `ressources-maquette.json` est GÉNÉRÉ par `scripts/genere-ressources-maquette.mjs`
 * depuis `maquette/mobile-v2/maquette/ressources-data.js` : ne pas l'éditer.
 * Le lecteur latéral du hub le lit pour toute adresse qu'il contient.
 */

/** Les neuf motifs `k` des blocs de la maquette (`blk()`), aucun autre n'existe. */
export type BlocMaquette =
  | { k: "p" | "h"; t: string }
  | { k: "call"; label: string; t: string }
  | { k: "ul" | "steps" | "stats"; items: { h?: string; d: string }[] }
  | { k: "tb"; h: string[]; r: string[][] }
  | { k: "faq"; items: { q: string; a: string }[] }
  | { k: "bar"; title: string; items: { l: string; v: string; w: number }[] };

export interface EntreeMaquette {
  url: string;
  h1: string;
  title: string;
  meta: string;
  ex: string;
  lead: string;
  secs: { t: string; b: BlocMaquette[] }[];
  min: number;
  kind: string;
  theme: string;
  /** Nom nu d'une photo de `public/assets/web/`. */
  img: string;
}

const M = donnees as unknown as Record<"articles" | "paused" | "metiers" | "guides", EntreeMaquette[]>;

/** Les familles du lecteur : `own` de la maquette, formats en pause masqués. */
const TECH = [...M.metiers, ...M.guides];
const ENTREPRISES = M.articles;
const TOUTES = [...M.articles, ...M.paused, ...TECH];

/** L'entrée à cette adresse, barre finale comprise (`by()` de la maquette). */
export function entreeMaquette(url: string): EntreeMaquette | undefined {
  return TOUTES.find((x) => x.url === url);
}

/**
 * Espace Techniciens (métiers et guides) ou Entreprises, et l'entrée suivante
 * de la même famille, en boucle. Hors famille (en pause, ou absente de la
 * maquette), l'index vaut -1 et la suivante est la première : règle de la maquette.
 */
export function familleMaquette(url: string): { tech: boolean; suivante: EntreeMaquette } {
  const tech = TECH.some((x) => x.url === url);
  const famille = tech ? TECH : ENTREPRISES;
  const i = famille.findIndex((x) => x.url === url);
  return { tech, suivante: famille[(i + 1) % famille.length] };
}
