import type { CSSProperties } from "react";

import { appliqueDecisions } from "@/lib/decisions-copie";

import RepliFormulaireMobile from "@/components/site/implantation/RepliFormulaireMobile";

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
  /**
   * Le chemin de la page, pour les décisions de copie à portée limitée
   * (`lib/decisions-copie.ts`). Absent, la phrase ci-dessous passe telle
   * quelle, et c'est le cas de tous les gabarits sauf OFFRE.
   */
  chemin?: string;
  /**
   * L'identifiant d'ancre à poser SUR LA SECTION, avec son `scroll-margin-top`.
   *
   * POURQUOI IL EST FACULTATIF, et pourquoi il ne s'écrit pas en dur ici : la
   * capture pose bien `id="mgx-form"` sur CETTE section
   * (`maquette/rendu/offres--residence.html`, bloc 1241, avec
   * `scroll-margin-top: 90px`), et c'est la raison de cette prop. Mais sept
   * autres gabarits enveloppent encore ce composant dans leur propre
   * `<div id="mgx-form">` (`offres/PageOffres`, `implantations/PageImplantations`,
   * `secteur/PageSecteur`, `expertises/PageExpertises`,
   * `expertises/specialite/PageSpecialite`, `expertises/domaine/PageDomaine`,
   * `implantation/PageVille`). Un identifiant écrit en dur ici donnerait DEUX
   * `id="mgx-form"` sur chacune de leurs pages, ce qu'aucun document HTML
   * n'autorise et que `verifie-ancres.mjs` ne mesure pas. Le gabarit qui a
   * retiré son enveloppe passe donc l'ancre, les autres non.
   */
  ancre?: string;
}

/**
 * La phrase du panneau, mot pour mot celle de la capture (relevée sur les 10
 * captures de la famille offre, dont `maquette/rendu/travaux-industriels.html`).
 *
 * ELLE EST SORTIE DU JSX POUR UNE SEULE RAISON : les décisions de copie à
 * portée limitée s'appliquent à une CHAÎNE. Dans le JSX, le texte était coupé
 * par le retour à la ligne, et aucune règle ne pouvait reconnaître « vous
 * présente les techniciens adaptés » à cheval sur deux lignes. Le rendu est
 * identique : JSX ramenait déjà ce retour à un espace simple.
 */
const PHRASE = "Rappel dans l\u2019heure aux horaires ouvrés. Un chargé d\u2019affaires qualifie votre besoin et vous présente les techniciens adaptés.";

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
  chemin,
  ancre,
}: ProprietesAppelFinal) {
  return (
    /* L'ANCRE EST SUR LA SECTION, PAS SUR UNE ENVELOPPE, et ce n'est pas une
       question de goût : la porte G17 (`scripts/verifie-offre-rendu.mjs`) lit
       les sections DIRECTES du `<main>` (`:scope > section`). Un
       `<div id="mgx-form">` entre les deux sortait l'appel final de cette
       liste, et la porte comptait 15 sections servies pour 16 dans la
       référence sans qu'aucun mot n'ait changé. La capture, elle, porte
       l'identifiant et le `scroll-margin-top` sur la section elle-même. */
    <section
      id={ancre}
      data-appel-final=""
      style={{
        padding: "var(--sec) 24px var(--sec)",
        ...(ancre ? { scrollMarginTop: 90 } : null),
      }}
    >
      {/* AU TÉLÉPHONE, LE FORMULAIRE COMPLET SE REPLIE derrière « Décrire mon
          besoin en détail » (libellé de la maquette mobile v2) : la page s'y
          ferme sur la carte « Être rappelé » (`RappelFinalOffre`), posée juste
          avant. Replié, pas retiré ; au-dessus de 880 px la bascule n'existe
          pas et rien ne change. Même repli que `editorial/Guide`. */}
      <RepliFormulaireMobile etiquette="Décrire mon besoin en détail">
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
            <p style={TEXTE}>{appliqueDecisions(PHRASE, chemin)}</p>
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
      </RepliFormulaireMobile>
    </section>
  );
}
