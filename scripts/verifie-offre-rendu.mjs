/**
 * LA PAGE /offres/residence/ SERT-ELLE LE RENDU FIGÉ DE LA MAQUETTE,
 * SECTION PAR SECTION, MOT POUR MOT ?
 *
 *   node scripts/verifie-offre-rendu.mjs
 *   SITE_URL=http://localhost:4341/ node scripts/verifie-offre-rendu.mjs   (version construite)
 *
 * LA RÉFÉRENCE EST UNIQUE, validée par Mehdi le 06/10 : le rendu de
 * l'application autonome de sa maquette, figé page par page dans
 * maquette/rendu/. Pour cette page : offres--residence.html (le HTML du
 * <main> rendu) et offres--residence.json (la structure mesurée : 17
 * sections). Pas le corpus brut, pas l'objet OFFERS : la capture, qui
 * fusionne déjà les deux.
 *
 * CE QUE LA PORTE CONTRÔLE, les deux pages ouvertes dans le MÊME navigateur
 * et lues par le MÊME code :
 *
 *   1. COHÉRENCE DE LA RÉFÉRENCE : le HTML figé porte bien les 17 sections
 *      et le h1 que le JSON de mesure annonce. Si les deux fichiers ne se
 *      correspondent plus, la porte refuse de conclure.
 *   2. STRUCTURE : les sections de la référence sont servies dans le même
 *      ordre, titres identiques sur texte normalisé. Aucune section en plus
 *      hors exceptions déclarées ci-dessous, aucune en moins.
 *   3. TEXTE : chaque ligne visible de chaque section de la référence est
 *      présente, mot pour mot sur texte normalisé, dans la section
 *      correspondante du site. Une phrase absente est nommée.
 *   4. TIRETS : aucun tiret cadratin visible sur le site, règle permanente
 *      de Mehdi. Si la référence en portait un, il devrait être déclaré
 *      remplacé ci-dessous, sinon la porte échoue.
 *
 * LA NORMALISATION est celle du dépôt (verifie-mots-offre.mjs) : espaces
 * insécables ramenés à l'espace, apostrophes typographiques unifiées,
 * espaces multiples réduits. Piège connu, il a déjà fait conclure à tort.
 *
 * LES EXCEPTIONS SONT DÉCLARÉES ICI, nommément, avec leur raison. Chacune
 * est VÉRIFIÉE : une exception devenue inutile fait échouer la porte, sinon
 * la liste grossit jusqu'à tout autoriser.
 *
 * PRÉALABLE : le site doit tourner (`bun run dev`, ou `SITE_URL` vers le
 * build) et Google Chrome être installé (Playwright passe par son canal).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { appliqueDecisions } from "./decisions-copie.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");
/* La page se passe en argument : `node scripts/verifie-offre-rendu.mjs /offres/zero-arret/`.
   Sans argument, la page pilote, celle que Mehdi a validée le 06/10.

   Le nom de la capture se déduit du chemin, convention de `capture-maquette.mjs` :
   les barres deviennent un double tiret, la racine s'appelle « index ». */
const CHEMIN_PAGE = process.argv[2] ?? "/offres/residence/";
const CLE_REFERENCE = CHEMIN_PAGE.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "index";
const REFERENCE_HTML = join(RACINE, "maquette", "rendu", `${CLE_REFERENCE}.html`);
const REFERENCE_JSON = join(RACINE, "maquette", "rendu", `${CLE_REFERENCE}.json`);
const LARGEUR = 1280;
const HAUTEUR = 860;

/* ------------------------------------------------------------------ */
/* LES EXCEPTIONS, chacune nommée, justifiée, et vérifiée plus bas.    */
/* ------------------------------------------------------------------ */

/**
 * Sections que le site rend EN PLUS de la référence, par rang dans le <main>
 * servi. Chaque entrée doit correspondre exactement à ce qui est rendu, et
 * son texte doit être ABSENT de la référence : sinon, exception inutile.
 */
/*
 * LE FIL D'ARIANE N'EST PLUS UN AJOUT (08/10). Il l'était tant que le site le
 * rendait en rangée visible au-dessus du héros ; `components/cocon/FilAriane.tsx`
 * ne pose plus que ses données structurées (aucune des 248 captures n'en
 * dessine), et l'exception commune tombait donc en « devenue inutile » sur
 * toutes les pages.
 */

/**
 * Exceptions PROPRES à une page. Clé : le chemin.
 * Vide pour une page qui n'en a pas, ce qui est le cas attendu.
 */
const AJOUTS_PAR_PAGE = {};

const SECTIONS_AJOUTEES = [...(AJOUTS_PAR_PAGE[CHEMIN_PAGE] ?? [])];

/**
 * TITRES DE REPLI : un titre servi là où la capture n'en a pas, accepté
 * seulement s'il est déclaré ici ET posé dans la bascule d'un repli du
 * téléphone (`<summary>` de `blocs/SectionPliableMobile`).
 *
 * Décision de Mehdi du 14/10 (5c7e765, docs/NOUS-CONNAITRE-ARBITRAGES.md,
 * « Décisions du 14/10 ») : les blocs sans titre de section se replient sous
 * 880 px, et il leur a donné un `<h2>` qui sert de bascule. La note disait
 * déjà que cette porte « doit accepter ces trois titres » ; elle ne le faisait
 * pas, et tombait depuis le 14/10 sur /offres/residence/. Le troisième,
 * « Votre technicien intégré à votre site », vit sur le hub /offres/, hors de
 * ce gabarit : il n'est pas déclaré tant que la porte ne le rencontre pas.
 *
 * Comparés sans la casse : la capture et le site peignent « Ils nous font
 * confiance » en capitales (`text-transform`), `innerText` les rend telles.
 */
const TITRES_DE_REPLI = [
  {
    titre: "Ils nous font confiance",
    pourquoi:
      "la mention du bandeau de logos, passée de <span> à <h2> sans changer " +
      "de dessin (`offre/LogosClients.tsx`) : même texte, même place à 1 280 px.",
  },
  {
    titre: "Certifications et équipe",
    pourquoi:
      "titre ajouté pour replier la réassurance (`offre/Reassurance.tsx`), " +
      "masqué à l'œil au-dessus de 880 px (`offre/PliSansTitre.module.css`).",
  },
];

/**
 * Tirets cadratins de la référence remplacés dans le rendu, phrase par
 * phrase : { maquette, rendu, pourquoi }. La forme `maquette` doit exister
 * dans la référence et la forme `rendu` sur le site, sinon la porte échoue.
 * La capture d'offres--residence ne porte aucun cadratin, et la porte le
 * re-vérifie à chaque passage.
 *
 * LE MÊME MÉCANISME porte, depuis le 08/10, la SEULE reformulation que Mehdi
 * a tranchée : le titre de l'étude de cas Tournaire, « Maintenir des machines
 * conçues sur mesure » (interdit « sur mesure », CLAUDE.md §9), devient
 * « Maintenir des machines conçues en interne », expression reprise du texte
 * même de l'étude (« équipée à 80 % de machines conçues en interne »). La
 * page `/preuves/tournaire/` porte ce H1, vérifié des deux côtés par
 * `components/site/preuve/verification-preuve.tsx` ; la carte qui la cite
 * porte le même titre. Ce n'était plus un trou, c'est une substitution.
 */
const TIRETS_PAR_PAGE = {
  "/offres/retrofit/remise-en-etat/": [
    {
      maquette: "Maintenir des machines conçues sur mesure",
      rendu: "Maintenir des machines conçues en interne",
      pourquoi:
        "titre de la carte Tournaire de « Ils nous ont confié une mission " +
        "comparable » : « sur mesure » est proscrit, Mehdi a tranché le 08/10 " +
        "pour le titre reformulé de /preuves/tournaire/, que la carte reprend.",
    },
  ],
};
const TIRETS_REMPLACES = TIRETS_PAR_PAGE[CHEMIN_PAGE] ?? [];

/**
 * Trous assumés : lignes de la référence volontairement NON rendues,
 * { section, ligne, pourquoi }. La ligne doit exister dans la référence et
 * manquer sur le site, sinon exception inutile. VIDE AU 06/10 : le portage
 * rend les 17 sections sans trou.
 */
/*
 * UNE LISTE DE PAIRES, PAS UN OBJET, et la raison est payée : trois vagues de
 * déclarations ont posé la même URL plusieurs fois, et dans un littéral objet
 * JavaScript la dernière clé ÉCRASE silencieusement les précédentes. Deux
 * trous déclarés le matin ont ainsi disparu l'après-midi sans un mot. Avec une
 * liste, une URL peut apparaître autant de fois qu'il y a eu de vagues : tout
 * s'additionne, rien ne s'écrase.
 */
const TROUS_DECLARES = [
  /* Modèle, à suivre pour déclarer un trou :
   *
   *   "/offres/zero-arret/": [
   *     {
   *       section: 0,
   *       ligne: "… la phrase EXACTE de la référence …",
   *       pourquoi: "prix : le contrat du projet interdit tout prix sur le site.",
   *     },
   *   ],
   *
   * UN TROU N'EST PAS UNE REFORMULATION. Mehdi a tranché le 05/10 : « la
   * maquette se respecte au mot pour mot, un synonyme est une faute ». Une
   * phrase que le contrat interdit de copier n'est donc pas réécrite autrement :
   * elle n'est PAS RENDUE, et elle est déclarée ici avec sa raison. La porte
   * vérifie les deux sens : la phrase doit exister dans la référence et manquer
   * sur le site, sinon l'exception est fausse et la porte échoue.
   *
   * « +200 » N'EST PLUS UN TROU, depuis le 07/10 au soir. La règle validée par
   * le client (design_handoff_migen_site/README.md) est « +200 clients, sans
   * jamais préciser « réguliers » » : les 39 lignes « +200 », « Clients
   * industriels accompagnés » et « Plus de 200 clients industriels » déclarées
   * ici ont été retirées, et la porte exige maintenant qu'elles soient RENDUES.
   * Ce que les commentaires de page ci-dessous en disaient est caduc. */

  /* ------------------------------------------------------------------
     /offres/zero-arret/ — déclaré le 07/10.

     DEUX FORMULATIONS de sa capture sont interdites par le contrat du projet
     (CLAUDE.md §9), et chacune revient sur plusieurs lignes :

       · « un prix mensuel fixe » : « aucun prix ». Elle est dans le chapeau du
         héros et dans la légende de la troisième carte de chiffres.
       · « une réponse écrite sous 48h » : « aucun délai chiffré d'intervention,
         seul rappel dans l'heure est autorisé ». Elle est la mention des
         horaires de cette page, donc la phrase de ses TROIS bandes d'appel, et
         elle revient dans la sous-ligne de la bande-question.

     AUCUNE N'EST REFORMULÉE (décision de Mehdi du 05/10, un synonyme est une
     faute) : elles ne sont pas rendues. Conséquences visibles, assumées :
     le héros n'a pas de chapeau, les trois bandes d'appel ne portent que leur
     bouton, et la troisième carte de chiffres n'est pas rendue du tout, sa
     valeur « 12 mois » comprise, parce qu'un chiffre sans sa légende ne se lit
     pas. Les deux lignes de cette carte sont donc déclarées ici.

     TROIS AUTRES FORMULATIONS ONT ÉTÉ RENCONTRÉES ET GARDÉES, parce qu'aucune
     règle du dépôt ne les interdit, et elles sont à faire arbitrer par Mehdi :
     « 500 à 2 000 € » et « De 500 à 2 000 € par heure » (le coût d'arrêt du
     CLIENT, pas un prix Migen), et les heures du déroulé (« 14h30 », « 16h00 »,
     « 22h00 », « avant 16h »), qui sont des heures de la journée et non des
     délais chiffrés. Elles sont rendues, mot pour mot.

     HORS PORTÉE DE LA PORTE, et donc traité dans la donnée seule : la capture
     replie les réponses de sa FAQ, elles ne sont pas des lignes mesurées. Deux
     y portaient de la copie interdite, « Un prix mensuel fixe, sur 12 mois… »
     (réponse à « Combien coûte l'abonnement ? », laissée vide) et « il relève
     de la régie classique » (réponse à « Et si la panne arrive en journée ? »,
     dont cette seule phrase n'est pas reprise). « régie » est proscrit. */
  ["/offres/zero-arret/", [
    {
      section: 0,
      ligne:
        "L'entretien préventif le samedi, le dépannage la nuit. Vous réservez une capacité de maintenance, exclusivement hors production, pour un prix mensuel fixe et sans embauche.",
      pourquoi:
        "prix : « un prix mensuel fixe ». Le contrat du projet (CLAUDE.md §9) " +
        "interdit tout prix sur le site. Le chapeau du héros n'est donc pas rendu.",
    },
    {
      section: 0,
      ligne:
        "Votre code postal suffit pour commencer : une réponse écrite sous 48h, couvert, en zone étendue ou refusé.",
      pourquoi:
        "délai chiffré : « une réponse écrite sous 48h ». Seul « rappel dans " +
        "l'heure » est autorisé. C'est la mention des horaires de cette page : " +
        "elle n'est rendue ni dans le héros, ni dans ses trois bandes d'appel.",
    },
    {
      section: 1,
      ligne: "12 mois",
      pourquoi:
        "la légende de cette carte de chiffres porte un prix (ligne suivante). " +
        "Un chiffre sans sa légende ne se lit pas : la carte entière n'est pas " +
        "rendue, sa valeur comprise. « 12 mois » n'est pas interdit en soi.",
    },
    {
      section: 1,
      ligne: "D'engagement, pour un prix mensuel fixe",
      pourquoi:
        "prix : « un prix mensuel fixe », interdit par le contrat du projet.",
    },
    {
      section: 4,
      ligne:
        "Votre code postal suffit pour commencer : une réponse écrite sous 48h, couvert, en zone étendue ou refusé.",
      pourquoi:
        "même mention, bande d'appel « domaines » : délai chiffré interdit. La " +
        "bande est rendue avec son bouton seul, comme la capture la dessine.",
    },
    {
      section: 7,
      ligne:
        "Votre code postal suffit pour commencer : une réponse écrite sous 48h, couvert, en zone étendue ou refusé.",
      pourquoi: "même mention, bande d'appel « offre » : délai chiffré interdit.",
    },
    {
      section: 10,
      ligne: "Votre code postal, une réponse écrite sous 48h.",
      pourquoi:
        "délai chiffré dans la sous-ligne de la bande-question. Le gabarit y " +
        "écrit son texte fixe « Rappel dans l'heure. », seul délai autorisé.",
    },
    {
      section: 13,
      ligne:
        "Votre code postal suffit pour commencer : une réponse écrite sous 48h, couvert, en zone étendue ou refusé.",
      pourquoi:
        "même mention, bande d'appel « références » : délai chiffré interdit.",
    },
  ]],


  /* ------------------------------------------------------------------
     /offres/retrofit/remise-en-etat/ — déclaré le 07/10.

     UNE FORMULATION de sa capture est interdite NOMMÉMENT par
     `scripts/verifie-interdits.mjs`, pas par appréciation (« +200 » et sa
     légende, déclarés ici jusqu'au 07/10 au soir, se rendent désormais) :

       · « Maintenir des machines conçues sur mesure », titre de la carte
         Tournaire de « Ils nous ont confié une mission comparable ».
         « sur mesure » est proscrit (`verifie-interdits.mjs` : « dire ce qui
         s'adapte, et à quoi »). Déclarée en trou (titre vide) jusqu'au 08/10 ;
         Mehdi a tranché ce jour-là pour « Maintenir des machines conçues en
         interne », le H1 de /preuves/tournaire/. C'est désormais une
         SUBSTITUTION, déclarée dans TIRETS_PAR_PAGE, plus un trou.

     DEUX AUTRES FORMULATIONS ONT ÉTÉ RENCONTRÉES ET GARDÉES, aucune règle du
     dépôt ne les interdisant, et elles sont à faire arbitrer par Mehdi :
     « La machine d'occasion achetée à bon prix » et « avant d'engager le
     moindre euro » (aucun montant), et « La maintenance en abonnement, au
     forfait mensuel. » dans la carte « Zéro arrêt » du maillage (un modèle de
     facturation, sans montant, à la différence du « prix mensuel fixe » que la
     capture de `/offres/zero-arret/` porte et que son portage a écarté).
     Elles sont rendues, mot pour mot. */
  ["/offres/retrofit/remise-en-etat/", [
  ]],



  /* ------------------------------------------------------------------
     /offres/full-service/ — déclaré le 07/10, capture à 21 sections.

     UNE LIGNE de sa capture n'est pas rendue, et elle n'est pas réécrite
     (« +200 » et sa légende, déclarés ici jusqu'au 07/10 au soir, se rendent
     désormais).

       1. « Ou appelez le , du lundi au vendredi de 8h00 à 18h30. Rappel dans
         l'heure. » : la maquette y laisse un binding NON RÉSOLU, le numéro de
         téléphone manque entre « le » et la virgule. Son corpus
         (`maquette/contenu/site/Offres/offres--full-service.md`) écrit la même
         phrase AVEC le numéro, et c'est cette forme-là que le site rend. Ce
         n'est donc ni une reformulation ni une invention : c'est la phrase du
         client, que sa maquette n'a pas su rendre. Publier « Ou appelez le , »
         sur migen.fr serait servir un défaut de rendu.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ. La capture de cette page ne porte aucun prix,
     aucun délai chiffré autre que « rappel dans l'heure », aucun tiret
     cadratin, aucun mot proscrit : les 25 interdits du contrat ont été
     cherchés un par un dans son texte visible. Une formulation a été
     RENCONTRÉE ET GARDÉE : « Découvrir → », le libellé des quatre cartes de
     types de maintenance. C'est l'infinitif ; le contrat proscrit l'impératif
     « découvrez », et `verifie-interdits.mjs` ne vise que celui-là. */
  ["/offres/full-service/", [
    {
      section: 14,
      ligne:
        "Ou appelez le , du lundi au vendredi de 8h00 à 18h30. Rappel dans l'heure.",
      pourquoi:
        "binding non résolu de la maquette : le numéro de téléphone manque " +
        "entre « le » et la virgule. Le site rend la phrase du corpus, qui " +
        "porte le numéro (04 78 33 72 05) ; la forme écourtée de la capture " +
        "n'est donc pas rendue. Défaut de rendu de la maquette, pas un écart " +
        "de copie.",
    },
  ]],


  /* ------------------------------------------------------------------
     /offres/bureau-etudes/ — déclaré le 07/10.

     AUCUN TROU depuis le 07/10 au soir : la seule ligne déclarée ici était
     « +200 » et sa légende, deuxième cellule de la bande de chiffres, et la
     règle validée par le client la fait rendre mot pour mot.

     FORMULATION RENCONTRÉE ET GARDÉE : « Besoin de savoir ce que
     coûterait votre étude avant d'aller plus loin ? », « Combien coûte une
     étude ? » et « Faire chiffrer mon étude » parlent de coût sans énoncer
     aucun prix. Le contrat interdit les prix, pas le mot. Rendues mot pour
     mot. */
  ["/offres/bureau-etudes/", [
  ]],

  /* ------------------------------------------------------------------
     /offres/chantier/transfert-de-production/ — déclaré le 07/10.

     AUCUN TROU depuis le 07/10 au soir. La bande « 01 Chiffres » de sa
     capture porte QUATRE cartes, dont les DEUX PREMIÈRES sont identiques,
     « +200 / Clients industriels accompagnés » (le corpus l'écrit deux fois
     lui aussi, `contenu/site/Offres/offres--chantier--transfert-de-production.md`,
     « ## Chiffres clés »). Elles étaient déclarées ici ; la règle validée par
     le client les fait rendre mot pour mot, doublon compris. */
  ["/offres/chantier/transfert-de-production/", [
  ]],


  /* ------------------------------------------------------------------
     /bureau-etudes/ — déclaré le 07/10.

     AUCUN TROU depuis le 07/10 au soir : les deux lignes déclarées ici,
     « +200 » et sa légende « Clients industriels accompagnés », DEUXIÈME
     carte de la bande de chiffres, se rendent mot pour mot (règle validée
     par le client).

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ, et c'est mesuré sur les 243 lignes de la
     capture : aucun prix, aucun délai chiffré autre que « rappel dans
     l'heure » (« du lundi au vendredi de 8h00 à 18h30 » sont des horaires
     d'ouverture, pas un délai d'intervention), aucun mot proscrit, aucun tiret
     cadratin. « Combien coûte une étude ? », « ce que coûterait votre étude »
     et « une reprise en série coûte bien plus cher » ne portent aucun montant.

     POUR MÉMOIRE : la maquette REDIRIGE cette URL vers `/offres/bureau-etudes/`
     (sa méthode `remapOffer`, `docs/PASSATION.md` §2), et le texte visible des
     deux captures est identique, 432 lignes, différence nulle. Le site, lui,
     SERT les deux URL. Les deux pages rendent donc le même texte : à faire
     arbitrer par Mehdi, c'est consigné en tête de
     `supabase/import/gabarits-maquette/bureau-etudes.json`. */
  ["/bureau-etudes/", [
  ]],

  /* ------------------------------------------------------------------
     /entreprise-maintenance-industrielle/ — déclaré le 07/10.

     AUCUN TROU de copie ici depuis le 07/10 au soir : « +200 », première
     cellule de la bande « 01 Chiffres », et sa légende « Clients industriels
     accompagnés » se rendent mot pour mot (règle validée par le client). Le
     prix de la section 16 est déclaré avec la vague de 14h23.

     À FAIRE ARBITRER PAR MEHDI, incohérence que cette page ne tranche pas :
       · la troisième cellule de la capture écrit « + 120 / Collaborateurs
         salariés » là où le corpus de la page écrit « **+ 100** :
         collaborateurs salariés ». AUCUNE RÈGLE DU DÉPÔT n'interdit l'un ni
         l'autre, donc la référence fait foi et « + 120 » est rendu mot pour
         mot. Mais la maquette et le corpus se contredisent sur le nombre de
         salariés, et c'est une mention vérifiable.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ. Les 25 interdits du contrat ont été cherchés
     un par un dans le texte visible de la capture : aucun prix, aucun délai
     chiffré d'intervention, aucun cadratin, aucun mot proscrit. DEUX
     FORMULATIONS ONT ÉTÉ RENCONTRÉES ET GARDÉES : « Besoin de savoir quelle
     formule coûte le moins cher pour votre site ? » et « Faire chiffrer mon
     besoin » (parler de coût sans énoncer de prix, même arbitrage que
     `/offres/bureau-etudes/`), et « la ligne tombe à 2h00 du matin » (une
     heure de la journée, pas un délai, même arbitrage que le déroulé de
     `/offres/zero-arret/`). */
  ["/entreprise-maintenance-industrielle/", [
  ]],




  /* ------------------------------------------------------------------
     Déclarés le 07/10, après le passage à la maquette de 14h23.

     Trois lignes de la maquette tombent sous un interdit NOMMÉ du contrat
     (CLAUDE.md §9). Aucune n'est reformulée, décision de Mehdi du 05/10 : un
     synonyme est une faute. Elles ne sont pas rendues, et chacune est déclarée
     ici avec la règle qui l'interdit.

     Les cartes « +200 / Clients industriels accompagnés » déclarées ici
     jusqu'au 07/10 au soir sont RETIRÉES : la règle validée par le client est
     « +200 clients, sans jamais préciser « réguliers » », elles se rendent.

     08/10 : les deux réponses « Combien coûte… » de /offres/residence/ et de
     /entreprise-maintenance-industrielle/ déclarées ici sont RENDUES. Leur
     seule phrase visée, « taux horaire homogène dans toute la France », ne
     donne aucun prix (ni montant, ni gratuité) ; la carte « 4 · Agences… taux
     horaire homogène partout » de la même capture se rendait déjà. */
  /* « Maintenir des machines conçues sur mesure » (/offres/retrofit/remise-en-etat/,
     section 12) était déclaré ici : depuis le 08/10, c'est une substitution,
     voir TIRETS_PAR_PAGE. */

  /* ------------------------------------------------------------------
     Déclarés le 07/10 au soir, seconde vague : treize refus du contrat (prix)
     et les titres de cartes où la maquette recrache son markdown source. Les
     cartes « +200 » de cette vague sont retirées, elles se rendent. Chaque
     ligne existe dans la référence et n'est pas rendue, la porte le vérifie
     dans les deux sens.

     08/10 : les réponses de FAQ « Combien coûte… » sont rendues, moins la
     seule phrase qui donne un prix (une gratuité, « qui est gratuite »,
     « offerte », ou un prix d'abonnement, « un prix mensuel fixe ») ; règle :
     on retire LA phrase, jamais le paragraphe ; celles dont aucune phrase ne
     tombait sous l'interdit sont rendues entières et ne sont plus ici. Les
     huit sous-pages passées à la page d'offre complète le 16/10 sont dans
     REFERENCES_PERIMEES, plus bas. */
  ["/offres/chantier/demenagement-machines/", [
    {
      section: 15,
      ligne: "Le montant dépend du nombre de machines, de leur masse, des conditions d'accès et de la distance. Il est chiffré sur devis après l'étude préalable, qui est gratuite. En manutention lourde, un prix donné sans visite se corrige toujours à la hausse.",
      pourquoi: "phrase retirée (prix) : « Il est chiffré sur devis après l'étude préalable, qui est gratuite. » ; le reste de la réponse est rendu mot pour mot",
    },
  ]],

  /* ------------------------------------------------------------------
     LA PHRASE DU SIÈGE, 08/10. « Siège à Lyon » n'est pas interdit : Écully
     est dans la métropole lyonnaise et Lyon est l'agence du siège (README de
     passation). Les phrases du siège de /offres/residence/cahier-des-charges/,
     /offres/residence/prestataire-ou-salarie/,
     /offres/retrofit/mise-en-conformite-machine/ et
     /entreprise-maintenance-industrielle/ sont REMISES à leur place, passées
     par `appliqueDecisions` (« sur Limonest et Écully » → « à Écully »), et ne
     sont plus déclarées.

     RESTE RETIRÉE, une seule, et HORS PORTÉE DE LA PORTE (pas de référence :
     la maquette redirige la page vers /offres/bureau-etudes/, `remapOffer`,
     `docs/PASSATION.md`) : /offres/audit-conseil-maintenance/, « Intervenez-
     vous partout en France ? » : « Notre siège est à Lyon, avec deux
     implantations à Limonest et Écully, et trois autres agences à Montréal,
     Dubaï et Madrid. » `appliqueDecisions` ne connaît pas cette forme, elle
     garde Limonest : la phrase ne se reformule pas, elle reste retirée, à
     faire trancher par Mehdi (ajouter sa forme à lib/decisions-copie.ts). */
  ["/offres/audit-conseil-maintenance/", []],
  /* « réponse de la FAQ » n'est plus un trou depuis le 16/10 : la première
     question est ouverte au bureau, comme la capture et la maquette V3. */
  ["/offres/residence/", [
    {
      section: 6,
      ligne: "7 points",
      pourquoi:
        "compteur « N points » à droite du titre de L'offre : retiré partout à la " +
        "demande de Mehdi le 15/10 (« retire les petits commentaires du genre " +
        "6 points, 2 points »), commit 3122307.",
    },
  ]],
];

const TROUS_PAR_PAGE = {};
for (const [u, items] of TROUS_DECLARES) {
  (TROUS_PAR_PAGE[u] ??= []).push(...items);
}
const TROUS_ASSUMES = TROUS_PAR_PAGE[CHEMIN_PAGE] ?? [];

/**
 * RÉFÉRENCES PÉRIMÉES, DÉCLARÉES LE 16/10 : la capture figée ne décrit plus la
 * page, par DÉCISION, et ce n'est pas au site de lui ressembler.
 *
 * Les huit sous-pages ci-dessous étaient servies du 08/10 au 16/10 par le
 * gabarit générique de la maquette (index `sec: false`), et leur capture de
 * `maquette/rendu/` est ce montage : 12 sections « Le problème », « Le
 * déroulé », « Chiffres clés »…, 4 sur cahier-des-charges. Mehdi a décidé le
 * 16/10 qu'elles passent à la page d'offre complète, comme la maquette V3
 * (son `index.json` leur ajoute `sec: true`) : 18 à 20 sections, d'autres
 * titres, un autre ordre. Comparée à l'ancienne capture, chaque page tombait
 * sur plus de 150 anomalies qui ne disent rien d'un défaut.
 *
 * CE QUI RESTE CONTRÔLÉ sur ces pages, et chaque point peut échouer :
 *   · la déclaration est VRAIE : la référence est toujours la capture
 *     générique (sans écran « 03 Problème »), et le site sert bien la page
 *     d'offre complète (écran « 03 Problème » et panneau `#besoin`). Le jour
 *     où la référence est recapturée sur la V3, ou si la page revient au
 *     gabarit générique, la porte échoue et demande de retirer la ligne ;
 *   · le h1 servi est celui de l'index du client, mot pour mot ;
 *   · aucun tiret cadratin visible.
 *
 * CE QUI NE L'EST PLUS, et c'est l'écart déclaré : la structure et le texte
 * ligne à ligne. Les recapturer sur la V3 est le travail qui reste à faire ;
 * la copie de la V3 n'est pas portée telle quelle (« candidats », compteurs,
 * Markdown brut, cartes de référence retirées le 12/10), chaque écart y
 * deviendrait un trou déclaré ici.
 */
const MOTIF_V3 =
  "décision de Mehdi du 16/10 : page d'offre complète comme la maquette V3 " +
  "(index `sec: true`), la capture de maquette/rendu/ est l'ancien montage générique";
const REFERENCES_PERIMEES = {
  "/bureau-etudes/bureau-etude-electrique/": MOTIF_V3,
  "/bureau-etudes/bureau-etude-electronique/": MOTIF_V3,
  "/bureau-etudes/mise-en-conformite-machine/": MOTIF_V3,
  "/offres/depannage-industriel/astreinte/": MOTIF_V3,
  "/offres/depannage-industriel/panne-machine/": MOTIF_V3,
  "/offres/residence/cahier-des-charges/": MOTIF_V3,
  "/offres/residence/prestataire-ou-salarie/": MOTIF_V3,
  "/offres/retrofit/mise-en-conformite-machine/": MOTIF_V3,
};
const PERIMEE = REFERENCES_PERIMEES[CHEMIN_PAGE];

/**
 * Titres que la MAQUETTE rend VIDES, et que le site sert quand même.
 *
 * DÉFAUT MESURÉ, PAS UN CHOIX : `docs/MESURE-MAQUETTE.md` §2 recense huit
 * sous-pages d'offres dont « le h1 et le premier h2 sont vides », parce que le
 * gabarit 03 attend les données `of.*` des six offres NOMMÉES et que ces
 * sous-pages n'en font pas partie. C'est l'arbitrage ouvert n° 4 de
 * `docs/PASSATION.md` : « à corriger dans la maquette, ou à trancher : quel
 * titre ? ». Il reste ouvert, et ce fichier ne le tranche pas.
 *
 * POURQUOI UNE EXCEPTION EST NÉCESSAIRE ICI, et nulle part ailleurs : le
 * contrôle n° 1 compare la référence à SA PROPRE mesure, `h1Rendu: ""` contre
 * le `h1Attendu` de l'index du client. Cette faute ne dépend pas du site :
 * aucune donnée, aucun composant ne peut la faire disparaître. Servir un h1
 * vide pour l'imiter n'était pas une option, c'est le titre unique de la page
 * (CLAUDE.md §6, un mot clé principal par page).
 *
 * CE QUE LE SITE SERT À LA PLACE n'est pas inventé : c'est le titre que le
 * CORPUS RÉDIGÉ du client écrit pour cette page
 * (`maquette/contenu/site/Offres/offres--residence--prestataire-ou-salarie.md`),
 * et pour le h1 c'est aussi celui de `contenu/site/index.json`.
 *
 * { section, rendu, pourquoi }, VÉRIFIÉ DANS LES DEUX SENS : le titre doit
 * être VIDE dans la référence (sinon l'exception est périmée et la porte
 * échoue) et valoir EXACTEMENT `rendu` sur le site.
 */
const TITRES_VIDES_PAR_PAGE = {




  /* Même défaut que les trois pages ci-dessus, mais PARTIEL, et c'est pour
     cela que cette page n'est pas dans la liste des huit de
     `docs/MESURE-MAQUETTE.md` §2 : son h1 se résout bien (« Transfert de
     production », capture `h1Rendu` renseigné), mais quatre bindings `of.*`
     de son héros et son premier h2 restent vides. Le héros s'en passe, ses
     lignes supplémentaires ne gênent pas la porte ; le h2, lui, est comparé.

     LE TITRE SERVI EST ÉCRIT PAR LE CLIENT : c'est la première phrase du
     sous-titre que son corpus pose sous « ## Le problème »
     (`contenu/site/Offres/offres--chantier--transfert-de-production.md`), et
     `coupePunchline` la met en h2 comme sur toutes les autres pages du
     gabarit. Rien n'est rédigé ici pour l'occasion, et servir un h2 VIDE pour
     imiter la capture aurait posé un titre nu dans la page. */
  "/offres/chantier/transfert-de-production/": [
    {
      section: 5,
      rendu: "Une ligne à l'arrêt coûte cher à l'heure.",
      pourquoi:
        "premier h2, section « 03 Problème ». La capture le rend vide " +
        "(`<h2><span class=\"sc-interp\"></span></h2>`). Le site sert la " +
        "première phrase du sous-titre du corpus, comme le gabarit le fait " +
        "partout ailleurs.",
    },
  ],




};
const TITRES_VIDES = TITRES_VIDES_PAR_PAGE[CHEMIN_PAGE] ?? [];

/* ------------------------------------------------------------------ */
/* Normalisation et extraction, le même code pour les deux pages.      */
/* ------------------------------------------------------------------ */

/** Texte normalisé : insécables → espace, apostrophes unifiées, blancs réduits. */
function normalise(texte) {
  return (texte ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[­​]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Évalué DANS la page : les sections directes du <main>, leur premier titre
 * et leurs lignes de texte visible (innerText ignore ce qui est masqué).
 * Le texte revient brut, la normalisation se fait d'un seul côté, ici.
 */
const EXTRAIT = (imbriquees) => {
  const principal = document.querySelector("main");
  if (!principal) return null;
  /* Les pages « édito » génériques rangent leurs sections numérotées DANS la
     section du sommaire : la mesure de la capture les compte toutes, la porte
     aussi (`imbriquees`). Une section englobante garde tout son texte. */
  /* LES SECTIONS DU TÉLÉPHONE NE SONT PAS COMPTÉES (14/10). La couche de
     conversion mobile (photo + CTA) et les pastilles du maillage portent
     `data-mobile-seulement` : `app/globals.css` les masque au-dessus de
     880 px, donc à la largeur de cette porte (1 280 px), et la capture de
     bureau n'a aucune raison de les porter. Les compter décalait l'ordre de
     toutes les sections suivantes, et la porte accusait le déroulé d'avoir
     perdu son texte alors qu'il était à sa place, une section plus loin. */
  const sections = imbriquees
    ? principal.querySelectorAll("section:not([data-mobile-seulement])")
    : principal.querySelectorAll(":scope > section:not([data-mobile-seulement])");
  const sections2 = [...sections].map((section) => {
    /* UN TITRE DU TÉLÉPHONE N'EST PAS LE TITRE DE LA SECTION (15/10), même
       règle que pour les sections : « Chiffres clés », posé au-dessus des
       tuiles 2 x 2 (af93a50), est `data-mobile-seulement`, donc masqué à
       1 280 px. Le premier titre peint au bureau fait foi. */
    const titre = [...section.querySelectorAll("h1, h2, h3")].find(
      (h) => !h.closest("[data-mobile-seulement]"),
    );
    return {
      titre: titre ? titre.innerText : null,
      titreDeRepli: Boolean(titre?.closest("[data-pliable-mobile] > summary")),
      lignes: (section.innerText || "").split("\n"),
    };
  });
  /* LE HTML DU <main>, EN PLUS DU TEXTE VISIBLE. Il sert à vérifier les trous
     déclarés `dansLeHtml` : une phrase invisible parce qu'un pli est fermé
     DOIT rester servie, sans quoi le site la perd aussi pour Google. Sans
     cette lecture, déclarer un trou reviendrait à aveugler la porte. */
  return { sections: sections2, html: principal.innerHTML };
};

/** Les sections d'une page, titres et lignes normalisés, lignes vides ôtées. */
async function lisSections(navigateur, ouvre, imbriquees) {
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  await ouvre(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const brut = await page.evaluate(EXTRAIT, imbriquees);
  await page.close();
  if (!brut) throw new Error("aucun <main> dans la page, rien à mesurer");
  const lues = brut.sections.map((s) => ({
    titre: s.titre === null ? null : normalise(s.titre),
    titreDeRepli: s.titreDeRepli,
    lignes: s.lignes.map(normalise).filter(Boolean),
    texte: normalise(s.lignes.join(" ")),
  }));
  /* Le texte du HTML servi, balisage ôté : ce que Google reçoit, visible ou
     non. `String.fromCharCode(1)` sépare les blocs pour qu'un retrait de
     balises ne recolle pas deux mots voisins en un seul. */
  lues.texteServi = normalise(
    brut.html.replace(/<[^>]*>/g, String.fromCharCode(1)).split(String.fromCharCode(1)).join(" "),
  );
  return lues;
};

/* ------------------------------------------------------------------ */
/* Les contrôles. Chacun pousse ses anomalies, nommées, dans `fautes`. */
/* ------------------------------------------------------------------ */

/** 1. La référence est-elle cohérente avec sa propre mesure ? */
function controleReference(reference, mesure, fautes) {
  if (reference.length !== mesure.nbSections) {
    fautes.push(
      `référence incohérente : ${reference.length} section(s) dans le HTML figé, ` +
        `${mesure.nbSections} annoncées par ${REFERENCE_JSON}`,
    );
  }
  const h1 = reference[0]?.titre ?? "(absent)";
  /* Un h1 VIDE arbitré n'est pas une incohérence : c'est le défaut de la
     maquette déclaré dans TITRES_VIDES_PAR_PAGE, et `controleTitresVides`
     vérifie qu'il est toujours réel. */
  const h1ArbitreVide = h1 === "" && TITRES_VIDES.some((t) => t.section === 0);
  if (!h1ArbitreVide && h1 !== normalise(mesure.h1Attendu)) {
    fautes.push(`référence incohérente : h1 « ${h1} » au lieu de « ${mesure.h1Attendu} »`);
  }
}

/**
 * Les titres vides déclarés sont-ils encore vides dans la référence ?
 *
 * L'autre sens (le site sert bien `rendu`) est contrôlé par
 * `controleStructure`, qui compare chaque titre à sa forme attendue.
 */
function controleTitresVides(reference, fautes) {
  for (const arbitrage of TITRES_VIDES) {
    const section = reference[arbitrage.section];
    if (!section) {
      fautes.push(
        `exception fausse : la section ${arbitrage.section} déclarée dans ` +
          `TITRES_VIDES_PAR_PAGE n'existe pas dans la référence.`,
      );
      continue;
    }
    if (section.titre !== "") {
      fautes.push(
        `exception devenue inutile : le titre de la section ${arbitrage.section} ` +
          `de la référence n'est plus vide (« ${section.titre ?? "(aucun)"} »). ` +
          `Retirez-la de TITRES_VIDES_PAR_PAGE.`,
      );
    }
  }
}

/**
 * 2. Les sections ajoutées déclarées sont-elles exactement celles rendues ?
 * Retourne les sections du site SANS les ajouts déclarés, prêtes à être
 * alignées une à une sur la référence.
 */
function retireAjoutsDeclares(site, texteReference, fautes) {
  const rangsRetires = new Set();
  for (const ajout of SECTIONS_AJOUTEES) {
    const section = site[ajout.rang];
    const attendu = ajout.texte ? normalise(ajout.texte) : null;
    const correspond = section
      ? (attendu !== null ? section.texte === attendu : ajout.motif.test(section.texte))
      : false;
    if (!correspond) {
      fautes.push(
        `exception devenue inutile ou fausse : la section ajoutée déclarée au rang ` +
          `${ajout.rang} (« ${ajout.texte} ») n'est pas rendue telle quelle.\n` +
          `    Raison déclarée : ${ajout.pourquoi}\n` +
          `    Rendu à ce rang : « ${section ? section.texte.slice(0, 120) : "(aucune section)"} »`,
      );
      continue;
    }
    if (attendu !== null && texteReference.includes(attendu)) {
      fautes.push(
        `exception fausse : le texte de la section ajoutée au rang ${ajout.rang} existe ` +
          `dans la référence, ce n'est donc pas un ajout`,
      );
      continue;
    }
    rangsRetires.add(ajout.rang);
  }
  return site.filter((_, rang) => !rangsRetires.has(rang));
}

/** 3. Même nombre de sections, mêmes titres, même ordre.
 *  Retourne le nombre de titres de repli acceptés. */
function controleStructure(reference, site, fautes) {
  let titresDeRepli = 0;
  if (site.length !== reference.length) {
    const titres = (liste) => liste.map((s) => s.titre ?? "(sans titre)").join(" · ");
    fautes.push(
      `${site.length} section(s) servies hors ajouts déclarés, ${reference.length} dans la référence.\n` +
        `    Référence : ${titres(reference)}\n` +
        `    Site      : ${titres(site)}`,
    );
    return titresDeRepli;
  }
  reference.forEach((section, rang) => {
    const attendu = titreAttenduAuRendu(rang, section.titre);
    if (site[rang].titre === attendu) return;
    if (attendu === null && estUnTitreDeRepli(site[rang])) {
      titresDeRepli += 1;
      return;
    }
    fautes.push(
      `section ${rang} : titre « ${site[rang].titre ?? "(aucun)"} » au lieu de ` +
        `« ${attendu ?? "(aucun)"} »`,
    );
  });
  return titresDeRepli;
}

/** Le titre servi est-il un titre de repli déclaré, posé dans sa bascule ? */
function estUnTitreDeRepli(section) {
  const titre = section.titre?.toLowerCase();
  return (
    section.titreDeRepli &&
    TITRES_DE_REPLI.some((t) => normalise(t.titre).toLowerCase() === titre)
  );
}

/**
 * La forme attendue au rendu du TITRE d'une section, titres vides arbitrés.
 *
 * Un titre que la maquette rend vide et qui est déclaré dans
 * TITRES_VIDES_PAR_PAGE attend sa forme `rendu` sur le site. Partout ailleurs,
 * c'est le titre de la référence, au mot.
 */
function titreAttenduAuRendu(rang, titreReference) {
  if (titreReference !== "") return titreReference;
  const arbitrage = TITRES_VIDES.find((t) => t.section === rang);
  return arbitrage ? normalise(arbitrage.rendu) : titreReference;
}

/** La forme attendue au rendu d'une ligne de la référence, cadratins arbitrés. */
function attendueAuRendu(ligne) {
  const arbitrage = TIRETS_REMPLACES.find((t) => normalise(t.maquette) === ligne);
  return arbitrage ? normalise(arbitrage.rendu) : ligne;
}

/** Un trou assumé couvre-t-il cette ligne de cette section ? */
function estUnTrouAssume(rang, ligne) {
  return TROUS_ASSUMES.some(
    (t) => t.section === rang && normalise(t.ligne) === ligne,
  );
}

/**
 * 4 bis. UN TROU DÉCLARÉ `dansLeHtml` DOIT RESTER SERVI.
 *
 * C'est ce qui empêche une déclaration de trou de devenir un aveuglement.
 * Déclarer « cette phrase n'est pas visible » est légitime quand un pli fermé
 * la cache : le visiteur l'ouvre, et Google la lit de toute façon, puisqu'elle
 * est dans le HTML envoyé. Déclarer la même chose quand la phrase a QUITTÉ le
 * HTML serait couvrir une perte de contenu.
 *
 * La porte exige donc, pour ces trous-là, la phrase dans le texte servi,
 * visible ou non. Si elle n'y est plus, le trou n'est plus assumé : c'est une
 * anomalie, et elle le dit avec son motif.
 */
function controleTrousServis(site, fautes) {
  const aVerifier = TROUS_ASSUMES.filter((trou) => trou.dansLeHtml);
  if (aVerifier.length === 0) return 0;
  if (typeof site.texteServi !== "string" || site.texteServi.length === 0) {
    fautes.push("le texte servi n'a pas pu être lu : les trous « dansLeHtml » ne sont pas vérifiables");
    return 0;
  }
  for (const trou of aVerifier) {
    if (!site.texteServi.includes(normalise(trou.ligne))) {
      fautes.push(
        `trou déclaré « dansLeHtml » mais ABSENT DU HTML SERVI, section ${trou.section} :\n` +
          `    « ${trou.ligne.slice(0, 120)} »\n` +
          `    motif déclaré : ${trou.pourquoi}`,
      );
    }
  }
  return aVerifier.length;
}

/** 4. Chaque ligne de la référence est rendue, mot pour mot, dans sa section. */
function controleTexte(reference, site, fautes) {
  const commun = Math.min(reference.length, site.length);
  for (let rang = 0; rang < commun; rang += 1) {
    for (const ligne of reference[rang].lignes) {
      const attendue = attendueAuRendu(ligne);
      const presente = site[rang].texte.includes(attendue);
      if (estUnTrouAssume(rang, ligne)) {
        if (presente) {
          fautes.push(
            `exception devenue inutile : le trou assumé de la section ${rang} ` +
              `(« ${ligne.slice(0, 90)} ») est maintenant rendu. Retirez-le de TROUS_ASSUMES.`,
          );
        }
        continue;
      }
      if (!presente) {
        fautes.push(`section ${rang} : phrase de la référence absente du rendu :\n    « ${attendue} »`);
      }
    }
  }
}

/** 5. Les arbitrages de cadratin déclarés sont-ils encore réels et utiles ? */
function controleTirets(reference, site, fautes) {
  const texteReference = reference.map((s) => s.texte).join("\n");
  for (const section of site) {
    const fautive = section.lignes.find((l) => l.includes("—"));
    if (fautive) {
      fautes.push(`tiret cadratin visible sur le site : « ${fautive.slice(0, 110)} »`);
    }
  }
  for (const ligne of reference.flatMap((s) => s.lignes)) {
    if (ligne.includes("—") && !TIRETS_REMPLACES.some((t) => normalise(t.maquette) === ligne)) {
      fautes.push(
        `la référence porte un cadratin non arbitré dans TIRETS_REMPLACES :\n    « ${ligne.slice(0, 110)} »`,
      );
    }
  }
  for (const arbitrage of TIRETS_REMPLACES) {
    if (!texteReference.includes(normalise(arbitrage.maquette))) {
      fautes.push(
        `exception devenue inutile : « ${arbitrage.maquette} » n'existe plus dans la référence. ` +
          `Retirez-la de TIRETS_REMPLACES.`,
      );
    }
  }
  for (const trou of TROUS_ASSUMES) {
    const section = reference[trou.section];
    if (!section || !section.lignes.includes(normalise(trou.ligne))) {
      fautes.push(
        `exception fausse : le trou assumé « ${trou.ligne} » (section ${trou.section}) ` +
          `n'existe pas dans la référence. Retirez-le de TROUS_ASSUMES.`,
      );
    }
  }
}

/**
 * La page d'une RÉFÉRENCE PÉRIMÉE (voir REFERENCES_PERIMEES) : la déclaration
 * est-elle toujours vraie, et ce qui reste mesurable est-il tenu ?
 */
async function controlePerimee() {
  const fautes = [];
  if (/data-screen-label="03 Probl[eè]me"/.test(htmlReference)) {
    fautes.push(
      "exception devenue inutile : la référence porte maintenant l'écran « 03 Problème » " +
        "de la page d'offre. Retirez la page de REFERENCES_PERIMEES et comparez-la.",
    );
  }
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  const reponse = await page.goto(SITE + CHEMIN_PAGE, { waitUntil: "load", timeout: 60_000 });
  if (!reponse?.ok()) throw new Error(`${SITE + CHEMIN_PAGE} répond ${reponse?.status()}`);
  const etat = await page.evaluate(() => {
    const principal = document.querySelector("main");
    return {
      h1: principal?.querySelector("h1")?.innerText ?? null,
      probleme: !!principal?.querySelector('[data-screen-label="03 Problème"]'),
      panneau: !!principal?.querySelector("#besoin"),
      lignes: (principal?.innerText ?? "").split("\n"),
    };
  });
  await page.close();
  if (!etat.probleme || !etat.panneau) {
    fautes.push(
      "exception devenue inutile : le site ne sert plus la page d'offre complète " +
        `(écran « 03 Problème » ${etat.probleme ? "présent" : "absent"}, panneau #besoin ` +
        `${etat.panneau ? "présent" : "absent"}). Retirez la page de REFERENCES_PERIMEES.`,
    );
  }
  if (normalise(etat.h1) !== normalise(mesure.h1Attendu)) {
    fautes.push(`h1 « ${etat.h1} » au lieu de « ${mesure.h1Attendu} » (index du client)`);
  }
  const cadratin = etat.lignes.map(normalise).find((l) => l.includes("—"));
  if (cadratin) fautes.push(`tiret cadratin visible sur le site : « ${cadratin.slice(0, 110)} »`);

  console.log(
    `${CHEMIN_PAGE} : RÉFÉRENCE PÉRIMÉE DÉCLARÉE (${PERIMEE}). ` +
      "Contrôlés : déclaration toujours vraie, h1 de l'index, aucun cadratin. " +
      "Non comparés : structure et texte ligne à ligne.",
  );
  if (fautes.length === 0) {
    console.log("page d'offre conforme à ce qui reste mesurable");
    return 0;
  }
  console.error(`\n${fautes.length} anomalie(s) :\n`);
  for (const faute of fautes) console.error(`  · ${faute}\n`);
  return 1;
}

/* ------------------------------------------------------------------ */
/* Déroulé.                                                            */
/* ------------------------------------------------------------------ */

const mesure = JSON.parse(readFileSync(REFERENCE_JSON, "utf8"));
/* Les décisions de copie (lib/decisions-copie.ts) sont appliquées à la
   référence avant toute comparaison : la donnée les porte déjà, la capture non.

   LA PAGE EST PASSÉE EN SECOND ARGUMENT depuis le 12/10 : certaines décisions
   ne valent que pour des pages nommées (« expert technique » sur bureau
   d'études et travaux industriels). Sans cette identité, le module ne peut pas
   savoir laquelle appliquer, la capture resterait à « technicien » et la porte
   refuserait la donnée au lieu de refuser un vrai défaut. L'arbitrage reste
   déclaré dans le module, à un seul endroit : la porte le consulte, elle ne le
   redéclare pas. */
const htmlReference = appliqueDecisions(readFileSync(REFERENCE_HTML, "utf8"), CHEMIN_PAGE);
/* Sections imbriquées : les pages « édito » génériques rangent leurs sections
   numérotées dans un <article>, à l'intérieur d'une section. */
const IMBRIQUEES = /<article\b[^]*?<section\b/.test(htmlReference);

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 0;
try {
  if (PERIMEE) {
    code = await controlePerimee();
  } else {
  const [reference, site] = await Promise.all([
    lisSections(navigateur, (page) =>
      page.setContent(
        `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>${htmlReference}</body></html>`,
        { waitUntil: "load" },
      ),
      IMBRIQUEES,
    ),
    lisSections(navigateur, async (page) => {
      const reponse = await page.goto(SITE + CHEMIN_PAGE, { waitUntil: "load", timeout: 60_000 });
      if (!reponse?.ok()) throw new Error(`${SITE + CHEMIN_PAGE} répond ${reponse?.status()}`);
    }, IMBRIQUEES),
  ]);

  const fautes = [];
  controleReference(reference, mesure, fautes);
  const texteReference = reference.map((s) => s.texte).join("\n");
  const siteAligne = retireAjoutsDeclares(site, texteReference, fautes);
  const titresDeRepli = controleStructure(reference, siteAligne, fautes);
  controleTitresVides(reference, fautes);
  controleTexte(reference, siteAligne, fautes);
  controleTirets(reference, site, fautes);
  const trousServis = controleTrousServis(site, fautes);

  const lignes = reference.reduce((somme, s) => somme + s.lignes.length, 0);
  console.log(
    `${CHEMIN_PAGE} contre ${REFERENCE_HTML.replace(RACINE, "")} : ` +
      `${reference.length} sections de référence, ${site.length} servies ` +
      `(${SECTIONS_AJOUTEES.length} ajout(s) déclaré(s)), ${lignes} lignes de texte comparées, ` +
      `${titresDeRepli} titre(s) de repli accepté(s), ` +
      `${TIRETS_REMPLACES.length} cadratin(s) arbitré(s), ${TROUS_ASSUMES.length} trou(s) assumé(s) ` +
      `dont ${trousServis} vérifié(s) présent(s) dans le HTML servi.`,
  );

  if (fautes.length > 0) {
    console.error(`\n${fautes.length} anomalie(s) :\n`);
    for (const faute of fautes) console.error(`  · ${faute}\n`);
    code = 1;
  } else {
    console.log("rendu d'offre conforme à la référence");
  }
  }
} finally {
  await navigateur.close();
}
process.exit(code);
