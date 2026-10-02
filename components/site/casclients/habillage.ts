import type { CSSProperties } from "react";

/**
 * Valeurs relevées sur le gabarit « Cas clients » de la maquette Claude Design
 * (« Migen - Site final.dc.html », lignes 6646 à 6931), recopiées telles quelles.
 *
 * POURQUOI UN FICHIER À PART et non `components/site/blocs/habillage.ts` : les
 * mêmes noms y portent d'autres valeurs. Le verre du gabarit de vente projette
 * `0 22px 50px -32px rgba(0,0,0,.3)`, celui de la page de preuve
 * `0 26px 60px -36px rgba(0,0,0,.34)`, et son H2 descend à `clamp(28px,3.2vw,46px)`
 * au lieu de `clamp(30px,3.3vw,48px)`. Réutiliser les constantes du gabarit de
 * vente aurait réinterprété la maquette au lieu de la reproduire ; les modifier
 * aurait déplacé les 126 pages qui s'en servent.
 *
 * Les survols ne sont pas ici : un style en ligne ne porte pas d'état, ils
 * vivent dans `PageCasClients.module.css`.
 */

/** La carte en verre de ce gabarit. Ombre plus creusée que celle des offres. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
  borderRadius: "var(--rad)",
};

/** Surtitre orange en capitales, au-dessus de chaque titre. */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};

/** Les H2 des sections. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

/** Gouttière des sections. `.mg-pad` la resserre à 20px sous 760px. */
export const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

/** Bouton principal orange. Survol : `.boutonAction` du module. */
export const BOUTON_ACTION: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
  transition: "filter var(--tr),transform var(--tr)",
};
