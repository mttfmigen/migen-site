-- Seau PRIVÉ des CV de candidature (14/10, Mehdi : « j'ai pas le CV joint »).
-- Le serveur y dépose le CV le temps que TeamTailor le télécharge par un lien
-- signé, puis le supprime. Aucune politique d'accès : seul service_role, côté
-- serveur, y lit et y écrit. 4 Mo, PDF et Word seulement.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-candidatures',
  'cv-candidatures',
  false,
  4194304,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;
