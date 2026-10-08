/**
 * Contrôle de l'écran « Équipe / Direction » contre SA CAPTURE, sans navigateur
 * ni base.
 *
 *   bun components/site/equipe/verification-equipe.tsx
 *
 * LA RÉFÉRENCE est `maquette/rendu/a-propos--equipe.html`, le rendu figé de la
 * maquette autonome pour `/a-propos/equipe/`. Chaque section du rendu porté est
 * comparée MOT POUR MOT à la section de même rang de la capture : un mot changé,
 * ajouté ou retiré fait échouer le contrôle. Les seules différences admises sont
 * les substitutions écrites plus bas, imposées par une décision du client, et
 * chacune est vérifiée dans les deux sens.
 *
 * LES SURVOLS sont relus dans `maquette/site-final-autonome.html` (attributs
 * `style-hover`, élément par élément) et comparés aux règles `:hover` de
 * `Equipe.module.css` portées par l'élément rendu correspondant.
 *
 * La page elle-même n'est pas montée : `generateMetadata` appelle Supabase. Le
 * héros, qui en était le seul contenu propre, vit dans `EnteteEquipe`.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";

/* Bun ne résout pas les modules CSS : `styles.x` vaudrait `undefined` et la
   classe disparaîtrait du rendu. Le greffon rend chaque classe sous son propre
   nom, le temps du contrôle, pour qu'on puisse vérifier qui porte quel survol.
   `declare` : même raison que `components/consentement/verification-bandeau.tsx`,
   le projet n'installe pas `@types/bun`. */
declare const Bun: {
  plugin(greffon: {
    name: string;
    setup(build: {
      onLoad(
        filtre: { filter: RegExp },
        charge: () => { contents: string; loader: "ts" },
      ): void;
    }): void;
  }): void;
};

Bun.plugin({
  name: "classes-equipe-lisibles",
  setup(build) {
    build.onLoad({ filter: /components\/site\/equipe\/Equipe\.module\.css$/ }, () => ({
      contents: "export default new Proxy({}, { get: (_, nom) => String(nom) });",
      loader: "ts",
    }));
  },
});

const { default: FormulaireBasDePage } = await import("@/components/site/accueil/FormulaireBasDePage");
const { default: AppelInterlocuteur } = await import("@/components/site/equipe/AppelInterlocuteur");
const { default: EngagementsEquipe } = await import("@/components/site/equipe/EngagementsEquipe");
const { default: EnteteEquipe } = await import("@/components/site/equipe/EnteteEquipe");
const { default: GroupeEquipe } = await import("@/components/site/equipe/GroupeEquipe");
const { default: ImplantationsEquipe } = await import("@/components/site/equipe/ImplantationsEquipe");
const { default: NotreHistoire } = await import("@/components/site/equipe/NotreHistoire");
const { default: QuestionsEquipe } = await import("@/components/site/equipe/QuestionsEquipe");
const { default: QuiNousSommes } = await import("@/components/site/equipe/QuiNousSommes");
const { default: QuiVousRepond } = await import("@/components/site/equipe/QuiVousRepond");
const { default: SelectionEquipe } = await import("@/components/site/equipe/SelectionEquipe");
const { CHEMIN, DIRECTION, H1, SUPPORT, TITRE_PAR_DEFAUT } = await import(
  "@/components/site/equipe/equipe-donnees"
);

const lis = (chemin: string): string =>
  readFileSync(new URL(chemin, import.meta.url), "utf8");

// --------------------------------------------------------- la capture, la source
const CAPTURE = lis("../../../maquette/rendu/a-propos--equipe.html");
assert.ok(
  CAPTURE.includes('data-screen-label="Équipe / Direction"'),
  "la capture n'est plus celle de l'écran équipe",
);
assert.equal(
  JSON.parse(lis("../../../maquette/rendu/a-propos--equipe.json")).url,
  CHEMIN,
  "la capture ne décrit plus l'adresse canonique de l'écran",
);

/** Les sections de la capture, dans l'ordre (le premier morceau est le `<main>`),
 *  décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const SECTIONS_CAPTURE = appliqueDecisions(CAPTURE).split(/(?=<section[\s>])/).slice(1);

/** Le texte visible d'un fragment HTML, normalisé pour comparer. */
function texte(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;|\u00a0|\u202f/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ------------------------------------------------------------- le rendu porté
const SECTIONS_RENDUES = [
  <EnteteEquipe key="entete" />,
  <GroupeEquipe key="direction" groupe={DIRECTION} paddingHaut={44} />,
  <GroupeEquipe key="support" groupe={SUPPORT} paddingHaut={34} />,
  <QuiNousSommes key="qui" />,
  <NotreHistoire key="histoire" />,
  <SelectionEquipe key="selection" />,
  <ImplantationsEquipe key="implantations" />,
  <EngagementsEquipe key="engagements" />,
  <QuestionsEquipe key="questions" />,
  <AppelInterlocuteur key="appel" />,
  <QuiVousRepond key="relais" />,
  // Mêmes propriétés que `app/a-propos/equipe/page.tsx`.
  <FormulaireBasDePage
    key="formulaire"
    formulaire="equipe"
    titre="Parlez directement à l’équipe."
    intro="Pas de standard ni de centre d’appels : votre demande arrive chez un chargé d’affaires."
  />,
].map((element) => renderToStaticMarkup(element));

const HTML = SECTIONS_RENDUES.join("");
const TEXTE = texte(HTML);

assert.equal(
  SECTIONS_RENDUES.length,
  SECTIONS_CAPTURE.length,
  "le rendu n'a plus le même nombre de sections que la capture",
);

// ------------------------------------- substitutions imposées par le client
// Le siège : la capture écrit encore Limonest, Mehdi a tranché le 07/10 au soir
// « le siège est à Écully ». Chaque phrase de la capture est relue (sinon
// l'exception n'a plus d'objet et le contrôle le dit), sa correction est rendue.
const SUBSTITUTIONS: readonly (readonly [string, string])[] = [
  ["Siège · Limonest et Écully", "Siège · Écully"],
  [
    "l'entreprise pilote son activité depuis Limonest, avec des bureaux à Écully.",
    "l'entreprise pilote son activité depuis son siège d'Écully.",
  ],
];
for (const [capture, rendu] of SUBSTITUTIONS) {
  assert.ok(
    texte(CAPTURE).includes(capture),
    `la capture ne porte plus « ${capture} » : l'exception du 07/10 n'a plus d'objet, la retirer`,
  );
  assert.ok(TEXTE.includes(rendu), `« ${rendu} » (décision du 07/10) manque dans le rendu`);
}

const corrige = (s: string): string =>
  SUBSTITUTIONS.reduce((acc, [capture, rendu]) => acc.split(capture).join(rendu), s);

// ------------------------------------------ le texte, section par section
// Les onze sections propres à l'écran : égalité stricte.
for (let i = 0; i < SECTIONS_RENDUES.length - 1; i += 1) {
  assert.equal(
    texte(SECTIONS_RENDUES[i]),
    corrige(texte(SECTIONS_CAPTURE[i])),
    `section ${i} : le texte rendu n'est pas celui de la capture, mot pour mot`,
  );
}

// Le formulaire est le composant partagé du site. Chaque fragment de texte de
// la capture y est rendu, dans l'ordre ; il ajoute la mention RGPD (et le champ
// piège invisible), qui appartiennent au formulaire commun.
{
  const rendu = texte(SECTIONS_RENDUES.at(-1) ?? "");
  const fragments = (SECTIONS_CAPTURE.at(-1) ?? "")
    .split(/<[^>]*>/)
    .map(texte)
    .filter(Boolean);
  let curseur = 0;
  for (const fragment of fragments) {
    const position = rendu.indexOf(fragment, curseur);
    assert.ok(position >= 0, `formulaire : « ${fragment} » manque ou est déplacé`);
    curseur = position + fragment.length;
  }
}

// ----------------------------------------------------- un seul h1, le bon
assert.equal(HTML.match(/<h1[\s>]/g)?.length ?? 0, 1, "l'écran doit poser un et un seul h1");
assert.ok(texte(SECTIONS_CAPTURE[0]).includes(H1), `le H1 porté n'est pas celui de la capture : ${H1}`);
assert.notEqual(TITRE_PAR_DEFAUT, H1, "le meta title répète le H1");

// ------------------------------------------------------- photos, dans l'ordre
// Mêmes images, mêmes textes alternatifs, même ordre que la capture. La photo
// de fond de la FAQ est un fond CSS dans la maquette : décorative, `alt=""`.
{
  const alts = (html: string): string[] =>
    [...html.matchAll(/<img[^>]*\balt="([^"]*)"/g)]
      .map((m) => texte(m[1]))
      .filter(Boolean);
  assert.deepEqual(alts(HTML), alts(CAPTURE), "les images rendues ne sont pas celles de la capture");
  for (const personne of [...DIRECTION.personnes, ...SUPPORT.personnes]) {
    assert.ok(personne.photo, `${personne.nom} n'a pas son portrait`);
    const fichier = typeof personne.photo === "string" ? personne.photo : personne.photo.src;
    assert.ok(existsSync(fichier) && statSync(fichier).size > 0, `portrait illisible : ${fichier}`);
  }
  assert.ok(HTML.includes("faq-offre.jpg"), "la photo de fond de la FAQ manque");
  assert.ok(HTML.includes("mq-f10bb16f54d0.jpg"), "la photo « Techniciens migen sur site » manque");
}

// ----------------------------------------------------- la FAQ, état initial
// La capture montre les six plis fermés, et un seul s'ouvre à la fois.
{
  const questions = SECTIONS_RENDUES[8];
  assert.equal(questions.match(/<details/g)?.length ?? 0, 6, "la FAQ n'a plus six plis");
  assert.ok(!/<details[^>]*\bopen\b/.test(questions), "un pli de la FAQ est ouvert, la capture les montre fermés");
  assert.equal(new Set([...questions.matchAll(/<details[^>]*name="([^"]+)"/g)].map((m) => m[1])).size, 1, "les plis ne partagent pas un même groupe exclusif");
  assert.ok(/--gl-a:\.1/.test(questions), "le panneau de la FAQ n'a plus son verre à 10 %");
  assert.ok(SECTIONS_CAPTURE[8].includes("mg-faqph"), "la capture n'a plus son panneau photo");
}

// ------------------------------------------------------------- les survols
// Chaque `style-hover` de l'écran dans la maquette, relevé élément par élément,
// doit se retrouver dans la règle `:hover` de la classe que porte l'élément
// rendu. Une déclaration identique à l'état de repos ne demande aucune règle.
{
  const source = lis("../../../maquette/site-final-autonome.html");
  const debut = source.indexOf('data-screen-label=\\"Équipe / Direction\\"');
  assert.ok(debut >= 0, "l'écran équipe est introuvable dans la maquette autonome");
  const fin = source.slice(debut + 1).search(/data-screen-label=\\"(?!Équipe)/);
  const ecran = source
    .slice(debut, debut + 1 + fin)
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\u002F/g, "/");

  const declarations = (bloc: string): Set<string> =>
    new Set(
      bloc
        .split(";")
        .map((d) => d.toLowerCase().replace(/\s+/g, "").replace(/(^|[^\d.])0\./g, "$1."))
        .filter(Boolean),
    );

  const css = lis("./Equipe.module.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const survols = new Map(
    [...css.matchAll(/\.([\w-]+):hover\s*\{([^}]*)\}/g)].map((m) => [m[1], declarations(m[2])]),
  );

  // Le bouton du formulaire appartient au formulaire commun et à son module.
  const HORS_ECRAN = ["On me rappelle dans l’heure"];

  let curseur = 0;
  let releves = 0;
  for (const m of ecran.matchAll(/<([a-z]+)\s([^>]*?)style-hover="([^"]*)"[^>]*>/g)) {
    const avant = m[2] + m[0];
    const repos = declarations(avant.match(/\sstyle="([^"]*)"/)?.[1] ?? "");
    const attendu = [...declarations(m[3])].filter((d) => !repos.has(d));
    // L'élément est repéré par le premier texte qui le suit : son libellé, ou
    // le nom de la personne pour une carte.
    const suite = ecran.slice((m.index ?? 0) + m[0].length);
    const repere = texte((`>${suite}`.match(/>([^<]*[^<\s][^<]*)</) ?? ["", ""])[1]);
    if (HORS_ECRAN.some((h) => repere.startsWith(h))) continue;
    releves += 1;
    const position = HTML.indexOf(repere.replace(/'/g, "’").replace(/&/g, "&amp;"), curseur);
    const position2 = position >= 0 ? position : HTML.indexOf(repere, curseur);
    assert.ok(position2 >= 0, `survol : élément « ${repere} » introuvable dans le rendu`);
    curseur = position2 + repere.length;
    if (attendu.length === 0) continue;
    const classes = [...HTML.slice(0, position2).matchAll(/class="([^"]*)"/g)]
      .flatMap((c) => c[1].split(/\s+/))
      .filter((c) => survols.has(c));
    const classe = classes.at(-1);
    assert.ok(classe, `survol de « ${repere} » : aucune classe de survol sur l'élément rendu`);
    for (const d of attendu) {
      assert.ok(survols.get(classe)?.has(d), `survol de « ${repere} » (.${classe}) : « ${d} » manque`);
    }
  }
  assert.ok(releves >= 11, `seulement ${releves} survols relevés dans la maquette, l'extraction a dérivé`);
}

// ------------------------------------------------------------ liens inertes
assert.ok(!HTML.includes('href="#"'), 'un lien de l\'écran équipe est rendu inerte (href="#")');

// --------------------------------------- aucune classe Tailwind de couleur
for (const classe of HTML.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?\d*\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : ${classe[1]}`,
  );
}

// --------------------------------------------- interdits de copie du contrat
for (const interdit of [
  "réguliers",
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
  "24h",
  "24 h",
  "7j/7",
  "7 j/7",
  "Teamtailor",
  "Limonest",
  "—",
  "–",
]) {
  assert.ok(!TEXTE.includes(interdit), `copie interdite : ${interdit}`);
}
assert.ok(/\+200\b/.test(TEXTE), "le compte « +200 » de la capture manque");

// -------------------------------- rien d'invisible, le CSS fait l'apparition
assert.ok(!/opacity:0(?![.0-9])/.test(HTML), "un bloc de l'écran équipe est rendu avec une opacité nulle");

// ------------------------------------------- marges mobiles des conteneurs
// `app/globals.css` rattrape la gouttière sous 760px par `[style*="max-width:1200px"]`.
SECTIONS_RENDUES.slice(0, -1).forEach((section, i) => {
  assert.ok(section.includes("max-width:1200px"), `section ${i} : conteneur sans largeur littérale de 1200px`);
});

console.log(
  `Écran équipe : ${SECTIONS_RENDUES.length} sections conformes à la capture, mot pour mot, images et survols compris.`,
);
