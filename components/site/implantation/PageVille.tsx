import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import { entreeDe, gabaritDe } from "@/components/site/cocon/maillage-mobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
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
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import PointsOffre from "@/components/site/offre/PointsOffre";
import ProblemeOffre from "@/components/site/offre/ProblemeOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuVille } from "@/types/implantation";

import { etapesDe } from "./fil-ariane-mobile";
import HubLocal from "./HubLocal";
import MaillageVille from "./MaillageVille";
import OuvreLaCible from "./OuvreLaCible";
import PanneauHerosRepliable from "./PanneauHerosRepliable";
import stylesVille from "./PageVille.module.css";
import ProblemeCartes, { ProblemePanneau } from "./ProblemeCartes";
import QuestionsVille from "./QuestionsVille";
import { DerouleRepliable } from "./SectionsRepliables";

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
 * LA COUCHE MOBILE V2 (14/10), et RIEN ne change au-dessus de 880 px :
 * chaque ajout vit sous `data-mobile-seulement` (masqué à 881 px et plus par
 * `app/globals.css`, `!important`), dans un `<summary>` que le bureau ne
 * montre pas, ou dans une règle CSS sous 880 px. Tout est relevé dans
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` :
 *
 *   · le fil d'Ariane du héros (dc.html L104, `hasCrumbs`) : `FilArianeVue`
 *     sur les étapes dérivées de l'index (`./fil-ariane-mobile`) ;
 *   · le héros compact (G2) : h1 et chapô aux tailles de la maquette, et le
 *     panneau de formulaire REPLIÉ (`PanneauHerosRepliable`), jamais retiré ;
 *   · le repli des sections (G1, G3) : le problème, première section, reste
 *     ouvert (`nOpen = 1`) ; le déroulé se replie (`SectionsRepliables`),
 *     comme l'offre, les garanties, les
 *     références, le hub local et le maillage des offres, qui le faisaient
 *     déjà ; le rythme `--sec` passe à 64 px sous 880 px ;
 *   · la cadence de conversion (`AvecConversionMobile`) : photo + CTA après
 *     la 2e section de contenu, bandeau « Être rappelé » après la 5e, sans
 *     rappel final ajouté (« 10 Appel final » le porte déjà) ;
 *   · les pastilles du maillage (dc.html L125 kidsTop et L134 kidsBottom) :
 *     `PastillesCocon` variante « enfants » sous le héros (« Départements
 *     couverts » des hubs) et variante « soeurs » avant l'appel final
 *     (« Dans la même rubrique », G5 : Lille était à ZÉRO lien vers une
 *     autre page ville, elle en porte 55).
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
  const etapes = chemin ? etapesDe(chemin) : [];
  const actions = liensSurs(contenu.actions ?? []);
  const chiffres = contenu.chiffres ?? [];
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

  /* 6 · 03 Problème : TROIS dessins, choisis par la donnée (`variante`) :
     rangée de cartes (29 pages), panneau sombre (10), colonne à photo (27, le
     défaut). La source les tire du hachage de l'URL et du nombre de puces ;
     `verification-ville.tsx` recalcule la règle. C'est la PREMIÈRE section de
     contenu, et la maquette mobile la garde OUVERTE (dc.html L451,
     `nOpen = 1` hors gabarit 01) : la rangée et la colonne ne se replient
     pas, le panneau sombre, déjà repliable, reste ouvert au chargement. */
  const blocProbleme = !probleme ? null : probleme.variante === "rangee" ? (
    <ProblemeCartes section={probleme} sansTitre={contenu.problemeSansTitre} />
  ) : probleme.variante === "panneau-sombre" ? (
    <ProblemePanneau section={probleme} sansTitre={contenu.problemeSansTitre} toujoursOuvert />
  ) : (
    <ProblemeOffre section={probleme} altPhoto={titre} photo={contenu.problemePhoto} />
  );

  // ponytail: un fragment par section du corpus, même si la section manque
  // (les 74 fichiers les portent toutes) ; une section absente décalerait la
  // cadence d'un cran, jamais au point de perdre un mot.
  const contenus = [
    <Fragment key="probleme">{blocProbleme}</Fragment>,
    /* 7 · 04 Offre, 8 · Appel · offre (sombre), Complément 4 */
    <Fragment key="offre">
      {offre ? <PointsOffre section={offre} /> : null}
      {bande("sombre")}
      {contenu.complementOffre?.length ? <ComplementsOffre blocs={contenu.complementOffre} /> : null}
    </Fragment>,
    /* 9 · 05 Déroulé, replié au téléphone (G1) */
    <Fragment key="deroule">{deroule ? <DerouleRepliable section={deroule} /> : null}</Fragment>,
    /* 10 · 06 Garanties, 11 · 07 Appel, Marques maintenues */
    <Fragment key="garanties">
      {garanties ? <GarantiesOffre section={garanties} /> : null}
      {contenu.brefBande ? (
        <AppelOffre question={contenu.brefBande} bouton={contenu.brefBouton} mention={contenu.brefMention} />
      ) : null}
      {contenu.marquesFamille ? (
        <MarquesOffre famille={contenu.marquesFamille} familles={contenu.marquesFamilles} />
      ) : null}
    </Fragment>,
    /* 12 · 08 Références, 13 · Appel · références */
    <Fragment key="preuves">
      {preuves ? <ReferencesOffre section={preuves} dateBrute /> : null}
      {bande()}
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
      <main style={{ paddingTop: 62 }}>
        {filAriane}

        {/* 0 · 01 Héros */}
        <section className={stylesVille.herosVille} style={HERO}>
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
              {/* Le fil d'Ariane de la maquette mobile (dc.html L104), sous
                  881 px seulement : les captures de bureau du gabarit n'en
                  dessinent aucun, `data-mobile-seulement` le retire du bureau
                  et les portes qui comparent à la capture l'écartent. */}
              {etapes.length > 0 ? (
                <div data-mobile-seulement="" className={stylesVille.filMobile}>
                  <FilArianeVue etapes={etapes} />
                </div>
              ) : null}
              {contenu.pastille ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {contenu.pastille}
                  </span>
                </div>
              ) : null}
              {/* Les classes ne portent que des règles mobiles (maquette
                  mobile, h1 27px/1.1 et sous-titre 15px/1.6, dc.html
                  L107-109) : au-dessus de 880 px elles sont vides, le style
                  en ligne de la capture reste seul maître. */}
              <h1 className={stylesVille.titreHerosMobile} style={TITRE1}>
                {titre}
              </h1>
              {contenu.chapeau ? (
                <p className={stylesVille.chapeauHerosMobile} style={CHAPEAU_HERO}>
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
                      className={stylesOffre.boutonPrincipal}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}
              {contenu.mention ? <p style={HERO_MENTION}>{contenu.mention}</p> : null}
            </div>
            {heroFormulaire ? (
              /* G2 : le panneau se replie au téléphone, voir le composant. */
              <PanneauHerosRepliable
                formulaire={formulaire}
                titre={contenu.formulaireHeroTitre!}
                pastille={contenu.formulaireHeroMention}
              />
            ) : null}
          </div>
        </section>

        {/* Maquette mobile, boîte HAUTE du maillage (dc.html L125, kidsTop) :
            « Départements couverts » pour les pages qui ont des enfants dans
            l'index (les hubs : Lyon en a 5). Mobile seulement, le composant
            porte lui-même `data-mobile-seulement`. */}
        {chemin ? <PastillesCocon chemin={chemin} variante="enfants" /> : null}

        {/* 1 · 01 Chiffres */}
        {chiffres.length > 0 ? (
          <section style={SECTION_CHIFFRES}>
            <div
              className="mg-rmulti"
              style={{
                ...GRILLE_CHIFFRES,
                gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))`,
              }}
            >
              {chiffres.map((chiffre, rang) => (
                <div
                  key={`${chiffre.valeur}-${chiffre.libelle}`}
                  style={
                    rang > 0 ? { ...CARTE_CHIFFRE, borderLeft: "1px solid var(--line)" } : CARTE_CHIFFRE
                  }
                >
                  <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 2 · 02 Logos, 3 · Réassurance, 4 · Appel · domaines */}
        <LogosClients />
        <Reassurance />
        {bande()}

        {/* 5 · Hub local */}
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

        {/* 14 · 09 Questions */}
        {objections ? <QuestionsVille section={objections} /> : null}

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

        {/* 16 · 10 Appel final : la capture pose l'ancre `#mgx-form` sur la
            section. `#etre-rappele` l'enveloppe : c'est la cible du bandeau
            de la couche mobile (dc.html L437), que la maquette pose sur son
            mini-formulaire de bas de page, et qui est ici ce formulaire. Une
            enveloppe sans dessin : le rendu de bureau ne bouge pas. */}
        <div id="etre-rappele" style={{ scrollMarginTop: 90 }}>
          <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
            <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={contenu.appelBouton} />
          </div>
        </div>

        {maillage ? (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>{maillage}</div>
        ) : null}

        {/* En dernier : son effet passe après ceux qui replient les blocs. */}
        <OuvreLaCible />
      </main>
    </div>
  );
}
