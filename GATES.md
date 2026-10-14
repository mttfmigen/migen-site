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

Requalification du 14/10 : les sept entrées « à requalifier » (case non
cochée, porte qui passe) ont chacune été remesurées, en production ou au
dépôt. G35, D6, D7 et D10 sont faites, cochées, et portent désormais une
commande qui mesure le correctif lui-même, contre-essai à l'appui. D16 reste
ouverte avec une porte qui échoue aujourd'hui. G67 et D13, ainsi que la partie
copie de D7, sont des décisions ou des achats de Mehdi : déplacées en B5, B6
et B7. Chaque entrée garde son ancien texte, son ancienne commande en clair et
un paragraphe daté « REQUALIFIÉE LE 14/10 ».

Passe du 14/10 après-midi, lot « rapport-avancement », seul lot autorisé à
écrire ce registre ce jour-là. Le registre rejoué vers 14h15 rendait 48
promesses : 37 tenues, 6 PROMESSES ROMPUES (G20, G57, G58, G59, G63, G66), 3
commandes plantées (G60, D15, B7), 2 chantiers ouverts (D1, D16). Les six
ruptures sont inscrites EN PLACE, datées, avec ce qui les a causées et le
chantier qui les solde ; aucune attente n'a été touchée et aucun composant
corrigé ici. Quatre d'entre elles (G20, G59, G63, G66) viennent du même commit,
`5c7e765`, les titres que Mehdi a donnés aux trois blocs sans titre.
ONZE COMMANDES VISAIENT L'ARBRE PRINCIPAL, resté à 93da90c (14/10 11h17), 35
commits derrière la branche déployée : G2, G10, G16, G20, G24, G36, G40, G43,
G51, G55 et B7. Elles commençaient toutes par `cd "/Users/mehdi/Landing
lovable/migen-site" &&`, et mesuraient donc un dépôt que personne ne voit,
quel que soit l'arbre d'où l'on lançait le vérificateur. Ce `cd` est retiré
le 14/10, le reste de chaque commande et son attente sont inchangés : elles
se lancent maintenant depuis l'arbre où tourne le vérificateur, comme toutes
les autres. Cela a révélé une septième rupture, G55, inscrite à son entrée
(les huit autres tiennent depuis l'arbre à jour, 14h43). D8 repasse
en [ ]. La série 6 inscrit les demandes du 14/10.

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
      CHECK: bun scripts/verifie-photos-du-secteur.mjs https://migen-site.vercel.app
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
      CHECK: node -e "const{NOMBRE_PAGES}=require('./lib/photo-par-page.ts');console.log(NOMBRE_PAGES)" 2>/dev/null || grep -c '": "/assets/photos/' lib/photo-par-page.ts
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
      CHECK: node scripts/verifie-prestations-regroupees.mjs
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
      CHECK: SITE_URL=https://migen-site.vercel.app node scripts/verifie-blocs-pliables.mjs
      EXPECT: 1092 blocs sur 233 pages
      LE COMPTE A MONTÉ depuis que ce point a été écrit, de 932 à 1092 : les
      gabarits repliés après coup s'y sont ajoutés. Un EXPECT périmé est un
      mensonge tranquille, il est corrigé. Et sans `SITE_URL` la porte vise le
      serveur de dév, qui ne tourne pas : elle rendait « MESURE NON CONCLUANTE ».
      ROMPUE LE 14/10 VERS 14H15, inscrite telle quelle. Remesurée à 14h27
      depuis un arbre à jour : « 163 defaut(s) sur 1851 bloc(s)
      repliable(s) », code 1. Le défaut nommé est le même partout : « Ils nous
      font confiance » n'a quasiment pas de corps dans le HTML servi
      (`/bureau-etudes/`, `/expertises/`, `/expertises/mecanique/`,
      `/expertises/automatisme/siemens/`, et la suite). Cause au dépôt :
      `5c7e765` (14/10, 14h05) replie au téléphone la bande de logos sous le
      titre donné par Mehdi, et le corps de ce pli est fait de logos, pas de
      phrases.
      L'ATTENTE EST PÉRIMÉE ELLE AUSSI, et elle n'est pas touchée ici : la
      porte compte aujourd'hui 1851 blocs, et non 1092. Remise au vert, elle
      ne rendrait toujours pas « 1092 ». Le chantier qui la solde la remet au
      compte qu'il mesure, contre-essai à l'appui.
      QUI LA SOLDE : le chantier Mobile vague 2, lot des titres des trois
      blocs (`components/site/offre/LogosClients.tsx`, `Reassurance.tsx`,
      `components/site/offres/EncartResidence.tsx`, fichiers pris par ce
      chantier). À lui de trancher si une bande de logos décrits compte pour
      un corps, ou si le pli doit porter du texte.
      COMMANDE RENDUE À SON LIEU LE 14/10 : elle commençait par `cd
      "/Users/mehdi/Landing lovable/migen-site" &&`, l'arbre principal resté à
      93da90c, 35 commits derrière la branche déployée. Elle mesurait donc la
      porte d'un dépôt en retard. Elle se lance maintenant depuis l'arbre où
      tourne le vérificateur, comme toutes les autres, et la rupture tient
      depuis l'arbre à jour.

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
      CHECK: node scripts/retire-redirection-depannage.mjs
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
- [x] FAIT, REQUALIFIÉE LE 14/10 (paragraphe daté en fin d'entrée). Cette
      entrée portait [~] et disait : « PLAN PRÊT, PAS ENCORE APPLIQUÉ. 385 photos jugées image ouverte, 64 disqualifiées, trois sceptiques en ont annulé 20 : 44 restent interdites sur une page commerciale. Vivier propre de 341. Les plans de réattribution sont rendus par famille de pages. »
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
      ANCIENNE COMMANDE, retirée du passage le 14/10 et gardée ici pour
      l'histoire : `cd "/Users/mehdi/Landing lovable/migen-site" && node
      scripts/inventorie-photos-hors-sujet.mjs | sed -n 's/^MANQUEMENTS ÉCRITS
      EN DUR : //p'`, attente « 0 ». Elle passait sous une case [~], et le
      vérificateur la classait donc « à requalifier » : elle mesurait un état
      (aucune photo écrite en dur dans un composant), pas le correctif.
      REQUALIFIÉE LE 14/10 : FAIT, et mesuré sur le correctif lui-même. Le
      discriminant que cette entrée réclamait, le SUJET DOMINANT, est outillé :
      la porte existait depuis le 12/10 (`2578aee`) mais criait au loup dix
      fois sur onze, et c'est le 14/10 (`8b630f6`) qu'elle est devenue
      fiable, la onzième, une vraie photo d'avion sur
      `/expertises/mecanique/lubrification/`, corrigée au passage.
      `scripts/verifie-photo-sujet.mjs` porte les 44 photos
      dont le sujet n'est pas de l'industrie (16 d'aviation, 17 de bois, 4 de
      laboratoire, 1 de bureau, 6 autres), établies image ouverte, et refuse leur présence sur
      toute page commerciale, /offres/ en tête. Mesure du 14/10 : 249 pages
      lues, 106 adresses commerciales sous contrôle, aucun manquement. En
      production, `/offres/` ne sert AUCUNE des 44 (inventaire du 14/10, #3).
      La commande tient les deux moitiés : la porte du dépôt, puis le HTML
      servi de `/offres/` contre la liste même de la porte. Son jeton ne sort
      que si les deux passent.
      CONTRE-ESSAIS JOUÉS LE 14/10, la commande sait échouer : (1) la même
      commande pointée sur `/secteurs/aeronautique/`, où l'avion est chez lui,
      compte 68 occurrences des 44 photos et ne sort pas le jeton, code 1 ;
      (2) `node scripts/verifie-photo-sujet.mjs --controle` rend 4/4 fautes
      injectées détectées (dont un avion sur /offres/), 2/2 exceptions de
      marché respectées, 1/1 hors contrôle assumé.
      CHECK: node scripts/verifie-photo-sujet.mjs && n=$(curl -s https://migen-site.vercel.app/offres/ | grep -oFf <(grep -oE 'fichier: "[^"]+"' scripts/verifie-photo-sujet.mjs | cut -d'"' -f2) | wc -l | tr -d ' ') && echo "photos hors industrie sur /offres/ en ligne : $n" && [ "$n" = 0 ] && echo OFFRES_SANS_PHOTO_HORS_INDUSTRIE
      EXPECT: OFFRES_SANS_PHOTO_HORS_INDUSTRIE

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
      CHECK: node scripts/verifie-prestations-regroupees.mjs
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
      CHECK: node scripts/verifie-prestations-regroupees.mjs
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
      CHECK: node scripts/verifie-prestations-regroupees.mjs
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
      CHECK: node scripts/verifie-vignette-partage.mjs
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
- [x] FAIT LE 14/10, avec B7 : les deux photos sous licence sont déposées dans
      `components/site/accueil/hubs/metz.jpg` et `dijon.jpg` et servies par les
      dix cartes de hub. Preuve et commande en B7.
      Avant le 14/10 : BLOQUÉ SUR MEHDI, il faut les fichiers
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
      CHECK: node scripts/verifie-interdits.mjs
      EXPECT: copie conforme aux interdits du contrat
      L'ATTENTE PRÉCÉDENTE ÉTAIT ILLISIBLE : elle réclamait « 15 formulations »,
      un chiffre que cette commande n'affiche jamais. Elle n'écrit un compte que
      lorsqu'elle en trouve ; conforme, elle dit « copie conforme ».
      ROMPUE, RÉVÉLÉE LE 14/10 À 14H43 en rendant la commande à son lieu (voir
      l'en-tête) : depuis l'arbre principal, resté à 93da90c (11h17), elle
      passait ; depuis la branche déployée, « 1 formulation(s) interdite(s)
      dans la copie », code 1, `lib/decisions-copie.ts:548`. C'est la règle
      `TOURNAIRE` posée par `b4cc3e2` (14/10, 13h17, harmonisation mobile) :
      elle RETIRE de la copie une formulation interdite du contrat, mais son
      motif l'écrit en clair dans le code, que cette porte lit. La copie servie
      n'est pas en cause d'après ce relevé ; la porte tombe quand même.
      QUI LA SOLDE : le chantier Mobile vague 2, auteur de `b4cc3e2`, qui
      tranche entre écrire ce motif autrement ou le déclarer à la porte, sans
      l'aveugler. Non corrigé ici.

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
      ROMPUE LE 14/10 VERS 14H15. Remesurée à 14h32 depuis un arbre à jour :
      « MESURE NON CONCLUANTE : 70 relevé(s) sur 110 », code 1. La porte ne
      conclut pas : sur 40 relevés, un ou deux blocs repliables arrivent
      OUVERTS du serveur sous 880 px (`/offres/` et `/offres/zero-arret/` à
      deux blocs ; `/carriere/`, `/offres/bureau-etudes/`, quatre pages
      d'expertise, `/guides/choisir-une-entreprise-de-maintenance/` et
      `/ressources/fiches-pratiques/5s/` à un bloc ; à 320 et 360 px). Le
      vérificateur l'a comptée rompue et non plantée parce que `| tail -1` ne
      lui montre que la dernière ligne, où le mot « MESURE NON CONCLUANTE »
      n'est pas.
      Cause NON PROUVÉE ici : des plis ajoutés le 14/10 par la vague mobile
      qui arrivent ouverts. Premier suspect à vérifier, `5c7e765`.
      QUI LA SOLDE : le chantier Mobile vague 2.

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
      ROMPUE LE 14/10 VERS 14H15, ET C'EST LA MÊME LEÇON QUE LE 13/10 AU SOIR.
      Remesurée à 14h26 : « 3 piste(s) de grille déclarée(s) sur 2
      fichier(s) ». `components/site/cocon/PastillesCocon.tsx` : 2 (`6a1b996`,
      14/10 11h38, les pastilles du cocon mobile) ;
      `components/site/preuve/CarrouselRealisations.tsx` : 1 (`efeeb49`, 14/10
      12h20, le carrousel des études de cas). Deux fichiers arrivés après le
      correctif `a519038`, que le script n'a donc jamais vus.
      QUI LA SOLDE : le chantier Mobile vague 2, auteur des deux fichiers :
      `node scripts/pistes-de-grille.mjs --applique`, puis le témoin. Non
      lancé ici : il écrit dans `components/`.

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
      ROMPUE LE 14/10 VERS 14H15. Remesurée à 14h27 : « 1 titre(s) de
      section perdu(s) sur 1 page(s) », `/secteurs/aeronautique/`,
      « certifications et équipe » perdu à 1280 px. C'est l'un des trois
      titres que Mehdi a donnés le 14/10 aux blocs sans titre (`5c7e765`) : il
      vit dans la bascule du téléphone, masquée au bureau, et ne se retrouve
      nulle part ailleurs à 1280 px, ce que la porte refuse.
      QUI LA SOLDE : le chantier Mobile vague 2, lot des titres des trois
      blocs. À lui de trancher, porte ou composant : la capture de bureau ne
      porte pas ce titre, la demande de Mehdi le pose au téléphone.

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
      COMMANDE CORRIGÉE LE 14/10, et le site n'y est pour rien. Elle était
      `bun run verifie:pied` tout court : sans `SITE_URL`, la porte vise
      `http://localhost:4340`, le serveur que nos propres règles déclarent
      périmé (même défaut que G63 et G65 le 13/10). Au passage du 14/10 aucun
      serveur n'y tournait, la porte est morte sur « localhost:4340
      injoignable », et le vérificateur l'a comptée PROMESSE ROMPUE et non
      plantée : il reconnaît la pile d'une exception à la signature
      « Node.js v… », et `bun` signe « Bun v1.3.14 ». Pointée sur la
      production, la même porte rend mot pour mot l'attente : 26 libellés, 4
      colonnes, 52 liens internes à 200, témoins d'échec tombés.
      CHECK: SITE_URL=https://migen-site.vercel.app bun run verifie:pied
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
      ROMPUE LE 14/10 VERS 14H15. Remesurée à 14h27 sur `/offres/residence/` :
      « 2 anomalie(s) », « section 2 : titre « ILS NOUS FONT CONFIANCE » au
      lieu de « (aucun) » » et « section 3 : titre « Certifications et
      équipe » au lieu de « (aucun) » ». Deux des trois titres du 14/10
      (`5c7e765`), absents de la référence parce que la maquette de bureau
      n'en donne pas.
      QUI LA SOLDE : le chantier Mobile vague 2, lot des titres des trois
      blocs.

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
      ROMPUE LE 14/10 VERS 14H15. Remesurée à 14h26 : « /secteurs/ : 1
      écart(s) à la capture », « Réassurance : texte rendu absent de la
      capture « Certifications et équipe » ». Même origine que G59 et G63 : le
      titre du 14/10 (`5c7e765`) n'est pas dans la capture, et n'est pas
      déclaré dans la liste `AJOUTS` de la porte.
      QUI LA SOLDE : le chantier Mobile vague 2, lot des titres des trois
      blocs (`components/site/offre/Reassurance.tsx` est pris par ce
      chantier).

### G67 — Une erreur eslint préexistante, à arbitrer
- DÉPLACÉE LE 14/10 EN B5, section « Bloqué sur Mehdi », avec son historique
      complet. C'est une décision de Mehdi sur un comportement de formulaire,
      pas un travail à nous.


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
- [x] FAIT, REQUALIFIÉE LE 14/10 (paragraphe daté plus bas). Cette entrée
      portait [ ] et disait : « ANALYSÉ, PAS PORTÉ. 40 écarts relevés, 8 confirmés par relecture adverse,
      20 réfutés. Ressources v2 est une refonte de gabarit dont le blocage est
      la DONNÉE : les 4 thèmes, les 14 étiquettes et les durées de lecture
      n'existent pas au dépôt. Implantations n'est pas un gain partout : sa
      mosaïque fait 4 292 px au téléphone contre 537 aujourd'hui, et six de ses
      dix photos sont des aperçus filigranés. »
      ANCIENNE COMMANDE, retirée du passage le 14/10 : `ls maquette/colis-13-10/
      | wc -l`, attente « 5 ». Elle comptait les fichiers du colis déposés au
      dépôt, donc elle passait que le colis soit porté ou non.
      REQUALIFIÉE LE 14/10 : FAIT, les deux moitiés sont portées et servies
      en production. Cette entrée a été poussée le 13/10 à 19h30 (`a10b2f5`),
      avant le portage, qui a suivi le soir même.
      · Implantations : `ec5dba8` (20h04, la mosaïque de tuiles photo) puis
        `41f4400` (21h32, la répartition en douze colonnes et le panneau des
        bassins à onze onglets). Le colis n'a pas été copié là où il perdait :
        les huit photos sous licence au lieu des aperçus filigranés, Metz et
        Dijon en panneau sombre (voir B7), les 48 villes toutes dans le HTML
        au lieu de la seule région ouverte, une colonne et le bloc replié sous
        880 px.
      · Ressources v2 : `eeee130` (21h44), `components/site/ressources-hub/`.
        Le blocage annoncé, la donnée, a été levé en la relisant dans la
        maquette elle-même (`window.__MGRES`) : ses 4 thèmes, ses étiquettes
        calculées par sa propre règle (16 motifs, qui rendent les 14
        étiquettes de son rendu), et les minutes de lecture comptées sur les
        mots.
        Non porté, et c'est délibéré : le panneau de lecture en tiroir, qui
        aurait dupliqué 48 pages dans le hub (son propre LISEZMOI demande de
        vraies pages), et les formulaires du colis, auxquels on ne touche pas.
      Ce que la commande ne rejoue PAS : les 8 écarts confirmés le 13/10, un
      par un. Elle prouve que les deux colis sont en ligne, pas que chaque écart
      relevé avant le portage est soldé.
      CONTRE-ESSAIS JOUÉS LE 14/10, la commande sait échouer : la même
      commande avec `/carriere/` à la place de `/ressources/` rend « 0 sur 2 »
      thèmes et pas de jeton, code 1 ; avec `/implantations/lyon/` à la place
      de `/implantations/`, « tuiles de hub : 0, onglets de region : 0 » et pas
      de jeton, code 1. Mesure du jour : 2 sur 2, 10 tuiles, 11 onglets.
      CHECK: t=$(curl -s https://migen-site.vercel.app/ressources/ | grep -oE 'Digital &amp; IA|Coûts &amp; environnement' | sort -u | wc -l | tr -d ' '); i=$(curl -s https://migen-site.vercel.app/implantations/); m=$(printf %s "$i" | grep -o 'data-empan=' | wc -l | tr -d ' '); o=$(printf %s "$i" | grep -o 'type="radio"' | wc -l | tr -d ' '); echo "themes de Ressources v2 : $t sur 2, tuiles de hub : $m, onglets de region : $o"; [ "$t" -ge 2 ] && [ "$m" -ge 10 ] && [ "$o" -ge 11 ] && echo COLIS_DU_TREIZE_PORTE_EN_LIGNE
      EXPECT: COLIS_DU_TREIZE_PORTE_EN_LIGNE

### D7 — Retour de Nathan : « /nous-connaitre/ ultra spé résidence »
- [x] FAIT POUR CE QUI EST À NOUS, REQUALIFIÉE LE 14/10 (paragraphe daté plus
      bas). Les arbitrages de copie sont DÉPLACÉS EN B6. Cette entrée portait
      [~] et disait : « UNE FAUTE CORRIGÉE, SIX ARBITRAGES OUVERTS. La frise disait « Migen » là
      où son arbitrage du 09/10 impose « Migen Travaux » : c'était la seule
      phrase de la page nommant la marque qui porte les deux offres hors
      placement. Les six autres points sont sa copie, écrits avec leurs options
      dans docs/NOUS-CONNAITRE-ARBITRAGES.md. »
      ANCIENNE COMMANDE, retirée du passage le 14/10 : `curl -s
      https://migen-site.vercel.app/nous-connaitre/ | grep -c "Migen Travaux
      lance les travaux industriels"`, attente « au moins 1 ». Elle passait
      sous une case [~] : elle ne mesurait qu'une des trois corrections, et
      `grep -c` sur un HTML d'une seule ligne compte des lignes, pas des
      occurrences (piège 3 de `docs/PASSATION.md`).
      REQUALIFIÉE LE 14/10 : tout ce qui relevait de notre main est fait et
      mesuré en production, et c'est ce que l'inventaire du 14/10 range en
      « fait » (#6).
      · La frise nomme « Migen Travaux » (`b9a55c9`).
      · Le `<main>` lie les six offres, six adresses distinctes, contre 0 le
        13/10 au matin (`663ff3a`).
      · La description que lisent Google, LinkedIn et les aperçus de lien
        nomme les trois métiers, maintenance, bureau d'études et travaux
        industriels, au lieu de la seule affectation de techniciens
        (`498a56c`, section D de `docs/NOUS-CONNAITRE-ARBITRAGES.md`).
      Ce qui reste est la copie du client, h1 compris : ce sont des décisions,
      elles partent en B6.
      CONTRE-ESSAIS JOUÉS LE 14/10, la commande sait échouer : la même
      commande sur `/offres/residence/` rend « description aux trois metiers :
      0, offres liees dans le main : 5 sur 6, frise Migen Travaux : 0 » et pas
      de jeton, code 1 ; l'ANCIENNE description (« Nous ne faisons qu'une
      chose, affecter sur vos sites des techniciens qui entretiennent les
      machines, et rien d'autre. ») passée au même filtre rend 0. Mesure du
      jour : 1, 6 sur 6, 2.
      CHECK: h=$(curl -s https://migen-site.vercel.app/nous-connaitre/); d=$(printf %s "$h" | grep -o '<meta name="description" content="[^"]*"' | grep -c 'maintenance.*bureau d.*travaux industriels'); p=$(printf %s "$h" | grep -o '<main.*</main>' | grep -oE 'href="/(offres/(residence|full-service|zero-arret|arret-technique|bureau-etudes)|travaux-industriels)/"' | sort -u | wc -l | tr -d ' '); f=$(printf %s "$h" | grep -o 'Migen Travaux lance les travaux industriels' | wc -l | tr -d ' '); echo "description aux trois metiers : $d, offres liees dans le main : $p sur 6, frise Migen Travaux : $f"; [ "$d" = 1 ] && [ "$p" = 6 ] && [ "$f" -ge 1 ] && echo NOUS_CONNAITRE_NOMME_LES_TROIS_METIERS
      EXPECT: NOUS_CONNAITRE_NOMME_LES_TROIS_METIERS

### D8 — « Refais moi le doc rapport d'avancement, à jour toutes les 10 minutes »
- [ ] PAS FAIT, REQUALIFIÉE LE 14/10 (paragraphe daté plus bas). Cette entrée
      portait [x] et disait : « FAIT. docs/AVANCEMENT.md, dont le bloc de
      chiffres est réécrit par un script qui MESURE au lieu de recopier. Mise
      à jour programmée toutes les dix minutes. »
      ANCIENNE COMMANDE, retirée du passage le 14/10 : `node
      scripts/rapport-avancement.mjs --montre | grep -c remesureLe`, attente
      « au moins 1 ». Elle prouvait que le script tourne, pas que le rapport
      est remis à jour : elle passait le 14/10 alors que docs/AVANCEMENT.md
      n'avait plus bougé depuis le 13/10 à 16h40 (tête 9e69526).
      REQUALIFIÉE LE 14/10 : la remise à jour toutes les dix minutes vivait
      dans la session arrêtée le 13/10, et rien ne l'avait relancée. Mehdi,
      le 14/10 à 11h45 : « Pourquoi il y'a toujours une tâche en cours ». Le
      script, lui, tourne, et mesure depuis le 14/10 la branche déployée au
      lieu de l'arbre où il est lancé. La tâche planifiée est réarmée le 14/10
      dans la session qui pilote : le script toutes les dix minutes, le
      fichier réécrit localement, sans commit ni poussée, puisque chaque
      poussée redéploie ; le fichier part avec les poussées des lots. Cette
      tâche vit en mémoire de la session : elle s'arrête avec elle et expire
      au bout de sept jours. La case reste donc [ ] tant que la commande
      ci-dessous ne passe pas dans l'arbre qui pilote.
      LA COMMANDE MESURE LE CORRECTIF LUI-MÊME : l'âge de « remesureLe » dans
      docs/AVANCEMENT.md, vingt minutes au plus. Lancée dans un arbre où la
      tâche ne tourne pas, elle échoue, et c'est juste. CONTRE-ESSAI JOUÉ LE
      14/10 : sur le rapport du 13/10 à 16h40, pas de jeton, code 1 ; juste
      après `node scripts/rapport-avancement.mjs`, le jeton.
      CHECK: r=$(grep -o '"remesureLe": "[^"]*"' docs/AVANCEMENT.md | sed 's/.*: "//; s/"$//; s/ à / /'); t=$(TZ=Europe/Paris date -j -f '%d/%m/%Y %H:%M' "$r" +%s 2>/dev/null); a=$(( ($(date +%s) - ${t:-0}) / 60 )); echo "rapport remesure le $r, il y a $a minute(s)"; [ -n "$t" ] && [ "$a" -le 20 ] && echo RAPPORT_REMESURE_IL_Y_A_MOINS_DE_VINGT_MINUTES
      EXPECT: RAPPORT_REMESURE_IL_Y_A_MOINS_DE_VINGT_MINUTES

### D9 — « Une liste de tout ce dont tu as besoin pour terminer »
- [x] FAIT, et vérifiée point par point pour ne pas servir du périmé. La
      vérification a d'ailleurs invalidé un bloquant annoncé : les deux pages
      légales répondent 200, pas 404 comme le disait le document du 02/10.
      CHECK: curl -s -o /dev/null -w "%{http_code}" https://migen-site.vercel.app/mentions-legales/
      EXPECT: 200

### D10 — « Normalement tu as l'id du formulaire »
- [x] FAIT, REQUALIFIÉE LE 14/10 (paragraphe daté plus bas). Cette entrée
      portait [ ] et disait : « IL MANQUE, ET C'EST LE POINT LE PLUS GRAVE DU SITE. Le portail 148000737
      est en dur dans le code, mais `HUBSPOT_FORM_ID` est absent des variables
      Vercel, et le code renvoie 502 au visiteur quand il manque. Aucun
      formulaire ne dépose de lead en production. »
      ANCIENNE COMMANDE, retirée du passage le 14/10 : `grep -c
      "HUBSPOT_FORM_ID absent de l'environnement" app/api/lead/route.ts`,
      attente « au moins 1 ». Elle lisait le message d'erreur du CODE, qui
      existe que la variable soit posée ou non : elle passait donc toujours,
      et ne pouvait rien dire du correctif.
      REQUALIFIÉE LE 14/10 : FAIT. `HUBSPOT_FORM_ID` est posée sur Vercel en
      Production, et l'inventaire du 14/10 (#10) mesure les deux blocages
      levés : la variable, puis `company` à envoyer sur l'objet Société. Les
      six champs obligatoires du portail sont acceptés, vérifié contre le
      portail.
      La commande ne garde que la PREMIÈRE COLONNE de `vercel env ls`, les
      noms : cette version de la console affiche le début des valeurs des
      variables de type « Config », et aucune valeur n'a à sortir dans ce
      registre. Ce qu'elle ne prouve pas : qu'un lead arrive, ce qu'on ne
      rejoue pas ici pour ne pas déposer de faux contact chez HubSpot.
      CONTRE-ESSAIS JOUÉS LE 14/10, la commande sait échouer : avec
      `TEAMTAILOR_API_KEY`, variable connue absente (B1), elle rend 0 ; lancée
      hors d'un dossier lié au projet Vercel, elle rend 0. Mesure du jour : 1.
      CHECK: bunx vercel@62.7.0 env ls production 2>/dev/null | awk '{print $1}' | grep -cx HUBSPOT_FORM_ID
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
- DÉPLACÉE LE 14/10 EN B7, section « Bloqué sur Mehdi », avec son historique
      complet. Les deux photos sont choisies ; il manque leur version sous
      licence, à télécharger depuis son compte Envato.

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
      PLANTÉE LE 14/10 VERS 14H15, et le site n'y est pour rien.
      `.env.example` est ignoré par git (`.gitignore`, motif « .env* ») : il
      n'existe que dans l'arbre principal, et la commande lancée depuis un
      arbre à jour ne trouve pas le fichier. Elle se résout quand le lot
      tag-manager versionne `.env.example` (« !.env.example » au
      `.gitignore`).
      COMMANDE ÉLARGIE LE 14/10, attente inchangée : ce même lot renomme
      `NEXT_PUBLIC_OPENAI_PIXEL_ID` en `NEXT_PUBLIC_OPENAI_PIXEL_SRC`, le nom
      que `components/consentement/Tags.tsx` lit réellement (ligne 31). Avec
      l'ancien nom seul, la commande aurait compté 5 au lieu de 6 sur le
      fichier de l'arbre principal, et accusé à tort une réponse juste. Elle
      accepte les deux noms. ANCIENNE COMMANDE : la même sans
      `NEXT_PUBLIC_OPENAI_PIXEL_SRC`.
      CHECK: grep -c "NEXT_PUBLIC_GA\|NEXT_PUBLIC_GOOGLE_ADS_ID\|NEXT_PUBLIC_LINKEDIN_PARTNER_ID\|NEXT_PUBLIC_OPENAI_PIXEL_ID\|NEXT_PUBLIC_OPENAI_PIXEL_SRC\|GSC_SERVICE_ACCOUNT_JSON\|CRON_SECRET" .env.example
      EXPECT: au moins 6

### D16 — « Tu fais au mieux pour la version mobile »
- [~] PREMIER PAS FAIT. Le nom de l'offre est posé sur les six cartes du
      parcours, comme sa maquette. La carte n'est pas devenue un simple lien
      parce que les six réponses repliées font environ 900 mots qui n'existent
      nulle part ailleurs : mesuré, 0 à 2 extraits sur 6 se retrouvent sur les
      pages d'offre. Un défaut de contraste évité au passage, 2,3 pour 1 corrigé
      en 8,07.
      ANCIENNE COMMANDE, retirée du passage le 14/10 : `curl -s
      https://migen-site.vercel.app/ | grep -c "nomOffre"`, attente « au moins
      1 ». Elle mesurait le premier pas, qui est fait, et passait donc sous une
      case [~] : « à requalifier ». Elle comptait en outre des LIGNES sur un
      HTML d'une seule ligne (piège 3 de `docs/PASSATION.md`).
      REQUALIFIÉE LE 14/10 : PAS FAIT, et c'est à nous. La case reste [~] :
      le premier pas est en ligne, la version mobile ne l'est pas. Ce qui
      reste est le portage de la maquette mobile v2 (`maquette/mobile-v2/`,
      livrée le 13/10 au soir, `9138f0d`), le « à toi » n° 6 de
      `docs/PASSATION.md`, en cours le 14/10 dans une autre session. C'est le
      même chantier que D1.
      LA COMMANDE EST DONC CELLE DE D1, et ce n'est pas un raccourci : la
      règle n° 2 de la maquette mobile v2 (« Replier, jamais retirer. Les
      sections sont des `<details>` natifs ») est exactement ce que mesure
      `scripts/verifie-repli-mobile.mjs`. Sa prémisse, suspendue le 13/10 au
      soir faute de maquette, est rétablie par cette maquette-là. Elle ÉCHOUE
      aujourd'hui, et c'est le but : mesure du 14/10 en production, 144
      sections sans repli sur 207, 18 pages touchées, 40 s, code 1. L'entrée
      se lira « ouvert » jusqu'à ce que D1 passe, et passera avec lui.
      SA PREUVE D'ÉCHEC : `node scripts/verifie-repli-mobile.mjs --controle`,
      6/6 épreuves, dont l'accueil du 13/10 à 21 sections sans repli.
      CHECK: node scripts/verifie-repli-mobile.mjs https://migen-site.vercel.app | tail -1
      EXPECT: TOUTES_LES_SECTIONS_SE_REPLIENT

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

## Série 6, les demandes de Mehdi du 14/10

Inscrite le 14/10 vers 14h45 par le lot « rapport-avancement ». Les citations
exactes et l'état mesuré de chaque demande sont dans le relevé du 14/10 de la
session qui pilote (`etat.json`, numéro N entre parenthèses). Une entrée non
cochée dont la commande échoue est un chantier ouvert que sa porte confirme :
sa case se coche quand le lot qui la porte a poussé ET que la commande passe
en production. Les demandes du 14/10 sur la version mobile (replier sur
toutes les pages, porter la maquette mobile v2) restent sous D1 et D16.

### D20 — « 18 px comme la maquette » : la gouttière de page au téléphone (N36)
- [x] FAIT, `e88b4b6` (14/10, 13h31). Sous 880 px, les conteneurs de 1200 px
      à gouttière de 40 px passent à 18 px, comme la maquette mobile v2. Le
      bureau ne bouge pas. La commande lit les feuilles de style que la
      production sert avec l'accueil et exige la règle dans la bonne requête
      de largeur. CONTRE-ESSAI JOUÉ LE 14/10 : la même commande qui cherche
      17 px rend 0 et pas de jeton.
      CHECK: n=0; for f in $(curl -s https://migen-site.vercel.app/ | grep -oE '/_next/static/[^"]+\.css' | sort -u); do c=$(curl -s "https://migen-site.vercel.app$f" | grep -oE '@media \(max-width:880px\)\{[^@]{0,250}padding-left:18px!important' | wc -l | tr -d ' '); n=$((n+c)); done; echo "regle de gouttiere mobile servie : $n"; [ "$n" -ge 1 ] && echo GOUTTIERE_MOBILE_SERVIE
      EXPECT: GOUTTIERE_MOBILE_SERVIE

### D21 — « Garde le formulaire, fais-le juste en plusieurs étapes » (N34)
- [x] FAIT, `f4570d7` (14/10, 14h00). Au téléphone, le formulaire de contact
      se remplit en trois étapes : entreprise et téléphone, puis nom, prénom
      et e-mail, puis le message. Aucun champ ajouté, retiré ni renommé. La
      commande exige les deux : les assertions de
      `components/formulaire/verification.ts` (chaque champ dans une étape et
      une seule, chaque étape jugée par la validation partagée), et les
      marques d'étape dans le HTML servi de `/contact/`. Aucun envoi de
      formulaire. CONTRE-ESSAI JOUÉ LE 14/10 : la même commande sur
      `/mentions-legales/` rend 0 marque et pas de jeton.
      CHECK: bun components/formulaire/verification.ts >/dev/null 2>&1 && r=ok || r=ko; n=$(curl -s https://migen-site.vercel.app/contact/ | grep -o 'etapeMobile' | wc -l | tr -d ' '); echo "repartition des champs en etapes : $r, marques d etape sur /contact/ : $n"; [ "$r" = ok ] && [ "$n" -ge 1 ] && echo FORMULAIRE_EN_ETAPES_SANS_CHAMP_PERDU
      EXPECT: FORMULAIRE_EN_ETAPES_SANS_CHAMP_PERDU

### D22 — Les titres des trois blocs repliés au téléphone (N35)
- [x] FAIT, `5c7e765` (14/10, 14h05), mots de Mehdi : « Certifications et
      équipe », « Ils nous font confiance », « Votre technicien intégré à
      votre site ». Servis tous trois sur `/offres/`. CONTRE-ESSAI JOUÉ LE
      14/10 : la même commande sur `/carriere/` rend 0, 0, 0 et pas de jeton.
      CE COMMIT A ROMPU QUATRE PORTES qui ne connaissaient pas ces titres,
      puisque la maquette de bureau n'en donne pas : G20, G59, G63, G66, et
      il est le premier suspect de G57. Elles sont inscrites rompues à leur
      place, avec le chantier qui les solde.
      CHECK: h=$(curl -s https://migen-site.vercel.app/offres/); a=$(printf %s "$h" | grep -o 'Certifications et équipe' | wc -l | tr -d ' '); b=$(printf %s "$h" | grep -o 'Ils nous font confiance' | wc -l | tr -d ' '); c=$(printf %s "$h" | grep -o 'Votre technicien intégré à votre site' | wc -l | tr -d ' '); echo "sur /offres/ : $a, $b, $c"; [ "$a" -ge 1 ] && [ "$b" -ge 1 ] && [ "$c" -ge 1 ] && echo TROIS_TITRES_DU_QUATORZE_SERVIS
      EXPECT: TROIS_TITRES_DU_QUATORZE_SERVIS

### D23 — « Oui, les 101 » : toutes les pages publiées au plan du site (N43)
- [ ] EN COURS, lot « plan-du-site ». Mesuré le 14/10 vers 14h : sitemap.xml
      sert 259 adresses, `/plan-du-site/` n'en liste que 145 dans son
      `<main>`. Il manque l'accueil, `/contact/`, `/carriere/` et ses fiches,
      des villes, des études de cas, les ressources, les pages légales. Le
      lot crée une source unique des pages publiées, lue par le plan ET par
      le sitemap, et sa porte `scripts/verifie-plan-et-sitemap.mjs` exige le
      même ensemble des deux côtés, chaque adresse en 200 sans redirection,
      chaque `<loc>` sur https://migen.fr. Tant que cette porte n'est pas au
      dépôt, la commande imprime les deux comptes et pas de jeton.
      CHECK: if test -f scripts/verifie-plan-et-sitemap.mjs; then node scripts/verifie-plan-et-sitemap.mjs https://migen-site.vercel.app | tail -1; else p=$(curl -s https://migen-site.vercel.app/plan-du-site/ | grep -o '<main.*</main>' | grep -oE 'href="/[^"#?]*"' | sort -u | wc -l | tr -d ' '); s=$(curl -s https://migen-site.vercel.app/sitemap.xml | grep -o '<loc>' | wc -l | tr -d ' '); echo "porte du plan pas encore au depot ; plan du site : $p adresses, sitemap : $s"; fi
      EXPECT: PLAN_ET_SITEMAP_ALIGNES

### D24 — « Prépare le plan de redirection, on va bientôt mettre en ligne » (N42)
- [x] FAIT POUR LE CODE, `4a336e5` puis `d76960f` (14/10). Les 301 de
      l'ancien migen.fr sont versionnées dans `lib/redirections-ancien-site.ts`
      et le plan est écrit dans `docs/PLAN-REDIRECTIONS.md`. Mesuré en
      production le 14/10 à 14h33 : « 181 adresses de l'ancien site (183
      formes), 4 conservées, 144 redirigées en une 301, 35 techniques en 404 ;
      259 adresses du plan du site en 200 », puis le jeton. Sa porte a son
      propre témoin, `--controle`.
      CE QUI RESTE EST À MEHDI, section 5 du plan : la page `/cgv/`, que les
      devis citent, n'existe pas sur le nouveau site et part provisoirement
      vers `/mentions-legales/`, qui ne contient pas les CGV (bloquant avant
      la bascule) ; et six choix de cible à valider.
      CHECK: node scripts/verifie-redirections.mjs https://migen-site.vercel.app | tail -1
      EXPECT: REDIRECTIONS_SANS_PERTE

### D25 — « Pointer les redirections du LISEZMOI une à une » (N17)
- [ ] PAS FAIT. Les six adresses que le LISEZMOI de la maquette mobile v2
      demande de rediriger répondent encore 200 le 14/10 à 14h34 :
      `/offres/chantier/`, `/offres/construction/`, `/offres/retrofit/`,
      `/offres/audit-conseil-maintenance/`, `/bureau-etudes/`,
      `/offres/depannage-industriel/`. Elles ne sont pas dans le plan de D24,
      et deux d'entre elles y sont même des CIBLES ou des options :
      `/offres/retrofit/` reçoit l'ancienne `/retrofit-machine-industriel/`,
      `/offres/chantier/` et `/bureau-etudes/` sont deux des six choix que
      Mehdi doit valider. Les rediriger sans ses choix casserait le plan.
      QUI LA SOLDE : le chantier Redirections (`lib/redirections*.ts`,
      `proxy.ts`), après les choix de Mehdi.
      CHECK: n=0; for p in offres/chantier offres/construction offres/retrofit offres/audit-conseil-maintenance bureau-etudes offres/depannage-industriel; do c=$(curl -s -o /dev/null -w '%{http_code}' https://migen-site.vercel.app/$p/); echo "/$p/ $c"; [ "$c" = 301 ] && n=$((n+1)); done; echo "redirigees en 301 : $n sur 6"; [ "$n" = 6 ] && echo REDIRECTIONS_DU_LISEZMOI_EN_PLACE
      EXPECT: REDIRECTIONS_DU_LISEZMOI_EN_PLACE

### D26 — « Oublie pas le sitemap » (N43)
- [x] FAIT POUR LE CODE. `/sitemap.xml` est servi, toutes ses adresses sur
      https://migen.fr, et les 259 répondent 200 sans redirection (mesuré
      par la porte de D24 le 14/10 à 14h33). `app/robots.ts` le déclare dès
      que `SITE_INDEXABLE` vaut « oui ». CONTRE-ESSAI JOUÉ LE 14/10 : la même
      commande qui exige l'hôte `https://www.migen.fr/` rend « 259 adresses,
      dont 0 » et pas de jeton.
      CE QUI RESTE EST À MEHDI, le jour de la bascule : poser
      `SITE_INDEXABLE=oui` sur Vercel (sinon robots.txt reste « Disallow: / »),
      puis soumettre https://migen.fr/sitemap.xml dans la Search Console
      (étape 10 de `docs/PLAN-REDIRECTIONS.md`).
      CHECK: x=$(curl -s https://migen-site.vercel.app/sitemap.xml); n=$(printf %s "$x" | grep -o '<loc>' | wc -l | tr -d ' '); m=$(printf %s "$x" | grep -o '<loc>https://migen.fr/' | wc -l | tr -d ' '); echo "sitemap : $n adresses, dont $m sur https://migen.fr"; [ "$n" -ge 1 ] && [ "$n" = "$m" ] && echo SITEMAP_SERVI_SUR_MIGEN_FR
      EXPECT: SITEMAP_SERVI_SUR_MIGEN_FR

### D27 — « Ensuite on va devoir intégrer le Tag Manager » (N41)
- [ ] EN COURS, lot « tag-manager ». Mesuré le 14/10 : aucune trace de
      Google Tag Manager au dépôt ni en production. Le lot pose
      `components/consentement/TagManager.tsx`, monté dans `app/layout.tsx`
      juste après le mode consentement, qui ne charge le conteneur QUE si un
      choix existe et qu'une finalité Google est accordée ; sans identifiant,
      rien ne se charge. Il versionne `.env.example` avec
      `NEXT_PUBLIC_GTM_ID`, ce qui résout aussi D15. La commande exige le
      composant, son montage, la variable documentée, les assertions du lot
      (`components/consentement/verification-tag-manager.ts`) et aucun
      gtm.js dans l'accueil servi. La preuve au navigateur, avant et après
      « Tout accepter », est la porte `scripts/verifie-tag-manager.mjs` du
      lot, jeton AUCUN_TAG_AVANT_CONSENTEMENT : elle demande un build local
      avec un identifiant de test, et sa sortie se colle ici.
      CE QUI RESTE À MEHDI : l'identifiant du conteneur (GTM-XXXXXXX), à poser
      sur Vercel en Production (`NEXT_PUBLIC_GTM_ID`), les balises GA4, Google
      Ads et LinkedIn dans le conteneur avec les contrôles de consentement,
      puis le test des deux parcours avec Google Tag Assistant (CLAUDE.md
      section 8).
      CHECK: f=$(test -f components/consentement/TagManager.tsx && echo 1 || echo 0); t=$(grep -s -c 'TagManager' app/layout.tsx); e=$(git ls-files .env.example | wc -l | tr -d ' '); g=$(grep -s -c '^NEXT_PUBLIC_GTM_ID=' .env.example); v=$(test -f components/consentement/verification-tag-manager.ts && bun components/consentement/verification-tag-manager.ts >/dev/null 2>&1 && echo ok || echo ko); h=$(curl -s https://migen-site.vercel.app/ | grep -o 'googletagmanager.com/gtm.js' | wc -l | tr -d ' '); echo "composant : $f, monte : ${t:-0}, .env.example versionne : $e, variable documentee : ${g:-0}, assertions du lot : $v, gtm.js dans l accueil servi : $h"; [ "$f" = 1 ] && [ "${t:-0}" -ge 1 ] && [ "$e" = 1 ] && [ "${g:-0}" -ge 1 ] && [ "$v" = ok ] && [ "$h" = 0 ] && echo TAG_MANAGER_DERRIERE_LE_CONSENTEMENT
      EXPECT: TAG_MANAGER_DERRIERE_LE_CONSENTEMENT

### D28 — « Pour Metz et Dijon va sur Envato » (N37)
- [x] FAIT, `43481b9` et `fd8415b` (14/10, 14h04 à 14h06), détail en B7. Les
      deux photos sous licence répondent 200 et sont servies sur l'accueil et
      sur `/implantations/`. CONTRE-ESSAI JOUÉ LE 14/10 : la même commande
      pour Nancy, qui n'est pas un hub, rend 404 et 0.
      CHECK: m=$(curl -s -o /dev/null -w '%{http_code}' https://migen-site.vercel.app/assets/villes/hub-metz.jpg); d=$(curl -s -o /dev/null -w '%{http_code}' https://migen-site.vercel.app/assets/villes/hub-dijon.jpg); a=$(curl -s https://migen-site.vercel.app/ | grep -oE 'media/(metz|dijon)\.' | sort -u | wc -l | tr -d ' '); i=$(curl -s https://migen-site.vercel.app/implantations/ | grep -oE 'media/(metz|dijon)\.' | sort -u | wc -l | tr -d ' '); echo "hub-metz.jpg $m, hub-dijon.jpg $d, accueil : $a sur 2, implantations : $i sur 2"; [ "$m" = 200 ] && [ "$d" = 200 ] && [ "$a" = 2 ] && [ "$i" = 2 ] && echo METZ_ET_DIJON_SOUS_LICENCE_EN_LIGNE
      EXPECT: METZ_ET_DIJON_SOUS_LICENCE_EN_LIGNE

### D29 — « Voir nos secteurs → tu as pas mis de cta pareil sur la page nous connaitre » (N02)
- [x] FAIT, lot « cta-nous-connaitre », `f461219` (poussé le 14/10 à 14h28).
      Demande du 13/10 à 21h32, restée sans suite jusqu'au 14/10. Le lien
      était un texte orange de 14,5 px ; il prend le dessin du bouton
      secondaire « Nos valeurs » de la même page, libellé et cible inchangés.
      La commande lit le lien servi : cible `/secteurs/`, bord arrondi,
      bordure. Mesuré en production le 14/10 vers 14h40 : le jeton.
      CONTRE-ESSAI, avant / après : la même commande vers 14h35, avant le
      déploiement, lisait `style="font:600 14.5px var(--fb);color:#ff7c3c"`
      et ne rendait pas de jeton. La maquette rend ce lien en texte : le
      bouton suit la demande de Mehdi.
      CHECK: t=$(curl -s https://migen-site.vercel.app/nous-connaitre/ | grep -oE '<a [^>]*>Voir nos secteurs'); echo "$t"; printf %s "$t" | grep -q 'href="/secteurs/"' && printf %s "$t" | grep -q 'border-radius:999px' && printf %s "$t" | grep -q 'var(--gbd)' && echo VOIR_NOS_SECTEURS_EN_BOUTON
      EXPECT: VOIR_NOS_SECTEURS_EN_BOUTON

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

LES TROIS ENTRÉES QUI SUIVENT ONT ÉTÉ DÉPLACÉES ICI LE 14/10, depuis les
séries 4 et 5, lors de la requalification des entrées « à requalifier ». Leur
historique est repris mot pour mot. AUCUNE ne porte de ligne de commande
exécutable, et c'est voulu : le vérificateur ne reconnaît que les titres `G` et
`D`, si bien qu'une commande posée sous un titre `B` serait rattachée à la
dernière entrée `D` lue, et l'accuserait à tort. Leur mesure est écrite en
`MANUEL`, avec la commande qui les tranchera le jour où Mehdi aura répondu.

### B5 — Une erreur eslint préexistante, à arbitrer (ex-G67)
- [ ] DÉCISION DE MEHDI. Historique de G67, repris tel quel :
      « PAS FAIT, DÉLIBÉRÉMENT. `components/formulaire/ChampEntreprise.tsx:101`
      appelle `setPropositions([])` en synchrone dans un effet. C'est la seule
      erreur eslint du dépôt, elle est antérieure à cette nuit, et le fichier
      n'a été touché par personne. Le remède naturel, déplacer l'effacement
      dans le minuteur, décale de 250 ms la disparition de la liste
      d'autocomplétion : c'est un comportement de FORMULAIRE, et la règle est
      de ne pas y toucher. À trancher par Mehdi. »
      Son ancienne commande, `bunx eslint
      components/formulaire/ChampEntreprise.tsx` avec l'attente « 1 error »,
      mesurait la présence du défaut sous une case non cochée : elle passait,
      et le vérificateur la classait « à requalifier ».
      MANUEL, mesuré le 14/10 : l'erreur est toujours là, une seule, règle
      `react-hooks/set-state-in-effect`, ligne 101. Conséquence à connaître :
      `bun run verifie` enchaîne `bunx eslint .` et s'arrête donc sur elle
      tant que Mehdi n'a pas tranché.
      CE QU'IL FAUT DE LUI : accepter, ou non, que la liste d'autocomplétion
      du champ Entreprise disparaisse 250 ms plus tard. S'il accepte, le
      correctif est fait par une session autorisée à toucher aux formulaires,
      et la commande qui le tranchera, à poser sous un titre `G` : `bunx
      eslint components/formulaire/ChampEntreprise.tsx && echo
      CHAMP_ENTREPRISE_SANS_ERREUR`, avec ce jeton pour attente (eslint
      n'imprime rien quand tout passe, une attente « 0 » ne trancherait rien).

### B6 — Les arbitrages de copie de /nous-connaitre/ (ex-D7, partie copie)
- [ ] DÉCISION DE MEHDI, ou de Nathan pour lui. D7 garde la partie qui était à
      nous, faite et mesurée. Restent les points B1 à B10 de
      `docs/NOUS-CONNAITRE-ARBITRAGES.md` (sa numérotation, distincte de
      celle-ci), tous sur SA copie, chacun avec ses options rédigées. Le plus
      visible est son point B8, le h1 : « Un seul métier : technicien de
      maintenance. », mot pour mot sa maquette (`maquette/accueil-rendu.html`
      ligne 5208), qui ne nomme qu'un métier sur trois juste au dessus d'un
      chapô qui en nomme trois. Les autres : le schéma en trois cases (B1), un
      intitulé pour le bloc des six offres (B2), « un technicien ou deux en
      avril 2021 » (B4), les jalons de trois offres absents de la frise (B5),
      l'offre de chacun des 41 cas de /preuves/ (B6), les deux colonnes du
      périmètre (B7), « Nos terrains d'excellence » (B9), les « trois
      personnes » de l'équipe proche (B10).
      MANUEL, mesuré le 14/10 en production : le h1 servi est toujours
      « Un seul métier : technicien de maintenance. ». La porte de la page,
      `bun components/site/nous-connaitre/verification-nous-connaitre.tsx`,
      imprime « ARBITRAGE OUVERT, B8 » à chaque passage, et elle tombera le
      jour où le h1 change : c'est le signal attendu, pas une régression.
      CE QU'IL FAUT DE LUI : pour le h1, un mot, il reste ou il nomme les
      trois métiers (deux formulations prises dans ses propres mots sont
      proposées au document). Pour le reste, ses choix point par point. Rien
      n'est réécrit sans eux.

### B7 — Les photos de Metz et Dijon sous licence (ex-D13, même sujet que G53)
- [x] FAIT LE 14/10. Mehdi, 14/10 : « pour Metz et Dijon va sur Envato ».
      Les deux versions sous licence ont été téléchargées depuis son compte
      Envato, au projet de licence existant « migen.fr » (aucun autre créé,
      rien acheté) : `cathedral-in-metz-france-…-utc.jpg` (6899 x 4753,
      26,3 Mo) et `vineyard-rows-stretching-toward-a-village-on-a-hil-…-utc.jpg`
      (5419 x 3613, 3,2 Mo, Meursault). Versions web de 2000 px dans
      `public/assets/villes/hub-metz.jpg` et `hub-dijon.jpg`, mêmes octets
      dans `components/site/accueil/hubs/metz.jpg` et `dijon.jpg`.
      BRANCHÉES aux trois endroits : `PHOTO_DU_HUB` de
      `components/site/implantations/photos-hubs.ts` (cartes de l'accueil et
      mosaïque de `/implantations/`, `HUBS_SANS_PHOTO` vidé) et `hubLocal.photo`
      des deux fiches ville. Textes alternatifs dans `lib/descriptions-villes.ts`,
      celui de Dijon nomme Meursault et jamais Dijon. Carte de Metz cadrée à
      72 % : centrée, le chevet de la cathédrale sortait du cadre (mesure dans
      `HubsAccueil.tsx`, vérifiée par la règle 4 de `verification-photos.tsx`).
      La commande échoue si un fichier manque (`ls`), si une fiche ne pointe
      pas sa photo (`grep -q`), ou si le rail ne sert pas dix photos de ville
      et vingt images décrites. CONTRE-ESSAI : avant le branchement, la même
      porte affichait « Nos hubs : 8 photos » et « HubsAccueil : 16 photo(s) ».
      COMMANDE RENDUE À SON LIEU LE 14/10 : elle commençait par `cd
      "/Users/mehdi/Landing lovable/migen-site" &&`, l'arbre principal resté
      à 93da90c (14/10 11h17), d'avant le branchement des deux photos : elle y
      plantait au passage de 14h15. Lancée depuis un arbre à jour, sans ce
      `cd`, elle rend à 14h26 « Nos hubs : 10 photos, toutes distinctes » et
      « HubsAccueil : 20 photo(s), toutes décrites », code 0.
      CHECK: ls public/assets/villes/hub-metz.jpg public/assets/villes/hub-dijon.jpg components/site/accueil/hubs/metz.jpg components/site/accueil/hubs/dijon.jpg && grep -q '"/assets/villes/hub-metz.jpg"' supabase/import/gabarits-maquette/implantations-maintenance-industrielle-metz.json && grep -q '"/assets/villes/hub-dijon.jpg"' supabase/import/gabarits-maquette/implantations-maintenance-industrielle-dijon.json && bun components/site/accueil/verification-photos.tsx
      EXPECT: Nos hubs : 10 photos, HubsAccueil : 20 photo(s), toutes décrites
      Avant le 14/10 : ACHAT OU TÉLÉCHARGEMENT DE MEHDI. Historique de D13, repris tel quel :
      « CHOISIES, PAS LIVRÉES. Metz : la cathédrale par RossHelen, même
      photographe et même série que Nantes et Bordeaux. Dijon : Meursault, en
      Côte-d'Or, seule photo de vignes authentiquement bourguignonne du
      catalogue. Il manque les versions sous licence : le catalogue ne rend que
      l'aperçu de 600 px filigrané. »
      Son ancienne commande, `grep -c "hub-metz.jpg\|hub-dijon.jpg"
      docs/PHOTOS-VILLES-ENVATO.md` avec l'attente « au moins 2 », comptait
      les deux noms de fichier écrits dans la documentation : elle mesurait le
      CHOIX, qui est fait, et non la LIVRAISON, qui ne l'est pas.
      MANUEL, mesuré le 14/10 : `public/assets/villes/` porte les huit
      `hub-*.jpg` des autres hubs et ni `hub-metz.jpg` ni `hub-dijon.jpg` ;
      `components/site/implantations/photos-hubs.ts` déclare
      `HUBS_SANS_PHOTO = ["Metz", "Dijon"]`, et les deux tuiles se rendent en
      panneau sombre plutôt que de servir une photo qui ne serait pas la
      ville (Metz servait une cimenterie, Dijon un métier à tisser).
      CE QU'IL FAUT DE LUI : les deux fichiers sous licence, depuis son compte
      Envato (adresses des deux pages dans `docs/PHOTOS-VILLES-ENVATO.md`). La
      commande qui tranchera la livraison : `ls public/assets/villes/hub-metz.jpg
      public/assets/villes/hub-dijon.jpg`, plus le retrait des deux noms de
      `HUBS_SANS_PHOTO`.

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
