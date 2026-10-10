/**
 * Le métier le plus tendu d'Europe : texte et panneau de turnover.
 *
 * Maquette, lignes 5398 à 5428. Les deux barres sont en CSS, comme dans la
 * maquette : aucune bibliothèque de graphiques, et les deux valeurs restent
 * lisibles en texte si le style ne charge pas.
 */

export default function Fidelisation() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".95fr 1.05fr",
            gap: 52,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
                color: "var(--acc-ink)",
                marginBottom: 18,
              }}
            >
              Le métier le plus tendu d&rsquo;Europe
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 20px",
                maxWidth: "20ch",
                textWrap: "balance",
              }}
            >
              Nos techniciens reçoivent deux propositions par jour. Ils restent.
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 16px",
              }}
            >
              Technicien de maintenance est le métier le plus pénible
              d&rsquo;Europe et l&rsquo;un des plus pénuriques&nbsp;: près de
              100&nbsp;000 postes non pourvus en France. Qui dit pénurie dit
              sollicitation permanente, appels, messages, surenchères salariales
              avant même la fin d&rsquo;un préavis.
            </p>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
              }}
            >
              Le secteur tourne à 60&nbsp;% de turnover. Nous sommes à
              20&nbsp;%. C&rsquo;est le chiffre dont nous sommes le plus fiers,
              et celui qui explique pourquoi le technicien qui connaît votre
              installation y est encore l&rsquo;année suivante.
            </p>
          </div>
          <div
            style={{
              borderRadius: "var(--rad)",
              background: "var(--panel)",
              padding: "38px 40px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                left: -170,
                bottom: -190,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 26,
                }}
              >
                Turnover annuel
              </div>
              <div style={{ display: "grid", gap: 22 }}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        font: "500 14px var(--fb)",
                        color: "rgba(255,255,255,.6)",
                      }}
                    >
                      Le secteur
                    </span>
                    <span
                      style={{
                        font: "600 calc(28px * var(--ts)) var(--ft)",
                        letterSpacing: "-.045em",
                        color: "rgba(255,255,255,.5)",
                      }}
                    >
                      60&nbsp;%
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      height: 9,
                      borderRadius: 999,
                      background: "rgba(255,255,255,.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        background: "rgba(255,255,255,.28)",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ font: "500 14px var(--fb)", color: "#fff" }}>
                      migen©
                    </span>
                    <span
                      style={{
                        font: "600 calc(34px * var(--ts)) var(--ft)",
                        letterSpacing: "-.05em",
                        color: "var(--acc)",
                      }}
                    >
                      20&nbsp;%
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      height: 9,
                      borderRadius: 999,
                      background: "rgba(255,255,255,.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "33%",
                        background: "var(--acc)",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,.12)",
                  margin: "26px 0 20px",
                }}
              />
              <div
                style={{
                  font: "400 13.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.55)",
                }}
              >
                Trois fois moins de départs que la moyenne du secteur, sur un
                métier où la sollicitation est quotidienne.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
