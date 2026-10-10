import { useId, type CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Question, SectionObjections } from "@/types/contenu";

import { numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « 09 Questions » de la capture (`maquette/rendu/offres--residence.html`) :
 * surtitre « Questions fréquentes », H2 « Vos questions avant de nous
 * appeler », chapeau fixe, puis les questions du corpus repliées en deux
 * colonnes : 01/03/05 à gauche, 02/04/06 à droite, chacune avec son « + ».
 *
 * `blocs/Objections.tsx` n'est pas touché : il sert le gabarit de vente.
 *
 * LA QUESTION ET LA RÉPONSE PASSENT PAR `TexteRiche` DEPUIS LE 09/10, comme
 * `blocs/Objections.tsx` le fait déjà. Avant, elles étaient rendues telles
 * quelles, et le Markdown du corpus s'affichait au visiteur : c'est le défaut
 * « plusieurs FAQ affichent du Markdown brut » de l'audit de Nathan Jorez du
 * 09/10. ÉCART ASSUMÉ À LA MAQUETTE : elle montre elle-même les crochets
 * (relevé dans `maquette/rendu/`), ce qui est précisément ce que l'audit
 * refuse. Le texte visible perd la syntaxe et rien d'autre, et les sept liens
 * du cocon écrits dans ces réponses redeviennent des liens.
 */

export interface ProprietesQuestionsOffre {
  section: SectionObjections;
}

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
  gap: "24px 56px",
  alignItems: "end",
  marginBottom: 30,
};

/* Relevé maquette (07/10, trois pages concordantes) : le H2 de la FAQ a le
   MÊME corps que « Nos références » (`ReferencesOffre.tsx`), cap mesurée 30 px
   à 1280, soit ~42-43 px de corps. L'ancien clamp plafonné à 42px cassait la
   ligne un mot plus tôt que la maquette. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "18ch",
};

const CHAPEAU: CSSProperties = {
  font: "400 16px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "46ch",
};

/** La pastille orange de la maquette, relevée sur la capture (classe `scp3`). */
const BOUTON: CSSProperties = {
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
  justifySelf: "start",
};

const PLI: CSSProperties = {
  ...VERRE,
  borderRadius: 22,
};

const RESUME: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "20px 22px",
};

const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  flex: "0 0 auto",
};

const QUESTION: CSSProperties = {
  flex: "1 1 0%",
  font: "600 16px/1.4 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const PLUS: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  /* Relevé maquette (/bureau-etudes/mise-en-conformite-machine/, 07/10) :
     pastille 30x30 ronde fond var(--chip), « + » en 400 20px/1 var(--fb)
     couleur var(--ink2) ; à l'ouverture le fond passe var(--acc), rond. */
  font: "400 20px/1 var(--fb)",
  transition: "transform var(--tr),background var(--tr)",
};

const REPONSE: CSSProperties = {
  font: "400 14.5px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  padding: "0 22px 22px 51px",
};

function Pli({
  question,
  rang,
  groupe,
}: {
  question: Question;
  rang: number;
  groupe: string;
}) {
  /* Relevé maquette (sept pages concordantes, 07/10) : la PREMIÈRE question
     est dépliée au chargement, réponse visible, croix sur pastille orange.
     Le site chargeait tout fermé. */
  return (
    <details
      className={styles.pliQuestion}
      style={PLI}
      open={rang === 0}
      name={groupe}
    >
      <summary style={RESUME}>
        <span style={NUMERO}>{numerote(rang)}</span>
        <span className={styles.texteAvecLiens} style={QUESTION}>
          <TexteRiche texte={question.question} />
        </span>
        <span aria-hidden="true" className={styles.pliPlus} style={PLUS}>
          +
        </span>
      </summary>
      {/* `texteAvecLiens` rend le soulignement que `app/globals.css` retire :
          un lien dans un paragraphe doit rester identifiable sans la couleur
          (WCAG 1.4.1), même règle que `PointsOffre` et `DerouleOffre`. */}
      <p className={styles.texteAvecLiens} style={REPONSE}>
        <TexteRiche texte={question.reponse} />
      </p>
    </details>
  );
}

export default function QuestionsOffre({ section }: ProprietesQuestionsOffre) {
  // La capture répartit la numérotation en zigzag : 01/03/05 à gauche,
  // 02/04/06 à droite, l'ordre de lecture du corpus restant l'ordre visuel.
  const gauche = section.questions.filter((_, i) => i % 2 === 0);
  const droite = section.questions.filter((_, i) => i % 2 === 1);
  // README : une seule question ouverte à la fois. Accordéon exclusif natif,
  // `name` partagé par les deux colonnes, unique par instance.
  const groupe = useId();

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              Questions fréquentes
            </div>
            <h2 style={TITRE}>Vos questions avant de nous appeler</h2>
          </div>
          {section.chapeau ? (
            <p style={CHAPEAU}>{section.chapeau}</p>
          ) : (
            // `#mgx-form` est l'ancre du formulaire, celle que porte la
            // maquette. Le lien n'ouvre rien, il descend sur le panneau déjà
            // présent dans la page : pas de script, pas de piège au clavier.
            <a href="#mgx-form" style={BOUTON}>
              Poser ma question
            </a>
          )}
        </div>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            {gauche.map((question, i) => (
              <Pli
                key={question.question}
                question={question}
                rang={i * 2}
                groupe={groupe}
              />
            ))}
          </div>
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            {droite.map((question, i) => (
              <Pli
                key={question.question}
                question={question}
                rang={i * 2 + 1}
                groupe={groupe}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
