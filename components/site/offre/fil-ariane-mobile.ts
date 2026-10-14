/**
 * LES ÉTAPES DU FIL D'ARIANE MOBILE, calculées comme la maquette les calcule.
 *
 * SOURCE : `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` L495-497.
 * La maquette monte « Accueil », puis chaque préfixe du chemin QUI EXISTE DANS
 * L'INDEX (`if (by[pth]) crumbs.push(...)`), en passant les adresses
 * détournées par son `RM` (nos `REMAP`), et termine par la page courante en
 * texte plein (`crumbCur`).
 *
 * POURQUOI CE MODULE EST ICI et non dans le gabarit : `PageOffre` est un
 * composant SERVEUR montable hors base (contrat du fichier) ; le fil d'Ariane
 * de la base passe par `lib/contenu`, interdit ici. L'index de la maquette,
 * lui, est une donnée embarquée, la même que lisent les pastilles du cocon
 * (`cocon/maillage-mobile.ts`) : une seule source, aucun niveau rédigé à la
 * main.
 *
 * MODULE NEUTRE, sans directive, comme `telephone-maquette.ts`.
 */
import {
  courtLibelle,
  entreeDe,
  REMAP,
} from "@/components/site/cocon/maillage-mobile";

export interface EtapeAriane {
  readonly titre: string;
  readonly path: string | null;
}

/**
 * Les étapes du fil pour `FilArianeVue`, « Accueil » exclu (le composant le
 * pose lui-même). Un chemin hors index rend une liste vide : la rangée ne se
 * dessine pas, plutôt qu'un fil inventé.
 */
export function etapesArianeMobile(chemin: string): EtapeAriane[] {
  const page = entreeDe(chemin);
  if (!page) return [];

  const segments = chemin.split("/").filter(Boolean);
  const etapes: EtapeAriane[] = [];

  /* Les ancêtres : chaque préfixe présent dans l'index, détourné par REMAP
     comme la maquette le fait (dc.html L496, `href: RM[pth] || pth`). */
  for (let k = 1; k < segments.length; k++) {
    const prefixe = `/${segments.slice(0, k).join("/")}/`;
    const entree = entreeDe(prefixe);
    if (!entree) continue;
    etapes.push({ titre: courtLibelle(entree), path: REMAP[prefixe] ?? prefixe });
  }

  /* La page courante, en dernier : `FilArianeVue` la rend en texte avec
     `aria-current="page"`, comme la maquette rend son `crumbCur` en plein. */
  etapes.push({ titre: courtLibelle(page), path: chemin });
  return etapes;
}
