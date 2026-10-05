import Link from "next/link";
import type { ReactNode } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import blocsCss from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import type { ContenuSousRubrique } from "@/types/hub";

import BlocsSuivis from "./BlocsSuivis";
import styles from "./Hub.module.css";
import { COLLANTE, SURTITRE_SERRE, deuxColonnes } from "./habillage";

/**
 * Gabarit 11, la SOUS-RUBRIQUE.
 *
 * Maquette : `maquette/gabarit-11-sous-rubrique.html`. Un héros, le corps du
 * corpus en sections numérotées à titre collant, la FAQ, les pages liées.
 *
 * POURQUOI CE GABARIT EXISTE. `/ressources/`, ses cinq rayons et `/carriere/`
 * étaient servies soit par le gabarit de VENTE (dix sections commerciales sur
 * une page de liste), soit par le gabarit ÉDITORIAL, une colonne de lecture avec
 * un sommaire collant que la maquette ne dessine nulle part pour ces pages. Ici
 * chaque titre de niveau 2 du corpus devient une SECTION à part entière, avec
 * son rang en surtitre et son titre collant à gauche : c'est ce qui fait
 * qu'une page de liste se parcourt au lieu de se lire d'un bout à l'autre.
 *
 * Composant SERVEUR : aucun état, aucun écouteur, la page part en HTML complet.
 *
 * TOUTE SECTION SANS DONNÉE NE REND RIEN, titre compris.
 */

export interface ProprietesPageSousRubrique {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuSousRubrique;
  formulaire?: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

const TITRE_SECTION = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "16ch",
  textWrap: "balance",
} as const;

export default function PageSousRubrique({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageSousRubrique) {
  const { pastille, chapeau, corps, faq, liens, compteur } = contenu;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ ...LARGEUR, padding: "44px 40px 0" }}>
          {filAriane ? (
            <div style={{ marginBottom: 30 }}>{filAriane}</div>
          ) : null}

          <div
            className={styles.duo}
            style={deuxColonnes("1.2fr .8fr", 48, "end")}
          >
            <div>
              {pastille ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,var(--gl-a))",
                    border: "1px solid var(--gbd)",
                    font: "600 12px var(--fb)",
                    color: "var(--ink1)",
                    marginBottom: 22,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--acc)",
                    }}
                  />
                  {pastille}
                </span>
              ) : null}

              <h1
                style={{
                  font: "600 calc(clamp(36px,4.4vw,62px) * var(--ts))/1.04 var(--ft)",
                  letterSpacing: "-.045em",
                  color: "var(--ink)",
                  margin: "0 0 22px",
                  maxWidth: "18ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>

              {chapeau?.map((paragraphe) => (
                <p
                  key={paragraphe.texte}
                  className={`${blocsCss.corpus} ${styles.corpsSuivi}`}
                  style={{
                    font: "400 18.5px/1.6 var(--fb)",
                    color: "var(--ink)",
                    margin: "0 0 14px",
                    maxWidth: "56ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={paragraphe.texte} />
                </p>
              ))}
            </div>

            {/* Le cadre de droite ne se rend que si le compteur existe : sans
                lui, c'est un rectangle gris au-dessus d'une pastille vide. */}
            {compteur ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "18px 22px",
                    borderRadius: "var(--rad-s)",
                    background: "var(--panel)",
                  }}
                >
                  <span
                    style={{
                      font: "600 34px/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: "var(--acc)",
                    }}
                  >
                    {compteur}
                  </span>
                  <span
                    style={{
                      font: "400 14px var(--fb)",
                      color: "rgba(255,255,255,.7)",
                    }}
                  >
                    ressources dans cette rubrique
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {corps.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{ ...SECTION, scrollMarginTop: 110 }}
          >
            <div
              className={styles.duo}
              style={{ ...LARGEUR, ...deuxColonnes(".75fr 1.25fr", 56) }}
            >
              <div className={styles.collante} style={COLLANTE}>
                {/* Une section sans titre, ce sont les blocs qui précèdent le
                    premier titre du corpus : elle n'affiche ni rang ni titre. */}
                {section.titre ? (
                  <>
                    <div style={SURTITRE_SERRE}>{section.numero}</div>
                    <h2 style={TITRE_SECTION}>{section.titre}</h2>
                  </>
                ) : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <BlocsSuivis liste={section.blocs} />
              </div>
            </div>
          </section>
        ))}

        {faq?.questions.length ? (
          <section id="faq" style={SECTION}>
            <div
              className={styles.duo}
              style={{ ...LARGEUR, ...deuxColonnes(".75fr 1.25fr", 56) }}
            >
              <div className={styles.collante} style={COLLANTE}>
                <div style={SURTITRE_SERRE}>Questions fréquentes</div>
                <h2
                  style={{
                    ...TITRE_SECTION,
                    margin: "0 0 18px",
                    maxWidth: "14ch",
                  }}
                >
                  {faq.titre}
                </h2>
                <BlocsSuivis liste={faq.intro} />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {faq.questions.map((item) => (
                  <div
                    key={item.question}
                    style={{
                      background: "rgba(255,255,255,var(--gl-a))",
                      backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                      WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                      border: "1px solid var(--gbd)",
                      boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
                      borderRadius: 22,
                      padding: "22px 26px",
                    }}
                  >
                    <div
                      style={{
                        font: "600 17px/1.4 var(--ft)",
                        letterSpacing: "-.02em",
                        marginBottom: 10,
                      }}
                    >
                      {item.question}
                    </div>
                    <p
                      className={`${blocsCss.corpus} ${styles.corpsSuivi}`}
                      style={{
                        font: "400 16.5px/1.75 var(--fb)",
                        color: "var(--ink1)",
                        margin: 0,
                        maxWidth: "68ch",
                        textWrap: "pretty",
                      }}
                    >
                      <TexteRiche texte={item.reponse} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {liens?.length ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div style={SURTITRE_SERRE}>Pour aller plus loin</div>
              <h2
                style={{
                  ...TITRE_SECTION,
                  margin: "0 0 26px",
                  maxWidth: "none",
                }}
              >
                Pages liées
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                  gap: 12,
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
                      backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                      WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                      border: "1px solid var(--gbd)",
                      boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
                      transition: "transform var(--tr)",
                    }}
                  >
                    <div
                      style={{
                        padding: "18px 20px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        flex: 1,
                      }}
                    >
                      {lien.nature ? (
                        <span
                          style={{
                            font: "600 10.5px var(--fb)",
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "var(--acc)",
                          }}
                        >
                          {lien.nature}
                        </span>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            font: "600 16.5px/1.3 var(--ft)",
                            letterSpacing: "-.02em",
                          }}
                        >
                          {lien.titre}
                        </span>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            background: "var(--acc)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "none",
                          }}
                        >
                          &rarr;
                        </span>
                      </div>
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
        ) : null}

        {/* Le formulaire ferme la page, et porte l'ancre `#formulaire`. Le
            bandeau d'appel de la maquette ne se rend pas : son bouton n'a de
            libellé que dans le fichier de maquette. */}
        <div style={{ paddingTop: "var(--sec)" }}>
          <FormulaireBasDePage formulaire={formulaire} />
        </div>

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "0 40px 80px" }}>
            {maillage}
          </section>
        ) : null}
      </main>
    </div>
  );
}
