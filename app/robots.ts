import type { MetadataRoute } from "next";

import { urlAbsolue } from "@/lib/seo/url";

/**
 * robots.txt.
 *
 * `/admin` et `/api` sont fermés par préfixe : la règle couvre aussi leurs
 * sous-chemins. L'exclusion de l'index d'une page publique, elle, passe par la
 * colonne `noindex` de la table `seo`, pas par ce fichier : une page interdite
 * ici resterait indexable par un lien entrant, puisque le robot ne pourrait pas
 * lire sa balise `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: urlAbsolue("/sitemap.xml"),
  };
}
