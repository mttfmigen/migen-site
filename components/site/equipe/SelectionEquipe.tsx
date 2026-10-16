import { accrocheDe } from "@/components/site/blocs/resume-de-section";
import type { EntreeSommaire } from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import ouvertes from "@/components/site/nous-connaitre/mobile-cartes-ouvertes.module.css";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

import { ETAPES_SELECTION } from "./equipe-donnees";
import {
  LARGEUR,
  SECTION,
  SURTITRE,
  TEXTE_CARTE,
  TITRE_CARTE,
  VERRE,
} from "./habillage-equipe";

/**
 * « Comment ces personnes sont choisies » : le panneau sombre avec le taux de
 * passage, et les trois étapes à droite. Maquette lignes 5939 à 5945.
 */
/* Écrits une fois : l'en-tête de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Comment ces personnes sont choisies";
const TITRE_TEXTE = "La qualité se décide au recrutement.";
/* Le chapô, écrit une fois : le paragraphe de bureau et, derrière le titre,
   l'accroche de la carte fermée du téléphone (maquette V3 du 16/10 : une
   carte fermée montre le début de son texte, `accrocheDe`). */
const CHAPO =
  "Bien avant l’arrivée sur votre site. Notre sélection tient en trois étapes, et en un chiffre.";

/** Carte 04 du téléphone : son numéro suit l'ordre de la maquette (`rang`). */
export const SOMMAIRE_SELECTION: EntreeSommaire = { id: "selection", titre: SURTITRE_TEXTE };

export default function SelectionEquipe() {
  return (
    <SectionRepliee
      id={SOMMAIRE_SELECTION.id}
      rang={4}
      /* MAQUETTE V3 DU 16/10 : la carte du téléphone porte le nom de la
         section seul (« Comment ces personnes sont choisies »), sa phrase clé passe en accroche, carte
         fermée, et en tête du corps, carte ouverte (`.phraseCleV3`). */
      titre={SURTITRE_TEXTE}
      resume={accrocheDe([{ paragraphe: `${TITRE_TEXTE} ${CHAPO}` }])}
    >
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)",
              gap: 44,
              alignItems: "stretch",
            }}
          >
            {/* Au téléphone, la maquette V3 écrit ce panneau en texte clair
                avant la frise : le panneau sombre s'efface (`.aplat`), son
                halo aussi (`.decor`), le texte passe à l'encre de la page et
                le « 10 % » suit le chapô en texte courant (`.pile`,
                `.chiffreEnLigne`). */}
            <div
              className={`${mobile.aplat} ${ouvertes.pile}`}
              style={{
                borderRadius: "var(--rad)",
                background: "var(--panel)",
                padding: 34,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 26,
              }}
            >
              <div
                aria-hidden="true"
                className={mobile.decor}
                style={{
                  position: "absolute",
                  width: 380,
                  height: 380,
                  right: -160,
                  bottom: -200,
                  background:
                    "radial-gradient(circle,rgba(255,124,60,.3),transparent 68%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div data-titre-bureau="" style={SURTITRE}>
                  {SURTITRE_TEXTE}
                </div>
                <h2
                  className={mobile.phraseCleV3}
                  style={{
                    font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
                    letterSpacing: "-.04em",
                    color: "#fff",
                    margin: "0 0 14px",
                    maxWidth: "18ch",
                  }}
                >
                  {TITRE_TEXTE}
                </h2>
                <p
                  data-mm-texte=""
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "rgba(255,255,255,.64)",
                    margin: 0,
                  }}
                >
                  {CHAPO}
                </p>
              </div>
              <p
                className={ouvertes.chiffreEnLigne}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  margin: 0,
                }}
              >
                <span
                  style={{
                    font: "600 64px/1 var(--ft)",
                    letterSpacing: "-.06em",
                    color: "var(--acc)",
                  }}
                >
                  10&nbsp;%
                </span>{" "}
                <span
                  style={{
                    font: "400 14.5px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.7)",
                  }}
                >
                  des techniciens sont retenus
                </span>
              </p>
            </div>
            {/* Au téléphone, les trois étapes en frise de la maquette V3
                (`.friseV3`) : pastille orange pâle, filet, titre, texte. */}
            <ol
              className={mobile.friseV3}
              style={{
                display: "grid", gridTemplateColumns: "minmax(0,1fr)",
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {ETAPES_SELECTION.map((etape) => (
                <li
                  key={etape.rang}
                  style={{
                    ...VERRE,
                    padding: "22px 26px",
                    display: "grid",
                    gridTemplateColumns: "44px minmax(0,1fr)",
                    gap: 18,
                    alignItems: "start",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "var(--acc-w)",
                      color: "var(--acc)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      font: "600 13px ui-monospace,Menlo,monospace",
                    }}
                  >
                    {etape.rang}
                  </span>
                  <div>
                    <div style={{ ...TITRE_CARTE, marginBottom: 6 }}>
                      {etape.titre}
                    </div>
                    <div style={TEXTE_CARTE}>{etape.texte}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
