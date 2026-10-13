#!/usr/bin/env node
/**
 * CE QUE L'ANCIENNE PURGE DES PRIX A EMPORTÉ DE TROP.
 *
 * LE CONTEXTE, tranché par Mehdi le 09/10 : « ne donne aucun tarif, dis juste
 * que c'est sur devis ». La purge appliquée jusque-là jetait la PHRASE ENTIÈRE
 * dès qu'elle portait le mot « tarif », « taux horaire » ou « prix », même sans
 * le moindre montant. La règle est désormais : un MONTANT reste interdit (un
 * nombre suivi de € ou d'euros, un taux chiffré, une fourchette), une phrase qui
 * renvoie au devis est AUTORISÉE.
 *
 * CE QUE CETTE PORTE MESURE : les phrases que les captures du client écrivent,
 * qui parlent d'argent SANS montant, et que notre corpus ne sert plus. Chacune
 * est une perte de contenu du client, pas un choix.
 *
 * TROUVÉ LE 13/10, et c'est Mehdi qui l'a vu avant elle, sur /implantations/ :
 *   · carte 03 des problématiques, corps perdu : « Loin d'un bassin dense, le
 *     choix se réduit à un ou deux artisans, et le tarif suit cette rareté. »
 *   · carte 03 de l'offre, titre perdu : « Un taux horaire homogène en France
 *     écrit au devis. »
 *
 * Usage :
 *   node scripts/verifie-purge-des-prix.mjs            mesure
 *   node scripts/verifie-purge-des-prix.mjs --controle  témoin
 */
import { readFileSync, readdirSync } from 'node:fs'

const CONTROLE = process.argv.includes('--controle')
const CAPTURES = 'maquette/rendu'
const FICHES = 'supabase/import/gabarits-maquette'

/** Un MONTANT : c'est lui qui reste interdit, et lui seul. */
const MONTANT = /\d[\d  .,]*\s*(?:€|euros?|k€|%\s*(?:de remise|de marge))|\b\d+\s*(?:€|euros?)\b/i

/** Les mots d'argent qui déclenchaient l'ancienne purge, sans montant. */
const MOT_ARGENT = /\b(tarif|tarifs|taux horaire|prix|facture|devis|chiffré|chiffrage|coût|coûte|budget)\b/i

/** Normalise un fragment pour la comparaison : apostrophes, entités, espaces. */
export function normalise(s) {
  return (s ?? '')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * LES TEXTES D'UN HTML, BLOC PAR BLOC, ET JAMAIS RECOLLÉS.
 *
 * C'EST LA CORRECTION DU 13/10, et elle était indispensable. La première
 * version de cette porte retirait les balises, recollait tout en un seul texte,
 * puis le découpait en phrases. Elle fabriquait ainsi des « phrases » qui
 * enjambent deux blocs voisins de la capture, par exemple « Sur cette page
 * Chiffres clés L'offre Ce que nous garantissons… », qui est un sommaire et non
 * une phrase. Aucune de ces chaînes ne peut se retrouver dans notre corpus,
 * puisqu'elle n'existe nulle part : la porte annonçait 492 pertes dont
 * l'immense majorité n'en étaient pas.
 *
 * Elle lit donc le contenu de chaque élément SÉPARÉMENT, et ne découpe en
 * phrases qu'à l'intérieur d'un même bloc.
 */
export function blocs(html) {
  const propre = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const sortie = []
  /* Le texte entre deux balises : un bloc, et un seul. */
  for (const m of propre.matchAll(/>([^<>]+)</g)) {
    const t = normalise(m[1])
    if (t.length >= 28) sortie.push(t)
  }
  return sortie
}

/** Découpe en phrases À L'INTÉRIEUR d'un bloc, jamais au travers. */
export function phrases(bloc) {
  return normalise(bloc)
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ«“])/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 28 && p.length <= 400)
}

/** Une phrase perdue : elle parle d'argent, n'a pas de montant, et n'est plus servie. */
export function estPerdue(phrase, texteServi) {
  if (!MOT_ARGENT.test(phrase)) return false
  if (MONTANT.test(phrase)) return false
  return !texteServi.includes(phrase)
}

/* ------------------------------------------------------------------ témoin */

if (CONTROLE) {
  const SERVI = "Le site isolé paie le plus cher. Nos équipes interviennent partout. Le contrat est chiffré sur devis."
  const EPREUVES = [
    {
      nom: 'une phrase d\'argent sans montant, absente du rendu, est PERDUE',
      phrase: "Loin d'un bassin dense, le choix se réduit à un ou deux artisans, et le tarif suit cette rareté.",
      veut: true,
    },
    {
      nom: 'le vrai défaut du 13/10, le titre de la carte 03',
      phrase: 'Un taux horaire homogène en France écrit au devis.',
      veut: true,
    },
    /* CONTRÔLES NÉGATIFS. */
    {
      nom: 'NÉGATIF, une phrase servie n\'est pas perdue',
      phrase: 'Le contrat est chiffré sur devis.',
      veut: false,
    },
    {
      nom: 'NÉGATIF, une phrase avec un MONTANT reste interdite, donc pas « perdue »',
      phrase: "Le contrat de maintenance démarre à 850 € par mois selon le parc.",
      veut: false,
    },
    {
      nom: 'NÉGATIF, une phrase sans mot d\'argent n\'est pas du ressort de cette porte',
      phrase: "Nos techniciens connaissent vos machines et vos cadences de production.",
      veut: false,
    },
    {
      nom: 'NÉGATIF, un taux chiffré est un montant',
      phrase: "Nous appliquons une remise de 15 % sur les contrats annuels signés.",
      veut: false,
    },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = estPerdue(e.phrase, SERVI)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  /* CONTRÔLE NÉGATIF DE MÉTHODE, celui qui a condamné la première version :
     deux blocs voisins ne doivent JAMAIS produire une phrase commune. */
  const deuxBlocs = blocs(
    '<p>Sur cette page, le sommaire des sections de la fiche</p>' +
      '<p>Combien coûte un contrat de maintenance industrielle ?</p>',
  )
  const bon =
    deuxBlocs.length === 2 &&
    !deuxBlocs.some((b) => b.includes('fiche Combien')) &&
    blocs('<p>premier</p><p>second</p>').length === 0
  if (bon) vues += 1
  console.log(
    `  ${bon ? 'OK   ' : 'ÉCHEC'}  NÉGATIF, deux blocs voisins ne sont jamais recollés en une phrase`,
  )
  if (!bon) console.log(`           blocs lus : ${JSON.stringify(deuxBlocs)}`)

  /* CONTRÔLE NÉGATIF DE L'ANGLE MORT DU 13/10 : une phrase que le site sert
     depuis un COMPOSANT, et non depuis une fiche, n'est pas perdue. Ces deux
     phrases sont servies, la première par SecteursDomaine.tsx, la seconde par
     expertises-donnees.ts, et la porte les comptait toutes deux perdues. */
  const copie = copieServie()
  const SERVIES_PAR_UN_COMPOSANT = [
    "Ce qui change, c'est le site : ses règles d'accès, sa cadence, ce qu'un arrêt coûte.",
    'Le prestataire opaque coûte deux fois.',
  ]
  const encorePerdues = SERVIES_PAR_UN_COMPOSANT.filter((p) => estPerdue(normalise(p), copie))
  const lit = encorePerdues.length === 0
  if (lit) vues += 1
  console.log(
    `  ${lit ? 'OK   ' : 'ÉCHEC'}  NÉGATIF, une phrase servie par un composant n'est pas perdue`,
  )
  for (const p of encorePerdues) console.log(`           comptée perdue à tort : « ${p.slice(0, 80)}… »`)

  console.log(`\ntémoin : ${vues}/${EPREUVES.length + 2} épreuves réussies`)
  process.exit(vues === EPREUVES.length + 2 ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

/**
 * TOUT CE QUE LE SITE SERT, et pas seulement ses fiches.
 *
 * L'ANGLE MORT RÉPARÉ LE 13/10 AU SOIR. Cette porte ne lisait que
 * `supabase/import/gabarits-maquette`. Or une grande part de la copie n'est pas
 * dans une fiche : elle est écrite en dur dans les composants et surtout dans
 * leurs fichiers de données, `components/**\/*-donnees.ts`. Conséquence mesurée :
 * la porte annonçait 22 phrases perdues sur 40 pages, dont DIX étaient servies
 * mot pour mot, pour 39 des 40 pages comptées. La pire,
 * « Ce qui change, c'est le site : ses règles d'accès, sa cadence, ce qu'un
 * arrêt coûte. », pesait à elle seule 30 pages et se lit ligne 154 de
 * `components/site/expertises/domaine/SecteursDomaine.tsx`.
 *
 * Elle ne s'aveugle pas pour autant : un contrôle négatif NOUVEAU exige qu'une
 * phrase servie par un composant ne soit plus comptée perdue, et le témoin
 * garde tous ses contrôles positifs, qui portent sur de vraies pertes.
 *
 * LES PORTES DE VÉRIFICATION SONT EXCLUES de cette lecture, et c'est
 * indispensable : `verification-specialite.tsx` cite les phrases de la maquette
 * pour les vérifier. Les compter comme servies rendrait la porte incapable de
 * voir une perte dès qu'une autre porte en parle.
 */
function copieServie() {
  const morceaux = []

  for (const f of readdirSync(FICHES)) {
    if (f.endsWith('.json')) morceaux.push(readFileSync(`${FICHES}/${f}`, 'utf8'))
  }

  const codeSource = (dossier) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = `${dossier}/${e.name}`
      if (e.isDirectory()) {
        codeSource(chemin)
        continue
      }
      if (!/\.tsx?$/.test(e.name)) continue
      // Une porte n'est pas de la copie : elle cite pour mesurer.
      if (/^verif(ication|ie)-/.test(e.name)) continue
      morceaux.push(readFileSync(chemin, 'utf8'))
    }
  }
  for (const racine of ['components', 'lib', 'app']) codeSource(racine)

  return (
    morceaux
      .join(' ')
      .replace(/\\n/g, ' ')
      // Le JSX écrit l'insécable et l'espace littérale sous forme d'entités.
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/\{" "\}/g, ' ')
      .replace(/[  ]/g, ' ')
      // Une apostrophe droite dans une chaîne TypeScript simple est échappée.
      .replace(/\\'/g, "'")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ')
  )
}

const servi = copieServie()

const captures = readdirSync(CAPTURES).filter((f) => f.endsWith('.html'))
const pertes = []

for (const nom of captures) {
  for (const bloc of blocs(readFileSync(`${CAPTURES}/${nom}`, 'utf8'))) {
    for (const p of phrases(bloc)) {
      if (estPerdue(p, servi)) pertes.push({ page: nom.replace(/\.html$/, ''), phrase: p })
    }
  }
}

/* Une même phrase vit souvent sur plusieurs pages : on la nomme une fois. */
const parPhrase = new Map()
for (const p of pertes) {
  if (!parPhrase.has(p.phrase)) parPhrase.set(p.phrase, [])
  parPhrase.get(p.phrase).push(p.page)
}

console.log(`${captures.length} captures lues, ${parPhrase.size} phrase(s) distincte(s) perdue(s) sur ${new Set(pertes.map((p) => p.page)).size} page(s)\n`)

const triees = [...parPhrase.entries()].sort((a, b) => b[1].length - a[1].length)
for (const [phrase, pages] of triees.slice(0, 40)) {
  console.log(`  ${pages.length} page(s) · ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? '…' : ''}`)
  console.log(`      « ${phrase.slice(0, 160)} »`)
}
if (triees.length > 40) console.log(`\n  … et ${triees.length - 40} autre(s)`)

console.log('\nTémoin : node scripts/verifie-purge-des-prix.mjs --controle')
if (parPhrase.size > 0) process.exit(1)
console.log('AUCUNE_PHRASE_PERDUE_PAR_LA_PURGE')
