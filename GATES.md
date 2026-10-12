# Registre des retours de Mehdi

Un point par retour, dans l'ordre où il l'a donné. Rien n'est coché sans une
preuve lisible juste en dessous. Un point sans preuve compte pour NON FAIT,
même s'il « a l'air » fait.

Les retours arrivent au compte-gouttes : ce fichier est la seule liste qui les
retient tous. À relire avant de dire « j'ai tout terminé ».

Convention : `CHECK:` est la commande qui tranche, `EXPECT:` ce qu'elle doit
afficher. Un point sans commande possible est marqué `MANUEL:` et porte la
mesure qui l'a tranché.

Dernière relecture : 12/10.

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
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-photos-du-secteur.mjs
      EXPECT: 0 photo hors secteur
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
- [ ] EN ATTENTE DE SON CRITÈRE
      MESURE : le thème de la photo servie est la métallurgie, ce qui est
      cohérent avec le bassin de Metz. Je ne sais pas ce qu'il attend à la
      place. À lui demander.

### G13 — NOS HUBS : la photo de Bordeaux est mal cadrée
- [ ] EN ATTENTE DE SON CRITÈRE
      MESURE : le cadrage est centré par défaut, il n'existe aujourd'hui aucun
      réglage par photo. Ajouter un point de cadrage par photo est faisable,
      mais il faut savoir lequel il veut.

### G14 — Page bureau d'études : le bloc d'appel est mal disposé
- [ ] NON FAIT
      Même famille que G15. À traiter avec lui.

### G15 — /travaux-industriels/ : le bloc d'appel est mal disposé
- [ ] NON FAIT

### G16 — bureau-etudes : « Les prestations regroupées ici » pas assez complet
- [ ] EN ATTENTE DE SON CRITÈRE
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
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/verifie-blocs-pliables.mjs
      EXPECT: 932 blocs sur 233 pages

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
- [ ] EN COURS, agent dédié
      MESURE : `components/site/entete-donnees.ts`, `RES_FORMATS` : l'entrée
      « 07 Fiches métier » pointe sur `/carriere/`. Deux entrées portent le même
      numéro 07. Le menu n'expose que 3 des 5 familles réelles de
      `/ressources/` (articles, fiches pratiques, fiches techniques, livres
      blancs, process).

### G26 — La page /carriere/ devrait s'appeler « Rejoindre migen »
- [ ] EN COURS, agent dédié
      MESURE : la maquette écrit « Rejoindre migen© » dans son écran de
      recrutement, donc la demande va dans le sens de la maquette.

### G27 — Menu : le « 23 RESSOURCES » renvoie vers le guide de maintenance industrielle
- [ ] EN COURS, agent dédié
      MESURE : je n'ai pas localisé l'élément par un grep de « 23 » dans
      l'en-tête servi : c'est très probablement un compteur CALCULÉ. Le compte de
      23 est à confronter aux 41 pages réelles sous `/ressources/`.

### G28 — Fiche métier : problème avec les titres H2 et la disposition de la page
- [ ] EN COURS, agent dédié
      PISTE DONNÉE À L'AGENT : ma première version des bascules mobiles mettait
      des `<span>` habillés au lieu de vrais `<h2>` sur ces 13 pages. Corrigé,
      mais à revérifier page par page.

### G29 — Fiche pratique : mal agencée, gros blocs « pourquoi ces fiches existent », aucune cohérence
- [ ] EN COURS, agent dédié

### G30 — /nous-connaitre/ : toujours la même photo, blocs « Notre force » et « le premier client »
- [ ] EN COURS, agent dédié
      PISTE : quatre images de `/assets/web/` écrites en dur couvraient chacune
      quatre pages de hub. Même famille de cause que G10.

### G31 — /rse/ : changer la photo du cas concret
- [ ] EN COURS, agent dédié

### G32 — Le bloc « Ce que nous vous transmettons » est mal agencé
- [ ] EN COURS, agent dédié

### G33 — /implantations/ : le bloc « sept hubs, 74 bassins » est mal agencé, trop gros, pas assez visuel
- [ ] NON FAIT

### G34 — /implantations/ : même reproche pour le bloc « au delà des hubs »
- [ ] NON FAIT

### G35 — /offres/ : « c'est que des photos avec des avions, on doit voir du technicien »
- [ ] EN COURS, atelier dédié
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
      CHECK: cd "/Users/mehdi/Landing lovable/migen-site" && node scripts/inventorie-photos-hors-sujet.mjs
      EXPECT: à redéfinir une fois les 385 photos classées par sujet dominant

### G36 — /offres/zero-arret/ : le bloc « Également dans cette offre » ne sert à rien
- [ ] NON FAIT
      Il n'y liste qu'UNE prestation, avec un renvoi vers un guide.

### G37 — /offres/bureau-etudes/ : la photo du bloc problématique est mal choisie
- [ ] NON FAIT, même atelier que G35

### G38 — /offres/bureau-etudes/ : le bloc d'appel toujours pas corrigé
- [ ] NON FAIT, c'est G14 qu'il rouvre explicitement : « tu n'as toujours pas
      corrigé ce bloc ». Il s'agit du bloc qui enchaîne « Nous vous rappelons
      dans l'heure… », « Faire chiffrer mon étude » et « Structures et châssis,
      mécano-soudé, transmissions… ».

### G39 — /offres/bureau-etudes/ : un bloc qui ne contient qu'une phrase
- [ ] NON FAIT
      « Chaque étape a un livrable défini et un point de validation. Vous restez
      maître des choix. » Seule dans son bloc.

### G40 — Le bloc « Également dans cette offre » n'a pas toutes les prestations
- [ ] NON FAIT
      Sur /offres/bureau-etudes/ il n'en liste que deux. C'EST LE MÊME BLOC que
      G16 (« pas assez complet ») et G36 (« ne sert à rien »), vu sur trois
      pages. Sa décision se lit maintenant clairement : ce bloc doit porter
      TOUTES les prestations regroupées sous l'offre, ou ne pas exister.

### G41 — /travaux-industriels/ : retirer la phrase du premier héros
- [ ] NON FAIT
      « Nous vous rappelons dans l'heure, du lundi au vendredi de 8h00 à
      18h30. » À retirer du héros de cette page.

### G42 — bureau d'études et travaux industriels : « expert technique », pas « technicien »
- [ ] NON FAIT
      Il rappelle une décision déjà prise : « on avait dit que sur bureaux
      d'étude et travaux on parlait pas de technicien mais d'expert
      technique ». Le bloc visé : « 10 % / Des techniciens retenus · entretien
      technique et entretien comportemental, résultats partagés avec vous. »
      À VÉRIFIER : cette décision est-elle écrite dans `lib/decisions-copie.ts` ?
      Si oui, elle n'est pas appliquée et c'est un défaut de portage. Si non,
      c'est une décision orale qui n'a jamais été inscrite, et il faut
      l'inscrire pour qu'elle tienne.

### G43 — /travaux-industriels/ : le bloc « Également dans cette offre » manque des prestations
- [ ] NON FAIT
      Il n'en liste que deux, Transfert industriel et Montage industriel.
      QUATRIÈME SIGNALEMENT DU MÊME BLOC, avec G16, G36 et G40. C'est le défaut
      le plus rapporté du site.

### G44 — Mettre le cas Norvège en case mise en avant
- [ ] NON FAIT

### G45 — L'image du bloc « problématique » est partout la même sur les pages expertises
- [ ] EN COURS, atelier photos
      Même famille que G35.

### G46 — /expertises/electromecanique/ : le bloc d'astreinte ne va pas
- [~] UNE MOITIÉ DÉJÀ CORRIGÉE, EN ATTENTE DE DÉPLOIEMENT
      La phrase « Un moteur en panne maintenant se traite par le dépannage
      industriel » est retirée en local depuis G24 : il la voyait encore parce
      que la poussée n'avait pas eu lieu. Poussée le 12/10 avec 2baf1a4.
      RESTE : la phrase d'astreinte se répète elle-même. « L'astreinte la nuit,
      le week-end et les jours fériés prend le relais la nuit et le week-end. »
      dit deux fois « la nuit et le week-end ».

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
- [ ] Les logos clients affichés sans accord écrit.

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
