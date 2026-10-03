import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import {
  VUE_AVANT,
  VUE_AVEC,
} from "@/components/site/accueil/avant-apres-donnees";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";
import Bloc from "@/components/site/blocs/Bloc";
import {
  CHAPEAU,
  colonnes,
  ENTETE,
  LARGEUR,
  SECTION,
  TITRE2,
} from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import {
  CommentCaMarche,
  Comparatif,
  Formules,
  PremierMois,
} from "./BlocsZeroArret";
import { cibleSure, liensSurs } from "./LiensOffre";
import {
  BANDE,
  BANDE_BOUTON,
  BANDE_TEXTE,
  BOUTON_HERO,
  CARTE_AUTRE,
  CARTE_AUTRE_LIBELLE,
  CARTE_AUTRE_PHRASE,
  CARTE_CHIFFRE,
  CHAPEAU_HERO,
  CHIFFRE_DETAIL,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  HERO,
  HERO_BANDE_REPERES,
  HERO_FILET,
  HERO_FORMULAIRE_ENTETE,
  HERO_FORMULAIRE_MENTION,
  HERO_FORMULAIRE_TITRE,
  HERO_GRILLE,
  HERO_PANNEAU_FORMULAIRE,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  HERO_REPERE_LIBELLE,
  HERO_REPERE_VALEUR,
  MENTION,
  PASTILLE,
  PASTILLE_PUCE,
  SURTITRE_OFFRE,
  TITRE1,
} from "./habillage-offre";

import styles from "./PageOffre.module.css";

/**
 * Gabarit OFFRE, porté de la maquette `maquette/accueil-rendu.html`,
 * lignes 4706 à 5198 (`sc-if value="{{ isOfferPage }}"`).
 *
 * LES QUATORZE SECTIONS DE LA MAQUETTE, ET CE QUI LES ALIMENTE. La maquette
 * dessine, le corpus rédigé écrit. Rien ne s'invente : une section dont le
 * corpus ne fournit pas la matière n'est pas rendue.
 *
 *  1. Le héros à deux colonnes          ← `heros` du corpus, aplati dans les
 *                                          champs du gabarit par l'import
 *  2. « En bref », quatre chiffres      ← `chiffres`
 *  3. « Comment ça marche »             ← VIDE, voir `BlocsZeroArret.tsx`
 *  4. « Les formules »                  ← VIDE, voir `BlocsZeroArret.tsx`
 *  5. « Le comparatif »                 ← VIDE, voir `BlocsZeroArret.tsx`
 *  6. « Le premier mois »               ← VIDE, voir `BlocsZeroArret.tsx`
 *  7. « Le jour et la nuit »            ← `AvantApresBascule` et ses données,
 *                                          déjà portées, communes au site
 *  8. « Ce qui est inclus »             ← `offre`, rendu par le bloc `Offre`
 *  9. « Notre méthode »                 ← `MethodeQuatreEtapes`, déjà porté
 * 10. « Notre sélection »               ← `ProcessSelection`, déjà porté
 * 11. « Nos dernières réalisations »    ← `preuves`, rendu par le bloc `Preuves`
 * 12. « Questions fréquentes »          ← `objections`, bloc `Objections`
 * 13. « Un autre besoin ? »             ← `autres`, puis le maillage du cocon
 * 14. Le formulaire de bas de page      ← `ctaFinal`
 *
 * LE TEXTE DU CORPUS QUE LA MAQUETTE NE MONTRE PAS N'EST PAS SUPPRIMÉ. Quatre
 * sections du corpus (`probleme`, `deroule`, `garanties`, `cta`) sont du texte
 * payé, et la substance du référencement de ces pages. Elles se rendent SOUS la
 * section de la maquette à laquelle elles se rattachent, dans les motifs de
 * section de la maquette elle-même (mêmes surtitres en capitales, mêmes H2,
 * mêmes cartes en verre), par les blocs de `components/site/blocs/` :
 *
 *   · `probleme` juste sous « Le jour et la nuit » : la bascule montre l'avant,
 *     le panneau anthracite du problème le nomme.
 *   · `deroule`, `garanties` et `cta` juste sous « Ce qui est inclus » : le
 *     visiteur vient de lire la prestation, il lit ensuite comment elle se
 *     déroule, ce qui est garanti, et il trouve l'appel.
 *
 * Composant SERVEUR. Les trois blocs d'accueil qu'il monte sont des composants
 * client (bascule, étapes, sélection) : ils portent leur propre `"use client"`.
 * Les révélations au défilement sont posées en `data-reveal` et animées par
 * `components/site/Moteurs.tsx`, monté une fois dans la mise en page racine.
 */

export interface ProprietesPageOffre {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuOffre;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone à son
   * tour pour deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/**
 * La section du corpus de ce type, s'il y en a une.
 *
 * Le gabarit place les sections par TYPE et non dans l'ordre du tableau : la
 * maquette donne un emplacement précis à chacune, et cet ordre n'est pas celui
 * du corpus. Une section absente rend `undefined`, et rien ne s'affiche.
 */
function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}

export default function PageOffre({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageOffre) {
  const actions = liensSurs(contenu.actions ?? []);
  const reperes = contenu.reperes ?? [];
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections ?? [];
  const autres = (contenu.autres ?? []).filter(
    (carte) => !!carte.phrase && !!carte.libelle && cibleSure(carte.href),
  );

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const cta = sectionDeType(sections, "cta");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  // Le panneau de droite du héros n'existe que s'il porte un formulaire. Sans
  // en-tête fourni, le héros passe sur une colonne : la maquette met un panneau
  // en verre là, et un panneau vide vaudrait aveu.
  const heroFormulaire = !!contenu.formulaireHeroTitre;

  const bandeBref = contenu.brefBande;
  const boutonBref = contenu.brefBouton;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section
            style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}
          >
            {filAriane}
          </section>
        ) : null}

        {/* ----------------------------------------- 1. le héros (l. 4708) */}

        <section style={HERO}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: heroFormulaire
                ? HERO_GRILLE
                : "minmax(0,1fr)",
              gap: 52,
              alignItems: "start",
            }}
          >
            <div>
              {contenu.pastille || contenu.mention ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  {contenu.pastille ? (
                    <span style={PASTILLE}>
                      <span aria-hidden="true" style={PASTILLE_PUCE} />
                      {contenu.pastille}
                    </span>
                  ) : null}
                  {contenu.mention ? (
                    <span style={MENTION}>{contenu.mention}</span>
                  ) : null}
                </div>
              ) : null}

              <h1 style={TITRE1}>{titre}</h1>

              {contenu.chapeau ? (
                <p style={CHAPEAU_HERO}>
                  <TexteRiche texte={contenu.chapeau} />
                </p>
              ) : null}

              {actions.length > 0 ? (
                <div style={HERO_RANGEE_BOUTONS}>
                  {actions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      prefetch={false}
                      className={styles.boutonSecondaire}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/*
                La bande de repères de la maquette (l. 4723). Elle reste vide :
                la maquette y écrit « 5 agences en France » et « +200 clients
                industriels », deux chiffres que le contrat interdit. Les
                chiffres justes du corpus sont la bande « En bref » juste
                dessous. Voir `types/offre.ts`, champ `reperes`.
              */}
              {reperes.length > 0 ? (
                <div style={HERO_BANDE_REPERES}>
                  {reperes.map((repere, rang) => (
                    <Fragment key={`${repere.valeur}-${repere.libelle}`}>
                      {rang > 0 ? (
                        <span aria-hidden="true" style={HERO_FILET} />
                      ) : null}
                      <div>
                        <div style={HERO_REPERE_VALEUR}>{repere.valeur}</div>
                        <div style={HERO_REPERE_LIBELLE}>{repere.libelle}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>

            {heroFormulaire ? (
              <div id="besoin" style={HERO_PANNEAU_FORMULAIRE}>
                <div style={HERO_FORMULAIRE_ENTETE}>
                  <div style={HERO_FORMULAIRE_TITRE}>
                    {contenu.formulaireHeroTitre}
                  </div>
                  {contenu.formulaireHeroMention ? (
                    <div style={HERO_FORMULAIRE_MENTION}>
                      {contenu.formulaireHeroMention}
                    </div>
                  ) : null}
                </div>
                {/*
                  Le même formulaire qu'en bas de page, avec un identifiant
                  d'analyse distinct : HubSpot doit pouvoir dire lequel des deux
                  a converti. `FormulaireContact` tire ses `id` de `useId()`,
                  deux montages sur une page ne se collisionnent donc pas.
                */}
                <FormulaireContact formulaire={`${formulaire}-hero`} />
              </div>
            ) : null}
          </div>
        </section>

        {/* ----------------------------------- 2. « En bref » (l. 4762) */}

        {chiffres.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.brefSurtitre || contenu.brefTitre ? (
                  <div className="mg-r2" style={ENTETE}>
                    <div>
                      {contenu.brefSurtitre ? (
                        <div style={SURTITRE_OFFRE}>{contenu.brefSurtitre}</div>
                      ) : null}
                      {contenu.brefTitre ? (
                        <h2 style={TITRE2}>{contenu.brefTitre}</h2>
                      ) : null}
                    </div>
                    {contenu.brefChapeau ? (
                      <p style={CHAPEAU}>
                        <TexteRiche texte={contenu.brefChapeau} />
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div
                  className="mg-rmulti"
                  // La maquette en pose quatre. Au-delà la grille boucle, en
                  // deçà elle se resserre : pas de colonne vide en bout.
                  style={colonnes(Math.min(chiffres.length, 4))}
                >
                  {chiffres.map((chiffre) => (
                    <div
                      key={`${chiffre.valeur}-${chiffre.libelle}`}
                      style={CARTE_CHIFFRE}
                    >
                      <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                      <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                      {chiffre.detail ? (
                        <div style={CHIFFRE_DETAIL}>
                          <TexteRiche texte={chiffre.detail} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {bandeBref ? (
                  <div style={BANDE}>
                    <span style={BANDE_TEXTE}>
                      <TexteRiche texte={bandeBref} />
                    </span>
                    {boutonBref?.libelle &&
                    boutonBref.href &&
                    cibleSure(boutonBref.href) ? (
                      <a
                        href={boutonBref.href}
                        className={styles.boutonPrincipal}
                        style={BANDE_BOUTON}
                      >
                        {boutonBref.libelle}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------- 3 à 6. les quatre sections sous condition */}

        <CommentCaMarche contenu={contenu} />
        <Formules contenu={contenu} />
        <Comparatif contenu={contenu} />
        <PremierMois contenu={contenu} />

        {/* ------------------------- 7. « Le jour et la nuit » (l. 4888) */}

        <AvantApresBascule avant={VUE_AVANT} avec={VUE_AVEC} />

        {/* Sous la bascule : le problème nommé, texte du corpus. */}
        {probleme ? <Bloc section={probleme} /> : null}

        {/* --------------------------- 8. « Ce qui est inclus » (l. 4953) */}

        {/*
          LE SURTITRE DE LA SECTION, et pourquoi il est ici plutôt que dans le
          bloc. `blocs/Offre.tsx` ne rend son en-tête que si le corpus fournit
          un titre ou une intro à la section. Aucune des dix-huit pages n'en
          a : la section la plus commerciale de la maquette sortait donc sans
          son étiquette, un tableau nu posé après le panneau du problème.

          On ne corrige pas `blocs/Offre.tsx` : il sert aussi la centaine de
          pages du gabarit de vente, et le changer de l'extérieur de ce
          chantier serait un effet de bord. Le surtitre est donc posé ici, et
          SEULEMENT quand le bloc ne va pas le poser lui-même : jamais deux
          en-têtes. Le H2 de la maquette (`{{ of.incT }}`) reste absent, le
          corpus ne l'écrivant nulle part.

          LA MARGE NÉGATIVE N'EST PAS UNE COQUETTERIE : le bloc qui suit ouvre
          sur son propre `var(--sec)`, et sans elle l'étiquette flotterait 120px
          au-dessus du tableau qu'elle nomme. On la ramène aux 34px que la
          maquette met entre un en-tête de section et son contenu
          (`ENTETE.marginBottom`). À retirer le jour où `blocs/Offre.tsx` rendra
          son surtitre sans condition.
        */}
        {offre && !offre.titre && !offre.intro ? (
          <section
            style={{ ...SECTION, marginBottom: "calc(34px - var(--sec))" }}
          >
            <div style={LARGEUR}>
              <div style={{ ...SURTITRE_OFFRE, marginBottom: 0 }}>
                Ce qui est inclus
              </div>
            </div>
          </section>
        ) : null}
        {offre ? <Bloc section={offre} /> : null}

        {/* Sous la prestation : le déroulé, les engagements, l'appel. */}
        {deroule ? <Bloc section={deroule} /> : null}
        {garanties ? <Bloc section={garanties} /> : null}
        {cta ? <Bloc section={cta} /> : null}

        {/* ------------------------------ 9. « Notre méthode » (l. 4963) */}

        <MethodeQuatreEtapes etapes={ETAPES_METHODE} />

        {/* --------------------------- 10. « Notre sélection » (l. 5015) */}

        <ProcessSelection />

        {/* ------------------ 11. « Nos dernières réalisations » (l. 5105) */}

        {preuves ? <Bloc section={preuves} /> : null}

        {/* --------------------- 12. « Questions fréquentes » (l. 5143) */}

        {objections ? <Bloc section={objections} /> : null}

        {/* ---------------------- 13. « Un autre besoin ? » (l. 5152) */}

        {autres.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.autresSurtitre || contenu.autresTitre ? (
                  <div className="mg-r2" style={ENTETE}>
                    <div>
                      {contenu.autresSurtitre ? (
                        <div style={SURTITRE_OFFRE}>
                          {contenu.autresSurtitre}
                        </div>
                      ) : null}
                      {contenu.autresTitre ? (
                        <h2 style={TITRE2}>{contenu.autresTitre}</h2>
                      ) : null}
                    </div>
                    {contenu.autresChapeau ? (
                      <p style={CHAPEAU}>
                        <TexteRiche texte={contenu.autresChapeau} />
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div
                  className="mg-r2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {autres.map((carte) => (
                    <Link
                      key={carte.href}
                      href={carte.href}
                      prefetch={false}
                      className={styles.carteAutre}
                      style={CARTE_AUTRE}
                    >
                      <span style={CARTE_AUTRE_PHRASE}>{carte.phrase}</span>
                      <span style={CARTE_AUTRE_LIBELLE}>
                        {carte.libelle} →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------- 14. le formulaire de bas de page (l. 5161) */}

        {/*
          Le titre vient du corpus : `formulaireTitre` s'il est posé, sinon la
          question de la section `ctaFinal`, qui est exactement ce que la
          maquette lie à `{{ of.form }}`. Sans ni l'un ni l'autre, les valeurs
          par défaut de `FormulaireBasDePage` jouent, elles aussi relevées dans
          la maquette : la copie n'est pas recopiée ici.
        */}
        <FormulaireBasDePage
          formulaire={formulaire}
          titre={contenu.formulaireTitre ?? ctaFinal?.question}
          intro={contenu.formulaireIntro}
        />

        {maillage ? (
          <div style={{ ...LARGEUR, paddingBottom: 80 }}>{maillage}</div>
        ) : null}
      </main>
    </div>
  );
}
