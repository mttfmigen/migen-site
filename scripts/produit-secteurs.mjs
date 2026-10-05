/**
 * Traduit le corpus rédigé des 13 pages de /secteurs/ vers le gabarit 08 SECTEUR.
 *
 *   node scripts/produit-secteurs.mjs
 *
 * LE FICHIER DE MAQUETTE QUI FAIT FOI : `maquette/gabarit-08-secteur.html`,
 * transcrit de « Migen - Gabarit 08 Secteur.dc.html ». IL FAIT FOI CONTRE
 * « Migen - Site final.dc.html ».
 *
 * CE QUE CE SCRIPT FAISAIT DE FAUX, et c'est la correction du 03/10. Il lisait
 * « Site final », qui ne dessine QUATRE sections pour une page de secteur, et il
 * repliait donc le corpus dans quatre champs à plat (`chapeau`, `reperes`,
 * `enjeux`, `autres`, `appel*`) en renvoyant les SIX sections restantes dans
 * `complement`, où les blocs du gabarit de VENTE les rendaient avec leurs
 * surtitres à eux. Le gabarit 08 dessine DOUZE sections, et il dessine les DIX
 * du corpus, une par une.
 *
 * CE SCRIPT NE RÉDIGE RIEN, et il traduit maintenant beaucoup moins qu'avant :
 * le corpus est déjà analysé en dix sections par `scripts/importe_corpus.py`, et
 * la maquette en dessine dix. La correspondance est l'identité. Le script
 * recopie donc les sections telles quelles, et ne calcule que DEUX choses que
 * le composant ne peut pas déduire sans reparser du Markdown à chaque rendu :
 *
 *   · `pourAllerPlusLoin` : les cartes de la section « Maillage », une par lien
 *     interne trouvé dans le texte du corpus, avec LA PHRASE QUI LE PORTAIT en
 *     légende. C'est ce que fait le parseur de la maquette.
 *   · rien d'autre.
 *
 * LA CORRESPONDANCE, section par section :
 *
 *   maquette                 corpus
 *   ─────────────────────────────────────────────────────────────────────────
 *   01 Héros                 `heros` (h1, mecanisme, cta, telephone, delai)
 *   01 Héros, « En bref »    `chiffres`
 *   02 Photo et logos        la punchline de `probleme`, les clients de `preuves`
 *   03 Problème              `probleme`
 *   04 Offre                 `offre`
 *   05 Déroulé               `deroule`
 *   06 Garanties             `garanties`
 *   Réassurance              RIEN : chrome du gabarit, écrit dans la maquette
 *   07 Appel                 `cta`
 *   08 Références            `preuves`
 *   09 Questions             `objections`
 *   Maillage                 les liens internes du texte, dédoublonnés
 *   10 Appel final           `ctaFinal`, et le formulaire du site
 *
 * AUCUNE SECTION N'EST PERDUE, et `complement` n'a plus d'emploi : c'était le
 * symptôme du mauvais fichier de maquette, pas une décision.
 *
 * LES PAGES SŒURS passent désormais par le maillage interne de la route, en
 * cartes cliquables comme l'exige `CLAUDE.md` section 4. Le gabarit 08 ne
 * dessine pas de rangée de pastilles de secteurs : il dessine « Pour aller plus
 * loin », alimenté par les liens que le client a lui-même écrits dans son texte.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SORTIE = join(RACINE, "supabase", "import", "gabarits-maquette");
const SOURCE_CORPUS = join(RACINE, "supabase", "import", "corpus-analyse.json");

/**
 * Les visuels que la maquette distribue en cycle aux cartes de maillage.
 *
 * Même liste et même décalage que `const PHOTOS` de son script, et que
 * `components/site/secteur/contenu-maquette.ts` : la carte `i` reçoit
 * `PHOTOS[(i + 3) % PHOTOS.length]`. Le corpus ne porte aucune image, ces
 * chemins sont du DESSIN.
 */
const PHOTOS = [
  "team-grind-front",
  "team-duo",
  "ph-tuyaux",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
  "ph-hero-raffinerie",
];

/** Les dix sections du corpus, dans l'ordre où le gabarit les attend. */
const ORDRE = [
  "heros",
  "chiffres",
  "probleme",
  "offre",
  "deroule",
  "garanties",
  "cta",
  "preuves",
  "objections",
  "ctaFinal",
];

const corpus = JSON.parse(readFileSync(SOURCE_CORPUS, "utf8"));

/** Les 13 pages de la branche, dans l'ordre du corpus. */
const pages = corpus.filter((entree) => entree.url.includes("/secteurs/"));

/**
 * Tout le texte d'une section, à plat, dans l'ordre où il est écrit.
 *
 * Marche sur la forme analysée du corpus sans connaître ses champs : une
 * section nouvelle ou un champ renommé ne fait pas rater des liens en silence.
 */
function textesDe(valeur, sortie = []) {
  if (typeof valeur === "string") sortie.push(valeur);
  else if (Array.isArray(valeur)) valeur.forEach((v) => textesDe(v, sortie));
  else if (valeur && typeof valeur === "object") {
    Object.values(valeur).forEach((v) => textesDe(v, sortie));
  }
  return sortie;
}

/** Une phrase sans son balisage Markdown, pour servir de légende. */
function sansMarkdown(texte) {
  return texte
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*/g, "")
    .trim();
}

/**
 * Les cartes de « Pour aller plus loin », une par lien interne du texte.
 *
 * COMME LE PARSEUR DE LA MAQUETTE, et pour les mêmes raisons :
 *
 *   · la LÉGENDE est la phrase qui portait le lien, sans son balisage. Ce n'est
 *     pas un résumé écrit pour l'occasion : c'est le texte du client.
 *   · le TITRE est le libellé du lien, capitale d'attaque mise, parce qu'il est
 *     tiré d'une phrase et devient un titre de carte.
 *   · les liens vers `/preuves/` sont ÉCARTÉS : ils ont déjà leur section,
 *     « 08 Références », et la même étude de cas deux fois sur une page n'ajoute
 *     rien.
 *   · dédoublonné par cible, premier gagnant.
 */
function cartesDeMaillage(sections) {
  const vues = new Set();
  const cartes = [];

  for (const section of sections) {
    for (const texte of textesDe(section)) {
      /* Les phrases sont découpées AVANT la recherche des liens : c'est ce qui
         donne à chaque lien la phrase qui le portait, et pas tout le paragraphe. */
      for (const phrase of texte.split(/(?<=[.?!])\s+/)) {
        for (const [, libelle, href] of phrase.matchAll(
          /\[([^\]]+)\]\(([^)]+)\)/g,
        )) {
          if (!href.startsWith("/") || href.startsWith("/preuves/")) continue;
          if (vues.has(href)) continue;
          vues.add(href);
          const legende = sansMarkdown(phrase);
          cartes.push({
            titre: libelle.charAt(0).toLocaleUpperCase("fr") + libelle.slice(1),
            href,
            ...(legende ? { texte: legende } : {}),
            image: `/assets/web/${PHOTOS[(cartes.length + 3) % PHOTOS.length]}.jpg`,
          });
        }
      }
    }
  }

  return cartes;
}

/** Le contenu secteur d'une page : ses dix sections, et ses cartes de maillage. */
function contenuSecteur(entree) {
  /* L'ORDRE DU TABLEAU EST LE GABARIT, et il est imposé ici plutôt que supposé :
     le corpus écrit ses sections dans cet ordre, mais une page dont une section
     manque ou arrive de travers ne doit pas décaler le gabarit. Les sections
     que `ORDRE` ne nomme pas sont conservées à la fin, pour qu'un type nouveau
     se voie au lieu de disparaître. */
  const connues = entree.contenu.sections.filter((s) => ORDRE.includes(s.type));
  const inconnues = entree.contenu.sections.filter(
    (s) => !ORDRE.includes(s.type),
  );
  const sections = [
    ...ORDRE.map((type) => connues.find((s) => s.type === type)).filter(Boolean),
    ...inconnues,
  ];

  const contenu = { gabarit: "secteur", sections };

  const cartes = cartesDeMaillage(sections);
  if (cartes.length > 0) contenu.pourAllerPlusLoin = cartes;

  return contenu;
}

/** `/secteurs/logistique/peak-season/` devient `secteurs-logistique-peak-season`. */
function nomFichier(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

mkdirSync(SORTIE, { recursive: true });

let ecrits = 0;
for (const entree of pages) {
  const contenu = contenuSecteur(entree);
  const fichier = join(SORTIE, `${nomFichier(entree.url)}.json`);
  writeFileSync(
    fichier,
    `${JSON.stringify(
      {
        url: entree.url,
        source:
          "dessin : maquette/gabarit-08-secteur.html, transcrit de " +
          "« Migen - Gabarit 08 Secteur.dc.html », qui fait foi contre « Site final ». " +
          "texte : supabase/import/corpus-analyse.json, produit par scripts/produit-secteurs.mjs.",
        contenu,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  ecrits += 1;

  const types = contenu.sections.map((s) => s.type);
  const manquantes = ORDRE.filter((t) => !types.includes(t));
  console.log(
    `${entree.url.padEnd(44)} ${String(types.length).padStart(2)}/10 sections, ` +
      `${String(contenu.pourAllerPlusLoin?.length ?? 0)} carte(s) de maillage` +
      (manquantes.length > 0 ? `, VIDE : ${manquantes.join(", ")}` : ""),
  );
}

console.log(`\n${ecrits} fichier(s) écrit(s) dans supabase/import/gabarits-maquette/.`);
console.log("Pour les poser en base : node scripts/importe_rest.mjs --simulation");
