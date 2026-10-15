import type { ContenuRessource as CarteHub } from "@/components/site/ressources-hub/v2/donnees";
import { appliqueDecisions } from "@/lib/decisions-copie";
import { altPhoto } from "@/lib/descriptions-photos";
import { entreeMaquette, familleMaquette, type BlocMaquette } from "@/lib/ressources-maquette";
import type { BlocRessource, ContenuRessource } from "@/types/ressource";

/**
 * Ce que le lecteur latéral affiche, à la forme de l'entrée `__MGRES` que la
 * maquette « Ressources v2 » lit (`rd` de sa fonction de rendu).
 *
 * Une adresse de la maquette (15 articles, 7 métiers, 6 guides, 20 contenus
 * en pause) est lue DANS LA MAQUETTE, texte et chiffres compris, avec les
 * seules décisions de copie de Mehdi (`appliqueDecisions`, comme partout où
 * le site rend un texte de la maquette). Une adresse absente de la maquette
 * (les 12 billets repris de l'ancien blog) garde le texte de sa page, rendu
 * dans le même gabarit ; un champ qu'elle n'a pas ne s'affiche pas.
 */

export type BlocLecteur =
  | BlocMaquette
  /** Les photos du corps d'un billet repris : hors maquette, rendues en vignettes. */
  | { k: "galerie"; images: Extract<BlocRessource, { type: "galerie" }>["images"] };

export interface Lecture {
  url: string;
  /** Métier ou guide : appels « Ce métier vous ressemble ? » et « Postuler ». */
  tech: boolean;
  /** Le fil « Ressources / kind / theme », tel que la donnée l'écrit. */
  kind?: string;
  theme?: string;
  h1: string;
  /** `lead || ex` de la maquette, ou les paragraphes de chapô d'une page. */
  lead: string[];
  min?: number;
  /** `alt` vide : photo décorative, comme le fond d'image de la maquette. */
  photo?: { src: string; alt: string };
  secs: { t: string; b: BlocLecteur[] }[];
  /** « À lire ensuite » : l'entrée suivante de la même famille, en boucle. */
  suivante: { url: string; h1: string; photo: string };
}

const photoWeb = (img: string) => `/assets/web/${img}`;

/** Chaque texte d'une entrée de la maquette passé aux décisions de copie ; l'adresse et la photo restent. */
function decide<T>(v: T, page: string): T {
  if (typeof v === "string") return appliqueDecisions(v, page) as T;
  if (Array.isArray(v)) return v.map((x) => decide(x, page)) as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v).map(([cle, x]) => [cle, cle === "url" || cle === "img" ? x : decide(x, page)]),
    ) as T;
  }
  return v;
}

function suivante(url: string): Lecture["suivante"] {
  const s = familleMaquette(url).suivante;
  return { url: s.url, h1: appliqueDecisions(s.h1, s.url), photo: photoWeb(s.img) };
}

/** L'entrée de la maquette à cette adresse, ou `null` si la maquette ne l'a pas. */
export function lectureMaquette(url: string): Lecture | null {
  const brute = entreeMaquette(url);
  if (!brute) return null;
  const e = decide(brute, url);
  return {
    url,
    tech: familleMaquette(url).tech,
    kind: e.kind,
    theme: e.theme,
    h1: e.h1,
    lead: [e.lead || e.ex],
    min: e.min,
    photo: { src: photoWeb(e.img), alt: "" },
    secs: e.secs,
    suivante: suivante(url),
  };
}

/** « **Titre** : texte », la puce que la maquette lit en carte titrée. */
function titreEtTexte(item: string): { h?: string; d: string } {
  const m = /^\*\*([^*]+)\*\*\s*:\s*([\s\S]+)$/.exec(item.trim());
  return m ? { h: m[1], d: m[2] } : { d: item };
}

function bloc(b: BlocRessource): BlocLecteur {
  switch (b.type) {
    case "paragraphe":
      return { k: "p", t: b.texte };
    case "intertitre":
      return { k: "h", t: b.texte };
    case "encadre":
      return { k: "call", label: "À retenir", t: b.texte };
    case "puces":
      return { k: "ul", items: b.items.map(titreEtTexte) };
    case "etapes":
      return { k: "steps", items: b.items.map(titreEtTexte) };
    case "tableau":
      return { k: "tb", h: b.entetes, r: b.lignes };
    case "galerie":
      return { k: "galerie", images: b.images };
  }
}

/**
 * Une page ressource absente de la maquette : son texte, le fil de sa carte
 * du hub. `avant` et `questions` ne sont pas lus : aucun billet repris n'en
 * porte, et `verification-lecteur.ts` échoue si l'un d'eux en gagne.
 */
export function lectureDePage(url: string, titre: string, contenu: ContenuRessource, carte?: CarteHub): Lecture {
  return {
    url,
    tech: false,
    kind: carte?.format,
    theme: carte?.sujet,
    h1: titre,
    lead: contenu.chapo ?? [],
    min: contenu.minutes,
    photo: contenu.image ? { src: contenu.image, alt: contenu.imageAlt ?? altPhoto(contenu.image) } : undefined,
    secs: (contenu.parties ?? []).map((p) => ({ t: p.titre, b: p.blocs.map(bloc) })),
    suivante: suivante(url),
  };
}
