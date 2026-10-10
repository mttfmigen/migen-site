import { useId, type CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import type { SectionObjections } from "@/types/contenu";

import styles from "./PageVille.module.css";

/**
 * « 09 Questions » du gabarit 04 Ville, relevé le 08/10 sur
 * `maquette/rendu/implantations--lyon.html` et `…-angers.html` : la grille
 * `mg-faqph` (carte sombre à photo, posée par `PageVille.module.css`), titre
 * et bouton « Poser ma question » à gauche, les questions en une colonne de
 * `<details>` en verre à droite, la première ouverte.
 *
 * Pourquoi pas `offres/QuestionsPhoto` : c'est la FAQ du hub `/offres/`, dont
 * la capture pose un H2 à 36px, des questions en Poppins 400 et aucune
 * largeur de réponse. La capture des villes écrit 48px/1.06 et 14ch, des
 * questions en 600 var(--ft), des réponses à 68ch.
 *
 * README : une seule question ouverte à la fois. Accordéon exclusif natif,
 * `name` tiré de `useId`, comme `offre/QuestionsOffre.tsx` : clavier,
 * lecteurs d'écran et texte lisible par Google, sans script.
 *
 * Le `position: sticky` de la colonne gauche n'est pas repris : la règle
 * `.mg-faqph [style*="sticky"]` de la maquette l'annule toujours.
 *
 * LA QUESTION ET LA RÉPONSE PASSENT PAR `TexteRiche` DEPUIS LE 09/10.
 * TROUVÉ EN MESURANT, PAS DANS LE DIAGNOSTIC : la chasse au Markdown brut du
 * 09/10 ne nommait que `offre/QuestionsOffre.tsx` et `offres/QuestionsPhoto.tsx`,
 * mais le balayage des 248 pages servies a trouvé
 * « **Nous avons déjà un prestataire sous contrat.** » sur `/implantations/`,
 * que cette FAQ sert (classe `PageVille-module…__plus` dans le HTML servi).
 * Trois composants rendaient donc le corpus brut, pas deux. ÉCART ASSUMÉ À LA
 * MAQUETTE, qui affiche elle-même les astérisques.
 */

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
  gap: 52,
  alignItems: "start",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--sur-acc)",
  margin: "0 0 22px",
  textWrap: "balance",
  maxWidth: "14ch",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  /* `#fff` donnait 2,56:1 sur l'orange, `--ink` donne 6,72:1. */
  color: "var(--ink)",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
  transition: "filter var(--tr),transform var(--tr)",
};

const PLI: CSSProperties = { ...VERRE, borderRadius: "var(--rad-s)" };

const RESUME: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  padding: "20px 24px",
};

const QUESTION: CSSProperties = {
  font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
  letterSpacing: "-.022em",
  color: "var(--ink)",
};

const PLUS: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 999,
  flex: "none",
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

export default function QuestionsVille({ section }: { section: SectionObjections }) {
  const groupe = useId();
  if (section.questions.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className={`mg-r2 ${styles.faqPhoto}`} style={GRILLE}>
          <div>
            <div style={SURTITRE}>Questions fréquentes</div>
            <h2 style={TITRE}>Vos questions avant de nous appeler</h2>
            {/* `#mgx-form` : l'ancre de l'appel final, celle de la capture. */}
            <a href="#mgx-form" className={stylesOffre.boutonPrincipal} style={BOUTON}>
              Poser ma question
            </a>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {section.questions.map((q, rang) => (
              <details key={q.question} className={styles.pli} style={PLI} name={groupe} open={rang === 0}>
                <summary style={RESUME}>
                  <span className={styles.texteAvecLiens} style={QUESTION}>
                    <TexteRiche texte={q.question} />
                  </span>
                  <span aria-hidden="true" className={styles.plus} style={PLUS}>
                    +
                  </span>
                </summary>
                {q.reponse ? (
                  <div className={styles.texteAvecLiens} style={REPONSE}>
                    <TexteRiche texte={q.reponse} />
                  </div>
                ) : null}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
