import type { CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import { VERRE } from "@/components/site/blocs/habillage";

/**
 * Le panneau de formulaire en verre du gabarit OFFRE, posé deux fois par la
 * maquette : colonne droite du héros (capture, section « 01 Héros ») et
 * colonne droite de l'appel final (« 10 Appel final »). Même dessin aux deux
 * emplacements : pastille « Rappel dans l'heure », titre, puis le formulaire.
 *
 * Valeurs relevées dans `maquette/rendu/offres--residence.html`.
 *
 * ÉCARTS À LA CAPTURE, portés par `FormulaireContact` (composant partagé, hors
 * périmètre du gabarit offre, contrat propre fondé sur « Migen - Site
 * final.dc.html ») :
 *
 *   1. Le bouton d'envoi répète le titre du panneau et tient toute la largeur,
 *      comme la capture (tpl 87). SANS TITRE (sept sous-pages, binding vide de
 *      la maquette : l'en-tête ET le bouton y sont vides), le bouton prend le
 *      libellé par défaut du formulaire : un bouton sans nom ne s'annonce pas.
 *   2. ÉCART ASSUMÉ (obligation légale, RGPD articles 13 et 14) : la mention
 *      « Données traitées par Migen… politique de confidentialité » sous le
 *      formulaire (FormulaireContact.tsx, l. 392-405) est absente de la
 *      capture. Information obligatoire au point de collecte : elle reste.
 */

export interface ProprietesPanneauFormulaire {
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /** Le titre du panneau. « Parler à un chargé d'affaires » dans la capture. */
  titre: string;
  /** La pastille au-dessus du titre. « Rappel dans l'heure » dans la capture. */
  pastille?: string;
  /** L'ancre posée sur le panneau. Le héros porte `besoin`, l'appel final rien. */
  id?: string;
}

const PANNEAU: CSSProperties = {
  ...VERRE,
  position: "relative",
  scrollMarginTop: 110,
  padding: "30px 30px 32px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
};

const ENTETE: CSSProperties = { marginBottom: 20 };

const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--acc)",
  background: "var(--acc-w)",
  padding: "5px 12px",
  borderRadius: 999,
  marginBottom: 10,
  whiteSpace: "nowrap",
};

const PASTILLE_PUCE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

const TITRE: CSSProperties = {
  font: "600 20px/1.25 var(--ft)",
  letterSpacing: "-.03em",
};

export default function PanneauFormulaire({
  formulaire,
  titre,
  pastille,
  id,
}: ProprietesPanneauFormulaire) {
  return (
    <div id={id} style={PANNEAU}>
      <div style={ENTETE}>
        {pastille ? (
          <div style={PASTILLE}>
            <span aria-hidden="true" style={PASTILLE_PUCE} />
            {pastille}
          </div>
        ) : null}
        <div style={TITRE}>{titre}</div>
      </div>
      <FormulaireContact
        formulaire={formulaire}
        libelleEnvoi={titre || undefined}
        variante="panneau"
      />
    </div>
  );
}
