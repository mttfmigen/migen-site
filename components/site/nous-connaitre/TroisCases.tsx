import type { CSSProperties } from "react";

import { resumeDe } from "@/components/site/blocs/resume-de-section";

import SectionRepliee from "./SectionRepliee";

/**
 * Notre modèle : le marché en trois cases.
 *
 * Maquette, lignes 5351 à 5375. La troisième carte porte le fond accentué.
 */

const VERRE: CSSProperties = {
  borderRadius: "var(--rad)",
  padding: "30px 30px 32px",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};

const ACCENTUEE: CSSProperties = {
  borderRadius: "var(--rad)",
  padding: "30px 30px 32px",
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.32)",
};

const CASES: readonly { titre: string; texte: string; accent?: true }[] = [
  {
    titre: "Les prestataires de maintenance",
    texte:
      "Ils entretiennent vos machines avec leurs propres équipes et leurs propres méthodes. Vous achetez un résultat, pas des compétences.",
  },
  {
    titre: "Les généralistes du placement",
    texte:
      "Ils placent tous les métiers, de la compta au cariste. La maintenance est une ligne de leur catalogue parmi cinquante.",
  },
  {
    titre: "migen©",
    texte:
      "Nous ne plaçons que des techniciens de maintenance. Un seul métier, des tests propres à chaque spécialité, et des intervenants que vous validez un par un.",
    accent: true,
  },
];

/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Notre modèle";
const TITRE_TEXTE =
  "Le marché se divise en trois. Nous sommes seuls dans la troisième case.";

export default function TroisCases() {
  return (
    <SectionRepliee
      kicker={SURTITRE_TEXTE}
      titre={TITRE_TEXTE}
      resume={resumeDe(CASES.map((c) => c.titre))}
    >
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
            <div data-titre-bureau="">
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                {SURTITRE_TEXTE}
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  margin: 0,
                  textWrap: "balance",
                  maxWidth: "20ch",
                }}
              >
                {TITRE_TEXTE}
              </h2>
            </div>
            <p
              style={{
                font: "400 15.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              La spécialisation n&rsquo;est pas une posture&nbsp;: c&rsquo;est ce
              qui rend les process reproductibles. Un seul métier, donc un seul
              référentiel de compétences, un seul parcours de sélection.
            </p>
          </div>
          <div
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 12,
            }}
          >
            {CASES.map((c) => (
              <div key={c.titre} style={c.accent ? ACCENTUEE : VERRE}>
                <div
                  style={{
                    font: "600 calc(19px * var(--ts)) var(--ft)",
                    letterSpacing: "-.03em",
                    color: "var(--ink)",
                    marginBottom: 10,
                  }}
                >
                  {c.titre}
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                  }}
                >
                  {c.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
