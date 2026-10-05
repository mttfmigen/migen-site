import type { CSSProperties } from "react";

/**
 * Habillage du gabarit OFFRE, relevé dans `maquette/gabarit-03-offre.html`,
 * copie versionnée de « Migen - Gabarit 03 Offre.dc.html ».
 *
 * CE FICHIER A ÉTÉ RÉÉCRIT, et il faut savoir pourquoi. Sa première version
 * était relevée dans « Migen - Site final.dc.html », qui n'est PAS le fichier
 * de maquette de ce gabarit. Le client a dit trois fois « les pages offres ne
 * ressemblent toujours pas » : elles ne ressemblaient pas, parce que le portage
 * lisait un autre dessin. Le fichier qui fait foi est le gabarit dédié, et lui
 * seul. Toute valeur ci-dessous est relue par
 * `verification-offre.tsx` dans ce fichier, à chaque exécution.
 *
 * POURQUOI DES CONSTANTES ET NON DES CLASSES : la maquette pilote tout par
 * styles en ligne, et les mêmes déclarations y reviennent des dizaines de fois.
 * Une valeur, un seul endroit. Les jetons communs à tout le site
 * (`SECTION`, `LARGEUR`, `VERRE`, `PANNEAU`, `SURTITRE`…) vivent dans
 * `components/site/blocs/habillage.ts` et sont importés, pas recopiés.
 *
 * LES SURVOLS NE SONT PAS ICI : un style en ligne ne porte pas d'état. Ils sont
 * dans `PageOffre.module.css`, avec leur `:focus-visible`.
 */

/* ------------------------------------------------------------- 01 Héros */

/** `padding:40px 40px 0` sur la section du héros, qui porte sa propre largeur. */
export const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 40px 0",
};

/** `grid-template-columns:1.12fr .88fr` : le texte, puis le panneau formulaire. */
export const HERO_GRILLE = "1.12fr .88fr";

export const FIL_ARIANE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  font: "400 13px var(--fb)",
  color: "var(--ink4)",
  flexWrap: "wrap",
  marginBottom: 30,
};

export const HERO_RANGEE_PASTILLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 26,
  flexWrap: "wrap",
};

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

export const PASTILLE_PUCE: CSSProperties = {
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

export const CHAPEAU_HERO: CSSProperties = {
  font: "400 17.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "26px 0 0",
  maxWidth: "48ch",
};

export const HERO_RANGEE_BOUTONS: CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 26,
  flexWrap: "wrap",
};

/** Le bouton orange du héros, `padding:15px 26px`. */
export const BOUTON_HERO: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
  transition: "filter var(--tr),transform var(--tr)",
};

/** Le lien téléphone du héros : du texte, pas de cadre. */
export const LIEN_TELEPHONE_HERO: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  border: "1px solid transparent",
  color: "var(--ink1)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "color var(--tr)",
};

/**
 * La bande de chiffres du héros, sous les boutons.
 *
 * `heroStatGrid` de la maquette : une colonne par chiffre, et un filet à gauche
 * de chaque colonne sauf la première. Le nombre de colonnes suit la donnée, il
 * n'est donc pas une constante ici mais le produit de `grilleChiffresHero`.
 */
export function grilleChiffresHero(nombre: number): CSSProperties {
  return {
    display: "grid",
    gap: 22,
    marginTop: 34,
    paddingTop: 26,
    borderTop: "1px solid var(--line)",
    gridTemplateColumns: `repeat(${Math.max(nombre, 1)},minmax(0,1fr))`,
  };
}

/** Le filet de séparation entre deux chiffres du héros. */
export const CHIFFRE_HERO_FILET: CSSProperties = {
  paddingLeft: 22,
  borderLeft: "1px solid var(--line)",
};

export const CHIFFRE_HERO_VALEUR: CSSProperties = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
};

export const CHIFFRE_HERO_LIBELLE: CSSProperties = {
  font: "400 12.5px/1.45 var(--fb)",
  color: "var(--ink4)",
  marginTop: 2,
  maxWidth: "24ch",
};

/** `p.delai` : la phrase sous la bande de chiffres. */
export const PHRASE_DELAI: CSSProperties = {
  font: "400 13.5px/1.6 var(--fb)",
  color: "var(--ink3)",
  margin: "22px 0 0",
  maxWidth: "52ch",
};

/** Le panneau en verre du héros. Ombre plus profonde que les autres cartes. */
export const HERO_PANNEAU_FORMULAIRE: CSSProperties = {
  position: "relative",
  scrollMarginTop: 110,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: "var(--rad)",
  padding: "30px 30px 32px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
};

export const HERO_FORMULAIRE_ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  columnGap: 14,
  rowGap: 6,
  marginBottom: 20,
  flexWrap: "wrap",
};

export const HERO_FORMULAIRE_TITRE: CSSProperties = {
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
};

/** « Rappel dans l'heure », en capitales par CSS. Le seul délai autorisé. */
export const HERO_FORMULAIRE_MENTION: CSSProperties = {
  font: "500 11.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

/* ------------------------------------------------------------- 02 Photo */

export const PHOTO_SECTION: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

export const PHOTO_CADRE: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  minHeight: 420,
  background: "linear-gradient(150deg,#d8d9dc,#eceded 55%,#e4e2de)",
  boxShadow: "0 30px 70px -40px rgba(0,0,0,.5)",
};

export const PHOTO_IMAGE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.06)",
};

export const PHOTO_VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom,rgba(28,27,25,.34) 0%,rgba(28,27,25,0) 42%,rgba(28,27,25,.72) 100%)",
};

export const PHOTO_SIGNATURE: CSSProperties = {
  position: "absolute",
  top: 26,
  left: 28,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

/** « Innovation, performance, impact. » sur la photo. */
export const PHOTO_BASELINE: CSSProperties = {
  font: "500 11.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.8)",
};

export const PHOTO_PIED: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: 32,
};

/**
 * Le rappel du H1 sur la photo.
 *
 * `div` et jamais `h2` : la maquette l'écrit en `div`, et un titre de niveau 2
 * qui redit le H1 ajouterait un doublon au plan du document.
 */
export const PHOTO_TITRE: CSSProperties = {
  font: "600 calc(26px * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "#fff",
  maxWidth: "22ch",
};

/* ------------------------------------------------------- Réassurance */

/** `grid-template-columns:.9fr 1.1fr` : certifications, puis panneau sombre. */
export const REASSURANCE_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".9fr 1.1fr",
  gap: 20,
  alignItems: "stretch",
};

/** Le panneau sombre « Qui intervient chez vous », `padding:34px 36px 36px`. */
export const PANNEAU_QUI: CSSProperties = {
  background: "var(--panel)",
  borderRadius: "var(--rad)",
  padding: "34px 36px 36px",
  position: "relative",
  overflow: "hidden",
};

export const PANNEAU_QUI_LUEUR: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

export const QUI_VALEUR: CSSProperties = {
  font: "600 30px/1 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
};

export const QUI_LIBELLE: CSSProperties = {
  font: "400 13px/1.45 var(--fb)",
  color: "rgba(255,255,255,.6)",
  marginTop: 8,
};

export const QUI_RANGEE_HUBS: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 24,
  paddingTop: 20,
  borderTop: "1px solid rgba(255,255,255,.12)",
};

export const QUI_HUB: CSSProperties = {
  font: "500 12px var(--fb)",
  padding: "5px 11px",
  borderRadius: 999,
  background: "rgba(255,255,255,.08)",
  color: "rgba(255,255,255,.75)",
};

export const QUI_AGENCES: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "rgba(255,255,255,.45)",
  marginTop: 14,
};

/* --------------------------------------------------------- 03 Problème */

/** `grid-template-columns:1fr 1fr;gap:70px` : la colonne collante, les cartes. */
export const PROBLEME_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 70,
  alignItems: "start",
};

/** `position:sticky;top:110px`. `.g3-sticky` le désarme sous 900px. */
export const COLONNE_COLLANTE: CSSProperties = {
  position: "sticky",
  top: 110,
};

export const PROBLEME_TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 22px",
  maxWidth: "22ch",
  textWrap: "balance",
};

export const PROBLEME_TEXTE: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

export const PROBLEME_PILE: CSSProperties = { display: "grid", gap: 12 };

/**
 * La carte numérotée du problème. C'est l'écart le plus visible avec ce que le
 * site rendait : une liste à puces là où la maquette pose quatre cartes en
 * verre, numérotées 01 à 04, chiffre orange de 30px sur 44px de gouttière.
 */
export const PROBLEME_CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: "var(--rad)",
  padding: "26px 28px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -30px rgba(0,0,0,.3)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

export const PROBLEME_RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 16,
};

export const PROBLEME_NUMERO: CSSProperties = {
  font: "600 30px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "none",
  width: 44,
};

export const PROBLEME_ACCROCHE: CSSProperties = {
  font: "600 16px var(--ft)",
  letterSpacing: "-.02em",
};

export const PROBLEME_DETAIL: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 4,
};

/* ------------------------------------------------------------ 04 Offre */

/** Le H2 de l'offre tient 24ch, un cran plus large que `TITRE2`. */
export const OFFRE_TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 30px",
  maxWidth: "24ch",
  textWrap: "balance",
};

/** Le cadre en verre du tableau. Ombre propre, plus large que `VERRE`. */
export const OFFRE_CADRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 26px 60px -36px rgba(0,0,0,.34)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
};

/** Les trois colonnes : le rang, la prestation, le bénéfice. */
export const OFFRE_COLONNES = "52px minmax(0,1.05fr) minmax(0,.95fr)";

export const OFFRE_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: OFFRE_COLONNES,
  gap: 28,
  padding: "18px 30px",
  borderBottom: "1px solid var(--line)",
};

/** `font:600 11px` : un cran plus petit que le surtitre de section. */
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

export const OFFRE_LIGNE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: OFFRE_COLONNES,
  gap: 28,
  padding: "22px 30px",
  alignItems: "start",
  borderTop: "1px solid var(--line)",
};

export const OFFRE_RANG: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  paddingTop: 3,
};

export const OFFRE_PRESTATION: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

export const OFFRE_PRESTATION_FORT: CSSProperties = {
  display: "block",
  font: "600 16.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  marginBottom: 4,
};

/** Le bénéfice, sur fond orange pâle `--acc-w`. */
export const OFFRE_BENEFICE: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: "14px 16px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
};

export const OFFRE_BENEFICE_FLECHE: CSSProperties = {
  color: "var(--acc)",
  font: "600 15px var(--fb)",
  flex: "none",
};

export const OFFRE_BENEFICE_TEXTE: CSSProperties = {
  font: "500 14.5px/1.6 var(--fb)",
  color: "var(--ink)",
};

/** La note sous le tableau : rayon 24px, pas `--rad`. */
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

/* --------------------------------------------------------- 05 Déroulé */

export const METHODE_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

export const METHODE_TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

/** Trois colonnes, `gap:34px 0` : les étapes forment une frise, pas des cartes. */
export const METHODE_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: "34px 0",
  position: "relative",
};

export const METHODE_ETAPE: CSSProperties = {
  position: "relative",
  padding: "0 28px 0 0",
};

/** Le filet horizontal qui traverse la pastille, à `top:11px` (son rayon). */
export const METHODE_FILET: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 11,
  height: 1,
  background: "var(--line)",
};

export const METHODE_PASTILLE: CSSProperties = {
  position: "relative",
  display: "block",
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 5px var(--bg)",
};

export const METHODE_RANG: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  margin: "18px 0 8px",
};

export const METHODE_ETAPE_TITRE: CSSProperties = {
  font: "600 18px/1.35 var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 8,
};

export const METHODE_ETAPE_TEXTE: CSSProperties = {
  font: "400 14.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/* ------------------------------------------------------- 06 Garanties */

/** `padding:var(--sec) 24px 0` : la gouttière se resserre, le panneau respire. */
export const GARANTIES_SECTION: CSSProperties = {
  padding: "var(--sec) 24px 0",
};

/** Rayon 40px, et non `--rad` : les deux grands panneaux sombres l'ont. */
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
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

export const GARANTIES_TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 36px",
  maxWidth: "22ch",
};

export const GARANTIES_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "30px 40px",
};

/** Pas de carte : un filet orange de 2px en tête de chaque engagement. */
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

/* ----------------------------------------------------------- 07 Appel */

/** La bande orange pâle, rayon 36px, bordure 1.5px. */
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

export const APPEL_BOUTON: CSSProperties = {
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

/** Le second bouton de la bande : blanc, posé sur l'orange pâle. */
export const APPEL_BOUTON_BLANC: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------ 08 Références */

export const REFERENCES_ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 40,
  marginBottom: 38,
  flexWrap: "wrap",
};

export const REFERENCES_TOUT_VOIR: CSSProperties = {
  font: "600 15px var(--fb)",
  color: "var(--acc)",
  flex: "none",
  paddingBottom: 6,
};

/** `repeat(3,1fr);gap:16px`. `.mg-rmulti` replie à 2 puis 1 colonne. */
export const REFERENCES_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 16,
};

/** Carte opaque `--card`, pas en verre : elle porte une photo. */
export const REFERENCE_CARTE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  boxShadow: "0 1px 1px rgba(0,0,0,.04)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

export const REFERENCE_PHOTO: CSSProperties = {
  height: 210,
  flex: "none",
  filter: "saturate(var(--sat)) contrast(1.05)",
  background: "var(--ph) center/cover no-repeat",
};

export const REFERENCE_CORPS: CSSProperties = {
  padding: "24px 26px 28px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
};

export const REFERENCE_CLIENT: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

export const REFERENCE_TITRE: CSSProperties = {
  font: "600 19px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  marginTop: 12,
};

export const REFERENCE_TEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
};

export const REFERENCE_LIEN: CSSProperties = {
  marginTop: "auto",
  paddingTop: 16,
  font: "600 13.5px/1.45 var(--fb)",
  color: "var(--ink)",
};

/* -------------------------------------------------------- 09 Questions */

/** `grid-template-columns:.75fr 1.25fr` : la colonne collante est la plus mince. */
export const QUESTIONS_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".75fr 1.25fr",
  gap: 56,
  alignItems: "start",
};

export const QUESTIONS_TITRE: CSSProperties = {
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

/** Le bouton téléphone de la colonne : `padding:13px 22px`, pas 15px 26px. */
export const QUESTIONS_BOUTON_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 22px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
  font: "600 15px var(--fb)",
};

/** Carte de question : rayon 22px, et non `--rad`. */
export const QUESTION_CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  borderRadius: 22,
  padding: "24px 28px",
};

export const QUESTION_INTITULE: CSSProperties = {
  font: "600 17px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
};

export const QUESTION_REPONSE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/* --------------------------------------------------------- Maillage */

/** `auto-fit,minmax(250px,1fr)` : le nombre de cartes ne force pas la grille. */
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
  filter: "saturate(var(--sat))",
  background: "#dedfe1 center/cover no-repeat",
};

export const MAILLAGE_CORPS: CSSProperties = {
  padding: "20px 22px 22px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
};

export const MAILLAGE_RANGEE_TITRE: CSSProperties = {
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

/* ------------------------------------------------------ 10 Appel final */

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

/** La lueur du dernier panneau est centrée, pas en coin. */
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

export const FINAL_TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.4vw,46px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 26px",
  textWrap: "balance",
};

export const FINAL_BOUTON_FANTOME: CSSProperties = {
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

/* ----------------------------------------------- copie propre à la maquette */

/**
 * Les surtitres et titres FIXES du gabarit, relevés dans le fichier de maquette.
 *
 * POURQUOI ILS SONT ICI ET NON DANS LE CORPUS : ce sont les étiquettes de
 * section du dessin, pas du texte rédigé. Le corpus n'en porte aucune, et une
 * page d'offre ne les change jamais. Les inventer serait fautif ; les relever
 * dans la maquette et les nommer ici est exactement ce que le chantier demande.
 * `verification-offre.tsx` vérifie que chacune est bien dans la maquette.
 */
export const COPIE = {
  pastilleHero: "Nos offres",
  mentionRappel: "Rappel dans l’heure",
  photoBaseline: "Innovation, performance, impact.",
  photoSurtitre: "Nos offres",
  photoAlt: "Technicien de maintenance migen en intervention",
  logosSurtitre: "Ils nous font confiance",
  certificationsSurtitre: "Certifications",
  quiSurtitre: "Qui intervient chez vous",
  problemeSurtitre: "Votre problématique",
  offreSurtitre: "L’offre",
  offreTitre: "Ce que nous faisons, et ce que ça change pour vous",
  offreColonneGauche: "Ce que nous faisons",
  offreColonneDroite: "Ce que ça change pour vous",
  methodeSurtitre: "Notre méthode",
  methodeTitre: "Comment ça se passe, étape par étape",
  garantiesSurtitre: "Notre parti pris",
  garantiesTitre: "Ce que nous garantissons",
  referencesSurtitre: "Nos réalisations",
  referencesTitre: "Nos références",
  referencesToutVoir: "Toutes nos études de cas",
  questionsSurtitre: "Questions fréquentes",
  questionsTitre: "Vos questions avant de nous appeler",
  maillageSurtitre: "Pour aller plus loin",
  filAccueil: "Accueil",
  filOffres: "Nos offres",
} as const;

/**
 * La relance de la colonne des questions.
 *
 * Séparée de `COPIE` parce qu'elle porte une espace insécable avant le point
 * d'interrogation, que la maquette écrit `&nbsp;` et que le JSX doit écrire en
 * caractère. Le contrôle compare les deux formes.
 */
export const QUESTIONS_RELANCE_TEXTE = "Une autre question ? Un technicien vous répond.";

/**
 * Le panneau « Qui intervient chez vous », tel que la maquette l'écrit.
 *
 * TROIS CHIFFRES, et le libellé exact. « 10 hubs de techniciens en France » et
 * « 4 agences » sont la version mandatée du contrat (dix hubs, quatre agences) :
 * ce sont les mêmes valeurs des deux côtés, rien à arbitrer ici.
 */
export const QUI_CHIFFRES: readonly { valeur: string; libelle: string }[] = [
  { valeur: "10 %", libelle: "des candidats retenus" },
  {
    valeur: "Salariés",
    libelle:
      "techniciens Migen, évalués sur la technique et le comportement",
  },
  { valeur: "10", libelle: "hubs de techniciens en France" },
];

/** Les dix hubs, dans l'ordre de la maquette (`const HUBS`). */
export const HUBS: readonly string[] = [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
];

/** Les quatre agences. Siège à Limonest, près de Lyon (CLAUDE.md, section 1). */
export const AGENCES = "4 agences : Lyon (siège, à Limonest), Montréal, Dubaï, Madrid.";

/**
 * La rotation de photos de la maquette (`const PHOTOS`), servie depuis
 * `public/assets/web/`. Ce sont des visuels de SITE, pas du corpus : la
 * maquette les assigne elle-même par rang, et c'est le dessin, pas du contenu
 * inventé.
 */
export const PHOTOS: readonly string[] = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
];

/** La photo du bandeau « 02 Photo ». */
export const PHOTO_BANDEAU = "/assets/web/team-grind-sparks.jpg";

/** `url(...)` de la photo de rang `rang`, comme la maquette la compose. */
export function photoDeRang(rang: number): string {
  return `url(/assets/web/${PHOTOS[rang % PHOTOS.length]}.jpg)`;
}

/**
 * Le nom du client, tiré du libellé de l'étude de cas.
 *
 * La maquette fait exactement ce calcul : elle retire le préfixe « Étude de
 * cas », puis coupe sur le premier « : ». « Étude de cas SUEZ : remise en état
 * d'un site » donne « SUEZ ». Rien n'est inventé : le nom est déjà dans le
 * corpus, il est seulement dégagé de son enrobage.
 */
export function clientDuLibelle(libelle: string | undefined): string {
  if (!libelle) return "";
  return libelle.replace(/^Étude de cas\s*/, "").split(" : ")[0] ?? "";
}

/** `01`, `02`, … comme la maquette : `String(i + 1).padStart(2, "0")`. */
export function rang(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * La punchline du problème, coupée en titre et texte.
 *
 * La maquette coupe sur la fin de phrase, point, point d'interrogation ou
 * d'exclamation suivi d'une espace : la première phrase devient le H2, les
 * suivantes le paragraphe. Une punchline
 * d'une seule phrase donne donc un H2 et pas de paragraphe, et c'est voulu.
 */
export function coupePunchline(punchline: string): {
  titre: string;
  texte: string;
} {
  const phrases = punchline.split(/(?<=[.?!])\s+/).filter(Boolean);
  return { titre: phrases[0] ?? "", texte: phrases.slice(1).join(" ") };
}
