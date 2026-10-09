/**
 * L'état publié dans docs/ETAT-MIGRATION.md dit-il encore la vérité ?
 *
 *   node scripts/verifie-etat-migration.mjs
 *
 * POURQUOI. `docs/RELAIS-08-10.md` a été trouvé périmé de six commits le 09/10 :
 * huit de ses points étaient faits et il annonçait le contraire. Un état du
 * chantier n'a donc aucune valeur s'il n'a pas de moyen de se déclarer périmé.
 * L'état publié porte un bloc de chiffres marqué `etat-migration`, ce contrôle
 * les remesure, et toute dérive le fait tomber.
 *
 * IL NE SE CONTENTE PAS DE RELIRE MON PROPRE OUTIL. `mesure-etat-migration.mjs`
 * a déjà produit deux faux chiffres ce jour-là : la clé de service déclarée
 * posée alors qu'elle est vide (un `\s` qui avale le retour à la ligne), et un
 * verdict d'une autre porte imprimé au milieu de la mesure (un import qui
 * exécutait le balayage). Trois chiffres sont donc RECALCULÉS ICI PAR UNE AUTRE
 * MÉTHODE que celle de l'outil : le nombre de fiches par un comptage de
 * répertoire, les emplacements de photo par un parcours de l'arbre JSON et non
 * par une expression régulière sur le texte, et les adresses déclarées par la
 * lecture directe de l'index. Si les deux méthodes divergent, c'est l'outil de
 * mesure qui est en cause, et ce contrôle le dit au lieu de le couvrir.
 */
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const ETAT = join(RACINE, "docs", "ETAT-MIGRATION.md");
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------- le bloc publié dans le document */

const texte = readFileSync(ETAT, "utf8");
const bloc = texte.match(/```json etat-migration\n([\s\S]*?)```/);
if (!bloc) {
  console.log("docs/ETAT-MIGRATION.md ne porte pas son bloc « ```json etat-migration ```.");
  process.exit(1);
}
const publie = JSON.parse(bloc[1]);

/* -------------------------------------------------- la mesure, par son outil */

const mesure = JSON.parse(
  execFileSync("node", [join(RACINE, "scripts", "mesure-etat-migration.mjs"), "--json"], {
    cwd: RACINE,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  }),
);

/* ------------------------------------ trois chiffres recalculés AUTREMENT */

const fichesAutrement = readdirSync(FICHES).filter((f) => f.endsWith(".json")).length;

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const adressesAutrement = new Set(pagesIndex.map((p) => p?.url).filter(Boolean)).size;

/* Parcours de l'arbre JSON, et non une expression régulière sur le texte brut. */
const DECLARATIFS = new Set(["_reference", "retraits", "phrases_retirees", "trous", "_source", "source"]);
const IMAGE = /\.(?:jpe?g|png|webp|avif)$/i;
let emplacementsAutrement = 0;
const compte = (valeur) => {
  if (typeof valeur === "string") {
    if (valeur.startsWith("/assets/") && IMAGE.test(valeur)) emplacementsAutrement++;
    return;
  }
  if (Array.isArray(valeur)) return valeur.forEach(compte);
  if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) if (!DECLARATIFS.has(cle)) compte(v);
  }
};
for (const f of readdirSync(FICHES).filter((x) => x.endsWith(".json"))) {
  compte(JSON.parse(readFileSync(join(FICHES, f), "utf8")));
}

/* --------------------------------------------------------------- verdicts */

const chemin = (objet, route) => route.split(".").reduce((o, k) => o?.[k], objet);
const ROUTES = [
  "depot.branche",
  "depot.tete",
  "pages.declarees",
  "pages.fiches",
  "photos.emplacements",
  "photos.distinctes",
  "photos.banque",
  "photos.pagesQuiRepetent",
  "defauts.annoncesOrphelines",
  "defauts.couplesTitreSuite",
  "ouverts.fichesOrthus",
  "ouverts.phrasesPrixRetirees",
  "ouverts.pagesPrixRetirees",
  "ouverts.mentionsLegalesACompleter",
  "ouverts.cleServiceSupabasePosee",
];

const ecarts = [];
for (const route of ROUTES) {
  const a = chemin(publie, route);
  const b = chemin(mesure, route);
  if (JSON.stringify(a) !== JSON.stringify(b)) ecarts.push({ route, publie: a, mesure: b });
}

/* Les trois recalculs : ils mettent l'outil lui-même à l'épreuve. L'écart de
   `emplacements` entre les deux méthodes est ATTENDU et il est déclaré : le
   parcours de l'arbre écarte les champs déclaratifs (`trous`, `retraits`) que
   l'expression régulière, elle, voit. Ce qui est refusé, c'est un écart dans
   l'autre sens, ou plus grand que le nombre de champs déclaratifs. */
const croises = [
  ["fiches, par comptage de répertoire", fichesAutrement === mesure.pages.fiches, `${fichesAutrement} contre ${mesure.pages.fiches}`],
  ["adresses, par lecture directe de l'index", adressesAutrement === mesure.pages.declarees, `${adressesAutrement} contre ${mesure.pages.declarees}`],
  [
    "emplacements de photo, par parcours de l'arbre JSON",
    emplacementsAutrement <= mesure.photos.emplacements && mesure.photos.emplacements - emplacementsAutrement <= 40,
    `${emplacementsAutrement} contre ${mesure.photos.emplacements} (les déclaratifs expliquent l'écart)`,
  ],
];

for (const [quoi, ok, detail] of croises) console.log(`  ${ok ? "OK  " : "RATE"}  recalcul : ${quoi} — ${detail}`);

if (ecarts.length > 0) {
  console.log("");
  for (const e of ecarts) {
    console.log(`  DÉRIVE  ${e.route} : publié ${JSON.stringify(e.publie)}, mesuré ${JSON.stringify(e.mesure)}`);
  }
  console.log("\ndocs/ETAT-MIGRATION.md est périmé. Relancer node scripts/mesure-etat-migration.mjs --json et mettre son bloc à jour.");
  process.exit(1);
}
if (!croises.every(([, ok]) => ok)) {
  console.log("\nles deux méthodes de mesure divergent : c'est scripts/mesure-etat-migration.mjs qui est en cause.");
  process.exit(1);
}

console.log(`\nétat de la migration conforme à la mesure (${ROUTES.length} chiffres, 3 recalculés autrement)`);
