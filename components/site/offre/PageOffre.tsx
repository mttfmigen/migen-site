import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import AppelFinal from "./AppelFinal";
import AppelOffre from "./AppelOffre";
import BandeAppel from "./BandeAppel";
import {
  CommentCaMarche,
  Comparatif,
  Formules,
  PremierMois,
} from "./BlocsZeroArret";
import DerouleOffre from "./DerouleOffre";
import GarantiesOffre from "./GarantiesOffre";
import LogosClients from "./LogosClients";
import MaillageOffres from "./MaillageOffres";
import PanneauFormulaire from "./PanneauFormulaire";
import PointsOffre from "./PointsOffre";
import ProblemeOffre from "./ProblemeOffre";
import QuestionsOffre from "./QuestionsOffre";
import RealisationsLiees from "./RealisationsLiees";
import Reassurance from "./Reassurance";
import ReferencesOffre from "./ReferencesOffre";
import { cibleSure, liensSurs } from "./LiensOffre";
import {
  BOUTON_HERO,
  CARTE_CHIFFRE,
  CHAPEAU_HERO,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  GRILLE_CHIFFRES,
  HERO,
  HERO_GRILLE,
  HERO_MENTION,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  PASTILLE,
  PASTILLE_PUCE,
  SECTION_CHIFFRES,
  TITRE1,
} from "./habillage-offre";

import styles from "./PageOffre.module.css";

/**
 * Gabarit « 03 Offre et prestation », porté de la RÉFÉRENCE validée le 06/10 :
 * le rendu de la maquette autonome, figé dans
 * `maquette/rendu/offres--residence.html` (17 sections, dans cet ordre).
 *
 *  0. 01 Héros         pastille « Nos offres », H1, chapeau, bouton « Parler à
 *                      un chargé d'affaires » → #besoin, mention des horaires,
 *                      panneau de formulaire (pastille « Rappel dans l'heure »)
 *  1. 01 Chiffres      quatre cellules dans UNE carte en verre, sans en-tête
 *  2. 02 Logos         « Ils nous font confiance », défilement des logos
 *  3. Réassurance      « Certifications » + « Qui intervient chez vous »
 *  4. Appel            bande horaires + bouton            → `BandeAppel`
 *  5. 03 Problème      « Votre problématique », puces 01-04 ← corpus
 *  6. 04 Offre         « L'offre », 7 points fusionnés      ← corpus
 *  7. Appel            même bande                          → `BandeAppel`
 *  8. 05 Déroulé       « Notre méthode », étapes 01-06      ← corpus
 *  9. 06 Garanties     « Notre parti pris », panneau sombre ← corpus
 * 10. 07 Appel         bande-question autonome              ← `brefBande`
 * 11. 08 Références    « Nos références », cartes client    ← corpus
 * 12. Appel            même bande                          → `BandeAppel`
 * 13. 09 Questions     « Vos questions avant de nous appeler » ← corpus
 * 14. Maillage         « Un autre besoin ? Il a son offre. » bento 5 cartes
 * 15. Réalisations     « Ils nous ont confié une mission comparable » ← casLies
 * 16. 10 Appel final   question du corpus + panneau de formulaire
 *
 * LE DESSIN vient du gabarit (capture), LE TEXTE vient du corpus via le relais
 * JSON, rien ne s'invente. Les sections de l'ancien montage absentes de la
 * capture (bascule avant/après, méthode en quatre étapes, process de
 * sélection, formulaire de bas de page) sont RETIRÉES DU RENDU de ce gabarit ;
 * leurs composants restent intacts pour les gabarits qui s'en servent. Les
 * quatre sections Zéro Arrêt restent montées : sans donnée, elles ne rendent
 * rien (voir `BlocsZeroArret.tsx`).
 *
 * Composant SERVEUR. Le fil d'Ariane et le maillage du cocon restent en props,
 * exigés par CLAUDE.md §4 bien qu'absents de la capture.
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
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections ?? [];
  const autres = (contenu.autres ?? []).filter((carte) =>
    cibleSure(carte.href),
  );

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  // Le panneau de droite du héros n'existe que s'il porte un formulaire. Sans
  // titre fourni, le héros passe sur une colonne.
  const heroFormulaire = !!contenu.formulaireHeroTitre;

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

        {/* ------------------------------------------------- 0. « 01 Héros » */}

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
              {contenu.pastille ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {contenu.pastille}
                  </span>
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
                      className={styles.boutonPrincipal}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* La mention des horaires, SOUS les boutons dans la capture. */}
              {contenu.mention ? (
                <p style={HERO_MENTION}>{contenu.mention}</p>
              ) : null}
            </div>

            {heroFormulaire ? (
              <div style={{ position: "relative" }}>
                {/*
                  Le même formulaire qu'en bas de page, avec un identifiant
                  d'analyse distinct : HubSpot doit pouvoir dire lequel des
                  deux a converti.
                */}
                <PanneauFormulaire
                  id="besoin"
                  formulaire={`${formulaire}-hero`}
                  titre={contenu.formulaireHeroTitre!}
                  pastille={contenu.formulaireHeroMention}
                />
              </div>
            ) : null}
          </div>
        </section>

        {/* -------------------------------------------- 1. « 01 Chiffres » */}

        {chiffres.length > 0 ? (
          <section style={SECTION_CHIFFRES}>
            <div className="mg-rmulti" style={GRILLE_CHIFFRES}>
              {chiffres.map((chiffre, rang) => (
                <div
                  key={`${chiffre.valeur}-${chiffre.libelle}`}
                  style={
                    rang > 0
                      ? { ...CARTE_CHIFFRE, borderLeft: "1px solid var(--line)" }
                      : CARTE_CHIFFRE
                  }
                >
                  <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Les quatre sections Zéro Arrêt : inertes sans donnée. */}
        <CommentCaMarche contenu={contenu} />
        <Formules contenu={contenu} />
        <Comparatif contenu={contenu} />
        <PremierMois contenu={contenu} />

        {/* ---------------------------------------------- 2. « 02 Logos » */}

        <LogosClients />

        {/* --------------------------------------------- 3. Réassurance */}

        <Reassurance />

        {/* ----------------------------------------- 4. Appel · domaines */}

        {contenu.mention ? <BandeAppel mention={contenu.mention} /> : null}

        {/* ------------------------------------------- 5. « 03 Problème » */}

        {probleme ? <ProblemeOffre section={probleme} altPhoto={titre} /> : null}

        {/* ---------------------------------------------- 6. « 04 Offre » */}

        {offre ? <PointsOffre section={offre} /> : null}

        {/* -------------------------------------------- 7. Appel · offre */}

        {/* La capture rend CETTE bande en sombre (fond `var(--panel)`), les
            deux autres en clair : relevé du 06/10 sur le bloc 533 de
            `maquette/rendu/offres--residence.html`. */}
        {contenu.mention ? (
          <BandeAppel mention={contenu.mention} variante="sombre" />
        ) : null}

        {/* -------------------------------------------- 8. « 05 Déroulé » */}

        {deroule ? <DerouleOffre section={deroule} /> : null}

        {/* ------------------------------------------ 9. « 06 Garanties » */}

        {garanties ? <GarantiesOffre section={garanties} /> : null}

        {/* --------------------------------------------- 10. « 07 Appel » */}

        {contenu.brefBande ? (
          <AppelOffre question={contenu.brefBande} bouton={contenu.brefBouton} />
        ) : null}

        {/* ---------------------------------------- 11. « 08 Références » */}

        {preuves ? <ReferencesOffre section={preuves} /> : null}

        {/* --------------------------------------- 12. Appel · références */}

        {contenu.mention ? <BandeAppel mention={contenu.mention} /> : null}

        {/* ---------------------------------------- 13. « 09 Questions » */}

        {objections ? <QuestionsOffre section={objections} /> : null}

        {/* --------------------------------------- 14. Maillage · offres */}

        <MaillageOffres cartes={autres} />

        {/* -------------------------------------- 15. Réalisations liées */}

        {contenu.casLies?.length ? (
          <RealisationsLiees cas={contenu.casLies} />
        ) : null}

        {/* ------------------------------------- 16. « 10 Appel final » */}

        <AppelFinal question={ctaFinal?.question} formulaire={formulaire} />

        {maillage ? (
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 40px 80px",
            }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
