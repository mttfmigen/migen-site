import type { CSSProperties } from "react";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import { IconeFleche, IconeTelephone } from "./BarreCollanteMobile";
import {
  boutonPhotoCta,
  ID_PHOTO_CTA,
  LIBELLE_ROND_TELEPHONE,
  surTitrePhotoCta,
  titrePhotoCta,
  type LibelleCible,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LE PHOTO + CTA APRÈS LA 2e SECTION, motif `isPhotoCta`. DEPUIS LE 16/10,
 * LES BOUTONS SONT CEUX DE LA V3 (`maquette/mobile-v3/`) : le bouton orange
 * porte sa pastille flèche, et la pilule « Appeler » devient un rond blanc
 * téléphone, nommé par l'`aria-label` de la V3. Le reste est inchangé. Le
 * dessin de la v2, dc.html L127 :
 *
 *   <section … margin:14px 18px 0;position:relative;border-radius:24px;
 *     overflow:hidden;min-height:300px;background:#2a2927 center/cover no-repeat;
 *     display:flex;flex-direction:column;justify-content:flex-end>
 *     <div … background:linear-gradient(180deg,rgba(18,17,16,.05) 20%,rgba(18,17,16,.9) 100%)>
 *     <div … padding:20px>
 *       <div … font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;
 *         color:#ff7c3c;margin-bottom:8px>{{ sx.kick }}</div>
 *       <p … font:600 19px/1.25 var(--ft);letter-spacing:-.03em;color:#fff>{{ sx.t }}</p>
 *       <a … flex:1;min-height:48px;padding:0 14px;border-radius:999px;
 *         background:#ff7c3c;color:#fff;font:600 14px/1.25 var(--fb)>{{ sx.btn.label }}</a>
 *       <a href="tel:0478337205" … min-height:48px;padding:0 16px;border-radius:999px;
 *         background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);
 *         color:#fff;font:600 13.5px var(--fb)>Appeler</a>
 *
 * Son insertion (après la 2e section de contenu, dc.html L454) appartient au
 * lot intégration : `insertionApresSection` de `conversion-donnees.ts` porte
 * la cadence. La photo vient de la page (dc.html L423 la tire de la
 * photothèque) : AUCUN défaut ici, une photo inventée serait une donnée
 * inventée.
 */

const SECTION: CSSProperties = {
  margin: "14px 18px 0",
  position: "relative",
  borderRadius: 24,
  overflow: "hidden",
  minHeight: 300,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
};

/* dc.html L127 : voile sombre qui porte le texte blanc sur la photo. */
const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg,rgba(18,17,16,.05) 20%,rgba(18,17,16,.9) 100%)",
};

const CONTENU: CSSProperties = { position: "relative", padding: 20 };

const SUR_TITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#ff7c3c",
  marginBottom: 8,
};

const TITRE: CSSProperties = {
  margin: "0 0 14px",
  font: "600 19px/1.25 var(--ft)",
  letterSpacing: "-.03em",
  color: "#fff",
};

const RANGEE: CSSProperties = { display: "flex", gap: 8, alignItems: "center" };

/* V3 `isPhotoCta` : le bouton orange porte sa pastille flèche à droite. */
const PRINCIPAL: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  minHeight: 50,
  padding: "0 6px 0 20px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px/1.25 var(--fb)",
  boxShadow: "0 12px 26px -14px rgba(255,124,60,.9)",
  textDecoration: "none",
};

const PASTILLE_FLECHE: CSSProperties = {
  flex: "none",
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "rgba(255,255,255,.2)",
  display: "grid",
  placeItems: "center",
};

/* V3 : le rond BLANC, icône téléphone en encre, à droite du bouton. */
const ROND_TELEPHONE: CSSProperties = {
  flex: "none",
  width: 50,
  height: 50,
  borderRadius: 999,
  background: "#ffffff",
  boxShadow: "0 8px 20px -10px rgba(0,0,0,.5)",
  display: "grid",
  placeItems: "center",
};

export interface PhotoCtaMobileProps {
  /** Chemin de la photo de la page, choisie par l'appelant (jamais inventée ici). */
  photoSrc: string;
  variante?: VarianteConversion;
  /** Le CTA propre à la page (dc.html `P.cta`), s'il existe. */
  bouton?: LibelleCible;
  id?: string;
}

export default function PhotoCtaMobile({
  photoSrc,
  variante = "standard",
  bouton,
  id = ID_PHOTO_CTA,
}: PhotoCtaMobileProps) {
  const principal = boutonPhotoCta(variante, bouton);
  return (
    <section
      id={id}
      data-mobile-seulement
      style={{
        ...SECTION,
        background: `#2a2927 center/cover no-repeat url("${photoSrc}")`,
      }}
    >
      <div aria-hidden="true" style={VOILE} />
      <div style={CONTENU}>
        <div style={SUR_TITRE}>{surTitrePhotoCta(variante)}</div>
        <p style={TITRE}>{titrePhotoCta(variante)}</p>
        <div style={RANGEE}>
          <a href={principal.href} style={PRINCIPAL}>
            <span>{principal.libelle}</span>
            <span style={PASTILLE_FLECHE}>
              <IconeFleche />
            </span>
          </a>
          <a href={TELEPHONE_SITE.href} aria-label={LIBELLE_ROND_TELEPHONE} style={ROND_TELEPHONE}>
            <IconeTelephone couleur="#1c1b19" />
          </a>
        </div>
      </div>
    </section>
  );
}
