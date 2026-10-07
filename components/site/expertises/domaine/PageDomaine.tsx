import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import AppelFinal from "@/components/site/offre/AppelFinal";
import BandeAppel from "@/components/site/offre/BandeAppel";
import ComplementsOffre from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import LogosClients from "@/components/site/offre/LogosClients";
import MarquesOffre from "@/components/site/offre/MarquesOffre";
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
import type { ContenuDomaine } from "@/types/domaine";

import OffresDomaine from "./OffresDomaine";
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
 *  4. 03 Problème    « Votre problématique », puces 01-04     ← corpus
 *  5. 04 Offre       « L'offre », 7 points                     ← corpus
 *  6. Appel · offre  bande SOMBRE (fond `var(--panel)`)   → `BandeAppel`
 *  7. Complément 4   la carte en verre d'une phrase            ← corpus
 *  8. 05 Déroulé     « Notre méthode », étapes 01-06           ← corpus
 *  9. 06 Garanties   « Notre parti pris », panneau sombre      ← corpus
 * 10. Secteurs       « Même expertise, contraintes différentes », copie FIXE
 * 11. Offres         « Six façons de travailler ensemble », bento, copie FIXE
 * 12. Marques        « Les équipements que nous maintenons déjà »
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
 * endroit. Les trois écrans propres au domaine vivent dans ce dossier.
 *
 * Composant SERVEUR. Fil d'Ariane et maillage du cocon restent en props,
 * exigés par CLAUDE.md §4 bien qu'absents de la capture.
 */

export interface ProprietesPageDomaine {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuDomaine;
  /** Identifiant d'analyse des soumissions, repris par HubSpot. */
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

export default function PageDomaine({
  titre,
  contenu,
  formulaire,
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
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  /* Même règle que `PageOffre` : la PRÉSENCE du champ monte le panneau, sa
     vérité n'est pas testée, un en-tête vide reste un panneau. */
  const heroFormulaire = typeof contenu.formulaireHeroTitre === "string";

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section
            style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}
          >
            {filAriane}
          </section>
        ) : null}

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

        {/* TROU DÉCLARÉ : la capture de `/expertises/robotique/` dessine ici
            TROIS chiffres dont « +200 clients industriels », que le contrat
            interdit (CLAUDE.md §9). Ce chiffre n'est pas dans la donnée, la
            grille se resserre sur ce qui reste, comme sur les pages d'offre
            à trois chiffres. */}
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

        {/* --------------------------------------------- 2. « 02 Logos » */}

        <LogosClients />

        {/* -------------------------------------------- 3. Réassurance */}

        <Reassurance />

        {/* ------------------------------------------ 4. « 03 Problème » */}

        {probleme ? (
          <ProblemeOffre
            section={probleme}
            altPhoto={titre}
            photo={contenu.problemePhoto}
          />
        ) : null}

        {/* --------------------------------------------- 5. « 04 Offre » */}

        {offre ? <PointsOffre section={offre} /> : null}

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

        {/* ------------------------------------------- 8. « 05 Déroulé » */}

        {deroule ? <DerouleOffre section={deroule} /> : null}

        {/* ----------------------------------------- 9. « 06 Garanties » */}

        {garanties ? <GarantiesOffre section={garanties} /> : null}

        {/* --------------------------- 10. « Secteurs de l'expertise » */}

        <SecteursDomaine />

        {/* --------------------------------- 11. « Offres du secteur » */}

        <OffresDomaine />

        {/* ------------------------------- 12. « Marques maintenues » */}

        {contenu.marquesFamille ? (
          <MarquesOffre famille={contenu.marquesFamille} />
        ) : null}

        {/* --------------------------------------- 13. « 08 Références » */}

        {preuves ? <ReferencesOffre section={preuves} /> : null}

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

        {/* ------------------------------------- 15. « 10 Appel final » */}

        {/* L'ANCRE `#mgx-form` est posée ici parce que la capture la pose sur
            cette section (`id="mgx-form"`, `scroll-margin-top: 90px`) : le
            bouton de la FAQ et celui du bento la visent. `AppelFinal` ne porte
            pas d'ancre lui-même, l'enveloppe la lui donne sans le toucher. */}
        <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
          <AppelFinal
            question={ctaFinal?.question}
            formulaire={formulaire}
            bouton={contenu.appelBouton}
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
