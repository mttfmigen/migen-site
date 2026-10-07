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
const FIL_ARIANE = {
  rang: 0,
  /* Le fil d'Ariane est la SEULE exception commune à tout le gabarit, et son
     texte change à chaque page : il est donc décrit par une règle, pas par une
     chaîne. Une chaîne par page obligerait à éditer cette porte pour chaque
     nouvelle page, et la liste finirait par tout autoriser. */
  motif: /^Accueil \/ /,
  pourquoi:
    "fil d'Ariane du site : la capture fige le <main> de l'application autonome, " +
    "qui n'a pas de navigation de site. Le fil situe la page dans l'arborescence " +
    "réelle (maillage interne et données structurées), il ne réécrit aucun mot " +
    "de la maquette.",
};

/**
 * Exceptions PROPRES à une page, en plus du fil d'Ariane. Clé : le chemin.
 * Vide pour une page qui n'en a pas, ce qui est le cas attendu.
 */
const AJOUTS_PAR_PAGE = {};

const SECTIONS_AJOUTEES = [
  FIL_ARIANE,
  ...(AJOUTS_PAR_PAGE[CHEMIN_PAGE] ?? []),
];

/**
 * Tirets cadratins de la référence remplacés dans le rendu, phrase par
 * phrase : { maquette, rendu, pourquoi }. La forme `maquette` doit exister
 * dans la référence et la forme `rendu` sur le site, sinon la porte échoue.
 * VIDE AU 06/10 : la capture d'offres--residence ne porte aucun cadratin,
 * et la porte le re-vérifie à chaque passage.
 */
const TIRETS_PAR_PAGE = {};
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
   * sur le site, sinon l'exception est fausse et la porte échoue. */

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
     /offres/residence/prestataire-ou-salarie/ — déclaré le 07/10.

     UN SEUL MOTIF, six fois : la maquette affiche la SYNTAXE MARKDOWN BRUTE du
     corpus dans le titre des six cartes de « Nos références ». Son gabarit lit
     le libellé du lien pour l'étiquette de la carte (rendue juste au-dessus,
     en capitales), et laisse `[libellé](/preuves/…/)` tel quel dans le titre.
     C'est un défaut de rendu de la maquette, pas une formulation du client :
     la chaîne complète n'existe nulle part dans son texte rédigé, seul le
     libellé existe.

     CE N'EST PAS UNE REFORMULATION : le libellé est rendu mot pour mot, deux
     fois comme la maquette le rend (étiquette puis titre), et la carte pointe
     sur l'URL que les crochets portaient. Ce qui n'est pas rendu, ce sont les
     crochets, la parenthèse et le chemin, c'est-à-dire la syntaxe. Le jour où
     la maquette résout son lien, ces six lignes disparaîtront de sa capture et
     la porte réclamera le retrait de ces six exceptions. */
  ["/offres/residence/prestataire-ou-salarie/", [
    "[Renfort d'équipes sur plusieurs sites, confort thermique](/preuves/groupe-atlantic/)",
    "[Pilotage du service pendant une transition, industrie](/preuves/eriks/)",
    "[Renfort continu d'une équipe interne, site proche de Paris](/preuves/fdj/)",
    "[Technicien polyvalent sur parc hétérogène, papier et emballage](/preuves/vpk/)",
    "[Renfort sur site agroalimentaire, Belgique](/preuves/mccain-belgique/)",
    "[Maintenance tenue pendant les congés d'été](/preuves/ogf-arret-estival/)",
  ].map((ligne) => ({
    section: 12,
    ligne,
    pourquoi:
      "syntaxe Markdown brute dans le titre de carte : défaut de rendu de la " +
      "maquette. Le site rend le libellé seul, mot pour mot, et pointe sur " +
      "l'URL que les crochets portaient.",
  }))],

  /* ------------------------------------------------------------------
     /offres/retrofit/remise-en-etat/ — déclaré le 07/10.

     DEUX FORMULATIONS de sa capture sont interdites, et les deux le sont
     NOMMÉMENT par `scripts/verifie-interdits.mjs`, pas par appréciation :

       · « +200 » et sa légende « Clients industriels accompagnés », deuxième
         carte de la bande de chiffres. L'interdit `["+200", …]` de ce contrôle
         porte sa raison : le compte tenu est « plus de 120 clients, dont plus
         de 80 réguliers ». C'est un chiffre FAUX, et il avait déjà été rendu
         cinq fois avant que ce contrôle existe. La carte n'est donc pas rendue
         sous la forme de la maquette ; elle sert le chiffre juste du corpus de
         CETTE page (« + 80 » / « Clients réguliers · sur plus de 120 clients
         industriels. »), qui était déjà dans son fichier de données avant ce
         portage. Ce n'est pas une reformulation de la phrase interdite : c'est
         une autre donnée, vraie, que le client a écrite lui-même.
       · « Maintenir des machines conçues sur mesure », titre de la carte
         Tournaire de « Ils nous ont confié une mission comparable ».
         « sur mesure » est proscrit (`verifie-interdits.mjs` : « dire ce qui
         s'adapte, et à quoi »). La carte reste rendue, avec son client, sa
         photo et son lien vers l'étude de cas : seul son titre est vide, parce
         qu'un synonyme serait une faute (décision de Mehdi du 05/10).

     DEUX AUTRES FORMULATIONS ONT ÉTÉ RENCONTRÉES ET GARDÉES, aucune règle du
     dépôt ne les interdisant, et elles sont à faire arbitrer par Mehdi :
     « La machine d'occasion achetée à bon prix » et « avant d'engager le
     moindre euro » (aucun montant), et « La maintenance en abonnement, au
     forfait mensuel. » dans la carte « Zéro arrêt » du maillage (un modèle de
     facturation, sans montant, à la différence du « prix mensuel fixe » que la
     capture de `/offres/zero-arret/` porte et que son portage a écarté).
     Elles sont rendues, mot pour mot.

     POUR MÉMOIRE, ÉCART À SIGNALER À MEHDI : la page pilote
     `/offres/residence/`, validée le 06/10, rend elle aussi « +200 » /
     « Clients industriels accompagnés » dans sa bande de chiffres. Son fichier
     de données n'est pas touché ici (consigne : un fichier par page), mais les
     deux pages se contredisent et c'est à lui de trancher. */
  ["/offres/retrofit/remise-en-etat/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert le chiffre juste du corpus de cette page.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
  ]],

  /* ------------------------------------------------------------------
     /offres/depannage-industriel/astreinte/ — déclaré le 07/10.

     DEUX MOTIFS, et un seul des deux vient du contrat de rédaction.

     1. « +200 » et sa légende « Clients industriels accompagnés », troisième
        carte de la bande de chiffres. Chiffre FAUX, interdit NOMMÉMENT par
        `scripts/verifie-interdits.mjs` : le compte tenu par le dépôt est
        « plus de 120 clients, dont plus de 80 réguliers ». Le corpus de cette
        page l'écrit pourtant (« **+200** : clients industriels accompagnés »),
        et la maquette le rend : c'est une contradiction entre le corpus du
        client et le contrat du projet, et c'est le contrat qui l'emporte.
        La carte reste rendue, avec le compte tenu par le dépôt (« + 120 » /
        « Clients industriels, dont plus de 80 réguliers. »), qui était déjà
        dans le fichier de données de cette page avant ce portage. Ce n'est pas
        une reformulation de la phrase interdite : c'est une autre donnée.
        Même arbitrage que `/offres/retrofit/remise-en-etat/` ci-dessus, et le
        même écart reste à signaler à Mehdi sur la page pilote
        `/offres/residence/`, qui rend « +200 ».

     2. Les six titres de carte de « Nos références » : la maquette y affiche
        la SYNTAXE MARKDOWN BRUTE du corpus. Son gabarit lit le libellé du lien
        pour l'étiquette (rendue juste au-dessus, en capitales) et laisse
        `[libellé](/preuves/…/)` tel quel dans le titre. Défaut de rendu de la
        maquette, pas une formulation du client : la chaîne complète n'existe
        nulle part dans son texte rédigé. Même motif que
        `/offres/residence/prestataire-ou-salarie/`, à une section près.
        CE N'EST PAS UNE REFORMULATION : le libellé est rendu mot pour mot,
        deux fois comme la maquette le rend, et la carte pointe sur l'URL que
        les crochets portaient. Seule la syntaxe n'est pas rendue.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ : la capture de cette page ne porte ni prix,
     ni délai chiffré autre que « rappel dans l'heure », ni tiret cadratin. */
  ["/offres/depannage-industriel/astreinte/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert ce compte-là, qui n'est pas un synonyme mais une autre " +
        "donnée, vraie.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
    ...[
      "[Fonderie tenue](/preuves/stellantis-fonderie-sept-fons/)",
      "[Maintenance en 3x8 sur lignes alimentaires, agroalimentaire](/preuves/danone-lignes-de-production/)",
      "[Curatif continu sur convoyeurs et trieurs, logistique](/preuves/gls-maintenance-curative/)",
      "[Maintenance tenue pendant les congés](/preuves/ogf-arret-estival/)",
      "[Site ouvert nuit et week-end, logistique](/preuves/amazon-centre-logistique/)",
      "[Renfort en environnement à risque chimique, traitement des eaux](/preuves/suez-remise-en-etat/)",
    ].map((ligne) => ({
      section: 11,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans le titre de carte : défaut de rendu de la " +
        "maquette. Le site rend le libellé seul, mot pour mot, et pointe sur " +
        "l'URL que les crochets portaient.",
    })),
  ]],

  /* ------------------------------------------------------------------
     /offres/residence/cahier-des-charges/ — déclaré le 07/10.

     LES DEUX MÊMES MOTIFS que `/offres/depannage-industriel/astreinte/` et
     `/offres/retrofit/remise-en-etat/` ci-dessus, aux sections de CETTE page
     (19 sections : la capture porte en plus les écrans « Complément 4 » et
     « Complément 5 », donc « Nos références » tombe au rang 13).

     1. « +200 » et sa légende « Clients industriels accompagnés », troisième
        carte de la bande de chiffres. Chiffre FAUX, interdit NOMMÉMENT par
        `scripts/verifie-interdits.mjs`. Le corpus de cette page l'écrit
        (« **+200** : clients industriels accompagnés ») et la maquette le
        rend : le contrat du projet l'emporte sur le corpus. La carte reste
        rendue avec le compte tenu par le dépôt (« + 120 » / « Clients
        industriels Migen, dont plus de 80 réguliers. »), qui était déjà dans
        le fichier de données de cette page avant ce portage. Ce n'est pas une
        reformulation de la phrase interdite : c'est une autre donnée, vraie.

     2. Les six titres de carte de « Nos références » : syntaxe Markdown brute
        laissée par la maquette dans le titre, alors que son propre gabarit a
        bien lu le libellé pour en faire l'étiquette rendue juste au-dessus en
        capitales. Le site rend le libellé mot pour mot, deux fois comme la
        maquette le rend, et la carte pointe sur l'URL que les crochets
        portaient : seule la syntaxe n'est pas rendue.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ. La capture de cette page ne porte aucun prix,
     aucun délai chiffré autre que « rappel dans l'heure », aucun tiret
     cadratin, aucun mot proscrit. Deux formulations ont été RENCONTRÉES ET
     GARDÉES, aucune règle du dépôt ne les interdisant : « Reprise d'un parc en
     8 semaines, fonderie automobile » (le récit d'une mission faite, pas un
     délai d'intervention promis) et « La maintenance en abonnement, au forfait
     mensuel. » dans la carte « Zéro arrêt » du maillage (un mode de
     facturation sans montant, même arbitrage que
     `/offres/retrofit/remise-en-etat/`).

     À SIGNALER À MEHDI, et ce n'est pas tranché ici : la phrase de date de la
     deuxième carte de « Nos références » se termine par « 6 techniciens,. »
     dans la capture ET dans le corpus
     (`maquette/contenu/site/Offres/offres--residence--cahier-des-charges.md`).
     C'est une coquille de son corpus, pas du portage : elle est rendue telle
     quelle, parce que la corriger serait réécrire son texte. */
  ["/offres/residence/cahier-des-charges/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert ce compte-là, qui n'est pas un synonyme mais une autre " +
        "donnée, vraie.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
    ...[
      "[Contrat de préventif annuel multi-sites](/preuves/veepee-sites-lyon/)",
      "[Reprise d'un parc en 8 semaines, fonderie automobile](/preuves/stellantis-fonderie-sept-fons/)",
      "[Dispositif reproduit sur un second site, logistique](/preuves/amazon-nouveau-site/)",
      "[Renfort d'équipes sur plusieurs sites, confort thermique](/preuves/groupe-atlantic/)",
      "[Premier contrat hors de France, agroalimentaire](/preuves/mccain-belgique/)",
      "[Maintenance en 3x8 sur lignes alimentaires, agroalimentaire](/preuves/danone-lignes-de-production/)",
    ].map((ligne) => ({
      section: 13,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans le titre de carte : défaut de rendu de la " +
        "maquette. Le site rend le libellé seul, mot pour mot, et pointe sur " +
        "l'URL que les crochets portaient.",
    })),
  ]],

  /* ------------------------------------------------------------------
     /offres/full-service/ — déclaré le 07/10, capture à 21 sections.

     TROIS LIGNES de sa capture ne sont pas rendues, et aucune n'est réécrite.

       1 et 2. « +200 » et sa légende « Clients industriels accompagnés » :
         chiffre interdit nommément par `scripts/verifie-interdits.mjs`, qui
         donne le compte tenu, « plus de 120 clients, dont plus de 80
         réguliers ». Une légende sans son chiffre ne se lit pas : les deux
         lignes de la carte sont écartées ensemble, et la bande du héros rend
         ses deux autres chiffres. MÊME ARBITRAGE que
         `/offres/residence/cahier-des-charges/`, déclaré le même jour.
         À SIGNALER À MEHDI : la page pilote `/offres/residence/`, qu'il a
         validée le 06/10, rend encore « +200 ». Les deux traitements coexistent
         aujourd'hui sur le site ; c'est lui qui tranche, pas une chaîne.

       3. « Ou appelez le , du lundi au vendredi de 8h00 à 18h30. Rappel dans
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
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "Il n'est pas remplacé par un synonyme, il n'est pas rendu.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
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
     /offres/depannage-industriel/panne-machine/ — déclaré le 07/10.

     AUCUNE COPIE INTERDITE dans cette capture : scannée ligne à ligne contre
     la liste du contrat (CLAUDE.md §9) et contre les prix, les délais chiffrés
     et les cadratins. Le seul résultat est « La maintenance en abonnement, au
     forfait mensuel. » (carte Zéro arrêt du maillage), qui nomme un MODE de
     facturation sans aucun montant : elle est rendue, mot pour mot, et
     signalée à Mehdi.

     UN SEUL TROU, et ce n'est pas une question de copie : une CIBLE QUI
     N'EXISTE PAS. Le quatrième cas lié de la section « Ils nous ont confié une
     mission comparable » pointe vers `/preuves/savoye/`
     (`maquette/contenu/site/cas-lies.json`). Cette URL n'est NI dans les 248
     pages de `contenu/site/index.json`, NI servie par le site (404 mesuré le
     07/10). La règle du gabarit est écrite dans `LiensOffre.tsx` : une cible
     refusée fait disparaître la carte, libellé compris, et on ne la rafistole
     pas vers une cible de repli. Les trois autres cas (OGF, les deux Amazon)
     sont rendus avec les octets de leurs photos extraits de la maquette. */
  ["/offres/depannage-industriel/panne-machine/", [
  ]],

  /* ------------------------------------------------------------------
     /offres/bureau-etudes/ — déclaré le 07/10.

     UNE SEULE FORMULATION de sa capture est interdite, et c'est le PREMIER
     interdit de `scripts/verifie-interdits.mjs` : « +200 ». Le compte tenu par
     le dépôt est « plus de 120 clients, dont plus de 80 réguliers », et ce
     contrôle existe précisément parce que « +200 clients » est passé cinq fois
     à travers les listes de mots. La maquette l'écrit dans la deuxième cellule
     de sa bande de chiffres.

     ELLE N'EST PAS REFORMULÉE (décision de Mehdi du 05/10) et le chiffre juste
     n'est pas servi à sa place : la cellule entière n'est pas rendue, sa
     légende comprise, parce qu'une légende sans son chiffre ne se lit pas.
     Même traitement que la troisième carte de chiffres de
     `/offres/zero-arret/`. La bande en rend donc deux sur trois.

     À FAIRE ARBITRER PAR MEHDI, et c'est une INCOHÉRENCE DU DÉPÔT, pas de
     cette page : la page pilote `/offres/residence/`, validée le 06/10, REND
     « +200 / Clients industriels accompagnés » (son fichier de données le
     porte). Deux pages du même gabarit ne peuvent pas dire deux comptes
     différents. Soit la maquette corrige son chiffre et les deux pages le
     servent, soit la cellule disparaît aussi de la pilote. Aucune des deux
     décisions n'appartient à cette page.

     AUTRE FORMULATION RENCONTRÉE ET GARDÉE : « Besoin de savoir ce que
     coûterait votre étude avant d'aller plus loin ? », « Combien coûte une
     étude ? » et « Faire chiffrer mon étude » parlent de coût sans énoncer
     aucun prix. Le contrat interdit les prix, pas le mot. Rendues mot pour
     mot. */
  ["/offres/bureau-etudes/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, premier interdit de `scripts/verifie-interdits.mjs` : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La cellule n'est pas rendue.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende de la même cellule. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes sont écartées ensemble.",
    },
  ]],

  /* ------------------------------------------------------------------
     /offres/chantier/transfert-de-production/ — déclaré le 07/10.

     UN SEUL MOTIF, un chiffre faux : la bande « 01 Chiffres » de sa capture
     porte QUATRE cartes, dont les DEUX PREMIÈRES sont identiques, « +200 /
     Clients industriels accompagnés ». Le doublon n'est pas un défaut de
     rendu, le corpus l'écrit deux fois lui aussi
     (`contenu/site/Offres/offres--chantier--transfert-de-production.md`,
     « ## Chiffres clés »).

     « +200 » EST INTERDIT par le contrat du projet : le compte tenu est
     « plus de 120 clients, dont plus de 80 réguliers », et
     `scripts/verifie-interdits.mjs` le refuse nommément parce que ce faux
     chiffre est déjà passé cinq fois. Il n'est donc pas rendu, et il n'est
     PAS REFORMULÉ non plus (décision de Mehdi du 05/10, un synonyme est une
     faute) : écrire « + 120 » sous la légende de la maquette serait réécrire
     sa carte.

     CONSÉQUENCE VISIBLE, ASSUMÉE : la bande ne rend que DEUX cartes, « 4 /
     Agences… » et « 10 % / Des candidats retenus… », les deux seules dont le
     chiffre soit juste. La légende « Clients industriels accompagnés » n'est
     pas interdite en soi, mais une légende sans son chiffre ne se lit pas :
     les deux lignes de la carte sont déclarées ensemble, et chaque
     déclaration couvre les deux occurrences du doublon. */
  ["/offres/chantier/transfert-de-production/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux et nommément interdit (`verifie-interdits.mjs`) : le " +
        "compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte n'est pas rendue, et le chiffre n'est pas remplacé.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende de la carte « +200 » ci-dessus. Une légende sans son chiffre " +
        "ne se lit pas : la carte entière n'est pas rendue. La légende n'est " +
        "pas interdite en soi, et elle revient le jour où le client fournit " +
        "le chiffre juste.",
    },
  ]],

  /* ------------------------------------------------------------------
     /offres/retrofit/mise-en-conformite-machine/ — déclaré le 07/10.

     DEUX MOTIFS, et aucune reformulation.

     1. « +200 » et sa légende « Clients industriels accompagnés », troisième
        carte de la bande de chiffres. Chiffre FAUX, interdit NOMMÉMENT par
        `scripts/verifie-interdits.mjs` : le compte tenu par le dépôt est
        « plus de 120 clients, dont plus de 80 réguliers ». Le corpus de cette
        page l'écrit pourtant (« **+200** : clients industriels accompagnés »)
        et la maquette le rend : contradiction entre le corpus du client et le
        contrat du projet, et c'est le contrat qui l'emporte. La carte reste
        rendue, avec le compte tenu par le dépôt (« + 80 » / « Clients
        réguliers · sur plus de 120 clients industriels. »), chaîne déjà servie
        par `/offres/retrofit/remise-en-etat/` : ce n'est pas un synonyme de la
        phrase écartée, c'est une autre donnée, vraie. Même arbitrage que cette
        page et que `/offres/depannage-industriel/astreinte/`.

     2. Les quatre titres de carte de « Nos références » : la maquette y
        affiche la SYNTAXE MARKDOWN BRUTE du corpus, et ici la LIGNE ENTIÈRE,
        libellé du lien et suite comprises. Son gabarit lit le libellé pour
        l'étiquette (rendue juste au-dessus, en capitales) et laisse
        `[libellé](/preuves/…/) · suite` tel quel dans le titre. Défaut de
        rendu de la maquette, pas une formulation du client : la chaîne
        complète n'existe nulle part dans son texte rédigé. Même motif que
        `/offres/residence/prestataire-ou-salarie/` et
        `/offres/depannage-industriel/astreinte/`, à une section près.
        CE N'EST PAS UNE REFORMULATION : tous les mots sont rendus, au mot,
        dans la même carte — le libellé en titre (et en étiquette, comme la
        maquette le rend deux fois), la suite du corpus en ligne de date — et
        la carte pointe sur l'URL que les crochets portaient. Seule la syntaxe
        n'est pas rendue. Le jour où la maquette résout ses liaisons, ces
        quatre lignes disparaissent de sa capture et la porte réclame le
        retrait de ces quatre exceptions.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ : la capture de cette page ne porte ni prix,
     ni délai chiffré autre que « rappel dans l'heure », ni tiret cadratin. La
     seule formulation limite rencontrée est « La maintenance en abonnement, au
     forfait mensuel. », carte « Zéro arrêt » de son maillage : un modèle de
     facturation sans montant, gardé mot pour mot comme sur
     `/offres/retrofit/remise-en-etat/`, et à faire arbitrer par Mehdi. */
  ["/offres/retrofit/mise-en-conformite-machine/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert ce compte-là, qui n'est pas un synonyme mais une autre " +
        "donnée, vraie.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
    ...[
      "[Étude de cas JOINT LYONNAIS : défaillances machines](/preuves/joint-lyonnais/) · Lyon, depuis février 2024. Diagnostic sur site et plusieurs solutions chiffrées, calées sur le budget d'une PME, plutôt qu'un rachat de matériel.",
      "[Étude de cas SUEZ : remise en état d'un site](/preuves/suez-remise-en-etat/) · Un technicien électromécanicien mobilisé six mois en environnement à risque chimique.",
      "[Étude de cas EIFFAGE : partenariat](/preuves/eiffage/) · Trois techniciens en préventif sur une installation photovoltaïque de grande envergure.",
      "[Étude de cas SOPREMA : travaux ponctuels](/preuves/soprema/) · Montage, déplacement de machines et renfort technique sur chantiers.",
    ].map((ligne) => ({
      section: 14,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans le titre de carte : défaut de rendu de la " +
        "maquette. Le site rend le libellé en titre et en étiquette, la suite " +
        "du corpus en ligne de date, et pointe sur l'URL que les crochets " +
        "portaient. Tous les mots sont rendus, seule la syntaxe est écartée.",
    })),
  ]],

  /* ------------------------------------------------------------------
     /bureau-etudes/ — déclaré le 07/10.

     UN SEUL MOTIF, deux lignes : « +200 » et sa légende « Clients industriels
     accompagnés », DEUXIÈME carte de la bande de chiffres. Chiffre FAUX,
     interdit NOMMÉMENT par `scripts/verifie-interdits.mjs` : le compte tenu
     par le dépôt est « plus de 120 clients, dont plus de 80 réguliers ». Le
     corpus de cette page l'écrit pourtant (`maquette/contenu/site/Offres/
     bureau-etudes.md`, « - **+200** : clients industriels accompagnés », et
     « Plus de 200 clients travaillent avec le groupe dans la durée »), et la
     maquette le rend : c'est une contradiction entre le corpus du client et le
     contrat du projet, et c'est le contrat qui l'emporte.

     LA CARTE RESTE RENDUE, avec le compte tenu par le dépôt (« + 120 » /
     « Clients industriels, dont plus de 80 réguliers. »), formulation déjà
     servie par `/offres/depannage-industriel/astreinte/`. Ce n'est pas une
     reformulation de la phrase interdite : c'est une autre donnée, vraie. Même
     arbitrage que `/offres/retrofit/remise-en-etat/` et que cette page
     d'astreinte, et le même écart reste à signaler à Mehdi sur la page pilote
     `/offres/residence/`, qui rend « +200 ».

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
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert ce compte-là, qui n'est pas un synonyme mais une autre " +
        "donnée, vraie.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Elle est écartée avec lui : la carte " +
        "porte la légende du compte tenu par le dépôt, « Clients industriels, " +
        "dont plus de 80 réguliers. »",
    },
  ]],

  /* ------------------------------------------------------------------
     /entreprise-maintenance-industrielle/ — déclaré le 07/10.

     UN SEUL MOTIF, et c'est le PREMIER interdit de
     `scripts/verifie-interdits.mjs` : « +200 », première cellule de la bande
     « 01 Chiffres », avec sa légende « Clients industriels accompagnés ». Le
     compte tenu par le dépôt est « plus de 120 clients, dont plus de 80
     réguliers ». Le corpus de cette page l'écrit lui aussi
     (`maquette/contenu/site/Offres/entreprise-maintenance-industrielle.md` :
     « **+200** : clients industriels accompagnés ») et la maquette le rend :
     c'est une contradiction entre le corpus du client et le contrat du projet,
     et c'est le contrat qui l'emporte.

     ELLE N'EST PAS REFORMULÉE (décision de Mehdi du 05/10, un synonyme est une
     faute) et le chiffre juste n'est pas servi à sa place : la cellule entière
     n'est pas rendue, sa légende comprise, parce qu'une légende sans son
     chiffre ne se lit pas. La bande en rend donc DEUX sur trois, même
     traitement que `/offres/full-service/` et `/offres/bureau-etudes/`.
     POURQUOI PAS le compte juste à la place, comme sur
     `/offres/depannage-industriel/astreinte/` : la troisième cellule de CETTE
     capture porte déjà « + 120 » (collaborateurs). Deux cellules « + 120 »
     côte à côte, l'une pour les clients l'autre pour les salariés, se lisent
     comme une erreur : la cellule est écartée, pas remplacée.

     À FAIRE ARBITRER PAR MEHDI, incohérences du dépôt que cette page ne tranche
     pas :
       · la page pilote `/offres/residence/`, validée le 06/10, REND encore
         « +200 / Clients industriels accompagnés ». Trois traitements
         coexistent aujourd'hui sur le site (rendu, écarté, remplacé par le
         compte juste) : c'est lui qui tranche, pas une chaîne.
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
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, premier interdit de `scripts/verifie-interdits.mjs` : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La cellule n'est pas rendue, et le compte juste n'est pas servi à sa " +
        "place : la cellule voisine porte déjà « + 120 » pour les salariés.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende de la même cellule. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes sont écartées ensemble.",
    },
  ]],

  /* ------------------------------------------------------------------
     /bureau-etudes/bureau-etude-electrique/ — déclaré le 07/10, capture à
     19 sections (« Complément 4 », « Complément 6 » et « Marques maintenues »).

     NEUF LIGNES de sa capture ne sont pas rendues, en TROIS motifs, et aucune
     n'est réécrite.

       1 et 2. « +200 » et sa légende « Clients industriels accompagnés » :
         chiffre interdit nommément par `scripts/verifie-interdits.mjs`, qui
         donne le compte tenu, « plus de 120 clients, dont plus de 80
         réguliers ». Une légende sans son chiffre ne se lit pas : la carte
         entière est écartée, et la bande rend ses trois autres chiffres. MÊME
         ARBITRAGE que `/offres/full-service/` et
         `/offres/residence/cahier-des-charges/`, déclarés le même jour.
         À SIGNALER À MEHDI : `supabase/import/gabarits-maquette/travaux-industriels.json`
         rend encore cette carte, et la page pilote `/offres/residence/` aussi.
         Les deux traitements coexistent sur le site ; c'est lui qui tranche.

       3 à 6. Les quatre titres de carte de « 08 Références » : la maquette y
         laisse la SYNTAXE MARKDOWN BRUTE du corpus,
         `[Étude de cas EIFFAGE : partenariat](/preuves/eiffage/) · Trois
         techniciens…`. Même défaut de rendu que sur
         `/offres/residence/prestataire-ou-salarie/`, même traitement : le site
         rend le libellé et la phrase MOT POUR MOT, séparément (étiquette
         client, titre, phrase de date), et la carte pointe sur l'URL que les
         crochets portaient. Ce qui n'est pas rendu, c'est la syntaxe.

       7 à 9. Les trois premières phrases de carte de « Maillage » : même
         défaut, autre forme. La maquette résout le lien Markdown mais laisse
         le tiret de liste et les astérisques de gras,
         `- **Électriciens industriels habilités**, accueillis…`. Le site rend
         la phrase sans le tiret ni les astérisques, mot pour mot sinon.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ, les 25 interdits du contrat cherchés un par
     un dans le texte visible de la capture : aucun prix, aucun tiret cadratin,
     aucun mot proscrit, et aucun délai chiffré d'intervention. QUATRE
     FORMULATIONS ONT ÉTÉ RENCONTRÉES ET GARDÉES, aucune règle du dépôt ne les
     interdisant : « du lundi au vendredi de 8h00 à 18h30 » (des horaires
     d'ouverture, pas un délai), « Nous n'annonçons aucun délai chiffré » (la
     règle elle-même, écrite par le client), « un schéma de 2016 » et
     « depuis huit ans » (des durées subies par le client, pas des engagements).
     À SIGNALER À MEHDI, hors portée de cette porte : la capture rend
     « + 120 Collaborateurs » là où le corpus de la page écrit « + 100 ». La
     capture fait foi (décision du 06/10) et 38 captures du dépôt portent la
     même valeur, mais l'écart avec le texte rédigé est réel. */
  ["/bureau-etudes/bureau-etude-electrique/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, premier interdit de `scripts/verifie-interdits.mjs` : " +
        "le compte tenu est \u00ab plus de 120 clients, dont plus de 80 r\u00e9guliers \u00bb. " +
        "Il n'est pas remplac\u00e9 par un synonyme, il n'est pas rendu.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagn\u00e9s",
      pourquoi:
        "l\u00e9gende du m\u00eame chiffre faux. Une l\u00e9gende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont \u00e9cart\u00e9es ensemble.",
    },
    ...[
      "[\u00c9tude de cas EIFFAGE : partenariat](/preuves/eiffage/) \u00b7 Trois techniciens en maintenance pr\u00e9ventive sur une installation photovolta\u00efque de grande envergure.",
      "[\u00c9tude de cas SUEZ : remise en \u00e9tat d'un site](/preuves/suez-remise-en-etat/) \u00b7 Un technicien \u00e9lectrom\u00e9canicien mobilis\u00e9 six mois en environnement \u00e0 risque chimique.",
      "[\u00c9tude de cas MERSEN : nouvelles lignes](/preuves/mersen/) \u00b7 2025, pr\u00e8s de Lyon. Un automaticien SIEMENS sur site pour le d\u00e9marrage d'une ligne de production neuve.",
      "[\u00c9tude de cas JOINT LYONNAIS : d\u00e9faillances machines](/preuves/joint-lyonnais/) \u00b7 Lyon, depuis f\u00e9vrier 2024. Diagnostic sur site et plusieurs solutions chiffr\u00e9es, cal\u00e9es sur le budget d'une PME.",
    ].map((ligne) => ({
      section: 14,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans le titre de carte de \u00ab 08 R\u00e9f\u00e9rences \u00bb : " +
        "d\u00e9faut de rendu de la maquette, m\u00eame que sur " +
        "/offres/residence/prestataire-ou-salarie/. Le site rend l'\u00e9tiquette " +
        "client, le libell\u00e9 et la phrase mot pour mot, et pointe sur l'URL que " +
        "les crochets portaient.",
    })),
    ...[
      "- **\u00c9lectriciens industriels habilit\u00e9s**, accueillis \u00e0 votre protocole de s\u00e9curit\u00e9, consignations dans les r\u00e8gles. Voir maintenance \u00e9lectrique industrielle.",
      "- **Automaticiens SIEMENS et Schneider** quand la partie commande est en jeu. Voir automatisme industriel.",
      "- **\u00c9lectroniciens du bureau d'\u00e9tudes** quand une carte ou une fonction de commande doit \u00eatre reprise. Voir bureau d'\u00e9tude \u00e9lectronique.",
    ].map((ligne) => ({
      section: 17,
      ligne,
      pourquoi:
        "tiret de liste et ast\u00e9risques de gras laiss\u00e9s bruts par la maquette " +
        "dans la phrase de carte de \u00ab Maillage \u00bb. Le site rend la phrase sans " +
        "cette syntaxe, mot pour mot sinon.",
    })),
  ]],

  /* ------------------------------------------------------------------
     /bureau-etudes/bureau-etude-electronique/ — déclaré le 07/10,
     capture à 19 sections. TROIS MOTIFS, les mêmes que sa page sœur
     `/bureau-etudes/bureau-etude-electrique/`, aux rangs de CETTE capture.

     1. « +200 » et sa légende « Clients industriels accompagnés », deuxième
        carte de la bande de chiffres. Chiffre FAUX, interdit NOMMÉMENT par
        `scripts/verifie-interdits.mjs` : le compte tenu par le dépôt est
        « plus de 120 clients, dont plus de 80 réguliers ». Le corpus de cette
        page l'écrit pourtant (« **+200** : clients industriels accompagnés »)
        et la maquette le rend : c'est le contrat du projet qui l'emporte. La
        carte reste rendue et sert le compte juste, que le corpus de CETTE page
        écrit lui-même en bas de sa FAQ (« Plus de 120 clients industriels »),
        sous la forme « + 80 » / « Clients réguliers · sur plus de 120 clients
        industriels. ». Ce n'est pas une reformulation de la phrase interdite :
        c'est une autre donnée, vraie. Même arbitrage que
        `/offres/retrofit/remise-en-etat/`, et le même écart reste à signaler à
        Mehdi sur la page pilote `/offres/residence/`, qui rend « +200 ».
        La PREMIÈRE carte, elle, est rendue telle quelle : la capture y écrit
        « + 120 » / « Collaborateurs … » là où le corpus écrit « + 100 », et
        c'est la référence qui fait foi.

     2. Les quatre cartes de « 08 Références » : la maquette laisse le TITRE
        vide (`<span class="sc-interp"></span>`) et déverse dans le champ de
        date la LIGNE BRUTE du corpus, syntaxe Markdown comprise
        (`[libellé](/preuves/…/) · <phrase>`). Défaut de rendu de la maquette,
        pas une formulation du client : sur la page pilote `/offres/residence/`
        la même maquette résout bien les deux champs. Le site rend l'étiquette
        client, le libellé et la phrase mot pour mot, et pointe sur l'URL que
        les crochets portaient : seule la syntaxe n'est pas rendue.

     3. La phrase des DEUX PREMIÈRES cartes de « Maillage » : la maquette y
        laisse le tiret de liste et les astérisques de gras du corpus
        (« - **Interventions liées** : … »). La ligne est la même sur les deux
        cartes, elle n'est donc déclarée qu'une fois. Le site rend la phrase
        sans cette syntaxe, mot pour mot sinon. La troisième carte
        (« Maintenance corrective ») n'a pas de phrase dans la capture : elle
        n'en reçoit pas, rien n'est écrit à sa place.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ. La capture ne porte aucun prix, aucun délai
     chiffré autre que « rappel dans l'heure », aucun tiret cadratin, aucun mot
     proscrit. Une formulation a été RENCONTRÉE ET GARDÉE, aucune règle du
     dépôt ne l'interdisant : « Aucune promesse de délai chiffré. » dans
     « Ce que nous ne faisons pas », qui refuse un délai au lieu d'en annoncer
     un. Et « La maintenance en abonnement, au forfait mensuel. » dans la carte
     « Zéro arrêt » du maillage, même arbitrage que
     `/offres/retrofit/remise-en-etat/` : un mode de facturation sans montant. */
  ["/bureau-etudes/bureau-etude-electronique/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs : " +
        "le compte tenu est « plus de 120 clients, dont plus de 80 réguliers ». " +
        "La carte sert ce compte-là, qui n'est pas un synonyme mais une autre " +
        "donnée, vraie, écrite par le corpus de cette page.",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi:
        "légende du même chiffre faux. Une légende sans son chiffre ne se lit " +
        "pas : les deux lignes de la carte sont écartées ensemble.",
    },
    ...[
      "[Étude de cas TIMESCOPE : casques de réalité virtuelle](/preuves/timescope/) · Depuis février 2024. Maintenance sous contrat d'un parc d'équipements électroniques déployé partout en France, étanchéité et réglages traités comme des sujets à part entière, propositions d'amélioration de la fiabilité.",
      "[Étude de cas MERSEN : nouvelles lignes](/preuves/mersen/) · 2025, près de Lyon. Un automaticien SIEMENS sur site pour le démarrage d'une ligne neuve, quand la partie commande décide du calendrier.",
      "[Étude de cas JOINT LYONNAIS : défaillances machines](/preuves/joint-lyonnais/) · Lyon, depuis février 2024. Diagnostic sur site et plusieurs solutions chiffrées, plutôt qu'un rachat de matériel.",
      "[Étude de cas EATON : mise en production](/preuves/eaton-mise-en-production/) · Janvier 2023. Six techniciens multidisciplinaires pour l'installation et la mise en production d'un parc machines neuf.",
    ].map((ligne) => ({
      section: 14,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans la carte de « 08 Références » : défaut de " +
        "rendu de la maquette, qui laisse le titre vide et verse la ligne du " +
        "corpus telle quelle. Le site rend l'étiquette client, le libellé et " +
        "la phrase mot pour mot, et pointe sur l'URL que les crochets portaient.",
    })),
    {
      section: 17,
      ligne:
        "- **Interventions liées** : maintenance électrique industrielle, automatisme industriel, dépannage industriel.",
      pourquoi:
        "tiret de liste et astérisques de gras laissés bruts par la maquette " +
        "dans la phrase de carte de « Maillage », sur ses deux premières " +
        "cartes. Le site rend la phrase sans cette syntaxe, mot pour mot sinon.",
    },
  ]],

  /* ------------------------------------------------------------------
     /bureau-etudes/mise-en-conformite-machine/ — déclaré le 07/10, capture à
     19 sections (« Complément 4 », « Complément 6 » et « Marques maintenues »
     s'ajoutent aux 16 écrans communs, et la page n'a pas de « Réalisations
     liées »).

     DEUX MOTIFS, cinq lignes, et un seul vient du contrat de rédaction.

     1. « Plus de 200 clients industriels », troisième carte de la bande de
        chiffres. Le compte est FAUX et il est interdit NOMMÉMENT par
        `scripts/verifie-interdits.mjs` (interdit « 200 clients ») : le compte
        tenu par le dépôt est « plus de 120 clients, dont plus de 80
        réguliers ». Le corpus de CETTE page écrit d'ailleurs le bon
        (« **Plus de 120 clients industriels** : plus de 80 reviennent
        régulièrement… ») : c'est le gabarit de la maquette qui substitue son
        chiffre à celui du client. La carte reste donc rendue, avec la valeur
        que le client a écrite lui-même, et sa légende mot pour mot. Ce n'est
        pas une reformulation de la phrase interdite : c'est une autre donnée,
        vraie. Même arbitrage que `/offres/retrofit/remise-en-etat/` et
        `/bureau-etudes/bureau-etude-electrique/`.

     2. Les quatre lignes de « 08 Références ». La maquette y laisse la
        SYNTAXE MARKDOWN BRUTE du corpus dans le paragraphe de la carte, et
        laisse son titre VIDE (`<div><span class="sc-interp"></span></div>`,
        bloc 947), alors qu'elle a bien lu le libellé pour en faire l'étiquette
        client rendue juste au-dessus en capitales. Défaut de rendu de la
        maquette, pas une formulation du client : la chaîne complète, crochets
        et chemin compris, n'existe nulle part dans son texte rédigé. Le site
        rend l'étiquette client, le libellé en titre et la phrase, mot pour
        mot, et la carte pointe sur l'URL que les crochets portaient : seule la
        syntaxe n'est pas rendue. Même motif que
        `/bureau-etudes/bureau-etude-electrique/`, déclaré le même jour.

     RENCONTRÉ ET GARDÉ, à faire arbitrer par Mehdi, hors portée de cette
     porte : la capture écrit « Plus de 120 techniciens » là où le corpus de
     cette page écrit « Plus de 100 collaborateurs ». La capture fait foi
     (décision du 06/10) et c'est la valeur que le gabarit porte sur 38
     captures du dépôt, mais l'écart avec le texte rédigé est réel. Même
     traitement que sa page sœur `/bureau-etudes/bureau-etude-electrique/`,
     pour que les deux pages ne se contredisent pas.

     RIEN D'AUTRE N'A ÉTÉ ÉCARTÉ : les 25 interdits du contrat ont été
     cherchés un par un dans le texte visible de la capture, et seul
     « 200 clients » s'y trouve. Aucun prix (« Le montant est chiffré sur
     devis, après audit. »), aucun délai chiffré d'intervention (« Nous
     n'annonçons aucun délai chiffré. » est une phrase du client, pas un
     délai), aucun tiret cadratin. */
  ["/bureau-etudes/mise-en-conformite-machine/", [
    {
      section: 1,
      ligne: "Plus de 200 clients industriels",
      pourquoi:
        "chiffre faux, interdit nommément par scripts/verifie-interdits.mjs " +
        "(« 200 clients ») : le compte tenu est « plus de 120 clients, dont " +
        "plus de 80 réguliers », et c'est aussi ce que le corpus de cette page " +
        "écrit. La carte sert cette valeur-là, qui n'est pas un synonyme mais " +
        "une autre donnée, vraie. Sa légende est rendue mot pour mot.",
    },
    ...[
      "[Étude de cas JOINT LYONNAIS : défaillances machines](/preuves/joint-lyonnais/) · Lyon, depuis février 2024. Diagnostic sur site et plusieurs solutions chiffrées, calées sur le budget d'une PME, plutôt qu'un rachat de matériel.",
      "[Étude de cas SUEZ : remise en état d'un site](/preuves/suez-remise-en-etat/) · Un technicien électromécanicien mobilisé six mois en environnement à risque chimique.",
      "[Étude de cas EIFFAGE : partenariat](/preuves/eiffage/) · Trois techniciens en maintenance préventive sur une installation photovoltaïque de grande envergure.",
      "[Étude de cas SOPREMA : travaux ponctuels](/preuves/soprema/) · Montage, déplacement de machines et renfort technique sur chantiers.",
    ].map((ligne) => ({
      section: 14,
      ligne,
      pourquoi:
        "syntaxe Markdown brute dans le paragraphe de carte de « 08 " +
        "Références », titre de carte laissé vide par la maquette : défaut de " +
        "rendu, même que sur /bureau-etudes/bureau-etude-electrique/. Le site " +
        "rend l'étiquette client, le libellé et la phrase mot pour mot, et " +
        "pointe sur l'URL que les crochets portaient.",
    })),
  ]],

  /* ------------------------------------------------------------------
     Déclarés le 07/10, après le passage à la maquette de 14h23.

     Quinze lignes de la maquette tombent sous un interdit NOMMÉ du contrat
     (CLAUDE.md §9). Aucune n'est reformulée, décision de Mehdi du 05/10 : un
     synonyme est une faute. Elles ne sont pas rendues, et chacune est déclarée
     ici avec la règle qui l'interdit.

     Les cartes « +200 » tombent avec leur légende : un chiffre sans sa légende,
     ou une légende sans son chiffre, ne se lit pas. */
  ["/entreprise-maintenance-industrielle/", [
    {
      section: 16,
      ligne: "Le chiffrage se fait après qualification du besoin, avec une visite quand le périmètre le justifie. Sur un parc industriel, la maintenance planifiée et le dépannage subi n'ont pas le même prix de revient. Nous vous montrons les deux. Le taux horaire est homogène dans toute la France, sans surfacturation régionale. Le devis détaille chaque poste, et nous cherchons la prestation la plus économique pour votre situation, pas la plus grosse ligne de commande.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire sur le site",
    },
  ]],
  ["/offres/chantier/demenagement-machines/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],
  ["/offres/residence/prestataire-ou-salarie/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],
  ["/offres/residence/", [
    {
      section: 13,
      ligne: "La mission est chiffrée sur devis, sous forme de taux horaire homogène dans toute la France. Trois éléments font le montant : le profil requis et ses spécialités, le rythme de présence (temps plein ou partagé) et les contraintes de vos installations. Tout est présenté ligne par ligne, pour une comparaison honnête avec un poste interne.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire sur le site",
    },
  ]],
  ["/offres/retrofit/remise-en-etat/", [
    {
      section: 12,
      ligne: "Maintenir des machines conçues sur mesure",
      pourquoi: "formulation proscrite par le contrat",
    },
  ]],
  ["/travaux-industriels/demantelement-industriel/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],
  ["/travaux-industriels/levage-manutention/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],
  ["/travaux-industriels/montage-industriel/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],
  ["/travaux-industriels/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 » : une légende sans son chiffre ne se lit pas, la carte tombe entière",
    },
  ]],

  /* ------------------------------------------------------------------
     Déclarés le 07/10 au soir, seconde vague : dix-neuf refus du contrat et
     les titres de cartes où la maquette recrache son markdown source. Chaque
     ligne existe dans la référence et n'est pas rendue, la porte le vérifie
     dans les deux sens. */
  ["/bureau-etudes/mise-en-conformite-machine/", [
    {
      section: 16,
      ligne: "Le montant est chiffré sur devis, après audit. Il dépend du nombre de machines et des écarts constatés. Le plan d'actions est étalé par ordre de priorité : l'essentiel d'abord, le reste ensuite, sans immobiliser le budget d'un coup.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/entreprise-maintenance-industrielle/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 », qui tombe avec son chiffre",
    },
  ]],
  ["/offres/arret-technique/", [
    {
      section: 14,
      ligne: "Le chiffrage sort du programme de travaux réel, pas d'un forfait au jugé : nombre de techniciens par métier, durée, encadrement, moyens. Quand plusieurs organisations sont possibles, nous proposons la plus économique. Les travaux découverts en cours d'arrêt font l'objet d'un chiffrage et d'un arbitrage avec vous, jamais d'une facture surprise.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/bureau-etudes/", [
    {
      section: 18,
      ligne: "Chaque mission est chiffrée sur devis, sur la base d'un périmètre écrit. Pas d'heures de dessin vendues au kilomètre. Un petit projet bien cadré reste un petit budget.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/chantier/demenagement-machines/", [
    {
      section: 15,
      ligne: "Le montant dépend du nombre de machines, de leur masse, des conditions d'accès et de la distance. Il est chiffré sur devis après l'étude préalable, qui est gratuite. En manutention lourde, un prix donné sans visite se corrige toujours à la hausse.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/chantier/transfert-de-production/", [
    {
      section: 14,
      ligne: "Le coût dépend du nombre de lignes, de la distance, des travaux d'adaptation et du niveau d'accompagnement. Il est chiffré sur devis après visite, poste par poste. Repère utile : un chantier mal préparé se paie en semaines d'arrêt, et ces semaines valent presque toujours plus cher que la prestation.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/depannage-industriel/astreinte/", [
    {
      section: 13,
      ligne: "Le prix dépend des plages couvertes, du nombre d'équipements et de la criticité. Chaque dispositif est chiffré sur devis, après un échange technique. Le bon comparatif n'est pas la ligne d'indemnité sur vos bulletins de paie, mais le coût complet de votre astreinte interne : primes, heures majorées, repos compensateurs, temps de gestion et risque juridique.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/depannage-industriel/panne-machine/", [
    {
      section: 15,
      ligne: "Le tarif dépend du domaine technique, de la durée et de la plage horaire. Il est chiffré sur devis, jamais découvert sur la facture. Le chiffre à regarder en face reste le vôtre : main-d'œuvre immobilisée, production perdue, pénalités de retard.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/residence/prestataire-ou-salarie/", [
    {
      section: 12,
      ligne: "[Renfort d'équipes sur plusieurs sites, confort thermique](/preuves/groupe-atlantic/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 12,
      ligne: "[Pilotage du service pendant une transition, industrie](/preuves/eriks/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 12,
      ligne: "[Renfort continu d'une équipe interne, site proche de Paris](/preuves/fdj/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 12,
      ligne: "[Technicien polyvalent sur parc hétérogène, papier et emballage](/preuves/vpk/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 12,
      ligne: "[Renfort sur site agroalimentaire, Belgique](/preuves/mccain-belgique/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 12,
      ligne: "[Maintenance tenue pendant les congés d'été](/preuves/ogf-arret-estival/)",
      pourquoi: "markdown source recraché par la maquette dans un titre de carte : le site rend le libellé seul et pointe la même cible, la syntaxe crochets-parenthèses n'est pas publiée",
    },
    {
      section: 14,
      ligne: "À l'heure facturée, souvent oui. À périmètre complet (recrutement, formation, remplacements, administration, risque de rupture), l'écart se resserre, et il s'inverse fréquemment sur les compétences rares ou les activités variables. La seule réponse sérieuse est un calcul mené sur votre situation. Notre devis détaillé le permet ligne à ligne.",
      pourquoi: "prix : la réponse détaille ce qui fait le montant, le contrat interdit tout prix ou tarif",
    },
  ]],
  ["/offres/retrofit/mise-en-conformite-machine/", [
    {
      section: 16,
      ligne: "Le montant est chiffré sur devis, après audit. Il dépend du nombre de machines et des écarts constatés. Le plan d'actions est étalé par ordre de priorité : l'essentiel d'abord, le reste ensuite, sans immobiliser le budget d'un coup.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/offres/retrofit/remise-en-etat/", [
    {
      section: 1,
      ligne: "+200",
      pourquoi: "chiffre de clients interdit : seul « plus de 120 clients, dont plus de 80 réguliers » est tenu",
    },
    {
      section: 1,
      ligne: "Clients industriels accompagnés",
      pourquoi: "légende de la carte « +200 », qui tombe avec son chiffre",
    },
    {
      section: 14,
      ligne: "Chaque cas est chiffré sur devis : l'état constaté, les pièces à remplacer et le degré de finition attendu font le prix. L'état des lieux préalable donne la rentabilité avant l'engagement, et la comparaison avec la valeur actuelle du matériel fait partie de la réponse.",
      pourquoi: "prix : le contrat interdit tout prix, tarif, montant ou taux horaire",
    },
  ]],
  ["/travaux-industriels/demantelement-industriel/", [
    {
      section: 14,
      ligne: "Le montant dépend du volume d'équipements, des contraintes d'accès, de la part de valorisation et du niveau de remise en état attendu. Chiffrage sur devis après visite, poste par poste. La valeur des matières récupérables apparaît sur une ligne du devis, elle n'y est pas noyée.",
      pourquoi: "prix : la réponse détaille ce qui fait le montant, le contrat interdit tout prix ou tarif",
    },
  ]],
  ["/travaux-industriels/levage-manutention/", [
    {
      section: 15,
      ligne: "Le montant dépend de la masse, de la géométrie de la charge, des accès, de la durée d'immobilisation de la zone et des moyens à mobiliser. Chiffrage sur devis après relevé sur site. Un prix donné au téléphone sans masse réelle ne tient pas.",
      pourquoi: "prix : la réponse détaille ce qui fait le montant, le contrat interdit tout prix ou tarif",
    },
  ]],
  ["/travaux-industriels/montage-industriel/", [
    {
      section: 14,
      ligne: "Le montant dépend du nombre d'ensembles, de leur poids, des raccordements à réaliser et du niveau d'essais attendu. Chiffrage sur devis après lecture du dossier technique et visite du site, poste par poste.",
      pourquoi: "prix : la réponse détaille ce qui fait le montant, le contrat interdit tout prix ou tarif",
    },
  ]],
];

const TROUS_PAR_PAGE = {};
for (const [u, items] of TROUS_DECLARES) {
  (TROUS_PAR_PAGE[u] ??= []).push(...items);
}
const TROUS_ASSUMES = TROUS_PAR_PAGE[CHEMIN_PAGE] ?? [];

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
  "/offres/residence/prestataire-ou-salarie/": [
    {
      section: 0,
      rendu: "Prestataire ou salarié : le comparatif honnête",
      pourquoi:
        "h1 du héros. La capture le rend vide (`<h1></h1>`). Le site sert le " +
        "titre de l'index du client, confirmé par le premier titre du corpus.",
    },
    {
      section: 5,
      rendu: "Vous comparez un salaire à une facture, et le calcul est faux",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut. Le site sert le " +
        "sous-titre que le corpus écrit sous « ## Le problème ».",
    },
    {
      section: 16,
      rendu: "Vous voulez trancher sur des chiffres, pas sur une intuition ?",
      pourquoi:
        "titre du panneau de formulaire final. Même défaut. Le site sert la " +
        "question que le corpus écrit en tête de son appel final.",
    },
  ],

  /* Même défaut, même page de la liste des huit : la capture de cette page
     porte `verdict: "rendue-sans-titre"` et `h1Rendu: ""`. Les trois titres
     servis viennent du client, aucun n'est écrit ici pour l'occasion. */
  "/offres/depannage-industriel/astreinte/": [
    {
      section: 0,
      rendu: "Astreinte de maintenance, 24 heures sur 24",
      pourquoi:
        "h1 du héros. La capture le rend vide. Le site sert le titre de " +
        "`contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/offres--depannage-industriel--astreinte.md`).",
    },
    {
      section: 5,
      rendu: "Votre astreinte repose sur deux personnes, et elles sont fatiguées",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut. Le site sert le " +
        "sous-titre que le corpus écrit sous « ## Le problème ».",
    },
    {
      section: 15,
      rendu: "Votre astreinte sonne trop souvent ?",
      pourquoi:
        "titre du panneau de formulaire final. Même défaut. Le site sert la " +
        "question que le corpus écrit en tête de son appel final.",
    },
  ],

  /* Troisième page de la liste des huit. Sa capture porte
     `verdict: "rendue-sans-titre"`, `h1Rendu: ""`, et 17 bindings `sc-interp`
     non résolus en tout : le h1, le chapeau, les libellés de bouton, et ces
     trois titres. Les trois titres servis sont ÉCRITS PAR LE CLIENT, aucun
     n'est rédigé ici pour l'occasion, et les rangs sont ceux des 19 sections
     de CETTE capture (« Complément 4 » et « Complément 5 » décalent la fin). */
  "/offres/residence/cahier-des-charges/": [
    {
      section: 0,
      rendu: "Cahier des charges de maintenance : la trame à reprendre",
      pourquoi:
        "h1 du héros. La capture le rend vide (`<h1><span " +
        "class=\"sc-interp\"></span></h1>`). Le site sert le titre de " +
        "`contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/offres--residence--cahier-des-charges.md`).",
    },
    {
      section: 5,
      rendu: "Ce qui n'est pas écrit sera facturé en avenant",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut. Le site sert le " +
        "sous-titre que le corpus écrit sous « ## Le problème ».",
    },
    {
      section: 17,
      rendu: "Votre besoin est encore en amont ?",
      pourquoi:
        "titre du panneau de formulaire final. Même défaut. Le site sert la " +
        "question que le corpus écrit en tête de son appel final.",
    },
  ],

  /* Quatrième page de la liste des huit, déclarée le 07/10. Sa capture porte
     `verdict: "rendue-sans-titre"` et `h1Rendu: ""` : le h1, le chapeau et
     deux h2 restent des bindings `sc-interp` vides, alors que la maquette
     résout bien les quinze autres sections de la même page. Les trois titres
     servis sont ÉCRITS PAR LE CLIENT, rien n'est rédigé ici pour l'occasion.
     Les rangs sont ceux des 19 sections de CETTE capture : « Complément 4 »
     (« Les causes que nous retrouvons le plus souvent ») et « Marques
     maintenues » décalent la fin de deux. */
  "/offres/depannage-industriel/panne-machine/": [
    {
      section: 0,
      rendu: "Panne machine industrielle : agir dans la première heure",
      pourquoi:
        "h1 du héros. La capture le rend vide. Le site sert le titre de " +
        "`contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/offres--depannage-industriel--panne-machine.md`).",
    },
    {
      section: 5,
      rendu: "La ligne est à l'arrêt, et tout le monde attend une date",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut. Le site sert le " +
        "sous-titre que le corpus écrit sous « ## Le problème ».",
    },
    {
      section: 17,
      rendu: "Combien de fois cette machine s'est-elle arrêtée cette année ?",
      pourquoi:
        "titre du panneau de formulaire final. Même défaut. Le site sert la " +
        "question que le corpus écrit en tête de son appel final.",
    },
  ],

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

  /* Même défaut, autre page de la liste des huit : la capture de
     `/offres/retrofit/mise-en-conformite-machine/` porte
     `verdict: "rendue-sans-titre"` et `h1Rendu: ""`, et son HTML figé montre
     la liaison non résolue (`<h1><span class="sc-interp"></span></h1>`). Les
     deux titres servis viennent du client, aucun n'est écrit ici pour
     l'occasion. */
  "/offres/retrofit/mise-en-conformite-machine/": [
    {
      section: 0,
      rendu: "Mise en conformité des machines : fixez le calendrier avant l'inspection",
      pourquoi:
        "h1 du héros. La capture le rend vide, liaison non résolue. Le site " +
        "sert le titre de `contenu/site/index.json`, qui est aussi le premier " +
        "titre du corpus " +
        "(`Offres/offres--retrofit--mise-en-conformite-machine.md`).",
    },
    {
      section: 5,
      rendu:
        "Une machine mal protégée, et c'est l'inspection du travail qui fixe votre calendrier.",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut. Le site sert le " +
        "sous-titre que le corpus écrit sous « ## Le problème ».",
    },
  ],

  /* Quatrième page de la liste des huit, et même défaut : sa capture porte
     `verdict: "rendue-sans-titre"`, `h1Rendu: ""`, et laisse vides le h1, le
     chapeau, les libellés de bouton du héros et le premier h2. DEUX titres
     seulement sont vides ici (le panneau de formulaire final, lui, porte bien
     sa question), et les deux servis sont ÉCRITS PAR LE CLIENT. */
  "/bureau-etudes/bureau-etude-electrique/": [
    {
      section: 0,
      rendu: "Bureau d'étude électrique : du schéma à l'armoire qui tourne",
      pourquoi:
        "h1 du héros. La capture le rend vide " +
        "(`<h1><span class=\"sc-interp\"></span></h1>`). Le site sert le titre " +
        "de `contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/bureau-etudes--bureau-etude-electrique.md`).",
    },
    {
      section: 5,
      rendu:
        "Le schéma de l'armoire est faux depuis huit ans, et tout le monde fait avec.",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut, et son chapeau est " +
        "vide aussi. Le site sert le sous-titre que le corpus écrit sous " +
        "« ## Le problème ».",
    },
  ],

  /* Cinquième page de la liste des huit, et le même défaut que sa page sœur
     `/bureau-etudes/bureau-etude-electrique/` : sa capture porte
     `verdict: "rendue-sans-titre"` et `h1Rendu: ""`, et laisse vides le h1, le
     chapeau, les libellés de bouton du héros et le premier h2. DEUX titres
     seulement sont vides (le panneau de formulaire final porte bien sa
     question, rang 18), et les deux servis sont ÉCRITS PAR LE CLIENT. */
  "/bureau-etudes/bureau-etude-electronique/": [
    {
      section: 0,
      rendu:
        "Bureau d'étude électronique : une carte pensée pour être réparée",
      pourquoi:
        "h1 du héros. La capture le rend vide (`<h1><span " +
        "class=\"sc-interp\"></span></h1>`). Le site sert le titre de " +
        "`contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/bureau-etudes--bureau-etude-electronique.md`).",
    },
    {
      section: 5,
      rendu:
        "Une carte électronique en fin de vie arrête une machine qui, elle, va très bien.",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut, et son chapeau est " +
        "vide aussi. Le site sert le sous-titre que le corpus écrit sous " +
        "« ## Le problème ».",
    },
  ],

  /* Sixième page de la liste des huit, et le même défaut que ses deux pages
     sœurs `/bureau-etudes/bureau-etude-electrique/` et
     `/bureau-etudes/bureau-etude-electronique/` : sa capture porte
     `verdict: "rendue-sans-titre"` et `h1Rendu: ""`, et laisse vides le h1, le
     chapeau, les libellés de bouton du héros et le premier h2. DEUX titres
     seulement sont vides (le panneau de formulaire final porte bien sa
     question au rang 18, « Besoin d'un plan d'actions chiffré avant votre
     prochain contrôle ? »), et les deux servis sont ÉCRITS PAR LE CLIENT. */
  "/bureau-etudes/mise-en-conformite-machine/": [
    {
      section: 0,
      rendu: "Mise en conformité machine : fixez le calendrier avant l'inspection",
      pourquoi:
        "h1 du héros. La capture le rend vide (`<h1><span " +
        "class=\"sc-interp\"></span></h1>`, bloc 29). Le site sert le titre de " +
        "`contenu/site/index.json`, qui est aussi le premier titre du corpus " +
        "(`Offres/bureau-etudes--mise-en-conformite-machine.md`).",
    },
    {
      section: 5,
      rendu:
        "Une machine mal protégée, et c'est l'inspection du travail qui fixe votre calendrier.",
      pourquoi:
        "premier h2, section « 03 Problème ». Même défaut, et son chapeau est " +
        "vide aussi. Le site sert le sous-titre que le corpus écrit sous " +
        "« ## Le problème ».",
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
const EXTRAIT = () => {
  const principal = document.querySelector("main");
  if (!principal) return null;
  return [...principal.querySelectorAll(":scope > section")].map((section) => {
    const titre = section.querySelector("h1, h2, h3");
    return {
      titre: titre ? titre.innerText : null,
      lignes: (section.innerText || "").split("\n"),
    };
  });
};

/** Les sections d'une page, titres et lignes normalisés, lignes vides ôtées. */
async function lisSections(navigateur, ouvre) {
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  await ouvre(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const brut = await page.evaluate(EXTRAIT);
  await page.close();
  if (!brut) throw new Error("aucun <main> dans la page, rien à mesurer");
  return brut.map((s) => ({
    titre: s.titre === null ? null : normalise(s.titre),
    lignes: s.lignes.map(normalise).filter(Boolean),
    texte: normalise(s.lignes.join(" ")),
  }));
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

/** 3. Même nombre de sections, mêmes titres, même ordre. */
function controleStructure(reference, site, fautes) {
  if (site.length !== reference.length) {
    const titres = (liste) => liste.map((s) => s.titre ?? "(sans titre)").join(" · ");
    fautes.push(
      `${site.length} section(s) servies hors ajouts déclarés, ${reference.length} dans la référence.\n` +
        `    Référence : ${titres(reference)}\n` +
        `    Site      : ${titres(site)}`,
    );
    return;
  }
  reference.forEach((section, rang) => {
    const attendu = titreAttenduAuRendu(rang, section.titre);
    if (site[rang].titre !== attendu) {
      fautes.push(
        `section ${rang} : titre « ${site[rang].titre ?? "(aucun)"} » au lieu de ` +
          `« ${attendu ?? "(aucun)"} »`,
      );
    }
  });
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

/* ------------------------------------------------------------------ */
/* Déroulé.                                                            */
/* ------------------------------------------------------------------ */

const mesure = JSON.parse(readFileSync(REFERENCE_JSON, "utf8"));
const htmlReference = readFileSync(REFERENCE_HTML, "utf8");

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 0;
try {
  const [reference, site] = await Promise.all([
    lisSections(navigateur, (page) =>
      page.setContent(
        `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>${htmlReference}</body></html>`,
        { waitUntil: "load" },
      ),
    ),
    lisSections(navigateur, async (page) => {
      const reponse = await page.goto(SITE + CHEMIN_PAGE, { waitUntil: "load", timeout: 60_000 });
      if (!reponse?.ok()) throw new Error(`${SITE + CHEMIN_PAGE} répond ${reponse?.status()}`);
    }),
  ]);

  const fautes = [];
  controleReference(reference, mesure, fautes);
  const texteReference = reference.map((s) => s.texte).join("\n");
  const siteAligne = retireAjoutsDeclares(site, texteReference, fautes);
  controleStructure(reference, siteAligne, fautes);
  controleTitresVides(reference, fautes);
  controleTexte(reference, siteAligne, fautes);
  controleTirets(reference, site, fautes);

  const lignes = reference.reduce((somme, s) => somme + s.lignes.length, 0);
  console.log(
    `${CHEMIN_PAGE} contre ${REFERENCE_HTML.replace(RACINE, "")} : ` +
      `${reference.length} sections de référence, ${site.length} servies ` +
      `(${SECTIONS_AJOUTEES.length} ajout(s) déclaré(s)), ${lignes} lignes de texte comparées, ` +
      `${TIRETS_REMPLACES.length} cadratin(s) arbitré(s), ${TROUS_ASSUMES.length} trou(s) assumé(s).`,
  );

  if (fautes.length > 0) {
    console.error(`\n${fautes.length} anomalie(s) :\n`);
    for (const faute of fautes) console.error(`  · ${faute}\n`);
    code = 1;
  } else {
    console.log("rendu d'offre conforme à la référence");
  }
} finally {
  await navigateur.close();
}
process.exit(code);
