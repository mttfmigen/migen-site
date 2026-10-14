import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import CadenceOffre, { RappelFinalOffre } from "@/components/site/offre/CadenceOffre";
import TelephoneHeros from "@/components/site/offre/TelephoneHeros";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";
import PointsOffre from "@/components/site/offre/PointsOffre";
import ProblemeOffre, { photoDuProbleme } from "@/components/site/offre/ProblemeOffre";
import HerosMobile from "@/components/site/offre/HerosMobile";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import offre from "@/components/site/offre/PageOffre.module.css";
import { OFFRES_MOBILE } from "@/components/site/offre/maquette-mobile-offre";
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
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffres } from "@/types/offres";

import DeuxApproches from "./DeuxApproches";
import EncartResidence from "./EncartResidence";
import QuestionsPhoto from "./QuestionsPhoto";
import styles from "./PageOffres.module.css";
import SixOffres from "./SixOffres";

/**
 * Gabarit du hub `/offres/`, porté de la capture `maquette/rendu/offres.html`
 * (18 écrans, dans cet ordre) :
 *
 *  0. 01 Héros          pastille, H1, chapeau, bouton, mention, formulaire
 *  1. 01 Chiffres       trois cellules dans une carte en verre
 *  2. 02 Logos          → `LogosClients`
 *  3. Réassurance       → `Reassurance`
 *  4. Appel             → `BandeAppel`
 *  5. 03 Problème       → `ProblemeOffre`
 *  6. 04 Offre          → `PointsOffre` (5 points)
 *  7. Appel · offre     → `BandeAppel` sombre
 *  8. 05 Déroulé        → `DerouleOffre`
 *  9. 06 Garanties      → `GarantiesOffre`
 * 10. 07 Appel          → `AppelOffre`
 * 11. 08 Références     → `ReferencesOffre`
 * 12. Appel             → `BandeAppel`
 * 13. Deux approches    → `DeuxApproches`      propre au hub
 * 14. Migen Résidence   → `EncartResidence`    propre au hub
 * 15. 09 Questions      → `QuestionsPhoto` (carte sombre, « Poser ma question »)
 * 16. Maillage · offres → `SixOffres`          propre au hub
 * 17. 10 Appel final    → `AppelFinal`
 *
 * POURQUOI PAS `<PageOffre>` TEL QUEL : seize écrans sur dix-huit sont les
 * siens, mais il n'a aucun emplacement entre la bande d'appel des références
 * et les questions, là où la capture pose les deux écrans du hub, et son
 * maillage écrit en dur « Un autre besoin ? Il a son offre. ». Le gabarit
 * reprend donc SES composants, un par un, et ne recopie que le héros et la
 * bande de chiffres, écrits en ligne dans `PageOffre.tsx`.
 *
 * Composant SERVEUR. Toute section sans donnée ne se rend pas.
 */

export interface ProprietesPageOffres {
  /** Le H1, et le seul de la page. */
  titre: string;
  contenu: ContenuOffres;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
  formulaire: string;
  /** Composants serveur asynchrones (ils lisent la base) : passés en props. */
  filAriane?: ReactNode;
  maillage?: ReactNode;
  /** Le chemin de la page : sans lui, ni cadence ni pastilles mobiles. */
  chemin?: string;
}

/** La section du corpus de ce type, s'il y en a une (même règle que `PageOffre`). */
function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}

export default function PageOffres({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
  chemin,
}: ProprietesPageOffres) {
  const actions = liensSurs(contenu.actions ?? []);
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections ?? [];

  const probleme = sectionDeType(sections, "probleme");
  const pointsOffre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";
  const bandeVisible = !!(contenu.mention || contenu.appelBouton);
  /* La photo de tête du téléphone est celle du problème, que la page porte
     déjà : déplacée sous 881 px, pas doublée (même règle que `PageOffre`). */
  const photoProbleme = probleme ? photoDuProbleme(probleme, contenu.problemePhoto) : null;
  /* Le texte et la photo de tête de la maquette mobile v2 pour ce hub
     (`offre/maquette-mobile-offre.ts`), sous 881 px seulement. */
  const mobile = chemin ? OFFRES_MOBILE[chemin] : undefined;
  const photoHeros = mobile?.photoTete ?? photoProbleme;

  return (
    <div className="mg-site">
      {/* `racine` : la racine `.mgx-root` du gabarit d'offre (PageOffres.module.css). */}
      {/* `data-ordre-mobile` et `data-heros-*` : le socle mobile v2 de
          `app/globals.css`, posé comme sur `PageOffre` (héros en colonne,
          tuiles de chiffres, blocs hors maquette après ses sections). Au-dessus
          de 880 px, aucun de ces attributs n'a d'effet. */}
      <main
        className={`${styles.racine} ${styles.hubOffres}`}
        data-ordre-mobile=""
        data-heros-photo-source={photoProbleme ? "probleme" : undefined}
        style={{ paddingTop: 62 }}
      >
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
            <div data-heros-colonne="">
              <HerosMobile chemin={chemin} photo={photoHeros} />
              {contenu.pastille ? (
                <div data-heros-pastille="" style={HERO_RANGEE_PASTILLE}>
                  <span
                    className={mobile?.surtitre ? offre.pastilleBureau : undefined}
                    style={PASTILLE}
                  >
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {contenu.pastille}
                  </span>
                  {/* dc.html `KICK["10"]` : le sur-titre d'un hub de rubrique. */}
                  {mobile?.surtitre ? (
                    <span data-mobile-seulement="">{mobile.surtitre}</span>
                  ) : null}
                </div>
              ) : null}

              <h1 style={TITRE1}>{titre}</h1>

              {contenu.chapeau ? (
                <p data-heros-chapeau="" style={CHAPEAU_HERO}>
                  {mobile?.chapeau ? (
                    <>
                      <span data-doublon-mobile="">
                        <TexteRiche texte={contenu.chapeau} />
                      </span>
                      <span data-mobile-seulement="">{mobile.chapeau}</span>
                    </>
                  ) : (
                    <TexteRiche texte={contenu.chapeau} />
                  )}
                </p>
              ) : null}

              {/* Le téléphone du héros mobile : voir `offre/TelephoneHeros`. */}
              {actions.length > 0 ? (
                <div data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
                  {/* Une ancre dans la page est un `<a>` natif : voir la même
                      rangée dans `offre/PageOffre.tsx` (`:target` et le
                      panneau replié). */}
                  {actions.map((action) =>
                    action.href.startsWith("#") ? (
                      <a
                        key={action.href}
                        href={action.href}
                        className={offre.boutonPrincipal}
                        style={BOUTON_HERO}
                      >
                        {action.libelle}
                      </a>
                    ) : (
                      <Link
                        key={action.href}
                        href={action.href}
                        prefetch={false}
                        className={offre.boutonPrincipal}
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

              {/* La liste de la rubrique (dc.html L125, `kidsTop`) : sous les
                  boutons au téléphone, comme sur `/secteurs/`. Mobile seulement. */}
              {chemin ? <PastillesCocon chemin={chemin} variante="enfants" /> : null}

              {contenu.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>
                  {mobile?.mention ? (
                    <>
                      <span data-doublon-mobile="">{contenu.mention}</span>
                      <span data-mobile-seulement="">
                        <TexteRiche texte={mobile.mention} />
                      </span>
                    </>
                  ) : (
                    contenu.mention
                  )}
                </p>
              ) : null}
            </div>

            {heroFormulaire ? (
              /* Replié sous 881 px, rouvert quand l'adresse vise `#besoin` :
                 héros compact de la maquette mobile v2, voir
                 `offre/PageOffre.module.css`. */
              <div className={offre.panneauHeroBureau} style={{ position: "relative" }}>
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
            {/* « Chiffres clés » et tuiles 2 x 2 du téléphone, comme
                `PageOffre` : le titre n'existe que sous 881 px. */}
            <h2 data-mobile-seulement="" data-tuiles-titre="">
              Chiffres clés
            </h2>
            <div
              data-tuiles-chiffres=""
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

        {/* ---------------------------------------- 2 et 3. Logos, réassurance */}

        <LogosClients />
        <Reassurance reperes={contenu.reperesReassurance} />

        {bandeVisible ? (
          <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
        ) : null}

        {/* ------------------------------------------ 5 à 9. Corps de l'offre */}

        {/* LA CADENCE DE CONVERSION MOBILE, même montage que `PageOffre` :
            chaque enfant est une section de contenu de la maquette (dc.html
            `nD`), les bandes et l'appel « 07 » sont rattachés par un
            `Fragment` à la section qui les précède. */}
        <CadenceOffre chemin={chemin} actions={actions} photoHeros={mobile?.photoTete}>
          {/* Déplié au chargement : première section de contenu (dc.html
              L451, `nOpen = 1`). */}
          {probleme ? (
            <ProblemeOffre
              key="probleme"
              section={probleme}
              altPhoto={titre}
              photo={contenu.problemePhoto}
              pli="ouvert"
            />
          ) : null}

          {pointsOffre || bandeVisible ? (
            <Fragment key="offre">
              {pointsOffre ? (
                <PointsOffre section={pointsOffre} resume={mobile?.resumes?.offre} />
              ) : null}

              {bandeVisible ? (
                <BandeAppel
                  mention={contenu.mention}
                  bouton={contenu.appelBouton}
                  variante="sombre"
                />
              ) : null}
            </Fragment>
          ) : null}

          {deroule ? (
            <DerouleOffre
              key="deroule"
              section={deroule}
              titre={contenu.derouleTitre}
              pli="replie"
              resume={mobile?.resumes?.deroule}
            />
          ) : null}

          {garanties || contenu.brefBande ? (
            <Fragment key="garanties">
              {garanties ? <GarantiesOffre section={garanties} /> : null}

              {/* ----------------------------------- 10 à 12. Appel, références */}

              {contenu.brefBande ? (
                <AppelOffre
                  question={contenu.brefBande}
                  bouton={contenu.brefBouton}
                  mention={contenu.brefMention}
                />
              ) : null}
            </Fragment>
          ) : null}

          {preuves || bandeVisible ? (
            <Fragment key="references">
              {preuves ? (
                <ReferencesOffre section={preuves} toujoursOuvert photosMaquette={!!mobile} />
              ) : null}

              {bandeVisible ? (
                <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
              ) : null}
            </Fragment>
          ) : null}
        </CadenceOffre>

        {/* Le début de la fin de page au téléphone (FAQ, maillage, appel
            final), comme sur `PageOffre`. Masqué, sans texte. */}
        <div data-queue-mobile="" hidden />

        {/* --------------------------------- 13 et 14. Les deux écrans du hub */}

        {contenu.approches?.cartes.length ? (
          <DeuxApproches {...contenu.approches} />
        ) : null}

        {contenu.encartResidence ? (
          <EncartResidence encart={contenu.encartResidence} />
        ) : null}

        {/* ---------------------------------------------- 15. « 09 Questions » */}

        {/* Mêmes valeurs que `PageOffre` : la capture du hub porte la carte
            sombre à photo (`mg-faqph`) et le bouton « Poser ma question ». */}
        {objections ? (
          <QuestionsPhoto
            donnees={{
              surtitre: "Questions fréquentes",
              titre: objections.titre ?? "Vos questions avant de nous appeler",
              lienTexte: "Poser ma question",
              lienHref: "#mgx-form",
              bouton: true,
              photo: "/assets/web/faq-offre.jpg",
              questions: objections.questions,
            }}
            questionFinale={ctaFinal}
          />
        ) : null}

        {/* --------------------------------------- 16. « Six offres… » */}

        {contenu.maillage?.length && contenu.maillageTitre ? (
          <SixOffres
            surtitre={contenu.maillageSurtitre}
            titre={contenu.maillageTitre}
            cartes={contenu.maillage}
          />
        ) : null}

        {/* ------------------------------------------- 17. « 10 Appel final » */}

        {/* LA CIBLE DE L'ANCRE #mgx-form, oubliée par ce gabarit comme par
            PageOffre. Voir la note de ce dernier : le bouton « Poser ma
            question » de la FAQ ne menait nulle part. */}
        {/* La carte « Être rappelé » de la maquette mobile v2, cible du
            bandeau : voir `RappelFinalOffre` (`offre/CadenceOffre`). */}
        <RappelFinalOffre chemin={chemin} />

        <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
          <AppelFinal
            question={ctaFinal?.question}
            formulaire={formulaire}
            bouton={contenu.appelBouton}
          />
        </div>

        {maillage ? (
          <div
            className={offre.maillageBas}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
