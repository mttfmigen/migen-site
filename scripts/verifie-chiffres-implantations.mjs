#!/usr/bin/env node
/**
 * LES DEUX CHIFFRES DU TITRE DES IMPLANTATIONS SONT RECALCULÉS, PAS RECOPIÉS.
 *
 * LE DÉFAUT, trouvé le 13/10 par l'analyse du colis du client. La page
 * /implantations/ se contredisait DANS LE MÊME FICHIER :
 *   · son titre de section : « Sept hubs, 74 bassins couverts » ;
 *   · sa propre FAQ, quelques lignes plus haut : « Dix hubs de techniciens en
 *     France : Paris, Lille, Marseille, Toulouse, Lyon, Metz, Strasbourg,
 *     Bordeaux, Dijon et Nantes », soit dix noms énumérés ;
 *   · sa propre donnée : `contenu.villes.hubs` porte dix entrées ;
 *   · CLAUDE.md §9 : « dix hubs de techniciens ».
 * Trois sources contre une. « Sept » était le faux chiffre, et il était servi
 * en titre de section, donc en gras et en grand.
 *
 * CE QUE CETTE PORTE FAIT. Elle ne compare pas le titre à une valeur écrite
 * quelque part : elle RECALCULE les deux chiffres depuis les sources qui font
 * foi, et vérifie que le titre les dit.
 *   · le nombre de hubs, compté dans `contenu.villes.hubs` de la fiche ;
 *   · le nombre de bassins, compté dans l'index des 248 pages du client :
 *     les pages du gabarit « 04 Ville » plus celles du gabarit
 *     « 06 Département ». Mesuré le 13/10 : 66 + 8 = 74.
 *
 * Un chiffre recopié vieillit en silence. Un chiffre recalculé ne le peut pas.
 *
 * Usage :
 *   node scripts/verifie-chiffres-implantations.mjs
 *   node scripts/verifie-chiffres-implantations.mjs --controle
 */
import { readFileSync } from 'node:fs'

const CONTROLE = process.argv.includes('--controle')
const FICHE = 'supabase/import/gabarits-maquette/implantations.json'
const INDEX = 'maquette/contenu/site/index.json'

/** Le nombre écrit en toutes lettres dans le titre, rendu en chiffre. */
const MOTS = {
  un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8,
  neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15,
}

/** Lit « Dix hubs, 74 bassins couverts » et rend { hubs: 10, bassins: 74 }. */
export function litLeTitre(titre) {
  const t = (titre ?? '').toLowerCase()
  const motHub = t.match(/\b([a-zéè]+)\s+hubs?\b/)
  const chiffreHub = t.match(/\b(\d+)\s+hubs?\b/)
  const bassins = t.match(/\b(\d+)\s+bassins?\b/)
  return {
    hubs: chiffreHub ? Number(chiffreHub[1]) : (motHub ? (MOTS[motHub[1]] ?? null) : null),
    bassins: bassins ? Number(bassins[1]) : null,
  }
}

/* ------------------------------------------------------------------ témoin */

if (CONTROLE) {
  const EPREUVES = [
    { nom: 'le titre corrigé se lit', titre: 'Dix hubs, 74 bassins couverts', veut: { hubs: 10, bassins: 74 } },
    { nom: 'LE DÉFAUT DU 13/10 se lit aussi', titre: 'Sept hubs, 74 bassins couverts', veut: { hubs: 7, bassins: 74 } },
    { nom: 'un titre en chiffres se lit', titre: '10 hubs, 74 bassins couverts', veut: { hubs: 10, bassins: 74 } },
    /* CONTRÔLES NÉGATIFS : la lecture ne doit pas inventer un nombre. */
    { nom: 'NÉGATIF, un titre sans nombre de hubs rend null', titre: 'Nos hubs, 74 bassins couverts', veut: { hubs: null, bassins: 74 } },
    { nom: 'NÉGATIF, un titre sans bassins rend null', titre: 'Dix hubs partout en France', veut: { hubs: 10, bassins: null } },
    { nom: 'NÉGATIF, un titre vide rend deux null', titre: '', veut: { hubs: null, bassins: null } },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const o = litLeTitre(e.titre)
    const juste = o.hubs === e.veut.hubs && o.bassins === e.veut.bassins
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${JSON.stringify(e.veut)}, obtenu ${JSON.stringify(o)}`)
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`)
  process.exit(vues === EPREUVES.length ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

const fiche = JSON.parse(readFileSync(FICHE, 'utf8'))
const index = JSON.parse(readFileSync(INDEX, 'utf8'))
const pages = Array.isArray(index) ? index : (index.pages ?? [])

const hubsComptes = (fiche.contenu?.villes?.hubs ?? []).length
const bassinsComptes =
  pages.filter((p) => p.gabarit === '04 Ville').length +
  pages.filter((p) => p.gabarit === '06 Département').length

/* Le titre qui annonce les deux chiffres. Il vit dans `contenu.villes.titre`,
   et on le CHERCHE au lieu de le supposer : une porte qui vise un chemin figé
   devient muette le jour où la fiche se réorganise, et elle passe alors au
   vert sans rien avoir mesuré. */
function chercheLeTitre(noeud) {
  if (typeof noeud === 'string') return /hubs?,.*bassins/i.test(noeud) ? noeud : null
  if (Array.isArray(noeud)) {
    for (const v of noeud) { const t = chercheLeTitre(v); if (t) return t }
    return null
  }
  if (noeud && typeof noeud === 'object') {
    for (const v of Object.values(noeud)) { const t = chercheLeTitre(v); if (t) return t }
    return null
  }
  return null
}

const titre = chercheLeTitre(fiche)
if (!titre) {
  console.error('le titre qui annonce « N hubs, N bassins » est introuvable dans la fiche')
  process.exit(1)
}
const section = { titre }
const annonce = litLeTitre(titre)

const fautes = []
if (annonce.hubs !== hubsComptes) {
  fautes.push(
    `le titre annonce ${annonce.hubs ?? '(aucun nombre)'} hub(s), la donnée en porte ${hubsComptes} ` +
      `(${(fiche.contenu.villes.hubs ?? []).map((h) => h.hub ?? h.nom).join(', ')})`,
  )
}
if (annonce.bassins !== bassinsComptes) {
  fautes.push(
    `le titre annonce ${annonce.bassins ?? '(aucun nombre)'} bassin(s), l'index en porte ${bassinsComptes} ` +
      `(pages du gabarit « 04 Ville » plus celles du gabarit « 06 Département »)`,
  )
}

/* La FAQ de la même page ne doit pas contredire le titre. */
const texteFiche = JSON.stringify(fiche)
for (const [mot, valeur] of Object.entries(MOTS)) {
  const motif = new RegExp(`\\b${mot} hubs?\\b`, 'i')
  if (motif.test(texteFiche) && valeur !== hubsComptes) {
    fautes.push(`la fiche écrit « ${mot} hubs » ailleurs, alors que la donnée en porte ${hubsComptes}`)
  }
}

console.log(`titre : « ${section.titre} »`)
console.log(`  hubs comptés dans la donnée        : ${hubsComptes}`)
console.log(`  bassins comptés dans l'index       : ${bassinsComptes}`)

if (fautes.length) {
  console.log(`\n${fautes.length} faute(s) :`)
  for (const f of fautes) console.log(`  · ${f}`)
  console.log('\nTémoin : node scripts/verifie-chiffres-implantations.mjs --controle')
  process.exit(1)
}
console.log('\nCHIFFRES_DES_IMPLANTATIONS_RECALCULES : le titre dit ce que la donnée porte.')
