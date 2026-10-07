/**
 * Contrôle du gabarit « 09 Domaine », sans navigateur.
 *
 *   bun components/site/expertises/domaine/verification-domaine.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * dans `maquette/rendu/expertises--robotique.html` et
 * `expertises--automatisme.html` (16 sections chacune, captures du 07/10).
 * L'ancien contrôle `scripts/verifie-domaine.tsx` comparait à l'export de
 * démonstration `accueil-rendu.html` (`isDomaine`), qui n'est le gabarit
 * d'aucune page : c'est l'erreur du 05/10, et c'est elle qui a produit les
 * écarts de 59 à 73 % mesurés sur `/expertises/robotique/`.
 *
 * CE QUE CE CONTRÔLE GARANTIT, calqué sur `verification-offre.tsx` :
 *
 * 1. LES VALEURS DE LA CAPTURE SONT RELUES À CHAQUE EXÉCUTION : chaque dessin
 *    et chaque copie sont d'abord vérifiés PRÉSENTS dans la capture, puis dans
 *    le rendu.
 * 2. LES PAGES RÉELLES sont rendues depuis leur vraie donnée,
 *    `supabase/import/gabarits-maquette/expertises-robotique.json` et
 *    `expertises-automatisme.json`, celles que la route sert.
 * 3. UN SEUL H1, aucun `href="#"`, les cibles du bento et des secteurs rendues.
 * 4. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`.
 * 5. LES INTERDITS DU CONTRAT absents du rendu (prix, tarif, taux horaire,
 *    « +200 », régie, sur mesure, sans engagement, tiret cadratin…).
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS.
 * 7. LA NOUVELLE FORME NE CAPTURE PAS LES NEUF PAGES NON REPORTÉES : un
 *    fichier à l'ancienne forme ne passe pas `estDomaine`, la route continue
 *    de les servir comme avant.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { estDomaine, type ContenuDomaine } from "@/types/domaine";

import PageDomaine from "./PageDomaine";

const RACINE = fileURLToPath(new URL("../../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ----------------------------------------- les captures, relues à chaque fois */

function litCapture(nom: string): string {
  return readFileSync(join(RACINE, "maquette", "rendu", `${nom}.html`), "utf8");
}

/** Même normalisation que `verification-offre.tsx` : une seule écriture. */
function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

function normaliseTexte(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|’/g, "'")
    .replace(/\s+/g, " ");
}

function texteLisible(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuDomaine;
}

function litPage(nom: string): PageRelais {
  return JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais;
}

/* --------------------------------------------------- les interdits du contrat */

const INTERDITS = [
  "—",
  "+200",
  "prix ",
  "tarif",
  "taux horaire",
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
  "limonest",
] as const;

function verifieInterdits(page: string, nom: string): void {
  const visible = texteLisible(page.replace(/<[^>]+>/g, " ")).toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(
      !visible.includes(mot),
      `${nom} : mot proscrit par le contrat dans le rendu, « ${mot} »`,
    );
  }
}

/* ------------------------------------------- une page pilote contre sa capture */

function verifiePilote(
  capture: string,
  fichier: string,
  dessins: readonly string[],
  copies: readonly string[],
  cibles: readonly string[],
): string {
  const CAPTURE = litCapture(capture);
  const CAPTURE_STYLE = normaliseStyle(CAPTURE);
  const CAPTURE_TEXTE = texteLisible(CAPTURE);

  const page = litPage(fichier);
  assert.ok(
    estDomaine(page.contenu),
    `${fichier} : la donnée doit porter la NOUVELLE forme domaine (gabarit + sections)`,
  );
  assert.ok(
    typeof page.titre_h1 === "string" && page.titre_h1.length > 0,
    `${fichier} : le relais doit porter le H1 de la capture`,
  );
  assert.ok(
    CAPTURE_TEXTE.includes(normaliseTexte(page.titre_h1!)),
    `${fichier} : le H1 du relais n'est pas celui de la capture`,
  );

  const rendu = renderToStaticMarkup(
    <PageDomaine
      titre={page.titre_h1!}
      contenu={page.contenu}
      formulaire={`cocon${page.url.replace(/\//g, "-")}`}
    />,
  );

  /* 1. la fidélité du dessin : chaque valeur est d'abord vérifiée dans la
     capture, puis dans le rendu. */
  for (const fragment of dessins) {
    const attendu = normaliseStyle(fragment);
    assert.ok(
      CAPTURE_STYLE.includes(attendu),
      `${capture} ne porte pas le dessin « ${fragment} » : valeur à revérifier`,
    );
    assert.ok(
      normaliseStyle(rendu).includes(attendu),
      `${fichier} : le rendu ne porte pas le dessin de la capture « ${fragment} »`,
    );
  }

  /* 2. les copies, mot pour mot. */
  for (const texte of copies) {
    const attendu = normaliseTexte(texte);
    assert.ok(
      CAPTURE_TEXTE.includes(attendu),
      `${capture} ne porte pas la copie « ${texte} »`,
    );
    assert.ok(
      texteLisible(rendu).includes(attendu),
      `${fichier} : le rendu ne porte pas la copie de la capture « ${texte} »`,
    );
  }

  /* 3. un seul h1, et c'est celui de la page. */
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${fichier} : une page doit porter exactement un h1`,
  );

  /* 4. aucune cible morte, et les cibles de la capture rendues. */
  assert.ok(!/href="#"/.test(rendu), `${fichier} : un href="#" est rendu`);
  assert.ok(
    rendu.includes('href="#besoin"'),
    `${fichier} : le bouton du héros doit viser l'ancre du formulaire`,
  );
  assert.ok(
    rendu.includes('id="mgx-form"') && rendu.includes('href="#mgx-form"'),
    `${fichier} : l'ancre #mgx-form de la capture doit exister ET être visée`,
  );
  for (const cible of cibles) {
    assert.ok(
      rendu.includes(`href="${cible}/"`) || rendu.includes(`href="${cible}"`),
      `${fichier} : la capture vise ${cible}/ : lien absent du rendu`,
    );
  }

  /* 5. aucun échafaudage Tailwind. */
  for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
    assert.ok(
      !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
        classe[1],
      ),
      `${fichier} : classe Tailwind de couleur dans le rendu : « ${classe[1]} »`,
    );
    assert.ok(
      !/\bdark:/.test(classe[1]),
      `${fichier} : variante dark: dans le rendu : « ${classe[1]} »`,
    );
  }

  /* 6. les interdits du contrat. */
  verifieInterdits(rendu, fichier);

  return rendu;
}

/* ------------------------------------------------- les dessins et copies fixes
   (présents sur les DEUX captures : la section 10, 11 et la FAQ sont identiques
   au caractère près sur les 11 captures du gabarit, empreintes du 07/10). */

const DESSINS_COMMUNS = [
  // 0 · 01 Héros : la section, la grille à deux colonnes, le H1 à 66px.
  "max-width: 1200px; margin: 0px auto; padding: 40px 40px 0px",
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  // le panneau de formulaire du héros.
  "padding: 30px 30px 32px",
  // 1 · 01 Chiffres : la carte en verre.
  "padding: 44px 40px 0px",
  "font: 600 calc(28px * var(--ts))/1 var(--ft)",
  // 2 · 02 Logos.
  "padding: 64px 0px 0px",
  // 3 · Réassurance : la grille .9fr/1.1fr (aussi celle du problème).
  "grid-template-columns: 0.9fr 1.1fr",
  // 4 · 03 Problème : la colonne collante et la photo de 280px.
  "position: sticky; top: 110px",
  "height: 280px",
  // 5 · 04 Offre : le rail numéro + texte.
  "grid-auto-columns: minmax(260px, 300px)",
  "grid-template-columns: 26px minmax(0px, 1fr)",
  // 6 · Appel · offre : la bande arrondie sombre.
  "border-radius: 28px",
  // 8 · 05 Déroulé : la carte d'en-tête orangée.
  "min-height: 240px",
  // 9 · 06 Garanties : le panneau sombre et ses deux colonnes.
  "padding: var(--sec) 24px 0",
  "padding: 58px 56px",
  "grid-template-columns: repeat(2, minmax(0px, 1fr))",
  // 10 · Secteurs de l'expertise : l'en-tête .8fr/1.2fr et les cartes de 200px.
  "grid-template-columns: 0.8fr 1.2fr",
  "min-height: 200px",
  // 11 · Offres du secteur : le bento.
  "grid-row: span 2",
  "min-height: 470px",
  "grid-template-columns: minmax(0px, 1.1fr) minmax(0px, 0.9fr)",
  "min-height: 236px",
  // 12 · Marques maintenues : la grille de tuiles.
  "repeat(auto-fill, minmax(150px, 1fr))",
  // 13 · 08 Références : le rail de cartes.
  "grid-auto-columns: minmax(280px, 320px)",
  // 14 · 09 Questions : la grille de la carte à photo.
  "minmax(0px, 0.8fr) minmax(0px, 1.2fr)",
  // 15 · 10 Appel final.
  "padding: var(--sec) 24px var(--sec)",
  "border-radius: 40px",
] as const;

const COPIES_COMMUNES = [
  // 0 · Héros.
  "Expertises",
  "Demander une intervention",
  "Rappel dans l'heure",
  // 2 et 3 · Logos et réassurance.
  "Ils nous font confiance",
  "Certifications",
  "Qui intervient chez vous",
  "4 agences : Lyon (siège), Montréal, Dubaï, Madrid.",
  // 4 et 5 · Problème et offre.
  "Votre problématique",
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
  // 10 · Secteurs de l'expertise, copie fixe du gabarit.
  "Par secteur d'activité",
  "Même expertise, contraintes différentes",
  "Un roulement se change de la même façon partout.",
  "Agroalimentaire",
  "Aéronautique",
  // 11 · Offres du secteur, copie fixe du gabarit.
  "Nos offres",
  "Six façons de travailler ensemble, selon votre besoin",
  "Décrire mon besoin",
  "migen© Résidence",
  "Voir l'offre",
  "migen© Travaux industriels",
  // 12 · Marques.
  "Marques et constructeurs",
  "Les équipements que nous maintenons déjà",
  // 13 · Références.
  "Nos réalisations",
  "Nos références",
  "Toutes nos études de cas",
  "Lire l'étude de cas",
  // 14 · Questions.
  "Questions fréquentes",
  "Vos questions avant de nous appeler",
  "Poser ma question",
  // 15 · Appel final : la sous-ligne fixe du gabarit.
  "Rappel dans l'heure aux horaires ouvrés.",
] as const;

const CIBLES_COMMUNES = [
  "/secteurs/agroalimentaire",
  "/secteurs/automobile",
  "/secteurs/logistique",
  "/secteurs/pharmaceutique",
  "/secteurs/chimie",
  "/secteurs/aeronautique",
  "/offres/residence",
  "/offres/full-service",
  "/offres/zero-arret",
  "/offres/arret-technique",
  "/offres/bureau-etudes",
  "/travaux-industriels",
  "/preuves",
] as const;

/* ------------------------------------------------- pilote 1 : la robotique */

const renduRobotique = verifiePilote(
  "expertises--robotique",
  "expertises-robotique.json",
  DESSINS_COMMUNS,
  [
    ...COPIES_COMMUNES,
    // La copie de LA page, un échantillon par section du corpus.
    "Un bras qui s'immobilise en plein cycle fige la cellule entière.",
    "Huit fois sur dix, le robot n'est que le messager.",
    "Une recherche de cause racine, pas un échange de pièce",
    "Vous arrêtez de remplacer des organes sains pendant que la ligne attend.",
    "Un parc entier à remettre sous suivi ?",
    "Vous décrivez la panne",
    "Aucune vente de robot ni de licence.",
    "Maintenance des équipements critiques d'un équipementier automobile",
    "Nous n'avons plus le contrat constructeur. Vous prenez la suite ?",
    "Besoin que vos arrêts de cellule diminuent au lieu d'augmenter cette année ?",
  ],
  [...CIBLES_COMMUNES, "/preuves/jtekt", "/preuves/timescope"],
);

/* ---------------------------------------------- pilote 2 : l'automatisme */

verifiePilote(
  "expertises--automatisme",
  "expertises-automatisme.json",
  DESSINS_COMMUNS,
  [
    ...COPIES_COMMUNES,
    "Un automate en défaut, et toute la chaîne s'arrête.",
    "La sauvegarde est introuvable.",
    "Un diagnostic qui va à la cause",
    "Vos automatismes sauvegardés et datés",
    "Une ligne figée maintenant se traite par le dépannage industriel.",
    "Brancher et lire",
    "Vos programmes, vos recettes et vos sauvegardes restent chez vous.",
    "Démarrage d'une ligne de production neuve, près de Lyon",
    "Pouvez-vous reprendre un code écrit par un autre prestataire ?",
    "Besoin que quelqu'un sache enfin où se trouve la dernière version de votre programme ?",
    // Le chiffre que le contrat AUTORISE sur cette page, preuve que la grille
    // ne se vide pas par principe.
    "+ 120",
  ],
  [...CIBLES_COMMUNES, "/preuves/mersen", "/preuves/eaton-mise-en-production"],
);

/* ---------------------- le trou déclaré : « +200 » ne se rend sur AUCUNE page */

assert.ok(
  !renduRobotique.includes("+200"),
  "le chiffre « +200 » de la capture robotique est interdit par le contrat : il ne doit pas se rendre",
);

/* ------------------------- une section sans donnée ne se rend pas */

const VIDE: ContenuDomaine = { gabarit: "domaine", sections: [] };
const renduVide = renderToStaticMarkup(
  <PageDomaine titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
for (const absent of [
  "1.12fr .88fr", // pas de panneau de formulaire au héros
  "Votre problématique",
  "Notre méthode",
  "Notre parti pris",
  "Les équipements que nous maintenons déjà",
  "Nos références",
  "Vos questions avant de nous appeler",
]) {
  assert.ok(
    !normaliseTexte(normaliseStyle(renduVide)).includes(absent),
    `sans donnée, rien ne se rend : « ${absent} » trouvé dans le rendu vide`,
  );
}

/* ------------- la nouvelle forme ne capture pas les pages non reportées */

/* `/expertises/electrique/` est encore sur l'ANCIENNE forme (chapeau,
   traitements, autres) : elle ne doit PAS passer `estDomaine`, sinon la route
   l'enverrait vers ce gabarit avec une donnée qu'il ne sait pas lire. */
const ancienne = JSON.parse(
  readFileSync(join(DOSSIER, "expertises-electrique.json"), "utf8"),
) as { contenu: unknown };
assert.ok(
  !estDomaine(ancienne.contenu),
  "expertises-electrique.json (ancienne forme) ne doit pas passer estDomaine : les 9 pages non reportées resteraient muettes",
);

console.log("gabarit domaine : toutes les vérifications passent.");
console.log(
  `  2 pilotes rendus contre leur capture, ${DESSINS_COMMUNS.length} dessins, ` +
    `${COPIES_COMMUNES.length} copies fixes, ${INTERDITS.length} interdits vérifiés absents, ` +
    `1 trou déclaré (« +200 », chiffre interdit de la capture robotique).`,
);
