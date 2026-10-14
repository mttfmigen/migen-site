import type { CSSProperties } from "react";

import {
  boutonBandeau,
  ID_BANDEAU,
  texteBandeau,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LE BANDEAU « ÊTRE RAPPELÉ », motif `isMiniCta` de la maquette mobile v2,
 * dc.html L127 :
 *
 *   <div … margin:12px 18px 0;display:flex;align-items:center;
 *     justify-content:space-between;gap:12px;padding:14px 14px 14px 16px;
 *     border-radius:20px;background:rgba(255,124,60,.1)>
 *     <span … font:600 14px/1.35 var(--ft);letter-spacing:-.015em;color:#1c1b19>{{ sx.t }}</span>
 *     <a … flex:none;display:flex;align-items:center;min-height:44px;
 *       padding:0 16px;border-radius:999px;background:#1c1b19;color:#fff;
 *       font:600 13px var(--fb);white-space:nowrap>{{ sx.btn.label }}</a>
 *   </div>
 *
 * SA CADENCE : toutes les 3 sections de contenu après le photo + CTA
 * (5e, 8e, 11e…), dc.html L455. Elle vit dans `insertionApresSection` de
 * `conversion-donnees.ts` ; le branchement sur les gabarits est le lot
 * intégration. Le bouton renvoie à l'ancre `#etre-rappele` du rappel de bas
 * de page (dc.html L437) : les deux motifs vont ensemble.
 *
 * PLUSIEURS BANDEAUX SUR UNE MÊME PAGE : passer un `id` distinct à partir du
 * deuxième (« une-question-2 », « une-question-3 »…), comme le fait l'`uid()`
 * de la maquette (dc.html L414). Deux éléments de même id ne sont pas du HTML
 * valide ; `demonstration.tsx` montre le motif.
 */

const BANDEAU: CSSProperties = {
  margin: "12px 18px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 14px 14px 16px",
  borderRadius: 20,
  background: "rgba(255,124,60,.1)",
};

const TEXTE: CSSProperties = {
  font: "600 14px/1.35 var(--ft)",
  letterSpacing: "-.015em",
  color: "#1c1b19",
};

const BOUTON: CSSProperties = {
  flex: "none",
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 999,
  background: "#1c1b19",
  color: "#fff",
  font: "600 13px var(--fb)",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

export interface BandeauRappelMobileProps {
  variante?: VarianteConversion;
  id?: string;
}

export default function BandeauRappelMobile({
  variante = "standard",
  id = ID_BANDEAU,
}: BandeauRappelMobileProps) {
  const bouton = boutonBandeau(variante);
  return (
    <div id={id} data-mobile-seulement style={BANDEAU}>
      <span style={TEXTE}>{texteBandeau(variante)}</span>
      <a href={bouton.href} style={BOUTON}>
        {bouton.libelle}
      </a>
    </div>
  );
}
