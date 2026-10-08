/**
 * Contrôle de la navigation, sans navigateur.
 *
 *   bun components/site/verification-entete.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Quatre
 * couplages qui se relâchent sans bruit sont vérifiés ici.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Entete from "@/components/site/Entete";
import MegaMenu from "@/components/site/MegaMenu";
import type { PanneauId } from "@/components/site/entete-donnees";

const inventaire: { url: string }[] = JSON.parse(
  readFileSync("docs/urls-site-actuel.json", "utf8"),
);
const connues = new Set(inventaire.map((entree) => entree.url));

const PANNEAUX: PanneauId[] = [
  "offres",
  "expertises",
  "preuves",
  "ressources",
  "apropos",
];

const site = renderToStaticMarkup(<Entete />);
const lp = renderToStaticMarkup(<Entete landingPage />);
const panneaux = PANNEAUX.map((panneau) =>
  renderToStaticMarkup(<MegaMenu panneau={panneau} libelle={panneau} />),
).join("");

// ------------------------------------------------- aucune URL inventée
// Le contrat l'exige : chaque entrée de menu pointe vers une URL de
// l'inventaire. Un slug qui change en base, ou une faute de frappe, produirait
// un 404 depuis la navigation de TOUTES les pages du site.
//
// La comparaison se fait sans le slash final, et c'est un constat, pas une
// tolérance : `next/link` retire le slash au rendu tant que `trailingSlash`
// vaut `false` dans `next.config.ts`. Les données, elles, restent canoniques,
// ce que vérifie l'assertion suivante.
const sansSlash = (chemin: string) =>
  chemin.length > 1 && chemin.endsWith("/") ? chemin.slice(0, -1) : chemin;
const canoniques = new Set([...connues].map(sansSlash));

const liens = new Set<string>();
for (const source of [site, lp, panneaux]) {
  for (const trouve of source.matchAll(/href="(\/[^"#]*)"/g)) {
    liens.add(trouve[1]);
  }
}
// Le tiroir n'est pas rendu au repos : ses cibles sont relues dans les données.
const donnees = readFileSync("components/site/entete-donnees.ts", "utf8");
const liensDonnees = [...donnees.matchAll(/href: "(\/[^"]*)"/g)].map(
  (trouve) => trouve[1],
);
for (const lien of liensDonnees) liens.add(lien);

assert.ok(liens.size > 60, `trop peu de liens relevés : ${liens.size}`);
for (const lien of liens) {
  assert.ok(
    canoniques.has(sansSlash(lien)),
    `URL hors inventaire dans la navigation : ${lien}`,
  );
}

// Les données portent la forme canonique du projet, slash final compris : si
// une entrée perdait son slash, elle partirait en redirection à chaque clic.
for (const lien of liensDonnees) {
  assert.ok(
    lien.endsWith("/"),
    `cible de menu sans slash final dans les données : ${lien}`,
  );
}

// ------------------------------------- le numéro de la LP reste sur la LP
// Interdit de copie non négociable. Les deux variantes partagent le même
// composant : une erreur de condition ferait fuiter le numéro publicitaire sur
// les 222 pages du site, ou l'inverse.
assert.ok(site.includes("04 78 33 72 05"), "numéro du site absent");
assert.ok(!site.includes("04 11 78 95 97"), "numéro de la LP sorti de la LP");
assert.ok(lp.includes("04 11 78 95 97"), "numéro de la LP absent de la LP");
assert.ok(!lp.includes("04 78 33 72 05"), "numéro du site présent sur la LP");

// --------------------------------------------- mega-menu atteignable au clavier
// Cinq entrées à panneau, chacune un vrai bouton qui déclare son état et la
// cible qu'il commande. Sans ces attributs, le menu redevient décoratif.
assert.equal(
  site.split('aria-controls="mg-megamenu"').length - 1,
  5,
  "une entrée de menu a perdu son aria-controls",
);
assert.equal(
  site.split('aria-expanded="false"').length - 1,
  6,
  "une entrée de menu ou le bouton de tiroir a perdu son aria-expanded",
);

// ------------------------------------------- pas de chemin deviné en secours
// « Diagnostic gratuit » n'a pas d'URL dans l'inventaire : l'entrée s'efface
// tant que l'appelant n'en fournit pas, elle ne retombe pas sur une page
// approchante.
const sansDiag = renderToStaticMarkup(
  <MegaMenu panneau="offres" libelle="Offres" />,
);
assert.ok(
  !sansDiag.includes("Diagnostic gratuit"),
  "l'entrée Diagnostic s'affiche sans cible fournie",
);
assert.ok(
  renderToStaticMarkup(
    <MegaMenu panneau="offres" libelle="Offres" hrefDiagnostic="/contact/" />,
  ).includes("Diagnostic gratuit"),
  "l'entrée Diagnostic ne s'affiche pas malgré une cible fournie",
);

// ------------------------------- les sur-titres des panneaux, au style près
// Relus dans l'autonome : 12 px de marge sous ceux d'« Offres », 14 sous ceux
// de « Ressources » et « À propos », orange partout. Le 08/10, les quatre
// derniers étaient à 12, et « Nos offres », devenu lien, passait au brun.
const autonome = readFileSync("maquette/site-final-autonome.html", "utf8").replace(/\\"/g, '"');
const echappe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SUR_TITRES = ["Nos offres", "Conception &amp; réalisation", "Par format", "Par situation", "L’entreprise", "Nos engagements"];
const styleSurTitre = (html: string, libelle: string) =>
  new RegExp(`<div style="([^"]*font:600 11px[^"]*)">(?:<a\\b[^>]*>)?${echappe(libelle)}<`).exec(html)?.[1];
for (const libelle of SUR_TITRES) {
  const attendu = styleSurTitre(autonome, libelle);
  assert.ok(attendu, `la maquette ne porte plus le sur-titre « ${libelle} »`);
  assert.equal(styleSurTitre(panneaux, libelle), attendu, `sur-titre « ${libelle} » : style différent de la maquette`);
}
// « Nos offres » est un lien dans le site : il garde la couleur de son sur-titre.
assert.match(readFileSync("components/site/megamenu/Offres.tsx", "utf8"), /href="\/offres\/" className=\{s\.lienSurTitre\}/);
assert.match(
  readFileSync("components/site/Entete.module.css", "utf8"),
  /\.lienSurTitre \{\s*color: inherit;\s*\}/,
  "« Nos offres » ne garde plus la couleur de son sur-titre",
);
assert.throws(
  () => assert.equal(styleSurTitre(panneaux.replace("margin-bottom:14px\">Par format", "margin-bottom:12px\">Par format"), "Par format"), styleSurTitre(autonome, "Par format")),
  "le contrôle des sur-titres laisse passer une marge de 12 px",
);

console.log(
  `navigation vérifiée : ${liens.size} liens, tous dans l'inventaire des 223 URL ; ` +
    `${SUR_TITRES.length} sur-titres de panneau au style de la maquette.`,
);
