import type { CSSProperties, ReactNode } from "react";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

import s from "./mobile-apropos.module.css";

/**
 * UNE SECTION DES PAGES NATIVES, CARTE NUMÉROTÉE SUR TÉLÉPHONE, INCHANGÉE SUR
 * BUREAU.
 *
 * Partagée par les pages natives du lot « à propos » : /nous-connaitre/,
 * /valeurs/, /rse/, /partenaires/, /marques/, /a-propos/equipe/. La maquette
 * mobile v2 les sert depuis `maquette/mobile-v2/maquette/mobile-native-data.js`
 * au gabarit 01 : chaque section est une carte blanche numérotée en
 * `<details>`, les deux premières OUVERTES, les suivantes repliées (dc.html
 * `nOpen = g === "01" ? 2 : …`, L451). `ouvert` porte les deux premières.
 *
 * LE MOTIF :
 *   · la bascule porte une ÉTIQUETTE, deux `<span>` marqués
 *     `data-mobile-seulement`, et non un titre : la section garde son vrai
 *     `<h2>` à sa place et à sa taille ;
 *   · l'en-tête d'origine dont l'étiquette reprend le texte est marqué
 *     `data-titre-bureau` et s'efface sous 880 px ; au-dessus, c'est la
 *     bascule qui disparaît (`mobile-apropos.module.css`). Jamais deux fois le
 *     même titre ; et un texte de bureau que l'étiquette NE reprend PAS reste
 *     visible dans la carte, sans quoi il quitterait l'écran ;
 *   · le titre est écrit UNE fois, en constante dans le composant appelant,
 *     et sert aux deux endroits : aucune copie retapée ne peut dériver.
 *
 * Le `<details>` enveloppe la `<section>` entière, de l'extérieur : le
 * composant appelant garde son dessin de bureau au pixel. Rien n'est retiré :
 * le `<details>` est servi ouvert, le texte replié reste dans le HTML et dans
 * le `textContent` du `<main>`.
 *
 * Composant serveur, module sans directive : il est appelé par des composants
 * serveur. `SectionPliableMobile`, client, est rendu par lui, ce qui est permis.
 */
export interface SectionReplieeProps {
  /** Le sur-titre de la carte, tel que la maquette l'écrit. */
  kicker?: string;
  /** Le titre de la carte, tel que la maquette l'écrit. */
  titre: string;
  /** La phrase montrée sous le titre, carte repliée (dc.html `tease`). */
  resume?: string;
  /** Reste ouverte au chargement : les deux premières cartes de la page. */
  ouvert?: boolean;
  /** L'ancre de la carte, visée par le sommaire du haut de page. */
  id?: string;
  /**
   * Le numéro de la carte quand l'ordre du téléphone n'est pas celui du DOM
   * (`.ordreMaquette`) : le compteur CSS suivrait sinon l'ordre du DOM.
   */
  rang?: number;
  /** Faux : la carte ne porte pas de numéro et ne compte pas dans la suite. */
  numero?: boolean;
  children: ReactNode;
}

export default function SectionRepliee({
  kicker,
  titre,
  resume,
  ouvert = false,
  id,
  rang,
  numero = true,
  children,
}: SectionReplieeProps) {
  const style = rang ? ({ "--rang": rang } as CSSProperties) : undefined;
  return (
    <div id={id} className={s.repli} style={style}>
      <SectionPliableMobile
        resume={resume}
        toujoursOuvert={ouvert}
        numero={numero}
        enTete={
          <span data-mobile-seulement="" className={s.etiquette}>
            {kicker ? <span data-carte-surtitre="">{kicker}</span> : null}
            <span data-carte-titre="">{titre}</span>
          </span>
        }
      >
        {children}
      </SectionPliableMobile>
    </div>
  );
}
