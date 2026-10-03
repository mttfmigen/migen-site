/**
 * Les pages qui n'existent que comme routes, sans ligne dans la table `pages`.
 *
 * POURQUOI ELLES EXISTENT. Le site sert deux familles de pages. Environ deux
 * cents suivent un gabarit et leur contenu vit en base : les changer, c'est
 * changer une donnée. Douze autres sont UNIQUES, avec leur mise en page et
 * leurs sections propres, et vivent dans le code, comme la page d'accueil :
 * les mettre en base reviendrait à y ranger un composant.
 *
 * POURQUOI CETTE LISTE EST ÉCRITE À LA MAIN. Next ne donne pas, à l'exécution,
 * la liste de ses routes statiques. Le plan du site, lui, se construit depuis
 * la base : sans cette liste, il oublie ces douze pages, et personne ne le
 * remarque, parce qu'un plan du site incomplet s'affiche très bien.
 *
 * CE QUI L'EMPÊCHE DE SE DÉMODER : `app/verification-plan.tsx` la compare aux
 * dossiers réellement présents sous `app/`. Ajouter un écran sans l'inscrire
 * ici fait échouer la chaîne de vérification, et inscrire une page qui n'existe
 * pas la fait échouer aussi.
 *
 * Ce module ne dépend de rien, et c'est voulu : il est lu par le plan du site,
 * qui tourne sur le serveur, et par un contrôle, qui tourne hors de Next.
 */
export const ROUTES_STATIQUES = [
  "/",
  "/contact/",
  "/nous-connaitre/",
  "/equipe/",
  "/valeurs/",
  "/rse/",
  "/partenaires/",
  "/carriere/",
  "/marques/",
  "/plan-du-site/",
  "/mentions-legales/",
  "/confidentialite/",
] as const;
