import type { CSSProperties } from "react";

import {
  SURTITRE,
  TITRE2,
  VERRE,
} from "@/components/site/blocs/habillage";

/**
 * Valeurs d'habillage du gabarit VILLE, relevées dans `maquette/accueil-rendu.html`,
 * bloc `sc-if value="{{ isVille }}"`, lignes 3962 à 4076.
 *
 * POURQUOI un fichier à part, et pourquoi si peu de déclarations : la maquette
 * pilote tout par styles en ligne, et le gabarit ville partage son hero avec le
 * gabarit secteur au pixel. Ce qui est commun est donc IMPORTÉ de
 * `secteur/habillage-secteur.ts` et de `blocs/habillage.ts`, jamais recopié.
 * Seuls les ÉCARTS de `isVille` sont ici, chacun avec la valeur exacte de la
 * maquette et la ligne où elle se lit.
 *
 * Les survols ne sont pas ici : ils vivent dans `PageVille.module.css`, un
 * style en ligne ne pouvant pas porter d'état.
 */

/* --------------------------------------------------------- le panneau du hero */

/**
 * Ligne 3977. Le panneau respire 30/32/32, là où celui du gabarit secteur
 * respire 32/34/34 : il porte une adresse et des chiffres plus petits.
 */
export const PANNEAU_VILLE: CSSProperties = {
  ...VERRE,
  padding: "30px 32px 32px",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
};

/** Ligne 3978. Le surtitre du panneau respire 18, celui du hero 20. */
export const SURTITRE_PANNEAU: CSSProperties = { ...SURTITRE, marginBottom: 18 };

/** Ligne 3979. La rue, en titre de la carte. */
export const ADRESSE_RUE: CSSProperties = {
  font: "600 16px var(--ft)",
  letterSpacing: "-.02em",
};

/** Ligne 3980. Le code postal et la commune, sous la rue. */
export const ADRESSE_SUITE: CSSProperties = {
  font: "400 14.5px/1.55 var(--fb)",
  color: "var(--ink3)",
  marginTop: 3,
};

/** Ligne 3981. Le filet qui sépare l'adresse des chiffres. */
export const FILET: CSSProperties = {
  height: 1,
  background: "var(--line)",
  margin: "20px 0",
};

/**
 * Ligne 3982. Deux colonnes, gouttière 18 : les chiffres du panneau ville sont
 * plus serrés que les repères du panneau secteur, qui tiennent sur 22.
 */
export const GRILLE_REPERES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 18,
};

/** Ligne 3983. 22px, contre 26px dans le gabarit secteur. */
export const REPERE_VALEUR: CSSProperties = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
};

/** Ligne 3983. Sans interligne, contre 1.45 dans le gabarit secteur. */
export const REPERE_LIBELLE: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
  marginTop: 2,
};

/**
 * La précision d'un repère, troisième ligne du bloc.
 *
 * La maquette n'en pose pas : son panneau s'arrête au libellé. Elle reprend
 * donc le petit texte de ce panneau (ligne 3983), en `ink4` comme le libellé
 * qu'elle précise, un cran plus bas.
 */
export const REPERE_DETAIL: CSSProperties = {
  ...REPERE_LIBELLE,
  marginTop: 4,
};

/**
 * La phrase de contact du corpus, posée sous un second filet.
 *
 * La maquette ne la prévoit pas : elle n'a que l'adresse. Le corpus, lui, écrit
 * sur les quarante-deux pages comment joindre et sous quel délai on rappelle,
 * et ce texte ne se jette pas. Il reprend donc le motif de petit texte de ce
 * panneau, celui de la ligne 3980, sans sa marge haute puisqu'un filet le
 * précède déjà.
 */
export const CONTACT: CSSProperties = { ...ADRESSE_SUITE, marginTop: 0 };

/* ------------------------------------------------------- le constat et la réponse */

/** Ligne 4011. Deux colonnes égales, gouttière 70 : la plus large du site. */
export const VIS_A_VIS: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 70,
  alignItems: "start",
};

/** Lignes 4013 et 4020. Comme le panneau, ces surtitres respirent 18. */
export const SURTITRE_COLONNE: CSSProperties = { ...SURTITRE, marginBottom: 18 };

/**
 * Lignes 4014 et 4021. Une échelle à elle : clamp(28,3vw,42) sur 1.08, là où le
 * H2 courant du site monte à clamp(30,3.3vw,48) sur 1.06. Deux titres côte à
 * côte doivent tenir sur une demi-largeur.
 */
export const TITRE_COLONNE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 20px",
  maxWidth: "22ch",
  textWrap: "balance",
};

/** Lignes 4015 et 4022. */
export const TEXTE_COLONNE: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

/** Ligne 4023. Le paragraphe de droite laisse 20 avant la liste à coches. */
export const TEXTE_COLONNE_AVANT_LISTE: CSSProperties = {
  ...TEXTE_COLONNE,
  margin: "0 0 20px",
};

/** Ligne 4023. */
export const LISTE_COCHES: CSSProperties = { display: "grid", gap: 9 };

/** Ligne 4024. */
export const COCHE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.5 var(--fb)",
  color: "var(--ink1)",
};

/** Ligne 4024. La coche orange ne se comprime pas. */
export const COCHE_MARQUE: CSSProperties = {
  color: "var(--acc)",
  flex: "none",
};

/* ------------------------------------------------------- les questions fréquentes */

/** Ligne 4037. Même échelle que le H2 courant, 34 de respiration sous lui. */
export const TITRE_FAQ: CSSProperties = {
  ...TITRE2,
  margin: "0 0 34px",
  maxWidth: "24ch",
};

/** Ligne 4038. */
export const PILE_FAQ: CSSProperties = { display: "grid", gap: 12 };

/**
 * Ligne 4039. Petit rayon, et AUCUNE ombre : la maquette n'en déclare pas sur
 * ces cartes, contrairement au panneau du hero.
 *
 * Ce n'est PAS le motif de `blocs/Objections.tsx`, qui porte la FAQ de la page
 * d'offre : celle-là est en dépliants `<details>` sur deux colonnes avec une
 * colonne collante. Ici la maquette empile des cartes ouvertes sur une colonne.
 * Le dessin vient de la maquette, donc on porte celui-ci.
 */
export const CARTE_FAQ: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad-s)",
  padding: "24px 28px",
  boxShadow: "none",
};

/** Ligne 4040. */
export const QUESTION_FAQ: CSSProperties = {
  font: "600 16.5px var(--ft)",
  letterSpacing: "-.025em",
  marginBottom: 8,
};

/** Ligne 4041. */
export const REPONSE_FAQ: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "80ch",
};

/* ------------------------------------------------------------- les autres villes */

/**
 * Ligne 4062. Le surtitre et le lien de droite sur la même ligne de base.
 *
 * Le lien de droite de la maquette, « Voir la version LP non référencée », n'est
 * pas porté : sa cible est un `href="#"` que la maquette anime par sa propre
 * logique de navigation, et aucune page du corpus ne fournit d'adresse de
 * remplacement. Un lien vers nulle part vaut moins que pas de lien. L'en-tête
 * reste donc en flex, prêt à le recevoir le jour où une source le donne.
 */
export const ENTETE_AUTRES: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 16,
  flexWrap: "wrap",
};

/** Ligne 4063. Dans la ligne en flex, le surtitre ne porte pas de marge basse. */
export const SURTITRE_AUTRES: CSSProperties = { ...SURTITRE, marginBottom: 0 };
