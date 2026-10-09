# Site Migen, architecture headless

> **Reprise de session : lire `docs/PASSATION.md` AVANT toute action.**
> Il porte la référence validée par Mehdi (le rendu de la maquette autonome),
> ses décisions datées, les arbitrages ouverts, les outils et les dix pièges
> déjà payés. Deux journées ont été en partie perdues faute de l'avoir eu.

Contrat de projet. Relu à chaque session. Ce qui est écrit ici prime sur toute
habitude de framework.

## 1. Contexte

Migen, maintenance industrielle B2B : déploiement de techniciens
électromécaniciens, automaticiens et roboticiens sur sites clients.
**Siège à Limonest**, 1 rue des Vergers, 69760 Limonest.
**Agence à Écully**, 129 chemin du Moulin Carron, 69130 Écully.

> **Tranché par Mehdi le 09/10 : « le siège est à Limonest, l'agence est à
> Écully ».** Cette décision RENVERSE la sienne du 07/10 et donne raison à
> l'audit de Nathan Jorez du 09/10, qui signalait « le siège à Écully au lieu de
> Limonest » dans les mentions légales.
>
> **Et elle revient à la maquette, elle ne s'en écarte pas** : la maquette écrit
> « Siège, 1 rue des Vergers, 69760 Limonest » sur 96 de ses 244 captures,
> « Lyon, Siège · Limonest et Écully » sur la page Équipe, et « siège à
> Limonest et bureaux à Écully » dans le chapô de Lyon. Ce sont les sept règles
> de réécriture du 07/10 qui l'en écartaient ; elles sont retirées de
> `lib/decisions-copie.ts`, et le texte de la capture passe désormais tel quel.
>
> Ce qui reste à notre main, parce que la maquette ne le dit nulle part : Écully
> est nommée **agence**, et non plus « siège ». Trois endroits, tous sans
> capture pour cette partie : le pied de page, la liste des agences de
> `/contact/` et la politique de confidentialité.
>
> **Deux portes ont dû être retournées** : `verification-pied-de-page.tsx` et
> `verification-contact.tsx` refusaient explicitement « Limonest ». Celle de
> Contact exige maintenant LES DEUX, le siège et l'agence : n'en vérifier qu'un
> seul est précisément ce qui avait laissé passer l'erreur.

> **CADUC depuis le 09/10, gardé pour l'histoire.** Les deux paragraphes qui
> suivent ont tour à tour affirmé Écully, puis Limonest, puis Écully. La
> décision du 09/10 ci-dessus clôt la série : siège à Limonest, agence à Écully.
>
> **CADUC depuis le 07/10, gardé pour l'histoire.** Cette ligne disait « Écully et Lyon ». Corrigée le 02/10 après vérification,
> parce que trois sources plus récentes et concordantes disent Limonest : la
> maquette validée (« 1 rue des Vergers, 69760 Limonest »), le corpus rédigé
> (« le siège du groupe est à Limonest, près de Lyon ») et le site en ligne.
> L'adresse d'Écully (129 chemin du Moulin Carron, 69130) figure encore sur
> certaines pages du site actuel. Mehdi a confirmé le 07/10 que c'est elle,
> l'adresse du siège : le raisonnement ci-dessus était faux.

Un site existe déjà, en Astro, dans `../migen-refonte` (223 pages construites,
corpus rédigé, portes de vérification). Il reste en ligne pendant toute la
construction de celui-ci. Ce projet le remplace par une architecture headless :
le contenu vit dans Supabase, le front l'affiche.

- **Domaine** : migen.fr
- **Objectif numéro un** : générer des leads qualifiés, mesurables de bout en bout.
- **Personas** : responsable maintenance, directeur technique ou d'exploitation,
  directeur général, directeur d'usine, DRH.

## 2. Décisions actées

| Sujet | Décision | Date |
|---|---|---|
| Front | Next.js App Router, TypeScript, Tailwind v4, bun | 02/10 |
| Contenu | Supabase (Postgres, Auth, Storage), projet dédié `migen-site` | 02/10 |
| Hébergement | Vercel (déploiements, Cron, revalidation) | 02/10 |
| CRM | HubSpot, portail 148000737 | acquis |
| SEO éditorial | Thot SEO, score cible 90, plancher le score cible de la SERP | acquis |

Le projet Supabase n'est pas encore créé. Les migrations sont écrites et
versionnées dans `supabase/migrations/` : elles s'appliquent le jour où le
projet existe.

## 3. Principes non négociables

1. **Performance d'abord.** Le contenu est lu dans Supabase au build (SSG) ou
   avec revalidation (ISR). Jamais de chargement du contenu éditorial côté
   navigateur. Google reçoit du HTML complet.
2. **Aucune page perdue.** Toute URL actuelle est conservée ou redirigée en 301.
3. **Un mot clé principal par page.**
4. **Aucun secret côté client.** `service_role` ne sort pas du serveur.
   `lib/supabase.ts` porte `import "server-only"` : le build échoue si un
   composant client l'importe.
5. **Aucun traceur avant consentement.**
6. **Copie en français, jamais de tiret cadratin.** Virgule, parenthèses ou
   deux-points.

## 4. Arborescence et routing

- URL hiérarchiques `/niveau1/niveau2/niveau3/`, slash final systématique.
- Une route attrape-tout unique, `app/[...slug]/page.tsx`, résout le chemin
  depuis la table `pages`.
- Fil d'Ariane déduit de la hiérarchie parent/enfant.
- Maillage interne automatique : parent, enfants, deux à quatre sœurs, en
  **cartes cliquables**, jamais en liens noyés dans un paragraphe.
- Chaque page porte un appel à l'action vers un formulaire.

## 5. Modèle de données

Le schéma fait foi dans `supabase/migrations/`. Points de conception à connaître :

- `pages.path` est **calculé par trigger** depuis le parent, jamais écrit à la
  main, et propagé aux descendants quand un slug change. Stocké avec slash final.
- `pages.niveau` est vérifié par trigger : il vaut toujours le niveau du parent
  plus un.
- `seo` sert `pages` **et** `articles` : deux clés étrangères, une contrainte
  qui en exige exactement une.
- Les montants sont en **centimes**, jamais en flottant.
- `leads` ne porte **aucune donnée nominative** : ni nom, ni e-mail, ni
  téléphone. L'identité vit dans HubSpot, référencée par `id_hubspot`.
- `consent_logs` ne porte aucune adresse IP, et le user agent est tronqué.

### Sécurité au niveau des lignes

Trois cercles, définis dans `0004_rls.sql` :

- **public** (clé anonyme) : lit le contenu `published`, insère une preuve de
  consentement. Rien d'autre.
- **console** (authentifié **et** membre de `membres_console`) : lit les
  chiffres. La fonction `est_membre_console()` est `security definer` pour
  éviter la récursion RLS, piège classique de Supabase.
- **serveur** (`service_role`) : écrit tout, ne quitte jamais le serveur.

Les privilèges de schéma doublent les policies : une policy oubliée ne suffit
pas à ouvrir une table.

## 6. SEO technique

- `generateMetadata` par page depuis la table `seo`.
- `sitemap.xml` et `robots.txt` générés, pages et articles publiés uniquement,
  hors `noindex`.
- JSON-LD : Organization (global), BreadcrumbList (toutes pages), Service
  (offres), Article (blog).
- Redirections lues dans `redirects` et appliquées par le proxy (fichier proxy.ts, ex-middleware).
- Images par le composant optimisé de Next, formats modernes, dimensions
  explicites.
- Core Web Vitals au vert sur mobile. Lighthouse avant chaque mise en production.

## 7. Formulaires et leads

- Soumission par une route serveur qui appelle l'API Forms de HubSpot.
- Transmis : cookie `hubspotutk`, URL et titre de la page, UTM capturés à l'arrivée.
- Copie non nominative dans `leads`.
- Événement de conversion envoyé aux régies **uniquement** si le consentement
  publicitaire est donné.

## 8. Consentement

- Bandeau : « Tout accepter », « Tout refuser » et « Personnaliser », de **même
  poids visuel**. Exigence CNIL, pas une préférence esthétique.
- Lien permanent en pied de page pour modifier son choix.
- Google Consent Mode v2 : `denied` par défaut sur `ad_storage`,
  `analytics_storage`, `ad_user_data`, `ad_personalization`, posé **avant** tout
  tag Google.
- Tags conditionnés : GA4, Google Ads, LinkedIn Insight, pixel OpenAI, HubSpot.
- Preuve enregistrée dans `consent_logs`.
- **À arbitrer avant mise en ligne** : durée de conservation du choix, au regard
  des recommandations CNIL en vigueur.
- Test obligatoire des deux parcours, accepter et refuser, avec Google Tag Assistant.

## 9. Pipeline articles

1. Mot clé choisi, rattaché à une page pilier.
2. Analyse Thot sur le mot clé, identifiant d'analyse conservé dans
   `articles.thot_analysis_id`.
3. Rédaction, puis score Thot, itérer jusqu'à **90** (ou au mieux atteignable
   quand la SERP est saturée d'artefacts : le noter alors explicitement).
4. Insertion dans `articles`, statut `review`.
5. **Relecture humaine obligatoire** avant `published`.
6. La publication déclenche la revalidation de l'article, de sa page pilier et
   du sitemap.

Interdits de rédaction, hérités du site actuel et non négociables : aucun délai
chiffré d'intervention (seul « rappel dans l'heure » est autorisé), aucun prix,
jamais « régie », « intérim », « mise à disposition », « sans engagement »,
jamais « levier », « clé en main », « sur mesure », « concrètement »,
« notamment », « incontournable », « découvrez ». Quatre agences (Lyon, siège à
Limonest et agence à Écully, Montréal, Dubaï, Madrid), aucune autre en France,
dix hubs de techniciens.

> **« Aucun prix » NE VEUT PAS DIRE « aucune phrase sur le prix ».** Tranché par
> Mehdi le 09/10 : « ne donne aucun tarif, dis juste que c'est sur devis ».
>
> La purge appliquée jusque-là jetait la PHRASE ENTIÈRE dès qu'elle portait le
> mot « tarif », « taux horaire » ou « prix mensuel fixe », même sans le moindre
> montant. Le site perdait ainsi des réponses utiles que sa propre maquette
> écrit, par exemple « Le contrat Zéro arrêt est chiffré sur devis, avec un
> engagement type de 6 mois renouvelable et trois niveaux de couverture ».
>
> La règle est donc : **un MONTANT reste interdit** (un nombre suivi de € ou
> d'euros, un taux, une fourchette), **une phrase qui renvoie au devis est
> autorisée**. « Chiffré sur devis », « taux horaire homogène dans toute la
> France », « le montant dépend du parc » passent ; « 850 € par mois » non.
>
> Conséquence pour les portes : celles qui refusaient le MOT doivent refuser le
> MONTANT. En les assouplissant, vérifier que leur preuve d'échec porte encore
> sur un vrai montant, sans quoi elles perdent leur capacité d'échouer.

## 10. Console marketing

`/admin`, protégée par Supabase Auth, comptes nominatifs inscrits dans
`membres_console`.

Ingestion quotidienne par Vercel Cron, une fonction par source, journalisée dans
`ingestion_runs` : Search Console, GA4, Google Ads, LinkedIn, HubSpot, et
ChatGPT Ads (**à vérifier** : existence d'une API de reporting, sinon import CSV).

Vues attendues : par page, par canal, entonnoir, santé du cocon (pages sans
trafic, pages orphelines, cannibalisation).

## 11. Migration de l'existant

1. Inventorier toutes les URL actuelles (crawl et sitemap).
2. Table de correspondance ancienne URL vers nouvelle.
3. Importer le contenu de `../migen-refonte/seo/` dans Supabase.
4. Vérifier : aucune 404 sur l'inventaire, aucune chaîne de redirection.

## 12. Ordre de réalisation

1. ✅ Schéma Supabase, RLS, migrations versionnées.
2. ⏳ Routing dynamique, gabarits, SEO technique.
3. Migration du contenu et redirections.
4. Formulaires HubSpot, consentement, tags conditionnés.
5. Pipeline articles.
6. Console marketing.
7. Recette : Lighthouse, Tag Assistant, crawl complet, test des formulaires.

## 13. Règles de travail

- Une branche Git par phase, commits explicites.
- Toute modification de schéma passe par une **migration versionnée**, jamais
  par une écriture directe en base.
- **Demander confirmation avant toute action destructive** : suppression de
  table, de données, de redirection, application d'une migration en production.
- Ne jamais inventer une donnée client, un chiffre ou une référence. Un
  contenu de démonstration est marqué comme tel.
- Variables d'environnement documentées dans `.env.example`, jamais commitées.
- Avant d'annoncer qu'une phase est finie : `bunx tsc --noEmit`, `bun run build`,
  et la vérification effectivement lancée, pas supposée.

## 14. Commandes

```bash
bun run dev            # développement
bun run build          # build de production
bunx tsc --noEmit      # types
bun run types:base     # régénère types/base.ts depuis Supabase (projet requis)
```

## 15. Écriture en base : ne jamais désarmer le garde-fou

La couche de permissions refuse une instruction SQL qu'elle n'arrive pas à lire,
et le déclencheur n'est pas la taille : c'est le **point-virgule dans le texte**
(elle découpe dessus). Une instruction de 3 ko passe ; 577 octets avec un
point-virgule interne sont refusés.

**Interdit** : déguiser le caractère (`chr(59)`, concaténation, encodage) pour
que le garde-fou ne le voie plus. Un contrôle qu'on contourne ne protège plus
rien, et le prochain contournement portera sur autre chose.

**À faire** : écrire ce contenu par l'**API REST** de Supabase, qui prend le JSON
tel quel sans l'interpréter, depuis un script de `scripts/` avec
`SUPABASE_SERVICE_ROLE_KEY`. Si la clé manque, la page se signale et attend ;
elle ne se force pas.

## 16. Les gabarits de page : onze, et c'est l'index du client qui le dit

> Réécrit le 05/10. La version précédente annonçait **sept** gabarits et une
> règle de contenu fausse. Elle a coûté une journée entière de portage contre le
> mauvais modèle, et le client a dû répéter six fois « ça ne ressemble pas ».
> Ce qui suit est mesuré, pas supposé.

### La référence, et elle est unique

**Le rendu de la maquette fait foi.** Décision de Mehdi, le 05/10. Pas un export
source, pas un fichier intermédiaire : l'application telle qu'elle tourne, avec
son routeur, son contenu rédigé et ses images.

- L'application : `maquette/site-final-autonome.html`
- Son contenu : `maquette/contenu/`, 221 markdown et 6 json, dont
  `contenu/site/index.json` qui décrit les **248 pages**
- Le rendu figé : `maquette/rendu/`, produit par `scripts/capture-maquette.mjs`

`maquette/site-final.html` est un export de démonstration qui empile 33 écrans.
**Il n'est le gabarit d'aucune page.** Ne pas porter contre lui.

### Les onze gabarits

Chaque entrée de `contenu/site/index.json` porte un champ `gabarit` :

```json
{ "url": "/offres/residence/", "h1": "Sous-traitance de maintenance industrielle",
  "fichier": "Offres/offres--residence.md", "gabarit": "03 Offre et prestation" }
```

| Gabarit | Pages |
|---|---|
| 01 Article et fiche | 38 |
| 02 Étude de cas | 41 |
| 03 Offre et prestation | 28 |
| 04 Ville | 66 |
| 05 Spécialité | 19 |
| 06 Département | 8 |
| 07 Métier et carrière | 13 |
| 08 Secteur | 12 |
| 09 Domaine | 11 |
| 10 Hub de rubrique | 7 |
| 11 Sous-rubrique ressource | 5 |

C'est l'index qui attribue son gabarit à une page. On ne le devine pas, on le lit.

### La règle de contenu, corrigée

L'ancienne version disait que le texte du corpus absent de la maquette était
« rendu **sous** les sections de la maquette, avec ses motifs à elle ». **C'est
faux, et c'est la source de l'empilement que le client rejetait.**

La maquette **consomme le corpus** : elle le charge elle-même, à l'exécution,
depuis `contenu/site/<famille>/<page>.md` (méthodes `cxBoot` et `cxFetch`). Le
corpus n'est pas un supplément qu'on pose en dessous : c'est le contenu de la
page, et il se rend **à l'intérieur** du gabarit, aux emplacements prévus.

Mesuré sur `/offres/residence/` rendu par la maquette, 17 sections :

```
 5  Le poste de technicien de maintenance reste vacant…   corpus
 6  Ce que nous faisons, et ce que ça change pour vous     corpus
 8  Un appel. Un plan. Une ligne qui repart.               corpus
 9  Ce que nous garantissons                               corpus
11  Nos références                                         gabarit
13  Vos questions avant de nous appeler                    gabarit
14  Un autre besoin ? Il a son offre.                      gabarit
```

Entrelacé, pas empilé. Le dessin vient du gabarit, le texte vient du corpus,
**rien ne s'invente**, et rien ne se range en appendice.

### Le piège qui reste vrai

Un gabarit porté en composant ne change RIEN tant que `pages.contenu` ne porte
pas son discriminant. Quatre gabarits ont été écrits, relus, testés, et 126 pages
ont continué d'être servies par le gabarit de vente sans que rien ne le signale.
Le client l'a vu avant nous, deux fois.

Avant de dire qu'un gabarit est porté, ouvrir une vraie page et comparer son
rendu à `maquette/rendu/`, pas à ce que le composant sait faire.
