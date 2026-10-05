/**
 * Fabrique les fichiers de contenu du gabarit IMPLANTATION, villes et
 * départements.
 *
 *   node scripts/fabrique_gabarits_implantation.mjs
 *
 * Il LIT les quarante-deux pages filles de `/implantations/` dans Supabase, par
 * l'API REST et la clé ANONYME, puis ÉCRIT un fichier JSON par page dans
 * `supabase/import/gabarits-maquette/`. Il n'écrit rien en base : c'est
 * `scripts/importe_rest.mjs` qui pose ces fichiers, et lui seul.
 *
 * LE FICHIER QUI FAIT FOI : « Migen - Gabarit 04 Ville.dc.html » pour les
 * villes, « Migen - Gabarit 06 Departement.dc.html » pour les départements.
 * Les deux sont le même document, douze sections, même parseur. La
 * correspondance ci-dessous est celle de leur fonction `parse()`, l. 333 à 412,
 * relue ligne à ligne.
 *
 * CE QUI A ÉTÉ CORRIGÉ. La version précédente de ce script mappait vers les
 * blocs `isVille` (cinq sections) et `isDept` (trois sections) de
 * « Migen - Site final », un APERÇU du site et non les gabarits. Elle poussait
 * donc sept sections du corpus sur dix dans un champ `reste`, rendu par les
 * blocs de vente. Le corpus de ces 42 pages est écrit POUR les douze sections
 * du gabarit, section par section : la correspondance est maintenant une à une
 * et `reste` est vide.
 *
 * POURQUOI UN SCRIPT PLUTÔT QUE QUARANTE-DEUX FICHIERS ÉCRITS À LA MAIN. La
 * correspondance corpus vers maquette est une RÈGLE, pas quarante-deux
 * décisions. Écrite ici, elle se relit d'un coup, se rejoue quand le corpus
 * bouge, et aucun champ ne se perd par distraction sur la page 37. Les fichiers
 * produits sont versionnés : ils restent la source de l'import.
 *
 * LECTURE SEULE, CLÉ ANONYME. Les quarante-deux pages sont `published`, et la
 * sécurité au niveau des lignes autorise le public à lire le contenu publié.
 * Aucun besoin de `SUPABASE_SERVICE_ROLE_KEY` ici, donc aucune raison de la
 * demander.
 *
 * AUCUNE DONNÉE N'EST INVENTÉE. Chaque valeur écrite vient d'un champ du corpus
 * ou de la hiérarchie en base. Une section que la maquette dessine et que le
 * corpus ne remplit pas est laissée ABSENTE : le gabarit ne la rend alors pas
 * du tout. Les libellés de structure et toute la réassurance vivent dans le
 * composant, relevés dans le fichier de maquette.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/** L'ancre du formulaire de la page. Même valeur que `blocs/habillage.ts`. */
const ANCRE = "#formulaire";

/**
 * Les huit pages dont le SUJET est un territoire administratif, et non une
 * ville.
 *
 * LE DESSIN NE CHANGE PAS entre les deux : les fichiers de gabarit 04 et 06
 * sont identiques. Le discriminant sert au fil d'Ariane et au maillage, et il
 * reste déclaré ici parce que rien d'autre ne le dit : au niveau 3, sous les
 * mêmes agences, cohabitent huit villes et huit départements.
 * `toulouse/gironde/` et `toulouse/bordeaux/` ont le même parent et le même
 * niveau. Le seul juge est le SUJET que le corpus se donne, et il l'écrit dans
 * son propre H1, cité ici en regard de chaque entrée. Une expression régulière
 * sur ce H1 se tromperait : `paris/` écrit « Maintenir vos machines DANS LE
 * tissu le plus dense de France » et serait pris pour un département.
 *
 * Le script VÉRIFIE que cette liste correspond exactement aux pages trouvées en
 * base, et s'arrête si la hiérarchie a bougé.
 */
const DEPARTEMENTS = new Map([
  ["/implantations/lyon/haute-savoie/", "en Haute-Savoie, de l'Arve au Genevois"],
  ["/implantations/lyon/rhone/", "dans le Rhône, du Beaujolais à Feyzin"],
  ["/implantations/nantes/loire-atlantique/", "en Loire-Atlantique"],
  ["/implantations/paris/essonne/", "en Essonne"],
  ["/implantations/strasbourg/alsace/", "en Alsace, du Bas-Rhin au Haut-Rhin"],
  ["/implantations/toulouse/charente/", "en Charente"],
  ["/implantations/toulouse/gironde/", "en Gironde"],
  ["/implantations/toulouse/haute-garonne/", "en Haute-Garonne"],
]);

/* --------------------------------------------- l'interdit que la maquette pose */

/**
 * `__c247`, l. 290 à 302 du fichier de maquette, recopiée.
 *
 * La maquette passe TOUT le texte du corpus dans cette fonction avant de le
 * parser : elle retire « 24/24 », « 7/7 » et leurs variantes. Ce n'est pas une
 * coquetterie de rendu, c'est un interdit de copie que le gabarit applique
 * lui-même, et il porte sur 218 occurrences réparties sur les 42 pages.
 *
 *   avant : « Astreinte 24/24 et 7/7 en option, nuits, week-ends et jours fériés. »
 *   après : « Astreinte en option, nuits, week-ends et jours fériés. »
 *
 * Elle est appliquée ici, à la fabrication, et non au rendu : le texte posé en
 * base est alors celui que la maquette montre, et aucun autre consommateur du
 * contenu ne peut le ressortir sans le nettoyage.
 */
function sansDisponibilite(texte) {
  return texte
    .replace(
      /^[-*] \*\*(?:24\s*\/\s*24(?:\s*et\s*7\s*\/\s*7)?|24\s*\/\s*7|7\s*j\s*\/\s*7|7\s*\/\s*7)\*\*.*$\n?/gm,
      "",
    )
    .replace(/,\s*24\/24 et 7\/7\s*,/g, ",")
    .replace(/\s*24\s*\/\s*24(?:\s*(?:et|·|,)\s*7\s*\/\s*7)?/g, "")
    .replace(/\s*24\s*h\s*\/\s*24(?:\s*(?:et|,)?\s*7\s*j?\s*\/\s*7)?/gi, "")
    .replace(/\s+7\s*jours\s*sur\s*7/gi, "")
    .replace(/\s+7\s*j\s*\/\s*7/gi, "")
    .replace(/\s+24\s*\/\s*7\b/g, "")
    .replace(/\s+7\s*\/\s*7\b/g, "");
}

/** Le même nettoyage, appliqué à toutes les chaînes d'une structure. */
function nettoie(valeur) {
  if (typeof valeur === "string") return sansDisponibilite(valeur);
  if (Array.isArray(valeur)) return valeur.map(nettoie);
  if (valeur && typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, v]) => [cle, nettoie(v)]),
    );
  }
  return valeur;
}

/* ------------------------------------------------------------------ la lecture */

function environnement() {
  const valeurs = {};
  for (const ligne of readFileSync(join(RACINE, ".env.local"), "utf8").split("\n")) {
    const trouve = ligne.match(/^([A-Z_]+)=(.*)$/);
    if (trouve) valeurs[trouve[1]] = trouve[2].trim().replace(/^["']|["']$/g, "");
  }
  return valeurs;
}

const env = environnement();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_BASE || !CLE) {
  console.error(
    "  NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY absente de .env.local.\n" +
      "  Ce script ne fait que LIRE le contenu publié : la clé anonyme suffit.",
  );
  process.exit(1);
}

const reponse = await fetch(
  `${URL_BASE}/rest/v1/pages` +
    `?select=path,niveau,titre_h1,contenu&path=like./implantations/*` +
    `&statut=eq.published&order=path.asc`,
  { headers: { apikey: CLE, Authorization: `Bearer ${CLE}` } },
);

if (!reponse.ok) {
  console.error(`  lecture refusée : ${reponse.status} ${await reponse.text()}`);
  process.exit(1);
}

/* La page hub `/implantations/` porte son propre gabarit, `implantations`, et
   n'est pas de ce chantier : seules ses filles le sont. */
const pages = (await reponse.json()).filter((p) => p.path !== "/implantations/");

if (pages.length === 0) {
  console.error("  aucune page fille de /implantations/ trouvée en base");
  process.exit(1);
}

/* Le nettoyage de la maquette s'applique AVANT toute lecture du corpus : la
   suite travaille donc sur le texte tel que le gabarit le montre. */
for (const page of pages) page.contenu = nettoie(page.contenu);

/* ---------------------------------------------------- les garde-fous de cohérence */

const inconnus = [...DEPARTEMENTS.keys()].filter(
  (chemin) => !pages.some((p) => p.path === chemin),
);
if (inconnus.length > 0) {
  console.error(
    "  la liste des départements cite des pages absentes de la base :\n" +
      inconnus.map((c) => `    ${c}`).join("\n") +
      "\n  la hiérarchie a bougé : relisez-la avant de produire quoi que ce soit.",
  );
  process.exit(1);
}

const estDept = (chemin) => DEPARTEMENTS.has(chemin);

/* ------------------------------------------------------------ la correspondance */

/** Une section du corpus, par son type. */
function section(page, type) {
  return (page.contenu?.sections ?? []).find((s) => s.type === type) ?? null;
}

/** `undefined` plutôt qu'un tableau vide : un champ absent ne se rend pas. */
const siRempli = (tableau) =>
  Array.isArray(tableau) && tableau.length > 0 ? tableau : undefined;

/** `sentences()` de la maquette, l. 332. */
const phrases = (texte) => (texte || "").split(/(?<=[.?!])\s+/).filter(Boolean);

/** Une chaîne sans son balisage Markdown, pour comparer des textes entre eux. */
const debalise = (t) =>
  t
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Les liens internes écrits dans le corpus, dédoublonnés, dans leur ordre.
 *
 * C'est la section « Pour aller plus loin » de la maquette, l. 390 à 399 : elle
 * fait une carte par lien interne trouvé dans le texte, garde le premier
 * passage de chaque cible et écarte `/preuves/`, dont les cartes sont déjà la
 * section 08. Le libellé prend sa capitale d'attaque, et le `contexte` est la
 * phrase du corpus où le lien a été écrit.
 *
 * UNE SEULE DIFFÉRENCE AVEC LA MAQUETTE, et elle est voulue : la maquette
 * RETIRE le lien du texte (`unlink`) parce que son tableau Markdown ne rend que
 * du texte plat. Ici le lien reste DANS la phrase, où `blocs/TexteRiche.tsx` le
 * rend : près de six cents liens de ce genre font le maillage interne du
 * cocon, et c'est la raison d'être de l'arborescence. Le dessin de la maquette
 * est respecté, le texte du corpus n'est pas amputé.
 */
function liensDuCorpus(page) {
  const vus = new Set();
  const cartes = [];

  const parcourt = (valeur) => {
    if (typeof valeur === "string") {
      for (const phrase of phrases(valeur)) {
        for (const m of phrase.matchAll(/\[([^\]]+)\]\((\/[^)\s]*)\)/g)) {
          const [, libelle, href] = m;
          if (href.startsWith("/preuves/") || vus.has(href)) continue;
          vus.add(href);
          cartes.push({
            libelle: libelle.charAt(0).toUpperCase() + libelle.slice(1),
            href,
            // La phrase sans son balisage : c'est du texte du corpus, pas une
            // description écrite pour l'occasion.
            contexte: debalise(phrase),
          });
        }
      }
      return;
    }
    if (Array.isArray(valeur)) {
      for (const v of valeur) parcourt(v);
      return;
    }
    if (valeur && typeof valeur === "object") {
      for (const [cle, v] of Object.entries(valeur)) {
        // `lienHref` est une cible, pas du texte : la section 08 la rend déjà.
        if (cle === "lienHref") continue;
        parcourt(v);
      }
    }
  };

  parcourt(page.contenu?.sections ?? []);

  /* UN CONTEXTE PARTAGÉ NE DIT RIEN. Huit liens d'expertise sont écrits dans la
     même énumération : la phrase se retrouverait sous huit cartes à l'identique
     et ne distinguerait aucune des huit. Elle est alors retirée des cartes
     concernées, et la carte se rend avec son titre et son chemin. Le texte,
     lui, n'est pas perdu : il reste dans le corps de la page, où il est rendu
     avec ses liens. */
  const combien = new Map();
  for (const c of cartes) combien.set(c.contexte, (combien.get(c.contexte) ?? 0) + 1);
  return cartes.map(({ libelle, href, contexte }) =>
    combien.get(contexte) === 1 ? { libelle, href, contexte } : { libelle, href },
  );
}

/** Un appel à l'action du corpus, tel que les sections 07 et 10 le prennent. */
function appel(brut) {
  if (!brut?.question || !brut?.bouton) return undefined;
  return {
    question: brut.question,
    bouton: brut.bouton,
    ...(brut.rappel ? { rappel: brut.rappel } : {}),
  };
}

/**
 * Le contenu d'une page, pour les DOUZE sections du gabarit.
 *
 *   heros.mecanisme      -> 01, le chapeau sous le H1
 *   heros.cta            -> 01, le bouton orange (et celui de la section 07)
 *   heros.telephone      -> 01, 07, 09 et 10, les quatre boutons d'appel
 *   heros.phraseDelai    -> 01, la ligne à point orange sous le filet
 *   chiffres.chiffres    -> 01, le panneau « En bref »
 *   preuves.preuves      -> 08, les cartes ; et 02, les noms du bandeau
 *   probleme.punchline   -> 03, le H2 (1re phrase) puis le paragraphe
 *   probleme.puces       -> 03, les cartes en verre de droite
 *   offre.lignes         -> 04, les rangées du tableau
 *   offre.prose          -> 04, le pavé de notes sous le tableau
 *   deroule.etapes       -> 05, la frise numérotée
 *   garanties.puces      -> 06, les colonnes à filet orange du panneau sombre
 *   cta                  -> 07, le bandeau orange clair
 *   objections.questions -> 09, les cartes de questions
 *   liens du texte       -> Maillage, « Pour aller plus loin »
 *   ctaFinal             -> 10, le panneau sombre final
 *
 * `heros.h1` n'y est pas : il devient le `titre_h1` de la ligne `pages`, et
 * aurait fait un second H1 dans le contenu.
 *
 * LA PHOTO (02, 05, 08, Maillage) et LA RÉASSURANCE n'ont pas de source dans
 * le corpus : la première reste absente, la seconde est écrite par la maquette
 * et vit dans le composant.
 */
function contenuImplantation(page) {
  const heros = section(page, "heros");
  const chiffres = section(page, "chiffres");
  const probleme = section(page, "probleme");
  const offre = section(page, "offre");
  const deroule = section(page, "deroule");
  const garanties = section(page, "garanties");
  const cta = section(page, "cta");
  const preuves = section(page, "preuves");
  const objections = section(page, "objections");
  const ctaFinal = section(page, "ctaFinal");

  const punchline = phrases(probleme?.punchline);

  /* Les noms du bandeau défilant, l. 406 de la maquette : ce sont les clients
     des références de la page, et rien d'autre. Un libellé qui ne suit pas le
     motif « Étude de cas NOM : … » ne produit pas de nom. */
  const logos = [
    ...new Set(
      (preuves?.preuves ?? [])
        .map((p) =>
          (p.lienLibelle ?? "").replace(/^Étude de cas\s*/, "").split(" : ")[0].trim(),
        )
        .filter(Boolean),
    ),
  ];

  /* Les sections du corpus que les douze n'accueillent pas. Vide aujourd'hui :
     le contrôle de complétude ci-dessous le prouve page par page. */
  const reste = [];

  return {
    gabarit: estDept(page.path) ? "departement" : "ville",

    chapeau: heros?.mecanisme || undefined,
    action: heros?.cta ? { libelle: heros.cta, href: ANCRE } : undefined,
    telephone: heros?.telephone || undefined,
    delai: heros?.phraseDelai || undefined,
    reperes: siRempli(
      (chiffres?.chiffres ?? []).map(({ valeur, libelle, detail }) => ({
        valeur,
        libelle,
        ...(detail ? { detail } : {}),
      })),
    ),

    logos: siRempli(logos),

    problemeTitre: punchline[0] || undefined,
    problemeTexte: punchline.slice(1).join(" ") || undefined,
    problemes: siRempli(probleme?.puces),

    offre: siRempli(offre?.lignes),
    offreNotes: siRempli((offre?.prose ?? []).map((p) => p.texte).filter(Boolean)),

    etapes: siRempli(deroule?.etapes),
    garanties: siRempli(garanties?.puces),
    appel: appel(cta),
    preuves: siRempli(preuves?.preuves),
    questions: siRempli(objections?.questions),
    liens: siRempli(liensDuCorpus(page)),
    appelFinal: appel(ctaFinal),

    reste: siRempli(reste),
  };
}

/* ------------------------------------------------------ le contrôle de complétude */

/** Toutes les chaînes d'un objet, à plat, quelle que soit la profondeur. */
function chaines(valeur, recues = []) {
  if (typeof valeur === "string") {
    const propre = valeur.trim();
    if (propre) recues.push(propre);
  } else if (Array.isArray(valeur)) {
    for (const v of valeur) chaines(v, recues);
  } else if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) {
      /* `type` et `gabarit` sont des DISCRIMINANTS, pas de la copie : ils ne
         sont jamais affichés. Une section consommée dans un champ nommé perd
         son étiquette de type, et c'est normal. */
      if (cle === "type" || cle === "gabarit") continue;
      chaines(v, recues);
    }
  }
  return recues;
}

/**
 * Le gabarit produit porte-t-il TOUT le texte du corpus ?
 *
 * C'est le contrôle qui compte le plus ici. Le corpus de ces quarante-deux
 * pages est rédigé, relu et payé, et c'est la substance du référencement : une
 * correspondance qui perd une section en silence est pire que pas de
 * correspondance du tout, parce que personne ne la verra passer. Le contrôle
 * compare donc les CHAÎNES, pas les champs : peu importe dans quelle case le
 * texte a atterri, il doit y être.
 *
 * UN SEUL CHAMP EST ATTENDU COMME ABSENT, et il est déclaré, pas toléré :
 * `heros.h1`, qui devient le `titre_h1` de la ligne `pages` et n'a donc rien à
 * faire dans le `contenu`, où il ferait un second H1.
 *
 * La punchline arrive COUPÉE EN DEUX, H2 puis paragraphe : le contrôle regarde
 * donc aussi, phrase par phrase, si le texte se retrouve quelque part dans le
 * produit. Cela laisse passer une coupure, jamais une perte.
 */
function completude(page, contenu) {
  const heros = section(page, "heros") ?? {};
  const attendusAbsents = new Set([heros.h1].filter(Boolean));

  const produites = new Set(chaines(contenu));
  const produitesDebalisees = chaines(contenu).map(debalise);
  const toutProduit = produitesDebalisees.join(" | ");

  return chaines(page.contenu?.sections ?? []).filter((texte) => {
    if (produites.has(texte) || attendusAbsents.has(texte)) return false;
    const propre = debalise(texte);
    if (produitesDebalisees.includes(propre)) return false;
    return !phrases(propre).every((p) => toutProduit.includes(debalise(p)));
  });
}

/* ----------------------------------------------------------------- l'écriture */

mkdirSync(SORTIE, { recursive: true });

/** `/implantations/toulouse/gironde/` -> `implantations-toulouse-gironde.json` */
const aplati = (chemin) => `${chemin.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;

let villes = 0;
let depts = 0;
const perdus = [];

for (const page of pages) {
  const contenu = contenuImplantation(page);

  /* Les clés `undefined` disparaissent de la sérialisation JSON : un champ que
     le corpus ne remplit pas n'arrive donc jamais en base, et le gabarit ne
     rend pas sa section. C'est la règle « vide plutôt que faux », appliquée par
     le format lui-même plutôt que par une vigilance. */
  /* La clé est `url`, et non `path` : c'est ce que lit `scripts/importe_rest.mjs`,
     comme pour `corpus-analyse.json` et ses voisins. Il IGNORE EN SILENCE un
     fichier qui ne la porte pas, ce qui aurait sauté les quarante-deux pages
     sans un mot. */
  writeFileSync(
    join(SORTIE, aplati(page.path)),
    `${JSON.stringify({ url: page.path, contenu }, null, 2)}\n`,
  );

  const perdues = completude(page, contenu);
  if (perdues.length > 0) perdus.push({ chemin: page.path, textes: perdues });

  if (estDept(page.path)) depts += 1;
  else villes += 1;
  console.log(
    `${page.path.padEnd(58)} ${estDept(page.path) ? "departement" : "ville"}`,
  );
}

console.log(
  `\n${villes + depts} fichiers écrits dans supabase/import/gabarits-maquette/ : ` +
    `${villes} villes, ${depts} départements.`,
);
if (perdus.length > 0) {
  console.error(
    `\n${perdus.length} page(s) PERDENT du texte du corpus. Rien ne doit se perdre :\n`,
  );
  for (const { chemin, textes } of perdus) {
    console.error(`  ${chemin}`);
    for (const texte of textes) console.error(`    « ${texte.slice(0, 120)} »`);
  }
  process.exit(1);
}

console.log("Aucun texte du corpus perdu : les 42 pages sont complètes.");
console.log("Pour les poser en base : node scripts/importe_rest.mjs --simulation");
