import Link from "next/link";

import s from "../Entete.module.css";
import { CONCEPTION, OFFRES } from "../entete-donnees";
import { PASTILLE, RangeeOffre, SurTitre } from "./blocs";

export interface PanneauOffresProps {
  /**
   * Cible du « Diagnostic gratuit ». Aucune URL de ce nom n'existe dans
   * l'inventaire du site : sans valeur, l'entrée ne s'affiche pas plutôt que
   * de pointer vers un chemin deviné.
   */
  hrefDiagnostic?: string;
}

/** Panneau « Offres » : deux colonnes de rangées à vignette. */
export default function PanneauOffres({ hrefDiagnostic }: PanneauOffresProps) {
  return (
    <div
      className="mg-r2"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
    >
      <div>
        {/* Le bouton de la barre ouvre le panneau au lieu de naviguer : c'est
            donc le sur-titre qui porte le lien vers la page pilier. */}
        <SurTitre>
          <Link href="/offres/" className={s.lienSurTitre}>
            Nos offres
          </Link>
        </SurTitre>
        {OFFRES.map((offre) => (
          <RangeeOffre key={offre.href} offre={offre} />
        ))}
      </div>
      <div>
        <SurTitre>Conception &amp; réalisation</SurTitre>
        {CONCEPTION.map((offre) => (
          <RangeeOffre key={offre.href} offre={offre} />
        ))}
        <div
          style={{ height: 1, background: "var(--line)", margin: "12px 14px" }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "0 14px",
          }}
        >
          <Link
            href="/partenaires/"
            className={s.lienListe}
            style={{
              font: "600 12.5px var(--fb)",
              padding: "7px 13px",
              borderRadius: 999,
              background: "var(--card)",
              border: "1px solid var(--line)",
            }}
          >
            Partenaires
          </Link>
          {hrefDiagnostic && (
            <Link
              href={hrefDiagnostic}
              className={s.lienAccent}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                font: "600 12.5px var(--fb)",
                padding: "7px 13px",
                borderRadius: 999,
                background: "var(--acc-w)",
                border: "1px solid rgba(255,124,60,.3)",
              }}
            >
              <span style={PASTILLE} />
              Diagnostic gratuit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
