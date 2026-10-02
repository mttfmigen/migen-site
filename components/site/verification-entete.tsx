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

console.log(
  `navigation vérifiée : ${liens.size} liens, tous dans l'inventaire des 223 URL.`,
);
