/**
 * Contrôle du détail par finalité, sans navigateur.
 *
 *   bun components/consentement/verification-panneau.tsx
 *
 * Injecter une faute pour vérifier que le contrôle sait échouer :
 *
 *   MIGEN_FAUTE=discret bun components/consentement/verification-panneau.tsx
 *   MIGEN_FAUTE=verre   bun components/consentement/verification-panneau.tsx
 *   MIGEN_FAUTE=ink4    bun components/consentement/verification-panneau.tsx
 *
 * CE QU'IL DÉCIDE. Trois choses, et aucune n'est une préférence esthétique.
 *
 *   1. LE POIDS ÉGAL des actions de consentement. Un refus plus discret qu'une
 *      acceptation rend le consentement invalide (CNIL, délibération du
 *      17/09/2020). Le contrôle compare les chaînes de style des quatre
 *      libellés du dispositif entre elles, et ferme la porte par laquelle un
 *      biais pourrait entrer depuis CE fichier : un bouton écrit à la main.
 *   2. LE CONTRASTE, calculé et non estimé. Les jetons sont relus dans
 *      `app/globals.css`, composés sur leur fond RÉEL, et le rapport est
 *      mesuré. Changer un jeton de la charte casse ce contrôle, ce qui est
 *      exactement le but.
 *   3. LES SURFACES MESURÉES SONT CELLES QUI SONT RENDUES. La preuve du point 2
 *      ne vaut que si l'écran n'introduit pas une carte de verre, dont le fond
 *      effectif est la page floutée derrière et non du blanc.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Action from "@/components/consentement/Action";
import Panneau from "@/components/consentement/Panneau";
import { FINALITES, LIBELLES } from "@/lib/consentement";

const FAUTE = process.env.MIGEN_FAUTE ?? "";

const SOURCE = readFileSync(new URL("./Panneau.tsx", import.meta.url), "utf8");
const MODULE = readFileSync(
  new URL("./Panneau.module.css", import.meta.url),
  "utf8",
);
/* Les commentaires expliquent ce qui est interdit plus bas : les lire comme du
   code ferait échouer le contrôle sur ses propres explications. */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

let html = renderToStaticMarkup(<Panneau />);

// Faute injectée : une carte de verre, dont le fond effectif n'est pas connu.
// `--gsol` est un jeton de la charte, donc la faute passe sans peine le contrôle
// des couleurs littérales : c'est bien la mesurabilité des surfaces qui doit
// l'attraper, pas autre chose.
if (FAUTE === "verre") {
  html = html.replace(
    "background:var(--card)",
    "background:var(--gsol);backdrop-filter:blur(var(--gl-b))",
  );
}
/* Faute injectée : la petite mention remise au gris pâle de la maquette
   (`--ink4`, 2,48:1 sur `--card`). Le jeton change dans le rendu ET dans la
   table des mesures, sinon la faute serait attrapée par le rapprochement des
   deux au lieu de l'être par le calcul du contraste lui-même. */
const ENCRE_MENTION = FAUTE === "ink4" ? "ink4" : "ink2";
if (FAUTE === "ink4") {
  html = html.replaceAll("color:var(--ink2)", "color:var(--ink4)");
}

// ============================================================ échafaudage
// Le site n'a pas de mode sombre, et sa charte ne passe pas par la palette
// Tailwind par défaut : ni l'une ni l'autre ne doit survivre.
for (const motif of [
  /\bzinc-\d/,
  /\b(?:neutral|gray|slate|stone)-\d/,
  /\bdark:/,
  /\b(?:text|bg|border|divide|accent)-(?:white|black)\b/,
]) {
  assert.ok(!motif.test(html), `échafaudage dans le rendu : ${motif}`);
  assert.ok(!motif.test(SOURCE), `échafaudage dans la source : ${motif}`);
  assert.ok(!motif.test(MODULE), `échafaudage dans la feuille : ${motif}`);
}

// ======================================================= jetons de la charte
// Aucune couleur littérale, nulle part, et les jetons réellement présents.
for (const [ou, texte] of [
  ["le rendu", html],
  ["la feuille", MODULE],
] as const) {
  assert.ok(
    !/#[0-9a-fA-F]{3,8}\b/.test(texte),
    `une couleur littérale en hexadécimal dans ${ou}`,
  );
  assert.ok(!/\brgba?\(/.test(texte), `une couleur littérale rgb() dans ${ou}`);
}
// Les jetons de structure. Les encres, elles, sont rapprochées de la table des
// mesures plus bas : chacune doit avoir été CALCULÉE, pas seulement présente.
for (const jeton of ["--card", "--line", "--rad-s", "--fb", "--acc", "--tr"]) {
  assert.ok(html.includes(`var(${jeton})`), `jeton absent du rendu : ${jeton}`);
}
for (const jeton of ["--chip", "--acc-ink"]) {
  assert.ok(
    MODULE.includes(`var(${jeton})`),
    `jeton absent de la feuille : ${jeton}`,
  );
}

// ================================================ POIDS ÉGAL des trois boutons
// « Tout accepter », « Tout refuser » et « Personnaliser » ouvrent le
// dispositif ; « Enregistrer mes choix » le referme. Les quatre doivent avoir
// le même poids visuel. On compare leurs CHAÎNES DE STYLE : le squelette rendu
// (élément, attributs, classes) plus les déclarations de la règle qui habille
// ces classes. Deux boutons de poids égal donnent deux chaînes égales.
//
// `bun` résout un import de module CSS vers un chemin, pas vers un objet de
// classes : sous `bun` le rendu ne porte donc aucun attribut `class`, c'est Next
// qui fait la correspondance. Les déclarations sont donc relues dans la feuille
// du bouton, dont on vérifie d'abord qu'elle n'a qu'une seule règle de base :
// sans cela, deux libellés pourraient emprunter deux habillages différents.
const CSS_ACTION = readFileSync(
  new URL("./Action.module.css", import.meta.url),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

const basesAction = [...CSS_ACTION.matchAll(/(^|\})\s*(\.[\w-]+)\s*\{/g)].map(
  (bloc) => bloc[2],
);
assert.deepEqual(
  [...new Set(basesAction)],
  [".action"],
  "la feuille du bouton a plus d'une règle de base : un libellé pourrait être habillé autrement qu'un autre",
);

const DECLARATIONS = (/\.action\s*\{([^}]*)\}/.exec(CSS_ACTION)?.[1] ?? "")
  .split(";")
  .map((d) => d.trim())
  .filter(Boolean)
  .sort()
  .join(";");
assert.ok(DECLARATIONS.length > 0, "la règle du bouton est vide");

const LIBELLES_ACTIONS = [
  "Tout accepter",
  "Tout refuser",
  "Personnaliser",
  "Enregistrer mes choix",
];

const chaines = LIBELLES_ACTIONS.map((libelle, rang) => {
  const rendu = renderToStaticMarkup(
    <Action libelle={libelle} onClick={() => {}} />,
  );
  // Faute injectée : « Tout refuser » rendu plus discret que les autres, comme
  // le ferait une variante « secondaire » ou un style passé par l'appelant.
  const squelette =
    FAUTE === "discret" && rang === 1
      ? rendu.replace("<button", '<button style="opacity:.6;font-size:13px"')
      : rendu;
  return `${squelette.replace(libelle, "")}|${DECLARATIONS}`;
});

for (let rang = 1; rang < chaines.length; rang += 1) {
  assert.equal(
    chaines[rang],
    chaines[0],
    `« ${LIBELLES_ACTIONS[rang] } » n'a pas le même poids visuel que « ${LIBELLES_ACTIONS[0]} » : consentement invalide (CNIL)`,
  );
}

// Même police, même remplissage, même rayon : les trois propriétés par
// lesquelles un bouton se rend discret. Elles sont dans la règle unique, donc
// identiques pour les quatre libellés, et le contrôle refuse qu'elles s'en
// aillent.
for (const propriete of ["font:", "padding:", "border-radius:"]) {
  assert.ok(
    DECLARATIONS.includes(propriete),
    `la règle unique du bouton a perdu « ${propriete} » : plus rien ne garantit le poids égal`,
  );
}

// La porte par laquelle un biais entrerait depuis CE fichier : un bouton écrit
// à la main à côté des deux autres, ou un habillage passé à `Action`.
assert.ok(
  !/<button/.test(CODE),
  "un bouton écrit à la main dans le panneau : il échapperait à la règle unique",
);
assert.deepEqual(
  [...CODE.matchAll(/<Action\b([\s\S]*?)\/>/g)].map((appel) =>
    [...appel[1].matchAll(/(\w+)=/g)].map((attribut) => attribut[1]).sort(),
  ),
  [
    ["libelle", "onClick"],
    ["libelle", "onClick"],
  ],
  "un appel à Action passe autre chose que son libellé et son action",
);

// ===================================================== surfaces mesurables
// Le contraste calculé plus bas ne vaut que si les fonds rendus sont ceux que
// l'on mesure. Une carte de verre rend le fond effectif inconnu : c'est la page
// floutée derrière, qui peut être une carte anthracite.
const fonds = [...html.matchAll(/background:([^;"]+)/g)].map((f) => f[1].trim());
assert.deepEqual(
  [...new Set(fonds)].sort(),
  ["var(--card)", "var(--line)"],
  "un fond du panneau n'est pas une surface opaque de la charte",
);
assert.ok(
  !/backdrop-filter|--gl-a|--gl-b/.test(html),
  "une carte de verre dans le panneau : le contraste du texte dépendrait de ce qui défile derrière",
);

// ======================================================= contraste, CALCULÉ
const GLOBALS = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);

type Couleur = readonly [number, number, number];

/** La valeur brute d'un jeton, telle qu'elle est écrite dans la charte. */
function valeurJeton(nom: string): string {
  const trouve = new RegExp(`--${nom}:\\s*([^;]+);`).exec(GLOBALS);
  assert.ok(trouve, `jeton absent de app/globals.css : --${nom}`);
  return trouve[1].trim();
}

/** `#fff`, `#1c1b19` ou `rgba(28, 27, 25, 0.055)` vers trois canaux et l'alpha. */
function couleur(nom: string): { canaux: Couleur; alpha: number } {
  const brut = valeurJeton(nom);
  const rgba = /rgba?\(([^)]+)\)/.exec(brut);
  if (rgba) {
    const parts = rgba[1].split(",").map((p) => Number(p.trim()));
    return {
      canaux: [parts[0], parts[1], parts[2]],
      alpha: parts[3] ?? 1,
    };
  }
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(brut);
  assert.ok(hex, `jeton --${nom} illisible : ${brut}`);
  const plein =
    hex[1].length === 3
      ? [...hex[1]].map((c) => c + c).join("")
      : hex[1];
  return {
    canaux: [
      parseInt(plein.slice(0, 2), 16),
      parseInt(plein.slice(2, 4), 16),
      parseInt(plein.slice(4, 6), 16),
    ],
    alpha: 1,
  };
}

/** Un jeton translucide composé sur le fond qu'il recouvre vraiment. */
function compose(dessus: string, dessous: Couleur): Couleur {
  const { canaux, alpha } = couleur(dessus);
  return [0, 1, 2].map(
    (canal) => alpha * canaux[canal] + (1 - alpha) * dessous[canal],
  ) as unknown as Couleur;
}

/** WCAG 2.x, 1.4.3 : luminance relative puis rapport de contraste. */
function luminance([r, v, b]: Couleur): number {
  const lineaire = (canal: number): number => {
    const s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lineaire(r) + 0.7152 * lineaire(v) + 0.0722 * lineaire(b);
}

function rapport(a: Couleur, b: Couleur): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (haut + 0.05) / (bas + 0.05);
}

const CARD = couleur("card").canaux;
const CHIP_SUR_CARD = compose("chip", CARD);
const FOOT = couleur("foot").canaux;
/* Le piège de la carte de verre, chiffré : 58,2 % de blanc par-dessus la page.
   Si cette page est une carte anthracite, le fond effectif est un gris moyen. */
const VERRE_SUR_SOMBRE: Couleur = [0, 1, 2].map(
  (canal) =>
    Number(valeurJeton("gl-a")) * 255 +
    (1 - Number(valeurJeton("gl-a"))) * FOOT[canal],
) as unknown as Couleur;

const MESURES: readonly {
  element: string;
  encre: string;
  fond: Couleur;
  nomFond: string;
  plancher: number;
}[] = [
  {
    element: "intitulé de finalité",
    encre: "ink",
    fond: CARD,
    nomFond: "--card",
    plancher: 4.5,
  },
  {
    element: "intitulé de finalité, rangée survolée",
    encre: "ink",
    fond: CHIP_SUR_CARD,
    nomFond: "--chip au-dessus de --card",
    plancher: 4.5,
  },
  {
    element: "description de la finalité",
    encre: ENCRE_MENTION,
    fond: CARD,
    nomFond: "--card",
    plancher: 4.5,
  },
  {
    element: "destinataires et note de bas de cadre",
    encre: ENCRE_MENTION,
    fond: CARD,
    nomFond: "--card",
    plancher: 4.5,
  },
  {
    element: "lien vers la politique de confidentialité",
    encre: "acc-ink",
    fond: CARD,
    nomFond: "--card",
    plancher: 4.5,
  },
  {
    // WCAG 1.4.11 : la limite d'un élément d'interface, 3:1. C'est le
    // remplissage de la case cochée (`accent-color: var(--ink)`).
    element: "case à cocher, limite de la case cochée",
    encre: "ink",
    fond: CARD,
    nomFond: "--card",
    plancher: 3,
  },
];

for (const { element, encre, fond, nomFond, plancher } of MESURES) {
  const mesure = rapport(couleur(encre).canaux, fond);
  assert.ok(
    mesure >= plancher,
    `${element} : --${encre} sur ${nomFond} vaut ${mesure.toFixed(2)}:1, plancher ${plancher}:1`,
  );
  console.log(
    `  ${mesure.toFixed(2).padStart(6)}:1  --${encre} sur ${nomFond}, ${element}`,
  );
}

/* Chaque encre RENDUE doit figurer dans la table ci-dessus : sans ce
   rapprochement, on pourrait mesurer six couples irréprochables et en afficher
   un septième jamais calculé. Seule la propriété `color` est lue, pas
   `accent-color` ni `text-decoration-color`, qui ne portent pas de texte. */
const encresRendues = [...html.matchAll(/[;"]color:var\(--([\w-]+)\)/g)].map(
  (trouve) => trouve[1],
);
assert.ok(encresRendues.length > 0, "aucune encre lue dans le rendu");
for (const encre of new Set(encresRendues)) {
  assert.ok(
    MESURES.some((mesure) => mesure.encre === encre),
    `--${encre} est rendue mais son contraste n'a jamais été calculé`,
  );
}
console.log(
  `  ${rapport(couleur("ink2").canaux, VERRE_SUR_SOMBRE).toFixed(2).padStart(6)}:1  ` +
    "ce que --ink2 aurait donné sur une carte de verre posée sur --foot (cas écarté)",
);

// ============================================= les quatre finalités, intactes
/* Le texte se vérifie NORMALISÉ : React échappe l'apostroche en `&#x27;` et
   l'espace insécable en `&nbsp;`. Comparer au HTML brut ferait échouer le
   contrôle sur des libellés parfaitement intacts. */
const texte = html
  .replaceAll("&#x27;", "'")
  .replaceAll("&#39;", "'")
  .replaceAll("’", "'")
  .replaceAll("&quot;", '"')
  .replaceAll("&nbsp;", " ")
  .replaceAll(" ", " ")
  .replaceAll("&amp;", "&");

assert.equal(FINALITES.length, 4, "le nombre de finalités a changé");
for (const finalite of FINALITES) {
  const attendu = LIBELLES[finalite].titre.replaceAll("’", "'");
  assert.ok(
    texte.includes(attendu),
    `libellé de finalité absent du rendu : ${attendu}`,
  );
  for (const destinataire of LIBELLES[finalite].destinataires) {
    assert.ok(
      texte.includes(destinataire),
      `destinataire non nommé pour ${finalite} : ${destinataire}`,
    );
  }
}
assert.ok(
  texte.includes("Suivi commercial"),
  "la finalité « suivi_commercial » a disparu : HubSpot doit rester séparé de la mesure d'audience",
);

const cases = [...html.matchAll(/<input[^>]*>/g)].map((c) => c[0]);
assert.equal(cases.length, 4, "une case à cocher par finalité, pas une de plus");
for (const champ of cases) {
  assert.ok(champ.includes('type="checkbox"'), "un champ n'est pas une case à cocher");
  // Aucune finalité n'est techniquement nécessaire ici : aucune case verrouillée.
  assert.ok(!/\bdisabled\b/.test(champ), "une case est verrouillée sans motif");
  // L'état d'un interrupteur ne doit pas se lire par la seule couleur. Une case
  // native le dit par la FORME du crochet. `role="switch"` sur une case
  // déformée en 20x36 ne donnait ni l'un ni l'autre.
  assert.ok(
    !champ.includes('role="switch"'),
    "la case est annoncée comme un interrupteur alors que le navigateur dessine une case",
  );
  assert.ok(
    champ.includes("aria-describedby"),
    "la case n'est pas rattachée à sa description",
  );
}

// =================================================== cible tactile, WCAG 2.5.8
// La bascule fait 44px de haut sur toute la largeur de la rangée, bien au-delà
// du plancher de 24px du critère 2.5.8 de la WCAG 2.2.
assert.equal(
  html.split("min-height:44px").length - 1,
  4,
  "une bascule a perdu sa hauteur de cible tactile",
);

// ============================================= pas de mur de consentement
// Le bandeau ne doit pas bloquer la lecture de la page. `showModal()` rendrait
// tout le site inerte jusqu'au choix, ce qui est le « cookie wall » interdit.
// Commentaires retirés : le bandeau EXPLIQUE pourquoi il n'utilise pas
// `showModal()`, et le contrôle ne doit pas échouer sur cette explication.
const BANDEAU = readFileSync(new URL("./Bandeau.tsx", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
assert.ok(
  !BANDEAU.includes("showModal"),
  "le bandeau s'ouvre en modal : mur de consentement",
);
assert.ok(BANDEAU.includes(".show()"), "le bandeau ne s'ouvre plus en non modal");

// ================================================ interdits de copie du contrat
for (const interdit of [
  "—",
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
]) {
  assert.ok(
    !texte.toLowerCase().includes(interdit.toLowerCase()),
    `copie interdite dans le panneau : ${interdit}`,
  );
}

console.log(
  "Détail par finalité : 4 finalités intactes, 4 boutons de poids égal, " +
    "surfaces opaques, contrastes calculés, cibles de 44px, pas de mur.",
);
