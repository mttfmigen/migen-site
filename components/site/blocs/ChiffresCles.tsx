import type { SectionChiffres } from "@/types/contenu";
import Paragraphes from "./Paragraphes";
import {
  CHAPEAU,
  colonnes,
  ENTETE,
  LARGEUR,
  SECTION,
  SURTITRE,
  TITRE2,
  VERRE,
} from "./habillage";

/** La maquette écrit ce titre en dur. Une page qui donne trois chiffres en fournit un autre. */
const TITRE_PAR_DEFAUT = "Le cadre, en quatre chiffres.";

/**
 * Section 2 du gabarit : trois à quatre chiffres vérifiables, puis la réponse
 * directe à la question que pose la page.
 *
 * C'est le seul élément de réassurance qui survit à un défilement rapide, d'où
 * sa place immédiatement sous le héros et son habillage en cartes de verre.
 */
export default function ChiffresCles({ section }: { section: SectionChiffres }) {
  if (section.chiffres.length === 0 && !section.reponse?.length) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>En bref</div>
            <h2 style={TITRE2}>{section.titre ?? TITRE_PAR_DEFAUT}</h2>
          </div>
          {section.bref ? <p style={CHAPEAU}>{section.bref}</p> : null}
        </div>

        {section.chiffres.length > 0 ? (
          <div
            className="mg-rmulti"
            style={colonnes(Math.min(section.chiffres.length, 4))}
          >
            {section.chiffres.map((chiffre) => (
              <div
                key={chiffre.valeur + chiffre.libelle}
                style={{ ...VERRE, padding: "26px 26px 28px" }}
              >
                <div
                  style={{
                    font: "600 calc(34px * var(--ts))/1 var(--ft)",
                    letterSpacing: "-.05em",
                    color: "var(--acc)",
                  }}
                >
                  {chiffre.valeur}
                </div>
                <div
                  style={{
                    font: "600 14.5px var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                    marginTop: 12,
                  }}
                >
                  {chiffre.libelle}
                </div>
                {chiffre.detail ? (
                  <div
                    style={{
                      font: "400 13.5px/1.5 var(--fb)",
                      color: "var(--ink3)",
                      marginTop: 5,
                    }}
                  >
                    {chiffre.detail}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <Paragraphes paragraphes={section.reponse} />
      </div>
    </section>
  );
}
