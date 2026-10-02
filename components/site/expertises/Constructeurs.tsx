import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, LUEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { SectionConstructeurs } from "@/types/expertises";

import { Lueur } from "./commun";

/**
 * Les spécialisations constructeur, en panneau sombre avec son visuel.
 * Maquette, lignes 6412 à 6440.
 *
 * Sans visuel fourni, le panneau occupe toute la largeur plutôt que de laisser
 * une colonne grise vide.
 */

export default function Constructeurs({
  constructeurs,
}: {
  constructeurs: SectionConstructeurs;
}) {
  const { image } = constructeurs;
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: image ? "1fr 1fr" : "minmax(0,1fr)",
            gap: 0,
            borderRadius: "var(--rad)",
            overflow: "hidden",
            background: "var(--panel)",
          }}
        >
          <div style={{ padding: "46px 48px", position: "relative" }}>
            <Lueur
              style={{
                ...LUEUR,
                width: 380,
                height: 380,
                left: -150,
                right: "auto",
                bottom: -190,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={SURTITRE}>
                <TexteRiche texte={constructeurs.entete.surtitre} />
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(24px,2.6vw,34px) * var(--ts))/1.12 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "#fff",
                  margin: "0 0 16px",
                  maxWidth: "22ch",
                  textWrap: "balance",
                }}
              >
                <TexteRiche texte={constructeurs.entete.titre} />
              </h2>
              <p
                style={{
                  font: "400 16px/1.7 var(--fb)",
                  color: "rgba(255,255,255,.62)",
                  margin: "0 0 24px",
                }}
              >
                <TexteRiche texte={constructeurs.texte} />
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {constructeurs.lignes.map((ligne, i) => (
                  <div key={ligne.nom} style={{ display: "grid", gap: 10 }}>
                    {i > 0 ? (
                      <div
                        aria-hidden="true"
                        style={{ height: 1, background: "rgba(255,255,255,.1)" }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                      }}
                    >
                      <span
                        style={{
                          font: "600 12px var(--fb)",
                          letterSpacing: ".06em",
                          color: "var(--acc)",
                          flex: "none",
                          width: 96,
                        }}
                      >
                        <TexteRiche texte={ligne.nom} />
                      </span>
                      <span
                        style={{
                          font: "400 14.5px/1.5 var(--fb)",
                          color: "rgba(255,255,255,.72)",
                        }}
                      >
                        <TexteRiche texte={ligne.outils} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {image ? (
            <div
              style={{ minHeight: 420, background: "#3a3a3c", overflow: "hidden" }}
            >
              {/* `img` et non `next/image` : la hauteur vient de la colonne
                  voisine, pas des dimensions du fichier. `loading="lazy"` parce
                  que la section est loin sous la ligne de flottaison : sans lui,
                  React 19 pose un `<link rel="preload">` qui dispute la bande
                  passante au héros. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                  opacity: "var(--ph-op)",
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
