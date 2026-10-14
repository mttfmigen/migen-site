import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import AppelFinal from "./AppelFinal";
import AppelOffre from "./AppelOffre";
import BandeAppel from "./BandeAppel";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import CadenceOffre, { RappelFinalOffre } from "./CadenceOffre";
import EtiquettePli from "./EtiquettePli";
import {
  CommentCaMarche,
  Comparatif,
  Formules,
  PremierMois,
} from "./BlocsZeroArret";
import ComplementsOffre, { ComplementsDansCarte, premierTexte } from "./ComplementsOffre";
import DerouleOffre from "./DerouleOffre";
import GarantiesOffre from "./GarantiesOffre";
import LogosClients from "./LogosClients";
import MaillageOffres, { photosDuMaillage } from "./MaillageOffres";
import MarquesOffre from "./MarquesOffre";
import PagesLiees from "./PagesLiees";
import PanneauFormulaire from "./PanneauFormulaire";
import PointsOffre from "./PointsOffre";
import PrestationsRegroupees from "./PrestationsRegroupees";
import ProblemeOffre, { photoDuProbleme, type ProblemeMobile } from "./ProblemeOffre";
import {
  enfantsDe,
  entreeDe,
  gabaritDe,
  titreEnfants,
  TITRES_RANGEE_HAUTE,
} from "@/components/site/cocon/maillage-mobile";
import HerosMobile from "./HerosMobile";
import QuestionsPhoto from "@/components/site/offres/QuestionsPhoto";
import QuestionsOffre from "./QuestionsOffre";
import RealisationsLiees from "./RealisationsLiees";
import Reassurance from "./Reassurance";
import ReferencesOffre from "./ReferencesOffre";
import ReponseDirecte from "./ReponseDirecte";
import TelephoneHeros from "./TelephoneHeros";
import TypesMaintenance from "./TypesMaintenance";
import { cibleSure, liensSurs } from "./LiensOffre";
import { OFFRES_MOBILE } from "./maquette-mobile-offre";
import { appliqueDecisions } from "@/lib/decisions-copie";
import PageEdito from "./generique/PageEdito";
import PageVente from "./generique/PageVente";
import { ficheGenerique, vueDe } from "./generique/vue";
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
import { etapesFilAriane } from "@/components/site/expertises/mobile";

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
 * 11. Regroupées       « Les prestations regroupées ici »   ← `prestationsRegroupees`
 * 12. 08 Références    « Nos références », cartes client    ← corpus
 * 13. Appel            même bande                          → `BandeAppel`
 * 14. 09 Questions     « Vos questions avant de nous appeler » ← corpus
 * 15. Maillage         « Un autre besoin ? Il a son offre. » bento 5 cartes
 * 16. Réalisations     « Ils nous ont confié une mission comparable » ← casLies
 * 17. 10 Appel final   question du corpus + panneau de formulaire
 *
 * LA SECTION 11 N'EST PAS DANS LA CAPTURE DE LA PAGE PILOTE (17 sections) :
 * elle est dans celle de `/offres/zero-arret/` (18 sections), qui absorbe une
 * offre redirigée par la maquette. Montée le 07/10, elle est INERTE sans
 * `contenu.prestationsRegroupees`, donc le rendu des autres pages du gabarit
 * ne change pas. Voir `PrestationsRegroupees.tsx`.
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
 *
 * HUIT PAGES DU GABARIT 03 NE PASSENT PAS PAR CE MONTAGE (08/10) : l'index de
 * la maquette les marque `sec: false` et son application les sert par son
 * gabarit GÉNÉRIQUE (« vente » pour six sous-pages, « édito » pour les deux de
 * /offres/residence/). Leur fiche porte `generique` ; voir `generique/`.
 */

/** La photo de la FAQ sombre du gabarit, reprise en tête de page au téléphone. */
const PHOTO_FAQ = "/assets/web/faq-offre.jpg";

/* Les intitulés des cartes « 01 » et « 02 » de la maquette mobile v2, par page :
   les H2 du corpus qu'elle rend (`maquette/contenu/site/Offres/
   offres--full-service.md`), absents du contenu de bureau. Une page absente de
   la table garde ses écrans hors cadence, comme avant. */
const CARTES_COUVERTURE_MOBILE: Readonly<
  Record<string, { couverture: string; partage: string }>
> = {
  "/offres/full-service/": {
    couverture: "Ce que recouvre la maintenance externalisée",
    partage: "Ce que vous gardez, ce que vous déléguez",
  },
};

/* LE TEXTE DU PROBLÈME QUE SEULE LA MAQUETTE MOBILE V2 REND, par page : la
   phrase clé et les paragraphes à tête grasse du corpus qu'elle lit
   (`maquette/contenu/site/Offres/offres--bureau-etudes.md`, « ## Le
   problème »), absents du contenu de bureau. Rendus sous 881 px seulement ;
   une page absente de la table ne change pas. */
const PROBLEME_MOBILE: Readonly<Record<string, ProblemeMobile>> = {
  "/offres/bureau-etudes/": {
    titre: "Un plan dessiné loin de l'atelier finit toujours par se payer au montage.",
    avant: [
      "**Le constat.** Le projet est clair dans votre tête. Personne en interne n'a le temps de le dessiner.",
    ],
    apres: [
      "**Le coût de l'inaction.** Embaucher un ingénieur ou un projeteur pour un seul projet n'a pas de sens économique. Alors le projet glisse, ou il part au montage avec des plans que personne n'a confrontés au terrain.",
      "**La réponse.** Une équipe d'études disponible au bon moment, qui voit ensuite ses conceptions tourner, vieillir et tomber en panne.",
    ],
  },
};

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
  /**
   * Le CHEMIN de la page, `/travaux-industriels/montage-industriel/`, pour les
   * seules décisions de copie à PORTÉE LIMITÉE de `lib/decisions-copie.ts`.
   *
   * POURQUOI CE GABARIT LE DESCEND : cinq libellés de la famille offre sont
   * écrits en dur dans des composants que TOUT le site partage (`Reassurance`,
   * `MarquesOffre`, `AppelFinal`, `generique/PageVente`). La décision du 12/10
   * ne vaut que pour dix pages ; sans le chemin, ces composants ne peuvent pas
   * savoir laquelle ils rendent, et la décision ne pouvait donc pas les
   * atteindre sans renommer le site entier.
   *
   * IL EST FACULTATIF, et son absence rend les règles de portée INERTES : les
   * appelants qui ne le passent pas rendent exactement ce qu'ils rendaient
   * avant le 13/10, mot pour mot.
   */
  chemin?: string;
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
  chemin,
}: ProprietesPageOffre) {
  /* Huit sous-pages du gabarit 03 ne sont PAS servies par ce gabarit dans la
     maquette : son index les marque `sec: false`, et son application les rend
     avec son gabarit générique, « vente » (6) ou « édito » (2). Leur fiche
     porte alors `generique` (le markdown découpé par la maquette), et la page
     est celle de `generique/`, calculée par le code même de la maquette. */
  const generique = ficheGenerique(contenu);
  if (generique) {
    const vue = vueDe(titre, generique);
    return (
      <>
        {filAriane}
        {vue.cVente ? (
          <PageVente v={vue} formulaire={formulaire} chemin={chemin} />
        ) : (
          <PageEdito v={vue} formulaire={formulaire} chemin={chemin} />
        )}
      </>
    );
  }

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

  /* Le panneau de droite du héros n'existe que s'il porte un formulaire. Sans
     titre fourni, le héros passe sur une colonne.

     LE TITRE VIDE COMPTE, et c'est mesuré : la capture de
     `/travaux-industriels/demantelement-industriel/` rend le panneau du héros
     avec son formulaire complet et un en-tête SANS TEXTE (bloc 48,
     `<span class="sc-interp"></span>`). Tester la vérité de la chaîne faisait
     disparaître tout le panneau, donc treize lignes de la référence. On teste
     donc sa PRÉSENCE : une page qui n'écrit pas le champ n'a toujours pas de
     panneau, une page qui écrit `""` a le panneau sans en-tête. */
  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";

  /* LA PHOTO DE TÊTE DU TÉLÉPHONE (maquette mobile v2, dc.html L105) : une
     photo que la page porte DÉJÀ sur bureau. Celle de « Votre problématique »
     d'abord, sinon celle de la FAQ à photo. Elle quitte alors son bloc au
     téléphone (`data-heros-photo-source`, module CSS) : déplacée, pas doublée. */
  const photoProbleme = probleme ? photoDuProbleme(probleme, contenu.problemePhoto) : null;
  const faqAPhoto = !!objections && !objections.chapeau;
  /* LE TEXTE ET LES PHOTOS DE LA MAQUETTE MOBILE V2 propres à cette page
     (`maquette-mobile-offre.ts`), passés par les décisions de copie. Rendus
     sous 881 px seulement ; sans entrée, la page ne change pas. */
  const mobile = chemin ? OFFRES_MOBILE[chemin] : undefined;
  const copie = (texte: string) => appliqueDecisions(texte, chemin);
  /* dc.html L224 `IMG[u]` : la maquette pose sa propre photo de tête sur
     quelques offres ; sinon, celle que la page porte déjà sur bureau. */
  const photoHeros = mobile?.photoTete ?? photoProbleme ?? (faqAPhoto ? PHOTO_FAQ : null);
  const etapesFil = chemin ? etapesFilAriane(chemin) : [];
  /* UN HUB DE RUBRIQUE (gabarit 10 de l'index, `/secteurs/`) porte le
     sur-titre « Rubrique » de la maquette (dc.html `KICK["10"]`) et sa liste
     « Toutes les pages de la rubrique » EN TÊTE, sous les boutons (dc.html
     L125, `kidsTop`), et non plus en bas de page. */
  const entreeIndex = chemin ? entreeDe(chemin) : undefined;
  const hubRubrique = !!entreeIndex && gabaritDe(entreeIndex) === "10";
  const rubriqueEnTete =
    !!chemin &&
    enfantsDe(chemin).length > 0 &&
    TITRES_RANGEE_HAUTE.includes(titreEnfants(chemin));
  const surtitreMobile = hubRubrique
    ? "Rubrique"
    : etapesFil[Math.max(0, etapesFil.length - 2)]?.titre;

  /* Les trois bandes d'appel. Elles se rendaient tant que le corpus portait
     une mention des horaires ; `/offres/zero-arret/` n'en porte pas, parce que
     la phrase de sa capture est un délai chiffré que le contrat interdit (trou
     déclaré dans `scripts/verifie-offre-rendu.mjs`), alors que la capture rend
     bien les trois bandes avec leur bouton. La bande se rend donc dès que l'un
     des deux textes existe. */
  const bandeVisible = !!(contenu.mention || contenu.appelBouton);

  /* 3 bis « Réponse directe » (sans `reponseTitre`, rien), 4 « Appel ·
     domaines », 4 bis « Types de maintenance » (sans `typesMaintenance`,
     rien) et 4 ter « Complément 2 », emplacement de la carte en verre entre
     les types et la problématique (capture de `/offres/full-service/`). Voir
     `ReponseDirecte.tsx` et `TypesMaintenance.tsx`, ajoutés le 07/10. */
  const reponse = contenu.reponseTitre ? (
    <ReponseDirecte titre={contenu.reponseTitre} texte={contenu.reponseTexte} />
  ) : null;
  const bandeDomaines = bandeVisible ? (
    <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
  ) : null;
  const types =
    contenu.typesTitre && contenu.typesMaintenance?.length ? (
      <TypesMaintenance titre={contenu.typesTitre} cartes={contenu.typesMaintenance} />
    ) : null;
  const complementTypes = contenu.complementTypes?.length ? (
    <ComplementsOffre blocs={contenu.complementTypes} />
  ) : null;
  const cartesCouverture =
    chemin && reponse ? CARTES_COUVERTURE_MOBILE[chemin] : undefined;

  return (
    /* `--sec` reste à 120 px sur mobile, comme la maquette qui tourne : son
       gabarit d'offre (embarqué) ne reprend pas la règle mobile « --sec: 64px »
       de sa page hôte, que `app/globals.css` applique à tout `.mg-site`.
       Mesuré le 08/10 à 390 px : 120 px sur /offres/residence/, 64 px sur les
       pages génériques, qui gardent donc la règle commune. */
    <div
      className={`mg-site ${styles.gabarit} ${styles.gabaritOffre}`}
      data-heros-photo-source={photoProbleme ? "probleme" : photoHeros ? "faq" : undefined}
      data-cadence-longue={cartesCouverture ? "" : undefined}
      style={{ "--sec": "120px" } as CSSProperties}
    >
      {/* `data-ordre-mobile` : au téléphone, les blocs que la maquette mobile
          ne porte pas passent après ses sections (socle de `app/globals.css`,
          « l'ordre des blocs au téléphone »). Le DOM ne bouge pas. */}
      <main data-ordre-mobile="" style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ------------------------------------------------- 0. « 01 Héros » */}

        <section data-heros-mobile="" style={HERO}>
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
            {/* `data-heros-colonne` : sous 881 px, fil d'Ariane, photo,
                sur-titre, H1, boutons côte à côte puis chapô, l'ordre de la
                maquette mobile v2 (dc.html L104 à L111). */}
            <div data-heros-colonne="">
              <HerosMobile chemin={chemin} photo={photoHeros} />
              {contenu.pastille ? (
                <div data-heros-pastille="" style={HERO_RANGEE_PASTILLE}>
                  <span
                    className={surtitreMobile ? styles.pastilleBureau : undefined}
                    style={PASTILLE}
                  >
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {contenu.pastille}
                  </span>
                  {/* LE SUR-TITRE DE LA MAQUETTE MOBILE V2 est le parent du fil
                      d'Ariane (« Offres », « Migen »), pas la pastille de
                      bureau : dc.html L106. Le texte est celui du fil, juste
                      au-dessus ; la pastille reste dans le document. */}
                  {surtitreMobile ? (
                    <span data-mobile-seulement="">{surtitreMobile}</span>
                  ) : null}
                </div>
              ) : null}

              <h1 style={TITRE1}>{titre}</h1>

              {/* Le chapô du corpus quand la maquette mobile le rend autrement :
                  sa fin (`chapeauSuite`) ou tout le chapô (`chapeau`, le texte
                  de bureau passe alors en `data-doublon-mobile`). */}
              {contenu.chapeau ? (
                <p data-heros-chapeau="" style={CHAPEAU_HERO}>
                  {mobile?.chapeau ? (
                    <>
                      <span data-doublon-mobile="">
                        <TexteRiche texte={contenu.chapeau} />
                      </span>
                      <span data-mobile-seulement="">{copie(mobile.chapeau)}</span>
                    </>
                  ) : (
                    <TexteRiche texte={contenu.chapeau} />
                  )}
                  {mobile?.chapeauSuite ? (
                    <span data-mobile-seulement=""> {copie(mobile.chapeauSuite)}</span>
                  ) : null}
                </p>
              ) : null}

              {/* Le téléphone du héros mobile suit le bouton d'action (voir
                  `TelephoneHeros`). Sans bouton, la maquette mobile le garde
                  (dc.html L111 rend toujours `hero.telL`) : sa rangée n'existe
                  alors que sous 881 px, le héros de bureau reste celui de la
                  capture. */}
              {actions.length > 0 ? (
                <div data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
                  {/* UNE ANCRE DANS LA PAGE EST UN `<a>`, PAS UN `<Link>`. Le
                      routeur de Next pose l'ancre par `history.pushState`, qui
                      ne met pas à jour `:target` : sous 881 px, le panneau
                      `#besoin` replié ne se rouvrait donc pas (mesuré le
                      14/10, adresse en `#besoin`, panneau toujours masqué). La
                      navigation native le rouvre et y défile. Même balise,
                      même dessin : le bureau ne voit aucune différence. */}
                  {actions.map((action) =>
                    action.href.startsWith("#") ? (
                      <a
                        key={action.href}
                        href={action.href}
                        className={styles.boutonPrincipal}
                        style={BOUTON_HERO}
                      >
                        {action.libelle}
                      </a>
                    ) : (
                      <Link
                        key={action.href}
                        href={action.href}
                        prefetch={false}
                        className={styles.boutonPrincipal}
                        style={BOUTON_HERO}
                      >
                        {action.libelle}
                      </Link>
                    ),
                  )}
                  <TelephoneHeros />
                </div>
              ) : (
                <div data-mobile-seulement="" data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
                  <TelephoneHeros />
                </div>
              )}

              {/* La liste de la rubrique d'un hub, sous les boutons au
                  téléphone (`PageOffre.module.css`). Mobile seulement. */}
              {rubriqueEnTete && chemin ? <PastillesCocon chemin={chemin} /> : null}

              {/* La mention des horaires, SOUS les boutons dans la capture. */}
              {contenu.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>
                  {mobile?.mention ? (
                    <>
                      <span data-doublon-mobile="">{contenu.mention}</span>
                      {mobile.accroche ? (
                        <span data-mobile-seulement="" data-heros-accroche="">
                          {copie(mobile.accroche)}
                        </span>
                      ) : null}
                      <span data-mobile-seulement="">
                        <TexteRiche texte={copie(mobile.mention)} />
                      </span>
                    </>
                  ) : (
                    contenu.mention
                  )}
                </p>
              ) : null}
            </div>

            {heroFormulaire ? (
              /* `panneauHeroBureau` : replié sous 881 px, rouvert quand
                 l'adresse vise `#besoin` (héros compact de la maquette mobile
                 v2, voir le module CSS). */
              <div className={styles.panneauHeroBureau} style={{ position: "relative" }}>
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
          <section data-chiffres-mobile="" style={SECTION_CHIFFRES}>
            {/* LE TITRE « CHIFFRES CLÉS » ET LES TUILES 2 x 2 DU TÉLÉPHONE
                (maquette mobile v2, dc.html `isStats`, « Chiffres clés » sur
                toutes les pages du gabarit). Le titre n'existe que sous
                881 px : la capture de bureau n'en porte pas. */}
            <h2 data-mobile-seulement="" data-tuiles-titre="">
              Chiffres clés
            </h2>
            {/* La maquette rend autant de colonnes que de chiffres (3 sur
                `/offres/retrofit/remise-en-etat/`, relevé 07/10) : le nombre
                vient de la donnée, pas d'un `repeat(4,…)` figé. */}
            <div
              data-tuiles-chiffres=""
              className="g3-hs"
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

        {/* Les quatre sections Zéro Arrêt : inertes sans donnée. */}
        <CommentCaMarche contenu={contenu} />
        <Formules contenu={contenu} />
        <Comparatif contenu={contenu} />
        <PremierMois contenu={contenu} />

        {/* ---------------------------------------------- 2. « 02 Logos » */}

        <LogosClients />

        {/* --------------------------------------------- 3. Réassurance */}

        <Reassurance reperes={contenu.reperesReassurance} chemin={chemin} />

        {/* 3 bis à 4 ter : rendus ici, HORS cadence, sauf sur une page dont la
            maquette mobile v2 fait de ces écrans ses cartes « 01 » et « 02 »
            (`cartesCouverture`) : ils passent alors en tête de la cadence,
            même ordre du DOM, bureau inchangé. */}
        {cartesCouverture ? null : (
          <>
            {reponse}
            {bandeDomaines}
            {types}
            {complementTypes}
          </>
        )}

        {/* ------------- 5 à 13. Le corps, et la cadence de conversion mobile */}

        {/* LA CADENCE DE LA MAQUETTE MOBILE V2 entre les sections de contenu
            (`AvecConversionMobile`) : photo + CTA après la 2e, bandeau
            « Être rappelé » après la 5e, la 8e… Chaque ENFANT compte pour une
            section, et c'est la maquette qui dit lesquelles comptent : ses
            sections numérotées du corpus (dc.html `nD`, L476). Les bandes
            d'appel et l'appel « 07 » ne sont pas des sections de contenu : un
            `Fragment` les rattache à la section qui les précède, pour qu'elles
            ne décalent pas la cadence. Tout ce que la cadence ajoute est
            masqué au-delà de 880 px ; le bureau ne bouge pas. */}
        <CadenceOffre chemin={chemin} actions={actions} photoHeros={mobile?.photoTete}>
          {/* LES CARTES « 01 » ET « 02 » DE LA MAQUETTE MOBILE V2 sur
              `/offres/full-service/` : « Ce que recouvre la maintenance
              externalisée », dépliée (réponse directe + types de maintenance),
              puis « Ce que vous gardez, ce que vous déléguez », repliée
              (complément 2). Les intitulés sont les H2 du corpus que la
              maquette rend ; l'en-tête est masqué au-dessus de 880 px. */}
          {cartesCouverture ? (
            <SectionPliableMobile
              key="couverture"
              toujoursOuvert
              enTete={<EtiquettePli titre={cartesCouverture.couverture} />}
            >
              {/* LE CORPS DE LA CARTE « 01 » DE LA MAQUETTE (dc.html `allB`,
                  `isKv`, puis le paragraphe de clôture), relevé dans le corpus.
                  Les écrans de bureau qui disent la même chose en d'autres
                  mots restent dans le DOM, hors écran au téléphone. */}
              {mobile?.couverture ? (
                <div data-mobile-seulement="">
                  <p data-mm-lead="" data-mm-phrase="">{copie(mobile.couverture.tete)}</p>
                  <p data-mm-texte="" data-mm-suite="romain">{copie(mobile.couverture.suite)}</p>
                  <ul data-mm-kv="" data-mm-compteur="">
                    {mobile.couverture.points.map((point) => (
                      <li key={point.titre}>
                        <p data-mm-kv-titre="">{copie(point.titre)}</p>
                        <p data-mm-kv-texte="">{copie(point.texte)}</p>
                      </li>
                    ))}
                  </ul>
                  <p data-mm-texte="">{copie(mobile.couverture.cloture)}</p>
                </div>
              ) : null}
              <div {...(mobile?.couverture ? { "data-doublon-mobile": "" } : {})}>
                {reponse}
                {bandeDomaines}
                {types}
              </div>
            </SectionPliableMobile>
          ) : null}

          {cartesCouverture && complementTypes ? (
            <SectionPliableMobile
              key="partage"
              enTete={<EtiquettePli titre={cartesCouverture.partage} />}
              resume={
                mobile?.resumes?.partage
                  ? copie(mobile.resumes.partage)
                  : contenu.complementTypes?.[0]?.texte
              }
            >
              {complementTypes}
            </SectionPliableMobile>
          ) : null}

          {/* ----------------------------------------- 5. « 03 Problème » */}

          {/* DÉPLIÉ AU CHARGEMENT : la première section de contenu de la
              maquette mobile (dc.html L451, `nOpen = 1`). Les 23 pages du
              gabarit ouvrent toutes sur le problème. */}
          {probleme ? (
            <ProblemeOffre
              key="probleme"
              section={probleme}
              altPhoto={titre}
              photo={contenu.problemePhoto}
              pli={cartesCouverture ? "replie" : "ouvert"}
              mobile={chemin ? PROBLEME_MOBILE[chemin] : undefined}
            />
          ) : null}

          {offre || bandeVisible || contenu.complementOffre?.length ? (
            <Fragment key="offre">
              {/* ------------------------------------------ 6. « 04 Offre » */}

              {/* Le complément de l'offre, au téléphone, DANS la carte
                  « L'offre » et en résumé de la carte repliée (maquette
                  mobile v2) ; sa carte autonome s'efface sous 881 px. */}
              {offre ? (
                <PointsOffre
                  section={offre}
                  proseMobile
                  apres={<ComplementsDansCarte blocs={contenu.complementOffre} />}
                  resume={
                    mobile?.resumes?.offre
                      ? copie(mobile.resumes.offre)
                      : offre.intro || offre.prose?.length
                        ? undefined
                        : premierTexte(contenu.complementOffre)
                  }
                />
              ) : null}

              {/* ---------------------------------------- 7. Appel · offre */}

              {/* La capture rend CETTE bande en sombre (fond `var(--panel)`),
                  les deux autres en clair : relevé du 06/10 sur le bloc 533
                  de `maquette/rendu/offres--residence.html`. */}
              {bandeVisible ? (
                <BandeAppel
                  mention={contenu.mention}
                  bouton={contenu.appelBouton}
                  variante="sombre"
                />
              ) : null}

              {/* -------------------------------- 7 bis. « Complément 4 » */}

              {/* Écran propre aux SOUS-pages du gabarit 03, absent des six
                  offres nommées : sans donnée, rien n'est rendu. Voir
                  `ComplementsOffre.tsx` (ajouté le 07/10 pour
                  `/offres/residence/prestataire-ou-salarie/`). */}
              {/* `suit="bandeAppel"` : CET emplacement vient juste après la
                  bande d'appel sombre, pas après une section de contenu. Une
                  ligne de clôture n'y clôt rien, et le texte sortait de sa
                  carte pour venir se coller sous le bouton. Corrigé le 14/10,
                  mesuré sur `/travaux-industriels/` (section de 90 px au lieu
                  de 191). */}
              {contenu.complementOffre?.length ? (
                <ComplementsOffre
                  blocs={contenu.complementOffre}
                  suit="bandeAppel"
                  doublonMobile={!!offre}
                />
              ) : null}
            </Fragment>
          ) : null}

          {deroule || contenu.complementDeroule?.length ? (
            <Fragment key="deroule">
              {/* ---------------------------------------- 8. « 05 Déroulé » */}

              {deroule ? (
                <DerouleOffre
                  section={deroule}
                  titre={contenu.derouleTitre}
                  pli="replie"
                  apres={<ComplementsDansCarte blocs={contenu.complementDeroule} />}
                  resume={
                    mobile?.resumes?.deroule === null
                      ? null
                      : premierTexte(contenu.complementDeroule)
                  }
                />
              ) : null}

              {/* -------------------------------- 8 bis. « Complément 5 » */}

              {/* Le MÊME écran que « Complément 4 », à l'emplacement que la
                  maquette lui donne APRÈS le déroulé. Ajouté le 07/10 pour
                  `/offres/residence/cahier-des-charges/`, dont la capture
                  porte les deux (« Les 4 erreurs qui coûtent cher »). Sans
                  donnée, rien. */}
              {contenu.complementDeroule?.length ? (
                <ComplementsOffre
                  blocs={contenu.complementDeroule}
                  doublonMobile={!!deroule}
                />
              ) : null}
            </Fragment>
          ) : null}

          {garanties || contenu.complementGaranties?.length || contenu.brefBande ? (
            <Fragment key="garanties">
              {/* -------------------------------------- 9. « 06 Garanties » */}

              {garanties ? (
                <GarantiesOffre
                  section={garanties}
                  apres={<ComplementsDansCarte blocs={contenu.complementGaranties} />}
                  resume={
                    mobile?.resumes?.garanties ? copie(mobile.resumes.garanties) : undefined
                  }
                />
              ) : null}

              {/* -------------------------------- 9 bis. « Complément 6 » */}

              {/* Le TROISIÈME emplacement de la même carte en verre, APRÈS
                  les garanties (gabarit 664). Ajouté le 07/10 en portant
                  `/offres/bureau-etudes/`, dont la capture porte les trois
                  emplacements, 4, 5 et 6. Sans donnée, rien n'est rendu. */}
              {contenu.complementGaranties?.length ? (
                <ComplementsOffre
                  blocs={contenu.complementGaranties}
                  doublonMobile={!!garanties}
                />
              ) : null}

              {/* ----------------------------------------- 10. « 07 Appel » */}

              {contenu.brefBande ? (
                <AppelOffre
                  question={contenu.brefBande}
                  bouton={contenu.brefBouton}
                  mention={contenu.brefMention}
                />
              ) : null}
            </Fragment>
          ) : null}

          {/* LES BLOCS 11, 11 BIS ET 12 FORMENT UNE SEULE SECTION POUR LA
              CADENCE MOBILE. « Offres regroupées » et « Marques maintenues »
              ne sont pas des sections de la maquette mobile v2 : comptés à
              part, ils décalaient le bandeau « Une question sur votre
              site ? » avant « 05 Nos références ». Au téléphone ils passent
              après les sections de la maquette (`data-mobile-apres-sections`,
              posé par leurs composants) ; au bureau, l'ordre du DOM est
              inchangé. */}
          {contenu.prestationsRegroupees || contenu.marquesFamille || preuves || bandeVisible ? (
            <Fragment key="references">
              {/* -------------------------------- 11. « Offres regroupées » */}

              {contenu.prestationsRegroupees ? (
                <PrestationsRegroupees
                  donnees={contenu.prestationsRegroupees}
                />
              ) : null}

              {/* --------------------------- 11 bis. « Marques maintenues » */}

              {/* AJOUTÉ le 07/10 en portant `/offres/depannage-industriel/panne-
                  machine/` : 38 des 210 captures du dépôt rendent ici UNE famille
                  de constructeurs, et laquelle dépend de la page. Sans
                  `marquesFamille`, rien n'est rendu : les autres pages ne bougent
                  pas. Voir `MarquesOffre.tsx`. */}
              {/* `marquesFamilles` ajoute le RAIL D'ONGLETS que rend la capture
                  de `/bureau-etudes/bureau-etude-electrique/` (07/10). Absent, la
                  section est celle d'avant. */}
              {contenu.marquesFamille ? (
                <MarquesOffre
                  famille={contenu.marquesFamille}
                  familles={contenu.marquesFamilles}
                  chemin={chemin}
                />
              ) : null}

              {/* ------------------------------------ 12. « 08 Références » */}

              {/* Le rail évite les photos du maillage de bas de page (section
                  15), qu'il rendait aussi sur trois offres : voir
                  `photosDuRail`. */}
              {preuves ? (
                <ReferencesOffre
                  section={preuves}
                  photosPrises={photosDuMaillage(autres)}
                  toujoursOuvert
                  photosMaquette={!!mobile}
                  encartMobile={
                    mobile?.encartReferences
                      ? { ...mobile.encartReferences, texte: copie(mobile.encartReferences.texte) }
                      : undefined
                  }
                />
              ) : null}

              {/* ----------------------------------- 13. Appel · références */}

              {bandeVisible ? (
                <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
              ) : null}
            </Fragment>
          ) : null}
        </CadenceOffre>

        {/* LE DÉBUT DE LA FIN DE PAGE AU TÉLÉPHONE : tout ce qui suit ce
            repère (FAQ, maillage, appel final) reste après les blocs
            déplacés par `data-mobile-apres-sections`. Masqué partout, il ne
            porte aucun texte et ne compte pour aucune porte. */}
        <div data-queue-mobile="" hidden />

        {/* ---------------------------------------- 14. « 09 Questions » */}

        {/* 14 · 09 Questions.
            DEUX HABILLAGES, et c'est la maquette qui tranche, pas nous : sur
            22 des 23 pages du gabarit 03 elle sert la CARTE SOMBRE À PHOTO
            (classe `mg-faqph`, mesuré le 07/10), titre et bouton à gauche,
            questions en une colonne à droite. UNE SEULE page, /bureau-etudes/,
            garde la liste claire à deux colonnes, et c'est elle qui porte un
            chapeau au lieu du bouton. La donnée décide donc : un chapeau veut
            dire la version plate, son absence veut dire la carte à photo.

            La divergence visuelle mesurée avant ce changement était de 64 % sur
            cette section, la pire de la page, et de loin. */}
        {objections ? (
          objections.chapeau ? (
            <QuestionsOffre section={objections} />
          ) : (
            <QuestionsPhoto
              donnees={{
                surtitre: "Questions fréquentes",
                titre: objections.titre ?? "Vos questions avant de nous appeler",
                lienTexte: "Poser ma question",
                lienHref: "#mgx-form",
                bouton: true,
                // LA photo du bloc, extraite de la maquette qui tourne le
                // 07/10 : elle y est servie par un `blob:`, donc invisible
                // dans la capture du `<main>`. Octets récupérés par XHR depuis
                // le cadre (le `fetch` de la page est enrobé et boucle), posés
                // ici. Ce n'est plus une hypothèse, c'est son fichier.
                photo: PHOTO_FAQ,
                questions: objections.questions.map((q) => ({
                  question: q.question,
                  reponse: q.reponse ?? "",
                })),
              }}
              questionFinale={
                ctaFinal && mobile?.carteFinale
                  ? {
                      question: ctaFinal.question,
                      surtitre: mobile.carteFinale.surtitre,
                      bouton: copie(mobile.carteFinale.bouton),
                      rappel: copie(mobile.carteFinale.rappel),
                    }
                  : ctaFinal
              }
            />
          )
        ) : null}

        {/* --------------------------------------- 15. Maillage · offres */}

        <MaillageOffres cartes={autres} />

        {/* --------------------- 15 bis. Maillage · « pages liées » */}

        {/* L'AUTRE écran de maillage de la maquette, celui des SOUS-pages.
            Une page n'en porte qu'un : `autres` ou `pagesLiees`, jamais les
            deux. Voir `PagesLiees.tsx` (ajouté le 07/10 pour
            `/offres/residence/prestataire-ou-salarie/`). */}
        {contenu.pagesLiees?.length && contenu.pagesLieesTitre ? (
          <PagesLiees
            pages={contenu.pagesLiees}
            titre={contenu.pagesLieesTitre}
          />
        ) : null}

        {/* -------------------------------------- 16. Réalisations liées */}

        {contenu.casLies?.length ? (
          <RealisationsLiees cas={contenu.casLies} />
        ) : null}

        {/* ------------------------------------- 17. « 10 Appel final » */}

        {/* Le panneau de l'appel final porte LE MÊME en-tête que celui du
            héros sur les 20 captures (relevé du 08/10, y compris vide sur les
            sept sous-pages où la maquette ne le renseigne pas) : il le reprend,
            et `appelBouton` ne sert plus qu'aux pages sans panneau de héros. */}
        {/* LA CIBLE DE L'ANCRE #mgx-form, que ce gabarit avait oubliée.
            Le bouton « Poser ma question » de la FAQ vise #mgx-form ; les
            captures figées posent bien cet identifiant sur l'écran « 10 Appel
            final », et les gabarits Expertises, Domaine, Spécialité et Secteur
            le font. Celui-ci et PageOffres non : le bouton ne menait nulle
            part sur 21 pages de la branche commerciale. Trouvé le 11/10.

            ELLE ÉTAIT POSÉE SUR UNE ENVELOPPE, ET CELA COÛTAIT LA PORTE G17.
            `<div id="mgx-form">` autour de `AppelFinal` sortait la section
            « 10 Appel final » de la liste des ENFANTS DIRECTS du `<main>`,
            seule liste que lit `scripts/verifie-offre-rendu.mjs`
            (`:scope > section`). La porte comptait 15 sections servies pour 16
            dans la référence, sans qu'un seul mot ait changé. L'identifiant
            descend donc DANS le composant, sur sa section, comme la capture le
            pose elle-même (`maquette/rendu/offres--residence.html`, bloc 1241,
            `id="mgx-form"` et `scroll-margin-top: 90px` sur le `<section>`). */}
        {/* LES PASTILLES DU MAILLAGE MOBILE, boîte basse de la maquette v2
            (dc.html L134, « Aller plus loin » ou « Dans la même rubrique »),
            juste AVANT l'appel de fin de page comme dans la maquette (le bloc
            `kidsBottom` précède `showEndCta`). Mobile seulement, et rien pour
            une page hors index. */}
        {chemin && !rubriqueEnTete ? <PastillesCocon chemin={chemin} /> : null}

        {/* La carte « Être rappelé » de la maquette mobile v2, cible du
            bandeau : voir `RappelFinalOffre`. */}
        <RappelFinalOffre chemin={chemin} />

        <AppelFinal
          ancre="mgx-form"
          question={ctaFinal?.question}
          formulaire={formulaire}
          bouton={heroFormulaire ? contenu.formulaireHeroTitre : contenu.appelBouton}
          chemin={chemin}
        />

        {maillage ? (
          <div
            className={styles.maillageBas}
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
