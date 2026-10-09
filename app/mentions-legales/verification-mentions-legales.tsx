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
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TROIS ASSERTIONS ONT ÉTÉ RETOURNÉES LE 09/10, et chacune dit pourquoi à
 * l'endroit où elle se trouve. Elles encodaient des règles devenues fausses :
 *
 *   · le siège à Écully. La décision du 07/10 est renversée par celle du 09/10
 *     (§ 1 de CLAUDE.md) : le siège est à Limonest, l'agence est à Écully.
 *     L'assertion qui REFUSAIT « Limonest » refusait donc la vérité.
 *   · « au moins douze à compléter ». Elle exigeait la présence des étiquettes
 *     de gabarit que l'audit de Nathan du 09/10 demande justement de retirer.
 *     Elle est remplacée par son inverse, DOUBLÉ d'un refus de toute donnée
 *     légale inventée : c'était le risque que l'ancienne couvrait, il est
 *     maintenant couvert directement au lieu de l'être par procuration.
 *   · le paragraphe de propriété intellectuelle porté mot pour mot. Sa dernière
 *     phrase affirme un accord des clients sur leurs logos qui n'est documenté
 *     nulle part. Les deux premières phrases restent exigées mot pour mot, la
 *     troisième est vérifiée EN DIVERGENCE : présente dans la maquette, absente
 *     du rendu. Le jour où la maquette ne l'écrit plus, l'exception le dit.
 * ────────────────────────────────────────────────────────────────────────────
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
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

/** Le paragraphe de la maquette qui porte ce marqueur, normalisé. */
function paragrapheMaquette(marqueur: string): string {
  const paragraphe = [...bloc.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((t) => normalise(t[1]))
    .find((t) => t.includes(marqueur));
  assert.ok(paragraphe, `paragraphe « ${marqueur} » introuvable dans la maquette`);
  return paragraphe;
}

// Le paragraphe de prose que la maquette rédige entièrement et que le site porte
// mot pour mot. Il est extrait du bloc, pas écrit ici : si la maquette change,
// l'attendu change.
{
  const paragraphe = paragrapheMaquette("titre indicatif");
  assert.ok(
    texteRendu.includes(paragraphe),
    `paragraphe non porté mot pour mot : ${paragraphe.slice(0, 70)}...`,
  );
}

/* RETOURNÉE LE 09/10. LA PROPRIÉTÉ INTELLECTUELLE DIVERGE SUR SA DERNIÈRE
   PHRASE, ET SEULEMENT SUR CELLE-LÀ. La maquette affirme que les marques et
   logos des clients « sont utilisés avec leur accord ». Le site affiche 38 logos
   clients et AUCUNE preuve de cet accord n'est versée au dépôt : audit de Nathan
   Jorez du 09/10.

   Les deux premières phrases restent exigées mot pour mot. La troisième est
   vérifiée EN DIVERGENCE, des deux côtés : si la maquette cesse de l'écrire, la
   première assertion le dit et l'exception n'a plus d'objet ; si le rendu la
   récupère, la seconde le dit. */
{
  const paragraphe = paragrapheMaquette("droit de la propriété intellectuelle");
  const phrases = paragraphe.split(/(?<=\.)\s+/);
  assert.equal(
    phrases.length,
    3,
    `le paragraphe de propriété intellectuelle de la maquette compte ${phrases.length} phrases au lieu de trois : relire la divergence du 09/10`,
  );
  for (const phrase of phrases.slice(0, 2)) {
    assert.ok(
      texteRendu.includes(phrase),
      `phrase non portée mot pour mot : ${phrase.slice(0, 70)}...`,
    );
  }
  assert.ok(
    phrases[2].includes("sont utilisés avec leur accord"),
    "la maquette n'affirme plus l'accord des clients sur leurs logos : la divergence du 09/10 n'a plus d'objet, la retirer",
  );
  assert.ok(
    !texteRendu.includes("avec leur accord"),
    "la page affirme un accord des clients sur leurs logos qu'aucune pièce du dépôt ne documente",
  );
  // Ce que la page dit à la place : la titularité et le titre de l'affichage.
  for (const attendu of [
    "appartiennent à leurs titulaires respectifs",
    "cités à titre de référence",
  ]) {
    assert.ok(texteRendu.includes(attendu), `la page ne dit plus : ${attendu}`);
  }
}

/* RETOURNÉE LE 09/10. LE SIÈGE EST À LIMONEST, L'AGENCE EST À ÉCULLY.
   Décision de Mehdi du 09/10 (§ 1 de CLAUDE.md), qui RENVERSE la sienne du 07/10
   et donne raison à l'audit de Nathan. Les trois assertions précédentes
   exigeaient Écully et REFUSAIENT « Limonest » : elles refusaient donc à la fois
   la vérité et la maquette, qui écrit Limonest depuis le début. Il n'y a plus
   aucune divergence à gérer ici, les deux côtés portent le même texte. */
const SIEGE = "1 rue des Vergers, Bâtiment 3, 69760 Limonest, France";
assert.ok(
  texteMaquette.includes(SIEGE),
  `la maquette n'écrit plus « ${SIEGE} » : la relire avant de changer le rendu`,
);
assert.ok(
  texteRendu.includes(`Siège social : ${SIEGE}`),
  "le siège de Limonest (décision de Mehdi du 09/10) n'est pas rendu",
);
assert.ok(
  !texteRendu.includes("Moulin Carron") && !texteRendu.includes("Écully"),
  "Écully est rendu sur les mentions légales : c'est l'agence, le siège est à Limonest (décision du 09/10)",
);

// Le numéro du site, jamais celui de la landing page.
assert.ok(html.includes("04 78 33 72 05"), "numéro du site absent");
assert.ok(!html.includes("04 11 78 95 97"), "numéro de la landing page rendu sur le site");

/* ------------------------------- l'hébergeur, nommé, et son téléphone dit absent */

/* La maquette laisse « [Nom de l'hébergeur], [adresse complète], [téléphone] ».
   Vercel est une décision actée (§ 2 de CLAUDE.md) et visible au dépôt. Sa
   raison sociale et son adresse ont été relues le 09/10 sur les deux pages que
   Vercel publie elle-même (vercel.com/legal/privacy-policy et /legal/terms), qui
   portent le même texte. Aucune des deux ne donne de numéro de téléphone : la
   page le DIT au lieu d'en inventer un, et c'est ce que ce bloc vérifie. */
for (const attendu of [
  "Vercel Inc.",
  "440 N Barranca Avenue #4133",
  "Covina, CA 91723",
  "Vercel ne publie pas de numéro de téléphone",
]) {
  assert.ok(texteRendu.includes(attendu), `mention de l'hébergeur absente : ${attendu}`);
}
// Un second numéro français sur la page serait un téléphone d'hébergeur inventé.
assert.equal(
  (texteRendu.match(/\b0\d(?:[ .]\d\d){4}\b/g) ?? []).length,
  1,
  "un second numéro de téléphone est rendu : le seul attendu est celui de l'éditeur, Vercel n'en publie aucun",
);

/* ------------------------------------- la date de mise à jour est renseignée */

/* La maquette écrit « Dernière mise à jour : à compléter » et le site le
   recopiait. Renseignée le 09/10 : une page légale sans date ne dit pas de quand
   datent les mentions qu'on lit. C'est la FORME qui est vérifiée, pas la valeur,
   sinon ce contrôle serait à réécrire à chaque révision du texte. */
assert.ok(
  texteMaquette.includes("Dernière mise à jour : à compléter"),
  "la maquette ne laisse plus sa date à compléter : l'écart du 09/10 n'a plus d'objet",
);
assert.match(
  texteRendu,
  /Dernière mise à jour : [1-9]\d? [a-zéû]+ 20\d\d/,
  "la date de dernière mise à jour n'est pas rendue en clair",
);

/* ------------------------------------ aucun emplacement de la maquette recopié */

// La maquette écrit ses valeurs légales entre crochets. Les recopier publierait
// une mention légale fausse, ce qui est pire qu'absente.
const emplacements = [...bloc.matchAll(/\[[^\]<>]+\]/g)].map((t) => t[0]);
assert.ok(emplacements.length >= 8, `trop peu d'emplacements repérés : ${emplacements.length}`);
for (const emplacement of new Set(emplacements)) {
  assert.ok(!html.includes(emplacement), `emplacement de la maquette recopié : ${emplacement}`);
}

/* ------------------------------ ni gabarit visible, ni donnée légale inventée */

/* RETOURNÉE LE 09/10. L'ASSERTION PRÉCÉDENTE EXIGEAIT AU MOINS DOUZE
   « à compléter » DANS LA PAGE. Elle protégeait du bon risque (publier une
   mention légale fausse) par le mauvais moyen : elle rendait OBLIGATOIRE
   l'étiquette de gabarit que l'audit de Nathan Jorez du 09/10 relève comme le
   défaut à corriger. Treize valeurs la portaient, plus un bandeau adressé au
   conseil du client.

   Elle est remplacée par les deux assertions qui disent la vraie règle :
     · aucune étiquette de chantier n'est visible par le visiteur ;
     · aucune donnée légale n'est inventée pour autant.
   La seconde est le fond du sujet. La page NOMME ce qui manque, et c'est
   vérifié aussi : une page qui tairait le manque serait le défaut suivant. */
for (const etiquette of [
  "à compléter",
  "entre crochets",
  "Gabarit juridique",
  "votre conseil",
]) {
  assert.ok(!texteRendu.includes(etiquette), `étiquette de chantier rendue : ${etiquette}`);
}
assert.ok(
  texteRendu.includes("Ne figurent pas encore sur cette page"),
  "la page ne dit plus quelles mentions légales manquent : un manque tu est pire qu'un manque dit",
);
for (const mention of ["directeur de la publication", "adresse de courriel"]) {
  assert.ok(
    texteRendu.includes(mention),
    `la phrase qui énumère les mentions manquantes a perdu : ${mention}`,
  );
}

/* --------- l'identité légale rendue est CELLE DE SA SOURCE, chiffre à chiffre */

/* RETOURNÉ LE 09/10 EN FIN DE JOURNÉE. Ce bloc REFUSAIT toute donnée légale
   (une suite de neuf chiffres, un numéro de TVA, une forme juridique), parce
   qu'aucune n'était connue le matin et que les inventer était le risque.

   `docs/IDENTITE-LEGALE.md` est arrivé depuis : extrait Pappers du 09/10
   transmis par Mehdi. Six mentions sont donc renseignées, et la règle change de
   nature. Elle ne dit plus « aucun identifiant » mais « AUCUN IDENTIFIANT QUI
   NE VIENNE DE SA SOURCE », ce qui est plus fort : un chiffre changé à la
   relecture, un SIRET recopié de travers, une clé de TVA fausse échouent ici.

   La source est RELUE à chaque exécution, jamais recopiée dans ce fichier : la
   recopier ferait de ce contrôle un miroir du code au lieu d'un contrôle. Si
   elle disparaît du dépôt, la lecture échoue et le dit, ce qui est le bon
   comportement : la page ne doit pas publier une identité sans source. */
const IDENTITE = (() => {
  const chemin = "docs/IDENTITE-LEGALE.md";
  assert.ok(
    existsSync(chemin),
    `${chemin} est absent : la page publie une identité légale dont la source n'est plus au dépôt`,
  );
  return readFileSync(chemin, "utf8");
})();

/** La valeur d'une ligne du tableau de la source. */
function valeurSource(mention: string): string {
  const ligne = IDENTITE.split("\n").find((l) => l.startsWith(`| ${mention} |`));
  assert.ok(ligne, `mention « ${mention} » absente du tableau de docs/IDENTITE-LEGALE.md`);
  return ligne.split("|")[2].trim();
}

/** Les seuls chiffres, pour comparer des valeurs espacées différemment. */
const chiffres = (valeur: string) => valeur.replace(/\D/g, "");

/* Tout ce qui n'est ni chiffre ni blanc : le « R.C.S. Lyon » du numéro de RCS,
   le « FR » du numéro de TVA. Comparer les seuls chiffres laissait passer un
   greffe changé de Lyon à Paris, ce qui est une mention légale fausse de plein
   droit : vérifié par mutation le 09/10, c'était le seul trou de ce bloc. */
const lettres = (valeur: string) => valeur.replace(/[\d\s]/g, "");

// Les identifiants numériques : comparés sur leurs CHIFFRES, pas sur leur
// typographie. Réespacer « 898 436 910 » ne casse rien, changer un 8 en 9 si.
/* La valeur est lue dans le HTML et non dans le texte aplati : chaque ligne de
   la section y finit sur un `<br/>`, donc `[^<]*` en donne la borne exacte.
   Aplati, « SIRET ... TVA ... » se suivrait sans séparateur lisible. */
function ligneRendue(libelle: string): string {
  const trouvee = html.match(new RegExp(`${libelle}\\s*:\\s*([^<]*)`));
  assert.ok(trouvee, `la page ne rend plus la ligne « ${libelle} »`);
  return trouvee[1].trim();
}

for (const [mention, libelle] of [
  ["SIRET du siège", "SIRET du siège"],
  ["Numéro RCS", "RCS"],
  ["Numéro de TVA intracommunautaire", "TVA intracommunautaire"],
] as const) {
  const rendue = ligneRendue(libelle);
  const source = valeurSource(mention);
  const erreur = `« ${libelle} : ${rendue} » ne correspond pas à docs/IDENTITE-LEGALE.md (${source})`;
  assert.equal(chiffres(rendue), chiffres(source), erreur);
  assert.equal(lettres(rendue), lettres(source), erreur);
}

// La dénomination, la forme et le capital : comparés au texte de la source.
assert.ok(
  texteRendu.includes(`Dénomination sociale : ${valeurSource("Dénomination sociale")},`),
  `la dénomination rendue n'est pas celle de la source : ${valeurSource("Dénomination sociale")}`,
);
assert.ok(
  valeurSource("Forme juridique").includes("société par actions simplifiée") &&
    texteRendu.includes("Forme juridique : société par actions simplifiée"),
  "la forme juridique rendue n'est pas celle de la source",
);
assert.equal(
  chiffres(ligneRendue("Capital social")),
  // « 13 000,00 € » dans la source, « 13 000 € » sur la page : les centimes ne
  // se publient pas. Seule la partie entière est comparée.
  chiffres(valeurSource("Capital social").split(",")[0]),
  "le capital social rendu n'est pas celui de docs/IDENTITE-LEGALE.md",
);

// La source doit confirmer le siège, sinon la décision du 09/10 n'est plus
// adossée à une pièce et l'adresse publiée redevient une affirmation.
assert.ok(
  IDENTITE.includes("1 rue des Vergers, 69760 Limonest"),
  "docs/IDENTITE-LEGALE.md ne confirme plus le siège de Limonest",
);

/* AUCUN IDENTIFIANT HORS SOURCE. Tout groupe d'au moins neuf chiffres rendu par
   la page doit être l'un de ceux de la source, ou le téléphone du site. C'est le
   filet : il attrape un numéro ajouté par une main pressée, quelle que soit sa
   mise en forme, là où une liste de motifs n'attrape que ce qu'elle prévoit. */
const AUTORISES = new Set([
  chiffres(valeurSource("SIREN")),
  chiffres(valeurSource("SIRET du siège")),
  chiffres(valeurSource("Numéro RCS")),
  chiffres(valeurSource("Numéro de TVA intracommunautaire")),
  chiffres(TELEPHONE_SITE.affichage),
]);
for (const trouvaille of texteRendu.matchAll(/\d[\d .]{7,}\d/g)) {
  const identifiant = chiffres(trouvaille[0]);
  assert.ok(
    AUTORISES.has(identifiant),
    `identifiant rendu qui ne vient pas de docs/IDENTITE-LEGALE.md : ${trouvaille[0].trim()}`,
  );
}

// Le crédit de cartographie est écarté : la carte de France de la maquette
// n'est pas portée, le contrat interdisant d3 et topojson. Vérifié par
// l'absurde, comme dans `app/verification-introuvable.tsx` : si la maquette
// perdait ce crédit, cette assertion le dirait et le commentaire du composant
// n'aurait plus de raison d'être.
assert.ok(texteMaquette.includes("Natural Earth"), "la maquette ne crédite plus Natural Earth");
for (const absent of ["Natural Earth", "world-atlas", "Cartographie"]) {
  assert.ok(!texteRendu.includes(absent), `crédit d'une source non servie : ${absent}`);
}

/* --------------------- le bandeau « Gabarit juridique » de la maquette, retiré */

/* 09/10. Le bandeau d'avertissement de la maquette est adressé au CONSEIL DU
   CLIENT, pas au visiteur : « les mentions ci-dessous doivent être complétées et
   validées par votre conseil ». Une note de chantier n'a rien à faire en copie
   publique, et l'audit de Nathan Jorez du 09/10 le relève.

   Il est donc découpé du bloc AVANT la collecte des déclarations de style qui
   suit, sinon celle-ci exigerait du rendu les six déclarations propres au
   bandeau. L'exception est bornée : le découpage est vérifié (il doit bien
   emporter le bandeau, et lui seul), et la présence du bandeau dans la maquette
   l'est aussi. Le jour où la maquette le perd, la première assertion le dit. */
const debutBandeau = bloc.indexOf('<div style="border-radius:var(--rad-s)');
assert.ok(debutBandeau > 0, "le bandeau d'avertissement a disparu de la maquette");
const finBandeau = bloc.indexOf("</div>", bloc.indexOf("</p>", debutBandeau));
assert.ok(finBandeau > debutBandeau, "fin du bandeau de la maquette introuvable");
const bandeau = bloc.slice(debutBandeau, finBandeau + "</div>".length);
assert.ok(
  normalise(bandeau).startsWith("Gabarit juridique"),
  "le découpage n'emporte plus le seul bandeau : relire les bornes avant de faire confiance au reste",
);
const blocSansBandeau = bloc.replace(bandeau, "");

/* ------------------------------------------- toutes les valeurs de style portées */

// Chaque déclaration en ligne de la maquette doit se retrouver dans le rendu.
// C'est la vérification de fidélité la plus fine possible sans navigateur, et
// elle attrape le cas courant : une valeur « arrondie » à la lecture.
const declarations = new Set<string>();
for (const attribut of blocSansBandeau.matchAll(/ style="([^"]*)"/g)) {
  for (const brute of attribut[1].split(";")) {
    const declaration = brute.trim();
    if (declaration) declarations.add(declaration);
  }
}
assert.ok(declarations.size >= 25, `trop peu de déclarations lues : ${declarations.size}`);
// Les déclarations propres au bandeau ne doivent PAS revenir dans le rendu :
// sans cela, le bandeau pourrait être remis sans que rien ne le signale.
for (const propreAuBandeau of ["var(--rad-s)", "var(--acc-w)", "14.5px"]) {
  assert.ok(
    bandeau.includes(propreAuBandeau),
    `le bandeau de la maquette ne porte plus ${propreAuBandeau} : relire l'exception du 09/10`,
  );
  assert.ok(
    !html.includes(propreAuBandeau),
    `le bandeau « Gabarit juridique » est revenu dans le rendu (${propreAuBandeau})`,
  );
}
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
/* 09/10 : LA PAGE DE CONTACT REMPLACE LE COURRIEL QUE PERSONNE N'A FOURNI. La
   maquette écrit « Courriel : [adresse] » ; aucune adresse n'étant connue, la
   page renvoie vers le formulaire, deux fois (joindre l'éditeur, et demander le
   retrait d'un logo). Une page légale qui ne donne AUCUN moyen d'écrire à
   l'éditeur est le défaut que ce renvoi évite. */
assert.ok(
  cibles.includes("/contact"),
  "la page ne donne plus aucun moyen d'écrire à l'éditeur : le courriel n'est pas connu, le formulaire est la seule voie",
);

// Les seules cibles du rendu : les cinq ancres de la page, et ces renvois.
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
/* AUCUN PRIX. Retournée le 09/10 en fin de journée : elle refusait TOUT montant
   en euros, et le capital social est un montant en euros. Le contrat interdit
   les prix (§ 9 de CLAUDE.md), pas une mention légale obligatoire. Le capital,
   et lui seul, est donc retiré avant la recherche, après avoir été comparé à sa
   source plus haut : un second montant échoue toujours ici. */
const sansCapital = texteRendu.replace(`Capital social : ${ligneRendue("Capital social")}`, "");
assert.ok(!/\d\s*€/.test(sansCapital), "un montant est rendu sur la page");

console.log(
  `Mentions légales : ${declarations.size} déclarations de la maquette portées, ` +
    `${new Set(emplacements).size} emplacements de la maquette non recopiés, ` +
    "aucune étiquette de chantier rendue, aucune donnée légale inventée, aucun lien mort.",
);
