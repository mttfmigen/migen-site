import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocEditorial } from "@/types/editorial";

import styles from "./Gabarit07.module.css";

/**
 * Les blocs de texte du GABARIT 07 MÉTIER, portés de
 * `maquette/gabarit-07-metier.html`.
 *
 * POURQUOI UN SECOND JEU DE BLOCS, alors que `components/site/editorial/` en a
 * déjà un. Les deux rendent le même type `BlocEditorial`, mais pas du tout le
 * même dessin. Le gabarit éditorial met une puce ronde orange devant un item de
 * liste ; le gabarit 07 enferme la liste entière dans une carte de verre et
 * coche chaque entrée. Il numérote les listes ordonnées sur une frise verticale,
 * là où le gabarit éditorial laisse le `list-style: decimal` du navigateur.
 * Recopier l'un dans l'autre, c'est exactement la confusion qui a fait servir
 * ces pages par le mauvais gabarit pendant des semaines.
 *
 * TOUTES LES VALEURS VIENNENT DU FICHIER DE MAQUETTE, et
 * `scripts/verifie-metier-maquette.tsx` les y RELIT à chaque exécution : il ne
 * compare pas ce fichier à une note prise une fois, il compare le HTML rendu
 * aux chaînes du fichier de la maquette.
 *
 * Composants SERVEUR. Aucun état : les survols sont dans le module CSS, un
 * style en ligne ne pouvant pas en porter.
 */

/** La carte de verre du gabarit 07. Son ombre n'a qu'une passe, à la différence
 *  de `habillage.ts`, qui en porte deux pour la page d'offre. */
export const VERRE07: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

/** Surtitre orange du gabarit 07, au-dessus d'un H2 de section. */
export const SURTITRE07: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

/** Le H2 des sections de fin, « Questions fréquentes » et « Maillage ». */
export const TITRE07: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
};

/** Le numéro de section, en chasse fixe orange. */
export const NUMERO07: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
};

/** Le téléphone de l'agence, relu dans la maquette par le contrôle. */
export const TELEPHONE = "04 78 33 72 05";
export const TEL_HREF = "tel:+33478337205";

/**
 * Le bouton de candidature.
 *
 * LA MAQUETTE ÉCRIT `/carriere/#postuler`, et cette ancre N'EXISTE PAS sur le
 * site : rien ne porte `id="postuler"`. Le formulaire de candidature est posé en
 * bas de CHAQUE page du cocon par `FormulaireBasDePage`, sous `id="formulaire"`.
 * Le bouton vise donc cette ancre-là : même geste, même intention, une cible qui
 * existe. Un bouton qui ne mène nulle part est pire qu'un bouton déplacé.
 */
export const CTA_LIBELLE = "Candidater";
export const CTA_CIBLE = "#formulaire";

/** Le paragraphe courant du corps. */
const PARAGRAPHE07: CSSProperties = {
  font: "400 16.5px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 18px",
  maxWidth: "68ch",
  textWrap: "pretty",
};

/** La citation encadrée, sur fond orange très pâle. */
const CITATION07: CSSProperties = {
  margin: "8px 0 24px",
  padding: "20px 24px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
  border: "1px solid rgba(255,124,60,.28)",
  font: "500 15.5px/1.65 var(--fb)",
  color: "var(--ink)",
};

/**
 * La citation est-elle l'appel à l'action de la maquette ?
 *
 * La maquette tranche sur la PRÉSENCE DU TÉLÉPHONE dans la citation : une
 * citation qui donne le numéro devient le panneau sombre à deux boutons, les
 * autres restent des encadrés. C'est sa règle, recopiée telle quelle.
 */
function estAppel(texte: string): boolean {
  return texte.includes(TELEPHONE);
}

/** Le panneau sombre d'appel, posé au fil du texte. */
function Appel({ texte }: { texte: string }) {
  return (
    <div
      style={{
        margin: "14px 0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        padding: "24px 26px",
        borderRadius: 24,
        background: "var(--panel)",
      }}
    >
      <div
        className={styles.appelTexte}
        style={{
          font: "500 15.5px/1.6 var(--fb)",
          color: "rgba(255,255,255,.8)",
          flex: 1,
          minWidth: 240,
        }}
      >
        <TexteRiche texte={texte} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          href={CTA_CIBLE}
          className={styles.boutonAccent}
          style={{
            padding: "12px 20px",
            borderRadius: 999,
            background: "var(--acc)",
            color: "#fff",
            font: "600 14px var(--fb)",
            whiteSpace: "nowrap",
          }}
        >
          {CTA_LIBELLE}
        </a>
        <a
          href={TEL_HREF}
          className={styles.boutonSombre}
          style={{
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "#fff",
            font: "600 14px var(--fb)",
            whiteSpace: "nowrap",
          }}
        >
          {TELEPHONE}
        </a>
      </div>
    </div>
  );
}

/** Le texte d'un item de liste ou d'une cellule : gras d'attaque puis suite. */
function Texte({ accroche, texte }: { accroche?: string; texte: string }) {
  return (
    <>
      {accroche ? (
        <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
          <TexteRiche texte={accroche} />{" "}
        </strong>
      ) : null}
      <TexteRiche texte={texte} />
    </>
  );
}

/** La liste cochée, dans sa carte de verre. */
function Cochee({ items }: { items: { accroche?: string; texte: string }[] }) {
  return (
    <ul
      style={{
        ...VERRE07,
        display: "grid",
        gap: 10,
        margin: "4px 0 22px",
        padding: "22px 24px",
        borderRadius: "var(--rad-s)",
        listStyle: "none",
      }}
    >
      {items.map((item, i) => (
        // L'index suffit comme clé : l'ordre du tableau EST le texte, il ne se
        // réarrange jamais.
        <li
          key={`${i}-${item.texte.slice(0, 24)}`}
          style={{
            display: "flex",
            gap: 12,
            font: "400 15.5px/1.6 var(--fb)",
            color: "var(--ink1)",
          }}
        >
          {/* Décorative : la liste porte déjà le sens. Annoncée, elle ferait
              dire « coche » au lecteur d'écran avant chaque entrée. */}
          <span
            aria-hidden="true"
            style={{ color: "var(--acc)", flex: "none", fontWeight: 600 }}
          >
            ✓
          </span>
          <span>
            <Texte accroche={item.accroche} texte={item.texte} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** La liste ordonnée, en frise verticale numérotée. */
function Frise({ items }: { items: { accroche?: string; texte: string }[] }) {
  return (
    <div style={{ position: "relative", margin: "6px 0 24px" }}>
      {/* Le rail de la frise. Purement décoratif. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 19,
          top: 20,
          bottom: 20,
          width: 2,
          background: "var(--line)",
        }}
      />
      <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, i) => (
          <li
            key={`${i}-${item.texte.slice(0, 24)}`}
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "40px minmax(0,1fr)",
              gap: 18,
              padding: "0 0 18px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "var(--acc)",
                color: "#fff",
                font: "600 13px/40px var(--fb)",
                textAlign: "center",
                boxShadow: "0 0 0 6px var(--bg)",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              style={{
                font: "400 15.5px/1.65 var(--fb)",
                color: "var(--ink1)",
                paddingTop: 8,
              }}
            >
              <Texte accroche={item.accroche} texte={item.texte} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Le tableau, dans sa carte de verre, qui défile plutôt que de déborder. */
function Tableau07({
  entetes,
  lignes,
}: {
  entetes: string[];
  lignes: string[][];
}) {
  return (
    <div
      style={{
        ...VERRE07,
        overflowX: "auto",
        margin: "6px 0 26px",
        borderRadius: "var(--rad-s)",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}
      >
        <thead>
          <tr>
            {entetes.map((entete) => (
              <th
                key={entete}
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "14px 18px",
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, i) => (
            <tr key={`${i}-${ligne[0] ?? ""}`}>
              {ligne.map((cellule, j) => (
                <td
                  key={`${j}-${cellule.slice(0, 16)}`}
                  style={{
                    padding: "13px 18px",
                    verticalAlign: "top",
                    borderTop: "1px solid var(--line)",
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink1)",
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
}

/**
 * Un bloc du corpus, rendu au dessin du gabarit 07.
 *
 * `titre` de niveau 2 n'arrive JAMAIS ici : il borne les sections, et c'est
 * `scripts/produit-metier-maquette.mjs` qui a fait ce découpage. Le rencontrer
 * voudrait dire que la donnée n'a pas été produite par ce script, et le rendre
 * en H2 au fil du texte doublerait les titres de section.
 */
export default function Bloc07({ bloc }: { bloc: BlocEditorial }) {
  switch (bloc.type) {
    case "titre":
      if (bloc.niveau === 2) return null;
      return (
        <h3
          id={bloc.id}
          style={{
            font: "600 calc(21px * var(--ts))/1.3 var(--ft)",
            letterSpacing: "-.025em",
            margin: "30px 0 12px",
            display: "flex",
            gap: 12,
            alignItems: "baseline",
            scrollMarginTop: 110,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 3,
              borderRadius: 999,
              background: "var(--acc)",
              flex: "none",
              transform: "translateY(-5px)",
            }}
          />
          {bloc.texte}
        </h3>
      );

    case "paragraphe":
      return (
        <p className={styles.corpus} style={PARAGRAPHE07}>
          <Texte accroche={bloc.accroche} texte={bloc.texte} />
        </p>
      );

    case "liste":
      return (
        <div className={styles.corpus}>
          {bloc.ordonnee ? (
            <Frise items={bloc.items} />
          ) : (
            <Cochee items={bloc.items} />
          )}
        </div>
      );

    case "tableau":
      return (
        <div className={styles.corpus}>
          <Tableau07 entetes={bloc.entetes} lignes={bloc.lignes} />
        </div>
      );

    case "citation":
      return estAppel(bloc.texte) ? (
        <Appel texte={bloc.texte} />
      ) : (
        <div className={styles.corpus} style={CITATION07}>
          <TexteRiche texte={bloc.texte} />
        </div>
      );
  }
}
