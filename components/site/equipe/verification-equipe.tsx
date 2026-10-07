/**
 * Contrôle de l'écran « Équipe / Direction », sans navigateur ni base.
 *
 *   bun components/site/equipe/verification-equipe.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, lignes 5845 à 6030. Rien n'est écrit de mémoire : une note de
 * lecture peut se tromper et personne ne peut la rejouer. Les deux seules
 * valeurs écrites en dur sont les corrections imposées par les interdits du
 * contrat, et elles sont vérifiées DANS LES DEUX SENS, l'interdit absent et la
 * correction présente.
 *
 * La page elle-même n'est pas montée : `generateMetadata` appelle Supabase. Son
 * H1 et son meta title sont comparés par leurs constantes, qui sont celles que
 * la page rend.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";

import AppelInterlocuteur from "@/components/site/equipe/AppelInterlocuteur";
import EngagementsEquipe from "@/components/site/equipe/EngagementsEquipe";
import GroupeEquipe from "@/components/site/equipe/GroupeEquipe";
import ImplantationsEquipe from "@/components/site/equipe/ImplantationsEquipe";
import NotreHistoire from "@/components/site/equipe/NotreHistoire";
import QuestionsEquipe from "@/components/site/equipe/QuestionsEquipe";
import QuiNousSommes from "@/components/site/equipe/QuiNousSommes";
import QuiVousRepond from "@/components/site/equipe/QuiVousRepond";
import SelectionEquipe from "@/components/site/equipe/SelectionEquipe";
import {
  DIRECTION,
  H1,
  SUPPORT,
  TITRE_PAR_DEFAUT,
} from "@/components/site/equipe/equipe-donnees";

// ------------------------------------------------------- la source de vérité
const MAQUETTE = readFileSync(
  new URL("../../../maquette/accueil-rendu.html", import.meta.url),
  "utf8",
)
  .split("\n")
  .slice(5844, 6030)
  .join("\n");

assert.ok(
  MAQUETTE.includes('data-screen-label="Équipe / Direction"'),
  "les lignes 5845 à 6030 de la maquette ne sont plus l'écran équipe : le portage doit être relu avant ce contrôle",
);

/** La tranche avec ses entités résolues : `&amp;` y redevient `&`. */
const MAQUETTE_LISIBLE = MAQUETTE.replace(/&amp;/g, "&").replace(
  /&nbsp;/g,
  " ",
);

/** Le texte visible de la tranche, balises et styles retirés. */
const TEXTE_MAQUETTE = MAQUETTE_LISIBLE.replace(/<[^>]*>/g, " ").replace(
  /\s+/g,
  " ",
);

// ------------------------------------------------------------- le rendu porté
const html = [
  renderToStaticMarkup(<GroupeEquipe groupe={DIRECTION} paddingHaut={44} />),
  renderToStaticMarkup(<GroupeEquipe groupe={SUPPORT} paddingHaut={34} />),
  renderToStaticMarkup(<QuiNousSommes />),
  renderToStaticMarkup(<NotreHistoire />),
  renderToStaticMarkup(<SelectionEquipe />),
  renderToStaticMarkup(<ImplantationsEquipe />),
  renderToStaticMarkup(<EngagementsEquipe />),
  renderToStaticMarkup(<QuestionsEquipe />),
  renderToStaticMarkup(<AppelInterlocuteur />),
  renderToStaticMarkup(<QuiVousRepond />),
].join("");

const TEXTE = html
  .replace(/<[^>]*>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ");

// ------------------------------------------------------ un seul h1, pas deux
// Les sections n'ont pas le droit d'en poser un : le h1 de la page est dans
// `app/equipe/page.tsx`, et un second ferait deux titres de niveau 1.
assert.equal(
  html.match(/<h1[\s>]/g)?.length ?? 0,
  0,
  "une section de l'écran équipe pose un h1 : il n'y en a qu'un, dans la page",
);

// ------------------------------------------------- titre de recherche ≠ h1
assert.notEqual(
  TITRE_PAR_DEFAUT,
  H1,
  "le meta title répète le H1 : il se lit dans une page de résultats, pas dans la page",
);
assert.ok(
  TEXTE_MAQUETTE.includes(H1),
  `le H1 porté n'est pas celui de la maquette : ${H1}`,
);

// ------------------------------------------------------------ liens inertes
// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
assert.ok(
  !html.includes('href="#"'),
  'un lien de l\'écran équipe est rendu inerte (href="#")',
);

// --------------------------------------- aucune classe Tailwind de couleur
// La charte vit dans les jetons de `app/globals.css`. Une palette Tailwind à
// côté d'eux, c'est deux chartes dans le même écran.
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?\d*\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : ${classe[1]}`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante dark: dans le rendu, le site n'a pas de mode sombre : ${classe[1]}`,
  );
}

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "+200",
  "200 clients",
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
  "cinq agences",
  "5 agences",
  "sous 24",
  "sous 48",
  "—",
  "–",
]) {
  assert.ok(!TEXTE.includes(interdit), `copie interdite : ${interdit}`);
}

// Les deux corrections imposées par le contrat, vérifiées dans le bon sens :
// la maquette affichait bien le chiffre interdit, et le rendu porte le compte
// tenu. Si la maquette change, l'assertion le dit au lieu de dormir.
assert.ok(
  MAQUETTE.includes("+200"),
  "la maquette ne porte plus « +200 » : la correction de chiffre n'a plus d'objet, relire",
);
assert.ok(
  TEXTE.includes("plus de 80 réguliers"),
  "le compte de clients corrigé a disparu : « plus de 120 clients, dont plus de 80 réguliers »",
);

// -------------------------------- rien d'invisible, le CSS fait l'apparition
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc de l'écran équipe est rendu avec une opacité nulle",
);

// ------------------------------------------- marges mobiles des conteneurs
// `app/globals.css` rattrape la gouttière sous 760px par un sélecteur
// d'attribut : `[style*="max-width:1200px"]`. Une largeur sérialisée autrement
// coûte 20px de marge sur téléphone, sans rien casser d'autre. Neuf sections
// portées ici, neuf conteneurs.
assert.equal(
  html.split("max-width:1200px").length - 1,
  10,
  "un conteneur de section a perdu sa largeur littérale de 1200px",
);

// ---------------------------------------- les personnes, nom par fonction
// Une personne mal titrée sur un site public est l'erreur qui se voit. Chaque
// couple est donc relu DANS la maquette, pas dans une note.
for (const personne of [...DIRECTION.personnes, ...SUPPORT.personnes]) {
  assert.ok(
    MAQUETTE_LISIBLE.includes(
      `alt="${personne.nom}, ${personne.fonction} chez migen`,
    ),
    `« ${personne.nom}, ${personne.fonction} » ne figure pas ainsi dans la maquette`,
  );
  assert.ok(
    TEXTE.includes(personne.nom) && TEXTE.includes(personne.fonction),
    `« ${personne.nom} » ou sa fonction manque dans le rendu`,
  );
}

// Aucun portrait n'existe dans `public/` : le rendu ne doit poser AUCUNE image
// de personne. Un visage emprunté sous le nom d'un dirigeant est pire qu'un
// cadre vide.
assert.ok(
  !/<img[^>]*chez migen/.test(html),
  "une photo de personne est rendue alors qu'aucun portrait n'existe dans public/",
);

// Et tant qu'il n'y a pas de photo, le cadre reste au jeton de remplacement :
// `--acc` est la teinte de chargement DERRIÈRE une photo, pas un carré orange
// plein à la place d'un visage.
assert.ok(
  html.includes("background:var(--ph)"),
  "les cadres de personnes sans photo ne portent pas le jeton de remplacement --ph",
);

// ---------------------------------- le texte des sections, relu dans la source
// Les phrases qui portent un engagement, un chiffre ou un nom de ville. Chacune
// est cherchée dans la maquette ET dans le rendu : le contrôle échoue autant si
// le portage dérive que si la maquette bouge sous lui.
const PHRASES = [
  "Quatre agences, dix hubs de techniciens.",
  "Siège · Écully",
  "Émirats arabes unis",
  "Une trajectoire courte et dense.",
  "La qualité se décide au recrutement.",
  "des candidats sont retenus",
  "Rappel dans l’heure",
  "Astreinte en option",
  "Transparence complète",
  "Un interlocuteur, pas un standard.",
  "De votre appel au technicien, trois personnes. Pas plus.",
  "Qui est mon interlocuteur au quotidien ?",
  "04 78 33 72 05",
  "Une entreprise créée pour garder vos machines en marche.",
];
for (const phrase of PHRASES) {
  assert.ok(
    TEXTE_MAQUETTE.includes(phrase),
    `« ${phrase} » n'est plus dans la maquette : le portage doit être relu`,
  );
  assert.ok(TEXTE.includes(phrase), `« ${phrase} » manque dans le rendu`);
}

// Les dix hubs et les quatre agences, comptés et non supposés.
for (const ville of [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
  "Montréal",
  "Dubaï",
  "Madrid",
]) {
  assert.ok(
    TEXTE_MAQUETTE.includes(ville) && TEXTE.includes(ville),
    `la ville « ${ville} » manque dans la maquette ou dans le rendu`,
  );
}

// Les six questions fréquentes, dans leur ordre.
{
  const questions = [
    ...MAQUETTE.matchAll(/<summary[^>]*>([^<]+)</g),
  ].map((m) => m[1].trim());
  assert.equal(questions.length, 6, "la maquette ne porte plus six questions");
  let position = -1;
  for (const question of questions) {
    const suivante = TEXTE.indexOf(question);
    assert.ok(suivante > position, `question absente ou déplacée : ${question}`);
    position = suivante;
  }
}

console.log("Écran équipe : toutes les assertions passent.");
