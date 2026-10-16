import Image from "next/image";

import { VERRE } from "@/components/site/blocs/habillage";
import { RACINE_CARRIERE } from "@/components/site/metier/PageFicheMetier";
import PostulerMetier from "@/components/site/metier/PostulerMetier";
import SectionFicheMetier from "@/components/site/metier/SectionsFicheMetier";

import type { ContenuHubCarriere, SectionHub } from "./donnees-hub";
import styles from "./HubCarriere.module.css";
import MetiersRecrutes from "./MetiersRecrutes";
import QuestionsHub from "./QuestionsHub";
import {
  Avis,
  BoutonPostuler,
  EtapesHub,
  Hubs,
  LiensPhoto,
  Paragraphe,
  Refus,
} from "./SectionsHub";
import { altPhoto } from "@/lib/descriptions-photos";
import mv from "@/components/site/metier/MobileV2.module.css";
import { EncartAppel, regroupe, rendAvecSuite } from "@/components/site/metier/pli-mobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import FilArianeMobile from "@/components/site/preuve/FilArianeMobile";

/** Le chemin de cette route statique, pour la couche mobile de la maquette v2. */
const CHEMIN = "/carriere/";

/**
 * Le hub `/carriere/`, gabarit 10 « Hub de rubrique » servi par
 * `MigenCarriere.dc.html`, LE MÊME fichier de maquette que les 13 fiches
 * métier du gabarit 07.
 *
 * D'où la réutilisation : les écrans communs (chiffres, bento, encart, duo,
 * liste) sont rendus par `SectionFicheMetier`, et le formulaire par
 * `PostulerMetier`, tous deux du dossier `metier/`, importés tels quels.
 * Ne sont écrits ici que les écrans propres au hub ou que le gabarit 07 ne
 * sait pas dessiner : le héros AVEC sa photo, les étapes à cinq et le bandeau
 * « 10 % », le rail des métiers, les refus, les hubs, les avis, les questions
 * en panneau-photo (`.mg-faqph`, appliqué par l'application à cette FAQ) et
 * la carte « Pour aller plus loin » avec sa photo.
 *
 * L'ordre des sections EST celui de la capture `maquette/rendu/carriere.html`.
 */

/**
 * LA BASCULE PORTE UNE ÉTIQUETTE, PAS LE TITRE DE LA SECTION (12/10) : le
 * `<h2>` de la section reste à sa place et à la taille de sa capture, et la
 * bascule porte une étiquette qui n'existe QUE sous 880 px. Même motif, même
 * composant que les fiches métier : `EtiquettePli` et `amorceDe`
 * (`metier/pli-mobile.tsx`), carte numérotée de la maquette mobile v2.
 */
function Section({ section }: { section: SectionHub }) {
  switch (section.type) {
    case "etapes":
      return <EtapesHub section={section} />;
    case "metiers":
      return <MetiersRecrutes {...section} />;
    case "refus":
      return <Refus {...section} />;
    case "hubs":
      return <Hubs {...section} />;
    case "avis":
      return <Avis {...section} />;
    case "faq":
      // `.mg-faqph` : le panneau-photo sombre de l'application, que la FAQ
      // plate du gabarit 07 ne dessine pas.
      return <QuestionsHub {...section} />;
    case "liens":
      return <LiensPhoto items={section.items} />;
    case "postuler":
      return <PostulerMetier />;
    default:
      /* AUCUN DRAPEAU NE PASSE PLUS NULLE PART. `SectionFicheMetier` n'accepte
         plus `sansEnTete` depuis le 12/10, et aucun rendu de ce dossier ne
         l'accepte non plus : chaque section garde son surtitre et son `<h2>`
         entiers, et la bascule porte son etiquette propre. */
      return <SectionFicheMetier section={section} />;
  }
}

/**
 * LES SECTIONS DE CONTENU, celles que la maquette mobile numérote et compte
 * (`nD`, dc.html L452 à L480) : ni les chiffres, ni la FAQ, ni le formulaire,
 * ni les cartes de fin. C'est autour d'elles seules que la cadence se pose.
 */
const HORS_CONTENU: ReadonlySet<SectionHub["type"]> = new Set([
  "chiffres",
  "faq",
  "postuler",
  "liens",
]);

/**
 * LES TYPES QUI SE REPLIENT AU TÉLÉPHONE : toutes les sections numérotées,
 * comme la maquette mobile v2 (dc.html L475, chaque section du corpus est un
 * `<details>`). Les cartes de fin « Pour aller plus loin » restent dépliées,
 * en ligne au téléphone : voir `etiquetteDe` de `metier/PageFicheMetier.tsx`.
 *
 * Jusqu'au 14/10, seuls `etapes`, `refus`, `hubs` et `avis` se repliaient, et
 * ce hub restait la page la plus haute du site : 15 329 px à 390 px, 18,2
 * écrans, sept sections ouvertes dont « Nos informations pratiques » à 1 894
 * px. La FAQ reste dehors : la maquette la montre dépliée, ses questions sont
 * déjà des `<details>` (une ouverte à la fois).
 */
const REPLIABLES: ReadonlySet<SectionHub["type"]> = new Set([
  "bento",
  "etapes",
  "metiers",
  "encart",
  "duo",
  "liste",
  "refus",
  "hubs",
  "avis",
]);

/** Le titre de bascule d'une section, ou rien si elle ne sait pas se nommer. */
function etiquetteDe(section: SectionHub): { surtitre: string; titre: string } | null {
  if (!REPLIABLES.has(section.type)) return null;
  const titrable =
    "titre" in section &&
    "surtitre" in section &&
    typeof section.titre === "string" &&
    section.titre.trim() !== "" &&
    typeof section.surtitre === "string" &&
    section.surtitre.trim() !== "";
  return titrable ? { surtitre: section.surtitre, titre: section.titre } : null;
}

/**
 * Une section, repliée au téléphone quand elle sait se nommer. `ouverte` : la
 * seule section que la maquette mobile laisse ouverte, la première numérotée
 * (dc.html L451, `nOpen = 1` sur le gabarit 10).
 */
function rendSection(section: SectionHub, i: number, ouverte = false, sousParties: SectionHub[] = []) {
  const etiquette = i === 0 ? null : etiquetteDe(section);
  // L'index suffit comme clé : l'ordre du tableau EST celui de la capture.
  return rendAvecSuite(
    `${section.type}-${i}`,
    section,
    sousParties,
    (s) => <Section section={s} />,
    etiquette && { etiquette, ouverte },
  );
}

export default function PageHubCarriere({ contenu }: { contenu: ContenuHubCarriere }) {
  const { heros, sections } = contenu;

  /* LES TROIS TRANCHES, sans rien réordonner : les chiffres, la suite des
     sections de contenu, puis FAQ, formulaire et cartes de fin. */
  const premier = sections.findIndex((s) => !HORS_CONTENU.has(s.type));
  const dernier =
    sections.length - 1 - [...sections].reverse().findIndex((s) => !HORS_CONTENU.has(s.type));
  const avecContenu = premier >= 0;
  const avant = avecContenu ? sections.slice(0, premier) : sections;
  const contenus = avecContenu ? sections.slice(premier, dernier + 1) : [];
  const apres = avecContenu ? sections.slice(dernier + 1) : [];
  const rangOuvert = contenus.findIndex((s, j) => etiquetteDe(s) && premier + j > 0);

  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main className={`${styles.corpsHub} ${mv.mobileV2}`} style={{ paddingTop: 62 }}>
        {/* LE HÉROS COMPACT DU TÉLÉPHONE (G2), maquette mobile v2 dc.html
            L104 à L110 : voir les classes `heros*` de `HubCarriere.module.css`.
            L'ordre du DOM ne bouge pas, rien n'est retiré, et au-dessus de
            880 px aucune règle ne s'applique. */}
        <section
          className={styles.heros}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 0" }}
        >
          {/* Le fil d'Ariane de la maquette mobile (dc.html L104), « Accueil /
              Carrière », sous 881 px seulement. Composant du lot 02. */}
          <FilArianeMobile chemin={CHEMIN} />
          <div
            className={`${styles.deuxColonnes} ${styles.herosGrille}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1.08fr .92fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div className={styles.herosTexte}>
              <span
                className={styles.herosPastille}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,var(--gl-a))",
                  border: "1px solid var(--gbd)",
                  font: "600 12px var(--fb)",
                  color: "var(--ink1)",
                  marginBottom: 22,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: 999, background: "var(--acc)" }}
                />
                {/* « Rubrique » au téléphone, le sur-titre du gabarit 10 de la
                    maquette mobile v2 (dc.html L490) ; « Carrière » sur bureau,
                    masqué sous 881 px par `.herosPastille > span`. */}
                <span>{heros.pastille}</span>
                <span data-mobile-seulement="">Rubrique</span>
              </span>
              <h1
                className={styles.herosTitre}
                style={{
                  font: "600 calc(clamp(38px,4.6vw,64px) * var(--ts))/1.03 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: "0 0 22px",
                  maxWidth: "16ch",
                  textWrap: "balance",
                }}
              >
                {contenu.titre}
              </h1>
              <Paragraphe
                texte={heros.chapeau}
                className={styles.herosChapo}
                style={{
                  font: "400 19px/1.6 var(--fb)",
                  color: "var(--ink)",
                  margin: "0 0 16px",
                  maxWidth: "50ch",
                }}
              />
              {heros.paragraphes?.map((texte) => (
                <Paragraphe
                  key={texte}
                  texte={texte}
                  className={styles.herosPara}
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 12px",
                    maxWidth: "54ch",
                  }}
                />
              ))}
              <EncartAppel chemin={CHEMIN} ordre={5} />
              <div
                className={styles.herosBoutons}
                style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}
              >
                <BoutonPostuler suiteMobile=" chez Migen" />
                <a
                  href="tel:+33478337205"
                  className={styles.boutonTelephone}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "15px 26px",
                    borderRadius: 999,
                    background: "var(--gsol)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    font: "600 15px var(--fb)",
                    whiteSpace: "nowrap",
                  }}
                >
                  04 78 33 72 05
                </a>
              </div>
              {/* « Toutes les pages de la rubrique », les huit fiches métier
                  filles : la boîte haute de la maquette mobile v2 pour le
                  gabarit 10 (dc.html L125 et L501), ENTRE les boutons du héros
                  et le chapô, à sa place dans la maquette (le héros s'arrête
                  aux boutons, L111 ; le chapô ouvre la première section,
                  L459). Mobile seulement (`data-mobile-seulement`, portée par
                  `PastillesCocon`) : sur bureau, rien n'est rendu ici. */}
              <PastillesCocon chemin={CHEMIN} />
            </div>
            <div className={styles.herosVisuel} style={{ position: "relative" }}>
              <div
                className={styles.herosCadre}
                style={{
                  position: "relative",
                  borderRadius: 32,
                  overflow: "hidden",
                  height: 470,
                  background: "var(--ph)",
                  boxShadow: "0 40px 90px -50px rgba(28,27,25,.55)",
                }}
              >
                <Image
                  src={heros.photo.src}
                  alt={altPhoto(heros.photo.src) || heros.photo.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
                />
              </div>
              {heros.chiffre ? (
                <div
                  className={styles.flottante}
                  style={{
                    ...VERRE,
                    borderRadius: 24,
                    position: "absolute",
                    left: -28,
                    bottom: -30,
                    maxWidth: 290,
                    padding: "22px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      font: "600 40px/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: "var(--acc)",
                      flex: "0 0 auto",
                    }}
                  >
                    {heros.chiffre.valeur}
                  </span>
                  <span style={{ font: "500 14px/1.45 var(--fb)", color: "var(--ink1)" }}>
                    {heros.chiffre.texte}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* CHAQUE SECTION NUMÉROTÉE SE REPLIE AU TÉLÉPHONE, SAUF LA PREMIÈRE,
            qui reste ouverte : règle de la maquette mobile v2. Les chiffres,
            sans titre, ne se replient pas. Voir `REPLIABLES`.

            LA CADENCE DE CONVERSION, variante carrière, enveloppe les seules
            sections de contenu : photo et « Postuler chez Migen » après la 2e,
            bandeau « Ce métier vous ressemble ? » après la 5e, la 8e, la 11e.
            PAS DE RAPPEL FINAL : en carrière, la maquette ne pose en bas qu'un
            bouton vers le formulaire de candidature (dc.html L576), et cette
            page porte CE formulaire (#postuler) juste après la FAQ. */}
        {avant.map((s, i) => rendSection(s, i))}
        <AvecConversionMobile
          chemin={CHEMIN}
          gabarit="10"
          photoHeros={heros.photo.src}
          rappelFinal={false}
        >
          {regroupe(contenus, premier).map((g) =>
            rendSection(g.section, g.rang, g.rang === premier + rangOuvert, g.sous),
          )}
        </AvecConversionMobile>
        {/* « Nos réalisations » entre la dernière carte et la FAQ, comme la
            maquette mobile v2 (dc.html `refsSec`, L427). Mobile seulement. */}
        <div data-mc-realisations="">
          <CarrouselRealisations cartes={realisationsLiees(CHEMIN)} titre="Nos réalisations" />
        </div>
        {apres.map((s, j) => rendSection(s, dernier + 1 + j))}
      </main>
    </div>
  );
}
