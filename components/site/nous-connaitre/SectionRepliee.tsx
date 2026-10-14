import type { ReactNode } from "react";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

import s from "./mobile-apropos.module.css";

/**
 * UNE SECTION DES PAGES NATIVES, REPLIÉE SUR TÉLÉPHONE, INCHANGÉE SUR BUREAU.
 *
 * Partagée par les six pages natives du lot « à propos » : /nous-connaitre/,
 * /valeurs/, /rse/, /partenaires/, /marques/, /a-propos/equipe/. La maquette
 * mobile v2 les sert depuis `maquette/mobile-v2/maquette/mobile-native-data.js`
 * au gabarit 01 : sections numérotées en `<details>`, les deux premières
 * ouvertes, les suivantes repliées (dc.html `nOpen = g === "01" ? 2 : …`).
 * Seules les sections que la maquette REPLIE passent par ici : une section
 * ouverte reste telle quelle, son titre de bureau suffit.
 *
 * LE MOTIF EST CELUI DES PAGES MÉTIER, que `scripts/verifie-titres-replies.mjs`
 * prend pour référence :
 *   · la bascule porte une ÉTIQUETTE, deux `<span>` marqués
 *     `data-mobile-seulement`, et non un titre : la section garde son vrai
 *     `<h2>` à sa place et à sa taille ;
 *   · cet en-tête d'origine est marqué `data-titre-bureau` et s'efface sous
 *     880 px, où l'étiquette le remplace ; au-dessus, c'est la bascule qui
 *     disparaît (`mobile-apropos.module.css`). Jamais deux fois le même titre ;
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
  /** Le sur-titre de la section, tel que la page l'écrit. */
  kicker?: string;
  /** Le titre de la section, tel que la page l'écrit. */
  titre: string;
  /** Les intitulés du contenu, joints par `resumeDe`, montrés replié. */
  resume?: string;
  children: ReactNode;
}

export default function SectionRepliee({
  kicker,
  titre,
  resume,
  children,
}: SectionReplieeProps) {
  return (
    <div className={s.repli}>
      <SectionPliableMobile
        resume={resume}
        enTete={
          <span data-mobile-seulement="" className={s.etiquette}>
            {kicker ? <span className={s.kicker}>{kicker}</span> : null}
            <span className={s.titre}>{titre}</span>
          </span>
        }
      >
        {children}
      </SectionPliableMobile>
    </div>
  );
}
