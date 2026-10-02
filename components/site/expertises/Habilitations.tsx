import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { SectionHabilitations } from "@/types/expertises";

import { TITRE2, VERRE_CARTE } from "./commun";

/**
 * Les habilitations : le texte à gauche, les titres en cartes à droite.
 * Maquette, lignes 6489 à 6510. La dernière carte passe en orange (`accent`).
 */

export default function Habilitations({
  habilitations,
}: {
  habilitations: SectionHabilitations;
}) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".8fr 1.2fr",
            gap: 44,
            alignItems: "start",
          }}
        >
          <div>
            <div style={SURTITRE}>
              <TexteRiche texte={habilitations.entete.surtitre} />
            </div>
            <h2 style={{ ...TITRE2, maxWidth: "18ch", marginBottom: 18 }}>
              <TexteRiche texte={habilitations.entete.titre} />
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              <TexteRiche texte={habilitations.texte} />
            </p>
          </div>

          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 12,
            }}
          >
            {habilitations.cartes.map((carte) => (
              <div
                key={carte.titre}
                style={
                  carte.accent
                    ? {
                        borderRadius: "var(--rad-s)",
                        padding: "20px 22px",
                        background: "var(--acc-w)",
                        border: "1.5px solid rgba(255,124,60,.3)",
                      }
                    : {
                        ...VERRE_CARTE,
                        borderRadius: "var(--rad-s)",
                        padding: "20px 22px",
                      }
                }
              >
                <div
                  style={{
                    font: "600 15px var(--ft)",
                    letterSpacing: "-.02em",
                    marginBottom: 5,
                  }}
                >
                  <TexteRiche texte={carte.titre} />
                </div>
                <div
                  style={{
                    font: "400 13.5px/1.55 var(--fb)",
                    color: carte.accent ? "var(--ink1)" : "var(--ink2)",
                  }}
                >
                  <TexteRiche texte={carte.texte} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
