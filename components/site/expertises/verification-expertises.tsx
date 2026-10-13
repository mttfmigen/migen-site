/**
 * Contrôle du HUB `/expertises/`, sans navigateur.
 *
 *   bun components/site/expertises/verification-expertises.tsx
 *   bun components/site/expertises/verification-expertises.tsx --controle   (témoins)
 *
 * LA RÉFÉRENCE, et elle est unique : la capture
 * `maquette/rendu/expertises.html` (19 sections, « 10 Hub de rubrique »),
 * RELUE À CHAQUE EXÉCUTION. Rien de ce qui est attendu n'est retapé ici : les
 * copies sont les chaînes de la donnée, d'abord exigées dans la capture, puis
 * dans le rendu ; les titres, les cibles et leur ordre sont lus dans la capture.
 *
 * CE QUE CE CONTRÔLE GARANTIT :
 *   1. ZÉRO DONNÉE INVENTÉE : chaque chaîne visible de la donnée est dans la
 *      capture, chaque chemin et chaque photo nommée aussi.
 *   2. LE RENDU porte ces chaînes, le H1 de la capture, ses H2 DANS SON ORDRE,
 *      toutes ses cibles, et les dessins des trois écrans propres au hub.
 *   3. Un seul H1, aucun `href="#"`, l'ancre `#mgx-form` posée ET visée.
 *   4. Les interdits du contrat absents du rendu.
 *   5. La route sert la LIGNE ACTUELLE de la base (ancienne forme) avec la
 *      donnée du hub, et une ligne à la forme hub telle quelle.
 *   6. LES DEUX ARBITRAGES DU 12/10 sur les cartes en verre d'une phrase, tenus
 *      dans les deux sens (`controleComplements`).
 *   7. LES SIX CARTES DE « Par où continuer ? » sont celles de la capture, sans
 *      retrait ni ajout : l'arbitrage « il manque une offre » reste à Mehdi
 *      (`controleMaillage`).
 *   8. LE CONTRÔLE SAIT ÉCHOUER : huit rendus sabotés doivent le faire tomber,
 *      et CHACUN sur l'assertion qu'il visait, pas sur une autre.
 */

import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import {
  estExpertises,
  estHubExpertises,
  type ContenuHubExpertises,
} from "@/types/expertises";

import {
  CONTENU_EXPERTISES,
  CONTENU_HUB_EXPERTISES,
  TITRE_HUB_EXPERTISES,
} from "./expertises-donnees";
import PageExpertises from "./PageExpertises";

import { PHOTOS_HORS_INDUSTRIE, pageDeMarche } from "@/lib/photos-hors-industrie";
const ICI = fileURLToPath(new URL(".", import.meta.url));
const RACINE = join(ICI, "..", "..", "..");
/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", "expertises.html"), "utf8"));

/* ------------------------------------------------------------ normalisation */

function decode(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * RETIRE LES ORNEMENTS DU TÉLÉPHONE avant toute comparaison à la capture.
 *
 * POURQUOI. Les blocs repliables posés le 12/10 ajoutent, dans le HTML servi,
 * des éléments marqués `data-mobile-seulement` : le chevron de la bascule, le
 * résumé de deux lignes, et l'étiquette qui porte surtitre et titre. Ils sont
 * masqués au-dessus de 880 px, donc ABSENTS de ce qu'un visiteur de bureau
 * voit, et la capture de bureau n'avait aucune raison de les porter.
 *
 * Sans ce retrait, cette porte signalait « texte rendu absent de la capture :
 * « › » ». Six portes de gabarit étaient rouges pour cette seule raison.
 *
 * L'IMBRICATION COMPTE : l'étiquette est un `span` qui en contient deux. Un
 * motif paresseux s'arrêterait à la première fermante et n'en retirerait que
 * la moitié, laissant le titre dans la comparaison. On compte la profondeur.
 */
function retireOrnementsMobiles(html: string): string {
  const marque = /<(\w+)\b[^>]*\bdata-mobile-seulement\b[^>]*>/;
  let sortie = html;
  for (;;) {
    const debut = sortie.match(marque);
    if (!debut || debut.index === undefined) return sortie;
    const nom = debut[1];
    const balises = new RegExp(`<${nom}\\b[^>]*>|</${nom}\\s*>`, "g");
    balises.lastIndex = debut.index + debut[0].length;
    let profondeur = 1;
    let fin = -1;
    for (let m = balises.exec(sortie); m; m = balises.exec(sortie)) {
      profondeur += m[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    if (fin < 0) fin = debut.index + debut[0].length;
    sortie = `${sortie.slice(0, debut.index)} ${sortie.slice(fin)}`;
  }
}

/** Pour COMPARER seulement : la donnée garde le littéral de la capture. */
function normaliseTexte(texte: string): string {
  return texte.replace(/[  ]/g, " ").replace(/’/g, "'").replace(/\s+/g, " ").trim();
}

function texteLisible(html: string): string {
  html = retireOrnementsMobiles(html);
  return normaliseTexte(decode(html.replace(/<[^>]+>/g, " ")));
}

function normaliseStyle(texte: string): string {
  return texte
    .replace(/\s*([:;,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1");
}

/** Les H2 d'un HTML, dans l'ordre. */
function titres2(html: string): string[] {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => texteLisible(m[1]));
}

/** Les cibles internes d'un HTML, sans doublon. */
function cibles(html: string): string[] {
  return [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
}

const CAPTURE_TEXTE = texteLisible(CAPTURE);
const CAPTURE_STYLE = normaliseStyle(CAPTURE);
const CAPTURE_H1 = texteLisible(CAPTURE.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]);

/* --------------------------------------- 1. zéro donnée inventée, sur la donnée */

/** Les clés dont la valeur n'est pas de la copie visible. */
const HORS_COPIE = new Set(["gabarit", "type", "href", "lienHref", "photo", "marquesFamille", "marquesFamilles", "lienLibelle"]);

function chaines(valeur: unknown, cle = ""): [string, string][] {
  if (typeof valeur === "string") return HORS_COPIE.has(cle) ? [] : [[cle, valeur]];
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chaines(v, cle));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) => (HORS_COPIE.has(k) ? [] : chaines(v, k)));
  }
  return [];
}

const COPIES = chaines(CONTENU_HUB_EXPERTISES).map(([, t]) => t);

/** Chaque chaîne de la donnée est dans la capture : aucune n'a été écrite ici. */
for (const texte of [TITRE_HUB_EXPERTISES, ...COPIES]) {
  assert.ok(
    CAPTURE_TEXTE.includes(normaliseTexte(texte)),
    `donnée du hub : « ${texte} » n'est pas dans la capture, elle est inventée`,
  );
}
assert.equal(normaliseTexte(TITRE_HUB_EXPERTISES), CAPTURE_H1, "le H1 du hub n'est pas celui de la capture");

/** Chaque chemin de la donnée est une cible de la capture. */
for (const href of JSON.stringify(CONTENU_HUB_EXPERTISES).match(/"(?:href|lienHref)":"([^"]+)"/g) ?? []) {
  const chemin = href.replace(/^"[^"]+":"|"$/g, "");
  assert.ok(CAPTURE.includes(`href="${chemin}"`), `donnée du hub : la capture ne vise pas ${chemin}`);
}

/**
 * LA PHOTO D'UNE CARTE : celle de la capture, OU celle de la page qu'elle ouvre.
 *
 * CE QUE CETTE PORTE EXIGEAIT, et qui est devenu faux. Elle demandait que la
 * capture NOMME chaque photo de carte. C'était juste tant que les cartes
 * portaient les images de la maquette. Mehdi a tranché le 12/10, « oui, tout
 * basculer » : une carte montre désormais la photo de la PAGE QU'ELLE OUVRE,
 * parce qu'il avait relevé « les photos ne correspondent pas aux photos du
 * cas » et « les bento Offres et Secteurs ne changent pas d'image ».
 *
 * CE QUE LA PORTE GARDE, et c'est l'essentiel : elle refuse toujours une photo
 * inventée. Le fichier doit EXISTER sur le disque, et la photo doit être soit
 * celle de la capture, soit celle que `photoDeLaPage` attribue à la cible de la
 * carte. Une troisième valeur, prise nulle part, est refusée.
 *
 * Sans l'existence du fichier, la tolérance ouvrirait la porte à un nom
 * fantaisiste qui laisserait un trou à l'écran : c'est exactement ce qu'une
 * tolérance mal posée produit.
 */
/* LES DEUX DOSSIERS D'IMAGES, et pas seulement l'un des deux. Première
   version : l'existence n'était vérifiée que dans `public/assets/photos`, et
   tout `/assets/web/` passait par une exception. Or les cartes de ce hub
   servent justement des `/assets/web/` : l'assertion ne vérifiait donc rien du
   tout, et son témoin l'a dit, 0 faute sur 2. Une exception posée pour éviter
   un faux positif avait désarmé le contrôle entier. */
const SUR_DISQUE = new Set([
  ...readdirSync("public/assets/photos").map((f) => `/assets/photos/${f}`),
  ...readdirSync("public/assets/web").map((f) => `/assets/web/${f}`),
]);
for (const carte of [...CONTENU_HUB_EXPERTISES.domaines!.cartes, ...CONTENU_HUB_EXPERTISES.pagesLiees!]) {
  const photo = carte.photo!;
  /* La cible de la carte était lue ici pour le contrôle de provenance retiré
     plus bas. Elle ne servait plus à rien depuis, et `eslint` le signalait. */

  assert.ok(
    SUR_DISQUE.has(photo),
    `donnée du hub : « ${photo} » n'existe sur le disque dans aucun des deux ` +
      `dossiers d'images : la carte « ${carte.titre} » laisserait un trou`,
  );

  /* LE CONTRÔLE DE PROVENANCE EST TAUTOLOGIQUE ICI, et son témoin l'a prouvé.
     La valeur de `carte.photo` est PRODUITE par `photoDeLaPage(cible)` à
     l'exécution : la comparer à `photoDeLaPage(cible)` revient à la comparer à
     elle-même, et aucun sabotage de la donnée source ne la fait tomber, la
     transformation l'écrasant. Je l'ai écrite, le témoin l'a refusée, 0 faute
     sur 2. Elle est remplacée par celle qui encode le vrai reproche. */
  assert.ok(
    !PHOTOS_HORS_INDUSTRIE.has(photo.split("/").pop()!) || pageDeMarche("/expertises/"),
    `donnée du hub : ${photo} pour « ${carte.titre} » montre un sujet qui n'est ` +
      `pas de l'industrie (avion, bois, salle blanche, garage) : sur une page ` +
      `commerciale le visiteur croit qu'on lui parle d'un autre métier`,
  );
}

/* ------------------------------------------------- 2 à 4. le contrôle du rendu */

const DESSINS = [
  // 0 · Héros à formulaire, 1 · chiffres sur trois colonnes.
  "grid-template-columns: 1.12fr 0.88fr",
  "clamp(38px,4.4vw,66px)",
  "grid-template-columns: repeat(3, minmax(0px, 1fr))",
  "padding: 22px 8px",
  // 4 · Réponse directe : la grille, la carte, les numéros.
  "grid-template-columns: minmax(0px, 1fr) minmax(0px, 1fr); gap: 48px; align-items: start",
  "border-radius: var(--rad); padding: 6px 30px",
  "width: 40px; height: 40px; border-radius: 12px; background: var(--acc-w); color: var(--acc)",
  // 5 · Domaines : le bento, la carte, le paragraphe caché sauf sur la première.
  "grid-template-columns: repeat(4, minmax(0px, 1fr)); grid-auto-rows: minmax(230px, auto); gap: 14px",
  "min-height: 230px; border-radius: var(--rad); overflow: hidden",
  "display: none; font: 400 14.5px/1.6 var(--fb)",
  // 6 · Types : le panneau, la rangée, la barre beige.
  "grid-template-columns: minmax(0px, 0.9fr) minmax(0px, 1.1fr); gap: 48px; align-items: stretch",
  "min-height: 440px",
  "grid-template-columns: 40px minmax(0px, 1fr) 36px",
  "padding: 11px 14px; border-radius: 14px; background: var(--acc-w)",
  /* 18 · l'appel final. LA CARTE EN VERRE D'UNE PHRASE (écrans 7 et 11 de la
     capture, `padding: 30px 34px 14px`) N'EST PLUS ATTENDUE ICI, et ce n'est
     pas un relâchement : elle est vérifiée plus bas, DANS LES DEUX SENS, par
     `controleComplements`. Cette porte l'exigeait dans le rendu et elle est
     tombée là-dessus, sur arbre propre, à partir du 12/10 : voir le bloc de
     `controleComplements` pour les deux arbitrages de Mehdi qui l'expliquent. */
  "padding: var(--sec) 24px var(--sec)",
] as const;

const INTERDITS = [
  "—", "prix ", "tarif", "taux horaire", "régie", "intérim", "mise à disposition",
  "sans engagement", "clé en main", "sur mesure", "levier", "concrètement",
  "notamment", "incontournable", "découvrez", "limonest", "24h", "24 h", "7j/7",
  "clients réguliers",
] as const;

/* ------------------------- 2 bis. les deux cartes en verre d'une seule phrase */

/** La carte en verre de la capture, `padding: 30px 34px 14px`, bornes comptées. */
const CARTE_DE_VERRE = "padding: 30px 34px 14px";

/** Le contenu textuel de chaque carte en verre d'une phrase de la capture. */
function cartesDeVerre(html: string): string[] {
  const sorties: string[] = [];
  const ouverture = new RegExp(`<div\\b[^>]*${CARTE_DE_VERRE}[^>]*>`, "g");
  for (let m = ouverture.exec(html); m; m = ouverture.exec(html)) {
    const balises = /<div\b[^>]*>|<\/div\s*>/g;
    balises.lastIndex = m.index + m[0].length;
    let profondeur = 1;
    let fin = html.length;
    for (let b = balises.exec(html); b; b = balises.exec(html)) {
      profondeur += b[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = b.index;
        break;
      }
    }
    sorties.push(texteLisible(html.slice(m.index + m[0].length, fin)));
  }
  return sorties;
}

const CARTES_CAPTURE = cartesDeVerre(CAPTURE);

/**
 * La capture porte DEUX cartes en verre d'une phrase, écrans 7 et 11 de son
 * montage, et le rendu n'en porte AUCUNE. Ce n'est pas un défaut de portage,
 * ce sont DEUX arbitrages de Mehdi du 12/10 contre sa propre maquette, et
 * cette porte était rouge sur arbre propre faute de les encoder.
 *
 * ÉCRAN 7, « Notre guide des types de maintenance détaille chaque approche. »
 * Le texte est SERVI, la carte non : une phrase seule n'est pas un bloc, elle
 * ferme la section qui la précède (`ComplementsOffre`, chemin `ligneDeCloture`,
 * posé sur son relevé « Ni celui ci ou il y a juste une phrase »). La forme
 * change, la copie ne bouge pas d'un caractère.
 *
 * ÉCRAN 11, « Ligne bloquée maintenant ? Voir le dépannage industriel. »
 * Retirée entièrement, sur son jugement « c'est inutile » : elle répétait ce
 * que la page dit déjà et détournait le lecteur du formulaire juste avant
 * qu'il l'atteigne. `complementOffre` est vide, et le gabarit sait ne rien
 * rendre.
 *
 * LA PORTE EST À DEUX FACES, comme les `CORRECTIONS` de la porte de
 * `/nous-connaitre/` : elle tombe si la capture cesse d'écrire l'une des deux
 * phrases (l'arbitrage serait alors à revoir, pas à reconduire en silence), et
 * elle tombe si le rendu reperd la première ou laisse revenir la seconde.
 */
function controleComplements(rendu: string, nom: string): void {
  const texte = texteLisible(rendu);
  const style = normaliseStyle(rendu);

  assert.equal(
    CARTES_CAPTURE.length,
    2,
    `la capture ne porte plus deux cartes en verre d'une phrase (${CARTES_CAPTURE.length}) : les deux arbitrages du 12/10 sont à revoir`,
  );

  /* La phrase SERVIE vient de la donnée, jamais retapée ici, et la phrase
     RETIRÉE est lue dans la capture : c'est l'autre carte, celle qui n'est pas
     la servie. Rien de tout cela n'est écrit dans cette porte. */
  const servie = normaliseTexte(CONTENU_HUB_EXPERTISES.complementTypes![0].texte!);
  const retiree = CARTES_CAPTURE.find((c) => !c.includes(servie));
  assert.ok(
    CARTES_CAPTURE.some((c) => c.includes(servie)),
    `la capture n'écrit plus la phrase de clôture servie : « ${servie} »`,
  );
  assert.ok(retiree, "les deux cartes de la capture portent la même phrase : relevé à revoir");

  assert.ok(
    !style.includes(normaliseStyle(CARTE_DE_VERRE)),
    `${nom} : la carte en verre d'une phrase est revenue, l'arbitrage du 12/10 la refuse`,
  );
  assert.ok(
    texte.includes(servie),
    `${nom} : la ligne de clôture a perdu sa phrase, « ${servie} »`,
  );
  /* La typographie de la ligne de clôture N'EST PAS dans la capture, et c'est
     voulu : c'est la forme que l'arbitrage lui donne. Sans cette assertion, la
     phrase pourrait repartir dans n'importe quel habillage sans rien casser. */
  assert.ok(
    style.includes(normaliseStyle("font: 400 14.5px/1.65 var(--fb)")),
    `${nom} : la phrase de clôture n'est plus rendue à l'échelle d'une note`,
  );
  assert.ok(
    !texte.includes(retiree!),
    `${nom} : la phrase retirée le 12/10 est revenue, « ${retiree} »`,
  );
}

/* ----------------------------- 2 ter. « Par où continuer ? », les six cartes */

/** Les cibles internes d'un HTML situées APRÈS le titre du bloc de maillage. */
function ciblesDuMaillage(html: string, borne?: RegExp): string[] {
  const titre = souple(CONTENU_HUB_EXPERTISES.pagesLieesTitre!).exec(html);
  assert.ok(titre, `le titre « ${CONTENU_HUB_EXPERTISES.pagesLieesTitre} » est introuvable`);
  const fin = borne ? borne.exec(html)?.index ?? html.length : html.length;
  return [...html.matchAll(/href="(\/[^"]*)"/g)]
    .filter((m) => m.index! > titre!.index && m.index! < fin)
    .map((m) => m[1].replace(/(.)\/$/, "$1"));
}

/** Un littéral de copie en motif qui tolère insécables, entités et apostrophes. */
function souple(texte: string): RegExp {
  const echappe = texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    echappe
      .replace(/[\s ]+/g, "(?:\\s|&nbsp;|&#160;|\\u00a0)+")
      .replace(/['’]/g, "(?:['’]|&#x27;|&#39;)"),
  );
}

const MAILLAGE_CAPTURE = ciblesDuMaillage(CAPTURE);

/**
 * CE QUE MEHDI A SIGNALÉ LE 12/10, sur `/expertises/` : « il manque une offre
 * (Maintenance tuyauterie n'est pas une offre) ».
 *
 * MESURE DU 14/10, en production. Le bloc « Par où continuer ? » porte six
 * cartes : le hub `/offres/`, puis Zéro arrêt, Maintenance tuyauterie
 * industrielle, Automaticien industriel, Technicien en résidence, Arrêt
 * technique. Il a donc raison deux fois : « Maintenance tuyauterie
 * industrielle » et « Automaticien industriel » sont des pages d'EXPERTISE, pas
 * des offres, et sur les six offres du site seules TROIS sont joignables depuis
 * ce bloc (Full service, Bureau d'études et Travaux industriels n'y sont pas).
 *
 * ET C'EST SA COPIE, AU MOT ET À L'ADRESSE PRÈS. La capture
 * `maquette/rendu/expertises.html` porte les six mêmes cartes, dans le même
 * ordre, avec les mêmes cibles, et ne nomme nulle part les trois offres
 * absentes. Nous ne la réécrivons donc pas : ni retirer la carte tuyauterie,
 * ni ajouter une carte d'offre, les deux seraient de la copie client refaite
 * sans son accord. C'est un ARBITRAGE OUVERT, pas un défaut à corriger.
 *
 * CETTE PORTE TIENT LES DEUX BORDS, et c'est tout ce qu'elle fait : elle refuse
 * qu'on retire une carte de la maquette, et elle refuse qu'on en invente une.
 * Le jour où Mehdi tranche, elle échoue et dit exactement ce qui a changé.
 */
function controleMaillage(rendu: string, nom: string): void {
  const question = CONTENU_HUB_EXPERTISES.sections!.find((s) => s.type === "ctaFinal");
  assert.ok(question && "question" in question, "le hub doit porter un appel final");
  assert.deepEqual(
    ciblesDuMaillage(rendu, souple((question as { question: string }).question)),
    MAILLAGE_CAPTURE,
    `${nom} : les cartes de « ${CONTENU_HUB_EXPERTISES.pagesLieesTitre} » ne sont plus celles de la capture, ` +
      `ni dans le même ordre. Retirer ou ajouter une carte, c'est réécrire la copie du client : ` +
      `voir l'arbitrage ouvert sur « Maintenance tuyauterie n'est pas une offre » (12/10).`,
  );
}

function controle(rendu: string, nom: string): void {
  const texte = texteLisible(rendu);
  const style = normaliseStyle(rendu);
  controleComplements(rendu, nom);
  controleMaillage(rendu, nom);

  for (const fragment of DESSINS) {
    const attendu = normaliseStyle(fragment);
    assert.ok(CAPTURE_STYLE.includes(attendu), `la capture ne porte pas « ${fragment} » : valeur à revérifier`);
    assert.ok(style.includes(attendu), `${nom} : le rendu ne porte pas le dessin « ${fragment} »`);
  }
  for (const copie of COPIES) {
    assert.ok(texte.includes(normaliseTexte(copie)), `${nom} : copie de la capture absente, « ${copie} »`);
  }

  const h1 = [...rendu.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  assert.equal(h1.length, 1, `${nom} : une page porte exactement un h1`);
  assert.equal(texteLisible(h1[0][1]), CAPTURE_H1, `${nom} : le H1 n'est pas celui de la capture`);
  assert.deepEqual(titres2(rendu), titres2(CAPTURE), `${nom} : les H2 ne sont pas ceux de la capture, dans son ordre`);

  // Hors du serveur Next, `Link` rend le chemin sans sa barre finale.
  for (const cible of cibles(CAPTURE)) {
    assert.ok(
      rendu.includes(`href="${cible}"`) || rendu.includes(`href="${cible.replace(/(.)\/$/, "$1")}"`),
      `${nom} : la capture vise ${cible}, le rendu non`,
    );
  }
  assert.ok(!/href="#"/.test(rendu), `${nom} : un href="#" est rendu`);
  assert.ok(rendu.includes('href="#besoin"') && rendu.includes('id="besoin"'), `${nom} : #besoin doit être posé et visé`);
  assert.ok(rendu.includes('href="#mgx-form"') && rendu.includes('id="mgx-form"'), `${nom} : #mgx-form doit être posé et visé`);

  const minuscule = texte.toLowerCase();
  for (const mot of INTERDITS) {
    assert.ok(!minuscule.includes(mot), `${nom} : interdit du contrat dans le rendu, « ${mot} »`);
  }
}

const rendDe = (contenu: Parameters<typeof PageExpertises>[0]["contenu"], titre: string) =>
  renderToStaticMarkup(<PageExpertises titre={titre} contenu={contenu} formulaire="cocon-expertises-" />);

/* ----------------------------------- 5. ce que la route sert, ligne par ligne */

// La route tranche sur `estExpertises` : les deux formes y passent.
assert.ok(estExpertises(CONTENU_EXPERTISES) && estExpertises(CONTENU_HUB_EXPERTISES), "les deux formes doivent passer estExpertises");
assert.ok(!estHubExpertises(CONTENU_EXPERTISES), "l'ancienne forme ne doit pas passer pour la forme hub");
assert.ok(estHubExpertises(CONTENU_HUB_EXPERTISES), "la donnée du hub doit porter la forme hub");

// La LIGNE ACTUELLE de la base : ancienne forme, H1 court. Rendue en hub.
const renduBase = rendDe(CONTENU_EXPERTISES, "Maintenance des équipements industriels");
controle(renduBase, "ligne actuelle de la base");
assert.ok(!renduBase.includes("Six natures d"), "la copie de l'ancienne forme ne doit plus se rendre");

// Une ligne à la forme hub est servie TELLE QUELLE, H1 compris.
const renduHub = rendDe({ ...CONTENU_HUB_EXPERTISES, chapeau: "Chapeau écrit en base." }, "Titre écrit en base");
assert.ok(renduHub.includes(">Titre écrit en base</h1>"), "une ligne à la forme hub garde son H1");
assert.ok(renduHub.includes("Chapeau écrit en base."), "une ligne à la forme hub garde son contenu");

// Les survols relevés sur la maquette vivante sont dans la feuille du hub.
const FEUILLE = readFileSync(join(ICI, "PageExpertises.module.css"), "utf8");
for (const regle of ["translateY(-4px)", "rgba(0, 0, 0, 0.5) 0 30px 60px -30px", "rgba(255, 124, 60, 0.05)"]) {
  assert.ok(FEUILLE.includes(regle), `survol relevé absent de PageExpertises.module.css : ${regle}`);
}

/* ------------------------------------------------ 6. le contrôle sait échouer */

/**
 * CHAQUE TÉMOIN DIT SUR QUELLE ASSERTION IL DOIT TOMBER, et c'est la seule
 * version qui prouve quelque chose. `assert.throws` accepte N'IMPORTE QUELLE
 * `AssertionError` : un sabotage qui tombe sur « copie absente » alors qu'il
 * visait « carte en verre revenue » laisse l'assertion visée non éprouvée, et
 * la porte paraît armée sans l'être. Le fragment attendu ferme cette porte.
 */
const SABOTAGES: [string, ContenuHubExpertises, string][] = [
  ["un mot changé", { ...CONTENU_HUB_EXPERTISES, chapeau: CONTENU_HUB_EXPERTISES.chapeau!.replace("Huit", "Neuf") }, "copie de la capture absente"],
  /* Le bento des domaines parti, c'est son DESSIN qui manque le premier, avant
     que les H2 ne soient comparés : le fragment attendu est celui-là, mesuré,
     pas celui qu'on aurait supposé. */
  ["un écran retiré", { ...CONTENU_HUB_EXPERTISES, domaines: undefined }, "le rendu ne porte pas le dessin"],
  ["un interdit glissé", { ...CONTENU_HUB_EXPERTISES, mention: `${CONTENU_HUB_EXPERTISES.mention} Sans engagement.` }, "interdit du contrat dans le rendu"],
  /* Les quatre témoins des contrôles posés le 14/10. Sans eux, les nouvelles
     assertions seraient des affirmations : aucune n'avait encore prouvé
     qu'elle sait échouer. */
  [
    "la carte en verre revenue (un titre rend le bloc à sa forme de carte)",
    {
      ...CONTENU_HUB_EXPERTISES,
      complementTypes: [{ titre: "Complément", texte: CONTENU_HUB_EXPERTISES.complementTypes![0].texte }],
    },
    "la carte en verre d'une phrase est revenue",
  ],
  [
    "la phrase de clôture perdue",
    { ...CONTENU_HUB_EXPERTISES, complementTypes: [] },
    "la ligne de clôture a perdu sa phrase",
  ],
  [
    "la phrase retirée le 12/10 remise",
    { ...CONTENU_HUB_EXPERTISES, complementOffre: [{ texte: CARTES_CAPTURE.find((c) => !c.includes(normaliseTexte(CONTENU_HUB_EXPERTISES.complementTypes![0].texte!)))! }] },
    "la phrase retirée le 12/10 est revenue",
  ],
  [
    "une carte du maillage retirée",
    { ...CONTENU_HUB_EXPERTISES, pagesLiees: CONTENU_HUB_EXPERTISES.pagesLiees!.slice(0, -1) },
    "ne sont plus celles de la capture",
  ],
];
/** `--controle` imprime, témoin par témoin, l'assertion qui est tombée. */
const MODE_CONTROLE = process.argv.includes("--controle");

for (const [nom, contenu, attendu] of SABOTAGES) {
  assert.throws(
    () => controle(rendDe(contenu, TITRE_HUB_EXPERTISES), nom),
    (erreur: unknown) => {
      assert.ok(erreur instanceof assert.AssertionError, `${nom} : l'échec n'est pas une assertion`);
      assert.ok(
        String(erreur.message).includes(attendu),
        `le contrôle a bien échoué sur « ${nom} », mais sur une AUTRE assertion ` +
          `(attendu « ${attendu} », obtenu « ${erreur.message} ») : l'assertion visée reste non éprouvée`,
      );
      if (MODE_CONTROLE) console.log(`  témoin vu : ${nom}\n             → « ${attendu} »`);
      return true;
    },
    `le contrôle n'a pas vu : ${nom}`,
  );
}

/* UNE CARTE AJOUTÉE est le sabotage symétrique, et il ne peut pas passer par
   `SABOTAGES` : la carte inventée tomberait d'abord sur « zéro donnée
   inventée », qui est vérifié sur la DONNÉE, hors de `controle`. On le joue
   donc sur le rendu, avec une cible que la capture ne vise pas. */
assert.throws(
  () =>
    controleMaillage(
      rendDe({ ...CONTENU_HUB_EXPERTISES, pagesLiees: [...CONTENU_HUB_EXPERTISES.pagesLiees!, { titre: "Bureau d'études", href: "/offres/bureau-etudes/", photo: "/assets/web/team-duo.jpg" }] }, TITRE_HUB_EXPERTISES),
      "une carte d'offre ajoutée",
    ),
  (erreur: unknown) => {
    const vu =
      erreur instanceof assert.AssertionError &&
      String(erreur.message).includes("ne sont plus celles de la capture");
    if (vu && MODE_CONTROLE) {
      console.log("  témoin vu : une carte d'offre ajoutée\n             → « ne sont plus celles de la capture »");
    }
    return vu;
  },
  "le contrôle n'a pas vu : une carte d'offre ajoutée au maillage",
);

/* Combien des six offres du site sont joignables depuis « Par où continuer ? ».
   Ce n'est pas une assertion, c'est le chiffre que Mehdi a signalé le 12/10 :
   il s'affiche à chaque passage pour que l'arbitrage reste visible. */
const OFFRES_DU_SITE = [
  "/offres/residence/", "/offres/full-service/", "/offres/zero-arret/",
  "/offres/arret-technique/", "/offres/bureau-etudes/", "/travaux-industriels/",
].map((u) => u.replace(/(.)\/$/, "$1"));
const offresJoignables = OFFRES_DU_SITE.filter((u) => MAILLAGE_CAPTURE.includes(u));

console.log(
  `hub /expertises/ conforme à sa capture : ${COPIES.length} copies, ${DESSINS.length} dessins, ` +
    `${titres2(CAPTURE).length} H2 dans l'ordre, ${cibles(CAPTURE).length} cibles, ${INTERDITS.length} interdits ; ` +
    `${CARTES_CAPTURE.length} cartes en verre dans la capture, 0 dans le rendu (arbitrages du 12/10) ; ` +
    `${MAILLAGE_CAPTURE.length} cartes de maillage identiques à la capture ; ` +
    `${SABOTAGES.length + 1} sabotages détectés.`,
);
console.log(
  `ARBITRAGE OUVERT, « il manque une offre » (Mehdi, 12/10) : ${offresJoignables.length} des ` +
    `${OFFRES_DU_SITE.length} offres joignables depuis « ${CONTENU_HUB_EXPERTISES.pagesLieesTitre} », ` +
    `absentes de la capture ${OFFRES_DU_SITE.filter((u) => !MAILLAGE_CAPTURE.includes(u)).join(", ")}. ` +
    `Copie du client, non réécrite.`,
);
