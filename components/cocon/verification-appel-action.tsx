/**
 * Contrôle de l'appel à l'action du cocon, sans navigateur.
 *
 *   bun components/cocon/verification-appel-action.tsx
 *
 * Sans cadre de test, comme les autres `verification-*` du projet. Toute valeur
 * attendue est LUE dans `maquette/accueil-rendu.html`, jamais écrite de
 * mémoire : si la maquette change, ce contrôle change avec elle.
 *
 * Les contrastes sont calculés depuis les jetons réels d'`app/globals.css`,
 * pas supposés.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import AppelAction from "@/components/cocon/AppelAction";
import type { TypeCta } from "@/types/lignes";

const TYPES: readonly TypeCta[] = [
  "devis",
  "intervention",
  "rappel",
  "diagnostic",
  "candidature",
];

const rendus = TYPES.map((cta) => ({
  cta,
  html: renderToStaticMarkup(<AppelAction cta={cta} />),
}));
const html = rendus.map((r) => r.html).join("");

const source = [
  "components/cocon/AppelAction.tsx",
  "components/cocon/AppelAction.module.css",
].map((chemin) => ({ chemin, texte: readFileSync(chemin, "utf8") }));

// ===================================================================
// 1. Plus une seule classe d'échafaudage
// ===================================================================
// Le composant est rendu sur chaque page de contenu : c'est ce que le client a
// vu. Contrôlé sur le rendu ET sur la source, pour attraper une classe posée
// dans une branche que ces cinq types ne traversent pas.
for (const trace of ["zinc-", "dark:", "rounded-xl", "text-lg", "mt-12"]) {
  assert.ok(!html.includes(trace), `classe par défaut dans le rendu : ${trace}`);
  for (const { chemin, texte } of source) {
    assert.ok(!texte.includes(trace), `classe par défaut dans ${chemin} : ${trace}`);
  }
}
// Aucun `className` autre que celui du module CSS : un utilitaire Tailwind
// rentrerait par là.
assert.deepEqual(
  [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).filter((c) => !/^AppelAction/.test(c)),
  [],
  "une classe hors module CSS est rendue",
);

// ===================================================================
// 2. Aucune couleur littérale écrite ici, les jetons de la charte à la place
// ===================================================================
// `#fff` est la seule exception : la maquette l'écrit ainsi et la charte n'a pas
// de jeton de blanc. Tout autre hexadécimal, et tout rgb(), serait une couleur
// recréée à la main hors de `globals.css`.
for (const { chemin, texte } of source) {
  const hex = [...texte.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(
    hex.filter((h) => h.toLowerCase() !== "#fff"),
    [],
    `couleur littérale dans ${chemin}`,
  );
  assert.ok(!/\brgba?\(/.test(texte), `couleur rgb() littérale dans ${chemin}`);
}
for (const jeton of ["var(--panel)", "var(--acc)", "var(--rad)", "var(--ft)", "var(--fb)", "var(--ts)", "var(--tr)"]) {
  assert.ok(html.includes(jeton), `jeton de charte absent du rendu : ${jeton}`);
}

// ===================================================================
// 3. Les valeurs viennent de la maquette, et on le prouve
// ===================================================================
const maquette = readFileSync("maquette/accueil-rendu.html", "utf8").split("\n");
/** Ligne de la maquette, numérotée comme `grep -n` l'affiche. */
const ligne = (n: number): string => maquette[n - 1] ?? "";
/** Les styles en ligne d'une ligne de la maquette. */
const styles = (n: number): string[] =>
  [...ligne(n).matchAll(/style="([^"]+)"/g)].map((m) => m[1]);
/** Celui qui contient un marqueur donné, pour ne pas compter les `<div>`. */
const styleAvec = (n: number, marqueur: string): string => {
  const trouve = styles(n).find((s) => s.includes(marqueur));
  assert.ok(trouve, `maquette ligne ${n} : aucun style contenant « ${marqueur} »`);
  return trouve;
};
const declarations = (style: string): string[] =>
  style.split(";").map((d) => d.trim()).filter(Boolean);
const propriete = (declaration: string): string => declaration.split(":")[0].trim();

/** Le style en ligne de la première balise du rendu qui porte un marqueur. */
const rendu = (marqueur: string): string => {
  const trouve = [...html.matchAll(/style="([^"]+)"/g)]
    .map((m) => m[1])
    .find((s) => s.includes(marqueur));
  assert.ok(trouve, `rendu : aucun style contenant « ${marqueur} »`);
  return trouve;
};

const PANNEAU_RENDU = rendu("background:var(--panel)");
const TITRE_RENDU = rendu("text-wrap:balance");
const HALO_RENDU = rendu("radial-gradient");
const BOUTON_RENDU = rendu("border-radius:999px");

// --- le panneau : ligne 5333, un panneau anthracite à `var(--rad)` et 40px 44px
for (const d of declarations(styleAvec(5333, "background:var(--panel)"))) {
  assert.ok(PANNEAU_RENDU.includes(d), `panneau : « ${d} » (maquette 5333) absent du rendu`);
}

// --- la rangée : ligne 2676, le bloc d'appel à l'action qui ferme les sections.
// Son rayon (40px) et son remplissage (52px 56px) sont ÉCARTÉS sciemment :
// `app/globals.css` ne rattrape sur mobile que `var(--rad)` et `padding:40px
// 44px`, et 112px de gouttière sur un écran de 320px ne laissent plus de place
// au texte. Les deux valeurs retenues viennent de la ligne 5333, vérifiée juste
// au-dessus. Tout le reste de la ligne 2676 est repris tel quel.
const ECARTES = new Set(["border-radius", "padding"]);
for (const d of declarations(styleAvec(2676, "background:var(--panel)"))) {
  if (ECARTES.has(propriete(d))) continue;
  assert.ok(PANNEAU_RENDU.includes(d), `rangée : « ${d} » (maquette 2676) absent du rendu`);
}

// --- la marge : ligne 2801, l'encart d'appel posé dans le flux d'une page
assert.ok(
  PANNEAU_RENDU.includes("margin:36px 0"),
  "la marge de l'encart dans le flux (maquette 2801) a changé",
);

// --- le titre et la lueur, déclaration par déclaration
for (const d of declarations(styleAvec(2676, "text-wrap:balance"))) {
  assert.ok(TITRE_RENDU.includes(d), `titre : « ${d} » (maquette 2676) absent du rendu`);
}
assert.equal(
  HALO_RENDU,
  styleAvec(4851, "radial-gradient"),
  "la lueur orange ne correspond plus à la maquette ligne 4851",
);

// --- le bouton : les onze déclarations du `<a>` de la ligne 2676
for (const d of declarations(styleAvec(2676, "border-radius:999px"))) {
  assert.ok(BOUTON_RENDU.includes(d), `bouton : « ${d} » (maquette 2676) absent du rendu`);
}

// ===================================================================
// 4. Le rattrapage mobile de `globals.css` doit retrouver ses sélecteurs
// ===================================================================
// Il travaille par sélecteurs d'attribut sur le style en ligne. Changer la
// sérialisation d'un pixel supprime la règle sans rien casser d'autre : 88px de
// gouttière reviennent sur téléphone, en silence.
const globals = readFileSync("app/globals.css", "utf8");
for (const litteral of ["padding:40px 44px"]) {
  assert.ok(
    globals.includes(`[style*="${litteral}"]`),
    `globals.css ne rattrape plus « ${litteral} » sous 760px`,
  );
  assert.ok(html.includes(litteral), `le rendu n'écrit plus « ${litteral} »`);
}

// ===================================================================
// 5. Contraste, calculé sur le fond réel
// ===================================================================
const jeton = (nom: string): string => {
  const trouve = globals.match(new RegExp(`${nom}:\\s*(#[0-9a-fA-F]{3,6})`));
  assert.ok(trouve, `jeton ${nom} introuvable dans globals.css`);
  return trouve[1];
};
const canaux = (hex: string): [number, number, number] => {
  const c = hex.slice(1);
  const plein = c.length === 3 ? [...c].map((x) => x + x).join("") : c;
  return [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16)) as [number, number, number];
};
const luminance = (hex: string): number => {
  const [r, v, b] = canaux(hex).map((n) => {
    const s = n / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * v + 0.0722 * b;
};
const contraste = (a: string, b: string): number => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** Mélange alpha de `dessus` sur `dessous`, en sRGB, comme le navigateur. */
const melange = (dessus: string, dessous: string, alpha: number): string => {
  const [a, b] = [canaux(dessus), canaux(dessous)];
  return (
    "#" +
    a
      .map((n, i) => Math.round(n * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("")
  );
};
const arrondi = (n: number): string => n.toFixed(2).replace(".", ",");

const PANEL = jeton("--panel");
const ACC = jeton("--acc");

// Le titre blanc sur le panneau anthracite.
const titreNu = contraste("#ffffff", PANEL);
assert.ok(titreNu >= 4.5, `titre sur le panneau : ${arrondi(titreNu)}:1, sous 4,5:1`);

// ET sur le panneau là où la lueur orange l'éclaircit, ce qui FAIT BAISSER le
// contraste du texte blanc. L'alpha est relu dans la lueur rendue, pas supposé.
const alpha = Number(
  HALO_RENDU.match(/rgba\(255,124,60,(\.[0-9]+)\)/)?.[1] ??
    assert.fail("alpha de la lueur illisible"),
);
const sousLueur = melange(ACC, PANEL, alpha);
const titreLueur = contraste("#ffffff", sousLueur);
assert.ok(
  titreLueur >= 4.5,
  `titre au plus clair de la lueur : ${arrondi(titreLueur)}:1, sous 4,5:1`,
);

// Le liséré de focus, posé globalement en `var(--acc)`, tombe sur le panneau :
// critère 1.4.11 de la WCAG, 3:1 pour un élément d'interface.
const focus = contraste(ACC, PANEL);
assert.ok(focus >= 3, `liséré de focus sur le panneau : ${arrondi(focus)}:1, sous 3:1`);
for (const { chemin, texte } of source) {
  assert.ok(!/outline\s*:\s*(none|0)/.test(texte), `le focus est désactivé dans ${chemin}`);
}

// Le libellé du bouton de marque, blanc sur orange. RÉSERVE OUVERTE, consignée
// dans `docs/RESERVES-CONTENU.md` § 4.1 : c'est le bouton de TOUTE la maquette
// (pied de page, grille d'offres, gabarit article, dix sections du gabarit de
// vente). L'assombrir est une décision de charte, pas de code, et la prendre
// dans ce seul composant donnerait deux boutons différents sur la même page.
// L'assertion est à l'envers exprès : le jour où la charte tranche, elle tombe
// et la réserve se ferme au lieu de dormir.
const bouton = contraste("#ffffff", ACC);
assert.ok(
  bouton < 4.5,
  `le bouton de marque passe AA (${arrondi(bouton)}:1) : fermer la réserve § 4.1 de docs/RESERVES-CONTENU.md et retourner cette assertion`,
);
console.log(
  `Contrastes mesurés : titre ${arrondi(titreNu)}:1 sur le panneau, ` +
    `${arrondi(titreLueur)}:1 au plus clair de la lueur, focus ${arrondi(focus)}:1, ` +
    `libellé du bouton ${arrondi(bouton)}:1 (réserve § 4.1).`,
);

// ===================================================================
// 6. Cible tactile : 24px de haut au minimum (WCAG 2.2, critère 2.5.8)
// ===================================================================
// Mesurée depuis le style rendu, pas depuis le navigateur : remplissage haut +
// bas + la ligne de texte. Aucune règle mobile n'est nécessaire dans le module
// tant que ce calcul reste au-dessus de 24 ; si quelqu'un resserre le bouton,
// cette assertion le dit avant la mise en ligne.
const remplissage = BOUTON_RENDU.match(/padding:(\d+)px (\d+)px/);
const taille = BOUTON_RENDU.match(/font:600 (\d+(?:\.\d+)?)px/);
assert.ok(remplissage && taille, "le remplissage ou la taille du bouton n'est plus lisible");
const hauteur = Number(remplissage[1]) * 2 + Number(taille[1]);
assert.ok(hauteur >= 24, `cible tactile du bouton : ${hauteur}px, sous les 24px du critère 2.5.8`);

// Le libellé ne doit pas pouvoir être amputé sur téléphone : le bouton porte
// `white-space: nowrap` en ligne et le panneau `overflow: hidden`. Mesuré dans
// Chrome, les cinq libellés tiennent à 320px, le plus long à 13px près. La règle
// du module est le garde-fou du sixième, et elle doit rester là.
{
  const feuille = source.find((s) => s.chemin.endsWith(".module.css"))!.texte;
  assert.ok(
    /@media \(max-width: 400px\)[\s\S]*\.boutonAction[\s\S]*white-space: normal !important/.test(feuille),
    "le retour à la ligne du libellé sur téléphone a disparu du module : un libellé long sera coupé",
  );
  assert.ok(
    BOUTON_RENDU.includes("white-space:nowrap"),
    "le bouton ne porte plus le nowrap de la maquette",
  );
}

// ===================================================================
// 7. Structure et liens
// ===================================================================
for (const { cta, html: un } of rendus) {
  assert.equal((un.match(/<h2[\s>]/g) ?? []).length, 1, `cta ${cta} : il faut un seul h2`);
  assert.ok(un.includes('aria-hidden="true"'), `cta ${cta} : la lueur n'est pas masquée aux lecteurs`);
}
assert.ok(!html.includes('href="#"'), "un appel à l'action est rendu inerte");
const { ANCRE_FORMULAIRE } = await import("@/components/site/blocs/habillage");
assert.equal(
  (html.match(new RegExp(`href="${ANCRE_FORMULAIRE}"`, "g")) ?? []).length,
  TYPES.length,
  `les ${TYPES.length} appels doivent viser ${ANCRE_FORMULAIRE}`,
);
// Un style en ligne vide se rend `style=""` et laisse le bloc nu : vu une fois.
assert.ok(!html.includes('style=""'), "un style en ligne est rendu vide");

// ===================================================================
// 8. Interdits de copie du contrat
// ===================================================================
for (const interdit of [
  "levier", "clé en main", "sur mesure", "concrètement", "notamment",
  "incontournable", "découvrez", "régie", "intérim", "mise à disposition",
  "sans engagement", "—", "€",
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}
assert.ok(!/\b\d+\s*(h|heures?|min|minutes?|jours?)\b/i.test(html), "délai chiffré rendu");

console.log(
  `Appel à l'action : ${TYPES.length} types rendus, valeurs conformes à la maquette ` +
    "(lignes 2676, 2801, 4851, 5333), aucune classe par défaut, toutes les assertions passent.",
);
