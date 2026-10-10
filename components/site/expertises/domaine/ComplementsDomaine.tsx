import type { CSSProperties } from "react";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";
import type { BlocComplementDomaine } from "@/types/domaine";

/**
 * Écran « Complément 2 » de l'accueil de rubrique `/expertises/types-de-maintenance/`,
 * relevé le 08/10 sur `maquette/rendu/expertises--types-de-maintenance.html`
 * (`data-screen-label="Complément 2"`, entre la réassurance et le problème) et
 * sur sa source, `MigenExpertise.dc.html` lignes 232 à 239 (`rest2`).
 *
 * C'EST LA CARTE EN VERRE DE « Complément 4 », AVEC LE TABLEAU EN PLUS : la
 * capture y pose deux paragraphes, la typologie « Type / Ce qui déclenche
 * l'intervention / Objectif / Idéal pour » (`rb.isTable`), une phrase et quatre
 * puces cochées. `ComplementsOffre` dessine la carte, mais pas le tableau, et
 * il écarte un bloc qui n'a ni titre, ni texte, ni puces.
 *
 * ponytail: carte, titre, paragraphe et puces recopiés de `ComplementsOffre`
 * (partagé, hors du périmètre de ce gabarit) ; le jour où il accepte
 * `tableau`, ce fichier se supprime au profit d'une ligne d'import.
 */

export interface ProprietesComplementsDomaine {
  blocs: readonly BlocComplementDomaine[];
}

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "30px 34px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  gap: "4px 44px",
};

const RANGEE_TITRE: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "baseline",
  marginBottom: 10,
};

const FILET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};

const TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: 0,
};

const TEXTE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "66ch",
  textWrap: "pretty",
};

const LISTE: CSSProperties = { display: "grid", gap: 10 };

const PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = {
  // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
  color: "var(--acc-ink)",
  flex: "0 0 auto",
  fontWeight: 600,
};

/* Le tableau, l. 237 de la source. */
const CADRE_TABLEAU: CSSProperties = {
  overflowX: "auto",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  background: "var(--card)",
};

const ENTETE: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
  color: "var(--acc-ink)",
  borderBottom: "1px solid var(--line)",
};

const CELLULE: CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "top",
  borderTop: "1px solid var(--line)",
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink1)",
};

export default function ComplementsDomaine({
  blocs,
}: ProprietesComplementsDomaine) {
  const retenus = blocs.filter(
    (bloc) =>
      !!bloc.titre ||
      !!bloc.texte ||
      !!bloc.puces?.length ||
      !!bloc.tableau?.lignes.length,
  );
  if (retenus.length === 0) return null;

  return (
    <section style={{ padding: "48px 0 0" }}>
      <div style={LARGEUR}>
        <div style={CARTE}>
          {retenus.map((bloc, rang) => (
            <div key={rang} style={{ minWidth: 0, paddingBottom: 18 }}>
              {bloc.titre ? (
                <div style={RANGEE_TITRE}>
                  <span aria-hidden="true" style={FILET} />
                  <h3 style={TITRE}>{bloc.titre}</h3>
                </div>
              ) : null}
              {bloc.texte ? <p style={TEXTE}>{bloc.texte}</p> : null}
              {bloc.puces?.length ? (
                <div style={LISTE}>
                  {bloc.puces.map((puce) => (
                    <div key={puce.accroche ?? puce.texte} style={PUCE}>
                      <span aria-hidden="true" style={COCHE}>
                        ✓
                      </span>
                      <span>
                        {puce.accroche ? (
                          <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                            {puce.accroche}
                          </strong>
                        ) : null}
                        {puce.accroche ? " " : null}
                        {puce.texte}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {bloc.tableau?.lignes.length ? (
                <div style={CADRE_TABLEAU}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 480,
                    }}
                  >
                    <thead>
                      <tr>
                        {bloc.tableau.entetes.map((entete) => (
                          <th key={entete} scope="col" style={ENTETE}>
                            {entete}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bloc.tableau.lignes.map((ligne) => (
                        <tr key={ligne.join("|")}>
                          {ligne.map((cellule, colonne) => (
                            <td key={colonne} style={CELLULE}>
                              {cellule}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
