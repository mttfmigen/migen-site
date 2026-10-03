import type { CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";

import styles from "./CandidaterCarriere.module.css";

/**
 * « Postuler », maquette lignes 3347 à 3480.
 *
 * LE FORMULAIRE DE LA MAQUETTE N'EST PAS REPRODUIT, ET C'EST VOLONTAIRE. Elle
 * dessine un parcours en quatre écrans avec dépôt de CV, puces de mobilité,
 * prétentions salariales et habilitations. Le site a UN formulaire, celui de
 * `components/formulaire/FormulaireContact.tsx`, qui porte sa validation
 * partagée avec la route serveur, son champ piège, sa mention RGPD et sa liste
 * fermée d'indicatifs. Le réécrire pour cette page, c'est refaire tout cela en
 * moins bien, et sans route qui reçoive un fichier.
 *
 * CE QUI TOMBE AVEC CE CHOIX, et qu'il faudra décider : le dépôt du CV, la
 * mobilité, les prétentions, les habilitations, la barre de progression.
 *
 * ÉCARTS DE COPIE qui en découlent, plus l'interdit de délai chiffré :
 *   · « Quatre écrans » devient « Un formulaire court », le parcours n'a plus
 *     quatre écrans ;
 *   · la maquette promet un dépôt dans l'outil de recrutement, un accusé de
 *     réception immédiat et un délai de réponse chiffré. Aucun des trois n'est
 *     tenu par la route `/api/lead`, donc aucun des trois n'est écrit.
 */

interface Repere {
  readonly valeur: string;
  readonly texte: string;
}

const REPERES: readonly Repere[] = [
  // La maquette écrit « 48 H » et « de délai de réponse ouvré ». Le chiffre
  // part, l'engagement reste.
  { valeur: "OUI", texte: "une réponse à chaque candidature, refus compris" },
  { valeur: "6", texte: "étapes de sélection, annoncées à l’avance" },
  { valeur: "0", texte: "compte à créer, aucune redirection" },
];

const LIGNE_REPERE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "14px",
  padding: "16px 20px",
  borderRadius: "var(--rad-s)",
  background: "var(--gsol)",
  border: "1px solid var(--line)",
};

export default function CandidaterCarriere() {
  return (
    <section
      id="candidater"
      style={{ padding: "var(--sec) 0 0", scrollMarginTop: 110 }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".62fr 1.38fr",
            gap: "44px",
            alignItems: "start",
          }}
        >
          <div
            className={styles.colonneFixe}
            style={{ position: "sticky", top: "112px" }}
          >
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "16px",
              }}
            >
              Postuler
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 18px",
                maxWidth: "18ch",
                textWrap: "balance",
              }}
            >
              {"Un formulaire court, et c’est un recruteur qui vous rappelle."}
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 26px",
                maxWidth: "40ch",
              }}
            >
              {
                "Dites-nous le métier que vous exercez, vos habilitations et le bassin où vous travaillez. Un recruteur reprend contact avec vous, et vous dit où en est votre candidature."
              }
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {REPERES.map((repere) => (
                <div key={repere.valeur} style={LIGNE_REPERE}>
                  <span
                    style={{
                      font: "600 11px var(--fb)",
                      letterSpacing: ".1em",
                      color: "var(--acc)",
                      flex: "none",
                      minWidth: "52px",
                    }}
                  >
                    {repere.valeur}
                  </span>
                  <span
                    style={{
                      font: "400 14px/1.5 var(--fb)",
                      color: "var(--ink1)",
                    }}
                  >
                    {repere.texte}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              minWidth: 0,
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              borderRadius: "var(--rad)",
              padding: "34px 36px 36px",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
            }}
          >
            {/* Pas de prop `titre` : la colonne de gauche porte déjà le h2 de
                la section, un second titre dédoublerait le plan du document. */}
            <FormulaireContact formulaire="carriere-candidature" />
          </div>
        </div>
      </div>
    </section>
  );
}
