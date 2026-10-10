import Image from "next/image";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { SectionProbleme } from "@/types/contenu";

import { coupePunchline, numerote } from "./texte-offre";
import { cadragePhoto } from "@/lib/cadrage-photos";

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

/* Relevé des captures du 08/10 (`travaux-industriels--demantelement-
   industriel`, `expertises--hydraulique`, `implantations--…-agen` : même
   balisage) : lueur décalée en haut à droite, titre et sous-phrase propres à
   ce panneau, cartes au rayon `--rad`. */
const LUEUR: CSSProperties = {
  position: "absolute",
  top: -210,
  right: -170,
  width: 460,
  height: 460,
  background: "radial-gradient(circle, rgba(255,124,60,.26), transparent 68%)",
  pointerEvents: "none",
};

const TITRE_SOMBRE: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 12px",
  maxWidth: "22ch",
  textWrap: "balance",
};

const SOUS_PHRASE_SOMBRE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 30px",
  maxWidth: "56ch",
};

const CARTE_SOMBRE: CSSProperties = {
  padding: "22px 26px",
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

function Sombre({ section }: { section: SectionProbleme }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-pad" style={PANNEAU_SOMBRE}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ position: "relative" }}>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              Votre problématique
            </div>
            {titre ? <h2 style={TITRE_SOMBRE}>{titre}</h2> : null}
            <p style={SOUS_PHRASE_SOMBRE}>{suite}</p>
            <div
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {section.puces.map((puce, rang) => (
                <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
                  <span style={NUMERO}>{numerote(rang)}</span>
                  <div>
                    {puce.accroche ? (
                      <div style={{ ...ACCROCHE, color: "#fff" }}>
                        {puce.accroche}
                      </div>
                    ) : null}
                    <div style={{ ...TEXTE, color: "rgba(255,255,255,.62)" }}>
                      {puce.texte}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Relevé des captures du 08/10 (`offres--full-service`, `offres--arret-
   technique`, `implantations--lyon`, `secteurs--chimie` : même balisage) :
   en-tête sur deux colonnes, titre à gauche et sous-phrase alignée en bas à
   droite, puis une rangée de cartes en verre, numéro au-dessus. */
const RANGEE_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

const RANGEE_TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const RANGEE_SOUS_PHRASE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
};

const RANGEE_CARTE: CSSProperties = {
  ...VERRE,
  padding: "26px 24px 28px",
  display: "flex",
  flexDirection: "column",
};

function Rangee({ section }: { section: SectionProbleme }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={RANGEE_ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            {titre ? <h2 style={RANGEE_TITRE}>{titre}</h2> : null}
          </div>
          {suite ? <p style={RANGEE_SOUS_PHRASE}>{suite}</p> : null}
        </div>
        <div
          className="g3-pbgrid mg-rmulti"
          style={{
            display: "grid",
            // Autant de colonnes que de cartes : 4 ou 5 sur UNE rangée.
            gridTemplateColumns: `repeat(${section.puces.length}, minmax(0, 1fr))`,
            gap: 12,
          }}
        >
          {section.puces.map((puce, rang) => (
            <div key={puce.accroche ?? puce.texte} style={RANGEE_CARTE}>
              <span
                style={{
                  font: "600 24px/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                {numerote(rang)}
              </span>
              {puce.accroche ? (
                <div
                  style={{
                    font: "600 15px/1.35 var(--ft)",
                    letterSpacing: "-.018em",
                    marginBottom: 6,
                    color: "var(--ink)",
                  }}
                >
                  {puce.accroche}
                </div>
              ) : null}
              <div style={{ font: "400 13px/1.55 var(--fb)", color: "var(--ink2)" }}>
                {puce.texte}
              </div>
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
    <section data-screen-label="03 Problème" style={SECTION}>
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
          <div className="g3-sticky" style={{ position: "sticky", top: 110 }}>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            {titre ? <h2 style={TITRE}>{titre}</h2> : null}
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
                    /* Cadre 479x280, ratio 1,71. */
                    objectPosition: cadragePhoto(source, 479 / 280),
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
