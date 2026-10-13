/**
 * LA PORTE DE « Ressources v2 ».
 *
 *   bun components/site/ressources-hub/verification-hub.tsx
 *   bun components/site/ressources-hub/verification-hub.tsx --controle
 *
 * CE QU'ELLE TIENT, et chaque point correspond à un défaut qui pouvait passer
 * sans bruit :
 *
 *   1. LA DÉRIVATION DES ÉTIQUETTES EST FIDÈLE À LA MAQUETTE. Rejouée sur la
 *      donnée de la maquette elle-même (`window.__MGRES`, relue dans le
 *      fichier autonome), la règle doit rendre EXACTEMENT 14 étiquettes non
 *      vides sur ses 15 articles, et le jeu d'étiquettes qu'elle calcule pour
 *      chacun. C'est le seul contrôle qui prouve que les seize motifs ont été
 *      transcrits sans faute de frappe : une parenthèse de travers dans
 *      `/predicti|vibratoire|capteur/` ne se voit pas à la relecture.
 *   2. LA RÈGLE DES MINUTES EST CELLE DU PROJET. `minutesDeLecture` doit
 *      retrouver les `minutes` écrites dans le catalogue des 35 ressources,
 *      35 fois sur 35, depuis leur `mots`, et donner le même résultat que
 *      `minutesMaquette` de `components/site/ressource/maquette-ressource.ts`.
 *      Deux implémentations de la même règle doivent se contredire bruyamment
 *      ou pas du tout.
 *   3. LE THÈME NE COUVRE QUE CE QU'IL COUVRE. Les quinze URL de
 *      `THEME_PAR_ARTICLE` doivent être exactement les quinze articles du
 *      dépôt, chaque thème doit être l'un des quatre, et les vingt autres
 *      fiches doivent sortir SANS thème. Un article renommé, ajouté ou
 *      déplacé fait tomber la porte au lieu de glisser dans « Tout » sans que
 *      personne le voie.
 *   4. AUCUNE PAGE N'EST PERDUE. La bibliothèque doit porter les 35 URL de
 *      `/ressources/` et les 13 de `/carriere/`, et le rendu du composant doit
 *      contenir les 48 `href` : filtres au repos pour la grille, et sans
 *      condition pour le sommaire complet. C'est la traduction du principe 2
 *      du contrat en quelque chose qui sait échouer.
 *   5. LE HUB NE PERD PAS UN MOT. Le rendu de `/ressources/` avec sa
 *      bibliothèque doit contenir tout le texte qu'il rendait sans elle. La
 *      porte monte le gabarit deux fois, avec et sans, et compare.
 *   6. LA COPIE RESPECTE LE CONTRAT. Aucun montant, aucun délai chiffré hors
 *      « rappel dans l'heure », aucun mot proscrit, aucun tiret cadratin dans
 *      ce que le composant rend.
 *   7. AUCUNE SYNTAXE DU CORPUS À L'ÉCRAN. Ni `**gras**`, ni
 *      `[libellé](/chemin/)`, ni lien imbriqué dans le lien de la carte.
 *
 * ELLE SAIT ÉCHOUER : `--controle` rejoue chaque vérification sur une donnée
 * ou une règle fautive et exige que LA RÈGLE VISÉE tombe, reconnue à son
 * message. Douze témoins, dont onze négatifs au sens strict (une donnée juste
 * rendue fausse) et un positif (la donnée réelle doit passer).
 *
 * Outil de vérification, jamais importé par l'application.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

import { renderToStaticMarkup } from "react-dom/server";

import Guide from "@/components/site/editorial/Guide";
import { minutesMaquette } from "@/components/site/ressource/maquette-ressource";
import type { VueGuide } from "@/types/editorial";

import BibliothequeRessources from "./BibliothequeRessources";
import { bibliotheque } from "./catalogue";
import type { Bibliotheque } from "./catalogue";
import {
  etiquettesDe,
  minutesDeLecture,
  TAXONOMIE_ENTREPRISES,
  THEMES,
  THEME_PAR_ARTICLE,
} from "./taxonomie";

const RACINE = join(import.meta.dirname, "..", "..", "..");
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const MAQUETTE = join(RACINE, "maquette", "colis-13-10", "Migen - Ressources.html");

const echecs: string[] = [];
function exige(regle: string, fn: () => void) {
  try {
    fn();
  } catch (erreur) {
    echecs.push(`${regle} : ${(erreur as Error).message}`);
  }
}

/* --------------------------------------------- la donnée de la maquette */

interface ItemMaquette {
  url: string;
  h1: string;
  ex: string;
  min: number;
  kind: string;
  theme: string;
  secs: { t: string }[];
}

/**
 * Les items de `window.__MGRES`, lus DANS le fichier autonome du colis.
 *
 * Son bundle de données est encodé en base64 et compressé dans le manifeste
 * `__bundler/manifest`. On le décompresse plutôt que de recopier ses valeurs
 * ici : une copie manuelle se périmerait au prochain colis sans rien dire.
 */
function itemsMaquette(): { articles: ItemMaquette[]; paused: ItemMaquette[] } | null {
  let brut: string;
  try {
    brut = readFileSync(MAQUETTE, "utf8");
  } catch {
    return null;
  }
  const lignes = brut.split("\n");
  const ligneManifeste = lignes.find((l) => l.startsWith('{"') && l.includes('"mime"'));
  if (!ligneManifeste) return null;
  const manifeste = JSON.parse(ligneManifeste) as Record<
    string,
    { mime: string; data: string; compressed?: boolean }
  >;
  for (const entree of Object.values(manifeste)) {
    if (!String(entree.mime).includes("javascript")) continue;
    const octets = Buffer.from(entree.data, "base64");
    let texte: string;
    try {
      texte = (entree.compressed ? gunzipSync(octets) : octets).toString("utf8");
    } catch {
      continue;
    }
    if (!texte.startsWith("window.__MGRES")) continue;
    const json = texte.slice(texte.indexOf("=") + 1).replace(/;\s*$/, "");
    return JSON.parse(json) as { articles: ItemMaquette[]; paused: ItemMaquette[] };
  }
  return null;
}

/** Le texte que la maquette soumet à ses motifs, pour un de ses items. */
const texteMaquette = (it: ItemMaquette) =>
  [it.h1, it.ex, ...it.secs.map((s) => s.t)].join(" ");

/* ------------------------------------------------ les fiches du dépôt */

interface FicheFeuille {
  url: string;
  titre_h1: string;
  rayon: string;
  minutes: number;
}

function fichesFeuilles(): FicheFeuille[] {
  const sorties: FicheFeuille[] = [];
  for (const nom of readdirSync(FICHES)) {
    if (!nom.startsWith("ressources") || !nom.endsWith(".json")) continue;
    const lu = JSON.parse(readFileSync(join(FICHES, nom), "utf8")) as {
      url: string;
      titre_h1: string;
      contenu?: { gabarit?: string; rayon?: string; minutes?: number };
    };
    if (lu.contenu?.gabarit !== "ressource") continue;
    sorties.push({
      url: lu.url,
      titre_h1: lu.titre_h1,
      rayon: lu.contenu.rayon ?? "",
      minutes: lu.contenu.minutes ?? 0,
    });
  }
  return sorties;
}

/** Le catalogue des cinq hubs de rayon, fusionné, avec `mots` et `minutes`. */
function catalogueDesRayons(): { href: string; mots: number; minutes: number }[] {
  const par = new Map<string, { href: string; mots: number; minutes: number }>();
  for (const nom of readdirSync(FICHES)) {
    if (!nom.startsWith("ressources") || !nom.endsWith(".json")) continue;
    const lu = JSON.parse(readFileSync(join(FICHES, nom), "utf8")) as {
      contenu?: { rubrique?: { catalogue?: { href: string; mots: number; minutes: number }[] } };
    };
    for (const e of lu.contenu?.rubrique?.catalogue ?? []) par.set(e.href, e);
  }
  return [...par.values()];
}

/* ----------------------------------------------------- les six règles */

/**
 * 1. La dérivation des étiquettes, confrontée à la maquette DEUX FOIS.
 *
 *   a. rejouée sur SA donnée, elle doit rendre 14 étiquettes non vides sur ses
 *      15 articles, le compte relevé sur son rendu à 1280 px ;
 *   b. appliquée à NOS fiches, elle doit rendre, pour chacun des 15 articles,
 *      exactement le jeu d'étiquettes qu'elle calcule chez elle.
 *
 * POURQUOI (b) ET PAS DEUX LIGNES CHOISIES À LA MAIN, comme une première
 * version de cette porte le faisait : des valeurs attendues écrites de mémoire
 * ne vérifient rien, elles se contentent de figer ce que le code fait le jour
 * où on les écrit. La maquette, elle, est une référence indépendante. C'est
 * (b) qui a trouvé le défaut des cinq chapôs parasités : sur
 * `gestion-des-dechets`, elle calcule « Coûts » et nous non, parce que notre
 * accroche était remplacée par « *7 min de lecture* ».
 */
function regleEtiquettes(
  taxonomie: readonly (readonly [string, RegExp])[],
  biblio: Bibliotheque,
) {
  const D = itemsMaquette();
  if (!D) {
    // Le colis peut ne pas être là (fichier de 7,4 Mo, parfois archivé) : on
    // le dit plutôt que de faire passer la règle en silence.
    echecs.push(
      "1. étiquettes : la maquette de référence est introuvable, la règle n'a pas pu être rejouée",
    );
    return;
  }
  const comptes = new Map<string, number>();
  const siennes = new Map<string, string>();
  for (const it of D.articles) {
    const tirees = etiquettesDe(texteMaquette(it), taxonomie);
    siennes.set(it.url, tirees.join(", "));
    for (const e of tirees) comptes.set(e, (comptes.get(e) ?? 0) + 1);
  }
  assert.equal(
    comptes.size,
    14,
    `la règle rend ${comptes.size} étiquettes non vides sur les 15 articles de la maquette, son menu en affiche 14`,
  );

  const notres = new Map(biblio.entreprises.cartes.map((c) => [c.url, c.etiquettes.join(", ")]));
  const ecarts: string[] = [];
  for (const [url, attendu] of siennes) {
    const obtenu = notres.get(url);
    if (obtenu !== attendu) {
      ecarts.push(`${url} : maquette « ${attendu} », dépôt « ${obtenu ?? "absente"} »`);
    }
  }
  assert.equal(
    ecarts.length,
    0,
    `${ecarts.length} article(s) n'ont pas les étiquettes que la maquette leur calcule : ${ecarts[0]}`,
  );
}

/** 2. La règle des minutes, confrontée aux minutes écrites et à l'autre portage. */
function regleMinutes(calcul: (mots: number | undefined) => number) {
  const catalogue = catalogueDesRayons();
  assert.equal(catalogue.length, 35, `le catalogue porte ${catalogue.length} entrées, pas 35`);
  const faux = catalogue.filter((e) => calcul(e.mots) !== e.minutes);
  assert.equal(
    faux.length,
    0,
    `${faux.length} ressources sur 35 n'ont pas la minute que leur nombre de mots donne, par exemple ${
      faux[0]?.href
    } (${faux[0]?.mots} mots, ${faux[0]?.minutes} min écrites, ${calcul(faux[0]?.mots)} min calculées)`,
  );
  const divergent = catalogue.filter((e) => calcul(e.mots) !== minutesMaquette(e.mots));
  assert.equal(
    divergent.length,
    0,
    `${divergent.length} ressources où la règle de la bibliothèque et celle de maquette-ressource.ts ne disent pas la même chose`,
  );
}

/** 3. Le thème ne couvre que les quinze articles, et rien d'autre. */
function regleThemes(table: ReadonlyMap<string, string>, biblio: Bibliotheque) {
  const articles = fichesFeuilles()
    .filter((f) => f.rayon === "articles")
    .map((f) => f.url)
    .sort();
  const classes = [...table.keys()].sort();
  assert.deepEqual(
    classes,
    articles,
    `la table des thèmes et les articles du dépôt ne coïncident pas : en trop ${classes
      .filter((u) => !articles.includes(u))
      .join(", ")} ; manquants ${articles.filter((u) => !classes.includes(u)).join(", ")}`,
  );
  const hors = [...table.values()].filter((t) => !THEMES.includes(t));
  assert.equal(hors.length, 0, `thème hors des quatre de la maquette : ${hors.join(", ")}`);

  const avecTheme = biblio.entreprises.cartes.filter((c) => c.theme);
  assert.equal(
    avecTheme.length,
    15,
    `${avecTheme.length} ressources portent un thème, la maquette n'en classe que 15`,
  );
  const nonArticleAvecTheme = biblio.entreprises.cartes.filter(
    (c) => c.theme && c.format !== "Article",
  );
  assert.equal(
    nonArticleAvecTheme.length,
    0,
    `une fiche qui n'est pas un article s'est vu attribuer un thème : ${nonArticleAvecTheme
      .map((c) => c.url)
      .join(", ")}`,
  );
}

/** 4. Les 48 URL sont dans la bibliothèque, et dans le HTML qu'elle rend. */
function regleUrl(biblio: Bibliotheque, rendu: string) {
  const ressources = biblio.entreprises.cartes.map((c) => c.url);
  const carriere = biblio.techniciens.cartes.map((c) => c.url);
  assert.equal(
    ressources.length,
    35,
    `l'espace Entreprises porte ${ressources.length} ressources, le dépôt en publie 35`,
  );
  assert.equal(
    carriere.length,
    13,
    `l'espace Techniciens porte ${carriere.length} fiches, le dépôt en publie 13`,
  );
  const attendues = fichesFeuilles().map((f) => f.url).sort();
  assert.deepEqual(
    [...ressources].sort(),
    attendues,
    "les ressources de la bibliothèque ne sont pas celles du dépôt",
  );
  /*
    LE SLASH FINAL EST RETIRÉ AVANT DE COMPARER, et c'est un artefact du banc
    d'essai, pas une tolérance. `next.config.ts` porte `trailingSlash: true`,
    et la page RÉELLEMENT servie écrit bien `href="/ressources/articles/gmao/"`
    (vérifié en dev le 13/10). Mais `renderToStaticMarkup` lancé par `bun`
    n'a pas la configuration de Next : son `next/link` rend l'URL sans slash
    final. Comparer la forme stricte ici aurait fait échouer la porte sur un
    détail du harnais, et pousser à l'aveugler. On normalise les deux côtés.
  */
  const sansSlash = (u: string) => u.replace(/\/$/, "");
  const servies = new Set(
    [...rendu.matchAll(/href="([^"]*)"/g)].map((m) => sansSlash(m[1])),
  );
  const absentes = [...ressources, ...carriere].filter((u) => !servies.has(sansSlash(u)));
  assert.equal(
    absentes.length,
    0,
    `${absentes.length} URL ne sont pas dans le HTML rendu : ${absentes.slice(0, 4).join(", ")}`,
  );
  // Les formats : 7 fiches métier, 1 alternance, 5 guides carrière.
  const compte = (f: string) => carriere.length && biblio.techniciens.cartes.filter((c) => c.format === f).length;
  assert.equal(compte("Fiche métier"), 7, "le compte des fiches métier a changé");
  assert.equal(compte("Alternance"), 1, "le compte des pages d'alternance a changé");
  assert.equal(compte("Guide carrière"), 5, "le compte des guides carrière a changé");
}

/**
 * 5. Le hub ne perd pas un mot en gagnant sa bibliothèque.
 *
 * LA COMPARAISON EST EXACTE, pas approchée : le rendu AVEC bibliothèque, une
 * fois la section `#bibliotheque` retirée, doit être OCTET POUR OCTET celui du
 * rendu SANS. C'est la seule formulation qui prouve que la greffe est une
 * addition et rien d'autre, ni un déplacement, ni une reformulation.
 *
 * UNE PREMIÈRE VERSION comparait des fenêtres de huit mots sur le texte
 * aplati, et elle échouait sur « temps en atelier. Sur cette page » : une
 * fenêtre qui enjambe le point d'insertion est coupée par construction, même
 * quand rien n'est perdu. Elle produisait donc un faux défaut, et un faux
 * défaut pousse à desserrer la règle. L'égalité stricte n'a pas ce travers.
 */
const RE_SECTION_BIBLIO = /<section id="bibliotheque"[\s\S]*?<\/section>/;

function regleAucunMotPerdu(sans: string, avec: string) {
  assert.match(
    avec,
    RE_SECTION_BIBLIO,
    "la bibliothèque n'est pas dans le rendu du hub, la greffe n'a pas pris",
  );
  assert.ok(
    avec.length > sans.length,
    `le rendu avec bibliothèque (${avec.length} octets) n'est pas plus riche que sans (${sans.length})`,
  );
  const ampute = avec.replace(RE_SECTION_BIBLIO, "");
  if (ampute !== sans) {
    let k = 0;
    while (k < ampute.length && ampute[k] === sans[k]) k += 1;
    assert.fail(
      `le hub a changé ailleurs que dans la bibliothèque, à « ${sans.slice(Math.max(0, k - 60), k + 60)} » devenu « ${ampute.slice(Math.max(0, k - 60), k + 60)} »`,
    );
  }
}

/** 6. La copie rendue respecte le contrat éditorial. */
const PROSCRITS: readonly [RegExp, string][] = [
  [/\bint[ée]rim\b/iu, "intérim"],
  [/\bnotamment\b/iu, "notamment"],
  [/\bsur mesure\b/iu, "sur mesure"],
  [/\bcl[ée] en main\b/iu, "clé en main"],
  [/\br[ée]gie\b/iu, "régie"],
  [/\blevier\b/iu, "levier"],
  [/\bmise [àa] disposition\b/iu, "mise à disposition"],
  [/\bsans engagement\b/iu, "sans engagement"],
  [/\bconcr[èe]tement\b/iu, "concrètement"],
  [/\bincontournable\b/iu, "incontournable"],
  [/\bd[ée]couvrez\b/iu, "découvrez"],
  [/—/u, "tiret cadratin"],
  [/\d[\d\s.,]*\s*(?:€|euros?)/iu, "un montant"],
  [/\bsous\s+\d+\s*(?:h|heures?|jours?)\b/iu, "un délai chiffré"],
];

function regleCopie(rendu: string) {
  const texte = rendu
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
  for (const [motif, nom] of PROSCRITS) {
    const trouve = texte.match(motif);
    assert.equal(trouve, null, `« ${nom} » apparaît dans la copie rendue : « ${trouve?.[0]} »`);
  }
}

/**
 * 7. AUCUNE SYNTAXE DU CORPUS À L'ÉCRAN.
 *
 * POURQUOI CETTE RÈGLE EXISTE, et c'est elle qui a trouvé le défaut : 18 des
 * 48 accroches portent `**gras**` ou `[libellé](/chemin/)`. Rendues telles
 * quelles, les cartes affichaient
 * « [Ressources : Fiches techniques](/ressources/fiches-techniques/) » en
 * clair, c'est-à-dire la faute du 09/10 reproduite sur dix-sept cartes.
 * `verification-markdown-brut.tsx` tient la même règle pour six autres
 * composants ; celle-ci la tient pour la bibliothèque.
 */
const RE_MARKDOWN_VISIBLE = /\*\*|\[[^\]]{2,}\]\([^)]*\)/;

function regleMarkdown(rendu: string) {
  const texte = rendu.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const trouve = texte.match(RE_MARKDOWN_VISIBLE);
  assert.equal(
    trouve,
    null,
    `la syntaxe du corpus est rendue en clair : « ${trouve?.[0]} »`,
  );
  // Et un `<a>` dans un `<a>` : la carte est déjà un lien.
  assert.equal(
    /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/.test(rendu),
    false,
    "un lien est imbriqué dans un autre : balisage invalide",
  );
}

/* ------------------------------------------------------------ le rendu */

/** Un hub minimal, qui n'emprunte rien à la fiche réelle que son format. */
const VUE_HUB: VueGuide = {
  format: "Ressources",
  lecture: "6 min de lecture",
  ariane: [{ label: "Accueil", href: "/" }, { label: "Guide maintenance industrielle" }],
  chapeau: "Un guide maintenance industrielle ne vaut que s'il fait gagner du temps en atelier.",
  intro: [{ type: "p", texte: "Pas de théorie hors sol." }],
  sections: [{ titre: "Cinq rayons, un objectif : agir", blocs: [{ type: "p", texte: "Le savoir utile change selon le moment." }] }],
  liees: [],
  formulaire: "cocon-ressources",
};

function renduHub(biblio: Bibliotheque | null): string {
  return renderToStaticMarkup(
    <Guide
      titre="Guide maintenance industrielle"
      vue={VUE_HUB}
      bibliotheque={biblio ? <BibliothequeRessources bibliotheque={biblio} /> : undefined}
    />,
  );
}

/* --------------------------------------------------------- la campagne */

const biblio = bibliotheque();
const sansBiblio = renduHub(null);
const avecBiblio = renduHub(biblio);

exige("1. étiquettes fidèles à la maquette", () => regleEtiquettes(TAXONOMIE_ENTREPRISES, biblio));
exige("2. règle des minutes", () => regleMinutes(minutesDeLecture));
exige("3. thèmes bornés aux quinze articles", () => regleThemes(THEME_PAR_ARTICLE, biblio));
exige("4. les 48 URL sont servies", () => regleUrl(biblio, avecBiblio));
exige("5. aucun mot perdu", () => regleAucunMotPerdu(sansBiblio, avecBiblio));
exige("6. copie conforme au contrat", () => regleCopie(avecBiblio));
exige("7. aucune syntaxe du corpus à l’écran", () => regleMarkdown(avecBiblio));

/* ----------------------------------------------------------- les témoins */

/**
 * HUIT TÉMOINS. Sept rendent fausse une donnée ou une règle juste et exigent
 * que la règle visée tombe ; le huitième exige que la donnée RÉELLE passe,
 * sans quoi une porte qui refuse tout aurait l'air de fonctionner.
 */
function temoins() {
  const tombe = (nom: string, fn: () => void) => {
    let message: string | null = null;
    try {
      fn();
      message = null;
    } catch (e) {
      message = (e as Error).message;
    }
    if (message === null) {
      console.error(`  TÉMOIN MUET  ${nom} : la règle n'a pas échoué sur une donnée fautive`);
      return false;
    }
    console.log(`  témoin  ${nom}\n            → ${message.split("\n")[0].slice(0, 150)}`);
    return true;
  };
  const passe = (nom: string, fn: () => void) => {
    try {
      fn();
      console.log(`  témoin  ${nom} : la donnée réelle passe`);
      return true;
    } catch (e) {
      console.error(`  TÉMOIN FAUX  ${nom} : ${(e as Error).message.split("\n")[0]}`);
      return false;
    }
  };

  const resultats = [
    // 1. Un motif abîmé, comme une faute de frappe à la transcription.
    tombe("un motif d'étiquette altéré", () =>
      regleEtiquettes(
        TAXONOMIE_ENTREPRISES.map(([l, m]) =>
          l === "Prédictive" ? ([l, /predictif/] as const) : ([l, m] as const),
        ),
        biblio,
      ),
    ),
    // 1 bis. Une étiquette retirée : le compte doit tomber à 13.
    tombe("une étiquette retirée de la table", () =>
      regleEtiquettes(TAXONOMIE_ENTREPRISES.filter(([l]) => l !== "GMAO"), biblio),
    ),
    // 2. Une autre vitesse de lecture.
    tombe("200 mots par minute au lieu de 220", () =>
      regleMinutes((mots) => Math.max(2, Math.round((mots ?? 600) / 200))),
    ),
    // 2 bis. Un arrondi supérieur au lieu de l'arrondi au plus proche.
    tombe("un arrondi supérieur", () =>
      regleMinutes((mots) => Math.max(2, Math.ceil((mots ?? 600) / 220))),
    ),
    // 3. Un article qui perd son thème.
    tombe("un article retiré de la table des thèmes", () => {
      const amputee = new Map(THEME_PAR_ARTICLE);
      amputee.delete("/ressources/articles/gmao/");
      regleThemes(amputee, biblio);
    }),
    // 3 bis. Un thème inventé pour une fiche qui n'en a pas.
    tombe("un thème posé d'office sur une fiche pratique", () => {
      const force: Bibliotheque = {
        ...biblio,
        entreprises: {
          ...biblio.entreprises,
          cartes: biblio.entreprises.cartes.map((c) =>
            c.format === "Fiche pratique" ? { ...c, theme: "Organisation" } : c,
          ),
        },
      };
      regleThemes(THEME_PAR_ARTICLE, force);
    }),
    // 4. Le sommaire complet retiré du rendu : les 13 URL de carrière sortent
    // du HTML, exactement le défaut que ce bloc existe pour empêcher.
    tombe("le sommaire complet retiré du rendu", () =>
      regleUrl(biblio, avecBiblio.replace(/<nav[^>]*aria-labelledby="sommaire[\s\S]*?<\/nav>/, "")),
    ),
    // 5. Un passage du hub effacé.
    tombe("un paragraphe du hub effacé", () =>
      regleAucunMotPerdu(sansBiblio, avecBiblio.replace("Pas de théorie hors sol.", "")),
    ),
    // 6. Un montant glissé dans la copie.
    tombe("un montant dans la copie", () => regleCopie(`${avecBiblio}<p>850 € par mois</p>`)),
    // 7. Une accroche rendue avec sa syntaxe, le défaut du 09/10.
    tombe("la syntaxe du corpus rendue en clair", () =>
      regleMarkdown(
        `${avecBiblio}<p>Cette fiche de nos [Ressources : Fiches techniques](/ressources/fiches-techniques/)</p>`,
      ),
    ),
    // 7 bis. Un lien dans un lien, ce que `TexteRiche` aurait produit ici.
    tombe("un lien imbriqué dans la carte", () =>
      regleMarkdown(avecBiblio.replace(/<a /, '<a data-faute="1"><a ')),
    ),
    // Le témoin positif.
    passe("la donnée réelle", () => {
      regleEtiquettes(TAXONOMIE_ENTREPRISES, biblio);
      regleMinutes(minutesDeLecture);
      regleThemes(THEME_PAR_ARTICLE, biblio);
      regleUrl(biblio, avecBiblio);
      regleAucunMotPerdu(sansBiblio, avecBiblio);
      regleCopie(avecBiblio);
      regleMarkdown(avecBiblio);
    }),
  ];
  return resultats.every(Boolean);
}

/* ------------------------------------------------------------- rapport */

const controle = process.argv.includes("--controle");

console.log(
  `Ressources v2 : ${biblio.entreprises.cartes.length} ressources, ${biblio.techniciens.cartes.length} fiches carrière, ` +
    `${new Set(biblio.entreprises.cartes.flatMap((c) => c.etiquettes)).size} étiquettes, ` +
    `${biblio.entreprises.cartes.filter((c) => c.theme).length} thèmes attribués`,
);

if (controle) {
  console.log("\nTémoins :");
  if (!temoins()) {
    console.error("\nUn témoin au moins n'a pas fait son office : la porte ne prouve plus rien.");
    process.exit(1);
  }
  console.log("\nTous les témoins ont joué leur rôle.");
}

if (echecs.length > 0) {
  console.error(`\n${echecs.length} règle(s) en échec :`);
  for (const e of echecs) console.error(`  · ${e}`);
  process.exit(1);
}

console.log(
  controle ? "\nPorte conforme, et elle sait échouer." : "Porte conforme.",
);
