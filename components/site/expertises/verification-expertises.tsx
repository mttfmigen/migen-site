/**
 * Contrôle du gabarit EXPERTISES, sans navigateur.
 *
 *   bun components/site/expertises/verification-expertises.tsx
 *
 * Ce qui est vérifié, c'est ce qui casse en silence : un seul H1, les barres
 * qui portent bien les attributs que `Moteurs.tsx` attend, un lien absent qui
 * ne produit pas de cible morte, et surtout les interdits de copie, qui ne se
 * voient pas à la relecture d'un diff de 500 lignes.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import { CONTENU_EXPERTISES } from "./expertises-donnees";
import PageExpertises from "./PageExpertises";
import { estExpertises } from "@/types/expertises";

const rendu = renderToStaticMarkup(
  <PageExpertises
    titre="Du préventif aux travaux neufs, sur neuf technologies."
    contenu={CONTENU_EXPERTISES}
  />,
);

// ------------------------------------------------------------------- structure

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);
assert.equal(
  (rendu.match(/<h2[\s>]/g) ?? []).length,
  7,
  "six sections nommées plus le formulaire donnent sept h2",
);

// Le bouton du héros vise l'ancre que le formulaire pose réellement.
assert.match(rendu, /href="#formulaire"/, "le bouton principal doit viser le formulaire");
assert.match(rendu, /id="formulaire"/, "l'ancre du formulaire doit exister");
assert.match(rendu, /href="#types"/, "le bouton secondaire doit viser la section types");
assert.match(rendu, /id="types"/, "l'ancre de la section types doit exister");

// Aucune cible morte : la maquette écrivait `href="#"` partout.
assert.doesNotMatch(rendu, /href="#"/, "aucun lien ne doit mener à « # »");

// ------------------------------------------------------------------ animations
// Les attributs, pas une animation CSS de remplacement : c'est `Moteurs.tsx`
// qui les lit. Un `data-bar` sans son `data-bar-i` casse l'escalier.
const barres = [...rendu.matchAll(/data-bar="(\d+)"/g)];
assert.equal(barres.length, 8, "les deux jeux de quatre barres doivent être rendus");
assert.equal(
  (rendu.match(/data-bar-i="/g) ?? []).length,
  8,
  "chaque barre doit porter son rang dans l'escalier",
);
assert.ok(
  (rendu.match(/data-reveal=""/g) ?? []).length >= 6,
  "chaque section longue doit être révélée au défilement",
);

// ---------------------------------------------------------------- interdits
// Les trois corrections imposées par le contrat de portage. Si quelqu'un
// recopie la maquette à l'identique un jour, ce test tombe.
for (const interdit of [
  "mise à disposition",
  "sous 24 h",
  "sans engagement",
  "régie",
  "intérim",
  "clé en main",
  "sur mesure",
]) {
  assert.ok(
    !rendu.includes(interdit),
    `« ${interdit} » est un interdit de copie, il ne doit pas sortir`,
  );
}
// Tiret cadratin : interdit dans toute copie visible.
assert.doesNotMatch(rendu, /—/, "aucun tiret cadratin dans le texte rendu");

// --------------------------------------------------------------- données vides
// Une page fille qui ne fournit qu'un chapô ne doit rien rendre d'autre : pas
// de section vide, pas de carte sans contenu, pas de lien vers nulle part.
const nu = renderToStaticMarkup(
  <PageExpertises
    titre="Maintenance hydraulique"
    contenu={{ gabarit: "expertises", chapeau: "Seul." }}
  />,
);
assert.equal((nu.match(/<h1[\s>]/g) ?? []).length, 1);
assert.doesNotMatch(nu, /data-bar=/, "aucune barre sans répartition fournie");
assert.doesNotMatch(nu, /id="types"/, "aucune section types sans cartes");
assert.doesNotMatch(nu, /<img/, "aucune image sans visuel fourni");

// Un domaine sans chemin se rend sans son lien, jamais avec une cible inventée.
const sansLien = renderToStaticMarkup(
  <PageExpertises
    titre="Expertises"
    contenu={{
      gabarit: "expertises",
      domaines: {
        entete: { surtitre: "Domaines", titre: "Ce que nous faisons" },
        cartes: [{ titre: "Mécanique", etiquette: "Alignement", texte: "Roulements." }],
      },
    }}
  />,
);
assert.match(sansLien, /Mécanique/, "la carte doit se rendre sans son lien");
assert.doesNotMatch(
  sansLien,
  /Ce qu’on y répare/,
  "sans chemin connu, aucun lien ne doit être rendu",
);

// ------------------------------------------------------------------- la garde
assert.ok(estExpertises(CONTENU_EXPERTISES));
assert.ok(!estExpertises({ gabarit: "editorial", blocs: [] }));
assert.ok(!estExpertises({ sections: [] }));
assert.ok(!estExpertises(null));

console.log(
  "Gabarit expertises : un seul h1, huit barres armées, ancres résolues, interdits de copie absents.",
);
