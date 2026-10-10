import { ENGAGEMENTS } from "./equipe-donnees";
import { LARGEUR, SECTION, SURTITRE, TEXTE_CARTE, TITRE2, VERRE } from "./habillage-equipe";

/** « Nos engagements », trois cartes numérotées. Maquette lignes 5954 à 5955. */
export default function EngagementsEquipe() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={SURTITRE}>Nos engagements</div>
          <h2 style={{ ...TITRE2, maxWidth: "26ch" }}>
            Des engagements tenus, vérifiables mission après mission.
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
                      // Contraste AA : l'orange de marque donnait 2,45:1 sur ce fond clair, --acc-ink donne 8,57:1.
                      color: "var(--acc-ink)",
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
  );
}
