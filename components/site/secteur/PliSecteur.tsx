import type { ReactNode } from "react";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";

import { ETIQUETTE_SURTITRE, ETIQUETTE_TITRE } from "./habillage-secteur";
import styles from "./PageSecteur.module.css";

/**
 * UN ÉCRAN DE LA PAGE SECTEUR, REPLIÉ AU TÉLÉPHONE, motif « Blocs communs
 * (pliables) » de la maquette mobile v2, à l'identique de `offre/PointsOffre`.
 *
 * - L'étiquette (surtitre et titre DE L'ÉCRAN, jamais une phrase rédigée)
 *   n'existe que sous 881 px ; la bascule entière est retirée du bureau par
 *   `blocPliablePartage` : au-dessus de 880 px, rien ne change.
 * - `SectionPliableMobile` rend le bloc ouvert et ne le referme qu'au
 *   chargement, sous 880 px : tout le texte reste dans le HTML servi.
 *
 * `pleinePage` : l'enveloppe entoure une `<section>` ENTIÈRE d'un composant
 * partagé (offre, domaine), qu'on ne peut pas replier de l'intérieur depuis ce
 * gabarit. Sa bascule prend alors la gouttière et la respiration d'une
 * section (`PageSecteur.module.css`, `.pliPleinePage`), et un garde-fou y
 * efface l'enveloppe si le composant se replie déjà lui-même.
 *
 * `titreDeSection` : l'écran replié n'a AUCUN titre à lui (logos et
 * réassurance n'ont que des surtitres). Sans titre, le bloc replié serait un
 * bloc perdu (`scripts/verifie-blocs-pliables.mjs`) : l'étiquette porte alors
 * le seul `<h2>`, celui que le visiteur lit sur la bascule. Les autres écrans
 * ont leur `<h2>` dans leur corps ; l'étiquette n'en ajoute pas un second.
 */
export interface ProprietesPliSecteur {
  surtitre?: string;
  titre?: string;
  /** Les intitulés du bloc joints par « · » (`resumeDe`), ou rien. */
  resume?: string;
  pleinePage?: boolean;
  titreDeSection?: boolean;
  children: ReactNode;
}

export default function PliSecteur({
  surtitre,
  titre,
  resume,
  pleinePage = false,
  titreDeSection = false,
  children,
}: ProprietesPliSecteur) {
  const Titre = titreDeSection ? "h2" : "span";
  return (
    <div className={`${stylesOffre.blocPliablePartage}${pleinePage ? ` ${styles.pliPleinePage}` : ""}`}>
      <SectionPliableMobile
        enTete={
          <span data-mobile-seulement="" className={stylesOffre.etiquettePli}>
            {surtitre ? <span style={ETIQUETTE_SURTITRE}>{surtitre}</span> : null}
            {titre ? (
              <Titre className={styles.titrePli} style={ETIQUETTE_TITRE}>
                {titre}
              </Titre>
            ) : null}
          </span>
        }
        resume={resume}
      >
        {children}
      </SectionPliableMobile>
    </div>
  );
}
