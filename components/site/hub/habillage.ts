import type { CSSProperties } from "react";

/**
 * Habillage des gabarits de RUBRIQUE, relevé dans les deux fichiers de maquette
 * qui font foi :
 *
 *   · `maquette/gabarit-10-hub-de-rubrique.html`
 *   · `maquette/gabarit-11-sous-rubrique.html`
 *
 * Seules les valeurs que `blocs/habillage.ts` ne porte pas déjà sont ici, et les
 * écarts avec lui sont VOULUS : ces deux gabarits donnent à leurs sections des
 * valeurs propres (H1 en `clamp(40px,4.8vw,70px)` au lieu de
 * `clamp(38px,4.4vw,66px)`, surtitre à 18px de marge, gouttière de héros à
 * 52px), et c'est leur dessin qui est porté, pas celui d'une autre page.
 *
 * `components/site/hub/verification-hub.tsx` cherche CHACUNE de ces
 * déclarations dans le fichier de maquette à chaque exécution : une valeur
 * écrite de mémoire fait échouer le contrôle.
 *
 * Les survols et l'animation du bandeau de logos ne sont pas ici : un style en
 * ligne ne peut porter ni état ni image-clé. Ils vivent dans `Hub.module.css`.
 */

/** Surtitre orange en capitales. 18px de marge basse sur ces deux gabarits. */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

/** Le même surtitre, 14px de marge : carte « En bref » et gabarit 11. */
export const SURTITRE_SERRE: CSSProperties = { ...SURTITRE, marginBottom: 14 };

/** Le H2 des sections pleine largeur. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  textWrap: "balance",
};

/** Le H2 des sections à colonne collante, d'une crantée plus petit. */
export const TITRE2_SERRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  textWrap: "balance",
};

/** Le même, sur le panneau anthracite. */
export const TITRE2_CLAIR: CSSProperties = { ...TITRE2_SERRE, color: "#fff" };

/** La carte de verre du gabarit, ombre plus haute que celle de `blocs/`. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

/** La colonne de gauche qui reste à l'écran pendant le défilement. */
export const COLLANTE: CSSProperties = { position: "sticky", top: 110 };

/** La grille à deux colonnes. `.mg-r2` la replie sous 900px. */
export function deuxColonnes(
  colonnes: string,
  gouttiere: number,
  alignement: CSSProperties["alignItems"] = "start",
): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: colonnes,
    gap: gouttiere,
    alignItems: alignement,
  };
}

/** Le cadre gris qui tient la place d'une photo que le corpus ne porte pas. */
export const PLACE_VISUEL = "#dedfe1";

/** Un numéro d'ordre en chasse fixe, comme la maquette les écrit. */
export function numero(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * La première phrase d'un texte, et le reste.
 *
 * La maquette coupe la punchline du corpus en deux : la première phrase devient
 * le H2 de la section « Votre problématique », les suivantes son paragraphe.
 * Exporté parce que le producteur de données applique la même coupe.
 */
export function premierePhrase(texte: string): [string, string] {
  const phrases = texte.split(/(?<=[.?!])\s+/).filter(Boolean);
  return [phrases[0] ?? "", phrases.slice(1).join(" ")];
}
