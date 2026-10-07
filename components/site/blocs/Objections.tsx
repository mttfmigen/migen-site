import { useId } from "react";

import type { SectionObjections } from "@/types/contenu";
import styles from "./Blocs.module.css";
import { LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage";
import TexteRiche from "./TexteRiche";

/**
 * Section 9 du gabarit : les objections, en dépliants.
 *
 * `<details>` et `<summary>` plutôt que le bouton piloté de la maquette : aucun
 * JavaScript, le clavier et les lecteurs d'écran fonctionnent sans rien ajouter,
 * et la réponse est dans le HTML envoyé à Google, ouverte ou fermée. Les classes
 * `cx-faq` et `cx-plus` sont celles que `app/globals.css` attend déjà : il y
 * tient l'état ouvert, rotation de la croix et passage à l'orange.
 */
export default function Objections({ section }: { section: SectionObjections }) {
  // README : une seule question ouverte à la fois. Accordéon exclusif natif.
  const groupe = useId();
  if (section.questions.length === 0) return null;

  return (
    <section className={styles.corpus} style={SECTION}>
      <div style={LARGEUR}>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".8fr 1.2fr",
            gap: 52,
            alignItems: "start",
          }}
        >
          <div style={{ position: "sticky", top: 112 }}>
            <div style={SURTITRE}>Questions fréquentes</div>
            <h2 style={{ ...TITRE2, maxWidth: "14ch", marginBottom: 22 }}>
              {section.titre ?? "Ce qu'on nous demande avant de signer."}
            </h2>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {section.questions.map((question) => (
              <details
                key={question.question}
                className="cx-faq"
                name={groupe}
                style={{ ...VERRE, borderRadius: "var(--rad-s)" }}
              >
                <summary className={styles.questionFaq}>
                  <span
                    style={{
                      font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
                      letterSpacing: "-.022em",
                      color: "var(--ink)",
                    }}
                  >
                    <TexteRiche texte={question.question} />
                  </span>
                  <span aria-hidden="true" className={`cx-plus ${styles.plusFaq}`}>
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
                  <TexteRiche texte={question.reponse} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
