import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { JeuBarres, SectionDosage } from "@/types/expertises";

import { Separateur, TITRE2, VERRE_CARTE } from "./commun";

/**
 * Le bon dosage : le texte à gauche, la répartition des heures à droite.
 * Maquette, lignes 6316 à 6353.
 *
 * LES BARRES SONT ANIMÉES PAR `components/site/Moteurs.tsx`, pas ici.
 * `data-bar` porte le pourcentage cible, `data-bar-i` le rang dans l'escalier :
 * le moteur remet la largeur à zéro tant que la barre est sous la ligne de
 * flottaison, puis la lâche en décalé. La largeur finale reste posée en style en
 * ligne, pour que la page soit juste sans JavaScript et à l'impression.
 */

function Barres({ jeu }: { jeu: JeuBarres }) {
  const couleur = jeu.accent ? "var(--acc)" : "var(--ink3)";
  return (
    <>
      <div
        style={{
          font: "600 10.5px var(--fb)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: jeu.accent ? "var(--acc)" : "var(--ink3)",
          marginBottom: 14,
        }}
      >
        <TexteRiche texte={jeu.legende} />
      </div>
      {jeu.barres.map((barre, i) => (
        <div key={barre.libelle} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 7,
            }}
          >
            <span style={{ font: "500 13.5px var(--fb)", color: "var(--ink1)" }}>
              <TexteRiche texte={barre.libelle} />
            </span>
            <span
              style={{
                font: "600 13.5px var(--ft)",
                letterSpacing: "-.02em",
                color: jeu.accent ? "var(--acc)" : "var(--ink)",
              }}
            >
              {barre.valeur}&nbsp;%
            </span>
          </div>
          {/* La valeur est écrite juste au-dessus : la barre ne fait que la
              redire en image, elle n'a rien à annoncer de plus. */}
          <div
            aria-hidden="true"
            style={{
              height: 7,
              borderRadius: 999,
              background: "var(--chip)",
              overflow: "hidden",
            }}
          >
            <div
              data-bar={barre.valeur}
              data-bar-i={i}
              style={{
                height: "100%",
                width: `${barre.valeur}%`,
                background: couleur,
                borderRadius: 999,
                transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default function RepartitionHeures({ dosage }: { dosage: SectionDosage }) {
  const { repartition } = dosage;
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div>
            <div style={SURTITRE}>
              <TexteRiche texte={dosage.entete.surtitre} />
            </div>
            <h2 style={{ ...TITRE2, maxWidth: "20ch", marginBottom: 20 }}>
              <TexteRiche texte={dosage.entete.titre} />
            </h2>
            {dosage.paragraphes.map((p, i) => (
              <p
                key={p.slice(0, 32)}
                style={{
                  font: "400 16.5px/1.7 var(--fb)",
                  color: "var(--ink2)",
                  margin: i === dosage.paragraphes.length - 1 ? 0 : "0 0 16px",
                  maxWidth: "46ch",
                }}
              >
                <TexteRiche texte={p} />
              </p>
            ))}
          </div>

          {repartition ? (
            <div style={{ ...VERRE_CARTE, padding: "32px 34px 34px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 14,
                  marginBottom: 22,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ font: "600 16px var(--ft)", letterSpacing: "-.025em" }}
                >
                  <TexteRiche texte={repartition.titre} />
                </div>
                {repartition.periode ? (
                  <span
                    style={{
                      font: "600 10.5px var(--fb)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--ink4)",
                    }}
                  >
                    <TexteRiche texte={repartition.periode} />
                  </span>
                ) : null}
              </div>
              {repartition.jeux.map((jeu, i) => (
                <div key={jeu.legende}>
                  {i > 0 ? <Separateur style={{ margin: "22px 0 20px" }} /> : null}
                  <Barres jeu={jeu} />
                </div>
              ))}
              {repartition.note ? (
                <div
                  style={{
                    font: "400 11.5px/1.5 var(--fb)",
                    color: "var(--ink4)",
                    marginTop: 18,
                  }}
                >
                  <TexteRiche texte={repartition.note} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
