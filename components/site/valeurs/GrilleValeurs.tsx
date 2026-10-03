import type { CSSProperties } from "react";

import { VALEURS, type Valeur } from "./valeurs-donnees";

/* Les cinq valeurs, portées de `maquette/accueil-rendu.html` lignes 5567 à
   5620. La première carte occupe deux colonnes sur fond foncé, les quatre
   suivantes sont en verre : c'est la seule différence, elle est portée par
   `principale`.

   Les titres restent des `div` et non des `h2`, à dessein : `app/globals.css`
   force la taille de tout `h2` sous 760px, ce qui ferait éclater les cartes sur
   téléphone. La page garde donc un seul niveau de titre après son h1. */

const HALO: CSSProperties = {
  position: "absolute",
  width: 420,
  height: 420,
  right: -160,
  top: -200,
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
  pointerEvents: "none",
};

const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};

const COLONNE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const PASTILLE: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "none",
  marginTop: 6,
};

function Carte({ valeur, principale }: { valeur: Valeur; principale: boolean }) {
  return (
    <div
      className="mg-val"
      style={{
        gridColumn: principale ? "span 2" : "span 1",
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--rad)",
        padding: principale ? "36px 38px" : "30px 30px 28px",
        display: "flex",
        flexDirection: "column",
        minHeight: principale ? 300 : 280,
        ...(principale ? { background: "var(--panel)" } : VERRE),
      }}
    >
      {principale && <div style={HALO} />}
      <div style={COLONNE}>
        <span
          style={{
            font: `700 calc(${principale ? 64 : 44}px * var(--ts))/.9 var(--ft)`,
            letterSpacing: "-.06em",
            color: principale ? "var(--acc)" : "rgba(255,124,60,.9)",
            marginBottom: 18,
          }}
        >
          {valeur.numero}
        </span>
        <div
          style={{
            font: `600 calc(${principale ? 26 : 19}px * var(--ts))/1.25 var(--ft)`,
            letterSpacing: "-.03em",
            color: principale ? "#fff" : "var(--ink)",
            marginBottom: 12,
            maxWidth: "22ch",
          }}
        >
          {valeur.titre}
        </div>
        <p
          style={{
            font: `400 ${principale ? "16px" : "14.5px"}/1.65 var(--fb)`,
            color: principale ? "rgba(255,255,255,.68)" : "var(--ink2)",
            margin: "0 0 20px",
            maxWidth: "56ch",
          }}
        >
          {valeur.texte}
        </p>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            paddingTop: 16,
            borderTop: `1px solid ${principale ? "rgba(255,255,255,.14)" : "var(--line)"}`,
          }}
        >
          <span style={PASTILLE} />
          <span
            style={{
              font: "500 13.5px/1.55 var(--fb)",
              color: principale ? "#fff" : "var(--ink1)",
            }}
          >
            {valeur.preuve}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GrilleValeurs() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-valg"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 14,
          }}
        >
          {VALEURS.map((valeur, rang) => (
            <Carte key={valeur.numero} valeur={valeur} principale={rang === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
