import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import AppelFinal from "@/components/site/offre/AppelFinal";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
import PagesLiees from "@/components/site/offre/PagesLiees";
import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";
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
import { CONTENU_HUB_EXPERTISES, TITRE_HUB_EXPERTISES } from "./expertises-donnees";
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
 */

export interface ProprietesPageExpertises {
  /** Le H1, lu dans `pages.titre_h1`. Le seul de la page. */
  titre: string;
  contenu: ContenuExpertises | ContenuHubExpertises;
  /** Identifiant d'analyse transmis à HubSpot par les formulaires. */
  formulaire: string;
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

  return (
    /* La racine `.mgx-root` de `MigenExpertise` : `--sec` reste à 120 px sur
       mobile (la règle « --sec: 64px » de `.mg-site` ne l'atteint pas), et les
       règles mobiles du gabarit sont celles que `PageOffre.module.css` porte
       sous `.gabarit`. Mesuré le 08/10 à 390 px : 120 px dans la maquette. */
    <div className={`mg-site ${stylesOffre.gabarit}`} style={{ "--sec": "120px" } as CSSProperties}>
      <main style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ------------------------------------------------ 0. « 01 Héros » */}

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
              {hub.pastille ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {hub.pastille}
                  </span>
                </div>
              ) : null}

              <h1 style={TITRE1}>{h1}</h1>

              {hub.chapeau ? (
                <p style={CHAPEAU_HERO}>
                  <TexteRiche texte={hub.chapeau} />
                </p>
              ) : null}

              {actions.length > 0 ? (
                <div style={HERO_RANGEE_BOUTONS}>
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
                </div>
              ) : null}

              {hub.mention ? <p style={HERO_MENTION}>{hub.mention}</p> : null}
            </div>

            {heroFormulaire ? (
              <div style={{ position: "relative" }}>
                <PanneauFormulaire
                  id="besoin"
                  formulaire={`${formulaire}-hero`}
                  titre={hub.formulaireHeroTitre!}
                  pastille={hub.formulaireHeroMention}
                />
              </div>
            ) : null}
          </div>
        </section>

        {/* -------------------------------------------- 1. « 01 Chiffres » */}

        {chiffres.length > 0 ? (
          <section style={SECTION_CHIFFRES}>
            <div
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

        {/* ---------------------------------------- 2 et 3. Logos, réassurance */}

        <LogosClients />
        <Reassurance />

        {/* ------------------------------ 4 à 7. l'accueil de rubrique */}

        {hub.reponse ? <ReponseDirecte {...hub.reponse} /> : null}
        {hub.domaines ? <Domaines {...hub.domaines} /> : null}
        {hub.types ? <TypesMaintenance {...hub.types} /> : null}
        {hub.complementTypes?.length ? (
          <ComplementsOffre blocs={hub.complementTypes} />
        ) : null}

        {/* ------------------------------------- 8 et 9. problème, offre */}

        {probleme ? <ProblemeOffre section={probleme} altPhoto={h1} /> : null}
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

        {/* ------------------------------- 12 à 15. déroulé → références */}

        {deroule ? <DerouleOffre section={deroule} /> : null}
        {garanties ? <GarantiesOffre section={garanties} /> : null}
        {hub.marquesFamille ? (
          <MarquesOffre
            famille={hub.marquesFamille}
            familles={hub.marquesFamilles}
          />
        ) : null}
        {preuves ? <ReferencesOffre section={preuves} /> : null}

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

        {/* --------------------------------------------------- 17. Maillage */}

        {hub.pagesLiees?.length && hub.pagesLieesTitre ? (
          <PagesLiees pages={hub.pagesLiees} titre={hub.pagesLieesTitre} />
        ) : null}

        {/* ---------------------------------------- 18. « 10 Appel final » */}

        {/* La capture pose `id="mgx-form"` sur cette section : la FAQ la vise. */}
        <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
          <AppelFinal
            question={ctaFinal?.question}
            formulaire={formulaire}
            bouton={hub.appelBouton}
          />
        </div>

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
