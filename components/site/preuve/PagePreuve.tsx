import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

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
const RESULTAT_GRILLE: CSSProperties = { display: "grid", gap: 32 };
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
const COMPLEMENT_PUCES: CSSProperties = { display: "grid", gap: 10 };
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

function ProseBesoin({ texte }: { texte: string }) {
  if (!texte.includes(TELEPHONE)) return <>{texte}</>;
  const morceaux = texte.split(TELEPHONE);
  return (
    <>
      {morceaux.map((morceau, rang) => (
        <span key={rang}>
          {rang > 0 ? <strong style={TELEPHONE_FORT}>{TELEPHONE}</strong> : null}
          {morceau}
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
      style={
        premiere ? { ...HERO_FICHE_LIGNE, borderTop: "none" } : HERO_FICHE_LIGNE
      }
    >
      <span style={HERO_FICHE_LIBELLE}>{ligne.libelle}</span>
      <span style={HERO_FICHE_VALEUR}>{ligne.valeur}</span>
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
        <div style={OBJECTIF_TITRE}>{objectif.titre}</div>
        {objectif.texte ? (
          <div style={OBJECTIF_TEXTE}>{objectif.texte}</div>
        ) : null}
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
        <div
          style={{
            font: sombre ? "600 22px/1.3 var(--ft)" : "600 17px/1.3 var(--ft)",
            letterSpacing: "-.025em",
            color: sombre ? "#fff" : "var(--ink)",
            marginBottom: 10,
            maxWidth: sombre ? "22ch" : "none",
          }}
        >
          {carte.titre}
        </div>
        <div
          style={{
            font: sombre
              ? "400 15.5px/1.62 var(--fb)"
              : "400 14.5px/1.62 var(--fb)",
            color: sombre ? "rgba(255,255,255,.66)" : "var(--ink2)",
            maxWidth: sombre ? "46ch" : "none",
          }}
        >
          {carte.texte}
        </div>
      </div>
    </div>
  );
}

function Complement({ blocs }: { blocs: BlocComplementPreuve[] }) {
  return (
    <section style={COMPLEMENT_SECTION}>
      <div style={LARGEUR}>
        <div style={COMPLEMENT_CARTE}>
          {blocs.map((bloc, rang) => (
            <div key={rang} style={COMPLEMENT_BLOC}>
              {bloc.titre ? (
                <div style={COMPLEMENT_TITRE_RANGEE}>
                  <span aria-hidden="true" style={COMPLEMENT_TIRET} />
                  <h3 style={COMPLEMENT_TITRE}>{bloc.titre}</h3>
                </div>
              ) : null}
              {bloc.texte ? <p style={COMPLEMENT_TEXTE}>{bloc.texte}</p> : null}
              {bloc.puces?.length ? (
                <div style={COMPLEMENT_PUCES}>
                  {bloc.puces.map((puce) => (
                    <div key={puce.accroche} style={COMPLEMENT_PUCE}>
                      <span aria-hidden="true" style={COMPLEMENT_COCHE}>
                        ✓
                      </span>
                      <span>
                        <strong style={COMPLEMENT_ACCROCHE}>
                          {puce.accroche}
                        </strong>{" "}
                        {puce.texte}
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

export default function PagePreuve({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPagePreuve) {
  const chiffres = contenu.chiffres ?? [];
  const objectifs = contenu.objectifs ?? [];
  const reponse = contenu.reponseCartes ?? [];
  const etapes = contenu.etapes ?? [];
  const dispositif = contenu.dispositif ?? [];
  const resultats = contenu.resultats ?? [];
  const plusLoin = (contenu.plusLoin ?? []).filter((l) => cibleSure(l.href));

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
        {filAriane}

        {/* ----------------------------------- 0 · « Étude de cas · héros » */}

        <section style={HERO}>
          <div className="mg-r2" style={HERO_GRILLE}>
            <div>
              <div style={HERO_PASTILLES}>
                <span style={PASTILLE}>
                  <span aria-hidden="true" style={PASTILLE_PUCE} />
                  Étude de cas
                </span>
                {contenu.logo ? (
                  <span style={LOGO_PASTILLE}>
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
                <span style={CLIENT}>{contenu.client}</span>
              </div>

              <h1 style={TITRE1}>{titre}</h1>

              {(contenu.chapeau ?? []).map((paragraphe) => (
                <p key={paragraphe} style={CHAPEAU}>
                  {paragraphe}
                </p>
              ))}

              <div style={HERO_BOUTONS}>
                <a
                  href="#cas-form"
                  className={styles.boutonPrincipal}
                  style={BOUTON_ORANGE}
                >
                  {contenu.bouton}
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

            <div style={{ position: "relative" }}>
              <div aria-hidden={contenu.photoHero ? undefined : true} style={HERO_CADRE}>
                {contenu.photoHero ? (
                  <Image
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
            </div>
          </div>
        </section>

        {/* -------------------------------- 1 · « Chiffres du dispositif » */}

        {chiffres.length > 0 ? (
          <section style={SECTION_CHIFFRES}>
            <div
              className="mg-rmulti"
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))`,
              }}
            >
              {chiffres.map((chiffre) => (
                <div key={chiffre.libelle} style={CARTE_CHIFFRE}>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                  <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* --------------------------------------- 2 · « La situation » */}

        {contenu.situationTitre ? (
          <section style={SECTION}>
            <div className="mg-r2" style={SITUATION_GRILLE}>
              <div className={styles.collante} style={COLONNE_COLLANTE}>
                <div style={KICKER}>01 · La situation</div>
                <h2 style={SITUATION_TITRE}>{contenu.situationTitre}</h2>
              </div>
              <div>
                {(contenu.situationProse ?? []).map((paragraphe) => (
                  <p key={paragraphe} style={SITUATION_PROSE}>
                    {paragraphe}
                  </p>
                ))}
                {objectifs.length > 0 ? (
                  <>
                    <div style={OBJECTIFS_LIBELLE}>Les objectifs posés</div>
                    <div className="mg-r2" style={OBJECTIFS_GRILLE}>
                      {objectifs.map((objectif, rang) => (
                        <Objectif
                          key={objectif.titre}
                          objectif={objectif}
                          rang={rang}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------- 3 · « Ce que nous avons mis en place » */}

        {reponse.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div style={KICKER}>02 · Notre réponse</div>
              <h2 style={TITRE2}>Ce que nous avons mis en place</h2>
              <div className={styles.bento} style={REPONSE_GRILLE}>
                {reponse.map((carte, rang) => (
                  <CarteReponse
                    key={carte.titre}
                    carte={carte}
                    rang={rang}
                    total={reponse.length}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------ 4 · « Le déroulé » */}

        {etapes.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div style={KICKER}>03 · Étape par étape</div>
              <h2 style={{ ...TITRE2, margin: "0 0 40px" }}>Le déroulé</h2>
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
                    <div
                      key={etape.titre}
                      style={{ position: "relative", paddingRight: 8 }}
                    >
                      <span aria-hidden="true" className={styles.pastille} style={ETAPE_PASTILLE}>
                        {String(rang + 1).padStart(2, "0")}
                      </span>
                      <div style={ETAPE_TITRE}>{etape.titre}</div>
                      <div style={ETAPE_TEXTE}>{etape.texte}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------------- 5 · « Le dispositif » */}

        {dispositif.length > 0 ? (
          <section style={SECTION}>
            <div className="mg-r2" style={DISPOSITIF_GRILLE}>
              <div
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
              <div>
                <div style={KICKER}>04 · Fiche mission</div>
                <h2 style={{ ...TITRE2, margin: "0 0 26px" }}>Le dispositif</h2>
                <div style={DISPOSITIF_TABLE}>
                  {dispositif.map((ligne, rang) => (
                    <div
                      key={ligne.libelle}
                      style={
                        rang === 0
                          ? { ...DISPOSITIF_LIGNE, borderTop: "none" }
                          : DISPOSITIF_LIGNE
                      }
                    >
                      <span style={DISPOSITIF_LIBELLE}>{ligne.libelle}</span>
                      <span style={DISPOSITIF_VALEUR}>{ligne.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------- 6 · « Le résultat » */}

        {resultats.length > 0 ? (
          <section style={RESULTAT_SECTION}>
            <div className={styles.panneauResultat} style={RESULTAT_PANNEAU}>
              <div aria-hidden="true" style={RESULTAT_LUEUR} />
              <div style={{ position: "relative" }}>
                <div style={KICKER}>05 · Résultat</div>
                <h2 style={RESULTAT_TITRE}>Le résultat</h2>
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
                      <div style={RESULTAT_ITEM_TITRE}>{resultat.titre}</div>
                      <div style={RESULTAT_ITEM_TEXTE}>{resultat.texte}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ----------------------------------------- 7 · « Complément » */}

        {contenu.complement?.length ? (
          <Complement blocs={contenu.complement} />
        ) : null}

        {/* --------------------------------------- 8 · « Votre besoin » */}

        {contenu.besoinTitre ? (
          <section id="cas-form" style={BESOIN_SECTION}>
            <div className="mg-r2" style={BESOIN_GRILLE}>
              <div className={styles.collante} style={COLONNE_COLLANTE}>
                <div style={KICKER}>Votre besoin</div>
                <h2 style={BESOIN_TITRE}>{contenu.besoinTitre}</h2>
                {(contenu.besoinProse ?? []).map((paragraphe) => (
                  <p key={paragraphe} style={BESOIN_PROSE}>
                    <ProseBesoin texte={paragraphe} />
                  </p>
                ))}
                {contenu.besoinTuiles?.length ? (
                  <div style={BESOIN_TUILES}>
                    {contenu.besoinTuiles.map((tuile) => (
                      <div key={tuile.titre} style={BESOIN_TUILE}>
                        <div style={TUILE_TITRE}>{tuile.titre}</div>
                        <div style={TUILE_TEXTE}>{tuile.texte}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
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
          <section style={LOIN_SECTION}>
            <div style={LARGEUR}>
              <div style={KICKER}>Pour aller plus loin</div>
              <div style={LOIN_GRILLE}>
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
                          alt=""
                          fill
                          sizes="(max-width: 700px) 100vw, 380px"
                          style={VIGNETTE}
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

        {maillage ? (
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
