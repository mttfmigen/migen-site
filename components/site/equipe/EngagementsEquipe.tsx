import { resumeDe } from "@/components/site/blocs/resume-de-section";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

import { ENGAGEMENTS } from "./equipe-donnees";
import { LARGEUR, SECTION, SURTITRE, TEXTE_CARTE, TITRE2, VERRE } from "./habillage-equipe";

/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Nos engagements";
const TITRE_TEXTE = "Des engagements tenus, vérifiables mission après mission.";

/** « Nos engagements », trois cartes numérotées. Maquette lignes 5954 à 5955. */
export default function EngagementsEquipe() {
  return (
    <SectionRepliee
      kicker={SURTITRE_TEXTE}
      titre={TITRE_TEXTE}
      resume={resumeDe(ENGAGEMENTS.map((e) => e.titre))}
    >
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div data-titre-bureau="" style={SURTITRE}>
            {SURTITRE_TEXTE}
          </div>
          <h2 data-titre-bureau="" style={{ ...TITRE2, maxWidth: "26ch" }}>
            {TITRE_TEXTE}
          </h2>
          <ol
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 12,
              marginTop: 10,
              marginBottom: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {ENGAGEMENTS.map((engagement) => (
              <li
                key={engagement.rang}
                style={{ ...VERRE, padding: "26px 26px 28px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      font: "600 11px ui-monospace,Menlo,monospace",
                      color: "var(--acc)",
                    }}
                  >
                    {engagement.rang}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{ flex: 1, height: 1, background: "var(--line)" }}
                  />
                </div>
                <h3
                  style={{
                    font: "600 18px/1.3 var(--ft)",
                    letterSpacing: "-.022em",
                    margin: "0 0 8px",
                  }}
                >
                  {engagement.titre}
                </h3>
                <div style={TEXTE_CARTE}>{engagement.texte}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
