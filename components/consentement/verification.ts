/**
 * Contrôle du consentement, sans navigateur ni serveur.
 *
 *   bun components/consentement/verification.ts
 *
 * Volontairement sans cadre de test : les règles tiennent dans des assertions,
 * et une règle qui se relâche doit faire échouer quelque chose. Ce module n'est
 * importé par aucun autre, il ne tourne jamais en production.
 */

import assert from "node:assert/strict";

import {
  COOKIE_NOM,
  FINALITES,
  LIBELLES,
  VERSION_BANDEAU,
  analyseCookie,
  choixUniforme,
  estToutRefuse,
  etiquetteUserAgent,
  finalitesRetirees,
} from "@/lib/consentement";

// ------------------------------------------------- retrait d'une finalité
// Sans choix antérieur, il n'y a rien à retirer : un premier refus ne doit pas
// déclencher de ménage ni de rechargement.
assert.deepEqual(finalitesRetirees(null, choixUniforme(false)), []);

// Élargir n'est pas retirer.
assert.deepEqual(
  finalitesRetirees(choixUniforme(false), choixUniforme(true)),
  [],
);

// Tout retirer après tout avoir accordé : toutes les finalités remontent, donc
// les cookies sont effacés et la page rechargée.
assert.deepEqual(
  finalitesRetirees(choixUniforme(true), choixUniforme(false)),
  [...FINALITES],
);

// Retrait partiel : seule la finalité retirée remonte.
assert.deepEqual(
  finalitesRetirees(choixUniforme(true), {
    ...choixUniforme(true),
    publicite: false,
  }),
  ["publicite"],
);

// ------------------------------------- HubSpot ne relève plus de la mesure
// Le libellé « mesure d'audience » promet des statistiques agrégées : si
// HubSpot revenait sous cette finalité, le libellé mentirait.
assert.ok(
  LIBELLES.mesure_audience.destinataires.every(
    (destinataire) => !destinataire.toLowerCase().includes("hubspot"),
  ),
  "HubSpot doit rester hors de la finalité mesure d'audience",
);
assert.ok(
  LIBELLES.suivi_commercial.destinataires.includes("HubSpot"),
  "le suivi commercial doit nommer HubSpot",
);
// Aucune finalité sans destinataire nommé : consentir à l'aveugle n'est pas consentir.
for (const finalite of FINALITES) {
  assert.ok(
    LIBELLES[finalite].destinataires.length > 0,
    `finalité sans destinataire : ${finalite}`,
  );
}

// ------------------------------------------ identifiant et refus total
assert.ok(estToutRefuse(choixUniforme(false)));
assert.ok(!estToutRefuse({ ...choixUniforme(false), mesure_audience: true }));

// Un refus total se relit sans identifiant persistant.
const refus = encodeURIComponent(
  JSON.stringify({
    version: VERSION_BANDEAU,
    visiteur: null,
    choix: choixUniforme(false),
    le: new Date().toISOString(),
  }),
);
assert.equal(analyseCookie(refus)?.visiteur, null);
assert.deepEqual(analyseCookie(refus)?.choix, choixUniforme(false));

// Un identifiant trop court reste refusé : c'est une valeur trafiquée, pas un refus.
const trafique = encodeURIComponent(
  JSON.stringify({
    version: VERSION_BANDEAU,
    visiteur: "court",
    choix: choixUniforme(true),
    le: new Date().toISOString(),
  }),
);
assert.equal(analyseCookie(trafique), null);

// Une finalité absente invalide tout le cookie : on redemande au visiteur.
const incomplet = encodeURIComponent(
  JSON.stringify({
    version: VERSION_BANDEAU,
    visiteur: null,
    choix: { mesure_audience: true },
    le: new Date().toISOString(),
  }),
);
assert.equal(analyseCookie(incomplet), null);
assert.equal(analyseCookie(undefined), null);
assert.ok(COOKIE_NOM.length > 0);

// ------------------------------------------------- étiquette du user agent
// Le user agent brut n'est jamais stocké : l'étiquette est courte et bornée.
const chrome =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
assert.equal(etiquetteUserAgent(chrome), "chrome/android");

// Edge et Opera s'annoncent aussi comme Chrome : l'ordre de test compte.
assert.equal(
  etiquetteUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  ),
  "edge/windows",
);
assert.equal(
  etiquetteUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
  ),
  "safari/macos",
);
assert.equal(
  etiquetteUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
  ),
  "safari/ios",
);

// Un robot est reconnu comme tel, même s'il annonce un navigateur.
assert.equal(
  etiquetteUserAgent(
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/131.0.0.0",
  ),
  "robot",
);
assert.equal(etiquetteUserAgent(null), null);

// La borne de 32 caractères est tenue quelle que soit l'entrée.
for (const brut of [chrome, "x".repeat(4000), "Opera/9.80 Linux"]) {
  const etiquette = etiquetteUserAgent(brut);
  assert.ok(etiquette !== null && etiquette.length <= 32);
}

console.log("Consentement : toutes les assertions passent.");
