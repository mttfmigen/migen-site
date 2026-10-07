/**
 * Extrait les données d'offre de la maquette du client.
 *
 * POURQUOI CE SCRIPT EXISTE. Les pages d'offres ne ressemblaient pas à la
 * maquette, et la cause tenait en une phrase : personne n'avait vu que
 * `maquette/site-final.html` ne porte pas que du dessin, il porte AUSSI SA
 * DONNÉE. Un objet `OFFERS` y définit six offres de trente-trois champs
 * chacune, soit cent quatre-vingt-dix-huit phrases écrites par le client.
 *
 * Les portages précédents partaient du corpus SEO et laissaient vides les
 * champs que le corpus n'alimentait pas. C'est l'inverse qu'il fallait faire :
 * le texte d'une page d'offre est celui de la maquette, mot pour mot, et le
 * corpus ne sert qu'à ce que la maquette ne définit pas.
 *
 * Ce script lit, il n'interprète pas. Il ne reformule rien, ne complète rien,
 * n'invente rien. Une chaîne qui sort d'ici est celle qui est entrée.
 *
 *   node scripts/extrait-offres-maquette.mjs            écrit le fichier
 *   node scripts/extrait-offres-maquette.mjs --controle  vérifie sans écrire
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAQUETTE = join(RACINE, "maquette", "site-final.html");
const SORTIE = join(RACINE, "maquette", "offres-maquette.json");

/** Le marqueur qui ouvre la déclaration des offres dans la maquette. */
const MARQUEUR = "OFFERS = ";

/** Les six clés attendues, pour que l'absence de l'une se voie. */
const CLES_ATTENDUES = [
  "sursite",
  "zero",
  "arret",
  "chantier",
  "etude",
  "construction",
];

/** Les trente-trois champs attendus par offre, pour la même raison. */
const CHAMPS_ATTENDUS = [
  "bref", "cta", "form", "h1a", "h1b", "incP", "incT", "lead", "name", "pill",
  "s00", "s01", "s02", "s10", "s11", "s12", "s20", "s21", "s22", "s30", "s31",
  "s32", "small", "strip", "us0", "us1", "us2", "us3", "us4", "you0", "you1",
  "you2", "you3",
];

/**
 * Découpe l'objet littéral qui suit `OFFERS = ` en équilibrant les accolades.
 *
 * Une expression régulière ne suffit pas : les valeurs contiennent des
 * accolades et des guillemets. On compte, en ignorant ce qui est à l'intérieur
 * d'une chaîne, échappements compris.
 */
function decoupeObjet(source, depart) {
  let profondeur = 0;
  let dansUneChaine = false;
  let echappe = false;

  for (let i = depart; i < source.length; i += 1) {
    const c = source[i];

    if (echappe) {
      echappe = false;
      continue;
    }
    if (c === "\\") {
      echappe = true;
      continue;
    }
    if (c === '"') {
      dansUneChaine = !dansUneChaine;
      continue;
    }
    if (dansUneChaine) continue;

    if (c === "{") profondeur += 1;
    else if (c === "}") {
      profondeur -= 1;
      if (profondeur === 0) return source.slice(depart, i + 1);
    }
  }

  throw new Error(
    "accolade jamais refermée après « OFFERS = » : la maquette a changé de forme",
  );
}

/** Lit les offres de la maquette. Lève une erreur plutôt que de deviner. */
export function litOffresDeLaMaquette(chemin = MAQUETTE) {
  const source = readFileSync(chemin, "utf8");
  const marqueur = source.indexOf(MARQUEUR);

  if (marqueur === -1) {
    throw new Error(
      `« ${MARQUEUR} » introuvable dans ${chemin} : la maquette a change de forme, ` +
        "le portage ne peut plus en tirer son texte",
    );
  }

  const brut = decoupeObjet(source, marqueur + MARQUEUR.length);
  const offres = JSON.parse(brut);

  const ligne = source.slice(0, marqueur).split("\n").length;
  return { offres, ligne };
}

/**
 * Contrôle la forme, et le fait savoir. Une offre en moins ou un champ en
 * moins change ce que le site peut rendre : ça doit s'arrêter ici, pas se
 * découvrir en production.
 */
function controle(offres) {
  const defauts = [];

  for (const cle of CLES_ATTENDUES) {
    if (!offres[cle]) defauts.push(`offre absente : ${cle}`);
  }
  for (const cle of Object.keys(offres)) {
    if (!CLES_ATTENDUES.includes(cle)) defauts.push(`offre inattendue : ${cle}`);
  }

  for (const [cle, offre] of Object.entries(offres)) {
    for (const champ of CHAMPS_ATTENDUS) {
      const valeur = offre[champ];
      if (typeof valeur !== "string" || !valeur.trim()) {
        defauts.push(`${cle}.${champ} : vide ou absent`);
      }
    }
    for (const champ of Object.keys(offre)) {
      if (!CHAMPS_ATTENDUS.includes(champ)) {
        defauts.push(`${cle}.${champ} : champ inattendu`);
      }
    }
  }

  return defauts;
}

const estLanceDirectement = process.argv[1]?.endsWith("extrait-offres-maquette.mjs");

if (estLanceDirectement) {
  const { offres, ligne } = litOffresDeLaMaquette();
  const defauts = controle(offres);
  const nbChaines = Object.values(offres).reduce(
    (total, offre) => total + Object.keys(offre).length,
    0,
  );

  console.log(
    `maquette/site-final.html, ligne ${ligne} : ${Object.keys(offres).length} offres, ` +
      `${nbChaines} chaînes`,
  );
  for (const [cle, offre] of Object.entries(offres)) {
    console.log(`  ${cle.padEnd(14)} ${offre.name}`);
  }

  if (defauts.length) {
    console.error(`\n${defauts.length} défaut(s) de forme :`);
    for (const d of defauts) console.error(`  · ${d}`);
    process.exit(1);
  }
  console.log("\nforme conforme : six offres, trente-trois champs non vides chacune");

  if (process.argv.includes("--controle")) {
    console.log("mode contrôle : rien n'est écrit");
    process.exit(0);
  }

  writeFileSync(SORTIE, `${JSON.stringify(offres, null, 2)}\n`, "utf8");

  // On relit ce qu'on vient d'écrire et on compare caractère pour caractère :
  // le but de ce fichier est d'être identique à la maquette, pas « proche ».
  const relu = JSON.parse(readFileSync(SORTIE, "utf8"));
  for (const [cle, offre] of Object.entries(offres)) {
    for (const [champ, valeur] of Object.entries(offre)) {
      if (relu[cle]?.[champ] !== valeur) {
        console.error(`écriture infidèle sur ${cle}.${champ}`);
        process.exit(1);
      }
    }
  }

  console.log(`écrit : maquette/offres-maquette.json (relu et identique)`);
}
