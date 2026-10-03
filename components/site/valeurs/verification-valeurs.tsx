/**
 * Contrôle de l'écran « Nos valeurs », sans navigateur.
 *
 *   bun components/site/valeurs/verification-valeurs.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * CE QU'IL VÉRIFIE, et pourquoi chacun compte :
 *   - les textes portés sont CEUX DE LA MAQUETTE, relue dans le fichier à
 *     chaque exécution (lignes 5531 à 5669) et jamais recopiée de mémoire ;
 *   - les trois écarts assumés à la maquette sont bien là, et seulement eux :
 *     deux tirets cadratins remplacés, un délai de réponse chiffré retiré ;
 *   - un seul h1, et le meta title ne le répète pas ;
 *   - aucun lien inerte, aucune classe Tailwind de couleur, aucun interdit de
 *     copie.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";

import AppelCorrection from "@/components/site/valeurs/AppelCorrection";
import GrilleValeurs from "@/components/site/valeurs/GrilleValeurs";
import HeroValeurs from "@/components/site/valeurs/HeroValeurs";

const DEBUT = 5531;
const FIN = 5669;

/* Le texte visible de l'écran, lu dans la maquette. Les balises partent, les
   entités `&nbsp;` deviennent l'espace insécable réel, et les blancs sont
   écrasés : c'est le seul moyen de comparer une chaîne de JSX à du HTML sans
   comparer de la mise en forme. */
function texteMaquette(): string {
  const lignes = readFileSync(
    new URL("../../../maquette/accueil-rendu.html", import.meta.url),
    "utf8",
  ).split("\n");
  return normalise(
    lignes
      .slice(DEBUT - 1, FIN)
      .join(" ")
      .replace(/<[^>]+>/g, " "),
  );
}

/* L'espace insécable est PRÉSERVÉ : `\s` l'inclut, donc un `\s+` naïf
   l'écraserait en espace ordinaire et le contrôle ne verrait plus la
   différence. C'est précisément ce qu'il doit voir. */
function normalise(valeur: string): string {
  return valeur
    .replace(/&nbsp;/g, " ")
    .replace(/[^\S ]+/g, " ")
    .trim();
}

const maquette = texteMaquette();
const html = [
  renderToStaticMarkup(<HeroValeurs />),
  renderToStaticMarkup(<GrilleValeurs />),
  renderToStaticMarkup(<AppelCorrection />),
].join("");
const texteRendu = normalise(html.replace(/<[^>]+>/g, " "));

// --------------------------------------------- la copie vient de la maquette
/* Chaque fragment est cherché DANS LA MAQUETTE puis DANS LE RENDU. Un fragment
   absent de la maquette fait échouer le contrôle aussi sûrement qu'un fragment
   absent du rendu : c'est ce qui empêche d'écrire une valeur de mémoire. */
const PORTES = [
  "Cinq règles, et la preuve qui va avec.",
  "Une valeur qu’on ne peut pas vérifier est une affiche de couloir.",
  "Le slogan, en clair",
  "Mesurée chez vous : taux de disponibilité des lignes, pas nombre d’heures facturées.",
  "On dit non",
  "Vous validez chaque technicien",
  "La sécurité passe avant la production",
  "On publie nos procédures",
  "On forme plutôt qu’on remplace",
  "Le droit de refus est écrit au contrat, pas sous-entendu.",
  "2 accidents avec arrêt, 3 sans arrêt et 1 accident de trajet en 2025, sur plus de 90 000 heures d’intervention.",
  "18 heures de formation par collaborateur et par an",
  "Notre taux de turnover est communiqué sur demande, chiffre brut.",
  "Publier engage : vous pouvez nous demander des comptes sur chacune.",
  "Une valeur qui ne tient pas ?",
  "Dites-le nous. On corrige ou on assume.",
  "Nous mettre à l’épreuve",
  "Nous écrire",
  "Nos engagements RSE",
];
for (const fragment of PORTES) {
  assert.ok(
    maquette.includes(fragment),
    `fragment absent de la maquette, lignes ${DEBUT} à ${FIN} : ${fragment}`,
  );
  assert.ok(texteRendu.includes(fragment), `fragment absent du rendu : ${fragment}`);
}

// ---------------------------------------- les cinq valeurs, et leurs preuves
assert.equal(
  html.split('class="mg-val"').length - 1,
  5,
  "l'écran doit porter cinq cartes de valeur, pas une de plus ni de moins",
);
for (const numero of ["01", "02", "03", "04", "05"]) {
  assert.ok(texteRendu.includes(numero), `numéro de valeur manquant : ${numero}`);
}

// ------------------------------------------ les trois écarts à la maquette
/* Le tiret cadratin est dans la maquette, il ne doit pas être dans le rendu.
   Si la maquette était corrigée à la source, cette assertion le dirait, et
   l'écart deviendrait inutile. */
assert.ok(maquette.includes("—"), "la maquette ne porte plus de tiret cadratin");
assert.ok(
  !/[—–]/.test(texteRendu),
  "un tiret cadratin ou demi-cadratin est rendu dans la page",
);
assert.ok(
  maquette.includes("sous 48 h"),
  "la maquette ne porte plus le délai de réponse chiffré",
);
assert.ok(
  !/sous 48/.test(texteRendu),
  "un délai de réponse chiffré est rendu : seul le rappel dans l'heure est autorisé",
);
assert.ok(
  texteRendu.includes("Nous répondons avec ce qui s’est passé, et ce qui change."),
  "la phrase de remplacement du délai chiffré a changé sans passer par ici",
);
assert.ok(
  texteRendu.includes("demander de prouver : avant de signer, pas après."),
  "l'introduction a perdu le deux-points qui remplace le tiret cadratin",
);
assert.ok(
  texteRendu.includes("que nous ne savons pas tenir : technologie inconnue"),
  "la valeur 01 a perdu le deux-points qui remplace le tiret cadratin",
);

// ------------------------------------------------------------- un seul titre
{
  const { default: page } = await import("@/app/valeurs/page");
  const { metadata } = await import("@/app/valeurs/page");
  const complet = renderToStaticMarkup(page());
  assert.equal(
    complet.split("<h1").length - 1,
    1,
    "la page doit porter exactement un h1",
  );
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(complet)?.[1] ?? "";
  const titre = String(metadata.title);
  assert.ok(titre.length > 0, "la page ne déclare pas de meta title");
  assert.notEqual(
    normalise(h1.replace(/<[^>]+>/g, "")),
    normalise(titre),
    "le meta title reprend le h1 mot pour mot",
  );
  assert.ok(
    String(metadata.alternates?.canonical).endsWith("/valeurs/"),
    "le canonique ne pointe pas sur /valeurs/",
  );
}

// ------------------------------------------------------------ liens inertes
assert.ok(
  !html.includes('href="#"'),
  'un lien de la page est rendu inerte (href="#")',
);
/* Les deux appels à l'action visent l'ancre du formulaire de la page. Si
   `ANCRE_FORMULAIRE` changeait sans que le formulaire suive, le bouton
   principal de la page ne mènerait nulle part. */
assert.equal(
  html.split('href="#formulaire"').length - 1,
  2,
  "les deux appels à l'action doivent viser l'ancre du formulaire",
);
{
  const { default: FormulaireBasDePage } = await import(
    "@/components/site/accueil/FormulaireBasDePage"
  );
  const { ANCRE_FORMULAIRE } = await import("@/components/site/blocs/habillage");
  const formulaire = renderToStaticMarkup(<FormulaireBasDePage formulaire="valeurs" />);
  assert.ok(
    formulaire.includes(`id="${ANCRE_FORMULAIRE.replace("#", "")}"`),
    `ANCRE_FORMULAIRE vaut ${ANCRE_FORMULAIRE}, aucun id de ce nom dans le formulaire`,
  );
}
/* La maquette pose un second bouton vers la page des engagements RSE, qui
   répond 404. Le libellé est rendu en texte : aucun lien ne doit le porter. */
assert.ok(
  !/href="[^"]*rse[^"]*"/i.test(html),
  "un lien vers la page RSE est posé alors qu'elle n'existe pas",
);

// ------------------------------------------------- charte, pas d'échafaudage
assert.ok(
  !/class="[^"]*\b(?:text|bg|border)-(?:zinc|gray|slate|neutral|white|black)/.test(html),
  "une classe Tailwind de couleur est rendue : la charte vit dans les jetons",
);
assert.ok(!/\bdark:/.test(html), "une variante dark: est rendue, le site n'a pas de mode sombre");

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "levier",
  "clé en main",
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "Découvrez",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "+200",
  "200 clients",
  "5 agences",
  "cinq agences",
]) {
  assert.ok(!texteRendu.includes(interdit), `copie interdite : ${interdit}`);
}

// ------------------------------------------------------- rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc est rendu avec une opacité nulle",
);

console.log("Nos valeurs : toutes les assertions passent.");
