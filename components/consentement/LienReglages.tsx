"use client";

import type { CSSProperties } from "react";

import { ouvrePanneau } from "./etat";

/**
 * Lien permanent de réglage du consentement, à poser dans le pied de page.
 *
 * Exigence CNIL : retirer son accord doit être aussi simple que de le donner,
 * et possible à tout moment. Un bouton plutôt qu'un lien, parce qu'il n'y a pas
 * de page de destination : il rouvre le détail par finalité.
 *
 * Le pied des landing pages (/lp/) le pose avec le libellé et le dessin de la
 * maquette V3, « Préférences cookies » : même bouton, même effet.
 */
export default function LienReglages({
  libelle = "Gérer mes cookies",
  style,
}: {
  libelle?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={ouvrePanneau}
      className={
        style
          ? undefined
          : "text-sm underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
      }
      style={style}
    >
      {libelle}
    </button>
  );
}
