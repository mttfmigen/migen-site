import type { ReactNode } from "react";
import type { SectionHeros } from "@/types/contenu";
import styles from "./Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  lienTelephone,
} from "./habillage";

/**
 * Section 1 du gabarit : la promesse, le mécanisme, l'action.
 *
 * `encart` reçoit ce que la maquette place en seconde colonne : le formulaire
 * court, ou un visuel. Le bloc ne le fabrique pas, il lui fait sa place. Sans
 * encart, le héros occupe toute la largeur au lieu de garder une colonne vide.
 *
 * Les trois chiffres en bandeau de la maquette ne sont pas portés : ils y sont
 * écrits en dur (« 5 agences en France », « +200 clients ») et contredisent les
 * faits autorisés du projet. Les chiffres de la page viennent de la section 2.
 */
export default function Heros({
  section,
  encart,
}: {
  section: SectionHeros;
  encart?: ReactNode;
}) {
  const colonne = (
    <div>
      <h1
        style={{
          font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
          letterSpacing: "-.045em",
          color: "var(--ink)",
          margin: 0,
          maxWidth: "16ch",
          textWrap: "balance",
        }}
      >
        {section.h1}
      </h1>

      <p
        style={{
          font: "400 17.5px/1.65 var(--fb)",
          color: "var(--ink2)",
          margin: "26px 0 0",
          maxWidth: "48ch",
        }}
      >
        {section.mecanisme}
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 26,
          flexWrap: "wrap",
        }}
      >
        <a
          href={ANCRE_FORMULAIRE}
          className={styles.boutonAction}
          style={BOUTON_ACTION}
        >
          {section.cta}
        </a>
        <a
          href={lienTelephone(section.telephone)}
          className={styles.boutonSecondaire}
          style={BOUTON_SECONDAIRE}
        >
          {section.telephone}
        </a>
      </div>

      <div
        style={{
          marginTop: 34,
          paddingTop: 26,
          borderTop: "1px solid var(--line)",
        }}
      >
        <p
          style={{
            font: "400 15px/1.6 var(--fb)",
            color: "var(--ink2)",
            margin: 0,
            maxWidth: "52ch",
          }}
        >
          {section.phraseDelai}
        </p>
      </div>
    </div>
  );

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      {encart ? (
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.12fr .88fr",
            gap: 52,
            alignItems: "start",
          }}
        >
          {colonne}
          <div style={{ position: "relative" }}>{encart}</div>
        </div>
      ) : (
        colonne
      )}
    </section>
  );
}
