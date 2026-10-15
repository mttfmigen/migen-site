import Image from "next/image";
import Link from "next/link";
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

/**
 * LA DERNIÈRE QUESTION DE LA MAQUETTE MOBILE V2 : la question de clôture du
 * corpus (« Besoin de tenir le poste dès ce trimestre… ? »), que la maquette
 * range dans la FAQ et que le bureau rend en titre de l'appel final. Au
 * téléphone seulement, sa réponse est celle du corpus : le bouton, le
 * téléphone, la phrase de rappel.
 */
export interface QuestionFinale {
  question: string;
  bouton?: string;
  rappel?: string;
  /**
   * Le sur-titre de la CARTE SOMBRE (« Passer à l’action ») : quand le corpus
   * porte une section « ## CTA », la maquette rend la question de clôture en
   * carte après la FAQ (dc.html L475, `C_DARK`), pas en dernière question.
   */
  surtitre?: string;
}

/** dc.html : « [Demander un profil pour mon site](/contact/) · 04 78 33 72 05 ». */
const TELEPHONE = "04 78 33 72 05";

/* La carte sombre de dc.html L131 (`isPlain`, `C_DARK`, `pad: 22px 20px`,
   `rad: 24px`), ses boutons `isBtnQ` et son bouton `hasBtn`. */
const CARTE_FINALE: CSSProperties = {
  marginTop: 6,
  padding: "22px 20px",
  borderRadius: 24,
  background: "#1c1b19",
  border: "1px solid #1c1b19",
  color: "#fff",
};

const SURTITRE_FINAL: CSSProperties = {
  marginBottom: 8,
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#ff7c3c",
};

const QUESTION_FINALE: CSSProperties = {
  margin: "6px 0 14px",
  font: "600 17px/1.45 var(--ft)",
  color: "#fff",
  textWrap: "pretty",
};

const RANGEE_FINALE: CSSProperties = { display: "flex", gap: 8, margin: "6px 0 14px" };

const BOUTON_FINAL: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14px/1.25 var(--fb)",
  textAlign: "center",
  textDecoration: "none",
};

const TELEPHONE_FINAL: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
  color: "#fff",
  font: "600 13px var(--fb)",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

const RAPPEL_FINAL: CSSProperties = {
  margin: "0 0 12px",
  font: "400 15px/1.65 var(--fb)",
  color: "rgba(255,255,255,.84)",
};

const GRAND_BOUTON_FINAL: CSSProperties = {
  ...BOUTON_FINAL,
  flex: "none",
  minHeight: 50,
  padding: "0 16px",
  marginTop: 6,
  font: "600 14.5px/1.25 var(--fb)",
};

/** La carte « Passer à l’action » : mobile seulement, après la dernière question. */
function CarteFinale({ q }: { q: QuestionFinale }) {
  return (
    <section data-mobile-seulement="" style={CARTE_FINALE}>
      <div style={SURTITRE_FINAL}>{q.surtitre}</div>
      <p style={QUESTION_FINALE}>{q.question}</p>
      {q.bouton ? (
        <div style={RANGEE_FINALE}>
          <Link href="/contact/" style={BOUTON_FINAL}>{q.bouton}</Link>
          <a href={`tel:${TELEPHONE.replace(/\s/g, "")}`} style={TELEPHONE_FINAL}>{TELEPHONE}</a>
        </div>
      ) : null}
      {q.rappel ? <p style={RAPPEL_FINAL}>{q.rappel}</p> : null}
      {q.bouton ? (
        <Link href="/contact/" style={GRAND_BOUTON_FINAL}>{q.bouton}</Link>
      ) : null}
    </section>
  );
}

export default function QuestionsPhoto({
  donnees,
  questionFinale,
}: {
  donnees: QuestionsPhotoOffres;
  /** Rendue au téléphone seulement, en dernière carte de la liste. */
  questionFinale?: QuestionFinale;
}) {
  // README : une seule question ouverte à la fois. Accordéon exclusif natif.
  const groupe = useId();
  if (donnees.questions.length === 0) return null;

  return (
    /* AU TÉLÉPHONE, LA SIMPLE LISTE DE CARTES DE LA MAQUETTE MOBILE V2
       (dc.html `isTitle` puis `isQ`) : le panneau à photo s'efface, le
       sur-titre et le titre prennent le dessin de la maquette
       (`data-faq-surtitre`, `data-faq-titre`) et les questions celui de ses
       cartes (`data-faq-liste`, `app/globals.css`). Rien n'est retiré du
       DOM ; au-dessus de 880 px, rien ne change. */
    /* `data-faq-maquette` : au téléphone, l'en-tête de la maquette mobile v2,
       le seul titre « Questions fréquentes » (dc.html `isTitle`) ; le H2 de
       bureau et le lien « Poser ma question » sortent de l'écran, leur texte
       reste dans le DOM (`app/globals.css` § 16). */
    <section data-faq-maquette="" className={styles.section} style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div className={styles.panneau} style={CARTE}>
          <Image
            className={styles.photo}
            src={donnees.photo}
            alt={altPhoto(donnees.photo)}
            fill
            sizes="1200px"
            style={{ objectFit: "cover" }}
          />
          <div className={styles.voile} style={VOILE} />
          <div className={`mg-r2 ${styles.grille}`} style={GRILLE}>
            <div style={COLONNE_TITRE}>
              <div data-faq-surtitre="" style={SURTITRE}>{donnees.surtitre}</div>
              <h2 data-faq-titre="" style={TITRE_BLOC}>{donnees.titre}</h2>
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
            <div data-faq-liste="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10, alignContent: "start" }}>
              {donnees.questions.map((q, i) => (
                <details
                  key={q.question}
                  className="cx-faq"
                  style={PLI}
                  name={groupe}
                  // AUCUNE QUESTION N'EST OUVERTE AU CHARGEMENT, arbitrage de
                  // Mehdi du 11/10. La maquette ouvre la première, et ce
                  // composant le faisait, sauf quand la réponse était vide.
                  // C'est donc un écart assumé, demandé pour raccourcir les
                  // pages au téléphone.
                >
                  <summary style={QUESTION}>
                    <span className={styles.texteAvecLiens} style={INTITULE}>
                      <TexteRiche texte={q.question} />
                    </span>
                    <span aria-hidden="true" className="cx-plus" style={PLUS}>
                      +
                    </span>
                  </summary>
                  <div className={styles.texteAvecLiens} style={REPONSE}>
                    <TexteRiche texte={q.reponse} />
                  </div>
                </details>
              ))}
              {questionFinale?.question && questionFinale.surtitre ? (
                <CarteFinale q={questionFinale} />
              ) : questionFinale?.question ? (
                <details
                  data-mobile-seulement=""
                  className="cx-faq"
                  style={PLI}
                  name={groupe}
                >
                  <summary style={QUESTION}>
                    <span className={styles.texteAvecLiens} style={INTITULE}>
                      <TexteRiche texte={questionFinale.question} />
                    </span>
                    <span aria-hidden="true" className="cx-plus" style={PLUS}>
                      +
                    </span>
                  </summary>
                  <div className={styles.texteAvecLiens} style={REPONSE}>
                    {questionFinale.bouton ? (
                      <p>
                        <Link href="/contact/">{questionFinale.bouton}</Link> · {TELEPHONE}
                      </p>
                    ) : null}
                    {questionFinale.rappel ? <p>{questionFinale.rappel}</p> : null}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
