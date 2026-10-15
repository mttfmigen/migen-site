/**
 * La ligne « *10 min de lecture* » que cinq fiches de la maquette portent en
 * premier paragraphe de chapô (`gestion-des-dechets`,
 * `organiser-service-maintenance`, `niveaux-de-maintenance` et les deux livres
 * blancs) : du markdown brut, astérisques comprises, et une durée qui contredit
 * celle des pastilles. La donnée n'est pas réécrite ; le hub saute la ligne
 * pour ses cartes et la page ne l'affiche pas (signalé en ligne le 15/10).
 */
export const CHAPO_PARASITE = /^\*\s*\d+\s*min de lecture\s*\*$/;

/** Le chapô tel qu'il s'affiche : sans paragraphe vide ni ligne parasite. */
export const chapoAffiche = (chapo: readonly string[]): string[] =>
  chapo.filter((p) => p && !CHAPO_PARASITE.test(p.trim()));
