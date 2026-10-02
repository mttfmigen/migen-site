import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, LUEUR, PANNEAU, SECTION } from "@/components/site/blocs/habillage";
import type { CarteType, ContenuExpertises } from "@/types/expertises";

import { ETIQUETTE, Entete, Lueur, Puce, TROIS, VERRE_CARTE } from "./commun";

/**
 * Les six natures d'intervention, en cartes. Maquette, lignes 6240 à 6314.
 *
 * Une carte sur six passe en panneau sombre (`accent`) : la maquette la réserve
 * au curatif, qui est ce que le visiteur appelle « la panne ».
 */

function Carte({ carte }: { carte: CarteType }) {
  const clair = carte.accent === true;
  const base = {
    padding: "30px 32px 32px",
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <div style={clair ? { ...PANNEAU, ...base } : { ...VERRE_CARTE, ...base }}>
      {clair ? (
        <Lueur
          style={{
            ...LUEUR,
            right: -140,
            top: -160,
            bottom: "auto",
            background:
              "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
          }}
        />
      ) : null}
      <div
        style={{
          position: clair ? "relative" : undefined,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              font: "600 calc(20px * var(--ts)) var(--ft)",
              letterSpacing: "-.03em",
              color: clair ? "#fff" : "var(--ink)",
            }}
          >
            <TexteRiche texte={carte.titre} />
          </div>
          <span
            style={
              clair
                ? { ...ETIQUETTE, color: "#fff", backgroundColor: "#ff7c3c" }
                : ETIQUETTE
            }
          >
            <TexteRiche texte={carte.etiquette} />
          </span>
        </div>
        <p
          style={{
            font: "400 14.5px/1.65 var(--fb)",
            color: clair ? "rgba(255,255,255,.62)" : "var(--ink2)",
            margin: "0 0 18px",
          }}
        >
          <TexteRiche texte={carte.texte} />
        </p>
        {carte.puces.length > 0 ? (
          <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
            {carte.puces.map((p) => (
              <Puce key={p} texte={p} clair={clair} />
            ))}
          </div>
        ) : null}
        {carte.pied ? (
          <div
            style={{
              marginTop: "auto",
              paddingTop: 16,
              borderTop: `1px solid ${clair ? "rgba(255,255,255,.12)" : "var(--line)"}`,
              font: "400 13px/1.5 var(--fb)",
              color: clair ? "rgba(255,255,255,.5)" : "var(--ink4)",
            }}
          >
            <TexteRiche texte={carte.pied} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function TypesMaintenance({
  types,
}: {
  types: NonNullable<ContenuExpertises["types"]>;
}) {
  // `id="types"` : la cible du bouton secondaire du héros.
  return (
    <section id="types" style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <Entete entete={types.entete} />
          <div className="mg-rmulti" style={TROIS}>
            {types.cartes.map((carte) => (
              <Carte key={carte.titre} carte={carte} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
