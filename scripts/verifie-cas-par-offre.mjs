/**
 * PORTE : UN CAS CLIENT N'EST CITÉ QUE SUR L'OFFRE OU L'EXPERTISE DONT IL RELÈVE.
 *
 *   node scripts/verifie-cas-par-offre.mjs              la mesure
 *   node scripts/verifie-cas-par-offre.mjs --detail      la mesure, citations conformes comprises
 *   node scripts/verifie-cas-par-offre.mjs --controle    le témoin : sait-elle échouer ?
 *
 * POURQUOI ELLE EXISTE. Mehdi l'a signalé deux fois : « les cas clients cités
 * sur chaque page expertise ne correspondent pas à l'expertise ». Une première
 * réponse (G7 de GATES.md) a conclu que « 13 pages sur 19 étaient déjà
 * exactes » et que les écarts étaient un double comptage. Aucune porte ne le
 * mesurait, donc rien ne pouvait le contredire. Celle-ci le mesure.
 *
 * CE QU'ELLE LIT, et rien d'autre : les fiches de
 * `supabase/import/gabarits-maquette/`. C'est le relais que `lib/contenu.ts`
 * sert aux gabarits : corriger la fiche corrige la page.
 *
 * ---------------------------------------------------------------------------
 * LA RÈGLE, en une phrase : la preuve d'un rattachement doit venir de la FICHE
 * DU CAS, jamais du texte de la carte qui le cite.
 *
 * Sans ça, la vérification serait circulaire : la carte de TIMESCOPE sur
 * `/expertises/soudure/` affirme « soudure et chaudronnerie comprises », et la
 * même carte sur `/expertises/hydraulique/verin-hydraulique/` affirme
 * « hydraulique comprise ». Les deux phrases sont écrites par la page qui
 * cite ; la fiche TIMESCOPE, elle, parle de casques de réalité virtuelle,
 * d'étanchéité et de réglages. C'est la fiche qui dit de quoi le cas parle.
 *
 * CE QUI COMPTE DANS UNE FICHE DE CAS : tout son texte, SAUF
 *   · les chemins (`photo`, `logo`, `href`, `url`) : un fichier nommé
 *     « robot-soudure-points-caisse.jpg » ne fait pas du cas une référence de
 *     soudure. C'est précisément ce faux positif qui a été mesuré : `grep` sur
 *     le fichier brut donne 17 cas « soudure » et 25 « robot », tous dans des
 *     noms d'images ;
 *   · le bloc de formulaire de fin de fiche (`bouton`, `besoinTitre`,
 *     `besoinProse`, `besoinTuiles`) : sa tuile « 10 % des techniciens
 *     retenus » énumère les métiers de Migen (« Mécanique, électricité,
 *     électromécanique, automatisme, hydraulique, pneumatique, robotique »).
 *     Elle parle du recrutement, pas de la mission, et elle est la même sur
 *     plusieurs fiches : la compter prouverait tous les rattachements d'un
 *     coup ;
 *   · le bloc de navigation `plusLoin` : il nomme d'AUTRES pages. Le compter
 *     rendrait l'axe 2 (ci-dessous) circulaire.
 *
 * ---------------------------------------------------------------------------
 * DEUX AXES MESURÉS
 *
 * AXE 1, la page vers ses cas. Chaque page d'offre ou d'expertise porte une
 * section `preuves` : ses cartes visent `/preuves/<cas>/`. Le cas doit porter
 * le sujet de la page dans sa propre fiche.
 *
 * AXE 2, le cas vers son offre. Une fiche de cas peut poser dans `plusLoin`
 * une carte de surtitre « Offre ». L'offre visée doit, elle aussi, être un
 * sujet que la fiche du cas porte. Une fiche SANS carte « Offre » n'est pas un
 * manquement : lui en inventer une serait inventer une donnée. Elle est
 * comptée et signalée à part.
 *
 * ---------------------------------------------------------------------------
 * CE QUI EST SIGNALÉ SANS ÊTRE COMPTÉ EN MANQUEMENT, pour que rien ne se cache
 *
 *   · LES PAGES GÉNÉRIQUES. `/offres/`, `/secteurs/`, `/offres/full-service/`,
 *     `/offres/maintenance-externalisee/` et `/entreprise-maintenance-industrielle/`
 *     ne vendent pas une prestation nommée : elles vendent l'ensemble. Exiger
 *     un sujet d'elles serait inventer une exigence. Elles sont listées comme
 *     génériques, avec le nombre de cas qu'elles citent.
 *   · LES CARTES SANS `lienHref`. `ReferencesOffre.tsx` les écarte au rendu
 *     (filtre `preuve.lienHref && estCheminInterne(...)`) : elles ne
 *     s'affichent pas, il n'y a donc pas de cas mal cité à l'écran. Deux
 *     fiches en portent, et leur `titre` est un lien markdown brut
 *     (`[Étude de cas …](/preuves/…)`) : défaut connu et distinct.
 *
 * ---------------------------------------------------------------------------
 * ELLE SAIT ÉCHOUER, et `--controle` le prouve sur la donnée RÉELLE, en
 * mémoire, sans jamais écrire sur le disque :
 *   · UN CONTRÔLE NÉGATIF : une citation que la porte accepte, mesurée seule,
 *     doit donner zéro manquement. Sans lui, une porte qui refuse tout
 *     passerait pour vigilante.
 *   · CINQ FAUTES INJECTÉES, chacune devant être vue.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/* ------------------------------------------------------------------ texte */

/** Clés dont la valeur est un chemin ou un discriminant, jamais une phrase. */
const CLES_HORS_TEXTE = new Set([
  "photo",
  "photoHero",
  "photoDispositif",
  "problemePhoto",
  "logo",
  "href",
  "lienHref",
  "url",
  "gabarit",
  "type",
  "variante",
]);

/** Le bloc de formulaire et le bloc de navigation d'une fiche de cas. */
const CLES_HORS_SUJET_DU_CAS = new Set([
  "bouton",
  "besoinTitre",
  "besoinProse",
  "besoinTuiles",
  "plusLoin",
]);

function chaines(valeur, cle, exclues) {
  if (typeof valeur === "string") {
    return CLES_HORS_TEXTE.has(cle) || exclues.has(cle) ? [] : [valeur];
  }
  if (Array.isArray(valeur)) return valeur.flatMap((v) => chaines(v, cle, exclues));
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([k, v]) =>
      CLES_HORS_TEXTE.has(k) || exclues.has(k) ? [] : chaines(v, k, exclues),
    );
  }
  return [];
}

/** Texte normalisé du dépôt : sans accent, minuscules, apostrophes unifiées. */
function normalise(texte) {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ");
}

/* ------------------------------------------------------- les critères */

/**
 * Un critère est une expression régulière, ou `{ un: [...] }` (au moins un),
 * ou `{ tous: [...] }` (tous). Il s'évalue sur le texte normalisé d'une fiche.
 */
function satisfait(critere, texte) {
  if (critere instanceof RegExp) return critere.test(texte);
  if (critere.un) return critere.un.some((c) => satisfait(c, texte));
  if (critere.tous) return critere.tous.every((c) => satisfait(c, texte));
  throw new Error(`critère illisible : ${JSON.stringify(critere)}`);
}

/* ------------------------------------------------------------- le lexique */

/*
   LE LEXIQUE EST L'INSTRUMENT DE MESURE, PAS UNE DONNÉE DU SITE. Chaque motif
   reprend le vocabulaire de la page qu'il sert : son slug et son h1, plus les
   mots que ce métier emploie. Un motif qui n'y serait pas justifié mesurerait
   autre chose que la question posée.

   UNE SOUS-PAGE HÉRITE DU SUJET DE SON DOMAINE. `/expertises/robotique/fanuc/`
   exige « robotique », pas le mot « Fanuc » : aucune fiche de cas n'écrit le
   nom d'une marque de robot, et exiger la marque viderait la page sans que ce
   soit la question. Le domaine, lui, est bien le sujet de la page.
*/

const AUTOMATISME = /\b(?:automates?|automatis\w*|automaticiens?|supervision|scada|ihm|siemens|schneider|tia portal)\b/;
const ELECTRIQUE = /\b(?:electricite|electriques?|electrotechni\w*|electromecani\w*|armoires?|cablage|tgbt|haute tension|basse tension)\b/;
const MECANIQUE = /\b(?:mecaniques?|mecaniciens?|roulements?|reducteurs?|engrenages?|paliers?|usinage|alignement|machine-outils?|machines-outils|commande numerique|fraiseuses?|presses?)\b/;
const HYDRAULIQUE = /\b(?:hydrauliques?|verins?)\b/;
const PNEUMATIQUE = /\b(?:pneumatiques?|air comprime|compresseurs?)\b/;
const ROBOTIQUE = /\b(?:robots?|robotis\w*|robotique|cobots?|roboticiens?)\b/;
const SOUDURE = /\b(?:soudure|soudage|soudeurs?|soudees?|soudes?|chaudronn\w*|tig|mig|mag)\b/;
const TUYAUTERIE = /\b(?:tuyauteries?|tuyautage|tuyaux|piping|canalisations?|conduites?|reseaux? de fluides|vannes?|flexibles?)\b/;

const DEPANNAGE = /\b(?:depann\w*|pannes?|defaillances?|urgences?|astreintes?)\b/;

/*
   LES NEUF TYPES DE MAINTENANCE PARTAGENT UNE SEULE EXIGENCE, et c'est une
   décision de mesure, pas un relâchement.

   Les neuf sous-pages de `/expertises/types-de-maintenance/` découpent un même
   métier en préventif, curatif, correctif, palliatif, conditionnel, prédictif,
   prévisionnel, systématique et améliorative. Les fiches de cas, elles,
   n'écrivent que « préventif », « curatif », « dépannage », « diagnostic »,
   « réparation ». Mesuré : JOINT LYONNAIS écrit « les difficultés rencontrées
   ont été palliées » et pas « palliative » ; JTEKT écrit « la fiabilité du parc
   progresse » et pas « améliorative ».

   Exiger le mot exact du titre mesurerait le VOCABULAIRE de la fiche, pas son
   rattachement, et ferait tomber des cas qui sont bel et bien de la
   maintenance. L'exigence est donc la NATURE : le cas doit parler de
   maintenance, d'entretien, de dépannage ou de diagnostic. Elle garde ses
   dents là où la question se pose vraiment : un montage de centre logistique
   ou une construction de site n'est pas de la maintenance, et ne prouve aucun
   de ses neuf types.
*/
/*
   LE BUREAU D'ÉTUDES VA JUSQU'AU MONTAGE, et c'est la page qui le dit : sa
   liste de prestations finit par « Montage et mise en service par nos propres
   équipes techniques », et son h1 est « des études qui tiennent au montage ».
   Un cas de montage y est donc à sa place, au même titre qu'un cas d'étude.
*/
const ETUDES = {
  un: [
    /\b(?:etudes?|conception|concues?|concu|modelisation|cao|schemas?|plans?|nomenclatures?|dimensionnement|calculs?|faisabilite|cahiers? des charges|methodes)\b/,
    /\b(?:cartes? electroniques?|recherche et developpement|r&d)\b/,
    /\bmise en conformite\b/,
    /\b(?:montages?|monteurs?|mise en service|raccordements?)\b/,
  ],
};

const NATURE_MAINTENANCE = {
  un: [
    /\b(?:preventi\w*|curati\w*|correcti\w*|palli\w*|conditionnel\w*|predicti\w*|previsionnel\w*|systematiqu\w*)\b/,
    /\b(?:maintenances?|entretiens?|depann\w*|pannes?|defaillances?|diagnostics?|reparations?|reparer|surveillance)\b/,
    /\b(?:amelior\w*|fiabilit\w*|fiabilis\w*)\b/,
  ],
};

/**
 * Le sujet d'une page, et comment il se prouve dans la fiche d'un cas.
 *
 * `url` vaut pour la page exacte, `prefixe` pour elle et ses sous-pages. La
 * première entrée qui correspond gagne, les entrées exactes étant déclarées
 * avant les préfixes qui les contiennent.
 *
 * `motif: null` = page générique : elle ne vend pas une prestation nommée,
 * aucune exigence n'est opposable à ses cas.
 */
const SUJETS = [
  /* ----------------------------------------- les hubs, génériques et déclarés */
  { url: "/offres/", nom: "hub des offres", motif: null, pourquoi: "h1 « six offres, une seule exigence » : la page présente l'ensemble" },
  { url: "/secteurs/", nom: "hub des secteurs", motif: null, pourquoi: "page de secteurs, pas de prestation nommée" },
  { url: "/entreprise-maintenance-industrielle/", nom: "page entreprise", motif: null, pourquoi: "h1 « Entreprise de maintenance industrielle » : le métier entier" },
  { url: "/offres/full-service/", nom: "full service", motif: null, pourquoi: "h1 « toute votre maintenance, un seul partenaire » : par définition l'ensemble" },
  { url: "/offres/maintenance-externalisee/", nom: "maintenance externalisée", motif: null, pourquoi: "301 déclarée vers /offres/residence/, même promesse d'ensemble" },

  /* ----------------------------------------------------------------- offres */
  {
    prefixe: "/offres/residence/",
    nom: "sous-traitance de maintenance, technicien en résidence",
    motif: {
      un: [
        /\b(?:integres?|integree?s?|integration|renfort\w*|renforc\w*|sous-traitance|long terme|mis a disposition|prestataire)\b/,
        /\bpresence (?:continue|permanente)\b/,
        /\btechniciens? (?:sur site|en poste|dedies?|dedie)\b/,
        /\bequipes? (?:dediee|stable)\b/,
        /\bprise de poste\b/,
      ],
    },
    pourquoi: "h1 « Sous-traitance de maintenance industrielle » : un technicien Migen intégré, en renfort, chez le client",
  },
  {
    url: "/offres/zero-arret/",
    nom: "maintenance hors production",
    /*
       NI « 2x8 » NI « HORAIRES DÉCALÉS » NE PROUVENT ZÉRO ARRÊT, et c'est
       l'inverse : un technicien en 2x8 suit les postes de production, donc il
       intervient PENDANT la production. L'offre promet le contraire.
    */
    motif: { un: [/\bhors production\b/, /\bhors exploitation\b/, /\b(?:samedis?|dimanches?|week-ends?|weekend)\b/, /\b(?:la|de) nuit\b/, /\bnuits\b/, /\bmachines? a l'arret\b/, /\b7 jours sur 7\b/] },
    pourquoi: "h1 « la maintenance qui ne touche jamais à votre production », chapô « l'entretien préventif le samedi, le dépannage la nuit »",
  },
  {
    url: "/offres/arret-technique/",
    nom: "arrêt technique",
    motif: { un: [/\barrets? (?:technique|estival|annuel|programme|planifie|de production)\b/, /\bgrand arret\b/, /\bfenetres? d'arret\b/, /\bperiode d'arret\b/, /\bmachines? a l'arret\b/, /\bconsignations?\b/, /\bredemarrage\b/, /\bcoactivite\b/] },
    pourquoi: "h1 « Arrêt technique », chapô « avant la première consignation […] jusqu'à la date de redémarrage »",
  },
  {
    prefixe: "/offres/depannage-industriel/",
    nom: "dépannage et astreinte",
    motif: DEPANNAGE,
    pourquoi: "slug « depannage-industriel », sous-pages « astreinte » et « panne-machine »",
  },
  {
    prefixe: "/offres/retrofit/",
    nom: "rétrofit, remise en état, mise en conformité",
    /*
       LE VOCABULAIRE EST CELUI DE SES PROPRES PRESTATIONS. La page liste
       « expertise écrite avec photos et mesures, démontage et réparation,
       remontage, réglages, essais en charge, rapport et analyse d'usure,
       peinture, modernisation », et son chapô dit « une machine fatiguée n'est
       pas une machine finie […] pour une fraction du prix du neuf ».
       Exiger le mot « rétrofit » refusait JOINT LYONNAIS, dont la fiche écrit
       « réparer plutôt que remplacer », « 0 machine remplacée », « sans rachat
       de matériel neuf » : c'est le cas le plus proche de cette offre.
    */
    motif: {
      un: [
        /\bretrofit\w*\b/,
        /\bremise en etat\b/,
        /\bremettre en etat\b/,
        /\b(?:modernisation|reconditionn\w*|renovat\w*)\b/,
        /\bmise en conformite\b/,
        /\b(?:migration|migres?)\b/,
        /\b(?:reparations?|reparer|reparees?)\b/,
        /\b(?:demontage|remontage|reglages?|usure)\b/,
        /\bmateriel neuf\b/,
        /\bequipements? en place\b/,
      ],
    },
    pourquoi: "slug « retrofit », h1 « Remise en état machine industrielle », et la liste de prestations de la page",
  },
  {
    prefixe: "/offres/bureau-etudes/",
    nom: "bureau d'études",
    motif: ETUDES,
    pourquoi: "h1 « Bureau d'études industriel : des études qui tiennent au montage », prestations jusqu'au montage et à la mise en service",
  },
  {
    prefixe: "/bureau-etudes/",
    nom: "bureau d'études (adresse détournée par la maquette vers /offres/bureau-etudes/)",
    motif: ETUDES,
    pourquoi: "même page que /offres/bureau-etudes/, servie sous deux adresses",
  },
  {
    url: "/offres/audit-conseil-maintenance/",
    nom: "audit et conseil de maintenance",
    motif: { un: [/\baudits?\b/, /\bdiagnostics?\b/, /\bconseil\b/, /\bsolutions? chiffrees?\b/, /\bpropositions? techniques?\b/, ETUDES] },
    pourquoi: "slug « audit-conseil-maintenance »",
  },
  {
    url: "/offres/chantier/demenagement-machines/",
    nom: "déménagement de machines",
    motif: { un: [/\bdemenagement\b/, /\btransferts?\b/, /\bdeplacements? de machines?\b/, /\bdeplacer\b/, /\b(?:depose|repose|demontage|remontage)\b/, /\bmigration\b/, /\b(?:consignations?|conditionnement de machines|manutention|transport)\b/, /\bremise en service\b/] },
    pourquoi: "h1 « Déménagement de machines industrielles », prestations « consignation et repérage, démontage, manutention lourde et transport, remontage, remise en service »",
  },
  {
    url: "/offres/chantier/transfert-de-production/",
    nom: "transfert de production",
    motif: { un: [/\btransferts?\b/, /\bdemenagement\b/, /\bnouveau (?:site|centre)\b/, /\btransposes?\b/, /\bmise en production\b/, /\bdemarrage\b/, /\bmigration\b/, /\bmontee en cadence\b/, /\bphasage\b/] },
    pourquoi: "h1 « Transfert de production », prestations « plan de transfert et phasage, préparation du site d'arrivée, montée en cadence accompagnée »",
  },
  {
    prefixe: "/offres/chantier/",
    nom: "travaux de chantier",
    motif: { un: [/\bchantiers?\b/, /\bmontages?\b/, /\bmonteurs?\b/, /\bconstruction\b/, /\btravaux\b/, /\blevage\b/] },
    pourquoi: "slug « chantier », adresse détournée par la maquette vers /travaux-industriels/",
  },
  {
    url: "/offres/construction/",
    nom: "construction industrielle",
    motif: { un: [/\bconstruction\b/, /\bchantiers?\b/, /\bmontages?\b/, /\bmonteurs?\b/, /\btravaux\b/, /\bnouveau site\b/] },
    pourquoi: "slug « construction », adresse détournée par la maquette vers /travaux-industriels/",
  },

  /* --------------------------------------------------- travaux industriels */
  {
    url: "/travaux-industriels/montage-industriel/",
    nom: "montage industriel",
    motif: { un: [/\bmontages?\b/, /\bmonteurs?\b/, /\bmonter\b/, /\bmontes?\b/, /\bassemblage\b/, /\binstallations?\b/, /\bmise en (?:service|production)\b/, /\braccordements?\b/, /\b(?:scellements?|calage|implantation)\b/, /\b(?:essais|demarrage)\b/] },
    pourquoi: "h1 « Montage industriel », prestations « assemblage mécanique, calage, raccordements, essais et accompagnement du démarrage »",
  },
  {
    url: "/travaux-industriels/levage-manutention/",
    nom: "levage et manutention lourde",
    motif: { un: [/\blevage\b/, /\bengins? de levage\b/, /\bgrues?\b/, /\bportiques?\b/, /\bmanutention\b/, /\belingage\b/, /\bponts? roulants?\b/, /\bcalage\b/] },
    pourquoi: "h1 « Levage industriel et manutention lourde », prestations « élingage, manutention en atelier, mise en position et calage »",
  },
  {
    url: "/travaux-industriels/transfert-industriel/",
    nom: "transfert industriel",
    motif: { un: [/\btransferts?\b/, /\bdemenagement\b/, /\bdeplacements? de machines?\b/, /\bdeplacer\b/, /\bdepose\b/, /\brepose\b/, /\bmigration\b/, /\bmigres?\b/, /\bnouveau site\b/, /\btransposes?\b/] },
    pourquoi: "h1 « Transfert industriel et déménagement de machines industrielles »",
  },
  {
    url: "/travaux-industriels/demantelement-industriel/",
    nom: "démantèlement industriel",
    motif: { un: [/\bdemantel\w*\b/, /\bdemontages?\b/, /\bdemonter\b/, /\bdesinstall\w*\b/, /\bdepose\b/, /\b(?:decoupe|evacuation|dechets|vidanges?|purges?)\b/] },
    pourquoi: "h1 « Démantèlement industriel », prestations « vidanges et purges avant dépose, démontage, dépose de réseaux, découpe et évacuation, tri des déchets »",
  },
  {
    prefixe: "/travaux-industriels/",
    nom: "travaux industriels",
    motif: { un: [/\btransferts?\b/, /\bdemantel\w*\b/, /\bmontages?\b/, /\bmonteurs?\b/, /\blevage\b/, /\bmanutention\b/, /\bchantiers?\b/, /\bdemenagement\b/] },
    pourquoi: "h1 « Travaux industriels : transfert, démantèlement, montage, levage »",
  },

  /* ---------------------------------------------------------- expertises */
  { prefixe: "/expertises/automatisme/", nom: "automatisme", motif: AUTOMATISME, pourquoi: "h1 « Automatisme industriel : quand l'automate se tait… »" },
  { prefixe: "/expertises/electromecanique/", nom: "électromécanique", motif: { un: [/\belectromecani\w*\b/, { tous: [ELECTRIQUE, MECANIQUE] }] }, pourquoi: "h1 « un seul technicien quand la panne est électrique ET mécanique »" },
  { prefixe: "/expertises/electrique/", nom: "électricité industrielle", motif: ELECTRIQUE, pourquoi: "h1 « Maintenance électrique industrielle : le défaut trouvé avant qu'il ne coupe la ligne »" },
  { prefixe: "/expertises/hydraulique/", nom: "hydraulique", motif: HYDRAULIQUE, pourquoi: "h1 « Maintenance hydraulique », sous-page « réparation vérin hydraulique »" },
  { prefixe: "/expertises/pneumatique/", nom: "pneumatique", motif: PNEUMATIQUE, pourquoi: "h1 « Maintenance pneumatique : une fuite d'air coûte en continu »" },
  { prefixe: "/expertises/robotique/", nom: "robotique", motif: ROBOTIQUE, pourquoi: "h1 « Maintenance robotique : un robot arrêté, c'est toute la cellule qui attend »" },
  { prefixe: "/expertises/soudure/", nom: "soudure", motif: SOUDURE, pourquoi: "h1 « Soudure industrielle : une reprise qui tient, du premier coup »" },
  { prefixe: "/expertises/tuyauterie/", nom: "tuyauterie", motif: TUYAUTERIE, pourquoi: "h1 « Maintenance tuyauterie industrielle : un réseau ne fuit jamais au bon moment »" },
  { prefixe: "/expertises/mecanique/", nom: "mécanique", motif: MECANIQUE, pourquoi: "h1 « Maintenance mécanique : un roulement qui chauffe ne prévient qu'une fois »" },
  {
    prefixe: "/expertises/specialisations-constructeur/",
    nom: "parc multimarques",
    /*
       LE SUJET DE CETTE PAGE EST L'AUTOMATISME, pas la possession de plusieurs
       marques. Ses prestations énumèrent Siemens, Schneider, Allen Bradley, la
       robotique, les machines spéciales et la commande numérique, les API, les
       variateurs et les pupitres. Exiger le mot « multimarques » refusait
       MERSEN (« un automaticien SIEMENS pour démarrer une ligne neuve »), qui
       est exactement le métier de la page.
    */
    motif: { un: [AUTOMATISME, /\bmultimarques?\b/, /\bplusieurs (?:marques|automates)\b/, /\bparc (?:machines )?heterogene\b/, /\btechnologies (?:tres )?differentes\b/, /\bcommande numerique\b/, /\bmachines speciales\b/] },
    pourquoi: "h1 « Automaticien industriel multimarques : plusieurs automates, une seule équipe », et la liste de prestations de la page",
  },

  /* -------------------------------------- expertises, types de maintenance */
  /*
     Les dix pages (le domaine et ses neuf types) partagent NATURE_MAINTENANCE,
     pour la raison écrite au-dessus de cette constante : le mot exact du titre
     mesurerait le vocabulaire de la fiche, pas son rattachement.
  */
  { prefixe: "/expertises/types-de-maintenance/", nom: "maintenance (un de ses types)", motif: NATURE_MAINTENANCE, pourquoi: "h1 du domaine « réparer, prévoir ou prédire, le bon choix pour chaque machine » ; voir la note de NATURE_MAINTENANCE" },
];

/** Le sujet d'une URL, ou `undefined` si la page n'est pas dans le champ. */
function sujetDe(url) {
  for (const s of SUJETS) {
    if (s.url && s.url === url) return s;
    if (s.prefixe && url.startsWith(s.prefixe)) return s;
  }
  return undefined;
}

/* -------------------------------------------------------------- le corpus */

/** Toutes les fiches du relais, indexées par URL. */
function litCorpus() {
  const fiches = new Map();
  for (const nom of readdirSync(DOSSIER).sort()) {
    if (!nom.endsWith(".json")) continue;
    const fiche = JSON.parse(readFileSync(join(DOSSIER, nom), "utf8"));
    if (!fiche?.url) continue;
    fiches.set(fiche.url, { ...fiche, _fichier: nom });
  }
  return fiches;
}

/** Les cas : URL vers { fichier, texte propre normalisé, offreDeclaree }. */
function litCas(fiches) {
  const cas = new Map();
  for (const [url, fiche] of fiches) {
    if (fiche.contenu?.gabarit !== "etude-de-cas") continue;
    const carteOffre = (fiche.contenu.plusLoin ?? []).find(
      (c) => normalise(String(c.surtitre ?? "")).trim() === "offre",
    );
    cas.set(url, {
      fichier: fiche._fichier,
      client: fiche.contenu.client ?? "",
      h1: fiche.titre_h1 ?? "",
      texte: normalise(chaines(fiche, undefined, CLES_HORS_SUJET_DU_CAS).join(" \n ")),
      offreDeclaree: carteOffre?.href,
    });
  }
  return cas;
}

/** Les citations d'une page : [{ rang, cible, sansLien }]. */
function citations(fiche) {
  const sections = Array.isArray(fiche.contenu?.sections) ? fiche.contenu.sections : [];
  const sortie = [];
  for (const section of sections) {
    if (section?.type !== "preuves") continue;
    for (const carte of section.preuves ?? []) {
      const direct = typeof carte.lienHref === "string" ? carte.lienHref : undefined;
      if (direct) {
        sortie.push({ rang: sortie.length + 1, cible: direct, sansLien: false });
        continue;
      }
      // Les deux fiches détournées écrivent leur lien en markdown dans `titre`.
      const markdown = /\]\((\/preuves\/[^)]+\/)\)/.exec(String(carte.titre ?? ""));
      sortie.push({ rang: sortie.length + 1, cible: markdown?.[1], sansLien: true });
    }
  }
  return sortie;
}

/* -------------------------------------------------------------- la mesure */

/**
 * Les manquements du corpus. Liste vide = la porte passe.
 * `etat` porte aussi ce qui est signalé sans être compté.
 */
function mesure(fiches) {
  const cas = litCas(fiches);
  const manquements = [];
  const etat = {
    pagesMesurees: 0,
    citationsMesurees: 0,
    citationsConformes: [],
    pagesGeneriques: [],
    cartesSansLien: [],
    casSansOffreDeclaree: [],
    casMesures: 0,
    nombreDeCas: cas.size,
  };

  /* ---------------------------------------- axe 1 : la page vers ses cas */
  for (const [url, fiche] of fiches) {
    const liste = citations(fiche);
    if (liste.length === 0) continue;
    const sujet = sujetDe(url);
    if (!sujet) continue;

    if (sujet.motif === null) {
      etat.pagesGeneriques.push({ url, nom: sujet.nom, cas: liste.length });
      continue;
    }
    etat.pagesMesurees += 1;

    for (const citation of liste) {
      if (citation.sansLien) {
        etat.cartesSansLien.push({ url, rang: citation.rang, cible: citation.cible });
        continue;
      }
      etat.citationsMesurees += 1;
      const ficheCas = cas.get(citation.cible);
      if (!ficheCas) {
        manquements.push({
          genre: "cas-inconnu",
          texte: `${url} rang ${citation.rang} : ${citation.cible} n'a pas de fiche dans le relais`,
        });
        continue;
      }
      if (!satisfait(sujet.motif, ficheCas.texte)) {
        manquements.push({
          genre: "hors-sujet",
          page: url,
          cas: citation.cible,
          texte: `${url} rang ${citation.rang} : ${citation.cible} ne parle pas de « ${sujet.nom} » dans sa propre fiche (${ficheCas.fichier})`,
        });
      } else {
        etat.citationsConformes.push(`${url} rang ${citation.rang} : ${citation.cible}`);
      }
    }
  }

  /* ------------------------------------- axe 2 : le cas vers son offre */
  for (const [url, ficheCas] of cas) {
    if (!ficheCas.offreDeclaree) {
      etat.casSansOffreDeclaree.push(url);
      continue;
    }
    etat.casMesures += 1;
    const sujet = sujetDe(ficheCas.offreDeclaree);
    if (!sujet) {
      manquements.push({
        genre: "offre-du-cas-inconnue",
        texte: `${url} : sa carte « Offre » vise ${ficheCas.offreDeclaree}, qui n'est pas une page d'offre connue du lexique`,
      });
      continue;
    }
    if (sujet.motif === null) continue;
    if (!satisfait(sujet.motif, ficheCas.texte)) {
      manquements.push({
        genre: "offre-du-cas-hors-sujet",
        cas: url,
        page: ficheCas.offreDeclaree,
        texte: `${url} : sa carte « Offre » vise ${ficheCas.offreDeclaree} (« ${sujet.nom} »), sujet absent de sa propre fiche (${ficheCas.fichier})`,
      });
    }
  }

  return { manquements, etat };
}

/* -------------------------------------------------------------- l'affiche */

const args = process.argv.slice(2);
const controle = args.includes("--controle");
const detail = args.includes("--detail");

const fiches = litCorpus();

if (!controle) {
  const { manquements, etat } = mesure(fiches);

  console.log(`relais lu : ${fiches.size} fiches, dont ${etat.nombreDeCas} études de cas`);
  console.log(`axe 1 : ${etat.pagesMesurees} pages d'offre ou d'expertise mesurées, ${etat.citationsMesurees} citations`);
  console.log(`axe 2 : ${etat.casMesures} cas déclarent une offre, ${etat.casSansOffreDeclaree.length} n'en déclarent aucune`);
  console.log("");

  if (etat.pagesGeneriques.length) {
    console.log("PAGES GÉNÉRIQUES, aucune exigence opposable (déclaré) :");
    for (const p of etat.pagesGeneriques) console.log(`  · ${p.url} (${p.nom}), ${p.cas} cas cités`);
    console.log("");
  }
  if (etat.cartesSansLien.length) {
    console.log("CARTES SANS lienHref, écartées au rendu par ReferencesOffre.tsx (déclaré) :");
    for (const c of etat.cartesSansLien) console.log(`  · ${c.url} rang ${c.rang} → ${c.cible ?? "aucune cible lisible"}`);
    console.log("");
  }
  if (detail) {
    console.log(`CITATIONS CONFORMES (${etat.citationsConformes.length}) :`);
    for (const c of etat.citationsConformes) console.log(`  ok ${c}`);
    console.log("");
    console.log(`CAS SANS CARTE « OFFRE » (${etat.casSansOffreDeclaree.length}), rien à inventer :`);
    for (const c of etat.casSansOffreDeclaree) console.log(`  -  ${c}`);
    console.log("");
  }

  if (manquements.length === 0) {
    console.log("PORTE VERTE : aucun cas cité hors de son sujet.");
    process.exit(0);
  }

  const parGenre = new Map();
  for (const m of manquements) parGenre.set(m.genre, (parGenre.get(m.genre) ?? 0) + 1);

  console.error(`PORTE ROUGE : ${manquements.length} manquement(s)`);
  for (const [genre, n] of parGenre) console.error(`  ${genre} : ${n}`);
  console.error("");
  let pageCourante = "";
  for (const m of manquements) {
    const page = m.page ?? m.cas ?? "";
    if (page !== pageCourante) {
      pageCourante = page;
      console.error("");
    }
    console.error(`  · ${m.texte}`);
  }
  process.exit(1);
}

/* --------------------------------------------------------------- témoin */

/** Copie profonde d'une fiche, pour injecter une faute sans toucher le disque. */
const copie = (v) => JSON.parse(JSON.stringify(v));

/** Le corpus avec une fiche remplacée. */
function corpusAvec(url, fiche) {
  const suite = new Map(fiches);
  suite.set(url, fiche);
  return suite;
}

const avant = mesure(fiches);
const compte = (c) => mesure(c).manquements.length;
const reference = avant.manquements.length;

/*
   CONTRÔLE NÉGATIF. On mesure UNE citation que la porte accepte, seule, sur un
   corpus réduit à sa page et à son cas. Si elle signalait quand même quelque
   chose, la porte refuserait tout et son zéro ne voudrait rien dire.
*/
const premiereConforme = avant.etat.citationsConformes[0];
if (!premiereConforme) {
  console.error("TÉMOIN INUTILISABLE : aucune citation conforme dans le corpus, la porte");
  console.error("ne peut pas prouver qu'elle sait accepter.");
  process.exit(1);
}
{
  const [pageUrl] = premiereConforme.split(" rang ");
  const casUrl = premiereConforme.slice(premiereConforme.lastIndexOf(": ") + 2);
  const pageSeule = copie(fiches.get(pageUrl));
  // On ne garde que la citation conforme dans la section preuves.
  for (const section of pageSeule.contenu.sections ?? []) {
    if (section.type !== "preuves") continue;
    section.preuves = (section.preuves ?? []).filter((c) => c.lienHref === casUrl);
  }
  const reduit = new Map([
    [pageUrl, pageSeule],
    [casUrl, copie(fiches.get(casUrl))],
  ]);
  const n = compte(reduit);
  if (n !== 0) {
    console.error(`TÉMOIN INUTILISABLE : la citation conforme ${premiereConforme} compte ${n} manquement(s) une fois isolée.`);
    process.exit(1);
  }
  console.log(`contrôle négatif : ${premiereConforme} acceptée seule, 0 manquement`);
}

/* Les fautes injectées. Chacune doit faire monter le compte. */
const cas = litCas(fiches);
const casUrls = [...cas.keys()].sort();

/** Le premier couple (page mesurée, cas) dont le cas NE PORTE PAS le sujet. */
function coupleHorsSujet() {
  for (const s of SUJETS) {
    if (s.motif === null) continue;
    const pageUrl = s.url ?? [...fiches.keys()].find((u) => u.startsWith(s.prefixe));
    if (!pageUrl || !fiches.has(pageUrl)) continue;
    if (citations(fiches.get(pageUrl)).length === 0) continue;
    const vise = casUrls.find((u) => !satisfait(s.motif, cas.get(u).texte));
    if (vise) return { pageUrl, casUrl: vise, sujet: s };
  }
  return undefined;
}

const couple = coupleHorsSujet();
if (!couple) {
  console.error("TÉMOIN IMPOSSIBLE : aucun couple (page, cas) hors sujet à injecter.");
  process.exit(1);
}

const FAUTES = [
  {
    nom: `un cas hors sujet est cité sur ${couple.pageUrl} (${couple.casUrl})`,
    corpus: () => {
      const page = copie(fiches.get(couple.pageUrl));
      const section = (page.contenu.sections ?? []).find((s) => s.type === "preuves");
      section.preuves.push({ titre: "témoin", lienHref: couple.casUrl });
      return corpusAvec(couple.pageUrl, page);
    },
  },
  {
    nom: "la fiche d'un cas cité perd son texte",
    corpus: () => {
      const premier = avant.etat.citationsConformes[0];
      const casUrl = premier.slice(premier.lastIndexOf(": ") + 2);
      const fiche = copie(fiches.get(casUrl));
      fiche.titre_h1 = "";
      fiche.seo = {};
      fiche.contenu = { gabarit: "etude-de-cas", client: fiche.contenu.client, plusLoin: fiche.contenu.plusLoin ?? [] };
      return corpusAvec(casUrl, fiche);
    },
  },
  {
    nom: "une carte vise un cas qui n'a pas de fiche",
    corpus: () => {
      const page = copie(fiches.get(couple.pageUrl));
      const section = (page.contenu.sections ?? []).find((s) => s.type === "preuves");
      section.preuves.push({ titre: "témoin", lienHref: "/preuves/ce-cas-n-existe-pas/" });
      return corpusAvec(couple.pageUrl, page);
    },
  },
  {
    nom: "la carte « Offre » d'un cas vise une offre dont il ne parle pas",
    corpus: () => {
      const vise = casUrls.find((u) => !satisfait(couple.sujet.motif, cas.get(u).texte));
      const fiche = copie(fiches.get(vise));
      fiche.contenu.plusLoin = [
        ...(fiche.contenu.plusLoin ?? []).filter((c) => normalise(String(c.surtitre ?? "")).trim() !== "offre"),
        { surtitre: "Offre", titre: "témoin", href: couple.pageUrl },
      ];
      return corpusAvec(vise, fiche);
    },
  },
  {
    nom: "la carte « Offre » d'un cas vise une adresse hors lexique",
    corpus: () => {
      const vise = casUrls[0];
      const fiche = copie(fiches.get(vise));
      fiche.contenu.plusLoin = [
        ...(fiche.contenu.plusLoin ?? []).filter((c) => normalise(String(c.surtitre ?? "")).trim() !== "offre"),
        { surtitre: "Offre", titre: "témoin", href: "/offres/offre-inventee/" },
      ];
      return corpusAvec(vise, fiche);
    },
  },
];

let vues = 0;
for (const faute of FAUTES) {
  const apres = compte(faute.corpus());
  if (apres <= reference) {
    console.error(`FAUTE NON VUE : ${faute.nom} (${reference} manquement(s) avant, ${apres} après)`);
    process.exit(1);
  }
  vues += 1;
  console.log(`faute vue (${vues}/${FAUTES.length}) : ${faute.nom} → ${apres} au lieu de ${reference}`);
}

console.log(`TÉMOIN COMPLET : 1 contrôle négatif, ${vues}/${FAUTES.length} fautes vues.`);
console.log(`état du corpus au moment du témoin : ${reference} manquement(s).`);
