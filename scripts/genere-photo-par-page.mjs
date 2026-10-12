#!/usr/bin/env node
/**
 * Fabrique `lib/photo-par-page.ts` : la photo de couverture de chaque page.
 *
 * POURQUOI. Mehdi, le 12/10 : « bloc NOS DERNIÈRES RÉALISATIONS, les photos ne
 * correspondent pas aux photos du cas », « bloc PARTEZ DE VOTRE BESOIN, il faut
 * changer les photos des cartes », « les bento Offres et Secteurs ne changent
 * pas d'image ».
 *
 * LA CAUSE, mesurée le même jour : 46 images viennent de `/assets/web/`, les
 * images de la maquette, écrites en dur dans les données des composants.
 * `ph-hero-raffinerie.jpg`, `ph-technicien.jpg`, `team-duo.jpg` et
 * `team-grind-front.jpg` apparaissaient chacune sur 4 des 6 pages de hub. La
 * répartition du registre (`scripts/repartit-photos.ts`) ne les voyait pas :
 * elle ne travaille que sur les fiches de contenu.
 *
 * LA RÈGLE POSÉE, et c'est la plus simple qui soit juste : UNE CARTE MONTRE LA
 * PHOTO DE LA PAGE QU'ELLE OUVRE. Une carte vers le cas SUEZ montre la photo
 * de la page SUEZ. Plus besoin de deviner un thème : la cohérence est acquise,
 * et elle suit automatiquement toute redistribution ultérieure.
 *
 * Le fichier est GÉNÉRÉ et commité : les données des bento sont importées par
 * des composants client, qui ne peuvent pas lire le disque.
 *
 * À relancer après `bun scripts/repartit-photos.ts --applique`.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const DOSSIER = 'supabase/import/gabarits-maquette'

const brut = JSON.parse(readFileSync('public/assets/photos/registre.json', 'utf8'))
const registre = new Set((Array.isArray(brut) ? brut : (brut.photos ?? [])).map((p) => p.fichier))

/** La première photo DU REGISTRE citée par une fiche, dans l'ordre du document. */
function photoDeLaFiche(texte) {
  for (const m of texte.matchAll(/\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)) {
    if (registre.has(m[1])) return `/assets/photos/${m[1]}`
  }
  return null
}

const table = new Map()
for (const f of readdirSync(DOSSIER).filter((x) => x.endsWith('.json'))) {
  const texte = readFileSync(`${DOSSIER}/${f}`, 'utf8')
  let url
  try {
    url = JSON.parse(texte).url
  } catch {
    continue
  }
  if (typeof url !== 'string') continue
  const photo = photoDeLaFiche(texte)
  if (photo) table.set(url, photo)
}

const lignes = [...table.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([url, photo]) => `  ${JSON.stringify(url)}: ${JSON.stringify(photo)},`)

writeFileSync(
  'lib/photo-par-page.ts',
  `/**
 * CE FICHIER EST GENERE. Ne pas l'editer a la main.
 * Source : supabase/import/gabarits-maquette/*.json
 * Regeneration : node scripts/genere-photo-par-page.mjs
 *
 * La photo de couverture de chaque page : la PREMIERE photo du registre que
 * la page sert elle-meme.
 *
 * Une carte qui pointe vers une page montre ainsi la photo de cette page.
 * Avant le 12/10, les cartes tiraient leurs images de \`/assets/web/\`, ecrites
 * en dur : quatre images couvraient quatre des six pages de hub, et une carte
 * vers un cas client ne montrait pas la photo de ce cas.
 */

const PHOTOS: Record<string, string> = {
${lignes.join('\n')}
};

/**
 * La photo de couverture de \`url\`, ou \`null\` si la page n'en sert aucune du
 * registre. L'appelant garde alors son image d'origine : mieux vaut celle de
 * la maquette qu'un trou.
 */
export function photoDeLaPage(url: string | null | undefined): string | null {
  if (!url) return null;
  return PHOTOS[url] ?? PHOTOS[url.endsWith("/") ? url : \`\${url}/\`] ?? null;
}

/** Le nombre de pages couvertes, pour les portes. */
export const NOMBRE_PAGES = ${table.size};
`,
  'utf8',
)
console.log(`lib/photo-par-page.ts genere : ${table.size} pages sur ${readdirSync(DOSSIER).filter((x) => x.endsWith('.json')).length} fiches`)
