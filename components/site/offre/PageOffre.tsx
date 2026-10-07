import Link from "next/link";
import type { ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import AppelFinal from "./AppelFinal";
import AppelOffre from "./AppelOffre";
import BandeAppel from "./BandeAppel";
import {
  CommentCaMarche,
  Comparatif,
  Formules,
  PremierMois,
} from "./BlocsZeroArret";
import ComplementsOffre from "./ComplementsOffre";
import DerouleOffre from "./DerouleOffre";
import GarantiesOffre from "./GarantiesOffre";
import LogosClients from "./LogosClients";
import MaillageOffres from "./MaillageOffres";
import MarquesOffre from "./MarquesOffre";
import PagesLiees from "./PagesLiees";
import PanneauFormulaire from "./PanneauFormulaire";
import PointsOffre from "./PointsOffre";
import PrestationsRegroupees from "./PrestationsRegroupees";
import ProblemeOffre from "./ProblemeOffre";
import QuestionsOffre from "./QuestionsOffre";
import RealisationsLiees from "./RealisationsLiees";
import Reassurance from "./Reassurance";
import ReferencesOffre from "./ReferencesOffre";
import ReponseDirecte from "./ReponseDirecte";
import TypesMaintenance from "./TypesMaintenance";
import { cibleSure, liensSurs } from "./LiensOffre";
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
 */

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
}: ProprietesPageOffre) {
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

  /* Les trois bandes d'appel. Elles se rendaient tant que le corpus portait
     une mention des horaires ; `/offres/zero-arret/` n'en porte pas, parce que
     la phrase de sa capture est un délai chiffré que le contrat interdit (trou
     déclaré dans `scripts/verifie-offre-rendu.mjs`), alors que la capture rend
     bien les trois bandes avec leur bouton. La bande se rend donc dès que l'un
     des deux textes existe. */
  const bandeVisible = !!(contenu.mention || contenu.appelBouton);

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
                      className={styles.boutonPrincipal}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* La mention des horaires, SOUS les boutons dans la capture. */}
              {contenu.mention ? (
                <p style={HERO_MENTION}>{contenu.mention}</p>
              ) : null}
            </div>

            {heroFormulaire ? (
              <div style={{ position: "relative" }}>
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
          <section style={SECTION_CHIFFRES}>
            <div className="mg-rmulti" style={GRILLE_CHIFFRES}>
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

        <Reassurance reperes={contenu.reperesReassurance} />

        {/* ------------------------------ 3 bis. « 02 Réponse directe » */}

        {/* Écran absent de la page pilote (17 sections) et présent sur les
            pages dont la maquette porte une réponse en une phrase. Sans
            `reponseTitre`, rien n'est rendu. Voir `ReponseDirecte.tsx`
            (ajouté le 07/10 pour `/offres/full-service/`). */}
        {contenu.reponseTitre ? (
          <ReponseDirecte
            titre={contenu.reponseTitre}
            texte={contenu.reponseTexte}
          />
        ) : null}

        {/* ----------------------------------------- 4. Appel · domaines */}

        {bandeVisible ? (
          <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
        ) : null}

        {/* --------------------- 4 bis. « 02 Types de maintenance » */}

        {/* Même règle : sans `typesMaintenance`, rien n'est rendu. Voir
            `TypesMaintenance.tsx` (ajouté le 07/10). */}
        {contenu.typesTitre && contenu.typesMaintenance?.length ? (
          <TypesMaintenance
            titre={contenu.typesTitre}
            cartes={contenu.typesMaintenance}
          />
        ) : null}

        {/* ------------------------------------ 4 ter. « Complément 2 » */}

        {/* Le SECOND emplacement de la carte en verre, entre les types de
            maintenance et la problématique (`data-screen-label="Complément 2"`
            de la capture de `/offres/full-service/`). Même composant que
            « Complément 4 », autre emplacement. */}
        {contenu.complementTypes?.length ? (
          <ComplementsOffre blocs={contenu.complementTypes} />
        ) : null}

        {/* ------------------------------------------- 5. « 03 Problème » */}

        {probleme ? (
          <ProblemeOffre
            section={probleme}
            altPhoto={titre}
            photo={contenu.problemePhoto}
          />
        ) : null}

        {/* ---------------------------------------------- 6. « 04 Offre » */}

        {offre ? <PointsOffre section={offre} /> : null}

        {/* -------------------------------------------- 7. Appel · offre */}

        {/* La capture rend CETTE bande en sombre (fond `var(--panel)`), les
            deux autres en clair : relevé du 06/10 sur le bloc 533 de
            `maquette/rendu/offres--residence.html`. */}
        {bandeVisible ? (
          <BandeAppel
            mention={contenu.mention}
            bouton={contenu.appelBouton}
            variante="sombre"
          />
        ) : null}

        {/* ------------------------------------ 7 bis. « Complément 4 » */}

        {/* Écran propre aux SOUS-pages du gabarit 03, absent des six offres
            nommées : sans donnée, rien n'est rendu. Voir
            `ComplementsOffre.tsx` (ajouté le 07/10 pour
            `/offres/residence/prestataire-ou-salarie/`). */}
        {contenu.complementOffre?.length ? (
          <ComplementsOffre blocs={contenu.complementOffre} />
        ) : null}

        {/* -------------------------------------------- 8. « 05 Déroulé » */}

        {deroule ? (
          <DerouleOffre section={deroule} titre={contenu.derouleTitre} />
        ) : null}

        {/* ------------------------------------ 8 bis. « Complément 5 » */}

        {/* Le MÊME écran que « Complément 4 », à l'emplacement que la maquette
            lui donne APRÈS le déroulé. Ajouté le 07/10 pour
            `/offres/residence/cahier-des-charges/`, dont la capture porte les
            deux (« Les 4 erreurs qui coûtent cher »). Sans donnée, rien. */}
        {contenu.complementDeroule?.length ? (
          <ComplementsOffre blocs={contenu.complementDeroule} />
        ) : null}

        {/* ------------------------------------------ 9. « 06 Garanties » */}

        {garanties ? <GarantiesOffre section={garanties} /> : null}

        {/* ------------------------------------ 9 bis. « Complément 6 » */}

        {/* Le TROISIÈME emplacement de la même carte en verre, APRÈS les
            garanties (gabarit 664). Ajouté le 07/10 en portant
            `/offres/bureau-etudes/`, dont la capture porte les trois
            emplacements, 4, 5 et 6. Sans donnée, rien n'est rendu. */}
        {contenu.complementGaranties?.length ? (
          <ComplementsOffre blocs={contenu.complementGaranties} />
        ) : null}

        {/* --------------------------------------------- 10. « 07 Appel » */}

        {contenu.brefBande ? (
          <AppelOffre
            question={contenu.brefBande}
            bouton={contenu.brefBouton}
            mention={contenu.brefMention}
          />
        ) : null}

        {/* ------------------------------------ 11. « Offres regroupées » */}

        {contenu.prestationsRegroupees ? (
          <PrestationsRegroupees donnees={contenu.prestationsRegroupees} />
        ) : null}

        {/* ------------------------------- 11 bis. « Marques maintenues » */}

        {/* AJOUTÉ le 07/10 en portant `/offres/depannage-industriel/panne-
            machine/` : 38 des 210 captures du dépôt rendent ici UNE famille de
            constructeurs, et laquelle dépend de la page. Sans
            `marquesFamille`, rien n'est rendu : les autres pages ne bougent
            pas. Voir `MarquesOffre.tsx`. */}
        {/* `marquesFamilles` ajoute le RAIL D'ONGLETS que rend la capture de
            `/bureau-etudes/bureau-etude-electrique/` (07/10). Absent, la
            section est celle d'avant. */}
        {contenu.marquesFamille ? (
          <MarquesOffre
            famille={contenu.marquesFamille}
            familles={contenu.marquesFamilles}
          />
        ) : null}

        {/* ---------------------------------------- 12. « 08 Références » */}

        {preuves ? <ReferencesOffre section={preuves} /> : null}

        {/* --------------------------------------- 13. Appel · références */}

        {bandeVisible ? (
          <BandeAppel mention={contenu.mention} bouton={contenu.appelBouton} />
        ) : null}

        {/* ---------------------------------------- 14. « 09 Questions » */}

        {objections ? <QuestionsOffre section={objections} /> : null}

        {/* --------------------------------------- 15. Maillage · offres */}

        <MaillageOffres cartes={autres} />

        {/* --------------------- 15 bis. Maillage · « pages liées » */}

        {/* L'AUTRE écran de maillage de la maquette, celui des SOUS-pages.
            Une page n'en porte qu'un : `autres` ou `pagesLiees`, jamais les
            deux. Voir `PagesLiees.tsx` (ajouté le 07/10 pour
            `/offres/residence/prestataire-ou-salarie/`). */}
        {contenu.pagesLiees?.length ? (
          <PagesLiees pages={contenu.pagesLiees} />
        ) : null}

        {/* -------------------------------------- 16. Réalisations liées */}

        {contenu.casLies?.length ? (
          <RealisationsLiees cas={contenu.casLies} />
        ) : null}

        {/* ------------------------------------- 17. « 10 Appel final » */}

        <AppelFinal
          question={ctaFinal?.question}
          formulaire={formulaire}
          bouton={contenu.appelBouton}
        />

        {maillage ? (
          <div
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
