/**
 * Contrôle du bloc « Notre sélection » de l'accueil, sans navigateur.
 *
 *   bun components/site/accueil/verification-selection.tsx
 *
 * La référence est `design_handoff_migen_site/maquette/MigenSelection.dc.html`
 * (refonte du 08/10). Rien n'est recopié ici : textes, étapes, cadence, règles
 * `@media` et `style-hover` sont LUS dans la source, puis cherchés dans le rendu
 * serveur et dans le module CSS. La comparaison au navigateur (styles calculés
 * élément par élément) se fait à part ; celle-ci garde le contenu et la logique.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DUREE_MS,
  ETAPES_SELECTION,
  PAS_MS,
  avance,
} from "@/components/site/accueil/CarteEtapes";
import ProcessSelection from "@/components/site/accueil/ProcessSelection";

const lis = (chemin: string) =>
  readFileSync(new URL(chemin, import.meta.url), "utf8");

const source = lis("../../../design_handoff_migen_site/maquette/MigenSelection.dc.html");
const moduleCss = lis("./ProcessSelection.module.css");
const carte = lis("./CarteEtapes.tsx");
const formulaire = lis("./FormulaireBasDePage.tsx");

const entites = (t: string) =>
  t
    .replaceAll("&nbsp;", " ")
    .replaceAll("&rarr;", "→")
    .replaceAll("&copy;", "©")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"');
const html = entites(renderToStaticMarkup(<ProcessSelection />));

// ----------------------------------------------------- les étapes (`STEPS`)
const steps = [...source.matchAll(/\{ t: "([^"]+)", keep: (\d+), d: "([^"]+)" \}/g)].map(
  ([, t, keep, d]) => ({ t, keep: Number(keep), d: JSON.parse(`"${d}"`) as string }),
);
assert.equal(steps.length, 6, "les six STEPS de la source sont introuvables");
assert.deepEqual(
  ETAPES_SELECTION.map(({ t, keep, d }) => ({ t, keep, d })),
  steps,
  "les étapes du site ne sont plus celles de la source",
);

// ------------------------------------------------- la cadence et ses seuils
const delai = source.match(/&quot;delay&quot;:\{[^}]*&quot;default&quot;:([\d.]+)/);
assert.ok(delai, "`delay` introuvable dans la source");
assert.equal(DUREE_MS, Math.max(2000, Number(delai[1]) * 1000), "durée d'une étape");
assert.ok(source.includes(`setInterval(() => this.tick(), ${PAS_MS})`), "pas de la minuterie");
assert.ok(source.includes("{ threshold: 0.3 }") && carte.includes("{ threshold: 0.3 }"), "seuil de visibilité");

// `tick()` : 37 pas restent sur l'étape, le 38e passe à la suivante, la
// sixième boucle sur la première.
let lecture = { etape: 0, t: 0 };
for (let pas = 0; pas < 37; pas += 1) lecture = avance(lecture);
assert.deepEqual(lecture, { etape: 0, t: 37 * PAS_MS });
assert.deepEqual(avance(lecture), { etape: 1, t: 0 });
assert.deepEqual(avance({ etape: 5, t: DUREE_MS - PAS_MS }), { etape: 0, t: 0 });

// ------------------------------------------------------ les textes du gabarit
const gabarit = source.slice(source.indexOf("<section"), source.indexOf("</section>"));
const textes = [...gabarit.matchAll(/>([^<>{}]+)</g)]
  .map(([, t]) => entites(t).trim())
  .filter(Boolean);
assert.ok(textes.length >= 15, "textes du gabarit introuvables");
for (const texte of textes) assert.ok(html.includes(texte), `texte absent du rendu : « ${texte} »`);
const alt = gabarit.match(/alt="([^"]+)"/);
assert.ok(alt && html.includes(`alt="${alt[1]}"`), "texte alternatif de la photo");
for (const [i, { t, keep }] of steps.entries()) {
  const n = String(i + 1).padStart(2, "0");
  assert.ok(html.includes(`Étape ${n} · ${t}`), `détail de l'étape ${n}`);
  assert.ok(html.includes(`${keep} %`), `taux de l'étape ${n}`);
}

// ---------------------------------------------- l'état servi avant hydratation
const presses = [...html.matchAll(/aria-pressed="(true|false)"/g)].map(([, v]) => v);
assert.deepEqual(presses, ["true", "false", "false", "false", "false", "false"], "étape 01 active au départ");
assert.equal([...html.matchAll(/aria-hidden="false"/g)].length, 1, "un seul détail lisible");

// L'ancre du bouton : `#form-bas` dans la maquette, `#formulaire` sur le site.
assert.ok(gabarit.includes('href="#form-bas"'), "ancre de la source changée, revoir le bouton");
assert.ok(html.includes('href="#formulaire"') && formulaire.includes('id="formulaire"'), "ancre du formulaire");

// ------------------------------------------- `@media` et `style-hover` de la source
const sansBlancs = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "");
const css = sansBlancs(moduleCss);
const helmet = source.slice(source.indexOf("<style>") + 7, source.indexOf("</style>"));
const CLASSES: Record<string, string> = { "mgs-head": "tete", "mgs-bento": "bento", "mgs-photo": "photo", "mgs-wrap": "wrap", "mgs-card": "carte" };
const medias = helmet.match(/@media[^{]+\{(?:[^{}]+\{[^}]+\})+\}/g) ?? [];
assert.equal(medias.length, 2, "les deux @media de la source sont introuvables");
for (const media of medias) {
  const attendu = sansBlancs(media.replace(/\.(mgs-[a-z]+)/g, (_, c: string) => `.${CLASSES[c]}`));
  const tete = attendu.slice(0, attendu.indexOf("{") + 1);
  const bloc = css.slice(css.indexOf(tete), css.indexOf("}}", css.indexOf(tete)) + 2);
  for (const regle of attendu.slice(tete.length, -1).match(/[^{}]+\{[^}]+\}/g) ?? []) {
    const [selecteur, corps] = regle.split("{");
    for (const decl of corps.replace("}", "").split(";").filter(Boolean)) {
      assert.ok(bloc.includes(decl) && bloc.includes(`${selecteur}{`), `${tete} ${selecteur} : ${decl}`);
    }
  }
}
const survols = [...gabarit.matchAll(/style-hover="([^"]+)"/g)].map(([, s]) => s);
assert.equal(survols.length, 2, "deux style-hover dans la source");
for (const [i, nom] of [".cta:hover", ".lien:hover"].entries()) {
  const regle = css.slice(css.indexOf(`${nom}{`), css.indexOf("}", css.indexOf(`${nom}{`)));
  for (const decl of survols[i].split(";")) assert.ok(regle.includes(`${decl}!important`), `${nom} : ${decl}`);
}

console.log(
  `Sélection : ${steps.length} étapes, ${textes.length} textes du gabarit, cadence ${DUREE_MS} ms par pas de ${PAS_MS} ms, ` +
    "@media et style-hover conformes à MigenSelection.dc.html. Toutes les assertions passent.",
);
