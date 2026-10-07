import type { CSSProperties } from "react";

import type { SectionGaranties } from "@/types/contenu";

import { SURTITRE } from "@/components/site/blocs/habillage";
import { majusculeInitiale } from "./texte-offre";

/**
 * Section « 06 Garanties » de la capture (`maquette/rendu/offres--residence.html`) :
 * un grand panneau anthracite, surtitre « Notre parti pris », H2 « Ce que nous
 * garantissons », puis les puces du corpus en quatre cartes à filet orange,
 * titre blanc et texte voilé, sans coche.
 *
 * `blocs/Garanties.tsx` n'est pas touché : il sert le gabarit de vente.
 */

export interface ProprietesGarantiesOffre {
  section: SectionGaranties;
}

const PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "58px 56px",
  position: "relative",
  overflow: "hidden",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 480,
  height: 480,
  right: -180,
  top: -220,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 36px",
  maxWidth: "22ch",
};

const CARTE: CSSProperties = {
  borderTop: "2px solid var(--acc)",
  paddingTop: 22,
};

const CARTE_TITRE: CSSProperties = {
  font: "600 18px/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "#fff",
  marginBottom: 12,
};

const CARTE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
};

export default function GarantiesOffre({ section }: ProprietesGarantiesOffre) {
  return (
    <section style={{ padding: "var(--sec) 24px 0" }}>
      <div className="mg-pad" style={PANNEAU}>
        <div aria-hidden="true" style={LUEUR} />
        <div style={{ position: "relative" }}>
          <div style={{ ...SURTITRE, marginBottom: 18 }}>
            Notre parti pris
          </div>
          <h2 style={TITRE}>Ce que nous garantissons</h2>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: "30px 40px",
            }}
          >
            {section.puces.map((puce) => (
              <div key={puce.accroche ?? puce.texte} style={CARTE}>
                {puce.accroche ? (
                  <div style={CARTE_TITRE}>{puce.accroche}</div>
                ) : null}
                <div style={CARTE_TEXTE}>{majusculeInitiale(puce.texte)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
