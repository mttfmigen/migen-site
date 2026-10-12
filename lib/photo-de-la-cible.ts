import { photoDeLaPage } from "@/lib/photo-par-page";

/**
 * REMPLACE L'IMAGE D'UNE CARTE PAR CELLE DE LA PAGE QU'ELLE OUVRE.
 *
 * POURQUOI. Mehdi, le 12/10 : « les photos ne correspondent pas aux photos du
 * cas », « les bento Offres et Secteurs ne changent pas d'image », « les
 * photos sont toujours les mêmes que sur les autres pages ».
 *
 * Mesure du même jour : 46 images venaient de `/assets/web/`, écrites en dur
 * dans les données des composants. `ph-hero-raffinerie.jpg`,
 * `ph-technicien.jpg`, `team-duo.jpg` et `team-grind-front.jpg` apparaissaient
 * chacune sur QUATRE des six pages de hub. La répartition du registre ne les
 * voyait pas : elle ne travaille que sur les fiches de contenu.
 *
 * LA RÈGLE, la plus simple qui soit juste : une carte vers le cas SUEZ montre
 * la photo de la page SUEZ. La cohérence est acquise par construction, et elle
 * suivra d'elle-même toute redistribution ultérieure.
 *
 * CE QUI NE BOUGE PAS. L'image déclarée reste le repli quand la page cible ne
 * sert aucune photo du registre : mieux vaut celle de la maquette qu'un trou.
 * Et une carte sans `href` n'est jamais touchée : sans cible, pas de règle.
 */

/** Les clés qui portent une image dans les données de ce dépôt. */
const CLES_IMAGE = new Set(["photo", "img", "image", "visuel"]);

/** Les clés qui portent la cible d'une carte. */
const CLES_LIEN = new Set(["href", "lien", "url"]);

/**
 * Descend dans `valeur` et, partout où un objet porte à la fois une cible et
 * une image, remplace l'image par celle de la page visée.
 *
 * Rend une NOUVELLE structure : les données déclarées ne sont jamais mutées,
 * elles restent lisibles telles qu'écrites et les portes peuvent les comparer
 * à la maquette.
 */
export function photosDesCibles<T>(valeur: T): T {
  if (Array.isArray(valeur)) {
    return valeur.map((x) => photosDesCibles(x)) as unknown as T;
  }
  if (valeur === null || typeof valeur !== "object") return valeur;

  const source = valeur as Record<string, unknown>;
  const copie: Record<string, unknown> = {};
  for (const [cle, v] of Object.entries(source)) copie[cle] = photosDesCibles(v);

  const cleLien = Object.keys(source).find(
    (k) => CLES_LIEN.has(k) && typeof source[k] === "string",
  );
  const cleImage = Object.keys(source).find(
    (k) => CLES_IMAGE.has(k) && typeof source[k] === "string",
  );
  if (cleLien && cleImage) {
    const cible = photoDeLaPage(source[cleLien] as string);
    if (cible) copie[cleImage] = cible;
  }
  return copie as unknown as T;
}
