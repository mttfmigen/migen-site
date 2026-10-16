"use client";

import { useEffect } from "react";

import { ID_RAPPEL_FINAL } from "./conversion-donnees";

/**
 * AU TÉLÉPHONE, UN LIEN VERS LE FORMULAIRE MASQUÉ MÈNE À LA CARTE.
 *
 * Sous 881 px, le formulaire complet replié qui suit la carte `#etre-rappele`
 * est masqué (`RappelFinalMobile.module.css`) : la carte porte le même. Les
 * liens qui le visaient (`#mgx-form` du photo + CTA et de la FAQ des offres et
 * des villes, `#formulaire` des pages « à propos », `#cx-form` des guides)
 * n'auraient plus de cible, ou ressortiraient une bascule fermée sous la
 * carte : ils mènent à la carte, comme le bandeau « Être rappelé ».
 *
 * Le lien n'est détourné que si sa cible est dans ce voisin ET que ce voisin
 * n'est pas affiché. Sur bureau, la carte n'a pas de boîte : rien ne change.
 * Clic en phase de capture, avant `OuvreLaCible`.
 */
export default function RenvoiVersLaCarte() {
  useEffect(() => {
    const surClic = (evenement: MouseEvent) => {
      const lien = (evenement.target as Element | null)?.closest?.('a[href^="#"]');
      const carte = document.getElementById(ID_RAPPEL_FINAL);
      const voisin = carte?.nextElementSibling;
      if (!lien || !carte || !voisin) return;
      if (!carte.getClientRects().length || voisin.getClientRects().length) return;
      const cible = document.getElementById(lien.getAttribute("href")!.slice(1));
      if (!cible || !voisin.contains(cible)) return;
      evenement.preventDefault();
      // Même fragment déjà posé : le navigateur ne redéfilerait pas.
      if (window.location.hash === `#${ID_RAPPEL_FINAL}`) carte.scrollIntoView();
      else window.location.hash = ID_RAPPEL_FINAL;
    };
    document.addEventListener("click", surClic, true);
    return () => document.removeEventListener("click", surClic, true);
  }, []);
  return null;
}
