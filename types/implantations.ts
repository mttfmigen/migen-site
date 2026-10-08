/**
 * Forme du contenu du hub `/implantations/`, gabarit « 10 Hub de rubrique ».
 *
 * REFAITE LE 08/10 contre la référence : `maquette/rendu/implantations.html`,
 * 17 écrans. C'est la suite d'écrans d'une VILLE (`types/implantation.ts`,
 * `PageVille`), écran pour écran, moins « Hub local », plus UN écran propre,
 * « Nos villes » (`data-screen-label`), entre la bande d'appel des références
 * et les questions. D'où la forme : celle de la ville, sans `hubLocal`, plus
 * `villes`. L'ancien gabarit (cartes d'agences, panneau international, carte
 * de France réservée) venait d'un dessin antérieur à la capture.
 *
 * Le discriminant reste « implantations » : c'est lui que la route lit pour
 * passer par `PageImplantations`, seule à rendre « Nos villes ».
 */

import type { ContenuVille, ZoneHubLocal } from "./implantation";

/** Une carte de hub : le lien sombre du hub, puis ses zones en pastilles. */
export interface HubNosVilles {
  hub: string;
  href: string;
  zones?: ZoneHubLocal[];
}

/** Une carte « Au-delà des hubs » : la région, puis ses villes. Le compte « 7 villes » se déduit de la liste. */
export interface RegionNosVilles {
  region: string;
  villes: ZoneHubLocal[];
}

/** L'écran « Nos villes ». Les titres sont copiés de la capture : leurs nombres ne se déduisent pas des listes. */
export interface NosVilles {
  /** « Sept hubs, 74 bassins couverts ». */
  titre: string;
  chapeau: string;
  hubs: HubNosVilles[];
  /** « 48 villes couvertes par nos techniciens itinérants ». */
  itinerantsTitre: string;
  itinerantsTexte: string;
  regions: RegionNosVilles[];
}

/** Les champs de la ville que les écrans du hub lisent, plus « Nos villes ». */
export interface ContenuImplantations
  extends Pick<
    ContenuVille,
    | "pastille"
    | "chapeau"
    | "actions"
    | "mention"
    | "appelBouton"
    | "formulaireHeroTitre"
    | "formulaireHeroMention"
    | "chiffres"
    | "brefBande"
    | "brefBouton"
    | "brefMention"
    | "sections"
  > {
  gabarit: "implantations";
  villes?: NosVilles;
}

/** Lu sur un `jsonb`, donc sur de l'`unknown` : on regarde le discriminant. */
export function estImplantations(contenu: unknown): contenu is ContenuImplantations {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuImplantations).gabarit === "implantations"
  );
}
