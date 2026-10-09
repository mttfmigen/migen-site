/**
 * Les écarts de copie à la maquette DÉCIDÉS par Mehdi, en un seul endroit.
 *
 * La maquette fait foi mot pour mot, sauf pour ces phrases-là. Les fiches les
 * portent déjà corrigées ; les contrôles appliquent `appliqueDecisions` au texte
 * de la capture avant de le comparer au rendu, pour que la décision soit
 * vérifiée des deux côtés au lieu d'être déclarée page par page.
 *
 * 08/10, « 10 % des techniciens » : le README de passation dit « seuls 10 % des
 * techniciens réussissent notre process de sélection… Ne pas parler de
 * candidats ». Seule l'affirmation de la sélection change : « candidats » reste
 * là où il désigne celui qui postule (pages métier), un soumissionnaire (cahier
 * des charges) ou le marché de l'emploi.
 *
 * 07/10, « le siège est à Écully » : la maquette le place encore à Limonest.
 * Seule la mention de Limonest change ; « siège à Lyon », « siège lyonnais »
 * restent, Écully étant dans la métropole lyonnaise et Lyon l'agence du siège
 * selon le README.
 */

type Regle = [RegExp, (...groupes: string[]) => string];

const SELECTION: Regle[] = [
  [/\b([Cc])andidats(\s+(?:sont\s+)?retenus)\b/g, (_, c, fin) => `${c === "C" ? "T" : "t"}echniciens${fin}`],
  [/\b(\d+\s?%\s+des\s+)candidats\b/g, (_, debut) => `${debut}techniciens`],
  [/\b(Des\s+)candidats(\s+franchissent)\b/g, (_, debut, fin) => `${debut}techniciens${fin}`],
  [/\b(un\s+)candidat(\s+(?:retenu\s+)?sur\s+dix)/g, (_, debut, fin) => `${debut}technicien${fin}`],
  // « chaque candidat » seulement quand la même proposition parle de la sélection.
  [/\b([Cc]haque\s+)candidat\b(?=[^.;]*?(?:10\s?%|retenu|sélection|évalu|entretien|épreuve))/g, (_, debut) => `${debut}technicien`],
];

/* 09/10, LE SIÈGE REVIENT À LIMONEST, L'AGENCE RESTE À ÉCULLY.
   Décision de Mehdi, qui RENVERSE celle du 07/10 et donne raison à l'audit de
   Nathan du 09/10 (« le siège à Écully au lieu de Limonest »).

   Le 07/10, sept règles réécrivaient ici « Limonest » en « Écully » sur tout le
   site, pied de page compris. Elles sont retirées : la maquette écrit
   elle-même « Siège, 1 rue des Vergers, 69760 Limonest » sur 96 de ses 244
   captures, et « Lyon — Siège · Limonest et Écully » sur la page Équipe.
   Revenir à Limonest, c'est donc revenir à la maquette, pas s'en écarter, et
   c'est pour cela qu'il n'y a plus aucune règle à appliquer : le texte de la
   capture passe tel quel.

   Ce qui reste à la main, parce que la maquette ne le dit nulle part : Écully
   n'est plus « le siège » mais « l'agence ». Les trois endroits concernés sont
   le pied de page, la liste des agences de la page Contact et la politique de
   confidentialité, tous trois sans capture de maquette pour cette partie. */
const SIEGE: Regle[] = [
  /* LA SEULE RÈGLE QUI RESTE, et c'est que LA MAQUETTE SE CONTREDIT. Son pied
     de page écrit « Siège, 1 rue des Vergers, 69760 Limonest » sur 96 captures,
     mais le bloc « Nos informations pratiques » de /carriere/ écrit « Siège,
     Chemin du Moulin Carron, bâtiment principal, 69130 Écully ». Les deux ne
     peuvent pas être vrais. La décision du 09/10 tranche pour Limonest, donc
     cette seule phrase est réécrite avant comparaison. */
  [
    /Chemin du Moulin Carron, bâtiment principal, 69130 Écully, près de Lyon\./g,
    () => "1 rue des Vergers, 69760 Limonest, près de Lyon.",
  ],
];

/* 08/10, LES PHOTOS DE VILLE SOUS LICENCE. Décision de Mehdi, portée au relais :
   « Photos de ville : versions sous licence Envato » et « vider hubLocal.credit,
   le badge Aperçu Envato n'a plus lieu d'être ». La maquette sert les aperçus
   d'Envato, 600 px, filigranés, chargés depuis le CDN d'Envato, et les
   accompagne d'un badge de crédit qui n'existe que parce que l'image n'est pas
   sous licence. Les versions achetées sont dans `public/assets/villes/`, le
   badge disparaît avec l'aperçu, et la capture doit donc perdre les deux avant
   d'être comparée au rendu. */
const PHOTOS_VILLE: Regle[] = [
  [/Aperçu Envato\s*·\s*/g, () => ""],
  [/Lyon city in France · RossHelen/g, () => ""],
  [/La Défense · RossHelen/g, () => ""],
  [/Marseille Vieux-Port · sam741002/g, () => ""],
  [/Bridges of Strasbourg · Givaga/g, () => ""],
  [/Nantes city in France · RossHelen/g, () => ""],
  [/Bordeaux city in France · RossHelen/g, () => ""],
  [/Rouen · RossHelen/g, () => ""],
  [/Orléans · RossHelen/g, () => ""],
  [/Quimper · Unai82/g, () => ""],
  [/Vannes · Unai82/g, () => ""],
  [/Port à conteneurs · nikonlamp/g, () => ""],
  [/Port et centrale · IndustryAndTravel/g, () => ""],
];

/* 08/10, LE TÉLÉPHONE RENDU À SES PHRASES. ÉCART À FAIRE CONFIRMER PAR MEHDI.
   La maquette écrit « Pour nous joindre : , du lundi au vendredi… » et
   « …de 8h00 à 18h30 : . L'astreinte… » : elle perd le 04 78 33 72 05 que SON
   PROPRE corpus écrit à cet endroit (`implantations--toulouse--gironde.md`
   l.13). Un deux-points qui s'ouvre sur une virgule n'est pas une typographie,
   c'est un trou, et le corpus dit ce qui y manquait. Vingt champs ont donc été
   restaurés le 08/10, dont dix-sept redonnent la ligne de corpus à la lettre.
   Le site s'écarte ici de sa maquette EN CONNAISSANCE DE CAUSE. Si Mehdi
   tranche que la maquette fait foi jusque-là, il faut retirer les vingt numéros
   et supprimer cette règle. Tant qu'elle est là, la capture reçoit le numéro
   avant d'être comparée, et `scripts/verifie-phrases-estropiees.mjs` continue
   de refuser la forme trouée pour qu'un retour en arrière se voie. */
const TELEPHONE: Regle[] = [[/:\s+(?=[,.])/g, () => ": 04 78 33 72 05"]];

/* 09/10, ORTHUS DEVIENT MIGEN TRAVAUX. Décision de Mehdi : « Orthus = Migen
   travaux et bureau d'études ». L'audit de Nathan du 09/10 signalait que le nom
   était encore là malgré sa décision du 06/10, et qu'il était qualifié
   « filiale » sur une page et « marque sœur créée en 2024 » sur une autre.

   C'est un ÉCART ASSUMÉ À LA MAQUETTE : elle porte Orthus sur 22 de ses 244
   captures, 60 occurrences, menu et frise comprises. Les règles transforment
   donc la capture avant comparaison, pour que la décision soit vérifiée des
   deux côtés au lieu d'être déclarée page par page.

   Les formes longues passent AVANT la forme nue, sans quoi « Orthus, filiale du
   groupe Migen » deviendrait « Migen Travaux, filiale du groupe Migen ». */
const ORTHUS: Regle[] = [
  [/\bOrthus, filiale du groupe Migen\b/g, () => "Migen Travaux"],
  [/\bOrthus, filiale Migen\b/g, () => "Migen Travaux"],
  [/\bOrthus, filiale du groupe\b/g, () => "Migen Travaux"],
  [/\bOrthus, marque sœur créée en 2024 par le groupe, qui partage/g, () => "Migen Travaux, qui partage"],
  [/\bL'équipe Orthus\b/g, () => "L'équipe Migen Travaux"],
  [/\bUne équipe Orthus\b/g, () => "Une équipe Migen Travaux"],
  [/\bORTHUS\b/g, () => "Migen Travaux"],
  [/\bOrthus\b/g, () => "Migen Travaux"],
];

/* 09/10, LE MARKDOWN NE S'AFFICHE PLUS. Écart assumé à la maquette, déclaré
   ici parce qu'il touche la copie de tout le site, MAIS SANS RÈGLE DE
   RÉÉCRITURE, et c'est volontaire. Lire ce qui suit avant d'en ajouter une.

   LE DÉFAUT, mesuré le 09/10 en balayant les 248 pages servies : 26 chaînes de
   Markdown visibles sur 12 pages, identiques en local et en production, comme
   l'audit de Nathan Jorez le signalait. Quatre causes, toutes dans des
   composants, aucune dans la donnée :
     ·  5  les réponses de FAQ rendues telles quelles (`offres/QuestionsPhoto`
           pour quatre, `implantation/QuestionsVille` pour une) ;
     ·  1  le complément de carte d'offre (`offre/PointsOffre`) ;
     ·  8  le texte des cartes de référence (`offre/ReferencesOffre`), doublé
           d'un préfixe de lien en trop dans deux fiches ;
     · 12  le gras qui contient un lien (`ressource/CorpsRessource`), dont le
           motif ne redescendait pas dans son contenu.

   C'EST BIEN UN ÉCART : la maquette affiche elle-même ces crochets. Son rendu
   figé écrit « ✓ Le [dépannage industriel](/offres/depannage-industriel/) pour
   l'imprévu » (`maquette/rendu/ressources--articles--plan-de-maintenance.html`)
   et « [Étude de cas ORTHUS x ECOCEM : nouveau site](/preuves/orthus-ecocem/)
   · … » sur ses cartes de `/bureau-etudes/`. Son `segs()` a exactement le
   défaut que le nôtre avait. Nous nous en écartons sur la foi de l'audit : les
   MOTS et le dessin restent ceux de la capture, seule la syntaxe disparaît, et
   les 26 liens du cocon qu'elle emprisonnait redeviennent cliquables.

   POURQUOI PAS UNE RÈGLE ICI, et c'est le point à ne pas oublier :
   `scripts/applique-decisions-copie.ts` passe `appliqueDecisions` sur CHAQUE
   chaîne de CHAQUE fiche. Une règle qui retire le Markdown y effacerait les
   quelque 1 800 chaînes balisées des fiches, dont les ~600 liens internes qui
   sont la raison d'être du cocon. La décision ne peut donc pas vivre en
   réécriture de donnée : elle vit dans le RENDU.

   OÙ ELLE EST TENUE, ET VÉRIFIÉE :
     · `blocs/TexteRiche.tsx` rend le balisage (et `enTexteNu` le réduit à ses
       mots là où un lien est impossible, la carte étant déjà un `<Link>`) ;
     · `components/site/verification-markdown-brut.tsx` (`bun run
       verifie:markdown`) refuse qu'un des six composants le rende brut, et ses
       six régressions ont été remises une à une pour la voir échouer ;
     · `ressource/verification-ressource.tsx` a dû être RETOURNÉE : elle
       comparait la syntaxe de la capture, elle compare maintenant les mots, et
       refuse en plus tout Markdown dans le rendu. Elle échoue toujours sur un
       mot changé, la preuve a été faite. */

/* 09/10, LE META-TEXTE DU CORPUS. Mehdi : « sur les business case y'a du texte
   ça va pas, ça ne veut rien dire ». Exemple relevé sur
   /preuves/danone-lignes-de-production/ : « Ce que Blédina retire de la
   collaboration, tel que le site le formule : ». C'est une note de rédaction
   restée dans le corpus, et la maquette la rend telle quelle : la retirer est
   donc un écart déclaré, pas une correction de portage. Un visiteur n'a que
   faire de savoir « tel que le site le formule ». */
const META_REDACTION: Regle[] = [
  [/,?\s*tel que le site le formule\s*:/g, () => " :"],
  [/\s*tel que le site le formule\s*/g, () => " "],
];

const REGLES = [...SELECTION, ...SIEGE, ...PHOTOS_VILLE, ...TELEPHONE, ...ORTHUS, ...META_REDACTION];

/** Le texte tel que le site doit le rendre, à partir de celui de la maquette. */
export function appliqueDecisions(texte: string): string {
  return REGLES.reduce((t, [motif, vers]) => t.replace(motif, vers), texte);
}

/** Les mots du contrat que le site ne rend jamais (voir scripts/verifie-interdits.mjs). */
const INTERDITS =
  /sans\s+engagement|\br[ée]gie\b|sur[\s-]mesure|int[ée]rim|mise\s+[àa]\s+disposition|cl[ée]\s+en\s+main|\bagences?\s+en\s+France|\b24\s*h\b|\b24\s*\/\s*(?:24|7)\b|\b7\s*j?\s*\/\s*7\b|\u2014/i;

/**
 * Pour un texte qui ne vient pas d'une capture (la table `seo` de la base) :
 * les décisions, puis chaque phrase qui porte un interdit retirée entière.
 */
export function copieConforme(texte: string): string {
  return (appliqueDecisions(texte).match(/[^.!?]+(?:[.!?]+|$)\s*/g) ?? [])
    .filter((phrase) => !INTERDITS.test(phrase))
    .join("")
    .trim();
}
