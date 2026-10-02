-- 0002 · Preuve de consentement (CMP maison).
--
-- Rien de nominatif ici : l'identifiant visiteur est un aléa tiré côté
-- navigateur, le user agent est tronqué, aucune adresse IP n'est stockée.
-- C'est une preuve de choix, pas un profil.

create type finalite_consentement as enum ('mesure_audience', 'publicite', 'personnalisation');

-- Postgres interdit une sous-requête dans une contrainte CHECK : la règle
-- « toutes les valeurs sont des booléens » passe donc par une fonction
-- immuable, seule forme acceptée. Défaut découvert à la première application
-- réelle, pas à la relecture : une contrainte invalide ne se voit qu'au
-- moment où la base la refuse.
create or replace function choix_sont_booleens(choix jsonb) returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(bool_and(jsonb_typeof(valeur) = 'boolean'), false)
    from jsonb_each(choix) as paire(cle, valeur);
$$;

create table consent_logs (
  id uuid primary key default gen_random_uuid(),
  -- Aléa généré par le navigateur, sans lien avec une personne identifiée.
  visitor_id text not null check (char_length(visitor_id) between 8 and 64),
  -- Un objet { finalite: booléen } plutôt qu'une colonne par finalité :
  -- ajouter une finalité ne demandera pas de migration.
  choix jsonb not null,
  version_bandeau text not null check (char_length(version_bandeau) <= 64),
  -- Tronqué à 120 caractères à l'écriture : assez pour distinguer un robot,
  -- trop peu pour contribuer à une empreinte.
  user_agent text check (char_length(user_agent) <= 120),
  created_at timestamptz not null default now(),

  -- Le choix doit couvrir au moins une finalité connue, et ne porter que des booléens.
  constraint consent_choix_valide check (
    jsonb_typeof(choix) = 'object'
    and choix <> '{}'::jsonb
    and choix_sont_booleens(choix)
  )
);

create index consent_logs_visitor_idx on consent_logs (visitor_id, created_at desc);
create index consent_logs_date_idx on consent_logs (created_at desc);

comment on table consent_logs is
  'Preuve de consentement. Aucune donnée nominative, aucune adresse IP. '
  'Conservation six mois, purge manuelle tant que le projet Supabase n''est pas '
  'créé (voir la requête de purge en fin de 0002_consentement.sql).';

-- ------------------------------------------------------------------- purge
-- Durée de conservation retenue : SIX MOIS.
--
-- POURQUOI six mois et pas plus : la preuve ne sert qu'à démontrer un choix
-- encore en vigueur. Le choix lui-même est reconduit à l'expiration du cookie,
-- une preuve plus ancienne n'atteste donc plus rien d'opposable, et la garder
-- revient à conserver une donnée sans finalité, ce que le RGPD interdit.
--
-- POURQUOI la purge n'est pas automatisée ici : une tâche programmée
-- (`pg_cron`) se déclare sur un projet Supabase existant, et celui-ci n'est pas
-- encore créé. La requête ci-dessous est prête, à exécuter à la main en
-- attendant, puis à poser en tâche quotidienne le jour de la création du
-- projet. Elle est volontairement laissée en commentaire : une migration ne
-- doit pas supprimer de données au moment où elle s'applique.
--
--   delete from consent_logs where created_at < now() - interval '6 months';
--
-- Tâche à poser le jour où le projet existe, une fois `pg_cron` activé :
--
--   select cron.schedule(
--     'purge_consent_logs',
--     '30 3 * * *',
--     $$delete from consent_logs where created_at < now() - interval '6 months'$$
--   );
