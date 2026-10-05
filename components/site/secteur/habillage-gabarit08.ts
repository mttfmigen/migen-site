import type { CSSProperties } from "react";

/* ===========================================================================
   GABARIT 08 SECTEUR

   Valeurs relevées dans `maquette/gabarit-08-secteur.html`, qui FAIT FOI pour
   les 13 pages `/secteurs/<secteur>/` et fait foi CONTRE « Site final ».

   Chaque constante porte la section de la maquette d'où elle sort, par son
   `data-screen-label`. `components/site/secteur/verification-secteur.tsx` relit
   ce fichier de maquette à chaque exécution et compare : une valeur écrite de
   mémoire ici échoue au contrôle.

   =========================================================================== */

/* --------------------------------------------------------------- 01 Héros */

/** `<section data-screen-label="01 Héros">`. 44px, pas 70 : c'est le fil
    d'Ariane qui tient l'espace au-dessus du titre dans ce gabarit. */
export const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

export const HERO_GRILLE = "1.1fr .9fr";

/**
 * La PASTILLE du héros, et pourquoi ce n'est pas un surtitre.
 *
 * Le gabarit d'ancrage ouvrait sur un surtitre orange en capitales. Celui-ci
 * ouvre sur une pastille de verre à puce orange, en casse normale. Ce n'est pas
 * un détail de style : c'est ce qui change l'allure du haut de page, et c'est
 * l'écart que le client voyait sans pouvoir le nommer.
 */
export const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,var(--gl-a))",
  border: "1px solid var(--gbd)",
  font: "600 12px var(--fb)",
  color: "var(--ink1)",
  marginBottom: 24,
};

export const PASTILLE_PUCE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(40px,4.8vw,70px) * var(--ts))/1.02 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "15ch",
  textWrap: "balance",
};

export const CHAPEAU: CSSProperties = {
  font: "400 18px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "24px 0 0",
  maxWidth: "50ch",
  textWrap: "pretty",
};

export const RANGEE_BOUTONS: CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 28,
  flexWrap: "wrap",
};

/** Le bouton orange, identique dans le héros et dans « 07 Appel ». */
export const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

/** Le bouton de téléphone du héros : verre à 80 %, pas le `--gsol` du site. */
export const BOUTON_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "rgba(255,255,255,.8)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};

/** La ligne de délai, sous un filet, avec sa puce orange auréolée. */
export const DELAI_RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  marginTop: 32,
  paddingTop: 24,
  borderTop: "1px solid var(--line)",
};

export const DELAI_PUCE: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 5px var(--acc-w)",
  flex: "none",
  marginTop: 7,
};

export const DELAI_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "52ch",
};

/** Le panneau en verre du héros : photo en haut, « En bref » en dessous. */
export const PANNEAU_BREF: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 30px 70px -34px rgba(0,0,0,.42)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
};

export const BREF_RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
  paddingTop: 12,
  borderTop: "1px solid var(--line)",
};

/** `min-width:88px` : c'est ce qui aligne les libellés en colonne. */
export const BREF_VALEUR: CSSProperties = {
  font: "600 20px/1.1 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  flex: "none",
  minWidth: 88,
};

export const BREF_LIBELLE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink2)",
};

/* ------------------------------------------------- 02 Photo et logos */

export const PHOTO_CADRE: CSSProperties = {
  position: "relative",
  borderRadius: 36,
  overflow: "hidden",
  background: "#dedfe1",
  boxShadow: "0 40px 90px -50px rgba(28,27,25,.55)",
};

export const PHOTO_VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom,rgba(28,27,25,.3),rgba(28,27,25,0) 38%,rgba(28,27,25,.6))",
};

export const PHOTO_SIGNATURE: CSSProperties = {
  position: "absolute",
  top: 28,
  left: 32,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export const PHOTO_SIGNATURE_TEXTE: CSSProperties = {
  font: "500 12px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.82)",
};

export const PHOTO_TITRE_CADRE: CSSProperties = {
  position: "absolute",
  left: 32,
  right: 32,
  bottom: 30,
  maxWidth: 640,
};

export const PHOTO_TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.035em",
  color: "#fff",
  textWrap: "balance",
};

export const LOGOS_ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 26,
  marginTop: 40,
  flexWrap: "wrap",
};

/** Le surtitre de la bande de logos est GRIS, pas orange. */
export const LOGOS_SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  flex: "none",
};

export const LOGOS_FILET: CSSProperties = {
  flex: 1,
  height: 1,
  background: "var(--line)",
  minWidth: 30,
};

export const LOGOS_FENETRE: CSSProperties = {
  overflow: "hidden",
  padding: "18px 0 4px",
  WebkitMaskImage:
    "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
  maskImage:
    "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
};

export const LOGOS_RUBAN: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 72,
  width: "max-content",
};

export const LOGO_NOM: CSSProperties = {
  font: "700 18px var(--ft)",
  letterSpacing: ".08em",
  color: "var(--ink3)",
  whiteSpace: "nowrap",
  opacity: 0.72,
};

/* ----------------------------------------------------------- 03 Problème */

/** Les sections en panneau sombre débordent de 24px, pas de 40. */
export const SECTION_PANNEAU: CSSProperties = { padding: "var(--sec) 24px 0" };

export const PROBLEME_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: 56,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 56,
  alignItems: "start",
  background: "var(--panel)",
  borderRadius: 40,
};

/** La colonne de gauche SUIT LE DÉFILEMENT, dans trois sections du gabarit. */
export const COLLANT: CSSProperties = { position: "sticky", top: 110 };

export const TITRE2_CLAIR: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 20px",
  maxWidth: "18ch",
  textWrap: "balance",
  color: "#fff",
};

export const PROBLEME_TEXTE: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: 0,
  maxWidth: "44ch",
};

export const CARTE_CONTRAINTE: CSSProperties = {
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "var(--rad)",
  padding: "24px 28px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

/** Un anneau orange vide, pas une croix : la maquette ne barre rien. */
export const CONTRAINTE_ANNEAU: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  border: "2px solid var(--acc)",
  flex: "none",
};

export const CONTRAINTE_TITRE: CSSProperties = {
  font: "600 16.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "#fff",
};

export const CONTRAINTE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.62)",
  marginTop: 6,
};

/* -------------------------------------------------------------- 04 Offre */

export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 30px",
  maxWidth: "24ch",
  textWrap: "balance",
};

export const OFFRE_CADRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 26px 60px -36px rgba(0,0,0,.34)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
};

export const OFFRE_GRILLE = "52px minmax(0,1.05fr) minmax(0,.95fr)";

export const OFFRE_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: OFFRE_GRILLE,
  gap: 28,
  padding: "18px 30px",
  borderBottom: "1px solid var(--line)",
};

export const OFFRE_ENTETE_GAUCHE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
};

export const OFFRE_ENTETE_DROITE: CSSProperties = {
  ...OFFRE_ENTETE_GAUCHE,
  color: "var(--acc)",
};

export const OFFRE_RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: OFFRE_GRILLE,
  gap: 28,
  padding: "22px 30px",
  alignItems: "start",
  borderTop: "1px solid var(--line)",
};

export const OFFRE_NUMERO: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  paddingTop: 3,
};

export const OFFRE_PRESTATION: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

export const OFFRE_ACCROCHE: CSSProperties = {
  display: "block",
  font: "600 16.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  marginBottom: 4,
};

export const OFFRE_BENEFICE: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: "14px 16px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
};

export const OFFRE_FLECHE: CSSProperties = {
  color: "var(--acc)",
  font: "600 15px var(--fb)",
  flex: "none",
};

export const OFFRE_BENEFICE_TEXTE: CSSProperties = {
  font: "500 14.5px/1.6 var(--fb)",
  color: "var(--ink)",
};

export const OFFRE_NOTE: CSSProperties = {
  display: "grid",
  gap: 6,
  marginTop: 14,
  padding: "20px 26px",
  borderRadius: 24,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,.5)",
};

export const OFFRE_NOTE_TEXTE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
};

/* ------------------------------------------------------------ 05 Déroulé */

export const DEROULE_GRILLE = ".8fr 1.2fr";

export const DEROULE_TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,44px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 24px",
  maxWidth: "16ch",
};

export const DEROULE_PHOTO: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  height: 380,
  background: "#dedfe1",
};

export const DEROULE_COLONNE: CSSProperties = {
  position: "relative",
  paddingLeft: 4,
};

/** Le filet vertical qui relie les pastilles d'étape. */
export const DEROULE_FILET: CSSProperties = {
  position: "absolute",
  left: 21,
  top: 22,
  bottom: 22,
  width: 2,
  background: "var(--line)",
};

export const ETAPE_RANGEE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "44px minmax(0,1fr)",
  gap: 22,
  padding: "0 0 30px",
};

/** L'auréole de 6px à la couleur du fond est ce qui coupe le filet. */
export const ETAPE_PASTILLE: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px/44px var(--fb)",
  textAlign: "center",
  boxShadow: "0 0 0 6px var(--bg)",
};

export const ETAPE_TITRE: CSSProperties = {
  font: "600 18px/1.35 var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 8,
};

export const ETAPE_TEXTE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "60ch",
};

/* ---------------------------------------------------------- 06 Garanties */

export const GARANTIES_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "58px 56px",
  position: "relative",
  overflow: "hidden",
};

export const GARANTIES_LUEUR: CSSProperties = {
  position: "absolute",
  width: 480,
  height: 480,
  right: -180,
  top: -220,
  background:
    "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

export const GARANTIES_TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 36px",
  maxWidth: "22ch",
};

/** Deux colonnes fixes, et un filet orange de 2px en tête de chaque garantie. */
export const GARANTIES_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "30px 40px",
};

export const GARANTIE: CSSProperties = {
  borderTop: "2px solid var(--acc)",
  paddingTop: 22,
};

export const GARANTIE_TITRE: CSSProperties = {
  font: "600 18px/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "#fff",
  marginBottom: 12,
};

export const GARANTIE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
};
