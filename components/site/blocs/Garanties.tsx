import type { SectionGaranties } from "@/types/contenu";
import styles from "./Blocs.module.css";
import { LARGEUR, PROSE_FORT, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage";
import TexteRiche from "./TexteRiche";

/**
 * Section 6 du gabarit : trois puces d'engagement.
 *
 * C'est le bloc qui transforme une promesse vague en contrat moral. La pastille
 * orange cochée vient de la liste « Ce que migen© porte » de la maquette ; son
 * en-tête interne n'est pas repris, le titre de section le dit déjà.
 */
export default function Garanties({ section }: { section: SectionGaranties }) {
  if (section.puces.length === 0) return null;

  return (
    <section className={styles.corpus} style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ marginBottom: 26 }}>
          <div style={SURTITRE}>Nos engagements</div>
          <h2 style={TITRE2}>{section.titre ?? "Ce que nous garantissons."}</h2>
        </div>

        <div style={{ ...VERRE, padding: "30px 32px 18px" }}>
          {section.puces.map((puce) => (
            <div
              key={puce.texte}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 0",
                borderTop: "1px solid var(--line)",
                font: "400 15px/1.55 var(--fb)",
                color: "var(--ink1)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  flex: "none",
                  marginTop: 1,
                  font: "600 11px var(--fb)",
                  background: "var(--acc)",
                  color: "#fff",
                }}
              >
                ✓
              </span>
              <span>
                {puce.accroche ? (
                  <strong style={PROSE_FORT}>
                    <TexteRiche texte={puce.accroche} />{" "}
                  </strong>
                ) : null}
                <TexteRiche texte={puce.texte} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
