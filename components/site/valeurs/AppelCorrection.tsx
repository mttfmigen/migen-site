import type { CSSProperties } from "react";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";

import styles from "./Valeurs.module.css";
import { CORRECTION } from "./valeurs-donnees";

/* Appel à signaler une valeur non tenue, porté de
   `maquette/accueil-rendu.html` lignes 5622 à 5637. */

const VERRE: CSSProperties = {
  borderRadius: 36,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  padding: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 44,
  flexWrap: "wrap",
};

export default function AppelCorrection() {
  return (
    // La maquette écrit `var(--sec) 0 var(--sec)` et ouvre le formulaire qui
    // suit à zéro. Ici le formulaire est le composant partagé, qui porte déjà
    // son `var(--sec)` haut : la marge basse est donc laissée à lui, sinon
    // l'écart entre les deux cartes doublerait.
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="" style={VERRE}>
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 18,
              }}
            >
              {CORRECTION.surtitre}
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 12px",
                textWrap: "balance",
                maxWidth: "24ch",
                // La maquette écrase sa propre taille juste après l'avoir
                // déclarée : c'est la seconde valeur qui s'applique.
                fontSize: "calc(clamp(24px,2.6vw,36px) * var(--ts))",
              }}
            >
              {CORRECTION.titre}
            </h2>
            <p
              style={{
                font: "400 16px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "52ch",
              }}
            >
              {CORRECTION.texte}
            </p>
          </div>
          <a
            className={styles.boutonAccent}
            href={ANCRE_FORMULAIRE}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              borderRadius: 999,
              background: "var(--acc)",
              color: "#fff",
              font: "600 15px var(--fb)",
              whiteSpace: "nowrap",
              boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
              flex: "none",
              padding: "16px 30px",
              fontSize: "15.5px",
            }}
          >
            {CORRECTION.action}
          </a>
        </div>
      </div>
    </section>
  );
}
