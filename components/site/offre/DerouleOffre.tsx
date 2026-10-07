import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionDeroule } from "@/types/contenu";

import { majusculeInitiale, numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « 05 Déroulé » de la capture (`maquette/rendu/offres--residence.html`) :
 * une grille de trois colonnes dont la première rangée est une carte d'en-tête
 * orangée (surtitre « Notre méthode », H2 « Un appel. Un plan. Une ligne qui
 * repart. », compteur d'étapes, bouton « Démarrer par l'audit »), puis les
 * étapes du corpus en cartes numérotées 01 à 06.
 *
 * `blocs/Deroule.tsx` n'est pas touché : il sert le gabarit de vente.
 *
 * ÉCART CONSERVÉ, à faire arbitrer par Mehdi : l'étape 01 rend « cahier des
 * charges de maintenance » en lien vers /offres/residence/cahier-des-charges/
 * alors que la capture l'affiche en texte en clair (la maquette ne parse pas
 * le Markdown, son seul lien de section est #besoin). Ce lien est le maillage
 * du cocon, la raison d'être du corpus : il est gardé, et souligné
 * (`styles.texteAvecLiens`) pour rester identifiable sans la couleur.
 */

export interface ProprietesDerouleOffre {
  section: SectionDeroule;
  /**
   * Le H2 de la carte d'en-tête. ABSENT, c'est « Un appel. Un plan. Une ligne
   * qui repart. », le texte relevé sur la capture de la page pilote
   * `/offres/residence/`.
   *
   * AJOUTÉ LE 07/10 : la capture de `/offres/full-service/` y écrit « De la
   * cartographie des risques au pilotage par les indicateurs ». Le titre était
   * figé ici, il devient une donnée de page, à défaut inchangée : les pages
   * déjà portées ne bougent pas.
   */
  titre?: string;
}

const CARTE_ENTETE: CSSProperties = {
  gridColumn: "1 / -1",
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--rad)",
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
  padding: "30px 30px 28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: 240,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(24px,2.4vw,32px) * var(--ts))/1.12 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 20px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

const CARTE_ETAPE: CSSProperties = {
  ...VERRE,
  padding: "24px 24px 26px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
};

const BADGE: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 11,
  background: "var(--acc-w)",
  color: "var(--acc)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 12px ui-monospace,Menlo,monospace",
  flex: "0 0 auto",
};

const TITRE_ETAPE: CSSProperties = {
  font: "600 16px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const TEXTE_ETAPE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
};

export default function DerouleOffre({
  section,
  titre = "Un appel. Un plan. Une ligne qui repart.",
}: ProprietesDerouleOffre) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 14,
          }}
        >
          <div style={CARTE_ENTETE}>
            <div style={{ position: "relative" }}>
              <div style={{ ...SURTITRE, marginBottom: 14 }}>
                Notre méthode
              </div>
              <h2 style={TITRE}>{titre}</h2>
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span
                  style={{
                    font: "600 40px/1 var(--ft)",
                    letterSpacing: "-.05em",
                    color: "var(--acc)",
                  }}
                >
                  {section.etapes.length}
                </span>
                <span style={{ font: "500 13.5px var(--fb)", color: "var(--ink2)" }}>
                  étapes
                </span>
              </span>
              <a href="#besoin" className={styles.boutonPrincipal} style={BOUTON}>
                Démarrer par l’audit
              </a>
            </div>
          </div>

          {section.etapes.map((etape, rang) => (
            <div key={etape.titre} style={CARTE_ETAPE}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={BADGE}>{numerote(rang)}</span>
                <span
                  aria-hidden="true"
                  style={{ flex: "1 1 0%", height: 1, background: "var(--line)" }}
                />
              </div>
              <div style={TITRE_ETAPE}>{etape.titre}</div>
              {etape.texte ? (
                <p className={styles.texteAvecLiens} style={TEXTE_ETAPE}>
                  <TexteRiche texte={majusculeInitiale(etape.texte)} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
