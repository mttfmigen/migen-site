import type { CSSProperties } from "react";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

/**
 * LE TÉLÉPHONE DU HÉROS MOBILE, à côté du bouton d'action, comme la maquette
 * mobile v2 le pose (`Migen - Mobile v2.dc.html` L111 et L493 :
 * `telL: (P && P.phone) || "04 78 33 72 05"`, pastille blanche à bord discret,
 * 50 px de haut). Le corpus l'écrit lui-même dans l'encadré du héros
 * (« [Faire chiffrer mon arrêt](/contact/) · 04 78 33 72 05 ») : l'import
 * l'avait laissé tomber, rien n'est inventé.
 *
 * Le numéro est celui de l'en-tête (`TELEPHONE_SITE`), même `href` : un
 * second format de lien ferait deux entrées dans les analyses d'appel.
 *
 * `data-mobile-seulement` : la capture de bureau ne le rend pas dans le héros,
 * et au-dessus de 880 px rien ne change.
 */
const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 50,
  padding: "0 16px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.1)",
  color: "var(--ink)",
  font: "600 13.5px var(--fb)",
  whiteSpace: "nowrap",
};

export default function TelephoneHeros() {
  return (
    <a data-mobile-seulement="" href={TELEPHONE_SITE.href} style={PASTILLE}>
      {TELEPHONE_SITE.affichage}
    </a>
  );
}
