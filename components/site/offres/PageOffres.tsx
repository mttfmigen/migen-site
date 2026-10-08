import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";
import PointsOffre from "@/components/site/offre/PointsOffre";
import ProblemeOffre from "@/components/site/offre/ProblemeOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import offre from "@/components/site/offre/PageOffre.module.css";
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

  return (
    <div className="mg-site">
      {/* `racine` : la racine `.mgx-root` du gabarit d'offre (PageOffres.module.css). */}
      <main className={styles.racine} style={{ paddingTop: 62 }}>
        {filAriane}

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
                      className={offre.boutonPrincipal}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}

              {contenu.mention ? (
                <p style={HERO_MENTION}>{contenu.mention}</p>
              ) : null}
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

        {probleme ? (
          <ProblemeOffre
            section={probleme}
            altPhoto={titre}
            photo={contenu.problemePhoto}
          />
        ) : null}

        {pointsOffre ? <PointsOffre section={pointsOffre} /> : null}

        {bandeVisible ? (
          <BandeAppel
            mention={contenu.mention}
            bouton={contenu.appelBouton}
            variante="sombre"
          />
        ) : null}

        {deroule ? (
          <DerouleOffre section={deroule} titre={contenu.derouleTitre} />
        ) : null}

        {garanties ? <GarantiesOffre section={garanties} /> : null}

        {/* ----------------------------------------- 10 à 12. Appel, références */}

        {contenu.brefBande ? (
          <AppelOffre
            question={contenu.brefBande}
            bouton={contenu.brefBouton}
            mention={contenu.brefMention}
          />
        ) : null}

        {preuves ? <ReferencesOffre section={preuves} /> : null}

        {bandeVisible ? (
          <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
        ) : null}

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

        <AppelFinal
          question={ctaFinal?.question}
          formulaire={formulaire}
          bouton={contenu.appelBouton}
        />

        {maillage ? (
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
