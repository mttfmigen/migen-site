# /nous-connaitre/ : ce qui est corrigé, ce qui attend Nathan

Retour de Nathan Jorez, 13/10 : « Fais gaffe, cette page est ultra spé résidence
comme si c'était la seule offre. »

Son impression est fondée et mesurable. Elle ne vient pas d'un gabarit d'offre
posé par erreur : la page reproduit un écran de la maquette du client, et la
plupart des phrases qui restreignent le périmètre sont de sa plume.

Analyse du 13/10 : 108 agents, 34 constats relevés, **29 réfutés par une
relecture adverse à trois lentilles, 5 retenus**.

## Le cadrage, mesuré

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
   bornée aux mêmes lignes, et elle passe.

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
