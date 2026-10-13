/**
 * LES RÈGLES DE CLASSEMENT DE « Ressources v2 », portées telles quelles.
 *
 * RÉFÉRENCE : `maquette/colis-13-10/Migen - Ressources.html`, fichier autonome
 * de 7,4 Mo livré le 13/10. Son code vit dans le dernier `<script>` du gabarit
 * encodé en JSON (`<script type="__bundler/template">`, ligne 382) et sa donnée
 * dans `window.__MGRES`, bundle `5edf2ed4-…` du manifeste. Pour les relire :
 *
 *   python3 -c "import json;print(json.loads(open('maquette/colis-13-10/Migen - Ressources.html').read().split(chr(10))[381]))"
 *
 * CE FICHIER NE DÉCIDE RIEN. Chaque constante ci-dessous est soit une
 * TRANSCRIPTION d'une table de la maquette, soit une DÉRIVATION dont la règle
 * est écrite noir sur blanc. Rien n'y est inventé, et ce qui manque est déclaré
 * manquant plutôt que comblé.
 *
 * TROIS ÉTATS DE LA DONNÉE, et il faut les distinguer pour relire ce fichier :
 *
 *   1. CE QUI EXISTE AU DÉPÔT, à ne pas recalculer. Les cinq rayons, les 35
 *      fiches, leur nombre de mots et leurs minutes de lecture. Mesuré le
 *      13/10 : les 35 fiches de `supabase/import/gabarits-maquette/` portent
 *      toutes `contenu.minutes`, et le catalogue des cinq hubs de rayon porte
 *      `mots` ET `minutes` pour chacune. La durée de lecture des ressources
 *      N'EST DONC NI À INVENTER NI À DÉRIVER : elle est écrite.
 *   2. CE QUI SE DÉRIVE d'un champ existant, par une règle déclarée. Les
 *      étiquettes (expressions de la maquette appliquées au texte des fiches)
 *      et les minutes des pages `/carriere/`, qui elles n'en ont pas.
 *   3. CE QUI N'EXISTE NI AU DÉPÔT NI COMME RÈGLE : le thème des 20 fiches qui
 *      ne sont pas des articles. Il reste VIDE, et le menu le dit.
 */

/* ------------------------------------------------------------------ espaces */

/** Les deux espaces du menu latéral de la maquette (`pickSpace`). */
export type Espace = "entreprises" | "techniciens";

/* --------------------------------------------------------------- normalisation */

/**
 * `nz()` de la maquette, à la lettre : minuscules, accents retirés, apostrophe
 * droite ou courbe remplacée par une espace.
 *
 * L'apostrophe devient une ESPACE et non rien : « coût d'un arrêt » donne
 * « cout d un arret », et c'est ce qui permet au motif `\bia\b` de ne pas
 * mordre sur « d'ia… ». Changer ce détail change le résultat des étiquettes.
 */
export function normalise(texte: string): string {
  return String(texte ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ");
}

/* --------------------------------------------------------------- taxonomie */

/** Une étiquette : son libellé, et le motif qui la fait apparaître. */
export type EntreeTaxonomie = readonly [libelle: string, motif: RegExp];

/**
 * `TAXE` de la maquette, SEIZE entrées, transcrites sans la moindre retouche.
 *
 * CE N'EST PAS UNE DONNÉE, C'EST UNE RÈGLE, et c'est tout l'intérêt : la
 * maquette ne stocke aucune étiquette sur ses fiches, elle les CALCULE à
 * l'exécution dans `tagsOf(it)` en cherchant ces motifs dans le texte de la
 * fiche. Porter les motifs porte donc la décision éditoriale du client sans
 * avoir à l'imiter : affecter des étiquettes à la main, page par page, aurait
 * été une décision de copie, et elle ne nous appartient pas.
 *
 * PREUVE QUE LE PORTAGE EST FIDÈLE : rejouée sur les quinze articles de la
 * maquette, cette table rend EXACTEMENT quatorze étiquettes non vides, le
 * compte relevé sur son rendu à 1280 px. `verification-hub.tsx` tient ce
 * chiffre. Sur nos 35 fiches, les cinq rayons étant publiés là où la maquette
 * les annonce « Bientôt », seize sortent : « Sécurité » et « Externalisation »
 * s'ajoutent parce que les fiches pratiques et les livres blancs existent chez
 * nous. Le menu n'affiche jamais une étiquette à zéro, comme la maquette.
 */
export const TAXONOMIE_ENTREPRISES: readonly EntreeTaxonomie[] = [
  ["GMAO", /gmao|logiciel de maintenance/],
  ["Préventive", /preventi/],
  ["Corrective", /correcti|curati/],
  ["Prédictive", /predicti|vibratoire|capteur/],
  ["Planification", /planifi|planning|ordonnanc/],
  ["Indicateurs", /indicateur|kpi|\btrs\b|mtbf|mttr|disponibilite/],
  ["Coûts", /cout|budget/],
  ["Organisation", /organis|equipe|service maintenance/],
  ["Sécurité", /securite|consignation|prevention|habilitation/],
  ["Digital", /digital|numeri|donnees|4\.0|iot/],
  ["IA", /\bia\b|intelligence artificielle/],
  ["Robotique", /robot/],
  ["Environnement", /dechet|environnement|energie|\brse\b/],
  ["Arrêt de production", /arret/],
  ["TPM", /\btpm\b|productive totale/],
  ["Externalisation", /externalis|sous-traitan|prestataire/],
] as const;

/** `TAXT` de la maquette, onze entrées, pour l'espace Techniciens. */
export const TAXONOMIE_TECHNICIENS: readonly EntreeTaxonomie[] = [
  ["Salaire", /salaire|remuneration/],
  ["Formation", /formation|diplome|\bbts\b|bac pro/],
  ["Compétences", /competence/],
  ["Alternance", /alternan|apprenti/],
  ["Électricité", /electri/],
  ["Mécanique", /mecani/],
  ["Automatisme", /automat|siemens|\bplc\b/],
  ["Robotique", /robot/],
  ["Itinérance", /itinerant|deplacement|multisite/],
  ["Management", /manag|responsable|encadr/],
  ["Sécurité", /securite|habilitation|consignation/],
] as const;

/**
 * `tagsOf(it)` de la maquette : les étiquettes dont le motif apparaît dans le
 * texte normalisé de la fiche.
 *
 * LE TEXTE EXAMINÉ est celui de la maquette, `h1 + ex + titres de sections`,
 * et nos fiches portent les mêmes trois morceaux sous d'autres noms. Vérifié
 * champ par champ sur `/ressources/articles/gmao/` le 13/10 : son `h1` est
 * notre `titre_h1` au caractère près, son `ex` est notre `chapo[0]` au
 * caractère près, et ses `secs[].t` sont nos `parties[].titre` suivis de
 * « Questions fréquentes (FAQ) », titre que la maquette ajoute quand la fiche
 * a une FAQ. `catalogue.ts` recompose ce texte-là, et pas un autre.
 *
 * NI LE CORPS NI LE CHAPÔ COMPLET n'entrent dans le calcul : la maquette s'en
 * tient au titre, à la première phrase et aux intertitres. Y ajouter le corps
 * ferait apparaître une étiquette sur presque toutes les fiches, et un filtre
 * qui ne filtre plus rien ne sert personne.
 */
export function etiquettesDe(
  texte: string,
  taxonomie: readonly EntreeTaxonomie[],
): string[] {
  const nu = normalise(texte);
  return taxonomie.filter(([, motif]) => motif.test(nu)).map(([libelle]) => libelle);
}

/* ------------------------------------------------------------------ thèmes */

/** `THEMES` de la maquette, quatre, dans son ordre. */
export const THEMES: readonly string[] = [
  "Organisation",
  "Méthodes",
  "Digital & IA",
  "Coûts & environnement",
] as const;

/**
 * LE THÈME DE CHAQUE ARTICLE, relu dans `window.__MGRES.articles[].theme`.
 *
 * POURQUOI UNE TABLE ET NON UNE RÈGLE, à la différence des étiquettes : la
 * maquette ne calcule pas le thème, elle le STOCKE, un par article. C'est une
 * décision éditoriale du client, prise article par article, et aucune
 * expression ne la reproduit. La recopier depuis la maquette est un portage ;
 * la deviner aurait été une invention.
 *
 * LES QUINZE URL CORRESPONDENT UNE À UNE aux quinze fiches
 * `/ressources/articles/` du dépôt, vérifié le 13/10 : même liste, même ordre
 * alphabétique, aucune en trop ni en moins. `verification-hub.tsx` le tient,
 * pour qu'un article ajouté ou renommé fasse tomber la porte au lieu de
 * glisser sans thème.
 *
 * CE QUE CETTE TABLE NE DIT PAS, et c'est déclaré plutôt que comblé : les 20
 * fiches pratiques, fiches techniques, livres blancs et process n'ont PAS de
 * thème. La maquette leur écrit le libellé de leur propre format (`theme:
 * "Fiche pratique"`), ce qui n'est pas un thème mais la catégorie répétée :
 * elles ne tombent donc sous aucun des quatre thèmes, chez elle comme chez
 * nous. Leur classement est un arbitrage de Mehdi, pas une dérivation.
 */
export const THEME_PAR_ARTICLE: ReadonlyMap<string, string> = new Map([
  ["/ressources/articles/cout-arret-de-production/", "Coûts & environnement"],
  ["/ressources/articles/digitalisation-maintenance/", "Digital & IA"],
  ["/ressources/articles/gestion-des-dechets/", "Coûts & environnement"],
  ["/ressources/articles/gmao/", "Digital & IA"],
  ["/ressources/articles/ia-maintenance/", "Digital & IA"],
  ["/ressources/articles/maintenance-4-0/", "Digital & IA"],
  ["/ressources/articles/optimiser-la-maintenance/", "Méthodes"],
  ["/ressources/articles/organiser-service-maintenance/", "Organisation"],
  ["/ressources/articles/plan-de-maintenance/", "Organisation"],
  ["/ressources/articles/planification-maintenance/", "Organisation"],
  ["/ressources/articles/predictive-ou-corrective/", "Méthodes"],
  ["/ressources/articles/preventive-ou-corrective/", "Méthodes"],
  ["/ressources/articles/robot-spot/", "Digital & IA"],
  ["/ressources/articles/suivi-de-la-maintenance/", "Organisation"],
  ["/ressources/articles/tpm/", "Méthodes"],
]);

/* ------------------------------------------------------- durée de lecture */

/**
 * LA VITESSE DE LECTURE DU PROJET : 220 mots par minute, arrondi, plancher 2.
 *
 * D'OÙ VIENT LE CHIFFRE, puisqu'il faut pouvoir le contredire : c'est la règle
 * de la maquette, `Math.max(2, Math.round(mots / 220))`, déjà portée dans
 * `components/site/ressource/maquette-ressource.ts` sous le nom
 * `minutesMaquette`. Elle est ici recopiée et non importée parce que ce
 * fichier-là est un OUTIL DE CONSTRUCTION : il lit `node:fs` et son en-tête
 * dit « jamais importé par l'application ». `verification-hub.tsx` compare les
 * deux implémentations sur les 35 fiches pour qu'elles ne puissent pas
 * diverger en silence.
 *
 * ELLE EST VÉRIFIÉE, pas supposée : appliquée aux `mots` des 35 entrées du
 * catalogue, elle retrouve leurs `minutes` 35 fois sur 35. Avec un arrondi
 * supérieur, ou à 200 ou 240 mots par minute, elle en rate au moins deux.
 *
 * À QUOI ELLE SERT ICI, et seulement ici : les 13 pages `/carriere/` n'ont
 * aucune minute au dépôt, alors que le menu latéral les trie par durée. Leur
 * minute est donc DÉRIVÉE de leur nombre de mots, lu dans
 * `maquette/contenu/site/index.json` (champ `mots`, présent pour les 248 URL).
 * Les 35 ressources, elles, gardent la minute écrite dans leur fiche : on ne
 * recalcule pas une donnée qui existe.
 */
export const MOTS_PAR_MINUTE = 220;

/** `minutesMaquette`, à l'identique. 600 mots par défaut, comme la maquette. */
export function minutesDeLecture(mots: number | undefined): number {
  return Math.max(2, Math.round((mots ?? 600) / MOTS_PAR_MINUTE));
}

/** Les quatre segments de `DUR`, libellés compris. */
export type CleDuree = "all" | "s" | "m" | "l";

/**
 * `DUR` de la maquette, transcrite avec son défaut.
 *
 * SON DÉFAUT, signalé et NON corrigé : le libellé « 10 + » va avec le test
 * `min > 10`, qui commence donc à 11, et « 7–10 » couvre bien 7 à 10. Une
 * ressource de 10 minutes tombe dans « 7–10 » et pas dans « 10 + », ce que le
 * libellé laisse mal deviner. C'est la copie du client : elle se signale, elle
 * ne se réécrit pas (`lib/decisions-copie.ts` est le seul endroit où un
 * arbitrage de copie vit).
 */
export const SEGMENTS_DUREE: readonly { cle: CleDuree; libelle: string }[] = [
  { cle: "all", libelle: "Tout" },
  { cle: "s", libelle: "≤ 6 min" },
  { cle: "m", libelle: "7–10" },
  { cle: "l", libelle: "10 +" },
] as const;

/** `durOk` de la maquette. */
export function dureeRetenue(minutes: number, cle: CleDuree): boolean {
  if (cle === "all") return true;
  if (cle === "s") return minutes <= 6;
  if (cle === "m") return minutes >= 7 && minutes <= 10;
  return minutes > 10;
}

/* -------------------------------------------------------------------- tris */

/** `sorts` de la maquette : trois, dans son ordre et avec ses libellés. */
export type CleTri = "pert" | "court" | "long";

export const TRIS: readonly { cle: CleTri; libelle: string }[] = [
  { cle: "pert", libelle: "Pertinence" },
  { cle: "court", libelle: "Plus courts" },
  { cle: "long", libelle: "Plus longs" },
] as const;

/** `views` de la maquette : deux. */
export type CleVue = "grid" | "list";

export const VUES: readonly { cle: CleVue; libelle: string }[] = [
  { cle: "grid", libelle: "Grille" },
  { cle: "list", libelle: "Liste" },
] as const;
