import TexteRiche from "@/components/site/blocs/TexteRiche";
import type {
  SectionChiffres,
  SectionDeroule,
  SectionGaranties,
  SectionOffre,
  SectionProbleme,
} from "@/types/contenu";

import {
  CARTE_CHIFFRE,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  colonnes,
  ENTETE,
  ETAPE_BARRES,
  ETAPE_CARTE,
  ETAPE_NUMERO,
  ETAPE_PISTE,
  ETAPE_TEXTE,
  ETAPE_TITRE,
  GARANTIE_TEXTE,
  GARANTIE_TITRE,
  GARANTIES_GRILLE,
  GARANTIES_HALO,
  GARANTIES_PANNEAU,
  GARANTIES_SECTION,
  LARGEUR,
  OFFRE_BANDE_NOTE,
  OFFRE_BENEFICE,
  OFFRE_PRESTATION,
  PROBLEME_ACCROCHE,
  PROBLEME_CARTE,
  PROBLEME_CHAPEAU,
  PROBLEME_COLLANT,
  PROBLEME_GRILLE,
  PROBLEME_PUCE,
  PROBLEME_TEXTE,
  SECTION,
  SURTITRE,
  SURTITRE_SOUS,
  TITRE2,
  VERRE,
} from "./habillage-prestation";
import styles from "./PagePrestation.module.css";
import { capitale, insecable, scinde, soigne } from "./texte-prestation";

/**
 * Sections 02 à 07 du gabarit PRESTATION.
 *
 * Chaque section se rend UNIQUEMENT si le corpus l'alimente. Un sur-titre sans
 * contenu ne se rend pas : la règle R52 du référentiel client supprime un H2
 * sans contenu à l'affichage, et un sur-titre orange au-dessus du vide est le
 * défaut que ce gabarit est censé corriger.
 *
 * LA SECTION 06 « RÉASSURANCE » N'EST PAS PORTÉE, et c'est délibéré. La
 * maquette y place deux emplacements d'image (MASE, EcoVadis) et un panneau
 * « Notre sélection ». Le corpus ne porte ni certification ni visuel : la
 * section resterait un cadre vide. Voir `docs/RESERVES-CONTENU.md`.
 */

/** 02. Les chiffres du corpus, en cartes de verre sur deux colonnes. */
export function Chiffres({ section }: { section: SectionChiffres }) {
  if (!section.chiffres?.length) return null;
  return (
    <section style={{ padding: "48px 0 0" }} data-section="02-chiffres">
      <div style={LARGEUR}>
        <div className="mg-rmulti" style={colonnes(2)}>
          {section.chiffres.map((chiffre, i) => (
            <div key={`${chiffre.valeur}-${i}`} style={CARTE_CHIFFRE}>
              <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
              <div style={CHIFFRE_LIBELLE}>
                {/* La maquette joint le libellé et son détail en une phrase :
                    « des candidats retenus. Le technicien qui vient sait
                    réparer… ». Les deux champs du corpus, sans rien perdre. */}
                {chiffre.detail
                  ? `${insecable(chiffre.libelle)}. ${insecable(chiffre.detail)}`
                  : insecable(chiffre.libelle)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Le bandeau de logos « Ils nous font confiance » de la maquette n'est
          pas rendu : aucune source ne fournit la liste des clients à citer
          ici, et son sur-titre seul n'annoncerait rien. */}
    </section>
  );
}

/** 03. Le problème : titre collant à gauche, quatre constats à droite. */
export function Probleme({ section }: { section: SectionProbleme }) {
  if (!section.puces?.length) return null;
  const { titre, suite } = scinde(section.punchline);
  return (
    <section style={SECTION} data-section="03-probleme">
      <div style={LARGEUR}>
        <div className="mg-r2" style={PROBLEME_GRILLE}>
          <div style={PROBLEME_COLLANT}>
            <div style={SURTITRE}>Votre problématique</div>
            <h2 style={TITRE2}>{titre}</h2>
            {suite ? <p style={PROBLEME_CHAPEAU}>{suite}</p> : null}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {section.puces.map((puce, i) => (
              <div key={`puce-${i}`} style={PROBLEME_CARTE}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={PROBLEME_PUCE} aria-hidden="true" />
                  <div>
                    {puce.accroche ? (
                      <div style={PROBLEME_ACCROCHE}>{soigne(puce.accroche)}</div>
                    ) : null}
                    <div style={PROBLEME_TEXTE}>
                      <TexteRiche texte={capitale(puce.texte)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 04. L'offre : un tableau à deux colonnes, puis la bande de maillage. */
export function Offre({ section }: { section: SectionOffre }) {
  if (!section.lignes?.length) return null;
  return (
    <section style={SECTION} data-section="04-offre">
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>L’offre</div>
            <h2 style={TITRE2}>
              Ce que nous faisons, et ce que ça change pour vous.
            </h2>
          </div>
        </div>

        <div style={{ ...VERRE, overflow: "hidden" }}>
          <div className={styles.entete}>
            <span style={{ ...SURTITRE_SOUS, color: "var(--ink4)" }}>
              Ce que nous faisons
            </span>
            <span style={{ ...SURTITRE_SOUS, color: "var(--acc)" }}>
              Ce que ça change pour vous
            </span>
          </div>

          {section.lignes.map((ligne, i) => (
            <div
              key={`ligne-${i}`}
              className={
                i > 0 ? `${styles.rangee} ${styles.rangeeFilet}` : styles.rangee
              }
            >
              <div style={OFFRE_PRESTATION}>
                {ligne.prestation.accroche ? (
                  <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {ligne.prestation.accroche}
                  </strong>
                ) : null}
                {/* Pas de séparateur ajouté : le corpus écrit le texte de suite
                    avec sa ponctuation d'attaque (« , pas par un standard. »),
                    exactement comme la maquette l'assemble. */}
                <TexteRiche texte={insecable(ligne.prestation.texte)} />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    color: "var(--acc)",
                    font: "600 15px var(--fb)",
                    flex: "none",
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
                <span style={OFFRE_BENEFICE}>
                  <TexteRiche texte={insecable(ligne.benefice)} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {section.prose?.length ? (
          <div style={OFFRE_BANDE_NOTE}>
            <p style={{ font: "400 15px/1.65 var(--fb)", color: "var(--ink1)", margin: 0 }}>
              {section.prose.map((p, i) => (
                <TexteRiche key={`prose-${i}`} texte={insecable(p.texte)} />
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** 05. Le déroulé : six étapes, chacune avec sa barre d'avancement. */
export function Deroule({ section }: { section: SectionDeroule }) {
  if (!section.etapes?.length) return null;
  return (
    <section style={SECTION} data-section="05-methode">
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE}>Le déroulé</div>
            <h2 style={TITRE2}>Ce qui se passe après votre appel.</h2>
          </div>
        </div>

        <div className="mg-rmulti" style={colonnes(3, 16)}>
          {section.etapes.map((etape, i) => (
            <div key={`etape-${i}`} style={ETAPE_CARTE}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <span style={{ ...SURTITRE_SOUS, color: "var(--acc)" }}>
                  Étape {i + 1}
                </span>
                {/* Seul le premier numéro est orange dans la maquette : il
                    marque l'entrée du parcours, les suivants sont en gris. */}
                <span
                  style={{
                    ...ETAPE_NUMERO,
                    color: i === 0 ? "var(--acc)" : "var(--ink4)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div style={ETAPE_PISTE}>
                <div
                  style={{
                    height: "100%",
                    width: ETAPE_BARRES[i] ?? "100%",
                    background: "var(--acc)",
                    borderRadius: 999,
                  }}
                />
              </div>

              <div style={ETAPE_TITRE}>{etape.titre}</div>
              {etape.texte ? (
                <p style={ETAPE_TEXTE}>
                  <TexteRiche texte={capitale(etape.texte)} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 07. Les garanties, sur panneau anthracite, quatre colonnes à filet haut. */
export function Garanties({ section }: { section: SectionGaranties }) {
  if (!section.puces?.length) return null;
  return (
    <section style={GARANTIES_SECTION} data-section="07-garanties">
      <div style={GARANTIES_PANNEAU}>
        <div style={GARANTIES_HALO} aria-hidden="true" />
        <div style={{ position: "relative" }}>
          <h2 style={{ ...SURTITRE, margin: "0 0 18px" }}>
            Ce que nous garantissons
          </h2>
          <div className="mg-rmulti" style={GARANTIES_GRILLE}>
            {section.puces.map((puce, i) => (
              <div
                key={`garantie-${i}`}
                style={{
                  /* Le premier filet est orange, les autres blancs à 16 % :
                     la maquette marque ainsi l'engagement de tête. */
                  borderTop: `2px solid ${
                    i === 0 ? "var(--acc)" : "rgba(255,255,255,.16)"
                  }`,
                  paddingTop: 22,
                }}
              >
                {puce.accroche ? (
                  <div style={GARANTIE_TITRE}>{insecable(puce.accroche)}</div>
                ) : null}
                <div style={GARANTIE_TEXTE}>
                  <TexteRiche texte={soigne(puce.texte)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
