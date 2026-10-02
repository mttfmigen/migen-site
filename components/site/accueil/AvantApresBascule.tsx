"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "./AvantApresBascule.module.css";

/**
 * Une tuile de la mosaïque. La maquette pose trois `sc-if` exclusifs sur le
 * même objet (`t.isStat`, `t.isPhoto`, `t.isQuote`) : l'union discriminée rend
 * cette exclusivité vérifiable par le compilateur.
 *
 * Les propriétés `style*` portent la CSS calculée par les données de la
 * maquette (`t.wrapCss`, `t.numCss`...). Elles ne sont pas figées ici : le
 * rendu « avant » et le rendu « avec » n'ont pas la même peau.
 */
export type TuileBascule =
  | {
      forme: "chiffre";
      cle: string;
      chiffre: string;
      corps: string;
      source: string;
      styleCadre?: CSSProperties;
      styleChiffre?: CSSProperties;
      styleCorps?: CSSProperties;
      styleSource?: CSSProperties;
    }
  | {
      forme: "photo";
      cle: string;
      citation: string;
      qui: string;
      styleCadre?: CSSProperties;
      /** Porte l'image de fond de la tuile : elle vient des données. */
      styleImage?: CSSProperties;
    }
  | {
      forme: "citation";
      cle: string;
      citation: string;
      qui: string;
      role: string;
      initiales: string;
      styleCadre?: CSSProperties;
      styleCitation?: CSSProperties;
      styleAvatar?: CSSProperties;
      styleNom?: CSSProperties;
      styleRole?: CSSProperties;
    };

export interface VueBascule {
  titre: string;
  chapo: string;
  tuiles: readonly TuileBascule[];
  styleCadre?: CSSProperties;
  styleHalo?: CSSProperties;
  styleTitre?: CSSProperties;
  styleChapo?: CSSProperties;
}

interface Proprietes {
  avant?: VueBascule;
  avec?: VueBascule;
}

const VUE_VIDE: VueBascule = { titre: "", chapo: "", tuiles: [] };

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};

/* Invariants de structure, déduits du contenu des tuiles et non d'un choix de
   mise en forme : la tuile photo empile des calques en `position:absolute;
   inset:0`, ce qui exige un parent positionné et un débordement masqué pour
   que l'arrondi coupe l'image. Les styles venus des données passent après et
   gardent donc le dernier mot. */
const CADRE_CANEVAS: CSSProperties = { position: "relative", overflow: "hidden" };
const CADRE_TUILE: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--rad)",
};
const CALQUE_PLEIN: CSSProperties = { position: "absolute", inset: 0 };

/* Fondu en deux temps de `switchBA` (maquette, l. 8674-8681) : les tuiles se
   retirent, les données sont échangées à mi-parcours, puis elles reviennent en
   cascade. Sans ce temps mort la bascule saute d'une mosaïque à l'autre. */
const DUREE_RETRAIT_MS = 190;
/** Retard par rang : serré au retrait, ample au retour (`baTiles`, l. 8723). */
const RETARD_RETRAIT_MS = 22;
const RETARD_RETOUR_MS = 40;

/** Position d'une tuile selon la phase du fondu (`baTiles`, l. 8720-8722). */
function phaseTuile(retire: boolean, rang: number): CSSProperties {
  return {
    opacity: retire ? 0 : 1,
    transform: retire ? "translateY(14px) scale(.985)" : "translateY(0) scale(1)",
    transitionDelay: `${rang * (retire ? RETARD_RETRAIT_MS : RETARD_RETOUR_MS)}ms`,
  };
}

/** «&nbsp;texte&nbsp;» : l'espace insécable de la maquette, conservé. */
function entreGuillemets(texte: string): string {
  return `« ${texte} »`;
}

export default function AvantApresBascule({
  avant = VUE_VIDE,
  avec = VUE_VIDE,
}: Proprietes) {
  const [mode, setMode] = useState<"avant" | "avec">("avant");
  const [retire, setRetire] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout>>(undefined);
  const vue = mode === "avant" ? avant : avec;

  useEffect(() => () => clearTimeout(minuterie.current), []);

  function basculer(cible: "avant" | "avec") {
    if (cible === mode) return;
    clearTimeout(minuterie.current);
    setRetire(true);
    minuterie.current = setTimeout(() => {
      setMode(cible);
      setRetire(false);
    }, DUREE_RETRAIT_MS);
  }

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          style={{ ...CADRE_CANEVAS, ...vue.styleCadre }}
        >
          <div style={vue.styleHalo} />
          <div style={{ position: "relative" }}>
            <div
              className="mg-r2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 56,
                alignItems: "end",
                marginBottom: 30,
              }}
            >
              <div>
                <div style={SURTITRE}>Le jour et la nuit</div>
                <h2 style={{ margin: 0, ...vue.styleTitre }}>{vue.titre}</h2>
              </div>
              <p style={{ margin: 0, ...vue.styleChapo }}>{vue.chapo}</p>
            </div>

            <div
              className={styles.onglets}
              data-vue={mode}
              role="group"
              aria-label="Comparer avant et avec migen"
            >
              <button
                type="button"
                className={styles.onglet}
                aria-pressed={mode === "avant"}
                onClick={() => basculer("avant")}
              >
                Avant migen&copy;
              </button>
              <button
                type="button"
                className={styles.onglet}
                aria-pressed={mode === "avec"}
                onClick={() => basculer("avec")}
              >
                Avec migen&copy;
              </button>
            </div>

            <div
              className="mg-ba"
              style={{
                display: "grid",
                gridTemplateColumns: ".92fr 1.28fr 1fr",
                gridAutoRows: "minmax(290px,auto)",
                gap: 14,
              }}
            >
              {/* La clé est le RANG, pas `tuile.cle` : la maquette réutilise
                  les six emplacements de sa grille, et c'est cette réutilisation
                  qui laisse la transition repartir de l'état retiré. Une clé par
                  contenu remplacerait les noeuds et la cascade ne jouerait pas. */}
              {vue.tuiles.map((tuile, rang) => (
                <div
                  key={rang}
                  className={styles.carte}
                  style={{ ...CADRE_TUILE, ...tuile.styleCadre, ...phaseTuile(retire, rang) }}
                >
                  {tuile.forme === "chiffre" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        height: "100%",
                        padding: "30px 32px 32px",
                      }}
                    >
                      <div style={tuile.styleChiffre}>{tuile.chiffre}</div>
                      <p style={{ margin: 0, ...tuile.styleCorps }}>{tuile.corps}</p>
                      <div style={tuile.styleSource}>{tuile.source}</div>
                    </div>
                  )}

                  {tuile.forme === "photo" && (
                    <>
                      <div style={{ ...CALQUE_PLEIN, ...tuile.styleImage }} />
                      <div
                        style={{
                          ...CALQUE_PLEIN,
                          background:
                            "linear-gradient(to top,rgba(10,9,8,.9) 0%,rgba(10,9,8,.28) 52%,rgba(10,9,8,.12) 100%)",
                        }}
                      />
                      <div
                        style={{
                          ...CALQUE_PLEIN,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          padding: "28px 30px 30px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: 16,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                font: "600 calc(16.5px * var(--ts))/1.45 var(--ft)",
                                letterSpacing: "-.02em",
                                color: "#fff",
                                margin: "0 0 8px",
                                maxWidth: "34ch",
                              }}
                            >
                              {entreGuillemets(tuile.citation)}
                            </p>
                            <div
                              style={{
                                font: "400 12.5px/1.45 var(--fb)",
                                color: "rgba(255,255,255,.68)",
                              }}
                            >
                              {tuile.qui}
                            </div>
                          </div>
                          <span
                            aria-hidden="true"
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 999,
                              backgroundColor: "#ff7c3c",
                              color: "#fff",
                              font: "400 16px var(--fb)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flex: "none",
                            }}
                          >
                            &rarr;
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {tuile.forme === "citation" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        padding: "30px 32px 32px",
                      }}
                    >
                      <p style={{ margin: 0, ...tuile.styleCitation }}>
                        {entreGuillemets(tuile.citation)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: "auto",
                        }}
                      >
                        <div aria-hidden="true" style={tuile.styleAvatar}>
                          {tuile.initiales}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={tuile.styleNom}>{tuile.qui}</div>
                          <div style={tuile.styleRole}>{tuile.role}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
