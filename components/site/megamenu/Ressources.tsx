import Link from "next/link";

import s from "../Entete.module.css";
import {
  RES_FORMATS,
  RES_SITUATIONS,
  TOTAL_RESSOURCES,
} from "../entete-donnees";
import { RangeeDecrite, SurTitre } from "./blocs";

/** Panneau « Ressources » : par format à gauche, par situation à droite. */
export default function PanneauRessources() {
  return (
    <div
      className="mg-r2"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
    >
      <div>
        <SurTitre marge={14}>Par format</SurTitre>
        <div style={{ display: "grid", gap: 1 }}>
          {RES_FORMATS.map((format) => (
            <RangeeDecrite key={format.libelle} {...format} />
          ))}
        </div>
      </div>
      <div>
        <SurTitre marge={14}>Par situation</SurTitre>
        <div style={{ display: "grid", gap: 1 }}>
          {RES_SITUATIONS.map((lien) => (
            <Link
              key={lien.libelle}
              href={lien.href}
              className={s.rangee}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 11px",
                borderRadius: 11,
              }}
            >
              <span
                style={{
                  font: "400 13px var(--fb)",
                  color: "var(--ink4)",
                  flex: "none",
                }}
                aria-hidden="true"
              >
                ›
              </span>
              <span
                style={{ font: "500 13.5px var(--fb)", color: "var(--ink1)" }}
              >
                {lien.libelle}
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/ressources/"
          className={s.lienAccent}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            margin: "16px 0 0 11px",
            font: "600 13px var(--fb)",
          }}
        >
          {/* LE COMPTE EST CALCULÉ, plus écrit. La maquette annonce « Les 23
              ressources », vrai pour sa bibliothèque à elle et faux pour le
              site publié, qui en sert 35 (voir TOTAL_RESSOURCES dans
              entete-donnees.ts). Signalé par Mehdi le 12/10. */}
          Les {TOTAL_RESSOURCES} ressources →
        </Link>
      </div>
    </div>
  );
}
