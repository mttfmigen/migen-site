# Photos des villes : versions sous licence à télécharger

Toutes les photos de ville du site viennent d'Envato Elements, et la maquette
n'en a que les **aperçus** (600 px, filigrane « envato »). Pour la mise en
ligne, il faut la version sous licence de chacune, téléchargée depuis le compte
Envato de Migen.

Télécharger chaque photo en JPG, plus grande taille, et l'enregistrer sous le
nom de la dernière colonne. Les déposer dans `public/assets/villes/` (ou dans
Téléchargements : je les range).

## Cartes des hubs (accueil, « Des hubs partout en France »)

Ce sont les photos les plus récentes de la maquette.

| Ville | Photo | Page Envato | Fichier |
|---|---|---|---|
| Lyon | Lyon, France And The Basilica Of Notre-Dame De Fourvière At Sunset · StructuredVision | https://elements.envato.com/lyon-france-and-the-basilica-of-notre-dame-de-four-WQA3XST | hub-lyon.jpg |
| Paris | A View Of The Eiffel Tower And Paris, France From The Arc De Triomphe · StructuredVision | https://elements.envato.com/a-view-of-the-eiffel-tower-and-paris-france-from-t-F8Z7XZ7 | hub-paris.jpg |
| Lille | Lille, old facade in the center · wirestock | https://elements.envato.com/lille-old-facade-in-the-center-X7R2L8E | hub-lille.jpg |
| Strasbourg | The Towers Of Ponts Couverts In Strasbourg · StructuredVision | https://elements.envato.com/the-towers-of-ponts-couverts-in-strasbourg-strasbo-BLHRJET | hub-strasbourg.jpg |
| Nantes | Aerial view on Nantes city in France · RossHelen | https://elements.envato.com/aerial-view-on-nantes-city-in-france-AWMR4H3 | hub-nantes.jpg |
| Toulouse | Toulouse Cityscape · High-Fliers | https://elements.envato.com/toulouse-cityscape-W6FHS7C | hub-toulouse.jpg |
| Marseille | Marseille Vieux-Port · sam741002 | https://elements.envato.com/aerial-view-of-marseille-pier-vieux-port-saint-jea-AGSWR5Q | hub-marseille.jpg |
| Bordeaux | Bordeaux city in France · RossHelen | https://elements.envato.com/bordeaux-city-in-france-4W5AN9G | hub-bordeaux.jpg |
| **Metz** | Cathédrale de Metz, France · RossHelen | https://elements.envato.com/fr/cathedral-in-metz-france-DAJBNVY | **hub-metz.jpg** |
| **Dijon** | Vue panoramique de Meursault en hiver · wirestock | https://elements.envato.com/fr/scenic-shot-of-meursault-during-winter-wooden-stic-S99SNG5 | **hub-dijon.jpg** |

### Metz et Dijon, choisies le 13/10, livrées le 14/10

Mehdi, 13/10 : « pour dijon mets des vignes en bourgogne » et « pour metz
trouves un truc ». Les deux lignes ci-dessus remplacent l'ancienne mention
« Metz et Dijon utilisent des photos d'atelier déjà au site », qui était la
cause de son retour du 12/10 : « pour le hub de Metz je veux une photo de la
ville ».

**Metz** : la cathédrale, par RossHelen. Ce n'est pas un choix de hasard, c'est
le MÊME photographe et la MÊME série que Nantes et Bordeaux déjà retenues.
L'unité visuelle des dix cartes de hub en dépend.

**Dijon** : Meursault, en Côte-d'Or, à 25 km de Dijon. C'est la seule photo de
vignes AUTHENTIQUEMENT bourguignonne trouvée dans le catalogue. Les autres
résultats étaient du Monferrato et de l'Oltrepò Pavese en Italie, du Burgenland
en Autriche, du Pomerol en Gironde et de Hunawihr en Alsace : les servir sous
le nom de Dijon aurait été une donnée fausse.

Variante si tu préfères une ville à des vignes : « Beaune, Bourgogne » par
SteveAllenPhoto999, https://elements.envato.com/fr/beaune-burgundy-france-KVYZQHS

LIVRÉES LE 14/10. Mehdi, 14/10 : « pour Metz et Dijon va sur Envato ». Les deux
versions sous licence ont été téléchargées depuis le compte Envato de Migen,
licence enregistrée au projet existant « migen.fr », aucun autre projet créé :

| Hub | Titre sur app.envato.com | Fichier Envato | Original | Version web |
|---|---|---|---|---|
| Metz | Cathedral in Metz, France · RossHelen | cathedral-in-metz-france-2026-09-24-06-03-02-utc.jpg | 6899 x 4753, 26,3 Mo | 2000 x 1378, 629 Ko |
| Dijon | Vineyard Rows Stretching toward a Village on a Hill · wirestock | vineyard-rows-stretching-toward-a-village-on-a-hil-2026-09-23-11-39-08-utc.jpg | 5419 x 3613, 3,2 Mo | 2000 x 1333, 707 Ko |

Le lien Elements de Dijon redirige vers la nouvelle fiche app.envato.com, qui a
perdu le nom de Meursault dans son titre anglais ; c'est le même élément, même
auteur, mêmes piquets de vigne. Version web : 2000 px au plus grand côté, JPEG
qualité 82, progressif, sans métadonnées, dans `public/assets/villes/` et, mêmes
octets, dans `components/site/accueil/hubs/` (`metz.jpg`, `dijon.jpg`).

Branchées sur les cartes de l'accueil, la mosaïque de `/implantations/` et le
bloc « Votre hub local » des deux pages ville. Textes alternatifs dans
`lib/descriptions-villes.ts` : « Metz et sa cathédrale Saint-Étienne » et
« Rangs de vigne à Meursault, en Côte-d'Or ». La photo de Dijon montre
Meursault, pas Dijon : aucun texte ne doit l'annoncer comme Dijon. Pas de
saison non plus : le titre d'origine disait « en hiver », mais la photo
montre de l'herbe verte et des arbres en fleur (relevé le 14/10).

## Bloc « Votre hub local » des pages ville

| Page | Photo | Page Envato | Fichier |
|---|---|---|---|
| /implantations/lyon/ | Lyon city in France · RossHelen | https://elements.envato.com/lyon-city-in-france-CZJ4QHV | ville-lyon.jpg |
| /implantations/paris/ | La Défense · RossHelen | https://elements.envato.com/skyscrapers-at-the-financial-district-of-paris-cit-FDDUHA7 | ville-paris.jpg |
| /implantations/marseille/ | Marseille Vieux-Port · sam741002 | (même photo que la carte Marseille) | hub-marseille.jpg |
| /implantations/strasbourg/ | Bridges of Strasbourg · Givaga | https://elements.envato.com/bridges-of-strasbourg-PDK2UWN | ville-strasbourg.jpg |
| /implantations/nantes/ | Nantes city in France · RossHelen | https://elements.envato.com/nantes-city-in-france-ZYWYCZR | ville-nantes.jpg |
| /implantations/bordeaux/ | Bordeaux city in France · RossHelen | (même photo que la carte Bordeaux) | hub-bordeaux.jpg |
| /implantations/paris/rouen/ | Rouen · RossHelen | https://elements.envato.com/street-view-with-clock-tower-in-rouen-city-france-BE9LP4K | ville-rouen.jpg |
| /implantations/maintenance-industrielle-orleans/ | Orléans · RossHelen | https://elements.envato.com/orleans-city-in-france-8JYP9FV | ville-orleans.jpg |
| /implantations/maintenance-industrielle-quimper/ | Quimper · Unai82 | https://elements.envato.com/historic-center-in-the-medieval-town-of-quimper-an-52TKHRY | ville-quimper.jpg |
| /implantations/maintenance-industrielle-lorient/ | Vannes · Unai82 (la maquette met une photo de Vannes sur la page Lorient) | https://elements.envato.com/vannes-coastal-medieval-town-traditional-colored-w-MGSCP62 | ville-lorient.jpg |
| /implantations/maintenance-industrielle-le-havre/ | Port à conteneurs · nikonlamp | https://elements.envato.com/view-of-the-cargo-seaport-NNCPJDF | ville-le-havre.jpg |
| /implantations/maintenance-industrielle-dunkerque/ | Port et centrale · IndustryAndTravel | https://elements.envato.com/container-harbor-and-power-station-at-night-NQMPBSL | ville-dunkerque.jpg |
| /implantations/maintenance-industrielle-metz/ | Cathédrale de Metz · RossHelen (hors maquette, 14/10) | (même photo que la carte Metz) | hub-metz.jpg |
| /implantations/maintenance-industrielle-dijon/ | Meursault en hiver · wirestock (hors maquette, 14/10) | (même photo que la carte Dijon) | hub-dijon.jpg |

Les 52 autres pages ville n'ont pas de photo de la ville : elles reprennent une
photo d'atelier du site. Metz et Dijon n'en avaient pas non plus dans la
maquette ; leur photo de ville est une demande de Mehdi (12/10 et 13/10),
déclarée dans `HORS_MAQUETTE` de `components/site/implantation/verification-ville.tsx`.

Liens retrouvés le 08/10 : ceux du deuxième tableau viennent de
`maquette/contenu/site/photos-villes.json` ; ceux des cartes ont été retrouvés par
la recherche Envato Elements, en exigeant que l'identifiant de l'aperçu soit
exactement celui de la maquette.
