import { CHIFFRES } from "./equipe-donnees";
import { CHAPEAU, LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage-equipe";

/**
 * « Qui nous sommes » : le texte à gauche, trois chiffres à droite.
 * Maquette lignes 5932 à 5935.
 */
export default function QuiNousSommes() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <div style={SURTITRE}>Qui nous sommes</div>
              <h2 style={TITRE2}>
                Une entreprise créée pour garder vos machines en marche.
              </h2>
              <p style={CHAPEAU}>
                Une entreprise de maintenance industrielle, présente partout en
                France.
              </p>
            </div>
            <ul
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {CHIFFRES.map((chiffre) => (
                <li
                  key={chiffre.libelle}
                  style={{
                    ...(chiffre.sombre
                      ? {
                          background: "var(--panel)",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "var(--rad)",
                        }
                      : VERRE),
                    padding: "26px 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {chiffre.sombre ? (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: 260,
                        height: 260,
                        right: -110,
                        top: -120,
                        background:
                          "radial-gradient(circle,rgba(255,124,60,.32),transparent 68%)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: "relative",
                      font: "600 40px/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: chiffre.sombre ? "var(--acc)" : "var(--ink)",
                    }}
                  >
                    {chiffre.valeur}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      font: "600 15px var(--ft)",
                      letterSpacing: "-.02em",
                      color: chiffre.sombre ? "#fff" : "var(--ink)",
                    }}
                  >
                    {chiffre.libelle}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      font: "400 13.5px/1.55 var(--fb)",
                      color: chiffre.sombre
                        ? "rgba(255,255,255,.64)"
                        : "var(--ink2)",
                    }}
                  >
                    {chiffre.texte}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
