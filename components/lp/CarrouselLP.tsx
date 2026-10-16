"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import styles from "./PageLP.module.css";

/**
 * Le carrousel des témoignages et études de cas de `MigenLP` (maquette V3) :
 * défilement horizontal aimanté, une carte de plus toutes les cinq secondes,
 * retour au début en bout de piste, pause au survol, deux flèches.
 *
 * Les cartes sont rendues au serveur et passées en enfants : seul le
 * mouvement vit ici. L'avance automatique s'arrête pour qui a demandé moins
 * d'animation, et pendant que le clavier est dans la piste.
 */

const PERIODE_MS = 5000;
/** L'écart entre deux cartes, le `gap` de la piste. */
const ECART = 14;

const PISTE: CSSProperties = {
  display: "flex",
  gap: ECART,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  paddingBottom: 4,
};

const FLECHES: CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 };

const FLECHE: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  font: "600 18px var(--fb)",
  cursor: "pointer",
};

export function CarrouselLP({ children }: { children: ReactNode }) {
  const piste = useRef<HTMLDivElement>(null);
  const enPause = useRef(false);

  function avance(sens: 1 | -1) {
    const el = piste.current;
    if (!el) return;
    const carte = el.querySelector("article");
    const pas = carte ? carte.offsetWidth + ECART : el.clientWidth * 0.8;
    el.scrollBy({ left: sens * pas, behavior: "smooth" });
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const minuterie = window.setInterval(() => {
      const el = piste.current;
      if (!el || enPause.current) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else avance(1);
    }, PERIODE_MS);
    return () => window.clearInterval(minuterie);
  }, []);

  const pause = () => {
    enPause.current = true;
  };
  const reprend = () => {
    enPause.current = false;
  };

  return (
    <>
      <div
        ref={piste}
        onMouseEnter={pause}
        onMouseLeave={reprend}
        onFocus={pause}
        onBlur={reprend}
        className={styles.carrousel}
        style={PISTE}
      >
        {children}
      </div>
      <div style={FLECHES}>
        <button
          type="button"
          onClick={() => avance(-1)}
          aria-label="Précédent"
          style={{ ...FLECHE, border: "1px solid #e5e3df", background: "#fff", color: "#1c1b19" }}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => avance(1)}
          aria-label="Suivant"
          style={{ ...FLECHE, border: "none", background: "#ff7c3c", color: "#fff" }}
        >
          →
        </button>
      </div>
    </>
  );
}
