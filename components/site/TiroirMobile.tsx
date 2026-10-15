"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import s from "./Entete.module.css";
import t from "./TiroirMobile.module.css";
import {
  TIROIR,
  TIROIR_ACCUEIL,
  TIROIR_LP,
} from "./entete-donnees";

export interface TiroirMobileProps {
  /** Monté en permanence, masqué par `hidden` quand il est fermé : ses liens
      sont dans le HTML servi, comme dans la maquette, qui garde son menu dans
      le DOM. Fermé, rien n'est visible ni atteignable au clavier. */
  ouvert: boolean;
  landingPage: boolean;
  /** Appelé par Échap, le fond de page, et chaque lien suivi. */
  onFermer: () => void;
  hrefCta: string;
  libelleCta: string;
}

const SELECTEUR_FOCUSABLES = "a[href],button:not([disabled])";

/**
 * Tiroir tactile, motif de la maquette mobile v2 : feuillet remontant du bas,
 * fond de page assombri, lien « Accueil » en tête, puis six groupes en
 * `<details>` natifs, une seule section ouverte à la fois par leur attribut
 * `name`, chacun avec son compteur de liens, ses sous-têtes orange et les
 * descriptions que la maquette écrit. TOUT LE TEXTE RESTE DANS LE DOM, même
 * replié : règle numéro un de la maquette mobile. L'ancien tiroir ne rendait
 * les liens d'un groupe qu'une fois celui-ci déplié.
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
            {/* « Accueil », seul au-dessus des groupes, comme la maquette. */}
            <Link
              href={TIROIR_ACCUEIL.href}
              onClick={onFermer}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "14px 16px",
                borderRadius: 18,
                background: "var(--bg)",
                font: "600 16px var(--ft)",
                letterSpacing: "-.02em",
                color: "var(--ink)",
                minHeight: 44,
              }}
            >
              {TIROIR_ACCUEIL.libelle}
              <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                &rsaquo;
              </span>
            </Link>
            {TIROIR.map((section) => {
              /* Compté, jamais écrit : la maquette affiche `mg.n`, le nombre
                 de liens du groupe, sous-têtes exclues. */
              const nombreDeLiens = section.entrees.filter(
                (entree) => entree.type === "lien",
              ).length;
              return (
                <details
                  key={section.libelle}
                  /* `name` partagé : le navigateur ne laisse ouvert qu'un
                     groupe à la fois, l'accordéon exclusif de la maquette
                     (`<details name="menu">`). Distinct de l'id du feuillet. */
                  name="mg-tiroir-groupes"
                  className={t.groupe}
                >
                  <summary className={t.bascule}>
                    <span
                      style={{
                        font: "600 16px var(--ft)",
                        letterSpacing: "-.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {section.libelle}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          font: "500 11.5px var(--fb)",
                          color: "var(--ink2)",
                        }}
                      >
                        {nombreDeLiens}
                      </span>
                      <span aria-hidden="true" className={t.chevron}>
                        &rsaquo;
                      </span>
                    </span>
                  </summary>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: "0 8px 10px",
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr)",
                      gap: 1,
                    }}
                  >
                    {section.entrees.map((entree) =>
                      entree.type === "sous-tete" ? (
                        <li
                          key={`sous-tete-${entree.libelle}`}
                          style={{
                            padding: "12px 10px 4px",
                            font: "600 10.5px var(--fb)",
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "var(--acc)",
                          }}
                        >
                          {entree.libelle}
                        </li>
                      ) : (
                        <li key={entree.href + entree.libelle}>
                          <Link
                            href={entree.href}
                            onClick={onFermer}
                            className={s.lienTiroir}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              padding: "9px 10px",
                              borderRadius: 10,
                              font: "500 14px/1.35 var(--fb)",
                              /* 44 px de cible tactile (WCAG 2.5.8), règle du
                                 site conservée : la maquette s'arrête à 9 px
                                 de remplissage. */
                              minHeight: 44,
                            }}
                          >
                            <span style={{ display: "block" }}>
                              {entree.libelle}
                            </span>
                            {entree.description ? (
                              <span
                                style={{
                                  display: "block",
                                  marginTop: 2,
                                  font: "400 12.5px/1.4 var(--fb)",
                                  color: "var(--ink2)",
                                }}
                              >
                                {entree.description}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </details>
              );
            })}
          </div>
        )}

        {/* Un seul bouton sous les rubriques, comme la maquette mobile v2
            (dc.html L207) ; le numéro reste dans la barre collante. */}
        <div style={{ display: "flex", marginTop: 14 }}>
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
        </div>
      </div>
    </div>
  );
}
