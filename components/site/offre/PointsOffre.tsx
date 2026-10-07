import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, TITRE2 } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionOffre } from "@/types/contenu";

import { fusionneLigne, numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « 04 Offre » de la capture (`maquette/rendu/offres--residence.html`) :
 * surtitre « L'offre », H2 « Ce que nous faisons, et ce que ça change pour
 * vous », compteur « 7 points », puis un rail horizontal de cartes numérotées
 * qui fusionnent les deux colonnes du tableau du corpus.
 *
 * `blocs/Offre.tsx` n'est pas touché : il sert le gabarit de vente. TROU
 * SIGNALÉ : la capture ne rend pas le paragraphe de prose du corpus (« Pour
 * trancher sans précipitation… », deux liens internes) ; il n'est donc pas
 * rendu ici non plus, conformément à la référence.
 */

export interface ProprietesPointsOffre {
  section: SectionOffre;
}

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 30,
};

const COMPTEUR: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
  margin: "-8px 0 14px",
  font: "500 13px var(--fb)",
  color: "var(--ink3)",
};

const RAIL: CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(260px,300px)",
  gap: 12,
  overflowX: "auto",
  padding: "2px 2px 14px",
  WebkitMaskImage:
    "linear-gradient(to right,#000 calc(100% - 60px),transparent)",
  maskImage: "linear-gradient(to right,#000 calc(100% - 60px),transparent)",
};

const CARTE: CSSProperties = {
  scrollSnapAlign: "start",
  borderRadius: 22,
  padding: "20px 20px 22px",
  display: "grid",
  gridTemplateColumns: "26px minmax(0,1fr)",
  columnGap: 8,
  alignItems: "baseline",
  alignContent: "start",
  background: "rgba(255,255,255,var(--gl-a))",
  border: "1px solid var(--gbd)",
  boxShadow: "0 18px 40px -30px rgba(0,0,0,.3)",
};

const NUMERO: CSSProperties = {
  gridArea: "1 / 1",
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
};

const INTITULE: CSSProperties = {
  gridArea: "1 / 2",
  font: "600 15px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 6,
  color: "var(--ink)",
};

const PARAGRAPHE: CSSProperties = {
  gridColumn: 2,
  font: "400 13.5px/1.5 var(--fb)",
  margin: "4px 0 6px",
  color: "var(--ink2)",
};

export default function PointsOffre({ section }: ProprietesPointsOffre) {
  const points = section.lignes.map(fusionneLigne);

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>L’offre</div>
            <h2 style={TITRE2}>
              Ce que nous faisons, et ce que ça change pour vous
            </h2>
          </div>
        </div>
        <div style={COMPTEUR}>
          <span>{points.length} points</span>
        </div>
        {/* La classe `g3-offrail` branche le rail sur le moteur d'auto-
            défilement de `Moteurs.tsx` (0,45 px par image), comme dans la
            maquette : sans elle, le rail du site restait immobile là où celui
            de la capture défile seul. */}
        <div className="g3-offrail" style={RAIL}>
          {points.map((point, rang) => (
            <div key={point.titre} style={CARTE}>
              <span style={NUMERO}>{numerote(rang)}</span>
              {/* L'INTITULÉ AUSSI PASSE PAR `TexteRiche`, même raison et même
                  arbitrage que le bénéfice ci-dessous. RELEVÉ LE 07/10 en
                  portant `/offres/chantier/transfert-de-production/`, dont la
                  quatrième carte affichait à l'écran
                  « [Déménagement de machines industrielles](/offres/chantier/demenagement-machines/) »,
                  crochets et chemin compris. La porte G17 ne le voyait pas :
                  elle cherche la phrase de la référence DANS le texte servi,
                  et le libellé en est un morceau. Dix intitulés de ce type
                  dans `supabase/import/gabarits-maquette/` (retrofit, chantier,
                  périmètre complet), donc la correction est ici et non dans une
                  donnée. Le texte visible est inchangé, seule la syntaxe
                  disparaît. */}
              <div className={styles.texteAvecLiens} style={INTITULE}>
                <TexteRiche texte={point.titre} />
              </div>
              <p className={styles.texteAvecLiens} style={PARAGRAPHE}>
                {point.complement ? <span>{point.complement} </span> : null}
                {/* LE BÉNÉFICE PASSE PAR `TexteRiche`, et c'est le maillage
                    du cocon qui l'exige : le corpus écrit ses liens internes
                    dedans (« dans le cadre d'un [transfert
                    industriel](/travaux-industriels/transfert-industriel/) »,
                    trois liens sur `/travaux-industriels/levage-manutention/`
                    seul). Rendu brut, ce texte affichait ses crochets et le
                    cocon perdait ses liens. Le TEXTE VISIBLE est inchangé, donc
                    la porte G17 lit la même phrase : sur les pages dont le
                    bénéfice ne porte aucun lien (la pilote comprise), le rendu
                    est identique au caractère près. Même arbitrage que
                    `DerouleOffre`, qui garde ses liens là où la capture écrit
                    du texte en clair. */}
                <span style={{ color: "var(--ink)" }}>
                  <TexteRiche texte={point.benefice} />
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
