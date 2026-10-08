/**
 * Contrôle du rail « Nos hubs », sans navigateur.
 *
 *   bun components/site/accueil/verification-hubs.tsx
 *
 * Les valeurs attendues sont LUES dans la maquette autonome
 * (`maquette/site-final-autonome.html`), la référence validée, pas écrites
 * ici : le rail porte vingt cartes pour dix hubs, la liste y est écrite deux
 * fois. Sans ce second exemplaire, le moteur de `components/site/Moteurs.tsx`
 * revient à zéro d'un coup en fin de course et la coupure se voit.
 * (Avant le 08/10, ce contrôle lisait `accueil-rendu.html` du 02/10, qui ne
 * comptait que six hubs.)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import HubsAccueil from "@/components/site/accueil/HubsAccueil";

// ------------------------------------------------- ce que dit la maquette
// Le gabarit vit dans une chaîne JSON de la page autonome : guillemets
// échappés et « / » écrit \u002F.
const maquette = readFileSync(
  new URL("../../../maquette/site-final-autonome.html", import.meta.url),
  "utf8",
)
  .replaceAll('\\"', '"')
  .replaceAll("\\u002F", "/");

/** Le rail des hubs : du `mg-autorail` qui suit « Des hubs partout en France »
    jusqu'à la fin de sa section. */
const railMaquette = (() => {
  const titre = maquette.indexOf("Des hubs partout en France");
  assert.notEqual(titre, -1, "section des hubs introuvable dans la maquette");
  const debut = maquette.indexOf('class="mg-autorail"', titre);
  const fin = maquette.indexOf("</section>", debut);
  assert.ok(debut !== -1 && fin !== -1, "rail des hubs introuvable");
  return maquette.slice(debut, fin);
})();

const CARTES_MAQUETTE = railMaquette.match(/width:300px;height:400px/g)!.length;
const CHEMINS_MAQUETTE = new Set(
  [...railMaquette.matchAll(/href="(\/implantations\/[^"]+)"/g)].map((m) => m[1]),
);

assert.equal(CARTES_MAQUETTE, 20, "la maquette n'a plus vingt cartes");
assert.equal(CHEMINS_MAQUETTE.size, 10, "la maquette n'a plus dix hubs distincts");

// ------------------------------------------------------- ce que rend le site
const html = renderToStaticMarkup(<HubsAccueil />);
const cartes = [...html.matchAll(/<a\b[^>]*href="(\/implantations\/[^"]+)"[^>]*>/g)];

// La liste doit être écrite autant de fois que dans la maquette, sinon le rail
// est plus court et la boucle du moteur saute.
assert.equal(
  cartes.length,
  CARTES_MAQUETTE,
  `le rail rend ${cartes.length} cartes, la maquette en a ${CARTES_MAQUETTE}`,
);
assert.equal(
  new Set(cartes.map((c) => c[1])).size,
  CHEMINS_MAQUETTE.size,
  "les hubs distincts du rail ne correspondent plus à la maquette",
);

// ------------------------------------------ le doublon reste hors du parcours
// Exactement la moitié des cartes : la seconde passe, décorative.
const masquees = cartes.filter((c) => c[0].includes('aria-hidden="true"'));
assert.equal(
  masquees.length,
  CARTES_MAQUETTE / 2,
  `${masquees.length} cartes masquées, il en faut ${CARTES_MAQUETTE / 2}`,
);
for (const carte of masquees) {
  assert.ok(
    carte[0].includes('tabindex="-1"'),
    "une carte masquée reste atteignable au clavier",
  );
}
for (const carte of cartes.filter((c) => !c[0].includes("aria-hidden"))) {
  assert.ok(
    !carte[0].includes('tabindex="-1"'),
    "une carte lisible a été sortie du parcours de tabulation",
  );
}

// Le moteur lit `.mg-autorail` : la classe est le couplage, elle doit rester.
assert.ok(html.includes('class="mg-autorail"'), "le rail a perdu mg-autorail");

console.log(
  `Hubs : ${cartes.length} cartes (${CHEMINS_MAQUETTE.size} hubs écrits deux fois), ` +
    `${masquees.length} décoratives hors parcours. Toutes les assertions passent.`,
);
