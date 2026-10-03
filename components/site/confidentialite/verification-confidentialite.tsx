/**
 * Contrôle de la page /confidentialite/, sans navigateur.
 *
 *   bun components/site/confidentialite/verification-confidentialite.tsx
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, jamais écrite de mémoire : le contrôle ne connaît que des CLÉS
 * courtes (« Prospects », « CNIL »), et va chercher dans la maquette la phrase
 * ou la déclaration de style qui les porte. Si la maquette change une durée ou
 * un rayon, ce contrôle échoue au lieu de valider une page devenue infidèle.
 *
 * Il vérifie aussi l'inverse, et c'est le point le plus important : les trois
 * affirmations de la maquette que le code DÉMENT doivent être absentes du rendu
 * (voir l'en-tête de PolitiqueConfidentialite.tsx). Cette page est la cible de
 * la mention RGPD de chaque formulaire du site, une phrase fausse ici est fausse
 * partout.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { FINALITES, LIBELLES } from "@/lib/consentement";
import PolitiqueConfidentialite, {
  CHEMIN_MENTIONS,
  TITRE_H1,
  TITRE_SEO,
} from "@/components/site/confidentialite/PolitiqueConfidentialite";

/** L'écran « Confidentialité » de la maquette. */
const PREMIERE_LIGNE = 7799;
const DERNIERE_LIGNE = 7851;

const MAQUETTE = fileURLToPath(
  new URL("../../../maquette/accueil-rendu.html", import.meta.url),
);

const ecran = readFileSync(MAQUETTE, "utf8")
  .split("\n")
  .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
  .join("\n");

assert.ok(
  ecran.includes('data-screen-label="Confidentialité"'),
  `lignes ${PREMIERE_LIGNE} à ${DERNIERE_LIGNE} : ce n'est plus l'écran ` +
    "« Confidentialité ». La maquette a bougé, relire les bornes.",
);

const rendu = renderToStaticMarkup(<PolitiqueConfidentialite />);

/**
 * Texte comparable : entités décodées, balises remplacées par une espace (sans
 * quoi deux mots de part et d'autre d'un `<strong>` se colleraient), espaces
 * insécables ramenées à l'espace ordinaire, blancs resserrés.
 */
function texte(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;|&#39;|&#x27;/g, "'")
    .replace(/&laquo;|&raquo;/g, "«")
    .replace(/\s+/g, " ")
    .trim();
}

const texteRendu = texte(rendu);

/*
 * Les phrases de la maquette, découpées PAR PARAGRAPHE puis par point. Le
 * découpage au seul point ne suffit pas : les lignes à coche de la maquette
 * n'ont pas de point final, elles se colleraient au paragraphe suivant et
 * aucune phrase ne serait retrouvable.
 */
const phrases = [...ecran.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
  .flatMap((paragraphe) => texte(paragraphe[1]).split(/(?<=\.)\s+/))
  .map((phrase) => phrase.trim())
  .filter(Boolean);

/** La phrase de la maquette qui porte cette clé. Une seule, sinon la clé est trop vague. */
function phraseMaquette(cle: string): string {
  const trouvees = phrases.filter((phrase) => phrase.includes(cle));
  assert.equal(
    trouvees.length,
    1,
    `clé « ${cle} » : ${trouvees.length} phrases dans la maquette, il en faut une`,
  );
  return trouvees[0];
}

/** La valeur du premier attribut `style` de la maquette qui porte cette clé. */
function styleMaquette(cle: string): string {
  const trouvees = [...ecran.matchAll(/style="([^"]+)"/g)]
    .map((trouvaille) => trouvaille[1])
    .filter((declaration) => declaration.includes(cle));
  assert.ok(
    trouvees.length > 0,
    `clé de style « ${cle} » : introuvable dans la maquette`,
  );
  return trouvees[0];
}

// ------------------------------------------------- le texte porté mot pour mot
for (const cle of [
  "rue des Vergers",
  "Via les candidatures",
  "Teamtailor",
  "donnée sensible",
  "Prospects",
  "Candidatures non retenues",
  "Documents contractuels",
  "droit d'accès",
  "CNIL",
  "strictement nécessaires",
  "qu'après acceptation",
  "modifier votre choix",
]) {
  const attendue = phraseMaquette(cle);
  assert.ok(
    texteRendu.includes(attendue),
    `phrase de la maquette absente du rendu :\n  ${attendue}`,
  );
}

// ----------------------------------------------- titres, sommaire, ancres
const h1Maquette = texte(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(ecran)?.[1] ?? "");
assert.equal(
  h1Maquette,
  TITRE_H1,
  "le H1 porté ne dit plus ce que dit celui de la maquette",
);

const sousTitre = texte(
  /<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/.exec(ecran)?.[1] ?? "",
);
assert.ok(
  sousTitre.length > 0 && texteRendu.includes(sousTitre),
  `la ligne de date de la maquette est absente du rendu : « ${sousTitre} »`,
);

// Le sommaire de la maquette et ses six cibles. Chaque entrée doit être un H2
// du rendu, portant la même ancre : un sommaire qui pointe dans le vide est le
// même défaut que la page 404 qu'on répare.
const entrees = [...ecran.matchAll(/href="#(p\d)"[^>]*>([\s\S]*?)<\/a>/g)].map(
  (trouvaille) => ({ ancre: trouvaille[1], libelle: texte(trouvaille[2]) }),
);
assert.equal(entrees.length, 6, "la maquette ne propose plus six parties");

for (const { ancre, libelle } of entrees) {
  assert.ok(
    rendu.includes(`href="#${ancre}"`),
    `le sommaire ne mène plus à #${ancre}`,
  );
  const titre = new RegExp(`<h2 id="${ancre}"[^>]*>([\\s\\S]*?)</h2>`).exec(
    rendu,
  );
  assert.ok(titre, `aucun titre de niveau 2 ne porte l'ancre #${ancre}`);
  assert.equal(
    texte(titre[1]),
    libelle,
    `l'entrée « ${libelle} » du sommaire et son titre ont divergé`,
  );
}

// ------------------------------------------------- un seul H1, titre ≠ H1
assert.equal(
  rendu.split("<h1").length - 1,
  1,
  "la page doit porter exactement un titre de niveau 1",
);
assert.notEqual(
  TITRE_SEO,
  TITRE_H1,
  "le meta title ne doit jamais reprendre le H1 : l'un se lit dans les " +
    "résultats de recherche, l'autre sur la page",
);

// ---------------------------------------------- mise en forme de la maquette
for (const cle of [
  "grid-template-columns:.32fr .68fr",
  "position:sticky;top:110px",
  "max-width:72ch",
  "padding-top:96px",
  "max-width:22ch",
  "padding:70px 40px 0",
  "padding:48px 0 var(--sec)",
  "padding:0 40px",
  "scroll-margin-top:100px",
  "background:var(--acc-w)",
  "height:var(--sec)",
  "gap:11px",
  "color:var(--acc);flex:none",
  "font:400 16px/1.75 var(--fb)",
  "background:var(--line)",
]) {
  const declaration = styleMaquette(cle);
  assert.ok(
    rendu.includes(declaration),
    `déclaration de la maquette non reproduite :\n  ${declaration}`,
  );
}

// ------------------------------------------ les quatre finalités du bandeau
// La page annonce les finalités soumises au consentement. Elles sont lues dans
// `lib/consentement.ts`, la constante que le bandeau affiche : une finalité
// ajoutée là doit apparaître ici, et ses destinataires avec elle. Sans cette
// assertion, le jour où une cinquième finalité arrive, la page mentirait.
for (const finalite of FINALITES) {
  assert.ok(
    texteRendu.includes(LIBELLES[finalite].titre),
    `finalité « ${LIBELLES[finalite].titre} » absente de la page`,
  );
  for (const destinataire of LIBELLES[finalite].destinataires) {
    assert.ok(
      texteRendu.includes(destinataire),
      `destinataire « ${destinataire} » de la finalité « ${finalite} » non nommé`,
    );
  }
}

// ---------------------------------- ce que la maquette affirme et que le code dément
// La maquette nomme quatre champs que le formulaire n'a pas (« localisation du
// site, nature du besoin, délai souhaité et volume estimé », voir CHAMPS_CONTACT
// dans components/formulaire/validation.ts). Cette phrase ne doit pas revenir.
{
  const champsInventes = phraseMaquette("Via le formulaire");
  assert.ok(
    !texteRendu.includes(champsInventes),
    "la liste de champs de la maquette est revenue dans la page : elle nomme " +
      "des champs que le formulaire ne collecte pas",
  );
}

// Le partage HubSpot / table `leads` est le fait structurant du traitement, et
// la maquette ne le dit pas. Il doit être dit, sinon la mention RGPD du
// formulaire renvoie vers une page muette sur le destinataire de l'identité.
assert.ok(
  texteRendu.includes("HubSpot"),
  "la page ne nomme pas HubSpot, destinataire de l'identité du contact",
);

// --------------------------------------------- liens inertes et échafaudage
assert.ok(
  !rendu.includes('href="#"'),
  'un lien de la page est rendu inerte (href="#")',
);

// La maquette écrit sa seule cible externe à l'article en `href="#"`, avec un
// gestionnaire de clic interne à son éditeur. Elle doit mener quelque part.
assert.ok(
  ecran.includes("goLegal"),
  "la maquette ne propose plus de lien vers les mentions légales",
);
/* Le slash final est accepté comme absent : hors du bundler Next, `next/link`
   ne lit pas `next.config.ts` et normalise la cible sans slash. Servie par
   Next, la page rend bien `/mentions-legales/` (vérifié au curl). */
assert.match(
  rendu,
  new RegExp(`href="${CHEMIN_MENTIONS.replace(/\/$/, "")}/?"`),
  `le lien vers les mentions légales (${CHEMIN_MENTIONS}) n'est pas posé`,
);
assert.ok(
  !/\bdark:[a-z-]+/.test(rendu),
  "une variante dark: subsiste : le site n'a pas de mode sombre",
);
assert.ok(
  !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
    rendu,
  ),
  "une couleur Tailwind d'échafaudage subsiste : la charte vit dans les jetons",
);

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
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
  "200 clients",
  "5 agences",
  "sous 24 h",
  "sous 48 h",
  "—",
  "–",
]) {
  assert.ok(!texteRendu.includes(interdit), `copie interdite : ${interdit}`);
}

console.log(
  `Confidentialité : ${entrees.length} parties, texte et mise en forme ` +
    "conformes à la maquette, affirmations démenties par le code absentes.",
);
