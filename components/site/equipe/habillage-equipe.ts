import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage de l'écran « Équipe / Direction », relevées dans
 * `maquette/accueil-rendu.html`, lignes 5845 à 6030.
 *
 * Même logique que `secteur/habillage-secteur.ts` : ce qui est commun au site
 * est IMPORTÉ de `blocs/habillage.ts`, pas recopié. Seuls les écarts de cet
 * écran sont ici, avec la valeur exacte de la maquette.
 *
 * Les survols ne sont pas ici : un style en ligne ne porte pas d'état, ils
 * vivent dans `Equipe.module.css`.
 */

export { LARGEUR, SECTION, SURTITRE, VERRE };

/** Le H2 de cet écran monte moins haut que celui des gabarits de vente. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 18px",
  maxWidth: "18ch",
  textWrap: "balance",
};

export const CHAPEAU: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "56ch",
  textWrap: "pretty",
};

/** Le titre de carte, repris à l'identique dans six blocs de l'écran. */
export const TITRE_CARTE: CSSProperties = {
  font: "600 17px/1.3 var(--ft)",
  letterSpacing: "-.022em",
  marginBottom: 8,
};

export const TEXTE_CARTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

/** Ombre plus courte que celle de `VERRE` : les cartes de personnes et les
    pastilles posées sur une photo. */
export const VERRE_COURT: CSSProperties = {
  ...VERRE,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 20px 46px -32px rgba(0,0,0,.3)",
};
