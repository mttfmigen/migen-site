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

> **VÉRIFIÉ LE 14/10, et c'est la mesure qui ferme la question, pas cette
> note.** L'entrée disait « sa maquette, verbatim » sans dire où : une doc qui
> affirme sans localiser s'est déjà trompée une journée entière sur ce projet
> (`docs/PASSATION.md` §8.10). La ligne exacte, relue :
>
> ```
> maquette/accueil-rendu.html:5208
> <h1 style="font:600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 …">Un seul métier&nbsp;: technicien de maintenance.</h1>
> ```
>
> Elle se trouve dans `<main data-screen-label="Nous connaître">`, ouvert ligne
> 5202, et `/nous-connaitre/` n'a **aucune capture** dans `maquette/rendu/`
> (498 fichiers, zéro qui contienne « connaitre ») : cette tranche de la
> maquette EST sa référence. Mesure en production le même jour, le h1 servi est
> `Un seul métier : technicien de maintenance.`, identique.
>
> **C'est donc bien la copie du client, et elle n'est pas touchée.** Ce qui
> change, c'est que la porte sait maintenant le dire et le prouver : l'assertion
> du h1 de `verification-nous-connaitre.tsx` porte le motif de l'arbitrage, la
> porte imprime à chaque passage « ARBITRAGE OUVERT, B8 », et elle a désormais
> **quatre témoins** qui prouvent qu'elle sait échouer, dont un qui réécrit le
> h1 avec la formulation n° 1 ci-dessus. Elle n'en avait aucun avant le 14/10,
> et elle avait déjà passé au vert sur une attente périmée (note du 13/10 dans
> `CORRECTIONS`).
>
> ```bash
> bun components/site/nous-connaitre/verification-nous-connaitre.tsx --controle
> ```
>
> **Ce qui attend toujours Mehdi, et rien d'autre** : un mot. Si « Un seul
> métier : technicien de maintenance. » est sa formule, elle reste et la
> contradiction avec le chapô est assumée. S'il veut qu'il nomme les trois
> métiers, la formulation n° 1 ou n° 2 est posée en une ligne dans
> `Ouverture.tsx`, et les deux portes à retourner sont nommées : l'assertion du
> h1 ci-dessus et son témoin.

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

---

## F. Lot accueil, maquette mobile v2 (14/10) : la copie qui diffère, NON réécrite

Le portage mobile de l'accueil (`app/page.tsx`, `components/site/accueil/`)
a relevé cinq écarts de COPIE entre la maquette mobile v2 (m-00,
`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`) et le site. Aucun
n'a été réécrit : chacun est la copie servie aujourd'hui, et la règle « aucun
mot perdu » interdit de la remplacer sans décision. À trancher par Mehdi.

| Où | Le site sert | La maquette mobile v2 écrit |
|---|---|---|
| Pastille du héros | « Partout en France » (seule, demande du 12/10) | « Partout en France · rappel dans l’heure » |
| Parcours, chapô (`ParcoursMobile.tsx`) | « Dites-nous ce qui coince, nous vous montrons la réponse et la page qui la détaille. » | « Dites-nous ce qui vous bloque : chaque carte ouvre la page de l’offre qui y répond. » |
| Parcours, carte 06 (`lib/parcours-mobile.ts`) | « Il me faut un dépannage, vite », offre « Intervention », vers `/offres/depannage-industriel/` | « Je veux confier toute ma maintenance à un seul partenaire », offre « Full service », vers `/offres/full-service/`. Le README de la maquette redirige d'ailleurs `/offres/depannage-industriel/` vers `/offres/zero-arret/`. |
| Bande de logos | « Plus de 200 clients accompagnés » | « Ils nous font confiance » |
| Bouton de « Notre sélection » et de Résidence | « Découvrir migen© Résidence », « Découvrir Résidence » | « Découvrir Résidence » (dc.html, `homeModel`). Le mot est voisin de « découvrez », proscrit : la maquette l'emploie, la liste ne vise que l'impératif. À confirmer. |

---

## G. Lot villes et implantations, maquette mobile v2 (14/10) : la copie qui diffère, NON réécrite

Gabarits 04 Ville et 06 Département (74 pages) et hub `/implantations/`.
Signalé, non corrigé : c'est la copie servie, on ne la remplace pas sans
décision. À trancher par Mehdi.

| Où | Le site sert (et la capture de bureau) | La maquette mobile v2 écrit |
|---|---|---|
| Mention des horaires, 45 pages villes, jusqu'à quatre fois par page (héros et trois bandes d'appel) | « Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à 18h30. Astreinte la nuit, le week-end et les jours fériés en option, nuits, week-ends et jours fériés. » La seconde phrase dit deux fois la même chose. Relevé tel quel dans `maquette/rendu/implantations--lille.html` (4 fois) et dans les 45 fichiers `supabase/import/gabarits-maquette/implantations-*.json`. | « Astreinte en option, nuits, week-ends et jours fériés. » (45 occurrences dans `maquette/mobile-v2/maquette/mobile-v2-data.js`, zéro de la version doublée) |

---

## H. Lot expertises, maquette mobile v2 (14/10) : gabarits 05, 09 et hub `/expertises/`

Trois écarts de copie relevés en reprenant le travail interrompu du 14/10
(commit d39f904), **non corrigés** : chacun oppose les deux sources du client,
la fiche du corpus et la capture de bureau, et la capture fait foi pour le
bureau.

### H1. Le numéro de la fiche, « par téléphone » dans la capture

La fiche écrit « Quatre champs, ou un appel au 04 78 33 72 05 » (étape 1 du
déroulé), la capture de bureau et le relais « … un appel par téléphone ».
Onze endroits : le déroulé de huit domaines (automatisme, électrique,
hydraulique, mécanique, pneumatique, tuyauterie, soudure, types de
maintenance), celui de la programmation automate, la réponse « Combien
coûte… » de l'automate Schneider, et l'étape 1 du hub `/expertises/`
(`expertises-donnees.ts`). Le travail interrompu remettait le numéro : écarté,
parce que la phrase s'affiche au bureau, où elle s'écarterait de la capture
et retirerait « par téléphone » du texte servi. Au téléphone, le numéro est
désormais dans la rangée d'action du héros (dc.html L111). **À trancher** :
la fiche ou la capture.

### H2. « Zéro arrêt » sans son lien dans deux réponses de FAQ

`/expertises/specialisations-constructeur/` et
`/expertises/types-de-maintenance/maintenance-ameliorative/` : la fiche lie
« [Zéro arrêt](/offres/zero-arret/) », la capture l'écrit sans lien. Même
raison, même décision : rien ne change au bureau. **À trancher**.

### H3. La prose de l'offre, remise au téléphone sur 16 spécialités sur 19

Le paragraphe de maillage sous le tableau de « L'offre » (trois à cinq liens
internes par fiche) est remis verbatim dans le relais et rendu au téléphone
seulement (`scripts/restaure-corpus-expertises.mjs`). Trois fiches en sont
écartées : vérin hydraulique, lubrification et préventive systématique, dont
la carte « Complément 4 » de la capture reprend déjà la première phrase. La
remettre ferait lire cette phrase deux fois de suite au téléphone. Sur la
préventive systématique, la carte de la capture est d'ailleurs une phrase
recomposée (« Un parc entier à mettre sous suivi ? Avant de vous engager,
l'audit et conseil en maintenance chiffre… »), deux phrases de la fiche
cousues sans le lien vers Zéro arrêt. **À trancher** si ces trois pages
doivent retrouver leurs liens.

---

## I. Lot contact, maquette mobile v2 (14/10) : la copie qui diffère, NON réécrite

`/contact/` (`app/contact/page.tsx`, `components/site/contact/`). L'écran
contact de la maquette mobile v2 (m-CT, dc.html bloc `isContact`) a sa propre
copie de haut de page. Le site sert celle de l'écran de bureau « Contact /
devis », mesurée contre la maquette vivante par
`components/site/contact/verification-contact.tsx`. Rien n'a été réécrit :
seule l'échelle mobile a été portée. À trancher par Mehdi.

| Où | Le site sert (et la maquette de bureau) | La maquette mobile v2 écrit |
|---|---|---|
| Sur-titre | pastille « Rappel dans l’heure », puis « Astreinte » | « Nous contacter » |
| h1 | « Dites-nous ce qu’il faut tenir. On vous rappelle dans l’heure. » | « Décrivez votre besoin » |
| Chapô | « Un chargé d’affaires étudie votre demande, sélectionne les techniciens adaptés et vous les présente pour validation avant toute intervention. Ligne à l’arrêt ? Appelez directement l’astreinte. » | « Un chargé d’affaires vous rappelle dans l’heure, du lundi au vendredi de 8h00 à 18h30. » |
| Bouton d’envoi (lot formulaire, `components/formulaire/`, non touché ici) | « On me rappelle dans l’heure » | « Envoyer ma demande » |

Les capsules (« Les six offres », l’astreinte), les trois repères et les
sections « Après votre demande », « Nos agences » et « Vous êtes
technicien ? » n’existent pas sur l’écran mobile : elles sont gardées,
resserrées ou repliées, jamais retirées.

---

## Décisions du 14/10

### Les trois blocs sans titre, repliés au téléphone sous un titre donné par Mehdi

**Décision de Mehdi du 14/10** : les trois blocs que la capture de bureau
dessine sans titre de section se replient sous 880 px, FERMÉS au chargement,
sous un titre qu'il a donné lui-même. La copie est validée, écrite mot pour
mot :

| Bloc | Composant | Titre du repli |
|---|---|---|
| Cartes « Certifications » et « Qui intervient chez vous » | `components/site/offre/Reassurance.tsx` | « Certifications et équipe » |
| Bandeau de logos clients | `components/site/offre/LogosClients.tsx` | « Ils nous font confiance » |
| Encart Résidence de `/offres/` | `components/site/offres/EncartResidence.tsx` | « Votre technicien intégré à votre site » |

Ce que ça fait, et ce que ça ne fait pas :

- **Replier, jamais retirer.** Le repli passe par `blocs/SectionPliableMobile` :
  le HTML servi porte le bloc ouvert et tout son texte, un effet client le
  referme sous 880 px seulement.
- **Le titre est un `<h2>`**, hors de tout `data-mobile-seulement` : c'est ce
  qu'exigent `verifie-blocs-pliables.mjs` (un titre lisible dans le bloc) et
  `verifie-titres-replies.mjs` (règles 5 et 6). Le dessin est dans
  `components/site/offre/PliSansTitre.module.css`.
- **Au-dessus de 880 px, rien ne change.** « Certifications et équipe » et
  « Votre technicien intégré à votre site » sont masqués à l'œil sur bureau :
  ils nomment la bascule pour un lecteur d'écran, sans prendre de place.
  « Ils nous font confiance » n'est pas un titre ajouté : c'est la mention
  existante, passée de `<span>` à `<h2>` sans changer de dessin, comme la
  maquette mobile v2 l'écrit déjà (dc.html L93). Mesuré : 158 pages sur 158 à
  la même hauteur qu'avant à 1 280 px, et les rectangles des trois blocs
  identiques au dixième de pixel sur `/offres/residence/`, `/offres/` et
  `/secteurs/aeronautique/`.
- **Le dessin du titre au téléphone** est celui d'un bloc replié de la
  maquette mobile v2 (dc.html L130 : 600 16,5 px / 1,3). « Ils nous font
  confiance » garde ses capitales de 11,5 px, comme dans la maquette.

Gain mesuré à 390 px, build de production local contre l'état en ligne au
départ du lot : 981 px de moins sur `/offres/residence/`,
`/implantations/lille/` et `/expertises/automatisme/`, 2 086 px sur `/offres/`
(les trois blocs), 90 367 px cumulés sur les 158 pages.

**Ce qui reste à faire, hors du périmètre de ce lot :**

- **Les douze pages de secteur** repliaient déjà logos et réassurance ensemble
  (`secteur/PliSecteur`, étiquette « Ils nous font confiance »). La réassurance
  se repliant désormais elle-même, le garde-fou du double repli de
  `secteur/PageSecteur.module.css` efface l'enveloppe : le bandeau du secteur
  se déplie, 176 px de plus par page. Correctif dans `secteur/PageSecteur.tsx` :
  sortir `<Reassurance>` de `<PliSecteur>`, qui ne replie plus que les logos.
- **Trois portes ne connaissent pas encore cette décision.**
  `verifie-offre-rendu.mjs` lit le premier `h1, h2, h3` de chaque section et
  attend « (aucun) » là où la capture n'a pas de titre : elle doit accepter
  ces trois titres. `verifie-blocs-pliables.mjs` compte le texte du corps sans
  les `alt` : un bandeau fait de logos y passe pour vide. `verifie-titres-replies.mjs`
  voit la règle de bureau de `PliSecteur` masquer la bascule imbriquée de la
  réassurance, défaut qui tombe avec le correctif de `PageSecteur.tsx`.

## Corrections de forme du 14/10, avant la mise en ligne (rien ajouté, rien inventé)

- `/preuves/fdj/`, métadonnées SEO tirées du corpus (`maquette/contenu/site/Preuves/preuves--fdj.md`) : le title se terminait sur un mot orphelin (« Maintenance intralogistique en| Migen ») et la description portait l'espace réservé « [département à compléter] ». Retirés tels quels : « Cas Ciuch : Maintenance intralogistique | Migen » et « Ciuch, Saint-Mard : Dans un contrat tripartite… ». **À trancher par Mehdi** : le département de Saint-Mard (77 ou 02 selon la commune visée), si tu veux qu'il y figure.
- `/implantations/…/bourges/` (relevé SEO du 14/10) : la FAQ place Châteauroux dans le Cher, or Châteauroux est dans l'Indre. Copie client, **non modifiée** : à corriger par Mehdi.
- **Titres SEO des 26 fiches de `/ressources/` (14/10, porte `verifie-seo.mjs`)** : le corpus écrivait le h1 suivi de « | Migen » (« Amdec | Migen », « Mtbf | Migen »), interdit par la règle « le title n'est jamais le h1 ». Chaque title est désormais le h1 suivi d'un fragment **pris dans la page elle-même** (son chapô ou un titre de partie), par exemple « AMDEC : définition, méthode et exemple concret | Migen ». Seul le champ `seo.meta_title` des fiches de `supabase/import/gabarits-maquette/` change ; aucun texte servi dans la page ne bouge. **À relire par Mehdi**, et à reporter dans `maquette/contenu/site/**` (ligne « Title SEO ») si le corpus est réimporté, sinon l'ancien titre reviendra.
- **Relecture adverse du lot « portes » (14/10, porte `verifie-seo.mjs`)** : même règle que pour les 26 fiches de `/ressources/`, appliquée aux pages que ce lot avait laissées rouges. Seul `seo.meta_title` ou `seo.meta_description` change ; aucun texte servi dans la page ne bouge. **À relire par Mehdi**, et à reporter dans `maquette/contenu/site/**` si le corpus est réimporté.
  - 12 titres de `/carriere/` (dont le hub, `app/carriere/page.tsx`), `/implantations/bordeaux/`, `/preuves/dimomaint/`, `/preuves/savoye/`, `/preuves/savoye-migration-automates-norvege/` : le title était le h1 suivi de « | Migen ». Chaque title est maintenant le h1 (ou le nom du cas) suivi d'un fragment pris dans le chapeau ou la description de la page, par exemple « Roboticien : missions, formation, compétences et salaire | Migen ».
  - 7 titres de `/preuves/` coupés par le corpus sur un mot orphelin (« Cas Bamesa : Continuité de maintenance pendant un | Migen ») : le mot orphelin est retiré, rien n'est ajouté, comme pour `/preuves/fdj/`.
  - 29 descriptions de villes et `/offres/full-service/` (180 à 237 caractères, plafond 175) : la dernière phrase, générique (« Techniciens évalués, rappel dans l'heure, astreinte en option. »), est retirée de la DESCRIPTION seulement.
  - **Restent à trancher par Mehdi** : Quimper (246) et Perpignan (259), dont la première phrase seule dépasse 175 caractères (la couper serait réécrire) ; les titres de Belfort-Montbéliard (77) et Brive-la-Gaillarde (76), un et deux caractères au-dessus du plafond de 75.
- `/rse/` : la meta description faisait 199 caractères (plafond 175). Sa fin « et les pièces transmises pour votre dossier fournisseur » est retirée de la DESCRIPTION seulement ; la page la sert toujours.
