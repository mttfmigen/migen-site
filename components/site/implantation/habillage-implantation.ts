import type { CSSProperties } from "react";

import { SURTITRE, VERRE } from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage du gabarit IMPLANTATION, relevées dans
 * « Migen - Gabarit 04 Ville.dc.html », identique à
 * « Migen - Gabarit 06 Departement.dc.html ». Les numéros de ligne sont ceux
 * de ce fichier, lu par `mcp__claude_design__read_file`, et mesurés au rendu
 * par `getComputedStyle` quand une valeur se calcule.
 *
 * POURQUOI un fichier à part : la maquette pilote tout par styles en ligne et
 * les mêmes déclarations y reviennent. Ce qui est commun au reste du site est
 * IMPORTÉ de `blocs/habillage.ts`, jamais recopié : une seule charte, un seul
 * endroit. Seuls les écarts de ce gabarit sont ici.
 *
 * Les survols et les bascules de largeur ne sont pas ici : ils vivent dans
 * `PageImplantation.module.css`, un style en ligne ne pouvant porter ni état
 * ni requête de média.
 */

/* ========================================================== valeurs partagées */

/** l. 54 et 75. Les deux premières sections montent plus haut que les autres. */
export const SECTION_HAUTE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

/** l. 92, 109, 133… Le sur-titre orange, motif de toutes les sections. */
export const SURTITRE_SECTION: CSSProperties = { ...SURTITRE, marginBottom: 18 };

/** l. 93, 110, 197. Le H2 courant du gabarit. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 30px",
  textWrap: "balance",
};

/** l. 155, 216. Le H2 des panneaux et des colonnes étroites. */
export const TITRE2_ETROIT: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 20px",
  textWrap: "balance",
};

/** l. 91, 132, 214. La colonne de gauche qui suit le défilement. */
export const COLONNE_FIXE: CSSProperties = { position: "sticky", top: 110 };

/* =================================================================== 01 Héros */

/** l. 55 */
export const FIL_ARIANE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  font: "400 13px var(--fb)",
  color: "var(--ink4)",
  flexWrap: "wrap",
  marginBottom: 30,
};

/** l. 56 */
export const HERO: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 52,
  alignItems: "start",
};

/** l. 58. La pastille « Implantations », au-dessus du H1. */
export const PASTILLE_RUBRIQUE: CSSProperties = {
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

/** l. 58. Le point orange de la pastille. */
export const PASTILLE_POINT: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

/** l. 59 */
export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(40px,4.8vw,70px) * var(--ts))/1.02 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "15ch",
  textWrap: "balance",
};

/** l. 60 */
export const CHAPEAU_HERO: CSSProperties = {
  font: "400 18px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "24px 0 0",
  maxWidth: "50ch",
  textWrap: "pretty",
};

/** l. 61 */
export const RANGEE_BOUTONS: CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 28,
  flexWrap: "wrap",
};

/** l. 62. Le bouton orange, taille héros. */
export const BOUTON_ORANGE: CSSProperties = {
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

/** l. 63. Le bouton de téléphone du héros. */
export const BOUTON_TELEPHONE: CSSProperties = {
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

/** l. 65. Le bloc de délai, sous le filet du héros. */
export const BLOC_DELAI: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  marginTop: 32,
  paddingTop: 24,
  borderTop: "1px solid var(--line)",
};

/** l. 65. Le point orange auréolé du délai. */
export const DELAI_POINT: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 5px var(--acc-w)",
  flex: "none",
  marginTop: 7,
};

/** l. 65 */
export const DELAI_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "52ch",
};

/** l. 67. Le panneau en verre du héros. */
export const PANNEAU_HERO: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad)",
  overflow: "hidden",
  boxShadow: "0 30px 70px -34px rgba(0,0,0,.42)",
};

/** l. 69 */
export const PANNEAU_CORPS: CSSProperties = { padding: "26px 28px 28px" };

/** l. 70. « En bref », sur-titre du panneau, 14 de respiration et non 18. */
export const SURTITRE_PANNEAU: CSSProperties = { ...SURTITRE, marginBottom: 14 };

/** l. 71 */
export const PILE_REPERES: CSSProperties = { display: "grid", gap: 12 };

/** l. 71 */
export const REPERE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
  paddingTop: 12,
  borderTop: "1px solid var(--line)",
};

/** l. 71 */
export const REPERE_VALEUR: CSSProperties = {
  font: "600 20px/1.1 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  flex: "none",
  minWidth: 88,
};

/** l. 71 */
export const REPERE_LIBELLE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "var(--ink2)",
};

/**
 * La précision du corpus, sous le libellé. La maquette n'en pose pas : elle
 * n'en a pas besoin, son exemple n'en porte pas. Quatre pages du corpus en
 * écrivent une, et elle DIT L'ABSENCE d'agence sur place. Même petit texte que
 * le libellé, en `--ink3` pour passer au second plan.
 */
export const REPERE_DETAIL: CSSProperties = {
  font: "400 12.5px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 3,
};

/* ======================================================= 02 Bandeau de logos */

/** l. 82. L'entête « Ils nous font confiance », suivie d'un filet. */
export const ENTETE_LOGOS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 26,
  flexWrap: "wrap",
};

/** l. 82. Sur-titre gris, et non orange : c'est le seul du gabarit. */
export const SURTITRE_LOGOS: CSSProperties = {
  ...SURTITRE,
  color: "var(--ink4)",
  flex: "none",
};

/** l. 82 */
export const FILET_LOGOS: CSSProperties = {
  flex: 1,
  height: 1,
  background: "var(--line)",
  minWidth: 30,
};

/** l. 83. Le masque de fondu des deux bords de la bande. */
export const MASQUE_LOGOS =
  "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)";

/** l. 83 */
export const BANDE_LOGOS: CSSProperties = {
  overflow: "hidden",
  padding: "18px 0 4px",
  WebkitMaskImage: MASQUE_LOGOS,
  maskImage: MASQUE_LOGOS,
};

/** l. 84. 40 s pour un tour, contre 60 s sur la page d'accueil. */
export const PISTE_LOGOS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 72,
  width: "max-content",
  animation: "mgMarquee 40s linear infinite",
  animationPlayState: "var(--mq-play, running)",
};

/** l. 85 */
export const NOM_CLIENT: CSSProperties = {
  font: "700 18px var(--ft)",
  letterSpacing: ".08em",
  color: "var(--ink3)",
  whiteSpace: "nowrap",
  opacity: 0.72,
};

/* =============================================================== 03 Problème */

/** l. 90 */
export const VIS_A_VIS_PROBLEME: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 70,
  alignItems: "start",
};

/** l. 93. Le H2 du problème se resserre à 18 caractères. */
export const TITRE_PROBLEME: CSSProperties = {
  ...TITRE2,
  margin: "0 0 20px",
  maxWidth: "18ch",
};

/** l. 94 */
export const TEXTE_PROBLEME: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
};

/** l. 96 */
export const PILE_CARTES: CSSProperties = { display: "grid", gap: 12 };

/** l. 97 */
export const CARTE_PROBLEME: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  padding: "24px 28px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

/** l. 98. L'anneau orange creux, marque de la carte problème. */
export const CARTE_ANNEAU: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  border: "2px solid var(--acc)",
  flex: "none",
};

/** l. 99 */
export const CARTE_ACCROCHE: CSSProperties = {
  font: "600 16.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
};

/** l. 99 */
export const CARTE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  marginTop: 6,
};

/* =================================================================== 04 Offre */

/** l. 110. Le H2 de l'offre tient sur 24 caractères. */
export const TITRE_OFFRE: CSSProperties = { ...TITRE2, maxWidth: "24ch" };

/** l. 111. Le tableau, en une seule carte de verre. */
export const TABLEAU: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad)",
  boxShadow: "0 26px 60px -36px rgba(0,0,0,.34)",
  overflow: "hidden",
};

/** l. 112 et 114. La géométrie des rangées, entête comprise. */
export const TABLEAU_COLONNES = "52px minmax(0,1.05fr) minmax(0,.95fr)";

/** l. 112 */
export const TABLEAU_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: TABLEAU_COLONNES,
  gap: 28,
  padding: "18px 30px",
  borderBottom: "1px solid var(--line)",
};

/** l. 112 */
export const TABLEAU_ENTETE_GAUCHE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
};

/** l. 112 */
export const TABLEAU_ENTETE_DROITE: CSSProperties = {
  ...TABLEAU_ENTETE_GAUCHE,
  color: "var(--acc)",
};

/** l. 114 */
export const TABLEAU_RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: TABLEAU_COLONNES,
  gap: 28,
  padding: "22px 30px",
  alignItems: "start",
  borderTop: "1px solid var(--line)",
};

/** l. 115. Le numéro de rangée, en chasse fixe. */
export const RANGEE_NUMERO: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  paddingTop: 3,
};

/** l. 116 */
export const PRESTATION: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

/** l. 116 */
export const PRESTATION_ACCROCHE: CSSProperties = {
  display: "block",
  font: "600 16.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  marginBottom: 4,
};

/** l. 120 */
export const BENEFICE: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: "14px 16px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
};

/** l. 120 */
export const BENEFICE_FLECHE: CSSProperties = {
  color: "var(--acc)",
  font: "600 15px var(--fb)",
  flex: "none",
};

/** l. 120 */
export const BENEFICE_TEXTE: CSSProperties = {
  font: "500 14.5px/1.6 var(--fb)",
  color: "var(--ink)",
};

/** l. 124. Le pavé de notes sous le tableau. */
export const NOTES: CSSProperties = {
  display: "grid",
  gap: 6,
  marginTop: 14,
  padding: "20px 26px",
  borderRadius: 24,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,.5)",
};

/** l. 125 */
export const NOTE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
};

/* ================================================================ 05 Déroulé */

/** l. 131 */
export const GRILLE_DEROULE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".8fr 1.2fr",
  gap: 56,
  alignItems: "start",
};

/** l. 134. Le H2 du déroulé, 16 caractères et 24 de respiration. */
export const TITRE_DEROULE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,44px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 24px",
  maxWidth: "16ch",
};

/** l. 137 */
export const FRISE: CSSProperties = { position: "relative", paddingLeft: 4 };

/** l. 138. Le filet vertical derrière les pastilles. */
export const FRISE_FILET: CSSProperties = {
  position: "absolute",
  left: 21,
  top: 22,
  bottom: 22,
  width: 2,
  background: "var(--line)",
};

/** l. 140 */
export const ETAPE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "44px minmax(0,1fr)",
  gap: 22,
  padding: "0 0 30px",
};

/** l. 141. L'auréole de fond découpe le filet derrière la pastille. */
export const ETAPE_NUMERO: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px/44px var(--fb)",
  textAlign: "center",
  boxShadow: "0 0 0 6px var(--bg)",
};

/** l. 142 */
export const ETAPE_CORPS: CSSProperties = { paddingTop: 8 };

/** l. 142 */
export const ETAPE_TITRE: CSSProperties = {
  font: "600 18px/1.35 var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 8,
};

/** l. 142 */
export const ETAPE_TEXTE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "60ch",
};

/* ============================================================== 06 Garanties */

/** l. 150. Cette section respire 24 sur les côtés, pas 40. */
export const SECTION_PANNEAU: CSSProperties = { padding: "var(--sec) 24px 0" };

/** l. 151 */
export const PANNEAU_SOMBRE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "58px 56px",
  position: "relative",
  overflow: "hidden",
};

/** l. 152. La lueur orange, en haut à droite du panneau des garanties. */
export const LUEUR_GARANTIES: CSSProperties = {
  position: "absolute",
  width: 480,
  height: 480,
  right: -180,
  top: -220,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

/** l. 155 */
export const TITRE_GARANTIES: CSSProperties = {
  ...TITRE2_ETROIT,
  color: "#fff",
  margin: "0 0 36px",
  maxWidth: "22ch",
};

/** l. 156 */
export const GRILLE_GARANTIES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "30px 40px",
};

/** l. 158 */
export const GARANTIE: CSSProperties = {
  borderTop: "2px solid var(--acc)",
  paddingTop: 22,
};

/** l. 158 */
export const GARANTIE_TITRE: CSSProperties = {
  font: "600 18px/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "#fff",
  marginBottom: 12,
};

/** l. 158 */
export const GARANTIE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
};

/* ============================================================== Réassurance */

/** l. 165 */
export const GRILLE_REASSURANCE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".85fr 1.15fr",
  gap: 20,
  alignItems: "stretch",
};

/** l. 166 et 174 */
export const CARTE_REASSURANCE: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  padding: "34px 36px",
};

/** l. 167. Le sur-titre des certifications respire 22. */
export const SURTITRE_REASSURANCE: CSSProperties = {
  ...SURTITRE,
  marginBottom: 22,
};

/** l. 168 */
export const GRILLE_CERTIFICATIONS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 22,
};

/** l. 169 */
export const CERTIFICATION: CSSProperties = {
  borderRadius: "var(--rad-s)",
  background: "var(--card)",
  border: "1px solid var(--line)",
  padding: 20,
};

/** l. 169 */
export const CERTIFICATION_NOM: CSSProperties = {
  font: "700 22px var(--ft)",
  letterSpacing: ".02em",
};

/** l. 169 */
export const CERTIFICATION_NOTE: CSSProperties = {
  font: "400 13px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 6,
};

/** l. 172 */
export const ATTESTATIONS: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/** l. 174 */
export const CARTE_EQUIPE: CSSProperties = {
  ...CARTE_REASSURANCE,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

/** l. 176 */
export const BANDEAU_SELECTION: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  padding: "22px 26px",
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  flexWrap: "wrap",
};

/** l. 176 */
export const SELECTION_CHIFFRE: CSSProperties = {
  font: "600 calc(52px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.06em",
  color: "var(--acc)",
  whiteSpace: "nowrap",
};

/** l. 176 */
export const SELECTION_TEXTE: CSSProperties = {
  font: "400 14.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.7)",
  flex: 1,
  minWidth: 180,
};

/** l. 177 */
export const DUO_REPERES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

/** l. 178 */
export const DUO_TITRE: CSSProperties = {
  font: "600 18px var(--ft)",
  letterSpacing: "-.025em",
};

/** l. 178 */
export const DUO_NOTE: CSSProperties = {
  font: "400 13.5px var(--fb)",
  color: "var(--ink3)",
  marginTop: 4,
};

/** l. 181 */
export const HUBS_TITRE: CSSProperties = {
  font: "600 13px var(--fb)",
  color: "var(--ink1)",
  marginBottom: 10,
};

/** l. 181 */
export const HUBS_RANGEE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

/** l. 181 */
export const HUB: CSSProperties = {
  font: "500 12.5px var(--fb)",
  padding: "6px 12px",
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink1)",
};

/* =================================================================== 07 Appel */

/** l. 187 */
export const BANDEAU_APPEL: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 26,
  flexWrap: "wrap",
  padding: "34px 34px 34px 42px",
  borderRadius: 36,
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

/** l. 188 */
export const APPEL_QUESTION: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.22 var(--ft)",
  letterSpacing: "-.034em",
  marginBottom: 10,
  maxWidth: "32ch",
  textWrap: "balance",
};

/** l. 188 */
export const APPEL_RAPPEL: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

/** l. 189. Le bouton blanc du bandeau d'appel, plein et non translucide. */
export const BOUTON_BLANC: CSSProperties = {
  ...BOUTON_TELEPHONE,
  background: "#fff",
};

/* ============================================================= 08 Références */

/** l. 198 */
export const GRILLE_PREUVES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 16,
};

/** l. 200 */
export const CARTE_PREUVE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--card)",
  border: "1px solid var(--line)",
  transition: "transform var(--tr), box-shadow var(--tr)",
};

/** l. 202 */
export const PREUVE_CORPS: CSSProperties = {
  padding: "22px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

/** l. 203 */
export const PREUVE_CLIENT: CSSProperties = {
  font: "700 12px var(--ft)",
  letterSpacing: ".1em",
  color: "var(--acc)",
};

/** l. 204 */
export const PREUVE_TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

/** l. 205 */
export const PREUVE_TEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
};

/** l. 206 */
export const PREUVE_LIBELLE: CSSProperties = {
  marginTop: "auto",
  paddingTop: 14,
  borderTop: "1px solid var(--line)",
  font: "600 13.5px/1.45 var(--fb)",
  color: "var(--ink)",
};

/* ============================================================== 09 Questions */

/** l. 213 */
export const GRILLE_QUESTIONS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".75fr 1.25fr",
  gap: 56,
  alignItems: "start",
};

/** l. 216 */
export const TITRE_QUESTIONS: CSSProperties = {
  ...TITRE2_ETROIT,
  maxWidth: "14ch",
};

/** l. 217 */
export const QUESTIONS_INTRO: CSSProperties = {
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink2)",
  marginBottom: 18,
};

/** l. 218. Le bouton de téléphone de la colonne, plus ramassé que celui du héros. */
export const BOUTON_TELEPHONE_PETIT: CSSProperties = {
  ...BOUTON_TELEPHONE,
  padding: "13px 22px",
  background: "#fff",
};

/** l. 223 */
export const CARTE_QUESTION: CSSProperties = {
  ...VERRE,
  borderRadius: 22,
  padding: "24px 28px",
};

/** l. 224 */
export const QUESTION: CSSProperties = {
  font: "600 17px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
};

/** l. 225 */
export const REPONSE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/* ================================================================= Maillage */

/** l. 237 */
export const GRILLE_MAILLAGE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 12,
};

/** l. 239 */
export const CARTE_LIEN: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  transition: "transform var(--tr)",
};

/** l. 241 */
export const LIEN_CORPS: CSSProperties = {
  padding: "20px 22px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

/** l. 242 */
export const LIEN_ENTETE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

/** l. 242 */
export const LIEN_TITRE: CSSProperties = {
  font: "600 17px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

/** l. 242 */
export const LIEN_FLECHE: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  font: "600 14px var(--fb)",
};

/** l. 243 */
export const LIEN_CONTEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
};

/** l. 244 */
export const LIEN_CHEMIN: CSSProperties = {
  marginTop: "auto",
  font: "500 12px ui-monospace,Menlo,monospace",
  color: "var(--ink4)",
};

/* ============================================================ 10 Appel final */

/** l. 252. La dernière section ferme aussi en bas. */
export const SECTION_PANNEAU_FINAL: CSSProperties = {
  padding: "var(--sec) 24px var(--sec)",
};

/** l. 253 */
export const PANNEAU_FINAL: CSSProperties = {
  ...PANNEAU_SOMBRE,
  padding: 56,
};

/** l. 254. La lueur du panneau final est centrée, et plus large. */
export const LUEUR_FINALE: CSSProperties = {
  position: "absolute",
  width: 640,
  height: 640,
  left: "50%",
  top: -300,
  transform: "translateX(-50%)",
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
  pointerEvents: "none",
};

/** l. 258 */
export const TITRE_FINAL: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 20px",
  textWrap: "balance",
};

/** l. 259 */
export const TEXTE_FINAL: CSSProperties = {
  font: "400 15.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 22px",
  maxWidth: "40ch",
};

/** l. 260 */
export const BOUTON_FINAL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};
