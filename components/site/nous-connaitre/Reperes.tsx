import type { CSSProperties } from "react";

/**
 * Quatre repères chiffrés, en cartes de verre.
 *
 * Maquette, lignes 5226 à 5252. Les chiffres sont ceux de la maquette, non
 * confirmés par Migen : ils sont remontés dans le rapport de portage. Ils sont
 * déclarés en données plutôt qu'en balises pour qu'une correction se fasse en
 * une ligne, sans toucher à la mise en page.
 */

interface Repere {
  valeur: string;
  libelle: string;
  note: string;
}

const REPERES: readonly Repere[] = [
  {
    valeur: "2021",
    libelle: "créée en avril",
    note: "À Lyon, par un technicien de 23 ans.",
  },
  { valeur: "+120", libelle: "techniciens", note: "Tous formés et habilités." },
  {
    valeur: "+50 %",
    libelle: "de croissance par an",
    note: "Entre 30 et 60 % selon l’exercice.",
  },
  {
    valeur: "1 000",
    libelle: "collaborateurs en 2030",
    note: "C’est l’objectif, pas une projection prudente.",
  },
];

const CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
  padding: "26px 26px 28px",
};

export default function Reperes() {
  return (
    <section style={{ padding: "52px 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gap: 12,
          }}
        >
          {REPERES.map((r) => (
            <div key={r.valeur} style={CARTE}>
              <div
                style={{
                  font: "600 calc(38px * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                }}
              >
                {r.valeur}
              </div>
              <div
                style={{
                  font: "600 13.5px var(--ft)",
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                  marginTop: 12,
                }}
              >
                {r.libelle}
              </div>
              <div
                style={{
                  font: "400 13px/1.5 var(--fb)",
                  color: "var(--ink3)",
                  marginTop: 5,
                }}
              >
                {r.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
