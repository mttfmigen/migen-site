/**
 * Contrôle du gabarit OFFRE, sans navigateur.
 *
 *   bun components/site/offre/verification-offre.tsx
 *   bun components/site/offre/verification-offre.tsx --controle   (mode témoin)
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
 * 8. LE CHEMIN DE LA PAGE DESCEND JUSQU'AUX LIBELLÉS PARTAGÉS (13/10) : les
 *    cinq phrases que la famille offre écrit en dur suivent la décision de
 *    portée limitée de leur page, et restent intactes partout ailleurs.
 *
 * MODE TÉMOIN, `--controle` : il couvre le point 8. Il remet les cinq façons
 * de le casser et exige que chaque contrôle voie LA SIENNE, reconnue à son
 * message, puis repasse les cas licites pour exiger qu'il NE les voie PAS.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuOffre } from "@/types/offre";

import AppelFinal from "./AppelFinal";
import MarquesOffre from "./MarquesOffre";
import PageOffre from "./PageOffre";
import Reassurance from "./Reassurance";
import ReferencesOffre from "./ReferencesOffre";
import type { SectionPreuves } from "@/types/contenu";
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

/* ------- 9. LE CHEMIN DE LA PAGE DESCEND JUSQU'AUX LIBELLÉS PARTAGÉS

   CE QUE CE CONTRÔLE TIENT, et pourquoi il ne pouvait pas vivre dans
   `lib/verification-decisions-copie.ts` : cette porte-là tient la RÈGLE,
   celle-ci tient le CHEMIN. Cinq libellés de la famille offre sont écrits en
   dur dans des composants que TOUT le site partage, et la décision du 12/10 ne
   vaut que pour dix pages. Les composants ne peuvent donc l'appliquer que si le
   gabarit leur passe le chemin de la page. Une règle juste dont le chemin n'est
   plus descendu laisse le rendu fautif SANS QU'AUCUNE RÈGLE NE CHANGE : c'est
   exactement l'état mesuré en production le 12/10, et c'est ce trou-ci qui le
   referme.

   LES DEUX SENS COMPTENT AUTANT : dans la portée, le libellé doit être réécrit ;
   dehors, il doit rester mot pour mot celui de la maquette, sur les 236 autres
   pages où « technicien » est juste.

   AUCUN ARBITRAGE N'EST ÉCRIT ICI : la forme attendue est demandée à
   `appliqueDecisions`, jamais recopiée. Une porte qui réécrirait la décision de
   son côté finirait par la contredire. */

const LIBELLES_PARTAGES = [
  /* `AppelFinal` */
  "Rappel dans l\u2019heure aux horaires ouvrés. Un chargé d\u2019affaires qualifie votre besoin et vous présente les techniciens adaptés.",
  /* `MarquesOffre` */
  "Vos machines sont dans la liste\u00a0? Le technicien qui les connaît fait déjà partie de nos équipes.",
  /* `generique/PageVente`, bande d'appel des sections numérotées */
  "Jours ouvrés · technicien depuis le hub le plus proche · partout en France",
  /* `generique/maquette.js`, le `STATS` recopié de la maquette */
  "des techniciens réussissent notre double évaluation",
  /* `generique/PageVente`, repère du héros, et le défaut de `Reassurance` */
  "des techniciens retenus",
] as const;

/** Une page DANS la portée de la décision, et une page hors d'elle. */
const EN_PORTEE = "/travaux-industriels/";
const HORS_PORTEE = "/offres/residence/";

for (const libelle of LIBELLES_PARTAGES) {
  assert.notEqual(
    appliqueDecisions(libelle, EN_PORTEE),
    libelle,
    `${EN_PORTEE} doit être dans la portée de la décision pour « ${libelle.slice(0, 60)} »`,
  );
  assert.equal(
    appliqueDecisions(libelle, HORS_PORTEE),
    libelle,
    `${HORS_PORTEE} doit rester hors de la portée pour « ${libelle.slice(0, 60)} »`,
  );
}

const vus = new Map(LIBELLES_PARTAGES.map((l) => [l, { decide: 0, brut: 0 }]));

/**
 * Le rendu d'une page : dans la portée, plus un seul libellé brut ; dehors,
 * plus un seul libellé décidé.
 */
function verifieLibellesPartages(nom: string, url: string, html: string): void {
  const texte = normaliseTexte(texteLisible(html));
  for (const libelle of LIBELLES_PARTAGES) {
    const brut = normaliseTexte(libelle);
    const decide = normaliseTexte(appliqueDecisions(libelle, EN_PORTEE));
    const compte = vus.get(libelle)!;
    if (appliqueDecisions(libelle, url) !== libelle) {
      assert.ok(
        !texte.includes(brut),
        `${nom} : « ${libelle.slice(0, 70)} » rendu tel quel alors que la décision du 12/10 le renomme sur ${url} ; le chemin de la page n'est pas descendu jusqu'au composant`,
      );
      if (texte.includes(decide)) compte.decide += 1;
    } else {
      assert.ok(
        !texte.includes(decide),
        `${nom} : « ${decide.slice(0, 70)} » rendu sur ${url}, qui est HORS de la portée de la décision du 12/10 ; la règle a fui`,
      );
      if (texte.includes(brut)) compte.brut += 1;
    }
  }
}

/* LE CONTRÔLE DES COMPOSANTS EUX-MÊMES, et il est séparé exprès. Le contrôle
   de page ci-dessus ne distingue pas un libellé rendu par le composant d'une
   phrase voisine portée par la fiche. Ici, c'est LE MÊME composant, LES MÊMES
   props, et seul le chemin change : le basculement ne peut venir que de lui. */
function compte(texte: string, motif: string): number {
  let n = 0;
  for (let i = texte.indexOf(motif); i >= 0; i = texte.indexOf(motif, i + motif.length)) n += 1;
  return n;
}

/**
 * Le balisage SANS la couche du téléphone : chaque élément marqué
 * `data-mobile-seulement` est retiré avec tout son contenu.
 *
 * POURQUOI (14/10, maquette mobile v2). Le chemin ne sert plus seulement aux
 * décisions de copie : il allume aussi la cadence de conversion mobile, les
 * pastilles du maillage et l'ancre « Être rappelé », toutes masquées au-dessus
 * de 880 px. La promesse que garde ce contrôle (« sans chemin, le rendu d'avant
 * le 13/10, mot pour mot ») porte sur ce que le bureau affiche : elle se
 * vérifie donc une fois la couche du téléphone ôtée, et seulement elle.
 */
function sansCoucheMobile(html: string): string {
  const ouverture = /<([a-z][a-z0-9]*)\b[^>]*\bdata-mobile-seulement\b[^>]*>/i;
  let reste = html;
  for (let m = ouverture.exec(reste); m; m = ouverture.exec(reste)) {
    const balise = new RegExp(`<(/?)${m[1]}\\b[^>]*>`, "gi");
    balise.lastIndex = m.index + m[0].length;
    let profondeur = 1;
    let fin = -1;
    for (let t = balise.exec(reste); t; t = balise.exec(reste)) {
      if (t[0].endsWith("/>")) continue;
      profondeur += t[1] ? -1 : 1;
      if (profondeur === 0) {
        fin = t.index + t[0].length;
        break;
      }
    }
    if (fin < 0) throw new Error(`balise <${m[1]}> mobile sans fermeture dans le rendu`);
    reste = reste.slice(0, m.index) + reste.slice(fin);
  }
  return reste;
}

function verifieBascule(quoi: string, libelle: string, noeud: (chemin?: string) => ReactElement): void {
  const rendu = (chemin?: string) =>
    normaliseTexte(texteLisible(sansCoucheMobile(renderToStaticMarkup(noeud(chemin)))));
  const brut = normaliseTexte(libelle);
  const decide = normaliseTexte(appliqueDecisions(libelle, EN_PORTEE));
  const dans = rendu(EN_PORTEE);
  const dehors = rendu(HORS_PORTEE);
  const sans = rendu(undefined);

  /* ON COMPTE, ON NE CHERCHE PAS LA PRÉSENCE, et c'est la porte rouge qui me
     l'a appris : la fiche de `/bureau-etudes/bureau-etude-electrique/` écrit
     elle-même « 10 % des experts techniques retenus ». Chercher la forme
     décidée dans la page la trouvait donc déjà hors portée, et le contrôle
     accusait une fuite qui n'existait pas. Ce qui se vérifie, c'est que les
     occurrences du LIBELLÉ DU COMPOSANT basculent, et elles seules. */
  assert.equal(
    compte(dans, brut),
    0,
    `${quoi} : dans la portée, « ${brut.slice(0, 70)} » est encore rendu tel quel`,
  );
  /* LA FORME BRUTE DOIT SURVIVRE HORS PORTÉE : c'est à la fois le détecteur de
     fuite (une règle devenue globale la ferait disparaître partout) et la
     preuve que ce contrôle n'est pas vide. */
  assert.ok(
    compte(dehors, brut) > 0,
    `${quoi} : hors portée, « ${brut.slice(0, 70)} » doit rester mot pour mot`,
  );
  assert.equal(
    compte(dans, decide) - compte(dehors, decide),
    compte(dehors, brut),
    `${quoi} : toutes les occurrences du libellé doivent basculer, et elles seules`,
  );
  /* SANS CHEMIN, LE RENDU D'AVANT LE 13/10, mot pour mot : c'est ce qui garde
     les gabarits qui ne passent rien (secteur, ville, expertises, hub). */
  assert.equal(sans, dehors, `${quoi} : sans chemin, le rendu doit être celui d'une page hors portée`);
}

const ELECTRIQUE = litPage("bureau-etudes-bureau-etude-electrique.json");

function basculesDesComposants(): void {
  verifieBascule("Reassurance, repère par défaut", "des techniciens retenus", (chemin) => (
    <Reassurance chemin={chemin} />
  ));
  verifieBascule(
    "AppelFinal, phrase du panneau",
    "Rappel dans l\u2019heure aux horaires ouvrés. Un chargé d\u2019affaires qualifie votre besoin et vous présente les techniciens adaptés.",
    (chemin) => <AppelFinal formulaire="controle" chemin={chemin} />,
  );
  verifieBascule(
    "MarquesOffre, promesse de l'entête",
    "Vos machines sont dans la liste\u00a0? Le technicien qui les connaît fait déjà partie de nos équipes.",
    (chemin) => <MarquesOffre famille="auto" chemin={chemin} />,
  );
  /* `PageVente` ne se monte pas seul : il se rend par `PageOffre`, depuis la
     fiche GÉNÉRIQUE d'une vraie page. La même fiche sert les deux chemins, si
     bien que seule la portée les sépare. */
  for (const libelle of [
    "Jours ouvrés · technicien depuis le hub le plus proche · partout en France",
    "des techniciens réussissent notre double évaluation",
    "des techniciens retenus",
  ])
    verifieBascule(`PageVente, « ${libelle.slice(0, 48)} »`, libelle, (chemin) => (
      <PageOffre
        titre={ELECTRIQUE.titre_h1 ?? ELECTRIQUE.url}
        contenu={ELECTRIQUE.contenu}
        formulaire="controle"
        chemin={chemin}
      />
    ));
}

basculesDesComposants();

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
      // Le chemin, comme la route le passe : sans lui, les décisions de copie
      // à portée limitée seraient inertes ici et le contrôle 9 ne verrait rien.
      chemin={page.url}
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
  verifieLibellesPartages(nom, page.url, html);

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

/* LA PORTE N'EST PAS VIDE : chaque libellé doit avoir été vu décidé au moins
   une fois dans la portée, et brut au moins une fois dehors. Sans ces deux
   lignes, un libellé que plus aucun composant ne rend ferait passer la porte
   au vert en ne vérifiant rien. */
for (const [libelle, tenu] of vus) {
  assert.ok(
    tenu.decide > 0,
    `aucune page de la portée ne rend « ${normaliseTexte(appliqueDecisions(libelle, EN_PORTEE)).slice(0, 70)} » : libellé disparu du composant, ou chemin non descendu`,
  );
  assert.ok(
    tenu.brut > 0,
    `aucune page hors portée ne rend « ${libelle.slice(0, 70)} » : le libellé du composant a changé, cette liste est périmée`,
  );
}

/* ----- 10. LE RAIL « Nos références » NE RESSERT PAS UNE PHOTO DU MAILLAGE

   Défaut mesuré le 14/10 par `scripts/verifie-photos-du-bloc.mjs` sur les
   trois offres dont les preuves n'ont pas de photo : le rail choisissait la
   sienne par rang et retombait sur `team-grind-front` et `team-duo`, que le
   maillage sert trois sections plus bas. Voir `photosDuRail`.
   Ce contrôle lit la page entière, section par section. Son témoin rend le
   MÊME rail sans `photosPrises` : il doit y retrouver le défaut, sans quoi le
   contrôle ne prouverait plus rien et la tolérance serait à retirer. */
const photosDeLaSection = (html: string): Set<string> =>
  new Set(
    [...html.matchAll(/<img\b[^>]*?\bsrc="([^"]*)"/g)]
      .map((m) => decodeURIComponent(m[1].match(/[?&]url=([^&]+)/)?.[1] ?? m[1]).split("?")[0])
      .filter((f) => /^\/assets\/(web|photos)\//.test(f)),
  );
const sectionAvec = (html: string, titre: string): string =>
  html.split(/<section\b/).find((s) => s.includes(titre)) ?? "";
let railsControles = 0;
for (const nom of ["offres-chantier.json", "offres-depannage-industriel.json", "offres-retrofit.json"]) {
  const page = litPage(nom);
  const html = renderToStaticMarkup(
    <PageOffre titre={page.titre_h1 ?? page.url} contenu={page.contenu} formulaire="controle" chemin={page.url} />,
  );
  const maillage = photosDeLaSection(sectionAvec(html, "Un autre besoin ?"));
  const rail = photosDeLaSection(sectionAvec(html, "Nos références"));
  assert.ok(maillage.size > 0 && rail.size > 0, `${nom} : rail ou maillage introuvable, contrôle vide`);
  const preuves = page.contenu.sections?.find((s) => s.type === "preuves") as SectionPreuves;
  const temoin = photosDeLaSection(renderToStaticMarkup(<ReferencesOffre section={preuves} />));
  assert.ok(
    [...temoin].some((f) => maillage.has(f)),
    `${nom} : sans photosPrises, le rail ne ressert plus le maillage ; le témoin n'a plus d'objet`,
  );
  const communes = [...rail].filter((f) => maillage.has(f));
  assert.equal(communes.length, 0, `${nom} : le rail ressert ${communes.join(", ")}, déjà au maillage`);
  railsControles += 1;
}

console.log(`gabarit offre : toutes les vérifications passent.`);
console.log(
  `  rail des références : ${railsControles} offres sans photo du maillage, témoin sans photosPrises vu en défaut.`,
);
console.log(
  `  capture relue (${CAPTURE.split("\n").length} lignes), ` +
    `${fichiers.length} pages réelles rendues, ${INTERDITS.length} interdits vérifiés absents.`,
);
console.log(
  `  ${LIBELLES_PARTAGES.length} libellés de composant partagé : ` +
    [...vus].map(([l, c]) => `« ${l.slice(0, 26)}… » ${c.decide} décidé / ${c.brut} brut`).join(", ") +
    ".",
);

/* -------------------------------------------------------- le mode témoin

   IL NE COUVRE QUE LE POINT 8, celui ajouté le 13/10. Les sept autres
   contrôles de ce fichier comparent à une capture relue à chaque exécution :
   leur capacité à échouer vient de la capture elle-même, pas d'un témoin. */

if (process.argv.includes("--controle")) {
  let vues = 0;
  let manques = 0;

  /* UN TÉMOIN QUI TOMBE SUR LA RÈGLE VOISINE NE PROUVE RIEN : on exige que le
     message de l'échec soit celui de la règle visée. */
  const doitEchouerSur = (quoi: string, fragment: string, fautif: () => void) => {
    try {
      fautif();
    } catch (e) {
      const message = (e as Error).message ?? "";
      if (message.includes(fragment)) {
        vues += 1;
        console.log(`  vue        : ${quoi}`);
        return;
      }
      manques += 1;
      console.error(`  AUTRE RÈGLE : ${quoi} (attendu « ${fragment} », obtenu « ${message.slice(0, 140)} »)`);
      return;
    }
    manques += 1;
    console.error(`  MANQUÉE    : ${quoi}`);
  };
  const doitPasser = (quoi: string, licite: () => void) => {
    try {
      licite();
      console.log(`  acceptée   : ${quoi}`);
    } catch (e) {
      manques += 1;
      console.error(`  FAUX DÉFAUT : ${quoi} (${(e as Error).message.slice(0, 140)})`);
    }
  };

  const PHRASE_TEMOIN = "des techniciens retenus";
  const DECIDE_TEMOIN = appliqueDecisions(PHRASE_TEMOIN, EN_PORTEE);

  /* Trois composants de laboratoire, chacun cassé d'une façon précise. */
  /* SOURD : il reçoit le chemin et n'en fait rien, l'état du 12/10. */
  const Sourd = () => <p>{PHRASE_TEMOIN}</p>;
  const Global = () => <p>{DECIDE_TEMOIN}</p>;
  const Inverse = ({ chemin }: { chemin?: string }) => (
    <p>{chemin === HORS_PORTEE ? PHRASE_TEMOIN : DECIDE_TEMOIN}</p>
  );
  const Juste = ({ chemin }: { chemin?: string }) => <p>{appliqueDecisions(PHRASE_TEMOIN, chemin)}</p>;

  console.log("\ntémoin : les cinq façons de casser le point 8");
  doitEchouerSur(
    "un composant SOURD au chemin : il rend « des techniciens retenus » partout",
    "dans la portée, « des techniciens retenus » est encore rendu tel quel",
    () => verifieBascule("témoin sourd", PHRASE_TEMOIN, () => <Sourd />),
  );
  doitEchouerSur(
    "une règle devenue GLOBALE : le composant renomme même hors portée",
    "hors portée, « des techniciens retenus » doit rester mot pour mot",
    () => verifieBascule("témoin global", PHRASE_TEMOIN, () => <Global />),
  );
  doitEchouerSur(
    "un composant qui renomme SANS CHEMIN, donc sur les gabarits qui n'en passent pas",
    "sans chemin, le rendu doit être celui d'une page hors portée",
    () => verifieBascule("témoin sans chemin", PHRASE_TEMOIN, (chemin) => <Inverse chemin={chemin} />),
  );
  doitEchouerSur(
    "une page DE LA PORTÉE qui sert encore le libellé brut",
    "le chemin de la page n'est pas descendu jusqu'au composant",
    () => verifieLibellesPartages("témoin.json", EN_PORTEE, `<p>${PHRASE_TEMOIN}</p>`),
  );
  doitEchouerSur(
    "une page HORS portée qui sert le libellé décidé",
    "qui est HORS de la portée de la décision du 12/10 ; la règle a fui",
    () => verifieLibellesPartages("témoin.json", HORS_PORTEE, `<p>${DECIDE_TEMOIN}</p>`),
  );

  console.log("\ntémoin : les cas licites, qui ne doivent PAS être vus");
  doitPasser("un composant qui demande la décision à sa page", () =>
    verifieBascule("témoin juste", PHRASE_TEMOIN, (chemin) => <Juste chemin={chemin} />),
  );
  doitPasser("les quatre composants réels de la famille offre", () => basculesDesComposants());
  doitPasser("une page hors portée qui garde le libellé brut", () =>
    verifieLibellesPartages("témoin.json", HORS_PORTEE, `<p>${PHRASE_TEMOIN}</p>`),
  );
  doitPasser("une page de la portée qui sert le libellé décidé", () =>
    verifieLibellesPartages("témoin.json", EN_PORTEE, `<p>${DECIDE_TEMOIN}</p>`),
  );

  console.log(`\ntémoin : ${vues} fautes vues, ${manques} manquées.`);
  if (manques > 0) {
    console.error("la porte ne sait pas échouer sur tout ce qu'elle prétend tenir.");
    process.exit(1);
  }
}
