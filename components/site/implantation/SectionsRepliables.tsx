import type { CSSProperties } from "react";

import { resumeDe } from "@/components/site/blocs/resume-de-section";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import type { SectionDeroule } from "@/types/contenu";

import stylesVille from "./PageVille.module.css";

/**
 * « 05 Déroulé » REPLIÉ AU TÉLÉPHONE, SANS ÊTRE MODIFIÉ (G1), pour le gabarit
 * ville et le hub `/implantations/`. Mesuré à 390 px le 14/10 : 1 788 px déplié
 * sur `/implantations/lille/`, 1 811 sur le gabarit 06. La maquette mobile v2
 * en fait « 03 Le déroulé », une carte repliée (dc.html L451, `nOpen = 1`).
 *
 * LE BLOC EST ENVELOPPÉ, PAS RÉÉCRIT : `DerouleOffre` appartient au lot offre
 * et sert cinq gabarits. Le motif est celui de `offre/PointsOffre.tsx` : la
 * bascule porte une ÉTIQUETTE (`etiquettePli`, sous 880 px seulement, effacée
 * une fois le bloc ouvert) qui répète le sur-titre et le H2 de la carte
 * d'en-tête ; au-dessus de 880 px la bascule entière disparaît
 * (`blocPliablePartage`) et le rendu de bureau ne bouge pas d'un pixel. Le
 * résumé joint les intitulés des étapes par « · », comme la maquette.
 *
 * LE TITRE EST PASSÉ EXPLICITEMENT, et c'est le défaut de `DerouleOffre`
 * lui-même (capture des villes) : l'étiquette et le H2 ne peuvent pas diverger.
 *
 * LA RÉASSURANCE DE BUREAU N'EST PAS REPLIÉE, et c'est une limite et non un
 * oubli : `scripts/verifie-blocs-pliables.mjs` exige un titre de niveau dans
 * chaque bloc replié, et `Reassurance` n'en porte aucun (deux sur-titres de
 * carte). La replier imposerait d'écrire un intertitre : c'est à Mehdi.
 */
const TITRE_DEROULE = "Un appel. Un plan. Une ligne qui repart.";

/* Mêmes valeurs que l'étiquette de `offre/PointsOffre.tsx`. */
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

export function DerouleRepliable({ section }: { section: SectionDeroule }) {
  return (
    <div className={`${stylesOffre.blocPliablePartage} ${stylesVille.repliHorsSection}`}>
      <SectionPliableMobile
        enTete={
          <span data-mobile-seulement="" className={stylesOffre.etiquettePli}>
            <span style={ETIQUETTE_SURTITRE}>Notre méthode</span>
            <span style={ETIQUETTE_TITRE}>{TITRE_DEROULE}</span>
          </span>
        }
        resume={resumeDe(section.etapes.map((etape) => etape.titre))}
      >
        <DerouleOffre section={section} titre={TITRE_DEROULE} />
      </SectionPliableMobile>
    </div>
  );
}
