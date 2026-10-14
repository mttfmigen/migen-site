import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, TITRE2 } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionOffre } from "@/types/contenu";

import { fusionneLigne, numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/**
 * Section « 04 Offre » de la capture (`maquette/rendu/offres--residence.html`) :
 * surtitre « L'offre », H2 « Ce que nous faisons, et ce que ça change pour
 * vous », compteur « 7 points », puis un rail horizontal de cartes numérotées
 * qui fusionnent les deux colonnes du tableau du corpus.
 *
 * `blocs/Offre.tsx` n'est pas touché : il sert le gabarit de vente.
 *
 * LA PROSE DU CORPUS EST RENDUE SOUS 881 PX SEULEMENT (14/10). La capture de
 * BUREAU ne rend pas le paragraphe qui suit le tableau (« Pour trancher sans
 * précipitation… ») : c'était le TROU SIGNALÉ de ce fichier, et au-dessus de
 * 880 px rien ne change. La maquette MOBILE v2, elle, rend chaque bloc de la
 * section (dc.html, `blocks: B` de la section détaillée), et sa règle première
 * est « replier, jamais retirer » : trois fiches portent cette prose
 * (`offres-residence`, `offres-maintenance-externalisee`,
 * `offres-depannage-industriel`), avec leurs liens de cocon. Elle est donc
 * servie, marquée `data-mobile-seulement`.
 */

export interface ProprietesPointsOffre {
  section: SectionOffre;
  /**
   * Reste déplié au téléphone : la maquette mobile v2 garde la PREMIÈRE
   * section de contenu de la page ouverte (dc.html L451 et L476). C'est le
   * gabarit qui sait laquelle, pas ce bloc.
   */
  toujoursOuvert?: boolean;
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

/**
 * L'ÉTIQUETTE DE LA BASCULE : des `<span>`, et c'est voulu.
 *
 * MOTIF DE RÉFÉRENCE, déjà appliqué et vérifié sur le gabarit métier
 * (`components/site/metier/PageFicheMetier.tsx`, mêmes deux constantes).
 * Recopié ici À L'IDENTIQUE, comme dans `ReferencesOffre.tsx` : les deux
 * blocs sont partagés par les gabarits offre, ville, spécialité, domaine et
 * secteur, et chacun porte son étiquette à côté de son propre en-tête.
 *
 * CE QU'ELLE RÉPARE, mesuré le 12/10 sur les 131 pages de ces cinq gabarits
 * qui ont une capture : le `<h2>` posé dans la bascule emportait avec lui
 * TOUTE la rangée de grille de la capture (tpl 518, `1.1fr 0.9fr`), 123 fois.
 * Un `<span>` à la place du `<h2>` aurait été l'autre faute, symétrique :
 * le titre quitte alors la structure du document. Ici le `<h2>` reste dans sa
 * cellule, et l'étiquette n'existe que sous 880 px.
 */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libellé de la bascule, à l'échelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

const PARAGRAPHE: CSSProperties = {
  gridColumn: 2,
  font: "400 13.5px/1.5 var(--fb)",
  margin: "4px 0 6px",
  color: "var(--ink2)",
};

/* La prose mobile, au corps de paragraphe de la maquette mobile v2
   (dc.html, `pf: "400 var(--pfs)/1.65 var(--fb)"`, `--pfs` 15px). Elle ne se
   voit que sous 881 px : aucune valeur ici ne touche le bureau. */
const PROSE_MOBILE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "14px 0 0",
  maxWidth: "64ch",
};

export default function PointsOffre({
  section,
  toujoursOuvert = false,
}: ProprietesPointsOffre) {
  const points = section.lignes.map(fusionneLigne);

  return (
    <section style={SECTION}>
      <div className={styles.blocPliablePartage} style={LARGEUR}>
        {/* SE REPLIE AU TÉLÉPHONE, motif « Blocs communs (pliables) » de la
            maquette mobile. Ce bloc est servi par les gabarits offre, ville,
            spécialité, domaine et secteur : le replier ici les sert tous.
            LA BASCULE PORTE UNE ÉTIQUETTE, PAS LE TITRE : le surtitre et le
            `<h2>` de la capture restent dans leur cellule de grille ci-dessous
            (tpl 518 à 521) ; le compteur « N points » reste dans le corps, il
            appartient au contenu. Au-dessus de 880 px la bascule entière est
            retirée, elle ne laisse donc aucun arrêt de tabulation muet. */}
        <SectionPliableMobile
          toujoursOuvert={toujoursOuvert}
          enTete={
            <span data-mobile-seulement="" className={styles.etiquettePli}>
              <span style={ETIQUETTE_SURTITRE}>L’offre</span>
              <span style={ETIQUETTE_TITRE}>
                Ce que nous faisons, et ce que ça change pour vous
              </span>
            </span>
          }
          resume={points.map((point) => point.titre).filter(Boolean).join(" · ")}
        >
        {/* LA RANGÉE D'EN-TÊTE DE LA CAPTURE, `1.1fr 0.9fr`, ET SES DEUX
            ENFANTS. Le titre à gauche, le compteur à droite.

            CE QUI N'ALLAIT PAS, et Mehdi l'a signalé deux fois, « le bloc est
            clairement mal disposé » sur bureau d'études puis sur travaux
            industriels : le compteur était rendu À L'EXTÉRIEUR de la grille.
            Elle déclarait donc deux pistes pour UN seul enfant, et la moitié
            droite restait vide, sur tous les gabarits qui partagent ce bloc,
            soit plus de cent pages.

            Le commentaire de portage affirmait « dont seule la colonne de
            gauche est remplie ». C'était faux, et personne ne l'avait relu
            contre la capture : `maquette/rendu/offres--bureau-etudes.html`
            écrit bien « L'offre », le titre, PUIS « 6 points » dans la même
            grille. Une hypothèse écrite en commentaire a survécu plus
            longtemps qu'elle n'aurait dû.

            `mg-r2` fait tomber la grille en une seule colonne sous 900 px,
            comme dans la maquette. */}
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>L’offre</div>
            <h2 style={TITRE2}>
              Ce que nous faisons, et ce que ça change pour vous
            </h2>
          </div>
          <div style={COMPTEUR}>
            {/* Comme la maquette : le nombre interpolé dans sa propre balise. */}
            <span>
              <span>{points.length}</span> points
            </span>
          </div>
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
                {/* LE COMPLÉMENT AUSSI, DEPUIS LE 09/10. Il était le seul des
                    trois champs de la carte à être rendu brut, alors que
                    l'intitulé et le bénéfice passaient déjà par `TexteRiche` :
                    sur `/offres/depannage-industriel/`, la quatrième carte
                    affichait « Voir l'[astreinte de
                    maintenance](/offres/depannage-industriel/astreinte/). »,
                    crochets et chemin compris (audit de Nathan Jorez, 09/10 ;
                    le champ est `sections[1].lignes[3].prestation.texte`, rendu
                    ici par `fusionneLigne`). 85 champs de ce type dans les
                    fiches portent du Markdown, la correction est donc ici et
                    non dans une donnée. Le texte visible perd la syntaxe et
                    rien d'autre. */}
                {point.complement ? (
                  <span>
                    <TexteRiche texte={point.complement} />{" "}
                  </span>
                ) : null}
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
        {/* LA PROSE DU CORPUS, APRÈS LES CARTES, SOUS 881 PX SEULEMENT.
            La maquette mobile v2 rend chaque bloc de la section, prose et
            liens de cocon compris ; la capture de bureau ne la rend pas, et
            au-dessus de 880 px rien ne change (voir l'en-tête du fichier).
            Chaque mot vient de `section.prose`, accroche en gras d'attaque
            comme partout où le corpus l'écrit. */}
        {section.prose?.length ? (
          <div data-mobile-seulement="">
            {section.prose.map((paragraphe) => (
              <p
                key={paragraphe.texte}
                className={styles.texteAvecLiens}
                style={PROSE_MOBILE}
              >
                {paragraphe.accroche ? (
                  <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {paragraphe.accroche}{" "}
                  </strong>
                ) : null}
                <TexteRiche texte={paragraphe.texte} />
              </p>
            ))}
          </div>
        ) : null}
        </SectionPliableMobile>
      </div>
    </section>
  );
}
