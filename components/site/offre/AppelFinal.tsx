import type { CSSProperties } from "react";

import PanneauFormulaire from "./PanneauFormulaire";

/**
 * Section « 10 Appel final » de la capture
 * (`maquette/rendu/offres--residence.html`) : un grand panneau anthracite,
 * la question du corpus (`ctaFinal.question`) en H2 blanc, le paragraphe fixe
 * du gabarit, et le même panneau de formulaire que le héros, posé sur un fond
 * blanc.
 *
 * Monté par `PageOffre` À LA PLACE de `FormulaireBasDePage`, qui reste intact
 * pour les autres gabarits. TROUS SIGNALÉS : la capture ne rend ni le rappel
 * téléphonique du corpus (« ou appelez le 04 78 33 72 05… ») ni le libellé de
 * bouton du corpus (« Demander un profil pour mon site ») ; ils ne sont donc
 * pas rendus ici.
 *
 * ÉCART À LA CAPTURE, hérité du composant partagé `FormulaireContact` via
 * `PanneauFormulaire` (où il est détaillé) : ÉCART ASSUMÉ (RGPD articles 13
 * et 14), mention de traitement des données sous le formulaire, absente de la
 * capture. Le bouton d'envoi répète le titre du panneau, comme la capture.
 */

export interface ProprietesAppelFinal {
  /** La question du corpus. Sans elle, le panneau porte le formulaire seul. */
  question?: string;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /**
   * L'en-tête du panneau de formulaire. À défaut, le libellé relevé sur la
   * capture de la page pilote. AJOUTÉ LE 07/10 : la capture de
   * `/offres/zero-arret/` écrit « Demander mon diagnostic gratuit ».
   */
  bouton?: string;
}

const PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  borderRadius: 40,
  background: "var(--panel)",
  padding: 52,
  position: "relative",
  overflow: "hidden",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 640,
  height: 640,
  left: "50%",
  top: -300,
  transform: "translateX(-50%)",
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
  pointerEvents: "none",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.4vw,46px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 14px",
  textWrap: "balance",
};

const TEXTE: CSSProperties = {
  font: "400 15.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: 0,
  maxWidth: "40ch",
};

export default function AppelFinal({
  question,
  formulaire,
  bouton = "Parler à un chargé d'affaires",
}: ProprietesAppelFinal) {
  return (
    <section style={{ padding: "var(--sec) 24px var(--sec)" }}>
      <div className="mg-pad" style={PANNEAU}>
        <div aria-hidden="true" style={LUEUR} />
        <div
          className="mg-r2"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 44,
            alignItems: "center",
            textAlign: "left",
          }}
        >
          <div>
            {question ? <h2 style={TITRE}>{question}</h2> : null}
            <p style={TEXTE}>
              Rappel dans l’heure aux horaires ouvrés. Un chargé d’affaires
              qualifie votre besoin et vous présente les techniciens adaptés.
            </p>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--rad)",
              color: "var(--ink)",
            }}
          >
            <PanneauFormulaire
              formulaire={formulaire}
              titre={bouton}
              pastille="Rappel dans l’heure"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
