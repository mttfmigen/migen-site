import Image from "next/image";
import { useId, type CSSProperties } from "react";

import { SURTITRE, VERRE } from "@/components/site/blocs/habillage";

import styles from "./HubCarriere.module.css";
import { Enveloppe, Paragraphe } from "./SectionsHub";
import { altPhoto } from "@/lib/descriptions-photos";

/* -------------------------------------------------------------- questions */

/**
 * Les jetons que `.mg-faqph` redéfinit dans l'application : le panneau passe
 * en sombre, le verre des plis devient translucide. La capture n'en garde que
 * la classe ; la feuille de style vit dans `site-final-autonome.html`.
 */
const JETONS_PANNEAU = {
  "--ink": "#fff",
  "--ink1": "rgba(255,255,255,.9)",
  "--ink2": "rgba(255,255,255,.8)",
  "--ink3": "rgba(255,255,255,.66)",
  "--ink4": "rgba(255,255,255,.52)",
  "--line": "rgba(255,255,255,.16)",
  "--chip": "rgba(255,255,255,.14)",
  "--gl-a": ".1",
  "--gbd": "rgba(255,255,255,.18)",
  "--card": "rgba(255,255,255,.08)",
  "--acc-ink": "#ffb48a",
} as CSSProperties;

/** La photo de `.mg-faqph`, octets identiques à ceux de la maquette. */
const PHOTO_QUESTIONS = "/assets/web/faq-offre.jpg";

export default function QuestionsHub({
  surtitre,
  titre,
  intros,
  questions,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  questions: { question: string; reponse: string }[];
}) {
  // README : une seule question ouverte à la fois. Accordéon exclusif natif.
  const groupe = useId();
  if (!questions.length) return null;
  return (
    <Enveloppe>
      <div
        className={`${styles.deuxColonnes} ${styles.panneauPhoto}`}
        style={{
          ...JETONS_PANNEAU,
          maxWidth: 1200,
          margin: "0 auto",
          padding: 44,
          display: "grid",
          gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
          gap: 52,
          alignItems: "start",
          position: "relative",
          borderRadius: "var(--rad)",
          overflow: "hidden",
          background: "#1c1b19",
          color: "var(--ink)",
        }}
      >
        <Image src={PHOTO_QUESTIONS} alt={altPhoto(PHOTO_QUESTIONS)} fill sizes="1200px" style={{ objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,rgba(18,17,16,.92) 0%,rgba(18,17,16,.8) 50%,rgba(18,17,16,.62) 100%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={SURTITRE}>{surtitre}</div>
          <h2
            style={{
              font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
              letterSpacing: "-.04em",
              color: "var(--ink)",
              margin: "0 0 22px",
              textWrap: "balance",
              maxWidth: "14ch",
            }}
          >
            {titre}
          </h2>
          <a
            href="tel:+33478337205"
            className={styles.boutonQuestion}
            style={{
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
              transition: "filter var(--tr),transform var(--tr)",
            }}
          >
            Poser ma question
          </a>
        </div>
        <div style={{ position: "relative" }}>
          {intros?.map((t) => (
            <Paragraphe
              key={t}
              texte={t}
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 14px",
                maxWidth: "62ch",
              }}
            />
          ))}
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {questions.map((q, i) => (
              <details
                key={q.question}
                className={styles.pli}
                open={i === 0}
                name={groupe}
                style={{ ...VERRE, borderRadius: "var(--rad-s)" }}
              >
                <summary
                  style={{
                    listStyle: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 18,
                    padding: "20px 24px",
                  }}
                >
                  <span
                    style={{
                      font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
                      letterSpacing: "-.022em",
                      color: "var(--ink)",
                    }}
                  >
                    {q.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={styles.pliPlus}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      flex: "0 0 auto",
                      font: "400 20px/1 var(--fb)",
                      transition: "transform var(--tr),background var(--tr)",
                      background: "var(--chip)",
                      color: "var(--ink2)",
                    }}
                  >
                    +
                  </span>
                </summary>
                <div
                  style={{
                    padding: "0 24px 22px",
                    font: "400 15px/1.7 var(--fb)",
                    color: "var(--ink2)",
                    maxWidth: "68ch",
                  }}
                >
                  {q.reponse}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Enveloppe>
  );
}
