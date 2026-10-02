"use client";

import { ouvrePanneau } from "./etat";

/**
 * Lien permanent de réglage du consentement, à poser dans le pied de page.
 *
 * Exigence CNIL : retirer son accord doit être aussi simple que de le donner,
 * et possible à tout moment. Un bouton plutôt qu'un lien, parce qu'il n'y a pas
 * de page de destination : il rouvre le détail par finalité.
 */
export default function LienReglages() {
  return (
    <button
      type="button"
      onClick={ouvrePanneau}
      className="text-sm underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Gérer mes traceurs
    </button>
  );
}
