import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import { resumeDe } from "@/components/site/blocs/resume-de-section";
import { PliMobile } from "@/components/site/expertises/mobile";
import ProblemeOffre from "@/components/site/offre/ProblemeOffre";
import { coupePunchline, numerote } from "@/components/site/offre/texte-offre";
import { cadragePhoto } from "@/lib/cadrage-photos";
import type { SectionProbleme } from "@/types/contenu";

import styles from "./PageDomaine.module.css";

/**
 * « 03 Problème » du gabarit domaine, dans ses TROIS dessins, relevés le 08/10
 * sur les onze captures du gabarit (`maquette/rendu/expertises--*.html`) et sur
 * leur source, `MigenExpertise.dc.html` lignes 278 à 312 (`pbCards`, `pbSplit`,
 * `pbDark`). Le dessin est une DONNÉE de la page, `section.variante` :
 *
 *   colonne (défaut)  robotique, automatisme, électromécanique, pneumatique,
 *                     soudure, tuyauterie : `ProblemeOffre`, déjà conforme aux
 *                     deux pilotes ;
 *   rangee            électrique : en-tête 1.1fr/.9fr, cartes en verre en UNE
 *                     rangée ;
 *   panneau-sombre    hydraulique, mécanique, spécialisations constructeur,
 *                     types de maintenance : panneau anthracite, grille 2x2.
 *
 * POURQUOI PAS LES VARIANTES DE `ProblemeOffre` : elles ne sont pas celles de
 * ces captures (titre en clamp(28px,3.1vw,44px) au lieu de 26/2.8/38 et
 * 26/3/42, cartes sombres à 24px 28px et rayon 18 au lieu de 22px 26px et
 * `var(--rad)`, lueur à -120/-120 au lieu de -170/-210). Ce composant est
 * partagé hors du périmètre de ce gabarit : les deux dessins sont donc recopiés
 * ICI de la source, valeur pour valeur, et le défaut lui reste délégué.
 */

export interface ProprietesProblemeDomaine {
  section: SectionProbleme;
  altPhoto: string;
  photo?: string | null;
  /**
   * Replié au téléphone. La maquette mobile ouvre la PREMIÈRE section
   * numérotée et replie les suivantes (dc.html L451, `nOpen = 1`) : le
   * problème est ouvert là où il ouvre la page, replié là où « La réponse
   * directe » le précède (les types de maintenance). Le dessin « colonne »,
   * délégué à `ProblemeOffre` (gabarit 03), se replie par SON repli sur
   * demande (`pli`) : un second pli posé par-dessus ferait un pli dans un pli.
   */
  replie?: boolean;
  /**
   * LA CARTE « LE PROBLÈME » DE LA MAQUETTE MOBILE V2, pour les trois dessins
   * (gabarits 05, 09 et le hub) : `ouvert` quand le problème ouvre la page,
   * `replie` quand une section le précède. Sans cette prop (gabarit 08
   * Secteur), rien ne change : `replie` seul garde son sens d'origine, et le
   * dessin « colonne » reste délégué à `ProblemeOffre`.
   */
  pli?: Pli;
}

export type Pli = "ouvert" | "replie";

/** La photo que le dessin « colonne » rend sur bureau, ou rien. */
function photoDuProbleme(
  section: SectionProbleme,
  photo: string | null | undefined,
): string | null {
  if (section.variante === "rangee" || section.variante === "panneau-sombre") return null;
  return photo === undefined ? PHOTO_COLONNE : photo;
}

/**
 * LE TITRE DE LA CARTE AU TÉLÉPHONE, celui de la maquette mobile v2 (« 01 Le
 * problème », titre du corpus) et celui de `offre/ProblemeOffre` : le
 * sur-titre et le titre de bureau restent dans le corps, en sur-titre et en
 * phrase clé (`data-mm-surtitre`, `data-mm-lead`, socle de `app/globals.css`).
 */
const TITRE_CARTE = "Le problème";

/** La largeur de la section, et le pli mobile quand la page le demande. */
function Cadre({
  section,
  pli,
  children,
}: {
  section: SectionProbleme;
  pli: Pli | undefined;
  children: ReactNode;
}) {
  return (
    <PliMobile
      actif={pli !== undefined}
      toujoursOuvert={pli === "ouvert"}
      style={LARGEUR}
      titre={TITRE_CARTE}
      resume={resumeDe(section.puces.map((puce) => puce.accroche ?? puce.texte))}
    >
      {children}
    </PliMobile>
  );
}

/* --------------------------- colonne (`ProblemeOffre`, gabarit 03, recopié)

   LE DESSIN « COLONNE » DE `offre/ProblemeOffre.tsx`, VALEUR POUR VALEUR,
   pour les seules pages qui demandent la carte mobile (`pli`). Recopié et non
   enveloppé : la carte de la maquette porte le titre dans sa bascule, le
   chapô et des cartes « Libellé : texte » dans son corps, et ces marques
   (`data-*`) doivent être posées sur le balisage lui-même. Au-dessus de
   880 px, le rendu est celui de `ProblemeOffre` : mêmes balises, mêmes
   styles, même photo par défaut. */

const PHOTO_COLONNE = "/assets/web/team-electric.jpg";

const TITRE_COLONNE: CSSProperties = {
  font: "600 calc(clamp(28px,3.1vw,44px) * var(--ts))/1.07 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 18px",
  maxWidth: "18ch",
  textWrap: "balance",
};

const SOUS_PHRASE_COLONNE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 22px",
  maxWidth: "40ch",
};

const CADRE_PHOTO_COLONNE: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  height: 280,
  background: "var(--ph)",
  position: "relative",
};

const CARTE_COLONNE: CSSProperties = {
  ...VERRE,
  padding: "24px 28px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

const NUMERO_COLONNE: CSSProperties = {
  font: "600 26px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "0 0 auto",
};

const ACCROCHE_COLONNE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
  color: "var(--ink)",
};

const TEXTE_COLONNE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
};

function Colonne({
  section,
  altPhoto,
  photo,
  pli,
}: {
  section: SectionProbleme;
  altPhoto: string;
  photo?: string | null;
  pli: Pli;
}) {
  const { titre, suite } = coupePunchline(section.punchline);
  const source = photoDuProbleme(section, photo);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <Cadre section={section} pli={pli}>
        <div
          className="mg-r2"
          data-entete-probleme=""
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div className="g3-sticky" style={{ position: "sticky", top: 110 }}>
            <div data-mm-surtitre="" style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            {titre ? (
              <h2 data-mm-lead="" style={TITRE_COLONNE}>
                {titre}
              </h2>
            ) : null}
            {suite ? (
              <p data-mm-texte="" style={SOUS_PHRASE_COLONNE}>
                {suite}
              </p>
            ) : null}
            {source ? (
              <div data-photo-probleme="" style={CADRE_PHOTO_COLONNE}>
                <Image
                  src={source}
                  alt={altPhoto}
                  fill
                  sizes="(max-width: 900px) 100vw, 440px"
                  style={{
                    objectFit: "cover",
                    objectPosition: cadragePhoto(source, 479 / 280),
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
              </div>
            ) : null}
          </div>
          <div
            data-mm-kv=""
            style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}
          >
            {section.puces.map((puce, rang) => (
              <div key={puce.accroche ?? puce.texte} style={CARTE_COLONNE}>
                <span data-mm-num="" style={NUMERO_COLONNE}>{numerote(rang)}</span>
                <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
                  {puce.accroche ? (
                    <div data-mm-kv-titre="" style={ACCROCHE_COLONNE}>
                      {puce.accroche}
                    </div>
                  ) : null}
                  <div data-mm-kv-texte="" style={TEXTE_COLONNE}>
                    {puce.texte}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Cadre>
    </section>
  );
}

/* ------------------------------------------- rangee (`pbCards`, l. 278-286) */

const ENTETE_RANGEE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

const TITRE_RANGEE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const SUITE_RANGEE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
};

const CARTE_RANGEE: CSSProperties = {
  ...VERRE,
  padding: "26px 24px 28px",
  display: "flex",
  flexDirection: "column",
};

const NUMERO_RANGEE: CSSProperties = {
  font: "600 24px/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  marginBottom: 18,
};

const ACCROCHE_RANGEE: CSSProperties = {
  font: "600 15px/1.35 var(--ft)",
  letterSpacing: "-.018em",
  marginBottom: 6,
  color: "var(--ink)",
};

const TEXTE_RANGEE: CSSProperties = {
  font: "400 13px/1.55 var(--fb)",
  color: "var(--ink2)",
};

/** `pbGrid` de la source : autant de colonnes que de cartes jusqu'à 5. */
function colonnes(n: number): number {
  if (n <= 5) return n;
  return n % 3 === 0 ? 3 : 4;
}

function Rangee({ section, pli }: { section: SectionProbleme; pli: Pli | undefined }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section style={SECTION}>
      <Cadre section={section} pli={pli}>
        <div className="mg-r2" data-entete-probleme="" style={ENTETE_RANGEE}>
          <div>
            <div data-mm-surtitre="" style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            <h2 data-mm-lead="" style={TITRE_RANGEE}>{titre}</h2>
          </div>
          {/* La source pose ce paragraphe même vide : il tient la seconde
              colonne de l'en-tête. */}
          <p data-mm-texte="" style={SUITE_RANGEE}>{suite}</p>
        </div>
        <div
          className={styles.grilleProbleme}
          data-mm-kv=""
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${colonnes(section.puces.length)},minmax(0,1fr))`,
            gap: 12,
          }}
        >
          {section.puces.map((puce, rang) => (
            <div key={puce.accroche ?? puce.texte} style={CARTE_RANGEE}>
              <span data-mm-num="" style={NUMERO_RANGEE}>{numerote(rang)}</span>
              <div data-mm-kv-titre="" style={ACCROCHE_RANGEE}>{puce.accroche}</div>
              <div data-mm-kv-texte="" style={TEXTE_RANGEE}>{puce.texte}</div>
            </div>
          ))}
        </div>
      </Cadre>
    </section>
  );
}

/* ----------------------------------- panneau-sombre (`pbDark`, l. 300-312) */

const PANNEAU: CSSProperties = {
  background: "var(--panel)",
  borderRadius: 40,
  padding: "52px 56px",
  position: "relative",
  overflow: "hidden",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 460,
  height: 460,
  right: -170,
  top: -210,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

const TITRE_SOMBRE: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 12px",
  maxWidth: "22ch",
  textWrap: "balance",
};

const SUITE_SOMBRE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 30px",
  maxWidth: "56ch",
};

const CARTE_SOMBRE: CSSProperties = {
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "var(--rad)",
  padding: "22px 26px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

const NUMERO_SOMBRE: CSSProperties = {
  font: "600 26px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "0 0 auto",
};

const ACCROCHE_SOMBRE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
  color: "#fff",
};

const TEXTE_SOMBRE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "rgba(255,255,255,.62)",
};

/* ÉCART VOULU, À 390 PX : la maquette garde ici deux colonnes
   (`[data-screen-label="03 Problème"] .mg-rmulti`, sous 900 px, bat la règle
   d'une colonne sous 620 px) ; ses cartes de 125 px débordent et le panneau
   (overflow hidden) coupe le texte. Mesuré le 08/10 sur
   /expertises/types-de-maintenance/maintenance-palliative/. Sans
   `data-screen-label`, la grille passe à une colonne : tout le texte se lit. */
function Sombre({ section, pli }: { section: SectionProbleme; pli: Pli | undefined }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section style={SECTION}>
      <Cadre section={section} pli={pli}>
        <div className={styles.panneauProbleme} data-panneau-mobile-clair="" style={PANNEAU}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ position: "relative" }}>
            <div data-mm-surtitre="" style={SURTITRE}>Votre problématique</div>
            <h2 data-mm-lead="" style={TITRE_SOMBRE}>{titre}</h2>
            <p data-mm-texte="" style={SUITE_SOMBRE}>{suite}</p>
            <div
              className="mg-rmulti"
              data-mm-kv=""
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 12,
              }}
            >
              {section.puces.map((puce, rang) => (
                <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
                  <span data-mm-num="" style={NUMERO_SOMBRE}>{numerote(rang)}</span>
                  <div>
                    <div data-mm-kv-titre="" style={ACCROCHE_SOMBRE}>{puce.accroche}</div>
                    <div data-mm-kv-texte="" style={TEXTE_SOMBRE}>{puce.texte}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Cadre>
    </section>
  );
}

export default function ProblemeDomaine({
  section,
  altPhoto,
  photo,
  replie = false,
  pli,
}: ProprietesProblemeDomaine) {
  const plie: Pli | undefined = pli ?? (replie ? "replie" : undefined);
  if (section.variante === "rangee") return <Rangee section={section} pli={plie} />;
  if (section.variante === "panneau-sombre") return <Sombre section={section} pli={plie} />;
  if (pli) return <Colonne section={section} altPhoto={altPhoto} photo={photo} pli={pli} />;
  /* Sans `pli` (gabarit 08), le dessin « colonne » se replie par le repli SUR
     DEMANDE de `ProblemeOffre` (gabarit 03), jamais par un pli posé
     par-dessus le sien. */
  return (
    <ProblemeOffre
      section={section}
      altPhoto={altPhoto}
      photo={photo}
      pli={replie ? "replie" : undefined}
    />
  );
}
