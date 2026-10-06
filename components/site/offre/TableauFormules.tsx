import type { CSSProperties } from "react";

import { VERRE } from "@/components/site/blocs/habillage";
import type { Tableau } from "@/types/contenu";

/**
 * Le tableau comparatif sous les trois cartes de formule (maquette
 * `site-final.html`, l. 4147 à 4155).
 *
 * CE QUE LA MAQUETTE DESSINE, ET QUE LE SITE NE RENDAIT PAS DU TOUT : un bloc en
 * verre à coins arrondis, une grille `1.3fr 1fr 1fr 1fr` par rangée, une
 * première rangée en en-tête, quatre rangées de données, et la TROISIÈME colonne
 * mise en avant (celle de la formule recommandée, « Zéro Arrêt ») en
 * `var(--acc-ink)` et en graisse 600. La donnée était bien là
 * (`contenu.formulesTableau`, quatre en-têtes et quatre lignes), le type la
 * déclarait, et aucun composant ne la lisait : le rendu passait directement de
 * « Recevoir le tarif » à la bande « La règle ».
 *
 * LE REPLI MOBILE vient de `app/globals.css` : la classe `mg-cmp` est celle de la
 * maquette (l. 53), qui passe à deux colonnes sous 760 px avec la première
 * cellule sur toute la rangée. Rien n'est réinventé ici.
 *
 * LA COLONNE MISE EN AVANT est déduite, pas écrite dans la donnée : c'est la
 * colonne de la formule recommandée, et `Formules` la connaît déjà par
 * `formule.recommandee`. Elle est passée en propriété plutôt que devinée sur le
 * libellé de l'en-tête, qui changerait au premier renommage de formule.
 */

/** l. 4147, la rangée. La même grille sur l'en-tête et sur les données. */
const RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
  gap: 16,
  padding: "16px 28px",
  borderBottom: "1px solid var(--line)",
};

/** l. 4147, l'en-tête : plus d'air en haut. */
const RANGEE_ENTETE: CSSProperties = { ...RANGEE, padding: "18px 28px" };

/** l. 4147, une cellule d'en-tête. */
const CELLULE_ENTETE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};

/** l. 4147, la première cellule d'en-tête, plus pâle que les autres. */
const CELLULE_ENTETE_LIGNES: CSSProperties = {
  ...CELLULE_ENTETE,
  color: "var(--ink4)",
};

/** l. 4147, la colonne mise en avant : orange dès l'en-tête. */
const CELLULE_ENTETE_PHARE: CSSProperties = {
  ...CELLULE_ENTETE,
  color: "var(--acc)",
};

/** l. 4149, le libellé de ligne, en titre. */
const CELLULE_LIBELLE: CSSProperties = {
  font: "600 14.5px var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

/** l. 4149, une valeur ordinaire. */
const CELLULE: CSSProperties = {
  font: "400 14px/1.45 var(--fb)",
  color: "var(--ink2)",
};

/** l. 4149, la valeur de la colonne mise en avant. */
const CELLULE_PHARE: CSSProperties = {
  font: "600 14px/1.45 var(--fb)",
  color: "var(--acc-ink)",
};

/** l. 4146, l'enveloppe en verre qui rogne les coins des rangées. */
const CADRE: CSSProperties = {
  ...VERRE,
  overflow: "hidden",
  marginTop: 16,
};

export default function TableauFormules({
  tableau,
  /** Rang de la colonne mise en avant, en comptant la colonne des libellés. */
  colonnePhare,
}: {
  tableau: Tableau;
  colonnePhare?: number;
}) {
  const { entetes, lignes } = tableau;
  if (entetes.length === 0 || lignes.length === 0) return null;

  return (
    <div style={CADRE}>
      <div className="mg-cmp" style={RANGEE_ENTETE}>
        {entetes.map((entete, rang) => (
          <span
            key={entete}
            style={
              rang === 0
                ? CELLULE_ENTETE_LIGNES
                : rang === colonnePhare
                  ? CELLULE_ENTETE_PHARE
                  : CELLULE_ENTETE
            }
          >
            {entete}
          </span>
        ))}
      </div>

      {lignes.map((ligne, rangLigne) => (
        <div
          key={ligne[0] ?? rangLigne}
          className="mg-cmp"
          style={
            // La maquette retire le filet de la dernière rangée (l. 4154) :
            // sinon il doublerait la bordure du cadre.
            rangLigne === lignes.length - 1
              ? { ...RANGEE, borderBottom: "none" }
              : RANGEE
          }
        >
          {ligne.map((cellule, rangColonne) => (
            <span
              key={`${rangColonne}-${cellule}`}
              style={
                rangColonne === 0
                  ? CELLULE_LIBELLE
                  : rangColonne === colonnePhare
                    ? CELLULE_PHARE
                    : CELLULE
              }
            >
              {cellule}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
