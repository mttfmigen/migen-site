import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { SectionProbleme } from "@/types/contenu";

import EtiquettePli from "./EtiquettePli";
import { coupePunchline, numerote } from "./texte-offre";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { accrocheDuProbleme } from "../blocs/resume-de-section";
import styles from "./PageOffre.module.css";
import { cadragePhoto } from "@/lib/cadrage-photos";

/**
 * Section « 03 Problème » de la capture (`maquette/rendu/offres--residence.html`) :
 * à gauche, colonne collante avec surtitre « Votre problématique », la première
 * phrase de la punchline en H2, la suite en sous-phrase, une photo ; à droite,
 * les puces du corpus en cartes numérotées 01 à 04.
 *
 * `blocs/Probleme.tsx` n'est pas touché : il sert le gabarit de vente. La
 * DONNÉE est la même (`sections.probleme` du corpus), seul l'habillage change.
 */

export interface ProprietesProblemeOffre {
  section: SectionProbleme;
  /** L'alt de la photo. La capture y écrit le H1 de la page. */
  altPhoto: string;
  /**
   * La photo de la colonne gauche. ABSENTE, c'est celle de la capture de la
   * page pilote `/offres/residence/` ; `null` dit que la capture de LA page
   * n'en rend aucune, et rien n'est rendu.
   *
   * AJOUTÉ LE 07/10 : la capture de `/offres/full-service/` rend cette section
   * SANS photo (0 image relevée sur sa section 8). Y laisser celle de la page
   * pilote serait une photo posée au hasard.
   */
  photo?: string | null;
  /**
   * LE REPLI MOBILE, SUR DEMANDE SEULEMENT. Absent, la section est rendue
   * exactement comme avant le 14/10, sur tous les gabarits qui la montent
   * (ville, expertises, domaine) : leur lot décide de leur repli, pas celui-ci.
   * « ouvert » : repliable mais déplié au chargement, la maquette mobile v2
   * gardant la PREMIÈRE section de contenu ouverte (dc.html L451, `nOpen = 1`,
   * et L476, `const op = isRef || dI++ < nOpen`) ; « replie » : refermé au
   * chargement sous 880 px. Au-dessus de 880 px, rien ne change.
   */
  pli?: Pli;
  /** Le texte que seule la maquette mobile rend, sous 881 px (`ProblemeMobile`). */
  mobile?: ProblemeMobile;
}

export type Pli = "ouvert" | "replie";

/**
 * LE TEXTE DU PROBLÈME QUE LA MAQUETTE MOBILE V2 REND ET QUE LE BUREAU NE
 * REND PAS (`/offres/bureau-etudes/`, relecture du tour 2) : la phrase clé
 * (« ### » du corpus) et les paragraphes à tête grasse qui entourent les
 * puces. Mots du corpus de la maquette, rendus sous 881 px seulement.
 */
export interface ProblemeMobile {
  titre?: string;
  /** Paragraphes avant les puces, en Markdown en ligne (`**gras**`). */
  avant?: readonly string[];
  /** Paragraphes après les puces. */
  apres?: readonly string[];
}

/** La phrase clé et sa suite ne font qu'un paragraphe au téléphone (globals § 13). */
function phrase(suite?: string) {
  return suite ? { "data-mm-phrase": "" } : {};
}

function ParagraphesMobile({ textes }: { textes?: readonly string[] }) {
  if (!textes?.length) return null;
  return (
    <div data-mobile-seulement="">
      {textes.map((texte) => (
        <p key={texte} data-mm-paragraphe="">
          <TexteRiche texte={texte} />
        </p>
      ))}
    </div>
  );
}

/**
 * LE TITRE DE LA CARTE AU TÉLÉPHONE, celui de la maquette mobile v2 : « 01 Le
 * problème » sur les 21 pages relevées le 14/10 (offres, villes, secteurs,
 * expertises), toutes porteuses de ce bloc. Le sur-titre et la phrase de
 * bureau restent dans le corps de la carte.
 */
const TITRE_CARTE = "Le problème";

/** La photo de la colonne gauche, identifiée sur `offres--residence.png`. */
const PHOTO = "/assets/web/team-electric.jpg";

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3.1vw,44px) * var(--ts))/1.07 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 18px",
  maxWidth: "18ch",
  textWrap: "balance",
};

const SOUS_PHRASE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 22px",
  maxWidth: "40ch",
};

const CADRE_PHOTO: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  height: 280,
  background: "var(--ph)",
  position: "relative",
};

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "24px 28px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

const NUMERO: CSSProperties = {
  font: "600 26px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "0 0 auto",
};

const ACCROCHE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
  color: "var(--ink)",
};

const TEXTE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
};

/* ------------------------------------------------------- les deux variantes
   relevées par le diagnostic visuel du 07/10, valeurs mesurées sur la maquette
   qui tourne, pas estimées. Le choix vient de la DONNÉE de chaque page
   (`section.variante`), transcrit de sa capture. */

const PANNEAU_SOMBRE: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background: "var(--panel)",
  borderRadius: 40,
  padding: "52px 56px",
};

/* Relevé des captures du 08/10 (`travaux-industriels--demantelement-
   industriel`, `expertises--hydraulique`, `implantations--…-agen` : même
   balisage) : lueur décalée en haut à droite, titre et sous-phrase propres à
   ce panneau, cartes au rayon `--rad`. */
const LUEUR: CSSProperties = {
  position: "absolute",
  top: -210,
  right: -170,
  width: 460,
  height: 460,
  background: "radial-gradient(circle, rgba(255,124,60,.26), transparent 68%)",
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

const SOUS_PHRASE_SOMBRE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 30px",
  maxWidth: "56ch",
};

const CARTE_SOMBRE: CSSProperties = {
  padding: "22px 26px",
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

function Sombre({ section, pli }: { section: SectionProbleme; pli?: Pli }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div className={styles.blocPliablePartage} style={LARGEUR}>
        <div className="mg-pad" data-panneau-mobile-clair="" style={PANNEAU_SOMBRE}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ position: "relative" }}>
            {/* Au téléphone, le panneau anthracite s'efface
                (`data-panneau-mobile-clair`) : la carte est blanche comme
                les autres, et ses textes reprennent l'encre de la maquette. */}
            <PliMobile pli={pli} section={section} titre={titre}>
            <div data-doublon-mobile="" style={{ ...SURTITRE, marginBottom: 16 }}>
              Votre problématique
            </div>
            {titre ? <h2 data-mm-lead="" {...phrase(suite)} style={TITRE_SOMBRE}>{titre}</h2> : null}
            <p data-mm-texte="" data-mm-suite="" style={SOUS_PHRASE_SOMBRE}>{suite}</p>
            <div
              data-mm-kv=""
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {section.puces.map((puce, rang) => (
                <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
                  <span data-mm-num="" style={NUMERO}>{numerote(rang)}</span>
                  {/* `minWidth: 0` ET `overflowWrap` : un élément de flexbox ne descend
                      pas sous la largeur de son mot le plus long tant qu'il garde
                      `min-width: auto`, et la carte sort alors de son panneau, qui la
                      rogne. Même mesure que `implantation/ProblemeCartes.tsx`, 13/10,
                      320 px. Invisible dès qu'il y a la place. */}
                  <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
                    {puce.accroche ? (
                      <div data-mm-kv-titre="" style={{ ...ACCROCHE, color: "#fff" }}>
                        {puce.accroche}
                      </div>
                    ) : null}
                    <div data-mm-kv-texte="" style={{ ...TEXTE, color: "rgba(255,255,255,.62)" }}>
                      {puce.texte}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </PliMobile>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Relevé des captures du 08/10 (`offres--full-service`, `offres--arret-
   technique`, `implantations--lyon`, `secteurs--chimie` : même balisage) :
   en-tête sur deux colonnes, titre à gauche et sous-phrase alignée en bas à
   droite, puis une rangée de cartes en verre, numéro au-dessus. */
const RANGEE_ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

const RANGEE_TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const RANGEE_SOUS_PHRASE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
};

const RANGEE_CARTE: CSSProperties = {
  ...VERRE,
  padding: "26px 24px 28px",
  display: "flex",
  flexDirection: "column",
};

function Rangee({ section, pli }: { section: SectionProbleme; pli?: Pli }) {
  const { titre, suite } = coupePunchline(section.punchline);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div className={styles.blocPliablePartage} style={LARGEUR}>
        <PliMobile pli={pli} section={section} titre={titre}>
        <div className="mg-r2" data-mm-cellules="" style={RANGEE_ENTETE}>
          <div>
            <div data-doublon-mobile="" style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            {titre ? <h2 data-mm-lead="" {...phrase(suite)} style={RANGEE_TITRE}>{titre}</h2> : null}
          </div>
          {suite ? <p data-mm-texte="" data-mm-suite="" style={RANGEE_SOUS_PHRASE}>{suite}</p> : null}
        </div>
        <div
          data-mm-kv=""
          className="g3-pbgrid mg-rmulti"
          style={{
            display: "grid",
            // Autant de colonnes que de cartes : 4 ou 5 sur UNE rangée.
            gridTemplateColumns: `repeat(${section.puces.length}, minmax(0, 1fr))`,
            gap: 12,
          }}
        >
          {section.puces.map((puce, rang) => (
            <div key={puce.accroche ?? puce.texte} style={RANGEE_CARTE}>
              <span
                data-mm-num=""
                style={{
                  font: "600 24px/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                {numerote(rang)}
              </span>
              {puce.accroche ? (
                <div
                  data-mm-kv-titre=""
                  style={{
                    font: "600 15px/1.35 var(--ft)",
                    letterSpacing: "-.018em",
                    marginBottom: 6,
                    color: "var(--ink)",
                  }}
                >
                  {puce.accroche}
                </div>
              ) : null}
              <div data-mm-kv-texte="" style={{ font: "400 13px/1.55 var(--fb)", color: "var(--ink2)" }}>
                {puce.texte}
              </div>
            </div>
          ))}
        </div>
        </PliMobile>
      </div>
    </section>
  );
}

/**
 * LE REPLI DES TROIS DESSINS, motif « Blocs communs (pliables) » de la
 * maquette mobile : l'étiquette (`EtiquettePli`) porte le titre de la carte
 * de la maquette (`TITRE_CARTE`), le sur-titre et le H2 de la capture restent
 * dans le corps, en phrase clé (`data-mm-lead`). Le résumé suit la
 * maquette : les intitulés des puces joints par « · », avec le repli
 * `accroche ?? texte` pour qu'une puce sans accroche ne disparaisse pas du
 * compte.
 *
 * SANS `pli`, RIEN N'EST ENVELOPPÉ. Le titre lisible qu'exige
 * `scripts/verifie-blocs-pliables.mjs` est l'étiquette « Le problème », qui
 * existe avec ou sans H2.
 */
function PliMobile({
  pli,
  section,
  children,
}: {
  pli?: Pli;
  section: SectionProbleme;
  /** Le H2 de la capture, quand elle en porte un ; la carte ne s'en sert pas. */
  titre?: string;
  children: ReactNode;
}) {
  /* SANS PUNCHLINE, LA CARTE GARDE SON ÉTIQUETTE « Le problème » : c'est elle,
     et non le H2, qui titre la carte (`/offres/bureau-etudes/`, dont le
     problème sortait du rang des cartes numérotées, 14/10). */
  if (!pli) return <>{children}</>;
  return (
    <SectionPliableMobile
      toujoursOuvert={pli === "ouvert"}
      enTete={<EtiquettePli titre={TITRE_CARTE} />}
      /* LA PHRASE CLÉ D'ABORD, comme la maquette (V3 `teaseOf` : le premier
         paragraphe de la section, « Votre maintenance tient sur deux
         personnes et un tableur… ») ; sans elle, la première puce. */
      resume={accrocheDuProbleme(section)}
    >
      {children}
    </SectionPliableMobile>
  );
}

/**
 * LA PHOTO QUE CE BLOC REND SUR BUREAU, ou `null`. Seul le dessin en colonne
 * en porte une ; le panneau sombre et la rangée n'en ont pas. Exportée pour
 * le héros mobile du gabarit, qui la reprend en tête de page (maquette mobile
 * v2, dc.html L105 : une photo de héros, aucune dans les cartes).
 */
export function photoDuProbleme(
  section: SectionProbleme,
  photo?: string | null,
): string | null {
  if (section.variante === "panneau-sombre" || section.variante === "rangee") return null;
  return photo === undefined ? PHOTO : photo;
}

export default function ProblemeOffre({
  section,
  altPhoto,
  photo,
  pli,
  mobile,
}: ProprietesProblemeOffre) {
  if (section.variante === "panneau-sombre") return <Sombre section={section} pli={pli} />;
  if (section.variante === "rangee") return <Rangee section={section} pli={pli} />;

  const { titre, suite } = coupePunchline(section.punchline);
  const source = photoDuProbleme(section, photo);

  const corps = (
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div className="g3-sticky" style={{ position: "sticky", top: 110 }}>
            <div data-doublon-mobile="" style={{ ...SURTITRE, marginBottom: 18 }}>
              Votre problématique
            </div>
            {titre ? <h2 data-mm-lead="" {...phrase(suite)} style={TITRE}>{titre}</h2> : null}
            {suite ? <p data-mm-texte="" data-mm-suite="" style={SOUS_PHRASE}>{suite}</p> : null}
            {!titre && mobile?.titre ? (
              <p data-mobile-seulement="" data-mm-lead="">
                {mobile.titre}
              </p>
            ) : null}
            <ParagraphesMobile textes={mobile?.avant} />
            {source ? (
              <div data-photo-probleme="" style={CADRE_PHOTO}>
                <Image
                  src={source}
                  alt={altPhoto}
                  fill
                  sizes="(max-width: 900px) 100vw, 440px"
                  style={{
                    objectFit: "cover",
                    /* Cadre 479x280, ratio 1,71. */
                    objectPosition: cadragePhoto(source, 479 / 280),
                    filter: "saturate(var(--sat)) contrast(1.05)",
                  }}
                />
              </div>
            ) : null}
          </div>

          <div data-mm-kv="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
            {section.puces.map((puce, rang) => (
              <div key={puce.accroche ?? puce.texte} style={CARTE}>
                <span data-mm-num="" style={NUMERO}>{numerote(rang)}</span>
                {/* `minWidth: 0` ET `overflowWrap` : un élément de flexbox ne descend
                    pas sous la largeur de son mot le plus long tant qu'il garde
                    `min-width: auto`, et la carte sort alors de son panneau, qui la
                    rogne. Même mesure que `implantation/ProblemeCartes.tsx`, 13/10,
                    320 px. Invisible dès qu'il y a la place. */}
                <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
                  {puce.accroche ? (
                    <div data-mm-kv-titre="" style={ACCROCHE}>{puce.accroche}</div>
                  ) : null}
                  <div data-mm-kv-texte="" style={TEXTE}>{puce.texte}</div>
                </div>
              </div>
            ))}
          </div>
          <ParagraphesMobile textes={mobile?.apres} />
        </div>
  );

  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div className={styles.blocPliablePartage} style={LARGEUR}>
        <PliMobile pli={pli} section={section} titre={titre}>
          {corps}
        </PliMobile>
      </div>
    </section>
  );
}
