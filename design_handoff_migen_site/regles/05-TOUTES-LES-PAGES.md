# Toutes les pages, sans exception

Le dossier `pages/` contient les 203 pages du site qui ont un texte, une par fichier,
rangées comme les URL du site (`pages/offres/depannage-industriel.md` =
`/offres/depannage-industriel/`). L'index `pages/00-INDEX.md` donne pour chaque page
son gabarit (01 à 11) et son nombre de mots.

Les 19 pages sans fichier (accueil, contact, LP, mentions, équipe, valeurs, RSE,
partenaires, réalisations, modèles) sont déjà dessinées dans « Migen - Refonte.dc.html ».

## Prompt, une fois les onze gabarits validés

---

Applique maintenant les onze gabarits à toutes les pages de `pages/`, sans exception.
Pour chaque ligne de `pages/00-INDEX.md` : prends le fichier, applique le gabarit indiqué,
produis `pages/<même chemin>.dc.html`. Tout le contenu du fichier est rendu, dans
l'ordre, en entier ; le rendu compte au moins autant de mots que la colonne « Mots ».
Le gabarit ne s'adapte pas à la page : c'est le contenu qui entre dans le gabarit ;
deux pages d'un même gabarit ont exactement la même suite de blocs.

Avance catégorie par catégorie, dans l'ordre de 01-PAR-OU-COMMENCER.md, et à la fin
de chaque catégorie écris une ligne par page : URL, mots du fichier, mots rendus,
points de la liste de contrôle corrigés. Une page qui n'atteint pas ses mots ou à
qui il manque un bloc n'est pas rendue : tu la reprends avant de passer à la suivante.

Interdits, toujours : tiret cadratin, délai chiffré (seul « rappel dans l'heure »),
prix, Migen.IO, « régie », « intérim », « sans engagement », « en savoir plus »,
toute donnée absente du fichier.
