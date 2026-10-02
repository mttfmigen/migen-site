import apparition from "./apparition.module.css";
import styles from "./ProblematiqueClient.module.css";

/* « Votre problématique », portée de « Migen - Site final » (lignes 638 à 660).
   Composant serveur. */

const PREUVES: readonly {
  valeur: React.ReactNode;
  titre: string;
  texte: string;
}[] = [
  {
    valeur: "6",
    titre: "Étapes de sélection",
    texte:
      "Parcours, entretien technique avec un homme du métier, tests techniques et comportementaux sur référentiel, rencontre du client.",
  },
  {
    // La maquette annonçait « 5 agences en France ». Le contrat de projet fixe
    // quatre agences (Lyon siège, Montréal, Dubaï, Madrid), aucune autre en
    // France, et dix hubs de techniciens : c'est cette donnée qui est portée.
    valeur: "10",
    titre: "Hubs de techniciens",
    texte:
      "Dix hubs de techniciens permettent d'envoyer un technicien depuis le bassin le plus proche de votre site.",
  },
  {
    valeur: <>100&nbsp;%</>,
    titre: "Habilitations à jour",
    texte:
      "CACES 486 & 489, habilitations électriques, travail en hauteur, risques chimiques, accès Z.A.C.",
  },
];

export default function ProblematiqueClient() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          className={`mg-r2 ${apparition.apparition}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "70px",
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
              Votre problématique
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 22px",
                maxWidth: "22ch",
                textWrap: "balance",
              }}
            >
              Un arrêt de ligne ne se planifie pas. Sa réponse, si.
            </h2>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 16px",
              }}
            >
              Pénurie de profils qualifiés, turnover, habilitations à vérifier,
              sous-traitants qui découvrent votre installation à chaque
              passage&nbsp;: la maintenance externalisée échoue presque toujours
              pour les mêmes raisons.
            </p>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
              }}
            >
              Chez migen©, seuls 10&nbsp;% des techniciens réussissent notre
              process. Vous validez vous-même les intervenants déployés sur
              votre site&nbsp;: vous gardez le contrôle total sur
              l&apos;équipe qui travaille chez vous.
            </p>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {PREUVES.map((preuve) => (
              <div
                key={preuve.titre}
                className={styles.cartePreuve}
                style={{
                  background: "rgba(255,255,255,var(--gl-a))",
                  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                  border: "1px solid var(--gbd)",
                  borderRadius: "var(--rad)",
                  padding: "26px 28px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: "16px" }}
                >
                  <span
                    style={{
                      font: "600 30px var(--ft)",
                      letterSpacing: "-.05em",
                      color: "var(--acc)",
                      flex: "none",
                    }}
                  >
                    {preuve.valeur}
                  </span>
                  <div>
                    <div
                      style={{
                        font: "600 16px var(--ft)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {preuve.titre}
                    </div>
                    <div
                      style={{
                        font: "400 14px/1.55 var(--fb)",
                        color: "var(--ink2)",
                        marginTop: "4px",
                      }}
                    >
                      {preuve.texte}
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
