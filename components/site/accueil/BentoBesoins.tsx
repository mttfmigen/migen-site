"use client";

import { useState, type CSSProperties } from "react";
import styles from "./BentoBesoins.module.css";

export interface Besoin {
  /** Identifiant stable, sert de clé de liste et d'ancre du panneau déplié. */
  id: string;
  /** La phrase du visiteur : « J'ai besoin d'un renfort maintenance… ». */
  need: string;
  /** La réponse courte, sous la phrase. */
  answer: string;
  /** Nom de l'offre, affiché dans la pastille. */
  offer: string;
  /** Le paragraphe du panneau déplié. */
  detail: string;
  points: string[];
  /** Libellé du bouton principal du panneau déplié. */
  cta: string;
  /** Destination du bouton principal. */
  href: string;
  /**
   * Lignes du tableau du panneau déplié. Facultatives : une valeur interdite
   * de la maquette (« régie », « clé en main », délai chiffré) est retirée, et
   * sa ligne avec, plutôt que remplacée par une valeur inventée.
   */
  cadre?: string;
  delai?: string;
  duree?: string;
  /** Visuel du panneau déplié. */
  img: string;
}

interface Proprietes {
  besoins?: Besoin[];
  hrefChiffrer?: string;
}

const CELLULE: CSSProperties = {
  background: "var(--card)",
  padding: "12px 15px",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
};

const CLE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};

const VALEUR: CSSProperties = {
  font: "500 12.5px var(--fb)",
  color: "var(--ink)",
  textAlign: "right",
};

const BOUTON_NU: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
};

const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--ink4)",
};

/*
 * Les styles qui dépendent de l'ouverture, recopiés du getter `needs` de la
 * maquette (thème clair). La tuile ouverte prend toute la largeur, en tête ;
 * les six autres forment deux rangées pleines de trois.
 */
function cadreTuile(ouverte: boolean): CSSProperties {
  return {
    borderRadius: "var(--rad)",
    overflow: "hidden",
    backgroundColor: ouverte ? "var(--card)" : "rgba(255,255,255,.8)",
    border: `1px solid ${ouverte ? "var(--gbd)" : "var(--line)"}`,
    ...(ouverte && {
      order: -1,
      gridColumn: "1 / -1",
      boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
    }),
  };
}

function pastille(ouverte: boolean): CSSProperties {
  return {
    font: `600 ${ouverte ? "11px" : "10.5px"} var(--fb)`,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    padding: "5px 11px",
    borderRadius: 999,
    color: "var(--acc-ink)",
    backgroundColor: "var(--acc-w)",
    border: `1px solid ${ouverte ? "var(--acc)" : "transparent"}`,
    ...(!ouverte && { alignSelf: "flex-start", marginTop: "auto" }),
  };
}

function signe(ouverte: boolean): CSSProperties {
  return {
    font: "300 20px/1 var(--fb)",
    color: "var(--ink3)",
    flex: "none",
    width: 20,
    textAlign: "center",
    display: "inline-block",
    transition: "transform 220ms cubic-bezier(.2,.7,.2,1)",
    transform: `rotate(${ouverte ? "45deg" : "0deg"})`,
  };
}

export default function BentoBesoins({
  besoins = [],
  hrefChiffrer = "/contact/",
}: Proprietes) {
  /* La PREMIÈRE TUILE EST OUVERTE À L'ARRIVÉE, comme dans la maquette : le
     pavage tire son relief de ce grand panneau déplié au-dessus des six
     tuiles fermées. */
  const [ouvert, setOuvert] = useState<string | null>(besoins[0]?.id ?? null);

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 0" }}>
      <div data-reveal="">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 36,
            marginBottom: 26,
            flexWrap: "wrap",
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
                marginBottom: 14,
              }}
            >
              Partez de votre besoin
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,40px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              Dites la phrase qui ressemble le plus à votre situation.
            </h2>
          </div>
        </div>

        <div
          className="mg-bento"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gridAutoRows: "minmax(186px,auto)",
            gap: 14,
          }}
        >
          {besoins.map((n, i) => {
            const estOuvert = ouvert === n.id;
            const num = String(i + 1).padStart(2, "0");
            const idPanneau = `besoin-${n.id}-panneau`;
            const basculer = () => setOuvert(estOuvert ? null : n.id);
            /* `data-fill` : la règle `.mg-bento > [data-fill="1"]` étale la
               première tuile sur toute la largeur quand AUCUNE n'est ouverte,
               pour que le pavage fermé ne finisse pas sur un trou. */
            const remplit = !estOuvert && i === 0 && ouvert === null;

            return (
              <div
                key={n.id}
                data-open={estOuvert ? "1" : "0"}
                data-fill={remplit ? "1" : "0"}
                style={cadreTuile(estOuvert)}
              >
                {!estOuvert && (
                  <button
                    type="button"
                    onClick={basculer}
                    aria-expanded={false}
                    style={{
                      ...BOUTON_NU,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      padding: "26px 28px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      <span style={NUMERO}>
                        <span>{num}</span>
                      </span>
                      <span aria-hidden="true" style={signe(false)}>
                        +
                      </span>
                    </div>
                    <div
                      style={{
                        font: "600 calc(17.5px * var(--ts))/1.35 var(--ft)",
                        letterSpacing: "-.025em",
                        color: "var(--ink)",
                      }}
                    >
                      <span>{n.need}</span>
                    </div>
                    <div
                      style={{
                        font: "400 13px/1.55 var(--fb)",
                        color: "var(--ink2)",
                        marginTop: 8,
                      }}
                    >
                      <span>{n.answer}</span>
                    </div>
                    <span style={pastille(false)}>
                      <span>{n.offer}</span>
                    </span>
                  </button>
                )}

                {estOuvert && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <button
                      type="button"
                      onClick={basculer}
                      aria-expanded={true}
                      aria-controls={idPanneau}
                      style={{
                        ...BOUTON_NU,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        gap: 16,
                        alignItems: "center",
                        padding: "24px 28px 18px",
                      }}
                    >
                      <span style={{ ...NUMERO, flex: "none", width: 20 }}>
                        <span>{num}</span>
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            font: "600 calc(21px * var(--ts))/1.3 var(--ft)",
                            letterSpacing: "-.03em",
                            color: "var(--ink)",
                          }}
                        >
                          <span>{n.need}</span>
                        </div>
                        <div
                          style={{
                            font: "400 13.5px/1.5 var(--fb)",
                            color: "var(--ink2)",
                            marginTop: 5,
                          }}
                        >
                          <span>{n.answer}</span>
                        </div>
                      </div>
                      <span style={pastille(true)}>
                        <span>{n.offer}</span>
                      </span>
                      <span aria-hidden="true" style={signe(true)}>
                        +
                      </span>
                    </button>

                    <div
                      id={idPanneau}
                      className="mg-r2"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr .8fr",
                        gap: 26,
                        padding: "0 28px 26px",
                        alignItems: "start",
                        flex: "1 1 0%",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <p
                          style={{
                            font: "400 15px/1.7 var(--fb)",
                            color: "var(--ink1)",
                            margin: "0 0 16px",
                            maxWidth: "58ch",
                          }}
                        >
                          <span>{n.detail}</span>
                        </p>
                        <ul
                          style={{
                            display: "grid",
                            gap: 8,
                            margin: "0 0 20px",
                            padding: 0,
                            listStyle: "none",
                          }}
                        >
                          {n.points.map((p) => (
                            <li
                              key={p}
                              style={{
                                display: "flex",
                                gap: 11,
                                font: "400 14px/1.5 var(--fb)",
                                color: "var(--ink1)",
                              }}
                            >
                              // Contraste AA : l'orange de marque donnait 2,56:1 sur ce fond clair, --acc-ink donne 8,94:1.
                              <span aria-hidden="true" style={{ color: "var(--acc-ink)", flex: "none" }}>
                                ✓
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                          <a
                            href={n.href}
                            className={styles.ctaOffre}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "13px 22px",
                              borderRadius: 999,
                              background: "var(--acc)",
                              // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
                              // l'encre change : --ink dessus, 6,72:1.
                              color: "var(--sur-acc)",
                              font: "600 14.5px var(--fb)",
                              whiteSpace: "nowrap",
                              transition: "filter var(--tr)",
                            }}
                          >
                            <span>{n.cta}</span>
                          </a>
                          <a
                            href={hrefChiffrer}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "13px 22px",
                              borderRadius: 999,
                              background: "var(--chip)",
                              border: "1px solid var(--line)",
                              color: "var(--ink1)",
                              font: "600 14.5px var(--fb)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Chiffrer mon besoin
                          </a>
                        </div>
                      </div>

                      <div>
                        <div
                          aria-hidden="true"
                          style={{
                            height: 132,
                            borderRadius: "var(--rad-s)",
                            marginBottom: 12,
                            background: `var(--ph) url('${n.img}') center/cover no-repeat`,
                            filter: "saturate(var(--sat)) contrast(1.05)",
                            opacity: "var(--ph-op)",
                          }}
                        />
                        <div
                          style={{
                            display: "grid",
                            gap: 1,
                            background: "var(--line)",
                            border: "1px solid var(--line)",
                            borderRadius: "var(--rad-s)",
                            overflow: "hidden",
                          }}
                        >
                          {(
                            [
                              ["Cadre", n.cadre],
                              ["Délai", n.delai],
                              ["Durée", n.duree],
                            ] as const
                          ).map(
                            ([cle, valeur]) =>
                              valeur && (
                                <div key={cle} style={CELLULE}>
                                  <span style={CLE}>{cle}</span>
                                  <span style={VALEUR}>
                                    <span>{valeur}</span>
                                  </span>
                                </div>
                              ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
