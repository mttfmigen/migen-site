import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import TexteRiche, {
  estCheminInterne,
} from "@/components/site/blocs/TexteRiche";
import type { ContenuDomaine } from "@/types/domaine";

import styles from "./PageDomaine.module.css";
import { donneesDomaine, friseLogos } from "./donnees-domaine";
import {
  BOUTON_ACTION,
  BOUTON_BLANC,
  BOUTON_SECONDAIRE,
  BOUTON_SOMBRE,
  COLLANT,
  GRILLE_DEROULE,
  GRILLE_FINALE,
  GRILLE_GARANTIES,
  GRILLE_HERO,
  GRILLE_MAILLAGE,
  GRILLE_PROBLEME,
  GRILLE_QUESTIONS,
  GRILLE_REASSURANCE,
  GRILLE_REFERENCES,
  HUBS,
  LARGEUR,
  LARGEUR_HAUT,
  LIGNE_OFFRE,
  LUEUR_FINALE,
  LUEUR_GARANTIES,
  PANNEAU,
  PHOTO,
  SECTION,
  SECTION_FIN,
  SECTION_PANNEAU,
  SURTITRE,
  SURTITRE_GRIS,
  TITRE1,
  TITRE2,
  TITRE2_FINAL,
  TITRE2_PETIT,
  VERRE,
  VERRE_HERO,
  VERRE_TABLEAU,
} from "./habillage-domaine";

/**
 * Gabarits 09 DOMAINE et 05 SPÉCIALITÉ, portés de leurs propres fichiers :
 *
 *   `maquette/gabarit-09-domaine.html`    les 9 racines `/expertises/<domaine>/`
 *   `maquette/gabarit-05-specialite.html` les 10 sous-pages de ces domaines
 *
 * CE QUI A ÉTÉ RÉPARÉ ICI. Les 19 pages passaient par le gabarit de VENTE en dix
 * sections, surtitres « Le problème », « Nos engagements », « Prochaine étape ».
 * Le portage précédent avait lu « Migen - Site final.dc.html », qui ne consacre
 * au domaine que trois sections, et personne n'avait listé les fichiers du
 * projet Claude Design : onze gabarits dédiés y attendaient. Les deux fichiers
 * ci-dessus en dessinent DOUZE, avec d'autres surtitres (« Votre problématique »,
 * « Notre parti pris », « Nos réalisations »), un tableau de l'offre à trois
 * colonnes, une frise de logos, une bande de réassurance et un formulaire dans
 * le panneau sombre de fin.
 *
 * L'ORDRE DES DOUZE SECTIONS, et la seule chose qui diffère entre les deux :
 *
 *    1. 01 Héros              h1, mécanisme, actions, « En bref »
 *    2. 02 Photo et logos     la punchline sur la photo, puis la frise
 *    3. 03 Problème           « Votre problématique »
 *    4. 04 Offre              « L'offre », tableau à trois colonnes
 *    5. Maillage              gabarit 09 SEULEMENT, « La famille technique »
 *    6. 05 Déroulé            « Le déroulé »
 *    7. 06 Garanties          « Notre parti pris », panneau sombre
 *    8. Réassurance           certifications, qui intervient, 4 agences, 10 hubs
 *    9. 07 Appel              la bande orange de milieu de page
 *   10. 08 Références         « Nos réalisations »
 *   11. 09 Questions          « Questions fréquentes »
 *   12. Maillage              gabarit 05 SEULEMENT, « Pour aller plus loin »
 *   13. 10 Appel final        panneau sombre et formulaire
 *
 * Composant SERVEUR. Aucun état, aucun écouteur : les survols et les replis sont
 * dans le module CSS, et les révélations au défilement sont posées en
 * `data-reveal`, animées par `components/site/Moteurs.tsx`, déjà monté dans la
 * mise en page racine.
 *
 * UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT, titre compris. C'est pour cela
 * que chaque bloc est gardé par un test sur sa matière, et non rendu puis vidé :
 * un surtitre orphelin est pire qu'une section absente.
 */

export interface ProprietesPageDomaine {
  titre: string;
  contenu: ContenuDomaine;
  /** Identifiant d'analyse de la soumission, repris par HubSpot. */
  formulaire: string;
  /**
   * Fil d'Ariane et maillage du cocon, fournis par la route.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce fichier asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base, donc plus
   * contrôlable par `verification-domaine.tsx`.
   */
  filAriane?: ReactNode;
  maillageCocon?: ReactNode;
}

/** Le numéro de téléphone devient un `tel:` sans espaces. */
function lienTel(telephone: string): string {
  return `tel:${telephone.replace(/[^+\d]/g, "")}`;
}

/** L'ancre du formulaire de la page, rendue plus bas par cette même page. */
const ANCRE = "#formulaire";

const PASTILLE_ETAPE: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px/44px var(--fb)",
  textAlign: "center",
  boxShadow: "0 0 0 6px var(--bg)",
};

export default function PageDomaine({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillageCocon,
}: ProprietesPageDomaine) {
  const d = donneesDomaine(contenu.sections);
  const specialite = contenu.gabarit === "specialite";
  const h1 = d.h1 || titre;
  const frise = friseLogos(d.references);

  /* Le maillage, un seul bloc rendu à l'une ou l'autre place : après l'offre
     pour un domaine, tout en bas pour une spécialité. C'est LA divergence de
     dessin entre les deux fichiers, et elle se joue ici. */
  const maillage =
    d.maillage.length > 0 ? (
      <section
        data-screen-label="Maillage"
        style={SECTION}
        aria-labelledby="domaine-maillage"
      >
        <div style={LARGEUR}>
          <div style={SURTITRE} id="domaine-maillage">
            {specialite ? "Pour aller plus loin" : "La famille technique"}
          </div>
          {specialite ? null : (
            <h2 style={{ ...TITRE2_PETIT, margin: "0 0 28px", maxWidth: "24ch" }}>
              Les spécialités et pages liées
            </h2>
          )}
          <div style={GRILLE_MAILLAGE}>
            {d.maillage.map((carte) => (
              <Link
                key={carte.href}
                href={carte.href}
                prefetch={false}
                className={styles.carteLien}
                data-reveal=""
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "rgba(255,255,255,var(--gl-a))",
                  border: "1px solid var(--gbd)",
                  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
                }}
              >
                <div
                  style={{ height: 130, background: "#dedfe1", overflow: "hidden" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={carte.visuel}
                    alt=""
                    style={{ ...PHOTO, filter: "saturate(var(--sat))" }}
                  />
                </div>
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
                      {carte.titre}
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
                  <span
                    style={{
                      font: "400 14px/1.55 var(--fb)",
                      color: "var(--ink2)",
                    }}
                  >
                    {carte.description}
                  </span>
                  <span
                    style={{
                      marginTop: "auto",
                      font: "500 12px ui-monospace,Menlo,monospace",
                      color: "var(--ink4)",
                    }}
                  >
                    {carte.href}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ) : null;

  return (
    <>
      {/* ------------------------------------------------- 01 Héros (l. 56) */}
      <section data-screen-label="01 Héros" style={LARGEUR_HAUT}>
        {filAriane}
        <div className={styles.deuxColonnes} style={GRILLE_HERO}>
          <div>
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
                marginBottom: 24,
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
              {specialite ? "Spécialité" : "Expertises"}
            </span>
            <h1 style={TITRE1}>{h1}</h1>
            {d.mecanisme ? (
              <p
                style={{
                  font: "400 18px/1.65 var(--fb)",
                  color: "var(--ink2)",
                  margin: "24px 0 0",
                  maxWidth: "50ch",
                  textWrap: "pretty",
                }}
              >
                <TexteRiche texte={d.mecanisme} />
              </p>
            ) : null}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {d.cta ? (
                <a
                  href={ANCRE}
                  className={styles.boutonPrincipal}
                  style={BOUTON_ACTION}
                >
                  {d.cta}
                </a>
              ) : null}
              {d.telephone ? (
                <a
                  href={lienTel(d.telephone)}
                  className={styles.boutonSecondaire}
                  style={BOUTON_SECONDAIRE}
                >
                  {d.telephone}
                </a>
              ) : null}
            </div>
            {d.phraseDelai ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "var(--acc)",
                    boxShadow: "0 0 0 5px var(--acc-w)",
                    flex: "none",
                    marginTop: 7,
                  }}
                />
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink1)",
                    margin: 0,
                    maxWidth: "52ch",
                  }}
                >
                  {d.phraseDelai}
                </p>
              </div>
            ) : null}
          </div>
          <div data-reveal="" style={VERRE_HERO}>
            <div style={{ height: 250, background: "#dedfe1", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  specialite
                    ? "/assets/web/ph-technicien.jpg"
                    : "/assets/web/team-electric.jpg"
                }
                alt={
                  specialite
                    ? "Technicien migen en intervention"
                    : "Technicien migen sur une armoire électrique"
                }
                style={PHOTO}
              />
            </div>
            {d.reperes.length > 0 ? (
              <div style={{ padding: "26px 28px 28px" }}>
                <div style={{ ...SURTITRE, marginBottom: 14 }}>En bref</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {d.reperes.map((repere) => (
                    <div
                      key={repere.valeur + repere.libelle}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                        paddingTop: 12,
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <span
                        style={{
                          font: "600 20px/1.1 var(--ft)",
                          letterSpacing: "-.035em",
                          color: "var(--ink)",
                          flex: "none",
                          minWidth: 88,
                        }}
                      >
                        {repere.valeur}
                      </span>
                      <span
                        style={{
                          font: "400 13.5px/1.5 var(--fb)",
                          color: "var(--ink2)",
                        }}
                      >
                        {repere.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ------------------------------------- 02 Photo et logos (l. 76) */}
      <section data-screen-label="02 Photo et logos" style={LARGEUR_HAUT}>
        <div
          style={{
            position: "relative",
            borderRadius: 36,
            overflow: "hidden",
            background: "#dedfe1",
            boxShadow: "0 40px 90px -50px rgba(28,27,25,.55)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              specialite
                ? "/assets/web/team-electric.jpg"
                : "/assets/web/ph-robots-solaire.jpg"
            }
            alt={
              specialite
                ? "Technicien migen devant une armoire électrique ouverte"
                : "Cellule robotisée"
            }
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              display: "block",
              filter: "saturate(var(--sat)) contrast(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom,rgba(28,27,25,.3),rgba(28,27,25,0) 38%,rgba(28,27,25,.6))",
            }}
          />
          {d.punchTitre ? (
            <div
              className={styles.tuilePhoto}
              style={{
                position: "absolute",
                left: 32,
                right: 32,
                bottom: 30,
                maxWidth: 640,
              }}
            >
              <div
                style={{
                  font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.2 var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                  textWrap: "balance",
                }}
              >
                {d.punchTitre}
              </div>
            </div>
          ) : null}
        </div>
        {frise.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                marginTop: 40,
                flexWrap: "wrap",
              }}
            >
              <span style={SURTITRE_GRIS}>Ils nous font confiance</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--line)",
                  minWidth: 30,
                }}
              />
            </div>
            <div className={styles.frise}>
              <div className={styles.friseRuban}>
                {frise.map((logo, i) => (
                  <span
                    key={`${logo.nom}-${i}`}
                    aria-hidden={logo.double ? "true" : undefined}
                    style={{
                      font: "700 18px var(--ft)",
                      letterSpacing: ".08em",
                      color: "var(--ink3)",
                      whiteSpace: "nowrap",
                      opacity: 0.72,
                    }}
                  >
                    {logo.nom}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>

      {/* ---------------------------------------------- 03 Problème (l. 94) */}
      {d.problemes.length > 0 ? (
        <section data-screen-label="03 Problème" style={SECTION}>
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...GRILLE_PROBLEME }}
          >
            <div className={styles.collant} style={COLLANT}>
              <div style={SURTITRE}>Votre problématique</div>
              {d.punchTitre ? (
                <h2
                  style={{
                    ...TITRE2,
                    margin: "0 0 20px",
                    maxWidth: "18ch",
                    textWrap: "balance",
                  }}
                >
                  {d.punchTitre}
                </h2>
              ) : null}
              {d.punchTexte ? (
                <p
                  style={{
                    font: "400 16.5px/1.7 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                    maxWidth: "44ch",
                  }}
                >
                  {d.punchTexte}
                </p>
              ) : null}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {d.problemes.map((probleme) => (
                <div
                  key={probleme.accroche + probleme.texte}
                  data-reveal=""
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
                    {probleme.accroche ? (
                      <div
                        style={{
                          font: "600 16.5px/1.4 var(--ft)",
                          letterSpacing: "-.02em",
                        }}
                      >
                        {probleme.accroche}
                      </div>
                    ) : null}
                    <div
                      style={{
                        font: "400 14.5px/1.6 var(--fb)",
                        color: "var(--ink2)",
                        marginTop: 6,
                      }}
                    >
                      <TexteRiche texte={probleme.texte} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------- 04 Offre (l. 111) */}
      {d.offre.length > 0 ? (
        <section
          data-screen-label="04 Offre"
          style={SECTION}
          aria-labelledby="domaine-offre"
        >
          <div style={LARGEUR}>
            <div style={SURTITRE}>L’offre</div>
            <h2
              id="domaine-offre"
              style={{
                ...TITRE2,
                margin: "0 0 30px",
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              Ce que nous faisons, et ce que ça change pour vous
            </h2>
            <div data-reveal="" style={VERRE_TABLEAU}>
              <div
                className={`${styles.ligneOffre} ${styles.enteteOffre}`}
                style={{
                  ...LIGNE_OFFRE,
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
              {d.offre.map((ligne) => (
                <div
                  key={ligne.numero}
                  className={styles.ligneOffre}
                  style={{
                    ...LIGNE_OFFRE,
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
                    {ligne.numero}
                  </span>
                  <div
                    style={{
                      font: "400 14.5px/1.6 var(--fb)",
                      color: "var(--ink2)",
                    }}
                  >
                    {ligne.accroche ? (
                      <strong
                        style={{
                          display: "block",
                          font: "600 16.5px/1.4 var(--ft)",
                          letterSpacing: "-.02em",
                          color: "var(--ink)",
                          marginBottom: 4,
                        }}
                      >
                        {ligne.accroche}
                      </strong>
                    ) : null}
                    <TexteRiche texte={ligne.texte} />
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
                      style={{
                        font: "500 14.5px/1.6 var(--fb)",
                        color: "var(--ink)",
                      }}
                    >
                      <TexteRiche texte={ligne.benefice} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {d.notesOffre.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 6,
                  marginTop: 14,
                  padding: "20px 26px",
                  borderRadius: 24,
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,.5)",
                }}
              >
                {d.notesOffre.map((note) => (
                  <p
                    key={note}
                    style={{
                      font: "400 15px/1.65 var(--fb)",
                      color: "var(--ink1)",
                      margin: 0,
                    }}
                  >
                    <TexteRiche texte={note} />
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Maillage, place du gabarit 09 : juste après l'offre (l. 131). */}
      {specialite ? null : maillage}

      {/* ----------------------------------------------- 05 Déroulé (l. 148) */}
      {d.etapes.length > 0 ? (
        <section
          data-screen-label="05 Déroulé"
          style={SECTION}
          aria-labelledby="domaine-deroule"
        >
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...GRILLE_DEROULE }}
          >
            <div className={styles.collant} style={COLLANT}>
              <div style={SURTITRE}>Le déroulé</div>
              <h2
                id="domaine-deroule"
                style={{
                  font: "600 calc(clamp(30px,3.3vw,44px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: "0 0 24px",
                  maxWidth: "16ch",
                }}
              >
                Comment ça se passe, étape par étape
              </h2>
              <div
                style={{
                  borderRadius: "var(--rad)",
                  overflow: "hidden",
                  height: 380,
                  background: "#dedfe1",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/web/ph-technicien.jpg"
                  alt="Technicien migen en intervention sur site"
                  style={PHOTO}
                />
              </div>
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
              {d.etapes.map((etape) => (
                <div
                  key={etape.numero}
                  data-reveal=""
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "44px minmax(0,1fr)",
                    gap: 22,
                    padding: "0 0 30px",
                  }}
                >
                  <span style={PASTILLE_ETAPE}>{etape.numero}</span>
                  <div style={{ paddingTop: 8 }}>
                    <div
                      style={{
                        font: "600 18px/1.35 var(--ft)",
                        letterSpacing: "-.025em",
                        marginBottom: 8,
                      }}
                    >
                      {etape.accroche}
                    </div>
                    {etape.texte ? (
                      <p
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
      ) : null}

      {/* --------------------------------------------- 06 Garanties (l. 166) */}
      {d.garanties.length > 0 ? (
        <section
          data-screen-label="06 Garanties"
          style={SECTION_PANNEAU}
          aria-labelledby="domaine-garanties"
        >
          <div
            className={styles.panneauPad}
            style={{ ...PANNEAU, padding: "58px 56px" }}
          >
            <div aria-hidden="true" style={LUEUR_GARANTIES} />
            <div style={{ position: "relative" }}>
              <div style={SURTITRE}>Notre parti pris</div>
              <h2
                id="domaine-garanties"
                style={{
                  ...TITRE2_PETIT,
                  color: "#fff",
                  margin: "0 0 36px",
                  maxWidth: "22ch",
                }}
              >
                Ce que nous garantissons
              </h2>
              <div className={styles.deuxColonnes} style={GRILLE_GARANTIES}>
                {d.garanties.map((garantie) => (
                  <div
                    key={garantie.accroche + garantie.texte}
                    style={{
                      borderTop: "2px solid var(--acc)",
                      paddingTop: 22,
                    }}
                  >
                    {garantie.accroche ? (
                      <div
                        style={{
                          font: "600 18px/1.4 var(--ft)",
                          letterSpacing: "-.022em",
                          color: "#fff",
                          marginBottom: 12,
                        }}
                      >
                        {garantie.accroche}
                      </div>
                    ) : null}
                    <div
                      style={{
                        font: "400 14.5px/1.7 var(--fb)",
                        color: "rgba(255,255,255,.64)",
                      }}
                    >
                      {garantie.texte}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------- Réassurance (l. 180) */}
      {/* Les deux cartes sont de la copie DE LA MAQUETTE, pas du corpus : le
          gabarit les écrit en toutes lettres. Elles sont donc rendues toujours,
          et le contrôle vérifie que chaque phrase s'y trouve encore. */}
      <section data-screen-label="Réassurance" style={SECTION}>
        <div
          className={styles.deuxColonnes}
          style={{ ...LARGEUR, ...GRILLE_REASSURANCE }}
        >
          <div data-reveal="" style={{ ...VERRE, padding: "34px 36px" }}>
            <div style={{ ...SURTITRE, marginBottom: 22 }}>Certifications</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {[
                ["MASE", "Démarche sécurité des interventions"],
                ["EcoVadis", "Évaluation de la performance RSE"],
              ].map(([nom, quoi]) => (
                <div
                  key={nom}
                  style={{
                    borderRadius: "var(--rad-s)",
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    padding: 20,
                  }}
                >
                  <div
                    style={{ font: "700 22px var(--ft)", letterSpacing: ".02em" }}
                  >
                    {nom}
                  </div>
                  <div
                    style={{
                      font: "400 13px/1.5 var(--fb)",
                      color: "var(--ink3)",
                      marginTop: 6,
                    }}
                  >
                    {quoi}
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                font: "400 15px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
              }}
            >
              Les attestations sont transmises avec chaque plan de prévention.
            </p>
          </div>
          <div
            data-reveal=""
            style={{
              ...VERRE,
              padding: "34px 36px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ ...SURTITRE, marginBottom: 0 }}>
              Qui intervient chez vous
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 26px",
                borderRadius: "var(--rad)",
                background: "var(--panel)",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  font: "600 calc(52px * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.06em",
                  color: "var(--acc)",
                  whiteSpace: "nowrap",
                }}
              >
                10&nbsp;%
              </span>
              <span
                style={{
                  font: "400 14.5px/1.5 var(--fb)",
                  color: "rgba(255,255,255,.7)",
                  flex: 1,
                  minWidth: 180,
                }}
              >
                des candidats retenus. Des techniciens salariés de Migen, évalués
                sur la technique et le comportement.
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                ["Astreinte", "nuit, week-end et jours fériés"],
                ["4 agences", "Lyon (siège), Montréal, Dubaï, Madrid"],
              ].map(([quoi, detail]) => (
                <div key={quoi}>
                  <div
                    style={{
                      font: "600 18px var(--ft)",
                      letterSpacing: "-.025em",
                    }}
                  >
                    {quoi}
                  </div>
                  <div
                    style={{
                      font: "400 13.5px var(--fb)",
                      color: "var(--ink3)",
                      marginTop: 4,
                    }}
                  >
                    {detail}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  font: "600 13px var(--fb)",
                  color: "var(--ink1)",
                  marginBottom: 10,
                }}
              >
                10 hubs de techniciens
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HUBS.map((hub) => (
                  <span
                    key={hub}
                    style={{
                      font: "500 12.5px var(--fb)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "var(--chip)",
                      color: "var(--ink1)",
                    }}
                  >
                    {hub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- 07 Appel (l. 204) */}
      {d.appelQuestion ? (
        <section data-screen-label="07 Appel" style={SECTION}>
          <div style={LARGEUR}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 26,
                flexWrap: "wrap",
                padding: "34px 34px 34px 42px",
                borderRadius: 36,
                background: "var(--acc-w)",
                border: "1.5px solid rgba(255,124,60,.3)",
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div
                  style={{
                    font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.22 var(--ft)",
                    letterSpacing: "-.034em",
                    marginBottom: 10,
                    maxWidth: "32ch",
                    textWrap: "balance",
                  }}
                >
                  {d.appelQuestion}
                </div>
                {d.appelRappel ? (
                  <div
                    style={{
                      font: "400 14.5px/1.6 var(--fb)",
                      color: "var(--ink1)",
                    }}
                  >
                    {d.appelRappel.avant}
                    {d.appelRappel.telephone ? (
                      <a
                        href={lienTel(d.appelRappel.telephone)}
                        style={{ fontWeight: 600, color: "var(--ink)" }}
                      >
                        {d.appelRappel.telephone}
                      </a>
                    ) : null}
                    {d.appelRappel.apres}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {d.appelBouton ? (
                  <a
                    href={ANCRE}
                    className={styles.boutonPrincipal}
                    style={BOUTON_ACTION}
                  >
                    {d.appelBouton}
                  </a>
                ) : null}
                {d.telephone ? (
                  <a href={lienTel(d.telephone)} style={BOUTON_BLANC}>
                    {d.telephone}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------- 08 Références (l. 214) */}
      {d.references.length > 0 ? (
        <section
          data-screen-label="08 Références"
          style={SECTION}
          aria-labelledby="domaine-references"
        >
          <div style={LARGEUR}>
            <div style={SURTITRE}>Nos réalisations</div>
            <h2
              id="domaine-references"
              style={{ ...TITRE2, margin: "0 0 30px" }}
            >
              Nos références
            </h2>
            <div className={styles.troisColonnes} style={GRILLE_REFERENCES}>
              {d.references.map((reference, i) => {
                const interne =
                  !!reference.href && estCheminInterne(reference.href);
                const corps = (
                  <>
                    <div
                      style={{
                        height: 180,
                        background: "#dedfe1",
                        overflow: "hidden",
                        flex: "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reference.visuel} alt="" style={PHOTO} />
                    </div>
                    <div
                      style={{
                        padding: "22px 24px 22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        flex: 1,
                      }}
                    >
                      {reference.client ? (
                        <span
                          style={{
                            font: "700 12px var(--ft)",
                            letterSpacing: ".1em",
                            color: "var(--acc)",
                          }}
                        >
                          {reference.client}
                        </span>
                      ) : null}
                      <span
                        style={{
                          font: "600 17px/1.35 var(--ft)",
                          letterSpacing: "-.02em",
                          color: "var(--ink)",
                        }}
                      >
                        {reference.titre}
                      </span>
                      {reference.texte ? (
                        <span
                          style={{
                            font: "400 14px/1.55 var(--fb)",
                            color: "var(--ink2)",
                          }}
                        >
                          {reference.texte}
                        </span>
                      ) : null}
                      {interne ? (
                        <span
                          style={{
                            marginTop: "auto",
                            paddingTop: 14,
                            borderTop: "1px solid var(--line)",
                            font: "600 13.5px/1.45 var(--fb)",
                            color: "var(--ink)",
                          }}
                        >
                          {reference.libelle}{" "}
                          <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                            &rarr;
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </>
                );
                const habillage: CSSProperties = {
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "var(--rad)",
                  overflow: "hidden",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                };
                /* Sans étude de cas publiée, la carte reste une carte : pas de
                   lien mort, pas de `href="#"`. C'est le cas de 3 pages sur 19. */
                return interne ? (
                  <Link
                    key={reference.titre}
                    href={reference.href}
                    prefetch={false}
                    className={styles.carteReference}
                    data-reveal=""
                    style={habillage}
                  >
                    {corps}
                  </Link>
                ) : (
                  <div
                    key={reference.titre + i}
                    data-reveal=""
                    style={habillage}
                  >
                    {corps}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------- 09 Questions (l. 232) */}
      {d.questions.length > 0 ? (
        <section
          data-screen-label="09 Questions"
          style={SECTION}
          aria-labelledby="domaine-questions"
        >
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...GRILLE_QUESTIONS }}
          >
            <div className={styles.collant} style={COLLANT}>
              <div style={SURTITRE}>Questions fréquentes</div>
              <h2
                id="domaine-questions"
                style={{ ...TITRE2_PETIT, margin: "0 0 20px", maxWidth: "14ch" }}
              >
                Vos questions avant de nous appeler
              </h2>
              <div
                style={{
                  font: "400 15px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  marginBottom: 18,
                }}
              >
                Une autre question&nbsp;? Un technicien vous répond.
              </div>
              {d.telephone ? (
                <a
                  href={lienTel(d.telephone)}
                  style={{ ...BOUTON_BLANC, padding: "13px 22px" }}
                >
                  {d.telephone}
                </a>
              ) : null}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {d.questions.map((question) => (
                <div
                  key={question.question}
                  data-reveal=""
                  style={{ ...VERRE, borderRadius: 22, padding: "24px 28px" }}
                >
                  <div
                    style={{
                      font: "600 17px/1.4 var(--ft)",
                      letterSpacing: "-.02em",
                      marginBottom: 10,
                    }}
                  >
                    {question.question}
                  </div>
                  <p
                    style={{
                      font: "400 15px/1.7 var(--fb)",
                      color: "var(--ink2)",
                      margin: 0,
                    }}
                  >
                    <TexteRiche texte={question.reponse} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Maillage, place du gabarit 05 : tout en bas (l. 250). */}
      {specialite ? maillage : null}

      {/* ------------------------------------------ 10 Appel final (l. 263) */}
      <section data-screen-label="10 Appel final" style={SECTION_FIN}>
        <div className={styles.panneauPad} style={{ ...PANNEAU, padding: 56 }}>
          <div aria-hidden="true" style={LUEUR_FINALE} />
          <div className={styles.deuxColonnes} style={GRILLE_FINALE}>
            <div>
              <div style={{ ...SURTITRE, marginBottom: 16 }}>Votre besoin</div>
              {d.finalQuestion ? (
                <h2 style={TITRE2_FINAL}>{d.finalQuestion}</h2>
              ) : null}
              {d.phraseDelai ? (
                <p
                  style={{
                    font: "400 15.5px/1.6 var(--fb)",
                    color: "rgba(255,255,255,.64)",
                    margin: "0 0 22px",
                    maxWidth: "40ch",
                  }}
                >
                  {d.phraseDelai}
                </p>
              ) : null}
              {d.telephone ? (
                <a
                  href={lienTel(d.telephone)}
                  className={styles.boutonSombre}
                  style={BOUTON_SOMBRE}
                >
                  {d.telephone}
                </a>
              ) : null}
            </div>
            {/* L'ancre de tous les appels à l'action de la page. Elle porte sa
                marge de défilement pour que l'îlot de navigation ne recouvre
                pas le premier champ. */}
            <div
              id="formulaire"
              style={{
                scrollMarginTop: 110,
                border: "1px solid var(--gbd)",
                boxShadow: "0 30px 70px -30px rgba(0,0,0,.6)",
                background: "#fff",
                borderRadius: "var(--rad)",
                padding: 30,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "6px 14px",
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    font: "600 20px/1.2 var(--ft)",
                    letterSpacing: "-.03em",
                  }}
                >
                  {d.cta}
                </div>
                <div
                  style={{
                    font: "500 11px var(--fb)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  Rappel dans l’heure
                </div>
              </div>
              <FormulaireContact formulaire={formulaire} />
            </div>
          </div>
        </div>
      </section>

      {maillageCocon}
    </>
  );
}
