import "server-only";

import donnees from "./pages.json";

/**
 * Les landing pages publicitaires (SEA), servies sous /lp/ et jamais indexées.
 *
 * LA DONNÉE est `pages.json`, produite par `scripts/genere-lp.mjs` depuis
 * `window.__LP` de la maquette V3, au schéma de `__LP` (mêmes clés), filtrée
 * par les règles de copie du site et verrouillée par `verifie:lp-donnees`. Ce
 * module ne fait que la typer et la lire : aucun texte n'est écrit ici.
 *
 * `server-only` : le fichier pèse un demi-mégaoctet, il ne doit jamais partir
 * dans le paquet du navigateur. Chaque page n'envoie que ce qu'elle rend.
 */

export interface Paire {
  v: string;
  l: string;
}

interface CarteLP {
  eb: string;
  h: string;
  d: string;
  bul: string[];
  cta: string;
}

interface CasLP {
  client: string;
  t: string;
  logo: string;
}

export interface SectionLP {
  kind: string;
  t?: string;
  id?: string;
  kick?: string;
  h2?: string;
  lead?: string;
  cta?: string;
  img?: string;
  paras: string[];
  items: { h: string; d: string }[];
  cards: CarteLP[];
  quotes: { q: string; who: string; org: string }[];
  faq: { q: string; a: string }[];
  stats: Paire[];
  chips: string[];
  checks: string[];
  badges: Paire[];
  floats: Paire[];
  hubImg?: string[];
  cases?: CasLP[];
  qimg?: string[];
  details?: { h: string; d: string }[];
}

export interface PageLP {
  path: string;
  title: string;
  meta: string;
  kick: string;
  h1a: string;
  h1b: string;
  chapo: string;
  badges: string[];
  hs: Paire[];
  more: string[];
  form: { t: string } | null;
  hasForm: boolean;
  anchors: string[];
  ctaNav: string;
  img: string;
  sticky: { cta: string } | null;
  secs: SectionLP[];
  mainCta: string;
  mainHref: string;
  isRdv: boolean;
}

export interface MetaLP {
  logo: string;
  clients: { n: string; src: string }[];
  sel: { n: string; h: string }[];
  certs: { n: string; src: string }[];
}

const { meta, pages } = donnees as unknown as { meta: MetaLP; pages: PageLP[] };

export const META_LP: MetaLP = meta;

/** La page servie par défaut, cible de la redirection de /lp/ (next.config.ts). */
export const ACCUEIL_LP = "/lp/maintenance-industrielle-france/";

/** Les adresses de toutes les landing pages, `/lp/.../`, slash final compris. */
export const CHEMINS_LP: readonly string[] = pages.map((page) => page.path);

/** La page de cette adresse, ou `undefined`. */
export function pageLp(chemin: string): PageLP | undefined {
  return pages.find((page) => page.path === chemin);
}

/**
 * La description de la page : celle de `__LP`, sinon son chapô, sinon son
 * titre principal. Ces deux replis sont du texte de la même page, filtré comme
 * le reste : quand la description d'origine portait un interdit, elle a été
 * retirée entière (docs/LP-NETTOYAGE.md), et la page en garde une plutôt que
 * d'hériter de celle du site.
 */
export function descriptionLp(page: PageLP): string {
  return page.meta || page.chapo || `${page.h1a} ${page.h1b}`.trim();
}
