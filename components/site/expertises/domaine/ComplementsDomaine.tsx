import type { CSSProperties } from "react";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { TABLEAU_EN_CARTES } from "@/components/site/expertises/mobile";
import m from "@/components/site/expertises/mobile.module.css";
import type { BlocComplementDomaine } from "@/types/domaine";

import type { ReponseDirecteCorpus } from "../corpus-mobile";

/**
 * Écran « Complément 2 » de l'accueil de rubrique `/expertises/types-de-maintenance/`,
 * relevé le 08/10 sur `maquette/rendu/expertises--types-de-maintenance.html`
 * (`data-screen-label="Complément 2"`, entre la réassurance et le problème) et
 * sur sa source, `MigenExpertise.dc.html` lignes 232 à 239 (`rest2`).
 * Le même écran des six types de maintenance du gabarit 05 Spécialité
 * (conditionnelle, corrective, curative, prédictive, préventive,
 * prévisionnelle) est rendu par ce composant : leur copie de la carte,
 * `specialite/ComplementSpecialite.tsx`, rendait le même bureau au pixel.
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
  /**
   * Ce que la fiche écrit et que le relais a perdu (`../corpus-mobile`,
   * `REPONSE_DIRECTE`) : le gras, et quelles listes elle numérote. Rendu au
   * téléphone seulement ; le bureau garde le texte du relais.
   */
  corpus?: ReponseDirecteCorpus;
}

/** Un paragraphe de la fiche tout en gras : la V3 en fait un titre de liste. */
const TOUT_GRAS = /^\*\*[^*]+\*\*$/;

/**
 * Le rôle d'un paragraphe au téléphone (V3) : titre de liste (tout en gras
 * dans la fiche, ou qui annonce une liste par « : »), chapeau (le premier),
 * sinon paragraphe.
 */
function roleDuTexte(texte: string, rang: number, fiche: string | undefined): string {
  if ((fiche && TOUT_GRAS.test(fiche)) || texte.trimEnd().endsWith(":")) return "titre";
  return rang === 0 ? "chapeau" : "";
}

/** Le texte du relais au bureau ; celui de la fiche, gras compris, au téléphone. */
function TexteDuBloc({ texte, fiche }: { texte: string; fiche: string | undefined }) {
  if (!fiche || TOUT_GRAS.test(fiche)) return texte;
  return (
    <>
      <span data-doublon-mobile="">{texte}</span>
      <span data-mobile-seulement="">
        <TexteRiche texte={fiche} />
      </span>
    </>
  );
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

const LISTE: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 };

const PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = {
  color: "var(--acc)",
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
  color: "var(--acc)",
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
  corpus,
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
        {/* `data-complement-domaine` : au téléphone, la carte en verre
            s'efface dans la carte « 01 La réponse directe » de la V3, qui
            l'enveloppe (`domaine/PageDomaine`), et ses blocs prennent les
            dessins de la V3 (voir `../mobile.module.css`). */}
        <div data-complement-domaine="" style={CARTE}>
          {retenus.map((bloc, rang) => (
            <div key={rang} style={{ minWidth: 0, paddingBottom: 18 }}>
              {bloc.titre ? (
                <div style={RANGEE_TITRE}>
                  <span aria-hidden="true" style={FILET} />
                  <h3 style={TITRE}>{bloc.titre}</h3>
                </div>
              ) : null}
              {/* Au téléphone (V3) : la première phrase en chapeau, une phrase
                  qui annonce une liste en titre de liste (`roleDuTexte`). */}
              {bloc.texte ? (
                <p
                  data-complement-texte={roleDuTexte(bloc.texte, rang, corpus?.textes[bloc.texte])}
                  style={TEXTE}
                >
                  <TexteDuBloc texte={bloc.texte} fiche={corpus?.textes[bloc.texte]} />
                </p>
              ) : null}
              {/* Au téléphone (V3) : une liste que la fiche numérote passe en
                  frise, une liste à puces en cartes numérotées (socle
                  `data-mm-kv`, comme « Ce que nous garantissons »). Sans
                  fiche, la frise. */}
              {bloc.puces?.length ? (
                <div
                  {...(!corpus ||
                  corpus.numerotees.includes((bloc.puces[0].accroche ?? bloc.puces[0].texte).trim())
                    ? { "data-puces-frise": "" }
                    : { "data-puces-cartes": "", "data-mm-kv": "", "data-mm-compteur": "" })}
                  style={LISTE}
                >
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
                /* Sous 881 px, une carte par ligne (`../mobile.module.css`),
                   chaque cellule portant l'intitulé de sa colonne en
                   `data-colonne`, lu par un `::before`. La légende des colonnes de la V3 au-dessus des cartes (les
                   en-têtes du tableau, que le lecteur d'écran lit déjà). */
                <>
                <div data-mobile-seulement="" aria-hidden="true" className={m.legendeMobile}>
                  {bloc.tableau.entetes.filter(Boolean).join(" · ")}
                </div>
                <div
                  className={TABLEAU_EN_CARTES}
                  data-tableau-en-cartes=""
                  style={CADRE_TABLEAU}
                  tabIndex={0}
                  role="region"
                  aria-label="Tableau, défilement horizontal possible"
                >
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
                            <td
                              key={colonne}
                              style={CELLULE}
                              data-colonne={
                                colonne > 0 ? bloc.tableau?.entetes[colonne] : undefined
                              }
                            >
                              {cellule}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
