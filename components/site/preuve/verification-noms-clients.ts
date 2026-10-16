/**
 * PORTE DES NOMS DE CLIENTS AU TÉLÉPHONE (maquette V3, lot 7, 16/10).
 *
 *   bun components/site/preuve/verification-noms-clients.ts
 *
 * Prouve, sur les 41 études de l'index : le H1 du téléphone, les libellés de
 * liste et les cartes du carrousel portent le client en casse normale, sans
 * « Étude de cas », sans « Orthus » ni mot interdit ; et chaque étude a son
 * entrée de corpus mobile (les trois fiches à en-tête comprises).
 *
 * Et (16/10) : `casseNormale`, le `cleanCase` de la V3 que le gabarit passe
 * au texte du téléphone ; le H1 servi des 41 études ne porte qu'UN titre,
 * le titre du téléphone vit hors du H1, `aria-hidden`.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import indexBrut from "@/maquette/contenu/site/index.json";
import { courtLibelle, type EntreeIndex } from "@/components/site/cocon/maillage-mobile";

import { CORPUS_MOBILE } from "./corpus-mobile";
import { realisationsLiees, titreMobile } from "./donnees-mobiles";
import { casseNormale, enteteCas, libelleCas, nomClient } from "./noms-clients";
import PagePreuve from "./PagePreuve";
import type { ContenuPreuve } from "@/types/preuve";

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

/* `cleanCase` de la V3 : segments du corps (strict) et accroches. */
assert.equal(casseNormale("AKTID a confié à Migen", true), "Aktid a confié à Migen");
assert.equal(casseNormale("avec celles d'AKTID, sur le même planning.", true), "avec celles d'Aktid, sur le même planning.");
assert.equal(casseNormale("AKTID", true), "Aktid");
assert.equal(casseNormale("ALSTEF GROUP", true), "Alstef Group");
assert.equal(casseNormale("Un automaticien SIEMENS pour la SNCF et JTEKT", true), "Un automaticien SIEMENS pour la SNCF et JTEKT");
assert.equal(casseNormale("SIEMENS : un automate", true), "SIEMENS : un automate");
assert.equal(casseNormale("SIEMENS : un automate"), "Siemens : un automate");
assert.equal(casseNormale("Client : EATON"), "Client : Eaton");
assert.equal(casseNormale("Étude de cas SAVOYE : alliance"), "Savoye : alliance");

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

/* UN SEUL TITRE DANS LE H1 SERVI (défaut du 16/10 : « Aktid : un centre…
   semaines Un centre… semaines » dans un seul H1). Chaque étude rendue pour
   de vrai : un H1, son texte est le titre de bureau et lui seul ; le titre
   du téléphone est hors du H1, `aria-hidden`. Témoin : le gabarit du
   commit 5646337 (titre du téléphone DANS le H1) tombe à la 2e assertion. */
const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = `${RACINE}supabase/import/gabarits-maquette`;
const fixtures = readdirSync(DOSSIER)
  .filter((f) => /^preuves-.+\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(`${DOSSIER}/${f}`, "utf8")) as { url: string; titre_h1: string; contenu: ContenuPreuve })
  .filter((p) => (p.contenu as { gabarit?: string }).gabarit === "etude-de-cas");
assert.ok(fixtures.length >= 41, `${fixtures.length} études rendues, 41 attendues`);
const texteDe = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
for (const p of fixtures) {
  const html = renderToStaticMarkup(
    createElement(PagePreuve, { titre: p.titre_h1, contenu: p.contenu, formulaire: "porte", chemin: p.url }),
  );
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1]);
  assert.equal(h1.length, 1, `${p.url} : ${h1.length} H1`);
  assert.ok(!h1[0].includes("data-titre-mobile"), `${p.url} : le titre du téléphone est dans le H1`);
  assert.equal(texteDe(h1[0]), texteDe(p.titre_h1), `${p.url} : H1 « ${texteDe(h1[0])} »`);
  assert.match(html, /<div aria-hidden="true" data-mobile-seulement="" data-titre-mobile=""/, `${p.url} : titre du téléphone absent ou lu`);
}
console.log(`Noms de clients : ${cas.length} études, H1 du téléphone, libellés et cartes en casse normale ; cleanCase porté ; ${fixtures.length} H1 servis à un seul titre.`);
