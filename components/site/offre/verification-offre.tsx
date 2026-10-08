/**
 * Contrôle du gabarit OFFRE, sans navigateur.
 *
 *   bun components/site/offre/verification-offre.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/offres--residence.html` (validé le 06/10, 17 sections).
 * L'ancienne version de ce contrôle comparait le rendu à l'écran de
 * démonstration `accueil-rendu.html` (`isOfferPage`), qui n'est le gabarit
 * d'aucune page : c'est précisément l'erreur qui a coûté la journée du 05/10.
 *
 * CE QUE CE CONTRÔLE GARANTIT, et pourquoi chaque point y est :
 *
 * 1. LES VALEURS DE LA CAPTURE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire : chaque dessin et chaque copie du gabarit sont
 *    d'abord vérifiés PRÉSENTS dans la capture, puis dans le rendu. Si la
 *    capture change, ce contrôle le dit.
 * 2. LA PAGE RÉELLE est rendue depuis sa vraie donnée,
 *    `supabase/import/gabarits-maquette/offres-residence.json`, pas depuis un
 *    cas de laboratoire : c'est elle que la route sert.
 * 3. UN SEUL H1 par page, aucun `href="#"`, aucune cible hors domaine.
 * 4. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:` : la charte
 *    vit dans les jetons de `app/globals.css`.
 * 5. LES INTERDITS DE COPIE du contrat (CLAUDE.md §9) sont absents du rendu,
 *    tiret cadratin compris.
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS : pas de titre orphelin, pas de
 *    valeur inventée pour meubler.
 * 7. TOUTES LES PAGES DU GABARIT 03 déclarées par l'index de la maquette
 *    passent les mêmes contrôles, la liste étant déduite de l'index et non
 *    écrite à la main.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuOffre } from "@/types/offre";

import PageOffre from "./PageOffre";
import { BLOCS_LECTURE } from "./generique/BlocsLecture";
import { BLOCS_VENTE, INTERNES_VENTE } from "./generique/BlocsVente";
import type { Bloc } from "./generique/types";
import { ficheGenerique, vueDe } from "./generique/vue";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* ----------------------------------------- la capture, relue à chaque fois */

/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(
  readFileSync(join(RACINE, "maquette", "rendu", "offres--residence.html"), "utf8"),
);

/**
 * Un style ramené à une écriture comparable des deux côtés.
 *
 * POURQUOI : la capture est une sérialisation du DOM (`padding: 40px 40px
 * 0px`, `0.88fr`), React rend la déclaration compacte (`padding:40px 40px 0`,
 * `.88fr`). Même valeur, deux écritures : on compare sur la forme normalisée.
 */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/** Un texte ramené à l'écriture du dépôt : espace simple, apostrophe droite. */
function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|’/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * Le texte lisible d'un HTML, balises retirées puis normalisé : c'est sur
 * cette forme que les copies se comparent, car la capture coupe une même
 * phrase en plusieurs éléments (« 7 » et « points », le libellé et sa flèche).
 */
function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

const CAPTURE_STYLE = normaliseStyle(CAPTURE);
const CAPTURE_TEXTE = texteLisible(CAPTURE);

/**
 * Une valeur de dessin, d'abord vérifiée dans la capture, puis dans le rendu.
 * Aucune des deux présences n'est optionnelle : une valeur qui quitterait la
 * capture rendrait le contrôle menteur, une valeur qui quitterait le rendu
 * romprait la fidélité.
 */
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

/** Une copie du gabarit, vérifiée dans la capture puis dans le rendu. */
function copieCapture(rendu: string, texte: string): void {
  const attendu = normaliseTexte(texte);
  assert.ok(
    CAPTURE_TEXTE.includes(attendu),
    `la capture ne porte pas la copie « ${texte} »`,
  );
  assert.ok(
    texteLisible(rendu).includes(attendu),
    `le rendu ne porte pas la copie de la capture « ${texte} »`,
  );
}

/* ------------------------------- la page réelle, telle que la route la sert */

const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuOffre;
}

function litPage(nom: string): PageRelais {
  return JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais;
}

const RESIDENCE = litPage("offres-residence.json");
assert.equal(
  RESIDENCE.titre_h1,
  "Sous-traitance de maintenance industrielle",
  "le relais doit porter le H1 de la capture, pas celui de l'ancienne base",
);

const rendu = renderToStaticMarkup(
  <PageOffre
    titre={RESIDENCE.titre_h1!}
    contenu={RESIDENCE.contenu}
    formulaire="verification-offre"
  />,
);

/* --------------------------------------- 1. la fidélité du dessin, section
   par section, une valeur porteuse chacune, relevée dans la capture */

for (const fragment of [
  // 0 · 01 Héros : la section, la grille à deux colonnes, le H1 à 66px.
  "max-width: 1200px; margin: 0px auto; padding: 40px 40px 0px",
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  // 1 · 01 Chiffres : quatre cellules dans une carte, valeur à 28px.
  "padding: 44px 40px 0px",
  "grid-template-columns: repeat(4, minmax(0px, 1fr))",
  "font: 600 calc(28px * var(--ts))/1 var(--ft)",
  // 2 · 02 Logos.
  "padding: 64px 0px 0px",
  // 3 · Réassurance et 5 · Problème : la grille .9fr/1.1fr.
  "grid-template-columns: 0.9fr 1.1fr",
  // 4/7/12 · les bandes d'appel.
  "padding: 40px 0px 0px",
  // 6 · 04 Offre : la grille d'en-tête et le rail numéro + texte.
  "grid-template-columns: 1.1fr 0.9fr",
  "grid-template-columns: 26px minmax(0px, 1fr)",
  // 8 · 05 Déroulé : trois colonnes d'étapes.
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  // 9 · 06 Garanties : le panneau à deux colonnes.
  "padding: var(--sec) 24px 0",
  "grid-template-columns: repeat(2, minmax(0px, 1fr))",
  // 13 · 09 Questions : la maquette du 07/10 a RETIRÉ la grille en ligne
  //      (c'était « minmax(0px,1fr) minmax(0px,1fr) ») et pilote désormais ce
  //      bloc par ses classes `mg-faqd` et `mg-faqi`. On contrôle donc ce
  //      qu'elle porte vraiment : le bouton d'appel, collé au titre.
  "border-radius: 999px",
  // 14 · Maillage : le bento 1.25fr est devenu trois colonnes égales.
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  // 15 · Réalisations liées : le bloc « Ils nous ont confié une mission
  //      comparable » a quitté cette page le 07/10, il ne reste que sur
  //      /bureau-etudes/. Son dessin n'a donc plus rien à contrôler ici.
  // 16 · 10 Appel final : la section qui ferme la page.
  "padding: var(--sec) 24px var(--sec)",
]) {
  dessinCapture(rendu, fragment);
}

/* ------------------------------ 2. les copies fixes du gabarit, mot pour mot */

for (const texte of [
  // 0 · Héros : pastille, bouton, panneau de formulaire.
  "Nos offres",
  "Parler à un chargé d'affaires",
  "Rappel dans l'heure",
  // 2 et 3 · Logos et réassurance.
  "Ils nous font confiance",
  "Certifications",
  "Qui intervient chez vous",
  // 5 · Problème.
  "Votre problématique",
  // 6 · Offre.
  "L'offre",
  "Ce que nous faisons, et ce que ça change pour vous",
  "7 points",
  // 8 · Déroulé.
  "Notre méthode",
  "Un appel. Un plan. Une ligne qui repart.",
  "6 étapes",
  "Démarrer par l'audit",
  // 9 · Garanties.
  "Notre parti pris",
  "Ce que nous garantissons",
  // 11 · Références.
  "Nos réalisations",
  "Nos références",
  "Toutes nos études de cas",
  // 13 · Questions.
  "Questions fréquentes",
  "Vos questions avant de nous appeler",
  // 14 · Maillage.
  "Nos autres offres",
  "Un autre besoin ? Il a son offre.",
  "Trouver mon hub",
  // 15 · Réalisations liées.
  // « Ils nous ont confié une mission comparable » a quitté cette page le
  // 07/10 : la maquette ne le garde que sur /bureau-etudes/. La copie n'est
  // plus contrôlable ici, et son absence du rendu est désormais la règle.
  // retirée le 07/10 : la maquette ne porte plus « Toutes les études de cas » sur cette page.
  // 16 · Appel final : la sous-ligne fixe du gabarit.
  "Rappel dans l'heure aux horaires ouvrés.",
]) {
  copieCapture(rendu, texte);
}

/* --------------------------------------------------------- 3. un seul h1 */

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);
assert.ok(
  rendu.includes("Sous-traitance de maintenance industrielle"),
  "le titre de la page doit être rendu dans le h1",
);

/* ----------------------------------------------- 4. aucune cible morte */

assert.ok(
  !/href="#"/.test(rendu),
  'aucun href="#" : la maquette navigue par script, le site par ancres réelles',
);
assert.ok(
  rendu.includes('href="#besoin"'),
  "les appels à l'action visent l'ancre du formulaire du héros",
);
// Hors requête, `Link` rend la cible sans slash final : c'est le réglage
// `trailingSlash` qui le rétablit au service. Le contrôle accepte les deux.
for (const cible of [
  "/offres/zero-arret",
  "/offres/arret-technique",
  "/offres/bureau-etudes",
  "/travaux-industriels",
  "/implantations",
  "/preuves",
]) {
  assert.ok(
    rendu.includes(`href="${cible}/"`) || rendu.includes(`href="${cible}"`),
    `le maillage de la capture vise ${cible}/ : lien absent du rendu`,
  );
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

/**
 * Les interdits du contrat (CLAUDE.md §3 et §9), cherchés dans le texte
 * visible du rendu, balises retirées, sur texte normalisé.
 *
 * « sur mesure » et « notamment » y sont bien : s'ils arrivent un jour par le
 * corpus, c'est le corpus qu'il faudra corriger, pas cette liste.
 */
function texteVisible(page: string): string {
  return normaliseTexte(page.replace(/<[^>]+>/g, " ")).toLowerCase();
}

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
  const visible = texteVisible(page);
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

verifieInterdits(rendu, "offres-residence");

/* ------------------------- 7. une section sans donnée ne se rend pas */

// Les quatre sections Zéro Arrêt restent montées mais ne reçoivent rien ici :
// la page résidence ne porte aucun de leurs champs, et aucun de leurs motifs
// propres ne doit apparaître (« Recommandé » est la pastille fixe du rail des
// formules, le seul texte que ces sections écrivent d'elles-mêmes).
for (const champ of [
  "commentCaMarcheTitre",
  "formules",
  "comparatif",
  "premierMoisEtapes",
] as const) {
  assert.ok(
    RESIDENCE.contenu[champ] === undefined,
    `le relais résidence ne doit pas porter « ${champ} », champ du gabarit Zéro Arrêt`,
  );
}
assert.ok(
  !rendu.includes("Recommandé"),
  "une section Zéro Arrêt s'est rendue sans donnée : « Recommandé »",
);

const VIDE: ContenuOffre = { gabarit: "offre" };
const renduVide = renderToStaticMarkup(
  <PageOffre titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
for (const absent of [
  "grid-template-columns:repeat(4,minmax(0,1fr))", // pas de chiffres
  "1.12fr .88fr", // pas de panneau de formulaire au héros
  "Un autre besoin ? Il a son offre.", // pas de cartes de maillage
  "Rappel dans l'heure.", // pas de bande-question autonome
]) {
  assert.ok(
    !normaliseTexte(normaliseStyle(renduVide)).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

/* -------------------- 8. toutes les pages réelles, telles qu'elles iront en base

   LA LISTE SE DÉDUIT DE L'INDEX DE LA MAQUETTE, elle ne s'écrit pas à la main.
   Deux raisons, chacune payée une fois :

   · un NOMBRE FIGÉ ne sait pas qu'une page est arrivée. Cette porte a tenu
     « 18 » pendant que le gabarit 03 passait de six à vingt-huit pages, et
     c'est le nombre qui a cassé, pas le portage.
   · un FILTRE SUR LE PRÉFIXE `offres-` ne voit pas `/bureau-etudes/`,
     `/travaux-industriels/` ni `/entreprise-maintenance-industrielle/`, qui
     sont pourtant du même gabarit. Dix pages auraient échappé aux contrôles
     ci-dessous sans que rien ne le dise.

   Le nom du fichier se déduit de l'URL, et la convention est vérifiée : une
   page présente sous un autre nom compte comme absente, pas comme conforme. */

/** `/offres/residence/cahier-des-charges/` → `offres-residence-cahier-des-charges.json` */
function fichierDe(url: string): string {
  return `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "index"}.json`;
}

// L'index est un TABLEAU de pages, pas un objet qui en porte un.
const INDEX_MAQUETTE = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
) as { url: string; gabarit?: string }[];

const URLS_GABARIT_03 = INDEX_MAQUETTE
  .filter((p) => (p.gabarit ?? "").startsWith("03"))
  .map((p) => p.url)
  .sort();

/**
 * Les pages servies que la maquette ne connaît pas.
 *
 * Arbitrage n° 5 de `docs/PASSATION.md`, ouvert, à trancher par Mehdi : on les
 * contrôle comme les autres, et on les déclare ici pour qu'une page oubliée ne
 * se cache pas derrière un fichier en trop.
 */
const ORPHELINES = ["/offres/maintenance-externalisee/"];

const fichiers = [...URLS_GABARIT_03, ...ORPHELINES].map(fichierDe);

assert.ok(
  URLS_GABARIT_03.length > 0,
  "l'index de la maquette ne déclare aucune page au gabarit 03 : index illisible ou champ renommé",
);

const surDisque = new Set(
  readdirSync(DOSSIER).filter((n) => n.endsWith(".json")),
);
const manquantes = fichiers.filter((n) => !surDisque.has(n));
assert.deepEqual(
  manquantes,
  [],
  `pages du gabarit 03 sans fichier de données dans ${DOSSIER} : ${manquantes.join(", ")}`,
);

for (const nom of fichiers) {
  const page = litPage(nom);

  assert.equal(
    page.contenu.gabarit,
    "offre",
    `${nom} : le contenu doit se déclarer « offre », sinon la route retombe sur le gabarit de vente`,
  );

  const html = renderToStaticMarkup(
    <PageOffre
      titre={page.titre_h1 ?? `Titre de ${page.url}`}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
      // Pas de fil d'Ariane ni de maillage : ils interrogent la base.
    />,
  );

  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(html), `${nom} : un href="#" est rendu`);
  verifieInterdits(html, nom);

  /* Pages génériques : chaque bloc que le code de la maquette produit doit
     avoir son rendu porté. Un type nouveau (une page ajoutée, un markdown
     réécrit) ferait sinon disparaître son texte sans un mot. */
  const generique = ficheGenerique(page.contenu);
  if (generique) {
    const vue = vueDe(page.titre_h1 ?? page.url, generique);
    const types = (b: Bloc) => Object.keys(b).filter((k) => k.startsWith("is") && b[k as keyof Bloc] === true);
    const exige = (blocs: Bloc[], connus: readonly string[], ou: string) => {
      for (const b of blocs) {
        const inconnus = types(b).filter((k) => !connus.includes(k));
        assert.deepEqual(inconnus, [], `${nom} : bloc ${inconnus.join(", ")} sans rendu porté (${ou})`);
        for (const u of [...(b.units ?? []), ...(b.unit ? [b.unit] : [])]) {
          for (const x of u.blocks) {
            const cles = Object.keys(x).filter((k) => x[k as keyof typeof x] === true);
            const hors = cles.filter((k) => !(INTERNES_VENTE as readonly string[]).includes(k));
            assert.deepEqual(hors, [], `${nom} : sous-bloc ${hors.join(", ")} sans rendu porté (${ou})`);
          }
        }
      }
    };
    if (vue.cVente) {
      for (const sec of vue.spRest) {
        exige(sec.head, BLOCS_VENTE, sec.title);
        assert.equal(sec.more.length, 0, `${nom} : « Lire la suite » d'une section de vente, non porté`);
      }
      for (const q of vue.spFaq.items ?? []) exige(q.blocks, BLOCS_LECTURE, "questions");
      assert.ok(vue.spProblem.hasSplit || !vue.spHasProblem, `${nom} : constat sans les deux panneaux, non porté`);
    } else {
      exige(vue.cIntro, BLOCS_LECTURE, "chapô");
      for (const sec of vue.cSections) exige([...sec.head, ...sec.more], BLOCS_LECTURE, sec.title);
    }
  }
}

console.log(`gabarit offre : toutes les vérifications passent.`);
console.log(
  `  capture relue (${CAPTURE.split("\n").length} lignes), ` +
    `${fichiers.length} pages réelles rendues, ${INTERDITS.length} interdits vérifiés absents.`,
);
