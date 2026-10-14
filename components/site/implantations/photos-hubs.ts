import type { StaticImageData } from "next/image";

import { altPhoto } from "@/lib/descriptions-photos";

import bordeaux from "@/components/site/accueil/hubs/bordeaux.jpg";
import dijon from "@/components/site/accueil/hubs/dijon.jpg";
import lille from "@/components/site/accueil/hubs/lille.jpg";
import lyon from "@/components/site/accueil/hubs/lyon.jpg";
import marseille from "@/components/site/accueil/hubs/marseille.jpg";
import metz from "@/components/site/accueil/hubs/metz.jpg";
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
 * ET LES DEUX VÉRITÉS AVAIENT DÉJÀ DIVERGÉ. Mesure du 14/10 en production :
 * `/implantations/` rendait bien Metz et Dijon en panneau sombre, l'accueil
 * leur servait deux scènes d'usine, `mq-dcd9cac6ffbf.jpg` (une cimenterie)
 * et `x-cablerie.jpg` (un métier à tisser), sous les textes alternatifs
 * « Site industriel en Lorraine » et « Atelier industriel en Bourgogne » que
 * rien ne documentait. Depuis le 14/10 l'accueil lit CE fichier : il ne garde
 * plus sa propre liste d'imports, et la divergence ne peut plus revenir.
 *
 * LES DIX HUBS ONT LEUR PHOTO DEPUIS LE 14/10. Metz et Dijon sont arrivés en
 * dernier, téléchargés sous licence depuis le compte Envato de Migen (projet
 * « migen.fr ») : la cathédrale de Metz par RossHelen, même série que Nantes
 * et Bordeaux, et pour Dijon des vignes de MEURSAULT, en Côte-d'Or, à 25 km :
 * leur texte alternatif ne dit donc jamais « Dijon ». Détail dans
 * `docs/PHOTOS-VILLES-ENVATO.md`.
 *
 * CE QU'ON NE FAIT PAS, et c'est une règle du projet : poser une scène d'usine
 * sur un hub dont la photo de ville manque. C'est ce que faisait l'accueil, et
 * c'est ce qui a déclenché son retour du 12/10, « pour le hub de Metz je veux
 * une photo de la ville ». Un hub ajouté demain sans photo se rend en panneau
 * sombre, et le manque se voit, ce qui est le but.
 *
 * LE CADRAGE RESTE PROPRE À CHAQUE USAGE, et c'est délibéré. La tuile de
 * `/implantations/` est plus large que haute, comme les photos de ville : le
 * centre convient. La carte de l'accueil fait 300x400, donc un cadre PORTRAIT
 * dans lequel une photo paysage déborde horizontalement : elle a besoin d'un
 * réglage par photo, déclaré dans `HubsAccueil.tsx`. Les deux usages partagent
 * l'image, jamais son cadrage.
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
  Metz: metz,
  Dijon: dijon,
};

/**
 * LE TEXTE ALTERNATIF DE CHAQUE PHOTO DE HUB, lu et non recopié.
 *
 * Les dix fichiers de `components/site/accueil/hubs/` sont les mêmes octets
 * que `public/assets/villes/hub-<ville>.jpg` (md5 identiques, 14/10) : leur
 * description vit donc à UN endroit, `lib/descriptions-villes.ts`, et sert
 * l'accueil, la mosaïque de `/implantations/` et les cartes de `/carriere/`.
 * Mesuré le 14/10 en production : la mosaïque et le second passage du rail de
 * l'accueil les servaient avec `alt=""`, seize photos muettes.
 */
export const ALT_DU_HUB: Readonly<Record<string, string>> = Object.fromEntries(
  Object.keys(PHOTO_DU_HUB).map((ville) => [
    ville,
    altPhoto(`/assets/villes/hub-${ville.toLowerCase()}.jpg`),
  ]),
);

/**
 * Les hubs dont la photo de ville manque, nommés et non devinés. Vide depuis
 * le 14/10 : Metz et Dijon y étaient jusqu'à la livraison de leurs fichiers.
 */
export const HUBS_SANS_PHOTO: readonly string[] = [];
