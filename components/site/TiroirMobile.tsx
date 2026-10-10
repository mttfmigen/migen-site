"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import s from "./Entete.module.css";
import { type Telephone, TIROIR, TIROIR_LP } from "./entete-donnees";

export interface TiroirMobileProps {
  landingPage: boolean;
  /** Appelé par Échap, le fond de page, et chaque lien suivi. */
  onFermer: () => void;
  telephone: Telephone;
  hrefCta: string;
  libelleCta: string;
}

const SELECTEUR_FOCUSABLES = "a[href],button:not([disabled])";

/**
 * Tiroir tactile, motif de la maquette « Mobile » : feuillet remontant du bas,
 * fond de page assombri, sections dépliantes une à la fois.
 *
 * Ce que la maquette ne dit pas et que le site exige : Échap ferme, le focus
 * reste dans le feuillet tant qu'il est ouvert et revient au bouton qui l'a
 * ouvert, et le fond de page ne défile pas pendant ce temps. Le composant
 * n'est monté que lorsque le tiroir est ouvert, donc montage et démontage
 * valent ouverture et fermeture.
 */
export default function TiroirMobile({
  landingPage,
  onFermer,
  telephone,
  hrefCta,
  libelleCta,
}: TiroirMobileProps) {
  const feuillet = useRef<HTMLDivElement>(null);
  // La maquette ouvre la première section d'emblée (menuGrp: 0).
  const [ouverte, setOuverte] = useState(0);

  useEffect(() => {
    const declencheur = document.activeElement as HTMLElement | null;
    const defilementAvant = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    feuillet.current?.querySelector<HTMLElement>(SELECTEUR_FOCUSABLES)?.focus();

    return () => {
      document.body.style.overflow = defilementAvant;
      // Rendre le focus au bouton d'ouverture : sans cela il repart au début
      // du document et la navigation au clavier recommence de zéro.
      declencheur?.focus?.();
    };
  }, []);

  function surTouche(evenement: React.KeyboardEvent) {
    if (evenement.key === "Escape") {
      evenement.preventDefault();
      onFermer();
      return;
    }
    if (evenement.key !== "Tab" || !feuillet.current) return;

    const cibles = Array.from(
      feuillet.current.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLES),
    );
    if (cibles.length === 0) return;

    const premier = cibles[0];
    const dernier = cibles[cibles.length - 1];
    const actif = document.activeElement;

    if (evenement.shiftKey && actif === premier) {
      evenement.preventDefault();
      dernier.focus();
    } else if (!evenement.shiftKey && actif === dernier) {
      evenement.preventDefault();
      premier.focus();
    }
  }

  return (
    <div onKeyDown={surTouche}>
      {/* Fond de page : un bouton et non un div, pour que « fermer » existe
          aussi au clavier et pour les technologies d'assistance. */}
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={onFermer}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          border: "none",
          background: "rgba(20,19,18,.35)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          pointerEvents: "auto",
          cursor: "pointer",
        }}
      />
      <div
        ref={feuillet}
        id="mg-tiroir"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 41,
          maxHeight: "82%",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "28px 28px 0 0",
          padding: "14px 18px 40px",
          boxShadow: "0 -20px 50px -30px rgba(0,0,0,.5)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            background: "var(--chip)",
            margin: "0 auto 18px",
          }}
        />

        {landingPage ? (
          <>
            <div
              style={{
                font: "600 10.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
                color: "var(--acc-ink)",
                marginBottom: 12,
              }}
            >
              Sur cette page
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              {TIROIR_LP.map((lien, index) => (
                <a
                  key={lien.href}
                  href={lien.href}
                  onClick={onFermer}
                  style={{
                    font: "500 16px var(--fb)",
                    color: "var(--ink1)",
                    padding: "12px 4px",
                    borderBottom:
                      index < TIROIR_LP.length - 1
                        ? "1px solid var(--line)"
                        : undefined,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {lien.libelle}
                </a>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {TIROIR.map((section, index) => {
              const depliee = ouverte === index;
              return (
                <div
                  key={section.libelle}
                  className={s.sectionTiroir}
                  style={{
                    borderRadius: 18,
                    background: depliee ? "var(--bg)" : "#fff",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={depliee}
                    aria-controls={`mg-tiroir-${index}`}
                    onClick={() => setOuverte(depliee ? -1 : index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "15px 16px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "var(--ink)",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: "block",
                          font: "600 16.5px var(--ft)",
                          letterSpacing: "-.025em",
                        }}
                      >
                        {section.libelle}
                      </span>
                      <span
                        style={{
                          display: "block",
                          font: "400 12px var(--fb)",
                          color: "var(--ink2)",
                          marginTop: 2,
                        }}
                      >
                        {section.description}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={s.chevronTiroir}
                      style={{
                        flex: "none",
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: depliee ? "var(--acc)" : "var(--chip)",
                        color: depliee ? "#fff" : "var(--ink)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 15,
                        transform: depliee ? "rotate(90deg)" : "none",
                      }}
                    >
                      &rsaquo;
                    </span>
                  </button>
                  {depliee && (
                    <div
                      id={`mg-tiroir-${index}`}
                      style={{
                        display: "grid",
                        gap: 2,
                        padding: "0 8px 10px",
                      }}
                    >
                      {section.liens.map((lien) => (
                        <Link
                          key={lien.libelle}
                          href={lien.href}
                          onClick={onFermer}
                          className={s.lienTiroir}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            padding: "11px 10px",
                            borderRadius: 12,
                            font: "500 14px var(--fb)",
                            minHeight: 44,
                          }}
                        >
                          {lien.libelle}
                          <span
                            aria-hidden="true"
                            // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
                            style={{ color: "var(--acc-ink)" }}
                          >
                            &rsaquo;
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <Link
            href={hrefCta}
            onClick={onFermer}
            className={s.ctaPanneau}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              font: "600 14.5px var(--fb)",
            }}
          >
            {libelleCta}
          </Link>
          <a
            href={telephone.href}
            style={{
              height: 50,
              padding: "0 18px",
              borderRadius: 999,
              background: "var(--chip)",
              display: "grid",
              placeItems: "center",
              font: "600 14px var(--fb)",
              whiteSpace: "nowrap",
            }}
          >
            {telephone.affichage}
          </a>
        </div>
      </div>
    </div>
  );
}
