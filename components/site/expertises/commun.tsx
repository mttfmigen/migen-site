import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { EnTeteSection } from "@/types/expertises";

/**
 * Habillage et fragments partagés par les sept sections du gabarit expertises.
 *
 * Valeurs relevées dans « Migen - Site final.dc.html », lignes 6211 à 6646, et
 * recopiées telles quelles. Seules celles que `blocs/habillage.ts` ne porte pas
 * déjà sont ici : le reste s'importe de là-bas, pour que la charte n'ait qu'un
 * seul endroit où bouger.
 */

/** Le verre des grandes cartes : ombre plus portée que celle de `habillage.ts`. */
export const VERRE_CARTE: CSSProperties = {
  ...VERRE,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
};

export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  textWrap: "balance",
  maxWidth: "22ch",
};

export const NOTE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink4)",
  flex: "none",
  maxWidth: "32ch",
};

/** La pastille en capitales, en haut à droite d'une carte. */
export const ETIQUETTE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  padding: "5px 11px",
  borderRadius: 999,
  color: "var(--acc-ink)",
  backgroundColor: "var(--acc-w)",
};

export const FILET: CSSProperties = { height: 1, background: "var(--line)" };

/** La grille à trois colonnes. `.mg-rmulti` la replie en deux puis une. */
export const TROIS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 16,
};

/** Surtitre orange, H2, et la phrase en petit alignée à droite. */
export function Entete({ entete }: { entete: EnTeteSection }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 36,
        marginBottom: 34,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={SURTITRE}>
          <TexteRiche texte={entete.surtitre} />
        </div>
        <h2 style={TITRE2}>
          <TexteRiche texte={entete.titre} />
        </h2>
      </div>
      {entete.note ? (
        <span style={NOTE}>
          <TexteRiche texte={entete.note} />
        </span>
      ) : null}
    </div>
  );
}

/** La lueur orange en coin d'un panneau. Décorative, donc masquée au lecteur. */
export function Lueur({ style }: { style: CSSProperties }) {
  return <div aria-hidden="true" style={style} />;
}

/** Un filet horizontal entre deux lignes d'une liste. Jamais annoncé. */
export function Separateur({ style }: { style?: CSSProperties }) {
  return <div aria-hidden="true" style={{ ...FILET, ...style }} />;
}

/** Une puce cochée. Le crochet est décoratif, la phrase porte le sens. */
export function Puce({ texte, clair }: { texte: string; clair?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        font: "400 13.5px/1.5 var(--fb)",
        color: clair ? "rgba(255,255,255,.72)" : "var(--ink1)",
      }}
    >
      <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
        ✓
      </span>
      <TexteRiche texte={texte} />
    </div>
  );
}
