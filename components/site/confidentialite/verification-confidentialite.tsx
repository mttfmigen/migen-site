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
 *
 * ────────────────────────────────────────────────────────────────────────────
 * UNE ASSERTION A ÉTÉ RETOURNÉE LE 09/10, et deux blocs ont été ajoutés.
 *
 *   · RETOURNÉE : la ligne de date. Elle exigeait du rendu le sous-titre de la
 *     maquette, qui est « Dernière mise à jour : à compléter ». Elle rendait
 *     donc OBLIGATOIRE l'étiquette de chantier que l'audit de Nathan Jorez du
 *     09/10 demande de retirer. Les deux côtés sont maintenant vérifiés
 *     séparément : la maquette doit toujours laisser sa date à compléter (sans
 *     quoi l'écart n'a plus d'objet), le rendu doit porter une date en clair.
 *
 *   · AJOUTÉ : l'absence des étiquettes de chantier. Le bandeau « en cours de
 *     validation juridique » et les cinq réserves adressées au projet ne
 *     doivent plus être rendues, et la maquette doit toujours porter le sien,
 *     sinon l'exception n'a plus d'objet.
 *
 *   · AJOUTÉ, et c'est l'assertion la plus utile de ce fichier : LA LISTE DES
 *     DESTINATAIRES DOIT CORRESPONDRE AUX PIXELS RÉELLEMENT ARMÉS. Elle relit
 *     `.env.local` et refuse les deux incohérences, dans les deux sens. Voir le
 *     bloc « OpenAI » plus bas.
 * ────────────────────────────────────────────────────────────────────────────
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { TELEPHONE_LP, TELEPHONE_SITE } from "@/components/site/entete-donnees";
import { FINALITES, LIBELLES, LIEN_CONFIDENTIALITE } from "@/lib/consentement";
import PolitiqueConfidentialite, {
  CHEMIN_CONTACT,
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

/* L'adresse du siège. PLUS AUCUNE DIVERGENCE DEPUIS LE 09/10 : Mehdi a tranché
   que le siège est à Limonest, ce que la maquette écrivait déjà. Les deux
   côtés doivent donc porter le même texte, et c'est ce que vérifient les deux
   assertions ci-dessous. La troisième, qui refusait « Limonest » au nom de la
   décision du 07/10, est supprimée : elle disait l'inverse de ce qui est vrai. */
const ADRESSE_MAQUETTE = "migen©, 1 rue des Vergers, Bâtiment 3, 69760 Limonest.";
assert.equal(
  phraseMaquette("rue des Vergers"),
  ADRESSE_MAQUETTE,
  "la maquette n'écrit plus cette adresse : la relire avant de changer le rendu",
);
/* 09/10 : LE RESPONSABLE DU TRAITEMENT EST NOMMÉ PAR SA DÉNOMINATION SOCIALE.
   La maquette écrit « migen© », une marque ; l'article 13 du RGPD demande
   l'identité du responsable, et une marque n'est pas une personne morale.
   L'ADRESSE reste exigée mot pour mot comme dans la maquette, seul le nom est
   ajouté devant, et il est relu dans sa source au lieu d'être écrit ici. */
const DENOMINATION = (() => {
  const chemin = fileURLToPath(
    new URL("../../../docs/IDENTITE-LEGALE.md", import.meta.url),
  );
  assert.ok(
    existsSync(chemin),
    "docs/IDENTITE-LEGALE.md est absent : la page nomme un responsable du traitement dont la source n'est plus au dépôt",
  );
  const ligne = readFileSync(chemin, "utf8")
    .split("\n")
    .find((l) => l.startsWith("| Dénomination sociale |"));
  assert.ok(ligne, "la dénomination sociale a disparu de docs/IDENTITE-LEGALE.md");
  return ligne.split("|")[2].trim();
})();
/* L'adresse seule, c'est-à-dire la phrase de la maquette privée de sa marque.
   Elle n'est pas réécrite ici : elle est DÉCOUPÉE dans celle de la maquette,
   donc elle suit la maquette si celle-ci change de bâtiment ou de code postal. */
const MARQUE = "migen©, ";
assert.ok(ADRESSE_MAQUETTE.startsWith(MARQUE), "la maquette n'ouvre plus par la marque");
const adresseSeule = ADRESSE_MAQUETTE.slice(MARQUE.length);
const RESPONSABLE = `${DENOMINATION} (migen©), ${adresseSeule}`;
assert.ok(
  texteRendu.includes(RESPONSABLE),
  `le responsable du traitement n'est pas rendu comme « ${RESPONSABLE} » : la dénomination vient de docs/IDENTITE-LEGALE.md, l'adresse de la maquette`,
);


for (const cle of [
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

/* RETOURNÉE LE 09/10. LA LIGNE DE DATE DIVERGE, PARCE QU'ELLE EST RENSEIGNÉE.
   L'assertion précédente exigeait du rendu le sous-titre de la maquette, mot
   pour mot. Or ce sous-titre est « Dernière mise à jour : à compléter » : elle
   rendait obligatoire l'étiquette de chantier que l'audit de Nathan Jorez du
   09/10 relève comme le défaut à corriger.

   Les deux côtés sont désormais vérifiés séparément. C'est la FORME de la date
   qui est exigée du rendu, pas sa valeur, sinon ce contrôle serait à réécrire à
   chaque révision du texte. */
const sousTitre = texte(
  /<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/.exec(ecran)?.[1] ?? "",
);
assert.equal(
  sousTitre,
  "Dernière mise à jour : à compléter",
  "la maquette ne laisse plus sa date à compléter : l'écart du 09/10 n'a plus d'objet, le rendu peut reprendre son sous-titre",
);
assert.match(
  texteRendu,
  /Dernière mise à jour : [1-9]\d? [a-zéû]+ 20\d\d/,
  "la date de dernière mise à jour n'est pas rendue en clair",
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
  /* « background:var(--acc-w) » a été RETIRÉ de cette liste le 09/10 : c'était
     la déclaration du bandeau d'avertissement, qui n'est plus rendu. Son absence
     n'est pas pour autant laissée sans contrôle, voir le bloc « étiquettes de
     chantier » plus bas, qui la vérifie des deux côtés. */
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

/* ------------- OPENAI : LA PAGE NOMME EXACTEMENT LES PIXELS RÉELLEMENT ARMÉS */

/* AJOUTÉE LE 09/10, sur l'audit de Nathan Jorez. La page nommait « OpenAI »
   parmi les destinataires de la publicité, alors qu'AUCUN pixel OpenAI n'est
   chargé : `components/consentement/Tags.tsx` ne le monte que si
   NEXT_PUBLIC_OPENAI_PIXEL_SRC est posée, et elle ne l'est pas.

   Nommer un destinataire qui ne reçoit rien est aussi faux que taire celui qui
   reçoit. Cette assertion refuse LES DEUX ÉTATS INCOHÉRENTS : la page qui
   nomme OpenAI sans pixel armé (le défaut corrigé), et le pixel armé sans que
   la page le nomme (le défaut symétrique, le plus grave des deux). Elle est
   donc la seule façon de retirer ce destinataire sans ouvrir la porte à son
   retour silencieux.

   `.env.local` n'est pas versionné : absent, il vaut « aucun pixel armé », ce
   qui est l'état correct par défaut en intégration continue. */
const CHEMIN_ENV = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const env = existsSync(CHEMIN_ENV) ? readFileSync(CHEMIN_ENV, "utf8") : "";
const pixelOpenAiArme = /^\s*NEXT_PUBLIC_OPENAI_PIXEL_SRC\s*=\s*\S+/m.test(env);
assert.equal(
  texteRendu.includes("OpenAI"),
  pixelOpenAiArme,
  pixelOpenAiArme
    ? "le pixel OpenAI est armé (NEXT_PUBLIC_OPENAI_PIXEL_SRC posée) et la page ne le nomme pas : remettre « OpenAI » dans LIBELLES.publicite ET incrémenter VERSION_BANDEAU"
    : "la page nomme OpenAI parmi les destinataires alors qu'aucun pixel OpenAI n'est armé : un destinataire qui ne reçoit rien n'a rien à faire dans une page juridique",
);
assert.equal(
  LIBELLES.publicite.destinataires.includes("OpenAI"),
  pixelOpenAiArme,
  "LIBELLES.publicite et le pixel réellement armé ont divergé : le bandeau et cette page afficheraient une liste fausse",
);

/* ------------------------------ aucune étiquette de chantier dans la page */

/* AJOUTÉ LE 09/10. La maquette porte un encart « Gabarit RGPD : à faire valider
   par votre DPO ou votre conseil avant publication », adressé au client. Il
   avait été réécrit pour le visiteur ; il est retiré, sur décision de Mehdi.
   Les cinq réserves qui l'accompagnaient le sont aussi (« à compléter » du
   point de contact et de la date, « restent à valider », « restent à
   arbitrer »). Elles vivent maintenant dans `docs/RESERVES-CONTENU.md` et dans
   l'en-tête de `lib/consentement.ts`.

   La première assertion borne l'exception : si la maquette perd son encart,
   elle n'a plus d'objet et le contrôle le dit. */
assert.ok(
  texte(ecran).includes("Gabarit RGPD"),
  "la maquette ne porte plus son encart d'avertissement : l'écart du 09/10 n'a plus d'objet",
);
for (const etiquette of [
  "à compléter",
  "Gabarit RGPD",
  "en cours de validation",
  "restent à valider",
  "restent à arbitrer",
  "point de départ",
  "votre DPO",
  "votre conseil",
]) {
  assert.ok(
    !texteRendu.includes(etiquette),
    `étiquette de chantier rendue sur une page juridique publique : ${etiquette}`,
  );
}
assert.ok(
  !rendu.includes("var(--acc-w)") && !rendu.includes("14.5px"),
  "le bandeau d'avertissement est revenu dans le rendu (ses déclarations de style y sont)",
);

/* ------------------------- un point de contact réel, à défaut d'un courriel */

/* AJOUTÉ LE 09/10. La maquette écrit « Contact : [adresse courriel du référent
   données] » et « Écrivez à [adresse courriel] ». Aucune adresse n'est connue et
   on n'en invente pas : les deux endroits renvoient vers le formulaire de
   `/contact/` et donnent le numéro du site. Une politique de confidentialité
   sans AUCUN moyen de contact est incomplète au regard de l'article 13 du RGPD,
   et elle est citée par la mention RGPD de chaque formulaire. */
assert.match(
  rendu,
  new RegExp(`href="${CHEMIN_CONTACT.replace(/\/$/, "")}/?"`),
  `la page ne renvoie plus vers ${CHEMIN_CONTACT} : le visiteur n'a aucun moyen d'exercer ses droits`,
);
assert.equal(
  (rendu.match(/href="\/contact\/?"/g) ?? []).length,
  2,
  "les deux renvois attendus (responsable du traitement, exercice des droits) ne sont pas tous les deux posés",
);
assert.ok(
  texteRendu.includes(TELEPHONE_SITE.affichage),
  "le numéro du site n'est plus donné comme second moyen de contact",
);
assert.ok(
  !texteRendu.includes(TELEPHONE_LP.affichage),
  "le numéro de la landing page est rendu sur le site",
);
/* 09/10 : LE BANDEAU DE CONSENTEMENT DOIT VISER CETTE PAGE, PAS SA 301.
   `LIEN_CONFIDENTIALITE` valait `/politique-de-confidentialite/`, l'ancienne URL
   du site WordPress, redirigée en 301 vers `/confidentialite/`. C'est le SEUL
   lien du bandeau, celui que l'article 13 du RGPD y impose : chaque visiteur et
   chaque robot y perdaient une redirection. Corrigé dans `lib/consentement.ts`,
   et vérifié ici parce que c'est cette page qui en est la cible. */
/* Le chemin canonique n'est pas écrit ici : il est LU dans la route qui sert la
   page, `app/confidentialite/page.tsx`. Deux sources indépendantes comparées, au
   lieu d'une constante recopiée qui vieillirait avec le reste. */
const CHEMIN_SERVI = (() => {
  const route = fileURLToPath(
    new URL("../../../app/confidentialite/page.tsx", import.meta.url),
  );
  const trouve = readFileSync(route, "utf8").match(/const CHEMIN = "([^"]+)"/);
  assert.ok(trouve, "app/confidentialite/page.tsx ne déclare plus son chemin canonique");
  return trouve[1];
})();
assert.equal(
  LIEN_CONFIDENTIALITE,
  CHEMIN_SERVI,
  `le bandeau de consentement renvoie vers ${LIEN_CONFIDENTIALITE} au lieu de la page servie ${CHEMIN_SERVI} : une redirection à chaque clic`,
);

// Les deux cibles internes de la page doivent exister sous `app/` : un renvoi
// mort sur la page des droits est le même défaut que la 404 qu'on a réparée.
for (const cible of [CHEMIN_CONTACT, CHEMIN_MENTIONS]) {
  assert.ok(
    existsSync(
      fileURLToPath(new URL(`../../../app${cible}page.tsx`, import.meta.url)),
    ),
    `cible sans route : ${cible}`,
  );
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
  // « +200 clients », sans jamais préciser « réguliers » : règle validée par le
  // client (design_handoff_migen_site/README.md). Ni la maquette ni de capture
  // ne portent « +200 » sur cette page : il n'y est donc pas exigé.
  "clients réguliers",
  "80 réguliers",
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
    "conformes à la maquette, affirmations démenties par le code absentes, " +
    "aucune étiquette de chantier rendue, " +
    `destinataires alignés sur les pixels armés (OpenAI ${pixelOpenAiArme ? "armé" : "non armé"}).`,
);
