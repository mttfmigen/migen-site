import styles from "./Equipe.module.css";
import { QUESTIONS } from "./equipe-donnees";
import { CHAPEAU, LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage-equipe";

/**
 * « Questions fréquentes ». Maquette lignes 5956 à 5959.
 *
 * `<details>/<summary>` plutôt qu'un dépliant piloté : aucun JavaScript, le
 * clavier fonctionne, et la réponse part dans le HTML que Google reçoit. La
 * classe `g3-plus` est celle que `app/globals.css` attend déjà pour la rotation
 * de la croix à l'ouverture.
 */
export default function QuestionsEquipe() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,.75fr) minmax(0,1.25fr)",
              gap: 48,
              alignItems: "start",
            }}
          >
            <div>
              <div style={SURTITRE}>Questions fréquentes</div>
              <h2 style={TITRE2}>
                Comment l&rsquo;équipe s&rsquo;organise autour du technicien.
              </h2>
              <p style={CHAPEAU}>
                Vous ne voyez jamais un technicien seul face à un imprévu qui
                dépasse son métier.
              </p>
            </div>
            <div style={{ ...VERRE, overflow: "hidden" }}>
              {QUESTIONS.map((item, rang) => (
                <details
                  key={item.question}
                  open={rang === 0}
                  style={{
                    borderTop: rang === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <summary
                    className={styles.questionEquipe}
                    style={{
                      listStyle: "none",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      padding: "20px 24px",
                      font: "600 16px/1.4 var(--ft)",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="g3-plus"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        background: "var(--chip)",
                        color: "var(--ink1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                        font: "400 19px/1 var(--fb)",
                        transition: "transform var(--tr),background var(--tr)",
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    style={{
                      font: "400 15px/1.7 var(--fb)",
                      color: "var(--ink2)",
                      margin: 0,
                      padding: "0 24px 20px",
                      maxWidth: "70ch",
                    }}
                  >
                    {item.reponse}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
