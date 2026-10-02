/**
 * Contrôle du formulaire et de l'attribution, sans navigateur ni serveur.
 *
 *   bun components/formulaire/verification.ts
 *
 * Volontairement sans cadre de test : les règles tiennent dans des assertions,
 * et une règle de validation qui se relâche doit faire échouer quelque chose.
 * Ce module n'est importé par aucun autre, il ne tourne jamais en production.
 */

import assert from "node:assert/strict";

import {
  attributionCourante,
  memoriseAttribution,
  attributionNettoyee,
  utmDepuisRequete,
} from "@/lib/utm";
import { brancheConversion, debrancheConversion, signaleConversion } from "./conversion";
import {
  DEPOTS_MAX_PAR_FENETRE,
  FENETRE_MS,
  empreinteIp,
  tropDeDepots,
} from "./debit";
import {
  CHAMP_PIEGE,
  CONTACT_VIDE,
  INDICATIFS,
  numeroComplet,
  valideCharge,
  valideContact,
} from "./validation";

const correct = {
  entreprise: "Fonderie de démonstration",
  prenom: "Camille",
  nom: "Rivière",
  email: "camille.riviere@exemple.fr",
  indicatif: "+33",
  telephone: "04 72 00 00 00",
  message: "Arrêt de ligne de conditionnement, besoin d'un électromécanicien.",
};

// Un contact complet passe.
assert.deepEqual(valideContact(correct), {});

// Chaque champ obligatoire vide produit une erreur, et une seule. Le message en
// fait partie depuis le portage de la maquette, qui le marque `required`.
for (const champ of [
  "entreprise",
  "prenom",
  "nom",
  "email",
  "telephone",
  "message",
] as const) {
  const erreurs = valideContact({ ...correct, [champ]: "   " });
  assert.deepEqual(Object.keys(erreurs), [champ], `champ obligatoire : ${champ}`);
}

// Le formulaire vide signale les six champs à remplir, pas le premier. L'indicatif
// n'en fait pas partie : il arrive prérempli sur « +33 », comme dans la maquette.
assert.equal(Object.keys(valideContact(CONTACT_VIDE)).length, 6);
assert.ok(!valideContact(CONTACT_VIDE).indicatif, "l'indicatif par défaut est valide");

// L'indicatif est une liste fermée : hors liste, il est refusé, et il n'est
// surtout pas concaténé au numéro pour partir dans HubSpot.
for (const faux of ["+99", "+3", "33", "", "+33;rm", "33+"]) {
  assert.ok(
    valideContact({ ...correct, indicatif: faux }).indicatif,
    `indicatif refusé : ${JSON.stringify(faux)}`,
  );
}
for (const { code } of INDICATIFS) {
  assert.ok(!valideContact({ ...correct, indicatif: code }).indicatif, `indicatif accepté : ${code}`);
}
// Un espace parasite autour d'un code connu est toléré, pas refusé : c'est le
// numéro COMPOSÉ qui doit être propre, et `numeroComplet` s'en charge.
assert.ok(!valideContact({ ...correct, indicatif: " +33 " }).indicatif);
assert.equal(numeroComplet({ ...correct, indicatif: " +33 ", telephone: " 04 72 00 00 00 " }), "+33 04 72 00 00 00");
assert.equal(numeroComplet({ ...correct, indicatif: "+971", telephone: "50 123 4567" }), "+971 50 123 4567");

// Formats refusés.
assert.ok(valideContact({ ...correct, email: "camille.riviere" }).email);
assert.ok(valideContact({ ...correct, telephone: "04 72" }).telephone);
assert.ok(valideContact({ ...correct, entreprise: "x".repeat(121) }).entreprise);

// Une charge utile sans rien ne passe pas, et le type de formulaire est exigé.
assert.ok(valideCharge(null).erreurs.formulaire);
assert.ok(valideCharge({ ...correct }).erreurs.formulaire);
assert.ok(valideCharge({ ...correct, formulaire: "Contact Général" }).erreurs.formulaire);
assert.deepEqual(valideCharge({ ...correct, formulaire: "contact" }).erreurs, {});

// Un champ d'un autre type qu'une chaîne vaut absent, il ne passe pas en force.
assert.ok(valideCharge({ ...correct, email: 42, formulaire: "contact" }).erreurs.email);

// La charge utile ne peut pas glisser de champ supplémentaire dans le contact.
const charge = valideCharge({ ...correct, formulaire: "contact", admin: "oui" });
assert.deepEqual(Object.keys(charge.contact).sort(), [
  "email",
  "entreprise",
  "indicatif",
  "message",
  "nom",
  "prenom",
  "telephone",
]);

// Les cinq UTM sont lus, le reste de la requête est ignoré.
assert.deepEqual(
  utmDepuisRequete("?utm_source=google&utm_medium=cpc&gclid=xyz&utm_term=&page=2"),
  { utm_source: "google", utm_medium: "cpc" },
);

// Une attribution reçue est réduite aux clés connues et bornée en longueur.
const nettoyee = attributionNettoyee({
  utm_source: " linkedin ",
  utm_campaign: "c".repeat(400),
  page_entree: "/maintenance-industrielle/",
  visitor_email: "fuite@exemple.fr",
});
assert.deepEqual(Object.keys(nettoyee).sort(), [
  "page_entree",
  "utm_campaign",
  "utm_source",
]);
assert.equal(nettoyee.utm_source, "linkedin");
assert.equal(nettoyee.utm_campaign?.length, 200);

// Sans consentement publicitaire, le signal de conversion ne fait rien.
let recues = 0;
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 0, "aucune conversion envoyée avant branchement");

brancheConversion(() => {
  recues += 1;
});
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 1);

debrancheConversion();
signaleConversion({ formulaire: "contact", page: "/" });
assert.equal(recues, 1, "le retrait du consentement coupe bien le signal");

// Le champ piège n'est pas un champ du contact : une charge utile qui le porte
// reste valide pour la validation, c'est la route qui la jette en silence.
const avecPiege = valideCharge({
  ...correct,
  formulaire: "contact",
  [CHAMP_PIEGE]: "https://robot.exemple",
});
assert.deepEqual(avecPiege.erreurs, {});
assert.ok(!(CHAMP_PIEGE in avecPiege.contact), "le piège n'entre pas dans le contact");

// Empreinte d'IP : le dernier octet d'une IPv4 et la fin d'une IPv6 disparaissent.
assert.equal(
  empreinteIp(new Headers({ "x-forwarded-for": "82.65.14.231, 10.0.0.1" })),
  "82.65.14.0/24",
);
assert.equal(
  empreinteIp(new Headers({ "x-forwarded-for": "2a01:cb00:1234:5678:9abc:def0:1:2" })),
  "2a01:cb00:1234:5678::/64",
);
assert.equal(empreinteIp(new Headers()), "sans-adresse");
assert.equal(empreinteIp(new Headers({ "x-forwarded-for": "pas-une-ip" })), "sans-adresse");

// Fenêtre glissante : le quota est atteint au dépôt suivant le dernier autorisé.
const t0 = 1_700_000_000_000;
for (let n = 0; n < DEPOTS_MAX_PAR_FENETRE; n += 1) {
  assert.equal(tropDeDepots("essai.fenetre", t0 + n), false, `dépôt ${n + 1} autorisé`);
}
assert.equal(tropDeDepots("essai.fenetre", t0 + DEPOTS_MAX_PAR_FENETRE), true);

// Une autre empreinte n'est pas pénalisée par la première.
assert.equal(tropDeDepots("essai.voisin", t0), false);

// Et la fenêtre glisse vraiment : passé le délai, le quota se reconstitue.
assert.equal(tropDeDepots("essai.fenetre", t0 + FENETRE_MS + 1), false);

// Persistance de l'attribution : interdite sans consentement publicitaire.
//
// `document` n'existe pas dans ce contexte, donc aucun choix n'est lisible, donc
// la finalité publicitaire n'est pas accordée : rien ne doit entrer dans le
// stockage. L'attribution doit malgré tout rester utilisable, en mémoire vive,
// sinon le formulaire perdrait son attribution pour tout le monde.
//
// Un seul cas est vérifié ici, et c'est volontaire : `memoriseAttribution` ne
// s'exécute qu'une fois par document, donc une fois par processus. Vérifier le
// cas consenti demanderait soit un sous-processus, soit une remise à zéro
// ajoutée au module de production pour les seuls besoins du contrôle. Le cas
// qui protège le visiteur est celui-ci.
const ecrituresStockage: string[] = [];
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: (): string | null => null,
    setItem: (_cle: string, valeur: string): void => {
      ecrituresStockage.push(valeur);
    },
  },
  writable: true,
});

memoriseAttribution({ search: "?utm_source=google", pathname: "/" });
assert.deepEqual(ecrituresStockage, [], "aucune écriture dans le stockage sans consentement");
assert.equal(
  attributionCourante("/contact/").utm_source,
  "google",
  "l'attribution reste utilisable en mémoire vive",
);
assert.equal(attributionCourante("/contact/").page_entree, "/");

console.log("Formulaire, attribution et garde-fous : toutes les assertions passent.");
