/**
 * Contrôle du gabarit « 05 Spécialité », sans navigateur.
 *
 *   bun components/site/expertises/specialite/verification-specialite.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/expertises--robotique--fanuc.html` et
 * `expertises--robotique--abb.html` (07/10 21h12, 15 sections chacune).
 *
 * CE QUE CE CONTRÔLE GARANTIT, sur le modèle de
 * `components/site/offre/verification-offre.tsx` :
 *
 * 1. LES VALEURS DE LA CAPTURE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire : chaque dessin et chaque copie sont d'abord
 *    vérifiés PRÉSENTS dans la capture, puis dans le rendu.
 * 2. LA PAGE RÉELLE est rendue depuis sa vraie donnée,
 *    `supabase/import/gabarits-maquette/expertises-robotique-fanuc.json` et
 *    `expertises-robotique-abb.json`, celle que la route sert.
 * 3. CHAQUE CHAÎNE DU RELAIS EXISTE DANS SA CAPTURE, sur texte normalisé :
 *    une phrase réécrite plutôt que copiée fait échouer le contrôle.
 * 4. UN SEUL H1, aucun `href="#"`, aucune classe Tailwind de couleur, aucune
 *    variante `dark:`.
 * 5. LES INTERDITS DU CONTRAT sont absents du rendu, « +200 » et le tiret
 *    cadratin compris. Le TROU est aussi vérifié dans l'autre sens : la
 *    capture PORTE « +200 », le rendu NON, et c'est déclaré.
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS : un contenu vide rend le titre et
 *    les écrans fixes du gabarit, rien de la matière des autres pages.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuSpecialite } from "@/types/specialite";
import { estSpecialite } from "@/types/specialite";

import PageSpecialite from "./PageSpecialite";

const RACINE = fileURLToPath(new URL("../../../..", import.meta.url));

/* ----------------------------------------- les captures, relues à chaque fois */

function litCapture(nom: string): string {
  return readFileSync(join(RACINE, "maquette", "rendu", nom), "utf8");
}

/** Un style ramené à une écriture comparable des deux côtés (même règle que
 * `verification-offre.tsx` : la capture sérialise `0px` et `0.88fr`, React
 * rend `0` et `.88fr`). */
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

function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/* ------------------------------- les pages réelles, telles que la route les sert */

const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuSpecialite;
}

function litPage(nom: string): PageRelais {
  return JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais;
}

/** Les pilotes du gabarit : chaque page avec SA capture. Les 17 autres pages
 * « 05 Spécialité » de l'index seront ajoutées ici quand leur relais sera
 * reporté contre leur capture (dont les 9 `/expertises/types-de-maintenance/`,
 * qui rendent des écrans de plus, non portés : trou déclaré). */
const PILOTES: readonly {
  relais: string;
  capture: string;
  /** Les dessins propres à CETTE capture, en plus des communs. */
  dessins: readonly string[];
}[] = [
  {
    relais: "expertises-robotique-fanuc.json",
    capture: "expertises--robotique--fanuc.html",
    // 4 · 03 Problème en variante « colonne » : la colonne collante et sa photo.
    dessins: ["position: sticky; top: 110px"],
  },
  {
    relais: "expertises-robotique-abb.json",
    capture: "expertises--robotique--abb.html",
    // 4 · 03 Problème en variante « rangee » : UNE rangée de quatre cartes
    //     égales, le numéro orange posé au-dessus de l'accroche (tpl 444).
    dessins: ["grid-template-columns: repeat(4, minmax(0px, 1fr))"],
  },
];

/* Les interdits du contrat (CLAUDE.md §3 et §9), cherchés dans le texte
   visible du rendu, balises retirées, sur texte normalisé. */
const INTERDITS = [
  "—",
  "+200",
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

/* Les dessins du gabarit, une valeur porteuse par section, RELEVÉS dans la
   capture pilote. Chacun doit exister dans la capture ET dans le rendu. */
const DESSINS = [
  // 0 · 01 Héros : la section, la grille à deux colonnes, le H1 à 66px.
  "max-width: 1200px; margin: 0px auto; padding: 40px 40px 0px",
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  // 1 · 01 Chiffres : la carte en verre et la valeur à 28px. PAS le nombre de
  //     colonnes : la capture en dessine trois dont « +200 », interdit déclaré,
  //     la grille du rendu se resserre sur ce qui reste.
  "padding: 44px 40px 0px",
  "font: 600 calc(28px * var(--ts))/1 var(--ft)",
  // 2 · 02 Logos.
  "padding: 64px 0px 0px",
  // 3 · Réassurance : la grille .9fr/1.1fr.
  "grid-template-columns: 0.9fr 1.1fr",
  // 4 · 03 Problème : son dessin varie par page, voir `PILOTES[].dessins`.
  // 5 · 04 Offre : le rail numéro + texte.
  "grid-template-columns: 26px minmax(0px, 1fr)",
  // 6 · Appel · offre : le padding de la bande, 22px dans TOUTES les captures
  //     du 07/10 21h12 (fanuc, abb, robotique, offres--residence) ; c'est la
  //     raison pour laquelle la bande est rendue localement et non par
  //     `BandeAppel`, resté à un relevé antérieur (11px).
  "padding: 22px 24px 22px 30px",
  "border-radius: 28px",
  // 7 · 05 Déroulé : trois colonnes d'étapes.
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  // 8 · 06 Garanties : le panneau sombre à deux colonnes.
  "padding: var(--sec) 24px 0",
  "grid-template-columns: repeat(2, minmax(0px, 1fr))",
  // 9 · Secteurs de l'expertise : l'en-tête .8fr/1.2fr et les cartes de 200px.
  "grid-template-columns: 0.8fr 1.2fr",
  "min-height: 200px",
  // 10 · Offres du secteur : le bento, sa grande carte et ses petites.
  "min-height: 470px",
  "min-height: 236px",
  // 11 · Marques maintenues : les tuiles de 72px en auto-fill.
  "repeat(auto-fill, minmax(150px, 1fr))",
  // 12 · 08 Références : le rail de cartes de 280 à 320px, photo de 150px.
  "grid-auto-columns: minmax(280px, 320px)",
  "height: 150px",
  // 13 · 09 Questions : la grille .8fr/1.2fr de la carte à photo.
  "minmax(0px, 0.8fr) minmax(0px, 1.2fr)",
  // 14 · 10 Appel final : la section qui ferme la page, et son ancre.
  "padding: var(--sec) 24px var(--sec)",
] as const;

/* Les copies fixes du gabarit, mot pour mot, présentes dans la capture ET
   dans le rendu. */
const COPIES = [
  // Héros et panneau.
  "Expertises",
  "Rappel dans l'heure",
  "Demander une intervention",
  // Logos et réassurance.
  "Ils nous font confiance",
  "Certifications",
  "Qui intervient chez vous",
  "4 agences : Lyon (siège), Montréal, Dubaï, Madrid.",
  // Problème.
  "Votre problématique",
  // Offre.
  "L'offre",
  "Ce que nous faisons, et ce que ça change pour vous",
  "7 points",
  // Déroulé.
  "Notre méthode",
  "Un appel. Un plan. Une ligne qui repart.",
  "6 étapes",
  "Démarrer par l'audit",
  // Garanties.
  "Notre parti pris",
  "Ce que nous garantissons",
  // Secteurs de l'expertise (copie fixe, identique sur les 4 captures comparées).
  "Par secteur d'activité",
  "Même expertise, contraintes différentes",
  "Un roulement se change de la même façon partout.",
  "Agroalimentaire",
  "Aéronautique",
  // Offres du secteur (copie fixe).
  "Nos offres",
  "Six façons de travailler ensemble, selon votre besoin",
  "Une présence continue, un contrat global, un abonnement hors production, un arrêt à préparer, une étude ou un chantier.",
  "Décrire mon besoin",
  "migen© Résidence",
  "migen© Travaux industriels",
  "Voir l'offre",
  // Marques.
  "Marques et constructeurs",
  "Les équipements que nous maintenons déjà",
  "Vos machines sont dans la liste ? Le technicien qui les connaît fait déjà partie de nos équipes.",
  // Références.
  "Nos réalisations",
  "Nos références",
  "Toutes nos études de cas",
  "Lire l'étude de cas",
  // Questions.
  "Questions fréquentes",
  "Vos questions avant de nous appeler",
  "Poser ma question",
  // Appel final.
  "Rappel dans l'heure aux horaires ouvrés.",
] as const;

/* --------------- 3. chaque chaîne du relais existe dans SA capture --------- */

/** Les clés dont la valeur n'est pas une copie de la capture : chemins,
 * identifiants, discriminants. `lienLibelle` est vérifié à part : la capture
 * ne rend que l'étiquette client (« JTEKT »), pas le libellé long. */
const CLES_HORS_COPIE = new Set([
  "_source",
  "url",
  "gabarit",
  "href",
  "lienHref",
  "lienLibelle",
  "photo",
  "problemePhoto",
  "marquesFamille",
  "marquesFamilles",
  "type",
  "variante",
]);

function chainesDuRelais(valeur: unknown, cle?: string): string[] {
  if (typeof valeur === "string") {
    return cle && CLES_HORS_COPIE.has(cle) ? [] : valeur ? [valeur] : [];
  }
  if (Array.isArray(valeur)) {
    return valeur.flatMap((v) => chainesDuRelais(v, cle));
  }
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) =>
      CLES_HORS_COPIE.has(k) ? [] : chainesDuRelais(v, k),
    );
  }
  return [];
}

function verifieInterdits(visible: string, nom: string): void {
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot.toLowerCase()),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

/* -------------------------------------------------- le contrôle, page par page */

for (const pilote of PILOTES) {
  const capture = litCapture(pilote.capture);
  const captureStyle = normaliseStyle(capture);
  const captureTexte = texteLisible(capture);

  const page = litPage(pilote.relais);
  assert.ok(
    estSpecialite(page.contenu),
    `${pilote.relais} : le contenu doit se déclarer « specialite » et porter ses sections, sinon la route sert un autre gabarit`,
  );
  assert.ok(page.titre_h1, `${pilote.relais} : titre_h1 manquant`);
  assert.ok(
    captureTexte.includes(normaliseTexte(page.titre_h1!)),
    `${pilote.relais} : le H1 du relais n'est pas celui de la capture`,
  );

  const rendu = renderToStaticMarkup(
    <PageSpecialite
      titre={page.titre_h1!}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
      // Pas de fil d'Ariane ni de maillage : ils interrogent la base.
    />,
  );
  const renduStyle = normaliseStyle(rendu);
  const renduTexte = texteLisible(rendu);

  /* 1. la fidélité du dessin, section par section. */
  for (const fragment of [...DESSINS, ...pilote.dessins]) {
    const attendu = normaliseStyle(fragment);
    assert.ok(
      captureStyle.includes(attendu),
      `${pilote.capture} ne porte pas le dessin « ${fragment} » : valeur à revérifier`,
    );
    assert.ok(
      renduStyle.includes(attendu),
      `${pilote.relais} : le rendu ne porte pas le dessin de la capture « ${fragment} »`,
    );
  }

  /* 2. les copies fixes du gabarit, mot pour mot. */
  for (const texte of COPIES) {
    const attendu = normaliseTexte(texte);
    assert.ok(
      captureTexte.includes(attendu),
      `${pilote.capture} ne porte pas la copie « ${texte} »`,
    );
    assert.ok(
      renduTexte.includes(attendu),
      `${pilote.relais} : le rendu ne porte pas la copie de la capture « ${texte} »`,
    );
  }

  /* 3. chaque chaîne du relais est copiée de la capture, pas réécrite. */
  for (const chaine of chainesDuRelais(page.contenu)) {
    assert.ok(
      captureTexte.includes(normaliseTexte(chaine)),
      `${pilote.relais} : chaîne absente de la capture, donc réécrite ou inventée : « ${chaine.slice(0, 80)} »`,
    );
  }
  /* …et l'étiquette client des références est celle que la capture affiche. */
  for (const section of page.contenu.sections) {
    if (section.type !== "preuves") continue;
    for (const preuve of section.preuves) {
      const client = preuve.lienLibelle?.replace(/^Étude de cas\s+/u, "");
      assert.ok(
        client && captureTexte.includes(normaliseTexte(client)),
        `${pilote.relais} : étiquette client absente de la capture : « ${client} »`,
      );
      assert.ok(
        preuve.lienHref && capture.includes(`href="${preuve.lienHref}"`),
        `${pilote.relais} : la capture ne vise pas ${preuve.lienHref}`,
      );
    }
  }

  /* 4. un seul h1, aucune cible morte, aucun échafaudage Tailwind. */
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${pilote.relais} : exactement un h1 attendu`,
  );
  assert.ok(
    !/href="#"/.test(rendu),
    `${pilote.relais} : un href="#" est rendu`,
  );
  assert.ok(
    rendu.includes('href="#besoin"') && rendu.includes('href="#mgx-form"'),
    `${pilote.relais} : les appels doivent viser #besoin et #mgx-form, les ancres de la capture`,
  );
  for (const cible of [
    "/secteurs/agroalimentaire",
    "/offres/residence",
    "/travaux-industriels",
    "/preuves",
  ]) {
    assert.ok(
      rendu.includes(`href="${cible}/"`) || rendu.includes(`href="${cible}"`),
      `${pilote.relais} : lien de la capture absent du rendu : ${cible}/`,
    );
  }
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
        classe[1],
      ),
      `${pilote.relais} : classe Tailwind de couleur dans le rendu : « ${classe[1]} »`,
    );
    assert.ok(
      !/\bdark:/.test(classe[1]),
      `${pilote.relais} : variante dark: dans le rendu : « ${classe[1]} »`,
    );
  }

  /* 5. les interdits du contrat, et le trou déclaré des chiffres. */
  verifieInterdits(renduTexte.toLowerCase(), pilote.relais);
  assert.ok(
    captureTexte.includes("+200") &&
      captureTexte.includes("Clients industriels accompagnés"),
    `${pilote.capture} : le trou déclaré a disparu de la capture, déclaration à revoir`,
  );
  assert.ok(
    !renduTexte.includes("Clients industriels accompagnés"),
    `${pilote.relais} : « Clients industriels accompagnés » accompagne « +200 », interdit du contrat : la carte ne se rend pas`,
  );
}

/* ------------------------- 6. une section sans donnée ne se rend pas */

const VIDE: ContenuSpecialite = { gabarit: "specialite", sections: [] };
const renduVide = renderToStaticMarkup(
  <PageSpecialite titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);
assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus que les écrans fixes",
);
for (const absent of [
  "padding:22px 24px 22px 30px", // pas de bande d'appel
  "1.12fr .88fr", // pas de panneau de formulaire au héros
  "Votre problématique", // pas de problème
  "points", // pas de compteur de l'offre
  "Poser ma question", // pas de FAQ
  "repeat(auto-fill,minmax(150px,1fr))", // pas de marques
]) {
  assert.ok(
    !normaliseTexte(normaliseStyle(renduVide)).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

console.log("gabarit 05 Spécialité : toutes les vérifications passent.");
console.log(
  `  ${PILOTES.length} pages pilotes rendues depuis leur relais réel, ` +
    `${DESSINS.length} dessins et ${COPIES.length} copies relus dans les captures, ` +
    `${INTERDITS.length} interdits vérifiés absents, trou « +200 » déclaré et tenu.`,
);
