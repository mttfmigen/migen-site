import type { CSSProperties } from "react";

import type { AvisCasClients as Avis } from "@/types/casclients";

import { LARGEUR, VERRE } from "./habillage";

/**
 * Les avis Google : la note d'ensemble à gauche, trois verbatims à droite.
 *
 * Maquette lignes 6863 à 6891. Composant SERVEUR.
 *
 * SANS NOTE NI AVIS, PAS DE SECTION. Une note et un nombre d'avis sont des
 * chiffres vérifiables, qui bougent : ils viennent du contenu de la page, pas
 * d'une constante que personne ne rafraîchira.
 */

const CARTE_NOTE: CSSProperties = {
  ...VERRE,
  padding: 34,
  textAlign: "center",
};

const CARTE_AVIS: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad-s)",
  padding: "22px 26px",
  margin: 0,
};

const ETOILES = "★★★★★";

export interface ProprietesAvisCasClients {
  avis?: Avis;
}

export default function AvisCasClients({ avis }: ProprietesAvisCasClients) {
  if (!avis) return null;
  const verbatims = avis.verbatims ?? [];

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".7fr 1.3fr",
            gap: 44,
            alignItems: "center",
          }}
        >
          <div style={CARTE_NOTE}>
            <div
              style={{
                font: "600 calc(clamp(44px,5vw,66px) * var(--ts))/1 var(--ft)",
                letterSpacing: "-.05em",
                color: "var(--acc)",
              }}
            >
              {avis.note}
            </div>
            {/* Les étoiles n'ajoutent rien à la note, écrite juste au-dessus et
                répétée dans la mention : décoratives, donc masquées. */}
            <div
              aria-hidden="true"
              style={{
                font: "400 20px var(--fb)",
                color: "var(--acc)",
                letterSpacing: ".14em",
                margin: "12px 0 10px",
              }}
            >
              {ETOILES}
            </div>
            <div
              style={{
                font: "400 14px/1.5 var(--fb)",
                color: "var(--ink2)",
              }}
            >
              {avis.mention}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {verbatims.map((verbatim) => (
              <figure key={verbatim.texte} style={CARTE_AVIS}>
                {/* Ici les étoiles PORTENT l'information : rien d'autre ne dit
                    que l'avis est à cinq étoiles. Elles sont donc annoncées. */}
                <div
                  role="img"
                  aria-label="Note de cet avis : 5 sur 5"
                  style={{
                    font: "400 13px var(--fb)",
                    color: "var(--acc)",
                    letterSpacing: ".1em",
                    marginBottom: 10,
                  }}
                >
                  {ETOILES}
                </div>
                <blockquote style={{ margin: 0 }}>
                  <p
                    style={{
                      font: "400 15px/1.6 var(--fb)",
                      color: "var(--ink1)",
                      margin: "0 0 10px",
                      maxWidth: "66ch",
                    }}
                  >
                    {verbatim.texte}
                  </p>
                </blockquote>
                <figcaption
                  style={{ font: "500 13px var(--fb)", color: "var(--ink2)" }}
                >
                  {verbatim.contexte}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
