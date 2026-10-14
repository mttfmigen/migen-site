/**
 * LES RÉALISATIONS LIÉES DE LA MAQUETTE MOBILE V2, pour les gabarits 01.
 *
 * LA MESURE QUI A CRÉÉ CE MODULE (14/10, comparaison des onze gabarits à
 * 390 px) : zéro lien vers `/preuves/` sur les pages du gabarit
 * « 01 Article et fiche », là où la maquette mobile en montre six à huit
 * dans sa section « Nos réalisations ».
 *
 * LA RÈGLE EST CELLE DE LA MAQUETTE, portée ligne à ligne depuis
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` :
 *
 *   casL = (CAS[u] || CAS["/" + sg[0] + "/"] || []).filter(c => c.url !== u);
 *   if (!casL.length) casL = idx.filter(x => /^\/preuves\/.+/.test(x.url)
 *     && x.url !== u).slice(0, 6).map(x => ({ url, client: short(x), t: x.h1 }));
 *   refs = casL.slice(0, 8)
 *
 * `CAS` est `maquette/contenu/site/cas-lies.json` (la maquette le charge sous
 * ce nom, ligne 287 du dc.html), `short` est `courtLibelle` du module de
 * maillage, déjà porté et déjà vérifié. RIEN NE S'INVENTE : une carte vient
 * soit des cas liés déclarés par la donnée, soit de l'index du corpus.
 *
 * Le titre de la section, « Nos réalisations », est celui que la maquette
 * écrit pour les gabarits autres que 02 (`refsSec(g === "02" ? "D'autres
 * réalisations" : "Nos réalisations")`).
 *
 * MODULE NEUTRE, ni « use client » ni « server-only » : même leçon que
 * `blocs/resume-de-section.ts`, le gabarit serveur l'importe et les portes en
 * ligne de commande aussi.
 */

import casLiesBrut from "@/maquette/contenu/site/cas-lies.json";
import indexBrut from "@/maquette/contenu/site/index.json";

import {
  courtLibelle,
  type EntreeIndex,
} from "@/components/site/cocon/maillage-mobile";
import type { SectionPreuves } from "@/types/contenu";

/** Une entrée de `cas-lies.json` : l'étude, son client, sa phrase. */
interface CasLieMobile {
  readonly url: string;
  readonly client?: string;
  readonly t?: string;
}

const CAS = casLiesBrut as Readonly<Record<string, readonly CasLieMobile[]>>;
const INDEX = indexBrut as readonly EntreeIndex[];

/** Le titre de la maquette pour la section, hors gabarit 02. */
export const TITRE_REALISATIONS = "Nos réalisations";

/** Le plafond de cartes quand les cas liés sont déclarés (dc.html, `refs`). */
const CARTES_DECLAREES = 8;
/** Le plafond du repli sur l'index (dc.html, `casL` de secours). */
const CARTES_DE_SECOURS = 6;

/**
 * La section « Nos réalisations » d'une page, prête pour `blocs/Preuves.tsx`,
 * ou `undefined` si aucune carte n'existe. Le chemin sert à exclure la page
 * elle-même et à chercher les cas liés de sa famille, comme la maquette.
 */
export function realisationsLiees(chemin: string): SectionPreuves | undefined {
  const famille = `/${chemin.split("/").filter(Boolean)[0] ?? ""}/`;
  const declarees = (CAS[chemin] ?? CAS[famille] ?? [])
    .filter((cas) => cas.url !== chemin)
    .slice(0, CARTES_DECLAREES);

  const preuves =
    declarees.length > 0
      ? declarees.map((cas) => ({
          /* La carte de la maquette : le client en titre, sa phrase dessous. */
          titre: cas.client ?? cas.url,
          texte: cas.t,
          lienHref: cas.url,
        }))
      : INDEX.filter((x) => /^\/preuves\/.+/.test(x.url) && x.url !== chemin)
          .slice(0, CARTES_DE_SECOURS)
          .map((x) => ({
            titre: courtLibelle(x),
            texte: x.h1,
            lienHref: x.url,
          }));

  if (preuves.length === 0) return undefined;
  return { type: "preuves", titre: TITRE_REALISATIONS, preuves };
}
