# Lighthouse mobile, 14/10/2026 : cinq gabarits mesurés en production

Rapport en lecture seule : aucune ligne de code n'a été modifiée pour l'écrire.
Les quinze rapports JSON bruts sont hors du dépôt, dans le dossier de travail de
la session (`scratchpad/lighthouse/`, fichiers `<page>-p<passe>.json`).

## 1. Ce qui a été mesuré, quand, et comment

| | |
|---|---|
| Date et heure | 14/10/2026, de 10 h 24 min 36 s à 10 h 27 min 20 s, heure de Paris (`fetchTime` 08:24:36Z à 08:27:20Z) |
| Cible | `https://migen-site.vercel.app`, production, lecture seule |
| Déploiement mesuré | `dpl_9Z7Xyz12f4Jsxe8X2qtMUx9UfwHd` (relevé 215 fois dans les URL d'images de l'accueil) |
| En-têtes au moment de la mesure | `x-vercel-id` propre à chaque requête, région `cdg1` (exemple : `cdg1::klkss-1791966241950-d845a8d9860d` pour `/`) ; `x-vercel-cache: HIT` sur les cinq pages, `age` de 862 à 1 015 s |
| Outil | Lighthouse 12.8.2 (`bunx lighthouse@12`), Chrome du système en mode sans tête (HeadlessChrome 155) |
| Profil | mobile, écran émulé 412 × 823 à 1,75 ; bridage simulé (RTT 150 ms, 1,6 Mbit/s, processeur ralenti 4 fois) |
| Catégories | performance, accessibilité, bonnes pratiques, SEO |
| Passes | trois par page, strictement l'une après l'autre (passe 1 des cinq pages, puis passe 2, puis passe 3), jamais deux Chrome en même temps |
| Passe retenue | la médiane du score de performance ; à score égal, la médiane du LCP |

Commande, identique pour les quinze passes :

```
bunx lighthouse@12 <url> --form-factor=mobile --screen-emulation.mobile \
  --throttling-method=simulate --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=<fichier> --chrome-flags="--headless=new" --quiet
```

Les cinq pages ont répondu 200 en production : aucune n'a été remplacée.

Le bandeau de consentement n'a pas été contourné : chaque passe part d'un profil
Chrome vierge, donc sans choix enregistré, comme un premier visiteur.

### Indice de la machine (`environment.benchmarkIndex`)

| Page | Passe 1 | Passe 2 | Passe 3 |
|---|---|---|---|
| Accueil | 4 235,5 | 4 559 | 4 569,5 |
| Offre | 4 546,5 | 4 633 | 4 620,5 |
| Ville | 4 388 | 4 641 | 4 543 |
| Domaine | 4 597 | 4 621 | 4 542,5 |
| Étude de cas | 4 511 | 4 555 | 4 616 |

Étendue : 4 235,5 à 4 641, soit 9 % d'écart entre la passe la plus lente et la
plus rapide. Aucune passe aberrante. La plus basse (accueil, passe 1) est à 7 %
sous la médiane et son score (90) est identique à celui de la passe 2, prise à
4 559 : l'écart de la machine n'a pas déplacé de score.

## 2. Résultats par page

Scores sur 100. « Médiane (étendue) » sur les trois passes. Les métriques sont
celles de la passe médiane.

### Accueil, `/` (passe médiane : 2)

| Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|
| **90** (90 à 99) | 96 (96 à 96) | 100 (100 à 100) | 69 (69 à 69) |

| LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|
| 3,5 s (3 546 ms) | 1,1 s (1 133 ms) | 0 ms | 0 | 1,2 s (1 224 ms) |

Élément LCP : le paragraphe d'ouverture « En tant que responsable maintenance,
trouver un prestataire réellement qualifié… » (`section > div.mg-r2 > div > p`,
`components/site/accueil/Hero.tsx`, ligne 101). Décomposition Lighthouse : TTFB
621 ms, retard de rendu 2 925 ms. Même élément sur les trois passes.

La passe 3 sort à 99 (LCP 2,05 s) avec exactement les mêmes octets demandés que
les passes 1 et 2 (1 855 Kio avant le premier affichage observé) et un indice
machine normal (4 569,5). C'est une instabilité de la simulation sur cette page,
pas de la machine ; la médiane l'écarte.

### Offre, `/offres/residence/` (passe médiane : 1)

| Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|
| **98** (98 à 98) | 96 (96 à 96) | 100 (100 à 100) | 69 (69 à 69) |

| LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|
| 2,4 s (2 424 ms) | 1,2 s (1 224 ms) | 0 ms | 0 | 1,2 s (1 224 ms) |

Élément LCP : **le texte du bandeau de consentement**, « Nous déposons des
traceurs pour mesurer l'audience du site… »
(`body > dialog.Bandeau-module__…__bandeau > p.Bandeau-module__…__texte`,
`components/consentement/Bandeau.tsx`). Même élément sur les trois passes.
Décomposition : TTFB 624 ms, retard de rendu 1 800 ms.

### Ville, `/implantations/lyon/` (passe médiane : 2)

| Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|
| **98** (98 à 98) | 96 (96 à 96) | 100 (100 à 100) | 69 (69 à 69) |

| LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|
| 2,4 s (2 422 ms) | 1,2 s (1 222 ms) | 0 ms | 0 | 1,2 s (1 222 ms) |

Élément LCP : le paragraphe d'ouverture « Entre les procédés continus de la
vallée de la chimie, au sud, et les ateliers… » (`section > div.mg-r2 > div > p`,
gabarit `components/site/implantation/PageVille.tsx`). Même élément sur les trois
passes. Décomposition : TTFB 622 ms, retard de rendu 1 800 ms.

### Domaine, `/expertises/hydraulique/` (passe médiane : 3)

| Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|
| **98** (98 à 98) | 96 (96 à 96) | 100 (100 à 100) | 69 (69 à 69) |

| LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|
| 2,3 s (2 274 ms) | 1,1 s (1 074 ms) | 0 ms | 0 | 1,1 s (1 074 ms) |

Élément LCP : **le texte du bandeau de consentement**, le même qu'en page Offre.
Même élément sur les trois passes. Décomposition : TTFB 624 ms, retard de rendu
1 650 ms.

### Étude de cas, `/preuves/danone-lignes-de-production/` (passe médiane : 2)

| Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|
| **100** (100 à 100) | 96 (96 à 96) | 100 (100 à 100) | 69 (69 à 69) |

| LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|
| 1,8 s (1 750 ms) | 1,1 s (1 075 ms) | 0 ms | 0 | 1,1 s (1 075 ms) |

Élément LCP : le paragraphe d'ouverture « À Steenvoorde (Nord), l'usine Blédina
du groupe Danone produit les laits infantiles… » (`section > div.mg-r2 > div > p`,
`components/site/preuve/PagePreuve.tsx`). Même élément sur les trois passes.
Décomposition : TTFB 625 ms, retard de rendu 1 125 ms.

### Le bandeau de consentement est-il l'élément LCP ?

Oui sur deux pages sur cinq : **Offre** et **Domaine**, sur chacune des trois
passes. Sur ces deux pages, le texte du bandeau est plus grand, à 412 px de
large, que le paragraphe d'ouverture. Le bandeau ne s'affiche qu'après
l'hydratation (`visible = pret && …` dans `Bandeau.tsx`), donc le LCP de ces
pages attend le JavaScript. Mesuré, cela ne les pénalise pas : 2,27 et 2,42 s,
contre 2,42 s pour la page Ville dont le LCP est un texte servi dans le HTML.
Il ne décale rien non plus : CLS à 0 sur les quinze passes.

Sur l'accueil, la ville et l'étude de cas, le bandeau est affiché mais le
paragraphe d'ouverture est plus grand.

## 3. Les cinq plus grosses opportunités de performance, par page

Valeurs de la passe médiane. « ms » est le gain estimé par Lighthouse sur le
FCP ou le LCP (le plus grand des deux, champ `metricSavings`) ; « Kio » est le
poids économisable (`overallSavingsBytes`). Les deux sont des estimations de la
simulation, pas des mesures de terrain.

### Accueil

| # | Opportunité | ms | Kio | Ressources en cause |
|---|---|---|---|---|
| 1 | JavaScript inutilisé | 150 | 26 | `0mhbs1jhy7500.js` (cadre React et routeur Next) |
| 2 | JavaScript ancien (polyfills) | 150 | 14 | même fichier : `Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, `Object.hasOwn`, `trimStart`, `trimEnd` |
| 3 | CSS inutilisée | 150 | 10 | `0zxx8cye67kg7.css` |
| 4 | Formats d'image modernes | 0 | 766 | `env-technician-maintenance-13.jpg` 280, `ph-hero-raffinerie.jpg` 188, `sv-convoyeur.jpg` 129, `logo-migen-white.png` 108, `x-textile-filature.jpg` 33, `x-logistique-cariste.jpg` 29 |
| 5 | Images mal dimensionnées | 0 | 411 | `sv-convoyeur.jpg` 228, `logo-migen-white.png` 143, `ecovadis.webp` 21, `mase.png` 19 |

Suivantes : encodage des images, 26 Kio (`env-technician-maintenance-13.jpg`).
La passe 1 signalait en plus « Différer les images hors écran », 366 Kio
(`sv-convoyeur.jpg` 223, `logo-migen-white.png` 143) ; les passes 2 et 3 non.
Diagnostics hors opportunités : 1 599 éléments dans le DOM (avertissement), et
3 images sans dimensions déclarées (`logo-migen-white.png` dans
`GrilleOffres.tsx`, `mase.png` et `ecovadis.webp` dans `CertificationsRse.tsx`),
sans effet mesuré sur le CLS (0).

### Offre

| # | Opportunité | ms | Kio | Ressources en cause |
|---|---|---|---|---|
| 1 | JavaScript inutilisé | 150 | 26 | `0mhbs1jhy7500.js` |
| 2 | CSS inutilisée | 150 | 11 | `0zxx8cye67kg7.css` |
| 3 | Ressources qui bloquent le rendu | 100 | non applicable (gain en temps) | `3makipjxcyyo1.css` et `0zxx8cye67kg7.css`, 150 ms chacune |
| 4 | Formats d'image modernes | 0 | 237 | `sv-convoyeur.jpg` 129, `logo-migen-white.png` 108 |
| 5 | JavaScript ancien (polyfills) | 0 | 14 | `0mhbs1jhy7500.js` |

Le nouvel indicateur de Lighthouse 12 sur le même sujet
(`render-blocking-insight`) estime le blocage du rendu à 240 ms.

### Ville

| # | Opportunité | ms | Kio | Ressources en cause |
|---|---|---|---|---|
| 1 | JavaScript inutilisé | 150 | 25 | `0mhbs1jhy7500.js` |
| 2 | JavaScript ancien (polyfills) | 150 | 14 | `0mhbs1jhy7500.js` |
| 3 | CSS inutilisée | 150 | 11 | `0zxx8cye67kg7.css` |
| 4 | Ressources qui bloquent le rendu | 100 | non applicable (gain en temps) | `0zxx8cye67kg7.css` et `3makipjxcyyo1.css`, 150 ms chacune |
| 5 | Formats d'image modernes | 0 | 261 | `sv-convoyeur.jpg` 129, `logo-migen-white.png` 108, `faq-offre.jpg` 24 |

`render-blocking-insight` : 240 ms.

### Domaine

Lighthouse ne chiffre que quatre opportunités non nulles sur la passe médiane ;
la cinquième ligne vient de l'indicateur `render-blocking-insight`.

| # | Opportunité | ms | Kio | Ressources en cause |
|---|---|---|---|---|
| 1 | JavaScript inutilisé | 150 | 26 | `0mhbs1jhy7500.js` |
| 2 | Formats d'image modernes | 0 | 237 | `sv-convoyeur.jpg` 129, `logo-migen-white.png` 108 |
| 3 | JavaScript ancien (polyfills) | 0 | 14 | `0mhbs1jhy7500.js` |
| 4 | CSS inutilisée | 0 | 11 | `0zxx8cye67kg7.css` |
| 5 | Blocage du rendu (indicateur) | 110 | non applicable (gain en temps) | les trois feuilles de style du document |

### Étude de cas

Quatre opportunités non nulles sur la passe médiane ; la cinquième ligne vient
de l'indicateur `image-delivery-insight`.

| # | Opportunité | ms | Kio | Ressources en cause |
|---|---|---|---|---|
| 1 | CSS inutilisée | 100 | 11 | `0zxx8cye67kg7.css` |
| 2 | Formats d'image modernes | 0 | 237 | `sv-convoyeur.jpg` 129, `logo-migen-white.png` 108 |
| 3 | JavaScript inutilisé | 0 | 26 | `0mhbs1jhy7500.js` |
| 4 | JavaScript ancien (polyfills) | 0 | 14 | `0mhbs1jhy7500.js` |
| 5 | Livraison des images (indicateur) | 0 | 5 | compression d'un logo client servi par `/_next/image` |

### Poids des pages (passe médiane)

| Page | Total | Images | JavaScript | CSS | Polices | Requêtes | Requêtes tierces |
|---|---|---|---|---|---|---|---|
| Accueil | 1 917 Kio | 1 563 Kio | 193 Kio | 20 Kio | 48 Kio | 41 | 0 |
| Offre | 870 Kio | 506 Kio | 217 Kio | 21 Kio | 48 Kio | 42 | 0 |
| Ville | 941 Kio | 575 Kio | 218 Kio | 21 Kio | 48 Kio | 43 | 0 |
| Domaine | 869 Kio | 506 Kio | 217 Kio | 21 Kio | 48 Kio | 42 | 0 |
| Étude de cas | 860 Kio | 509 Kio | 217 Kio | 21 Kio | 48 Kio | 37 | 0 |

## 4. Accessibilité : tous les audits en échec

Un seul audit échoue, sur les cinq pages et les quinze passes :
**`color-contrast`** (contraste insuffisant entre le texte et son fond). Le
nombre d'éléments est identique d'une passe à l'autre.

| Page | Éléments en échec |
|---|---|
| Accueil | 77 |
| Offre | 78 |
| Ville | 80 |
| Domaine | 72 |
| Étude de cas | 79 |

Aucun autre audit d'accessibilité n'est en échec. Détail des couleurs en cause,
regroupées, avec le composant qui les porte :

| Couleur du texte sur fond | Rapport mesuré | Éléments par page | Où |
|---|---|---|---|
| `#7b7b7a` sur `#141312` | 4,37 | 34 sur chaque page | pied de page, liens du maillage (villes, départements, secteurs) : `.lienMaillage`, blanc à 44 %, `PiedDePage.module.css` ligne 73 |
| `#646363` sur `#141312` | 3,09 | 5 sur chaque page | pied de page, mention légale et liens bas : blanc à 34 %, `PiedDePage.module.css` lignes 101 et 117, `PiedDePage.tsx` ligne 216 |
| `#5f5f5e` sur `#141312` | 2,90 | 4 sur chaque page | pied de page, titres « Villes », « Départements », « Secteurs », « Habilitations » : blanc à 32 %, `PiedDePage.tsx` ligne 201 |
| `#727171` sur `#141312` | 3,81 | 3 sur chaque page | pied de page, titres de colonne « Offres », « Expertises », « Migen© » : blanc à 40 %, `PiedDePage.tsx` ligne 193 |
| `#ffffff` sur `#ff7c3c` | 2,56 | 3 (accueil) à 11 (offre, ville) | boutons orange : « Décrire mon besoin » de l'en-tête (`Entete.module.css`, `.ctaPanneau`), bouton principal des gabarits Offre et Preuve, bouton d'envoi du formulaire, appel du pied de page (`.appelSite`), pastilles numérotées de l'étude de cas |
| `#ff7c3c` sur fonds clairs (`#f1f2f4`, `#fafafb`, `#ffffff`, `#fbece6`, `#faece6`, `#f3e5e0`, `#fff0ea`) | 2,08 à 2,56 | 15 (domaine) à 24 (accueil) | sur-titres et numéros en orange de marque (`--acc`) : « Par où commencer », « Ils nous font confiance », « Certifications », « Rappel dans l'heure », « Notre méthode », numéros 01 à 06 |
| `#a8a49d` sur `#f1f2f4` ou `#fafafb` | 2,21 à 2,37 | 4 (accueil), 6 (étude de cas) | jeton `--ink4` : seconde moitié du h1 de l'accueil « sans rupture de production. » et libellés des chiffres (`Hero.tsx`), étiquettes de la fiche flottante de l'étude de cas (`PagePreuve`) |
| `#737373` sur `#f1f2f4` | 4,23 | 1 (offre, ville, domaine) | jeton `--ink3` : « Nous vous rappelons dans l'heure… » |
| `#828281` sur `#1c1b19` | 4,47 | 1 (offre, ville, domaine) | « 4 agences : Lyon (siège)… », `components/site/offre/Reassurance.tsx` ligne 231 |

Le seuil attendu est 4,5:1 pour le texte courant et 3:1 pour le grand texte.

Le pied de page seul pèse **46 éléments sur chaque page**, soit 58 à 64 % des
échecs. Toutes ces couleurs viennent de la charte et de la maquette (l'orange
de marque, les blancs translucides du pied de page sombre, les gris `--ink3` et
`--ink4`) : les corriger est une décision de design à prendre avec Mehdi, pas
une erreur de code.

## 5. SEO et bonnes pratiques : audits en échec

**SEO, 69 sur les cinq pages** : un seul audit en échec, `is-crawlable`
(1 élément). Cause mesurée : `robots.txt` sert `User-Agent: *` puis
`Disallow: /`. C'est voulu : `app/robots.ts` ferme l'indexation tant que
`SITE_INDEXABLE=oui` n'est pas posé, pour que l'adresse `vercel.app` ne
concurrence pas migen.fr. Tous les autres audits SEO passent.

**Bonnes pratiques, 100 sur les cinq pages** : aucun audit en échec.

## 6. Synthèse

### Ce qui pèse le plus

**1. Sur l'accueil : 1,5 Mio d'images brutes demandées avant le premier
affichage.** C'est la seule page sous 98. Avant le premier affichage observé,
l'accueil a déjà lancé 1 549 Kio d'images, contre 26 à 95 Kio sur les quatre
autres pages ; le JavaScript et la CSS sont les mêmes. En mode simulé,
Lighthouse rejoue ces téléchargements sur un réseau mobile lent avant de
compter l'affichage du paragraphe d'ouverture, d'où un LCP de 3,5 s porté à
2,9 s par le « retard de rendu ». Ces images sont servies telles quelles depuis
`public/assets/`, sans passer par `next/image` (pas de WebP ni AVIF, pas de
taille adaptée à l'écran, pas de chargement différé) :

| Image | Poids transféré | Composant |
|---|---|---|
| `env-technician-maintenance-13.jpg` | 448 Kio | `accueil/BentoBesoins.tsx` ligne 430 (fond CSS en style en ligne, chemin dans `bento-besoins-donnees.ts`) |
| `ph-hero-raffinerie.jpg` | 361 Kio | `accueil/AvantApresBascule.tsx` (tuile photo, chemin dans `avant-apres-donnees.ts`) |
| `sv-convoyeur.jpg` | 288 Kio | `accueil/FocusResidence.tsx` ligne 107 (`<img>` brut) |
| `logo-migen-white.png` | 144 Kio | `accueil/GrilleOffres.tsx` ligne 212 (`<img>` brut, affiché à 20 px de haut) |
| `x-textile-filature.jpg` | 143 Kio | `accueil/AvantApresBascule.tsx` |
| `x-logistique-cariste.jpg` | 102 Kio | `accueil/AvantApresBascule.tsx` |
| `ecovadis.webp`, `mase.png` | 22 et 20 Kio | `accueil/CertificationsRse.tsx` lignes 98 et 103 (`<img>` bruts) |

**2. Sur toutes les autres pages : 474 Kio d'images de l'accueil téléchargées
pour rien.** Sur l'offre, la ville, le domaine et l'étude de cas, quatre images
de l'accueil arrivent à chaque visite : `sv-convoyeur.jpg` (288 Kio),
`logo-migen-white.png` (144 Kio), `ecovadis.webp` (22 Kio), `mase.png`
(20 Kio). C'est 82 à 94 % du poids des images de ces pages et 50 à 55 % de
leur poids total. Le mécanisme est mesuré, pas supposé :

- le logo de l'en-tête est un lien vers `/` (`Entete.tsx` ligne 147), que le
  routeur de Next précharge sur chaque page (requêtes `/?_rsc=` relevées sur les
  quinze passes) ;
- la charge RSC de `/` porte quatre indications de préchargement d'image,
  relevées à la commande
  `curl -s -H "RSC: 1" https://migen-site.vercel.app/ | grep -o ':HL\[[^]]*"image"'` :
  exactement ces quatre fichiers ;
- l'initiateur de ces quatre requêtes, relevé dans Chrome, est la fonction de
  préchargement de React appelée par le préchargement du routeur ;
- ce sont les quatre `<img>` bruts, sans `loading="lazy"`, des composants
  serveur de l'accueil (`FocusResidence`, `GrilleOffres`, `CertificationsRse`).
  Les photos des composants client de l'accueil (`BentoBesoins`,
  `AvantApresBascule`) n'y figurent pas.

Lighthouse ne le classe pas comme une opportunité à part : il n'en voit que la
partie « formats modernes » (237 Kio), parce que ces images n'appartiennent pas
à la page mesurée.

**3. Le socle commun, sur les cinq pages.**
- Deux feuilles de style bloquent le premier rendu : `3makipjxcyyo1.css`
  (19 `@font-face` de Poppins et de son repli, Tailwind, styles de l'en-tête, du
  pied de page et du consentement) et `0zxx8cye67kg7.css` (feuille partagée qui
  embarque les modules de nombreux gabarits : `PageImplantations`,
  `PageEditoriale`, `FicheMetier`, `HubCarriere`, `PagePreuve`, `PageOffre` et
  d'autres). Estimation : 100 ms sur l'offre et la ville, 240 ms selon
  l'indicateur `render-blocking-insight` ; 10 à 11 Kio de règles inutilisées
  sur chaque page, dans la seconde feuille.
- Le fichier `0mhbs1jhy7500.js` (React DOM et routeur de Next) : 25 à 26 Kio
  inutilisés et 14 Kio de polyfills pour des fonctions que tout navigateur
  récent possède.
- L'accueil compte 1 599 éléments dans le DOM, contre 471 à 936 ailleurs.

**4. Ce qui ne pèse pas.** TBT à 0 ms, CLS à 0, polices en `swap` sans
avertissement, cache correct, aucune requête tierce. Quatre pages sur cinq sont
à 98 ou 100.

### Hors de notre main

- **Scripts tiers : rien de mesuré, et c'est attendu.** Aucune requête vers un
  autre domaine sur les quinze passes : `components/consentement/Tags.tsx` ne
  charge rien tant que la finalité n'est pas accordée, et Lighthouse arrive
  sans consentement. Le coût de `gtag.js` (GA4 et Google Ads), de LinkedIn
  Insight, du traceur HubSpot et du pixel OpenAI chez un visiteur qui clique
  « Tout accepter » est **non calculable** ici : Lighthouse ne clique pas le
  bandeau, et le contourner fausserait ce que voit un premier visiteur.
- **Le TTFB d'environ 620 ms** de chaque décomposition du LCP est celui du
  modèle de réseau simulé (RTT de 150 ms), pas une lenteur du serveur : le
  document observé arrive en 127 à 267 ms selon la passe (médiane 150 ms), servi depuis le cache de Vercel
  (`x-vercel-cache: HIT`).
- **Le JavaScript du cadre** (`0mhbs1jhy7500.js`) et ses polyfills sont
  fournis par Next et React ; la marge de manœuvre côté site est faible.
- **Le bandeau de consentement** est l'élément LCP de deux pages, et il est
  obligatoire. Mesuré, il ne dégrade ni le LCP ni le CLS (section 2).

### Données non calculables, et pourquoi

- **INP** : non calculable, une mesure de laboratoire sans interaction ne le
  produit pas.
- **Données de terrain (CrUX)** : non calculables ici, Lighthouse en ligne de
  commande ne les interroge pas et aucune requête CrUX n'a été faite pour ce
  rapport.
- **Effet des scripts tiers après consentement** : non calculable, voir
  ci-dessus.

Le code cité a été lu dans la branche `perimetre-photos-registre` au commit
`923af58` ; les numéros de ligne peuvent différer de quelques unités du
déploiement mesuré, les comportements cités ont, eux, été relevés en
production.
