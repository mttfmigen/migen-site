import type { CSSProperties } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";

import {
  BOUTON_POSTULER_FINAL,
  FORMULAIRE_RAPPEL_FINAL,
  ID_RAPPEL_FINAL,
  surTitreRappelFinal,
  titreRappelFinal,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * LA CARTE DE BAS DE PAGE `#etre-rappele`, DESSIN DE LA MAQUETTE V3 (16/10),
 * `maquette/mobile-v3/Migen - Mobile V3.dc.html` L139 :
 *
 *   <section id="etre-rappele" style="margin:22px 18px 0;padding:22px 18px;
 *     border-radius:24px;background:#fff;border:1px solid rgba(28,27,25,.08);
 *     box-shadow:0 24px 50px -36px rgba(0,0,0,.35)">
 *     <div … font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;
 *       color:#ff7c3c;margin-bottom:8px>{{ endK }}</div>
 *     <p … margin:0;font:600 21px/1.2 var(--ft);letter-spacing:-.035em;
 *       color:#1c1b19;text-wrap:balance>{{ endT }}</p>
 *     <form … display:grid;gap:16px;margin-top:18px> … sept champs, libellés
 *       au-dessus, indicatif FR/BE/CH/ES/CA/AE, « On me rappelle dans l'heure »
 *     <a … margin-top:16px … background:#ff7c3c>{{ endL }}</a>  (carrière)
 *
 * LA V2 POSAIT ICI UNE CARTE SOMBRE ET UN PANNEAU COURT (`RappelExpress` :
 * société, téléphone, courriel) qui ne partait pas : il renvoyait vers le
 * formulaire complet, replié plus bas. La V3 met le formulaire complet DANS la
 * carte. On y pose donc `FormulaireContact`, LE formulaire du site, tel quel :
 * mêmes champs que la V3 (entreprise, nom, prénom, courriel, indicatif,
 * téléphone, message), même route `/api/lead`, même dépôt HubSpot, mêmes
 * mentions RGPD, même étapes au téléphone (décision du 14/10). Rien n'est
 * recréé. Les cinq champs cachés de la V3 (country, siren, siret, address,
 * zip) sont ceux que la recherche d'entreprise du site remplit déjà.
 *
 * LE DESSIN DES CHAMPS DE LA V3 vit dans `FormulaireContact.module.css`, sous
 * `[data-champs-v3]`, et ne joue que sous 881 px : la carte entière porte
 * `data-mobile-seulement`, et le bureau ne la voit jamais.
 *
 * En carrière (`endBtnOnly: isCar`), pas de formulaire : un bouton seul vers
 * la candidature.
 */

const SECTION: CSSProperties = {
  margin: "22px 18px 0",
  padding: "22px 18px",
  borderRadius: 24,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.08)",
  boxShadow: "0 24px 50px -36px rgba(0,0,0,.35)",
  color: "#1c1b19",
};

const SUR_TITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#ff7c3c",
  marginBottom: 8,
};

const TITRE: CSSProperties = {
  margin: 0,
  font: "600 21px/1.2 var(--ft)",
  letterSpacing: "-.035em",
  color: "#1c1b19",
  textWrap: "balance",
};

/* V3 : `<form … margin-top:18px>`. */
const FORMULAIRE: CSSProperties = { marginTop: 18 };

/* V3, branche `endBtnOnly` : bouton seul des pages carrière. */
const POSTULER: CSSProperties = {
  marginTop: 16,
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
        <div data-champs-v3="" style={FORMULAIRE}>
          <FormulaireContact formulaire={FORMULAIRE_RAPPEL_FINAL} />
        </div>
      )}
    </section>
  );
}
