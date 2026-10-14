/**
 * LE FIL D'ARIANE DE LA MAQUETTE MOBILE V2, pour les gabarits 04 et 06.
 *
 * PORTÉ DE `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` L495-497 :
 *
 *   const crumbs = [];
 *   if (u !== "/") { crumbs.push({ l: "Accueil", href: "/" });
 *     for (let k = 1; k < sg.length; k++) { const pth = "/" + sg.slice(0, k)
 *       .join("/") + "/"; if (by[pth]) crumbs.push({ l: k === 1 ?
 *       (this.FAM[sg[0]] || short(by[pth])) : short(by[pth]),
 *       href: RM[pth] || pth }); } }
 *   const crumbCur = e ? (sg.length === 1 ? (this.FAM[sg[0]] || short(e))
 *     : short(e)) : "";
 *
 * CHAQUE LIBELLÉ EST DÉRIVÉ, RIEN N'EST RÉDIGÉ : « Implantations » est
 * l'entrée `implantations` de la table `FAM` de la maquette (même fichier),
 * les autres niveaux passent par `courtLibelle` de `cocon/maillage-mobile`,
 * qui dérive du h1, du title ou de l'URL de l'index. Une page absente de
 * l'index ne produit AUCUN fil : vide plutôt que faux.
 *
 * « Accueil » n'est pas dans la liste : `FilArianeVue` le pose elle-même.
 *
 * MODULE NEUTRE, ni « use client » ni « server-only » : le gabarit serveur
 * l'importe, la porte en ligne de commande aussi (même leçon que
 * `blocs/resume-de-section.ts`).
 */
import {
  courtLibelle,
  entreeDe,
  REMAP,
} from "@/components/site/cocon/maillage-mobile";

/** La forme que `FilArianeVue` attend : la page courante a `path: null`. */
export interface EtapeFilMobile {
  readonly titre: string;
  readonly path: string | null;
}

/** `FAM["implantations"]`, dc.html (table `FAM`) : le libellé de la rubrique. */
const FAMILLES: Readonly<Record<string, string>> = {
  implantations: "Implantations",
};

export function etapesDe(chemin: string): EtapeFilMobile[] {
  const segments = chemin.split("/").filter(Boolean);
  const courant = entreeDe(chemin);
  /* Pas d'entrée d'index, pas de libellé dérivable : pas de fil (zéro donnée
     inventée). Le h1 de la page n'est pas un repli : la maquette emploie le
     libellé COURT (`short`), jamais le h1 entier. */
  if (!courant || segments.length === 0) return [];

  const etapes: EtapeFilMobile[] = [];
  for (let k = 1; k < segments.length; k++) {
    const pth = `/${segments.slice(0, k).join("/")}/`;
    const entree = entreeDe(pth);
    if (!entree) continue; /* dc.html L496 : `if (by[pth])` */
    etapes.push({
      titre: k === 1 ? (FAMILLES[segments[0]] ?? courtLibelle(entree)) : courtLibelle(entree),
      path: REMAP[pth] ?? pth,
    });
  }
  etapes.push({
    titre:
      segments.length === 1
        ? (FAMILLES[segments[0]] ?? courtLibelle(courant))
        : courtLibelle(courant),
    path: null,
  });
  return etapes;
}
