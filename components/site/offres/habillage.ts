import type { CSSProperties } from "react";

/**
 * Habillage des quatre sections du hub `/offres/`, relevé dans
 * `maquette/accueil-rendu.html`, bloc `isOffres`, lignes 1886 à 2064.
 *
 * Seules les valeurs que `blocs/habillage.ts` ne porte pas déjà sont ici : le
 * reste s'importe de là-bas, pour que la charte n'ait qu'un seul endroit où
 * bouger. Les écarts avec `blocs/habillage.ts` sont voulus et non des oublis :
 * la maquette donne à CETTE page des valeurs propres (surtitre à 18px de marge
 * au lieu de 16, H1 en clamp(36,4.2vw,62) au lieu de clamp(38,4.4vw,66)), et
 * c'est le dessin de cette page qui est porté, pas celui d'une autre.
 *
 * Les survols ne sont pas ici : un style en ligne ne peut pas porter d'état,
 * ils vivent dans `PageOffres.module.css`.
 */

/** Surtitre orange en capitales. 18px de marge basse sur cette page. */
export const SURTITRE_OFFRES: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

/** Le H2 des trois sections qui en portent un. */
export const TITRE2_OFFRES: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  textWrap: "balance",
  maxWidth: "22ch",
};

/** Le numéro d'ordre d'une carte, en chasse fixe. */
export const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--ink4)",
};

/** Le même numéro, en orange, sur une carte d'offre. */
export const NUMERO_OFFRE: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  letterSpacing: ".06em",
  color: "var(--acc)",
};

/** Le bouton « Voir l'offre » d'une carte claire. */
export const BOUTON_CARTE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 20px",
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink)",
  font: "600 13.5px var(--fb)",
  alignSelf: "flex-start",
  whiteSpace: "nowrap",
  transition: "transform var(--tr)",
};

/** Le même bouton sur le panneau anthracite : orange plein. */
export const BOUTON_CARTE_ACCENT: CSSProperties = {
  ...BOUTON_CARTE,
  background: "var(--acc)",
  color: "#fff",
};

/** La lueur orange de la carte d'offre en panneau. Décorative. */
export const LUEUR_CARTE: CSSProperties = {
  position: "absolute",
  width: 320,
  height: 320,
  right: -130,
  top: -150,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

/** Le numéro du corpus devient « 01 », « 02 », comme la maquette les écrit. */
export function numero(index: number): string {
  return String(index + 1).padStart(2, "0");
}
