/**
 * Contrôle des deux gabarits de contenu long, sans navigateur.
 *
 *   bun components/site/verification-gabarits.tsx
 *
 * Le gabarit éditorial va servir 59 pages, celui d'article en servira autant que
 * le blog en produira. Personne ne les a vus rendre avant ce fichier : ils
 * arrivent par un `jsonb`, et le premier contenu réel sera en production.
 *
 * Ce qui est vérifié ici, c'est ce qui casse en silence : un champ optionnel
 * absent, un sommaire désynchronisé de son corps, deux H1 sur une page, une
 * ancre qui ne pointe sur rien.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import PageEditoriale from "./editorial/PageEditoriale";
import type { ContenuEditorial } from "@/types/editorial";
import Article from "./article/Article";
import type { ContenuArticle } from "@/types/article";

// ------------------------------------------------------------ gabarit éditorial

const EDITORIAL: ContenuEditorial = {
  gabarit: "editorial",
  chapeau: "Un chapô avec un [lien interne](/offres/) et du **gras**.",
  blocs: [
    { type: "titre", niveau: 2, texte: "Première partie", id: "premiere-partie" },
    { type: "paragraphe", accroche: "Un gras d'attaque", texte: "puis la suite." },
    { type: "liste", items: [{ texte: "une puce" }, { accroche: "Deux", texte: "avec accroche" }] },
    { type: "liste", ordonnee: true, items: [{ texte: "première étape" }] },
    { type: "tableau", entetes: ["Colonne A", "Colonne B"], lignes: [["a1", "b1"], ["a2", "b2"]] },
    { type: "citation", texte: "Un encadré." },
    { type: "titre", niveau: 3, texte: "Un sous-titre", id: "un-sous-titre" },
    { type: "titre", niveau: 2, texte: "Deuxième partie", id: "deuxieme-partie" },
    { type: "paragraphe", texte: "Sans accroche." },
    { type: "titre", niveau: 2, texte: "Troisième partie", id: "troisieme-partie" },
  ],
};

const rendu = renderToStaticMarkup(
  <PageEditoriale titre="Le titre de la page" contenu={EDITORIAL} />,
);

// Un seul H1, et c'est celui de la page. Le corpus écrit un « # » en tête de
// fichier : le parseur doit l'avoir écarté, sans quoi la page en aurait deux.
assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);

// Chaque entrée de sommaire vise une ancre qui existe dans le corps.
const ancresVisees = [...rendu.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const ancresPosees = new Set([...rendu.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
assert.ok(ancresVisees.length >= 3, "trois titres de niveau 2 doivent produire un sommaire");
for (const a of ancresVisees) {
  assert.ok(ancresPosees.has(a), `le sommaire vise l'ancre « ${a} », absente du corps`);
}

// Le sommaire ne liste que les titres de niveau 2 : un sommaire qui descend au
// niveau 3 devient une table des matières illisible.
assert.ok(!ancresVisees.includes("un-sous-titre"), "le sommaire ne descend pas au niveau 3");

assert.match(rendu, /<table/, "le tableau doit être une vraie table");
assert.match(rendu, /scope="col"/, "les en-têtes de colonne doivent être déclarés");
assert.match(rendu, /<ol[\s>]/, "une liste ordonnée doit être un ol");
assert.match(rendu, /href="\/offres\/?"/, "le lien du chapô doit être rendu");

// Sous trois titres, pas de sommaire : il n'aiderait personne.
const court = renderToStaticMarkup(
  <PageEditoriale
    titre="Page courte"
    contenu={{ gabarit: "editorial", blocs: [{ type: "paragraphe", texte: "Seul." }] }}
  />,
);
assert.doesNotMatch(court, /Sur cette page/, "pas de sommaire sous trois titres");

// ------------------------------------------------------------- gabarit article

const ARTICLE: ContenuArticle = {
  chapeau: "Le chapô.",
  categorie: "Guide",
  minutesLecture: 8,
  sections: [
    { id: "a1", titre: "Un", blocs: [{ type: "paragraphe", texte: "Du texte." }] },
    { id: "a2", titre: "Deux", blocs: [{ type: "encadre", texte: "À retenir." }] },
    { id: "a3", titre: "Trois", blocs: [{ type: "liste", items: ["Une question ?"] }] },
  ],
  cta: { titre: "Un titre", texte: "Un texte.", bouton: "Un bouton" },
};

const art = renderToStaticMarkup(
  <Article titre="Le titre de l'article" contenu={ARTICLE} publieLe="2026-03-31T00:00:00Z" />,
);

assert.equal((art.match(/<h1[\s>]/g) ?? []).length, 1, "l'article doit porter un seul h1");
// Les sections sont numérotées dans le sommaire ET dans le corps : les deux
// numérotations doivent concorder, sinon le lecteur perd le fil.
assert.match(art, /1\. Un/, "la première section doit être numérotée");
assert.match(art, /3\. Trois/, "la dernière section doit être numérotée");
assert.match(art, /31 mars 2026/, "la date de publication doit être formatée en français");
assert.match(art, /8 min de lecture/);
// Un article sans contexte ne doit pas rendre une ligne de séparateurs vides.
const nu = renderToStaticMarkup(
  <Article titre="Nu" contenu={{ chapeau: "Seul.", sections: [] }} />,
);
assert.doesNotMatch(nu, /·\s*·/, "aucun séparateur orphelin quand le contexte est vide");

console.log("Gabarits éditorial et article : un seul h1, sommaire cohérent, ancres résolues.");
