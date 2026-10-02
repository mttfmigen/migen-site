/**
 * Contrôle du fil d'Ariane, sans navigateur.
 *
 *   bun components/cocon/verification-fil-ariane.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Ce composant
 * est rendu sur CHAQUE page de contenu : ce qui s'y relâche se voit partout.
 *
 * Les valeurs attendues ne sont pas écrites de mémoire : elles sont RELUES dans
 * `maquette/accueil-rendu.html` et dans `app/globals.css` à chaque exécution. Un
 * contrôle qui recopie son attente ne vérifie que lui-même.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import { FilArianeVue } from "./FilAriane";

const RACINE = fileURLToPath(new URL("../..", import.meta.url));
const lire = (chemin: string) => readFileSync(RACINE + chemin, "utf8");

const maquette = lire("maquette/accueil-rendu.html");
const jetons = lire("app/globals.css");
const feuille = lire("components/cocon/FilAriane.module.css");

/* Trois niveaux, dont un sans page publiée au milieu : c'est le cas que
   `filAriane()` produit quand un palier de l'arborescence n'est pas rédigé. */
const html = renderToStaticMarkup(
  <FilArianeVue
    etapes={[
      { titre: "Expertises", path: "/expertises/" },
      { titre: "Soudure", path: null },
      { titre: "Marques maintenues", path: "/expertises/soudure/marques/" },
    ]}
  />,
);

// ================================================= 1. la maquette fait foi
//
// La rangée de la maquette, mot pour mot. Si elle bouge, l'assertion tombe et
// c'est au portage de se mettre à jour, pas au contrôle.
const RANGEE_MAQUETTE =
  "display:flex;align-items:center;gap:8px;font:400 13px var(--fb);color:var(--ink4);flex-wrap:wrap";
assert.ok(
  maquette.includes(RANGEE_MAQUETTE),
  `la rangée du fil d'Ariane a changé dans la maquette : ${RANGEE_MAQUETTE}`,
);

/* Chaque déclaration de la maquette se retrouve dans le rendu. `color` est la
   seule exclue : la maquette la pose sur la rangée pour ses niveaux, nous la
   gardons pour le séparateur et relevons celle des niveaux (section 3). */
for (const declaration of RANGEE_MAQUETTE.split(";")) {
  assert.ok(
    html.includes(declaration),
    `déclaration de la maquette absente du rendu : ${declaration}`,
  );
}

// La page courante de la maquette, et le couple emprunté à sa ligne 1074.
assert.ok(maquette.includes('<span style="color:var(--ink1)">'));
assert.ok(maquette.includes("font:500 13.5px var(--fb);color:var(--ink1)"));
// L'orange sombre employé par la maquette pour un lien sur fond clair.
assert.ok(maquette.includes("color:var(--acc-ink)"));

// ============================================== 2. plus aucun échafaudage
for (const motif of [
  /\bdark:/,
  /-(?:zinc|gray|slate|neutral|stone)-\d{2,3}\b/,
  /\btext-(?:sm|xs|base)\b/,
]) {
  assert.ok(
    !motif.test(html),
    `classe Tailwind d'échafaudage dans le rendu : ${motif}`,
  );
}

// Les jetons de la charte sont bien ceux qui habillent la rangée.
for (const jeton of ["var(--fb)", "var(--ink4)"]) {
  assert.ok(html.includes(jeton), `jeton absent du rendu : ${jeton}`);
}
for (const jeton of ["var(--ink2)", "var(--ink1)", "var(--acc-ink)"]) {
  assert.ok(feuille.includes(jeton), `jeton absent du module CSS : ${jeton}`);
}
// Aucune couleur littérale : la charte passe par ses jetons.
assert.ok(
  !/#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(feuille.replace(/\/\*[\s\S]*?\*\//g, "")),
  "une couleur littérale est écrite dans le module CSS au lieu d'un jeton",
);

// ========================================= 3. contraste, calculé et non supposé
//
// WCAG 1.4.3 (AA) : 4,5:1 pour du texte. Les valeurs sortent de `globals.css`,
// pas d'une note de lecture.
function jeton(nom: string): string {
  const trouve = jetons.match(new RegExp(`--${nom}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(trouve, `jeton --${nom} introuvable dans app/globals.css`);
  return trouve[1];
}

function luminance(hex: string): number {
  const canaux = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, v, b] = canaux.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * v + 0.0722 * b;
}

function contraste(encre: string, fond: string): number {
  const [clair, sombre] = [luminance(encre), luminance(fond)].sort((a, b) => b - a);
  return (clair + 0.05) / (sombre + 0.05);
}

/* Le fond réel : la maquette pose le fil dans un `<main>` sans carte, donc sur
   --bg. Les gabarits du site font pareil (`PageSecteur`, `PageEditoriale`). */
const fond = jeton("bg");

const MESURES: readonly [string, string, boolean][] = [
  ["niveau parcouru (--ink2)", jeton("ink2"), true],
  ["survol (--acc-ink)", jeton("acc-ink"), true],
  ["page courante (--ink1)", jeton("ink1"), true],
  // Témoins : les deux valeurs de la maquette, qui ne tiennent pas le critère.
  // C'est ce que cette section démontre, et c'est pourquoi elles sont écartées.
  ["--ink4 de la maquette", jeton("ink4"), false],
  ["--acc de la maquette", jeton("acc"), false],
];

for (const [role, encre, doitPasser] of MESURES) {
  const rapport = contraste(encre, fond);
  const texte = `${role} : ${rapport.toFixed(2)}:1 sur ${fond}`;
  if (doitPasser) {
    assert.ok(rapport >= 4.5, `contraste insuffisant, ${texte}`);
  } else {
    assert.ok(
      rapport < 4.5,
      `${texte} tient maintenant le critère : la maquette est utilisable telle quelle, retirer l'écart documenté dans FilAriane.tsx`,
    );
  }
  console.log(`  ${doitPasser ? "retenu " : "écarté "} ${texte}`);
}

// ================================================= 4. cible tactile, 24 px
//
// Le module CSS doit déclarer la règle, et son arithmétique doit tenir : boîte de
// ligne de 20 px à 13 px, plus deux fois le remplissage, au moins 24 px.
const regle = feuille.match(
  /@media\s*\(max-width:\s*880px\)\s*\{[^}]*a\.niveau\s*\{([^}]*)\}/,
);
assert.ok(regle, "le module CSS ne déclare plus la cible tactile sous 880px");
const remplissage = regle[1].match(/padding:\s*(\d+)px\s+0/);
assert.ok(remplissage, "la cible tactile ne passe plus par un remplissage");
assert.ok(
  /display:\s*inline-block/.test(regle[1]),
  "sans `inline-block`, le remplissage vertical n'agrandit pas la zone de contact",
);
const hauteur = 20 + 2 * Number(remplissage[1]);
assert.ok(
  hauteur >= 24,
  `cible tactile de ${hauteur}px, le critère 2.5.8 de la WCAG 2.2 en demande 24`,
);
console.log(`  cible tactile sous 880px : ${hauteur}px`);

// ======================================== 5. structure et accessibilité
assert.ok(
  html.includes('aria-label="Fil d&#x27;Ariane"'),
  "le fil d'Ariane a perdu son nom accessible",
);
// Un fil d'Ariane n'injecte aucun titre dans le plan de la page.
assert.ok(!/<h[1-6][\s>]/.test(html), "le fil d'Ariane rend un titre");

// La page courante : une seule, annoncée, et JAMAIS un lien.
assert.equal(
  (html.match(/aria-current="page"/g) ?? []).length,
  1,
  "la page courante doit être marquée une fois et une seule",
);
assert.ok(
  !/<a[^>]*aria-current="page"/.test(html),
  "la page courante est rendue cliquable",
);

// Le niveau sans page publiée reste du texte.
assert.ok(
  !html.includes("Soudure</a>"),
  "un niveau sans page publiée est rendu cliquable, vers une 404",
);
assert.ok(html.includes("Soudure</span>"));

// Trois niveaux plus l'accueil, donc trois séparateurs et trois liens.
assert.equal((html.match(/>\/</g) ?? []).length, 3);
assert.equal((html.match(/<a /g) ?? []).length, 2, "Accueil et Expertises");
assert.ok(!html.includes('href="#"'), "un niveau est rendu inerte");

// Rien d'invisible : un fil d'Ariane n'a pas d'apparition au défilement.
assert.ok(!/opacity:0(?![.0-9])/.test(html));

// ============================================ 6. interdits de copie du contrat
for (const interdit of [
  "—",
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
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}

console.log("Fil d'Ariane : toutes les assertions passent.");
