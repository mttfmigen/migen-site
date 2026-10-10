"use client";

import { useEffect, useRef } from "react";

import s from "./SectionPliableMobile.module.css";

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
      </summary>
      {resume ? (
        <p data-mobile-seulement="" className={s.resume}>
          {resume}
        </p>
      ) : null}
      <div className={s.corps}>{children}</div>
    </details>
  );
}
