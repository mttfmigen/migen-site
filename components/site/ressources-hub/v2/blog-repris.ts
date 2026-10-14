import { minutesDeLecture, normalise, TAXONOMIE_ENTREPRISES } from "../taxonomie";

import type { ContenuRessource } from "./donnees";

/**
 * Les cartes des 12 billets repris de l'ancien blog (`supabase/import/blog-repris/`),
 * DÉRIVÉES de leur fiche, jamais rédigées. Outil de construction et de
 * contrôle (`verification-v2.ts`) : l'application lit les cartes écrites dans
 * `donnees.ts`, la porte vérifie qu'elles sortent bien de ces règles.
 *
 *   titre      le h1 de la page, au caractère près ;
 *   photo      la photo de la page (`contenu.image`) ;
 *   résumé     le chapô, ou à défaut le premier paragraphe : ses premières
 *              phrases entières tant qu'elles tiennent en 190 signes (la
 *              longueur des résumés de la maquette), sinon la première phrase
 *              coupée à un mot et suivie de « … » ;
 *   minutes    la règle du projet (`minutesDeLecture`, 220 mots par minute,
 *              arrondi, plancher 2) sur les mots que la page affiche : h1,
 *              chapô, titres de parties, blocs.
 * Le sujet et les mots-clés sont choisis article par article, d'après le
 * texte, et journalisés dans `donnees.ts`. Les mots-clés ne sortent pas de la
 * règle `etiquettesDe` des 15 autres cartes : appliquée à ces billets, elle
 * colle « Coûts » à « Écoute » et « Environnement » à « environnement de
 * travail ». La porte exige en revanche que chaque mot-clé retenu ait son
 * motif `TAXE` dans le texte de la page (`etiquettesSansPreuve`).
 */

export interface FicheBlog {
  url: string;
  titre_h1: string;
  contenu: {
    chapo?: string[];
    image?: string;
    parties?: { titre: string; blocs: { type: string; texte?: string; items?: string[] }[] }[];
  };
}

const LONGUEUR_RESUME = 190;

/** Texte en ligne de la maquette (`**gras**`, `[libellé](/chemin/)`) rendu brut. */
const brut = (t: string) =>
  t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();

const textesDesBlocs = (f: FicheBlog) =>
  (f.contenu.parties ?? []).flatMap((p) => [
    p.titre,
    ...p.blocs.flatMap((b) => [b.texte ?? "", ...(b.items ?? [])]),
  ]);

/** Le texte que la page affiche : h1, chapô, titres de parties, blocs. */
export const texteDeLaPage = (f: FicheBlog) =>
  brut([f.titre_h1, ...(f.contenu.chapo ?? []), ...textesDesBlocs(f)].join(" "));

/** Les mots que la page affiche, séparés par des blancs. */
export function motsDeLaPage(f: FicheBlog): number {
  return texteDeLaPage(f)
    .split(" ")
    .filter((m) => /[\p{L}\p{N}]/u.test(m)).length;
}

export function resumeDe(f: FicheBlog): string {
  const premier = f.contenu.parties?.flatMap((p) => p.blocs).find((b) => b.type === "paragraphe")?.texte ?? "";
  const source = brut(f.contenu.chapo?.length ? f.contenu.chapo.join(" ") : premier);
  const phrases = source.split(/(?<=[.!?…])\s+/);
  let resume = "";
  for (const p of phrases) {
    const suite = resume ? `${resume} ${p}` : p;
    if (suite.length > LONGUEUR_RESUME) break;
    resume = suite;
  }
  if (resume) return resume;
  const coupe = phrases[0].slice(0, LONGUEUR_RESUME - 5);
  return `${coupe.slice(0, coupe.lastIndexOf(" ")).replace(/[\s,;:]+$/, "")}…`;
}

/** La carte d'un billet ; sujet et mots-clés sont le choix journalisé dans `donnees.ts`. */
export function carteDepuisFiche(f: FicheBlog, sujet: string, etiquettes: readonly string[]): ContenuRessource {
  return {
    url: f.url,
    titre: f.titre_h1,
    format: "Article",
    sujet,
    minutes: minutesDeLecture(motsDeLaPage(f)),
    resume: resumeDe(f),
    photo: f.contenu.image ?? "",
    etiquettes,
  };
}

/** Les mots-clés dont le motif de la maquette (`TAXE`) n'apparaît nulle part dans la page. */
export function etiquettesSansPreuve(f: FicheBlog, etiquettes: readonly string[]): string[] {
  const texte = normalise(texteDeLaPage(f));
  return etiquettes.filter((e) => !TAXONOMIE_ENTREPRISES.find(([l]) => l === e)?.[1].test(texte));
}
