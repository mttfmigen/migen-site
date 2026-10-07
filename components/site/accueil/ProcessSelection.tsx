import styles from "./ProcessSelection.module.css";

/**
 * « Notre sélection » : les six étapes du process, avec le taux de passage.
 *
 * Composant serveur, aucune donnée extérieure : les six étapes et le
 * référentiel sont du texte de la maquette, pas du contenu éditorialisé en
 * base. Le `data-reveal` de la maquette n'est pas porté, le bloc est visible
 * sans JavaScript.
 */

type Etape = {
  readonly rang: string;
  readonly taux: string;
  readonly jauge: string;
  readonly titre: string;
  readonly texte: string;
  /** L'étape finale porte son taux en orange et en plus gros. */
  readonly final?: boolean;
};

const ETAPES: readonly Etape[] = [
  {
    rang: "01",
    taux: "100 %",
    jauge: "100%",
    titre: "Lecture du parcours",
    texte:
      "Habilitations, technologies pratiquées, stabilité des postes. Un parcours sans terrain ne passe pas.",
  },
  {
    rang: "02",
    taux: "55 %",
    jauge: "55%",
    titre: "Entretien téléphonique",
    texte:
      "Vingt minutes avec un chargé d’affaires : mobilité, prétentions, motivation réelle pour le site.",
  },
  {
    rang: "03",
    taux: "40 %",
    jauge: "40%",
    titre: "Entretien technique",
    texte:
      "Un technicien de terrain reprend le parcours machine par machine : pannes traitées, arbitrages faits.",
  },
  {
    rang: "04",
    taux: "25 %",
    jauge: "25%",
    titre: "Tests techniques",
    // Les tirets cadratins de la maquette sont remplacés par une parenthèse :
    // interdit de copie du projet.
    texte:
      "Épreuves écrites et pratiques par domaine, notées sur notre référentiel.",
  },
  {
    rang: "05",
    taux: "15 %",
    jauge: "15%",
    titre: "Tests comportementaux",
    texte:
      "Sécurité, autonomie, rigueur du compte rendu, tenue face à l’urgence.",
  },
  {
    rang: "06",
    taux: "10 %",
    jauge: "10%",
    titre: "Rencontre du client",
    texte:
      "Vous rencontrez le technicien avant de dire oui. Deux validations, pas une.",
    final: true,
  },
];

const CRITERES: readonly string[] = [
  "Sécurité",
  "Diagnostic",
  "Autonomie",
  "Compte rendu",
  "Relation client",
  "Habilitations",
];

/** Le fond de verre des cartes, identique sur les six. */
/** Cartouche au-dessus de la grille, relevé : 600 11px, .12em, ink3. */
const CARTOUCHE_GRILLE: React.CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};

export default function ProcessSelection() {
  /*
   * DISPOSITION RELEVÉE SUR LA MAQUETTE le 07/10 au soir, valeur par valeur,
   * après le constat de Mehdi « ça ressemble pas du tout » :
   *
   *   · DEUX COLONNES, .72fr / 1.28fr : le titre, l'intro et le bouton à
   *     gauche ; à droite les six cartes en grille de 3, coiffées des deux
   *     cartouches « Sur 100 techniciens rencontrés » / « 10 retenus ».
   *   · CHAQUE CARTE : rang en chasse fixe orange, cartouche « restent »
   *     (« retenus » pour la sixième), le POURCENTAGE en 44px, le titre, le
   *     texte, et une jauge de 5px en pied, remplissage sombre (orange sur la
   *     sixième, qui est anthracite).
   *   · LE RÉFÉRENTIEL : une carte de verre sous la grille, dans la colonne
   *     droite, pastilles de critères à droite. Plus de bande orangée pleine
   *     largeur, plus de bandeau noir « 10 % » : la maquette n'en a pas.
   */
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          className="mg-r2" data-reveal=""
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,.72fr) minmax(0,1.28fr)",
            gap: "48px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "18px",
              }}
            >
              Notre sélection
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 18px",
                maxWidth: "14ch",
                textWrap: "balance",
              }}
            >
              {"Seuls 10 % des techniciens réussissent notre process."}
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 22px",
              }}
            >
              {
                "Six étapes, menées par des techniciens de terrain, pas par un algorithme. C’est ce qui nous permet de vous envoyer quelqu’un qu’on peut laisser seul devant votre machine."
              }
            </p>
            <a
              href="#form-bas"
              className={styles.boutonAccent}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "14px 24px",
                borderRadius: "999px",
                background: "var(--acc)",
                color: "#fff",
                font: "600 14.5px var(--fb)",
                whiteSpace: "nowrap",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
              }}
            >
              Constituer mon équipe →
            </a>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "16px",
                marginBottom: "14px",
                padding: "0 4px",
              }}
            >
              <span style={CARTOUCHE_GRILLE}>Sur 100 techniciens rencontrés</span>
              <span style={CARTOUCHE_GRILLE}>10 retenus</span>
            </div>

            <div
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: "12px",
              }}
            >
              {ETAPES.map((etape) => (
                <div
                  key={etape.rang}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    padding: "24px 24px 22px",
                    borderRadius: "var(--rad-s)",
                    ...(etape.final
                      ? {
                          background: "var(--panel)",
                          color: "#fff",
                          boxShadow: "0 24px 56px -32px rgba(0,0,0,.5)",
                        }
                      : {
                          background: "#fff",
                          border: "1px solid var(--line)",
                          boxShadow: "0 1px 1px rgba(0,0,0,.03)",
                        }),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        font: "600 11px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                      }}
                    >
                      {etape.rang}
                    </span>
                    <span
                      style={{
                        font: "600 11px var(--fb)",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: etape.final
                          ? "rgba(255,255,255,.55)"
                          : "var(--ink4)",
                      }}
                    >
                      {etape.final ? "retenus" : "restent"}
                    </span>
                  </div>
                  <div
                    style={{
                      font: "600 calc(44px * var(--ts))/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: etape.final ? "var(--acc)" : "var(--ink)",
                    }}
                  >
                    {etape.taux}
                  </div>
                  <div
                    style={{
                      font: "600 16px/1.25 var(--ft)",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {etape.titre}
                  </div>
                  <p
                    style={{
                      font: "400 13.5px/1.55 var(--fb)",
                      color: etape.final
                        ? "rgba(255,255,255,.72)"
                        : "var(--ink2)",
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {etape.texte}
                  </p>
                  <div
                    style={{
                      height: "5px",
                      borderRadius: "999px",
                      background: etape.final
                        ? "rgba(255,255,255,.14)"
                        : "var(--chip)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: etape.jauge,
                        background: etape.final
                          ? "var(--acc)"
                          : "rgba(28,27,25,.55)",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "20px 24px",
                borderRadius: "var(--rad-s)",
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                border: "1px solid var(--gbd)",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: "10px 24px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    font: "600 11px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: "6px",
                  }}
                >
                  Le référentiel de compétences
                </div>
                <div
                  style={{
                    font: "600 15.5px/1.3 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                    marginBottom: "6px",
                  }}
                >
                  Un barème commun, pas une impression
                </div>
                <p
                  style={{
                    font: "400 13.5px/1.6 var(--fb)",
                    color: "var(--ink1)",
                    margin: 0,
                  }}
                >
                  {
                    "Chaque technicien est noté sur un référentiel de compétences techniques et comportementales, révisé chaque année avec nos chargés d’affaires et nos clients. Le même barème sert ensuite au suivi en mission."
                  }
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                  flex: "none",
                  maxWidth: "300px",
                  justifyContent: "flex-end",
                }}
              >
                {CRITERES.map((critere) => (
                  <span
                    key={critere}
                    style={{
                      font: "500 12px var(--fb)",
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {critere}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
