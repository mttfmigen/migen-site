import type { SectionProbleme } from "@/types/contenu";
import { LARGEUR, LUEUR, PANNEAU, SECTION, SURTITRE, TITRE2_CLAIR } from "./habillage";

/**
 * Section 3 du gabarit : la douleur nommée, puis le coût de l'inaction.
 *
 * Traitée sur le panneau anthracite de la maquette, et pas en cartes de verre
 * comme ses voisines : le gabarit demande d'alterner les traitements pour
 * qu'une page ne soit pas une pile de sections identiques, et c'est la section
 * qui doit peser le plus.
 */
export default function Probleme({ section }: { section: SectionProbleme }) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...PANNEAU, padding: "44px 48px 46px" }}>
          <div style={LUEUR} />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE}>Le problème</div>
            <h2 style={{ ...TITRE2_CLAIR, maxWidth: "28ch" }}>
              {section.punchline}
            </h2>

            {section.puces.length > 0 ? (
              <div style={{ display: "grid", gap: 10, marginTop: 30 }}>
                {section.puces.map((puce) => (
                  <div
                    key={puce.texte}
                    style={{
                      display: "flex",
                      gap: 10,
                      font: "400 14.5px/1.5 var(--fb)",
                      color: "rgba(255,255,255,.72)",
                    }}
                  >
                    <span style={{ color: "var(--acc)", flex: "none" }}>×</span>
                    <span>
                      {puce.accroche ? (
                        <strong style={{ fontWeight: 600, color: "#fff" }}>
                          {puce.accroche}{" "}
                        </strong>
                      ) : null}
                      {puce.texte}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
