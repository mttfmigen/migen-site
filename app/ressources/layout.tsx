import type { ReactNode } from "react";

/**
 * Le hub /ressources/ et sa fente `lecteur` : un clic sur un article du hub
 * l'ouvre dans le lecteur latéral de la maquette « Ressources v2 », à sa vraie
 * URL (route interceptée `@lecteur/(.)articles/[page]`). Une URL d'article
 * chargée directement sert toujours la page complète (`app/[...slug]`).
 */
export default function MiseEnPageRessources({ children, lecteur }: { children: ReactNode; lecteur: ReactNode }) {
  return (
    <>
      {children}
      {lecteur}
    </>
  );
}
