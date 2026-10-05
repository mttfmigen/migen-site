import Link from "next/link";

import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { LienSecteur } from "@/types/secteur";

import { PUCE, RANGEE_PUCES } from "./habillage-secteur";
import styles from "./PageSecteur.module.css";

/**
 * Les cibles du gabarit secteur, et les pastilles qui les portent.
 *
 * Un seul sujet, celui de la sûreté des liens : le gabarit reçoit ses cibles
 * d'un `jsonb`, et un chemin y est une chaîne comme une autre.
 */

/**
 * La cible est-elle sûre ?
 *
 * Même règle que `TexteRiche` sur le maillage du corpus, étendue à l'ancre de
 * la page : un chemin interne, ou un `#ancre`. Une cible refusée fait DISPARAÎTRE
 * le lien, elle n'est pas remplacée : un bouton qui mène ailleurs sous
 * l'autorité du domaine est pire qu'un bouton absent, et un bouton rafistolé
 * vers une cible inventée est pire que les deux.
 */
export function cibleSure(href: string): boolean {
  return estCheminInterne(href) || href.startsWith("#");
}

/* Générique, et pas simplement `LienSecteur[]` : les gabarits enrichissent ce
   lien (le maillage des implantations y ajoute `contexte`, la phrase du corpus
   où le lien a été écrit). Une signature non générique rabotait ce champ au
   passage, et le composant ne pouvait plus le lire. Le filtre ne retire aucune
   propriété : le type ne doit pas en retirer non plus. */
export function liensSurs<T extends LienSecteur>(liens: readonly T[]): T[] {
  return liens.filter((l) => !!l.libelle && !!l.href && cibleSure(l.href));
}

/** Les pastilles de pages sœurs, mêmes valeurs dans les deux gabarits. */
export default function PucesLiens({
  liens,
}: {
  liens: readonly LienSecteur[];
}) {
  return (
    <div style={RANGEE_PUCES}>
      {liens.map((lien) => (
        <Link
          key={lien.href}
          href={lien.href}
          prefetch={false}
          className={styles.puceLien}
          style={{ ...PUCE, transition: "background var(--tr)" }}
        >
          {lien.libelle}
        </Link>
      ))}
    </div>
  );
}
