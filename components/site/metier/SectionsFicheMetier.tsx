import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { BandeFiche, CarteFiche, SectionFiche } from "@/types/metier";

import styles from "./FicheMetier.module.css";

/**
 * Les sections du gabarit 07 « Métier et carrière », hors héros et formulaire.
 *
 * CHAQUE VALEUR DE DESSIN est recopiée de la capture de référence,
 * `maquette/rendu/carriere--automaticien.html` (et ses 12 sœurs pour les
 * variantes encart, duo et grille). Rien n'est arrondi : si une valeur change
 * ici, c'est que la capture a changé, et `verification-metier.tsx` le dit.
 *
 * UNE SECTION SANS DONNÉE NE SE REND PAS : chaque rendu commence par vérifier
 * sa matière. Les ordinaux (01, 02…) sont du dessin, recalculés : l'extraction
 * a vérifié qu'ils se suivent dans la capture.
 */

const MONO = "ui-monospace, Menlo, monospace";

/** « 3 » devient « 03 » : l'ordinal des cartes, recalculé comme la maquette. */
function ordinal(i: number): string {
  return String(i + 1).padStart(2, "0");
}

/** Le H2 d'une section, aux échelles relevées par famille de section. */
function Titre2({
  texte,
  echelle,
  interlettre = "-.04em",
  marge = 0,
  largeur,
  clair = false,
}: {
  texte: string;
  echelle: string;
  interlettre?: string;
  marge?: CSSProperties["margin"];
  largeur?: string;
  clair?: boolean;
}) {
  return (
    <h2
      style={{
        font: `600 calc(${echelle} * var(--ts)) var(--ft)`,
        letterSpacing: interlettre,
        color: clair ? "#fff" : "var(--ink)",
        margin: marge,
        maxWidth: largeur,
        textWrap: "balance",
      }}
    >
      {texte}
    </h2>
  );
}

/** Un paragraphe d'introduction, richesse Markdown rendue. */
function Intro({
  texte,
  police,
  largeur,
  marge = "0 0 14px",
}: {
  texte: string;
  police: string;
  largeur?: string;
  marge?: string;
}) {
  return (
    <p
      className={styles.texteLie}
      style={{
        font: `400 ${police} var(--fb)`,
        color: "var(--ink2)",
        margin: marge,
        maxWidth: largeur,
        textWrap: "pretty",
      }}
    >
      <TexteRiche texte={texte} />
    </p>
  );
}

/** La bande orange d'appel qui suit certaines sections, bouton fixe. */
function Bande({ bande }: { bande?: BandeFiche }) {
  if (!bande?.texte) return null;
  return (
    <div style={{ ...LARGEUR, margin: "28px auto 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 22,
          flexWrap: "wrap",
          padding: "24px 28px 24px 32px",
          borderRadius: 28,
          background: "var(--acc-w)",
          border: "1.5px solid rgba(255,124,60,.3)",
        }}
      >
        <div
          className={styles.texteLie}
          style={{
            font: "500 16px/1.6 var(--fb)",
            color: "var(--ink)",
            flex: "1 1 0%",
            minWidth: 260,
            maxWidth: "70ch",
          }}
        >
          <TexteRiche texte={bande.texte} />
        </div>
        <BoutonPostuler />
      </div>
    </div>
  );
}

/** Le bouton orange fixe du gabarit, vers le formulaire de la page. */
export function BoutonPostuler() {
  return (
    <a
      href="#postuler"
      className={styles.boutonOrange}
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
        transition: "filter var(--tr),transform var(--tr)",
      }}
    >
      Postuler
    </a>
  );
}

/** L'enveloppe commune : rythme vertical de la maquette, révélation au défilement. */
function Enveloppe({ children, fin = false }: { children: ReactNode; fin?: boolean }) {
  return (
    <section style={{ padding: `var(--sec) 0 ${fin ? "var(--sec)" : "0"}` }}>
      <div data-reveal="">{children}</div>
    </section>
  );
}

/* --------------------------------------------------------------- chiffres */

function Chiffres({ items }: { items: { valeur: string; texte: string }[] }) {
  if (!items.length) return null;
  return (
    <section style={{ ...LARGEUR, padding: "84px 40px 0" }}>
      <div
        data-reveal=""
        className={styles.stats}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,minmax(0,1fr))",
          gap: 12,
        }}
      >
        {items.map((c) => (
          <div
            key={c.texte}
            style={{ ...VERRE, borderRadius: 24, padding: "22px 24px 24px" }}
          >
            <div
              style={{
                font: "600 calc(28px * var(--ts))/1 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
              }}
            >
              {c.valeur}
            </div>
            <div
              style={{
                font: "400 13.5px/1.5 var(--fb)",
                color: "var(--ink2)",
                marginTop: 10,
              }}
            >
              {c.texte}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ bento */

/** La travée du dernier rang : la carte s'étire pour fermer la grille. */
function traveeDerniere(n: number): number {
  return (3 - (n % 3)) % 3 || 3;
}

function Bento({
  surtitre,
  titre,
  intros,
  cartes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  cartes: CarteFiche[];
}) {
  if (!cartes.length) return null;
  return (
    <div style={LARGEUR}>
      <div
        className={styles.deuxColonnes}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 40,
          alignItems: "end",
          marginBottom: 30,
        }}
      >
        <div>
          <div style={SURTITRE}>{surtitre}</div>
          <Titre2 texte={titre} echelle="clamp(28px,3vw,42px)/1.08" largeur="18ch" />
        </div>
        <div>
          {intros?.map((t) => (
            <Intro key={t} texte={t} police="15.5px/1.65" marge="0 0 10px" />
          ))}
        </div>
      </div>
      <div
        className={styles.bento}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 14,
        }}
      >
        {cartes.map((carte, i) => {
          const sombre = i === 0;
          const travee = sombre ? 2 : i === cartes.length - 1 ? traveeDerniere(cartes.length) : 1;
          return (
            <div
              key={carte.titre}
              className={travee === 3 ? styles.travee3 : undefined}
              style={{
                gridColumn: `span ${travee}`,
                position: "relative",
                overflow: "hidden",
                borderRadius: 28,
                padding: sombre ? 32 : 26,
                minHeight: sombre ? 210 : 180,
                ...(sombre
                  ? { background: "var(--panel)" }
                  : { ...VERRE, borderRadius: 28 }),
              }}
            >
              {sombre ? (
                <div
                  style={{
                    position: "absolute",
                    width: 360,
                    height: 360,
                    right: -140,
                    top: -170,
                    background:
                      "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    font: `600 11px ${MONO}`,
                    color: "var(--acc)",
                    display: "block",
                    marginBottom: 14,
                  }}
                >
                  {ordinal(i)}
                </span>
                <div
                  style={{
                    font: `600 ${sombre ? "21px" : "17px"}/1.3 var(--ft)`,
                    letterSpacing: "-.025em",
                    color: sombre ? "#fff" : "var(--ink)",
                    marginBottom: 10,
                  }}
                >
                  {carte.titre}
                </div>
                <div
                  className={styles.texteLie}
                  style={{
                    font: `400 ${sombre ? "15px" : "14.5px"}/1.6 var(--fb)`,
                    color: sombre ? "rgba(255,255,255,.66)" : "var(--ink2)",
                  }}
                >
                  <TexteRiche texte={carte.texte} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------- liste numérotée et ses pastilles */

function Liste({
  surtitre,
  titre,
  intros,
  cartes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  cartes: CarteFiche[];
}) {
  if (!cartes.length) return null;
  return (
    <div style={LARGEUR}>
      <div style={{ maxWidth: 720, marginBottom: 30 }}>
        <div style={SURTITRE}>{surtitre}</div>
        <Titre2
          texte={titre}
          echelle="clamp(28px,3vw,42px)/1.08"
          marge="0 0 18px"
          largeur="22ch"
        />
        {intros?.map((t) => (
          <Intro key={t} texte={t} police="16px/1.7" largeur="62ch" />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
          gap: 12,
        }}
      >
        {cartes.map((carte, i) => (
          <div
            key={carte.titre}
            style={{
              ...VERRE,
              padding: "22px 24px",
              display: "grid",
              gridTemplateColumns: "36px minmax(0,1fr)",
              gap: 14,
              alignItems: "start",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--acc-w)",
                color: "var(--acc)",
                font: `600 12px/36px ${MONO}`,
                textAlign: "center",
              }}
            >
              {ordinal(i)}
            </span>
            <div>
              <div
                style={{
                  font: "600 16.5px/1.4 var(--ft)",
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                }}
              >
                {carte.titre}
              </div>
              <div
                className={styles.texteLie}
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  marginTop: 6,
                }}
              >
                <TexteRiche texte={carte.texte} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- étapes */

function Etapes({
  surtitre,
  titre,
  intros,
  etapes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  etapes: CarteFiche[];
}) {
  if (!etapes.length) return null;
  return (
    <div style={LARGEUR}>
      <div style={{ maxWidth: 720, marginBottom: 34 }}>
        <div style={SURTITRE}>{surtitre}</div>
        <Titre2
          texte={titre}
          echelle="clamp(28px,3vw,42px)/1.08"
          marge="0 0 18px"
          largeur="22ch"
        />
        {intros?.map((t) => (
          <Intro key={t} texte={t} police="16px/1.7" largeur="62ch" />
        ))}
      </div>
      <div
        className={styles.etapes}
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(4,minmax(0,1fr))",
        }}
      >
        {etapes.map((etape, i) => (
          <div
            key={etape.titre}
            style={{
              ...VERRE,
              borderRadius: 24,
              boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
              position: "relative",
              padding: "24px 24px 26px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                  font: "600 13px/38px var(--fb)",
                  textAlign: "center",
                  flex: "0 0 auto",
                }}
              >
                {ordinal(i)}
              </span>
              <span
                style={{
                  flex: "1 1 0%",
                  height: 2,
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg,rgba(255,124,60,.5),rgba(255,124,60,0))",
                }}
              />
            </div>
            <div
              style={{
                font: "600 16.5px/1.35 var(--ft)",
                letterSpacing: "-.02em",
                marginBottom: 8,
              }}
            >
              {etape.titre}
            </div>
            <div
              className={styles.texteLie}
              style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink2)" }}
            >
              <TexteRiche texte={etape.texte} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- duo */

function Duo({
  surtitre,
  titre,
  intros,
  cartes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  cartes: CarteFiche[];
}) {
  if (!cartes.length) return null;
  return (
    <div style={LARGEUR}>
      <div
        className={styles.deuxColonnes}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div className={styles.colleEnHaut} style={{ position: "sticky", top: 110 }}>
          <div style={SURTITRE}>{surtitre}</div>
          <Titre2
            texte={titre}
            echelle="clamp(28px,3vw,42px)/1.08"
            marge="0 0 18px"
            largeur="16ch"
          />
          {intros?.map((t) => (
            <Intro key={t} texte={t} police="16px/1.7" largeur="62ch" />
          ))}
        </div>
        <div
          className={styles.duoCartes}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 12,
          }}
        >
          {cartes.map((carte, i) => (
            <div
              key={carte.titre}
              style={{
                ...VERRE,
                padding: "24px 24px 22px",
                minHeight: 190,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  font: `600 11px ${MONO}`,
                  color: "var(--acc)",
                  marginBottom: 14,
                }}
              >
                {ordinal(i)}
              </span>
              <div
                style={{
                  font: "600 18px/1.3 var(--ft)",
                  letterSpacing: "-.025em",
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {carte.titre}
              </div>
              <div
                className={styles.texteLie}
                style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink2)" }}
              >
                <TexteRiche texte={carte.texte} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------- tableau à deux colonnes rangées */

function Tableau({
  surtitre,
  titre,
  intros,
  entetes,
  lignes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  entetes?: { gauche: string; droite: string };
  lignes: { gauche: string; droite: string }[];
}) {
  if (!lignes.length) return null;
  const RANG: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
    gap: 18,
  };
  const ENTETE: CSSProperties = {
    font: "600 10.5px var(--fb)",
    letterSpacing: ".12em",
    textTransform: "uppercase",
  };
  return (
    <div
      style={{
        ...LARGEUR,
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: 14,
        alignItems: "start",
      }}
    >
      <div>
        <div style={SURTITRE}>{surtitre}</div>
        <Titre2
          texte={titre}
          echelle="clamp(26px,2.6vw,36px)/1.12"
          interlettre="-.035em"
          largeur="26ch"
        />
      </div>
      <div>
        {intros?.map((t) => (
          <Intro key={t} texte={t} police="16px/1.7" largeur="70ch" />
        ))}
        <div style={{ marginTop: 8 }}>
          <div style={{ ...VERRE, padding: "6px 28px" }}>
            {entetes ? (
              <div
                className={styles.rangTableau}
                style={{ ...RANG, padding: "16px 0 12px" }}
              >
                <span style={{ ...ENTETE, color: "var(--acc)" }}>
                  {entetes.gauche}
                </span>
                <span style={{ ...ENTETE, color: "var(--ink4)" }}>
                  {entetes.droite}
                </span>
              </div>
            ) : null}
            {lignes.map((ligne) => (
              <div
                key={ligne.gauche + ligne.droite}
                className={styles.rangTableau}
                style={{
                  ...RANG,
                  padding: "15px 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span
                  style={{ font: "600 15px/1.4 var(--ft)", color: "var(--ink)" }}
                >
                  {ligne.gauche}
                </span>
                <span
                  className={styles.texteLie}
                  style={{
                    font: "400 14.5px/1.55 var(--fb)",
                    color: "var(--ink2)",
                  }}
                >
                  <TexteRiche texte={ligne.droite} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- grille (vrai tableau HTML) */

function Grille({
  surtitre,
  titre,
  intros,
  colonnes,
  lignes,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  colonnes: string[];
  lignes: string[][];
}) {
  if (!lignes.length) return null;
  const CASE: CSSProperties = { textAlign: "left", padding: "16px 20px" };
  return (
    <div style={LARGEUR}>
      <div style={SURTITRE}>{surtitre}</div>
      <Titre2
        texte={titre}
        echelle="clamp(28px,3vw,42px)/1.08"
        marge="0 0 18px"
        largeur="22ch"
      />
      {intros?.map((t) => (
        <Intro key={t} texte={t} police="16px/1.7" largeur="64ch" />
      ))}
      <div style={{ ...VERRE, overflowX: "auto", marginTop: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {colonnes.map((c) => (
                <th
                  key={c}
                  style={{
                    ...CASE,
                    font: "600 10.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => (
              <tr key={ligne.join("|")}>
                {ligne.map((case_, j) => (
                  <td
                    key={j}
                    className={styles.texteLie}
                    style={{
                      padding: "14px 20px",
                      borderTop: "1px solid var(--line)",
                      font: "400 14.5px/1.55 var(--fb)",
                      color: "var(--ink1)",
                      verticalAlign: "top",
                    }}
                  >
                    <TexteRiche texte={case_} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- encart */

function Encart({
  surtitre,
  titre,
  textes,
}: {
  surtitre: string;
  titre: string;
  textes: string[];
}) {
  if (!textes.length) return null;
  return (
    <div style={LARGEUR}>
      <div
        className={styles.deuxColonnes}
        style={{
          ...VERRE,
          boxShadow: "none",
          padding: "40px 44px",
          display: "grid",
          gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ ...SURTITRE, marginBottom: 14 }}>{surtitre}</div>
          <Titre2
            texte={titre}
            echelle="clamp(24px,2.4vw,32px)/1.12"
            interlettre="-.035em"
          />
        </div>
        <div>
          {textes.map((t) => (
            <Intro key={t} texte={t} police="16px/1.7" largeur="60ch" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- questions */

function Questions({
  surtitre,
  titre,
  intros,
  questions,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  questions: { question: string; reponse: string }[];
}) {
  if (!questions.length) return null;
  return (
    <div
      className={styles.deuxColonnes}
      style={{
        ...LARGEUR,
        display: "grid",
        gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
        gap: 52,
        alignItems: "start",
      }}
    >
      <div className={styles.colleEnHaut} style={{ position: "sticky", top: 110 }}>
        <div style={SURTITRE}>{surtitre}</div>
        <Titre2
          texte={titre}
          echelle="clamp(30px,3.3vw,48px)/1.06"
          marge="0 0 22px"
          largeur="14ch"
        />
        <a
          href="tel:+33478337205"
          className={styles.boutonOrange}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "15px 26px",
            borderRadius: 999,
            background: "var(--acc)",
            color: "#fff",
            font: "600 15px var(--fb)",
            whiteSpace: "nowrap",
            boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
            transition: "filter var(--tr),transform var(--tr)",
          }}
        >
          Poser ma question
        </a>
      </div>
      <div>
        {intros?.map((t) => (
          <Intro key={t} texte={t} police="16px/1.7" largeur="62ch" />
        ))}
        <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
          {questions.map((q, i) => (
            <details
              key={q.question}
              className={styles.pli}
              open={i === 0}
              style={{ ...VERRE, borderRadius: "var(--rad-s)" }}
            >
              <summary
                style={{
                  listStyle: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                  padding: "20px 24px",
                }}
              >
                <span
                  style={{
                    font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
                    letterSpacing: "-.022em",
                    color: "var(--ink)",
                  }}
                >
                  {q.question}
                </span>
                <span
                  className={styles.pliPlus}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    flex: "0 0 auto",
                    font: "400 20px/1 var(--fb)",
                    transition: "transform var(--tr),background var(--tr)",
                    background: "var(--chip)",
                    color: "var(--ink2)",
                  }}
                >
                  +
                </span>
              </summary>
              <div
                className={styles.texteLie}
                style={{
                  padding: "0 24px 22px",
                  font: "400 15px/1.7 var(--fb)",
                  color: "var(--ink2)",
                  maxWidth: "68ch",
                }}
              >
                <TexteRiche texte={q.reponse} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------- « Pour aller plus loin » */

function Liens({ items }: { items: { libelle: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <div style={LARGEUR}>
      <div style={SURTITRE}>Pour aller plus loin</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: 14,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={styles.carteLien}
            style={{
              ...VERRE,
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "transform var(--tr)",
            }}
          >
            {/* La capture porte une image en blob:, sans nom de fichier : le
                cadre reste, la photo attend d'être nommée (contrat : pas de
                photo inventée). */}
            <div style={{ height: 140, background: "var(--ph)", overflow: "hidden" }} />
            <div
              style={{
                padding: "18px 20px 20px",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  font: "600 16px/1.3 var(--ft)",
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                }}
              >
                {item.libelle}
              </span>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- l'aiguillage */

/** Une section du gabarit, rendue selon son `type`. `postuler` est rendu par
 *  la page (il porte le formulaire et son ancre), pas ici. */
export default function SectionFicheMetier({ section }: { section: SectionFiche }) {
  switch (section.type) {
    case "chiffres":
      return <Chiffres items={section.items} />;
    case "bento":
      return (
        <Enveloppe>
          <Bento {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "liste":
      return (
        <Enveloppe>
          <Liste {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "etapes":
      return (
        <Enveloppe>
          <Etapes {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "duo":
      return (
        <Enveloppe>
          <Duo {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "tableau":
      return (
        <Enveloppe>
          <Tableau {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "grille":
      return (
        <Enveloppe>
          <Grille {...section} />
          <Bande bande={section.bande} />
        </Enveloppe>
      );
    case "encart":
      return (
        <Enveloppe>
          <Encart {...section} />
        </Enveloppe>
      );
    case "faq":
      return (
        <Enveloppe>
          <Questions {...section} />
        </Enveloppe>
      );
    case "liens":
      return (
        <Enveloppe fin>
          <Liens items={section.items} />
        </Enveloppe>
      );
    default:
      return null;
  }
}
