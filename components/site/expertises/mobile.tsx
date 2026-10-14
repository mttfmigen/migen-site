import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import { LARGEUR } from "@/components/site/blocs/habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  courtLibelle,
  entreeDe,
  parentDe,
  REMAP,
} from "@/components/site/cocon/maillage-mobile";
import MarquesOffre, {
  type ProprietesMarquesOffre,
} from "@/components/site/offre/MarquesOffre";
import type { Paragraphe } from "@/types/contenu";

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
  /** Le style du conteneur, en général `LARGEUR`, inchangé sur bureau. */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * UN BLOC QUI SE REPLIE AU TÉLÉPHONE, motif « Blocs communs (pliables) » de
 * `offre/PointsOffre.tsx`. LA BASCULE PORTE UNE ÉTIQUETTE, PAS LE TITRE : le
 * surtitre et le `<h2>` de la capture restent à leur place dans le corps,
 * l'étiquette (mêmes mots, `<span>`) n'existe que sous 880 px et s'efface une
 * fois le bloc ouvert. Au-dessus de 880 px, la bascule entière est retirée
 * (`.pli`) : aucun arrêt de tabulation muet, aucun pixel déplacé.
 */
export function PliMobile({
  surtitre,
  titre,
  resume,
  actif = true,
  pleinePage = false,
  style,
  children,
}: PliMobileProps) {
  if (!actif) return <div style={style}>{children}</div>;
  return (
    <div className={pleinePage ? `${s.pli} ${s.pleinePage}` : s.pli} style={style}>
      <SectionPliableMobile
        enTete={
          <span
            data-mobile-seulement=""
            className={s.etiquette}
            style={ETIQUETTE}
          >
            {surtitre ? <span style={ETIQUETTE_SURTITRE}>{surtitre}</span> : null}
            <span style={ETIQUETTE_TITRE}>{titre}</span>
          </span>
        }
        resume={resume}
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
      surtitre="Marques et constructeurs"
      titre="Les équipements que nous maintenons déjà"
    >
      <MarquesOffre {...props} />
    </PliMobile>
  );
}

/* -------------------------------------------- la prose de « L'offre » */

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
