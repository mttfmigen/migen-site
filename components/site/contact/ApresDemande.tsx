import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./Contact.module.css";

/**
 * « Après votre demande » : trois étapes, puis la carte candidature.
 * Porté de `maquette/accueil-rendu.html`, lignes 3002 à 3010.
 *
 * LES REPÈRES DES CARTES NE SONT PLUS DES DÉLAIS. La maquette les titrait
 * « 1 h », « 48 h », « 3 sem. » : le contrat de projet n'autorise qu'un seul
 * délai chiffré, le rappel dans l'heure. Les cartes portent donc leur rang,
 * ce que la section annonce déjà (« Trois étapes »), et la promesse de rappel
 * est passée dans le titre de la première.
 */

const CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
  padding: "28px 28px 30px",
};

const INTITULE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};

interface Etape {
  readonly rang: string;
  readonly titre: string;
  readonly texte: string;
}

const ETAPES: readonly Etape[] = [
  {
    rang: "1",
    titre: "Un chargé d’affaires vous rappelle dans l’heure",
    texte:
      "Il qualifie le besoin avec vous : technologies, habilitations, délai, volume.",
  },
  {
    rang: "2",
    titre: "Il visite votre site",
    texte:
      "Contraintes, sécurité, installation : on voit avant de proposer.",
  },
  {
    rang: "3",
    titre: "Vous validez les techniciens",
    texte: "Vous rencontrez chaque profil retenu avant son arrivée sur site.",
  },
];

export default function ApresDemande() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 34,
            }}
          >
            <div>
              <div style={INTITULE}>Après votre demande</div>
              <h2
                style={{
                  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: 0,
                  maxWidth: "22ch",
                  textWrap: "balance",
                }}
              >
                Trois étapes, un interlocuteur nommé.
              </h2>
            </div>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "46ch",
              }}
            >
              Pas de standard ni de ticket&nbsp;: la personne qui vous rappelle
              est celle qui suivra votre site.
            </p>
          </div>

          <div
            className="mg-r3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 12,
            }}
          >
            {ETAPES.map((etape) => (
              <div key={etape.rang} style={CARTE}>
                <div
                  style={{
                    font: "600 calc(32px * var(--ts))/1 var(--ft)",
                    letterSpacing: "-.05em",
                    color: "var(--acc)",
                    marginBottom: 16,
                  }}
                >
                  {etape.rang}
                </div>
                <div
                  style={{
                    font: "600 calc(17px * var(--ts))/1.3 var(--ft)",
                    letterSpacing: "-.025em",
                    color: "var(--ink)",
                    marginBottom: 8,
                  }}
                >
                  {etape.titre}
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
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
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <Link
              href="/carriere/"
              className={styles.carteLien}
              style={{
                ...CARTE,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                padding: "26px 30px",
              }}
            >
              <div>
                <div
                  style={{
                    font: "600 10.5px var(--fb)",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: 8,
                  }}
                >
                  Vous êtes technicien&nbsp;?
                </div>
                <div
                  style={{
                    font: "600 calc(22px * var(--ts)) var(--ft)",
                    letterSpacing: "-.035em",
                    color: "var(--ink)",
                  }}
                >
                  Postulez directement en ligne
                </div>
                <div
                  style={{
                    font: "400 13.5px/1.5 var(--fb)",
                    color: "var(--ink2)",
                    marginTop: 4,
                  }}
                >
                  Quatre écrans.
                </div>
              </div>
              <span
                aria-hidden="true"
                style={{
                  font: "600 20px var(--fb)",
                  color: "var(--acc)",
                  flex: "none",
                }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
