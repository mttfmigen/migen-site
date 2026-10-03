import type { CSSProperties } from "react";

/**
 * Valeurs relevées dans le gabarit « isRes » de la maquette,
 * `maquette/accueil-rendu.html`, lignes 6502 à 6800.
 *
 * Le numéro de ligne est donné devant chaque constante : c'est ce qui permet à
 * `scripts/verifie-ressource.tsx` de RELIRE la maquette à chaque exécution et
 * de comparer, au lieu de se fier à une note de lecture. Une valeur recopiée de
 * mémoire n'est pas vérifiable, et c'est ainsi que les portages dérivent.
 *
 * Les survols ne sont pas ici : un style en ligne ne peut pas porter d'état,
 * ils vivent dans `Ressource.module.css`.
 */

/** Ligne 6504 : le `main` du gabarit passe sous l'en-tête fixe. */
export const HAUT_DE_PAGE = 96;

/** Ligne 6505 : la section d'ouverture. */
export const SECTION_ENTETE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "70px 40px 0",
};

/** Lignes 6525, 6556, 6631, 6671, 6724 : toutes les sections de corps. */
export const SECTION_CORPS: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 40px 0",
};

/** Ligne 6506 : la colonne de l'en-tête ne dépasse pas la largeur de lecture. */
export const LARGEUR_LECTURE = 760;

/** Ligne 6508 : la pastille orange du format. */
export const PASTILLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "#fff",
  background: "var(--acc)",
  padding: "5px 12px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};

/** Ligne 6511. */
export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(30px,3.6vw,52px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.042em",
  margin: 0,
  textWrap: "balance",
};

/** Ligne 6512 : le chapeau sous le H1. */
export const CHAPEAU: CSSProperties = {
  font: "400 18px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "20px 0 0",
};

/** Lignes 6539, 6560, 6634 : la carte en verre, motif dominant du gabarit. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

/** Lignes 6659, 6716 : le lavis orange, pour ce qui doit arrêter l'œil. */
export const LAVIS: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

/** Lignes 6540, 6635, 6727 : le surtitre orange en capitales. */
export const SURTITRE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

/** Ligne 6661 : le même, sur lavis orange. */
export const SURTITRE_LAVIS: CSSProperties = {
  ...SURTITRE,
  color: "var(--acc-ink)",
};

/** Ligne 6664 : le même, en gris, pour une carte qui ne réclame rien. */
export const SURTITRE_GRIS: CSSProperties = {
  ...SURTITRE,
  color: "var(--ink4)",
};

/** Ligne 6527 : la grille colonne de lecture + colonne collante. */
export const GRILLE_LECTURE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `minmax(0,${LARGEUR_LECTURE}px) minmax(0,1fr)`,
  gap: 52,
  alignItems: "start",
};

/** Ligne 6538 : la colonne collante. */
export const COLONNE_COLLANTE: CSSProperties = {
  display: "grid",
  gap: 16,
  position: "sticky",
  top: 120,
};

/** Ligne 6529 : le paragraphe de la colonne de lecture. */
export const PROSE: CSSProperties = {
  font: "400 17px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 20px",
};

/** Ligne 6530 : le H2 de la colonne de lecture. */
export const TITRE2: CSSProperties = {
  font: "600 calc(24px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  margin: "38px 0 16px",
  // Sans cette marge, une ancre amène le titre sous la barre fixe.
  scrollMarginTop: 100,
};

/** Dérivé du H2, pour le niveau 3 que le corpus utilise et que la maquette
 *  n'illustre pas dans ce gabarit : même famille, un cran plus bas. */
export const TITRE3: CSSProperties = {
  font: "600 calc(19px * var(--ts))/1.3 var(--ft)",
  letterSpacing: "-.025em",
  margin: "28px 0 12px",
  scrollMarginTop: 100,
};

/** Ligne 6533 : l'encadré en barre orange de la colonne de lecture. */
export const CITATION: CSSProperties = {
  borderLeft: "3px solid var(--acc)",
  padding: "4px 0 4px 24px",
  margin: "32px 0",
};

/** Ligne 6534. */
export const CITATION_TEXTE: CSSProperties = {
  font: "500 calc(20px * var(--ts))/1.5 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  margin: 0,
};

/** Ligne 6643 : la pastille numérotée d'une étape. */
export const NUMERO: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 13px var(--fb)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
};

/** Ligne 6644 : l'intitulé d'une étape. */
export const ETAPE_TITRE: CSSProperties = {
  font: "600 calc(16.5px * var(--ts))/1.35 var(--ft)",
  letterSpacing: "-.022em",
  marginBottom: 6,
};

/** Ligne 6644 : la méthode d'une étape. */
export const ETAPE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/** Ligne 6734 : l'en-tête de colonne du barème. */
export const BAREME_ENTETE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
};

/** Ligne 6739 : la première cellule d'une ligne de barème, celle qui nomme. */
export const BAREME_CLE: CSSProperties = {
  font: "500 14px var(--fb)",
  color: "var(--ink1)",
};

/** Ligne 6746 : les cellules suivantes. */
export const BAREME_VALEUR: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink1)",
};

/** Ligne 6782 : le surtitre de l'appel de fin, d'un demi-point plus grand. */
export const SURTITRE_FIN: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 12,
};

/** Ligne 6783. */
export const TITRE_FIN: CSSProperties = {
  font: "600 calc(clamp(22px,2.2vw,32px) * var(--ts))/1.14 var(--ft)",
  letterSpacing: "-.035em",
  margin: "0 0 10px",
  maxWidth: "26ch",
  textWrap: "balance",
};

/** Ligne 6784. */
export const TEXTE_FIN: CSSProperties = {
  font: "400 15.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "48ch",
};

/** Ligne 6787 : le bouton principal. */
export const BOUTON_ACTION: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
  transition: "filter var(--tr),transform var(--tr)",
};

/** Ligne 6788 : le bouton secondaire. */
export const BOUTON_SECONDAIRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--chip)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "border-color var(--tr)",
};

/**
 * La copie fixe de l'appel de fin, lignes 6782 à 6789.
 *
 * Ce bloc ne dépend pas de la page : il est du CHROME, au même titre que
 * l'en-tête et le pied. Sa copie est donc celle de la maquette, recopiée telle
 * quelle, et le contrôle la relit dans le fichier.
 */
export const FIN = {
  surtitre: "Une question sur ce contenu",
  titre: "Nos équipes répondent aux questions techniques.",
  texte:
    "Un point de méthode à creuser, un cas particulier sur votre installation : le chargé d'affaires de votre secteur vous rappelle.",
  boutonPrincipal: "Poser ma question",
  boutonSecondaire: "Toutes les ressources",
  lienSecondaire: "/ressources/",
} as const;

/**
 * Le puçage des listes à puces.
 *
 * LA MAQUETTE ÉCRIT UN TIRET CADRATIN (ligne 6542), que le contrat interdit
 * dans toute copie visible. Le point médian est le puçage que le reste du site
 * utilise déjà, dans le gabarit éditorial comme dans les blocs de vente.
 */
export const PUCE = "·";
