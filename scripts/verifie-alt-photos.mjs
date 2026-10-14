#!/usr/bin/env node
/**
 * Porte : toute photo qui porte du sens sort avec un texte alternatif.
 *
 * Origine : le 10/10/2026, 1 495 des 1 629 photos servies (92 %, sur 231 pages
 * des 248) n'avaient aucun texte alternatif. Les photos etaient pourtant
 * correctement reparties, et les 385 descriptions etaient deja ecrites au
 * registre : les composants ecrivaient `alt=""` en dur a cote du `src`.
 * Muettes pour un lecteur d'ecran, invisibles pour un moteur d'images.
 *
 * Le 14/10, mesure en production sur les 158 pages du plan du site : 34 photos
 * encore muettes, et AUCUNE n'etait vue par cette porte. 31 etaient des photos
 * de VILLE (`/assets/villes/`, et les memes fichiers importes par l'accueil,
 * servis sous `/_next/static/media/<ville>.<empreinte>.jpg`), que la porte ne
 * regardait pas parce qu'elles ne sont pas au registre. Les 3 autres etaient
 * les cartes « Nos dernieres realisations » de l'accueil : des photos du
 * registre, mais la porte lisait la liste des 248 pages de la maquette contre
 * un serveur local perime, et ne mesurait donc pas le site servi.
 *
 * Ce que la porte verifie, et qui la distingue d'un simple « alt non vide » :
 *  1. aucune photo du registre ni aucune photo de ville ne sort sans texte
 *     alternatif, absent ou vide ;
 *  2. le texte n'est ni un nom de fichier, ni une chaine de remplissage, ni
 *     trop court pour decrire quoi que ce soit ;
 *  3. pour une photo du registre, elle compte combien portent mot pour mot la
 *     description du registre.
 *
 * Elle lit les pages du PLAN DU SITE de l'adresse mesuree (`sitemap_index.xml` et ses sous-plans), pas
 * une liste recopiee : ce qui est mesure est ce qui est servi.
 *
 * Usage : node scripts/verifie-alt-photos.mjs [adresse]   (defaut : production)
 *         node scripts/verifie-alt-photos.mjs --controle  (preuve d'echec, hors reseau)
 * Jeton de succes : ALT_PHOTOS_PRESENTS
 */
import { readFile } from 'node:fs/promises'

import { locsDuPlan } from './plan-xml.mjs'

const CONTROLE = process.argv.includes('--controle')
const BASE = (process.argv.find(a => a.startsWith('http')) ?? 'https://migen-site.vercel.app').replace(/\/$/, '')
const LOT = 12

const reg = JSON.parse(await readFile('public/assets/photos/registre.json', 'utf8'))
const attendu = new Map((reg.photos ?? reg).map(p => [p.fichier, (p.description ?? '').trim()]))

/** Les photos de ville : servies telles quelles depuis `/assets/villes/`, ou
 *  importees par l'accueil (`components/site/accueil/hubs/`), que Next sert
 *  sous `/_next/static/media/<ville>.<empreinte>.jpg`. */
const PHOTO_DE_VILLE =
  /\/assets\/villes\/|\/accueil\/hubs\/|media\/(?:lyon|paris|lille|strasbourg|nantes|toulouse|marseille|bordeaux|metz|dijon)\./

/** Les photos des billets repris de l'ancien blog (14/10) : hors registre,
 *  leur texte alternatif est ecrit dans leur fiche (`imageAlt`, `galerie`). */
const PHOTO_DU_BLOG = /\/assets\/blog\//

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

/** L'adresse d'image decodee, optimisee par Next ou non. */
function decodeSrc(src) {
  try { return decodeURIComponent(decodeHtml(src)) } catch { return decodeHtml(src) }
}

/** Le fichier du registre designe par une adresse d'image, ou null. */
function fichierDuRegistre(brut) {
  const f = brut.split('/assets/photos/')[1]?.split(/[?&#]/)[0] ?? null
  return f && attendu.has(f) ? f : null
}

/** Le defaut d'un texte alternatif, ou null s'il decrit quelque chose. */
function defautDuTexte(alt, fichier) {
  if (!alt) return 'sans texte alternatif'
  if (/\.(?:jpe?g|png|webp|avif)$/i.test(alt) || alt === fichier) return `nom de fichier en guise de description : « ${alt} »`
  if (REMPLISSAGES.includes(alt.toLowerCase())) return `texte de remplissage, qui ne decrit pas cette photo : « ${alt} »`
  if (alt.length < 12) return `description trop courte pour dire quoi que ce soit : « ${alt} »`
  return null
}

function examine(html, url, defauts, stats) {
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const brut = decodeSrc(tag.match(/\bsrc="([^"]*)"/i)?.[1] ?? '');
    const duRegistre = fichierDuRegistre(brut);
    const deVille = !duRegistre && PHOTO_DE_VILLE.test(brut);
    const duBlog = !duRegistre && !deVille && PHOTO_DU_BLOG.test(brut);
    if (!duRegistre && !deVille && !duBlog) continue;
    const fichier = duRegistre ?? brut.split(/[?&#]/).find(x => PHOTO_DE_VILLE.test(x) || PHOTO_DU_BLOG.test(x))?.split('/').pop() ?? brut;
    if (stats) stats[deVille ? 'villes' : duBlog ? 'blog' : 'photos']++;
    const alt = decodeHtml(tag.match(/\balt="([^"]*)"/i)?.[1] ?? '');
    const quoi = defautDuTexte(alt, fichier);
    if (quoi) { defauts.push({ url, fichier, quoi }); continue; }
    if (stats && duRegistre && alt === attendu.get(duRegistre)) stats.duRegistre++;
  }
}

if (CONTROLE) {
  const unFichier = [...attendu.keys()][0]
  const carte = 'chimie-cuve-melange-flexible.jpg'
  const cas = [
    ['photo sans alt',              `<img src="/assets/photos/${unFichier}" alt="">`, true],
    ['photo sans attribut alt',     `<img src="/assets/photos/${unFichier}">`, true],
    ['alt = nom de fichier',        `<img src="/assets/photos/${unFichier}" alt="${unFichier}">`, true],
    ['alt de remplissage',          `<img src="/assets/photos/${unFichier}" alt="Technicien migen en intervention">`, true],
    ['alt trop court',              `<img src="/assets/photos/${unFichier}" alt="usine">`, true],
    ['carte de l accueil muette',   `<img alt="" src="/_next/image/?url=%2Fassets%2Fphotos%2F${carte}&amp;w=3840">`, true],
    ['ville sans alt',              `<img alt="" src="/_next/image/?url=%2Fassets%2Fvilles%2Fhub-lyon.jpg&amp;w=3840">`, true],
    ['ville sans attribut alt',     `<img src="/assets/villes/ville-rouen.jpg">`, true],
    ['photo du blog muette',        `<img alt="" src="/_next/image/?url=%2Fassets%2Fblog%2Fbien-etre-au-travail%2Ffuerteventura-01.webp&amp;w=640">`, true],
    ['photo du blog decrite',       `<img alt="L'équipe Migen gravit le sentier d'un volcan" src="/assets/blog/bien-etre-au-travail/fuerteventura-13.webp">`, false],
    ['hub importe sans alt',        `<img alt="" src="/_next/image/?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Fbordeaux.12peidexp8lr6.jpg&amp;w=3840">`, true],
    ['hub importe, chemin bun',     `<img alt="" src="/x/components/site/accueil/hubs/metz.jpg">`, true],
    ['ville au nom de fichier',     `<img src="/assets/villes/ville-rouen.jpg" alt="ville-rouen.jpg">`, true],
    ['apostrophe echappee',         `<img src="/assets/photos/${unFichier}" alt="${(attendu.get(unFichier) ?? '').replace(/'/g, '&#x27;')}">`, false],
    ['photo correcte',              `<img src="/_next/image/?url=%2Fassets%2Fphotos%2F${unFichier}&w=640" alt="${attendu.get(unFichier)}">`, false],
    ['ville decrite',               `<img alt="Rouen, le Gros-Horloge et son beffroi" src="/_next/image/?url=%2Fassets%2Fvilles%2Fville-rouen.jpg&amp;w=3840">`, false],
    ['hub importe decrit',          `<img alt="Bordeaux, les quais de la Garonne" src="/_next/image/?url=%2F_next%2Fstatic%2Fimmutable%2Fmedia%2Fbordeaux.12peidexp8lr6.jpg&amp;w=3840">`, false],
    ['logo decoratif, hors champ',  `<img alt="" src="/_next/image/?url=%2Fassets%2Flogo-migen-mark.png&amp;w=48">`, false],
  ]
  let bon = 0
  for (const [nom, html, doitTomber] of cas) {
    const d = []
    examine(html, '/temoin', d, null)
    const tombe = d.length > 0
    console.log(`  ${tombe === doitTomber ? 'OK  ' : 'RATE'}  ${nom.padEnd(28)} ${tombe ? 'refusee' : 'acceptee'}`)
    if (tombe === doitTomber) bon++
  }
  console.log(bon === cas.length ? `\nCONTROLE OK : ${bon}/${cas.length}` : `\nCONTROLE ECHOUE : ${bon}/${cas.length}`)
  process.exit(bon === cas.length ? 0 : 1)
}

let urls
try {
  // Index et sous-plans, au format de l'ancien site (`scripts/plan-xml.mjs`).
  urls = [...new Set((await locsDuPlan(BASE)).map(loc => new URL(loc).pathname))]
} catch (e) {
  console.error(`porte non concluante : plan du site illisible sur ${BASE} (${e.code ?? e.message})`)
  process.exit(2)
}
if (!urls.length) { console.error(`porte non concluante : plan du site vide sur ${BASE}`); process.exit(2) }

const defauts = []; const injoignables = []
const stats = { photos: 0, villes: 0, blog: 0, duRegistre: 0 }

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(urls.slice(i, i + LOT).map(async url => {
    let html
    try {
      const r = await fetch(BASE + url, { redirect: 'follow' })
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
/* Une porte qui ne voit aucune photo de ville ne prouve rien : le jour ou le
   motif d'adresse change, elle passerait a vide. */
if (!stats.villes || !stats.photos) {
  console.error(`porte non concluante : ${stats.villes} photo(s) de ville et ${stats.photos} du registre vues sur ${urls.length} pages, la porte est aveugle`)
  process.exit(2)
}
if (defauts.length) {
  const pages = new Set(defauts.map(d => d.url))
  console.error(`${defauts.length} photo(s) mal decrite(s) sur ${pages.size} page(s) de ${BASE} :\n`)
  defauts.slice(0, 40).forEach(d => console.error(`  ${d.url}\n      ${d.fichier} : ${d.quoi}`))
  if (defauts.length > 40) console.error(`  ... et ${defauts.length - 40} autre(s)`)
  process.exit(1)
}
console.log(`ALT_PHOTOS_PRESENTS  ${stats.photos} photos du registre, ${stats.villes} photos de ville et ${stats.blog} photos du blog sur ${urls.length} pages, toutes decrites`)
console.log(`TOUTES_LES_PHOTOS_DECRITES  dont ${stats.duRegistre} portent mot pour mot la description du registre (${Math.round(stats.duRegistre / stats.photos * 100)} %)`)
