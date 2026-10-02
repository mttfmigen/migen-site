import type { SectionDeroule } from "@/types/contenu";
import styles from "./Blocs.module.css";
import {
  CHAPEAU,
  colonnes,
  ENTETE,
  LARGEUR,
  PROSE_FORT,
  SECTION,
  SURTITRE,
  TITRE2,
  VERRE,
} from "./habillage";
import TexteRiche from "./TexteRiche";

/**
 * Section 5 du gabarit : ce qui se passe après le clic, étape par étape.
 *
 * Le numéro est en chiffres monospacés, comme dans la maquette : il doit se
 * lire comme un repère, pas comme un chiffre de réassurance.
 */
export default function Deroule({ section }: { section: SectionDeroule }) {
  if (section.etapes.length === 0) return null;

  return (
    <section className={styles.corpus} style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>Le déroulé</div>
            {section.titre ? <h2 style={TITRE2}>{section.titre}</h2> : null}
          </div>
          {section.intro ? (
            <p style={CHAPEAU}>
              <TexteRiche texte={section.intro} />
            </p>
          ) : null}
        </div>

        <div
          className="mg-rmulti"
          style={colonnes(Math.min(section.etapes.length, 3))}
        >
          {section.etapes.map((etape, rang) => (
            <div
              key={etape.titre}
              style={{ ...VERRE, padding: "26px 26px 28px" }}
            >
              <div
                style={{
                  font: "600 11px ui-monospace,Menlo,monospace",
                  color: "var(--acc)",
                  marginBottom: 14,
                }}
              >
                {String(rang + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  font: "500 15px/1.55 var(--fb)",
                  color: "var(--ink1)",
                }}
              >
                <strong style={PROSE_FORT}>
                  <TexteRiche texte={etape.titre} />
                </strong>
                {etape.texte ? (
                  <>
                    {" "}
                    <TexteRiche texte={etape.texte} />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
