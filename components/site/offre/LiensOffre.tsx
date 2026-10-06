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

/**
 * Le même filtre, pour UN lien facultatif.
 *
 * POURQUOI ICI ET PAS CINQ FOIS AILLEURS : la garde
 * `bouton?.href && cibleSure(bouton.href) ? bouton.href : null` était recopiée
 * dans `CarteFormule`, `CeQuiEstInclus`, `BlocsZeroArret`, `Realisations` et en
 * ligne dans `PageOffre`. Cinq copies d'une règle de sûreté, c'est cinq endroits
 * où la prochaine correction peut en oublier un, dans le fichier même qui a pour
 * seule raison d'être de centraliser la sûreté des cibles.
 *
 * Elle rend le lien ENTIER, pas seulement sa cible : un libellé sans cible ne
 * sert à rien, et les cinq appelants testaient les deux de toute façon.
 */
export function lienSur(lien?: LienOffre): LienOffre | null {
  if (!lien?.libelle || !lien.href || !cibleSure(lien.href)) return null;
  return lien;
}
