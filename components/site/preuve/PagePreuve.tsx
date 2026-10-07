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
 *   1. LES PHOTOS NE SONT PAS RENDUES : logo client, photo du héros, photo du
 *      dispositif, vignettes « Pour aller plus loin ». La capture les sert en
 *      `blob:` sans nommer de fichier, et poser une photo de la photothèque
 *      serait une association inventée (CLAUDE.md §13). Le cadre reste nu,
 *      précédent `LienPageLiee` du gabarit 03.
 *   2. LE BOUTON D'ENVOI du formulaire rend « On me rappelle dans l'heure »
 *      (libellé fixe de `FormulaireContact`, composant partagé hors de ce
 *      périmètre) là où la capture écrit le libellé de la page. Même écart,
 *      déjà déclaré et à faire arbitrer, que `PanneauFormulaire` du gabarit 03.
 *   3. LES SURVOLS sont posés depuis les motifs identiques relevés dans
 *      `maquette/site-final-autonome.html` (bouton orange, bouton en verre,
 *      carte qui se soulève) : la capture référence des classes `scp*`/`cs-*`
 *      dont la feuille n'est pas dans le dépôt, l'export autonome sur disque
 *      étant en retard sur la maquette qui a produit les captures.
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
/* Le cadre de la photo du héros. La photo n'est pas nommée : il reste nu. */
const HERO_CADRE: CSSProperties = {
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
  gridColumn: "span 2",
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
  gridColumn: "span 1",
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
const RESULTAT_GRILLE: CSSProperties = {
  display: "grid",
  gap: 32,
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
};
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

function CarteReponse({ carte, rang }: { carte: CartePreuve; rang: number }) {
  const sombre = rang === 0;
  return (
    <div
      className={sombre ? styles.carteSombre : undefined}
      style={sombre ? REPONSE_SOMBRE : REPONSE_VERRE}
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
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section
            style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}
          >
            {filAriane}
          </section>
        ) : null}

        {/* ----------------------------------- 0 · « Étude de cas · héros » */}

        <section style={HERO}>
          <div className="mg-r2" style={HERO_GRILLE}>
            <div>
              <div style={HERO_PASTILLES}>
                <span style={PASTILLE}>
                  <span aria-hidden="true" style={PASTILLE_PUCE} />
                  Étude de cas
                </span>
                {/* La capture ajoute ici le LOGO du client, servi en `blob:`
                    sans nommer de fichier : la pastille blanche reste absente
                    plutôt que de porter un logo inventé. Trou déclaré. */}
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
              {/* La photo du héros n'est pas nommée par la capture : le cadre
                  reste nu (précédent LienPageLiee, CLAUDE.md §13). */}
              <div aria-hidden="true" style={HERO_CADRE} />
              {contenu.heroFiche?.length ? (
                <div style={HERO_FICHE}>
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
              <div style={COLONNE_COLLANTE}>
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
              <div className="mg-rmulti" style={REPONSE_GRILLE}>
                {reponse.map((carte, rang) => (
                  <CarteReponse key={carte.titre} carte={carte} rang={rang} />
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
                <div
                  className="mg-rmulti"
                  style={{
                    display: "grid",
                    gap: 20,
                    gridTemplateColumns: `repeat(${etapes.length},minmax(0,1fr))`,
                  }}
                >
                  {etapes.map((etape, rang) => (
                    <div
                      key={etape.titre}
                      style={{ position: "relative", paddingRight: 8 }}
                    >
                      <span aria-hidden="true" style={ETAPE_PASTILLE}>
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
              {/* Photo non nommée par la capture : cadre nu, trou déclaré. */}
              <div aria-hidden="true" style={DISPOSITIF_CADRE} />
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
                <div className="mg-rmulti" style={RESULTAT_GRILLE}>
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
              <div style={COLONNE_COLLANTE}>
                <div style={KICKER}>Votre besoin</div>
                <h2 style={BESOIN_TITRE}>{contenu.besoinTitre}</h2>
                {(contenu.besoinProse ?? []).map((paragraphe) => (
                  <p key={paragraphe} style={BESOIN_PROSE}>
                    <ProseBesoin texte={paragraphe} />
                  </p>
                ))}
                {contenu.besoinTuiles?.length ? (
                  <div className="mg-r2" style={BESOIN_TUILES}>
                    {contenu.besoinTuiles.map((tuile) => (
                      <div key={tuile.titre} style={BESOIN_TUILE}>
                        <div style={TUILE_TITRE}>{tuile.titre}</div>
                        <div style={TUILE_TEXTE}>{tuile.texte}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div style={FORMULAIRE_CARTE}>
                <div style={FORMULAIRE_TITRE}>{contenu.bouton}</div>
                <FormulaireContact formulaire={formulaire} />
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
                    {/* Vignette non nommée par la capture : cadre nu. */}
                    <div aria-hidden="true" style={LOIN_CADRE} />
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
