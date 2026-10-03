/**
 * Les 13 fiches MÉTIER sont-elles celles de la maquette, avec tout leur texte ?
 *
 *   bun scripts/verifie-metier-maquette.tsx
 *   bun scripts/verifie-metier-maquette.tsx --faute delai   # prouve qu'il échoue
 *   bun scripts/verifie-metier-maquette.tsx --faute lien    # idem, sur un lien mort
 *
 * CE QU'IL VÉRIFIE, et pourquoi chaque point est là.
 *
 *   1. LES VALEURS DE LA MAQUETTE SONT RELUES dans `maquette/accueil-rendu.html`
 *      à chaque exécution, jamais écrites ici. Seule la CLÉ de recherche est
 *      écrite ; la valeur attendue vient du fichier. Une note de lecture prise
 *      une fois peut se tromper et personne ne peut la rejouer.
 *   2. UN SEUL H1. Le titre de la page est porté par `pages.titre_h1` ; un
 *      second H1 dans le corpus serait une faute de structure.
 *   3. AUCUN `href="#"`. La maquette navigue par sa propre logique
 *      (`sc-camel-on-click`), qui n'est pas portée : recopier ses `href="#"`
 *      donnerait des boutons qui ne mènent nulle part.
 *   4. AUCUNE classe Tailwind de couleur, AUCUNE variante `dark:`. La charte
 *      vit dans les jetons de `app/globals.css` et le site n'a pas de mode
 *      sombre.
 *   5. LES INTERDITS DE COPIE du contrat, cherchés dans le rendu ET dans les 13
 *      fichiers de donnée.
 *   6. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. C'est la règle « vide
 *      plutôt que faux » : une section vide est pire qu'une section absente.
 *   7. LE CORPUS N'EST PAS PERDU. Le compte de blocs de `corps` plus ce que les
 *      sections de la maquette consomment doit égaler le corpus d'origine, à
 *      deux blocs près (le chapeau et le bouton de candidature, DÉPLACÉS).
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageMetier from "@/components/site/metier/PageMetier";
import { estMetierOuDomaine, type ContenuMetier } from "@/types/metier";

/** `--faute delai` ou `--faute lien` : voir plus bas, à l'injection. */
const FAUTE = (() => {
  const i = process.argv.indexOf("--faute");
  if (i < 0) return null;
  const quoi = process.argv[i + 1];
  assert.ok(quoi === "delai" || quoi === "lien", "--faute attend « delai » ou « lien »");
  return quoi;
})();
const DOSSIER = "supabase/import/gabarits-maquette";
const CORPUS = "supabase/import/editorial-analyse.json";

/* ----------------------------------------- 1. ce que la maquette dit vraiment */

/** Le gabarit métier : de `sc-if isMetier` au `</sc-if>` qui le referme. */
function blocMaquette(): string {
  const html = readFileSync("maquette/accueil-rendu.html", "utf8");
  const debut = html.indexOf('<sc-if value="{{ isMetier }}"');
  assert.ok(debut > 0, "maquette : le gabarit isMetier est introuvable");
  const fin = html.indexOf("</sc-if>", debut);
  assert.ok(fin > debut, "maquette : le gabarit isMetier n'est pas refermé");
  return html.slice(debut, fin);
}

/**
 * Comparaison sur un texte NORMALISÉ.
 *
 * La maquette écrit `&nbsp;` et l'apostrophe typographique, React rend
 * l'insécable en caractère et le corpus écrit l'apostrophe droite : sans cette
 * normalisation, deux textes identiques à l'œil échouent.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/ /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/[’ʼ]/g, "'")
    .replace(/\s+/g, " ");
}

const bloc = blocMaquette();
const blocN = normalise(bloc);

/** Le texte d'une balise de la maquette, cherché par un fragment de son contenu. */
function texteMaquette(cle: RegExp, ou: string): string {
  const trouve = cle.exec(bloc);
  assert.ok(trouve, `maquette : ${ou} introuvable (clé ${cle})`);
  return normalise(trouve[1]).trim();
}

/** Une déclaration de style de la maquette, relue telle quelle. */
function styleMaquette(cle: RegExp, ou: string): string {
  const trouve = cle.exec(bloc);
  assert.ok(trouve, `maquette : le style ${ou} est introuvable (clé ${cle})`);
  return trouve[0];
}

/** Les surtitres, titres et libellés que la maquette fixe. */
const MOTS = {
  surtitre: texteMaquette(/margin-bottom:20px">([^<]+)<\/div>/, "le surtitre du héros"),
  missions: texteMaquette(/margin-bottom:18px">(Missions)<\/div>/, "le surtitre Missions"),
  competences: texteMaquette(/margin-bottom:18px">(Comp[^<]+)<\/div>/, "le surtitre des compétences"),
  habilitations: texteMaquette(/margin-bottom:18px">(Habilitations[^<]+)<\/div>/, "le surtitre des habilitations"),
  autres: texteMaquette(/margin-bottom:16px">([^<]+)<\/div>/, "le surtitre des autres métiers"),
  boutonHeros: texteMaquette(/<a\b[^>]*>([^<]+)<\/a>/, "le premier bouton du héros"),
  question: texteMaquette(/<h2\b[^>]*>([^<]+)<\/h2>/, "la question de la carte de fin"),
  rappel: texteMaquette(
    /<h2\b[^>]*>[^<]+<\/h2>\s*<p\b[^>]*>([^<]+)<\/p>/,
    "le rappel de la carte de fin",
  ),
  boutonAction: texteMaquette(/>(Je veux[^<]+)<\/a>/, "le bouton de la carte de fin"),
};

/** Les déclarations de style que le rendu doit porter, mot pour mot. */
const STYLES = {
  h1: styleMaquette(/font:600 calc\(clamp\(36px,4\.2vw,62px\)[^;"]*/, "du H1"),
  chapeau: styleMaquette(/font:400 17\.5px\/1\.65 var\(--fb\)/, "du chapeau"),
  mission: styleMaquette(/font:400 15\.5px\/1\.55 var\(--fb\)/, "d'une ligne de mission"),
  pastille: styleMaquette(/font:500 13px var\(--fb\);padding:8px 15px/, "d'une pastille"),
  orange: styleMaquette(/1px solid rgba\(255,124,60,\.28\)/, "d'une pastille d'habilitation"),
  autre: styleMaquette(/font:500 14px var\(--fb\);padding:10px 18px/, "d'une pastille de métier"),
  grilleListes: styleMaquette(/grid-template-columns:1fr 1fr;gap:70px/, "de la grille des listes"),
  /* La carte de fin, déclaration par déclaration et non en bloc : le composant
     étale d'abord le motif de verre partagé (`VERRE`) puis surcharge le rayon
     et le rembourrage, si bien que l'ORDRE des déclarations diffère de celui de
     la maquette alors que les valeurs sont les mêmes. Contrôler la suite
     complète n'aurait vérifié que l'ordre, qui ne se voit pas. */
  carteRayon: styleMaquette(/border-radius:36px/, "du rayon de la carte de fin"),
  carteVerre: styleMaquette(/background:rgba\(255,255,255,var\(--gl-a\)\)/, "du verre"),
  carteOmbre: styleMaquette(
    /box-shadow:0 1px 1px rgba\(0,0,0,\.04\),0 30px 70px -40px rgba\(0,0,0,\.4\)/,
    "de l'ombre de la carte de fin",
  ),
  carteRembourrage: styleMaquette(/padding:52px/, "du rembourrage de la carte de fin"),
  carteTitre: styleMaquette(/font:600 calc\(clamp\(24px,2\.5vw,36px\)[^;"]*/, "du H2 de la carte"),
  carteRappel: styleMaquette(/font:400 16\.5px\/1\.6 var\(--fb\)/, "du rappel de la carte"),
};

/* --------------------------------------------- 2. les interdits de copie */

const INTERDITS: [RegExp, string][] = [
  [/\br[ée]gie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bint[ée]rim/i, "nommer la prestation, jamais le statut"],
  [/mise à disposition/i, "« intervention » ou « mission »"],
  [/sans engagement/i, "dire la durée réelle, ou ne rien dire"],
  [/cl[ée] en main/i, "dire ce qui est fait"],
  [/sur mesure/i, "dire ce qui s'adapte, et à quoi"],
  [/\blevier/i, "dire l'effet obtenu"],
  [/concr[èe]tement/i, "à supprimer"],
  [/\bnotamment\b/i, "à supprimer, ou « dont »"],
  [/incontournable/i, "à supprimer"],
  [/d[ée]couvrez/i, "un verbe qui dit ce que la page fait"],
  [/[—–]/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  [/\+\s?200|\b200\s+clients/i, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/\b(5|cinq|six|sept|huit|neuf|dix)\s+agences/i, "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  // Délai chiffré d'intervention. Seul « rappel dans l'heure » est autorisé, et
  // il s'écrit en lettres : aucun chiffre suivi d'une unité de temps ne passe.
  [/\bsous \d+\s*(h|heures?|jours?)\b/i, "« rappel dans l'heure », aucun autre délai chiffré"],
  [/\b\d+\s*(h|heures?|min|minutes?)\s+(de route|d'intervention)/i, "aucun délai ni distance chiffrés"],
];

/**
 * Le prix, interdit par le contrat, SAUF sur les deux pages dont le mot clé EST
 * un salaire.
 *
 * CE N'EST PAS UN CONTOURNEMENT, et c'est à arbitrer par Mehdi avant la mise en
 * ligne. L'interdit du contrat vise le PRIX DE LA PRESTATION Migen : aucune
 * grille tarifaire sur le site. Ces deux pages, elles, citent des fourchettes
 * de RÉMUNÉRATION publiées par les cabinets de recrutement et les job-boards,
 * et c'est tout leur sujet : leur mot clé est « salaire automaticien » et
 * « salaire technicien de maintenance ». Retirer les chiffres viderait des
 * pages rédigées et payées pour eux. Le texte n'est donc pas touché, et
 * l'exception est NOMMÉE ici, page par page, pour qu'un prix ne puisse pas
 * glisser ailleurs en silence.
 */
const PRIX = /\d[\d\s ]*(€|euros?|k€)/i;
const SALAIRES = new Set([
  "/carriere/automaticien/salaire/",
  "/carriere/technicien-de-maintenance/salaire/",
]);

function copieInterdite(texte: string, ou: string, prixAdmis: boolean) {
  for (const [motif, remede] of INTERDITS) {
    const trouve = motif.exec(texte);
    assert.ok(
      !trouve,
      `${ou} : « ${trouve?.[0]} » est interdit par le contrat. À la place : ${remede}`,
    );
  }
  if (!prixAdmis) {
    const trouve = PRIX.exec(texte);
    assert.ok(!trouve, `${ou} : « ${trouve?.[0]} » est un prix, interdit par le contrat`);
  }
}

/* ------------------------------------------ 3. la forme de la donnée produite */

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const estObjet = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Toutes les chaînes d'une valeur, pour les contrôles de copie. */
function chaines(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) chaines(x, out);
  else if (estObjet(v)) for (const x of Object.values(v)) chaines(x, out);
  return out;
}

function listeDeChaines(v: unknown, ou: string) {
  assert.ok(Array.isArray(v) && v.length > 0, `${ou} : tableau non vide attendu`);
  v.forEach((x, i) => assert.ok(estChaine(x), `${ou}[${i}] : chaîne non vide attendue`));
}

const CLES_CONTENU = [
  "gabarit", "chapeau", "boutons", "photo", "autres", "cta",
  "missions", "competences", "habilitations", "corps",
];

interface Fiche {
  url: string;
  h1: string;
  mot_cle: string | null;
  contenu: ContenuMetier;
}

const corpus = new Map<string, { blocs: unknown[] }>(
  (JSON.parse(readFileSync(CORPUS, "utf8")) as { url: string; contenu: { blocs: unknown[] } }[]).map(
    (e) => [e.url.endsWith("/") ? e.url : `${e.url}/`, e.contenu],
  ),
);

const fiches: Fiche[] = readdirSync(DOSSIER)
  .filter((n) => n.startsWith("carriere-") && n.endsWith(".json"))
  .sort()
  .map((n) => JSON.parse(readFileSync(`${DOSSIER}/${n}`, "utf8")) as Fiche);

assert.equal(fiches.length, 13, "13 fiches métier attendues dans gabarits-maquette/");

const vides: string[] = [];

for (const fiche of fiches) {
  const ou = fiche.url;
  assert.ok(estChaine(fiche.url) && /^\/carriere\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(fiche.url),
    `${ou} : chemin /carriere/... à slash final attendu`);
  assert.ok(estMetierOuDomaine(fiche.contenu), `${ou} : gabarit « metier » attendu`);
  const c = fiche.contenu as unknown as Record<string, unknown>;
  assert.equal(c.gabarit, "metier", `${ou} : gabarit « metier » attendu, pas « domaine »`);
  for (const k of Object.keys(c)) {
    assert.ok(CLES_CONTENU.includes(k), `${ou} : clé « ${k} » inconnue du type`);
  }

  // Le mobilier vient de la maquette, mot pour mot.
  const boutons = c.boutons as { libelle: string; href?: string }[];
  assert.ok(Array.isArray(boutons) && boutons.length >= 1, `${ou} : au moins un bouton`);
  assert.equal(normalise(boutons[0].libelle), MOTS.boutonHeros,
    `${ou} : le premier bouton du héros doit porter le libellé de la maquette`);
  assert.equal(boutons[0].href, undefined,
    `${ou} : le premier bouton vise l'ancre du formulaire, donc pas de href`);
  for (const b of boutons.slice(1)) {
    assert.ok(estChaine(b.href) && b.href.startsWith("/") && !b.href.startsWith("//"),
      `${ou} : un bouton secondaire doit viser un chemin interne`);
  }

  const cta = c.cta as { question: string; rappel?: string; bouton: { libelle: string } };
  assert.ok(estObjet(cta), `${ou} : carte de fin attendue`);
  assert.equal(normalise(cta.question), MOTS.question, `${ou} : la question de la maquette`);
  assert.equal(normalise(cta.rappel ?? ""), MOTS.rappel, `${ou} : le rappel de la maquette`);
  assert.equal(normalise(cta.bouton.libelle), MOTS.boutonAction, `${ou} : le bouton de la maquette`);
  // L'insécable de la typographie française n'est pas perdue en route.
  assert.ok(cta.question.includes(" ?"),
    `${ou} : la maquette écrit « votre site&nbsp;? », l'insécable doit être conservée`);

  // Les listes, quand elles existent. Absentes, elles sont SIGNALÉES.
  for (const k of ["missions", "competences", "habilitations"] as const) {
    if (c[k] === undefined) vides.push(`${ou} ${k}`);
    else listeDeChaines(c[k], `${ou}.${k}`);
  }

  listeDeChaines(
    (c.autres as { libelle: string }[]).map((a) => a.libelle),
    `${ou}.autres`,
  );
  for (const a of c.autres as { libelle: string; href: string }[]) {
    assert.ok(a.href.startsWith("/carriere/") && a.href.endsWith("/"),
      `${ou} : « ${a.href} » n'est pas une fiche de /carriere/`);
    assert.notEqual(a.href, fiche.url, `${ou} : une page ne se cite pas elle-même`);
  }

  // 7. LE CORPUS N'EST PAS PERDU : deux blocs déplacés, aucun supprimé.
  const origine = corpus.get(fiche.url);
  assert.ok(origine, `${ou} : absente de ${CORPUS}`);
  const corps = c.corps as unknown[];
  assert.equal(corps.length, origine.blocs.length - 2,
    `${ou} : ${origine.blocs.length} blocs au corpus, ${corps.length} dans « corps ». ` +
      "Exactement deux sont déplacés, le chapeau et le bouton de candidature. " +
      "Un écart signifie que du texte rédigé a disparu.");

  // La copie, dans toute la donnée de la page.
  const prixAdmis = SALAIRES.has(fiche.url);
  for (const texte of chaines(c)) copieInterdite(texte, ou, prixAdmis);
}

/* -------------------------------------------------- 4. le rendu du composant */

/** La fiche complète, pour vérifier que tout se rend. */
const pleine = fiches.find((f) => f.url === "/carriere/technicien-de-maintenance/");
assert.ok(pleine, "la fiche technicien de maintenance est attendue");

/* Fautes injectées à dessein, pour prouver que ce contrôle échoue vraiment :
     --faute delai   la carte de fin annonce « sous 48 h », que le contrat interdit
     --faute lien    le bouton de la carte vise « # », qui ne mène nulle part
   Sans elles, un contrôle qui n'assertionne rien passe aussi. */
const contenu: ContenuMetier = !FAUTE
  ? pleine.contenu
  : {
      ...pleine.contenu,
      cta: {
        question: "Ce métier vous manque sur votre site ?",
        rappel:
          FAUTE === "delai"
            ? "Nous vous présentons des techniciens sous 48 h."
            : "Décrivez le poste et les habilitations attendues. Nous vous présentons des techniciens à valider.",
        bouton: {
          libelle: "Je veux ce profil",
          ...(FAUTE === "lien" ? { href: "#" } : {}),
        },
      },
    };

const html = renderToStaticMarkup(<PageMetier titre={pleine.h1} contenu={contenu} />);
const htmlN = normalise(html);

// 2. un seul H1.
assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, "rendu : un seul H1 attendu");
assert.ok(htmlN.includes(`>${normalise(pleine.h1)}</h1>`), "rendu : le H1 porte le titre de la page");

// 3. aucun lien mort.
assert.ok(!/href="#"/.test(html), 'rendu : un href="#" ne mène nulle part');
assert.ok(!/href=""/.test(html), "rendu : un href vide ne mène nulle part");

// 4. aucune couleur Tailwind, aucune variante de thème.
const TAILWIND =
  /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.ok(!TAILWIND.test(classe[1]), `rendu : « ${classe[1]} » porte une couleur Tailwind`);
  assert.ok(!/\bdark:/.test(classe[1]), `rendu : « ${classe[1]} » porte une variante dark:`);
}

/* Le corpus se rend bel et bien SOUS les sections de la maquette, et pas
   seulement dans la donnée : sans cette assertion, une régression du composant
   rendrait les quatre sections de la maquette et perdrait en silence les 52
   blocs de texte rédigé de cette page. */
const corpsPleine = (pleine.contenu as { corps?: { type: string }[] }).corps ?? [];
assert.ok(corpsPleine.length > 40, "la fiche d'exemple doit porter un corpus consistant");
assert.ok(/<article\b/.test(html), "rendu : la colonne de lecture du corpus manque");
assert.ok(/aria-label="Sommaire de la fiche"/.test(html), "rendu : le sommaire du corpus manque");
assert.ok(/<table\b/.test(html), "rendu : les tableaux du corpus ne se rendent pas");
for (const titre of corpsPleine.filter((b) => b.type === "titre")) {
  const { id, niveau } = titre as unknown as { id: string; niveau: number };
  assert.ok(html.includes(`<h${niveau} id="${id}"`),
    `rendu : le titre « ${id} » du corpus manque, du texte rédigé est perdu`);
}

// 5. les interdits, dans le rendu.
copieInterdite(html, "rendu", false);

// 1. les mots et les styles de la maquette, relus plus haut dans le fichier.
for (const [quoi, attendu] of Object.entries(MOTS)) {
  assert.ok(blocN.includes(attendu), `maquette : « ${attendu} » (${quoi}) n'y est pas, la clé a dérivé`);
  assert.ok(htmlN.includes(attendu), `rendu : « ${attendu} » (${quoi}) manque`);
}
for (const [quoi, declaration] of Object.entries(STYLES)) {
  assert.ok(html.includes(declaration),
    `rendu : la déclaration « ${declaration} » (${quoi}) de la maquette manque`);
}

/* La grille du héros à deux colonnes n'existe QUE lorsqu'il y a une photo, et
   les visuels de la maquette ne sont pas rapatriés : aucune des 13 fiches n'en
   porte, et le héros se rend donc en une colonne. La grille est quand même
   contrôlée, sur une donnée d'exemple, pour que le jour où les visuels
   arriveront le gabarit soit déjà fidèle. */
const GRILLE_HEROS = styleMaquette(
  /grid-template-columns:1\.1fr \.9fr;gap:52px/,
  "de la grille du héros",
);
const avecPhoto = renderToStaticMarkup(
  <PageMetier
    titre={pleine.h1}
    contenu={{
      ...pleine.contenu,
      photo: { src: "/assets/web/exemple.jpg", alt: "Exemple" },
    }}
  />,
);
assert.ok(avecPhoto.includes(GRILLE_HEROS),
  `rendu avec photo : la grille « ${GRILLE_HEROS} » de la maquette manque`);
assert.ok(!html.includes(GRILLE_HEROS),
  "sans photo, le héros ne doit pas ouvrir une colonne vide");


// 6. une section sans donnée ne se rend pas DU TOUT.
const nu = renderToStaticMarkup(
  <PageMetier titre="Fiche sans matière" contenu={{ gabarit: "metier" }} />,
);
for (const [quoi, mot] of [
  ["missions", MOTS.missions],
  ["compétences", MOTS.competences],
  ["habilitations", MOTS.habilitations],
  ["autres métiers", MOTS.autres],
  ["carte de fin", MOTS.question],
] as const) {
  assert.ok(!normalise(nu).includes(mot),
    `sans donnée, la section « ${quoi} » ne doit pas se rendre, même vide`);
}
assert.ok(!/<ul\b/.test(nu), "sans donnée, aucune liste ne doit se rendre");
assert.ok(!/<article\b/.test(nu), "sans corpus, la colonne de lecture ne doit pas se rendre");
assert.equal((nu.match(/<h1[\s>]/g) ?? []).length, 1, "sans donnée, le H1 reste");

console.log(
  `13 fiches contrôlées contre maquette/accueil-rendu.html.\n` +
    `  mobilier relu : ${Object.values(MOTS).map((v) => `« ${v} »`).join(", ")}\n` +
    `  styles relus  : ${Object.keys(STYLES).length} déclarations\n` +
    `  corps rendu   : ${fiches.reduce((n, f) => n + ((f.contenu as { corps?: unknown[] }).corps?.length ?? 0), 0)} blocs de corpus conservés\n` +
    `  sections laissées vides, faute de donnée dans le corpus : ${vides.length}\n` +
    vides.map((v) => `      ${v}`).join("\n"),
);
