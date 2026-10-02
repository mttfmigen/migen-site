import type { CSSProperties } from "react";

import { VERRE } from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage propres au gabarit des implantations, relevées dans la
 * maquette (« Migen - Site final.dc.html », lignes 6932 à 7077).
 *
 * Ce qui est commun à tout le site (surtitre, boutons, gouttière, panneau
 * sombre) vient de `components/site/blocs/habillage.ts` : seules les valeurs
 * que cette page écrit différemment sont ici.
 */

/**
 * Le verre de cette page : même recette que `VERRE`, ombre plus portée.
 * La maquette écrit ici `0 26px 60px -36px rgba(0,0,0,.34)` là où les pages
 * d'offre écrivent `0 22px 50px -32px rgba(0,0,0,.3)`. L'écart se voit sur les
 * grandes cartes d'agence, il est donc recopié tel quel.
 */
export const VERRE_IMPL: CSSProperties = {
  ...VERRE,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
};

/** La lueur orange en haut à droite d'un panneau sombre. */
export const LUEUR_HAUT: CSSProperties = {
  position: "absolute",
  width: 360,
  height: 360,
  right: -140,
  top: -160,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

/** Le H2 des sections de la page. */
export const TITRE_SECTION: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 34px",
  textWrap: "balance",
  maxWidth: "24ch",
};

/** Une entrée du maillage de villes ou de départements. */
export const LIEN_COUVERTURE: CSSProperties = { font: "500 14.5px/2 var(--fb)" };

/** L'intitulé orange en capitales d'une carte de maillage. */
export const INTITULE_CARTE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};
