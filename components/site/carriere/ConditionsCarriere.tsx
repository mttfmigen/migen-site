import type { CSSProperties } from "react";

/**
 * « Ce que nous offrons » : quatre conditions, maquette lignes 3213 à 3242.
 *
 * ÉCART À LA MAQUETTE : elle écrit « Cinq agences », interdit de copie du
 * projet. Le compte tenu est quatre agences (Lyon siège à Écully, Montréal,
 * Dubaï, Madrid) et dix hubs de techniciens.
 */

interface Condition {
  readonly surtitre: string;
  readonly titre: string;
  readonly texte: string;
}

const CONDITIONS: readonly Condition[] = [
  {
    surtitre: "Formation",
    titre: "Habilitations payées",
    texte:
      "CACES, habilitations électriques, travail en hauteur, risques chimiques : à notre charge, renouvellements compris.",
  },
  {
    surtitre: "Proximité",
    titre: "Mobilité France entière",
    texte:
      "Quatre agences, dix hubs de techniciens et des clients partout en France. Déplacements et grands déplacements pris en charge ; nous cherchons d’abord près de chez vous.",
  },
  {
    surtitre: "Technicité",
    titre: "Des machines qui valent le détour",
    texte:
      "Robotique FANUC et ABB, automates SIEMENS et Schneider, lignes agroalimentaires, sidérurgie, pharma.",
  },
  {
    surtitre: "Sécurité",
    titre: "On ne discute pas les EPI",
    texte:
      "Démarche MASE, plan de prévention systématique, droit d’arrêt reconnu à chaque technicien.",
  },
];

/** Le verre dépoli des quatre cartes, valeurs de la maquette. */
const CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: "var(--rad)",
  padding: "30px 28px 32px",
};

export default function ConditionsCarriere() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: "16px",
            }}
          >
            Ce que nous offrons
          </div>
          <h2
            style={{
              font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
              letterSpacing: "-.04em",
              margin: "0 0 38px",
              maxWidth: "24ch",
              textWrap: "balance",
            }}
          >
            Pas de promesses. Des conditions.
          </h2>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px",
            }}
          >
            {CONDITIONS.map((condition) => (
              <div key={condition.surtitre} style={CARTE}>
                <div
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: "14px",
                  }}
                >
                  {condition.surtitre}
                </div>
                <div
                  style={{
                    font: "600 17px var(--ft)",
                    letterSpacing: "-.025em",
                    marginBottom: "8px",
                  }}
                >
                  {condition.titre}
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                  }}
                >
                  {condition.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
