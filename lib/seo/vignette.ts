import { photoDeLaPage } from "@/lib/photo-par-page";
import { urlImage } from "@/lib/seo/url";

/**
 * LA VIGNETTE DE PARTAGE, EN UN SEUL ENDROIT.
 *
 * MESURE DU 12/10, avant ce fichier : `og:image` était absente des 248 adresses
 * de `maquette/contenu/site/index.json`, en ligne comme en local. Tout partage
 * d'un lien migen.fr sur LinkedIn, WhatsApp, Slack ou Teams sortait sans image,
 * c'est-à-dire en bandeau de texte gris. `og:title`, `og:description` et
 * `og:url`, elles, étaient déjà posées partout : rien à y refaire.
 *
 * POURQUOI LA MISE EN PAGE RACINE NE SUFFISAIT PAS. Next ne fusionne PAS les
 * champs imbriqués des métadonnées : un `openGraph` déclaré par une page
 * REMPLACE entièrement celui de la mise en page, il ne s'y ajoute pas. Or
 * chaque page du site en déclare un, via `metadonneesSeo` ou en clair. Poser
 * l'image uniquement dans `app/layout.tsx` n'aurait donc rien changé aux 248
 * adresses mesurées, et la correction aurait eu l'air faite sans l'être.
 * L'image est donc résolue ICI, et les deux chemins l'appellent.
 *
 * L'ORDRE DE PRIORITÉ, du plus spécifique au plus général :
 *   1. `seo.og_image`, la colonne prévue pour ça. Vide partout aujourd'hui,
 *      mais c'est la main de l'éditeur et elle doit rester la plus forte ;
 *   2. la photo de couverture de la page (`lib/photo-par-page.ts`), celle que
 *      la page sert elle-même. 231 pages en ont une : le partage montre alors
 *      l'image que le visiteur verra en arrivant ;
 *   3. la vignette par défaut ci-dessous, pour le reste.
 */

/**
 * La vignette par défaut : un technicien Migen sur un site client.
 *
 * CHOIX, et il tient en deux raisons. D'abord c'est une VRAIE photo Migen, pas
 * une image de banque : le t-shirt « migen x SAVOYE » y est lisible, et
 * `lib/photos-autorisees.ts` dit déjà pourquoi ces dix photos comptent (« de
 * vrais techniciens Migen en t-shirt migen, ce qu'aucune photo de banque ne
 * fait »). La vignette de partage est la seule image que l'extérieur voit du
 * site : c'est la dernière où se contenter d'une banque d'images. Ensuite elle
 * tient le recadrage : les réseaux rognent au format 1,91:1, ce qui retire
 * 129 px en haut et autant en bas d'un 1800 × 1200 ; le technicien et le
 * logo restent largement dans le cadre.
 *
 * Aucune image n'a été fabriquée pour l'occasion : celle-ci existe déjà dans le
 * dépôt, elle est servie par la page d'accueil et par le hub Secteurs.
 */
export const VIGNETTE_PAR_DEFAUT = {
  chemin: "/assets/web/sv-convoyeur.jpg",
  largeur: 1800,
  hauteur: 1200,
  type: "image/jpeg",
} as const;

/** Le type MIME d'un fichier image, déduit de son extension. */
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

function typeImage(chemin: string): string | undefined {
  const point = chemin.lastIndexOf(".");
  if (point < 0) return undefined;
  return TYPES[chemin.slice(point).toLowerCase()];
}

/**
 * Une image d'`openGraph`, au format attendu par Next.
 *
 * `width` et `height` sont facultatifs parce qu'ils ne sont connus que pour la
 * vignette par défaut, mesurée une fois dans l'en-tête du fichier. Les 192
 * photos de couverture ont chacune leurs dimensions propres, et les déclarer
 * demanderait une table générée de plus, à maintenir en parallèle de
 * `photo-par-page.ts`. Elles sont donc omises plutôt que devinées : un robot
 * qui ne les lit pas télécharge l'image et les mesure lui-même, alors qu'un
 * chiffre faux produit une vignette rognée de travers.
 */
export interface ImagePartage {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

/** La vignette par défaut, absolue, avec ses dimensions et son type. */
export function vignetteParDefaut(): ImagePartage[] {
  return [
    {
      url: urlImage(VIGNETTE_PAR_DEFAUT.chemin),
      width: VIGNETTE_PAR_DEFAUT.largeur,
      height: VIGNETTE_PAR_DEFAUT.hauteur,
      type: VIGNETTE_PAR_DEFAUT.type,
    },
  ];
}

/**
 * La vignette de partage de `chemin`, toujours en adresse absolue.
 *
 * `ogImage` est la valeur de `seo.og_image` quand la page en a une.
 */
export function vignetteDeLaPage(
  chemin: string,
  ogImage?: string | null,
): ImagePartage[] {
  if (ogImage) {
    return [{ url: urlImage(ogImage), type: typeImage(ogImage) }];
  }

  const couverture = photoDeLaPage(chemin);
  if (couverture) {
    return [{ url: urlImage(couverture), type: typeImage(couverture) }];
  }

  return vignetteParDefaut();
}
