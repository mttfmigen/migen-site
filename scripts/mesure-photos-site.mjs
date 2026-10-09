#!/usr/bin/env node
/**
 * MESURE DES PHOTOS DU SITE, 09/10/2025.
 *
 * Outil de mesure, pas une porte : il ne juge rien, il compte. Quatre chiffres,
 * lus dans les fiches `supabase/import/gabarits-maquette/*.json` qui sont la
 * source du contenu servi (CLAUDE.md §8) :
 *
 *   1. photos distinctes servies       — combien d'images différentes le site montre
 *   2. répétition maximale             — combien de fois la photo la plus servie est servie
 *   3. pages qui répètent une photo    — combien de pages montrent deux fois la même
 *   4. photos du registre utilisées    — combien des 109 photos achetées sont servies
 *
 * Les LOGOS clients sont hors mesure : un logo n'est pas une photo, il est servi
 * autant de fois que le client est cité et c'est normal.
 *
 * Usage :
 *   node scripts/mesure-photos-site.mjs            (résumé)
 *   node scripts/mesure-photos-site.mjs --detail   (+ top 20 et pages fautives)
 *   node scripts/mesure-photos-site.mjs --json     (sortie machine)
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const REGISTRE = join(RACINE, "public", "assets", "photos", "registre.json");

/** Les clés qui portent un LOGO, jamais une photo : hors mesure. */
const CLES_LOGO = new Set(["logo", "logoInverse", "src_logo", "logoClient"]);

/** Un chemin d'image ? (les logos `/assets/clients/` sortent par leur clé ET par
 *  leur dossier, parce que `logos[].src` porte une clé neutre.) */
const EST_IMAGE = (v) => typeof v === "string" && /\.(jpg|jpeg|png|webp|avif)$/i.test(v);
const EST_LOGO_CLIENT = (v) => v.startsWith("/assets/clients/");

/** Chaque emplacement d'image d'une fiche : son chemin de clés et sa valeur. */
export function emplacementsPhotos(noeud, chemin = "") {
  const sortie = [];
  if (Array.isArray(noeud)) {
    noeud.forEach((v, i) => sortie.push(...emplacementsPhotos(v, `${chemin}[${i}]`)));
    return sortie;
  }
  if (noeud && typeof noeud === "object") {
    for (const [cle, valeur] of Object.entries(noeud)) {
      if (cle.startsWith("_")) continue; // métadonnées de la fiche
      if (CLES_LOGO.has(cle)) continue;
      if (EST_IMAGE(valeur)) {
        if (!EST_LOGO_CLIENT(valeur)) sortie.push({ cle: chemin ? `${chemin}.${cle}` : cle, valeur });
        continue;
      }
      sortie.push(...emplacementsPhotos(valeur, chemin ? `${chemin}.${cle}` : cle));
    }
  }
  return sortie;
}

/** Les fiches, triées par nom de fichier : lecture déterministe. */
export function lisFiches() {
  return readdirSync(DOSSIER)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ fichier: f, fiche: JSON.parse(readFileSync(join(DOSSIER, f), "utf8")) }));
}

export function lisRegistre() {
  return JSON.parse(readFileSync(REGISTRE, "utf8"));
}

export function mesure() {
  const fiches = lisFiches();
  const registre = lisRegistre();
  const duRegistre = new Set(registre.map((p) => `/assets/photos/${p.fichier}`));

  const total = new Map(); // photo -> nombre d'emplacements sur tout le site
  const parPage = []; // { url, fichier, emplacements, repetees }

  for (const { fichier, fiche } of fiches) {
    const emplacements = emplacementsPhotos(fiche.contenu ?? fiche);
    const compte = new Map();
    for (const { valeur } of emplacements) {
      compte.set(valeur, (compte.get(valeur) ?? 0) + 1);
      total.set(valeur, (total.get(valeur) ?? 0) + 1);
    }
    const repetees = [...compte.entries()].filter(([, n]) => n > 1).sort();
    parPage.push({ url: fiche.url ?? `(${fichier})`, fichier, emplacements: emplacements.length, repetees });
  }

  const classement = [...total.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const utiliseesDuRegistre = classement.filter(([p]) => duRegistre.has(p));

  return {
    pages: fiches.length,
    emplacements: [...total.values()].reduce((s, n) => s + n, 0),
    photosDistinctes: total.size,
    repetitionMax: classement.length ? classement[0][1] : 0,
    photoLaPlusServie: classement.length ? classement[0][0] : null,
    pagesQuiRepetent: parPage.filter((p) => p.repetees.length > 0).length,
    photosRegistreUtilisees: utiliseesDuRegistre.length,
    registreTotal: registre.length,
    classement,
    parPage,
  };
}

function principal() {
  const m = mesure();
  const detail = process.argv.includes("--detail");
  if (process.argv.includes("--json")) {
    const { classement, parPage, ...resume } = m;
    void classement;
    void parPage;
    console.log(JSON.stringify(resume, null, 2));
    return;
  }
  console.log(`Fiches lues                      : ${m.pages}`);
  console.log(`Emplacements de photo            : ${m.emplacements}`);
  console.log(`1. photos distinctes servies     : ${m.photosDistinctes}`);
  console.log(`2. répétition maximale           : ${m.repetitionMax}  (${m.photoLaPlusServie})`);
  console.log(`3. pages qui répètent une photo  : ${m.pagesQuiRepetent}`);
  console.log(`4. photos du registre utilisées  : ${m.photosRegistreUtilisees} / ${m.registreTotal}`);
  if (!detail) return;
  console.log("\n-- les 20 photos les plus servies");
  for (const [photo, n] of m.classement.slice(0, 20)) console.log(`${String(n).padStart(5)} ${photo}`);
  console.log("\n-- pages qui répètent une photo");
  for (const p of m.parPage.filter((x) => x.repetees.length > 0)) {
    console.log(`${p.url} : ${p.repetees.map(([photo, n]) => `${photo} ×${n}`).join(", ")}`);
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) principal();
