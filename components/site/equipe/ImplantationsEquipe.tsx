import Link from "next/link";

import { resumeDe } from "@/components/site/blocs/resume-de-section";
import type { EntreeSommaire } from "@/components/site/nous-connaitre/HautMobile";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

import { AGENCES, HUBS } from "./equipe-donnees";
import { CHAPEAU, LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage-equipe";

/**
 * « Nos implantations » : quatre agences et dix hubs. Maquette lignes 5946
 * à 5953.
 *
 * Le lien « Nos implantations en détail » visait `goImplant`, la navigation
 * interne de l'éditeur. Il pointe ici sur `/implantations/`, vérifiée à 200.
 */
/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Nos implantations";
const TITRE_TEXTE = "Quatre agences, dix hubs de techniciens.";

/** Carte 05 du téléphone : son numéro suit l'ordre de la maquette (`rang`). */
export const SOMMAIRE_IMPLANTATIONS: EntreeSommaire = { id: "implantations", titre: SURTITRE_TEXTE };

export default function ImplantationsEquipe() {
  return (
    <SectionRepliee
      id={SOMMAIRE_IMPLANTATIONS.id}
      rang={5}
      kicker={SURTITRE_TEXTE}
      titre={TITRE_TEXTE}
      resume={resumeDe(AGENCES.map((a) => a.ville))}
    >
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <div data-titre-bureau="" style={SURTITRE}>
                {SURTITRE_TEXTE}
              </div>
              <h2 data-titre-bureau="" style={TITRE2}>
                {TITRE_TEXTE}
              </h2>
              <p style={CHAPEAU}>
                Quatre agences portent le réseau, des hubs de techniciens dans
                les grandes villes rapprochent les équipes des usines.
              </p>
              <Link
                href="/implantations/"
                style={{
                  display: "inline-flex",
                  marginTop: 22,
                  font: "600 15px var(--fb)",
                  color: "var(--acc)",
                }}
              >
                Nos implantations en détail →
              </Link>
            </div>
            <div style={{ ...VERRE, padding: "26px 28px" }}>
              <ul
                className="mg-rmulti"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: 10,
                  marginBottom: 22,
                  marginTop: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {AGENCES.map((agence) => (
                  <li
                    key={agence.ville}
                    style={{
                      borderRadius: "var(--rad-s)",
                      background: agence.siege ? "var(--acc-w)" : "var(--card)",
                      border: agence.siege
                        ? "1px solid rgba(255,124,60,.3)"
                        : "1px solid var(--line)",
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        font: "600 17px var(--ft)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {agence.ville}
                    </div>
                    <div
                      style={{
                        font: "400 13px var(--fb)",
                        color: "var(--ink3)",
                        marginTop: 3,
                      }}
                    >
                      {agence.precision}
                    </div>
                  </li>
                ))}
              </ul>
              <h3
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  margin: "0 0 10px",
                }}
              >
                Hubs de techniciens en France
              </h3>
              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {HUBS.map((hub) => (
                  <li
                    key={hub}
                    style={{
                      font: "500 12.5px var(--fb)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "var(--chip)",
                      color: "var(--ink1)",
                    }}
                  >
                    {hub}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
