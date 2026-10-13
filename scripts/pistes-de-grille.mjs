#!/usr/bin/env node
/**
 * DÉCLARE LA COLONNE DES GRILLES À PISTE UNIQUE.
 *
 * LE DÉFAUT, mesuré le 13/10 au navigateur. Une grille écrite
 * `{ display: "grid", gap: 10 }` n'a pas de colonne déclarée : sa piste unique
 * vaut `auto`, et `auto` NE DESCEND PAS sous le `min-content` de son enfant le
 * plus large. Sur un téléphone, la piste est donc plus large que le conteneur,
 * et l'enfant en sort.
 *
 * Mesuré sur /offres/zero-arret/ à 320 px : conteneur 196 px, piste 198,266 px,
 * les quatre `details.cx-faq` sortent de 2 px. Sur /implantations/bordeaux/ :
 * conteneur 196 px, piste 215,281 px, les cinq plis sortent de 19 px.
 *
 * LE REMÈDE : `minmax(0, 1fr)`. Le 0 autorise la piste à se rétrécir sous le
 * min-content, le 1fr lui fait prendre toute la place disponible. À une largeur
 * où l'enfant tient, la piste calculée est IDENTIQUE à `auto` : ce changement
 * ne se voit qu'aux largeurs où il y avait un défaut.
 *
 * CE QUE LE SCRIPT NE TOUCHE PAS, et c'est délibéré : une grille qui déclare
 * déjà ses colonnes (`gridTemplateColumns`), et une grille en flux colonne
 * (`gridAutoFlow` / `gridAutoColumns`), dont les pistes sont voulues plus larges
 * que le conteneur pour faire défiler.
 *
 * Usage :
 *   node scripts/pistes-de-grille.mjs              lecture seule
 *   node scripts/pistes-de-grille.mjs --applique    écrit
 *   node scripts/pistes-de-grille.mjs --controle    témoin
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const APPLIQUE = process.argv.includes('--applique')
const CONTROLE = process.argv.includes('--controle')

/** Une grille en ligne sans colonne déclarée, et sans flux colonne. */
const GRILLE = /\{\s*display:\s*"grid"[^{}]*\}/g

function aBesoin(bloc) {
  if (/gridTemplateColumns|gridTemplate\b/.test(bloc)) return false
  if (/gridAutoFlow|gridAutoColumns/.test(bloc)) return false
  return true
}

/** Pose la colonne juste après `display: "grid"`, en gardant l'indentation. */
function pose(bloc) {
  return bloc.replace(/(display:\s*"grid",?)/, (m) =>
    m.endsWith(',') ? `${m} gridTemplateColumns: "minmax(0,1fr)",` : `${m}, gridTemplateColumns: "minmax(0,1fr)"`,
  )
}

if (CONTROLE) {
  const EPREUVES = [
    { nom: 'une grille nue est reprise', bloc: '{ display: "grid", gap: 10 }', veut: true },
    { nom: 'une grille sans virgule est reprise', bloc: '{ display: "grid" }', veut: true },
    /* CONTRÔLES NÉGATIFS : ces trois-là ne doivent PAS être touchées. */
    {
      nom: 'NÉGATIF, colonnes déjà déclarées',
      bloc: '{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }',
      veut: false,
    },
    {
      nom: 'NÉGATIF, flux colonne (défilement voulu)',
      bloc: '{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(260px,300px)" }',
      veut: false,
    },
    { nom: 'NÉGATIF, ce n\'est pas une grille', bloc: '{ display: "flex", gap: 10 }', veut: false },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const estGrille = /\{\s*display:\s*"grid"/.test(e.bloc)
    const obtenu = estGrille && aBesoin(e.bloc)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  /* Et que la pose produise bien du code valide. */
  const pose1 = pose('{ display: "grid", gap: 10 }')
  const bon = pose1.includes('gridTemplateColumns: "minmax(0,1fr)"') && pose1.includes('gap: 10')
  if (bon) vues += 1
  console.log(`  ${bon ? 'OK   ' : 'ÉCHEC'}  la pose garde le reste de l'objet`)
  console.log(`\ntémoin : ${vues}/${EPREUVES.length + 1} épreuves réussies`)
  process.exit(vues === EPREUVES.length + 1 ? 0 : 1)
}

/** Tous les .tsx de components/, sauf les portes de vérification. */
function arbre(dossier) {
  const sortie = []
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = `${dossier}/${e.name}`
    if (e.isDirectory()) sortie.push(...arbre(chemin))
    else if (e.name.endsWith('.tsx') && !/verification|verifie/.test(e.name)) sortie.push(chemin)
  }
  return sortie
}

const fichiers = arbre('components')

let total = 0
const journal = []
for (const f of fichiers) {
  const avant = readFileSync(f, 'utf8')
  let n = 0
  const apres = avant.replace(GRILLE, (bloc) => {
    if (!aBesoin(bloc)) return bloc
    n += 1
    return pose(bloc)
  })
  if (n === 0) continue
  total += n
  journal.push(`  ${f} : ${n}`)
  if (APPLIQUE) writeFileSync(f, apres, 'utf8')
}

console.log(journal.join('\n'))
console.log(`\n${total} piste(s) de grille déclarée(s) sur ${journal.length} fichier(s)`)
if (!APPLIQUE) console.log('\nLECTURE SEULE. Relancer avec --applique pour écrire.')
