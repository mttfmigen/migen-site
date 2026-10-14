# Plan du site XML (sitemap), au format de l'ancien migen.fr

Demande de Mehdi, 14/10 : « le sitemap Vercel n'est pas le même que celui de migen en termes de format, je veux le même ». L'ancien site (WordPress, Yoast SEO) a été relevé le 14/10 et figé dans `docs/sitemap-ancien/`.

## Les adresses

| Adresse | Réponse |
|---|---|
| `/sitemap_index.xml` | l'index, déclaré par `robots.txt` (`Sitemap: https://migen.fr/sitemap_index.xml`) quand `SITE_INDEXABLE=oui` |
| `/post-sitemap.xml` | les billets : `/ressources/articles/<article>/` (dont les 12 billets repris) et `/preuves/<cas>/` |
| `/page-sitemap.xml` | toutes les autres pages |
| `/sitemap.xsl` | la feuille de style qui rend ces fichiers lisibles dans un navigateur (tableau en français) |
| `/sitemap.xml`, `/category-sitemap.xml`, `/fusion_tb_category-sitemap.xml`, `/element_category-sitemap.xml`, `/wp-sitemap.xml`, tout autre `*-sitemap.xml` | 301 vers `/sitemap_index.xml`, comme l'ancien site |

`proxy.ts` traite ces adresses en premier (`lib/sitemap/adresses.ts`) : ni la table `redirects` ni le filet WordPress n'y touchent.

## Le format

Identique à Yoast : déclaration XML et instruction `xml-stylesheet` sur la première ligne, `<sitemapindex>` puis une entrée par sous-plan avec sa `<lastmod>` (celle de sa page la plus récente), sous-plans `<urlset>` avec les espaces de noms `xsi` et `image` et le même `schemaLocation`, une `<image:image>` par image, indentation par tabulations, `<lastmod>` au format `AAAA-MM-JJTHH:MM:SS+00:00`. Écriture : `lib/sitemap/xml.ts`. Liste des pages : `lib/pages-publiees.ts`, la même que `/plan-du-site/`.

## Les dates : vraies ou absentes

- pages et articles de la base : `updated_at` ;
- routes statiques : dernier commit de leur route et de leurs composants ;
- pages du relais disque : dernier commit de leur fichier JSON (une page de la base que le relais remplace prend la plus récente des deux dates) ;
- les 12 billets repris : leur date d'origine, la `<lastmod>` de leur ancienne adresse dans le plan de Yoast.

Jamais l'heure du build pour tout le monde (c'était le cas avant le 14/10).

## Les images

Celles que chaque page affiche dans son `<main>`, en adresse absolue `https://migen.fr/…`. Les images que le bundler sert sous `/_next/static/` n'y sont pas : leur nom change d'un build à l'autre.

## Tenir à jour

Dates des routes statiques et du relais, et images, sont relevées par un script et versionnées dans `lib/sitemap/dates.json` et `lib/sitemap/images.json` (Vercel construit sans historique git). Après un changement de page ou de photo :

```bash
bun run build && bunx next start -p 5606
node scripts/releve-sitemap.mjs http://localhost:5606            # réécrit les deux fichiers
node scripts/releve-sitemap.mjs http://localhost:5606 --verifie  # porte : RELEVE_A_JOUR
```

Un relevé en retard ne ment pas : une date reste celle d'un vrai commit, une page nouvelle sort sans image.

## Portes

- `node scripts/verifie-sitemap.mjs http://localhost:5606` : format, dates, images en 200, 301 des anciennes adresses, feuille XSL, `robots.txt`. Dernière ligne `SITEMAP_CONFORME`. `--controle` prouve qu'elle sait échouer.
- `node scripts/verifie-plan-et-sitemap.mjs`, `node scripts/verifie-redirections.mjs` et les autres lisent le plan par `scripts/plan-xml.mjs` (l'index, puis ses sous-plans).
- `bun lib/verification-filet.ts` : aucune adresse de plan n'est au filet.
