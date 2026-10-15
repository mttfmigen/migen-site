/**
 * Contrôle de Tag Manager, sans navigateur ni serveur.
 *
 *   bun components/consentement/verification-tag-manager.ts
 *
 * La règle tient en une phrase : le conteneur ne part qu'avec un identifiant
 * valide, un choix, et une finalité Google accordée. Le parcours réel (requêtes
 * et ordre du dataLayer) est vérifié au navigateur par
 * scripts/verifie-tag-manager.mjs.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { type Choix, choixUniforme } from "@/lib/consentement";

import { identifiantConteneur, sourceConteneur } from "./TagManager";

const VALIDE = "GTM-TEST0000";
const ATTENDU = `https://www.googletagmanager.com/gtm.js?id=${VALIDE}`;
const seul = (finalite: keyof Choix): Choix => ({
  ...choixUniforme(false),
  [finalite]: true,
});

// ------------------------------------------------------------ l'identifiant
// Sans identifiant, rien, et sans bruit : c'est l'état tant que Mehdi n'a pas
// donné le conteneur.
assert.equal(identifiantConteneur(undefined), null);
assert.equal(identifiantConteneur(""), null);
assert.equal(sourceConteneur(identifiantConteneur(undefined), choixUniforme(true)), null);

// Mal formé : rien, et la console le dit.
const erreurs: unknown[][] = [];
const erreurOrigine = console.error;
console.error = (...arguments_: unknown[]) => erreurs.push(arguments_);
for (const faux of ["G-ABC123", "gtm-abc123", "GTM-", "GTM-ABC 123", "AW-123"]) {
  assert.equal(identifiantConteneur(faux), null, `format faux accepté : ${faux}`);
}
console.error = erreurOrigine;
assert.equal(erreurs.length, 5, "chaque format faux doit être signalé");
assert.equal(sourceConteneur(null, choixUniforme(true)), null);

assert.equal(identifiantConteneur(VALIDE), VALIDE);

// ---------------------------------------------------------------- le choix
// Identifiant valide mais pas encore de réponse au bandeau : rien.
assert.equal(sourceConteneur(VALIDE, null), null);
// Tout refusé : rien.
assert.equal(sourceConteneur(VALIDE, choixUniforme(false)), null);
// Une seule finalité ne suffit plus (15/10) : le conteneur porte LinkedIn et
// HubSpot sans condition de consentement, ils partiraient avec n'importe laquelle.
for (const f of ["mesure_audience", "publicite", "personnalisation", "suivi_commercial"] as const) {
  assert.equal(sourceConteneur(VALIDE, seul(f)), null, `chargé sur ${f} seul`);
}
// Deux sur trois : rien.
assert.equal(sourceConteneur(VALIDE, { ...choixUniforme(true), suivi_commercial: false }), null);
assert.equal(sourceConteneur(VALIDE, { ...choixUniforme(true), publicite: false }), null);
assert.equal(sourceConteneur(VALIDE, { ...choixUniforme(true), mesure_audience: false }), null);
// Les trois finalités du conteneur, personnalisation refusée : chargé.
assert.equal(sourceConteneur(VALIDE, { ...choixUniforme(true), personnalisation: false }), ATTENDU);
assert.equal(sourceConteneur(VALIDE, choixUniforme(true)), ATTENDU);

// ------------------------------------------------------------- le montage
const ici = (chemin: string) =>
  readFileSync(new URL(chemin, import.meta.url), "utf8");
const composant = ici("./TagManager.tsx");
// L'iframe <noscript> part sans JavaScript, donc sans choix.
assert.ok(!/<noscript/i.test(composant), "pas de <noscript> GTM");
assert.ok(!composant.includes("ns.html"), "pas d'iframe ns.html GTM");
assert.ok(!composant.includes("beforeInteractive"), "GTM ne part qu'après le choix");

// ConsentMode premier, TagManager juste après.
const corps = ici("../../app/layout.tsx").split("<body>")[1] ?? "";
const montages = [...corps.matchAll(/<([A-Z]\w*)\b/g)].map((m) => m[1]);
assert.deepEqual(montages.slice(0, 2), ["ConsentMode", "TagManager"]);

console.log("Tag Manager : toutes les assertions passent.");
