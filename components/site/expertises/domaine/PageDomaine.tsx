import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import {
  APPEL_FINAL,
  AppelCarteMobile,
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
  SurtitreHerosMobile,
  TitreChiffresMobile,
  TUILES_CHIFFRES,
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
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuDomaine } from "@/types/domaine";

import ComplementsDomaine from "./ComplementsDomaine";
import OffresDomaine from "./OffresDomaine";
import ProblemeDomaine from "./ProblemeDomaine";
import SecteursDomaine from "./SecteursDomaine";

/**
 * Gabarit « 09 Domaine », porté le 07/10 contre la RÉFÉRENCE : le rendu de la
 * maquette autonome, figé dans `maquette/rendu/expertises--robotique.html` et
 * `expertises--automatisme.html` (16 sections, dans cet ordre).
 *
 *  0. 01 Héros       pastille « Expertises », H1, chapeau, bouton « Demander
 *                    une intervention » → #besoin, mention des horaires,
 *                    panneau de formulaire (« Rappel dans l'heure »)
 *  1. 01 Chiffres    les chiffres de la page dans UNE carte en verre
 *  2. 02 Logos       « Ils nous font confiance »        → `LogosClients`
 *  3. Réassurance    « Certifications » + « Qui intervient chez vous »
 *  3 bis. Complément 2  accueil de rubrique, carte en verre à tableau ← donnée
 *  4. 03 Problème    « Votre problématique », trois dessins     ← corpus
 *  5. 04 Offre       « L'offre », 7 points                     ← corpus
 *  6. Appel · offre  bande SOMBRE (fond `var(--panel)`)   → `BandeAppel`
 *  7. Complément 4   la carte en verre d'une phrase            ← corpus
 *  8. 05 Déroulé     « Notre méthode », étapes 01-06           ← corpus
 *  9. 06 Garanties   « Notre parti pris », panneau sombre      ← corpus
 * 10. Secteurs       « Même expertise, contraintes différentes », copie FIXE
 * 11. Offres         « Six façons de travailler ensemble », bento, copie FIXE
 * 12. Marques        « Les équipements que nous maintenons déjà », rail
 *                    d'onglets quand la donnée en nomme plusieurs familles
 * 13. 08 Références  « Nos références », rail de cartes        ← corpus
 * 14. 09 Questions   la carte sombre à photo `mg-faqph`        ← corpus
 * 15. 10 Appel final question du corpus + panneau, ANCRE `#mgx-form`
 *
 * À LA DIFFÉRENCE DU GABARIT 03 : une seule bande d'appel (la sombre), pas de
 * maillage « Un autre besoin ? » (le bento des offres le remplace), et l'ancre
 * `#mgx-form` est RÉELLE : la capture la pose sur la section d'appel final, et
 * le bouton de la FAQ comme celui du bento la visent.
 *
 * LE DESSIN vient du gabarit (capture), LE TEXTE vient du corpus via le relais
 * JSON, rien ne s'invente. Les écrans déjà portés par le gabarit 03 sont
 * IMPORTÉS de `components/site/offre/`, jamais recopiés : même charte, un seul
 * endroit. Les écrans propres au domaine vivent dans ce dossier.
 *
 * AJOUTS DU 08/10, relevés sur les NEUF autres captures du gabarit : le
 * « Complément 2 » de `/expertises/types-de-maintenance/` (`ComplementsDomaine`),
 * les dessins « rangee » et « panneau-sombre » du problème (`ProblemeDomaine`)
 * et le rail d'onglets des marques de `/expertises/electromecanique/`. Chacun
 * est INERTE sans sa donnée : les deux pilotes ne bougent pas.
 *
 * Composant SERVEUR. Fil d'Ariane et maillage du cocon restent en props,
 * exigés par CLAUDE.md §4 bien qu'absents de la capture.
 *
 * LA COUCHE MOBILE V2 (14/10), sous 881 px seulement, le bureau ne bouge pas :
 * fil d'Ariane, héros compact (H1 à 27 px, téléphone, panneau de formulaire
 * REPLIÉ), « Les spécialités du domaine » sous le héros et « Dans la même
 * rubrique » en bas (dc.html L501 et L506), sections de bureau repliées, et la
 * cadence de conversion. Même méthode que `specialite/PageSpecialite.tsx`.
 */

export interface ProprietesPageDomaine {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuDomaine;
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

export default function PageDomaine({
  titre,
  contenu,
  formulaire,
  chemin,
  filAriane,
  maillage,
}: ProprietesPageDomaine) {
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

  /* « La réponse directe » (Complément 2) ouvre `/expertises/types-de-
     maintenance/` : elle est alors la première section numérotée, ouverte au
     téléphone, et le problème se replie (dc.html L451). */
  const aReponseDirecte = !!contenu.complementTypes?.length;

  /* Le bouton du photo + CTA mobile : le CTA de la fiche (dc.html L412),
     libellé du bouton du héros, vers `/contact/` comme dans la fiche. */
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

              {/* « Les spécialités du domaine », les pastilles de la maquette
                  mobile sous les boutons du héros (dc.html L501, `kidsTop`),
                  avant le chapô. Sous 881 px seulement ; rien pour un
                  domaine sans page fille. Dans la colonne du héros pour que
                  le chapô passe après elles (`order`, voir `../mobile`). */}
              {chemin ? <PastillesCocon chemin={chemin} variante="enfants" /> : null}

              {contenu.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>{contenu.mention}</p>
              ) : null}
            </div>

            {/* G2, LE PANNEAU DE FORMULAIRE DU HÉROS N'EST PAS À L'ÉCRAN AU
                TÉLÉPHONE (`PANNEAU_HEROS`) : voir `../mobile`. */}
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
        {/* Avec « La réponse directe », la V3 range les chiffres en fin de
            cette carte (`ChiffresCarteMobile`) : la section sort de l'écran
            au téléphone (`CACHE_MOBILE`), comme sur le hub. */}
        {chiffres.length > 0 ? (
          <section
            data-chiffres-mobile=""
            className={aReponseDirecte ? CACHE_MOBILE : undefined}
            style={SECTION_CHIFFRES}
          >
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

        {/* LA CADENCE DE CONVERSION MOBILE : même montage que
            `specialite/PageSpecialite.tsx`. Un enfant par section numérotée
            de la maquette (photo + CTA après la 2e, bandeau après la 5e), les
            sections de bureau groupées avec les références, et
            `rappelFinal={false}` parce que « 10 Appel final » tient le rôle
            du rappel de bas de page. */}
        <AvecConversionMobile
          chemin={chemin ?? ""}
          gabarit="09"
          bouton={boutonMobile}
          rappelFinal={false}
        >
        {/* ----------------------------- 3 bis. « Complément 2 » (accueil) */}

        {/* Des onze captures du gabarit, seule celle de
            `/expertises/types-de-maintenance/` porte cet écran, tableau
            compris. Sans donnée, rien n'est rendu. */}
        {/* Au téléphone, la carte « 01 La réponse directe » de la V3, ouverte,
            qui finit sur « Les chiffres Migen » ; rien ne bouge sur bureau. */}
        {contenu.complementTypes?.length ? (
          <PliMobile pleinePage toujoursOuvert titre="La réponse directe">
            <ComplementsDomaine blocs={contenu.complementTypes} />
            <ChiffresCarteMobile chiffres={chiffres} />
          </PliMobile>
        ) : null}

        {/* ------------------------------------------ 4. « 03 Problème » */}

        {probleme ? (
          <ProblemeDomaine
            section={probleme}
            altPhoto={titre}
            photo={contenu.problemePhoto}
            pli={aReponseDirecte ? "replie" : "ouvert"}
          />
        ) : null}

        {/* L'offre, la bande d'appel et « Complément 4 » : une seule section
            du corpus, « ## L’offre », pour la cadence. */}
        {offre || contenu.mention || contenu.appelBouton || contenu.complementOffre?.length ? (
        <>
        {/* --------------------------------------------- 5. « 04 Offre » */}

        {/* `proseMobile` : la prose que le corpus écrit sous le tableau, DANS
            la carte au téléphone (V3 : « Un besoin durable se couvre… »). */}
        {offre ? <PointsOffre section={offre} proseMobile /> : null}

        {/* ------------------------------------------- 6. Appel · offre */}

        {/* UNE SEULE bande sur ce gabarit, et la capture la rend SOMBRE
            (fond `var(--panel)`, section « Appel · offre »). */}
        {contenu.mention || contenu.appelBouton ? (
          <BandeAppel
            mention={contenu.mention}
            bouton={contenu.appelBouton}
            variante="sombre"
          />
        ) : null}

        {/* ------------------------------------------ 7. « Complément 4 » */}

        {contenu.complementOffre?.length ? (
          <ComplementsOffre blocs={contenu.complementOffre} />
        ) : null}
        </>
        ) : null}

        {/* ------------------------------------------- 8. « 05 Déroulé » */}

        {/* Replié au téléphone (« 03 Le déroulé »). L'accroche est celle de la
            V3 : la première étape du corpus (`accrocheDuDeroule`), que la v2
            ne lisait pas. */}
        {deroule ? <DerouleOffre section={deroule} pli="replie" /> : null}

        {/* ----------------------------------------- 9. « 06 Garanties » */}

        {/* L'appel du corpus sous les garanties, dans la carte au téléphone
            (`AppelCarteMobile`, V3). */}
        {garanties ? (
          <GarantiesOffre section={garanties} apres={<AppelCarteMobile cta={appel} />} />
        ) : null}

        {/* Secteurs, offres, marques et références : une section pour la
            cadence, celle des références. */}
        <>
        {/* --------------------------- 10. « Secteurs de l'expertise » */}

        <SecteursDomaine />

        {/* --------------------------------- 11. « Offres du secteur » */}

        <OffresDomaine replie />

        {/* ------------------------------- 12. « Marques maintenues » */}

        {contenu.marquesFamille ? (
          <MarquesOffre
            famille={contenu.marquesFamille}
            familles={contenu.marquesFamilles}
          />
        ) : null}

        {/* --------------------------------------- 13. « 08 Références » */}

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

        {/* --------------------------------------- 14. « 09 Questions » */}

        {/* La carte sombre à photo `mg-faqph` de la maquette : la capture ne
            montre pas la photo (elle vit dans la feuille de style de la classe,
            pas dans le DOM sérialisé), mais la maquette vivante la rend, et ses
            octets sont ceux de `faq-offre.jpg` (empreinte relevée le 07/10).
            Même écran et même composant que le gabarit 03. */}
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
            (dc.html L506) : les domaines frères. Sous 881 px seulement. */}
        {/* La question de l'appel final, dernière carte de la FAQ au
            téléphone (`QuestionFinaleMobile`). */}
        <QuestionFinaleMobile cta={ctaFinal} />

        {chemin ? <PastillesCocon chemin={chemin} variante="soeurs" /> : null}

        {/* ------------------------------------- 15. « 10 Appel final » */}

        {/* L'ancre du bandeau « Être rappelé » (`#etre-rappele`) : voir
            `specialite/PageSpecialite.tsx`. Mobile seulement. */}
        {/* La carte « Être rappelé » de la maquette, qui clôt la page au
            téléphone et porte l'ancre `#etre-rappele` du bandeau. */}
        <RappelFinalMobile />

        {/* L'ANCRE `#mgx-form` est posée ici parce que la capture la pose sur
            cette section (`id="mgx-form"`, `scroll-margin-top: 90px`) : le
            bouton de la FAQ et celui du bento la visent. `AppelFinal` ne porte
            pas d'ancre lui-même, l'enveloppe la lui donne sans le toucher. */}
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

        {/* En dernier : voir `specialite/PageSpecialite.tsx`. */}
        <OuvreLaCible />
      </main>
    </div>
  );
}
