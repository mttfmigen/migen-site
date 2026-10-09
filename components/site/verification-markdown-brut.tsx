/**
 * AUCUN COMPOSANT NE REND LE MARKDOWN DU CORPUS À L'ÉCRAN.
 *
 *   bun components/site/verification-markdown-brut.tsx
 *
 * POURQUOI CETTE PORTE EXISTE, et c'est elle le vrai enseignement du 09/10.
 * L'audit de Nathan Jorez a relevé 26 chaînes de Markdown visibles sur 12 des
 * 248 pages, identiques en local et en production. AUCUNE porte du dépôt ne les
 * voyait, et c'est normal : chacune compare une page à SA capture, et la
 * maquette affiche elle-même ces crochets. Tant que le site reproduisait le
 * défaut de la maquette, tout était « conforme ». Le client l'a vu avant nous.
 *
 * Cette porte ne compare donc RIEN à la maquette. Elle encode la règle, une
 * fois : un champ de corpus qui arrive avec du Markdown doit ressortir sans sa
 * syntaxe, quel que soit le composant qui le rend, et la donnée n'y est pour
 * rien. Elle injecte elle-même ses textes, elle ne dépend d'aucune fiche : une
 * fiche nettoyée ne peut pas la rendre muette.
 *
 * LES CINQ COMPOSANTS COUVERTS sont ceux qui rendaient brut le 09/10 :
 *
 *   offre/QuestionsOffre      réponse de FAQ, gabarit 03
 *   offres/QuestionsPhoto     réponse de FAQ, 4 des 5 chaînes relevées
 *   implantation/QuestionsVille  réponse de FAQ, `/implantations/`
 *   offre/PointsOffre         le complément de la carte d'offre
 *   offre/ReferencesOffre     le texte de la carte de référence
 *   ressource/CorpsRessource  le gras qui contient un lien, 12 chaînes
 *
 * DEUX EXIGENCES PAR COMPOSANT, et la seconde compte autant que la première :
 *   1. plus aucune syntaxe Markdown dans le texte visible ;
 *   2. les MOTS sont toujours là, et le lien interne est devenu un vrai `<a>`.
 * Sans la seconde, supprimer le texte suffirait à faire passer la porte.
 *
 * `ReferencesOffre` est la seule exception déclarée, et elle est vérifiée : sa
 * carte est elle-même un `<Link>`, donc le lien du corpus y est réduit à ses
 * mots. La porte exige l'ABSENCE d'`<a>` imbriqué, qui serait un défaut HTML.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import QuestionsVille from "./implantation/QuestionsVille";
import PointsOffre from "./offre/PointsOffre";
import ReferencesOffre from "./offre/ReferencesOffre";
import QuestionsOffre from "./offre/QuestionsOffre";
import QuestionsPhoto from "./offres/QuestionsPhoto";
import CorpsRessource from "./ressource/CorpsRessource";

/* ------------------------------------------------------------ outillage */

/** Le texte lisible du HTML rendu, balisage Markdown COMPRIS. */
function visible(html: string): string {
  return html
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ");
}

/** Le gras, le lien, le dièse de titre : les trois formes que l'audit compte. */
const MARKDOWN =
  /\*\*[^*\n]{1,200}\*\*|\[[^\]\n]{1,200}\]\([^)\n]{0,300}\)|(?:^|\n)#{1,6}\s+\S/;

const echecs: string[] = [];

/**
 * Un composant rend-il ce texte sans sa syntaxe, en gardant ses mots ?
 *
 * LES MOTS SE VÉRIFIENT UN PAR UN, et pas en phrase entière : le rendu correct
 * coupe le texte sur ses balises (« <strong>Le <a>dépannage industriel</a>
 * </strong> pour l'imprévu. »), donc exiger la phrase contiguë ferait échouer
 * précisément le rendu attendu.
 *
 * `cible` à `null` déclare que ce composant NE PEUT PAS produire de lien ici.
 * La déclaration n'est pas crue sur parole : `exigeAucunLienImbrique` la
 * vérifie séparément, puisque c'est la seule raison valable de s'en passer.
 */
function exige(nom: string, html: string, mots: string[], cible: string | null) {
  const texte = visible(html);
  const trouve = texte.match(MARKDOWN);
  if (trouve) echecs.push(`${nom} : Markdown visible, « ${trouve[0].trim()} »`);

  for (const mot of mots) {
    if (!texte.includes(mot)) echecs.push(`${nom} : « ${mot} » a disparu du rendu`);
  }

  if (!cible) return;
  /* Le slash final n'est pas exigé : `next/link` le normalise selon
     `trailingSlash` de `next.config.ts`, que ce script, exécuté hors du moteur
     Next, ne lit pas. Mesuré : il rend `/offres/zero-arret`. La forme servie se
     contrôle dans le navigateur, même arbitrage que
     `blocs/verification-texte-riche.tsx`. */
  const sansSlash = cible.replace(/\/$/, "");
  const motif = new RegExp(
    `<a[^>]+href="${sansSlash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`,
  );
  if (!motif.test(html)) {
    echecs.push(`${nom} : aucun lien rendu vers ${cible}`);
  }
}

/** Aucun `<a>` dans un `<a>` : le HTML l'interdit, React l'hydrate de travers. */
function exigeAucunLienImbrique(nom: string, html: string) {
  let profondeur = 0;
  for (const balise of html.match(/<a\b|<\/a>/g) ?? []) {
    if (balise === "</a>") {
      profondeur -= 1;
      continue;
    }
    profondeur += 1;
    if (profondeur > 1) echecs.push(`${nom} : un <a> est imbriqué dans un autre`);
  }
}

const LIEN = "[contrat de maintenance](/offres/zero-arret/)";
const GRAS_AVEC_LIEN = "**Le [dépannage industriel](/offres/depannage-industriel/)**";

/* ------------------------------------------- 1. les trois FAQ du site */

const QUESTIONS = [
  { question: `Et le ${LIEN} ?`, reponse: `Oui, via notre ${LIEN}. **Un périmètre écrit.**` },
];

exige(
  "offre/QuestionsOffre",
  renderToStaticMarkup(
    <QuestionsOffre section={{ type: "objections", questions: QUESTIONS }} />,
  ),
  ["contrat de maintenance", "Un périmètre écrit."],
  "/offres/zero-arret/",
);

exige(
  "offres/QuestionsPhoto",
  renderToStaticMarkup(
    <QuestionsPhoto
      donnees={{
        surtitre: "Questions fréquentes",
        titre: "Vos questions",
        lienTexte: "Poser ma question",
        lienHref: "#mgx-form",
        photo: "/assets/web/faq-offres.jpg",
        questions: QUESTIONS,
      }}
    />,
  ),
  ["contrat de maintenance", "Un périmètre écrit."],
  "/offres/zero-arret/",
);

exige(
  "implantation/QuestionsVille",
  renderToStaticMarkup(
    <QuestionsVille section={{ type: "objections", questions: QUESTIONS }} />,
  ),
  ["contrat de maintenance", "Un périmètre écrit."],
  "/offres/zero-arret/",
);

/* ------------------------------- 2. le complément de la carte d'offre */

/* `PointsOffre` reçoit des lignes du corpus et les fusionne lui-même
   (`fusionneLigne`) : une accroche plus un texte plein donnent le complément,
   qui est le champ qui fuyait. La donnée est écrite pour tomber dans ce cas. */
exige(
  "offre/PointsOffre",
  renderToStaticMarkup(
    <PointsOffre
      section={{
        type: "offre",
        lignes: [
          {
            prestation: { accroche: "Astreinte", texte: `voir l'${LIEN}.` },
            benefice: "une ligne qui repart",
          },
        ],
      }}
    />,
  ),
  ["contrat de maintenance", "une ligne qui repart"],
  "/offres/zero-arret/",
);

/* ------------------------------- 3. la carte de référence, sans lien imbriqué */

const RENDU_REFERENCES = renderToStaticMarkup(
  <ReferencesOffre
    section={{
      type: "preuves",
      preuves: [
        {
          titre: `[Étude de cas EATON : mise en production](/preuves/eaton-mise-en-production/)`,
          texte: `[Étude de cas EATON : mise en production](/preuves/eaton-mise-en-production/) · Janvier 2023.`,
          lienLibelle: "Étude de cas EATON : mise en production",
          lienHref: "/preuves/eaton-mise-en-production/",
          photo: "/assets/web/x-tableau-ceinture.jpg",
        },
      ],
    }}
  />,
);
exige(
  "offre/ReferencesOffre",
  RENDU_REFERENCES,
  ["Étude de cas EATON : mise en production", "Janvier 2023."],
  null,
);
exigeAucunLienImbrique("offre/ReferencesOffre", RENDU_REFERENCES);

/* --------------------- 4. le gras qui contient un lien, gabarit ressource */

exige(
  "ressource/CorpsRessource",
  renderToStaticMarkup(
    <CorpsRessource
      parties={[
        {
          titre: "Les offres",
          blocs: [
            { type: "puces", items: [`${GRAS_AVEC_LIEN} pour l'imprévu.`] },
            { type: "paragraphe", texte: `Confiez votre ${LIEN} à Migen.` },
            { type: "encadre", texte: `**Un périmètre écrit** avant signature.` },
          ],
        },
      ]}
    />,
  ),
  ["dépannage industriel", "pour l'imprévu.", "contrat de maintenance", "Un périmètre écrit"],
  "/offres/depannage-industriel/",
);

/* ------------------------------------------------------------ verdict */

if (echecs.length > 0) {
  console.error(`Markdown brut : ${echecs.length} défaut(s).`);
  for (const e of echecs) console.error(`  · ${e}`);
  process.exit(1);
}

/* La porte doit savoir échouer : on lui montre le défaut du 09/10 tel quel,
   et elle doit le refuser. Sans cette preuve, une régression du motif
   `MARKDOWN` la rendrait muette sans que rien ne le dise. */
assert.match(
  visible(renderToStaticMarkup(<p>{GRAS_AVEC_LIEN}</p>)),
  MARKDOWN,
  "le motif ne reconnaît plus le défaut qu'il doit refuser",
);
assert.match(visible(renderToStaticMarkup(<p>{`Voir l'${LIEN}.`}</p>)), MARKDOWN);
assert.match(visible(renderToStaticMarkup(<p>{"## Un intertitre"}</p>)), MARKDOWN);
assert.doesNotMatch(
  visible(renderToStaticMarkup(<p>Un texte français, 100 % propre : rien à signaler.</p>)),
  MARKDOWN,
  "le motif ne doit pas accuser un texte sans Markdown",
);

console.log(
  "Markdown brut : 6 composants rendent le corpus sans sa syntaxe, mots et liens conservés, aucun <a> imbriqué.",
);
