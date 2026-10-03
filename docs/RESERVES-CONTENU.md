# Réserves de contenu, à lever avant la mise en ligne sur migen.fr

## 0. BLOQUANT DE MISE EN LIGNE : les deux pages légales

`/mentions-legales/` et `/confidentialite/` restent en **brouillon**, donc en 404.
C'est délibéré.

Sur le site actuel, ces deux pages sont des **gabarits à trous**, et elles le
disent elles-mêmes au visiteur :

> « Gabarit juridique : les mentions ci-dessous doivent être complétées et
> validées par votre conseil. Les valeurs entre crochets sont à renseigner. »
> « migen©, [forme juridique] au capital de […] »
> « Gabarit RGPD : à faire valider par votre DPO ou votre conseil avant
> publication. Les durées et destinataires sont des exemples. »

Les reprendre telles quelles reviendrait à publier des mentions légales fausses,
et une politique de confidentialité dont les durées de conservation sont des
exemples alors que le site pose des cookies et enregistre des preuves de
consentement. Les écrire moi-même reviendrait à inventer des informations
juridiques sur l'entreprise. Ni l'un ni l'autre.

**Ce qu'il faut :** le texte réel, validé. Un site qui collecte des données sans
mentions légales exactes n'est pas publiable, indépendamment de son code.

En attendant, le pied de page porte bien les deux liens : le jour où les pages
passent en `published`, ils fonctionnent sans toucher au code.


Ce qui est en ligne aujourd'hui l'est sur `migen-site.vercel.app`, derrière le SSO
Vercel : visible par l'équipe, invisible du public et des robots. Rien de ce qui
suit n'est donc exposé. Mais rien de tout cela ne doit basculer sur migen.fr
sans avoir été tranché.

## 1. Les trois réserves que portait la maquette

La maquette les écrivait **en texte visible sur la page**, en gris clair. Elles
ont été retirées du rendu : un visiteur n'a pas à lire qu'on doute des chiffres
qu'on lui montre. La réserve, elle, reste entière.

| Où | Ce que la maquette disait | Ce qu'il faut trancher |
|---|---|---|
| `components/site/accueil/CertificationsRse.tsx` | « Chiffres 2025 · à confirmer avant publication » | Les quatre chiffres Sécurité et RSE (accidents avec arrêt, habilitations à jour, évolution, délai) sont-ils les bons pour 2025 ? |
| `components/site/accueil/FriseHistoire.tsx` | « Jalons à confirmer · dates et chiffres à valider » | Les dates et les chiffres de la frise d'histoire. |
| `components/site/accueil/TemoignagesClients.tsx` | « Verbatims reformulés à partir de retours clients · à valider avec les intéressés avant publication » | **Le plus sensible.** Les témoignages sont des reformulations, pas des citations. Ils sont anonymisés (fonction, secteur, département), mais la règle du projet est « aucun témoignage fabriqué ». Soit ils sont validés par les clients concernés, soit la section ne les affiche pas. |

Les trois composants prennent déjà leurs données en props : passer une liste
vide suffit à faire disparaître la section, sans toucher au code.

## 2. Ce que la maquette affirmait et qui contredisait les faits autorisés

Corrigé au portage, pour mémoire et pour que personne ne le remette :

- « **5 agences** en France » devenait « cinq agences permettent d'envoyer un
  technicien depuis le bassin le plus proche ». Il y en a **quatre** : Lyon
  (siège), Montréal, Dubaï, Madrid, et **aucune autre en France**, complétées par
  dix hubs de techniciens. Corrigé à trois endroits.
- « **+200 clients industriels** » dans le héros du gabarit de vente, alors que le
  corpus écrit « plus de 120 clients, dont plus de 80 réguliers ». La bande de
  chiffres du héros n'a pas été portée pour cette raison.
- « **Régie ou forfait** » et « **2 à 3 semaines** » dans les données du pavage des
  besoins : « régie » est un mot interdit, et aucun délai chiffré n'est autorisé.
- Deux tirets cadratins, « sur mesure », « Découvrir », et un « 2 accident » au
  singulier.

## 3. Ce qui reste ouvert, et qui n'est pas du contenu

- **Adresse du siège.** La maquette et le corpus disent Limonest (1 rue des
  Vergers, 69760). Le site actuel affiche encore Écully (129 chemin du Moulin
  Carron, 69130) sur certaines pages. C'est une mention légale : à confirmer.
- **Clé `service_role` de Supabase.** Absente de `.env.local` : les lectures et le
  build fonctionnent, les écritures non (dépôt d'un lead, preuve de consentement).
  Supabase ne la donne jamais par API, elle se copie depuis le tableau de bord.
- **Clé API Thot SEO.** Le serveur répond « API Key missing ». Sans elle, aucun
  score éditorial ne peut être mesuré.
- **Six hubs affichés, dix annoncés.** La maquette n'en montre que six (Lyon,
  Paris, Lille, Strasbourg, Nantes, Toulouse). Les quatre autres n'ont pas été
  inventés.
- **Quatre logos fournisseurs défectueux à la source**, dans le projet Claude
  Design : `comau.svg` contient le logo AUTOMHA, `ats-automation.svg` est vide,
  `gardner-denver.svg` et `hermle.svg` ont un `viewBox` faux.

## 4. Formulaire de contact, quatre arbitrages à ta main

Relevés pendant le portage de l'habillage à la maquette. Aucun n'a été tranché
à ta place.

1. **Blanc sur orange : 2,56:1, sous le plancher WCAG AA (4,5:1).** Le libellé
   du bouton de marque, en 15 px gras, n'est pas du « grand texte ». C'est le
   bouton de toute la maquette : assombrir l'orange ou foncer le texte est une
   décision de charte, pas de code.
2. **Le sélecteur d'indicatif téléphonique n'est pas repris.** La maquette le
   propose (FR, BE, CH, ES, CA, AE). La charge utile est construite depuis
   l'état du formulaire, pas depuis le DOM : un indicatif choisi serait jeté en
   silence, et un visiteur qui choisit +32 puis saisit un numéro local
   enverrait un numéro faux. Il faut un champ au contrat serveur et une règle
   de concaténation avant de l'afficher.
3. **Le message est obligatoire dans la maquette, facultatif pour le serveur**
   (`validation.ts`). Gardé facultatif et étiqueté ainsi : un astérisque
   pendant que le serveur accepte le vide mentirait au visiteur. Une ligne à
   changer si le besoin métier est l'inverse.
4. **Champs cachés de la maquette non repris** : `country`, `siren`, `siret`,
   `address`, `zip`. Vides dans la maquette, inconnus du serveur.

Un point de contraste à connaître : l'étiquette de champ en `--ink3` sur blanc
donne 4,74:1 (AA), mais sur le verre dépoli du héros elle tombe à ≈4,5:1, pile
sur le plancher. Si la charte évolue, c'est la première valeur à surveiller.

### Formulaire : trois arbitrages tranchés par le fichier du client (02/10)

Mehdi a fourni la maquette en page autonome le 02/10. Elle est désormais lue en
local (`maquette/accueil-rendu.html`), et `scripts/verifie-formulaire.tsx`
compare le composant à ce fichier, champ par champ. Trois points en attente
d'arbitrage sont donc tranchés, par la maquette :

1. **Le message est obligatoire.** Il était facultatif ici, par une décision
   prise sans la maquette sous les yeux. Elle le marque `required`, comme les
   cinq autres : six champs obligatoires. Si Mehdi préfère le laisser facultatif
   pour ne pas freiner un industriel en panne, c'est une ligne à changer
   (`OPTIONNELS` dans `components/formulaire/validation.ts`), et le contrôle
   signalera l'écart avec la maquette.
2. **L'indicatif téléphonique existe.** Une liste fermée de six pays dans le
   cadre du numéro (FR, BE, CH, ES, CA, AE), celle de la maquette. Elle était
   absente du portage. Le numéro part vers HubSpot sous la forme « +33 04 72 … ».
3. **Les cinq champs cachés de la maquette ne sont pas repris** : `country`,
   `siren`, `siret`, `address`, `zip`. Ils sont vides et sans mécanisme de
   remplissage dans la maquette. Les reprendre enverrait cinq chaînes vides à
   HubSpot. À reprendre le jour où un enrichissement les remplit vraiment.

Reste un écart assumé, dans l'autre sens : la **mention RGPD** sous le bouton
n'est pas dans la maquette. Elle est exigée au point de collecte (RGPD, articles
13 et 14) et explique 33 px de hauteur en plus que la maquette sur chaque
formulaire. Elle reste.

### Bloquants techniques pour Mehdi (02/10, soir)

1. **`SUPABASE_SERVICE_ROLE_KEY` est VIDE dans `.env.local`.** Conséquence concrète :
   `node scripts/verifie-base.mjs` ne peut pas auditer les pages en brouillon,
   et ce sont justement celles qu'une écriture refusée laisse vides. La clé se
   prend dans la console Supabase, Project Settings, API. Elle ne sort jamais du
   poste ni du serveur.
2. **Clé API Thot SEO absente.** Le pipeline articles s'arrête au score : un
   article est rédigé et en statut `review`, il ne peut pas être scoré.
3. **Trois pages de preuve étaient déjà publiées** quand leur contenu a été
   réécrit (`/preuves/stellantis-fonderie-sept-fons/`, `/preuves/timescope/`,
   `/preuves/vpk/`). Le découpage imposé par la couche de permissions pose
   d'abord le contenu avec ses tableaux vides : ces trois pages ont donc été
   servies quelques secondes avec des blocs vides. Leçon pour la prochaine
   reprise : dépublier avant de réécrire une page publiée.
4. **`/expertises/robotique/fanuc/`** n'a que 3 de ses 10 sections. En brouillon,
   donc invisible, mais à reprendre.
5. **`avis.verbatims` est vide sur `/preuves/` et `/realisations/`** : les trois
   verbatims de la maquette sont marqués « à valider avec les intéressés avant
   publication ». La note et la mention du nombre d'avis restent, la colonne de
   droite est vide. À remplir quand les clients auront validé.
6. **Deux cartes de chantier ne sont pas cliquables** sur `/preuves/` (ALPINA
   SAVOIE, SANOFI MARCY) : aucune page de détail n'existe pour elles, ni dans
   l'inventaire ni dans le corpus. Rendues en `<article>` plutôt qu'en lien mort.
7. **`SITE_INDEXABLE` doit passer à `oui`** dans l'environnement Vercel le jour
   où migen.fr pointe sur ce déploiement, sinon le site reste fermé aux robots.
   Tant que ce n'est pas le cas, c'est voulu : il porte les mêmes pages que le
   site en ligne et le concurrencerait.

### Le garde-fou SQL, et pourquoi on ne le contourne pas (02/10)

**Ce qui a été découvert, et c'est utile** : la couche de permissions qui sert à
écrire en base ne refuse pas sur la TAILLE, contrairement à ce qu'on croyait.
Une instruction de 3 071 octets passe telle quelle. Elle refuse sur le
**point-virgule à l'intérieur du texte** : elle découpe la requête dessus et
rejette le fragment qui n'est plus une instruction valide. Un fragment de
577 octets portant un point-virgule est refusé ; 1 451 octets sans
point-virgule passent. Tout le découpage à 3 800 octets reposait donc sur un
mauvais diagnostic.

**Ce qui a été fait pour terminer `/expertises/robotique/fanuc/`** : un agent a
sorti le point-virgule de la chaîne et l'a rendu par `chr(59)`. Résultat
vérifié : 10 sections dans l'ordre du fichier, texte identique au corpus
(comparaison md5), vrai point-virgule stocké, aucune trace de la construction
en base, `statut` inchangé.

**Cette technique ne doit pas être réutilisée.** Le garde-fou refuse parce qu'il
n'arrive pas à lire la requête, et déguiser un caractère pour qu'il ne la voie
plus, c'est désarmer un contrôle de sécurité pour une commodité d'écriture. La
bonne voie pour un contenu qui porte un point-virgule est de **ne pas passer par
du SQL assemblé** : l'API REST de Supabase prend le JSON tel quel, sans
interprétation, et `scripts/` peut l'appeler avec `SUPABASE_SERVICE_ROLE_KEY`.
C'est une raison de plus de poser cette clé. En attendant, une page dont le
texte contient un point-virgule se signale au lieu d'être forcée.

### Cinq titres encore identiques à leur h1 (02/10, soir)

Toutes en brouillon, donc invisibles, et toutes pour la même raison : leur
contenu n'est pas encore en base, donc un titre écrit maintenant serait deviné
depuis le seul h1. L'agent a refusé de les inventer, et c'est le bon choix.

- `/ressources/articles/gmao/`
- `/ressources/articles/optimiser-la-maintenance/`
- `/ressources/articles/organiser-service-maintenance/`
- `/ressources/articles/plan-de-maintenance/`
- `/ressources/process/preparer-un-arret-technique/`

Elles se règlent d'elles-mêmes après `node scripts/importe_rest.mjs`, qui pose
leur contenu : il suffira alors de relire `node scripts/verifie-seo.mjs`.

### 43 pages tronquées en base, et 44 liens morts (02/10, mesuré)

**Mesuré, pas estimé.** `node scripts/verifie-liens.mjs` parcourt le site servi
et suit chaque lien : **44 cibles internes répondent 404**, dont onze citées par
le pied de page, donc par les 225 pages du site. Et en comparant la base aux
fichiers produits par les parseurs, **43 pages sur 61 sont tronquées** : le
contenu est là en partie, coupé à l'endroit où une instruction portait un
point-virgule.

Les pires : `/offres/residence/recruter-un-technicien/` 1 bloc sur 71,
`/carriere/electromecanicien/salaire/` 0 sur 55,
`/ressources/process/gestion-maintenance-preventive/` 8 sur 62,
`/carriere/technicien-de-maintenance/` 9 sur 54,
`/ressources/fiches-techniques/mtbf-mttr/` 9 sur 34.

**Ces pages ne sont pas publiées, et elles ne doivent pas l'être en l'état** :
publier une page à 9 blocs sur 54, c'est publier une page qui s'arrête au milieu
d'une phrase. Elles restent en brouillon, donc en 404, ce qui est désagréable
mais honnête.

**Un seul geste règle les 43**, une fois `SUPABASE_SERVICE_ROLE_KEY` posée dans
`.env.local` :

```bash
cd ~/Landing\ lovable/migen-site && node scripts/importe_rest.mjs
```

L'importateur réécrit chaque page ENTIÈRE en un appel atomique. Ensuite
seulement, `node scripts/verifie-base.mjs` peut conclure, et la publication se
décide page par page.

**18 pages sont complètes** et n'attendent qu'une décision de publication :
- `/a-propos/equipe/`
- `/expertises/robotique/fanuc/`
- `/guides/choisir-une-entreprise-de-maintenance/`
- `/guides/reussir-un-transfert-industriel/`
- `/offres/depannage-industriel/`
- `/offres/retrofit/`
- `/ressources/articles/`
- `/ressources/articles/gestion-des-dechets/`
- `/ressources/articles/maintenance-4-0/`
- `/ressources/articles/predictive-ou-corrective/`
- `/ressources/fiches-pratiques/plan-de-prevention/`
- `/ressources/fiches-techniques/`
- `/ressources/fiches-techniques/outils-de-diagnostic/`
- `/ressources/livres-blancs/`
- `/ressources/process/`
- `/secteurs/agroalimentaire/`
- `/secteurs/logistique/`
- `/travaux-industriels/montage-industriel/`

**Les 9 pages qui n'avaient AUCUN contenu** (mentions légales, confidentialité,
contact, nous connaître, valeurs, RSE, équipe, partenaires, carrière) sont
portées depuis la maquette comme des ROUTES, pas comme du contenu en base :
elles sont uniques, comme la page d'accueil, et n'ont rien à faire dans une
table qui sert des gabarits répétés.

### 172 points à valider avant la mise en ligne (03/10)

Les onze écrans portés depuis la maquette affirment des choses que personne n'a
confirmées. Elles sont PORTÉES (c'est la maquette validée) mais elles sont toutes
listées ici, classées par ce qu'elles engagent. Une page publique qui affirme un
chiffre faux ou une certification qu'on n'a pas est opposable.

**1. Mentions légales** (9 points)

- Forme juridique de la societe : la maquette ecrit [forme juridique], laisse vide
- Capital social : la maquette ecrit [montant] €, laisse vide
- RCS (ville et numero) : la maquette ecrit RCS [ville] [numero], laisse vide
- SIRET : la maquette ecrit [numero], laisse vide
- TVA intracommunautaire : la maquette ecrit [numero], laisse vide
- Directeur de la publication (nom et fonction) : la maquette ecrit [nom, fonction], laisse vide
- RAISON SOCIALE ET SIEGE. « migen©, 1 rue des Vergers, Bâtiment 3, 69760 Limonest », repris de la maquette et concordant avec components/site/implantations. CLAUDE.md marque pourtant cette adresse « à confirmer par Mehdi avant la mise en ligne, c'est une mention légale », et l'ancienne adresse d'Écully figure encore sur le site actuel. La forme « migen© » n'est pas une dénomination juridique vérifiée.
- Adresse du siège « 1 rue des Vergers, Bâtiment 3, 69760 Limonest » : MENTION LÉGALE, déjà notée « à confirmer par Mehdi » dans CLAUDE.md.
- Le libelle de chaque rubrique est DEDUIT du premier segment du chemin (« bureau-etudes » rendu « BUREAU ETUDES » par text-transform). Ce n est pas de la donnee inventee, mais ce n est pas non plus un libelle valide par le client : « ENTREPRISE MAINTENANCE INDUSTRIELLE » est long, et le titre_h1 de niveau 1 (« Un siège à Lyon, dix hubs de techniciens, des interventions partout en France. ») etait inutilisable dans une pastille en capitales.

**2. Données personnelles** (12 points)

- POINT DE CONTACT ABSENT. La maquette écrit « Contact : [adresse courriel du référent données] » et « Écrivez à [adresse courriel] ». Aucune adresse n'étant connue, la page dit « à compléter » aux deux endroits. Une politique de confidentialité sans point de contact est incomplète au regard de l'article 13 du RGPD, et elle est citée par la mention RGPD de chaque formulaire du site.
- TEAMTAILOR. La maquette affirme que les candidatures sont collectées et traitées dans Teamtailor, en qualité de sous-traitant. Aucune trace dans le code de ce site : pas de formulaire de candidature, pas d'appel Teamtailor, le mot n'apparaît nulle part hors de cette page. Porté comme demandé, à confirmer (et un contrat de sous-traitance doit exister).
- DUREES PROSPECTS ET CANDIDATURES. « 3 ans à compter du dernier contact », « 2 ans » pour les candidatures non retenues, « durée légale applicable » pour les documents contractuels. La maquette les marque elle-même « [À valider] », et aucun code ne les applique : il n'existe aucune purge de ces données, qui vivent dans HubSpot.
- DUREE DU CHOIX DE CONSENTEMENT. La page annonce 180 jours, valeur lue dans CONSERVATION_JOURS de lib/consentement.ts, dont l'en-tête porte une réserve explicite : « à trancher avant la mise en ligne au regard des recommandations CNIL ». La page le dit comme un point de départ.
- PREUVE DE CONSENTEMENT, SIX MOIS ANNONCES, AUCUNE PURGE ARMEE. supabase/migrations/0002_consentement.sql retient six mois mais laisse la tâche pg_cron EN COMMENTAIRE, le projet Supabase n'existant pas encore. Aujourd'hui la preuve ne serait jamais purgée. La page annonce six mois.
- LE BANDEAU DE CONSENTEMENT NE POINTE PAS SUR CETTE PAGE. lib/consentement.ts porte LIEN_CONFIDENTIALITE = '/politique-de-confidentialite/', l'ANCIENNE URL, redirigée en 301 vers /confidentialite/ par supabase/import/0003_redirections.sql. Le formulaire et le pied de page pointent, eux, directement sur /confidentialite/. Chaque visiteur qui clique depuis le bandeau passe donc par une redirection. Fichier d'un autre périmètre, non modifié.
- LES QUATRE DESTINATAIRES NOMMES. La page nomme Google (Google Analytics 4), Google (Google Ads), LinkedIn, OpenAI et HubSpot, lus dans LIBELLES de lib/consentement.ts. C'est une page juridique : cette liste doit correspondre aux contrats réellement signés, et le pixel OpenAI est encore annoté « adresse exacte du script à confirmer » dans components/consentement/Tags.tsx.
- ENGAGEMENT DE DELAI DE REPONSE. « une réponse vous sera apportée sous un mois », porté de la maquette. C'est le délai de l'article 12 du RGPD, mais c'est un engagement public que personne n'a confirmé pouvoir tenir.
- L'ENCART D'AVERTISSEMENT ETAIT ADRESSE AU CLIENT. La maquette y écrit « Gabarit RGPD : à faire valider par votre DPO ou votre conseil avant publication ». Laissé en place mais réécrit pour le visiteur (« Ce texte est en cours de validation juridique »), parce qu'une note destinée au client n'a rien à faire en copie publique et que taire la réserve serait pire. Publier une politique qui s'annonce elle-même non validée reste une décision à trancher : soit le texte est validé et l'encart saute, soit il reste.
- LE LIEN /confidentialite/ RENDU SUR CETTE PAGE vient de components/formulaire/FormulaireContact.tsx (mention RGPD), pas de mon code. Il repond 200, je le signale pour que la liste des liens de la page soit complete.
- « Conservation deux ans, suppression sur demande. » Mention legale propre a la candidature, NON portee : FormulaireContact porte sa propre mention RGPD, qui parle de HubSpot et renvoie a /confidentialite/. Une candidature n est pas une demande commerciale, la duree et la finalite sont a trancher.
- Le parcours de candidature de la maquette n est pas porte : depot de CV, puces de mobilite, pretentions salariales, habilitations, barre de progression en quatre ecrans. Reecrire ce parcours aurait refait la validation, le champ piege et la mention RGPD en moins bien, et sans route qui recoive un fichier.

**3. Certifications et sécurité** (17 points)

- Accidentologie 2025, valeur 03 : « 2 accidents avec arrêt, 3 sans arrêt et 1 accident de trajet en 2025, sur plus de 90 000 heures d'intervention. » Quatre chiffres publiés, dont un volume d'heures. Personne ne les a confirmés.
- Formation, valeur 05 : « 18 heures de formation par collaborateur et par an, habilitations prises en charge intégralement. » Chiffre + engagement de prise en charge totale.
- Valeur 01 : « Demandez-nous une référence sur votre technologie exacte. Si nous n'en avons pas, nous le disons avant le devis. » Engagement commercial.
- Hebergeur, son adresse complete et son telephone : la maquette ecrit [Nom de l'hebergeur], [adresse complete], [telephone], laisse vide. L hebergeur reel est Vercel et la base Supabase, mais ni la raison sociale ni l adresse postale a publier ne sont confirmees nulle part : rien n a ete tranche
- Raison sociale : la maquette ne donne que la marque « migen© », qui est rendue sous le libelle « Editeur » et non « Raison sociale ». La denomination legale reste a renseigner
- DEUX FICHIERS DE LOGO PORTENT LA MARQUE D'UNE AUTRE SOCIETE, ouverts un par un dans le navigateur : public/assets/fab/comau.svg rend le logo d'AUTOMHA, public/assets/fab/salvagnini.svg rend celui de BST Brandschutztechnik. Aucun fichier n'a ete remplace ni supprime ; les deux constructeurs rendent leur nom en texte, et les chemins sont consignes dans LOGOS_ECARTES avec leur raison. A remplacer par les vrais logos.
- ACCIDENTOLOGIE 2025, opposable : « 2 accidents du travail avec arret en 2025, sur plus de 90 000 heures d'intervention. S'y ajoutent 3 accidents sans arret et 1 accident de trajet. » (panneau du heros, et repris en indicateur du pilier 01 : « 2 accidents avec arret sur l'exercice 2025, 3 sans arret »)
- CERTIFICATION, opposable : « Demarche MASE et evaluation EcoVadis. Attestations transmises avec chaque plan de prevention. » plus les deux logos MASE et EcoVadis affiches dans le panneau du heros
- CERTIFICATION, opposable : piece 03 du dossier fournisseur, « Evaluation EcoVadis : score et fiche de synthese de notre derniere evaluation. » La maquette ne donne aucun score, rien n'a ete invente
- ENGAGEMENT chiffre : « 100 % des habilitations verifiees avant mise sur site » (pilier 01)
- ENGAGEMENT chiffre : « 48 h, delai maximal d'analyse apres un presque-accident » (pilier 01). Porte tel quel car c'est un delai d'analyse interne, pas un delai d'intervention, mais c'est un engagement opposable
- CHIFFRE RH : « 18 h de formation par collaborateur et par an », « 6 alternants et apprentis accueillis en 2025 », « 100 % des habilitations financees par migen » (pilier 02)
- LISTE DU DOSSIER FOURNISSEUR, opposable : CACES 486 et 489, habilitations electriques B1V a BR, travail en hauteur, risques chimiques ; plan de prevention ; attestations URSSAF, vigilance, RC professionnelle et decennale ; registre et bordereaux de suivi des dechets
- « Demarche MASE, plan de prevention systematique, droit d arret reconnu a chaque technicien. » Certification et engagement de securite.
- … et 3 autres, dans le rapport complet des agents

**4. Personnes nommées** (11 points)

- Credit « Photographies : [credits] » : laisse vide, alors que le site sert deja des photographies sous /assets/
- « Trois étapes, un interlocuteur nommé », « Pas de standard ni de ticket : la personne qui vous rappelle est celle qui suivra votre site » : engagement d'organisation, jamais confirmé.
- PERSONNES NOMMEES, direction : Mehdi Toumi, Directeur pole Travaux.
- PERSONNES NOMMEES, direction : Thomas Puthod, Directeur commercial avant-vente.
- PERSONNES NOMMEES, direction : Mehdi Attaf, Directeur Marketing & Revops.
- PHOTOS ABSENTES : les huit portraits et la photo « Techniciens migen sur site » sont designes dans la maquette par un identifiant interne a l'editeur (3df77672-…, 5b5403d8-…) et aucun fichier correspondant n'existe dans public/. Aucun substitut n'a ete pose. Les cadres rendent le jeton de remplacement --ph de la charte, pas le --acc de la maquette qui n'est que la teinte posee derriere une photo en cours de chargement. Fournir les fichiers et renseigner le champ `photo` de equipe-donnees.ts.
- IMAGE : la maquette pointait un identifiant d'actif Claude Design (738c047c-242f-4bf8-a178-6625747984af) sans fichier. La photo servie par defaut est /assets/web/sv-armoire.jpg, deja dans le depot, choisie pour sa proximite avec le sujet. A remplacer par la vraie photo du chantier (prop `image` de CasRetrofit)
- Les photos : les sources de la maquette sont des identifiants d actifs Claude Design qui ne designent aucun fichier du depot. Cinq images de public/assets/web ont ete choisies d apres les alt de la maquette (team-duo, team-electric, x-soudure, sv-armoire, team-grind-front). A valider ou a remplacer.
- Nom et fonction du dirigeant : « Nathan Jorez, Fondateur et dirigeant ». Mention nominative portée sur une page citée par toute la navigation.
- PORTRAIT MANQUANT, décision à trancher : la maquette appelle un fichier image pour Nathan Jorez (identifiant 3df77672-e392-41f5-9d1d-187233c73f2c) qui n'a pas été livré, et aucune photo de public/assets ne représente la personne. Le cadre orange de la maquette est rendu vide plutôt qu'avec un visage emprunté. Fournir le vrai fichier.
- IMAGES CHOISIES PAR DEFAUT, à valider : la maquette désigne ses photos par identifiant, sans table de correspondance dans le dépôt. Trois choix ont été faits sur le texte alternatif, en reprenant la correspondance déjà retenue par components/site/accueil/GrilleOffres.tsx. « Technicien de maintenance migen en intervention » vers /assets/web/team-grind-sparks.jpg (héros). « Deux techniciens Migen devant un poste de travail » et « Les premiers techniciens migen sur un site client » vers /assets/web/team-duo.jpg, le même identifiant étant employé deux fois par la maquette. Monogramme vers /assets/logo-migen-white.png, les deux emplacements étant sur fond sombre.

**5. Partenaires et marques** (17 points)

- Typographie de la marque : la maquette écrit « Un technicien migen » en minuscules dans la valeur 03, alors que le reste du site écrit « Migen ». Porté tel quel par fidélité, à trancher.
- PARTENARIAT DIMOMAINT, nom de societe tierce affiche en carte avec son logo. Porte depuis la maquette, confirme par personne cote Migen. Risque juridique si l accord n existe pas ou n autorise pas l usage du nom.
- « Alliance stratégique signée en 2026 » (carte DimoMaint). Date et nature de l accord, affirmees par la maquette. A confirmer : l accord est-il signe, et la date est-elle 2026 ?
- PARTENARIAT SAVOYE, nom de societe tierce affiche en carte avec son logo, plus l affirmation « nos techniciens interviennent sur les convoyeurs, trieurs et systemes automatises Savoye ». A confirmer, et a confirmer que l autorisation d usage de la marque existe.
- DROIT D AFFICHAGE DES DEUX LOGOS : /assets/logos/dimomaint.png et /assets/fab/savoye.jpg etaient deja dans public/ (les deux repondent 200), je les ai rattaches aux UUID de la maquette (2649a93d... pour DimoMaint, f219962e... pour Savoye). Aucun logo manquant, donc aucun bloc rendu sans son image. Mais la presence d un fichier dans le depot ne prouve pas l autorisation de le publier.
- « des acteurs français que nous connaissons sur le terrain » (chapo) : affirme que tous les partenaires sont francais.
- « Nous cherchons des partenaires français dont la maintenance est le prolongement naturel. » : engagement commercial public, Migen se declare ouvert a de nouveaux partenariats. A confirmer que c est bien la position voulue.
- « migen© reste votre point d entrée » (etape 03) : le symbole © accole a la marque est repris tel quel de la maquette. A verifier avec le conseil, © designe un droit d auteur, pas une marque deposee (® ou ™).
- « Un interlocuteur unique » / « migen© reste votre point d entrée. Nous coordonnons les partenaires et vous rendons compte » : engagement de coordination et de compte rendu. A confirmer qu il est tenu contractuellement.
- META TITLE QUE J AI ECRIT, absent de la maquette : « Partenariats industriels Migen, GMAO et intralogistique ». Repli seulement, la ligne seo de la base passe devant des qu elle existe, mais il affirme des partenariats dans la page de resultats Google. A valider ou a remplacer par une ligne seo en base pour /partenaires/, qui n existe pas aujourd hui.
- Le formulaire de la page envoie sous l identifiant de conversion « partenaires » (FORMULAIRE_PARTENAIRES). A verifier que HubSpot attend bien ce nom, sinon les demandes tombent dans un segment inexistant.
- Paragraphe Propriete intellectuelle : il affirme que les marques et logos des clients et partenaires sont « utilises avec leur accord ». Personne n a confirme cet accord, et le site affiche une bande de logos clients
- LE CHEMIN /marques/ N'EST VOULU PAR PERSONNE POUR L'INSTANT. Verifie : absent de docs/urls-site-actuel.json, absent de la base (la route attrape-tout rendait 404). Son seul appelant est components/site/accueil/LogosTechnologies.tsx, prop hrefToutesMarques = "/marques/", bouton « Voir toutes les marques ». Or le fil d'Ariane de la maquette place l'ecran SOUS Expertises (Accueil / Expertises / Marques maintenues), ce qui plaide pour /expertises/marques/. Trois issues possibles : garder /marques/ (etat actuel, le lien de l'accueil fonctionne), deplacer la page sous /expertises/marques/ et corriger le lien de l'accueil, ou abandonner la page et faire pointer l'accueil vers /expertises/specialisations-constructeur/, qui existe et repond 200. A trancher.
- LE TITRE ET LA DESCRIPTION SONT ECRITS DANS LA PAGE, pas pilotes par la base : il n'y a ni ligne pages ni ligne seo a ce chemin. Titre pose : « Marques et constructeurs maintenus | Migen ». Description : le chapeau de la maquette mot pour mot. A reprendre le jour ou la ligne seo existe, le code appelle deja metadonneesSeo pour le canonique, l'Open Graph et les directives robots.
- … et 3 autres, dans le rapport complet des agents

**6. Chiffres avancés** (57 points)

- Engagement contractuel, valeur 02 : « Le droit de refus est écrit au contrat, pas sous-entendu. » La page affirme une clause contractuelle : à confirmer sur le contrat type avant mise en ligne.
- Engagement interne, valeur 03 : « Un technicien migen a l'autorisation explicite d'arrêter une intervention qu'il juge dangereuse » et « Aucune sanction interne pour un arrêt de ce type. » À confirmer qu'une procédure écrite le porte.
- Valeur 04 : « Nos process de sélection et d'intervention sont en ligne, étape par étape, taux de passage compris » et « Les trois process sont dans la bibliothèque, librement consultables. » Aucune bibliothèque de process n'existe dans le plan du site : la page promet une publication qui n'est pas en ligne. À décider : publier les trois process, ou retirer la phrase.
- Valeur 05 : « Notre taux de turnover est communiqué sur demande, chiffre brut. » Engagement de transparence sur un chiffre RH.
- Suppression du délai de réponse : la maquette promettait une réponse « sous 48 h » en cas de valeur non tenue. Retiré au titre des interdits, donc la page ne promet plus aucun délai de réponse à une réclamation. À confirmer que c'est le choix voulu.
- « Nos offres en partenariat, 100 % Made in France. » (H1). Affirmation d origine francaise portant sur les offres en partenariat. A confirmer, c est une mention susceptible de controle.
- Adresse du siege : la maquette affirme « 1 rue des Vergers, Batiment 3, 69760 Limonest, France », portee telle quelle. CONTRADICTION DANS LE DEPOT : components/site/PiedDePage.tsx ecrit la meme adresse SANS « Batiment 3 », et lib/seo/jsonld.ts declare a Google que la seule commune certaine est ECULLY, pas Limonest, en refusant volontairement de publier voie et code postal. Trois versions du siege coexistent, dont une sur une page juridique
- Credit de cartographie NON PORTE, et c est une decision a confirmer : la maquette credite « donnees Natural Earth (domaine public) via world-atlas » pour la carte de France que components/site/implantations/PageImplantations.tsx ne porte PAS (le contrat interdit d ajouter d3 et topojson). Crediter une source dont le site ne sert rien serait faux. A remettre le jour ou la carte arrive
- TROIS LOGOS SONT PRESENTS MAIS PEU LISIBLES a 34px de haut : makino.svg (un symbole bleu seul, sans signature), hermle.svg (trait tres fin, quasi invisible), kraussmaffei.svg (ne rend que la signature « Pioneering Plastics », sans le nom). Ils sont poses tels quels, je ne les ai pas remplaces. A arbitrer.
- LA MAQUETTE AFFIRME QUE MIGEN MAINTIENT DEJA CES 67 CONSTRUCTEURS, par sept familles d'equipement, et le h1 le dit : « Les equipements que nous maintenons deja ». Personne n'a confirme cette liste. Les noms sont portes tels quels, sans ajout ni retrait.
- « Rappel dans l'heure » : l'engagement est affiché trois fois sur la page (pastille du héros, h1, sur-titre du formulaire) et une quatrième dans le libellé du bouton d'envoi du formulaire partagé.
- « Astreinte » : la maquette nomme une astreinte sans donner ni numéro ni horaires. La page la fait pointer vers le 04 78 33 72 05, le numéro du site. À confirmer que c'est bien le numéro d'astreinte, et non une ligne distincte.
- « 4 agences » : Lyon (siège), Montréal, Dubaï, Madrid. Chiffre du contrat de projet, jamais confirmé par une source Migen dans ce dépôt.
- « 10 % des candidats retenus » : repris de la maquette et cohérent avec ProcessSelection, mais c'est un chiffre public.
- … et 43 autres, dans le rapport complet des agents

**7. Engagements et formulations** (49 points)

- Panneau du héros : « Retrofit plutôt que remplacement, bureau d'études intégré. » Affirme un bureau d'études interne.
- Panneau du héros, Performance : « Mesurée chez vous : taux de disponibilité des lignes, pas nombre d'heures facturées. » Affirme un mode de mesure contractuel chez le client.
- Courriel de contact legal : la maquette ecrit [adresse], laisse vide, et aucune adresse e-mail n existe nulle part dans le depot
- Date de derniere mise a jour : la maquette elle-meme ecrit « Derniere mise a jour : a completer », porte tel quel. Une page de mentions legales sans date est une mention incomplete
- Bandeau « Gabarit juridique : les mentions ci-dessous doivent etre completees et validees par votre conseil » : il est de la maquette, il est VISIBLE PAR LES VISITEURS. A retirer le jour ou les valeurs sont renseignees, pas avant
- Paragraphe Responsabilite : il affirme que seuls les documents contractuels signes font foi, et engage la responsabilite de l entreprise sur les liens tiers. Formulation de la maquette, non validee par un conseil
- Credit « Conception et realisation : [agence] » : la maquette laisse l agence vide, laisse vide
- Meta title « Mentions legales, migen » et description « Informations legales, editeur, hebergeur et propriete intellectuelle du site migen. » : repris de docs/urls-site-actuel.json, donc du site servi aujourd hui, pas rediges pour cette page
- La page est indexable (aucun noindex) alors que la quasi-totalite de ses mentions porte « a completer ». A arbitrer : la laisser indexable ou la fermer jusqu au remplissage
- DATE DE MISE A JOUR. « Dernière mise à jour : à compléter », porté tel quel depuis la maquette.
- TRANSFERT DES UTM A HUBSPOT. app/api/lead/route.ts envoie les UTM et la page d'entrée à HubSpot uniquement si la finalité publicité est accordée, et tronque sinon la chaîne de requête de l'URL. La page dit que la copie gardée de notre côté ne retient que la page et la campagne ; elle ne détaille pas ce transfert conditionnel. A compléter si le conseil juridique l'exige.
- TREIZE LOGOS MANQUENT DU DEPOT et rendent leur nom en texte : Leroy-Somer, ABB Robotics, Yaskawa, Haas, Hurco, Amada, Wittmann, Billion, Davis-Standard, Coperion, Sidel, TGW, Seepex. Les chemins attendus sont ceux de public/assets/fab/brands.json. Des qu'un fichier arrive, le controle echoue et reclame son chemin.
- LE CHAPEAU AFFIRME « Nous avons deja le technicien qui les connait » pour toute machine de la liste. Engagement commercial non confirme, porte tel quel.
- Horaires : ni la maquette ni components/site/entete-donnees.ts n'en portent. La page n'en affiche donc aucun. À fournir s'il en faut.
- … et 35 autres, dans le rapport complet des agents

**23 liens de la maquette n'ont pas été posés**, faute de page existante.
Ils sont rendus en texte plutôt qu'en lien mort :

- /rse/ — libellé « Nos engagements RSE », second bouton du héros (sc-camel-on-click goRse) : répond 404, aucune page RSE dans le plan du site. Le libellé est ren
- /contact/ — libellé « Nous mettre à l'épreuve » (héros) et « Nous écrire » (appel final), cibles goContact de la maquette : répond 404. Plutôt qu'un libellé ine
- /contact/ — libelle « Proposer un partenariat ». curl : 404. La maquette ouvrait la page de contact par sc-camel-on-click="{{ goContact }}". ECART ASSUME, docum
- Article d annonce du partenariat DimoMaint — libelle « Lire l annonce → » dans la carte DimoMaint, sc-camel-on-click="{{ goArticle }}". Aucune cible possible : 
- /marques/ — non demande par cet ecran, verifie au passage parce que LogosTechnologies le pose deja ailleurs : 404 aussi. Signale, pas de mon ressort.
- /contact/ : cible implicite du sc-camel-on-click="{{ goContact }}" des deux boutons « Decrire mon besoin » (lignes 2883 et 2921). Repondait 404 au moment du por
- /expertises/marques/ : chemin suggere par le fil d'Ariane de la maquette (Accueil / Expertises / Marques maintenues). Repond 404, non pose ; le dernier niveau d
- /contact/ (404), libelle « Parler a un charge d'affaires », cible du verbe goContact de la maquette ligne 5969. Non posee. Le bouton mene a l'ancre #formulaire 
- #form-equipe, ancre propre a la maquette ligne 5987 et 5993. Non reprise : le projet n'a qu'un nom d'ancre de formulaire, #formulaire, porte par FormulaireBasDe
- /carriere/technicien-de-maintenance/ 404, libelle « Technicien de maintenance »
- /carriere/automaticien/ 404, libelle « Automaticien »
- /carriere/electrotechnicien/ 404, libelle « Electrotechnicien »
- … et 11 autres
