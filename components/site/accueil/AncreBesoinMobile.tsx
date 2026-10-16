"use client";

import { useEffect } from "react";

/**
 * UN LIEN VERS `#besoin` QUI NE MÈNE NULLE PART PREND LE FORMULAIRE DU BAS.
 *
 * Au téléphone, le panneau du héros qui porte `id="besoin"` s'efface
 * (`data-doublon-mobile`, héros court de la V3). Or « Décrire ma ligne »
 * (Notre histoire) et « Décrire mon besoin » (Pourquoi externaliser) le visent
 * toujours : le clic ne faisait plus rien. Mesuré le 16/10 à 390 px, le
 * défilement restait à 7 387 px, contre un saut au formulaire sur 79a64c9.
 *
 * La règle tient en une ligne : quand la cible d'une ancre n'est pas affichée
 * (aucune boîte), le clic mène à `vers`, le formulaire de bas de page. Elle ne
 * dépend d'aucun seuil écrit ici : au bureau, le panneau est affiché, le lien
 * garde sa cible et son comportement d'avant. Les composants des deux cartes
 * (dont l'un appartient à un autre chantier) ne sont pas touchés.
 *
 * ponytail: sans JavaScript, le lien reste muet au téléphone ; une ancre
 * dédiée au téléphone le réparerait si les cartes acceptaient deux cibles.
 */
export default function AncreBesoinMobile({ cible, vers }: { cible: string; vers: string }) {
  useEffect(() => {
    const surClic = (evenement: MouseEvent) => {
      const lien = (evenement.target as Element | null)?.closest?.(`a[href="#${cible}"]`);
      if (!lien || document.getElementById(cible)?.getClientRects().length) return;
      const repli = document.getElementById(vers);
      if (!repli) return;
      evenement.preventDefault();
      if (window.location.hash === `#${vers}`) repli.scrollIntoView();
      else window.location.hash = vers;
    };
    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, [cible, vers]);
  return null;
}
