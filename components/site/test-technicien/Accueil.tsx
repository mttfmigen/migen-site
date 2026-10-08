import Image from "next/image";
import type { CSSProperties, Ref } from "react";

import { VERRE } from "@/components/site/blocs/habillage";

import styles from "./TestTechnicien.module.css";

/* L'accueil du test (`tIntro`), porté du gabarit `isTest` de la maquette
   autonome. Styles recopiés tels quels. */

const PUCE: CSSProperties = {
  ...VERRE,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  font: "600 12.5px var(--fb)",
  color: "var(--ink1)",
  padding: "8px 15px",
  borderRadius: 999,
};

const POINT: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "none",
};

const PUCES = ["8 questions", "6 minutes", "Corrigé détaillé", "Aucune inscription"];

interface Proprietes {
  onCommence: () => void;
  /** Reçoit le focus quand on revient du résultat par « Refaire le test ». */
  refCommence: Ref<HTMLButtonElement>;
}

export default function Accueil({ onCommence, refCommence }: Proprietes) {
  return (
    <div
      className="mg-r2"
      style={{ display: "grid", gridTemplateColumns: "1.06fr .94fr", gap: 46, alignItems: "start" }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <span
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
            }}
          >
            Test technique
          </span>
          <span
            style={{
              font: "600 10px var(--fb)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--acc)",
              padding: "4px 10px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            Anonyme
          </span>
        </div>
        <h1
          style={{
            font: "600 calc(clamp(34px,4.1vw,58px) * var(--ts))/1.04 var(--ft)",
            letterSpacing: "-.045em",
            color: "var(--ink)",
            margin: 0,
            maxWidth: "19ch",
            textWrap: "balance",
          }}
        >
          Huit questions. Celles qu’on pose vraiment en entretien.
        </h1>
        <p
          style={{
            font: "400 17px/1.7 var(--fb)",
            color: "var(--ink2)",
            margin: "22px 0 0",
            maxWidth: "54ch",
          }}
        >
          Un technicien sur dix passe notre processus de sélection. Ce test reprend les questions de
          l’entretien technique&nbsp;: consignation, roulements, vibratoire, variateurs, capteurs,
          hydraulique, lecture de schéma. Vous repartez avec le corrigé, que vous postuliez ou non.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
          {PUCES.map((puce) => (
            <span key={puce} style={PUCE}>
              <span style={POINT} />
              {puce}
            </span>
          ))}
        </div>
        <button
          type="button"
          ref={refCommence}
          onClick={onCommence}
          className={styles.boutonLeve}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            marginTop: 30,
            padding: "16px 30px",
            borderRadius: 999,
            backgroundColor: "#ff7c3c",
            color: "#fff",
            font: "600 15.5px var(--fb)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
            transition: "filter var(--tr),transform var(--tr)",
          }}
        >
          Commencer le test →
        </button>
      </div>
      <div
        style={{
          borderRadius: "var(--rad)",
          overflow: "hidden",
          position: "relative",
          minHeight: 400,
          background: "var(--ph)",
        }}
      >
        <Image
          src="/assets/web/mq-17e2f3bce95f.jpg"
          alt="Technicien de maintenance migen au travail"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 560px"
          style={{
            objectFit: "cover",
            filter: "saturate(var(--sat)) contrast(1.05)",
            opacity: "var(--ph-op)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top,rgba(18,17,16,.84),rgba(18,17,16,0) 58%)",
          }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 32px" }}>
          <div
            style={{
              font: "600 calc(44px * var(--ts))/1 var(--ft)",
              letterSpacing: "-.055em",
              color: "var(--acc)",
              marginBottom: 10,
            }}
          >
            10&nbsp;%
          </div>
          <div style={{ font: "400 14.5px/1.6 var(--fb)", color: "rgba(255,255,255,.78)", maxWidth: "30ch" }}>
            des techniciens réussissent notre processus de sélection. Le test vous dit où vous vous
            situez.
          </div>
        </div>
      </div>
    </div>
  );
}
