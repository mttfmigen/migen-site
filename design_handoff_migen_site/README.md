# Passation : site migen.fr (refonte premium)

## Vue d'ensemble
Refonte complète de migen.fr : maintenance industrielle et techniciens qualifiés (Écully / Lyon, couverture nationale). Style premium, gris clair, verre dépoli (glassmorphisme), noir utilisé avec parcimonie, accent orange de marque.
La maquette couvre **262 pages** :
- **248 pages de contenu**, dont le texte est dans `maquette/contenu/site/` et la liste dans `routes.csv` ;
- **14 pages ou modules sur mesure** : accueil, nous connaître, valeurs, RSE, équipe, contact, marques, partenaires, réalisations, plan du site, mentions légales, confidentialité, diagnostic Zéro arrêt, test technicien, modèle de landing page.

## Comment l'utiliser avec Claude Code
1. Dézipper ce dossier à la racine du dépôt du site, par exemple `design_handoff_migen_site/`.
2. Ouvrir Claude Code dans le dépôt.
3. Lui donner cette consigne :

> Lis `design_handoff_migen_site/README.md` en entier, puis `routes.csv`. Le site existe déjà dans ce dépôt. Porte les gabarits qui manquent (01 Article et fiche, 02 Étude de cas, 04 Ville, 07 Métier et carrière, 10 Hub de rubrique, 11 Sous-rubrique) en reproduisant fidèlement les fichiers de `maquette/`. Le texte de chaque page se trouve dans `maquette/contenu/site/`. Ensuite, vérifie chaque URL de `routes.csv` et liste celles qui ne s'affichent pas comme dans la maquette.

Pour voir le site complet sans rien installer, ouvrir `Migen - Site final (autonome).html` dans un navigateur.

## À propos des fichiers de maquette
Les fichiers de `maquette/` sont des **références de design en HTML**. Ce sont des prototypes qui montrent le rendu et le comportement attendus, **pas du code de production à copier**. Il faut les **recréer dans la stack du site existant** (composants, routage, CMS), en suivant ses conventions.
Les fichiers `.dc.html` s'ouvrent dans un navigateur à travers un serveur local, par exemple `npx serve maquette`, grâce à `support.js`. Chaque page est décrite dans la balise `<x-dc>` : le gabarit HTML, avec ses styles écrits directement sur les éléments, et un bloc `class Component` qui contient la logique (données, états, interactions).

## Fidélité
**Haute fidélité.** Couleurs, typographie, espacements, rayons, ombres et textes sont définitifs. Il faut reproduire au pixel près, en utilisant les composants du site existant.

## Source de vérité, par ordre de priorité
1. `maquette/Migen - Site final.dc.html` et les fichiers qu'il importe (`MigenExpertise`, `MigenCarriere`, `MigenCas`, `MigenPreuves`, `MigenRessource`, `MigenMobile`).
2. Le texte des pages : `maquette/contenu/site/**/*.md` et `maquette/contenu/site/index.json` (titre, H1, gabarit, fichier).
3. Les règles de rédaction et de mise en page : `regles/`. En cas de contradiction, c'est la maquette (point 1) qui fait foi.
4. Les règles éditoriales validées par le client, listées plus bas. Elles priment sur tout texte plus ancien.

## Routage : quelle page s'affiche avec quel fichier
La liste complète, URL par URL, est dans `routes.csv`, avec les colonnes url, famille, gabarit, fichier texte, fichier de rendu et H1.
La règle appliquée par la maquette (`Migen - Site final.dc.html`, méthodes `cxLinkGo` et `cxVals`) est la suivante :
- `/ressources/` → page sur mesure « guides » (accueil Ressources).
- `/a-propos/`, `/a-propos/nous-connaitre/`, `/a-propos/valeurs/`, `/a-propos/rse/`, `/a-propos/equipe/` → pages sur mesure.
- `/preuves/` → `MigenPreuves.dc.html` (liste des réalisations).
- `/preuves/<cas>/` → `MigenCas.dc.html`.
- `/carriere/<metier>/…` → `MigenCarriere.dc.html`.
- `/ressources/<rubrique>/…` → `MigenRessource.dc.html`.
- Toute page dont `index.json` porte `"sec": true` (texte organisé en sections) → `MigenExpertise.dc.html`. Cela couvre les offres, expertises, secteurs, villes, départements, spécialités et domaines.
- Les autres pages → gabarit générique de `Migen - Site final.dc.html`, en version « vente » ou « édito ».

### Gabarits 01 à 11 : correspondance avec les fichiers de rendu
| Gabarit | Pages | Fichier de rendu |
|---|---|---|
| 01 Article et fiche | 38 | `MigenRessource.dc.html` (35). `/a-propos/equipe/` est la page Équipe sur mesure. Les 2 guides `/guides/…` utilisent le gabarit générique édito. |
| 02 Étude de cas | 41 | `MigenCas.dc.html` |
| 03 Offre et prestation | 28 | `MigenExpertise.dc.html` (20). Les 8 sous-pages d'offre utilisent le gabarit générique vente : voir `routes.csv`. |
| 04 Ville | 66 | `MigenExpertise.dc.html`, en mode ville : hub local, villes couvertes, photo de la ville |
| 05 Spécialité | 19 | `MigenExpertise.dc.html` |
| 06 Département | 8 | `MigenExpertise.dc.html` |
| 07 Métier et carrière | 13 | `MigenCarriere.dc.html` |
| 08 Secteur | 12 | `MigenExpertise.dc.html` |
| 09 Domaine | 11 | `MigenExpertise.dc.html` |
| 10 Hub de rubrique | 7 | `MigenExpertise.dc.html` (4 accueils de rubrique), `MigenCarriere.dc.html` (/carriere/), `MigenPreuves.dc.html` (/preuves/), page « guides » (/ressources/) |
| 11 Sous-rubrique ressource | 5 | `MigenRessource.dc.html` |

### Ordre des sections par fichier
Les noms sont ceux des attributs `data-screen-label`. Certaines sections ne s'affichent que pour certaines pages.
- **MigenExpertise** : 01 Héros (formulaire à droite) → Chiffres → Logos clients → Réassurance → Réponse directe → [accueil de rubrique : domaines ou types de maintenance] → 03 Problème → 04 Offre → Appel · offre → 05 Déroulé → 06 Garanties → 07 Appel → [secteur : expertises du secteur et offres du secteur en grille de cartes à photos ; expertise : secteurs de l'expertise ; marques maintenues] → 08 Références (études de cas liées) → [ville : hub local, villes couvertes] → 09 Questions → Maillage → 10 Appel final (formulaire de bas de page).
- **MigenCas** : Héros → Chiffres du dispositif → La situation → Ce que nous avons mis en place → Le déroulé → Le dispositif → Le résultat → Votre besoin → Pour aller plus loin.
- **MigenCarriere** : Héros → Chiffres employeur → Réalisations liées → Postuler (formulaire de candidature) → Pour aller plus loin.
- **MigenRessource** : Héros → Rayons → Corps de l'article → Guide → Questions fréquentes → À lire ensuite → Appel.
- **Pages sur mesure** (dans `Migen - Site final.dc.html`, conditions `isHome`, `isContact`…) :
  - Accueil : sections Secteurs et Hubs.
  - Nous connaître : Mot du dirigeant, Terrains d'excellence.
  - Équipe / Direction : Qui nous sommes, Notre histoire, Sélection, Implantations, Engagements, Questions.
  - Les autres pages : Nos offres, Contact / devis, Marques (par famille), Partenaires, Réalisations, Ressources, Plan du site, Nos valeurs, Engagements RSE, Diagnostic Zéro arrêt, Test technicien, Landing page.

## Écarts avec le site en ligne (migen-site.vercel.app)
- **Gabarits pas encore codés sur le site en ligne**, mais présents dans la maquette : 01 Article et fiche, 02 Étude de cas, 04 Ville, 07 Métier et carrière, 10 Hub de rubrique, 11 Sous-rubrique. Cela représente 101 pages, toutes rédigées dans `contenu/site/`.
- **Adresses modifiées par la refonte**, à rediriger en 301 :
  - `/implantations/toulouse/bordeaux/` → `/implantations/bordeaux/`, Bordeaux étant devenu un hub à part.
  - `/implantations/maintenance-industrielle-marseille/` → `/implantations/marseille/`, devenu le hub de Nîmes, Perpignan et Toulon.
  - `/offres/maintenance-externalisee/` → `/offres/full-service/`. Il n'existe pas de texte pour l'ancienne page : c'est l'offre Full service qui répond à ce besoin.
- **Hubs en France** : Bordeaux, Lille, Lyon, Marseille, Nantes, Paris, Strasbourg, Toulouse.

## Composants transverses et comportements
- **En-tête** : une seule capsule en forme de pilule, translucide (flou d'arrière-plan), qui contient le logo et le menu. Elle **s'efface quand on fait défiler la page vers le bas** et **réapparaît quand le curseur passe dessus** ou qu'on revient en haut. Les menus déroulants s'ouvrent au survol.
- **Formulaire de contact** : **le même formulaire partout**, en haut de page (dans le héros, à droite) et en bas de page (appel final). Il est branché sur HubSpot avec des **champs cachés à conserver**, qui ne doivent pas être affichés. Pas de champ « cahier des charges ». Sur le diagnostic Zéro arrêt, le bouton s'intitule **« Demander mon diagnostic »**. Le bloc de bas de page garde un espace net avant le pied de page.
- **Candidature** : on postule par le formulaire du site, qui envoie la candidature dans Teamtailor. Le site ne mentionne jamais « postuler sur Teamtailor ». Questions obligatoires :
  - Mobilité géographique : France entière (uniquement si la personne est prête à déménager) ou une ou plusieurs régions.
  - Temps de trajet maximal accepté entre le domicile et le site client.
  - Années d'expérience.
  - Délai de démarrage.
  - Prétentions salariales, en euros.
- **FAQ** : une seule question ouverte à la fois. Ouvrir une question referme la précédente.
- **Carrousels et bandeaux de logos** : défilement automatique continu, pause au survol, **aucune barre de défilement visible**.
- **Thème clair / sombre** : suit le réglage du système, avec un choix mémorisé (`localStorage["migen-theme"]` = « Clair » ou « Sombre »). Tous les tokens sont redéfinis : voir les deux palettes plus bas.
- **Mobile** : `MigenMobile.dc.html` montre le parcours mobile. Le visiteur part de son problème (« Qu'est-ce qui vous bloque ? »), les blocs se déplient pour rester courts sans perdre le texte utile au référencement, et le menu est un volet à groupes dépliables (Nos offres, Expertises métiers, Expertises sectorielles, Migen, Carrière). Le bouton Desktop / Mobile en bas à droite sert uniquement à présenter la maquette : **ne pas le reprendre**.
- **Landing pages** : one-page, non référencées (noindex), avec un menu réduit à des ancres internes.
- **Animations** : transitions de 200 ms (`--tr`), apparition légère au défilement (`data-reveal`). Aucune animation décorative en boucle, à part les bandeaux de logos.

## Règles éditoriales validées par le client
- **Aucune mention 24h/24, 7j/7 ou « 24h »**, nulle part.
- Chiffres clés :
  - **+120 collaborateurs** ;
  - **+200 clients**, sans jamais préciser « réguliers » ;
  - **10 M€ de chiffre d'affaires** ;
  - **seuls 10 % des techniciens réussissent notre process de sélection**. Le process compte 6 étapes, dont un **entretien technique**. Ne pas parler de « candidats ».
- **4 agences** : Lyon, Montréal, Madrid, Dubaï. En France, on parle de **hubs**, pas d'agences.
- **Offres** : il y en a 6, dont Full service. Résidence est l'offre phare, mais elle n'est **jamais étiquetée « offre principale »**. Zéro arrêt est mise moins en avant et **sans prix affiché**. **Bureau d'études** et **Travaux industriels** sont séparés. Pour les travaux, on ne met pas les techniciens en avant.
- **Résidence** : **aucune durée minimale** (ne pas écrire « à partir de 6 mois »).
- **Arrêt technique** : **pas de délai de prévenance de 3 mois**.
- **Études de cas** : ni statut de mission, ni années. Les titres décrivent la mission.
- **Équipe** : pas d'adresses e-mail.
- **Pas de mascotte, pas d'emoji.**
- **Ressources** : seules les rubriques **Articles** et **Fiches métiers** sont ouvertes. Les autres (fiches pratiques, fiches techniques, livres blancs, process) sont rédigées mais en pause.
- Typographie française : espace insécable avant `: ; ? !`.

## Design tokens
### Palette claire (par défaut)
```
--acc:#ff7c3c; --acc-d:#f4641f; --acc-w:rgba(255,124,60,.11); --acc-ink:#7d3309;
--bg:#f1f2f4; --card:#fff; --panel:#1c1b19; --foot:#141312;
--ink:#1c1b19; --ink1:#4a4845; --ink2:#6a6764; --ink3:#737373; --ink4:#a8a49d;
--line:rgba(28,27,25,.09); --chip:rgba(28,27,25,.055);
--gbd:rgba(255,255,255,.82); --gsol:rgba(255,255,255,.8);
--ph:#dedfe1; --sheet:rgba(250,250,251,.9);
--logo-f:grayscale(1); --map-a:rgba(255,255,255,.95); --map-b:rgba(255,255,255,.55);
```
### Palette sombre (même structure, seul l'orange reste fixe)
```
--bg:#15141a; --card:#232229; --panel:#201f27; --foot:#100f14;
--ink:#f4f3f1; --ink1:rgba(255,255,255,.76); --ink2:rgba(255,255,255,.64);
--ink3:rgba(255,255,255,.54); --ink4:rgba(255,255,255,.52);
--line:rgba(255,255,255,.13); --chip:rgba(255,255,255,.08);
--gbd:rgba(255,255,255,.11); --gsol:rgba(255,255,255,.07);
--ph:#2b2934; --sheet:rgba(28,27,34,.92);
--logo-f:grayscale(1) invert(1) brightness(1.7);
--map-a:rgba(255,255,255,.14); --map-b:rgba(255,255,255,.06); --acc-ink:#ffa878;
```
### Mise en forme
- **Polices** :
  - titres : `--ft: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif` ;
  - texte courant : `--fb: 'Poppins'` (Google Fonts, graisses 400 à 700). Caveat est réservé à quelques accents manuscrits.
- **Tailles et styles** :
  - H1 : `clamp(34px, 4.2vw, 58px)`, graisse 600, interlettrage -0.045em, interligne 1.04 ;
  - H2 : `clamp(30px, 3.4vw, 48px)`, graisse 600, interlettrage -0.045em ;
  - sur-titres : 11–11.5px, graisse 600, MAJUSCULES, interlettrage 0.14em, couleur `--acc` ;
  - texte courant : 15–17px, interligne 1.6–1.75, couleur `--ink1`.
  - Les tailles sont multipliées par `--ts` (1 par défaut).
- **Rayons** : `--rad: 28px` pour les grands panneaux et cartes, `--rad-s: 18px` pour les cartes secondaires et les champs, `999px` pour les pilules, boutons et puces.
- **Grille** : largeur maximale 1200px, marges latérales de 40px (18px sur mobile), espacement vertical entre sections `--sec: 120px`.
- **Verre dépoli** : `background: rgba(255,255,255,var(--gl-a))` avec `--gl-a: .62`, plus `backdrop-filter: blur(22px) saturate(150%)` et une bordure `1px solid var(--gbd)`.
- **Photos** : `filter: saturate(var(--sat))` avec `--sat: .55`. Dégradé sombre en bas quand du texte est posé sur la photo.
- **Bouton principal** :
  - fond `#ff7c3c`, texte blanc, graisse 600, 14–15px ;
  - padding 12–14px × 20–24px, rayon 999px ;
  - ombre `0 10px 24px -12px rgba(255,124,60,.85)` ;
  - au survol : `filter: brightness(.93)`.
- **Ombre des cartes** : `0 1px 1px rgba(0,0,0,.04), 0 22px 50px -32px rgba(0,0,0,.3)`.

## Ressources visuelles (`maquette/assets/`)
- `web/` : photos de terrain et d'industrie, en couleur.
- `team/` : portraits de l'équipe de direction.
- `clients/` et `logos/` : logos clients.
- `fab/` : logos des fabricants dont les machines sont maintenues, avec leur classement dans `brands.json`.
- Les photos de villes sont des URL Envato hébergées à distance, référencées dans `maquette/contenu/site/photos-villes.json`. La licence est à vérifier avant la mise en production.

## Fichiers du dossier
- `Migen - Site final (autonome).html` : le site complet en un seul fichier, qui s'ouvre hors ligne.
- `routes.csv` : la table des 262 pages et du fichier qui affiche chacune.
- `maquette/` : la source de la maquette.
  - `Migen - Site final.dc.html` : fichier principal (accueil, pages sur mesure, routage).
  - `MigenExpertise.dc.html`, `MigenCas.dc.html`, `MigenCarriere.dc.html`, `MigenPreuves.dc.html`, `MigenRessource.dc.html`, `MigenMobile.dc.html`.
  - `MigenAgences.jsx` / `.js` : carte des agences.
  - `support.js` : moteur qui permet d'ouvrir les `.dc.html`.
  - `mg-data*.js` : copie embarquée du texte, pour l'ouverture hors ligne.
  - `contenu/` : le texte de toutes les pages.
  - `assets/` : les images.
  - `_ds/` : la charte Migen (tokens et styles).
  - `Migen - Blocs.dc.html` et `Migen - Regles de mise en page.dc.html` : la bibliothèque de blocs et les règles d'agencement.
- `regles/` : le brief, l'ordre des gabarits, les parcours et longueurs, les corrections, la liste de toutes les pages, les études de cas.
