import type { CSSProperties } from "react";

/**
 * Une déclaration CSS de la maquette, telle qu'elle est écrite dans son
 * gabarit (`"font:600 15px var(--fb);color:#fff"`), en objet de style React.
 *
 * POURQUOI : les gabarits génériques de la maquette portent plus de 300 styles
 * en ligne, et certains sont CALCULÉS par son code (`gridCss`, `cellCss`,
 * `bandCss`…, voir `maquette.js`). Les recopier en chaînes, sans les retaper
 * en objets, est le seul moyen de ne pas s'en écarter d'un caractère.
 *
 * Les chemins d'image relatifs de la maquette (`url('assets/…')`) deviennent
 * absolus : le site sert ces fichiers depuis `public/assets/`.
 */
const memoire = new Map<string, CSSProperties>();

function nomReact(propriete: string): string {
  if (propriete.startsWith("--")) return propriete;
  return propriete
    .replace(/^-webkit-/, "Webkit-")
    .replace(/-([a-z])/g, (_, lettre: string) => lettre.toUpperCase());
}

export function css(declaration: string): CSSProperties {
  const deja = memoire.get(declaration);
  if (deja) return deja;
  const style: Record<string, string> = {};
  for (const morceau of declaration.split(";")) {
    const i = morceau.indexOf(":");
    if (i < 0) continue;
    const propriete = morceau.slice(0, i).trim();
    const valeur = morceau
      .slice(i + 1)
      .trim()
      .replace(/url\('assets\//g, "url('/assets/");
    if (propriete && valeur) style[nomReact(propriete)] = valeur;
  }
  memoire.set(declaration, style);
  return style;
}
