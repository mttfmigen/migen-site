import Link from "next/link";
import type { CSSProperties } from "react";

import type { Seg } from "./types";

/**
 * Le texte d'un bloc, morceau par morceau, comme la boucle `sc-for … as="s"`
 * des gabarits de la maquette : texte simple, gras, ou lien. Un lien interne
 * passe par `next/link` ; la maquette le gérait en clic, son URL est `go`.
 */
export default function Segs({
  segs,
  gras,
  lien,
  survol,
}: {
  segs?: Seg[];
  gras: CSSProperties;
  lien: CSSProperties;
  survol?: string;
}) {
  return (
    <>
      {(segs ?? []).map((s, i) => {
        // Comme la maquette : le texte interpolé dans sa propre balise.
        if (s.bold) return <strong key={i} style={gras}><span>{s.t}</span></strong>;
        if (!s.link) return <span key={i}>{s.t}</span>;
        const cible = s.go ?? s.href ?? "#";
        return cible.startsWith("/") ? (
          <Link key={i} href={cible} prefetch={false} className={survol} style={lien}>
            <span>{s.t}</span>
          </Link>
        ) : (
          <a key={i} href={cible} className={survol} style={lien}>
            <span>{s.t}</span>
          </a>
        );
      })}
    </>
  );
}
