import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import { varianteDe } from "@/components/site/mobile/conversion-donnees";
import type { ContenuRessource, LectureRessource } from "@/types/ressource";
import type { Question } from "@/types/contenu";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { resumeDe } from "@/components/site/blocs/resume-de-section";

import CorpsRessource, { EnLigne } from "./CorpsRessource";
import FermeAuTelephone from "./FermeAuTelephone";
import styles from "./Ressource.module.css";
import * as H from "./habillage";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";
import { filAriane as filArianeJsonLd, jsonLdTexte, organisation } from "@/lib/seo/jsonld";
import { urlAbsolue, urlImage } from "@/lib/seo/url";
import { cibleDuLien } from "@/lib/redirections";

/**
 * Le gabarit « 01 Article et fiche » : `MigenRessource.dc.html`, branche
 * `isArticle`, rendu contre `maquette/rendu/ressources--<rayon>--<page>.html`.
 *
 * Cinq sections, et seulement elles, dans l'ordre de la capture :
 *   Ressources · héros, Article · corps, Questions fréquentes, À lire
 *   ensuite, Ressources · appel.
 *
 * CE QUE LA PAGE NE REND PLUS, et pourquoi. Le fil d'Ariane du cocon, le
 * formulaire de bas de page et la grille de maillage que la route passe en
 * `filAriane` et `maillage` : la capture n'en porte aucun. Son fil est DANS le
 * héros (rendu ici par `FilArianeVue`, la rangée du site, sur le libellé du
 * rayon et le titre court de la maquette), son maillage est « Sur le même
 * sujet », son appel final mène à `/contact/`. Les deux props restent typées
 * pour que la route compile ; rien ne les monte, donc rien ne les exécute.
 *
 * Composant SERVEUR. Le seul comportement est natif : `<details name>` pour la
 * FAQ à une question ouverte (consigne du README), ancres pour le sommaire.
 */

/** `p.short` de la maquette : 46 signes, puis une ellipse. */
function titreCourt(titre: string): string {
  return titre.length > 46 ? `${titre.slice(0, 46)}…` : titre;
}

/**
 * L'etiquette PRONONCEE d'un champ : la copie, sans l'asterisque decorative.
 *
 * L'asterisque marque l'oeil, elle ne se dit pas. Le depot la masque partout
 * ailleurs (`aria-hidden` sur `Obligatoire()` dans PostulerMetier, sur
 * `ASTERISQUE` dans FormulaireContact), et le composant frere RappelExpress la
 * laisse dans le texte indicatif en la retirant de son `aria-label`. La carte du
 * livre blanc, elle, passait `H.COPIE` tel quel dans les deux : un lecteur
 * d'ecran annoncait « E-mail professionnel etoile ».
 *
 * Le texte indicatif garde son asterisque : c'est la copie visible de la
 * maquette, et elle ne bouge pas d'un pixel.
 */
function etiquetteParlee(copie: string): string {
  return copie.replace(/\s*\*\s*$/, "");
}

/**
 * La carte du livre blanc, à la place de la photo.
 *
 * ÉCART DÉCLARÉ : la maquette simule l'envoi (« C’est envoyé. ») sans rien
 * envoyer, et aucun PDF n'existe. Ici le dessin est celui de la capture, mais
 * le bouton mène au formulaire de contact réel. Les champs n'ont pas de `name` :
 * rien de ce qui est saisi ne part dans l'adresse.
 */
function CarteLivre() {
  return (
    <div id="mr-dl" style={H.CARTE_LIVRE}>
      <div style={H.SURTITRE_LIVRE}>{H.COPIE.livreSurtitre}</div>
      <div style={H.TITRE_LIVRE}>{H.COPIE.livreTitre}</div>
      <form action={H.CONTACT} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 12 }}>
        <input
          type="email"
          placeholder={H.COPIE.livreEmail}
          aria-label={etiquetteParlee(H.COPIE.livreEmail)}
          style={H.CHAMP}
        />
        <input
          type="text"
          placeholder={H.COPIE.livreEntreprise}
          aria-label={etiquetteParlee(H.COPIE.livreEntreprise)}
          style={H.CHAMP}
        />
        <button type="submit" style={H.BOUTON_LIVRE}>
          {H.COPIE.livreBouton}
        </button>
        <span style={{ font: "400 12px var(--fb)", color: "var(--ink4)" }}>
          {H.COPIE.livreMention}
        </span>
      </form>
    </div>
  );
}

function Questions({ questions }: { questions: Question[] }) {
  return (
    <section
      id="mr-faq"
      data-screen-label="Questions fréquentes"
      className={styles.sectionSuite}
      style={{ ...H.SECTION_SUITE, scrollMarginTop: 90 }}
    >
      <div className={styles.faq} style={H.FAQ_CARTE}>
        {/* AU TÉLÉPHONE, LA FAQ EST UNE SIMPLE LISTE DE CARTES BLANCHES
            (dc.html, `isTitle` puis `isQ`) : le panneau photo de bureau
            s'efface (photo et voile, ornements, `Ressource.module.css`), le
            sur-titre et le titre prennent la typographie de la maquette et
            les questions le motif partagé `[data-faq-liste]`. */}
        <Image
          src={H.FAQ_PHOTO}
          alt={altPhoto(H.FAQ_PHOTO)}
          fill
          sizes="1120px"
          className={styles.faqFond}
          style={{ objectFit: "cover" }}
        />
        <div aria-hidden="true" className={styles.faqFond} style={H.FAQ_VOILE} />
        <div style={{ position: "relative" }}>
          {/* AU TÉLÉPHONE, UN SEUL TITRE, « Questions fréquentes (FAQ) »
              (dc.html, `isTitle` sans `kick`) : le sur-titre et le titre de
              bureau restent dans le DOM, repliés (`doublonMobile`). */}
          <div className={styles.doublonMobile} style={H.SURTITRE}>
            {H.COPIE.faqSurtitre}
          </div>
          <h2 data-faq-titre="" style={{ ...H.TITRE_SECTION, margin: "0 0 24px", color: "#fff" }}>
            <span className={styles.doublonMobile}>{H.COPIE.faqTitre}</span>
            <span data-mobile-seulement="">{H.COPIE.faqTitreMobile}</span>
          </h2>
          {/* Au téléphone, toutes les questions repliées, comme la maquette
              mobile v2 : `FermeAuTelephone` EST la liste, même style. */}
          <FermeAuTelephone style={H.FAQ_LISTE} faqListe>
            {questions.map((q, i) => (
              <details
                key={q.question}
                name="faq-ressource"
                /* LA PREMIÈRE QUESTION EST OUVERTE, et c'est la capture qui le
                   dit : ses 35 pages portent `open` sur le premier `<details>`
                   et sur lui seul. La page servie n'en ouvrait aucune, et sa
                   section « Vos questions, nos réponses » rendait de 9 à 22 %
                   de moins que la capture (693 px contre 841 sur
                   /ressources/fiches-pratiques/5s/, mesuré le 12/10). Le
                   groupe `name` garde l'exclusivité : ouvrir une autre
                   question referme celle-ci. */
                open={i === 0}
                className={styles.question}
                style={{ borderTop: i === 0 ? "none" : H.FAQ_FILET }}
              >
                <summary style={H.FAQ_QUESTION}>
                  {/* LA QUESTION EST ENVELOPPÉE, et ce n'est pas cosmétique.
                      Nue, elle forme un élément flex anonyme qui ne descend
                      jamais sous la largeur de son plus long mot : le « + »,
                      en `flex: none`, était donc poussé hors de la bascule, de
                      6 px à 768 px sur les fiches pratiques. `minWidth: 0`
                      l'autorise à céder, ce que le réglage par défaut
                      `min-width: auto` d'un élément flex interdit. */}
                  <span style={{ minWidth: 0, flex: "1 1 auto" }}>{q.question}</span>
                  <span aria-hidden="true" className={styles.plus} style={H.FAQ_PLUS}>
                    +
                  </span>
                </summary>
                <p style={H.FAQ_REPONSE}>{q.reponse}</p>
              </details>
            ))}
          </FermeAuTelephone>
        </div>
      </div>
    </section>
  );
}

function Lectures({
  lectures,
  rayon,
}: {
  lectures: LectureRessource[];
  rayon?: ContenuRessource["rayon"];
}) {
  const libelle = (rayon && H.RAYONS[rayon]?.libelle) || "ressources";
  return (
    <section
      data-screen-label="À lire ensuite"
      className={`${styles.sectionSuite} ${styles.lecturesSection}`}
      style={H.SECTION_SUITE}
    >
      {/* G3 : « SUR LE MÊME SUJET », SECTION DE BUREAU, SE REPLIE AU
          TÉLÉPHONE. La maquette mobile v2 n'a pas ces trois grandes cartes
          photo : elle sert le maillage en pastilles (« Dans la même
          rubrique », plus bas). REPLIER, JAMAIS RETIRER : en-tête, lien du
          rayon et cartes restent dans le DOM, sous une étiquette de
          téléphone qui s'efface une fois ouvert ; sur bureau la bascule
          n'existe pas (`.lectures`, module CSS). */}
      <SectionPliableMobile
        numero={false}
        enTete={
          <span data-mobile-seulement="" className={styles.etiquettePli}>
            <span data-carte-surtitre="">{H.COPIE.lecturesSurtitre}</span>
            <span data-carte-titre="">{H.COPIE.lecturesTitre}</span>
          </span>
        }
        resume={resumeDe(lectures.map((lecture) => lecture.titre))}
      >
      <div style={H.LECTURES_TETE}>
        <div>
          <div style={H.SURTITRE}>{H.COPIE.lecturesSurtitre}</div>
          <h2 style={H.TITRE_SECTION}>{H.COPIE.lecturesTitre}</h2>
        </div>
        <Link href={cibleDuLien(rayon ? `/ressources/${rayon}/` : "/ressources/")} style={H.LECTURES_LIEN}>
          {`Tous les ${libelle.toLowerCase()} →`}
        </Link>
      </div>
      <div style={H.LECTURES_GRILLE}>
        {lectures.map((lecture) => {
          const format = H.RAYONS[lecture.href.split("/")[2] as keyof typeof H.RAYONS]?.format;
          return (
            /* `lecture` ne porte AUCUN dessin : il sert d'ancre à la règle
               qui, sous 880 px, empêche le plancher de 270 px de la grille de
               sortir d'un écran de 320 px (voir `Ressource.module.css`). */
            <Link key={lecture.href} href={lecture.href} className={styles.lecture} style={H.LECTURE}>
              <div style={H.LECTURE_PHOTO}>
                <Image
                  src={lecture.image}
                  alt={altPhoto(lecture.image)}
                  fill
                  sizes="(max-width: 900px) 100vw, 380px"
                  style={{
                    objectFit: "cover",
                    /* Cadre 364x150, ratio 2,43, le plus large du site : un
                       portrait y perdait 73 % de sa hauteur. */
                    objectPosition: cadragePhoto(lecture.image, 364 / 150),
                    filter: "saturate(var(--sat,.55))",
                  }}
                />
              </div>
              <div style={H.LECTURE_TEXTE}>
                <span style={H.LECTURE_FORMAT}>
                  {`${format ?? "Ressource"} · ${lecture.minutes} min`}
                </span>
                <span style={H.LECTURE_TITRE}>{lecture.titre}</span>
              </div>
            </Link>
          );
        })}
      </div>
      </SectionPliableMobile>
    </section>
  );
}

function Appel() {
  return (
    <section
      id="mr-cta"
      data-screen-label="Ressources · appel"
      className={styles.sectionAppel}
      style={H.SECTION_APPEL}
    >
      <div className={styles.deux} style={H.APPEL}>
        <div aria-hidden="true" style={H.APPEL_LUEUR} />
        <div style={{ position: "relative" }}>
          <div style={H.APPEL_SURTITRE}>{H.COPIE.appelSurtitre}</div>
          <h2 className={styles.appelTitre} style={H.APPEL_TITRE}>
            {H.COPIE.appelTitre}
          </h2>
          <p style={H.APPEL_TEXTE}>{H.COPIE.appelTexte}</p>
        </div>
        <div style={H.APPEL_BOUTONS}>
          <Link href={H.CONTACT} style={H.APPEL_BOUTON}>
            {H.COPIE.decrire}
          </Link>
          <a href={H.TELEPHONE.href} style={H.APPEL_TELEPHONE}>
            {H.TELEPHONE.libelle}
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Article et BreadcrumbList pour les moteurs (CLAUDE.md §6), absents du
 * gabarit jusqu'au 14/10 : il rend le fil visible par `FilArianeVue`, qui
 * n'émet pas de données structurées, et `FilAriane` (qui en émet) n'est pas
 * monté ici. Le fil est celui que la page affiche, précédé de l'accueil.
 * AUCUNE DATE : le relais disque horodate ses pages au 01/01/1970, une date
 * publiée serait fausse (décision 4 du 14/10 pour les billets repris).
 */
function DonneesStructurees({
  titre,
  chemin,
  etapes,
  image,
}: {
  titre: string;
  chemin: string;
  etapes: { titre: string; path: string | null }[];
  image?: string;
}) {
  // Nœud imbriqué : sans son `@context` (JSON.stringify omet `undefined`).
  const editeur = { ...organisation(), "@context": undefined };
  const donnees = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: titre,
      url: urlAbsolue(chemin),
      mainEntityOfPage: urlAbsolue(chemin),
      ...(image ? { image: urlImage(image) } : {}),
      author: editeur,
      publisher: editeur,
    },
    filArianeJsonLd([
      { titre: "Accueil", chemin: "/" },
      // Un niveau sans page (rayon redirigé) n'entre pas dans le fil des moteurs.
      ...etapes
        .filter((e, i) => e.path || i === etapes.length - 1)
        .map((e) => ({ titre: e.path ? e.titre : titre, chemin: e.path ?? chemin })),
    ]),
  ];
  return (
    <>
      {donnees.map((d) => (
        <script key={d["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdTexte(d) }} />
      ))}
    </>
  );
}

export interface ProprietesPageRessource {
  titre: string;
  contenu: ContenuRessource;
  /**
   * Le chemin de la page, avec slash final (« /ressources/articles/gmao/ »),
   * passé par la route. Il porte les apports de la maquette MOBILE v2 :
   * cadence de conversion entre les parties, pastilles « Dans la même
   * rubrique », rappel final. Absent (les contrôles hors base), ces blocs ne
   * se rendent pas ; le reste de la page ne change pas.
   */
  chemin?: string;
  /** Passés par la route, non rendus : voir l'en-tête du fichier. */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

/**
 * LA PHOTO DE TÊTE DU TÉLÉPHONE, règle de la maquette mobile v2 (dc.html
 * `heroImg`) : `ARTIMG[page]` (L234), sinon `FIMG.ressources` (L225). Au
 * téléphone elle remplace la photo de bureau, qui ne change pas au-dessus de
 * 880 px.
 */
const PHOTO_MOBILE_PAR_PAGE: Record<string, string> = {
  "cout-arret-de-production": "x-auto-ligne.jpg",
  "digitalisation-maintenance": "x-logistique-tablette.jpg",
  "gestion-des-dechets": "x-cimenterie.jpg",
  gmao: "x-elec-portrait.jpg",
  "ia-maintenance": "ph-robots-solaire.jpg",
  "maintenance-4-0": "x-robotique.jpg",
  "optimiser-la-maintenance": "team-grind-front.jpg",
  "organiser-service-maintenance": "team-duo.jpg",
  "plan-de-maintenance": "sv-convoyeur.jpg",
  "planification-maintenance": "ph-technicien.jpg",
  "predictive-ou-corrective": "x-elec-cablage.jpg",
  "preventive-ou-corrective": "x-mecanique-portrait.jpg",
  "robot-spot": "x-robotique.jpg",
  "suivi-de-la-maintenance": "x-logistique-convoyeurs.jpg",
  tpm: "team-grind-close.jpg",
};
const PHOTO_MOBILE_RESSOURCES = "x-logistique-tablette.jpg";

function photoMobile(chemin: string | undefined): string | undefined {
  const [, famille, , page] = chemin?.split("/") ?? [];
  if (famille !== "ressources" || !page) return undefined;
  return `/assets/web/${PHOTO_MOBILE_PAR_PAGE[page] ?? PHOTO_MOBILE_RESSOURCES}`;
}

export default function PageRessource({ titre, contenu, chemin }: ProprietesPageRessource) {
  const { rayon, chapo = [], parties = [], questions = [], aLire = [] } = contenu;
  const rayonVu = rayon ? H.RAYONS[rayon] : undefined;
  const livre = rayon === "livres-blancs";
  const mobile = photoMobile(chemin);

  /* Un paragraphe du chapo vidé par le contrat (phrase interdite retirée,
     déclarée dans `retraits`) reste dans la donnée en chaîne vide : c'est la
     sortie de `maquette-ressource.ts`. Dans la maquette il remplissait la
     colonne, plus haute que la photo, et le titre tenait le haut de la rangée.
     Sans lui la colonne devient la plus courte et le centrage de la grille
     ferait descendre le titre (29 px sur indicateurs-maintenance) : elle
     s'ancre alors en haut, la photo reste centrée sur la rangée. */
  const paragraphes = chapo.filter(Boolean);
  const colonneTexte = paragraphes.length < chapo.length ? H.COLONNE_ANCREE : undefined;

  /* Le rayon reste écrit dans le fil, mais sa page de rubrique redirige vers
     `/ressources/` depuis le 14/10 : il s'affiche alors en texte, sans lien
     vers une 301 ni second lien vers le hub (docs/PAGES-MORTES-14-10.md). */
  const cheminRayon = `/ressources/${rayon}/`;
  const etapes = [
    { titre: "Ressources", path: "/ressources/" },
    ...(rayonVu ? [{ titre: rayonVu.libelle, path: cibleDuLien(cheminRayon) === cheminRayon ? cheminRayon : null }] : []),
    { titre: titreCourt(titre), path: null },
  ];

  return (
    <div className="mg-site">
      {chemin ? <DonneesStructurees titre={titre} chemin={chemin} etapes={etapes} image={contenu.image} /> : null}
      {/* `page`, `herosSection`, `herosTexte`, `signature` ne portent RIEN
          au-dessus de 880 px : au téléphone, ils remettent le sommaire à sa
          place de maquette, entre les deux boutons et le chapô (dc.html,
          `hasToc` juste sous le héros). Voir `Ressource.module.css`. */}
      <main className={styles.page} style={{ paddingTop: H.HAUT_DE_PAGE }}>
        <section data-screen-label="Ressources · héros" className={styles.herosSection} style={H.SECTION_HEROS}>
          {/* `ariane` : au téléphone, une seule rangée qui défile, séparée
              par des chevrons (dc.html, `hasCrumbs`). */}
          <div className={styles.ariane} style={{ marginBottom: 26 }}>
            <FilArianeVue etapes={etapes} />
          </div>
          {/* G2, LE HÉROS COMPACT DU TÉLÉPHONE : photo en tête et plus basse,
              titre et chapô à l'échelle de la maquette mobile v2. Tout vit
              dans `Ressource.module.css` sous 880 px : au-dessus, ces classes
              ne portent rien et la capture de bureau ne bouge pas. */}
          <div className={`${styles.deux} ${styles.herosCompact}`} style={H.GRILLE_HEROS}>
            <div className={styles.herosTexte} style={colonneTexte}>
              {rayonVu ? (
                <span className={styles.pastilleHeros} style={H.PASTILLE}>
                  <span className={styles.pointHeros} style={H.POINT} />
                  {rayonVu.format}
                  {/* Le sur-titre de la maquette : « Article · 12 min de
                      lecture » (dc.html, `kick`). Le temps de lecture est
                      celui de la signature, plus bas. */}
                  {contenu.minutes ? (
                    <span data-mobile-seulement="">{` · ${contenu.minutes} min de lecture`}</span>
                  ) : null}
                </span>
              ) : null}
              <h1 className={styles.titreHeros} style={H.TITRE1}>
                {titre}
              </h1>
              {/* Les deux boutons côte à côte du haut de page mobile
                  (dc.html, `hero.showCta`) : l'appel et le téléphone, les
                  libellés de la page. */}
              <div data-mobile-seulement="" className={styles.boutonsHeros}>
                <Link href={H.CONTACT} className={styles.boutonPlein}>
                  {H.COPIE.decrire}
                </Link>
                <a href={H.TELEPHONE.href} className={styles.boutonTel}>
                  {H.TELEPHONE.libelle}
                </a>
              </div>
              {paragraphes.map((paragraphe, i) => (
                <p key={i} className={styles.chapoHeros} style={H.CHAPO}>
                  <EnLigne texte={paragraphe} lien={H.LIEN_PROSE} />
                </p>
              ))}
              <div className={styles.signature} style={H.SIGNATURE}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden="true" style={H.MONOGRAMME}>
                    M
                  </span>
                  {H.COPIE.signature}
                </span>
                {/* `doublonMobile` : au téléphone, le temps de lecture est
                    écrit dans le sur-titre et le nombre de parties dans le
                    sommaire, à la même largeur. */}
                {contenu.minutes ? (
                  <>
                    <span aria-hidden="true" className={styles.doublonMobile}>·</span>
                    <span className={styles.doublonMobile}>{`${contenu.minutes} min de lecture`}</span>
                  </>
                ) : null}
                {parties.length > 0 ? (
                  <>
                    <span aria-hidden="true" className={styles.doublonMobile}>·</span>
                    <span className={styles.doublonMobile}>{`${parties.length} parties`}</span>
                  </>
                ) : null}
              </div>
            </div>
            {livre ? (
              <CarteLivre />
            ) : contenu.image ? (
              <div className={styles.photoHeros} style={H.PHOTO_HEROS}>
                <Image
                  src={contenu.image}
                  alt={contenu.imageAlt ?? altPhoto(contenu.image)}
                  fill
                  preload
                  sizes="(max-width: 980px) 100vw, 520px"
                  className={mobile ? styles.photoBureau : undefined}
                  style={{ objectFit: "cover", filter: H.FILTRE_PHOTO }}
                />
                {mobile ? (
                  <Image
                    data-mobile-seulement=""
                    src={mobile}
                    alt=""
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover", objectPosition: cadragePhoto(mobile, 16 / 10), filter: H.FILTRE_PHOTO }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <CorpsRessource
          avant={contenu.avant}
          parties={parties}
          chemin={chemin}
          photoHeros={contenu.image}
          faq={questions.length > 0 ? H.COPIE.faqTitreMobile : undefined}
        />

        {/* « NOS RÉALISATIONS », le carrousel que la maquette mobile v2 pose
            juste avant la FAQ (dc.html, `refsSec` sur `x.k === "faq"`, repli
            sur les six premières études de l'index). Le composant est
            mobile-seulement : rien ne change sur bureau. */}
        {chemin ? (
          <div className={styles.realisations}>
            <CarrouselRealisations cartes={realisationsLiees(chemin)} titre="Nos réalisations" />
          </div>
        ) : null}

        {questions.length > 0 ? <Questions questions={questions} /> : null}

        {aLire.length > 0 ? <Lectures lectures={aLire} rayon={rayon} /> : null}

        {/* LES PASTILLES DU MAILLAGE MOBILE, boîte basse « Dans la même
            rubrique » de la maquette v2 (le gabarit 01 n'a pas d'enfants, la
            cascade du composant tombe sur les sœurs, comme `kidsBottom` du
            dc.html). Le composant est déjà mobile-seulement et rend null
            sans donnée : rien ne change sur bureau.
            PUIS LE RAPPEL FINAL `#etre-rappele`, juste sous elle, à la place
            où la maquette le pose (dc.html L576, avant le pied). Il est posé
            ICI et non par `AvecConversionMobile` (`rappelFinal={false}` dans
            `CorpsRessource`) : la cadence enveloppe les parties, et son
            rappel serait tombé entre la dernière partie et la FAQ. L'appel de
            bureau `#mr-cta` reste en dessous, tel quel. */}
        {chemin ? (
          <>
            {/* `.pastilles` rend au titre de la boîte ses 11 px : voir
                `Ressource.module.css`. */}
            <div className={styles.pastilles}>
              <PastillesCocon chemin={chemin} />
            </div>
            <div className={styles.rappel}>
              <RappelFinalMobile variante={varianteDe(chemin, "01")} />
            </div>
          </>
        ) : null}

        <Appel />
      </main>
    </div>
  );
}
