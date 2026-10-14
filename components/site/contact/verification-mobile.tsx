/**
 * Porte du haut de page mobile v2 de `/contact/`, sans navigateur.
 *
 *   bun components/site/contact/verification-mobile.tsx
 *   bun components/site/contact/verification-mobile.tsx --controle
 *
 * CE QU'ELLE PROUVE, et chaque point a sa raison :
 *
 *   1. LES VALEURS MOBILES SONT CELLES DE LA MAQUETTE MOBILE V2, relues dans
 *      `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` (bloc
 *      `{{ isContact }}`) À CHAQUE EXÉCUTION, jamais écrites de mémoire : le
 *      h1 à `600 27px/1.1` et -.04em, le chapô à `400 15px/1.6`, la gouttière
 *      de 18 px, la tuile de chiffre à `600 21px/1.08`.
 *
 *   2. TOUT LE PORTAGE VIT SOUS `@media (max-width: 880px)`. Au-dessus, le
 *      bureau ne bouge pas : la page a été comparée bloc à bloc à la maquette
 *      bureau le 14/10, et cet acquis ne se défait pas. Une classe mobile
 *      rencontrée HORS du bloc media fait échouer la porte.
 *
 *   3. CHAQUE DÉCLARATION MOBILE PORTE `!important`. Les tailles à remplacer
 *      sont des styles EN LIGNE : sans `!important`, la règle est morte et le
 *      téléphone reste au gabarit bureau, sans qu'aucun contrôle statique
 *      ordinaire ne le voie.
 *
 *   4. RIEN N'EST RETIRÉ. « Replier, jamais retirer » (LISEZMOI de la maquette
 *      mobile v2) : le bloc media n'a droit ni à `display:none`, ni à
 *      `visibility:hidden`, ni à `font-size:0`, ni à `opacity:0`. Et le rendu
 *      du composant porte TOUT le texte du haut de page et ses liens : le
 *      contrôle négatif n° 1 retire le chapô et exige que la porte tombe.
 *
 *   5. LES STYLES EN LIGNE DU BUREAU SONT INTACTS (`padding:70px 40px 0`,
 *      `clamp(38px,4.4vw,66px)`, chapô 17.5 px, capsule `15px 26px`) : le
 *      portage est additif, il n'a pas le droit de toucher au gabarit bureau
 *      que `verification-contact.tsx` mesure contre la maquette vivante.
 *
 * Le mode `--controle` rejoue huit régressions et exige que CHACUNE fasse
 * échouer la porte : une porte qui ne sait pas échouer ne prouve rien.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Ouverture from "@/components/site/contact/Ouverture";

const CONTROLE = process.argv.includes("--controle");

const MAQUETTE_MOBILE = new URL(
  "../../../maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html",
  import.meta.url,
);
const FEUILLE = new URL("./Contact.module.css", import.meta.url);

// ─────────────────────────────── 1. la maquette mobile v2, relue à chaque fois

/** Le bloc contact de la maquette mobile : de `isContact` au bloc suivant. */
function blocContact(): string {
  const brut = readFileSync(MAQUETTE_MOBILE, "utf8");
  const debut = brut.indexOf("{{ isContact }}");
  const fin = brut.indexOf("{{ is404 }}");
  assert.ok(
    debut >= 0 && fin > debut,
    "le bloc isContact est introuvable dans la maquette mobile v2",
  );
  return brut.slice(debut, fin);
}

const maquette = blocContact();

/** `font:600 27px/1.1 var(--ft);letter-spacing:-.04em` du premier h1. */
const H1_MAQUETTE =
  /<h1 style="margin:10px 0 10px;font:600 (\d+)px\/([\d.]+) var\(--ft\);letter-spacing:(-\.\d+)em/.exec(
    maquette,
  );
assert.ok(H1_MAQUETTE, "le h1 de l'écran contact mobile est introuvable");
const [, H1_TAILLE, H1_INTERLIGNE, H1_INTERLETTRE] = H1_MAQUETTE;

/** `font:400 15px/1.6 var(--fb)` du chapô sous le h1. */
const CHAPO_MAQUETTE = /<p style="margin:0;font:400 (\d+)px\/([\d.]+) var\(--fb\)/.exec(
  maquette,
);
assert.ok(CHAPO_MAQUETTE, "le chapô de l'écran contact mobile est introuvable");
const [, CHAPO_TAILLE, CHAPO_INTERLIGNE] = CHAPO_MAQUETTE;

/** La gouttière du conteneur : `padding:0 18px`. */
const GOUTTIERE = /class="mv-in" style="padding:0 (\d+)px"/.exec(maquette);
assert.ok(GOUTTIERE, "la gouttière du conteneur mobile est introuvable");
const [, GOUTTIERE_PX] = GOUTTIERE;

/** La tuile de chiffre de la maquette mobile : `font:600 21px/1.08 var(--ft)`. */
const TUILE = /font:600 (\d+)px\/([\d.]+) var\(--ft\);letter-spacing:-\.04em;color:#ff7c3c/.exec(
  readFileSync(MAQUETTE_MOBILE, "utf8"),
);
assert.ok(TUILE, "la tuile de chiffre de la maquette mobile est introuvable");
const [, TUILE_TAILLE, TUILE_INTERLIGNE] = TUILE;

// ────────────────────────────────────────── 2. la feuille, bloc media et règles

const feuille = readFileSync(FEUILLE, "utf8");

/** Le bloc `@media (max-width: 880px) { … }`, par équilibrage d'accolades. */
function blocMedia(css: string): { debut: number; fin: number; corps: string } {
  const entete = "@media (max-width: 880px)";
  const debut = css.indexOf(entete);
  assert.ok(debut >= 0, `la feuille ne porte pas « ${entete} »`);
  assert.equal(
    css.indexOf(entete, debut + 1),
    -1,
    "deux blocs media mobiles : le portage doit vivre dans UN seul",
  );
  const ouvre = css.indexOf("{", debut);
  let profondeur = 0;
  for (let i = ouvre; i < css.length; i += 1) {
    if (css[i] === "{") profondeur += 1;
    if (css[i] === "}") profondeur -= 1;
    if (profondeur === 0) return { debut, fin: i, corps: css.slice(ouvre + 1, i) };
  }
  assert.fail("le bloc media ne se referme pas");
}

/** Les CLASSES DU PORTAGE. Une entrée oubliée ici serait hors de portée des
 *  contrôles de portée : la liste est donc vérifiée contre la feuille. */
const CLASSES_MOBILES = [
  "enTeteMobile",
  "grilleMobile",
  "badgesMobile",
  "titreMobile",
  "chapoMobile",
  "actionsMobile",
  "reperesMobile",
  "repereMobile",
  "traitMobile",
  "valeurMobile",
] as const;

/** Corps de la règle d'un sélecteur dans un bloc CSS. */
function regle(corps: string, classe: string): string {
  const position = corps.indexOf(`.${classe}`);
  assert.ok(position >= 0, `le bloc media ne stylise pas « .${classe} »`);
  const ouvre = corps.indexOf("{", position);
  const ferme = corps.indexOf("}", ouvre);
  assert.ok(ouvre >= 0 && ferme > ouvre, `règle « .${classe} » mal formée`);
  return corps.slice(ouvre + 1, ferme);
}

function verifieFeuille(feuilleBrute: string): void {
  /* Les commentaires sont retirés AVANT toute analyse : la feuille documente
     ses choix en nommant ses classes, et un nom cité dans un commentaire
     n'est pas une règle. Sans ce retrait, la porte accusait son propre
     commentaire d'introduction. */
  const css = feuilleBrute.replace(/\/\*[\s\S]*?\*\//g, "");
  const media = blocMedia(css);

  // Les valeurs de la maquette, telles que relues ci-dessus.
  const titre = regle(media.corps, "titreMobile");
  assert.ok(
    titre.includes(`font-size: ${H1_TAILLE}px !important`),
    `le h1 mobile doit faire ${H1_TAILLE}px, taille du h1 de la maquette`,
  );
  assert.ok(
    titre.includes(`line-height: ${H1_INTERLIGNE} !important`),
    `l'interligne du h1 mobile doit valoir ${H1_INTERLIGNE}`,
  );
  assert.ok(
    titre.includes(`letter-spacing: -0${H1_INTERLETTRE.slice(1)}em !important`),
    `l'interlettrage du h1 mobile doit valoir ${H1_INTERLETTRE}em`,
  );
  const chapo = regle(media.corps, "chapoMobile");
  assert.ok(
    chapo.includes(`font-size: ${CHAPO_TAILLE}px !important`) &&
      chapo.includes(`line-height: ${CHAPO_INTERLIGNE} !important`),
    `le chapô mobile doit faire ${CHAPO_TAILLE}px/${CHAPO_INTERLIGNE}, valeurs de la maquette`,
  );
  const enTete = regle(media.corps, "enTeteMobile");
  assert.ok(
    new RegExp(`padding:[^;]* ${GOUTTIERE_PX}px `).test(enTete),
    `la gouttière mobile doit faire ${GOUTTIERE_PX}px de chaque côté`,
  );
  const valeur = regle(media.corps, "valeurMobile");
  assert.ok(
    valeur.includes(`font-size: ${TUILE_TAILLE}px !important`) &&
      valeur.includes(`line-height: ${TUILE_INTERLIGNE} !important`),
    `les repères mobiles doivent prendre la tuile de chiffre de la maquette, ${TUILE_TAILLE}px/${TUILE_INTERLIGNE}`,
  );

  // Portée : chaque classe mobile vit DANS le bloc media, et nulle part ailleurs.
  for (const classe of CLASSES_MOBILES) {
    let position = css.indexOf(`.${classe}`);
    assert.ok(position >= 0, `« .${classe} » absente de la feuille`);
    while (position >= 0) {
      assert.ok(
        position > media.debut && position < media.fin,
        `« .${classe} » stylisée HORS du bloc media : le bureau bougerait, ` +
          "et l'acquis du 14/10 (page comparée bloc à bloc) avec lui",
      );
      position = css.indexOf(`.${classe}`, position + 1);
    }
  }

  // Chaque déclaration du bloc porte `!important`, sinon elle perd contre les
  // styles en ligne et la règle est morte.
  for (const corpsRegle of media.corps.match(/\{[^}]*\}/g) ?? []) {
    for (const declaration of corpsRegle.slice(1, -1).split(";")) {
      if (!declaration.trim()) continue;
      assert.ok(
        /!important\s*$/.test(declaration.trim()),
        `déclaration mobile sans !important, donc morte sous les styles en ligne : « ${declaration.trim()} »`,
      );
    }
  }

  // « Replier, jamais retirer » : rien ne se masque.
  assert.doesNotMatch(
    media.corps,
    /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(?![.\d])|opacity\s*:\s*0(?![.\d])|content-visibility/,
    "une règle mobile masque du contenu : le texte doit rester visible, " +
      "« les mots doivent être là pour le SEO »",
  );
}

verifieFeuille(feuille);

// ─────────────────────────────────────────────── 3. le rendu, texte et liens

const html = renderToStaticMarkup(<Ouverture />);

function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#x27;|&#39;/g, "'")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

/** Le texte nu du rendu, l'équivalent du `textContent` que Google lit. */
function texteNu(rendu: string): string {
  return normalise(rendu.replace(/<[^>]+>/g, " ")).trim();
}

/* TOUT le texte du haut de page. La préoccupation n'est pas la copie, que
   `verification-contact.tsx` mesure déjà contre la maquette vivante : c'est
   qu'un resserrement mobile ne FASSE PAS DISPARAÎTRE une phrase. */
const TEXTE_DU_HAUT = [
  "Rappel dans l'heure",
  "Astreinte",
  "Dites-nous ce qu'il faut tenir.",
  "On vous rappelle dans l'heure.",
  "Un chargé d'affaires étudie votre demande, sélectionne les techniciens " +
    "adaptés et vous les présente pour validation avant toute intervention.",
  "Ligne à l'arrêt ? Appelez directement l'astreinte.",
  "Les six offres",
  "Astreinte : 04 78 33 72 05",
  "4",
  "agences",
  "10 %",
  "des techniciens retenus",
  "+200",
  "clients industriels",
  "Décrire mon besoin",
] as const;

function verifieTexte(rendu: string): void {
  const texte = texteNu(rendu);
  for (const phrase of TEXTE_DU_HAUT) {
    assert.ok(
      texte.includes(normalise(phrase)),
      `le haut de page a perdu du texte : « ${phrase} »`,
    );
  }
}
verifieTexte(html);

/* Les liens : « Les six offres », l'astreinte, et la politique de
   confidentialité du formulaire. Trois ancres, pas une de moins. */
function verifieLiens(rendu: string): void {
  const ancres = [...rendu.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ancres.length, 3, `3 liens attendus dans l'ouverture, ${ancres.length} rendus`);
  assert.ok(
    ancres.some((h) => h.startsWith("/offres")),
    "le lien vers /offres/ a disparu",
  );
  assert.ok(
    ancres.some((h) => h.startsWith("tel:")),
    "le lien d'astreinte a disparu",
  );
}
verifieLiens(html);

/* Chaque classe mobile est ATTACHÉE À UN ÉLÉMENT : une règle sans élément est
   morte, et l'élément sans sa règle reste au gabarit bureau sur téléphone.

   LA VÉRIFICATION LIT LA SOURCE DU COMPOSANT, PAS LE RENDU, et c'est mesuré :
   sous bun, l'import d'un module CSS rend le CHEMIN du fichier, pas la table
   des classes (`styles.enTeteMobile` vaut `undefined` ici même, alors que Next
   résout la vraie classe au build). Chercher la classe dans le rendu de cette
   porte serait donc chercher une chaîne que bun ne produit jamais. */
const SOURCE_OUVERTURE = readFileSync(
  new URL("./Ouverture.tsx", import.meta.url),
  "utf8",
);
function verifieClasses(source: string): void {
  for (const classe of CLASSES_MOBILES) {
    assert.ok(
      source.includes(`styles.${classe}`),
      `la classe « ${classe} » n'est posée sur aucun élément d'Ouverture.tsx`,
    );
  }
}
verifieClasses(SOURCE_OUVERTURE);

/* Le bureau est INTACT : les styles en ligne mesurés par
   `verification-contact.tsx` contre la maquette vivante sont toujours là. */
const BUREAU_INTACT = [
  "padding:70px 40px 0",
  "clamp(38px,4.4vw,66px)",
  "letter-spacing:-.045em",
  "font:400 17.5px/1.65 var(--fb)",
  "padding:15px 26px",
  "margin-bottom:26px",
] as const;
for (const valeur of BUREAU_INTACT) {
  assert.ok(
    html.includes(valeur),
    `style en ligne du bureau altéré : « ${valeur} ». Le portage mobile doit être additif.`,
  );
}

console.log(
  "Haut de page mobile v2 de /contact/ : valeurs relues dans la maquette " +
    `(h1 ${H1_TAILLE}px/${H1_INTERLIGNE} à ${H1_INTERLETTRE}em, chapô ${CHAPO_TAILLE}px/${CHAPO_INTERLIGNE}, ` +
    `gouttière ${GOUTTIERE_PX}px, tuile ${TUILE_TAILLE}px/${TUILE_INTERLIGNE}), ` +
    `${CLASSES_MOBILES.length} classes sous un seul bloc media, ${TEXTE_DU_HAUT.length} phrases tenues, 3 liens, bureau intact.`,
);

// ─────────────────────────────────────────────────── 4. contrôles négatifs

if (!CONTROLE) process.exit(0);

function controle(nom: string, execute: () => void): void {
  let aEchoue = false;
  try {
    execute();
  } catch {
    aEchoue = true;
  }
  assert.ok(
    aEchoue,
    `CONTRÔLE NÉGATIF MUET : « ${nom} » n'a pas fait échouer la porte.`,
  );
  console.log(`  tenu : ${nom}`);
}

console.log("\nContrôles négatifs, chacun doit faire échouer la porte :");

// 1. LE CONTRÔLE EXIGÉ PAR LE LOT : une section perd son texte. Le chapô
//    entier disparaît du rendu, la porte doit tomber.
controle("le chapô retiré du rendu (une section perd son texte)", () =>
  verifieTexte(html.replace(/<p[^>]*>[\s\S]*?<\/p>/, "")),
);

// 2. Un repère disparaît : « +200 clients industriels » n'est plus rendu.
controle("le repère « +200 clients industriels » retiré", () =>
  verifieTexte(html.replace("+200", "")),
);

// 3. Un lien perdu : l'ancre de l'astreinte tombe, son texte resterait.
controle("l'ancre tel: de l'astreinte retirée", () =>
  verifieLiens(html.replace(/<a href="tel:[^"]*"/, "<span")),
);

// 4. Une règle mobile fuit HORS du bloc media : le bureau bougerait.
controle("« .titreMobile » stylisée hors du bloc media", () =>
  verifieFeuille(`${feuille}\n.titreMobile { font-size: 27px !important; }\n`),
);

// 5. Le h1 mobile ne porte plus la taille de la maquette.
controle("h1 mobile à 32px, qui n'est pas la maquette", () =>
  verifieFeuille(feuille.replace("font-size: 27px !important", "font-size: 32px !important")),
);

// 6. Une déclaration sans !important : morte sous les styles en ligne.
controle("déclaration mobile sans !important", () =>
  verifieFeuille(feuille.replace("line-height: 1.6 !important", "line-height: 1.6")),
);

// 7. Le repli qui RETIRE : un display:none dans le bloc media.
controle("display:none introduit dans le bloc media", () =>
  verifieFeuille(
    feuille.replace(
      ".enTeteMobile .traitMobile {",
      ".enTeteMobile .traitMobile {\n    display: none !important;",
    ),
  ),
);

// 8. Une classe du portage n'est plus posée sur son élément.
controle("« styles.enTeteMobile » retirée d'Ouverture.tsx", () =>
  verifieClasses(SOURCE_OUVERTURE.replace("styles.enTeteMobile", "")),
);

console.log("\nLa porte sait échouer : 8 contrôles négatifs tenus.");
