import type { MetadataRoute } from "next";


import { cheminsArticles } from "@/lib/contenu";
import { ROUTES_STATIQUES } from "@/lib/routes-statiques";
import { urlAbsolue } from "@/lib/seo/url";
import { lectureContenu } from "@/lib/supabase";

/**
 * Plan du site.
 *
 * Lu au build puis rafraîchi par revalidation : aucune lecture depuis le
 * navigateur. La RLS ne remonte que les contenus publiés, la requête n'a donc
 * pas à filtrer sur le statut.
 *
 * `changeFrequency` et `priority` sont volontairement absents : Google les
 * ignore depuis des années, et une valeur inventée page par page n'apporte rien.
 *
 * LES ARTICLES Y SONT, depuis que `app/[...slug]/` sait les servir : elle
 * cherche d'abord une page, puis un article dont le pilier correspond au chemin
 * demandé. Un article sans pilier publié est omis par `cheminsArticles()`, son
 * URL n'étant pas déductible, et les `noindex` sont écartés ici comme pour les
 * pages.
 *
 * LES ROUTES STATIQUES Y SONT AUSSI, et il a fallu les ajouter à la main : la
 * page d'accueil et les onze écrans uniques (mentions légales, confidentialité,
 * contact, nous connaître, valeurs, RSE, équipe, partenaires, carrière,
 * marques, plan du site) ne vivent pas dans la table `pages`, parce qu'ils ne
 * partagent aucun gabarit. Un plan du site qui lit seulement la base les oublie
 * donc tous, y compris l'accueil, et c'est exactement ce qui se passait.
 */

export const revalidate = 3600;


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = lectureContenu();

  // Deux requêtes plates plutôt qu'une jointure : l'`id` des pages est
  // nécessaire pour écarter celles que `seo` marque `noindex`, ce que
  // `cheminsPublies()` ne remonte pas, et deux lectures indexées coûtent moins
  // qu'une jointure dont on ne garde qu'une colonne.
  const [pages, exclusions, articles] = await Promise.all([
    client.from("pages").select("id, path, updated_at").order("path"),
    client.from("seo").select("page_id").eq("noindex", true),
    cheminsArticles(),
  ]);

  const erreur = pages.error ?? exclusions.error;
  if (erreur) throw new Error(`Plan du site : ${erreur.message}`);

  const listePages = pages.data ?? [];
  const listeExclusions = exclusions.data ?? [];

  const exclus = new Set(
    listeExclusions
      .map((ligne) => ligne.page_id)
      .filter((id): id is string => id !== null),
  );

  // Date du jour pour les routes statiques : leur contenu vit dans le code, donc
  // sa dernière modification est celle du déploiement, pas d'une ligne en base.
  const deploiement = new Date();

  return [
    ...ROUTES_STATIQUES.map((chemin) => ({
      url: urlAbsolue(chemin),
      lastModified: deploiement,
    })),
    ...listePages
      .filter((page) => !exclus.has(page.id))
      .map((page) => ({
        url: urlAbsolue(page.path),
        lastModified: new Date(page.updated_at),
      })),
    ...articles
      .filter((article) => !article.noindex)
      .map((article) => ({
        url: urlAbsolue(article.path),
        lastModified: new Date(article.updated_at),
      })),
  ];
}
