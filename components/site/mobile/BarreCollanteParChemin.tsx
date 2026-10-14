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
  const premier = chemin.split("/").filter(Boolean)[0];
  return <BarreCollanteMobile variante={premier === "carriere" ? "carriere" : "standard"} />;
}
