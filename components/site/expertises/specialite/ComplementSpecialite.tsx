import type { CSSProperties } from "react";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";
import type { BlocComplementDomaine } from "@/types/domaine";

/**
 * Écran « Complément 2 » du gabarit 05 Spécialité : la longue prose que six
 * types de maintenance placent entre la réassurance et la problématique
 * (conditionnelle, corrective, curative, prédictive, préventive,
 * prévisionnelle ; 332 mots sur la préventive). Relevé le 08/10 sur ces six
 * captures et sur la source, `MigenExpertise.dc.html` lignes 232 à 237
 * (`rest2`, objets `rb`).
 *
 * POURQUOI PAS `offre/ComplementsOffre` : c'est la même carte en verre, mais
 * elle ne sait pas poser de TABLEAU (`rb.isTable`), et les six captures en
 * portent un à trois. Ce composant est partagé hors du périmètre de ce
 * gabarit : la carte est recopiée ici de la source, valeur pour valeur, avec
 * le tableau. « Complément 4 » reste rendu par `ComplementsOffre`, aucune des
 * seize captures qui le portent n'y posant de tableau.
 *
 * Chaque bloc est UNE cellule de la grille (`auto-fit`, 420 px) et porte un
 * seul contenu : un paragraphe, une liste à coches ou un tableau, sous un
 * titre facultatif (aucune des six captures n'en rend).
 */

export interface ProprietesComplementSpecialite {
  blocs: readonly BlocComplementDomaine[];
}

const SECTION_COMPLEMENT: CSSProperties = { padding: "48px 0 0" };

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "30px 34px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  gap: "4px 44px",
};

const BLOC: CSSProperties = { minWidth: 0, paddingBottom: 18 };

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

const ACCROCHE: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

const CADRE_TABLEAU: CSSProperties = {
  overflowX: "auto",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  background: "var(--card)",
};

const TABLEAU: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480,
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

export default function ComplementSpecialite({
  blocs,
}: ProprietesComplementSpecialite) {
  const retenus = blocs.filter(
    (bloc) =>
      !!bloc.titre ||
      !!bloc.texte ||
      !!bloc.puces?.length ||
      !!bloc.tableau?.lignes.length,
  );
  if (retenus.length === 0) return null;

  return (
    <section style={SECTION_COMPLEMENT}>
      <div style={LARGEUR}>
        <div style={CARTE}>
          {retenus.map((bloc, rang) => (
            <div key={rang} style={BLOC}>
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
                    <div key={`${puce.accroche ?? ""}${puce.texte}`} style={PUCE}>
                      {/* Ornement de liste : il n'énonce rien. */}
                      <span aria-hidden="true" style={COCHE}>
                        ✓
                      </span>
                      <span>
                        {puce.accroche ? (
                          <>
                            <strong style={ACCROCHE}>{puce.accroche}</strong>{" "}
                          </>
                        ) : null}
                        {puce.texte}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {bloc.tableau?.lignes.length ? (
                <div style={CADRE_TABLEAU}>
                  <table style={TABLEAU}>
                    <thead>
                      <tr>
                        {bloc.tableau.entetes.map((entete, colonne) => (
                          <th key={colonne} style={ENTETE}>
                            {entete}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bloc.tableau.lignes.map((ligne, rangee) => (
                        <tr key={rangee}>
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
