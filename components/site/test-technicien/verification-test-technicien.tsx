/**
 * Contrôle du test technique public (`/test-technicien/`), sans navigateur.
 *
 *   bun components/site/test-technicien/verification-test-technicien.tsx
 *   bun components/site/test-technicien/verification-test-technicien.tsx --ecris
 *
 * `--ecris` régénère `donnees-test.ts` depuis la maquette : c'est la SEULE
 * façon d'écrire les questions, aucune n'est recopiée à la main.
 *
 * CE QU'IL VÉRIFIE, en relisant la maquette à chaque exécution
 * (`maquette/site-final-autonome.html`, gabarit `isTest` et script) :
 *   1. les huit questions, leurs options, la bonne réponse, l'explication et
 *      les quatre paliers sont ceux du script, aux seuls écarts déclarés près ;
 *   2. le score et le palier se calculent comme dans la maquette ;
 *   3. chaque texte du gabarit est rendu, et aucun texte rendu n'est inventé ;
 *   4. les écarts imposés par les interdits de copie sont là, et seulement eux ;
 *   5. liens réels vers des pages qui existent, un seul h1, titre de page
 *      distinct du h1, formulaire « test-technicien » qui est celui du reste du
 *      site (six champs, mention RGPD), aucune promesse d'envoi, la copie
 *      nouvelle déclarée et elle seule, et le score ne sort pas de la page.
 * Et il SAIT ÉCHOUER : chaque contrôle est rejoué sur une donnée faussée exprès.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

import { appliqueDecisions } from "@/lib/decisions-copie";

import { lisModuleMaquette } from "./lecture-maquette";

const ICI = new URL("./", import.meta.url);
const maquette = lisModuleMaquette();

// ------------------------------------------------------------------ écarts
/* Trois tirets cadratins du script, remplacés selon la règle du contrat
   (virgule, parenthèses ou deux-points). Chacun doit se trouver UNE fois dans
   la maquette : si elle change, le contrôle le dit au lieu d'appliquer à vide. */
const ECARTS_SCRIPT: readonly [string, string][] = [
  ["la dernière étape — et se refait", "la dernière étape, et se refait"],
  [
    "relais et contacteurs — KM pour un contacteur de puissance.",
    "relais et contacteurs (KM pour un contacteur de puissance).",
  ],
  ["chez nos clients — et nous recrutons.", "chez nos clients, et nous recrutons."],
];

/* Décision de Mehdi du 08/10 (contact seulement) : rien n'est envoyé, la
   phrase du gabarit qui suppose un envoi sur demande ne se rend pas. */
const ECARTS_GABARIT: readonly [string, string][] = [
  [
    "Votre score ne quitte pas cette page. Nous n’envoyons que ce que vous demandez.",
    "Votre score ne quitte pas cette page.",
  ],
];

/* La bande de fin promet « une réponse sous 48 h ouvrées », délai chiffré
   interdit : la phrase entière ne se rend pas (la couper la reformulerait). */
const PHRASE_RETIREE = "Quatre écrans de candidature, une réponse sous 48 h ouvrées — refus compris, avec le motif.";

/* Les textes du gabarit que le site ne rend pas : la carte du formulaire
   promet l'envoi du corrigé et des fiches métier, que rien ne fait. Décision de
   Mehdi du 08/10 : le formulaire du site part dans HubSpot, le recrutement
   recontacte. */
const PROMESSES = [
  "Recevoir le corrigé et les fiches métier",
  "Les huit explications détaillées, plus les fiches des sept métiers que nous recrutons, avec fourchettes de rémunération.",
  "Recevoir mon corrigé",
  "Le corrigé et les fiches métier arrivent dans quelques minutes.",
];
const NON_RENDUS = new Set([...PROMESSES, "C’est envoyé.", "✓"]);

/* La copie nouvelle, approuvée par la même décision, et elle seule : le titre
   de la carte, rendu au-dessus du formulaire et répété sur son bouton. */
const COPIE_NOUVELLE = {
  titre: "Être recontacté par notre recrutement",
} as const;

function appliqueEcarts(texte: string): string {
  return ECARTS_SCRIPT.reduce((t, [de, vers]) => t.replace(de, vers), appliqueDecisions(texte));
}

// ------------------------------------------- les données attendues, depuis la maquette
interface Attendu {
  questions: { domaine: string; question: string; options: string[]; bonne: number; explication: string }[];
  paliers: { seuil: number; titre: string; verdict: string; couleur: string }[];
}

function attenduDepuis(m: typeof maquette): Attendu {
  return {
    questions: m.questions.map((q) => ({
      domaine: appliqueEcarts(q.d),
      question: appliqueEcarts(q.q),
      options: q.o.map(appliqueEcarts),
      bonne: q.c,
      explication: appliqueEcarts(q.e),
    })),
    paliers: m.paliers.map(([seuil, titre, verdict, couleur]) => ({
      seuil,
      titre: appliqueEcarts(titre),
      verdict: appliqueEcarts(verdict),
      couleur,
    })),
  };
}

const source = JSON.stringify([maquette.questions, maquette.paliers]);
for (const [de] of ECARTS_SCRIPT) {
  assert.equal(source.split(de).length - 1, 1, `écart introuvable ou ambigu dans la maquette : ${de}`);
}
const attendu = attenduDepuis(maquette);

if (process.argv.includes("--ecris")) {
  const entete = `/**
 * GÉNÉRÉ, ne pas éditer à la main :
 *   bun components/site/test-technicien/verification-test-technicien.tsx --ecris
 *
 * Les huit questions et les quatre paliers du test, lus dans le script de la
 * maquette autonome (tableaux \`TQ\` et \`BANDS\`), mot pour mot, aux trois
 * tirets cadratins près (remplacés, liste dans la vérification).
 */

export interface QuestionTest {
  domaine: string;
  question: string;
  options: readonly string[];
  /** Index de la bonne option, 0 pour A. */
  bonne: number;
  explication: string;
}

/** Un palier s'applique dès que le score atteint son seuil, du plus haut au plus bas. */
export interface PalierTest {
  seuil: number;
  titre: string;
  verdict: string;
  /** Couleur du score affiché. */
  couleur: string;
}
`;
  writeFileSync(
    new URL("donnees-test.ts", ICI),
    `${entete}
export const QUESTIONS: readonly QuestionTest[] = ${JSON.stringify(attendu.questions, null, 2)};

export const PALIERS: readonly PalierTest[] = ${JSON.stringify(attendu.paliers, null, 2)};
`,
  );
  console.log("donnees-test.ts réécrit depuis la maquette");
  process.exit(0);
}

// ------------------------------------------------------- la suite lit le site
/* `next/link` lit cette variable pour garder le slash final, comme le fait
   `trailingSlash: true` de next.config.ts. Sans elle, hors de Next, il écrit
   `/carriere#postuler`. */
process.env.__NEXT_TRAILING_SLASH = "true";
const { createRef } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const { QUESTIONS, PALIERS } = await import("./donnees-test");
const { default: Accueil } = await import("./Accueil");
const { default: Question } = await import("./Question");
const { default: Resultat, scoreDe, palierDe } = await import("./Resultat");
const { default: SuiteTest } = await import("./SuiteTest");
const { default: Page, metadata } = await import("@/app/test-technicien/page");
const { ROUTES_STATIQUES } = await import("@/lib/routes-statiques");
const { default: PageHubCarriere } = await import("@/components/site/carriere/PageHubCarriere");
const { HUB_CARRIERE } = await import("@/components/site/carriere/donnees-hub");

const rien = () => {};
const BONNES = maquette.questions.map((q) => q.c);
const TOUTES_A = maquette.questions.map(() => 0);

/** Texte visible d'un HTML : entités décodées, blancs écrasés, insécables gardés. */
function fragments(html: string): string[] {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/<[^>]+>/)
    .map((t) =>
      t
        .replace(/&nbsp;/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/[^\S ]+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

const rendu = (reponses: number[]) =>
  [
    renderToStaticMarkup(<Accueil onCommence={rien} refCommence={createRef()} />),
    ...maquette.questions.map((_, rang) =>
      renderToStaticMarkup(
        <Question rang={rang} choisie={undefined} onChoisit={rien} onRecule={rien} refQuestion={createRef()} />,
      ),
    ),
    renderToStaticMarkup(<Resultat reponses={reponses} onRecommence={rien} refScore={createRef()} />),
    renderToStaticMarkup(<SuiteTest />),
  ].join("");

const HTML_HAUT = rendu(BONNES);
const HTML_BAS = rendu(TOUTES_A);
/* Le formulaire est celui du site, pas celui de la maquette : il est contrôlé
   par `verifie:formulaire`, et retiré ici avant de comparer les textes. */
const sansFormulaire = (html: string) => html.replace(/<form[\s\S]*?<\/form>/g, "");

// ---------------------------------------------- 1. les données, mot pour mot
function verifieDonnees(donnees: { questions: unknown; paliers: unknown }, attendues: Attendu) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(donnees.questions)),
    attendues.questions,
    "les questions de donnees-test.ts ne sont plus celles de la maquette : relancer avec --ecris",
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(donnees.paliers)),
    attendues.paliers,
    "les paliers de donnees-test.ts ne sont plus ceux de la maquette : relancer avec --ecris",
  );
}
assert.equal(maquette.questions.length, 8, "la maquette ne porte plus huit questions");
verifieDonnees({ questions: QUESTIONS, paliers: PALIERS }, attendu);

// ------------------------------------------- 2. le score, comme la maquette
/* Le calcul de la maquette, relu dans son script : `tScore`, `tBand`, `tTop`. */
for (const regle of [
  "const tScore = TQ.reduce((n, q, i) => n + (tAns[i] === q.c ? 1 : 0), 0);",
  "const tBand = BANDS.find(b => tScore >= b[0]);",
  "tTop: tScore >= 7,",
  'given: tAns[i] === undefined ? "Sans réponse" : q.o[tAns[i]],',
]) {
  assert.ok(maquette.application.includes(regle), `règle absente du script de la maquette : ${regle}`);
}
function verifieScore(score: (r: readonly (number | undefined)[]) => number) {
  for (let bonnes = 0; bonnes <= 8; bonnes += 1) {
    // Les `bonnes` premières justes, les autres sur une option fausse.
    const reponses = maquette.questions.map((q, i) => (i < bonnes ? q.c : (q.c + 1) % 4));
    assert.equal(score(reponses), bonnes, `score faux pour ${bonnes} bonnes réponses`);
    const bande = maquette.paliers.find((b) => bonnes >= b[0]);
    assert.equal(palierDe(bonnes).titre, appliqueEcarts(bande![1]), `palier faux pour le score ${bonnes}`);
    assert.equal(palierDe(bonnes).couleur, bande![3], `couleur fausse pour le score ${bonnes}`);
  }
}
verifieScore(scoreDe);
{
  const sept = maquette.questions.map((q, i) => (i < 7 ? q.c : (q.c + 1) % 4));
  const six = maquette.questions.map((q, i) => (i < 6 ? q.c : (q.c + 1) % 4));
  const carte = (r: number[]) =>
    renderToStaticMarkup(<Resultat reponses={r} onRecommence={rien} refScore={createRef()} />).includes(
      "Ce score nous intéresse",
    );
  assert.ok(carte(sept), "à 7 bonnes réponses, la carte « Ce score nous intéresse » doit s'ouvrir");
  assert.ok(!carte(six), "à 6 bonnes réponses, la carte « Ce score nous intéresse » ne doit pas s'ouvrir");
}

// ------------------------------- 3. chaque texte du gabarit est rendu, rien d'inventé
const gabaritTextes = fragments(
  maquette.gabarit.replace(PHRASE_RETIREE.replace(" 48 h", " 48&nbsp;h"), ""),
)
  .filter((t) => !t.includes("{{"))
  .map(appliqueEcarts);
for (const [de] of ECARTS_GABARIT) {
  assert.equal(gabaritTextes.filter((t) => t === de).length, 1, `écart introuvable ou ambigu dans le gabarit : ${de}`);
}
for (const [de, vers] of ECARTS_GABARIT) gabaritTextes.splice(gabaritTextes.indexOf(de), 1, vers);
assert.ok(gabaritTextes.length > 50, "trop peu de textes lus dans le gabarit : la lecture a cassé");

function verifieGabarit(html: string) {
  const texte = fragments(html).join(" ");
  for (const fragment of gabaritTextes) {
    if (NON_RENDUS.has(fragment)) continue;
    assert.ok(texte.includes(fragment), `texte du gabarit absent du rendu : ${fragment}`);
  }
}
// Le sans-faute ouvre la carte de recrutement, l'autre parcours barre les choix.
verifieGabarit(HTML_HAUT + HTML_BAS);

const PERMIS = new Set([
  ...gabaritTextes,
  ...attendu.questions.flatMap((q) => [q.domaine, q.question, q.explication, ...q.options]),
  ...attendu.paliers.flatMap((p) => [p.titre, p.verdict]),
  "Sans réponse",
  "A", "B", "C", "D", "✓", "✕",
  COPIE_NOUVELLE.titre,
]);
const MOTIFS = [/^Question [1-8] \/ 8$/, /^0[1-8]$/, /^[0-8]$/, /^\/ 8$/];
function verifieRienInvente(html: string) {
  for (const t of fragments(sansFormulaire(html))) {
    assert.ok(PERMIS.has(t) || MOTIFS.some((m) => m.test(t)), `texte rendu absent de la maquette : ${t}`);
  }
}
verifieRienInvente(HTML_HAUT);
verifieRienInvente(HTML_BAS);
assert.ok(fragments(HTML_BAS).includes("Votre choix"), "une réponse fausse doit montrer « Votre choix » barré");
assert.ok(!fragments(HTML_HAUT).includes("Votre choix"), "un sans-faute ne doit montrer aucun « Votre choix »");

// ------------------------------------- 4. les écarts imposés, et seulement eux
function verifieInterdits(html: string) {
  const texte = fragments(html).join(" ");
  assert.ok(!/[—–]/.test(texte), "tiret cadratin ou demi-cadratin rendu");
  assert.ok(!/\b48\s*h|\b24\s*h|7\s*j?\s*\/\s*7/.test(texte), "délai chiffré rendu");
  assert.ok(!/régie|sur mesure|sans engagement|€/i.test(texte), "formulation interdite rendue");
}
assert.ok(maquette.gabarit.includes("—") && maquette.application.includes("clients — et nous recrutons"),
  "la maquette ne porte plus ses tirets cadratins : retirer les écarts devenus inutiles");
assert.ok(maquette.gabarit.includes("48&nbsp;h ouvrées"), "la maquette ne porte plus le délai de 48 h");
verifieInterdits(HTML_HAUT);
verifieInterdits(HTML_BAS);
assert.ok(!HTML_HAUT.includes("Quatre écrans de candidature"), "la phrase des 48 h ne se coupe pas : elle ne se rend pas du tout");

// ------------------------------------- 5. liens, titre, formulaire, confidentialité
assert.ok(!HTML_HAUT.includes('href="#"'), "lien inerte href=\"#\"");
assert.ok(HTML_HAUT.includes('href="/carriere/"'), "« Voir les postes ouverts » doit mener à /carriere/");
assert.ok(HTML_HAUT.includes('href="/carriere/#postuler"'), "« Postuler chez migen© » doit mener à /carriere/#postuler");
assert.ok(existsSync(new URL("../../../app/carriere/page.tsx", import.meta.url)), "la page /carriere/ n'existe plus");
assert.ok(
  renderToStaticMarkup(<PageHubCarriere contenu={HUB_CARRIERE} />).includes('id="postuler"'),
  "l'ancre #postuler n'existe plus sur /carriere/",
);
assert.ok(existsSync(new URL("../../../public/assets/web/mq-17e2f3bce95f.jpg", import.meta.url)), "photo absente");

const PAGE = renderToStaticMarkup(<Page />);
const h1 = PAGE.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) ?? [];
assert.equal(h1.length, 1, "la page doit porter un seul h1");
const titreH1 = fragments(h1[0]).join(" ");
assert.ok(typeof metadata.title === "string" && metadata.title.length > 0, "titre de page manquant");
assert.notEqual(metadata.title, titreH1, "le titre de page ne doit pas répéter le h1");
assert.ok(typeof metadata.description === "string" && metadata.description.length > 50, "description manquante");
assert.equal(metadata.alternates?.canonical, "/test-technicien/", "canonique faux");
assert.ok(ROUTES_STATIQUES.includes("/test-technicien/"), "/test-technicien/ absente de ROUTES_STATIQUES");
verifieInterdits(`<p>${metadata.title}</p><p>${metadata.description}</p>`);

/* Le formulaire : celui du reste du site (décision du 08/10), ses six champs
   obligatoires et l'indicatif du téléphone, sa mention RGPD, le titre de la
   carte sur le bouton, aucune promesse d'envoi. */
const CHAMPS_DU_SITE = ["entreprise", "nom", "prenom", "email", "indicatif", "telephone", "message"];
function verifieFormulaire(html: string) {
  const formulaires = html.match(/<form[\s\S]*?<\/form>/g) ?? [];
  assert.equal(formulaires.length, 1, "un seul formulaire attendu sur le résultat");
  const form = formulaires[0];
  assert.ok(form.includes('name="formulaire" value="test-technicien"'), "formulaire « test-technicien » absent");
  const saisies = [...form.matchAll(/<(?:input|textarea|select)\b[^>]*\bname="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((nom) => nom !== "formulaire" && nom !== "site_web");
  assert.deepEqual(saisies, CHAMPS_DU_SITE, `les champs du formulaire du site attendus, rendus : ${saisies.join(", ")}`);
  const requis = [...form.matchAll(/<(?:input|textarea)[^>]*\brequired\b[^>]*>/g)].length;
  assert.equal(requis, 6, "les six champs sont obligatoires");
  const bouton = form.match(/<button[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/);
  assert.equal(bouton?.[1], COPIE_NOUVELLE.titre, "le bouton reprend le titre de la carte");
  assert.ok(
    form.includes("Données traitées par Migen pour répondre à votre demande") && form.includes('href="/confidentialite/"'),
    "mention RGPD du formulaire absente",
  );
}
function verifiePromesses(html: string) {
  const texte = fragments(html).join(" ");
  for (const promesse of PROMESSES) {
    assert.ok(!texte.includes(promesse), `promesse d'envoi rendue : ${promesse}`);
  }
  assert.ok(!/fiches? métier|recevoir (le|mon|votre) corrigé/i.test(texte), "promesse d'envoi rendue");
}
const HTML_RESULTAT = renderToStaticMarkup(<Resultat reponses={BONNES} onRecommence={rien} refScore={createRef()} />);
verifieFormulaire(HTML_RESULTAT);
verifiePromesses(HTML_HAUT + HTML_BAS + PAGE);
assert.ok(fragments(HTML_RESULTAT).includes(COPIE_NOUVELLE.titre), "titre de la carte absent");

/* Le score ne quitte pas la page : aucun envoi, aucun stockage, aucune URL, et
   le formulaire ne reçoit que son identifiant et son libellé. */
for (const fichier of readdirSync(ICI).filter((f) => /\.tsx?$/.test(f) && !/verif|lecture/.test(f))) {
  const code = readFileSync(new URL(fichier, ICI), "utf8");
  assert.ok(
    !/fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|history\.|searchParams|router/.test(code),
    `${fichier} : le score ou les réponses pourraient quitter la page`,
  );
}
/* Le formulaire ne reçoit que son identifiant et le libellé de son bouton : ni
   le score, ni les réponses, ni une variante qui le distinguerait de celui du
   reste du site. */
function verifieAppel(source: string) {
  const appels = source.match(/<FormulaireContact\b[\s\S]*?\/>/g) ?? [];
  assert.equal(appels.length, 1, "un seul formulaire dans Resultat.tsx");
  const proprietes = [...appels[0].matchAll(/(\w+)=/g)].map((m) => m[1]);
  assert.deepEqual(proprietes, ["formulaire", "libelleEnvoi"], "le formulaire reçoit autre chose que son identifiant et son libellé");
  assert.match(appels[0], /formulaire="test-technicien"/, "identifiant du formulaire");
}
const SOURCE_RESULTAT = readFileSync(new URL("Resultat.tsx", ICI), "utf8");
verifieAppel(SOURCE_RESULTAT);
verifieInterdits(`<p>${Object.values(COPIE_NOUVELLE).join("</p><p>")}</p>`);

// ------------------------------------------------- il sait échouer
const faussee = structuredClone(attendu);
faussee.questions[4].explication += " Phrase inventée.";
assert.throws(() => verifieDonnees(faussee, attendu), "une explication modifiée doit être vue");
const permutee = structuredClone(attendu);
permutee.questions[0].bonne = 0;
assert.throws(() => verifieDonnees(permutee, attendu), "une bonne réponse déplacée doit être vue");
assert.throws(() => verifieScore(() => 0), "un score mal calculé doit être vu");
assert.throws(
  () => verifieGabarit((HTML_HAUT + HTML_BAS).replaceAll("Le vrai processus, en six étapes", "")),
  "un texte du gabarit manquant doit être vu",
);
assert.throws(() => verifieRienInvente(`${HTML_HAUT}<p>Texte de remplissage</p>`), "un texte inventé doit être vu");
assert.throws(() => verifieInterdits("<p>un tiret — cadratin</p>"), "un tiret cadratin doit être vu");
assert.throws(() => verifieInterdits("<p>une réponse sous 48 h</p>"), "un délai chiffré doit être vu");
assert.throws(
  () => verifieFormulaire(HTML_RESULTAT.replace(/<textarea[\s\S]*?<\/textarea>/, "")),
  "un formulaire réduit (champ retiré) doit être vu",
);
assert.throws(
  () => verifieFormulaire(HTML_RESULTAT.replace("Données traitées par Migen", "Données")),
  "une mention RGPD retirée doit être vue",
);
assert.throws(
  () => verifieFormulaire(HTML_RESULTAT.replace(`>${COPIE_NOUVELLE.titre}</button>`, ">Recevoir mon corrigé</button>")),
  "un bouton qui promet le corrigé doit être vu",
);
assert.throws(() => verifiePromesses(`${HTML_RESULTAT}<p>${PROMESSES[0]}</p>`), "une promesse d'envoi doit être vue");
assert.throws(
  () => verifieAppel(SOURCE_RESULTAT.replace('formulaire="test-technicien"', 'formulaire="test-technicien" score={score}')),
  "un score passé au formulaire doit être vu",
);
assert.throws(
  () => verifieAppel(SOURCE_RESULTAT.replace('formulaire="test-technicien"', 'formulaire="test-technicien" variante="panneau"')),
  "une variante du formulaire doit être vue",
);

console.log(
  `test technicien : 8 questions, ${PALIERS.length} paliers et ${gabaritTextes.length} textes du gabarit conformes ` +
    `à la maquette (${ECARTS_SCRIPT.length} tirets cadratins remplacés, 1 délai retiré, ` +
    `${PROMESSES.length} promesses d'envoi retirées, ${Object.keys(COPIE_NOUVELLE).length} textes nouveaux déclarés), ` +
    "liens, titre, formulaire du site (six champs, mention RGPD) et confidentialité vérifiés ; 13 fautes injectées, 13 vues.",
);
