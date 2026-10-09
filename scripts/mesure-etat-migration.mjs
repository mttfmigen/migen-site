/**
 * Mesure l'état du chantier, chiffre par chiffre, À LA SOURCE.
 *
 *   node scripts/mesure-etat-migration.mjs            (lisible)
 *   node scripts/mesure-etat-migration.mjs --json      (pour un contrôle)
 *
 * POURQUOI CET OUTIL EXISTE. Le relais `docs/RELAIS-08-10.md` s'est trouvé
 * périmé de six commits le 09/10 : huit de ses points étaient faits et il
 * annonçait l'inverse. Un état du chantier recopié depuis un document n'est
 * donc pas une mesure, c'est une citation. Tout chiffre publié dans
 * `docs/ETAT-MIGRATION.md` sort d'ici, et `scripts/verifie-etat-migration.mjs`
 * refait la mesure pour refuser un rapport qui aurait dérivé.
 *
 * Il ne touche à rien et ne demande pas le serveur de développement : il lit le
 * dépôt, les 246 fiches et l'index. Les mesures qui exigent un rendu vivent
 * dans leurs propres portes (`verifie-libelles-orphelins`,
 * `verifie-suites-de-titre`, `verifie-adresses-servies`).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const JSON_SEUL = process.argv.includes("--json");

const git = (...args) =>
  execFileSync("git", args, { cwd: RACINE, encoding: "utf8" }).trim();

const fiches = readdirSync(FICHES).filter((f) => f.endsWith(".json"));
const lue = (f) => JSON.parse(readFileSync(join(FICHES, f), "utf8"));

/** Chaque chaîne d'une fiche, les champs déclaratifs écartés. */
const DECLARATIFS = new Set(["_reference", "retraits", "phrases_retirees", "trous", "_source", "source"]);
function* chaines(valeur) {
  if (typeof valeur === "string") yield valeur;
  else if (Array.isArray(valeur)) for (const v of valeur) yield* chaines(v);
  else if (valeur && typeof valeur === "object")
    for (const [cle, v] of Object.entries(valeur)) if (!DECLARATIFS.has(cle)) yield* chaines(v);
}

/* ---------------------------------------------------------------- le dépôt */

const branche = git("rev-parse", "--abbrev-ref", "HEAD");
const tete = git("rev-parse", "--short", "HEAD");
let avance = null;
try {
  const [derriere, devant] = git("rev-list", "--left-right", "--count", `origin/${branche}...HEAD`)
    .split(/\s+/)
    .map(Number);
  avance = { derriere, devant };
} catch {
  avance = null; // pas de branche distante
}
const sales = git("status", "--porcelain")
  .split("\n")
  .filter((l) => l.trim());

/* --------------------------------------------------------------- les pages */

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const urls = [...new Set(pagesIndex.map((p) => p?.url).filter(Boolean))];

/* --------------------------------------------------------------- les photos */

const emplacements = new Map();
const repetitions = [];
for (const f of fiches) {
  const brut = readFileSync(join(FICHES, f), "utf8");
  const dans = [...brut.matchAll(/"(\/assets\/[^"]+\.(?:jpg|jpeg|png|webp|avif))"/g)].map((m) => m[1]);
  for (const p of dans) emplacements.set(p, (emplacements.get(p) ?? 0) + 1);
  const parPage = new Map();
  for (const p of dans) parPage.set(p, (parPage.get(p) ?? 0) + 1);
  if ([...parPage.values()].some((n) => n > 1)) repetitions.push(f);
}
const banque = existsSync(join(RACINE, "public/assets/photos"))
  ? readdirSync(join(RACINE, "public/assets/photos")).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))
  : [];
const photoLaPlusServie = [...emplacements.entries()]
  .filter(([p]) => !p.endsWith(".png") || !p.includes("/clients/"))
  .sort((a, b) => b[1] - a[1])[0] ?? ["—", 0];

/* ------------------------------------------------------- les points ouverts */

/** Les fiches qui portent encore « orthus », quelle que soit la casse. */
const orthus = fiches.filter((f) => /orthus/i.test(readFileSync(join(FICHES, f), "utf8")));

/* Les phrases que la purge des prix a retirées et que la décision du 09/10 au
   soir (« aucun tarif, dire que c'est sur devis ») rend de nouveau dicibles.
   Elles sont DÉCLARÉES dans `trous` ou `phrases_retirees`, c'est là qu'on les
   compte : les chercher dans le rendu ne les trouverait pas, par définition. */
const MOTIF_PRIX = /taux horaire|tarif|prix mensuel fixe|chiffré sur devis/i;
let phrasesPrix = 0;
const pagesPrix = new Set();
for (const f of fiches) {
  const fiche = lue(f);
  for (const cle of ["trous", "phrases_retirees", "retraits"]) {
    for (const entree of fiche[cle] ?? []) {
      const ligne = typeof entree === "string" ? entree : (entree.ligne ?? entree.phrase ?? "");
      if (MOTIF_PRIX.test(ligne)) {
        phrasesPrix++;
        pagesPrix.add(fiche.url ?? f);
      }
    }
  }
}

/* Les mentions légales : ce qui reste à compléter, et que seul Mehdi fournit. */
const mentions = existsSync(join(RACINE, "app/mentions-legales/page.tsx"))
  ? (readFileSync(join(RACINE, "app/mentions-legales/page.tsx"), "utf8").match(/à compléter/gi) ?? []).length
  : null;

/* La clé de service : sans elle, la preuve RGPD ne s'écrit pas. */
const envLocal = existsSync(join(RACINE, ".env.local")) ? readFileSync(join(RACINE, ".env.local"), "utf8") : "";
/* `[^\S\n]` ET PAS `\s` : `\s` avale le retour à la ligne, si bien que
   `SUPABASE_SERVICE_ROLE_KEY=` (vide) voyait sa « valeur » dans la ligne de
   commentaire suivante et la clé était déclarée POSÉE alors qu'elle est vide.
   Faux positif payé le 09/10 sur le défaut le plus sensible du relais. */
const ligneCle = envLocal.match(/^[^\S\n]*SUPABASE_SERVICE_ROLE_KEY[^\S\n]*=([^\n]*)$/m);
const valeurCle = (ligneCle?.[1] ?? "").trim().replace(/^["']|["']$/g, "").replace(/\s+#.*$/, "");
const cleService = valeurCle.length > 20 && !/^#/.test(valeurCle);

/* ------------------------------------------------------- les deux familles */

const { orphelines } = await import("./verifie-libelles-orphelins.mjs").catch(() => ({ orphelines: null }));
let annoncesOrphelines = null;
if (typeof orphelines === "function") {
  annoncesOrphelines = fiches.reduce((n, f) => n + orphelines(lue(f)).length, 0);
}

const { couples } = await import("./verifie-suites-de-titre.mjs").catch(() => ({ couples: null }));
let couplesTitreSuite = null;
if (typeof couples === "function") {
  couplesTitreSuite = fiches.reduce((n, f) => n + couples(lue(f)).length, 0);
}

/* ------------------------------------------------------------------ sortie */

const mesure = {
  depot: { branche, tete, avance, fichiersSales: sales.length },
  pages: { declarees: urls.length, fiches: fiches.length },
  photos: {
    emplacements: [...emplacements.values()].reduce((a, b) => a + b, 0),
    distinctes: emplacements.size,
    banque: banque.length,
    pagesQuiRepetent: repetitions.length,
    plusServie: { fichier: photoLaPlusServie[0].split("/").pop(), fois: photoLaPlusServie[1] },
  },
  defauts: { annoncesOrphelines, couplesTitreSuite },
  ouverts: {
    fichesOrthus: orthus.length,
    phrasesPrixRetirees: phrasesPrix,
    pagesPrixRetirees: pagesPrix.size,
    mentionsLegalesACompleter: mentions,
    cleServiceSupabasePosee: cleService,
  },
};

if (JSON_SEUL) {
  console.log(JSON.stringify(mesure, null, 2));
} else {
  console.log(`dépôt            ${branche} @ ${tete}, ${sales.length} fichier(s) non commité(s)`);
  console.log(`                 origin : ${avance ? `${avance.devant} devant, ${avance.derriere} derrière` : "pas de branche distante"}`);
  console.log(`pages            ${urls.length} adresses déclarées à l'index, ${fiches.length} fiches de contenu`);
  console.log(`photos           ${mesure.photos.emplacements} emplacements, ${mesure.photos.distinctes} distinctes, banque de ${banque.length}`);
  console.log(`                 la plus servie : ${mesure.photos.plusServie.fichier} ${mesure.photos.plusServie.fois}x, ${repetitions.length} page(s) qui répètent`);
  console.log(`défauts          ${annoncesOrphelines} annonce(s) orpheline(s), ${couplesTitreSuite} couple(s) titre+suite à joindre`);
  console.log(`ouverts          ${orthus.length} fiches « orthus », ${phrasesPrix} phrase(s) de prix retirée(s) sur ${pagesPrix.size} page(s)`);
  console.log(`                 mentions légales : ${mentions} champ(s) à compléter ; clé de service Supabase ${cleService ? "posée" : "ABSENTE"}`);
  console.log("\nmesure de l'état terminée");
}
