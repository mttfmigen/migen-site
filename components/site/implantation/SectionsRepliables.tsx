import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { premierTexte } from "@/components/site/offre/ComplementsOffre";
import DerouleOffre, { accrocheDuDeroule } from "@/components/site/offre/DerouleOffre";
import EtiquettePli from "@/components/site/offre/EtiquettePli";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import { accrocheDeLOffre } from "@/components/site/offre/PointsOffre";
import type { SectionDeroule, SectionOffre } from "@/types/contenu";
import type { BlocComplement } from "@/types/offre";

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
 * (`blocPliablePartage`) et le rendu de bureau ne bouge pas d'un pixel.
 *
 * L'ACCROCHE DE LA V3 SOUS LE TITRE (16/10) : la première étape du corpus,
 * « Le premier contact : vous décrivez la panne ou le besoin… »
 * (`accrocheDuDeroule`). La v2 ne lisait pas les listes numérotées et la
 * carte restait muette (relecture du 15/10 sur Lyon, Bordeaux, Rhône, Essonne
 * et le hub) ; la V3 les lit.
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

export function DerouleRepliable({ section }: { section: SectionDeroule }) {
  return (
    <div className={`${stylesOffre.blocPliablePartage} ${stylesVille.repliHorsSection}`}>
      <SectionPliableMobile
        /* « 03 Le déroulé » : le titre de la carte de la maquette mobile. */
        enTete={<EtiquettePli titre="Le déroulé" />}
        resume={accrocheDuDeroule(section)}
      >
        <DerouleOffre section={section} titre={TITRE_DEROULE} />
      </SectionPliableMobile>
    </div>
  );
}

/**
 * LE RÉSUMÉ DE « 02 L'offre » REPLIÉE, pour `PointsOffre.resume`, selon la règle
 * de la V3 (`accrocheDeLOffre`) : l'introduction, sinon la première cellule
 * du tableau, sinon ce que le corpus écrit APRÈS le tableau, rangé chez nous
 * dans `complementOffre`. La v2 ne lisait pas les tableaux : « L'offre »
 * restait sans accroche sur Lyon et le Rhône, et Essonne annonçait le
 * paragraphe d'après tableau (« Un déménagement de ligne… »).
 */
export function resumeOffre(offre: SectionOffre, complements?: readonly BlocComplement[]): string | undefined {
  return accrocheDeLOffre(offre, [premierTexte(complements)]);
}
