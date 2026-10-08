import Image from "next/image";
import Link from "next/link";

import s from "../Entete.module.css";
import type { Offre } from "../entete-donnees";

/** Sur-titre orange des colonnes, répété dans les cinq panneaux. */
/** `marge` : 12 px sous les sur-titres d'« Offres », 14 sous ceux de
 *  « Ressources » et « À propos », relevés dans la maquette ouverte. */
export function SurTitre({ children, marge = 12 }: { children: React.ReactNode; marge?: number }) {
  return (
    <div
      style={{
        font: "600 11px var(--fb)",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "var(--acc)",
        marginBottom: marge,
      }}
    >
      {children}
    </div>
  );
}

/** Même sur-titre, avec la marge basse des panneaux à listes (16 et non 12). */
export function SurTitreLarge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: "600 11px var(--fb)",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "var(--acc)",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

/** Rangée du panneau Offres : vignette, titre, éventuelle pastille, résumé. */
export function RangeeOffre({ offre }: { offre: Offre }) {
  const titre = (
    <div style={{ font: "600 15px var(--ft)", letterSpacing: "-.02em" }}>
      {offre.libelle}
    </div>
  );
  return (
    <Link
      href={offre.href}
      className={s.rangee}
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        padding: 14,
        borderRadius: "var(--rad-s)",
      }}
    >
      <div
        style={{
          width: 74,
          height: 56,
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--ph)",
          flex: "none",
        }}
      >
        <Image
          src={offre.image}
          alt=""
          width={74}
          height={56}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(var(--sat)) contrast(1.04)",
            opacity: "var(--ph-op)",
          }}
        />
      </div>
      <div>
        {offre.etiquette ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {titre}
            <span
              style={{
                font: "600 9.5px var(--fb)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--acc)",
                padding: "3px 8px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              {offre.etiquette}
            </span>
          </div>
        ) : (
          titre
        )}
        <div
          style={{
            font: "400 12.5px/1.5 var(--fb)",
            color: "var(--ink3)",
            marginTop: 3,
          }}
        >
          {offre.description}
        </div>
      </div>
    </Link>
  );
}

/** Rangée titre + description des panneaux Ressources et À propos. */
export function RangeeDecrite({
  href,
  libelle,
  description,
  numero,
}: {
  href: string;
  libelle: string;
  description: string;
  /** Compteur monospace du panneau Ressources, absent ailleurs. */
  numero?: string;
}) {
  return (
    <Link
      href={href}
      className={s.rangee}
      style={{
        display: numero ? "flex" : "block",
        alignItems: "baseline",
        gap: 11,
        padding: "9px 11px",
        borderRadius: 11,
      }}
    >
      {numero && (
        <span
          style={{
            font: "600 10px ui-monospace,Menlo,monospace",
            color: "var(--acc)",
            flex: "none",
            width: 16,
            paddingTop: 3,
          }}
        >
          {numero}
        </span>
      )}
      <span>
        <span
          style={{
            display: "block",
            font: "600 14px var(--ft)",
            letterSpacing: "-.022em",
            color: "var(--ink)",
          }}
        >
          {libelle}
        </span>
        <span
          style={{
            display: "block",
            font: "400 12px/1.4 var(--fb)",
            color: "var(--ink3)",
            marginTop: 2,
          }}
        >
          {description}
        </span>
      </span>
    </Link>
  );
}

/** Point orange de 5px, posé devant les entrées mises en avant. */
export const PASTILLE: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "none",
};

/** Puce de ville : fond carte, bordure fine, texte sur une seule ligne. */
export const PUCE: React.CSSProperties = {
  font: "500 12.5px var(--fb)",
  padding: "6px 12px",
  borderRadius: 999,
  background: "var(--card)",
  border: "1px solid var(--line)",
  whiteSpace: "nowrap",
};
