import type { CSSProperties } from "react";

import styles from "@/components/site/blocs/Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";

/**
 * Les pièces du dossier fournisseur, en liste numérotée à trois colonnes.
 * Portée de `maquette/accueil-rendu.html`, lignes 5817 à 5827.
 *
 * Composant serveur.
 *
 * UN ÉCART. Le chapeau promettait la transmission « sous 48 h ouvrées ». Le
 * contrat n'autorise aucun délai chiffré hors « rappel dans l'heure ».
 */

const LIGNE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "44px minmax(0,220px) minmax(0,1fr)",
  gap: 18,
  alignItems: "baseline",
  padding: "18px 0",
  borderTop: "1px solid var(--line)",
};

const RANG: CSSProperties = {
  font: "600 12px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
};

const TITRE_PIECE: CSSProperties = {
  font: "600 16px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const TEXTE_PIECE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
};

const PIECES: readonly { rang: string; titre: string; texte: string }[] = [
  {
    rang: "01",
    titre: "Attestations d’habilitation",
    // Le tiret cadratin de la maquette devient une virgule : interdit de copie.
    texte:
      "CACES 486 et 489, habilitations électriques B1V à BR, travail en hauteur, risques chimiques, par intervenant affecté à votre site.",
  },
  {
    rang: "02",
    titre: "Plan de prévention",
    texte:
      "Rédigé avant chaque intervention, analyse des risques et coactivité comprises.",
  },
  {
    rang: "03",
    titre: "Évaluation EcoVadis",
    texte: "Score et fiche de synthèse de notre dernière évaluation.",
  },
  {
    rang: "04",
    titre: "Attestations sociales et fiscales",
    texte:
      "URSSAF, vigilance, assurance responsabilité civile professionnelle et décennale.",
  },
  {
    rang: "05",
    titre: "Registre des déchets",
    texte:
      "Bordereaux de suivi pour les déchets issus de nos interventions sur votre site.",
  },
];

export default function PiecesFournisseur() {
  return (
    <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="" style={{ ...VERRE, padding: "40px 44px 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 26,
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <div style={{ ...SURTITRE, marginBottom: 14 }}>
                Ce que nous vous transmettons
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(24px,2.6vw,36px) * var(--ts))/1.1 var(--ft)",
                  letterSpacing: "-.038em",
                  color: "var(--ink)",
                  margin: "0 0 10px",
                  textWrap: "balance",
                }}
              >
                Les pièces pour votre dossier fournisseur
              </h2>
              <p
                style={{
                  font: "400 15.5px/1.65 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                }}
              >
                Sur simple demande au chargé d’affaires.
              </p>
            </div>
            <a
              className={styles.boutonAction}
              href={ANCRE_FORMULAIRE}
              style={BOUTON_ACTION}
            >
              Demander les pièces
            </a>
          </div>
          <div className="mg-doclist">
            {PIECES.map((piece) => (
              <div key={piece.rang} className="mg-rq2" style={LIGNE}>
                <span style={RANG}>{piece.rang}</span>
                <span style={TITRE_PIECE}>{piece.titre}</span>
                <span style={TEXTE_PIECE}>{piece.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
