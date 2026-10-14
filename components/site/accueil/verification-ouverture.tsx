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

/* CE QUE LA PORTE NE VOYAIT PAS. Le 12/10, « 4 agences · +120 techniciens » a
   été retiré à côté de la pastille « Partout en France », sur demande de
   Mehdi : « retire le ». La porte est passée au vert SANS RIEN REMARQUER, parce
   qu'elle n'avait aucune assertion sur cette chaîne. Une porte aveugle à une
   décision ne la protège pas : la voici contrainte. */
for (const interdit of [
  "4 agences · +120 techniciens",
  "+120 techniciens",
]) {
  assert.ok(
    !html.includes(interdit),
    `« ${interdit} » est revenu dans l'ouverture de l'accueil : Mehdi l'a fait retirer le 12/10`,
  );
}
/* ET L'INVERSE, sans quoi l'assertion ci-dessus passerait aussi le jour où
   toute la pastille disparaîtrait par accident. */
assert.ok(
  html.includes("Partout en France"),
  "la pastille « Partout en France » a disparu de l'ouverture",
);

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

// ------------------------------------- la cadence de conversion mobile, 14/10
// 1. L'ANCRE DES BANDEAUX. `app/page.tsx` pose `rappelFinal={false}` : la
//    maquette finit sur un mini-formulaire, l'accueil sur son formulaire
//    complet, et le rappel n'est donc pas dessiné. Mais les bandeaux « Une
//    question sur votre site ? » visent `#etre-rappele`, que seul ce rappel
//    portait. C'est l'enveloppe du formulaire de bas de page qui la reprend :
//    sans elle, quatre boutons « Être rappelé » ne mènent nulle part, et rien
//    d'autre ne le verrait.
// 2. LA BASCULE DU FORMULAIRE DU HÉROS PASSE AVANT SON EN-TÊTE, et l'en-tête
//    reste collé au formulaire : c'est ce qui garde le texte du `<main>`
//    identique, mot pour mot, à celui d'avant le repli (voir `Hero.tsx`).
{
  const { readFileSync } = await import("node:fs");
  const { ANCRE_RAPPEL, ID_RAPPEL_FINAL } = await import(
    "@/components/site/mobile/conversion-donnees"
  );
  const page = readFileSync(new URL("../../../app/page.tsx", import.meta.url), "utf8");
  assert.equal(ANCRE_RAPPEL, `#${ID_RAPPEL_FINAL}`, "les bandeaux et le rappel final ne visent plus la même ancre");
  if (page.includes("rappelFinal={false}")) {
    assert.ok(
      page.includes("id={ID_RAPPEL_FINAL}"),
      `l'accueil ne pose pas le rappel final et plus rien n'y porte ${ANCRE_RAPPEL} : les bandeaux « Être rappelé » mènent nulle part`,
    );
  }

  const heros = renderToStaticMarkup(<Hero />);
  const bascule = heros.indexOf("<summary");
  const enTete = heros.indexOf(">Décrire mon besoin<", heros.indexOf("</summary>"));
  const champs = heros.indexOf("<form");
  assert.ok(
    bascule >= 0 && bascule < enTete && enTete < champs,
    "la bascule du formulaire du héros doit précéder son en-tête, et l'en-tête précéder le formulaire",
  );
}

console.log("Cadence mobile : l'ancre #etre-rappele est portée, la bascule du héros est à sa place.");
