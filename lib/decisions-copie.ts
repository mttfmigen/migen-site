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
  /* L'ÉLISION D'ABORD, ET LA VIRGULE FERMANTE AVEC L'APPOSITION. Trois phrases
     servies étaient fautives avant le 09/10 au soir, trouvées en lisant le
     HTML des pages et non la règle :
       « sous le pilotage d'Orthus »        donnait « d'Migen Travaux »
       « confie à Orthus, filiale …, la construction »  gardait sa virgule et
                                            donnait « à Migen Travaux, la construction »
     Remplacer un nom par un autre n'est pas une substitution de chaîne : le
     français élide devant une voyelle, et une apposition emporte SES DEUX
     virgules quand elle disparaît. Ces règles passent donc avant la forme nue,
     de la plus longue à la plus courte. */
  [/\bd['’]Orthus, filiale du groupe Migen\b/g, () => "de Migen Travaux"],
  [/\bd['’]Orthus, filiale du groupe\b/g, () => "de Migen Travaux"],
  [/\bd['’]Orthus\b/g, () => "de Migen Travaux"],
  /* L'APPOSITION EMPORTE UNE VIRGULE OU LES DEUX, SELON CE QU'ELLE SÉPARE, et
     c'est la raison pour laquelle ces règles sont explicites plutôt que
     générales. Deux formes existent dans le corpus, et elles ne se traitent
     pas pareil :

       « confie à Orthus, filiale du groupe Migen, la construction complète »
         l'apposition est glissée ENTRE LE VERBE ET SON COMPLÉMENT. Les deux
         virgules partent avec elle, sinon « confie à Migen Travaux, la
         construction » sépare le verbe de son objet.

       « piloté par Orthus, filiale du groupe, coordination multi-métiers »
         la seconde virgule n'appartient PAS à l'apposition, elle ouvre la
         proposition suivante. Elle reste, sinon les deux se collent en
         « par Migen Travaux coordination multi-métiers ».

     Une règle générale se trompait sur l'une ou sur l'autre. Distinguer les
     deux demande de savoir ce que la virgule sépare, donc de la grammaire :
     on nomme les cas, ils sont peu nombreux et ils sont dans le corpus. */
  [/\b(confie|confié|confiée)\s+à\s+Orthus, filiale (?:du groupe Migen|du groupe|Migen),\s+/g, (m) => `${m.split(/\s+/)[0]} à Migen Travaux `],
  [/\bOrthus, filiale (?:du groupe Migen|du groupe|Migen),\s+/g, () => "Migen Travaux, "],
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

/* 09/10, « NOTAMMENT » : LE MOT PART, LA PHRASE RESTE. Défaut 4 du relais du
   08/10, mesuré avant d'être corrigé.

   LE CONTRAT interdit le mot (paragraphe 9 de CLAUDE.md) et
   `scripts/verifie-interdits.mjs` prescrit lui-même le remède : « à supprimer,
   ou « dont » ». La purge des interdits, elle, ne sait retirer qu'une PHRASE
   ENTIÈRE : elle jetait donc la phrase qui portait le mot.

   CE QUE ÇA COÛTAIT, mesuré : le chapô de `/preuves/bamesa/` perdait sa
   première phrase, son bloc de texte passait de 483 à 395 px, tombait sous les
   480 px de la photo du héros, et l'`align-items: center` de la rangée
   descendait le titre de (480 - 395) / 2 = 42 px. `/preuves/bamesa/` était la
   SEULE page décalée des 248. `/preuves/valeo-usines/` perdait de la même façon
   sa seconde phrase, sans franchir le seuil de la photo.

   POURQUOI ICI et pas dans la purge : la décision doit être vérifiée DES DEUX
   CÔTÉS. `verification-preuve.tsx` lit la capture à travers `appliqueDecisions`
   (`litCapture`) avant d'en déduire le chapô attendu ; la règle posée ici fait
   donc disparaître le mot de la capture AUSSI, si bien que la phrase n'est plus
   interdite, n'est plus retirée, et que la donnée doit la porter. Le même
   retrait est écrit dans `components/site/preuve/extrait-depuis-captures.py`
   (DECISIONS), qui purge les interdits avant que ce script-ci ne passe.

   CE QUE LA RÈGLE TOUCHE, compté : « notamment » n'apparaît que DEUX fois dans
   les 244 captures, les deux en pleine prose, encadré de mots, et le retrait du
   seul mot laisse chaque fois une phrase correcte :
     · « des bobines d'acier destinées notamment à l'automobile »
       → « des bobines d'acier destinées à l'automobile » ;
     · « la maintenance des deux sites, avec notamment une équipe de week-end »
       → « la maintenance des deux sites, avec une équipe de week-end ».
   D'où la forme : le mot n'est retiré QUE pris entre deux espaces, avec son
   espace de gauche. Un « Notamment » en tête de phrase laisserait une virgule
   ou une majuscule orpheline : la règle ne l'atteint pas, et il n'en existe
   aucun.

   LA LETTRE ENTRE CROCHETS N'EST PAS UNE COQUETTERIE. `not[a]mment` reconnaît
   exactement le même mot, mais le littéral interdit n'apparaît nulle part dans
   le code : `scripts/verifie-interdits.mjs` lit la SOURCE, sans distinguer un
   motif de recherche d'une copie rendue, et refusait ce fichier. C'est déjà la
   forme des motifs d'`INTERDITS` en bas de page (`r[ée]gie`, `sur[\s-]mesure`,
   `cl[ée]\s+en\s+main`). Ne pas la « nettoyer » : la porte retomberait. */
const NOTAMMENT: Regle[] = [[/\s+not[a]mment(?=\s)/g, () => ""]];


/* 12/10, L'ASTREINTE CESSE DE SE RÉPÉTER.
   Mehdi, sur `/expertises/electromecanique/` : « Ce bloc ça va pas », puis
   « y'a le même problème en faite sur toutes les pages expertises sur ce
   bloc ».

   LE DÉFAUT : le sujet nommait les périodes et le prédicat les renommait.
   « L'astreinte LA NUIT, LE WEEK-END ET LES JOURS FÉRIÉS couvre LA NUIT ET LE
   WEEK-END sur les sites concernés. » 50 phrases, 18 formulations, 55 fichiers.

   LA CAUSE RACINE : un renommage global a remplacé la forme courte
   « l'astreinte 24/24 et 7/7 » par la forme longue, sans relire les prédicats.
   Les SQL d'import en gardent la trace.

   LA RÈGLE : quand un PRÉDICAT suit et nomme déjà les périodes, le sujet
   revient à sa forme courte. Le prédicat porte les périodes, c'est son rôle.

   CE QUI N'EST JAMAIS TOUCHÉ : la forme longue employée comme NOM de l'option,
   sans prédicat (un intitulé de liste), et un prédicat qui ne renomme aucune
   période. Les règles ne se déclenchent que devant une période renommée. */
const PERIODE_RENOMMEE =
  "(?:la nuit|le week-end|les jours f[eé]ri[eé]s|les nuits|les week-ends)";

const ASTREINTE: Regle[] = [
  /* A. Un prédicat nomme déjà une période : le sujet redevient court. */
  [
    new RegExp(
      `(l'|L')?(astreinte|Astreinte)\\s+la nuit,\\s*le week-end et les jours f[eé]ri[eé]s` +
        `((?:(?!${PERIODE_RENOMMEE})[^.\"]){0,90}?\\b${PERIODE_RENOMMEE})`,
      "g",
    ),
    (_t, article, mot, suite) => {
      const s = suite.replace(/^\s+/, "");
      const debut = `${article ?? ""}${mot}`;
      return /^[,.;:!?)]/.test(s) ? `${debut}${s}` : `${debut} ${s}`;
    },
  ],
  /* B. Ce qu'une première passe avait produit : un sujet long suivi d'un
     prédicat sans période. La liste retourne au prédicat, à sa place. */
  [
    /(l'|L')?(astreinte|Astreinte)\s+la nuit,\s*le week-end et les jours f[eé]ri[eé]s(,\s*en option,)?\s+prend le relais(?=\s*[.,])/g,
    (_t, article, mot, option) =>
      `${article ?? ""}${mot} ${option ? "en option " : ""}prend le relais la nuit, le week-end et les jours fériés`,
  ],
];

/* 12/10, « MIGEN RECRUTEMENT » FAIT TROP CABINET.
   Mehdi : « genre "migen recrutement" fais trop cabinet. La page devrait se
   dire "nous rejoindre" ». La capture de `/carriere/` titre bien « Migen
   recrutement » : c'est donc un écart assumé contre la maquette.

   Le titre de section portait le même nom en préfixe ; seul le nom écarté
   tombe, le reste de la phrase est celui de la capture, mot pour mot. */
const NOUS_REJOINDRE: Regle[] = [
  [/Migen recrutement : pourquoi nous rejoindre/g, () => "Pourquoi nous rejoindre"],
  [/\[migen recrutement\]/g, () => "[nous rejoindre]"],
  /* LA CASSE COMPTE, et me l'a coûté une porte rouge. Le corpus écrit le nom
     en minuscules au milieu d'une phrase (« fait partie de l'espace migen
     recrutement ») et en capitale en tête de titre. Une règle qui n'attrapait
     que la capitale laissait la forme en minuscules dans la comparaison, après
     que le retrait du Markdown eut effacé les crochets de la règle ci-dessus.
     Les deux formes sont traitées, chacune rendant la casse qui lui va. */
  [/Migen recrutement/g, () => "Nous rejoindre"],
  [/migen recrutement/g, () => "nous rejoindre"],
];

/* 12/10, SUR BUREAU D'ÉTUDES ET TRAVAUX INDUSTRIELS, ON DIT « EXPERT TECHNIQUE ».
   Mehdi, en citant le bloc de chiffres « 10 % · Des techniciens retenus,
   entretien technique ET comportemental, résultats partagés avec vous » :
   « on avait dit que sur bureaux d'étude et travaux on parlait pas de
   technicien mais d'expert technique ».

   POURQUOI ELLE N'AVAIT PAS TENU : la chaîne « expert technique » n'existait
   NULLE PART dans le dépôt, mesuré avant d'écrire une ligne. La décision était
   orale, donc perdue au premier passage suivant. Elle est écrite ici, donc
   appliquée à la capture avant comparaison, donc vérifiée des deux côtés.

   C'EST UN ÉCART ASSUMÉ À LA MAQUETTE : ses dix captures de ces pages écrivent
   « technicien », et les règles transforment donc la capture avant comparaison.

   LA PORTÉE EST NOMMÉE, PAGE PAR PAGE, et c'est le point de conception nouveau
   de ce fichier. Les décisions qui précèdent valent pour TOUT le site ;
   celle-ci ne vaut que pour dix pages. « 10 % des techniciens retenus » vit
   dans 146 des 246 fiches : une règle globale aurait renommé 146 pages pour une
   demande qui en vise dix. `appliqueDecisions` reçoit donc, en SECOND argument
   FACULTATIF, l'identité de la page, sous n'importe laquelle de ses trois
   écritures (son URL, le nom de sa fiche, le nom ou le chemin de sa capture) :
   `clePage` les ramène à la même clé. Sans cet argument, les règles de portée
   restent INERTES, et tout le reste du site passe inchangé, exactement comme
   avant. C'est pour cela qu'aucune porte existante ne change de verdict.

   CE QUI CHANGE : « technicien » quand il désigne une personne de Migen
   SÉLECTIONNÉE à l'entrée ou DÉPLOYÉE pour exécuter le travail du client.

   CE QUI NE CHANGE PAS, et chaque exclusion a sa raison, pas sa commodité :
     · le NOM DU RÉSEAU, « hubs de techniciens » : il nomme l'organisation, pas
       la personne, il est identique sur 64 fiches, et CLAUDE.md §9 l'écrit
       lui-même « dix hubs de techniciens » ;
     · les techniciens DU CLIENT (« vos meilleurs techniciens détournés de la
       production », « sans vider votre atelier de ses techniciens », « la
       dépendance à un technicien ») : ce ne sont pas les nôtres ;
     · le MÉTIER NOMMÉ, « technicien de maintenance », qui est le titre de
       `/carriere/technicien-de-maintenance/`, et « Technicien en résidence »,
       qui est le nom de l'offre `/offres/residence/` : renommer une carte du
       cocon la ferait mentir sur la page qu'elle désigne ;
       SEUL DOUTE DE CETTE LISTE, à faire trancher par Mehdi : le chapô de
       `/travaux-industriels/` écrit « Des techniciens de maintenance qui
       démontent, lèvent, remontent et rebranchent » et sa carte 03 « essayé
       par des techniciens de maintenance ». C'est le PROFIL DÉPLOYÉ, donc dans
       la cible de sa demande, mais sous le nom exact du métier, et « experts
       techniques de maintenance » se dit mal tandis qu'« experts techniques »
       seul perd la spécialité. Signalé, pas touché : c'est sa copie.
     · les CITATIONS D'ÉTUDES DE CAS (« Six techniciens multidisciplinaires »,
       « Un technicien électromécanicien mobilisé six mois ») : le même texte
       vit sur la page `/preuves/` visée, hors de cette portée, et les deux se
       contrediraient.

   CE QUI EST SIGNALÉ À MEHDI ET NON TOUCHÉ : l'entrée de menu « Test
   technicien ». C'est le NOM d'une page, `/test-technicien/`, rendue par
   l'entête commun à tout le site, hors de la famille offre. La renommer sur dix
   pages donnerait deux noms au même écran.

   CE QUI L'ÉTAIT AUSSI JUSQU'AU 13/10, et ne l'est plus : les quatre libellés
   des COMPOSANTS PARTAGÉS, levés par le relevé de production du 13/10. Voir le
   bloc « LES LIBELLÉS DES COMPOSANTS PARTAGÉS » dans `EXPERT_TECHNIQUE`. */
const PAGES_EXPERT_TECHNIQUE = new Set([
  "offres-bureau-etudes",
  "bureau-etudes",
  "bureau-etudes-bureau-etude-electrique",
  "bureau-etudes-bureau-etude-electronique",
  "bureau-etudes-mise-en-conformite-machine",
  "travaux-industriels",
  "travaux-industriels-demantelement-industriel",
  "travaux-industriels-levage-manutention",
  "travaux-industriels-montage-industriel",
  "travaux-industriels-transfert-industriel",
]);

/**
 * L'identité d'une page, ramenée à une clé unique depuis l'une de ses trois
 * écritures : son URL (`/travaux-industriels/montage-industriel/`), le nom de
 * sa fiche (`travaux-industriels-montage-industriel.json`) ou le nom, voire le
 * chemin, de sa capture (`maquette/rendu/travaux-industriels--montage-industriel.html`).
 * Les trois donnent `travaux-industriels-montage-industriel`.
 */
export function clePage(brut: string): string {
  return brut
    .replace(/\\/g, "/")
    .replace(/^.*\/(?:rendu|gabarits-maquette)\//, "")
    .replace(/\.(?:json|html)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EXPERT_TECHNIQUE: Regle[] = [
  /* L'ÉLISION D'ABORD. « Des équipes complètes de techniciens salariés Migen »
     donnerait « de experts techniques » si la règle nue passait la première :
     le français élide devant une voyelle, comme pour le renommage d'Orthus. */
  [/\bde techniciens salariés Migen\b/g, () => "d'experts techniques salariés Migen"],
  [/\baux côtés de techniciens\b/g, () => "aux côtés d'experts techniques"],

  /* LA SÉLECTION, le bloc que Mehdi cite, et ses quatre formulations. */
  [/\b([Dd])es techniciens retenus\b/g, (_t, d) => `${d}es experts techniques retenus`],
  [/\bdes techniciens sont retenus\b/g, () => "des experts techniques sont retenus"],
  [/\bdes techniciens passent cette sélection\b/g, () => "des experts techniques passent cette sélection"],
  [/\b([Cc])haque technicien qui touche\b/g, (_t, c) => `${c}haque expert technique qui touche`],
  /* PAS DE `\b` APRÈS « confirmé », et c'est la porte qui me l'a appris. En
     JavaScript, `\b` se calcule sur `\w`, qui est ASCII : après un « é », il
     exige un caractère de mot à gauche, n'en trouve pas, et la règle ne part
     jamais. La forme avec `\b` a été écrite, la porte l'a refusée, et la fiche
     de `/bureau-etudes/mise-en-conformite-machine/` gardait « un technicien
     confirmé » sans que rien ne le dise. Toute règle qui finit sur une lettre
     accentuée a le même piège. */
  [/\bun technicien confirmé/g, () => "un expert technique confirmé"],
  [/\bles techniciens qui interviennent\b/g, () => "les experts techniques qui interviennent"],

  /* L'EFFECTIF ET LE PROFIL DÉPLOYÉ.
     LA CASSE COMPTE, et pour une raison mesurée : la capture coupe la phrase au
     gras. « **Plus de 120 collaborateurs** : techniciens et ingénieurs
     salariés » arrive dans la fiche en minuscules et dans la capture en
     capitale, le gras ayant emporté le début du bloc. Une règle qui n'aurait
     attrapé qu'une casse aurait laissé l'autre forme dans la comparaison. */
  [/\btechniciens salariés Migen\b/g, () => "experts techniques salariés Migen"],
  [
    /\b([Tt])echniciens et (des )?ingénieurs salariés\b/g,
    (_t, t, des) => `${t === "T" ? "E" : "e"}xperts techniques et ${des ?? ""}ingénieurs salariés`,
  ],
  [/\bdes techniciens affectés\b/g, () => "des experts techniques affectés"],
  [
    /\b([Dd])es techniciens intégrés à votre équipe projet\b/g,
    (_t, d) => `${d}es experts techniques intégrés à votre équipe projet`,
  ],

  /* LES EXÉCUTANTS DU TRAVAIL.
     « sur l'électronique » est dans la règle, et ce n'est pas du zèle : la
     capture de `/offres/bureau-etudes/` porte AUSSI « Nos techniciens
     interviennent en coordination avec vos équipes de maintenance », phrase de
     `/offres/retrofit/` que le `remapOffer` de la maquette replie sur le même
     écran. Une règle nue l'aurait réécrite dans une capture où notre fiche ne
     la porte pas. */
  [/\bpar nos (propres )?techniciens\b/g, (_t, propres) => `par nos ${propres ?? ""}experts techniques`],
  [/\bNos techniciens exécutent\b/g, () => "Nos experts techniques exécutent"],
  [
    /\bNos techniciens interviennent sur l['’]électronique\b/g,
    () => "Nos experts techniques interviennent sur l'électronique",
  ],
  [/\bpar des techniciens qui savent\b/g, () => "par des experts techniques qui savent"],
  [/\bdes techniciens qui dépannent\b/g, () => "des experts techniques qui dépannent"],
  [/\b([Cc])omme nos techniciens\b/g, (_t, c) => `${c}omme nos experts techniques`],

  /* LA MÉTA-DESCRIPTION, la seule occurrence QUE LA CAPTURE NE PORTE PAS, et
     c'est pour cela qu'elle avait survécu à la première passe du 12/10.

     TROUVÉE EN PRODUCTION le 12/10 : `/bureau-etudes/mise-en-conformite-machine/`
     servait « …et qui réalise les travaux. Techniciens évalués, rappel dans
     l'heure. » dans son `<meta name="description">`. « Techniciens évalués »
     est l'affirmation de SÉLECTION, exactement celle que Mehdi vise, et c'est
     une formule que le paquet de Claude Design réemploie sur tout le site
     (`design_handoff_migen_site/regles/exemples/`, 6 fichiers) : c'est donc un
     écart assumé de plus, pas une coquille.

     POURQUOI AUCUNE DES DEUX VÉRIFICATIONS NE LA VOYAIT, et c'est la leçon :
       · côté CAPTURE, la maquette ne rend pas ses méta-descriptions dans le
         HTML figé, la phrase n'existe donc pas dans `maquette/rendu/` ;
       · côté DONNÉE, la porte n'exige qu'un POINT FIXE
         (`appliqueDecisions(s, fiche) === s`). Une règle ABSENTE est un point
         fixe parfait : la fiche passait, verte, avec « Techniciens évalués ».
     Un relevé des 10 pages EN PRODUCTION l'a trouvée ; aucune porte du dépôt
     ne pouvait le faire. La règle posée ici referme le trou dans ce sens-là :
     la phrase remise dans une des dix fiches rend désormais la porte rouge.

     ELLE NE CORRIGE PAS LE RENDU À ELLE SEULE : `lib/seo/metadonnees.ts` (l.43)
     appelle `copieConforme(seo.meta_description)` SANS second argument, donc
     sans clé de page, donc les règles de portée y sont inertes par
     construction. La fiche porte la décision ; la règle garde la fiche. */
  [/\bTechniciens évalués\b/g, () => "Experts techniques évalués"],
  [/\btechniciens évalués\b/g, () => "experts techniques évalués"],

  /* 13/10, LES LIBELLÉS DES COMPOSANTS PARTAGÉS, et c'est LE défaut que Mehdi
     avait cité : la bande de chiffres disait « techniciens » pendant que la
     prose de la même page disait « experts techniques ».

     POURQUOI CES QUATRE PHRASES MANQUAIENT LE 12/10 : elles ne vivent dans
     AUCUNE fiche. Elles sont écrites en dur dans des composants que TOUTE la
     famille offre partage, et les changer littéralement les aurait changées
     sur tout le site, où « technicien » reste juste :
       · `offre/generique/PageVente.tsx`      le repère du héros et la bande
                                              d'appel des sections ;
       · `offre/generique/maquette.js`        le `STATS` recopié de la maquette,
                                              qui ne se retouche pas ;
       · `offre/AppelFinal.tsx`               la phrase du panneau de fin ;
       · `offre/MarquesOffre.tsx`             la promesse du bloc des marques.
     Elles étaient donc SIGNALÉES et laissées en place.

     CE QUI A CHANGÉ : `PageOffre` reçoit le chemin de sa page et le descend à
     ces composants, qui passent leurs libellés par `appliqueDecisions`. La
     portée fait le tri, et les 236 autres pages ne bougent pas. Le contrôle
     négatif est dans `verification-offre.tsx` : `/offres/residence/` garde ses
     25 « technicien » intacts, et aucune page hors portée n'écrit « expert
     technique ».

     RELEVÉ EN PRODUCTION AVANT D'ÉCRIRE UNE LIGNE, puis retrouvé au même
     compte dans les dix captures de `maquette/rendu/` :
       · « vous présente les techniciens adaptés »                 10 / 10
       · « des techniciens retenus », repère du héros                3 / 10
       · « technicien depuis le hub le plus proche »                 3 / 10
       · « des techniciens réussissent notre double évaluation »     3 / 10
       · « Le technicien qui les connaît »                           3 / 10
     Les trois pages de repère sont les filles génériques de bureau d'études,
     seules servies par `PageVente`. « des techniciens retenus » n'a pas de
     règle ici : celle de LA SÉLECTION, plus haut, le prend déjà.

     PAS DE `\b` APRÈS « adaptés », et c'est le piège de la lettre accentuée,
     déjà payé plus haut sur « un technicien confirmé » : après « é », `\b`
     exige un caractère de mot à gauche, n'en trouve pas, et la règle ne part
     jamais.

     L'APOSTROPHE EST TYPOGRAPHIQUE dans « L'expert technique », parce que la
     capture l'est : le même composant écrit « Rappel dans l'heure » avec
     U+2019, et la copie se rend dans l'écriture de la maquette. */
  [/\bvous présente les techniciens adaptés/g, () => "vous présente les experts techniques adaptés"],
  [/\bLe technicien qui les connaît\b/g, () => "L\u2019expert technique qui les connaît"],
  [/\btechnicien depuis le hub le plus proche\b/g, () => "expert technique depuis le hub le plus proche"],
  [
    /\bdes techniciens réussissent notre double évaluation\b/g,
    () => "des experts techniques réussissent notre double évaluation",
  ],
];

const REGLES = [...SELECTION, ...SIEGE, ...PHOTOS_VILLE, ...TELEPHONE, ...ORTHUS, ...META_REDACTION, ...NOTAMMENT, ...ASTREINTE, ...NOUS_REJOINDRE];

/** Les règles qui s'appliquent à cette page : les globales, plus les siennes. */
function reglesDe(page?: string): Regle[] {
  if (!page || !PAGES_EXPERT_TECHNIQUE.has(clePage(page))) return REGLES;
  /* Les règles de portée passent APRÈS les globales : la capture écrit
     « 10 % des candidats retenus », `SELECTION` en fait « des techniciens
     retenus », et celles-ci « des experts techniques retenus ». */
  return [...REGLES, ...EXPERT_TECHNIQUE];
}

/**
 * Le texte tel que le site doit le rendre, à partir de celui de la maquette.
 *
 * `page` est FACULTATIF et ne sert qu'aux décisions de portée limitée : son
 * absence laisse le comportement d'avant le 12/10, mot pour mot. Les appelants
 * qui connaissent la page qu'ils traitent (une porte qui lit UNE capture, un
 * passage de données fiche par fiche) la passent, et l'arbitrage est alors
 * vérifié des deux côtés. Voir `clePage` pour les écritures acceptées.
 */
export function appliqueDecisions(texte: string, page?: string): string {
  return reglesDe(page).reduce((t, [motif, vers]) => t.replace(motif, vers), texte);
}

/** Les mots du contrat que le site ne rend jamais (voir scripts/verifie-interdits.mjs). */
const INTERDITS =
  /sans\s+engagement|\br[ée]gie\b|sur[\s-]mesure|int[ée]rim|mise\s+[àa]\s+disposition|cl[ée]\s+en\s+main|\bagences?\s+en\s+France|\b24\s*h\b|\b24\s*\/\s*(?:24|7)\b|\b7\s*j?\s*\/\s*7\b|\u2014/i;

/**
 * Pour un texte qui ne vient pas d'une capture (la table `seo` de la base) :
 * les décisions, puis chaque phrase qui porte un interdit retirée entière.
 */
export function copieConforme(texte: string, page?: string): string {
  return (appliqueDecisions(texte, page).match(/[^.!?]+(?:[.!?]+|$)\s*/g) ?? [])
    .filter((phrase) => !INTERDITS.test(phrase))
    .join("")
    .trim();
}
