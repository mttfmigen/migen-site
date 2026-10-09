# État de la migration du site Migen, au 09/10/2026 au soir

Ce document remplace la lecture du relais pour savoir OÙ ON EN EST. Il existe
parce que `docs/RELAIS-08-10.md` a été trouvé périmé de six commits le 09/10 :
huit de ses points étaient faits et il annonçait le contraire. Il porte donc un
bloc de chiffres que `node scripts/verifie-etat-migration.mjs` remesure, et il se
déclare périmé tout seul.

Pour le vérifier, une commande :

    node scripts/verifie-etat-migration.mjs

## Les chiffres, mesurés et non recopiés

```json etat-migration
{
  "depot": {
    "branche": "phase-2-gabarits",
    "tete": "74d8453"
  },
  "pages": {
    "declarees": 248,
    "fiches": 246
  },
  "photos": {
    "emplacements": 1942,
    "distinctes": 426,
    "banque": 517,
    "pagesQuiRepetent": 0
  },
  "defauts": {
    "annoncesOrphelines": 0,
    "couplesTitreSuite": 108
  },
  "ouverts": {
    "fichesOrthus": 30,
    "phrasesPrixRetirees": 14,
    "pagesPrixRetirees": 8,
    "mentionsLegalesACompleter": 3,
    "cleServiceSupabasePosee": false
  }
}
```

## Ce qui est en ligne, et ce qui ne l'est pas

- **La production sert les 248 adresses de l'index en 200**, mesuré sur
  https://migen-site.vercel.app par `SITE_URL=… node scripts/verifie-adresses-servies.mjs`.
  Le serveur de développement aussi, 248/248.
- **La production est une génération en retard.** Elle porte encore la phrase
  « Le besoin posé par le site : » sur `/preuves/autoliv/`, corrigée en local.
  C'est la preuve directe que rien du travail du 09/10 au soir n'est déployé.
- **Rien n'attend d'être poussé** : `phase-2-gabarits` est au même commit que
  `origin`. Ce qui n'est pas en ligne n'est pas non plus commité : le travail du
  jour vit dans l'arbre de travail.
- **Un `git push` déploie désormais en production** (Vercel relié au dépôt le
  09/10). Le filet d'avant n'existe plus, et le relais du 08/10 dit l'inverse.

## Les deux défauts de copie signalés par Mehdi, et leur état

| Défaut | Ampleur mesurée | État |
|---|---|---|
| Annonces sans annoncé (« Le besoin posé par le site : » puis rien) | 17 sur 12 des 41 études de cas | **Clos.** 0 restante, porte `verifie-libelles-orphelins.mjs`, cause racine bouchée dans `extrait-depuis-captures.py` |
| Phrases coupées en deux lignes, la seconde ouverte par une virgule | 108 sur tout le site : 27 études de cas, 74 cartes de pages Villes, 7 étapes Spécialité et Domaine | **Clos.** 108 rendues d'un trait, 0 coupée, porte `verifie-suites-de-titre.mjs` |

Les deux viennent de la MAQUETTE, pas du portage : sa capture rend le même
défaut, c'est pourquoi aucune porte de gabarit ne le voyait. Le remède ne change
aucun mot, il rend la phrase du corpus d'un seul tenant.

## L'état des portes, et la seule rouge

Vérifié par `node scripts/verifie-portes-gabarits.mjs`, qui refuse les deux
dérives : une verte qui tombe est une régression, une rouge qui passe est un
rapport périmé.

Neuf vertes : interdits du contrat, décisions de copie, annonces orphelines,
suites de titre, phrases estropiées, gabarit étude de cas, gabarit spécialité,
gabarit domaine, hub offres. Plus `bunx tsc --noEmit` propre.

**Plus aucune rouge depuis le 09/10 au soir.** `scripts/verifie-implantations.tsx`
l'a été toute la journée, pour trois raisons qui lui étaient propres, traitées
une par une sans l'édenter : ses onze preuves d'échec passent toujours.

1. **Elle interdisait « Limonest »**, au motif que le siège serait à Écully.
   C'est l'inverse de la décision du 09/10, et l'inverse de sa propre capture,
   qui écrit « Agences, Lyon (siège à Limonest et bureaux à Écully) ». La règle
   refusait donc le texte de la référence. L'interdit est retourné : c'est
   « siège à Écully » qui est désormais refusé, et la fiche reprend la phrase
   de la capture mot pour mot.
2. **Elle réclamait une réponse que le site sert déjà.** La capture affiche du
   MARKDOWN BRUT dans sa foire aux questions (« …avant signature. **Nous avons
   déjà un prestataire sous contrat.** »), l'un des bloquants de l'audit de
   Nathan, corrigé sur le site qui rend le gras au lieu de ses marqueurs. La
   comparaison littérale exigeait donc du site qu'il reproduise la faute. Les
   marqueurs sont retirés des deux côtés.
3. **Elle exigeait les octets de photo de son relevé**, là où la répartition du
   09/10 a posé des photos du registre. Elle accepte maintenant les deux, et
   continue de refuser une photo DEVINÉE, ni au relevé ni au registre : sa
   preuve d'échec le vérifie à chaque passage.

## La preuve RGPD : diagnostic prouvé de bout en bout

`node scripts/verifie-preuve-rgpd.mjs`, et ce contrôle vérifie sa propre
capacité à échouer à chaque passage (un corps invalide doit rendre 400, une
finalité inventée aussi).

Mesuré : la ligne `SUPABASE_SERVICE_ROLE_KEY` existe dans `.env.local` mais **sa
valeur est VIDE**. Un corps de preuve valide reçoit donc **503** avec sa cause
nommée, jamais un 500 muet. Le choix du visiteur est respecté, il vit dans son
cookie ; c'est la PREUVE qui ne s'écrit pas dans `consent_logs`.

Attention au piège qui a fait conclure l'inverse une première fois : un motif
`=\s*\S` avale le retour à la ligne et prend la ligne de commentaire suivante
pour la valeur de la clé.

## Ce qui reste, et à qui

**Mehdi seul peut le fournir :**
1. **La clé de service Supabase.** Sans elle, aucune preuve de consentement
   n'est écrite, et `scripts/importe_rest.mjs` ne peut pas tourner.
2. **Trois champs des mentions légales** : directeur de la publication (à
   désigner, ce n'est pas une donnée du greffe), courriel de contact, hébergeur.
   Les dix autres sont remplis depuis l'extrait Pappers du 09/10.
3. **Les accords des 38 logos**, que les mentions légales affirment.

**Décidé par Mehdi le 09/10 au soir, pas encore appliqué :**
4. **« Aucun tarif, dire que c'est sur devis. »** 14 phrases déclarées retirées
   sur 8 pages portent un motif de prix. La porte des implantations réclame déjà
   l'une d'elles. Le relais annonçait 19 phrases sur 12 pages : ce chiffre n'a
   pas été reproduit par la mesure et reste à réconcilier avec sa méthode.
5. **Les 30 fiches qui portent « orthus »**, à renommer. Changement coordonné :
   l'index déclare ces adresses et les portes comptent les pages de l'index.

**En cours d'instruction :**
6. **L'intégration des photos**, signalée par Mehdi le 09/10 au soir : « tu les
   as mal intégré ». Faits déjà établis : les 517 photos du registre sont toutes
   servies, dont les 149 qu'il a téléchargées lui-même (licence « Envato
   Elements, licence migen.fr », 431 emplacements) ; aucune page ne répète une
   photo ; la plus servie l'est 12 fois. Le défaut n'est donc pas une absence,
   c'est un PLACEMENT. Quatre audits parallèles sont en cours : cohérence
   thématique, orientation et cadrage, répartition entre pages sœurs, et rendu
   réel au navigateur. `scripts/repartit-photos.ts` descend d'un palier de thème
   POUR LA PAGE ENTIÈRE dès qu'un palier ne peut pas servir tous ses
   emplacements avec six de marge, et son résumé final ne vérifie pas la règle
   de thème qu'il déclare pourtant comme dure : c'est la cause racine la plus
   probable, à confirmer.

**Points techniques ouverts :** `.vercelignore` ignoré par `--archive` (486 Mo
envoyés) ; les consignes IA du Diagnostic qui citent encore des prix, non
commitées dans `~/Landing lovable/migen-diagnostic-zero-arret`.

## Les photos « mal intégrées » : trois causes, toutes mesurées, toutes de notre fait

Signalé par Mehdi le 09/10 au soir : « traite surtout les photos que j'ai
téléchargé, tu les as mal intégré sur le site ». Quatre audits parallèles, puis
vérification indépendante de chaque affirmation décisive. Le défaut n'est pas
une absence : les 517 photos du registre sont toutes servies, dont les 149 de
Mehdi sur 431 emplacements, et aucune page ne répète un même nom de fichier.

### Cause 1 : le registre ment, et le répartiteur lui obéit

`scripts/repartit-photos.ts` choisit la photo d'un emplacement sur les THÈMES du
registre. Il ne peut donc pas faire mieux que ce que le registre lui dit. Or :

| Lot | Descriptions recopiées du titre Envato | Photos à moins de 2 thèmes |
|---|---|---|
| Premier lot (109) | 0 | 0 |
| Industrie Libre (259) | 138 | 107 |
| **Les 149 de Mehdi** | **149 sur 149** | **113** |

1,38 thème par photo pour son lot contre 3,50 pour le premier. Et au moins un
thème est FAUX : `env-projet-menuiserie-pere-et-enfant.jpg`, une photo de
menuiserie, porte le thème `aeronautique`, ce qui l'a posée sur
`/secteurs/aeronautique/`. Vérifié au registre et dans la fiche.

Le moteur, lui, a bien travaillé : 77,7 % des emplacements portent le thème
attendu contre 5,9 % pour un tirage au hasard, soit treize fois mieux. Les
102 incohérences se concentrent sur neuf thèmes à faible stock ou mal exploités,
dont `bureau-etudes` (0 photo juste sur 18 emplacements alors que les 5 photos
du thème sont posées ailleurs) et `auto` (27 des 31 photos automobiles jamais
servies sur les pages automobiles).

Porte : `node scripts/verifie-etiquetage-photos.mjs`. Elle échoue aujourd'hui sur
507 fautes et sera verte quand le registre décrira ses photos.

### Cause 2 : 128 fichiers sont la même image sous un autre nom

Les 517 fichiers ne contiennent que **389 images distinctes**. 128 sont des
ré-encodages de la même prise de vue, à une autre résolution ou sous un autre
nom, avec un sha256 différent, donc invisibles au registre. 41,2 Mo de doublons
sur le disque.

La première règle dure du répartiteur, « jamais deux fois la même photo dans une
page », porte sur le CHEMIN. Elle était donc vraie sur les noms et fausse à
l'écran : **14 pages affichaient deux fois la même image**, dont
`/preuves/rector-lesage/` et `/preuves/vignal-systems/` où la photo
d'illustration et celle du dispositif sont la même prise de vue. Et 96 partages
entre pages sœurs échappaient à tout contrôle par nom de fichier.

Vérifié au pixel, avec témoin négatif à 50,3 de différence absolue moyenne :
`env-technician-maintenance-8.jpg` et `env-technician-repairing-electrical-appliance.jpg`
sont strictement identiques (0,00). Quatre photos téléchargées sur Envato
existaient déjà dans le stock Industrie Libre.

Porte : `python3 scripts/verifie-photos-distinctes.py`, qui éprouve son seuil
dans les deux sens à chaque passage. Elle échoue aujourd'hui sur 132 paires.
Remède écrit et simulé : `python3 scripts/dedoublonne-photos.py` (124 groupes,
186 fiches concernées, 437 références à réécrire, thèmes fusionnés sur le
survivant le mieux résolu).

### Cause 3 : le registre sait quelles photos sont debout, le code ne lui demande jamais

C'est la cause la plus visible, et la plus simple. Le registre déclare
l'`orientation` de chaque photo, exactement juste sur les 517 fichiers (480
paysage, 37 portrait, vérifié sur les en-têtes JPEG). **Aucune ligne du site ne
lit ce champ** (`grep -rn orientation components/site lib app` ne rend rien).

Conséquence : **137 des 148 emplacements de photo portrait sont dans un cadre
couché**, en `objectFit: cover` et sans aucun `objectPosition`, donc recadrés sur
leur bande médiane. **123 placements perdent la moitié de l'image ou plus, sur
92 pages.** Un portrait à 0,66 de ratio dans le cadre 2,43 de
`ressource/PageRessource.tsx:136` perd 73 % de sa hauteur : le cadrage tombe sur
le torse, pas sur le visage. Vérifié fichier par fichier sur trois cas.

L'emplacement le plus destructeur est `offre/ReferencesOffre.tsx:298`, ratio
2,13, qui porte à lui seul 951 placements.

### Deux défauts de chargement trouvés au passage, vérifiés

- `preuve/PagePreuve.tsx:1087` rend `photoDispositif` en `<img>` brut, hors de
  l'optimiseur de Next (avec son `eslint-disable` en toutes lettres) : 40 pages
  de preuve servent le JPEG entier, 15,3 Mo cumulés, dont 800 Ko sur
  `/preuves/orthus-ecocem/`.
- `ressource/PageRessource.tsx:262` passe `preload` à `next/image`. Cette
  propriété n'existe pas, c'est `priority` : le préchargement du visuel de héros
  n'a jamais eu lieu.

### Ce qui reste à faire sur les photos, dans l'ordre

1. ~~**Réétiqueter les 149 photos de Mehdi en les REGARDANT**~~ **FAIT le 09/10
   au soir.** Les 149 ont été ouvertes une par une, en quatre lots parallèles, et
   décrites d'après ce que l'image montre. Mesuré après application :
   **3,17 thèmes par photo contre 1,38**, zéro description recopiée du titre
   Envato contre 149 avant, zéro thème hors vocabulaire. Deux photos sont
   signalées HORS SUJET et attendent l'arbitrage de Mehdi, ce sont ses achats :
   `env-projet-menuiserie-pere-et-enfant.jpg` (une scène de famille avec un
   enfant, qui portait le thème `aeronautique` et illustrait
   /secteurs/aeronautique/) et `env-it-technician-working-on-servers-in-data-cente.jpg`
   (une baie de serveurs, sans contexte industriel). Erreur systématique trouvée
   au passage : le thème `auto` avait été posé par confusion entre
   « automatique » et « automobile », ce qui explique que 27 des 31 photos dites
   automobiles ne servaient aucune page automobile.
   **Reste le lot Industrie Libre** : 138 descriptions recopiées et 108 photos à
   moins de deux thèmes, mesurées par `node scripts/verifie-etiquetage-photos.mjs`.
2. **Dédoublonner** : `dedoublonne-photos.py --applique`, puis vérifier.
3. **Apprendre la forme des cadres au répartiteur** pour qu'une photo portrait
   n'aille jamais dans un cadre large. L'inventaire des 22 emplacements avec leur
   ratio réel est mesuré et disponible. C'est un ARBITRAGE pour Mehdi : interdire
   le portrait dans les cadres larges, ou le garder en réglant son
   `objectPosition` sur le haut de l'image.
4. **Relancer la répartition** et vérifier au navigateur.

## Le mobile, à partir de la vraie maquette mobile

Mehdi, 09/10 : « faut que tu attaques le mode mobile avec la vraie maquette
mobile », puis « ça doit pas toucher le formulaire ».

**La maquette mobile existe, et elle était dans le colis depuis le 07/10** :
`design_handoff_migen_site/maquette/MigenMobile.dc.html`, documentée au
paragraphe « Mobile » du README du colis. C'est un modèle Vue qui ne s'exécute
pas seul, donc on la porte depuis sa source, pas depuis son rendu.

Elle tient en quatre motifs. Deux étaient déjà portés : le **tiroir de
navigation** (`components/site/TiroirMobile.tsx`) et la **barre d'action basse**
(`BarreActionMobile.tsx`), tous deux câblés dans `app/layout.tsx`.

### Les 24 défauts mesurés de la mise en page, ramenés à zéro

`node scripts/verifie-mobile.mjs` rendait 24 problèmes sur 320, 375 et 768 px.

- **Les cibles tactiles du pied de page**, 24 par page donc sur les 248 : les
  entrées du maillage SEO faisaient 19 px de haut contre les 24 px du critère
  2.5.8 de la WCAG 2.2. Remplissage de 3 px compensé par une marge négative,
  la recette déjà payée sur le fil d'Ariane. Premier correctif posé sur la
  mauvaise classe, la mesure l'a dit aussitôt.
- **Le champ de recherche des ressources** à 15 px : Safari iOS zoome la page à
  l'appui sous 16 px. Passé à 16 px SOUS 880 px seulement, le bureau garde la
  valeur de la maquette. La police a dû quitter l'attribut `style` en ligne,
  sans quoi le raccourci `font` battait la classe.

### Le parcours par le problème, porté

C'est la première phrase de la maquette : « Un parcours guidé par le problème,
pas par le menu ». `components/site/accueil/ParcoursMobile.tsx`, sous le héros,
**sur téléphone seulement**. Six problèmes, six réponses, six pages réelles du
site. Copie dans `lib/parcours-mobile.ts`.

Quatre décisions de portage, toutes assumées :
1. **Un accordéon `<details name="parcours-mobile">`**, pas une machine à états.
   Le « une seule réponse à la fois » de la maquette vient du navigateur, avec
   le clavier et l'annonce « développé / réduit », sans une ligne d'état.
   Vérifié à l'écran : ouvrir la troisième referme la première.
2. **Tout le texte est dans le HTML servi.** La maquette retire le contenu
   replié du DOM (`sc-if`), ce qui contredit son README (« sans perdre le texte
   utile au référencement »).
3. **Le formulaire n'est pas touché**, consigne de Mehdi. Le parcours s'arrête
   à un lien vers la page de l'offre. Corrigé après l'avoir vu à l'écran :
   « Décrire mon besoin » s'affichait DEUX fois, dans la carte et dans la barre
   basse qui ne quitte jamais l'écran.
4. **Trois retraits de copie imposés par le contrat**, déclarés un par un en
   commentaire dans `lib/parcours-mobile.ts` : « sous 2 à 3 semaines » (délai
   chiffré), « au prix mensuel fixe » (décision « sur devis » du 09/10) et
   « l'intérim tourne » (le contrat proscrit le statut). `verifie-interdits` a
   attrapé le troisième, que j'avais laissé passer.

Porte : `bun scripts/verifie-parcours-mobile.mjs`, prouvée sur ses trois
défauts (lien mort, accordéon non exclusif, parcours débordant sur le bureau).

### Reste du mobile, non fait

`components/site/blocs/SectionPliableMobile.tsx` est écrit mais **pas branché**.
Le brancher demande de refondre les en-têtes de section des gabarits existants,
qui portent déjà leur `h2` : les envelopper dupliquerait le titre. Le gabarit
Ville est le plus concerné, 74 pages de 13 000 caractères, mais sa porte
`verifie-implantations.tsx` est déjà rouge pour trois causes antérieures. À
reprendre une fois cette porte remise d'aplomb.

## Ce qui reste au bureau, au 09/10 au soir

Toutes les portes de gabarit sont vertes, `tsc` compris. Deux mesures restent
rouges, et ce sont les deux derniers chantiers du bureau.

### 1. `scripts/verifie-mots-offre.mjs` : 874 écarts sur quatre pages d'offre

Elle annonçait 1 196. **322 d'entre eux n'existaient pas** : la porte ignorait
la table `remapOffer` du routeur de la maquette, et comparait
`/offres/chantier/` et `/offres/construction/` à `/travaux-industriels/`, donc
à une AUTRE page. C'est le piège qui avait déjà coûté une demi-journée sur
`/bureau-etudes/`, corrigé dans `diff-visuel-offre.mjs` le 09/10 mais pas ici.
La porte lit désormais la table DANS la maquette, écarte les adresses
détournées et le dit, et renvoie vers leur capture figée.

Restent **874 écarts réels**, répartis à peu près également : zéro-arrêt 308,
bureau d'études 195, arrêt technique 186, résidence 185. 349 sont des phrases
rendues que la porte ne sait rattacher ni à la maquette ni au corpus. Une
répartition aussi régulière sur quatre pages n'est pas une poignée de fautes de
copie : c'est un désaccord de structure, probablement sur la résolution de
l'objet `OFFERS` ou sur des blocs partagés que la porte croit propres à une
offre. **À instruire comme un chantier à part**, pas à rafistoler.

### 2. `scripts/verifie-fidelite.mjs` : 4 anomalies de hauteur sur l'accueil

20 sections comparées à 1280 px, 13 au pixel près, 5 écarts déclarés, 4 anomalies :

- **section 1** « INNOVATION, PERFORMANCE, IMPACT » : 953 px contre 641, soit
  +312 px, sans exception déclarée ;
- **section 5** « NOTRE SÉLECTION » : 879 px contre 1 158, soit -279 px, sans
  exception déclarée. C'est le bloc ajouté le 08/10 ;
- **section 12** « NOTRE HISTOIRE » : écart désormais nul, son exception n'a
  plus lieu d'être ;
- **section 13** « POURQUOI EXTERNALISER » : -56 px là où l'exception en
  attend -28 ± 14.

Le parcours mobile ajouté ce soir N'EST PAS en cause : la porte filtre les
sections invisibles, et il l'est à 1280 px. Vérifié en le retirant puis en
remesurant. Attention en mesurant : cette porte est sensible à la
recompilation du serveur de développement, un passage pris pendant un rebuild
a annoncé 21 sections et 17 anomalies, deux passages à froid en annoncent 20
et 4, de façon stable.
