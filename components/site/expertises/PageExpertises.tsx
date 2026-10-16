import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import {
  APPEL_FINAL,
  AppelCarteMobile,
  AVANT_CHIFFRES,
  CACHE_MOBILE,
  ChiffresCarteMobile,
  FilArianeMobile,
  HERO_COMPACT,
  PANNEAU_HEROS,
  photoDeTete,
  PhotoTeteMobile,
  PliMobile,
  QuestionFinaleMobile,
  QUEUE_MAILLAGE,
  RACINE_MOBILE,
  RANGEE_PASTILLE_HEROS,
  SANS_NUMERO,
  SurtitreHerosMobile,
  TitreChiffresMobile,
  TUILES_CHIFFRES,
  ValeurChiffre,
} from "@/components/site/expertises/mobile";
import TelephoneHeros from "@/components/site/offre/TelephoneHeros";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import { CIBLE_CONTACT } from "@/components/site/mobile/conversion-donnees";
import AppelFinal from "@/components/site/offre/AppelFinal";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import PagesLiees from "@/components/site/offre/PagesLiees";
import OuvreLaCible from "@/components/site/implantation/OuvreLaCible";
import PanneauHerosRepliable from "@/components/site/implantation/PanneauHerosRepliable";
import PointsOffre from "@/components/site/offre/PointsOffre";
import ProblemeOffre from "@/components/site/offre/ProblemeOffre";
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
import {
  estHubExpertises,
  type ContenuExpertises,
  type ContenuHubExpertises,
} from "@/types/expertises";

import Domaines from "./Domaines";
import { APPELS_GARANTIES } from "./corpus-mobile";
import {
  CONTENU_HUB_EXPERTISES,
  PROBLEME_MOBILE_HUB,
  TITRE_HUB_EXPERTISES,
} from "./expertises-donnees";
import ReponseDirecte from "./ReponseDirecte";
import TypesMaintenance from "./TypesMaintenance";

/**
 * Le HUB `/expertises/`, gabarit « 10 Hub de rubrique », porté le 08/10 contre
 * la RÉFÉRENCE : la capture `maquette/rendu/expertises.html` (19 sections,
 * rendues par `MigenExpertise.dc.html`, dans cet ordre).
 *
 *  0. 01 Héros            pastille, H1, chapeau, bouton → #besoin, mention,
 *                         panneau de formulaire « Rappel dans l'heure »
 *  1. 01 Chiffres         trois chiffres dans UNE carte en verre
 *  2. 02 Logos            → `LogosClients`
 *  3. Réassurance         → `Reassurance`
 *  4. 02 Réponse directe  « De quoi on parle », liste 01-04   → `ReponseDirecte`
 *  5. 02 Domaines         le bento des huit domaines          → `Domaines`
 *  6. 02 Types            panneau photo + rangées             → `TypesMaintenance`
 *  7. Complément 2        la carte en verre d'une phrase
 *  8. 03 Problème         « Votre problématique », puces 01-04
 *  9. 04 Offre            « L'offre », 6 points
 * 10. Appel · offre       la bande SOMBRE
 * 11. Complément 4        la carte en verre d'une phrase
 * 12. 05 Déroulé          « Notre méthode », 6 étapes
 * 13. 06 Garanties        « Notre parti pris », panneau sombre
 * 14. Marques maintenues  rail de sept familles, « Automatisme » ouvert
 * 15. 08 Références       huit cartes client
 * 16. 09 Questions        la carte sombre à photo
 * 17. Maillage            « Par où continuer ? », six pages liées
 * 18. 10 Appel final      ANCRE `#mgx-form`, visée par la FAQ
 *
 * L'ANCIEN MONTAGE (six natures en cartes, barres d'heures, neuf domaines,
 * constructeurs, secteurs, habilitations) venait de l'export de démonstration,
 * qui n'est le gabarit d'aucune page : la capture n'en contient aucune
 * section. Il est retiré, ses composants avec.
 *
 * LA DONNÉE. La base porte encore pour `/expertises/` l'ANCIENNE forme, et ne
 * peut pas être réécrite (CLAUDE.md §15) ; le relais disque de `lib/contenu.ts`
 * ne joue pas pour une ligne qui a déjà un gabarit. Une ligne à l'ancienne
 * forme est donc remplacée ici par `CONTENU_HUB_EXPERTISES`, H1 compris, et
 * une ligne à la forme hub (`estHubExpertises`) est servie telle quelle : le
 * jour où l'import l'écrit, la base reprend la main sans que rien ne bouge.
 *
 * Les écrans partagés avec le gabarit 03 sont IMPORTÉS de
 * `components/site/offre/`, jamais recopiés. Composant SERVEUR. Fil d'Ariane
 * et maillage du cocon restent en props (CLAUDE.md §4).
 *
 * LA COUCHE MOBILE V2 (14/10), sous 881 px seulement, le bureau ne bouge pas :
 * fil d'Ariane, héros compact (H1 à 27 px, téléphone, panneau de formulaire
 * REPLIÉ), « Toutes les pages de la rubrique » sous le héros (dc.html L501),
 * et la cadence de conversion. « De quoi on parle » (`ReponseDirecte`) reste
 * OUVERT au téléphone : c'est l'entrée de la première section numérotée,
 * celle que la maquette mobile laisse dépliée (capture m-10). Le bento des
 * domaines et le panneau des types, deux dessins de bureau de cette même
 * section, se replient : les domaines restent joignables d'un geste par les
 * pastilles du haut de page.
 */

export interface ProprietesPageExpertises {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuExpertises | ContenuHubExpertises;
  /** Identifiant d'analyse transmis à HubSpot par les formulaires. */
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

export default function PageExpertises({
  titre,
  contenu,
  formulaire,
  chemin,
  filAriane,
  maillage,
}: ProprietesPageExpertises) {
  const aJour = estHubExpertises(contenu);
  const hub = aJour ? contenu : CONTENU_HUB_EXPERTISES;
  const h1 = aJour ? titre : TITRE_HUB_EXPERTISES;

  const actions = liensSurs(hub.actions ?? []);
  const chiffres = hub.chiffres ?? [];
  const sections = hub.sections;

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  /* Même règle que `PageOffre` : la PRÉSENCE du champ monte le panneau. */
  const heroFormulaire = typeof hub.formulaireHeroTitre === "string";

  /* Le bouton du photo + CTA mobile : le CTA de la fiche (dc.html L412),
     libellé du bouton du héros, vers `/contact/` comme dans la fiche. */
  const boutonMobile = actions[0]
    ? { libelle: actions[0].libelle, href: CIBLE_CONTACT }
    : undefined;

  /* La photo du haut de page mobile, celle de la maquette : voir
     `photoDeTete` (`./mobile`). */
  const photoTete = chemin ? photoDeTete(chemin) : undefined;

  return (
    /* La racine `.mgx-root` de `MigenExpertise`. `--sec` vaut 120 px sur
       bureau, comme la capture, et 64 px sous 881 px : voir `RACINE_MOBILE`.
       Les règles mobiles du gabarit sont celles que `PageOffre.module.css`
       porte sous `.gabarit`. */
    <div className={`mg-site ${stylesOffre.gabarit} ${RACINE_MOBILE}`}>
      {/* `data-ordre-mobile` : au téléphone, logos, réassurance et marques
          (`data-mobile-apres-sections`) passent après les sections de la
          maquette, avant le bandeau « Une question sur votre site ? »
          (socle de `app/globals.css`). Le DOM ne bouge pas. */}
      <main data-ordre-mobile="" style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ------------------------------------------------ 0. « 01 Héros » */}

        <section className={`${HERO_COMPACT} ${AVANT_CHIFFRES}`} style={HERO}>
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
              {/* Fil d'Ariane, photo et surtitre « Rubrique » de la maquette
                  (dc.html L104 à L106), téléphone seulement : voir
                  `domaine/PageDomaine.tsx`, même montage. */}
              {chemin ? <FilArianeMobile chemin={chemin} /> : null}
              <PhotoTeteMobile src={photoTete} alt={h1} />
              {chemin ? <SurtitreHerosMobile chemin={chemin} /> : null}
              {hub.pastille ? (
                <div className={RANGEE_PASTILLE_HEROS} style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {hub.pastille}
                  </span>
                </div>
              ) : null}

              <h1 style={TITRE1}>{h1}</h1>

              {hub.chapeau ? (
                <p data-heros-chapeau="" style={CHAPEAU_HERO}>
                  <TexteRiche texte={hub.chapeau} />
                </p>
              ) : null}

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

              {/* « Toutes les pages de la rubrique », les pastilles de la
                  maquette mobile sous les boutons du héros (dc.html L501,
                  `kidsTop` du gabarit 10) : les onze domaines, avant le
                  chapô. Sous 881 px seulement. */}
              {chemin ? <PastillesCocon chemin={chemin} variante="enfants" /> : null}

              {hub.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>{hub.mention}</p>
              ) : null}
            </div>

            {/* G2, LE PANNEAU DE FORMULAIRE DU HÉROS N'EST PAS À L'ÉCRAN AU
                TÉLÉPHONE (`PANNEAU_HEROS`) : voir `./mobile`. */}
            {heroFormulaire ? (
              <div className={PANNEAU_HEROS}>
                <PanneauHerosRepliable
                  formulaire={formulaire}
                  titre={hub.formulaireHeroTitre!}
                  pastille={hub.formulaireHeroMention}
                />
              </div>
            ) : null}
          </div>
        </section>

        {/* -------------------------------------------- 1. « 01 Chiffres » */}

        {/* Au téléphone, la maquette les range en fin de « 01 La réponse
            directe », sous « Les chiffres Migen », en sous-cartes
            numérotées : `ChiffresCarteMobile`, dans cette carte. Cette
            section-ci sort de l'écran sous 881 px (`CACHE_MOBILE`). */}
        {chiffres.length > 0 ? (
          <section
            data-chiffres-mobile=""
            className={CACHE_MOBILE}
            style={SECTION_CHIFFRES}
          >
            <TitreChiffresMobile texte="Les chiffres Migen" />
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
                  <div style={CHIFFRE_VALEUR}>
                    <ValeurChiffre valeur={chiffre.valeur} />
                  </div>
                  <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------- 2 et 3. Logos, réassurance */}

        <LogosClients />
        <Reassurance />

        {/* LA CADENCE DE CONVERSION MOBILE. Un enfant par section numérotée
            de la maquette (dc.html L452 à L456) : 01 la réponse directe,
            02 le problème (photo + CTA après), 03 l'offre, 04 le déroulé,
            05 les garanties (bandeau après), 06 les références, puis la FAQ.
            `rappelFinal={false}` : « 10 Appel final » tient le rôle du
            rappel de bas de page, et reçoit l'ancre `#etre-rappele`. */}
        <AvecConversionMobile
          chemin={chemin ?? ""}
          gabarit="10"
          bouton={boutonMobile}
          rappelFinal={false}
        >
        {/* ------------------------------ 4 à 7. l'accueil de rubrique */}

        {/* « 01 La réponse directe » de la maquette mobile (dc.html L451) :
            UNE carte, ouverte, qui porte les quatre écrans de bureau de
            l'accueil de rubrique. Le bento des domaines et le panneau des
            types y restent repliés, sans numéro (`./Domaines`). */}
        {hub.reponse || hub.domaines || hub.types || hub.complementTypes?.length ? (
          <PliMobile
            pleinePage
            toujoursOuvert
            className={AVANT_CHIFFRES}
            titre="La réponse directe"
          >
            {hub.reponse ? <ReponseDirecte {...hub.reponse} /> : null}
            {hub.domaines ? <Domaines {...hub.domaines} /> : null}
            {hub.types ? (
              <TypesMaintenance
                {...hub.types}
                complement={hub.complementTypes?.[0]?.texte}
              />
            ) : null}
            {/* Au téléphone, sa phrase passe dans celle des types (ci-dessus)
                et la boîte sort de l'écran (`mobile.module.css`). */}
            {hub.complementTypes?.length ? (
              <ComplementsOffre blocs={hub.complementTypes} />
            ) : null}
            <ChiffresCarteMobile chiffres={chiffres} />
          </PliMobile>
        ) : null}

        {/* ------------------------------------- 8 et 9. problème, offre */}

        {/* 02 de la maquette, après « La réponse directe » : replié au
            téléphone (`pli`, repli sur demande du gabarit 03). */}
        {probleme ? (
          <ProblemeOffre
            section={probleme}
            altPhoto={h1}
            pli="replie"
            mobile={PROBLEME_MOBILE_HUB}
          />
        ) : null}

        {offre || hub.mention || hub.appelBouton || hub.complementOffre?.length ? (
          <>
            {offre ? <PointsOffre section={offre} /> : null}

            {/* ------------------------------ 10 et 11. appel, complément 4 */}

            {hub.mention || hub.appelBouton ? (
              <BandeAppel
                mention={hub.mention}
                bouton={hub.appelBouton}
                variante="sombre"
              />
            ) : null}
            {hub.complementOffre?.length ? (
              <ComplementsOffre blocs={hub.complementOffre} />
            ) : null}
          </>
        ) : null}

        {/* ------------------------------- 12 à 15. déroulé → références */}

        {/* Replié au téléphone (« 03 Le déroulé »). L'accroche est celle de la
            V3 : la première étape du corpus (`accrocheDuDeroule`), que la v2
            ne lisait pas. */}
        {deroule ? <DerouleOffre section={deroule} pli="replie" /> : null}
        {/* L'appel du corpus sous les garanties, dans la carte au téléphone
            (`AppelCarteMobile`, V3). */}
        {garanties ? (
          <GarantiesOffre section={garanties} apres={<AppelCarteMobile cta={APPELS_GARANTIES["/expertises/"]} />} />
        ) : null}
        {hub.marquesFamille || preuves ? (
          <>
            {hub.marquesFamille ? (
              <MarquesOffre
                famille={hub.marquesFamille}
                familles={hub.marquesFamilles}
              />
            ) : null}
            {/* Ouvert au téléphone : la maquette garde son carrousel de
                références déplié (dc.html L476, `isRef`). */}
            {preuves ? <ReferencesOffre section={preuves} toujoursOuvert /> : null}
          </>
        ) : null}

        {/* --------------------------------------------- 16. « 09 Questions » */}

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
        </AvecConversionMobile>

        {/* La question de l'appel final, dernière carte de la FAQ au
            téléphone (`QuestionFinaleMobile`). */}
        <QuestionFinaleMobile cta={ctaFinal} />

        {/* --------------------------------------------------- 17. Maillage */}

        {/* Hors de la cadence : section de maillage du bureau, que la
            maquette mobile ne compte pas parmi ses sections numérotées : au
            téléphone, sans numéro, avec les autres blocs absents de la
            maquette (`data-mobile-apres-sections`, `mobile.module.css`). */}
        {hub.pagesLiees?.length && hub.pagesLieesTitre ? (
          <div data-mobile-apres-sections="" className={SANS_NUMERO}>
            <PagesLiees pages={hub.pagesLiees} titre={hub.pagesLieesTitre} />
          </div>
        ) : null}

        {/* ---------------------------------------- 18. « 10 Appel final » */}

        {/* L'ancre du bandeau « Être rappelé » (`#etre-rappele`) : voir
            `specialite/PageSpecialite.tsx`. Mobile seulement. */}
        {/* La carte « Être rappelé » de la maquette, qui clôt la page au
            téléphone et porte l'ancre `#etre-rappele` du bandeau. */}
        <RappelFinalMobile />

        {/* La capture pose `id="mgx-form"` sur cette section : la FAQ la vise. */}
        <div id="mgx-form" className={APPEL_FINAL} style={{ scrollMarginTop: 90 }}>
          <AppelFinal
            question={ctaFinal?.question}
            formulaire={formulaire}
            bouton={hub.appelBouton}
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

        {/* En dernier : voir `specialite/PageSpecialite.tsx`. */}
        <OuvreLaCible />
      </main>
    </div>
  );
}
