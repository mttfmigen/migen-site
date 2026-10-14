import Image from "next/image";
import Link from "next/link";

import s from "../Entete.module.css";
import { dureeLecture, RES_A_LA_UNE } from "../entete-donnees";
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
 * Depuis le 14/10 au soir (Mehdi, catégories masquées) : sur toute la largeur,
 * les trois articles « À la une » du hub en cartes à photo (format, durée de
 * lecture, titre) et le bouton « Accéder à toutes nos ressources ». Les
 * données sont dans `entete-donnees.ts`, tenues par
 * `scripts/verifie-menu-ressources.mjs`.
 */
export default function PanneauRessources() {
  return (
    <div
      className="mg-r2"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: 22,
        alignItems: "stretch",
      }}
    >
      <div>
        {/* 14/10, Mehdi : « masque pour le moment les catégories, affiche juste
            les ressources et mets un bouton Accéder à toutes nos ressources ».
            Le bloc des espaces et de leurs comptes est retiré du panneau ; ses
            données (RES_ESPACES) restent dans entete-donnees.ts. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <SurTitre marge={0}>À la une</SurTitre>
          <Link
            href="/ressources/"
            className={s.ctaPanneau}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              padding: "11px 18px",
              borderRadius: 999,
              font: "600 13.5px var(--fb)",
            }}
          >
            Accéder à toutes nos ressources
          </Link>
        </div>
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
                /* Pleine largeur depuis le retrait du bloc des espaces : les
                   cartes font 337 px à 1440, comme celles de Cas clients. */
                sizes="(max-width: 1000px) 50vw, 340px"
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
