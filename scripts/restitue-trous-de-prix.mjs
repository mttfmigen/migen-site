#!/usr/bin/env node
/**
 * REND AU CLIENT LES PHRASES QUE L'ANCIENNE PURGE DES PRIX LUI AVAIT PRISES.
 *
 * LE DÉFAUT, signalé par Mehdi le 13/10 sur /implantations/ : « Bloc incomplet,
 * il y'a des endroits où il manque du texte. Les card vos problématiques, il
 * manque du texte sur la card 3. Pareil sur le bloc l'offre, card 3. »
 *
 * LA CAUSE, mesurée. Ces textes NE SONT PAS perdus : ils vivent dans le champ
 * `trous[]` de la fiche, retirés volontairement sous l'ANCIENNE règle des prix,
 * avec leur motif écrit noir sur blanc, par exemple « "tarif" : aucun prix ».
 *
 * POURQUOI CES TROUS SONT CADUCS. Mehdi a renversé cette règle le 09/10 : « ne
 * donne aucun tarif, dis juste que c'est sur devis ». CLAUDE.md §9 le dit
 * désormais ainsi : un MONTANT reste interdit (un nombre suivi de € ou
 * d'euros, un taux chiffré, une fourchette), une phrase qui renvoie au devis
 * est autorisée. Et il cite NOMMÉMENT « taux horaire homogène dans toute la
 * France » parmi les formulations qui passent.
 *
 * Aucune des quatre phrases rendues ici ne porte de montant.
 *
 * CE QUI N'EST PAS RENDU, et c'est le contrôle qui garde la porte honnête :
 *   · toute phrase qui porte un MONTANT ;
 *   · toute phrase qui porte un DÉLAI CHIFFRÉ (« prise de poste en 2 à 3
 *     semaines »), interdiction toujours en vigueur, seul « rappel dans
 *     l'heure » étant autorisé. 100 trous de ce type existent dans les fiches
 *     d'implantation : ils restent fermés, et ce script ne les voit même pas.
 *
 * Usage :
 *   node scripts/restitue-trous-de-prix.mjs             lecture seule
 *   node scripts/restitue-trous-de-prix.mjs --applique   écrit
 *   node scripts/restitue-trous-de-prix.mjs --controle   témoin
 *
 * À suivre de `node scripts/relis-relais.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const APPLIQUE = process.argv.includes('--applique')
const CONTROLE = process.argv.includes('--controle')

/** Un MONTANT : interdit, toujours. */
export const MONTANT = /\d[\d  .,]*\s*(?:€|euros?|k€)|\b\d+\s*%/i
/** Un DÉLAI CHIFFRÉ : interdit, toujours, sauf « rappel dans l'heure ». */
export const DELAI = /\b\d+\s*(?:à|a)\s*\d+\s*(?:semaines?|jours?|mois|heures?)|\b\d+\s*(?:semaines?|jours?|mois)\b|\bsous\s+\d+/i

/** Une phrase retirée pour un motif de PRIX est-elle rendable aujourd'hui ? */
export function estRendable(ligne) {
  if (MONTANT.test(ligne)) return false
  if (DELAI.test(ligne)) return false
  return true
}

/**
 * LES RESTITUTIONS, une par trou, chacune à l'emplacement que SON PROPRE MOTIF
 * désigne. Rien n'est deviné : le motif du trou dit où le texte allait, et la
 * capture `maquette/rendu/implantations.html` le confirme mot pour mot.
 */
const RESTITUTIONS = [
  {
    fiche: 'supabase/import/gabarits-maquette/implantations.json',
    trou: "Trois usines, trois prestataires, trois formats de compte rendu et trois taux horaires : c'est l'organisation la plus répandue chez les groupes multi-sites, et la plus chère.",
    ou: 'contenu.chapeau',
    pose: (valeur, ligne) => `${ligne} ${valeur}`,
    motif: 'première phrase du chapeau du héros, la suite était déjà là',
  },
  {
    fiche: 'supabase/import/gabarits-maquette/implantations.json',
    trou: "Loin d'un bassin dense, le choix se réduit à un ou deux artisans, et le tarif suit cette rareté.",
    ou: 'contenu.sections[0].puces[2].texte',
    pose: (_valeur, ligne) => ligne,
    motif: 'corps de la carte 03 de « Vos problématiques », vide depuis la purge',
  },
  {
    fiche: 'supabase/import/gabarits-maquette/implantations.json',
    trou: 'Un taux horaire homogène en France écrit au devis.',
    ou: 'contenu.sections[1].lignes[2].prestation.accroche',
    pose: (_valeur, ligne) => ligne,
    motif: 'intitulé de la carte 03 de « L\'offre », vide depuis la purge',
  },
  {
    fiche: 'supabase/import/gabarits-maquette/implantations.json',
    trou: 'Même équipe, même taux horaire.',
    ou: 'contenu.villes.itinerantsTexte',
    pose: (valeur, ligne) => `${valeur} ${ligne}`,
    motif: 'seconde phrase du texte « Au-delà des hubs », la première était déjà là',
  },
]

/** Lit ou écrit une valeur par son chemin pointé, index de tableau compris. */
function parChemin(objet, chemin) {
  const pas = chemin.replace(/\[(\d+)\]/g, '.$1').split('.')
  let noeud = objet
  for (const p of pas.slice(0, -1)) {
    if (noeud == null) return { noeud: null, clef: null }
    noeud = noeud[p]
  }
  return { noeud, clef: pas[pas.length - 1] }
}

/* ------------------------------------------------------------------ témoin */

if (CONTROLE) {
  const EPREUVES = [
    { nom: 'une phrase de prix sans montant est rendable', l: 'Un taux horaire homogène en France écrit au devis.', veut: true },
    { nom: 'le tarif qui suit la rareté est rendable', l: "Loin d'un bassin dense, le choix se réduit à un ou deux artisans, et le tarif suit cette rareté.", veut: true },
    /* CONTRÔLES NÉGATIFS : ce que la porte doit REFUSER de rendre. */
    { nom: 'NÉGATIF, un montant en euros reste interdit', l: 'Le contrat démarre à 850 € par mois.', veut: false },
    { nom: 'NÉGATIF, un pourcentage est un montant', l: 'Une remise de 15 % sur les contrats annuels.', veut: false },
    { nom: 'NÉGATIF, un délai chiffré reste interdit', l: 'Prise de poste en 2 à 3 semaines, remplacement assuré.', veut: false },
    { nom: 'NÉGATIF, un délai en mois reste interdit', l: 'Engagement type de 6 mois renouvelable.', veut: false },
    { nom: 'NÉGATIF, un délai en « sous N » reste interdit', l: 'Un technicien en poste sous 3 semaines.', veut: false },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = estRendable(e.l)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  /* Le chemin pointé sait-il viser un index de tableau ? */
  const faux = { a: { b: [{ c: 'x' }, { c: 'y' }] } }
  const { noeud, clef } = parChemin(faux, 'a.b[1].c')
  const bon = noeud && noeud[clef] === 'y'
  if (bon) vues += 1
  console.log(`  ${bon ? 'OK   ' : 'ÉCHEC'}  le chemin pointé vise bien un index de tableau`)
  console.log(`\ntémoin : ${vues}/${EPREUVES.length + 1} épreuves réussies`)
  process.exit(vues === EPREUVES.length + 1 ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

const parFiche = new Map()
for (const r of RESTITUTIONS) {
  if (!parFiche.has(r.fiche)) parFiche.set(r.fiche, JSON.parse(readFileSync(r.fiche, 'utf8')))
}

let rendues = 0
const refusees = []

for (const r of RESTITUTIONS) {
  const fiche = parFiche.get(r.fiche)
  const trous = fiche.trous ?? []
  const i = trous.findIndex((t) => (t.ligne ?? '').trim() === r.trou.trim())
  if (i < 0) {
    refusees.push({ ...r, motifRefus: 'ce trou n\'existe plus dans la fiche' })
    continue
  }
  if (!estRendable(r.trou)) {
    refusees.push({ ...r, motifRefus: 'la phrase porte un montant ou un délai chiffré' })
    continue
  }
  const { noeud, clef } = parChemin(fiche, r.ou)
  if (!noeud || !(clef in noeud)) {
    refusees.push({ ...r, motifRefus: `emplacement introuvable : ${r.ou}` })
    continue
  }
  const avant = noeud[clef]
  const apres = r.pose(avant, r.trou).replace(/\s+/g, ' ').trim()
  noeud[clef] = apres
  trous.splice(i, 1)
  rendues += 1
  console.log(`  ${r.ou}`)
  console.log(`      avant : « ${String(avant).slice(0, 110) || '(vide)'} »`)
  console.log(`      après : « ${apres.slice(0, 150)} »`)
  console.log(`      ${r.motif}\n`)
}

if (APPLIQUE) {
  for (const [chemin, fiche] of parFiche) {
    writeFileSync(chemin, `${JSON.stringify(fiche, null, 2)}\n`, 'utf8')
  }
}

console.log(`${rendues} phrase(s) rendue(s), ${refusees.length} refusée(s)`)
for (const r of refusees) console.log(`  REFUSÉ  « ${r.trou.slice(0, 80)} »\n      ${r.motifRefus}`)
if (!APPLIQUE) console.log('\nLECTURE SEULE. Relancer avec --applique pour écrire.')
