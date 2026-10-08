/**
 * Contrôle de la page des engagements RSE, sans navigateur.
 *
 *   bun components/site/rse/verification-rse.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * CE QUI EST VÉRIFIÉ, et pourquoi chacune de ces choses se relâche sans bruit :
 *
 *  · un seul H1, et un meta title qui ne le duplique pas ;
 *  · aucun lien inerte : la maquette écrit « # » partout, et cinq cartes
 *    d'offre sont déjà parties en production ainsi ;
 *  · aucune classe Tailwind de couleur ni variante de thème sombre ;
 *  · les formulations interdites par le contrat, absentes ;
 *  · et surtout : les valeurs de la maquette, RELUES DANS LE FICHIER à chaque
 *    exécution. Aucune valeur attendue n'est écrite ici de mémoire. Les écarts
 *    voulus (trois lignes corrigées au nom des interdits de copie) sont déclarés
 *    par leur libellé : si un quatrième écart apparaît, le contrôle échoue.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import Rse, { metadata } from "@/app/rse/page";

// ---------------------------------------------------------------- la source
// L'écran RSE occupe les lignes 5672 à 5843 de la maquette rendue. On ne lit
// que cette tranche : le fichier entier pèse 1,5 Mo.
const PREMIERE_LIGNE = 5672;
const DERNIERE_LIGNE = 5843;

const maquette = readFileSync(
  fileURLToPath(new URL("../../../maquette/accueil-rendu.html", import.meta.url)),
  "utf8",
)
  .split("\n")
  .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
  .join("\n");

assert.ok(
  maquette.includes('data-screen-label="Engagements RSE"'),
  `la tranche ${PREMIERE_LIGNE}-${DERNIERE_LIGNE} de la maquette n'est plus l'écran RSE`,
);

const rendu = renderToStaticMarkup(<Rse />);

/** Texte comparable : balises retirées, entités décodées, espaces et apostrophes normalisés. */
function texte(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;|&#x22;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[’‘]/g, "'")
    .replace(/[  \s]+/g, " ")
    .trim();
}

const renduTexte = texte(rendu);

/** Toutes les captures d'un motif, ramenées au texte. */
function captures(motif: RegExp): string[] {
  return [...maquette.matchAll(motif)].map((trouvee) => texte(trouvee[1] ?? ""));
}

function porte(attendu: string, quoi: string): void {
  assert.ok(
    renduTexte.includes(attendu),
    `${quoi} absent du rendu : « ${attendu} »`,
  );
}

// ------------------------------------------------------- titres de la maquette
const h1Maquette = captures(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
assert.equal(h1Maquette.length, 1, "la maquette n'a plus exactement un H1");
porte(h1Maquette[0], "le H1 de la maquette");

const h2Maquette = captures(/<h2[^>]*>([\s\S]*?)<\/h2>/g);
assert.ok(h2Maquette.length >= 3, "les H2 de la maquette n'ont pas été trouvés");
for (const h2 of h2Maquette) porte(h2, "un H2 de la maquette");

// --------------------------------------------------------------- surtitres
const surtitres = captures(
  /text-transform:uppercase;color:var\(--acc\);margin-bottom:\d+px">([^<]+)</g,
);
assert.ok(surtitres.length >= 5, "les surtitres de la maquette ont changé de forme");
for (const surtitre of surtitres) porte(surtitre, "un surtitre de la maquette");

// ------------------------------------------------------ chiffre du panneau
const [chiffrePanneau] = captures(
  /clamp\(56px,6\.4vw,88px\)[^>]*>([^<]+)</g,
);
assert.ok(chiffrePanneau, "le grand chiffre du panneau n'a pas été trouvé");
porte(chiffrePanneau, "le grand chiffre du panneau");

// ------------------------------------------------ titres des quatre piliers
const titresPiliers = captures(
  /calc\(20px \* var\(--ts\)\) var\(--ft\)[^>]*>([^<]+)</g,
);
assert.equal(titresPiliers.length, 4, "la maquette ne porte plus quatre piliers");
for (const titre of titresPiliers) porte(titre, "un titre de pilier");

// --------------------------------------------------- indicateurs des piliers
/*
 * Chaque indicateur est une paire valeur + libellé. Les trois écarts voulus
 * portent sur DEUX de ces lignes, et ils sont déclarés ici par un fragment de
 * leur libellé : « moins de 45 min de trajet » est un délai chiffré
 * d'intervention, « 5 bassins d'emploi » reprend un compte d'agences erroné.
 * Toute autre absence fait échouer le contrôle, ce qui est le but : un
 * indicateur perdu en cours de portage ne doit pas passer pour un choix.
 */
const ECARTS_ASSUMES = ["de trajet moyen depuis", "bassins d'emploi"];

const indicateurs = [
  ...maquette.matchAll(
    /calc\(21px \* var\(--ts\)\)[^>]*>([^<]*)<\/span><span[^>]*>([^<]*)</g,
  ),
].map((trouvee) => ({
  valeur: texte(trouvee[1] ?? ""),
  libelle: texte(trouvee[2] ?? ""),
}));

assert.equal(indicateurs.length, 12, "la maquette ne porte plus douze indicateurs");

const absents = indicateurs.filter(
  (indicateur) => !renduTexte.includes(`${indicateur.valeur} ${indicateur.libelle}`),
);
assert.deepEqual(
  absents.map((indicateur) => indicateur.libelle),
  indicateurs
    .filter((indicateur) =>
      ECARTS_ASSUMES.some((fragment) => indicateur.libelle.includes(fragment)),
    )
    .map((indicateur) => indicateur.libelle),
  "les indicateurs absents du rendu ne sont pas exactement les écarts assumés",
);
assert.equal(absents.length, ECARTS_ASSUMES.length);

// ------------------------------------------------------- cas concret retrofit
const [titreCas] = captures(/clamp\(20px,2\.2vw,28px\)[^>]*>([^<]+)</g);
assert.ok(titreCas, "le titre du cas concret n'a pas été trouvé");
porte(titreCas, "le titre du cas concret");

const chiffresCas = [
  ...maquette.matchAll(
    /calc\(38px \* var\(--ts\)\)[^>]*>([^<]*)<\/div>\s*<div[^>]*>([^<]*)</g,
  ),
].map((trouvee) => `${texte(trouvee[1] ?? "")} ${texte(trouvee[2] ?? "")}`);
assert.equal(chiffresCas.length, 2, "le cas concret ne porte plus deux chiffres");
for (const chiffre of chiffresCas) porte(chiffre, "un chiffre du cas concret");

// ------------------------------------------------ pièces du dossier fournisseur
const pieces = [
  ...maquette.matchAll(
    /font:600 16px\/1\.35 var\(--ft\)[^>]*>([^<]*)<\/span><span[^>]*>([^<]*)</g,
  ),
].map((trouvee) => ({
  titre: texte(trouvee[1] ?? ""),
  texte: texte(trouvee[2] ?? ""),
}));
assert.equal(pieces.length, 5, "la liste du dossier fournisseur ne porte plus cinq pièces");
for (const piece of pieces) {
  porte(piece.titre, "un titre de pièce");
  // Le tiret cadratin de la première pièce devient une virgule : on ne compare
  // donc que la partie qui précède le tiret quand il y en a un.
  porte(piece.texte.split(/\s[–—]\s/)[0], "un texte de pièce");
}

// --------------------------------------------------------------- un seul H1
assert.equal(rendu.split("<h1").length - 1, 1, "la page ne porte pas un seul H1");

// ------------------------------------------- le meta title ne duplique pas le H1
const titreMeta = String(metadata.title);
assert.ok(titreMeta.length > 0, "la page n'exporte pas de meta title");
assert.notEqual(
  titreMeta,
  h1Maquette[0],
  "le meta title est identique au H1 : il doit nommer l'entreprise et le sujet, pas répéter la promesse",
);

// ------------------------------------------------------------ liens inertes
assert.ok(!rendu.includes('href="#"'), "un lien de la page RSE est rendu inerte");

// L'ancre visée par les deux appels à l'action doit exister dans le rendu.
assert.ok(
  rendu.includes('id="formulaire"'),
  "les appels à l'action visent #formulaire, aucun id de ce nom dans la page",
);

/*
 * Toutes les cibles de page, énumérées. Chacune a été vérifiée à 200 sur le
 * serveur de développement. L'énumération est volontairement fermée : c'est ce
 * qui fait échouer le contrôle quand une cible apparaît sans avoir été
 * vérifiée, et c'est le défaut qu'on répare ici. /confidentialite vient du
 * formulaire partagé, pas de cette page.
 */
const CIBLES_VERIFIEES = ["#formulaire", "/valeurs/", "/confidentialite/"];

/*
 * Le slash final est rétabli avant comparaison. Hors du serveur Next, `Link`
 * ignore le `trailingSlash: true` de `next.config.ts` et rend « /valeurs » :
 * le site servi, lui, rend bien « /valeurs/ » (vérifié sur le serveur de
 * développement). Comparer sans normaliser ferait échouer le contrôle sur une
 * différence qui n'existe que dans ce rendu isolé.
 */
const cibles = [...new Set([...rendu.matchAll(/href="([^"]*)"/g)].map((t) => t[1]))]
  // Les fichiers servis depuis `public` ne sont pas des pages.
  .filter((cible) => cible !== undefined && !/\.[a-z0-9]{2,5}$/i.test(cible))
  .map((cible) =>
    cible!.startsWith("/") && !cible!.endsWith("/") ? `${cible}/` : cible!,
  );
assert.deepEqual(
  cibles.sort(),
  [...CIBLES_VERIFIEES].sort(),
  "une cible de page n'est pas dans la liste des cibles vérifiées à 200",
);

// ------------------------------------------------------------ marges mobiles
// `app/globals.css` rattrape les marges sous 760px par un sélecteur d'attribut
// sur la largeur littérale. Quatre sections portées ici, plus le formulaire.
assert.equal(
  rendu.split("max-width:1200px").length - 1,
  5,
  "un conteneur de section a perdu sa largeur littérale de 1200px",
);

// ------------------------------------------------------------ rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(rendu),
  "un bloc est rendu avec une opacité nulle",
);

// ------------------------------------------- Tailwind d'échafaudage et thème sombre
for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  const valeur = classe[1] ?? "";
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      valeur,
    ),
    `classe Tailwind de couleur dans le rendu : ${valeur}`,
  );
  assert.ok(!/\bdark:/.test(valeur), `variante de thème sombre dans le rendu : ${valeur}`);
  assert.ok(
    !/\b(?:text|bg|border)-(?:white|black)\b/.test(valeur),
    `couleur hors charte dans le rendu : ${valeur}`,
  );
}

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "5 agences",
  "Cinq agences",
  "cinq agences",
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). Ni la maquette ni de capture
  // ne portent « +200 » sur cette page : il n'y est donc pas exigé.
  "clients réguliers",
  "80 réguliers",
  "sous 48",
  "sous 24",
  "45 min",
  "sept chiffres",
  "l'evier environnemental".replace("'evier", "evier"),
  "cle en main".replace("cle", "clé"),
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "écouvrez",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "à remplacer par vos relevés",
  "—",
  "–",
]) {
  assert.ok(!renduTexte.includes(interdit), `copie interdite dans le rendu : ${interdit}`);
}

console.log(
  `Page RSE : ${h1Maquette.length} H1, ${h2Maquette.length} H2, ${titresPiliers.length} piliers, ` +
    `${indicateurs.length - absents.length}/${indicateurs.length} indicateurs portés, ` +
    `${pieces.length} pièces, ${chiffresCas.length} chiffres du cas. Toutes les assertions passent.`,
);
