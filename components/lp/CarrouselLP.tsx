"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import styles from "./PageLP.module.css";

/**
 * Le carrousel des témoignages et études de cas de `MigenLP` (maquette V3) :
 * défilement horizontal aimanté, une carte de plus toutes les cinq secondes,
 * retour au début en bout de piste, pause au survol, deux flèches.
 *
 * Les cartes sont rendues au serveur et passées en enfants : seul le
 * mouvement vit ici.
 *
 * L'AVANCE AUTOMATIQUE (WCAG 2.2.2, motif « carrousel » de l'APG) :
 *   · un bouton la met en pause et la reprend ;
 *   · elle s'arrête pour de bon dès que le visiteur agit sur le carrousel
 *     (doigt, molette, touche dans la piste, flèches) : on ne lui reprend
 *     jamais la carte qu'il lit ;
 *   · elle attend tant que la souris survole le carrousel ou que le focus
 *     est dedans, flèches et bouton compris ;
 *   · elle ne démarre pas pour qui a demandé moins d'animation, et le bouton
 *     est alors masqué : il n'aurait rien à arrêter.
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

const COMMANDES: CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 };

const BOUTON: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  font: "600 18px var(--fb)",
  cursor: "pointer",
};
const BOUTON_CLAIR: CSSProperties = { ...BOUTON, border: "1px solid #e5e3df", background: "#fff", color: "#1c1b19" };

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CarrouselLP({ nom, children }: { nom?: string; children: ReactNode }) {
  const piste = useRef<HTMLDivElement>(null);
  /** Survol ou focus dans le carrousel : l'avance attend, sans s'arrêter. */
  const survol = useRef(false);
  const focusDedans = useRef(false);
  const [enLecture, setEnLecture] = useState(true);

  function avance(sens: 1 | -1) {
    const el = piste.current;
    if (!el) return;
    const carte = el.querySelector("article");
    const pas = carte ? carte.offsetWidth + ECART : el.clientWidth * 0.8;
    el.scrollBy({ left: sens * pas, behavior: mouvementReduit() ? "auto" : "smooth" });
  }

  useEffect(() => {
    if (!enLecture || mouvementReduit()) return;
    const minuterie = window.setInterval(() => {
      const el = piste.current;
      if (!el || survol.current || focusDedans.current) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else avance(1);
    }, PERIODE_MS);
    return () => window.clearInterval(minuterie);
  }, [enLecture]);

  const arrete = () => setEnLecture(false);

  return (
    <div
      onMouseEnter={() => (survol.current = true)}
      onMouseLeave={() => (survol.current = false)}
      onFocus={() => (focusDedans.current = true)}
      onBlur={(e) => (focusDedans.current = e.currentTarget.contains(e.relatedTarget))}
    >
      <div
        ref={piste}
        role="region"
        aria-roledescription="carrousel"
        aria-label={nom}
        tabIndex={0}
        onPointerDown={arrete}
        onWheel={arrete}
        onKeyDown={arrete}
        className={styles.carrousel}
        style={PISTE}
      >
        {children}
      </div>
      <div style={COMMANDES}>
        <button
          type="button"
          onClick={() => setEnLecture((lecture) => !lecture)}
          aria-label={enLecture ? "Mettre en pause le défilement" : "Reprendre le défilement"}
          className={styles.lecture}
          style={BOUTON_CLAIR}
        >
          <span aria-hidden="true">{enLecture ? "❚❚" : "▶"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            arrete();
            avance(-1);
          }}
          aria-label="Précédent"
          style={BOUTON_CLAIR}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => {
            arrete();
            avance(1);
          }}
          aria-label="Suivant"
          style={{ ...BOUTON, border: "none", background: "#ff7c3c", color: "#fff" }}
        >
          →
        </button>
      </div>
    </div>
  );
}
