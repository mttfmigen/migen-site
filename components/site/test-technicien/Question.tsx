import { useId, type CSSProperties, type Ref } from "react";

import { VERRE } from "@/components/site/blocs/habillage";

import { QUESTIONS } from "./donnees-test";

/* Une question du test (`tRunning`), portée du gabarit `isTest` et des styles
   calculés du script de la maquette (`tFillCss`, `tBackCss`, `o.css`,
   `o.letterCss`), valeur pour valeur. */

const LETTRES = "ABCD";

function styleOption(choisie: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    width: "100%",
    textAlign: "left",
    padding: "18px 20px",
    borderRadius: "var(--rad-s)",
    cursor: "pointer",
    transition: "all var(--tr)",
    font: "400 15px/1.5 var(--fb)",
    border: `1px solid ${choisie ? "rgba(255,124,60,.5)" : "var(--line)"}`,
    background: choisie ? "var(--acc-w)" : "var(--card)",
    color: "var(--ink1)",
  };
}

function styleLettre(choisie: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 999,
    flex: "none",
    font: "600 11.5px var(--fb)",
    background: choisie ? "var(--acc)" : "var(--chip)",
    color: choisie ? "#fff" : "var(--ink3)",
  };
}

interface Proprietes {
  /** Rang de la question, 0 pour la première. */
  rang: number;
  /** L'option déjà choisie à ce rang, quand on revient en arrière. */
  choisie: number | undefined;
  onChoisit: (option: number) => void;
  onRecule: () => void;
  /** Reçoit le focus à chaque question, pour qu'un lecteur d'écran la lise. */
  refQuestion: Ref<HTMLDivElement>;
}

export default function Question({ rang, choisie, onChoisit, onRecule, refQuestion }: Proprietes) {
  const question = QUESTIONS[rang];
  const total = QUESTIONS.length;
  const idQuestion = useId();
  const peutReculer = rang > 0;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ ...VERRE, padding: "34px 36px 36px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              font: "600 10.5px var(--fb)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--acc)",
            }}
          >
            {question.domaine}
          </span>
          <span
            style={{
              font: "600 10.5px var(--fb)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--ink4)",
              whiteSpace: "nowrap",
            }}
          >
            Question {rang + 1} / {total}
          </span>
        </div>
        <div
          style={{
            height: 3,
            borderRadius: 999,
            background: "var(--line)",
            overflow: "hidden",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              background: "var(--acc)",
              transition: "width .3s ease",
              width: `${Math.round(((rang + 1) / total) * 100)}%`,
            }}
          />
        </div>
        <div
          id={idQuestion}
          ref={refQuestion}
          tabIndex={-1}
          style={{
            font: "600 calc(clamp(19px,2.1vw,26px) * var(--ts))/1.3 var(--ft)",
            letterSpacing: "-.032em",
            color: "var(--ink)",
            marginBottom: 24,
            maxWidth: "30ch",
            textWrap: "balance",
          }}
        >
          {question.question}
        </div>
        <div role="group" aria-labelledby={idQuestion} style={{ display: "grid", gap: 9, marginBottom: 24 }}>
          {question.options.map((option, i) => (
            <button
              key={option}
              type="button"
              aria-pressed={choisie === i}
              onClick={() => onChoisit(i)}
              style={styleOption(choisie === i)}
            >
              <span style={styleLettre(choisie === i)}>{LETTRES[i]}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            paddingTop: 20,
            borderTop: "1px solid var(--line)",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onRecule}
            disabled={!peutReculer}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 20px",
              borderRadius: 999,
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--ink2)",
              font: "600 14px var(--fb)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              opacity: peutReculer ? "1" : ".3",
              pointerEvents: peutReculer ? "auto" : "none",
            }}
          >
            ← Question précédente
          </button>
          <span style={{ font: "400 12px var(--fb)", color: "var(--ink4)" }}>
            Une seule réponse. Aucun retour en arrière sur le score.
          </span>
        </div>
      </div>
    </div>
  );
}
