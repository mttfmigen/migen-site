import Link from "next/link";

import { AGENCES, HUBS } from "./equipe-donnees";
import { CHAPEAU, LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage-equipe";

/**
 * « Nos implantations » : quatre agences et dix hubs. Maquette lignes 5946
 * à 5953.
 *
 * Le lien « Nos implantations en détail » visait `goImplant`, la navigation
 * interne de l'éditeur. Il pointe ici sur `/implantations/`, vérifiée à 200.
 */
export default function ImplantationsEquipe() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <div style={SURTITRE}>Nos implantations</div>
              <h2 style={TITRE2}>Quatre agences, dix hubs de techniciens.</h2>
              <p style={CHAPEAU}>
                Quatre agences portent le réseau, des hubs de techniciens dans
                les grandes villes rapprochent les équipes des usines.
              </p>
              <Link
                href="/implantations/"
                style={{
                  display: "inline-flex",
                  marginTop: 22,
                  font: "600 15px var(--fb)",
                  // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
                  color: "var(--acc-ink)",
                }}
              >
                Nos implantations en détail →
              </Link>
            </div>
            <div style={{ ...VERRE, padding: "26px 28px" }}>
              <ul
                className="mg-rmulti"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: 10,
                  marginBottom: 22,
                  marginTop: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {AGENCES.map((agence) => (
                  <li
                    key={agence.ville}
                    style={{
                      borderRadius: "var(--rad-s)",
                      background: agence.siege ? "var(--acc-w)" : "var(--card)",
                      border: agence.siege
                        ? "1px solid rgba(255,124,60,.3)"
                        : "1px solid var(--line)",
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        font: "600 17px var(--ft)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {agence.ville}
                    </div>
                    <div
                      style={{
                        font: "400 13px var(--fb)",
                        color: "var(--ink3)",
                        marginTop: 3,
                      }}
                    >
                      {agence.precision}
                    </div>
                  </li>
                ))}
              </ul>
              <h3
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  margin: "0 0 10px",
                }}
              >
                Hubs de techniciens en France
              </h3>
              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {HUBS.map((hub) => (
                  <li
                    key={hub}
                    style={{
                      font: "500 12.5px var(--fb)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "var(--chip)",
                      color: "var(--ink1)",
                    }}
                  >
                    {hub}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
