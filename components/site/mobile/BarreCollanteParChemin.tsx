"use client";

import { usePathname } from "next/navigation";

import BarreCollanteMobile from "./BarreCollanteMobile";

/**
 * La barre collante de la maquette mobile v2, montée par la mise en page.
 *
 * dc.html L580 : `stickyShow: g !== "contact"`, et `stickyL: isCar ?
 * "Postuler" : "Décrire mon besoin"` avec `isCar` le premier segment
 * `carriere`. La mise en page est un composant serveur et ne connaît pas le
 * chemin courant : `usePathname` est la seule source qui survit aux
 * navigations côté client, d'où cette enveloppe.
 *
 * Elle REMPLACE la barre v1 (`BarreActionMobile`, maquette v1) : deux barres
 * fixes se recouvriraient. La réserve de place de la v1 (`--barre-reserve`)
 * est neutralisée dans `app/globals.css` quand celle-ci est dans le DOM.
 */
export default function BarreCollanteParChemin() {
  const chemin = usePathname() ?? "/";
  if (chemin === "/contact" || chemin.startsWith("/contact/")) return null;
  /* `%2F` aussi : Vercel rend une page non figée à la construction (publiée
     après le déploiement) avec la barre oblique de l'attrape-tout encodée,
     `/carriere%2Felectromecanicien`. Lu `/` seul, le serveur rendait
     « Décrire mon besoin » et le navigateur « Postuler » : erreur React #418. */
  const premier = chemin.split(/\/|%2F/i).filter(Boolean)[0];
  return <BarreCollanteMobile variante={premier === "carriere" ? "carriere" : "standard"} />;
}
