import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import { cibleSure } from "@/components/site/offre/LiensOffre";
import type {
  BlocComplementPreuve,
  CartePreuve,
  ContenuPreuve,
  LignePreuve,
  ObjectifPreuve,
} from "@/types/preuve";

import styles from "./PagePreuve.module.css";
import TitreEtSuite from "../blocs/TitreEtSuite";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { accrocheDe, ligneDuCorpus } from "@/components/site/blocs/resume-de-section";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import BandeauRappelMobile from "@/components/site/mobile/BandeauRappelMobile";
import { varianteDe } from "@/components/site/mobile/conversion-donnees";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";

import CarrouselRealisations from "./CarrouselRealisations";
import FilArianeMobile from "./FilArianeMobile";
import {
  minutesDeLecture,
  realisationsLiees,
  texteResultatApres,
  titreMobile,
} from "./donnees-mobiles";
import { CORPUS_MOBILE, type SegmentCorpus } from "./corpus-mobile";
import { casseNormale, libelleCas } from "./noms-clients";
import PhotoMobile from "./PhotoMobile";
import { appliqueDecisions, copieConforme } from "@/lib/decisions-copie";
import { photoHerosMobile } from "../casclients/vues-preuves";

/**
 * Gabarit « 02 Étude de cas », porté de la RÉFÉRENCE : le rendu de la maquette
 * autonome, figé dans `maquette/rendu/preuves--suez-remise-en-etat.html` et
 * `maquette/rendu/preuves--danone-lignes-de-production.html` (10 sections
 * chacun, relevés le 07/10). L'ordre des sections et chaque valeur de dessin
 * viennent de ces deux captures ; le texte vient du relais JSON, mot pour mot.
 *
 * TROIS ÉCARTS À LA CAPTURE, déclarés :
 *
 *   1. LES IMAGES (logo client, photo du héros, photo du dispositif, vignettes
 *      « Pour aller plus loin ») sont rendues QUAND LA DONNÉE LES PORTE. La
 *      capture les sert en `blob:` sans nommer de fichier : leurs octets sont
 *      mesurés dans la maquette par `mesure-photos.mjs`, jamais choisis. Sans
 *      champ, le cadre reste nu et la pastille du logo n'est pas rendue. Les
 *      cadres du héros et des vignettes portent `position: relative` en plus
 *      de la capture, exigé par `next/image` en mode `fill` (CLAUDE.md §6) ;
 *      la photo du dispositif est un `<img>` dans le flux, comme la capture,
 *      parce que sa proportion naturelle fait la hauteur du cadre.
 *   2. LE FORMULAIRE est `FormulaireContact`, partagé, hors de ce périmètre.
 *      Le libellé du bouton d'envoi (`libelleEnvoi`) et sa géométrie (module
 *      CSS, `.carteFormulaire`) sont ceux de la capture. Restent deux ajouts
 *      du composant, absents de la capture : la mention RGPD (33 px, exigée au
 *      point de collecte, articles 13 et 14, même écart que `PanneauFormulaire`
 *      du gabarit 03) et le choix de l'indicatif devant le téléphone (que la
 *      capture du gabarit 03 porte, celle-ci non).
 *   3. LES SURVOLS sont ceux de la source du gabarit, `MigenCas`, embarquée
 *      dans `maquette/site-final-autonome.html` : attributs `style-hover`
 *      relevés élément par élément (bouton orange, bouton téléphone, carte
 *      qui se soulève), relus par `verification-preuve.tsx`.
 *
 * Composant SERVEUR. Le fil d'Ariane et le maillage du cocon restent en props,
 * exigés par CLAUDE.md §4 bien qu'absents de la capture : mêmes raisons que
 * `PageOffre`.
 */

export interface ProprietesPagePreuve {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuPreuve;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
  /**
   * Le chemin de la page (`pages.path`, slash final), pour la couche MOBILE de
   * la maquette v2 : fil d'Ariane, badge de lecture, cadence de conversion,
   * « D’autres réalisations », pastilles du cocon et rappel final, dérivés de
   * l'index du corpus. OPTIONNEL : sans lui, aucun de ces blocs ne s'ajoute,
   * ce qui garde `verification-preuve.tsx` et ses captures inchangés.
   */
  chemin?: string;
}

/* Le numéro de l'agence et sa cible, relevés tels quels dans les deux
   captures (`href="tel:+33478337205"`). */
const TELEPHONE = "04 78 33 72 05";
const TELEPHONE_HREF = "tel:+33478337205";

/* ----------------------------------------------------- valeurs de dessin
   Chaque constante est la valeur de la capture, à l'écriture près (React rend
   `0` pour `0px`). Le commentaire dit la section d'origine. */

/* 0 · Héros */
const HERO: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 40px 0",
};
const HERO_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.08fr .92fr",
  gap: 56,
  alignItems: "center",
};
const HERO_PASTILLES: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 22,
};
const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,var(--gl-a))",
  border: "1px solid var(--gbd)",
  font: "600 12px var(--fb)",
  color: "var(--ink1)",
  whiteSpace: "nowrap",
};
const PASTILLE_PUCE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--acc)",
};
const CLIENT: CSSProperties = {
  font: "700 13px var(--ft)",
  letterSpacing: ".1em",
  color: "var(--acc)",
  textTransform: "uppercase",
};
const TITRE1: CSSProperties = {
  font: "600 calc(clamp(38px,4.6vw,66px) * var(--ts))/1.03 var(--ft)",
  letterSpacing: "-.045em",
  margin: "0 0 22px",
  maxWidth: "15ch",
  textWrap: "balance",
};
const CHAPEAU: CSSProperties = {
  font: "400 18px/1.62 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 14px",
  maxWidth: "52ch",
  textWrap: "pretty",
};
const HERO_BOUTONS: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 22,
};
const BOUTON_ORANGE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
  transition: "filter var(--tr),transform var(--tr)",
};
const BOUTON_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--gsol)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  transition: "background var(--tr),transform var(--tr)",
};
/* La pastille blanche du logo client, et le logo lui-même. `filter` vaut
   `none`, ou l'inversion des logos clairs (`logoInverse`). */
const LOGO_PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 34,
  padding: "0 14px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
};
const LOGO_HAUTEUR = 18;
const LOGO_LARGEUR_MAX = 110;
const LOGO: CSSProperties = {
  height: LOGO_HAUTEUR,
  width: "auto",
  maxWidth: LOGO_LARGEUR_MAX,
  objectFit: "contain",
  display: "block",
};
const LOGO_INVERSE = "invert(1) hue-rotate(180deg)";
/* La photo dans son cadre, héros et dispositif ; la vignette n'a pas le
   contraste. `fill` pose déjà largeur et hauteur à 100 %. */
const PHOTO: CSSProperties = {
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
};
/* `display`, `verticalAlign` : les valeurs de la capture (calculées), que le
   preflight de Tailwind remplace par `block` et `middle` sur toute image. Posée
   sur la ligne de base d'un cadre à `line-height: normal`, la photo laisse
   dessous la descente de la ligne (7 px mesurés sur Bamesa, cadre de 576,5 px) :
   c'est elle qui fixe la hauteur de la section quand le tableau est plus court. */
const PHOTO_DANS_LE_FLUX: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "inline",
  verticalAlign: "baseline",
  ...PHOTO,
};
const VIGNETTE: CSSProperties = {
  objectFit: "cover",
  filter: "saturate(var(--sat))",
};
/* Le cadre de la photo du héros. Sans photo, il reste nu. */
const HERO_CADRE: CSSProperties = {
  position: "relative",
  borderRadius: 32,
  overflow: "hidden",
  height: 480,
  background: "var(--ph)",
  boxShadow: "0 40px 90px -50px rgba(28,27,25,.55)",
};
/* La fiche en incrustation sur la photo (Danone). */
const HERO_FICHE: CSSProperties = {
  position: "absolute",
  left: -28,
  bottom: -30,
  maxWidth: 330,
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: 24,
  padding: "22px 24px",
};
const HERO_FICHE_LIGNE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "104px minmax(0,1fr)",
  gap: 12,
  padding: "10px 0",
  borderTop: "1px solid var(--line)",
};
const HERO_FICHE_LIBELLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  paddingTop: 2,
};
const HERO_FICHE_VALEUR: CSSProperties = {
  font: "500 14px/1.45 var(--fb)",
  color: "var(--ink)",
};

/* 1 · Chiffres du dispositif */
const SECTION_CHIFFRES: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "88px 40px 0",
};
const CARTE_VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};
const CARTE_CHIFFRE: CSSProperties = {
  ...CARTE_VERRE,
  borderRadius: 24,
  padding: "22px 24px 24px",
};
const CHIFFRE_LIBELLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 10,
};
const CHIFFRE_VALEUR: CSSProperties = {
  font: "600 calc(19px * var(--ts))/1.3 var(--ft)",
  letterSpacing: "-.025em",
  color: "var(--ink)",
};

/* motifs communs aux sections 2 à 9 */
const SECTION: CSSProperties = { padding: "var(--sec) 0 0" };
const LARGEUR: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};
const KICKER: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 16,
};
const TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3.1vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: "0 0 34px",
  maxWidth: "22ch",
  textWrap: "balance",
};

/*
 * L'ÉTIQUETTE DE LA BASCULE MOBILE, et pourquoi ce n'est pas un titre.
 *
 * Les sections 02, 04 et 05 se replient sous 880 px. La première version du
 * repli, câblée le 12/10, déplaçait le surtitre et le `<h2>` DANS le
 * `<summary>` : le titre restait à la taille de sa capture (l'inline survit),
 * mais il passait sous un élément de rôle `button`, où les descendants sont
 * présentationnels. Les 113 titres de section des 41 pages devenaient donc le
 * nom accessible d'un bouton au lieu d'un titre de niveau 2, et la bascule,
 * visible à toutes les largeurs, laissait 113 arrêts de tabulation muets sur
 * grand écran.
 *
 * Le motif retenu est celui du gabarit métier : le `<h2>` RESTE dans la
 * section, à sa place et à sa taille, et la bascule porte une ÉTIQUETTE qui
 * n'existe que sous 880 px, marquée `data-mobile-seulement` comme le chevron
 * du même bloc. Au-dessus, la bascule n'est pas affichée du tout : un visiteur
 * de bureau voit exactement sa capture, et la structure du document garde un
 * seul titre par section.
 */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libellé de la bascule, au titre d'une section repliée de la maquette
    mobile v2 (dc.html L130 : `font:600 16.5px/1.3 var(--ft);
    letter-spacing:-.025em`). Il n'existe que sous 880 px. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 16.5px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  color: "var(--ink)",
};

/* Le conteneur du fil d'Ariane mobile, en tête de `<main>` : la largeur, la
   gouttière et les 40 px de tête du héros (`HERO`), que le héros rend sous
   880 px (`.sectionHeros`). La règle de 390 px de `app/globals.css` ramène la
   gouttière à 20 px comme les autres : elle vise ce motif d'attribut. */
const FIL_HAUT: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 40px 0",
};

/**
 * L'étiquette mobile d'une bascule : surtitre numéroté et titre.
 *
 * MAQUETTE MOBILE V3 (16/10, `hasN: g !== "02"`) : la carte d'une étude de
 * cas ne montre que son TITRE, sans numéro (`numero={false}` sur chaque
 * repli). Le surtitre « 02 · Notre réponse » reste dans le DOM mais la
 * feuille le masque sous 880 px (`.etiquetteSurtitre`), comme son doublon du
 * corps (`data-carte-surtitre`).
 */
function EtiquettePli({
  surtitre,
  titre,
  sombre = false,
}: {
  surtitre: string;
  titre: string;
  sombre?: boolean;
}) {
  return (
    <span data-mobile-seulement="" className={styles.etiquettePli}>
      <span className={styles.etiquetteSurtitre} style={ETIQUETTE_SURTITRE}>
        {surtitre}
      </span>{" "}
      <span
        data-carte-titre=""
        style={sombre ? { ...ETIQUETTE_TITRE, color: "#fff" } : ETIQUETTE_TITRE}
      >
        {titre}
      </span>{" "}
    </span>
  );
}

/* 2 · La situation */
const SITUATION_GRILLE: CSSProperties = {
  ...LARGEUR,
  display: "grid",
  gridTemplateColumns: "minmax(0,.72fr) minmax(0,1.28fr)",
  gap: 56,
  alignItems: "start",
};
const COLONNE_COLLANTE: CSSProperties = { position: "sticky", top: 110 };
const SITUATION_TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "18ch",
  textWrap: "balance",
};
const SITUATION_PROSE: CSSProperties = {
  font: "400 16.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 14px",
  maxWidth: "60ch",
};
const OBJECTIFS_LIBELLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  margin: "14px 0",
};
const OBJECTIFS_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 12,
};
const OBJECTIF_CARTE: CSSProperties = {
  ...CARTE_VERRE,
  borderRadius: "var(--rad)",
  padding: "20px 22px",
  display: "grid",
  gridTemplateColumns: "40px minmax(0,1fr)",
  gap: 16,
  alignItems: "start",
};
const OBJECTIF_NUMERO: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  background: "var(--acc-w)",
  color: "var(--acc)",
  font: "600 12px/40px ui-monospace,Menlo,monospace",
  textAlign: "center",
};
const OBJECTIF_TITRE: CSSProperties = {
  font: "600 15.5px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};
const OBJECTIF_TEXTE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  marginTop: 6,
};

/* 3 · Ce que nous avons mis en place */
const REPONSE_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 14,
};
const REPONSE_SOMBRE: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 28,
  padding: "34px 34px 32px",
  minHeight: 220,
  background: "var(--panel)",
};
const REPONSE_LUEUR: CSSProperties = {
  position: "absolute",
  width: 380,
  height: 380,
  right: -150,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
  pointerEvents: "none",
};
const REPONSE_VERRE: CSSProperties = {
  ...CARTE_VERRE,
  position: "relative",
  overflow: "hidden",
  borderRadius: 28,
  padding: 26,
  minHeight: 190,
};
const REPONSE_CORPS: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};
const REPONSE_NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  marginBottom: 16,
};

/* 4 · Le déroulé */
const DEROULE_RAIL: CSSProperties = {
  position: "absolute",
  left: 22,
  right: 22,
  top: 21,
  height: 2,
  background: "linear-gradient(90deg,var(--acc),rgba(255,124,60,.15))",
};
const ETAPE_PASTILLE: CSSProperties = {
  display: "block",
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 13px/44px var(--fb)",
  textAlign: "center",
  boxShadow: "0 0 0 7px var(--bg)",
  marginBottom: 20,
};
const ETAPE_TITRE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  marginBottom: 8,
};
const ETAPE_TEXTE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
};

/* 5 · Le dispositif */
const DISPOSITIF_GRILLE: CSSProperties = {
  ...LARGEUR,
  display: "grid",
  gridTemplateColumns: ".85fr 1.15fr",
  gap: 48,
  alignItems: "stretch",
};
const DISPOSITIF_CADRE: CSSProperties = {
  borderRadius: 32,
  overflow: "hidden",
  minHeight: 420,
  background: "var(--ph)",
  // Calculé dans la capture ; le site hérite 1.5 du preflight. Voir la photo.
  lineHeight: "normal",
};
const DISPOSITIF_TABLE: CSSProperties = {
  ...CARTE_VERRE,
  borderRadius: "var(--rad)",
  padding: "6px 28px",
};
const DISPOSITIF_LIGNE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(120px,.42fr) minmax(0,1fr)",
  gap: 18,
  padding: "15px 0",
  borderTop: "1px solid var(--line)",
};
const DISPOSITIF_LIBELLE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink4)",
  paddingTop: 3,
};
const DISPOSITIF_VALEUR: CSSProperties = {
  font: "500 15px/1.5 var(--fb)",
  color: "var(--ink)",
};

/* 6 · Le résultat */
const RESULTAT_SECTION: CSSProperties = { padding: "var(--sec) 24px 0" };
const RESULTAT_PANNEAU: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "60px 56px",
  position: "relative",
  overflow: "hidden",
};
const RESULTAT_LUEUR: CSSProperties = {
  position: "absolute",
  width: 560,
  height: 560,
  left: -200,
  top: -280,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};
const RESULTAT_TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.1vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 40px",
};
/* Les colonnes suivent le nombre de résultats, quatre au plus : `resGrid:
   cols(Math.min(p.results.length, 4), 32)` dans MigenCas (AKTID en a 2,
   Joint Lyonnais 4). */
/* L'ORDRE DES CLÉS EST CELUI DE LA CAPTURE (`display; gap;
   grid-template-columns`), et il compte : React sérialise `style` dans l'ordre
   du littéral, le `...spread` garde la position d'origine d'une clé remplacée,
   et `verification-preuve.tsx` cherche l'attribut de la capture TEL QUEL.
   `gridTemplateColumns` déclaré avant `gap` faisait tomber le contrôle n° 12
   sur les 41 pages (mesuré le 14/10 sur aktid, première du tri). La grille des
   étapes, écrite `display, gap, colonnes`, n'a jamais eu le défaut. */
const RESULTAT_GRILLE: CSSProperties = { display: "grid", gap: 32, gridTemplateColumns: "minmax(0,1fr)" };
const RESULTAT_COLONNES_MAX = 4;
const RESULTAT_ITEM: CSSProperties = {
  borderTop: "2px solid var(--acc)",
  paddingTop: 22,
};
const RESULTAT_COCHE: CSSProperties = {
  display: "inline-flex",
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  alignItems: "center",
  justifyContent: "center",
  font: "600 15px var(--fb)",
  marginBottom: 18,
};
const RESULTAT_ITEM_TITRE: CSSProperties = {
  font: "600 19px/1.35 var(--ft)",
  letterSpacing: "-.022em",
  color: "#fff",
  marginBottom: 10,
};
const RESULTAT_ITEM_TEXTE: CSSProperties = {
  font: "400 14.5px/1.65 var(--fb)",
  color: "rgba(255,255,255,.64)",
};

/* 7 · Complément */
const COMPLEMENT_SECTION: CSSProperties = { padding: "56px 0 0" };
const COMPLEMENT_CARTE: CSSProperties = {
  ...CARTE_VERRE,
  borderRadius: 28,
  padding: "30px 34px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  gap: "4px 44px",
};
const COMPLEMENT_BLOC: CSSProperties = { minWidth: 0, paddingBottom: 18 };
const COMPLEMENT_TITRE_RANGEE: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "baseline",
  marginBottom: 10,
};
const COMPLEMENT_TIRET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};
const COMPLEMENT_TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: 0,
};
const COMPLEMENT_TEXTE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "66ch",
  textWrap: "pretty",
};
const COMPLEMENT_PUCES: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 };
const COMPLEMENT_PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};
const COMPLEMENT_COCHE: CSSProperties = {
  color: "var(--acc)",
  flex: "0 0 auto",
  fontWeight: 600,
};
const COMPLEMENT_ACCROCHE: CSSProperties = {
  fontWeight: 600,
  color: "var(--ink)",
};

/* 8 · Votre besoin */
const BESOIN_SECTION: CSSProperties = {
  padding: "var(--sec) 0 0",
  scrollMarginTop: 100,
};
const BESOIN_GRILLE: CSSProperties = {
  ...LARGEUR,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 52,
  alignItems: "start",
};
const BESOIN_TITRE: CSSProperties = { ...TITRE2, margin: "0 0 20px" };
const BESOIN_PROSE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 14px",
  maxWidth: "48ch",
};
const BESOIN_TUILES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gridAutoRows: "1fr",
  gap: 10,
  marginTop: 22,
};
const BESOIN_TUILE: CSSProperties = {
  ...CARTE_VERRE,
  height: "100%",
  boxSizing: "border-box",
  borderRadius: 18,
  padding: "16px 18px",
};
const TUILE_TITRE: CSSProperties = {
  font: "600 14.5px/1.35 var(--ft)",
  color: "var(--ink)",
  marginBottom: 5,
};
const TUILE_TEXTE: CSSProperties = {
  font: "400 13px/1.5 var(--fb)",
  color: "var(--ink2)",
};
/* Le numéro en gras DANS la prose du besoin : la capture (fdj, vpk) enveloppe
   exactement « 04 78 33 72 05 » d'un <strong font-weight:600 color:var(--ink)>. */
const TELEPHONE_FORT: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

/* Une tuile du panneau sombre : le texte du bureau, et sous 880 px celui de
   la maquette MOBILE (corpus `## CTA`, décisions de copie appliquées) quand
   il diffère, « Astreinte » / « …, au 04 78 33 72 05. ». Les deux restent
   dans le DOM ; chacun ne se peint qu'à sa largeur. */
function TexteTuile({ bureau, mobile }: { bureau: string; mobile?: string }) {
  if (!mobile || mobile === bureau) return <>{bureau}</>;
  return (
    <>
      <span className={styles.libelleBureau}>{bureau}</span>{" "}
      <span data-mobile-seulement="">{mobile}</span>
    </>
  );
}

/* LES NOMS DE CLIENTS EN CASSE NORMALE AU TÉLÉPHONE : la V3 mobile passe
   chaque segment du corps par `cleanCase` (`segV`, voir `casseNormale`),
   « AKTID a confié » devient « Aktid a confié » ; le bureau garde les
   capitales de la capture. Le segment qui change est rendu deux fois, comme
   `TexteTuile` : celui du bureau en `libelleBureau`, celui du téléphone en
   `data-mobile-seulement`. Le segment ENTIER, pas le seul mot : un nom isolé
   dans sa balise ouvre un nouveau fragment de texte, dont le tracé décale
   l'anticrénelage du nom au bureau (mesuré le 16/10 : 56 à 104 pixels par
   page à 1280 px). Le segment entier part du début de sa ligne, comme avant :
   le bureau reste identique au pixel. Sans espace entre les deux : une seule
   se peint à chaque largeur. */
function casse(texte: string): ReactNode {
  const mobile = casseNormale(texte, true);
  if (mobile === texte) return texte;
  return (
    <>
      <span className={styles.libelleBureau}>{texte}</span>
      <span data-mobile-seulement="">{mobile}</span>
    </>
  );
}

function ProseBesoin({ texte }: { texte: string }) {
  if (!texte.includes(TELEPHONE)) return <>{casse(texte)}</>;
  const morceaux = texte.split(TELEPHONE);
  return (
    <>
      {morceaux.map((morceau, rang) => (
        <span key={rang}>
          {rang > 0 ? <strong style={TELEPHONE_FORT}>{TELEPHONE}</strong> : null}
          {casse(morceau)}
        </span>
      ))}
    </>
  );
}
const FORMULAIRE_CARTE: CSSProperties = {
  background: "#fff",
  borderRadius: "var(--rad)",
  padding: 30,
  border: "1px solid var(--line)",
  boxShadow: "0 30px 70px -34px rgba(0,0,0,.35)",
};
const FORMULAIRE_TITRE: CSSProperties = {
  font: "600 20px var(--ft)",
  letterSpacing: "-.03em",
  marginBottom: 18,
};

/* 9 · Pour aller plus loin */
const LOIN_SECTION: CSSProperties = { padding: "var(--sec) 0 var(--sec)" };
const LOIN_GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
  gap: 14,
};
const LOIN_CARTE: CSSProperties = {
  ...CARTE_VERRE,
  display: "flex",
  flexDirection: "column",
  borderRadius: 24,
  overflow: "hidden",
  transition: "transform var(--tr)",
};
const LOIN_CADRE: CSSProperties = {
  position: "relative",
  height: 150,
  background: "var(--ph)",
  overflow: "hidden",
};
const LOIN_CORPS: CSSProperties = {
  padding: "18px 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
};
const LOIN_SURTITRE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
};
const LOIN_RANGEE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "flex-start",
};
const LOIN_TITRE: CSSProperties = {
  font: "600 16.5px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};
const LOIN_FLECHE: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
};

/* ------------------------------------------------------------- sections */

function FicheLigne({ ligne, premiere }: { ligne: LignePreuve; premiere: boolean }) {
  return (
    <div
      className={styles.ficheLigne}
      style={
        premiere ? { ...HERO_FICHE_LIGNE, borderTop: "none" } : HERO_FICHE_LIGNE
      }
    >
      <span style={HERO_FICHE_LIBELLE}>{casse(ligne.libelle)}</span>
      <span style={HERO_FICHE_VALEUR}>{casse(ligne.valeur)}</span>
    </div>
  );
}

function Objectif({ objectif, rang }: { objectif: ObjectifPreuve; rang: number }) {
  return (
    <div style={OBJECTIF_CARTE}>
      <span aria-hidden="true" style={OBJECTIF_NUMERO}>
        {String(rang + 1).padStart(2, "0")}
      </span>
      <div>
        <TitreEtSuite
          rendu={casse}
          titre={objectif.titre}
          texte={objectif.texte}
          styleTitre={OBJECTIF_TITRE}
          styleTexte={OBJECTIF_TEXTE}
        />
      </div>
    </div>
  );
}

/**
 * La largeur de chaque carte, `bento` de MigenCas : la première en prend deux,
 * la dernière comble sa rangée (trois colonnes si elle y est seule, deux s'il
 * en reste deux), les autres une. `cs-w2` (deux colonnes sous 1000 px) va à la
 * première, et à la dernière quand le nombre de cartes est pair.
 */
function largeurCarte(rang: number, total: number): { colonnes: number; largeDeux: boolean } {
  const reste = (total + 1) % 3;
  const derniere = rang === total - 1 && rang > 0;
  const colonnes = rang === 0 ? 2 : derniere && reste === 1 ? 3 : derniere && reste === 2 ? 2 : 1;
  return { colonnes, largeDeux: rang === 0 || (derniere && total % 2 === 0) };
}

function CarteReponse({ carte, rang, total }: { carte: CartePreuve; rang: number; total: number }) {
  const sombre = rang === 0;
  const { colonnes, largeDeux } = largeurCarte(rang, total);
  return (
    <div
      className={largeDeux ? styles.largeDeux : undefined}
      style={{ ...(sombre ? REPONSE_SOMBRE : REPONSE_VERRE), gridColumn: `span ${colonnes}` }}
    >
      {sombre ? <div aria-hidden="true" style={REPONSE_LUEUR} /> : null}
      <div style={REPONSE_CORPS}>
        <span style={REPONSE_NUMERO}>{String(rang + 1).padStart(2, "0")}</span>
        <TitreEtSuite
          rendu={casse}
          titre={carte.titre}
          texte={carte.texte}
          styleTitre={{
            font: sombre ? "600 22px/1.3 var(--ft)" : "600 17px/1.3 var(--ft)",
            letterSpacing: "-.025em",
            color: sombre ? "#fff" : "var(--ink)",
            marginBottom: 10,
            maxWidth: sombre ? "22ch" : "none",
          }}
          styleTexte={{
            font: sombre
              ? "400 15.5px/1.62 var(--fb)"
              : "400 14.5px/1.62 var(--fb)",
            color: sombre ? "rgba(255,255,255,.66)" : "var(--ink2)",
            maxWidth: sombre ? "46ch" : "none",
          }}
        />
      </div>
    </div>
  );
}

/* Un bloc du complément que la maquette MOBILE range DANS une section
   numérotée (le corpus le pose sous `## CE QUE NOUS AVONS MIS EN PLACE` ou
   `## LE RÉSULTAT`) : un titre identique et un texte seul, sans puces. */
function texteDeplace(blocs: readonly BlocComplementPreuve[] | undefined, titre: string): string | undefined {
  const bloc = (blocs ?? []).find(
    (b) => b.titre?.trim().toLowerCase() === titre.toLowerCase() && b.texte && !b.puces?.length,
  );
  return bloc?.texte;
}
const TITRES_DEPLACES = ["Ce que nous avons mis en place", "Le résultat"];

function Complement({
  blocs,
  apresResultat,
}: {
  blocs: BlocComplementPreuve[];
  /** Vrai quand la section « Le résultat » est rendue juste au-dessus. */
  apresResultat: boolean;
}) {
  /* Sous 880 px, un bloc rendu dans sa section (voir `texteDeplace`) est
     masqué ici, et la section entière quand il ne reste rien : le texte reste
     dans le DOM, le bureau ne bouge pas. */
  const deplace = (bloc: BlocComplementPreuve) =>
    TITRES_DEPLACES.some((t) => texteDeplace([bloc], t) !== undefined);
  /* « LE RÉSULTAT » DEUX FOIS DE SUITE (relevé du 16/10, 16 études de cas sur
     41) : la carte s'ouvrait sur le titre de la section sombre qu'elle suit.
     Quand un autre bloc ouvre la carte (« Chiffres clés »…), le titre ne
     suit plus la section et reste.
     Le premier bloc garde son texte et perd ce titre redit ; la donnée garde
     le sien, que `texteDeplace` lit au téléphone. */
  const titreRedit = (bloc: BlocComplementPreuve, rang: number) =>
    apresResultat && rang === 0 && bloc.titre?.trim().toLowerCase() === "le résultat";
  const toutDeplace = blocs.every(deplace);
  return (
    <section
      className={`${styles.sectionComplement} ${toutDeplace ? styles.libelleBureau : ""}`}
      style={COMPLEMENT_SECTION}
    >
      <div style={LARGEUR}>
        <div style={COMPLEMENT_CARTE}>
          {blocs.map((bloc, rang) => (
            <div key={rang} className={deplace(bloc) ? styles.libelleBureau : undefined} style={COMPLEMENT_BLOC}>
              {bloc.titre && !titreRedit(bloc, rang) ? (
                <div style={COMPLEMENT_TITRE_RANGEE}>
                  <span aria-hidden="true" style={COMPLEMENT_TIRET} />
                  <h3 style={COMPLEMENT_TITRE}>{casse(bloc.titre)}</h3>
                </div>
              ) : null}
              {bloc.texte ? <p style={COMPLEMENT_TEXTE}>{casse(bloc.texte)}</p> : null}
              {bloc.puces?.length ? (
                <div style={COMPLEMENT_PUCES}>
                  {bloc.puces.map((puce) => (
                    <div key={puce.accroche} style={COMPLEMENT_PUCE}>
                      <span aria-hidden="true" style={COMPLEMENT_COCHE}>
                        ✓
                      </span>
                      <span>
                        <strong style={COMPLEMENT_ACCROCHE}>
                          {casse(puce.accroche)}
                        </strong>{" "}
                        {casse(puce.texte)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Une phrase du corpus (`corpus-mobile.ts`), liens compris ; un lien dont la
    cible n'est pas sûre est rendu en texte, rien n'est retiré. */
function SegmentsCorpus({ segments }: { segments: readonly SegmentCorpus[] }) {
  return (
    <>
      {segments.map((g, i) =>
        g.href && cibleSure(g.href) ? (
          <Link key={i} href={g.href} prefetch={false}>
            {casse(g.t)}
          </Link>
        ) : (
          <Fragment key={i}>{casse(g.t)}</Fragment>
        ),
      )}
    </>
  );
}

/** Espaces réduites : la donnée du site et le corpus n'ont pas toujours les
    mêmes. Les apostrophes sont comparées à part (`apostrophesDroites`). */
const resserre = (s: string) => s.replace(/\s+/g, " ").trim();
const apostrophesDroites = (s: string) => s.replace(/’/g, "'");

/**
 * Le paragraphe du corpus qui annonce la liste de « La situation » (« … Le
 * besoin posé par le site : »). Si un paragraphe du site en est le DÉBUT, seule
 * la fin manquante est rendue, dans ce paragraphe ; sinon le paragraphe entier
 * vient après la prose. Le texte rendu est celui du corpus, mot pour mot.
 */
function introDeLaListe(
  intro: string | undefined,
  prose: readonly string[],
): { rang: number; suite: string } | undefined {
  if (!intro) return undefined;
  const corpus = resserre(intro);
  for (let rang = 0; rang < prose.length; rang++) {
    const site = resserre(prose[rang]);
    if (!apostrophesDroites(corpus).startsWith(apostrophesDroites(site))) continue;
    const suite = corpus.slice(site.length).trim();
    return suite ? { rang, suite } : undefined;
  }
  // -1 : aucun paragraphe du site n'en est le début, le paragraphe entier suit.
  return { rang: -1, suite: corpus };
}

export default function PagePreuve({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
  chemin,
}: ProprietesPagePreuve) {
  const chiffres = contenu.chiffres ?? [];
  const objectifs = contenu.objectifs ?? [];
  const reponse = contenu.reponseCartes ?? [];
  const etapes = contenu.etapes ?? [];
  const dispositif = contenu.dispositif ?? [];
  const resultats = contenu.resultats ?? [];
  const plusLoin = (contenu.plusLoin ?? []).filter((l) => cibleSure(l.href));

  /* La couche MOBILE de la maquette v2, dérivée du chemin (voir
     `donnees-mobiles.ts`). */
  const minutes = chemin ? minutesDeLecture(chemin) : undefined;
  const autresRealisations = chemin ? realisationsLiees(chemin) : [];
  /* Les phrases du corpus que seule la maquette MOBILE rend (voir
     `corpus-mobile.ts`), toutes en `data-mobile-seulement`. */
  const corpus = chemin ? CORPUS_MOBILE[chemin] : undefined;
  /* Le H1 du téléphone, celui de la maquette V3 : « Savoye : alliance
     intralogistique », le client en casse normale (voir `titreMobile`). */
  const titreTelephone = chemin ? titreMobile(chemin, corpus?.titreCourt) : undefined;
  const introSituation = introDeLaListe(corpus?.introSituation, contenu.situationProse ?? []);

  /* LES SECTIONS DE TEXTE, 01 à 04, rassemblées dans l'ordre : ce sont
     elles, et elles seules, que la cadence de conversion compte (dc.html
     L477-480 : `nD` ne compte que les sections de texte ; les faits, le
     résultat, le complément et l'appel à l'action n'y entrent pas). Une
     section sans donnée vaut `null`, et `AvecConversionMobile` ne la compte
     pas. Le résultat (05) est rendu juste après, hors cadence.
     Le balisage de chacune est celui d'avant, au repli près : rien ne bouge à
     1280 px. */

  /* --------------------------------------------- 2 · « La situation » */
  /* LA CARTE 01 DE LA MAQUETTE MOBILE (dc.html L130, `op = dI++ < nOpen` :
     la première section est OUVERTE). `toujoursOuvert` : servie ouverte, elle
     ne se referme pas au montage, et le visiteur peut la replier au doigt.
     Le titre de la carte est « La situation », le surtitre de la section
     (« 01 · La situation ») réduit à son nom ; le surtitre du corps, son
     doublon mot pour mot, est masqué sous 880 px (`.kickerDoublon`). Le `<h2>`
     reste à sa place : c'est la phrase en gras qui ouvre la section dans la
     maquette (`allB`, 600 17px). Sur bureau, la bascule n'existe pas
     (`.racine details > summary { display: none }`) : la grille est rendue
     telle quelle, avec son style de capture. */
  /* Chaque accroche passe par `cleanCase` comme dans la V3 (`teaseOf`,
     non strict) : « Prise en charge du montage : Aktid fait appel… ». */
  const resumeSituation = casseNormale(
    [contenu.situationTitre, contenu.situationProse?.[0]].filter(Boolean).join(" "),
  );
  const sectionSituation = contenu.situationTitre ? (
    <section key="situation" className={styles.sectionPli} style={SECTION}>
      <SectionPliableMobile
        toujoursOuvert
        numero={false}
        enTete={<EtiquettePli surtitre="01 · La situation" titre="La situation" />}
        resume={resumeSituation}
      >
        <div className={`mg-r2 ${styles.grilleSituation}`} style={SITUATION_GRILLE}>
          <div className={styles.collante} style={COLONNE_COLLANTE}>
            <div className={styles.kickerDoublon} style={KICKER}>
              01 · La situation
            </div>
            <h2 className={styles.titreSituation} style={SITUATION_TITRE}>
              {casse(contenu.situationTitre)}
            </h2>
          </div>
          <div className={styles.proseSituation}>
            {(contenu.situationProse ?? []).map((paragraphe, rang) => (
              <p key={paragraphe} style={SITUATION_PROSE}>
                {casse(paragraphe)}
                {introSituation?.rang === rang ? (
                  <span data-mobile-seulement=""> {casse(introSituation.suite)}</span>
                ) : null}
              </p>
            ))}
            {introSituation?.rang === -1 ? (
              <p data-mobile-seulement="" style={SITUATION_PROSE}>
                {casse(introSituation.suite)}
              </p>
            ) : null}
            {objectifs.length > 0 ? (
              <>
                <div className={styles.libelleBureau} style={OBJECTIFS_LIBELLE}>Les objectifs posés</div>
                <div className={`mg-r2 ${styles.objectifs}`} style={OBJECTIFS_GRILLE}>
                  {objectifs.map((objectif, rang) => (
                    <Objectif key={objectif.titre} objectif={objectif} rang={rang} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </SectionPliableMobile>
    </section>
  ) : null;

  /* ------------------------- 3 · « Ce que nous avons mis en place » */
  /* SE REPLIE AU TÉLÉPHONE, comme les sections 02 à 04 de la maquette mobile
     (dc.html L477 : `op = dI++ < nOpen`, une seule ouverte, la 01). La bascule
     porte une ÉTIQUETTE mobile ; le surtitre et le `<h2>` de la capture
     restent dans la section (voir ETIQUETTE_SURTITRE).

     PAS DE RÉSUMÉ SOUS LA BASCULE, alors que la maquette en pose un (`tease`,
     L438). Mesuré le 14/10 : un résumé glissé entre le chevron et le surtitre
     coupe le mot que le `textContent` y formait (« place›02 »,
     « dispositif›04 », « résultat›05 »), et la porte « aucun mot perdu »
     (`scripts/instantane-texte-main.mjs`) le compte comme perdu sur les 28
     pages. Le titre de la bascule suffit à dire ce qui est replié. */
  /* LE RÉSUMÉ DE LA CARTE FERMÉE (dc.html L438, `teaseOf`) : le texte de la
     première puce, « Libellé : texte », tel que la maquette le compose ; la
     feuille partagée le coupe à deux lignes. Il vit dans le `<summary>`, en
     `data-mobile-seulement` : rien ne change à 1280 px. La couture est celle
     de toutes les accroches (`ligneDuCorpus`) : virgule qui continue le titre,
     point du corpus, sinon « : » et minuscule ; puis la casse normale des noms
     de clients au téléphone (`casseNormale`, comme la V3). */
  const premiereCarte = reponse[0];
  const accrocheReponse = premiereCarte
    ? ligneDuCorpus({ accroche: premiereCarte.titre, texte: premiereCarte.texte, point: premiereCarte.point })
    : undefined;
  const resumeReponse = accrocheReponse ? casseNormale(accrocheReponse) : undefined;
  const texteMisEnPlace = texteDeplace(contenu.complement, "Ce que nous avons mis en place");
  const sectionReponse =
    reponse.length > 0 ? (
      <section key="reponse" className={styles.sectionPli} style={SECTION}>
        <div className={styles.pliClair} style={LARGEUR}>
          <SectionPliableMobile
            numero={false}
            enTete={
              <EtiquettePli surtitre="02 · Notre réponse" titre="Ce que nous avons mis en place" />
            }
            resume={resumeReponse}
          >
            <div data-carte-surtitre="" style={KICKER}>
              02 · Notre réponse
            </div>
            <h2 className={styles.titreDoublon} style={TITRE2}>
              Ce que nous avons mis en place
            </h2>
            <div className={styles.bento} style={REPONSE_GRILLE}>
              {reponse.map((carte, rang) => (
                <CarteReponse key={carte.titre} carte={carte} rang={rang} total={reponse.length} />
              ))}
            </div>
            {texteMisEnPlace ? (
              <p data-mobile-seulement="" className={styles.suiteDeplacee}>
                {casse(texteMisEnPlace)}
              </p>
            ) : null}
          </SectionPliableMobile>
        </div>
      </section>
    ) : null;

  /* ------------------------------------------ 4 · « Le déroulé » */
  /* L'accroche de la carte fermée, maquette V3 (`teaseOf`) : la première
     étape, « Rapprochement : Savoye et Migen constatent… ». Et pour le
     dispositif, sa première rangée, « Client : Savoye, concepteur… » (la V3
     n'en garde que le libellé, « Client », qui n'annonce rien). */
  const accrocheDeroule = accrocheDe([
    { liste: etapes.map((etape) => ligneDuCorpus({ accroche: etape.titre, texte: etape.texte, point: etape.point })) },
  ]);
  const resumeDeroule = accrocheDeroule ? casseNormale(accrocheDeroule) : undefined;
  /* La V3 lit la première cellule du tableau (« Client »). */
  const accrocheDispositif = accrocheDe([{ cellule: dispositif[0]?.libelle }]);
  const resumeDispositif = accrocheDispositif ? casseNormale(accrocheDispositif) : undefined;
  /* Repli manquant mesuré le 14/10 (gabarit 02 de +36 à +51 % plus haut que la
     maquette à 390 px) : le déroulé était la seule section numérotée de la
     maquette sans bascule ici. */
  const sectionDeroule =
    etapes.length > 0 ? (
      <section key="deroule" className={styles.sectionPli} style={SECTION}>
        <div className={styles.pliClair} style={LARGEUR}>
          <SectionPliableMobile
            numero={false}
            enTete={<EtiquettePli surtitre="03 · Étape par étape" titre="Le déroulé" />}
            resume={resumeDeroule}
          >
            <div data-carte-surtitre="" style={KICKER}>
              03 · Étape par étape
            </div>
            <h2 className={styles.titreDoublon} style={{ ...TITRE2, margin: "0 0 40px" }}>
              Le déroulé
            </h2>
            <div style={{ position: "relative" }}>
              {/* Le rail orange derrière les pastilles. `mg-rail` le retire
                  quand la grille se replie, convention de la charte. */}
              <div className="mg-rail" aria-hidden="true" style={DEROULE_RAIL} />
              {/* `stepGrid: cols(p.steps.length, p.steps.length > 5 ? 14 : 20)`
                  dans MigenCas : l'écart se resserre à six étapes. */}
              <div
                className={styles.etapes}
                style={{
                  display: "grid",
                  gap: etapes.length > 5 ? 14 : 20,
                  gridTemplateColumns: `repeat(${etapes.length},minmax(0,1fr))`,
                }}
              >
                {etapes.map((etape, rang) => (
                  <div key={etape.titre} style={{ position: "relative", paddingRight: 8 }}>
                    <span aria-hidden="true" className={styles.pastille} style={ETAPE_PASTILLE}>
                      {String(rang + 1).padStart(2, "0")}
                    </span>
                    <TitreEtSuite
                      rendu={casse}
                      titre={etape.titre}
                      texte={etape.texte}
                      styleTitre={ETAPE_TITRE}
                      styleTexte={ETAPE_TEXTE}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionPliableMobile>
        </div>
      </section>
    ) : null;

  /* --------------------------------------- 5 · « Le dispositif » */
  /* La photo vit dans la cellule de GAUCHE, hors du repli : sous 880 px elle
     se replie AVEC la section (règle `.grilleDispositif` du module), et un
     cadre vide, sans photo, n'y est pas peint du tout. */
  const sectionDispositif =
    dispositif.length > 0 ? (
      <section key="dispositif" className={styles.sectionPli} style={SECTION}>
        <div className={`mg-r2 ${styles.grilleDispositif}`} style={DISPOSITIF_GRILLE}>
          <div
            className={styles.cadreDispositif}
            aria-hidden={contenu.photoDispositif ? undefined : true}
            style={DISPOSITIF_CADRE}
          >
            {contenu.photoDispositif ? (
              // `<img>` et non `next/image` : dans la maquette, la photo
              // est DANS le flux, et sa proportion naturelle fixe la
              // hauteur du cadre quand le tableau est plus court (Eiffage,
              // Bamesa). `fill` la sort du flux (le cadre retombait à
              // 420px, mesuré à 14 % d'écart) et la donnée ne porte pas les
              // dimensions qu'exige l'autre mode. Mêmes octets que la
              // maquette, servis tels quels, sous la ligne de flottaison.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contenu.photoDispositif}
                alt="Technicien migen en mission"
                loading="lazy"
                decoding="async"
                style={PHOTO_DANS_LE_FLUX}
              />
            ) : null}
          </div>
          <div className={styles.pliClair}>
            <SectionPliableMobile
              numero={false}
              enTete={<EtiquettePli surtitre="04 · Fiche mission" titre="Le dispositif" />}
              resume={resumeDispositif}
            >
              <div data-carte-surtitre="" style={KICKER}>
                04 · Fiche mission
              </div>
              <h2 className={styles.titreDoublon} style={{ ...TITRE2, margin: "0 0 26px" }}>
                Le dispositif
              </h2>
              <div className={styles.tableDispositif} style={DISPOSITIF_TABLE}>
                {dispositif.map((ligne, rang) => (
                  <div
                    className={styles.dispositifLigne}
                    key={ligne.libelle}
                    style={rang === 0 ? { ...DISPOSITIF_LIGNE, borderTop: "none" } : DISPOSITIF_LIGNE}
                  >
                    <span style={DISPOSITIF_LIBELLE}>{casse(ligne.libelle)}</span>
                    <span style={DISPOSITIF_VALEUR}>{casse(ligne.valeur)}</span>
                  </div>
                ))}
              </div>
            </SectionPliableMobile>
          </div>
        </div>
      </section>
    ) : null;

  /* ---------------------------------------- 6 · « Le résultat » */
  /* LA MAQUETTE MOBILE LA REMONTE EN TÊTE, OUVERTE, en panneau sombre non
     numéroté (dc.html L461 : `facts`, puis `result`, puis le reste ; L475 :
     `isPlain`, `C_DARK`). Le DOM ne bouge pas, le bureau non plus : sous
     880 px, `<main>` passe en colonne flexible et la feuille donne à cette
     section le rang qui suit le héros et ses chiffres (`.sectionResultat`,
     `order`). `toujoursOuvert` : jamais refermée, et sa bascule, doublon de
     son surtitre et de son titre, n'est pas affichée sous 880 px non plus.
     Elle ne compte pas dans la cadence (dc.html L477 : `nD` ne compte que les
     sections de texte) : elle est posée hors d'`AvecConversionMobile`. */
  const texteResultat = texteDeplace(contenu.complement, "Le résultat");
  const resultatApres = chemin ? texteResultatApres(chemin) : false;
  const paragrapheResultat = texteResultat ? (
    <p
      data-mobile-seulement=""
      className={resultatApres ? styles.suiteResultat : styles.chapeauDeplace}
    >
      {casse(texteResultat)}
    </p>
  ) : null;
  const sectionResultat =
    resultats.length > 0 ? (
      <section key="resultat" className={styles.sectionResultat} style={RESULTAT_SECTION}>
        <div className={styles.panneauResultat} style={RESULTAT_PANNEAU}>
          <div aria-hidden="true" className={styles.lueurResultat} style={RESULTAT_LUEUR} />
          <div style={{ position: "relative" }}>
            <SectionPliableMobile
              numero={false}
              toujoursOuvert
              enTete={<EtiquettePli surtitre="05 · Résultat" titre="Le résultat" sombre />}
            >
              <div className={styles.kickerResultat} style={KICKER}>
                05 · Résultat
              </div>
              <h2 className={styles.titreResultat} style={RESULTAT_TITRE}>
                Le résultat
              </h2>
              {resultatApres ? null : paragrapheResultat}
              {/* corpus, `## LE RÉSULTAT` : « Ce que la mission illustre : ». */}
              {corpus?.introResultat ? (
                <p data-mobile-seulement="" className={styles.introResultat}>
                  {casse(corpus.introResultat)}
                </p>
              ) : null}
              <div
                className={styles.resultats}
                style={{
                  ...RESULTAT_GRILLE,
                  gridTemplateColumns: `repeat(${Math.min(resultats.length, RESULTAT_COLONNES_MAX)},minmax(0,1fr))`,
                }}
              >
                {resultats.map((resultat) => (
                  <div key={resultat.titre} style={RESULTAT_ITEM}>
                    <span aria-hidden="true" style={RESULTAT_COCHE}>
                      ✓
                    </span>
                    <TitreEtSuite
                      rendu={casse}
                      titre={resultat.titre}
                      texte={resultat.texte}
                      styleTitre={RESULTAT_ITEM_TITRE}
                      styleTexte={RESULTAT_ITEM_TEXTE}
                    />
                  </div>
                ))}
              </div>
              {resultatApres ? paragrapheResultat : null}
            </SectionPliableMobile>
          </div>
        </div>
      </section>
    ) : null;

  const numerotees = [sectionSituation, sectionReponse, sectionDeroule, sectionDispositif];

  return (
    // `data-gabarit` : le marqueur que `verification-preuve.tsx` cherche sur la
    // page SERVIE. Sans lui, une page /preuves/ rendue par un autre gabarit
    // passait inaperçue (28 pages le 08/10).
    // `--sec` à 120px : `.mgc-root{--sec:120px}` dans MigenCas, que la règle
    // mobile `.mg-site{--sec:64px}` n'atteint donc pas dans la maquette.
    <div
      className={`mg-site ${styles.racine}`}
      data-gabarit="etude-de-cas"
      style={{ "--sec": "120px" } as CSSProperties}
    >
      <main style={{ paddingTop: 62 }}>
        {/* Le fil d'Ariane de la maquette MOBILE (dc.html L104), sous 881 px
            seulement : les captures de bureau de ce gabarit n'en portent pas.

            IL VIENT AVANT LE FIL DES MOTEURS (`filAriane`, son JSON-LD), et ce
            n'est pas un hasard. Le `textContent` du `<main>` colle la fin du
            JSON-LD au premier mot du héros (« …}]}Étude ») : posé entre les
            deux, le fil mobile coupait ce mot, et la porte « aucun mot perdu »
            le comptait perdu sur les 28 pages (mesuré le 14/10). En tête de
            `<main>`, il n'a rien avant lui, et il se termine par une espace. */}
        {chemin ? (
          <div data-mobile-seulement="" className={styles.filHaut} style={FIL_HAUT}>
            <FilArianeMobile chemin={chemin} />
          </div>
        ) : null}
        {filAriane}

        {/* ----------------------------------- 0 · « Étude de cas · héros » */}

        <section className={styles.sectionHeros} style={HERO}>
          {/* LE HÉROS COMPACT DE LA MAQUETTE MOBILE (dc.html L105-109), par
              des classes que seul le bloc `max-width: 880px` du module lit :
              H1 à 27 px, chapeau à 15 px, boutons côte à côte, photo en 16/10.
              Le dessin de bureau reste celui de la capture, au pixel. */}
          <div className={`mg-r2 ${styles.grilleHeros}`} style={HERO_GRILLE}>
            <div className={styles.colonneTexte}>
              <div className={styles.pastillesHeros} style={HERO_PASTILLES}>
                <span className={styles.pastilleType} style={PASTILLE}>
                  <span aria-hidden="true" className={styles.puceType} style={PASTILLE_PUCE} />
                  Étude de cas
                  {/* Le badge de lecture de la maquette MOBILE (dc.html L492 :
                      « Étude de cas · N min de lecture »), mobile seulement :
                      la pastille de la capture de bureau reste mot pour mot.

                      LE TEXTE EST PEINT PAR LA FEUILLE (`::before`, attribut
                      `data-lecture`), PAS ÉCRIT DANS LE DOM. Écrit, il tombait
                      entre « Étude de cas » et le nom du client, que le
                      `textContent` colle en un seul mot (« casAKTIDUn ») :
                      la porte « aucun mot perdu » le comptait perdu. C'est un
                      ornement de téléphone, comme le chevron. Pas d'espace à
                      écrire : la pastille est une boîte flex à `gap: 8`. */}
                  {minutes ? (
                    <span
                      data-mobile-seulement=""
                      data-lecture={`· ${minutes}`}
                      className={styles.badgeLecture}
                    />
                  ) : null}
                </span>
                {contenu.logo ? (
                  <span className={styles.logoHeros} style={LOGO_PASTILLE}>
                    <Image
                      src={contenu.logo}
                      alt={contenu.client}
                      width={LOGO_LARGEUR_MAX}
                      height={LOGO_HAUTEUR}
                      priority
                      style={{
                        ...LOGO,
                        filter: contenu.logoInverse ? LOGO_INVERSE : "none",
                      }}
                    />
                  </span>
                ) : null}
                <span className={styles.clientHeros} style={CLIENT}>
                  {contenu.client}
                </span>
              </div>

              {/* Le titre de la maquette MOBILE V3 (16/10) : « Aktid : un
                  centre logistique… », « Savoye : alliance intralogistique »,
                  le client en casse normale et sans « Étude de cas ». Il ne se
                  peint que sous 880 px, et HORS DU H1 : le H1 servi ne porte
                  qu'un titre, celui de la capture de bureau (défaut du 16/10,
                  « Aktid : un centre… semaines Un centre… semaines » dans un
                  seul H1). Doublon pour l'œil, il est `aria-hidden` ; sous
                  880 px le H1 reste lu, masqué pour l'œil seulement
                  (`titreDoublon`, comme les `<h2>` des cartes). Le nom du
                  client quitte alors la pastille (il ouvre le titre).
                  L'espace FINIT le titre du téléphone, dans son bloc : retiré
                  avec lui, le texte de bureau reste celui d'un rendu sans
                  couche mobile, au caractère près. Un `<div>`, pas un `<p>` :
                  le premier `<p>` de la colonne doit rester le chapô, que
                  `.chapeauHeros:first-of-type` coiffe du titre « Le client et
                  le site ». */}
              {titreTelephone ? (
                <div
                  aria-hidden="true"
                  data-mobile-seulement=""
                  data-titre-mobile=""
                  className={styles.titreHeros}
                  style={TITRE1}
                >
                  {`${titreTelephone} `}
                </div>
              ) : null}
              <h1 className={titreTelephone ? styles.titreDoublon : styles.titreHeros} style={TITRE1}>
                {titre}
              </h1>

              {(contenu.chapeau ?? []).map((paragraphe) => (
                <p key={paragraphe} className={styles.chapeauHeros} style={CHAPEAU}>
                  {casse(paragraphe)}
                </p>
              ))}

              <div className={styles.boutonsHeros} style={HERO_BOUTONS}>
                <a
                  href="#cas-form"
                  className={styles.boutonPrincipal}
                  style={BOUTON_ORANGE}
                >
                  {/* dc.html L412 : « Décrire mon besoin », le libellé du
                      bouton de la maquette MOBILE ; celui de la page reste
                      au bureau et sur la carte du formulaire. */}
                  <span className={styles.libelleBureau}>{contenu.bouton}</span>{" "}
                  <span data-mobile-seulement="">Décrire mon besoin</span>
                </a>
                <a
                  href={TELEPHONE_HREF}
                  className={styles.boutonSecondaire}
                  style={BOUTON_TEL}
                >
                  {TELEPHONE}
                </a>
              </div>
            </div>

            <div className={styles.colonnePhoto} style={{ position: "relative" }}>
              <div
                className={styles.cadreHeros}
                aria-hidden={contenu.photoHero ? undefined : true}
                style={HERO_CADRE}
              >
                {contenu.photoHero ? (
                  <PhotoMobile
                    mobile={chemin ? photoHerosMobile(chemin) : undefined}
                    src={contenu.photoHero}
                    alt="Intervention migen sur site client"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 520px"
                    style={PHOTO}
                  />
                ) : null}
              </div>
              {contenu.heroFiche?.length ? (
                <div className={styles.ficheFlottante} style={HERO_FICHE}>
                  {contenu.heroFiche.map((ligne, rang) => (
                    <FicheLigne
                      key={ligne.libelle}
                      ligne={ligne}
                      premiere={rang === 0}
                    />
                  ))}
                </div>
              ) : null}
              {/* L'encadré qui ferme « Le client et le site » dans la maquette
                  MOBILE (corpus, `> Ce cas figure dans nos …`). */}
              {corpus?.casFigure ? (
                <p data-mobile-seulement="" className={styles.encadreClient}>
                  <span>
                    <SegmentsCorpus segments={corpus.casFigure} />
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* -------------------------------- 1 · « Chiffres du dispositif » */}

        {chiffres.length > 0 ? (
          <section className={styles.sectionChiffres} style={SECTION_CHIFFRES}>
            <div
              className={`mg-rmulti ${styles.chiffres}`}
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))`,
              }}
            >
              {chiffres.map((chiffre) => (
                <div key={chiffre.libelle} style={CARTE_CHIFFRE}>
                  <div style={CHIFFRE_LIBELLE}>{casse(chiffre.libelle)}</div>
                  <div style={CHIFFRE_VALEUR}>{casse(chiffre.valeur)}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ------------------------------- 2 à 6 · les sections numérotées */}
        {/* LA CADENCE DE CONVERSION DE LA MAQUETTE MOBILE (dc.html L452-456),
            posée entre les sections numérotées : photo + CTA après la 2e
            (« Ce que nous avons mis en place », comme la capture m-02),
            bandeau « Être rappelé » après la 5e section de texte, donc
            jamais sur une étude de cas, qui en compte quatre (la maquette ne
            le pose pas non plus sur m-02). Tout ce qu'elle ajoute est masqué
            au-dessus de 880 px.

            Elle défait, dans le `textContent` du `<main>`, le « mot » que
            collaient la fin d'une section et le début de la suivante
            (« montage.03 », « rencontrés.Le ») : la porte « aucun mot perdu »
            le range en COLLAGE, ses deux moitiés restant de part et d'autre
            de l'insertion (règle étroite de `scripts/instantane-texte-main.mjs`).

            `rappelFinal={false}` : la page pose déjà son formulaire complet,
            « Votre besoin », juste après le complément ; le rappel de la
            cadence tomberait JUSTE AU-DESSUS, deux formulaires d'affilée. La
            capture m-02 range le rappel tout en bas : il y est posé, plus bas
            dans ce gabarit. */}
        {chemin ? (
          <AvecConversionMobile
            chemin={chemin}
            gabarit="02"
            photoHeros={contenu.photoHero}
            rappelFinal={false}
          >
            {numerotees}
          </AvecConversionMobile>
        ) : (
          numerotees
        )}
        {sectionResultat}
        {/* Le bandeau « Une question sur votre site ? » de la cadence : la
            maquette ne le pose pas sur une étude de cas (quatre sections de
            texte), mais le site le servait : il reste dans le DOM, masqué à
            toutes les largeurs (`hidden`), au lieu d'en être retiré. */}
        {chemin ? (
          <div hidden>
            <BandeauRappelMobile variante={varianteDe(chemin, "02")} />
          </div>
        ) : null}
        {/* ----------------------------------------- 7 · « Complément » */}

        {contenu.complement?.length ? (
          <Complement blocs={contenu.complement} apresResultat={resultats.length > 0} />
        ) : null}

        {/* --------------------------------------- 8 · « Votre besoin » */}

        {contenu.besoinTitre ? (
          <section id="cas-form" className={styles.sectionBesoin} style={BESOIN_SECTION}>
            <div className="mg-r2" style={BESOIN_GRILLE}>
              <div className={`${styles.collante} ${styles.panneauBesoin}`} style={COLONNE_COLLANTE}>
                {/* dc.html L475 : « Passer à l’action », surtitre du `cta`
                    de la maquette MOBILE. */}
                <div style={KICKER}>
                  <span className={styles.libelleBureau}>Votre besoin</span>{" "}
                  <span data-mobile-seulement="">Passer à l’action</span>
                </div>
                <h2 className={styles.titreBesoin} style={BESOIN_TITRE}>
                  {casse(contenu.besoinTitre)}
                </h2>
                {(contenu.besoinProse ?? []).map((paragraphe) => (
                  <p key={paragraphe} style={BESOIN_PROSE}>
                    <ProseBesoin texte={paragraphe} />
                  </p>
                ))}
                {contenu.besoinTuiles?.length ? (
                  <div className={styles.besoinTuiles} style={BESOIN_TUILES}>
                    {contenu.besoinTuiles.map((tuile, rang) => {
                      // Rang pour rang, seulement si le corpus compte autant de tuiles.
                      const m =
                        corpus?.tuiles?.length === contenu.besoinTuiles?.length
                          ? corpus?.tuiles?.[rang]
                          : undefined;
                      return (
                        <div key={tuile.titre} style={BESOIN_TUILE}>
                          <div style={TUILE_TITRE}>
                            <TexteTuile bureau={tuile.titre} mobile={m && copieConforme(m.t, chemin)} />
                          </div>
                          <div style={TUILE_TEXTE}>
                            <TexteTuile bureau={tuile.texte} mobile={m && copieConforme(m.x, chemin)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {/* La maquette MOBILE ferme ce panneau sur ses deux boutons
                    (corpus, `## CTA` : « Demander un technicien sur site »
                    vers /contact/ · le téléphone) ; le formulaire en trois
                    étapes reste au bureau, le rappel final le relaie en bas
                    de page. */}
                <div data-mobile-seulement="" className={styles.boutonsBesoin}>
                  <Link href="/contact/" prefetch={false} className={styles.boutonPrincipal} style={BOUTON_ORANGE}>
                    {contenu.bouton}
                  </Link>{" "}
                  <a href={TELEPHONE_HREF} className={styles.telephoneBesoin}>
                    {TELEPHONE}
                  </a>
                </div>
                {/* Le pied du panneau dans la maquette MOBILE (corpus, `## CTA`) :
                    « Offre et secteur concernés : … », « À lire aussi », puis
                    le bouton plein « Décrire mon besoin » (dc.html L203). Les
                    cartes « Pour aller plus loin », qui portent les mêmes
                    liens, restent au bureau. */}
                {corpus?.concernes ? (
                  <p data-mobile-seulement="" className={styles.encadreSombre}>
                    <SegmentsCorpus segments={corpus.concernes} />
                  </p>
                ) : null}
                {/* Une ligne « À lire aussi » du corpus = un bloc, son
                    libellé et sa pastille (dc.html `isRel`). Le libellé est
                    celui de la V3 (`caseLbl`) : « Savoye : migration… », sans
                    « Étude de cas », client en casse normale, décisions de
                    copie d'abord (« ORTHUS » devient « Migen Travaux »). */}
                {(corpus?.lireAussi ?? [])
                  .filter((l) => cibleSure(l.href))
                  .map((l) => (
                    <div key={l.href} data-mobile-seulement="" className={styles.lireAussi}>
                      <div className={styles.lireAussiLibelle}>À lire aussi</div>
                      <Link href={l.href} prefetch={false} className={styles.pastilleLire}>
                        {libelleCas(appliqueDecisions(l.t, chemin))} <span aria-hidden="true">›</span>
                      </Link>
                    </div>
                  ))}
                <Link data-mobile-seulement="" href="/contact/" prefetch={false} className={styles.boutonPlein}>
                  Décrire mon besoin
                </Link>
              </div>
              <div className={styles.carteFormulaire} style={FORMULAIRE_CARTE}>
                <div style={FORMULAIRE_TITRE}>{contenu.bouton}</div>
                {/* MigenCas répète `p.ctaLabel` sur le bouton d'envoi. */}
                <FormulaireContact formulaire={formulaire} libelleEnvoi={contenu.bouton} />
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------- 9 · « Pour aller plus loin » */}

        {plusLoin.length > 0 ? (
          <section className={styles.sectionPlusLoin} style={LOIN_SECTION}>
            <div style={LARGEUR}>
              <div className={styles.kickerPlusLoin} style={KICKER}>
                Pour aller plus loin
              </div>
              {/* Sous 880 px, une rangée qui défile à l'horizontale, motif
                  carrousel de la maquette mobile (dc.html L131) : les cartes
                  restent toutes dans le DOM, aucune n'est retirée. */}
              <div className={styles.grillePlusLoin} style={LOIN_GRILLE}>
                {plusLoin.map((lien) => (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    prefetch={false}
                    className={styles.cartePlusLoin}
                    style={LOIN_CARTE}
                  >
                    <div aria-hidden="true" style={LOIN_CADRE}>
                      {lien.photo ? (
                        <Image
                          src={lien.photo}
                          alt={altPhoto(lien.photo)}
                          fill
                          sizes="(max-width: 700px) 100vw, 380px"
                          /* Cadre 270x150, ratio 1,80 : `VIGNETTE` est partagée,
                             le cadrage s'y ajoute sans la modifier ailleurs. */
                          style={{ ...VIGNETTE, objectPosition: cadragePhoto(lien.photo, 270 / 150) }}
                        />
                      ) : null}
                    </div>
                    <div style={LOIN_CORPS}>
                      <span style={LOIN_SURTITRE}>{lien.surtitre}</span>
                      <div style={LOIN_RANGEE}>
                        <span style={LOIN_TITRE}>{lien.titre}</span>
                        <span aria-hidden="true" style={LOIN_FLECHE}>
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------- maquette MOBILE v2, dans l'ordre de la capture
            m-02 : « D’autres réalisations », le carrousel (dc.html L482), puis
            le rappel final « Être rappelé » (L138, voir la cadence plus haut).
            Les captures de bureau de ce gabarit ne portent ni l'un ni
            l'autre : tous deux sont `data-mobile-seulement`, rien ne change à
            1280 px.

            LES ESPACES AUTOUR sont celles du `textContent` : sans elles, le
            premier mot ajouté se colle au dernier de la section d'avant
            (« clients→ » devenait « clients→D'autres », compté perdu par la
            porte « aucun mot perdu »).

            « DANS LA MÊME RUBRIQUE » (capture L506) : les pastilles du cocon
            passent leurs libellés par lib/decisions-copie.ts depuis le 14/10,
            Tournaire y est « conçues en interne » comme sur sa page. */}
        {chemin ? (
          <>
            {" "}
            <CarrouselRealisations cartes={autresRealisations} />{" "}
            <PastillesCocon chemin={chemin} variante="soeurs" />{" "}
            <RappelFinalMobile variante={varianteDe(chemin, "02")} />{" "}
          </>
        ) : null}

        {maillage ? (
          <div
            className={styles.maillageBas}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
