/**
 * LES DONNÉES MOBILES DES GABARITS 02 (étude de cas) ET 07 (fiche métier),
 * portées du SEUL calcul de la maquette mobile v2
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`), jamais rédigées :
 *
 *   L226      `FAM` : le libellé de famille du premier niveau du fil d'Ariane,
 *             verbatim (« Réalisations » pour /preuves/, « Carrière » pour
 *             /carriere/…).
 *   L423-426  les réalisations liées d'une page : l'entrée de
 *             `contenu/site/cas-lies.json` pour la page, sinon celle de sa
 *             famille, sinon les six premières études de cas de l'index
 *             (client = libellé court, t = h1). La page courante est écartée.
 *   L427      `refs = casL.slice(0, 8)` : huit cartes au plus.
 *   L490-492  le badge de lecture du héros : `max(2, round(mots / 230))`,
 *             gabarits 01, 02 et 07 seulement, « N min de lecture ». La même
 *             formule sert déjà les pastilles du cocon
 *             (`cocon/maillage-mobile.ts`, `carteDe`) : c'est LA donnée
 *             minutes de la maquette, aucune autre n'est calculée.
 *   L495-497  le fil d'Ariane : « Accueil », puis chaque niveau intermédiaire
 *             PRÉSENT dans l'index (libellé de famille au premier niveau,
 *             libellé court ensuite, adresse passée par REMAP), puis la page
 *             courante en texte.
 *
 * POURQUOI UN MODULE NEUTRE, sans « use client » ni « server-only » : même
 * leçon que `blocs/resume-de-section.ts`. Les gabarits serveur l'importent, la
 * porte en ligne de commande aussi ; une directive dans un sens ou l'autre
 * casserait l'un des deux sans que `bunx tsc --noEmit` ne le dise.
 *
 * ZÉRO DONNÉE INVENTÉE : tout vient de `cas-lies.json`, de `index.json` et des
 * libellés dérivés de `cocon/maillage-mobile.ts`. « Lire le cas » est le
 * libellé verbatim des cartes de la maquette (template, « Lire le cas → »).
 */
import casLiesBrut from "@/maquette/contenu/site/cas-lies.json";
import indexBrut from "@/maquette/contenu/site/index.json";

import {
  courtLibelle,
  entreeDe,
  gabaritDe,
  REMAP,
  type EntreeIndex,
} from "@/components/site/cocon/maillage-mobile";
import type { SectionPreuves } from "@/types/contenu";

/** Une réalisation liée, telle que `cas-lies.json` l'écrit. */
export interface CasLie {
  readonly url: string;
  readonly client: string;
  readonly t: string;
}

const CAS_LIES = casLiesBrut as Readonly<Record<string, readonly CasLie[]>>;
const INDEX = indexBrut as readonly EntreeIndex[];

/** dc.html L226, verbatim : le libellé de famille du fil d'Ariane. */
export const FAMILLES: Readonly<Record<string, string>> = {
  offres: "Offres",
  expertises: "Expertises",
  secteurs: "Secteurs",
  implantations: "Implantations",
  preuves: "Réalisations",
  ressources: "Ressources",
  carriere: "Carrière",
  "travaux-industriels": "Travaux industriels",
  "bureau-etudes": "Bureau d’études",
  guides: "Guides",
  "a-propos": "À propos",
  "entreprise-maintenance-industrielle": "Migen",
};

/**
 * Le badge « N min de lecture » du héros mobile (dc.html L490-492).
 * `undefined` hors des gabarits 01, 02 et 07, ou sans compte de mots.
 */
export function minutesDeLecture(chemin: string): string | undefined {
  const entree = entreeDe(chemin);
  if (!entree || entree.mots <= 0) return undefined;
  const g = gabaritDe(entree);
  if (g !== "01" && g !== "02" && g !== "07") return undefined;
  return `${Math.max(2, Math.round(entree.mots / 230))} min de lecture`;
}

/** Un niveau du fil d'Ariane, dans la forme que `FilArianeVue` consomme. */
export interface EtapeFilAriane {
  readonly titre: string;
  readonly path: string | null;
}

/**
 * Le fil d'Ariane d'une page, calcul de dc.html L495-497 : « Accueil » est
 * rendu par `FilArianeVue` elle-même, ce tableau porte les niveaux suivants.
 * Un niveau absent de l'index est sauté, comme dans la maquette (`if (by[pth])`).
 * Le dernier élément est la page courante : `FilArianeVue` la rend en texte.
 */
export function etapesFilAriane(chemin: string): EtapeFilAriane[] {
  const entree = entreeDe(chemin);
  if (!entree || chemin === "/") return [];
  const segments = chemin.split("/").filter(Boolean);
  const etapes: EtapeFilAriane[] = [];
  for (let k = 1; k < segments.length; k++) {
    const pth = `/${segments.slice(0, k).join("/")}/`;
    const niveau = entreeDe(pth);
    if (!niveau) continue;
    etapes.push({
      titre:
        k === 1
          ? (FAMILLES[segments[0]] ?? courtLibelle(niveau))
          : courtLibelle(niveau),
      path: REMAP[pth] ?? pth,
    });
  }
  /* dc.html L497, `crumbCur` : famille seule au premier niveau, libellé court
     ensuite. Nos deux gabarits ont toujours au moins deux segments. */
  etapes.push({
    titre:
      segments.length === 1
        ? (FAMILLES[segments[0]] ?? courtLibelle(entree))
        : courtLibelle(entree),
    path: chemin,
  });
  return etapes;
}

/**
 * Les réalisations liées d'une page (dc.html L423-427) : l'entrée de la page,
 * sinon celle de sa famille, sinon les six premières études de cas de l'index.
 * Huit cartes au plus, et jamais la page courante.
 */
export function realisationsLiees(chemin: string): readonly CasLie[] {
  const famille = `/${chemin.split("/").filter(Boolean)[0] ?? ""}/`;
  const liees = (CAS_LIES[chemin] ?? CAS_LIES[famille] ?? []).filter(
    (c) => c.url !== chemin,
  );
  if (liees.length > 0) return liees.slice(0, 8);
  return INDEX.filter(
    (x) => /^\/preuves\/.+/.test(x.url) && x.url !== chemin,
  )
    .slice(0, 6)
    .map((x) => ({ url: x.url, client: courtLibelle(x), t: x.h1 }));
}

/** Le libellé du lien des cartes, verbatim du template (« Lire le cas → »). */
export const LIRE_LE_CAS = "Lire le cas";

/**
 * Les réalisations liées dans la forme de `blocs/Preuves.tsx` : le client en
 * titre de carte, le titre de l'étude en texte, le lien vers l'étude de cas.
 * `titre` est celui que le gabarit passe, verbatim dc.html L469 :
 * « D’autres réalisations » sur une étude de cas, « Nos réalisations » ailleurs.
 */
export function sectionRealisations(
  chemin: string,
  titre: string,
): SectionPreuves | null {
  const cas = realisationsLiees(chemin);
  if (cas.length === 0) return null;
  return {
    type: "preuves",
    titre,
    preuves: cas.map((c) => ({
      titre: c.client,
      texte: c.t,
      lienHref: c.url,
      lienLibelle: LIRE_LE_CAS,
    })),
  };
}
