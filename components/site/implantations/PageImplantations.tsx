import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { entreeDe, gabaritDe } from "@/components/site/cocon/maillage-mobile";
import ChiffresVille from "@/components/site/implantation/ChiffresVille";
import { DerouleRepliable, resumeOffre } from "@/components/site/implantation/SectionsRepliables";
import { etapesDe } from "@/components/site/implantation/fil-ariane-mobile";
import OuvreLaCible from "@/components/site/implantation/OuvreLaCible";
import PanneauHerosRepliable from "@/components/site/implantation/PanneauHerosRepliable";
import stylesVille from "@/components/site/implantation/PageVille.module.css";
import ProblemeCartes from "@/components/site/implantation/ProblemeCartes";
import MaillageVille from "@/components/site/implantation/MaillageVille";
import QuestionsVille from "@/components/site/implantation/QuestionsVille";
import RepliFormulaireMobile from "@/components/site/implantation/RepliFormulaireMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import AppelFinal from "@/components/site/offre/AppelFinal";
import AppelOffre from "@/components/site/offre/AppelOffre";
import BandeAppel from "@/components/site/offre/BandeAppel";
import GarantiesOffre from "@/components/site/offre/GarantiesOffre";
import {
  BOUTON_HERO,
  CHAPEAU_HERO,
  HERO,
  HERO_GRILLE,
  HERO_MENTION,
  HERO_RANGEE_BOUTONS,
  HERO_RANGEE_PASTILLE,
  PASTILLE,
  PASTILLE_PUCE,
  TITRE1,
} from "@/components/site/offre/habillage-offre";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import { liensSurs } from "@/components/site/offre/LiensOffre";
import TelephoneHeros from "@/components/site/offre/TelephoneHeros";
import LogosClients from "@/components/site/offre/LogosClients";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import stylesOffres from "@/components/site/offres/PageOffres.module.css";
import PointsOffre from "@/components/site/offre/PointsOffre";
import Reassurance from "@/components/site/offre/Reassurance";
import ReferencesOffre from "@/components/site/offre/ReferencesOffre";
import type { Section, TypeSection } from "@/types/contenu";
import { altPhoto } from "@/lib/descriptions-photos";
import type { ContenuImplantations } from "@/types/implantations";

import NosHubsMobile from "./NosHubsMobile";
import NosVilles from "./NosVilles";
import styles from "./PageImplantations.module.css";

const PHOTO_HEROS_MOBILE = "/assets/web/ph-hero-raffinerie.jpg";

/**
 * Le hub `/implantations/`, gabarit « 10 Hub de rubrique », contre sa capture
 * `maquette/rendu/implantations.html` (17 écrans). C'est la suite de
 * `PageVille`, écran pour écran, moins « Hub local », plus « Nos villes » entre
 * la bande d'appel des références et les questions. `PageVille` n'a pas
 * d'emplacement à cet endroit (composant d'un autre lot) : la composition est
 * reprise ici avec les MÊMES écrans importés, rien n'est redessiné.
 *
 *  0 Héros · 1 Chiffres · 2 Logos · 3 Réassurance · 4 Appel · 5 Problème en
 *  rangée · 6 Offre · 7 Appel sombre · 8 Déroulé · 9 Garanties · 10 Appel ·
 *  11 Références · 12 Appel · 13 Nos villes · 14 Questions · 15 Maillage ·
 *  16 Appel final
 */

export interface ProprietesPageImplantations {
  titre: string;
  contenu: ContenuImplantations;
  formulaire: string;
  /**
   * Le chemin de la page (« /implantations/ »), passé par la route. Il porte la
   * couche mobile v2 : fil d'Ariane du héros et cadence de conversion, tous
   * deux dérivés de l'index de la maquette. Absent, elle ne se rend pas.
   */
  chemin?: string;
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

function sectionDeType<T extends TypeSection>(sections: readonly Section[], type: T) {
  return sections.find((s) => s.type === type) as Extract<Section, { type: T }> | undefined;
}

export default function PageImplantations({
  titre,
  contenu,
  formulaire,
  chemin,
  filAriane,
  maillage,
}: ProprietesPageImplantations) {
  const c = contenu;
  const h1 = titre;

  const actions = liensSurs(c.actions ?? []);
  const chiffres = c.chiffres ?? [];
  const sections = c.sections ?? [];
  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");
  const appelDeFin = ctaFinal?.question
    ? { ...ctaFinal, bouton: ctaFinal.bouton || c.appelBouton || "" }
    : undefined;

  const bande = (variante?: "sombre") =>
    c.mention || c.appelBouton ? <BandeAppel mention={c.mention} bouton={c.appelBouton} variante={variante} /> : null;

  /* LA COUCHE MOBILE V2 (14/10), même composition que `PageVille` : rien ne
     change au-dessus de 880 px. Le gabarit vient de l'index (« 10 Hub de
     rubrique ») ; sans entrée d'index, ni fil ni cadence. */
  const etapes = chemin ? etapesDe(chemin) : [];
  const entree = chemin ? entreeDe(chemin) : undefined;
  const cadence = entree ? gabaritDe(entree) : undefined;

  /* Les cinq sections NUMÉROTÉES du corpus, celles que la maquette compte
     (`nD`) : problème, offre, déroulé, garanties, références. Les bandes
     d'appel et « 07 Appel » de bureau suivent leur section dans le même
     fragment, sans compter. « Nos hubs » non plus (dc.html L463 : `return`
     avant `nD++`) : « Nos villes » reste donc hors de la cadence, à sa place
     de bureau. Le problème, première section, reste OUVERT (`nOpen = 1`). */
  const contenus = [
    <Fragment key="probleme">{probleme ? <ProblemeCartes section={probleme} /> : null}</Fragment>,
    <Fragment key="offre">
      {offre ? <PointsOffre section={offre} resume={resumeOffre(offre)} /> : null}
      {bande("sombre")}
    </Fragment>,
    <Fragment key="deroule">{deroule ? <DerouleRepliable section={deroule} /> : null}</Fragment>,
    <Fragment key="garanties">
      {garanties ? <GarantiesOffre section={garanties} /> : null}
      {c.brefBande ? <AppelOffre question={c.brefBande} bouton={c.brefBouton} mention={c.brefMention} /> : null}
    </Fragment>,
    <Fragment key="preuves">
      {preuves ? <ReferencesOffre section={preuves} dateBrute toujoursOuvert /> : null}
      {bande()}
      {/* Ferme la suite des sections au téléphone : voir `PageVille`. */}
      <span data-queue-mobile="" hidden />
    </Fragment>,
  ];

  return (
    /*
     * `stylesOffre.gabarit` : LES RÈGLES MOBILES DU GABARIT EMBARQUÉ, et sans
     * elles ce hub n'en avait AUCUNE.
     *
     * Ce fichier reprend les écrans de `PageVille` un par un, et le dit en
     * tête. Mais `PageVille` pose `stylesOffre.gabarit` sur sa racine, et pas
     * lui : les écrans importés arrivaient donc ici sans les règles de largeur
     * que la maquette leur donne. Mesuré le 13/10 à 320 px, après hydratation :
     * la rangée de constats « 03 Problème » (`.g3-pbgrid`) gardait ses SIX
     * colonnes de 38 px. Chaque carte faisait 50 px de large pour 24 px de
     * remplissage de chaque côté, soit ZÉRO pixel de texte, et les six constats
     * débordaient les uns sur les autres, illisibles. À 390 px il restait 2 px.
     *
     * Toutes les règles de `.gabarit` vivent dans des `@media` de 1000 px et en
     * dessous : la capture de référence, prise à 1280 px, ne bouge pas d'un
     * pixel. Le `.racine` du hub reste en place, il porte autre chose
     * (`--sec`, l'écart de `.mg-r2`).
     */
    <div className={`mg-site ${stylesOffre.gabarit} ${stylesVille.racineVille}`}>
      {/* `racine` : la racine `.mgx-root` du gabarit d'offre, comme le hub `/offres/`. */}
      {/* `data-ordre-mobile` : au téléphone, l'ordre de la maquette (socle de
          app/globals.css) ; « Nos villes » remonte sous les chiffres
          (`.villesMobile`). Au-dessus de 880 px, aucune règle. */}
      <main data-ordre-mobile="" className={stylesOffres.racine} style={{ paddingTop: 62 }}>
        {filAriane}

        <section className={`${stylesVille.herosVille} ${styles.teteMobile}`} style={HERO}>
          {/* Le fil d'Ariane de la maquette mobile (dc.html L104), sous
              881 px seulement, au-dessus de tout comme sur les pages villes. */}
          {etapes.length > 0 ? (
            <div data-mobile-seulement="" className={stylesVille.filMobile}>
              <FilArianeVue etapes={etapes} />
            </div>
          ) : null}
          <div
            className="mg-r2"
            style={{ display: "grid", gridTemplateColumns: HERO_GRILLE, gap: 52, alignItems: "start" }}
          >
            {/* `data-heros-*` : la colonne de la maquette mobile (socle de
                app/globals.css), comme `HerosVille`. Au-dessus de 880 px,
                aucune règle. */}
            <div data-heros-colonne="">
              {/* La photo de tête de la maquette (dc.html `FIMG.implantations`,
                  la raffinerie), que la page porte déjà : carte « Arrêt
                  technique » du maillage des offres (`MaillageVille`). `lazy`
                  et non `eager` : masquée au bureau, elle n'y est pas chargée,
                  et la carte du maillage, même fichier, garde son chargement
                  de bureau. ponytail: perd la priorité LCP au téléphone. */}
              <div data-heros-photo="" data-mobile-seulement="">
                <Image
                  src={PHOTO_HEROS_MOBILE}
                  alt={altPhoto(PHOTO_HEROS_MOBILE)}
                  fill
                  loading="lazy"
                  sizes="(max-width: 880px) 100vw, 1px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              {/* Le sur-titre du gabarit « 10 Hub de rubrique » de la maquette
                  (`KICK["10"]`) ; celui de bureau s'efface sous 881 px. */}
              <div data-heros-pastille="" data-mobile-seulement="" style={HERO_RANGEE_PASTILLE}>
                <span style={PASTILLE}>Rubrique</span>
              </div>
              {c.pastille ? (
                <div data-heros-pastille="" className={styles.pastilleBureau} style={HERO_RANGEE_PASTILLE}>
                  <span style={PASTILLE}>
                    <span aria-hidden="true" style={PASTILLE_PUCE} />
                    {c.pastille}
                  </span>
                </div>
              ) : null}
              <h1 style={TITRE1}>
                {h1}
              </h1>
              {c.chapeau ? (
                <p data-heros-chapeau="" style={CHAPEAU_HERO}>
                  <TexteRiche texte={c.chapeau} />
                </p>
              ) : null}
              {actions.length > 0 ? (
                <div data-heros-boutons="" style={HERO_RANGEE_BOUTONS}>
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
                  <TelephoneHeros />
                </div>
              ) : null}
              {c.mention ? (
                <p data-heros-mention="" style={HERO_MENTION}>
                  {c.mention}
                </p>
              ) : null}
            </div>
            {/* G2 : le panneau se replie au téléphone, voir le composant. */}
            <PanneauHerosRepliable
              formulaire={formulaire}
              titre={c.formulaireHeroTitre ?? ""}
              pastille={c.formulaireHeroMention}
            />
          </div>
        </section>

        {/* « Chiffres clés » en tuiles 2 x 2 au téléphone : même balisage
            que le bureau, plus les attributs du socle. */}
        <div className={styles.teteMobile}>
          <ChiffresVille chiffres={chiffres} />
        </div>

        <LogosClients />
        <Reassurance />
        {bande()}

        {cadence ? (
          /* Pas de rappel final ajouté : « 10 Appel final » porte déjà le
             formulaire de bas de page, comme sur les pages villes. */
          <AvecConversionMobile chemin={chemin!} gabarit={cadence} bouton={actions[0]} rappelFinal={false}>
            {contenus}
          </AvecConversionMobile>
        ) : (
          contenus
        )}

        {c.villes ? (
          <div className={styles.villesMobile}>
            {/* Au téléphone, « Nos hubs » de la maquette ; le bloc de bureau s'efface. */}
            <NosHubsMobile villes={c.villes} />
            <div className={styles.villesBureau}>
              <NosVilles villes={c.villes} />
            </div>
          </div>
        ) : null}

        {/* La question finale du corpus, dernière question au téléphone : voir `PageVille`. */}
        {objections ? <QuestionsVille section={objections} derniere={appelDeFin} /> : null}
        <MaillageVille />

        {/* La carte « Être rappelé » de la maquette (`#etre-rappele`), téléphone seulement. */}
        {chemin ? <RappelFinalMobile /> : null}

        {/* La capture pose l'ancre `#mgx-form` sur l'appel final, cible de
            « Poser ma question ». Replié au téléphone : voir `PageVille`. */}
        <div id={chemin ? undefined : "etre-rappele"} className={stylesVille.appelFinal} style={{ scrollMarginTop: 90 }}>
          <RepliFormulaireMobile etiquette={c.appelBouton ?? "Parler à un chargé d'affaires"}>
            <div id="mgx-form" style={{ scrollMarginTop: 90 }}>
              <AppelFinal question={ctaFinal?.question} formulaire={formulaire} bouton={c.appelBouton} />
            </div>
          </RepliFormulaireMobile>
        </div>

        {maillage ? (
          <div className={stylesVille.maillageBas} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
            {maillage}
          </div>
        ) : null}

        {/* En dernier : son effet passe après ceux qui replient les blocs. */}
        <OuvreLaCible />
      </main>
    </div>
  );
}
