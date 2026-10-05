import type { ReactNode } from "react";

import type {
  Section,
  SectionChiffres,
  SectionCta,
  SectionCtaFinal,
  SectionDeroule,
  SectionGaranties,
  SectionHeros,
  SectionObjections,
  SectionOffre,
  SectionPreuves,
} from "@/types/contenu";
import type { ContenuSecteur } from "@/types/secteur";

import PageAncrage from "./PageAncrage";
import {
  Deroule,
  Garanties,
  Heros,
  Offre,
  PhotoEtLogos,
  Probleme,
} from "./BlocsSecteur";
import {
  Appel,
  AppelFinal,
  Maillage,
  Questions,
  Reassurance,
  References,
} from "./BlocsPreuveEtAppel";
import {
  CHROME,
  clientDePreuve,
  coupePunchline,
  sansDisponibiliteChiffree,
} from "./contenu-maquette";
import { cibleSure } from "./PucesLiens";
import { HERO } from "./habillage-gabarit08";

/**
 * Gabarit 08 SECTEUR. Les 13 pages `/secteurs/<secteur>/`.
 *
 * SON FICHIER DE MAQUETTE, QUI FAIT FOI : `maquette/gabarit-08-secteur.html`,
 * transcrit de « Migen - Gabarit 08 Secteur.dc.html » du projet Claude Design.
 * IL FAIT FOI CONTRE « Migen - Site final.dc.html ».
 *
 * CE QUI A COÛTÉ DES SEMAINES, et que ce fichier répare. Le client avait envoyé
 * deux fichiers par message, « Site final » et « Mobile », et tout le portage
 * s'est fait depuis ceux-là. Personne n'a listé les fichiers du projet Claude
 * Design, qui contient ONZE GABARITS DÉDIÉS, bien plus riches. « Site final »
 * dessine QUATRE sections pour une page de secteur ; le gabarit 08 en dessine
 * DOUZE. Le portage précédent a donc rendu quatre sections de la maquette et
 * renvoyé les six sections de corpus restantes dans `complement`, où les blocs
 * du gabarit de VENTE les rendaient avec leurs surtitres à eux : « Le
 * problème » au lieu de « Vos contraintes », « Nos engagements » au lieu de
 * « Notre parti pris », « Prochaine étape » au lieu de rien. D'où « les pages
 * ne ressemblent toujours pas » : le dessin lu n'était pas le bon dessin.
 *
 * LES DOUZE SECTIONS, DANS L'ORDRE DE LA MAQUETTE, et ce qui les alimente :
 *
 *   01 Héros          heros, et ses chiffres dans le panneau « En bref »
 *   02 Photo et logos la punchline en exergue, les clients des études de cas
 *   03 Problème       probleme
 *   04 Offre          offre
 *   05 Déroulé        deroule
 *   06 Garanties      garanties
 *   Réassurance       RIEN : chrome du gabarit, voir `BlocsSecteur.tsx`
 *   07 Appel          cta
 *   08 Références     preuves
 *   09 Questions      objections
 *   Maillage          pourAllerPlusLoin
 *   10 Appel final    ctaFinal, et le formulaire du site
 *
 * `complement` N'A PLUS D'EMPLOI ICI, et c'est le vrai gain : la maquette
 * dessine les DIX sections du corpus, une par une. Rien ne déborde sous le
 * gabarit, rien n'est rendu avec les surtitres d'un autre gabarit, et rien
 * n'est perdu.
 *
 * UNE SECTION QUE LE CORPUS N'ALIMENTE PAS NE SE REND PAS DU TOUT, titre
 * compris. C'est pour cela que ce fichier ne contient que du tri : chaque
 * section est cherchée par son type dans `contenu.sections`, et absente, elle
 * n'apparaît pas. Aucune valeur de remplissage, aucun titre orphelin.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les révélations au défilement
 * sont posées en `data-reveal` par `BlocsSecteur.tsx` et animées par
 * `components/site/Moteurs.tsx`, monté une fois dans la mise en page racine.
 */

/** Cherche une section par son type, dans le tableau du corpus. */
function sectionDe<T extends Section["type"]>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((s) => s?.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}

export interface ProprietesPageSecteur {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuSecteur;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone à son
   * tour pour deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
  /** Identifiant d'analyse du formulaire, repris par HubSpot. */
  formulaire?: string;
}

export default function PageSecteur({
  titre,
  contenu,
  filAriane,
  maillage,
  formulaire = "secteur",
}: ProprietesPageSecteur) {
  /*
    LE REPLI VERS LE GABARIT D'ANCRAGE, et pourquoi il existe encore.

    `components/site/implantation/PageDepartement.tsx` appelle ce composant avec
    un contenu qui porte `communes`, `reperes` et `enjeux`, jamais `sections` :
    c'est le portage « Site final », qui sert aujourd'hui les 42 pages de
    `/implantations/`. Ces pages ont leurs propres fichiers de maquette qui font
    foi (« Gabarit 04 Ville », « Gabarit 06 Departement ») et leur propre portage
    à refaire ; les casser maintenant au nom du gabarit 08 ne corrigerait rien et
    abîmerait un gabarit voisin.

    Le tri se fait sur la DONNÉE, pas sur un drapeau : un contenu qui porte les
    dix sections du corpus est une page de secteur, un contenu qui porte des
    communes est une page de territoire. C'est l'argument déjà écrit dans
    `types/secteur.ts`, « le contenu dit déjà ce qu'il est ».

    CE REPLI EST À SUPPRIMER par le portage des gabarits 04 et 06, avec
    `PageAncrage.tsx`.
  */
  const sections = contenu.sections ?? [];
  if (sections.length === 0) {
    return (
      <PageAncrage
        titre={titre}
        contenu={contenu}
        filAriane={filAriane}
        maillage={maillage}
      />
    );
  }

  const heros: SectionHeros | undefined = sectionDe(sections, "heros");
  const chiffres: SectionChiffres | undefined = sectionDe(sections, "chiffres");
  const probleme = sectionDe(sections, "probleme");
  const offre: SectionOffre | undefined = sectionDe(sections, "offre");
  const deroule: SectionDeroule | undefined = sectionDe(sections, "deroule");
  const garanties: SectionGaranties | undefined = sectionDe(
    sections,
    "garanties",
  );
  const cta: SectionCta | undefined = sectionDe(sections, "cta");
  const preuves: SectionPreuves | undefined = sectionDe(sections, "preuves");
  const objections: SectionObjections | undefined = sectionDe(
    sections,
    "objections",
  );
  const ctaFinal: SectionCtaFinal | undefined = sectionDe(
    sections,
    "ctaFinal",
  );

  /* Le numéro de téléphone est écrit UNE FOIS dans le corpus, dans le héros, et
     la maquette le rend à cinq endroits. Sans héros, pas de numéro : aucun
     n'est rappelé de mémoire. */
  const telephone = heros?.telephone ?? "";

  /* La punchline sert DEUX sections : l'exergue sur la photo et le titre du
     problème. La maquette lit `p.punchTitle` aux deux endroits. */
  const punch = probleme?.punchline
    ? coupePunchline(probleme.punchline)
    : { titre: "", texte: "" };

  /* Les noms de la bande de logos sortent des études de cas du corpus. Ni plus,
     ni moins : aucun logo de client n'est ajouté pour garnir la bande. */
  const clients = (preuves?.preuves ?? [])
    .map((preuve) => clientDePreuve(preuve.lienLibelle))
    .filter((nom, i, tous) => !!nom && tous.indexOf(nom) === i);

  /* Les cartes de maillage, filtrées comme les pastilles : une cible hors
     domaine fait disparaître la carte, elle n'est pas rafistolée. */
  const cartes = (contenu.pourAllerPlusLoin ?? []).filter(
    (carte) => !!carte.titre && !!carte.href && cibleSure(carte.href),
  );

  const delaiFinal = heros?.phraseDelai
    ? sansDisponibiliteChiffree(heros.phraseDelai)
    : "";

  return (
    <div className="mg-site">
      <main>
        <section style={HERO}>
          {/* La maquette dessine son fil d'Ariane ici, au-dessus du titre, avec
              30px sous lui. Celui du site est déduit de la hiérarchie des pages
              et arrive par la route : c'est le même emplacement, le vrai
              contenu. */}
          {filAriane ? <div style={{ marginBottom: 30 }}>{filAriane}</div> : null}
          {heros ? (
            <Heros titre={titre} heros={heros} chiffres={chiffres} />
          ) : (
            /* Sans section de héros, le H1 se rend seul : une page référencée
               doit porter son titre même si son corpus est incomplet. */
            <h1>{titre}</h1>
          )}
        </section>

        {punch.titre || clients.length > 0 ? (
          <PhotoEtLogos punchTitre={punch.titre} clients={clients} />
        ) : null}

        {probleme && probleme.puces.length > 0 ? (
          <Probleme
            punchTitre={punch.titre}
            punchTexte={punch.texte}
            puces={probleme.puces}
          />
        ) : null}

        {offre && offre.lignes.length > 0 ? <Offre offre={offre} /> : null}

        {deroule && deroule.etapes.length > 0 ? (
          <Deroule deroule={deroule} />
        ) : null}

        {garanties && garanties.puces.length > 0 ? (
          <Garanties garanties={garanties} />
        ) : null}

        <Reassurance />

        {cta?.question ? <Appel cta={cta} telephone={telephone} /> : null}

        {preuves && preuves.preuves.length > 0 ? (
          <References preuves={preuves} />
        ) : null}

        {objections && objections.questions.length > 0 ? (
          <Questions objections={objections} telephone={telephone} />
        ) : null}

        {cartes.length > 0 ? <Maillage cartes={cartes} /> : null}

        {/* Le maillage interne de la route, en cartes cliquables : parent,
            enfants, pages voisines. Il vient AVANT l'appel final, pour que la
            page se ferme sur le formulaire comme dans la maquette. */}
        {maillage}

        {/*
          L'APPEL FINAL SE REND MÊME SANS `ctaFinal`, et c'est la seule section
          dans ce cas. Il porte l'ancre `#formulaire` que visent le bouton du
          héros et celui de « 07 Appel » : la retirer ferait de ces deux boutons
          des liens vers une ancre absente, ce qui est pire qu'un panneau sans
          son titre. Les textes manquants, eux, ne se rendent pas.
        */}
        <AppelFinal
          ctaFinal={ctaFinal ?? { type: "ctaFinal", question: "", bouton: "" }}
          intitule={ctaFinal?.bouton || heros?.cta || CHROME.finalSurtitre}
          delai={delaiFinal}
          telephone={telephone}
          formulaire={formulaire}
        />
      </main>
    </div>
  );
}
