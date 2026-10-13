#!/usr/bin/env node
/**
 * CHAQUE SECTION DOIT SE REPLIER SUR TÉLÉPHONE, SUR TOUTES LES PAGES.
 *
 * ATTENTION, SA PRÉMISSE EST SUSPENDUE DEPUIS LE 13/10 AU SOIR. Cette porte a
 * été écrite pour un arbitrage de Mehdi (« ça doit être sur toutes les
 * pages »), qui renversait sa propre règle R28 (« pas d'accordéon fermé pour le
 * contenu principal sur mobile : seulement pour la FAQ »). Dix minutes plus
 * tard, il a livré `maquette/colis-13-10/Migen Redesign Mobile.html` : le
 * mobile n'est PAS la page de bureau repliée, c'est une autre architecture,
 * « un parcours guidé par le problème, pas par le menu ». Replier les 186
 * sections aurait raccourci la mauvaise page au lieu de servir la bonne.
 *
 * ELLE RESTE UTILE COMME MESURE DE L'ÉTAT ACTUEL, et c'est à ce titre seul
 * qu'on la garde : elle dit combien de sections sont servies déroulées sur
 * téléphone. Elle ne décrit PAS la cible. Ne la rendre verte qu'une fois le
 * portage de la maquette mobile tranché.
 *
 * POURQUOI CETTE PORTE EXISTE, et c'est la leçon du 13/10. La porte du
 * responsive comptait « 92 blocs repliables à 390 px, 92 attendus » : elle
 * mesurait ce qui EXISTAIT, jamais ce qui MANQUAIT. Elle était donc verte
 * pendant que 161 sections sur 186 ne se repliaient pas, dont les 21 de
 * l'accueil, et c'est le client qui l'a vu. Une porte qui compte le présent et
 * pas l'absent ne garde rien.
 *
 * CE QU'ELLE MESURE : pour chaque page, chaque `<section>` enfant direct du
 * `<main>` doit porter un `details[data-pliable-mobile]`, et ce dépliant doit
 * être FERMÉ sous 880 px. Les exceptions sont nommées, jamais devinées.
 *
 * Usage :
 *   node scripts/verifie-repli-mobile.mjs [adresse]
 *   node scripts/verifie-repli-mobile.mjs --controle
 *   PAGES=/a/,/b/ node scripts/verifie-repli-mobile.mjs
 *   TOUTES=1 node scripts/verifie-repli-mobile.mjs      les 248 pages
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const CONTROLE = process.argv.includes('--controle')
const SITE = process.argv.find((a) => a.startsWith('http')) ?? process.env.SITE_URL ?? 'http://localhost:3000'
const LARGEUR = 390

/**
 * LES SECTIONS QUI N'ONT PAS À SE REPLIER, nommées une par une.
 *
 * Le héros est le seul motif admis : il porte le titre de la page et son appel,
 * et le replier priverait le visiteur de ce qui lui dit où il est. C'est aussi
 * ce que fait déjà /carriere/, que Mehdi a validé en disant « le repli
 * fonctionne sur /carriere/ ».
 */
export const PREMIERE_SECTION_EXEMPTE = true

/** Le verdict, en JS pur, éprouvable sans navigateur. */
export function manquements(sections) {
  return sections
    .map((s, rang) => ({ ...s, rang }))
    .filter((s) => !(PREMIERE_SECTION_EXEMPTE && s.rang === 0))
    .filter((s) => !s.aUnRepli || s.replioOuvert)
}

/* ------------------------------------------------------------------ témoin */

if (CONTROLE) {
  const EPREUVES = [
    {
      nom: 'une section sans repli est un manquement',
      sections: [{ titre: 'héros', aUnRepli: false }, { titre: 'offre', aUnRepli: false }],
      veut: 1,
    },
    {
      nom: 'le defaut du 13/10, l accueil : 21 sections, aucun repli',
      sections: Array.from({ length: 21 }, (_, i) => ({ titre: `s${i}`, aUnRepli: false })),
      veut: 20,
    },
    {
      nom: 'une section repliee mais OUVERTE est un manquement',
      sections: [{ titre: 'héros', aUnRepli: false }, { titre: 'offre', aUnRepli: true, replioOuvert: true }],
      veut: 1,
    },
    /* CONTRÔLES NÉGATIFS. */
    {
      nom: 'NÉGATIF, toutes repliees et fermees : rien a signaler',
      sections: [
        { titre: 'héros', aUnRepli: false },
        { titre: 'offre', aUnRepli: true, replioOuvert: false },
        { titre: 'faq', aUnRepli: true, replioOuvert: false },
      ],
      veut: 0,
    },
    {
      nom: 'NÉGATIF, le heros seul sans repli est accepte',
      sections: [{ titre: 'héros', aUnRepli: false }],
      veut: 0,
    },
    {
      nom: 'NÉGATIF, une page sans section ne declenche rien',
      sections: [],
      veut: 0,
    },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = manquements(e.sections).length
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`)
  process.exit(vues === EPREUVES.length ? 0 : 1)
}

/* ----------------------------------------------------------------- passage */

function pagesAVoir() {
  if (process.env.PAGES) return process.env.PAGES.split(',').map((s) => s.trim()).filter(Boolean)
  const index = JSON.parse(readFileSync('maquette/contenu/site/index.json', 'utf8'))
  const entrees = Array.isArray(index) ? index : (index.pages ?? [])
  if (process.env.TOUTES) return entrees.map((e) => e.url)
  const parGabarit = new Map()
  for (const e of entrees) if (!parGabarit.has(e.gabarit)) parGabarit.set(e.gabarit, e.url)
  /* Les pages hors index, que l'index ne connaît pas et qui existent pourtant. */
  const horsIndex = ['/', '/nous-connaitre/', '/contact/', '/rse/', '/valeurs/', '/preuves/', '/offres/']
  return [...new Set([...parGabarit.values(), ...horsIndex])]
}

const pages = pagesAVoir()
console.log(`porte du repli mobile, ${LARGEUR} px, ${pages.length} page(s) sur ${SITE}\n`)

const nav = await chromium.launch()
const page = await nav.newPage({ viewport: { width: LARGEUR, height: 850 } })

const releve = []
for (const url of pages) {
  try {
    const r = await page.goto(`${SITE}${url}`, { waitUntil: 'networkidle', timeout: 45000 })
    if (!r?.ok()) { releve.push({ url, erreur: `HTTP ${r?.status()}` }); continue }
  } catch { releve.push({ url, erreur: 'injoignable' }); continue }
  /* Le repli est posé par un effet client : il faut l'hydratation. */
  await page.waitForTimeout(1400)
  const brut = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return null
    return [...main.querySelectorAll(':scope > section')].map((s) => {
      const pli = s.querySelector('details[data-pliable-mobile]')
      const h = s.querySelector('h1, h2, h3')
      return {
        titre: (h?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 54) || '(sans titre)',
        aUnRepli: Boolean(pli),
        replioOuvert: pli ? pli.open : false,
      }
    })
  })
  if (!brut) { releve.push({ url, erreur: 'aucun <main>' }); continue }
  releve.push({ url, sections: brut.length, manques: manquements(brut) })
}
await nav.close()

const total = releve.reduce((n, r) => n + (r.manques?.length ?? 0), 0)
const sections = releve.reduce((n, r) => n + (r.sections ?? 0), 0)
const touchees = releve.filter((r) => (r.manques?.length ?? 0) > 0)
const injoignables = releve.filter((r) => r.erreur)

for (const r of touchees) {
  console.log(`  ${r.url}  ${r.manques.length} section(s) sans repli sur ${r.sections}`)
  for (const m of r.manques.slice(0, 4)) {
    console.log(`      ${m.replioOuvert ? 'OUVERTE  ' : 'SANS REPLI'} « ${m.titre} »`)
  }
  if (r.manques.length > 4) console.log(`      et ${r.manques.length - 4} de plus`)
}
for (const r of injoignables) console.log(`  ${r.url}  ${r.erreur}`)

console.log(`\n  ${total} section(s) sans repli sur ${sections} mesurée(s), ${touchees.length} page(s) touchée(s)`)
console.log('\nTémoin : node scripts/verifie-repli-mobile.mjs --controle')
if (total > 0 || injoignables.length > 0) process.exit(1)
console.log('TOUTES_LES_SECTIONS_SE_REPLIENT')
