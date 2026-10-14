import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { premierTexte } from "@/components/site/offre/ComplementsOffre";
import DerouleOffre from "@/components/site/offre/DerouleOffre";
import EtiquettePli from "@/components/site/offre/EtiquettePli";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
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
 * PAS DE RÉSUMÉ SOUS LE TITRE, comme la maquette (relecture du 15/10 sur Lyon,
 * Bordeaux, Rhône, Essonne et le hub) : son résumé est le premier paragraphe
 * ou la première puce du corps (dc.html L438, `teaseOf`), et le déroulé du
 * corpus est une liste NUMÉROTÉE, que `teaseOf` ne lit pas. Les intitulés des
 * étapes joints par « · » n'y apparaissent nulle part ; ils restent dans le
 * bloc déplié.
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
      >
        <DerouleOffre section={section} titre={TITRE_DEROULE} />
      </SectionPliableMobile>
    </div>
  );
}

/**
 * LE RÉSUMÉ DE « 02 L'offre » REPLIÉE, pour `PointsOffre.resume`, selon la règle
 * de la maquette (dc.html `teaseOf`) : le premier paragraphe de la section.
 *
 * - Une introduction ou une prose : `undefined`, `PointsOffre` la lit lui-même.
 * - Sinon le paragraphe que le corpus écrit APRÈS le tableau, rangé chez nous
 *   dans `complementOffre` (« Un déménagement de ligne… se prépare à J-90. »
 *   sur `/implantations/paris/essonne/`).
 * - Sinon RIEN (chaîne vide) : le tableau seul ne donne pas de résumé à la
 *   maquette (« L'offre » sans ligne sur Lyon et le Rhône), et les intitulés
 *   joints par « · », le repli de `PointsOffre`, n'y figurent nulle part.
 */
export function resumeOffre(offre: SectionOffre, complements?: readonly BlocComplement[]): string | undefined {
  if (offre.intro?.trim() || offre.prose?.length) return undefined;
  return premierTexte(complements) ?? "";
}
