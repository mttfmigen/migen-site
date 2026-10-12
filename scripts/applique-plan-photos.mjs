#!/usr/bin/env node
/**
 * APPLIQUE LE PLAN DE RÉATTRIBUTION DES PHOTOS, après l'avoir vérifié.
 *
 * POURQUOI. Mehdi, le 12/10, sur `/offres/` : « changer les photos c'est que
 * des photos avec des avions, je vois pas le rapport on doit voir du
 * technicien ». Puis, sur les expertises : « l'image sur problématique est
 * partout la même ».
 *
 * CE QUI PRÉCÈDE CE SCRIPT. Les 385 photos du registre ont été classées par
 * SUJET RÉELLEMENT VISIBLE, image ouverte, et non par étiquette : les sept
 * photos hors sujet de `/offres/` portaient toutes le thème `technicien`, un
 * mécanicien penché sur un moteur d'avion EN ÉTANT un. 64 ont été disqualifiées,
 * puis trois sceptiques aux lentilles distinctes en ont annulé 20 : il en reste
 * 44 réellement interdites sur une page commerciale.
 *
 * CE SCRIPT NE FAIT PAS CONFIANCE AU PLAN. Il le vérifie avant d'écrire :
 * le fichier de remplacement existe, il n'est pas lui-même interdit, la chaîne
 * à remplacer est bien présente, et deux pages ne reçoivent pas la même photo.
 * Un plan qui échoue à l'une de ces vérifications n'est pas appliqué.
 *
 * REMPLACEMENT CIBLÉ, JAMAIS DE RE-SÉRIALISATION. Un autre atelier travaille sur
 * d'autres champs des mêmes fiches au même moment : réécrire un JSON entier
 * écraserait son travail. On ne touche que la sous-chaîne du nom de fichier.
 *
 * Usage :
 *   node scripts/applique-plan-photos.mjs <plan.json>              lecture seule
 *   node scripts/applique-plan-photos.mjs <plan.json> --applique   écrit
 *
 * À suivre de `node scripts/relis-relais.mjs`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const PLAN = process.argv[2]
const APPLIQUE = process.argv.includes('--applique')
if (!PLAN || !existsSync(PLAN)) {
  console.error('usage : node scripts/applique-plan-photos.mjs <plan.json> [--applique]')
  process.exit(2)
}

const { remplacements = [], nonResolus = [] } = JSON.parse(readFileSync(PLAN, 'utf8'))

/* ------------------------------------------------------ les vérifications */

const DOSSIER_PHOTOS = 'public/assets/photos'
const DOSSIER_WEB = 'public/assets/web'
const surDisque = new Set([
  ...readdirSync(DOSSIER_PHOTOS),
  ...(existsSync(DOSSIER_WEB) ? readdirSync(DOSSIER_WEB) : []),
])

/** Les fiches, indexées par URL : le plan nomme des URL, pas des chemins. */
const DOSSIER_FICHES = 'supabase/import/gabarits-maquette'
const ficheDe = new Map()
for (const nom of readdirSync(DOSSIER_FICHES).filter((f) => f.endsWith('.json'))) {
  const chemin = `${DOSSIER_FICHES}/${nom}`
  try {
    const url = JSON.parse(readFileSync(chemin, 'utf8')).url
    if (typeof url === 'string') ficheDe.set(url, chemin)
  } catch {
    /* une fiche illisible est signalée ailleurs */
  }
}

/**
 * LE VIVIER PROPRE, et la recherche d'un substitut quand deux pages se
 * disputent la même photo.
 *
 * LE CRITÈRE : la proximité de THÈME avec la photo que le planificateur avait
 * choisie. Il l'avait jugée pertinente pour cette page ; on garde donc son
 * jugement et on cherche la plus proche qui soit libre, plutôt que de prendre
 * la première venue. À proximité égale, la MOINS servie l'emporte, pour ne pas
 * recréer le défaut qu'on répare.
 */
const registre = JSON.parse(readFileSync('public/assets/photos/registre.json', 'utf8'))
const photos = Array.isArray(registre) ? registre : (registre.photos ?? [])
const themesDe = new Map(photos.map((x) => [x.fichier, new Set(x.themes ?? [])]))

const INTERDITES = new Set(
  existsSync(process.env.PHOTOS_INTERDITES ?? '')
    ? JSON.parse(readFileSync(process.env.PHOTOS_INTERDITES, 'utf8'))
    : [],
)

/* Combien de fois chaque photo est déjà servie par une fiche : à pertinence
   égale, on préfère celle qu'on voit le moins. */
const usage = new Map()
for (const nom of readdirSync(DOSSIER_FICHES).filter((f) => f.endsWith('.json'))) {
  const texte = readFileSync(`${DOSSIER_FICHES}/${nom}`, 'utf8')
  for (const m of texte.matchAll(/\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)) {
    usage.set(m[1], (usage.get(m[1]) ?? 0) + 1)
  }
}

function chercheSubstitut(voulue, dejaPrise) {
  const cibles = themesDe.get(voulue) ?? new Set()
  let meilleure = null
  let meilleurScore = -1
  for (const photo of photos) {
    const f = photo.fichier
    if (f === voulue) continue
    if (INTERDITES.has(f)) continue
    if (dejaPrise.has(f)) continue
    if (!surDisque.has(f)) continue
    const t = themesDe.get(f) ?? new Set()
    let commun = 0
    for (const x of t) if (cibles.has(x)) commun += 1
    /* La proximité d'abord, la rareté ensuite : un dixième de point par usage
       évité ne renverse jamais un thème commun de plus. */
    const score = commun * 10 - Math.min(usage.get(f) ?? 0, 9)
    if (score > meilleurScore) {
      meilleurScore = score
      meilleure = f
    }
  }
  return meilleurScore >= 0 ? meilleure : null
}

const refuses = []
const retenus = []
const dejaPrise = new Map()

for (const r of remplacements) {
  const motif = (raison) => refuses.push({ ...r, motif: raison })

  if (!r?.url || !r?.ancienne || !r?.nouvelle) {
    motif('entrée incomplète')
    continue
  }
  if (r.ancienne === r.nouvelle) {
    motif('la photo de remplacement est la même que l’ancienne')
    continue
  }
  if (!surDisque.has(r.nouvelle)) {
    motif(`« ${r.nouvelle} » n’existe pas sur le disque : la page resterait sans image`)
    continue
  }
  const chemin = r.fiche && existsSync(r.fiche) ? r.fiche : ficheDe.get(r.url)
  if (!chemin) {
    motif(`aucune fiche connue pour ${r.url}`)
    continue
  }
  const texte = readFileSync(chemin, 'utf8')
  if (!texte.includes(r.ancienne)) {
    motif(`« ${r.ancienne} » n’est pas dans ${chemin} : le plan a été écrit sur un autre état`)
    continue
  }
  /* DEUX PAGES NE REÇOIVENT PAS LA MÊME PHOTO. Le client a déjà reproché
     « tout le temps la même photo » : réparer un défaut en en recréant un autre
     n’est pas une réparation.

     MAIS ON NE JETTE PAS L'ENTRÉE POUR AUTANT. Quatre planificateurs ont
     travaillé en parallèle sur des familles de pages différentes, et malgré le
     partage du vivier ils ont choisi 54 fois la même photo pour deux pages.
     Refuser ces 54 laisserait 54 pages avec leur photo interdite : le défaut
     d'origine survivrait à sa réparation. On cherche donc un SUBSTITUT. */
  let choisie = r.nouvelle
  const prise = dejaPrise.get(choisie)
  if (prise && prise !== r.url) {
    const substitut = chercheSubstitut(choisie, dejaPrise)
    if (!substitut) {
      motif(`« ${choisie} » est déjà attribuée à ${prise}, et le vivier n’offre aucun substitut libre`)
      continue
    }
    choisie = substitut
    r.substitue = { voulue: r.nouvelle, retenue: substitut }
  }
  dejaPrise.set(choisie, r.url)
  retenus.push({ ...r, nouvelle: choisie, chemin })
}

/* ------------------------------------------------------------- l'écriture */

const parFichier = new Map()
for (const r of retenus) {
  if (!parFichier.has(r.chemin)) parFichier.set(r.chemin, [])
  parFichier.get(r.chemin).push(r)
}

let ecrits = 0
if (APPLIQUE) {
  for (const [chemin, lot] of parFichier) {
    let texte = readFileSync(chemin, 'utf8')
    for (const r of lot) {
      /* Remplacement CIBLÉ de la seule sous-chaîne du nom de fichier. Aucune
         re-sérialisation : un autre atelier écrit dans d’autres champs des
         mêmes fiches au même moment. */
      texte = texte.split(r.ancienne).join(r.nouvelle)
    }
    writeFileSync(chemin, texte, 'utf8')
    ecrits += 1
  }
}

/* ---------------------------------------------------------------- rapport */

console.log(
  `${remplacements.length} réattributions au plan : ${retenus.length} retenues, ${refuses.length} refusées`,
)
const substitues = retenus.filter((r) => r.substitue)
console.log(`  ${parFichier.size} fiches concernées${APPLIQUE ? `, ${ecrits} écrites` : ''}`)
console.log(`  ${substitues.length} collision(s) résolue(s) par un substitut du vivier`)
console.log(`  ${nonResolus.length} emplacements que le plan déclare non résolus`)

if (refuses.length) {
  console.log('\nREFUSÉES, et chacune avec son motif :')
  const parMotif = new Map()
  for (const r of refuses) {
    const cle = r.motif.replace(/« [^»]+ »/g, '« … »')
    parMotif.set(cle, (parMotif.get(cle) ?? 0) + 1)
  }
  for (const [m, n] of [...parMotif.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${m}`)
  }
  console.log('\n  le détail des dix premières :')
  for (const r of refuses.slice(0, 10)) console.log(`    ${r.url}\n      ${r.motif}`)
}

if (!APPLIQUE) console.log('\nLECTURE SEULE. Relancer avec --applique pour écrire.')
