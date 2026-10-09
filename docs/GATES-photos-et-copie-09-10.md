# Gates: état vérifié de la migration du site Migen

OWNS: docs/ETAT-MIGRATION.md, docs/GATES-photos-et-copie-09-10.md, scripts/mesure-etat-migration.mjs, scripts/verifie-*.mjs, scripts/verifie-*.py, scripts/dedoublonne-photos.py, scripts/produit-cadrage-photos.mjs, lib/cadrage-photos.ts

Scope: publier un état de la migration dont chaque chiffre est remesuré à la source au moment du contrôle, et non recopié du relais, puis traiter le défaut d'intégration des photos signalé par Mehdi.

- [x] G1: chaque chiffre publié dans l'état est remesuré depuis le dépôt et concorde
  CHECK: node scripts/verifie-etat-migration.mjs
  EXPECT: état de la migration conforme à la mesure
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=OK    recalcul : emplacements de photo, par parcours de l'arbre JSON — 1942 contre 1942 (les déclaratifs expliquent l'écart) | état de la migration conforme à la mesure (15 chiffres, 3 recalculés autrement)

- [x] G2: aucune annonce sans annoncé dans les 246 fiches
  CHECK: node scripts/verifie-libelles-orphelins.mjs
  EXPECT: /aucune annonce sans annoncé \(\d+ fiches lues\)/
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=aucune annonce sans annoncé (246 fiches lues)

- [x] G3: aucune phrase titre + suite coupée en deux lignes, sur le rendu
  CHECK: node scripts/verifie-suites-de-titre.mjs
  EXPECT: /\d+ phrase\(s\) titre \+ suite rendue\(s\) d'un trait, aucune coupée/
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=108 phrase(s) titre + suite rendue(s) d'un trait, aucune coupée (47 pages)

- [x] G4: les deux portes neuves savent échouer, contrôle positif à l'appui
  CHECK: node scripts/verifie-libelles-orphelins.mjs --controle && node scripts/verifie-suites-de-titre.mjs --controle
  EXPECT: /contrôle positif conforme \(3\/3\)/
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=contrôle positif conforme (3/3) | 108 phrase(s) titre + suite rendue(s) d'un trait, aucune coupée (47 pages)

- [x] G5: toutes les adresses de l'index sortent en 200 sur le serveur de développement
  CHECK: node scripts/verifie-adresses-servies.mjs
  EXPECT: /^248\/248 adresses de l'index en 200/m
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=248/248 adresses de l'index en 200 sur http://localhost:4340

- [x] G6: le projet compile sans erreur de type
  CHECK: bunx tsc --noEmit && echo types verifies
  EXPECT: types verifies
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=types verifies

- [x] G7: la preuve RGPD échoue en 503 nommé, et non en 500 muet, tant que la clé de service est vide
  CHECK: node scripts/verifie-preuve-rgpd.mjs
  EXPECT: preuve RGPD bloquee proprement
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=OK    la réponse n'est jamais un 500 muet | preuve RGPD bloquee proprement (cle de service VIDE, corps valide -> 503, corps invalide -> 400)

- [x] G8: les portes de gabarit sont dans l'état que l'état publié déclare, y compris la seule rouge
  CHECK: node scripts/verifie-portes-gabarits.mjs
  EXPECT: portes de gabarit conformes a l'etat publie
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/mehdi/Landing lovable/migen-site; path=b6e425b4de9d/18 entries; output=OK    implantations              attendue rouge, obtenue rouge | portes de gabarit conformes a l'etat publie (9 vertes, 1 rouge)

- [ ] G9: chaque entrée du registre des photos est une image distincte, et le seuil sait dire non
  CHECK: python3 scripts/verifie-photos-distinctes.py
  EXPECT: /chaque entree du registre est une image distincte \(\d+ entrees, seuil [\d.]+ eprouve\)/
  EVIDENCE: pending

- [ ] G10: le registre décrit ses photos au lieu de recopier leur titre Envato, et chacune porte au moins deux thèmes
  CHECK: node scripts/verifie-etiquetage-photos.mjs
  EXPECT: /registre des photos correctement etiquete \(\d+ entrees/
  EVIDENCE: pending

- [ ] G11: après réétiquetage et dédoublonnage, la répartition tourne et aucune page ne répète une photo
  CHECK: bun scripts/repartit-photos.ts
  EXPECT: les trois regles dures tiennent
  EVIDENCE: pending

- [ ] G12: le défaut d'intégration des photos est nommé par une cause mesurée, et le correctif est vu au navigateur
  EVIDENCE: pending

- [ ] G13: la liste des points ouverts de l'état est complète par rapport au relais, aucun point perdu
  EVIDENCE: pending
