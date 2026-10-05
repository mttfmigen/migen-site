import type { CSSProperties } from "react";

/**
 * Valeurs d'habillage du gabarit PRESTATION, relevées dans
 * « Migen - Gabarit Prestation.dc.html » (projet Claude Design
 * a05a7cf5-b229-4547-bb3e-4dbe5b579983, 224 lignes).
 *
 * POURQUOI UN HABILLAGE À PART de `components/site/blocs/habillage.ts`.
 * Celui-ci a été relevé dans « Migen - Site final.dc.html », qui n'est PAS le
 * fichier de référence de ce gabarit : le client a dessiné onze gabarits
 * dédiés, et c'est celui-ci qui fait foi pour la famille des prestations. Les
 * deux habillages se recouvrent beaucoup et divergent sur une dizaine de
 * valeurs (marge du surtitre, marge de l'en-tête, remplissage du héros, rayon
 * des champs). Écraser le fichier partagé aurait déplacé le dessin des
 * soixante pages qu'il sert et que d'autres gabarits portent en parallèle.
 *
 * Chaque valeur ici est vérifiée par `verification-prestation.tsx`, qui relit
 * `maquette/gabarit-prestation-releve.json` à chaque exécution. Changer une
 * valeur sans changer le relevé fait échouer le contrôle, et c'est voulu.
 *
 * Les survols ne sont pas ici : un style en ligne ne porte pas d'état, ils
 * vivent dans `PagePrestation.module.css`.
 */

/** Rythme vertical. `--sec` vaut 120px, 64px sous 760px (`app/globals.css`). */
export const SECTION: CSSProperties = { padding: "var(--sec) 0 0" };

/** Gouttière de la maquette : 1200px de contenu, 40px de marge. */
export const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

/** La carte de verre, motif dominant du gabarit. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

/**
 * Sur-titre de section : capitales orange au-dessus du H2.
 *
 * 18px de marge basse, et non 16px comme l'habillage partagé : c'est la valeur
 * de CE fichier de maquette, mesurée au rendu.
 */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

/** Sous-niveau : en-tête de colonne du tableau, « Étape N ». */
export const SURTITRE_SOUS: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: "0 0 22px",
  maxWidth: "22ch",
  textWrap: "balance",
};

/** En-tête de section : titre à gauche, 30px de marge basse. */
export const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 30,
};

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

export const BOUTON_SECONDAIRE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "background var(--tr)",
};

/** Lien souligné orange dans un paragraphe (R32 du référentiel client). */
export const LIEN_TEXTE: CSSProperties = {
  color: "var(--ink)",
  fontWeight: 600,
  textDecoration: "underline",
  textDecorationColor: "rgba(255,124,60,.55)",
  textUnderlineOffset: 3,
};

/* ---------------------------------------------------------------- 01 Héros */

export const HERO_SECTION: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "50px 40px 0",
};

export const HERO_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.12fr .88fr",
  gap: 52,
  alignItems: "start",
};

export const HERO_PASTILLE: CSSProperties = {
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
};

export const HERO_PASTILLE_PUCE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "16ch",
  textWrap: "balance",
};

export const HERO_MECANISME: CSSProperties = {
  font: "400 17.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "26px 0 0",
  maxWidth: "48ch",
};

/** Le filet du héros : pastille orange à halo, puis la phrase de rappel. */
export const HERO_FILET: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  marginTop: 34,
  paddingTop: 26,
  borderTop: "1px solid var(--line)",
};

export const HERO_FILET_PASTILLE: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 5px var(--acc-w)",
  flex: "none",
  marginTop: 7,
};

export const HERO_FILET_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "52ch",
};

/** Le panneau du formulaire, dans la colonne droite du héros. */
export const HERO_PANNEAU: CSSProperties = {
  ...VERRE,
  position: "relative",
  scrollMarginTop: 100,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
  padding: "30px 30px 32px",
};

/* ------------------------------------------------------------ 02 Chiffres */

export const CARTE_CHIFFRE: CSSProperties = { ...VERRE, padding: "26px 26px 28px" };

export const CHIFFRE_VALEUR: CSSProperties = {
  font: "600 calc(34px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--ink)",
};

export const CHIFFRE_LIBELLE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 12,
};

/* ------------------------------------------------------------ 03 Problème */

export const PROBLEME_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 70,
  alignItems: "start",
};

export const PROBLEME_COLLANT: CSSProperties = { position: "sticky", top: 110 };

export const PROBLEME_CHAPEAU: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "46ch",
};

export const PROBLEME_CARTE: CSSProperties = { ...VERRE, padding: "24px 28px" };

export const PROBLEME_PUCE: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  border: "2px solid var(--acc)",
  flex: "none",
  transform: "translateY(-2px)",
};

export const PROBLEME_ACCROCHE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
};

export const PROBLEME_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  marginTop: 5,
};

/* --------------------------------------------------------------- 04 Offre */

/*
 * La grille du tableau (colonnes 1.05fr / .95fr, gouttière 32px, remplissages
 * 18px 30px et 20px 30px, filets) n'est PAS ici : elle vit dans
 * `PagePrestation.module.css`, classes `.entete`, `.rangee` et `.rangeeFilet`.
 *
 * POURQUOI, et c'est le piège de ce gabarit : la maquette replie ce tableau par
 * media query (`.gp-row` en une colonne sous 900px, `.gp-head` masqué). Un
 * style en ligne gagne contre une feuille de style : poser la grille en ligne
 * aurait rendu les deux replis inopérants, et le tableau serait resté à deux
 * colonnes de 32px de gouttière sur un téléphone.
 */

export const OFFRE_PRESTATION: CSSProperties = {
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink2)",
};

export const OFFRE_BENEFICE: CSSProperties = {
  font: "500 15px/1.6 var(--fb)",
  color: "var(--ink)",
};

/** La bande orange pâle sous le tableau, qui porte la prose de maillage. */
export const OFFRE_BANDE_NOTE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginTop: 14,
  padding: "18px 26px",
  borderRadius: 24,
  background: "var(--acc-w)",
  border: "1px solid rgba(255,124,60,.26)",
};

/* ------------------------------------------------------------- 05 Méthode */

export const ETAPE_CARTE: CSSProperties = {
  ...VERRE,
  padding: "28px 28px 30px",
  display: "flex",
  flexDirection: "column",
};

export const ETAPE_NUMERO: CSSProperties = {
  font: "600 28px var(--ft)",
  letterSpacing: "-.045em",
};

export const ETAPE_PISTE: CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: "var(--chip)",
  overflow: "hidden",
  marginBottom: 16,
};

export const ETAPE_TITRE: CSSProperties = {
  font: "600 16.5px var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 8,
};

export const ETAPE_TEXTE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/**
 * Les six largeurs de barre de la maquette.
 *
 * Elles ne sont PAS calculées : la maquette écrit 17, 33, 50, 67, 83 puis 100,
 * c'est-à-dire des sixièmes arrondis à l'entier, pas `i / n * 100`. Un calcul
 * donnerait 16,67 et 33,33 et s'écarterait du dessin dès la première étape.
 */
export const ETAPE_BARRES = ["17%", "33%", "50%", "67%", "83%", "100%"] as const;

/* ---------------------------------------------------------- 06 Réassurance */

export const REASSURANCE_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".9fr 1.1fr",
  gap: 20,
  alignItems: "stretch",
};

export const REASSURANCE_CARTE: CSSProperties = { ...VERRE, padding: "34px 36px 36px" };

export const SELECTION_PANNEAU: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 16,
  padding: "24px 28px",
  borderRadius: "var(--rad)",
  background: "var(--panel)",
};

export const SELECTION_VALEUR: CSSProperties = {
  font: "600 calc(56px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.06em",
  color: "var(--acc)",
  whiteSpace: "nowrap",
};

export const SELECTION_TEXTE: CSSProperties = {
  font: "400 14px/1.5 var(--fb)",
  color: "rgba(255,255,255,.66)",
};

/* ----------------------------------------------------------- 07 Garanties */

export const GARANTIES_SECTION: CSSProperties = { padding: "var(--sec) 24px 0" };

export const GARANTIES_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  padding: 56,
  position: "relative",
  overflow: "hidden",
};

export const GARANTIES_HALO: CSSProperties = {
  position: "absolute",
  width: 480,
  height: 480,
  right: -180,
  top: -220,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

export const GARANTIES_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
  gap: 28,
  marginTop: 10,
};

export const GARANTIE_TITRE: CSSProperties = {
  font: "600 18px/1.35 var(--ft)",
  letterSpacing: "-.022em",
  color: "#fff",
  marginBottom: 12,
};

export const GARANTIE_TEXTE: CSSProperties = {
  font: "400 14px/1.65 var(--fb)",
  color: "rgba(255,255,255,.6)",
};

/* --------------------------------------------------------------- 08 Appel */

export const APPEL_BANDE: CSSProperties = {
  ...VERRE,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
  padding: "30px 30px 30px 40px",
  borderRadius: 36,
};

export const APPEL_TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.034em",
  color: "var(--ink)",
  marginBottom: 8,
  maxWidth: "30ch",
  textWrap: "balance",
};

export const APPEL_RAPPEL: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

/* ---------------------------------------------------------- 09 Références */

export const REFERENCE_CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--card)",
  border: "1px solid var(--line)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

export const REFERENCE_CORPS: CSSProperties = {
  padding: "22px 24px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 9,
  flex: 1,
};

export const REFERENCE_CLIENT: CSSProperties = {
  font: "700 12px var(--ft)",
  letterSpacing: ".1em",
  color: "var(--acc)",
};

export const REFERENCE_TEXTE: CSSProperties = {
  font: "400 13.5px/1.55 var(--fb)",
  color: "var(--ink2)",
};

export const REFERENCE_LIEN: CSSProperties = {
  marginTop: "auto",
  paddingTop: 14,
  borderTop: "1px solid var(--line)",
  font: "600 13px var(--fb)",
  color: "var(--ink)",
};

/* ----------------------------------------------------------- 10 Questions */

export const QUESTION_CARTE: CSSProperties = {
  ...VERRE,
  borderRadius: 24,
  padding: "24px 26px",
};

export const QUESTION_INTITULE: CSSProperties = {
  font: "600 16px/1.4 var(--ft)",
  letterSpacing: "-.018em",
  color: "var(--ink)",
  marginBottom: 10,
};

export const QUESTION_REPONSE: CSSProperties = {
  font: "400 14.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/* ----------------------------------------------------------- 12 Appel final */

export const FINAL_SECTION: CSSProperties = {
  padding: "var(--sec) 24px var(--sec)",
};

export const FINAL_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  borderRadius: 40,
  background: "var(--panel)",
  padding: "64px 48px",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
};

export const FINAL_HALO: CSSProperties = {
  position: "absolute",
  width: 640,
  height: 640,
  left: "50%",
  top: -300,
  transform: "translateX(-50%)",
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
  pointerEvents: "none",
};

export const FINAL_TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.4vw,46px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 16px",
  textWrap: "balance",
};

export const FINAL_TEXTE: CSSProperties = {
  font: "400 16px/1.6 var(--fb)",
  color: "rgba(255,255,255,.62)",
  margin: "0 auto 26px",
  maxWidth: "46ch",
};

export const FINAL_BOUTON_SECONDAIRE: CSSProperties = {
  ...BOUTON_SECONDAIRE,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
};

/* ---------------------------------------------------------------- Communs */

/** L'ancre visée par tous les appels à l'action de la page. */
export const ANCRE_FORMULAIRE = "#formulaire";

/** Un numéro français devient un `tel:` sans espaces. */
export function lienTelephone(telephone: string): string {
  return `tel:${telephone.replace(/[^+\d]/g, "")}`;
}

/** Grille qui se replie en 2 puis 1 colonne (classe `mg-rmulti`). */
export function colonnes(nombre: number, ecart = 12): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(1, nombre)},minmax(0,1fr))`,
    gap: ecart,
  };
}
