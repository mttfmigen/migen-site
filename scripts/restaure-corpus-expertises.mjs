/**
 * LA PROSE DE « L'offre » REMISE DANS LE RELAIS DU GABARIT 05 SPÉCIALITÉ
 * (`supabase/import/gabarits-maquette/expertises-*.json`), campagne mobile v2
 * du 14/10, mesure M2 :
 *
 *   node scripts/restaure-corpus-expertises.mjs              rapport seul
 *   node scripts/restaure-corpus-expertises.mjs --applique   écrit les fichiers
 *   node scripts/restaure-corpus-expertises.mjs --controle   témoins
 *
 * CE QUI MANQUAIT. Chaque fiche du gabarit écrit, sous le tableau de
 * « ## L’offre », un paragraphe de maillage de 31 à 56 mots portant trois à
 * cinq liens internes. Le relais ne le portait pas. Il est remis VERBATIM dans
 * `sections[offre].prose`, champ que `types/contenu.ts` déclare déjà, et rendu
 * au téléphone seulement par `ProseOffreMobile` (la maquette mobile le lit dans
 * la fiche ; la capture de bureau ne le rend pas, et le bureau ne bouge pas).
 *
 * TROIS FICHES SONT ÉCARTÉES, ET C'EST VOULU : celles dont le relais porte
 * déjà un `complementOffre` (vérin hydraulique, lubrification, préventive
 * systématique). Leur carte « Complément 4 » reprend la première phrase de ce
 * même paragraphe : la remettre en entier la ferait lire deux fois de suite
 * au téléphone.
 *
 * REPRIS DU TRAVAIL INTERROMPU DU 14/10 (commit d39f904), ET RÉDUIT. Le script
 * d'origine remplaçait aussi « par téléphone » par « au 04 78 33 72 05 » dans
 * le déroulé et dans trois réponses de FAQ, et posait un lien sur « Zéro
 * arrêt » dans deux réponses. Écarté : ces textes s'affichent au BUREAU, où la
 * capture de référence écrit « par téléphone » et « Zéro arrêt » sans lien.
 * Les changer changeait la page à 1280 px et lui retirait des mots. Signalé
 * dans `docs/NOUS-CONNAITRE-ARBITRAGES.md`.
 *
 * RIEN NE S'INVENTE : chaque paragraphe écrit ici est lu dans une fiche de
 * `maquette/contenu/site/Expertises/`, octet pour octet, et le script relit
 * le fichier écrit pour le vérifier.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const RELAIS = join(RACINE, "supabase", "import", "gabarits-maquette");
const FICHES = join(RACINE, "maquette", "contenu", "site");

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

function controle() {
  const md = [
    "## Le problème",
    "Ailleurs.",
    "## L’offre",
    "",
    "| A | B |",
    "|---|---|",
    "| x | y |",
    "",
    "Le paragraphe [lien](/a/).",
    "> [CTA](/contact/) · 04",
    "## Le déroulé",
    "1. Étape.",
  ].join("\n");
  const prose = proseDeLOffre(`\n${md}`);
  const ok = prose.length === 1 && prose[0] === "Le paragraphe [lien](/a/).";
  const vide = proseDeLOffre("## Autre\nrien") .length === 0;
  console.log(
    ok && vide
      ? "CONTROLE OK : 2/2 (le paragraphe seul est lu, sans tableau, encadré ni section voisine ; fiche sans offre : rien)"
      : "CONTROLE EN ÉCHEC",
  );
  process.exit(ok && vide ? 0 : 1);
}

if (process.argv.includes("--controle")) controle();

const APPLIQUE = process.argv.includes("--applique");
const index = JSON.parse(readFileSync(join(FICHES, "index.json"), "utf8"));
const pages = index.filter((x) => x.gabarit?.startsWith("05"));

let remis = 0;
let ecartes = 0;
let erreurs = 0;

for (const page of pages) {
  const slug = page.url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  const cheminJson = join(RELAIS, `${slug}.json`);
  const md = readFileSync(join(FICHES, page.fichier), "utf8");
  const j = JSON.parse(readFileSync(cheminJson, "utf8"));
  const offre = j.contenu?.sections?.find((s) => s.type === "offre");
  const prose = proseDeLOffre(md);

  if (!offre || prose.length === 0) {
    console.log(`ERREUR ${page.url} : ${offre ? "aucune prose sous « ## L’offre »" : "pas de section offre au relais"}.`);
    erreurs += 1;
    continue;
  }
  if (j.contenu.complementOffre?.length) {
    console.log(`ÉCARTÉ ${page.url} : « Complément 4 » porte déjà « ${j.contenu.complementOffre[0].texte.slice(0, 40)}… ».`);
    ecartes += 1;
    continue;
  }
  if (offre.prose?.length) {
    const deja = JSON.stringify(offre.prose.map((p) => p.texte)) === JSON.stringify(prose);
    console.log(`${deja ? "DÉJÀ   " : "ERREUR "} ${page.url} : prose ${deja ? "identique à la fiche" : "DIFFÉRENTE de la fiche"}.`);
    if (!deja) erreurs += 1;
    continue;
  }

  offre.prose = prose.map((texte) => ({ texte }));
  remis += 1;
  console.log(`PROSE  ${page.url} : ${prose.length} paragraphe, ${(prose.join(" ").match(/\]\(\//g) ?? []).length} liens.`);
  if (APPLIQUE) {
    writeFileSync(cheminJson, `${JSON.stringify(j, null, 2)}\n`);
    const relu = JSON.parse(readFileSync(cheminJson, "utf8"));
    const texte = relu.contenu.sections.find((s) => s.type === "offre").prose.map((p) => p.texte);
    if (!texte.every((t) => md.includes(t))) {
      console.log(`ERREUR ${page.url} : la prose relue n'est pas dans la fiche.`);
      erreurs += 1;
    }
  }
}

console.log(
  `\n${remis} prose(s) remise(s), ${ecartes} écartée(s), ${erreurs} erreur(s). ${APPLIQUE ? "Fichiers écrits et relus." : "Rapport seul : --applique pour écrire."}`,
);
if (erreurs > 0) process.exitCode = 1;
