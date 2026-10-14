import type { ContenuRessource } from "./donnees";

/**
 * Le filtrage du hub, règle pour règle celle de la maquette (`page-dc.jsx`,
 * lignes 57 à 83). Fonctions pures : le composant les appelle, la porte
 * `verification-v2.ts` les vérifie contre les comptes relevés au navigateur.
 */

export type Espace = "ent" | "tech";

/** Le titre de l'onglet par espace, `pageTitle` de la maquette (`page-dc.jsx` l. 84). */
export const TITRE_PAGE: Record<Espace, string> = {
  ent: "Ressources maintenance industrielle | Migen",
  tech: "Fiches métiers et carrière | Migen",
};
export type CleDuree = "all" | "s" | "m" | "l";
export type CleTri = "pert" | "court" | "long";

export interface Filtres {
  cat: string;
  ths: readonly string[];
  dur: CleDuree;
  tags: readonly string[];
  q: string;
}

export const FILTRES_AU_REPOS: Filtres = { cat: "all", ths: [], dur: "all", tags: [], q: "" };

/** `KINDS` de la maquette. Côté Entreprises, seuls « Tout » et « Articles » sont actifs. */
export const FORMATS: Record<Espace, readonly (readonly [string, string])[]> = {
  ent: [
    ["all", "Tout"],
    ["Article", "Articles"],
    ["Fiche pratique", "Fiches pratiques"],
    ["Fiche technique", "Fiches techniques"],
    ["Livre blanc", "Livres blancs"],
    ["Process", "Process"],
  ],
  tech: [
    ["all", "Tout"],
    ["Fiche métier", "Fiches métiers"],
    ["Guide carrière", "Guides carrière"],
    ["Alternance", "Alternance"],
  ],
};

export const SUJETS = ["Organisation", "Méthodes", "Digital & IA", "Coûts & environnement"] as const;

/** L'ordre d'affichage des mots-clés (`TAXE` et `TAXT` de la maquette). */
export const TAXONOMIE: Record<Espace, readonly string[]> = {
  ent: [
    "GMAO", "Préventive", "Corrective", "Prédictive", "Planification", "Indicateurs", "Coûts",
    "Organisation", "Sécurité", "Digital", "IA", "Robotique", "Environnement", "Arrêt de production",
    "TPM", "Externalisation",
  ],
  tech: [
    "Salaire", "Formation", "Compétences", "Alternance", "Électricité", "Mécanique", "Automatisme",
    "Robotique", "Itinérance", "Management", "Sécurité",
  ],
};

export const DUREES: readonly (readonly [CleDuree, string])[] = [
  ["all", "Tout"],
  ["s", "≤ 6 min"],
  ["m", "7–10"],
  ["l", "10 +"],
];

/** Sans accents, sans casse, apostrophes neutralisées (`nz` de la maquette). */
export const normalise = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");

const dureeRetenue = (dur: CleDuree, min: number) =>
  dur === "all" || (dur === "s" ? min <= 6 : dur === "m" ? min >= 7 && min <= 10 : min > 10);

/** Les contenus du format choisi (`inCat`). */
export const duFormat = (contenus: readonly ContenuRessource[], cat: string) =>
  contenus.filter((x) => cat === "all" || x.format === cat);

/** format ET sujets (OU) ET durée ET mots-clés (OU) ET recherche, puis le tri. */
export function filtre(
  contenus: readonly ContenuRessource[],
  f: Filtres,
  tri: CleTri,
  espace: Espace,
): ContenuRessource[] {
  const qn = normalise(f.q.trim());
  const retenus = duFormat(contenus, f.cat).filter(
    (x) =>
      (espace !== "ent" || !f.ths.length || f.ths.includes(x.sujet)) &&
      dureeRetenue(f.dur, x.minutes) &&
      (!f.tags.length || x.etiquettes.some((t) => f.tags.includes(t))) &&
      (!qn ||
        normalise(`${x.titre} ${x.resume} ${x.sujet} ${x.format} ${x.etiquettes.join(" ")}`).includes(qn)),
  );
  if (tri === "court") return retenus.slice().sort((a, b) => a.minutes - b.minutes);
  if (tri === "long") return retenus.slice().sort((a, b) => b.minutes - a.minutes);
  return retenus;
}

/** Les pastilles de filtres actifs, dans l'ordre de la maquette. */
export function pastilles(f: Filtres, espace: Espace): { cle: string; libelle: string }[] {
  const out: { cle: string; libelle: string }[] = [];
  if (f.cat !== "all") out.push({ cle: "cat", libelle: FORMATS[espace].find((k) => k[0] === f.cat)?.[1] ?? f.cat });
  f.ths.forEach((t) => out.push({ cle: `th:${t}`, libelle: t }));
  if (f.dur !== "all") out.push({ cle: "dur", libelle: `${DUREES.find((d) => d[0] === f.dur)?.[1]} de lecture` });
  f.tags.forEach((t) => out.push({ cle: `tag:${t}`, libelle: `#${t}` }));
  if (f.q.trim()) out.push({ cle: "q", libelle: `« ${f.q.trim()} »` });
  return out;
}

/**
 * Le nombre de colonnes de la grille (`mainW` et lignes 82-83 de la maquette).
 * `largeur` = `min(clientWidth, 1440)`, `vw` = `innerWidth`.
 */
export function colonnes(n: number, largeur: number, vw: number): { cols: number; large: boolean } {
  const pad = vw <= 640 ? 28 : 48;
  const cote = vw <= 760 ? 0 : vw <= 1100 ? 260 : 320;
  const gw = Math.max(240, Math.min(largeur, 1440) - pad - cote);
  const maxC = Math.max(1, Math.min(4, Math.floor((gw + 12) / 252)));
  if (n <= maxC || maxC < 2) return { cols: maxC, large: false };
  const cs: number[] = [];
  for (let c = maxC; c >= 2; c--) cs.push(c);
  const cols = cs.find((c) => n % c === 0) ?? cs.find((c) => n % c !== 1) ?? maxC;
  return { cols, large: n % cols === 1 };
}

/** Deux chiffres, `String(n).padStart(2, "0")`. */
export const deux = (n: number) => String(n).padStart(2, "0");

/** Les trois premières étiquettes, séparées de trois espaces, comme la carte. */
export const etiquettesCarte = (x: ContenuRessource) =>
  x.etiquettes.slice(0, 3).map((t) => `#${t}`).join("   ");
