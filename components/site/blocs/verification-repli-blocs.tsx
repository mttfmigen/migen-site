/**
 * LES HUIT BLOCS DE CORPS SE REPLIENT, ET AUCUN MOT NE QUITTE LE DOM.
 *
 *   bun components/site/blocs/verification-repli-blocs.tsx
 *
 * POURQUOI CE CONTRÔLE EST HORS NAVIGATEUR, et ce n'est pas un raccourci.
 * Mesuré le 14/10 sur les 253 adresses du site, en local comme en production :
 * les neuf composants de section de ce dossier rendent ZÉRO section. Le gabarit
 * de vente générique qu'ils forment n'est plus le chemin de rendu d'aucune
 * page ; les onze gabarits dessinent les leurs. Il n'existe donc AUCUNE page
 * réelle sur laquelle ouvrir ces blocs pour les comparer à une capture, et la
 * règle du dépôt (« ouvrir une vraie page ») ne peut pas s'appliquer ici.
 *
 * Le dépôt a déjà son idiome pour ce cas : `verification-texte-riche.tsx` et
 * `implantation/verification-implantation.tsx` montent le composant avec
 * `renderToStaticMarkup` et mesurent le balisage. C'est ce que fait ce fichier.
 * La preuve au navigateur, elle, porte sur `SectionPliableMobile` lui-même,
 * qui est vivant sur les 18 pages : `verification-repli-navigateur.mjs`.
 *
 * CE QU'IL EXIGE, ET C'EST L'ORDRE DE MEHDI DU 13/10 :
 *
 *   1. « ÇA DOIT ÊTRE SUR TOUTES LES PAGES »  : chaque bloc rend une
 *      `<section data-bloc>` qui porte un `details[data-pliable-mobile]`.
 *   2. « les mots doivent être là pour le SEO » : CHAQUE chaîne du corpus
 *      passée au bloc se retrouve dans le texte rendu. C'est l'exigence qui
 *      compte, et c'est celle que la maquette ne tient pas : elle retire le
 *      contenu replié du DOM (`sc-if`), ce qui contredit son propre LISEZMOI.
 *   3. Le `<details>` est rendu OUVERT. Google reçoit une page dépliée ; c'est
 *      un effet client qui la replie, et seulement sous 880 px.
 *
 * Les trois verdicts sont des fonctions pures, éprouvées plus bas sur des
 * blocs FABRIQUÉS POUR ÉCHOUER. Une porte qui n'a pas montré qu'elle sait
 * refuser ne prouve rien.
 */

import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  SectionChiffres,
  SectionCtaFinal,
  SectionDeroule,
  SectionGaranties,
  SectionObjections,
  SectionOffre,
  SectionPreuves,
  SectionProbleme,
} from "@/types/contenu";

import ChiffresCles from "./ChiffresCles";
import Cta from "./Cta";
import Deroule from "./Deroule";
import Garanties from "./Garanties";
import Objections from "./Objections";
import Offre from "./Offre";
import Preuves from "./Preuves";
import Probleme from "./Probleme";

/* ------------------------------------------------------------------ verdicts */

/** Le texte nu du balisage, normalisé comme le reste du dépôt (piège n° 3). */
export function texteNu(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/ /g, " ")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ce qui manque au repli : l'attribut de lot, le dépliant, ou son état servi. */
export function defautsDeRepli(html: string): string[] {
  const defauts: string[] = [];
  if (!/<section[^>]*\sdata-bloc="/.test(html)) {
    defauts.push("la <section> ne porte pas data-bloc");
  }
  const pli = html.match(/<details[^>]*data-pliable-mobile[^>]*>/);
  if (!pli) {
    defauts.push("aucun details[data-pliable-mobile] dans la section");
    return defauts;
  }
  if (!/\sopen(\s|=|>)/.test(pli[0])) {
    defauts.push("le details est servi FERMÉ : Google perdrait le texte replié");
  }
  return defauts;
}

/**
 * LE RÉSUMÉ RETIRÉ DU BALISAGE AVANT TOUTE MESURE DE PRÉSENCE.
 *
 * CE N'EST PAS UNE COMMODITÉ, C'EST LA CORRECTION D'UN TROU QUE CETTE PORTE
 * AVAIT. Éprouvée le 14/10 en cassant pour de vrai `Garanties.tsx`
 * (`section.puces.slice(0, 1)`, une puce sur deux jetée du rendu), elle est
 * restée VERTE. Motif : le résumé de la bascule est construit depuis TOUTES
 * les puces (`puce.accroche ?? puce.texte`). La puce jetée du corps restait
 * donc écrite dans le résumé, et la recherche « ce mot est-il quelque part
 * dans la section » la retrouvait là.
 *
 * Un résumé est un DOUBLON DÉRIVÉ du contenu : il ne peut pas servir de preuve
 * que le contenu est là. On le retire, et la présence se mesure sur ce qui
 * reste, c'est-à-dire l'en-tête et le corps.
 *
 * Il se reconnaît à son `<p data-mobile-seulement>`. Le chevron porte le même
 * attribut mais c'est un `<span>`, et il ne porte aucun texte du corpus.
 */
export function sansResume(html: string): string {
  return html.replace(/<p[^>]*data-mobile-seulement[^>]*>[\s\S]*?<\/p>/g, " ");
}

/**
 * LES MOTS PERDUS. C'est le verdict qui répond à la colère du 13/10.
 *
 * Chaque jalon est une chaîne que l'appelant a passée au bloc. Absente du
 * texte rendu, elle a été retirée : c'est exactement ce que fait la maquette,
 * et exactement ce qu'il ne faut pas reproduire.
 */
export function motsPerdus(html: string, jalons: readonly string[]): string[] {
  const texte = texteNu(sansResume(html));
  return jalons.filter((j) => !texte.includes(j));
}

/* ------------------------------------------------------------------ fixtures
 *
 * Chaque chaîne porte un jalon unique `J##`. Un jalon absent du rendu est une
 * perte, et le message de la porte dit lequel : pas « il manque du texte »,
 * mais « J07 a disparu ».
 */

const CHIFFRES: SectionChiffres = {
  type: "chiffres",
  titre: "J01 le cadre en quatre chiffres",
  bref: "J02 la réponse courte",
  chiffres: [
    { valeur: "J03", libelle: "J04 techniciens", detail: "J05 au 1er janvier" },
    { valeur: "J06", libelle: "J07 sites suivis" },
  ],
  reponse: [{ accroche: "J08 la réponse", texte: "J09 tient en deux lignes" }],
};

const PROBLEME: SectionProbleme = {
  type: "probleme",
  punchline: "J10 le poste reste vacant",
  puces: [
    { accroche: "J11 la continuité", texte: "J12 absence ou départ" },
    { texte: "J13 une puce sans accroche, et le résumé doit la nommer quand même" },
  ],
};

const OFFRE: SectionOffre = {
  type: "offre",
  titre: "J14 ce que nous faisons",
  intro: "J15 le périmètre est écrit",
  lignes: [
    { prestation: { accroche: "J16 le relevé", texte: "J17 sur site" }, benefice: "J18 un plan" },
    { prestation: { texte: "J19 prestation sans accroche" }, benefice: "J20 un bénéfice" },
  ],
  tableau: { entetes: ["J21", "J22"], lignes: [["J23", "J24"]] },
  prose: [{ texte: "J25 la prose de fin" }],
};

/** L'offre SANS en-tête : la seule branche du dossier où `enTete` est absent. */
const OFFRE_SANS_ENTETE: SectionOffre = {
  type: "offre",
  lignes: [{ prestation: { texte: "J26 une ligne seule" }, benefice: "J27 un bénéfice seul" }],
};

const DEROULE: SectionDeroule = {
  type: "deroule",
  titre: "J28 le déroulé",
  intro: "J29 ce qui se passe après le clic",
  etapes: [
    { titre: "J30 un appel", texte: "J31 sous une heure" },
    { titre: "J32 un plan" },
  ],
};

const GARANTIES: SectionGaranties = {
  type: "garanties",
  titre: "J33 ce que nous garantissons",
  puces: [
    { accroche: "J34 le remplacement", texte: "J35 sous 48 heures ouvrées" },
    { texte: "J36 une garantie sans accroche" },
  ],
};

const PREUVES: SectionPreuves = {
  type: "preuves",
  titre: "J37 nos réalisations",
  preuves: [
    { titre: "J38 AKTID", texte: "J39 centre logistique", lienLibelle: "J40 lire le cas", lienHref: "/preuves/aktid-centre-logistique/" },
    { titre: "J41 un cas sans lien", texte: "J42 son résumé" },
  ],
};

const OBJECTIONS: SectionObjections = {
  type: "objections",
  titre: "J43 ce qu'on nous demande",
  questions: [
    { question: "J44 combien de temps", reponse: "J45 la réponse complète" },
    { question: "J46 et si ça ne marche pas", reponse: "J47 l'autre réponse" },
  ],
};

const CTA_FINAL: SectionCtaFinal = {
  type: "ctaFinal",
  question: "J48 quel est votre besoin",
  bouton: "J49 être rappelé",
  rappel: "J50 nous rappelons dans l'heure",
};

interface Epreuve {
  nom: string;
  element: ReactElement;
  jalons: readonly string[];
}

/** Tous les jalons d'une fixture, aplatis : rien n'est contrôlé à la main. */
function jalonsDe(valeur: unknown): string[] {
  const trouves: string[] = [];
  const parcours = (v: unknown): void => {
    if (typeof v === "string") {
      for (const j of v.match(/J\d\d/g) ?? []) trouves.push(j);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(parcours);
      return;
    }
    if (v && typeof v === "object") Object.values(v).forEach(parcours);
  };
  parcours(valeur);
  return [...new Set(trouves)];
}

const EPREUVES: Epreuve[] = [
  { nom: "chiffres", element: <ChiffresCles section={CHIFFRES} />, jalons: jalonsDe(CHIFFRES) },
  { nom: "probleme", element: <Probleme section={PROBLEME} />, jalons: jalonsDe(PROBLEME) },
  { nom: "offre", element: <Offre section={OFFRE} />, jalons: jalonsDe(OFFRE) },
  {
    nom: "offre sans en-tête",
    element: <Offre section={OFFRE_SANS_ENTETE} />,
    jalons: jalonsDe(OFFRE_SANS_ENTETE),
  },
  { nom: "deroule", element: <Deroule section={DEROULE} />, jalons: jalonsDe(DEROULE) },
  { nom: "garanties", element: <Garanties section={GARANTIES} />, jalons: jalonsDe(GARANTIES) },
  { nom: "preuves", element: <Preuves section={PREUVES} />, jalons: jalonsDe(PREUVES) },
  { nom: "objections", element: <Objections section={OBJECTIONS} />, jalons: jalonsDe(OBJECTIONS) },
  { nom: "ctaFinal", element: <Cta section={CTA_FINAL} />, jalons: jalonsDe(CTA_FINAL) },
];

/* -------------------------------------------------------------------- témoin
 *
 * D'ABORD la preuve que les verdicts savent refuser. Ils tournent sur du
 * balisage écrit exprès de travers. Sans cette étape, les assertions qui
 * suivent ne vaudraient rien : une fonction qui renvoie toujours « rien à
 * signaler » les passerait toutes.
 */

const SECTION_CONFORME =
  '<section data-bloc="x"><details data-pliable-mobile="" open>' +
  "<summary>titre</summary><div>J01 le texte</div></details></section>";

/* -- positifs : chacun doit être REFUSÉ -- */
assert.deepEqual(
  defautsDeRepli('<section><details data-pliable-mobile="" open></details></section>'),
  ["la <section> ne porte pas data-bloc"],
  "une section sans data-bloc doit être refusée",
);
assert.deepEqual(
  defautsDeRepli('<section data-bloc="x"><div>rien</div></section>'),
  ["aucun details[data-pliable-mobile] dans la section"],
  "une section sans dépliant doit être refusée",
);
assert.deepEqual(
  defautsDeRepli('<section data-bloc="x"><details data-pliable-mobile=""></details></section>'),
  ["le details est servi FERMÉ : Google perdrait le texte replié"],
  "un dépliant servi fermé doit être refusé",
);
assert.deepEqual(
  motsPerdus('<section data-bloc="x"><details data-pliable-mobile="" open>J01</details></section>', [
    "J01",
    "J02",
  ]),
  ["J02"],
  "LE CONTRÔLE QUI COMPTE : un jalon retiré du rendu doit être signalé, et nommé",
);
assert.deepEqual(
  motsPerdus(
    /* Le défaut de la maquette, reproduit : le contenu replié hors du DOM. */
    '<section data-bloc="x"><details data-pliable-mobile="" open><summary>titre</summary></details></section>',
    ["J01", "J02", "J03"],
  ),
  ["J01", "J02", "J03"],
  "le motif `sc-if` de la maquette, qui vide le pli, doit tout faire tomber",
);
assert.deepEqual(
  /* LE TROU DU 14/10, désormais gardé. Le corps a perdu J02 ; le résumé, lui,
     le nomme encore parce qu'il est construit depuis la donnée entière. Sans
     `sansResume`, cette épreuve renvoyait [] et la porte se taisait. */
  motsPerdus(
    '<section data-bloc="x"><details data-pliable-mobile="" open>' +
      '<summary>titre<p data-mobile-seulement="" class="h">J01 · J02</p></summary>' +
      "<div>J01 seulement</div></details></section>",
    ["J01", "J02"],
  ),
  ["J02"],
  "un résumé ne prouve pas la présence : une puce jetée du corps doit tomber",
);

/* -- négatifs : chacun doit être ACCEPTÉ -- */
assert.deepEqual(defautsDeRepli(SECTION_CONFORME), [], "NÉGATIF : une section conforme passe");
assert.deepEqual(
  motsPerdus(SECTION_CONFORME, ["J01"]),
  [],
  "NÉGATIF : un jalon présent ne doit pas être signalé",
);
assert.deepEqual(motsPerdus(SECTION_CONFORME, []), [], "NÉGATIF : aucun jalon, aucune perte");
assert.deepEqual(
  motsPerdus('<section data-bloc="x">J01 &amp; J02&#x27;s</section>', ["J01", "J02"]),
  [],
  "NÉGATIF : les entités HTML ne doivent pas faire croire à une perte",
);
assert.equal(
  texteNu("<p>deux\n\n  espaces</p>"),
  "deux espaces",
  "NÉGATIF : la normalisation des blancs ne change pas les mots",
);

console.log("témoin : 11/11 épreuves réussies, 6 refus et 5 acceptations\n");

/* --------------------------------------------------------------- le contrôle */

let sections = 0;
for (const e of EPREUVES) {
  const html = renderToStaticMarkup(e.element);
  const defauts = defautsDeRepli(html);
  const perdus = motsPerdus(html, e.jalons);

  assert.deepEqual(defauts, [], `bloc « ${e.nom} » : ${defauts.join(", ")}`);
  assert.deepEqual(
    perdus,
    [],
    `bloc « ${e.nom} » : ${perdus.length} chaîne(s) du corpus ont disparu du rendu (${perdus.join(", ")})`,
  );
  assert.equal(
    (html.match(/data-pliable-mobile/g) ?? []).length,
    1,
    `bloc « ${e.nom} » : un seul repli de section par bloc, pas deux`,
  );

  /* LA BASCULE N'EST JAMAIS MUETTE. Un `<summary>` sans texte est un bouton
     que ni l'œil ni le lecteur d'écran ne sait nommer. La branche sans
     en-tête de `Offre` est précisément celle qui pouvait le produire. */
  const bascule = html.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
  assert.ok(bascule, `bloc « ${e.nom} » : pas de <summary>`);
  assert.ok(
    texteNu(bascule[1]).replace(/[››]/g, "").trim().length > 0,
    `bloc « ${e.nom} » : la bascule n'annonce rien, elle serait un bouton muet`,
  );

  sections += 1;
  console.log(`  OK     ${e.nom.padEnd(20)} ${e.jalons.length} chaîne(s) du corpus, toutes rendues`);
}

assert.equal(sections, 9, "les neuf blocs de corps doivent tous être contrôlés");

console.log(`\n${sections} blocs : repli posé, aucun mot perdu.`);
console.log("LES_BLOCS_SE_REPLIENT_SANS_PERDRE_UN_MOT");
