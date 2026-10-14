import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { resumeDe } from "@/components/site/blocs/resume-de-section";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import { CIBLE_CONTACT, ID_RAPPEL_FINAL } from "@/components/site/mobile/conversion-donnees";
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
import PliSecteur from "./PliSecteur";

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
  /**
   * Le chemin de la page, `/secteurs/aeronautique/`. Il monte la couche de
   * conversion de la maquette mobile v2 (cadence et pastilles du cocon), qui
   * n'existe que sous 881 px. Absent, la page rend son seul dessin de bureau.
   */
  chemin?: string;
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
  chemin,
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

  /* Les bandes « Appel » ne répètent que la mention et le bouton du héros. La
     maquette mobile v2 n'en dessine aucune : sa cadence (photo + CTA, bandeau
     « Être rappelé ») les remplace. Elles quittent donc l'écran sous 881 px
     (`bureauSeulement`), et leur texte reste dans le HTML servi. */
  const bandeAppel = (variante?: "sombre") =>
    bandeVisible ? (
      <div className={styles.bureauSeulement}>
        <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} variante={variante} />
      </div>
    ) : null;

  /* Le bouton du photo + CTA mobile, celui du héros (dc.html L436, `P.cta`).
     La maquette le fait viser `/contact/`, comme le corpus l'écrit
     (« [Étudier…](/contact/) · 04 78 33 72 05 »). */
  const boutonMobile = actions[0] ? { libelle: actions[0].libelle, href: CIBLE_CONTACT } : undefined;

  /*
   * LES SECTIONS DE CONTENU, dans l'ordre, telles que la cadence mobile les
   * compte (dc.html `nD` : 01 problème, 02 offre, 03 déroulé, 04 garanties,
   * 05 références, puis les questions). Le photo + CTA tombe ainsi après
   * l'offre et le bandeau après les références, comme sur la capture mobile
   * de /secteurs/aeronautique/. Les écrans de bureau que la maquette mobile ne
   * dessine pas (bandes d'appel, complément, expertises, offres du secteur,
   * marques) suivent la section du corpus qu'ils suivent déjà : l'ordre de la
   * page ne change pas d'un écran.
   */
  const sectionsContenu: ReactNode[] = [
    /* ------------------------------------------- 5. « 03 Problème » */
    probleme ? (
      <ProblemeDomaine key="probleme" section={probleme} altPhoto={titre} photo={contenu.problemePhoto} />
    ) : null,

    <Fragment key="offre">
      {/* --------------------------------------------- 6. « 04 Offre » */}
      {offre ? <PointsOffre section={offre} /> : null}

      {/* ------------------------------------------- 7. Appel · offre */}
      {bandeAppel("sombre")}

      {/* ---------------------------------------- 7 bis. Complément 4 */}
      {contenu.complementOffre?.length ? <ComplementsOffre blocs={contenu.complementOffre} /> : null}
    </Fragment>,

    /* ------------------------------------------- 8. « 05 Déroulé » */
    deroule ? (
      <PliSecteur
        key="deroule"
        pleinePage
        surtitre="Notre méthode"
        /* Le titre par défaut est celui de `DerouleOffre`, que les 12 fiches
           ne surchargent pas. */
        titre={contenu.derouleTitre ?? "Un appel. Un plan. Une ligne qui repart."}
        resume={resumeDe(deroule.etapes.map((etape) => etape.titre))}
      >
        <DerouleOffre section={deroule} titre={contenu.derouleTitre} />
      </PliSecteur>
    ) : null,

    <Fragment key="garanties">
      {/* ----------------------------------------- 9. « 06 Garanties » */}
      {garanties ? <GarantiesOffre section={garanties} /> : null}

      {/* -------------------------------------------- 10. « 07 Appel » */}
      {contenu.brefBande ? (
        <AppelOffre question={contenu.brefBande} bouton={contenu.brefBouton} mention={contenu.brefMention} />
      ) : null}

      {/* -------------------- 11 et 12. Expertises et offres du secteur */}
      {contenu.expertises?.length ? (
        <>
          <ExpertisesSecteur
            titre={contenu.expertisesTitre}
            chapeau={contenu.expertisesChapeau}
            cartes={contenu.expertises}
          />
          {/* L'enveloppe ne porte que les replis de la source, voir
              `PageSecteur.module.css` (« Offres du secteur »). */}
          <PliSecteur pleinePage surtitre="Nos offres" titre="Six façons de travailler ensemble, selon votre besoin">
            <div className={styles.offres}>
              <OffresDomaine />
            </div>
          </PliSecteur>
        </>
      ) : null}

      {/* ---------------------------------- 13. « Marques maintenues » */}
      {contenu.marquesFamille ? (
        <PliSecteur pleinePage surtitre="Marques et constructeurs" titre="Les équipements que nous maintenons déjà">
          <MarquesOffre famille={contenu.marquesFamille} familles={contenu.marquesFamilles} />
        </PliSecteur>
      ) : null}
    </Fragment>,

    <Fragment key="references">
      {/* ---------------------------------------- 14. « 08 Références » */}
      {preuves ? <ReferencesOffre section={preuves} /> : null}

      {/* ----------------------------------- 15. Appel · références */}
      {bandeAppel()}
    </Fragment>,

    /* ----------------------------------------- 16. « 09 Questions » */
    objections ? (
      <QuestionsPhoto
        key="questions"
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
    ) : null,
  ];

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
              /* HÉROS COMPACT AU TÉLÉPHONE (G2) : la maquette mobile v2 ne pose
                 aucun formulaire dans son héros, son formulaire vit en bas de
                 page. `panneauHero` masque donc le panneau sous 881 px, SAUF
                 quand il est la cible de l'adresse (`#besoin`) : tous les
                 boutons de la page qui le visent le font réapparaître et
                 défilent jusqu'à lui. Aucun bouton ne mène nulle part, le
                 panneau reste dans le HTML servi, et au-dessus de 880 px rien
                 ne change. Voir `PageSecteur.module.css`. */
              <div className={styles.panneauHero} style={{ position: "relative" }}>
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

        {/* LOGOS ET RÉASSURANCE, REPLIÉS ENSEMBLE AU TÉLÉPHONE (G3) : deux
            écrans de bureau que la maquette mobile v2 ne dessine pas (1 240 px
            à 390 px), tous deux de la preuve de confiance. L'étiquette est le
            surtitre du premier, « Ils nous font confiance », et le résumé
            nomme les deux cartes du second : rien n'est rédigé. Aucun des
            deux n'a de titre à lui : l'étiquette porte le `<h2>`. */}
        <PliSecteur
          pleinePage
          titreDeSection
          titre="Ils nous font confiance"
          resume={resumeDe(["Certifications", "Qui intervient chez vous"])}
        >
          {/* --------------------------------------------- 2. « 02 Logos » */}

          <LogosSecteur titre={contenu.logosTitre} logos={contenu.logos} />

          {/* ------------------------------------------- 3. Réassurance */}

          <Reassurance reperes={contenu.reperesReassurance} />
        </PliSecteur>

        {/* ----------------------------------------- 4. Appel · domaines */}

        {bandeAppel()}

        {chemin ? (
          <AvecConversionMobile chemin={chemin} gabarit="08" bouton={boutonMobile} rappelFinal={false}>
            {sectionsContenu}
          </AvecConversionMobile>
        ) : (
          sectionsContenu
        )}

        {/* Les pastilles « Dans la même rubrique » de la maquette mobile v2,
            juste AVANT le rappel de fin comme dans la maquette (dc.html L134,
            `kidsBottom` précède `showEndCta`). Le composant ne rend rien au-dessus
            de 880 px, ni pour une page hors index. */}
        {chemin ? (
          <div className={styles.pastilles}>
            <PastillesCocon chemin={chemin} />
          </div>
        ) : null}

        {/* ---------------------------------------- 17. « 10 Appel final » */}

        {/* L'ancre `#mgx-form` est celle de la capture, sur cette section : le
            bouton de la FAQ et celui des offres du secteur la visent.
            `#etre-rappele` est celle du bandeau « Être rappelé » de la cadence
            mobile (dc.html L437). La page pose déjà son formulaire de bas de
            page ici : le rappel final de la cadence n'est pas rendu
            (`rappelFinal={false}`), sans quoi le téléphone empilerait deux
            formulaires, et le bandeau vise celui-ci. */}
        <div id={ID_RAPPEL_FINAL} style={{ scrollMarginTop: 90 }}>
          <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
            <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={contenu.appelBouton} />
          </div>
        </div>

        {maillage ? (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>{maillage}</div>
        ) : null}
      </main>
    </div>
  );
}
