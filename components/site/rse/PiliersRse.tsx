import type { CSSProperties } from "react";

import { SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import { PILIERS, type Pilier } from "./piliers-donnees";

/**
 * Les quatre piliers RSE, en grille de deux cartes de verre.
 * Portée de `maquette/accueil-rendu.html`, lignes 5707 à 5789.
 *
 * Composant serveur. La copie et les écarts sont dans `piliers-donnees.ts`.
 *
 * UN RETRAIT. La maquette fermait la grille sur « Indicateurs d'exemple, à
 * remplacer par vos relevés réels avant publication », une note de travail
 * rendue en texte visible. Elle ne part pas en production : un visiteur n'a pas
 * à lire les réserves internes sur les chiffres qu'on lui montre. La réserve
 * elle-même reste ouverte, elle est remontée dans le rapport de portage.
 */

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "30px 32px 32px",
  display: "flex",
  flexDirection: "column",
};

const RANG: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  flex: "none",
};

const TITRE_CARTE: CSSProperties = {
  font: "600 calc(20px * var(--ts)) var(--ft)",
  letterSpacing: "-.032em",
  color: "var(--ink)",
};

const CHAPEAU_CARTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 20px",
};

const VALEUR: CSSProperties = {
  font: "600 calc(21px * var(--ts)) var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--acc)",
  flex: "none",
  minWidth: 74,
};

const LIBELLE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink1)",
};

const NOTE: CSSProperties = {
  marginTop: "auto",
  paddingTop: 16,
  borderTop: "1px solid var(--line)",
  font: "400 12.5px/1.5 var(--fb)",
  color: "var(--ink3)",
};

function CartePilier({ pilier }: { pilier: Pilier }) {
  return (
    <div style={CARTE}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <span style={RANG}>{pilier.rang}</span>
        <span style={TITRE_CARTE}>{pilier.titre}</span>
      </div>
      <p style={CHAPEAU_CARTE}>{pilier.chapeau}</p>
      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        {pilier.indicateurs.map((indicateur) => (
          <div
            key={indicateur.libelle}
            style={{ display: "flex", alignItems: "baseline", gap: 14 }}
          >
            <span style={VALEUR}>{indicateur.valeur}</span>
            <span style={LIBELLE}>{indicateur.libelle}</span>
          </div>
        ))}
      </div>
      <div style={NOTE}>{pilier.note}</div>
    </div>
  );
}

export default function PiliersRse() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 32,
            }}
          >
            <div>
              <div style={{ ...SURTITRE, marginBottom: 18 }}>Quatre piliers</div>
              <h2
                style={{
                  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  margin: 0,
                  textWrap: "balance",
                  maxWidth: "22ch",
                }}
              >
                Là où nous avons une prise réelle
              </h2>
            </div>
            <p
              style={{
                font: "400 15.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              Nous ne publions que ce que nous mesurons. Les indicateurs
              ci-dessous sont relevés sur l’exercice 2025 et révisés chaque
              année.
            </p>
          </div>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 12,
            }}
          >
            {PILIERS.map((pilier) => (
              <CartePilier key={pilier.rang} pilier={pilier} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
