/**
 * Contrôle du HUB `/expertises/`, sans navigateur.
 *
 *   bun components/site/expertises/verification-expertises.tsx
 *
 * LA RÉFÉRENCE, et elle est unique : la capture
 * `maquette/rendu/expertises.html` (19 sections, « 10 Hub de rubrique »),
 * RELUE À CHAQUE EXÉCUTION. Rien de ce qui est attendu n'est retapé ici : les
 * copies sont les chaînes de la donnée, d'abord exigées dans la capture, puis
 * dans le rendu ; les titres, les cibles et leur ordre sont lus dans la capture.
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *   1. ZÉRO DONNÉE INVENTÉE : chaque chaîne visible de la donnée est dans la
 *      capture, chaque chemin et chaque photo nommée aussi.
 *   2. LE RENDU porte ces chaînes, le H1 de la capture, ses H2 DANS SON ORDRE,
 *      toutes ses cibles, et les dessins des trois écrans propres au hub.
 *   3. Un seul H1, aucun `href="#"`, l'ancre `#mgx-form` posée ET visée.
 *   4. Les interdits du contrat absents du rendu.
 *   5. La route sert la LIGNE ACTUELLE de la base (ancienne forme) avec la
 *      donnée du hub, et une ligne à la forme hub telle quelle.
 *   6. LE CONTRÔLE SAIT ÉCHOUER : trois rendus sabotés doivent le faire tomber.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import {
  estExpertises,
  estHubExpertises,
  type ContenuHubExpertises,
} from "@/types/expertises";

import {
  CONTENU_EXPERTISES,
  CONTENU_HUB_EXPERTISES,
  TITRE_HUB_EXPERTISES,
} from "./expertises-donnees";
import PageExpertises from "./PageExpertises";

const ICI = fileURLToPath(new URL(".", import.meta.url));
const RACINE = join(ICI, "..", "..", "..");
/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", "expertises.html"), "utf8"));

/* ------------------------------------------------------------ normalisation */

function decode(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Pour COMPARER seulement : la donnée garde le littéral de la capture. */
function normaliseTexte(texte: string): string {
  return texte.replace(/[  ]/g, " ").replace(/’/g, "'").replace(/\s+/g, " ").trim();
}

function texteLisible(html: string): string {
  return normaliseTexte(decode(html.replace(/<[^>]+>/g, " ")));
}

function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/** Les H2 d'un HTML, dans l'ordre. */
function titres2(html: string): string[] {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => texteLisible(m[1]));
}

/** Les cibles internes d'un HTML, sans doublon. */
function cibles(html: string): string[] {
  return [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
}

const CAPTURE_TEXTE = texteLisible(CAPTURE);
const CAPTURE_STYLE = normaliseStyle(CAPTURE);
const CAPTURE_H1 = texteLisible(CAPTURE.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]);

/* --------------------------------------- 1. zéro donnée inventée, sur la donnée */

/** Les clés dont la valeur n'est pas de la copie visible. */
const HORS_COPIE = new Set(["gabarit", "type", "href", "lienHref", "photo", "marquesFamille", "marquesFamilles", "lienLibelle"]);

function chaines(valeur: unknown, cle = ""): [string, string][] {
  if (typeof valeur === "string") return HORS_COPIE.has(cle) ? [] : [[cle, valeur]];
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chaines(v, cle));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) => (HORS_COPIE.has(k) ? [] : chaines(v, k)));
  }
  return [];
}

const COPIES = chaines(CONTENU_HUB_EXPERTISES).map(([, t]) => t);

/** Chaque chaîne de la donnée est dans la capture : aucune n'a été écrite ici. */
for (const texte of [TITRE_HUB_EXPERTISES, ...COPIES]) {
  assert.ok(
    CAPTURE_TEXTE.includes(normaliseTexte(texte)),
    `donnée du hub : « ${texte} » n'est pas dans la capture, elle est inventée`,
  );
}
assert.equal(normaliseTexte(TITRE_HUB_EXPERTISES), CAPTURE_H1, "le H1 du hub n'est pas celui de la capture");

/** Chaque chemin de la donnée est une cible de la capture. */
for (const href of JSON.stringify(CONTENU_HUB_EXPERTISES).match(/"(?:href|lienHref)":"([^"]+)"/g) ?? []) {
  const chemin = href.replace(/^"[^"]+":"|"$/g, "");
  assert.ok(CAPTURE.includes(`href="${chemin}"`), `donnée du hub : la capture ne vise pas ${chemin}`);
}

/** Les photos que la capture NOMME (fond des cartes) sont les siennes. */
for (const carte of [...CONTENU_HUB_EXPERTISES.domaines!.cartes, ...CONTENU_HUB_EXPERTISES.pagesLiees!]) {
  assert.ok(
    decode(CAPTURE).includes(`url("${carte.photo!.slice(1)}")`),
    `donnée du hub : la capture ne nomme pas ${carte.photo} pour « ${carte.titre} »`,
  );
}

/* ------------------------------------------------- 2 à 4. le contrôle du rendu */

const DESSINS = [
  // 0 · Héros à formulaire, 1 · chiffres sur trois colonnes.
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  "padding: 22px 8px",
  // 4 · Réponse directe : la grille, la carte, les numéros.
  "grid-template-columns: minmax(0px, 1fr) minmax(0px, 1fr); gap: 48px; align-items: start",
  "border-radius: var(--rad); padding: 6px 30px",
  "width: 40px; height: 40px; border-radius: 12px; background: var(--acc-w); color: var(--acc)",
  // 5 · Domaines : le bento, la carte, le paragraphe caché sauf sur la première.
  "grid-template-columns: repeat(4, minmax(0px, 1fr)); grid-auto-rows: minmax(230px, auto); gap: 14px",
  "min-height: 230px; border-radius: var(--rad); overflow: hidden",
  "display: none; font: 400 14.5px/1.6 var(--fb)",
  // 6 · Types : le panneau, la rangée, la barre beige.
  "grid-template-columns: minmax(0px, 0.9fr) minmax(0px, 1.1fr); gap: 48px; align-items: stretch",
  "min-height: 440px",
  "grid-template-columns: 40px minmax(0px, 1fr) 36px",
  "padding: 11px 14px; border-radius: 14px; background: var(--acc-w)",
  // 7 et 11 · la carte en verre d'une phrase ; 18 · l'appel final.
  "padding: 30px 34px 14px",
  "padding: var(--sec) 24px var(--sec)",
] as const;

const INTERDITS = [
  "—", "prix ", "tarif", "taux horaire", "régie", "intérim", "mise à disposition",
  "sans engagement", "clé en main", "sur mesure", "levier", "concrètement",
  "notamment", "incontournable", "découvrez", "limonest", "24h", "24 h", "7j/7",
  "clients réguliers",
] as const;

function controle(rendu: string, nom: string): void {
  const texte = texteLisible(rendu);
  const style = normaliseStyle(rendu);

  for (const fragment of DESSINS) {
    const attendu = normaliseStyle(fragment);
    assert.ok(CAPTURE_STYLE.includes(attendu), `la capture ne porte pas « ${fragment} » : valeur à revérifier`);
    assert.ok(style.includes(attendu), `${nom} : le rendu ne porte pas le dessin « ${fragment} »`);
  }
  for (const copie of COPIES) {
    assert.ok(texte.includes(normaliseTexte(copie)), `${nom} : copie de la capture absente, « ${copie} »`);
  }

  const h1 = [...rendu.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  assert.equal(h1.length, 1, `${nom} : une page porte exactement un h1`);
  assert.equal(texteLisible(h1[0][1]), CAPTURE_H1, `${nom} : le H1 n'est pas celui de la capture`);
  assert.deepEqual(titres2(rendu), titres2(CAPTURE), `${nom} : les H2 ne sont pas ceux de la capture, dans son ordre`);

  // Hors du serveur Next, `Link` rend le chemin sans sa barre finale.
  for (const cible of cibles(CAPTURE)) {
    assert.ok(
      rendu.includes(`href="${cible}"`) || rendu.includes(`href="${cible.replace(/(.)\/$/, "$1")}"`),
      `${nom} : la capture vise ${cible}, le rendu non`,
    );
  }
  assert.ok(!/href="#"/.test(rendu), `${nom} : un href="#" est rendu`);
  assert.ok(rendu.includes('href="#besoin"') && rendu.includes('id="besoin"'), `${nom} : #besoin doit être posé et visé`);
  assert.ok(rendu.includes('href="#mgx-form"') && rendu.includes('id="mgx-form"'), `${nom} : #mgx-form doit être posé et visé`);

  const minuscule = texte.toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(!minuscule.includes(mot), `${nom} : interdit du contrat dans le rendu, « ${mot} »`);
  }
}

const rendDe = (contenu: Parameters<typeof PageExpertises>[0]["contenu"], titre: string) =>
  renderToStaticMarkup(<PageExpertises titre={titre} contenu={contenu} formulaire="cocon-expertises-" />);

/* ----------------------------------- 5. ce que la route sert, ligne par ligne */

// La route tranche sur `estExpertises` : les deux formes y passent.
assert.ok(estExpertises(CONTENU_EXPERTISES) && estExpertises(CONTENU_HUB_EXPERTISES), "les deux formes doivent passer estExpertises");
assert.ok(!estHubExpertises(CONTENU_EXPERTISES), "l'ancienne forme ne doit pas passer pour la forme hub");
assert.ok(estHubExpertises(CONTENU_HUB_EXPERTISES), "la donnée du hub doit porter la forme hub");

// La LIGNE ACTUELLE de la base : ancienne forme, H1 court. Rendue en hub.
const renduBase = rendDe(CONTENU_EXPERTISES, "Maintenance des équipements industriels");
controle(renduBase, "ligne actuelle de la base");
assert.ok(!renduBase.includes("Six natures d"), "la copie de l'ancienne forme ne doit plus se rendre");

// Une ligne à la forme hub est servie TELLE QUELLE, H1 compris.
const renduHub = rendDe({ ...CONTENU_HUB_EXPERTISES, chapeau: "Chapeau écrit en base." }, "Titre écrit en base");
assert.ok(renduHub.includes(">Titre écrit en base</h1>"), "une ligne à la forme hub garde son H1");
assert.ok(renduHub.includes("Chapeau écrit en base."), "une ligne à la forme hub garde son contenu");

// Les survols relevés sur la maquette vivante sont dans la feuille du hub.
const FEUILLE = readFileSync(join(ICI, "PageExpertises.module.css"), "utf8");
for (const regle of ["translateY(-4px)", "rgba(0, 0, 0, 0.5) 0 30px 60px -30px", "rgba(255, 124, 60, 0.05)"]) {
  assert.ok(FEUILLE.includes(regle), `survol relevé absent de PageExpertises.module.css : ${regle}`);
}

/* ------------------------------------------------ 6. le contrôle sait échouer */

const SABOTAGES: [string, ContenuHubExpertises][] = [
  ["un mot changé", { ...CONTENU_HUB_EXPERTISES, chapeau: CONTENU_HUB_EXPERTISES.chapeau!.replace("Huit", "Neuf") }],
  ["un écran retiré", { ...CONTENU_HUB_EXPERTISES, domaines: undefined }],
  ["un interdit glissé", { ...CONTENU_HUB_EXPERTISES, mention: `${CONTENU_HUB_EXPERTISES.mention} Sans engagement.` }],
];
for (const [nom, contenu] of SABOTAGES) {
  assert.throws(() => controle(rendDe(contenu, TITRE_HUB_EXPERTISES), nom), assert.AssertionError, `le contrôle n'a pas vu : ${nom}`);
}

console.log(
  `hub /expertises/ conforme à sa capture : ${COPIES.length} copies, ${DESSINS.length} dessins, ` +
    `${titres2(CAPTURE).length} H2 dans l'ordre, ${cibles(CAPTURE).length} cibles, ${INTERDITS.length} interdits ; ` +
    `${SABOTAGES.length} sabotages détectés.`,
);
