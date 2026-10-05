import Link from "next/link";

import corpus from "@/components/site/blocs/Blocs.module.css";
import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import type { SectionObjections, SectionPreuves } from "@/types/contenu";
import type { CarteOffre } from "@/types/offre";

import {
  APPEL_BANDE,
  APPEL_BOUTON,
  APPEL_BOUTON_BLANC,
  APPEL_QUESTION,
  APPEL_RAPPEL,
  clientDuLibelle,
  COPIE,
  FINAL_BOUTON_FANTOME,
  FINAL_LUEUR,
  FINAL_PANNEAU,
  FINAL_SECTION,
  FINAL_TITRE,
  MAILLAGE_CARTE,
  MAILLAGE_CHEMIN,
  MAILLAGE_CORPS,
  MAILLAGE_FLECHE,
  MAILLAGE_GRILLE,
  MAILLAGE_PHOTO,
  MAILLAGE_RANGEE_TITRE,
  MAILLAGE_TEXTE,
  MAILLAGE_TITRE,
  photoDeRang,
  QUESTION_CARTE,
  QUESTION_INTITULE,
  QUESTION_REPONSE,
  QUESTIONS_BOUTON_TEL,
  QUESTIONS_GRILLE,
  QUESTIONS_RELANCE,
  QUESTIONS_RELANCE_TEXTE,
  QUESTIONS_TITRE,
  REFERENCE_CARTE,
  REFERENCE_CLIENT,
  REFERENCE_CORPS,
  REFERENCE_LIEN,
  REFERENCE_PHOTO,
  REFERENCE_TEXTE,
  REFERENCE_TITRE,
  REFERENCES_ENTETE,
  REFERENCES_GRILLE,
  REFERENCES_TOUT_VOIR,
  COLONNE_COLLANTE,
} from "./habillage-offre";
import { cibleSure } from "./LiensOffre";
import styles from "./PageOffre.module.css";

/**
 * La seconde moitié du gabarit 03 : « 07 Appel », « 08 Références »,
 * « 09 Questions », « Maillage », « 10 Appel final ».
 *
 * Même règle que dans `SectionsOffre.tsx` : une section que le corpus
 * n'alimente pas ne rend rien du tout.
 *
 * L'ANCRE DU FORMULAIRE. La maquette visait `#besoin`, l'id de son panneau de
 * héros. C'est aussi l'id que `PageOffre` donne au sien : les boutons visent
 * donc bien un élément de la page, et pas un `href="#"` mort.
 */
const ANCRE_HERO = "#besoin";

/* ----------------------------------------------------------- 07 Appel */

/**
 * La bande orange pâle de milieu de page.
 *
 * ELLE EST ALIMENTÉE PAR `brefBande` ET `brefBouton` DU CORPUS, et c'est un
 * arbitrage à connaître. La maquette dessine DEUX appels, nourris de deux
 * sections distinctes de son fichier source : celui-ci (`SECTION 7`, question,
 * rappel du téléphone, bouton) et le panneau sombre de fin (`SECTION 10`,
 * question, bouton).
 *
 * Le corpus du site en porte deux lui aussi, sous d'autres noms. `brefBande` et
 * `brefBouton` sont l'appel de MILIEU de page (« Besoin d'un technicien
 * qualifié sur votre site sans relancer un recrutement ? » et « Parler à un
 * chargé d'affaires ») : c'est cette bande. `ctaFinal` est l'appel de FIN, et
 * c'est le panneau sombre. Chacun sa place, rien n'est répété, rien n'est
 * perdu.
 */
export function SectionAppelGabarit({
  question,
  bouton,
  rappel,
  href,
}: {
  question?: string;
  bouton?: string;
  rappel?: string;
  href?: string;
}) {
  if (!question) return null;
  const cible = href && cibleSure(href) ? href : ANCRE_HERO;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={APPEL_BANDE} data-reveal="">
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={APPEL_QUESTION}>{question}</div>
            {rappel ? (
              <div className={corpus.corpus} style={APPEL_RAPPEL}>
                <RappelTelephone rappel={rappel} />
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {bouton ? (
              <a
                href={cible}
                className={styles.boutonPrincipal}
                style={APPEL_BOUTON}
              >
                {bouton}
              </a>
            ) : null}
            <a href={TELEPHONE_SITE.href} style={APPEL_BOUTON_BLANC}>
              {TELEPHONE_SITE.affichage}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Le rappel du téléphone, avec le numéro rendu cliquable.
 *
 * La maquette coupe la phrase du corpus sur le numéro et met un `tel:` au
 * milieu (`cta7a` + `cta7tel` + `cta7b`). On fait le même découpage sur la
 * phrase du corpus, sans la réécrire : un numéro de téléphone affiché et non
 * appelable sur mobile est une conversion perdue.
 */
function RappelTelephone({
  rappel,
  clair = false,
}: {
  rappel: string;
  /** Sur le panneau sombre : le numéro passe en blanc, `var(--ink)` y disparaît. */
  clair?: boolean;
}) {
  const position = rappel.indexOf(TELEPHONE_SITE.affichage);
  if (position < 0) return <TexteRiche texte={rappel} />;
  return (
    <>
      {rappel.slice(0, position)}
      <a
        href={TELEPHONE_SITE.href}
        style={{ fontWeight: 600, color: clair ? "#fff" : "var(--ink)" }}
      >
        {TELEPHONE_SITE.affichage}
      </a>
      {rappel.slice(position + TELEPHONE_SITE.affichage.length)}
    </>
  );
}

/* ------------------------------------------------------ 08 Références */

/**
 * « Nos réalisations » : trois cartes à photo par rangée.
 *
 * LE NOM DU CLIENT EN SURTITRE DE CARTE n'est pas inventé : il est dégagé du
 * libellé de l'étude de cas que le corpus écrit (« Étude de cas SUEZ : remise en
 * état d'un site » donne « SUEZ »), par le même calcul que la maquette.
 *
 * LES PHOTOS sont la rotation que la maquette assigne elle-même par rang,
 * servie depuis `public/assets/web/`. C'est du dessin de site, pas du contenu :
 * le corpus ne porte aucune image, et la maquette n'en attend pas de lui.
 */
export function SectionReferencesGabarit({
  section,
}: {
  section: SectionPreuves;
}) {
  const preuves = section.preuves ?? [];
  if (preuves.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={REFERENCES_ENTETE} data-reveal="">
          <div>
            <div style={{ ...SURTITRE, marginBottom: 16 }}>
              {COPIE.referencesSurtitre}
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              {COPIE.referencesTitre}
            </h2>
          </div>
          <Link href="/preuves/" prefetch={false} style={REFERENCES_TOUT_VOIR}>
            {COPIE.referencesToutVoir} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="mg-rmulti" style={REFERENCES_GRILLE} data-reveal="">
          {preuves.map((preuve, index) => {
            const client = clientDuLibelle(preuve.lienLibelle);
            const cible =
              preuve.lienHref && cibleSure(preuve.lienHref)
                ? preuve.lienHref
                : null;
            const carte = (
              <>
                {/*
                  `role="img"` avec un `aria-label` : la photo est un fond CSS,
                  comme dans la maquette. Un fond n'a pas d'alternative
                  textuelle sans ça, et la carte est cliquable.
                */}
                <div
                  role="img"
                  aria-label="Photo du chantier"
                  style={{
                    ...REFERENCE_PHOTO,
                    backgroundImage: photoDeRang(index),
                  }}
                />
                <div style={REFERENCE_CORPS}>
                  {client ? (
                    <div style={REFERENCE_CLIENT}>{client}</div>
                  ) : null}
                  <div style={REFERENCE_TITRE}>{preuve.titre}</div>
                  {preuve.texte ? (
                    <div style={REFERENCE_TEXTE}>{preuve.texte}</div>
                  ) : null}
                  {cible && preuve.lienLibelle ? (
                    <div style={REFERENCE_LIEN}>
                      {preuve.lienLibelle}{" "}
                      <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                        &rarr;
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            );

            // Sans cible sûre, la carte reste une carte : pas de `href="#"`, et
            // pas de lien rafistolé vers une page qui n'existe peut-être pas.
            return cible ? (
              <Link
                key={preuve.titre}
                href={cible}
                prefetch={false}
                className={styles.carteReference}
                style={REFERENCE_CARTE}
              >
                {carte}
              </Link>
            ) : (
              <div key={preuve.titre} style={REFERENCE_CARTE}>
                {carte}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 09 Questions */

/** « Questions fréquentes » : colonne collante à gauche, cartes à droite. */
export function SectionQuestionsGabarit({
  section,
}: {
  section: SectionObjections;
}) {
  const questions = section.questions ?? [];
  if (questions.length === 0) return null;

  return (
    <section style={SECTION}>
      <div className="g3-2" style={{ ...LARGEUR, ...QUESTIONS_GRILLE }}>
        <div className="g3-sticky" style={COLONNE_COLLANTE} data-reveal="">
          <div style={{ ...SURTITRE, marginBottom: 18 }}>
            {COPIE.questionsSurtitre}
          </div>
          <h2 style={QUESTIONS_TITRE}>{COPIE.questionsTitre}</h2>
          <div style={QUESTIONS_RELANCE}>{QUESTIONS_RELANCE_TEXTE}</div>
          <a href={TELEPHONE_SITE.href} style={QUESTIONS_BOUTON_TEL}>
            {TELEPHONE_SITE.affichage}
          </a>
        </div>

        <div style={{ display: "grid", gap: 12 }} data-reveal="">
          {questions.map((question) => (
            <div key={question.question} style={QUESTION_CARTE}>
              <div style={QUESTION_INTITULE}>{question.question}</div>
              <p className={corpus.corpus} style={QUESTION_REPONSE}>
                <TexteRiche texte={question.reponse} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Maillage */

/**
 * « Pour aller plus loin » : les cartes du cocon.
 *
 * ALIMENTÉES PAR `autres` DU CORPUS, la grille « Un autre besoin ? » déjà
 * rédigée et curée pour chaque page : le libellé de l'offre fait le titre, la
 * phrase du visiteur fait la description. La maquette, elle, fabriquait ces
 * cartes en ramassant tous les liens internes du fichier Markdown, faute d'avoir
 * une liste curée sous la main. Le corpus en a une : on prend la sienne.
 */
export function SectionMaillageGabarit({
  cartes,
}: {
  cartes: readonly CarteOffre[];
}) {
  if (cartes.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 18 }}>
          {COPIE.maillageSurtitre}
        </div>
        <div style={MAILLAGE_GRILLE} data-reveal="">
          {cartes.map((carte, index) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carteMaillage}
              style={MAILLAGE_CARTE}
            >
              <div
                role="img"
                aria-label="Illustration"
                style={{
                  ...MAILLAGE_PHOTO,
                  // `+ 3` : le décalage de la maquette, pour que les cartes du
                  // maillage ne reprennent pas les photos des références.
                  backgroundImage: photoDeRang(index + 3),
                }}
              />
              <div style={MAILLAGE_CORPS}>
                <div style={MAILLAGE_RANGEE_TITRE}>
                  <span style={MAILLAGE_TITRE}>{carte.libelle}</span>
                  <span aria-hidden="true" style={MAILLAGE_FLECHE}>
                    &rarr;
                  </span>
                </div>
                <span style={MAILLAGE_TEXTE}>{carte.phrase}</span>
                <span style={MAILLAGE_CHEMIN}>{carte.href}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ 10 Appel final */

/**
 * Le panneau sombre de fin de page, alimenté par `ctaFinal` du corpus.
 *
 * LE RAPPEL DU TÉLÉPHONE EST RENDU ICI BIEN QUE LA MAQUETTE NE LUI DONNE PAS DE
 * FENTE, et c'est la règle du chantier appliquée à la lettre : « le texte du
 * corpus que la maquette ne montre pas n'est jamais supprimé, il se rend sous
 * les sections de la maquette, avec ses motifs à elle ». Le motif employé est
 * `APPEL_RAPPEL`, relevé dans la bande de milieu de page du même fichier, en
 * clair sur le sombre. La phrase (« ou appelez le 04 78 33 72 05, rappel dans
 * l'heure aux horaires ouvrés. ») est la seule mention de délai que le contrat
 * autorise : la perdre serait perdre l'argument.
 */
export function SectionFinaleGabarit({
  question,
  bouton,
  rappel,
  href,
}: {
  question?: string;
  bouton?: string;
  rappel?: string;
  href?: string;
}) {
  if (!question) return null;
  const cible = href && cibleSure(href) ? href : ANCRE_HERO;

  return (
    <section style={FINAL_SECTION}>
      <div className="g3-pad" style={FINAL_PANNEAU} data-reveal="">
        <div aria-hidden="true" style={FINAL_LUEUR} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <h2 className={corpus.corpusClair} style={FINAL_TITRE}>
            {question}
          </h2>
          {rappel ? (
            <div
              className={corpus.corpusClair}
              style={{
                ...APPEL_RAPPEL,
                color: "rgba(255,255,255,.64)",
                margin: "0 auto 26px",
                maxWidth: "46ch",
              }}
            >
              <RappelTelephone rappel={rappel} clair />
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {bouton ? (
              <a
                href={cible}
                className={styles.boutonPrincipal}
                style={APPEL_BOUTON}
              >
                {bouton}
              </a>
            ) : null}
            <a href={TELEPHONE_SITE.href} style={FINAL_BOUTON_FANTOME}>
              {TELEPHONE_SITE.affichage}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
