#!/usr/bin/env node
/**
 * AUCUN TITRE DE SECTION NE DOIT ÊTRE PERDU SUR GRAND ÉCRAN.
 *
 * LE DÉFAUT QU'ELLE ATTRAPE, et c'est un retour du client. Mehdi, le 11/10 :
 * « Il y'a un pb avec les titre H2 et la disposition de la page (fiche
 * metier) », et « La page fiche pratique est mal agencé ».
 *
 * LA CAUSE, mesurée au navigateur le 13/10. `SectionPliableMobile` rend le
 * titre de section DANS le `<summary>` du `<details>` qui replie la section sur
 * téléphone. Au-dessus de 880 px, cinq gabarits masquent ce `<summary>`
 * (`display: none`) pour retirer un `<summary>` focalisable mais sans fonction.
 *
 * Chez trois d'entre eux, le titre est rendu une SECONDE fois hors de la
 * bascule : masquer la bascule retire un doublon, le titre reste. Chez les
 * autres, il n'y a qu'une copie, et le visiteur de bureau ne voit PLUS LE
 * TITRE. Mesuré : /ressources/fiches-pratiques/5s/ sert « La mise en place,
 * étape par étape » une seule fois, dans une bascule masquée. Zéro titre vu.
 *
 * CE QU'ELLE MESURE, et c'est le point délicat : elle ne reproche pas à un
 * gabarit de masquer sa bascule. Elle vérifie une seule chose, celle qui
 * compte pour le visiteur : le texte d'une bascule masquée se retrouve-t-il
 * ailleurs sur la page, DANS UN ÉLÉMENT RÉELLEMENT VU ? Un titre en double
 * dont une copie est masquée est donc tenu pour correct, et c'est voulu.
 *
 * Usage :
 *   node scripts/verifie-titres-de-section.mjs [adresse]
 *   node scripts/verifie-titres-de-section.mjs --controle
 *   PAGES=/a/,/b/ node scripts/verifie-titres-de-section.mjs
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const CONTROLE = process.argv.includes('--controle')
const SITE = process.argv.find((a) => a.startsWith('http')) ?? process.env.SITE_URL ?? 'http://localhost:3000'
const LARGEUR_BUREAU = 1280

/**
 * Le verdict, écrit en JS pur pour être éprouvable sans navigateur.
 * `bascules` : [{ texte, masquee }]. `textesVus` : les textes visibles ailleurs.
 */
export function titresPerdus(bascules, textesVus) {
  const vus = new Set(textesVus.map(normalise))
  /* Le titre est tenu pour servi si SOIT son libellé seul, SOIT l'étiquette
     complète (surtitre + titre) se retrouve dans un élément vu. Les deux
     formes existent : certains gabarits rendent le surtitre à part, d'autres
     les gardent dans un même conteneur. */
  return bascules
    .filter((b) => b.masquee)
    .map((b) => ({ ...b, cle: normalise(b.texte), cleComplete: normalise(b.complete ?? b.texte) }))
    .filter((b) => b.cle.length > 0 && !vus.has(b.cle) && !vus.has(b.cleComplete))
}

/** Un texte comparable : espaces resserrés, apostrophes et insécables unifiées. */
export function normalise(s) {
  return (s ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/[  ]/g, ' ')
    .replace(/[›‹>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/* ------------------------------------------------------------------ témoin */

if (CONTROLE) {
  const EPREUVES = [
    {
      nom: 'un titre masqué et introuvable ailleurs est PERDU',
      bascules: [{ texte: 'Ce que nous garantissons', masquee: true }],
      vus: ['Un autre titre'],
      veut: 1,
    },
    {
      /* CONTRÔLE NÉGATIF : le cas des trois gabarits qui doublent leur titre.
         La porte doit se taire, sinon elle accuse 1092 blocs à tort. */
      nom: 'NÉGATIF, un titre masqué mais rendu ailleurs n\'est pas perdu',
      bascules: [{ texte: 'Ce que nous avons mis en place', masquee: true }],
      vus: ['Ce que nous avons mis en place'],
      veut: 0,
    },
    {
      nom: 'NÉGATIF, une bascule VISIBLE n\'est jamais perdue',
      bascules: [{ texte: 'Nos références', masquee: false }],
      vus: [],
      veut: 0,
    },
    {
      nom: 'NÉGATIF, une bascule vide n\'est pas un titre perdu',
      bascules: [{ texte: '  › ', masquee: true }],
      vus: [],
      veut: 0,
    },
    {
      nom: 'la comparaison survit à l\'apostrophe typographique et à l\'insécable',
      bascules: [{ texte: 'L’offre : ce qu’on fait', masquee: true }],
      vus: ["L'offre : ce qu'on fait"],
      veut: 0,
    },
    {
      nom: 'le chevron de la bascule ne fait pas rater la correspondance',
      bascules: [{ texte: 'Notre parti pris ›', masquee: true }],
      vus: ['Notre parti pris'],
      veut: 0,
    },
    {
      /* CONTRÔLE NÉGATIF du déshabillage : un gabarit qui rend surtitre et
         titre dans un même conteneur doit satisfaire la porte par l'étiquette
         COMPLÈTE, alors que le libellé seul ne s'y trouve pas. */
      nom: 'NÉGATIF, la correspondance par étiquette complète suffit',
      bascules: [
        { texte: 'Cinq façons de travailler chez Migen', complete: '02 · Nos formatsCinq façons de travailler chez Migen', masquee: true },
      ],
      vus: ['02 · Nos formatsCinq façons de travailler chez Migen'],
      veut: 0,
    },
    {
      nom: 'un titre perdu reste perdu même avec les deux formes testées',
      bascules: [{ texte: 'La mise en place, étape par étape', complete: '03La mise en place, étape par étape', masquee: true }],
      vus: ['Un tout autre texte'],
      veut: 1,
    },
  ]
  let vues = 0
  for (const e of EPREUVES) {
    const obtenu = titresPerdus(e.bascules, e.vus).length
    const juste = obtenu === e.veut
    if (juste) vues += 1
    console.log(`  ${juste ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!juste) console.log(`           attendu ${e.veut}, obtenu ${obtenu}`)
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`)
  process.exit(vues === EPREUVES.length ? 0 : 1)
}

/* ------------------------------------------------------------------ passage */

/** Les pages à voir : l'argument, sinon une par gabarit, lue dans l'index. */
function pagesAVoir() {
  if (process.env.PAGES) return process.env.PAGES.split(',').map((s) => s.trim()).filter(Boolean)
  const index = JSON.parse(readFileSync('maquette/contenu/site/index.json', 'utf8'))
  const entrees = Array.isArray(index) ? index : (index.pages ?? [])
  if (process.env.TOUTES) return entrees.map((e) => e.url)
  /* Une page par gabarit, puis celles que le client a nommées. */
  const parGabarit = new Map()
  for (const e of entrees) if (!parGabarit.has(e.gabarit)) parGabarit.set(e.gabarit, e.url)
  const nommees = ['/ressources/fiches-pratiques/5s/', '/carriere/', '/offres/residence/']
  return [...new Set([...parGabarit.values(), ...nommees])]
}

const pages = pagesAVoir()
console.log(`porte des titres de section, ${LARGEUR_BUREAU} px, ${pages.length} page(s) sur ${SITE}\n`)

const nav = await chromium.launch()
const page = await nav.newPage({ viewport: { width: LARGEUR_BUREAU, height: 900 } })

const releve = []
for (const url of pages) {
  try {
    await page.goto(`${SITE}${url}`, { waitUntil: 'networkidle', timeout: 45000 })
  } catch {
    releve.push({ url, erreur: 'page injoignable' })
    continue
  }
  await page.waitForTimeout(350)
  const brut = await page.evaluate(() => {
    const vu = (e) => {
      let n = e
      while (n) {
        const s = getComputedStyle(n)
        if (s.display === 'none' || s.visibility === 'hidden') return false
        n = n.parentElement
      }
      return e.getBoundingClientRect().height > 0
    }
    /* L'ÉTIQUETTE DE LA BASCULE, DÉSHABILLÉE DE SES ORNEMENTS MOBILES.
       Le `<summary>` porte aussi le chevron et les deux lignes de résumé, tous
       deux marqués `data-mobile-seulement` et tous deux absents du grand
       écran. Les garder dans la comparaison, c'est chercher ailleurs sur la
       page une chaîne « titre + résumé » qui n'y est jamais : la porte
       accuserait alors 1092 blocs à tort. Le même piège a déjà faussé trois
       portes de ce projet, par un déshabillage non récursif ; ici on CLONE et
       on RETIRE les nœuds, ce qui est récursif par construction.

       Quand la bascule porte un élément de titre (`.titre`), c'est lui qui
       fait foi : le surtitre peut être rendu séparément ailleurs. */
    const etiquette = (s) => {
      const c = s.cloneNode(true)
      for (const o of c.querySelectorAll('[data-mobile-seulement]')) o.remove()
      const titre = [...c.querySelectorAll('*')].find((e) =>
        /titre/i.test((e.className || '').toString()),
      )
      return {
        complete: c.textContent ?? '',
        titre: titre ? (titre.textContent ?? '') : '',
      }
    }
    const bascules = [...document.querySelectorAll('details[data-pliable-mobile] > summary')].map((s) => {
      const e = etiquette(s)
      return { texte: e.titre || e.complete, complete: e.complete, masquee: !vu(s) }
    })
    /* Tout texte VU de la page, titres et étiquettes compris. */
    const textesVus = [...document.querySelectorAll('h1,h2,h3,h4,span,div,p,a,strong')]
      .filter((e) => vu(e))
      .map((e) => e.textContent ?? '')
      .filter((t) => t.length > 0 && t.length < 400)
    return { bascules, textesVus }
  })
  const perdus = titresPerdus(brut.bascules, brut.textesVus)
  releve.push({ url, bascules: brut.bascules.length, perdus })
}
await nav.close()

const total = releve.reduce((n, r) => n + (r.perdus?.length ?? 0), 0)
const pagesTouchees = releve.filter((r) => (r.perdus?.length ?? 0) > 0)
const injoignables = releve.filter((r) => r.erreur)

for (const r of pagesTouchees) {
  console.log(`  ${r.url}  (${r.bascules} bascule(s))`)
  for (const p of r.perdus) console.log(`      PERDU : « ${normalise(p.texte).slice(0, 86)} »`)
}
for (const r of injoignables) console.log(`  ${r.url}  INJOIGNABLE`)

console.log(`\n  ${total} titre(s) de section perdu(s) sur ${pagesTouchees.length} page(s)`)
if (injoignables.length) console.log(`  ${injoignables.length} page(s) injoignable(s)`)
console.log('\nTémoin : node scripts/verifie-titres-de-section.mjs --controle')

if (total > 0 || injoignables.length > 0) process.exit(1)
console.log('AUCUN_TITRE_DE_SECTION_PERDU')
