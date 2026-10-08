import Link from "next/link";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";

import styles from "./TestTechnicien.module.css";

/* Les deux sections qui suivent le test dans la maquette (gabarit `isTest`) :
   « Le vrai processus, en six étapes » et la bande « Rejoindre migen© ».
   Composant serveur : elles ne dépendent pas de l'état du test. */

const ETAPES = [
  ["01", "Lecture du parcours", "Habilitations, technologies pratiquées, stabilité des postes."],
  ["02", "Entretien téléphonique", "Vingt minutes : mobilité, prétentions, motivation pour le site."],
  ["03", "Entretien technique", "Mené par un technicien de terrain, sur vos domaines déclarés."],
  ["04", "Tests techniques", "Lecture de schéma, diagnostic, geste. Ce test en est un extrait."],
  ["05", "Tests comportementaux", "Autonomie, compte rendu, relation au client sur site."],
  ["06", "Rencontre du client", "Vous visitez le site, le client vous rencontre. Deux validations."],
] as const;

export default function SuiteTest() {
  return (
    <>
      <section style={{ padding: "var(--sec) 0 0" }}>
        <div style={LARGEUR}>
          <div data-reveal="">
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 18,
              }}
            >
              Après le test
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 30px",
                textWrap: "balance",
                maxWidth: "26ch",
              }}
            >
              Le vrai processus, en six étapes
            </h2>
            <div
              className="mg-rmulti"
              style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}
            >
              {ETAPES.map(([numero, titre, texte]) => (
                <div key={numero} style={{ ...VERRE, padding: "26px 28px 28px" }}>
                  <div
                    style={{
                      font: "600 11px ui-monospace,Menlo,monospace",
                      letterSpacing: ".06em",
                      color: "var(--acc)",
                      marginBottom: 14,
                    }}
                  >
                    {numero}
                  </div>
                  <div
                    style={{
                      font: "600 16.5px var(--ft)",
                      letterSpacing: "-.026em",
                      color: "var(--ink)",
                      marginBottom: 7,
                    }}
                  >
                    {titre}
                  </div>
                  <p style={{ font: "400 13.5px/1.6 var(--fb)", color: "var(--ink2)", margin: 0 }}>{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
        <div style={LARGEUR}>
          <div
            data-reveal=""
            style={{
              borderRadius: 36,
              background: "var(--panel)",
              padding: "48px 52px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                left: -170,
                bottom: -190,
                background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
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
                  marginBottom: 14,
                }}
              >
                Rejoindre migen©
              </div>
              <div
                style={{
                  font: "600 calc(clamp(22px,2.5vw,34px) * var(--ts))/1.14 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "#fff",
                  marginBottom: 10,
                  maxWidth: "24ch",
                  textWrap: "balance",
                }}
              >
                Le score ne fait pas tout. Le terrain, si.
              </div>
              {/* La phrase suivante de la maquette promet « une réponse sous 48 h
                  ouvrées » : délai chiffré, interdit. Elle ne se coupe pas, elle
                  ne se rend pas. */}
            </div>
            <Link
              href="/carriere/#postuler"
              className={styles.boutonLeve}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "16px 30px",
                borderRadius: 999,
                background: "var(--acc)",
                color: "#fff",
                font: "600 15.5px var(--fb)",
                whiteSpace: "nowrap",
                flex: "none",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Postuler chez migen©
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
