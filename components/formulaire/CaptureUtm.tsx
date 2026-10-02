"use client";

import { useEffect } from "react";

import { memoriseAttribution } from "@/lib/utm";

/**
 * Mémorise l'attribution de la visite dès la première page vue.
 *
 * À monter une fois dans la mise en page racine, pas dans le formulaire : les
 * UTM arrivent sur la page d'entrée, qui n'est presque jamais celle qui porte
 * le formulaire.
 *
 * Lit `window.location` plutôt que `useSearchParams` : ce dernier sort la page
 * du rendu statique, et le site doit servir du HTML complet. L'effet ne tourne
 * qu'au premier montage, ce qui suffit puisque seule la page d'entrée compte.
 *
 * Rien ne sort du navigateur ici, et rien n'en sortira si le visiteur n'envoie
 * pas le formulaire : l'attribution part alors avec sa demande, comme une donnée
 * de cette demande.
 *
 * En revanche, la CONSERVER d'une page à l'autre est bien un traceur. C'est
 * pourquoi `memoriseAttribution` n'écrit dans le `sessionStorage` que si la
 * finalité publicitaire est accordée, et garde sinon l'attribution en mémoire
 * vive, le temps du document (voir lib/utm.ts).
 */
export function CaptureUtm() {
  useEffect(() => {
    memoriseAttribution(window.location);
  }, []);

  return null;
}
