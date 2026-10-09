# Relais du 08/10 (après-midi) : où en est le site, ce qui reste

À lire avant toute reprise, avec `design_handoff_migen_site/README.md` (source de
vérité du client) et `CLAUDE.md`. Mehdi communique en français, jamais « Lovable »,
jamais de tiret cadratin dans un texte visible.

## Où vit quoi

- Dépôt : `~/Landing lovable/migen-site`, branche `phase-2-gabarits`, GitHub
  `mttfmigen/migen-site`. Vercel n'est PAS relié au dépôt : un push ne déploie rien.
- Mise en ligne : `bunx vercel@62.7.0 deploy --prod --yes --archive=tgz` depuis le
  dépôt (la version « latest » du cache bunx est cassée). Site :
  https://migen-site.vercel.app. Avant : `bunx tsc --noEmit` (un script de `scripts/`
  en erreur de type fait échouer la construction Vercel).
- Le contenu servi vient des fiches `supabase/import/gabarits-maquette/*.json`, qui
  gagnent toujours sur la base (`lib/contenu.ts`, `pageParChemin` et `filAriane`).
  Le serveur de dev (port 4340) ne les relit qu'après `node scripts/relis-relais.mjs`.
- Maquette de référence : `maquette/site-final-autonome.html` servie sur le port 4352
  (`scripts/sers-maquette.sh`), captures figées `maquette/rendu/<cle>.html/.json`.

## Outils de mesure (tous dans `scripts/`)

| Outil | Ce qu'il dit |
|---|---|
| `SORTIE=… HAUTEUR=2400 [LARGEUR=390] node scripts/diff-visuel-offre.mjs <url>` | % de pixels divergents par section, montages maquette/site |
| `node scripts/diff-styles.mjs <url>` | styles calculés de chaque texte, valeur maquette \| valeur site |
| `node scripts/verifie-position-titre.mjs ["<gabarit>" \| urls]` | hauteur du H1 contre la maquette, à ±2 px |
| `SITE_URL=https://migen-site.vercel.app node scripts/diff-visuel-offre.mjs <url>` | même mesure, sur la version en ligne |
| `node scripts/relis-relais.mjs` | fait relire les fiches au serveur de dev |
| `bun lib/verification-decisions-copie.ts` | règles de copie décidées par Mehdi |
| `node scripts/verifie-interdits.mjs` | interdits du contrat dans le code ET les 246 fiches |
| `node scripts/verifie-phrases-estropiees.mjs [--controle]` | phrases tronquées par un retrait, sur le rendu des 248 pages |

## Décisions de Mehdi du 08/10 (toutes appliquées ou en cours)

- « 10 % des techniciens », jamais « candidats » pour la sélection ; Limonest devient
  Écully, « siège à Lyon » reste : `lib/decisions-copie.ts` (`appliqueDecisions`,
  `copieConforme`), appliqué aux fiches, aux contrôles et aux méta-descriptions.
- Le Diagnostic Zéro arrêt est servi sous `/diagnostic-zero-arret/` (réécriture dans
  `next.config.ts` vers le projet Vercel `migen-diagnostic-zero-arret`, construit
  avec la base `/diagnostic-zero-arret/`), sans aucun prix affiché, seulement le nom
  des formules. Le test technicien public de la maquette est sur `/test-technicien/`,
  avec le formulaire standard du site (même formulaire HubSpot).
- Tous les liens du pied de page restent sur le domaine du site.
- Photos de ville : versions sous licence Envato (projet de licence « migen.fr »).
- Varier toutes les photos du site (voir plus bas).

## Fait aujourd'hui (local, en partie en ligne)

Pages Villes 74/74, Expertises 31/31, études de cas 41/41 avec photos et logos,
Secteurs 12/12 reconstruits sur la maquette, Métiers 13/13 (FAQ sur photo),
hubs de rubrique, Ressources, page Équipe à `/a-propos/equipe/`, cas clients
(`/preuves/` 41 études, `/realisations/` redirigé), décalage de 34 px sous l'en-tête
corrigé, fil d'Ariane visible retiré (gardé en données structurées), bouton des
formulaires = titre du panneau, flèche « → » dessinée comme la maquette, pied de
page aligné. Mise en ligne du 08/10 en fin d'après-midi : tout ce qui précède, plus
le nouveau bloc « Notre sélection » (248/248 adresses en 200 en ligne ; les 12 pages
Secteurs étaient encore l'ancienne version en ligne, Mehdi l'a vu).

## Ce qui tournait au moment du relais

1. Vérification finale du chantier « site au pixel » : TERMINÉE, verdict non conforme.
   46 contrôles sur 49 verts, tsc propre, 247/248 titres à la bonne hauteur. Ses défauts
   sont la section « Défauts trouvés par la vérification finale » ci-dessous.
2. Banque de photos variées : FINIE et commitée. 109 photos sous licence « migen.fr »
   dans `public/assets/photos/` (2000 px max, JPEG q82, 89 paysage, 20 portrait),
   registre `public/assets/photos/registre.json` : { fichier, lien_envato, titre (Envato),
   description (en français), orientation, themes (ceux du jury), licence, sha256 }.
   Originaux pleine résolution dans `~/Downloads`. Reste à les répartir (point 2 plus bas).
3. Nouveau bloc « Notre sélection » : FAIT et en ligne. `ProcessSelection.tsx` +
   `CarteEtapes.tsx` (défilement des étapes), contrôle
   `bun components/site/accueil/verification-selection.tsx`. Écart assumé : contenu
   de 1 120 px au lieu de 1 200 (l'export de Mehdi n'a pas `box-sizing: border-box`,
   la maquette complète si).

## Reste à faire, dans l'ordre

1. **Photos de ville** : les 18 versions sous licence sont dans `public/assets/villes/`
   (`hub-<ville>.jpg` pour les cartes de l'accueil, `ville-<ville>.jpg` pour le bloc
   « Votre hub local »). Brancher : remplacer `components/site/accueil/hubs/<ville>.jpg`
   par `hub-<ville>.jpg` ; dans les fiches `implantations-*.json`, `hubLocal.photo` =
   `/assets/villes/ville-<ville>.jpg` (Marseille et Bordeaux : `hub-*`), vider
   `hubLocal.credit` (le badge « Aperçu Envato » n'a plus lieu d'être) ; adapter la
   règle de photo de `components/site/implantation/verification-ville.tsx`. Liens et
   correspondances : `docs/PHOTOS-VILLES-ENVATO.md`.
2. **Varier les photos** : avec le registre, écrire un script de répartition
   déterministe (thème de la page, aucune photo répétée dans une page, pages sœurs
   différentes), l'appliquer aux fiches, et faire accepter aux contrôles une photo
   « de la maquette OU du registre » (plusieurs contrôles exigent aujourd'hui les octets
   de la maquette : preuve, carrière, spécialité, domaine, ville, secteurs-hub). Garder
   les vraies photos de l'équipe Migen (t-shirts « migen » : team-*, sv-*), moins répétées.
3. ~~Bloc « Notre sélection »~~ : fait, identique à 1280, 1000, 800 et 390 px.
4. **Formulaire mobile** : sous 900 px le champ « Nom » fait 37 px. Correctif dans
   `components/formulaire/FormulaireContact.module.css`, dans le `@media (max-width: 900px)` :
   `.grille > * { grid-column: 1 / -1 !important; }`, puis vérifier toutes les pages à formulaire.
5. **Outil Diagnostic** : les consignes de l'IA (fonctions Supabase `submit-audit`,
   `submit-audit-v55`, `submit-diagnostic`, projet `xlvnzrxyfflqjtdwuhza`) contiennent
   encore des prix et « sous 48h » ; l'écran les filtre (`src/lib/copie.ts`), mais il
   faut corriger les consignes. Les changements de l'outil ne sont pas commités
   (dépôt `~/Landing lovable/migen-diagnostic-zero-arret`, branche `v5.2`, et le
   worktree du déploiement dans le scratchpad de session `diag-deploy`).
6. **Méta-description vide** sur `/entreprise-maintenance-industrielle/` (sa seule
   phrase disait « 24/24 et 7/7 ») : en écrire une, ou la tirer du chapô.
7. **Suppressions refusées par les permissions** (à faire par Mehdi) :
   `git rm -f components/site/implantation/PageDepartement.tsx components/site/implantation/verification-implantation.tsx`
   et les générateurs qui écraseraient des fiches portées : `scripts/fabrique_gabarits_implantation.mjs`,
   `scripts/produit-secteurs.mjs` (et à vérifier : `produit_gabarit_offre.mjs`,
   `produit_domaines.mjs`, `produit-metier-maquette.mjs`, `produit_ressources.mjs`).
8. **Base Supabase** : la table `seo` et les contenus datent d'avant ; l'import
   (`node scripts/importe_rest.mjs`) demande la clé de service, absente de `.env.local`.
9. **`.vercelignore`** n'est pas appliqué avec `--archive` (envoi de 486 Mo) : à étudier.
10. Mettre en ligne depuis une copie propre du dernier commit (le dossier de travail
    contient souvent du travail en cours) : `git worktree add --detach <dossier> HEAD`,
    y copier `.vercel/` et `next-env.d.ts`, `bunx next typegen`, puis déployer.
    Avant chaque mise en ligne : `bunx tsc --noEmit`, les contrôles de gabarit, un
    balayage des 249 URL en 200 sur le serveur de dev, puis le déploiement, puis la
    même vérification sur https://migen-site.vercel.app.

## Défauts trouvés par la vérification finale (à traiter en premier)

1. ~~**Consentement RGPD**~~ **CAUSE NOMMÉE le 08/10, correctif de configuration restant.**
   Le 500 venait de `ecritureServeur()`, qui lève quand `SUPABASE_SERVICE_ROLE_KEY` est
   absente ; la migration 0004 réserve délibérément l'`insert` au serveur (l'insertion par
   la clé anonyme rend bien `42501 permission denied`, vérifié). La route répond désormais
   **503** avec la cause en journal, au lieu d'un 500 indistinguable d'une base qui casse
   (`app/api/consentement/route.ts`). Le choix du visiteur a toujours été respecté, il vit
   dans son cookie ; c'est la **preuve RGPD** qui n'est pas écrite. **Reste à faire, et
   c'est pour Mehdi : poser la clé de service** (console Supabase, Settings puis API) puis
   reposter sur `/api/consentement` et vérifier la ligne dans `consent_logs`. Attention aux
   clés de finalité : `mesure_audience`, `publicite`, `personnalisation`, `suivi_commercial`
   (un autre nom rend 400 « Preuve incomplète », pas 500).
2. ~~**« 24/24 et 7/7 » visible**~~ **FAIT le 08/10, et le relais se trompait sur deux points.**
   - **La mention n'était pas dans la maquette.** 0 occurrence dans les 244 captures,
     0 dans le corpus des 7 pages concernées : elle a été **injectée au portage**. Les 13
     chaînes rendues ont donc été restaurées sur leur ligne de corpus, et le chiffre clé
     « 24/24 et 7/7 » supprimé (les « Chiffres clés » du corpus de dépannage n'en déclarent
     que deux : 10 % et 4). Mesuré : **0 occurrence de 24/24, 7/7 ou 24h sur les 248 pages**.
   - **La virgule initiale n'est pas toujours un défaut**, et c'est le piège. 170 champs
     `texte` commencent par une virgule parce qu'ils suivent une `accroche` sœur rendue en
     ligne : ils sont **corrects**. Et les 7 paragraphes de `/expertises/` ouverts par une
     virgule sont **dans la maquette, mot pour mot** (son motif titre-puis-suite) : le site
     la reproduit, c'est conforme. Ne pas les « corriger ».
   - Le vrai défaut était ailleurs, et plus large : la **mention** se rend SEULE, dans son
     propre paragraphe, 4 fois par page. 4 mentions étaient estropiées (construction,
     audit-conseil, chantier, retrofit) et **20 champs avaient perdu le 04 78 33 72 05**
     en gardant sa ponctuation (« Pour nous joindre : , du lundi… »). Tout est restauré,
     17 des 20 redonnant la ligne de corpus à la lettre.
   - **ARBITRAGE OUVERT POUR MEHDI** : la maquette porte elle-même ce trou du téléphone,
     elle perd le numéro que son propre corpus écrit (`implantations--toulouse--gironde.md`
     l.13). Le site s'en écarte donc **en connaissance de cause**. Si la maquette fait foi
     jusque-là, il faut retirer les 20 numéros et l'en-tête de
     `scripts/verifie-phrases-estropiees.mjs` dit où.
   - **Les deux adresses ne sont PAS à passer en 301** : `/offres/depannage-industriel/` et
     `/offres/construction/` sont bien des pages de `index.json`, avec leur h1 et leur
     fichier de corpus. `remapOffer` est le raccourci du routeur de démonstration, qui les
     détourne vers `/offres/zero-arret/` et `/travaux-industriels/` ; c'est pour cela
     qu'elles n'ont **pas de capture** et qu'aucun diff visuel ne peut les mesurer. Les
     garder en 200 respecte « aucune page perdue » et « un mot clé principal par page ».
   - **Deux portes neuves, chacune ayant prouvé qu'elle échoue** :
     `scripts/verifie-interdits.mjs` ne lisait que le code, jamais les fiches, là où vit la
     copie : il annonçait « copie conforme » pendant que la mention était visible sur 8
     pages. Il lit désormais les 246 fiches (4/4 contrôles). Et
     `scripts/verifie-phrases-estropiees.mjs` lit le **rendu** des 248 pages, parce que le
     défaut naît de l'assemblage de deux champs (5/5 contrôles, échec prouvé de bout en
     bout en réinjectant le défaut réel).
3. ~~**`/bureau-etudes/`**~~ **CE N'ÉTAIT PAS UN DÉFAUT DU SITE, mesure faussée.**
   `/bureau-etudes/` fait partie des six adresses que le routeur de la maquette détourne
   (`remapOffer` l'envoie sur `/offres/bureau-etudes/`). `diff-visuel-offre.mjs` suivait la
   redirection sans le dire et comparait donc le site à une **autre page** : d'où le panneau
   sombre vu « dans la maquette », les 69 % et les 22 %. Les deux pages partagent même leur
   h1, ce qui rendait le détournement invisible.
   Vérifié : la capture figée `maquette/rendu/bureau-etudes.html` montre bien la FAQ
   **claire**, avec son chapeau et sans « Poser ma question », et le site la reproduit
   (recouvrement du vocabulaire 100 %, les seuls écarts étant des fragments d'attributs
   HTML). La règle de `PageOffre.tsx` (« un chapeau veut dire la version plate ») est juste.
   **Correctif posé dans l'outil** : `diff-visuel-offre.mjs` lit la table `remapOffer`
   **dans la maquette** (jamais recopiée, elle dériverait au prochain export), refuse de
   mesurer une adresse détournée et renvoie vers sa capture figée. Vérifié dans les deux
   sens : il refuse `/bureau-etudes/`, il mesure `/offres/residence/`.
   **Attention pour la suite** : la capture de `/bureau-etudes/` est la seule des 244 à
   dater du 5 octobre, parce que depuis, le script de capture la déclare « redirigée » et
   ne la rafraîchit plus. Les six adresses détournées sont dans le même cas.
4. **`/preuves/bamesa/`** : titre 42 px trop bas (seule page décalée sur 248) ; la phrase
   du chapô retirée pour « notamment » doit être déclarée dans la fiche, et le chapô ne
   doit perdre que cette phrase.
5. ~~**Contrôles**~~ **FAIT le 09/10.** `verification-appel-action.tsx` exigeait
   l'INVERSE de ce que la mesure dit. Mesuré à 390 px sur `/carriere/`, des deux côtés :
   le panneau fait 308 px et calcule `40px 44px`, à l'identique. La maquette sérialise son
   attribut AVEC une espace (son moteur passe par le CSSOM), donc son propre sélecteur,
   écrit sans espace, n'atteint aucun élément chez elle ; React écrit sans espace, donc la
   règle portée ne mordrait que sur le site. L'assertion est inversée, sur les QUATRE
   valeurs du bloc retiré (« 30px 34px » est sur 85 captures contre 5 pour « 40px 44px »).
   Les commentaires de `globals.css` sont écartés avant la recherche, sans quoi le contrôle
   tombait sur sa propre explication. Prouvé dans les deux sens.
   Les deux scripts périmés sont supprimés, avec `docs/GABARITS.md` et
   `scripts/apercu-ressource.tsx` qui les citaient, dans le même commit.
   **À arbitrer, dossier complet** : `components/cocon/AppelAction.tsx` n'est importé par
   aucune page ; son remplaçant vivant est `AppelFinal.tsx`, importé par huit. Le brancher
   ou le supprimer.


6. **`/offres/retrofit/remise-en-etat/`** : dans la maquette, les boutons des bandes 4, 7, 13
   et du formulaire final n'ont pas de libellé ; le site en met un : déclarer l'écart.
7. **« réguliers »** apparaît encore sur 7 pages (guide choisir-une-entreprise, Poitiers,
   audit-conseil, résidence, robot-spot, préparer-un-arrêt, menuiserie) : vérifier que
   ce n'est jamais « clients réguliers » (« contrats réguliers » est permis).
8. **« taux horaire »** traité de deux façons (retiré sur `/implantations/`, rendu
   ailleurs : résidence, secteurs, alstef) : trancher et aligner.
9. ~~**Mobile, gabarit 01**~~ **FAIT le 09/10.** Le relais disait vrai. La règle
   d'accessibilité (24 px de cible tactile, WCAG 2.5.8) ajoute 3 px de remplissage haut et
   bas aux liens du fil ; son commentaire affirmait qu'elle « ne déplace pas le texte »,
   c'est faux, le remplissage compte dans la boîte de marge. Mesuré : +6 px à 320, 360,
   375, 390 ET 768 px (je n'ai PAS reproduit le « +12 px à 320 » annoncé par la
   contre-expertise). Corrigé par deux marges négatives de 3 px : l'écart tombe à 0 partout
   et la cible reste à 26 px. 38/38 pages du gabarit 01 à la hauteur, à 375 comme à 1280 px.
   Corrigé aussi : `FilAriane.tsx` affirmait que les captures ne dessinent aucune rangée.
   51 des 244 la dessinent (37 du gabarit 01, 8 du 03, 5 du 11, 1 du 10) ; la maquette ne
   pose ni classe ni `aria-label` et sépare par des « / », d'où la méprise. Ne pas la rendre
   reste la décision du 08/10, c'est un **écart déclaré**, pas une absence de référence.


10. ~~`scripts/verifie-position-titre.mjs`~~ **FAIT le 09/10.** Il se figeait sur
    `cadre.evaluate`, qui n'accepte aucune borne de temps : la seule façon de le borner est
    de fermer l'onglet sous lui. La durée se CALCULE depuis les bornes internes (126 500 ms)
    au lieu d'être écrite à la main : le premier correctif proposait 40 000 ms, soit MOINS
    que le chemin légitime de 116 500, et aurait fabriqué de faux décalages.
    Deux défauts plus graves trouvés au passage : il comptait toute page non mesurée comme
    DÉCALÉE (trois états désormais : ok, DÉCALÉ, NON MESURÉE), et il signait « conforme »
    les six adresses détournées en comparant deux pages différentes au H1 de même hauteur.
    Ajoutés : journal au fil de l'eau, reprise, `--part k/n`.

## Ce qui reste des défauts, au 09/10

- **Défaut 4, `/preuves/bamesa/`** : UN seul défaut, pas deux, et c'est prouvé au pixel.
  Le chapô perd la phrase portant « notamment », le bloc perd 88 px, passe sous les 480 px
  de la photo, et `align-items:center` descend le titre de (480-395)/2 = 42 px. Seule page
  décalée sur 248. **Question à Mehdi, une seule** : supprimer le MOT « notamment » au lieu
  de jeter la phrase entière (c'est le remède que `verifie-interdits.mjs` prescrit
  lui-même) ? Cela change le texte visible de 2 pages sur 248 et remet le titre à 158 px.
  Si oui, trois éditions coordonnées DANS LE MÊME COMMIT, sinon la porte tombe :
  une règle dans `lib/decisions-copie.ts`, le chapô de `preuves-bamesa.json`, ET celui de
  `preuves-valeo-usines.json`. Attention, trouvaille de la contre-expertise : les 41 fiches
  `preuves-*.json` sont PRODUITES par `components/site/preuve/extrait-depuis-captures.py`,
  qu'il faut corriger aussi sous peine de voir la correction effacée au prochain passage.

- **Défaut 6, `/offres/retrofit/remise-en-etat/`** : diagnostiqué, non appliqué. Les quatre
  emplacements du relais sont exacts, mais « sans libellé » ne veut pas dire la même chose
  partout : à mesurer sur le balisage de la capture avant de déclarer. Un bouton sans
  libellé est inutilisable et inaccessible, donc l'écart est probablement légitime ; il
  reste à l'écrire dans la forme que les fiches emploient déjà (`trous`).

- **Défaut 8, « taux horaire »** : diagnostiqué, NON appliqué, et plus gros qu'annoncé.
  Mesuré : **19 phrases réelles manquent sur 12 pages** contre les 9 du diagnostic.
  La décision existe déjà et personne ne l'a propagée : `scripts/verifie-offre-rendu.mjs`
  lignes 467-471, datée du 08/10, dit que « taux horaire homogène dans toute la France »
  ne donne aucun prix. Elle a été appliquée au gabarit 03 et à `/secteurs/`, jamais aux
  portes du gabarit 04, de `/offres/` et de `/implantations/`.
  Six portes l'interdisent encore : `verification-ville.tsx:176`,
  `verification-offres.tsx:161` et son motif `:175`, `scripts/verifie-implantations.tsx:95`,
  `verification-expertises.tsx:160`, `verification-domaine.tsx:283`,
  `verification-specialite.tsx:125`.
  **MAIS la décision ne couvre QUE « taux horaire »**, pas « tarif » ni « prix mensuel
  fixe », qui manquent aussi (`/offres/`, `/implantations/`, 4 pages d'expertises).
  **À faire trancher par Mehdi** avant d'y toucher. Et en retirant l'interdit, refaire
  porter l'injection de `verification-offres.tsx:335-344` sur un VRAI prix (un montant en
  euros), sans quoi la porte perd sa capacité d'échouer.

---

# Suite du 09/10 : ce qui a été fait, et ce qui attend

## Décisions de Mehdi du 09/10, toutes appliquées

- **Siège à Limonest, agence à Écully.** Renverse le 07/10, donne raison à l'audit
  de Nathan. Revient à la maquette (96 captures l'écrivent). Les 7 règles de
  réécriture sont retirées de `lib/decisions-copie.ts` ; il n'en reste qu'une, parce
  que la maquette se contredit sur `/carriere/`. **Sept portes ont été retournées.**
- **Orthus devient Migen Travaux / Migen Bureau d'études.** 62 champs de texte +
  frise + menu. Écart déclaré (bloc `ORTHUS` de `decisions-copie.ts`), la maquette
  le portant sur 22 captures.
- **Photos de ville sur `/carriere/`**, 7 cartes de hub. Écart déclaré.
- **8 portraits du CODIR** remplacés.

## Mesures faites le 09/10, à ne pas refaire

- **Photos** : 1 810 emplacements pour **56 photos distinctes**. `team-duo.jpg` et
  `team-grind-front.jpg` servies **133 fois chacune**. **130 pages** répètent une
  photo, six en répètent une **six fois**. Les **109 photos** de
  `public/assets/photos/` (registre, 27 thèmes) : **zéro utilisée**.
- **Logos** : deux affichages empilés sur ~138 pages, et **c'est le dessin de la
  maquette** (écrans « 02 Logos » et « 08 Références »). Mais le bandeau défilant
  porte **76 à 86 logos** et partage ses marques avec la grille, d'où l'effet de
  répétition que Mehdi signale. **Sa demande du 09/10 : il ne doit y avoir qu'une
  seule bande de logos.** À trancher : supprimer le bandeau, ou lui donner des
  marques différentes de la grille.
- **Audit de Nathan** : 32 constats vérifiés un par un. 27 confirmés, 4 déjà
  corrigés, 1 faux (**41 études de cas, pas 28** ; c'est le méga-menu qui dit 28).
  Détail complet dans le résultat du workflow `audit-nathan-verification`.

## Bloquants de l'audit, confirmés par la mesure

1. **Mentions légales** : 13 champs « à compléter » (forme juridique, capital, RCS,
   SIRET, TVA, hébergeur, directeur de publication…). `app/mentions-legales/page.tsx`.
2. **Confidentialité** : bandeau « en cours de validation juridique », et **OpenAI**
   cité comme destinataire publicitaire alors qu'aucun pixel n'est armé.
   `PolitiqueConfidentialite.tsx:344` et `lib/consentement.ts:70`.
3. **Markdown brut visible** : 26 chaînes sur 12 pages, **quatre causes distinctes**,
   dont un motif de `CorpsRessource.tsx:21` qui ne redescend pas dans « **Le [lien](/x/)** ».
4. **38 logos** affichés, et les mentions légales disent « utilisés avec leur accord ».

## En attente d'un arbitrage de Mehdi

- Le **04 78 33 72 05** restauré dans 20 phrases (la maquette porte le trou).
- Le mot **« notamment »** sur 2 pages : le supprimer remettrait le titre de
  `/preuves/bamesa/` à 158 px, seule page décalée sur 248.
- **« tarif »** et **« prix mensuel fixe »** : 19 phrases manquent sur 12 pages.
- **`AppelAction.tsx`**, code mort, remplacé par `AppelFinal.tsx`.
- Les **40 adresses** et **20 noms de fichiers** qui portent encore « orthus ».
  Pas de 301 nécessaire (hors production), MAIS `index.json` déclare ces adresses
  et les portes comptent « 248 pages de l'index » : l'écart est à déclarer.

## Pièges payés le 09/10

- **Vercel est maintenant relié au dépôt** (`vercel git connect --scope migenservice`,
  branche `phase-2-gabarits`, seule branche du dépôt). **Un push déploie désormais
  en production.** Le filet d'avant n'existe plus. Le relais du 08/10 dit l'inverse.
- Déploiement manuel : `--scope migenservice` est **obligatoire**, sans quoi « Not
  authorized » (la CLI est connectée en compte personnel).
- `/\bÉcully\b/` ne marche pas en JavaScript : le É n'est pas un caractère de mot
  au sens ASCII, donc pas de frontière après une espace.
- Un motif « siège … Écully » sans exclusion attrape la phrase CORRECTE de la
  maquette : utiliser `(?:(?!Limonest)[^.]){0,60}`.
- Les pages ne portent **qu'une balise `<img>`** dans leur HTML : les photos sont
  posées à l'hydratation. Un `curl` ne peut pas les voir, il faut un navigateur.
- Les images collées dans la conversation **n'existent pas sur le disque** : il faut
  que Mehdi les dépose lui-même.

---

# Confrontation du 09/10 au soir : ce que le relais dit de faux

Relais relu et **mesuré contre le dépôt**, arbre propre, `HEAD = 363e937`,
`origin/phase-2-gabarits` au même commit (donc la production est à jour, rien
n'attend d'être déployé). Six commits sont postérieurs à la rédaction ci-dessus :
`dbe29d6`, `bc39645`, `346ec92`, `f248493`, `363e937`. Ne pas refaire ce qui suit.

## Points du relais déjà clos, preuve à l'appui

| Point du relais | État réel, mesuré |
|---|---|
| Reste 1, photos de ville | **FAIT.** Les 8 fichiers de `components/site/accueil/hubs/` sont **octet pour octet** les versions sous licence de `public/assets/villes/hub-*.jpg` (`cmp` sur les 8). 12 fiches `implantations-*` servent `/assets/villes/`, et **aucun `hubLocal.credit` n'est renseigné** : le badge « Aperçu Envato » a disparu. |
| Reste 2, varier les photos | **FAIT, et largement.** 1 942 emplacements pour **558 photos distinctes** (contre 56 le 09/10 au matin). La plus servie est un logo, `aktid.png`, 15 fois ; la photo la plus servie l'est **12 fois** (contre 133). **Zéro page sur 231 ne répète une photo.** La banque `public/assets/photos/` compte 517 fichiers, **tous servis**. |
| Reste 4, formulaire mobile | **FAIT.** `.grille > *` ramené sur l'unique colonne dans le `@media (max-width: 900px)`, avec la mesure des 37 px en commentaire. |
| Reste 6, méta-description vide | **FAIT.** `entreprise-maintenance-industrielle.json` en porte une. Piège évité : elle écrit « 10 % des candidats », mais `appliqueDecisions` la rend « 10 % des **techniciens** » — conforme à la décision du 08/10. |
| Défaut 7, « réguliers » | **FAUSSE ALERTE.** Les 2 occurrences restantes de « clients réguliers » sont dans `retraits` (expertises-robotique-abb) et `phrases_retirees` (ressources) : elles **déclarent** le retrait, c'est leur raison d'être. `verifie-interdits.mjs` les écarte à juste titre (`DECLARATIFS`), et il rend « copie conforme (code + 246 fiches) ». |
| Bloquants de l'audit 1, 2, 3, 4 | **FAITS** (`dbe29d6`). Identité légale tirée de l'extrait Pappers du 09/10 (`docs/IDENTITE-LEGALE.md`, aucune valeur inventée) ; OpenAI retiré des destinataires et le bandeau « validation juridique » supprimé, avec une porte qui vérifie l'alignement destinataires/pixels armés ; markdown brut traité ; une seule bande de logos. |

Portes repassées au vert à l'instant : `node scripts/verifie-interdits.mjs`
(« copie conforme ») et `bun lib/verification-decisions-copie.ts`
(« 13 réécritures, 4 crédits retirés, 3 téléphones rendus, 24 phrases intactes »).

## Ce qui reste VRAIMENT, et presque tout attend Mehdi

**Lui seul peut le fournir :**
1. **Clé de service Supabase** (`SUPABASE_SERVICE_ROLE_KEY`) : sans elle, la preuve
   RGPD ne s'écrit pas dans `consent_logs` (la route rend 503 et le dit), et
   `scripts/importe_rest.mjs` ne peut pas tourner. Défaut 1 et reste 8 du relais.
2. **3 champs des mentions légales** : directeur de la publication (à désigner,
   ce n'est pas une donnée du greffe), courriel de contact, hébergeur (Vercel Inc.,
   adresse à confirmer). Les 10 autres champs sont remplis depuis Pappers.
3. **Les 38 logos** : les mentions légales écrivent « utilisés avec leur accord ».
4. **Suppressions refusées par les permissions** : reste 7 du relais, inchangé.

**Arbitrages ouverts, aucun code à écrire avant sa réponse :**
5. Le mot **« notamment »** : le supprimer remet le titre de `/preuves/bamesa/`
   à 158 px, seule page décalée sur 248. Trois éditions dans le même commit,
   plus `extrait-depuis-captures.py` sous peine d'effacement.
6. **« tarif »** et **« prix mensuel fixe »** : 19 phrases manquent sur 12 pages,
   six portes l'interdisent encore, et la décision du 08/10 ne couvre que
   « taux horaire ».
7. Le **04 78 33 72 05** rendu dans 20 phrases alors que la maquette porte le trou.
8. **`AppelAction.tsx`**, code mort (seul `habillage.ts` le cite, en commentaire) ;
   son remplaçant vivant est `AppelFinal.tsx`.
9. Les **30 fiches** qui portent encore « orthus » : écart à déclarer.

**Sans arbitrage, mais non fait :**
10. **Défaut 6**, `/offres/retrofit/remise-en-etat/` : mesurer le balisage de la
    capture avant de déclarer les 4 boutons sans libellé dans `trous`.
11. **Consignes IA du Diagnostic** : prix et « sous 48h » encore dans les fonctions
    Supabase ; non commité, dépôt `migen-diagnostic-zero-arret`, branche `v5.2`.
12. **`.vercelignore`** ignoré par `--archive` : 486 Mo envoyés.

## Le piège qui a changé, à ne pas manquer

**Vercel est relié au dépôt depuis le 09/10** : un `git push` sur
`phase-2-gabarits` déploie en production. La section « Où vit quoi » plus haut
dit le contraire, elle est périmée. `--scope migenservice` est obligatoire pour
tout déploiement manuel.

## Défaut signalé par Mehdi le 09/10 au soir : CORRIGÉ

« Des phrases qui veulent rien dire » sur les études de cas, exemple
/preuves/autoliv/ : « La situation » suivie de « Le besoin posé par le site : »
et de rien. **17 annonces orphelines sur 12 des 41 études de cas.**

**La cause n'est pas le portage, et elle n'est pas dans le site.** `Complement`
sait rendre des `puces`, le gabarit de la maquette a l'emplacement, et il est
VIDE dans la capture (`maquette/rendu/preuves--autoliv.html` : `<p>…site :</p>`
puis deux lignes blanches). L'export de la maquette a perdu ces listes, et
`extrait-depuis-captures.py` les a recopiées : son `assert` se contentait de
« texte OU puces », ce qu'un libellé seul vérifie.

**Rien n'a disparu, et c'est ce qui rend le remède sûr.** Les listes annoncées
sont rendues ailleurs sur la même page, en cartes (`objectifs`,
`reponseCartes`, `resultats`), vérifiées puce par puce contre le corpus du
client. Les titres des blocs retirés (« La situation », « Le résultat »,
« Ce que nous avons mis en place ») sont eux aussi des doublons : déjà des `h2`
de la page, deux occurrences chacun, mesuré sur le rendu.

**Trois critères de détection ont été payés avant le bon**, et chacun est
devenu un cas du contrôle positif, parce que chacun fabriquait de faux défauts
ou en absolvait de vrais :
1. lire le rendu balise par balise → déclarait orpheline la page CONFORME
   /guides/choisir-une-entreprise-de-maintenance/, dont la liste arrive en
   cartes faites de `<div>` qu'une expression régulière n'apparie pas ;
2. « le texte suivant est-il un titre ? » → absolvait 8 défauts réels, le texte
   qui suit étant le sur-titre « Votre besoin », pas un titre de niveau ;
3. « le conteneur se referme-t-il après l'annonce ? » → déclarait orphelines
   les annonces de /expertises/types-de-maintenance/, dont la liste vit dans le
   conteneur FRÈRE, indiscernable du vrai défaut en HTML.

**Le critère retenu est celui des fiches** : une annonce est orpheline si ni son
bloc ni le bloc SUIVANT ne porte autre chose que de la prose (la maquette met
`puces` ou `tableau` tantôt dans l'un, tantôt dans l'autre, les deux sont
conformes). 17 trouvailles, les mêmes que par deux autres mesures indépendantes.

**Ce qui a été posé :**
- `scripts/verifie-libelles-orphelins.mjs`, porte avec contrôle positif 4/4,
  dont les 3 faux pas ci-dessus comme cas sains. Elle a échoué à 17 avant
  correctif, elle est verte après.
- `scripts/retire-libelles-orphelins.mjs`, le correctif : retire le bloc entier
  et écrit la phrase dans le `trous` de sa fiche, avec sa raison.
- `components/site/preuve/extrait-depuis-captures.py`, **la cause racine** : le
  bloc orphelin tombe maintenant dans `purge_interdits`, sans quoi la
  correction aurait été effacée au prochain passage du générateur (le piège que
  le relais signale pour les 41 fiches `preuves-*`).

**Vérifié après correctif** : `tsc --noEmit` propre, `verifie-interdits` vert,
`verification-decisions-copie` vert, `verification-preuve` vert en entier
(41/41 pages contre leurs captures), `verifie-libelles-orphelins` vert, et sur
le rendu de /preuves/autoliv/ les deux phrases ont disparu pendant que les 7
puces qu'elles annonçaient sont toujours là.

**Non commité** : l'arbre est sale, et un `git push` déploie maintenant en
production. À arbitrer par Mehdi avant de pousser.

## Deuxième défaut, trouvé par le balayage que Mehdi a demandé : CORRIGÉ

Mehdi : « peux tu checker sur tout les business case ». Le balayage des 41
études de cas a trouvé une seconde famille, plus large que la première et
présente sur tout le site : **une phrase du corpus coupée en deux lignes, la
seconde ouverte par une virgule.**

Le corpus écrit une puce en UNE phrase, son début en gras :
`- **Disposer d'un profil opérationnel tout de suite**, pas d'un renfort à former.`
Le portage a mis le gras dans `titre`, la suite dans `texte`, et les cartes
rendaient DEUX blocs. Le visiteur lisait :

    Disposer d'un profil opérationnel tout de suite
    , pas d'un renfort à former.

**La maquette porte le même défaut** (`preuves--autoliv.html`,
`data-dc-tpl="64"` puis `"66"`, deux `div` dont le second a `margin-top: 6px`),
donc les contrôles de gabarit trouvaient les deux lignes DES DEUX CÔTÉS, et
`verifie-phrases-estropiees` absout exprès les moignons de début que la capture
porte aussi. Cette absolution est juste pour les 7 paragraphes de
`/expertises/`, dont l'accroche est rendue EN LIGNE ; elle couvrait par ricochet
ce défaut-ci, où rien ne raccommode la phrase.

**Remède, aucun mot changé** : `components/site/blocs/TitreEtSuite.tsx`. Quand
le texte commence par une virgule ou un point-virgule, titre et suite sont
rendus dans le MÊME bloc, le titre en ligne, et les marges verticales des deux
blocs tombent (elles écarteraient le titre de sa propre suite ; elles vivent
tantôt sur le texte, tantôt sur le titre). Branché sur cinq rendus :
`PagePreuve` (objectifs, étapes, résultats, cartes de réponse),
`ReferencesOffre` (74 cartes des pages Villes) et `DerouleOffre` (7 étapes des
gabarits Spécialité et Domaine, où `majusculeInitiale` ne doit PAS s'appliquer :
une suite reprend au milieu d'une phrase).

**Mesuré : 108 phrases rendues d'un trait, 0 coupée**, contre 108 coupées avant.

### La porte a menti deux fois, et c'est la leçon à garder

`scripts/verifie-suites-de-titre.mjs`, contrôle positif 3/3. Elle a été fausse
deux fois avant d'être juste, et les deux fois elle disait « tout va bien » :

1. **Entités hexadécimales.** Elle ne décodait que `&#39;` ; Next.js écrit
   `&#x27;`. Toute phrase portant une apostrophe échouait : 11 faux défauts sur
   des études de cas DÉJÀ corrigées.
2. **Le trou qui comptait.** Elle retirait les balises en les remplaçant par
   RIEN : `<div>titre</div><div>, suite</div>` devenait `titre, suite`, soit
   exactement la phrase jointe. **Elle ne pouvait pas distinguer le défaut de
   son remède**, et elle ne l'a pas vu quand il a été réinjecté exprès dans
   `TitreEtSuite`. Corrigé en posant une frontière `│` à chaque balise de BLOC,
   les balises en ligne s'effaçant sans frontière. Reprouvé dans les deux sens :
   défaut réinjecté → 0 jointes / 108 coupées ; remède restauré → 108 / 0.

Trois critères avaient déjà été payés sur la première famille. Au total, **cinq
mesures fausses pour deux défauts** : sur ce site, une porte qu'on n'a pas vue
échouer ne vaut rien, et il faut la faire échouer SUR LE DÉFAUT RÉEL, pas sur un
cas de laboratoire.

### Décision de Mehdi du 09/10 au soir, appliquée

- **Code mort supprimé** : `components/cocon/AppelAction.tsx`, son module CSS et
  sa porte `verification-appel-action.tsx`. Aucune page ne l'importait, son
  remplaçant vivant est `components/site/offre/AppelFinal.tsx`. Le commentaire
  de `components/site/blocs/habillage.ts` qui le citait est à jour. `tsc` propre.

### Décisions de Mehdi du 09/10 au soir, PAS encore appliquées

- **« Ne donnes aucun tarif, dis juste que c'est sur devis. »** 19 phrases sur
  12 pages. Et `scripts/verifie-implantations.tsx` le pointe déjà :
  `/implantations/` perd « Le contrat Zéro arrêt est chiffré sur devis, avec un
  engagement type de 6 mois renouvelable » que SA CAPTURE PORTE. La décision
  rend cette phrase, et les 18 autres, dicibles.
- **Les 40 adresses et 20 noms de fichiers « orthus »** (30 fiches). Mehdi :
  « pas besoin de redirection on est en preprod, tu peux faire les
  modifications ». Non commencé : l'index déclare ces adresses et les portes
  comptent « 248 pages de l'index », donc c'est un changement coordonné.

### `scripts/verifie-implantations.tsx` est PÉRIMÉE sur trois points

Elle rend KO sur `/implantations/` avec 5 écarts, dont AUCUN ne vient des
corrections ci-dessus. Elle n'a pas été retournée avec les sept autres :
1. elle attend « siège à Limonest et bureaux à Écully » et déclare
   « interdit rendu (le siège est à Écully) : Limonest », soit l'INVERSE de la
   décision du 09/10 ;
2. elle réclame la phrase « chiffré sur devis », que la décision du 09/10 au
   soir rend justement ;
3. elle exige les octets de photo du relevé, là où la répartition du 09/10 a
   posé des photos du registre (l'item « faire accepter une photo de la maquette
   OU du registre » du relais, fait ailleurs, pas ici).
