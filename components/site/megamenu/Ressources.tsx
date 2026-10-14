import Image from "next/image";
import Link from "next/link";

import s from "../Entete.module.css";
import { dureeLecture, RES_A_LA_UNE, RES_ESPACES } from "../entete-donnees";
import { SurTitre } from "./blocs";
import { altPhoto } from "@/lib/descriptions-photos";

/** Pastille de verre posée sur la photo, celle des cartes « À la une » du hub. */
const PASTILLE_VERRE: React.CSSProperties = {
  whiteSpace: "nowrap",
  padding: "5px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,.18)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,.28)",
  color: "#fff",
};

/**
 * Panneau « Ressources », refait le 14/10 au dessin du panneau « Cas clients »
 * (`Preuves.tsx`), à la demande de Mehdi : plus aucun lien vers l'ancienne
 * maquette, seulement le hub /ressources/ (maquette Ressources v2) et ses
 * articles.
 *
 * À gauche, le bloc anthracite des deux espaces du hub, chacun avec les vrais
 * comptes de ses formats, et le lien vers le hub. À droite, les trois articles
 * « À la une » du hub en cartes à photo : format, durée de lecture, titre.
 * Les données et leurs comptes sont dans `entete-donnees.ts`, tenus par
 * `scripts/verifie-menu-ressources.mjs`.
 */
export default function PanneauRessources() {
  return (
    <div
      className="mg-r2"
      style={{
        display: "grid",
        gridTemplateColumns: ".9fr 1.7fr",
        gap: 22,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          borderRadius: 20,
          background: "#1c1b19",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            right: -110,
            top: -120,
            background:
              "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
          }}
        />
        {RES_ESPACES.map((espace, rang) => (
          <div
            key={espace.libelle}
            style={{
              position: "relative",
              paddingTop: rang ? 14 : 0,
              borderTop: rang ? "1px solid rgba(255,255,255,.12)" : "none",
            }}
          >
            <SurTitre marge={10}>{espace.libelle}</SurTitre>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 12,
              }}
            >
              {espace.formats.map((format) => (
                <div key={format.libelle}>
                  <div
                    style={{
                      font: "600 24px var(--ft)",
                      letterSpacing: "-.04em",
                      color: "#fff",
                    }}
                  >
                    {format.nombre}
                  </div>
                  <div
                    style={{
                      font: "400 12px/1.35 var(--fb)",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    {format.libelle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Link
          href="/ressources/"
          className={s.ctaPanneau}
          style={{
            position: "relative",
            marginTop: "auto",
            display: "inline-flex",
            justifyContent: "center",
            padding: "12px 18px",
            borderRadius: 999,
            font: "600 13.5px var(--fb)",
          }}
        >
          Toutes les ressources →
        </Link>
      </div>
      <div>
        <SurTitre>À la une</SurTitre>
        <div
          className="mg-rq3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 10,
          }}
        >
          {RES_A_LA_UNE.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className={s.carteCas}
              style={{
                position: "relative",
                display: "block",
                height: 232,
                borderRadius: 18,
                overflow: "hidden",
                background: "#1c1b19",
              }}
            >
              <Image
                src={article.image}
                alt={altPhoto(article.image)}
                fill
                sizes="(max-width: 1000px) 50vw, 230px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.7)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top,rgba(18,17,16,.92),rgba(18,17,16,.1) 70%)",
                }}
              />
              <span
                style={{
                  ...PASTILLE_VERRE,
                  position: "absolute",
                  top: 12,
                  left: 12,
                  font: "600 11px var(--fb)",
                }}
              >
                {article.format}
              </span>
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                }}
              >
                <div
                  style={{
                    font: "600 10.5px ui-monospace,Menlo,monospace",
                    color: "rgba(255,255,255,.7)",
                    marginBottom: 6,
                  }}
                >
                  {dureeLecture(article)}
                </div>
                <div
                  style={{
                    font: "600 15px/1.25 var(--ft)",
                    letterSpacing: "-.02em",
                    textWrap: "balance",
                  }}
                >
                  {article.libelle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
