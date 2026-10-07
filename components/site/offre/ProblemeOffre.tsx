import Image from "next/image";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { SectionProbleme } from "@/types/contenu";

import { coupePunchline, numerote } from "./texte-offre";

/**
 * Section « 03 Problème » de la capture (`maquette/rendu/offres--residence.html`) :
 * à gauche, colonne collante avec surtitre « Votre problématique », la première
 * phrase de la punchline en H2, la suite en sous-phrase, une photo ; à droite,
 * les puces du corpus en cartes numérotées 01 à 04.
 *
 * `blocs/Probleme.tsx` n'est pas touché : il sert le gabarit de vente. La
 * DONNÉE est la même (`sections.probleme` du corpus), seul l'habillage change.
 */

export interface ProprietesProblemeOffre {
  section: SectionProbleme;
  /** L'alt de la photo. La capture y écrit le H1 de la page. */
  altPhoto: string;
  /**
   * La photo de la colonne gauche. ABSENTE, c'est celle de la capture de la
   * page pilote `/offres/residence/` ; `null` dit que la capture de LA page
   * n'en rend aucune, et rien n'est rendu.
   *
   * AJOUTÉ LE 07/10 : la capture de `/offres/full-service/` rend cette section
   * SANS photo (0 image relevée sur sa section 8). Y laisser celle de la page
   * pilote serait une photo posée au hasard.
   */
  photo?: string | null;
}

/** La photo de la colonne gauche, identifiée sur `offres--residence.png`. */
const PHOTO = "/assets/web/team-electric.jpg";

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.1vw,44px) * var(--ts))/1.07 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 18px",
  maxWidth: "18ch",
  textWrap: "balance",
};

const SOUS_PHRASE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 22px",
  maxWidth: "40ch",
};

const CADRE_PHOTO: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  height: 280,
  background: "var(--ph)",
  position: "relative",
};

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "24px 28px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

const NUMERO: CSSProperties = {
  font: "600 26px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "0 0 auto",
};

const ACCROCHE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
  color: "var(--ink)",
};

const TEXTE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
};

export default function ProblemeOffre({
  section,
  altPhoto,
  photo,
}: ProprietesProblemeOffre) {
  const { titre, suite } = coupePunchline(section.punchline);
  const source = photo === undefined ? PHOTO : photo;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div style={{ position: "sticky", top: 110 }}>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            <h2 style={TITRE}>{titre}</h2>
            {suite ? <p style={SOUS_PHRASE}>{suite}</p> : null}
            {source ? (
              <div style={CADRE_PHOTO}>
                <Image
                  src={source}
                  alt={altPhoto}
                  fill
                  sizes="(max-width: 900px) 100vw, 440px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {section.puces.map((puce, rang) => (
              <div key={puce.accroche ?? puce.texte} style={CARTE}>
                <span style={NUMERO}>{numerote(rang)}</span>
                <div>
                  {puce.accroche ? (
                    <div style={ACCROCHE}>{puce.accroche}</div>
                  ) : null}
                  <div style={TEXTE}>{puce.texte}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
