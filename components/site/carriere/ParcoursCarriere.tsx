import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * « Ils y sont déjà » : quatre portraits, maquette lignes 3244 à 3290.
 *
 * CES QUATRE PORTRAITS SONT DES EXEMPLES, et la maquette le dit elle-même par
 * la ligne qui ferme la section. Elle est portée telle quelle, visible, et non
 * reléguée en commentaire : personne n'a confirmé ces propos ni ces
 * ancienneté. Tant qu'un vrai collaborateur n'a pas donné son accord, la
 * mention doit rester sous les cartes.
 *
 * ÉCART À LA MAQUETTE : le second propos y annonce une durée de trajet
 * chiffrée, que les interdits de copie du projet refusent.
 */

interface Portrait {
  readonly metier: string;
  readonly reperes: string;
  readonly propos: string;
  readonly image: string;
  readonly alt: string;
}

const PORTRAITS: readonly Portrait[] = [
  {
    metier: "Électrotechnicien",
    reperes: "Écully · 4 ans chez migen©",
    propos:
      "« J’ai passé mes habilitations haute tension la première année. Je n’aurais pas pu ailleurs. »",
    image: "/assets/web/team-electric.jpg",
    alt: "Technicien migen en électrotechnique",
  },
  {
    metier: "Soudeur · chaudronnier",
    reperes: "Nantes · 2 ans chez migen©",
    propos:
      "« Des chantiers différents tous les mois, et toujours près de chez moi. »",
    image: "/assets/web/x-soudure.jpg",
    alt: "Soudeur migen",
  },
  {
    metier: "Automaticien",
    reperes: "Strasbourg · 6 ans chez migen©",
    propos:
      "« Je suis passé de la maintenance curative à la migration d’automates. Personne ne m’a freiné. »",
    image: "/assets/web/sv-armoire.jpg",
    alt: "Technicien de maintenance migen",
  },
  {
    metier: "Électromécanicienne",
    reperes: "Toulouse · 3 ans chez migen©",
    propos:
      "« Le client m’a proposé une embauche. J’ai préféré rester : je vois plus de machines ici. »",
    image: "/assets/web/team-grind-front.jpg",
    alt: "Techniciens migen sur site",
  },
];

const CARTE: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};

export default function ParcoursCarriere() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: "16px",
            }}
          >
            Ils y sont déjà
          </div>
          <h2
            style={{
              font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
              letterSpacing: "-.04em",
              margin: "0 0 38px",
              maxWidth: "24ch",
              textWrap: "balance",
            }}
          >
            Quatre parcours, quatre bassins
          </h2>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: "16px",
            }}
          >
            {PORTRAITS.map((portrait) => (
              <div key={portrait.metier} style={CARTE}>
                <div
                  style={{
                    position: "relative",
                    height: "230px",
                    background: "var(--ph)",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={portrait.image}
                    alt={portrait.alt}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 280px"
                    style={{
                      objectFit: "cover",
                      filter: "saturate(var(--sat)) contrast(1.05)",
                      opacity: "var(--ph-op)",
                    }}
                  />
                </div>
                <div style={{ padding: "24px 26px 28px" }}>
                  <div
                    style={{
                      font: "600 16.5px var(--ft)",
                      letterSpacing: "-.025em",
                    }}
                  >
                    {portrait.metier}
                  </div>
                  <div
                    style={{
                      font: "400 13px var(--fb)",
                      color: "var(--acc)",
                      marginTop: "3px",
                    }}
                  >
                    {portrait.reperes}
                  </div>
                  <p
                    style={{
                      font: "400 14px/1.6 var(--fb)",
                      color: "var(--ink2)",
                      margin: "12px 0 0",
                    }}
                  >
                    {portrait.propos}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              font: "400 11.5px var(--fb)",
              color: "var(--ink4)",
              marginTop: "18px",
            }}
          >
            {
              "Portraits à remplacer par de vrais collaborateurs et leurs propos, avec leur accord"
            }
          </div>
        </div>
      </div>
    </section>
  );
}
