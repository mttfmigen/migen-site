/**
 * Contrôle du bouton de consentement, sans navigateur.
 *
 *   bun components/consentement/verification-action.tsx
 *
 * Injecter une faute pour vérifier que le contrôle sait échouer :
 *
 *   MIGEN_FAUTE=discret  bun components/consentement/verification-action.tsx
 *   MIGEN_FAUTE=variante bun components/consentement/verification-action.tsx
 *
 * CE QU'IL DÉCIDE. Le poids visuel égal des actions de consentement n'est pas
 * une préférence esthétique : un refus plus discret qu'une acceptation rend le
 * consentement invalide. Ce contrôle est la preuve que personne ne peut
 * rendre « Tout refuser » plus discret que « Tout accepter », ni depuis un
 * appel (les rendus doivent être identiques au libellé près), ni depuis la
 * feuille de style (un seul sélecteur de base est autorisé).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Action from "@/components/consentement/Action";

const FAUTE = process.env.MIGEN_FAUTE ?? "";

/* Les quatre libellés réellement rendus par Bandeau.tsx et Panneau.tsx. */
const LIBELLES = [
  "Tout accepter",
  "Tout refuser",
  "Personnaliser",
  "Enregistrer mes choix",
];

const rendus = LIBELLES.map((libelle, index) => {
  const html = renderToStaticMarkup(<Action libelle={libelle} onClick={() => {}} />);
  // Faute injectée : un appelant qui réussirait à rendre « Tout refuser »
  // (index 1) plus discret que les autres. Le contrôle doit le voir.
  if (FAUTE === "discret" && index === 1) {
    return html.replace("<button", '<button style="opacity:.6;font-size:13px"');
  }
  return html;
});

const html = rendus.join("");

// ------------------------------------------------------------- échafaudage
// Le site n'a pas de mode sombre et la charte ne passe pas par la palette
// Tailwind par défaut : ni l'une ni l'autre ne doit survivre dans le rendu.
for (const motif of [/\bzinc-/, /\bneutral-/, /\bdark:/, /#[0-9a-fA-F]{3}/]) {
  assert.ok(!motif.test(html), `échafaudage dans le rendu : ${motif}`);
}

// ------------------------------------------------- POIDS ÉGAL, côté rendu
// Les quatre boutons doivent être strictement le même bouton. On retire le
// libellé de chacun : ce qui reste doit être identique octet pour octet.
const squelettes = rendus.map((rendu, index) =>
  rendu.replace(LIBELLES[index], ""),
);
for (let index = 1; index < squelettes.length; index += 1) {
  assert.equal(
    squelettes[index],
    squelettes[0],
    `« ${LIBELLES[index]} » n'est pas rendu comme « ${LIBELLES[0]} » : ` +
      `poids visuel inégal, consentement invalide (CNIL).`,
  );
}

assert.ok(!/style=/.test(html), "un bouton porte un style en ligne");

// ------------------------------------------- POIDS ÉGAL, côté API du composant
// `bun` résout un import de module CSS vers le CHEMIN du fichier, pas vers un
// objet de classes : sous `bun`, `styles.action` vaut `undefined` et le rendu
// ci-dessus ne porte donc aucun attribut `class`. C'est Next qui fait la
// correspondance. L'invariant se vérifie donc à la source : le bouton doit
// écrire une seule classe, littérale, sans condition ni prop, sinon un appel
// pourrait distinguer « Tout refuser » de « Tout accepter ».
const source = readFileSync(new URL("./Action.tsx", import.meta.url), "utf8")
  // Les commentaires expliquent précisément ce qui est interdit plus bas : les
  // lire comme du code ferait échouer le contrôle sur ses propres explications.
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
assert.deepEqual(
  [...source.matchAll(/className=\{?[^\s>]*/g)].map((m) => m[0]),
  ["className={styles.action}"],
  "le bouton accepte plus d'un habillage : poids visuel non garanti",
);
for (const interdit of ["variante", "className?:", "style?:", "style={"]) {
  assert.ok(
    !source.includes(interdit),
    `« ${interdit} » rouvre la porte à un bouton plus discret que les autres`,
  );
}

// ----------------------------------------------- POIDS ÉGAL, côté feuille
const CHEMIN_CSS = new URL("./Action.module.css", import.meta.url);
let css = readFileSync(CHEMIN_CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// Faute injectée : une variante « principale » qui change le remplissage.
if (FAUTE === "variante") {
  css += "\n.principal {\n  background-color: var(--acc);\n}\n";
}

const selecteurs = [...css.matchAll(/([^{}]+)\{/g)].map((bloc) =>
  bloc[1].trim(),
);
assert.deepEqual(
  selecteurs,
  [".action", ".action:hover", ".action:focus-visible"],
  "un second sélecteur de base permet de distinguer les boutons entre eux",
);

const base = /\.action\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";

// Les valeurs de la pilule, relevées dans maquette/accueil-rendu.html :
// lignes 1202 (remplissage, rayon, fonte) et 2883 (fond blanc, bordure 1px,
// texte var(--ink)). Chacune n'existe qu'ici, donc pour les quatre boutons.
for (const declaration of [
  "flex: 1",
  "min-height: 48px",
  "padding: 14px 24px",
  "border-radius: 999px",
  "border: 1px solid var(--ink)",
  "background-color: var(--card)",
  "color: var(--ink)",
  "font: 600 15px var(--fb)",
]) {
  assert.ok(
    base.includes(declaration),
    `la pilule a perdu « ${declaration} »`,
  );
}

// Aucune couleur littérale : la charte passe par ses jetons, sinon il y a
// deux chartes dans le même écran.
assert.ok(
  !/#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(css),
  "une couleur littérale dans la feuille du bouton",
);
for (const jeton of ["--ink", "--card", "--chip", "--fb", "--tr"]) {
  assert.ok(css.includes(`var(${jeton})`), `jeton absent : ${jeton}`);
}

// --------------------------------------------- focus et cible tactile
assert.ok(
  /\.action:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ink\)/.test(css),
  "le focus clavier n'est plus visible, ou n'est plus mesuré à 3:1",
);
assert.ok(
  /\.action:focus-visible\s*\{[^}]*border-radius:\s*999px/.test(css),
  "le focus global de globals.css carrerait la pilule (border-radius:4px)",
);

console.log(
  "Bouton de consentement : 4 libellés rendus à l'identique, un seul " +
    "sélecteur de base, pilule de la maquette, jetons de la charte.",
);
