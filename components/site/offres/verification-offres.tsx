/**
 * Contrôle du hub `/offres/` (gabarit 10), sans navigateur.
 *
 *   bun components/site/offres/verification-offres.tsx
 *
 * LA RÉFÉRENCE est la capture `maquette/rendu/offres.html` (18 écrans), RELUE
 * à chaque exécution. Le contrôle rend la VRAIE donnée,
 * `supabase/import/gabarits-maquette/offres.json`, celle que la route sert, et
 * vérifie :
 *
 *  1. le H1 du relais est celui de la capture, un seul H1 rendu ;
 *  2. MOT POUR MOT : chaque texte de la capture est dans le rendu, et chaque
 *     chaîne de la donnée est dans la capture (comparaison sur texte
 *     normalisé : espace insécable, apostrophe typographique). La capture
 *     passe d'abord par les décisions de copie (lib/decisions-copie.ts) ;
 *  3. les 18 écrans, dans l'ordre de la capture ;
 *  4. le dessin des écrans propres au hub, valeur par valeur, d'abord trouvé
 *     dans la capture puis dans le rendu ;
 *  5. les survols relevés sur la maquette qui tourne ;
 *  6. aucun `href="#"`, aucune classe Tailwind de couleur, aucun interdit ;
 *  7. une section sans donnée ne se rend pas ;
 *  8. les `trous` du relais : chaque phrase retirée existe dans la capture,
 *     porte un interdit du contrat (prix) et n'est PAS rendue. Elle est
 *     soustraite de la capture avant la comparaison mot pour mot, rien d'autre.
 *
 * ET IL PROUVE QU'IL SAIT ÉCHOUER : à chaque exécution, quatre fautes sont
 * injectées dans une copie de la donnée (un mot changé, un écran retiré, le
 * siège remis à Limonest, « candidats » remis) et chacune DOIT être détectée.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { estOffres, type ContenuOffres } from "@/types/offres";

import PageOffres from "./PageOffres";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const lit = (...chemin: string[]) => readFileSync(join(RACINE, ...chemin), "utf8");

/* ------------------------------------------------------------ outils texte */

function decode(html: string): string {
  return html
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Espace insécable, apostrophe typographique et blancs ramenés à une forme. */
function normalise(texte: string): string {
  return texte.replace(/[  ]/g, " ").replace(/’/g, "'").replace(/\s+/g, " ").trim();
}

/** Le texte visible d'un HTML, balises retirées. */
function visible(html: string): string {
  return normalise(decode(html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")));
}

/** Les nœuds de texte d'un HTML, un par un. */
function noeuds(html: string): string[] {
  return [...html.replace(/<style[\s\S]*?<\/style>/g, "").matchAll(/>([^<]+)</g)]
    .map((m) => normalise(decode(m[1])))
    .filter(Boolean);
}

/** Un style ramené à une écriture comparable (`0.3` → `.3`, `0px` → `0`). */
function normaliseStyle(texte: string): string {
  return decode(texte)
    .replace(/\s*([:;,()])\s*/g, "$1")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1")
    .replace(/rgb\(255,255,255\)/g, "#fff");
}

/* -------------------------------------------------- la capture, relue */

/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(lit("maquette", "rendu", "offres.html"));
const ECRANS_CAPTURE = CAPTURE.split(/(?=<section)/).slice(1);
assert.equal(ECRANS_CAPTURE.length, 18, "la capture du hub compte 18 écrans");

/* « Le siège est à Lyon. » n'est plus retirée : Écully est dans la métropole
   lyonnaise et Lyon est l'agence du siège (README de passation). Les seules
   phrases retirées sont les `trous` du relais (prix), déclarés avec leur raison. */
const CAPTURE_TEXTE = visible(CAPTURE);
const CAPTURE_STYLE = normaliseStyle(CAPTURE);

/**
 * Les textes de la capture qui ne sont pas du contenu de page : les options du
 * sélecteur d'indicatif et les astérisques du formulaire partagé
 * (`PanneauFormulaire`), qui ne sont pas de ce périmètre.
 */
const HORS_PAGE = new Set(["FR +33", "BE +32", "CH +41", "ES +34", "CA +1", "AE +971", "*"]);

/** Le titre repère de chaque écran, dans l'ordre de la capture. */
const REPERES = [
  "Maintenance industrielle : six offres, une seule exigence",
  "Clients industriels accompagnés",
  "Ils nous font confiance",
  "Qui intervient chez vous",
  "Nous vous rappelons dans l'heure",
  "Vous ne cherchez pas un prestataire de maintenance industrielle.",
  "Ce que nous faisons, et ce que ça change pour vous",
  "Nous vous rappelons dans l'heure",
  "Un appel. Un plan. Une ligne qui repart.",
  "Ce que nous garantissons",
  "Besoin de savoir quelle formule coûte le moins cher pour votre site ?",
  "Nos références",
  "Nous vous rappelons dans l'heure",
  "Deux approches, un seul objectif : que vos lignes tournent",
  "Votre technicien de maintenance, intégré à votre site",
  "Vos questions avant de nous appeler",
  "Six offres, un seul interlocuteur.",
  "Besoin d'un interlocuteur qui vous dise honnêtement de quoi votre site a besoin ?",
];

/** Le dessin des écrans propres au hub, relevé dans la capture. */
const DESSIN = [
  // 13 · Deux approches
  "font: 600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
  "grid-template-columns: repeat(2, minmax(0px, 1fr)); gap: 16px",
  "padding: 34px 34px 30px",
  "grid-template-rows: auto auto auto auto 1fr",
  "background: radial-gradient(circle, rgba(255, 124, 60, 0.3), transparent 68%)",
  "font: 600 24px/1.2 var(--ft)",
  "grid-template-columns: 22px minmax(0px, 1fr)",
  "background: rgba(255, 124, 60, 0.16)",
  "padding: 14px 22px",
  "box-shadow: rgba(255, 124, 60, 0.7) 0px 10px 24px -12px",
  // 14 · Migen Résidence
  "padding: 44px 40px",
  "font: 600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
  "font: 600 17px/1.4 var(--ft)",
  "min-height: 440px",
  // 15 · Questions (bloc partagé `QuestionsPhoto`)
  "font: 600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
  "padding: 15px 26px",
  "font: 600 calc(16px * var(--ts))/1.4 var(--ft)",
  // 16 · Six offres
  "font: 600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  "grid-template-rows: repeat(2, minmax(210px, auto))",
  "font: 600 20px/1.2 var(--ft)",
  // 1 · Chiffres : trois cellules
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
];

const INTERDITS = [
  "—", "24h", "24/24", "7j/7", "7/7", "régie", "intérim", "mise à disposition",
  "sur mesure", "sans engagement", "notamment", "levier", "clé en main",
  "concrètement", "incontournable", "découvrez", "réguliers", "teamtailor",
  "limonest", "€", "taux horaire", "prix mensuel", "tarif",
] as const;

/* ---------------------------------------------------- la donnée réelle */

interface Relais {
  url: string;
  titre_h1: string;
  /** Phrases de la capture retirées parce qu'un interdit du contrat les frappe. */
  trous?: { ligne: string; pourquoi: string }[];
  contenu: ContenuOffres;
}

/** Ce qu'un trou doit porter pour être accepté : un prix, sous l'un de ses noms. */
const MOTIF_TROU = /\btaux horaires?\b|\btarifs?\b|\bprix\b|€/iu;

const RELAIS = JSON.parse(
  lit("supabase", "import", "gabarits-maquette", "offres.json"),
) as Relais;

/**
 * Toutes les chaînes de texte de la donnée, chemins et photos exclus.
 *
 * Deux champs ne s'affichent pas tels quels : `lienLibelle` porte le libellé
 * long du corpus (« Étude de cas VEEPEE »), dont `ReferencesOffre` n'affiche
 * que le client ; `alt` vit dans un attribut, il est cherché comme tel.
 */
function chainesDe(valeur: unknown, cle = ""): string[] {
  if (typeof valeur === "string") {
    if (/^(href|photo|problemePhoto|lienHref|gabarit|type)$/.test(cle)) return [];
    if (cle === "lienLibelle") return [valeur.replace(/^Étude de cas /u, "")];
    if (cle === "alt") return [];
    return [valeur];
  }
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chainesDe(v, cle));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) => chainesDe(v, k));
  }
  return [];
}

/* -------------------------------------------------------- le contrôle */

function controle(relais: Relais): string[] {
  const fautes: string[] = [];
  const faute = (ok: unknown, message: string) => {
    if (!ok) fautes.push(message);
  };

  faute(estOffres(relais.contenu), "contenu.gabarit doit valoir « offres »");
  faute(
    normalise(relais.titre_h1) === normalise(noeuds(ECRANS_CAPTURE[0])[1] ?? ""),
    "le H1 du relais n'est pas celui de la capture",
  );

  const trous = (relais.trous ?? []).map((t) => normalise(t.ligne));
  const sansTrous = (texte: string) =>
    normalise(trous.reduce((reste, trou) => reste.split(trou).join(" "), normalise(texte)));
  const captureSansTrous = sansTrous(CAPTURE_TEXTE);

  const html = renderToStaticMarkup(
    <PageOffres titre={relais.titre_h1} contenu={relais.contenu} formulaire="verification-offres" />,
  );
  const rendu = visible(html);

  // 1 · un seul H1
  faute((html.match(/<h1[\s>]/g) ?? []).length === 1, "exactement un h1 attendu");

  // 2 · mot pour mot, dans les deux sens
  for (const ecran of ECRANS_CAPTURE) {
    for (const texte of noeuds(ecran)) {
      const attendu = sansTrous(texte);
      if (!attendu || HORS_PAGE.has(attendu)) continue;
      faute(rendu.includes(attendu), `texte de la capture absent du rendu : « ${attendu} »`);
    }
  }
  const alt = relais.contenu.encartResidence?.alt;
  faute(!alt || CAPTURE.includes(`alt="${alt}"`), `alt absent de la capture : « ${alt} »`);
  for (const chaine of chainesDe(relais.contenu)) {
    faute(
      captureSansTrous.includes(normalise(chaine)),
      `chaîne de la donnée absente de la capture : « ${chaine} »`,
    );
  }
  // 8 · les trous : dans la capture, frappés d'un interdit, absents du rendu
  for (const t of relais.trous ?? []) {
    const ligne = normalise(t.ligne);
    faute(!!t.pourquoi, `trou sans raison : « ${t.ligne} »`);
    faute(CAPTURE_TEXTE.includes(ligne), `trou absent de la capture : « ${t.ligne} »`);
    faute(MOTIF_TROU.test(ligne), `trou sans interdit du contrat : « ${t.ligne} »`);
    faute(!rendu.includes(ligne), `trou déclaré mais rendu : « ${t.ligne} »`);
  }

  // 3 · les 18 écrans, dans l'ordre
  const sections = html.split(/(?=<section)/).slice(1).map(visible);
  faute(sections.length === 18, `18 écrans attendus, ${sections.length} rendus`);
  REPERES.forEach((repere, rang) => {
    faute(
      sections[rang]?.includes(normalise(repere)),
      `écran ${rang} : « ${repere} » attendu à cette place`,
    );
  });

  // 4 · le dessin, trouvé dans la capture puis dans le rendu
  const style = normaliseStyle(html);
  for (const fragment of DESSIN) {
    const attendu = normaliseStyle(fragment);
    faute(CAPTURE_STYLE.includes(attendu), `la capture ne porte pas « ${fragment} »`);
    faute(style.includes(attendu), `le rendu ne porte pas le dessin « ${fragment} »`);
  }

  // 6 · cibles, échafaudage, interdits
  faute(!/href="#"/.test(html), 'un href="#" est rendu');
  for (const cible of [
    "/offres/depannage-industriel/", "/offres/residence/", "/contact/",
    "/offres/full-service/", "/offres/zero-arret/", "/offres/arret-technique/",
    "/offres/bureau-etudes/", "/travaux-industriels/", "/preuves/jacquet-brossard/",
  ]) {
    faute(
      html.includes(`href="${cible}"`) || html.includes(`href="${cible.slice(0, -1)}"`),
      `lien de la capture absent du rendu : ${cible}`,
    );
  }
  for (const classe of html.matchAll(/class="([^"]*)"/g)) {
    faute(
      !/\b(?:text|bg|border)-(?:zinc|gray|slate|neutral|stone|orange|amber)-\d{2,3}\b|\bdark:/.test(classe[1]),
      `classe Tailwind de couleur : « ${classe[1]} »`,
    );
  }
  const minuscule = rendu.toLowerCase();
  for (const mot of INTERDITS) {
    faute(!minuscule.includes(mot), `interdit rendu : « ${mot} »`);
  }
  return fautes;
}

/* ------------------------------------------------- 1. la page réelle passe */

const fautes = controle(RELAIS);
assert.deepEqual(fautes, [], `hub /offres/ non conforme :\n  ${fautes.join("\n  ")}`);

/* -------------------------------------------- 5. les survols relevés */

const CSS = lit("components", "site", "offres", "PageOffres.module.css");
for (const survol of ["background-color: rgb(232, 104, 43) !important", "transform: translateY(-3px)"]) {
  assert.ok(CSS.includes(survol), `survol de la maquette absent : « ${survol} »`);
}

/* ------------------------------------- 7. sans donnée, rien ne s'invente */

const nu = visible(
  renderToStaticMarkup(
    <PageOffres titre="Un titre seul" contenu={{ gabarit: "offres" }} formulaire="vide" />,
  ),
);
for (const absent of ["Deux approches", "Migen Résidence", "Six offres", "Nos références", "Questions fréquentes"]) {
  assert.ok(!nu.includes(absent), `sans donnée, « ${absent} » ne doit pas se rendre`);
}

/* --------------------------------- 8. le contrôle sait échouer : fautes injectées */

const copie = (): Relais => structuredClone(RELAIS);
const injections: [string, (r: Relais) => void][] = [
  ["un mot changé", (r) => {
    r.contenu.approches!.titre = r.contenu.approches!.titre.replace("objectif", "but");
  }],
  ["un écran retiré", (r) => {
    delete r.contenu.encartResidence;
  }],
  ["le siège remis à Limonest", (r) => {
    const faq = r.contenu.sections!.find((s) => s.type === "objections");
    if (faq?.type === "objections") faq.questions[5].reponse += " Le siège est à Limonest.";
  }],
  ["un faux trou (phrase rendue déclarée retirée)", (r) => {
    r.trous = [...(r.trous ?? []), { ligne: "Nos références", pourquoi: "essai" }];
  }],
  ["une phrase de prix remise", (r) => {
    const faq = r.contenu.sections!.find((s) => s.type === "objections");
    if (faq?.type === "objections") {
      faq.questions[0].reponse = faq.questions[0].reponse.replace(
        "justifie. ",
        "justifie. Le taux horaire est homogène dans toute la France. ",
      );
    }
  }],
  ["« candidats » remis là où la décision dit « techniciens »", (r) => {
    r.contenu = JSON.parse(JSON.stringify(r.contenu).replaceAll("techniciens retenus", "candidats retenus"));
  }],
];
for (const [nom, injecte] of injections) {
  const fautee = copie();
  injecte(fautee);
  assert.ok(controle(fautee).length > 0, `faute injectée NON détectée : ${nom}`);
}

console.log("hub /offres/ : toutes les vérifications passent.");
console.log(
  `  18 écrans dans l'ordre, ${DESSIN.length} valeurs de dessin, ` +
    `${chainesDe(RELAIS.contenu).length} chaînes relues dans la capture, ` +
    `${injections.length} fautes injectées toutes détectées.`,
);
