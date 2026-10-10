import type { CSSProperties } from "react";

import type { SectionGaranties } from "@/types/contenu";

import { SURTITRE } from "@/components/site/blocs/habillage";
import { majusculeInitiale } from "./texte-offre";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

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
          {/* REPLIÉ SUR TÉLÉPHONE, motif « Blocs communs (pliables) » de la
              maquette mobile. Le bloc garde SON en-tête, son sur-titre et son
              `<h2>` relevés dans la capture : le composant les reçoit tels
              quels plutôt que d'en fabriquer un second. Au-dessus de 880 px
              rien ne change, le contenu est toujours dans le HTML servi, et
              c'est la feuille qui le replie. */}
          <SectionPliableMobile
            enTete={
              <span>
                <span style={{ ...SURTITRE, marginBottom: 18, display: "block" }}>
                  Notre parti pris
                </span>
                <h2 style={TITRE}>Ce que nous garantissons</h2>
              </span>
            }
            resume={`${section.puces.length} engagements, écrits avant la signature.`}
          >
          <div
            className="g3-2 mg-r2"
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
                {/* LA MAJUSCULE N'EST PAS SYSTÉMATIQUE, et c'est mesuré sur les
                    captures, pas choisi ici : la maquette la met quand le
                    corpus sépare l'accroche par « : » (pilote
                    `/offres/residence/`, « absence ou départ… » rendu
                    « Absence ou départ… ») et laisse le texte TEL QUEL quand
                    la phrase continue l'accroche (« Un seul interlocuteur »
                    puis « de l'accueil de votre demande… », capture de
                    `/bureau-etudes/mise-en-conformite-machine/`). Le
                    séparateur n'est pas dans la donnée : la page le dit par
                    `puce.suitAccroche`. Absent, le rendu d'avant, donc les
                    pages déjà portées ne bougent pas. */}
                <div style={CARTE_TEXTE}>
                  {puce.suitAccroche ? puce.texte : majusculeInitiale(puce.texte)}
                </div>
              </div>
            ))}
          </div>
          </SectionPliableMobile>
        </div>
      </div>
    </section>
  );
}
