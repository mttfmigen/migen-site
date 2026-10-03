import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { LienOffre } from "@/types/offre";

/**
 * La sûreté des cibles du gabarit offre.
 *
 * Un seul sujet : ce gabarit reçoit ses cibles d'un `jsonb`, où un chemin est
 * une chaîne comme une autre. Même règle que `TexteRiche` sur le maillage du
 * corpus, et que `secteur/PucesLiens.tsx` sur le gabarit voisin, étendue à
 * l'ancre de la page.
 *
 * UNE CIBLE REFUSÉE FAIT DISPARAÎTRE LE LIEN, libellé compris. Elle n'est pas
 * rafistolée vers une cible de repli : un bouton qui mène ailleurs sous
 * l'autorité du domaine est pire qu'un bouton absent, et un bouton rafistolé
 * vers une cible inventée est pire que les deux.
 */
export function cibleSure(href: string): boolean {
  return estCheminInterne(href) || href.startsWith("#");
}

export function liensSurs(liens: readonly LienOffre[]): LienOffre[] {
  return liens.filter((l) => !!l.libelle && !!l.href && cibleSure(l.href));
}
