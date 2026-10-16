import { Fragment, type CSSProperties, type ReactNode } from "react";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import { entreeDe, gabaritDe } from "@/components/site/cocon/maillage-mobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre, { ComplementsDansCarte } from "@/components/site/offre/ComplementsOffre";
import EtiquettePli from "@/components/site/offre/EtiquettePli";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import PointsOffre from "@/components/site/offre/PointsOffre";
import ProblemeOffre from "@/components/site/offre/ProblemeOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuVille } from "@/types/implantation";

import ChiffresVille from "./ChiffresVille";
import HerosVille from "./HerosVille";
import HubLocal from "./HubLocal";
import MaillageVille from "./MaillageVille";
import OuvreLaCible from "./OuvreLaCible";
import PanneauHerosRepliable from "./PanneauHerosRepliable";
import stylesVille from "./PageVille.module.css";
import ProblemeCartes, { ProblemePanneau } from "./ProblemeCartes";
import QuestionsVille from "./QuestionsVille";
import { DerouleRepliable, resumeOffre } from "./SectionsRepliables";

/**
 * Les pages dont le fichier du corpus écrit ses appels EN SECTIONS
 * (« ## SECTION 7 . CTA », « ## SECTION 10 . CTA FINAL ») : la maquette mobile
 * (`migen-mobile-parse.js`, `kindOf` → "cta") en fait deux blocs sombres
 * « Passer à l'action », l'un entre 04 et 05, l'autre après les questions.
 * Mesuré le 15/10 sur les 77 fichiers de `maquette/contenu/site/Implantations/` :
 * Bordeaux seul. Partout ailleurs, la question finale est un paragraphe gras de
 * la FAQ, donc sa DERNIÈRE QUESTION, et la bande d'appel vit dans le 04 replié.
 */
const APPELS_EN_SECTIONS = new Set(["/implantations/bordeaux/"]);

/** Le sur-titre du héros dans la maquette mobile, par gabarit (dc.html L490, `KICK`). */
const SURTITRE_MOBILE: Readonly<Record<string, string>> = { "04": "Implantation", "06": "Département" };

/**
 * La photo de tête au téléphone (dc.html, `heroSrc`) : la photo de la ville
 * pour les 12 pages que liste `maquette/contenu/site/photos-villes.json`, la
 * photo de la rubrique (`FIMG.implantations`) partout ailleurs. Les deux
 * sont déjà servies par le site (photo du hub local, tête du hub).
 */
const PHOTO_VILLE_MAQUETTE = new Set([
  "/implantations/bordeaux/",
  "/implantations/lyon/",
  "/implantations/maintenance-industrielle-dunkerque/",
  "/implantations/maintenance-industrielle-le-havre/",
  "/implantations/maintenance-industrielle-lorient/",
  "/implantations/maintenance-industrielle-orleans/",
  "/implantations/maintenance-industrielle-quimper/",
  "/implantations/marseille/",
  "/implantations/nantes/",
  "/implantations/paris/",
  "/implantations/paris/rouen/",
  "/implantations/strasbourg/",
]);
const PHOTO_RUBRIQUE = "/assets/web/ph-hero-raffinerie.jpg";

/** Le bloc sombre « Passer à l'action » de la maquette (dc.html L131, `C_DARK`). */
function PasserALAction({ children, mobileSeulement }: { children: ReactNode; mobileSeulement?: boolean }) {
  return (
    <div className={stylesVille.passerAction} data-mobile-seulement={mobileSeulement ? "" : undefined}>
      <div data-mobile-seulement="" className={stylesVille.passerActionSurtitre}>
        Passer à l’action
      </div>
      {children}
    </div>
  );
}

/**
 * Gabarit « 04 Ville », 66 pages de `/implantations/`, plus les 8 du gabarit
 * « 06 Département » (08/10 : leurs captures ont exactement cette suite
 * d'écrans, hub local « Rattaché au hub » compris), refait le 07/10 contre
 * la référence du jour : le rendu figé de chaque page,
 * `maquette/rendu/implantations--<cle>.html`. Pilotes : `/implantations/lyon/`
 * (un hub) et `/implantations/maintenance-industrielle-angers/` (une ville
 * sans hub). La passation du client le dit : `MigenExpertise.dc.html` en mode
 * ville. Les sections, dans l'ordre de la capture (`data-screen-label`) :
 *
 *  0. 01 Héros            pastille, H1, chapeau, bouton → #besoin, mention,
 *                         panneau de formulaire
 *  1. 01 Chiffres         une carte en verre, autant de cellules que de chiffres
 *  2. 02 Logos            → `LogosClients`
 *  3. Réassurance         → `Reassurance`, identique sur les 66 captures
 *  4. Appel · domaines    → `BandeAppel`
 *  5. Hub local           → `HubLocal`, l'écran propre à la ville
 *  6. 03 Problème         rangée (`ProblemeCartes`), panneau sombre
 *                         (`ProblemePanneau`) ou colonne à photo
 *                         (`ProblemeOffre`), selon la capture
 *  7. 04 Offre            → `PointsOffre`
 *  8. Appel · offre       bande sombre
 *     Complément 4        9 pages sur 66, inerte sans donnée
 *  9. 05 Déroulé          → `DerouleOffre`, replié au téléphone
 *                         (`DerouleRepliable`)
 * 10. 06 Garanties        → `GarantiesOffre`
 * 11. 07 Appel            → `AppelOffre`
 *     Marques maintenues  1 page sur 66 (Bordeaux), inerte sans donnée
 * 12. 08 Références       → `ReferencesOffre`
 * 13. Appel · références  → `BandeAppel`
 * 14. 09 Questions        → `QuestionsVille` : carte `mg-faqph`, `<details>`
 *                         natifs, un seul ouvert (attribut `name`), le premier ouvert
 * 15. Maillage · offres   → `MaillageVille`, copie fixe des 66 captures
 * 16. 10 Appel final      ancre `#mgx-form`, comme la capture
 *
 * Les écrans communs avec le gabarit 03 sont IMPORTÉS de
 * `components/site/offre/`, jamais recopiés. Seuls les quatre écrans dont la
 * capture des villes diffère vivent dans ce dossier (hub local, problème en
 * rangée, questions, maillage). Composant SERVEUR : fil
 * d'Ariane et maillage du cocon restent en props (CLAUDE.md §4).
 *
 * LA MAQUETTE MOBILE V2, BLOC PAR BLOC (14/10 au soir), et RIEN ne change
 * au-dessus de 880 px. La suite des blocs au téléphone est celle de
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` (`renderVals`,
 * gabarits « 04 » et « 06 ») :
 *
 *   héros (fil · photo de la ville · sur-titre · H1 · action | téléphone)
 *   · « Départements couverts » (hubs) · chapô et horaires · « Chiffres clés »
 *   en tuiles 2 x 2 · 01 Le problème (ouvert) · 02 L'offre · photo + appel
 *   · 03 Le déroulé · 04 Ce que nous garantissons · 05 Nos références
 *   (ouvert) · « Une question sur votre site ? » · Questions fréquentes en
 *   liste de cartes · « Dans la même rubrique » · appel final
 *
 * Le dessin vient du SOCLE PARTAGÉ des gabarits à sections (`app/globals.css`,
 * `data-heros-*`, `data-mm-*`, `data-ordre-mobile`…), le même que l'offre :
 * `HerosVille`, `ChiffresVille`, les blocs de `components/site/offre/` et
 * ceux de ce dossier posent ses attributs. Les écrans de bureau que la
 * maquette ne dessine pas (logos, certifications, hub local, bande d'appel,
 * marques, offres : `data-mobile-apres-sections`) s'effacent au téléphone
 * (relecture du 15/10 : la maquette enchaîne « 05 Nos références » et le
 * bandeau « Une question sur votre site ? »), leur texte reste dans le DOM ;
 * les bandes d'appel cèdent la place à la cadence de conversion
 * (`AvecConversionMobile`). L'ordre du DOM, celui que lisent Google et le
 * bureau, ne change pas.
 *
 * Porte : `bun components/site/implantation/verification-mobile-ville.tsx`.
 */

export interface ProprietesPageVille {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuVille;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /**
   * Le chemin de la page avec slash final (« /implantations/lyon/ »), passé
   * par la route (`page.path`). Il alimente la couche mobile : fil d'Ariane
   * et pastilles du maillage, tous deux dérivés de l'index de la maquette.
   * ABSENT (anciens appels, portes), la couche mobile ne se rend pas :
   * vide plutôt que deviné.
   */
  chemin?: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/** La section du corpus de ce type, s'il y en a une : la place vient du gabarit. */
function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}


export default function PageVille({
  titre,
  contenu,
  formulaire,
  chemin,
  filAriane,
  maillage,
}: ProprietesPageVille) {
  const actions = liensSurs(contenu.actions ?? []);
  const sections = contenu.sections ?? [];

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";
  const bandeVisible = !!(contenu.mention || contenu.appelBouton);
  const bande = (variante?: "sombre") =>
    bandeVisible ? (
      <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} variante={variante} />
    ) : null;

  /* Le gabarit de l'index (« 04 » ou « 06 ») : sans entrée d'index, pas de
     cadence plutôt qu'un gabarit deviné. */
  const entree = chemin ? entreeDe(chemin) : undefined;
  const cadence = entree ? gabaritDe(entree) : undefined;
  const appelsEnSections = !!chemin && APPELS_EN_SECTIONS.has(chemin);
  /* L'appel final du corpus, porté au téléphone par la FAQ ou par un bloc
     sombre. Sans libellé de bouton dans la section, celui du panneau du bas
     (`appelBouton`), le même texte que la maquette met sous la question. */
  const appelDeFin = ctaFinal?.question
    ? { ...ctaFinal, bouton: ctaFinal.bouton || contenu.appelBouton || "" }
    : undefined;
  const appelBref = contenu.brefBande ? (
    <AppelOffre question={contenu.brefBande} bouton={contenu.brefBouton} mention={contenu.brefMention} />
  ) : null;

  /* 6 · 03 Problème : TROIS dessins, choisis par la donnée (`variante`) :
     rangée de cartes (35 pages), panneau sombre (10), colonne à photo (29, le
     défaut). La source les tire du hachage de l'URL et du nombre de puces ;
     `verification-ville.tsx` recalcule la règle. C'est la PREMIÈRE section de
     contenu, « 01 Le problème », et la maquette mobile la garde OUVERTE
     (dc.html, `nOpen = 1` hors gabarit 01) : les trois dessins sont une
     carte repliable dépliée au chargement. */
  const blocProbleme = !probleme ? null : probleme.variante === "rangee" ? (
    <ProblemeCartes section={probleme} sansTitre={contenu.problemeSansTitre} />
  ) : probleme.variante === "panneau-sombre" ? (
    <ProblemePanneau section={probleme} sansTitre={contenu.problemeSansTitre} toujoursOuvert />
  ) : (
    <ProblemeOffre section={probleme} altPhoto={titre} photo={contenu.problemePhoto} pli="ouvert" />
  );

  // ponytail: un fragment par section du corpus, même si la section manque
  // (les 74 fichiers les portent toutes) ; une section absente décalerait la
  // cadence d'un cran, jamais au point de perdre un mot.
  const contenus = [
    <Fragment key="probleme">{blocProbleme}</Fragment>,
    /* 7 · 04 Offre, 8 · Appel · offre (sombre), Complément 4. Au téléphone, le
       complément est rangé DANS « 02 L'offre » et en fait le résumé, comme la
       maquette (son paragraphe d'après le tableau) et la page d'offre ; sa
       carte autonome s'efface sous 881 px (`doublonMobile`). */
    <Fragment key="offre">
      {offre ? (
        <PointsOffre
          section={offre}
          apres={<ComplementsDansCarte blocs={contenu.complementOffre} />}
          resume={resumeOffre(offre, contenu.complementOffre)}
        />
      ) : null}
      {bande("sombre")}
      {contenu.complementOffre?.length ? (
        <ComplementsOffre blocs={contenu.complementOffre} doublonMobile={!!offre} />
      ) : null}
    </Fragment>,
    /* 9 · 05 Déroulé, « 03 Le déroulé » replié au téléphone */
    <Fragment key="deroule">{deroule ? <DerouleRepliable section={deroule} /> : null}</Fragment>,
    /* 10 · 06 Garanties, 11 · 07 Appel, Marques maintenues (hors maquette
       mobile : après les sections au téléphone) */
    <Fragment key="garanties">
      {garanties ? <GarantiesOffre section={garanties} /> : null}
      {/* Au téléphone : bloc sombre « Passer à l'action » entre 04 et 05 si le
          corpus l'écrit en section (Bordeaux) ; sinon la maquette le range
          DANS le 04 replié, et la bande, absente de sa colonne, s'efface
          (`data-mobile-apres-sections`, texte gardé dans le DOM). */}
      {appelBref && appelsEnSections ? <PasserALAction>{appelBref}</PasserALAction> : appelBref}
      {contenu.marquesFamille ? (
        /* Hors maquette mobile : après les sections, en carte repliée sans
           numéro ; l'étiquette reprend le sur-titre et le H2 du bloc. Au-dessus
           de 880 px, la bascule n'existe pas (`blocPliablePartage`). */
        <div data-mobile-apres-sections="" className={`${stylesOffre.blocPliablePartage} ${stylesVille.repliHorsSection}`}>
          <SectionPliableMobile
            enTete={<EtiquettePli surtitre="Marques et constructeurs" titre="Les équipements que nous maintenons déjà" />}
            numero={false}
          >
            <MarquesOffre famille={contenu.marquesFamille} familles={contenu.marquesFamilles} />
          </SectionPliableMobile>
        </div>
      ) : null}
    </Fragment>,
    /* 12 · 08 Références, « 05 Nos références », ouvert au téléphone comme
       dans la maquette (dc.html : `isRef` ouvre la carte), 13 · Appel ·
       références. LE REPÈRE `data-queue-mobile` ferme la suite des sections :
       au téléphone, tout ce qui le suit (le bandeau « Une question sur votre
       site ? », les questions, la fin de page) passe après les écrans hors
       maquette (socle, `main[data-ordre-mobile]`). Sans boîte, sans texte. */
    <Fragment key="preuves">
      {preuves ? <ReferencesOffre section={preuves} dateBrute toujoursOuvert /> : null}
      {bande()}
      <span data-queue-mobile="" hidden />
    </Fragment>,
  ];

  return (
    /* La ville est rendue par le même gabarit embarqué que l'offre
       (`MigenExpertise.dc.html`) : mêmes règles mobiles, portées par
       `stylesOffre.gabarit`, et `--sec` qui reste à 120 px sous 760 px.
       Mesuré le 08/10 à 390 px sur /implantations/lyon/ : 120 px dans la
       maquette, 64 px sur le site sans cette ligne. */
    <div
      className={`mg-site ${stylesOffre.gabarit} ${stylesVille.racineVille}`}
      style={{ "--sec": "120px" } as CSSProperties}
    >
      {/* `data-ordre-mobile` : au téléphone, la colonne de la maquette (socle
          partagé, `app/globals.css`). Au-dessus de 880 px, aucune règle. */}
      <main data-ordre-mobile="" style={{ paddingTop: 62 }}>
        {filAriane}

        {/* 0 · 01 Héros */}
        <HerosVille
          titre={titre}
          pastille={contenu.pastille}
          chapeau={contenu.chapeau}
          actions={actions}
          mention={contenu.mention}
          chemin={chemin}
          chapeauHaut={appelsEnSections}
          surtitreMobile={cadence ? SURTITRE_MOBILE[cadence] : undefined}
          photo={chemin && !PHOTO_VILLE_MAQUETTE.has(chemin) ? PHOTO_RUBRIQUE : contenu.hubLocal?.photo}
          panneau={
            heroFormulaire ? (
              /* Masqué au téléphone tant qu'on ne le vise pas : voir le composant. */
              <PanneauHerosRepliable
                formulaire={formulaire}
                titre={contenu.formulaireHeroTitre!}
                pastille={contenu.formulaireHeroMention}
              />
            ) : undefined
          }
        />

        {/* 1 · 01 Chiffres, « Chiffres clés » en tuiles au téléphone */}
        <ChiffresVille chiffres={contenu.chiffres ?? []} />

        {/* 2 · 02 Logos, 3 · Réassurance, 4 · Appel · domaines. Au téléphone,
            logos et réassurance passent après les sections (ils portent
            `data-mobile-apres-sections`), la bande cède la place à la cadence. */}
        <LogosClients />
        <Reassurance />
        {bande()}

        {/* 5 · Hub local, après les sections au téléphone (même attribut) */}
        {contenu.hubLocal ? <HubLocal hub={contenu.hubLocal} /> : null}

        {/* 6 à 13 : LES CINQ SECTIONS DE CONTENU, et la cadence de conversion
            de la maquette mobile posée entre elles (`AvecConversionMobile`) :
            photo + CTA après la 2e, bandeau « Être rappelé » après la 5e.
            dc.html compte `nD`, les sections NUMÉROTÉES du corpus : ici
            problème, offre, déroulé, garanties, références, dans cet ordre
            sur les 74 fichiers. Les bandes d'appel, compléments, « 07 Appel »
            et marques du rendu de bureau suivent leur section DANS le même
            fragment : elles ne comptent pas, et rien n'est réordonné. */}
        {cadence ? (
          <AvecConversionMobile
            chemin={chemin!}
            gabarit={cadence}
            bouton={actions[0]}
            /* PAS DE RAPPEL FINAL AJOUTÉ, décidé sur les captures m-04 et
               m-06 : la maquette ne met en bas qu'un mini-formulaire
               « Être rappelé », et cette page pose déjà le sien juste après,
               « 10 Appel final ». Un second formulaire serait un doublon, et
               le replier casserait `RappelExpress`, qui fait défiler vers le
               dernier formulaire de la page et y pose le focus. L'ancre
               `#etre-rappele` du bandeau vise donc l'appel final (plus bas). */
            rappelFinal={false}
          >
            {contenus}
          </AvecConversionMobile>
        ) : (
          contenus
        )}

        {/* 14 · 09 Questions, « Questions fréquentes » en liste au téléphone.
            La question finale du corpus y est la DERNIÈRE question au
            téléphone (maquette : paragraphe gras de la FAQ) ; pour Bordeaux,
            un bloc sombre « Passer à l'action » juste après. */}
        {objections ? (
          <QuestionsVille section={objections} derniere={appelsEnSections ? undefined : appelDeFin} />
        ) : null}
        {appelsEnSections && appelDeFin ? (
          <PasserALAction mobileSeulement>
            <AppelOffre
              question={appelDeFin!.question}
              bouton={{ libelle: appelDeFin!.bouton, href: appelDeFin!.href ?? "#mgx-form" }}
              mention={appelDeFin!.rappel}
            />
          </PasserALAction>
        ) : null}

        {/* 15 · Maillage · offres */}
        <MaillageVille />

        {/* Maquette mobile, boîte BASSE du maillage (dc.html L134,
            kidsBottom) : « Dans la même rubrique », les sœurs de la page dans
            l'index, calcul `kidsOf(parent)` de la maquette. Une ville de
            premier niveau (Lille, Tours, mais aussi un hub comme Lyon) maille
            vers les 55 autres ; une ville ou un département sous un hub, vers
            les autres pages de ce hub. C'est LE maillage entre les pages
            villes : il était à zéro sur Lille, mesuré le 14/10. Huit
            pastilles visibles, le reste sous « Voir les N autres pages »,
            replié et jamais retiré : tous les liens restent dans le DOM. */}
        {chemin ? <PastillesCocon chemin={chemin} variante="soeurs" /> : null}

        {/* Maquette mobile, carte « Être rappelé » de bas de page (dc.html
            L138, `#etre-rappele`, la cible des bandeaux), téléphone seulement. */}
        {chemin ? <RappelFinalMobile /> : null}

        {/* 16 · 10 Appel final : la capture pose l'ancre `#mgx-form` sur la
            section. Au téléphone, la carte « Être rappelé » ci-dessus le
            remplace : il est masqué à côté d'elle (`PageVille.module.css`) et
            reparaît ouvert, sans bascule, quand on le demande (`#mgx-form`,
            ou la carte qui lui passe sa saisie). Son repli est celui que porte
            `AppelFinal` lui-même ; plus de second repli autour (16/10), qui
            faisait demander le formulaire en deux touches. Sur bureau, la
            bascule n'existe pas et le bloc est rendu tel quel. */}
        <div id={chemin ? undefined : "etre-rappele"} className={stylesVille.appelFinal} style={{ scrollMarginTop: 90 }}>
          <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
            <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={contenu.appelBouton} />
          </div>
        </div>

        {maillage ? (
          <div className={stylesVille.maillageBas} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
            {maillage}
          </div>
        ) : null}

        {/* En dernier : son effet passe après ceux qui replient les blocs. */}
        <OuvreLaCible deplieLesFormulaires />
      </main>
    </div>
  );
}
