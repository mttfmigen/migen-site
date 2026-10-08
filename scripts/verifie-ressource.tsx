/**
 * Contrôle du gabarit RESSOURCE contre la maquette, contre son type, et contre
 * les interdits de copie.
 *
 *   bun scripts/verifie-ressource.tsx
 *   bun scripts/verifie-ressource.tsx supabase/import/gabarits-maquette/ressources-articles-gmao.json
 *
 * CE QUI REND CE CONTRÔLE REJOUABLE. Les valeurs attendues ne sont pas écrites
 * ici : elles sont RELUES dans `maquette/accueil-rendu.html` à chaque exécution,
 * sur la tranche du gabarit « isRes ». Chaque déclaration de style est exigée
 * des DEUX côtés, dans la maquette ET dans le HTML rendu par le composant. Une
 * note de lecture peut se tromper et personne ne peut la rejouer ; une
 * comparaison, si.
 *
 * Le texte est comparé NORMALISÉ : la maquette écrit l'espace insécable en
 * entité et l'apostrophe en typographique, le corpus écrit l'une et l'autre en
 * caractère simple. Comparer les octets ferait échouer le contrôle sur une
 * différence que personne ne voit.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

import PageRessource from "@/components/site/ressource/PageRessource";
import { estRessource } from "@/types/ressource";

const MAQUETTE = "maquette/accueil-rendu.html";
const DOSSIER = "supabase/import/gabarits-maquette";
const CHOISI = process.argv[2] ?? null;

/* ------------------------------------------------------ la tranche maquette */

/**
 * La tranche du gabarit, délimitée par sa propre condition.
 *
 * Les bornes sont CHERCHÉES, pas écrites : un numéro de ligne codé en dur se
 * périmerait au premier remaniement de la maquette, et le contrôle passerait
 * alors sur le mauvais gabarit sans rien dire.
 */
function trancheIsRes(): string {
  const lignes = readFileSync(MAQUETTE, "utf8").split("\n");
  const debut = lignes.findIndex((l) => l.startsWith('<sc-if value="{{ isRes }}"'));
  assert.ok(debut > -1, `${MAQUETTE} : la condition « isRes » est introuvable`);
  const fin = lignes.findIndex((l, i) => i > debut && l.startsWith("</sc-if>"));
  assert.ok(fin > debut, `${MAQUETTE} : la fermeture du gabarit « isRes » est introuvable`);
  return lignes.slice(debut, fin + 1).join("\n");
}

/** `&nbsp;` et apostrophe typographique ramenés au caractère simple. */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/&#x27;|&#39;/g, "'");
}

const maquette = trancheIsRes();

/* ------------------------------------------------------------ le rendu plein */

const fichiers = readdirSync(DOSSIER)
  .filter((n) => n.startsWith("ressources-") && n.endsWith(".json"))
  .sort();
assert.ok(fichiers.length > 0, `${DOSSIER} : aucun fichier ressources-*.json`);

type Fichier = { url: string; h1?: string; contenu: unknown; blocs_corpus?: number };
const pages: Fichier[] = (CHOISI ? [CHOISI] : fichiers.map((n) => join(DOSSIER, n))).map(
  (chemin) => JSON.parse(readFileSync(chemin, "utf8")) as Fichier,
);

const PLEINE = pages.find((p) => {
  const c = p.contenu as Record<string, unknown>;
  return !!c.cartes && !!c.corps && !!c.questions && !!c.rappel && !!c.categorie;
});
assert.ok(PLEINE, "aucune page ne remplit les sept sections : le rendu plein ne prouverait rien");
assert.ok(estRessource(PLEINE.contenu), "le contenu de contrôle doit porter gabarit « ressource »");

const rendu = renderToStaticMarkup(
  <PageRessource titre={PLEINE.h1 ?? "Titre de contrôle"} contenu={PLEINE.contenu} />,
);

/* ------------------------- les valeurs de la maquette, exigées des deux côtés */

/**
 * Chaque déclaration doit se trouver DANS LA MAQUETTE et DANS LE RENDU.
 *
 * C'est la double exigence qui fait la preuve : présente dans la maquette
 * seule, la valeur n'est pas portée ; présente dans le rendu seul, elle est
 * inventée. Les sept sections du gabarit y sont représentées.
 */
const VALEURS: [string, string][] = [
  ["1. en-tête, pastille de format",
   "color:#fff;background:var(--acc);padding:5px 12px;border-radius:999px;white-space:nowrap"],
  ["1. en-tête, H1",
   "font:600 calc(clamp(30px,3.6vw,52px) * var(--ts))/1.06 var(--ft);letter-spacing:-.042em"],
  ["1. en-tête, chapeau", "font:400 18px/1.65 var(--fb);color:var(--ink2)"],
  ["2. variante article, carte en verre",
   "box-shadow:0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)"],
  ["2. variante article, grille de lecture",
   "grid-template-columns:minmax(0,760px) minmax(0,1fr);gap:52px"],
  ["2. variante article, colonne collante", "display:grid;gap:16px;position:sticky;top:120px"],
  ["2. variante article, prose", "font:400 17px/1.75 var(--fb);color:var(--ink1)"],
  ["2. variante article, H2 de lecture",
   "font:600 calc(24px * var(--ts))/1.2 var(--ft);letter-spacing:-.03em"],
  ["2. variante article, encadré en barre",
   "border-left:3px solid var(--acc);padding:4px 0 4px 24px;margin:32px 0"],
  ["4. variante pratique, pastille numérotée",
   "width:30px;height:30px;border-radius:999px;background:var(--acc);color:#fff;font:600 13px var(--fb)"],
  ["4. variante pratique, intitulé d'étape",
   "font:600 calc(16.5px * var(--ts))/1.35 var(--ft);letter-spacing:-.022em;margin-bottom:6px"],
  ["4. variante pratique, méthode d'étape", "font:400 14.5px/1.6 var(--fb);color:var(--ink2)"],
  ["5. variante process, bandeau en lavis",
   "background:var(--acc-w);border:1.5px solid rgba(255,124,60,.3)"],
  ["6. variante technique, en-tête de colonne",
   "font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--ink4)"],
  ["6. variante technique, fond d'en-tête de barème", "background:var(--chip)"],
  ["7. appel de fin, titre",
   "font:600 calc(clamp(22px,2.2vw,32px) * var(--ts))/1.14 var(--ft);letter-spacing:-.035em"],
  ["7. appel de fin, bouton principal",
   "box-shadow:0 12px 30px -12px rgba(255,124,60,.9)"],
];

for (const [ou, declaration] of VALEURS) {
  assert.ok(
    maquette.includes(declaration),
    `${ou} : « ${declaration} » absente de la tranche isRes de la maquette, la relire`,
  );
  assert.ok(rendu.includes(declaration), `${ou} : « ${declaration} » absente du rendu`);
}

/** La copie fixe de l'appel de fin vient de la maquette, mot pour mot. */
const COPIE = [
  "Une question sur ce contenu",
  "Nos équipes répondent aux questions techniques.",
  "Poser ma question",
  "Toutes les ressources",
];
const maquetteNormalisee = normalise(maquette);
const renduNormalise = normalise(rendu);
for (const phrase of COPIE) {
  assert.ok(
    maquetteNormalisee.includes(normalise(phrase)),
    `appel de fin : « ${phrase} » n'est pas la copie de la maquette`,
  );
  assert.ok(renduNormalise.includes(normalise(phrase)), `appel de fin : « ${phrase} » absente du rendu`);
}

/* ---------------------------------------------------------- l'hygiène du rendu */

assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul h1 par page");
assert.ok(!/href="#"/.test(rendu), 'le rendu porte un href="#" : un bouton qui ne mène nulle part');
assert.ok(
  !/href="#[a-z-]*"/.test(rendu.replace(/href="#formulaire"/g, "")),
  "la seule ancre autorisée est #formulaire, celle du formulaire de bas de page",
);
assert.ok(rendu.includes('href="#formulaire"'), "l'appel de fin doit viser l'ancre du formulaire");

const TAILWIND =
  /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
assert.ok(!TAILWIND.test(rendu), "le rendu porte une classe de couleur Tailwind, pas un jeton de la charte");
assert.ok(!/\bdark:/.test(rendu), "le rendu porte une variante dark:, le site n'a pas de mode sombre");

/* --------------------------------------- une section sans donnée ne se rend pas */

const nu = renderToStaticMarkup(
  <PageRessource titre="Page sans contenu" contenu={{ gabarit: "ressource" }} />,
);
assert.equal((nu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul h1, même sur une page nue");
for (const [quoi, marque] of [
  ["la pastille de format", "border-radius:999px;white-space:nowrap"],
  ["le bandeau de rappel", "border:1.5px solid rgba(255,124,60,.3)"],
  ["la colonne collante", "position:sticky"],
  ["la carte de procédure", "width:30px;height:30px"],
  ["le barème", "<table"],
  ["la foire aux questions", "<details"],
] as const) {
  assert.ok(!nu.includes(marque), `${quoi} se rend alors que la donnée est absente`);
}
// L'appel de fin est du chrome : il ne dépend pas de la page et reste.
assert.ok(nu.includes("Une question sur ce contenu"), "l'appel de fin doit rester sur une page nue");

/* --------------------------------------------------------------- la forme */

const CLES = new Set(["gabarit", "categorie", "chapeau", "rappel", "cartes", "corps", "questions"]);
const CLES_CARTE = new Set([
  "surtitre", "titre", "texte", "points", "lienLibelle", "lienHref", "accent",
]);
const BLOCS = new Set(["titre", "paragraphe", "liste", "tableau", "citation"]);

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;

for (const page of pages) {
  const ou = page.url;
  assert.ok(estChaine(page.url) && page.url.startsWith("/ressources/"), `${ou} : chemin /ressources/... attendu`);
  assert.ok(page.url.endsWith("/"), `${ou} : slash final attendu`);
  assert.ok(estRessource(page.contenu), `${ou} : gabarit « ressource » attendu`);
  const c = page.contenu as unknown as Record<string, unknown>;

  for (const cle of Object.keys(c)) {
    assert.ok(CLES.has(cle), `${ou} : clé « ${cle} » inconnue du type (${[...CLES].join(", ")})`);
  }
  for (const cle of ["categorie", "chapeau", "rappel"]) {
    if (c[cle] !== undefined) assert.ok(estChaine(c[cle]), `${ou}.${cle} : chaîne non vide attendue`);
  }

  if (c.cartes !== undefined) {
    assert.ok(Array.isArray(c.cartes) && c.cartes.length > 0, `${ou}.cartes : tableau non vide attendu`);
    c.cartes.forEach((carte, i) => {
      const où = `${ou}.cartes[${i}]`;
      assert.ok(!!carte && typeof carte === "object" && !Array.isArray(carte), `${où} : objet attendu`);
      const k = carte as Record<string, unknown>;
      for (const cle of Object.keys(k)) {
        assert.ok(CLES_CARTE.has(cle), `${où} : clé « ${cle} » inconnue`);
      }
      assert.ok(estChaine(k.surtitre), `${où}.surtitre : chaîne non vide attendue`);
      if (k.lienHref !== undefined) {
        assert.ok(
          estChaine(k.lienHref) && k.lienHref.startsWith("/") && !k.lienHref.startsWith("//"),
          `${où}.lienHref : chemin interne attendu`,
        );
        assert.ok(estChaine(k.lienLibelle), `${où}.lienLibelle : un lien sans libellé ne se clique pas`);
      }
      if (k.points !== undefined) {
        assert.ok(Array.isArray(k.points) && k.points.length > 0, `${où}.points : tableau non vide attendu`);
      }
    });
  }

  if (c.corps !== undefined) {
    assert.ok(Array.isArray(c.corps) && c.corps.length > 0, `${ou}.corps : tableau non vide attendu`);
    c.corps.forEach((bloc, i) => {
      const t = (bloc as { type?: unknown })?.type;
      assert.ok(typeof t === "string" && BLOCS.has(t), `${ou}.corps[${i}] : type « ${String(t)} » inconnu`);
    });
  }

  if (c.questions !== undefined) {
    assert.ok(Array.isArray(c.questions) && c.questions.length > 0, `${ou}.questions : tableau non vide attendu`);
    c.questions.forEach((q, i) => {
      const k = q as Record<string, unknown>;
      assert.ok(estChaine(k.question), `${ou}.questions[${i}].question : chaîne non vide attendue`);
      assert.ok(estChaine(k.reponse), `${ou}.questions[${i}].reponse : chaîne non vide attendue`);
    });
  }

  /* RIEN DU CORPUS NE SE PERD. Le fichier porte le nombre de blocs que le
     corpus analysé lui donnait : corps, questions, cartes issues d'un encadré,
     rappel et titre de la FAQ doivent le retrouver exactement. C'est ce qui
     garantit qu'aucun paragraphe payé par le client n'a été jeté en route. */
  if (page.blocs_corpus !== undefined) {
    const compte =
      (Array.isArray(c.corps) ? c.corps.length : 0) +
      (Array.isArray(c.questions) ? c.questions.length : 0) +
      (Array.isArray(c.cartes) ? c.cartes.length : 0) +
      (c.rappel ? 1 : 0) +
      1; // le titre « Questions fréquentes », remplacé par le surtitre du bloc
    assert.equal(
      compte,
      page.blocs_corpus,
      `${ou} : ${page.blocs_corpus} blocs au corpus, ${compte} retrouvés, du texte a été perdu`,
    );
  }
}

/* ------------------------------------------------------- les interdits de copie */

const INTERDITS: [RegExp, string][] = [
  // Règle validée par le client (design_handoff_migen_site/README.md) :
  // « +200 clients », sans jamais préciser « réguliers ». « +200 » est exigé
  // plus bas là où la capture le porte.
  [/\b(?:clients|80)\s+r[ée]guliers\b/i, "« +200 clients », sans jamais préciser « réguliers »"],
  [/\b(?:5|cinq)\s+agences\b/i, "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  [/\b(?:r[ée]gie|int[ée]rim|mise à disposition|sans engagement)\b/i, "nommer la prestation"],
  [/\b(?:cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez)\b/i,
   "dire ce qui est fait"],
  [/[—–]/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  // Un délai chiffré. Seul le rappel dans l'heure est autorisé, et il n'est
  // jamais écrit en chiffres : c'est pour cela qu'aucune tolérance n'est posée.
  [/\bsous\s+\d+\s*(?:h|heures?|min|minutes?|jours?)\b/i, "« rappel dans l'heure », aucun autre délai"],
  [/\ben\s+(?:deux|trois|quatre)\s+heures\b/i, "« rappel dans l'heure », aucun autre délai"],
];

/**
 * Un montant, interdit PARTOUT SAUF sur une page, et il faut le dire.
 *
 * L'interdit du contrat vise les PRIX DE MIGEN : aucun tarif, aucune grille,
 * aucune rémunération affichée. Or `/ressources/articles/cout-arret-de-
 * production/` a pour sujet, et pour mot clé, le coût d'un arrêt de production
 * CHEZ LE CLIENT : son corps porte neuf montants, qui sont tous le calcul de ce
 * que le client perd quand sa ligne s'arrête (marge horaire, opérateurs
 * immobilisés, réparation). Aucun n'est un prix de prestation Migen.
 *
 * Appliquer l'interdit tel quel aurait vidé la page de son propos. L'exception
 * est donc NOMMÉE, bornée à cette URL, et signalée dans le rapport de portage
 * pour arbitrage : une règle du contrat ne se contourne pas en silence.
 *
 * La seconde règle, elle, ne souffre aucune exception : le vocabulaire
 * tarifaire de Migen est refusé même sur cette page.
 */
const MONTANT = /\d[\d\s.,]*\s*(?:€|k€|euros?)/i;
const PAGE_A_MONTANTS = "/ressources/articles/cout-arret-de-production/";
const TARIF =
  /grille tarifaire|nos (?:prix|tarifs)|notre tarif|tarif[s]?\s+(?:horaire|journalier)|€\s*(?:HT|TTC)|à partir de\s+\d[\d\s.,]*\s*(?:€|k€|euros?)/i;

function chaines(v: unknown, ou: string, out: [string, string][] = []): [string, string][] {
  if (typeof v === "string") out.push([ou, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => chaines(x, `${ou}[${i}]`, out));
  else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) chaines(x, `${ou}.${k}`, out);
  }
  return out;
}

let controlees = 0;
let compte200 = 0;
for (const page of pages) {
  /* Le compte de clients est exigé là où la capture le porte, en texte visible
     (hors script) : `maquette/rendu/<clé>.html`, la référence validée. */
  const capture = readFileSync(`maquette/rendu/${page.url.slice(1, -1).replaceAll("/", "--")}.html`, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]*>/g, "");
  for (const compte of ["+200", "200 clients"]) {
    if (!capture.includes(compte)) continue;
    assert.ok(
      chaines(page.contenu, page.url).some(([, t]) => t.includes(compte)),
      `${page.url} : « ${compte} » est dans la capture, pas dans le contenu`,
    );
    compte200 += 1;
  }
  for (const [ou, texte] of chaines(page.contenu, page.url)) {
    if (ou.endsWith(".lienHref")) continue;
    controlees += 1;
    for (const [motif, remede] of INTERDITS) {
      assert.ok(!motif.test(texte), `${ou} : formulation interdite (${remede}) dans « ${texte.slice(0, 120)} »`);
    }
    assert.ok(
      !TARIF.test(texte),
      `${ou} : vocabulaire tarifaire interdit, sans exception, dans « ${texte.slice(0, 120)} »`,
    );
    if (page.url !== PAGE_A_MONTANTS) {
      assert.ok(
        !MONTANT.test(texte),
        `${ou} : aucun prix ni grille tarifaire, dans « ${texte.slice(0, 120)} »`,
      );
    }
  }
}

/* L'exception doit rester une exception : si cette page perdait ses montants,
   la borne n'aurait plus de raison d'être et il faudrait la retirer. */
if (!CHOISI) {
  const exception = pages.find((p) => p.url === PAGE_A_MONTANTS);
  assert.ok(exception, `${PAGE_A_MONTANTS} absente : l'exception aux montants n'a plus d'objet`);
  assert.ok(
    chaines(exception.contenu, "").some(([, t]) => MONTANT.test(t)),
    `${PAGE_A_MONTANTS} ne porte plus de montant : retirer l'exception du contrôle`,
  );
}

/* La copie du composant lui-même passe par le même tamis, sinon un interdit
   écrit en dur dans le gabarit échapperait à tous les contrôles de données. */
for (const [motif, remede] of INTERDITS) {
  const source = readFileSync("components/site/ressource/habillage.ts", "utf8")
    // Les commentaires expliquent pourquoi le portage s'écarte de la maquette,
    // donc ils citent les formulations interdites.
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.ok(!motif.test(source), `habillage.ts : formulation interdite (${remede})`);
}

console.log(
  `ressource : ${pages.length} page(s) conformes, ${VALEURS.length} valeurs relues dans la maquette ` +
    `et retrouvées au rendu, ${COPIE.length} phrases de copie, ${controlees} chaînes passées aux interdits, ` +
    `${compte200} comptes de clients de la capture portés, ` +
    `rendu plein ${(rendu.length / 1024).toFixed(1)} ko sur ${PLEINE.url}.`,
);
