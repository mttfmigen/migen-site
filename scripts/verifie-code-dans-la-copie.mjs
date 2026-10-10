#!/usr/bin/env node
/**
 * Porte : aucun fragment de code ne doit apparaitre dans le texte lu par un visiteur.
 *
 * Origine : le 09/10/2026, deux agents ont ecrit « // Contraste AA : ... » en
 * position d'enfant JSX. En JSX, « // » n'est pas un commentaire, c'est du texte.
 * 18 occurrences se sont affichees en clair sur trois pages servies. Les treize
 * portes en place etaient vertes : aucune ne cherchait du code dans la copie.
 *
 * Cette porte lit le texte rendu des 248 pages et refuse tout motif qui n'a
 * aucune raison d'etre lu par un humain.
 */
import { readFile } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://localhost:4340'
const LOT = 12

/** Motifs qui ne doivent jamais etre lus par un visiteur. */
const MOTIFS = [
  { nom: 'commentaire de ligne',    re: /(?:^|[\s>])\/\/[ \t]*[A-Za-zÀ-ÿ]/g },
  { nom: 'commentaire de bloc',     re: /\/\*[\s\S]{0,200}?\*\//g },
  { nom: 'jeton CSS',               re: /--[a-z][a-z0-9-]{2,}\s*:/g },
  { nom: 'accolades de modele',     re: /\{\{[^}]{1,80}\}\}/g },
  { nom: 'undefined / NaN / [object', re: /\b(?:undefined|NaN|\[object Object\])\b/g },
  { nom: 'balise non interpretee',  re: /&lt;\/?(?:div|span|p|h[1-6]|strong|em|a|ul|li)\b/g },
  { nom: 'variable de gabarit',     re: /\$\{[^}]{1,80}\}/g },
]

/** Retire tout ce qui n'est pas du texte lu : scripts, styles, attributs, JSON-LD. */
function texteLu(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, '\n')          // frontiere de bloc : deux noeuds ne se collent pas
    .replace(/&(?:nbsp|#160);/g, ' ')
    .replace(/&(?:amp|#38);/g, '&')
    .replace(/&(?:#39|#x27|rsquo|apos);/g, "'")
    .replace(/&(?:quot|#34);/g, '"')
}

const index = JSON.parse(await readFile('maquette/contenu/site/index.json', 'utf8'))
const urls = [...new Set((index.pages ?? index).map(p => p.url ?? p.chemin ?? p))]

const defauts = []
const injoignables = []

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(urls.slice(i, i + LOT).map(async url => {
    let html
    try {
      const r = await fetch(new URL(url, BASE), { redirect: 'follow' })
      if (!r.ok) return injoignables.push(`${url} (${r.status})`)
      html = await r.text()
    } catch (e) {
      return injoignables.push(`${url} (${e.code ?? e.message})`)
    }
    const texte = texteLu(html)
    for (const { nom, re } of MOTIFS) {
      const trouves = texte.match(new RegExp(re.source, re.flags))
      if (trouves) defauts.push({ url, nom, n: trouves.length, extrait: trouves[0].trim().slice(0, 90) })
    }
  }))
}

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`)
  injoignables.slice(0, 5).forEach(u => console.error(`  ${u}`))
  console.error(`  le serveur doit repondre sur les ${urls.length} adresses pour que l'absence compte comme preuve`)
  process.exit(2)
}

if (defauts.length) {
  console.error(`${defauts.length} fuite(s) de code dans le texte lu, sur ${new Set(defauts.map(d => d.url)).size} page(s) :\n`)
  for (const d of defauts.sort((a, b) => b.n - a.n)) {
    console.error(`  ${String(d.n).padStart(3)}x  ${d.nom.padEnd(24)} ${d.url}`)
    console.error(`        « ${d.extrait} »`)
  }
  process.exit(1)
}

console.log(`AUCUN_CODE_DANS_LA_COPIE  ${urls.length} pages lues, ${MOTIFS.length} motifs cherches`)
