import type { CSSProperties } from "react";

import {
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  LUEUR,
  PANNEAU,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage du gabarit OFFRE, relevées dans
 * `maquette/accueil-rendu.html`, lignes 4706 à 5198 (`sc-if isOfferPage`).
 *
 * POURQUOI un fichier à part : même raison que `blocs/habillage.ts`, la maquette
 * pilote tout par styles en ligne et les mêmes déclarations y reviennent. Ce qui
 * est commun au reste du site est IMPORTÉ de `blocs/habillage.ts`, jamais
 * recopié : une seule charte, un seul endroit. Seuls les écarts de ce gabarit
 * sont ici, chacun avec la valeur exacte de la maquette et sa ligne.
 *
 * Les survols ne sont pas ici : ils vivent dans `PageOffre.module.css`, un
 * style en ligne ne pouvant pas porter d'état.
 */

/* ------------------------------------------------------------------- le héros */

/** l. 4708 */
export const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "70px 40px 0",
};

/** l. 4709. Sans panneau de formulaire, le héros passe sur une colonne. */
export const HERO_GRILLE = "1.12fr .88fr";

/** l. 4711 */
export const HERO_RANGEE_PASTILLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 26,
  flexWrap: "wrap",
};

/** l. 4712 */
export const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  whiteSpace: "nowrap",
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b))",
  WebkitBackdropFilter: "blur(var(--gl-b))",
  border: "1px solid var(--gbd)",
  font: "600 12px var(--fb)",
  letterSpacing: ".02em",
  color: "var(--ink1)",
  boxShadow: "0 2px 10px rgba(0,0,0,.05)",
};

/** l. 4713, la puce orange dans la pastille. */
export const PASTILLE_PUCE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

/** l. 4715 */
export const MENTION: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
};

/** l. 4717. Plus grand que le TITRE1 du gabarit secteur : 66px contre 62px. */
export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "16ch",
  textWrap: "balance",
};

/** l. 4718 */
export const CHAPEAU_HERO: CSSProperties = {
  font: "400 17.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "26px 0 0",
  maxWidth: "48ch",
};

/** l. 4719 */
export const HERO_RANGEE_BOUTONS: CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 26,
  flexWrap: "wrap",
};

/**
 * l. 4720 : le bouton du héros est le bouton SECONDAIRE en verre, pas l'orange.
 * `whiteSpace` repassé en `normal` : un libellé long doit se replier plutôt que
 * déborder d'un écran de 320px, ce que la maquette ne teste pas.
 */
export const BOUTON_HERO: CSSProperties = {
  ...BOUTON_SECONDAIRE,
  whiteSpace: "normal",
};

/** l. 4723, la bande de repères sous les boutons. */
export const HERO_BANDE_REPERES: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 26,
  marginTop: 34,
  paddingTop: 26,
  borderTop: "1px solid var(--line)",
  flexWrap: "wrap",
};

/** l. 4724 */
export const HERO_REPERE_VALEUR: CSSProperties = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
};

/** l. 4724 */
export const HERO_REPERE_LIBELLE: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
  marginTop: 2,
};

/** l. 4725, le filet vertical entre deux repères. */
export const HERO_FILET: CSSProperties = {
  width: 1,
  height: 34,
  background: "var(--line)",
};

/** l. 4733, le panneau de formulaire du héros : ombre plus portante que VERRE. */
export const HERO_PANNEAU_FORMULAIRE: CSSProperties = {
  ...VERRE,
  position: "relative",
  padding: "30px 30px 32px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
};

/** l. 4741 */
export const HERO_FORMULAIRE_ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  columnGap: 14,
  rowGap: 6,
  marginBottom: 20,
  flexWrap: "wrap",
};

/** l. 4742 */
export const HERO_FORMULAIRE_TITRE: CSSProperties = {
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
  whiteSpace: "nowrap",
};

/** l. 4743 */
export const HERO_FORMULAIRE_MENTION: CSSProperties = {
  font: "500 11.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

/* ----------------------------------------------------------------- « En bref » */

/** l. 4766, la carte d'un chiffre. */
export const CARTE_CHIFFRE: CSSProperties = {
  ...VERRE,
  padding: "26px 26px 28px",
};

/** l. 4766 */
export const CHIFFRE_VALEUR: CSSProperties = {
  font: "600 calc(34px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
};

/** l. 4766 */
export const CHIFFRE_LIBELLE: CSSProperties = {
  font: "600 14.5px var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  marginTop: 12,
};

/** l. 4766 */
export const CHIFFRE_DETAIL: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 5,
};

/**
 * l. 4767 et l. 4959 : la bande en verre, une phrase à gauche, un bouton à
 * droite. La maquette la pose deux fois à l'identique.
 */
export const BANDE: CSSProperties = {
  ...VERRE,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  flexWrap: "wrap",
  marginTop: 22,
  padding: "16px 16px 16px 26px",
  borderRadius: 24,
};

/** l. 4767 */
export const BANDE_TEXTE: CSSProperties = {
  font: "500 15.5px/1.5 var(--fb)",
  color: "var(--ink1)",
};

/** l. 4767 : le bouton orange, resserré dans la bande. */
export const BANDE_BOUTON: CSSProperties = {
  ...BOUTON_ACTION,
  padding: "12px 22px",
  fontSize: 14.5,
};

/* ----------------------------- « Comment ça marche », section sous condition */

/** l. 4776 */
export const JALON_CARTE: CSSProperties = {
  ...VERRE,
  padding: "24px 24px 26px",
};

/** l. 4777 */
export const JALON_REPERE: CSSProperties = {
  font: "600 calc(30px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  marginBottom: 12,
};

/** l. 4777 */
export const JALON_TEXTE: CSSProperties = {
  font: "400 14.5px/1.55 var(--fb)",
  color: "var(--ink1)",
};

/* ------------------------------------ « Les formules », section sous condition */

/** l. 4797, la carte en verre d'une formule. */
export const FORMULE_CARTE: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  padding: "34px 30px 32px",
};

/** l. 4806, la carte anthracite de la formule recommandée. */
export const FORMULE_CARTE_PHARE: CSSProperties = {
  ...PANNEAU,
  display: "flex",
  flexDirection: "column",
  padding: "34px 30px 32px",
  boxShadow: "0 30px 70px -36px rgba(0,0,0,.55)",
};

/** l. 4806, la lueur de la carte phare : plus grande et en haut, pas en bas. */
export const FORMULE_LUEUR: CSSProperties = {
  ...LUEUR,
  width: 360,
  height: 360,
  right: -150,
  top: -170,
  bottom: undefined,
  background: "radial-gradient(circle,rgba(255,124,60,.32),transparent 68%)",
};

/** l. 4798 */
export const FORMULE_RANG: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 14,
};

/** l. 4807, la pastille « Recommandé ». */
export const FORMULE_PASTILLE: CSSProperties = {
  font: "600 10px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "#fff",
  background: "var(--acc)",
  padding: "5px 11px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};

/** l. 4799 */
export const FORMULE_NOM: CSSProperties = {
  font: "600 calc(26px * var(--ts)) var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  marginBottom: 8,
};

/** l. 4800 */
export const FORMULE_RESUME: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 22px",
};

/** l. 4801 */
export const FORMULE_LISTE: CSSProperties = {
  display: "grid",
  gap: 10,
  marginBottom: 28,
  paddingTop: 20,
  borderTop: "1px solid var(--line)",
};

/** l. 4801 */
export const FORMULE_PUCE: CSSProperties = {
  display: "flex",
  gap: 10,
  font: "400 14.5px/1.5 var(--fb)",
  color: "var(--ink1)",
};

/** l. 4802, le bouton en pastille claire, poussé en bas de carte. */
export const FORMULE_BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginTop: "auto",
  padding: "13px 22px",
  borderRadius: 999,
  background: "var(--chip)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 14.5px var(--fb)",
  whiteSpace: "nowrap",
};

/** l. 4812, le même bouton sur la carte phare : orange. */
export const FORMULE_BOUTON_PHARE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginTop: "auto",
  padding: "14px 22px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14.5px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

/** l. 4830, la bande orange « La règle ». */
export const BANDE_REGLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: 14,
  padding: "18px 24px",
  borderRadius: "var(--rad)",
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
  flexWrap: "wrap",
};

/** l. 4831 */
export const BANDE_REGLE_SURTITRE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc-ink)",
  flex: "none",
};

/** l. 4832 */
export const BANDE_REGLE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
  flex: 1,
  minWidth: 240,
};

/* ----------------------------------- « Le comparatif », section sous condition */

/** l. 4840, la colonne en verre : le salarié. */
export const COMPARATIF_COLONNE: CSSProperties = {
  ...VERRE,
  padding: "34px 34px 36px",
};

/** l. 4852, la colonne anthracite : le contrat. */
export const COMPARATIF_COLONNE_PHARE: CSSProperties = {
  ...PANNEAU,
  padding: "34px 34px 36px",
};

/** l. 4844 */
export const COMPARATIF_TITRE: CSSProperties = {
  font: "600 calc(24px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  marginBottom: 20,
  maxWidth: "22ch",
};

/** l. 4846 */
export const COMPARATIF_PUCE: CSSProperties = {
  display: "flex",
  gap: 10,
  font: "400 14.5px/1.5 var(--fb)",
  color: "var(--ink2)",
};

/* ----------------------------------- « Le premier mois », section sous condition */

/** l. 4871 */
export const PREMIER_MOIS_CARTE: CSSProperties = {
  ...VERRE,
  padding: "26px 26px 28px",
};

/** l. 4871, le numéro en chiffres monospacés. */
export const PREMIER_MOIS_NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  marginBottom: 14,
};

/** l. 4871 */
export const PREMIER_MOIS_TEXTE: CSSProperties = {
  font: "500 15px/1.55 var(--fb)",
  color: "var(--ink1)",
};

/** l. 4875, le grand panneau d'appel en bas de section. */
export const PREMIER_MOIS_APPEL: CSSProperties = {
  ...VERRE,
  marginTop: 14,
  borderRadius: 36,
  padding: "40px 44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 36,
  flexWrap: "wrap",
};

/** l. 4878 */
export const PREMIER_MOIS_APPEL_TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.14 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  marginBottom: 10,
  maxWidth: "26ch",
};

/** l. 4879 */
export const PREMIER_MOIS_APPEL_TEXTE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "56ch",
};

/** l. 4881, le bouton orange du panneau d'appel. */
export const PREMIER_MOIS_APPEL_BOUTON: CSSProperties = {
  ...BOUTON_ACTION,
  padding: "16px 28px",
  flex: "none",
};

/* ------------------------------------------------------- « Un autre besoin ? » */

/** l. 5156, la carte en verre d'une autre offre. */
export const CARTE_AUTRE: CSSProperties = {
  ...VERRE,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "20px 22px",
  borderRadius: "var(--rad-s)",
  transition: "transform var(--tr)",
};

/** l. 5156 */
export const CARTE_AUTRE_PHRASE: CSSProperties = {
  font: "500 15px/1.5 var(--fb)",
  color: "var(--ink1)",
};

/** l. 5156 */
export const CARTE_AUTRE_LIBELLE: CSSProperties = {
  flex: "none",
  font: "600 12.5px var(--fb)",
  color: "var(--acc-ink)",
  whiteSpace: "nowrap",
};

/** Le surtitre des sections de ce gabarit, identique au reste du site. */
export const SURTITRE_OFFRE = SURTITRE;
