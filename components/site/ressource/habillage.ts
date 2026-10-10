import type { CSSProperties } from "react";

import type { RayonRessource } from "@/types/ressource";

/**
 * Le dessin du gabarit RESSOURCE, relevé dans `MigenRessource.dc.html` et
 * vérifié contre sa capture (`maquette/rendu/ressources--*.html`) par
 * `verification-ressource.tsx`, qui relit les deux à chaque exécution.
 *
 * Un seul écart de valeur, et il est neutre en thème clair : le `#fff` des
 * cartes devient `var(--card)`, qui vaut `#fff` en clair et reste lisible en
 * sombre. Les survols, l'état ouvert de la FAQ et les reprises mobiles vivent
 * dans `Ressource.module.css`, un style en ligne ne portant pas d'état.
 */

/** `FMT` et `RAY` de la maquette : la pastille et le libellé du rayon. */
export const RAYONS: Record<RayonRessource, { format: string; libelle: string }> = {
  articles: { format: "Article", libelle: "Articles" },
  "fiches-pratiques": { format: "Fiche pratique", libelle: "Fiches pratiques" },
  "fiches-techniques": { format: "Fiche technique", libelle: "Fiches techniques" },
  "livres-blancs": { format: "Livre blanc", libelle: "Livres blancs" },
  process: { format: "Process", libelle: "Process" },
};

/** Le conteneur qui reçoit les cinq sections, sous l'en-tête fixe. */
export const HAUT_DE_PAGE = 62;

export const TELEPHONE = { libelle: "04 78 33 72 05", href: "tel:+33478337205" } as const;
export const CONTACT = "/contact/";

const LARGEUR = { maxWidth: 1200, margin: "0 auto" } as const;

export const SECTION_HEROS: CSSProperties = { ...LARGEUR, padding: "40px 40px 0" };
export const SECTION_CORPS: CSSProperties = { ...LARGEUR, padding: "64px 40px 0" };
export const SECTION_SUITE: CSSProperties = { ...LARGEUR, padding: "96px 40px 0" };

/* ------------------------------------------------------------------ héros */

export const GRILLE_HEROS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
  gap: 52,
  alignItems: "center",
};

/** La colonne de texte dont un paragraphe a été retiré : voir `PageRessource`. */
export const COLONNE_ANCREE: CSSProperties = { alignSelf: "start" };

export const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 14px",
  borderRadius: 999,
  background: "var(--card)",
  border: "1px solid var(--line)",
  font: "600 12px var(--fb)",
  color: "var(--ink1)",
  marginBottom: 22,
};

export const POINT: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

export const TITRE1: CSSProperties = {
  font: "600 clamp(36px,4.4vw,60px)/1.04 var(--ft)",
  letterSpacing: "-.045em",
  margin: "0 0 20px",
  maxWidth: "18ch",
  textWrap: "balance",
};

export const CHAPO: CSSProperties = {
  font: "400 18px/1.62 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 14px",
  maxWidth: "56ch",
  textWrap: "pretty",
};

export const SIGNATURE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  marginTop: 10,
  font: "500 13.5px var(--fb)",
  color: "var(--ink3)",
};

export const MONOGRAMME: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  background: "var(--panel)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 11px var(--fb)",
};

export const PHOTO_HEROS: CSSProperties = {
  position: "relative",
  borderRadius: 32,
  overflow: "hidden",
  height: 380,
  background: "var(--ph)",
};

export const FILTRE_PHOTO = "saturate(var(--sat,.55)) contrast(1.05)";

/* La carte de téléchargement d'un livre blanc, à la place de la photo. */
export const CARTE_LIVRE: CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  padding: 28,
  boxShadow: "0 30px 70px -34px rgba(0,0,0,.35)",
};

export const SURTITRE_LIVRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
  color: "var(--acc-ink)",
  marginBottom: 10,
};

export const TITRE_LIVRE: CSSProperties = {
  font: "600 21px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 18,
};

export const CHAMP: CSSProperties = {
  padding: "13px 15px",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  font: "400 15px var(--fb)",
  // Pas d'`outline: none` en ligne comme la maquette : il battrait le
  // `:focus-visible` de globals.css et le champ perdrait son repère clavier.
};

export const BOUTON_LIVRE: CSSProperties = {
  padding: 15,
  borderRadius: 999,
  border: "none",
  background: "var(--acc)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--sur-acc)",
  font: "600 15px var(--fb)",
  cursor: "pointer",
};

/* ------------------------------------------------------------------ corps */

export const GRILLE_CORPS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "230px minmax(0,1fr)",
  gap: 56,
  alignItems: "start",
};

export const SOMMAIRE: CSSProperties = {
  position: "sticky",
  top: 110,
  borderRadius: "var(--rad-s)",
  background: "var(--card)",
  border: "1px solid var(--line)",
  padding: "18px 18px 20px",
};

export const SOMMAIRE_TITRE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  marginBottom: 10,
};

export const SOMMAIRE_ENTREE: CSSProperties = {
  display: "flex",
  gap: 10,
  padding: "8px 0",
  borderTop: "1px solid var(--line)",
  font: "500 13px/1.4 var(--fb)",
  color: "var(--ink1)",
};

export const NUMERO_MONO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  // Contraste AA : état non mesurable sans survol. L'orange de marque donne 2,29:1 sur le gris clair, --acc-ink 7,98:1.
  color: "var(--acc-ink)",
  flex: "none",
};

export const SOMMAIRE_BOUTON: CSSProperties = {
  display: "block",
  marginTop: 14,
  padding: 12,
  borderRadius: 999,
  background: "var(--acc)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--sur-acc)",
  textAlign: "center",
  font: "600 13.5px var(--fb)",
};

export const COLONNE: CSSProperties = { minWidth: 0, maxWidth: 760 };

export const TITRE2: CSSProperties = {
  font: "600 clamp(24px,2.4vw,32px)/1.15 var(--ft)",
  letterSpacing: "-.035em",
  margin: "44px 0 16px",
  scrollMarginTop: 110,
  textWrap: "balance",
};

export const TITRE2_NUMERO: CSSProperties = {
  display: "block",
  font: "600 11px ui-monospace,Menlo,monospace",
  // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
  color: "var(--acc-ink)",
  marginBottom: 10,
};

export const TITRE3: CSSProperties = {
  font: "600 19px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: "26px 0 10px",
};

export const PROSE: CSSProperties = {
  font: "400 16.5px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 16px",
  textWrap: "pretty",
};

export const PUCES: CSSProperties = {
  display: "grid",
  gap: 10,
  margin: "6px 0 22px",
  padding: "20px 22px",
  borderRadius: "var(--rad-s)",
  background: "var(--card)",
  border: "1px solid var(--line)",
  listStyle: "none",
};

export const PUCE: CSSProperties = {
  display: "flex",
  gap: 12,
  font: "400 15.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

// Contraste AA : l'orange de marque donnait 2,56:1 sur ce fond clair, --acc-ink donne 8,94:1.
export const COCHE: CSSProperties = { color: "var(--acc-ink)", flex: "none", fontWeight: 600 };

export const ETAPES: CSSProperties = {
  display: "grid",
  gap: 12,
  margin: "6px 0 24px",
  padding: 0,
  listStyle: "none",
};

export const ETAPE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "38px minmax(0,1fr)",
  gap: 14,
  alignItems: "start",
};

export const ETAPE_NUMERO: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "var(--acc)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--sur-acc)",
  font: "600 13px/38px var(--fb)",
  textAlign: "center",
};

export const ETAPE_TEXTE: CSSProperties = {
  font: "400 15.5px/1.65 var(--fb)",
  color: "var(--ink1)",
  paddingTop: 7,
};

export const TABLEAU_CADRE: CSSProperties = {
  overflowX: "auto",
  margin: "6px 0 26px",
  borderRadius: "var(--rad-s)",
  background: "var(--card)",
  border: "1px solid var(--line)",
};

export const TABLEAU: CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 520 };

export const TABLEAU_ENTETE: CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  // Contraste AA : l'orange de marque donnait 2,56:1 sur ce fond clair, --acc-ink donne 8,94:1.
  color: "var(--acc-ink)",
  borderBottom: "1px solid var(--line)",
};

export const TABLEAU_CELLULE: CSSProperties = {
  padding: "13px 18px",
  verticalAlign: "top",
  borderTop: "1px solid var(--line)",
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

export const ENCADRE: CSSProperties = {
  margin: "8px 0 24px",
  padding: "20px 24px",
  borderRadius: "var(--rad-s)",
  background: "var(--acc-w)",
  border: "1px solid rgba(255,124,60,.28)",
  font: "500 15.5px/1.65 var(--fb)",
  color: "var(--sur-acc)",
};

/* Les quatre écritures de lien de la maquette, et ses deux gras. */
const LIEN_BASE: CSSProperties = {
  fontWeight: 600,
  color: "var(--sur-acc)",
  textDecoration: "underline",
};
const SOULIGNE_ORANGE = "rgba(255,124,60,.6)";
export const LIEN_PROSE: CSSProperties = {
  ...LIEN_BASE,
  textDecorationColor: SOULIGNE_ORANGE,
  textUnderlineOffset: 3,
};
export const LIEN_PUCE: CSSProperties = { ...LIEN_BASE, textDecorationColor: SOULIGNE_ORANGE };
export const LIEN_ETAPE: CSSProperties = LIEN_BASE;
export const GRAS: CSSProperties = { fontWeight: 600, color: "var(--ink)" };
export const GRAS_ENCADRE: CSSProperties = { fontWeight: 600 };

/* La bande d'appel posée après la deuxième partie. */
export const BANDE: CSSProperties = {
  margin: "34px 0 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  padding: "24px 26px",
  borderRadius: 24,
  background: "var(--panel)",
};

export const BANDE_TEXTE: CSSProperties = {
  font: "500 16px/1.5 var(--fb)",
  color: "rgba(255,255,255,.82)",
  flex: 1,
  minWidth: 240,
};

export const BANDE_BOUTON: CSSProperties = {
  padding: "12px 20px",
  borderRadius: 999,
  background: "var(--acc)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--ink)",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

export const BANDE_TELEPHONE: CSSProperties = {
  padding: "12px 18px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------- questions et lectures */

export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  // Contraste AA : SURTITRE sert la page claire et la carte FAQ sur photo. Sur
  // le fond clair, l'orange de marque ne donnait que 2,29:1 contre 7,98:1 pour
  // --acc-ink. La carte FAQ reprend --acc a son point d'appel, ou le voile
  // sombre lui laisse 6,37:1.
  color: "var(--acc-ink)",
  marginBottom: 14,
};

export const TITRE_SECTION: CSSProperties = {
  font: "600 clamp(26px,2.8vw,38px)/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
};

/* `.mg-faqph` de la maquette : carte sombre, photo d'atelier sous un voile. */
export const FAQ_CARTE: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  padding: 44,
  background: "#1c1b19",
  color: "#fff",
};

export const FAQ_VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg,rgba(18,17,16,.92) 0%,rgba(18,17,16,.8) 50%,rgba(18,17,16,.62) 100%)",
};

export const FAQ_PHOTO = "/assets/web/sv-portrait.jpg";

export const FAQ_LISTE: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgba(255,255,255,.1)",
  backdropFilter: "blur(22px) saturate(150%)",
  WebkitBackdropFilter: "blur(22px) saturate(150%)",
  border: "1px solid rgba(255,255,255,.18)",
};

export const FAQ_QUESTION: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: "20px 24px",
  font: "600 16px/1.4 var(--ft)",
  letterSpacing: "-.015em",
  color: "#fff",
};

export const FAQ_PLUS: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "rgba(255,255,255,.14)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  font: "400 18px/1 var(--fb)",
  transition: "transform .2s,background .2s",
};

export const FAQ_REPONSE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "rgba(255,255,255,.82)",
  margin: 0,
  padding: "0 24px 20px",
  maxWidth: "72ch",
};

export const FAQ_FILET = "1px solid rgba(255,255,255,.14)";

export const LECTURES_TETE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
};

// Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
export const LECTURES_LIEN: CSSProperties = { font: "600 14.5px var(--fb)", color: "var(--acc-ink)" };

export const LECTURES_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
  gap: 14,
};

export const LECTURE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--card)",
  border: "1px solid var(--line)",
};

export const LECTURE_PHOTO: CSSProperties = {
  position: "relative",
  height: 150,
  background: "var(--ph)",
  overflow: "hidden",
};

export const LECTURE_TEXTE: CSSProperties = {
  padding: "18px 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export const LECTURE_FORMAT: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  // Contraste AA : l'orange de marque donnait 2,56:1 sur ce fond clair, --acc-ink donne 8,94:1.
  color: "var(--acc-ink)",
};

export const LECTURE_TITRE: CSSProperties = {
  font: "600 16.5px/1.3 var(--ft)",
  letterSpacing: "-.02em",
};

/* ------------------------------------------------------------ appel final */

export const SECTION_APPEL: CSSProperties = { padding: "96px 24px 120px" };

export const APPEL: CSSProperties = {
  ...LARGEUR,
  borderRadius: 40,
  background: "var(--panel)",
  padding: 56,
  position: "relative",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
  gap: 40,
  alignItems: "center",
};

export const APPEL_LUEUR: CSSProperties = {
  position: "absolute",
  width: 560,
  height: 560,
  left: -200,
  top: -280,
  background: "radial-gradient(circle,rgba(255,124,60,.28),transparent 66%)",
  pointerEvents: "none",
};

export const APPEL_SURTITRE: CSSProperties = { ...SURTITRE, marginBottom: 16 };

export const APPEL_TITRE: CSSProperties = {
  font: "600 clamp(26px,3vw,40px)/1.1 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 14px",
  maxWidth: "22ch",
};

export const APPEL_TEXTE: CSSProperties = {
  font: "400 15.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.64)",
  maxWidth: "48ch",
  margin: 0,
};

export const APPEL_BOUTONS: CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 10,
  justifyItems: "start",
};

export const APPEL_BOUTON: CSSProperties = {
  padding: "16px 30px",
  borderRadius: 999,
  background: "var(--acc)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--ink)",
  font: "600 16px var(--fb)",
};

export const APPEL_TELEPHONE: CSSProperties = {
  padding: "16px 30px",
  borderRadius: 999,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  font: "600 16px var(--fb)",
};

/**
 * La copie fixe du gabarit, littérale (apostrophes typographiques comprises,
 * insécable avant le point d'interrogation de la bande d'appel).
 */
export const COPIE = {
  signature: "Équipe technique Migen",
  sommaire: "Sommaire",
  expert: "Parler à un expert",
  bandeQuestion: "Un équipement concerné sur votre site ?",
  bandeSuite: " Un chargé d’affaires vous rappelle dans l’heure.",
  decrire: "Décrire mon besoin",
  faqSurtitre: "Questions fréquentes",
  faqTitre: "Vos questions, nos réponses",
  lecturesSurtitre: "À lire ensuite",
  lecturesTitre: "Sur le même sujet",
  appelSurtitre: "Passer de la lecture à l’action",
  appelTitre: "Un technicien qualifié sur votre site, au bon moment.",
  appelTexte:
    "Décrivez votre besoin : un chargé d’affaires vous rappelle dans l’heure, du lundi au vendredi de 8h00 à 18h30.",
  livreSurtitre: "Livre blanc gratuit",
  livreTitre: "Recevoir le PDF complet",
  livreEmail: "E-mail professionnel *",
  livreEntreprise: "Entreprise *",
  livreBouton: "Télécharger le livre blanc",
  livreMention: "Aucun démarchage. Désinscription en un clic.",
} as const;
