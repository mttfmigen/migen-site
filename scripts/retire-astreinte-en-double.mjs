#!/usr/bin/env node
/**
 * L'ASTREINTE QUI SE RÉPÈTE : une seule règle, appliquée partout.
 *
 * POURQUOI. Mehdi, le 12/10, sur `/expertises/electromecanique/` : « Ce bloc
 * ça va pas », puis « y'a le même problème en faite sur toutes les pages
 * expertises sur ce bloc ».
 *
 * LE DÉFAUT. Le sujet nomme les périodes, et le prédicat les renomme :
 *
 *   L'astreinte LA NUIT, LE WEEK-END ET LES JOURS FÉRIÉS couvre
 *   LA NUIT ET LE WEEK-END sur les sites concernés.
 *
 * 50 phrases, 18 formulations, et aucune dans les 248 captures de la maquette.
 *
 * LA CAUSE RACINE, et c'est la vraie leçon. Un renommage global a remplacé une
 * forme courte, « l'astreinte 24/24 et 7/7 », par la forme longue « l'astreinte
 * la nuit, le week-end et les jours fériés », SANS toucher aux prédicats qui
 * nommaient déjà les périodes. Les SQL d'import en gardent la trace :
 * `expertises-mecanique.sql` écrit encore « L'astreinte 24/24 et 7/7 prend le
 * relais en dehors de ces horaires ». Un remplacement de chaîne qui ne relit
 * pas la phrase produit mécaniquement ce bredouillement.
 *
 * LA RÈGLE, UNE SEULE : quand un PRÉDICAT suit et nomme déjà les périodes, le
 * sujet revient à sa forme courte, « l'astreinte ». Le prédicat porte les
 * périodes, c'est son rôle, et c'est la forme que le corpus emploie déjà :
 * « L'astreinte prend le relais la nuit, le week-end et les jours fériés. »
 *
 * MA PREMIÈRE PASSE AVAIT CORRIGÉ DANS LE MAUVAIS SENS. Elle coupait la liste
 * du PRÉDICAT et gardait le sujet long, ce qui donnait « L'astreinte la nuit,
 * le week-end et les jours fériés prend le relais. » : complet, mais raide, et
 * incohérent avec les deux pages qui écrivaient déjà la bonne forme. La règle B
 * ci-dessous remet ces phrases d'aplomb.
 *
 * CE QUI N'EST JAMAIS TOUCHÉ : la forme longue employée comme NOM de l'option,
 * sans prédicat, par exemple un intitulé de liste « Astreinte la nuit, le
 * week-end et les jours fériés ». Les règles ne se déclenchent que devant un
 * prédicat. Deux contrôles négatifs le prouvent.
 *
 * Usage :
 *   node scripts/retire-astreinte-en-double.mjs             lecture seule
 *   node scripts/retire-astreinte-en-double.mjs --applique  écrit
 *   node scripts/retire-astreinte-en-double.mjs --controle   prouve qu'il sait échouer
 *
 * À suivre impérativement de `node scripts/relis-relais.mjs`.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const APPLIQUE = process.argv.includes('--applique')
const CONTROLE = process.argv.includes('--controle')

const DOSSIERS = ['supabase/import/gabarits-maquette', 'supabase/import/contenu']

/** La liste des périodes, dans ses deux nombres et toutes ses combinaisons. */
const PERIODE = "(?:la nuit|le week-end|les jours f[eé]ri[eé]s|les nuits|les week-ends)"

/**
 * Le sujet long. Le mot lui-même est CAPTURÉ, casse comprise : il ouvre parfois
 * la phrase (« Astreinte... ») et le réécrire en minuscules détruirait la
 * majuscule. Le témoin l'a attrapé.
 */
const SUJET = "(l'|L')?(astreinte|Astreinte)\\s+la nuit,\\s*le week-end et les jours f[eé]ri[eé]s"

/**
 * RÈGLE A. Un prédicat suit et nomme déjà une période : le sujet redevient
 * court. Ce qui sépare le sujet de la période renommée ne doit lui-même
 * contenir aucune période, sinon on mordrait sur la phrase suivante.
 */
const REGLE_A = new RegExp(
  `${SUJET}((?:(?!${PERIODE})[^.\\"]){0,90}?\\b${PERIODE})`,
  'g',
)

/**
 * RÈGLE B. Ce que ma première passe a produit : un sujet long suivi d'un
 * prédicat qui ne nomme plus aucune période. La liste retourne au prédicat,
 * à sa place.
 */
const REGLE_B =
  /(l'|L')?(astreinte|Astreinte)\s+la nuit,\s*le week-end et les jours f[eé]ri[eé]s(,\s*en option,)?\s+prend le relais(?=\s*[.,])/g

/**
 * Recolle un sujet raccourci à ce qui le suit.
 *
 * PAS D'ESPACE DEVANT UNE PONCTUATION. La suite commence parfois par une
 * virgule (« , en option, couvre... ») : une espace insérée aveuglément donnait
 * « L'astreinte , en option, ». Le témoin l'a attrapé.
 */
function recolle(debut, suite) {
  const s = suite.replace(/^\s+/, '')
  return /^[,.;:!?)]/.test(s) ? `${debut}${s}` : `${debut} ${s}`
}

/** La phrase corrigée. Les deux règles, dans cet ordre. */
function corrige(texte) {
  return texte
    .replace(REGLE_A, (_tout, article, mot, suite) => recolle(`${article ?? ''}${mot}`, suite))
    .replace(REGLE_B, (_tout, article, mot, option) =>
      recolle(
        `${article ?? ''}${mot}`,
        `${option ? 'en option ' : ''}prend le relais la nuit, le week-end et les jours fériés`,
      ),
    )
}

/* ------------------------------------------------------------------ contrôle */

if (CONTROLE) {
  const EPREUVES = [
    {
      nom: 'le verbe couvre, périodes renommées',
      avant:
        "L'astreinte la nuit, le week-end et les jours fériés couvre la nuit et le week-end sur les sites concernés.",
      apres: "L'astreinte couvre la nuit et le week-end sur les sites concernés.",
    },
    {
      nom: 'la liste entière renommée au pluriel',
      avant:
        "L'astreinte la nuit, le week-end et les jours fériés couvre les nuits, les week-ends et les jours fériés.",
      apres: "L'astreinte couvre les nuits, les week-ends et les jours fériés.",
    },
    {
      nom: 'en option intercalé entre le sujet et le verbe',
      avant:
        "L'astreinte la nuit, le week-end et les jours fériés, en option, couvre les nuits, les week-ends et les jours fériés.",
      apres: "L'astreinte, en option, couvre les nuits, les week-ends et les jours fériés.",
    },
    {
      nom: 'sans article, en tête de phrase',
      avant:
        "Astreinte la nuit, le week-end et les jours fériés en option pour les nuits, les week-ends et les jours fériés.",
      apres: "Astreinte en option pour les nuits, les week-ends et les jours fériés.",
    },
    {
      nom: 'sujet long au milieu d une énumération',
      avant:
        "L'engagement tenu est le rappel dans l'heure aux horaires ouvrés, et l'astreinte la nuit, le week-end et les jours fériés en option pour la nuit et le week-end.",
      apres:
        "L'engagement tenu est le rappel dans l'heure aux horaires ouvrés, et l'astreinte en option pour la nuit et le week-end.",
    },
    {
      nom: 'une condition sur l exploitation du client',
      avant:
        "L'astreinte la nuit, le week-end et les jours fériés s'ajoute en option si votre exploitation tourne le week-end.",
      apres: "L'astreinte s'ajoute en option si votre exploitation tourne le week-end.",
    },
    {
      nom: 'RÈGLE B, ce que la première passe avait produit',
      avant:
        "Rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30. L'astreinte la nuit, le week-end et les jours fériés prend le relais.",
      apres:
        "Rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30. L'astreinte prend le relais la nuit, le week-end et les jours fériés.",
    },
    {
      /* CONTRÔLE NÉGATIF. La forme longue employée comme NOM de l'option, sans
         aucun prédicat : c'est l'intitulé du service, il doit rester entier.
         Sans cette épreuve, une règle trop large le tronquerait et le site
         perdrait le nom de ce qu'il vend. */
      nom: 'NÉGATIF, le nom de l option sans prédicat reste entier',
      avant: "Astreinte la nuit, le week-end et les jours fériés",
      apres: "Astreinte la nuit, le week-end et les jours fériés",
    },
    {
      /* DEUXIÈME CONTRÔLE NÉGATIF : un prédicat qui ne renomme AUCUNE période
         est déjà correct, le sujet long y est informatif. */
      nom: 'NÉGATIF, un prédicat sans période reste intact',
      avant:
        "L'astreinte la nuit, le week-end et les jours fériés est facturée au forfait, sans surcoût de déplacement.",
      apres:
        "L'astreinte la nuit, le week-end et les jours fériés est facturée au forfait, sans surcoût de déplacement.",
    },
    {
      /* TROISIÈME CONTRÔLE NÉGATIF : la forme courte déjà correcte, qui existe
         sur deux pages du corpus, ne doit pas être retouchée. */
      nom: 'NÉGATIF, la forme déjà correcte ne bouge pas',
      avant: "L'astreinte prend le relais la nuit, le week-end et les jours fériés.",
      apres: "L'astreinte prend le relais la nuit, le week-end et les jours fériés.",
    },
  ]

  let reussies = 0
  for (const e of EPREUVES) {
    const obtenu = corrige(e.avant)
    const ok = obtenu === e.apres
    if (ok) reussies += 1
    console.log(`  ${ok ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!ok) {
      console.log(`           attendu : ${e.apres}`)
      console.log(`           obtenu  : ${obtenu}`)
    }
  }
  const negatives = EPREUVES.filter((e) => e.nom.startsWith('NÉGATIF')).length
  console.log(
    `\ntémoin : ${reussies}/${EPREUVES.length} épreuves réussies ` +
      `(${EPREUVES.length - negatives} redondances à corriger, ${negatives} contrôles négatifs à laisser intacts)`,
  )
  process.exit(reussies === EPREUVES.length ? 0 : 1)
}

/* ------------------------------------------------------------------- passage */

const journal = []
let fichiersTouches = 0

for (const dossier of DOSSIERS) {
  for (const nom of readdirSync(dossier)) {
    if (!/\.(json|sql)$/.test(nom)) continue
    const chemin = `${dossier}/${nom}`
    const avant = readFileSync(chemin, 'utf8')
    const apres = corrige(avant)
    if (apres === avant) continue
    fichiersTouches += 1
    for (const m of avant.matchAll(REGLE_A)) journal.push({ chemin, regle: 'A', phrase: m[0] })
    for (const m of avant.matchAll(REGLE_B)) journal.push({ chemin, regle: 'B', phrase: m[0] })
    if (APPLIQUE) writeFileSync(chemin, apres, 'utf8')
  }
}

console.log(`${journal.length} corrections dans ${fichiersTouches} fichiers`)
const parRegle = journal.reduce((a, l) => ({ ...a, [l.regle]: (a[l.regle] ?? 0) + 1 }), {})
console.log(`  règle A, sujet raccourci : ${parRegle.A ?? 0}`)
console.log(`  règle B, liste rendue au prédicat : ${parRegle.B ?? 0}\n`)
for (const l of journal) console.log(`  [${l.regle}] ${l.chemin}\n      ${l.phrase}`)
if (!APPLIQUE) console.log('\nLECTURE SEULE. Relancer avec --applique pour écrire.')
