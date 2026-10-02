# Schéma Supabase

Quatre migrations, à appliquer dans l'ordre. Elles ne sont pas encore passées :
le projet Supabase `migen-site` reste à créer.

| Fichier | Ce qu'il pose |
|---|---|
| `0001_contenu.sql` | `pages`, `articles`, `seo`, `business_cases`, `redirects`, et les triggers de chemin, de niveau et d'horodatage |
| `0002_consentement.sql` | `consent_logs` |
| `0003_console.sql` | `metrics_gsc_daily`, `metrics_ga4_daily`, `metrics_ads_daily`, `leads`, `ingestion_runs`, `membres_console` |
| `0004_rls.sql` | la sécurité au niveau des lignes et les privilèges de schéma |

## Appliquer

```bash
# 1. Créer le projet (région eu-west-3, organisation Migen)
#    Puis renseigner SUPABASE_PROJECT_ID et les clés dans .env.local

# 2. Lier le dépôt au projet
bunx supabase link --project-ref "$SUPABASE_PROJECT_ID"

# 3. Pousser les migrations
bunx supabase db push

# 4. Régénérer les types TypeScript depuis le schéma réel
bun run types:base
```

`types/base.ts` est écrit à la main pour l'instant, afin que le code compile
avant que la base existe. L'étape 4 le remplace par la version générée : c'est
elle qui fait foi ensuite.

## Trois pièges à connaître

**Le chemin se calcule, il ne s'écrit pas.** `pages.path` est posé par un
trigger depuis le parent et propagé aux descendants quand un slug change. Écrire
`path` à la main crée une incohérence silencieuse entre l'URL servie et la
hiérarchie.

**La récursion RLS.** Une policy qui interroge la table qu'elle protège boucle
jusqu'à l'erreur. C'est pour cela que `est_membre_console()` est
`security definer` avec un `search_path` figé, et que la policy de
`membres_console` lit `auth.uid()` directement au lieu d'appeler la fonction.

**`service_role` contourne tout.** Aucune policy ne le concerne. Il ne doit
jamais sortir du serveur : `lib/supabase.ts` porte `import "server-only"` pour
que le build échoue si un composant client tente de l'importer.

## Avant d'appliquer en production

Relancer les advisors de sécurité après chaque migration :

```bash
# via le MCP Supabase : get_advisors(type: "security")
```

Une table sans RLS ou une fonction sans `search_path` figé y apparaît
immédiatement.
