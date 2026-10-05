import Link from "next/link";

import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import type { ContenuHub } from "@/types/hub";

import styles from "./Hub.module.css";
import {
  COLLANTE,
  SURTITRE,
  TITRE2,
  TITRE2_CLAIR,
  TITRE2_SERRE,
  VERRE,
  deuxColonnes,
  numero,
} from "./habillage";

/**
 * Sections 03 à 06 du gabarit 10, plus le maillage de rubrique.
 *
 * Maquette : `maquette/gabarit-10-hub-de-rubrique.html`, étiquettes
 * `03 Problème`, `04 Offre`, `Maillage`, `05 Déroulé`, `06 Garanties`.
 *
 * L'ORDRE EST CELUI DE LA MAQUETTE, et le maillage est bien ENTRE l'offre et le
 * déroulé : c'est là qu'elle le place, après avoir nommé les prestations et
 * avant d'expliquer comment ça se passe. Le remonter ou le descendre casserait
 * le fil de lecture que le client a validé.
 *
 * CE QUE LA MAQUETTE DESSINE ET QUE LE CORPUS N'ALIMENTE PAS :
 *
 *   · la NOTE sous le tableau de l'offre (`p.offerNote`) : le corpus de ces
 *     pages n'écrit rien après ses lignes prestation / bénéfice.
 *   · la VIGNETTE de chaque carte de maillage et la PHOTO du déroulé
 *     (`ph-technicien.jpg`). Aucune image dans le corpus : la carte commence à
 *     son titre, et le déroulé occupe sa colonne sans cadre gris.
 */

/** 03 Problème : la punchline en titre collant, les puces en cartes de verre. */
function Probleme({
  punchTitre,
  punchTexte,
  problemes,
}: Pick<ContenuHub, "punchTitre" | "punchTexte" | "problemes">) {
  if (!problemes?.length) return null;

  return (
    <section style={SECTION}>
      <div
        className={styles.duo}
        style={{ ...LARGEUR, ...deuxColonnes("1fr 1fr", 70) }}
      >
        <div className={styles.collante} style={COLLANTE}>
          <div style={SURTITRE}>Votre problématique</div>
          {punchTitre ? (
            <h2 style={{ ...TITRE2, margin: "0 0 20px", maxWidth: "18ch" }}>
              {punchTitre}
            </h2>
          ) : null}
          {punchTexte ? (
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "44ch",
              }}
            >
              {punchTexte}
            </p>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {problemes.map((puce) => (
            <div
              key={puce.accroche ?? puce.texte}
              style={{
                ...VERRE,
                padding: "24px 28px",
                display: "flex",
                gap: 16,
                alignItems: "baseline",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: "2px solid var(--acc)",
                  flex: "none",
                }}
              />
              <div>
                {puce.accroche ? (
                  <div
                    style={{
                      font: "600 16.5px/1.4 var(--ft)",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {puce.accroche}
                  </div>
                ) : null}
                <div
                  className={blocs.corpus}
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    marginTop: puce.accroche ? 6 : 0,
                  }}
                >
                  <TexteRiche texte={puce.texte} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 04 Offre : le tableau à trois colonnes, numéro, prestation, bénéfice. */
function Offre({ offre }: Pick<ContenuHub, "offre">) {
  if (!offre?.length) return null;

  const ligne = {
    display: "grid",
    gridTemplateColumns: "52px minmax(0,1.05fr) minmax(0,.95fr)",
    gap: 28,
  } as const;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={SURTITRE}>L’offre</div>
        <h2 style={{ ...TITRE2, margin: "0 0 30px", maxWidth: "24ch" }}>
          Ce que nous faisons, et ce que ça change pour vous
        </h2>

        <div
          style={{
            ...VERRE,
            boxShadow: "0 26px 60px -36px rgba(0,0,0,.34)",
            overflow: "hidden",
          }}
        >
          {/* L'en-tête de colonnes disparaît sous 900px (`.g3-head` de la
              maquette), où la ligne se replie en une colonne et n'a plus de
              colonnes à nommer. */}
          <div
            className={`${styles.ligneOffre} ${styles.enteteOffre}`}
            style={{
              ...ligne,
              padding: "18px 30px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span />
            <span
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--ink4)",
              }}
            >
              Ce que nous faisons
            </span>
            <span
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
              }}
            >
              Ce que ça change pour vous
            </span>
          </div>

          {offre.map((item, i) => (
            <div
              key={item.prestation.accroche ?? item.prestation.texte}
              className={styles.ligneOffre}
              style={{
                ...ligne,
                padding: "22px 30px",
                alignItems: "start",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  font: "600 12px ui-monospace,Menlo,monospace",
                  color: "var(--acc)",
                  paddingTop: 3,
                }}
              >
                {numero(i)}
              </span>
              <div
                className={blocs.corpus}
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "var(--ink2)",
                }}
              >
                {item.prestation.accroche ? (
                  <strong
                    style={{
                      display: "block",
                      font: "600 16.5px/1.4 var(--ft)",
                      letterSpacing: "-.02em",
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    {item.prestation.accroche}
                  </strong>
                ) : null}
                <TexteRiche texte={item.prestation.texte} />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "14px 16px",
                  borderRadius: "var(--rad-s)",
                  background: "var(--acc-w)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    color: "var(--acc)",
                    font: "600 15px var(--fb)",
                    flex: "none",
                  }}
                >
                  &rarr;
                </span>
                <span
                  className={blocs.corpus}
                  style={{
                    font: "500 14.5px/1.6 var(--fb)",
                    color: "var(--ink)",
                  }}
                >
                  <TexteRiche texte={item.benefice} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Maillage : chaque lien interne du corpus devient une carte de la rubrique. */
function Maillage({ liens }: Pick<ContenuHub, "liens">) {
  if (!liens?.length) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={SURTITRE}>Dans cette rubrique</div>
        <h2 style={{ ...TITRE2_SERRE, margin: "0 0 28px", maxWidth: "24ch" }}>
          Toutes les pages de la rubrique
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 14,
          }}
        >
          {liens.map((lien) => (
            <Link
              key={lien.url}
              href={lien.url}
              prefetch={false}
              className={styles.carteLien}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 24,
                overflow: "hidden",
                background: "rgba(255,255,255,var(--gl-a))",
                border: "1px solid var(--gbd)",
                boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
                transition: "transform var(--tr)",
              }}
            >
              <div
                style={{
                  padding: "20px 22px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      font: "600 17px/1.3 var(--ft)",
                      letterSpacing: "-.02em",
                      color: "var(--ink)",
                    }}
                  >
                    {lien.titre}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: "var(--acc)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                      font: "600 14px var(--fb)",
                    }}
                  >
                    &rarr;
                  </span>
                </div>
                {lien.extrait ? (
                  <span
                    style={{
                      font: "400 14px/1.55 var(--fb)",
                      color: "var(--ink2)",
                    }}
                  >
                    {lien.extrait}
                  </span>
                ) : null}
                <span
                  style={{
                    marginTop: "auto",
                    font: "500 12px ui-monospace,Menlo,monospace",
                    color: "var(--ink4)",
                  }}
                >
                  {lien.url}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 05 Déroulé : la frise numérotée, titre collant à gauche. */
function Deroule({ etapes }: Pick<ContenuHub, "etapes">) {
  if (!etapes?.length) return null;

  return (
    <section style={SECTION}>
      <div
        className={styles.duo}
        style={{ ...LARGEUR, ...deuxColonnes(".8fr 1.2fr", 56) }}
      >
        <div className={styles.collante} style={COLLANTE}>
          <div style={SURTITRE}>Le déroulé</div>
          <h2 style={{ ...TITRE2, margin: "0 0 24px", maxWidth: "16ch" }}>
            Comment ça se passe, étape par étape
          </h2>
        </div>

        <div style={{ position: "relative", paddingLeft: 4 }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 21,
              top: 22,
              bottom: 22,
              width: 2,
              background: "var(--line)",
            }}
          />
          {etapes.map((etape, i) => (
            <div
              key={etape.titre}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "44px minmax(0,1fr)",
                gap: 22,
                padding: "0 0 30px",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                  font: "600 14px/44px var(--fb)",
                  textAlign: "center",
                  boxShadow: "0 0 0 6px var(--bg)",
                }}
              >
                {numero(i)}
              </span>
              <div style={{ paddingTop: 8 }}>
                <div
                  style={{
                    font: "600 18px/1.35 var(--ft)",
                    letterSpacing: "-.025em",
                    marginBottom: 8,
                  }}
                >
                  {etape.titre}
                </div>
                {etape.texte ? (
                  <p
                    className={blocs.corpus}
                    style={{
                      font: "400 15px/1.65 var(--fb)",
                      color: "var(--ink2)",
                      margin: 0,
                      maxWidth: "60ch",
                    }}
                  >
                    <TexteRiche texte={etape.texte} />
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 06 Garanties : le panneau anthracite, deux colonnes de filets orange. */
function Garanties({ garanties }: Pick<ContenuHub, "garanties">) {
  if (!garanties?.length) return null;

  return (
    <section style={{ padding: "var(--sec) 24px 0" }}>
      <div
        className={styles.panneau}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "var(--panel)",
          borderRadius: 40,
          padding: "58px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            right: -180,
            top: -220,
            background:
              "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={SURTITRE}>Notre parti pris</div>
          <h2 style={{ ...TITRE2_CLAIR, margin: "0 0 36px", maxWidth: "22ch" }}>
            Ce que nous garantissons
          </h2>

          <div
            className={styles.duo}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: "30px 40px",
            }}
          >
            {garanties.map((puce) => (
              <div
                key={puce.accroche ?? puce.texte}
                style={{ borderTop: "2px solid var(--acc)", paddingTop: 22 }}
              >
                {puce.accroche ? (
                  <div
                    style={{
                      font: "600 18px/1.4 var(--ft)",
                      letterSpacing: "-.022em",
                      color: "#fff",
                      marginBottom: 12,
                    }}
                  >
                    {puce.accroche}
                  </div>
                ) : null}
                <div
                  className={blocs.corpusClair}
                  style={{
                    font: "400 14.5px/1.7 var(--fb)",
                    color: "rgba(255,255,255,.64)",
                  }}
                >
                  <TexteRiche texte={puce.texte} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Corps({ contenu }: { contenu: ContenuHub }) {
  return (
    <>
      <Probleme
        punchTitre={contenu.punchTitre}
        punchTexte={contenu.punchTexte}
        problemes={contenu.problemes}
      />
      <Offre offre={contenu.offre} />
      <Maillage liens={contenu.liens} />
      <Deroule etapes={contenu.etapes} />
      <Garanties garanties={contenu.garanties} />
    </>
  );
}
