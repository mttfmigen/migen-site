import { Fragment } from "react";

/**
 * « Notre processus » : le panneau anthracite des six étapes,
 * maquette lignes 3482 à 3521.
 *
 * Ce n'est pas le même bloc que `accueil/ProcessSelection.tsx`, qui montre les
 * mêmes six étapes en cartes claires avec un taux de passage par étape. Ici la
 * maquette donne un panneau sombre en deux colonnes, vu par le candidat et non
 * par le client : aucune des deux mises en page ne réemploie l'autre.
 */

interface Etape {
  readonly rang: string;
  readonly titre: string;
  readonly texte: string;
}

const ETAPES: readonly Etape[] = [
  {
    rang: "01",
    titre: "Lecture du parcours",
    texte: "Habilitations, technologies pratiquées, mobilité.",
  },
  {
    rang: "02",
    titre: "Échange téléphonique",
    texte: "Vingt minutes : parcours, mobilité, prétentions.",
  },
  {
    rang: "03",
    titre: "Entretien technique",
    texte:
      "Avec un technicien de terrain, sur vos domaines réels, machine par machine.",
  },
  {
    rang: "04",
    titre: "Tests techniques",
    texte:
      "Épreuves écrites et pratiques par domaine, notées sur notre référentiel de compétences.",
  },
  {
    rang: "05",
    titre: "Tests comportementaux",
    texte:
      "Sécurité, autonomie, rigueur du compte rendu, tenue face à l’urgence, relation client.",
  },
  {
    rang: "06",
    titre: "Rencontre du client",
    texte: "Vous voyez le site avant de dire oui. Lui aussi vous valide.",
  },
];

export default function ProcessusCarriere() {
  return (
    <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-rq2"
          style={{
            position: "relative",
            borderRadius: "36px",
            overflow: "hidden",
            background: "var(--panel)",
            padding: "56px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "480px",
              height: "480px",
              right: "-200px",
              top: "-240px",
              background:
                "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "16px",
              }}
            >
              Notre processus
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,2.6vw,38px) * var(--ts))/1.1 var(--ft)",
                letterSpacing: "-.04em",
                color: "#fff",
                margin: "0 0 14px",
                maxWidth: "22ch",
                textWrap: "balance",
              }}
            >
              {
                "Six étapes, dont un entretien technique et deux batteries de tests."
              }
            </h2>
            <p
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "rgba(255,255,255,.62)",
                margin: 0,
              }}
            >
              {
                "Seuls 10 % des techniciens réussissent notre process. Ce n’est pas un slogan : c’est ce qui nous permet de vous envoyer sur des sites exigeants sans vous mettre en difficulté."
              }
            </p>
          </div>
          <div
            style={{ position: "relative", display: "grid", gap: "12px" }}
          >
            {ETAPES.map((etape, rang) => (
              <Fragment key={etape.rang}>
                {rang > 0 ? (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,.1)",
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      font: "600 13px var(--fb)",
                      color: "var(--acc)",
                      flex: "none",
                      width: "26px",
                    }}
                  >
                    {etape.rang}
                  </span>
                  <div>
                    <div
                      style={{
                        font: "600 15.5px var(--ft)",
                        letterSpacing: "-.02em",
                        color: "#fff",
                      }}
                    >
                      {etape.titre}
                    </div>
                    <div
                      style={{
                        font: "400 14px/1.55 var(--fb)",
                        color: "rgba(255,255,255,.55)",
                        marginTop: "2px",
                      }}
                    >
                      {etape.texte}
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
