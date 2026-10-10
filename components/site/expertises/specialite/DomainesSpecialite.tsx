import Image from "next/image";
import type { CSSProperties } from "react";

import {
  LARGEUR,
  SECTION,
  SURTITRE,
  TITRE2,
} from "@/components/site/blocs/habillage";
import { numerote } from "@/components/site/offre/texte-offre";
import type { CarteDomaineSpecialite } from "@/types/specialite";

import styles from "./PageSpecialite.module.css";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Écran « 02 Domaines » du gabarit 05 Spécialité, relevé le 08/10 sur les trois
 * captures qui le rendent (`maquette/rendu/expertises--types-de-maintenance--`
 * `maintenance-conditionnelle`, `-preventive`, `-previsionnelle`, squelettes
 * identiques) et sur sa source, `MigenExpertise.dc.html` lignes 181 à 199.
 *
 * Surtitre « Nos domaines », H2 de la page (« Les chiffres Migen »), puis une
 * grille de cartes photographiques sombres en quatre colonnes, la première sur
 * deux colonnes et deux rangées (règles `.mgx-dom` de la source, l. 15-19,
 * vérifiées sur la maquette vivante le 08/10 : 553 x 474 px, titre à 32px,
 * phrase affichée ; les suivantes à 269,5 x 230 px, phrase cachée).
 *
 * TROU DÉCLARÉ, ET VOULU : la capture fait de chaque carte un lien
 * `href="#"` terminé par « Voir l'expertise → ». Aucune expertise n'est visée
 * (la maquette a lu la liste des chiffres comme une liste de domaines). Poser
 * le lien serait une cible morte, poser la pastille sans lien un bouton qui ne
 * répond pas : la carte se rend sans l'un ni l'autre, et sans le survol de
 * carte cliquable (`translateY(-4px)`) qui irait avec. Même règle que
 * `expertises/Domaines.tsx` : sans chemin, pas de lien.
 *
 * LA PHOTO passe par `next/image` (CLAUDE.md §6) au lieu du fond CSS de la
 * capture, même arbitrage que `SecteursDomaine` ; le fichier est celui que la
 * capture nomme, porté par la donnée.
 */

export interface ProprietesDomainesSpecialite {
  titre: string;
  cartes: readonly CarteDomaineSpecialite[];
}

const ENTETE: CSSProperties = { marginBottom: 30 };

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
  gridAutoRows: "minmax(230px,auto)",
  gap: 14,
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  minHeight: 230,
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgb(28, 27, 25)",
  color: "#fff",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const PHOTO: CSSProperties = {
  objectFit: "cover",
  background: "rgb(58, 58, 60)",
  filter: "saturate(var(--sat)) brightness(.8)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.94) 0%,rgba(18,17,16,.5) 55%,rgba(18,17,16,.1) 100%)",
};

const CORPS: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "22px 24px",
};

const NUMERO: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgb(255, 124, 60)",
};

const NOM: CSSProperties = {
  font: "600 calc(20px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.03em",
  color: "#fff",
};

const VALEUR: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.8)",
  maxWidth: "46ch",
};

const PHRASE: CSSProperties = {
  display: "none",
  font: "400 14.5px/1.6 var(--fb)",
  color: "rgba(255,255,255,.72)",
  maxWidth: "52ch",
};

export default function DomainesSpecialite({
  titre,
  cartes,
}: ProprietesDomainesSpecialite) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div style={SURTITRE}>Nos domaines</div>
          <h2 style={TITRE2}>{titre}</h2>
        </div>
        <div className={styles.domaines} style={GRILLE}>
          {cartes.map((carte, rang) => (
            <div key={`${rang}-${carte.valeur}`} style={CARTE}>
              <Image
                src={carte.photo}
                alt={altPhoto(carte.photo)}
                fill
                sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 560px"
                style={PHOTO}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CORPS}>
                <span style={NUMERO}>{numerote(rang)}</span>
                {/* `dm.name`, VIDE sur les trois captures. L'élément reste :
                    il porte l'un des écarts de 8px de la colonne. */}
                <span className={styles.nomDomaine} style={NOM} />
                <span style={VALEUR}>{carte.valeur}</span>
                {carte.texte ? (
                  <span className={styles.phraseDomaine} style={PHRASE}>
                    {carte.texte}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
