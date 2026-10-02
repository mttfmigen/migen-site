import type { MetadataRoute } from "next";

import { urlAbsolue } from "@/lib/seo/url";

/**
 * robots.txt.
 *
 * INDEXATION FERMÉE PAR DÉFAUT, et c'est le point important de ce fichier.
 *
 * Ce site remplacera migen.fr, mais le domaine n'y est pas encore branché : il
 * est déployé sur une adresse `vercel.app` pendant toute la construction. Or il
 * porte les mêmes 223 pages, les mêmes titres et les mêmes textes que le site
 * en ligne. Laissé ouvert, il devient un double indexable qui concurrence
 * migen.fr sur ses propres mots clés, et le temps que Google défasse ce qu'il a
 * compris se compte en semaines. La balise canonique ne suffit pas : elle
 * demande, elle n'interdit pas.
 *
 * L'ouverture est donc un ACTE EXPLICITE : poser `SITE_INDEXABLE=oui` dans
 * l'environnement du déploiement, le jour où migen.fr pointe dessus. Un oubli
 * coûte du trafic qu'on ne voit pas tout de suite ; une fermeture de trop se
 * voit dans l'heure, dans la Search Console.
 *
 * `/admin` et `/api` restent fermés par préfixe, la règle couvrant leurs
 * sous-chemins. L'exclusion de l'index d'une page publique, elle, passe par la
 * colonne `noindex` de la table `seo` et pas par ce fichier : une page
 * seulement interdite ici resterait indexable par un lien entrant, puisque le
 * robot ne pourrait pas lire sa balise `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== "oui") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: urlAbsolue("/sitemap.xml"),
  };
}
