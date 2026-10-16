# Landing pages sous /lp/ : ce qui a été retiré ou remplacé

Fichier écrit par `bun scripts/genere-lp.mjs`, ne pas le modifier à la main : relancer le script.

## Ce que c'est

Les landing pages publicitaires de la maquette V3 (onglets « Landing page PC » et « Landing page mobile »), portées sous migen.fr dans le répertoire `/lp/`, non référencées par Google. La donnée vient de `window.__LP` de la V3, copiée telle quelle dans `maquette/v3-lp/lp-data.json`, et sort dans `lib/lp/pages.json`, avec exactement le même schéma.

Adresses : les mêmes fins d'adresse que go.migengroup.com, sans le `/fr` (`/fr/maintenance-industrielle-lyon` devient `/lp/maintenance-industrielle-lyon/`, `/fr/secteurs/chimie` devient `/lp/secteurs/chimie/`). Les liens entre LP (`mainHref`) suivent. Aucune LP ne renvoie vers go.migengroup.com. Dijon, seul hub sans LP, renvoie au formulaire de la page (le gabarit le calcule).

Images : chemins absolus (`/assets/...`), tous servis par le site. Numéro : 04 11 78 95 97, celui des LP (TELEPHONE_LP), et lui seul.

## La règle appliquée

Rien n'est rédigé. Une phrase qui porte un interdit est retirée entière ; dans un libellé fait de segments séparés par « · », seul le segment fautif part, sauf quand il nomme une agence (« Agence Paris · La Défense » part entier). Une question de FAQ qui porte un interdit part avec sa réponse. Un élément de liste dont le titre est vidé part entier ; un sur-titre part avec le titre de section qu'il annonçait. Un texte vidé reste une chaîne vide : la clé demeure, le gabarit ne rend pas de bloc vide (ni `<h2>` vide).

Les seules réécritures sont nommées dans `CORRECTIONS` du script : retrait d'une proposition qui porte un délai (le reste de la phrase est celui de la V3), note client du site, « +200 clients » sans « satisfaits », fautes de préposition de la V3 (« au Havre », « dans le Nord »…), et les décisions déjà actées du site (`lib/decisions-copie.ts`). Les agences et les rattachements de hub ne sont jamais réécrits : ils sont retirés.

Interdits : intérim, régie, mise (met, mettre) à disposition, sans engagement, notamment, sur mesure, clé en main, levier, concrètement, incontournable, découvrez, en savoir plus, tiret cadratin, « candidats », « prix mensuel fixe » ; tout délai chiffré sauf le rappel dans l'heure ; tout montant sauf « +10 M€ » de l'accueil ; toute agence locale en France hors Lyon (Écully) ; tout rattachement de hub incohérent avec les dix hubs (une ville-hub rattachée à un autre, une ville sans hub rattachée à un autre que le plus proche) ; 4,9/5. La porte `bun scripts/verifie-lp-donnees.mjs` (dans `bun run verifie`) refuse leur retour dans la donnée, et `bun scripts/verifie-lp.mjs` dans le texte que le gabarit ajoute à la page rendue.

## En chiffres

- 39 pages portées sur 41 ; 2 non portées.
- 390 retraits ou remplacements, dont :
  - 49 : retiré : mise à disposition
  - 41 : question de FAQ retirée avec sa réponse : intérim
  - 40 : retiré : régie
  - 37 : note 4,9/5 remplacée par celle du site, 4,6 / 5
  - 33 : « satisfaits » retiré de « +200 clients »
  - 24 : élément de liste retiré avec son titre
  - 20 : retiré : délai chiffré (seul « rappel dans l'heure » est permis)
  - 18 : flottant « 10 hubs en France » recollé
  - 17 : retiré : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid)
  - 14 : espace insécable avant les deux-points d'un titre
  - 12 : durée retirée d'une carte « Cas client »
  - 12 : retiré : implantation locale qui n'existe pas (aucun hub dans cette ville)
  - 10 : sur-titre retiré avec son titre
  - 9 : retiré : ville-hub rattachée au hub de Lyon
  - 8 : faute de français de la V3 corrigée (préposition)
  - 7 : photo Envato remplacée par sa version sous licence
  - 5 : délai chiffré retiré, le reste de la phrase gardé
  - 4 : titre « Six métiers » retiré (une carte en moins)
  - 4 : numérotation des cartes recalée
  - 4 : retiré : en savoir plus
  - 4 : vignettes des hubs remplacées par les photos du site
  - 3 : retiré : sans engagement
  - 3 : retiré : ville-hub rattachée au hub de Toulouse
  - 3 : retiré : rattachement au hub de Nantes, qui n'est pas le plus proche
  - 3 : siège à Écully
  - 3 : retiré : rattachement au hub de Lyon, qui n'est pas le plus proche
  - 2 : décision du site appliquée (lib/decisions-copie.ts)
  - 1 : retiré : clé en main

## Pages non portées

- `/` : page de choix de langue (« English · bientôt ») : les LP sont en français seulement.
- `/fr/confidentialite` : politique de confidentialité propre à la V3 : les LP renvoient à /confidentialite/ et /mentions-legales/ du site.

## Changements de copie faits dans le gabarit, hors donnée

Le texte que les composants de `components/lp/` écrivent eux-mêmes, et ce qui y diffère de la V3 :

- Formulaire (`FormulaireLP.tsx`) : la mention de la V3 « Gratuit et sans engagement. Vos données servent uniquement à traiter votre demande · Confidentialité » (deux fois par page) porte « sans engagement » ; elle est remplacée par la mention RGPD du formulaire du site, mot pour mot (`MentionsRgpd`).
- Formulaire : celui de la V3 (`MigenLPForm`), au héros comme en bas de page, sur un seul écran : titre de la page, « Rappel dans l’heure », six champs obligatoires, bouton « On me rappelle dans l’heure ». Il envoie comme le formulaire du site (`/api/lead`, formulaire HubSpot du site), avec le pays de l'indicatif (`country`, champ caché de la V3) ; rien de la LP en ligne n'y est ajouté, ni champ ni étape. L'attribution de la visite (UTM, page d'entrée, identifiant de la LP) est gardée dans la table `leads` ; dans HubSpot, une demande de LP se reconnaît à son adresse (`pageUri`), car `formulaire_migen`, `utm_*`, `page_entree` et `gclid` n'existent pas comme propriétés du portail (relevé du 16/10) : les créer et les poser sur le formulaire du site pour qu'elles y arrivent.
- Pied : « © 2026 Migen · migengroup.com » devient « © <année> Migen » ; « Mentions légales » est ajouté à côté de la politique de confidentialité, les deux vers les pages du site ; « Préférences cookies » rouvre le bandeau du site.
- /lp/rendez-vous/ : le faux agenda de la V3 (cinq jours et six créneaux écrits en dur, « Confirmer le rendez-vous », « Visio ou téléphone · sans engagement ») disparaît. À sa place, le titre de carte de la V3 sans sa durée chiffrée, « Choisissez votre créneau », et un bouton qui ouvre l'agenda Calendly de la LP en ligne, « Réservez votre échange », les mots du titre de la page. Surtitre, titre et chapô sont lus dans la donnée.
- /lp/merci/ : tout est lu dans la donnée (surtitre, titre, chapô, points, bouton `mainCta` vers `mainHref`).
- Barre collante du téléphone : absente de /lp/merci/ et /lp/rendez-vous/ (la V3 l'y montre, mais son bouton y vise `#lp-contact`, qui n'existe pas sur ces pages) ; sans le voile blanc de la V3, qui laissait du texte blanc à 2:1 sur le héros.
- Carrousel des témoignages : les cartes « Étude de cas » ne mènent nulle part, comme dans la V3 (aucune sortie vers le site) ; un bouton de pause est ajouté (WCAG 2.2.2).

## Conservé, à confirmer par Mehdi

Aucune règle ne les retire, mais aucune source du site ne les atteste mot pour mot. Gardés tels quels :

- « Lun. au ven., 8h à 18h » à côté du numéro des LP (bloc contact) : horaires du standard des LP, non affichés par le gabarit V3. Le site annonce d'autres horaires pour son propre numéro.
- « Remplacement garanti » (badges des villes, page merci), « Autonomes dès le 1er jour », « 100% opérationnels dès le premier jour », « 8+ équipements maîtrisés » : promesses reprises de la LP en ligne. « Dès le premier jour » n'est pas tenu pour un délai : le site écrit lui-même « le bon profil, opérationnel dès le premier jour » (/nous-connaitre/, `TerrainsExcellence.tsx`).
- « Profils sélectionnés (1/10) » (technicien disponible) : même sens que « 10 % des techniciens retenus ».
- Durées écrites en lettres hors des cartes « Cas client » : « Un centre logistique monté en six semaines », « Un parc de fonderie repris en huit semaines », « Six mois pour remettre en état un site à risque chimique » (titres d'études de cas du site, /preuves/), et le témoignage « …pendant six semaines… » (accueil du site). Gardés parce que le site les affiche ; à arbitrer : la consigne « aucun délai chiffré » les retirerait, et avec eux trois études de cas et une phrase d'un témoignage sur 36 pages.
- Pages des villes-hubs Bordeaux, Lille, Marseille, Metz : la V3 les rattachait à un autre hub ; le rattachement est retiré (« Intervention Bordeaux » au lieu de « Intervention Bordeaux · Hub Toulouse »), pas réécrit en « Hub Bordeaux ». Paris : l'agence de La Défense est retirée entière (badge, titre de bloc, adresse du chapô). À réécrire si Mehdi le souhaite.
- Le Havre et Nice : la V3 les rattachait à Nantes et à Lyon, alors que Paris et Marseille sont plus proches (et que Rouen, même département que Le Havre, va à Paris). Le rattachement est retiré, pas remplacé.
- « Un expert local qualifie, confirme profil et tarif. » et « Basés autour de <ville>, mobilisables vite. » (les quinze villes) : gardés, ils parlent des techniciens et non d'une implantation ; à confirmer pour les six villes sans hub (Brest, Grenoble, Le Havre, Nice, Rennes, Rouen), où « partenaire maintenance basé à » et « partenaire maintenance local » ont été retirés.
- Les quinze cartes « Cas client · département » : anonymes, sans équivalent dans /preuves/, gardées sans leurs délais ni durées comme demandé.
- Les textes vidés par la règle (chapô de la page France, méta-descriptions des villes et des expertises, chapô du devis…) : à réécrire si Mehdi le souhaite, la règle interdit de le faire ici.

## Page par page

### `/lp/devis/`

- title : « Devis maintenance industrielle gratuit · Réponse 2h | Migen » devient « Devis maintenance industrielle gratuit | Migen ». Motif : délai chiffré « Réponse 2h » retiré.
- meta : « Réponse sous 2h ouvrées, gratuit et sans engagement, partout en France. » retiré. Motif : phrase retirée : sans engagement, délai chiffré (seul « rappel dans l'heure » est permis).
- short : « Devis maintenance industrielle gratuit · Réponse 2h » devient « Devis maintenance industrielle gratuit ». Motif : délai chiffré « Réponse 2h » retiré.
- h1 : « Votre devis maintenance industrielle, chiffré sous 2 h ouvrées. » devient « Votre devis maintenance industrielle. ». Motif : délai chiffré « 2 h ouvrées » retiré, le reste du titre est inchangé.
- h1b : « Votre devis maintenance industrielle, chiffré sous 2 h ouvrées. » devient « Votre devis maintenance industrielle. ». Motif : délai chiffré « 2 h ouvrées » retiré, le reste du titre est inchangé.
- chapo : « Décrivez votre besoin (régie continue, intervention ponctuelle, arrêt technique, montage) : un expert Migen revient vers vous dans l’heure avec une proposition claire, chiffrée et sans engagement. » retiré. Motif : phrase retirée : régie, sans engagement.
- badges[1] : « Gratuit & sans engagement » retiré. Motif : phrase retirée : sans engagement.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- form.sub : « 2 minutes, réponse dans l’heure. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · cards[0].h : « Régie technique » retiré. Motif : phrase retirée : régie.
- section « Savoir-faire » · cards[0] : « 01 / Techniciens intégrés à vos équipes. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · h2 : « Six métiers, un interlocuteur national » retiré. Motif : titre retiré : il annonce six métiers, la section en garde 5.
- section « Savoir-faire » · cards : « numéros 02, 03, 04, 05, 06 » devient « numéros 01, 02, 03, 04, 05 ». Motif : numérotation recalée après le retrait d'une carte.
- section « Savoir-faire » · kick : « Savoir-faire » retiré. Motif : sur-titre retiré avec son titre.
- section « Nos deux offres » · cards[0].cta : « En savoir plus » retiré. Motif : phrase retirée : en savoir plus.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous ne plaçons pas du volume. Migen est spécialisé exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur un CV envoyé. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Questions fréquentes » · faq[2] : « C'est plus cher qu'un intérim classique ? / Le coût d'un poste non pourvu ou d'un arrêt de ligne dépasse largement l'écart de prix. Vous payez une compétence rare, fiable et immédiatement productive, pas un profil de volume. » retiré. Motif : question retirée avec sa réponse : intérim.
- section « Nos implantations » · hubImg : « 10 vignettes assets/villes/<ville>.jpg (absentes du site) » devient « /assets/villes/hub-<ville>.jpg ». Motif : les photos des dix hubs sous licence, servies par l'accueil et /implantations/ (photos-hubs.ts).

### `/lp/maintenance-ind/cefri/`

- meta : « Migen met à disposition des techniciens habilités RP pour la maintenance en zone nucléaire (INB) : interventions en zone contrôlée, mécanique, électrique, électromécanique. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Interventions en zone contrôlée, exigences de radioprotection, profils rares et habilités : Migen met à disposition des techniciens certifiés CEFRI, formés aux installations nucléaires de base, en intervention ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des techniciens habilités RP et certifiés CEFRI : maintenance mécanique, électrique et électromécanique en INB, dans le respect strict des procédures de radioprotection. » retiré. Motif : phrase retirée : mise à disposition.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/electrique/`

- chapo : « Diagnostic, dépannage, raccordements, contrôles, maintenance préventive : Migen met à disposition des techniciens électriciens industriels habilités, capables d'intervenir sur vos installations de puissance et de distribution en respectant les règles de sécurité de vos sites. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des techniciens électriciens industriels formés aux environnements de production : automatisme de puissance, distribution, équipements de commande. » retiré. Motif : phrase retirée : mise à disposition.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/electromeca/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/hydraulique/`

- h1 : « Hydraulique. Diagnostic, remplacement, réglages : des techniciens qui fiabilisent vos circuits. » devient « Hydraulique. Diagnostic, remplacement, réglages[espace insécable]: des techniciens qui fiabilisent vos circuits. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Diagnostic, remplacement, réglages : des techniciens qui fiabilisent vos circuits. » devient « Diagnostic, remplacement, réglages[espace insécable]: des techniciens qui fiabilisent vos circuits. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- chapo : « Centrales hydrauliques, vérins, distributeurs, pompes, accumulateurs, flexibles : Migen met à disposition des techniciens spécialisés capables d'intervenir rapidement sur vos installations hydrauliques, en respectant les exigences sécurité de vos sites. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Questions fréquentes » · faq[4].a : « Oui. Nos techniciens hydrauliciens interviennent notamment sur presses, machines spéciales, équipements mobiles et lignes de production. » devient « Oui. Nos techniciens hydrauliciens interviennent sur presses, machines spéciales, équipements mobiles et lignes de production. ». Motif : « notamment » retiré, la phrase reste (décision du 09/10, lib/decisions-copie.ts).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/mecanique/`

- meta : « Migen met à disposition des techniciens de maintenance mécanique pour vos sites industriels : démontage, alignements, remise en service, arrêts techniques et renfort d'équipe. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des techniciens de maintenance mécanique formés aux environnements industriels exigeants : production, agroalimentaire, logistique, automobile, packaging. » retiré. Motif : phrase retirée : mise à disposition.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/pneumatique/`

- h1 : « Pneumatique. Vérins, distributeurs, circuits d'air : des techniciens pour fiabiliser vos installations. » devient « Pneumatique. Vérins, distributeurs, circuits d'air[espace insécable]: des techniciens pour fiabiliser vos installations. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Vérins, distributeurs, circuits d'air : des techniciens pour fiabiliser vos installations. » devient « Vérins, distributeurs, circuits d'air[espace insécable]: des techniciens pour fiabiliser vos installations. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- chapo : « Vérins, distributeurs, électrovannes, capteurs, traitement de l'air, recherche de fuites : Migen met à disposition des techniciens spécialisés pour fiabiliser vos circuits d'air comprimé et limiter les pertes de production comme d'énergie. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/preventive-predictive/`

- meta : « Migen met à disposition des techniciens pour votre maintenance préventive et prédictive : plans de maintenance, audits terrain, maintenance conditionnelle, capteurs/IoT, reporting GMAO. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des techniciens formés à la maintenance préventive et conditionnelle : construction de plans, audits terrain, exploitation des données capteurs, reporting GMAO. » retiré. Motif : phrase retirée : mise à disposition.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/robotique/`

- meta : « Migen met à disposition des roboticiens qualifiés : dépannage, maintenance préventive, programmation et retrofit sur Fanuc, ABB, Stäubli, Kuka, Universal Robots. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des roboticiens formés aux principales marques (Fanuc, ABB, Stäubli, Kuka, Universal Robots) : dépannage, préventif, programmation, retrofit. » retiré. Motif : phrase retirée : mise à disposition.
- section « Nos interventions robotique » · items[4].h : « Roboticiens en régie » retiré. Motif : phrase retirée : régie.
- section « Nos interventions robotique » · items[4] : « Techniciens dédiés sur votre site, courte ou longue durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-ind/transfert-montage/`

- meta : « Migen met à disposition des techniciens pour le transfert, le montage et la mise en service de vos machines : démontage, transport, remontage, tests et validation production. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Déménagement d'atelier, installation de machine neuve, mise en service à tenir : Migen met à disposition des techniciens pour démonter, transporter, remonter et redémarrer vos équipements, sans perdre des semaines de production. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Notre réponse » · lead : « Migen met à disposition des techniciens pour le transfert et le montage de vos équipements : démontage repéré, transport, remontage, assemblage de lignes et mise en service avec validation production. » retiré. Motif : phrase retirée : mise à disposition.
- section « Nos interventions transfert & montage » · items[4].d : « Intégration de lignes de production clé en main. » retiré. Motif : phrase retirée : clé en main.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/maintenance-industrielle-bordeaux/`

- meta : « Migen met à disposition des techniciens qualifiés à Bordeaux pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Toulouse. » retiré. Motif : phrase retirée : ville-hub rattachée au hub de Toulouse.
- badges[0] : « Hub Toulouse » retiré. Motif : segment retiré : ville-hub rattachée au hub de Toulouse.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10OSPM (CDN d'Envato, filigrané) » devient « /assets/villes/hub-bordeaux.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Toulouse » retiré. Motif : segment retiré : ville-hub rattachée au hub de Toulouse.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Gironde » · lead : « Renfort technique mobilisé en moins de 3 semaines. Préventif tenu sur 8 mois, contrat reconduit à l'échéance. » devient « Renfort technique mobilisé. Préventif tenu sur 8 mois, contrat reconduit à l'échéance. ». Motif : délai chiffré retiré de la carte « Cas client ».
- section « Cas client · Gironde » · lead : « Renfort technique mobilisé. Préventif tenu sur 8 mois, contrat reconduit à l'échéance. » devient « Renfort technique mobilisé. Préventif tenu, contrat reconduit à l'échéance. ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Bordeaux » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-brest/`

- meta : « Migen met à disposition des techniciens qualifiés à Brest pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Brest et en Finistère, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Nantes. » devient « À Brest et dans le Finistère, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Nantes. ». Motif : faute de français de la V3 : « dans le Finistère ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Finistère » · h2 : « Chantier naval en Finistère » devient « Chantier naval dans le Finistère ». Motif : faute de français de la V3 : « dans le Finistère ».
- section « Maintenance industrielle à Brest » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle à Brest » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Brest » · h2 : « Pourquoi un partenaire maintenance basé à Brest ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Brest » · kick : « Maintenance industrielle à Brest » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-france/`

- meta : « Absences, urgences, arrêts techniques : Migen met à disposition des techniciens qualifiés pour renforcer votre maintenance industrielle en France » retiré. Motif : phrase retirée : mise à disposition.
- h1 : « Votre service de maintenance industrielle : des techniciens qualifiés en renfort sur votre site. » devient « Votre service de maintenance industrielle[espace insécable]: des techniciens qualifiés en renfort sur votre site. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Votre service de maintenance industrielle : des techniciens qualifiés en renfort sur votre site. » devient « Votre service de maintenance industrielle[espace insécable]: des techniciens qualifiés en renfort sur votre site. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- chapo : « Dépannage, maintenance préventive, arrêts techniques ou renfort durable sur site : Migen met à votre disposition des techniciens de maintenance qualifiés et autonomes, en ponctuel ou sur la durée, pour sécuriser la disponibilité de vos lignes. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · cards[0].h : « Régie technique » retiré. Motif : phrase retirée : régie.
- section « Savoir-faire » · cards[0] : « 01 / Techniciens intégrés à vos équipes. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · h2 : « Six métiers, un interlocuteur national » retiré. Motif : titre retiré : il annonce six métiers, la section en garde 5.
- section « Savoir-faire » · cards : « numéros 02, 03, 04, 05, 06 » devient « numéros 01, 02, 03, 04, 05 ». Motif : numérotation recalée après le retrait d'une carte.
- section « Savoir-faire » · kick : « Savoir-faire » retiré. Motif : sur-titre retiré avec son titre.
- section « Nos deux offres » · cards[0].cta : « En savoir plus » retiré. Motif : phrase retirée : en savoir plus.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous ne plaçons pas du volume. Migen est spécialisé exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur un CV envoyé. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Questions fréquentes » · faq[2] : « C'est plus cher qu'un intérim classique ? / Le coût d'un poste non pourvu ou d'un arrêt de ligne dépasse largement l'écart de prix. Vous payez une compétence rare, fiable et immédiatement productive, pas un profil de volume. » retiré. Motif : question retirée avec sa réponse : intérim.
- section « Nos implantations » · hubImg : « 10 vignettes assets/villes/<ville>.jpg (absentes du site) » devient « /assets/villes/hub-<ville>.jpg ». Motif : les photos des dix hubs sous licence, servies par l'accueil et /implantations/ (photos-hubs.ts).

### `/lp/maintenance-industrielle-grenoble/`

- meta : « Migen met à disposition des techniciens qualifiés à Grenoble pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Isère » · checks[0] : « Disponibilité tenue · 12 mois » devient « Disponibilité tenue ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Cas client · Isère » · lead : « Techniciens maintenance déployés en salle blanche. Disponibilité ligne maintenue sur 12 mois consécutifs. » devient « Techniciens maintenance déployés en salle blanche. Disponibilité ligne maintenue. ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Grenoble » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle à Grenoble » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Grenoble » · h2 : « Pourquoi un partenaire maintenance basé à Grenoble ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Grenoble » · kick : « Maintenance industrielle à Grenoble » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-le-havre/`

- meta : « Migen met à disposition des techniciens qualifiés au Havre pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- h1 : « Le technicien de maintenance qu'il vous manque, opérationnel à Le Havre. » devient « Le technicien de maintenance qu'il vous manque, opérationnel au Havre. ». Motif : faute de français de la V3 : « au Havre ».
- h1b : « Le technicien de maintenance qu'il vous manque, opérationnel à Le Havre. » devient « Le technicien de maintenance qu'il vous manque, opérationnel au Havre. ». Motif : faute de français de la V3 : « au Havre ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Nantes. » retiré. Motif : phrase retirée : rattachement au hub de Nantes, qui n'est pas le plus proche.
- badges[0] : « Hub Nantes » retiré. Motif : segment retiré : rattachement au hub de Nantes, qui n'est pas le plus proche.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10N758 (CDN d'Envato, filigrané) » devient « /assets/villes/ville-le-havre.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Nantes » retiré. Motif : segment retiré : rattachement au hub de Nantes, qui n'est pas le plus proche.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle au Havre » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle au Havre » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle au Havre » · h2 : « Pourquoi un partenaire maintenance basé au Havre ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle au Havre » · kick : « Maintenance industrielle au Havre » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-lille/`

- meta : « Migen met à disposition des techniciens qualifiés à Lille pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Lille et en Nord, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. » devient « À Lille et dans le Nord, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. ». Motif : faute de français de la V3 : « dans le Nord ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Lyon. » retiré. Motif : phrase retirée : ville-hub rattachée au hub de Lyon.
- badges[0] : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Lille » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-lyon/`

- meta : « Migen met à disposition des techniciens qualifiés pour renforcer votre maintenance industrielle à Lyon : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Lyon et dans le Rhône, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Agence à Écully, 129 chemin du Moulin Carron. » devient « À Lyon et dans le Rhône, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Siège à Écully, 129 chemin du Moulin Carron. ». Motif : le siège est à Écully (Mehdi, 16/10).
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- badges[0] : « Agence Lyon · Écully » devient « Siège Lyon · Écully ». Motif : le siège est à Écully (Mehdi, 16/10).
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10QDY1 (CDN d'Envato, filigrané) » devient « /assets/villes/ville-lyon.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · h2 : « Agence Lyon · Écully » devient « Siège Lyon · Écully ». Motif : le siège est à Écully (Mehdi, 16/10).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Rhône » · checks[0] : « Reconduit 2 ans · préventif tenu » devient « Reconduit · préventif tenu ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Cas client · Rhône » · lead : « Équipe mobilisée sur un site lyonnais. Maintenance préventive tenue, contrat reconduit deux années consécutives. » devient « Équipe mobilisée sur un site lyonnais. Maintenance préventive tenue, contrat reconduit. ». Motif : durée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Lyon » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-marseille/`

- meta : « Migen met à disposition des techniciens qualifiés à Marseille pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Marseille et en Bouches-du-Rhône, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. » devient « À Marseille et dans les Bouches-du-Rhône, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. ». Motif : faute de français de la V3 : « dans les Bouches-du-Rhône ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Lyon. » retiré. Motif : phrase retirée : ville-hub rattachée au hub de Lyon.
- badges[0] : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E108N92Z (CDN d'Envato, filigrané) » devient « /assets/villes/hub-marseille.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Marseille » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-metz/`

- meta : « Migen met à disposition des techniciens qualifiés à Metz pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Lyon. » retiré. Motif : phrase retirée : ville-hub rattachée au hub de Lyon.
- badges[0] : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Lyon » retiré. Motif : segment retiré : ville-hub rattachée au hub de Lyon.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Metz » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-nantes/`

- meta : « Migen met à disposition des techniciens qualifiés à Nantes pour renforcer votre maintenance industrielle : urgences, absences, pics d'activité et arrêts techniques. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10OW8U (CDN d'Envato, filigrané) » devient « /assets/villes/ville-nantes.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Loire-Atlantique » · checks[0] : « Reconduit · 18 mois » devient « Reconduit ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Cas client · Loire-Atlantique » · lead : « Mobilisation de techniciens pluridisciplinaires sur un site aéro local. Mission reconduite sur 18 mois. » devient « Mobilisation de techniciens pluridisciplinaires sur un site aéro local. Mission reconduite. ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Nantes » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-nice/`

- meta : « Migen met à disposition des techniciens qualifiés à Nice pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Nice et en Alpes-Maritimes, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. » devient « À Nice et dans les Alpes-Maritimes, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Techniciens déployés depuis notre hub Migen de Lyon. ». Motif : faute de français de la V3 : « dans les Alpes-Maritimes ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Techniciens déployés depuis notre hub Migen de Lyon. » retiré. Motif : phrase retirée : rattachement au hub de Lyon, qui n'est pas le plus proche.
- badges[0] : « Hub Lyon » retiré. Motif : segment retiré : rattachement au hub de Lyon, qui n'est pas le plus proche.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Hub Lyon » retiré. Motif : segment retiré : rattachement au hub de Lyon, qui n'est pas le plus proche.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Nice » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle à Nice » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Nice » · h2 : « Pourquoi un partenaire maintenance basé à Nice ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Nice » · kick : « Maintenance industrielle à Nice » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-paris/`

- meta : « Migen met à disposition des techniciens qualifiés pour renforcer votre maintenance industrielle à Paris : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Agence à La Défense, 16 place de l'Iris à Courbevoie. » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- badges[0] : « Agence Paris · La Défense » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10QF8J (CDN d'Envato, filigrané) » devient « /assets/villes/ville-paris.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Pourquoi notre agence locale » · h2 : « Agence Paris · La Défense » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Paris » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-rennes/`

- meta : « Migen met à disposition des techniciens qualifiés à Rennes pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Rennes » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle à Rennes » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Rennes » · h2 : « Pourquoi un partenaire maintenance basé à Rennes ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Rennes » · kick : « Maintenance industrielle à Rennes » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-rouen/`

- meta : « Migen met à disposition des techniciens qualifiés à Rouen pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Maintenance industrielle à Rouen » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Maintenance industrielle à Rouen » · lead : « Avoir un partenaire maintenance local, c'est la garantie d'une mobilisation rapide sans frais de déplacement excessifs. » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Rouen » · h2 : « Pourquoi un partenaire maintenance basé à Rouen ? » retiré. Motif : phrase retirée : implantation locale qui n'existe pas (aucun hub dans cette ville).
- section « Maintenance industrielle à Rouen » · kick : « Maintenance industrielle à Rouen » retiré. Motif : sur-titre retiré avec son titre.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-strasbourg/`

- meta : « Migen met à disposition des techniciens qualifiés à Strasbourg pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « À Strasbourg et en Bas-Rhin, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Hub Migen à Strasbourg. » devient « À Strasbourg et dans le Bas-Rhin, vos installations doivent rester opérationnelles. Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. Hub Migen à Strasbourg. ». Motif : faute de français de la V3 : « dans le Bas-Rhin ».
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- img : « aperçu Envato E10DWX6 (CDN d'Envato, filigrané) » devient « /assets/villes/ville-strasbourg.jpg ». Motif : image externe : la même photo, sous licence, déjà servie par /implantations/.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Bas-Rhin » · checks[0] : « Reconduit · 12 mois » devient « Reconduit ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Cas client · Bas-Rhin » · lead : « Techniciens déployés sur un site pharma alsacien. Préventif tenu sur 12 mois, contrat reconduit à l'échéance. » devient « Techniciens déployés sur un site pharma alsacien. Préventif tenu, contrat reconduit à l'échéance. ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Strasbourg » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/maintenance-industrielle-toulouse/`

- meta : « Migen met à disposition des techniciens qualifiés à Toulouse pour renforcer votre maintenance industrielle : urgences, absences, arrêts techniques et besoins sur site. » retiré. Motif : phrase retirée : mise à disposition.
- chapo : « Migen met à disposition des techniciens de maintenance industrielle pour intervenir sur vos sites, en renfort ponctuel ou en présence continue. » retiré. Motif : phrase retirée : mise à disposition.
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Pourquoi notre agence locale » · kick : « Pourquoi notre agence locale » retiré. Motif : phrase retirée : agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Cas client · Haute-Garonne » · checks[0] : « Reconduit · 18 mois » devient « Reconduit ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Cas client · Haute-Garonne » · lead : « Renfort pluridisciplinaire mobilisé sur un site aéro local. Mission reconduite sur 18 mois. » devient « Renfort pluridisciplinaire mobilisé sur un site aéro local. Mission reconduite. ». Motif : durée chiffrée retirée de la carte « Cas client ».
- section « Maintenance industrielle à Toulouse » · paras[0] : « Nous intervenons en préventif comme en curatif, en régie ou au forfait. » retiré. Motif : phrase retirée : régie.
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).

### `/lp/merci/`

- meta : « Absences, urgences, arrêts techniques : Migen met à disposition des techniciens qualifiés pour renforcer votre maintenance industrielle en France » retiré. Motif : phrase retirée : mise à disposition.

### `/lp/rendez-vous/`

- meta : « Demande reçue. Choisissez un créneau de 30 minutes avec un expert Migen pour qualifier votre besoin de maintenance. » devient « Demande reçue. Choisissez un créneau avec un expert Migen pour qualifier votre besoin de maintenance. ». Motif : durée chiffrée « 30 minutes » retirée.
- h1 : « Dernière étape : réservez votre échange. » devient « Dernière étape[espace insécable]: réservez votre échange. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Dernière étape : réservez votre échange. » devient « Dernière étape[espace insécable]: réservez votre échange. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- chapo : « 30 minutes pour qualifier votre besoin et vous proposer le bon technicien, sans engagement. » retiré. Motif : phrase retirée : sans engagement, délai chiffré (seul « rappel dans l'heure » est permis).

### `/lp/secteurs/aeronautique/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/agroalimentaire/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/automobile/`

- h1 : « Automobile. OEM, équipementiers, sous-traitants : des techniciens pour vos lignes d'assemblage et de production. » devient « Automobile. OEM, équipementiers, sous-traitants[espace insécable]: des techniciens pour vos lignes d'assemblage et de production. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « OEM, équipementiers, sous-traitants : des techniciens pour vos lignes d'assemblage et de production. » devient « OEM, équipementiers, sous-traitants[espace insécable]: des techniciens pour vos lignes d'assemblage et de production. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/centre-logistique/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/chimie/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Ils témoignent » · cases[0].t : « Maintenir des machines conçues sur mesure » devient « Maintenir des machines conçues en interne ». Motif : « conçues sur mesure » devient « conçues en interne » (arbitrage Tournaire du 08/10, lib/decisions-copie.ts).
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/industrie-lourde/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/industrie-metallique/`

- h1 : « Métallique. Presses, lignes de profilage, robots de soudure : nos techniciens connaissent vos équipements. » devient « Métallique. Presses, lignes de profilage, robots de soudure[espace insécable]: nos techniciens connaissent vos équipements. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Presses, lignes de profilage, robots de soudure : nos techniciens connaissent vos équipements. » devient « Presses, lignes de profilage, robots de soudure[espace insécable]: nos techniciens connaissent vos équipements. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/menuiserie-industrielle/`

- h1 : « Menuiserie. Lignes PVC, alu, bois, vitrage : des techniciens pour vos équipements de production. » devient « Menuiserie. Lignes PVC, alu, bois, vitrage[espace insécable]: des techniciens pour vos équipements de production. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- h1b : « Lignes PVC, alu, bois, vitrage : des techniciens pour vos équipements de production. » devient « Lignes PVC, alu, bois, vitrage[espace insécable]: des techniciens pour vos équipements de production. ». Motif : espace insécable avant les deux-points : la ligne ne commence plus par « : ».
- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/secteurs/pharmaceutique/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Plus de 200 clients satisfaits » · t : « Plus de 200 clients satisfaits » devient « Plus de 200 clients ». Motif : « +200 clients » sans le qualificatif « satisfaits ».
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous sommes spécialisés exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur l'envoi d'un CV. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Prêt à démarrer » · floats[1] : « 10 h · ubs en France » devient « 10 · hubs en France ». Motif : flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai.

### `/lp/technicien-disponible/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · cards[0].h : « Régie technique » retiré. Motif : phrase retirée : régie.
- section « Savoir-faire » · cards[0] : « 01 / Techniciens intégrés à vos équipes. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · h2 : « Six métiers, un interlocuteur national » retiré. Motif : titre retiré : il annonce six métiers, la section en garde 5.
- section « Savoir-faire » · cards : « numéros 02, 03, 04, 05, 06 » devient « numéros 01, 02, 03, 04, 05 ». Motif : numérotation recalée après le retrait d'une carte.
- section « Savoir-faire » · kick : « Savoir-faire » retiré. Motif : sur-titre retiré avec son titre.
- section « Nos deux offres » · cards[0].cta : « En savoir plus » retiré. Motif : phrase retirée : en savoir plus.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous ne plaçons pas du volume. Migen est spécialisé exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur un CV envoyé. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Questions fréquentes » · faq[2] : « C'est plus cher qu'un intérim classique ? / Le coût d'un poste non pourvu ou d'un arrêt de ligne dépasse largement l'écart de prix. Vous payez une compétence rare, fiable et immédiatement productive, pas un profil de volume. » retiré. Motif : question retirée avec sa réponse : intérim.
- section « Nos implantations » · hubImg : « 10 vignettes assets/villes/<ville>.jpg (absentes du site) » devient « /assets/villes/hub-<ville>.jpg ». Motif : les photos des dix hubs sous licence, servies par l'accueil et /implantations/ (photos-hubs.ts).

### `/lp/urgence/`

- hs[0] : « 4,9/5 · satisfaction client » devient « 4,6 / 5 · avis Google ». Motif : la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source.
- section « Nos expertises » · items[3].h : « Renfort d'équipe en régie » retiré. Motif : phrase retirée : régie.
- section « Nos expertises » · items[3] : « Des techniciens autonomes intégrés à vos équipes, en ponctuel ou sur la durée. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · cards[0].h : « Régie technique » retiré. Motif : phrase retirée : régie.
- section « Savoir-faire » · cards[0] : « 01 / Techniciens intégrés à vos équipes. » retiré. Motif : la description part avec son titre, l'élément entier est retiré.
- section « Savoir-faire » · h2 : « Six métiers, un interlocuteur national » retiré. Motif : titre retiré : il annonce six métiers, la section en garde 5.
- section « Savoir-faire » · cards : « numéros 02, 03, 04, 05, 06 » devient « numéros 01, 02, 03, 04, 05 ». Motif : numérotation recalée après le retrait d'une carte.
- section « Savoir-faire » · kick : « Savoir-faire » retiré. Motif : sur-titre retiré avec son titre.
- section « Nos deux offres » · cards[0].cta : « En savoir plus » retiré. Motif : phrase retirée : en savoir plus.
- section « Comment ça marche » · cards[0].d : « 2 min suffisent. » retiré. Motif : phrase retirée : délai chiffré (seul « rappel dans l'heure » est permis).
- section « Questions fréquentes » · faq[0] : « En quoi êtes-vous différents d'une agence d'intérim ? / Nous ne plaçons pas du volume. Migen est spécialisé exclusivement dans les techniciens de maintenance : chaque profil est sélectionné, qualifié et habilité, et nous nous engageons sur la continuité, pas seulement sur un CV envoyé. » retiré. Motif : question retirée avec sa réponse : intérim, agence locale (4 agences : Lyon, Montréal, Dubaï, Madrid).
- section « Questions fréquentes » · faq[2] : « C'est plus cher qu'un intérim classique ? / Le coût d'un poste non pourvu ou d'un arrêt de ligne dépasse largement l'écart de prix. Vous payez une compétence rare, fiable et immédiatement productive, pas un profil de volume. » retiré. Motif : question retirée avec sa réponse : intérim.
- section « Nos implantations » · hubImg : « 10 vignettes assets/villes/<ville>.jpg (absentes du site) » devient « /assets/villes/hub-<ville>.jpg ». Motif : les photos des dix hubs sous licence, servies par l'accueil et /implantations/ (photos-hubs.ts).
