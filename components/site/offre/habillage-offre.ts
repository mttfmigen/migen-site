import type { CSSProperties } from "react";

import {
  BOUTON_ACTION,
  LUEUR,
  PANNEAU,
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

/** Capture, section « 01 Héros » : `padding: 40px 40px 0`. */
export const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 40px 0",
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

/** l. 4717. Plus grand que le TITRE1 du gabarit secteur : 66px contre 62px. */
export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "16ch",
  textWrap: "balance",
};

/** Capture : `font: 400 16.5px/1.65`, `margin: 20px 0 0`. */
export const CHAPEAU_HERO: CSSProperties = {
  font: "400 16.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "20px 0 0",
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
 * Capture : le bouton du héros est le bouton ORANGE (« Parler à un chargé
 * d'affaires » → #besoin), plus le secondaire en verre de l'ancien montage.
 * `whiteSpace` repassé en `normal` : un libellé long doit se replier plutôt
 * que déborder d'un écran de 320px, ce que la maquette ne teste pas.
 */
export const BOUTON_HERO: CSSProperties = {
  ...BOUTON_ACTION,
  whiteSpace: "normal",
};

/** Capture : la mention des horaires, SOUS les boutons du héros. */
export const HERO_MENTION: CSSProperties = {
  font: "400 13.5px/1.6 var(--fb)",
  color: "var(--ink3)",
  margin: "22px 0 0",
  maxWidth: "52ch",
};

/* --------------------------------------------------------- « 01 Chiffres » */

/** Capture, section « 01 Chiffres » : `padding: 44px 40px 0`. */
export const SECTION_CHIFFRES: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

/**
 * Capture : les chiffres vivent dans UNE SEULE carte en verre, en colonnes
 * égales séparées par un filet, sans en-tête de section.
 *
 * PAS DE `gridTemplateColumns` ICI, et c'est mesuré : la maquette cale le
 * nombre de colonnes sur le nombre de chiffres de la page
 * (`repeat(3, minmax(0px, 1fr))` relevé dans le rendu de
 * `/offres/retrofit/remise-en-etat/`, filets aux tiers relevés sur
 * `/offres/arret-technique/`). L'ancien `repeat(4,…)` figé laissait une 4e
 * colonne vide sur les pages à 3 chiffres et repliait les libellés sur
 * 3 lignes. C'est `PageOffre.tsx` qui pose la valeur, depuis
 * `chiffres.length`.
 */
export const GRILLE_CHIFFRES: CSSProperties = {
  ...VERRE,
  display: "grid",
  padding: "22px 8px",
};

/** Capture : la cellule d'un chiffre. Le filet gauche s'ajoute dès le 2e. */
export const CARTE_CHIFFRE: CSSProperties = {
  padding: "4px 24px",
};

/** Capture : `font: 600 calc(28px * var(--ts))/1`, encre pleine, pas orange. */
export const CHIFFRE_VALEUR: CSSProperties = {
  font: "600 calc(28px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
};

/** Capture : `font: 400 14px/1.5`, `margin-top: 8px`. */
export const CHIFFRE_LIBELLE: CSSProperties = {
  font: "400 14px/1.5 var(--fb)",
  color: "var(--ink1)",
  marginTop: 8,
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
