import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, VERRE } from "@/components/site/blocs/habillage";
import type { CarteBesoin, EnTeteOffres } from "@/types/offres";

import styles from "./PageOffres.module.css";
import { NUMERO, SURTITRE_OFFRES, TITRE2_OFFRES, numero } from "./habillage";

/**
 * L'entrée PAR BESOIN, en mosaïque. Maquette lignes 1914 à 1988.
 *
 * L'ancre `#besoins` est celle que porte la section dans la maquette, visée par
 * son bouton d'ouverture.
 *
 * CE QUE LA MAQUETTE DESSINE ET QUE LE CORPUS N'ALIMENTE PAS. Chaque carte s'y
 * déplie sur un détail, quatre puces, un tableau Cadre / Délai / Durée, un
 * visuel et deux boutons, et porte une étiquette qui nomme l'offre répondant au
 * besoin. Le corpus de `/offres/` écrit la situation et ce qu'elle produit,
 * rien de plus : il ne dit pas quelle offre répond à quel besoin, n'écrit aucun
 * détail par besoin, et ne donne ni cadre, ni durée. Le dépliant n'est donc pas
 * porté du tout, et les cartes ne sont pas des boutons : un dépliant qui
 * s'ouvre sur du vide vaut moins qu'une carte qui ne s'ouvre pas, et un `+` qui
 * ne déplie rien est un mensonge d'interface.
 *
 * Ce choix a une conséquence voulue : la section reste la liste des situations
 * du client, et le routage vers l'offre se fait par la section suivante, où
 * chaque carte porte le lien de sa page. Le jour où le corpus nomme l'offre de
 * chaque besoin, c'est `CarteBesoin` qui gagne un champ, pas cette mise en page.
 *
 * LE TABLEAU « DÉLAI » NE REVIENDRA PAS TEL QUEL : un délai chiffré
 * d'intervention est interdit par le contrat de rédaction, seul « rappel dans
 * l'heure » est autorisé, et c'est le bandeau d'ouverture qui le porte.
 */
export default function Besoins({
  besoins,
}: {
  besoins: { entete: EnTeteOffres; cartes: CarteBesoin[] };
}) {
  const { entete, cartes } = besoins;
  if (cartes.length === 0) return null;

  return (
    <section id="besoins" style={SECTION}>
      <div style={LARGEUR}>
        {/* `data-reveal` est lu par `components/site/Moteurs.tsx`, monté une
            seule fois dans le gabarit racine : la révélation au défilement de
            la maquette, sans un octet de JavaScript écrit ici. */}
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 30,
            }}
          >
            <div>
              <div style={SURTITRE_OFFRES}>{entete.surtitre}</div>
              <h2 style={TITRE2_OFFRES}>
                <TexteRiche texte={entete.titre} />
              </h2>
            </div>
            {entete.note ? (
              <p
                className={blocs.corpus}
                style={{
                  font: "400 15.5px/1.7 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                  maxWidth: "42ch",
                }}
              >
                <TexteRiche texte={entete.note} />
              </p>
            ) : null}
          </div>

          <div
            className="mg-bento"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gridAutoRows: "minmax(186px,auto)",
              gap: 14,
            }}
          >
            {cartes.map((carte, i) => (
              <div
                key={carte.besoin}
                className={styles.carteBesoin}
                style={VERRE}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    padding: "26px 28px 24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <span style={NUMERO}>{numero(i)}</span>
                  </div>
                  <div
                    className={blocs.corpus}
                    style={{
                      font: "600 calc(17.5px * var(--ts))/1.35 var(--ft)",
                      letterSpacing: "-.025em",
                      color: "var(--ink)",
                    }}
                  >
                    <TexteRiche texte={carte.besoin} />
                  </div>
                  <div
                    className={blocs.corpus}
                    style={{
                      font: "400 13px/1.55 var(--fb)",
                      color: "var(--ink2)",
                      marginTop: 8,
                    }}
                  >
                    <TexteRiche texte={carte.reponse} />
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
