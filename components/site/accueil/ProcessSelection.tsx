import styles from "./ProcessSelection.module.css";
import animations from "./apparition.module.css";

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
    rang: "Étape 1",
    taux: "100 %",
    jauge: "100%",
    titre: "Lecture du parcours",
    texte:
      "Habilitations, technologies pratiquées, stabilité des postes. Un parcours sans terrain ne passe pas cette étape.",
  },
  {
    rang: "Étape 2",
    taux: "55 %",
    jauge: "55%",
    titre: "Entretien téléphonique",
    texte:
      "Vingt minutes avec un chargé d’affaires : mobilité, prétentions, motivation réelle pour le site.",
  },
  {
    rang: "Étape 3",
    taux: "40 %",
    jauge: "40%",
    titre: "Entretien technique",
    texte:
      "Un technicien de terrain reprend le parcours machine par machine : installations connues, pannes traitées, arbitrages faits.",
  },
  {
    rang: "Étape 4",
    taux: "25 %",
    jauge: "25%",
    titre: "Tests techniques",
    // Les tirets cadratins de la maquette sont remplacés par une parenthèse :
    // interdit de copie du projet.
    texte:
      "Épreuves écrites et pratiques par domaine (mécanique, électrotechnique, automatisme, hydraulique), notées sur notre référentiel.",
  },
  {
    rang: "Étape 5",
    taux: "15 %",
    jauge: "15%",
    titre: "Tests comportementaux",
    texte:
      "Sécurité, autonomie, rigueur du compte rendu, tenue face à l’urgence, relation client. Même référentiel, même barème.",
  },
  {
    rang: "Étape 6",
    taux: "10 %",
    jauge: "10%",
    titre: "Rencontre du client",
    texte:
      "Vous rencontrez le technicien avant de dire oui. Lui aussi visite le site. Deux validations, pas une.",
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
const CARTE: React.CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
  padding: "28px 28px 30px",
  display: "flex",
  flexDirection: "column",
};

export default function ProcessSelection() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          className={`mg-r2 ${animations.apparition}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr .85fr",
            gap: "56px",
            alignItems: "end",
            marginBottom: "38px",
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
                maxWidth: "22ch",
                textWrap: "balance",
              }}
            >
              {"Seuls 10 % des techniciens réussissent notre process."}
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 22px",
                maxWidth: "56ch",
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
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              padding: "24px 28px",
              borderRadius: "var(--rad)",
              background: "var(--panel)",
            }}
          >
            <span
              style={{
                font: "600 calc(56px * var(--ts))/1 var(--ft)",
                letterSpacing: "-.06em",
                color: "var(--acc)",
                whiteSpace: "nowrap",
              }}
            >
              {"10 %"}
            </span>
            <span
              style={{
                font: "400 14px/1.5 var(--fb)",
                color: "rgba(255,255,255,.62)",
              }}
            >
              des techniciens réussissent le process
            </span>
          </div>
        </div>

        <div
          className={`mg-rmulti ${animations.apparition}`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: "16px",
          }}
        >
          {ETAPES.map((etape) => (
            <div key={etape.rang} style={CARTE}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    font: "600 11px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  {etape.rang}
                </span>
                <span
                  style={{
                    font: etape.final
                      ? "600 28px var(--ft)"
                      : "600 21px var(--ft)",
                    letterSpacing: "-.045em",
                    color: etape.final ? "var(--acc)" : "var(--ink)",
                  }}
                >
                  {etape.taux}
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  borderRadius: "999px",
                  background: "var(--chip)",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: etape.jauge,
                    background: "var(--acc)",
                    borderRadius: "999px",
                  }}
                />
              </div>
              <div
                style={{
                  font: "600 16.5px var(--ft)",
                  letterSpacing: "-.025em",
                  marginBottom: "8px",
                }}
              >
                {etape.titre}
              </div>
              <p
                style={{
                  font: "400 14px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                }}
              >
                {etape.texte}
              </p>
            </div>
          ))}
        </div>

        <div
          className={animations.apparition}
          style={{
            marginTop: "16px",
            borderRadius: "var(--rad)",
            background: "var(--acc-w)",
            border: "1.5px solid rgba(255,124,60,.3)",
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "10px",
              }}
            >
              Le référentiel de compétences
            </div>
            <div
              style={{
                font: "600 18px var(--ft)",
                letterSpacing: "-.025em",
                marginBottom: "8px",
              }}
            >
              Un barème commun, pas une impression
            </div>
            <p
              style={{
                font: "400 14.5px/1.6 var(--fb)",
                color: "var(--ink1)",
                margin: 0,
                maxWidth: "64ch",
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
              maxWidth: "340px",
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
    </section>
  );
}
