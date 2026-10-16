/**
 * La frontière entre le site et ses landing pages publicitaires.
 *
 * Les LP vivent sous /lp/ : leur propre barre et leur propre pied, jamais
 * indexées, et seules à porter le numéro publicitaire (`TELEPHONE_LP`). Une
 * règle, écrite une fois : la mise en page qui cache l'en-tête du site, les
 * portes du numéro et `scripts/verifie-lp.mjs` lisent toutes celle-ci.
 */

/** Une adresse de landing page : /lp, /lp/..., et `%2F` (voir BarreCollanteParChemin). */
export const estLandingPage = (chemin: string): boolean => /^\/lp(?:\/|%2F|$)/i.test(chemin);

/** Le numéro des LP (04 11 78 95 97) ne se rend que sur une LP : ailleurs, c'est celui du site. */
export const numeroLpPermis = estLandingPage;
