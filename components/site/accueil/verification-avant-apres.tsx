/**
 * Contrôle de la bascule « Avant migen© / Avec migen© », sans navigateur.
 *
 *   bun components/site/accueil/verification-avant-apres.tsx
 *
 * Les valeurs attendues ne sont pas écrites ici : elles sont relevées dans
 * `maquette/accueil-rendu.html`, dans `baTab`, `baToggleCss` et la cascade de
 * `baTiles`. Si quelqu'un remet des segments pâles de 14,5px, retire la bordure
 * de verre à la place du fond littéral, ou rend la bascule instantanée, ce
 * script échoue en nommant la déclaration fautive.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import AvantApresBascule from "@/components/site/accueil/AvantApresBascule";
import { VUE_AVANT, VUE_AVEC } from "@/components/site/accueil/avant-apres-donnees";

const racine = new URL("../../../", import.meta.url);
const maquette = readFileSync(new URL("maquette/accueil-rendu.html", racine), "utf8");
const module_ = readFileSync(
  new URL("components/site/accueil/AvantApresBascule.module.css", racine),
  "utf8",
);

/** Deux notations pour la même valeur : `rgba(255, 124, 60, 0.9)` vaut
 *  `rgba(255,124,60,.9)`. La maquette est serrée, le module CSS est formaté. */
function meme(valeur: string): string {
  return valeur.toLowerCase().replace(/\s+/g, "").replace(/\b0+(\.\d)/g, "$1");
}

/** Relève un groupe dans la maquette, et échoue si le motif ne mord plus. */
function releve(motif: RegExp, quoi: string): RegExpMatchArray {
  const trouve = maquette.match(motif);
  assert.ok(trouve, `introuvable dans maquette/accueil-rendu.html : ${quoi}`);
  return trouve;
}

/** Le corps d'une règle du module CSS, accolades comprises. */
function regle(selecteur: string): string {
  const debut = module_.indexOf(selecteur + " {");
  assert.notEqual(debut, -1, `règle absente du module CSS : ${selecteur}`);
  const fin = module_.indexOf("}", debut);
  return module_.slice(debut, fin);
}

function porte(selecteur: string, declaration: string): void {
  assert.ok(
    meme(regle(selecteur)).includes(meme(declaration)),
    `${selecteur} ne porte pas « ${declaration.trim()} » (relevé dans la maquette)`,
  );
}

/* ------------------------------------------------- les deux segments, baTab */

const segment = releve(
  /baTab\(active\) \{\s*return "([^"]+)" \+\s*\(active \? "([^"]+)" : "([^"]+)"\) \+\s*";background-color:" \+ \(active \? "([^"]+)" : "([^"]+)"\) \+\s*\(active \? ";box-shadow:([^"]+)" : ""\)/,
  "baTab(active)",
);
const [, communes, encreActive, encreInactive, fondActif, fondInactif, ombreActive] = segment;

// « padding:15px 30px », « font:600 calc(16.5px * var(--ts)) var(--fb) »,
// « letter-spacing:-.01em » : les trois écarts les plus visibles.
for (const declaration of communes.split(";")) {
  if (declaration.startsWith("color:") || !declaration.includes(":")) continue;
  porte(".onglet", declaration);
}
porte(".onglet", `color:${encreInactive}`);
porte(".onglet", `background-color:${fondInactif}`);
porte('.onglet[aria-pressed="true"]', `color:${encreActive}`);
porte('.onglet[aria-pressed="true"]', `background-color:${fondActif}`);
porte('.onglet[aria-pressed="true"]', `box-shadow:${ombreActive}`);

/* ------------------------------------------- l'enveloppe, baToggleCss */

const enveloppe = releve(
  /baToggleCss: "([^"]+)" \+\s*\(after \? "([^"]+)" : "([^"]+)"\) \+ "([^"]+)"/,
  "baToggleCss",
);
const [, enveloppeCommunes, fondAvec, fondAvant, enveloppeOmbre] = enveloppe;

for (const declaration of enveloppeCommunes.split(";")) {
  if (declaration.startsWith("background-color:") || !declaration.includes(":")) continue;
  porte(".onglets", declaration);
}
porte(".onglets", `background-color:${fondAvant}`);
porte('.onglets[data-vue="avec"]', `background-color:${fondAvec}`);
porte(".onglets", enveloppeOmbre);

// La maquette ne pose ni bordure ni `gap` sur l'enveloppe : ce sont eux qui
// ramenaient sa hauteur de 67 à 54px en comprimant les segments.
for (const absente of ["border:", "gap:", "backdrop-filter:"]) {
  assert.ok(
    !meme(regle(".onglets")).includes(meme(absente)),
    `.onglets reprend « ${absente} », absent de baToggleCss`,
  );
}

/* --------------------------------------------------- la cascade, baTiles */

const [, transition] = releve(
  /;transition:(opacity 260ms[^"]+)"/,
  "la transition des tuiles de baTiles",
);
porte(".carte", `transition:${transition}`);

const [, pasRetrait, pasRetour] = releve(
  /;transition-delay:" \+ \(fade \? i \* (\d+) : i \* (\d+)\)/,
  "le retard par rang de baTiles",
);

const html = renderToStaticMarkup(
  <AvantApresBascule avant={VUE_AVANT} avec={VUE_AVEC} />,
);
const retards = [...html.matchAll(/transition-delay:(\d+)ms/g)].map((m) => Number(m[1]));
assert.deepEqual(
  retards,
  VUE_AVANT.tuiles.map((_, rang) => rang * Number(pasRetour)),
  `au repos, les ${VUE_AVANT.tuiles.length} tuiles doivent s'échelonner de ${pasRetour}ms`,
);
assert.ok(Number(pasRetrait) < Number(pasRetour), "le retrait est plus serré que le retour");

// Au premier rendu les tuiles sont posées, pas retirées : rien n'arrive
// invisible pour qui n'exécute pas le JavaScript.
assert.ok(!/opacity:0(?![.0-9])/.test(html), "une tuile est rendue transparente");
assert.equal(html.split("transition-delay").length - 1, VUE_AVANT.tuiles.length);

/* ----------------------------------- la bascule reste annoncée et nommée */

assert.ok(html.includes('data-vue="avant"'), "l'enveloppe n'annonce plus sa vue");
assert.equal(html.split("aria-pressed").length - 1, 2);
for (const vue of [VUE_AVANT, VUE_AVEC]) {
  assert.equal(
    new Set(vue.tuiles.map((t) => t.cle)).size,
    vue.tuiles.length,
    "deux tuiles d'une même vue portent la même clé",
  );
}

console.log(
  `Bascule avant/après : segments ${meme(communes).match(/padding:[^;]+/)}, ` +
    `enveloppe ${fondAvant} puis ${fondAvec}, cascade de ${pasRetour}ms. ` +
    "Toutes les assertions passent.",
);
