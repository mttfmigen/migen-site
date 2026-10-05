/**
 * Produit la donnée des 19 pages de la branche `/expertises/` servies par les
 * gabarits 09 DOMAINE et 05 SPÉCIALITÉ.
 *
 *   node scripts/produit_domaines.mjs
 *   node scripts/produit_domaines.mjs --simulation   # n'écrit rien
 *
 * CE QUE CE SCRIPT A CESSÉ DE FAIRE, et c'est la réparation.
 *
 * Sa version précédente lisait « Migen - Site final.dc.html » (versionné en
 * `maquette/accueil-rendu.html`) et produisait une forme à plat en six champs :
 * `chapeau`, `boutons`, `traitements`, `autres`, `cta`, `reste`. C'était le
 * gabarit domaine de CE fichier-là : trois sections, un héros, une mosaïque
 * « Ce que nous traitons », une carte de fin, 155 mots. Les huit autres sections
 * du corpus partaient dans `reste`, rendues par les blocs du gabarit de vente.
 *
 * Or le client a conçu ONZE GABARITS DÉDIÉS dans le même projet Claude Design,
 * et personne ne les avait listés. Les deux qui font foi pour cette branche sont
 * versionnés à côté :
 *
 *   `maquette/gabarit-09-domaine.html`     les 9 racines de domaine
 *   `maquette/gabarit-05-specialite.html`  les 10 sous-pages de ces domaines
 *
 * Ils dessinent DOUZE sections chacun, et ces douze cases se remplissent TOUTES
 * depuis les dix sections nommées que le corpus porte déjà. Rien ne manquait au
 * corpus : c'est le placement qui était faux. Ce script ne produit donc plus
 * aucune forme intermédiaire. Il écrit `{ gabarit, sections }`, et `sections`
 * est le tableau du corpus RECOPIÉ TEL QUEL, sans réécriture, sans troncature,
 * sans résumé, sans réordonnancement.
 *
 * LE DÉCOUPAGE DES 30 PAGES DE LA BRANCHE, et ce que ce script NE touche pas :
 *
 *   9 racines `/expertises/<domaine>/`              gabarit 09, ici
 *   10 sous-pages `/expertises/<domaine>/<page>/`   gabarit 05, ici
 *   `/expertises/types-de-maintenance/`             gabarit 10 Hub de rubrique
 *   ses 9 sous-pages                                gabarit 11 Sous-rubrique
 *   `/expertises/specialisations-constructeur/`     gabarit 10 Hub de rubrique
 *   `/expertises/`                                  gabarit de la page Expertises
 *
 * Les onze dernières ne sont PAS des domaines techniques : « types de
 * maintenance » est une taxonomie, « spécialisations constructeur » une page de
 * marques. Les gabarits 10 et 11 existent pour elles, et elles ne sont pas
 * touchées ici. Les lister serait les faire entrer de force dans un dessin qui
 * ne les décrit pas, exactement l'erreur que ce chantier répare.
 *
 * ÉCRITURE EN BASE : ce script n'écrit QUE des fichiers. C'est
 * `scripts/importe_rest.mjs` qui les pose, par l'API REST, parce que la couche
 * de permissions refuse toute instruction SQL portant un point-virgule dans le
 * texte et que le corpus en est plein. Voir `CLAUDE.md` section 15.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");
const SIMULATION = process.argv.includes("--simulation");

/**
 * Les 9 domaines techniques, dans l'ordre du cocon. La liste est FERMÉE : elle
 * dit quelles branches de `/expertises/` sont des domaines, et donc lesquelles
 * reçoivent les gabarits 09 et 05.
 */
const DOMAINES = [
  "automatisme",
  "electrique",
  "electromecanique",
  "hydraulique",
  "mecanique",
  "pneumatique",
  "robotique",
  "soudure",
  "tuyauterie",
];

/** Les dix types de section que le corpus écrit, et que les gabarits placent. */
const TYPES = new Set([
  "heros",
  "chiffres",
  "probleme",
  "offre",
  "deroule",
  "garanties",
  "cta",
  "preuves",
  "objections",
  "ctaFinal",
]);

const corpus = JSON.parse(
  readFileSync(join(RACINE, "supabase", "import", "corpus-analyse.json"), "utf8"),
);

const entrees = corpus
  .map((e) => ({ ...e, url: e.url.endsWith("/") ? e.url : `${e.url}/` }))
  .filter((e) => {
    const segments = e.url.split("/").filter(Boolean);
    return (
      segments[0] === "expertises" &&
      segments.length >= 2 &&
      segments.length <= 3 &&
      DOMAINES.includes(segments[1]) &&
      e.contenu?.sections?.length
    );
  })
  .sort((a, b) => a.url.localeCompare(b.url));

if (entrees.length === 0) {
  console.error("  aucune page de domaine dans le corpus : rien à produire");
  process.exit(1);
}

mkdirSync(SORTIE, { recursive: true });

const lignes = [];
const manques = [];
let ecrits = 0;

for (const entree of entrees) {
  const segments = entree.url.split("/").filter(Boolean);
  // La racine d'un domaine a deux segments, une spécialité en a trois. C'est la
  // SEULE règle qui distingue les deux gabarits, et elle est structurelle : une
  // liste de slugs à tenir à la main aurait dérivé au premier ajout de page.
  const gabarit = segments.length === 2 ? "domaine" : "specialite";

  const inconnues = entree.contenu.sections
    .map((s) => s.type)
    .filter((t) => !TYPES.has(t));
  if (inconnues.length > 0) {
    manques.push(`${entree.url} porte des sections inconnues : ${inconnues.join(", ")}`);
    continue;
  }

  // Ce que les gabarits dessinent et que le corpus de CETTE page n'alimente
  // pas. La section reste vide, donc ne se rend pas du tout.
  const presentes = new Set(entree.contenu.sections.map((s) => s.type));
  for (const [type, ou] of [
    ["chiffres", "la carte « En bref » du héros"],
    ["probleme", "« Votre problématique », et la punchline sur la photo"],
    ["offre", "le tableau « L’offre »"],
    ["deroule", "« Le déroulé »"],
    ["garanties", "« Ce que nous garantissons »"],
    ["cta", "la bande orange de milieu de page"],
    ["preuves", "« Nos références », et la frise de logos"],
    ["objections", "« Questions fréquentes »"],
    ["ctaFinal", "le titre de l’appel final"],
  ]) {
    if (!presentes.has(type)) manques.push(`${entree.url} : ${ou} reste vide`);
  }

  const contenu = { gabarit, sections: entree.contenu.sections };
  const nom = `${entree.url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;

  if (!SIMULATION) {
    writeFileSync(
      join(SORTIE, nom),
      `${JSON.stringify({ url: entree.url, contenu }, null, 2)}\n`,
    );
  }
  ecrits += 1;
  lignes.push(
    `${entree.url.padEnd(48)} ${gabarit.padEnd(10)} ` +
      `${String(entree.contenu.sections.length).padStart(2)} sections  ${nom}`,
  );
}

for (const ligne of lignes) console.log(ligne);

const domaines = lignes.filter((l) => l.includes(" domaine ")).length;
console.log(
  `\n${ecrits} page(s) ${SIMULATION ? "à écrire" : "écrites"} dans supabase/import/gabarits-maquette/ : ` +
    `${domaines} au gabarit 09 Domaine, ${ecrits - domaines} au gabarit 05 Spécialité.`,
);
console.log(
  "dessin : maquette/gabarit-09-domaine.html et maquette/gabarit-05-specialite.html. " +
    "texte : supabase/import/corpus-analyse.json, recopié tel quel.",
);

if (manques.length > 0) {
  console.log(`\nCases de la maquette que le corpus n'alimente pas (${manques.length}) :`);
  for (const manque of manques) console.log(`  ${manque}`);
}

if (!SIMULATION) {
  console.log(
    "\nPose en base : node scripts/importe_rest.mjs --simulation, puis sans l'option.",
  );
}
