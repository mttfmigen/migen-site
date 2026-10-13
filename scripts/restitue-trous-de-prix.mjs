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

/**
 * DEUXIÈME SOURCE : LES PHRASES QUE LA PURGE A PRISES SANS LAISSER DE TROU.
 *
 * `node scripts/verifie-purge-des-prix.mjs` compare les 244 captures au corpus
 * et nomme les phrases qui parlent d'argent SANS montant et que le corpus ne
 * sert plus. La grande majorité de ces signalements sont des FAUX POSITIFS de
 * mesure, et il fallait les écarter un par un avant de toucher à quoi que ce
 * soit :
 *   · la phrase vit dans un composant, pas dans une fiche (« Ce qui change,
 *     c'est le site… » est écrite dans SecteursDomaine.tsx, servie sur les 30
 *     pages de spécialité) ;
 *   · la fiche la porte COUPÉE en `accroche` + `texte`, que le gabarit recolle
 *     au rendu (« Revue des données et des outils » + « qualité des
 *     historiques… ») : rien n'est perdu, la chaîne entière n'existe
 *     simplement pas d'un seul morceau dans le JSON ;
 *   · la capture la porte TRONQUÉE, et c'est la capture qui tronque (le
 *     sommaire du guide écrit « c'est la personne … » là où la fiche porte le
 *     titre entier « c'est la personne qui se présente »).
 *
 * Ne restent ci-dessous que les phrases dont l'absence est MESURÉE des deux
 * côtés : présentes dans la capture, absentes de tout le code et de toutes les
 * fiches. Chacune porte la capture qui la prouve, et le passage REFUSE de poser
 * une phrase que sa capture ne contient pas.
 */
const RESTITUTIONS_CAPTURE = [
  {
    fiche: 'supabase/import/gabarits-maquette/offres-chantier-demenagement-machines.json',
    preuve: 'maquette/rendu/offres--chantier--demenagement-machines.html',
    phrase: "Il est chiffré sur devis après l'étude préalable, qui est gratuite.",
    ou: 'contenu.sections[5].questions[0].reponse',
    pose: (valeur, phrase) => {
      const [premiere, ...reste] = valeur.split(/(?<=\.)\s+/)
      return [premiere, phrase, ...reste].join(' ')
    },
    motif:
      "réponse à « Combien coûte un déménagement de machines industrielles ? » : la phrase du milieu, celle qui renvoie au devis, avait été retirée entre « Le montant dépend… » et « En manutention lourde… ».",
  },
  {
    fiche: 'supabase/import/gabarits-maquette/offres-zero-arret.json',
    preuve: 'maquette/rendu/offres--zero-arret.html',
    phrase:
      "Vous réservez une capacité de maintenance, exclusivement hors production, pour un prix mensuel fixe et sans embauche.",
    ou: 'contenu.chapeau',
    pose: (valeur, phrase) => `${valeur} ${phrase}`,
    motif:
      "seconde phrase du chapeau du héros, sous le h1 « Zéro arrêt » : la première était restée seule.",
  },
  {
    fiche: 'supabase/import/gabarits-maquette/offres-zero-arret.json',
    preuve: 'maquette/rendu/offres--zero-arret.html',
    phrase: 'La mise en service est offerte en Zéro arrêt et en Zéro arrêt Max.',
    ou: 'contenu.sections[5].questions[1].reponse',
    pose: (valeur, phrase) => `${phrase} ${valeur}`,
    motif:
      "réponse à « Combien coûte l'abonnement ? », réduite à une seule phrase orpheline par la purge. La phrase qui la précédait dans la capture, « Un prix mensuel fixe, sur 12 mois, selon la formule retenue. », reste FERMÉE : elle porte un chiffre de durée, et l'interdiction des délais chiffrés tient.",
  },
]

/** Normalise pour comparer une phrase à une capture : entités, apostrophes, espaces. */
export function normalise(texte) {
  return (texte ?? '')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * LA GARDE DE LA DEUXIÈME SOURCE : la capture porte-t-elle vraiment la phrase ?
 *
 * Sans elle, ce script poserait dans une fiche n'importe quelle phrase écrite à
 * la main dans la table ci-dessus. Avec elle, la référence du client reste
 * l'autorité : une phrase que sa capture ne contient pas est REFUSÉE.
 */
export function laCaptureLaPorte(htmlCapture, phrase) {
  return normalise(htmlCapture).includes(normalise(phrase))
}

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
  /* LA GARDE DE CAPTURE, avec son contrôle négatif : une phrase que la capture
     ne porte pas doit être refusée, sinon la table deviendrait une autorité. */
  const FAUSSE_CAPTURE =
    '<p>Le montant d&#39;une prestation d’ici. Il est chiffré sur devis après l’étude préalable,\n qui est gratuite.</p>'
  const EPREUVES_CAPTURE = [
    {
      nom: 'la garde de capture reconnaît la phrase malgré entités et apostrophes typographiques',
      html: FAUSSE_CAPTURE,
      phrase: "Il est chiffré sur devis après l'étude préalable, qui est gratuite.",
      veut: true,
    },
    {
      nom: 'NÉGATIF, une phrase que la capture ne porte pas est refusée',
      html: FAUSSE_CAPTURE,
      phrase: 'Le contrat démarre au tarif public affiché sur cette page.',
      veut: false,
    },
    {
      nom: 'NÉGATIF, une capture vide ne valide rien',
      html: '',
      phrase: "Il est chiffré sur devis après l'étude préalable, qui est gratuite.",
      veut: false,
    },
  ]
  for (const e of EPREUVES_CAPTURE) {
    const obtenu = laCaptureLaPorte(e.html, e.phrase)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  /* Chaque phrase de la deuxième source passe-t-elle le filtre des interdits ?
     Et la phrase laissée fermée, « sur 12 mois », échoue-t-elle bien ? */
  const toutesRendables = RESTITUTIONS_CAPTURE.every((r) => estRendable(r.phrase))
  const douzeMoisFermee = !estRendable('Un prix mensuel fixe, sur 12 mois, selon la formule retenue.')
  if (toutesRendables) vues += 1
  console.log(`  ${toutesRendables ? 'OK   ' : 'ÉCHEC'}  les ${RESTITUTIONS_CAPTURE.length} phrases de la deuxième source passent le filtre`)
  if (douzeMoisFermee) vues += 1
  console.log(`  ${douzeMoisFermee ? 'OK   ' : 'ÉCHEC'}  NÉGATIF, « sur 12 mois » reste refusée par le filtre des délais`)

  /* Le chemin pointé sait-il viser un index de tableau ? */
  const faux = { a: { b: [{ c: 'x' }, { c: 'y' }] } }
  const { noeud, clef } = parChemin(faux, 'a.b[1].c')
  const bon = noeud && noeud[clef] === 'y'
  if (bon) vues += 1
  console.log(`  ${bon ? 'OK   ' : 'ÉCHEC'}  le chemin pointé vise bien un index de tableau`)
  const ATTENDUES = EPREUVES.length + EPREUVES_CAPTURE.length + 3
  console.log(`\ntémoin : ${vues}/${ATTENDUES} épreuves réussies`)
  process.exit(vues === ATTENDUES ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

const parFiche = new Map()
for (const r of [...RESTITUTIONS, ...RESTITUTIONS_CAPTURE]) {
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

/* ----------------------------- DEUXIÈME SOURCE : les phrases sans trou ----- */

const captures = new Map()
for (const r of RESTITUTIONS_CAPTURE) {
  if (!captures.has(r.preuve)) captures.set(r.preuve, readFileSync(r.preuve, 'utf8'))
}

for (const r of RESTITUTIONS_CAPTURE) {
  const fiche = parFiche.get(r.fiche)
  if (!estRendable(r.phrase)) {
    refusees.push({ ...r, trou: r.phrase, motifRefus: 'la phrase porte un montant ou un délai chiffré' })
    continue
  }
  if (!laCaptureLaPorte(captures.get(r.preuve), r.phrase)) {
    refusees.push({ ...r, trou: r.phrase, motifRefus: `absente de la capture ${r.preuve}` })
    continue
  }
  const { noeud, clef } = parChemin(fiche, r.ou)
  if (!noeud || !(clef in noeud)) {
    refusees.push({ ...r, trou: r.phrase, motifRefus: `emplacement introuvable : ${r.ou}` })
    continue
  }
  const avant = String(noeud[clef] ?? '')
  /* Déjà posée : on ne la pose pas deux fois. Ce script doit pouvoir se
     relancer sans dupliquer une phrase dans la copie du client. */
  if (normalise(avant).includes(normalise(r.phrase))) {
    refusees.push({ ...r, trou: r.phrase, motifRefus: 'déjà présente à cet emplacement, rien à faire' })
    continue
  }
  const apres = r.pose(avant, r.phrase).replace(/\s+/g, ' ').trim()
  noeud[clef] = apres
  rendues += 1
  console.log(`  ${r.ou}`)
  console.log(`      avant : « ${avant.slice(0, 130) || '(vide)'} »`)
  console.log(`      après : « ${apres.slice(0, 200)} »`)
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
