import Link from "next/link";

import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  LARGEUR,
  SECTION,
  lienTelephone,
} from "@/components/site/blocs/habillage";
import type { AppelHub, ContenuHub } from "@/types/hub";

import styles from "./Hub.module.css";
import {
  COLLANTE,
  SURTITRE,
  TITRE2,
  TITRE2_SERRE,
  VERRE,
  deuxColonnes,
} from "./habillage";

/**
 * Sections 07 à 10 du gabarit 10 : l'appel de milieu de page, les références,
 * les questions, l'appel final.
 *
 * Maquette : `maquette/gabarit-10-hub-de-rubrique.html`, étiquettes
 * `07 Appel`, `08 Références`, `09 Questions`, `10 Appel final`.
 *
 * LA SECTION « RÉASSURANCE » DE LA MAQUETTE N'EST PAS ICI, et c'est un choix :
 * elle se place entre les garanties et l'appel, et son contenu entier (MASE,
 * EcoVadis, « 10 % des candidats retenus », l'astreinte, les quatre agences, les
 * dix hubs) est écrit EN DUR dans le fichier de maquette. Le corpus de ces pages
 * porte déjà ces mêmes faits, dans ses garanties et dans ses questions, et c'est
 * de là qu'ils sont rendus. La reproduire aurait affiché deux fois la même copie
 * sur la même page, dont une version figée dans le code que personne ne pourrait
 * corriger depuis la base.
 *
 * LE FORMULAIRE DE LA SECTION 10 n'est pas dans ce composant : la maquette le
 * met dans la colonne droite du panneau final, le projet le sert en section
 * pleine largeur par `accueil/FormulaireBasDePage`, qui porte l'ancre
 * `#formulaire` visée par tous les boutons et le branchement HubSpot. Le panneau
 * final occupe donc sa colonne gauche, et le formulaire le suit, comme sur les
 * autres gabarits déjà portés.
 */

/** 07 Appel : le bandeau en lavis orange, question à gauche, boutons à droite. */
function Appel({ appel }: { appel?: AppelHub }) {
  if (!appel) return null;

  return (
    <section style={SECTION}>
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
              {appel.question}
            </div>
            {appel.rappel ? (
              <div
                className={blocs.corpus}
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "var(--ink1)",
                }}
              >
                <TexteRiche texte={appel.rappel} />
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
              {appel.bouton}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 08 Références : trois colonnes de cartes, une par réalisation. */
function References({ preuves }: Pick<ContenuHub, "preuves">) {
  if (!preuves?.length) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={SURTITRE}>Nos réalisations</div>
        <h2 style={{ ...TITRE2, margin: "0 0 30px" }}>Nos références</h2>

        <div
          className={styles.trio}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 16,
          }}
        >
          {preuves.map((preuve) => {
            const corps = (
              <div
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                {/* Le nom du client, lu dans le libellé de son lien. */}
                {preuve.lienLibelle ? (
                  <span
                    style={{
                      font: "700 12px var(--ft)",
                      letterSpacing: ".1em",
                      color: "var(--acc)",
                    }}
                  >
                    {preuve.lienLibelle
                      .replace(/^Étude de cas\s*/, "")
                      .split(" : ")[0]}
                  </span>
                ) : null}
                <span
                  style={{
                    font: "600 17px/1.35 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {preuve.titre}
                </span>
                {preuve.texte ? (
                  <span
                    style={{
                      font: "400 14px/1.55 var(--fb)",
                      color: "var(--ink2)",
                    }}
                  >
                    {preuve.texte}
                  </span>
                ) : null}
                {preuve.lienLibelle && preuve.lienHref ? (
                  <span
                    style={{
                      marginTop: "auto",
                      paddingTop: 14,
                      borderTop: "1px solid var(--line)",
                      font: "600 13.5px/1.45 var(--fb)",
                      color: "var(--ink)",
                    }}
                  >
                    {preuve.lienLibelle}{" "}
                    <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                      &rarr;
                    </span>
                  </span>
                ) : null}
              </div>
            );

            const habillage = {
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--rad)",
              overflow: "hidden",
              background: "var(--card)",
              border: "1px solid var(--line)",
              transition: "transform var(--tr),box-shadow var(--tr)",
            } as const;

            /* Sans cible, la carte n'est pas un lien : la maquette rend toute
               la carte cliquable, et un `href="#"` serait un lien mort. */
            return preuve.lienHref ? (
              <Link
                key={preuve.titre}
                href={preuve.lienHref}
                prefetch={false}
                className={styles.carteReference}
                style={habillage}
              >
                {corps}
              </Link>
            ) : (
              <div key={preuve.titre} style={habillage}>
                {corps}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** 09 Questions : titre collant à gauche, dépliants en cartes de verre. */
function Questions({
  questions,
  telephone,
}: Pick<ContenuHub, "questions" | "telephone">) {
  if (!questions?.length) return null;

  return (
    <section style={SECTION}>
      <div
        className={styles.duo}
        style={{ ...LARGEUR, ...deuxColonnes(".75fr 1.25fr", 56) }}
      >
        <div className={styles.collante} style={COLLANTE}>
          <div style={SURTITRE}>Questions fréquentes</div>
          <h2 style={{ ...TITRE2_SERRE, margin: "0 0 20px", maxWidth: "14ch" }}>
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
          {telephone ? (
            <a
              href={lienTelephone(telephone)}
              className={blocs.boutonSecondaire}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 22px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid var(--line)",
                font: "600 15px var(--fb)",
              }}
            >
              {telephone}
            </a>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {questions.map((item) => (
            <div
              key={item.question}
              style={{ ...VERRE, borderRadius: 22, padding: "24px 28px" }}
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
                className={blocs.corpus}
                style={{
                  font: "400 15px/1.7 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                }}
              >
                <TexteRiche texte={item.reponse} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 10 Appel final : le panneau anthracite qui ferme la page. */
function Final({
  final,
  phraseDelai,
  telephone,
}: Pick<ContenuHub, "final" | "phraseDelai" | "telephone">) {
  if (!final) return null;

  return (
    <section style={{ padding: "var(--sec) 24px 0" }}>
      <div
        className={styles.panneau}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 40,
          background: "var(--panel)",
          padding: 56,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 640,
            height: 640,
            left: "50%",
            top: -300,
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={SURTITRE}>Votre besoin</div>
          <h2
            style={{
              font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
              letterSpacing: "-.045em",
              color: "#fff",
              margin: "0 0 20px",
              textWrap: "balance",
            }}
          >
            {final.question}
          </h2>
          {phraseDelai ? (
            <p
              className={blocs.corpusClair}
              style={{
                font: "400 15.5px/1.6 var(--fb)",
                color: "rgba(255,255,255,.64)",
                margin: "0 0 22px",
                maxWidth: "40ch",
              }}
            >
              <TexteRiche texte={phraseDelai} />
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
              {final.bouton}
            </a>
            {telephone ? (
              <a
                href={lienTelephone(telephone)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "15px 26px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.2)",
                  color: "#fff",
                  font: "600 15px var(--fb)",
                  whiteSpace: "nowrap",
                }}
              >
                {telephone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Cloture({ contenu }: { contenu: ContenuHub }) {
  return (
    <>
      <Appel appel={contenu.appel} />
      <References preuves={contenu.preuves} />
      <Questions
        questions={contenu.questions}
        telephone={contenu.telephone}
      />
      <Final
        final={contenu.final}
        phraseDelai={contenu.phraseDelai}
        telephone={contenu.telephone}
      />
    </>
  );
}
