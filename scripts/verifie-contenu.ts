/**
 * Contrôle du contenu extrait contre le contrat des types, gabarit par gabarit :
 * `types/contenu.ts` pour les pages de vente, `types/fiche.ts` pour les fiches
 * de cas client.
 *
 *   bun scripts/verifie-contenu.ts
 *
 * POURQUOI CE FICHIER EXISTE : le contenu part dans un `jsonb`. Postgres n'en
 * garantit que la syntaxe, et TypeScript s'arrête à la frontière de la base.
 * Entre le parseur qui écrit et les blocs qui lisent, rien ne vérifiait que les
 * deux parlaient de la même forme. Un `prestation` écrit en chaîne alors que le
 * bloc attendait un objet a produit, sur 110 pages, une colonne entièrement
 * vide : aucune erreur, aucun avertissement de compilation, du vide à l'écran.
 *
 * Ce contrôle est la porte qui manquait. Il échoue bruyamment.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import type { Section } from "@/types/contenu";
import { estFiche, type ContenuFiche } from "@/types/fiche";

const CHEMIN = "supabase/import/corpus-analyse.json";
const CHEMIN_FICHES = "supabase/import/fiches-analyse.json";

interface Analyse {
  url: string;
  fichier: string;
  contenu: { sections: Section[] };
}

interface AnalyseFiche {
  url: string;
  fichier: string;
  contenu: ContenuFiche;
}

type Verificateur = (s: Record<string, unknown>, ou: string) => void;

const estChaine = (v: unknown) => typeof v === "string" && v.length > 0;

function paragraphe(v: unknown, ou: string): void {
  assert.ok(v && typeof v === "object" && !Array.isArray(v), `${ou} : attendu un objet Paragraphe, reçu ${typeof v}`);
  const p = v as Record<string, unknown>;
  assert.ok(estChaine(p.texte), `${ou}.texte : chaîne non vide attendue`);
  if (p.accroche !== undefined) {
    assert.ok(estChaine(p.accroche), `${ou}.accroche : chaîne attendue`);
  }
}

function liste(v: unknown, ou: string, element: (x: unknown, ou: string) => void): void {
  assert.ok(Array.isArray(v), `${ou} : tableau attendu`);
  (v as unknown[]).forEach((x, i) => element(x, `${ou}[${i}]`));
}

const VERIFICATEURS: Record<Section["type"], Verificateur> = {
  heros: (s, ou) => {
    for (const champ of ["h1", "mecanisme", "cta", "telephone", "phraseDelai"]) {
      assert.ok(estChaine(s[champ]), `${ou}.${champ} : chaîne non vide attendue`);
    }
  },
  chiffres: (s, ou) => {
    liste(s.chiffres, `${ou}.chiffres`, (c, o) => {
      const ch = c as Record<string, unknown>;
      assert.ok(estChaine(ch.valeur), `${o}.valeur : chaîne attendue`);
      assert.ok(typeof ch.libelle === "string", `${o}.libelle : chaîne attendue`);
    });
    if (s.reponse !== undefined) liste(s.reponse, `${ou}.reponse`, paragraphe);
  },
  probleme: (s, ou) => {
    assert.ok(estChaine(s.punchline), `${ou}.punchline : chaîne non vide attendue`);
    liste(s.puces, `${ou}.puces`, paragraphe);
  },
  offre: (s, ou) => {
    liste(s.lignes, `${ou}.lignes`, (l, o) => {
      const ligne = l as Record<string, unknown>;
      paragraphe(ligne.prestation, `${o}.prestation`);
      assert.ok(estChaine(ligne.benefice), `${o}.benefice : chaîne non vide attendue`);
    });
    if (s.tableau !== undefined) {
      const t = s.tableau as Record<string, unknown>;
      liste(t.entetes, `${ou}.tableau.entetes`, (e, o) =>
        assert.ok(typeof e === "string", `${o} : chaîne attendue`));
      liste(t.lignes, `${ou}.tableau.lignes`, (r, o) =>
        liste(r, o, (c, oc) => assert.ok(typeof c === "string", `${oc} : chaîne attendue`)));
    }
    if (s.prose !== undefined) liste(s.prose, `${ou}.prose`, paragraphe);
  },
  deroule: (s, ou) =>
    liste(s.etapes, `${ou}.etapes`, (e, o) => {
      const et = e as Record<string, unknown>;
      assert.ok(estChaine(et.titre), `${o}.titre : chaîne non vide attendue`);
      if (et.texte !== undefined) assert.ok(typeof et.texte === "string", `${o}.texte : chaîne attendue`);
    }),
  garanties: (s, ou) => liste(s.puces, `${ou}.puces`, paragraphe),
  cta: (s, ou) => {
    assert.ok(estChaine(s.question), `${ou}.question : chaîne non vide attendue`);
    assert.ok(estChaine(s.bouton), `${ou}.bouton : chaîne non vide attendue`);
  },
  preuves: (s, ou) =>
    liste(s.preuves, `${ou}.preuves`, (p, o) => {
      const pr = p as Record<string, unknown>;
      assert.ok(estChaine(pr.titre), `${o}.titre : chaîne non vide attendue`);
      if (pr.lienHref !== undefined) {
        assert.ok(
          typeof pr.lienHref === "string" && pr.lienHref.startsWith("/"),
          `${o}.lienHref : chemin interne attendu, reçu ${String(pr.lienHref)}`,
        );
      }
    }),
  objections: (s, ou) =>
    liste(s.questions, `${ou}.questions`, (q, o) => {
      const qu = q as Record<string, unknown>;
      assert.ok(estChaine(qu.question), `${o}.question : chaîne non vide attendue`);
      assert.ok(estChaine(qu.reponse), `${o}.reponse : chaîne non vide attendue`);
    }),
  ctaFinal: (s, ou) => VERIFICATEURS.cta(s, ou),
};

/**
 * Le gabarit FICHE, section par section de `types/fiche.ts`.
 *
 * Deux familles de champs, et la distinction compte : `chapeau`, `contexte`,
 * `intervention` et `surtitre` passent par `TexteRiche`, qui rend le gras et
 * les liens internes ; `fiche[]` et `resultats[]` sont rendus en texte BRUT par
 * `PageFiche.tsx`. Un `**` ou un `](` qui s'y glisserait s'afficherait tel quel
 * au visiteur, sans erreur ni avertissement. C'est ce que ce contrôle attrape.
 */
const MARQUEUR_MARKDOWN = /\*\*|\]\(/;

function brut(v: unknown, ou: string): void {
  assert.ok(typeof v === "string", `${ou} : chaîne attendue`);
  assert.doesNotMatch(v as string, MARQUEUR_MARKDOWN, `${ou} : marqueur Markdown dans un champ rendu brut`);
}

function fiche(contenu: unknown, ou: string): void {
  assert.ok(estFiche(contenu), `${ou} : discriminant gabarit: "fiche" attendu`);
  // Le garde a réduit `contenu` au type déclaré ; on repasse par `unknown` pour
  // lire chaque champ tel qu'il est, pas tel que le type le promet.
  const c = contenu as unknown as Record<string, unknown>;
  for (const champ of ["surtitre", "chapeau", "contexte", "intervention"]) {
    if (c[champ] !== undefined) {
      assert.ok(estChaine(c[champ]), `${ou}.${champ} : chaîne non vide attendue si présent`);
    }
  }
  if (c.fiche !== undefined) {
    liste(c.fiche, `${ou}.fiche`, (l, o) => {
      const ligne = l as Record<string, unknown>;
      brut(ligne.libelle, `${o}.libelle`);
      brut(ligne.valeur, `${o}.valeur`);
      assert.ok(estChaine(ligne.libelle) && estChaine(ligne.valeur), `${o} : libellé et valeur non vides attendus`);
    });
  }
  if (c.images !== undefined) {
    liste(c.images, `${ou}.images`, (im, o) => {
      const image = im as Record<string, unknown>;
      assert.ok(
        typeof image.src === "string" && image.src.startsWith("/"),
        `${o}.src : chemin public attendu, reçu ${String(image.src)}`,
      );
      if (image.alt !== undefined) assert.ok(typeof image.alt === "string", `${o}.alt : chaîne attendue`);
    });
  }
  if (c.resultats !== undefined) {
    liste(c.resultats, `${ou}.resultats`, (r, o) => {
      const chiffre = r as Record<string, unknown>;
      brut(chiffre.valeur, `${o}.valeur`);
      brut(chiffre.libelle, `${o}.libelle`);
      assert.ok(estChaine(chiffre.valeur), `${o}.valeur : chaîne non vide attendue`);
    });
  }
}

const analyses = JSON.parse(readFileSync(CHEMIN, "utf8")) as Analyse[];
const echecs: string[] = [];
let nbSections = 0;

for (const a of analyses) {
  for (const [i, section] of (a.contenu?.sections ?? []).entries()) {
    nbSections += 1;
    const ou = `${a.url || a.fichier} section[${i}] (${section.type})`;
    const verifie = VERIFICATEURS[section.type];
    if (!verifie) {
      echecs.push(`${ou} : type inconnu du contrat`);
      continue;
    }
    try {
      verifie(section as unknown as Record<string, unknown>, ou);
    } catch (erreur) {
      echecs.push(erreur instanceof Error ? erreur.message : String(erreur));
    }
  }
}

const fiches = JSON.parse(readFileSync(CHEMIN_FICHES, "utf8")) as AnalyseFiche[];
for (const f of fiches) {
  try {
    fiche(f.contenu, `${f.url || f.fichier} (fiche)`);
  } catch (erreur) {
    echecs.push(erreur instanceof Error ? erreur.message : String(erreur));
  }
}

console.log(`${analyses.length} pages, ${nbSections} sections contrôlées · ${fiches.length} fiches contrôlées`);
if (echecs.length > 0) {
  console.error(`\n${echecs.length} ÉCARTS AU CONTRAT :\n`);
  // Un échec par motif suffit à corriger : on regroupe pour ne pas noyer.
  const motifs = new Map<string, { exemple: string; n: number }>();
  for (const e of echecs) {
    const cle = e.replace(/^[^ ]+ /, "").replace(/\[\d+\]/g, "[i]");
    const vu = motifs.get(cle);
    if (vu) vu.n += 1;
    else motifs.set(cle, { exemple: e, n: 1 });
  }
  for (const [, { exemple, n }] of motifs) {
    console.error(`  ×${n}  ${exemple}`);
  }
  process.exit(1);
}
console.log("Contrat respecté : chaque section a la forme que son bloc attend.");
