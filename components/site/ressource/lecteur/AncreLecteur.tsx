"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Un lien du sommaire du lecteur : il fait défiler la feuille jusqu'à la
 * partie SANS inscrire d'ancre dans l'historique. Une ancre nue ajoutait une
 * entrée `#lr-s<n>` : « Fermer » (qui recule d'une entrée quand l'article
 * vient d'une carte) retombait alors sur l'article, et le lecteur restait
 * ouvert. Sans JavaScript, l'ancre reste une ancre.
 */
export default function AncreLecteur({ cible, style, children }: { cible: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <a
      href={`#${cible}`}
      style={style}
      onClick={(e) => {
        const el = document.getElementById(cible);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
