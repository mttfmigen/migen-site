"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import styles from "./ProcessSelection.module.css";

/**
 * La carte de droite de « Notre sélection » : les six étapes, l'étape active
 * surlignée, son détail et la barre segmentée qui avance.
 *
 * Seule partie client du bloc. La logique est celle de la classe `Component`
 * de `design_handoff_migen_site/maquette/MigenSelection.dc.html`, à l'identique :
 *   · un pas de 120 ms, une étape toutes les 4,5 s (`delay` par défaut) ;
 *   · rien n'avance tant que 30 % de la section n'est pas à l'écran ;
 *   · le survol de la carte met en pause, le survol ou le clic d'une étape la
 *     choisit et remet sa barre à zéro ;
 *   · mouvement réduit demandé : rien ne défile, la barre active est pleine.
 * Un seul ajout, invisible à la souris : le focus CLAVIER dans la carte met
 * aussi en pause (WCAG 2.2.2), sans quoi l'étape surlignée fuirait le bouton
 * que l'on vient d'atteindre. `:focus-visible` exclut le focus du clic, pour
 * que la reprise au départ de la souris reste celle de la maquette.
 */

/** `STEPS` de la maquette, mot pour mot. */
export const ETAPES_SELECTION = [
  { t: "Lecture du parcours", keep: 100, d: "Habilitations, technologies pratiquées, stabilité des postes. Un parcours sans terrain ne passe pas." },
  { t: "Entretien téléphonique", keep: 55, d: "Vingt minutes avec un chargé d’affaires : mobilité, prétentions, motivation réelle pour le site." },
  { t: "Entretien technique", keep: 40, d: "Un technicien de terrain reprend le parcours machine par machine : pannes traitées, arbitrages faits." },
  { t: "Tests techniques", keep: 25, d: "Épreuves écrites et pratiques par domaine, notées sur notre référentiel." },
  { t: "Tests comportementaux", keep: 15, d: "Sécurité, autonomie, rigueur du compte rendu, tenue face à l’urgence." },
  { t: "Rencontre du client", keep: 10, d: "Vous rencontrez le technicien avant de dire oui. Deux validations, pas une." },
] as const;

/** `dur()` avec `delay` à 4,5, et le pas de `setInterval(() => this.tick(), 120)`. */
export const DUREE_MS = 4500;
export const PAS_MS = 120;
const ACCENT = "#ff7c3c";
const MOUVEMENT_REDUIT = "(prefers-reduced-motion: reduce)";

export type Lecture = { readonly etape: number; readonly t: number };

/** `tick()` de la maquette, une fois les conditions de pause écartées. */
export function avance({ etape, t }: Lecture): Lecture {
  const suite = t + PAS_MS;
  return suite >= DUREE_MS
    ? { etape: (etape + 1) % ETAPES_SELECTION.length, t: 0 }
    : { etape, t: suite };
}

function abonneMouvement(prevenir: () => void) {
  const requete = window.matchMedia(MOUVEMENT_REDUIT);
  requete.addEventListener("change", prevenir);
  return () => requete.removeEventListener("change", prevenir);
}

export default function CarteEtapes() {
  const [{ etape, t }, setLecture] = useState<Lecture>({ etape: 0, t: 0 });
  const reduit = useSyncExternalStore(
    abonneMouvement,
    () => window.matchMedia(MOUVEMENT_REDUIT).matches,
    () => false,
  );
  const carte = useRef<HTMLDivElement>(null);
  const survol = useRef(false);
  const clavier = useRef(false);

  useEffect(() => {
    if (reduit) return;
    const section = carte.current?.closest("section");
    let visible = !section || !("IntersectionObserver" in window);
    const io = visible
      ? null
      : new IntersectionObserver(
          ([entree]) => {
            visible = entree.isIntersecting;
          },
          { threshold: 0.3 },
        );
    if (io && section) io.observe(section);
    const minuterie = window.setInterval(() => {
      if (visible && !survol.current && !clavier.current) setLecture(avance);
    }, PAS_MS);
    return () => {
      window.clearInterval(minuterie);
      io?.disconnect();
    };
  }, [reduit]);

  const choisis = (i: number) =>
    setLecture((l) => (l.etape === i ? l : { etape: i, t: 0 }));
  const vivant = reduit
    ? "100%"
    : `${Math.min(100, (t / DUREE_MS) * 100).toFixed(1)}%`;
  const dernier = ETAPES_SELECTION.length - 1;

  return (
    <div
      ref={carte}
      className={styles.carte}
      onMouseEnter={() => {
        survol.current = true;
      }}
      onMouseLeave={() => {
        survol.current = false;
      }}
      onFocus={(e) => {
        clavier.current = e.target.matches(":focus-visible");
      }}
      onBlur={() => {
        clavier.current = false;
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px 24px",
        borderRadius: "var(--rad,28px)",
        background: "var(--card,#fff)",
        border: "1px solid var(--line)",
        boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", padding: "0 14px 14px" }}>
        <span style={{ font: "600 16px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>
          Sur 100 techniciens rencontrés
        </span>
        <span style={{ font: "600 10.5px var(--fb)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink3)", whiteSpace: "nowrap" }}>
          Restent
        </span>
      </div>

      <div style={{ display: "grid", gap: "4px", marginBottom: "16px" }}>
        {ETAPES_SELECTION.map((x, i) => {
          const actif = i === etape;
          const vif = actif || i === dernier;
          return (
            <button
              key={x.t}
              type="button"
              aria-pressed={actif}
              onClick={() => choisis(i)}
              onMouseEnter={() => choisis(i)}
              style={{
                display: "grid",
                gridTemplateColumns: "28px minmax(0,1fr) 56px",
                alignItems: "center",
                columnGap: "14px",
                rowGap: "9px",
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderRadius: "14px",
                background: actif ? "var(--chip)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                transition: "background-color .25s ease",
              }}
            >
              <span style={{ font: "600 11.5px ui-monospace,Menlo,monospace", color: vif ? ACCENT : "var(--ink3)", transition: "color .25s ease" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ font: "600 15px/1.25 var(--ft)", letterSpacing: "-.02em", color: actif ? "var(--ink)" : "var(--ink1)", transition: "color .25s ease" }}>
                {x.t}
              </span>
              <span style={{ font: "600 15px/1 var(--ft)", letterSpacing: "-.02em", textAlign: "right", whiteSpace: "nowrap", color: vif ? ACCENT : "var(--ink3)", transition: "color .25s ease" }}>
                {`${x.keep} %`}
              </span>
              <span style={{ gridColumn: "2 / 4", display: "block", height: "6px", borderRadius: "999px", background: "var(--chip)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${x.keep}%`, borderRadius: "999px", background: vif ? ACCENT : "var(--ink4)", transition: "background-color .25s ease" }} />
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "18px 14px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "grid" }}>
          {ETAPES_SELECTION.map((x, i) => {
            const actif = i === etape;
            return (
              <div
                key={x.t}
                aria-hidden={!actif}
                style={{
                  gridArea: "1 / 1",
                  opacity: actif ? 1 : 0,
                  transform: `translateY(${actif ? "0px" : "6px"})`,
                  transition: "opacity .35s ease,transform .35s ease",
                }}
              >
                <div style={{ font: "600 10.5px var(--fb)", letterSpacing: ".13em", textTransform: "uppercase", color: ACCENT, marginBottom: "8px" }}>
                  {`Étape ${String(i + 1).padStart(2, "0")} · ${x.t}`}
                </div>
                <p style={{ font: "400 15px/1.6 var(--fb)", color: "var(--ink1)", margin: 0, maxWidth: "58ch", textWrap: "pretty" }}>
                  {x.d}
                </p>
              </div>
            );
          })}
        </div>
        <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "6px", marginTop: "16px" }}>
          {ETAPES_SELECTION.map((x, i) => (
            <span key={x.t} style={{ display: "block", height: "3px", borderRadius: "999px", background: "var(--chip)", overflow: "hidden" }}>
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: i < etape ? "100%" : i > etape ? "0%" : vivant,
                  borderRadius: "999px",
                  background: ACCENT,
                  transition: "width .12s linear",
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
