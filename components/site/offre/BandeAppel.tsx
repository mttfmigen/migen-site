import type { CSSProperties } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";

import styles from "./PageOffre.module.css";

/**
 * La bande d'appel de la capture, posée trois fois par le gabarit
 * (sections « Appel · domaines », « Appel · offre », « Appel · références »
 * de `maquette/rendu/offres--residence.html`) : une puce, la mention des
 * horaires, un bouton vers le panneau du héros.
 *
 * DEUX VARIANTES, et c'est la capture qui le dit (relevé du 06/10) :
 * « Appel · domaines » et « Appel · références » sont claires (fond
 * `var(--acc-w)`, bordure orangée, texte `var(--ink1)`) ; « Appel · offre »
 * est SOMBRE (bloc `data-dc-tpl` 533 : fond `var(--panel)`, pas de bordure,
 * texte `rgba(255,255,255,0.8)`). Le bouton orange est le même partout.
 */

/**
 * DEUX CHAMPS SONT DEVENUS OPTIONNELS LE 07/10, pour `/offres/zero-arret/`,
 * dont la capture écrit une autre phrase et un autre bouton. Les défauts
 * reproduisent à l'identique le rendu validé de `/offres/residence/`.
 */
export interface ProprietesBandeAppel {
  /**
   * La phrase à gauche, la mention des horaires du corpus.
   *
   * ABSENTE, la bande ne porte que son bouton. C'est le cas de
   * `/offres/zero-arret/` : sa capture écrit ici un délai chiffré que le
   * contrat du projet interdit, la phrase n'est donc pas rendue et le trou est
   * déclaré dans `scripts/verifie-offre-rendu.mjs`.
   */
  mention?: string;
  /** Le libellé du bouton. À défaut, celui de la capture de la page pilote. */
  bouton?: string;
  /** Le fond de la bande. La capture pose « sombre » sur « Appel · offre ». */
  variante?: "claire" | "sombre";
}

/* Relevé des captures du 07/10 21h12 : `padding: 22px 24px 22px 30px` dans
   136 captures de `maquette/rendu/`, aucune à 11 px. Le relevé antérieur à
   11 px (bureau-etude-electrique, plus tôt le 07/10) est remplacé. */
const BANDE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  padding: "22px 24px 22px 30px",
  borderRadius: 28,
};

const BANDE_CLAIRE: CSSProperties = {
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

const BANDE_SOMBRE: CSSProperties = {
  background: "var(--panel)",
};

const MENTION_CLAIRE: CSSProperties = { color: "var(--ink1)" };

const MENTION_SOMBRE: CSSProperties = { color: "rgba(255,255,255,.8)" };

const PUCE: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 6px rgba(255,124,60,.18)",
  flex: "0 0 auto",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 24px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export default function BandeAppel({
  mention,
  bouton = "Parler à un chargé d’affaires",
  variante = "claire",
}: ProprietesBandeAppel) {
  const sombre = variante === "sombre";
  return (
    <section style={{ padding: "40px 0 0" }}>
      <div style={LARGEUR}>
        <div style={{ ...BANDE, ...(sombre ? BANDE_SOMBRE : BANDE_CLAIRE) }}>
          {mention ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: "1 1 0%",
                minWidth: 260,
              }}
            >
              <span aria-hidden="true" style={PUCE} />
              <span
                style={{
                  font: "500 15px/1.55 var(--fb)",
                  ...(sombre ? MENTION_SOMBRE : MENTION_CLAIRE),
                }}
              >
                {mention}
              </span>
            </div>
          ) : null}
          {/* Sans mention, le bouton reste à DROITE de la bande, là où la
              capture le pose : `space-between` le ramènerait à gauche. */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginLeft: mention ? undefined : "auto",
            }}
          >
            <a href="#besoin" className={styles.boutonPrincipal} style={BOUTON}>
              {bouton}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
