/**
 * RESTAURATION DU CORPUS SUR LES GABARITS 05 ET 09 (relais
 * `supabase/import/gabarits-maquette/expertises-*.json`), mesures M2 et M4 de
 * la campagne mobile v2 du 14/10 :
 *
 *   node scripts/restaure-corpus-expertises.mjs            rapport seul
 *   node scripts/restaure-corpus-expertises.mjs --applique écrit les fichiers
 *
 * M2 — LA PROSE DE « L'offre » (gabarit 05). Chacune des 19 fiches écrit,
 * après le tableau de l'offre, un paragraphe de maillage (31 à 56 mots, 3 à
 * 5 liens internes). Le relais ne le portait pas : il est remis VERBATIM dans
 * `sections[offre].prose`, champ que `types/contenu.ts` déclare déjà, et
 * rendu par `specialite/ProseOffreMobile.tsx`.
 *
 * M4 — LE 04 78 33 72 05 RÉÉCRIT EN « par téléphone ». Les fiches écrivent le
 * numéro (étape 1 du déroulé, réponses de FAQ) ; le relais l'avait réécrit.
 * Chaque remise est VÉRIFIÉE contre la fiche : la phrase restaurée doit y
 * exister mot pour mot, sinon rien n'est écrit et l'écart est signalé.
 * « Qualification par téléphone. » (maintenance-curative) est la copie du
 * client, PAS une réécriture : la fiche l'écrit ainsi, elle ne bouge pas.
 *
 * MÊME RÈGLE QUE TOUT LE DÉPÔT : rien ne s'invente. Chaque octet écrit ici
 * vient d'une fiche de `maquette/contenu/site/Expertises/`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const APPLIQUE = process.argv.includes("--applique");
const RELAIS = join(RACINE, "supabase", "import", "gabarits-maquette");
const FICHES = join(RACINE, "maquette", "contenu", "site");
const NUMERO = "04 78 33 72 05";

const index = JSON.parse(readFileSync(join(FICHES, "index.json"), "utf8"));

/** Les paragraphes de prose de la section « ## L’offre » d'une fiche. */
export function proseDeLOffre(md) {
  const apres = md.split(/\n## L’offre\n/)[1];
  if (!apres) return [];
  return apres
    .split(/\n## /)[0]
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (t) =>
        t !== "" &&
        !t.startsWith("|") &&
        !t.startsWith(">") &&
        !t.startsWith("-") &&
        !t.startsWith("#") &&
        !/^\d+\./.test(t),
    );
}

/** Un texte sans ses liens Markdown : `[x](/y/)` → `x`. */
export function sansLiens(t) {
  return t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

const pages = index.filter(
  (x) => x.gabarit && (x.gabarit.startsWith("05") || x.gabarit.startsWith("09")),
);

let ecarts = 0;
let remises = 0;

for (const page of pages) {
  const slug = page.url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  const cheminJson = join(RELAIS, `${slug}.json`);
  const md = readFileSync(join(FICHES, page.fichier), "utf8");
  const j = JSON.parse(readFileSync(cheminJson, "utf8"));
  const avant = JSON.stringify(j);
  const sections = j.contenu?.sections ?? [];

  /* ------------------------------------------------- M2 : la prose perdue */
  if (page.gabarit.startsWith("05")) {
    const offre = sections.find((s) => s.type === "offre");
    const prose = proseDeLOffre(md);
    if (offre && prose.length > 0 && !offre.prose?.length) {
      /* Garde-fou anti-doublon : un paragraphe déjà porté ailleurs par le
         relais (même sans ses liens) ne doit pas être écrit deux fois. */
      const deja = prose.filter((p) => avant.includes(JSON.stringify(sansLiens(p)).slice(1, -1)));
      if (deja.length > 0) {
        console.log(`ECART ${page.url} : ${deja.length} paragraphe(s) déjà présents, rien n'est écrit.`);
        ecarts += 1;
      } else {
        offre.prose = prose.map((texte) => ({ texte }));
        remises += prose.length;
        console.log(`PROSE ${page.url} : ${prose.length} paragraphe(s), ${(prose.join(" ").match(/\]\(\//g) ?? []).length} lien(s).`);
      }
    } else if (offre && prose.length === 0) {
      console.log(`ECART ${page.url} : aucune prose trouvée sous « ## L’offre ».`);
      ecarts += 1;
    }
  }

  /* -------------------------------------- M4 : le numéro dans le déroulé */
  const deroule = sections.find((s) => s.type === "deroule");
  for (const etape of deroule?.etapes ?? []) {
    if (!etape.texte || !etape.texte.includes("par téléphone")) continue;
    const candidats = [
      [/un appel par téléphone\./, "un appel au 04 78 33 72 05."],
      [/^par téléphone : /, "au 04 78 33 72 05 : "],
    ];
    let corrige = null;
    for (const [motif, cible] of candidats) {
      if (!motif.test(etape.texte)) continue;
      const essai = etape.texte.replace(motif, cible);
      /* La phrase restaurée doit exister dans la fiche, mot pour mot. */
      if (md.includes(cible)) corrige = essai;
    }
    if (corrige) {
      console.log(`TEL   ${page.url} : « ${etape.texte.slice(0, 48)}… » → le numéro de la fiche.`);
      etape.texte = corrige;
      remises += 1;
    } else {
      console.log(`COPIE ${page.url} : « par téléphone » est la copie de la fiche, rien ne bouge (${(etape.titre ?? etape.texte).slice(0, 40)}…).`);
    }
  }

  /* --------------------------- M2/M4 : les réponses de FAQ amputées */
  const objections = sections.find((s) => s.type === "objections");
  for (const q of objections?.questions ?? []) {
    if (!q.reponse) continue;
    const ligne = md
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith(`**${q.question}**`));
    if (!ligne) continue;
    const reponseFiche = ligne.slice(`**${q.question}**`.length).trim();
    if (reponseFiche === q.reponse) continue;
    const nue = sansLiens(reponseFiche);
    const acceptables = [
      q.reponse,
      q.reponse.replace(/par téléphone/g, `au ${NUMERO}`),
    ];
    if (acceptables.includes(nue)) {
      console.log(`FAQ   ${page.url} : réponse « ${q.question.slice(0, 44)}… » reprise de la fiche (liens/numéro).`);
      q.reponse = reponseFiche;
      remises += 1;
    }
  }

  if (JSON.stringify(j) !== avant && APPLIQUE) {
    writeFileSync(cheminJson, `${JSON.stringify(j, null, 2)}\n`);
  }
}

console.log(`\n${remises} remise(s), ${ecarts} écart(s) signalé(s). ${APPLIQUE ? "Fichiers écrits." : "Rapport seul : relancer avec --applique pour écrire."}`);
if (ecarts > 0) process.exitCode = 1;
