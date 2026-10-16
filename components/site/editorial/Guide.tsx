import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import { varianteDe } from "@/components/site/mobile/conversion-donnees";
import RepliFormulaireMobile from "@/components/site/implantation/RepliFormulaireMobile";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import { AncreRappel } from "@/components/site/offre/CadenceOffre";
import type { VueGuide, BlocGuide } from "@/types/editorial";

import BlocsGuide from "./BlocsGuide";
import FermeAuTelephone from "@/components/site/ressource/FermeAuTelephone";
import styles from "./PageEditoriale.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { accrocheDe, ligneDuCorpus, type BlocAccroche } from "@/components/site/blocs/resume-de-section";
import { CONTACT, COPIE, TELEPHONE } from "@/components/site/ressource/habillage";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * La vue « GUIDE » : le gabarit générique édito de la maquette
 * (`Migen - Site final.dc.html`, `cEdito`), qui sert `/ressources/` et les
 * deux guides de `/guides/`. Références : `maquette/rendu/ressources.html`,
 * `guides--choisir-une-entreprise-de-maintenance.html`,
 * `guides--reussir-un-transfert-industriel.html`.
 *
 * Quatre sections, dans l'ordre de la capture : héros, corps (sommaire
 * collant et sections numérotées), « Pages liées », formulaire `#cx-form`.
 * Les pages liées sont celles de la capture, portées par la donnée : le
 * maillage calculé en base n'y est pas monté (voir `Maillage.tsx`).
 *
 * Composant SERVEUR ; seul le formulaire partagé est client.
 */

const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};
const PASTILLE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "#fff",
  background: "var(--acc)",
  padding: "5px 12px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};
const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
};
const TITRE2: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  textWrap: "balance",
};

/**
 * L'ETIQUETTE DE LA BASCULE DES SECTIONS REPLIABLES, posee le 12/10.
 *
 * CE QU'ELLE REPARE. Le cablage du matin passait l'EN-TETE DE SECTION, son
 * numero et son vrai `<h2>`, dans le `<summary>` de la bascule. La bascule et
 * la section n'ont pourtant pas les memes besoins : la bascule veut une
 * etiquette courte, a l'echelle mobile ; la section veut son `<h2>` a sa place
 * et a la taille de sa capture. Faire porter le `<h2>` par la bascule casse les
 * deux. Mesure du 12/10 en production sur les trois pages du gabarit : les
 * 30 `<summary>` restaient AFFICHES a 1280 px, soit 30 arrets de tabulation,
 * et le `margin-top: 12px` du corps ajoutait 12 px sous chaque titre de
 * section, 32 px servis contre les 20 px de la capture.
 *
 * LES DEUX PIEGES OPPOSES, tous les deux deja payes ailleurs : un `<span>` A LA
 * PLACE du `<h2>` retire le titre de la structure du document ; un `<h2>` DANS
 * la bascule le remet dans la structure mais a la mauvaise taille. La bonne
 * reponse ne choisit pas : le `<h2>` de la section RESTE a sa place, et la
 * bascule porte une etiquette qui n'existe QUE sous 880 px, marquee
 * `data-mobile-seulement` comme le chevron et le resume du meme bloc.
 *
 * Motif repris a l'identique du gabarit metier
 * (`components/site/metier/PageFicheMetier.tsx`), ou il est deja verifie.
 */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libelle de la bascule, a l'echelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

const numero = (i: number) => String(i + 1).padStart(2, "0");
/** Le sommaire coupe les titres longs, règle de la maquette (`cxVals`). */
const court = (t: string) => (t.length > 54 ? `${t.slice(0, 52)}…` : t);

/**
 * LE RESUME D'UNE SECTION REPLIEE, regle `teaseOf` de la maquette mobile v2
 * (dc.html) : le PREMIER bloc qui soit un paragraphe ou une liste a puces ;
 * un paragraphe donne son texte, une liste sa premiere puce. Corrige le 14/10 :
 * la version precedente joignait sous-titres et puces (« Refus de nommer
 * l'intervenant · Aucun compte rendu… ») la ou la maquette ecrit la premiere
 * phrase de la section.
 *
 * Le Markdown est retire : le corpus ecrit « **le preventif** » et
 * « [la GMAO](/x/) », que le resume afficherait tels quels. L'audit du 09/10
 * est clair, aucune page ne doit en montrer.
 */
function texteNu(brut: string): string {
  return brut
    .replace(/\*\*\[([^\]]+)\]\([^)]*\)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function resumeDeLaSection(blocs: BlocGuide[]): string {
  /* V3 (16/10) : les phrases de renvoi sont sautées, et les listes numérotées
     et les tableaux comptent aussi (`blocs/resume-de-section.ts`,
     `accrocheDe`). « Le tableau à emporter en rendez-vous » s'annonce donc
     par sa première cellule, comme la V3. */
  const lus = blocs.flatMap((b): BlocAccroche[] => {
    if (b.type === "p") return [{ paragraphe: texteNu(b.texte) }];
    if (b.type === "ul" || b.type === "ul2") return [{ liste: b.items.map(texteNu) }];
    /* Cartes, lignes et bento SONT des listes à puces du corpus (« - **Plan
       de prévention** avec chaque… ») que le dessin de bureau a titrées : la
       maquette les lit en `ul`, et sa première puce fait le résumé. La donnée
       a remis une capitale à la suite (« Avec chaque… ») ; elle retombe en
       minuscule, sauf sigle (« GMAO »). Corrigé le 15/10 : la partie 12 de
       reussir-un-transfert-industriel résumait un paragraphe plus bas. */
    if (b.type === "cartes" || b.type === "lignes" || b.type === "bento") {
      return [
        {
          liste: b.items.map((premier) => {
            const suite = /^\p{Lu}\p{Ll}/u.test(premier.texte)
              ? premier.texte.charAt(0).toLowerCase() + premier.texte.slice(1)
              : premier.texte;
            return texteNu(`${premier.titre} ${suite}`);
          }),
        },
      ];
    }
    if (b.type === "numeros" || b.type === "etapes") {
      return [{ liste: b.items.map((x) => ligneDuCorpus({ accroche: x.titre, texte: x.texte, point: x.point })) }];
    }
    if (b.type === "tableau") return [{ cellule: (b.lignes[0] ?? b.entetes)[0] }];
    return [];
  });
  return accrocheDe(lus) ?? "";
}

/**
 * Le résumé du HUB `/ressources/`, inchangé (le hub est hors de ce lot) :
 * sous-titres, sinon puces et titres de cartes joints par « · », sinon le
 * premier paragraphe.
 */
function resumeDuHub(blocs: BlocGuide[]): string {
  const sousTitres = blocs
    .filter((b): b is { type: "h3"; texte: string } => b.type === "h3")
    .map((b) => texteNu(b.texte))
    .filter(Boolean);
  if (sousTitres.length) return sousTitres.join(" · ");

  const listes = blocs.flatMap((b) => {
    if (b.type === "ul" || b.type === "ul2") return b.items.map(texteNu);
    if (b.type === "cartes" || b.type === "lignes") return b.items.map((x) => texteNu(x.titre));
    if (b.type === "numeros" || b.type === "etapes") return b.items.map((x) => texteNu(x.titre ?? x.texte));
    if (b.type === "bento") return b.items.map((x) => texteNu(x.titre));
    return [];
  });
  if (listes.filter(Boolean).length) return listes.filter(Boolean).join(" · ");

  const prose = blocs.find((b): b is { type: "p"; texte: string } => b.type === "p");
  return prose ? texteNu(prose.texte) : "";
}

/** Une question de FAQ écrite en paragraphe gras : « **Question ?** ». */
const QUESTION_EN_GRAS = /^\*\*[^*]+\?\*\*$/;
const estQuestionEnGras = (b: BlocGuide) => b.type === "p" && QUESTION_EN_GRAS.test(b.texte.trim());

/** La section FAQ : des blocs `question`, ou au moins deux questions en gras. */
const estSectionFaq = (blocs: BlocGuide[]) =>
  blocs.some((b) => b.type === "question") || blocs.filter(estQuestionEnGras).length >= 2;

/**
 * Les questions en gras d'une FAQ et leurs réponses (les blocs qui suivent,
 * jusqu'à la question suivante), et ce qui précède la première. `null` si la
 * FAQ est faite de blocs `question`.
 */
function pairesFaq(blocs: BlocGuide[]): { avant: BlocGuide[]; paires: BlocGuide[][] } | null {
  const premiere = blocs.findIndex(estQuestionEnGras);
  if (premiere < 0) return null;
  const paires: BlocGuide[][] = [];
  for (const b of blocs.slice(premiere)) {
    if (estQuestionEnGras(b)) paires.push([b]);
    else paires[paires.length - 1].push(b);
  }
  return { avant: blocs.slice(0, premiere), paires };
}

/**
 * LE GABARIT GUIDE, et une seule greffe : `bibliotheque`.
 *
 * CE QU'ELLE EST. Le hub `/ressources/` est rendu par ce gabarit, et la
 * maquette « Ressources v2 » (`maquette/colis-13-10/Migen - Ressources.html`)
 * lui ajoute une bibliothèque filtrable juste sous son héros. Le nœud est donc
 * inséré là, et NULLE PART AILLEURS dans le fichier : rien de ce que le
 * gabarit rendait déjà n'est déplacé, réécrit ni retiré. Les deux pages
 * `/guides/` passent `undefined` et ne changent pas d'un pixel.
 *
 * POURQUOI UN NŒUD EN PROPRIÉTÉ et non une lecture ici : la bibliothèque se
 * lit sur le disque (`components/site/ressources-hub/catalogue.ts`), et ce
 * fichier doit rester montable depuis un contrôle hors base, exactement la
 * raison déjà écrite pour `filAriane` et `maillage` dans `PageEditoriale`.
 */
/**
 * Le format du hub `/ressources/` : le même discriminant que
 * `PageEditoriale.tsx` (la pastille de la capture), pour séparer le hub
 * (gabarit « 10 Hub de rubrique ») des deux guides (gabarit « 01 Article et
 * fiche ») sans champ inventé.
 */
const FORMAT_HUB_RESSOURCES = "Ressources";
/** dc.html L225 : `FIMG.guides`, la photo de tête des guides au téléphone. */
const PHOTO_TETE_GUIDES = "/assets/web/ph-technicien.jpg";

export default function Guide({
  titre,
  vue,
  bibliotheque,
  chemin,
}: {
  titre: string;
  vue: VueGuide;
  bibliotheque?: ReactNode;
  /**
   * Le chemin de la page, avec slash final, passé par la route pour les deux
   * guides. Il pose la cadence de conversion de la maquette MOBILE v2 entre
   * les sections. Absent (le hub, les contrôles hors base), rien ne s'ajoute.
   */
  chemin?: string;
}) {
  const estHub = vue.format === FORMAT_HUB_RESSOURCES;
  /* LE NOMBRE DE SECTIONS OUVERTES AU TÉLÉPHONE vient de la maquette mobile
     v2, et il est ÉCRIT dans son dc.html : `nOpen = g === "01" ? 2 : …`. Les
     deux guides sont du gabarit 01 : leurs DEUX premières sections restent
     ouvertes. Le hub `/ressources/` n'est pas de ce lot : il garde sa règle
     d'une section ouverte, posée le 12/10, et rien d'autre ne change pour lui
     dans ce fichier (pas de chemin passé par sa route, pas de héros
     compact). */
  const nOuvertes = estHub ? 1 : 2;
  /* G2, LE HÉROS COMPACT DU TÉLÉPHONE, pour les guides seulement : les règles
     vivent sous 880 px dans `PageEditoriale.module.css`. */
  const compact = !estHub;
  /* LA PHOTO DE TÊTE DU TÉLÉPHONE (dc.html, `hero.hasImg` et `heroImg`) :
     celle que la maquette pose sur toute la famille des guides,
     `FIMG.guides` (dc.html L225). Les photos du corps restent à leur place
     dans leurs sections : aucune ne disparaît. */
  const photoTete = compact ? PHOTO_TETE_GUIDES : undefined;

  /* LES SECTIONS, rendues une fois : la cadence de conversion s'intercale
     entre elles quand la route a passé le chemin (gabarit 01, variante
     « article » : photo + CTA après la 2e, bandeau aux 5e, 8e…). Le rappel
     final n'est PAS posé ici (`rappelFinal={false}`) : la page porte déjà son
     formulaire complet `#cx-form` juste sous le corps, et la maquette n'en
     pose qu'un. */
  /* La section des questions, au téléphone seulement (guides). */
  const iFaq = compact ? vue.sections.findIndex((s) => estSectionFaq(s.blocs)) : -1;
  const sections = vue.sections.map((s, i) => {
    const entete = (
      <div
        className={compact ? (i === iFaq ? styles.enteteFaq : styles.entetePartie) : undefined}
        style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20 }}
      >
        <span
          style={{
            font: "600 12px ui-monospace,Menlo,monospace",
            letterSpacing: ".06em",
            color: "var(--acc)",
            flex: "none",
          }}
        >
          {numero(i)}
        </span>
        <h2
          data-faq-titre={i === iFaq ? "" : undefined}
          style={{
            font: "600 calc(clamp(23px,2.5vw,34px) * var(--ts))/1.14 var(--ft)",
            letterSpacing: "-.036em",
            color: "var(--ink)",
            margin: 0,
            maxWidth: "28ch",
            textWrap: "balance",
          }}
        >
          {s.titre}
        </h2>
      </div>
    );
    const corps = (
      <BlocsGuide blocs={s.blocs} groupe={`faq-c${i + 1}`} />
    );
    if (i === iFaq) {
      /* LA FAQ DES GUIDES, AU TÉLÉPHONE : UN TITRE SEUL ET UNE LISTE DE
         CARTES (dc.html, `isTitle` puis `isQ`), pas une carte repliée. Elle
         ne prend pas de numéro : la section suivante garde le sien (« 09
         Pour aller plus loin »). Sur bureau, en-tête et questions se rendent
         comme avant : la liste n'est qu'une enveloppe sans dessin. */
      const faq = pairesFaq(s.blocs);
      return (
        <section key={s.titre} id={`c${i + 1}`} style={{ scrollMarginTop: 100, paddingBottom: 56 }}>
          {entete}
          {faq ? (
            <>
              {faq.avant.length > 0 ? <BlocsGuide blocs={faq.avant} groupe={`faq-c${i + 1}`} /> : null}
              {/* Chaque question et sa réponse, mêmes paragraphes qu'avant,
                  dans un `<details>` OUVERT : sur bureau sa bascule n'existe
                  pas et les paragraphes se lisent comme avant. Au téléphone,
                  la bascule porte la question (le paragraphe gras, son
                  doublon, ne se peint plus) et `FermeAuTelephone` les
                  referme toutes. Sans `name` : il refermerait sur bureau
                  toutes les réponses sauf une. */}
              <FermeAuTelephone style={{}} faqListe>
                {faq.paires.map(([question, ...reponses], k) => (
                  <details key={k} open className={styles.questionGuide}>
                    <summary data-mobile-seulement="">
                      <span>{question.type === "p" ? texteNu(question.texte) : ""}</span>
                      <span aria-hidden="true">+</span>
                    </summary>
                    <BlocsGuide blocs={[question, ...reponses]} groupe={`faq-c${i + 1}-${k}`} />
                  </details>
                ))}
              </FermeAuTelephone>
            </>
          ) : (
            <div data-faq-liste="">{corps}</div>
          )}
        </section>
      );
    }
    return (
      <section key={s.titre} id={`c${i + 1}`} style={{ scrollMarginTop: 100, paddingBottom: 56 }}>
        {i === 0 && !compact ? (
          <>
            {entete}
            {corps}
          </>
        ) : (
          /* GUIDES : CHAQUE SECTION EST UNE CARTE BLANCHE NUMÉROTÉE au
             téléphone, la première comprise (dc.html, `isDetails` + `isH`),
             SON TITRE DANS LA CARTE à côté du numéro (compteur CSS de la
             carte partagée), ouverte comme fermée. L'en-tête de bureau
             (numéro et `<h2>`) reste dans le corps pour le plan du document,
             et ne se peint plus au téléphone (doublon de l'étiquette). Les
             DEUX premières restent ouvertes, repliables. */
          <SectionPliableMobile
            enTete={
              <span data-mobile-seulement="" className={styles.etiquettePli}>
                {compact ? (
                  <span data-carte-titre="">{s.titre}</span>
                ) : (
                  <>
                    <span style={ETIQUETTE_SURTITRE}>{numero(i)}</span>
                    <span style={ETIQUETTE_TITRE}>{s.titre}</span>
                  </>
                )}
              </span>
            }
            /* La FAQ ne compte pas : la maquette la pose en titre seul, sans
               numéro (dc.html, `isTitle`), et la section suivante garde le
               sien (« 09 Pour aller plus loin »). */
            numero={compact && !s.blocs.some((b) => b.type === "question")}
            resume={compact ? resumeDeLaSection(s.blocs) : resumeDuHub(s.blocs)}
            toujoursOuvert={i < nOuvertes}
          >
            {entete}
            {corps}
          </SectionPliableMobile>
        )}
      </section>
    );
  });

  /* « NOS RÉALISATIONS », le carrousel que la maquette mobile v2 pose juste
     avant la FAQ (dc.html, `refsSec` sur `x.k === "faq"`, repli sur les six
     premières études de l'index), ou en fin de corps sans FAQ. Mobile
     seulement : rien ne change sur bureau. */
  const realisations =
    compact && chemin ? (
      <div key="realisations" className={styles.realisationsGuide}>
        <CarrouselRealisations cartes={realisationsLiees(chemin)} titre="Nos réalisations" />
      </div>
    ) : null;
  /* La cadence de conversion compte ses enfants ; la maquette ne compte pas
     la FAQ (ni le carrousel) : les deux voyagent avec la section suivante. */
  const enfants =
    iFaq < 0
      ? sections
      : [
          ...sections.slice(0, iFaq),
          <Fragment key="faq">
            {realisations}
            {sections.slice(iFaq, iFaq + 2)}
          </Fragment>,
          ...sections.slice(iFaq + 2),
        ];

  /* Les entrées du sommaire et son bouton, rendus une fois. */
  const sommaireListe = (
    <>
      <nav
        aria-label="Sur cette page"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 2, borderLeft: "1px solid var(--line)" }}
      >
        {vue.sections.map((s, i) => (
          <a
            key={s.titre}
            href={`#c${i + 1}`}
            className={styles.entreeSommaire}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 0 8px 16px",
              marginLeft: -1,
              borderLeft: "1px solid transparent",
              font: "500 13px/1.45 var(--fb)",
              color: "var(--ink2)",
            }}
          >
            <span
              style={{
                font: "600 10.5px ui-monospace,Menlo,monospace",
                color: "var(--acc)",
                flex: "none",
                paddingTop: 2,
              }}
            >
              {numero(i)}
            </span>
            <span>{court(s.titre)}</span>
          </a>
        ))}
      </nav>
      <a
        href="#cx-form"
        className={styles.boutonPlein}
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
          padding: 13,
          borderRadius: 999,
          background: "var(--acc)",
          color: "#fff",
          font: "600 13.5px var(--fb)",
        }}
      >
        Décrire mon besoin
      </a>
    </>
  );

  /* « Pages liées » : en-tête et cartes, rendus une fois. */
  const liees = (
    <>
      <div className={compact ? styles.enteteLiees : undefined} style={{ ...SURTITRE, marginBottom: 14 }}>
        Pour aller plus loin
      </div>
      <h2 className={compact ? styles.enteteLiees : undefined} style={{ ...TITRE2, margin: "0 0 26px" }}>
        Pages liées
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
        {vue.liees.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            prefetch={false}
            className={styles.carteLiee}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 140,
              padding: "22px 24px",
              borderRadius: "var(--rad-s)",
              ...VERRE,
              transition: "transform var(--tr)",
            }}
          >
            <span
              style={{
                font: "600 10px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
              }}
            >
              {page.famille}
            </span>
            <span
              style={{
                font: "600 calc(16px * var(--ts))/1.35 var(--ft)",
                letterSpacing: "-.024em",
                color: "var(--ink)",
              }}
            >
              {page.titre}
            </span>
            <span style={{ font: "600 12.5px var(--fb)", color: "var(--acc-ink)", marginTop: "auto" }}>
              Lire →
            </span>
          </Link>
        ))}
      </div>
    </>
  );

  /* Le formulaire complet `#cx-form`, rendu une fois. */
  const formulaireBureau = (
    <div
      className="mg-r2"
      style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "start" }}
    >
      <div>
        <div style={{ ...SURTITRE, marginBottom: 16 }}>Décrire mon besoin</div>
        <h2 style={{ ...TITRE2, margin: "0 0 18px", maxWidth: "17ch" }}>
          Un chargé d’affaires vous rappelle dans l’heure.
        </h2>
        <p
          style={{
            font: "400 16px/1.7 var(--fb)",
            color: "var(--ink2)",
            margin: "0 0 24px",
            maxWidth: "42ch",
          }}
        >
          Du lundi au vendredi, de 8&nbsp;h&nbsp;00 à 18&nbsp;h&nbsp;30. Nous qualifions le besoin et vous
          annonçons un délai de démarrage réaliste.
        </p>
      </div>
      <div style={{ borderRadius: "var(--rad)", padding: "32px 34px 34px", ...VERRE }}>
        <FormulaireContact formulaire={vue.formulaire} />
      </div>
    </div>
  );

  return (
    <div className="mg-site">
      {/* `corpsGuide` est la PORTEE des deux regles de bureau des blocs
          repliables : elles ne doivent toucher que ce gabarit, jamais un
          selecteur global. Deux autres gabarits partagent ce module CSS. */}
      <main
        className={compact ? `${styles.corpsGuide} ${styles.guideCompact}` : styles.corpsGuide}
        style={{ paddingTop: 96 }}
      >
        {/* `herosGuide`, `herosGuideTexte`, `corpsGuideSection` et
            `grilleGuide` ne portent RIEN au-dessus de 880 px : au téléphone,
            ils remettent le sommaire à sa place de maquette, entre les deux
            boutons et le chapô (dc.html, `hasToc`). */}
        <section
          className={compact ? styles.herosGuide : undefined}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 0" }}
        >
          <nav
            aria-label="Fil d'Ariane"
            className={styles.ariane}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              font: "400 13px var(--fb)",
              color: "var(--ink4)",
              flexWrap: "wrap",
            }}
          >
            {vue.ariane.map((maillon) =>
              maillon.href ? (
                <Fragment key={maillon.label}>
                  <Link href={maillon.href} prefetch={false} style={{ color: "var(--ink4)" }}>
                    {maillon.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </Fragment>
              ) : (
                <span key={maillon.label} aria-current="page" style={{ color: "var(--ink1)" }}>
                  {maillon.label}
                </span>
              ),
            )}
          </nav>
          {photoTete ? (
            <div data-mobile-seulement="" className={styles.photoTete}>
              <Image
                src={photoTete}
                alt={altPhoto(photoTete)}
                fill
                sizes="(max-width: 880px) 100vw, 850px"
                style={{ objectFit: "cover", objectPosition: cadragePhoto(photoTete, 16 / 10) }}
              />
            </div>
          ) : null}
          <div className={compact ? styles.herosGuideTexte : undefined} style={{ maxWidth: 860 }}>
            {/* `kickGuide` : au téléphone, les deux pastilles deviennent le
                sur-titre de la maquette, « GUIDE · 11 MIN DE LECTURE ». */}
            <div
              className={compact ? styles.kickGuide : undefined}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
            >
              <span style={PASTILLE}>{vue.format}</span>
              <span
                style={{
                  ...PASTILLE,
                  letterSpacing: ".1em",
                  color: "var(--ink3)",
                  background: "var(--chip)",
                }}
              >
                {vue.lecture}
              </span>
            </div>
            <h1
              className={compact ? styles.titreCompact : undefined}
              style={{
                font: "600 calc(clamp(32px,3.9vw,56px) * var(--ts))/1.05 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
                margin: 0,
                maxWidth: "20ch",
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>
            {compact ? (
              /* Les deux boutons côte à côte du haut de page mobile (dc.html,
                 `hero.showCta`). */
              <div data-mobile-seulement="" className={styles.boutonsTete}>
                <Link href={CONTACT} prefetch={false} className={styles.boutonTetePlein}>
                  {COPIE.decrire}
                </Link>
                <a href={TELEPHONE.href} className={styles.boutonTeteTel}>
                  {TELEPHONE.libelle}
                </a>
              </div>
            ) : null}
            <p
              className={compact ? `${styles.riche} ${styles.chapoCompact}` : styles.riche}
              style={{
                font: "400 18px/1.7 var(--fb)",
                color: "var(--ink1)",
                margin: "22px 0 0",
                maxWidth: "60ch",
                textWrap: "pretty",
              }}
            >
              <TexteRiche texte={vue.chapeau} />
            </p>
          </div>
        </section>

        {bibliotheque}

        <section
          className={compact ? styles.corpsGuideSection : undefined}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 40px 0" }}
        >
          <div
            className={compact ? `cx-lay ${styles.grilleGuide}` : "cx-lay"}
            style={{ display: "grid", gridTemplateColumns: "230px minmax(0,1fr)", gap: 60, alignItems: "start" }}
          >
            <aside className="cx-toc" style={{ position: "sticky", top: 112 }}>
              <div
                className={compact ? styles.sommaireLabel : undefined}
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  marginBottom: 14,
                }}
              >
                Sur cette page
              </div>
              {compact ? (
                /* LE SOMMAIRE REPLIÉ DU TÉLÉPHONE (dc.html, `hasToc`) : une
                   carte sans numéro, fermée, sans compteur (le « N parties »
                   est retiré le 16/10, Mehdi : plus aucun compteur). Le
                   libellé de bureau, juste au-dessus, ne se peint pas au
                   téléphone : c'est le même mot, dans la bascule. */
                <SectionPliableMobile
                  numero={false}
                  enTete={
                    <span data-mobile-seulement="" className={styles.etiquettePli}>
                      <span className={styles.sommaireTitre}>Sommaire</span>
                    </span>
                  }
                >
                  {sommaireListe}
                </SectionPliableMobile>
              ) : (
                sommaireListe
              )}
            </aside>
            <article style={{ minWidth: 0 }}>
              {vue.intro.length > 0 ? (
                <div style={{ marginBottom: 48 }}>
                  <BlocsGuide blocs={vue.intro} groupe="intro" />
                </div>
              ) : null}
              {/* CHAQUE SECTION SE REPLIE AU TELEPHONE SAUF LES PREMIERES,
                  et leur COMPTE vient de la maquette mobile v2 : `nOpen =
                  g === "01" ? 2 : …` (voir `nOuvertes` plus haut). Les deux
                  guides gardent DEUX sections ouvertes, le hub une seule.
                  Mesure du 12/10 : les deux guides etaient les pages les plus
                  longues du site, 36,2 et 25,8 ecrans, sans aucun repli.
                  L'ANCRE `#c<n>` RESTE SUR LA SECTION pour que le sommaire
                  continue de tomber au bon endroit.
                  L'EN-TETE DE SECTION, son numero et son `<h2>`, RESTE DANS LE
                  CORPS DU BLOC, a sa place et a la taille de sa capture. La
                  bascule, elle, ne porte qu'une etiquette mobile (voir
                  `ETIQUETTE_SURTITRE` plus haut). Le passer en `<summary>`,
                  comme le faisait la version du matin, laissait 30 bascules
                  focalisables sur grand ecran et 12 px de trop sous chaque
                  titre. */}
              {chemin ? (
                <AvecConversionMobile chemin={chemin} gabarit="01" rappelFinal={false}>
                  {enfants}
                </AvecConversionMobile>
              ) : (
                enfants
              )}
              {iFaq < 0 ? realisations : null}
            </article>
          </div>
        </section>

        {vue.liees.length > 0 ? (
          <section className={styles.horsMaquetteMobile} style={{ padding: "var(--sec) 0 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
              {compact ? (
                /* « Pages liées », bloc de bureau que la maquette mobile ne
                   dessine pas : REPLIÉ au téléphone, jamais retiré, dans une
                   carte sans numéro. Son en-tête de bureau ne se peint pas au
                   téléphone : mêmes mots que l'étiquette de la bascule. */
                <SectionPliableMobile
                  numero={false}
                  enTete={
                    <span data-mobile-seulement="" className={styles.etiquettePli}>
                      <span data-carte-surtitre="">Pour aller plus loin</span>
                      <span data-carte-titre="">Pages liées</span>
                    </span>
                  }
                  resume={vue.liees.map((page) => page.titre).join(" · ")}
                >
                  {liees}
                </SectionPliableMobile>
              ) : (
                liees
              )}
            </div>
          </section>
        ) : null}

        {/* Le bandeau « Être rappelé » de la cadence vise `#etre-rappele` :
            sans cette ancre il ne menait nulle part (docs/PAGES-MORTES-14-10.md). */}
        {/* LE RAPPEL FINAL DE LA MAQUETTE MOBILE V2 (dc.html, `#etre-rappele`,
            juste avant le pied) : il porte l'ancre que visent les bandeaux de
            la cadence. Le formulaire complet de bureau, dessous, se REPLIE au
            téléphone derrière son sur-titre, il n'est pas retiré. */}
        {compact && chemin ? (
          <RappelFinalMobile variante={varianteDe(chemin, "01")} />
        ) : (
          <AncreRappel chemin={chemin} />
        )}
        <section
          id="cx-form"
          className={styles.horsMaquetteMobile}
          style={{ padding: "var(--sec) 0 var(--sec)", scrollMarginTop: 90 }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            {compact ? (
              <RepliFormulaireMobile etiquette="Décrire mon besoin">{formulaireBureau}</RepliFormulaireMobile>
            ) : (
              formulaireBureau
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
