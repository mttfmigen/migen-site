# Site Migen, architecture headless

Contrat de projet. Relu à chaque session. Ce qui est écrit ici prime sur toute
habitude de framework.

## 1. Contexte

Migen, maintenance industrielle B2B : déploiement de techniciens
électromécaniciens, automaticiens et roboticiens sur sites clients. Siège à
Écully et Lyon.

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
- Redirections lues dans `redirects` et appliquées par le middleware.
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
« notamment », « incontournable », « découvrez ». Quatre agences (Lyon siège,
Montréal, Dubaï, Madrid), aucune autre en France, dix hubs de techniciens.

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
