import type { CSSProperties } from "react";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";

import styles from "./Valeurs.module.css";
import { HERO, SLOGAN } from "./valeurs-donnees";

/* Ouverture de l'écran « Nos valeurs », portée de `maquette/accueil-rendu.html`
   lignes 5532 à 5565. Composant serveur : aucun état, les deux survols sont
   dans le module CSS. */

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

const BOUTON_ACCENT: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

const PANNEAU: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  padding: "32px 34px 34px",
  position: "relative",
  overflow: "hidden",
};

const HALO: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

export default function HeroValeurs() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}>
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr .92fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div>
          <div style={SURTITRE}>{HERO.surtitre}</div>
          <h1
            style={{
              font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            {HERO.titre}
          </h1>
          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "50ch",
            }}
          >
            {HERO.intro}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a
              className={styles.boutonAccent}
              href={ANCRE_FORMULAIRE}
              style={BOUTON_ACCENT}
            >
              {HERO.action}
            </a>
            {/* La maquette pose ici un second bouton vers la page des
                engagements RSE. Cette page n'existe pas : un bouton sans
                destination est le défaut qu'on répare, donc le libellé est
                rendu en texte, sans fond ni bordure, pour qu'il ne se lise pas
                comme un bouton. À repasser en lien quand la page est servie. */}
            <span
              style={{
                font: "600 15px var(--fb)",
                color: "var(--ink3)",
                whiteSpace: "nowrap",
              }}
            >
              {HERO.secondaire}
            </span>
          </div>
        </div>
        <div style={PANNEAU}>
          <div style={HALO} />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE}>{HERO.panneau}</div>
            <div style={{ display: "grid", gap: 16 }}>
              {SLOGAN.map(({ mot, glose }) => (
                <div key={mot}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span
                      style={{
                        font: "600 calc(19px * var(--ts)) var(--ft)",
                        letterSpacing: "-.03em",
                        color: "#fff",
                        flex: "none",
                      }}
                    >
                      {mot}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        height: 1,
                        background: "rgba(255,255,255,.14)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      font: "400 14px/1.6 var(--fb)",
                      color: "rgba(255,255,255,.68)",
                      marginTop: 8,
                    }}
                  >
                    {glose}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
