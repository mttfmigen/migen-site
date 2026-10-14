"use client";

import { usePathname } from "next/navigation";

import BarreActionMobile from "./BarreActionMobile";

/**
 * La barre d'action basse, AVEC LA VARIANTE CARRIÈRE de la maquette mobile v2.
 *
 * La maquette écrit, pour sa barre collante :
 * `stickyL: isCar ? "Postuler" : "Décrire mon besoin"` avec
 * `isCar = premier segment === "carriere"`. Montée sans variante depuis
 * `app/layout.tsx`, la barre envoyait le candidat des pages `/carriere/**`
 * vers `/contact/`, l'entonnoir commercial.
 *
 * LA CIBLE EST `/carriere/#postuler` ET NON `#postuler-chez-migen` : la
 * maquette vise sa propre ancre, qui n'existe pas sur ce site. La section de
 * candidature du hub carrière porte `id="postuler"`
 * (`components/site/metier/PostulerMetier.tsx`), existence tenue par
 * `verification-carriere.tsx`. Le hub plutôt que l'ancre locale, comme la
 * maquette : toutes les pages `/carriere/**` ont ainsi la même cible, y
 * compris celles dont le contenu ne porte pas de section « postuler ».
 *
 * POURQUOI UN COMPOSANT CLIENT À PART : la mise en page est un composant
 * serveur et ne connaît pas le chemin courant ; `usePathname` est la seule
 * source du chemin qui survit aux navigations côté client. La barre
 * elle-même reste inchangée, elle est seulement appelée avec ses props.
 */
export default function BarreActionMobileParChemin() {
  const chemin = usePathname() ?? "";
  const estCarriere = chemin === "/carriere" || chemin.startsWith("/carriere/");

  if (estCarriere) {
    return <BarreActionMobile libelle="Postuler" href="/carriere/#postuler" />;
  }
  return <BarreActionMobile />;
}
