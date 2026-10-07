# Brief de design, migen.fr (23/09, remplace la version précédente)

Ce fichier est LE brief. Il rassemble toutes les demandes de Mehdi. Les deux
autres fichiers de ce dossier le complètent : `01-PAR-OU-COMMENCER.md` (la liste
des 11 gabarits et leurs exemples) et `02-PARCOURS-ET-LONGUEUR.md` (le parcours
et la longueur des pages).

## Pourquoi cette version existe

Le premier rendu, `Migen - Gabarit Prestation.dc.html`, a été refusé par Mehdi
pour trois raisons, mesurées :

1. **Il ne respectait pas les pages de base.** La base de tout gabarit, ce sont
   la page d'accueil et les pages d'offre de la maquette (`Migen - Refonte.dc.html`).
   Le rendu partait d'ailleurs.
2. **Tout restait comme la maquette initiale.** Le contenu de la page n'était pas
   vraiment rentré dedans : 1 073 mots rendus contre 1 570 dans le fichier source,
   4 blocs sur 10 absents (offre, garanties, réassurance, maillage).
3. **Il n'y avait qu'un gabarit.** Il en faut onze, et tous obéissent aux mêmes
   règles. Ce brief vaut pour les onze, pas seulement pour Prestation.

## Règle 1 : la base, c'est l'accueil et les pages d'offre de la maquette

Pour les onze gabarits sans exception. On ne dessine pas une page nouvelle, on
prend la forme que la maquette a déjà fixée et on y met le contenu de la page.

- **`Migen - Refonte.dc.html`, la page d'accueil** : héros avec formulaire à
  droite, bande de logos clients, carte certifications et panneau sécurité, bloc
  « Votre problématique », entonnoir de sélection à 10 %, technologies et
  partenaires, bento, réalisations. Ces blocs sont validés, ils se reprennent tels
  quels.
- **Les pages d'offre de la maquette** (Zéro arrêt, Résidence, Chantier, Arrêt
  technique, Construction, Bureau d'études) : leur héros, leur carte « En bref »,
  leurs cartes de formule, leur panneau sombre « notre parti pris », leur tableau
  comparatif. C'est la forme d'une page d'offre chez Migen.
- **`Migen - Blocs.dc.html`** (300 blocs) et **`Migen - Regles de mise en
  page.dc.html`** (250 règles) pour tout le reste. Le contenu choisit le bloc,
  jamais l'inverse.
- **Les photos.** La maquette pose des emplacements d'image dans chaque page
  (héros, photo pleine largeur, cartes de preuves). Un gabarit sans image a été
  refusé : « les blocs ne sont pas utilisés, il n'y a pas d'image ».

## Règle 2 : tout le contenu du fichier est rendu, rien n'est coupé

Le gabarit ne choisit pas ce qu'il garde. Chaque section du fichier de contenu
apparaît, dans l'ordre, en entier. Pas d'accordéon qui cache la moitié du texte,
pas de « voir plus », pas de troncature. Si une section est longue (le tableau de
l'offre fait sept à huit lignes), on la met en forme autrement, on ne la
supprime pas.

**Contrôle avant de rendre** : compter les mots du rendu et les comparer à ceux
du fichier source. Le rendu doit être au moins égal.

## Règle 3 : dans une catégorie, toutes les pages se ressemblent parfaitement

Même suite de blocs, même ordre, même mode de rédaction, même densité. Une page
de ville ne doit pas surprendre quelqu'un qui vient d'en lire une autre. Ce qui
change, c'est le texte, jamais la structure. Le gabarit doit donc tenir avec
n'importe quelle page de sa catégorie : listes de 3 à 8 items, FAQ de 5 à 7
questions, titres courts ou longs.

Une porte de vérification impose ce contrat aux six catégories du corpus de conversion (offres, acquisition, secteurs, implantations, expertises, études de cas). Les articles, fiches, métiers et hubs de rubrique n'ont pas encore ce contrat : le gabarit le fixe.

## Règle 4 : les pages sont longues et suivent un parcours

Voir `02-PARCOURS-ET-LONGUEUR.md`. Médiane 1 500 mots pour une page qui vend,
2 000 pour un article, 730 pour une étude de cas. L'ordre des blocs est un chemin
(j'arrive, je me situe, je me reconnais, je comprends, je vois comment ça se
passe, je vérifie, je m'engage, je vérifie que c'est vrai, je lève mes
objections, j'agis), le même pour toutes les pages d'un gabarit.

## Règle 5 : ce que chaque page qui vend porte, obligatoirement

Ces éléments manquaient et ont été réclamés un par un.

1. **Un formulaire.** Dans le héros pour les pages prestation (elles s'organisent
   comme l'accueil : formulaire à droite, chiffres en bande sous le héros, logos
   et certifications tôt). En fin de page pour les autres gabarits qui vendent.
   Une seule fois par page.
2. **Trois appels à l'action minimum**, héros, après la méthode, fin de page.
   Chacun introduit par une question de besoin, jamais « En savoir plus ». Le
   téléphone 04 78 33 72 05 visible à chaque fois.
3. **De la réassurance**, reprise de l'accueil : carte certifications (démarche
   MASE, évaluation EcoVadis), carte « Qui intervient chez vous » (10 % des
   candidats retenus, techniciens salariés, 10 hubs de techniciens, astreinte
   24/24 et 7/7), bande de logos clients.
4. **Des références** : les preuves du fichier, datées, en cartes cliquables vers
   les études de cas, avec photo.
5. **Le maillage interne en cartes cliquables.** Jamais des liens noyés dans un
   paragraphe. Un lien interne se voit et se clique.
6. **La FAQ en deux colonnes** (bloc G04 de la maquette, titre collant à gauche,
   questions à droite). Jamais une pile pleine largeur.
7. **Le bloc offre lisible** : sept à huit lignes « ce que nous faisons, ce que
   ça change pour vous » se scannent, elles ne se lisent pas comme un mur.

## Règle 6 : interdits de rédaction, non négociables

Le texte est déjà écrit et il les respecte. Le gabarit ne doit rien réintroduire.

- Jamais de tiret cadratin. Virgule, point, parenthèses.
- Jamais de délai chiffré d'intervention ou de réponse. Le seul engagement
  autorisé est « rappel dans l'heure ». Donc jamais « sous 24 h », « sous 48 h »,
  « le jour même », « cette semaine », « 2 h d'astreinte ».
- Jamais de prix, aucun montant en euros. Le prix Zéro arrêt nulle part.
- Jamais « régie », « intérim », « mise à disposition », « sans engagement ».
- Jamais « levier », « sur mesure », « clé en main », « concrètement »,
  « notamment », « incontournable », « découvrez ».
- **Jamais Migen.IO**, ni « application d'aide au diagnostic », ni le chiffre
  « 25 à 40 % » de temps de diagnostic. Retirés de tout le site par Mehdi le
  23/09. Aucun bloc, aucune carte, aucune ligne ne les cite.
- **Zéro donnée inventée.** Aucun chiffre, client, certification ou secteur qui
  ne soit pas dans le fichier de la page. Vide plutôt que faux. Aucun texte de
  démonstration de la maquette ne reste (« montants d'exemple », « à remplacer »).
- Réseau : **4 agences**, Lyon (siège), Montréal, Dubaï, Madrid. **Aucune autre
  agence en France.** Et **10 hubs de techniciens** : Paris, Lille, Marseille,
  Toulouse, Lyon, Metz, Strasbourg, Bordeaux, Dijon, Nantes. Une ville hors de
  cette liste ne reçoit aucun hub de rattachement.

## Contrôle avant de rendre un gabarit

- [ ] Il part de l'accueil et des pages d'offre de la maquette, pas d'une page neuve.
- [ ] Toutes les sections du fichier source sont rendues, dans l'ordre, en entier.
- [ ] Le rendu compte au moins autant de mots que le fichier source.
- [ ] Formulaire, 3 appels à l'action avec téléphone, réassurance, références,
      maillage en cartes, FAQ en deux colonnes : tous présents.
- [ ] Des emplacements de photo aux endroits où la maquette en met.
- [ ] Aucun interdit de la règle 6 réintroduit, Migen.IO compris.
- [ ] Le gabarit tient avec deux pages différentes de la même catégorie.

## Ce que tu produis

Un fichier `.dc.html` par gabarit, onze en tout, chacun avec le contenu de la
page exemple dedans (`refonte/exemples/`). Ordre de travail dans
`01-PAR-OU-COMMENCER.md`.

Pour chaque gabarit, deux pages exemples sont fournies dans `refonte/exemples/` : `N-…` et `Nb-…`. Le gabarit doit tenir avec les deux. Le dossier `uploads/export-claude-design/` est périmé, ne pas l'utiliser.
