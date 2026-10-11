#!/usr/bin/env node
/**
 * QUELLES PHOTOS DORMENT DANS public/assets/photos SANS ETRE SERVIES ?
 *
 *   node scripts/audit-photos-orphelines.mjs [adresse]   (defaut : production)
 *
 * CE N'EST PAS UNE PORTE, c'est un inventaire : il ne refuse rien et ne
 * supprime rien. Une photo non servie n'est pas un defaut, c'est du stock.
 *
 * CE QU'IL ETABLIT, et pourquoi chaque colonne compte avant toute suppression :
 *   - servie / non servie, en lisant le HTML des 248 pages, les deux formes
 *     d'adresse (brute et encodee par Next en %2Fassets%2Fphotos%2F) ;
 *   - au registre ou non : une photo du registre est achetee sous licence et
 *     decrite, la supprimer coute de l'argent ;
 *   - doublon d'octets d'une photo deja servie : celle-la ne coute rien ;
 *   - CITEE AILLEURS DANS LE DEPOT : une porte, un script ou un document
 *     peuvent s'appuyer sur un fichier qu'aucune page ne sert. C'est
 *     l'objection d'un relecteur adverse du 10/10, et elle etait fondee :
 *     cinq orphelines servent de temoin a trois scripts.
 *
 * DEUX PIEGES PAYES EN L'ECRIVANT, et corriges ici :
 *   - decoder le document entier avec decodeURIComponent leve une URIError
 *     des qu'un % isole traine dans le HTML ; la page comptait pour
 *     injoignable et l'inventaire concluait a tort. On ne decode que les
 *     adresses ;
 *   - registre.json est un TABLEAU, pas un objet a clef « photos ». Lu de
 *     travers, l'ensemble etait vide et « 0 au registre » ne voulait rien
 *     dire, quelle que soit la realite.
 *
 * Si une seule page est injoignable, il s'arrete : une orpheline pourrait
 * etre servie par la page non lue.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const BASE = process.argv[2] ?? 'https://migen-site.vercel.app'
const DOSSIER = 'public/assets/photos'

const fichiers = readdirSync(DOSSIER).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
const registre = new Set(
  (() => { const b = JSON.parse(readFileSync(`${DOSSIER}/registre.json`, "utf8")); return (Array.isArray(b) ? b : (b.photos ?? [])).map((p) => p.fichier); })(),
)

// 1. Servies par au moins une des 248 pages.
const idx = JSON.parse(readFileSync('maquette/contenu/site/index.json', 'utf8'))
const urls = [...new Set((idx.pages ?? idx).map((p) => p.url ?? p.chemin ?? p))]
const servies = new Set()
let ko = 0
for (let i = 0; i < urls.length; i += 16) {
  await Promise.all(
    urls.slice(i, i + 16).map(async (u) => {
      try {
        const r = await fetch(new URL(u, BASE))
        if (!r.ok) return ko++
        const h = await r.text()
        // On ne decode QUE les adresses : decoder le document entier leve une
        // URIError des qu'un % isole traine dans le HTML, et la page compte
        // alors pour injoignable. La porte conclurait a tort.
        for (const m of h.matchAll(/(?:\/|%2F)assets(?:\/|%2F)photos(?:\/|%2F)([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)) {
          servies.add(m[1])
        }
      } catch {
        ko++
      }
    }),
  )
}
if (ko) {
  console.error(`${ko} page(s) injoignable(s), mesure abandonnee : une orpheline pourrait etre servie par une page non lue`)
  process.exit(2)
}

// 2. Citees quelque part dans le depot HORS le registre lui-meme : code,
//    fiches de contenu, portes et leurs temoins. C'est l'objection du
//    relecteur adverse, et elle se verifie.
const citees = new Map()
for (const f of fichiers) {
  let hits = ''
  try {
    hits = execSync(
      `grep -rl --binary-files=without-match -F ${JSON.stringify(f)} components lib app scripts supabase docs maquette/contenu 2>/dev/null || true`,
      { encoding: 'utf8', maxBuffer: 1 << 24 },
    ).trim()
  } catch {
    /* grep sans resultat */
  }
  if (hits) citees.set(f, hits.split('\n'))
}

const orphelines = fichiers.filter((f) => !servies.has(f))
const poids = (l) => l.reduce((s, f) => s + statSync(`${DOSSIER}/${f}`).size, 0)

// 3. Doublons pixel d'une photo SERVIE : meme empreinte d'octets.
const sha = (f) => createHash('sha256').update(readFileSync(`${DOSSIER}/${f}`)).digest('hex')
const empreintesServies = new Map()
for (const f of servies) {
  try {
    empreintesServies.set(sha(f), f)
  } catch {
    /* servie mais absente du disque */
  }
}

const doublons = []
const uniques = []
for (const f of orphelines) {
  const e = sha(f)
  if (empreintesServies.has(e)) doublons.push([f, empreintesServies.get(e)])
  else uniques.push(f)
}

const auRegistre = orphelines.filter((f) => registre.has(f))
const citeesOrphelines = orphelines.filter((f) => citees.has(f))

const mo = (o) => `${(o / 1024 / 1024).toFixed(1)} Mo`
console.log(`${fichiers.length} fichiers dans ${DOSSIER}, ${mo(poids(fichiers))}`)
console.log(`  servies par au moins une des ${urls.length} pages : ${servies.size}`)
console.log(`  ORPHELINES                                 : ${orphelines.length}, ${mo(poids(orphelines))}`)
console.log(`\nparmi les orphelines :`)
console.log(`  au registre (achetees sous licence, decrites) : ${auRegistre.length}`)
console.log(`  doublons pixel d'une photo deja servie        : ${doublons.length}, ${mo(poids(doublons.map((d) => d[0])))}`)
console.log(`  uniques (octets qui n'existent nulle part)    : ${uniques.length}, ${mo(poids(uniques))}`)
console.log(`  CITEES AILLEURS DANS LE DEPOT                : ${citeesOrphelines.length}`)
if (citeesOrphelines.length) {
  console.log(`\n  ces ${citeesOrphelines.length} ne sont PAS supprimables en l'etat :`)
  citeesOrphelines.slice(0, 20).forEach((f) => console.log(`    ${f}\n        ${citees.get(f).join('\n        ')}`))
}
if (uniques.length) {
  console.log(`\n  les uniques, par poids :`)
  uniques
    .map((f) => [f, statSync(`${DOSSIER}/${f}`).size])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([f, o]) => console.log(`    ${mo(o).padStart(8)}  ${f}${registre.has(f) ? '  (AU REGISTRE)' : ''}`))
}
if (doublons.length) {
  console.log(`\n  5 exemples de doublons :`)
  doublons.slice(0, 5).forEach(([a, b]) => console.log(`    ${a}\n        memes octets que ${b}, qui est servie`))
}
