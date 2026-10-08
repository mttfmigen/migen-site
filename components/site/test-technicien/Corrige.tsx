import { VERRE } from "@/components/site/blocs/habillage";

import { QUESTIONS } from "./donnees-test";

/* « Votre corrigé » (`tReview`), porté du gabarit `isTest` de la maquette :
   une carte par question, la réponse donnée barrée quand elle est fausse. */

const LIGNE = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  font: "400 14px/1.5 var(--fb)",
} as const;

const ETIQUETTE = {
  font: "600 10px var(--fb)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  flex: "none",
  width: 68,
} as const;

interface Proprietes {
  reponses: readonly (number | undefined)[];
}

export default function Corrige({ reponses }: Proprietes) {
  return (
    <div data-reveal="" style={{ marginTop: 36 }}>
      <div
        style={{
          font: "600 11.5px var(--fb)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--acc)",
          marginBottom: 18,
        }}
      >
        Votre corrigé
      </div>
      <h2
        style={{
          font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
          letterSpacing: "-.04em",
          color: "var(--ink)",
          margin: "0 0 24px",
          textWrap: "balance",
          maxWidth: "24ch",
        }}
      >
        Les huit réponses, expliquées
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {QUESTIONS.map((q, i) => {
          const juste = reponses[i] === q.bonne;
          const donnee = reponses[i];
          return (
            <div key={q.question} style={{ ...VERRE, padding: "26px 28px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
                <span
                  role="img"
                  aria-label={juste ? "Bonne réponse" : "Réponse fausse"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    flex: "none",
                    font: "600 12px var(--fb)",
                    background: juste ? "var(--acc)" : "var(--chip)",
                    color: juste ? "#fff" : "var(--ink3)",
                  }}
                >
                  {juste ? "✓" : "✕"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        font: "600 10px ui-monospace,Menlo,monospace",
                        letterSpacing: ".06em",
                        color: "var(--ink4)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        font: "600 10.5px var(--fb)",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--acc)",
                      }}
                    >
                      {q.domaine}
                    </span>
                  </div>
                  <div style={{ font: "600 16.5px/1.4 var(--ft)", letterSpacing: "-.025em", color: "var(--ink)" }}>
                    {q.question}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 7, marginBottom: 14, paddingLeft: 42 }}>
                {!juste && (
                  <div style={{ ...LIGNE, color: "var(--ink3)" }}>
                    <span style={ETIQUETTE}>Votre choix</span>
                    <span style={{ textDecoration: "line-through" }}>
                      {donnee === undefined ? "Sans réponse" : q.options[donnee]}
                    </span>
                  </div>
                )}
                <div style={{ ...LIGNE, color: "var(--ink1)" }}>
                  <span style={{ ...ETIQUETTE, color: "var(--acc)" }}>Réponse</span>
                  <span style={{ fontWeight: 500 }}>{q.options[q.bonne]}</span>
                </div>
              </div>
              <p
                style={{
                  font: "400 14.5px/1.7 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                  paddingLeft: 42,
                  maxWidth: "74ch",
                }}
              >
                {q.explication}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
