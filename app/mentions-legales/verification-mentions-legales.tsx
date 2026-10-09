/**
 * Contrôle de la page des mentions légales, sans navigateur.
 *
 *   bun app/mentions-legales/verification-mentions-legales.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, jamais recopiée de mémoire : le bloc est localisé par son marqueur
 * `sc-if value="{{ isLegal }}"`, pas par un numéro de ligne, qui bougerait au
 * premier ajout dans la maquette.
 *
 * Ce que ce contrôle attrape, et qui part en production sans bruit sur une page
 * juridique : un emplacement `[forme juridique]` de la maquette recopié tel
 * quel, une déclaration de style perdue en route, le renvoi inerte `href="#"`
 * de la maquette, un meta title devenu identique au H1.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import MentionsLegales, { metadata } from "@/app/mentions-legales/page";

const html = renderToStaticMarkup(<MentionsLegales />);

/* --------------------------------------------- le bloc de la maquette, relu */

const maquette = readFileSync("maquette/accueil-rendu.html", "utf8");
const debut = maquette.indexOf('<sc-if value="{{ isLegal }}"');
assert.ok(debut > 0, "bloc `isLegal` introuvable dans la maquette");
const fin = maquette.indexOf("</sc-if>", debut);
assert.ok(fin > debut, "fin du bloc `isLegal` introuvable dans la maquette");
const bloc = maquette.slice(debut, fin);

/**
 * Texte comparable.
 *
 * Les parenthèses et le tiret cadratin sont RETIRÉS des deux côtés, et c'est
 * volontaire : le contrat interdit le tiret cadratin, la maquette en met deux
 * dans « ce site — textes, ... — est protégé », et la correction retenue est
 * une paire de parenthèses. Normaliser les deux permet de vérifier que la
 * phrase est portée mot pour mot, sans réintroduire le caractère interdit.
 * Même raison pour l'apostrophe : la maquette écrit `'`, le site écrit `’`.
 */
function normalise(valeur: string): string {
  return valeur
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ —–()]/g, " ")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const texteMaquette = normalise(bloc);
const texteRendu = normalise(html);

/* ------------------------------------------- la copie vient de la maquette */

// Les titres, la date et les phrases juridiques entières : chaque fragment est
// cherché DANS la maquette. Un paragraphe réécrit échoue ici.
const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
assert.ok(h1, "aucun h1 rendu");
assert.ok(
  texteMaquette.includes(normalise(h1)),
  `le h1 « ${normalise(h1)} » n'est pas celui de la maquette`,
);

const titresRendus = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((t) =>
  normalise(t[1]),
);
assert.equal(titresRendus.length, 5, "la maquette porte cinq sections légales");
for (const titre of titresRendus) {
  assert.ok(texteMaquette.includes(titre), `titre de section absent de la maquette : ${titre}`);
}

// Les ancres de la maquette, et le sommaire qui les vise.
for (const ancre of ["l1", "l2", "l3", "l4", "l5"]) {
  assert.ok(bloc.includes(`id="${ancre}"`), `ancre ${ancre} absente de la maquette`);
  assert.ok(html.includes(`id="${ancre}"`), `ancre ${ancre} absente du rendu`);
  assert.ok(html.includes(`href="#${ancre}"`), `le sommaire ne vise plus #${ancre}`);
}

// Les deux paragraphes de prose que la maquette rédige entièrement. Ils sont
// extraits du bloc, pas écrits ici : si la maquette change, l'attendu change.
for (const marqueur of ["droit de la propriété intellectuelle", "titre indicatif"]) {
  const paragraphe = [...bloc.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((t) => normalise(t[1]))
    .find((t) => t.includes(marqueur));
  assert.ok(paragraphe, `paragraphe « ${marqueur} » introuvable dans la maquette`);
  assert.ok(
    texteRendu.includes(paragraphe),
    `paragraphe non porté mot pour mot : ${paragraphe.slice(0, 70)}...`,
  );
}

// L'adresse du siège. LA MAQUETTE ET LE RENDU DIVERGENT VOLONTAIREMENT :
// la page légale de la maquette écrit encore Limonest, et Mehdi a tranché le
// 07/10 au soir « le siège est à Écully ». Les deux côtés sont vérifiés : le
// jour où la maquette est corrigée, cette exception tombe et le dit.
assert.ok(
  texteMaquette.includes("1 rue des Vergers, Bâtiment 3, 69760 Limonest, France"),
  "la maquette ne porte plus Limonest : l'exception du 07/10 n'a plus d'objet, la retirer",
);
assert.ok(
  texteRendu.includes("129 chemin du Moulin Carron, 69130 Écully, France"),
  "le siège de Limonest (décision de Mehdi du 07/10) n'est pas rendu",
);
assert.ok(
  !texteRendu.includes("Limonest"),
  "Limonest est rendu : le siège est à Écully depuis la décision du 07/10",
);

// Le numéro du site, jamais celui de la landing page.
assert.ok(html.includes("04 78 33 72 05"), "numéro du site absent");
assert.ok(!html.includes("04 11 78 95 97"), "numéro de la landing page rendu sur le site");

/* ------------------------------------ aucun emplacement de la maquette recopié */

// La maquette écrit ses valeurs légales entre crochets. Les recopier publierait
// une mention légale fausse, ce qui est pire qu'absente.
const emplacements = [...bloc.matchAll(/\[[^\]<>]+\]/g)].map((t) => t[0]);
assert.ok(emplacements.length >= 8, `trop peu d'emplacements repérés : ${emplacements.length}`);
for (const emplacement of new Set(emplacements)) {
  assert.ok(!html.includes(emplacement), `emplacement de la maquette recopié : ${emplacement}`);
}
assert.ok(!html.includes("entre crochets"), "le bandeau parle encore de crochets qui ne sont plus là");
assert.ok(
  (html.match(/à compléter/g) ?? []).length >= 12,
  "les valeurs non renseignées doivent porter « à compléter », pas rester muettes",
);

// Le crédit de cartographie est écarté : la carte de France de la maquette
// n'est pas portée, le contrat interdisant d3 et topojson. Vérifié par
// l'absurde, comme dans `app/verification-introuvable.tsx` : si la maquette
// perdait ce crédit, cette assertion le dirait et le commentaire du composant
// n'aurait plus de raison d'être.
assert.ok(texteMaquette.includes("Natural Earth"), "la maquette ne crédite plus Natural Earth");
for (const absent of ["Natural Earth", "world-atlas", "Cartographie"]) {
  assert.ok(!texteRendu.includes(absent), `crédit d'une source non servie : ${absent}`);
}

/* ------------------------------------------- toutes les valeurs de style portées */

// Chaque déclaration en ligne de la maquette doit se retrouver dans le rendu.
// C'est la vérification de fidélité la plus fine possible sans navigateur, et
// elle attrape le cas courant : une valeur « arrondie » à la lecture.
const declarations = new Set<string>();
for (const attribut of bloc.matchAll(/ style="([^"]*)"/g)) {
  for (const brute of attribut[1].split(";")) {
    const declaration = brute.trim();
    if (declaration) declarations.add(declaration);
  }
}
assert.ok(declarations.size >= 25, `trop peu de déclarations lues : ${declarations.size}`);
for (const declaration of declarations) {
  assert.ok(
    html.includes(declaration),
    `déclaration de la maquette absente du rendu : ${declaration}`,
  );
}

/* ------------------------------------------------------- liens et cibles */

// La maquette renvoie vers la politique de confidentialité par un `href="#"`,
// sa navigation étant interne à l'éditeur. Poser un lien mort sur une page citée
// par les 225 autres est exactement le défaut qu'on répare.
assert.ok(bloc.includes('href="#"'), "la maquette ne porte plus de renvoi inerte");
assert.ok(!html.includes('href="#"'), "un lien de la page est rendu inerte (href=\"#\")");

// CHAQUE CIBLE INTERNE POSÉE DOIT EXISTER, vérifié sans serveur : une route
// sous `app/` ET une ligne dans l'inventaire du site servi. Les deux, parce
// qu'une route hors inventaire sortirait du plan du site, et une ligne sans
// route répondrait 404. La liste n'est pas écrite ici : elle est LUE dans le
// rendu, donc tout lien ajouté plus tard passe par ce contrôle.
//
// Comparaison SANS le slash final, comme dans `app/verification-introuvable.tsx`
// et `components/site/verification-entete.tsx` : hors du moteur de Next,
// `next/link` le retire au rendu. Le site servi pose `trailingSlash: true`, donc
// la forme canonique part bien avec son slash, et c'est la SOURCE qui en
// répond.
const sansSlash = (chemin: string) =>
  chemin.length > 1 && chemin.endsWith("/") ? chemin.slice(0, -1) : chemin;

const inventaire: { url: string; title: string; description: string }[] = JSON.parse(
  readFileSync("docs/urls-site-actuel.json", "utf8"),
);
const connues = new Set(inventaire.map((entree) => sansSlash(entree.url)));
const source = readFileSync("app/mentions-legales/page.tsx", "utf8");

const cibles = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((t) => sansSlash(t[1]));
assert.ok(cibles.length >= 1, "le renvoi de la maquette vers la confidentialité a disparu");
for (const cible of cibles) {
  assert.ok(existsSync(`app${cible}/page.tsx`), `cible sans route : ${cible}/`);
  assert.ok(connues.has(cible), `cible hors inventaire du site servi : ${cible}/`);
  assert.ok(source.includes(`"${cible}/"`), `la source doit porter la forme canonique ${cible}/`);
}
// `/politique-de-confidentialite/` est une 301 depuis le site WordPress : la
// viser coûterait une redirection à chaque clic et à chaque passage de robot.
// Même raison que dans `components/formulaire/FormulaireContact.tsx`.
assert.ok(
  cibles.includes("/confidentialite"),
  "le renvoi vers la politique de confidentialité n'est pas posé",
);
assert.ok(
  !html.includes("/politique-de-confidentialite"),
  "le renvoi passe par une redirection au lieu du chemin canonique",
);

// Les seules cibles du rendu : les cinq ancres de la page, et ce renvoi.
for (const lien of [...html.matchAll(/href="([^"]*)"/g)].map((t) => t[1])) {
  assert.ok(
    /^#l[1-5]$/.test(lien) || cibles.includes(sansSlash(lien)),
    `cible inattendue : ${lien}`,
  );
}

/* ------------------------------------------------------------ référencement */

assert.ok(typeof metadata.title === "string", "la page doit exporter un meta title");
assert.notEqual(
  metadata.title,
  normalise(h1),
  "le meta title ne doit pas répéter le H1 : il se lit dans la page de résultats",
);
assert.equal(html.match(/<h1[\s>]/g)?.length, 1, "la page doit porter un seul h1");

// Le titre et la description sont ceux de l'inventaire du site servi, relu plus bas.
const ligne = inventaire.find((entree) => entree.url === "/mentions-legales/");
assert.ok(ligne, "/mentions-legales/ absent de docs/urls-site-actuel.json");
assert.equal(metadata.title, ligne.title, "meta title divergent de l'inventaire");
assert.equal(metadata.description, ligne.description, "description divergente de l'inventaire");

/* ------------------------------------------- charte, pas d'échafaudage */

for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?\d*\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur rendue : ${classe[1]}`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante « dark: » rendue alors que le site n'a pas de mode sombre : ${classe[1]}`,
  );
}
assert.ok(html.includes('class="mg-site"'), "sans `mg-site`, le mobile reste au gabarit bureau");
assert.ok(html.includes('class="mg-r2"'), "sans `mg-r2`, les deux colonnes ne tombent pas sous 900px");
// Les marges mobiles de `app/globals.css` visent `max-width:1200px` littéral.
assert.equal(
  html.split("max-width:1200px").length - 1,
  2,
  "un conteneur de section a perdu sa largeur littérale de 1200px",
);

/* ------------------------------------------- interdits de copie du contrat */

for (const interdit of [
  "agences en France",
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). Ni la maquette ni de capture
  // ne portent « +200 » sur cette page : il n'y est donc pas exigé.
  "clients réguliers",
  "80 réguliers",
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
  "—",
  "–",
]) {
  assert.ok(!html.includes(interdit), `copie interdite : ${interdit}`);
}
// Aucun délai chiffré d'intervention : seul « rappel dans l'heure » est permis.
assert.ok(
  !/sous\s+\d+\s*(?:h|heures?|jours?)/i.test(texteRendu),
  "un délai chiffré d'intervention est rendu",
);
// Aucun prix.
assert.ok(!/\d\s*€/.test(texteRendu), "un montant est rendu sur la page");

console.log(
  `Mentions légales : ${declarations.size} déclarations de la maquette portées, ` +
    `${new Set(emplacements).size} emplacements laissés à compléter, aucun lien mort.`,
);
