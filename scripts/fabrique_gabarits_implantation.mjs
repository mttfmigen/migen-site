/**
 * Fabrique les fichiers de contenu des gabarits VILLE et DÉPARTEMENT.
 *
 *   node scripts/fabrique_gabarits_implantation.mjs
 *
 * Il LIT les quarante-deux pages filles de `/implantations/` dans Supabase, par
 * l'API REST et la clé ANONYME, puis ÉCRIT un fichier JSON par page dans
 * `supabase/import/gabarits-maquette/`. Il n'écrit rien en base : c'est
 * `scripts/importe_rest.mjs` qui pose ces fichiers, et lui seul.
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
 * du tout. Les libellés de structure de la maquette vivent dans les composants,
 * sauf ceux que `ContenuSecteur` expose en données, repris ici de la maquette
 * avec leur ligne.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");

/** L'ancre du formulaire de la page. Même valeur que `blocs/habillage.ts`. */
const ANCRE = "#formulaire";

/**
 * « Les autres départements », surtitre relevé ligne 6407 de la maquette.
 *
 * Il est en données et non dans le composant parce que `ContenuSecteur`
 * l'expose ainsi : le même gabarit sert les secteurs, où il vaut « Les autres
 * secteurs ». Le surtitre des villes, lui, est dans `PageVille.tsx`.
 */
const SURTITRE_AUTRES_DEPTS = "Les autres départements";

/**
 * Les huit pages dont le SUJET est un territoire administratif, et non une
 * ville. Elles reçoivent le gabarit `isDept`, trois sections ; toutes les
 * autres reçoivent `isVille`, cinq sections.
 *
 * POURQUOI UNE LISTE DÉCLARÉE ET NON UNE RÈGLE SUR LE CHEMIN. Le niveau et le
 * parent ne séparent PAS ces pages : au niveau 3, sous les mêmes agences,
 * cohabitent huit villes et huit départements. `toulouse/gironde/` et
 * `toulouse/bordeaux/` ont le même parent et le même niveau. Le seul juge est
 * donc le SUJET que le corpus se donne, et il l'écrit dans son propre H1, cité
 * ici en regard de chaque entrée. Une expression régulière sur ce H1 se
 * tromperait : `paris/` écrit « Maintenir vos machines DANS LE tissu le plus
 * dense de France » et serait pris pour un département.
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

/**
 * Les six agences, seules pages de niveau 2 à porter des enfants.
 *
 * Elles servent, avec les villes de niveau 3, à composer les pastilles
 * « Autres villes » : c'est ce que fait la maquette, dont les neuf pastilles
 * (ligne 4065) sont toutes des villes d'agence ou des villes de niveau 3, et
 * aucune des vingt pages « maintenance-industrielle-… ».
 */
const AGENCES = new Set([
  "/implantations/lille/",
  "/implantations/lyon/",
  "/implantations/nantes/",
  "/implantations/paris/",
  "/implantations/strasbourg/",
  "/implantations/toulouse/",
]);

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

/** Les villes qui composent les pastilles « Autres villes ». */
const VILLES_PASTILLES = pages
  .filter((p) => !estDept(p.path) && (AGENCES.has(p.path) || p.niveau === 3))
  .map((p) => p.path);

/* ------------------------------------------------------------ la correspondance */

/** Une section du corpus, par son type. */
function section(page, type) {
  return (page.contenu?.sections ?? []).find((s) => s.type === type) ?? null;
}

/**
 * Le libellé d'une page, pour une pastille.
 *
 * Le H1 complet est une phrase (« La maintenance industrielle à Lyon, depuis
 * notre siège ») : la maquette met un nom court dans ses pastilles. Le nom est
 * pris dans le MOT CLÉ de la page, que le corpus écrit, en retirant le service
 * qui s'y répète. Rien n'est inventé : la casse d'origine est celle du H1,
 * cherchée dedans, et à défaut le mot clé sert tel quel.
 */
function libellePastille(page) {
  const cle = (page.mot_cle_principal ?? "").replace(/^maintenance industrielle\s*/i, "").trim();
  if (!cle) return null;
  // Le H1 porte la bonne casse et les bons accents : « Saint-Étienne », pas
  // « saint etienne ». On y cherche le mot clé, tiret ou espace indifférents.
  const motif = new RegExp(
    cle.split(/[\s-]+/).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s-]+"),
    "i",
  );
  const trouve = (page.titre_h1 ?? "").match(motif);
  return trouve ? trouve[0] : cle;
}

/** Les pastilles vers les autres pages d'un ensemble, la page courante exclue. */
function pastilles(courante, ensemble, parChemin) {
  return ensemble
    .filter((chemin) => chemin !== courante.path)
    .map((chemin) => {
      const libelle = libellePastille(parChemin.get(chemin));
      return libelle ? { libelle, href: chemin } : null;
    })
    .filter(Boolean);
}

/** `undefined` plutôt qu'un tableau vide : un champ absent ne se rend pas. */
const siRempli = (tableau) =>
  Array.isArray(tableau) && tableau.length > 0 ? tableau : undefined;

/**
 * Gabarit VILLE, cinq sections (maquette 3962 à 4076).
 *
 *   heros.mecanisme     → le chapeau du hero
 *   heros.cta           → le bouton orange du hero
 *   heros.phraseDelai   → le contact, sous le filet du panneau
 *   chiffres.chiffres   → les repères du panneau en verre
 *   probleme.punchline  → le paragraphe de « Le constat terrain »
 *   probleme.puces      → la liste à croix de la même colonne
 *   offre.prose[0]      → le paragraphe de « Notre réponse »
 *   garanties.puces     → la liste à coches de la même colonne
 *   objections          → « Questions fréquentes », en cartes
 *   hiérarchie          → « Autres villes », en pastilles
 *   le reste du corpus  → sous le vis-à-vis, par les blocs déjà portés
 */
function contenuVille(page, parChemin) {
  const heros = section(page, "heros");
  const chiffres = section(page, "chiffres");
  const probleme = section(page, "probleme");
  const offre = section(page, "offre");
  const garanties = section(page, "garanties");
  const objections = section(page, "objections");

  /* Ce que les cinq sections n'accueillent pas, dans l'ordre du corpus. `offre`
     y entre SANS sa prose, qui est passée dans « Notre réponse » : le même
     paragraphe deux fois sur une page, c'est un défaut visible et un doublon
     pour Google. */
  const reste = [];
  if (offre && ((offre.lignes ?? []).length > 0 || offre.tableau)) {
    /* `prose: undefined` disparaît de la sérialisation JSON, si bien que la clé
       n'arrive jamais en base et que `blocs/Offre.tsx`, qui teste
       `section.prose?.length`, ne rend rien à sa place. */
    reste.push({ ...offre, prose: undefined });
  }
  for (const type of ["deroule", "cta", "preuves", "ctaFinal"]) {
    const trouvee = section(page, type);
    if (trouvee) reste.push(trouvee);
  }

  return {
    gabarit: "ville",
    // surtitre : le corpus n'en fournit pas. La maquette y met « Rhône · Grand
    // Lyon ». Laissé ABSENT, pas deviné depuis le chemin.
    chapeau: heros?.mecanisme || undefined,
    actions: heros?.cta ? [{ libelle: heros.cta, href: ANCRE }] : undefined,
    // panneauSurtitre et adresse : absents du corpus. La maquette affiche
    // « Agence de Lyon » et une adresse postale ; une seule des quarante-deux
    // pages pourrait en porter une vraie, et ce serait celle du siège.
    /* Le `detail` est repris : quatre pages écrivent « Aucune en Isère, des
       techniciens qui s'y déplacent » sous leur chiffre « 4 agences ». Sans
       cette ligne, le chiffre laisse croire à une agence sur place. */
    reperes: siRempli(
      (chiffres?.chiffres ?? []).map(({ valeur, libelle, detail }) => ({
        valeur,
        libelle,
        ...(detail ? { detail } : {}),
      })),
    ),
    contact: heros?.phraseDelai || undefined,
    // constatTitre et reponseTitre : le corpus ne fournit pas de titre court
    // pour ces deux colonnes. Les surtitres, eux, sont dans le composant.
    constatTexte: probleme?.punchline || undefined,
    constatPuces: siRempli(probleme?.puces),
    reponseTexte: offre?.prose?.[0]?.texte || undefined,
    reponsePuces: siRempli(garanties?.puces),
    // faqTitre : `objections.titre` n'est fourni par aucune des 42 pages.
    faq: siRempli(objections?.questions),
    autres: siRempli(pastilles(page, VILLES_PASTILLES, parChemin)),
    reste: siRempli(reste),
  };
}

/**
 * Gabarit DÉPARTEMENT, trois sections (maquette 6365 à 6433).
 *
 *   heros.mecanisme     → le chapeau du hero
 *   heros.cta           → le bouton orange du hero
 *   chiffres.chiffres   → les repères du panneau en verre, où la maquette met
 *                         une carte d'agences par `x-import`, qui n'est pas du
 *                         HTML et ne se porte pas
 *   hiérarchie          → « Les autres départements », en pastilles
 *   ctaFinal            → le panneau d'appel final
 *   le reste du corpus  → sous le gabarit, par les blocs déjà portés
 *
 * `communes` reste ABSENT : la maquette liste dix communes couvertes, le corpus
 * n'en fournit la liste sur aucune page. Les déduire d'un paragraphe serait de
 * la donnée inventée, et la section ne se rend donc pas.
 *
 * `enjeux` n'est pas rempli non plus, et ce n'est pas un manque : `isDept` n'a
 * pas de section d'enjeux. C'est `isSecteur` qui en a une.
 *
 * `heros.phraseDelai` n'a pas de case dans ces trois sections, et le gabarit
 * n'en invente pas. Le téléphone, les horaires et le rappel dans l'heure
 * restent sur la page : les sections `cta` et `ctaFinal` les écrivent, et
 * elles sont rendues.
 */
function contenuDepartement(page, parChemin) {
  const heros = section(page, "heros");
  const chiffres = section(page, "chiffres");
  const ctaFinal = section(page, "ctaFinal");

  /* `RepereSecteur` ne porte pas de `detail`, et `PageSecteur` n'est pas
     modifié pour lui en ajouter un : ce composant appartient au gabarit
     secteur. Quand un chiffre en écrit un, la section `chiffres` ENTIÈRE part
     donc dans `reste`, où `blocs/ChiffresCles.tsx` rend valeur, libellé ET
     détail. Le panneau du hero reste alors vide, et `PageSecteur` fait passer
     le hero sur une colonne, cas qu'il traite et documente. Perdre la phrase
     « Aucune en Haute-Savoie, des techniciens qui s'y déplacent » pour garder
     un panneau serait l'inverse de ce que ce site défend. */
  const detaille = (chiffres?.chiffres ?? []).some((c) => c.detail);

  const reste = [];
  if (detaille && chiffres) reste.push(chiffres);
  for (const type of ["probleme", "offre", "deroule", "garanties", "cta", "preuves", "objections"]) {
    const trouvee = section(page, type);
    if (trouvee) reste.push(trouvee);
  }

  const autres = pastilles(page, [...DEPARTEMENTS.keys()], parChemin);

  return {
    gabarit: "departement",
    chapeau: heros?.mecanisme || undefined,
    actions: heros?.cta ? [{ libelle: heros.cta, href: ANCRE }] : undefined,
    reperes: detaille
      ? undefined
      : siRempli(
          (chiffres?.chiffres ?? []).map(({ valeur, libelle }) => ({ valeur, libelle })),
        ),
    autresSurtitre: autres.length > 0 ? SURTITRE_AUTRES_DEPTS : undefined,
    autres: siRempli(autres),
    appelTitre: ctaFinal?.question || undefined,
    appelTexte: ctaFinal?.rappel || undefined,
    appelBouton: ctaFinal?.bouton ? { libelle: ctaFinal.bouton, href: ANCRE } : undefined,
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
 * TROIS CHAMPS SONT ATTENDUS COMME ABSENTS, et ils sont déclarés, pas tolérés :
 *
 *   · `heros.h1`, qui devient le `titre_h1` de la ligne `pages` et n'a donc
 *     rien à faire dans le `contenu` : il y ferait un second H1 ;
 *   · `heros.telephone`, un numéro nu que les sections `cta` et `ctaFinal`
 *     réécrivent dans leur phrase de rappel, elles-mêmes rendues ;
 *   · `heros.phraseDelai`, SUR LES PAGES DE DÉPARTEMENT seulement : les trois
 *     sections de `isDept` n'ont pas de case pour elle. Le téléphone, les
 *     horaires et le rappel dans l'heure restent sur la page, écrits par `cta`.
 *     Les pages de ville, elles, la gardent dans le panneau du hero.
 */
function completude(page, contenu, departement) {
  const heros = section(page, "heros") ?? {};
  const attendusAbsents = new Set(
    [heros.h1, heros.telephone, departement ? heros.phraseDelai : null].filter(Boolean),
  );

  const produites = new Set(chaines(contenu));
  const manquantes = chaines(page.contenu?.sections ?? []).filter(
    (texte) => !produites.has(texte) && !attendusAbsents.has(texte),
  );

  return manquantes;
}

/* ----------------------------------------------------------------- l'écriture */

/* Le mot clé sert aux libellés de pastilles : on le relit avec les pages. */
const avecCle = await fetch(
  `${URL_BASE}/rest/v1/pages?select=path,mot_cle_principal&path=like./implantations/*`,
  { headers: { apikey: CLE, Authorization: `Bearer ${CLE}` } },
).then((r) => r.json());
const clesParChemin = new Map(avecCle.map((p) => [p.path, p.mot_cle_principal]));
for (const page of pages) page.mot_cle_principal = clesParChemin.get(page.path) ?? null;

const parChemin = new Map(pages.map((p) => [p.path, p]));

mkdirSync(SORTIE, { recursive: true });

/** `/implantations/toulouse/gironde/` → `implantations-toulouse-gironde.json` */
const aplati = (chemin) => `${chemin.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`;

let villes = 0;
let depts = 0;
const perdus = [];

for (const page of pages) {
  const departement = estDept(page.path);
  const contenu = departement
    ? contenuDepartement(page, parChemin)
    : contenuVille(page, parChemin);

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

  const perdues = completude(page, contenu, departement);
  if (perdues.length > 0) {
    perdus.push({ chemin: page.path, textes: perdues });
  }

  if (departement) depts += 1;
  else villes += 1;
  console.log(`${page.path.padEnd(58)} ${departement ? "departement" : "ville"}`);
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
