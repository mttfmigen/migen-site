import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import {
  VUE_AVANT,
  VUE_AVEC,
} from "@/components/site/accueil/avant-apres-donnees";
import DernieresRealisations from "@/components/site/accueil/DernieresRealisations";
import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";
import Bloc from "@/components/site/blocs/Bloc";
import Objections from "@/components/site/blocs/Objections";
import {
  ANCRE_FORMULAIRE,
  CHAPEAU,
  colonnes,
  ENTETE,
  LARGEUR,
  SECTION,
  TITRE2,
} from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import {
  CommentCaMarche,
  Comparatif,
  Formules,
  PremierMois,
} from "./BlocsZeroArret";
import BandeAppel from "./BandeAppel";
import CeQuiEstInclus from "./CeQuiEstInclus";
import { cibleSure, liensSurs, lienSur } from "./LiensOffre";
import {
  BOUTON_HERO,
  CARTE_AUTRE,
  CARTE_AUTRE_LIBELLE,
  CARTE_AUTRE_PHRASE,
  CARTE_CHIFFRE,
  CHAPEAU_HERO,
  CHIFFRE_DETAIL,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  HERO,
  HERO_BANDE_REPERES,
  HERO_FILET,
  HERO_FORMULAIRE_ENTETE,
  HERO_FORMULAIRE_MENTION,
  HERO_FORMULAIRE_TITRE,
  HERO_GRILLE,
  HERO_PANNEAU_FORMULAIRE,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  HERO_REPERE_LIBELLE,
  HERO_REPERE_VALEUR,
  MENTION,
  PASTILLE,
  PASTILLE_PUCE,
  SURTITRE_OFFRE,
  TITRE1,
} from "./habillage-offre";

import styles from "./PageOffre.module.css";

/**
 * Gabarit OFFRE, porté de la maquette `maquette/site-final.html`,
 * lignes 4030 à 4524 (`sc-if value="{{ isOfferPage }}"`).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LES TREIZE SECTIONS DE LA MAQUETTE, DANS SON ORDRE, AVEC SON TEXTE.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Décision de Mehdi du 05/10 : « tu respectes AU MOT POUR MOT la maquette ». Le
 * texte vient d'`OFFERS` (l. 7748 de la maquette, 198 chaînes extraites dans
 * `maquette/offres-maquette.json`) et du gabarit lui-même
 * (`maquette/blocs-offre-maquette.json`, `maquette/faq-maquette.json`). Le
 * corpus rédigé ne sert plus qu'à ce que la maquette ne définit pas.
 *
 *  1. Le héros à deux colonnes          ← `of.pill`, `of.small`, `of.h1a` et
 *                                          `of.h1b`, `of.lead`
 *  2. « En bref », quatre chiffres      ← `of.bref`, `of.s00` à `of.s32`,
 *                                          `of.strip`, `of.cta`
 *  3. « Comment ça marche »             ← Zéro Arrêt seulement, `BlocsZeroArret`
 *  4. « Les formules » et le tableau    ← Zéro Arrêt seulement, `BlocsZeroArret`
 *  5. « Le comparatif »                 ← Zéro Arrêt seulement, `BlocsZeroArret`
 *  6. « Le premier mois »               ← Zéro Arrêt seulement, `BlocsZeroArret`
 *  7. « Le jour et la nuit »            ← `AvantApresBascule`, commun au site
 *  8. « Ce qui est inclus »             ← `of.incT`, `of.incP`, `of.us0` à
 *                                          `of.us4`, `of.you0` à `of.you3`,
 *                                          rendu par `CeQuiEstInclus`
 *  9. « Notre méthode »                 ← `MethodeQuatreEtapes`, déjà porté
 * 10. « Notre sélection »               ← `ProcessSelection`, son lien d'en-tête
 *                                          lié à `of.cta`
 * 11. « Nos dernières réalisations »    ← `DernieresRealisations`, le bloc de
 *                                          l'accueil, trois cartes à photo. À
 *                                          DÉFAUT, la section `preuves` du
 *                                          corpus prend cette place : les deux
 *                                          portent le même H2, jamais les deux
 * 12. « Questions fréquentes »          ← `RES_FAQ` / `FAQ_BY` de la maquette,
 *                                          bloc `Objections`
 *     Le texte rédigé du corpus         ← `probleme`, `offre`, `deroule`,
 *                                          `garanties`, `cta`, en bloc
 * 13. « Un autre besoin ? »             ← les six tuiles de la maquette
 *     Le formulaire de bas de page      ← `of.form`
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LE TEXTE DU CORPUS QUE LA MAQUETTE NE MONTRE PAS SE REND ENTRE LA 12 ET LA 13.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * CE QUI A CHANGÉ LE 05/10, ET POURQUOI. Le portage précédent INTERCALAIT quatre
 * sections du corpus (`probleme`, `deroule`, `garanties`, `cta`) entre les
 * sections de la maquette. Résultat mesuré sur `/offres/residence/` : le H2 « Ce
 * que nous garantissons. » se lisait à l'emplacement où la maquette écrit « Vous
 * gardez la main. Nous portons le reste. », et c'est précisément ce que Mehdi
 * cite comme la preuve que le site ne ressemblait pas à sa maquette.
 *
 * Les treize sections se suivent donc maintenant dans l'ordre exact de la
 * maquette, et les sections rédigées du corpus se rendent EN BLOC entre la 12 et
 * la 13. Rien n'est supprimé : c'est du texte payé, et la substance du
 * référencement de ces pages. Seule `objections` reste à sa place, la maquette
 * lui donnant un emplacement.
 *
 * POURQUOI PAS APRÈS LA 13, comme au premier passage du 05/10 : « Un autre
 * besoin ? / Chaque situation a son offre. » est la SORTIE vers les autres
 * offres. Rendue avant six sections de corpus puis le formulaire, elle invitait
 * le lecteur à partir avant d'avoir lu « Ce que nous garantissons. » et avant
 * d'avoir atteint le formulaire. La maquette en fait son avant-dernier bloc.
 *
 * Composant SERVEUR. Les trois blocs d'accueil qu'il monte sont des composants
 * client (bascule, étapes, sélection) : ils portent leur propre `"use client"`.
 * Les révélations au défilement sont posées en `data-reveal` et animées par
 * `components/site/Moteurs.tsx`, monté une fois dans la mise en page racine.
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
  const reperes = contenu.reperes ?? [];
  const chiffres = contenu.chiffres ?? [];
  const sections = contenu.sections ?? [];
  const autres = (contenu.autres ?? []).filter(
    (carte) => !!carte.phrase && !!carte.libelle && cibleSure(carte.href),
  );

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const cta = sectionDeType(sections, "cta");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  // Le panneau de droite du héros n'existe que s'il porte un formulaire. Sans
  // en-tête fourni, le héros passe sur une colonne : la maquette met un panneau
  // en verre là, et un panneau vide vaudrait aveu.
  const heroFormulaire = !!contenu.formulaireHeroTitre;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {/*
          La gouttière de la maquette, et pas trois valeurs réécrites à la main :
          `LARGEUR` les porte déjà, et c'est elle que `.mg-pad` resserre à 20 px
          sur mobile. La version recopiée ici perdait ce repli.
        */}
        {filAriane ? (
          <section style={{ ...LARGEUR, paddingTop: 24 }}>{filAriane}</section>
        ) : null}

        {/* ----------------------------------------- 1. le héros (l. 4708) */}

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
              {contenu.pastille || contenu.mention ? (
                <div style={HERO_RANGEE_PASTILLE}>
                  {contenu.pastille ? (
                    <span style={PASTILLE}>
                      <span aria-hidden="true" style={PASTILLE_PUCE} />
                      {contenu.pastille}
                    </span>
                  ) : null}
                  {contenu.mention ? (
                    <span style={MENTION}>{contenu.mention}</span>
                  ) : null}
                </div>
              ) : null}

              {/*
                LE H1 EN DEUX ENCRES, comme la maquette le dessine (l. 4042) :
                `of.h1a` en `var(--ink)`, puis `of.h1b` dans un `<span>` en
                `var(--ink4)`. Le site rendait `pages.titre_h1` d'une seule
                pièce, et ce n'était pas le texte de la maquette : « Contrat de
                maintenance » là où elle écrit « migen© Zéro Arrêt, la
                maintenance qui ne touche jamais à votre production. ».

                `titre` reste le REPLI des douze pages de `/offres/` sans clé
                dans `OFFERS`. L'arbitrage SEO qui s'y joue (le H1 de la base
                porte le mot clé de la page, celui de la maquette non) est
                inscrit dans `docs/RESERVES-CONTENU.md`.
              */}
              <h1 style={TITRE1}>
                {contenu.titreA ?? titre}
                {contenu.titreB ? (
                  <>
                    {" "}
                    <span style={{ color: "var(--ink4)" }}>
                      {contenu.titreB}
                    </span>
                  </>
                ) : null}
              </h1>

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
                      className={styles.boutonSecondaire}
                      style={BOUTON_HERO}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/*
                LA BANDE DE REPÈRES DE LA MAQUETTE (l. 4723), ET ELLE EST RENDUE.

                Le commentaire qui était ici affirmait l'inverse : « elle reste
                vide », « deux chiffres que le contrat interdit ». C'était faux, et
                mesurable comme tel : les dix-huit gabarits de
                `supabase/import/gabarits-maquette/` écrivent TROIS repères, et
                `/offres/residence/` sert « 5 · agences en France », « 10 % · des
                candidats retenus » et « +200 · clients industriels », filet
                `height:34px` compris. Un commentaire qui dit qu'un garde-fou a
                tenu alors qu'il n'a pas tenu est pire que pas de commentaire.

                Ces deux chiffres SONT ceux de la maquette, portés mot pour mot
                sur la décision de Mehdi du 05/10, et ils contredisent les faits
                autorisés (quatre agences, dont aucune autre en France, plus de
                120 clients) : voir `docs/MAQUETTE-CONTRE-CONTRAT.md` et la
                réserve 5.3 de `docs/RESERVES-CONTENU.md`, à trancher avant que
                migen.fr pointe sur ce déploiement.
              */}
              {reperes.length > 0 ? (
                <div style={HERO_BANDE_REPERES}>
                  {reperes.map((repere, rang) => (
                    <Fragment key={`${repere.valeur}-${repere.libelle}`}>
                      {rang > 0 ? (
                        <span aria-hidden="true" style={HERO_FILET} />
                      ) : null}
                      <div>
                        <div style={HERO_REPERE_VALEUR}>{repere.valeur}</div>
                        <div style={HERO_REPERE_LIBELLE}>{repere.libelle}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>

            {heroFormulaire ? (
              <div id="besoin" style={HERO_PANNEAU_FORMULAIRE}>
                <div style={HERO_FORMULAIRE_ENTETE}>
                  <div style={HERO_FORMULAIRE_TITRE}>
                    {contenu.formulaireHeroTitre}
                  </div>
                  {contenu.formulaireHeroMention ? (
                    <div style={HERO_FORMULAIRE_MENTION}>
                      {contenu.formulaireHeroMention}
                    </div>
                  ) : null}
                </div>
                {/*
                  Le même formulaire qu'en bas de page, avec un identifiant
                  d'analyse distinct : HubSpot doit pouvoir dire lequel des deux
                  a converti. `FormulaireContact` tire ses `id` de `useId()`,
                  deux montages sur une page ne se collisionnent donc pas.
                */}
                <FormulaireContact formulaire={`${formulaire}-hero`} />
              </div>
            ) : null}
          </div>
        </section>

        {/* ----------------------------------- 2. « En bref » (l. 4762) */}

        {chiffres.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.brefSurtitre || contenu.brefTitre ? (
                  <div className="mg-r2" style={ENTETE}>
                    <div>
                      {contenu.brefSurtitre ? (
                        <div style={SURTITRE_OFFRE}>{contenu.brefSurtitre}</div>
                      ) : null}
                      {contenu.brefTitre ? (
                        <h2 style={TITRE2}>{contenu.brefTitre}</h2>
                      ) : null}
                    </div>
                    {contenu.brefChapeau ? (
                      <p style={CHAPEAU}>
                        <TexteRiche texte={contenu.brefChapeau} />
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div
                  className="mg-rmulti"
                  // La maquette en pose quatre. Au-delà la grille boucle, en
                  // deçà elle se resserre : pas de colonne vide en bout.
                  style={colonnes(Math.min(chiffres.length, 4))}
                >
                  {chiffres.map((chiffre) => (
                    <div
                      key={`${chiffre.valeur}-${chiffre.libelle}`}
                      style={CARTE_CHIFFRE}
                    >
                      <div style={CHIFFRE_VALEUR}>{chiffre.valeur}</div>
                      <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
                      {chiffre.detail ? (
                        <div style={CHIFFRE_DETAIL}>
                          <TexteRiche texte={chiffre.detail} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {contenu.brefBande ? (
                  <BandeAppel
                    texte={contenu.brefBande}
                    bouton={contenu.brefBouton}
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------- 3 à 6. les quatre sections sous condition */}

        <CommentCaMarche contenu={contenu} />
        <Formules contenu={contenu} />
        <Comparatif contenu={contenu} />
        <PremierMois contenu={contenu} />

        {/* ------------------------- 7. « Le jour et la nuit » (l. 4888) */}

        <AvantApresBascule avant={VUE_AVANT} avec={VUE_AVEC} />

        {/* --------------------------- 8. « Ce qui est inclus » (l. 4277) */}

        {/*
          LA SECTION QUE LE SITE NE RENDAIT PAS DU TOUT. `CeQuiEstInclus`
          existait, et n'était importé nulle part : le gabarit montait à sa place
          le tableau prestation / bénéfice de `blocs/Offre.tsx`, qui est un autre
          dessin et un autre texte. Les neuf lignes `of.us0` à `of.you3`, le H2
          `of.incT` (« Vous gardez la main. Nous portons le reste. »), le chapeau
          `of.incP` et la barrette « Vous voulez lire le contrat type avant d'en
          parler ? » n'étaient servis sur aucune page.

          Le tableau du corpus n'est pas perdu : il se rend entre la 12 et la 13,
          avec les autres sections rédigées, sous le surtitre « Le périmètre » que
          la maquette lui donne (l. 1881).
        */}
        <CeQuiEstInclus contenu={contenu} />

        {/* ------------------------------ 9. « Notre méthode » (l. 4963) */}

        <MethodeQuatreEtapes etapes={ETAPES_METHODE} />

        {/* --------------------------- 10. « Notre sélection » (l. 4379) */}

        {/*
          LE LIEN D'EN-TÊTE EST LIÉ À `{{ of.cta }}` DANS LA MAQUETTE : il change
          avec l'offre. Il était écrit en dur « Constituer mon équipe → » dans
          `ProcessSelection.tsx`, ce qui ne tombait juste que sur Résidence ;
          `/offres/zero-arret/` l'affichait là où la maquette écrit « Demander
          l'étude de couverture ». La propriété est optionnelle, `ProcessSelection`
          servant aussi la page d'accueil.
        */}
        <ProcessSelection
          cta={
            contenu.selectionCta
              ? { libelle: contenu.selectionCta, href: ANCRE_FORMULAIRE }
              : undefined
          }
        />

        {/* ------------------ 11. « Nos dernières réalisations » (l. 4429) */}

        {/*
          Trois cartes à PHOTO, pas sept cartes de texte. Le bloc est celui de
          l'accueil, `DernieresRealisations` : la maquette dessine la MÊME section
          aux deux endroits, et le gabarit offre en avait une seconde copie,
          `offre/Realisations.tsx`, supprimée depuis.

          SI LA MAQUETTE N'A PAS SA SECTION, LA SECTION `preuves` DU CORPUS PREND
          SA PLACE, ICI, à l'emplacement 11. Elle tombait jusqu'ici en fin de page,
          après « Ce que nous garantissons. » : les douze pages de `/offres/` sans
          clé dans `OFFERS` avaient donc une architecture de page différente des
          six autres, et la tuile « Full service » envoyait de l'une vers l'autre.
          Les deux portent le même H2, « Ce que nous avons fait, chez qui, et
          comment » : c'est la même section vue par deux gabarits, jamais les deux
          à la fois.

          CE QUE ÇA COÛTE SUR LES SIX PAGES À CLÉ `OFFERS`, et qui est inscrit
          dans `docs/RESERVES-CONTENU.md` : les sept liens d'étude de cas du
          corpus (SUEZ, FDJ, MERSEN, ERIKS, OGF, VPK, GROUPE ATLANTIC) ne sont
          plus sur ces pages. La maquette, elle, ne nomme AUCUNE URL pour ses
          trois cartes (elle navigue par `onClick="{{ goFiche }}"`). Rattacher les
          liens du corpus aux cartes de la maquette demanderait de deviner la
          correspondance entre « SUEZ IWT » et `/preuves/suez-remise-en-etat/` :
          c'est à Mehdi de la confirmer, pas à ce portage de la supposer.
        */}
        {contenu.realisations ? (
          <DernieresRealisations
            realisations={contenu.realisations.cartes}
            surtitre={contenu.realisations.surtitre}
            titre={contenu.realisations.titre}
            lien={lienSur(contenu.realisations.lien)}
          />
        ) : preuves ? (
          <Bloc section={preuves} />
        ) : null}

        {/* --------------------- 12. « Questions fréquentes » (l. 4467) */}

        {/*
          Monté directement, et non par `Bloc`, pour le bouton « Poser ma
          question » de la colonne gauche collante (maquette l. 4469). Il est
          sous condition : la centaine de pages du gabarit de vente n'en a pas.
          Les QUESTIONS, sur les six pages à clé `OFFERS`, sont celles de la
          maquette (`RES_FAQ` pour Résidence, `FAQ_BY` pour les cinq autres).
        */}
        {objections ? (
          <Objections section={objections} cta={liensSurs(contenu.faqBouton ? [contenu.faqBouton] : [])[0]} />
        ) : null}

        {/* ---- LE TEXTE RÉDIGÉ QUE LA MAQUETTE NE MONTRE PAS, ENTRE LA 12 ET LA 13 */}

        {/*
          LES CINQ SECTIONS DU CORPUS, EN BLOC, ENTRE LA FAQ ET « UN AUTRE BESOIN ? ».
          Elles étaient INTERCALÉES entre les sections de la maquette jusqu'au
          05/10 : « Le problème » entre la bascule et « Ce qui est inclus », puis
          « Le déroulé », « Nos engagements » (le H2 « Ce que nous garantissons. »,
          exactement là où la maquette écrit « Vous gardez la main. Nous portons
          le reste. ») et un appel. La décision du 05/10 annule cette
          intercalation : la maquette tient sa colonne vertébrale, et le texte
          payé devient la suite de la page. Rien n'est supprimé.

          POURQUOI AVANT LA 13 ET NON APRÈS. « Un autre besoin ? / Chaque
          situation a son offre. » est la SORTIE de la page : elle invite le
          lecteur à aller voir une autre offre. Placée après la FAQ mais avant ce
          bloc, elle le faisait partir avant d'avoir lu « Ce que nous
          garantissons. » et avant d'atteindre le formulaire. La maquette en fait
          son avant-dernier bloc, juste avant le formulaire : c'est la place
          qu'elle reprend.

          `cta` n'est rendue ici que sur les six pages à clé `OFFERS` : sur les
          douze autres, elle EST la bande de « En bref », et la rendre deux fois
          répéterait le même bouton (`scripts/produit_gabarit_offre.mjs` la retire
          alors de `sections`).
        */}
        {probleme ? <Bloc section={probleme} /> : null}
        {offre ? <Bloc section={offre} /> : null}
        {deroule ? <Bloc section={deroule} /> : null}
        {garanties ? <Bloc section={garanties} /> : null}
        {cta ? <Bloc section={cta} /> : null}

        {/* ---------------------- 13. « Un autre besoin ? » (l. 5152) */}

        {autres.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.autresSurtitre || contenu.autresTitre ? (
                  <div className="mg-r2" style={ENTETE}>
                    <div>
                      {contenu.autresSurtitre ? (
                        <div style={SURTITRE_OFFRE}>
                          {contenu.autresSurtitre}
                        </div>
                      ) : null}
                      {contenu.autresTitre ? (
                        <h2 style={TITRE2}>{contenu.autresTitre}</h2>
                      ) : null}
                    </div>
                    {contenu.autresChapeau ? (
                      <p style={CHAPEAU}>
                        <TexteRiche texte={contenu.autresChapeau} />
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {/*
                  LA MAQUETTE EN POSE SIX, EN DEUX COLONNES : trois rangées
                  pleines. Le gabarit retire la tuile de la page courante, il en
                  reste cinq, et la troisième rangée avait une case vide à droite
                  sur les six pages. La dernière tuile prend donc les deux colonnes
                  quand le compte est impair. La maquette ne dessine pas ce cas :
                  elle n'a jamais cinq tuiles.
                */}
                <div
                  className="mg-r2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {autres.map((carte, rang) => (
                    <Link
                      key={carte.href}
                      href={carte.href}
                      prefetch={false}
                      className={styles.carteAutre}
                      style={
                        autres.length % 2 === 1 && rang === autres.length - 1
                          ? { ...CARTE_AUTRE, gridColumn: "1 / -1" }
                          : CARTE_AUTRE
                      }
                    >
                      <span style={CARTE_AUTRE_PHRASE}>{carte.phrase}</span>
                      <span style={CARTE_AUTRE_LIBELLE}>
                        {carte.libelle} →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------- le formulaire de bas de page (l. 4499) */}

        {/*
          Le H2 est `{{ of.form }}` sur les six pages à clé `OFFERS`, la question
          de la section `ctaFinal` du corpus sur les douze autres. Sans ni l'un ni
          l'autre, les valeurs par défaut de `FormulaireBasDePage` jouent, elles
          aussi relevées dans la maquette : la copie n'est pas recopiée ici.
        */}
        <FormulaireBasDePage
          formulaire={formulaire}
          titre={contenu.formulaireTitre ?? ctaFinal?.question}
          intro={contenu.formulaireIntro}
        />

        {maillage ? (
          <div style={{ ...LARGEUR, paddingBottom: 80 }}>{maillage}</div>
        ) : null}
      </main>
    </div>
  );
}
