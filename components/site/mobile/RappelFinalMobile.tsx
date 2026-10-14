import type { CSSProperties } from "react";

import RappelExpress from "@/components/site/offre/generique/RappelExpress";

import {
  BOUTON_POSTULER_FINAL,
  ID_RAPPEL_FINAL,
  LIEN_DETAIL,
  surTitreRappelFinal,
  titreRappelFinal,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LE RAPPEL DE BAS DE PAGE, section `#etre-rappele` de la maquette mobile v2,
 * dc.html L138 :
 *
 *   <section id="etre-rappele" style="margin:22px 18px 0;padding:22px 20px;
 *     border-radius:24px;background:#1c1b19;color:#fff">
 *     <div … font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;
 *       color:#ff7c3c;margin-bottom:8px>{{ endK }}</div>
 *     <p … font:600 19px/1.25 var(--ft);letter-spacing:-.03em;color:#fff>{{ endT }}</p>
 *     … formulaire (téléphone, entreprise, « Être rappelé dans l’heure »)
 *     <a href="/contact/" …>Décrire mon besoin en détail →</a>
 *
 * LE FORMULAIRE N'EST PAS RECRÉÉ, ET C'EST UNE RÈGLE DE MEHDI : aucun champ
 * ni soumission nouveaux. On réutilise le panneau court existant,
 * `offre/generique/RappelExpress.tsx`, qui porte déjà la saisie vers le
 * formulaire « Décrire mon besoin » de la page via `EVENEMENT_PREREMPLIR`
 * (la maquette, elle, ne fait que basculer un message local, dc.html L578 :
 * elle n'envoie rien non plus). Le panneau demande société, téléphone et
 * courriel là où la maquette ne demande que téléphone et entreprise :
 * c'est le composant EXISTANT, validé, qui fait foi, pas une variante neuve.
 *
 * L'HABILLAGE SOMBRE SANS TOUCHER AU PANNEAU : `RappelExpress` se dessine
 * avec `var(--card)`, `var(--line)`, `var(--ink)`, `var(--rad-s)`. Le
 * conteneur `.conversion-rappel-sombre` redéfinit ces quatre variables aux
 * valeurs des champs de la maquette (dc.html L138 : fond
 * rgba(255,255,255,.08), bord rgba(255,255,255,.18), texte #fff, rayon 14px),
 * et le panneau rend sa version sombre sans qu'une ligne n'y change.
 *
 * dc.html L576 : en carrière, pas de formulaire (`endBtnOnly: isCar`), un
 * bouton « Postuler chez Migen » seul. L577 à L579.
 */

const SECTION: CSSProperties = {
  margin: "22px 18px 0",
  padding: "22px 20px",
  borderRadius: 24,
  background: "#1c1b19",
  color: "#fff",
};

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

/* Les variables que `RappelExpress` consomme, portées aux valeurs des champs
   sombres de la maquette (dc.html L138). */
const SOMBRE = {
  "--card": "rgba(255,255,255,.08)",
  "--line": "rgba(255,255,255,.18)",
  "--ink": "#fff",
  "--rad-s": "14px",
} as CSSProperties;

/* dc.html L138 : le lien sous le formulaire. */
const DETAIL: CSSProperties = {
  display: "block",
  textAlign: "center",
  padding: "8px 0 2px",
  font: "600 13px var(--fb)",
  color: "#ffb08a",
  textDecoration: "none",
};

/* dc.html L138, branche `endBtnOnly` : bouton seul des pages carrière. */
const POSTULER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 50,
  padding: "0 16px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px/1.25 var(--fb)",
  textAlign: "center",
  textDecoration: "none",
};

export interface RappelFinalMobileProps {
  variante?: VarianteConversion;
  id?: string;
}

export default function RappelFinalMobile({
  variante = "standard",
  id = ID_RAPPEL_FINAL,
}: RappelFinalMobileProps) {
  const carriere = variante === "carriere";
  return (
    <section id={id} data-mobile-seulement style={SECTION}>
      <div style={SUR_TITRE}>{surTitreRappelFinal(variante)}</div>
      <p style={TITRE}>{titreRappelFinal(variante)}</p>
      {carriere ? (
        <a href={BOUTON_POSTULER_FINAL.href} style={POSTULER}>
          {BOUTON_POSTULER_FINAL.libelle}
        </a>
      ) : (
        <div className="conversion-rappel-sombre" style={SOMBRE}>
          <RappelExpress />
          <a href={LIEN_DETAIL.href} style={DETAIL}>
            {LIEN_DETAIL.libelle}
          </a>
        </div>
      )}
    </section>
  );
}
