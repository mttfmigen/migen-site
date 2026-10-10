import Image from "next/image";
import { useId, type CSSProperties } from "react";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";

import styles from "./Equipe.module.css";
import { QUESTIONS } from "./equipe-donnees";
import { LARGEUR, SECTION, SURTITRE, VERRE } from "./habillage-equipe";

/**
 * « Équipe · Questions », relevé sur la capture
 * `maquette/rendu/a-propos--equipe.html` et sur la règle `.mg-faqph` de la
 * maquette qui tourne (08/10) : panneau sombre aux coins `--rad`, photo
 * d'atelier sous un voile qui s'éclaircit vers la droite, titre blanc et
 * pastille « Poser ma question » à gauche, six plis en verre à 10 % à droite.
 *
 * La photo est celle de la maquette, octet pour octet : `faq-offre.jpg`
 * (empreinte comparée au blob de la maquette le 08/10).
 *
 * `.mg-faqph` redéfinit les jetons de couleur DANS le panneau : on fait de même
 * en ligne, si bien que `VERRE` et les couleurs `--ink*` donnent le verre
 * translucide et le texte blanc sans dupliquer un seul style.
 *
 * Tous les plis sont fermés au chargement, comme sur la capture. Un seul ouvert
 * à la fois (README) : accordéon exclusif natif, sans JavaScript.
 */

const PANNEAU = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgb(28,27,25)",
  color: "var(--ink)",
  display: "grid",
  gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
  gap: 52,
  alignItems: "start",
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

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, rgba(18,17,16,.92) 0%, rgba(18,17,16,.8) 50%, rgba(18,17,16,.62) 100%)",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: "0 0 22px",
  textWrap: "balance",
  maxWidth: "14ch",
};

const BOUTON: CSSProperties = {
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
};

const PLI: CSSProperties = { ...VERRE, borderRadius: "var(--rad-s)" };

const RESUME: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  padding: "20px 24px",
};

const QUESTION: CSSProperties = {
  font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "var(--ink)",
};

const PLUS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 999,
  flex: "none",
  font: "400 20px/1 var(--fb)",
  transition: "transform var(--tr),background var(--tr)",
  background: "var(--chip)",
  color: "var(--ink2)",
};

const REPONSE: CSSProperties = {
  padding: "0 24px 22px",
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  maxWidth: "68ch",
};

export default function QuestionsEquipe() {
  const groupe = useId();
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div className={`mg-r2 ${styles.panneauQuestions}`} style={PANNEAU}>
            <Image
              src="/assets/web/faq-offre.jpg"
              alt=""
              fill
              sizes="(max-width: 1200px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
            />
            <div aria-hidden="true" style={VOILE} />
            <div style={{ position: "relative" }}>
              <div style={SURTITRE}>Questions fréquentes</div>
              <h2 style={TITRE}>
                Comment l&rsquo;équipe s&rsquo;organise autour du technicien.
              </h2>
              <a href={ANCRE_FORMULAIRE} className={styles.boutonAction} style={BOUTON}>
                Poser ma question
              </a>
            </div>
            <div style={{ position: "relative", display: "grid", gap: 10 }}>
              {QUESTIONS.map((item) => (
                <details key={item.question} name={groupe} style={PLI}>
                  <summary className={styles.questionEquipe} style={RESUME}>
                    <span style={QUESTION}>{item.question}</span>
                    <span aria-hidden="true" className="g3-plus" style={PLUS}>
                      +
                    </span>
                  </summary>
                  <div style={REPONSE}>{item.reponse}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
