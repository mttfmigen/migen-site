/**
 * Produit `lib/cadrage-photos.ts` depuis le registre des photos.
 *
 *   node scripts/produit-cadrage-photos.mjs
 *
 * POURQUOI. Le registre déclare l'`orientation` de chaque photo, juste sur les
 * 389 entrées, et AUCUNE ligne du site ne lisait ce champ. Résultat mesuré le
 * 09/10 : 137 des 148 emplacements de photo portrait étaient dans un cadre
 * couché, en `objectFit: cover` et sans `objectPosition`, donc recadrés sur
 * leur bande médiane. 123 placements perdaient la moitié de l'image ou plus,
 * sur 92 pages, et le cadrage tombait sur le torse au lieu du visage.
 *
 * Décision de Mehdi le 09/10 : « tu cadres ». La photo portrait garde donc sa
 * place, et c'est son cadrage qui se règle.
 *
 * Ce fichier est GÉNÉRÉ, jamais édité à la main : le registre est la seule
 * source. Le régénérer après tout changement de la banque.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const registre = JSON.parse(readFileSync(join(RACINE, "public/assets/photos/registre.json"), "utf8"));
const entrees = Array.isArray(registre) ? registre : (registre.photos ?? Object.values(registre));

const portraits = entrees
  .filter((e) => e.orientation === "portrait")
  .map((e) => e.fichier)
  .sort();

const source = `/* FICHIER GÉNÉRÉ par scripts/produit-cadrage-photos.mjs. Ne pas éditer. */

/**
 * Le cadrage d'une photo dans son emplacement.
 *
 * LE DÉFAUT QUE CE MODULE CORRIGE, mesuré le 09/10/2026. Le registre des photos
 * déclare l'orientation de chacune, et aucune ligne du site ne lisait ce champ :
 * 137 des 148 emplacements de photo portrait étaient posés dans un cadre couché,
 * en \`objectFit: cover\` sans \`objectPosition\`, donc recadrés sur leur bande
 * MÉDIANE. 123 placements perdaient la moitié de l'image ou plus, sur 92 pages,
 * et sur une photo de personne la bande médiane tombe sur le torse, pas sur le
 * visage. L'emplacement le plus destructeur, \`offre/ReferencesOffre.tsx\`, porte
 * à lui seul 951 placements dans un cadre de ratio 2,13.
 *
 * LE REMÈDE, décidé par Mehdi le 09/10 (« tu cadres »), ne retire aucune photo :
 * une photo PORTRAIT dans un cadre COUCHÉ est cadrée sur le haut de l'image.
 * 30 % et non 0 % : à 0 % le sujet est collé au bord haut, ce qui coupe les
 * pieds d'un plan large et donne une composition sans air. 30 % garde le visage
 * et le buste dans le cadre sur les trois quarts des prises de vue de la banque,
 * qui sont des plans taille ou poitrine.
 *
 * Une photo paysage dans un cadre couché n'est pas concernée : son recadrage
 * est marginal, et le centre reste le meilleur choix.
 */

/** Les ${portraits.length} photos de la banque dont la hauteur dépasse la largeur. */
const PORTRAITS: ReadonlySet<string> = new Set(${JSON.stringify(portraits, null, 2)});

/** Le nom de fichier d'un chemin de photo, les paramètres de requête écartés. */
function fichierDe(src: string): string {
  const sansRequete = src.split("?")[0] ?? src;
  return sansRequete.split("/").pop() ?? sansRequete;
}

/** Une photo de la banque est-elle plus haute que large ? */
export function estPortrait(src: string | undefined): boolean {
  return typeof src === "string" && PORTRAITS.has(fichierDe(src));
}

/**
 * L'\`objectPosition\` à poser sur une photo, ou \`undefined\` quand le centre
 * convient. \`ratioCadre\` est la largeur du cadre divisée par sa hauteur.
 *
 * Le seuil de 1,2 n'est pas arbitraire : en dessous, le cadre est à peu près
 * aussi haut que large et un portrait n'y perd presque rien.
 */
export function cadragePhoto(src: string | undefined, ratioCadre: number): string | undefined {
  return estPortrait(src) && ratioCadre >= 1.2 ? "50% 30%" : undefined;
}
`;

writeFileSync(join(RACINE, "lib/cadrage-photos.ts"), source, "utf8");
console.log(`lib/cadrage-photos.ts produit : ${portraits.length} photos portrait sur ${entrees.length} entrees`);
