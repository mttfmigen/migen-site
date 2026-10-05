import type { CSSProperties } from "react";

/**
 * Valeurs relevées dans LES DEUX fichiers de gabarit du client, versionnés en
 * local : `maquette/gabarit-01-article.html` (écran « Gabarit 01 Article et
 * fiche ») et `maquette/gabarit-02-etude-de-cas.html` (écran « Gabarit 02 Étude
 * de cas »).
 *
 * CE QUI A CHANGÉ DE SOURCE, ET POURQUOI. Le portage précédent lisait
 * « Migen - Site final.dc.html », le seul fichier que le client avait envoyé en
 * message. Le projet contient en réalité ONZE fichiers de gabarits dédiés, plus
 * riches, et ce sont eux qui font foi. Les deux de cette famille dessinent un
 * article et une étude de cas qui n'ont presque rien de commun avec ce que
 * « Site final » en montrait : voir le tableau d'écart dans l'en-tête de
 * `scripts/verifie-article-etude.tsx`.
 *
 * UN SEUL JEU DE MOTIFS POUR DEUX GABARITS. Les deux fichiers portent le MÊME
 * bloc de huit motifs de corps, déclaration par déclaration : paragraphe, titre
 * de niveau 3, liste à coches, cartes, étapes numérotées, tableau, encadré
 * orange, appel sombre. Ils ne diffèrent que par la coque : l'article a un
 * sommaire collant et une foire aux questions, l'étude de cas a une colonne de
 * titre collante par section. Les motifs vivent donc dans `Motifs.tsx`, une
 * seule fois, et les deux coques les appellent.
 *
 * LES VALEURS NE SONT PAS DES NOTES DE LECTURE. `scripts/verifie-article-etude.tsx`
 * relit les deux fichiers de maquette à chaque exécution et exige chaque
 * déclaration des DEUX côtés : dans le fichier du client ET dans le HTML rendu
 * par le composant. Une note peut se tromper et personne ne peut la rejouer ;
 * une comparaison, si.
 *
 * Les survols ne sont pas ici : un style en ligne l'emporte sur toute règle de
 * feuille en React, le `:hover` ne prendrait jamais. Ils vivent dans
 * `Article.module.css`.
 */

/* ------------------------------------------------------------------- le héros */

/** Les deux héros : `max-width:1200px;margin:0 auto;padding:44px 40px 0`. */
export const SECTION_HEROS: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "44px 40px 0",
};

/** Le fil d'Ariane du héros, identique dans les deux fichiers. */
export const FIL_ARIANE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  font: "400 13px var(--fb)",
  color: "var(--ink4)",
  flexWrap: "wrap",
  marginBottom: 30,
};

/**
 * La grille du héros. L'article donne `1.2fr .8fr`, l'étude de cas `1.1fr .9fr` :
 * son H1 porte un nom de client et respire moins.
 */
export function grilleHeros(colonnes: string): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: colonnes,
    gap: 48,
    alignItems: "end",
  };
}

export const HEROS_ARTICLE = "1.2fr .8fr";
export const HEROS_ETUDE = "1.1fr .9fr";

/** La pastille de nature, avec son point orange. */
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
  marginBottom: 22,
};

/** Le point de la pastille. Décoratif : `aria-hidden` à la pose. */
export const POINT_PASTILLE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};

export const TITRE1: CSSProperties = {
  font: "600 calc(clamp(36px,4.4vw,62px) * var(--ts))/1.04 var(--ft)",
  letterSpacing: "-.045em",
  margin: "0 0 22px",
  maxWidth: "18ch",
  textWrap: "balance",
};

/** Le chapô du héros. Plusieurs paragraphes dans la maquette, d'où la marge. */
export const CHAPEAU: CSSProperties = {
  font: "400 18.5px/1.6 var(--fb)",
  color: "var(--ink)",
  margin: "0 0 14px",
  maxWidth: "56ch",
  textWrap: "pretty",
};

/**
 * Le visuel du héros. Hauteur 340px dans l'article, 400px dans l'étude de cas.
 * Le fond de remplacement de la maquette, `#dedfe1`, est exactement `--ph`.
 */
export function caseVisuel(hauteur: number): CSSProperties {
  return {
    borderRadius: "var(--rad)",
    overflow: "hidden",
    height: hauteur,
    background: "var(--ph)",
    position: "relative",
  };
}

export const VISUEL_ARTICLE = 340;
export const VISUEL_ETUDE = 400;

/** L'image dans sa case. La maquette la désature par `--sat`. */
export const VISUEL: CSSProperties = {
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
};

/* ------------------------------------------- le corps de l'article, gabarit 01 */

/** Les sections de corps des deux fichiers : `padding:var(--sec) 0 0`. */
export const SECTION_CORPS: CSSProperties = { padding: "var(--sec) 0 0" };

/** La largeur intérieure, commune à toutes les sections hors héros. */
export const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

/** Gabarit 01, corps : sommaire à largeur fixe, lecture à ce qui reste. */
export const GRILLE_SOMMAIRE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px minmax(0,1fr)",
  gap: 56,
  alignItems: "start",
};

/** La carte du sommaire, collante sous la barre de navigation. */
export const SOMMAIRE: CSSProperties = {
  position: "sticky",
  top: 110,
  borderRadius: "var(--rad)",
  padding: "22px 22px 24px",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

/** Le libellé « Sommaire », en gris et non en orange. */
export const SOMMAIRE_TITRE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  marginBottom: 12,
};

/** Une entrée du sommaire. Le filet est en HAUT, y compris sur la première. */
export const SOMMAIRE_LIEN: CSSProperties = {
  display: "flex",
  gap: 10,
  padding: "8px 0",
  font: "500 13.5px/1.4 var(--fb)",
  borderTop: "1px solid var(--line)",
};

/**
 * Le numéro de section, en chasse fixe.
 *
 * C'est la signature du gabarit : « 02 », pas « 2. ». Le même motif sert dans
 * le sommaire et devant le H2, et c'est ce qui fait tenir les deux ensemble.
 */
export const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  flex: "none",
};

/** Le même, au-dessus du H2 du corps. */
export const NUMERO_SECTION: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  marginBottom: 12,
};

/** Une section du corps : filet de séparation en bas, sauf la dernière. */
export const BLOC_SECTION: CSSProperties = {
  scrollMarginTop: 110,
  paddingBottom: 40,
  marginBottom: 40,
  borderBottom: "1px solid var(--line)",
};

/** Le H2 du corps d'article. */
export const TITRE2: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 22px",
  maxWidth: "26ch",
  textWrap: "balance",
};

/* --------------------------------------- les sections de l'étude, gabarit 02 */

/** Gabarit 02 : chaque section est une `section` ancrable à part entière. */
export const SECTION_ETUDE: CSSProperties = {
  padding: "var(--sec) 0 0",
  scrollMarginTop: 110,
};

/** Sa grille, et celle de la foire aux questions du gabarit 01. */
export const GRILLE_TITRE_CORPS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".75fr 1.25fr",
  gap: 56,
  alignItems: "start",
};

/** La colonne de titre, qui suit le défilement de sa section. */
export const COLONNE_COLLANTE: CSSProperties = { position: "sticky", top: 110 };

/**
 * Le surtitre orange des coques : numéro de section du gabarit 02, « Questions
 * fréquentes », « À lire aussi », « Les autres cas », « Votre besoin ».
 */
export const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 14,
};

/** Le H2 de section du gabarit 02 : pas de marge basse, il est seul en colonne. */
export const TITRE2_ETUDE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "16ch",
  textWrap: "balance",
};

/* ------------------------------------------- la foire aux questions, gabarit 01 */

/** Le H2 de la colonne de gauche. 14ch : il tient sur deux ou trois lignes. */
export const TITRE2_QUESTIONS: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 18px",
  maxWidth: "14ch",
};

export const COLONNE_QUESTIONS: CSSProperties = { display: "grid", gap: 12 };

/** Une question-réponse. Arrondi 22px, plus serré que les cartes de 24px. */
export const CARTE_QUESTION: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: 22,
  padding: "22px 26px",
};

/** L'intitulé de la question. Ce n'est pas un titre de rang : voir Article.tsx. */
export const QUESTION: CSSProperties = {
  font: "600 17px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
};

/* ------------------------------------------------------------- l'appel de fin */

/** Gabarit 01, la bande d'appel : du chrome, sans donnée. */
export const SECTION_APPEL: CSSProperties = { padding: "var(--sec) 0 var(--sec)" };

export const BANDE_APPEL: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 22,
  flexWrap: "wrap",
  padding: "26px 28px 26px 34px",
  borderRadius: 32,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

/** Le point orange de la bande, avec son halo. Décoratif. */
export const POINT_APPEL: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 6px var(--acc-w)",
};

export const TEXTE_APPEL: CSSProperties = {
  font: "600 17px var(--ft)",
  letterSpacing: "-.02em",
};

export const BOUTON_APPEL: CSSProperties = {
  padding: "13px 22px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14.5px var(--fb)",
  whiteSpace: "nowrap",
};

/**
 * La seule phrase de délai que le contrat autorise, relevée telle quelle dans
 * la bande d'appel du gabarit 01. AUCUN AUTRE DÉLAI CHIFFRÉ n'est permis dans
 * la copie du site : voir `scripts/verifie-interdits.mjs`.
 */
export const RAPPEL =
  "04 78 33 72 05 · rappel dans l’heure, du lundi au vendredi de 8h00 à 18h30";

export const TELEPHONE = "04 78 33 72 05";

/* ----------------------------------------------------------------- le maillage */

/** Le H2 du maillage : marge basse de 26px, pas de plafond de largeur. */
export const TITRE2_MAILLAGE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 26px",
};

/** La grille de cartes du maillage : elle se remplit, elle ne compte pas. */
export const GRILLE_MAILLAGE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
  gap: 12,
};

export const CARTE_MAILLAGE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: 24,
  overflow: "hidden",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
};

/* ------------------------------------------------------- l'appel final, gab. 02 */

export const SECTION_APPEL_FINAL: CSSProperties = {
  padding: "var(--sec) 24px var(--sec)",
};

export const CARTE_APPEL_FINAL: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  borderRadius: 40,
  background: "var(--card)",
  border: "1.5px solid rgba(255,124,60,.3)",
  padding: "52px 56px",
  position: "relative",
  overflow: "hidden",
};

/** La lueur orange en coin. Décorative, posée en absolu. */
export const LUEUR_APPEL_FINAL: CSSProperties = {
  position: "absolute",
  width: 520,
  height: 520,
  right: -200,
  top: -240,
  background: "radial-gradient(circle,rgba(255,124,60,.18),transparent 66%)",
  pointerEvents: "none",
};

export const GRILLE_APPEL_FINAL: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1.2fr .8fr",
  gap: 44,
  alignItems: "center",
};

export const BOUTONS_APPEL_FINAL: CSSProperties = {
  display: "grid",
  gap: 10,
  justifyItems: "start",
};

export const BOUTON_FINAL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "16px 28px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15.5px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export const BOUTON_FINAL_SECOND: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "16px 28px",
  borderRadius: 999,
  background: "var(--bg)",
  border: "1px solid var(--line)",
  font: "600 15.5px var(--fb)",
  whiteSpace: "nowrap",
};

/** Un numéro de téléphone français devient un `tel:` sans espaces. */
export function lienTelephone(telephone: string): string {
  return `tel:${telephone.replace(/[^+\d]/g, "")}`;
}

/** « 1 » devient « 01 ». La maquette numérote sur deux chiffres, toujours. */
export function numerote(rang: number): string {
  return String(rang).padStart(2, "0");
}
