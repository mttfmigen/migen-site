import type { CSSProperties } from "react";

import stylesOffre from "@/components/site/offre/PageOffre.module.css";

/**
 * LES TROIS PIÈCES MOBILES DE CONVERSION des gabarits expertises (05, 09, 10),
 * portées de la maquette mobile v2. Chacune porte `data-mobile-seulement` :
 * au-dessus de 880 px, `app/globals.css` la masque, RIEN ne change à 1280 px.
 *
 * 1. `EtiquettePliMobile` : l'étiquette d'une bascule de bloc repliable.
 *    MOTIF DE RÉFÉRENCE : `offre/PointsOffre.tsx` (mêmes deux constantes,
 *    recopiées à l'identique, elles-mêmes reprises du gabarit métier). La
 *    classe `etiquettePli` de `PageOffre.module.css` ne la montre que sous
 *    880 px et l'efface une fois le bloc déplié ; la classe
 *    `blocPliablePartage`, posée par l'appelant sur son conteneur, retire la
 *    bascule entière du bureau (aucun arrêt de tabulation muet).
 *
 * 2. `TelephoneHero` : le bouton blanc « 04 78 33 72 05 » à côté du bouton
 *    d'action du héros. RELEVÉ dans `Migen - Mobile v2.dc.html` L110 (rangée
 *    CTA du héros : bouton orange + `<a href="tel:…">` blanc, min-height 50,
 *    rayon 999, bord rgba(28,27,25,.1), police 600 13.5px) et L493 (`tel:` =
 *    numéro sans espaces, libellé = le numéro). Le corpus écrit ce numéro
 *    dans le bloc d'appel de CHAQUE page des trois gabarits
 *    (`> [CTA](/contact/) · 04 78 33 72 05`) : la production l'avait effacé,
 *    mesure du 14/10, 0 occurrence sur les gabarits 09 et 10.
 *
 * 3. `OuAppelez` : la ligne « Ou appelez le 04 78 33 72 05, du lundi au
 *    vendredi de 8h00 à 18h30. … » sous l'appel final. COPIE DU CORPUS,
 *    verbatim et mesurée le 14/10 : identique sur les 11 fiches du gabarit 09
 *    et les 19 du gabarit 05 (« Rappel dans l'heure. ») ; la fiche du hub
 *    `/expertises/` écrit « Rappel dans l'heure, astreinte. ». Deux formes,
 *    aucune autre : la porte recompte. Le dessin du lien est celui des liens
 *    de prose de la maquette mobile (souligné, graisse 600, encre du texte).
 */

/** Étiquette de bascule : le surtitre de la section, en capitales et accent. */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libellé de la bascule, à l'échelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

export function EtiquettePliMobile({
  surtitre,
  titre,
}: {
  surtitre?: string;
  titre: string;
}) {
  return (
    <span data-mobile-seulement="" className={stylesOffre.etiquettePli}>
      {surtitre ? <span style={ETIQUETTE_SURTITRE}>{surtitre}</span> : null}
      <span style={ETIQUETTE_TITRE}>{titre}</span>
    </span>
  );
}

/** Le numéro du corpus, et son href `tel:` comme la maquette le fabrique. */
export const NUMERO_TELEPHONE = "04 78 33 72 05";
const HREF_TELEPHONE = `tel:${NUMERO_TELEPHONE.replace(/[\s.]/g, "")}`;

/* La pastille blanche de la rangée CTA du héros (dc.html L110), verbatim. */
const BOUTON_TELEPHONE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 50,
  padding: "0 16px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.1)",
  color: "#1c1b19",
  font: "600 13.5px var(--fb)",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

export function TelephoneHero() {
  return (
    <a data-mobile-seulement="" href={HREF_TELEPHONE} style={BOUTON_TELEPHONE}>
      {NUMERO_TELEPHONE}
    </a>
  );
}

const LIGNE_APPEL: CSSProperties = {
  margin: "14px 18px 0",
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink2)",
  textAlign: "center",
};

/* Le lien de prose de la maquette mobile (dc.html L130, blocs `isP`). */
const LIEN_APPEL: CSSProperties = {
  color: "var(--ink)",
  fontWeight: 600,
  textDecoration: "underline",
  textDecorationColor: "rgba(28,27,25,.28)",
  textDecorationThickness: 1,
  textUnderlineOffset: 3,
};

export function OuAppelez({ astreinte = false }: { astreinte?: boolean }) {
  return (
    <p data-mobile-seulement="" style={LIGNE_APPEL}>
      Ou appelez le{" "}
      <a href={HREF_TELEPHONE} style={LIEN_APPEL}>
        {NUMERO_TELEPHONE}
      </a>
      , du lundi au vendredi de 8h00 à 18h30.{" "}
      {astreinte ? "Rappel dans l'heure, astreinte." : "Rappel dans l'heure."}
    </p>
  );
}
