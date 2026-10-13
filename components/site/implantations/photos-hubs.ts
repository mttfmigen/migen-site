import type { StaticImageData } from "next/image";

import bordeaux from "@/components/site/accueil/hubs/bordeaux.jpg";
import lille from "@/components/site/accueil/hubs/lille.jpg";
import lyon from "@/components/site/accueil/hubs/lyon.jpg";
import marseille from "@/components/site/accueil/hubs/marseille.jpg";
import nantes from "@/components/site/accueil/hubs/nantes.jpg";
import paris from "@/components/site/accueil/hubs/paris.jpg";
import strasbourg from "@/components/site/accueil/hubs/strasbourg.jpg";
import toulouse from "@/components/site/accueil/hubs/toulouse.jpg";

/**
 * LA PHOTO DE CHAQUE HUB, PARTAGÉE ENTRE L'ACCUEIL ET /implantations/.
 *
 * POURQUOI CE FICHIER EXISTE. Le colis du 13/10 dessine les dix hubs de
 * `/implantations/` en mosaïque de tuiles photo, là où la page servait un
 * tableau de panneaux anthracite. Les photos de ville existent déjà, elles
 * sont sous licence au dépôt et déjà servies par l'accueil
 * (`components/site/accueil/HubsAccueil.tsx`). Les dupliquer aurait créé deux
 * vérités : le jour où Mehdi change la photo de Lyon, il faut qu'elle change
 * aux deux endroits.
 *
 * HUIT HUBS SUR DIX ONT LEUR PHOTO. Metz et Dijon n'en ont pas : les deux
 * fichiers sous licence manquent encore, Mehdi doit les télécharger depuis le
 * compte Envato de Migen. Les pages sont choisies et inscrites dans
 * `docs/PHOTOS-VILLES-ENVATO.md` (la cathédrale de Metz par RossHelen, même
 * série que Nantes et Bordeaux ; Meursault en Côte-d'Or pour Dijon).
 *
 * CE QU'ON NE FAIT PAS, et c'est une règle du projet : leur poser une scène
 * d'usine en attendant. C'est précisément ce que faisait l'accueil, et c'est
 * ce qui a déclenché son retour du 12/10, « pour le hub de Metz je veux une
 * photo de la ville ». Une tuile sans photo se rend en panneau sombre, et le
 * manque se voit, ce qui est le but.
 *
 * LE CADRAGE. Le cadre d'une tuile est plus large que haut, les photos de
 * ville aussi : le centre convient. L'accueil, lui, a besoin d'un réglage par
 * photo parce que son cadre est en portrait. Les deux usages ne partagent donc
 * que l'image, pas son cadrage.
 */
export const PHOTO_DU_HUB: Readonly<Record<string, StaticImageData>> = {
  Lyon: lyon,
  Paris: paris,
  Lille: lille,
  Marseille: marseille,
  Strasbourg: strasbourg,
  Nantes: nantes,
  Toulouse: toulouse,
  Bordeaux: bordeaux,
};

/** Les hubs dont la photo de ville manque encore, nommés et non devinés. */
export const HUBS_SANS_PHOTO: readonly string[] = ["Metz", "Dijon"];
