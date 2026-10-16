import type { CSSProperties } from "react";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import {
  boutonBarreCollante,
  LIBELLE_ROND_TELEPHONE,
  sousLigneBarreCollante,
  type LibelleCible,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LA BARRE COLLANTE, DESSIN DE LA MAQUETTE V3 DEPUIS LE 16/10
 * (`maquette/mobile-v3/`, `stickyShow`) : une pilule de verre qui porte le
 * bouton orange à deux lignes (« Décrire mon besoin » / « Rappel dans l’heure,
 * jours ouvrés », pastille flèche) et un rond noir téléphone. En carrière :
 * « Postuler » / « Candidature en ligne ». Le rond n'a pas de texte : il est
 * nommé par l'`aria-label` de la V3. La géométrie de la v2 ci-dessous reste
 * pour l'histoire ; les trois traductions de portage valent toujours.
 *
 * L'ANCIENNE BARRE, MAQUETTE MOBILE V2, dc.html L191 :
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
  /* V3 : une pilule de verre qui porte les deux boutons. */
  height: "var(--conversion-barre-hauteur)",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: 5,
  borderRadius: 999,
  background: "rgba(255,255,255,.78)",
  backdropFilter: "blur(20px) saturate(170%)",
  WebkitBackdropFilter: "blur(20px) saturate(170%)",
  border: "1px solid rgba(255,255,255,.95)",
  boxShadow: "0 18px 40px -22px rgba(0,0,0,.5)",
};

/* V3, bouton principal : libellé, sous-ligne et pastille flèche. */
const PRINCIPAL: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  height: 48,
  padding: "0 6px 0 20px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  boxShadow: "0 10px 22px -12px rgba(255,124,60,.9)",
  textDecoration: "none",
};

const LIGNES: CSSProperties = { minWidth: 0, display: "grid", gap: 1 };

const COUPE: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

const LIBELLE: CSSProperties = { ...COUPE, font: "600 14.5px/1.15 var(--fb)" };

const SOUS_LIGNE: CSSProperties = {
  ...COUPE,
  font: "500 11px/1.2 var(--fb)",
  color: "rgba(255,255,255,.88)",
};

const PASTILLE_FLECHE: CSSProperties = {
  flex: "none",
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "rgba(255,255,255,.22)",
  display: "grid",
  placeItems: "center",
};

/* V3 : le rond noir, icône téléphone blanche. */
const ROND_TELEPHONE: CSSProperties = {
  flex: "none",
  width: 48,
  height: 48,
  borderRadius: 999,
  background: "#1c1b19",
  color: "#fff",
  display: "grid",
  placeItems: "center",
};

/** V3 `.mv-ic-arr` : la flèche blanche, 16 px. */
export function IconeFleche() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/** V3 `.mv-ic-tel` et `.mv-ic-telw` : le combiné, 21 px, dans la couleur passée. */
export function IconeTelephone({ couleur }: { couleur: string }) {
  return (
    <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24">
      <path
        fill={couleur}
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"
      />
    </svg>
  );
}

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
        <span style={LIGNES}>
          <span style={LIBELLE}>{principal.libelle}</span>
          <span style={SOUS_LIGNE}>{sousLigneBarreCollante(variante)}</span>
        </span>
        <span style={PASTILLE_FLECHE}>
          <IconeFleche />
        </span>
      </a>
      <a href={TELEPHONE_SITE.href} aria-label={LIBELLE_ROND_TELEPHONE} style={ROND_TELEPHONE}>
        <IconeTelephone couleur="#fff" />
      </a>
    </div>
  );
}
