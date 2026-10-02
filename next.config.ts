import type { NextConfig } from "next";

/**
 * En-têtes de sécurité, posés sur toutes les réponses.
 *
 * Pourquoi ici et non dans le middleware : le middleware ne s'exécute pas sur
 * les actifs statiques (son `matcher` les écarte, à raison), alors que ces
 * en-têtes doivent couvrir chaque réponse, y compris une image ou une feuille
 * de style servie depuis `public/`.
 *
 * Pas de Content-Security-Policy stricte à ce stade, et c'est un choix assumé :
 * le site charge des scripts tiers injectés par Google (gtag.js charge à son
 * tour les scripts de GA4 et de Google Ads), LinkedIn, HubSpot et la plateforme
 * OpenAI, dont les domaines et les comportements ne sont pas tous arrêtés. Une
 * CSP écrite avant que la liste des tags soit figée casserait la mesure en
 * silence, ou serait affaiblie à coups de `unsafe-inline` jusqu'à ne plus rien
 * protéger. Elle sera écrite à la recette, quand les tags seront arbitrés et
 * testables au Tag Assistant, avec un nonce pour les scripts du site.
 */
const ENTETES_SECURITE = [
  // Pas de chemin complet envoyé à un autre domaine : l'origine suffit aux
  // plateformes publicitaires, les paramètres d'URL internes ne les concernent pas.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Le navigateur s'en tient au Content-Type déclaré, il ne devine pas. Ferme
  // la porte au fichier déposé qui serait réinterprété en script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deux ans, sous-domaines inclus. `preload` n'est pas déclaré : l'inscription
  // à la liste des navigateurs est difficile à défaire et engage tous les
  // sous-domaines de migen.fr, y compris ceux des autres outils. À arbitrer
  // séparément.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // Aucune mise en cadre, ce qui coupe le détournement de clic. L'équivalent
  // moderne, `frame-ancestors`, vit dans une CSP : tant qu'il n'y en a pas,
  // c'est cet en-tête qui tient le rôle.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  /**
   * Le slash final est géré par le middleware, et par lui seul.
   *
   * Sans ce réglage, les deux se battent : le middleware redirige en 308 vers
   * la forme avec slash, et Next, dont `trailingSlash` vaut `false` par défaut,
   * redirige aussitôt vers la forme sans slash. Toute URL du site part alors en
   * boucle de redirection infinie.
   *
   * `skipTrailingSlashRedirect` plutôt que `trailingSlash: true` parce que le
   * middleware doit de toute façon rester maître de la décision : il consulte
   * la table `redirects` avant de normaliser, et une ancienne URL stockée sans
   * slash doit partir sur sa destination éditoriale, pas sur une normalisation
   * décidée par le framework en amont.
   */
  skipTrailingSlashRedirect: true,

  async headers() {
    // `/:chemin*` couvre la racine comme tous les sous-chemins.
    return [{ source: "/:chemin*", headers: ENTETES_SECURITE }];
  },
};

export default nextConfig;
