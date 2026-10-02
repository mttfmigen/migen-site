import Image from "next/image";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { PanneauInternational } from "@/types/implantations";

import { LUEUR_HAUT } from "./habillage";

/**
 * Le panneau international : une photo à gauche, le propos et les bureaux à
 * droite, sur fond anthracite.
 *
 * La photo passe par `next/image` avec `fill` : la maquette la pose en
 * `object-fit: cover` sans dimension connue, et c'est le motif déjà retenu
 * ailleurs sur le site (`SecteursAccueil`).
 */
export default function BlocInternational({
  panneau,
}: {
  panneau: PanneauInternational;
}) {
  const bureaux = panneau.bureaux ?? [];

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            borderRadius: "var(--rad)",
            overflow: "hidden",
            background: "var(--panel)",
          }}
        >
          {panneau.image ? (
            <div
              style={{
                position: "relative",
                minHeight: 320,
                background: "#3a3a3c",
                overflow: "hidden",
              }}
            >
              <Image
                src={panneau.image.src}
                alt={panneau.image.alt}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                  opacity: "var(--ph-op)",
                }}
              />
            </div>
          ) : null}

          <div style={{ padding: "46px 48px", position: "relative" }}>
            <div
              aria-hidden="true"
              style={{ ...LUEUR_HAUT, width: 380, height: 380 }}
            />
            <div style={{ position: "relative" }}>
              <div style={SURTITRE}>À l’international</div>
              {panneau.titre ? (
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
                  {panneau.titre}
                </h2>
              ) : null}
              {panneau.texte ? (
                <p
                  style={{
                    font: "400 16px/1.7 var(--fb)",
                    color: "rgba(255,255,255,.62)",
                    margin: "0 0 24px",
                  }}
                >
                  <TexteRiche texte={panneau.texte} />
                </p>
              ) : null}
              {bureaux.length > 0 ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {bureaux.map((bureau, i) => (
                    <div
                      key={`${i}-${bureau.nom}`}
                      style={{
                        padding: "18px 20px",
                        borderRadius: "var(--rad-s)",
                        background: "rgba(255,255,255,.07)",
                        border: "1px solid rgba(255,255,255,.12)",
                      }}
                    >
                      <div
                        style={{
                          font: "600 15px var(--ft)",
                          letterSpacing: "-.02em",
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {bureau.nom}
                      </div>
                      <div
                        style={{
                          font: "400 13.5px/1.55 var(--fb)",
                          color: "rgba(255,255,255,.6)",
                        }}
                      >
                        {bureau.lignes.map((ligne, j) => (
                          <span
                            key={`${j}-${ligne.slice(0, 16)}`}
                            style={{ display: "block" }}
                          >
                            {ligne}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
