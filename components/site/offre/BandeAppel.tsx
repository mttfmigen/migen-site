import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { LienOffre } from "@/types/offre";

import { lienSur } from "./LiensOffre";
import { BANDE, BANDE_BOUTON, BANDE_TEXTE } from "./habillage-offre";

import styles from "./PageOffre.module.css";

/**
 * La bande en verre de la maquette : une phrase à gauche, un bouton orange à
 * droite (`site-final.html`, l. 4767 sous « En bref », l. 4959 sous « Ce qui est
 * inclus »).
 *
 * POURQUOI UN COMPOSANT POUR DOUZE LIGNES DE JSX : la maquette pose exactement la
 * même bande à deux endroits de la page, et le portage l'avait écrite deux fois
 * mot pour mot, dans `PageOffre.tsx` et dans `CeQuiEstInclus.tsx`, avec deux
 * orthographes différentes de la même garde de cible. Deux copies, c'est deux
 * endroits à corriger au prochain ajustement de la bande, et la garantie que
 * l'un des deux sera oublié. La maquette n'a qu'une bande : le site n'en a plus
 * qu'une non plus.
 *
 * LE BOUTON DISPARAÎT SI SA CIBLE EST REFUSÉE, libellé compris (`lienSur`). La
 * phrase reste : c'est du texte de la maquette, il se lit sans bouton.
 */
export default function BandeAppel({
  texte,
  bouton,
}: {
  texte: string;
  bouton?: LienOffre;
}) {
  const lien = lienSur(bouton);

  return (
    <div style={BANDE}>
      <span style={BANDE_TEXTE}>
        <TexteRiche texte={texte} />
      </span>
      {lien ? (
        <a
          href={lien.href}
          className={styles.boutonPrincipal}
          style={BANDE_BOUTON}
        >
          {lien.libelle}
        </a>
      ) : null}
    </div>
  );
}
