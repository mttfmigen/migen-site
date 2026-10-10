import type { CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";


interface Proprietes {
  /** Identifiant d'analyse de la soumission, repris par HubSpot. */
  formulaire?: string;
  /**
   * Titre et introduction du bloc.
   *
   * Par défaut, la copie de la page d'accueil. Un gabarit dont la maquette
   * écrit autre chose les fournit : la page expertises demande « Votre panne
   * est à cheval sur deux métiers ? ». Les valeurs par défaut gardent les
   * appelants existants inchangés.
   */
  titre?: string;
  intro?: string;
}

const TITRE_ACCUEIL = "Décrivez la situation, on vous dit quelle offre tient.";
const INTRO_ACCUEIL =
  "Cinq lignes suffisent. Si aucune des six offres ne convient, nous le disons aussi.";

const VERRE: CSSProperties = {
  borderRadius: 36,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
  padding: "44px 46px 46px",
};

export default function FormulaireBasDePage({
  formulaire = "accueil-bas-de-page",
  titre = TITRE_ACCUEIL,
  intro = INTRO_ACCUEIL,
}: Proprietes) {
  return (
    // L'ancre sert les appels à l'action des sections du dessus. La marge de
    // défilement évite que l'îlot de navigation ne recouvre le titre.
    <section
      id="formulaire"
      style={{ padding: "var(--sec) 0 var(--sec)", scrollMarginTop: 110 }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="" style={VERRE}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: ".82fr 1.18fr",
              gap: 48,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  // Contraste AA : l'orange de marque donnait 2,45:1 sur ce fond clair, --acc-ink donne 8,57:1.
                  color: "var(--acc-ink)",
                  marginBottom: 16,
                }}
              >
                Décrire mon besoin
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(24px,2.6vw,36px) * var(--ts))/1.1 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: "0 0 14px",
                  maxWidth: "20ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h2>
              <p
                style={{
                  font: "400 16px/1.65 var(--fb)",
                  color: "var(--ink2)",
                  margin: "0 0 22px",
                  maxWidth: "38ch",
                }}
              >
                {intro}
              </p>
            </div>
            <div style={{ minWidth: 0 }}>
              <FormulaireContact
                formulaire={formulaire}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
