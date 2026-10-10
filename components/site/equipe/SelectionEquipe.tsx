import { ETAPES_SELECTION } from "./equipe-donnees";
import {
  LARGEUR,
  SECTION,
  SURTITRE,
  TEXTE_CARTE,
  TITRE_CARTE,
  VERRE,
} from "./habillage-equipe";

/**
 * « Comment ces personnes sont choisies » : le panneau sombre avec le taux de
 * passage, et les trois étapes à droite. Maquette lignes 5939 à 5945.
 */
export default function SelectionEquipe() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
              gap: 44,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                borderRadius: "var(--rad)",
                background: "var(--panel)",
                padding: 34,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 26,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 380,
                  height: 380,
                  right: -160,
                  bottom: -200,
                  background:
                    "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div style={SURTITRE}>Comment ces personnes sont choisies</div>
                <h2
                  style={{
                    font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
                    letterSpacing: "-.04em",
                    color: "#fff",
                    margin: "0 0 14px",
                    maxWidth: "18ch",
                  }}
                >
                  La qualité se décide au recrutement.
                </h2>
                <p
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "rgba(255,255,255,.64)",
                    margin: 0,
                  }}
                >
                  Bien avant l&rsquo;arrivée sur votre site. Notre sélection
                  tient en trois étapes, et en un chiffre.
                </p>
              </div>
              <p
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  margin: 0,
                }}
              >
                <span
                  style={{
                    font: "600 64px/1 var(--ft)",
                    letterSpacing: "-.06em",
                    color: "var(--acc)",
                  }}
                >
                  10&nbsp;%
                </span>
                <span
                  style={{
                    font: "400 14.5px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.7)",
                  }}
                >
                  des techniciens sont retenus
                </span>
              </p>
            </div>
            <ol
              style={{
                display: "grid",
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {ETAPES_SELECTION.map((etape) => (
                <li
                  key={etape.rang}
                  style={{
                    ...VERRE,
                    padding: "22px 26px",
                    display: "grid",
                    gridTemplateColumns: "44px minmax(0,1fr)",
                    gap: 18,
                    alignItems: "start",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "var(--acc-w)",
                      // Contraste AA : l'orange de marque donnait 2,22:1 sur ce fond clair, --acc-ink donne 7,76:1.
                      color: "var(--acc-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      font: "600 13px ui-monospace,Menlo,monospace",
                    }}
                  >
                    {etape.rang}
                  </span>
                  <div>
                    <div style={{ ...TITRE_CARTE, marginBottom: 6 }}>
                      {etape.titre}
                    </div>
                    <div style={TEXTE_CARTE}>{etape.texte}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
