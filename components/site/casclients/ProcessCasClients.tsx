import type { CSSProperties } from "react";

import { LARGEUR, SURTITRE, TITRE2, VERRE } from "./habillage";

/**
 * « Notre sélection » : les six étapes du recrutement, avec leur taux de passage.
 *
 * Maquette lignes 6811 à 6862. Composant SERVEUR, sans donnée extérieure : les
 * six étapes et les taux sont du texte de la maquette, pas du contenu
 * éditorialisé page par page.
 *
 * POURQUOI PAS `accueil/ProcessSelection.tsx` : ce bloc-là porte, en plus, un
 * paragraphe d'introduction, un bouton d'appel à l'action et l'encadré du
 * référentiel de compétences, et ses résumés d'étape sont rédigés plus long. La
 * page de preuve n'a aucun des trois, et son titre descend d'une taille. Deux
 * mises en page, deux fichiers : les mutualiser reviendrait à choisir laquelle
 * des deux la maquette voulait vraiment.
 *
 * LES BARRES. La maquette sert ici les largeurs finales en dur, sans
 * `data-bar` : la révélation échelonnée est réservée à l'accueil. On reproduit,
 * et la barre reste donc lisible sans JavaScript.
 */

type Etape = {
  readonly rang: string;
  readonly taux: string;
  /** Largeur de la jauge, telle que la maquette l'écrit. */
  readonly jauge: string;
  readonly titre: string;
  readonly texte: string;
  /** La dernière étape porte son taux en orange, et plus gros. */
  readonly final?: boolean;
};

const ETAPES: readonly Etape[] = [
  {
    rang: "Étape 1",
    taux: "100 %",
    jauge: "100%",
    titre: "Lecture du parcours",
    texte: "Habilitations, technologies pratiquées, stabilité des postes.",
  },
  {
    rang: "Étape 2",
    taux: "55 %",
    jauge: "55%",
    titre: "Entretien téléphonique",
    texte: "Mobilité, prétentions, motivation réelle pour le site.",
  },
  {
    rang: "Étape 3",
    taux: "40 %",
    jauge: "40%",
    titre: "Entretien technique",
    texte: "Un technicien de terrain interroge le geste et le diagnostic.",
  },
  {
    rang: "Étape 4",
    taux: "25 %",
    jauge: "25%",
    titre: "Tests techniques",
    texte: "Lecture de schéma, recherche de panne, mise en situation.",
  },
  {
    rang: "Étape 5",
    taux: "15 %",
    jauge: "15%",
    titre: "Tests comportementaux",
    texte: "Sécurité, compte rendu, autonomie devant l’imprévu.",
  },
  {
    rang: "Étape 6",
    taux: "10 %",
    jauge: "10%",
    titre: "Rencontre du client",
    texte: "Vous voyez le technicien avant de dire oui. Deux validations.",
    final: true,
  },
];

const CARTE: CSSProperties = { ...VERRE, padding: 26 };

const RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 14,
};

const RAIL: CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: "var(--chip)",
  overflow: "hidden",
  marginBottom: 14,
};

export default function ProcessCasClients() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr .85fr",
            gap: 56,
            alignItems: "end",
            marginBottom: 32,
          }}
        >
          <div>
            <div style={SURTITRE}>Notre sélection</div>
            <h2 style={TITRE2}>
              {"Seuls 10 % des techniciens réussissent notre process."}
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              padding: "24px 28px",
              borderRadius: "var(--rad)",
              background: "var(--panel)",
            }}
          >
            <span
              style={{
                font: "600 calc(52px * var(--ts))/1 var(--ft)",
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
          data-reveal=""
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 16,
          }}
        >
          {ETAPES.map((etape) => (
            <div key={etape.rang} style={CARTE}>
              <div style={RANGEE}>
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
              {/* Décoratif : le taux est déjà écrit juste au-dessus. */}
              <div aria-hidden="true" style={RAIL}>
                <div
                  style={{
                    height: "100%",
                    width: etape.jauge,
                    background: "var(--acc)",
                    borderRadius: 999,
                  }}
                />
              </div>
              <h3
                style={{
                  font: "600 16px var(--ft)",
                  letterSpacing: "-.025em",
                  margin: 0,
                }}
              >
                {etape.titre}
              </h3>
              <p
                style={{
                  font: "400 13.5px/1.55 var(--fb)",
                  color: "var(--ink2)",
                  margin: "7px 0 0",
                }}
              >
                {etape.texte}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
