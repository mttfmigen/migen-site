import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionDeroule } from "@/types/contenu";

import { majusculeInitiale, numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";
import { continueLeTitre } from "../blocs/TitreEtSuite";

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
  color: "var(--sur-acc)",
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
  /* L'orange de marque ne bouge pas, l'encre posée dessus oui : le `#fff` de
     la maquette donnait 2,56:1, `--ink` donne 6,72:1 (WCAG 1.4.3, 4,5:1). */
  color: "var(--sur-acc)",
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
  /* Le fond teinté reste l'orange de marque à 11 %. Le chiffre posé dessus
     passe à l'encre orange : `--acc` donnait 2,22:1, `--acc-ink` donne
     7,75:1 sur ce même fond (mesuré, thème clair comme sombre). */
  background: "var(--acc-w)",
  color: "var(--acc-ink)",
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
  // La grille SE DÉDUIT DU NOMBRE D'ÉTAPES, relevé sur les 15 captures du
  // gabarit 03 (08/10) : 3 colonnes jusqu'à 6 étapes, 4 au-delà ; la carte
  // d'en-tête comble la rangée, donc pleine largeur quand les étapes tombent
  // juste (6 sur 3, 8 sur 4), une seule cellule sinon (5 sur 3, 7 sur 4). La
  // variante « tuiles » de la donnée (4 colonnes, en-tête d'une cellule) en
  // est le cas à 7 étapes.
  const n = section.etapes.length;
  const colonnes = n <= 6 ? 3 : 4;
  const tuiles = n % colonnes !== 0;
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${colonnes},minmax(0,1fr))`,
            gap: 14,
          }}
        >
          <div
            style={
              tuiles
                ? { ...CARTE_ENTETE, gridColumn: "auto", minHeight: 0 }
                : CARTE_ENTETE
            }
          >
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
                    /* Sur le fond teinté de la section : 2,08:1 en `--acc`,
                       7,28:1 en `--acc-ink`. */
                    color: "var(--acc-ink)",
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
              {/* LE TEXTE CONTINUE PARFOIS LA PHRASE DU TITRE, et il se rendait
                  alors sur une deuxième ligne ouverte par une virgule :
                  « Un technicien vous rappelle dans l'heure » puis « , du lundi
                  au vendredi de 8h00 à 18h30. ». Le corpus en fait UNE phrase,
                  son début en gras. Défaut signalé par Mehdi le 09/10, 7 étapes
                  des gabarits Spécialité et Domaine.
                  `majusculeInitiale` ne s'applique PAS dans ce cas : la suite
                  reprend au milieu d'une phrase, la majuscule y serait une
                  faute. `TitreEtSuite` n'est pas employé ici parce que le texte
                  passe par `TexteRiche` (liens du corpus), qui rend des nœuds
                  et non une chaîne ; la règle de lecture est la même, et c'est
                  `continueLeTitre` qui la porte.
                  Porte : scripts/verifie-suites-de-titre.mjs */}
              {etape.texte && continueLeTitre(etape.texte) ? (
                <p className={styles.texteAvecLiens} style={TEXTE_ETAPE}>
                  <span style={{ ...TITRE_ETAPE, display: "inline" }}>{etape.titre}</span>
                  <TexteRiche texte={etape.texte} />
                </p>
              ) : (
                <>
                  <div style={TITRE_ETAPE}>{etape.titre}</div>
                  {etape.texte ? (
                    <p className={styles.texteAvecLiens} style={TEXTE_ETAPE}>
                      <TexteRiche texte={majusculeInitiale(etape.texte)} />
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
