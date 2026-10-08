/**
 * Contrôle de l'écran « Marques maintenues », sans navigateur ni base.
 *
 *   bun components/site/marques/verification-marques.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * CE QUI LE REND REJOUABLE : aucune valeur attendue n'est écrite de mémoire.
 * Les sept familles, les soixante-sept constructeurs, leur ordre, le H1, le
 * chapeau et les deux libellés de bouton sont RELUS DANS
 * `maquette/accueil-rendu.html`, lignes 2877 à 2924, à chaque exécution. Si la
 * maquette change, ce contrôle le dit ; si une note de lecture s'était trompée,
 * elle n'aurait jamais été crue.
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import AppelConstructeur from "@/components/site/marques/AppelConstructeur";
import Familles from "@/components/site/marques/Familles";
import Ouverture from "@/components/site/marques/Ouverture";
import { FAMILLES, LOGOS_ECARTES } from "@/components/site/marques/marques-donnees";

const RACINE = fileURLToPath(new URL("../../../", import.meta.url));
const PREMIERE_LIGNE = 2877;
const DERNIERE_LIGNE = 2924;

/* ------------------------------------------------- la maquette, relue ici */

const maquette = readFileSync(
  `${RACINE}maquette/accueil-rendu.html`,
  "utf8",
)
  .split("\n")
  .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
  .join("\n");

assert.ok(
  maquette.includes('data-screen-label="Marques maintenues"'),
  `lignes ${PREMIERE_LIGNE} à ${DERNIERE_LIGNE} : ce n'est plus l'écran des marques, la maquette a bougé`,
);

/** Les entités HTML de la maquette, ramenées au texte. */
function texte(brut: string): string {
  return brut
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/** Les intitulés de famille, dans l'ordre de la maquette. */
const famillesMaquette = [
  ...maquette.matchAll(/letter-spacing:-\.02em">([^<]+)<\/div>/g),
].map((m) => texte(m[1]));

/** Les constructeurs, dans l'ordre, tels que les `title` des tuiles les nomment. */
const marquesMaquette = [...maquette.matchAll(/<span title="([^"]*)"/g)].map(
  (m) => texte(m[1]),
);

assert.equal(famillesMaquette.length, 7, "la maquette ne porte plus 7 familles");
assert.equal(
  marquesMaquette.length,
  67,
  "la maquette ne porte plus 67 constructeurs",
);

/* --------------------------------- les données du projet contre la maquette */

assert.deepEqual(
  FAMILLES.map((f) => f.titre),
  famillesMaquette,
  "les familles de marques-donnees.ts ne sont plus celles de la maquette",
);

assert.deepEqual(
  FAMILLES.flatMap((f) => f.marques.map((m) => m.nom)),
  marquesMaquette,
  "les constructeurs de marques-donnees.ts ne sont plus ceux de la maquette, ou ont changé d'ordre",
);

/* ------------------------------------------- les logos existent, ou n'existent pas
 *
 * Les deux sens comptent. Un chemin posé sur un fichier absent donne un cadre
 * cassé ; un `logo: null` sur un fichier désormais présent laisse un nom en
 * texte alors que l'image est là, et c'est ce second cas que personne ne
 * remarque. Le contrôle réclame alors le chemin, sauf pour les deux fichiers
 * écartés à la main parce qu'ils rendent le logo d'une autre société.
 */
for (const famille of FAMILLES) {
  for (const marque of famille.marques) {
    const attendu = `assets/fab/${marque.nom
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
    if (marque.logo) {
      assert.ok(
        existsSync(`${RACINE}public${marque.logo}`),
        `${marque.nom} : logo déclaré à ${marque.logo}, fichier absent du dépôt`,
      );
      assert.ok(
        !LOGOS_ECARTES.includes(marque.logo),
        `${marque.nom} : ${marque.logo} est dans LOGOS_ECARTES, il ne doit pas être posé`,
      );
    } else {
      const ext = [".png", ".svg", ".jpg", ".webp"].find((e) =>
        existsSync(`${RACINE}public/${attendu}${e}`),
      );
      const arrive = ext ? `/${attendu}${ext}` : null;
      assert.ok(
        !arrive || LOGOS_ECARTES.includes(arrive),
        `${marque.nom} : le fichier public${arrive} est arrivé, poser son chemin dans marques-donnees.ts`,
      );
    }
  }
}

/* Un chemin écarté qui ne désigne plus rien a été remplacé ou supprimé : la
   liste doit alors être relue, pas laissée à traîner. */
for (const ecarte of LOGOS_ECARTES) {
  assert.ok(
    existsSync(`${RACINE}public${ecarte}`),
    `${ecarte} n'existe plus, retirer la ligne de LOGOS_ECARTES et vérifier le logo rendu`,
  );
}

/* ------------------------------------------------------------- le rendu */

const ANCRE = "#formulaire";
const html = [
  renderToStaticMarkup(<Ouverture hrefAction={ANCRE} />),
  renderToStaticMarkup(<Familles />),
  renderToStaticMarkup(<AppelConstructeur hrefAction={ANCRE} />),
].join("");

/** Le texte rendu, normalisé : `&nbsp;` et apostrophe typographique compris. */
const rendu = html
  .replace(/<[^>]*>/g, " ")
  .replace(/&(?:#x27|#39|apos);/g, "'")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;|\u00a0/g, " ")
  .replace(/[’‘]/g, "'")
  .replace(/\s+/g, " ");

/* Aucun des deux fichiers écartés n'arrive dans le rendu. */
for (const ecarte of LOGOS_ECARTES) {
  assert.ok(
    !html.includes(ecarte),
    `${ecarte} est rendu alors qu'il porte le logo d'une autre société`,
  );
}

/* ------------------------------------------- un seul h1, titre différent du h1 */

assert.equal(
  (html.match(/<h1\b/g) ?? []).length,
  1,
  "la page des marques doit porter exactement un h1",
);

{
  const h1Maquette = texte(
    /<h1[^>]*>([^<]+)<\/h1>/.exec(maquette)?.[1] ??
      assert.fail("la maquette n'a plus de h1 sur cet écran"),
  );
  const h1Rendu = /<h1[^>]*>([^<]*)<\/h1>/
    .exec(html)?.[1]
    ?.replace(/&(?:#x27|#39|apos);/g, "'")
    .replace(/[’‘]/g, "'");
  assert.equal(
    h1Rendu,
    h1Maquette.replace(/[’‘]/g, "'"),
    "le h1 rendu n'est pas celui de la maquette",
  );

  /* Le titre de la page de résultats ne doit jamais répéter le h1. Il est relu
     dans `app/marques/page.tsx` plutôt que recopié ici. */
  const page = readFileSync(`${RACINE}app/marques/page.tsx`, "utf8");
  const titre = /const TITRE =\s*\n?\s*"([^"]+)"/.exec(page)?.[1];
  assert.ok(titre, "aucune constante TITRE lisible dans app/marques/page.tsx");
  assert.notEqual(
    titre,
    h1Maquette,
    "le meta title répète le h1, c'est interdit par le projet",
  );
  assert.ok(
    !titre.includes(h1Maquette),
    "le meta title contient le h1 mot pour mot",
  );
}

/* --------------------------------- la copie portée, relue dans la maquette */

{
  const chapeau = texte(
    /<p style="font:400 17px\/1\.65 var\(--fb\)[^"]*">([^<]+)<\/p>/.exec(
      maquette,
    )?.[1] ?? assert.fail("le chapeau de l'écran n'est plus à sa place"),
  );
  const attendu = chapeau.replace(/\u00a0/g, " ").replace(/[’‘]/g, "'");
  assert.ok(
    rendu.includes(attendu),
    `le chapeau de la maquette n'est pas dans le rendu : « ${attendu} »`,
  );
}

{
  /* La phrase du panneau de clôture, et les deux libellés de bouton. */
  const panneau = texte(
    /color:#fff;max-width:34ch">([^<]+)<\/div>/.exec(maquette)?.[1] ??
      assert.fail("la phrase du panneau de clôture n'est plus à sa place"),
  );
  assert.ok(
    rendu.includes(panneau.replace(/\u00a0/g, " ").replace(/[’‘]/g, "'")),
    `la phrase du panneau manque au rendu : « ${panneau} »`,
  );

  const libelles = [
    ...maquette.matchAll(/style-hover="[^"]*">([^<]+)<\/a>/g),
  ].map((m) => texte(m[1]));
  assert.equal(libelles.length, 2, "la maquette n'a plus deux boutons orange");
  for (const libelle of libelles) {
    assert.ok(rendu.includes(libelle), `libellé de bouton manquant : ${libelle}`);
  }
  assert.equal(
    (html.match(new RegExp(`>${libelles[0]}<`, "g")) ?? []).length,
    2,
    "les deux boutons « Décrire mon besoin » de la maquette ne sont pas tous les deux rendus",
  );
}

/* Les soixante-sept constructeurs sont tous rendus, logo ou nom en texte. */
for (const nom of marquesMaquette) {
  assert.ok(
    html.includes(`title="${nom.replace(/&/g, "&amp;")}"`),
    `constructeur absent du rendu : ${nom}`,
  );
}

/* -------------------------------------------------------- liens inertes */

assert.ok(
  !html.includes('href="#"'),
  'un lien de la page des marques est rendu inerte (href="#")',
);

/* Aucun lien vers une cible morte : seuls `/`, `/expertises/` et l'ancre du
   formulaire sont posés, tous vérifiés à 200 sur le serveur local. `/contact/`
   et `/expertises/marques/` répondent 404, ils ne sont pas posés.
 *
 * LE SLASH FINAL est rajouté avant la comparaison : hors d'une construction
 * Next, `next/link` normalise « /expertises/ » en « /expertises », parce qu'il
 * ne lit pas le `trailingSlash: true` de `next.config.ts`. C'est un artefact de
 * ce contrôle, pas du rendu servi, et l'assertion suivante le vérifie à la
 * source. */
for (const href of [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])) {
  const cible = /^\/[^#?]*[^/#?]$/.test(href) ? `${href}/` : href;
  assert.ok(
    ["/", "/expertises/", ANCRE, "tel:+33478337205"].includes(cible),
    `lien non attendu sur la page des marques : ${href}`,
  );
}

assert.ok(
  readFileSync(
    `${RACINE}components/site/marques/Ouverture.tsx`,
    "utf8",
  ).includes('path: "/expertises/"'),
  "le fil d'Ariane doit viser /expertises/ avec son slash final, forme canonique du site",
);

/* ------------------------------------------ échafaudage et mode sombre */

for (const classe of [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1])) {
  assert.ok(
    !/\bdark:/.test(classe),
    `variante dark: rendue, le site n'a pas de mode sombre : ${classe}`,
  );
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classe,
    ),
    `couleur Tailwind rendue au lieu d'un jeton de la charte : ${classe}`,
  );
}

/* --------------------------------------------- interdits de copie du contrat */

for (const interdit of [
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). Ni la maquette ni de capture
  // ne portent « +200 » sur cette page : il n'y est donc pas exigé.
  "clients réguliers",
  "80 réguliers",
  "5 agences",
  "cinq agences",
  "sous 24 h",
  "sous 48 h",
  "sous 2 h",
  "sous 4 h",
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

/* ------------------------------------------------------- rien d'invisible */

assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc de la page des marques est rendu avec une opacité nulle",
);

console.log(
  `Marques : ${famillesMaquette.length} familles, ${marquesMaquette.length} constructeurs,` +
    ` ${FAMILLES.flatMap((f) => f.marques).filter((m) => m.logo).length} logos présents,` +
    ` ${FAMILLES.flatMap((f) => f.marques).filter((m) => !m.logo).length} rendus en texte.`,
);
console.log("Marques : toutes les assertions passent.");
