"use client";

import { useState, type CSSProperties } from "react";

import styles from "./MethodeQuatreEtapes.module.css";

export interface EtapeMethode {
  cle: string;
  /** Numéro affiché, deux chiffres dans la maquette : « 01 ». */
  numero: string;
  titre: string;
  /**
   * Repère de temps de l'étape, affiché sous le titre. Facultatif : la
   * maquette chiffre ceux des étapes 01 et 02 (« 2 à 5 jours », « 1 à 2
   * semaines »), délais interdits, retirés et non remplacés.
   */
  quand?: string;
  corps: string;
  /** Ce que le client fait à cette étape (« De votre côté »). */
  votreCote: string;
  /** Ce que l'étape produit (« Ce qui en sort »). */
  resultat: string;
}

interface Proprietes {
  etapes?: readonly EtapeMethode[];
  /** Cible du lien de bas de section. Par défaut, le formulaire de la page. */
  lienQualification?: string;
}

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};

const VERRE: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
  padding: "36px 38px 38px",
};

const INTITULE_ENCART: CSSProperties = {
  font: "600 9.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export default function MethodeQuatreEtapes({
  etapes = [],
  lienQualification = "#formulaire",
}: Proprietes) {
  const [choisie, setChoisie] = useState(0);
  const active = etapes[choisie];

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 34,
            }}
          >
            <div>
              <div style={SURTITRE}>Notre méthode</div>
              <h2
                style={{
                  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: 0,
                  maxWidth: "22ch",
                  textWrap: "balance",
                }}
              >
                Quatre étapes, et vous gardez la main partout.
              </h2>
            </div>
            <p
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "44ch",
              }}
            >
              Le point commun des six offres. Cliquez une étape pour voir qui fait
              quoi.
            </p>
          </div>

          <div
            className="mg-steps"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: 0,
              position: "relative",
              marginBottom: 20,
            }}
          >
            {/* Le fil qui relie les étapes. Premier enfant : globals.css le
                masque sous 760px, où les étapes passent sur deux colonnes. */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 11,
                height: 1,
                background: "var(--line)",
              }}
            />
            {etapes.map((etape, rang) => (
              <button
                key={etape.cle}
                type="button"
                className={styles.etape}
                aria-pressed={rang === choisie}
                onClick={() => setChoisie(rang)}
              >
                <span className={styles.pastille} aria-hidden="true" />
                <span className={styles.numero}><span>{etape.numero}</span></span>
                <span className={styles.titre}><span>{etape.titre}</span></span>
                {/* Repère retiré (délai chiffré) : sa ligne reste, vide, pour que les
                    quatre étapes gardent la même hauteur, comme dans la maquette
                    où chacune porte le sien. */}
                <span className={styles.quand} aria-hidden={!etape.quand || undefined}>
                  <span>{etape.quand ?? "\u00a0"}</span>
                </span>
              </button>
            ))}
          </div>

          {active ? (
            <div style={VERRE}>
              <div
                className="mg-r2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.15fr .85fr",
                  gap: 44,
                  alignItems: "start",
                }}
              >
                <div>
                  <div
                    style={{
                      font: "600 calc(22px * var(--ts))/1.25 var(--ft)",
                      letterSpacing: "-.03em",
                      marginBottom: 12,
                    }}
                  >
                    <span>{active.titre}</span>
                  </div>
                  <p
                    style={{
                      font: "400 16px/1.7 var(--fb)",
                      color: "var(--ink2)",
                      margin: 0,
                      maxWidth: "56ch",
                    }}
                  >
                    <span>{active.corps}</span>
                  </p>
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  <div
                    style={{
                      padding: "20px 22px",
                      borderRadius: "var(--rad-s)",
                      background: "var(--gsol)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ ...INTITULE_ENCART, color: "var(--ink3)" }}>
                      De votre côté
                    </div>
                    <div
                      style={{
                        font: "400 14.5px/1.55 var(--fb)",
                        color: "var(--ink1)",
                      }}
                    >
                      <span>{active.votreCote}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "20px 22px",
                      borderRadius: "var(--rad-s)",
                      background: "var(--acc-w)",
                      border: "1.5px solid rgba(255,124,60,.3)",
                    }}
                  >
                    <div style={{ ...INTITULE_ENCART, color: "var(--acc-ink)" }}>
                      Ce qui en sort
                    </div>
                    <div
                      style={{
                        font: "500 14.5px/1.55 var(--fb)",
                        color: "var(--ink)",
                      }}
                    >
                      <span>{active.resultat}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 14,
              padding: "18px 24px",
              borderRadius: "var(--rad)",
              background: "var(--panel)",
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                right: -130,
                top: -160,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                font: "600 10.5px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
                flex: "none",
                position: "relative",
              }}
            >
              Si ça ne va pas
            </span>
            <span
              style={{
                font: "400 14.5px/1.6 var(--fb)",
                color: "rgba(255,255,255,.72)",
                flex: 1,
                minWidth: 240,
                position: "relative",
              }}
            >
              Un technicien qui ne convient pas est remplacé, sans discussion et
              sans frais. C’est la contrepartie du fait que vous l’avez validé à
              l’étape 02.
            </span>
            <a
              href={lienQualification}
              className={styles.lienQualification}
              style={{
                font: "600 13.5px var(--fb)",
                color: "var(--acc)",
                flex: "none",
                whiteSpace: "nowrap",
                position: "relative",
              }}
            >
              Démarrer une qualification &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
