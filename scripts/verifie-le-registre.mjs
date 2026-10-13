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

/**
 * LE DÉLAI, et pourquoi il est si large.
 *
 * Il valait 180 s. Or `verifie-responsive.mjs` mesure 154,9 s contre la
 * production : 25 s de marge sur une porte qui dépend du réseau. Le 13/10 au
 * soir, elle est passée au premier passage, a été TUÉE au second une ligne
 * avant son verdict, et a repassé seule aussitôt après. Le vérificateur
 * l'annonçait alors PROMESSE ROMPUE : il accusait une promesse tenue, sur un
 * problème de chronomètre.
 *
 * Un vérificateur qui invente des ruptures est aussi nuisible que celui qui
 * laisse passer les vraies : les deux font qu'on cesse de le croire.
 */
const DELAI = 600000

/**
 * LES SIGNATURES D'UNE COMMANDE QUI N'A RIEN PROUVÉ.
 * `MESURE NON CONCLUANTE` est le mot que les portes de ce dépôt emploient
 * quand elles ont renoncé : la lire comme un verdict serait accuser au hasard.
 */
const RIEN_PROUVE = /ERR_UNKNOWN_FILE_EXTENSION|command not found|No such file|MESURE NON CONCLUANTE/

/** Les couples CHECK / EXPECT, dans l'ordre du registre, avec leur entrée. */
function lisLeRegistre(texte) {
  const lignes = texte.split('\n')
  const promesses = []
  let entree = '?'
  let etat = '?'
  let commande = null
  for (const ligne of lignes) {
    /* `G` pour les séries 1 à 4, `D` pour les demandes du 13/10. Sans le `D`,
       les dix-neuf entrées de la série 5 étaient toutes attribuées au dernier
       `G` rencontré, et le rapport nommait la mauvaise entrée comme rompue. */
    const titre = ligne.match(/^### ([GD]\d+) — (.+)$/)
    if (titre) {
      entree = titre[1]
      etat = '?'
      continue
    }
    /* L'ÉTAT DE LA CASE, et c'est le troisième défaut trouvé le 13/10 : il
       n'était pas lu du tout. Sept mesures qui passent sous une entrée
       DÉCLARÉE NON FAITE étaient comptées « promesses tenues », et le rapport
       annonçait 46 vertes sur 49. Qui lit ce compte conclut que le travail est
       fait. C'est exactement la tranquillité sans la garantie que cette porte
       existe pour tuer.
       Il faut donc croiser les deux : une case cochée dont la commande échoue
       est une PROMESSE ROMPUE, le vrai scandale ; une case non cochée dont la
       commande échoue est un chantier ouvert que sa porte confirme, ce qui est
       cohérent ; une case non cochée dont la commande passe mesure autre chose
       que le correctif, et doit être requalifiée. */
    const coche = ligne.match(/^- \[([ x~])\]/)
    if (coche && etat === '?') {
      etat = coche[1]
      continue
    }
    const check = ligne.match(/^\s*CHECK: (.+)$/)
    if (check) {
      commande = check[1].trim()
      continue
    }
    const attendu = ligne.match(/^\s*EXPECT: (.+)$/)
    if (attendu && commande) {
      promesses.push({ entree, etat, commande, attendu: attendu[1].trim() })
      commande = null
    }
  }
  return promesses
}

/**
 * La sortie satisfait-elle la promesse ?
 * Rend `true`, `false`, ou `null` quand l'attente est illisible.
 */
/* Pas de `\b` : il n'existe aucune frontière de mot avant un « à », qui
   n'est pas un caractère de mot pour JavaScript. La première version de ce
   garde-fou ne s'est jamais déclenchée pour cette raison, et son contrôle
   négatif l'a dit tout de suite. */
const INDEFINIE = /(?:^|[^a-z])[àa] (?:re)?d[ée]finir|(?:^|[^a-z])[àa] pr[ée]ciser|(?:^|[^a-z])[àa] compl[ée]ter/

function tient(sortie, attendu) {
  const s = sortie.replace(/\s+/g, ' ').toLowerCase()
  const a = attendu.replace(/\s+/g, ' ').toLowerCase().trim()

  /* UNE ATTENTE QUI SE DÉCLARE INDÉFINIE NE DÉCIDE RIEN. Défaut trouvé le
     13/10 : G35 promettait « à redéfinir une fois les 385 photos classées par
     sujet dominant » et comptait pour une PROMESSE TENUE, au seul motif que
     « 385 » paraissait dans la sortie. Une attente à redéfinir est illisible
     par construction, et son aveu ne doit pas se lire comme une assertion. */
  if (INDEFINIE.test(a)) return null

  /* « AU MOINS N » EXIGE N. Deuxième défaut du 13/10 : le seuil était jeté et
     seul « un nombre plus grand que zéro » était vérifié, si bien que
     « au moins 9 » se satisfaisait d'une sortie « 1 ». Prouvé en rejouant la
     fonction : tient('1', 'au moins 9') rendait true. Une porte qui ne sait
     pas échouer sur son propre seuil ne vaut rien. */
  const seuil = a.match(/^au moins (\d+)/)
  if (seuil) {
    const plancher = Number(seuil[1])
    const nombres = (s.match(/\d+/g) ?? []).map(Number)
    return nombres.some((n) => n >= plancher)
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
    /* LES TROIS DÉFAUTS DU 13/10, chacun avec son contrôle négatif. */
    { nom: 'un seuil satisfait, 14 pour « au moins 9 »', sortie: '14', attendu: 'au moins 9', veut: true },
    {
      nom: 'NÉGATIF, LE SEUIL JETÉ : « au moins 9 » ne se satisfait pas de 1',
      sortie: '1',
      attendu: 'au moins 9',
      veut: false,
    },
    { nom: 'un seuil juste atteint, 2 pour « au moins 2 »', sortie: '2', attendu: 'au moins 2', veut: true },
    {
      nom: 'NÉGATIF, UNE ATTENTE À REDÉFINIR est illisible, même si son nombre paraît',
      sortie: '385 photos au registre, 246 fiches lues',
      attendu: 'à redéfinir une fois les 385 photos classées par sujet dominant',
      veut: null,
    },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = tient(e.sortie, e.attendu)
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${JSON.stringify(e.veut)}, obtenu ${JSON.stringify(obtenu)}`)
  }

  /* L'ÉTAT DE LA CASE est-il bien lu, et rattaché à la BONNE entrée ? */
  const FAUX_REGISTRE = [
    '### G1 — une entrée déclarée faite',
    '- [x] FAIT',
    '      CHECK: echo un',
    '      EXPECT: un',
    '### G2 — une entrée déclarée non faite',
    '- [ ] PAS FAIT',
    '      CHECK: echo deux',
    '      EXPECT: deux',
    '### D3 — une entrée partielle',
    '- [~] PARTIELLEMENT FAIT',
    '      CHECK: echo trois',
    '      EXPECT: trois',
  ].join('\n')
  const lues = lisLeRegistre(FAUX_REGISTRE)
  const attendus = [
    ['G1', 'x'],
    ['G2', ' '],
    ['D3', '~'],
  ]
  const etatsJustes =
    lues.length === 3 && attendus.every(([e, c], i) => lues[i].entree === e && lues[i].etat === c)
  if (etatsJustes) vues += 1
  console.log(`  ${etatsJustes ? 'OK   ' : 'ÉCHEC'}  l'état de chaque case est lu et rattaché à son entrée`)
  if (!etatsJustes) console.log(`           obtenu ${JSON.stringify(lues.map((l) => [l.entree, l.etat]))}`)


  /* UNE MESURE COUPÉE est-elle reconnue comme telle, et NON comme une rupture ?
     Éprouvé pour de vrai, avec un délai court : la commande annonce son début,
     dort, puis écrirait son verdict. Tuée avant, sa sortie tronquée ne porte
     pas le verdict, et la lire au pied de la lettre la ferait passer pour
     rompue. C'est le défaut exact subi par G57 le 13/10 au soir. */
  let coupeeVue = false
  try {
    execSync('echo debut; sleep 5; echo VERDICT_ECRIT', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 400,
      shell: '/bin/bash',
    })
  } catch (e) {
    const reconnue = e.code === 'ETIMEDOUT' || !!e.signal
    const auraitAccuse = tient(`${e.stdout ?? ''}${e.stderr ?? ''}`, 'VERDICT_ECRIT')
    coupeeVue = reconnue && auraitAccuse === false
  }
  if (coupeeVue) vues += 1
  /* ET QU'UNE EXCEPTION NON RATTRAPÉE soit reconnue, non comptée pour rompue. */
  let planteeVue = false
  try {
    execSync('node -e "throw new Error(\'la page ne repond pas\')"', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 20000,
      shell: '/bin/bash',
    })
  } catch (e) {
    const brut = `${e.stdout ?? ''}${e.stderr ?? ''}`
    planteeVue =
      !(e.stdout ?? '').trim() && /^Node\.js v\d/m.test(brut) && /\n\s+at /.test(brut) && !e.signal
  }
  if (planteeVue) vues += 1
  /* ET QUE LES SIGNATURES DU « RIEN PROUVÉ » soient reconnues, sans happer au
     passage une porte qui a bel et bien mesuré puis échoué. */
  const MOTIFS = [
    ['ERR_UNKNOWN_FILE_EXTENSION', true],
    ['bash: bun: command not found', true],
    ['MESURE NON CONCLUANTE : 10 page(s) sur 10 injoignable(s)', true],
    /* NÉGATIFS : ces deux-là ONT mesuré, et doivent rester des ruptures. */
    ['/secteurs/ : 2 écart(s) à la capture', false],
    ['  18   TOTAL dans le <main>', false],
  ]
  const motifsJustes = MOTIFS.every(([texte, veut]) => RIEN_PROUVE.test(texte) === veut)
  if (motifsJustes) vues += 1
  console.log(
    `  ${motifsJustes ? 'OK   ' : 'ÉCHEC'}  « rien prouvé » est distingué d'une porte qui a mesuré puis échoué`,
  )
  console.log(
    `  ${planteeVue ? 'OK   ' : 'ÉCHEC'}  NÉGATIF, une exception non rattrapée est reconnue, pas comptée pour rompue`,
  )
  console.log(
    `  ${coupeeVue ? 'OK   ' : 'ÉCHEC'}  NÉGATIF, une mesure coupée est reconnue, et sa sortie tronquée aurait accusé à tort`,
  )

  console.log(`\ntémoin : ${vues}/${EPREUVES.length + 4} épreuves réussies`)
  process.exit(vues === EPREUVES.length + 4 ? 0 : 1)
}

/* --------------------------------------------------------------- le passage */

const promesses = lisLeRegistre(readFileSync(REGISTRE, 'utf8'))
console.log(`${promesses.length} promesse(s) au registre, lancées une par une\n`)

const tenues = []
const rompues = []
const illisibles = []
const plantees = []
/* Mesure coupée en cours de route : rien n'est prouvé, ni dans un sens ni dans
   l'autre. À ne jamais verser parmi les ruptures. */
const interrompues = []
/* Une entrée NON COCHÉE dont la porte échoue : chantier ouvert, et sa porte le
   confirme. Ce n'est pas un mensonge du registre, c'est un travail à faire. */
const ouverts = []
/* Une entrée NON COCHÉE dont la porte PASSE : sa commande mesure autre chose
   que le correctif, ou le registre est en retard sur le travail. À requalifier,
   et surtout à ne jamais compter parmi les promesses tenues. */
const requalifier = []

for (const p of promesses) {
  let sortie = ''
  let code = 0
  try {
    sortie = execSync(p.commande, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: DELAI,
      shell: '/bin/bash',
    })
  } catch (erreur) {
    code = erreur.status ?? 1
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`
    /* UNE MESURE INTERROMPUE N'EST PAS UNE PROMESSE ROMPUE. Un dépassement de
       délai rend `code: 'ETIMEDOUT'` et `signal: 'SIGTERM'`, avec une sortie
       TRONQUÉE À L'ENDROIT OÙ LE COUTEAU EST TOMBÉ. La lire comme un verdict,
       c'est accuser au hasard : le verdict n'a simplement pas été écrit. */
    if (erreur.code === 'ETIMEDOUT' || erreur.signal) {
      interrompues.push({
        ...p,
        motif: `mesure coupée (${erreur.code ?? 'tuée'}, signal ${erreur.signal ?? '?'}) après ${Math.round(DELAI / 1000)} s`,
      })
      continue
    }
    /* UNE COMMANDE QUI PLANTE N'EST PAS UNE PREUVE. `node` sur un script qui
       importe du TypeScript rend `ERR_UNKNOWN_FILE_EXTENSION` : la promesse
       n'a jamais pu être vérifiée par cette commande. */
    if (RIEN_PROUVE.test(sortie)) {
      plantees.push({
        ...p,
        motif:
          sortie.split('\n').find((l) => /Error|not found|MESURE NON CONCLUANTE/.test(l))?.trim() ?? 'échec',
      })
      continue
    }
    /* UNE EXCEPTION NON RATTRAPÉE N'EST PAS UN VERDICT NON PLUS. Une porte qui
       meurt sur une pile d'appels, sans avoir rien écrit sur sa sortie
       standard, n'a mesuré quoi que ce soit. Le 13/10 au soir, G63 a été
       annoncée PROMESSE ROMPUE pour cette raison : sa page n'était pas servie,
       elle est morte sur un `throw`, 0 octet de sortie standard et 654 de pile.
       Reste fatal, mais nommé pour ce que c'est. */
    if (!(erreur.stdout ?? '').trim() && /^Node\.js v\d/m.test(sortie) && /\n\s+at /.test(sortie)) {
      plantees.push({
        ...p,
        motif: `exception non rattrapée, 0 octet de sortie : ${
          sortie.split('\n').find((l) => /Error|throw/.test(l))?.trim().slice(0, 120) ?? 'pile seule'
        }`,
      })
      continue
    }
  }
  const verdict = tient(sortie, p.attendu)
  const declaree = p.etat === 'x'
  const trace = { ...p, sortie: sortie.trim().slice(0, 200), code }
  if (verdict === null) illisibles.push({ ...p, sortie: sortie.trim().slice(0, 120) })
  else if (verdict) (declaree ? tenues : requalifier).push(trace)
  else (declaree ? rompues : ouverts).push(trace)
}

console.log(`  tenues       : ${tenues.length}   (entrée déclarée FAITE, sa porte passe)`)
console.log(`  rompues      : ${rompues.length}   (entrée déclarée FAITE, sa porte ÉCHOUE)`)
console.log(`  illisibles   : ${illisibles.length}`)
console.log(`  plantées     : ${plantees.length}`)
console.log(`  interrompues : ${interrompues.length}   (mesure coupée, rien n'est prouvé)`)
console.log(`  ouverts      : ${ouverts.length}   (entrée NON cochée, sa porte échoue : cohérent)`)
console.log(`  à requalifier: ${requalifier.length}   (entrée NON cochée, sa porte passe)`)

if (plantees.length) {
  console.log('\nCOMMANDES QUI PLANTENT, donc qui n\'ont jamais rien prouvé :')
  for (const p of plantees) console.log(`  ${p.entree}  ${p.commande}\n      ${p.motif}`)
}
if (interrompues.length) {
  console.log('\nMESURES INTERROMPUES, donc sans verdict. Ce ne sont PAS des ruptures :')
  for (const p of interrompues) console.log(`  ${p.entree}  ${p.commande}\n      ${p.motif}`)
}
if (rompues.length) {
  console.log('\nPROMESSES ROMPUES :')
  for (const p of rompues) {
    console.log(`  ${p.entree}  attendu « ${p.attendu} »`)
    console.log(`      commande : ${p.commande}`)
    console.log(`      sortie en ${p.code === 0 ? 'succès' : `échec, code ${p.code}`}`)
    console.log(`      rendu    : ${p.sortie.split('\n')[0]}`)
  }
}
if (illisibles.length) {
  console.log('\nATTENTES ILLISIBLES, défaut du registre et non de la commande :')
  for (const p of illisibles) console.log(`  ${p.entree}  « ${p.attendu} »\n      rendu : ${p.sortie.split('\n')[0]}`)
}
if (ouverts.length) {
  console.log('\nCHANTIERS OUVERTS, déclarés non faits ET confirmés par leur porte :')
  for (const p of ouverts) console.log(`  [${p.etat}] ${p.entree}  attendu « ${p.attendu} »\n      rendu : ${p.sortie.split('\n')[0]}`)
}
if (requalifier.length) {
  console.log('\nÀ REQUALIFIER, déclarés non faits mais leur porte PASSE :')
  console.log('  Leur commande mesure un état, pas le correctif. À ne pas lire comme fait.')
  for (const p of requalifier) console.log(`  [${p.etat}] ${p.entree}  attendu « ${p.attendu} »`)
}

/* LE VERDICT PORTE SUR L'HONNÊTETÉ DU REGISTRE, pas sur l'achèvement du site.
   Reste fatal tout ce qui le rend menteur : une entrée déclarée faite dont la
   porte échoue, une attente qu'on ne peut pas trancher, une commande qui plante.
   Un chantier déclaré ouvert et confirmé ouvert ne mentit pas : le compter
   fatal rendrait cette porte rouge à jamais, donc jamais lancée, et c'est
   précisément la panne qui a coûté la journée du 12/10. */
if (rompues.length || plantees.length || illisibles.length || interrompues.length) process.exit(1)
console.log(
  `\nREGISTRE_HONNETE : ${tenues.length} promesse(s) déclarée(s) faite(s) tiennent, ` +
    `${ouverts.length} chantier(s) ouvert(s) assumé(s), ${requalifier.length} à requalifier. ` +
    `Aucune promesse rompue, aucune attente illisible, aucune commande plantée, ` +
    `aucune mesure interrompue.`,
)
