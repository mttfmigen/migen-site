/**
 * Porte de la page contact, sans navigateur.
 *
 *   bun components/site/contact/verification-contact.tsx
 *   bun components/site/contact/verification-contact.tsx --controle
 *
 * Sans cadre de test, comme les autres `verification.*` du projet. Le mode
 * `--controle` rejoue onze régressions connues et exige que CHACUNE fasse
 * échouer la porte : une porte qui ne sait pas échouer ne vaut rien.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ELLE A CHANGÉ DE RÉFÉRENCE LE 12/10, ET C'EST LE CŒUR DE LA RÉPARATION.
 *
 * Elle relisait `maquette/accueil-rendu.html`, lignes 2950 à 3024. Ce fichier
 * est un EXPORT DU 02/10. La référence du projet, posée par Mehdi et écrite
 * dans `docs/PASSATION.md` §1, est l'application VIVANTE,
 * `maquette/site-final-autonome.html` (07/10). `/contact/` n'a pas de capture
 * dans `maquette/rendu/` : son haut de page est sur mesure, les 248 captures
 * couvrent le corpus. L'application est donc sa seule référence.
 *
 * Les deux fichiers ne disent pas la même chose. Mesuré : sur l'écran
 * « Contact / devis », ils diffèrent d'UNE chaîne, et c'est une étiquette de
 * navigation. L'export écrit « Les cinq offres », la maquette vivante écrit
 * « Les six offres ». La porte validait donc un compte périmé, pendant que
 * `/offres/` publiait six offres et écrivait « six offres » deux fois dans la
 * même mise en production. Le contrôle négatif n° 6 rejoue exactement cette
 * cécité : il relit l'export et exige que la porte le refuse.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS LA MAQUETTE À CHAQUE EXÉCUTION, jamais
 * écrite de mémoire : une note de lecture peut se tromper et personne ne peut
 * la rejouer. L'écran est repéré par son `data-screen-label`, pas par un
 * numéro de ligne, précisément pour qu'un déplacement dans le fichier ne
 * puisse pas faire lire autre chose en silence.
 *
 * CE QU'ELLE SAIT VÉRIFIER DE PLUS, depuis le 12/10 : la STRUCTURE et la
 * DISPOSITION, et non plus seulement la copie. L'ordre des blocs, le rythme
 * vertical des sections, le nombre de colonnes de chaque grille. C'est ce
 * qu'elle ne regardait pas quand Mehdi a écrit « la page ne respecte pas la
 * maquette ».
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Agences from "@/components/site/contact/Agences";
import ApresDemande from "@/components/site/contact/ApresDemande";
import Ouverture from "@/components/site/contact/Ouverture";
import PourLesTechniciens from "@/components/site/contact/PourLesTechniciens";
import { TITRE_SEO } from "@/components/site/contact/metadonnees";
import { appliqueDecisions } from "@/lib/decisions-copie";

const CONTROLE = process.argv.includes("--controle");

/** L'étiquette que la maquette donne elle-même à cet écran. */
const ETIQUETTE = "Contact / devis";

const MAQUETTE_VIVANTE = new URL(
  "../../../maquette/site-final-autonome.html",
  import.meta.url,
);
/** L'export du 02/10. Il ne sert QU'AU contrôle négatif n° 6. */
const MAQUETTE_PERIMEE = new URL(
  "../../../maquette/accueil-rendu.html",
  import.meta.url,
);

// ───────────────────────────────────────────────────── lecture de la maquette

/**
 * Désamorce le HTML porté dans une chaîne JavaScript.
 *
 * La maquette vivante embarque ses écrans dans du JavaScript : ses guillemets
 * sont échappés et ses barres obliques écrites `/`. L'export du 02/10 les
 * porte en clair. On ne désamorce donc que ce qui est venu échappé.
 */
function desamorce(texte: string): string {
  return texte
    .replace(/\\u002F/gi, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

/** Le `<main>` de l'écran contact, extrait par son étiquette, pas par ligne. */
function ecranContact(fichier: URL): string {
  const brut = readFileSync(fichier, "utf8");
  const echappee = `data-screen-label=\\"${ETIQUETTE}`;
  const claire = `data-screen-label="${ETIQUETTE}`;

  let position = brut.indexOf(echappee);
  const estEchappe = position >= 0;
  if (!estEchappe) position = brut.indexOf(claire);
  assert.ok(
    position >= 0,
    `l'écran « ${ETIQUETTE} » est introuvable dans ${fichier.pathname}`,
  );

  const debut = brut.lastIndexOf("<main ", position);
  assert.ok(debut >= 0, "l'étiquette d'écran n'est pas portée par un <main>");

  // L'écran s'arrête au début du suivant. Sans suivant, à la fin du fichier.
  const marqueur = estEchappe
    ? 'data-screen-label=\\"'
    : 'data-screen-label="';
  const suivant = brut.indexOf(marqueur, position + marqueur.length);
  const morceau = brut.slice(debut, suivant >= 0 ? suivant : brut.length);
  return estEchappe ? desamorce(morceau) : morceau;
}

const maquette = ecranContact(MAQUETTE_VIVANTE);

/**
 * Met maquette et rendu sur le même texte.
 *
 * La maquette écrit `&nbsp;`, React rend le caractère lui-même ; les deux
 * utilisent l'apostrophe typographique, mais pas toujours. Comparer sans
 * normaliser ferait échouer la porte sur de la ponctuation.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#x27;|&#39;/g, "'")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

// ──────────────────────────────────────────────── les sections de la maquette

/** Les `<section>` de premier niveau : cet écran n'en imbrique aucune. */
function balisesSection(html: string): string[] {
  return [...html.matchAll(/<section\b[^>]*>/g)].map((m) => m[0]);
}

function paddingDe(balise: string): string {
  const style = /\sstyle="([^"]*)"/.exec(balise);
  assert.ok(style, `section sans style en ligne : ${balise.slice(0, 90)}`);
  const padding = /(?:^|;)\s*padding:([^;]*)/.exec(style[1]);
  assert.ok(padding, `section sans padding : ${style[1]}`);
  return padding[1].trim();
}

function compteGrilles(html: string): number {
  return (html.match(/display:grid/g) ?? []).length;
}

const SECTIONS_MAQUETTE = balisesSection(maquette);
assert.equal(
  SECTIONS_MAQUETTE.length,
  3,
  `la maquette tenait trois sections, elle en tient ${SECTIONS_MAQUETTE.length} : relire l'écran avant de croire la porte`,
);

const PADDINGS_MAQUETTE = SECTIONS_MAQUETTE.map(paddingDe);
/** `70px 40px 0` : le haut de page sur mesure de cet écran. */
const P_OUVERTURE = PADDINGS_MAQUETTE[0];
/** `var(--sec) 0 0` : une section qui a quelque chose après elle. */
const P_INTERMEDIAIRE = PADDINGS_MAQUETTE[1];
/** `var(--sec) 0 var(--sec)` : la section qui FERME la page. */
const P_FERMETURE = PADDINGS_MAQUETTE[PADDINGS_MAQUETTE.length - 1];

assert.notEqual(
  P_INTERMEDIAIRE,
  P_FERMETURE,
  "la maquette ne distingue plus la section qui ferme la page de celles du " +
    "milieu : la règle de rythme vérifiée ci-dessous n'a plus d'objet",
);

// ───────────────────────────────────────────────────────── le rendu du site

interface Bloc {
  readonly nom: string;
  readonly html: string;
}

const RENDU_APRES_DEMANDE = renderToStaticMarkup(<ApresDemande />);
const RENDU_TECHNICIENS = renderToStaticMarkup(<PourLesTechniciens />);
const RENDU_AGENCES = renderToStaticMarkup(<Agences />);

/* L'ORDRE EST CELUI DE `app/contact/page.tsx`. La maquette en tient trois ;
   le site en tient quatre depuis que la carte candidature a sa section
   (arbitrage de Mehdi du 12/10). Oublier la quatrième ici rendrait la porte
   aveugle à toute la bande technicien, et c'est déjà arrivé. */
const BLOCS: readonly Bloc[] = [
  { nom: "Ouverture", html: renderToStaticMarkup(<Ouverture />) },
  { nom: "ApresDemande", html: RENDU_APRES_DEMANDE },
  { nom: "Agences", html: RENDU_AGENCES },
  { nom: "PourLesTechniciens", html: RENDU_TECHNICIENS },
];

const html = BLOCS.map((b) => b.html).join("");
const rendu = normalise(html);
// Les décisions de copie (lib/decisions-copie.ts) sont appliquées à la
// maquette avant toute comparaison : « 10 % des techniciens retenus ».
const source = normalise(appliqueDecisions(maquette));

// ═══════════════════════════════════════════════ 1. RYTHME VERTICAL (mesuré)

/**
 * Le rythme de la maquette, appliqué au nombre réel de sections.
 *
 * MESURÉ EN PRODUCTION LE 12/10, AVANT CORRECTION, écarts entre contenus :
 * 120 / 120 / **240** / **0** px à 1280 px, 64 / 64 / **128** / **0** px à
 * 390 px. La quatrième section avait été ajoutée sans déplacer la fermeture de
 * page : `Agences` la portait encore, `PourLesTechniciens` non. Deux défauts
 * dans le même oubli, un trou double avant la bande technicien et cette bande
 * collée au pied de page. Après correction : 120 / 120 / 120 / 120.
 */
function verifieRythme(blocs: readonly Bloc[]): void {
  assert.ok(blocs.length >= 2, "il faut au moins deux sections pour un rythme");
  const paddings = blocs.map((b) => paddingDe(baliseDe(b)));

  assert.equal(
    paddings[0],
    P_OUVERTURE,
    `« ${blocs[0].nom} » ouvre la page : la maquette lui donne « ${P_OUVERTURE} », elle porte « ${paddings[0]} »`,
  );
  for (let rang = 1; rang < paddings.length - 1; rang += 1) {
    assert.equal(
      paddings[rang],
      P_INTERMEDIAIRE,
      `« ${blocs[rang].nom} » a une section après elle : la maquette lui donne « ${P_INTERMEDIAIRE} », elle porte « ${paddings[rang]} »`,
    );
  }
  const derniere = paddings.length - 1;
  assert.equal(
    paddings[derniere],
    P_FERMETURE,
    `« ${blocs[derniere].nom} » FERME la page : la maquette lui donne « ${P_FERMETURE} », elle porte « ${paddings[derniere]} ». ` +
      "Sans cette fermeture, le dernier bloc touche le pied de page.",
  );
  const ferment = blocs.filter(
    (b, rang) => paddings[rang] === P_FERMETURE && rang !== derniere,
  );
  assert.equal(
    ferment.length,
    0,
    `fermeture de page portée par une section du milieu : ${ferment
      .map((b) => `« ${b.nom} »`)
      .join(", ")}. Elle y creuse un trou double.`,
  );
}

function baliseDe(bloc: Bloc): string {
  const m = /^<section\b[^>]*>/.exec(bloc.html.trim());
  assert.ok(
    m,
    `« ${bloc.nom} » n'ouvre pas sur une <section> : ${bloc.html.slice(0, 70)}`,
  );
  return m[0];
}

verifieRythme(BLOCS);

// ══════════════════════════════════════════════════ 2. ORDRE DES BLOCS

/** Position de chaque repère, dans l'ordre demandé. Échoue si l'un manque. */
function rangs(texte: string, reperes: readonly string[]): number[] {
  return reperes.map((repere) => {
    const position = texte.indexOf(normalise(repere));
    assert.ok(position >= 0, `repère d'ordre introuvable : « ${repere} »`);
    return position;
  });
}

function verifieCroissant(
  positions: readonly number[],
  reperes: readonly string[],
  ou: string,
): void {
  for (let rang = 1; rang < positions.length; rang += 1) {
    assert.ok(
      positions[rang] > positions[rang - 1],
      `ordre des blocs cassé ${ou} : « ${reperes[rang]} » ne vient plus après « ${reperes[rang - 1]} »`,
    );
  }
}

/* LE SEUL ÉCART D'ORDRE EST LA CARTE CANDIDATURE, et il est daté.
   Maquette : Après votre demande → Vous êtes technicien → Nos agences.
   Site     : Après votre demande → Nos agences → Vous êtes technicien.
   Vérifier les deux ordres plutôt que le seul du site fait échouer la porte si
   quoi que ce soit D'AUTRE se déplace, d'un côté comme de l'autre. */
const ORDRE_MAQUETTE = [
  "Après votre demande",
  "Vous êtes technicien",
  "Nos agences",
];
const ORDRE_SITE = [
  "Après votre demande",
  "Nos agences",
  "Vous êtes technicien",
];

verifieCroissant(rangs(source, ORDRE_MAQUETTE), ORDRE_MAQUETTE, "dans la maquette");
verifieCroissant(rangs(rendu, ORDRE_SITE), ORDRE_SITE, "dans le rendu du site");

/* CE QUE LA PORTE NE SAVAIT PAS VÉRIFIER, et qui a laissé passer le défaut que
   Mehdi a trouvé le 12/10 : « tu parles d'un besoin et tu enchaînes sur un
   bouton qui renvoie vers l'espace candidat ». Elle exigeait « Vous êtes
   technicien ? » dans le rendu TOTAL, elle était donc satisfaite que la carte
   soit là sans jamais regarder OÙ. */
function verifieParcoursClient(sectionClient: string): void {
  assert.ok(
    !normalise(sectionClient).includes("Vous êtes technicien"),
    "la carte candidature est revenue DANS « Après votre demande » : la " +
      "section qui décrit le parcours client ne doit pas s'adresser au candidat",
  );
}
verifieParcoursClient(RENDU_APRES_DEMANDE);
assert.ok(
  normalise(RENDU_TECHNICIENS).includes("Postulez directement en ligne"),
  "la bande technicien ne rend plus son titre : le candidat qui atterrit sur " +
    "/contact/ n'a plus de chemin",
);

// ═══════════════════════════════════════════════ 3. NOMBRE DE COLONNES

/** Les grilles de la maquette TENUES telles quelles, source et rendu. */
const GRILLES_TENUES = [
  // Ouverture : texte à gauche, formulaire à droite.
  "grid-template-columns:1.12fr .88fr;gap:52px;align-items:start",
  // En-tête de section : titre à gauche, chapô à droite. Deux fois.
  "grid-template-columns:1.1fr .9fr;gap:56px;align-items:end",
  // Les trois étapes.
  "grid-template-columns:repeat(3,minmax(0,1fr));gap:12px",
];

for (const grille of GRILLES_TENUES) {
  const attendu = normalise(grille);
  assert.ok(
    source.includes(attendu),
    `cette grille n'est plus dans la maquette : « ${grille} »`,
  );
  assert.ok(
    rendu.includes(attendu),
    `grille de la maquette absente du rendu : « ${grille} »`,
  );
}

/**
 * Les grilles de la maquette que le site NE TIENT PAS, chacune déclarée.
 *
 * Le nombre de `display:grid` est la mesure la plus directe du nombre de
 * colonnes rendues : on compte les grilles de la section de la maquette et
 * celles du composant, et on exige que l'écart soit celui qui est écrit dans
 * le fichier. Un écart qui disparaît du commentaire fait échouer la porte même
 * s'il est toujours là dans le rendu.
 */
const COLONNES: readonly {
  readonly nom: string;
  readonly grilleMaquette: string;
  readonly grillesMaquette: number;
  readonly grillesRendu: number;
  readonly rendu: string;
  readonly fichier: string;
  readonly motif: string;
}[] = [
  {
    nom: "Nos agences",
    // Carte de France à gauche, liste des adresses à droite.
    grilleMaquette: "grid-template-columns:1.15fr .85fr;gap:14px;align-items:stretch",
    grillesMaquette: 2,
    grillesRendu: 1,
    rendu: RENDU_AGENCES,
    fichier: "Agences.tsx",
    motif:
      "la carte de la maquette (x-import MigenAgences) tient sur d3, topojson " +
      "et un atlas mondial téléchargé depuis un CDN à l'exécution",
  },
  {
    nom: "Vous êtes technicien",
    // Une seule carte dans une grille de deux : la moitié droite reste vide.
    grilleMaquette: "grid-template-columns:1fr 1fr;gap:12px;margin-top:12px",
    grillesMaquette: 1,
    grillesRendu: 0,
    rendu: RENDU_TECHNICIENS,
    fichier: "PourLesTechniciens.tsx",
    motif: "la carte est seule dans sa section, elle prend toute la largeur",
  },
];

function fichierSource(nom: string): string {
  return readFileSync(new URL(`./${nom}`, import.meta.url), "utf8");
}

/** La grille écartée doit être dans la maquette, absente du rendu, déclarée. */
function verifieColonnes(
  bloc: (typeof COLONNES)[number],
  texteSource: string,
  renduBloc: string,
  declaration: string,
): void {
  assert.ok(
    texteSource.includes(normalise(bloc.grilleMaquette)),
    `la maquette ne dispose plus « ${bloc.nom} » sur « ${bloc.grilleMaquette} » : cet écart n'a plus d'objet`,
  );
  assert.ok(
    !normalise(renduBloc).includes(normalise(bloc.grilleMaquette)),
    `« ${bloc.nom} » rend maintenant la grille de la maquette : l'écart est réparé, retirer sa déclaration de ${bloc.fichier}`,
  );
  const compte = compteGrilles(renduBloc);
  assert.equal(
    compte,
    bloc.grillesRendu,
    `« ${bloc.nom} » rend ${compte} grilles, ${bloc.grillesRendu} attendues (la maquette en a ${bloc.grillesMaquette})`,
  );
  const empreinte = bloc.grilleMaquette
    .replace("grid-template-columns:", "")
    .split(";")[0];
  assert.ok(
    declaration.includes(empreinte),
    `${bloc.fichier} ne déclare plus l'écart de disposition « ${empreinte} » : ` +
      "un écart qu'on ne nomme plus est un écart que personne ne répare",
  );
}

for (const bloc of COLONNES) {
  verifieColonnes(bloc, source, bloc.rendu, fichierSource(bloc.fichier));
}

// ═══════════════════════════════════════════════════════════════ 4. COPIE

/** Ce qui doit se trouver dans la maquette ET dans le rendu. */
const PORTE = [
  // Copie de l'ouverture.
  "Rappel dans l'heure",
  "Astreinte",
  "Dites-nous ce qu'il faut tenir.",
  "On vous rappelle dans l'heure.",
  "Un chargé d'affaires étudie votre demande, sélectionne les techniciens adaptés et vous les présente pour validation avant toute intervention.",
  /* « Les SIX offres », mot de la maquette VIVANTE. L'export du 02/10 écrit
     « cinq », et c'est lui que la porte relisait. Mesuré le 12/10 : /offres/
     publie six offres et écrit « six offres » deux fois. */
  "Les six offres",
  "10 %",
  "des techniciens retenus",
  // « +200 clients, sans jamais préciser « réguliers » », règle validée par
  // le client : la carte est rendue mot pour mot.
  "+200",
  "clients industriels",
  "Décrire mon besoin",
  // Copie des trois étapes.
  "Après votre demande",
  "Trois étapes, un interlocuteur nommé.",
  "Pas de standard ni de ticket : la personne qui vous rappelle est celle qui suivra votre site.",
  "Il qualifie le besoin avec vous : technologies, habilitations, délai, volume.",
  "Il visite votre site",
  "Contraintes, sécurité, installation : on voit avant de proposer.",
  "Vous validez les techniciens",
  "Vous rencontrez chaque profil retenu avant son arrivée sur site.",
  "Vous êtes technicien ?",
  "Postulez directement en ligne",
  "font:600 20px var(--fb)",
  // Copie des agences.
  "Nos agences",
  "plus proche de votre site, jamais du siège.",
  "129 chemin du Moulin Carron, 69130 Écully",
  "Level 20, 48 Burj Tower, Downtown",
  "2020 route Transcanadienne, Dorval, Québec",
  // Géométrie et habillage, recopiés tels quels.
  "scroll-margin-top:96px",
  "padding:70px 40px 0",
  "max-width:1200px",
  "clamp(38px,4.4vw,66px)",
  "clamp(30px,3.3vw,48px)",
  "letter-spacing:-.045em",
  "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
  "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  "padding:28px 28px 30px",
  "padding:12px 30px 18px",
  "border-top:1px solid var(--line)",
];

function verifiePorte(texteSource: string, texteRendu: string): void {
  for (const valeur of PORTE) {
    const attendu = normalise(valeur);
    assert.ok(
      texteSource.includes(attendu),
      `cette valeur n'est plus dans l'écran « ${ETIQUETTE} » de la maquette : « ${valeur} »`,
    );
    assert.ok(
      texteRendu.includes(attendu),
      `valeur de la maquette absente du rendu : « ${valeur} »`,
    );
  }
}
verifiePorte(source, rendu);

/* Ce que la maquette dit et que le CONTRAT corrige : présent dans la source,
   interdit dans le rendu. Les deux côtés sont vérifiés, sinon la porte
   passerait aussi le jour où la maquette change et où la correction n'a plus
   d'objet. */
const CORRIGE: readonly [string, string][] = [
  ["5", "agences en France"],
  ["Cinq agences en France, deux à l'international.", "Cinq agences en France"],
  ["48 h", "48 h"],
  ["3 sem.", "3 sem."],
  ["Siège — Limonest", "Siège — Limonest"],
  ["réponse sous 48 h ouvrées", "sous 48 h"],
  /* LE MOIGNON. La maquette écrit « Quatre écrans, réponse sous 48 h
     ouvrées. » La purge du seul « 48 h » laissait « Quatre écrans. » en
     ligne, une phrase qui n'annonce rien, et fausse de surcroît : notre
     formulaire de candidature tient sur UN écran. Couper une phrase en
     deux ne suffit pas, il faut que ce qui reste tienne debout. */
  ["Quatre écrans", "Quatre écrans"],
  ["de l'agence la plus proche", "de l'agence la plus proche"],
];

/**
 * Les écarts à la maquette qui ne sont PAS arbitrés, verrouillés pour qu'ils
 * ne dérivent pas en silence. Ils attendent Mehdi, ils ne s'effacent pas.
 *
 *   · « Bâtiment 3 » : la maquette écrit « 1 rue des Vergers, Bâtiment 3,
 *     69760 Limonest », le site et `CLAUDE.md` écrivent l'adresse sans le
 *     bâtiment. Une adresse postale est une donnée du client : on la signale,
 *     on ne la réécrit pas.
 *   · la ligne de détail des hubs français, partie avec sa rangée (Paris,
 *     Strasbourg, Nantes et Toulouse sont des hubs, pas des agences).
 */
const NON_ARBITRE: readonly [string, string][] = [
  ["1 rue des Vergers, Bâtiment 3, 69760 Limonest", "Bâtiment 3"],
  [
    "Essonne · Bas-Rhin · Loire-Atlantique · Haute-Garonne",
    "Essonne · Bas-Rhin",
  ],
];

function verifieEcarts(
  paires: readonly [string, string][],
  texteSource: string,
  texteRendu: string,
): void {
  for (const [dansLaMaquette, interditAuRendu] of paires) {
    assert.ok(
      texteSource.includes(normalise(dansLaMaquette)),
      `la maquette ne contient plus « ${dansLaMaquette} » : cet écart n'a plus d'objet`,
    );
    assert.ok(
      !texteRendu.includes(normalise(interditAuRendu)),
      `formulation écartée toujours rendue : « ${interditAuRendu} »`,
    );
  }
}
verifieEcarts(CORRIGE, source, rendu);
verifieEcarts(NON_ARBITRE, source, rendu);

/* Les interdits de copie du contrat, cherchés dans le rendu. Le tiret cadratin
   et le demi-cadratin en font partie. */
const INTERDITS = [
  "agences en France",
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
];

function verifieInterdits(texteRendu: string): void {
  for (const interdit of INTERDITS) {
    assert.ok(
      !texteRendu.includes(interdit),
      `copie interdite rendue : « ${interdit} »`,
    );
  }
}
verifieInterdits(rendu);

/* Les quatre agences du contrat, et aucune autre.
   LE SIÈGE EST À LIMONEST, L'AGENCE EST À ÉCULLY : décision de Mehdi du 09/10,
   qui renverse la sienne du 07/10 et donne raison à l'audit de Nathan. Cette
   assertion a donc changé de sens deux fois en trois jours ; elle porte
   désormais LES DEUX, parce que la page doit nommer le siège ET l'agence, et
   que vérifier l'absence de l'un des deux était justement ce qui a laissé
   passer l'erreur. */
assert.ok(rendu.includes("Limonest"), "le siège de Limonest doit être nommé");
assert.ok(rendu.includes("Écully"), "l'agence d'Écully doit être nommée");
assert.ok(
  rendu.includes("1 rue des Vergers, 69760 Limonest"),
  "l'adresse du siège doit être celle du contrat",
);
assert.ok(
  rendu.includes("Dubaï") && rendu.includes("Montréal") && rendu.includes("Madrid"),
);
for (const ancienne of ["Strasbourg", "Toulouse", "Nantes"]) {
  assert.ok(
    !rendu.includes(ancienne),
    `« ${ancienne} » est un hub ou une ancienne adresse, pas une agence`,
  );
}

// ═════════════════════════════════════════════════════ 5. DOCUMENT ET LIENS

const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
assert.equal(h1.length, 1, `un seul h1 attendu, ${h1.length} rendus`);
const texteH1 = normalise(h1[0][1].replace(/<[^>]+>/g, " ")).trim();
assert.ok(texteH1.length > 0, "le h1 est vide");

/* Un h2 par section de contenu : les trois sections qui suivent l'ouverture
   doivent chacune figurer dans la structure du document. La bande technicien
   titrait en `div` avant le 12/10, parce qu'elle vivait sous le h2 d'une autre
   section. */
const h2 = [...html.matchAll(/<h2\b[^>]*>/g)];
assert.equal(
  h2.length,
  BLOCS.length - 1,
  `${BLOCS.length - 1} h2 attendus, un par section après l'ouverture, ${h2.length} rendus`,
);

assert.notEqual(
  normalise(TITRE_SEO).trim().toLowerCase(),
  texteH1.toLowerCase(),
  "le meta title ne doit pas être identique au h1",
);

// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
assert.ok(
  !html.includes('href="#"'),
  'un lien de la page contact est rendu inerte (href="#")',
);

// La charte vit dans les jetons de `app/globals.css`. Une couleur Tailwind par
// défaut ou une variante `dark:` à côté d'eux, c'est deux chartes dans un écran.
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.doesNotMatch(
    classe[1],
    /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bdark:[a-z-]+|\b(?:text|bg|border)-(?:white|black)\b/,
    `classe de couleur Tailwind rendue : « ${classe[1]} »`,
  );
}

assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc est rendu avec une opacité nulle",
);

console.log(
  `Page contact, mesurée contre la maquette VIVANTE (écran « ${ETIQUETTE} ») : ` +
    `${BLOCS.length} sections dans l'ordre, rythme vertical ${PADDINGS_MAQUETTE.join(" | ")}, ` +
    `${GRILLES_TENUES.length} grilles tenues, ${COLONNES.length} écarts de colonnes déclarés, ` +
    `${PORTE.length} valeurs relues, ${CORRIGE.length} corrections de contrat, ` +
    `${NON_ARBITRE.length} écarts non arbitrés verrouillés, un seul h1, ${h2.length} h2.`,
);

// ═════════════════════════════════════════════════ 6. CONTRÔLES NÉGATIFS

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
    `CONTRÔLE NÉGATIF MUET : « ${nom} » n'a pas fait échouer la porte. ` +
      "Tant qu'il est muet, la porte ne prouve rien.",
  );
  console.log(`  tenu : ${nom}`);
}

const section = (padding: string) =>
  `<section style="padding:${padding}">x</section>`;

console.log("\nContrôles négatifs, chacun doit faire échouer la porte :");

// 1. LE DÉFAUT EXACT RÉPARÉ LE 12/10.
controle(
  "fermeture de page laissée à « Nos agences », bande technicien collée au pied",
  () =>
    verifieRythme([
      BLOCS[0],
      BLOCS[1],
      { nom: "Agences", html: section(P_FERMETURE) },
      { nom: "PourLesTechniciens", html: section(P_INTERMEDIAIRE) },
    ]),
);

// 2. Aucune section ne ferme : tout le bas de page disparaît.
controle("aucune section ne ferme la page", () =>
  verifieRythme([
    BLOCS[0],
    { nom: "ApresDemande", html: section(P_INTERMEDIAIRE) },
    { nom: "Agences", html: section(P_INTERMEDIAIRE) },
    { nom: "PourLesTechniciens", html: section(P_INTERMEDIAIRE) },
  ]),
);

// 3. Deux fermetures : un trou double au milieu.
controle("deux sections portent la fermeture de page", () =>
  verifieRythme([
    BLOCS[0],
    { nom: "ApresDemande", html: section(P_INTERMEDIAIRE) },
    { nom: "Agences", html: section(P_FERMETURE) },
    { nom: "PourLesTechniciens", html: section(P_FERMETURE) },
  ]),
);

// 4. L'ouverture perd son haut de page sur mesure.
controle("l'ouverture rendue au gabarit des autres sections", () =>
  verifieRythme([
    { nom: "Ouverture", html: section(P_INTERMEDIAIRE) },
    { nom: "ApresDemande", html: section(P_INTERMEDIAIRE) },
    { nom: "PourLesTechniciens", html: section(P_FERMETURE) },
  ]),
);

// 5. Les agences remontées avant les étapes.
controle("« Nos agences » remonté avant « Après votre demande »", () => {
  const inverse = normalise(
    "<x>Nos agences</x><x>Après votre demande</x><x>Vous êtes technicien</x>",
  );
  verifieCroissant(rangs(inverse, ORDRE_SITE), ORDRE_SITE, "contrôle");
});

// 6. LA CÉCITÉ D'ORIGINE : la maquette lue dans l'export du 02/10.
controle(
  "maquette relue dans l'export du 02/10 (« Les cinq offres »)",
  () => {
    const perimee = normalise(appliqueDecisions(ecranContact(MAQUETTE_PERIMEE)));
    verifiePorte(perimee, rendu);
  },
);

// 7. L'étiquette de navigation revenue au compte faux.
controle("étiquette revenue à « Les cinq offres » dans le rendu", () =>
  verifiePorte(source, rendu.replace("Les six offres", "Les cinq offres")),
);

// 8. L'écart de la carte de France effacé du commentaire sans réparation.
controle(
  "écart de disposition des agences retiré de Agences.tsx sans réparation",
  () => verifieColonnes(COLONNES[0], source, RENDU_AGENCES, "aucune déclaration"),
);

// 9. La grille à deux colonnes rendue sans mise à jour de l'écart déclaré.
controle("deux grilles rendues dans « Nos agences » sans mise à jour", () =>
  verifieColonnes(
    COLONNES[0],
    source,
    `${RENDU_AGENCES}<div style="display:grid;${COLONNES[0].grilleMaquette}"></div>`,
    fichierSource("Agences.tsx"),
  ),
);

// 10. La carte candidature remise au milieu du parcours client.
controle("carte candidature remise dans « Après votre demande »", () =>
  verifieParcoursClient(`${RENDU_APRES_DEMANDE}${RENDU_TECHNICIENS}`),
);

// 11. Un délai chiffré et un tiret cadratin dans la copie.
controle("délai chiffré « 48 h » rendu", () =>
  verifieEcarts(CORRIGE, source, `${rendu} 48 h`),
);
controle("tiret cadratin rendu", () =>
  verifieInterdits(`${rendu} Siège — Limonest`),
);

console.log("\nLa porte sait échouer : 12 contrôles négatifs tenus.");
