-- Redirections 301 depuis l'ancien site WordPress migen.fr.
-- Les URL techniques de WordPress (/feed/, /comments/feed/, /author/*, /wp-*)
-- ne sont PAS redirigées : une 301 d'un flux RSS vers une page de contenu est
-- du bruit pour le crawl. Elles doivent répondre 404, ce qui est le
-- comportement par défaut du nouveau site.
-- Les URL identiques (/mentions-legales/, /partenaires/, /realisations/,
-- /contact/) n'ont pas de ligne : rediriger une URL vers elle-même est une
-- boucle, et la contrainte redirects_pas_de_boucle la refuse.

insert into redirects (source, destination, code, actif)
select v.s, v.d, 301, true from (values
  ('/5s-maintenance-industrielle/','/ressources/fiches-pratiques/5s/'),
  ('/actualites/','/ressources/articles/'),
  ('/entreprise-de-maintenance-industrielle/','/entreprise-maintenance-industrielle/'),
  ('/expert-maintenance-industrielle-externalisee/','/offres/maintenance-externalisee/'),
  ('/gestion-dechets-operations-maintenance/','/ressources/articles/gestion-des-dechets/'),
  ('/jtekt-et-migen-maintenance-industrielle-sur-site/','/preuves/jtekt/'),
  ('/maintenance-curative-gls-migen-sur-site/','/preuves/gls-maintenance-curative/'),
  ('/maintenance-industrielle-electrique/','/expertises/electrique/'),
  ('/maintenance-industrielle-electromecanique/','/expertises/electromecanique/'),
  ('/maintenance-industrielle-pneumatique/','/expertises/pneumatique/'),
  ('/maintenance-industrielle/','/entreprise-maintenance-industrielle/'),
  ('/migen-et-danone-maintenance-continu-sur-site/','/preuves/danone-lignes-de-production/'),
  ('/migen-et-dimomaint-en-alliance-strategique/','/partenaires/'),
  ('/migen-et-suez-remise-en-etat-site-industriel/','/preuves/suez-remise-en-etat/'),
  ('/migen-savoye-et-dimomaint-une-cooperation-strategique-au-service-de-la-performance-industrielle/','/partenaires/'),
  ('/nos-offres/','/offres/'),
  ('/nous-rejoindre','/carriere/'),
  ('/nous-rejoindre/','/carriere/'),
  ('/politique-de-confidentialite/','/confidentialite/'),
  ('/pourquoi-faire-appel-a-une-entreprise-de-maintenance-externalisee/','/offres/maintenance-externalisee/'),
  ('/technicien-de-maintenance/','/carriere/technicien-de-maintenance/')
) as v(s, d)
on conflict (source) do update set destination = excluded.destination, code = 301, actif = true;
