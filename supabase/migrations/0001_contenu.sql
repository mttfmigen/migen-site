-- 0001 · Contenu éditorial : pages du cocon, SEO, articles, cas clients, redirections.
--
-- Choix structurants, pour mémoire :
--  · `path` n'est PAS une colonne générée : Postgres interdit une expression
--    récursive. Un trigger la recalcule depuis le parent, et la propage aux
--    descendants quand un slug ou un parent change.
--  · Le path est stocké avec un slash final (« /offres/depannage/ »), comme
--    les URL servies. Une seule forme en base, aucune normalisation à l'exécution.
--  · `seo` est partagée par `pages` et `articles` : deux clés étrangères
--    nullables et une contrainte qui en exige exactement une.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- énumérations
create type statut_publication as enum ('draft', 'review', 'published');
create type type_cta as enum ('devis', 'intervention', 'rappel', 'diagnostic', 'candidature');
create type type_schema as enum ('WebPage', 'Service', 'Article', 'FAQPage', 'CollectionPage', 'Organization');

-- ---------------------------------------------------------------------- pages
create table pages (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references pages (id) on delete restrict,
  niveau smallint not null check (niveau between 1 and 3),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  -- Calculé par trigger : « /niveau1/niveau2/ », slash final systématique.
  path text not null,
  titre_h1 text not null,
  -- MDX ou blocs JSON : le front décide du rendu, la base ne tranche pas.
  contenu jsonb not null default '{}'::jsonb,
  mot_cle_principal text,
  mots_cles_secondaires text[] not null default '{}',
  persona_cible text[] not null default '{}',
  cta_type type_cta not null default 'devis',
  statut statut_publication not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pages_slug_unique_par_parent unique nulls not distinct (parent_id, slug),
  constraint pages_path_unique unique (path),
  -- Une page de niveau 1 n'a pas de parent ; au-delà, le parent est obligatoire.
  constraint pages_parent_coherent check (
    (niveau = 1 and parent_id is null) or (niveau > 1 and parent_id is not null)
  ),
  -- Publier exige une date de publication, et inversement.
  constraint pages_publication_coherente check (
    (statut = 'published') = (published_at is not null)
  )
);

comment on column pages.path is 'Chemin canonique avec slash final, calculé par trigger. Ne jamais écrire à la main.';

create index pages_parent_idx on pages (parent_id);
create index pages_statut_idx on pages (statut) where statut = 'published';
create index pages_mot_cle_idx on pages (mot_cle_principal) where mot_cle_principal is not null;

-- ------------------------------------------------------------------ articles
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  titre text not null,
  contenu jsonb not null default '{}'::jsonb,
  -- Rattachement au cocon : l'article pointe vers sa page pilier.
  page_pilier_id uuid references pages (id) on delete set null,
  mot_cle_principal text,
  score_thot smallint check (score_thot between 0 and 100),
  thot_analysis_id text,
  auteur text,
  statut statut_publication not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint articles_publication_coherente check (
    (statut = 'published') = (published_at is not null)
  )
);

create index articles_pilier_idx on articles (page_pilier_id);
create index articles_statut_idx on articles (statut) where statut = 'published';

-- ----------------------------------------------------------------------- seo
-- Une ligne par page OU par article, jamais les deux.
create table seo (
  id uuid primary key default gen_random_uuid(),
  page_id uuid unique references pages (id) on delete cascade,
  article_id uuid unique references articles (id) on delete cascade,
  meta_title text not null,
  meta_description text not null,
  canonical text,
  og_image text,
  noindex boolean not null default false,
  schema_type type_schema not null default 'WebPage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint seo_cible_unique check (num_nonnulls(page_id, article_id) = 1)
);

-- Les longueurs ne sont pas contraintes en base : une meta trop longue est un
-- avertissement éditorial, pas une erreur d'écriture. Le contrôle vit dans la
-- porte de vérification du dépôt.

-- --------------------------------------------------------------- cas clients
create table business_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  client text not null,
  secteur text,
  logo text, -- chemin dans Supabase Storage
  probleme text,
  intervention text,
  resultats text,
  chiffres_cles jsonb not null default '[]'::jsonb,
  statut statut_publication not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cas_publication_coherente check (
    (statut = 'published') = (published_at is not null)
  )
);

create index business_cases_statut_idx on business_cases (statut) where statut = 'published';

-- -------------------------------------------------------------- redirections
create table redirects (
  id uuid primary key default gen_random_uuid(),
  source text not null unique,
  destination text not null,
  code smallint not null default 301 check (code in (301, 302, 307, 308)),
  actif boolean not null default true,
  created_at timestamptz not null default now(),

  -- Une redirection vers elle-même est une boucle immédiate.
  constraint redirects_pas_de_boucle check (source <> destination),

  -- La destination est interne, et le middleware la prend telle quelle.
  -- POURQUOI cette contrainte : sans elle, une ligne portant
  -- « https://exemple.invalid/ » enverrait les visiteurs hors du site, avec
  -- l'autorité du domaine migen.fr. Un « // » ou un « \ » en tête suffit aussi,
  -- l'analyseur d'URL les lit comme un changement d'hôte. La règle est donc
  -- stricte : un seul slash en tête, et aucun antislash nulle part.
  constraint redirects_destination_interne check (
    destination like '/%'
    and destination not like '//%'
    and destination not like '%\\%'
  )
);

create index redirects_actif_idx on redirects (source) where actif;

-- ------------------------------------------------------- horodatage et chemin
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger pages_touch before update on pages
  for each row execute function touch_updated_at();
create trigger articles_touch before update on articles
  for each row execute function touch_updated_at();
create trigger seo_touch before update on seo
  for each row execute function touch_updated_at();
create trigger business_cases_touch before update on business_cases
  for each row execute function touch_updated_at();

/*
 * Calcule le path d'une page depuis celui de son parent.
 * Le parent porte déjà son propre path calculé : la récursion s'arrête donc
 * à la première remontée, inutile de parcourir tout l'arbre.
 */
create or replace function calcule_path_page() returns trigger
language plpgsql as $$
declare
  chemin_parent text;
begin
  if new.parent_id is null then
    new.path := '/' || new.slug || '/';
  else
    select path into chemin_parent from pages where id = new.parent_id;
    if chemin_parent is null then
      raise exception 'parent % introuvable pour la page %', new.parent_id, new.slug;
    end if;
    new.path := chemin_parent || new.slug || '/';
  end if;
  return new;
end;
$$;

create trigger pages_calcule_path before insert or update of slug, parent_id on pages
  for each row execute function calcule_path_page();

/*
 * Propage un changement de chemin aux descendants.
 * Déclenché APRÈS coup, seulement si le path a réellement changé : le simple
 * fait de réécrire la ligne ne relance pas la propagation.
 */
create or replace function propage_path_descendants() returns trigger
language plpgsql as $$
begin
  if new.path is distinct from old.path then
    update pages
       set path = new.path || slug || '/'
     where parent_id = new.id;
  end if;
  return null;
end;
$$;

create trigger pages_propage_path after update of path on pages
  for each row execute function propage_path_descendants();

/*
 * Le niveau se déduit du parent : il ne se saisit pas.
 * Garde-fou contre une page de niveau 3 accrochée à une page de niveau 1.
 */
create or replace function verifie_niveau() returns trigger
language plpgsql as $$
declare
  niveau_parent smallint;
begin
  if new.parent_id is not null then
    select niveau into niveau_parent from pages where id = new.parent_id;
    if new.niveau <> niveau_parent + 1 then
      raise exception 'niveau % incohérent : le parent est au niveau %', new.niveau, niveau_parent;
    end if;
  end if;
  return new;
end;
$$;

create trigger pages_verifie_niveau before insert or update of niveau, parent_id on pages
  for each row execute function verifie_niveau();
