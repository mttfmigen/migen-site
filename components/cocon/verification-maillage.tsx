/**
 * Le maillage interne porte-t-il la charte, et seulement elle ?
 *
 *   bun components/cocon/verification-maillage.tsx
 *
 * Sans navigateur et sans base : le composant d'habillage ne prend que des
 * liens déjà lus. Sans cadre de test, comme les autres `verification.*`.
 *
 * TOUTE VALEUR ATTENDUE EST RELEVÉE DANS `maquette/accueil-rendu.html`, jamais
 * écrite de mémoire : le contrôle extrait le bloc « Pages liées » de la maquette
 * (le `sc-for` sur `cRelated`, ligne 2683) et compare déclaration par
 * déclaration. Si la maquette change, c'est ce contrôle qui le dit.
 *
 * Les seuils de contraste sont CALCULÉS sur le fond réel, fond de verre
 * composité sur le crème de la page, avec les jetons lus dans
 * `app/globals.css`. Rien n'est supposé.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import ListeMaillage from "@/components/cocon/ListeMaillage";

/* Des liens de forme, pas de contenu inventé : le composant ne décide d'aucun
   texte, il reçoit ce que `lib/contenu` a lu. */
const html = renderToStaticMarkup(
  <ListeMaillage
    groupes={[
      { titre: "Remonter d'un niveau", liens: [{ path: "/expertises/", titre: "Expertises" }] },
      {
        titre: "Dans cette rubrique",
        liens: [
          { path: "/expertises/electricite-industrielle/", titre: "Électricité industrielle" },
          { path: "/expertises/mecanique/", titre: "Mécanique" },
        ],
      },
      { titre: "Pages voisines", liens: [{ path: "/secteurs/chimie/", titre: "Chimie" }] },
      { titre: "Groupe vide", liens: [] },
    ]}
  />,
);

const moduleCss = readFileSync("components/cocon/Maillage.module.css", "utf8");
/* La liaison `className={styles.carte}` est lue dans la SOURCE et non dans le
   rendu : `bun` ne compile pas les modules CSS, son import rend le chemin du
   fichier et non la table des classes, donc l'attribut `class` n'apparaît pas
   ici. Next, lui, le pose. */
const source = readFileSync("components/cocon/ListeMaillage.tsx", "utf8");
const globals = readFileSync("app/globals.css", "utf8");
const maquette = readFileSync("maquette/accueil-rendu.html", "utf8").split("\n");

// --------------------------------------------- le bloc « Pages liées » relevé
const ligneCarte = maquette.find((l) => l.includes('list="{{ cRelated }}"'));
assert.ok(ligneCarte, "bloc « Pages liées » introuvable dans la maquette (sc-for cRelated)");
const ligneGrille = maquette.find((l) => l.includes("repeat(auto-fill,minmax(250px,1fr))"));
assert.ok(ligneGrille, "grille du bloc « Pages liées » introuvable dans la maquette");

const styleMaquetteCarte = /<a [^>]*?style="([^"]*)"/.exec(ligneCarte)?.[1] ?? "";
const survolMaquetteCarte = /style-hover="([^"]*)"/.exec(ligneCarte)?.[1] ?? "";
const spansMaquette = [...ligneCarte.matchAll(/<span style="([^"]*)">/g)].map((m) => m[1]);
assert.ok(styleMaquetteCarte && survolMaquetteCarte && spansMaquette.length === 3);

/** « a:1;b:2 » devient une table, pour comparer sans dépendre de l'ordre. */
const declarations = (style: string) =>
  new Map(
    style
      .split(";")
      .filter(Boolean)
      .map((d) => {
        const i = d.indexOf(":");
        return [d.slice(0, i).trim(), d.slice(i + 1).trim().replace(/\s+/g, " ")] as const;
      }),
  );

const carteRendue = /<a [^>]*?style="([^"]*)"/.exec(html)?.[1] ?? "";
assert.ok(carteRendue, "aucune carte rendue");
const rendu = declarations(carteRendue);

/* Chaque déclaration de la maquette est portée par la carte. Les valeurs
   pixellaires, les rayons, l'ombre et la transition viennent d'elle. */
for (const [propriete, valeur] of declarations(styleMaquetteCarte)) {
  assert.equal(
    rendu.get(propriete),
    valeur,
    `la carte doit porter « ${propriete}: ${valeur} » comme la maquette, elle porte « ${rendu.get(propriete)} »`,
  );
}

/* Les deux spans repris de la maquette, à l'identique : le titre et le « Lire ».
   Le premier span de la maquette est la famille de la page (`p.fam`), que le
   maillage n'a pas en base : il n'est pas rendu, plutôt que rempli au hasard. */
for (const attendu of [spansMaquette[1], spansMaquette[2]]) {
  assert.ok(
    html.includes(`style="${attendu}"`),
    `un span de la carte doit porter exactement « ${attendu} »`,
  );
}

/* La grille : colonnes et écart de la maquette. */
const styleGrilleMaquette = /<div style="(display:grid;grid-template-columns:repeat\(auto-fill[^"]*)"/.exec(ligneGrille)?.[1] ?? "";
for (const [propriete, valeur] of declarations(styleGrilleMaquette)) {
  assert.ok(
    new RegExp(`<ul style="[^"]*${propriete}:${valeur.replace(/[()[\]*+?.\\^$|]/g, "\\$&")}`).test(html),
    `la grille doit porter « ${propriete}: ${valeur} »`,
  );
}

/* Le survol est dans le module, et c'est celui de la maquette. */
assert.match(source, /className=\{styles\.carte\}/, "la carte doit porter la classe du module");
assert.ok(
  moduleCss.includes(".carte:hover") && moduleCss.includes(survolMaquetteCarte.replace("transform:", "transform: ")),
  `le module doit porter le survol de la maquette (${survolMaquetteCarte})`,
);
assert.ok(moduleCss.includes(".carte:focus-visible"), "le focus clavier doit être traité dans le module");
assert.doesNotMatch(moduleCss, /outline\s*:\s*none/, "le module ne doit jamais éteindre l'anneau de focus");
assert.match(globals, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--acc\)/, "l'anneau de focus global a disparu");

// ------------------------------------------------------- plus d'échafaudage
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.doesNotMatch(
    classe[1],
    /\b(?:text|bg|border|ring|divide|shadow|outline)-(?:zinc|gray|slate|neutral|stone|white|black)(?:-\d{2,3})?\b/,
    `classe d'échafaudage rendue : ${classe[1]}`,
  );
  assert.doesNotMatch(classe[1], /\bdark:/, `variante de mode sombre rendue : ${classe[1]}`);
}
assert.doesNotMatch(html, /#[0-9a-fA-F]{3,8}\b/, "aucune couleur littérale : la charte passe par ses jetons");
/* Les seules formes `rgba()` admises sont celles que la maquette écrit dans ce
   bloc : le fond de verre et les deux ombres. Toute autre serait une couleur
   posée à la main. */
for (const rgba of html.matchAll(/rgba\([^)]*\)/g)) {
  assert.ok(
    styleMaquetteCarte.includes(rgba[0]),
    `couleur littérale hors maquette : ${rgba[0]}`,
  );
}
for (const jeton of ["--rad-s", "--gl-a", "--gl-b", "--gbd", "--ink", "--ink2", "--acc-ink", "--ft", "--fb", "--ts", "--tr", "--sec"]) {
  assert.ok(html.includes(`var(${jeton})`), `le jeton ${jeton} doit être utilisé`);
}

// ------------------------------------------------------------ titres, un seul
assert.equal((html.match(/<h2\b/g) ?? []).length, 1, "la section porte un seul h2");
assert.equal((html.match(/<h3\b/g) ?? []).length, 3, "un h3 par groupe rempli, le groupe vide n'en porte pas");
const idTitre = /<h2 id="([^"]+)"/.exec(html)?.[1];
assert.ok(idTitre && html.includes(`aria-labelledby="${idTitre}"`), "le h2 doit nommer la navigation");

// ---------------------------------- cible tactile, critère 2.5.8 de la WCAG
/* Mesurée sur le rendu et non supposée : la carte est la seule cible du
   composant, et c'est sa hauteur minimale qui fait la cible. */
const hauteurCible = Number(/min-height:(\d+(?:\.\d+)?)px/.exec(carteRendue)?.[1]);
assert.ok(hauteurCible >= 24, `cible tactile de ${hauteurCible}px, le critère 2.5.8 en demande 24`);
/* Et rien dans le module ne la rabote. */
assert.doesNotMatch(moduleCss, /min-height|height\s*:/, "le module ne doit pas toucher à la hauteur de la cible");

// ------------------------------------------------- contraste, 4,5:1 minimum
const jeton = (nom: string) => {
  const trouve = new RegExp(`${nom}:\\s*([^;]+);`).exec(globals)?.[1].trim();
  assert.ok(trouve, `jeton ${nom} absent de app/globals.css`);
  return trouve;
};
const canaux = (hex: string) => hex.replace("#", "").match(/../g)!.map((x) => parseInt(x, 16));
const lineaire = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const luminance = (c: number[]) => 0.2126 * lineaire(c[0]) + 0.7152 * lineaire(c[1]) + 0.0722 * lineaire(c[2]);
const contraste = (a: number[], b: number[]) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const creme = canaux(jeton("--bg"));
/* Fond réel d'une carte : le blanc de la maquette à l'opacité `--gl-a`, posé
   sur le crème de la page. Le flou ne change pas la luminance moyenne. */
const alpha = Number(jeton("--gl-a"));
const verre = creme.map((c) => Math.round(alpha * 255 + (1 - alpha) * c));

for (const [role, nomJeton, fond] of [
  ["sur-titre de section", "--acc-ink", creme],
  ["intitulé de groupe", "--ink2", creme],
  ["titre de carte", "--ink", verre],
  ["« Lire » de la carte", "--acc-ink", verre],
] as const) {
  const mesure = contraste(canaux(jeton(nomJeton)), fond);
  assert.ok(
    mesure >= 4.5,
    `${role} : ${nomJeton} donne ${mesure.toFixed(2)}:1 sur son fond réel, il faut 4,5:1`,
  );
  /* Et le composant utilise bien ce jeton-là. */
  assert.ok(html.includes(`color:var(${nomJeton})`), `${role} doit être peint avec ${nomJeton}`);
}
/* `--acc` brut est le piège : la maquette l'écrit pour ces libellés, il échoue.
   Cette assertion garde la raison du seul écart assumé au relevé. */
assert.ok(
  contraste(canaux(jeton("--acc")), creme) < 4.5,
  "si --acc passait désormais 4,5:1, reprendre la couleur de la maquette telle quelle",
);
assert.doesNotMatch(html, /color:var\(--acc\)/, "--acc brut ne peint aucun texte de ce composant");

// ------------------------------------------------------ liens, et copie saine
assert.ok(!html.includes('href="#"'), "aucun lien inerte");
/* Chemin interne, et rien d'autre. La barre oblique finale n'est PAS exigée
   ici : `trailingSlash: true` est une option de `next.config.ts` que ce rendu
   hors Next n'applique pas, elle est reposée en production. */
for (const lien of html.matchAll(/<a [^>]*href="([^"]*)"/g)) {
  assert.match(lien[1], /^\/[^"#?]*$/, `chemin interne attendu, reçu « ${lien[1]} »`);
}
for (const interdit of [
  "régie", "intérim", "mise à disposition", "sans engagement", "clé en main",
  "sur mesure", "levier", "concrètement", "notamment", "incontournable",
  "découvrez", "Découvrez", "—",
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}

// ------------------------------------------------------------- rien à rendre
assert.equal(
  renderToStaticMarkup(<ListeMaillage groupes={[{ titre: "Vide", liens: [] }]} />),
  "",
  "sans aucun lien, le maillage ne rend rien plutôt qu'un titre orphelin",
);

console.log(
  `maillage vérifié : ${declarations(styleMaquetteCarte).size} déclarations de la carte relevées dans la maquette, ` +
    `cible tactile de ${hauteurCible}px, contrastes calculés sur le fond de verre composité.`,
);
