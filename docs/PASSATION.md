# Passation du 06/10 au soir : lis ceci avant de toucher au site

Écrit à la demande de Mehdi, pour la session qui reprend : « avec tout ce qu'on a
fait depuis et tout ce que je t'ai dit, pour pas qu'il fasse de boulette ».
Deux journées ont été en partie perdues à reconstruire ce qui suit. Ne le
redécouvre pas : lis-le.

---

## 1. LA référence, et elle est unique

**Le rendu de l'application autonome de la maquette fait foi.** Décision de
Mehdi, répétée et validée : « la bonne maquette c'est celle-ci :
http://localhost:4352/autonome.html ».

- L'application : `maquette/site-final-autonome.html` (version du 06/10 22h07).
- Son contenu rédigé : `maquette/contenu/` (221 markdown, `contenu/site/index.json`
  décrit les **248 pages** et attribue à chacune son **gabarit**).
- Le rendu figé, page par page : `maquette/rendu/` (un `.json` + un `.html` par
  page, produits par `scripts/capture-maquette.mjs`).
- Pour la servir : `./scripts/sers-maquette.sh` (port 4352, attendu par tous les
  outils).

**JAMAIS un export statique comme référence.** Les fichiers `*.dc.html`
(« Site final », « redesign ») affichent leurs cinq méga-menus dépliés, ne
résolvent aucun binding `{{ }}`, et empilent 33 écrans de démonstration. La
boulette fondatrice du 05/10 : une journée de portage sur l'écran 15 de
« Site final », qui n'est le gabarit d'AUCUNE page. Son produit est préservé
dans la branche `ecarte/portage-ecran-15`, ne la fusionne pas.

## 2. Les onze gabarits, nommés par le client

`maquette/contenu/site/index.json`, champ `gabarit` par page. C'est lui qu'on
lit, on ne devine pas : 01 Article et fiche (38), 02 Étude de cas (41),
03 Offre et prestation (28), 04 Ville (66), 05 Spécialité (19),
06 Département (8), 07 Métier et carrière (13), 08 Secteur (12),
09 Domaine (11), 10 Hub de rubrique (7), 11 Sous-rubrique ressource (5).

La maquette déclare aussi elle-même :
- ses **redirections** (`remapOffer`) : `/offres/chantier/` et
  `/offres/construction/` vers `/travaux-industriels/`, `/offres/retrofit/` et
  `/offres/audit-conseil-maintenance/` vers `/offres/bureau-etudes/`,
  `/offres/depannage-industriel/` vers `/offres/zero-arret/`, `/bureau-etudes/`
  vers `/offres/bureau-etudes/` ;
- ses **écrans natifs** (table `NATIVE`) : `/a-propos/*` servis par des écrans
  dédiés, h1 différent de l'index ;
- ses **deux modèles de FAQ**, nommés par ses `data-screen-label` :
  « 09 Questions » (plat, pages d'offres, voir `docs/MODELE-FAQ.md`) et
  « 09 Questions · photo » (le hub `/offres/`, composant
  `components/site/offres/QuestionsPhoto.tsx`). **Un seul modèle de FAQ par
  page** : consigne de Mehdi.

## 3. Les décisions de Mehdi, datées, non négociables

| Décision | Date |
|---|---|
| La maquette se respecte **au mot pour mot** : un synonyme est une faute | 05/10 |
| Le **rendu** de l'application autonome fait foi, pas un export | 06/10 |
| Le **parallélisme est la norme** : dimensionner le fan-out avant de lancer, le séquentiel se justifie | 06/10 |
| Un seul modèle de FAQ par page ; le plat pour les offres, le photo pour le hub | 06/10 |
| Aucune chaîne ne touche `components/` sans référence validée par lui | 05/10 |
| Jamais de tiret cadratin dans la copie visible (règle permanente) | toujours |
| Rien ne s'invente : vide et signalé plutôt que faux | toujours |

## 4. Ce qui est FAIT et vérifié (commits de ce soir)

- **`/offres/residence/`** : page pilote conforme au rendu de la maquette.
  Texte mot pour mot (porte **G17**, `scripts/verifie-offre-rendu.mjs`, 243
  lignes comparées), pixels convergés (13/17 sections sous 4 %, résiduels tous
  expliqués : rails animés et écarts assumés).
- **`/offres/`** : la FAQ « 09 Questions · photo » est en place, avec la photo
  d'origine du client (octets extraits de son paquet, `public/assets/web/faq-offres.jpg`)
  et ses 6 questions-réponses mot pour mot. L'ancienne FAQ plate du hub retirée.
- **`/offres/zero-arret/`** : bloc « Ils nous ont confié une mission
  comparable » restauré (4 cas, photos identifiées par empreinte perceptuelle,
  distance 0).
- **Le menu de l'entête** : réparé (le clic ne referme plus le panneau ouvert
  au survol), ne pas y retoucher sans raison.
- **La chaîne `bun run verifie` passe entièrement**, build de production
  compris, au moment de la passation.

## 5. Les ARBITRAGES OUVERTS : ne les tranche pas à sa place

1. **Libellé et largeur du bouton d'envoi** du formulaire d'offre : site
   « On me rappelle dans l'heure », maquette « Parler à un chargé d'affaires ».
   Écart déclaré en tête de `PanneauFormulaire.tsx`.
2. **L'échelle** : Mehdi trouve le rendu « trop zoomé » sur son écran large
   (clamp à 66 px plein à partir de ~1500 px). Essais prêts :
   `http://localhost:4352/apercu-echelle.html` (0,88 / 0,8 / 0,7). PAS tranché.
3. **33 fichiers de contenu absents de l'export** (villes) : liste exacte dans
   `docs/MESURE-MAQUETTE.md`, à réclamer à Claude Design. En attendant, ces
   pages ne peuvent pas se rendre.
4. **8 sous-pages d'offres au titre vide** dans la maquette (défaut du gabarit
   03 hors des six offres nommées) : liste dans `docs/MESURE-MAQUETTE.md`.
5. **2 URL orphelines** servies par le site, inconnues de la maquette :
   `/implantations/maintenance-industrielle-marseille/`,
   `/offres/maintenance-externalisee/`.
6. **54 titres écourtés** : les études de cas et secteurs affichent une accroche,
   l'index porte la version longue. Lequel fait foi : non tranché.
7. **Contrastes sous AA** dans la maquette (boutons 2,56:1, surtitres 2,37:1) :
   fidélité maintenue, correction à passer par la maquette d'abord.
8. **`BlocsZeroArret.tsx`** : 750 lignes de flexibilité morte, bloc d'arbitrage
   en tête du fichier.
9. **`SUPABASE_SERVICE_ROLE_KEY` toujours vide** : l'import en base est bloqué
   depuis le début, le relais disque fait foi (voir piège n° 3).

## 6. Le PROCHAIN chantier, défini avec Mehdi

Les **27 autres pages du gabarit 03**, EN PARALLÈLE (un agent par fichier de
données, les composants sont partagés), chacune portée contre SA capture de
`maquette/rendu/`, puis les autres gabarits sur le même schéma : un pilote
validé par Mehdi, puis le déploiement. Les outils sont prêts (section 7).
Zéro arrêt est le plus avancé mais il lui manque encore « Les prestations
regroupées ici », sa bande de fin, et la purge de son cocon.

## 7. Les outils, tous dans `scripts/`, tous éprouvés

| Outil | Rôle |
|---|---|
| `sers-maquette.sh` | sert la maquette sur 4352 avec contenu et assets |
| `capture-maquette.mjs` | fige le rendu d'une page (`--tout`, `--gabarit`, URLs) ; gère redirections, écrans natifs, fichiers manquants ; vérifie son arrivée |
| `verifie-offre-rendu.mjs` | porte G17 : texte du site contre capture, mot pour mot |
| `diff-visuel-offre.mjs` | pixels du site contre maquette, section par section, montages des pires |
| `inventaire-urls.mjs` | croise les 248 URL avec le site (`--html` pour le tableau filtrable) |
| `extrait-offres-maquette.mjs` | les 198 chaînes OFFERS depuis l'export source |
| `essaie-echelle-maquette.mjs` | variantes d'échelle photographiées |

Toute porte doit prouver qu'elle sait échouer (contrôle positif) avant d'être
crue : c'est la règle du dépôt, et chacune de celles-ci l'a fait.

## 8. Les PIÈGES, chacun payé une fois, à ne pas repayer

1. **Le relais disque ne lit les fichiers qu'au chargement du module**
   (`lib/contenu.ts`, map construite à l'initialisation). Une édition de
   `supabase/import/gabarits-maquette/*.json` est invisible tant que le module
   ne recharge pas. Et **Turbopack hache le contenu** : un `touch` ne suffit
   pas, il faut un vrai changement d'octets (le marqueur de commentaire en tête
   de la map sert à ça).
2. **La base gagne sur le disque dès qu'elle porte un `gabarit`**
   (`porteUnGabarit`). Aujourd'hui la base ne porte que `sections` : le disque
   fait foi partout. Si quelqu'un pose la clé de service et importe, cette
   précédence s'inverse page par page.
3. **Les mesures textuelles se font sur texte normalisé** : espaces insécables
   → espace, apostrophes unifiées. Les questions de la maquette portent des
   apostrophes DROITES, d'autres textes des typographiques : compare normalisé,
   copie littéral.
4. **Les titres de la maquette ne sont pas toujours des `h2`** : la FAQ photo
   titre en `div`. Chercher par texte, pas par balise.
5. **Les photos de l'application sont des blobs** : pour les identifier,
   empreinte perceptuelle 8×8 contre `public/assets/web` (distance 0 = match),
   ou extraction des octets par XHR (le `fetch` de la page est enrobé et boucle)
   puis correspondance sha256 dans le paquet. Les deux méthodes sont dans
   l'historique des scripts.
6. **Toute mesure visuelle du site doit neutraliser** le bandeau de consentement
   (clic « Tout refuser ») et la pastille Next (`nextjs-portal`) : ils ont
   compté jusqu'à 57 % de faux pixels. `diff-visuel-offre.mjs` le fait.
7. **Les rails animés** (marquee logos, références) divergent par phase
   d'animation à la capture : écart déclaré, ne pas « corriger ».
8. **En zsh, une variable non éclatée passe en UN argument** : un rejeu de 95
   URL n'a jamais démarré à cause de `$URLS` sans `xargs`. Vérifier que les
   lots tournent avant d'attendre.
9. **Les fusions de résultats par lots** : purger les fichiers `_mesure-part-*`
   périmés avant de refusionner, l'ancien lot écrase le neuf par ordre de glob.
10. **`CLAUDE.md` et `docs/GABARITS.md` ont menti** une journée entière (sept
    gabarits, corpus « en dessous »). Ils sont corrigés et portent la note de ce
    qui était faux : si une doc contredit une mesure, c'est la mesure qui gagne,
    puis on corrige la doc.

## 9. Ce que Mehdi attend de toi, en une ligne

Mesure avant d'affirmer, montre-lui l'écran plutôt qu'un tableau, parallélise
par défaut, ne touche à rien sans référence validée, et quand il dit que ça ne
ressemble pas : **c'est lui qui a raison**, cherche ce que tes outils ne voient
pas encore.

---

## Reprise du 07/10, 22h : ÉTAT EXACT AU MOMENT DE LA COUPURE (limite d'usage)

**En ligne et commité** (`https://migen-site.vercel.app`, branche `phase-2-gabarits`) :
texte du gabarit 03 à 0 écart ; accueil refait ; siège à Écully partout ;
40 études de cas (02) et 13 pages carrière (07) ; règles du README de
passation (FAQ exclusive, candidature, 24h interdit, 301 maintenance-externalisee).
Thème sombre écrit mais ÉTEINT (la maquette le désactive, 40 textes illisibles sinon).
Deux 301 (Bordeaux, Marseille) EN ATTENTE dans proxy.ts : cibles encore en 404.

**Écrit sur disque, PAS commité, chaîne NON relancée** :
1. Pilotes Expertises : `components/site/expertises/specialite/**` (fanuc, abb) et
   `domaine/**` (robotique, automatisme), contrôles verts chacun.
2. Bascule « +200 clients » (README : +200, jamais « réguliers ») : 5 agents,
   43 « réguliers » retirés, 46 cartes +200 remises, 39 trous +200 retirés de la porte.
   RESTES connus : `scripts/verifie-offres.tsx:249` interdit encore « +200 » ;
   `verification-mentions-legales.tsx:264` et d'autres contrôles hors lot aussi ;
   `verification-equipe` échoue sur « Siège · Écully » (maquette : « Limonest et Écully »).
3. Vague Ville **ARRÊTÉE** à mi-course : `Workflow({scriptPath: ".../gabarit-04-ville-wf_19a80124-532.js",
   resumeFromRunId: "wf_19a80124-532"})` la reprend, les agents finis reviennent du cache.
   `components/site/implantation/**` et `app/[...slug]/page.tsx` peuvent être à
   moitié écrits : `bunx tsc` y signalait des erreurs.

**Première action de la reprise** : reprendre la vague Ville, puis UNE passe
d'intégration : recharger le relais (`lib/contenu.ts`), corriger les contrôles
restants de l'ancienne règle +200, `bun run verifie`, commit, déploiement --prod.

**Tranché par Mehdi le 08/10** : 10 hubs comme la maquette (« c'est la maquette qui
prime ») ; titre de Tournaire reformulé « Maintenir des machines conçues en interne » ;
« Au-delà de 3 mois » ajouté au délai de démarrage.
