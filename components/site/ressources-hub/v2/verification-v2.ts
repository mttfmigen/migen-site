/**
 * Porte du hub v2 : les comptes relevés en cliquant la maquette dans Chrome
 * (`dessin.md` § 4) doivent sortir du filtrage porté. `bun <ce fichier>`.
 */
import assert from "node:assert/strict";

import { CONTENUS_ENTREPRISES as E, CONTENUS_TECHNICIENS as T } from "./donnees";
import { colonnes, filtre, FILTRES_AU_REPOS as R } from "./filtrage";

const n = (c: typeof E, p: Partial<typeof R>, esp: "ent" | "tech" = "ent") => filtre(c, { ...R, ...p }, "pert", esp).length;

assert.equal(E.length, 15);
assert.equal(T.length, 13);
assert.deepEqual(["Organisation", "Méthodes", "Digital & IA", "Coûts & environnement"].map((t) => n(E, { ths: [t] })), [4, 4, 5, 2]);
assert.equal(n(E, { ths: ["Organisation", "Méthodes"] }), 8);
assert.deepEqual((["s", "m", "l"] as const).map((d) => n(E, { dur: d })), [0, 13, 2]);
assert.equal(n(E, { q: "gmao" }), 7);
assert.equal(n(E, { q: "coût d’un arrêt" }), 1);
assert.equal(n(E, { q: "zzz" }), 0);
assert.equal(n(E, { tags: ["GMAO"] }), 7);
assert.deepEqual(["Fiche métier", "Guide carrière", "Alternance"].map((c) => n(T, { cat: c }, "tech")), [7, 5, 1]);
assert.deepEqual((["s", "m", "l"] as const).map((d) => n(T, { dur: d }, "tech")), [0, 13, 0]);
assert.equal(n(T, { q: "salaire" }, "tech"), 11);
assert.deepEqual(filtre(E, R, "court", "ent").map((x) => x.minutes).slice(0, 3), [7, 7, 7]);
// 15 contenus à 1440 : 3 colonnes ; 13 : 4 colonnes et la dernière en pleine largeur ; 390 : 1 colonne.
assert.deepEqual(colonnes(15, 1440, 1440), { cols: 3, large: false });
assert.deepEqual(colonnes(13, 1440, 1440), { cols: 4, large: true });
assert.deepEqual(colonnes(15, 390, 390), { cols: 1, large: false });
console.log("hub v2 : comptes de la maquette retrouvés.");
