import type { CSSProperties } from "react";

/**
 * Valeurs d'habillage relevées dans la maquette Claude Design
 * (« Migen - Site final.dc.html », page d'offre, lignes 4030 à 4524).
 *
 * POURQUOI un fichier de constantes et non des classes : la maquette pilote
 * tout par styles en ligne. Les mêmes déclarations y reviennent des dizaines de
 * fois (le verre, le panneau sombre, le surtitre orange). Les recopier dans
 * chaque bloc produirait dix dérives au premier ajustement de charte. Ici, une
 * valeur, un seul endroit, recopiée telle quelle depuis la maquette.
 *
 * Les survols ne sont pas ici : ils vivent dans `Blocs.module.css`, un style en
 * ligne ne pouvant pas porter d'état.
 */

/** Rythme vertical des sections : `--sec` vaut 120px, 64px sous 760px. */
export const SECTION: CSSProperties = { padding: "var(--sec) 0 0" };

/** Gouttière de la maquette. `.mg-pad` la resserre à 20px sur mobile. */
export const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

/** La carte en verre, motif dominant de la maquette. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

/** Le panneau anthracite, réservé aux blocs qui doivent peser. */
export const PANNEAU: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  position: "relative",
  overflow: "hidden",
};

/** La lueur orange en coin, posée en absolu dans un panneau. */
export const LUEUR: CSSProperties = {
  position: "absolute",
  width: 340,
  height: 340,
  right: -140,
  bottom: -170,
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
  pointerEvents: "none",
};

/** Surtitre orange en capitales, au-dessus de chaque H2. */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};

export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

/** Même échelle, sur fond sombre. */
export const TITRE2_CLAIR: CSSProperties = {
  ...TITRE2,
  letterSpacing: "-.035em",
  color: "#fff",
};

/** Le paragraphe qui accompagne le H2, en seconde colonne. */
export const CHAPEAU: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "46ch",
};

/** L'en-tête à deux colonnes, titre à gauche, chapeau à droite. */
export const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

/** Bouton principal orange. Survol : `Blocs.module.css`, `.boutonAction`. */
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

/** Bouton secondaire en verre. Survol : `.boutonSecondaire`. */
export const BOUTON_SECONDAIRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "background var(--tr),transform var(--tr)",
};

/** Corps de texte long, avec son `strong` appuyé. */
export const PROSE: CSSProperties = {
  font: "400 16px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 14px",
};

export const PROSE_FORT: CSSProperties = {
  fontWeight: 600,
  color: "var(--ink)",
};

/** Grille qui se replie en deux puis une colonne (`.mg-rmulti`). */
export function colonnes(nombre: number): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(1, nombre)},minmax(0,1fr))`,
    gap: 12,
  };
}

/**
 * Ancre du formulaire de la page, visée par tous les appels à l'action.
 * La maquette l'écrit `#form-page` sur la section du formulaire de bas de page.
 */
export const ANCRE_FORMULAIRE = "#form-page";

/** Un numéro de téléphone français devient un `tel:` sans espaces. */
export function lienTelephone(telephone: string): string {
  return `tel:${telephone.replace(/[^+\d]/g, "")}`;
}
