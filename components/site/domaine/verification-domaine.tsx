/**
 * Contrôle des gabarits 09 DOMAINE et 05 SPÉCIALITÉ, sans navigateur.
 *
 *   bun components/site/domaine/verification-domaine.tsx
 *
 * CE QUE CE CONTRÔLE GARANTIT, et pourquoi chaque point y est :
 *
 * 1. LES VALEURS DE LA MAQUETTE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire. `maquette/gabarit-09-domaine.html` et
 *    `maquette/gabarit-05-specialite.html` sont versionnés pour cela. Une note
 *    de lecture prise à travers le MCP peut se tromper, un fichier relu non. Et
 *    c'est exactement l'erreur qui a coûté des semaines : le portage précédent a
 *    travaillé depuis « Migen - Site final.dc.html » sans avoir listé les
 *    fichiers du projet, où ONZE GABARITS DÉDIÉS attendaient.
 * 2. LES DOUZE SECTIONS SONT DANS L'ORDRE DU FICHIER, relevé par ses propres
 *    `data-screen-label`, et le MAILLAGE CHANGE DE PLACE entre les deux
 *    gabarits : juste après l'offre pour un domaine, tout en bas pour une
 *    spécialité. C'est la divergence de dessin entre les deux fichiers.
 * 3. UN SEUL H1 par page.
 * 4. AUCUN `href="#"`. La maquette navigue par sa propre logique, qui n'est pas
 *    portée : recopier ses cibles vides aurait donné des boutons morts.
 * 5. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`. La charte vit
 *    dans les jetons de `app/globals.css`, et le site n'a pas de mode sombre.
 * 6. LES INTERDITS DE COPIE sont absents du rendu, y compris ceux que le CORPUS
 *    porte encore : « 24/24 et 7/7 » est écrit dans dix pages, et la maquette
 *    elle-même le retire par sa fonction `__c247`. Le contrat gagne.
 * 7. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. Pas de surtitre orphelin,
 *    pas de carte vide, pas de valeur inventée pour meubler.
 *
 * COMMENT IL A ÉTÉ CRU. Une faute a été injectée dans `PageDomaine.tsx` avant
 * qu'il ne soit cru, et il a échoué. Un contrôle qui n'a jamais échoué ne prouve
 * rien.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { Section } from "@/types/contenu";
import { estDomaineOuSpecialite, type ContenuDomaine } from "@/types/domaine";

import PageDomaine from "./PageDomaine";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* ------------------------------------------ la maquette, relue à chaque fois */

function lisMaquette(nom: string): string {
  const texte = readFileSync(join(RACINE, "maquette", nom), "utf8");
  assert.ok(
    texte.includes("<main data-screen-label="),
    `${nom} ne porte pas de <main data-screen-label=…> : fichier à revérifier`,
  );
  return texte;
}

const DOMAINE = lisMaquette("gabarit-09-domaine.html");
const SPECIALITE = lisMaquette("gabarit-05-specialite.html");

/** L'ordre des sections du fichier, par ses propres étiquettes d'écran. */
function sectionsDeLaMaquette(fichier: string): string[] {
  return [...fichier.matchAll(/<section data-screen-label="([^"]+)"/g)].map(
    (m) => m[1],
  );
}

/** Ce que la maquette écrit en toutes lettres, et qui doit se retrouver rendu. */
function copie(fichier: string, texte: string, nom: string): string {
  assert.ok(
    fichier.includes(texte),
    `${nom} ne porte pas la copie « ${texte} » : valeur à revérifier dans le fichier`,
  );
  return texte;
}

/** Une déclaration de style du fichier, relevée par la valeur qui l'ouvre. */
function style(fichier: string, fragment: string, nom: string): string {
  assert.ok(
    fichier.includes(fragment),
    `${nom} ne porte pas « ${fragment} » : valeur à revérifier dans le fichier`,
  );
  return fragment;
}

/* ------------------------------------------------------- une page d'exemple */

/**
 * La forme que `scripts/produit_domaines.mjs` écrit vraiment, et le texte du
 * corpus tel qu'il est : avec son « 24/24 et 7/7 », ses liens Markdown, et une
 * réalisation sans étude de cas publiée. C'est le comportement qu'il faut
 * vérifier, pas un cas de laboratoire.
 */
const SECTIONS: Section[] = [
  {
    type: "heros",
    h1: "Maintenance hydraulique",
    mecanisme: "Nous remettons de la mesure là où il n'y en a plus.",
    cta: "Demander une intervention",
    telephone: "04 78 33 72 05",
    phraseDelai:
      "Rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30. L'astreinte 24/24 et 7/7 prend le relais la nuit et le week-end.",
  },
  {
    type: "chiffres",
    chiffres: [
      { valeur: "10 %", libelle: "des candidats retenus" },
      { valeur: "+ 80", libelle: "clients réguliers" },
      // Une valeur qui n'est QUE la mention interdite : la ligne doit tomber.
      { valeur: "24/24 et 7/7", libelle: "astreinte, pour les sites couverts" },
    ],
  },
  {
    type: "probleme",
    punchline:
      "Tout le monde essuie la flaque sous la presse. Personne ne traite ce qui la produit.",
    puces: [
      {
        accroche: "Personne ne surveille l'hydraulique.",
        texte: "Aucune analyse de fluide, aucun relevé de température.",
      },
    ],
  },
  {
    type: "offre",
    lignes: [
      {
        prestation: {
          accroche: "Une pression stable du premier au dernier cycle",
          texte: "pompes, limiteurs, accumulateurs.",
        },
        benefice: "La cadence tient, cycle après cycle.",
      },
    ],
    prose: [
      {
        texte:
          "Le [contrat de maintenance Zéro arrêt](/offres/zero-arret/) coûte moins cher que la troisième intervention. Une fuite en cours se traite par le [dépannage industriel](/offres/depannage-industriel/). Une cible hors domaine est écartée : [ailleurs](https://exemple.test/).",
      },
    ],
  },
  {
    type: "deroule",
    etapes: [
      {
        titre: "Vous décrivez la situation",
        texte: "circuit, symptôme, pression relevée, bruit, depuis quand.",
      },
      {
        titre: "Un technicien vous rappelle dans l'heure",
        texte: "le circuit est qualifié avec vous avant tout déplacement.",
      },
    ],
  },
  {
    type: "garanties",
    puces: [
      {
        accroche: "Le rappel dans l'heure, du lundi au vendredi.",
        texte: "L'astreinte 24/24 et 7/7 couvre la nuit et le week-end.",
      },
    ],
  },
  {
    type: "cta",
    question: "Besoin de savoir pourquoi votre presse perd sa pression ?",
    bouton: "Demander une intervention",
    rappel:
      "Ou appelez le 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30.",
  },
  {
    type: "preuves",
    preuves: [
      {
        titre: "Dépannage de presses hydrauliques sur site",
        texte: "un technicien intégré à temps plein, site tenu 7 jours sur 7",
        lienLibelle: "Étude de cas VOIT : site du Grand Est",
        lienHref: "/preuves/voit-grand-est/",
      },
      {
        titre: "Maintenance préventive d'une fonderie",
        texte: "avec les équipes techniques internes",
        lienLibelle: "Étude de cas STELLANTIS : fonderie de Sept-Fons",
        lienHref: "/preuves/stellantis-fonderie-sept-fons/",
      },
      // Sans étude de cas publiée : la carte reste une carte, sans lien mort.
      { titre: "Montages et déplacements de machines" },
    ],
  },
  {
    type: "objections",
    questions: [
      {
        question: "Couvrez-vous notre région ?",
        reponse:
          "4 agences, Lyon (siège), Montréal, Dubaï et Madrid, et des hubs de techniciens partout en France. Voir les [implantations](/implantations/).",
      },
    ],
  },
  {
    type: "ctaFinal",
    question: "Besoin d'arrêter de payer deux fois le même vérin ?",
    bouton: "Demander une intervention",
  },
];

function rend(contenu: ContenuDomaine): string {
  return renderToStaticMarkup(
    <PageDomaine
      titre="Maintenance hydraulique"
      contenu={contenu}
      formulaire="controle-domaine"
    />,
  );
}

const rendu = {
  domaine: rend({ gabarit: "domaine", sections: SECTIONS }),
  specialite: rend({ gabarit: "specialite", sections: SECTIONS }),
};

/* ------------------------------------- 1 et 2. les douze sections, dans l'ordre */

/**
 * L'ordre des sections rendues, relevé sur le même attribut que la maquette.
 * Les sections de la maquette que le composant ne porte pas (il n'y en a pas)
 * feraient échouer la comparaison, et c'est le but.
 */
function sectionsRendues(html: string): string[] {
  return [...html.matchAll(/data-screen-label="([^"]+)"/g)].map((m) => m[1]);
}

for (const [gabarit, fichier, html] of [
  ["domaine", DOMAINE, rendu.domaine],
  ["specialite", SPECIALITE, rendu.specialite],
] as const) {
  const attendues = sectionsDeLaMaquette(fichier);
  assert.equal(
    attendues.length,
    12,
    `${gabarit} : la maquette porte ${attendues.length} sections, 12 attendues`,
  );
  assert.deepEqual(
    sectionsRendues(html),
    attendues,
    `${gabarit} : l'ordre des sections rendues ne suit pas celui du fichier`,
  );
}

/* L'étiquette du <main>, qui nomme le gabarit, et la place du maillage. */
assert.ok(DOMAINE.includes('<main data-screen-label="Gabarit 09 Domaine">'));
assert.ok(SPECIALITE.includes('<main data-screen-label="Gabarit 05 Spécialité">'));

const placeDomaine = sectionsDeLaMaquette(DOMAINE).indexOf("Maillage");
const placeSpecialite = sectionsDeLaMaquette(SPECIALITE).indexOf("Maillage");
assert.equal(placeDomaine, 4, "le maillage du gabarit 09 suit « 04 Offre »");
assert.equal(
  placeSpecialite,
  10,
  "le maillage du gabarit 05 vient après « 09 Questions », avant l'appel final",
);
assert.notEqual(
  placeDomaine,
  placeSpecialite,
  "les deux gabarits placeraient le maillage au même endroit : relire les fichiers",
);

/* ------------------------------- les surtitres, et ils distinguent les gabarits */

/** Chaque surtitre orange du fichier, dans l'ordre, en texte brut. */
function surtitres(fichier: string): string[] {
  return [
    ...fichier.matchAll(
      /letter-spacing:\.14em;text-transform:uppercase;color:var\(--(?:acc|ink4)\)[^>]*>([^<]+)</g,
    ),
  ].map((m) => m[1]);
}

for (const [gabarit, fichier, html] of [
  ["domaine", DOMAINE, rendu.domaine],
  ["specialite", SPECIALITE, rendu.specialite],
] as const) {
  const attendus = surtitres(fichier);
  assert.ok(
    attendus.length >= 11,
    `${gabarit} : seulement ${attendus.length} surtitres relevés dans le fichier`,
  );
  for (const surtitre of attendus) {
    assert.ok(
      html.includes(surtitre.replace(/'/g, "&#x27;")) ||
        html.includes(surtitre),
      `${gabarit} : le surtitre « ${surtitre} » du fichier n'est pas rendu`,
    );
  }
}

/* Le surtitre du maillage, et le H2 qui ne vient qu'avec le gabarit 09. */
assert.ok(
  rendu.domaine.includes(copie(DOMAINE, "La famille technique", "gabarit 09")),
);
assert.ok(
  rendu.domaine.includes(
    copie(DOMAINE, "Les spécialités et pages liées", "gabarit 09"),
  ),
);
assert.ok(
  rendu.specialite.includes(
    copie(SPECIALITE, "Pour aller plus loin", "gabarit 05"),
  ),
);
assert.ok(
  !rendu.specialite.includes("Les spécialités et pages liées"),
  "le gabarit 05 ne porte pas de H2 sur son maillage : il ne doit pas être rendu",
);
assert.ok(
  !SPECIALITE.includes("La famille technique"),
  "« La famille technique » n'appartient qu'au gabarit 09 : relire les fichiers",
);

/* La pastille du héros, deuxième divergence entre les deux fichiers. Elle est
   relevée dans chaque fichier à la même place, juste après le point orange. */
function pastille(fichier: string, nom: string): string {
  const m = fichier.match(/background:var\(--acc\)"><\/span>([^<]+)<\/span>/);
  assert.ok(m, `${nom} : la pastille du héros est introuvable`);
  return m[1];
}
const pastilleDomaine = pastille(DOMAINE, "gabarit 09");
const pastilleSpecialite = pastille(SPECIALITE, "gabarit 05");
assert.notEqual(
  pastilleDomaine,
  pastilleSpecialite,
  "les deux fichiers annonceraient la même pastille : relire les fichiers",
);
assert.ok(
  rendu.domaine.includes(`${pastilleDomaine}</span>`),
  `la pastille « ${pastilleDomaine} » du gabarit 09 n'est pas rendue`,
);
assert.ok(
  rendu.specialite.includes(`${pastilleSpecialite}</span>`),
  `la pastille « ${pastilleSpecialite} » du gabarit 05 n'est pas rendue`,
);

/* --------------------------------------- la copie fixe, celle de la maquette */

for (const texte of [
  "Ce que nous faisons, et ce que ça change pour vous",
  "Ce que nous faisons",
  "Ce que ça change pour vous",
  "Comment ça se passe, étape par étape",
  "Ce que nous garantissons",
  "Nos références",
  "Vos questions avant de nous appeler",
  "MASE",
  "Démarche sécurité des interventions",
  "EcoVadis",
  "Évaluation de la performance RSE",
  "Les attestations sont transmises avec chaque plan de prévention.",
  "4 agences",
  "Lyon (siège), Montréal, Dubaï, Madrid",
  "10 hubs de techniciens",
  "nuit, week-end et jours fériés",
  "Ils nous font confiance",
]) {
  copie(DOMAINE, texte, "gabarit 09");
  assert.ok(
    rendu.domaine.includes(texte),
    `la copie « ${texte} » du fichier n'est pas rendue`,
  );
}

/* Les dix hubs, relevés dans le fichier et non dans une liste écrite ici. */
const hubsDuFichier = (() => {
  const m = DOMAINE.match(/const HUBS = \[([^\]]+)\]/);
  assert.ok(m, "la liste HUBS est introuvable dans le gabarit 09");
  return m[1].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
})();
assert.equal(hubsDuFichier.length, 10, "le fichier annonce dix hubs");
for (const hub of hubsDuFichier) {
  assert.ok(
    rendu.domaine.includes(`>${hub}</span>`),
    `le hub « ${hub} » du fichier n'est pas rendu`,
  );
}

/* Les valeurs d'habillage, relues elles aussi. */
for (const fragment of [
  "grid-template-columns:1.1fr .9fr",
  "grid-template-columns:52px minmax(0,1.05fr) minmax(0,.95fr)",
  "grid-template-columns:repeat(auto-fit,minmax(250px,1fr))",
  "grid-template-columns:repeat(3,minmax(0,1fr))",
  "font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)",
  "border-top:2px solid var(--acc)",
  "box-shadow:0 0 0 6px var(--bg)",
]) {
  style(DOMAINE, fragment, "gabarit 09");
}

/* --------------------------------------------------- 3. un seul H1 par page */

for (const [gabarit, html] of Object.entries(rendu)) {
  const h1 = html.match(/<h1\b/g) ?? [];
  assert.equal(h1.length, 1, `${gabarit} : ${h1.length} H1 rendus, 1 attendu`);
  assert.ok(
    html.includes("Maintenance hydraulique"),
    `${gabarit} : le H1 du corpus n'est pas rendu`,
  );
}

/* ------------------------------------------- 4. aucune cible morte, un seul id */

for (const [gabarit, html] of Object.entries(rendu)) {
  assert.ok(
    !/href="#"/.test(html),
    `${gabarit} : un href="#" est rendu, donc un bouton mort`,
  );
  assert.ok(
    !/href=""/.test(html),
    `${gabarit} : un href vide est rendu`,
  );
  assert.ok(
    !html.includes("exemple.test"),
    `${gabarit} : une cible hors domaine est rendue en lien`,
  );
  const ancres = html.match(/id="formulaire"/g) ?? [];
  assert.equal(
    ancres.length,
    1,
    `${gabarit} : ${ancres.length} ancres #formulaire, 1 attendue — les six appels à l'action viseraient le premier venu`,
  );
  assert.ok(
    html.includes('href="#formulaire"'),
    `${gabarit} : aucun appel à l'action ne vise le formulaire`,
  );
}

/* ---------------------------------- 5. aucune classe Tailwind de couleur */

const COULEURS =
  /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
for (const [gabarit, html] of Object.entries(rendu)) {
  for (const classe of html.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !COULEURS.test(classe[1]),
      `${gabarit} : classe Tailwind de couleur rendue — « ${classe[1]} »`,
    );
    assert.ok(
      !/\bdark:/.test(classe[1]),
      `${gabarit} : variante dark: rendue — « ${classe[1]} »`,
    );
  }
}

/* --------------------------------------------- 6. les interdits du contrat */

/**
 * Les interdits, et le fait que plusieurs sont DANS la maquette ou DANS le
 * corpus : c'est le contrat qui gagne, pas le dessin.
 */
const INTERDITS: [RegExp, string][] = [
  [/24\s*\/\s*24/, "aucune disponibilité chiffrée, seul « rappel dans l'heure »"],
  [/7\s*\/\s*7/, "idem"],
  [/7\s+jours\s+sur\s+7/, "idem"],
  [/sous\s+\d+\s*h/i, "aucun délai chiffré d'intervention"],
  [/\+\s*200|200\s+clients/, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/5\s+agences|cinq\s+agences/i, "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  [/\brégie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bintérim\b/i, "nommer la prestation, jamais le statut"],
  [/mise\s+à\s+disposition/i, "« intervention » ou « mission »"],
  [/sans\s+engagement/i, "dire la durée réelle"],
  [/clé\s+en\s+main/i, "dire ce qui est fait"],
  [/sur\s+mesure/i, "dire ce qui s'adapte, et à quoi"],
  [/\blevier\b/i, "dire l'effet obtenu"],
  [/concrètement/i, "à supprimer"],
  [/notamment/i, "à supprimer, ou « dont »"],
  [/incontournable/i, "à supprimer"],
  [/découvrez/i, "un verbe qui dit ce que la page fait"],
  [/—/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  [/\d+\s*(?:€|euros)/i, "aucun prix"],
];

for (const [gabarit, html] of Object.entries(rendu)) {
  // Le texte seul : une valeur d'attribut `style` porte des tirets, pas de la copie.
  const texte = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  for (const [motif, remede] of INTERDITS) {
    const trouve = texte.match(motif);
    assert.ok(
      !trouve,
      `${gabarit} : « ${trouve?.[0]} » est rendu. À la place : ${remede}`,
    );
  }
}

/* Et la coupe a bien laissé l'information utile, pas effacé la phrase. */
assert.ok(
  rendu.domaine.includes("Rappel dans l"),
  "« rappel dans l'heure » doit rester : c'est le seul délai autorisé",
);
assert.ok(
  rendu.domaine.includes("prend le relais la nuit et le week-end"),
  "la coupe a emporté la phrase entière au lieu de la seule mention chiffrée",
);
assert.ok(
  !rendu.domaine.includes("astreinte, pour les sites couverts"),
  "la ligne « En bref » dont la valeur n'était QUE l'interdit doit tomber entière",
);
assert.ok(
  rendu.domaine.includes("clients réguliers"),
  "les deux autres lignes « En bref » doivent rester",
);

/* ------------------------------ 7. une section sans donnée ne se rend pas */

const SECTIONS_PILOTEES: [Section["type"], string][] = [
  ["probleme", "Votre problématique"],
  ["offre", "L’offre"],
  ["deroule", "Le déroulé"],
  ["garanties", "Notre parti pris"],
  ["preuves", "Nos réalisations"],
  ["objections", "Questions fréquentes"],
];

for (const [type, surtitre] of SECTIONS_PILOTEES) {
  const sans = rend({
    gabarit: "domaine",
    sections: SECTIONS.filter((s) => s.type !== type),
  });
  assert.ok(
    !sans.includes(surtitre),
    `sans section « ${type} », le surtitre « ${surtitre} » est encore rendu : ` +
      "un titre orphelin est pire qu'une section absente",
  );
  assert.ok(
    rendu.domaine.includes(surtitre),
    `avec la section « ${type} », le surtitre « ${surtitre} » devrait être rendu`,
  );
}

/* Et le cas extrême : aucune section du tout. La page tient, et ne rend ni
   surtitre orphelin, ni carte vide, ni H1 en double. */
const vide = rend({ gabarit: "domaine", sections: [] });
for (const [, surtitre] of SECTIONS_PILOTEES) {
  assert.ok(!vide.includes(surtitre), `page vide : « ${surtitre} » est rendu`);
}
assert.ok(!vide.includes("La famille technique"), "page vide : maillage rendu");
assert.ok(!vide.includes("Ils nous font confiance"), "page vide : frise rendue");
assert.equal((vide.match(/<h1\b/g) ?? []).length, 1, "page vide : un seul H1");

/* Le maillage : il vient des liens du texte, et seulement des internes. */
assert.ok(rendu.domaine.includes("/offres/zero-arret/"));
assert.ok(rendu.domaine.includes("/implantations/"));
assert.ok(
  !rendu.domaine.includes(">/preuves/voit-grand-est/<"),
  "une étude de cas ne devient pas une carte de maillage : elle a sa section",
);

/* La frise : les noms de clients, et la seconde moitié masquée aux lecteurs. */
assert.ok(rendu.domaine.includes("VOIT"));
assert.ok(rendu.domaine.includes("STELLANTIS"));
assert.ok(
  (rendu.domaine.match(/aria-hidden="true"/g) ?? []).length > 0,
  "la seconde moitié de la frise doit être masquée aux lecteurs d'écran",
);

/* ------------- 8. les VRAIES pages, telles que l'import les posera en base */

/**
 * Les deux pages témoins, lues dans les fichiers que `produit_domaines.mjs`
 * écrit, passées par le MÊME garde que la route, et rendues.
 *
 * POURQUOI CE DERNIER POINT EXISTE. Le piège de ce projet, écrit dans
 * `CLAUDE.md` section 16 : un gabarit porté en composant ne change RIEN tant que
 * `pages.contenu` ne porte pas son discriminant. Quatre gabarits ont été écrits,
 * relus, testés, et 126 pages ont continué d'être servies par le gabarit de
 * vente sans que rien ne le signale. Ce contrôle-ci ferme la boucle du côté
 * vérifiable hors base : la donnée produite est bien reconnue par le garde de la
 * route, et elle rend bien douze sections.
 *
 * CE QU'IL NE PROUVE PAS, et il faut le dire : que la BASE porte cette donnée.
 * `SUPABASE_SERVICE_ROLE_KEY` est vide, donc `scripts/importe_rest.mjs` n'a pas
 * pu écrire. Tant qu'il n'a pas tourné, `/expertises/hydraulique/` sert encore le
 * gabarit de vente, et aucun contrôle de composant ne le dira.
 */
for (const [chemin, gabaritAttendu] of [
  ["expertises-hydraulique.json", "domaine"],
  ["expertises-automatisme-siemens.json", "specialite"],
] as const) {
  const brut: unknown = JSON.parse(
    readFileSync(
      join(RACINE, "supabase", "import", "gabarits-maquette", chemin),
      "utf8",
    ),
  );
  const { url, contenu } = brut as { url: string; contenu: unknown };
  assert.ok(
    estDomaineOuSpecialite(contenu),
    `${chemin} : le garde de la route ne reconnaît pas ce contenu, ` +
      "la page resterait au gabarit de vente sans que rien ne le signale",
  );
  assert.equal(contenu.gabarit, gabaritAttendu, `${chemin} : mauvais gabarit`);
  const html = renderToStaticMarkup(
    <PageDomaine titre={url} contenu={contenu} formulaire="controle" />,
  );
  assert.equal(
    sectionsRendues(html).length,
    12,
    `${url} : ${sectionsRendues(html).length} sections rendues, 12 attendues`,
  );
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${url} : un seul H1`);
  assert.ok(
    !html.includes("Le problème") && !html.includes("Nos engagements"),
    `${url} : un surtitre du gabarit de VENTE est encore rendu`,
  );
  const texte = html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'");
  for (const [motif] of INTERDITS) {
    const trouve = texte.match(motif);
    assert.ok(!trouve, `${url} : « ${trouve?.[0]} » est rendu`);
  }
}

console.log(
  "gabarits 09 Domaine et 05 Spécialité conformes.\n" +
    `  12 sections dans l'ordre des deux fichiers, maillage en position ` +
    `${placeDomaine + 1} (domaine) et ${placeSpecialite + 1} (spécialité)\n` +
    `  ${surtitres(DOMAINE).length} surtitres relus dans maquette/gabarit-09-domaine.html\n` +
    `  ${hubsDuFichier.length} hubs, 4 agences, un seul H1, une seule ancre #formulaire\n` +
    `  ${INTERDITS.length} interdits absents du rendu, ${SECTIONS_PILOTEES.length} sections ` +
    "vérifiées absentes quand le corpus ne les alimente pas\n" +
    "  2 pages témoins relues dans supabase/import/gabarits-maquette/, reconnues par le garde\n" +
    "  NON PROUVÉ ICI : que la base porte cette donnée. SUPABASE_SERVICE_ROLE_KEY est vide,\n" +
    "  scripts/importe_rest.mjs n'a pas pu écrire, et /expertises/hydraulique/ sert encore\n" +
    "  le gabarit de vente. Voir CLAUDE.md section 16.",
);
