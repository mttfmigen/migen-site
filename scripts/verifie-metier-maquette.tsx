/**
 * Les 13 fiches MÉTIER sont-elles celles du GABARIT 07, avec tout leur texte ?
 *
 *   bun scripts/verifie-metier-maquette.tsx
 *   bun scripts/verifie-metier-maquette.tsx --faute valeur-maquette
 *   bun scripts/verifie-metier-maquette.tsx --faute interdit
 *   bun scripts/verifie-metier-maquette.tsx --faute lien
 *   bun scripts/verifie-metier-maquette.tsx --faute corpus
 *   bun scripts/verifie-metier-maquette.tsx --faute section-vide
 *   bun scripts/verifie-metier-maquette.tsx --faute deux-h1
 *   bun scripts/verifie-metier-maquette.tsx --faute tailwind
 *
 * CE QU'IL VÉRIFIE, et pourquoi chaque point est là.
 *
 *   1. LES VALEURS DE LA MAQUETTE SONT RELUES dans `maquette/gabarit-07-metier.html`
 *      à chaque exécution, jamais écrites ici. Seule la CLÉ de recherche est
 *      écrite ; la valeur attendue vient du fichier. Une note de lecture prise
 *      une fois peut se tromper et personne ne peut la rejouer. C'est ce contrôle
 *      qui manquait : le portage précédent lisait « Site final », et rien ne
 *      disait que ce n'était pas le bon fichier.
 *   2. LES CINQ SECTIONS de la maquette sont là, dans son ordre, et les sections
 *      que « Site final » dessinait et qu'elle NE dessine PAS sont absentes.
 *   3. UN SEUL H1. Le titre est porté par `pages.titre_h1` ; un second H1 serait
 *      une faute de structure.
 *   4. AUCUN `href="#"`. La maquette navigue par sa propre logique, qui n'est pas
 *      portée : recopier ses ancres creuses donnerait des boutons morts.
 *   5. AUCUNE classe Tailwind de couleur, AUCUNE variante `dark:`. La charte vit
 *      dans les jetons de `app/globals.css` et le site n'a pas de mode sombre.
 *   6. LES INTERDITS DE COPIE du contrat, cherchés dans le rendu ET dans les 13
 *      fichiers de donnée.
 *   7. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT, titre compris.
 *   8. LE CORPUS N'EST PAS PERDU : chaque bloc du corpus est retrouvé dans la
 *      donnée produite, au bloc près.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageMetier from "@/components/site/metier/PageMetier";
import { estMetierOuDomaine, type ContenuMetier } from "@/types/metier";

type Metier = Extract<ContenuMetier, { gabarit: "metier" }>;

const FAUTES = [
  "valeur-maquette",
  "interdit",
  "lien",
  "corpus",
  "section-vide",
  "deux-h1",
  "tailwind",
] as const;

const FAUTE = (() => {
  const i = process.argv.indexOf("--faute");
  if (i < 0) return null;
  const quoi = process.argv[i + 1] as (typeof FAUTES)[number];
  assert.ok(FAUTES.includes(quoi), `--faute attend ${FAUTES.join(", ")}`);
  return quoi;
})();

const DOSSIER = "supabase/import/gabarits-maquette";
const CORPUS = "supabase/import/editorial-analyse.json";
const maquette = readFileSync("maquette/gabarit-07-metier.html", "utf8");

/**
 * Comparaison sur un texte NORMALISÉ.
 *
 * La maquette écrit `&nbsp;`, `&check;` et `&rarr;` ; React rend l'insécable et
 * les flèches en caractères. Sans cette normalisation, deux textes identiques à
 * l'œil échouent. Les suites d'espaces sont resserrées sur `[ \t\n\r]` et jamais
 * sur `\s`, qui en JavaScript avale aussi l'insécable.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&check;/g, "✓")
    .replace(/&rarr;/g, "→")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/[’‘]/g, "'")
    .replace(/[ \t\n\r]+/g, " ");
}

/** La valeur que la maquette écrit pour cette clé, ou l'échec du contrôle. */
function valeurMaquette(cle: RegExp, quoi: string): string {
  const trouve = maquette.match(cle);
  assert.ok(trouve?.[1], `maquette : ${quoi} introuvable (${cle})`);
  return trouve[1];
}

/* ------------------------------------------- 1. ce que la maquette dit vraiment */

/** Les `data-screen-label` du `main`, dans l'ordre du fichier. */
const SECTIONS_MAQUETTE = [...maquette.matchAll(/data-screen-label="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((nom) => nom !== "Gabarit 07 Métier et carrière");

assert.deepEqual(
  SECTIONS_MAQUETTE,
  ["Héros", "Corps", "Questions", "Maillage", "Candidater"],
  "maquette : les cinq sections du gabarit 07 ne sont pas celles attendues — " +
    "si elle a changé, c'est ce contrôle et le composant qu'il faut mettre à jour",
);

/** Les libellés que la maquette fixe, relus dans son HTML. */
const MOBILIER = {
  // La pastille du héros : le texte du `span` qui suit la puce orange.
  pastille: valeurMaquette(
    /background:var\(--acc\)"><\/span>([^<]+)<\/span>/,
    "la pastille du héros",
  ),
  sommaire: valeurMaquette(/color:var\(--ink4\);margin-bottom:12px">([^<]+)</, "« Sommaire »"),
  questions: valeurMaquette(
    /text-transform:uppercase;color:var\(--acc\);margin-bottom:14px">([^<]+)</,
    "le surtitre des questions",
  ),
  maillage: valeurMaquette(
    /<h2[^>]*margin:0 0 26px">([^<]+)<\/h2>/,
    "le H2 du maillage",
  ),
  rejoindre: valeurMaquette(
    /text-transform:uppercase;color:var\(--acc\);margin-bottom:16px">([^<]+)</,
    "le surtitre du panneau de fin",
  ),
  telephone: valeurMaquette(/white-space:nowrap">(0\d(?: \d\d){4})</, "le téléphone"),
  horaires: valeurMaquette(
    /color:rgba\(255,255,255,\.64\)">([^<]+)</,
    "la ligne d'horaires du panneau",
  ),
  photoHero: valeurMaquette(/<img src="assets\/web\/([a-z-]+)\.jpg" alt="Technicien/, "la photo du héros"),
  altHero: valeurMaquette(/team-grind-front\.jpg" alt="([^"]+)"/, "l'alternative de la photo"),
};

/** Les mesures que la maquette écrit, et que le rendu doit porter telles quelles. */
const MESURES = {
  hauteurPhoto: valeurMaquette(/overflow:hidden;height:(\d+)px;background:#dedfe1/, "la hauteur de la photo"),
  sommaireColle: valeurMaquette(/position:sticky;top:(\d+)px;border-radius:var\(--rad\)/, "le collage du sommaire"),
  colonnesCorps: valeurMaquette(
    /grid-template-columns:(240px minmax\(0,1fr\));gap:56px/,
    "les colonnes du corps",
  ),
  h1: valeurMaquette(/font:600 calc\((clamp\(36px,4\.4vw,62px)\) \* var\(--ts\)\)\/1\.04/, "l'échelle du H1"),
  numero: valeurMaquette(/font:600 (11px ui-monospace,Menlo,monospace);color:var\(--acc\);margin-bottom:12px/, "le numéro de section"),
  panneau: valeurMaquette(/border-radius:(40px);background:var\(--panel\);padding:60px 56px/, "le panneau de fin"),
};

/* ----------------------------------- 2. la donnée produite, lue et confrontée */

const fichiers = readdirSync(DOSSIER)
  .filter((f) => f.startsWith("carriere-") && f.endsWith(".json"))
  .sort();
assert.ok(fichiers.length > 0, `aucune fiche métier dans ${DOSSIER}`);

const CLES = ["gabarit", "chapo", "corps", "faq", "liens"];

const fiches: { url: string; h1: string; contenu: Metier }[] = [];
for (const nom of fichiers) {
  const brut = JSON.parse(readFileSync(`${DOSSIER}/${nom}`, "utf8")) as Record<string, unknown>;
  assert.ok(
    typeof brut.url === "string" && /^\/carriere\/[a-z-]+\/([a-z-]+\/)?$/.test(brut.url),
    `${nom} : url /carriere/<metier>/[<sous-page>/] attendue`,
  );
  assert.ok(estMetierOuDomaine(brut.contenu), `${nom} : gabarit « metier » attendu`);
  const c = brut.contenu as unknown as Record<string, unknown>;
  assert.equal(c.gabarit, "metier", `${nom} : gabarit « metier » attendu`);
  for (const k of Object.keys(c)) {
    assert.ok(CLES.includes(k), `${nom} : clé « ${k} » inconnue de types/metier.ts`);
  }
  // Les champs du gabarit « Site final » ne doivent PLUS être là : leur présence
  // voudrait dire que la donnée a été produite depuis le mauvais fichier.
  for (const mort of ["missions", "competences", "habilitations", "autres", "cta", "chapeau", "boutons"]) {
    assert.ok(!(mort in c), `${nom} : « ${mort} » vient du gabarit « Site final », pas du 07`);
  }
  assert.ok(Array.isArray(c.corps) && c.corps.length > 0, `${nom} : aucune section de corps`);
  fiches.push({ url: brut.url, h1: String(brut.h1), contenu: brut.contenu as Metier });
}

/* ------------------------------------- 3. la numérotation et le sommaire tiennent */

for (const { url, contenu } of fiches) {
  const corps = contenu.corps ?? [];
  corps.forEach((section, i) => {
    assert.equal(section.id, `s${i + 1}`, `${url} : ancre de section hors d'ordre`);
    assert.equal(
      section.numero,
      String(i + 1).padStart(2, "0"),
      `${url} : numéro de section hors d'ordre`,
    );
    assert.ok(section.blocs.length > 0, `${url} : section ${section.id} vide`);
    // Un titre de niveau 2 au fil du texte doublerait le H2 de la section.
    for (const bloc of section.blocs) {
      assert.ok(
        !(bloc.type === "titre" && bloc.niveau === 2),
        `${url} : un titre de niveau 2 est resté dans les blocs de ${section.id}`,
      );
    }
  });
  const sansTitre = corps.filter((s) => !s.titre);
  assert.ok(sansTitre.length <= 1, `${url} : plus d'une section sans titre`);
  if (sansTitre.length === 1) {
    assert.equal(sansTitre[0].id, "s1", `${url} : la section sans titre doit ouvrir le corps`);
  }
}

/* -------------------------------- 4. le corpus n'est pas perdu, au bloc près */

const corpus = new Map(
  (JSON.parse(readFileSync(CORPUS, "utf8")) as { url: string; contenu: { blocs?: unknown[] } }[])
    .filter((e) => Array.isArray(e.contenu?.blocs))
    .map((e) => [e.url, e.contenu.blocs!.length]),
);

for (const { url, contenu } of fiches) {
  const attendu = corpus.get(url);
  assert.ok(attendu !== undefined, `${url} : page absente du corpus analysé`);
  const corps = contenu.corps ?? [];
  const faq = contenu.faq;
  const compte =
    // Le chapeau du corpus n'est pas un bloc : il est compté à part.
    (contenu.chapo?.length ?? 0) -
    1 +
    // Les titres des sections titrées étaient des blocs `titre` de niveau 2.
    corps.filter((s) => s.titre).length +
    corps.reduce((t, s) => t + s.blocs.length, 0) +
    // Le titre de la foire aux questions, puis une question par bloc.
    (faq ? 1 + faq.questions.length : 0) +
    (faq?.questions.reduce((t, q) => t + q.reponse.length, 0) ?? 0) -
    // Chaque question portait sa réponse dans LE MÊME bloc que son intitulé :
    // le paragraphe de tête de sa réponse n'est donc pas un bloc de plus.
    (faq?.questions.filter((q) => q.reponse.length > 0).length ?? 0) +
    (faq?.intro?.length ?? 0);
  assert.equal(
    compte,
    attendu,
    `${url} : ${compte} blocs retrouvés pour ${attendu} au corpus — du texte rédigé a été perdu`,
  );
}

/* ----------------------------------------------- 5. le rendu de la page témoin */

const temoin = fiches.find((f) => f.url === "/carriere/technicien-de-maintenance/") ?? fiches[0];
let contenu: Metier = temoin.contenu;

if (FAUTE === "interdit") {
  contenu = { ...contenu, chapo: [...(contenu.chapo ?? []), "Une intervention clé en main."] };
}
if (FAUTE === "lien") {
  contenu = {
    ...contenu,
    liens: [{ libelle: "Nulle part", url: "#", nature: "Carrière" }, ...(contenu.liens ?? [])],
  };
}
if (FAUTE === "corpus") {
  contenu = { ...contenu, corps: (contenu.corps ?? []).slice(0, -1) };
}

let rendu = renderToStaticMarkup(<PageMetier titre={temoin.h1} contenu={contenu} />);
if (FAUTE === "valeur-maquette") {
  rendu = rendu.replace(`height:${MESURES.hauteurPhoto}px`, "height:380px");
}
if (FAUTE === "deux-h1") rendu = rendu.replace("</main>", "<h1>Doublon</h1></main>");
if (FAUTE === "tailwind") {
  rendu = rendu.replace('class="mg-site"', 'class="mg-site text-zinc-500 dark:bg-black"');
}

const plat = normalise(rendu);

// 5a. Le mobilier de la maquette est rendu, tel qu'elle l'écrit.
for (const [quoi, attendu] of Object.entries(MOBILIER)) {
  if (quoi === "photoHero") {
    assert.ok(
      plat.includes(`/assets/web/${attendu}.jpg`),
      `rendu : la photo du héros « ${attendu} » de la maquette est absente`,
    );
    continue;
  }
  assert.ok(
    plat.includes(normalise(attendu).trim()),
    `rendu : « ${attendu} » est écrit dans la maquette et manque au rendu`,
  );
}

// 5b. Les mesures de la maquette sont rendues, à la valeur près.
assert.ok(plat.includes(`height:${MESURES.hauteurPhoto}px`), "rendu : hauteur de la photo du héros");
assert.ok(plat.includes(`top:${MESURES.sommaireColle}px`), "rendu : collage du sommaire");
assert.ok(
  plat.includes(`grid-template-columns:${MESURES.colonnesCorps}`),
  "rendu : colonnes du corps",
);
assert.ok(plat.includes(MESURES.h1), "rendu : échelle du H1");
assert.ok(plat.includes(MESURES.numero), "rendu : chasse du numéro de section");
assert.ok(plat.includes(`border-radius:${MESURES.panneau}`), "rendu : arrondi du panneau de fin");

// 5c. Ce que « Site final » dessinait et que le gabarit 07 ne dessine PAS.
for (const absent of [
  "MISSIONS",
  "Compétences attendues",
  "Habilitations utiles",
  "Autres métiers",
  "Sur cette page",
  "vous manque sur votre site",
]) {
  assert.ok(
    !plat.toUpperCase().includes(absent.toUpperCase()),
    `rendu : « ${absent} » vient du gabarit « Site final », le 07 ne le dessine pas`,
  );
}

// 5d. Un seul H1, aucune ancre creuse, aucune classe de couleur Tailwind.
assert.equal((rendu.match(/<h1\b/g) ?? []).length, 1, "rendu : un seul H1 attendu");
assert.equal((rendu.match(/href="#"/g) ?? []).length, 0, "rendu : aucun href=\"#\" attendu");
assert.ok(!/\bdark:/.test(rendu), "rendu : aucune variante dark: — le site n'a pas de mode sombre");
assert.ok(
  !/class="[^"]*\b(?:text|bg|border|from|to|via)-(?:zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
    rendu,
  ),
  "rendu : aucune classe Tailwind de couleur — la charte vit dans les jetons",
);

// 5e. Le sommaire liste EXACTEMENT les sections titrées, par leur numéro.
for (const section of contenu.corps ?? []) {
  if (!section.titre) continue;
  assert.ok(
    plat.includes(`href="#${section.id}"`),
    `rendu : ${section.id} manque au sommaire`,
  );
  assert.ok(plat.includes(normalise(section.titre)), `rendu : « ${section.titre} » manque`);
}

/* ---------------------------------------------------- 6. les interdits du contrat */

const INTERDITS: [RegExp, string][] = [
  [/\+\s?200|200 clients/, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/(cinq|5) agences/i, "quatre agences : Lyon siège à Limonest, Montréal, Dubaï, Madrid"],
  [/sous (?:24|48|72|2|4) ?h/i, "« rappel dans l'heure », aucun autre délai chiffré"],
  [/(?:heures?|h) de route/i, "aucun délai ni distance chiffrés"],
  [/24\s*\/\s*24|7\s*\/\s*7|7\s*j\s*\/\s*7|7 jours sur 7/i, "aucune promesse de disponibilité"],
  [/\brégie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bintérim/i, "nommer la prestation, jamais le statut"],
  [/mise à disposition/i, "« intervention » ou « mission »"],
  [/sans engagement/i, "dire la durée réelle, ou ne rien dire"],
  [/clé en main/i, "dire ce qui est fait"],
  [/sur mesure/i, "dire ce qui s'adapte, et à quoi"],
  [/\bleviers?\b/i, "dire l'effet obtenu"],
  [/concrètement/i, "à supprimer"],
  [/notamment/i, "à supprimer, ou « dont »"],
  [/incontournable/i, "à supprimer"],
  [/découvrez/i, "un verbe qui dit ce que la page fait"],
  [/—/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
];

/** Le texte visible du rendu, balises retirées. */
const visible = normalise(rendu.replace(/<[^>]+>/g, " "));
for (const [motif, remede] of INTERDITS) {
  assert.ok(!motif.test(visible), `rendu : formulation interdite ${motif} — ${remede}`);
}
for (const { url, contenu: c } of fiches) {
  const texte = normalise(JSON.stringify(c));
  for (const [motif, remede] of INTERDITS) {
    assert.ok(!motif.test(texte), `${url} : formulation interdite ${motif} — ${remede}`);
  }
}

/* ------------------------- 7. une section sans donnée ne se rend pas du tout */

let creux = renderToStaticMarkup(
  <PageMetier titre="Fiche sans matière" contenu={{ gabarit: "metier" }} />,
);
if (FAUTE === "section-vide") {
  creux = creux.replace("</main>", `<p>${MOBILIER.questions}</p></main>`);
}
const platCreux = normalise(creux);
for (const [quoi, libelle] of [
  ["sommaire", MOBILIER.sommaire],
  ["questions", MOBILIER.questions],
  ["maillage", MOBILIER.maillage],
] as const) {
  assert.ok(
    !platCreux.includes(normalise(libelle).trim()),
    `rendu creux : la section « ${quoi} » se rend sans donnée — vide vaut moins qu'absent`,
  );
}
assert.equal((creux.match(/<h2\b/g) ?? []).length, 0, "rendu creux : aucun H2 attendu");
assert.equal((creux.match(/<h1\b/g) ?? []).length, 1, "rendu creux : le H1 reste");
// Le panneau de candidature, lui, n'a pas de condition dans la maquette.
assert.ok(
  platCreux.includes(normalise(MOBILIER.rejoindre).trim()),
  "rendu creux : le panneau de fin est inconditionnel dans la maquette",
);

/* ------------------------------------------------------------------- conclusion */

console.log(`13 fiches attendues, ${fiches.length} lues dans ${DOSSIER}`);
console.log(`sections de la maquette : ${SECTIONS_MAQUETTE.join(" · ")}`);
console.log(
  `mobilier relu dans la maquette : ${Object.values(MOBILIER).map((v) => `« ${v.trim()} »`).join(", ")}`,
);
console.log(
  `mesures relues : photo ${MESURES.hauteurPhoto}px, sommaire collé à ${MESURES.sommaireColle}px, ` +
    `colonnes ${MESURES.colonnesCorps}, panneau ${MESURES.panneau}`,
);
console.log("gabarit 07 conforme : dessin de la maquette, texte du corpus, rien d'inventé");
