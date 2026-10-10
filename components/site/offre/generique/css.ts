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
 *
 * DEUX COULEURS DE CES CHAÎNES S'ÉCARTENT DE LA MAQUETTE, décidé le 09/10 au
 * soir, et c'est le seul écart assumé. Mesuré au navigateur sur les 91 pages
 * des gabarits offre, preuve et implantation :
 *
 * - `color:#fff` POSÉ SUR UN FOND `var(--acc)` devient `color:var(--ink)`.
 *   Le blanc sur l'orange de marque donne 2,56:1, l'encre donne 6,72:1. Le
 *   plancher de la WCAG 1.4.3 est 4,5:1 (3:1 au-delà de 24 px). Le FOND ne
 *   change pas : l'orange `#ff7c3c` est la marque.
 * - `color:var(--acc)` POSÉ SUR UN FOND CLAIR devient `color:var(--acc-ink)`.
 *   L'orange de marque donne 2,29:1 sur le crème et 2,56:1 sur le blanc,
 *   l'encre orange `#7d3309` donne 7,98:1 et 8,94:1. Les deux jetons existent
 *   dans `app/globals.css` et basculent avec le thème.
 *
 * CE QUI NE CHANGE PAS, et il faut le lire comme une règle, pas comme un
 * oubli : l'orange sur un fond SOMBRE (les panneaux `var(--panel)`, les cartes
 * à photo assombrie) y est déjà à 6,72:1, et l'orange purement DÉCORATIF
 * (filets, puces, lueurs, bordures, ombres) n'est pas du texte. Y toucher
 * abîmerait le site sans rien gagner.
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
