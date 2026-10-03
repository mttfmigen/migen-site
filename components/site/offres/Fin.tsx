import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  LARGEUR,
  VERRE,
} from "@/components/site/blocs/habillage";
import type { ContenuOffres } from "@/types/offres";

import { SURTITRE_OFFRES, TITRE2_OFFRES } from "./habillage";

/**
 * Le bloc de fin, en grande carte de verre. Maquette lignes 2052 à 2063.
 *
 * `border-radius:36px` n'est pas une coquette : `app/globals.css` cible cette
 * valeur littérale pour resserrer la carte sous 760px
 * (`.mg-site [style*="border-radius:36px"]`). La changer casserait son
 * adaptation mobile.
 *
 * CE QUE LA MAQUETTE ÉCRIT ICI ET QUI NE PART PAS. « Aucune des six ne colle ? »
 * compte six offres là où elle en dessine cinq et où la base en porte dix : le
 * compte est retiré du surtitre, il n'est pas remplacé par un autre. Et
 * « Décrivez la situation en cinq lignes. » cède la place à la question du
 * corpus, qui est le texte du client pour cet emplacement.
 */
export default function Fin({ fin }: { fin: NonNullable<ContenuOffres["fin"]> }) {
  return (
    <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          style={{
            ...VERRE,
            borderRadius: 36,
            padding: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 44,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={SURTITRE_OFFRES}>{fin.surtitre}</div>
            {/* La maquette pose le H2 commun puis le rabaisse d'un cran par un
                `font-size` qui suit : les deux déclarations sont recopiées dans
                cet ordre, sinon la taille rendue ne serait pas la sienne. */}
            <h2
              style={{
                ...TITRE2_OFFRES,
                maxWidth: "26ch",
                marginBottom: 12,
                fontSize: "calc(clamp(24px,2.6vw,36px) * var(--ts))",
              }}
            >
              <TexteRiche texte={fin.question} />
            </h2>
            {fin.rappel ? (
              <p
                className={blocs.corpus}
                style={{
                  font: "400 16px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                  maxWidth: "52ch",
                }}
              >
                <TexteRiche texte={fin.rappel} />
              </p>
            ) : null}
          </div>

          <a
            href={fin.href ?? ANCRE_FORMULAIRE}
            className={blocs.boutonAction}
            style={{
              ...BOUTON_ACTION,
              flex: "none",
              padding: "16px 30px",
              fontSize: "15.5px",
            }}
          >
            {fin.bouton}
          </a>
        </div>
      </div>
    </section>
  );
}
