import corpus from "@/components/site/blocs/Blocs.module.css";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type {
  SectionDeroule,
  SectionGaranties,
  SectionOffre as SectionOffreCorpus,
  SectionProbleme,
} from "@/types/contenu";

import {
  COPIE,
  coupePunchline,
  GARANTIE,
  GARANTIE_TEXTE,
  GARANTIE_TITRE,
  GARANTIES_GRILLE,
  GARANTIES_LUEUR,
  GARANTIES_PANNEAU,
  GARANTIES_SECTION,
  GARANTIES_TITRE,
  METHODE_ENTETE,
  METHODE_ETAPE,
  METHODE_ETAPE_TEXTE,
  METHODE_ETAPE_TITRE,
  METHODE_FILET,
  METHODE_GRILLE,
  METHODE_PASTILLE,
  METHODE_RANG,
  METHODE_TITRE,
  OFFRE_BENEFICE,
  OFFRE_BENEFICE_FLECHE,
  OFFRE_BENEFICE_TEXTE,
  OFFRE_CADRE,
  OFFRE_ENTETE,
  OFFRE_ENTETE_DROITE,
  OFFRE_ENTETE_GAUCHE,
  OFFRE_LIGNE,
  OFFRE_NOTE,
  OFFRE_NOTE_TEXTE,
  OFFRE_PRESTATION,
  OFFRE_PRESTATION_FORT,
  OFFRE_RANG,
  OFFRE_TITRE,
  PROBLEME_ACCROCHE,
  PROBLEME_CARTE,
  PROBLEME_DETAIL,
  PROBLEME_GRILLE,
  PROBLEME_NUMERO,
  PROBLEME_PILE,
  PROBLEME_RANGEE,
  PROBLEME_TEXTE,
  PROBLEME_TITRE,
  COLONNE_COLLANTE,
  rang,
} from "./habillage-offre";
import styles from "./PageOffre.module.css";

/**
 * Les quatre sections de corps du gabarit 03, dans l'ordre de la maquette :
 * « 03 Problème », « 04 Offre », « 05 Déroulé », « 06 Garanties ».
 *
 * CHACUNE EST SOUS CONDITION. Une section que le corpus n'alimente pas ne rend
 * RIEN, surtitre compris : pas de titre orphelin, pas de carte vide. C'est la
 * raison des `?? []` et des `length > 0` qui suivent, et la raison pour laquelle
 * chaque composant prend sa section du corpus et non la page entière.
 *
 * Composants SERVEUR. Les survols sont dans `PageOffre.module.css`, avec leur
 * `:focus-visible` : un style en ligne ne porte pas d'état, et un visiteur au
 * clavier doit voir ce qu'un visiteur à la souris voit (WCAG 2.4.7).
 */

/* ---------------------------------------------------------- 03 Problème */

/**
 * « Votre problématique » : colonne collante à gauche, cartes numérotées à
 * droite.
 *
 * C'EST L'ÉCART QUE LE CLIENT VOYAIT. Le site rendait ici une liste à puces sur
 * panneau anthracite (le traitement de `blocs/Probleme.tsx`, relevé dans un
 * autre fichier de maquette). Le gabarit 03 pose quatre cartes en verre
 * numérotées 01 à 04, chiffre orange de 30px, en face d'un H2 qui reste au
 * niveau de l'œil pendant qu'elles défilent.
 */
export function SectionProblemeGabarit({
  section,
}: {
  section: SectionProbleme;
}) {
  const puces = section.puces ?? [];
  const { titre, texte } = coupePunchline(section.punchline ?? "");
  if (!titre && puces.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={PROBLEME_GRILLE} data-reveal="">
          <div className="g3-sticky" style={COLONNE_COLLANTE}>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>
              {COPIE.problemeSurtitre}
            </div>
            {titre ? (
              <h2 style={PROBLEME_TITRE}>
                <TexteRiche texte={titre} />
              </h2>
            ) : null}
            {texte ? (
              <p style={PROBLEME_TEXTE}>
                <TexteRiche texte={texte} />
              </p>
            ) : null}
          </div>

          {puces.length > 0 ? (
            <div style={PROBLEME_PILE}>
              {puces.map((puce, index) => (
                <div
                  key={puce.texte}
                  className={styles.carteProbleme}
                  style={PROBLEME_CARTE}
                >
                  <div style={PROBLEME_RANGEE}>
                    <span aria-hidden="true" style={PROBLEME_NUMERO}>
                      {rang(index)}
                    </span>
                    <div>
                      {/*
                        La maquette met l'accroche en tête de carte et le détail
                        dessous. Le corpus écrit parfois tout dans `texte`, le
                        gras compris : sans accroche, le détail monte en tête
                        plutôt que de laisser une ligne vide au-dessus de lui.
                      */}
                      <div style={PROBLEME_ACCROCHE}>
                        <TexteRiche texte={puce.accroche ?? puce.texte} />
                      </div>
                      {puce.accroche && puce.texte ? (
                        <div style={PROBLEME_DETAIL}>
                          <TexteRiche texte={puce.texte} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 04 Offre */

/**
 * « L'offre » : le tableau à trois colonnes, rang, prestation, bénéfice.
 *
 * Les deux en-têtes de colonnes (« Ce que nous faisons » et « Ce que ça change
 * pour vous ») ne sont PAS des titres de section : ce sont les étiquettes du
 * tableau, masquées sous 900px par `.g3-head`, où les trois colonnes se
 * replient en une seule.
 */
export function SectionOffreGabarit({
  section,
}: {
  section: SectionOffreCorpus;
}) {
  const lignes = section.lignes ?? [];
  const prose = section.prose ?? [];
  if (lignes.length === 0) return null;

  return (
    <section className={corpus.corpus} style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={{ ...SURTITRE, marginBottom: 18 }}>
            {COPIE.offreSurtitre}
          </div>
          {/*
            Le H2 vient de la maquette, pas du corpus : aucune des dix-huit
            pages ne l'écrit, et la maquette le fixe en dur. C'est une étiquette
            de dessin, comme le surtitre juste au-dessus.
          */}
          <h2 style={OFFRE_TITRE}>{COPIE.offreTitre}</h2>

          <div style={OFFRE_CADRE}>
            <div className="g3-row g3-head" style={OFFRE_ENTETE}>
              <span />
              <span style={OFFRE_ENTETE_GAUCHE}>
                {COPIE.offreColonneGauche}
              </span>
              <span style={OFFRE_ENTETE_DROITE}>
                {COPIE.offreColonneDroite}
              </span>
            </div>

            {lignes.map((ligne, index) => (
              <div
                key={ligne.benefice}
                className="g3-row"
                style={OFFRE_LIGNE}
              >
                <span aria-hidden="true" style={OFFRE_RANG}>
                  {rang(index)}
                </span>
                <div style={OFFRE_PRESTATION}>
                  {ligne.prestation.accroche ? (
                    <strong style={OFFRE_PRESTATION_FORT}>
                      <TexteRiche texte={ligne.prestation.accroche} />
                    </strong>
                  ) : null}
                  {/*
                    Le corpus écrit souvent la prestation entière dans `texte`,
                    gras markdown compris, et la fait alors commencer par une
                    virgule quand l'accroche existe (« , temps plein ou
                    partagé. »). `TexteRiche` rend le gras ; la virgule de
                    liaison est retirée, elle n'a plus de phrase à prolonger
                    une fois l'accroche passée sur sa propre ligne.
                  */}
                  <TexteRiche
                    texte={
                      ligne.prestation.accroche
                        ? ligne.prestation.texte.replace(/^[,.]\s*/, "")
                        : ligne.prestation.texte
                    }
                  />
                </div>
                <div style={OFFRE_BENEFICE}>
                  <span aria-hidden="true" style={OFFRE_BENEFICE_FLECHE}>
                    &rarr;
                  </span>
                  <span style={OFFRE_BENEFICE_TEXTE}>
                    <TexteRiche texte={ligne.benefice} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {prose.length > 0 ? (
            <div style={OFFRE_NOTE}>
              {prose.map((paragraphe) => (
                <p key={paragraphe.texte} style={OFFRE_NOTE_TEXTE}>
                  {paragraphe.accroche ? (
                    <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                      <TexteRiche texte={paragraphe.accroche} />{" "}
                    </strong>
                  ) : null}
                  <TexteRiche texte={paragraphe.texte} />
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- 05 Déroulé */

/**
 * « Notre méthode » : la frise à trois colonnes, une pastille par étape.
 *
 * ELLE REMPLACE `accueil/MethodeQuatreEtapes`, qui était monté ici. Ce composant
 * rend la méthode GÉNÉRIQUE du site en quatre étapes, la même sur toutes les
 * pages. Le gabarit 03 nourrit cette section avec le déroulé PROPRE à l'offre
 * (`deroule` du corpus, six étapes sur la page Résidence) : c'est du texte
 * rédigé pour cette page, et il n'avait nulle part où se rendre.
 */
export function SectionMethodeGabarit({
  section,
}: {
  section: SectionDeroule;
}) {
  const etapes = section.etapes ?? [];
  if (etapes.length === 0) return null;

  return (
    <section className={corpus.corpus} style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={METHODE_ENTETE} data-reveal="">
          <div>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              {COPIE.methodeSurtitre}
            </div>
            <h2 style={METHODE_TITRE}>{COPIE.methodeTitre}</h2>
          </div>
        </div>

        <div className="mg-rmulti" style={METHODE_GRILLE} data-reveal="">
          {etapes.map((etape, index) => (
            <div key={etape.titre} style={METHODE_ETAPE}>
              {/* Le filet passe DERRIÈRE la pastille, à la hauteur de son
                  rayon : c'est ce qui donne la frise plutôt que six cartes. */}
              <div aria-hidden="true" style={METHODE_FILET} />
              <span aria-hidden="true" style={METHODE_PASTILLE} />
              <div aria-hidden="true" style={METHODE_RANG}>
                {rang(index)}
              </div>
              <div style={METHODE_ETAPE_TITRE}>{etape.titre}</div>
              {etape.texte ? (
                <p style={METHODE_ETAPE_TEXTE}>
                  <TexteRiche texte={etape.texte} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 06 Garanties */

/**
 * « Notre parti pris » : les engagements sur le grand panneau sombre.
 *
 * Deux colonnes, un filet orange de 2px en tête de chacun. Pas de carte : la
 * maquette veut que le panneau soit une seule masse, et les filets la scandent.
 */
export function SectionGarantiesGabarit({
  section,
}: {
  section: SectionGaranties;
}) {
  const puces = section.puces ?? [];
  if (puces.length === 0) return null;

  return (
    <section style={GARANTIES_SECTION}>
      <div className="g3-pad" style={GARANTIES_PANNEAU} data-reveal="">
        <div aria-hidden="true" style={GARANTIES_LUEUR} />
        <div style={{ position: "relative" }}>
          <div style={{ ...SURTITRE, marginBottom: 18 }}>
            {COPIE.garantiesSurtitre}
          </div>
          <h2 style={GARANTIES_TITRE}>{COPIE.garantiesTitre}</h2>

          <div className="g3-2" style={GARANTIES_GRILLE}>
            {puces.map((puce) => (
              <div key={puce.texte} style={GARANTIE}>
                <div style={GARANTIE_TITRE}>
                  <TexteRiche texte={puce.accroche ?? puce.texte} />
                </div>
                {puce.accroche && puce.texte ? (
                  <div style={GARANTIE_TEXTE}>
                    <TexteRiche texte={puce.texte} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
