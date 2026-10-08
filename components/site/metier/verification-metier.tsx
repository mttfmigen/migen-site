/**
 * Contrôle du gabarit 07 « MÉTIER ET CARRIÈRE », sans navigateur.
 *
 *   bun components/site/metier/verification-metier.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * page par page dans `maquette/rendu/carriere--*.html` (CLAUDE.md §16). Les
 * deux pilotes sont `/carriere/automaticien/` et
 * `/carriere/technicien-de-maintenance/` ; les onze autres pages passent les
 * mêmes contrôles, la liste étant déduite de l'index de la maquette.
 *
 * CE QUE CE CONTRÔLE GARANTIT, sur le modèle de `verification-offre.tsx` :
 *
 * 0. IL SAIT ÉCHOUER, et il le prouve à chaque exécution : une copie absente
 *    de la capture, un dessin absent, un tiret cadratin injecté doivent chacun
 *    faire échouer leur vérification AVANT que les vraies ne commencent. Un
 *    contrôle qui ne sait pas échouer ne contrôle rien.
 * 1. LES VALEURS DE LA CAPTURE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire : chaque dessin et chaque copie du gabarit sont
 *    d'abord vérifiés PRÉSENTS dans la capture, puis dans le rendu.
 * 2. LA PAGE RÉELLE est rendue depuis sa vraie donnée,
 *    `supabase/import/gabarits-maquette/carriere-*.json`, celle que la route
 *    sert par le relais disque.
 * 3. UN SEUL H1 par page, aucun `href="#"`, les appels visent `#postuler`.
 * 4. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`.
 * 5. LES INTERDITS DE COPIE du contrat (CLAUDE.md §9) sont absents du rendu,
 *    tiret cadratin compris.
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS.
 * 7. MOT POUR MOT : pour CHACUNE des 13 pages, le chapeau et chaque titre de
 *    section du fichier de données sont retrouvés dans la capture DE CETTE
 *    PAGE. Un synonyme, une reformulation, une donnée inventée échouent ici.
 * 8. LES SURVOLS relevés dans les `style-hover` de la maquette sont déclarés
 *    dans le module CSS, avec `:focus-visible` à chaque fois (WCAG 2.4.7).
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { estMetier, type ContenuFicheMetier } from "@/types/metier";

import PageFicheMetier from "./PageFicheMetier";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const RENDU_MAQUETTE = join(RACINE, "maquette", "rendu");

/* ----------------------------------------- les captures, relues à chaque fois */

/** `/carriere/automaticien/salaire/` → `carriere--automaticien--salaire.html`,
 *  décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
function capturePour(url: string): string {
  return appliqueDecisions(
    readFileSync(join(RENDU_MAQUETTE, `${url.replace(/^\/|\/$/g, "").replace(/\//g, "--")}.html`), "utf8"),
  );
}

const PILOTES = ["/carriere/automaticien/", "/carriere/technicien-de-maintenance/"];
const CAPTURE = capturePour(PILOTES[0]);
const CAPTURE_2 = capturePour(PILOTES[1]);

/**
 * Un style ramené à une écriture comparable des deux côtés : la capture
 * sérialise le DOM (`1.08fr 0.92fr`, `minmax(0px, 1fr)`), React rend la
 * déclaration compacte (`1.08fr .92fr`, `minmax(0,1fr)`).
 */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/**
 * Un texte ramené à l'écriture du dépôt : espace simple, apostrophe droite,
 * et AUCUNE espace avant un point ou une virgule. Cette dernière règle absorbe
 * l'artefact du retrait des balises : « <a>fiche métier</a>. » devient
 * « fiche métier . » une fois les balises remplacées par des espaces, alors
 * que la donnée écrit « fiche métier. ». Même règle des deux côtés.
 */
function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|’/g, "'")
    .replace(/\s+/g, " ")
    .replace(/ ([.,])/g, "$1");
}

/** Le texte lisible d'un HTML, balises retirées puis normalisé. */
function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/** Un texte de donnée, liens Markdown ramenés à leur libellé. */
function sansMarkdown(texte: string): string {
  return normaliseTexte(texte.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"));
}

const CAPTURE_STYLE = normaliseStyle(CAPTURE);
const CAPTURE_TEXTE = texteLisible(CAPTURE);
const CAPTURE_2_TEXTE = texteLisible(CAPTURE_2);

/** Une valeur de dessin, d'abord vérifiée dans la capture, puis dans le rendu. */
function dessinCapture(rendu: string, fragment: string): void {
  const attendu = normaliseStyle(fragment);
  assert.ok(
    CAPTURE_STYLE.includes(attendu),
    `la capture ne porte pas le dessin « ${fragment} » : valeur à revérifier`,
  );
  assert.ok(
    normaliseStyle(rendu).includes(attendu),
    `le rendu ne porte pas le dessin de la capture « ${fragment} »`,
  );
}

/**
 * Une copie fixe du gabarit : vérifiée dans les DEUX captures pilotes (elle
 * est fixe, donc identique sur les 13 pages), puis dans le rendu.
 */
function copieCapture(rendu: string, texte: string): void {
  const attendu = normaliseTexte(texte);
  assert.ok(
    CAPTURE_TEXTE.includes(attendu),
    `la capture du pilote 1 ne porte pas la copie « ${texte} »`,
  );
  assert.ok(
    CAPTURE_2_TEXTE.includes(attendu),
    `la capture du pilote 2 ne porte pas la copie « ${texte} » : copie pas fixe, à retirer d'ici`,
  );
  assert.ok(
    texteLisible(rendu).includes(attendu),
    `le rendu ne porte pas la copie de la capture « ${texte} »`,
  );
}

/* ----------------------------------------------- les interdits du contrat */

const INTERDITS = [
  "—",
  "cinq agences",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
] as const;

function verifieInterdits(page: string, nom: string): void {
  const visible = texteLisible(page).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

/* --------------------- 0. le contrôle sait échouer, et il le prouve d'abord */

assert.throws(
  () => copieCapture("<p>rien</p>", "cette phrase n'existe dans aucune capture"),
  /ne porte pas la copie/,
  "copieCapture a accepté une copie absente : le contrôle ne contrôle rien",
);
assert.throws(
  () => dessinCapture("<div></div>", "grid-template-columns: 999fr 666fr"),
  /ne porte pas le dessin/,
  "dessinCapture a accepté un dessin absent : le contrôle ne contrôle rien",
);
assert.throws(
  () => verifieInterdits("<p>un tiret — cadratin</p>", "preuve"),
  /mot proscrit/,
  "verifieInterdits a laissé passer un tiret cadratin : le contrôle ne contrôle rien",
);
console.log(
  "0 · le contrôle sait échouer : copie absente, dessin absent et tiret cadratin ont chacun été refusés.",
);

/* ------------------------------- la page réelle, telle que la route la sert */

const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuFicheMetier;
}

function litPage(nom: string): PageRelais {
  return JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais;
}

/** `/carriere/automaticien/salaire/` → `carriere-automaticien-salaire.json` */
function fichierDe(url: string): string {
  return `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "index"}.json`;
}

const AUTOMATICIEN = litPage(fichierDe(PILOTES[0]));
assert.equal(AUTOMATICIEN.titre_h1, "Automaticien", "le pilote porte le H1 de la capture");

const rendu = renderToStaticMarkup(
  <PageFicheMetier titre={AUTOMATICIEN.titre_h1!} contenu={AUTOMATICIEN.contenu} />,
);

/* ------------------------------------------ 1. la fidélité du dessin, section
   par section, une valeur porteuse chacune, relevée dans la capture pilote */

for (const fragment of [
  // Héros : la grille à deux colonnes, le H1 à 64px, la carte flottante.
  "padding: 40px 40px 0px",
  "grid-template-columns: 1.08fr 0.92fr",
  "clamp(38px,4.6vw,64px)",
  // Chiffres : quatre cartes de verre, valeur à 28px.
  "padding: 84px 40px 0px",
  "grid-template-columns: repeat(4, minmax(0px, 1fr))",
  "font: 600 calc(28px * var(--ts))/1 var(--ft)",
  // Bento : la carte sombre et son halo orange.
  "radial-gradient(circle, rgba(255, 124, 60, 0.3)",
  // Liste numérotée : le rail pastille + texte.
  "grid-template-columns: 36px minmax(0px, 1fr)",
  // Tableau : la grille .9fr/1.1fr de ses rangs.
  "minmax(0px, 0.9fr) minmax(0px, 1.1fr)",
  // Questions : la colonne collante .8fr/1.2fr.
  "minmax(0px, 0.8fr) minmax(0px, 1.2fr)",
  // Postuler : le panneau sombre, sa grille .85fr/1.15fr, l'ancre décalée.
  "grid-template-columns: 0.85fr 1.15fr",
  "scroll-margin-top: 90px",
  // Les boutons-pilules, partout.
  "border-radius: 999px",
]) {
  dessinCapture(rendu, fragment);
}

/* ------------------------------ 2. les copies fixes du gabarit, mot pour mot,
   vérifiées identiques sur les deux pilotes avant d'être exigées du rendu */

for (const texte of [
  // Héros : la pastille, les deux boutons.
  "Métier",
  "Postuler",
  "04 78 33 72 05",
  // Questions : le bouton d'appel de la colonne collante.
  "Poser ma question",
  // Postuler : surtitre, H2, chapeau, coches, champs, bouton d'envoi.
  "Rejoindre Migen",
  "Décrivez votre profil. Un recruteur vous rappelle, puis un test technique et un entretien comportemental suivent.",
  "CDI, alternance ou stage",
  "Salaire annoncé en brut, sans coefficient caché",
  "Un référent dès le premier jour",
  "Prétentions salariales",
  "CV et habilitations (PDF)",
  "Envoyer ma candidature",
  // Maillage de fin.
  "Pour aller plus loin",
]) {
  copieCapture(rendu, texte);
}

/* --------------------------------------------------------- 3. un seul h1 */

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);
assert.ok(rendu.includes("Automaticien"), "le titre de la page doit être rendu dans le h1");

/* ----------------------------------------------- 4. aucune cible morte */

assert.ok(
  !/href="#"/.test(rendu),
  'aucun href="#" : la maquette navigue par script, le site par ancres réelles',
);
assert.ok(
  rendu.includes('href="#postuler"') && rendu.includes('id="postuler"'),
  "les appels à l'action visent l'ancre du formulaire, et l'ancre existe",
);
assert.ok(
  rendu.includes('href="tel:+33478337205"'),
  "le bouton téléphone appelle le standard de la capture",
);
// Les cartes « Pour aller plus loin » du pilote : chaque cible de la donnée
// est rendue (hors requête, `Link` rend la cible sans slash final).
for (const section of AUTOMATICIEN.contenu.sections) {
  if (section.type !== "liens") continue;
  for (const item of section.items) {
    const nu = item.href.replace(/\/$/, "");
    assert.ok(
      rendu.includes(`href="${nu}/"`) || rendu.includes(`href="${nu}"`),
      `le maillage de la donnée vise ${item.href} : lien absent du rendu`,
    );
  }
}

/* ------------------------------------------ 5. aucun échafaudage Tailwind */

for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : « ${classe[1]} ». La charte vit dans les jetons de app/globals.css`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante dark: dans le rendu : « ${classe[1]} ». Le site n'a pas de mode sombre`,
  );
}

/* ----------------------------------------- 6. les interdits de copie */

verifieInterdits(rendu, fichierDe(PILOTES[0]));

/* ------------------------- 7. une section sans donnée ne se rend pas */

const VIDE: ContenuFicheMetier = {
  gabarit: "metier",
  heros: { pastille: "", chapeau: "" },
  sections: [],
};
const renduVide = renderToStaticMarkup(
  <PageFicheMetier titre="Un titre seul" contenu={VIDE} />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
for (const absent of [
  "repeat(4,minmax(0,1fr))", // pas de chiffres
  "Pour aller plus loin", // pas de cartes de maillage
  "Rejoindre Migen", // pas de formulaire sans section postuler
  "Poser ma question", // pas de questions
]) {
  assert.ok(
    !normaliseTexte(normaliseStyle(renduVide)).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

/* ------------------- 8. les 13 pages réelles, mot pour mot contre LEUR capture

   LA LISTE SE DÉDUIT DE L'INDEX DE LA MAQUETTE, elle ne s'écrit pas à la main :
   un nombre figé ne voit pas une page arriver, un préfixe de fichier ne voit
   pas une page rangée ailleurs (leçon du gabarit 03, verification-offre.tsx §8). */

const INDEX_MAQUETTE = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
) as { url: string; gabarit?: string }[];

const URLS_GABARIT_07 = INDEX_MAQUETTE.filter((p) =>
  (p.gabarit ?? "").startsWith("07"),
)
  .map((p) => p.url)
  .sort();

assert.ok(
  URLS_GABARIT_07.length > 0,
  "l'index de la maquette ne déclare aucune page au gabarit 07 : index illisible ou champ renommé",
);

const surDisque = new Set(readdirSync(DOSSIER).filter((n) => n.endsWith(".json")));
const manquantes = URLS_GABARIT_07.map(fichierDe).filter((n) => !surDisque.has(n));
assert.deepEqual(
  manquantes,
  [],
  `pages du gabarit 07 sans fichier de données dans ${DOSSIER} : ${manquantes.join(", ")}`,
);

let probes = 0;
for (const url of URLS_GABARIT_07) {
  const nom = fichierDe(url);
  const page = litPage(nom);

  assert.ok(
    estMetier(page.contenu),
    `${nom} : le contenu doit passer estMetier (gabarit « metier », heros, sections), sinon la route retombe sur un autre gabarit`,
  );

  const captureTexte = texteLisible(capturePour(url));

  // Le H1 de la donnée est celui de la capture, mot pour mot.
  assert.ok(
    captureTexte.includes(normaliseTexte(page.titre_h1 ?? "")),
    `${nom} : le H1 « ${page.titre_h1} » n'est pas dans la capture de ${url}`,
  );

  // Le chapeau et chaque titre de section, mot pour mot dans SA capture :
  // un synonyme, une coupe ou une invention échouent ici.
  const attendus = [page.contenu.heros.chapeau, ...(page.contenu.heros.paragraphes ?? [])];
  for (const section of page.contenu.sections) {
    if ("titre" in section) attendus.push(section.titre);
  }
  for (const texte of attendus) {
    assert.ok(
      captureTexte.includes(sansMarkdown(texte)),
      `${nom} : absent de la capture de ${url}, donc pas mot pour mot : « ${texte.slice(0, 80)} »`,
    );
    probes += 1;
  }

  const html = renderToStaticMarkup(
    <PageFicheMetier
      titre={page.titre_h1 ?? `Titre de ${page.url}`}
      contenu={page.contenu}
      // Pas de fil d'Ariane : il interroge la base.
    />,
  );

  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(html), `${nom} : un href="#" est rendu`);
  assert.ok(
    html.includes('id="postuler"'),
    `${nom} : la section postuler manque, les boutons visent une ancre morte`,
  );
  verifieInterdits(html, nom);

  // Les photos de la maquette (relevé sha256 du 08/10) : celle du héros, celle
  // de chaque carte de fin, et le panneau-photo de la FAQ. `next/image` encode
  // le chemin dans `/_next/image?url=…`.
  const photos = [
    page.contenu.heros.photo?.src,
    ...page.contenu.sections.flatMap((x) => (x.type === "liens" ? x.items.map((i) => i.photo) : [])),
    ...(page.contenu.sections.some((x) => x.type === "faq") ? ["/assets/web/faq-offre.jpg"] : []),
  ];
  for (const photo of photos) {
    assert.ok(photo, `${nom} : une photo de la maquette manque dans la donnée`);
    assert.ok(
      html.includes(encodeURIComponent(photo)),
      `${nom} : la photo ${photo} n'est pas rendue`,
    );
  }
}

/* ------- 8 bis. le formulaire : README de passation, règles « Candidature »

   La mobilité garde la forme de la capture (un sélecteur « Choisir ») et la
   règle du README (France entière OU plusieurs régions), le témoin `required`
   la rend obligatoire. La preuve d'échec d'abord : un rendu sans témoin. */

function verifieFormulaire(html: string): void {
  const texte = texteLisible(html);
  assert.ok(texte.includes("Au-delà de 3 mois"), "délai de démarrage : « Au-delà de 3 mois » absent");
  assert.ok(!/teamtailor/i.test(texte), "le site ne mentionne jamais Teamtailor");
  const cases = html.match(/type="checkbox" name="mobility"/g) ?? [];
  assert.equal(cases.length, 13, "mobilité : les treize cases de MOBS, France entière comprise");
  assert.ok(
    /<input[^>]*aria-hidden="true"[^>]*required=""/.test(html),
    "mobilité : le témoin required manque, la question n'est plus obligatoire",
  );
  assert.ok(html.includes("France entière (prêt à déménager)"), "mobilité : l'option France entière manque");
}
assert.throws(() => verifieFormulaire("<form></form>"), /absent|manque|cases/, "verifieFormulaire ne sait pas échouer");
verifieFormulaire(rendu);

/* ------------------- 9. les survols de la maquette, posés avec :focus-visible */

/* Les cartes de fin et la FAQ-photo sont celles du hub (`LiensPhoto`,
   `QuestionsHub`) : leurs survols vivent dans son module. */
const MODULE_CSS =
  readFileSync(join(RACINE, "components", "site", "metier", "FicheMetier.module.css"), "utf8") +
  readFileSync(join(RACINE, "components", "site", "carriere", "HubCarriere.module.css"), "utf8");
for (const [selecteur, valeur] of [
  [".boutonOrange", "brightness(0.93)"],
  [".boutonTelephone", "background: var(--card)"],
  [".carteLien", "translateY(-3px)"],
  [".boutonQuestion", "translateY(-1px)"],
  [".texteLie a", "color: var(--acc)"],
] as const) {
  assert.ok(
    MODULE_CSS.includes(`${selecteur}:hover`) &&
      MODULE_CSS.includes(`${selecteur}:focus-visible`),
    `survol de la maquette absent ou sans :focus-visible : « ${selecteur} »`,
  );
  assert.ok(
    MODULE_CSS.includes(valeur),
    `la valeur de survol relevée « ${valeur} » a quitté le module CSS`,
  );
}

console.log("gabarit métier : toutes les vérifications passent.");
console.log(
  `  captures pilotes relues (${CAPTURE.split("\n").length} et ${CAPTURE_2.split("\n").length} lignes), ` +
    `${URLS_GABARIT_07.length} pages réelles rendues contre leur propre capture (${probes} textes mot pour mot), ` +
    `${INTERDITS.length} interdits vérifiés absents, et la preuve d'échec a tourné d'abord.`,
);
