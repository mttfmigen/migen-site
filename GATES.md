# Registre des retours de Mehdi

Un point par retour, dans l'ordre où il l'a donné. Rien n'est coché sans une
preuve lisible juste en dessous. Un point sans preuve compte pour NON FAIT,
même s'il « a l'air » fait.

Les retours arrivent au compte-gouttes : ce fichier est la seule liste qui les
retient tous. À relire avant de dire « j'ai tout terminé ».

Convention : `CHECK:` est la commande qui tranche, `EXPECT:` ce qu'elle doit
afficher. Un point sans commande possible est marqué `MANUEL:` et porte la
mesure qui l'a tranché.

L'ÉTAT DE LA CASE COMPTE AUTANT QUE LA COMMANDE, et
`scripts/verifie-le-registre.mjs` croise les deux depuis le 13/10 au soir :

- case cochée, porte qui passe : promesse tenue ;
- case cochée, porte qui échoue : PROMESSE ROMPUE, le seul vrai scandale ;
- case non cochée, porte qui échoue : chantier ouvert que sa porte confirme,
  c'est cohérent et non un mensonge ;
- case non cochée, porte qui PASSE : sa commande mesure un état, pas le
  correctif. Elle se lit « à requalifier », et ne se compte JAMAIS comme faite.

Pourquoi ce croisement : sans lui, le rapport annonçait « 46 tenues sur 49 »
alors que sept de ces mesures vertes portaient sur des entrées déclarées NON
FAITES. Qui lit ce compte conclut que le travail est fait.

Une attente qui se déclare elle-même indéfinie (« à redéfinir », « à
préciser ») ne tranche rien : le vérificateur la refuse maintenant comme
illisible, au lieu de la compter tenue parce qu'un de ses nombres paraît par
hasard dans la sortie.

Dernière relecture : 13/10 au soir, les 49 commandes du registre rejouées une
par une, et le vérificateur lui-même remis d'aplomb (trois défauts, voir plus
bas G35, G58, G66, D1 et D19).

---

## Série 1, la liste de neuf points du 12/10 au matin

### G1 — Menu ordinateur : Expertises et Cas clients ne menaient pas à leur page de niveau 1
- [x] FAIT
      PREUVE : `components/site/entete-donnees.ts`, `NAV_PANNEAUX` porte
      désormais un `href` par entrée et les cinq libellés sont de vrais
      `<Link>`. Au passage, Full service pointait sur
      `/offres/maintenance-externalisee/` qui répond 301 : corrigé en
      `/offres/full-service/`.
      CHECK: curl -s -o /dev/null -w "%{http_code}" https://migen-site.vercel.app/offres/full-service/
      EXPECT: 200

### G2 — Photos sans rapport avec le secteur du cas client
- [x] FAIT
      PREUVE : `lib/secteur-du-cas.ts` déduit le secteur du texte de la fiche,
      38 photos hors secteur corrigées, 0 restante.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app
      EXPECT: PHOTOS_DANS_LEUR_SUJET
      L'ATTENTE ÉTAIT MAL FORMULÉE, corrigée le 13/10 : elle réclamait un zéro
      que la commande n'affiche pas. La porte rend un JETON DE SUCCÈS,
      `PHOTOS_DANS_LEUR_SUJET`, qu'elle n'imprime que si elle passe ; c'est lui
      qu'il faut attendre. Une attente qui ne se décide pas est un défaut du
      registre et non de la porte, et elle faisait croire à une promesse rompue
      alors que la mesure était bonne.
      CETTE COMMANDE ÉTAIT FAUSSE, et elle n'a jamais rien prouvé : elle lançait
      `node` sur un script qui importe `lib/secteur-du-cas.ts`, donc elle plantait
      sur `ERR_UNKNOWN_FILE_EXTENSION` avant la moindre assertion. Et sans
      `SITE_URL` la porte vise le serveur de dév, qui ne tourne pas.
      TÉMOIN : `--controle` 9/9 fautes détectées.

### G3 — Le libellé technique « pages liées » s'affichait sur le site
- [x] FAIT
      PREUVE : la phrase et son compteur retirés, ainsi que « N engagements »
      inventé sur 140 pages.
      CHECK: curl -s https://migen-site.vercel.app/expertises/ | grep -c "pages liées"
      EXPECT: 0

### G4 — Page nous connaître : la photo de Nathan était un carré orange
- [x] FAIT
      MANUEL : portrait servi, vérifié à l'œil et par `img.decode()`.

### G5 — FAQ : la première question était toujours ouverte
- [x] FAIT, et c'était CONFORME à la maquette
      PREUVE : les captures figées écrivent `<details open="">`. Mehdi a tranché
      « tout fermer » : les FAQ sont toutes fermées sur sa décision, pas sur un
      défaut.

### G6 — Le sens du nom migen n'était pas posé
- [x] FAIT
      PREUVE : M maintenance, I industrielle, gen général, posé sur
      `/nous-connaitre/` comme il l'a demandé.
      CHECK: curl -s https://migen-site.vercel.app/nous-connaitre/ | grep -c "industrielle"
      EXPECT: au moins 1

### G7 — Les cas clients cités sur chaque page expertise ne correspondaient pas
- [x] FAIT
      PREUVE : 13 pages sur 19 étaient déjà exactes, les 6 « écarts » étaient un
      double comptage de ma part. Les cas sont rattachés par secteur déduit.

### G8 — La page Nos implantations faisait un gros pâté de hubs et de villes
- [~] PARTIELLEMENT FAIT, REOUVERT PAR G32 et G33
      PREUVE : `components/site/implantations/NosVilles.tsx` repliée au
      téléphone. Mais Mehdi rouvre le sujet le 12/10 sur l'aspect visuel.

### G9 — WashTec : ce sont les portiques qui lavent les voitures
- [x] FAIT
      PREUVE : `lib/secteur-du-cas.ts` sort WashTec du thème « automobile » par
      une exception explicite (`(?<!lavage )automobiles?`).

---

## Série 2, la liste de la page d'accueil et des hubs

### G10 — Accueil, bloc NOS DERNIÈRES RÉALISATIONS : les photos ne correspondent pas au cas
- [x] FAIT
      PREUVE : `lib/photo-de-la-cible.ts` remplace l'image d'une carte par celle
      de la page qu'elle ouvre. 46 images écrites en dur basculées, sur sa
      décision « oui, tout basculer ».
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node -e "const{NOMBRE_PAGES}=require('./lib/photo-par-page.ts');console.log(NOMBRE_PAGES)" 2>/dev/null || grep -c '": "/assets/photos/' lib/photo-par-page.ts
      EXPECT: 231 pages couvertes

### G11 — Accueil, bloc PARTEZ DE VOTRE BESOIN : changer les photos des cartes
- [x] FAIT, même mécanisme que G10.

### G12 — NOS HUBS : la photo de Metz ne correspond pas
- [x] RÉPONDU PAR MEHDI, suivi en G53. Il voulait une photo de la VILLE, pas une
      scène d'usine : « pour le hub de Metz je veux une photo de la ville ». La
      mesure a montré que 8 hubs sur 10 en ont déjà une, Metz et Dijon étant les
      deux seuls sans. Ce n'est donc plus une question de critère, c'est deux
      fichiers à fournir.
      MESURE : le thème de la photo servie est la métallurgie, ce qui est
      cohérent avec le bassin de Metz. Je ne sais pas ce qu'il attend à la
      place. À lui demander.

### G13 — NOS HUBS : la photo de Bordeaux est mal cadrée
- [x] RÉPONDU PAR MEHDI, suivi en G54. « Pour Bordeaux évite le cadrage et mets
      cette photo. » Le réglage de cadrage par photo, qui n'existait pas et que
      je lui avais annoncé comme une limite, est posé. Reste son fichier.
      MESURE : le cadrage est centré par défaut, il n'existe aujourd'hui aucun
      réglage par photo. Ajouter un point de cadrage par photo est faisable,
      mais il faut savoir lequel il veut.

### G14 — Page bureau d'études : le bloc d'appel est mal disposé
- [ ] NON FAIT
      Même famille que G15. À traiter avec lui.

### G15 — /travaux-industriels/ : le bloc d'appel est mal disposé
- [ ] NON FAIT

### G16 — bureau-etudes : « Les prestations regroupées ici » pas assez complet
- [x] FAIT. Le bloc passe de 7 à 25 prestations sur les 4 pages qui le portent.
      MESURE : il n'existe que sur 4 adresses, et notre rendu était EXACTEMENT
      celui de la capture, 2 / 1 / 2 / 2. Ce n'était donc pas un défaut de
      portage mais un arbitrage contre la maquette : elle ne range dans ce bloc
      que les offres que son propre routeur redirige, et jamais les pages filles
      de l'offre. 18 prestations étaient orphelines de leur page.
      LES 18 CARTES REPRENNENT LE H1 DE LEUR PAGE CIBLE, verbatim, et leur
      accroche telle que la page cible l'écrit. 4 restent sans accroche parce
      que leur page n'en écrit aucune : vide plutôt que faux.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-prestations-regroupees.mjs
      EXPECT: 4 blocs, 25 prestations, aucune oubliée. La porte refuse aussi
      tout bloc de moins de 2 cartes : il n'aurait pas lieu d'être.
      MESURE : le contenu servi est exactement celui de la capture figée. Il
      faut savoir ce qu'il veut voir en plus.

### G17 — /expertises/ : les photos sont toujours les mêmes que sur les autres pages
- [x] FAIT, même mécanisme que G10.

### G18 — /expertises/ : il manque une offre, et « Maintenance tuyauterie » n'en est pas une
- [~] PARTIELLEMENT TRANCHÉ
      MESURE : « Maintenance tuyauterie » n'est pas dans le bloc des offres, elle
      est dans « Par où continuer ? ». Les 6 offres du menu sont complètes,
      Travaux industriels vivant à `/travaux-industriels/` et non sous
      `/offres/`. Reste à savoir quelle offre il voit manquer.

### G19 — Les bento Offres et Secteurs ne changent pas d'image
- [x] FAIT, même mécanisme que G10.

### G20 — La maquette mobile n'était déployée que sur quelques pages
- [x] FAIT
      PREUVE : 141 blocs repliables sur 140 pages au départ, 932 blocs sur
      233 pages à l'arrivée. Pire page passée de 36,2 à 25,6 écrans.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && SITE_URL=https://migen-site.vercel.app node scripts/verifie-blocs-pliables.mjs
      EXPECT: 1092 blocs sur 233 pages
      LE COMPTE A MONTÉ depuis que ce point a été écrit, de 932 à 1092 : les
      gabarits repliés après coup s'y sont ajoutés. Un EXPECT périmé est un
      mensonge tranquille, il est corrigé. Et sans `SITE_URL` la porte vise le
      serveur de dév, qui ne tourne pas : elle rendait « MESURE NON CONCLUANTE ».

### G21 — L'API SIREN n'était pas branchée sur les formulaires
- [x] FAIT
      PREUVE : `lib/annuaire-entreprises.ts` interroge
      `recherche-entreprises.api.gouv.fr`, sans clé. `champsCaches()` ne rend
      QUE les 5 champs qui existent sur son formulaire HubSpot (pays, SIREN,
      SIRET, adresse, code postal) : HubSpot rejette la soumission ENTIÈRE si un
      champ inconnu passe. Sur un 400, la demande est rejouée sans
      l'enrichissement, pour ne jamais perdre un lead.

### G22 — La candidature spontanée doit partir dans TeamTailor avec toutes les infos en commentaire
- [~] CODE FAIT, BLOQUÉ SUR LUI
      PREUVE : `lib/teamtailor.ts` crée le candidat, le rattache à l'offre et
      poste une note avec les 12 champs. Un échec de la note ne fait pas échouer
      le dépôt. `app/api/candidature/route.ts` consomme la limite de débit APRÈS
      validation, et rend un 503 honnête si la clé manque.
      BLOQUÉ : l'offre 8528454 est encore en brouillon, son titre public est
      toujours « Copy of Technicien de maintenance - France entière F/H », et
      `TEAMTAILOR_API_KEY` et `TEAMTAILOR_JOB_ID` ne sont pas posés sur Vercel.

---

## Série 3, les retours du 12/10 après-midi

### G23 — /contact/ est mal constituée : on parle d'un besoin puis on envoie vers l'espace candidat
- [x] FAIT
      MESURE : la carte « Vous êtes technicien ? » est bien DANS la maquette, au
      milieu de « Après votre demande », il l'a confirmé. C'est son EMPLACEMENT
      qui ment. Sa grille était en `1fr 1fr` pour une seule carte, donc une
      demi-colonne vide, dans la maquette comme chez nous.
      FAIT : carte sortie de la section cliente, déplacée dans
      `components/site/contact/PourLesTechniciens.tsx`, pleine largeur, à la fin
      de la page, avec son propre `<h2>`.
      CORRIGÉ AUSSI : la troisième ligne affichait « Quatre écrans. », moignon
      laissé par la purge du délai interdit « 48 h » de la maquette, et faux de
      surcroît (notre formulaire tient sur un écran).
      CHECK: curl -s https://migen-site.vercel.app/contact/ | grep -c "Quatre écrans"
      EXPECT: 0

### G24 — « Ligne bloquée maintenant ? Voir le dépannage industriel » est inutile
- [x] FAIT, sur toute la famille
      MESURE : ce n'est pas une phrase, c'est un motif sur 52 emplacements, et il
      n'est dans AUCUNE des 248 captures de la maquette.
      FAIT : 26 fiches, 25 SQL d'import et 1 valeur écrite en dur dans
      `components/site/expertises/expertises-donnees.ts`. Les deux phrases qui
      portaient une information utile avant la redirection la gardent mot pour
      mot, sans réécriture.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/retire-redirection-depannage.mjs
      EXPECT: 0 redirections sur 0 fiches ET 0 redirections dans 0 fichiers SQL

### G25 — Menu, bloc Ressources : « Fiches métier » renvoie vers le recrutement
- [x] FAIT. Faute de portage confirmée : dans la maquette les trois rangées « par format » ouvrent sa bibliothèque filtrée, pas son écran de recrutement. Les 5 familles réelles figurent au panneau, avec leur vrai compte. Vérifié dans le navigateur en production.
      MESURE : `components/site/entete-donnees.ts`, `RES_FORMATS` : l'entrée
      « 07 Fiches métier » pointe sur `/carriere/`. Deux entrées portent le même
      numéro 07. Le menu n'expose que 3 des 5 familles réelles de
      `/ressources/` (articles, fiches pratiques, fiches techniques, livres
      blancs, process).

### G26 — La page /carriere/ devrait s'appeler « Rejoindre migen »
- [x] FAIT. Libellé du menu « Rejoindre migen », vérifié en production dans la barre de navigation.
      MESURE : la maquette écrit « Rejoindre migen© » dans son écran de
      recrutement, donc la demande va dans le sens de la maquette.

### G27 — Menu : le « 23 RESSOURCES » renvoie vers le guide de maintenance industrielle
- [x] FAIT. Sa cible était déjà bonne ; c'est le chiffre qui mentait, 23 comptant la bibliothèque de la maquette et non le site. Affiche « Les 35 ressources », vérifié dans le navigateur.
      MESURE : je n'ai pas localisé l'élément par un grep de « 23 » dans
      l'en-tête servi : c'est très probablement un compteur CALCULÉ. Le compte de
      23 est à confronter aux 41 pages réelles sous `/ressources/`.

### G28 — Fiche métier : problème avec les titres H2 et la disposition de la page
- [x] FAIT. 20 titres en double, 140 titres sur 153 à la taille du téléphone sur grand écran, 45 largeurs perdues, 32 cellules aplaties, 117 arrêts de tabulation muets. Tous à zéro. Porte dédiée, témoin 4/4 plus une page conforme acceptée.
      PISTE DONNÉE À L'AGENT : ma première version des bascules mobiles mettait
      des `<span>` habillés au lieu de vrais `<h2>` sur ces 13 pages. Corrigé,
      mais à revérifier page par page.

### G29 — Fiche pratique : mal agencée, gros blocs « pourquoi ces fiches existent », aucune cohérence
- [x] FAIT. Cause mesurée et non devinée : le repli coûtait 29 à 33 px par partie sur ce gabarit. 192 des 196 sections sont à 0 px d'écart de leur capture. Porte dédiée, témoin 6/6.

### G30 — /nous-connaitre/ : toujours la même photo, blocs « Notre force » et « le premier client »
- [x] FAIT. Le doublon venait de la maquette, ses deux emplacements pointant le même fichier alors que leurs descriptions diffèrent. Chaque bloc a la sienne, choisie sur son propre texte. Porte dédiée, témoin 8/8.
      PISTE : quatre images de `/assets/web/` écrites en dur couvraient chacune
      quatre pages de hub. Même famille de cause que G10.

### G31 — /rse/ : changer la photo du cas concret
- [x] FAIT. L'ancienne montrait une armoire NEUVE en montage pour un cas qui parle d'une ligne de 1998 remise en service.

### G32 — Le bloc « Ce que nous vous transmettons » est mal agencé
- [x] FAIT, et ce n'était pas un défaut d'agencement. Mesuré à neuf largeurs contre la maquette vivante : remplissage, largeur, alignement, espacements et position de chaque cellule identiques. Le seul écart est une phrase raccourcie par l'interdit de délai chiffré.

### G33 — /implantations/ : le bloc « sept hubs, 74 bassins » est mal agencé, trop gros, pas assez visuel
- [x] FAIT. Section de 1965 à 1424 px à 1440 (moins 28 %), et de 2,67 à 0,41 écran au téléphone. Le vrai pâté était « Au-delà des hubs », 1977 px à lui seul. Notre rendu était CONFORME à la capture (+0,9 %) : c'est donc ton arbitrage contre ta maquette, et il est déclaré comme tel.

### G34 — /implantations/ : même reproche pour le bloc « au delà des hubs »
- [x] FAIT, même passage que G33. Les onze cartes bordées deviennent un annuaire en cinq colonnes.

### G35 — /offres/ : « c'est que des photos avec des avions, on doit voir du technicien »
- [~] PLAN PRÊT, PAS ENCORE APPLIQUÉ. 385 photos jugées image ouverte, 64 disqualifiées, trois sceptiques en ont annulé 20 : 44 restent interdites sur une page commerciale. Vivier propre de 341. Les plans de réattribution sont rendus par famille de pages.
      MESURE : sur les 17 photos de contenu de /offres/, 5 sont de
      l'aéronautique et 2 de la menuiserie. Les 7 portent TOUTES le thème
      `technicien` au registre, donc aucun sélecteur demandant « un technicien »
      ne pouvait les écarter : un mécanicien penché sur un moteur d'avion EST un
      technicien. Ce n'est pas une pénurie, 291 des 385 photos portent
      `technicien` contre 20 pour `aeronautique`.
      PÉRIMÈTRE RÉEL : 27 photos à sujet aéronautique servent 71 pages, et
      22 photos à sujet menuiserie en servent 68.
      MA PREMIÈRE RÈGLE ÉTAIT FAUSSE : « toute photo portant un thème de
      secteur » sortait 1039 manquements, en accusant une photo de technicien
      devant un poste électrique. Un poste électrique se lit encore comme de
      l'industrie, un avion non. Le discriminant est le SUJET DOMINANT de
      l'image, pas son étiquette.
      SON ATTENTE NE TRANCHAIT RIEN, corrigée le 13/10 au soir. Elle disait
      « à redéfinir une fois les 385 photos classées par sujet dominant », et
      comptait pourtant pour une PROMESSE TENUE : le vérificateur y lisait le
      nombre 385, le retrouvait dans la sortie, et concluait au vert. Un aveu
      d'indéfinition lu comme une assertion.
      CE QUE LA COMMANDE PEUT PROUVER AUJOURD'HUI, et rien de plus : qu'aucune
      photo n'est plus écrite en dur dans un composant. Son gros chiffre, 952
      manquements, sort de la règle que cette entrée déclare elle-même FAUSSE
      (« toute photo portant un thème de secteur ») : il ne décide donc pas
      G35. Le discriminant voulu, le SUJET DOMINANT de l'image, n'est toujours
      pas outillé, et c'est pour ça que l'entrée reste ouverte.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/inventorie-photos-hors-sujet.mjs | sed -n 's/^MANQUEMENTS ÉCRITS EN DUR : //p'
      EXPECT: 0

### G36 — /offres/zero-arret/ : le bloc « Également dans cette offre » ne sert à rien
- [x] FAIT. Le bloc passe de 7 à 25 prestations sur les 4 pages qui le portent.
      MESURE : il n'existe que sur 4 adresses, et notre rendu était EXACTEMENT
      celui de la capture, 2 / 1 / 2 / 2. Ce n'était donc pas un défaut de
      portage mais un arbitrage contre la maquette : elle ne range dans ce bloc
      que les offres que son propre routeur redirige, et jamais les pages filles
      de l'offre. 18 prestations étaient orphelines de leur page.
      LES 18 CARTES REPRENNENT LE H1 DE LEUR PAGE CIBLE, verbatim, et leur
      accroche telle que la page cible l'écrit. 4 restent sans accroche parce
      que leur page n'en écrit aucune : vide plutôt que faux.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-prestations-regroupees.mjs
      EXPECT: 4 blocs, 25 prestations, aucune oubliée. La porte refuse aussi
      tout bloc de moins de 2 cartes : il n'aurait pas lieu d'être.
      Il n'y liste qu'UNE prestation, avec un renvoi vers un guide.

### G37 — /offres/bureau-etudes/ : la photo du bloc problématique est mal choisie
- [x] FAIT, PLAN APPLIQUÉ. Cette entrée disait encore « plan prêt, pas
      encore appliqué » : périmée. Mesuré en production le 13/10, la photo du
      bloc « problématique » des pages expertises est DISTINCTE sur chacune
      (5 pages, 5 photos), et la porte du secteur rend son jeton de succès sur
      475 photos de 66 pages.
      CHECK: bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app | tail -1
      EXPECT: PHOTOS_DANS_LEUR_SUJET

### G38 — /offres/bureau-etudes/ : le bloc d'appel toujours pas corrigé
- [ ] NON FAIT, c'est G14 qu'il rouvre explicitement : « tu n'as toujours pas
      corrigé ce bloc ». Il s'agit du bloc qui enchaîne « Nous vous rappelons
      dans l'heure… », « Faire chiffrer mon étude » et « Structures et châssis,
      mécano-soudé, transmissions… ».

### G39 — /offres/bureau-etudes/ : un bloc qui ne contient qu'une phrase
- [x] FAIT, et cette entrée était PÉRIMÉE : le travail était en ligne, pas au
      registre. « Chaque étape a un livrable défini et un point de validation.
      Vous restez maître des choix. » n'occupe plus une section entière : elle
      est servie en ligne de clôture, `<section style="padding:18px 0 0">`,
      texte de 14,5 px sur 78 ch, sous le bloc qu'elle commente. 33 blocs d'une
      seule phrase traités de la même façon.
      CHECK: curl -s https://migen-site.vercel.app/offres/bureau-etudes/ | grep -c 'padding:18px 0 0'
      EXPECT: au moins 1

### G40 — Le bloc « Également dans cette offre » n'a pas toutes les prestations
- [x] FAIT. Le bloc passe de 7 à 25 prestations sur les 4 pages qui le portent.
      MESURE : il n'existe que sur 4 adresses, et notre rendu était EXACTEMENT
      celui de la capture, 2 / 1 / 2 / 2. Ce n'était donc pas un défaut de
      portage mais un arbitrage contre la maquette : elle ne range dans ce bloc
      que les offres que son propre routeur redirige, et jamais les pages filles
      de l'offre. 18 prestations étaient orphelines de leur page.
      LES 18 CARTES REPRENNENT LE H1 DE LEUR PAGE CIBLE, verbatim, et leur
      accroche telle que la page cible l'écrit. 4 restent sans accroche parce
      que leur page n'en écrit aucune : vide plutôt que faux.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-prestations-regroupees.mjs
      EXPECT: 4 blocs, 25 prestations, aucune oubliée. La porte refuse aussi
      tout bloc de moins de 2 cartes : il n'aurait pas lieu d'être.
      Sur /offres/bureau-etudes/ il n'en liste que deux. C'EST LE MÊME BLOC que
      G16 (« pas assez complet ») et G36 (« ne sert à rien »), vu sur trois
      pages. Sa décision se lit maintenant clairement : ce bloc doit porter
      TOUTES les prestations regroupées sous l'offre, ou ne pas exister.

### G41 — /travaux-industriels/ : retirer la phrase du premier héros
- [x] FAIT. Retirée du champ `mention` de la fiche `/travaux-industriels/`, et
      de là seulement : deux autres pages portent la même phrase et ne sont pas
      touchées, `travaux-industriels-transfert-industriel` et
      `offres-chantier-transfert-de-production`.
      CHECK: curl -s https://migen-site.vercel.app/travaux-industriels/ | grep -c "Nous vous rappelons dans"
      EXPECT: 0
      « Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à
      18h30. » À retirer du héros de cette page.

### G42 — bureau d'études et travaux industriels : « expert technique », pas « technicien »
- [x] FAIT dans la nuit du 13/10, voir G65 pour la mesure complète. La décision
      ÉTAIT inscrite dans `lib/decisions-copie.ts` mais n'arrivait pas aux
      composants PARTAGÉS, faute de leur faire descendre le chemin de la page :
      c'était donc bien un défaut de portage. Le bloc qu'il visait nommément
      dit maintenant « Des experts techniques retenus », vérifié en production
      sur les trois occurrences de la page.
      CHECK: curl -s https://migen-site.vercel.app/offres/bureau-etudes/ | sed 's/<[^>]*>/ /g' | grep -c "Des experts techniques retenus"
      EXPECT: au moins 1
      TRACE DE L'ANCIENNE ENTRÉE
      Il rappelle une décision déjà prise : « on avait dit que sur bureaux
      d'étude et travaux on parlait pas de technicien mais d'expert
      technique ». Le bloc visé : « 10 % / Des techniciens retenus · entretien
      technique et entretien comportemental, résultats partagés avec vous. »
      À VÉRIFIER : cette décision est-elle écrite dans `lib/decisions-copie.ts` ?
      Si oui, elle n'est pas appliquée et c'est un défaut de portage. Si non,
      c'est une décision orale qui n'a jamais été inscrite, et il faut
      l'inscrire pour qu'elle tienne.

### G43 — /travaux-industriels/ : le bloc « Également dans cette offre » manque des prestations
- [x] FAIT. Le bloc passe de 7 à 25 prestations sur les 4 pages qui le portent.
      MESURE : il n'existe que sur 4 adresses, et notre rendu était EXACTEMENT
      celui de la capture, 2 / 1 / 2 / 2. Ce n'était donc pas un défaut de
      portage mais un arbitrage contre la maquette : elle ne range dans ce bloc
      que les offres que son propre routeur redirige, et jamais les pages filles
      de l'offre. 18 prestations étaient orphelines de leur page.
      LES 18 CARTES REPRENNENT LE H1 DE LEUR PAGE CIBLE, verbatim, et leur
      accroche telle que la page cible l'écrit. 4 restent sans accroche parce
      que leur page n'en écrit aucune : vide plutôt que faux.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-prestations-regroupees.mjs
      EXPECT: 4 blocs, 25 prestations, aucune oubliée. La porte refuse aussi
      tout bloc de moins de 2 cartes : il n'aurait pas lieu d'être.
      Il n'en liste que deux, Transfert industriel et Montage industriel.
      QUATRIÈME SIGNALEMENT DU MÊME BLOC, avec G16, G36 et G40. C'est le défaut
      le plus rapporté du site.

### G44 — Mettre le cas Norvège en case mise en avant
- [ ] NON FAIT

### G45 — L'image du bloc « problématique » est partout la même sur les pages expertises
- [x] FAIT, PLAN APPLIQUÉ. Cette entrée disait encore « plan prêt, pas
      encore appliqué » : périmée. Mesuré en production le 13/10, la photo du
      bloc « problématique » des pages expertises est DISTINCTE sur chacune
      (5 pages, 5 photos), et la porte du secteur rend son jeton de succès sur
      475 photos de 66 pages.
      CHECK: bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app | tail -1
      EXPECT: PHOTOS_DANS_LEUR_SUJET
      Même famille que G35.

### G46 — /expertises/electromecanique/ : le bloc d'astreinte ne va pas
- [x] FAIT. Les deux moitiés. La redirection dépannage est partie avec G24. La
      phrase d'astreinte se répétait elle-même sur 55 fichiers, en 18
      formulations, aucune dans les 248 captures : le sujet nommait les périodes
      et le prédicat les renommait. Cause racine, un renommage global de
      « l'astreinte 24/24 et 7/7 » vers la forme longue sans relire les
      prédicats. Règle inscrite dans `lib/decisions-copie.ts`, donc vérifiée des
      deux côtés par toutes les portes. Témoin 10/10, dont 3 contrôles négatifs.
      La phrase « Un moteur en panne maintenant se traite par le dépannage
      industriel » est retirée en local depuis G24 : il la voyait encore parce
      que la poussée n'avait pas eu lieu. Poussée le 12/10 avec 2baf1a4.
      RESTE : la phrase d'astreinte se répète elle-même. « L'astreinte la nuit,
      le week-end et les jours fériés prend le relais la nuit et le week-end. »
      dit deux fois « la nuit et le week-end ».

### G47 — /preuves/ : le filtre doit s'ouvrir sur « Tous », pas sur une catégorie
- [x] FAIT
      MESURE : la maquette ouvre bien sur la première catégorie, sa capture le
      montre. C'est donc un écart assumé contre elle, pas un défaut de portage.
      PIÈGE TRAITÉ : « Tous » porte déjà les 41 fiches ; le rendre en même temps
      que les catégories masquées aurait écrit chaque lien DEUX fois dans le
      HTML. Le rendu tranche maintenant selon l'onglet actif.
      CHECK: curl -s https://migen-site.vercel.app/preuves/ | grep -c 'aria-pressed="true"'
      EXPECT: 1, et ce doit être l'onglet « Tous »

### G48 — Accueil : retirer « 4 agences · +120 techniciens » à côté de « Partout en France »
- [x] FAIT
      LA PORTE ÉTAIT AVEUGLE : `verification-ouverture.tsx` passait au vert sans
      rien remarquer, faute d'assertion sur cette chaîne. Assertion d'absence
      ajoutée, plus son inverse pour que la pastille ne puisse pas disparaître
      en silence. Témoin 2/2.
      CHECK: curl -s https://migen-site.vercel.app/ | grep -c "120 techniciens"
      EXPECT: 0

### G49 — « Migen recrutement » fait trop cabinet, la page devrait se dire « Nous rejoindre »
- [x] FAIT
      MESURE : la capture `maquette/rendu/carriere.json` écrit bien « Migen
      recrutement » en h1Attendu ET en h1Rendu. C'est donc un écart assumé
      contre la maquette, pas un défaut de portage.
      FAIT : h1, chapô, titre de section, titre et description SEO, et un
      libellé de lien dans la fiche alternance.
      LA PORTE VÉRIFIE LES DEUX SENS. Un tableau `ECARTS_TRANCHES` nommé dans
      `verification-carriere.tsx` porte chaque décision datée. Elle exige que
      le nouveau texte soit là ET que l'ancien ait disparu : une tolérance à sens
      unique laisserait « Migen recrutement » revenir en silence. La comparaison
      des titres de section reste une égalité de listes ORDONNÉES, les écarts
      étant appliqués au côté attendu : elle attrape encore un titre manquant,
      en trop ou déplacé. Témoin 2/2.

### G50 — Les 12 px de trop avant chaque section repliée, sur bureau
- [x] FAIT, et c'était un défaut de MOI, trouvé par un agent
      MESURE sur un build de production : `SectionPliableMobile.module.css`
      posait `margin-top: 12px` sur le corps à TOUTES les largeurs. Sur bureau
      la bascule est invisible mais l'espace restait, avant chaque section
      repliée : 120 px de trop sur le hub carrière (10 blocs), 108 px sur les
      guides (9), 39 px sur zéro arrêt (3), 24 px sur une page de preuve (2).
      Aucune capture ne porte cet espace.
      FAIT : les 12 px n'existent plus que sous 880 px, dans le fichier
      PARTAGÉ, donc une seule correction pour tous les gabarits repliés.
      RESTE : sur le gabarit ressource le coût montait à 29-33 px par partie,
      une seconde cause s'y ajoutant (la bascule est une boîte `flex`, ce qui
      empêche la fusion des marges du `h2`). Traité pour ce gabarit, à mesurer
      sur les autres.

### G51 — La vignette de partage répondait 404 sur 247 pages
- [x] FAIT, et c'était un défaut que j'avais poussé moi-même
      MESURE : les 259 balises `og:image` pointaient sur
      `https://migen.fr/assets/…` et migen.fr répond 404 sur chacune, l'ancien
      site Astro y étant encore en ligne. Tout partage de lien sortait en
      bandeau de texte gris.
      LA MESURE QUI AVAIT CONCLU « 191 répondent 200 » AVAIT SUBSTITUÉ L'HÔTE.
      CAUSE : une seule notion servait deux usages opposés. Le canonique doit
      désigner le domaine final ; la vignette doit se télécharger aujourd'hui.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-vignette-partage.mjs
      EXPECT: VIGNETTE_PARTAGE_OK. Témoin 5/5, dont le défaut exact et un
      contrôle négatif.

### G52 — Le résumé des blocs repliés n'a jamais été affiché
- [x] FAIT, 1092 blocs sur 233 pages
      MESURE : le résumé était frère du `<summary>`, donc dans
      `::details-content`, que les navigateurs récents masquent par
      `content-visibility: hidden` quand le bloc est FERMÉ. Or fermé est le seul
      état où il doit paraître.
      DEUX SOURCES INDÉPENDANTES : un relecteur l'a déduit du code, un agent l'a
      MESURÉ en production à 390 px (le paragraphe occupe sa place mais
      `elementFromPoint` ne le renvoie jamais).
      CHECK: curl -s https://migen-site.vercel.app/ressources/fiches-pratiques/5s/ | grep -c '</summary>'
      VÉRIFIÉ EN LIGNE : 7 résumés, 7 dans le `<summary>`, 0 après.

### G53 — Metz et Dijon n'ont pas de photo de leur ville
- [ ] BLOQUÉ SUR MEHDI, il faut les fichiers
      MESURE : 8 hubs sur 10 ont déjà une vraie photo de ville dans
      `components/site/accueil/hubs/`. Metz et Dijon sont les deux seuls sans,
      et retombent sur une scène d'usine, d'où son « la photo de Metz ne
      correspond pas ».
      À DÉPOSER : `components/site/accueil/hubs/metz.jpg` et `dijon.jpg`,
      format paysage, dans l'ordre de grandeur des huit autres (370 à 710 Ko).
      LA PHOTO DE DIJON QU'IL A ENVOYÉE PORTE UN FILIGRANE de banque d'images :
      il faut le fichier sous licence.

### G54 — Le cadrage des photos de hub
- [~] MÉCANISME POSÉ, FICHIER ATTENDU
      MESURE : le cadre fait 400 px de haut pour 320 de large, donc PORTRAIT,
      alors que les photos de villes sont en PAYSAGE. Un `cover` centré n'en
      gardait qu'une bande verticale. Il n'existait aucun réglage par photo, je
      le lui avais dit comme une limite : elle est levée, chaque hub porte
      désormais son point de cadrage.
      ATTENDU : sa photo de Bordeaux, à déposer en
      `components/site/accueil/hubs/bordeaux.jpg`.

### G55 — Une réécriture destructive de 40 fiches d'implantation, annulée avant la poussée
- [x] FAIT
      TROUVÉ PAR LA MESURE, pas par chance : `verifie-interdits` annonçait 241
      formulations interdites contre 15 sur l'état commité. Les anciennes formes
      « Astreinte 24/24 et 7/7 » et « plus de 80 réguliers » étaient revenues.
      LA CAUSE : 40 fiches avaient été régénérées depuis une source plus
      ancienne, perdant leur bloc `seo`, leur `titre_h1` et leur `pastille`,
      2 131 lignes nettes en moins. Restaurées à leur état commité, donc avec
      leurs photos réattribuées.
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-interdits.mjs
      EXPECT: copie conforme aux interdits du contrat
      L'ATTENTE PRÉCÉDENTE ÉTAIT ILLISIBLE : elle réclamait « 15 formulations »,
      un chiffre que cette commande n'affiche jamais. Elle n'écrit un compte que
      lorsqu'elle en trouve ; conforme, elle dit « copie conforme ».

### G56 — Deux pages inventées, retirées
- [x] FAIT
      Deux fiches servaient des adresses ABSENTES de l'index des 248 pages,
      `/implantations/maintenance-industrielle-marseille/` et
      `/implantations/toulouse/bordeaux/`, sans `titre_h1`. Elles ajoutaient au
      site deux pages que personne n'a demandées.
      CHECK: une seule fiche reste hors index, `/offres/maintenance-externalisee/`,
      qui est la source d'une redirection 301 et non une page.

---

## Série 4, le responsive et ses effets de bord, nuit du 13/10

### G57 — Le responsive du site, 136 défauts, maintenant zéro
- [x] FAIT, et c'est la demande « finalise le responsive » du 12/10 au soir.
      Mesuré à 320, 360, 390, 768 et 1280 px sur 22 pages des onze gabarits,
      110 relevés. Départ : 71 débordements et 65 textes coupés. Huit causes
      racines, toutes mesurées au navigateur avant d'être touchées, dont la
      gouttière de page à 40 px (un quart de l'écran à 320 px), 72 grilles dont
      la piste unique était plus large que son conteneur, et les seuils de
      retour à la ligne de la maquette qui n'ont plus de ligne où aller sur un
      téléphone.
      ELLE A ÉTÉ ACCUSÉE À TORT le 13/10 au soir, et le fautif était le
      chronomètre du vérificateur, pas elle. Cette porte mesure 154,9 s contre
      la production, pour un délai d'abandon qui valait 180 s : 25 s de marge.
      Passée au premier passage, elle a été TUÉE au second une ligne avant son
      verdict, et le rapport l'a comptée PROMESSE ROMPUE. Le délai est porté à
      600 s, et une mesure coupée se range maintenant dans sa propre colonne,
      « interrompue », parce qu'une sortie tronquée ne prouve rien.
      CHECK: SITE_URL=https://migen-site.vercel.app node scripts/verifie-responsive.mjs | tail -1
      EXPECT: RESPONSIVE DU SITE CONFORME

### G58 — Les 72 grilles dont la piste dépassait leur conteneur
- [x] FAIT LE 13/10, ROUVERT PAR UNE RÉGRESSION LE SOIR, REFERMÉ DANS LA FOULÉE.
      Les cinq pistes trouvées dans `ressources-hub` sont posées : la porte en
      rend maintenant 0 sur 0 fichier. Son témoin a été rejoué avant la pose,
      6/6 dont trois contrôles négatifs, elle n'a donc pas été assouplie pour
      passer. La leçon reste écrite ci-dessous : un correctif par script ne
      protège QUE les fichiers qui existaient quand il a tourné.
      Détail d'origine, conservé :
      `{ display: "grid", gap: N }` sans colonne déclarée donne une piste
      `auto`, qui ne descend pas sous le `min-content` de son enfant. Mesuré :
      conteneur 196 px, piste 215,281 px sur /implantations/bordeaux/, cinq
      plis dehors de 19 px. Corrigé par `minmax(0,1fr)` sur les 72, par script.
      ROUVERT, ET LA CORRECTION N'A PAS ÉTÉ REJOUÉE : la porte en trouve CINQ
      autres, dans deux fichiers que le correctif n'a jamais vus parce qu'ils
      sont arrivés APRÈS lui.
      `components/site/ressources-hub/CarteBibliotheque.tsx` : 1
      `components/site/ressources-hub/MenuLateral.tsx` : 4
      Le correctif est `a519038`, ces fichiers viennent de `eeee130`, poussé
      huit minutes plus tard le même soir. Quatre des cinq grilles sont des
      `fieldset` du menu latéral des ressources.
      CE N'EST PAS LA PORTE QUI A FAIBLI : son témoin rend toujours 6/6, dont
      trois contrôles négatifs qui prouvent qu'elle sait se taire (colonnes
      déjà déclarées, flux colonne voulu plus large, pas une grille du tout).
      POUR LA FERMER : `node scripts/pistes-de-grille.mjs --applique`, puis
      relancer le témoin. NON LANCÉ ICI : cette commande écrit dans
      `components/`, et cette passe de registre n'y touche pas.
      CHECK: node scripts/pistes-de-grille.mjs
      EXPECT: 0 piste(s) de grille déclarée(s)

### G59 — Aucun titre de section perdu sur grand écran
- [x] FAIT, porte nouvelle, et elle a d'abord servi à me contredire. Une
      tentative de retirer la bascule du parcours clavier par `display: none`
      dans la feuille partagée masquait aussi le titre de section, que la
      bascule porte : 31 bascules sur 31, zéro vide. La porte mesure la seule
      chose qui compte pour le visiteur : le titre d'une bascule masquée se
      retrouve-t-il ailleurs, dans un élément réellement vu. Verdict en
      production : aucun titre perdu, ni avant ni après.
      CHECK: node scripts/verifie-titres-de-section.mjs https://migen-site.vercel.app | tail -1
      EXPECT: AUCUN_TITRE_DE_SECTION_PERDU

### G60 — 21 arrêts de tabulation muets à 1280 px
- [x] FAIT. Au-dessus de 880 px le bloc ne se referme plus : son `<summary>`
      n'ouvre plus rien mais reste focalisable. Retiré du parcours clavier par
      `tabIndex = -1` posé dans le composant, avec écoute de la largeur pour
      qu'une rotation d'écran le lui rende.
      CHECK: SITE_URL=https://migen-site.vercel.app node scripts/verifie-responsive.mjs | grep "bascule(s) focalisable"
      EXPECT: 0 bascule(s) focalisable(s)

### G61 — Du Markdown brut à l'écran, révélé par le résumé enfin peint
- [x] FAIT. Les dix appelants de `SectionPliableMobile` construisaient le
      résumé des blocs repliés avec du texte de corpus NON réduit. Invisible
      jusqu'au 13/10 parce que ce résumé n'était jamais peint ; en le remettant
      dans le `<summary>`, « [Étude de cas EATON : mise en
      production](/preuves/eaton-mise-en-production/) » s'est affiché crochets
      et parenthèses compris sur les pages d'offre en téléphone. `enTexteNu`
      est posé dans le seul composant qui peint ce résumé, donc un onzième
      appelant est couvert d'office.
      CHECK: bun run verifie:markdown
      EXPECT: 6 composants rendent le corpus sans sa syntaxe

### G62 — La porte du pied de page annonçait zéro colonne
- [x] FAIT. Elle lisait la chaîne EXACTE `style="display:grid;gap:9px"`. La
      déclaration de colonne de G58 a changé ce texte, la lecture n'a plus
      rien trouvé, et la porte a dit « zéro colonne de pied de page » alors que
      les six étaient rendues normalement. Elle exige toujours une GRILLE, ce
      qui est le fond du contrôle, sans exiger la liste ni l'ordre de ses
      propriétés, qui n'en est pas. Réparée, pas assouplie.
      CHECK: bun run verifie:pied
      EXPECT: 26 libellés de navigation et 4 colonnes de maillage

### G63 — verifie-offre-rendu, de 4 anomalies à zéro
- [x] FAIT. Trois venaient de `<AppelFinal>` enveloppé dans un `<div
      id="mgx-form">`, ce qui sortait la section finale des enfants directs du
      `<main>` : mesuré sur 4 pages, 16 sections vues au lieu de 16, et le
      défaut valait pour les 21 pages du gabarit. L'ancre est passée en prop.
      La quatrième est la réponse de FAQ invisible, arbitrage de Mehdi du 11/10
      (aucune question ouverte au chargement) : déclarée en trou AVEC un
      drapeau `dansLeHtml` et un contrôle NOUVEAU, qui exige que la phrase
      reste servie dans le HTML. Contrôle négatif joué : la porte tombe quand
      la phrase n'y est plus.
      SA COMMANDE VISAIT LE SERVEUR DE DÉV, corrigée le 13/10 au soir. Sans
      `SITE_URL`, cette porte retombe sur `http://localhost:4340/`, et nos
      propres règles de travail disent que ce serveur sert du contenu PÉRIMÉ et
      qu'il faut mesurer en production. C'est la troisième porte du registre
      prise sur ce même défaut, après G2 et G20.
      PIRE, ELLE NE SE CONTENTE PAS D'ÊTRE FAUSSE : quand la page n'est pas
      servie, elle meurt sur un `throw`, 0 octet de sortie standard contre 654
      de pile d'appels. Le vérificateur l'a donc annoncée PROMESSE ROMPUE au
      passage du 13/10 au soir, alors qu'elle passe en 2 s dès qu'on lui donne
      une adresse qui répond. Une commande qui plante n'est pas une preuve, ni
      dans un sens ni dans l'autre.
      ELLE SAIT TOUJOURS ÉCHOUER, vérifié en la pointant sur une adresse qui ne
      sert pas la page : code 1. Et pointée sur la production, elle rend le même
      verdict que sur le dév, 16 sections sur 16 et 231 lignes comparées : le
      contrôle n'est pas assoupli, il est seulement mesuré au bon endroit.
      CHECK: SITE_URL=https://migen-site.vercel.app bun run verifie:offre-rendu
      EXPECT: rendu d'offre conforme à la référence

### G64 — Le plan du site publiait 4 adresses mortes
- [x] FAIT. Les deux fiches inventées de G56, plus deux autres sources de
      redirection de la refonte. Cause : le plan lisait la table `pages` sans
      savoir qu'un chemin peut être la SOURCE d'une redirection. Corrigé par
      croisement avec l'index des redirections, celui que le proxy applique :
      une redirection ajoutée demain sort sa source du plan sans qu'on y
      touche. `/plan-du-site/` posait les mêmes 4 liens morts, c'est réglé
      aussi. Le remède de fond, retirer les lignes de `pages`, attend B2.
      CHECK: node scripts/verifie-liens.mjs https://migen-site.vercel.app | tail -1
      EXPECT: tous les liens internes mènent quelque part

### G65 — « expert technique » sur les composants partagés
- [x] FAIT, et mesuré des deux côtés. 39 occurrences de « technicien » sur les
      dix pages de bureau d'études et travaux, 20 après. Les 20 restantes ont
      chacune leur motif et AUCUNE n'est écrasée : 11 sont le nom de l'offre
      /offres/residence/ et son résumé, 3 le réseau de hubs que CLAUDE.md §9
      nomme lui-même « dix hubs de techniciens », 2 une citation d'étude de
      cas, 2 les techniciens DU CLIENT.
      À ARBITRER PAR MEHDI, et c'est le seul vrai doute : le chapô de
      /travaux-industriels/ dit « Des techniciens de maintenance qui démontent,
      lèvent, remontent et rebranchent ». C'est le profil déployé, donc dans sa
      cible, mais sous le nom exact du métier. « Experts techniques de
      maintenance » se dit mal, « experts techniques » seul perd la spécialité.
      SA COMMANDE VISAIT LE SERVEUR DE DÉV, corrigée le 13/10 au soir, et c'est
      la QUATRIÈME porte du registre prise sur ce défaut après G2, G20 et G63.
      Sans `SITE_URL`, elle retombe sur `http://localhost:4340/`, que nos
      propres règles déclarent périmé. Elle est passée deux fois puis a rendu un
      autre compte au troisième passage, sans que rien n'ait bougé au dépôt.
      Pointée sur la production, elle rend 20 de façon stable, trois passages
      sur trois.
      ET ELLE RENDAIT UN TOTAL QU'ELLE N'AVAIT PAS MESURÉ. Une page injoignable
      posait un code de sortie 2 puis passait à la suivante, en imprimant
      malgré tout un TOTAL, dans les mêmes mots qu'une mesure complète. Les dix
      pages hors d'atteinte, elle annonçait « 0 TOTAL dans le <main> » : un
      compte qui ressemble à un triomphe alors qu'elle n'avait rien lu. Une
      mesure incomplète ne rend plus de total, elle dit « MESURE NON
      CONCLUANTE » et nomme les pages fautives.
      TÉMOIN DE CE CORRECTIF, les deux sens : dix pages injoignables rendent
      « MESURE NON CONCLUANTE », aucun total, code 2 ; la production rend
      toujours 20. Le contrôle n'est pas assoupli, il refuse seulement de
      conclure sans données.
      CHECK: SITE_URL=https://migen-site.vercel.app node scripts/mesure-expert-technique.mjs
      EXPECT: 20

### G66 — Deux portes qui lisaient mal, réparées
- [x] RÉPARÉES LE 13/10, PÉRIMÉES LE SOIR, REMISES À JOUR DANS LA FOULÉE.
      La mention de prospection donnée par Mehdi le 13/10 au soir est déclarée
      dans la liste `AJOUTS` de `verification-secteurs-hub`, comme chaîne
      EXACTE et non comme motif : la porte reste incapable de laisser passer
      une phrase voisine. Contrôle négatif joué, une phrase non déclarée
      ajoutée au formulaire la fait tomber ; contrôle positif joué aussi.
      La mention a été sortie dans son propre paragraphe au passage : accolée
      à la précédente, elle produisait un fragment commençant par « . Vos
      informations » que plus aucune porte ne reconnaissait.
      Détail d'origine, conservé :
      `verification-ville` : une virgule. La capture écrit « L'astreinte,
      en option, prend le relais », le corpus l'écrivait sans virgules. C'est
      le corpus qu'on aligne, la virgule vient de sa copie. 74/74 conformes.
      `verification-secteurs-hub` : elle ne déshabillait PAS les ornements
      mobiles, d'où 6 faux écarts sur du texte que la capture de bureau n'a
      aucune raison de porter. Branchée sur le module partagé à comptage de
      profondeur, quatrième porte à l'utiliser. Son témoin `--controle` est
      nouveau, avec deux contrôles négatifs ÉPROUVÉS : une lecture paresseuse
      et une lecture gloutonne reposées à la main le temps d'une mesure, toutes
      deux vues.
      PÉRIMÉE DEPUIS `488fff5`, poussé le 13/10 à 22h42, et c'est la porte qui
      est en retard, pas le site. Ce commit pose la case de consentement du
      formulaire partagé, donc une phrase nouvelle à l'écran : « J'accepte que
      Migen utilise ces informations pour traiter ma demande et me
      recontacter. », écrite une seule fois en
      `components/formulaire/FormulaireContact.tsx:251`.
      Elle est ABSENTE de `maquette/rendu/secteurs.html`, vérifié, et c'est
      normal : la maquette ne porte aucune case à cocher. La porte compte donc
      deux faux écarts, au « 01 Héros » et au « 10 Appel final », les deux
      seules sections de la page qui portent ce formulaire.
      CE QUI MANQUE est une ligne dans sa liste `AJOUTS`, celle des textes
      rendus volontairement absents de la capture. Elle y déclare déjà la
      mention RGPD passive et le champ « Site web », mais pas le libellé de la
      case. NON POSÉE ICI : le fichier est dans `components/`, où cette passe
      ne touche pas. Ni le formulaire ni la copie ne sont à corriger.
      CHECK: bun components/site/secteurs-hub/verification-secteurs-hub.tsx
      EXPECT: 16 sections conformes

### G67 — Une erreur eslint préexistante, à arbitrer
- [ ] PAS FAIT, DÉLIBÉRÉMENT. `components/formulaire/ChampEntreprise.tsx:101`
      appelle `setPropositions([])` en synchrone dans un effet. C'est la seule
      erreur eslint du dépôt, elle est antérieure à cette nuit, et le fichier
      n'a été touché par personne. Le remède naturel, déplacer l'effacement
      dans le minuteur, décale de 250 ms la disparition de la liste
      d'autocomplétion : c'est un comportement de FORMULAIRE, et la règle est
      de ne pas y toucher. À trancher par Mehdi.
      CHECK: bunx eslint components/formulaire/ChampEntreprise.tsx
      EXPECT: 1 error


---

## Série 5, TOUTES les demandes de Mehdi du 13/10

Inscrite le 13/10 à 16h45, après son « il manque tout ce que je t'ai demandé
aujourd'hui en fait ». Il avait raison : rien de cette journée n'était au
registre. Chaque entrée porte la commande qui décide de son état.

### D1 — « la version mobile est toujours pas dispo côté front, j'ai toujours tous les blocs »
- [ ] PAS FAIT. Mesuré : l'accueil fait 28 945 px de haut à 390 px avec ses 21
      sections déroulées, la maquette du client 2 871. Le parcours par le
      problème, lui, EST en ligne et fonctionne.
      MESURE DU 13/10 AU SOIR, en production : 144 section(s) sans repli sur
      207 mesurées, 18 pages touchées. La pire est `/a-propos/equipe/`, 11 sur
      12, puis `/offres/` à 13 sur 17. Le chantier est donc bien ouvert, et sa
      porte le confirme : rien n'est maquillé ici, l'attente reste le zéro
      visé.
      SON ANCIENNE COMMANDE POUVAIT PASSER AU VERT À FAUX, et c'est pour ça
      qu'elle change. Elle gardait TOUTES les lignes « section(s) sans repli »,
      une par page, et l'attente « 0 » se contentait d'un zéro n'importe où
      dans ce paquet. Rejoué : avec une seule page propre affichant « 0
      section(s) sans repli » et 144 sections rouges ailleurs, la lecture rend
      vrai. La porte imprime déjà un JETON DE SUCCÈS qu'elle ne sort que si
      tout est replié, comme celle de G2 : c'est lui qu'il faut attendre.
      CHECK: node scripts/verifie-repli-mobile.mjs https://migen-site.vercel.app | tail -1
      EXPECT: TOUTES_LES_SECTIONS_SE_REPLIENT

### D2 — « ÇA DOIT ÊTRE SUR TOUTES LES PAGES COMME SUR LA MAQUETTE »
- [~] DÉPASSÉ PAR SA PROPRE LIVRAISON, et c'est à son avantage. Il demandait de
      replier les sections partout. Dix minutes plus tard il a livré la maquette
      mobile, qui n'est pas la page de bureau repliée mais une autre mise en
      page. Replier les 186 sections aurait raccourci la mauvaise page au lieu
      de servir la bonne. L'arbitrage est donc absorbé par D1.

### D3 — /carriere/ : « tu affiches le numéro de téléphone, c'est dégueulasse »
- [x] FAIT, vérifié en production. La carte « Contact direct » du bloc « Nos
      informations pratiques » garde ses horaires et ne montre plus le numéro.
      CHECK: curl -s https://migen-site.vercel.app/carriere/ | sed 's/<[^>]*>/ /g' | grep -o "Contact direct  *Du lundi au vendredi"
      EXPECT: Contact direct Du lundi au vendredi

### D4 — /carriere/ : « le bloc est mal agencé »
- [x] FAIT. Les cartes s'étiraient à la hauteur de la plus longue, laissant près
      de 200 px de vide sous les cartes 04 et 06. Sa propre capture déclare
      `align-items: start` sur cette grille, nous ne l'avions pas porté.
      CHECK: grep -c "alignItems: \"start\"" components/site/metier/SectionsFicheMetier.tsx
      EXPECT: au moins 1

### D5 — /implantations/ : « il manque du texte sur la card 3 » des deux blocs
- [x] FAIT, vérifié en production. Problématiques 03 passe de 35 à 132
      caractères, l'offre 03 de 67 à 118 avec son intitulé revenu. Les phrases
      étaient rangées en trous déclarés sous l'ancienne règle des prix, caduque
      depuis son arbitrage du 09/10.
      CHECK: curl -s https://migen-site.vercel.app/implantations/ | grep -c "Loin d.un bassin dense"
      EXPECT: au moins 1

### D6 — Le colis du 13/10 : Ressources v2 et Implantations
- [ ] ANALYSÉ, PAS PORTÉ. 40 écarts relevés, 8 confirmés par relecture adverse,
      20 réfutés. Ressources v2 est une refonte de gabarit dont le blocage est
      la DONNÉE : les 4 thèmes, les 14 étiquettes et les durées de lecture
      n'existent pas au dépôt. Implantations n'est pas un gain partout : sa
      mosaïque fait 4 292 px au téléphone contre 537 aujourd'hui, et six de ses
      dix photos sont des aperçus filigranés.
      CHECK: ls maquette/colis-13-10/ | wc -l | tr -d ' '
      EXPECT: 5

### D7 — Retour de Nathan : « /nous-connaitre/ ultra spé résidence »
- [~] UNE FAUTE CORRIGÉE, SIX ARBITRAGES OUVERTS. La frise disait « Migen » là
      où son arbitrage du 09/10 impose « Migen Travaux » : c'était la seule
      phrase de la page nommant la marque qui porte les deux offres hors
      placement. Les six autres points sont sa copie, écrits avec leurs options
      dans docs/NOUS-CONNAITRE-ARBITRAGES.md.
      CHECK: curl -s https://migen-site.vercel.app/nous-connaitre/ | grep -c "Migen Travaux lance les travaux industriels"
      EXPECT: au moins 1

### D8 — « Refais moi le doc rapport d'avancement, à jour toutes les 10 minutes »
- [x] FAIT. docs/AVANCEMENT.md, dont le bloc de chiffres est réécrit par un
      script qui MESURE au lieu de recopier. Mise à jour programmée toutes les
      dix minutes.
      CHECK: node scripts/rapport-avancement.mjs --montre | grep -c remesureLe
      EXPECT: au moins 1

### D9 — « Une liste de tout ce dont tu as besoin pour terminer »
- [x] FAIT, et vérifiée point par point pour ne pas servir du périmé. La
      vérification a d'ailleurs invalidé un bloquant annoncé : les deux pages
      légales répondent 200, pas 404 comme le disait le document du 02/10.
      CHECK: curl -s -o /dev/null -w "%{http_code}" https://migen-site.vercel.app/mentions-legales/
      EXPECT: 200

### D10 — « Normalement tu as l'id du formulaire »
- [ ] IL MANQUE, ET C'EST LE POINT LE PLUS GRAVE DU SITE. Le portail 148000737
      est en dur dans le code, mais `HUBSPOT_FORM_ID` est absent des variables
      Vercel, et le code renvoie 502 au visiteur quand il manque. Aucun
      formulaire ne dépose de lead en production.
      CHECK: grep -c "HUBSPOT_FORM_ID absent de l'environnement" app/api/lead/route.ts
      EXPECT: au moins 1

### D11 — « Donne-moi le lien pour Supabase »
- [x] FAIT : https://supabase.com/dashboard/project/rmthzplyrbifoeaxfiwn
      CHECK: grep -o "rmthzplyrbifoeaxfiwn" .env.local | head -1
      EXPECT: rmthzplyrbifoeaxfiwn

### D12 — « Pour Bordeaux va chercher sur Vercel »
- [x] RIEN À FAIRE, la photo était déjà là. hub-bordeaux.jpg est sous licence au
      dépôt depuis le 09/10, 2000 x 1335. Fichier envoyé pour confirmation.
      CHECK: ls components/site/accueil/hubs/bordeaux.jpg
      EXPECT: bordeaux.jpg

### D13 — « Pour Dijon mets des vignes en Bourgogne » et « pour Metz trouve un truc »
- [ ] CHOISIES, PAS LIVRÉES. Metz : la cathédrale par RossHelen, même
      photographe et même série que Nantes et Bordeaux. Dijon : Meursault, en
      Côte-d'Or, seule photo de vignes authentiquement bourguignonne du
      catalogue. Il manque les versions sous licence : le catalogue ne rend que
      l'aperçu de 600 px filigrané.
      CHECK: grep -c "hub-metz.jpg\|hub-dijon.jpg" docs/PHOTOS-VILLES-ENVATO.md
      EXPECT: au moins 2

### D14 — « TeamTailor, je ne peux pas la publier, trouve une solution »
- [x] RÉSOLU, ET IL N'A RIEN À PUBLIER. L'offre 8200692 de son propre compte est
      en statut `unlisted` et porte 79 candidatures actives : une offre non
      listée ne part pas sur les jobboards et reçoit quand même. Son offre
      8528454, créée pour le site, est en `draft` ; un seul réglage,
      `draft` vers `unlisted`, et elle reçoit. Il ne manque que la clé d'API.
      CHECK: grep -c "TEAMTAILOR_API_KEY ou TEAMTAILOR_JOB_ID manquant" lib/teamtailor.ts
      EXPECT: au moins 1

### D15 — « Les traceurs, tu parles de quoi exactement »
- [x] RÉPONDU. Six variables, toutes facultatives, aucune ne bloque la mise en
      ligne : GA4, Google Ads, LinkedIn, pixel OpenAI, Search Console et le
      secret des tâches planifiées. Toutes conditionnées au consentement.
      CHECK: grep -c "NEXT_PUBLIC_GA\|NEXT_PUBLIC_GOOGLE_ADS_ID\|NEXT_PUBLIC_LINKEDIN_PARTNER_ID\|NEXT_PUBLIC_OPENAI_PIXEL_ID\|GSC_SERVICE_ACCOUNT_JSON\|CRON_SECRET" .env.example
      EXPECT: au moins 6

### D16 — « Tu fais au mieux pour la version mobile »
- [~] PREMIER PAS FAIT. Le nom de l'offre est posé sur les six cartes du
      parcours, comme sa maquette. La carte n'est pas devenue un simple lien
      parce que les six réponses repliées font environ 900 mots qui n'existent
      nulle part ailleurs : mesuré, 0 à 2 extraits sur 6 se retrouvent sur les
      pages d'offre. Un défaut de contraste évité au passage, 2,3 pour 1 corrigé
      en 8,07.
      CHECK: curl -s https://migen-site.vercel.app/ | grep -c "nomOffre"
      EXPECT: au moins 1

### D17 — « C'est quoi le mieux, je demande à Design »
- [x] RÉPONDU, trois consignes mesurées : une vraie page par adresse, replier
      sans retirer, et dessiner les onze gabarits au lieu de cinq écrans. Fondé
      sur le fait que sa maquette mobile porte 266 boutons pour 3 liens et sert
      465 à 586 mots là où nos pages en servent 1 981 à 2 250.

### D18 — « Mets le turbo sur tout le reste »
- [~] EN COURS. Quatre lots en parallèle sur des fichiers disjoints : les
      phrases perdues par la purge des prix, les six cartes d'offre de
      /nous-connaitre/, le raccourcissement de l'accueil mobile, et la remise au
      vert des portes rouges. Une relecture adverse derrière.

### D19 — « Déploie dès qu'un changement est fait »
- [x] FAIT. Chaque lot est poussé dès qu'il est mesuré, au lieu d'être groupé.
      Le dépôt déploie à chaque poussée, vérifié trois fois le 13/10 : le
      changement est en ligne en une minute et demie.
      SA COMMANDE NE TENAIT QU'UN JOUR, corrigée le 13/10 au soir. Elle
      comptait les commits « depuis aujourd'hui 00:00 » : verte le jour où elle
      a été écrite, elle rendait 0 le lendemain matin et accusait à tort une
      promesse qui, elle, était tenue. La journée visée est figée, et la preuve
      vaut donc pour toujours : 27 commits le 13/10.
      CHECK: git log --since=2026-10-13T00:00 --until=2026-10-14T00:00 --oneline | wc -l | tr -d ' '
      EXPECT: au moins 9

---

## Bloqué sur Mehdi, rien à faire de notre côté

### B1 — Publier l'offre TeamTailor 8528454
- [ ] Elle est en brouillon, son titre public est encore « Copy of Technicien de
      maintenance - France entière F/H ». Et poser `TEAMTAILOR_JOB_ID=8528454`
      et `TEAMTAILOR_API_KEY` sur Vercel. Sans ça, G22 rend un 503 honnête au
      lieu de déposer la candidature.

### B2 — Clé de service Supabase
- [ ] Bloque aussi 3 adresses périmées sur `/plan-du-site/`.

### B3 — Trois champs légaux
- [ ] Mentions légales.

### B4 — 38 accords de logo
- [x] LEVÉ le 12/10 : Mehdi confirme que les accords écrits sont obtenus.

---

## Règles de travail qu'il a posées, à ne jamais relâcher

- Ne JAMAIS réécrire sa copie. Signaler, pas corriger.
- Aucune donnée inventée. Vide plutôt que faux.
- Jamais de tiret cadratin dans un texte visible.
- Aucun prix, aucun délai chiffré sauf « rappel dans l'heure ».
- Jamais « intérim », « notamment », « sur mesure », « clé en main », « régie »,
  « levier », « mise à disposition », « sans engagement », « concrètement »,
  « incontournable », « découvrez ».
- Ne pas toucher aux formulaires.
- La référence est le rendu figé de la maquette, `maquette/rendu/<cle>.html`.
  Comparer AVANT de déclarer un défaut : nous avons déjà « corrigé » du
  conforme.
- Les portes se forment, jamais ne s'aveuglent. Chacune doit prouver qu'elle
  sait échouer.
- Le serveur de dév du port 4340 sert du contenu périmé. Mesurer en production.
- Après toute modification d'une fiche : `node scripts/relis-relais.mjs`.
