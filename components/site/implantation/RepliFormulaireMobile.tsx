"use client";

import { useEffect, useRef, type ReactNode } from "react";

import stylesVille from "./PageVille.module.css";

/**
 * LE FORMULAIRE DU HÉROS DERRIÈRE UNE BASCULE, SUR TÉLÉPHONE SEULEMENT (G2).
 *
 * POURQUOI PAS `SectionPliableMobile`. Lui sert les SECTIONS DE CONTENU, et deux
 * portes le gardent : `scripts/verifie-blocs-pliables.mjs` exige un titre de
 * niveau (`<h2>`) dans chaque bloc, `scripts/verifie-titres-replies.mjs`
 * interdit d'en mettre un dans l'étiquette de la bascule. Un panneau de
 * formulaire n'a pas de titre de niveau (son titre est un `<div>` du lot
 * offre) : il ne peut satisfaire les deux qu'en inventant un intertitre. Ce
 * n'est d'ailleurs pas une section : c'est le même formulaire que « 10 Appel
 * final », posé une seconde fois en tête de page. Il a donc sa propre bascule,
 * et sa propre porte (`verification-mobile-ville.tsx`, verdict 2).
 *
 * LE MÊME CONTRAT QUE LE REPLI DES SECTIONS : rendu OUVERT par le serveur (tout
 * le panneau est dans le HTML), refermé après montage sous 880 px seulement ;
 * au-dessus, la bascule n'existe pas (`display: none`, donc ni vue ni arrêt de
 * tabulation) et le contenu reste affiché même si le bloc était refermé. Aucun
 * champ ni aucune soumission ne change : le panneau est enveloppé, pas modifié.
 *
 * L'étiquette est le titre DU panneau, copie du corpus, et s'efface une fois
 * le panneau ouvert, qui le rend lui-même.
 */
export default function RepliFormulaireMobile({
  etiquette,
  children,
}: {
  etiquette: string;
  children: ReactNode;
}) {
  const bloc = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    /* Au chargement seulement : un visiteur qui l'a ouvert le garde ouvert. */
    if (bloc.current && window.matchMedia("(max-width: 880px)").matches) bloc.current.open = false;
    // Monté : le contenu, masqué au premier affichage (globals.css), peut paraître.
    bloc.current?.setAttribute("data-monte", "");
  }, []);

  return (
    <details ref={bloc} open className={stylesVille.repliFormulaire} data-repli-formulaire="">
      <summary className={stylesVille.basculeFormulaire}>
        <span data-mobile-seulement="" className={stylesVille.etiquettePanneau}>
          {etiquette}
        </span>
        <span aria-hidden="true" data-mobile-seulement="" className={stylesVille.chevronFormulaire}>
          &rsaquo;
        </span>
      </summary>
      {children}
    </details>
  );
}
