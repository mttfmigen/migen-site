/**
 * La vue que calcule le code de la maquette (`maquette.js`) pour une page
 * générique, typée là où les gabarits la lisent. Les noms sont ceux de la
 * maquette : ils renvoient chacun à une expression `{{ … }}` de son gabarit.
 */

/** Un morceau de texte : simple, gras, ou lien (`go` = l'URL, interne ou non). */
export interface Seg {
  t: string;
  plain: boolean;
  bold: boolean;
  link: boolean;
  href?: string;
  go?: string;
}

export interface Item {
  n?: string;
  title?: string;
  text?: string;
  segs?: Seg[];
  hasTitle?: boolean;
  rowCss?: string;
  railCss?: string;
  cellCss?: string;
  titleCss?: string;
  txtCss?: string;
  hasHref?: boolean;
  noHref?: boolean;
  href?: string;
  go?: string | null;
  first?: boolean;
}

export interface EnteteTableau {
  t: string;
  css: string;
}

export interface LigneTableau {
  cells: { segs: Seg[]; css: string }[];
}

/** Un bloc à l'intérieur d'une sous-partie (`cxInner`). */
export interface Interne {
  p?: boolean;
  ult?: boolean;
  tb?: boolean;
  lk?: boolean;
  segs?: Seg[];
  items?: Item[];
  head?: EnteteTableau[];
  rows?: LigneTableau[];
  title?: string;
  go?: string;
}

export interface Unite {
  title: string;
  n: string;
  blocks: Interne[];
}

export interface Bloc {
  isP?: boolean;
  isLead?: boolean;
  isH3?: boolean;
  isCards?: boolean;
  isRows?: boolean;
  isOlRows?: boolean;
  isQuote?: boolean;
  isCta?: boolean;
  isLinkCard?: boolean;
  isTable?: boolean;
  isDuo?: boolean;
  isBento?: boolean;
  isSub?: boolean;
  isSubGrid?: boolean;
  isFaqItem?: boolean;
  segs?: Seg[];
  text?: string;
  title?: string;
  go?: string;
  items?: Item[];
  duo?: { n: string; l: Seg[]; r: Seg[] }[];
  head?: EnteteTableau[];
  rows?: LigneTableau[];
  gridCss?: string;
  unit?: Unite;
  units?: Unite[];
  q?: string;
  a?: Seg[];
  open?: boolean;
}

/** Une section numérotée : « 01 Chiffres clés », etc. */
export interface Section {
  id: string;
  num: string;
  title: string;
  head: Bloc[];
  more: Bloc[];
  hasMore?: boolean;
  bandCss?: string;
  gridCss?: string;
  asideCss?: string;
  mediaCss?: string;
  figCss?: string;
  faqCls?: string;
  titleAside?: boolean;
  titleMain?: boolean;
  hasMedia?: boolean;
  mediaTall?: boolean;
  mediaStat?: boolean;
  hasBanner?: boolean;
  hasFig?: boolean;
  statN?: string;
  statT?: string;
  hasCtaBand?: boolean;
  afterCtaEdito?: boolean;
}

export interface Panneau {
  label: string;
  text: string;
  items: Item[];
}

export interface Vue {
  cVente: boolean;
  cH1: string;
  spH1: string;
  cFam: string;
  cFormat: string;
  cRead: string;
  cBgCss: string;
  cCrumbs: { label: string; go: string; link: boolean; last: boolean }[];
  cLeadSegs: Seg[];
  cHasSub: boolean;
  cSubSegs: Seg[];
  cHasIntro: boolean;
  cIntro: Bloc[];
  cSections: Section[];
  cToc: { num: string; title: string; go: string }[];
  cHasRelated: boolean;
  cRelated: { h1: string; fam: string; go: string }[];
  spNav: { title: string; go: string }[];
  spHasProblem: boolean;
  spProblem: { title: string; lead: string; hasLead: boolean; hasSplit: boolean; before: Panneau; after: Panneau };
  spHasMethod: boolean;
  spMethod: { title: string; lead: string; steps: Item[] };
  spHasProof: boolean;
  spProof: { title: string; lead: string; cases: { client: string; sub: string; go: string }[] };
  spHasFaq: boolean;
  spFaq: { title: string; items: { q: string; blocks: Bloc[] }[] };
  spHasRest: boolean;
  spRest: Section[];
}

/**
 * Ce que porte une fiche du gabarit 03 servie par un gabarit générique de la
 * maquette (`contenu.generique`) : le markdown de la page tel que la maquette le
 * découpe (`cxParse`), et ce qu'elle lit d'ordinaire dans son index.
 */
export interface FicheGenerique {
  /** L'URL de la page : la maquette en tire le choix de ses photos. */
  url: string;
  mode: "vente" | "edito";
  famille: string;
  mots: number;
  blocs: { type: string; text?: string; items?: string[]; head?: string[]; rows?: string[][] }[];
  fil: { label: string; href: string }[];
  liees: { h1: string; fam: string; href: string }[];
}
