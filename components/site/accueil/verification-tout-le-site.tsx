/**
 * Contrôle du répertoire « Tout le site » de l'accueil mobile, sans navigateur.
 *
 *   bun components/site/accueil/verification-tout-le-site.tsx
 *
 * Le répertoire est CALCULÉ (`tout-le-site.ts`, porté de la V3) : une page
 * ajoutée à l'index ou une redirection nouvelle le change sans qu'on y touche.
 * Ce contrôle tient ce qui ne doit pas bouger : les huit familles et leurs
 * libellés, aucun lien vers une source de redirection, aucun nombre de pages
 * affiché, « Nous rejoindre » et jamais « Carrière ».
 */
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import ToutLeSite from "@/components/site/accueil/ToutLeSite";
import { familles } from "@/components/site/accueil/tout-le-site";
import { cheminNormalise, REDIRECTIONS_CODE } from "@/lib/redirections";

const liste = familles();

assert.deepEqual(
  liste.map((f) => f.libelle),
  [
    "Nos offres",
    "Expertises métiers",
    "Expertises sectorielles",
    "Nos implantations",
    "Nos réalisations",
    "Ressources",
    "Nous rejoindre",
    "Migen",
  ],
  "les familles du répertoire ont changé",
);

const liens = liste.flatMap((f) => f.liens);
for (const lien of liens) {
  assert.ok(
    !REDIRECTIONS_CODE.has(cheminNormalise(lien.href)),
    `« ${lien.href} » est la source d'une redirection : son lien répondrait 301`,
  );
  assert.ok(lien.libelle.trim().length > 0, `« ${lien.href} » n'a pas de libellé`);
}
assert.equal(new Set(liens.map((l) => `${l.href}`)).size, liens.length, "un lien figure deux fois");

const offres = liste[0]!.liens;
assert.deepEqual(offres[0], { libelle: "Résidence", href: "/offres/residence/" });
assert.deepEqual(offres.at(-1), { libelle: "Toutes les offres", href: "/offres/" });
assert.ok(
  liste.at(-1)!.liens.some((l) => l.href === "/nous-connaitre/"),
  "« Migen » a perdu Nous connaître",
);

const html = renderToStaticMarkup(<ToutLeSite />);
const resumes = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) =>
  m[1]!.replace(/<[^>]+>/g, "").replace(/›/g, "").trim(),
);
assert.equal(resumes.length, 8, "il faut une rangée repliée par famille");
for (const resume of resumes) {
  assert.ok(!/\d/.test(resume), `« ${resume} » affiche un nombre de pages`);
}
assert.ok(!/Carrière/.test(html), "« Carrière » est affiché : le libellé du site est « Nous rejoindre »");
assert.ok(html.includes("data-mobile-seulement"), "le répertoire paraîtrait sur bureau");

console.log(
  `Tout le site : ${liste.length} familles, ${liens.length} liens, aucun vers une redirection, ` +
    "aucun nombre de pages. Toutes les assertions passent.",
);
