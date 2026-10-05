import type { CSSProperties } from "react";

/**
 * Valeurs d'habillage des gabarits 09 Domaine et 05 Spécialité.
 *
 * SOURCE : `maquette/gabarit-09-domaine.html`, versionné à côté. Chaque valeur
 * ci-dessous est recopiée depuis ce fichier, et
 * `components/site/domaine/verification-domaine.tsx` le RELIT à chaque exécution
 * pour refuser toute valeur qui n'y figure plus. Les valeurs calculées (les
 * largeurs de colonne en pixels, le rendu des `clamp()`) ont été mesurées au
 * `getComputedStyle` sur l'aperçu du fichier, pas devinées.
 *
 * POURQUOI un fichier de constantes : la maquette pilote tout par styles en
 * ligne, et les mêmes déclarations y reviennent des dizaines de fois (le verre,
 * le panneau sombre, le surtitre orange). Les recopier dans chaque section
 * produirait dix dérives au premier ajustement de charte.
 *
 * `components/site/blocs/habillage.ts` n'est pas réutilisé tel quel : il a été
 * relevé sur « Site final », et plusieurs valeurs diffèrent ici (le surtitre a
 * 18px de marge basse et non 16, le H2 monte à 48px et non 44, l'ombre du verre
 * n'a pas de première passe). Partager des constantes qui ne disent pas la même
 * chose aurait fait entrer les valeurs du mauvais fichier par la porte de
 * derrière, exactement ce que ce chantier répare.
 *
 * Les survols ne sont pas ici : un style en ligne ne peut pas porter d'état. Ils
 * vivent dans `PageDomaine.module.css`.
 */

/* ------------------------------------------------------------------ rythme */

/** `style="padding:var(--sec) 0 0"`, le rythme de toutes les sections. */
export const SECTION: CSSProperties = { padding: "var(--sec) 0 0" };

/** `style="padding:var(--sec) 24px 0"`, pour les deux panneaux sombres. */
export const SECTION_PANNEAU: CSSProperties = { padding: "var(--sec) 24px 0" };

/** La dernière section ferme la page : `padding:var(--sec) 24px var(--sec)`. */
export const SECTION_FIN: CSSProperties = {
  padding: "var(--sec) 24px var(--sec)",
};

/** `max-width:1200px;margin:0 auto;padding:0 40px`. */
export const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

/** Le héros et la bande photo ouvrent avec `padding:44px 40px 0`. */
export const LARGEUR_HAUT: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

/* ------------------------------------------------------------------ matière */

/** La carte de verre, motif dominant. Ombre `0 22px 50px -32px rgba(0,0,0,.3)`. */
export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

/** Même verre, ombre plus creusée : la carte « En bref » du héros. */
export const VERRE_HERO: CSSProperties = {
  ...VERRE,
  boxShadow: "0 30px 70px -34px rgba(0,0,0,.42)",
  overflow: "hidden",
};

/** Même verre, ombre du tableau de l'offre. */
export const VERRE_TABLEAU: CSSProperties = {
  ...VERRE,
  boxShadow: "0 26px 60px -36px rgba(0,0,0,.34)",
  overflow: "hidden",
};

/** Le panneau anthracite des garanties et de l'appel final. */
export const PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  position: "relative",
  overflow: "hidden",
};

/* ------------------------------------------------------------- typographie */

/** Surtitre orange en capitales. 18px de marge basse, pas 16. */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

/** Le même, gris : « Ils nous font confiance ». */
export const SURTITRE_GRIS: CSSProperties = {
  ...SURTITRE,
  color: "var(--ink4)",
  marginBottom: 0,
  flex: "none",
};

/** H1 du héros : `clamp(40px,4.8vw,70px)`, 54,72px mesurés à 1200px. */
export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(40px,4.8vw,70px) * var(--ts))/1.02 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "15ch",
  textWrap: "balance",
};

/** H2 principal : `clamp(30px,3.3vw,48px)`, 37,62px mesurés. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
};

/** H2 secondaire : `clamp(28px,3vw,42px)`, 34,2px mesurés. */
export const TITRE2_PETIT: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
};

/** H2 de l'appel final : `clamp(28px,3.2vw,44px)` sur fond sombre. */
export const TITRE2_FINAL: CSSProperties = {
  font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  color: "#fff",
  margin: "0 0 20px",
  textWrap: "balance",
};

/* ------------------------------------------------------------------ grilles */

/** Héros : `1.1fr .9fr`, 52px de gouttière. */
export const GRILLE_HERO: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 52,
  alignItems: "start",
};

/** Problème : deux colonnes égales, 70px. */
export const GRILLE_PROBLEME: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 70,
  alignItems: "start",
};

/** Déroulé : `.8fr 1.2fr`, 56px. */
export const GRILLE_DEROULE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".8fr 1.2fr",
  gap: 56,
  alignItems: "start",
};

/** Questions : `.75fr 1.25fr`, 56px. */
export const GRILLE_QUESTIONS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".75fr 1.25fr",
  gap: 56,
  alignItems: "start",
};

/** Réassurance : `.85fr 1.15fr`, 20px, colonnes de même hauteur. */
export const GRILLE_REASSURANCE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".85fr 1.15fr",
  gap: 20,
  alignItems: "stretch",
};

/** Appel final : `.9fr 1.1fr`, 44px, centré. */
export const GRILLE_FINALE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".9fr 1.1fr",
  gap: 44,
  alignItems: "center",
  textAlign: "left",
  position: "relative",
};

/** Une ligne du tableau de l'offre : numéro, prestation, bénéfice. */
export const LIGNE_OFFRE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "52px minmax(0,1.05fr) minmax(0,.95fr)",
  gap: 28,
};

/** Les cartes de maillage : `repeat(auto-fit,minmax(250px,1fr))`, 12px. */
export const GRILLE_MAILLAGE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 12,
};

/** Les références : trois colonnes, 16px. */
export const GRILLE_REFERENCES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 16,
};

/** Les garanties : deux colonnes, `30px 40px`. */
export const GRILLE_GARANTIES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "30px 40px",
};

/* ------------------------------------------------------------------ boutons */

/** Bouton orange. Survol : `.boutonPrincipal`. */
export const BOUTON_ACTION: CSSProperties = {
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

/** Bouton clair bordé, à côté du précédent. Survol : `.boutonSecondaire`. */
export const BOUTON_SECONDAIRE: CSSProperties = {
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

/** Le même sur fond blanc plein : appel de milieu de page et questions. */
export const BOUTON_BLANC: CSSProperties = {
  ...BOUTON_SECONDAIRE,
  background: "#fff",
};

/** Bouton translucide sur le panneau sombre de l'appel final. */
export const BOUTON_SOMBRE: CSSProperties = {
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

/* ------------------------------------------------------------------- divers */

/** La lueur orange du panneau des garanties, posée en absolu. */
export const LUEUR_GARANTIES: CSSProperties = {
  position: "absolute",
  width: 480,
  height: 480,
  right: -180,
  top: -220,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

/** Celle de l'appel final, centrée et plus large. */
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

/** Le filtre photo de la maquette : `saturate(var(--sat)) contrast(1.05)`. */
export const PHOTO: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
};

/** La colonne de gauche qui suit le défilement, sur les sections à deux volets. */
export const COLLANT: CSSProperties = { position: "sticky", top: 110 };

/**
 * Les dix hubs de techniciens, et les quatre agences.
 *
 * Ce sont des CONSTANTES DE LA MAQUETTE, pas du corpus : le gabarit les écrit en
 * toutes lettres dans sa section « Réassurance ». Elles sont ici pour que le
 * contrôle les relise dans le fichier au lieu de les croire. Le contrat du
 * projet dit quatre agences et dix hubs : la maquette et le contrat concordent,
 * il n'y a rien à arbitrer.
 */
export const HUBS = [
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
] as const;

/** La rotation de visuels du parseur de la maquette, dans son ordre. */
export const PHOTOS = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
] as const;

/** `assets/web/<nom>.jpg` de la maquette devient un chemin servi par `public/`. */
export function visuel(index: number): string {
  return `/assets/web/${PHOTOS[index % PHOTOS.length]}.jpg`;
}
