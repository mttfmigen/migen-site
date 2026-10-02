/**
 * Reste-t-il du Tailwind d'échafaudage dans un composant rendu aux visiteurs ?
 *
 *   node scripts/verifie-echafaudage.mjs
 *
 * CE QUE CE CONTRÔLE ATTRAPE. Les composants du cocon ont été écrits avant la
 * maquette, avec les classes par défaut de Tailwind : `text-zinc-500`,
 * `border-zinc-200`, et des variantes `dark:` alors que le site n'a pas de mode
 * sombre. Cinq de ces composants sont rendus sur CHAQUE page de contenu, dont
 * le maillage interne, qui ferme toutes les pages. C'est ce que le client a vu
 * quand il a dit que le site était « trop grossier ».
 *
 * La charte vit dans des jetons (`--acc`, `--ink`, `--line`, `--card`...) posés
 * dans `app/globals.css`. Une palette Tailwind par défaut à côté d'eux, c'est
 * deux chartes dans le même écran.
 *
 * CE QU'IL N'INTERDIT PAS : les utilitaires de MISE EN PAGE de Tailwind (`flex`,
 * `grid`, `mt-12`, `gap-3`), qui ne portent aucune couleur et ne contredisent
 * rien. Seules les couleurs et les variantes de thème sont visées.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));

/** Chaque motif, avec ce qu'il faut écrire à la place. */
const MOTIFS = [
  [/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
   "un jeton de la charte : --acc, --ink, --ink1 à --ink4, --line, --card, --panel, --chip"],
  [/\bdark:[a-z-]+/g, "rien : le site n'a pas de mode sombre, la charte est blanc crème"],
  [/\b(?:text|bg|border)-(?:white|black)\b/g, "un jeton : #fff et #000 ne sont pas dans la charte"],
];

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    if (entree === "node_modules" || entree.startsWith(".")) continue;
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (/\.tsx$/.test(entree) && !/verif/.test(entree)) trouves.push(chemin);
  }
  return trouves;
}

const trouvailles = [];
for (const chemin of [...fichiers(join(RACINE, "components")), ...fichiers(join(RACINE, "app"))]) {
  const source = readFileSync(chemin, "utf8");
  /* Seules les valeurs de `className` sont lues : un commentaire qui explique
     pourquoi on a retiré `text-zinc-500` ne doit pas faire échouer le
     contrôle, sinon il faudrait effacer les explications. */
  for (const classe of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const valeur = classe[1] ?? classe[2] ?? "";
    for (const [motif, remede] of MOTIFS) {
      for (const occurrence of valeur.matchAll(motif)) {
        trouvailles.push({
          ou: relative(RACINE, chemin),
          classe: occurrence[0],
          remede,
        });
      }
    }
  }
}

if (trouvailles.length > 0) {
  const parFichier = new Map();
  for (const t of trouvailles) {
    if (!parFichier.has(t.ou)) parFichier.set(t.ou, []);
    parFichier.get(t.ou).push(t);
  }
  for (const [fichier, liste] of parFichier) {
    console.error(`  ${fichier} : ${liste.length} classe(s) d'échafaudage`);
    for (const t of [...new Set(liste.map((x) => x.classe))].slice(0, 8)) {
      console.error(`      ${t}`);
    }
    console.error(`      à la place : ${liste[0].remede}`);
  }
  console.error(`${trouvailles.length} classe(s) par défaut dans ${parFichier.size} fichier(s).`);
  process.exit(1);
}

console.log("aucun échafaudage");
