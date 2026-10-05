/**
 * Produit la donnée des 13 fiches MÉTIER au gabarit 07 de la maquette.
 *
 *   node scripts/produit-metier-maquette.mjs
 *   node scripts/produit-metier-maquette.mjs --simulation   # n'écrit rien
 *
 * CE QUE CE SCRIPT RÉPARE. Le portage précédent a tout lu dans
 * « Migen - Site final.dc.html », qui dessine une fiche métier en quatre
 * sections et 155 mots. Le projet contient ONZE fichiers de gabarits dédiés, et
 * c'est « Migen - Gabarit 07 Metier.dc.html » qui fait foi pour cette famille :
 * un sommaire collant, des sections NUMÉROTÉES, une section de questions à part,
 * un maillage en cartes, un panneau « Rejoindre Migen ». La donnée produite ici
 * porte cette forme-là. Le fichier est copié dans
 * `maquette/gabarit-07-metier.html` et RELU à chaque exécution.
 *
 * LA RÈGLE QU'IL APPLIQUE, et il n'en applique pas d'autre :
 *   le DESSIN vient de la maquette, le TEXTE vient du corpus, rien ne s'invente.
 *
 * D'OÙ VIENT CHAQUE CHOSE.
 *
 *   · Le DÉCOUPAGE est celui de la maquette, recopié depuis son propre
 *     analyseur : un `##` ouvre une section, une section nommée « Questions… »
 *     devient la foire aux questions, un item de liste en gras terminé par un
 *     point d'interrogation devient une question, et les liens internes du texte
 *     font le maillage de bas de page.
 *   · Le TEXTE vient de `supabase/import/editorial-analyse.json`, c'est-à-dire
 *     des fichiers Markdown rédigés du client
 *     (`../migen-refonte/seo/contenus/07-metiers/*.md`).
 *   · Le MOBILIER de la maquette — la pastille « Métier », le libellé du
 *     sommaire, les surtitres, le téléphone, le panneau de fin — n'est PAS dans
 *     la donnée : c'est du dessin, il vit dans `components/site/metier/`, et
 *     `scripts/verifie-metier-maquette.tsx` le relit dans le fichier de maquette.
 *
 * POURQUOI LE CORPUS ET NON LA BASE. Les 13 pages sont TRONQUÉES en base, de 9
 * blocs sur 54 à 40 sur 76, par un import SQL interrompu sur un point-virgule
 * (voir CLAUDE.md section 15). `editorial-analyse.json` est la sortie complète
 * des analyseurs, et ce script VÉRIFIE cette complétude contre le Markdown
 * d'origine avant d'écrire : une page dont le compte de `##` ne retombe pas est
 * ÉCARTÉE et signalée, jamais écrite à moitié.
 *
 * CE QUI N'EST PAS CONSOMMÉ. Rien. Le gabarit 07 rend TOUT le corpus : ses
 * sections sont celles du texte rédigé, pas un cadre commercial dans lequel il
 * faudrait le faire entrer. C'est la différence de fond avec le portage
 * précédent, qui n'en prenait que trois listes et renvoyait le reste plus bas.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");
const MAQUETTE = join(RACINE, "maquette", "gabarit-07-metier.html");
const CORPUS = join(RACINE, "supabase", "import", "editorial-analyse.json");
const MARKDOWN = join(RACINE, "..", "migen-refonte", "seo", "contenus", "07-metiers");
const SIMULATION = process.argv.includes("--simulation");

/* ------------------------------------------- 1. ce que la maquette dit vraiment

   On n'écrit ici que la CLÉ de recherche ; la valeur attendue sort du fichier.
   Une note de lecture prise une fois peut se tromper, et personne ne peut la
   rejouer. */

const maquette = readFileSync(MAQUETTE, "utf8");

/** Le téléphone de l'agence, tel que la maquette l'écrit. */
export const TELEPHONE = (() => {
  const trouve = maquette.match(/tel:\+33(\d{9})/);
  if (!trouve) throw new Error("maquette : aucun numéro de téléphone");
  // « 478337205 » devient « 04 78 33 72 05 », la forme que la maquette affiche.
  const affiche = `0${trouve[1]}`.replace(/(\d\d)(?=\d)/g, "$1 ");
  if (!maquette.includes(affiche)) {
    throw new Error(`maquette : « ${affiche} » introuvable dans le texte`);
  }
  return affiche;
})();

/**
 * Les natures de page du maillage, RELUES dans le `kindOf` de la maquette.
 *
 * La maquette les déduit du chemin par une cascade de tests. On relit cette
 * cascade dans son script plutôt que de la recopier : si elle ajoute une
 * rubrique, la donnée la suit sans qu'on y touche.
 */
export const NATURES = (() => {
  const debut = maquette.indexOf("function kindOf(");
  if (debut < 0) throw new Error("maquette : kindOf() introuvable");
  const corps = maquette.slice(debut, maquette.indexOf("\n", debut));
  const paires = [...corps.matchAll(/\/\^(\\\/[^/]*?)\\\/\/\.test\(u\)\s*\?\s*"([^"]+)"/g)].map(
    ([, motif, nature]) => [`${motif.replace(/\\\//g, "/")}/`, nature],
  );
  const defaut = corps.match(/:\s*"([^"]+)";\s*\}/);
  if (paires.length === 0 || !defaut) {
    throw new Error("maquette : la cascade de kindOf() n'a pas été relue");
  }
  return { paires, defaut: defaut[1] };
})();

export function nature(url) {
  for (const [prefixe, nom] of NATURES.paires) if (url.startsWith(prefixe)) return nom;
  return NATURES.defaut;
}

/**
 * Le filtre de disponibilité de la maquette, relu dans `__c247`.
 *
 * La maquette retire « 24/24 » et « 7/7 » du texte avant de le rendre : ce sont
 * des promesses de délai, que le contrat du projet interdit. On applique le même
 * retrait, et le contrôle vérifie qu'il n'en reste rien.
 */
export function sansDisponibilite(texte) {
  return texte
    .replace(/,\s*24\/24 et 7\/7\s*,/g, ",")
    .replace(/\s*24\s*\/\s*24(?:\s*(?:et|·|,)\s*7\s*\/\s*7)?/g, "")
    .replace(/\s*24\s*h\s*\/\s*24(?:\s*(?:et|,)?\s*7\s*j?\s*\/\s*7)?/gi, "")
    .replace(/\s+7\s*jours\s*sur\s*7/gi, "")
    .replace(/\s+7\s*j\s*\/\s*7/gi, "")
    .replace(/\s+24\s*\/\s*7\b/g, "")
    .replace(/\s+7\s*\/\s*7\b/g, "");
}

/* ------------------------------------------------- 2. le découpage, recopié de
   l'analyseur de la maquette */

/**
 * `sentence()` de la maquette : un titre tout en capitales redescend en bas de
 * casse, les autres ne sont pas touchés.
 */
function casse(titre) {
  return titre === titre.toUpperCase()
    ? titre.charAt(0) + titre.slice(1).toLowerCase()
    : titre;
}

/** Tous les textes d'un bloc, DANS L'ORDRE DU DOCUMENT. Sert au maillage. */
function textesDu(bloc) {
  switch (bloc.type) {
    case "titre":
      return [bloc.texte];
    case "paragraphe":
    case "citation":
      return [bloc.accroche ?? "", bloc.texte];
    case "liste":
      return bloc.items.flatMap((item) => [item.accroche ?? "", item.texte]);
    case "tableau":
      return [...bloc.entetes, ...bloc.lignes.flat()];
    default:
      return [];
  }
}

/** Le bloc est-il une question ? La maquette tranche sur le gras + le « ? ». */
function question(bloc) {
  return (
    bloc.type === "paragraphe" && !!bloc.accroche && /\?\s*$/.test(bloc.accroche)
  );
}

/** La foire aux questions, telle que la maquette la monte. */
function faqDe(section) {
  const questions = [];
  const intro = [];
  for (const bloc of section.blocs) {
    if (question(bloc)) {
      questions.push({
        question: bloc.accroche,
        reponse: bloc.texte.trim() ? [{ type: "paragraphe", texte: bloc.texte }] : [],
      });
      continue;
    }
    // Une liste dont CHAQUE item est une question en gras : la maquette éclate
    // la liste en autant de questions.
    if (
      bloc.type === "liste" &&
      bloc.items.length > 0 &&
      bloc.items.every((item) => item.accroche && /\?\s*$/.test(item.accroche))
    ) {
      for (const item of bloc.items) {
        questions.push({
          question: item.accroche,
          reponse: item.texte.trim()
            ? [{ type: "paragraphe", texte: item.texte }]
            : [],
        });
      }
      continue;
    }
    if (questions.length > 0) questions[questions.length - 1].reponse.push(bloc);
    else intro.push(bloc);
  }
  const faq = { titre: casse(section.titre.replace(/\s*\(FAQ\)\s*$/, "")), questions };
  if (intro.length > 0) faq.intro = intro;
  return faq;
}

/** Le contenu d'une page, au gabarit 07. */
function contenuDe(entree) {
  const blocs = entree.contenu.blocs;

  // Découpage sur les titres de niveau 2, exactement comme la maquette.
  const ouverture = [];
  const sections = [];
  for (const bloc of blocs) {
    if (bloc.type === "titre" && bloc.niveau === 2) {
      sections.push({ titre: bloc.texte, blocs: [] });
      continue;
    }
    (sections.length > 0 ? sections[sections.length - 1].blocs : ouverture).push(bloc);
  }

  /* Le chapeau du héros : le chapeau du corpus, puis les paragraphes de
     l'ouverture. L'analyseur du corpus met la PREMIÈRE phrase rédigée dans
     `chapeau` et laisse les suivantes dans `blocs` ; la maquette, elle, prend
     tous les paragraphes d'avant le premier `##`. Sans le chapeau en tête, la
     page perdrait sa phrase d'attaque, celle qui est écrite pour accrocher. */
  const chapo = [
    ...(entree.contenu.chapeau ? [entree.contenu.chapeau] : []),
    ...ouverture.filter((b) => b.type === "paragraphe").map((b) => b.texte),
  ];
  const reste = ouverture.filter((b) => b.type !== "paragraphe");

  // La section « Questions… » sort du corps : elle a son propre dessin.
  const corps = [];
  let faq = null;
  for (const section of sections) {
    if (/^questions/i.test(section.titre)) faq = faqDe(section);
    else corps.push({ titre: casse(section.titre), blocs: section.blocs });
  }
  // Ce que l'ouverture portait sans être un paragraphe ouvre le corps, SANS
  // titre : la maquette la numérote mais ne la met pas au sommaire.
  if (reste.length > 0) corps.unshift({ blocs: reste });

  const numerotees = corps.map((section, i) => ({
    ...(section.titre ? { titre: section.titre } : {}),
    id: `s${i + 1}`,
    numero: String(i + 1).padStart(2, "0"),
    blocs: section.blocs,
  }));

  /* Le maillage : tous les liens internes du texte, dans l'ordre du document,
     sans doublon, et sans `/contact/` que les deux boutons visent déjà. */
  const vus = new Set();
  const liens = [];
  for (const texte of [entree.contenu.chapeau ?? "", ...blocs.flatMap(textesDu)]) {
    for (const [, libelle, url] of texte.matchAll(/\[([^\]]+)\]\((\/[^)]*)\)/g)) {
      if (vus.has(url) || url.startsWith("/contact/")) continue;
      vus.add(url);
      liens.push({
        libelle: libelle.charAt(0).toUpperCase() + libelle.slice(1),
        url,
        nature: nature(url),
      });
    }
  }

  const contenu = { gabarit: "metier" };
  if (chapo.length > 0) contenu.chapo = chapo;
  if (numerotees.length > 0) contenu.corps = numerotees;
  if (faq && faq.questions.length > 0) contenu.faq = faq;
  if (liens.length > 0) contenu.liens = liens;
  return contenu;
}

/* --------------------------------- 3. la complétude, mesurée contre le Markdown */

/** Les fichiers Markdown du rayon, par URL déclarée dans leur en-tête. */
function markdownParUrl() {
  const par = new Map();
  for (const nom of readdirSync(MARKDOWN)) {
    if (!nom.endsWith(".md")) continue;
    const texte = readFileSync(join(MARKDOWN, nom), "utf8");
    const trouve = texte.match(/^url:\s*"?([^"\n]+)"?\s*$/m);
    if (!trouve) continue;
    const url = trouve[1].endsWith("/") ? trouve[1] : `${trouve[1]}/`;
    par.set(url, { nom, texte });
  }
  return par;
}

/**
 * Le corpus analysé porte-t-il TOUT le Markdown ?
 *
 * On compte les titres des deux niveaux de part et d'autre. C'est la mesure qui
 * manquait quand 43 pages sont parties en base à moitié écrites : personne ne
 * comparait la sortie de l'analyseur à son entrée.
 */
function complete(entree, md) {
  const attendus = {
    h2: (md.texte.match(/^## /gm) ?? []).length,
    h3: (md.texte.match(/^### /gm) ?? []).length,
  };
  const obtenus = { h2: 0, h3: 0 };
  for (const bloc of entree.contenu.blocs) {
    if (bloc.type !== "titre") continue;
    if (bloc.niveau === 2) obtenus.h2 += 1;
    if (bloc.niveau === 3) obtenus.h3 += 1;
  }
  if (attendus.h2 === obtenus.h2 && attendus.h3 === obtenus.h3) return null;
  return (
    `titres manquants : ${obtenus.h2}/${attendus.h2} de niveau 2, ` +
    `${obtenus.h3}/${attendus.h3} de niveau 3`
  );
}

/* ----------------------------------------------------------------- 4. écriture */

/** `/carriere/technicien-de-maintenance/salaire/` → `carriere-…-salaire.json`. */
function nomFichier(url) {
  return `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;
}

const corpus = JSON.parse(readFileSync(CORPUS, "utf8"));
const mds = markdownParUrl();

const fiches = corpus.filter(
  (e) =>
    e.url.startsWith("/carriere/") &&
    e.url !== "/carriere/" &&
    Array.isArray(e.contenu?.blocs),
);

const ecrites = [];
const ecartees = [];
const retires = [];

for (const entree of fiches) {
  const md = mds.get(entree.url);
  if (!md) {
    ecartees.push([entree.url, "aucun Markdown d'origine pour mesurer la complétude"]);
    continue;
  }
  const manque = complete(entree, md);
  if (manque) {
    ecartees.push([entree.url, manque]);
    continue;
  }

  // Le filtre de disponibilité de la maquette, appliqué à tout le texte.
  const brut = JSON.stringify({ h1: entree.h1, contenu: entree.contenu });
  const propre = sansDisponibilite(brut);
  if (propre !== brut) retires.push(entree.url);
  const propreEntree = JSON.parse(propre);

  const fichier = {
    url: entree.url,
    h1: propreEntree.h1,
    mot_cle: entree.mot_cle ?? null,
    contenu: contenuDe({ ...entree, contenu: propreEntree.contenu }),
  };

  const chemin = join(SORTIE, nomFichier(entree.url));
  if (!SIMULATION) {
    writeFileSync(chemin, `${JSON.stringify(fichier, null, 2)}\n`, "utf8");
  }
  ecrites.push([
    entree.url,
    (fichier.contenu.corps ?? []).length,
    fichier.contenu.faq?.questions.length ?? 0,
    (fichier.contenu.liens ?? []).length,
    entree.contenu.blocs.length,
  ]);
}

console.log(
  `${SIMULATION ? "SIMULATION — " : ""}${ecrites.length} fiche(s) au gabarit 07\n`,
);
console.log("  page".padEnd(52), "sections  questions  liens  blocs du corpus");
for (const [url, nSec, nQ, nL, nB] of ecrites) {
  console.log(
    `  ${url.padEnd(50)} ${String(nSec).padStart(8)} ${String(nQ).padStart(10)} ` +
      `${String(nL).padStart(6)} ${String(nB).padStart(16)}`,
  );
}
if (retires.length > 0) {
  console.log(
    `\n  « 24/24 » ou « 7/7 » retirés, comme le fait la maquette : ${retires.join(", ")}`,
  );
}
if (ecartees.length > 0) {
  console.log(`\n${ecartees.length} page(s) ÉCARTÉE(S), corpus incomplet :`);
  for (const [url, pourquoi] of ecartees) console.log(`  ${url.padEnd(50)} ${pourquoi}`);
}
if (ecrites.length === 0) process.exit(1);
