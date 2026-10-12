#!/usr/bin/env node
/**
 * RETIRE LA REDIRECTION D'URGENCE VERS LE DÉPANNAGE, sur toutes les fiches.
 *
 * POURQUOI. Mehdi, le 12/10, sur `/expertises/` : « la phrase "Ligne bloquée
 * maintenant ? Voir le dépannage industriel" c'est inutile ».
 *
 * CE N'EST PAS UNE PHRASE, C'EST UN MOTIF. Mesuré le même jour : 23 fiches
 * ferment leur bloc `complementOffre` sur la même redirection, reformulée à
 * chaque fois (« se traite par », « relève du », « voir le », « passez par »).
 * Elle n'est dans AUCUNE des 248 captures de la maquette : elle vient du
 * corpus rédigé. Elle répète en bas de page ce que la page entière dit déjà,
 * et sur une page d'expertise elle envoie le lecteur ailleurs juste avant
 * l'appel à l'action.
 *
 * CE QUI EST RETIRÉ, et seulement cela : la PHRASE de redirection, reconnue à
 * son verbe (`VERBES` ci-dessous). Le reste du bloc n'est jamais réécrit,
 * jamais reformulé. Règle tenue depuis le début : on signale la copie de
 * Mehdi, on ne la corrige pas.
 *
 * CE QUI N'EST PAS TOUCHÉ : les mentions du dépannage qui DISENT quelque
 * chose, par exemple « Pour une panne isolée, le dépannage industriel reste le
 * format le plus simple pour nous juger sur pièces » (`/implantations/nantes/
 * rennes/`). Elles décrivent une offre, elles ne détournent pas le lecteur.
 *
 * LE MOIGNON, piège déjà payé sur `/contact/` le même jour. Retirer la réponse
 * d'un couple question / réponse laisse la question sans réponse :
 * « Un parc entier à remettre sous suivi ? » tout seul. Quand ce qui reste
 * finit sur un point d'interrogation, ou ne contient plus rien, l'entrée
 * ENTIÈRE tombe.
 *
 * Usage :
 *   node scripts/retire-redirection-depannage.mjs            lecture seule
 *   node scripts/retire-redirection-depannage.mjs --applique  écrit les fiches
 *
 * À suivre impérativement de `node scripts/relis-relais.mjs`, sans quoi le
 * serveur continue de servir l'ancien texte.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const DOSSIER = 'supabase/import/gabarits-maquette'
const APPLIQUE = process.argv.includes('--applique')

/** Les tournures qui ne font QUE détourner vers le dépannage. */
const VERBES = [
  'se traite par le dépannage industriel',
  'se traitent par le dépannage industriel',
  'relève du dépannage industriel',
  'relèvent du dépannage industriel',
  'voir le dépannage industriel',
  'passez par le dépannage industriel',
  "c'est du dépannage industriel",
]

/** Découpe en phrases en gardant la ponctuation finale. */
function phrases(texte) {
  const out = []
  let courante = ''
  for (const c of texte) {
    courante += c
    if (c === '.' || c === '?' || c === '!') {
      out.push(courante)
      courante = ''
    }
  }
  if (courante.trim()) out.push(courante)
  return out
}

/**
 * Vrai si la phrase n'est qu'une redirection.
 *
 * LE LIEN MARKDOWN EST APLATI D'ABORD. Les SQL d'import écrivent
 * « se traite par le [dépannage industriel](/offres/depannage-industriel/) » :
 * sans aplatir, le verbe cherché est coupé par le crochet et aucune phrase ne
 * correspond. Première version du script : 26 fiches trouvées, 0 SQL, un faux
 * négatif qui aurait laissé les 26 phrases revenir à l'import.
 */
function estRedirection(phrase) {
  const p = phrase
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/''/g, "'")
    .toLowerCase()
  return VERBES.some((v) => p.includes(v))
}

/**
 * Le texte sans ses phrases de redirection, ou `null` quand il ne reste rien
 * qui tienne debout (vide, ou une question dont la réponse vient de partir).
 */
function nettoie(texte) {
  const restantes = phrases(texte).filter((p) => !estRedirection(p))
  const reste = restantes.join('').replace(/\s+/g, ' ').trim()
  if (!reste) return null
  if (reste.endsWith('?')) return null
  return reste
}

const journal = []
let fichesTouchees = 0

for (const nom of readdirSync(DOSSIER).filter((f) => f.endsWith('.json'))) {
  const chemin = `${DOSSIER}/${nom}`
  const brut = readFileSync(chemin, 'utf8')
  const fiche = JSON.parse(brut)
  const bloc = fiche?.contenu?.complementOffre
  if (!Array.isArray(bloc)) continue

  let modifiee = false
  const suivant = []
  for (const entree of bloc) {
    const texte = entree?.texte
    if (typeof texte !== 'string' || !VERBES.some((v) => texte.toLowerCase().includes(v))) {
      suivant.push(entree)
      continue
    }
    const propre = nettoie(texte)
    modifiee = true
    if (propre === null) {
      journal.push({ url: fiche.url, action: 'entrée retirée', avant: texte, apres: '' })
      continue
    }
    journal.push({ url: fiche.url, action: 'phrase retirée', avant: texte, apres: propre })
    suivant.push({ ...entree, texte: propre })
  }

  if (!modifiee) continue
  fichesTouchees += 1
  if (!APPLIQUE) continue

  // Réécriture par remplacement de la seule valeur concernée : on ne
  // re-sérialise pas la fiche entière, pour ne pas reformater 246 fichiers.
  let sortie = brut
  for (const l of journal.filter((x) => x.url === fiche.url)) {
    const cible = JSON.stringify(l.avant).slice(1, -1)
    const remplacement = l.apres ? JSON.stringify(l.apres).slice(1, -1) : null
    if (remplacement === null) continue
    if (!sortie.includes(cible)) {
      throw new Error(`valeur introuvable telle quelle dans ${nom} : ${l.avant}`)
    }
    sortie = sortie.replace(cible, remplacement)
  }
  // Les entrées entièrement retirées demandent une vraie re-sérialisation du
  // tableau : on la fait sur ce seul champ.
  if (journal.some((x) => x.url === fiche.url && x.apres === '')) {
    const relu = JSON.parse(sortie)
    relu.contenu.complementOffre = suivant
    sortie = JSON.stringify(relu, null, 2) + '\n'
  }
  writeFileSync(chemin, sortie, 'utf8')
}

console.log(`${journal.length} redirections sur ${fichesTouchees} fiches\n`)
for (const l of journal) {
  console.log(`${l.url}`)
  console.log(`  ${l.action}`)
  console.log(`  avant : ${l.avant}`)
  console.log(`  après : ${l.apres || '(entrée supprimée)'}`)
  console.log()
}
if (!APPLIQUE) console.log('LECTURE SEULE. Relancer avec --applique pour écrire.')

/* ------------------------------------------------------------------------- *
 * LES SQL D'IMPORT, deuxième passe.
 *
 * `supabase/import/contenu/*.sql` portent le même motif dans une autre forme :
 * la phrase y est noyée dans un champ `prose`, avec un lien markdown
 * `[dépannage industriel](/offres/depannage-industriel/)`. Ces fichiers ne
 * servent rien aujourd'hui (le projet Supabase n'existe pas encore), mais ils
 * SONT l'import : les laisser en l'état ferait revenir les 26 phrases le jour
 * où la base est branchée.
 *
 * On ne découpe pas en phrases tout le fichier, ce serait risqué au milieu de
 * SQL échappé. On cherche la seule occurrence du lien, on remonte et descend
 * jusqu'aux bornes de SA phrase, et on ne retire que celle-là, à la condition
 * qu'elle porte un verbe de redirection.
 * ------------------------------------------------------------------------- */

const LIEN = '[dépannage industriel](/offres/depannage-industriel/)'
const DOSSIER_SQL = 'supabase/import/contenu'

/** Les bornes de la phrase qui contient l'index `i`. */
function bornesPhrase(texte, i) {
  let debut = i
  while (debut > 0 && !'.?!'.includes(texte[debut - 1])) debut -= 1
  let fin = i
  while (fin < texte.length && !'.?!'.includes(texte[fin])) fin += 1
  if (fin < texte.length) fin += 1
  return [debut, fin]
}

const journalSql = []
let sqlTouches = 0

for (const nom of readdirSync(DOSSIER_SQL).filter((f) => f.endsWith('.sql'))) {
  const chemin = `${DOSSIER_SQL}/${nom}`
  let texte = readFileSync(chemin, 'utf8')
  let modifie = false

  for (;;) {
    const i = texte.indexOf(LIEN)
    if (i < 0) break
    const [debut, fin] = bornesPhrase(texte, i)
    const phrase = texte.slice(debut, fin)
    if (!estRedirection(phrase)) break
    journalSql.push({ fichier: nom, phrase: phrase.trim() })
    // Un seul espace reste entre les deux phrases voisines.
    texte = texte.slice(0, debut).replace(/ +$/, ' ') + texte.slice(fin).replace(/^ +/, '')
    modifie = true
  }

  if (!modifie) continue
  sqlTouches += 1
  if (APPLIQUE) writeFileSync(chemin, texte, 'utf8')
}

console.log(`\n${journalSql.length} redirections dans ${sqlTouches} fichiers SQL d'import`)
for (const l of journalSql) console.log(`  ${l.fichier}\n    ${l.phrase}`)
if (!APPLIQUE) console.log("\nLECTURE SEULE sur les SQL aussi.")

