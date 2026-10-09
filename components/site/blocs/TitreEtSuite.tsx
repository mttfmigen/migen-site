import type { CSSProperties } from "react";

/**
 * Un titre de carte et son texte, rendus en UNE phrase quand le texte continue
 * le titre.
 *
 * LE DÉFAUT QU'IL CORRIGE, signalé par Mehdi le 09/10 sur les études de cas.
 * Le corpus du client écrit une puce en une seule phrase, le début en gras :
 *
 *     - **Disposer d'un profil opérationnel tout de suite**, pas d'un renfort à former.
 *
 * Le portage a mis le gras dans `titre` et la suite dans `texte`, et les deux
 * se rendaient en BLOCS SÉPARÉS, le second avec 6 px de marge haute. Le
 * visiteur lisait donc deux lignes, la seconde ouverte par une virgule :
 *
 *     Disposer d'un profil opérationnel tout de suite
 *     , pas d'un renfort à former.
 *
 * LA MAQUETTE PORTE LE MÊME DÉFAUT (`maquette/rendu/preuves--autoliv.html`,
 * `data-dc-tpl="64"` puis `"66"`, deux `div` dont le second a
 * `margin-top: 6px`), donc la capture ne pouvait pas le signaler et aucun
 * contrôle de gabarit ne le voyait : la comparaison est pixel à pixel, et
 * elle trouvait les deux lignes de part et d'autre.
 *
 * CE N'EST PAS LE MÊME CAS QUE LES MOIGNONS DE `/expertises/`, et c'est le
 * piège. Là-bas, 7 paragraphes ouverts par une virgule suivent une `accroche`
 * sœur rendue EN LIGNE : la phrase se lit d'un trait, la maquette fait foi, et
 * `verifie-phrases-estropiees` les absout exprès. Ici le titre est un bloc, la
 * phrase est coupée en deux lignes, et aucune lecture ne la raccommode.
 *
 * LE REMÈDE NE CHANGE AUCUN MOT. Quand `texte` commence par une virgule ou un
 * point-virgule, titre et suite sont rendus dans le MÊME bloc, le titre en
 * ligne : la phrase du corpus revient telle quelle. Sinon, rien ne change, les
 * deux blocs restent. C'est un écart de mise en page déclaré à la maquette,
 * assumé parce qu'une ligne qui s'ouvre sur une virgule ne veut rien dire.
 *
 * Porte : scripts/verifie-suites-de-titre.mjs
 */

/** Le texte continue-t-il la phrase du titre ? */
export const continueLeTitre = (texte: string | undefined): boolean =>
  typeof texte === "string" && /^\s*[,;]/.test(texte);

export default function TitreEtSuite({
  titre,
  texte,
  styleTitre,
  styleTexte,
}: {
  titre?: string;
  texte?: string;
  styleTitre: CSSProperties;
  styleTexte: CSSProperties;
}) {
  if (titre && continueLeTitre(texte)) {
    /* Les marges verticales des deux blocs n'ont plus de sens dans une phrase
       d'un seul tenant : elles écarteraient le titre de sa propre suite. Elles
       vivent tantôt sur le texte (`marginTop: 6` des objectifs), tantôt sur le
       titre (`marginBottom: 10` des cartes de réponse). */
    const { marginTop: _mt, marginBottom: _mb, ...suite } = styleTexte;
    const { marginTop: _mt2, marginBottom: _mb2, ...tete } = styleTitre;
    return (
      <div style={suite}>
        <span style={{ ...tete, display: "inline" }}>{titre}</span>
        {texte}
      </div>
    );
  }
  return (
    <>
      {titre ? <div style={styleTitre}>{titre}</div> : null}
      {texte ? <div style={styleTexte}>{texte}</div> : null}
    </>
  );
}
