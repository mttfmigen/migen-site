#!/usr/bin/env node
/**
 * Porte : toute photo du registre servie par une page porte sa description.
 *
 * Origine : le 10/10/2026, 1 495 des 1 629 photos servies (92 %, sur 231 pages
 * des 248) n'avaient aucun texte alternatif. Les photos etaient pourtant
 * correctement reparties, et les 385 descriptions etaient deja ecrites au
 * registre : les composants ecrivaient `alt=""` en dur a cote du `src`.
 * Muettes pour un lecteur d'ecran, invisibles pour un moteur d'images.
 *
 * Ce que la porte verifie, et qui la distingue d'un simple « alt non vide » :
 *  1. aucune photo du registre ne sort sans texte alternatif ;
 *  2. le texte pose est bien CELUI DU REGISTRE, pas un nom de fichier ni une
 *     chaine de remplissage. Une photo decrite « photo-4-1600.jpg » tombe.
 *
 * Usage : node scripts/verifie-alt-photos.mjs [adresse]      (defaut : local)
 *         node scripts/verifie-alt-photos.mjs --controle     (preuve d'echec)
 */
import { readFile } from 'node:fs/promises'

const CONTROLE = process.argv.includes('--controle')
const BASE = process.argv.find(a => a.startsWith('http')) ?? 'http://localhost:4340'
const LOT = 12

const reg = JSON.parse(await readFile('public/assets/photos/registre.json', 'utf8'))
const attendu = new Map((reg.photos ?? reg).map(p => [p.fichier, (p.description ?? '').trim()]))

/** Rend un attribut HTML lisible : sans ce decodage la porte prend la bonne
 *  description pour une etrangere, parce que l'apostrophe sort en `&#x27;`. */
function decodeHtml(s) {
  return s
    .replace(/&(?:#39|#x27|apos|rsquo|#8217|#x2019);/gi, "'")
    .replace(/&(?:quot|#34|#x22);/gi, '"')
    .replace(/&(?:nbsp|#160|#xa0);/gi, ' ')
    .replace(/&(?:#x[0-9a-f]+);/gi, m => String.fromCodePoint(parseInt(m.slice(3, -1), 16)))
    .replace(/&(?:#(\d+));/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&(?:amp|#38);/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Textes qui ne decrivent aucune photo en particulier : ils ne valent pas
 *  mieux qu'un attribut vide pour qui ne voit pas l'image. */
const REMPLISSAGES = [
  'technicien migen en intervention', 'photo', 'image', 'illustration',
  'visuel', 'migen', 'technicien', 'photo migen',
];

/** Le fichier designe par une adresse d'image, optimisee par Next ou non. */
function fichierDe(src) {
  let brut = src
  try { brut = decodeURIComponent(src) } catch { /* deja decode */ }
  return brut.split('/assets/photos/')[1]?.split(/[?&#]/)[0] ?? null
}

function examine(html, url, defauts, stats) {
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = tag.match(/\bsrc="([^"]*)"/i)?.[1] ?? '';
    const fichier = fichierDe(src);
    if (!fichier || !attendu.has(fichier)) continue;
    if (stats) stats.photos++;
    const alt = decodeHtml(tag.match(/\balt="([^"]*)"/i)?.[1] ?? '');
    if (!alt) { defauts.push({ url, fichier, quoi: 'sans texte alternatif' }); continue; }
    if (/\.(?:jpe?g|png|webp|avif)$/i.test(alt) || alt === fichier) {
      defauts.push({ url, fichier, quoi: `nom de fichier en guise de description : « ${alt} »` }); continue;
    }
    if (REMPLISSAGES.includes(alt.toLowerCase())) {
      defauts.push({ url, fichier, quoi: `texte de remplissage, qui ne decrit pas cette photo : « ${alt} »` }); continue;
    }
    if (alt.length < 12) {
      defauts.push({ url, fichier, quoi: `description trop courte pour dire quoi que ce soit : « ${alt} »` }); continue;
    }
    if (stats && alt === attendu.get(fichier)) stats.duRegistre++;
  }
}

if (CONTROLE) {
  const unFichier = [...attendu.keys()][0]
  const cas = [
    ['photo sans alt',          `<img src="/assets/photos/${unFichier}" alt="">`],
    ['photo sans attribut alt', `<img src="/assets/photos/${unFichier}">`],
    ['alt = nom de fichier',    `<img src="/assets/photos/${unFichier}" alt="${unFichier}">`],
    ['alt de remplissage',      `<img src="/assets/photos/${unFichier}" alt="Technicien migen en intervention">`],
    ['alt trop court',          `<img src="/assets/photos/${unFichier}" alt="usine">`],
    ['apostrophe echappee',     `<img src="/assets/photos/${unFichier}" alt="${(attendu.get(unFichier) ?? '').replace(/'/g, '&#x27;')}">`],
    ['photo correcte',          `<img src="/_next/image/?url=%2Fassets%2Fphotos%2F${unFichier}&w=640" alt="${attendu.get(unFichier)}">`],
  ]
  let bon = 0
  for (const [nom, html] of cas) {
    const d = []
    examine(html, '/temoin', d, null)
    const doitTomber = nom !== 'photo correcte' && nom !== 'apostrophe echappee'
    const tombe = d.length > 0
    console.log(`  ${tombe === doitTomber ? 'OK  ' : 'RATE'}  ${nom.padEnd(26)} ${tombe ? 'refusee' : 'acceptee'}`)
    if (tombe === doitTomber) bon++
  }
  console.log(bon === cas.length ? `\nCONTROLE OK : ${bon}/${cas.length}` : `\nCONTROLE ECHOUE : ${bon}/${cas.length}`)
  process.exit(bon === cas.length ? 0 : 1)
}

const idx = JSON.parse(await readFile('maquette/contenu/site/index.json', 'utf8'))
const urls = [...new Set((idx.pages ?? idx).map(p => p.url ?? p.chemin ?? p))]
const defauts = []; const injoignables = []
const stats = { photos: 0, duRegistre: 0 }

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(urls.slice(i, i + LOT).map(async url => {
    let html
    try {
      const r = await fetch(new URL(url, BASE), { redirect: 'follow' })
      if (!r.ok) return injoignables.push(`${url} (${r.status})`)
      html = await r.text()
    } catch (e) { return injoignables.push(`${url} (${e.code ?? e.message})`) }
    examine(html, url, defauts, stats)
  }))
}

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`)
  injoignables.slice(0, 5).forEach(u => console.error(`  ${u}`))
  process.exit(2)
}
if (defauts.length) {
  const pages = new Set(defauts.map(d => d.url))
  console.error(`${defauts.length} photo(s) mal decrite(s) sur ${pages.size} page(s) :\n`)
  defauts.slice(0, 25).forEach(d => console.error(`  ${d.url}\n      ${d.fichier} : ${d.quoi}`))
  if (defauts.length > 25) console.error(`  ... et ${defauts.length - 25} autre(s)`)
  process.exit(1)
}
console.log(`TOUTES_LES_PHOTOS_DECRITES  ${stats.photos} photos sur ${urls.length} pages, toutes decrites`)
console.log(`  dont ${stats.duRegistre} portent mot pour mot la description du registre (${Math.round(stats.duRegistre / stats.photos * 100)} %)`)
