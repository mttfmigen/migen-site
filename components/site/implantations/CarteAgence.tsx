import TexteRiche from "@/components/site/blocs/TexteRiche";
import { PANNEAU } from "@/components/site/blocs/habillage";
import type { AgenceImplantation } from "@/types/implantations";

import { LUEUR_HAUT, VERRE_IMPL } from "./habillage";

/**
 * Une agence, telle que la maquette la dessine.
 *
 * DEUX VARIANTES, UN SEUL CORPS : le siège prend la carte anthracite sur toute
 * la largeur de la grille, les autres une carte en verre sur une colonne. Seules
 * les encres changent, le reste est identique : dupliquer la carte pour deux
 * jeux de couleurs aurait produit deux dérives au premier ajustement.
 */

/** Largeur de la colonne des intitulés, dans la maquette. */
const COLONNE_INTITULE = 76;

export default function CarteAgence({
  agence,
}: {
  agence: AgenceImplantation;
}) {
  const sombre = agence.siege === true;

  const paires = [
    { label: "Rayon", valeur: agence.rayon },
    { label: "Rôle", valeur: agence.role },
  ].filter((p): p is { label: string; valeur: string } => !!p.valeur);

  const corps = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            font: "600 20px var(--ft)",
            letterSpacing: "-.03em",
            color: sombre ? "#fff" : "var(--ink)",
          }}
        >
          {agence.nom}
        </div>
        {agence.badge ? (
          <span
            style={{
              font: "600 10.5px var(--fb)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--acc)",
              whiteSpace: "nowrap",
            }}
          >
            {agence.badge}
          </span>
        ) : null}
      </div>

      {agence.lieu ? (
        <div
          style={{
            font: "400 13px var(--fb)",
            color: sombre ? "rgba(255,255,255,.5)" : "var(--ink4)",
            marginBottom: 18,
          }}
        >
          {agence.lieu}
        </div>
      ) : null}

      {agence.adresses && agence.adresses.length > 0 ? (
        // `address` plutôt qu'un `div` : c'est une adresse de contact, et
        // `font-style` est remis à plat, le navigateur l'italise par défaut.
        <address
          style={{
            font: "400 14px/1.6 var(--fb)",
            fontStyle: "normal",
            color: sombre ? "rgba(255,255,255,.72)" : "var(--ink2)",
            marginBottom: 18,
          }}
        >
          {agence.adresses.map((ligne, i) => (
            <span key={`${i}-${ligne.slice(0, 16)}`} style={{ display: "block" }}>
              {ligne}
            </span>
          ))}
        </address>
      ) : null}

      {paires.length > 0 ? (
        <>
          <div
            style={{
              height: 1,
              background: sombre ? "rgba(255,255,255,.12)" : "var(--line)",
              marginBottom: 16,
            }}
          />
          {/* Une liste de définitions : « Rayon » et « Rôle » sont les termes,
              leur contenu la définition. Rendu identique à la maquette, qui
              empile deux paires de `span` sans dire qu'elles vont ensemble. */}
          <dl style={{ display: "grid", gap: 10, margin: 0 }}>
            {paires.map((paire) => (
              <div
                key={paire.label}
                style={{ display: "flex", alignItems: "baseline", gap: 12 }}
              >
                <dt
                  style={{
                    font: "600 10px var(--fb)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: sombre ? "rgba(255,255,255,.45)" : "var(--ink4)",
                    flex: "none",
                    width: COLONNE_INTITULE,
                  }}
                >
                  {paire.label}
                </dt>
                <dd
                  style={{
                    font: "400 13.5px/1.5 var(--fb)",
                    color: sombre ? "rgba(255,255,255,.72)" : "var(--ink2)",
                    margin: 0,
                  }}
                >
                  <TexteRiche texte={paire.valeur} />
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </>
  );

  if (!sombre) {
    return (
      <div style={{ ...VERRE_IMPL, padding: "30px 32px 32px" }}>{corps}</div>
    );
  }

  return (
    <div
      style={{ ...PANNEAU, gridColumn: "span 3", padding: "30px 32px 32px" }}
    >
      <div aria-hidden="true" style={LUEUR_HAUT} />
      <div style={{ position: "relative" }}>{corps}</div>
    </div>
  );
}
