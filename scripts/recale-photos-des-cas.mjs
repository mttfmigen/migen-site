#!/usr/bin/env node
/**
 * REMET CHAQUE PAGE DE CAS SUR LE SECTEUR DE SON CAS.
 *
 * POURQUOI. Mehdi, le 12/10 : « les images ne sont pas adaptées au secteur ou
 * au cas ». Corrigé une première fois, et déclaré clos. Il ne l'était pas : la
 * commande inscrite au registre lançait `node` sur un script qui importe du
 * TypeScript, elle plantait donc avant la moindre assertion. Son « 0 photo hors
 * secteur » n'avait jamais été affiché par personne. Mesuré pour de vrai le
 * 13/10 contre la production : 26 photos hors sujet sur les pages de cas.
 *
 * LA CONTRADICTION QUE CE DÉFAUT RÉVÈLE, et c'est le vrai sujet. Deux règles
 * posées le même jour se contredisaient :
 *
 *   1. « aucune photo de menuiserie, d'aviation ou de salle blanche sur une
 *      page commerciale », parce qu'un avion fait croire à un autre métier ;
 *   2. « la photo d'une page de cas montre le secteur du cas ».
 *
 * Or JELD-WEN EST un menuisier. Sa page servait de la chimie et de
 * l'agroalimentaire parce que la règle 1 l'avait vidée de son propre sujet.
 *
 * LA RÈGLE QUI LES RÉCONCILIE : une page de cas a droit au secteur DE SON CAS,
 * exactement comme une page `/secteurs/<marché>/` a droit au sien. Ce qui reste
 * interdit, c'est un secteur ÉTRANGER à la page : un avion sur une page d'offre,
 * de la menuiserie sur un cas automobile.
 *
 * Usage :
 *   node scripts/recale-photos-des-cas.mjs             lecture seule
 *   node scripts/recale-photos-des-cas.mjs --applique   écrit
 *
 * À suivre de `node scripts/relis-relais.mjs`, puis de
 * `bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app`.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const APPLIQUE = process.argv.includes('--applique')
const DOSSIER = 'supabase/import/gabarits-maquette'

const registre = JSON.parse(readFileSync('public/assets/photos/registre.json', 'utf8'))
const photos = Array.isArray(registre) ? registre : (registre.photos ?? [])
const themesDe = new Map(photos.map((p) => [p.fichier, new Set(p.themes ?? [])]))
const surDisque = new Set(readdirSync('public/assets/photos'))

/** Combien de fois chaque photo est déjà servie : à pertinence égale, la plus rare. */
const usage = new Map()
for (const nom of readdirSync(DOSSIER).filter((f) => f.endsWith('.json'))) {
  const texte = readFileSync(`${DOSSIER}/${nom}`, 'utf8')
  for (const m of texte.matchAll(/\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)) {
    usage.set(m[1], (usage.get(m[1]) ?? 0) + 1)
  }
}

/**
 * Le relevé de la porte, lu TEL QUEL plutôt que redevigné : elle sait déduire
 * le secteur attendu du texte de la fiche, et c'est sa compétence, pas la nôtre.
 * On lui demande son verdict et on le répare.
 */
const sortie = (() => {
  try {
    return readFileSync(process.env.RELEVE ?? '/dev/stdin', 'utf8')
  } catch {
    return ''
  }
})()

/** « /preuves/x/ \n photo.jpg [...] \n attendu a ou b, d'après ... » */
function litLeReleve(texte) {
  const lignes = texte.split('\n')
  const manquements = []
  let url = null
  let photo = null
  for (const ligne of lignes) {
    const u = ligne.match(/^\s{2}(\/[^\s]+\/)\s*$/)
    if (u) {
      url = u[1]
      photo = null
      continue
    }
    const p = ligne.match(/^\s{6}([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))\s/i)
    if (p) {
      photo = p[1]
      continue
    }
    const a = ligne.match(/^\s{6}attendu ([^,]+),/)
    if (a && url && photo) {
      manquements.push({ url, photo, attendus: a[1].split(/\s+ou\s+/).map((x) => x.trim()) })
      photo = null
    }
  }
  return manquements
}

const manquements = litLeReleve(sortie)
if (manquements.length === 0) {
  console.log(
    'aucun manquement lu. Passe le relevé de la porte :\n' +
      '  bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app > /tmp/releve.txt\n' +
      '  RELEVE=/tmp/releve.txt node scripts/recale-photos-des-cas.mjs',
  )
  process.exit(0)
}

/** La fiche qui sert une URL. */
const ficheDe = new Map()
for (const nom of readdirSync(DOSSIER).filter((f) => f.endsWith('.json'))) {
  const chemin = `${DOSSIER}/${nom}`
  try {
    const u = JSON.parse(readFileSync(chemin, 'utf8')).url
    if (typeof u === 'string') ficheDe.set(u, chemin)
  } catch {
    /* une fiche illisible est signalée ailleurs */
  }
}

const prises = new Map()
const journal = []
const sansRemede = []

for (const m of manquements) {
  const chemin = ficheDe.get(m.url)
  if (!chemin) {
    sansRemede.push({ ...m, motif: 'aucune fiche connue' })
    continue
  }
  const texte = readFileSync(chemin, 'utf8')
  const dejaSurLaPage = new Set(
    [...texte.matchAll(/\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)].map((x) => x[1]),
  )

  /* La meilleure photo du secteur attendu : elle doit porter l'un des thèmes
     attendus, exister, n'être pas déjà sur la page, et n'avoir pas déjà été
     attribuée dans cette passe. À pertinence égale, la moins servie. */
  let choisie = null
  let meilleur = -1
  for (const p of photos) {
    const f = p.fichier
    if (!surDisque.has(f) || dejaSurLaPage.has(f) || prises.has(f)) continue
    const t = themesDe.get(f) ?? new Set()
    const colle = m.attendus.filter((a) => t.has(a)).length
    if (colle === 0) continue
    const score = colle * 100 - Math.min(usage.get(f) ?? 0, 20)
    if (score > meilleur) {
      meilleur = score
      choisie = f
    }
  }
  if (!choisie) {
    sansRemede.push({ ...m, motif: `aucune photo libre ne porte ${m.attendus.join(' ou ')}` })
    continue
  }
  prises.set(choisie, m.url)
  journal.push({ ...m, nouvelle: choisie, chemin })
  if (APPLIQUE) {
    writeFileSync(chemin, readFileSync(chemin, 'utf8').split(m.photo).join(choisie), 'utf8')
  }
}

console.log(`${manquements.length} manquements lus, ${journal.length} recalés, ${sansRemede.length} sans remède\n`)
for (const j of journal) {
  console.log(`  ${j.url}`)
  console.log(`      ${j.photo}`)
  console.log(`   -> ${j.nouvelle}   [${[...(themesDe.get(j.nouvelle) ?? [])].join(', ')}]`)
}
if (sansRemede.length) {
  console.log('\nSANS REMÈDE, et c’est un vrai manque de stock, pas un oubli :')
  for (const s of sansRemede) console.log(`  ${s.url}  ${s.photo}\n      ${s.motif}`)
}
if (!APPLIQUE) console.log('\nLECTURE SEULE. Relancer avec --applique pour écrire.')
