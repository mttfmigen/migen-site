/**
 * Contrôle du gabarit OFFRE, sans navigateur.
 *
 *   bun components/site/offre/verification-offre.tsx
 *
 * CE QUE CE CONTRÔLE GARANTIT, et pourquoi chaque point y est :
 *
 * 1. LES VALEURS DE LA MAQUETTE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire. `maquette/accueil-rendu.html` est versionné
 *    pour cela : une note de lecture peut se tromper, un fichier relu non. Si
 *    la maquette change, ce contrôle le dit.
 * 2. UN SEUL H1 par page. Le gabarit monte quatorze sections et trois
 *    composants d'accueil : un H1 de trop est invisible à l'œil, pas à Google.
 * 3. AUCUN `href="#"`. La maquette navigue par `sc-camel-on-click`, qui n'est
 *    pas porté : recopier ses `href="#"` aurait donné quatorze boutons morts.
 * 4. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`. La charte vit
 *    dans les jetons de `app/globals.css`, et le site n'a pas de mode sombre.
 * 5. LES INTERDITS DE COPIE sont absents du rendu, prix et délais chiffrés
 *    compris. C'est le cœur de ce gabarit : la maquette en porte, le contrat
 *    les refuse, et le contrat gagne.
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. Pas de titre orphelin, pas
 *    de carte vide, pas de valeur inventée pour meubler.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuOffre } from "@/types/offre";

import PageOffre from "./PageOffre";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* -------------------------------------------- la maquette, relue à chaque fois */

/** Le gabarit `sc-if value="{{ isOfferPage }}"` de la maquette. */
function gabaritMaquette(): string {
  const entier = readFileSync(
    join(RACINE, "maquette", "accueil-rendu.html"),
    "utf8",
  );
  const debut = entier.indexOf('<sc-if value="{{ isOfferPage }}"');
  assert.ok(
    debut > -1,
    "le gabarit isOfferPage est introuvable dans maquette/accueil-rendu.html",
  );
  // La page d'offre est suivie de `isApropos` : on s'arrête là.
  const fin = entier.indexOf('<sc-if value="{{ isApropos }}"', debut);
  assert.ok(fin > debut, "la fin du gabarit isOfferPage est introuvable");
  return entier.slice(debut, fin);
}

const MAQUETTE = gabaritMaquette();

/**
 * Une déclaration de style de la maquette, relevée par la valeur qui l'ouvre.
 *
 * POURQUOI : le contrôle doit comparer ce que le composant rend à ce que la
 * maquette écrit, sans qu'aucune des deux valeurs soit saisie à la main ici.
 */
function styleMaquette(fragment: string): string {
  assert.ok(
    MAQUETTE.includes(fragment),
    `la maquette ne porte pas « ${fragment} » : valeur à revérifier`,
  );
  return fragment;
}

/** Ce que la maquette écrit en toutes lettres, et qui doit se retrouver rendu. */
function copieMaquette(texte: string): string {
  assert.ok(
    MAQUETTE.includes(texte),
    `la maquette ne porte pas la copie « ${texte} »`,
  );
  return texte;
}

/* ------------------------------------------------------- une page d'exemple */

/**
 * Une donnée d'exemple de la forme que l'import produit vraiment.
 *
 * Les quatre sections sous condition n'y figurent PAS, exactement comme dans
 * les dix-huit fichiers de `supabase/import/gabarits-maquette/` : c'est le
 * comportement qu'il faut vérifier, pas un cas de laboratoire.
 */
const OFFRE: ContenuOffre = {
  gabarit: "offre",
  mention: "Nous vous rappelons dans l'heure, du lundi au vendredi.",
  chapeau:
    "L'abonnement remplace vos dépannages subis par un programme de visites, décrit dans le [cahier des charges](/offres/residence/cahier-des-charges/).",
  actions: [
    { libelle: "Lancer mon diagnostic gratuit", href: "#formulaire" },
    { libelle: "Les cinq offres", href: "/offres/" },
    // Cible hors domaine : le lien doit DISPARAÎTRE, pas être rafistolé.
    { libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
  formulaireHeroTitre: "Décrire mon besoin",
  formulaireHeroMention: "Rappel dans l'heure",
  brefSurtitre: "En bref",
  brefTitre: "Le cadre, en quatre chiffres.",
  chiffres: [
    { valeur: "+ 80", libelle: "clients réguliers", detail: "un contrat se renouvelle" },
    { valeur: "10 %", libelle: "des candidats retenus", detail: "chaque technicien est évalué" },
    { valeur: "4", libelle: "agences", detail: "Lyon siège, Montréal, Dubaï, Madrid" },
    { valeur: "24/24", libelle: "astreinte", detail: "en option au contrat" },
  ],
  brefBande: "Besoin de savoir si un abonnement vous coûterait moins cher ?",
  brefBouton: { libelle: "Lancer mon diagnostic", href: "#formulaire" },
  sections: [
    {
      type: "probleme",
      punchline: "Arrêtez de payer des dépannages.",
      puces: [
        { accroche: "La panne revient.", texte: "On traite le symptôme, jamais la cause." },
      ],
    },
    {
      type: "offre",
      lignes: [
        {
          prestation: { accroche: "Un plan de préventif", texte: "inventaire, points critiques." },
          benefice: "Les arrêts deviennent planifiés.",
        },
      ],
    },
    {
      type: "deroule",
      etapes: [{ titre: "Le diagnostic gratuit", texte: "quelques minutes suffisent." }],
    },
    {
      type: "garanties",
      puces: [{ accroche: "Des résultats mesurés", texte: "nombre d'incidents, disponibilité." }],
    },
    {
      type: "preuves",
      preuves: [
        {
          titre: "Maintenance préventive d'une fonderie",
          texte: "depuis octobre 2023",
          lienHref: "/preuves/stellantis-fonderie-sept-fons/",
          lienLibelle: "Étude de cas STELLANTIS",
        },
      ],
    },
    {
      type: "objections",
      questions: [
        { question: "Sur quelle durée s'engage-t-on ?", reponse: "Six mois renouvelable." },
      ],
    },
    {
      type: "ctaFinal",
      question: "Besoin d'un budget que vous connaissez en janvier ?",
      bouton: "Lancer mon diagnostic gratuit",
    },
  ],
  autresSurtitre: "Un autre besoin ?",
  autresTitre: "Chaque situation a son offre.",
  autres: [
    {
      phrase: "« J'ai besoin d'un renfort maintenance sur mon site. »",
      libelle: "Résidence",
      href: "/offres/residence/",
    },
    // Cible hors domaine : la carte doit DISPARAÎTRE.
    {
      phrase: "« Autre chose. »",
      libelle: "Ailleurs",
      href: "https://exemple.test/",
    },
  ],
};

const rendu = renderToStaticMarkup(
  <PageOffre
    titre="Contrat de maintenance"
    contenu={OFFRE}
    formulaire="verification-offre"
  />,
);

/* ---------------------------------------------- 1. la fidélité à la maquette */

for (const valeur of [
  // Le héros, l. 4708 à 4733.
  "max-width:1200px;margin:0 auto;padding:70px 40px 0",
  "grid-template-columns:1.12fr .88fr",
  "clamp(38px,4.4vw,66px)",
  "letter-spacing:-.045em",
  "font:400 17.5px/1.65 var(--fb)",
  // Les cartes de « En bref », l. 4766.
  "font:600 calc(34px * var(--ts))/1 var(--ft)",
  "letter-spacing:-.05em",
  "font:600 14.5px var(--ft)",
  "font:400 13.5px/1.5 var(--fb)",
  // La bande sous les chiffres, l. 4767.
  "padding:16px 16px 16px 26px",
  // Les cartes de « Un autre besoin ? », l. 5156.
  "font:500 15px/1.5 var(--fb)",
  "font:600 12.5px var(--fb)",
]) {
  const attendu = styleMaquette(valeur);
  const sansEspace = attendu.replace(/\s*([:;,])\s*/g, "$1");
  assert.ok(
    rendu.includes(attendu) || rendu.includes(sansEspace),
    `le rendu ne porte pas la valeur de la maquette « ${attendu} »`,
  );
}

// Les surtitres et les H2 que la maquette écrit en toutes lettres.
for (const texte of [
  "En bref",
  "Le cadre, en quatre chiffres.",
  "Décrire mon besoin",
  "Chaque situation a son offre.",
]) {
  assert.ok(
    rendu.includes(copieMaquette(texte)),
    `le rendu ne porte pas la copie de la maquette « ${texte} »`,
  );
}

// « Un autre besoin&nbsp;? » : la maquette écrit l'entité, React rend le
// caractère. On compare sur un texte normalisé, comme partout dans ce projet.
copieMaquette("Un autre besoin&nbsp;?");
assert.ok(
  rendu.replace(/ /g, " ").includes("Un autre besoin ?"),
  "le surtitre « Un autre besoin ? » doit être rendu",
);

/* ------------------------------------------------------------- 2. un seul h1 */

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);
assert.ok(
  rendu.includes("Contrat de maintenance"),
  "le titre de la page doit être rendu dans le h1",
);

/* ------------------------------------------------- 3. aucune cible morte */

assert.ok(
  !/href="#"/.test(rendu),
  'aucun href="#" : la maquette navigue par sc-camel-on-click, qui n\'est pas porté',
);
assert.ok(
  !rendu.includes("exemple.test"),
  "une cible hors domaine ne doit jamais être rendue en lien",
);
assert.ok(
  !rendu.includes(">Ailleurs<") && !rendu.includes("Autre chose"),
  "un lien à cible refusée disparaît, libellé compris",
);
assert.ok(
  rendu.includes('href="#formulaire"'),
  "les appels à l'action visent l'ancre du formulaire de la page",
);

/* ----------------------------------------- 4. aucun échafaudage Tailwind */

for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : « ${classe[1] }». La charte vit dans les jetons de app/globals.css`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante dark: dans le rendu : « ${classe[1]} ». Le site n'a pas de mode sombre`,
  );
}

/* ------------------------------------------------- 5. les interdits de copie */

/**
 * Les formulations que le CONTRAT refuse et que la MAQUETTE porte quand même.
 *
 * Chacune est d'abord vérifiée PRÉSENTE dans la maquette : si elle en
 * disparaissait, l'interdit n'aurait plus d'objet et cette liste mentirait.
 * Puis elle est vérifiée ABSENTE du rendu.
 */
const INTERDITS_DE_LA_MAQUETTE = [
  ["5", "5 agences"], // l. 4724, le compte tenu est quatre
  ["+200", "+200"], // l. 4727, le compte tenu est « plus de 120 clients »
  ["Prix mensuel fixe", "Prix mensuel fixe"], // l. 4794, aucun prix
  ["Recevoir le tarif", "Recevoir le tarif"], // l. 4802
  ["avant 16 h", "avant 16 h"], // l. 4777, délai chiffré
  ["la nuit suivante", "la nuit suivante"], // l. 4774
  ["Délai garanti par contrat", "Délai garanti par contrat"], // l. 4860
  ["Six semaines d", "Six semaines d"], // l. 4847, chiffre RH non confirmé
  ["sous 48", "sous 48"], // l. 4879, seul « rappel dans l'heure » est autorisé
  ["la régie classique", "la régie classique"], // l. 4774, mot proscrit
] as const;

for (const [dansLaMaquette, interdit] of INTERDITS_DE_LA_MAQUETTE) {
  assert.ok(
    MAQUETTE.includes(dansLaMaquette),
    `« ${dansLaMaquette} » n'est plus dans la maquette : cette liste d'interdits est à relire`,
  );
  assert.ok(
    !rendu.includes(interdit),
    `formulation interdite rendue : « ${interdit} »`,
  );
}

// Les interdits généraux du contrat, cherchés sur un texte normalisé.
const normalise = rendu.replace(/ /g, " ").replace(/’/g, "'");
for (const mot of [
  "200 clients",
  "cinq agences",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "incontournable",
  "découvrez",
  "—",
]) {
  assert.ok(
    !normalise.toLowerCase().includes(mot.toLowerCase()),
    `mot proscrit par le contrat dans le rendu : « ${mot} »`,
  );
}

/* --------------------------- 6. une section sans donnée ne se rend pas */

// Les quatre sections sous condition n'ont reçu aucune donnée : aucun de leurs
// titres ne doit apparaître, pas même orphelin.
for (const titre of [
  "Comment ça marche",
  "Trois formules",
  "Le comparatif",
  "Le premier mois",
  "La règle",
]) {
  assert.ok(
    MAQUETTE.includes(titre),
    `« ${titre} » n'est plus dans la maquette : ce contrôle est à relire`,
  );
  assert.ok(
    !rendu.includes(titre),
    `la section « ${titre} » ne reçoit aucune donnée : elle ne doit pas se rendre`,
  );
}

// La bande de repères du héros reste vide : son filet ne doit pas apparaître.
assert.ok(
  !rendu.includes("height:34px"),
  "sans repères, la bande du héros et ses filets ne se rendent pas",
);

// La pastille du héros non plus : la maquette la dessine (l. 4712) mais le
// corpus n'écrit nulle part le libellé d'offre qu'elle porterait.
assert.ok(
  MAQUETTE.includes("font:600 12px var(--fb)"),
  "la pastille du héros n'est plus dans la maquette : ce contrôle est à relire",
);
assert.ok(
  !rendu.includes("font:600 12px var(--fb)"),
  "sans libellé, la pastille du héros ne se rend pas",
);

// Le maillage du corpus écrit en Markdown doit sortir en lien, pas en crochets.
assert.ok(
  rendu.includes('href="/offres/residence/cahier-des-charges') &&
    !rendu.includes("[cahier des charges]"),
  "le chapeau du héros doit passer par TexteRiche",
);

// Les animations viennent de Moteurs.tsx : le gabarit ne pose que l'attribut.
assert.ok(
  (rendu.match(/data-reveal/g) ?? []).length >= 3,
  "chaque section sous le héros porte data-reveal",
);

/* ------------------------------------------- un contenu réduit à son gabarit */

const VIDE: ContenuOffre = { gabarit: "offre" };
const renduVide = renderToStaticMarkup(
  <PageOffre titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
assert.ok(
  !renduVide.includes("En bref"),
  "sans chiffres, la section « En bref » ne se rend pas",
);
assert.ok(
  !renduVide.includes("Chaque situation a son offre"),
  "sans autres offres, la section « Un autre besoin ? » ne se rend pas",
);
assert.ok(
  !renduVide.includes("1.12fr .88fr"),
  "sans en-tête de formulaire, le héros tient sur une colonne",
);

/* ------------------------- les dix-huit pages réelles, telles qu'elles iront en base */

/**
 * Le même contrôle, sur la DONNÉE RÉELLE des dix-huit pages.
 *
 * POURQUOI EN PLUS de la page d'exemple : l'exemple vérifie le gabarit, pas le
 * contenu. Or ce qui part en base, c'est `supabase/import/gabarits-maquette/`,
 * produit par `scripts/produit_gabarit_offre.mjs` depuis le corpus rédigé. Un
 * interdit de copie peut très bien venir du corpus et non du gabarit, et seule
 * la donnée réelle le montre. Sans ce passage, le contrôle aurait validé un
 * gabarit propre servant dix-huit pages fautives.
 */
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const fichiers = readdirSync(DOSSIER)
  .filter((n) => n.startsWith("offres-") && n.endsWith(".json"))
  .sort();

assert.equal(
  fichiers.length,
  18,
  `18 pages d'offre attendues dans ${DOSSIER}, ${fichiers.length} trouvée(s)`,
);

for (const nom of fichiers) {
  const brut = JSON.parse(
    readFileSync(join(DOSSIER, nom), "utf8"),
  ) as { url: string; contenu: ContenuOffre };

  assert.equal(
    brut.contenu.gabarit,
    "offre",
    `${nom} : le contenu doit se déclarer « offre », sinon la route retombe sur le gabarit de vente`,
  );

  const page = renderToStaticMarkup(
    <PageOffre
      titre={`Titre de ${brut.url}`}
      contenu={brut.contenu}
      formulaire={`cocon${brut.url.replace(/\//g, "-")}`}
      // Pas de fil d'Ariane ni de maillage : ils interrogent la base.
    />,
  );

  assert.equal(
    (page.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(page), `${nom} : un href="#" est rendu`);

  const texte = page.replace(/\u00a0/g, " ").replace(/\u2019/g, "'");
  for (const [dansLaMaquette, interdit] of INTERDITS_DE_LA_MAQUETTE) {
    void dansLaMaquette;
    assert.ok(
      !texte.includes(interdit),
      `${nom} : formulation interdite rendue, « ${interdit} »`,
    );
  }
  for (const mot of ["200 clients", "cinq agences", "régie", "intérim", "—"]) {
    assert.ok(
      !texte.toLowerCase().includes(mot.toLowerCase()),
      `${nom} : mot proscrit rendu, « ${mot} »`,
    );
  }

  // Les quatre sections sous condition ne reçoivent aucune donnée sur AUCUNE
  // des dix-huit pages : c'est la décision du chantier, et elle se vérifie.
  for (const titre of ["Comment ça marche", "Trois formules", "Le comparatif", "Le premier mois"]) {
    assert.ok(
      !page.includes(titre),
      `${nom} : la section « ${titre} » ne doit recevoir aucune donnée`,
    );
  }
}

console.log(`  ${fichiers.length} pages réelles rendues et vérifiées.`);

console.log("gabarit offre : toutes les vérifications passent.");
console.log(
  `  ${MAQUETTE.split("\n").length} lignes de maquette relues, ` +
    `${INTERDITS_DE_LA_MAQUETTE.length} interdits de copie vérifiés présents dans la maquette et absents du rendu.`,
);
