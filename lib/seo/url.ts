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
 * L'ORIGINE QUI SERT RÉELLEMENT LES FICHIERS, et ce n'est pas toujours celle
 * des canoniques.
 *
 * LE DÉFAUT QUE CETTE FONCTION RÉPARE, mesuré en production le 12/10 : les 259
 * balises `og:image` du site pointaient sur `https://migen.fr/assets/…`, et
 * migen.fr répondait **404 sur chacune**. L'ancien site Astro y est encore en
 * ligne, et il ne porte pas ces fichiers. Tout partage de lien sortait donc
 * sans image, exactement ce que la pose de la balise devait corriger.
 *
 * ET LA MESURE QUI AVAIT CONCLU « 191 répondent 200 » AVAIT SUBSTITUÉ L'HÔTE :
 * elle prouvait que les fichiers existent sur le déploiement, pas que l'adresse
 * ÉMISE se télécharge. C'est précisément le genre de mesure que ce dépôt
 * cherche à éliminer, et `scripts/verifie-vignette-partage.mjs` interdit
 * désormais de la refaire.
 *
 * POURQUOI NE PAS SIMPLEMENT CHANGER `NEXT_PUBLIC_SITE_URL`. Parce que le
 * canonique DOIT désigner le domaine final, migen.fr : la préprod répond
 * `Disallow: /` dans son robots.txt, elle n'est pas destinée à être indexée, et
 * faire pointer les canoniques vers elle serait une faute durable. Les deux
 * notions sont distinctes : l'adresse QU'ON DÉCLARE et l'adresse QUI SERT.
 *
 * L'ORDRE, et il se corrige de lui-même le jour de la bascule :
 *   1. `NEXT_PUBLIC_ORIGINE_FICHIERS`, si quelqu'un veut forcer.
 *   2. Le domaine de production du déploiement. Vercel le donne, et il devient
 *      migen.fr DE LUI-MÊME le jour où le domaine est rattaché au projet :
 *      aucune intervention à prévoir.
 *   3. À défaut, l'origine déclarée. En local, sans Vercel, c'est le bon choix.
 */
export function origineDesFichiers(): string {
  const sansSlash = (v: string) => v.replace(/\/+$/, "");
  const force = process.env.NEXT_PUBLIC_ORIGINE_FICHIERS;
  if (force) return sansSlash(force);
  const deploiement =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (deploiement) {
    const hote = sansSlash(deploiement.replace(/^https?:\/\//i, ""));
    return `https://${hote}`;
  }
  return siteUrl();
}

/**
 * L'URL d'une image de partage, sur l'hôte qui la sert.
 *
 * La colonne `og_image` porte soit un chemin dans Supabase Storage, soit une URL
 * déjà absolue. On ne préfixe que le premier cas.
 */
export function urlImage(valeur: string): string {
  if (/^https?:\/\//i.test(valeur)) return valeur;
  const chemin = valeur.startsWith("/") ? valeur : `/${valeur}`;
  return `${origineDesFichiers()}${chemin}`;
}
