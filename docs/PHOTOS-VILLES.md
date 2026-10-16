# Pages villes : une photo de maintenance à la place de la photo de ville

16/10, Mehdi : « sur les pages villes, le fond ville fait très agence immo, et pas assez maintenance ».

## Ce qui a changé

Les photos de ville (monuments, panoramas, `public/assets/villes/ville-*.jpg` et `hub-*.jpg`) ne servent plus de grande photo sur une page ville. À leur place, une photo de maintenance industrielle du registre (`public/assets/photos/registre.json`), choisie d'après l'industrie que la page écrit elle-même, sinon un geste de maintenance.

- **Site, `/implantations/<ville>/`** : le champ `contenu.hubLocal.photo` de la fiche (`supabase/import/gabarits-maquette/implantations-*.json`). Il est rendu au bureau dans le panneau « Votre hub local » (`HubLocal.tsx`) et, au téléphone, en photo de tête pour les 12 pages que `PageVille.tsx` liste dans `PHOTO_VILLE_MAQUETTE` (les deux autres pages de la table, Metz et Dijon, gardent au téléphone la photo de la rubrique). Le texte alternatif est la description du registre (`lib/descriptions-photos.ts`, via `altPhoto`).
- **LP, `/lp/maintenance-industrielle-<ville>/`** : le fond du héros (`img` de la page dans `lib/lp/pages.json`). `scripts/genere-lp.mjs` lit la photo dans la fiche du site (`PHOTOS_ENVATO` désigne la fiche de chaque aperçu Envato de la V3) : une seule photo par ville, site et LP. Les huit autres LP villes (Brest, Grenoble, Lille, Metz, Nice, Rennes, Rouen, Toulouse) avaient déjà une photo d'atelier en fond.
- **Porte** : `scripts/verifie-lp-donnees.mjs` refuse désormais une photo de `/assets/villes/` sur une LP ville hors de la grille des dix hubs, témoin compris.

## La table

| Ville | Page(s) | Photo | Ce qu'elle montre (texte alternatif) | Motif, dans le texte de la page |
|---|---|---|---|---|
| Lyon | `/implantations/lyon/`, `/lp/maintenance-industrielle-lyon/` | `chimie-cuve-melange-flexible.jpg` | Technicien contrôlant une cuve de mélange, tablette en main | « les procédés continus de la vallée de la chimie » ; tissu principal : Chimie |
| Le Havre | `/implantations/maintenance-industrielle-le-havre/`, `/lp/maintenance-industrielle-le-havre/` | `tuyau-vanne-volant-rack.jpg` | Technicien manœuvrant une vanne à volant sur un rack de tuyauteries | « La zone industrialo-portuaire havraise aligne des procédés continus » ; Chimie |
| Paris | `/implantations/paris/`, `/lp/maintenance-industrielle-paris/` | `elec-binome-coffret-chaufferie.jpg` | Binôme en diagnostic devant un coffret de commande en chaufferie | bassin mêlé (logistique de couronne, pharmacie, agroalimentaire) : un geste de maintenance commun à tous, le diagnostic en binôme |
| Bordeaux | `/implantations/bordeaux/`, `/lp/maintenance-industrielle-bordeaux/` | `agro-panneau-vannes-nep.jpg` | Changement de circuit sur un panneau de vannes sanitaires | « des chais en pleine vendange » ; Agroalimentaire (vannes inox des chais et des lignes) |
| Marseille | `/implantations/marseille/`, `/lp/maintenance-industrielle-marseille/` | `meca-senior-rouleuse-combinaison.jpg` | Technicien senior accroupi sur une rouleuse à cylindres | « un laminoir à Fos », « four sidérurgique » ; tissu principal : Industrie métallique |
| Nantes | `/implantations/nantes/`, `/lp/maintenance-industrielle-nantes/` | `agro-remplisseuse-cle-plate.jpg` | Intervention à la clé plate sur une remplisseuse rotative | « Vos lignes agroalimentaires tiennent les cadences » ; tissu principal : Agroalimentaire |
| Strasbourg | `/implantations/strasbourg/`, `/lp/maintenance-industrielle-strasbourg/` | `meca-presses-volants-technicienne.jpg` | Technicienne auditant une rangée de presses mécaniques à volant | « La métallurgie use plus vite que tout le reste » ; tissu principal : Industrie métallique |
| Dunkerque | `/implantations/maintenance-industrielle-dunkerque/` | `env-ouvrier-usine-metal.jpg` | Opérateur en bleu de travail surveillant une coulée d'acier en fusion depuis la passerelle d'une aciérie | « la sidérurgie lourde » ; tissu principal : Industrie métallique |
| Rouen | `/implantations/paris/rouen/` | `chimie-technicienne-skid-vanne.jpg` | Technicienne réglant une vanne sur un skid d'instrumentation | « raffinage, papier-carton, agroalimentaire » ; Chimie |
| Lorient | `/implantations/maintenance-industrielle-lorient/` | `agro-mains-vanne-sanitaire.jpg` | Mains réglant une vanne sanitaire inox au tournevis | « l’agroalimentaire breton, produits de la mer et volaille » ; tissu principal : Agroalimentaire |
| Quimper | `/implantations/maintenance-industrielle-quimper/` | `chaudro-meulage-visiere.jpg` | Meulage d'un cordon de soudure sous visière de protection | « la chaudronnerie navale de Concarneau et de Douarnenez » ; tissu principal : Industrie métallique |
| Orléans | `/implantations/maintenance-industrielle-orleans/` | `env-photo-industrie-pharmaceutique.jpg` | Technicienne en tenue stérile refermant la trappe d'une cuve inox de mélange en salle blanche | « des ateliers de cosmétique et de pharmacie où chaque équipement doit rester qualifié » |
| Metz | `/implantations/maintenance-industrielle-metz/` | `env-factory-worker-inspecting-robotic-arm-in-manuf.jpg` | Technicien en gilet haute visibilité inspectant le poignet d'un bras robot orange dans sa cellule grillagée | « La cadence automobile ne tolère pas l'improvisation » ; tissu principal : Automobile. Le robot de ligne en cellule est l'équipement type des ateliers automobiles ; `automobile-ligne-montage-binome.jpg`, plus littéral, aurait servi 7 pages pour un plancher de 5 (porte `verifie-photos-repetition.mjs`) |
| Dijon | `/implantations/maintenance-industrielle-dijon/` | `agro-ihm-ligne-conditionnement-senior.jpg` | Technicien senior sur l'IHM d'une ligne de conditionnement | « des lignes de conditionnement alimentaire » |

Quatorze photos différentes, une par ville. Aucune n'était déjà servie par la page où elle arrive (relu sur le rendu), et aucune n'est dans `lib/photos-hors-industrie.ts`. Elles ont été prises parmi les moins servies de leur thème : `node scripts/verifie-photos-repetition.mjs` relève les mêmes six photos emballées avant et après (défaut antérieur), aucune des quatorze.

Photos de ville retirées : `ville-lyon`, `ville-le-havre`, `ville-paris`, `ville-nantes`, `ville-strasbourg`, `ville-dunkerque`, `ville-rouen`, `ville-lorient`, `ville-quimper`, `ville-orleans`, `hub-bordeaux`, `hub-marseille`, `hub-metz`, `hub-dijon`. Les fichiers restent dans `public/assets/villes/` : les `hub-*` servent les vignettes des hubs, les `ville-*` ne sont plus servis par aucune page ville.

## Ce qui n'a pas changé

- Les vignettes des dix hubs, qui servent à reconnaître une ville : grille de `/implantations/`, accueil, cartes de `/carriere/`, grilles `hubImg` des LP `/lp/devis/` et `/lp/maintenance-industrielle-france/` (`components/site/implantations/photos-hubs.ts`).
- Les pages hors villes.
- Les composants : seule la donnée a changé. Les commentaires de `PageVille.tsx`, `HerosVille.tsx` et `verification-ville.tsx` parlent encore de « la photo de la ville » ; la porte de `verification-ville.tsx` accepte la nouvelle photo parce qu'elle est au registre (`deLaRepartition`).
