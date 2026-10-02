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
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=formulaire conforme à la maquette

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
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=8 contrôles, 0 en échec | gabarits conformes

- [x] G6: le JavaScript de premier chargement de la page d'accueil tient sous 220 Ko compressés
  CHECK: node scripts/verifie-poids.mjs
  EXPECT: poids JS conforme
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=68101d418901/27 entries; output=accueil : 10 scripts, 646 Ko bruts, 198 Ko gzip (budget 220 Ko) | poids JS conforme

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

- [ ] G11: le site déployé sert une page de chaque gabarit, et reste fermé aux robots
  CHECK: node scripts/verifie-deploiement.mjs
  EXPECT: déploiement conforme
  EVIDENCE: ÉCHOUE au 02/10, exit=1. Les sept gabarits sont bien servis par le déploiement du 02/10 22h57 (accueil, expertises, implantations, fiche, vente, éditorial, vente profonde), chacun avec un seul h1 non vide, et robots.txt répond « Disallow: / ». Le contrôle échoue sur une seule assertion, et elle est juste : /expertises/ a un titre identique à son h1, ce que les règles du projet interdisent. Corrigé par le chantier des métadonnées, à re-lancer ensuite. La récupération passe par « bunx vercel curl » : la protection de déploiement Vercel est active, donc rien n'est public, ce qui est voulu tant que migen.fr ne pointe pas ici.

- [x] G12: aucune formulation interdite par le contrat dans la copie du site
  CHECK: node scripts/verifie-interdits.mjs
  EXPECT: copie conforme aux interdits du contrat
  EVIDENCE: exit=0 le 02/10 ; contrôle POSITIF passé d'abord, pour prouver qu'il sait échouer : « Plus de 200 clients accompagnés, sans engagement — clé en main » injecté dans MarqueeClients.tsx donne exit=1 et nomme les 4 interdits (200 clients, sans engagement, clé en main, tiret cadratin) ; le commentaire voisin qui CITE la formulation ne déclenche rien (les commentaires sont retirés avant la recherche). A trouvé 5 occurrences réelles de « +200 clients » rendues aux visiteurs (en-tête, héros, bande de logos, frise, chiffres), corrigées.

- [x] G13: aucune page publiée n'a un titre identique à son h1, ni de métadonnée manquante
  CHECK: node scripts/verifie-seo.mjs
  EXPECT: métadonnées conformes
  EVIDENCE: exit=0, « 120 pages publiées contrôlées, 0 problème(s) ». CONTRÔLE POSITIF fourni par les données elles-mêmes, avant correction : le même script sortait en 1 avec 28 problèmes, puis 19 après exemption raisonnée des gabarits fiche, casclients, expertises et implantations (une étude de cas ou un hub ne vise pas de mot clé, et l'exemption porte sur le gabarit, pas sur une liste de chemins qui dériverait). Il nommait 8 pages publiées dont le titre répétait le h1, dont les plus commerciales du site, et 11 pages de vente sans mot clé. 53 pages corrigées en tout, chaque titre écrit après lecture du contenu de la page. LIMITE CONNUE ET ANNONCÉE PAR LA SORTIE : ce contrôle ne juge que le PUBLIÉ, la clé anonyme ne voyant pas les brouillons (et la sécurité au niveau des lignes empêchant même de les compter). Un agent correcteur l'a signalé de lui-même : ses 39 brouillons passaient « trivialement, le contrôle ne les lit pas ». Vérifié à la place par le MCP, qui lit tout : sur les 225 pages, 0 doublon de titre et 5 titres encore identiques au h1, tous en brouillon, dont 3 sur des pages encore sans contenu, où un titre serait deviné. Le contrôle juge les brouillons dès que SUPABASE_SERVICE_ROLE_KEY est posée, en avertissement (un brouillon n'est pas servi).

- [ ] G14: le site tient sur téléphone : aucun débordement, cibles tactiles à 24 px, champs à 16 px
  CHECK: node scripts/verifie-mobile.mjs
  EXPECT: mise en page mobile conforme
  EVIDENCE: pending

- [ ] G15: aucun composant ne reste en Tailwind d'échafaudage (classes zinc, variantes dark:)
  CHECK: node scripts/verifie-echafaudage.mjs
  EXPECT: aucun échafaudage
  EVIDENCE: pending
