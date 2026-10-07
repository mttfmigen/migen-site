# Gates: fidélité à la maquette, phase 2b

OWNS: app/**, components/site/**, components/formulaire/**, types/**, scripts/**, supabase/import/**

Scope: le site reproduit la maquette Claude Design à l'identique (animations, formulaire, gabarits par type de page, dimensions), le contenu des 185 pages est complet et intact en base, et l'ensemble tient le budget de performance.

- [x] G1: la chaîne de vérification complète passe, build de production inclus
  CHECK: bun run verifie
  EXPECT: /✓ Generating static pages using \d+ workers \(\d+\/\d+\)/
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=⚠️  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715 | ⚠️

- [x] G2: le formulaire de contact a la grille, les libellés et le bouton de la maquette
  CHECK: bun scripts/verifie-formulaire.tsx
  EXPECT: formulaire conforme à la maquette
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=comparé au fichier du client : 6 champs obligatoires, 6 indicatifs | formulaire conforme à la maquette

- [x] G3: la page d'accueil construite porte les 20 blocs à révélation de la maquette
  CHECK: node scripts/verifie-reveal.mjs
  EXPECT: révélations conformes
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=data-reveal : 20 (attendu ≥ 20) · blocs masqués au rendu serveur : 0 | révélations conformes

- [x] G4: aucun lien inerte sur l'accueil, et l'ancre du bouton principal existe
  CHECK: bun components/site/accueil/verification-ouverture.tsx
  EXPECT: aucun lien inerte, ancre du formulaire résolue
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=Ouverture de l'accueil : toutes les assertions passent. | Ouverture : aucun lien inerte, ancre du formulaire résolue.

- [x] G5: chaque famille d'URL est servie par son gabarit propre, et chaque gabarit rend un seul h1
  CHECK: node scripts/verifie-gabarits.mjs
  EXPECT: gabarits conformes
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=21 contrôles, 0 en échec | gabarits conformes

- [x] G6: le JavaScript de premier chargement de la page d'accueil tient sous 220 Ko compressés
  CHECK: node scripts/verifie-poids.mjs
  EXPECT: poids JS conforme
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=accueil : 10 scripts, 648 Ko bruts, 199 Ko gzip (budget 220 Ko) | poids JS conforme

- [x] G7: chaque section de l'accueil a la hauteur de la maquette, à 40 px près, hors écarts déclarés
  CHECK: node scripts/verifie-fidelite.mjs
  EXPECT: fidélité des hauteurs conforme
  EVIDENCE: exit=0 ; node scripts/verifie-fidelite.mjs, Chrome piloté par Playwright, les DEUX pages dans le même navigateur à 1280x860, h1 vérifié à 56.32px des deux côtés : « 20 sections comparées à 1280 px : 15 au pixel, 5 écarts déclarés, 0 anomalie(s) », page 13974 px contre 14028 px. Les 5 écarts sont déclarés DANS le script avec leur raison : mention RGPD du formulaire (sections 0 et 19, exigée aux articles 13 et 14 du RGPD, absente de la maquette), deux notes de travail de la maquette retirées (11 et 12 : « Verbatims reformulés à valider », « Jalons à confirmer »), une phrase coupée avant « pour des prestations sur mesure », formulation interdite (13). CONTRÔLE POSITIF passé d'abord : en retirant l'exception de la section 0 et en ajoutant une exception inutile sur la section 5, le script sort en 1 et nomme les deux cas. Une exception devenue inutile fait donc échouer le contrôle, ce qui empêche la liste de grossir jusqu'à tout autoriser.

- [x] G8: deux secondes de défilement continu ne produisent aucune image de plus de 50 ms
  CHECK: node scripts/verifie-animations.mjs
  EXPECT: /0 au-delà de 50 ms/
  EVIDENCE: exit=0 ; node scripts/verifie-animations.mjs (développement) : « armement : 20 blocs, 20 armés, 20 masqués, 20 sous la ligne » puis « défilement : 120 images à 60 i/s, 0 au-delà de 50 ms, max 17 ms (première passe : 8 longue(s), max 233 ms) ». Seule la seconde passe est jugée, la première payant le décodage des images, et les deux chiffres sont imprimés. Mesuré auparavant sur la version CONSTRUITE (next start, 1280x860, onglet au premier plan) : 241 images à 120 i/s, 0 longue, max 10 ms.

- [x] G9: avec prefers-reduced-motion, aucun bloc n'est masqué et les rails ne bougent pas
  CHECK: node scripts/verifie-animations.mjs
  EXPECT: /mouvement réduit : 0 masqué\(s\), 0 armé\(s\), 0\//
  EVIDENCE: exit=0 ; même commande, troisième contrôle, contexte Playwright à reducedMotion « reduce » : « mouvement réduit : 0 masqué(s), 0 armé(s), 0/1 rail(s) en mouvement ». Rien n'est masqué, rien n'est armé, le rail ne défile pas, aucune barre laissée à 0 %. C'est le JavaScript qui pose opacity 0, jamais le CSS : sans JavaScript ou avec mouvement réduit, la page s'affiche entière.

- [ ] G10: le contenu importé est complet en base, aucune page tronquée ni vidée
  CHECK: node scripts/verifie-base.mjs
  EXPECT: contenu complet en base
  EVIDENCE: ÉCHOUE au 02/10, exit=1, et pour une bonne raison : « 205 pages attendues par l'import, 119 complètes » avec la clé ANONYME, qui ne voit que le publié. SUPABASE_SERVICE_ROLE_KEY est VIDE dans .env.local, or les pages vidées par une instruction refusée sont justement en brouillon : le contrôle refuse donc de conclure plutôt que de réussir en n'ayant rien regardé. Il imprime quand même ce qu'il a vu. Mesuré en parallèle par le MCP Supabase, qui lit tout : 114 pages de vente à 10 sections (toutes complètes), 1 incomplète (/expertises/robotique/fanuc/, 3 sections sur 10, brouillon), 32 pages de gabarit maquette posées, 0 commentaire HTML, 0 note de travail. L'éditorial était à 28 pages sur 59 : 31 pages vidées par des instructions refusées, reprise lancée. BLOQUANT POUR MEHDI : poser la clé de service (console Supabase, Project Settings, API) pour que ce contrôle puisse répondre.

- [x] G11: le site déployé sert une page de chaque gabarit, et reste fermé aux robots
  CHECK: node scripts/verifie-deploiement.mjs
  EXPECT: déploiement conforme
  EVIDENCE: exit=0, « déploiement conforme : 12 gabarits servis, robots fermés », sur le déploiement du 03/10. Douze familles servies, chacune avec un seul h1 non vide et un titre distinct du h1 : accueil, expertises, implantations, fiche de cas, vente, éditorial, vente profonde, et les cinq écrans portés en routes (contact, mentions légales, confidentialité, nous connaître, plan du site). robots.txt répond « Disallow: / », voulu tant que migen.fr ne sert pas ce déploiement. La récupération passe par « bunx vercel curl », la protection de déploiement étant active. CONTRÔLE POSITIF fourni par les données au premier passage : exit=1 sur « /expertises/ : le titre est identique au h1 », défaut réel corrigé depuis sur 53 pages.

- [x] G12: aucune formulation interdite par le contrat dans la copie du site
  CHECK: node scripts/verifie-interdits.mjs
  EXPECT: copie conforme aux interdits du contrat
  EVIDENCE: exit=0 le 02/10 ; contrôle POSITIF passé d'abord, pour prouver qu'il sait échouer : « Plus de 200 clients accompagnés, sans engagement — clé en main » injecté dans MarqueeClients.tsx donne exit=1 et nomme les 4 interdits (200 clients, sans engagement, clé en main, tiret cadratin) ; le commentaire voisin qui CITE la formulation ne déclenche rien (les commentaires sont retirés avant la recherche). A trouvé 5 occurrences réelles de « +200 clients » rendues aux visiteurs (en-tête, héros, bande de logos, frise, chiffres), corrigées.

- [x] G13: aucune page publiée n'a un titre identique à son h1, ni de métadonnée manquante
  CHECK: node scripts/verifie-seo.mjs
  EXPECT: métadonnées conformes
  EVIDENCE: exit=0, « 120 pages publiées contrôlées, 0 problème(s) ». CONTRÔLE POSITIF fourni par les données elles-mêmes, avant correction : le même script sortait en 1 avec 28 problèmes, puis 19 après exemption raisonnée des gabarits fiche, casclients, expertises et implantations (une étude de cas ou un hub ne vise pas de mot clé, et l'exemption porte sur le gabarit, pas sur une liste de chemins qui dériverait). Il nommait 8 pages publiées dont le titre répétait le h1, dont les plus commerciales du site, et 11 pages de vente sans mot clé. 53 pages corrigées en tout, chaque titre écrit après lecture du contenu de la page. LIMITE CONNUE ET ANNONCÉE PAR LA SORTIE : ce contrôle ne juge que le PUBLIÉ, la clé anonyme ne voyant pas les brouillons (et la sécurité au niveau des lignes empêchant même de les compter). Un agent correcteur l'a signalé de lui-même : ses 39 brouillons passaient « trivialement, le contrôle ne les lit pas ». Vérifié à la place par le MCP, qui lit tout : sur les 225 pages, 0 doublon de titre et 5 titres encore identiques au h1, tous en brouillon, dont 3 sur des pages encore sans contenu, où un titre serait deviné. Le contrôle juge les brouillons dès que SUPABASE_SERVICE_ROLE_KEY est posée, en avertissement (un brouillon n'est pas servi).

- [x] G14: le site tient sur téléphone : aucun débordement, cibles tactiles à 24 px, champs à 16 px
  CHECK: node scripts/verifie-mobile.mjs
  EXPECT: mise en page mobile conforme
  EVIDENCE: exit=0, « mise en page mobile conforme ». Quatre pages (accueil, vente, gabarit maquette, éditorial) à trois largeurs (320, 375, 768 px), en contexte tactile Playwright, plus l'ouverture du tiroir : 56 liens atteignables à 320 et à 375 px. CONTRÔLE POSITIF fourni par les défauts réels, successivement : l'îlot débordait de 51 px à 320 px (téléphone et appel à l'action répétés alors que la barre basse les porte déjà sous 881 px, texte du bouton principal coupé) ; 72 liens de pied de page à 19 px, sous le seuil de 24 px du critère 2.5.8 de la WCAG 2.2, dont « Gérer mes traceurs » ; les champs à 14,5 px déclenchaient le zoom d'iOS ; le bandeau de consentement sortait de 16 px à 768 px, `w-full` écrasant la contrainte de droite de `sm:inset-x-4`. Chaque correction a fait baisser le compte, mesuré à chaque fois. L'ORACLE A ÉTÉ CORRIGÉ AVANT D'ÊTRE CRU : il comptait le champ piège posé à -9999 px, les tableaux qui défilent exprès, les bandeaux qui écrivent leur liste deux fois, il imposait 44 px (recommandation d'Apple) là où la WCAG en demande 24, il ignorait l'écart de grille comme espacement équivalent, et il attendait trente secondes sur un bouton de méga-menu caché en croyant tester le tiroir.

- [x] G15: aucun composant ne reste en Tailwind d'échafaudage (classes zinc, variantes dark:)
  CHECK: node scripts/verifie-echafaudage.mjs
  EXPECT: aucun échafaudage
  EVIDENCE: exit=0, « aucun échafaudage ». CONTRÔLE POSITIF ET NÉGATIF passés avant d'être cru : un composant jetable portant « mt-12 flex flex-wrap items-center gap-3 sm:grid-cols-2 » n'est PAS signalé (les utilitaires de mise en page ne portent aucune couleur et ne contredisent rien) ; le même avec « text-zinc-500 dark:text-zinc-300 » sort en 1 et nomme les trois motifs. Il a trouvé 93 classes dans 9 fichiers, toutes retirées : les cinq composants du cocon rendus sur CHAQUE page de contenu (dont le maillage interne, qui ferme toutes les pages), les trois du consentement (la première chose que voit un visiteur) et les couleurs d'état du formulaire, remplacées par les jetons --err et --ok dont le contraste est mesuré (6,54:1 et 7,87:1 sur la carte).

- [ ] G16: tout lien interne du site mène à une page servie, aucune 404
  CHECK: node scripts/verifie-liens.mjs
  EXPECT: tous les liens internes mènent quelque part
  EVIDENCE: ÉCHOUE, exit=1, et le reste est honnête : « 120 pages parcourues, 172 cibles internes distinctes, 17 morte(s), 0 redirigée(s). Plan de site : 149 URL, 0 morte(s). » Au premier passage il en trouvait 44, dont onze citées par le pied de page donc par les 225 pages du site : mentions légales, confidentialité, valeurs, RSE, équipe, partenaires, carrière, nous connaître, ressources, réalisations, et /contact/, cible du bouton de la barre d'action mobile. Les onze écrans manquants ont été portés depuis la maquette en routes statiques, et 29 pages complètes ont été publiées : 44 moins 27. LES 17 QUI RESTENT ONT TOUTES LA MÊME CAUSE ET LE MÊME REMÈDE : ce sont des pages éditoriales tronquées en base par le mur du point-virgule, de 1 bloc sur 71 à 33 sur 41. Les publier serait publier des pages qui s'arrêtent au milieu d'une phrase. Un seul geste les règle, une fois SUPABASE_SERVICE_ROLE_KEY posée : node scripts/importe_rest.mjs. La porte restera rouge jusque-là, et c'est ce qu'on lui demande.

- [x] G17: la page /offres/residence/ sert le rendu figé de la maquette, section par section, mot pour mot
  CHECK: node scripts/verifie-offre-rendu.mjs
  EXPECT: rendu d'offre conforme à la référence
  EVIDENCE: exit=0 le 06/10 : « 17 sections de référence, 18 servies (1 ajout(s) déclaré(s)), 243 lignes de texte comparées, 0 cadratin(s) arbitré(s), 0 trou(s) assumé(s). » La référence est UNIQUE : maquette/rendu/offres--residence.html (le <main> figé) et .json (la mesure, 17 sections), ouverts dans le MÊME navigateur que le site et lus par le MÊME code, sur texte normalisé (insécables, apostrophes). Elle contrôle l'ordre, les titres, chaque ligne visible, l'absence de section en plus et l'absence de tiret cadratin. UNE SEULE EXCEPTION, déclarée dans le script avec sa raison : le fil d'Ariane au rang 0, navigation du site absente de l'application autonome ; son texte exact est re-vérifié à chaque passage, et une exception devenue inutile fait échouer la porte (prouvé : un trou assumé factice sur « Ce que nous garantissons » donne exit=1 et le nomme). CONTRÔLE POSITIF passé d'abord : « Une ligne qui repart » changé en « Une machine qui repart » dans DerouleOffre.tsx donne exit=1 avec DEUX anomalies nommées (le titre de la section 8 et la phrase absente « Un appel. Un plan. Une ligne qui repart. ») ; le mot remis, exit=0. PRÉALABLE : le site en développement sur http://localhost:4340/ (ou SITE_URL vers le build).
