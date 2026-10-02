-- 0003 · Console marketing : métriques ingérées, leads, journal d'ingestion.
--
-- Les tables `metrics_*` sont alimentées chaque jour par un cron Vercel, une
-- fonction par source. Elles sont en écriture seule depuis le serveur, et en
-- lecture pour les membres de la console.
--
-- Chaque table porte une clé naturelle (date + dimensions) : une ingestion
-- rejouée met à jour au lieu de dupliquer (`on conflict do update`).

create type source_ingestion as enum ('gsc', 'ga4', 'google_ads', 'linkedin_ads', 'openai_ads', 'hubspot');
create type statut_ingestion as enum ('en_cours', 'succes', 'echec');

-- ------------------------------------------------- Google Search Console
create table metrics_gsc_daily (
  date date not null,
  page_path text not null,
  query text not null,
  clicks integer not null default 0 check (clicks >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  ctr numeric(6, 5) not null default 0 check (ctr between 0 and 1),
  position numeric(6, 2) not null default 0 check (position >= 0),
  ingested_at timestamptz not null default now(),
  primary key (date, page_path, query)
);

create index metrics_gsc_page_idx on metrics_gsc_daily (page_path, date desc);
create index metrics_gsc_query_idx on metrics_gsc_daily (query, date desc);

-- ------------------------------------------------------------------- GA4
create table metrics_ga4_daily (
  date date not null,
  page_path text not null,
  source text not null default '(direct)',
  medium text not null default '(none)',
  campaign text not null default '(not set)',
  sessions integer not null default 0 check (sessions >= 0),
  engaged_sessions integer not null default 0 check (engaged_sessions >= 0),
  conversions integer not null default 0 check (conversions >= 0),
  ingested_at timestamptz not null default now(),
  primary key (date, page_path, source, medium, campaign)
);

create index metrics_ga4_page_idx on metrics_ga4_daily (page_path, date desc);

-- ---------------------------------------------------------------- régies
create type plateforme_ads as enum ('google', 'linkedin', 'openai');

create table metrics_ads_daily (
  date date not null,
  plateforme plateforme_ads not null,
  campagne text not null,
  impressions integer not null default 0 check (impressions >= 0),
  clics integer not null default 0 check (clics >= 0),
  -- Le coût est en centimes : jamais de flottant sur de l'argent.
  cout_centimes integer not null default 0 check (cout_centimes >= 0),
  conversions integer not null default 0 check (conversions >= 0),
  ingested_at timestamptz not null default now(),
  primary key (date, plateforme, campagne)
);

create index metrics_ads_plateforme_idx on metrics_ads_daily (plateforme, date desc);

-- ----------------------------------------------------------------- leads
-- Copie de travail du lead. HubSpot reste la source de vérité commerciale :
-- cette table sert l'attribution et les vues de la console.
create table leads (
  id uuid primary key default gen_random_uuid(),
  id_hubspot text unique,
  date timestamptz not null default now(),
  page_entree text,
  page_conversion text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  formulaire text not null,
  statut_deal text,
  montant_deal_centimes integer check (montant_deal_centimes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_date_idx on leads (date desc);
create index leads_page_conversion_idx on leads (page_conversion);
create index leads_campagne_idx on leads (utm_source, utm_medium, utm_campaign);

create trigger leads_touch before update on leads
  for each row execute function touch_updated_at();

comment on table leads is
  'Copie d''attribution. Aucune donnée nominative : ni nom, ni e-mail, ni '
  'téléphone. L''identité du contact vit dans HubSpot, référencée par id_hubspot.';

-- ------------------------------------------------------- journal d'ingestion
create table ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source source_ingestion not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  statut statut_ingestion not null default 'en_cours',
  lignes_ecrites integer check (lignes_ecrites >= 0),
  erreur text,

  -- Une exécution terminée porte sa date de fin, et inversement.
  constraint ingestion_fin_coherente check (
    (statut = 'en_cours') = (ended_at is null)
  ),
  -- Un échec sans message n'aide personne.
  constraint ingestion_echec_documente check (
    statut <> 'echec' or erreur is not null
  )
);

create index ingestion_runs_source_idx on ingestion_runs (source, started_at desc);

-- --------------------------------------------------------- membres console
-- Qui a le droit de lire la console. Table séparée plutôt qu'un rôle global :
-- un compte Supabase ne donne pas accès aux chiffres par le seul fait d'exister.
create table membres_console (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  cree_le timestamptz not null default now()
);

/*
 * Appartenance à la console.
 *
 * SECURITY DEFINER et search_path figé : sans cela, une policy qui interroge
 * `membres_console` déclencherait la policy de `membres_console`, qui
 * interrogerait `membres_console`... La récursion RLS est le piège classique
 * de Supabase, elle se neutralise ici.
 */
create or replace function est_membre_console() returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from membres_console where user_id = auth.uid());
$$;

revoke all on function est_membre_console() from public;
grant execute on function est_membre_console() to authenticated;
