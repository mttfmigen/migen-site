/**
 * Contrôle de Tag Manager, sans navigateur ni serveur.
 *
 *   bun components/consentement/verification-tag-manager.ts
 *
 * Depuis le 25/11 (mode consentement avancé), le conteneur part dès l'arrivée
 * avec un identifiant valide. Ce qui reste derrière le consentement, ce sont
 * ses balises non Google : elles exigent publicité ET suivi commercial. Le
 * parcours réel (requêtes et ordre du dataLayer) est vérifié au navigateur par
 * scripts/verifie-tag-manager.mjs.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { type Choix, choixUniforme } from "@/lib/consentement";

import { identifiantConteneur, tiersAutorises } from "./TagManager";

const VALIDE = "GTM-TEST0000";
const seul = (finalite: keyof Choix): Choix => ({
  ...choixUniforme(false),
  [finalite]: true,
});

// ------------------------------------------------------------ l'identifiant
// Sans identifiant, rien, et sans bruit.
assert.equal(identifiantConteneur(undefined), null);
assert.equal(identifiantConteneur(""), null);

// Mal formé : rien, et la console le dit.
const erreurs: unknown[][] = [];
const erreurOrigine = console.error;
console.error = (...arguments_: unknown[]) => erreurs.push(arguments_);
for (const faux of ["G-ABC123", "gtm-abc123", "GTM-", "GTM-ABC 123", "AW-123"]) {
  assert.equal(identifiantConteneur(faux), null, `format faux accepté : ${faux}`);
}
console.error = erreurOrigine;
assert.equal(erreurs.length, 5, "chaque format faux doit être signalé");

assert.equal(identifiantConteneur(VALIDE), VALIDE);

// ------------------------------------------------- les balises non Google
// Sans réponse au bandeau, ou tout refusé : bloquées.
assert.equal(tiersAutorises(null), false);
assert.equal(tiersAutorises(choixUniforme(false)), false);
// Une seule finalité ne suffit pas : LinkedIn et HubSpot partagent les mêmes
// classes de blocage.
for (const f of ["mesure_audience", "publicite", "personnalisation", "suivi_commercial"] as const) {
  assert.equal(tiersAutorises(seul(f)), false, `débloquées sur ${f} seul`);
}
assert.equal(tiersAutorises({ ...choixUniforme(true), publicite: false }), false);
assert.equal(tiersAutorises({ ...choixUniforme(true), suivi_commercial: false }), false);
// Publicité et suivi commercial : débloquées, mesure d'audience refusée comprise
// (GA4 la respecte par Consent Mode).
assert.equal(tiersAutorises({ ...choixUniforme(false), publicite: true, suivi_commercial: true }), true);
assert.equal(tiersAutorises(choixUniforme(true)), true);

// ------------------------------------------------------------- le montage
const ici = (chemin: string) =>
  readFileSync(new URL(chemin, import.meta.url), "utf8");
const composant = ici("./TagManager.tsx");
// L'iframe <noscript> part sans JavaScript, donc sans choix.
assert.ok(!/<noscript/i.test(composant), "pas de <noscript> GTM");
assert.ok(!composant.includes("ns.html"), "pas d'iframe ns.html GTM");
assert.ok(composant.includes('"gtm.blocklist"'), "les balises non Google sont bloquées sans accord");

// ConsentMode premier, TagManager juste après.
const corps = ici("../../app/layout.tsx").split("<body>")[1] ?? "";
const montages = [...corps.matchAll(/<([A-Z]\w*)\b/g)].map((m) => m[1]);
assert.deepEqual(montages.slice(0, 2), ["ConsentMode", "TagManager"]);

console.log("Tag Manager : toutes les assertions passent.");
