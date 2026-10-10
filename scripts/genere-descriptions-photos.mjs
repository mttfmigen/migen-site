#!/usr/bin/env node
/**
 * Fabrique `lib/descriptions-photos.ts` a partir de `registre.json`.
 *
 * Pourquoi un fichier genere plutot qu'une lecture du registre : les composants
 * qui affichent une photo sont pour partie des composants client, et
 * `lib/photos-autorisees.ts` lit le disque avec `node:fs`, ce qui ne traverse
 * pas la frontiere client. Un objet simple, commite, se laisse importer partout.
 *
 * A relancer apres toute modification du registre.
 */
import { readFile, writeFile } from 'node:fs/promises'

const reg = JSON.parse(await readFile('public/assets/photos/registre.json', 'utf8'))
const photos = reg.photos ?? reg
const sans = photos.filter(p => !(p.description ?? '').trim())
if (sans.length) {
  console.error(`${sans.length} photo(s) sans description au registre, impossible de generer :`)
  sans.slice(0, 10).forEach(p => console.error(`  ${p.fichier}`))
  process.exit(1)
}
const lignes = photos
  .slice()
  .sort((a, b) => a.fichier.localeCompare(b.fichier))
  .map(p => `  ${JSON.stringify(p.fichier)}: ${JSON.stringify(p.description.trim())},`)

await writeFile('lib/descriptions-photos.ts', `/**
 * CE FICHIER EST GENERE. Ne pas l'editer a la main.
 * Source : public/assets/photos/registre.json
 * Regeneration : node scripts/genere-descriptions-photos.mjs
 *
 * La description de chaque photo, telle qu'elle a ete ecrite au registre.
 * Elle devient le texte alternatif de l'image : une photo posee sans
 * description est muette pour un lecteur d'ecran et pour un moteur.
 */

const DESCRIPTIONS: Record<string, string> = {
${lignes.join('\n')}
};

/**
 * La description de la photo designee par \`chemin\`, ou \`null\` si le chemin
 * ne designe pas une photo du registre (un logo, une image de la maquette).
 *
 * Accepte aussi bien "/assets/photos/x.jpg" que l'adresse optimisee par Next,
 * ou le chemin porte une seule fois, encode, dans le parametre \`url\`.
 */
export function descriptionPhoto(chemin: string | null | undefined): string | null {
  if (!chemin) return null;
  let brut = chemin;
  try {
    brut = decodeURIComponent(chemin);
  } catch {
    // Chemin deja decode, ou mal encode : on travaille sur l'original.
  }
  const fichier = brut.split("/assets/photos/")[1]?.split(/[?&#]/)[0];
  if (!fichier) return null;
  return DESCRIPTIONS[fichier] ?? null;
}

/**
 * Le texte alternatif a poser sur une image de contenu : la description du
 * registre quand elle existe, sinon la chaine vide, qui annonce correctement
 * une image decorative plutot que de laisser un lecteur d'ecran enoncer le
 * nom du fichier.
 */
export function altPhoto(chemin: string | null | undefined): string {
  return descriptionPhoto(chemin) ?? "";
}

/** Le nombre de photos decrites, pour les portes. */
export const NOMBRE_DECRITES = ${photos.length};
`, 'utf8')
console.log(`lib/descriptions-photos.ts genere : ${photos.length} descriptions`)
