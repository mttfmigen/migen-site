/**
 * Contrôle de la navigation, sans navigateur.
 *
 *   bun components/site/verification-entete.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Quatre
 * couplages qui se relâchent sans bruit sont vérifiés ici.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Entete from "@/components/site/Entete";
import MegaMenu from "@/components/site/MegaMenu";
import type { PanneauId } from "@/components/site/entete-donnees";

/**
 * L'INVENTAIRE DU NOUVEAU SITE, et non celui de l'ancien.
 *
 * CE QUI A CHANGÉ, le 12/10, et pourquoi. Cette porte comparait les cibles du
 * menu à `docs/urls-site-actuel.json`, les 223 URL de l'ANCIEN site Astro. Elle
 * répondait donc à la question « cette adresse existe-t-elle sur le site qu'on
 * remplace ? », utile pendant la migration, fausse depuis que le nouveau site
 * porte des pages que l'ancien n'avait pas.
 *
 * Elle est devenue ROUGE sur une correction JUSTE. Full service pointait sur
 * `/offres/maintenance-externalisee/`, qui répond 301 : le menu faisait donc
 * rebondir le visiteur depuis les 248 pages du site. Corrigé en
 * `/offres/full-service/`, qui répond 200 en production, et qui n'est pas dans
 * l'inventaire de l'ancien site. La porte refusait la bonne adresse.
 *
 * LA RÉFÉRENCE JUSTE, en deux morceaux, parce que le site a deux sortes de
 * pages : les 248 entrées de `maquette/contenu/site/index.json`, servies par la
 * route attrape-tout, et les routes STATIQUES de `app/`, que l'index ne
 * contient pas (`/contact/`, `/valeurs/`, `/carriere/`, `/plan-du-site/`…).
 * Oublier le second morceau rendrait la porte rouge sur `/contact/`, la cible
 * de l'appel à l'action de l'en-tête.
 *
 * Les routes statiques sont LUES SUR LE DISQUE, jamais écrites à la main : une
 * liste recopiée se périme en silence le jour où une route est ajoutée.
 */
const index: { url?: string }[] = JSON.parse(
  readFileSync("maquette/contenu/site/index.json", "utf8"),
);

/** Les routes statiques de `app/`, déduites de l'arborescence. */
function routesStatiques(dossier = "app", prefixe = "/"): string[] {
  const trouvees: string[] = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (!entree.isDirectory()) continue;
    if (entree.name === "api") continue;
    // Un segment dynamique n'est pas une adresse : la route attrape-tout est
    // servie par l'index des 248 pages, pas par l'arborescence.
    if (entree.name.startsWith("[")) continue;
    /* UN GROUPE DE ROUTE, `(nom)`, NE PARAÎT PAS DANS L'ADRESSE mais contient
       bien des pages. Première version : je sautais le dossier entier, donc
       `/lp` restait introuvable et la porte refusait la barre de la landing
       page. Il faut descendre dedans en gardant le préfixe du parent. */
    if (entree.name.startsWith("(")) {
      trouvees.push(...routesStatiques(`${dossier}/${entree.name}`, prefixe));
      continue;
    }
    const chemin = `${dossier}/${entree.name}`;
    const url = `${prefixe}${entree.name}/`;
    if (existsSync(`${chemin}/page.tsx`)) trouvees.push(url);
    trouvees.push(...routesStatiques(chemin, url));
  }
  return trouvees;
}

const statiques = routesStatiques();

/**
 * Les chemins servis par RÉÉCRITURE, lus dans `next.config.ts` : des pages
 * servies sous le domaine sans dossier `app/` ni ligne d'index, comme
 * `/diagnostic-zero-arret/` (l'outil, réécrit vers son propre déploiement).
 * Le tiroir de la maquette mobile v2 y mène (« Diagnostic gratuit ») : sans
 * cette lecture, la porte refusait une adresse qui répond 200, celle-là même
 * que le pied de page sert déjà et que `verification-pied-de-page.tsx`
 * demande à chaque exécution.
 */
const reecrites = [
  ...readFileSync("next.config.ts", "utf8").matchAll(
    /source:\s*"(\/[^":]+)\/:[^"]*"/g,
  ),
].map((trouve) => `${trouve[1]}/`);
assert.ok(
  reecrites.includes("/diagnostic-zero-arret/"),
  "la réécriture /diagnostic-zero-arret/ n'est plus lue dans next.config.ts",
);

const connues = new Set<string>([
  "/",
  ...index.map((entree) => entree.url).filter((url): url is string => typeof url === "string"),
  ...statiques,
  ...reecrites,
]);

assert.ok(
  statiques.length >= 12,
  `trop peu de routes statiques relevées dans app/ : ${statiques.length}. ` +
    "La lecture du disque est cassée, et la porte s'apprête à refuser des " +
    "adresses valides.",
);
assert.ok(
  connues.size >= 248,
  `inventaire trop court : ${connues.size} adresses. L'index des 248 pages ` +
    "n'a pas été lu, et la porte refuserait presque tout le menu.",
);

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
    `URL hors inventaire dans la navigation : ${lien}. L'inventaire tient ` +
      `les 248 pages de l'index, les ${statiques.length} routes statiques de ` +
      `app/ et ${reecrites.length} réécriture(s) de next.config.ts.`,
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
/* Depuis le 14/10, le panneau Ressources suit le hub /ressources/ (maquette
   Ressources v2) : la colonne « À la une » s'ajoute, au dessin du sur-titre
   « Par format » de l'autonome. « Par format » reste servi, au mot de
   l'autonome (le hub titre la même colonne « Format ») : un premier jet le
   renommait « Entreprises » et retirait ce texte du DOM. */
const RENOMMES: Record<string, readonly string[]> = { "Par format": ["Par format", "À la une"] };
for (const libelle of SUR_TITRES) {
  const attendu = styleSurTitre(autonome, libelle);
  assert.ok(attendu, `la maquette ne porte plus le sur-titre « ${libelle} »`);
  for (const servi of RENOMMES[libelle] ?? [libelle]) {
    assert.equal(styleSurTitre(panneaux, servi), attendu, `sur-titre « ${servi} » : style différent de la maquette`);
  }
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
  `navigation vérifiée : ${liens.size} liens, tous dans l'inventaire du site (${connues.size} adresses : l'index des pages, les ${statiques.length} routes statiques et ${reecrites.length} réécriture(s)) ; ` +
    `${SUR_TITRES.length} sur-titres de panneau au style de la maquette.`,
);
