# Plan de redirection : de l'ancien migen.fr au nouveau site

Établi le 14/10/2026. Pour Mehdi, avant la mise en ligne.

## En bref

- L'ancien site (WordPress) a **181 adresses connues**.
- **4** gardent la même adresse sur le nouveau site.
- **142** sont renvoyées, en **une seule étape** (redirection 301), vers la page du nouveau site qui traite le même sujet.
- **35** sont des adresses techniques de WordPress, sans contenu ni lien : elles disparaissent volontairement (réponse 404).
- **Tout le trafic mesuré arrive sur une vraie page** : 1 892 visites par mois selon Semrush, dont 1 111 sur l'accueil (conservé) et 780 sur des adresses redirigées.
- Vérifié par une commande, sur le serveur local et sur la préproduction : dernière ligne `REDIRECTIONS_SANS_PERTE`.
- ~~Un bloquant avant la bascule : la page `/cgv/`~~ **levé le 14/10** : la page est publiée, texte mot pour mot (section 5). Restent six choix à valider.

Le détail, adresse par adresse : `docs/redirections/plan-redirections.csv` (une ligne par adresse : source, destination, code, raison, confiance, trafic, domaines référents).

## 1. D'où vient la liste

Une adresse compte dès qu'une de ces quatre sources la cite :

| source | adresses |
|---|---|
| Semrush (pages qui ont du trafic, des mots-clés ou des liens d'autres sites) | 175 |
| Yoast (plan du site publié par WordPress) | 160 |
| Archives du web (Wayback Machine) | 150 |
| Le dépôt (listes déjà écrites : table de redirections, inventaires précédents) | 146 |

Une adresse peut venir de plusieurs sources : 139 sont vues par les quatre, 18 par une seule. Une fois les doublons retirés : **181 adresses**, dont 3 liens courts WordPress (`?page_id=`).

Hors liste, réglés par le domaine et non adresse par adresse : `www.migen.fr` et `http://` (renvoyés vers `https://migen.fr`, voir la liste de mise en ligne) et `intervention.migen.fr`, un autre WordPress qu'il ne faut pas casser.

## 2. Le bilan

| sort | adresses | trafic par mois |
|---|---|---|
| Conservées au même chemin | 4 | 1 112 |
| Redirigées en une 301 | 142 | 780 |
| dont déjà en place avant aujourd'hui | 21 | |
| dont ajoutées aujourd'hui | 121 | |
| Laissées en 404 (techniques) | 35 | 0 |
| **Total** | **181** | **1 892** |

Les 4 conservées : l'accueil `/`, `/contact/`, `/mentions-legales/`, `/partenaires/`.

## 3. Les redirections, par famille

| vers | adresses | exemple |
|---|---|---|
| Études de cas (`/preuves/`) | 33 | `/amazon-choisit-migen-intervention-...` vers `/preuves/amazon-centre-logistique/` |
| Ressources : articles, fiches, guides | 23 | `/tout-savoir-sur-les-automates-...-siemens/` vers `/ressources/fiches-techniques/automates-siemens/` |
| Implantations (villes, départements) | 20 | `/maintenance-industrielle-lyon/` vers `/implantations/lyon/` |
| Expertises techniques | 17 | `/maintenance-industrielle-mecanique/` vers `/expertises/mecanique/` |
| Carrière et métiers | 17 | `/recrutement-electromecanicien/` vers `/carriere/electromecanicien/` |
| Secteurs clients | 11 | `/technicien-de-maintenance-automobile/` vers `/secteurs/automobile/` |
| Offres | 8 | `/retrofit-machine-industriel/` vers `/offres/retrofit/` |
| Pages entreprise (qui sommes-nous, contact, RSE, légal, accueil) | 13 | `/maintenance-industrielle/` vers `/entreprise-maintenance-industrielle/` |

### Les 20 plus importantes

Classées par visites mensuelles (Semrush). Quatre y entrent pour leurs liens : au moins deux autres sites pointent vers elles.

| ancienne adresse | nouvelle adresse | visites / mois | sites qui font un lien |
|---|---|---|---|
| `/retrofit-machine-industriel/` | `/offres/retrofit/` | 467 | 0 |
| `/maintenance-industrielle-lyon/` | `/implantations/lyon/` | 46 | 0 |
| `/maintenance-industrielle-mecanique/` | `/expertises/mecanique/` | 39 | 0 |
| `/maintenance-industrielle-pneumatique/` | `/expertises/pneumatique/` | 30 | 0 |
| `/maintenance-industrielle-essonne/` | `/implantations/paris/essonne/` | 25 | 0 |
| `/tout-savoir-sur-les-automates-programmables-industriels-siemens/` | `/ressources/fiches-techniques/automates-siemens/` | 22 | 0 |
| `/technicien-de-maintenance-centre-logistique/` | `/secteurs/logistique/` | 17 | 1 |
| `/comment-devenir-technicien-de-maintenance-industrielle/` | `/carriere/technicien-de-maintenance/formation/` | 17 | 0 |
| `/maintenance-industrielle-hydraulique/` | `/expertises/hydraulique/` | 17 | 0 |
| `/recrutement-techniciens-de-maintenance-industrielle/` | `/carriere/` | 17 | 0 |
| `/entreprise-de-maintenance-industrielle/` | `/entreprise-maintenance-industrielle/` | 14 | 0 |
| `/maintenance-industrielle-paris/` | `/implantations/paris/` | 14 | 0 |
| `/nous-rejoindre/` | `/carriere/` | 10 | 1 |
| `/reussir-son-plan-de-maintenance-industrielle-astuces-et-solutions/` | `/ressources/articles/plan-de-maintenance/` | 7 | 1 |
| `/maintenance-industrielle-rouen/` | `/implantations/paris/rouen/` | 6 | 0 |
| `/gestion-dechets-operations-maintenance/` | `/ressources/articles/gestion-des-dechets/` | 5 | 1 |
| `/nos-techniciens/` | `/carriere/` (à valider) | 1 | 2 |
| `/nos-offres/` | `/offres/` | 0 | 5 |
| `/le-futur-de-la-maintenance-industrielle-une-perspective-a-10-ans/` | `/ressources/articles/maintenance-4-0/` | 0 | 2 |
| `/maintenance-robotique/` | `/expertises/robotique/` | 0 | 2 |

## 4. Les 35 adresses laissées en 404, et pourquoi

Ce sont des pages que WordPress fabrique tout seul. Aucune n'a de visite ni de lien d'un autre site. Les renvoyer vers une page de contenu serait du bruit pour Google, qui traite une telle redirection comme une page introuvable déguisée. Une 404 franche lui dit simplement de les oublier.

| type | adresses | exemple |
|---|---|---|
| Pages suivantes d'une liste (pagination) | 9 | `/category/articles/page/2/` |
| Pages d'auteur | 8 | `/author/antoinedigirolamo/` |
| Morceaux du thème Avada | 9 | `/element_category/columns/`, `/faq-items/` |
| Liens courts WordPress | 3 | `/?page_id=8` |
| Flux RSS | 2 | `/feed/` |
| Restes de boutique WooCommerce | 2 | `/shop/` |
| Catégorie « Non classé » | 1 | `/category/uncategorized/` |
| Interface de publication à distance | 1 | `/xmlrpc.php` |

**Les liens courts `?page_id=`.** `/?page_id=8` et `/?page_id=89` affichent l'accueil (le nouveau site ignore le paramètre, et l'accueil déclare sa propre adresse comme adresse officielle) ; `/lost-password/?page_id=11` répond 404. Aucun n'a de lien entrant : pas de règle dédiée. L'ancien site n'a aucune forme `?p=NNN` connue.

## 5. À valider par Mehdi

### Bloquant : `/cgv/`, LEVÉ LE 14/10

Fait : `app/cgv/page.tsx` sert les CGV en 200 (texte de `app/cgv/texte.ts`, copie mot pour mot de l'ancienne page, seuls les 50 tirets demi-cadratins remplacés), la page est au plan du site et au pied de page, et la ligne `/cgv/` est retirée de `lib/redirections-ancien-site.ts`. Aucune ligne `/cgv/` dans la table `redirects` de la base (vérifié le 14/10). Historique ci-dessous.

L'ancienne page contient les **vraies conditions générales de vente** de Migen Service (version du 24/02/2026), et **les devis renvoient à `https://migen.fr/cgv`**. Le nouveau site n'a pas de page CGV.

Aujourd'hui, `/cgv/` est renvoyée provisoirement vers `/mentions-legales/`, qui **ne contient pas** les CGV. C'est un repli pour ne pas afficher une erreur, pas une solution.

À faire avant la bascule : publier une page `/cgv/` sur le nouveau site avec le texte des CGV, **et dans le même temps retirer la ligne `/cgv/`** de `lib/redirections-ancien-site.ts`. Sinon la redirection masque la page. La commande de vérification le signale : elle exige que toute page du plan du site réponde elle-même.

### Six choix

| ancienne adresse | aujourd'hui vers | autre option | ce qui décide |
|---|---|---|---|
| `/a-propos/` | `/nous-connaitre/` | `/entreprise-maintenance-industrielle/` | WordPress l'envoyait vers `/maintenance-industrielle/`, qui part vers `/entreprise-maintenance-industrielle/`. Les deux anciennes pages parlent de l'entreprise. Aucune visite, aucun lien : enjeu nul. |
| `/transfert-demenagement-industriel/` | `/offres/chantier/` | `/travaux-industriels/transfert-industriel/` | Les deux pages visent « transfert industriel ». La redirection doit suivre celle qui portera ce mot-clé. La seconde colle mieux à l'ancien titre. |
| `/nos-techniciens/` | `/carriere/` | `/nous-connaitre/` | Page mixte : titre pour les clients, mais son seul mot-clé est « offre emploi migen ». 2 sites font un lien vers elle. |
| `/migen-et-dimomaint-en-alliance-strategique/` | `/partenaires/` | `/preuves/dimomaint/` | La page Dimomaint existe désormais. Ligne déjà en base : la changer en base ET dans le code. |
| `/migen-savoye-et-dimomaint-une-cooperation-strategique-au-service-de-la-performance-industrielle/` | `/partenaires/` | `/preuves/dimomaint/` ou `/preuves/savoye/` | Même question. |
| `/bureau-etudes-ingenierie/` | `/offres/bureau-etudes/` | `/bureau-etudes/` | Les deux pages du nouveau site ont le même titre principal et se déclarent chacune officielle. À régler sur le nouveau site d'abord. |

### Correspondances « faute de mieux »

Elles sont justes, mais la page d'arrivée ne reprend pas tout l'ancien contenu. Aucune n'a plus d'une visite par mois.

| ancienne adresse | vers | pourquoi |
|---|---|---|
| `/guide-maintenance-industrielle/` et `/tout-savoir-sur-la-maintenance-industrielle/` | `/ressources/` | Même mot-clé, mais le guide lui-même n'est repris nulle part. |
| `/certifications-mase-ecovadis/` | `/rse/` | Pas de page certifications ; la RSE cite MASE et EcoVadis. |
| `/certification-cefri/` | `/secteurs/nucleaire/` | CEFRI relève du nucléaire, la page ne le cite pas. |
| `/comment-faire-plan-de-maintenance-preventive/` | `/ressources/articles/plan-de-maintenance/` | Même démarche, en étapes. |
| `/le-futur-de-la-maintenance-industrielle-une-perspective-a-10-ans/` | `/ressources/articles/maintenance-4-0/` | IoT, IA, prédictif. |
| `/les-qualites-essentielles-dun-mainteneur-industriel-migen/` | `/carriere/technicien-de-maintenance/` | Compétences du métier. |
| `/maintenance-predictive-preventive/` | `/expertises/types-de-maintenance/maintenance-predictive/` | Le texte est d'abord prédictif. |
| `/migen-la-ou-le-bien-etre-au-travail-nest-pas-juste-un-slogan/` | `/carriere/` | Pas de page bien-être. |
| `/migen-une-vision-innovante-...-par-nathan-jorez-ceo/` | `/nous-connaitre/` | Le mot du dirigeant y est. |
| `/recrutement-agent-entretien-industriel/` | `/carriere/agent-de-maintenance/` | Métier le plus proche. |
| `/remerciement/` | `/contact/` | Page « merci » après une demande. |
| `/vous-connaissez-lexpression-le-temps-cest-de-largent/` | `/ressources/fiches-techniques/trs/` | Machines goulots, donc TRS. |
| `/femmes-dans-lindustrie-...` | `/carriere/` | Aucune page sur la mixité. |
| `/vers-une-france-reindustrialisee-...` | `/ressources/articles/` | Aucun article sur la réindustrialisation. |

## 6. Comment c'est posé

- Les 141 redirections de l'ancien site sont **écrites dans le code**, versionnées : `lib/redirections-ancien-site.ts`. La table Supabase `redirects` n'est pas modifiable depuis ce dépôt (clé de service absente).
- Le nouveau site lit d'abord la table de la base, puis ces lignes. **La base garde la main** : une ligne en base pour la même adresse l'emporte. Les 20 lignes déjà en base sont recopiées dans le code, pour tenir même si la base ne répond pas.
- Deux lignes de base menaient à une adresse elle-même redirigée (`/offres/maintenance-externalisee/`) : leur copie dans le code vise directement la page finale, `/offres/full-service/`.
- **Garde-fou** : si une ligne du code vise une adresse elle-même redirigée, ou si une adresse figure deux fois, la construction du site échoue. Une erreur ne peut pas partir en ligne.
- **La vérification**, à relancer à chaque changement :

```bash
node scripts/verifie-redirections.mjs                     # préproduction
node scripts/verifie-redirections.mjs https://migen.fr    # après la bascule
node scripts/verifie-redirections.mjs --controle          # prouve qu'elle sait échouer
```

Elle teste chaque ancienne adresse (et ses variantes, sans slash final par exemple) puis chaque adresse du plan du site. Elle n'écrit `REDIRECTIONS_SANS_PERTE` que si tout passe. `--controle` fabrique une chaîne, une boucle, une 404, une cible en 404, une adresse technique redirigée et une page masquée, et vérifie qu'elle les voit toutes.

- **Changer une destination** : modifier la ligne dans `lib/redirections-ancien-site.ts` (et en base si elle y est), puis relancer la vérification.

## 7. Liste de mise en ligne

### Avant la bascule

1. ~~Publier la page `/cgv/` et retirer sa ligne de `lib/redirections-ancien-site.ts`~~ (fait le 14/10, section 5). Trancher les six choix.
2. Déployer la version validée sur Vercel, puis : `node scripts/verifie-redirections.mjs` doit finir par `REDIRECTIONS_SANS_PERTE`.
3. **Noter les enregistrements DNS actuels** de `migen.fr` et `www.migen.fr` (copie d'écran de la zone). C'est le retour arrière.
4. Baisser leur durée de cache (TTL) à 5 minutes, 24 à 48 heures avant : un retour arrière prendra alors effet en minutes.
5. **Garder l'ancien WordPress** : ne rien résilier chez l'hébergeur. Idéalement, le rendre accessible ailleurs (par exemple `ancien.migen.fr`, protégé par mot de passe et fermé aux moteurs) pour pouvoir le consulter et revenir en arrière **pendant 4 à 6 semaines**. Faire une sauvegarde complète (fichiers et base) avant la bascule.

### La bascule

6. **Vercel**, projet `migen-site`, Settings, Domains : ajouter `migen.fr` et `www.migen.fr`. L'adresse officielle du site est le **domaine nu** : le plan du site publie `https://migen.fr/...` (variable `NEXT_PUBLIC_SITE_URL`, lue par `lib/seo/url.ts`). Donc `www.migen.fr` doit être réglé en **redirection permanente vers `migen.fr`**, et `migen.fr` sert le site.
7. **Zone DNS** : faire pointer `migen.fr` (enregistrement A) et `www` (CNAME) vers les valeurs **affichées par Vercel** à l'étape 6. Supprimer un éventuel enregistrement AAAA de `migen.fr` qui viserait encore l'ancien hébergeur.
   **Ne pas toucher** : les MX (la messagerie `@migen.fr`), les TXT (SPF, DKIM, DMARC, vérifications Google), `intervention.migen.fr` et les autres sous-domaines.
8. **HTTPS** : Vercel crée le certificat seul après la propagation, et force `https`. Vérifier :

```bash
curl -sI http://migen.fr/ | grep -i -E "^(HTTP|location)"
curl -sI https://www.migen.fr/maintenance-industrielle-lyon/ | grep -i -E "^(HTTP|location)"
curl -sI https://migen.fr/maintenance-industrielle-lyon/ | grep -i -E "^(HTTP|location)"
```

   Attendu : `http` et `www` arrivent sur `https://migen.fr/...`, sans boucle ; la dernière répond `301` vers `/implantations/lyon/`.

### Juste après la bascule

9. Relancer la vérification **contre le vrai domaine** : `node scripts/verifie-redirections.mjs https://migen.fr`. Dernière ligne attendue : `REDIRECTIONS_SANS_PERTE`.
10. **Search Console** : soumettre `https://migen.fr/sitemap.xml` ; retirer l'ancien plan de Yoast (`sitemap_index.xml`), qui répond désormais 404. Inspecter quelques adresses clés (l'accueil, `/offres/retrofit/`, `/implantations/lyon/`) et demander leur indexation.
11. Mettre à jour les liens que Migen contrôle, pour qu'ils visent la nouvelle adresse directement : signatures de mail, LinkedIn, fiche Google, annuaires, modèles de devis (lien CGV).

### La première semaine

12. **Chaque jour, les 404 dans les journaux Vercel** (projet `migen-site`, Logs, filtre sur le code 404). Une ancienne adresse de contenu qui tombe en 404 : ajouter sa ligne dans `lib/redirections-ancien-site.ts`, déployer, relancer la vérification. Ignorer les robots qui cherchent `wp-login.php`, `wp-admin/` ou `xmlrpc.php`.
13. Search Console, rubrique Pages : suivre « Introuvable (404) » et « Page avec redirection » pendant 2 à 4 semaines. Les anciennes adresses doivent y passer en « Page avec redirection », c'est normal.

### Retour arrière, si besoin

14. Remettre les enregistrements DNS notés à l'étape 3. Avec le TTL baissé, l'ancien site revient en quelques minutes. Résilier l'ancien WordPress seulement après 4 à 6 semaines sans incident.

## 7. Corrections du 14/10 après le suivi de positions Semrush

Le suivi de positions de Mehdi (`Position Tracking Rankings Overview Oct 14.csv`) a montré quatre anciennes pages qui se classent sur des requêtes que leur cible prévue ne traitait pas. Corrigé dans `lib/redirections-ancien-site.ts` (commit d76960f), porte `REDIRECTIONS_SANS_PERTE` relancée :

| ancienne adresse | prévue | désormais | ce qui est en jeu |
|---|---|---|---|
| `/maintenance-industrielle-gironde/` | `/implantations/toulouse/gironde/` | `/entreprise-maintenance-industrielle/` | « entreprise maintenance industrielle » (9e, 1 600 par mois) ; ses 14 mots clés sont génériques, aucun sur la Gironde |
| `/maintenance-industrielle-essonne/` | `/implantations/paris/essonne/` | `/entreprise-maintenance-industrielle/` | « maintenance industrielle entreprises » (7e) ; tout son trafic vient d'une requête générique |
| `/transfert-demenagement-industriel/` | `/offres/chantier/` | `/offres/chantier/demenagement-machines/` | « déménagement de machines industrielles » (20e), « déménagement industriel » (720 par mois) : le choix « à valider » de la section 5 est tranché ainsi |
| `/comment-devenir-technicien-de-maintenance-industrielle/` | `/carriere/technicien-de-maintenance/formation/` | `/carriere/technicien-de-maintenance/` | « technicien de maintenance industrielle » (31e, 2 400 par mois) porte sur le métier |

Motifs vérifiés le même jour sur la préproduction : archives paginées (`/actualites/page/N/`, `/category/articles/page/N/`, `/page/N/`), archive d'auteur, `/feed/` et fichiers de `/wp-content/uploads/` répondent 404, comme prévu pour les adresses techniques ; `/nos-offres/` et `/entreprise-de-maintenance/`, deux chaînes de l'ancien WordPress, arrivent en un seul saut.

Reste ouvert : la page `/cgv/` (section 5), en cours de publication à l'identique.

## 8. Les 12 billets de l'ancien blog, republiés le 14/10

Décision de Mehdi, le 14/10 vers 15h10 : « Publie, on fera des modifs plus tard ». Les 12 billets que le nouveau site avait perdus (inventaire : `docs/ARTICLES-BLOG-REPRISE.md`) sont republiés mot pour mot sous `/ressources/articles/`, servis par le relais disque (`supabase/import/blog-repris/`). Chaque ancienne adresse les rejoint en une seule 301 (`lib/redirections-ancien-site.ts`, `docs/redirections/plan-redirections.csv`).

| ancienne adresse | avant | désormais |
|---|---|---|
| `/certifications-mase-ecovadis/` | `/rse/` | `/ressources/articles/certifications-mase-ecovadis/` |
| `/migen-et-dimomaint-en-alliance-strategique/` | `/partenaires/` | `/ressources/articles/partenariat-dimomaint/` (ligne en base, voir plus bas) |
| `/migen-savoye-et-dimomaint-une-cooperation-strategique-au-service-de-la-performance-industrielle/` | `/partenaires/` | `/ressources/articles/savoye-dimomaint/` (ligne en base, voir plus bas) |
| `/pourquoi-faire-appel-a-une-entreprise-de-maintenance-externalisee/` | `/offres/full-service/` | `/ressources/articles/pourquoi-externaliser/` (ligne en base, voir plus bas) |
| `/migen-une-vision-innovante-de-la-maintenance-industrielle-par-nathan-jorez-ceo/` | `/nous-connaitre/` | `/ressources/articles/interview-nathan-jorez/` |
| `/migen-la-ou-le-bien-etre-au-travail-nest-pas-juste-un-slogan/` | `/carriere/` | `/ressources/articles/bien-etre-au-travail/` |
| `/femmes-dans-lindustrie-migen-soutient-la-diversite-dans-le-secteur-de-la-maintenance-industrielle/` | `/carriere/` | `/ressources/articles/femmes-dans-l-industrie/` |
| `/vers-une-france-reindustrialisee-avantages-defis-et-strategies/` | `/ressources/articles/` | `/ressources/articles/reindustrialisation/` |
| `/les-qualites-essentielles-dun-mainteneur-industriel-migen/` | `/carriere/technicien-de-maintenance/` | `/ressources/articles/qualites-du-mainteneur/` |
| `/vous-connaissez-lexpression-le-temps-cest-de-largent/` | `/ressources/fiches-techniques/trs/` | `/ressources/articles/machines-goulots/` |
| `/guide-maintenance-industrielle/` | `/ressources/` | `/ressources/articles/guide-maintenance-industrielle/` |
| `/la-digitalisation-des-manuels-de-maintenance-industrielle/` | `/ressources/articles/digitalisation-maintenance/` | `/ressources/articles/digitalisation-des-manuels/` |

**Trois lignes de la table `redirects` l'emportent encore sur le code** (lues en base le 14/10, rien n'y a été écrit). Tant qu'elles ne changent pas, ces trois adresses gardent leur ancienne cible, toujours en un seul saut :

| source | en base aujourd'hui | valeur à poser |
|---|---|---|
| `/migen-et-dimomaint-en-alliance-strategique/` | `/partenaires/` | `/ressources/articles/partenariat-dimomaint/` |
| `/migen-savoye-et-dimomaint-une-cooperation-strategique-au-service-de-la-performance-industrielle/` | `/partenaires/` | `/ressources/articles/savoye-dimomaint/` |
| `/pourquoi-faire-appel-a-une-entreprise-de-maintenance-externalisee/` | `/offres/maintenance-externalisee/` (le proxy la mène à `/offres/full-service/`) | `/ressources/articles/pourquoi-externaliser/` |

Les neuf autres n'ont pas de ligne en base : le code s'applique dès le déploiement.
