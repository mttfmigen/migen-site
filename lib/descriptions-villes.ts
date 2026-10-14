/**
 * LA DESCRIPTION DE CHAQUE PHOTO DE VILLE SOUS LICENCE (`public/assets/villes/`).
 *
 * POURQUOI CE FICHIER EXISTE. Mesuré le 14/10 en production : les sept cartes
 * de hub de `/carriere/`, le bloc « Votre hub local » de huit pages ville, la
 * mosaïque de `/implantations/` et le second passage du rail de l'accueil
 * servaient ces photos avec `alt=""`. `altPhoto` ne connaissait que le
 * registre de `/assets/photos/`, et rendait la chaîne vide pour tout le reste.
 * Ce fichier est la source unique : `altPhoto` le consulte en second, et
 * `components/site/implantations/photos-hubs.ts` en tire le texte des photos
 * de hub importées par l'accueil, qui sont LES MÊMES OCTETS que
 * `hub-<ville>.jpg` (empreintes md5 identiques, vérifiées le 14/10).
 *
 * D'OÙ VIENT CHAQUE TEXTE, et rien n'est inventé :
 *  - les huit `hub-*.jpg` reprennent mot pour mot le texte que l'accueil
 *    posait déjà sur la même photo (`HubsAccueil.tsx`, avant le 14/10) ;
 *  - les dix `ville-*.jpg` traduisent le titre Envato inscrit dans
 *    `docs/PHOTOS-VILLES-ENVATO.md`, complété par ce que la photo montre, après
 *    l'avoir ouverte. Une photo qui ne montre pas sa ville ne la nomme pas : le
 *    port de la page Le Havre est un « cargo seaport » anonyme, celui de
 *    Dunkerque un « container harbor » anonyme, et la photo de la page Lorient
 *    est Vannes, comme le documente le même fichier.
 */
const DESCRIPTIONS_VILLES: Readonly<Record<string, string>> = {
  "hub-bordeaux.jpg": "Bordeaux, les quais de la Garonne",
  "hub-lille.jpg": "Façades du centre de Lille",
  "hub-lyon.jpg": "Lyon, la basilique de Fourvière au coucher du soleil",
  "hub-marseille.jpg": "Marseille, le Vieux-Port",
  "hub-nantes.jpg": "Vue aérienne de Nantes",
  "hub-paris.jpg": "Paris et la tour Eiffel",
  "hub-strasbourg.jpg": "Strasbourg, les Ponts couverts",
  "hub-toulouse.jpg": "Toulouse, la Garonne et la ville rose",
  "ville-dunkerque.jpg": "Portique portuaire de nuit, centrale électrique au loin",
  "ville-le-havre.jpg": "Terminal à conteneurs et portiques de chargement en bord de mer",
  "ville-lorient.jpg": "Vannes, maison à colombages et façade de la cathédrale",
  "ville-lyon.jpg": "Toits de Lyon et colline de Fourvière",
  "ville-nantes.jpg": "Nantes, façades des quais et dôme reflétés dans l'eau",
  "ville-orleans.jpg": "Orléans, façades et tour de la cathédrale",
  "ville-paris.jpg": "Tours de bureaux du quartier d'affaires de La Défense",
  "ville-quimper.jpg": "Quimper, maisons à colombages et flèches de la cathédrale",
  "ville-rouen.jpg": "Rouen, le Gros-Horloge et son beffroi",
  "ville-strasbourg.jpg": "Strasbourg, les Ponts couverts et la cathédrale au loin",
};

/**
 * La description de la photo de ville désignée par `chemin`, ou `null` si le
 * chemin ne désigne pas une photo de `/assets/villes/`. Accepte l'adresse
 * brute comme celle que l'optimiseur de Next encode dans son paramètre `url`.
 */
export function descriptionVille(chemin: string | null | undefined): string | null {
  if (!chemin) return null;
  let brut = chemin;
  try {
    brut = decodeURIComponent(chemin);
  } catch {
    // Chemin déjà décodé, ou mal encodé : on travaille sur l'original.
  }
  const fichier = brut.split("/assets/villes/")[1]?.split(/[?&#]/)[0];
  return fichier ? (DESCRIPTIONS_VILLES[fichier] ?? null) : null;
}
