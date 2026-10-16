import { accrocheDe } from "@/components/site/blocs/resume-de-section";
import type { EntreeSommaire } from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

import { ENGAGEMENTS } from "./equipe-donnees";
import { LARGEUR, SECTION, SURTITRE, TEXTE_CARTE, TITRE2, VERRE } from "./habillage-equipe";

/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Nos engagements";
const TITRE_TEXTE = "Des engagements tenus, vérifiables mission après mission.";

/** Carte 06 du téléphone : son numéro suit l'ordre de la maquette (`rang`). */
export const SOMMAIRE_ENGAGEMENTS: EntreeSommaire = { id: "engagements", titre: SURTITRE_TEXTE };

/** « Nos engagements », trois cartes numérotées. Maquette lignes 5954 à 5955. */
export default function EngagementsEquipe() {
  return (
    <SectionRepliee
      id={SOMMAIRE_ENGAGEMENTS.id}
      rang={6}
      /* MAQUETTE V3 DU 16/10 : la carte du téléphone porte le nom de la
         section seul (« Nos engagements »), sa phrase clé passe en accroche, carte
         fermée, et en tête du corps, carte ouverte (`.phraseCleV3`). */
      titre={SURTITRE_TEXTE}
      resume={accrocheDe([{ paragraphe: TITRE_TEXTE }])}
    >
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div data-titre-bureau="" style={SURTITRE}>
            {SURTITRE_TEXTE}
          </div>
          <h2 className={mobile.phraseCleV3} style={{ ...TITRE2, maxWidth: "26ch" }}>
            {TITRE_TEXTE}
          </h2>
          {/* Au téléphone, les petites cartes « Libellé : texte » de la
              maquette V3 (`data-mm-kv`, app/globals.css) : fond doux, numéro
              à gauche ; le filet de bureau s'efface (`.decor`). */}
          <ol
            data-mm-kv=""
            className="mg-rmulti"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 12,
              marginTop: 10,
              marginBottom: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {ENGAGEMENTS.map((engagement) => (
              <li
                key={engagement.rang}
                style={{ ...VERRE, padding: "26px 26px 28px" }}
              >
                <div
                  data-mm-num=""
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      font: "600 11px ui-monospace,Menlo,monospace",
                      color: "var(--acc)",
                    }}
                  >
                    {engagement.rang}
                  </span>
                  <span
                    aria-hidden="true"
                    className={mobile.decor}
                    style={{ flex: 1, height: 1, background: "var(--line)" }}
                  />
                </div>
                <h3
                  data-mm-kv-titre=""
                  style={{
                    font: "600 18px/1.3 var(--ft)",
                    letterSpacing: "-.022em",
                    margin: "0 0 8px",
                  }}
                >
                  {engagement.titre}
                </h3>
                <div data-mm-kv-texte="" style={TEXTE_CARTE}>
                  {engagement.texte}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
