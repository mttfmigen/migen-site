"use client";

import { useEffect, useRef } from "react";

import s from "./SectionPliableMobile.module.css";
import { enTexteNu } from "@/components/site/blocs/TexteRiche";

/**
 * LE RÉSUMÉ D'UN BLOC REPLIÉ, CONSTRUIT COMME LA MAQUETTE LE CONSTRUIT.
 *
 * `MigenMobile.dc.html` ne rédige pas le résumé d'une section : il le FABRIQUE
 * depuis le contenu de la section, en joignant ses intitulés par « · »
 * (`summary = punch | stats | items.h joints par " · "`). D'où cette fonction
 * plutôt qu'une phrase écrite : une phrase écrite serait une donnée inventée,
 * et l'une l'a été. `offre/GarantiesOffre.tsx` porte la mesure qui l'a fait
 * retirer, le 11/10 : « N engagements, écrits avant la signature. » était
 * absente des 244 captures et présente 140 fois sur le site.
 *
 * ELLE NE LAISSE PAS TOMBER UN ÉLÉMENT SANS INTITULÉ. Le motif d'origine
 * écrivait `.map((p) => p.accroche).filter(Boolean)` : une puce sans accroche
 * disparaissait du résumé en silence, et le résumé annonçait alors moins
 * d'éléments que le bloc n'en contient. Les appelants passent donc un repli
 * (`puce.accroche ?? puce.texte`), et c'est ici que les vides sont écartés.
 */
/* `resumeDe` VIT DANS `./resume-de-section`, ET N'EST PAS REEXPORTEE ICI.
   Un reexport depuis un module « use client » reste marque client : le serveur
   qui l'appellerait tomberait exactement comme avant, sans qu'aucun type ne
   proteste. Laisser le chemin ouvert, c'etait garder le piege arme. Chaque
   appelant importe donc la source neutre. */

/**
 * L'EN-TÊTE EXISTANT D'UN BLOC, PASSÉ DANS LA BASCULE SANS ÊTRE REDESSINÉ.
 *
 * Les en-têtes de `blocs/` sont des grilles à deux colonnes (`habillage.ENTETE`
 * : titre à gauche, chapeau à droite). La bascule, elle, est une boîte `flex`.
 * Sans ces deux propriétés, la grille devient un élément flexible dimensionné
 * par son contenu et la mise en page de bureau change, alors que la règle est
 * qu'au-dessus de 880 px RIEN ne change. `flex: 1 1 auto` lui rend toute la
 * largeur disponible, `minWidth: 0` l'autorise à se rétrécir au lieu de
 * déborder, et le chevron garde sa place à droite.
 */
export const ENTETE_DANS_BASCULE = { flex: "1 1 auto", minWidth: 0 } as const;

export interface SectionPliableMobileProps {
  /** Le sur-titre de la maquette, en capitales et en accent. */
  kicker?: string;
  /** Le titre, quand le bloc n'en a pas déjà un à lui. */
  titre?: string;
  /**
   * L'EN-TÊTE DÉJÀ ÉCRIT PAR L'APPELANT, son `<h2>` et son dessin.
   *
   * Sans cette porte d'entrée, replier un bloc qui a déjà un titre en
   * fabriquerait un SECOND, et la page afficherait deux fois le même mot. Les
   * blocs communs du gabarit Offre, repris par Ville, Secteur, Domaine et
   * Spécialité, portent tous leur `<h2>` et son style relevé dans la capture :
   * ils le passent ici tel quel, et le repli ne touche pas à leur dessin.
   * `<summary>` accepte du contenu de flux, un titre de niveau y est valide.
   */
  enTete?: React.ReactNode;
  /** Une phrase montrée À LA PLACE du contenu quand le bloc est replié. */
  resume?: string;
  /** Reste déplié même sur téléphone, pour le premier bloc d'une page. */
  toujoursOuvert?: boolean;
  children: React.ReactNode;
}

/**
 * Un bloc de page qui se replie sur téléphone, motif « Blocs communs
 * (pliables) » de `MigenMobile.dc.html`.
 *
 * POURQUOI IL EXISTE. Le README du colis de passation : « les blocs se
 * déplient pour rester courts sans perdre le texte utile au référencement ».
 * Une page de ce site porte souvent huit à quinze sections ; au téléphone
 * elles s'enchaînent en un mur, et l'appel à l'action tombe à plusieurs écrans
 * de défilement.
 *
 * TROIS DÉCISIONS DE PORTAGE, et chacune a une raison.
 *
 * 1. C'EST UN `<details>` NATIF, pas un état React. Le clavier, le rôle et
 *    l'annonce « développé / réduit » viennent du navigateur, et personne ne
 *    les réécrit à moitié. C'est aussi ce que le projet emploie déjà pour
 *    « Lire la suite » du gabarit générique.
 *
 * 2. IL EST RENDU OUVERT, et c'est un repli au chargement, pas à la
 *    construction. Le HTML servi porte donc `open` : Google reçoit le texte
 *    entier, et les contrôles qui mesurent le rendu des 248 pages continuent
 *    de le trouver. Un effet le referme après montage, et SEULEMENT sous
 *    880 px. Il n'y a aucun écart entre le rendu serveur et le premier rendu
 *    client, donc aucune erreur d'hydratation.
 *
 * 3. LA MAQUETTE, ELLE, RETIRE LE CONTENU REPLIÉ DU DOM (`sc-if`), ce qui
 *    contredit son propre README : un texte absent du HTML n'est pas
 *    « conservé pour le référencement ». Écart assumé et déclaré.
 *
 * Porte : `scripts/verifie-blocs-pliables.mjs`.
 */
export default function SectionPliableMobile({
  kicker,
  titre,
  enTete,
  resume,
  toujoursOuvert = false,
  children,
}: SectionPliableMobileProps) {
  const bloc = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (toujoursOuvert) return;
    const element = bloc.current;
    if (!element) return;
    /* Le repli n'a lieu qu'au chargement : si le visiteur a déjà ouvert le
       bloc, un changement de largeur ne doit pas le lui refermer au nez. */
    if (window.matchMedia("(max-width: 880px)").matches) element.open = false;
  }, [toujoursOuvert]);

  /*
   * LA BASCULE SORT DU PARCOURS CLAVIER SUR BUREAU, SANS DISPARAÎTRE.
   *
   * LE DÉFAUT. Au-dessus de 880 px, le bloc est ouvert et ne se referme plus :
   * son `<summary>` n'ouvre donc plus rien, mais il reste l'élément interactif
   * d'un `<details>`, donc focalisable. Mesuré par la porte du responsive à
   * 1280 px : 21 arrêts de tabulation muets, sur les gabarits domaine,
   * spécialité, ville, département, hub d'offres et secteur.
   *
   * CE QU'IL NE FAUT PAS FAIRE, et qui a été essayé le 13/10 : lui poser
   * `display: none` dans la feuille partagée. La bascule PORTE le titre de
   * section (`{enTete ?? <span>{kicker}{titre}</span>}`, juste en dessous) :
   * la masquer retire aussi le titre de l'arbre d'accessibilité, et sur les
   * gabarits qui ne le rendent pas une seconde fois ailleurs, elle le retire
   * de l'écran. Mesuré : 31 bascules sur 31 portaient un titre, zéro était
   * vide. Les six gabarits qui portent déjà cette règle chez eux la peuvent
   * parce qu'ils doublent leur titre hors de la bascule ; les autres non.
   *
   * CE QU'ON FAIT À LA PLACE. `tabIndex = -1` retire l'arrêt de tabulation et
   * laisse le titre visible et annoncé. La bascule reste atteignable à la
   * souris et au toucher, et reste focalisable par programme.
   *
   * ET ON ÉCOUTE LA LARGEUR, parce qu'un `tabIndex` posé une fois au
   * chargement mentirait après une rotation d'écran ou un redimensionnement :
   * en passant sous 880 px, la bascule redevient le seul moyen d'ouvrir le
   * bloc, elle doit donc retrouver sa place au clavier.
   */
  useEffect(() => {
    const element = bloc.current;
    if (!element) return;
    const sommaire = element.querySelector("summary");
    if (!sommaire) return;
    const surBureau = window.matchMedia("(min-width: 881px)");
    const applique = () => {
      sommaire.tabIndex = surBureau.matches ? -1 : 0;
    };
    applique();
    surBureau.addEventListener("change", applique);
    return () => surBureau.removeEventListener("change", applique);
  }, []);

  return (
    <details
      ref={bloc}
      open
      className={s.section}
      data-pliable-mobile=""
      {...(enTete ? { "data-en-tete-fourni": "" } : {})}
    >
      <summary className={s.bascule}>
        {enTete ?? (
          <span>
            {kicker ? <span className={s.kicker}>{kicker}</span> : null}
            <span className={s.titre}>{titre}</span>
          </span>
        )}
        {/* `data-mobile-seulement` : masqué au-dessus de 880 px, donc absent
            de ce qu'un visiteur de bureau voit. Les portes qui comparent une
            page à sa CAPTURE DE BUREAU doivent l'écarter, sans quoi elles
            signalent « texte rendu absent de la capture » sur un ornement que
            la capture n'avait aucune raison de porter. */}
        <span aria-hidden="true" data-mobile-seulement="" className={s.chevron}>
          &rsaquo;
        </span>
        {/* LE RÉSUMÉ VIT DANS LE `<summary>`, ET C'EST INDISPENSABLE.
            Il était posé juste APRÈS, en frère du `<summary>` et donc à
            l'intérieur du `<details>`. Or les navigateurs récents enveloppent
            tout le contenu d'un `<details>` sauf son `<summary>` dans le
            pseudo-élément `::details-content`, auquel ils appliquent
            `content-visibility: hidden` quand le bloc est FERMÉ.

            Et fermé est le SEUL état où ce résumé doit paraître : la règle
            `.section:not([open]) .resume { display: block }` ne s'appliquait
            donc jamais à l'écran. Les deux lignes de résumé des 1 092 blocs
            repliables n'ont jamais été peintes, sur 233 pages, et personne ne
            l'avait vu parce qu'elles sont bien dans le HTML servi : seul un
            rendu réel pouvait le révéler.

            Le contenu d'un `<summary>` n'est jamais enveloppé par
            `::details-content`. Le sélecteur ne change pas : il porte sur
            l'état de l'ancêtre, pas sur la position du résumé. */}
        {/* `enTexteNu` SUR LE RÉSUMÉ, ET À CET ENDROIT PRÉCIS.
            Les dix appelants construisent ce résumé en concaténant du texte du
            CORPUS (`preuve.titre`, `point.titre`, `hub.nom`…), lequel porte de
            la syntaxe Markdown : les cartes la réduisent déjà par `enTexteNu`,
            le résumé ne le faisait pas.

            Le défaut était INVISIBLE jusqu'au 13/10 : le résumé n'était jamais
            peint, parce qu'il vivait hors du `<summary>` et donc sous
            `content-visibility: hidden`. En le remettant dans le `<summary>`,
            on a mis à l'écran un texte qui portait « [Étude de cas EATON :
            mise en production](/preuves/eaton-mise-en-production/) », crochets
            et parenthèses compris, sur les pages d'offre en téléphone. La
            porte `verifie:markdown` l'a vu la première.

            La réduction est posée ICI, dans le seul composant qui peint ce
            résumé, et non chez les dix appelants : un onzième appelant est
            couvert d'office. `enTexteNu` est sans effet sur un texte déjà
            propre. */}
        {resume ? (
          <p data-mobile-seulement="" className={s.resume}>
            {enTexteNu(resume)}
          </p>
        ) : null}
      </summary>
      <div className={s.corps}>{children}</div>
    </details>
  );
}
