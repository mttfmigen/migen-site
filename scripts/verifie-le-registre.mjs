#!/usr/bin/env node
/**
 * LANCE TOUTES LES COMMANDES DU REGISTRE, ET COMPARE À CE QU'ELLES PROMETTENT.
 *
 * POURQUOI CETTE PORTE EXISTE, et c'est la leçon la plus coûteuse du 12/10.
 * `GATES.md` porte 56 retours du client, chacun marqué fait ou non, et une
 * vingtaine portent une commande `CHECK:` avec son résultat attendu `EXPECT:`.
 *
 * PERSONNE NE LES AVAIT JAMAIS LANCÉES. Une relecture adverse les a rejouées
 * une à une et a trouvé :
 *   · un `CHECK` qui PLANTE avant toute assertion (`node` sur un script qui
 *     importe du TypeScript), donc son « 0 photo hors secteur » n'avait jamais
 *     pu être affiché par cette commande ;
 *   · des `EXPECT` PÉRIMÉS, « 932 blocs » quand la mesure en rend 1092 ;
 *   · un `EXPECT` ILLISIBLE, qui attend un chiffre que la commande n'affiche
 *     pas ;
 *   · une correction déclarée faite dont le plan du site publiait encore les
 *     adresses.
 *
 * Un registre dont les preuves ne se rejouent pas est pire qu'un registre
 * absent : il donne la tranquillité sans la garantie. Cette porte-ci le tient
 * honnête.
 *
 * CE QU'ELLE FAIT, et rien de plus : pour chaque couple `CHECK` / `EXPECT`,
 * elle lance la commande TELLE QU'ÉCRITE et vérifie que sa sortie satisfait ce
 * qui est promis. Elle ne corrige rien, elle ne juge pas le fond : elle dit
 * quelles promesses du registre tiennent et lesquelles ne tiennent pas.
 *
 * LES `EXPECT` SONT EN FRANÇAIS, pas en code. On les lit donc avec indulgence
 * sur la forme et sévérité sur le fond :
 *   · « 0 » ou « aucun » : la sortie doit contenir un zéro ou le mot ;
 *   · un nombre : il doit paraître dans la sortie ;
 *   · « au moins 1 » : la sortie ne doit pas être « 0 » ;
 *   · sinon, le texte attendu doit se retrouver dans la sortie.
 * Un `EXPECT` qu'aucune de ces lectures ne tranche est signalé comme ILLISIBLE,
 * ce qui est un défaut du registre et non de la commande.
 *
 * Usage :
 *   node scripts/verifie-le-registre.mjs             lance tout
 *   node scripts/verifie-le-registre.mjs --controle   prouve qu'elle sait échouer
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const CONTROLE = process.argv.includes('--controle')
const REGISTRE = 'GATES.md'

/** Les couples CHECK / EXPECT, dans l'ordre du registre, avec leur entrée. */
function lisLeRegistre(texte) {
  const lignes = texte.split('\n')
  const promesses = []
  let entree = '?'
  let commande = null
  for (const ligne of lignes) {
    /* `G` pour les séries 1 à 4, `D` pour les demandes du 13/10. Sans le `D`,
       les dix-neuf entrées de la série 5 étaient toutes attribuées au dernier
       `G` rencontré, et le rapport nommait la mauvaise entrée comme rompue. */
    const titre = ligne.match(/^### ([GD]\d+) — (.+)$/)
    if (titre) {
      entree = titre[1]
      continue
    }
    const check = ligne.match(/^\s*CHECK: (.+)$/)
    if (check) {
      commande = check[1].trim()
      continue
    }
    const attendu = ligne.match(/^\s*EXPECT: (.+)$/)
    if (attendu && commande) {
      promesses.push({ entree, commande, attendu: attendu[1].trim() })
      commande = null
    }
  }
  return promesses
}

/**
 * La sortie satisfait-elle la promesse ?
 * Rend `true`, `false`, ou `null` quand l'attente est illisible.
 */
function tient(sortie, attendu) {
  const s = sortie.replace(/\s+/g, ' ').toLowerCase()
  const a = attendu.replace(/\s+/g, ' ').toLowerCase().trim()

  if (/^au moins \d/.test(a)) {
    const nombres = s.match(/\d+/g) ?? []
    return nombres.some((n) => Number(n) > 0)
  }
  if (/^(0|aucun|aucune)\b/.test(a)) {
    return /\b0\b|aucun|aucune/.test(s)
  }
  /* Tous les nombres de l'attente doivent paraître dans la sortie : « 932 blocs
     sur 233 pages » exige 932 ET 233. C'est ce qui attrape un EXPECT périmé. */
  const nombres = a.match(/\d[\d   ]*\d|\d/g)?.map((x) => x.replace(/[^\d]/g, '')) ?? []
  if (nombres.length > 0) {
    return nombres.every((n) => new RegExp(`\\b${n}\\b`).test(s.replace(/[  ]/g, '')))
  }
  /* Une attente en prose : le premier fragment significatif doit s'y trouver. */
  const fragment = a.split(/[,.:;]/)[0].trim()
  if (fragment.length < 4) return null
  return s.includes(fragment)
}

/* ------------------------------------------------------------------ contrôle */

if (CONTROLE) {
  const EPREUVES = [
    { nom: 'un zéro promis et rendu', sortie: '0', attendu: '0', veut: true },
    { nom: 'un zéro promis, un autre chiffre rendu', sortie: '26', attendu: '0', veut: false },
    { nom: 'un compte exact rendu', sortie: '932 blocs sur 233 pages', attendu: '932 blocs sur 233 pages', veut: true },
    {
      nom: 'UN EXPECT PÉRIMÉ, le défaut trouvé le 12/10',
      sortie: '1092 blocs sur 233 pages',
      attendu: '932 blocs sur 233 pages',
      veut: false,
    },
    { nom: 'au moins 1, satisfait', sortie: '3', attendu: 'au moins 1', veut: true },
    { nom: 'au moins 1, non satisfait', sortie: '0', attendu: 'au moins 1', veut: false },
    { nom: 'une attente en prose, satisfaite', sortie: 'VIGNETTE_PARTAGE_OK : tout va bien', attendu: 'VIGNETTE_PARTAGE_OK', veut: true },
    /* CONTRÔLE NÉGATIF : une attente qu'aucune lecture ne tranche doit être
       signalée ILLISIBLE et non comptée comme tenue. */
    { nom: 'NÉGATIF, une attente illisible est signalée', sortie: 'copie conforme', attendu: 'ok', veut: null },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = tient(e.sortie, e.attendu)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${JSON.stringify(e.veut)}, obtenu ${JSON.stringify(obtenu)}`)
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`)
  process.exit(vues === EPREUVES.length ? 0 : 1)
}

/* --------------------------------------------------------------- le passage */

const promesses = lisLeRegistre(readFileSync(REGISTRE, 'utf8'))
console.log(`${promesses.length} promesse(s) au registre, lancées une par une\n`)

const tenues = []
const rompues = []
const illisibles = []
const plantees = []

for (const p of promesses) {
  let sortie = ''
  let code = 0
  try {
    sortie = execSync(p.commande, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000,
      shell: '/bin/bash',
    })
  } catch (erreur) {
    code = erreur.status ?? 1
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`
    /* UNE COMMANDE QUI PLANTE N'EST PAS UNE PREUVE. `node` sur un script qui
       importe du TypeScript rend `ERR_UNKNOWN_FILE_EXTENSION` : la promesse
       n'a jamais pu être vérifiée par cette commande. */
    if (/ERR_UNKNOWN_FILE_EXTENSION|command not found|No such file/.test(sortie)) {
      plantees.push({ ...p, motif: sortie.split('\n').find((l) => /Error|not found/.test(l)) ?? 'échec' })
      continue
    }
  }
  const verdict = tient(sortie, p.attendu)
  if (verdict === null) illisibles.push({ ...p, sortie: sortie.trim().slice(0, 120) })
  else if (verdict) tenues.push(p)
  else rompues.push({ ...p, sortie: sortie.trim().slice(0, 200), code })
}

console.log(`  tenues     : ${tenues.length}`)
console.log(`  rompues    : ${rompues.length}`)
console.log(`  illisibles : ${illisibles.length}`)
console.log(`  plantées   : ${plantees.length}`)

if (plantees.length) {
  console.log('\nCOMMANDES QUI PLANTENT, donc qui n\'ont jamais rien prouvé :')
  for (const p of plantees) console.log(`  ${p.entree}  ${p.commande}\n      ${p.motif}`)
}
if (rompues.length) {
  console.log('\nPROMESSES ROMPUES :')
  for (const p of rompues) {
    console.log(`  ${p.entree}  attendu « ${p.attendu} »`)
    console.log(`      commande : ${p.commande}`)
    console.log(`      rendu    : ${p.sortie.split('\n')[0]}`)
  }
}
if (illisibles.length) {
  console.log('\nATTENTES ILLISIBLES, défaut du registre et non de la commande :')
  for (const p of illisibles) console.log(`  ${p.entree}  « ${p.attendu} »\n      rendu : ${p.sortie.split('\n')[0]}`)
}

if (rompues.length || plantees.length || illisibles.length) process.exit(1)
console.log('\nREGISTRE_HONNETE : chaque promesse a été lancée et tient.')
