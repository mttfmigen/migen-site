import type { CSSProperties } from "react";
import type { SectionOffre, Tableau } from "@/types/contenu";
import styles from "./Blocs.module.css";
import Paragraphes from "./Paragraphes";
import TexteRiche from "./TexteRiche";
import {
  CHAPEAU,
  ENTETE,
  LARGEUR,
  PROSE_FORT,
  SECTION,
  SURTITRE,
  TITRE2,
  VERRE,
} from "./habillage";

/**
 * En-têtes du duo prestation / bénéfice. Communs aux 116 pages du corpus, qui
 * écrivent tous leur section 4 avec ces deux colonnes : une liste technique
 * seule ne vend pas, le décideur n'est pas le technicien.
 */
const ENTETE_PRESTATION = "Ce que nous faisons";
const ENTETE_BENEFICE = "Ce que ça change pour vous";

/**
 * Le surtitre de la section, relevé dans la maquette : « Le périmètre »,
 * `site-final.html` l. 1881, l'en-tête de `sp-include`, qui EST cette section vue
 * par le gabarit de vente.
 *
 * IL DISAIT « Ce qui est inclus » JUSQU'ICI, et c'était un défaut à deux titres :
 * cette chaîne est le surtitre de la section 8 de la PAGE D'OFFRE (maquette
 * l. 4280), rendue plus haut sur la même page par
 * `components/site/offre/CeQuiEstInclus.tsx` ; et la maquette ne l'écrit pas
 * au-dessus de ce tableau. Un mot de la maquette remplace un mot deviné.
 */
const SURTITRE_SECTION = "Le périmètre";

const CELLULE_ENTETE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};

const LIGNE: CSSProperties = {
  display: "grid",
  gap: 16,
  padding: "16px 28px",
  borderBottom: "1px solid var(--line)",
};

/** Le tableau comparatif, quand la page en porte un. Même grille que les lignes. */
function TableauComparatif({ tableau }: { tableau: Tableau }) {
  const grille = `1.3fr repeat(${Math.max(1, tableau.entetes.length - 1)},1fr)`;

  return (
    <div
      style={{ ...VERRE, overflow: "hidden", marginTop: 16 }}
    >
      <div
        className="mg-cmp"
        style={{
          display: "grid",
          gridTemplateColumns: grille,
          gap: 16,
          padding: "18px 28px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {tableau.entetes.map((entete, colonne) => (
          <span
            key={entete || `colonne-${colonne}`}
            style={{
              ...CELLULE_ENTETE,
              color: colonne === 0 ? "var(--ink4)" : "var(--ink3)",
            }}
          >
            {entete}
          </span>
        ))}
      </div>

      {tableau.lignes.map((ligne, rang) => (
        <div
          key={ligne[0] ?? `ligne-${rang}`}
          className="mg-cmp"
          style={{
            ...LIGNE,
            gridTemplateColumns: grille,
            borderBottom:
              rang === tableau.lignes.length - 1
                ? undefined
                : "1px solid var(--line)",
          }}
        >
          {ligne.map((cellule, colonne) =>
            colonne === 0 ? (
              <span
                key={`${rang}-${colonne}`}
                style={{
                  font: "600 14.5px var(--ft)",
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                }}
              >
                <TexteRiche texte={cellule} />
              </span>
            ) : (
              <span
                key={`${rang}-${colonne}`}
                style={{
                  font: "400 14px/1.45 var(--fb)",
                  color: "var(--ink2)",
                }}
              >
                <TexteRiche texte={cellule} />
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Section 4 du gabarit : prestations ET bénéfices côte à côte, et le tableau
 * comparatif quand la page en porte un.
 *
 * `.mg-cmp` est repris de la maquette : sous 760px, la grille passe à deux
 * colonnes et la première cellule prend toute la largeur, ce qui garde la ligne
 * lisible au lieu de la casser.
 */
export default function Offre({ section }: { section: SectionOffre }) {
  if (section.lignes.length === 0 && !section.tableau && !section.prose?.length) {
    return null;
  }

  return (
    <section className={styles.corpus} style={SECTION}>
      <div style={LARGEUR}>
        {/*
          LE SURTITRE EST TOUJOURS RENDU, et l'en-tête ne dépend plus de
          `titre || intro`.

          CE QUI ÉTAIT MESURÉ : sur les 116 pages de corpus, AUCUNE section
          `offre` ne porte ni `titre` ni `intro` (vérifié sur
          `supabase/import/corpus-analyse.json` : 116 sur 116). L'en-tête ne se
          rendait donc JAMAIS, et ce tableau arrivait sans un mot pour le
          nommer : une dalle muette dans le plan de la page, sur toutes les
          pages du gabarit de vente et sur les dix-huit pages d'offre.

          LE H2 RESTE SOUS CONDITION, ET IL N'Y A PAS DE REPLI. La maquette le
          tire de `{{ spInclude.title }}`, une donnée qu'elle ne porte pas, et le
          corpus ne l'écrit nulle part : écrire un titre ici serait fabriquer du
          texte visible sur 134 pages. La réserve est inscrite dans
          `docs/RESERVES-CONTENU.md` : c'est au corpus de fournir ce titre.
        */}
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>{SURTITRE_SECTION}</div>
            {section.titre ? <h2 style={TITRE2}>{section.titre}</h2> : null}
          </div>
          {section.intro ? (
            <p style={CHAPEAU}>
              <TexteRiche texte={section.intro} />
            </p>
          ) : null}
        </div>

        {section.lignes.length > 0 ? (
          <div style={{ ...VERRE, overflow: "hidden" }}>
            <div
              className="mg-cmp"
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                gap: 16,
                padding: "18px 28px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span style={{ ...CELLULE_ENTETE, color: "var(--ink4)" }}>
                {ENTETE_PRESTATION}
              </span>
              <span style={{ ...CELLULE_ENTETE, color: "var(--acc)" }}>
                {ENTETE_BENEFICE}
              </span>
            </div>

            {section.lignes.map((ligne, rang) => (
              <div
                key={ligne.prestation.texte}
                className="mg-cmp"
                style={{
                  ...LIGNE,
                  gridTemplateColumns: "1.1fr 1fr",
                  borderBottom:
                    rang === section.lignes.length - 1
                      ? undefined
                      : "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    font: "400 14.5px/1.55 var(--fb)",
                    color: "var(--ink1)",
                  }}
                >
                  {ligne.prestation.accroche ? (
                    <strong style={PROSE_FORT}>
                      <TexteRiche texte={ligne.prestation.accroche} />{" "}
                    </strong>
                  ) : null}
                  <TexteRiche texte={ligne.prestation.texte} />
                </span>
                <span
                  style={{
                    font: "400 14.5px/1.55 var(--fb)",
                    color: "var(--ink2)",
                  }}
                >
                  <TexteRiche texte={ligne.benefice} />
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {section.tableau ? <TableauComparatif tableau={section.tableau} /> : null}

        <Paragraphes paragraphes={section.prose} />
      </div>
    </section>
  );
}
