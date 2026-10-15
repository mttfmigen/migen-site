/**
 * PORTE DES NOMS DE CLIENTS AU TÉLÉPHONE (maquette V3, lot 7, 16/10).
 *
 *   bun components/site/preuve/verification-noms-clients.ts
 *
 * Prouve, sur les 41 études de l'index : le H1 du téléphone, les libellés de
 * liste et les cartes du carrousel portent le client en casse normale, sans
 * « Étude de cas », sans « Orthus » ni mot interdit ; et chaque étude a son
 * entrée de corpus mobile (les trois fiches à en-tête comprises).
 */
import assert from "node:assert/strict";

import indexBrut from "@/maquette/contenu/site/index.json";
import { courtLibelle, type EntreeIndex } from "@/components/site/cocon/maillage-mobile";

import { CORPUS_MOBILE } from "./corpus-mobile";
import { realisationsLiees, titreMobile } from "./donnees-mobiles";
import { enteteCas, libelleCas, nomClient } from "./noms-clients";

assert.equal(nomClient("SAVOYE"), "Savoye");
assert.equal(nomClient("SUEZ IWT"), "Suez IWT");
assert.equal(nomClient("SALAISON DU MÂCONNAIS"), "Salaison du Mâconnais");
assert.equal(nomClient("McCAIN"), "McCAIN");
assert.equal(libelleCas("Étude de cas AKTID : un centre"), "Aktid : un centre");
assert.deepEqual(enteteCas("Étude de cas EATON : six techniciens"), {
  client: "Eaton",
  titre: "Six techniciens",
  complet: "Eaton : six techniciens",
});

/* Le client d'un libellé est déjà passé par `nomClient` : le repasser ne
   change rien (« SAVOYE : … » tomberait, « JTEKT : … » passe). */
const clientNormal = (texte: string) => {
  const client = texte.split(" : ")[0];
  return nomClient(client) === client;
};
const INTERDIT = /orthus|sur mesure|candidats|\u2014|^Étude de cas/i;

const cas = (indexBrut as readonly EntreeIndex[]).filter((x) => /^\/preuves\/.+/.test(x.url));
assert.equal(cas.length, 41, "41 études de cas dans l'index");
for (const x of cas) {
  const corpus = CORPUS_MOBILE[x.url];
  assert.ok(corpus, `${x.url} : pas d'entrée de corpus mobile`);
  const titre = titreMobile(x.url, corpus.titreCourt) ?? "";
  for (const texte of [titre, courtLibelle(x)]) {
    assert.ok(texte && clientNormal(texte) && !INTERDIT.test(texte), `${x.url} : « ${texte} »`);
  }
  for (const carte of realisationsLiees(x.url)) {
    assert.ok(clientNormal(carte.client) && !INTERDIT.test(carte.titre), `${x.url} : carte « ${carte.client} »`);
  }
}
/* Témoin : la porte tombe sur un client resté en capitales. */
assert.equal(clientNormal("SAVOYE : une alliance"), false);
for (const url of ["/preuves/savoye/", "/preuves/savoye-migration-automates-norvege/", "/preuves/dimomaint/"]) {
  assert.ok(CORPUS_MOBILE[url]?.concernes && CORPUS_MOBILE[url]?.lireAussi?.length, `${url} : liens du panneau`);
}
assert.equal(titreMobile("/preuves/savoye/", CORPUS_MOBILE["/preuves/savoye/"].titreCourt), "Savoye : alliance intralogistique");

console.log(`Noms de clients : ${cas.length} études, H1 du téléphone, libellés et cartes en casse normale.`);
