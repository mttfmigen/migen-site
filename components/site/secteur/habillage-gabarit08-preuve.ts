import type { CSSProperties } from "react";

/* ===========================================================================
   GABARIT 08 SECTEUR, SECONDE MOITIÉ : réassurance, preuve, conversion.

   Suite de `habillage-gabarit08.ts`, même source et même règle : les valeurs
   sont relevées dans `maquette/gabarit-08-secteur.html`, qui FAIT FOI pour les
   13 pages `/secteurs/<secteur>/` et fait foi CONTRE « Site final ».

   LA COUPE SUIT CELLE DES COMPOSANTS, et c'est son seul intérêt : les sections
   01 Héros à 06 Garanties sont dessinées par `BlocsSecteur.tsx` et habillées par
   `habillage-gabarit08.ts` ; « Réassurance » à « 10 Appel final » sont dessinées
   par `BlocsPreuveEtAppel.tsx` et habillées par ce fichier. Pour savoir où vit
   une valeur, il suffit de savoir quel composant la rend.
   =========================================================================== */

/* --------------------------------------------------------- Réassurance */

export const REASSURANCE_GRILLE = ".85fr 1.15fr";

export const REASSURANCE_CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
  padding: "34px 36px",
};

export const CERTIF_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 22,
};

export const CERTIF_CARTE: CSSProperties = {
  borderRadius: "var(--rad-s)",
  background: "var(--card)",
  border: "1px solid var(--line)",
  padding: 20,
};

export const CERTIF_NOM: CSSProperties = {
  font: "700 22px var(--ft)",
  letterSpacing: ".02em",
};

export const CERTIF_TEXTE: CSSProperties = {
  font: "400 13px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 6,
};

export const CERTIF_MENTION: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

export const QUI_CARTE: CSSProperties = {
  ...REASSURANCE_CARTE,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

export const QUI_BANDE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  padding: "22px 26px",
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  flexWrap: "wrap",
};

export const QUI_CHIFFRE: CSSProperties = {
  font: "600 calc(52px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.06em",
  color: "var(--acc)",
  whiteSpace: "nowrap",
};

export const QUI_TEXTE: CSSProperties = {
  font: "400 14.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.7)",
  flex: 1,
  minWidth: 180,
};

export const QUI_PAIRE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

export const QUI_FAIT_TITRE: CSSProperties = {
  font: "600 18px var(--ft)",
  letterSpacing: "-.025em",
};

export const QUI_FAIT_TEXTE: CSSProperties = {
  font: "400 13.5px var(--fb)",
  color: "var(--ink3)",
  marginTop: 4,
};

export const HUBS_TITRE: CSSProperties = {
  font: "600 13px var(--fb)",
  color: "var(--ink1)",
  marginBottom: 10,
};

export const HUBS_RANGEE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

export const HUB_PUCE: CSSProperties = {
  font: "500 12.5px var(--fb)",
  padding: "6px 12px",
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink1)",
};

/* ------------------------------------------------------------- 07 Appel */

export const APPEL_BANDE: CSSProperties = {
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

/** La question de « 07 Appel » n'est PAS un titre de niveau deux : la page n'a
    qu'un h1 et six h2, et celui-ci n'en fait pas partie dans la maquette. */
export const APPEL_QUESTION: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.22 var(--ft)",
  letterSpacing: "-.034em",
  marginBottom: 10,
  maxWidth: "32ch",
  textWrap: "balance",
};

export const APPEL_RAPPEL: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

export const APPEL_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};

/* -------------------------------------------------------- 08 Références */

/** Pas de `max-width` sur ce h2 : « Nos références » tient sur une ligne. */
export const REFS_TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 30px",
};

export const REFS_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 16,
};

export const REF_CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--card)",
  border: "1px solid var(--line)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

export const REF_PHOTO: CSSProperties = {
  height: 180,
  background: "#dedfe1",
  overflow: "hidden",
  flex: "none",
};

export const REF_CORPS: CSSProperties = {
  padding: "22px 24px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

export const REF_CLIENT: CSSProperties = {
  font: "700 12px var(--ft)",
  letterSpacing: ".1em",
  color: "var(--acc)",
};

export const REF_TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

export const REF_TEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
};

export const REF_LIBELLE: CSSProperties = {
  marginTop: "auto",
  paddingTop: 14,
  borderTop: "1px solid var(--line)",
  font: "600 13.5px/1.45 var(--fb)",
  color: "var(--ink)",
};

/* ---------------------------------------------------------- 09 Questions */

export const QUESTIONS_GRILLE = ".75fr 1.25fr";

export const QUESTIONS_TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 20px",
  maxWidth: "14ch",
};

export const QUESTIONS_RELANCE: CSSProperties = {
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink2)",
  marginBottom: 18,
};

export const QUESTIONS_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 22px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
  font: "600 15px var(--fb)",
};

/** Rayon 22px, et aucune ombre : la carte de FAQ est plus légère que ses
    voisines en verre. */
export const CARTE_QUESTION: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: 22,
  padding: "24px 28px",
};

export const QUESTION_TITRE: CSSProperties = {
  font: "600 17px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
};

export const QUESTION_REPONSE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/* ------------------------------------------------------------- Maillage */

export const MAILLAGE_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 12,
};

export const MAILLAGE_CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: 24,
  overflow: "hidden",
  background: "rgba(255,255,255,var(--gl-a))",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  transition: "transform var(--tr)",
};

export const MAILLAGE_PHOTO: CSSProperties = {
  height: 130,
  background: "#dedfe1",
  overflow: "hidden",
};

export const MAILLAGE_CORPS: CSSProperties = {
  padding: "20px 22px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

export const MAILLAGE_ENTETE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

export const MAILLAGE_TITRE: CSSProperties = {
  font: "600 17px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

export const MAILLAGE_FLECHE: CSSProperties = {
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

export const MAILLAGE_TEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
};

export const MAILLAGE_CHEMIN: CSSProperties = {
  marginTop: "auto",
  font: "500 12px ui-monospace,Menlo,monospace",
  color: "var(--ink4)",
};

/* -------------------------------------------------------- 10 Appel final */

/** La seule section qui ferme avec `var(--sec)` en bas : c'est la dernière. */
export const FINAL_SECTION: CSSProperties = {
  padding: "var(--sec) 24px var(--sec)",
};

export const FINAL_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  borderRadius: 40,
  background: "var(--panel)",
  padding: 56,
  position: "relative",
  overflow: "hidden",
};

export const FINAL_LUEUR: CSSProperties = {
  position: "absolute",
  width: 640,
  height: 640,
  left: "50%",
  top: -300,
  transform: "translateX(-50%)",
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
  pointerEvents: "none",
};

export const FINAL_GRILLE = ".9fr 1.1fr";

export const FINAL_TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 20px",
  textWrap: "balance",
};

export const FINAL_TEXTE: CSSProperties = {
  font: "400 15.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 22px",
  maxWidth: "40ch",
};

export const FINAL_TEL: CSSProperties = {
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

/** La carte blanche du formulaire. La maquette déclare `background` deux fois,
    verre puis `#fff` : la seconde gagne, la carte est opaque. */
export const FINAL_CARTE: CSSProperties = {
  scrollMarginTop: 110,
  border: "1px solid var(--gbd)",
  boxShadow: "0 30px 70px -30px rgba(0,0,0,.6)",
  background: "#fff",
  borderRadius: "var(--rad)",
  padding: 30,
};

export const FINAL_CARTE_ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "6px 14px",
  marginBottom: 20,
  flexWrap: "wrap",
};

export const FINAL_CARTE_TITRE: CSSProperties = {
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
};

/** « Rappel dans l'heure » : le SEUL délai chiffré que le contrat autorise. */
export const FINAL_CARTE_MENTION: CSSProperties = {
  font: "500 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--acc)",
};
