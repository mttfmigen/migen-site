import Image from "next/image";
import { useId, type CSSProperties } from "react";

import styles from "./QuestionsPhoto.module.css";

import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { QuestionsPhotoOffres } from "@/types/offres";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * La FAQ du hub des offres, variante « 09 Questions · photo » de la maquette :
 * c'est le nom que porte la section dans l'export du client (`data-screen-label`).
 *
 * Carte sombre aux coins arrondis, photo d'atelier en fond sous un dégradé qui
 * s'éclaircit vers la droite, titre blanc à gauche avec le lien « Poser une
 * autre question », et les six dépliants en cartes blanches translucides à
 * droite. Les valeurs viennent du rendu de la maquette, relevées élément par
 * élément le 06/10 (`maquette/rendu/offres.html`, gabarit 1120 à 1136).
 *
 * La photo est celle de l'export autonome du client (ressource « r7 » de son
 * paquet, extraite octet pour octet), posée dans `public/assets/web/faq-offres.jpg`.
 *
 * LES COULEURS S'ÉCRIVENT COMME DANS LA CAPTURE (`var(--ink)`, `var(--ink2)`,
 * `var(--chip)`, verre `var(--gl-a)`/`var(--gbd)`) : c'est la classe
 * `.panneau` du module, copie de `.mg-faqph`, qui leur donne leur valeur
 * sombre. Écrites en dur (`#fff`…), elles divergeaient des 134 captures qui
 * portent ce bloc, et la pastille « + » était à 10 % de blanc au lieu de 14.
 *
 * `<details>`/`<summary>` plutôt que l'accordéon piloté de la maquette : même
 * choix que `Objections`, et pour les mêmes raisons, clavier, lecteurs d'écran
 * et contenu lisible par Google sans JavaScript.
 *
 * LA QUESTION ET LA RÉPONSE PASSENT PAR `TexteRiche` DEPUIS LE 09/10. C'est ce
 * composant qui portait QUATRE des cinq FAQ en Markdown brut relevées par
 * l'audit de Nathan Jorez du 09/10 (`/entreprise-maintenance-industrielle/`,
 * `/offres/arret-technique/`, `/offres/audit-conseil-maintenance/`,
 * `/offres/depannage-industriel/`) : il rendait `{q.reponse}` tel quel, là où
 * `blocs/Objections.tsx` passait déjà par `TexteRiche`. ÉCART ASSUMÉ À LA
 * MAQUETTE, qui affiche elle-même les crochets, ce que l'audit refuse. Seule la
 * syntaxe disparaît du texte visible.
 */

const CARTE: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "#1c1b19",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  // Relevé le 07/10 sur la maquette qui tourne, pas estimé : le voile allait
  // de .88 à .32, la maquette va de .92 à .62. La photo reste donc nettement
  // plus sombre à droite, et les cartes de questions s'y détachent moins.
  background:
    "linear-gradient(90deg, rgba(18,17,16,.92) 0%, rgba(18,17,16,.8) 50%, rgba(18,17,16,.62) 100%)",
};

/** La pastille orange pleine des pages d'offres, relevée sur leur capture. */
const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "rgba(255, 124, 60, .9) 0 12px 30px -12px",
  textDecoration: "none",
  transition: "filter var(--tr), transform var(--tr)",
};

const GRILLE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.2fr)",
  // 52px et non 36 : mesuré sur la maquette (392px + 52 + 588px dans 1120).
  gap: 52,
  alignItems: "start",
  padding: 44,
};

/** La colonne du titre : collante dans la capture, neutralisée par `.panneau`. */
const COLONNE_TITRE: CSSProperties = { position: "sticky", top: 112 };

/* Titre, pastille, question et réponse : styles en ligne du bloc
   `mg-faqph`, identiques sur les 149 captures qui le portent (relevé du
   08/10, `maquette/rendu/*.html`). */
const TITRE_BLOC: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  margin: "0 0 22px",
  textWrap: "balance",
  maxWidth: "14ch",
};

const CHAPEAU_BLOC: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "rgba(255,255,255,.78)",
  margin: "0 0 18px",
};

const LIEN: CSSProperties = {
  font: "600 14.5px var(--fb)",
  color: "rgb(255, 124, 60)",
};

/** Le pli : le verre de la maquette, en petits coins (`var(--rad-s)`). Sur
 * `.panneau`, ce verre passe à 10 % de blanc : on voit l'atelier au travers. */
const PLI: CSSProperties = { ...VERRE, borderRadius: "var(--rad-s)" };

const QUESTION: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  padding: "20px 24px",
};

const INTITULE: CSSProperties = {
  font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "var(--ink)",
};

/** Pastille ronde de 30px. Ouverte, globals.css la tourne de 45 degrés et la
 * passe à l'orange : le « + » devient une croix, le dessin de la maquette. */
const PLUS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 999,
  flex: "0 0 auto",
  font: "400 20px/1 var(--fb)",
  transition: "transform var(--tr),background var(--tr)",
  background: "var(--chip)",
  color: "var(--ink2)",
};

const REPONSE: CSSProperties = {
  padding: "0 24px 22px",
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  maxWidth: "68ch",
};

export default function QuestionsPhoto({
  donnees,
}: {
  donnees: QuestionsPhotoOffres;
}) {
  // README : une seule question ouverte à la fois. Accordéon exclusif natif.
  const groupe = useId();
  if (donnees.questions.length === 0) return null;

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div className={styles.panneau} style={CARTE}>
          <Image
            src={donnees.photo}
            alt={altPhoto(donnees.photo)}
            fill
            sizes="1200px"
            style={{ objectFit: "cover" }}
          />
          <div style={VOILE} />
          <div className={`mg-r2 ${styles.grille}`} style={GRILLE}>
            <div style={COLONNE_TITRE}>
              <div style={SURTITRE}>{donnees.surtitre}</div>
              <h2 style={TITRE_BLOC}>{donnees.titre}</h2>
              {donnees.chapeau ? (
                <p style={CHAPEAU_BLOC}>{donnees.chapeau}</p>
              ) : null}
              {donnees.bouton ? (
                <a href={donnees.lienHref} className={styles.pastille} style={PASTILLE}>
                  {donnees.lienTexte}
                </a>
              ) : (
                <a href={donnees.lienHref} className={styles.lienFleche} style={LIEN}>
                  {donnees.lienTexte} →
                </a>
              )}
            </div>
            <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
              {donnees.questions.map((q, i) => (
                <details
                  key={q.question}
                  className="cx-faq"
                  style={PLI}
                  name={groupe}
                  // La maquette ouvre la PREMIÈRE question, sa réponse est
                  // visible d'emblée. On ne l'ouvre que si elle a une réponse :
                  // sur plusieurs pages d'offres la première réponse est vide,
                  // parce que le contrat interdit de copier son prix. Ouvrir un
                  // pli vide donnerait une carte cassée là où la maquette
                  // montre un paragraphe.
                  open={i === 0 && Boolean(q.reponse.trim())}
                >
                  <summary style={QUESTION}>
                    <span className={styles.texteAvecLiens} style={INTITULE}>
                      <TexteRiche texte={q.question} />
                    </span>
                    <span className="cx-plus" style={PLUS}>
                      +
                    </span>
                  </summary>
                  <div className={styles.texteAvecLiens} style={REPONSE}>
                    <TexteRiche texte={q.reponse} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
