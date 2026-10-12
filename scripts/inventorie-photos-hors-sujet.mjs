#!/usr/bin/env node
/**
 * INVENTAIRE : quelle page sert une photo marquée d'un SECTEUR qui n'est pas le
 * sien.
 *
 * POURQUOI. Mehdi, le 12/10, sur `/offres/` : « changer les photos, c'est que
 * des photos avec des avions, je vois pas le rapport, on doit voir du
 * technicien ».
 *
 * LA CAUSE, mesurée le même jour. Les sept photos hors sujet de `/offres/`
 * portent TOUTES le thème `technicien` :
 *
 *   env-technician-examining-jet-engine.jpg  ['aeronautique','technicien','mecanique']
 *   env-mecanicien-aeronautique.jpg          ['aeronautique','mecanique','technicien']
 *   env-menuiserie-industrie.jpg             ['menuiserie','technicien']
 *
 * Un mécanicien penché sur un moteur d'avion EST un technicien : aucun
 * sélecteur qui demande « un technicien » ne peut les écarter. Et ce n'est pas
 * une pénurie : 291 des 385 photos du registre portent `technicien`, contre 20
 * pour `aeronautique`.
 *
 * LA RÈGLE QUI MANQUAIT : une photo qui porte un THÈME DE SECTEUR ne sert que
 * la page de ce secteur. L'aéronautique a sa page, la menuiserie aussi. Une
 * page d'offre, de hub ou d'expertise, qui parle d'un SERVICE et non d'un
 * marché, se montre avec une scène industrielle générique.
 *
 * Ce script ne corrige rien. Il mesure, et il rend du JSON exploitable.
 *
 * Usage :
 *   node scripts/inventorie-photos-hors-sujet.mjs             tableau lisible
 *   node scripts/inventorie-photos-hors-sujet.mjs --json      pour un script
 */
import { readFileSync, readdirSync } from 'node:fs'

const JSON_SEUL = process.argv.includes('--json')

/**
 * LES THÈMES DE SECTEUR : un marché, une filière, un type d'usine. Une photo
 * qui en porte un est reconnaissable comme telle par n'importe quel visiteur,
 * et elle ment sur toute page qui ne parle pas de ce marché.
 *
 * Chaque thème est rattaché aux URL qui ont le DROIT de le servir. Une page de
 * secteur sert son secteur, et elle est bien la seule.
 */
const SECTEURS = {
  aeronautique: ['/secteurs/aeronautique/'],
  menuiserie: ['/secteurs/menuiserie-industrielle/'],
  agro: ['/secteurs/agroalimentaire/'],
  auto: ['/secteurs/automobile/'],
  chimie: ['/secteurs/chimie/'],
  pharma: ['/secteurs/pharmaceutique/'],
  nucleaire: ['/secteurs/nucleaire/'],
  logistique: ['/secteurs/logistique/'],
  metallurgie: ['/secteurs/industrie-metallique/'],
  cimenterie: ['/secteurs/industrie-lourde/'],
  energie: ['/secteurs/industrie-lourde/'],
}

/**
 * LES THÈMES GÉNÉRIQUES : un geste, un métier, un lieu de travail, sans
 * marché identifiable. Ils peuvent servir n'importe quelle page.
 */
const GENERIQUES = new Set([
  'technicien',
  'site-industriel',
  'equipe',
  'depannage',
  'mecanique',
  'electricite',
  'automatisme',
  'robotique',
  'hydraulique',
  'pneumatique',
  'soudure',
  'chaudronnerie',
  'tuyauterie',
  'levage',
  'arret-technique',
  'bureau-etudes',
])

const registre = JSON.parse(readFileSync('public/assets/photos/registre.json', 'utf8'))
const photos = Array.isArray(registre) ? registre : (registre.photos ?? [])
const parFichier = new Map(photos.map((p) => [p.fichier, p]))

/** Les thèmes de secteur portés par une photo. */
function secteursDe(fichier) {
  const p = parFichier.get(fichier)
  if (!p) return []
  return (p.themes ?? []).filter((t) => t in SECTEURS)
}

/** Vrai si `url` a le droit de servir une photo marquée `secteur`. */
function aLeDroit(url, secteur) {
  return (SECTEURS[secteur] ?? []).some((proprietaire) => url.startsWith(proprietaire))
}

/* ------------------------------------------------- les photos de chaque page */

const DOSSIER = 'supabase/import/gabarits-maquette'
const pagesDuSite = []
for (const nom of readdirSync(DOSSIER).filter((f) => f.endsWith('.json'))) {
  const texte = readFileSync(`${DOSSIER}/${nom}`, 'utf8')
  let fiche
  try {
    fiche = JSON.parse(texte)
  } catch {
    continue
  }
  if (typeof fiche.url !== 'string') continue
  const citees = [
    ...new Set(
      [...texte.matchAll(/\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)].map(
        (m) => m[1],
      ),
    ),
  ]
  pagesDuSite.push({ url: fiche.url, fichier: nom, photos: citees })
}

/* Les données écrites EN DUR dans les composants comptent aussi : c'est de là
   que venaient les 46 images de `/assets/web/` trouvées le 12/10. */
const EN_DUR = []
function fouille(dossier) {
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = `${dossier}/${e.name}`
    if (e.isDirectory()) {
      fouille(chemin)
      continue
    }
    if (!/\.(tsx?|ts)$/.test(e.name)) continue
    if (e.name.startsWith('verification-')) continue
    const texte = readFileSync(chemin, 'utf8')
    for (const m of texte.matchAll(
      /\/assets\/photos\/([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi,
    )) {
      EN_DUR.push({ fichier: chemin, photo: m[1] })
    }
  }
}
fouille('components')

/* ------------------------------------------------------------- les manquements */

const manquements = []
for (const page of pagesDuSite) {
  for (const photo of page.photos) {
    for (const secteur of secteursDe(photo)) {
      if (aLeDroit(page.url, secteur)) continue
      manquements.push({
        url: page.url,
        fiche: `${DOSSIER}/${page.fichier}`,
        photo,
        secteurIntrus: secteur,
        themes: parFichier.get(photo)?.themes ?? [],
        titre: parFichier.get(photo)?.titre ?? '',
      })
    }
  }
}

const manquementsEnDur = []
for (const { fichier, photo } of EN_DUR) {
  for (const secteur of secteursDe(photo)) {
    manquementsEnDur.push({
      fichier,
      photo,
      secteurIntrus: secteur,
      themes: parFichier.get(photo)?.themes ?? [],
    })
  }
}

/* --------------------------------------------- le vivier de remplacement propre */

const VIVIER = photos
  .filter((p) => {
    const t = p.themes ?? []
    if (t.some((x) => x in SECTEURS)) return false
    return t.some((x) => GENERIQUES.has(x))
  })
  .map((p) => ({ fichier: p.fichier, themes: p.themes, titre: p.titre }))

/* Combien de fois chaque photo du vivier est DÉJÀ servie : on ne veut pas
   remplacer un avion par une photo vue dix fois ailleurs. */
const usage = new Map()
for (const page of pagesDuSite) {
  for (const photo of page.photos) usage.set(photo, (usage.get(photo) ?? 0) + 1)
}
for (const v of VIVIER) v.dejaServie = usage.get(v.fichier) ?? 0

if (JSON_SEUL) {
  console.log(
    JSON.stringify(
      { manquements, manquementsEnDur, vivier: VIVIER, secteurs: SECTEURS },
      null,
      2,
    ),
  )
  process.exit(0)
}

console.log(`${photos.length} photos au registre, ${pagesDuSite.length} fiches lues\n`)
console.log(`MANQUEMENTS DANS LES FICHES : ${manquements.length}`)
const parSecteur = new Map()
for (const m of manquements) {
  parSecteur.set(m.secteurIntrus, (parSecteur.get(m.secteurIntrus) ?? 0) + 1)
}
for (const [s, n] of [...parSecteur.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  photo marquée « ${s} » sur une page qui ne l'est pas`)
}
console.log()
for (const m of manquements) {
  console.log(`  ${m.url}`)
  console.log(`      ${m.photo}  [${m.themes.join(', ')}]`)
}
console.log(`\nMANQUEMENTS ÉCRITS EN DUR : ${manquementsEnDur.length}`)
for (const m of manquementsEnDur) {
  console.log(`  ${m.fichier}\n      ${m.photo}  [${m.themes.join(', ')}]`)
}
console.log(`\nVIVIER PROPRE : ${VIVIER.length} photos sans aucun thème de secteur`)
const jamais = VIVIER.filter((v) => v.dejaServie === 0).length
console.log(`  dont ${jamais} jamais servies aujourd'hui`)
