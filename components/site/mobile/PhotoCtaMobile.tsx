import type { CSSProperties } from "react";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";

import {
  boutonPhotoCta,
  ID_PHOTO_CTA,
  LIBELLE_APPELER,
  surTitrePhotoCta,
  titrePhotoCta,
  type LibelleCible,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LE PHOTO + CTA APRÈS LA 2e SECTION, motif `isPhotoCta` de la maquette
 * mobile v2, dc.html L127 :
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

const RANGEE: CSSProperties = { display: "flex", gap: 8 };

const PRINCIPAL: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14px/1.25 var(--fb)",
  textAlign: "center",
  textDecoration: "none",
};

const APPELER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 16px",
  borderRadius: 999,
  background: "rgba(255,255,255,.16)",
  border: "1px solid rgba(255,255,255,.3)",
  color: "#fff",
  font: "600 13.5px var(--fb)",
  textDecoration: "none",
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
            {principal.libelle}
          </a>
          <a href={TELEPHONE_SITE.href} style={APPELER}>
            {LIBELLE_APPELER}
          </a>
        </div>
      </div>
    </section>
  );
}
