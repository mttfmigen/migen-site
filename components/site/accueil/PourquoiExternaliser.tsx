import type { CSSProperties } from "react";
import styles from "./PourquoiExternaliser.module.css";

interface Proprietes {
  avantages?: string[];
  hrefDecrire?: string;
}

/** Les quatre avantages de la maquette, repris mot pour mot. */
const AVANTAGES_MAQUETTE: string[] = [
  "Pas de coût de recrutement ni de risque de turnover",
  "Habilitations, EPI et formations portés par nous",
  "Remplacement assuré en cas d'absence",
  "Un interlocuteur unique pour tous vos sites",
];

const LIGNE_AVANTAGE: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "baseline",
  padding: "18px 22px",
  borderRadius: "var(--rad-s)",
  background: "var(--gsol)",
  border: "1px solid var(--gbd)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  font: "400 15px/1.5 var(--fb)",
  color: "var(--ink1)",
};

export default function PourquoiExternaliser({
  avantages = AVANTAGES_MAQUETTE,
  hrefDecrire = "#besoin",
}: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 70,
            alignItems: "start",
          }}
        >
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
              Pourquoi externaliser
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 28px",
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              Externaliser sans perdre la main sur votre maintenance
            </h2>
            <ul
              style={{
                display: "grid",
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {avantages.map((a) => (
                <li key={a} style={LIGNE_AVANTAGE}>
                  <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
                    ✓
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 16px",
              }}
            >
              {"Chez migen©, seuls 10 % des techniciens réussissent notre process de sélection, éprouvé sur l’expertise en maintenance industrielle et la polyvalence. Nous vous garantissons des techniciens hautement qualifiés, validés par vos soins."}
            </p>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 26px",
              }}
            >
              {"Nos techniciens sont rigoureusement évalués sur de multiples compétences techniques. Vous conservez le contrôle total sur les intervenants déployés sur votre site : une équipe parfaitement adaptée à vos besoins et à vos exigences."}
            </p>
            <div
              style={{
                padding: "26px 28px",
                borderRadius: "var(--rad)",
                background: "var(--panel)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  right: -130,
                  top: -150,
                  background:
                    "radial-gradient(circle,rgba(255,124,60,.28),transparent 68%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    font: "600 calc(19px * var(--ts))/1.3 var(--ft)",
                    letterSpacing: "-.03em",
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  Dites-nous quel poste vous n&rsquo;arrivez pas à tenir.
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "rgba(255,255,255,.62)",
                    margin: "0 0 20px",
                  }}
                >
                  On vous dit rapidement si on a le technicien, et lequel. Si on
                  ne l&rsquo;a pas, on le dit aussi.
                </p>
                <a
                  href={hrefDecrire}
                  className={styles.boutonBesoin}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "14px 24px",
                    borderRadius: 999,
                    background: "var(--acc)",
                    color: "#fff",
                    font: "600 14.5px var(--fb)",
                    whiteSpace: "nowrap",
                    boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                    transition: "filter var(--tr),transform var(--tr)",
                  }}
                >
                  Décrire mon besoin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
