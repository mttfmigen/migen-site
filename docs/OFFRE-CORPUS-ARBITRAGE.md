# Page d'offre : la maquette contre le corpus, l'arbitrage qui reste

Relevé du 05/10, mesuré sur `/offres/residence/` servi en local, et sur l'écran 15
de `maquette/site-final.html`.

## Le constat

La page rend **13 sections**. Sept viennent de la maquette, six viennent du corpus
SEO et n'existent nulle part dans le dessin du client.

| Origine | Section rendue |
|---|---|
| maquette | Le cadre, en quatre chiffres. |
| maquette | Ce que nos clients vivaient avant de nous appeler. *(le bloc avant/après)* |
| maquette | Vous gardez la main. Nous portons le reste. |
| maquette | Quatre étapes, et vous gardez la main partout. |
| maquette | Seuls 10 % des techniciens réussissent notre process. |
| maquette | Ce que nous avons fait, chez qui, et comment |
| maquette | Ce qu'on nous demande avant de signer. |
| maquette | Chaque situation a son offre. |
| maquette | Décrivez le renfort qu'il vous faut. On revient avec des profils. |
| **corpus** | Ce que nous faisons / Ce que ça change pour vous *(tableau à deux colonnes)* |
| **corpus** | Le déroulé, en six étapes numérotées |
| **corpus** | Nos engagements / Ce que nous garantissons. |
| **corpus** | Le poste de technicien de maintenance reste vacant pendant des mois… |
| **corpus** | Prochaine étape / Besoin d'un technicien qualifié sur votre site ? |
| cocon | Pages liées |

Et **trois sections de la maquette ne sont toujours pas portées** :

- Une panne signalée avant 16 h, une intervention garantie *(comment ça marche)*
- Trois formules. Une recommandation *(les formules)*
- La première visite prépare toutes les nuits suivantes *(le premier mois)*

## Pourquoi, et ce n'est pas un bug

C'est une règle écrite du projet, dans `docs/GABARITS.md` :

> Quand la maquette dessine moins de sections que le corpus n'en porte, le reste
> est rendu **sous** les sections de la maquette, avec ses motifs à elle.

Cette règle a été écrite pour protéger le référencement. Elle produit exactement
l'effet que Mehdi signale depuis ce matin : la page ne ressemble pas à la maquette,
parce que la moitié de ce qu'elle affiche n'y a jamais été dessinée.

## Les deux règles qui se contredisent

1. **« Respecte la maquette au mot pour mot »**, tranché le 05/10. La page d'offre
   doit être les 14 sections de l'écran 15, dans leur ordre, avec leur dessin.
2. **Le corpus ne se supprime jamais**, écrit dans `GABARITS.md`. Ce sont 185 pages
   rédigées, et c'est la substance du référencement des pages d'offres.

Les deux ne peuvent pas être vraies sur la même page. L'arbitrage appartient à Mehdi.

## Les trois chemins

### A. La maquette seule
La page rend les 14 sections de la maquette, rien d'autre. Le contenu du corpus qui
n'entre dans aucune section est retiré de la page.

- **Gagne** : fidélité totale, immédiatement vérifiable.
- **Perd** : du texte indexé disparaît des 20 pages d'offres. Impact SEO réel et non
  mesuré à ce jour.

### B. La maquette d'abord, le corpus en dessous
L'état actuel : sections de la maquette en haut, reste du corpus en bas.

- **Gagne** : rien n'est perdu pour le référencement.
- **Perd** : la page ne ressemble pas à la maquette, et c'est le reproche de Mehdi.

### C. Le corpus entre DANS les gabarits de la maquette
Chaque bloc du corpus est rangé dans la section de la maquette qui lui correspond
(« Le déroulé » en six étapes alimente « Quatre étapes » ; « Nos engagements »
alimente « Vous gardez la main » ; le tableau deux colonnes alimente « Ce qui est
inclus »). Ce qui ne rentre dans aucune section part sur une page éditoriale dédiée,
liée depuis la page d'offre.

- **Gagne** : la fidélité ET le texte indexé, qui change de page sans disparaître du site.
- **Perd** : un travail de correspondance bloc par bloc, et un conflit à trancher quand
  le corpus dit six étapes et la maquette quatre.

## Ce qui est déjà mesuré, pour décider sur des chiffres

- La section « Ce qui est inclus » portée depuis la maquette est conforme **à 8 px près**
  (764 px contre 772 px, grille et panneaux identiques au pixel).
- **28 champs sur 33** de `OFFERS` sont servis. Manquent `lead`, `strip`, `incP`, `s30`, `s32`.
- La maquette **ne contient aucun montant**. Elle écrit « le tarif vous est présenté en
  rendez-vous ». Aucun prix à publier.
