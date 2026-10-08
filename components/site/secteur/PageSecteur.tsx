import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import OffresDomaine from "@/components/site/expertises/domaine/OffresDomaine";
import ProblemeDomaine from "@/components/site/expertises/domaine/ProblemeDomaine";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";
import PointsOffre from "@/components/site/offre/PointsOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
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
} from "@/components/site/offre/habillage-offre";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import QuestionsPhoto from "@/components/site/offres/QuestionsPhoto";
import type { Section, TypeSection } from "@/types/contenu";
import { estSecteurOffre, type ContenuPageSecteur } from "@/types/secteur";

import ExpertisesSecteur from "./ExpertisesSecteur";
import LogosSecteur from "./LogosSecteur";
import PageSecteurHistorique from "./PageSecteurHistorique";

import styles from "./PageSecteur.module.css";

/**
 * Gabarit « 08 Secteur », porté le 08/10 contre la RÉFÉRENCE : le rendu de la
 * maquette autonome, figé dans `maquette/rendu/secteurs--<secteur>.html`. La
 * capture porte les écrans d'une OFFRE, plus trois écrans propres :
 *
 *  0. 01 Héros            pastille, H1, chapeau, bouton → #besoin, mention,
 *                         panneau de formulaire (« Rappel dans l'heure »)
 *  1. 01 Chiffres         les chiffres de la page dans UNE carte en verre
 *  2. 02 Logos            surtitre, GRILLE DES CLIENTS DU SECTEUR, défilement
 *  3. Réassurance         « Certifications » + « Qui intervient chez vous »
 *  4. Appel · domaines    bande claire                   → `BandeAppel`
 *  5. 03 Problème         rangée de cartes ou colonne à photo → `ProblemeDomaine`
 *                         (sa rangée est celle de la source, `pbCards`)
 *  6. 04 Offre            « L'offre », points            ← corpus
 *  7. Appel · offre       bande SOMBRE                   → `BandeAppel`
 *  7 bis. Complément 4    carte en verre (logistique)    ← capture
 *  8. 05 Déroulé          « Notre méthode »              ← corpus
 *  9. 06 Garanties        « Notre parti pris »           ← corpus
 * 10. 07 Appel            la question du corpus et son bouton
 * 11. Expertises          « Nos expertises », 4 cartes   ← capture
 * 12. Offres du secteur   « Six façons… », copie FIXE    → `OffresDomaine`
 * 13. Marques maintenues  une famille, rail d'onglets si plusieurs
 * 14. 08 Références       « Nos références », rail       ← corpus et cas liés
 * 15. Appel · références  bande claire                   → `BandeAppel`
 * 16. 09 Questions        la carte sombre à photo        ← corpus
 * 17. 10 Appel final      question du corpus + panneau, ANCRE `#mgx-form`
 *
 * Chaque écran de `components/site/offre/` est IMPORTÉ, jamais recopié : même
 * charte, un seul endroit. Les trois écrans propres au secteur vivent dans ce
 * dossier (`LogosSecteur`, `ExpertisesSecteur`) ou viennent du gabarit 09 qui
 * porte le même (`OffresDomaine`, copie identique au caractère près). Un écran
 * sans sa donnée ne se rend pas : les deux pages de logistique sans
 * « Expertises » ni « Offres du secteur » les perdent toutes les deux, comme
 * leur capture.
 *
 * L'ANCIENNE FORME (`ContenuSecteur`, sans `sections`) passe à
 * `PageSecteurHistorique` : plus aucune page ne la porte, seul
 * `implantation/PageDepartement.tsx`, hors service, la monte encore.
 *
 * Composant SERVEUR. Fil d'Ariane et maillage du cocon restent en props,
 * exigés par CLAUDE.md §4 bien qu'absents de la capture.
 */

export interface ProprietesPageSecteur {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuPageSecteur;
  /**
   * Identifiant d'analyse des soumissions, repris par HubSpot. La route le
   * fournit toujours ; il n'est facultatif que pour l'ancienne forme, qui
   * n'a pas de formulaire à elle.
   */
  formulaire?: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/** La section du corpus de ce type, s'il y en a une. Sans elle, rien. */
function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as Extract<Section, { type: T }> | undefined;
}

export default function PageSecteur({
  titre,
  contenu,
  formulaire = "cocon-secteurs",
  filAriane,
  maillage,
}: ProprietesPageSecteur) {
  if (!estSecteurOffre(contenu)) {
    return <PageSecteurHistorique titre={titre} contenu={contenu} filAriane={filAriane} maillage={maillage} />;
  }

  const actions = liensSurs(contenu.actions ?? []);
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections;

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  /* Même règle que `PageOffre` : la PRÉSENCE du champ monte le panneau. */
  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";
  const bandeVisible = !!(contenu.mention || contenu.appelBouton);

  return (
    <div className={`mg-site ${styles.gabarit}`}>
      <main style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ------------------------------------------------ 0. « 01 Héros » */}

        <section style={HERO}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: heroFormulaire ? HERO_GRILLE : "minmax(0,1fr)",
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
                  {actions.map((action) =>
                    action.href.startsWith("#") ? (
                      <a key={action.href} href={action.href} className={stylesOffre.boutonPrincipal} style={BOUTON_HERO}>
                        {action.libelle}
                      </a>
                    ) : (
                      <Link
                        key={action.href}
                        href={action.href}
                        prefetch={false}
                        className={stylesOffre.boutonPrincipal}
                        style={BOUTON_HERO}
                      >
                        {action.libelle}
                      </Link>
                    ),
                  )}
                </div>
              ) : null}

              {contenu.mention ? <p style={HERO_MENTION}>{contenu.mention}</p> : null}
            </div>

            {heroFormulaire ? (
              <div style={{ position: "relative" }}>
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
            <div
              className="mg-rmulti"
              style={{ ...GRILLE_CHIFFRES, gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))` }}
            >
              {chiffres.map((chiffre, rang) => (
                <div
                  key={`${chiffre.valeur}-${chiffre.libelle}`}
                  style={rang > 0 ? { ...CARTE_CHIFFRE, borderLeft: "1px solid var(--line)" } : CARTE_CHIFFRE}
                >
                  <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ----------------------------------------------- 2. « 02 Logos » */}

        <LogosSecteur titre={contenu.logosTitre} logos={contenu.logos} />

        {/* --------------------------------------------- 3. Réassurance */}

        <Reassurance reperes={contenu.reperesReassurance} />

        {/* ----------------------------------------- 4. Appel · domaines */}

        {bandeVisible ? <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} /> : null}

        {/* -------------------------------------------- 5. « 03 Problème » */}

        {probleme ? <ProblemeDomaine section={probleme} altPhoto={titre} photo={contenu.problemePhoto} /> : null}

        {/* ------------------------------------------------ 6. « 04 Offre » */}

        {offre ? <PointsOffre section={offre} /> : null}

        {/* --------------------------------------------- 7. Appel · offre */}

        {bandeVisible ? (
          <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} variante="sombre" />
        ) : null}

        {/* ------------------------------------------ 7 bis. Complément 4 */}

        {contenu.complementOffre?.length ? <ComplementsOffre blocs={contenu.complementOffre} /> : null}

        {/* --------------------------------------------- 8. « 05 Déroulé » */}

        {deroule ? <DerouleOffre section={deroule} titre={contenu.derouleTitre} /> : null}

        {/* ------------------------------------------- 9. « 06 Garanties » */}

        {garanties ? <GarantiesOffre section={garanties} /> : null}

        {/* ---------------------------------------------- 10. « 07 Appel » */}

        {contenu.brefBande ? (
          <AppelOffre question={contenu.brefBande} bouton={contenu.brefBouton} mention={contenu.brefMention} />
        ) : null}

        {/* ---------------------- 11 et 12. Expertises et offres du secteur */}

        {contenu.expertises?.length ? (
          <>
            <ExpertisesSecteur
              titre={contenu.expertisesTitre}
              chapeau={contenu.expertisesChapeau}
              cartes={contenu.expertises}
            />
            {/* L'enveloppe ne porte que les replis de la source, voir
                `PageSecteur.module.css` (« Offres du secteur »). */}
            <div className={styles.offres}>
              <OffresDomaine />
            </div>
          </>
        ) : null}

        {/* ------------------------------------ 13. « Marques maintenues » */}

        {contenu.marquesFamille ? (
          <MarquesOffre famille={contenu.marquesFamille} familles={contenu.marquesFamilles} />
        ) : null}

        {/* ------------------------------------------ 14. « 08 Références » */}

        {preuves ? <ReferencesOffre section={preuves} /> : null}

        {/* ------------------------------------- 15. Appel · références */}

        {bandeVisible ? <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} /> : null}

        {/* ------------------------------------------- 16. « 09 Questions » */}

        {objections ? (
          <QuestionsPhoto
            donnees={{
              surtitre: "Questions fréquentes",
              titre: objections.titre ?? "Vos questions avant de nous appeler",
              lienTexte: "Poser ma question",
              lienHref: "#mgx-form",
              bouton: true,
              photo: "/assets/web/faq-offre.jpg",
              questions: objections.questions.map((q) => ({ question: q.question, reponse: q.reponse ?? "" })),
            }}
          />
        ) : null}

        {/* ---------------------------------------- 17. « 10 Appel final » */}

        {/* L'ancre `#mgx-form` est celle de la capture, sur cette section : le
            bouton de la FAQ et celui des offres du secteur la visent. */}
        <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
          <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={contenu.appelBouton} />
        </div>

        {maillage ? (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>{maillage}</div>
        ) : null}
      </main>
    </div>
  );
}
