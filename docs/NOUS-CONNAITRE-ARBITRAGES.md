# /nous-connaitre/ : ce qui est corrigé, ce qui attend Nathan

Retour de Nathan Jorez, 13/10 : « Fais gaffe, cette page est ultra spé résidence
comme si c'était la seule offre. »

Son impression est fondée et mesurable. Elle ne vient pas d'un gabarit d'offre
posé par erreur : la page reproduit un écran de la maquette du client, et la
plupart des phrases qui restreignent le périmètre sont de sa plume.

Analyse du 13/10 : 108 agents, 34 constats relevés, **29 réfutés par une
relecture adverse à trois lentilles, 5 retenus**.

> **SECONDE PASSE, 13/10 au soir : le BAS de la page, section par section.**
> L'intro et les six portes étaient faites (commit 663ff3a). Restaient les sept
> sections suivantes. Résultat mesuré, et il est contre-intuitif : **le bas de
> page est la copie du client, mot pour mot.** Les vingt-quatre chaînes servies
> par Fidélisation, Périmètre, Équipe proche et les deux portes Valeurs/RSE ont
> été comparées une à une à sa maquette, sur texte normalisé. Dix-sept sont
> identiques au caractère près, et les sept écarts sont tous des retouches de
> notre main, dont quatre imposées par les interdits du contrat.
>
> **Il n'y avait donc rien à y corriger sans réécrire son positionnement.** Ce
> qui a été corrigé, c'est ce qui était de notre main : une porte tombée
> (A2) et une retouche non déclarée (A3). Les cinq phrases du bas qui
> restreignent encore le périmètre sont les siennes : B7 à B10, plus B1 déjà
> ouvert. Le relevé complet de ce qui n'a pas été touché est en section E.
>
> **Et une chose reste cassée, mesurée, hors du périmètre de cette passe : la
> description que Google lit sur cette page décrit encore la seule Résidence.**
> Voir la section D, à faire avant le prochain déploiement.

## Le cadrage, mesuré

> **Ce tableau est la mesure du 13/10 AU MATIN, avant le commit 663ff3a.** Il est
> gardé parce qu'il est la preuve de l'impression de Nathan. Mesure du même jour
> au soir, sur `https://migen-site.vercel.app/nous-connaitre/` en ligne : texte
> du `<main>` 10 672 caractères, **6 liens d'offre** pour 6 adresses distinctes
> (contre 0), et les six offres nommées une fois chacune. Le `<main>` ne cite
> donc plus une offre sur six mais six sur six. Ce que le tableau mesurait est
> réparé ; ce qu'il ne mesurait pas est en D.

| Mesure | /nous-connaitre/ | Accueil |
|---|---|---|
| Texte du `<main>` | 9 724 caractères | 16 112 caractères |
| Liens vers une page d'offre dans le `<main>` | **0** | **14** |
| migen© Résidence nommée | 2 | 13 |
| Full service | **0** | 2 |
| Zéro arrêt | **0** | 4 |
| Arrêt technique | 1 | 3 |
| Bureau d'études | 2 | 3 |
| Travaux industriels | 1 | 3 |

Deux faits de méthode, établis avant toute discussion de contenu :

1. **La page n'existe pas dans le plan du client.** `maquette/contenu/site/index.json`
   porte 248 entrées, aucune ne contient `nous-connaitre`. Sa source est l'écran
   `data-screen-label="Nous connaître"` de `maquette/accueil-rendu.html`, lignes
   5201 à 5528.
2. **Elle a bien une porte de vérification**, `components/site/nous-connaitre/verification-nous-connaitre.tsx`,
   bornée aux mêmes lignes. Elle passait au matin ; le correctif du matin l'a
   cassée, et elle a été retrouvée tombée au début de la seconde passe. Voir A2.

## A. Corrigé le 13/10, sans rien demander

### A1. La frise disait « Migen » là où l'arbitrage impose « Migen Travaux »

- Fichier : `components/site/nous-connaitre/FriseCinqAns.tsx`, jalon 2025.
- La maquette écrit « **Orthus** lance les travaux industriels et le bureau
  d'études » (`maquette/accueil-rendu.html:5390`).
- L'arbitrage de Mehdi du 09/10, posé dans `lib/decisions-copie.ts`, remplace
  « Orthus » par « Migen Travaux ». Aucun composant de ce dossier n'importe ce
  fichier : la copie est en dur, la règle n'a donc jamais pu s'appliquer, et
  quelqu'un a écrit « Migen » à la main en perdant « Travaux ».
- **Effet, et c'est exactement le retour de Nathan** : la seule phrase de la page
  qui nommait la marque portant les deux offres hors placement nommait
  l'entreprise entière.
- Corrigé, et la porte porte désormais l'assertion. Contrôle négatif joué : avec
  la faute remise, elle tombe sur « la correction attendue est absente du rendu ».

### A2. La porte de la page était TOMBÉE, et rien ne pouvait le signaler

- Fichier : `components/site/nous-connaitre/verification-nous-connaitre.tsx`,
  table `CORRECTIONS`.
- **Mesure, au lancement de la seconde passe** : la porte échouait, sur
  « la correction attendue est absente du rendu : affecter sur vos sites des
  techniciens ». Elle n'échouait pas sur un vrai défaut : elle attendait encore
  la phrase d'AVANT, celle que le commit 663ff3a venait de remplacer par le
  chapô des trois métiers. Le correctif du matin avait donc cassé la porte
  censée le protéger.
- **Pourquoi personne ne l'a vu, et c'est le vrai constat** : cette porte ne fait
  PAS partie de `bun run verifie`. Elle se lance à la main
  (`bun components/site/nous-connaitre/verification-nous-connaitre.tsx`). Une
  porte hors chaîne n'échoue pour personne. À verser au lot « portes
  vérifiables » si la chaîne est réoutillée.
- Corrigé : la ligne attend désormais le fragment du nouveau chapô, et les deux
  moitiés restent relues dans la maquette, donc elle échoue encore si la
  maquette cesse d'écrire la formulation proscrite.
- **Et une porte propre a été ajoutée pour la demande de Mehdi du 13/10** (« tu
  parles que de la maintenance, tu parles pas du bureau d'étude, de migen
  chantier ») : les trois groupes de mots qui nomment les trois métiers sont
  exigés un par un dans le chapô. La ligne de `CORRECTIONS` ne gardait qu'un
  fragment, et les deux métiers qui manquaient se trouvent APRÈS ce fragment :
  on pouvait les retirer sans faire tomber la porte.
- **Contrôles positifs joués, les deux** : en retirant du chapô le groupe « le
  bureau d'études qui les conçoit et les met en conformité », la porte tombe sur
  « métier absent du chapô, la page redevient ultra spé résidence ». En remettant
  la formulation de la maquette en B7, elle tombe sur « formulation non corrigée
  dans le rendu ». La porte passe ensuite : 12 sections, 13 conteneurs, 6 offres
  joignables.

### A3. Une retouche de NOTRE main sur sa copie n'était déclarée nulle part

- Fichier : `components/site/nous-connaitre/PerimetreOuiNon.tsx`, colonne de
  droite, deuxième ligne.
- Sa maquette écrit « nous **le** refusons dès qu'**il** sort de la maintenance ».
  La page rend « nous refusons **ce qui** sort de la maintenance ».
- **Aucun interdit du contrat ne l'imposait**, contrairement aux quatre autres
  retouches du bas de page (« mise à disposition » deux fois, « régie »,
  « agence »). Ce sont nos mots, posés sans note, sur la phrase même qui
  restreint le périmètre à la maintenance. Tant que ce n'était pas écrit,
  personne ne pouvait savoir que la formulation servie n'était pas la sienne.
- Corrigé **en déclaration, pas en copie** : la phrase servie n'a pas bougé. Elle
  porte sa ligne dans `CORRECTIONS`, donc la porte vérifie les deux moitiés, et
  le fichier porte la note. Le fond reste son arbitrage, c'est B7.

## B. Ce qui attend une décision de Nathan

### B1. Le schéma en trois cases range cinq offres sur six chez le concurrent

Copie du client, `TroisCases.tsx`, « Maquette, lignes 5351 à 5375 ».

Case 1, verbatim : « Les prestataires de maintenance. Ils entretiennent vos
machines avec leurs propres équipes et leurs propres méthodes. Vous achetez un
résultat, pas des compétences. »
Case 3, verbatim : « migen©. Nous ne plaçons que des techniciens de maintenance. »

Full service, Zéro arrêt, Arrêt technique, Bureau d'études et Travaux industriels
sont exactement ce que la case 1 appelle « vous achetez un résultat ».

Trois options, au choix ou au refus :

1. Changer le premier mot de la case 3 : « **Nous ne faisons que la maintenance
   industrielle.** Un seul métier, des tests propres à chaque spécialité, et des
   intervenants que vous validez un par un. » Registre inchangé, la formule est
   déjà dans sa maquette.
2. Assumer les deux cases : « Un seul métier, la maintenance industrielle, vendu
   de deux façons : nos techniciens travaillent chez vous, ou nous prenons
   l'installation en charge avec nos équipes. »
3. Retirer le bloc de cette page et le garder sur `/offres/residence/`, où il est
   juste.

### B2. Aucune sortie vers une offre dans le corps de la page

Les 8 ancres de l'écran dans la maquette pointent vers `href="#"` : le client n'a
déclaré aucune destination. Les 9 destinations servies sont nos décisions, et
aucune ne mène à une offre.

Remède qui n'invente rien : une rangée de six cartes cliquables, libellés repris
à l'identique du pied de page. **Le seul mot nouveau est l'intitulé du bloc.**
Deux propositions neutres : « Nos six offres », ou « Un métier, six façons de
nous engager ».

### B3. « affecter sur vos sites » resserre une phrase qui ne resserrait pas

Client : « Nous ne faisons que mettre à disposition du personnel qui entretient
les machines, et rien d'autre. »
Servi : « Nous ne faisons qu'une chose, **affecter sur vos sites** des techniciens
qui entretiennent les machines, et rien d'autre. »

Reformuler n'était pas un choix : « mise à disposition » est proscrit par le
contrat, deux fois dans cette phrase. Les mots choisis, eux, sont à nous, et
cette phrase est servie à Google en meta description.

Trois reformulations conformes au contrat :

1. « Nous ne faisons qu'une chose, la maintenance industrielle, et rien d'autre. »
2. « Nous ne faisons qu'entretenir vos machines avec nos techniciens, et rien d'autre. »
3. « Nous ne faisons que la maintenance des machines, et rien d'autre. »

### B4. Deux frises du site servent deux 2021 incompatibles

L'accueil écrit « Création à Lyon. **Deux techniciens**, un client. »
`/nous-connaitre/` écrit « Un technicien de 23 ans », et plus bas « 1 technicien
en avril 2021 ».

Les deux versions sont dans sa maquette. **Un technicien ou deux en avril 2021 ?**
Tant que ce n'est pas tranché, nous ne touchons ni l'une ni l'autre.

### B5. La frise ne fait exister que trois offres sur six

Full service, Zéro arrêt et Arrêt technique n'apparaissent dans aucun jalon.
L'absence est dans sa copie, pas dans notre portage.

Il nous manque les années d'apparition de ces trois offres. Nous n'écrirons rien
sans elles. Deux options : assumer que la frise raconte le métier et non le
catalogue, ou nous donner les trois jalons et nous les intégrons mot pour mot.

### B6. /preuves/ ne rattache aucun de ses 41 cas à une offre

Mesuré : 41 liens de cas, 0 lien d'offre, 0 occurrence des six noms d'offres.
La page n'affirme rien de faux, ce n'est donc pas un défaut. C'est en revanche
l'endroit le plus crédible pour montrer que six offres produisent des résultats.

**Blocage mesuré** : le corpus ne porte pas la donnée. Les 42 fichiers de
`maquette/contenu/site/Preuves/` décrivent chaque cas par Activité, Périmètre,
Organisation, Nature des travaux et Secteur, mais aucun champ d'offre. Étiqueter
les 41 cartes exige que Nathan fournisse l'offre de chaque cas. Nous
n'inventerons pas ces 41 valeurs.

### B7. Les deux colonnes du périmètre se contredisent

`PerimetreOuiNon.tsx`, « Maquette, lignes 5429 à 5457 ». Les deux colonnes sont
de sa plume.

À gauche, « Ce que nous faisons » énumère **cinq** activités, et elle est la
seule énumération de la page qui couvre les trois métiers : affecter des
techniciens, tenir un contrat préventif, conduire un arrêt technique,
« Transférer, monter et mettre en service une installation complète » (travaux
industriels) et « Concevoir en bureau d'études ce que nos équipes maintiendront
ensuite ».

À droite, « Ce que nous ne faisons pas » écrit, verbatim : « Tous les métiers :
nous n'en avons qu'un, et nous refusons ce qui sort de la maintenance. »

**Lues ensemble, les deux colonnes s'annulent** dès que « la maintenance »
désigne le seul entretien des machines : la colonne de droite refuse deux des
cinq lignes de celle de gauche. Le chapô corrigé le 13/10 tranche déjà dans un
sens (« nous ne faisons qu'un métier, l'industrie qui tourne »), mais cette
ligne-ci dit encore l'autre.

C'est le même arbitrage de fond que B1, posé sur une autre phrase : **le « seul
métier » de Migen, c'est la maintenance des machines, ou l'industrie qui
tourne ?** Une seule réponse, et elle décide de B1, B7 et du h1 (B8).

Deux options, aucune n'invente rien :

1. Aligner la colonne de droite sur le chapô : « Tous les métiers : nous n'en
   avons qu'un, et nous refusons ce qui sort de l'industrie. »
2. Laisser la phrase et retirer de la colonne de gauche les deux lignes
   travaux et bureau d'études, qui vivent déjà sur leurs pages d'offre.

### B8. Le h1 de la page nomme un métier sur trois

`Ouverture.tsx`. Sa maquette, verbatim : « **Un seul métier : technicien de
maintenance.** » Rendu mot pour mot, et la porte exige qu'il le reste.

C'est la première ligne que lit un visiteur, et la seule que Google met en
avant. Juste en dessous, le chapô corrigé en nomme trois. **Le titre et son
chapô ne disent plus la même chose depuis le 13/10 au matin**, et c'est la
conséquence directe, assumée, de n'avoir corrigé que le chapô.

Nous n'y touchons pas : c'est son titre, c'est sa formule de marque, et la
réécrire change le positionnement de la page entière. Deux formulations prises
dans ses propres mots, s'il veut la rouvrir :

1. « Un seul métier : l'industrie qui tourne. » (reprend le chapô servi)
2. « Un seul métier, trois façons de le faire. »

### B9. « Nos terrains d'excellence » ne vend que le placement

`TerrainsExcellence.tsx`, maquette ligne 5281, copie du client au caractère près
(les deux paragraphes sont découpés par ses balises `<strong>`, pas réécrits).

Verbatim : « Nos techniciens ne sont pas généralistes [...] C'est cette
expérience terrain qui nous permet d'**envoyer le bon profil, opérationnel dès
le premier jour, sur votre site**. »

« Envoyer le bon profil sur votre site » est la promesse de Résidence et d'elle
seule. Un bureau d'études ne s'envoie pas sur un site, un chantier de transfert
n'est pas un profil. Le bloc s'intitule pourtant « **Notre force** », donc il
parle de l'entreprise, pas d'une offre. Et il ouvre sur `/secteurs/`, qui sert
les trois métiers.

Rien à corriger sans réécrire sa phrase. S'il veut la rouvrir, la fin du
paragraphe est le seul endroit à toucher.

### B10. Les « trois personnes » de l'équipe proche sont les trois du placement

`EquipeProche.tsx`, lignes 5458 à 5483, copie du client. Son titre : « **Trois
personnes, et vous les connaissez par leur nom.** »

Les trois sont le technicien sur votre ligne, le chargé d'affaires, et « le
recruteur qui cherche pour vous [...] c'est lui qui source, teste et vous
présente les profils ». **Deux des trois rôles n'existent que dans le modèle du
placement.** Un client qui achète une étude ou un chantier a en face de lui un
chargé d'études ou un conducteur de travaux, qui n'apparaissent pas.

**Nous n'ajoutons pas de quatrième carte, et c'est un refus motivé** : il
faudrait nommer un rôle que ni la maquette ni le corpus ne portent, et inventer
sa phrase. Zéro donnée inventée. Si Nathan nous donne l'intitulé du rôle et sa
mission en une phrase, la carte s'ajoute mot pour mot et « Trois personnes »
devient « Quatre ».

## C. Ce qui n'est pas un défaut, et pourquoi

Vingt-neuf pistes ont été mesurées puis écartées par une relecture adverse.
Les trois plus utiles à retenir, pour qu'on ne les re-signale pas :

- « Le lecteur n'a aucune porte pour vérifier le contraire » : faux. La section
  `PerimetreOuiNon.tsx` énumère les cinq activités hors placement, et sa colonne
  de droite écrit « Du placement de CV : nos techniciens sont nos salariés, pas
  des profils revendus ».
- « Le sigle ne compte l'entreprise qu'en techniciens » : le dernier paragraphe
  de cette même section nomme trois métiers. Le constat lisait deux blocs sur
  quatre.
- « Le mot offre n'est écrit nulle part » : mesure restreinte au `<main>` et
  présentée comme portant sur la page entière.

## D. Mesuré, non corrigé, hors périmètre : Google lit encore la seule Résidence

**À faire avant le prochain déploiement.** Ce n'est pas un arbitrage, c'est un
défaut de notre main, et il annule une partie du correctif du 13/10.

- Fichier : `app/nous-connaitre/page.tsx`, constante `DESCRIPTION_PAR_DEFAUT`.
- Valeur servie : « Nous ne faisons qu'une chose, affecter sur vos sites des
  techniciens qui entretiennent les machines, et rien d'autre. »
- **C'est exactement la phrase que le commit 663ff3a a retirée de la page** pour
  cause de périmètre trop étroit. Elle est restée dans la description.
- **Vérifié en ligne le 13/10 au soir**, sur
  `https://migen-site.vercel.app/nous-connaitre/` : elle est servie dans **trois
  emplacements**, `<meta name="description">`, `<meta property="og:description">`
  et `<meta name="twitter:description">`. C'est le texte que voient une page de
  résultats Google, un partage LinkedIn et un aperçu de lien.
- **Pourquoi c'est une régression et pas un oubli ancien** : le commentaire qui
  l'accompagne dit « LE TEXTE EST CELUI DE LA PAGE, mot pour mot : la troisième
  phrase du chapô ». Cette règle était vraie le 12/10. Depuis le 13/10 au matin
  le chapô ne contient plus cette phrase : la constante est orpheline et sa
  propre note la dément.
- **Pourquoi elle n'a pas été corrigée ici** : cette passe n'a le droit d'écrire
  que dans `components/site/nous-connaitre/**` et dans ce document.
  `app/nous-connaitre/page.tsx` est hors périmètre, et le périmètre a été
  respecté plutôt qu'élargi en silence.
- **Remède qui n'invente rien** : reprendre la phrase du chapô servi, en la
  tenant sous la longueur utile d'un résultat de recherche. Elle existe déjà,
  mot pour mot, dans `Ouverture.tsx` :
  « Nous ne faisons qu'un métier, l'industrie qui tourne, et rien d'autre : la
  maintenance de vos machines, le bureau d'études qui les conçoit et les met en
  conformité, et les travaux industriels qui les déplacent, les montent et les
  démarrent. » (295 caractères, à écourter ; le début suffit à nommer les trois.)
- **Deuxième mine, même page, même sujet** : `supabase/import/0001_arborescence.sql`
  ligne 361 porte pour `/nous-connaitre/` la description « Un seul métier :
  technicien de maintenance. **Découvrez** qui nous sommes, notre histoire et
  notre façon de travailler. » Elle ne part pas aujourd'hui (aucune ligne `pages`
  pour ce chemin, ni en base ni dans le relais disque : c'est bien la constante
  de repli qui est servie). Le jour où la base est chargée, **elle gagne sur la
  constante** et la page repart avec un seul métier nommé ET un mot interdit par
  le contrat. À corriger dans le même geste, sans quoi le correctif sera
  silencieusement annulé par l'import.

## E. Relevé : ce que la relecture du bas de page n'a PAS touché, et pourquoi

Les sept sections du bas, dans l'ordre de la page. Vingt-quatre chaînes servies
comparées une à une à `maquette/accueil-rendu.html` (lignes 5201 à 5528), sur
texte normalisé (insécables ramenées à l'espace, apostrophes unifiées, tirets
longs neutralisés), avec `difflib` pour retrouver la phrase d'origine de chaque
écart.

| Section | Statut de la copie | Décision, et pourquoi |
|---|---|---|
| `TerrainsExcellence` | Client, mot pour mot | **Pas touché.** Sa phrase ne vend que l'envoi de profils. Signalé en B9. |
| `OrigineDuNom` + `SigleMigen` | Client, sauf deux tirets cadratins retirés | **Pas touché.** Récit de la création en 2021, un seul technicien : restreint par les faits, pas par le cadrage. |
| `TroisCases` | Client, mot pour mot | **Pas touché.** Range cinq offres sur six chez le concurrent. Déjà ouvert en B1, trois options proposées. |
| `FriseCinqAns` | Client, sauf « régie » (interdit) et « Migen Travaux » (A1) | **Pas touché au fond.** Jalons manquants pour Full service, Zéro arrêt, Arrêt technique : B5. Il manque les années, et nous ne les inventons pas. |
| `Fidelisation` | Client, mot pour mot (une virgule pour un tiret) | **Pas touché.** Tout le bloc parle du technicien de maintenance, ses deux chiffres de turnover sont vrais pour ce métier. Il n'énumère rien et ne prétend pas décrire l'entreprise : ce n'est pas un défaut de couverture. |
| `PerimetreOuiNon` | Client, sauf deux retouches de notre main | **Copie pas touchée.** La colonne de gauche est la seule énumération de la page qui couvre les trois métiers. La contradiction avec la colonne de droite est son arbitrage : B7. Retouche non déclarée désormais déclarée : A3. |
| `EquipeProche` | Client, sauf « agence » → « hub » (contrat) | **Pas touché.** Deux rôles sur trois n'existent que dans le placement. Aucune quatrième carte ajoutée : il faudrait inventer un rôle et sa phrase. B10. |
| `PortesValeursRse` | Client, mot pour mot | **Rien à corriger.** Deux portes, aucune restriction de périmètre. |
| `PortesOffres` | De notre main (13/10) | **Rien à corriger.** Les six offres y sont, chacune nommée et liée une fois. Vérifié en ligne. Son intitulé reste provisoire : B2. |

**Les quatre retouches du bas de page qui sont de notre main, et leur cause**,
toutes les quatre désormais déclarées dans `CORRECTIONS` et vérifiées des deux
côtés :

| Sa phrase | Servie | Cause |
|---|---|---|
| « Mettre à disposition des techniciens de maintenance » | « Affecter des techniciens de maintenance sur votre site » | « mise à disposition » proscrit |
| « nous le refusons dès qu'il sort de la maintenance » | « nous refusons ce qui sort de la maintenance » | **aucune.** Nos mots, déclarés en A3 |
| « Il part de l'agence la plus proche » | « Il part du hub le plus proche » | une seule agence en France au contrat, dix hubs |
| « Le modèle en régie se structure » | « Le modèle du technicien en résidence se structure » | « régie » proscrit. **À noter** : notre remplacement nomme une offre là où il nommait un modèle. Fidèle au sens, mais c'est un choix de nos mots. |

**Contrôle des interdits sur tout l'écran, relancé** : aucun montant, aucun taux
en euros, aucun délai chiffré d'intervention (le seul délai de la page est
« rappel dans l'heure », autorisé, et il vit dans le formulaire). Aucun des
treize mots proscrits, tirets cadratins compris. La porte le vérifie à la fois
dans le texte rendu et dans le balisage.

**Un écart de méthode, signalé sans être corrigé** : le bloc des six offres est
rendu depuis `PortesValeursRse.tsx` et non comme une douzième section de
`app/nous-connaitre/page.tsx`, qui est sa place. Le composant le déclare
lui-même. Le remonter d'un cran est un déplacement d'une ligne dans la page,
hors du périmètre de cette passe comme de la précédente.
