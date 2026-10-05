import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  LARGEUR,
  lienTelephone,
} from "@/components/site/blocs/habillage";
import type { ContenuHub } from "@/types/hub";

import styles from "./Hub.module.css";
import { SURTITRE_SERRE, deuxColonnes } from "./habillage";

/**
 * Sections 01 « Héros » et 02 « Photo et logos » du gabarit 10.
 *
 * Maquette : `maquette/gabarit-10-hub-de-rubrique.html`,
 * `data-screen-label="01 Héros"` et `data-screen-label="02 Photo et logos"`.
 *
 * CE QUE LA MAQUETTE DESSINE ET QUE LE CORPUS N'ALIMENTE PAS :
 *
 *   · la PHOTO de la carte du héros (`assets/web/team-duo.jpg`) et la PHOTO
 *     pleine largeur de la section 02 (`ph-hero-raffinerie.jpg`). Le corpus ne
 *     porte aucune image. La carte garde sa place grise, et la section 02 se
 *     réduit à son bandeau de logos : un rectangle gris de 420px de haut, avec
 *     un titre incrusté par-dessus, ne vaut pas d'être rendu.
 *   · l'INCRUSTATION de la punchline sur cette photo, qui répéterait mot pour
 *     mot le H2 de la section 03 juste en dessous.
 *   · les LOGOS. Le bandeau affiche les NOMS des clients des réalisations de la
 *     page, comme la maquette le fait déjà : elle écrit les mêmes noms en
 *     lettres, pas en images.
 */
export default function Ouverture({
  titre,
  contenu,
  filAriane,
}: {
  titre: string;
  contenu: ContenuHub;
  filAriane?: React.ReactNode;
}) {
  const { chapeau, cta, telephone, phraseDelai, enBref, clients } = contenu;

  return (
    <>
      <section style={{ ...LARGEUR, padding: "44px 40px 0" }}>
        {filAriane ? <div style={{ marginBottom: 30 }}>{filAriane}</div> : null}

        <div className={styles.duo} style={deuxColonnes("1.1fr .9fr", 52)}>
          <div>
            {/* La pastille de rubrique, écrite en dur par la maquette : c'est
                l'étiquette du gabarit, pas de la copie de page. */}
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
              Rubrique
            </span>

            <h1
              style={{
                font: "600 calc(clamp(40px,4.8vw,70px) * var(--ts))/1.02 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
                margin: 0,
                maxWidth: "15ch",
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>

            {chapeau ? (
              <p
                className={blocs.corpus}
                style={{
                  font: "400 18px/1.65 var(--fb)",
                  color: "var(--ink2)",
                  margin: "24px 0 0",
                  maxWidth: "50ch",
                  textWrap: "pretty",
                }}
              >
                <TexteRiche texte={chapeau} />
              </p>
            ) : null}

            {cta || telephone ? (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 28,
                  flexWrap: "wrap",
                }}
              >
                {cta ? (
                  <a
                    href={ANCRE_FORMULAIRE}
                    className={blocs.boutonAction}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "15px 26px",
                      borderRadius: 999,
                      background: "var(--acc)",
                      color: "#fff",
                      font: "600 15px var(--fb)",
                      whiteSpace: "nowrap",
                      boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                    }}
                  >
                    {cta}
                  </a>
                ) : null}
                {telephone ? (
                  <a
                    href={lienTelephone(telephone)}
                    className={blocs.boutonSecondaire}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "15px 26px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.8)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                      font: "600 15px var(--fb)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {telephone}
                  </a>
                ) : null}
              </div>
            ) : null}

            {phraseDelai ? (
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
                  className={blocs.corpus}
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink1)",
                    margin: 0,
                    maxWidth: "52ch",
                  }}
                >
                  <TexteRiche texte={phraseDelai} />
                </p>
              </div>
            ) : null}
          </div>

          {/* La carte de droite ne se rend que si « En bref » a des chiffres :
              sans eux, c'est un cadre de verre vide au-dessus d'un rectangle
              gris. La page passe alors en une colonne pleine largeur. */}
          {enBref?.length ? (
            <div
              style={{
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                border: "1px solid var(--gbd)",
                boxShadow: "0 30px 70px -34px rgba(0,0,0,.42)",
                borderRadius: "var(--rad)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "26px 28px 28px" }}>
                <div style={SURTITRE_SERRE}>En bref</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {enBref.map((chiffre) => (
                    <div
                      key={chiffre.valeur + chiffre.libelle}
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
                        {chiffre.valeur}
                      </span>
                      <span
                        style={{
                          font: "400 13.5px/1.5 var(--fb)",
                          color: "var(--ink2)",
                        }}
                      >
                        {chiffre.libelle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {clients?.length ? (
        <section style={{ ...LARGEUR, padding: "44px 40px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--ink4)",
                flex: "none",
              }}
            >
              Ils nous font confiance
            </span>
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

          <div
            className={styles.bandeau}
            style={{
              overflow: "hidden",
              padding: "18px 0 4px",
              WebkitMaskImage:
                "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
              maskImage:
                "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
            }}
          >
            <div className={styles.ruban}>
              {/* Le ruban est rendu deux fois, la seconde hors lecture
                  d'écran : c'est ce qui rend le défilement de -50% continu. */}
              {[false, true].map((copie) =>
                clients.map((nom) => (
                  <span
                    key={`${copie}-${nom}`}
                    aria-hidden={copie ? "true" : undefined}
                    style={{
                      font: "700 18px var(--ft)",
                      letterSpacing: ".08em",
                      color: "var(--ink3)",
                      whiteSpace: "nowrap",
                      opacity: 0.72,
                    }}
                  >
                    {nom}
                  </span>
                )),
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
