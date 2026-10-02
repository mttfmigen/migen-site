import type { CSSProperties, ReactNode } from "react";
import type { Preuve, SectionPreuves } from "@/types/contenu";
import styles from "./Blocs.module.css";
import { colonnes, LARGEUR, SECTION, SURTITRE, TITRE2 } from "./habillage";
import TexteRiche from "./TexteRiche";

const CARTE: CSSProperties = {
  display: "block",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  boxShadow: "0 1px 1px rgba(0,0,0,.04)",
};

/** Le contenu d'une carte, cliquable ou non. */
function Contenu({ preuve }: { preuve: Preuve }): ReactNode {
  // Toute la carte est un lien quand l'étude de cas existe. Un lien du corpus
  // rendu là-dedans produirait un `<a>` à l'intérieur d'un `<a>`, que le
  // navigateur referme à sa façon : la carte se casse. Le corpus actuel ne met
  // jamais les deux ensemble (60 liens dans `titre`, aucun sur une carte
  // cliquable), ce garde-fou empêche qu'une relecture future le fasse.
  const riche = !preuve.lienHref;

  return (
    <div className={styles.corpus} style={{ padding: "24px 26px 28px" }}>
      <div
        style={{
          font: "600 19px/1.3 var(--ft)",
          letterSpacing: "-.025em",
          color: "var(--ink)",
        }}
      >
        {riche ? <TexteRiche texte={preuve.titre} /> : preuve.titre}
      </div>
      {preuve.texte ? (
        <div
          style={{
            font: "400 14px/1.6 var(--fb)",
            color: "var(--ink2)",
            marginTop: 12,
          }}
        >
          {riche ? <TexteRiche texte={preuve.texte} /> : preuve.texte}
        </div>
      ) : null}
      {preuve.lienLibelle ? (
        <div
          style={{
            font: "600 13.5px var(--fb)",
            color: "var(--acc)",
            marginTop: 14,
          }}
        >
          {preuve.lienLibelle} →
        </div>
      ) : null}
    </div>
  );
}

/**
 * Section 8 du gabarit : trois à six réalisations courtes.
 *
 * La carte de la maquette porte une photo et une date. Le corpus n'en fournit
 * ni l'une ni l'autre : la zone d'image n'est donc pas rendue du tout, plutôt
 * qu'affichée vide ou remplie d'un visuel choisi au hasard.
 *
 * Toute la carte est cliquable quand l'étude de cas existe. Le libellé du lien
 * est dans la carte, donc le nom accessible du lien est celui de la réalisation.
 */
export default function Preuves({ section }: { section: SectionPreuves }) {
  if (section.preuves.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ marginBottom: 38 }}>
          <div style={SURTITRE}>Nos dernières réalisations</div>
          <h2 style={{ ...TITRE2, maxWidth: "24ch" }}>
            {section.titre ?? "Ce que nous avons fait, chez qui, et comment"}
          </h2>
        </div>

        <div
          className="mg-rmulti"
          style={{ ...colonnes(Math.min(section.preuves.length, 3)), gap: 16 }}
        >
          {section.preuves.map((preuve) =>
            preuve.lienHref ? (
              <a
                key={preuve.titre}
                href={preuve.lienHref}
                className={styles.cartePreuve}
                style={CARTE}
              >
                <Contenu preuve={preuve} />
              </a>
            ) : (
              <div key={preuve.titre} style={CARTE}>
                <Contenu preuve={preuve} />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
