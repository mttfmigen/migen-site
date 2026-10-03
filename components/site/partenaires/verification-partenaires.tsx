/**
 * Contrôle de la page « Partenaires », sans navigateur.
 *
 *   bun components/site/partenaires/verification-partenaires.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, lignes 6032 à 6126. Aucune n'est écrite de mémoire : chaque phrase
 * et chaque fragment de style est cherché DEUX FOIS, dans la tranche de maquette
 * puis dans le rendu. Si la maquette bouge, le contrôle tombe du côté maquette
 * et dit laquelle des deux a changé.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import AppelAPartenaires from "@/components/site/partenaires/AppelAPartenaires";
import FonctionnementPartenariat from "@/components/site/partenaires/FonctionnementPartenariat";
import OuverturePartenaires from "@/components/site/partenaires/OuverturePartenaires";
import {
  FORMULAIRE_PARTENAIRES,
  INTRO_FORMULAIRE_PARTENAIRES,
  PARTENAIRES,
  TITRE_FORMULAIRE_PARTENAIRES,
  TITRE_SEO_PARTENAIRES,
} from "@/components/site/partenaires/donnees";

const RACINE = fileURLToPath(new URL("../../../", import.meta.url));
const PREMIERE_LIGNE = 6032;
const DERNIERE_LIGNE = 6126;

/**
 * Même texte des deux côtés : la maquette écrit `&nbsp;` là où React rend le
 * caractère, elle mélange l'apostrophe droite et la courbe, et React échappe
 * l'apostrophe droite en `&#x27;`. Sans cette mise à plat, le contrôle
 * échouerait sur de la typographie au lieu d'attraper une vraie divergence.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/[  ]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ");
}

const maquette = normalise(
  readFileSync(`${RACINE}maquette/accueil-rendu.html`, "utf8")
    .split("\n")
    .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
    .join("\n"),
);

assert.ok(
  maquette.includes('data-screen-label="Partenaires"'),
  `lignes ${PREMIERE_LIGNE} à ${DERNIERE_LIGNE} : ce n'est plus l'écran Partenaires, la maquette a été renumérotée`,
);

const brut = [
  renderToStaticMarkup(<OuverturePartenaires />),
  renderToStaticMarkup(<FonctionnementPartenariat />),
  renderToStaticMarkup(<AppelAPartenaires />),
  renderToStaticMarkup(
    <FormulaireBasDePage
      formulaire={FORMULAIRE_PARTENAIRES}
      titre={TITRE_FORMULAIRE_PARTENAIRES}
      intro={INTRO_FORMULAIRE_PARTENAIRES}
    />,
  ),
].join("");
const rendu = normalise(brut);

/** Présent dans la maquette ET dans le rendu, ou le contrôle dit lequel manque. */
function desDeuxCotes(attendu: string, quoi: string): void {
  const plat = normalise(attendu);
  assert.ok(
    maquette.includes(plat),
    `${quoi} : absent de la maquette (lignes ${PREMIERE_LIGNE} à ${DERNIERE_LIGNE}), la source a changé`,
  );
  assert.ok(rendu.includes(plat), `${quoi} : absent du rendu de la page`);
}

// ------------------------------------------------------------ copie visible
for (const phrase of [
  "Nos offres en partenariat, 100 % Made in France.",
  "Nous ne savons pas tout faire. Pour la GMAO, l'intralogistique ou les prestations connexes, nous travaillons avec des acteurs français que nous connaissons sur le terrain.",
  "Plusieurs métiers, un seul responsable.",
  "Un partenariat n'a de valeur que si vous n'en voyez pas la complexité.",
  "Décrire mon projet",
  "Un diagnostic commun",
  "Nous visitons le site ensemble. Chaque partenaire voit ce qui relève de son métier, et nous fixons qui fait quoi avant de chiffrer.",
  "Un périmètre écrit",
  "L'offre précise ce que porte chaque acteur. Aucune zone grise sur les interfaces entre la GMAO, l'installation et la maintenance.",
  "Un interlocuteur unique",
  "migen© reste votre point d'entrée. Nous coordonnons les partenaires et vous rendons compte, sans que vous ayez à relancer trois entreprises.",
  "Vous éditez un outil, vous installez des lignes ?",
  "Nous cherchons des partenaires français dont la maintenance est le prolongement naturel.",
  "Proposer un partenariat",
  "Décrire mon besoin",
  "Un projet qui touche l'un de nos partenaires ? Décrivez-le.",
  "Nous vous mettons en relation avec le bon interlocuteur, chez eux ou chez nous.",
]) {
  desDeuxCotes(phrase, `copie « ${phrase.slice(0, 44)} »`);
}

// Les deux partenaires nommés, leur métier et leur paragraphe.
for (const partenaire of PARTENAIRES) {
  desDeuxCotes(partenaire.nom, `nom du partenaire ${partenaire.nom}`);
  desDeuxCotes(partenaire.domaine, `métier de ${partenaire.nom}`);
  desDeuxCotes(partenaire.corps, `paragraphe de ${partenaire.nom}`);
}

// --------------------------------------------------- valeurs de mise en forme
// Recopiées telles quelles par le contrat de portage : un arrondi ici décale la
// page par rapport à l'écran que le client a validé.
for (const fragment of [
  "padding:70px 40px 0",
  "max-width:19ch",
  "letter-spacing:-.045em",
  "font:600 calc(clamp(38px,4.6vw,70px) * var(--ts))/1.03 var(--ft)",
  "font:400 18.5px/1.6 var(--fb)",
  "max-width:58ch",
  "padding:44px 40px 0",
  "padding:36px 38px 38px",
  "box-shadow:0 1px 1px rgba(0,0,0,.04),0 24px 56px -34px rgba(0,0,0,.32)",
  "width:180px",
  "height:72px",
  "font:600 21px var(--ft)",
  "grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)",
  "position:sticky;top:110px",
  "font:600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  "padding:26px 28px",
  "font:600 calc(30px * var(--ts))/1 var(--ft)",
  "background:#1c1b19",
  "color:rgba(255,255,255,.7)",
  "border-radius:36px",
  "padding:56px",
  "font:600 calc(clamp(26px,2.6vw,38px) * var(--ts))/1.1 var(--ft)",
  "max-width:26ch",
  "font:400 16.5px/1.6 var(--fb)",
  "max-width:50ch",
  "box-shadow:0 12px 30px -12px rgba(255,124,60,.9)",
]) {
  desDeuxCotes(fragment, `valeur de style ${fragment}`);
}

// ----------------------------------------------------------- un seul titre H1
{
  const titres = brut.match(/<h1\b/g) ?? [];
  assert.equal(titres.length, 1, `${titres.length} balise(s) h1 au lieu d'une`);
}

// ------------------------------------- le titre de recherche n'est pas le H1
// Règle du projet : le titre se lit dans la page de résultats, le H1 sur la
// page. Les deux identiques, c'est une page qui se répète.
{
  const h1 = normalise(
    (brut.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").replace(
      /<[^>]+>/g,
      "",
    ),
  ).trim();
  assert.ok(h1.length > 0, "le h1 est vide");
  assert.notEqual(
    normalise(TITRE_SEO_PARTENAIRES).trim(),
    h1,
    "le titre de la page de résultats est identique au H1",
  );
}

// --------------------------------------------------------- aucun lien inerte
// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
assert.ok(
  !brut.includes('href="#"'),
  'un lien de la page est rendu inerte (href="#")',
);

// Chaque ancre de la page doit viser un identifiant que la page rend. Les deux
// appels à l'action visent le formulaire : son id a déjà divergé une fois.
for (const [, ancre] of brut.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(
    brut.includes(`id="${ancre}"`),
    `l'ancre #${ancre} ne vise aucun id rendu par la page`,
  );
}

// ------------------------------------- aucune couleur Tailwind d'échafaudage
// La charte vit dans les jetons de `app/globals.css`. Une palette Tailwind par
// défaut à côté d'eux, c'est deux chartes dans le même écran. Et le site n'a
// pas de mode sombre : une variante `dark:` est forcément un reste.
for (const [, classes] of brut.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classes,
    ),
    `classe Tailwind de couleur rendue : « ${classes} », à remplacer par un jeton de la charte`,
  );
  assert.ok(
    !/\bdark:/.test(classes),
    `variante dark: rendue : « ${classes} », le site n'a pas de mode sombre`,
  );
}

// ----------------------------------------------------------- rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(brut),
  "un bloc est rendu avec une opacité nulle",
);

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "+200",
  "200 clients",
  "5 agences",
  "cinq agences",
  "agences en France",
  "sous 24 h",
  "sous 48 h",
  "sous 2 h",
  "sous 4 h",
  "sous 72 h",
  "h de route",
  "heures de route",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "Découvrez",
  "—",
  "–",
]) {
  assert.ok(!rendu.includes(interdit), `copie interdite rendue : ${interdit}`);
}

// --------------------------------------------------------- logos sur le disque
// Un logo absent n'est pas remplacé par un texte inventé : la carte se rend
// sans lui. Ce contrôle refuse en revanche un chemin qui ne mène nulle part,
// qui afficherait une image cassée au visiteur.
for (const partenaire of PARTENAIRES) {
  if (partenaire.logo === "") continue;
  assert.ok(
    existsSync(`${RACINE}public${partenaire.logo}`),
    `le logo de ${partenaire.nom} est déclaré à ${partenaire.logo}, ce fichier n'existe pas dans public/`,
  );
}

console.log(
  `Partenaires : ${PARTENAIRES.length} partenaires, un seul h1, titre distinct du h1, aucun lien inerte, toutes les valeurs relues dans la maquette.`,
);
