/**
 * Produit les fichiers de contenu du gabarit OFFRE, un par page.
 *
 *   node scripts/produit_gabarit_offre.mjs
 *
 * Écrit dans `supabase/import/gabarits-maquette/`, que
 * `scripts/importe_rest.mjs` pose ensuite par l'API REST.
 *
 * CE SCRIPT NE RÉDIGE RIEN. Il prend le corpus déjà parsé
 * (`supabase/import/corpus-analyse.json`, forme « vente » en dix sections) et
 * le range dans les champs du gabarit de la maquette. Chaque correspondance est
 * commentée. Un champ de la maquette que le corpus n'alimente pas N'EST PAS
 * ÉCRIT : la section correspondante ne se rend donc pas, plutôt que d'afficher
 * une valeur approchée.
 *
 * POURQUOI UN SCRIPT ET PAS DIX-HUIT FICHIERS ÉCRITS À LA MAIN : dix-huit
 * copies manuelles dérivent au premier ajustement, et une faute de frappe dans
 * un chemin passerait inaperçue. Ici la règle est écrite une fois, et se
 * rejoue.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const IMPORT = join(RACINE, "supabase", "import");
const SORTIE = join(IMPORT, "gabarits-maquette");

/**
 * Les pages servies par ce gabarit : la branche `/offres/`, SAUF deux.
 *
 *   · `/offres/` est le hub, et la maquette lui donne son propre gabarit
 *     (`sc-if value="{{ isOffres }}"`, l. 1886), différent de celui-ci
 *     (`isOfferPage`, l. 4706).
 *   · `/offres/residence/recruter-un-technicien/` porte déjà le gabarit
 *     éditorial en base : c'est un guide, pas une offre.
 */
const HORS_GABARIT = new Set([
  "/offres/",
  "/offres/residence/recruter-un-technicien/",
]);

/* ------------------------------------------------- la copie venue du dessin */

/**
 * Les six cartes de « Un autre besoin ? » (maquette, l. 5156).
 *
 * LES PHRASES SONT CELLES DE LA MAQUETTE, pas du corpus, et c'est assumé : ce
 * sont des phrases à la première personne que le corpus n'écrit nulle part, et
 * elles font partie de la maquette validée par le client. Elles ne heurtent
 * aucun interdit : aucun prix, aucun délai chiffré, aucun mot proscrit.
 *
 * LES LIBELLÉS ET LES CHEMINS, EUX, VIENNENT DU CORPUS, qui liste ses propres
 * offres avec leurs liens dans la section `offre` de `/offres/`. Un seul écart
 * avec la maquette : elle écrit « Full service » là où le corpus écrit
 * « Périmètre complet » pour `/offres/maintenance-externalisee/`. Le texte
 * vient du corpus, donc c'est « Périmètre complet » qui est retenu.
 */
const AUTRES_OFFRES = [
  {
    phrase: "« J'ai besoin d'un renfort maintenance sur mon site. »",
    libelle: "Résidence",
    href: "/offres/residence/",
  },
  {
    phrase: "« Je veux confier toute ma maintenance à un seul partenaire. »",
    libelle: "Périmètre complet",
    href: "/offres/maintenance-externalisee/",
  },
  {
    phrase: "« Je paie mes pannes à l'heure et je ne maîtrise pas mon budget. »",
    libelle: "Zéro arrêt",
    href: "/offres/zero-arret/",
  },
  {
    phrase: "« J'ai une fenêtre d'arrêt et pas le droit de la dépasser. »",
    libelle: "Arrêt technique",
    href: "/offres/arret-technique/",
  },
  {
    phrase: "« Mon installation n'est plus conforme et je n'ai plus les schémas. »",
    libelle: "Bureau d'études",
    href: "/offres/bureau-etudes/",
  },
  {
    phrase: "« Je ne sais pas encore ce qu'il me faut. »",
    libelle: "Toutes les offres",
    href: "/offres/",
  },
];

/** Le H2 de « En bref » (l. 4765). Il annonce QUATRE chiffres. */
const TITRE_BREF_QUATRE = "Le cadre, en quatre chiffres.";

/** L'ancre du formulaire de la page. Convention du projet, cf. `habillage.ts`. */
const ANCRE = "#formulaire";

/* ---------------------------------------------------------- la transformation */

function section(sections, type) {
  return sections.find((s) => s.type === type);
}

/** Vrai si la valeur mérite d'être écrite. Un vide ne s'écrit pas. */
function pose(valeur) {
  if (valeur === null || valeur === undefined) return false;
  if (typeof valeur === "string") return valeur.trim().length > 0;
  if (Array.isArray(valeur)) return valeur.length > 0;
  return true;
}

function ajoute(cible, clef, valeur) {
  if (pose(valeur)) cible[clef] = valeur;
}

/** Une cible sûre : chemin interne ou ancre. Sinon, l'ancre de la page. */
function cible(href) {
  if (typeof href !== "string") return ANCRE;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("#")) return href;
  return ANCRE;
}

function construit(entree) {
  const sections = entree.contenu.sections ?? [];
  const heros = section(sections, "heros");
  const chiffres = section(sections, "chiffres");
  const cta = section(sections, "cta");

  const contenu = { gabarit: "offre" };

  /* ---- 1. LE HÉROS (maquette l. 4708) ------------------------------------
     `of.pill` n'est PAS écrit : la maquette y met un libellé d'offre que le
     corpus n'écrit nulle part. La pastille ne se rend donc pas.
     `of.small`  ← `heros.phraseDelai`, qui porte « rappel dans l'heure ».
     `of.lead`   ← `heros.mecanisme`.
     Le H1 vient de `pages.titre_h1`, pas du contenu.
     La bande de repères (l. 4723) n'est PAS écrite : la maquette y met
     « 5 agences » et « +200 clients », interdits, et les chiffres justes du
     corpus sont la bande « En bref » juste dessous. */
  ajoute(contenu, "mention", heros?.phraseDelai);
  ajoute(contenu, "chapeau", heros?.mecanisme);

  /* LE BOUTON DU HÉROS, et pourquoi il n'y en a qu'un.
     La maquette n'en rend qu'un (l. 4720, « Les cinq offres »), le héros
     portant déjà son formulaire dans la colonne de droite. On a d'abord ajouté
     l'appel du corpus (`heros.cta`) à côté : mesure faite, il porte le MÊME
     libellé que `cta.bouton` sur les DIX-HUIT pages, et `cta.bouton` est déjà
     le bouton de la bande « En bref » juste dessous. Le même mot se lisait
     donc deux fois en un écran et demi. L'appel du corpus reste là où la
     maquette le place, dans la bande ; le héros garde son unique bouton. */
  ajoute(contenu, "actions", [
    { libelle: "Les cinq offres", href: "/offres/" },
  ]);

  /* Le panneau de formulaire du héros (l. 4741). Son en-tête est celui de la
     maquette, et « Rappel dans l'heure » est le seul délai autorisé. */
  contenu.formulaireHeroTitre = "Décrire mon besoin";
  contenu.formulaireHeroMention = "Rappel dans l'heure";

  /* ---- 2. « EN BREF » (l. 4762) -----------------------------------------
     `of.s00` à `of.s32` ← `chiffres.chiffres`, valeur / libellé / détail.
     Le H2 de la maquette annonce quatre chiffres : il n'est écrit que pour
     les pages qui en ont bien quatre. `of.bref` n'a pas de source : omis.
     La bande sous les chiffres (l. 4767) ← la section `cta` du corpus, qui est
     exactement cela, une question de besoin et un bouton. C'est pour cela que
     `cta` n'est PAS laissée dans `sections` : elle serait rendue deux fois. */
  const quatre = (chiffres?.chiffres ?? []).length === 4;
  contenu.brefSurtitre = "En bref";
  if (quatre) contenu.brefTitre = TITRE_BREF_QUATRE;
  ajoute(contenu, "chiffres", chiffres?.chiffres);
  ajoute(contenu, "brefBande", cta?.question);
  if (pose(cta?.bouton)) {
    contenu.brefBouton = { libelle: cta.bouton, href: cible(cta.href) };
  }

  /* ---- 3 à 6. LES QUATRE SECTIONS SOUS CONDITION ------------------------
     Aucune donnée n'est posée. La maquette y écrit des prix, des délais
     chiffrés d'intervention, « régie » et un chiffre RH non confirmé. La mise
     en page est portée dans `components/site/offre/BlocsZeroArret.tsx` et
     attend une matière qui ne heurte aucune règle. Voir le rapport. */

  /* ---- LE CORPS, VENU DU CORPUS ----------------------------------------
     `offre` va sous « Ce qui est inclus » (l. 4953), `preuves` sous « Nos
     dernières réalisations » (l. 5105), `objections` sous « Questions
     fréquentes » (l. 5143) : la maquette leur donne un emplacement.
     `probleme`, `deroule` et `garanties` sont du texte rédigé que la maquette
     ne montre pas : le gabarit les rend sous la section de la maquette à
     laquelle elles se rattachent, dans ses propres motifs. Rien n'est jeté.
     `heros` et `cta` sont retirées : leurs champs sont déjà rangés au-dessus,
     et `ctaFinal` reste pour le titre du formulaire de bas de page. */
  const corps = sections.filter(
    (s) => s.type !== "heros" && s.type !== "chiffres" && s.type !== "cta",
  );
  ajoute(contenu, "sections", corps);

  /* ---- 13. « UN AUTRE BESOIN ? » (l. 5152) -----------------------------
     `of.name` du chapeau de la maquette n'a pas de source dans le corpus :
     le chapeau n'est pas écrit. La page ne se lie pas à elle-même. */
  contenu.autresSurtitre = "Un autre besoin ?";
  contenu.autresTitre = "Chaque situation a son offre.";
  contenu.autres = AUTRES_OFFRES.filter((c) => c.href !== entree.url);

  /* ---- 14. LE FORMULAIRE DE BAS DE PAGE (l. 5161) ----------------------
     `of.form` ← `ctaFinal.question`, lu par le gabarit dans `sections`. */

  return contenu;
}

/* ------------------------------------------------------------------- l'écriture */

const corpus = JSON.parse(
  readFileSync(join(IMPORT, "corpus-analyse.json"), "utf8"),
);

const aEcrire = corpus.filter((e) => {
  const url = e.url?.endsWith("/") ? e.url : `${e.url}/`;
  return url.startsWith("/offres/") && !HORS_GABARIT.has(url) && !!e.contenu;
});

mkdirSync(SORTIE, { recursive: true });

/** `/offres/residence/cahier-des-charges/` devient `offres-residence-cahier-des-charges`. */
function aplatit(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

let total = 0;
for (const entree of aEcrire) {
  const url = entree.url.endsWith("/") ? entree.url : `${entree.url}/`;
  const contenu = construit({ ...entree, url });
  const fichier = join(SORTIE, `${aplatit(url)}.json`);
  writeFileSync(
    fichier,
    `${JSON.stringify({ url, contenu }, null, 2)}\n`,
    "utf8",
  );
  const vides = [
    !contenu.pastille && "pastille",
    !contenu.reperes && "repères du héros",
    !contenu.brefTitre && "titre « En bref »",
    !contenu.brefChapeau && "chapeau « En bref »",
    !contenu.commentCaMarcheJalons && "« Comment ça marche »",
    !contenu.formules && "« Les formules »",
    !contenu.comparatif && "« Le comparatif »",
    !contenu.premierMoisEtapes && "« Le premier mois »",
    !contenu.autresChapeau && "chapeau « Un autre besoin »",
  ].filter(Boolean);
  console.log(
    `${url.padEnd(48)} ${String((contenu.chiffres ?? []).length).padStart(2)} chiffres, ` +
      `${String((contenu.sections ?? []).length).padStart(2)} sections de corpus, ` +
      `${vides.length} champs laissés vides`,
  );
  total += 1;
}

console.log(`\n${total} fichiers écrits dans supabase/import/gabarits-maquette/.`);
console.log("Pour les poser en base : node scripts/importe_rest.mjs --simulation");
