import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { VERRE } from "@/components/site/blocs/habillage";
import type { ContenuFicheMetier, SectionFiche } from "@/types/metier";

import styles from "./FicheMetier.module.css";
import PostulerMetier from "./PostulerMetier";
import SectionFicheMetier, { BoutonPostuler } from "./SectionsFicheMetier";
import { altPhoto } from "@/lib/descriptions-photos";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import mv from "./MobileV2.module.css";
import { EncartAppel, EtiquettePli, OrdreMobile, amorceDe } from "./pli-mobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import { courtLibelle, enfantsDe } from "@/components/site/cocon/maillage-mobile";
import FilArianeMobile from "@/components/site/preuve/FilArianeMobile";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsCarriere } from "./realisations-carriere";

/**
 * Gabarit 07 « Métier et carrière », 13 pages `/carriere/<metier>/`.
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * page par page dans `maquette/rendu/carriere--*.html` (CLAUDE.md §16). Le
 * composant précédent de ce dossier (`PageMetier.tsx`) avait été porté contre
 * l'export de démonstration « Migen - Site final.dc.html », qui n'est le
 * gabarit d'aucune page : il ne sert plus que le gabarit DOMAINE, la route
 * tranche sur `estMetier` avant lui.
 *
 * Composant SERVEUR. Aucun état : les survols vivent dans le module CSS, les
 * révélations au défilement en `data-reveal`, animées par `Moteurs.tsx` déjà
 * monté dans la mise en page racine.
 *
 * LES PHOTOS : la capture les sert en `blob:`. Relues le 08/10 dans la
 * maquette vivante (octets lus par XHR, sha256 contre `public/assets/web`),
 * chacune est un fichier du dépôt, nommé dans la donnée (`heros.photo`,
 * `liens[].photo`). Sans photo dans la donnée, le cadre `var(--ph)` reste.
 *
 * PAS DE RANGÉE DE FIL D'ARIANE : `FilAriane` ne rend plus que son JSON-LD
 * (aucune des 248 captures n'en dessine), et la section de 24 px qui
 * l'enveloppait, avec le `paddingTop: 96` d'avant, posait le H1 58 px plus bas
 * que la maquette (`padding-top: 62px`, mesuré par verifie-position-titre).
 */

/**
 * Les jetons de `.mgk-root`, la racine de `MigenCarriere.dc.html` : ils sont
 * ceux de `:root` à une exception près, `--sec: 120px` À TOUTES LES LARGEURS.
 * La règle `.mg-site { --sec: 64px }` sous 760 px (globals.css) ne descend donc
 * pas jusqu'aux pages carrière de la maquette : mesuré à 390 px, 120 px dans
 * la maquette, 64 sur le site, soit 56 px d'écart en tête de chaque section.
 * Partagé avec le hub `/carriere/`, servi par le même fichier.
 *
 * SOUS 760 PX, LA RÉFÉRENCE EST DEVENUE LA MAQUETTE MOBILE V2 (14/10) : elle
 * n'a plus ce rythme de 120 px, ses blocs se suivent à 12 à 22 px. Le module
 * CSS rend donc au `<main>` de la famille le `--sec: 64px` du reste du site à
 * cette largeur (`.corpsMetier`, `.corpsHub`) ; au-dessus, rien ne change.
 */
export const RACINE_CARRIERE = { "--sec": "120px" } as CSSProperties;

export interface ProprietesPageFicheMetier {
  titre: string;
  contenu: ContenuFicheMetier;
  /** Fil d'Ariane, fourni par la page : composant serveur qui lit la base. */
  filAriane?: ReactNode;
  /**
   * Le chemin de la page (`pages.path`, slash final), pour la couche MOBILE de
   * la maquette v2 : cadence de conversion, puces du héros vers les pages
   * filles, pastilles « Dans la même rubrique ». OPTIONNEL : sans lui, rien de
   * mobile ne s'ajoute et le rendu reste celui d'avant, ce qui garde
   * `verification-metier.tsx` et ses captures inchangés.
   */
  chemin?: string;
}

/**
 * LES PUCES DU HÉROS de la maquette mobile v2, dc.html L110 et L487 : le
 * gabarit 07 pose ses pages FILLES en pastilles sous le titre
 * (`chips = kidsOf(u)`), et c'est pour cela que `PastillesCocon` ne lui rend
 * jamais de boîte d'enfants (sa cascade L505 l'exclut). Libellés et cibles
 * dérivés de l'index (`enfantsDe`, `courtLibelle`), rien n'est rédigé. Dessin
 * verbatim de L110. Mobile seulement : la capture de bureau n'en porte pas.
 * Repris du travail interrompu (d39f904), relu le 14/10.
 */
const PUCES_HERO_RANGEE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 14,
};
const PUCE_HERO: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 36,
  padding: "0 13px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.1)",
  font: "500 13px var(--fb)",
  color: "#1c1b19",
};

function PucesHeroMetier({ chemin }: { chemin: string }) {
  const enfants = enfantsDe(chemin);
  if (enfants.length === 0) return null;
  return (
    <div
      data-mobile-seulement=""
      data-puces-metier=""
      className={styles.herosPuces}
      style={PUCES_HERO_RANGEE}
    >
      {enfants.map((enfant) => (
        <a key={enfant.url} href={enfant.url} style={PUCE_HERO}>
          {courtLibelle(enfant)}
        </a>
      ))}
    </div>
  );
}

/**
 * LES SECTIONS DE CONTENU, celles que la maquette mobile numérote et compte
 * (`nD`, dc.html L452 à L480) : ni les chiffres (`stats`, non comptés), ni la
 * FAQ, ni le formulaire, ni les cartes de fin. C'est autour d'elles seules que
 * la cadence de conversion se pose.
 */
const HORS_CONTENU: ReadonlySet<SectionFiche["type"]> = new Set([
  "chiffres",
  "faq",
  "postuler",
  "liens",
]);

/** Le titre de bascule d'une section, ou rien si elle ne sait pas se nommer. */
function etiquetteDe(section: SectionFiche): { surtitre: string; titre: string } | null {
  /* « Pour aller plus loin » NE SE REPLIE PAS : son seul titre est un
     surtitre en `<div>` (celui de la capture), et `verifie-blocs-pliables.mjs`
     refuse un bloc replié sans titre de niveau (16 refus mesurés le 14/10).
     En faire un `<h3>` casserait `verifie-titres-metier.mjs`, qui tient la
     structure des titres contre la capture. Ses cartes passent donc en ligne au
     téléphone (`HubCarriere.module.css`, `liens*`) au lieu d'être repliées. */
  /* UN TITRE NON VIDE, et pas seulement la présence de la clé.
     Première version : `"titre" in section` suffisait, et des sections
     au titre vide donnaient une bascule muette. La porte des blocs
     repliables l'a refusé, 120 fois, avant déploiement. */
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
 * L'ÉTIQUETTE DE LA BASCULE : un `<span>`, et c'est voulu.
 *
 * Le piège a été payé deux fois le 12/10, dans les deux sens : un `<span>` À
 * LA PLACE du `<h2>` retirait les titres de section de la structure ; un vrai
 * `<h2>` dans la bascule les servait à 30 px sur bureau et vidait la colonne
 * gauche des grilles. Le `<h2>` de la section RESTE donc à sa place et à sa
 * taille, et la bascule porte une étiquette qui n'existe QUE sous 880 px
 * (`EtiquettePli`, `data-mobile-seulement`).
 *
 * MAQUETTE MOBILE V2 (14/10), dc.html L130 : la carte porte son numéro en
 * colonne (le compteur partagé de `app/globals.css`, d'où le « 01 · » retiré
 * du sur-titre), son sur-titre et son titre, et ses deux lignes de résumé
 * quand elle est fermée (`amorceDe`, le `teaseOf` de la maquette). Le titre
 * RESTE dans la carte ouverte : le surtitre et le `<h2>` de la section, qui
 * disent la même chose, s'effacent alors sous 880 px seulement
 * (`MobileV2.module.css`, `data-mc-titre-section`), un doublon d'étiquette et
 * non un retrait : ils restent dans le DOM et sur bureau.
 *
 * LA PREMIÈRE SECTION NUMÉROTÉE EST OUVERTE, comme la maquette (dc.html L451,
 * `nOpen = 1`). L'écart déclaré le 14/10 au matin (tout replier, pour la
 * hauteur) est levé : ses cartes passent au dessin compact de la maquette, et
 * la page n'est plus jugée sur sa hauteur mais sur sa ressemblance.
 *
 * LA FAQ NE SE REPLIE PAS : la maquette la pose dépliée, titre puis liste de
 * questions (dc.html L129 et L472), chacune déjà un `<details>`.
 */
const HORS_PLI: ReadonlySet<SectionFiche["type"]> = new Set(["faq"]);

function rendSection(section: SectionFiche, i: number, ouverte = false): ReactNode {
  if (section.type === "postuler") return <PostulerMetier key={`postuler-${i}`} />;
  // L'index suffit comme clé : l'ordre du tableau EST le gabarit.
  const cle = `${section.type}-${i}`;
  const etiquette = i === 0 || HORS_PLI.has(section.type) ? null : etiquetteDe(section);
  if (!etiquette) return <SectionFicheMetier key={cle} section={section} />;
  return (
    <SectionPliableMobile
      key={cle}
      toujoursOuvert={ouverte}
      resume={amorceDe(section)}
      enTete={<EtiquettePli surtitre={etiquette.surtitre} titre={etiquette.titre} />}
    >
      <OrdreMobile section={section}>
        <SectionFicheMetier section={section} />
      </OrdreMobile>
    </SectionPliableMobile>
  );
}

export default function PageFicheMetier({
  titre,
  contenu,
  filAriane,
  chemin,
}: ProprietesPageFicheMetier) {
  const heros = contenu.heros;
  const sections = contenu.sections;
  /* PAS DE BADGE « N min de lecture » (dc.html L492), écart déclaré : posé
     entre la pastille « Métier » et le titre, il coupe le mot que
     `textContent` colle entre les deux, EN PLUS de la coupure du fil
     d'Ariane, et `instantane-texte-main.mjs` ne sait excuser qu'une coupure
     par mot collé : 13 fiches sur 13 y comptaient un mot perdu (mesuré le
     14/10, aucun mot réellement retiré). */

  /* LES TROIS TRANCHES, sans rien réordonner : ce qui précède la première
     section de contenu (les chiffres), la suite des sections de contenu, et
     ce qui suit la dernière (FAQ, formulaire, cartes de fin). Au-dessus de
     880 px, la page est exactement la suite de sections d'avant : la cadence
     n'ajoute que des blocs `data-mobile-seulement`. */
  const premier = sections.findIndex((s) => !HORS_CONTENU.has(s.type));
  const dernier = sections.length - 1 - [...sections].reverse().findIndex((s) => !HORS_CONTENU.has(s.type));
  const avecContenu = premier >= 0;
  const avant = avecContenu ? sections.slice(0, premier) : sections;
  const contenus = avecContenu ? sections.slice(premier, dernier + 1) : [];
  const apres = avecContenu ? sections.slice(dernier + 1) : [];
  const rangFaq = apres.findIndex((s) => s.type === "faq");

  /* La première section de contenu qui sait se nommer : la seule ouverte. */
  const rangOuvert = contenus.findIndex(
    (s, j) => premier + j > 0 && !HORS_PLI.has(s.type) && etiquetteDe(s) !== null,
  );
  const rendContenus = contenus.map((s, j) => rendSection(s, premier + j, j === rangOuvert));
  const rendApres = apres.map((s, j) => rendSection(s, dernier + 1 + j));

  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main className={`${styles.corpsMetier} ${mv.mobileV2}`} style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ---------------------------------------------------------- héros

            LE HÉROS COMPACT DU TÉLÉPHONE (G2), maquette mobile v2 dc.html
            L104 à L110 : photo en tête au format 16/10, surtitre, titre de
            27 px, puces des pages filles, boutons, puis le chapeau. Tout est
            fait par `FicheMetier.module.css` sous 880 px (classes `heros*`) :
            l'ordre du DOM ne bouge pas, rien n'est retiré, et au-dessus de
            880 px aucune règle ne s'applique. */}
        <section
          className={styles.heros}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 0" }}
        >
          {/* Le fil d'Ariane de la maquette MOBILE (dc.html L104), au-dessus de
              la photo, sous 881 px seulement : les captures de bureau de ce
              gabarit n'en portent pas. Composant du lot 02, tel quel. */}
          {chemin ? <FilArianeMobile chemin={chemin} titre={titre} /> : null}
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
              {heros.pastille ? (
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
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--acc)",
                    }}
                  />
                  {/* « Fiche métier » au téléphone, le sur-titre de la
                      maquette mobile v2 (dc.html L492) ; « Métier » sur bureau. */}
                  {heros.pastille === "Métier" ? <span data-mobile-seulement="">Fiche </span> : null}
                  {heros.pastille}
                </span>
              ) : null}
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
                {titre}
              </h1>
              {heros.chapeau ? (
                <p
                  className={`${styles.texteLie} ${styles.herosChapo}`}
                  style={{
                    font: "400 19px/1.6 var(--fb)",
                    color: "var(--ink)",
                    margin: "0 0 16px",
                    maxWidth: "50ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={heros.chapeau} />
                </p>
              ) : null}
              {heros.paragraphes?.map((texte) => (
                <p
                  key={texte}
                  className={`${styles.texteLie} ${styles.herosPara}`}
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 12px",
                    maxWidth: "54ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={texte} />
                </p>
              ))}
              {chemin ? <EncartAppel chemin={chemin} ordre={4} /> : null}
              {chemin ? <PucesHeroMetier chemin={chemin} /> : null}
              <div
                className={styles.herosBoutons}
                style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}
              >
                {/* « Postuler chez Migen » au téléphone, le libellé du héros de
                    la maquette mobile v2 (dc.html L412) ; « Postuler » sur
                    bureau, celui de la capture. */}
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
                    transition: "background var(--tr),transform var(--tr)",
                  }}
                >
                  04 78 33 72 05
                </a>
              </div>
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
                {heros.photo ? (
                  <Image
                    src={heros.photo.src}
                    alt={altPhoto(heros.photo.src) || (heros.photo.alt ?? "")}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 520px"
                    style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
                  />
                ) : null}
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
                  <span
                    style={{ font: "500 14px/1.45 var(--fb)", color: "var(--ink1)" }}
                  >
                    {heros.chiffre.texte}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---------------------- les sections, dans l'ordre de la capture

            CHAQUE SECTION TITRÉE SE REPLIE AU TÉLÉPHONE, sauf la première
            numérotée, ouverte comme la maquette (voir `rendSection`). Les chiffres,
            sans titre, ne se replient pas : il n'y aurait rien à mettre sur la
            bascule. Les cartes de fin non plus, voir `etiquetteDe`.

            Mesure du 12/10, hauteur réelle après hydratation : les pages
            carrière sont les plus longues du site, de 25 à 34 écrans, et
            aucune ne portait de bloc repliable. Onze des dix-huit pires pages
            du site étaient des pages carrière.

            LA BASCULE NE PORTE QU'UNE ÉTIQUETTE MOBILE, et le rendu de la
            section garde son surtitre et son `<h2>` entiers, à la taille de sa
            capture. Au-dessus de 880 px l'étiquette n'est pas affichée : la
            page est alors, au pixel de dessin près, celle de la capture. Voir
            le bloc qui précède `rendSection` pour les deux fautes que ce
            choix répare.

            LA CADENCE DE CONVERSION (maquette mobile v2, variante carrière)
            enveloppe les seules sections de contenu : photo et « Postuler chez
            Migen » après la 2e, bandeau « Ce métier vous ressemble ? » après
            la 5e, la 8e, la 11e. PAS DE RAPPEL FINAL (`rappelFinal={false}`) :
            en carrière, la maquette ne pose en bas qu'un bouton « Postuler chez
            Migen » qui mène au formulaire de candidature (dc.html L576,
            `endBtnOnly: isCar`), et cette page porte CE formulaire,
            « Rejoindre Migen » (#postuler), juste après la FAQ. Un bouton qui
            renvoie au bloc suivant serait un doublon. */}
        {avant.map((s, i) => rendSection(s, i))}
        {chemin ? (
          <AvecConversionMobile
            chemin={chemin}
            gabarit="07"
            photoHeros={heros.photo?.src}
            rappelFinal={false}
          >
            {rendContenus}
          </AvecConversionMobile>
        ) : (
          rendContenus
        )}
        {/* « Nos réalisations », le carrousel de la maquette mobile v2 entre la
            dernière carte et la FAQ (dc.html `refsSec`) : les cas liés de la
            page dans `cas-lies.json`, repli sur l'index des preuves quand la
            page n'en porte pas (L425-427). Mobile seulement. */}
        {chemin ? (
          <div data-mc-realisations="">
            <CarrouselRealisations cartes={realisationsCarriere(chemin)} titre="Nos réalisations" />
          </div>
        ) : null}
        {rendApres.slice(0, rangFaq + 1)}
        {/* « Dans la même rubrique », les sœurs de la page, après la FAQ et
            avant le bloc de candidature, à la place que lui donne la maquette
            (dc.html L134 puis L138). Le gabarit 07 met ses ENFANTS en puces de
            héros (L506) : la boîte du bas porte donc toujours les sœurs.
            Mobile seulement, porté par `PastillesCocon` lui-même. */}
        {chemin ? <PastillesCocon chemin={chemin} variante="soeurs" /> : null}
        {rendApres.slice(rangFaq + 1)}
      </main>
    </div>
  );
}
