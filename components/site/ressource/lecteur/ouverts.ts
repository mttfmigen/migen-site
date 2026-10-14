/**
 * Les adresses de fiches métier ouvertes depuis une carte du hub. La route
 * interceptée `@lecteur/(..)carriere/` attrape TOUTE navigation douce de
 * /ressources/ vers /carriere/..., y compris un lien du menu ou du pied de
 * page : ceux-là doivent ouvrir la page, pas le lecteur. Le hub inscrit
 * l'adresse avant de naviguer, `FeuilleLecteur` la lit. Module neutre : le
 * hub n'a pas à charger le code du lecteur pour la remplir.
 */
export const OUVERTS_PAR_LE_HUB = new Set<string>();

/**
 * La dernière carte cliquée : son entrée d'historique est juste au-dessus du
 * hub, Fermer y revient par Précédent. Ouvert autrement (« À lire ensuite »),
 * Fermer pousse /ressources/ : la maquette ferme, elle ne recule pas d'un
 * article.
 */
export const DERNIERE_CARTE = { url: "" };
