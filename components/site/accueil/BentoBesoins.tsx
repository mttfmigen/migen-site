"use client";

import { useState, type CSSProperties } from "react";
import styles from "./BentoBesoins.module.css";

export interface Besoin {
  /** Identifiant stable, sert de clé de liste et d'ancre du panneau déplié. */
  id: string;
  /** Numéro affiché en monospace : « 01 ». */
  num: string;
  /** La phrase du visiteur : « Je n'arrive pas à tenir mon poste de nuit ». */
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
  cadre: string;
  /**
   * Jamais de délai chiffré d'intervention : voir le contrat de portage. Le
   * champ est donc facultatif, et la ligne « Délai » disparaît quand la
   * maquette n'offre aucune valeur portable. Mieux vaut pas de ligne qu'une
   * ligne inventée.
   */
  delai?: string;
  duree: string;
  /** Styles portés par les données, recopiés tels quels. */
  wrapCss: CSSProperties;
  signCss: CSSProperties;
  tagCss: CSSProperties;
  imgCss: CSSProperties;
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

export default function BentoBesoins({
  besoins = [],
  hrefChiffrer = "/contact/",
}: Proprietes) {
  /*
   * La PREMIÈRE TUILE EST OUVERTE À L'ARRIVÉE, comme dans la maquette.
   *
   * Ce n'est pas un détail : le pavage tire tout son relief de ce grand panneau
   * déplié au milieu de six tuiles fermées. Arrivé plat, avec sept cartes
   * identiques, il perd sa raison d'être. C'est très exactement ce que le
   * client a appelé « trop grossier ».
   */
  const [ouvert, setOuvert] = useState<string | null>(besoins[0]?.id ?? null);

  /*
   * `data-fill` est POSITIONNEL, pas lié à l'ouverture.
   *
   * Dans la maquette, il marque la dernière tuile FERMÉE, que la règle
   * `.mg-bento > [data-fill="1"] { grid-column: 1 / -1 }` étale alors sur toute
   * la largeur pour fermer proprement la dernière rangée. Le lier à l'ouverture
   * laissait la grille se terminer sur deux trous au repos, et faisait se
   * disputer deux règles sur la même tuile quand une s'ouvrait.
   */
  const idRemplissage =
    [...besoins].reverse().find((b) => b.id !== ouvert)?.id ?? null;

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
                color: "var(--acc)",
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
          className={`mg-bento ${styles.grille}`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gridAutoRows: "minmax(186px,auto)",
            gap: 14,
          }}
        >
          {besoins.map((n) => {
            const estOuvert = ouvert === n.id;
            const idPanneau = `besoin-${n.id}-panneau`;
            const basculer = () => setOuvert(estOuvert ? null : n.id);

            return (
              <div
                key={n.id}
                /* data-open et data-fill portent la mise en page du bento,
                   les règles .mg-bento de globals.css les ciblent. */
                data-open={estOuvert ? "1" : "0"}
                data-fill={n.id === idRemplissage ? "1" : "0"}
                style={n.wrapCss}
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
                      <span
                        style={{
                          font: "600 11px ui-monospace,Menlo,monospace",
                          color: "var(--ink4)",
                        }}
                      >
                        {n.num}
                      </span>
                      <span
                        aria-hidden="true"
                        className={styles.signe}
                        style={n.signCss}
                      >
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
                      {n.need}
                    </div>
                    <div
                      style={{
                        font: "400 13px/1.55 var(--fb)",
                        color: "var(--ink2)",
                        marginTop: 8,
                      }}
                    >
                      {n.answer}
                    </div>
                    <span style={n.tagCss}>{n.offer}</span>
                  </button>
                )}

                {estOuvert && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
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
                      <span
                        style={{
                          font: "600 11px ui-monospace,Menlo,monospace",
                          color: "var(--ink4)",
                          flex: "none",
                          width: 20,
                        }}
                      >
                        {n.num}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            font: "600 calc(21px * var(--ts))/1.3 var(--ft)",
                            letterSpacing: "-.03em",
                            color: "var(--ink)",
                          }}
                        >
                          {n.need}
                        </div>
                        <div
                          style={{
                            font: "400 13.5px/1.5 var(--fb)",
                            color: "var(--ink2)",
                            marginTop: 5,
                          }}
                        >
                          {n.answer}
                        </div>
                      </div>
                      <span style={n.tagCss}>{n.offer}</span>
                      <span
                        aria-hidden="true"
                        className={styles.signe}
                        style={n.signCss}
                      >
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
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <p
                          style={{
                            font: "400 15px/1.7 var(--fb)",
                            color: "var(--ink1)",
                            margin: "0 0 16px",
                            maxWidth: "58ch",
                          }}
                        >
                          {n.detail}
                        </p>
                        <ul
                          style={{
                            display: "grid",
                            gap: 8,
                            marginBottom: 20,
                            marginTop: 0,
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
                              <span
                                aria-hidden="true"
                                style={{ color: "var(--acc)", flex: "none" }}
                              >
                                ✓
                              </span>
                              {p}
                            </li>
                          ))}
                        </ul>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            marginTop: "auto",
                          }}
                        >
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
                              color: "#fff",
                              font: "600 14.5px var(--fb)",
                              whiteSpace: "nowrap",
                              transition: "filter var(--tr)",
                            }}
                          >
                            {n.cta}
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
                        <div aria-hidden="true" style={n.imgCss} />
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
                          <div style={CELLULE}>
                            <span style={CLE}>Cadre</span>
                            <span style={VALEUR}>{n.cadre}</span>
                          </div>
                          {n.delai && (
                            <div style={CELLULE}>
                              <span style={CLE}>Délai</span>
                              <span style={VALEUR}>{n.delai}</span>
                            </div>
                          )}
                          <div style={CELLULE}>
                            <span style={CLE}>Durée</span>
                            <span style={VALEUR}>{n.duree}</span>
                          </div>
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
