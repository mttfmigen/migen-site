import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { CHAPO_PARASITE } from "@/components/site/ressource/chapo";

import {
  etiquettesDe,
  minutesDeLecture,
  TAXONOMIE_ENTREPRISES,
  TAXONOMIE_TECHNICIENS,
  THEME_PAR_ARTICLE,
} from "./taxonomie";

/**
 * LA BIBLIOTHÈQUE DE « Ressources v2 », construite depuis le dépôt et rien
 * d'autre.
 *
 * CE MODULE NE RÉDIGE RIEN ET NE CHOISIT RIEN. Il assemble, pour chacune des
 * 48 pages que la maquette range dans ses deux espaces, les champs que le
 * menu latéral lit : format, thème, minutes, étiquettes, photo, extrait. Tous
 * viennent de fichiers déjà au dépôt, et les deux seules dérivations
 * (étiquettes, minutes des pages `/carriere/`) portent leur règle dans
 * `taxonomie.ts`.
 *
 * TROIS SOURCES, toutes en lecture seule :
 *
 *   · `supabase/import/gabarits-maquette/ressources-*.json` : les 35 fiches
 *     feuilles (titre, chapô, parties, minutes) et, dans les cinq hubs de
 *     rayon, le `catalogue` de 35 entrées qui porte déjà `mots`, `minutes` et
 *     la PHOTO DE CARTE de chaque ressource. Cette photo est reprise telle
 *     quelle : les pages de rayon l'affichent déjà (`RayonsRubrique`), et en
 *     choisir une autre ici aurait donné deux vignettes pour la même page.
 *   · `supabase/import/gabarits-maquette/carriere-*.json` : les 13 fiches
 *     métier et guides carrière (titre, chapeau, photo, titres de sections).
 *   · `maquette/contenu/site/index.json` : l'index des 248 URL du client, pour
 *     le champ `mots` des pages `/carriere/`, qui n'ont pas de minutes.
 *
 * SI UNE SOURCE MANQUE, la bibliothèque sort VIDE et le hub ne s'affiche pas :
 * mieux vaut une page sans bibliothèque qu'une bibliothèque qui invente. Le
 * même choix que `lib/contenu.ts` fait pour le relais de contenu.
 *
 * MODULE SERVEUR, ET SON GARDE-FOU N'EST PAS `server-only` : POURQUOI.
 *
 * La convention du projet (CLAUDE.md principe 4) est `import "server-only"`.
 * Elle ne tient pas ici, et pas par facilité : ce module est atteint depuis
 * `PageEditoriale`, que `verification-editorial.tsx` MONTE en ligne de
 * commande avec `renderToStaticMarkup`. Or `server-only` lève à la seule
 * résolution du module hors d'un rendu serveur Next, et `renderToStaticMarkup`
 * est SYNCHRONE : la ruse de `components/cocon/FilAriane.tsx`, qui déplace
 * l'import dans un `await import()` à l'intérieur de la branche concernée, ne
 * s'applique pas, elle rendrait le composant asynchrone et c'est précisément
 * ce que ce rendu ne sait pas faire. Garder `server-only` aurait donc cassé
 * une porte existante pour protéger un module que rien n'expose.
 *
 * DEUX GARDE-FOUS LE REMPLACENT, et ils sont vérifiables :
 *   1. le test ci-dessous, qui refuse bruyamment d'être exécuté dans un
 *      navigateur, et dont `verification-hub.tsx` porte le témoin ;
 *   2. `node:fs`, qu'aucun paquet client ne peut embarquer : Next échoue le
 *      build dès qu'un composant client atteint ce module, directement ou non.
 * La protection réelle est donc inchangée ; seul le message a changé de forme.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "components/site/ressources-hub/catalogue.ts lit le disque : module serveur, jamais le navigateur.",
  );
}

/** Une carte de la bibliothèque. Tout y est lu ou dérivé, rien n'y est saisi. */
export interface CarteBibliotheque {
  /** L'URL de la VRAIE page. La carte est un lien, jamais un panneau. */
  url: string;
  titre: string;
  /** La première phrase du chapô, deux lignes sous le titre de la carte. */
  extrait: string;
  /** La pastille : « Article », « Fiche pratique », « Fiche métier »… */
  format: string;
  /** Le thème de la maquette. Absent pour les 20 fiches non classées. */
  theme?: string;
  minutes: number;
  /** Sert au tri « Plus courts » et « Plus longs », comme `min` chez elle. */
  mots: number;
  image: string;
  etiquettes: string[];
  /** Le texte que la recherche examine, composé comme chez la maquette. */
  recherche: string;
}

/** Un espace du menu latéral, avec ses catégories et ses cartes. */
export interface EspaceBibliotheque {
  id: "entreprises" | "techniciens";
  libelle: string;
  /** `KINDS` de la maquette, « Tout » compris. */
  categories: readonly { cle: string; libelle: string }[];
  cartes: CarteBibliotheque[];
}

export interface Bibliotheque {
  entreprises: EspaceBibliotheque;
  techniciens: EspaceBibliotheque;
}

/* ------------------------------------------------------- lecture du disque */

const DOSSIER_FICHES = () =>
  join(process.cwd(), "supabase", "import", "gabarits-maquette");
const INDEX_MAQUETTE = () =>
  join(process.cwd(), "maquette", "contenu", "site", "index.json");

interface FicheLue {
  url?: string;
  titre_h1?: string;
  contenu?: {
    gabarit?: string;
    rayon?: string;
    chapo?: string[];
    minutes?: number;
    parties?: { titre?: string }[];
    questions?: unknown[];
    heros?: { chapeau?: string; photo?: { src?: string } };
    sections?: { titre?: string }[];
    rubrique?: { catalogue?: EntreeCatalogue[] };
  };
}

interface EntreeCatalogue {
  href: string;
  titre: string;
  recherche: string;
  format: string;
  minutes: number;
  mots: number;
  image: string;
}

function fichesLues(): FicheLue[] {
  let noms: string[];
  try {
    noms = readdirSync(DOSSIER_FICHES());
  } catch {
    return [];
  }
  const lues: FicheLue[] = [];
  for (const nom of noms) {
    if (!nom.endsWith(".json")) continue;
    try {
      lues.push(JSON.parse(readFileSync(join(DOSSIER_FICHES(), nom), "utf8")) as FicheLue);
    } catch {
      // Une fiche illisible est écartée, pas devinée.
    }
  }
  return lues;
}

/** Le champ `mots` de l'index, par URL. Vide si l'index n'est pas là. */
function motsParUrl(): ReadonlyMap<string, number> {
  try {
    const lu = JSON.parse(readFileSync(INDEX_MAQUETTE(), "utf8")) as {
      url?: string;
      mots?: number;
    }[];
    return new Map(
      lu
        .filter((e): e is { url: string; mots: number } =>
          typeof e?.url === "string" && typeof e?.mots === "number",
        )
        .map((e) => [e.url, e.mots]),
    );
  } catch {
    return new Map();
  }
}

/* -------------------------------------------------------- espace Entreprises */

/**
 * `KINDS` de la maquette pour l'espace Entreprises, et la correspondance avec
 * nos cinq rayons. Les libellés sont ceux de sa table, pas une reformulation.
 */
const RAYONS: readonly { rayon: string; format: string; libelle: string }[] = [
  { rayon: "articles", format: "Article", libelle: "Articles" },
  { rayon: "fiches-pratiques", format: "Fiche pratique", libelle: "Fiches pratiques" },
  { rayon: "fiches-techniques", format: "Fiche technique", libelle: "Fiches techniques" },
  { rayon: "livres-blancs", format: "Livre blanc", libelle: "Livres blancs" },
  { rayon: "process", format: "Process", libelle: "Process" },
] as const;

/**
 * LA PREMIÈRE PHRASE DU CHAPÔ, en sautant un défaut connu de la maquette.
 *
 * CINQ FICHES SUR 35 ont pour premier paragraphe de chapô la chaîne
 * `*10 min de lecture*` au lieu de leur accroche : `gestion-des-dechets`,
 * `organiser-service-maintenance`, `niveaux-de-maintenance` et les deux livres
 * blancs. Ce n'est pas une erreur de portage, c'est un défaut de la maquette
 * elle-même, déjà relevé dans l'en-tête de
 * `components/site/ressource/maquette-ressource.ts` : « « *10 min de lecture* »
 * des livres blancs », copié mot pour mot et signalé.
 *
 * CE QU'IL COÛTAIT ICI, mesuré le 13/10 : cinq cartes auraient affiché
 * « *7 min de lecture* » en guise de résumé, astérisques comprises, et la
 * dérivation des étiquettes y aurait perdu les mots de la vraie accroche. Sur
 * `gestion-des-dechets`, l'étiquette « Coûts » disparaissait, alors que la
 * maquette la calcule : la comparaison avec SA donnée l'a montrée absente.
 *
 * ON NE RÉÉCRIT RIEN : la donnée reste ce qu'elle est, on lit simplement le
 * paragraphe suivant, et `verification-hub.tsx` exige que les 15 articles
 * rendent exactement les étiquettes que la maquette leur calcule. Le jour où
 * les fiches sont corrigées, ce saut ne trouvera plus rien à sauter.
 */

/**
 * LE TEXTE NU : les mots du corpus, sans sa syntaxe.
 *
 * POURQUOI LA CARTE NE PEUT PAS RENDRE LE TEXTE RICHE. Le corpus écrit son
 * texte « en ligne » avec `**gras**` et `[libellé](/chemin/)`, et 18 des 48
 * accroches en portent : 17 des 35 ressources et le chapeau de
 * `/carriere/automaticien/salaire/`. Les rendre telles quelles afficherait
 * « [Ressources : Fiches techniques](/ressources/fiches-techniques/) » en clair
 * sur la carte, mot pour mot le défaut du 09/10, « du code affiché comme texte
 * sur 3 pages ». Et les passer à `TexteRiche` poserait un `<a>` DANS le `<a>`
 * de la carte : balisage invalide, que `verification-markdown-brut.tsx` refuse
 * à juste titre.
 *
 * LA CARTE EST UNE AMORCE, pas le texte : elle garde les mots et laisse
 * tomber le lien, qui mène de toute façon à la page que la carte ouvre déjà.
 * Aucun mot n'est perdu, seule la syntaxe l'est.
 *
 * ET CELA CHANGE AUSSI LA DÉRIVATION DES ÉTIQUETTES, dans le bon sens : sans
 * ce nettoyage, les motifs voyaient les CHEMINS des liens. Un `/offres/
 * zero-arret/` dans une accroche aurait accroché « Arrêt de production » sur
 * une fiche qui ne parle pas d'arrêt. La maquette n'a pas ce souci, son champ
 * `ex` est déjà du texte nu, et c'est sur elle que la porte nous compare.
 */
function texteNu(texte: string): string {
  return texte
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

function accroche(chapo: string[] | undefined): string {
  return texteNu((chapo ?? []).find((p) => !CHAPO_PARASITE.test(p.trim())) ?? "");
}

/**
 * Le texte que la maquette soumet à ses motifs d'étiquetage : `h1`, puis `ex`,
 * puis les titres de toutes les sections.
 *
 * RIEN N'Y EST AJOUTÉ. La maquette compte sa FAQ parmi les sections, sous un
 * titre qui varie d'une fiche à l'autre (« Questions fréquentes (FAQ) » ici,
 * « Questions fréquentes » là) ; nos fiches portent la FAQ à part, dans
 * `questions`. Fabriquer ce titre pour s'aligner aurait été écrire une chaîne
 * qui n'est dans aucune des deux sources, et aucun motif de la taxonomie ne
 * s'y accroche de toute façon.
 */
function texteEtiquetableRessource(fiche: FicheLue): string {
  const c = fiche.contenu ?? {};
  const titres = (c.parties ?? []).map((p) => texteNu(p.titre ?? ""));
  return [fiche.titre_h1 ?? "", accroche(c.chapo), ...titres].join(" ");
}

function espaceEntreprises(fiches: FicheLue[]): EspaceBibliotheque {
  // Le catalogue est écrit à l'identique dans les cinq hubs de rayon : on
  // fusionne par URL, et `verification-hub.tsx` exige qu'ils concordent.
  const catalogue = new Map<string, EntreeCatalogue>();
  for (const f of fiches) {
    for (const e of f.contenu?.rubrique?.catalogue ?? []) {
      if (e?.href) catalogue.set(e.href, e);
    }
  }

  const feuilles = fiches.filter(
    (f) => f.contenu?.gabarit === "ressource" && typeof f.url === "string",
  );

  const cartes: CarteBibliotheque[] = [];
  for (const f of feuilles) {
    const url = f.url as string;
    const entree = catalogue.get(url);
    const rayon = RAYONS.find((r) => r.rayon === f.contenu?.rayon);
    // Sans format connu la carte ne sait pas dans quelle catégorie tomber :
    // elle est écartée plutôt que rangée au hasard.
    if (!rayon) continue;
    const titre = f.titre_h1 ?? entree?.titre ?? "";
    const extrait = accroche(f.contenu?.chapo);
    const theme = THEME_PAR_ARTICLE.get(url);
    const etiquettes = etiquettesDe(
      texteEtiquetableRessource(f),
      TAXONOMIE_ENTREPRISES,
    );
    cartes.push({
      url,
      titre,
      extrait,
      format: rayon.format,
      theme,
      // La minute est ÉCRITE dans la fiche : elle est lue, pas recalculée.
      minutes: f.contenu?.minutes ?? entree?.minutes ?? minutesDeLecture(entree?.mots),
      mots: entree?.mots ?? 0,
      // Sans photo de carte au dépôt, la carte reste sans photo : pas de
      // vignette prise ailleurs pour boucher le trou.
      image: entree?.image ?? "",
      etiquettes,
      recherche: [titre, extrait, theme ?? "", rayon.format, ...etiquettes].join(" "),
    });
  }

  // L'ordre de « Pertinence » est celui du catalogue des hubs de rayon, les
  // plus longues d'abord : la même règle que `RayonsRubrique` applique déjà.
  const rang = [...catalogue.keys()];
  cartes.sort((a, b) => {
    const ia = rang.indexOf(a.url);
    const ib = rang.indexOf(b.url);
    if (ia !== ib) return (ia < 0 ? rang.length : ia) - (ib < 0 ? rang.length : ib);
    return a.url.localeCompare(b.url);
  });

  return {
    id: "entreprises",
    libelle: "Entreprises",
    categories: [
      { cle: "all", libelle: "Tout" },
      ...RAYONS.map((r) => ({ cle: r.format, libelle: r.libelle })),
    ],
    cartes,
  };
}

/* ------------------------------------------------------- espace Techniciens */

/**
 * `KINDS` de la maquette pour l'espace Techniciens. Le format d'une page
 * `/carriere/` se DÉDUIT DE SON URL, et cette déduction est vérifiable : la
 * maquette range ses treize pages en sept `Fiche métier` (un seul segment sous
 * `/carriere/`, hors alternance), une `Alternance` (`/carriere/alternance/`) et
 * cinq `Guide carrière` (deux segments). Les treize pages du dépôt tombent
 * exactement dans ces trois cases, vérifié le 13/10, et `verification-hub.tsx`
 * tient le compte 7 / 1 / 5.
 *
 * POURQUOI NE PAS LIRE LA PASTILLE DE LA FICHE : elle dit « Métier » pour les
 * treize, y compris pour « Salaire automaticien ». Elle ne distingue donc pas
 * les trois catégories du menu, et l'URL, elle, les distingue sans ambiguïté.
 */
const FORMATS_CARRIERE: readonly { cle: string; libelle: string }[] = [
  { cle: "Fiche métier", libelle: "Fiches métiers" },
  { cle: "Guide carrière", libelle: "Guides carrière" },
  { cle: "Alternance", libelle: "Alternance" },
] as const;

function formatCarriere(url: string): string | undefined {
  const segments = url.split("/").filter(Boolean);
  if (segments[0] !== "carriere" || segments.length < 2) return undefined;
  if (segments.length > 2) return "Guide carrière";
  return segments[1] === "alternance" ? "Alternance" : "Fiche métier";
}

function espaceTechniciens(
  fiches: FicheLue[],
  mots: ReadonlyMap<string, number>,
): EspaceBibliotheque {
  const cartes: CarteBibliotheque[] = [];
  for (const f of fiches) {
    const url = f.url;
    if (typeof url !== "string" || !url.startsWith("/carriere/")) continue;
    const format = formatCarriere(url);
    if (!format) continue;
    const c = f.contenu ?? {};
    const titre = f.titre_h1 ?? "";
    const extrait = texteNu(c.heros?.chapeau ?? "");
    const titres = (c.sections ?? []).map((s) => texteNu(s.titre ?? "")).filter(Boolean);
    const etiquettes = etiquettesDe(
      [titre, extrait, ...titres].join(" "),
      TAXONOMIE_TECHNICIENS,
    );
    const m = mots.get(url);
    cartes.push({
      url,
      titre,
      extrait,
      format,
      // Aucun thème : la maquette écrit ici le libellé du format ou le sujet du
      // guide, et son menu Techniciens n'a PAS de section Thèmes (`hasThemes`
      // vaut `isEnt`). Il n'y a donc rien à porter.
      minutes: minutesDeLecture(m),
      mots: m ?? 0,
      image: c.heros?.photo?.src ?? "",
      etiquettes,
      recherche: [titre, extrait, format, ...etiquettes].join(" "),
    });
  }
  // « Pertinence » : les plus longues d'abord, puis l'URL, pour que l'ordre ne
  // dépende pas de celui que le système de fichiers rend.
  cartes.sort((a, b) => b.mots - a.mots || a.url.localeCompare(b.url));

  return {
    id: "techniciens",
    libelle: "Techniciens",
    categories: [{ cle: "all", libelle: "Tout" }, ...FORMATS_CARRIERE],
    cartes,
  };
}

/* ------------------------------------------------------------------ assemblage */

/**
 * La bibliothèque complète, lue sur le disque à chaque appel du build.
 *
 * Pas de mémoïsation de module : un composant serveur l'appelle une fois par
 * page, et la page concernée est unique (`/ressources/`). Un cache ici
 * n'économiserait rien et survivrait à une modification de fiche en dev.
 */
export function bibliotheque(): Bibliotheque {
  const fiches = fichesLues();
  return {
    entreprises: espaceEntreprises(fiches),
    techniciens: espaceTechniciens(fiches, motsParUrl()),
  };
}
