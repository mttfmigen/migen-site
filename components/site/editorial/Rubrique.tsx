import Link from "next/link";
import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocRayon, VueRubrique } from "@/types/editorial";

import styles from "./PageEditoriale.module.css";
import RayonsRubrique from "./RayonsRubrique";

/**
 * La vue « RUBRIQUE » : `MigenRessource.dc.html` en mode hub, les cinq
 * sous-rubriques de `/ressources/`. Références : `maquette/rendu/
 * ressources--<rayon>.html`. Sections, dans l'ordre de la capture : héros,
 * rayons, guide, questions fréquentes (sur photo), appel.
 *
 * La page n'a ni fil d'Ariane du cocon, ni formulaire de bas de page, ni
 * maillage : la capture n'en montre aucun, l'appel final mène à `/contact/`.
 */

const TEXTE_GUIDE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 12px",
};
const LIGNE_LISTE: CSSProperties = {
  display: "flex",
  gap: 10,
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

function Bloc({ bloc }: { bloc: BlocRayon }) {
  switch (bloc.type) {
    case "p":
      return (
        <p style={TEXTE_GUIDE}>
          <TexteRiche texte={bloc.texte} />
        </p>
      );
    case "ul":
    case "ol":
      return (
        <div className={styles.liste} style={{ display: "grid", gap: 8, margin: "4px 0 12px" }}>
          {bloc.items.map((item, i) => (
            <div key={`${i}-${item.slice(0, 16)}`} style={LIGNE_LISTE}>
              <span
                aria-hidden={bloc.type === "ul" ? true : undefined}
                style={
                  bloc.type === "ul"
                    ? { color: "var(--acc)", flex: "none" }
                    : {
                        font: "600 11px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                        flex: "none",
                        paddingTop: 3,
                      }
                }
              >
                {bloc.type === "ul" ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <TexteRiche texte={item} />
              </span>
            </div>
          ))}
        </div>
      );
    case "tableau":
      return (
        <div style={{ overflowX: "auto", margin: "6px 0 12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {bloc.lignes.map((ligne, r) => (
                <tr key={`l${r}`}>
                  {ligne.map((cellule, i) => (
                    <td
                      key={`c${i}`}
                      style={{
                        padding: "9px 8px",
                        borderTop: "1px solid var(--line)",
                        font: "400 13.5px/1.5 var(--fb)",
                        color: "var(--ink1)",
                        verticalAlign: "top",
                      }}
                    >
                      {cellule}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "citation":
      return (
        <div
          style={{
            margin: "6px 0 12px",
            padding: "14px 16px",
            borderRadius: 14,
            background: "var(--acc-w)",
            font: "500 14px/1.6 var(--fb)",
            color: "var(--ink)",
          }}
        >
          <TexteRiche texte={bloc.texte} />
        </div>
      );
  }
}

const BOUTON_FIN: CSSProperties = {
  padding: "16px 30px",
  borderRadius: 999,
  color: "#fff",
  font: "600 16px var(--fb)",
};

export default function Rubrique({ titre, vue }: { titre: string; vue: VueRubrique }) {
  return (
    <div className="mg-site">
      <main style={{ paddingTop: 62 }}>
        <RayonsRubrique titre={titre} vue={vue} />

        {vue.guide.length > 0 ? (
          <section
            data-screen-label="Ressources · guide"
            style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 0" }}
          >
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}
            >
              {vue.guide.map((carte, i) => (
                <div
                  key={carte.titre}
                  className={styles.carteGuide}
                  style={{
                    borderRadius: "var(--rad)",
                    background: "#fff",
                    border: "1px solid var(--line)",
                    padding: "28px 28px 24px",
                  }}
                >
                  <div
                    style={{
                      font: "600 11px ui-monospace,Menlo,monospace",
                      color: "var(--acc)",
                      marginBottom: 12,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 style={{ font: "600 22px/1.25 var(--ft)", letterSpacing: "-.03em", margin: "0 0 14px" }}>
                    {carte.titre}
                  </h2>
                  {carte.blocs.map((bloc, k) => (
                    <Bloc key={`${bloc.type}-${k}`} bloc={bloc} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {vue.questions.length > 0 ? (
          <section
            data-screen-label="Questions fréquentes"
            style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 0" }}
          >
            <div className={styles.faqPhoto} style={{ maxWidth: "none", margin: "0 auto" }}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 14,
                }}
              >
                Questions fréquentes
              </div>
              <h2
                style={{
                  font: "600 clamp(26px,2.8vw,38px)/1.1 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: "0 0 24px",
                }}
              >
                Vos questions, nos réponses
              </h2>
              <div
                style={{
                  borderRadius: "var(--rad)",
                  overflow: "hidden",
                  background: "rgba(255,255,255,.1)",
                  backdropFilter: "blur(22px) saturate(150%)",
                  WebkitBackdropFilter: "blur(22px) saturate(150%)",
                  border: "1px solid rgba(255,255,255,.18)",
                }}
              >
                {vue.questions.map((f, i) => (
                  <details
                    key={f.question}
                    name="faq-rubrique"
                    open={i === 0}
                    style={{ borderTop: i ? "1px solid var(--line)" : "none" }}
                  >
                    <summary
                      style={{
                        listStyle: "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "20px 24px",
                        font: "600 16px/1.4 var(--ft)",
                        letterSpacing: "-.015em",
                      }}
                    >
                      {f.question}
                      <span
                        aria-hidden="true"
                        className={styles.plus}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          background: "rgba(28,27,25,.055)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "none",
                          font: "400 18px/1 var(--fb)",
                          transition: "transform .2s,background .2s",
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
                        maxWidth: "72ch",
                      }}
                    >
                      {f.reponse}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="mr-cta" data-screen-label="Ressources · appel" style={{ padding: "96px 24px 120px" }}>
          <div
            className={styles.grille2}
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              borderRadius: 40,
              background: "var(--panel)",
              padding: 56,
              position: "relative",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 560,
                height: 560,
                left: -200,
                top: -280,
                background: "radial-gradient(circle,rgba(255,124,60,.28),transparent 66%)",
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
                  marginBottom: 16,
                }}
              >
                Passer de la lecture à l’action
              </div>
              <div
                style={{
                  font: "600 clamp(26px,3vw,40px)/1.1 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "#fff",
                  marginBottom: 14,
                  maxWidth: "22ch",
                }}
              >
                Un technicien qualifié sur votre site, au bon moment.
              </div>
              <div style={{ font: "400 15.5px/1.6 var(--fb)", color: "rgba(255,255,255,.64)", maxWidth: "48ch" }}>
                Décrivez votre besoin : un chargé d’affaires vous rappelle dans l’heure, du lundi au vendredi de
                8h00 à 18h30.
              </div>
            </div>
            <div style={{ position: "relative", display: "grid", gap: 10, justifyItems: "start" }}>
              <Link href="/contact/" prefetch={false} style={{ ...BOUTON_FIN, background: "var(--acc)" }}>
                Décrire mon besoin
              </Link>
              <a
                href="tel:+33478337205"
                style={{
                  ...BOUTON_FIN,
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
              >
                04 78 33 72 05
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
