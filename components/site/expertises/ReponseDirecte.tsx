import type { CSSProperties } from "react";

import { SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import { numerote } from "@/components/site/offre/texte-offre";
import type { ContenuHubExpertises } from "@/types/expertises";

/**
 * Écran « 02 Réponse directe » du hub, relevé sur
 * `maquette/rendu/expertises.html` (blocs 287 à 302) : à gauche surtitre, H2
 * et paragraphe ; à droite une carte en verre de rangées numérotées 01 à 04.
 *
 * POURQUOI PAS `offre/ReponseDirecte`. Celui du gabarit 03 rend la variante
 * SANS liste (`noMissions` de `MigenExpertise.dc.html`, l. 172), sur une
 * colonne, surtitre figé « Pourquoi Migen ? ». La capture du hub rend la
 * variante À LISTE (`hasMissions`, l. 162), surtitre de la page. Le composant
 * partagé n'est pas touché.
 */

export type ProprietesReponseDirecte = NonNullable<
  ContenuHubExpertises["reponse"]
>;

/* Bloc 289 : la largeur et la grille sont portées par le même élément. */
const GRILLE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
  gap: 48,
  alignItems: "start",
};

/* Bloc 293. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(24px,2.4vw,32px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  margin: "0 0 14px",
  maxWidth: "22ch",
  textWrap: "balance",
};

/* Bloc 295. */
const TEXTE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "56ch",
  textWrap: "pretty",
};

/* Bloc 296 : l'ombre est plus profonde que celle de `VERRE`. */
const CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
  borderRadius: "var(--rad)",
  padding: "6px 30px",
};

/* Blocs 298 à 302. */
const RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px minmax(0,1fr)",
  gap: 16,
  padding: "18px 0",
  borderBottom: "1px solid var(--line)",
};
const NUMERO: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "var(--acc-w)",
  // Contraste AA : l'orange de marque donnait 2,22:1 sur ce fond clair, --acc-ink donne 7,76:1.
  color: "var(--acc-ink)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 12.5px ui-monospace,Menlo,monospace",
};
const TITRE_POINT: CSSProperties = {
  font: "600 16px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 4,
};
const TEXTE_POINT: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

export default function ReponseDirecte({
  surtitre,
  titre,
  texte,
  points,
}: ProprietesReponseDirecte) {
  return (
    <section style={SECTION}>
      <div className="mg-r2" style={GRILLE}>
        <div>
          <div style={SURTITRE}>{surtitre}</div>
          <h2 style={TITRE}>{titre}</h2>
          {texte ? <p style={TEXTE}>{texte}</p> : null}
        </div>
        {points.length > 0 ? (
          <div style={CARTE}>
            {points.map((point, rang) => (
              <div key={point.titre} style={RANGEE}>
                <span style={NUMERO}>{numerote(rang)}</span>
                <div>
                  <div style={TITRE_POINT}>{point.titre}</div>
                  <p style={TEXTE_POINT}>{point.texte}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
