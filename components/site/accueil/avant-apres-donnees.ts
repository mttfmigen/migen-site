/**
 * La bascule « Avant migen© / Avec migen© », en données.
 *
 * Source : `BA` (le jeu par défaut de l'accueil) et les getters `baCanvasVals`
 * et `baTiles` de « Migen - Site final.dc.html ». La maquette porte aussi un
 * `BA_BY` par page d'offre : il ne concerne pas l'accueil et n'est pas repris.
 *
 * Les deux vues ne diffèrent pas seulement par leurs tuiles : le canevas
 * entier change de peau, anthracite et photos froides avant, lavis chaud et
 * photos naturelles avec. Les couleurs sont des littéraux dans la maquette,
 * pas des variables de thème, parce qu'un canevas impose la sienne.
 *
 * TROIS ÉCARTS ASSUMÉS PAR RAPPORT À LA MAQUETTE
 * (`docs/CONTRAT-PORTAGE-MAQUETTE.md`, « Interdits de copie ») :
 *
 * 1. La première tuile de la vue « avec » n'est PAS reprise. La maquette y
 *    affiche « 24 h / pour mobiliser un technicien depuis l'agence la plus
 *    proche de votre site / Engagement sur tous nos hubs » : un délai chiffré
 *    d'intervention donné pour un engagement, et une promesse de proximité
 *    d'agence que les quatre implantations ne portent pas. Rien ne la
 *    remplace : choisir un autre chiffre serait un arbitrage éditorial.
 * 2. « Les habilitations sont vérifiées avant chaque mise à disposition »
 *    devient « avant chaque arrivée sur site ». « Mise à disposition » est
 *    interdit.
 * 3. Les photos `x-textile-filature.jpg` et `x-logistique-cariste.jpg`
 *    n'existent pas dans `public/assets/web/`. Les deux tuiles gardent leur
 *    citation sur le gris de remplacement `--ph` : un fichier absent ne se
 *    remplace pas par une autre photo.
 */

import type { CSSProperties } from "react";

import type { TuileBascule, VueBascule } from "./AvantApresBascule";

/* ------------------------------------------------- la peau des deux canevas */

/** Les encres de `baTiles` et `baCanvasVals`, branche par branche. */
interface Peau {
  canevas: string;
  halo: string;
  fond: string;
  ink: string;
  ink2: string;
  /** La maquette emploie une encre secondaire distincte dans les tuiles. */
  ink2Tuile: string;
  ink3: string;
  photo: string;
}

const AVANT: Peau = {
  canevas: "#17161b",
  halo: "rgba(255,124,60,.22)",
  fond: "#23222a",
  ink: "#fff",
  ink2: "rgba(255,255,255,.66)",
  ink2Tuile: "rgba(255,255,255,.68)",
  ink3: "rgba(255,255,255,.46)",
  photo: "saturate(.2) brightness(.78) contrast(1.06)",
};

const AVEC: Peau = {
  canevas: "#fdf1e6",
  halo: "rgba(255,124,60,.16)",
  fond: "#ffffff",
  ink: "#1c1b19",
  ink2: "#6a6764",
  ink2Tuile: "#6a6764",
  ink3: "#a8a49d",
  photo: "saturate(1) brightness(1.02) contrast(1.06)",
};

function canevas(p: Peau): CSSProperties {
  return {
    borderRadius: 40,
    padding: "48px 44px 46px",
    backgroundColor: p.canevas,
    transition: "background-color 420ms ease",
  };
}

function halo(p: Peau): CSSProperties {
  return {
    position: "absolute",
    width: 620,
    height: 620,
    right: -220,
    top: -300,
    pointerEvents: "none",
    background: `radial-gradient(circle,${p.halo},transparent 68%)`,
  };
}

/* ----------------------------------------------- les trois formes de tuiles */

function chiffre(
  p: Peau,
  avec: boolean,
  cle: string,
  valeur: string,
  corps: string,
  source: string,
): TuileBascule {
  return {
    forme: "chiffre",
    cle,
    chiffre: valeur,
    corps,
    source,
    styleCadre: { backgroundColor: p.fond },
    styleChiffre: {
      font: "600 calc(clamp(36px,4.4vw,54px) * var(--ts))/1 var(--ft)",
      letterSpacing: "-.05em",
      color: avec ? "var(--acc)" : p.ink,
      marginBottom: 16,
    },
    styleCorps: {
      font: "400 15.5px/1.6 var(--fb)",
      color: p.ink2Tuile,
      margin: "0 0 12px",
      maxWidth: "26ch",
    },
    styleSource: { font: "400 12px var(--fb)", color: p.ink3 },
  };
}

/** `chemin` absent : la tuile garde sa citation sur le gris `--ph`. */
function photo(
  p: Peau,
  cle: string,
  citation: string,
  qui: string,
  chemin?: string,
): TuileBascule {
  return {
    forme: "photo",
    cle,
    citation,
    qui,
    styleCadre: { backgroundColor: "var(--ph)" },
    styleImage: chemin
      ? {
          background: `url('${chemin}') center/cover no-repeat`,
          filter: p.photo,
        }
      : undefined,
  };
}

function citation(
  p: Peau,
  avec: boolean,
  cle: string,
  texte: string,
  qui: string,
  role: string,
  initiales: string,
): TuileBascule {
  return {
    forme: "citation",
    cle,
    citation: texte,
    qui,
    role,
    initiales,
    styleCadre: { backgroundColor: p.fond },
    styleCitation: {
      font: "400 calc(16.5px * var(--ts))/1.65 var(--fb)",
      color: p.ink,
      margin: "0 0 24px",
      maxWidth: "34ch",
    },
    styleAvatar: {
      width: 40,
      height: 40,
      borderRadius: 999,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "600 13px var(--fb)",
      color: avec ? "#fff" : "#1c1b19",
      backgroundColor: avec ? "#ff7c3c" : "rgba(255,255,255,.82)",
    },
    styleNom: {
      font: "600 14px var(--ft)",
      letterSpacing: "-.02em",
      color: p.ink,
    },
    styleRole: {
      font: "400 12.5px var(--fb)",
      color: p.ink3,
      marginTop: 2,
    },
  };
}

function titre(p: Peau): CSSProperties {
  return {
    font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
    letterSpacing: "-.04em",
    maxWidth: "20ch",
    textWrap: "balance",
    color: p.ink,
  };
}

function chapo(p: Peau): CSSProperties {
  return { font: "400 16px/1.7 var(--fb)", maxWidth: "44ch", color: p.ink2 };
}

/* ------------------------------------------------------------- les deux vues */

export const VUE_AVANT: VueBascule = {
  titre: "Ce que nos clients vivaient avant de nous appeler.",
  chapo:
    "Pénurie de profils, curatif permanent, habilitations à courir. Le point de départ de presque tous nos contrats.",
  styleCadre: canevas(AVANT),
  styleHalo: halo(AVANT),
  styleTitre: titre(AVANT),
  styleChapo: chapo(AVANT),
  tuiles: [
    chiffre(
      AVANT,
      false,
      "avant-recrutement",
      "6 mois",
      "de délai moyen pour recruter un technicien de maintenance qualifié.",
      "Constat sur nos reprises de site",
    ),
    photo(
      AVANT,
      "avant-prestataire",
      "On rappelait le même prestataire, et il redécouvrait l’installation à chaque passage.",
      "Responsable maintenance · Agroalimentaire, Rhône",
    ),
    citation(
      AVANT,
      false,
      "avant-sous-effectif",
      "Trois techniciens pour douze lignes, un poste vacant depuis huit mois. On ne faisait plus que du curatif, et on le subissait.",
      "Directeur technique",
      "Automobile · Haute-Garonne",
      "DT",
    ),
    photo(
      AVANT,
      "avant-habilitations",
      "Les habilitations, c’était un fichier que personne ne tenait à jour. On le découvrait le jour du contrôle.",
      "Responsable HSE · Chimie, Bas-Rhin",
      "/assets/web/ph-hero-raffinerie.jpg",
    ),
    chiffre(
      AVANT,
      false,
      "avant-curatif",
      "72 %",
      "des heures passées en curatif à la reprise d’un site. Le régime le plus coûteux.",
      "Moyenne observée, mois 1",
    ),
    photo(
      AVANT,
      "avant-weekend",
      "Un arrêt le vendredi soir, et personne à appeler avant le lundi matin.",
      "Responsable de production · Logistique",
    ),
  ],
};

export const VUE_AVEC: VueBascule = {
  titre: "Ce que les mêmes équipes en disent aujourd’hui.",
  chapo:
    "Mêmes sites, mêmes interlocuteurs, six à dix-huit mois plus tard.",
  styleCadre: canevas(AVEC),
  styleHalo: halo(AVEC),
  styleTitre: titre(AVEC),
  styleChapo: chapo(AVEC),
  tuiles: [
    photo(
      AVEC,
      "avec-automates",
      "Le technicien connaissait nos automates au bout de deux semaines. On l’a gardé deux ans.",
      "Responsable maintenance · Agroalimentaire, Rhône",
      "/assets/web/team-electric.jpg",
    ),
    citation(
      AVEC,
      true,
      "avec-choix",
      "On a pu écarter un profil après l’entretien, sans avoir à se justifier. C’est précisément ce qui fait qu’on leur fait confiance.",
      "Directeur technique",
      "Automobile · Haute-Garonne",
      "DT",
    ),
    photo(
      AVEC,
      "avec-habilitations",
      "Les habilitations sont vérifiées avant chaque arrivée sur site. Je ne m’en occupe plus.",
      "Responsable HSE · Chimie, Bas-Rhin",
      "/assets/web/team-grind-impact.jpg",
    ),
    chiffre(
      AVEC,
      true,
      "avec-curatif",
      "28 %",
      "de curatif après douze mois. Le reste est passé en préventif et en conditionnel.",
      "Même site, mois 12",
    ),
    photo(
      AVEC,
      "avec-reactivite",
      "Appel un jeudi soir, équipe sur site le vendredi matin. C’est le jour et la nuit.",
      "Responsable de production · Logistique",
      "/assets/web/team-grind-front.jpg",
    ),
  ],
};
