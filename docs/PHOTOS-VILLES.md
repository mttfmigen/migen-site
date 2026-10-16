# Pages villes : une photo de maintenance à la place de la photo de ville

16/10, Mehdi : « sur les pages villes, le fond ville fait très agence immo, et pas assez maintenance ».

## Ce qui a changé

Les photos de ville (monuments, panoramas, `public/assets/villes/ville-*.jpg` et `hub-*.jpg`) ne servent plus de grande photo sur une page ville. À leur place, une photo de maintenance industrielle du registre (`public/assets/photos/registre.json`), choisie d'après l'industrie que la page écrit elle-même, sinon un geste de maintenance.

Deux emplacements, deux cadrages, donc deux tables :

- **Site, `/implantations/<ville>/`** : le champ `contenu.hubLocal.photo` de la fiche (`supabase/import/gabarits-maquette/implantations-*.json`). Au bureau, il est rendu dans le panneau « Votre hub local » (`HubLocal.tsx`, 498 x 420, photo centrée, voile sombre par le bas) : le badge, le nom et la phrase couvrent la photo de 102 à 391 px de haut, à partir de 28 px du bord gauche. Le sujet doit donc être en haut, ou à droite, ou la photo ne montrer qu'un équipement. Au téléphone, la même photo sert de photo de tête pour les 12 pages que `PageVille.tsx` liste dans `PHOTO_VILLE_MAQUETTE`. Metz et Dijon n'y sont pas : au téléphone, elles gardent la photo de la rubrique (`ph-hero-raffinerie.jpg`), une raffinerie, alors que Metz est automobile et Dijon agroalimentaire. Le texte alternatif est la description du registre (`lib/descriptions-photos.ts`, via `altPhoto`).
- **LP, `/lp/maintenance-industrielle-<ville>/`** : le fond du héros (`img` de la page dans `lib/lp/pages.json`), posé par `scripts/genere-lp.mjs` (table `PHOTOS_ENVATO`). Le héros fait 1440 x 873 au bureau, texte de 160 à 739 px, formulaire de 820 à 1280 : un visage tombe sous l'un ou sous l'autre. La photo du hub local y mettait le visage sous le formulaire (Strasbourg, Bordeaux, Nantes, Marseille) ou sous le titre (Lyon, Le Havre, Paris). Chaque LP a donc sa photo : une machine, une ligne, un process, sans personne au centre. Les huit autres LP villes (Brest, Grenoble, Lille, Metz, Nice, Rennes, Rouen, Toulouse) avaient déjà une photo d'atelier en fond.

## Site : le panneau « Votre hub local »

| Ville | Page | Photo | Ce qu'elle montre (texte alternatif) | Motif, dans le texte de la page |
|---|---|---|---|---|
| Lyon | `/implantations/lyon/` | `chimie-reacteurs-agites-passerelle.jpg` | Batterie de réacteurs agités vue depuis une passerelle | « les procédés continus de la vallée de la chimie » ; tissu principal : Chimie. Sans personne : rien sous le badge |
| Le Havre | `/implantations/maintenance-industrielle-le-havre/` | `tuyau-vanne-volant-rack.jpg` | Technicien manœuvrant une vanne à volant sur un rack de tuyauteries | « La zone industrialo-portuaire havraise aligne des procédés continus » ; Chimie. Visage en haut à gauche, au-dessus du badge |
| Paris | `/implantations/paris/` | `elec-senior-armoire-relais.jpg` | Technicien senior devant une armoire de relais ouverte, portable en main | bassin mêlé (logistique de couronne, pharmacie, cosmétique, agroalimentaire) : un geste commun à tous, le diagnostic électrique. Visage en haut à droite |
| Bordeaux | `/implantations/bordeaux/` | `agro-panneau-vannes-nep.jpg` | Changement de circuit sur un panneau de vannes sanitaires | « des chais en pleine vendange » ; Agroalimentaire |
| Marseille | `/implantations/marseille/` | `meca-senior-rouleuse-combinaison.jpg` | Technicien senior accroupi sur une rouleuse à cylindres | « un laminoir à Fos », « four sidérurgique » ; Industrie métallique |
| Nantes | `/implantations/nantes/` | `agro-remplisseuse-cle-plate.jpg` | Intervention à la clé plate sur une remplisseuse rotative | « Vos lignes agroalimentaires tiennent les cadences » ; Agroalimentaire |
| Strasbourg | `/implantations/strasbourg/` | `meca-presses-volants-technicienne.jpg` | Technicienne auditant une rangée de presses mécaniques à volant | « La métallurgie use plus vite que tout le reste » ; Industrie métallique |
| Dunkerque | `/implantations/maintenance-industrielle-dunkerque/` | `env-infrastructure-usine-acier-avec-tuyaux.jpg` | Réseau de grosses conduites et vanne à volant au pied d'un haut fourneau d'aciérie | « la sidérurgie lourde » ; Industrie métallique. Remplace `env-ouvrier-usine-metal.jpg` (relecture du 16/10) : un ouvrier en chemise à côté d'une coulée, sans tenue anti-chaleur, une scène de production sur un site qui affiche MASE |
| Rouen | `/implantations/paris/rouen/` | `il-technicien-maintenance-inspecte-equipement-ind.jpg` | Technicien accroupi entre des ballons tampons et un réseau de tuyauterie sur une terrasse technique, radio à la main | « raffinage, papier-carton, agroalimentaire » ; Chimie. Le titre de Rouen est long (« Rouen, couvert par le hub Paris ») : le visage doit être au-dessus de lui, à droite du badge, et il l'est |
| Lorient | `/implantations/maintenance-industrielle-lorient/` | `il-interieur-de-chantier-naval-24-mars-2026-1600.jpg` | Halle de construction métallique, poutres et tôles alignées au sol, plateau automoteur jaune sous les ponts roulants | « la construction navale et la mécanique de Lorient-Keroman ». La photo agro (vannes sanitaires) ressemblait trop à celle de Bordeaux |
| Quimper | `/implantations/maintenance-industrielle-quimper/` | `chaudro-presse-plieuse.jpg` | Chaudronnier réglant un pli sur presse plieuse | « la chaudronnerie navale de Concarneau et de Douarnenez » ; Industrie métallique. Visage en haut à droite |
| Orléans | `/implantations/maintenance-industrielle-orleans/` | `pharma-cuves-process-passerelle.jpg` | Opérateur entre des cuves de process pharmaceutiques | « des ateliers de cosmétique et de pharmacie où chaque équipement doit rester qualifié ». Sujet en haut à droite. Aucun autre hub local ne la sert (l'ancienne photo était aussi celle de Nancy) |
| Metz | `/implantations/maintenance-industrielle-metz/` | `env-factory-worker-inspecting-robotic-arm-in-manuf.jpg` | Technicien en gilet haute visibilité inspectant le poignet d'un bras robot orange dans sa cellule grillagée | « La cadence automobile ne tolère pas l'improvisation » ; Automobile. Le robot de ligne en cellule est l'équipement type des ateliers automobiles |
| Dijon | `/implantations/maintenance-industrielle-dijon/` | `agro-ihm-ligne-conditionnement-senior.jpg` | Technicien senior sur l'IHM d'une ligne de conditionnement | « des lignes de conditionnement alimentaire » |

Quatorze photos différentes entre elles, et aucune n'est la photo d'un autre panneau « Votre hub local » du site (les 74 fiches relues). Aucune n'était déjà servie ailleurs sur la page où elle arrive, aucune n'est dans `lib/photos-hors-industrie.ts`. Elles ne sont pas toutes parmi les moins servies de leur thème (Dijon et Strasbourg servent 7 pages, Lorient et Quimper 8) : le sujet et sa place dans le panneau passent avant. `node scripts/verifie-photos-repetition.mjs` relève les mêmes six photos emballées avant et après (défaut antérieur), aucune des quatorze.

## LP : le fond du héros

| Ville | LP | Photo | Ce qu'elle montre | Motif, dans le texte de la LP |
|---|---|---|---|---|
| Lyon | `/lp/maintenance-industrielle-lyon/` | `chimie-reacteurs-agites-passerelle.jpg` | Batterie de réacteurs agités vue depuis une passerelle | « chimie, pharmaceutique (Vallée de la chimie) » ; la même photo que le hub local de la page du site |
| Le Havre | `/lp/maintenance-industrielle-le-havre/` | `env-photo-industrie.jpg` | Réseau de tuyauteries calorifugées et ballons de vapeur sous la charpente d'une salle des machines | « la pétrochimie, la raffinerie et la logistique portuaire » |
| Paris | `/lp/maintenance-industrielle-paris/` | `robot-cellules-grillagees.jpg` | Cellules robotisées derrière grillage de sécurité | « logistique, automobile, agroalimentaire et ferroviaire » |
| Bordeaux | `/lp/maintenance-industrielle-bordeaux/` | `env-photos-industrie-agro-alimentaire.jpg` | Rangée de cuves inox reliées par un collecteur de tuyauterie dans une salle de brassage | « le viticole, l'agroalimentaire » |
| Marseille | `/lp/maintenance-industrielle-marseille/` | `env-usine-metallique.jpg` | Intérieur d'une aciérie, lueur orange du four et charpente métallique dans la poussière | « pétrochimie, sidérurgie et logistique portuaire » |
| Nantes | `/lp/maintenance-industrielle-nantes/` | `tuyau-vanne-volant-conserverie.jpg` | Vanne à volant et tuyauteries inox dans une conserverie | « aéronautique, naval et agroalimentaire » ; les photos d'aéronautique sont toutes dans `lib/photos-hors-industrie.ts` |
| Strasbourg | `/lp/maintenance-industrielle-strasbourg/` | `pharma-blistereuse-mecanisme.jpg` | Mécanisme d'une blistereuse pharmaceutique en gros plan | « pharmaceutique, automobile et agroalimentaire » |

Le héros des LP n'a pas de texte alternatif (`alt=""`, image de fond). Aucune de ces sept photos n'est servie ailleurs sur sa LP, où les autres images viennent de `/assets/web/`.

**Au téléphone (390 px), le héros des LP reste peu lisible** : le gabarit (`HerosServiceLP.tsx`) recadre la photo au centre (`cover`, sans `objectPosition`) en une bande de 390 x 1560, un sixième de sa largeur, sous un voile sombre. C'était déjà le cas avec les photos de ville. Les photos ci-dessus ont un équipement au centre (cuve, conduite, robot, vanne, rouleau), mais le corriger vraiment demande un cadrage dans le composant.

Photos de ville retirées : `ville-lyon`, `ville-le-havre`, `ville-paris`, `ville-nantes`, `ville-strasbourg`, `ville-dunkerque`, `ville-rouen`, `ville-lorient`, `ville-quimper`, `ville-orleans`, `hub-bordeaux`, `hub-marseille`, `hub-metz`, `hub-dijon`. Les fichiers restent dans `public/assets/villes/` : les `hub-*` servent les vignettes des hubs, les `ville-*` ne sont plus servis par aucune page ville.

## Ce qui garde ces choix

- `scripts/verifie-lp-donnees.mjs` (dans `bun run verifie`) refuse une photo de `/assets/villes/` en fond d'une LP ville hors de la grille des dix hubs, et dans le `hubLocal.photo` de toute fiche `/implantations/`, chaque règle avec son témoin. La porte des pages villes (`components/site/implantation/verification-ville.tsx`, hors de ce lot) accepte encore la photo de ville de la maquette pour ces panneaux.
- `scripts/repartit-photos.ts` épingle les quatorze hubs locaux (`HUB_LOCAL_A_LA_MAIN`) : relancé avec `--applique`, il les compte sans les remplacer, et ne les reprend ni ailleurs sur la page, ni en tête d'une page sœur.
- `lib/photo-par-page.ts` (couverture des cartes et des vignettes de partage) : les lignes des quatorze pages sont reprises de `node scripts/genere-photo-par-page.mjs`. Le reste du fichier n'est pas régénéré : il avait déjà 13 pages de retard, hors de ce lot.

## Ce qui n'a pas changé

- Les vignettes des dix hubs, qui servent à reconnaître une ville : grille de `/implantations/`, accueil, cartes de `/carriere/`, grilles `hubImg` des LP `/lp/devis/` et `/lp/maintenance-industrielle-france/` (`components/site/implantations/photos-hubs.ts`).
- Les pages hors villes.
- Les composants : seule la donnée a changé. Les commentaires de `PageVille.tsx` et `HerosVille.tsx` parlent encore de « la photo de la ville » ; ils sont dans `components/site/implantation/`, qu'un autre chantier retouche.
