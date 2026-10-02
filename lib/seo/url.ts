/**
 * Les URL du site, en un seul endroit.
 *
 * Le plan du site, le robots.txt, les données structurées et les métadonnées
 * ont tous besoin de l'origine absolue. La centraliser évite qu'un oubli de
 * slash final dans un coin produise un canonique différent du chemin servi.
 *
 * Pas de `server-only` ici : ce module ne lit rien en base et ne manipule aucun
 * secret. `NEXT_PUBLIC_SITE_URL` est publique par nature, c'est l'adresse du
 * site.
 */

/**
 * L'origine du site, sans slash final.
 *
 * Volontairement sans valeur de repli : une origine devinée produirait un plan
 * du site et des canoniques faux, silencieusement, ce qui est plus coûteux
 * qu'un build qui échoue.
 */
export function siteUrl(): string {
  const valeur = process.env.NEXT_PUBLIC_SITE_URL;
  if (!valeur) {
    throw new Error(
      "Variable d'environnement manquante : NEXT_PUBLIC_SITE_URL. " +
        "Elle sert à construire les URL absolues du plan du site et des canoniques.",
    );
  }
  return valeur.replace(/\/+$/, "");
}

/** Une URL absolue depuis un chemin interne, slash final conservé tel quel. */
export function urlAbsolue(chemin: string): string {
  return `${siteUrl()}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}

/**
 * Le chemin d'un article, sous le chemin de sa page pilier.
 *
 * L'URL de l'article suit le cocon plutôt qu'un préfixe plat : un article
 * rattaché au pilier « /offres/depannage/ » est servi à
 * « /offres/depannage/mon-article/ ». Sans pilier, le chemin n'est pas
 * déductible et l'appelant doit traiter ce cas (voir app/sitemap.ts).
 */
export function cheminArticle(slug: string, cheminPilier: string): string {
  return `${cheminPilier}${slug}/`;
}

/**
 * L'URL d'une image de partage.
 *
 * La colonne `og_image` porte soit un chemin dans Supabase Storage, soit une URL
 * déjà absolue. On ne préfixe que le premier cas.
 */
export function urlImage(valeur: string): string {
  return /^https?:\/\//i.test(valeur) ? valeur : urlAbsolue(valeur);
}
