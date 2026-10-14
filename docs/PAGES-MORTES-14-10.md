# Pages mortes, 14/10

Demande de Mehdi : « vérifie les pages mortes de la nouvelle maquette ».
Mesure faite sur le build de production servi en local (`bunx next start -p 5604`),
branche `phase-2-gabarits`, avant et après les corrections de ce lot.

## 1. Le parcours

Point de départ : l'accueil, `/plan-du-site/` et les 267 adresses de `sitemap.xml`.
Chaque page servie en 200 est lue en entier : en-tête, méga-menu, tiroir mobile,
pied de page et corps. Sont suivis : chaque `<a href>` interne, chaque image
(`src`, `srcset`, `url()` en ligne, icônes, `og:image`, et l'original derrière
chaque `/_next/image`), chaque ancre (`#id`, vérifiée dans le HTML de la page cible).
Chaque cible est appelée sans suivre les redirections, pour voir les chaînes.

| Mesure | Avant | Après |
|---|---|---|
| Adresses visitées | 273 | 268 |
| Liens et images relevés | 115 847 | 112 800 |
| Cibles distinctes | 7 065 | 7 060 |
| Réponses 404 | 0 | 0 |
| Réponses 500 | 0 | 0 |
| Images cassées | 0 | 0 |
| Redirections en chaîne (deux sauts ou plus) | 0 | 0 |
| Liens posés vers une 301 | 5 cibles, 47 pages | 0 |
| Ancres sans cible | 3 | 1 (fausse alerte, voir 1.3) |

Le parcours a tourné avec un script jetable, hors dépôt. Les portes du dépôt
qui couvrent le même terrain ont été relancées après correction, voir section 4.

### 1.1 Liens posés vers une 301 : corrigés

Les cinq pages de rubrique de l'ancienne maquette (`/ressources/articles/`,
`/ressources/fiches-pratiques/`, `/ressources/fiches-techniques/`,
`/ressources/livres-blancs/`, `/ressources/process/`) redirigent vers
`/ressources/` depuis le 14/10. Les 47 pages de ressource les visaient encore,
trois fois chacune :

| Cible | Pages qui la citaient |
|---|---|
| `/ressources/articles/` | 27 articles |
| `/ressources/fiches-techniques/` | 9 fiches |
| `/ressources/fiches-pratiques/` | 5 fiches |
| `/ressources/process/` | 4 fiches |
| `/ressources/livres-blancs/` | 2 livres blancs |

Les trois liens : le fil d'Ariane (« Accueil / Ressources / Articles / … »),
le lien du chapô venu de la base (« Cette page de nos Ressources : Articles… »)
et le lien « Tous les articles → » sous « Sur le même sujet ». Chaque clic payait
un aller-retour, et le fil des moteurs (`BreadcrumbList`) déclarait une adresse
qui redirige.

Correction à la source, sans toucher à la base ni aux redirections :

- `lib/redirections.ts` : `cibleDuLien(href)` rend la destination finale d'un lien
  interne quand il vise une source de 301 de la refonte (`REDIRECTIONS_REFONTE`),
  ancre conservée. Le jour où une rubrique redevient une page, ses liens reviennent seuls.
- `components/site/ressource/CorpsRessource.tsx` : les liens du texte (chapô,
  paragraphes, puces) passent par elle. Les mots ne changent pas.
- `components/site/ressource/PageRessource.tsx` et `lecteur/ContenuLecteur.tsx` :
  « Tous les … → » passe par elle (il mène maintenant à `/ressources/`).
- Fil d'Ariane : le rayon reste écrit (« Articles »), mais en texte quand sa page
  redirige, pour ne pas poser un second lien vers le hub. Le fil des moteurs
  saute ce niveau : Accueil, Ressources, la page.

### 1.2 Ancre morte sur les deux guides : corrigée

Sur `/guides/choisir-une-entreprise-de-maintenance/` et
`/guides/reussir-un-transfert-industriel/`, le bandeau mobile « Un technicien pour
appliquer cette méthode ? » porte un bouton « Être rappelé » vers `#etre-rappele`.
Le guide ne posait pas cette ancre : le bouton ne faisait rien.

Correction : `components/site/editorial/Guide.tsx` pose `AncreRappel` (le même
composant que les offres, `components/site/offre/CadenceOffre.tsx`) juste avant
le formulaire `#cx-form`. Div vide, mobile seulement, aucun mot ajouté.
Preuve au navigateur, 390 px : le clic amène `#etre-rappele` à 90 px du haut,
le formulaire juste dessous.

### 1.3 `#rs-process` sur le hub : fausse alerte, non corrigée

La porte `scripts/verifie-ancres.mjs` signale `#rs-process` (« Voir les six étapes ↓ »)
sur `/ressources/` et sur les cinq adresses de rubrique qui y redirigent. Mesuré
au navigateur : cette carte n'est visible que dans l'espace Techniciens, et la
section `#rs-process` y apparaît en même temps (état du composant, pas du HTML
servi). Espace par défaut : carte masquée, section absente. Espace Techniciens :
carte visible, section présente. Le bouton marche.
La porte est trop sévère ici, ce que son en-tête prévoit (« les cibles posées
après coup par du JavaScript »). Le hub est hors de ce lot : la porte reste rouge
sur ce seul cas, déjà rouge avant ce lot.

### 1.4 Pages en pause : aucune depuis un menu

Pages en pause (rubriques « rédigées mais en pause » du colis) : 5 fiches pratiques,
9 fiches techniques, 2 livres blancs, 4 process, soit 20 pages. Toutes répondent
200 et restent en ligne (référencement, cibles de 301).

- **En-tête, méga-menu, tiroir mobile, pied de page** : aucun lien vers une page
  en pause. Un lien de menu serait cité par toutes les pages ; une page en pause
  est citée par 3 à 12 pages, mais au plus par 3 pages hors des pages en pause
  elles-mêmes (le plan du site et les articles ci-dessous ; le reste vient de
  « Sur le même sujet » entre fiches en pause). Recompté en relecture, voir 5.
- **`/plan-du-site/`** : les 20 pages en pause y sont listées, sous leurs rubriques.
- **Corps de quatre articles en ligne**, cinq liens dans le texte :

| Article | Lien vers une page en pause |
|---|---|
| `/ressources/articles/organiser-service-maintenance/` | `/ressources/fiches-techniques/indicateurs-maintenance/`, `/ressources/fiches-techniques/mtbf-mttr/` |
| `/ressources/articles/suivi-de-la-maintenance/` | `/ressources/fiches-techniques/indicateurs-maintenance/` |
| `/ressources/articles/optimiser-la-maintenance/` | `/ressources/fiches-techniques/mtbf-mttr/`, `/ressources/fiches-techniques/trs/` |
| `/ressources/articles/digitalisation-maintenance/` | `/ressources/livres-blancs/externaliser-sa-maintenance/` |

- **`sitemap.xml`** déclare aussi les 20 pages en pause.

Rien n'a été changé ici : ces liens ne sont pas cassés (200), et les retirer
ferait perdre du texte et du maillage. **À trancher par Mehdi** : une page en pause
doit-elle rester listée au plan du site, au sitemap, et citée dans le texte des articles ?

## 2. Le colis contre le site

Colis : `design_handoff_migen_site/routes.csv`, 262 lignes. Site : les 268 adresses
servies en 200 par le parcours.

**250 adresses du colis sont servies en 200 par le site.**

### 2.1 Dans le colis, absentes du site (12)

| Adresse du colis | Réponse du site | Lecture |
|---|---|---|
| `/ressources/articles/` | 301 vers `/ressources/` | décision du 14/10, hub v2 |
| `/ressources/fiches-pratiques/` | 301 vers `/ressources/` | idem |
| `/ressources/fiches-techniques/` | 301 vers `/ressources/` | idem |
| `/ressources/livres-blancs/` | 301 vers `/ressources/` | idem |
| `/ressources/process/` | 301 vers `/ressources/` | idem |
| `/realisations/` | 301 vers `/preuves/` | redirection de la refonte |
| `/a-propos/nous-connaitre/` | **404** | le site sert `/nous-connaitre/` |
| `/a-propos/valeurs/` | **404** | le site sert `/valeurs/` |
| `/a-propos/rse/` | **404** | le site sert `/rse/` |
| « module Diagnostic Zéro arrêt » | sans adresse | le site sert `/diagnostic-zero-arret/` |
| « module Test technicien » | sans adresse | le site sert `/test-technicien/` |
| « landing pages (non référencées) » | sans adresse | hors site |

Les trois 404 ne sont citées par aucun lien du site : le site garde les adresses
de l'ancien site (`/nous-connaitre/`, `/valeurs/`, `/rse/`, dans
`docs/urls-site-actuel.json`), le colis les range sous `/a-propos/`.
**À trancher par Mehdi** : une 301 de `/a-propos/nous-connaitre/`, `/a-propos/valeurs/`
et `/a-propos/rse/` vers les adresses servies protégerait un lien repris du colis.
Ce lot ne change aucune redirection, il ne l'a donc pas posée.

### 2.2 Sur le site, absentes du colis (18)

- Adresses de l'ancien site gardées à la racine : `/nous-connaitre/`, `/valeurs/`,
  `/rse/` (le colis dit `/a-propos/…`, voir 2.1).
- `/cgv/`.
- `/test-technicien/` et `/diagnostic-zero-arret/` (modules du colis, sans adresse
  dans `routes.csv`). `/diagnostic-zero-arret/` est cité par l'en-tête et le pied
  de page, mais absent de `sitemap.xml` et du plan du site.
- Les 12 billets repris de l'ancien blog (commit 6bc2adf) :
  `bien-etre-au-travail`, `certifications-mase-ecovadis`, `digitalisation-des-manuels`,
  `femmes-dans-l-industrie`, `guide-maintenance-industrielle`, `interview-nathan-jorez`,
  `machines-goulots`, `partenariat-dimomaint`, `pourquoi-externaliser`,
  `qualites-du-mainteneur`, `reindustrialisation`, `savoye-dimomaint`, tous sous
  `/ressources/articles/`.

## 3. Ce qui n'a pas été touché

Aucune page supprimée, aucune redirection changée, rien écrit dans la base.
Menu Ressources de l'en-tête et hub `/ressources/` : hors lot.

## 4. Vérification

- `bunx tsc --noEmit` et `bun run build` : verts.
- `node scripts/verifie-liens.mjs` : 0 morte, 0 redirigée, plan de site 267/267 en 200.
- `node scripts/verifie-redirections.mjs http://localhost:5604` : REDIRECTIONS_SANS_PERTE.
- `node scripts/verifie-plan-et-sitemap.mjs` : PLAN_ET_SITEMAP_ALIGNES.
- `node scripts/verifie-interdits.mjs` : vert.
- `bun components/site/ressource/verification-ressource.tsx` : 35/35.
- `bun components/site/verification-gabarits.tsx`, `verification-markdown-brut.tsx`,
  `lib/verification-filet.ts`, `bun --conditions react-server components/site/ressource/lecteur/verification-lecteur.ts` : verts.
- `bun components/site/editorial/verification-editorial.tsx` : 8 pages rouges,
  les mêmes 8 avant ce lot (hub, cinq rubriques redirigées, deux guides), écarts
  de dessin sans rapport avec ce lot.
- `node scripts/verifie-ancres.mjs` : rouge sur le seul `#rs-process` du hub (1.3),
  déjà rouge avant ce lot. Les deux ancres des guides n'y figurent plus.
- Texte du `<main>` à 1280 px, 267 pages, contre l'instantané de production :
  aucun mot perdu sur une page touchée par ce lot. Les 8 pages qui perdent du
  texte (`/plan-du-site/`, `/confidentialite/`, `/ressources/` et les cinq rubriques
  redirigées) le perdent par des lots antérieurs, poussés avant celui-ci.

## 5. Relecture adverse, 14/10

Rejouée sur un build neuf de `phase-2-gabarits` (2c31a86), `bunx next start -p 5624`,
avec un parcours indépendant de celui du lot.

### 5.1 Ce qui est confirmé

- Parcours HTML depuis l'accueil, `/plan-du-site/` et les 267 adresses du sitemap :
  268 pages servies en 200, 1 945 cibles distinctes (liens, images, `srcset`,
  `url()` en ligne, originaux derrière `/_next/image`, `og:image`, adresses du JSON-LD),
  aucune 404, aucune 500, aucune redirection, aucune chaîne.
- Ancres : la seule sans cible est `#rs-process` du hub. Vérifié au navigateur à
  1280 px : le lien est masqué et non focalisable dans l'espace Entreprises, et dans
  l'espace Techniciens le clic amène la section à 96 px du haut. Fausse alerte confirmée.
- Navigateur, les 268 pages à 390 px puis à 1280 px, défilées jusqu'en bas :
  aucune réponse 400 ou plus du site (images paresseuses, polices, données de
  navigation comprises), aucune image cassée, aucune ancre morte dans le DOM vivant
  hors `#rs-process`.
- Menus vivants : tiroir mobile ouvert avec ses rubriques dépliées (accueil, un
  article, un guide), chaque entrée du méga-menu survolée et cliquée, hub dans
  les deux espaces. Aucune cible absente du parcours HTML, aucune page en pause.
- Lecteur du hub (fenêtre ouverte depuis une carte) : « Tous les articles → » mène
  à `/ressources/`, « Décrire mon besoin » à `/ressources/#rs-form` (section à 96 px),
  « Postuler → » de l'espace Techniciens à `/ressources/#postuler` (section à 96 px).
- Guides à 390 px : le bouton « Être rappelé » amène `#etre-rappele` à 90 px du haut,
  le formulaire `#cx-form` au même endroit. À 1280 px le bouton n'est pas affiché.
- Fil d'Ariane des 47 pages : « Articles » (ou sa rubrique) en texte, sans effet de
  survol (le survol ne vise que `a.niveau`) ; `BreadcrumbList` à trois niveaux,
  Accueil, Ressources, la page.
- Colis contre site : 262 lignes, 250 servies en 200, les 12 et les 18 écarts de la
  section 2 recomptés à l'identique. `/diagnostic-zero-arret/` est bien la seule page
  servie hors sitemap, et absente du corps du plan du site.

### 5.2 Ce qui était faux ou manquant

- Section 1.4 : « aucune page en pause n'est citée par plus de trois » était faux
  (jusqu'à 12 pages, par le maillage entre fiches en pause). Phrase corrigée ; la
  conclusion, aucune page en pause depuis un menu, tient.
- Section 4 : la preuve `node scripts/verifie-liens.mjs` ne lisait que 120 des 268
  pages (borne `PAGES_MAX = 120`), et l'un de ses six départs,
  `/ressources/fiches-pratiques/`, est une 301 depuis le 14/10 : la porte le
  sautait. Corrigé : elle part de l'accueil, du plan du site et de chaque adresse du
  sitemap. Résultat sur le build : 274 adresses lues, 0 morte, 0 redirigée.
  Preuve qu'elle sait échouer : contre un faux site, elle trouve un lien mort et un
  lien vers une 301 posés sur une page que seul le sitemap déclare (sortie 1).

### 5.3 Ce qui reste, hors de ce lot

- **La page 404 est vide sans JavaScript.** Une adresse inconnue (par exemple
  `/a-propos/valeurs/`, l'une des trois adresses du colis) répond bien 404, mais son
  HTML ne porte ni en-tête, ni titre, ni lien : tout est dans les données React,
  dessiné par le navigateur. Avec JavaScript, la page affiche « Cette page n'existe
  pas » et 144 liens. Le fichier statique `_not-found.html` du build, lui, porte le
  titre : c'est le rendu dynamique de la 404 qui le perd. Pas un lien cassé, mais un
  visiteur sans JavaScript, ou un robot qui ne l'exécute pas, tombe sur une page
  blanche. À traiter dans un lot de routage, pas ici.
- Les décisions des sections 1.4 et 2.1 restent à trancher par Mehdi.
