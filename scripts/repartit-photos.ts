/**
 * RÉPARTITION DES 109 PHOTOS SOUS LICENCE SUR LES PAGES DU SITE.
 *
 *   bun scripts/repartit-photos.ts              (plan, n'écrit rien)
 *   bun scripts/repartit-photos.ts --applique   (écrit les fiches)
 *   bun scripts/repartit-photos.ts --detail     (+ la série de chaque page)
 *
 * ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
 * =====================================================================
 * LE RENDU DE LA MAQUETTE FAIT FOI (CLAUDE.md §1), et cet outil s'en écarte
 * SCIEMMENT sur un point : QUELLE photo occupe chaque emplacement. Le reste ne
 * bouge pas, et c'est l'essentiel : le nombre d'emplacements, leur place, leur
 * cadre, leur dessin, leur texte alternatif restent ceux de la capture. On ne
 * pose ni ne retire aucune image, on change seulement le fichier servi.
 *
 * POURQUOI. Mesuré le 09/10 par `node scripts/mesure-photos-site.mjs` :
 * 1 822 emplacements de photo pour 68 photos distinctes ; `team-duo.jpg` servie
 * 133 fois, `team-grind-front.jpg` 132 fois, `ph-hero-raffinerie.jpg` 125 fois ;
 * 130 pages affichent DEUX FOIS la même photo, six en affichent six fois. Et
 * les 109 photos achetées sous licence le 08/10 n'étaient servies par AUCUNE
 * page. La maquette a été dessinée avec une poignée d'images de calage : s'y
 * tenir, c'est servir en production le défaut le plus visible du site.
 *
 * LES TROIS RÈGLES DURES, vérifiées par le script avant d'écrire :
 *  1. JAMAIS DEUX FOIS LA MÊME PHOTO DANS UNE PAGE.
 *  2. DEUX PAGES SŒURS N'ONT PAS LA MÊME SÉRIE : à dossier parent égal, leur
 *     PHOTO D'IDENTITÉ diffère (la première image dont le sujet est la page
 *     elle-même : son héros, son bandeau de hub, la photo de son problème),
 *     donc leur série aussi. Les deux sont vérifiées avant d'écrire.
 *  3. LE THÈME DE LA PHOTO COLLE AU SUJET DE LA PAGE. C'est la page entière qui
 *     doit se tenir : une page d'hydraulique montre de l'hydraulique, cartes
 *     comprises, et c'est aussi la règle de la maquette elle-même
 *     (`photosPreuves(url)` et `imageMaquette(url)`, relevées dans
 *     `MigenExpertise.dc.html` et recopiées dans `verification-ville.tsx`,
 *     choisissent la photo d'une carte sur l'URL de la PAGE QUI L'AFFICHE).
 *     Les thèmes se lisent par paliers : la page, puis ce que l'emplacement
 *     DÉSIGNE (une carte vers `/secteurs/nucleaire/` prend alors une photo de
 *     centrale), puis les thèmes génériques, puis tout le vivier. On s'arrête
 *     au premier palier qui peut servir la page entière.
 *
 * DÉTERMINISTE : aucun `Math.random`, aucune date, aucune lecture d'horloge.
 * Les fiches sont lues dans l'ordre alphabétique de leur nom de fichier, les
 * emplacements dans l'ordre du document, et les égalités sont tranchées par une
 * empreinte FNV-1a de « sujet|photo ». Deux exécutions donnent le même résultat,
 * et `--applique` deux fois de suite ne change rien la seconde fois.
 *
 * CE QUI N'EST PAS TOUCHÉ, et pourquoi :
 *  - les LOGOS clients (`/assets/clients/`, clés `logo`/`logoInverse`) : un logo
 *    n'est pas une photo, il est servi autant de fois que le client est cité ;
 *  - les 12 PHOTOS DE VILLE (`/assets/villes/`) : elles montrent LA ville de la
 *    page, aucune photo de banque ne peut les remplacer ;
 *  - les pages de gabarit `secteur` (12) et `ressource` (35) : leurs portes
 *    `components/site/secteur/verification-secteur.tsx` et
 *    `components/site/ressource/verification-ressource.tsx` épinglent les
 *    photos par empreinte et par calcul de la maquette, et elles sont hors du
 *    périmètre de ce lot. Leurs 270 emplacements gardent donc les photos de la
 *    maquette, et ce sont EUX, et eux seuls, qui laissent 24 pages répéter une
 *    photo après la répartition. C'est un reste assumé, chiffré dans la mesure
 *    d'après, et c'est le prochain lot.
 *  - les PHOTOS EN DUR DES COMPOSANTS PARTAGÉS, hors périmètre de ce lot
 *    (« ne touche pas aux composants »), et c'est le gros du reste :
 *    `components/site/entete-donnees.ts` (le méga-menu, sur les 248 pages),
 *    `components/site/expertises/expertises-donnees.ts`,
 *    `components/site/carriere/donnees-hub.ts`,
 *    `components/site/offre/{ReferencesOffre,MaillageOffres}.tsx`,
 *    `components/site/implantation/MaillageVille.tsx`,
 *    `components/site/expertises/domaine/{SecteursDomaine,OffresDomaine}.tsx`,
 *    `components/site/accueil/{avant-apres,bento-besoins}-donnees.ts`.
 *    C'est pour cela que la mesure DANS LE NAVIGATEUR
 *    (`node scripts/mesure-photos-navigateur.mjs`) voit encore
 *    `ph-hero-raffinerie.jpg` 124 fois quand les fiches ne la servent plus que
 *    12 fois : `MaillageVille.tsx` la pose en dur sur les 74 pages de ville et
 *    `MaillageOffres.tsx` sur les 31 pages d'offre, soit 105 pages à elles
 *    deux. Les fiches sont faites, les composants restent.
 *
 * ORIENTATION : 20 des 109 photos sont en portrait. Les emplacements du site
 * cadrent en `object-fit: cover`, donc une portrait dans un bandeau se recadre
 * sans déformer. L'orientation n'entre donc pas dans le choix, c'est déclaré.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PHOTOS_MIGEN, RACINE, REGISTRE, cheminRegistre } from "@/lib/photos-autorisees";

const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------------------------ les gabarits */

/** Gabarits dont les photos sont épinglées par une porte hors périmètre. */
/* DÉGELÉ LE 09/10, demande de Mehdi : « dégèle si tu peux pour éviter les
   répétitions ». Les gabarits secteur et ressource gardaient les photos de la
   maquette parce que leurs portes les épinglaient par empreinte ; c'étaient
   leurs 270 emplacements, et eux seuls, qui laissaient 24 pages répéter une
   photo. Les deux portes acceptent désormais « de la maquette OU du registre »,
   donc plus rien ne les gèle. */
/* PLUS AUCUN GABARIT GELÉ depuis le 09/10 au soir.
   `ressource` l'était pour une raison précise, écrite ici : son dégel faisait
   tomber sa porte sur `aLire`, qui comparait les trois lectures À L'IDENTIQUE,
   image comprise. La porte accepte désormais, pour l'image seule, la maquette
   OU le registre sous licence, le choix des lectures et leur ordre restant
   comparés mot pour mot. Le gel n'avait donc plus de raison d'être, et il
   laissait 35 pages avec les photos de calage de la maquette, dont deux
   franchement fausses : `team-duo.jpg` là où la maquette dit
   `team-grind-close.jpg`, `sv-armoire.jpg` là où elle dit `team-grind-front.jpg`. */
const GABARITS_GELES = new Set<string>([]);

/** Un chemin de photo qu'on ne remplace jamais : il montre un sujet unique. */
const CHEMINS_GELES = [/^\/assets\/villes\//, /^\/assets\/clients\//];

/** Clés qui portent un logo, jamais une photo. */
const CLES_LOGO = new Set(["logo", "logoInverse"]);

const EST_IMAGE = (v: unknown): v is string =>
  typeof v === "string" && /\.(jpg|jpeg|png|webp|avif)$/i.test(v);

/* --------------------------------------------------- le thème d'un sujet

   Du plus précis au plus général. Les noms de thème sont ceux du registre
   (27 thèmes) : toute faute de frappe ici vide le vivier et le script le dit. */

const THEMES: readonly [RegExp, readonly string[]][] = [
  // Secteurs : le sujet le plus net du site.
  [/^\/secteurs\/aeronautique\//, ["aeronautique"]],
  [/^\/secteurs\/agroalimentaire\//, ["agro"]],
  [/^\/secteurs\/automobile\//, ["auto", "robotique"]],
  [/^\/secteurs\/chimie\//, ["chimie"]],
  [/^\/secteurs\/industrie-lourde\//, ["cimenterie", "metallurgie"]],
  [/^\/secteurs\/industrie-metallique\//, ["metallurgie", "chaudronnerie"]],
  [/^\/secteurs\/logistique\//, ["logistique"]],
  [/^\/secteurs\/menuiserie-industrielle\//, ["menuiserie"]],
  [/^\/secteurs\/nucleaire\//, ["nucleaire", "energie"]],
  [/^\/secteurs\/pharmaceutique\//, ["pharma"]],
  [/^\/secteurs\//, ["site-industriel"]],
  // Expertises : une technologie par branche.
  [/^\/expertises\/automatisme\//, ["automatisme"]],
  [/^\/expertises\/electromecanique\//, ["electricite", "mecanique"]],
  [/^\/expertises\/electrique\//, ["electricite"]],
  [/^\/expertises\/hydraulique\//, ["hydraulique", "mecanique"]],
  [/^\/expertises\/mecanique\//, ["mecanique"]],
  [/^\/expertises\/pneumatique\//, ["pneumatique", "mecanique"]],
  [/^\/expertises\/robotique\//, ["robotique"]],
  [/^\/expertises\/soudure\//, ["soudure", "chaudronnerie"]],
  [/^\/expertises\/tuyauterie\//, ["tuyauterie", "soudure"]],
  [/^\/expertises\/types-de-maintenance\//, ["depannage"]],
  [/^\/expertises\/specialisations-constructeur\//, ["automatisme", "robotique"]],
  [/^\/expertises\//, ["technicien"]],
  // Offres et travaux : le geste de la prestation.
  [/^\/offres\/depannage-industriel\//, ["depannage"]],
  [/^\/offres\/arret-technique\//, ["arret-technique"]],
  [/^\/offres\/retrofit\//, ["automatisme", "mecanique"]],
  [/^\/offres\/chantier\//, ["levage", "site-industriel"]],
  [/^\/offres\/construction\//, ["chaudronnerie", "levage"]],
  [/^\/offres\/bureau-etudes\/|^\/bureau-etudes\//, ["bureau-etudes", "automatisme"]],
  [/^\/offres\/residence\//, ["technicien", "site-industriel"]],
  [/^\/offres\/maintenance-externalisee\//, ["equipe", "technicien"]],
  [/^\/offres\/audit-conseil-maintenance\//, ["site-industriel", "technicien"]],
  [/^\/offres\/full-service\//, ["technicien", "equipe"]],
  [/^\/offres\/zero-arret\//, ["depannage", "technicien"]],
  [/^\/offres\//, ["technicien"]],
  [/^\/travaux-industriels\/levage-manutention\//, ["levage"]],
  [/^\/travaux-industriels\/demantelement-industriel\//, ["chaudronnerie", "metallurgie"]],
  [/^\/travaux-industriels\/montage-industriel\//, ["levage", "chaudronnerie"]],
  [/^\/travaux-industriels\/transfert-industriel\//, ["levage", "logistique"]],
  [/^\/travaux-industriels\//, ["levage", "site-industriel"]],
  [/^\/entreprise-maintenance-industrielle\//, ["site-industriel", "technicien"]],
  // Métiers : le portrait du technicien, par sa spécialité.
  [/^\/carriere\/automaticien/, ["automatisme", "technicien"]],
  [/^\/carriere\/roboticien/, ["robotique", "technicien"]],
  [/^\/carriere\/electromecanicien/, ["electricite", "mecanique"]],
  [/^\/carriere\/technicien-itinerant/, ["depannage", "technicien"]],
  [/^\/carriere\/responsable-maintenance/, ["equipe", "technicien"]],
  [/^\/carriere\/alternance/, ["equipe", "technicien"]],
  [/^\/carriere\//, ["technicien"]],
  // Ressources : le mot-clé du titre porte le sujet.
  [/consignation-electrique|automates-siemens/, ["electricite", "automatisme"]],
  [/permis-de-feu/, ["soudure"]],
  [/analyse-vibratoire|lubrification|mtbf-mttr/, ["mecanique"]],
  [/robot-spot|robot/, ["robotique"]],
  [/arret-technique|arret-de-production/, ["arret-technique"]],
  [/transfert|demenagement|levage|manutention/, ["levage"]],
  [/gmao|digitalisation|ia-maintenance|maintenance-4-0|indicateurs|trs|suivi/, ["technicien", "automatisme"]],
  [/securite|plan-de-prevention|protocole|5s|dechets/, ["equipe", "site-industriel"]],
  [/^\/ressources\//, ["technicien"]],
  [/^\/guides\//, ["site-industriel", "technicien"]],
  // Implantations : un site industriel et ses techniciens.
  [/^\/implantations\//, ["site-industriel", "technicien"]],
  // Études de cas : le secteur du client, lu dans la fiche (voir `themesPreuve`).
  [/^\/preuves\//, ["technicien", "site-industriel"]],
];

/** Le palier le plus large : ce qu'on peut mettre partout sans mentir. */
const THEMES_GENERIQUES: readonly string[] = ["technicien", "site-industriel", "depannage", "equipe"];

const THEMES_CONNUS = new Set(REGISTRE.flatMap((p) => p.themes));
for (const [motif, themes] of THEMES) {
  for (const t of themes) {
    if (!THEMES_CONNUS.has(t)) {
      throw new Error(`thème « ${t} » (${motif}) absent du registre : le vivier serait vide`);
    }
  }
}
for (const t of THEMES_GENERIQUES) {
  if (!THEMES_CONNUS.has(t)) throw new Error(`thème générique « ${t} » absent du registre`);
}

function themesDeLUrl(url: string): readonly string[] {
  return THEMES.find(([motif]) => motif.test(url))?.[1] ?? THEMES_GENERIQUES;
}

/* --------------------------------------------------------- le vivier Migen

   Les dix photos de l'équipe entrent au palier générique : elles montrent des
   techniciens Migen, pas un secteur. Celles qui portent un geste identifiable
   entrent aussi au palier de ce geste, pour qu'une page d'électricité puisse
   servir `team-electric` plutôt qu'une photo de banque. */

const THEMES_MIGEN: Record<string, readonly string[]> = {
  "/assets/web/sv-armoire.jpg": ["electricite", "automatisme", "technicien"],
  "/assets/web/sv-convoyeur.jpg": ["logistique", "technicien"],
  "/assets/web/sv-duo-impact.jpg": ["equipe", "mecanique", "technicien"],
  "/assets/web/sv-portrait.jpg": ["technicien"],
  "/assets/web/team-duo.jpg": ["equipe", "technicien"],
  "/assets/web/team-electric.jpg": ["electricite", "technicien"],
  "/assets/web/team-grind-close.jpg": ["mecanique", "technicien"],
  "/assets/web/team-grind-front.jpg": ["mecanique", "soudure", "technicien"],
  "/assets/web/team-grind-impact.jpg": ["mecanique", "technicien"],
  "/assets/web/team-grind-sparks.jpg": ["soudure", "mecanique", "technicien"],
};
for (const chemin of PHOTOS_MIGEN) {
  if (!THEMES_MIGEN[chemin]) throw new Error(`${chemin} : photo Migen sans thème déclaré`);
}

interface Candidate {
  chemin: string;
  themes: readonly string[];
}

const VIVIER: readonly Candidate[] = [
  ...REGISTRE.map((p) => ({ chemin: cheminRegistre(p.fichier), themes: p.themes as readonly string[] })),
  ...PHOTOS_MIGEN.map((chemin) => ({ chemin, themes: THEMES_MIGEN[chemin] })),
]
  .slice()
  .sort((a, b) => a.chemin.localeCompare(b.chemin));

/** Les thèmes d'une photo du vivier, par son chemin. */
const PAR_THEMES = new Map(VIVIER.map((c) => [c.chemin, c.themes]));

/* ------------------------------------------------------------- l'empreinte */

/** FNV-1a 32 bits : stable d'une exécution à l'autre, d'une machine à l'autre. */
function empreinte(texte: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/* ----------------------------------------------- les emplacements d'une fiche */

interface Emplacement {
  /** Chemin de clés, pour les messages. */
  cle: string;
  /** La page dont le thème s'applique : la cible de la carte, sinon la page. */
  sujet: string;
  valeur: string;
  pose(photo: string): void;
}

type Noeud = Record<string, unknown> | unknown[];

/** Les emplacements de photo d'une fiche, dans l'ordre du document. */
function emplacements(noeud: unknown, page: string, sujet: string, cle = ""): Emplacement[] {
  if (Array.isArray(noeud)) {
    return noeud.flatMap((v, i) => emplacements(v, page, sujet, `${cle}[${i}]`));
  }
  if (!noeud || typeof noeud !== "object") return [];
  const objet = noeud as Record<string, unknown>;
  /* Le sujet d'une carte, c'est la page qu'elle désigne. Une carte vers
     `/secteurs/nucleaire/` montre du nucléaire, où qu'elle soit affichée. */
  const lien = objet.href ?? objet.lienHref;
  const ici = typeof lien === "string" && lien.startsWith("/") && !lien.startsWith("/#") ? lien : sujet;
  const sortie: Emplacement[] = [];
  for (const [nom, valeur] of Object.entries(objet)) {
    if (nom.startsWith("_") || CLES_LOGO.has(nom)) continue;
    if (EST_IMAGE(valeur)) {
      if (CHEMINS_GELES.some((re) => re.test(valeur))) continue;
      sortie.push({
        cle: cle ? `${cle}.${nom}` : nom,
        sujet: ici,
        valeur,
        pose: (photo) => {
          objet[nom] = photo;
        },
      });
      continue;
    }
    if (valeur && typeof valeur === "object") {
      sortie.push(...emplacements(valeur as Noeud, page, ici, cle ? `${cle}.${nom}` : nom));
    }
  }
  return sortie;
}

/* --------------------------------------------------------------- les fiches */

interface Fiche {
  fichier: string;
  url: string;
  gabarit: string;
  /** Le JSON mutable. */
  donnee: Record<string, unknown>;
  /** La fiche d'origine finissait-elle par un saut de ligne ? */
  finaleNl: boolean;
  emplacements: Emplacement[];
  /** Secteurs que la fiche désigne elle-même, pour les études de cas. */
  secteurs: string[];
}

function litFiches(): Fiche[] {
  return readdirSync(DOSSIER)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((fichier) => {
      const brut = readFileSync(join(DOSSIER, fichier), "utf8");
      const donnee = JSON.parse(brut) as Record<string, unknown>;
      const contenu = (donnee.contenu ?? {}) as Record<string, unknown>;
      const url = String(donnee.url ?? `/${fichier}`);
      return {
        fichier,
        url,
        gabarit: String(contenu.gabarit ?? ""),
        donnee,
        finaleNl: brut.endsWith("\n"),
        emplacements: emplacements(contenu, url, url),
        secteurs: [...new Set([...brut.matchAll(/\/secteurs\/([a-z0-9-]+)\//g)].map((m) => m[1]))].sort(),
      };
    });
}

/** Le thème d'une étude de cas : le secteur que SA fiche désigne, sinon le
 *  portrait de technicien. On ne devine pas le secteur d'un client. */
function themesPreuve(fiche: Fiche): readonly string[] {
  const secteur = fiche.secteurs[0];
  if (!secteur) return themesDeLUrl(fiche.url);
  return themesDeLUrl(`/secteurs/${secteur}/`);
}

/**
 * LES PALIERS DE THÈME D'UN EMPLACEMENT, du plus précis au plus large.
 *
 *  palier 0 : LA PAGE qui affiche l'emplacement. C'est la règle de la maquette,
 *             et c'est ce qui fait qu'une page se tient : huit photos de huit
 *             métiers sur une page d'hydraulique ne ressemblent à rien.
 *  palier 1 : CE QUE L'EMPLACEMENT DÉSIGNE, lu sur SA FICHE quand il en a une
 *             (une étude de cas déclare son secteur, voir `themesPreuve`) : une
 *             carte vers `/secteurs/nucleaire/` prend une photo de centrale
 *             plutôt qu'une photo d'atelier, dès que le thème de la page ne
 *             suffit plus à servir tous ses emplacements.
 *  palier 2 : les thèmes génériques (technicien, site industriel, dépannage,
 *             équipe), ce qu'on peut montrer partout sans mentir.
 *  palier 3 : tout le vivier, en dernier recours.
 */
function paliersDeLEmplacement(fiche: Fiche, emplacement: Emplacement, themesParUrl: Map<string, readonly string[]>): readonly string[][] {
  const dePage = themesParUrl.get(fiche.url) ?? themesDeLUrl(fiche.url);
  const duSujet =
    emplacement.sujet === fiche.url
      ? dePage
      : themesParUrl.get(emplacement.sujet) ?? themesDeLUrl(emplacement.sujet);
  return [[...dePage], [...duSujet], [...THEMES_GENERIQUES]];
}

/* ------------------------------------------------------------- le vivier d'un sujet

   Paliers : le thème exact, puis les thèmes voisins de la table, puis les
   thèmes génériques, puis tout. On s'arrête au premier palier qui peut servir
   la page entière avec un peu de marge : la marge évite qu'une page longue
   n'épuise son palier et ne tombe toujours sur les mêmes photos. */

const MARGE = 6;

/** À quel point une photo colle au sujet : le rang du PREMIER THÈME qu'elle
 *  porte, dans la suite des paliers mis bout à bout.
 *
 *  LE RANG EST CELUI DU THÈME, PAS CELUI DU PALIER, et c'est une correction du
 *  09/10. Un palier porte souvent deux thèmes, le précis puis son voisin :
 *  `/expertises/hydraulique/` donne `["hydraulique", "mecanique"]`, et
 *  `/bureau-etudes/` donne `["bureau-etudes", "automatisme"]`. En rendant le
 *  rang du PALIER, les deux thèmes étaient réputés aussi spécifiques, et le
 *  départage se faisait alors sur « la moins servie ». Avec 12 photos
 *  d'hydraulique contre 83 de mécanique, ou 4 de bureau d'études contre 90
 *  d'automatisme, le thème précis perdait à tous les coups : mesuré le 09/10,
 *  0 photo d'hydraulique sur les 6 de `/expertises/hydraulique/`, 0 photo de
 *  bureau d'études sur les 10 de `/bureau-etudes/`.
 *
 *  Le thème le plus précis d'un palier est le premier de sa liste, par
 *  construction de la table : il suffit donc de compter les thèmes et non les
 *  paliers pour que la page montre d'abord son sujet. */
function specificite(candidate: Candidate, paliers: readonly string[][]): number {
  const suite = paliers.flat();
  const rang = suite.findIndex((t) => candidate.themes.includes(t));
  return rang < 0 ? suite.length : rang;
}

function vivier(paliers: readonly string[][], besoin: number): Candidate[] {
  const cumul: string[] = [];
  for (const palier of paliers) {
    cumul.push(...palier);
    const choix = VIVIER.filter((c) => c.themes.some((t) => cumul.includes(t)));
    if (choix.length >= besoin + MARGE) return choix;
  }
  return [...VIVIER];
}

/* -------------------------------------------------------------- les sœurs */

/** Le dossier parent d'une URL : `/implantations/lyon/grenoble/` → `/implantations/lyon/`. */
function parent(url: string): string {
  const bouts = url.split("/").filter(Boolean);
  bouts.pop();
  return `/${bouts.join("/")}${bouts.length ? "/" : ""}`;
}

/* ------------------------------------------------------------ la répartition */

interface Plan {
  fiches: Fiche[];
  /** Nombre de fois qu'une photo est posée sur tout le site. */
  usage: Map<string, number>;
  /** Par page : la série posée, dans l'ordre. */
  series: Map<string, string[]>;
  /** Par page : sa photo d'identité, celle que deux sœurs ne partagent pas. */
  identites: Map<string, string>;
  gelees: number;
  posees: number;
}

function repartit(): Plan {
  const fiches = litFiches();
  /* Les thèmes de CHAQUE page du site, par son URL : une carte vers
     `/preuves/jacquet-brossard/` doit savoir que cette étude de cas parle
     d'agroalimentaire. L'URL seule ne le dit pas, sa fiche le dit. */
  const THEMES_PAR_URL = new Map<string, readonly string[]>(
    fiches.map((f) => [f.url, f.gabarit === "etude-de-cas" ? themesPreuve(f) : themesDeLUrl(f.url)]),
  );
  const usage = new Map<string, number>();
  const series = new Map<string, string[]>();
  const identites = new Map<string, string>();
  /** Photo d'identité déjà prise par une sœur, par dossier parent. */
  const premieresDesSoeurs = new Map<string, Set<string>>();
  let gelees = 0;
  let posees = 0;

  /* Les photos que la mesure compte mais qu'on ne redistribue pas : elles
     pèsent dans l'équilibre global, donc on les compte d'abord. */
  for (const fiche of fiches) {
    if (!GABARITS_GELES.has(fiche.gabarit)) continue;
    for (const e of fiche.emplacements) usage.set(e.valeur, (usage.get(e.valeur) ?? 0) + 1);
    gelees += fiche.emplacements.length;
  }

  /** Chaque emplacement servi, pour la passe de complétude. */
  const servis: {
    url: string;
    rang: number;
    sujet: string;
    paliers: readonly string[][];
    identite: boolean;
    emplacement: Emplacement;
  }[] = [];

  for (const fiche of fiches) {
    if (GABARITS_GELES.has(fiche.gabarit)) continue;
    const besoin = fiche.emplacements.length;
    if (besoin === 0) continue;

    const deja = new Set<string>();
    const serie: string[] = [];
    const cleParent = parent(fiche.url);
    const interditesEnTete = premieresDesSoeurs.get(cleParent) ?? new Set<string>();
    /* LA PHOTO D'IDENTITÉ d'une page, c'est le premier emplacement dont le
       sujet est la page elle-même : son héros, son bandeau de hub, la photo de
       son problème. Les autres emplacements sont des cartes vers d'autres
       pages, leur sujet est ailleurs. C'est l'identité, pas la première carte,
       que deux sœurs ne doivent pas partager. */
    const rangIdentite = Math.max(
      0,
      fiche.emplacements.findIndex((e) => e.sujet === fiche.url),
    );

    fiche.emplacements.forEach((emplacement, rang) => {
      const paliers = paliersDeLEmplacement(fiche, emplacement, THEMES_PAR_URL);
      const choix = vivier(paliers, besoin);
      // Règle 1 : jamais deux fois la même photo dans la page.
      let libres = choix.filter((c) => !deja.has(c.chemin));
      // Règle 2 : la photo d'identité n'est pas celle d'une sœur. On élargit
      // jusqu'au vivier entier plutôt que de céder sur la règle.
      if (rang === rangIdentite) {
        const sansSoeurs = libres.filter((c) => !interditesEnTete.has(c.chemin));
        libres =
          sansSoeurs.length > 0
            ? sansSoeurs
            : VIVIER.filter((c) => !deja.has(c.chemin) && !interditesEnTete.has(c.chemin));
      }
      if (libres.length === 0) libres = VIVIER.filter((c) => !deja.has(c.chemin));
      if (libres.length === 0) {
        throw new Error(
          `${fiche.url} : ${besoin} emplacements pour ${VIVIER.length} photos, la règle « jamais deux fois » est intenable`,
        );
      }
      /* LE THÈME D'ABORD (règle 3) : une page d'agroalimentaire prend une photo
         d'agroalimentaire tant qu'il en reste, et seulement ensuite une photo
         de palier plus large. À thème égal, LE MOINS SERVI : c'est ce qui
         équilibre le site. À égalité encore, l'empreinte du couple
         sujet/photo tranche, sans tirage au sort. */
      const score = (c: Candidate): [number, number, number] => [
        specificite(c, paliers),
        usage.get(c.chemin) ?? 0,
        empreinte(`${emplacement.sujet}|${c.chemin}`),
      ];
      let gagnante = libres[0];
      let meilleur = score(gagnante);
      for (const candidate of libres.slice(1)) {
        const essai = score(candidate);
        if (essai[0] < meilleur[0] || (essai[0] === meilleur[0] && essai[1] < meilleur[1]) ||
            (essai[0] === meilleur[0] && essai[1] === meilleur[1] && essai[2] < meilleur[2])) {
          gagnante = candidate;
          meilleur = essai;
        }
      }
      emplacement.pose(gagnante.chemin);
      deja.add(gagnante.chemin);
      serie.push(gagnante.chemin);
      usage.set(gagnante.chemin, (usage.get(gagnante.chemin) ?? 0) + 1);
      posees += 1;
      servis.push({
        url: fiche.url,
        rang,
        sujet: emplacement.sujet,
        paliers,
        identite: rang === rangIdentite,
        emplacement,
      });
    });

    series.set(fiche.url, serie);
    identites.set(fiche.url, serie[rangIdentite]);
    if (!premieresDesSoeurs.has(cleParent)) premieresDesSoeurs.set(cleParent, new Set());
    premieresDesSoeurs.get(cleParent)!.add(serie[rangIdentite]);
  }

  /* PASSE DE COMPLÉTUDE. Mehdi a payé 109 photos : aucune ne doit rester au
     placard. Une photo peut n'avoir aucun emplacement à son thème exact (le
     nucléaire n'a que quatre cartes sur tout le site pour cinq photos), et la
     passe principale la laisse alors de côté. On lui prend ici la place de la
     photo LA PLUS RÉPÉTÉE du site, parmi les emplacements dont le sujet porte
     bien un de ses thèmes : le thème colle toujours au sujet (règle 3), la
     page ne la sert pas déjà (règle 1), et on ne touche pas aux photos
     d'identité pour ne pas défaire la règle des sœurs (règle 2). */
  for (const orpheline of REGISTRE.map((p) => cheminRegistre(p.fichier)).sort()) {
    if ((usage.get(orpheline) ?? 0) > 0) continue;
    const siennes = PAR_THEMES.get(orpheline) ?? [];
    let hote: (typeof servis)[number] | undefined;
    let meilleur: [number, number, number] | undefined;
    for (const candidat of servis) {
      if (candidat.identite) continue;
      const serie = series.get(candidat.url);
      if (!serie || serie.includes(orpheline)) continue;
      const rang = candidat.paliers.findIndex((palier) => palier.some((t) => siennes.includes(t)));
      if (rang < 0) continue; // hors thème : on préfère laisser la photo au placard
      const sortante = serie[candidat.rang];
      const score: [number, number, number] = [
        -(usage.get(sortante) ?? 0),
        rang,
        empreinte(`${candidat.sujet}|${orpheline}`),
      ];
      if (!meilleur || score[0] < meilleur[0] ||
          (score[0] === meilleur[0] && score[1] < meilleur[1]) ||
          (score[0] === meilleur[0] && score[1] === meilleur[1] && score[2] < meilleur[2])) {
        hote = candidat;
        meilleur = score;
      }
    }
    if (!hote) continue;
    const serie = series.get(hote.url)!;
    const sortante = serie[hote.rang];
    hote.emplacement.pose(orpheline);
    serie[hote.rang] = orpheline;
    usage.set(sortante, (usage.get(sortante) ?? 1) - 1);
    usage.set(orpheline, 1);
  }
  for (const [photo, n] of [...usage]) if (n === 0) usage.delete(photo);

  return { fiches, usage, series, identites, gelees, posees };
}

/* ----------------------------------------------- les trois règles, vérifiées */

function controle(plan: Plan): string[] {
  const fautes: string[] = [];
  const autorisees = new Set(VIVIER.map((c) => c.chemin));

  for (const [url, serie] of plan.series) {
    // 1. Jamais deux fois la même photo dans une page.
    if (new Set(serie).size !== serie.length) {
      const doubles = serie.filter((p, i) => serie.indexOf(p) !== i);
      fautes.push(`${url} : photo répétée dans la page, ${[...new Set(doubles)].join(", ")}`);
    }
    // 3. Chaque photo posée vient du vivier.
    for (const photo of serie) {
      if (!autorisees.has(photo)) fautes.push(`${url} : ${photo} n'est ni au registre ni une photo Migen`);
    }
  }

  // 2. Deux sœurs n'ont pas la même série.
  const parParent = new Map<string, [string, string][]>();
  for (const [url, serie] of plan.series) {
    const cle = parent(url);
    if (!parParent.has(cle)) parParent.set(cle, []);
    parParent.get(cle)!.push([url, serie.join("|")]);
  }
  for (const [cle, soeurs] of parParent) {
    const vues = new Map<string, string>();
    for (const [url, signature] of soeurs) {
      const jumelle = vues.get(signature);
      if (jumelle) fautes.push(`${cle} : ${url} et ${jumelle} reçoivent la même série`);
      else vues.set(signature, url);
    }
    const tetes = new Map<string, string>();
    for (const [url] of soeurs) {
      const identite = plan.identites.get(url) ?? "";
      const jumelle = tetes.get(identite);
      if (jumelle) fautes.push(`${cle} : ${url} et ${jumelle} ont la même photo d'identité ${identite}`);
      else tetes.set(identite, url);
    }
  }

  return fautes;
}

/* ------------------------------------------------------------------ sortie */

function ecris(plan: Plan): number {
  let ecrits = 0;
  for (const fiche of plan.fiches) {
    if (GABARITS_GELES.has(fiche.gabarit)) continue;
    if (fiche.emplacements.length === 0) continue;
    const texte = JSON.stringify(fiche.donnee, null, 2) + (fiche.finaleNl ? "\n" : "");
    const chemin = join(DOSSIER, fiche.fichier);
    if (readFileSync(chemin, "utf8") === texte) continue;
    writeFileSync(chemin, texte);
    ecrits += 1;
  }
  return ecrits;
}

function principal(): void {
  const plan = repartit();
  const fautes = controle(plan);

  const classement = [...plan.usage.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const auRegistre = new Set(REGISTRE.map((p) => cheminRegistre(p.fichier)));
  const utilisees = classement.filter(([p]) => auRegistre.has(p));
  const inutilisees = [...auRegistre].filter((p) => !plan.usage.has(p)).sort();

  console.log(`fiches lues                   : ${plan.fiches.length}`);
  console.log(`emplacements repartis         : ${plan.posees}`);
  console.log(`emplacements geles            : ${plan.gelees} (gabarits ${[...GABARITS_GELES].join(", ")})`);
  console.log(`vivier                        : ${VIVIER.length} photos (${REGISTRE.length} au registre + ${PHOTOS_MIGEN.length} Migen)`);
  console.log(`photos distinctes servies     : ${plan.usage.size}`);
  console.log(`repetition maximale           : ${classement[0]?.[1] ?? 0} (${classement[0]?.[0] ?? "-"})`);
  const duVivier = classement.filter(([p]) => PAR_THEMES.has(p));
  console.log(`  dont photos reparties        : ${duVivier[0]?.[1] ?? 0} (${duVivier[0]?.[0] ?? "-"})`);
  const gelees = classement.filter(([p]) => !PAR_THEMES.has(p));
  console.log(`  dont photos gelees           : ${gelees[0]?.[1] ?? 0} (${gelees[0]?.[0] ?? "-"})`);
  console.log(`photos du registre utilisees  : ${utilisees.length} / ${REGISTRE.length}`);
  if (inutilisees.length > 0) console.log(`  jamais servies : ${inutilisees.map((p) => p.split("/").pop()).join(", ")}`);
  const migen = PHOTOS_MIGEN.map((p) => `${p.split("/").pop()}×${plan.usage.get(p) ?? 0}`);
  console.log(`photos de l'equipe Migen      : ${migen.join(", ")}`);

  if (process.argv.includes("--detail")) {
    console.log("\n-- serie de chaque page");
    for (const [url, serie] of plan.series) {
      console.log(`${url}\n   ${serie.map((p) => p.split("/").pop()).join(", ")}`);
    }
  }

  if (fautes.length > 0) {
    console.error(`\n${fautes.length} faute(s) de repartition :`);
    for (const f of fautes.slice(0, 40)) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("\nles trois regles dures tiennent : aucune page ne repete une photo, aucune soeur ne partage sa serie, chaque photo vient du vivier.");

  if (process.argv.includes("--applique")) {
    const ecrits = ecris(plan);
    console.log(`\n${ecrits} fiche(s) reecrite(s). Lancer « node scripts/relis-relais.mjs ».`);
  } else {
    console.log("plan seulement : relancer avec --applique pour ecrire les fiches.");
  }
}

principal();
