/**
 * Contrôle des sections d'ouverture de la page d'accueil, sans navigateur.
 *
 *   bun components/site/accueil/verification-ouverture.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Trois
 * couplages invisibles à la lecture sont vérifiés ici : ils se relâchent sans
 * bruit et le rendu part en production abîmé.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import CertificationsRse from "@/components/site/accueil/CertificationsRse";
import GrilleOffres from "@/components/site/accueil/GrilleOffres";
import Hero from "@/components/site/accueil/Hero";
import MarqueeClients from "@/components/site/accueil/MarqueeClients";
import ProblematiqueClient from "@/components/site/accueil/ProblematiqueClient";

const html = [
  renderToStaticMarkup(<Hero />),
  renderToStaticMarkup(<GrilleOffres />),
  renderToStaticMarkup(<MarqueeClients />),
  renderToStaticMarkup(<CertificationsRse />),
  renderToStaticMarkup(<ProblematiqueClient />),
].join("");

// ------------------------------------------------------- marges mobiles
// `app/globals.css` rattrape les marges sous 760px par des sélecteurs
// d'attribut : `section[style*="max-width:1200px"]` et
// `section > div[style*="max-width:1200px"]`. Si React sérialisait la largeur
// autrement, ou si un jour `maxWidth` passait à une valeur relative, les
// sections perdraient leurs 20px de marge sur téléphone, sans rien casser
// d'autre. Cinq sections, cinq conteneurs porteurs.
assert.equal(
  html.split("max-width:1200px").length - 1,
  5,
  "un conteneur de section a perdu sa largeur littérale de 1200px",
);

// ------------------------------------------------ boucle du bandeau de logos
// `mgMarquee` translate la piste de -50 % : il faut exactement deux
// exemplaires de la liste, enfants de même niveau, sinon la boucle saute.
assert.equal(html.split('class="mg-logo"').length - 1, 38 * 2);

// ----------------------------------------------------- rien d'invisible
// Les blocs qui portaient `data-reveal` doivent arriver visibles : l'apparition
// est en CSS sous `@supports`, jamais une opacité nulle posée en ligne.
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc est rendu avec une opacité nulle",
);

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "agences en France",
  "levier",
  "clé en main",
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "—",
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}

console.log("Ouverture de l'accueil : toutes les assertions passent.");

// ------------------------------------------------------------ liens inertes
// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
// Cinq cartes d'offre sont parties en production ainsi, cliquables et sans
// destination. Cette assertion vaut mieux que la discipline.
assert.ok(
  !html.includes('href="#"'),
  "un lien de la page d'accueil est rendu inerte (href=\"#\")",
);

// L'ancre du bouton principal des pages de vente doit exister dans le rendu du
// formulaire : la constante et l'id ont divergé une fois, sur 126 pages.
{
  const { default: FormulaireBasDePage } = await import(
    "@/components/site/accueil/FormulaireBasDePage"
  );
  const { ANCRE_FORMULAIRE } = await import("@/components/site/blocs/habillage");
  const formulaire = renderToStaticMarkup(<FormulaireBasDePage />);
  assert.ok(
    formulaire.includes(`id="${ANCRE_FORMULAIRE.replace("#", "")}"`),
    `ANCRE_FORMULAIRE vaut ${ANCRE_FORMULAIRE}, aucun id de ce nom dans le formulaire`,
  );
}

console.log("Ouverture : aucun lien inerte, ancre du formulaire résolue.");
