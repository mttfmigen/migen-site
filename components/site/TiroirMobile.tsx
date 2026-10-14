"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import s from "./Entete.module.css";
import t from "./TiroirMobile.module.css";
import { type Telephone, TIROIR, TIROIR_LP } from "./entete-donnees";

export interface TiroirMobileProps {
  /** Monté en permanence, masqué par `hidden` quand il est fermé : ses liens
      sont dans le HTML servi, comme dans la maquette, qui garde son menu dans
      le DOM. Fermé, rien n'est visible ni atteignable au clavier. */
  ouvert: boolean;
  landingPage: boolean;
  /** Appelé par Échap, le fond de page, et chaque lien suivi. */
  onFermer: () => void;
  telephone: Telephone;
  hrefCta: string;
  libelleCta: string;
}

const SELECTEUR_FOCUSABLES = "a[href],button:not([disabled])";

/**
 * Tiroir tactile, « Menu sheet » de la maquette mobile du colis du 14/10
 * (`MigenMobile.dc.html`) : feuillet remontant du bas, fond de page assombri,
 * cinq groupes dépliables (Nos offres, Expertises métiers, Expertises
 * sectorielles, Migen, Carrière), chacun avec sa ligne grise, puis « Décrire
 * mon besoin » et le numéro. Les groupes sont des `<details>` natifs, un seul
 * ouvert à la fois par leur attribut `name`. TOUT LE TEXTE RESTE DANS LE DOM,
 * même replié : règle numéro un de la maquette mobile.
 *
 * Ce que la maquette ne dit pas et que le site exige : Échap ferme, le focus
 * reste dans le feuillet tant qu'il est ouvert et revient au bouton qui l'a
 * ouvert, et le fond de page ne défile pas pendant ce temps. Ces effets ne
 * jouent que tiroir ouvert : le composant, lui, reste monté (voir `ouvert`).
 * Il n'était monté qu'à l'ouverture jusqu'au 14/10, et ses 62 liens
 * n'existaient pas dans la page lue par Google.
 */
export default function TiroirMobile({
  ouvert,
  landingPage,
  onFermer,
  telephone,
  hrefCta,
  libelleCta,
}: TiroirMobileProps) {
  const feuillet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
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
  }, [ouvert]);

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
    <div onKeyDown={surTouche} hidden={!ouvert}>
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
                color: "var(--acc)",
                marginBottom: 12,
              }}
            >
              Sur cette page
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 2 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 6 }}>
            {TIROIR.map((section, rang) => (
              <details
                key={section.libelle}
                /* `name` partagé : le navigateur ne laisse ouvert qu'un
                   groupe à la fois, comme la maquette (`menuGrp`). Le
                   premier est ouvert d'emblée : `menuGrp: 0` dans son état
                   initial. */
                name="mg-tiroir-groupes"
                open={rang === 0}
                className={t.groupe}
              >
                <summary className={t.bascule}>
                  <span>
                    <span
                      style={{
                        display: "block",
                        font: "600 16.5px var(--ft)",
                        letterSpacing: "-.025em",
                        color: "var(--ink)",
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
                  <span aria-hidden="true" className={t.chevron}>
                    &rsaquo;
                  </span>
                </summary>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "0 8px 10px",
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr)",
                    gap: 2,
                  }}
                >
                  {section.liens.map((lien) => (
                    <li key={lien.href}>
                      <Link
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
                          /* 44 px de cible tactile (WCAG 2.5.8). */
                          minHeight: 44,
                        }}
                      >
                        {lien.libelle}
                        <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                          &rsaquo;
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
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
