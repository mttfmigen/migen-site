"use client";

import { useId, useState } from "react";

import s from "./SectionPliableMobile.module.css";

export interface SectionPliableMobileProps {
  /** Le sur-titre de la maquette, en capitales et en accent. */
  kicker?: string;
  titre: string;
  /** Une phrase montrée À LA PLACE du contenu quand le bloc est replié. */
  resume?: string;
  /** Ouvert d'emblée, pour le premier bloc d'une page par exemple. */
  ouvertParDefaut?: boolean;
  children: React.ReactNode;
}

/**
 * Un bloc de page qui se replie sur mobile, motif « Blocs communs (pliables) »
 * de la maquette `MigenMobile.dc.html`.
 *
 * POURQUOI IL EXISTE. Le README du colis de passation : « les blocs se
 * déplient pour rester courts sans perdre le texte utile au référencement ».
 * Une page de ce site fait souvent huit à quinze sections ; au téléphone elles
 * s'enchaînent en un mur, et l'appel à l'action se retrouve à plusieurs écrans
 * de défilement.
 *
 * LE REPLI EST VISUEL, JAMAIS STRUCTUREL, et c'est le seul écart assumé à la
 * maquette. Elle retire le contenu replié du DOM (`sc-if`), ce qui contredit
 * son propre README : un texte absent du HTML n'est pas « conservé pour le
 * référencement ». Ici le contenu est TOUJOURS rendu et c'est la feuille de
 * style qui le replie sous 880px. Trois conséquences voulues :
 *  - Google reçoit le texte entier, comme sur bureau ;
 *  - les contrôles du projet qui mesurent le rendu des 248 pages continuent de
 *    le trouver, sans quoi la moitié d'entre eux tomberaient ;
 *  - rien ne change au-dessus de 880px, où l'en-tête n'est même pas un bouton.
 *
 * Porte : `scripts/verifie-blocs-pliables.mjs`.
 */
export default function SectionPliableMobile({
  kicker,
  titre,
  resume,
  ouvertParDefaut = false,
  children,
}: SectionPliableMobileProps) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const idCorps = useId();

  return (
    <section
      className={s.section}
      data-pliable-mobile=""
      data-ouvert={ouvert ? "true" : "false"}
    >
      <button
        type="button"
        className={s.bascule}
        aria-expanded={ouvert}
        aria-controls={idCorps}
        onClick={() => setOuvert((avant) => !avant)}
      >
        <span>
          {kicker ? <span className={s.kicker}>{kicker}</span> : null}
          <span className={s.titre}>{titre}</span>
        </span>
        <span aria-hidden="true" className={s.chevron}>
          &rsaquo;
        </span>
      </button>
      {resume ? <p className={s.resume}>{resume}</p> : null}
      <div id={idCorps} className={s.corps}>
        {children}
      </div>
    </section>
  );
}
