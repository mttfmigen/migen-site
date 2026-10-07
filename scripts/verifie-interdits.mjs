/**
 * Les interdits de copie du contrat, cherchés dans TOUTE la copie du site.
 *
 *   node scripts/verifie-interdits.mjs
 *
 * POURQUOI CE CONTRÔLE EXISTE. Chaque gabarit porte déjà sa propre liste
 * d'interdits, appliquée au HTML qu'il rend. Ces listes ont laissé passer cinq
 * fois « +200 clients », parce qu'aucune ne cherchait un CHIFFRE : elles
 * cherchaient des mots. Le compte réel est « plus de 120 clients, dont plus de
 * 80 réguliers », et le faux chiffre était rendu dans l'en-tête, le héros, la
 * bande de logos, la frise et la bande de chiffres.
 *
 * Ce contrôle-ci ne rend rien : il lit la SOURCE. C'est ce qui lui permet de
 * voir la copie des composants qu'aucun contrôle de rendu ne monte, et c'est
 * pour cela qu'il complète les autres au lieu de les remplacer.
 *
 * LES COMMENTAIRES SONT RETIRÉS AVANT LA RECHERCHE, et c'est nécessaire : le
 * code explique en commentaire pourquoi il s'écarte de la maquette, donc il
 * cite les formulations interdites. Un contrôle qui ne saurait pas distinguer
 * l'explication de la copie forcerait à effacer les explications.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));

/** Chaque interdit, avec ce qu'il faut écrire à la place. */
const INTERDITS = [
  // Chiffres faux ou interdits.
  ["+200", "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers »"],
  ["200 clients", "« plus de 120 clients, dont plus de 80 réguliers »"],
  ["5 agences", "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  ["Cinq agences", "quatre agences"],
  ["cinq agences", "quatre agences"],
  // Délais chiffrés d'intervention : seul « rappel dans l'heure » est autorisé.
  ["sous 24 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 48 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 2 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 4 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["sous 72 h", "« rappel dans l'heure », aucun autre délai chiffré"],
  ["h de route", "aucun délai ni distance chiffrés"],
  ["heures de route", "aucun délai ni distance chiffrés"],
  // Passation, règles validées par le client : « Aucune mention 24h/24, 7j/7
  // ou « 24h », nulle part ». Motifs et non chaînes : l'espace varie (aucune,
  // ordinaire, insécable U+00A0 ou fine U+202F, toutes couvertes par \s), et
  // la lettre aussi (« 24/24 et 7/7 » dit la même chose que « 24h/24, 7j/7 »).
  [/\b24\s*h?\s*\/\s*(?:24|7)\b/u, "aucune mention de disponibilité 24h/24, à retirer"],
  [/\b7\s*j?\s*\/\s*7\b/u, "aucune mention 7j/7, à retirer"],
  // « 24h » ou « 24 h » comme mot isolé : pas « 24 heures », pas « 24h/24 »
  // (déjà signalé ci-dessus), pas « 124 h ».
  [/\b24\s*h(?![\p{L}\d]|\s*\/)/u, "aucune mention « 24h », à retirer"],
  // Vocabulaire proscrit.
  ["régie", "« résidence » ou « technicien sur site »"],
  ["intérim", "nommer la prestation, jamais le statut"],
  ["mise à disposition", "« intervention » ou « mission »"],
  ["sans engagement", "dire la durée réelle, ou ne rien dire"],
  ["clé en main", "dire ce qui est fait"],
  ["sur mesure", "dire ce qui s'adapte, et à quoi"],
  ["levier", "dire l'effet obtenu"],
  ["concrètement", "à supprimer, le paragraphe suivant le dit déjà"],
  ["notamment", "à supprimer, ou « dont »"],
  ["incontournable", "à supprimer"],
  ["découvrez", "un verbe qui dit ce que la page fait"],
  ["Découvrez", "un verbe qui dit ce que la page fait"],
  // Typographie.
  ["—", "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
];

/* `/assets/...—...` n'existe pas, mais une URL ou un nom de fichier pourrait
   contenir une suite interdite sans être de la copie. Les lignes d'import et
   les chemins sont donc ignorés. */
const IGNOREES = [/^\s*import\s/, /^\s*\/\/\//];

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    if (entree === "node_modules" || entree.startsWith(".")) continue;
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) {
      trouves.push(...fichiers(chemin));
    } else if (/\.(tsx?|mdx?)$/.test(entree) && !/verif|verifie/.test(entree)) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

/** Retire les commentaires, en gardant les numéros de ligne. */
function sansCommentaires(source) {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, (bloc) => bloc.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (bloc) => bloc.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, (ligne, avant) => avant);
}

const trouvailles = [];
for (const chemin of [
  ...fichiers(join(RACINE, "components")),
  ...fichiers(join(RACINE, "app")),
  ...fichiers(join(RACINE, "lib")),
]) {
  const lignes = sansCommentaires(readFileSync(chemin, "utf8")).split("\n");
  lignes.forEach((ligne, i) => {
    if (IGNOREES.some((motif) => motif.test(ligne))) return;
    for (const [motif, remede] of INTERDITS) {
      // Une chaîne se cherche telle quelle, un motif rend le fragment trouvé.
      const interdit =
        typeof motif === "string"
          ? ligne.includes(motif) && motif
          : ligne.match(motif)?.[0];
      if (interdit) {
        trouvailles.push({
          ou: `${relative(RACINE, chemin)}:${i + 1}`,
          interdit,
          remede,
          ligne: ligne.trim().slice(0, 100),
        });
      }
    }
  });
}

if (trouvailles.length > 0) {
  for (const t of trouvailles) {
    console.error(`${t.ou}\n  interdit : « ${t.interdit} »\n  à la place : ${t.remede}\n  ${t.ligne}\n`);
  }
  console.error(`${trouvailles.length} formulation(s) interdite(s) dans la copie.`);
  process.exit(1);
}

console.log("copie conforme aux interdits du contrat");
