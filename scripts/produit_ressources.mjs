/**
 * Produit la donnée du gabarit RESSOURCE, une page par fichier.
 *
 *   node scripts/produit_ressources.mjs
 *
 * SOURCE : `supabase/import/editorial-analyse.json`, c'est-à-dire le corpus
 * rédigé par le client, analysé une fois pour toutes. Pas la base : la moitié
 * des pages de `/ressources/` y sont TRONQUÉES par l'import SQL interrompu
 * (voir la section 15 de CLAUDE.md), et le fichier d'analyse en est le
 * surensemble exact. Partir de la base aurait figé la troncature dans le
 * nouveau gabarit.
 *
 * SORTIE : `supabase/import/gabarits-maquette/<chemin-aplati>.json`, que
 * `scripts/importe_rest.mjs` pose par l'API REST.
 *
 * CE SCRIPT NE RÉÉCRIT AUCUN TEXTE. Il déplace trois éléments du corps vers la
 * section de la maquette qui leur correspond, et ne touche à rien d'autre :
 *
 *   · la phrase de rappel téléphonique      -> le bandeau en lavis orange
 *   · l'encadré « À lire aussi »            -> la carte « Aller plus loin »
 *   · l'encadré « L'essentiel »             -> la carte « À retenir »
 *   · le titre et les questions de la FAQ   -> la section en dépliants
 *
 * Tout le reste reste dans `corps`, dans l'ordre où le client l'a écrit.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SOURCE = join(RACINE, "supabase", "import", "editorial-analyse.json");
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/**
 * Les six rayons de `/ressources/` ne relèvent PAS de ce gabarit.
 *
 * Ce sont des pages de LISTE, et la maquette leur donne son gabarit
 * « guides » (`isGuides`, ligne 10086), avec son volet de rayons et sa
 * recherche. Les plier au gabarit de document leur aurait collé une pastille
 * de format et un chapeau d'auteur sur un sommaire.
 */
const RAYONS = new Set([
  "/ressources/",
  "/ressources/articles/",
  "/ressources/fiches-pratiques/",
  "/ressources/fiches-techniques/",
  "/ressources/livres-blancs/",
  "/ressources/process/",
]);

/**
 * La pastille de format, dans les mots de la maquette.
 *
 * `RES[rk].kind`, ligne 9753 : « Article », « Fiche pratique », « Fiche
 * technique », « Process ». La maquette ne dessine PAS de fiche de livre blanc
 * (il n'y a pas de clé `livre` dans `RES`) : le libellé vient alors du rayon
 * lui-même, `CATS` ligne 8768, « Livres blancs », au singulier.
 */
const PASTILLES = {
  articles: "Article",
  "fiches-pratiques": "Fiche pratique",
  "fiches-techniques": "Fiche technique",
  process: "Process",
  "livres-blancs": "Livre blanc",
};

/** Ligne 6549 de la maquette, le libellé de la carte « Aller plus loin ». */
const LIBELLE_LIEN = "La page complète →";

const estRappel = (t) => /\bdans l['’]heure\b/i.test(t);
const estALireAussi = (t) => /^À lire aussi\s*:/i.test(t);
const estEssentiel = (t) => /^L['’]essentiel\s*:/i.test(t);
const estTitreFaq = (b) =>
  b.type === "titre" && b.niveau === 2 && /^questions fréquentes/i.test(b.texte);
const estQuestion = (b) =>
  b.type === "paragraphe" && typeof b.accroche === "string" && b.accroche.trim().endsWith("?");

/**
 * Majuscule d'amorce, et rien d'autre.
 *
 * Le corpus écrit ses libellés de lien en bas de casse, « permis de feu », ce
 * qui est juste au fil d'une phrase. En titre de carte, la maquette écrit
 * « Nos partenaires technologiques ». Mettre la première lettre en capitale est
 * de la typographie : aucun mot n'est ajouté, aucun n'est retiré.
 */
const amorce = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1);

/** `À lire aussi : [libellé](/chemin/)` donne la carte « Aller plus loin ». */
function carteAllerPlusLoin(texte) {
  const m = texte.match(/\[([^\]]+)\]\((\/[^)]*)\)/);
  if (!m) return null;
  return {
    surtitre: "Aller plus loin",
    titre: amorce(m[1]),
    lienHref: m[2],
    lienLibelle: LIBELLE_LIEN,
  };
}

function transforme(entree) {
  const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
  const rayon = url.split("/")[2];
  const blocs = entree.contenu.blocs ?? [];

  const corps = [];
  const cartes = [];
  const questions = [];
  let rappel;
  let dansLaFaq = false;

  for (const bloc of blocs) {
    if (bloc.type === "citation") {
      if (!rappel && estRappel(bloc.texte)) {
        rappel = bloc.texte;
        continue;
      }
      if (estALireAussi(bloc.texte)) {
        const carte = carteAllerPlusLoin(bloc.texte);
        if (carte) {
          cartes.push(carte);
          continue;
        }
      }
      if (estEssentiel(bloc.texte)) {
        // Le surtitre de la carte dit déjà « À retenir » : garder l'amorce
        // « L'essentiel : » l'aurait écrit deux fois.
        cartes.unshift({
          surtitre: "À retenir",
          texte: amorce(bloc.texte.replace(/^L['’]essentiel\s*:\s*/i, "")),
        });
        continue;
      }
    }

    if (estTitreFaq(bloc)) {
      // Le titre disparaît : le bloc `Objections` porte déjà son surtitre
      // « Questions fréquentes ». Le garder aurait écrit deux fois les mêmes
      // mots, l'un au-dessus de l'autre.
      dansLaFaq = true;
      continue;
    }

    if (dansLaFaq && estQuestion(bloc)) {
      questions.push({ question: bloc.accroche, reponse: bloc.texte });
      continue;
    }

    corps.push(bloc);
  }

  const contenu = { gabarit: "ressource" };
  const pastille = PASTILLES[rayon];
  if (pastille) contenu.categorie = pastille;
  if (entree.contenu.chapeau) contenu.chapeau = entree.contenu.chapeau;
  if (rappel) contenu.rappel = rappel;
  if (cartes.length > 0) contenu.cartes = cartes;
  if (corps.length > 0) contenu.corps = corps;
  if (questions.length > 0) contenu.questions = questions;

  return { url, h1: entree.h1, contenu, blocs_corpus: blocs.length };
}

const corpus = JSON.parse(readFileSync(SOURCE, "utf8"));
const pages = corpus
  .map((e) => ({ ...e, url: e.url.endsWith("/") ? e.url : `${e.url}/` }))
  .filter((e) => e.url.startsWith("/ressources/") && !RAYONS.has(e.url) && e.contenu?.blocs);

mkdirSync(SORTIE, { recursive: true });

let total = 0;
for (const entree of pages) {
  const page = transforme(entree);
  const nom = `${page.url.slice(1, -1).replace(/\//g, "-")}.json`;
  writeFileSync(join(SORTIE, nom), `${JSON.stringify(page, null, 2)}\n`);
  total += 1;
  const c = page.contenu;
  console.log(
    `${page.url.padEnd(54)} ${String(c.corps?.length ?? 0).padStart(3)} blocs de corps, ` +
      `${String(c.questions?.length ?? 0).padStart(2)} questions, ` +
      `${c.cartes?.length ?? 0} carte(s)${c.rappel ? ", rappel" : ""}`,
  );
}

console.log(`\n${total} page(s) écrite(s) dans supabase/import/gabarits-maquette/.`);
