import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import CertificationsRse from "@/components/site/accueil/CertificationsRse";
import MarqueeClients from "@/components/site/accueil/MarqueeClients";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import type { Section, TypeSection } from "@/types/contenu";
import type { ContenuOffre } from "@/types/offre";

import {
  CHAPEAU_HERO,
  CHIFFRE_HERO_FILET,
  CHIFFRE_HERO_LIBELLE,
  CHIFFRE_HERO_VALEUR,
  COPIE,
  FIL_ARIANE,
  grilleChiffresHero,
  HERO,
  HERO_FORMULAIRE_ENTETE,
  HERO_FORMULAIRE_MENTION,
  HERO_FORMULAIRE_TITRE,
  HERO_GRILLE,
  HERO_PANNEAU_FORMULAIRE,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  LIEN_TELEPHONE_HERO,
  PASTILLE,
  PASTILLE_PUCE,
  PHOTO_BANDEAU,
  PHOTO_BASELINE,
  PHOTO_CADRE,
  PHOTO_IMAGE,
  PHOTO_PIED,
  PHOTO_SECTION,
  PHOTO_SIGNATURE,
  PHOTO_TITRE,
  PHOTO_VOILE,
  PHRASE_DELAI,
  REASSURANCE_GRILLE,
  TITRE1,
} from "./habillage-offre";
import { cibleSure, liensSurs } from "./LiensOffre";
import styles from "./PageOffre.module.css";
import PanneauQuiIntervient from "./PanneauQuiIntervient";
import {
  SectionGarantiesGabarit,
  SectionMethodeGabarit,
  SectionOffreGabarit,
  SectionProblemeGabarit,
} from "./SectionsOffre";
import {
  SectionAppelGabarit,
  SectionFinaleGabarit,
  SectionMaillageGabarit,
  SectionQuestionsGabarit,
  SectionReferencesGabarit,
} from "./SectionsPreuve";

/**
 * Gabarit OFFRE, porté de « Migen - Gabarit 03 Offre.dc.html », dont la copie
 * versionnée est `maquette/gabarit-03-offre.html`.
 *
 * CE FICHIER A ÉTÉ RÉÉCRIT, ET IL FAUT SAVOIR POURQUOI. Sa première version
 * était portée de « Migen - Site final.dc.html », que le client avait envoyé par
 * message. Personne n'a listé les fichiers du projet Claude Design : il contient
 * ONZE GABARITS DÉDIÉS, bien plus riches, et c'est le gabarit 03 qui fait foi
 * pour `/offres/<offre>/`. Le client a dit trois fois « les pages offres ne
 * ressemblent toujours pas ». Il avait raison, et la cause n'était pas le
 * portage : c'était le fichier lu.
 *
 * CE QUI MANQUAIT, et que ce fichier ajoute :
 *   · le bandeau photo pleine largeur sous le héros ;
 *   · le bandeau de logos clients, « Ils nous font confiance » ;
 *   · la section de réassurance, certifications et « Qui intervient chez vous » ;
 *   · le panneau « Notre parti pris ».
 * CE QUI ÉTAIT FAUX : « Votre problématique » sortait en liste à puces sur
 * panneau sombre, quand la maquette pose quatre cartes en verre numérotées.
 *
 * LES TREIZE SECTIONS DE LA MAQUETTE, ET CE QUI LES ALIMENTE. Le dessin vient de
 * la maquette, le texte vient du corpus, rien ne s'invente. Une section dont le
 * corpus ne fournit pas la matière n'est pas rendue du tout, surtitre compris.
 *
 *   1. « 01 Héros »        ← `chapeau`, `chiffres`, `mention`, `actions`,
 *                             `formulaireHeroTitre`, et le H1 de la page
 *   2. « 02 Photo »        ← visuel de site, `/assets/web/team-grind-sparks.jpg`
 *   3. « 02 Logos »        ← `accueil/MarqueeClients`, importé
 *   4. « Réassurance »     ← `accueil/CertificationsRse` à gauche,
 *                             `PanneauQuiIntervient` à droite
 *   5. « 03 Problème »     ← section `probleme` du corpus
 *   6. « 04 Offre »        ← section `offre`
 *   7. « 05 Déroulé »      ← section `deroule`
 *   8. « 06 Garanties »    ← section `garanties`
 *   9. « 07 Appel »        ← `brefBande` et `brefBouton`, l'appel de milieu
 *                             de page du corpus
 *  10. « 08 Références »   ← section `preuves`
 *  11. « 09 Questions »    ← section `objections`
 *  12. « Maillage »        ← `autres`, la grille curée du cocon
 *  13. « 10 Appel final »  ← section `ctaFinal`
 *
 * AUCUNE SECTION DU CORPUS N'EST PERDUE. Les sept types que les dix-huit pages
 * portent (`probleme`, `offre`, `deroule`, `garanties`, `preuves`, `objections`,
 * `ctaFinal`) trouvent tous leur place dans le dessin du gabarit 03. C'est un
 * changement par rapport à la version précédente, qui devait en reléguer quatre
 * sous les sections de la maquette faute d'emplacement : le gabarit dédié en a
 * un pour chacune.
 *
 * CE QUE LE GABARIT 03 NE DESSINE PAS, et qui n'est donc pas rendu : les
 * ÉTIQUETTES de sections que ce gabarit ne porte pas. `brefSurtitre` (« En
 * bref »), `brefTitre` (« Le cadre, en quatre chiffres. »), `brefChapeau`,
 * `autresSurtitre` (« Un autre besoin ? ») et `autresTitre` (« Chaque situation
 * a son offre. ») nommaient des sections d'un AUTRE dessin. Les chiffres qu'ils
 * annonçaient sont dans la bande du héros, sans titre, et les cartes qu'ils
 * annonçaient sont « Pour aller plus loin ». Ce sont des étiquettes de dessin,
 * pas du corps de texte : le gabarit en pose les siennes. Réserve suivie dans
 * `docs/RESERVES-CONTENU.md`.
 *
 * Composant SERVEUR. Les révélations au défilement sont posées en `data-reveal`
 * et animées par `components/site/Moteurs.tsx`, monté une fois dans la mise en
 * page racine.
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
   *
   * Le fil remplace celui de la maquette (« Accueil / Nos offres / le H1 »),
   * qui est posé en repli quand la page n'en fournit pas.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/** La section du corpus de ce type, s'il y en a une. */
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
  const autres = (contenu.autres ?? []).filter(
    (carte) => !!carte.phrase && !!carte.libelle && cibleSure(carte.href),
  );

  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");

  // Le panneau de droite du héros n'existe que s'il porte un formulaire. Sans
  // en-tête fourni, le héros passe sur une colonne : la maquette met un panneau
  // en verre là, et un panneau vide vaudrait aveu.
  const heroFormulaire = !!contenu.formulaireHeroTitre;

  return (
    <div className="mg-site">
      {/* `paddingTop` : l'en-tête du site est en `position:sticky`, comme dans
          la maquette, et le héros ouvre juste dessous. */}
      <main style={{ paddingTop: 96 }}>
        {/* --------------------------------------------- 1. « 01 Héros » */}

        <section style={HERO}>
          <div style={FIL_ARIANE}>
            {filAriane ?? (
              <>
                <Link href="/" prefetch={false} style={{ color: "var(--ink4)" }}>
                  {COPIE.filAccueil}
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  href="/offres/"
                  prefetch={false}
                  style={{ color: "var(--ink4)" }}
                >
                  {COPIE.filOffres}
                </Link>
                <span aria-hidden="true">/</span>
                <span style={{ color: "var(--ink1)" }}>{titre}</span>
              </>
            )}
          </div>

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
              <div style={HERO_RANGEE_PASTILLE}>
                <span style={PASTILLE}>
                  <span aria-hidden="true" style={PASTILLE_PUCE} />
                  {COPIE.pastilleHero}
                </span>
              </div>

              <h1 style={TITRE1}>{titre}</h1>

              {contenu.chapeau ? (
                <p style={CHAPEAU_HERO}>
                  <TexteRiche texte={contenu.chapeau} />
                </p>
              ) : null}

              <div style={HERO_RANGEE_BOUTONS}>
                {/*
                  Le bouton orange de la maquette vise son panneau de
                  formulaire. Les boutons du corpus (« Les cinq offres ») le
                  suivent, en lien de texte : deux boutons pleins côte à côte
                  mettent le visiteur devant deux actions de même poids.
                */}
                {heroFormulaire ? (
                  <a
                    href="#besoin"
                    className={styles.boutonPrincipal}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "15px 26px",
                      borderRadius: 999,
                      background: "var(--acc)",
                      color: "#fff",
                      font: "600 15px var(--fb)",
                      boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                      transition: "filter var(--tr),transform var(--tr)",
                    }}
                  >
                    {contenu.formulaireHeroTitre}
                  </a>
                ) : null}
                <a
                  href={TELEPHONE_SITE.href}
                  className={styles.lienTelephone}
                  style={LIEN_TELEPHONE_HERO}
                >
                  {TELEPHONE_SITE.affichage}
                </a>
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    prefetch={false}
                    className={styles.lienTelephone}
                    style={LIEN_TELEPHONE_HERO}
                  >
                    {action.libelle}
                  </Link>
                ))}
              </div>

              {/*
                LA BANDE DE CHIFFRES DU HÉROS, et non une section « En bref »
                plus bas. Le gabarit 03 met les chiffres du corpus ici, séparés
                par des filets verticaux, sous les boutons. La version
                précédente en faisait une section de cartes : c'est le dessin
                d'un autre fichier de maquette.
              */}
              {chiffres.length > 0 ? (
                <div
                  className="g3-hs"
                  style={grilleChiffresHero(chiffres.length)}
                >
                  {chiffres.map((chiffre, rang) => (
                    <div
                      key={`${chiffre.valeur}-${chiffre.libelle}`}
                      style={rang > 0 ? CHIFFRE_HERO_FILET : undefined}
                    >
                      <div style={CHIFFRE_HERO_VALEUR}>{chiffre.valeur}</div>
                      <div style={CHIFFRE_HERO_LIBELLE}>{chiffre.libelle}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {contenu.mention ? (
                <p style={PHRASE_DELAI}>
                  <TexteRiche texte={contenu.mention} />
                </p>
              ) : null}
            </div>

            {heroFormulaire ? (
              <div id="besoin" style={HERO_PANNEAU_FORMULAIRE}>
                <div style={HERO_FORMULAIRE_ENTETE}>
                  <div style={HERO_FORMULAIRE_TITRE}>
                    {contenu.formulaireHeroTitre}
                  </div>
                  {/*
                    « Rappel dans l'heure », le SEUL délai que le contrat
                    autorise. La maquette l'écrit en dur ; le corpus l'écrit
                    aussi dans `formulaireHeroMention`. On prend le corpus quand
                    il est là, et la maquette sinon : les deux disent la même
                    chose, et une page sans mention n'a pas à perdre l'étiquette.
                  */}
                  <div style={HERO_FORMULAIRE_MENTION}>
                    {contenu.formulaireHeroMention ?? COPIE.mentionRappel}
                  </div>
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

        {/* --------------------------------------------- 2. « 02 Photo » */}

        {/*
          Le bandeau photo pleine largeur. Il manquait entièrement.

          L'IMAGE EST UN VISUEL DE SITE, pas du corpus : la maquette la nomme
          elle-même (`assets/web/team-grind-sparks.jpg`) et le fichier est déjà
          dans `public/`. Le corpus ne porte aucune image et n'en porte pas la
          charge.

          `priority` : c'est la plus grande image au-dessus de la ligne de
          flottaison sur un écran court, donc le LCP probable.
        */}
        <section style={PHOTO_SECTION}>
          <div style={PHOTO_CADRE}>
            <Image
              src={PHOTO_BANDEAU}
              alt={COPIE.photoAlt}
              width={1200}
              height={420}
              priority
              sizes="(max-width: 1240px) 100vw, 1120px"
              style={PHOTO_IMAGE}
            />
            <div aria-hidden="true" style={PHOTO_VOILE} />
            <div style={PHOTO_SIGNATURE}>
              <Image
                src="/assets/logo-migen-white.png"
                alt=""
                width={88}
                height={20}
                style={{ height: 20, width: "auto", opacity: 0.95 }}
              />
              <span style={PHOTO_BASELINE}>{COPIE.photoBaseline}</span>
            </div>
            <div style={PHOTO_PIED}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 12,
                }}
              >
                {COPIE.photoSurtitre}
              </div>
              {/* `div` et non `h2` : la maquette l'écrit en `div`, et redire le
                  H1 en titre de niveau 2 ajouterait un doublon au plan. */}
              <div style={PHOTO_TITRE}>{titre}</div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------- 3. « 02 Logos » */}

        {/*
          Le bandeau de logos clients, importé d'`accueil/MarqueeClients` : même
          marquee, mêmes logos, même masque. Seul le surtitre change, le gabarit
          03 écrivant « Ils nous font confiance » là où l'accueil écrit le
          compte de clients. La maquette, elle, n'avait pas les fichiers de logos
          et posait des noms en texte : des logos valent mieux, et c'est le même
          dessin de bandeau.
        */}
        <MarqueeClients surtitre={COPIE.logosSurtitre} />

        {/* ------------------------------------------ 4. « Réassurance » */}

        {/*
          Certifications à gauche (MASE, EcoVadis : la carte en verre est au
          pixel celle de ce gabarit), « Qui intervient chez vous » à droite. Le
          panneau de droite de l'accueil est « Sécurité & RSE », qui n'est pas ce
          que ce gabarit dessine : il est remplacé, pas recopié.
        */}
        <CertificationsRse
          grille={REASSURANCE_GRILLE}
          panneauDroit={<PanneauQuiIntervient />}
        />

        {/* --------------------------- 5 à 8. le corps, venu du corpus */}

        {probleme ? <SectionProblemeGabarit section={probleme} /> : null}
        {offre ? <SectionOffreGabarit section={offre} /> : null}
        {deroule ? <SectionMethodeGabarit section={deroule} /> : null}
        {garanties ? <SectionGarantiesGabarit section={garanties} /> : null}

        {/* ----------------------------------- 9 à 13. preuve et appels */}

        <SectionAppelGabarit
          question={contenu.brefBande}
          bouton={contenu.brefBouton?.libelle}
          href={contenu.brefBouton?.href}
        />
        {preuves ? <SectionReferencesGabarit section={preuves} /> : null}
        {objections ? <SectionQuestionsGabarit section={objections} /> : null}
        <SectionMaillageGabarit cartes={autres} />
        <SectionFinaleGabarit
          question={ctaFinal?.question}
          bouton={ctaFinal?.bouton}
          rappel={ctaFinal?.rappel}
          href={ctaFinal?.href}
        />

        {/*
          Le maillage du cocon fourni par la page (parent, enfants, sœurs). Il
          vient SOUS les cartes « Pour aller plus loin » du corpus : la maquette
          n'a qu'une section de maillage, et les deux sources sont distinctes.
        */}
        {maillage ? (
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "var(--sec) 40px 80px",
            }}
          >
            {maillage}
          </div>
        ) : null}
      </main>
    </div>
  );
}
