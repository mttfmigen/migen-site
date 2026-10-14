/* Porte du bloc candidature Techniciens : bun components/site/ressources-hub/v2/verification-candidature.ts */
import assert from "node:assert/strict";

import { manquants } from "./CandidatureTechniciens";

const plein = {
  nom: "Jean Dupont",
  tel: "06 12 34 56 78",
  mail: "jean@exemple.fr",
  regions: ["Bretagne"],
  trajet: "45 minutes",
  delai: "Sous 1 mois",
  exp: "0",
  sal: "28000",
};

assert.deepEqual(manquants(plein), []);
// Un seul mot : la route exige prénom ET nom, le formulaire le refuse avant.
assert.deepEqual(manquants({ ...plein, nom: "Jean" }), ["nom"]);
// Zéro année d'expérience est une réponse, pas un oubli.
assert.deepEqual(manquants({ ...plein, exp: "" }), ["expérience"]);
// `min` ne bloque rien sous noValidate : un négatif ou zéro euro est refusé ici.
assert.deepEqual(manquants({ ...plein, exp: "-3" }), ["expérience"]);
assert.deepEqual(manquants({ ...plein, sal: "0" }), ["prétentions salariales"]);
assert.deepEqual(manquants({ ...plein, sal: "-500" }), ["prétentions salariales"]);
assert.deepEqual(
  manquants({ nom: "", tel: "06", mail: "x", regions: [], trajet: "", delai: "", exp: "", sal: "" }),
  ["nom", "téléphone", "e-mail", "mobilité", "temps de trajet", "délai", "expérience", "prétentions salariales"],
);
console.log("candidature Techniciens : validation conforme à la maquette.");
