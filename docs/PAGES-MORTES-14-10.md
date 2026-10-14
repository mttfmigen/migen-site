# Pages mortes, relevé du 14/10

Demande de Mehdi : « vérifie les pages mortes de la nouvelle maquette ».

Mesuré sur le build de production servi en local (`next start -p 5604`), pas
sur la préproduction, qui est derrière le contrôle anti-robots de Vercel.
Premier passage sur `cad2445`, second après rebase sur `18ff581` (le nouveau
menu Ressources) avec la correction de ce lot : les chiffres ci-dessous sont
ceux du second passage, sauf mention.

## En une phrase

**Aucun lien interne mort, aucune image morte, aucune redirection en chaîne.**
Un vrai défaut trouvé et corrigé : le bouton « Être rappelé » des deux guides,
sur téléphone, menait à une ancre absente. Le reste du relevé : des liens vers
les rubriques « en pause » (tous en 200, plus aucun dans un menu), 14 pages que
seul le plan du site cite, et trois adresses du colis que le site ne sert pas.
Tout cela est listé pour arbitrage.

## 1. Le parcours

Comment : un navigateur (Playwright) ouvre chaque page, attend l'hydratation,
et relève chaque lien, chaque image (`src`, `srcset`, `<source>`, images de
fond en style, `og:image`, icônes) et chaque identifiant d'ancre. Départs :
l'accueil, `/plan-du-site/` et les 272 adresses de `sitemap.xml` ; chaque lien
interne rencontré est suivi à son tour. Chaque cible est ensuite appelée sans
suivre les redirections, saut par saut, pour voir les chaînes. Fait deux fois,
à 1280 px et à 390 px (le tiroir et la couche de conversion mobile).

| Mesure | 1280 px | 390 px |
|---|---|---|
| Pages parcourues (toutes en 200) | 273 | 273 |
| Cibles internes distinctes | 273 | 273 |
| Liens en 404 ou 500 | 0 | 0 |
| Liens qui passent par une redirection | 0 | 0 |
| Adresses d'images distinctes (dont `/_next/image`) | 6 634, toutes en 200 | 6 634, toutes en 200 |
| Ancres sans cible, avant la correction (`cad2445`) | 3 | 3 |
| Ancres sans cible, après | 1 (faux positif) | 1 (faux positif) |

Les 273 pages : les 272 du plan, plus `/diagnostic-zero-arret/`, atteinte par
le menu et le pied de page, volontairement hors plan.

**Ce qu'un parcours ne voit pas** : le panneau du menu du bureau ne s'écrit dans
la page qu'à l'ouverture. Pour le couvrir, les 491 chemins internes écrits en
dur dans `app/`, `components/` et `lib/` ont été appelés un par un, puis, après
rebase, ceux de `entete-donnees.ts`, `megamenu/`, du tiroir, de l'en-tête, du
pied de page et de la barre d'action mobile. Tous les liens des menus répondent
200. Les seuls 404 et 3xx de
la liste sont des chemins de test (`/page-inventee/`, `/n-existe-pas-pied-de-page/`),
des sources de redirection de l'ancien WordPress, ou des chemins cités en
commentaire ou servant de clé (`chemin="/a-propos/rse/"` d'`AvecConversionMobile`
est une clé de données, pas un lien).

### Les trois ancres sans cible

| Page | Lien | Verdict |
|---|---|---|
| `/guides/choisir-une-entreprise-de-maintenance/` | « Être rappelé » → `#etre-rappele` | **Corrigé.** |
| `/guides/reussir-un-transfert-industriel/` | « Être rappelé » → `#etre-rappele` | **Corrigé.** |
| `/ressources/` | « Voir les six étapes ↓ » → `#rs-process` | Faux positif, rien à faire. |

**Les guides.** Le bandeau mobile « Un technicien pour appliquer cette
méthode ? » (couche de conversion, `BandeauRappelMobile`) vise toujours
`#etre-rappele`. `Guide.tsx` ne pose pas le rappel final
(`rappelFinal={false}`) parce que son formulaire `#cx-form` en tient lieu, mais
il ne posait pas non plus l'ancre : le bouton ne menait nulle part. Corrigé à la
source comme les autres gabarits qui font le même choix (accueil, Équipe, Nous
connaître, secteurs, offres) : `<div id={ID_RAPPEL_FINAL} />` juste avant
`#cx-form`. Aucun texte ajouté ni retiré.

**Le hub `/ressources/`.** Le lien est dans la carte « Pour bien démarrer » de
l'espace Techniciens. Dans l'espace Entreprises (celui servi par défaut), cette
carte est masquée (`hidden`) et le bloc `#rs-process` n'est pas rendu ; dès
qu'on passe dans l'espace Techniciens, les deux apparaissent ensemble et le
lien fonctionne. Le hub est hors de ce lot, il n'est pas touché.

## 2. Les liens vers les pages « en pause »

Les quatre rubriques de l'ancienne maquette que la nouvelle ne montre plus :
`/ressources/fiches-pratiques/`, `/ressources/fiches-techniques/`,
`/ressources/livres-blancs/`, `/ressources/process/`, et leurs 20 fiches. Les 24
pages répondent 200, sont dans `sitemap.xml`, et sont aussi dans le colis
(`routes.csv`). Aucune n'est supprimée, aucune redirection n'est changée.

Qui y mène encore :

| D'où | Liens | Décision |
|---|---|---|
| Menu Ressources du bureau et tiroir mobile | aucun depuis `18ff581` (lot menu Ressources). Sur `cad2445`, le panneau menait aux 4 rubriques plus « Ma ligne s'arrête souvent » et « Je prépare un arrêt », et le tiroir aux 4 rubriques sur 248 pages | Réglé par l'autre lot, pas touché ici |
| Pied de page | aucun | |
| `/plan-du-site/` | les 24 pages en pause | Laissé : le plan HTML et `sitemap.xml` lisent la même liste (`lib/pages-publiees.ts`), une porte tient leur égalité |
| `/ressources/articles/` (sous-rubriques et bloc « Dans la même rubrique ») | les 4 rubriques | À arbitrer par Mehdi |
| `/ressources/articles/organiser-service-maintenance/` (corps) | `fiches-techniques/indicateurs-maintenance/`, `fiches-techniques/mtbf-mttr/` | À arbitrer |
| `/ressources/articles/suivi-de-la-maintenance/` (corps) | `fiches-techniques/indicateurs-maintenance/` | À arbitrer |
| `/ressources/articles/optimiser-la-maintenance/` (corps) | `fiches-techniques/mtbf-mttr/`, `fiches-techniques/trs/` | À arbitrer |
| `/ressources/articles/digitalisation-maintenance/` (corps) | `livres-blancs/externaliser-sa-maintenance/` | À arbitrer |

Aucun de ces liens n'est cassé : la cible répond, avec son texte. Les retirer
couperait le maillage vers des pages qui portent du référencement ; les garder
envoie le lecteur vers un format que le hub grise sous « Bientôt ». C'est un
choix éditorial, pas une réparation : non tranché ici.

### Pages que seul le plan du site cite (14)

Pas mortes (200, dans `sitemap.xml`), mais aucune autre page du site ne mène à
elles :

- `/offres/chantier/` et `/offres/construction/` ;
- les 12 billets de l'ancien blog republiés le 14/10 (liste au point 3).

Les deux guides, eux, sortent du menu avec `18ff581` mais restent cités par
`/entreprise-maintenance-industrielle/`, par
`/travaux-industriels/transfert-industriel/` et l'un par l'autre.

## 3. Le site contre le colis

Colis : `design_handoff_migen_site/routes.csv`, 262 lignes, dont 259 adresses
et 3 modules sans adresse.

### Dans le colis, absentes du site

| Adresse du colis | Sur le site | Note |
|---|---|---|
| `/a-propos/nous-connaitre/` | 404 | Le site sert `/nous-connaitre/` (200) |
| `/a-propos/valeurs/` | 404 | Le site sert `/valeurs/` (200) |
| `/a-propos/rse/` | 404 | Le site sert `/rse/` (200) |
| `/realisations/` | 301 → `/preuves/` | Voulu, aucun écart |
| module Diagnostic Zéro arrêt | `/diagnostic-zero-arret/` (200) | Hors plan, voulu |
| module Test technicien | `/test-technicien/` (200) | |
| landing pages (non référencées) | `/lp/` répond 404 | Rien ne la cite sur le site |

**Les trois `/a-propos/…` en 404.** Aucun lien du site ne les vise
(`entete-donnees.ts` le note déjà) : ce n'est pas un lien mort aujourd'hui.
Mais ce sont les adresses que le colis donne à ces pages ; si l'une d'elles est
partagée ou reprise d'après le colis, elle tombe en 404. Proposition, non
appliquée puisque ce lot ne touche à aucune redirection : trois 301 vers
`/nous-connaitre/`, `/valeurs/` et `/rse/`, ou le choix inverse (servir les
adresses du colis). À trancher par Mehdi.

### Sur le site, absentes du colis (18)

- `/cgv/`, `/nous-connaitre/`, `/valeurs/`, `/rse/` (les trois dernières sont
  les `/a-propos/…` du colis, à une autre adresse) ;
- `/diagnostic-zero-arret/`, `/test-technicien/` (les modules du colis) ;
- les 12 billets de l'ancien blog republiés le 14/10 (commit `dac01e5`) :
  sous `/ressources/articles/` : `bien-etre-au-travail/`,
  `certifications-mase-ecovadis/`, `digitalisation-des-manuels/`,
  `femmes-dans-l-industrie/`, `guide-maintenance-industrielle/`,
  `interview-nathan-jorez/`, `machines-goulots/`, `partenariat-dimomaint/`,
  `pourquoi-externaliser/`, `qualites-du-mainteneur/`, `reindustrialisation/`,
  `savoye-dimomaint/`.

Toutes répondent 200 et, sauf `/diagnostic-zero-arret/`, sont dans le plan.

## 4. Ce qui a changé dans le code

- `components/site/editorial/Guide.tsx` : l'ancre `#etre-rappele` posée avant
  le formulaire `#cx-form`. Seul changement de ce lot.

## 5. Vérifications avant envoi

- `bunx tsc --noEmit` et `bun run build` verts ; `eslint` vert sur `Guide.tsx`.
- `node scripts/verifie-interdits.mjs` : copie conforme.
- `verification-conversion-mobile.tsx` : vert. `verification-editorial.tsx` :
  8 pages en écart avec leur capture, exactement les mêmes avant et après la
  correction (mesuré en remettant `Guide.tsx` d'origine) : écart déjà présent,
  sans lien avec ce lot.
- Navigateur local à 390 px, sur les deux guides : le bouton « Être rappelé »
  du bandeau est visible, le clic pose `#etre-rappele` dans l'adresse et amène
  le formulaire en haut de l'écran. À 1280 px l'ancre fait 0 px de haut : le
  bureau ne bouge pas.
- `node scripts/verifie-redirections.mjs http://localhost:5604` :
  REDIRECTIONS_SANS_PERTE.
- Texte du `<main>` à 1280 px contre la production : aucune perte sur les
  guides. Deux pertes viennent de commits déjà sur la branche, pas de ce lot :
  `/plan-du-site/` (les compteurs « 260 » et « 41 » changent avec les 12 billets
  republiés) et `/ressources/` (libellés du formulaire du hub, repris par le
  lot Ressources).

## Pour refaire la mesure

Le script de parcours a tourné hors du dépôt (il s'appuie sur Playwright, déjà
installé). La porte versionnée la plus proche reste
`node scripts/verifie-liens.mjs` (120 pages au plus, sans ancres ni images).
