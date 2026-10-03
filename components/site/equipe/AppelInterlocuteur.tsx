import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";

import styles from "./Equipe.module.css";
import { LARGEUR, VERRE } from "./habillage-equipe";

/**
 * Le bandeau d'appel « Un interlocuteur, pas un standard. ».
 * Maquette lignes 5961 à 5974.
 *
 * Le bouton visait `goContact`, la navigation interne de l'éditeur. `/contact/`
 * répond 404 aujourd'hui : il mène donc au formulaire de cette page, qui existe
 * et qui arrive chez un chargé d'affaires. C'est la décision déjà prise par le
 * projet pour les 126 pages du cocon, voir `ANCRE_FORMULAIRE`.
 */
export default function AppelInterlocuteur() {
  return (
    <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          style={{
            ...VERRE,
            borderRadius: 36,
            boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
            padding: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 44,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                font: "600 calc(clamp(24px,2.5vw,36px) * var(--ts))/1.1 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 12px",
                maxWidth: "26ch",
                textWrap: "balance",
              }}
            >
              Un interlocuteur, pas un standard.
            </h2>
            <p
              style={{
                font: "400 16.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "52ch",
              }}
            >
              Dites-nous ce qu&rsquo;il faut tenir&nbsp;: un chargé
              d&rsquo;affaires de votre bassin vous rappelle dans l&rsquo;heure.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flex: "none",
              flexWrap: "wrap",
            }}
          >
            <a
              href={ANCRE_FORMULAIRE}
              className={styles.boutonAction}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "16px 28px",
                borderRadius: 999,
                background: "var(--acc)",
                color: "#fff",
                font: "600 15.5px var(--fb)",
                whiteSpace: "nowrap",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Parler à un chargé d&rsquo;affaires
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
