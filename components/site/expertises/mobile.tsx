import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import { LARGEUR } from "@/components/site/blocs/habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import TexteRiche, { enTexteNu } from "@/components/site/blocs/TexteRiche";
import {
  courtLibelle,
  entreeDe,
  gabaritDe,
  parentDe,
  REMAP,
} from "@/components/site/cocon/maillage-mobile";
import MarquesOffre, {
  type ProprietesMarquesOffre,
} from "@/components/site/offre/MarquesOffre";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import { CIBLE_CONTACT } from "@/components/site/mobile/conversion-donnees";
import { altPhoto } from "@/lib/descriptions-photos";
import type { Paragraphe, SectionOffre } from "@/types/contenu";
import type { BlocComplement } from "@/types/offre";

import s from "./mobile.module.css";

/**
 * LA COUCHE MOBILE DES GABARITS EXPERTISES (05 Spécialité, 09 Domaine, 10 hub
 * `/expertises/`), portée de la maquette mobile v2
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, notée « dc.html »).
 *
 * Tout ce qui est AJOUTÉ ici porte `data-mobile-seulement` : au-delà de
 * 880 px, `app/globals.css` le masque, et le rendu de bureau ne bouge pas.
 * Ce qui est REPLIÉ garde son texte dans le DOM (`<details>` natif, rendu
 * ouvert, refermé après montage sous 880 px seulement).
 *
 * Reprise du travail interrompu du 14/10 (commit d39f904, fichiers
 * `cocon-mobile.ts` et `conversion-mobile.tsx`), relue pièce par pièce :
 * - le CHEMIN n'est plus retrouvé depuis l'identifiant du formulaire, la
 *   route le passe (`chemin={page.path}`) ;
 * - « Ou appelez le 04 78 33 72 05… » sous l'appel final n'est PAS repris :
 *   la maquette mobile range cette ligne dans « Ce que nous garantissons »,
 *   repliée, pas sous le formulaire ;
 * - les classes du repli sont recopiées dans `mobile.module.css` au lieu
 *   d'être empruntées au module CSS du gabarit 03 ;
 * - le panneau de formulaire du héros ne se replie PAS ici : les pages
 *   prennent `implantation/PanneauHerosRepliable` (un panneau de formulaire
 *   n'a pas de titre de niveau, les portes du repli refusent
 *   `SectionPliableMobile` sans lui) ; le téléphone est `offre/TelephoneHeros`.
 *
 * Module SANS directive : ses composants sont serveur, appelés par des pages
 * serveur (piège payé le 14/10, `bunx tsc` ne voit pas la frontière).
 */

/* ------------------------------------------------------- le fil d'Ariane */

/**
 * `FAM` de dc.html, VERBATIM : le libellé du premier niveau du fil d'Ariane.
 * Seule l'entrée de cette rubrique sert ici, les autres sont gardées pour que
 * la table reste celle de la maquette, comparable ligne à ligne.
 */
const FAM: Readonly<Record<string, string>> = {
  offres: "Offres",
  expertises: "Expertises",
  secteurs: "Secteurs",
  implantations: "Implantations",
  preuves: "Réalisations",
  ressources: "Ressources",
  carriere: "Carrière",
  "travaux-industriels": "Travaux industriels",
  "bureau-etudes": "Bureau d’études",
  guides: "Guides",
  "a-propos": "À propos",
  "entreprise-maintenance-industrielle": "Migen",
};

export interface EtapeFil {
  readonly titre: string;
  readonly path: string | null;
}

/**
 * Les niveaux du fil d'Ariane, calcul de dc.html L495 à L497 :
 * un niveau par préfixe du chemin QUI EXISTE dans l'index, libellé `FAM` au
 * premier niveau et `courtLibelle` ensuite, adresse détournée par `REMAP`,
 * puis la page courante. « Accueil » est posé par `FilArianeVue`. Hors index,
 * rien (dc.html ne calcule rien pour une page qu'il ne connaît pas).
 */
export function etapesFilAriane(chemin: string): EtapeFil[] {
  const entree = entreeDe(chemin);
  if (!entree) return [];
  const segments = chemin.split("/").filter(Boolean);
  const etapes: EtapeFil[] = [];
  for (let k = 1; k < segments.length; k++) {
    const pth = `/${segments.slice(0, k).join("/")}/`;
    const niveau = entreeDe(pth);
    if (!niveau) continue;
    etapes.push({
      titre: k === 1 ? (FAM[segments[0]] ?? courtLibelle(niveau)) : courtLibelle(niveau),
      path: REMAP[pth] ?? pth,
    });
  }
  etapes.push({
    titre:
      segments.length === 1
        ? (FAM[segments[0]] ?? courtLibelle(entree))
        : courtLibelle(entree),
    path: chemin,
  });
  return etapes;
}

/**
 * La rangée de fil d'Ariane au-dessus du héros (dc.html L103), téléphone
 * seulement. Écart DÉCLARÉ, le même que les autres gabarits : la rangée est
 * `FilArianeVue`, celle que le site dessine déjà (séparateur « / », contrastes
 * tenus par `cocon/verification-fil-ariane.tsx`), plutôt qu'une recopie du
 * dessin de la maquette (« › », défilement horizontal). Au-dessus de 880 px,
 * seul le JSON-LD du fil demeure, décision de bureau du 08/10 inchangée.
 *
 * POSÉE EN TÊTE DU `<main>`, AVANT le JSON-LD, ET CLOSE PAR UN BLANC. Le
 * `textContent` du `<main>` colle deux blocs voisins sans espace : glissée
 * entre le JSON-LD et le héros, la rangée coupait le mot collé « …}]}Expertises »
 * que la porte `scripts/instantane-texte-main.mjs` compte, et il comptait pour
 * perdu. En tête, suivie d'un blanc, elle n'en coupe aucun.
 */
export function FilArianeMobile({ chemin }: { chemin: string }) {
  const etapes = etapesFilAriane(chemin);
  if (etapes.length === 0) return null;
  return (
    <div
      data-mobile-seulement=""
      data-fil-ariane-mobile=""
      style={{ padding: "16px 18px 0" }}
    >
      <FilArianeVue etapes={etapes} />{" "}
    </div>
  );
}

/* --------------------------------------------------------- les classes */

/** La racine des trois gabarits : `--sec` à 120 px, 64 px sous 881 px. */
export const RACINE_MOBILE = s.racine;

/** Le héros compact (G2), posé sur la `<section>` du héros. */
export const HERO_COMPACT = s.heroCompact;

/** Le cadre d'un tableau qui passe en cartes sous 881 px. */
export const TABLEAU_EN_CARTES = s.tableauEnCartes;

/**
 * LE HÉROS DE LA MAQUETTE MOBILE V2 (dc.html L104 à L111), posé sur le
 * balisage de bureau, qui ne bouge pas au-dessus de 880 px. Le dessin vient
 * du SOCLE MOBILE V2 partagé (`app/globals.css`, attributs `data-heros-*`,
 * commun aux gabarits à sections) : colonne flexible, photo en tête, H1 de
 * 27 px, boutons côte à côte, puis chapô et mention. Ce dossier n'y ajoute
 * que ce qui lui est propre :
 * - `RANGEE_PASTILLE_HEROS` : la pastille « Expertises » cède sa place au
 *   surtitre de la maquette (« Expertise métier », « Spécialité »,
 *   « Rubrique », `SurtitreHerosMobile`). Son mot reste à l'écran dans le fil
 *   d'Ariane, juste au-dessus (règle « doublon d'étiquette ») ;
 * - la puce « ↑ parent » reste sous le H1 (`PuceParent`), et la liste des
 *   pages filles, posée dans la colonne, sous les boutons et avant le chapô
 *   (dc.html L501, `kidsTop`) ;
 * - `PANNEAU_HEROS` : le panneau de formulaire du héros n'est plus à l'écran
 *   sous 881 px (la maquette n'en met aucun dans le héros) ; le même
 *   formulaire, mêmes mots, est rendu par « 10 Appel final » en bas de page,
 *   et l'ancre `#besoin` le rend à l'écran (`:has(:target)`).
 */
export const RANGEE_PASTILLE_HEROS = s.rangeePastille;
export const PANNEAU_HEROS = s.panneauHeros;

/** La grille des chiffres, en tuiles 2 x 2 sous 881 px. */
export const TUILES_CHIFFRES = s.tuilesChiffres;


/* --------------------------------------------- le haut de page (mobile) */

/**
 * `KICK` de dc.html (L490), VERBATIM pour les trois gabarits de la rubrique :
 * le surtitre du héros. Le corpus des expertises ne porte aucune ligne
 * « Surtitre », la maquette retombe donc toujours sur cette table.
 */
const SURTITRE_HEROS: Readonly<Record<string, string>> = {
  "05": "Spécialité",
  "09": "Expertise métier",
  "10": "Rubrique",
};

/** Le surtitre orange du héros (dc.html L106), téléphone seulement. */
export function SurtitreHerosMobile({ chemin }: { chemin: string }) {
  const entree = entreeDe(chemin);
  const texte = entree ? SURTITRE_HEROS[gabaritDe(entree)] : undefined;
  if (!texte) return null;
  return (
    <div data-mobile-seulement="" className={s.surtitreHeros}>
      {texte}
    </div>
  );
}

/**
 * `EXPIMG` et `FIMG.expertises` de dc.html, VERBATIM : la photo de tête que
 * la maquette donne à chaque domaine et à ses spécialités (clé vide : le hub
 * et toute page dont le domaine n'a pas d'entrée, dc.html L421).
 */
const PHOTO_MAQUETTE: Readonly<Record<string, string>> = {
  automatisme: "/assets/web/x-elec-cablage.jpg",
  electrique: "/assets/web/x-elec-disjoncteur.jpg",
  electromecanique: "/assets/web/x-elec-portrait.jpg",
  mecanique: "/assets/web/x-mecanique-portrait.jpg",
  hydraulique: "/assets/web/ph-tuyaux.jpg",
  pneumatique: "/assets/web/sv-armoire.jpg",
  robotique: "/assets/web/x-robotique.jpg",
  soudure: "/assets/web/x-soudure.jpg",
  tuyauterie: "/assets/web/ph-tuyaux.jpg",
  "": "/assets/web/x-elec-portrait.jpg",
};

/**
 * LA PHOTO DE TÊTE, CELLE DE LA MAQUETTE MOBILE V2 pour cette adresse
 * (dc.html L421 : `EXPIMG[domaine]`, sinon `FIMG.expertises`). Elle était
 * jusqu'au 15/10 bornée aux photos déjà rendues sur bureau, ce qui donnait
 * la meuleuse du panneau des offres en tête de /expertises/mecanique/ et de
 * /expertises/hydraulique/verin-hydraulique/ quand la maquette y montre un
 * portrait et une raffinerie. La photo n'est pas inventée : c'est celle que
 * la référence choisit, servie depuis `public/assets/web/`. Bureau inchangé
 * (`PhotoTeteMobile` porte `data-mobile-seulement`).
 */
export function photoDeTete(chemin: string): string {
  const domaine = chemin.split("/").filter(Boolean)[1] ?? "";
  return PHOTO_MAQUETTE[domaine] ?? PHOTO_MAQUETTE[""];
}

/** La photo du héros mobile (dc.html L105) : 16/10, rayon 24 (socle). */
export function PhotoTeteMobile({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <div data-mobile-seulement="" data-heros-photo="">
      <Image
        src={src}
        alt={altPhoto(src) || alt}
        fill
        sizes="(max-width: 880px) 100vw, 1px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

/**
 * « Chiffres clés », le titre de la section des chiffres de la maquette
 * (dc.html `isStats`, titre du corpus « ## Chiffres clés »). Une `<div>` et
 * non un `<h2>` : les portes de bureau comparent la suite des `<h2>` à la
 * capture, et ce titre n'existe qu'au téléphone.
 */
export function TitreChiffresMobile({ texte = "Chiffres clés" }: { texte?: string }) {
  return (
    <div data-mobile-seulement="" data-tuiles-titre="">
      {texte}
    </div>
  );
}

/**
 * Hub `/expertises/` : le héros et la carte « 01 La réponse directe » passent
 * AVANT les chiffres au téléphone (`order`, la maquette range « Les chiffres
 * Migen » en fin de cette carte). Sans effet au-dessus de 880 px, où le
 * `<main>` n'est pas une boîte flexible.
 */
export const AVANT_CHIFFRES = s.avantChiffres;

/* ------------------------------------------------- la fin de page (mobile) */

/**
 * « 10 APPEL FINAL » QUITTE L'ÉCRAN AU TÉLÉPHONE, sauf quand il est visé
 * (`#mgx-form`, bouton « Poser ma question » de la FAQ), comme le panneau du
 * héros. La maquette mobile v2 ferme la page sur sa carte « Être rappelé »
 * (`RappelFinalMobile`, même montage que le gabarit 08,
 * `secteur/PageSecteur.tsx`). Il reste dans le HTML servi, et rien ne bouge
 * au-dessus de 880 px.
 */
export const APPEL_FINAL = s.appelFinal;

/**
 * LA QUESTION DE L'APPEL FINAL, 7E CARTE DE LA FAQ AU TÉLÉPHONE (maquette
 * mobile v2 : « Besoin d'un seul interlocuteur… ? » sous les questions). Le
 * H2 de « 10 Appel final » qui la porte sur bureau n'est plus à l'écran sous
 * 881 px (`APPEL_FINAL`). Réponse : le bouton et le téléphone de la page,
 * puis la phrase de rappel du corpus quand il en a une ; même montage que
 * `secteur/MobileSecteur.tsx`. Dessin des cartes de FAQ du socle
 * (`data-faq-liste`, `app/globals.css`).
 */
export function QuestionFinaleMobile({
  cta,
}: {
  cta?: { question: string; bouton: string; rappel?: string; href?: string };
}) {
  if (!cta?.question) return null;
  return (
    <div data-mobile-seulement="" data-faq-liste="" className={s.questionFinale}>
      <details className="cx-faq">
        <summary>
          <span>
            <TexteRiche texte={cta.question} />
          </span>
          <span aria-hidden="true" className="cx-plus">
            +
          </span>
        </summary>
        <div className={s.reponseFinale}>
          <p>
            <a href={cta.href && !cta.href.startsWith("#") ? cta.href : CIBLE_CONTACT}>
              {cta.bouton}
            </a>{" "}
            · <a href={TELEPHONE_SITE.href}>{TELEPHONE_SITE.affichage}</a>
          </p>
          {cta.rappel ? <p>{cta.rappel}</p> : null}
        </div>
      </details>
    </div>
  );
}

/* ------------------------------- la carte « 01 La réponse directe » du hub */

/** Hors de l'écran sous 881 px : un dessin de bureau dont une liste mobile
    dit les mêmes mots. Le texte reste dans le DOM, rien ne bouge au-dessus. */
export const CACHE_MOBILE = s.cacheMobile;
/** Le cadre du maillage de bas de page : vide au téléphone, ses 80 px de
    marge basse y faisaient un trou avant le pied de page. */
export const QUEUE_MAILLAGE = s.queueMaillage;
/** L'enveloppe d'un bloc partagé numéroté que la maquette ne dessine pas
    (« Par où continuer ? ») : sans numéro au téléphone, rien sur bureau. */
export const SANS_NUMERO = s.sansNumero;
/** Une liste mobile de la carte 01 (domaines, types, chiffres). */
export const LISTE_MOBILE = s.listeMobile;
/** La phrase qui ouvre une liste de la carte 01 (dc.html `isP`, liens soulignés). */
export const INTRO_MOBILE = s.introMobile;
/** Première lettre en minuscule (« roulements, réducteurs… » de la maquette). */
export const MINUSCULE = s.minuscule;

/**
 * Un nom, lien souligné DANS sa phrase (carte 01 du hub de la maquette mobile
 * v2 : « La maintenance mécanique est le socle… »). Cherché tel quel, casse
 * ignorée ; absent, la phrase reste nue.
 */
export function phraseAvecLien(texte: string, nom: string, href: string): ReactNode {
  const debut = texte.toLowerCase().indexOf(nom.toLowerCase());
  if (debut < 0) return texte;
  const fin = debut + nom.length;
  return (
    <>
      {texte.slice(0, debut)}
      <Link href={href} prefetch={false}>
        {texte.slice(debut, fin)}
      </Link>
      {texte.slice(fin)}
    </>
  );
}

/**
 * « Les chiffres Migen », EN FIN DE CARTE 01 au téléphone (maquette mobile
 * v2) : une sous-carte numérotée par chiffre, la valeur en gras puis son
 * libellé. Mêmes mots que la section des chiffres du bureau, qui, elle, sort
 * de l'écran sous 881 px (`CACHE_MOBILE`).
 */
export function ChiffresCarteMobile({
  chiffres,
}: {
  chiffres: readonly { valeur: string; libelle: string }[];
}) {
  if (chiffres.length === 0) return null;
  return (
    <div data-mobile-seulement="" className={s.listeMobile}>
      <p className={s.titreListe}>Les chiffres Migen</p>
      <div data-mm-kv="" data-mm-compteur="">
        {chiffres.map((chiffre) => (
          <div key={`${chiffre.valeur}-${chiffre.libelle}`}>
            <div data-mm-kv-titre="">{chiffre.valeur}</div>
            <p data-mm-kv-texte="" className={s.minuscule}>
              {chiffre.libelle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- le héros */

/* dc.html L110, la puce du héros : verbatim. */
const PUCE: CSSProperties = {
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

/**
 * La puce « ↑ parent » du héros d'une spécialité (dc.html L488 :
 * `if (g === "05" && parent) chips = [{ l: "↑ " + short(parent), … }]`).
 * Libellé DÉRIVÉ de l'index par `courtLibelle`, jamais rédigé.
 */
export function PuceParent({ chemin }: { chemin: string }) {
  const parent = parentDe(chemin);
  if (!parent) return null;
  return (
    <div
      data-mobile-seulement=""
      className={s.puceParent}
      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}
    >
      <Link href={parent.url} prefetch={false} style={PUCE}>
        ↑ {courtLibelle(parent)}
      </Link>
    </div>
  );
}

/* M4, LE TÉLÉPHONE DU HÉROS : `offre/TelephoneHeros`, le même que le gabarit
   03 (dc.html L111, `TELEPHONE_SITE`), posé par les trois pages dans leur
   rangée d'action. Le corpus l'écrit dans le bloc d'appel de chaque fiche
   (« > [CTA](/contact/) · 04 78 33 72 05 »), le site l'avait effacé. */

/* ------------------------------------------------------------- le repli */

/* L'étiquette prend la largeur de la bascule, le chevron garde sa place à
   droite, sur la même rangée (dc.html L132 : titre, puis chevron rond).
   Base `0%` et non `auto` : en `auto`, un titre plus long que la rangée
   réclame toute la largeur et la bascule, qui passe à la ligne, rejette le
   chevron dessous. Valeur posée ici et non lue dans `ENTETE_DANS_BASCULE` :
   celle-là est exportée d'un module « use client », et un composant serveur
   qui en lit une valeur reçoit une référence client, pas l'objet. */
const ETIQUETTE: CSSProperties = { flex: "1 1 0%", minWidth: 0 };

/* Les deux constantes du motif de référence (`offre/PointsOffre.tsx`). */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

export interface PliMobileProps {
  /** Le surtitre de la section, repris tel quel de son en-tête. */
  surtitre?: string;
  /** Le titre de la section, repris tel quel de son `<h2>`. */
  titre: string;
  /** Les intitulés de ce qui est sous le pli (`blocs/resume-de-section.ts`). */
  resume?: string;
  /**
   * Faux : pas de pli, le conteneur seul. Pour un bloc PARTAGÉ avec un autre
   * gabarit (`OffresDomaine` et `ProblemeDomaine` servent aussi le gabarit 08
   * Secteur) : chaque page décide de son repli, et un gabarit qui pose déjà le
   * sien autour du bloc n'en reçoit pas un second (un pli dans un pli).
   */
  actif?: boolean;
  /** Le pli enveloppe une `<section>` entière, gouttière et écart compris. */
  pleinePage?: boolean;
  /**
   * Faux : la carte ne porte pas de numéro et ne compte pas dans la suite
   * 01, 02… (sections de bureau que la maquette ne dessine pas).
   */
  numero?: boolean;
  /** La carte reste ouverte au téléphone (1re section de la maquette). */
  toujoursOuvert?: boolean;
  /**
   * Le bloc passe après les sections de la maquette au téléphone
   * (`data-mobile-apres-sections`, socle de `app/globals.css`) : pour un pli
   * qui est lui-même l'enfant du `<main>`.
   */
  apresSections?: boolean;
  /** Le style du conteneur, en général `LARGEUR`, inchangé sur bureau. */
  style?: CSSProperties;
  /** Une classe de plus sur le conteneur (`AVANT_CHIFFRES`). */
  className?: string;
  children: ReactNode;
}

/**
 * UN BLOC QUI SE REPLIE AU TÉLÉPHONE, motif « Blocs communs (pliables) » de
 * `offre/PointsOffre.tsx`. LA BASCULE PORTE UNE ÉTIQUETTE, PAS LE TITRE : le
 * surtitre et le `<h2>` de la capture restent à leur place dans le corps,
 * l'étiquette (mêmes mots, `<span>`) n'existe que sous 880 px. Au-dessus de
 * 880 px, la bascule entière est retirée (`.pli`) : aucun arrêt de
 * tabulation muet, aucun pixel déplacé.
 *
 * LE TITRE RESTE DANS LA CARTE, OUVERTE COMME FERMÉE (maquette mobile v2,
 * `isDetails` : numéro, titre, chevron, que le bloc soit ouvert ou non).
 * L'étiquette prend la typographie de la carte de la maquette
 * (`data-carte-surtitre`, `data-carte-titre`, `app/globals.css`), et c'est
 * l'en-tête du corps, MÊMES MOTS, qui s'efface sous 881 px : il porte
 * `data-titre-double` chez l'appelant. Pour l'arbre d'accessibilité,
 * l'étiquette est alors le titre de niveau 2 (`role="heading"`) ; au-dessus
 * de 880 px elle n'est pas rendue, et le `<h2>` du corps reste le seul.
 */
export function PliMobile({
  surtitre,
  titre,
  resume,
  actif = true,
  pleinePage = false,
  numero = true,
  toujoursOuvert = false,
  apresSections = false,
  style,
  className,
  children,
}: PliMobileProps) {
  if (!actif) return <div style={style}>{children}</div>;
  return (
    <div
      className={[s.pli, pleinePage ? s.pleinePage : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...(apresSections ? { "data-mobile-apres-sections": "" } : {})}
      style={style}
    >
      <SectionPliableMobile
        enTete={
          <span
            data-mobile-seulement=""
            className={s.etiquette}
            style={ETIQUETTE}
          >
            {surtitre ? (
              <span data-carte-surtitre="" style={ETIQUETTE_SURTITRE}>
                {surtitre}
              </span>
            ) : null}
            <span
              data-carte-titre=""
              role="heading"
              aria-level={2}
              style={ETIQUETTE_TITRE}
            >
              {titre}
            </span>
          </span>
        }
        resume={resume}
        numero={numero}
        toujoursOuvert={toujoursOuvert}
      >
        {children}
      </SectionPliableMobile>
    </div>
  );
}

/**
 * G3, « MARQUES ET CONSTRUCTEURS » REPLIÉ AU TÉLÉPHONE. Section de bureau du
 * gabarit 03 (`offre/MarquesOffre`), absente de la maquette mobile : 1 150 px
 * de cartes de logos à 390 px. Le bloc partagé n'a pas de repli sur demande ;
 * il est donc enveloppé ICI, pour nos trois gabarits seulement. L'étiquette
 * reprend son surtitre et son H2 mot pour mot : c'est un doublon du titre de
 * la section, et la bascule est retirée du bureau.
 */
export function MarquesRepliees(props: ProprietesMarquesOffre) {
  return (
    <PliMobile
      pleinePage
      numero={false}
      apresSections
      surtitre="Marques et constructeurs"
      titre="Les équipements que nous maintenons déjà"
    >
      <MarquesOffre {...props} />
    </PliMobile>
  );
}

/* -------------------------------------------- la prose de « L'offre » */

/**
 * LE RÉSUMÉ DE LA CARTE « L'offre » REPLIÉE, quand la section ne porte ni
 * introduction ni prose : le paragraphe que le corpus écrit après le tableau,
 * rangé dans `complementOffre` (« Le vérin n'est souvent que le symptôme… »).
 * C'est le premier `p` de la section, celui que dc.html `teaseOf` affiche.
 * Sinon `undefined`, et `PointsOffre` garde sa règle (intro, prose, puis les
 * intitulés joints par « · »).
 */
export function resumeOffre(
  offre: SectionOffre,
  complements: readonly BlocComplement[] | undefined,
): string | undefined {
  if (offre.intro?.trim() || offre.prose?.length) return undefined;
  return enTexteNu(complements?.[0]?.texte) || undefined;
}

/* dc.html L130, paragraphe de section (`isP`) : 400 15px/1.6, encre seconde. */
const PARAGRAPHE: CSSProperties = {
  margin: "14px 0 0",
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
  maxWidth: "66ch",
  textWrap: "pretty",
};

/**
 * LA PROSE DE « L'offre » D'UNE SPÉCIALITÉ, AU TÉLÉPHONE SEULEMENT (M2).
 *
 * Chaque fiche du gabarit 05 écrit sous le tableau de l'offre un paragraphe de
 * maillage, trois à cinq liens internes. Le relais l'avait perdu ; il est
 * remis verbatim par `scripts/restaure-corpus-expertises.mjs`.
 *
 * Les deux références ne disent pas la même chose, et `data-mobile-seulement`
 * les sert toutes les deux : la capture de BUREAU ne rend pas ce paragraphe
 * (`offre/PointsOffre.tsx` le déclare), la maquette MOBILE le rend, liens
 * compris. Le texte est donc dans le DOM à toutes les largeurs, visible sous
 * 881 px seulement, et le bureau ne bouge pas d'un pixel.
 */
export function ProseOffreMobile({ prose }: { prose: readonly Paragraphe[] }) {
  const pleins = prose.filter((p) => p.texte.trim() !== "");
  if (pleins.length === 0) return null;
  return (
    <section data-mobile-seulement="" data-prose-offre-mobile="">
      <div className={s.prose} style={LARGEUR}>
        {pleins.map((paragraphe) => (
          <p key={paragraphe.texte} style={PARAGRAPHE}>
            <TexteRiche texte={paragraphe.texte} />
          </p>
        ))}
      </div>
    </section>
  );
}
