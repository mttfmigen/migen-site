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

/* ------------------------------------------------------- les deux variantes
   relevées par le diagnostic visuel du 07/10, valeurs mesurées sur la maquette
   qui tourne, pas estimées. Le choix vient de la DONNÉE de chaque page
   (`section.variante`), transcrit de sa capture. */

const PANNEAU_SOMBRE: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "52px 56px",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  top: -120,
  right: -120,
  width: 460,
  height: 460,
  background: "radial-gradient(circle, rgba(255,124,60,.26) 0%, transparent 70%)",
  pointerEvents: "none",
};

const CARTE_SOMBRE: CSSProperties = {
  padding: "24px 28px",
  borderRadius: 18,
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
};

function Sombre({ section }: { section: SectionProbleme }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={PANNEAU_SOMBRE}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ ...SURTITRE, marginBottom: 18 }}>
            Votre problématique
          </div>
          <h2 style={{ ...TITRE, color: "#fff" }}>{titre}</h2>
          {suite ? (
            <p style={{ ...SOUS_PHRASE, color: "rgba(255,255,255,.62)" }}>
              {suite}
            </p>
          ) : null}
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {section.puces.map((puce, rang) => (
              <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
                <span style={NUMERO}>{numerote(rang)}</span>
                {puce.accroche ? (
                  <div style={{ ...ACCROCHE, color: "#fff" }}>
                    {puce.accroche}
                  </div>
                ) : null}
                <div style={{ ...TEXTE, color: "rgba(255,255,255,.62)" }}>
                  {puce.texte}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Rangee({ section }: { section: SectionProbleme }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 18 }}>
          Votre problématique
        </div>
        <h2 style={TITRE}>{titre}</h2>
        {suite ? <p style={SOUS_PHRASE}>{suite}</p> : null}
        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            // Autant de colonnes que de cartes : la maquette pose 4 cartes de
            // ~270px ou 5 de ~214px sur UNE rangée, jamais d'empilement.
            gridTemplateColumns: `repeat(${section.puces.length}, minmax(0, 1fr))`,
            gap: 12,
          }}
        >
          {section.puces.map((puce, rang) => (
            <div
              key={puce.accroche ?? puce.texte}
              style={{ ...VERRE, padding: "24px 28px" }}
            >
              {/* Le numéro orange est posé AU-DESSUS de l'accroche. */}
              <div style={{ ...NUMERO, marginBottom: 10 }}>
                {numerote(rang)}
              </div>
              {puce.accroche ? (
                <div style={ACCROCHE}>{puce.accroche}</div>
              ) : null}
              <div style={TEXTE}>{puce.texte}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProblemeOffre({
  section,
  altPhoto,
  photo,
}: ProprietesProblemeOffre) {
  if (section.variante === "panneau-sombre") return <Sombre section={section} />;
  if (section.variante === "rangee") return <Rangee section={section} />;

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
