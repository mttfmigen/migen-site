#!/usr/bin/env node
/**
 * LA VIGNETTE DE PARTAGE SE TÉLÉCHARGE-T-ELLE VRAIMENT ?
 *
 * POURQUOI CETTE PORTE EXISTE, et c'est la leçon la plus coûteuse de la
 * journée du 12/10. Les 259 balises `og:image` du site ont été posées, vérifiées
 * et déclarées bonnes. En production, elles pointaient toutes sur
 * `https://migen.fr/assets/…` et migen.fr répondait **404 sur chacune** :
 * l'ancien site Astro y est encore en ligne et ne porte pas ces fichiers. Tout
 * partage de lien sortait donc en bandeau de texte gris, exactement ce que le
 * travail devait corriger.
 *
 * LA MESURE QUI AVAIT CONCLU « 191 répondent 200 » AVAIT SUBSTITUÉ L'HÔTE :
 * elle testait `migen-site.vercel.app/assets/…` alors que la balise écrivait
 * `migen.fr/assets/…`. Elle prouvait que les fichiers existent, pas que
 * l'adresse émise se télécharge. Un relecteur adverse l'a trouvé, pas la porte.
 *
 * CE QUE CETTE PORTE FAIT, ET C'EST TOUT CE QUI COMPTE : elle lit l'attribut
 * `content` de la balise, TEL QUEL, et elle télécharge CETTE adresse. Aucune
 * substitution d'hôte, aucune reconstruction de chemin. Si l'adresse émise ne
 * répond pas, un lien partagé n'a pas d'image, point final.
 *
 * ELLE VÉRIFIE AUSSI LE CADRAGE, que personne n'avait mesuré : les réseaux
 * recadrent en 1,91:1. Une image PORTRAIT servie en vignette est rognée au
 * centre et ne montre souvent plus son sujet. Le seuil est un AVERTISSEMENT et
 * non un échec, la décision revenant au client, mais le compte est affiché.
 *
 * Usage :
 *   node scripts/verifie-vignette-partage.mjs                 production
 *   SITE_URL=http://localhost:4340 node scripts/…             un autre hôte
 *   node scripts/verifie-vignette-partage.mjs --controle      preuve d'échec
 *
 * Elle REFUSE DE CONCLURE si une page ne répond pas : conclure sur un
 * échantillon muet est la faute qu'une porte existe pour empêcher.
 */
import { readFileSync } from 'node:fs'

const SITE = (process.env.SITE_URL ?? 'https://migen-site.vercel.app').replace(/\/+$/, '')
const CONTROLE = process.argv.includes('--controle')

/** Le ratio que LinkedIn, WhatsApp, Slack et Teams attendent. */
const RATIO_RESEAUX = 1.91
/** En dessous, l'image est rognée assez fort pour perdre son sujet. */
const RATIO_PLANCHER = 1.5

/** L'adresse de la vignette, lue TELLE QUELLE dans la balise. */
function vignetteDe(html) {
  const m = html.match(
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
  )
  return m ? m[1] : null
}

/** Combien de balises `og:image` : deux rendent le choix indéfini. */
function combienDeVignettes(html) {
  return (html.match(/property="og:image"/gi) ?? []).length
}

/* --------------------------------------------------------------- contrôle */

if (CONTROLE) {
  const EPREUVES = [
    {
      nom: "une balise absente",
      html: '<head><meta property="og:title" content="x"/></head>',
      attendu: /aucune vignette/,
    },
    {
      nom: "une adresse relative, intelligible par aucun réseau",
      html: '<head><meta property="og:image" content="/assets/web/x.jpg"/></head>',
      attendu: /adresse relative/,
    },
    {
      nom: "deux balises, le choix est indéfini",
      html:
        '<head><meta property="og:image" content="https://a/x.jpg"/>' +
        '<meta property="og:image" content="https://a/y.jpg"/></head>',
      attendu: /deux vignettes/,
    },
    {
      /* LE DÉFAUT EXACT DU 12/10, celui qu'aucune porte ne voyait. */
      nom: "une adresse absolue qui répond 404, le défaut du 12/10",
      html: '<head><meta property="og:image" content="https://migen.fr/assets/web/sv-convoyeur.jpg"/></head>',
      attendu: /ne se télécharge pas/,
      reseau: true,
    },
    {
      /* CONTRÔLE NÉGATIF : une adresse qui répond doit être ACCEPTÉE, sinon la
         porte crie à tort et son vert ne vaut rien. */
      nom: "NÉGATIF, une adresse qui répond est acceptée",
      html: `<head><meta property="og:image" content="${SITE}/assets/web/sv-convoyeur.jpg"/></head>`,
      attendu: null,
      reseau: true,
    },
  ]

  let vues = 0
  for (const e of EPREUVES) {
    const defauts = await controle('/epreuve/', e.html)
    const touche = e.attendu ? defauts.some((d) => e.attendu.test(d)) : defauts.length === 0
    if (touche) vues += 1
    console.log(`  ${touche ? 'OK   ' : 'ÉCHEC'}  ${e.nom}`)
    if (!touche) console.log(`           défauts rendus : ${JSON.stringify(defauts)}`)
  }
  const negatifs = EPREUVES.filter((e) => !e.attendu).length
  console.log(
    `\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies ` +
      `(${EPREUVES.length - negatifs} fautes à voir, ${negatifs} contrôle(s) négatif(s))`,
  )
  process.exit(vues === EPREUVES.length ? 0 : 1)
}

/* ---------------------------------------------------------------- le fond */

/** Les défauts de la vignette d'une page. */
async function controle(url, html) {
  const defauts = []
  const combien = combienDeVignettes(html)
  if (combien === 0) {
    defauts.push(`${url} : aucune vignette, un lien partagé sort en bandeau de texte gris`)
    return defauts
  }
  if (combien > 1) {
    defauts.push(`${url} : deux vignettes ou plus, le réseau choisit au hasard`)
  }
  const adresse = vignetteDe(html)
  if (!adresse) {
    defauts.push(`${url} : aucune vignette lisible`)
    return defauts
  }
  if (!/^https?:\/\//i.test(adresse)) {
    defauts.push(`${url} : adresse relative « ${adresse} », aucun réseau ne sait la résoudre`)
    return defauts
  }

  /* LE CŒUR : on télécharge L'ADRESSE ÉMISE, sans toucher à son hôte. */
  try {
    const r = await fetch(adresse, { method: 'GET', headers: { range: 'bytes=0-2047' }, signal: AbortSignal.timeout(20000) })
    if (!r.ok) {
      defauts.push(`${url} : la vignette ne se télécharge pas, HTTP ${r.status} sur « ${adresse} »`)
      return defauts
    }
    const type = r.headers.get('content-type') ?? ''
    if (!type.startsWith('image/')) {
      defauts.push(`${url} : « ${adresse} » répond ${r.status} mais en « ${type} », pas une image`)
    }
  } catch (erreur) {
    defauts.push(
      `${url} : la vignette ne se télécharge pas (${erreur?.cause?.code ?? erreur?.name}) sur « ${adresse} »`,
    )
  }
  return defauts
}

const index = JSON.parse(readFileSync('maquette/contenu/site/index.json', 'utf8'))
const pages = (Array.isArray(index) ? index : (index.pages ?? []))
  .map((p) => p?.url)
  .filter((u) => typeof u === 'string')
const URLS = [...new Set(['/', ...pages])]

const defauts = []
const injoignables = []
const cadrages = []
const LOT = 8

for (let i = 0; i < URLS.length; i += LOT) {
  await Promise.all(
    URLS.slice(i, i + LOT).map(async (url) => {
      let html
      try {
        const r = await fetch(SITE + url, { signal: AbortSignal.timeout(30000) })
        if (!r.ok) {
          injoignables.push(`${url} : HTTP ${r.status}`)
          return
        }
        html = await r.text()
      } catch (erreur) {
        injoignables.push(`${url} : ${erreur?.cause?.code ?? erreur?.name ?? 'injoignable'}`)
        return
      }
      defauts.push(...(await controle(url, html)))
      const adresse = vignetteDe(html)
      if (adresse) cadrages.push({ url, adresse })
    }),
  )
}

if (injoignables.length > 0) {
  console.log(`MESURE NON CONCLUANTE : ${injoignables.length} page(s) sur ${URLS.length} n'ont pas repondu.`)
  for (const i of injoignables.slice(0, 10)) console.log(`  ${i}`)
  process.exit(1)
}

/* Le cadrage : un avertissement chiffré, pas un échec. Les dimensions se
   lisent dans l'en-tête des octets, sans bibliothèque. */
function dimensionsJpeg(octets) {
  let i = 2
  while (i < octets.length - 9) {
    if (octets[i] !== 0xff) {
      i += 1
      continue
    }
    const marqueur = octets[i + 1]
    if (marqueur >= 0xc0 && marqueur <= 0xcf && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc) {
      return { hauteur: (octets[i + 5] << 8) | octets[i + 6], largeur: (octets[i + 7] << 8) | octets[i + 8] }
    }
    i += 2 + ((octets[i + 2] << 8) | octets[i + 3])
  }
  return null
}

const portraits = []
const trapues = []
const dejaVues = new Map()
for (const { url, adresse } of cadrages) {
  if (!/\.jpe?g$/i.test(adresse)) continue
  let d = dejaVues.get(adresse)
  if (d === undefined) {
    try {
      const r = await fetch(adresse, { headers: { range: 'bytes=0-65535' }, signal: AbortSignal.timeout(20000) })
      d = r.ok ? dimensionsJpeg(new Uint8Array(await r.arrayBuffer())) : null
    } catch {
      d = null
    }
    dejaVues.set(adresse, d)
  }
  if (!d || !d.hauteur) continue
  const ratio = d.largeur / d.hauteur
  if (ratio < 1) portraits.push(`${url} : ${d.largeur}x${d.hauteur}, portrait`)
  else if (ratio < RATIO_PLANCHER) trapues.push(`${url} : ${d.largeur}x${d.hauteur}, ratio ${ratio.toFixed(2)}`)
}

console.log(`${URLS.length} pages lues sur ${SITE}, ${dejaVues.size} vignette(s) distincte(s) telechargee(s)`)
if (portraits.length || trapues.length) {
  console.log(
    `\nAVERTISSEMENT DE CADRAGE, les reseaux recadrent en ${RATIO_RESEAUX}:1 : ` +
      `${portraits.length} page(s) servent une image PORTRAIT, ` +
      `${trapues.length} un ratio sous ${RATIO_PLANCHER}.`,
  )
  for (const p of [...portraits, ...trapues].slice(0, 8)) console.log(`  ${p}`)
  console.log('  Ce n\'est pas un echec : le choix revient au client.')
}

if (defauts.length > 0) {
  console.log(`\n${defauts.length} defaut(s) de vignette :`)
  for (const d of defauts.slice(0, 15)) console.log(`  ${d}`)
  if (defauts.length > 15) console.log(`  … et ${defauts.length - 15} autres`)
  process.exit(1)
}
console.log('\nVIGNETTE_PARTAGE_OK : chaque adresse emise se telecharge et rend une image.')
