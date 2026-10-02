import Link from "next/link";

import s from "../Entete.module.css";
import { DOMAINES, SECTEURS, SPECIALISATIONS } from "../entete-donnees";
import { SurTitreLarge } from "./blocs";

const COLONNES = [
  { titre: "Domaines d’activité", liens: DOMAINES },
  { titre: "Secteurs d’activité", liens: SECTEURS },
];

/** Panneau « Expertises » : deux listes en deux colonnes, puis l'encart orange. */
export default function PanneauExpertises() {
  return (
    <div
      className="mg-r2"
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1.1fr .8fr",
        gap: 44,
      }}
    >
      {COLONNES.map((colonne) => (
        <div key={colonne.titre}>
          <SurTitreLarge>{colonne.titre}</SurTitreLarge>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 20px",
            }}
          >
            {colonne.liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className={s.lienListe}
                style={{ font: "500 14px/2 var(--fb)" }}
              >
                {lien.libelle}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          background: "var(--acc-w)",
          border: "1px solid rgba(255,124,60,.28)",
          borderRadius: "var(--rad-s)",
          padding: 22,
        }}
      >
        <Link
          href="/expertises/"
          className={s.lienFort}
          style={{
            display: "block",
            font: "600 14.5px var(--ft)",
            letterSpacing: "-.02em",
            marginBottom: 10,
          }}
        >
          Toutes nos expertises →
        </Link>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {SPECIALISATIONS.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={s.lienListe}
              style={{
                font: "500 12px var(--fb)",
                padding: "5px 11px",
                borderRadius: 999,
                background: "var(--card)",
                border: "1px solid var(--line)",
              }}
            >
              {lien.libelle}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
