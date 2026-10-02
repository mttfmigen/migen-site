-- 0004 · Sécurité au niveau des lignes.
--
-- Trois cercles, et rien d'autre :
--   public (clé anonyme) · lit le contenu publié, et rien d'autre : aucune écriture
--   console (authentifié + membre) · lit les chiffres
--   serveur (service_role) · écrit tout, et n'est jamais exposé au navigateur
--
-- `service_role` contourne la RLS par construction : aucune policy n'est
-- nécessaire pour lui, et il ne doit jamais quitter le serveur.

alter table pages            enable row level security;
alter table articles         enable row level security;
alter table seo              enable row level security;
alter table business_cases   enable row level security;
alter table redirects        enable row level security;
alter table consent_logs     enable row level security;
alter table metrics_gsc_daily enable row level security;
alter table metrics_ga4_daily enable row level security;
alter table metrics_ads_daily enable row level security;
alter table leads            enable row level security;
alter table ingestion_runs   enable row level security;
alter table membres_console  enable row level security;

-- ------------------------------------------------------- contenu, en lecture
-- Le brouillon et la relecture ne sortent pas de la base.
create policy "pages publiées, lecture publique"
  on pages for select
  to anon, authenticated
  using (statut = 'published');

create policy "articles publiés, lecture publique"
  on articles for select
  to anon, authenticated
  using (statut = 'published');

create policy "cas clients publiés, lecture publique"
  on business_cases for select
  to anon, authenticated
  using (statut = 'published');

-- Le SEO d'un brouillon reste invisible : la visibilité suit celle de sa cible.
create policy "seo des contenus publiés, lecture publique"
  on seo for select
  to anon, authenticated
  using (
    (page_id is not null and exists (
      select 1 from pages p where p.id = seo.page_id and p.statut = 'published'
    ))
    or
    (article_id is not null and exists (
      select 1 from articles a where a.id = seo.article_id and a.statut = 'published'
    ))
  );

-- Les redirections actives sont lues par le middleware à chaque requête.
create policy "redirections actives, lecture publique"
  on redirects for select
  to anon, authenticated
  using (actif);

-- Aucune policy d'insertion, de mise à jour ou de suppression sur le contenu :
-- l'écriture passe exclusivement par le serveur, avec la clé service_role.

-- --------------------------------------------------------------- consentement
-- Aucune écriture ouverte au navigateur, pas même en insertion.
--
-- POURQUOI : la preuve est déposée par la route serveur `/api/consentement`,
-- qui valide chaque champ puis écrit avec `ecritureServeur()`, donc en
-- `service_role`, lequel contourne la RLS. Un chemin public en plus serait
-- inutile et ouvrirait la table des preuves à n'importe quel porteur de la clé
-- anonyme, qui est publique par construction : la table deviendrait polluable
-- à volonté, et une preuve noyée dans du bruit ne prouve plus rien.
--
-- Pas de policy SELECT publique non plus : même l'auteur de la ligne ne la
-- relit pas. Les exports passent par le serveur.

create policy "consentements lisibles par la console"
  on consent_logs for select
  to authenticated
  using (est_membre_console());

-- ------------------------------------------------------------------- console
-- Les chiffres ne sortent jamais vers la clé anonyme.
create policy "gsc lisible par la console"
  on metrics_gsc_daily for select to authenticated using (est_membre_console());

create policy "ga4 lisible par la console"
  on metrics_ga4_daily for select to authenticated using (est_membre_console());

create policy "régies lisibles par la console"
  on metrics_ads_daily for select to authenticated using (est_membre_console());

create policy "leads lisibles par la console"
  on leads for select to authenticated using (est_membre_console());

create policy "journal d'ingestion lisible par la console"
  on ingestion_runs for select to authenticated using (est_membre_console());

-- Chacun voit sa propre appartenance, et elle seule : la policy ne relit pas
-- la table via la fonction, ce qui éviterait une récursion.
create policy "chacun voit son appartenance"
  on membres_console for select
  to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------ privilèges de schéma
-- La RLS filtre les lignes ; les privilèges décident des tables atteignables.
-- Ceinture et bretelles : une policy oubliée ne suffit pas à ouvrir une table.
revoke all on all tables in schema public from anon, authenticated;

grant select on pages, articles, seo, business_cases, redirects to anon, authenticated;
-- Aucun `grant insert on consent_logs` : voir la section consentement ci-dessus,
-- l'écriture est réservée au serveur.
grant select on consent_logs, metrics_gsc_daily, metrics_ga4_daily, metrics_ads_daily,
                leads, ingestion_runs, membres_console to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
