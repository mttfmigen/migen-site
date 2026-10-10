import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocGuide } from "@/types/editorial";

import { Appel, LienCarte, Panneau, Question, VERRE } from "./AppelsGuide";
import styles from "./PageEditoriale.module.css";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Les blocs du gabarit générique édito de la maquette (`Migen - Site
 * final.dc.html`, `cEdito`, rendu dans `cxBlock` et `cxBento`), un composant
 * par motif. Chaque style est celui de la capture, recopié ; les survols sont
 * dans `PageEditoriale.module.css`, relevés dans les `style-hover`.
 *
 * Composant SERVEUR : les dépliants sont des `<details>`, l'exclusivité de la
 * FAQ tient par l'attribut `name`, sans JavaScript.
 */

/** Le verre des cellules de bento, à l'ombre plus courte (`cxBento`). */
const VERRE_BENTO: CSSProperties = {
  ...VERRE,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 20px 46px -32px rgba(0,0,0,.3)",
};

const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  letterSpacing: ".06em",
  color: "var(--acc)",
};
const COCHE: CSSProperties = { color: "var(--acc)", flex: "none", fontWeight: 600 };

const numero = (i: number) => String(i + 1).padStart(2, "0");

/** Les étendues du bento, règle de la maquette (`cxBento`) recopiée. */
function etendues(n: number, colonnes: number): number[] {
  const span = Array.from({ length: n }, (_, i) => (i === 0 && colonnes > 1 ? 2 : 1));
  const total = span.reduce((a, x) => a + x, 0);
  if (colonnes === 3) {
    let t = total;
    for (let j = n - 1; t % 3 && j > 0; j -= 1, t += 1) span[j] = 2;
  }
  if (colonnes === 2 && total % 2) span[n - 1] = 2;
  return span;
}

function Bloc({ bloc, groupe, ouverte }: { bloc: BlocGuide; groupe: string; ouverte: boolean }) {
  switch (bloc.type) {
    case "p":
      return (
        <p
          className={styles.riche}
          style={{
            font: "400 16px/1.8 var(--fb)",
            color: "var(--ink1)",
            margin: "0 0 16px",
            maxWidth: "70ch",
            textWrap: "pretty",
          }}
        >
          <TexteRiche texte={bloc.texte} />
        </p>
      );

    case "h3":
      return (
        <h3
          style={{
            font: "600 calc(18.5px * var(--ts))/1.3 var(--ft)",
            letterSpacing: "-.028em",
            color: "var(--ink)",
            margin: "28px 0 10px",
          }}
        >
          {bloc.texte}
        </h3>
      );

    case "ul":
    case "ul2": {
      const deux = bloc.type === "ul2";
      return (
        <div
          className={deux ? "mg-r2" : undefined}
          style={
            deux
              ? {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 28px",
                  margin: "4px 0 22px",
                  padding: "22px 26px",
                  borderRadius: "var(--rad-s)",
                  ...VERRE,
                }
              : { display: "grid", gap: 10, margin: "4px 0 22px", maxWidth: "72ch" }
          }
        >
          {bloc.items.map((item, i) => (
            <div
              key={`${i}-${item.slice(0, 16)}`}
              className={styles.riche}
              style={{
                display: "flex",
                gap: 12,
                font: deux ? "400 15px/1.6 var(--fb)" : "400 15.5px/1.65 var(--fb)",
                color: "var(--ink1)",
              }}
            >
              <span aria-hidden="true" style={COCHE}>
                ✓
              </span>
              <span>
                <TexteRiche texte={item} />
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "cartes":
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 12,
            margin: "8px 0 26px",
          }}
        >
          {bloc.items.map((item, i) => (
            <div
              key={item.titre}
              style={{ borderRadius: "var(--rad-s)", padding: "24px 24px 26px", ...VERRE }}
            >
              <div
                style={{
                  font: "600 10.5px ui-monospace,Menlo,monospace",
                  letterSpacing: ".06em",
                  color: "var(--acc)",
                  marginBottom: 12,
                }}
              >
                {numero(i)}
              </div>
              <div
                style={{
                  font: "600 calc(16px * var(--ts))/1.35 var(--ft)",
                  letterSpacing: "-.024em",
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {item.titre}
              </div>
              {item.texte ? (
                <div
                  className={styles.riche}
                  style={{ font: "400 14px/1.65 var(--fb)", color: "var(--ink2)" }}
                >
                  <TexteRiche texte={item.texte} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      );

    case "lignes":
      return (
        <div
          style={{
            margin: "8px 0 30px",
            borderRadius: "var(--rad)",
            ...VERRE,
            padding: "4px 32px",
          }}
        >
          {bloc.items.map((item, i) => (
            <div
              key={item.titre}
              className="cx-row"
              style={{
                display: "grid",
                gridTemplateColumns: "40px minmax(0,.85fr) minmax(0,1.4fr)",
                gap: 26,
                padding: "22px 0",
                borderBottom: i < bloc.items.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <span style={{ ...NUMERO, paddingTop: 4 }}>{numero(i)}</span>
              <div
                style={{
                  font: "600 calc(16.5px * var(--ts))/1.4 var(--ft)",
                  letterSpacing: "-.024em",
                  color: "var(--ink)",
                }}
              >
                {item.titre}
              </div>
              <div
                className={styles.riche}
                style={{ font: "400 14.5px/1.7 var(--fb)", color: "var(--ink2)" }}
              >
                <TexteRiche texte={item.texte} />
              </div>
            </div>
          ))}
        </div>
      );

    case "etapes":
      return (
        <div style={{ margin: "12px 0 26px", maxWidth: 820 }}>
          {bloc.items.map((item, i) => (
            <div
              key={`${i}-${item.texte.slice(0, 16)}`}
              style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr)", gap: 22 }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: "var(--acc)",
                    color: "#fff",
                    font: "600 13.5px var(--fb)",
                    flex: "none",
                    boxShadow: "0 8px 20px -10px rgba(255,124,60,.8)",
                  }}
                >
                  {numero(i)}
                </span>
                <span
                  aria-hidden="true"
                  style={
                    i < bloc.items.length - 1
                      ? { flex: 1, width: 1, background: "var(--line)", marginTop: 8 }
                      : { display: "none" }
                  }
                />
              </div>
              <div style={{ padding: "9px 0 32px" }}>
                {item.titre ? (
                  <div
                    style={{
                      font: "600 calc(17.5px * var(--ts))/1.35 var(--ft)",
                      letterSpacing: "-.026em",
                      color: "var(--ink)",
                      marginBottom: 8,
                    }}
                  >
                    {item.titre}
                  </div>
                ) : null}
                <div
                  className={styles.riche}
                  style={{ font: "400 15px/1.75 var(--fb)", color: "var(--ink2)", maxWidth: "66ch" }}
                >
                  <TexteRiche texte={item.texte} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "numeros":
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: 12,
            margin: "8px 0 26px",
          }}
        >
          {bloc.items.map((item, i) => (
            <div
              key={`${i}-${item.texte.slice(0, 16)}`}
              style={{ borderRadius: "var(--rad-s)", padding: "24px 24px 26px", ...VERRE }}
            >
              <div
                style={{
                  font: "600 calc(34px * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                  marginBottom: 16,
                }}
              >
                {numero(i)}
              </div>
              {item.titre ? (
                <div
                  style={{
                    font: "600 calc(16px * var(--ts))/1.35 var(--ft)",
                    letterSpacing: "-.024em",
                    color: "var(--ink)",
                    marginBottom: 8,
                  }}
                >
                  {item.titre}
                </div>
              ) : null}
              <div
                className={styles.riche}
                style={{ font: "400 14px/1.65 var(--fb)", color: "var(--ink2)" }}
              >
                <TexteRiche texte={item.texte} />
              </div>
            </div>
          ))}
        </div>
      );

    case "bento": {
      const span = etendues(bloc.items.length, bloc.colonnes);
      return (
        <div
          className="mg-bento2"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${bloc.colonnes},minmax(0,1fr))`,
            gap: 12,
            margin: "8px 0 26px",
          }}
        >
          {bloc.items.map((item, i) => {
            const sombre = i === 0;
            return (
              <div
                key={item.titre}
                className={styles.bento}
                style={{
                  gridColumn: `span ${span[i]}`,
                  borderRadius: "var(--rad)",
                  padding: "24px 26px",
                  minHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  ...(sombre ? { background: "#1c1b19", color: "#fff" } : { ...VERRE_BENTO, color: "var(--ink)" }),
                }}
              >
                <span style={NUMERO}>{numero(i)}</span>
                <div>
                  <div
                    style={{
                      font: `600 calc(${span[i] > 1 ? "19px" : "16px"} * var(--ts))/1.3 var(--ft)`,
                      letterSpacing: "-.025em",
                      marginBottom: 6,
                      color: sombre ? "#fff" : "var(--ink)",
                    }}
                  >
                    {item.href ? (
                      <Link href={item.href} prefetch={false} className={styles.titreBento}>
                        {item.titre} →
                      </Link>
                    ) : (
                      item.titre
                    )}
                  </div>
                  <div
                    style={{
                      font: "400 14px/1.6 var(--fb)",
                      color: sombre ? "rgba(255,255,255,.7)" : "var(--ink2)",
                    }}
                  >
                    <TexteRiche texte={item.texte} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "photo":
      return (
        <div
          style={{
            position: "relative",
            borderRadius: "var(--rad)",
            overflow: "hidden",
            aspectRatio: "16/7",
            background: "var(--ph)",
            margin: "6px 0 26px",
          }}
        >
          <Image
            src={bloc.image}
            alt={altPhoto(bloc.image)}
            fill
            sizes="(max-width: 980px) 100vw, 850px"
            style={{
              objectFit: "cover",
              /* Bande 16/7, ratio 2,29. */
              objectPosition: cadragePhoto(bloc.image, 16 / 7),
              filter: "saturate(var(--sat)) contrast(1.05)",
              opacity: "var(--ph-op)",
            }}
          />
        </div>
      );

    case "tableau":
      return (
        <div
          tabIndex={0}
          role="region"
          aria-label="Tableau, défilement horizontal possible"
          style={{ margin: "8px 0 26px", borderRadius: "var(--rad-s)", overflow: "auto", ...VERRE }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                {bloc.entetes.map((entete, i) => (
                  <th
                    key={`${i}-${entete}`}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "14px 18px",
                      font: "600 10.5px var(--fb)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: i === 1 ? "var(--acc-ink)" : "var(--ink3)",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    {entete.replace(/\*\*/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloc.lignes.map((ligne, r) => (
                <tr key={`l${r}`}>
                  {ligne.map((cellule, i) => (
                    <td
                      key={`c${i}`}
                      className={styles.riche}
                      style={{
                        padding: "14px 18px",
                        verticalAlign: "top",
                        font:
                          i === 0
                            ? "600 14px/1.45 var(--ft)"
                            : "400 14px/1.6 var(--fb)",
                        letterSpacing: i === 0 ? "-.015em" : undefined,
                        color: i === 0 ? "var(--ink)" : "var(--ink2)",
                        borderBottom: r < bloc.lignes.length - 1 ? "1px solid var(--line)" : undefined,
                      }}
                    >
                      <TexteRiche texte={cellule} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "duo":
      return (
        <div style={{ margin: "8px 0 26px", borderRadius: "var(--rad)", overflow: "hidden", ...VERRE }}>
          {bloc.lignes.map(([gauche, droite], i) => (
            <div
              key={`${i}-${gauche}`}
              className="mg-r2"
              style={{
                display: "grid",
                gridTemplateColumns: "44px minmax(0,1.05fr) minmax(0,.95fr)",
                gap: 24,
                padding: "20px 26px",
                alignItems: "start",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  font: "600 11px ui-monospace,Menlo,monospace",
                  color: "var(--acc)",
                  paddingTop: 3,
                }}
              >
                {numero(i)}
              </span>
              <div
                className={styles.duoGauche}
                style={{ font: "400 14.5px/1.62 var(--fb)", color: "var(--ink1)" }}
              >
                <TexteRiche texte={gauche} />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  padding: "12px 15px",
                  borderRadius: 14,
                  background: "var(--acc-w)",
                }}
              >
                <span aria-hidden="true" style={{ color: "var(--acc)", font: "600 14px var(--fb)", flex: "none" }}>
                  →
                </span>
                <span
                  className={styles.duoDroite}
                  style={{ font: "500 14px/1.55 var(--fb)", color: "var(--ink)" }}
                >
                  <TexteRiche texte={droite} />
                </span>
              </div>
            </div>
          ))}
        </div>
      );

    case "citation":
      return (
        <div style={{ display: "flex", gap: 16, margin: "22px 0 30px", maxWidth: "64ch" }}>
          <span aria-hidden="true" style={{ font: "600 50px/.85 var(--ft)", color: "var(--acc)", flex: "none" }}>
            “
          </span>
          <p
            className={styles.riche}
            style={{
              font: "500 calc(18.5px * var(--ts))/1.55 var(--ft)",
              letterSpacing: "-.018em",
              color: "var(--ink)",
              margin: 0,
              paddingTop: 4,
            }}
          >
            <TexteRiche texte={bloc.texte} />
          </p>
        </div>
      );

    case "appel":
      return <Appel texte={bloc.texte} />;
    case "question":
      return <Question question={bloc.question} groupe={groupe} ouverte={ouverte} />;
    case "lienCarte":
      return <LienCarte titre={bloc.titre} href={bloc.href} />;
    case "panneau":
      return <Panneau />;
    case "suite":
      return (
        <details className="cx-more" style={{ marginTop: 2 }}>
          <summary
            style={{
              listStyle: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 20px",
              borderRadius: 999,
              background: "var(--card)",
              border: "1px solid var(--line)",
              font: "600 14px var(--fb)",
              color: "var(--ink)",
              margin: "4px 0 12px",
            }}
          >
            <span className="cx-l1">Lire la suite</span>
            <span className="cx-l2">Réduire</span>
            <span aria-hidden="true" style={{ color: "var(--acc)", fontWeight: 600 }}>
              +
            </span>
          </summary>
          <div style={{ paddingTop: 10 }}>
            <BlocsGuide blocs={bloc.blocs} groupe={`${groupe}-suite`} />
          </div>
        </details>
      );
  }
}

export default function BlocsGuide({ blocs, groupe }: { blocs: BlocGuide[]; groupe: string }) {
  // La première question de la liste est ouverte, comme dans la capture.
  const premiere = blocs.findIndex((b) => b.type === "question");
  return (
    <>
      {blocs.map((bloc, i) => (
        <Bloc key={`${bloc.type}-${i}`} bloc={bloc} groupe={groupe} ouverte={i === premiere} />
      ))}
    </>
  );
}
