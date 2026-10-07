import type { CSSProperties } from "react";

import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { LienOffre } from "@/types/offre";

import { cibleSure } from "./LiensOffre";
import styles from "./PageOffre.module.css";

/**
 * Section « 07 Appel » de la capture (`maquette/rendu/offres--residence.html`) :
 * la bande-question autonome entre les garanties et les références. La question
 * vient du corpus (`brefBande` du relais), la sous-ligne « Rappel dans
 * l'heure. » est le texte fixe du gabarit, le bouton vise le panneau du héros.
 *
 * LA SOUS-LIGNE EST DEVENUE UNE DONNÉE LE 07/10, et elle garde sa valeur d'avant
 * quand la page n'en fournit pas : les SOUS-pages du gabarit 03 y écrivent autre
 * chose. Relevé sur `maquette/rendu/offres--retrofit--remise-en-etat.html`
 * (bloc 706) : « Faire expertiser ma machine Un chargé d'affaires vous rappelle
 * dans l'heure et organise l'état des lieux. » La maquette y recolle elle-même
 * le libellé du bouton devant sa mention ; c'est son rendu, et la référence fait
 * foi (décision de Mehdi du 05/10, un synonyme est une faute).
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : la prop est optionnelle
 * et son défaut est le texte d'avant, donc les pages qui ne la passent pas
 * rendent exactement ce qu'elles rendaient.
 */

export interface ProprietesAppelOffre {
  question: string;
  bouton?: LienOffre;
  /** La sous-ligne. Absente, c'est « Rappel dans l'heure. » de la page pilote. */
  mention?: string;
}

const BANDE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 26,
  flexWrap: "wrap",
  padding: "34px 34px 34px 42px",
  borderRadius: 36,
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

const QUESTION: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.22 var(--ft)",
  letterSpacing: "-.034em",
  marginBottom: 10,
  maxWidth: "32ch",
  textWrap: "balance",
};

const SOUS_LIGNE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export default function AppelOffre({
  question,
  bouton,
  mention,
}: ProprietesAppelOffre) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={BANDE}>
          <div style={{ flex: "1 1 0%", minWidth: 280 }}>
            <div style={QUESTION}>
              <TexteRiche texte={question} />
            </div>
            <div style={SOUS_LIGNE}>{mention ?? "Rappel dans l’heure."}</div>
          </div>
          {bouton?.libelle && bouton.href && cibleSure(bouton.href) ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={bouton.href}
                className={styles.boutonPrincipal}
                style={BOUTON}
              >
                {bouton.libelle}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
