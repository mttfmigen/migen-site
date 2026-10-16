import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import {
  APPEL_FINAL,
  AppelCarteMobile,
  FilArianeMobile,
  HERO_COMPACT,
  PANNEAU_HEROS,
  photoDeTete,
  PhotoTeteMobile,
  ProseOffreMobile,
  PuceParent,
  QuestionFinaleMobile,
  QUEUE_MAILLAGE,
  RACINE_MOBILE,
  RANGEE_PASTILLE_HEROS,
  resumeOffre,
  SurtitreHerosMobile,
  TitreChiffresMobile,
  TUILES_CHIFFRES,
} from "@/components/site/expertises/mobile";
import TelephoneHeros from "@/components/site/offre/TelephoneHeros";
import OffresDomaine from "@/components/site/expertises/domaine/OffresDomaine";
import ProblemeDomaine from "@/components/site/expertises/domaine/ProblemeDomaine";
import SecteursDomaine from "@/components/site/expertises/domaine/SecteursDomaine";
import AppelFinal from "@/components/site/offre/AppelFinal";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import OuvreLaCible from "@/components/site/implantation/OuvreLaCible";
import PanneauHerosRepliable from "@/components/site/implantation/PanneauHerosRepliable";
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
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import { CIBLE_CONTACT } from "@/components/site/mobile/conversion-donnees";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuSpecialite } from "@/types/specialite";

import ComplementSpecialite from "./ComplementSpecialite";
import DomainesSpecialite from "./DomainesSpecialite";
import styles from "./PageSpecialite.module.css";

/**
 * Gabarit « 05 Spécialité », porté le 07/10 contre la RÉFÉRENCE : le rendu de
 * la maquette autonome, figé dans
 * `maquette/rendu/expertises--robotique--fanuc.html` et
 * `expertises--robotique--abb.html` (15 sections, dans cet ordre).
 *
 *  0. 01 Héros       pastille « Expertises », H1, chapeau, bouton « Demander
 *                    une intervention » → #besoin, mention des horaires,
 *                    panneau de formulaire (« Rappel dans l'heure »)
 *  1. 01 Chiffres    les chiffres de la page dans UNE carte en verre
 *  2. 02 Logos       « Ils nous font confiance »        → `LogosClients`
 *  3. Réassurance    « Certifications » + « Qui intervient chez vous »
 *  —  02 Domaines    absent des pilotes, rendu si la donnée le porte
 *                    (conditionnelle, préventive, prévisionnelle : 17 sections)
 *  —  Complément 2   absent des pilotes, la prose à tableaux de six types de
 *                    maintenance                     → `ComplementSpecialite`
 *  4. 03 Problème    « Votre problématique », puces 01-04     ← corpus
 *                    trois dessins, `variante`        → `ProblemeDomaine`
 *  5. 04 Offre       « L'offre », 7 points                     ← corpus
 *  6. Appel · offre  bande SOMBRE (fond `var(--panel)`)   → `BandeAppel`
 *  —  Complément 4   absent de fanuc et d'abb, rendu si la donnée le porte
 *                    (16 des 17 autres pages)        → `ComplementsOffre`
 *  7. 05 Déroulé     « Notre méthode », étapes 01-06           ← corpus
 *  8. 06 Garanties   « Notre parti pris », panneau sombre      ← corpus
 *  9. Secteurs       « Même expertise, contraintes différentes », copie FIXE
 * 10. Offres         « Six façons de travailler ensemble », bento, copie FIXE
 * 11. Marques        « Les équipements que nous maintenons déjà »
 *                    (+ le RAIL d'onglets quand la capture le rend : abb)
 * 12. 08 Références  « Nos références », rail de cartes        ← corpus
 * 13. 09 Questions   la carte sombre à photo `mg-faqph`        ← corpus
 * 14. 10 Appel final question du corpus + panneau, ANCRE `#mgx-form`
 *
 * MÊME DESSIN QUE LE GABARIT « 09 Domaine », et c'est MESURÉ : les squelettes
 * des sections communes de `expertises--robotique` (09) et
 * `expertises--robotique--fanuc` (05) sont identiques balise à balise, et les
 * deux écrans fixes sont identiques au caractère près sur les quatre captures
 * comparées. Les écrans sont donc IMPORTÉS, jamais recopiés : ceux du gabarit
 * 03 depuis `components/site/offre/`, les deux écrans fixes et le problème
 * depuis `components/site/expertises/domaine/`. Propres à ce gabarit : le rail
 * d'onglets de « Marques maintenues » (`marquesFamilles`, abb), et les deux
 * écrans des types de maintenance relevés le 08/10 sur les 17 autres
 * captures, « 02 Domaines » et « Complément 2 », rendus ici faute d'exister
 * ailleurs (le second porte des tableaux que `ComplementsOffre` ne sait pas
 * poser).
 *
 * LE DESSIN vient du gabarit (capture), LE TEXTE vient du corpus via le relais
 * JSON, rien ne s'invente. Composant SERVEUR. Fil d'Ariane et maillage du
 * cocon restent en props, exigés par CLAUDE.md §4 bien qu'absents de la
 * capture. Contrôle : `verification-specialite.tsx`, à côté de ce fichier.
 *
 * LA COUCHE MOBILE V2 (14/10), sous 881 px seulement, le bureau ne bouge pas :
 * fil d'Ariane, héros compact (H1 à 27 px, puce « ↑ parent », téléphone, et
 * le panneau de formulaire REPLIÉ), sections de bureau repliées, prose de
 * l'offre remise, « Dans la même rubrique », et la cadence de conversion
 * (`AvecConversionMobile`). Voir `../mobile.tsx` et la méthode ci-dessous.
 */

export interface ProprietesPageSpecialite {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuSpecialite;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /** Le chemin de la page (`page.path`), pour la couche mobile. */
  chemin?: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/** La section du corpus de ce type, s'il y en a une. Sans elle, rien. */
function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}

export default function PageSpecialite({
  titre,
  contenu,
  formulaire,
  chemin,
  filAriane,
  maillage,
}: ProprietesPageSpecialite) {
  const actions = liensSurs(contenu.actions ?? []);
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections ?? [];

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const appel = sectionDeType(sections, "cta");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  /* Même règle que `PageOffre` : la PRÉSENCE du champ monte le panneau, sa
     vérité n'est pas testée, un en-tête vide reste un panneau. */
  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";

  /* « La réponse directe » (02 Domaines, Complément 2) ouvre la page des types
     de maintenance qui la portent : c'est alors elle, la première section
     numérotée, que la maquette mobile laisse ouverte, et le problème se
     replie (dc.html L451). */
  const aReponseDirecte =
    !!(contenu.domainesTitre && contenu.domaines?.length) ||
    !!contenu.complementTypes?.length;

  /* Le bouton du photo + CTA mobile : le CTA de la fiche (dc.html L412,
     `P.cta`), le libellé du bouton du héros, vers `/contact/` comme dans la
     fiche (« > [Demander un automaticien](/contact/) »). */
  const boutonMobile = actions[0]
    ? { libelle: actions[0].libelle, href: CIBLE_CONTACT }
    : undefined;

  /* La photo du haut de page mobile, celle de la maquette : voir
     `photoDeTete` (`../mobile`). */
  const photoTete = chemin ? photoDeTete(chemin) : undefined;

  return (
    /* La racine `.mgx-root` de `MigenExpertise`. `--sec` vaut 120 px sur
       bureau, comme la capture, et 64 px sous 881 px : voir `RACINE_MOBILE`.
       Les règles mobiles du gabarit sont celles que `PageOffre.module.css`
       porte sous `.gabarit`. */
    <div className={`mg-site ${stylesOffre.gabarit} ${RACINE_MOBILE}`}>
      {/* `data-ordre-mobile` : au téléphone, les blocs que la maquette
          mobile ne porte pas (logos, réassurance, secteurs, offres, marques,
          `data-mobile-apres-sections`) passent après ses sections, avant le
          bandeau « Une question sur votre site ? » et la FAQ (socle de
          `app/globals.css`). Le DOM, celui du bureau et de Google, ne bouge
          pas. */}
      <main data-ordre-mobile="" style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ------------------------------------------------ 0. « 01 Héros » */}

        <section className={HERO_COMPACT} style={HERO}>
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
            <div data-heros-colonne="">
              {/* Le fil d'Ariane de la maquette (dc.html L104), en tête de la
                  colonne du héros (socle : une ligne, 12 px). */}
              {chemin ? <FilArianeMobile chemin={chemin} /> : null}
              <PhotoTeteMobile src={photoTete} alt={titre} />
              {chemin ? <SurtitreHerosMobile chemin={chemin} /> : null}
              {contenu.pastille ? (
                <div className={RANGEE_PASTILLE_HEROS} style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {contenu.pastille}
                  </span>
                </div>
              ) : null}

              <h1 style={TITRE1}>{titre}</h1>

              {contenu.chapeau ? (
                <p data-heros-chapeau="" style={CHAPEAU_HERO}>
                  <TexteRiche texte={contenu.chapeau} />
                </p>
              ) : null}

              {chemin ? <PuceParent chemin={chemin} /> : null}

              {actions.length > 0 ? (
                <div data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
                  {actions.map((action) =>
                    action.href.startsWith("#") ? (
                      <a
                        key={action.href}
                        href={action.href}
                        className={stylesOffre.boutonPrincipal}
                        style={BOUTON_HERO}
                      >
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
                  <TelephoneHeros />
                </div>
              ) : null}

              {contenu.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>{contenu.mention}</p>
              ) : null}
            </div>

            {/* G2, LE PANNEAU DE FORMULAIRE SE REPLIE AU TÉLÉPHONE. La maquette
                mobile ne met aucun formulaire dans le héros ; le déplacer
                aurait changé le bureau, qui le pose dans la grille du héros.
                Il est donc replié, jamais retiré, par la bascule que le
                gabarit ville a posée pour le même panneau
                (`implantation/PanneauHerosRepliable`, même balisage que
                l'enveloppe d'origine, `position: relative` compris) : un
                panneau de formulaire n'a pas de titre de niveau, et les deux
                portes du repli des sections (`verifie-blocs-pliables`,
                `verifie-titres-replies`) refusent `SectionPliableMobile` sans
                lui. L'ancre `#besoin` rouvre le pli, par `OuvreLaCible`
                monté en fin de page, sur tous les moteurs. */}
            {heroFormulaire ? (
              <div className={PANNEAU_HEROS}>
                <PanneauHerosRepliable
                  formulaire={formulaire}
                  titre={contenu.formulaireHeroTitre!}
                  pastille={contenu.formulaireHeroMention}
                />
              </div>
            ) : null}
          </div>
        </section>

        {/* -------------------------------------------- 1. « 01 Chiffres » */}

        {/* Les chiffres de la capture, « +200 / Clients industriels
            accompagnés » compris (README de passation : +200, jamais
            « réguliers »). `g3-hs`, comme la capture : une colonne sous 620 px. */}
        {chiffres.length > 0 ? (
          <section data-chiffres-mobile="" style={SECTION_CHIFFRES}>
            <TitreChiffresMobile />
            <div
              className={`g3-hs ${TUILES_CHIFFRES}`}
              data-tuiles-chiffres=""
              style={{
                ...GRILLE_CHIFFRES,
                gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))`,
              }}
            >
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

        {/* --------------------------------------------- 2. « 02 Logos » */}

        {/* Logos et réassurance : des cartes sans numéro, que le téléphone
            range après les sections de la maquette (leurs composants portent
            `data-mobile-apres-sections`). */}
        <LogosClients />

        {/* -------------------------------------------- 3. Réassurance */}

        <Reassurance />

        {/* LA CADENCE DE CONVERSION MOBILE, posée entre les sections de
            contenu (rien au-dessus de 880 px). Chaque ENFANT compte pour une
            section numérotée de la maquette (dc.html L452 à L456, `nD`) : le
            photo + CTA tombe après la 2e, le bandeau « Être rappelé » après la
            5e. Les sections de bureau que la maquette ne dessine pas
            (secteurs, offres, marques) sont regroupées avec les références,
            pour que le bandeau tombe après elles comme dans la maquette.
            `rappelFinal={false}` : la page pose déjà son formulaire de bas de
            page (« 10 Appel final ») là où la maquette pose le rappel ; il
            reçoit l'ancre `#etre-rappele` que vise le bandeau, plus bas. */}
        <AvecConversionMobile
          chemin={chemin ?? ""}
          gabarit="05"
          bouton={boutonMobile}
          rappelFinal={false}
        >
        {/* ------------------- 3 bis et 3 ter. « 02 Domaines », « Complément 2 » */}

        {/* Absents des pilotes. Rendus par les types de maintenance : voir
            `DomainesSpecialite.tsx` et `ComplementSpecialite.tsx`. C'est « La
            réponse directe » du corpus : UNE section pour la cadence, ouverte
            au téléphone comme la première section de la maquette. */}
        {aReponseDirecte ? (
          <>
            {contenu.domainesTitre && contenu.domaines?.length ? (
              <DomainesSpecialite
                titre={contenu.domainesTitre}
                cartes={contenu.domaines}
              />
            ) : null}
            {contenu.complementTypes?.length ? (
              <ComplementSpecialite blocs={contenu.complementTypes} />
            ) : null}
          </>
        ) : null}

        {/* ------------------------------------------ 4. « 03 Problème » */}

        {/* `ProblemeDomaine` et non `ProblemeOffre` : les trois dessins de la
            source (`pbSplit`, `pbCards`, `pbDark`), le gabarit 09 les porte
            valeur pour valeur. Le dessin « colonne » (fanuc) lui reste
            délégué à `ProblemeOffre`, inchangé ; « rangee » (abb et trois
            autres pages) et « panneau-sombre » (neuf pages) prennent enfin
            ceux de leurs captures. */}
        {probleme ? (
          <ProblemeDomaine
            section={probleme}
            altPhoto={titre}
            photo={contenu.problemePhoto}
            pli={aReponseDirecte ? "replie" : "ouvert"}
          />
        ) : null}

        {/* L'offre, sa prose, la bande d'appel et « Complément 4 » : une
            seule section du corpus, « ## L’offre », pour la cadence. */}
        {offre || contenu.mention || contenu.appelBouton || contenu.complementOffre?.length ? (
        <>
        {/* --------------------------------------------- 5. « 04 Offre » */}

        {offre ? (
          <PointsOffre
            section={offre}
            resume={resumeOffre(offre, contenu.complementOffre)}
          />
        ) : null}

        {/* La prose de l'offre et ses liens internes, au téléphone seulement :
            voir `ProseOffreMobile`. */}
        {offre?.prose?.length ? <ProseOffreMobile prose={offre.prose} /> : null}

        {/* ------------------------------------------- 6. Appel · offre */}

        {/* UNE SEULE bande sur ce gabarit, et la capture la rend SOMBRE (fond
            `var(--panel)`, section « Appel · offre »). Elle est rendue ICI et
            non par `BandeAppel` : les captures du 07/10 21h12 (fanuc, abb,
            robotique, et offres--residence, trois bandes) écrivent toutes
            `padding: 22px 24px 22px 30px`, là où `BandeAppel` est resté au
            relevé 11px d'une capture antérieure. La référence fait foi pour ce
            gabarit ; la remise à niveau de `BandeAppel` appartient au
            gabarit 03, qui a sa propre porte. */}
        {contenu.mention || contenu.appelBouton ? (
          <section data-bande-appel="" style={{ padding: "40px 0 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  flexWrap: "wrap",
                  padding: "22px 24px 22px 30px",
                  borderRadius: 28,
                  background: "var(--panel)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flex: "1 1 0%",
                    minWidth: 260,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "var(--acc)",
                      boxShadow: "rgba(255,124,60,.18) 0 0 0 6px",
                      flex: "0 0 auto",
                    }}
                  />
                  {contenu.mention ? (
                    <span
                      style={{
                        font: "500 15px/1.55 var(--fb)",
                        color: "rgba(255,255,255,.8)",
                      }}
                    >
                      {contenu.mention}
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="#besoin"
                    className={styles.boutonBande}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "14px 24px",
                      borderRadius: 999,
                      background: "var(--acc)",
                      color: "#fff",
                      font: "600 15px var(--fb)",
                      whiteSpace: "nowrap",
                      boxShadow: "rgba(255,124,60,.9) 0 12px 30px -12px",
                    }}
                  >
                    {contenu.appelBouton ?? "Parler à un chargé d’affaires"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* --------------------------------------- 6 bis. « Complément 4 » */}

        {/* Absent des captures pilotes (fanuc, abb : 15 sections). Les pages
            qui le portent (domaine, 16 sections) le déclarent en donnée. */}
        {contenu.complementOffre?.length ? (
          <ComplementsOffre blocs={contenu.complementOffre} />
        ) : null}
        </>
        ) : null}

        {/* ------------------------------------------- 7. « 05 Déroulé » */}

        {/* Replié au téléphone (« 03 Le déroulé »). L'accroche est celle de la
            V3 : la première étape du corpus (`accrocheDuDeroule`), que la v2
            ne lisait pas. */}
        {deroule ? <DerouleOffre section={deroule} pli="replie" /> : null}

        {/* ----------------------------------------- 8. « 06 Garanties » */}

        {/* L'appel du corpus sous les garanties, dans la carte au téléphone
            (`AppelCarteMobile`, V3). */}
        {garanties ? (
          <GarantiesOffre section={garanties} apres={<AppelCarteMobile cta={appel} />} />
        ) : null}

        {/* Secteurs, offres, marques et références : une section pour la
            cadence, celle des références (voir plus haut). */}
        <>
        {/* ---------------------------- 9. « Secteurs de l'expertise » */}

        <SecteursDomaine />

        {/* ---------------------------------- 10. « Offres du secteur » */}

        <OffresDomaine replie />

        {/* -------------------------------- 11. « Marques maintenues » */}

        {/* La capture d'abb rend le RAIL d'onglets (« Automatisme &
            électricité 10 » actif, « Robotique ») : `marquesFamilles` le
            monte, et sans lui la section est celle de fanuc, une famille
            seule. Les comptes viennent de `marques-donnees.ts`, pas d'ici. */}
        {contenu.marquesFamille ? (
          <MarquesOffre
            famille={contenu.marquesFamille}
            familles={contenu.marquesFamilles}
          />
        ) : null}

        {/* --------------------------------------- 12. « 08 Références » */}

        {/* Ouvert au téléphone : la maquette garde son carrousel de
            références déplié (dc.html L476, `isRef`). */}
        {preuves ? <ReferencesOffre section={preuves} toujoursOuvert /> : null}
        </>

        </AvecConversionMobile>

        {/* LE DÉBUT DE LA FIN DE PAGE AU TÉLÉPHONE : la FAQ et tout ce qui
            suit restent après les blocs déplacés par
            `data-mobile-apres-sections`, même sur une page trop courte pour
            que la cadence pose son bandeau (qui porte aussi ce repère).
            Masqué partout, sans texte. La FAQ est sortie de la cadence sans
            rien y changer : dernière enfant, rien ne s'insérait après elle. */}
        <div data-queue-mobile="" hidden />

        {/* --------------------------------------- 13. « 09 Questions » */}

        {/* La carte sombre à photo `mg-faqph` de la maquette : la capture ne
            montre pas la photo (elle vit dans la feuille de style de la
            classe, pas dans le DOM sérialisé), mais la maquette vivante la
            rend, et ses octets sont ceux de `faq-offre.jpg` (empreinte
            relevée le 07/10). Même écran et même composant que le gabarit 03. */}
        {objections ? (
          <QuestionsPhoto
            donnees={{
              surtitre: "Questions fréquentes",
              titre: objections.titre ?? "Vos questions avant de nous appeler",
              lienTexte: "Poser ma question",
              lienHref: "#mgx-form",
              bouton: true,
              photo: "/assets/web/faq-offre.jpg",
              questions: objections.questions.map((q) => ({
                question: q.question,
                reponse: q.reponse ?? "",
              })),
            }}
          />
        ) : null}

        {/* « Dans la même rubrique », la boîte basse de la maquette mobile
            (dc.html L506) : les spécialités sœurs. Sous 881 px seulement. */}
        {/* La question de l'appel final, dernière carte de la FAQ au
            téléphone (`QuestionFinaleMobile`). */}
        <QuestionFinaleMobile cta={ctaFinal} />

        {chemin ? <PastillesCocon chemin={chemin} variante="soeurs" /> : null}

        {/* ------------------------------------- 14. « 10 Appel final » */}

        {/* L'ancre du bandeau « Être rappelé » de la cadence mobile
            (`#etre-rappele`, dc.html L138) : elle aboutit sur le formulaire de
            bas de page, qui tient ici le rôle du rappel de la maquette. Mobile
            seulement, comme le bandeau qui la vise. */}
        {/* La carte « Être rappelé » de la maquette, qui clôt la page au
            téléphone et porte l'ancre `#etre-rappele` du bandeau. */}
        <RappelFinalMobile />

        {/* L'ANCRE `#mgx-form` est posée ici parce que la capture la pose sur
            cette section (`id="mgx-form"`, `scroll-margin-top: 90px`) : le
            bouton de la FAQ et celui du bento la visent. */}
        <div id="mgx-form" className={APPEL_FINAL} style={{ scrollMarginTop: 90 }}>
          <AppelFinal
            question={ctaFinal?.question}
            formulaire={formulaire}
            bouton={contenu.appelBouton}
          />
        </div>

        {maillage ? (
          <div
            className={QUEUE_MAILLAGE}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            {maillage}
          </div>
        ) : null}

        {/* En dernier : ses effets passent après ceux des plis, qui se
            referment au chargement (voir `implantation/OuvreLaCible`). */}
        <OuvreLaCible />
      </main>
    </div>
  );
}
