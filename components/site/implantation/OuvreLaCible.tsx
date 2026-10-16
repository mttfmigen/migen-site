"use client";

import { useEffect } from "react";

/**
 * UNE ANCRE VERS UN BLOC REPLIÉ L'OUVRE, SUR TOUS LES NAVIGATEURS.
 *
 * Sur téléphone, le panneau de formulaire du héros (`#besoin`) vit replié dans
 * un `<details>` (G2, héros compact de la maquette mobile v2). Or les quatre à
 * cinq boutons de la page visent `#besoin` : le bouton du héros, les bandes
 * d'appel, « Démarrer par l'audit », le photo + CTA. Chrome rouvre seul le
 * `<details>` ancêtre d'une cible d'ancre ; d'autres moteurs ne le font pas,
 * et le visiteur atterrirait sur un bloc fermé. Ce composant ouvre donc les
 * `<details>` ancêtres de la cible AVANT la navigation (clic en phase de
 * capture), puis à l'arrivée par une adresse qui porte déjà le fragment.
 *
 * Il ne touche à aucun champ ni à aucune soumission : il pose `open`.
 * Monté EN DERNIER dans la page, pour que son effet passe après celui de
 * `SectionPliableMobile`, qui referme les blocs au chargement.
 */
function ouvreLesAncetres(id: string) {
  const cible = id ? document.getElementById(id) : null;
  for (let noeud = cible; noeud; noeud = noeud.parentElement) {
    if (noeud instanceof HTMLDetailsElement) noeud.open = true;
  }
  /* Une cible qui ENVELOPPE un formulaire replié (`#mgx-form` : l'appel
     final et son repli « Décrire mon besoin en détail ») l'ouvre aussi : le
     bouton qui y mène montre le formulaire, pas une seconde bascule. */
  cible?.querySelectorAll<HTMLDetailsElement>("details[data-repli-formulaire]").forEach((repli) => {
    repli.open = true;
  });
}

function idDuFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment.replace(/^#/, ""));
  } catch {
    return "";
  }
}

export default function OuvreLaCible() {
  useEffect(() => {
    const surClic = (evenement: MouseEvent) => {
      const lien = (evenement.target as Element | null)?.closest?.('a[href^="#"]');
      if (lien) ouvreLesAncetres(idDuFragment(lien.getAttribute("href") ?? ""));
    };
    const surFragment = () => ouvreLesAncetres(idDuFragment(window.location.hash));
    surFragment();
    document.addEventListener("click", surClic, true);
    window.addEventListener("hashchange", surFragment);
    return () => {
      document.removeEventListener("click", surClic, true);
      window.removeEventListener("hashchange", surFragment);
    };
  }, []);
  return null;
}
