"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";

import styles from "./PageLP.module.css";

/**
 * La barre flottante des landing pages : la pilule de `MigenLP` (maquette V3).
 *
 * Elle se cache quand on descend, revient quand on remonte ou qu'on survole le
 * haut de la page (`onY` et `showHdr` de la maquette, mêmes seuils). Au
 * téléphone : le logo et le bouton seulement, ni ancres ni numéro, comme la
 * maquette « Landing page mobile ».
 */

export interface AncreLP {
  libelle: string;
  href: string;
}

interface Proprietes {
  logo: string;
  ancres: readonly AncreLP[];
  libelleCta: string;
  hrefCta: string;
}

/** Sous ce défilement, la barre reste affichée. */
const HAUT_DE_PAGE = 140;
/** Le mouvement minimal, en pixels, qui la cache ou la ramène. */
const SEUIL = 6;

const ACCROCHE: CSSProperties = { position: "sticky", top: 0, height: 0, zIndex: 60 };

const ZONE_SURVOL: CSSProperties = { position: "absolute", left: 0, right: 0, top: 0, height: 86 };

const RAIL: CSSProperties = {
  position: "absolute",
  top: 12,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  padding: "0 12px",
  pointerEvents: "none",
};

const PILULE: CSSProperties = {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 6px 6px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(18px) saturate(160%)",
  WebkitBackdropFilter: "blur(18px) saturate(160%)",
  border: "1px solid rgba(255,255,255,.9)",
  boxShadow: "0 14px 40px -22px rgba(0,0,0,.45)",
  maxWidth: "100%",
};

const MARQUE: CSSProperties = { display: "flex", alignItems: "center", gap: 8, flex: "none", marginRight: 8 };
const MOT_MARQUE: CSSProperties = { font: "600 16px var(--ft)", letterSpacing: "-.02em", color: "#1c1b19" };

const ANCRE: CSSProperties = {
  padding: "9px 12px",
  borderRadius: 999,
  font: "500 13.5px var(--fb)",
  color: "#4a4845",
  whiteSpace: "nowrap",
};

const NUMERO: CSSProperties = {
  padding: "9px 12px",
  font: "600 13.5px var(--fb)",
  color: "#1c1b19",
  whiteSpace: "nowrap",
};

const BOUTON: CSSProperties = {
  flex: "none",
  padding: "10px 16px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 13.5px var(--fb)",
  whiteSpace: "nowrap",
};

export function BarreLP({ logo, ancres, libelleCta, hrefCta }: Proprietes) {
  const [cachee, setCachee] = useState(false);
  const dernier = useRef(0);

  useEffect(() => {
    const surDefilement = () => {
      const y = window.scrollY;
      const ecart = y - dernier.current;
      dernier.current = y;
      if (y < HAUT_DE_PAGE) setCachee(false);
      else if (ecart > SEUIL) setCachee(true);
      else if (ecart < -SEUIL) setCachee(false);
    };
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  const montre = () => setCachee(false);

  return (
    <div style={ACCROCHE}>
      <div aria-hidden="true" onMouseEnter={montre} style={{ ...ZONE_SURVOL, pointerEvents: cachee ? "auto" : "none" }} />
      <div
        className={styles.barre}
        style={{ ...RAIL, transform: `translateY(${cachee ? "-140%" : "0"})`, opacity: cachee ? 0 : 1 }}
      >
        {/* Le focus clavier ramène la barre : un lien caché ne doit pas
            recevoir le focus sans se montrer. */}
        <header onMouseEnter={montre} onFocus={montre} style={PILULE}>
          <a href="#lp-top" style={MARQUE}>
            <Image src={logo} alt="" width={22} height={22} />
            <span style={MOT_MARQUE}>migen</span>
          </a>
          {ancres.length ? (
            <nav aria-label="Sections de la page" className={styles.cacheM} style={{ display: "flex", gap: 2 }}>
              {ancres.map((ancre) => (
                <a key={ancre.href} href={ancre.href} className={styles.lienNav} style={ANCRE}>
                  {ancre.libelle}
                </a>
              ))}
            </nav>
          ) : null}
          <a href={TELEPHONE_LP.href} className={styles.cacheM} style={NUMERO}>
            {TELEPHONE_LP.affichage}
          </a>
          <a href={hrefCta} className={styles.orange} style={BOUTON}>
            {libelleCta}
          </a>
        </header>
      </div>
    </div>
  );
}
