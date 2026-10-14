/**
 * Porte du hub v2 : les comptes relevés en cliquant la maquette dans Chrome
 * (`dessin.md` § 4) doivent sortir du filtrage porté. `bun <ce fichier>`.
 * Depuis le 14/10, la bibliothèque Entreprises porte aussi les 12 billets
 * repris de l'ancien blog : les comptes de la maquette se vérifient sur ses
 * 15 articles (`M`), les comptes complets sur les 27 (`E`), et chaque carte
 * reprise doit sortir de sa fiche par les règles de `blog-repris.ts`.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import { INTERDITS } from "@/components/site/ressource/interdits-verification";

import { carteDepuisFiche, etiquettesSansPreuve } from "./blog-repris";
import type { FicheBlog } from "./blog-repris";
import { CONTENUS_ENTREPRISES as E, CONTENUS_TECHNICIENS as T } from "./donnees";
import { colonnes, filtre, FILTRES_AU_REPOS as R, SUJETS, TAXONOMIE } from "./filtrage";

const n = (c: typeof E, p: Partial<typeof R>, esp: "ent" | "tech" = "ent") => filtre(c, { ...R, ...p }, "pert", esp).length;

/* ------------------------------------------------- les 12 billets repris */

const DOSSIER = new URL("../../../../supabase/import/blog-repris/", import.meta.url);
const FICHES: FicheBlog[] = readdirSync(DOSSIER)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, DOSSIER), "utf8")));
const REPRIS = new Set(FICHES.map((f) => f.url));
assert.equal(FICHES.length, 12);
for (const f of FICHES) {
  const carte = E.find((x) => x.url === f.url);
  assert.ok(carte, `${f.url} : aucune carte dans le hub`);
  assert.deepEqual(carte, carteDepuisFiche(f, carte.sujet, carte.etiquettes), `${f.url} : carte non dérivée de sa fiche`);
  assert.ok((SUJETS as readonly string[]).includes(carte.sujet), `${f.url} : sujet hors des quatre`);
  assert.ok(carte.etiquettes.every((t) => TAXONOMIE.ent.includes(t)), `${f.url} : mot-clé hors taxonomie`);
  assert.deepEqual(etiquettesSansPreuve(f, carte.etiquettes), [], `${f.url} : mot-clé absent du texte`);
  assert.ok(carte.resume.length > 40 && carte.photo.startsWith("/assets/blog/"), `${f.url} : résumé ou photo vide`);
  for (const t of [carte.titre, carte.resume]) {
    assert.ok(!/[–—]/.test(t), `${f.url} : tiret cadratin ou demi-cadratin`);
    assert.deepEqual(INTERDITS.filter((m) => m.test(t)), [], `${f.url} : mot interdit`);
  }
}
// La porte sait échouer : une durée fausse, un mot-clé sans preuve.
{
  const f = FICHES[0];
  const vraie = E.find((x) => x.url === f.url)!;
  assert.notDeepEqual({ ...vraie, minutes: vraie.minutes + 1 }, carteDepuisFiche(f, vraie.sujet, vraie.etiquettes));
  assert.deepEqual(etiquettesSansPreuve(FICHES.find((x) => x.url.includes("interview"))!, ["TPM"]), ["TPM"]);
}

/* ------------------------------------------ comptes de la maquette (15) */

const M = E.filter((x) => !REPRIS.has(x.url));
assert.equal(M.length, 15);
assert.equal(T.length, 13);
assert.deepEqual(["Organisation", "Méthodes", "Digital & IA", "Coûts & environnement"].map((t) => n(M, { ths: [t] })), [4, 4, 5, 2]);
assert.equal(n(M, { ths: ["Organisation", "Méthodes"] }), 8);
assert.deepEqual((["s", "m", "l"] as const).map((d) => n(M, { dur: d })), [0, 13, 2]);
assert.equal(n(M, { q: "gmao" }), 7);
assert.equal(n(M, { q: "coût d’un arrêt" }), 1);
assert.equal(n(M, { q: "zzz" }), 0);
assert.equal(n(M, { tags: ["GMAO"] }), 7);
assert.deepEqual(["Fiche métier", "Guide carrière", "Alternance"].map((c) => n(T, { cat: c }, "tech")), [7, 5, 1]);
assert.deepEqual((["s", "m", "l"] as const).map((d) => n(T, { dur: d }, "tech")), [0, 13, 0]);
assert.equal(n(T, { q: "salaire" }, "tech"), 11);
assert.deepEqual(filtre(M, R, "court", "ent").map((x) => x.minutes).slice(0, 3), [7, 7, 7]);

/* ------------------------------------------- comptes complets (15 + 12) */

assert.equal(E.length, 27);
assert.equal(n(E, { cat: "Article" }), 27);
assert.deepEqual(SUJETS.map((t) => n(E, { ths: [t] })), [10, 6, 7, 4]);
assert.deepEqual((["s", "m", "l"] as const).map((d) => n(E, { dur: d })), [11, 13, 3]);
assert.equal(n(E, { tags: ["GMAO"] }), 9);
assert.equal(n(E, { q: "dimomaint" }), 2);
assert.deepEqual(filtre(E, R, "court", "ent").map((x) => x.minutes).slice(0, 3), [2, 2, 2]);
assert.equal(filtre(E, R, "long", "ent")[0].minutes, 11);

// 27 contenus à 1440 : 3 colonnes ; 15 : 3 colonnes ; 13 : 4 colonnes et la dernière en pleine largeur ; 390 : 1 colonne.
assert.deepEqual(colonnes(27, 1440, 1440), { cols: 3, large: false });
assert.deepEqual(colonnes(15, 1440, 1440), { cols: 3, large: false });
assert.deepEqual(colonnes(13, 1440, 1440), { cols: 4, large: true });
assert.deepEqual(colonnes(15, 390, 390), { cols: 1, large: false });
console.log("hub v2 : comptes de la maquette retrouvés, 12 billets repris dérivés de leur fiche.");
