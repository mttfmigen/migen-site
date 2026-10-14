import type { CSSProperties } from "react";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import {
  boutonBarreCollante,
  LIBELLE_APPELER,
  type LibelleCible,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LA BARRE COLLANTE DE LA MAQUETTE MOBILE V2, dc.html L191 :
 *
 *   <div style="position:absolute;left:12px;right:12px;bottom:76px;z-index:25;
 *     display:flex;gap:8px">
 *     <a … flex:1;height:50px;border-radius:999px;background:#ff7c3c;color:#fff;
 *       font:600 14.5px var(--fb);box-shadow:0 14px 30px -12px rgba(255,124,60,.85)>
 *       {{ stickyL }}</a>
 *     <a href="tel:0478337205" … height:50px;padding:0 18px;border-radius:999px;
 *       background:rgba(255,255,255,.92);backdrop-filter:blur(16px);
 *       border:1px solid rgba(255,255,255,.9);color:#1c1b19;font:600 14px var(--fb)>
 *       Appeler</a>
 *   </div>
 *
 * TROIS TRADUCTIONS DE PORTAGE, chacune avec sa raison :
 * 1. `position:fixed` au lieu d'`absolute` : dans la maquette la barre vit
 *    dans le cadre du téléphone d'aperçu, et ses 76px du bas enjambent la
 *    barre d'onglets de CE cadre. En production il n'y a pas de cadre :
 *    la barre se pose à `--conversion-barre-marge` du bas, au-dessus de la
 *    zone de geste (`env(safe-area-inset-bottom)`), précédent déjà posé par
 *    `components/site/BarreActionMobile.tsx` le 10/10.
 * 2. `data-mobile-seulement` : la barre n'existe que sous 881px, le seuil où
 *    l'îlot d'en-tête perd sa navigation (`Entete.module.css` L162). La règle
 *    vit dans `app/globals.css`, section « couche de conversion mobile ».
 * 3. ELLE NE RECOUVRE JAMAIS LE CONTENU : `data-barre-collante` déclenche,
 *    dans la même section de `globals.css`, un `padding-bottom` compensatoire
 *    sur `body` égal à la place qu'elle occupe. Mesuré le 10/10 sur la barre
 *    v1 : sans cette réserve, elle couvrait les 68 derniers pixels du pied de
 *    page sur les 248 pages, réglage CNIL compris.
 *
 * dc.html L580 : pas de barre sur la page Contact (`stickyShow: g !== "contact"`),
 * ni menu ouvert ; c'est l'appelant (lot intégration) qui tient ces deux états,
 * voir `barreCollanteVisible` dans `conversion-donnees.ts`.
 *
 * Le téléphone vient de `TELEPHONE_SITE` (même numéro que le
 * `tel:0478337205` de la maquette, au format international du site).
 */

const BARRE: CSSProperties = {
  position: "fixed",
  left: "var(--conversion-barre-marge)",
  right: "var(--conversion-barre-marge)",
  bottom: "calc(var(--conversion-barre-marge) + env(safe-area-inset-bottom))",
  zIndex: 25,
  display: "flex",
  gap: 8,
};

/* dc.html L191, bouton principal, valeurs recopiées telles quelles. */
const PRINCIPAL: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "var(--conversion-barre-hauteur)",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px var(--fb)",
  boxShadow: "0 14px 30px -12px rgba(255,124,60,.85)",
  textDecoration: "none",
};

/* dc.html L191, bouton « Appeler », valeurs recopiées telles quelles. */
const APPELER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "var(--conversion-barre-hauteur)",
  padding: "0 18px",
  borderRadius: 999,
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,.9)",
  color: "#1c1b19",
  font: "600 14px var(--fb)",
  textDecoration: "none",
};

export interface BarreCollanteMobileProps {
  variante?: VarianteConversion;
  /** La page porte son propre CTA (dc.html `P.cta`) : il remplace le défaut. */
  bouton?: LibelleCible;
}

export default function BarreCollanteMobile({
  variante = "standard",
  bouton,
}: BarreCollanteMobileProps) {
  const principal = bouton ?? boutonBarreCollante(variante);
  return (
    <div data-mobile-seulement data-barre-collante style={BARRE}>
      <a href={principal.href} style={PRINCIPAL}>
        {principal.libelle}
      </a>
      <a href={TELEPHONE_SITE.href} style={APPELER}>
        {LIBELLE_APPELER}
      </a>
    </div>
  );
}
